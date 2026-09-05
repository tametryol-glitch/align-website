// ═══════════════════════════════════════════════════════════════════
// Tell people the host has gone live.
//
// This is how a viewer finds out at all. The LIVE rail on the feed only
// works for someone who happens to open the feed while the stream is
// running; a notification is what reaches everyone else.
//
// Runs on the service key because it writes rows for *other* users,
// which RLS rightly forbids from the browser. The caller is verified as
// the session's own host first.
//
// Notification rows are inserted rather than pushes being sent directly:
// the database trigger is the single push path in this project, and
// duplicating it here is how chat ended up double-firing before.
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

// A stream nobody watches still costs Agora minutes, but a notification
// storm costs goodwill. Cap the fan-out and let the rail do the rest.
const MAX_RECIPIENTS = 2000;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getCallerId(req: NextRequest): Promise<string | null> {
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
  return user?.id ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const callerId = await getCallerId(req);
    if (!callerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const sessionId: string | undefined = body.session_id;
    if (!sessionId) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    const admin = getAdminClient();

    const { data: session, error: sessionErr } = await admin
      .from('live_sessions')
      .select('id, host_id, title, status, visibility')
      .eq('id', sessionId)
      .maybeSingle();
    if (sessionErr) throw sessionErr;
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    if (session.host_id !== callerId) {
      return NextResponse.json({ error: 'Not the host of this session' }, { status: 403 });
    }
    if (session.status !== 'live') {
      return NextResponse.json({ error: 'Session is not live' }, { status: 409 });
    }
    // Announcing a private stream would tell people about something they
    // are not allowed to open.
    if (session.visibility === 'private') {
      return NextResponse.json({ ok: true, notified: 0, reason: 'private' });
    }

    const { data: host } = await admin
      .from('profiles')
      .select('display_name')
      .eq('id', callerId)
      .maybeSingle();
    const hostName = host?.display_name || 'Someone you follow';

    // Friends in either direction; friendships store one row per pair.
    const { data: links, error: linksErr } = await admin
      .from('friendships')
      .select('user_id, friend_id')
      .eq('status', 'accepted')
      .or(`user_id.eq.${callerId},friend_id.eq.${callerId}`)
      .limit(MAX_RECIPIENTS);
    if (linksErr) throw linksErr;

    const recipients = Array.from(
      new Set(
        (links || [])
          .map((l: any) => (l.user_id === callerId ? l.friend_id : l.user_id))
          .filter((id: string) => id && id !== callerId),
      ),
    );

    if (recipients.length === 0) {
      return NextResponse.json({ ok: true, notified: 0 });
    }

    const title = `${hostName} is live`;
    const text = session.title && session.title !== 'Live' ? session.title : 'Tap to watch';

    // 'announcement' is a type this project already uses. Inventing a new
    // one risks a CHECK constraint on notifications.type; the deep link
    // in data is what actually routes the tap.
    const rows = recipients.map((userId) => ({
      user_id: userId,
      type: 'announcement',
      title,
      body: text,
      data: {
        kind: 'live_started',
        session_id: session.id,
        link: `/live/${session.id}`,
        deep_link: `/social/live?id=${session.id}`,
      },
    }));

    const { error: insertErr } = await admin.from('notifications').insert(rows);
    if (insertErr) throw insertErr;

    return NextResponse.json({ ok: true, notified: rows.length });
  } catch (err: any) {
    // Never fail the broadcast over this — the caller ignores the result.
    return NextResponse.json(
      { error: err?.message || 'Could not notify followers' },
      { status: 500 },
    );
  }
}
