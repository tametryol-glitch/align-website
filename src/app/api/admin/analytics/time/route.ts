// =============================================================================
// GET /api/admin/analytics/time — powers Admin → Analytics → Time.
// =============================================================================
//   ?range=7|30|90|0        → overview + leaderboard (0 = all time)
//   ?q=<username or name>   → matching members for the lookup box
//   ?user=<uuid>            → one member's time in depth
// Admin-only (same is_admin gate as the other admin routes). Data comes from
// analytics_user_time_daily (supabase-migration-analytics-phase8-time.sql).
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MIGRATION = 'supabase-migration-analytics-phase8-time.sql';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function verifyAdmin(req: NextRequest): Promise<boolean> {
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
  if (!user) return false;
  const admin = getAdminClient();
  const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', user.id).single();
  return !!profile?.is_admin;
}

function missingFn(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false;
  return err.code === 'PGRST202' || /could not find the function|does not exist/i.test(err.message || '');
}

export async function GET(req: NextRequest) {
  try {
    if (!(await verifyAdmin(req))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const db = getAdminClient();
    const params = req.nextUrl.searchParams;

    // ── Member lookup ──────────────────────────────────────────────────────────
    const q = params.get('q');
    if (q !== null) {
      const term = q.trim().replace(/^@/, '').replace(/[%_,()]/g, '').slice(0, 60);
      if (term.length < 2) return NextResponse.json({ matches: [] });
      const { data } = await db
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)
        .limit(12);
      // Exact username first, then prefix matches.
      const lower = term.toLowerCase();
      const rank = (u: string | null) =>
        !u ? 3 : u.toLowerCase() === lower ? 0 : u.toLowerCase().startsWith(lower) ? 1 : 2;
      const matches = (data || []).sort((a, b) => rank(a.username) - rank(b.username));
      return NextResponse.json({ matches });
    }

    // ── One member ─────────────────────────────────────────────────────────────
    const userId = params.get('user');
    if (userId) {
      if (!UUID_RE.test(userId)) return NextResponse.json({ error: 'Bad user id' }, { status: 400 });
      const [profileRes, timeRes] = await Promise.all([
        db.from('profiles')
          .select('id, username, display_name, avatar_url, created_at, birth_date, gender, gender_identity, sun_sign, moon_sign, rising_sign, subscription_tier, is_subscribed')
          .eq('id', userId)
          .single(),
        db.rpc('analytics_time_user', { p_user_id: userId }),
      ]);
      if (missingFn(timeRes.error)) return NextResponse.json({ needsMigration: MIGRATION });
      if (!profileRes.data) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      return NextResponse.json({ profile: profileRes.data, time: timeRes.data ?? {} });
    }

    // ── Overview + leaderboard ────────────────────────────────────────────────
    const r = parseInt(params.get('range') || '30', 10);
    const range = [7, 30, 90, 0].includes(r) ? r : 30;
    const [overview, leaderboard] = await Promise.all([
      db.rpc('analytics_time_overview', { range_days: range }),
      db.rpc('analytics_time_leaderboard', { range_days: range, lim: 200 }),
    ]);
    if (missingFn(overview.error) || missingFn(leaderboard.error)) {
      return NextResponse.json({ needsMigration: MIGRATION });
    }
    return NextResponse.json({
      range,
      overview: overview.data ?? {},
      leaderboard: leaderboard.data ?? [],
      error: overview.error?.message || leaderboard.error?.message || undefined,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
