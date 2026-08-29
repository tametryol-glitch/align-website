// Cron endpoint — the biweekly purpose check-in reminder. Runs daily and only
// notifies the readers who are actually due.
//
//   GET /api/cron/purpose-checkin  (header Authorization: Bearer <CRON_SECRET>)
//
// Writes ONE notification per due reader. The existing push-v2 DB trigger fans
// that out to mobile and /api/push/web handles browsers — no new push path.
//
// Notification type is 'transit_alert' for the same reason as the cosmic
// frequencies cron: it is the one type present in every version of the
// notifications_type_check constraint, and the push trigger already maps it to
// a preference column. The discriminator lives in data.kind.
//
// Three behaviours worth knowing before this looks broken:
//
//   1. Paid tiers only. The check-in CARD is free to everyone; this reminder is
//      a subscriber benefit, so a free reader sees the card when they open the
//      app but is never pushed.
//   2. Silence WIDENS the cadence. If the previous check-in was never answered
//      the reader waits longer for the next one, not less — the app gets
//      quieter when ignored, which is the whole reason this can sit on a
//      "purpose" topic without becoming a shame loop.
//   3. next_due_at is advanced at send time, so a second run the same day finds
//      nobody due. The 24h notification check is a belt-and-braces guard for
//      the case where that write fails.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  BASE_CADENCE_DAYS,
  dueAt,
  isDue,
  nextCadenceDays,
  nextTrack,
  type PurposeKind,
} from '@/lib/engines/purposeCheckin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Most pushes per run. The cron runs daily but a reader is only due every 14+
 * days, so a bounded batch drains comfortably — this exists to keep one run
 * from timing out as the subscriber base grows, not to ration reminders.
 * Anything deferred is reported, never silently dropped.
 */
const MAX_PER_RUN = 200;

/** Matches the convention used elsewhere: anything not empty and not "free". */
function isPaid(tier: string | null | undefined): boolean {
  const t = (tier || '').toLowerCase();
  return t !== '' && t !== 'free';
}

/**
 * Question-shaped, never an instruction. "Time to work on your purpose!" gets
 * swiped away and slowly trains the reader to ignore the whole notification
 * channel; a question they can answer in two minutes gets opened.
 */
function copyFor(track: PurposeKind): { title: string; body: string } {
  return track === 'soul'
    ? { title: 'Where are you growing?', body: 'One thing your chart keeps circling back to. Got two minutes?' }
    : { title: 'What are you building?', body: 'One thing your chart keeps circling back to. Got two minutes?' };
}

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

  const now = new Date();
  let sent = 0;
  let skippedNotDue = 0;
  let skippedPaused = 0;
  let skippedAlreadySent = 0;
  let widened = 0;
  let deferred = 0;
  let failed = 0;
  const failures: string[] = [];

  try {
    const supabase = getAdminClient();

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, subscription_tier, birth_date, latitude, longitude')
      .not('birth_date', 'is', null)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) throw error;

    const eligible = (profiles ?? []).filter((p) => isPaid(p.subscription_tier));
    if (!eligible.length) {
      return NextResponse.json({ ok: true, considered: 0, sent: 0, processedAt: now.toISOString() });
    }

    const ids = eligible.map((p) => p.id);
    const { data: prefRows } = await supabase
      .from('purpose_checkin_prefs')
      .select('*')
      .in('user_id', ids);
    const prefsById = new Map((prefRows ?? []).map((r: any) => [r.user_id, r]));

    for (const profile of eligible) {
      try {
        const row = prefsById.get(profile.id);
        // A reader who has never checked in has no prefs row — they are due.
        const prefs = {
          nextDueAt: row?.next_due_at ?? null,
          paused: !!row?.paused,
          lastKind: (row?.last_kind ?? null) as PurposeKind | null,
          consecutiveIgnored: row?.consecutive_ignored ?? 0,
        };

        if (prefs.paused) { skippedPaused++; continue; }
        if (!isDue(prefs, now)) { skippedNotDue++; continue; }
        if (sent >= MAX_PER_RUN) { deferred++; continue; }

        const dayAgo = new Date(now.getTime() - 86_400_000).toISOString();
        const { data: recent } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', profile.id)
          .eq('data->>kind', 'purpose_checkin')
          .gte('created_at', dayAgo)
          .limit(1);
        if (recent && recent.length > 0) { skippedAlreadySent++; continue; }

        // Was the last check-in left unanswered? That, not the send itself, is
        // what widens the cadence.
        const { data: lastCheckin } = await supabase
          .from('purpose_checkins')
          .select('id, responded_at')
          .eq('user_id', profile.id)
          .order('opened_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        let ignored = 0;
        if (lastCheckin && !lastCheckin.responded_at) {
          ignored = prefs.consecutiveIgnored + 1;
          widened++;
          await supabase
            .from('purpose_checkins')
            .update({ outcome: 'no_response' })
            .eq('id', lastCheckin.id);
        }

        const track = nextTrack(prefs.lastKind);
        const { title, body } = copyFor(track);

        const { error: insertError } = await supabase.from('notifications').insert({
          user_id: profile.id,
          type: 'transit_alert',
          title,
          body,
          // Web resolves the route via getNotificationLink; the mobile
          // notifications screen reads data.deep_link. Both are set so the tap
          // lands on the check-in card whichever device opens it.
          data: { kind: 'purpose_checkin', track, link: '/dashboard', deep_link: '/(tabs)' },
        });

        if (insertError) {
          // Logged rather than swallowed: this channel has died silently before,
          // and a reminder that never arrives looks exactly like a reader who
          // stopped caring.
          failed++;
          failures.push(`${profile.id}: ${insertError.message}`);
          continue;
        }

        const cadence = ignored > 0 ? nextCadenceDays(ignored) : (row?.cadence_days ?? BASE_CADENCE_DAYS);
        const { error: prefsError } = await supabase.from('purpose_checkin_prefs').upsert(
          {
            user_id: profile.id,
            cadence_days: cadence,
            next_due_at: dueAt(now, cadence).toISOString(),
            consecutive_ignored: ignored,
            updated_at: now.toISOString(),
          },
          { onConflict: 'user_id' },
        );

        if (prefsError) {
          failed++;
          failures.push(`${profile.id} (prefs): ${prefsError.message}`);
          continue;
        }

        sent++;
      } catch (err) {
        failed++;
        failures.push(`${profile.id}: ${err instanceof Error ? err.message : 'unknown'}`);
      }
    }

    return NextResponse.json({
      ok: true,
      considered: eligible.length,
      sent,
      skippedNotDue,
      skippedPaused,
      skippedAlreadySent,
      widened,
      deferred,
      failed,
      failures: failures.slice(0, 10),
      processedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
