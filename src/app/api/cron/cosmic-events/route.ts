// Cron endpoint — publishes real cosmic events (moon phases, retrogrades,
// eclipses, ingresses) to the feed ONCE per event, from the official Cosmic
// Weather account.
//
// This replaces the old behaviour where every user's phone posted the event
// under its own owner's name, producing one duplicate per user. Runs hourly
// because the moon is "exact" for only ~12h; idempotent via a title check, so
// later runs inside the same window do nothing.
//
// Authorized with CRON_SECRET, same as the other crons:
//   GET /api/cron/cosmic-events  (header Authorization: Bearer <CRON_SECRET>)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OFFICIAL_ACCOUNTS } from '@/lib/officialAccounts';
import { detectCosmicEvents } from '@/lib/cosmicEvents';

export const runtime = 'nodejs'; // needs supabase-js, not edge-compatible
export const dynamic = 'force-dynamic';

const COSMIC_WEATHER = OFFICIAL_ACCOUNTS.find((a) => a.handle === 'cosmic_weather')!;
// Same event never recurs within this window (moon phases are ~7 days apart).
const DEDUPE_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const events = detectCosmicEvents();
    if (events.length === 0) {
      return NextResponse.json({ ok: true, events: 0, results: [] });
    }

    const admin = getAdminClient();
    const since = new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString();
    const results: Array<{ event: string; status: string; reason?: string }> = [];

    for (const event of events) {
      // Already published by anyone (this cron, or an older app version)?
      const { count, error: dupErr } = await admin
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'transit_alert')
        .gte('created_at', since)
        .like('content', `${event.title}%`);

      if (dupErr) {
        results.push({ event: event.title, status: 'error', reason: dupErr.message });
        continue;
      }
      if ((count ?? 0) > 0) {
        results.push({ event: event.title, status: 'skipped', reason: 'already posted' });
        continue;
      }

      const { error: insertErr } = await admin.from('posts').insert({
        user_id: COSMIC_WEATHER.id,
        type: 'transit_alert',
        content: `${event.title}\n\n${event.description}`,
        image_url: null,
        visibility: 'public',
        chart_data: {},
      });

      results.push(
        insertErr
          ? { event: event.title, status: 'error', reason: insertErr.message }
          : { event: event.title, status: 'posted' },
      );
    }

    return NextResponse.json({ ok: true, events: events.length, results });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'cosmic-events failed' }, { status: 500 });
  }
}
