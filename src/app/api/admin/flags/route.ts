// =============================================================================
// Admin: feature flags + kill switches (Phase 7)
// =============================================================================
// The point of this endpoint is that a broken feature can be turned off in
// seconds without shipping a build and waiting on app-store review.
//
// Every mutation writes to admin_audit_log — needed the moment anyone besides
// the founder has admin access.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Returns the admin's own user row, or null when not an admin. */
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

async function audit(
  db: SupabaseClient,
  actor: { id: string; email: string | null },
  action: string,
  targetType: string,
  targetId: string,
  metadata: Record<string, unknown>,
  req: NextRequest,
) {
  try {
    await db.from('admin_audit_log').insert({
      actor_id: actor.id,
      actor_email: actor.email,
      action,
      target_type: targetType,
      target_id: targetId,
      metadata,
      ip_country: req.headers.get('x-vercel-ip-country') || null,
    });
  } catch {
    // Never let audit failure block the operation itself.
  }
}

// ── GET: list flags ──────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const actor = await requireAdmin(req);
  if (!actor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const db = getAdminClient();
  const { data, error } = await db
    .from('feature_flags')
    .select('*')
    .order('is_kill_switch', { ascending: false })
    .order('key');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ flags: data || [] });
}

// ── POST: create or update a flag ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const actor = await requireAdmin(req);
  if (!actor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: {
    key?: string;
    description?: string;
    enabled?: boolean;
    rollout_pct?: number;
    is_kill_switch?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const key = (body.key || '').trim();
  if (!key || !/^[a-z0-9_]+$/.test(key)) {
    return NextResponse.json(
      { error: 'key must be lowercase letters, numbers and underscores' },
      { status: 400 },
    );
  }

  const rollout = Math.max(0, Math.min(100, Math.round(body.rollout_pct ?? 100)));
  const db = getAdminClient();

  const { data, error } = await db
    .from('feature_flags')
    .upsert(
      {
        key,
        description: body.description ?? '',
        enabled: !!body.enabled,
        rollout_pct: rollout,
        is_kill_switch: !!body.is_kill_switch,
        updated_by: actor.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await audit(db, actor, 'flag.upsert', 'feature_flag', key, {
    enabled: !!body.enabled,
    rollout_pct: rollout,
  }, req);

  return NextResponse.json({ flag: data });
}

// ── DELETE: remove a flag ────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const actor = await requireAdmin(req);
  if (!actor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const key = req.nextUrl.searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 });

  const db = getAdminClient();
  const { error } = await db.from('feature_flags').delete().eq('key', key);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await audit(db, actor, 'flag.delete', 'feature_flag', key, {}, req);
  return NextResponse.json({ ok: true });
}
