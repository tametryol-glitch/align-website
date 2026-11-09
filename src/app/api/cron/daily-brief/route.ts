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
// The message is "Your Day": the member's PROGRESSED radar, its ten hottest life
// areas fused into one story (align-api-v2 /daystory/build). The API stores the
// full story once per member per day and returns only the push text; the screen
// reads the rest, with the paid chapters gated server side.
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
import { resolveTimezoneOffset } from '@/lib/timezoneOffset';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/** Most members handled per run; the rest are reported as deferred and are
 *  picked up by the next hourly run inside their catch-up window. */
const MAX_PER_RUN = 40;   // each member is one model call (~20-30s), so a run is kept small; it runs every 10 minutes
const CONCURRENCY = 8;
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

async function buildStory(
  profile: any, userId: string, timeZone: string, localDate: string,
): Promise<{ title: string; body: string; created: boolean; source: string }> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  const secret = process.env.CRON_SECRET;
  if (!base) throw new Error('Missing NEXT_PUBLIC_API_URL');
  const { offset, label } = resolveTimezoneOffset(
    profile.timezone, profile.longitude, profile.birth_date, profile.birth_time, profile.latitude,
  );
  const res = await fetch(`${base}/daystory/build`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-cron-secret': secret || '' },
    body: JSON.stringify({
      user_id: userId,
      timezone: timeZone,
      local_date: localDate,
      birth_data: {
        name: '',
        date: profile.birth_date,
        time: profile.birth_time || '12:00',
        latitude: profile.latitude,
        longitude: profile.longitude,
        timezone: label,
        tz_offset: offset,
        location: '',
        house_system: 'Whole Sign',
      },
    }),
    // the story is written by a model: give it room, but never stall the whole run
    signal: AbortSignal.timeout(55_000),
  });
  if (!res.ok) throw new Error(`daystory ${res.status}: ${(await res.text()).slice(0, 160)}`);
  const data = await res.json();
  if (!data?.title || !data?.body) throw new Error('daystory returned no text');
  return { title: data.title, body: data.body, created: !!data.created, source: data.source };
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

    const due: Array<{ user_id: string; localDate: string; tz: string }> = [];
    for (const p of prefs ?? []) {
      considered++;
      const lt = localTime(now, p.timezone || 'UTC');
      if (!lt) { skippedNotDue++; continue; }
      const inWindow = lt.hour >= p.send_hour && lt.hour <= p.send_hour + CATCH_UP_HOURS;
      if (!inWindow || p.last_sent_on === lt.date) { skippedNotDue++; continue; }
      due.push({ user_id: p.user_id, localDate: lt.date, tz: p.timezone || 'UTC' });
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

    const handle = async (item: { user_id: string; localDate: string; tz: string }) => {
      const profile = profileById.get(item.user_id);
      if (!profile?.birth_date || profile.latitude == null || profile.longitude == null) {
        skippedNoBirthData++;
        return;
      }
      try {
        const story = await buildStory(profile, item.user_id, item.tz, item.localDate);

        const { error: insertError } = await supabase.from('notifications').insert({
          user_id: item.user_id,
          type: 'transit_alert',
          title: story.title,
          body: story.body,
          data: { kind: 'daily_story', link: '/readings/day', deep_link: '/readings/day', date: item.localDate },
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
