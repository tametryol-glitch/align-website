// Cron endpoint — the opt-in daily "Today for you" push. Runs HOURLY and sends
// to each member whose local time has reached their chosen hour.
//
//   GET /api/cron/daily-brief  (header Authorization: Bearer <CRON_SECRET>)
//
// Same delivery pattern as the purpose check-in cron: it writes ONE row to
// `notifications` and the existing push trigger / web relay do the rest. The
// type is 'transit_alert' (present in every version of the type constraint);
// the discriminator is data.kind = 'daily_brief'.
//
// The message is the same answer the Today card shows, computed from today's
// real transits against the member's natal chart (lib/todayEngine.ts).
//
// Guarantees worth knowing:
//   - Opt-in only (daily_brief_prefs.enabled).
//   - Once per local day: last_sent_on is advanced right after the insert.
//   - A short catch-up window (the chosen hour + 2) so one missed run does
//     not lose the day, but a member never gets it in the evening.
//   - A failed member is logged and skipped; it never blocks the rest.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildTodayAnswer, computeTodayAspects } from '@/lib/todayEngine';
import { resolveTimezoneOffset } from '@/lib/timezoneOffset';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Most members handled per run; the rest are reported as deferred and are
 *  picked up by the next hourly run inside their catch-up window. */
const MAX_PER_RUN = 120;
const CONCURRENCY = 6;
const CATCH_UP_HOURS = 2;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Local date (YYYY-MM-DD) and hour (0-23) in an IANA zone; null if invalid. */
function localTime(now: Date, timeZone: string): { date: string; hour: number } | null {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
    }).formatToParts(now);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    const hour = Number(get('hour')) % 24;
    if (!Number.isFinite(hour)) return null;
    return { date: `${get('year')}-${get('month')}-${get('day')}`, hour };
  } catch {
    return null;
  }
}

async function fetchTransits(profile: any): Promise<{ transit_positions: any[]; natal_positions: any[] } | null> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error('Missing NEXT_PUBLIC_API_URL');
  const { offset, label } = resolveTimezoneOffset(
    profile.timezone, profile.longitude, profile.birth_date, profile.birth_time, profile.latitude,
  );
  const res = await fetch(`${base}/transits/current`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: '',
      date: profile.birth_date,
      time: profile.birth_time || '12:00',
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezone: label,
      tz_offset: offset,
      location: '',
      house_system: 'Whole Sign',
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data?.transit_positions) || !Array.isArray(data?.natal_positions)) return null;
  return data;
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  let considered = 0;
  let sent = 0;
  let skippedNotDue = 0;
  let skippedNoBirthData = 0;
  let deferred = 0;
  let failed = 0;
  const failures: string[] = [];

  try {
    const supabase = getAdminClient();

    const { data: prefs, error } = await supabase
      .from('daily_brief_prefs')
      .select('user_id, send_hour, timezone, last_sent_on')
      .eq('enabled', true);
    if (error) throw error;

    const due: Array<{ user_id: string; localDate: string }> = [];
    for (const p of prefs ?? []) {
      considered++;
      const lt = localTime(now, p.timezone || 'UTC');
      if (!lt) { skippedNotDue++; continue; }
      const inWindow = lt.hour >= p.send_hour && lt.hour <= p.send_hour + CATCH_UP_HOURS;
      if (!inWindow || p.last_sent_on === lt.date) { skippedNotDue++; continue; }
      due.push({ user_id: p.user_id, localDate: lt.date });
    }

    const batch = due.slice(0, MAX_PER_RUN);
    deferred = due.length - batch.length;
    if (batch.length === 0) {
      return NextResponse.json({ ok: true, considered, sent, skippedNotDue, deferred, processedAt: now.toISOString() });
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, birth_date, birth_time, latitude, longitude, timezone')
      .in('id', batch.map((b) => b.user_id));
    const profileById = new Map((profiles ?? []).map((p: any) => [p.id, p]));

    const handle = async (item: { user_id: string; localDate: string }) => {
      const profile = profileById.get(item.user_id);
      if (!profile?.birth_date || profile.latitude == null || profile.longitude == null) {
        skippedNoBirthData++;
        return;
      }
      try {
        const data = await fetchTransits(profile);
        if (!data) throw new Error('transit API returned no positions');
        const toBody = (p: any) => ({ name: p.name, longitude: p.longitude });
        const answer = buildTodayAnswer(
          computeTodayAspects(data.transit_positions.map(toBody), data.natal_positions.map(toBody), !!profile.birth_time),
        );

        const { error: insertError } = await supabase.from('notifications').insert({
          user_id: item.user_id,
          type: 'transit_alert',
          title: answer.headline,
          body: answer.doText,
          data: { kind: 'daily_brief', link: '/dashboard', deep_link: '/(tabs)' },
        });
        if (insertError) throw insertError;

        // Advance right after the insert so a retry the same day finds nobody.
        await supabase
          .from('daily_brief_prefs')
          .update({ last_sent_on: item.localDate, updated_at: now.toISOString() })
          .eq('user_id', item.user_id);
        sent++;
      } catch (err: any) {
        // Logged rather than swallowed: this channel has died silently before.
        failed++;
        failures.push(`${item.user_id}: ${err?.message || String(err)}`);
      }
    };

    // Small fixed-size worker pool so a slow transit call cannot stall the run.
    let next = 0;
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, batch.length) }, async () => {
        while (next < batch.length) {
          const item = batch[next++];
          await handle(item);
        }
      }),
    );

    return NextResponse.json({
      ok: failed === 0,
      considered, sent, skippedNotDue, skippedNoBirthData, deferred, failed,
      failures: failures.slice(0, 10),
      processedAt: now.toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err), considered, sent }, { status: 500 });
  }
}
