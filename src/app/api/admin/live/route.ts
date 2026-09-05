// ═══════════════════════════════════════════════════════════════════
// Admin live moderation — list active streams, and kill any of them.
//
// The live_end_session RPC is host-only by design, so a moderator
// cannot use it on someone else's broadcast. This route holds the
// service key instead, which bypasses RLS, and is therefore the only
// path that can end a stream the caller does not own.
//
// Ending here also closes every open attendance row. Without that the
// viewers of a killed stream stay counted as present forever and their
// watch time never lands in viewer_minutes, which is the figure we
// reconcile against the Agora bill.
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function verifyAdmin(req: NextRequest): Promise<string | null> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return req.cookies.get(name)?.value; },
        set() {},
        remove() {},
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = getAdminClient();
  const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', user.id).single();
  return profile?.is_admin ? user.id : null;
}

// GET /api/admin/live — every stream currently broadcasting
export async function GET(req: NextRequest) {
  try {
    const adminId = await verifyAdmin(req);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const admin = getAdminClient();
    const { data, error } = await admin
      .from('live_sessions')
      .select('id, host_id, title, status, visibility, started_at, peak_viewers, total_viewers, viewer_minutes, moderation_status, profiles:profiles!live_sessions_host_id_fkey(display_name, username)')
      .eq('status', 'live')
      .order('started_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return NextResponse.json({ sessions: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to load live streams' }, { status: 500 });
  }
}

// POST /api/admin/live — end a stream, optionally removing it outright
export async function POST(req: NextRequest) {
  try {
    const adminId = await verifyAdmin(req);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const sessionId: string | undefined = body.session_id;
    // 'end' stops the broadcast; 'remove' also hides it from every
    // listing and blocks re-entry, for content that should not stand.
    const action: 'end' | 'remove' = body.action === 'remove' ? 'remove' : 'end';
    const reason: string = String(body.reason || 'moderator_killed').slice(0, 200);

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    const admin = getAdminClient();

    const { data: session, error: loadErr } = await admin
      .from('live_sessions')
      .select('id, started_at, status')
      .eq('id', sessionId)
      .maybeSingle();
    if (loadErr) throw loadErr;
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const now = new Date().toISOString();

    // Close open attendance rows first, so the viewer_minutes rollup
    // below sees complete watch times.
    const { data: openRows } = await admin
      .from('live_viewers')
      .select('id, joined_at')
      .eq('session_id', sessionId)
      .is('left_at', null);

    for (const row of openRows || []) {
      const seconds = Math.max(
        0,
        Math.floor((Date.now() - new Date(row.joined_at).getTime()) / 1000),
      );
      await admin
        .from('live_viewers')
        .update({ left_at: now, watch_seconds: seconds })
        .eq('id', row.id);
    }

    const { data: allRows } = await admin
      .from('live_viewers')
      .select('watch_seconds')
      .eq('session_id', sessionId);

    const viewerMinutes = Math.floor(
      (allRows || []).reduce((sum, r: any) => sum + (r.watch_seconds || 0), 0) / 60,
    );

    const durationSeconds = session.started_at
      ? Math.max(0, Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000))
      : 0;

    const { error: updateErr } = await admin
      .from('live_sessions')
      .update({
        status: 'ended',
        ended_at: now,
        ended_reason: reason,
        duration_seconds: durationSeconds,
        viewer_minutes: viewerMinutes,
        moderation_status: action === 'remove' ? 'removed' : 'flagged',
        updated_at: now,
      })
      .eq('id', sessionId);

    if (updateErr) throw updateErr;

    return NextResponse.json({
      ok: true,
      session_id: sessionId,
      action,
      viewers_released: (openRows || []).length,
      viewer_minutes: viewerMinutes,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to end stream' }, { status: 500 });
  }
}
