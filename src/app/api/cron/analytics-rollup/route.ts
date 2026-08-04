// =============================================================================
// GET /api/cron/analytics-rollup
// =============================================================================
// Aggregates raw analytics_events / analytics_sessions into the daily_* rollup
// tables the admin dashboard reads. The heavy lifting is the Postgres function
// public.analytics_rollup(day) — this route just triggers it for the last few
// days (idempotent) so gaps self-heal and the current day stays fresh.
//
// pg_cron already runs this nightly (see the migration); this HTTP route is a
// manual/backup trigger and lets the dashboard "Recompute" button work.
//
// Auth: same CRON_SECRET Bearer pattern as the other cron routes.
// Raw-event 90-day purge is handled separately by pg_cron (retention migration).
// =============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

function dayString(offsetDays: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Allow ?days=N to backfill more (default: today + yesterday).
  const daysParam = parseInt(request.nextUrl.searchParams.get('days') || '2', 10);
  const days = Math.min(Math.max(isNaN(daysParam) ? 2 : daysParam, 1), 60);

  try {
    const db = admin();
    const rolled: string[] = [];
    for (let i = 0; i < days; i++) {
      const day = dayString(i);
      const { error } = await db.rpc('analytics_rollup', { target_day: day });
      if (error) {
        return NextResponse.json({ error: error.message, rolledSoFar: rolled }, { status: 500 });
      }
      rolled.push(day);
    }
    // Retention curves (Phase 2). Ignore if the migration isn't applied yet.
    try { await db.rpc('analytics_retention_rollup', { lookback_days: 60 }); } catch {}
    return NextResponse.json({ ok: true, rolled, processedAt: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Cron] analytics-rollup failed:', message);
    return NextResponse.json({ error: 'Internal error', details: message }, { status: 500 });
  }
}
