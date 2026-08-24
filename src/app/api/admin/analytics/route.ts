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

// Monthly subscription price (USD) used for estimated MRR until Stripe is wired.
const MONTHLY_PRICE = 9;

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

/**
 * Sectioned payloads (Phases 5–7). The default/overview response is unchanged
 * so the existing dashboard keeps working; each new tab asks for its own
 * section instead of everything loading in one slow request.
 */
async function getSection(
  db: ReturnType<typeof getAdminClient>,
  section: string,
  range: number,
): Promise<Record<string, unknown>> {
  const unwrap = (r: { data: unknown; error: unknown }) =>
    (r.error ? { error: (r.error as { message?: string }).message } : r.data) ?? {};

  switch (section) {
    case 'content': {
      const [content, creators, feed, reels, topPosts] = await Promise.all([
        db.rpc('analytics_content_metrics', { range_days: range }),
        db.rpc('analytics_creator_health', { range_days: Math.max(range, 30) }),
        db.rpc('analytics_feed_quality', { range_days: range }),
        db.rpc('analytics_reel_metrics', { range_days: range }),
        db.rpc('analytics_top_posts', { range_days: range, lim: 20 }),
      ]);
      return {
        content: unwrap(content),
        creators: unwrap(creators),
        feed: unwrap(feed),
        reels: unwrap(reels),
        topPosts: topPosts.data || [],
      };
    }

    case 'social': {
      const [graph, messaging, dating] = await Promise.all([
        db.rpc('analytics_social_graph', { range_days: range }),
        db.rpc('analytics_messaging', { range_days: range }),
        db.rpc('analytics_dating_funnel', { range_days: Math.max(range, 30) }),
      ]);
      return {
        graph: unwrap(graph),
        messaging: unwrap(messaging),
        dating: unwrap(dating),
      };
    }

    case 'money': {
      const [exact, mrr, paywall, unit, risk] = await Promise.all([
        db.rpc('analytics_revenue_exact', { range_days: Math.max(range, 30) }),
        db.rpc('analytics_mrr_trend', { months: 6 }),
        db.rpc('analytics_paywall_funnel', { range_days: Math.max(range, 30) }),
        db.rpc('analytics_unit_economics', { range_days: Math.max(range, 30) }),
        db.rpc('analytics_churn_risk', { lim: 50 }),
      ]);
      return {
        exact: unwrap(exact),
        mrrTrend: mrr.data || [],
        paywall: unwrap(paywall),
        unitEconomics: unwrap(unit),
        churnRisk: risk.data || [],
      };
    }

    case 'safety': {
      const [metrics, queue, suspect] = await Promise.all([
        db.rpc('analytics_safety_metrics', { range_days: Math.max(range, 30) }),
        db.rpc('analytics_reports_queue', { lim: 50 }),
        db.rpc('analytics_suspect_birth_dates'),
      ]);
      return {
        metrics: unwrap(metrics),
        queue: queue.data || [],
        suspectBirthDates: suspect.data || [],
      };
    }

    case 'tech': {
      const [health, versions, push] = await Promise.all([
        db.rpc('analytics_tech_health', { range_days: range }),
        db.rpc('analytics_version_adoption', { range_days: range }),
        db.rpc('analytics_push_metrics', { range_days: range }),
      ]);
      return {
        health: unwrap(health),
        versions: versions.data || [],
        push: unwrap(push),
      };
    }

    case 'growth': {
      const [power, lifecycle, activation, cohorts] = await Promise.all([
        db.rpc('analytics_power_users'),
        db.rpc('analytics_lifecycle', { range_days: range }),
        db.rpc('analytics_activation'),
        db.rpc('analytics_cohort_grid', { weeks: 12 }),
      ]);
      return {
        power: unwrap(power),
        lifecycle: unwrap(lifecycle),
        activation: unwrap(activation),
        cohorts: cohorts.data || [],
      };
    }

    case 'systems': {
      const [flags, experiments, rules, alerts] = await Promise.all([
        db.from('feature_flags').select('*').order('is_kill_switch', { ascending: false }).order('key'),
        db.from('experiments').select('*').order('created_at', { ascending: false }),
        db.from('analytics_alert_rules').select('*').order('name'),
        db.from('analytics_alert_events').select('*').order('created_at', { ascending: false }).limit(50),
      ]);
      return {
        flags: flags.data || [],
        experiments: experiments.data || [],
        alertRules: rules.data || [],
        alertEvents: alerts.data || [],
      };
    }

    default:
      return { error: `Unknown section: ${section}` };
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!(await verifyAdmin(req))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rangeParam = parseInt(req.nextUrl.searchParams.get('range') || '7', 10);
    const range = rangeParam === 30 ? 30 : 7;

    // Sectioned request → return just that slice.
    const section = req.nextUrl.searchParams.get('section');
    if (section) {
      const db = getAdminClient();
      const data = await getSection(db, section, range);
      return NextResponse.json({ section, range, ...data, generatedAt: new Date().toISOString() });
    }
    const from = startDay(range);
    const fromPrev = startDay(range * 2); // for period-over-period deltas
    const db = getAdminClient();

    const [liveRes, trendAllRes, pagesRes, geoRes, localeRes, featRes, retRes, engRes, funnelRes, revRes, trafRes, affRes, campRes] = await Promise.all([
      db.rpc('analytics_live_metrics'),
      // Pull 2× the range so we can compare this period vs the previous one.
      db.from('analytics_daily_overview').select('*').gte('day', fromPrev).order('day', { ascending: true }),
      db.from('analytics_daily_pages').select('path, views, unique_users').gte('day', from),
      db.from('analytics_daily_geo').select('country, users, sessions').gte('day', from),
      db.from('analytics_daily_locale').select('locale, users').gte('day', from),
      db.from('analytics_daily_features').select('feature, opens, unique_users').gte('day', from),
      db.from('analytics_daily_retention').select('day_offset, cohort_size, retained').gte('cohort_day', startDay(60)),
      db.rpc('analytics_engagement_metrics', { range_days: range }),
      db.rpc('analytics_funnel'),
      db.rpc('analytics_revenue_metrics'),
      db.rpc('analytics_traffic_sources', { range_days: range }),
      db.from('affiliates').select('total_signups, total_conversions'),
      db.rpc('analytics_campaigns', { range_days: range }),
    ]);

    const allRows = trendAllRes.data || [];
    const trend = allRows.filter((r: any) => r.day >= from);
    const prevRows = allRows.filter((r: any) => r.day < from);

    // ── Top pages: sum views across the range, rank ──
    const pageMap = new Map<string, { path: string; views: number; users: number }>();
    for (const r of pagesRes.data || []) {
      const cur = pageMap.get(r.path) || { path: r.path, views: 0, users: 0 };
      cur.views += r.views || 0;
      cur.users += r.unique_users || 0;
      pageMap.set(r.path, cur);
    }
    const pages = Array.from(pageMap.values()).sort((a, b) => b.views - a.views).slice(0, 25);

    // ── Feature usage: sum opens across the range, rank ──
    const featMap = new Map<string, { feature: string; opens: number; users: number }>();
    for (const r of featRes.data || []) {
      const cur = featMap.get(r.feature) || { feature: r.feature, opens: 0, users: 0 };
      cur.opens += r.opens || 0;
      cur.users += r.unique_users || 0;
      featMap.set(r.feature, cur);
    }
    const features = Array.from(featMap.values()).sort((a, b) => b.opens - a.opens).slice(0, 25);

    // ── Geography (internal admin view: exact counts, no k-anon fold) ──
    const geoMap = new Map<string, { country: string; users: number; sessions: number }>();
    for (const r of geoRes.data || []) {
      const cur = geoMap.get(r.country) || { country: r.country, users: 0, sessions: 0 };
      cur.users += r.users || 0;
      cur.sessions += r.sessions || 0;
      geoMap.set(r.country, cur);
    }
    const geo = Array.from(geoMap.values()).sort((a, b) => b.users - a.users);

    // ── Languages (exact counts) ──
    const locMap = new Map<string, number>();
    for (const r of localeRes.data || []) {
      locMap.set(r.locale, (locMap.get(r.locale) || 0) + (r.users || 0));
    }
    const locale = Array.from(locMap.entries())
      .map(([loc, users]) => ({ locale: loc, users }))
      .sort((a, b) => b.users - a.users);

    // ── Platform totals across the range ──
    const platforms = { web: 0, ios: 0, android: 0 };
    for (const r of trend) {
      platforms.web += r.platform_web || 0;
      platforms.ios += r.platform_ios || 0;
      platforms.android += r.platform_android || 0;
    }

    // ── Period-over-period deltas (this range vs the preceding one) ──
    const sum = (rows: any[], k: string) => rows.reduce((s, r) => s + (r[k] || 0), 0);
    const avg = (rows: any[], k: string) => (rows.length ? sum(rows, k) / rows.length : 0);
    const pct = (cur: number, prev: number) =>
      prev > 0 ? Math.round(((cur - prev) / prev) * 100) : cur > 0 ? 100 : 0;

    // Today vs yesterday DAU (from the daily rollup; live.dau is "today so far").
    const todayStr = startDay(1);
    const ydayStr = (() => { const d = new Date(); d.setUTCDate(d.getUTCDate() - 1); return d.toISOString().slice(0, 10); })();
    const dauToday = allRows.find((r: any) => r.day === todayStr)?.dau ?? (liveRes.data as any)?.dau ?? 0;
    const dauYday = allRows.find((r: any) => r.day === ydayStr)?.dau ?? 0;

    const deltas = {
      newUsers: pct(sum(trend, 'new_users'), sum(prevRows, 'new_users')),
      sessions: pct(sum(trend, 'sessions'), sum(prevRows, 'sessions')),
      dauAvg: pct(Math.round(avg(trend, 'dau')), Math.round(avg(prevRows, 'dau'))),
      dauToday: pct(dauToday, dauYday),
    };

    // ── Retention: aggregate mature cohorts into overall D1/D7/D30 % ──
    const retAgg: Record<number, { size: number; retained: number }> = { 1: { size: 0, retained: 0 }, 7: { size: 0, retained: 0 }, 30: { size: 0, retained: 0 } };
    for (const r of retRes.data || []) {
      const b = retAgg[r.day_offset];
      if (b) { b.size += r.cohort_size || 0; b.retained += r.retained || 0; }
    }
    const retention = {
      d1: retAgg[1].size ? Math.round((retAgg[1].retained / retAgg[1].size) * 100) : null,
      d7: retAgg[7].size ? Math.round((retAgg[7].retained / retAgg[7].size) * 100) : null,
      d30: retAgg[30].size ? Math.round((retAgg[30].retained / retAgg[30].size) * 100) : null,
      cohort: { d1: retAgg[1].size, d7: retAgg[7].size, d30: retAgg[30].size },
    };

    // ── Revenue (estimated MRR from paid count × price until Stripe is wired) ──
    const rev = (revRes.data as any) || {};
    const paid = rev.paid || 0;
    const totalMembers = rev.total || 0;
    const revenue = {
      total: totalMembers,
      paid,
      free: rev.free || 0,
      mrr: paid * MONTHLY_PRICE,
      arpu: totalMembers ? Math.round((paid * MONTHLY_PRICE / totalMembers) * 100) / 100 : 0,
      conversionPct: totalMembers ? Math.round((paid / totalMembers) * 100) : 0,
      price: MONTHLY_PRICE,
    };

    // ── Affiliate-driven acquisition (sum across all affiliates) ──
    const affiliates = (affRes.data || []).reduce(
      (a: { signups: number; conversions: number }, r: any) => ({
        signups: a.signups + (r.total_signups || 0),
        conversions: a.conversions + (r.total_conversions || 0),
      }),
      { signups: 0, conversions: 0 },
    );

    return NextResponse.json({
      live: liveRes.data || {},
      range,
      trend,
      pages,
      features,
      geo,
      locale,
      platforms,
      deltas,
      retention,
      engagement: engRes.data || {},
      funnel: funnelRes.data || {},
      revenue,
      traffic: trafRes.data || [],
      affiliates,
      campaigns: campRes.data || [],
      generatedAt: new Date().toISOString(),
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
    // Refresh retention too (ignore error if Phase 2 migration not yet applied).
    try { await db.rpc('analytics_retention_rollup', { lookback_days: 60 }); } catch {}
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
