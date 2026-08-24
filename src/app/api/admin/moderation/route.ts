// =============================================================================
// Admin: moderation queue actions
// =============================================================================
// Reports were being collected into three separate tables with no way to act
// on them. The oldest open report was 811 hours (34 days) old and NOTHING had
// ever been resolved — because there was no button anywhere that could.
//
// POST { source, report_id, action, note? }
//   action: 'resolve' | 'dismiss' | 'reviewing'
//
// Every action writes to admin_audit_log.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** source → { table, and the status vocabulary that table actually accepts } */
const SOURCES: Record<string, { table: string; resolved: string; dismissed: string; reviewing: string }> = {
  // public.reports uses ('pending','reviewing','resolved','dismissed')
  user:      { table: 'reports',           resolved: 'resolved', dismissed: 'dismissed', reviewing: 'reviewing' },
  // reel_reports / community_reports use ('pending','reviewed','resolved','dismissed')
  reel:      { table: 'reel_reports',      resolved: 'resolved', dismissed: 'dismissed', reviewing: 'reviewed' },
  community: { table: 'community_reports', resolved: 'resolved', dismissed: 'dismissed', reviewing: 'reviewed' },
};

function getAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function requireAdmin(
  req: NextRequest,
): Promise<{ id: string; email: string | null } | null> {
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
  const { data: profile } = await admin
    .from('profiles').select('is_admin, email').eq('id', user.id).single();
  if (!profile?.is_admin) return null;
  return { id: user.id, email: profile.email ?? user.email ?? null };
}

export async function POST(req: NextRequest) {
  const actor = await requireAdmin(req);
  if (!actor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: { source?: string; report_id?: string; action?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const cfg = SOURCES[body.source || ''];
  if (!cfg) {
    return NextResponse.json(
      { error: `source must be one of: ${Object.keys(SOURCES).join(', ')}` },
      { status: 400 },
    );
  }
  if (!body.report_id) {
    return NextResponse.json({ error: 'report_id required' }, { status: 400 });
  }

  const action = body.action || 'resolve';
  const status =
    action === 'dismiss' ? cfg.dismissed
    : action === 'reviewing' ? cfg.reviewing
    : cfg.resolved;

  const db = getAdminClient();

  // resolved_at only makes sense for terminal states.
  const patch: Record<string, unknown> = { status };
  if (action === 'resolve' || action === 'dismiss') {
    patch.resolved_at = new Date().toISOString();
  }

  const { data, error } = await db
    .from(cfg.table)
    .update(patch)
    .eq('id', body.report_id)
    .select('id, status')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    await db.from('admin_audit_log').insert({
      actor_id: actor.id,
      actor_email: actor.email,
      action: `report.${action}`,
      target_type: cfg.table,
      target_id: body.report_id,
      metadata: { status, note: body.note || null },
      ip_country: req.headers.get('x-vercel-ip-country') || null,
    });
  } catch {
    // Audit failure must not undo the moderation action.
  }

  return NextResponse.json({ ok: true, report: data });
}
