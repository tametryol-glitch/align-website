// =============================================================================
// GET /api/admin/analytics?range=7|30 — powers the admin Analytics dashboard.
// =============================================================================
// Returns live/headline metrics (real-time) + pre-aggregated rollups for the
// selected range. Admin-only (same is_admin gate as the other admin routes).
//
// Privacy: geography + language buckets smaller than K_ANON are folded into
// "Other" so no small group is individually identifiable (matches the app's
// k-anonymity posture elsewhere).
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const K_ANON = 10;

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

function startDay(rangeDays: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - (rangeDays - 1));
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  try {
    if (!(await verifyAdmin(req))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rangeParam = parseInt(req.nextUrl.searchParams.get('range') || '7', 10);
    const range = rangeParam === 30 ? 30 : 7;
    const from = startDay(range);
    const db = getAdminClient();

    const [liveRes, trendRes, pagesRes, geoRes, localeRes] = await Promise.all([
      db.rpc('analytics_live_metrics'),
      db.from('analytics_daily_overview').select('*').gte('day', from).order('day', { ascending: true }),
      db.from('analytics_daily_pages').select('platform, path, views, unique_users').gte('day', from),
      db.from('analytics_daily_geo').select('country, users, sessions').gte('day', from),
      db.from('analytics_daily_locale').select('locale, users').gte('day', from),
    ]);

    // ── Top pages: sum views across the range, rank, top 25 ──
    const pageMap = new Map<string, { path: string; views: number; users: number }>();
    for (const r of pagesRes.data || []) {
      const cur = pageMap.get(r.path) || { path: r.path, views: 0, users: 0 };
      cur.views += r.views || 0;
      cur.users += r.unique_users || 0;
      pageMap.set(r.path, cur);
    }
    const pages = Array.from(pageMap.values()).sort((a, b) => b.views - a.views).slice(0, 25);

    // ── Geography: sum per country, fold sub-K countries into "Other" ──
    const geoMap = new Map<string, { country: string; users: number; sessions: number }>();
    for (const r of geoRes.data || []) {
      const cur = geoMap.get(r.country) || { country: r.country, users: 0, sessions: 0 };
      cur.users += r.users || 0;
      cur.sessions += r.sessions || 0;
      geoMap.set(r.country, cur);
    }
    let geoOther = { country: 'Other', users: 0, sessions: 0 };
    const geo: { country: string; users: number; sessions: number }[] = [];
    for (const g of Array.from(geoMap.values())) {
      if (g.users < K_ANON) {
        geoOther.users += g.users;
        geoOther.sessions += g.sessions;
      } else geo.push(g);
    }
    geo.sort((a, b) => b.users - a.users);
    if (geoOther.users > 0) geo.push(geoOther);

    // ── Languages: sum per locale, fold sub-K into "other" ──
    const locMap = new Map<string, number>();
    for (const r of localeRes.data || []) {
      locMap.set(r.locale, (locMap.get(r.locale) || 0) + (r.users || 0));
    }
    let locOther = 0;
    const locale: { locale: string; users: number }[] = [];
    for (const [loc, users] of Array.from(locMap.entries())) {
      if (users < K_ANON) locOther += users;
      else locale.push({ locale: loc, users });
    }
    locale.sort((a, b) => b.users - a.users);
    if (locOther > 0) locale.push({ locale: 'other', users: locOther });

    // ── Platform totals across the range (from the overview rollup) ──
    const platforms = { web: 0, ios: 0, android: 0 };
    for (const r of trendRes.data || []) {
      platforms.web += r.platform_web || 0;
      platforms.ios += r.platform_ios || 0;
      platforms.android += r.platform_android || 0;
    }

    return NextResponse.json({
      live: liveRes.data || {},
      range,
      trend: trendRes.data || [],
      pages,
      geo,
      locale,
      platforms,
      kAnon: K_ANON,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

// POST /api/admin/analytics — recompute today + yesterday's rollups on demand,
// so the dashboard reflects live data without waiting for the nightly cron.
export async function POST(req: NextRequest) {
  try {
    if (!(await verifyAdmin(req))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const db = getAdminClient();
    const today = new Date();
    const yday = new Date();
    yday.setUTCDate(yday.getUTCDate() - 1);
    for (const d of [yday, today]) {
      const { error } = await db.rpc('analytics_rollup', { target_day: d.toISOString().slice(0, 10) });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
