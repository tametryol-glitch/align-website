/**
 * Purpose Check-In — persistence.
 *
 * The only place the check-in tables are read or written. All decision logic
 * lives in the pure engine (src/lib/engines/purposeCheckin.ts); this module just
 * moves rows, so the same rules can be reused on mobile with a different client.
 *
 * Writes report success rather than swallowing it: a check-in that silently
 * fails to save looks identical to a reader who never answered, which would
 * corrupt both the rotation and the cadence.
 *
 * @see supabase-migration-purpose-checkin.sql
 */

import { createClient } from '@/lib/supabase';
import type { PurposePoint } from '@/lib/engines/purposePoints';
import {
  BASE_CADENCE_DAYS,
  dueAt,
  learnRegister,
  nextCadenceDays,
  nextStatus,
  pointsToArchive,
  type CheckinOutcome,
  type CheckinRecord,
  type PurposeKind,
  type PurposePointState,
  type Register,
  type TimeConfidence,
} from '@/lib/engines/purposeCheckin';

export interface CheckinPrefs {
  cadenceDays: number;
  nextDueAt: string | null;
  paused: boolean;
  lastKind: PurposeKind | null;
  register: Register | null;
  registerSource: 'chart' | 'observed' | null;
  consecutiveIgnored: number;
}

export const DEFAULT_PREFS: CheckinPrefs = {
  cadenceDays: BASE_CADENCE_DAYS,
  nextDueAt: null,
  paused: false,
  lastKind: null,
  register: null,
  registerSource: null,
  consecutiveIgnored: 0,
};

const toState = (row: any): PurposePointState => ({
  pointKey: row.point_key,
  kind: row.kind,
  source: row.source,
  timeSensitive: !!row.time_sensitive,
  status: row.status,
  lastSurfacedAt: row.last_surfaced_at ?? null,
  lastResponseAt: row.last_response_at ?? null,
  surfacedCount: row.surfaced_count ?? 0,
  confirmedCount: row.confirmed_count ?? 0,
  userNote: row.user_note ?? null,
  chartVersion: row.chart_version ?? null,
});

// ── Reads ────────────────────────────────────────────────────────────────────

export async function loadPrefs(userId: string): Promise<CheckinPrefs> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('purpose_checkin_prefs')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return { ...DEFAULT_PREFS };
  return {
    cadenceDays: data.cadence_days ?? BASE_CADENCE_DAYS,
    nextDueAt: data.next_due_at ?? null,
    paused: !!data.paused,
    lastKind: data.last_kind ?? null,
    register: data.register ?? null,
    registerSource: data.register_source ?? null,
    consecutiveIgnored: data.consecutive_ignored ?? 0,
  };
}

export async function loadPointStates(userId: string): Promise<PurposePointState[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('purpose_point_state')
    .select('*')
    .eq('user_id', userId)
    .is('archived_at', null);

  if (error || !data) return [];
  return data.map(toState);
}

export async function loadRecentCheckins(userId: string, limit = 6): Promise<CheckinRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('purpose_checkins')
    .select('kind, led_point_key, chosen_point_key, outcome')
    .eq('user_id', userId)
    .order('opened_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((r: any) => ({
    kind: r.kind,
    ledPointKey: r.led_point_key,
    chosenPointKey: r.chosen_point_key ?? null,
    outcome: r.outcome ?? null,
  }));
}

// ── Sync ─────────────────────────────────────────────────────────────────────

/**
 * Make sure every point in this track has a state row, and retire the ones a
 * birth-data correction invalidated.
 *
 * Archiving (rather than deleting) matters: the reader's own words are attached
 * to a point, and a corrected birth time must not cause the bot to quote them
 * back about a placement that no longer exists.
 */
export async function syncPointStates(
  userId: string,
  kind: PurposeKind,
  points: PurposePoint[],
  chartVersion: string,
): Promise<PurposePointState[]> {
  const supabase = createClient();
  const existing = (await loadPointStates(userId)).filter((s) => s.kind === kind);

  const stale = pointsToArchive(existing, chartVersion);
  if (stale.length) {
    await supabase
      .from('purpose_point_state')
      .update({ archived_at: new Date().toISOString() })
      .eq('user_id', userId)
      .in('point_key', stale.map((s) => s.pointKey));
  }

  const staleKeys = new Set(stale.map((s) => s.pointKey));
  const known = new Set(existing.filter((s) => !staleKeys.has(s.pointKey)).map((s) => s.pointKey));
  const missing = points.filter((p) => !known.has(p.key));

  if (missing.length) {
    await supabase.from('purpose_point_state').insert(
      missing.map((p) => ({
        user_id: userId,
        point_key: p.key,
        kind,
        source: p.source,
        time_sensitive: p.timeSensitive,
        status: 'untouched',
        chart_version: chartVersion,
      })),
    );
  }

  return (await loadPointStates(userId)).filter((s) => s.kind === kind);
}

// ── Writes ───────────────────────────────────────────────────────────────────

/**
 * Record that a point was raised. Returns the check-in id the response will be
 * attached to, or null if the row could not be written — in which case the UI
 * must not pretend the conversation is being remembered.
 */
export async function openCheckin(
  userId: string,
  kind: PurposeKind,
  ledPointKey: string,
): Promise<string | null> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('purpose_checkins')
    .insert({ user_id: userId, kind, led_point_key: ledPointKey, opened_at: now })
    .select('id')
    .single();

  if (error || !data) return null;

  const current = (await loadPointStates(userId)).find((s) => s.pointKey === ledPointKey);
  await supabase
    .from('purpose_point_state')
    .update({ last_surfaced_at: now, surfaced_count: (current?.surfacedCount ?? 0) + 1, updated_at: now })
    .eq('user_id', userId)
    .eq('point_key', ledPointKey);

  return data.id as string;
}

export interface ResponseInput {
  userId: string;
  checkinId: string;
  kind: PurposeKind;
  ledPointKey: string;
  /** Set when the reader picked a different point than the one offered. */
  chosenPointKey?: string | null;
  outcome: CheckinOutcome;
  /** Their own words — quoted back at the start of the next check-in. */
  message?: string | null;
  register: Register;
}

/**
 * Save a response: the check-in row, the affected point state(s), and the next
 * cadence. Any response at all resets the ignored counter, so the cadence only
 * widens for genuine silence.
 */
export async function recordResponse(input: ResponseInput): Promise<boolean> {
  const supabase = createClient();
  const now = new Date();
  const nowIso = now.toISOString();
  const chosen = input.chosenPointKey && input.chosenPointKey !== input.ledPointKey
    ? input.chosenPointKey
    : null;
  const effectiveKey = chosen ?? input.ledPointKey;

  const { error: checkinError } = await supabase
    .from('purpose_checkins')
    .update({
      outcome: input.outcome,
      user_message: input.message ?? null,
      chosen_point_key: chosen,
      responded_at: nowIso,
    })
    .eq('id', input.checkinId)
    .eq('user_id', input.userId);

  if (checkinError) return false;

  const states = await loadPointStates(input.userId);
  const target = states.find((s) => s.pointKey === effectiveKey);

  if (target) {
    const confirmed = input.outcome === 'confirmed';
    const { error } = await supabase
      .from('purpose_point_state')
      .update({
        status: nextStatus(target.status, input.outcome, target.confirmedCount),
        confirmed_count: target.confirmedCount + (confirmed ? 1 : 0),
        last_response_at: nowIso,
        user_note: input.message?.trim() ? input.message.trim() : target.userNote,
        updated_at: nowIso,
      })
      .eq('user_id', input.userId)
      .eq('point_key', effectiveKey);
    if (error) return false;
  }

  // The point that was offered but passed over goes quiet rather than staying
  // live — otherwise it competes with the one they actually chose.
  if (chosen) {
    const led = states.find((s) => s.pointKey === input.ledPointKey);
    if (led) {
      await supabase
        .from('purpose_point_state')
        .update({ status: nextStatus(led.status, 'switched', led.confirmedCount), updated_at: nowIso })
        .eq('user_id', input.userId)
        .eq('point_key', input.ledPointKey);
    }
  }

  const history = await loadRecentCheckins(input.userId);
  const learned = learnRegister(input.register, history);
  const cadence = nextCadenceDays(0); // any response resets the widening

  const { error: prefsError } = await supabase.from('purpose_checkin_prefs').upsert(
    {
      user_id: input.userId,
      cadence_days: cadence,
      next_due_at: dueAt(now, cadence).toISOString(),
      last_kind: input.kind,
      register: learned.register,
      register_source: learned.source,
      consecutive_ignored: 0,
      updated_at: nowIso,
    },
    { onConflict: 'user_id' },
  );

  return !prefsError;
}

/**
 * Called when a due check-in went unanswered. Widens the cadence — the app gets
 * quieter when ignored, never louder.
 */
export async function recordSilence(userId: string, prefs: CheckinPrefs): Promise<void> {
  const supabase = createClient();
  const ignored = prefs.consecutiveIgnored + 1;
  const cadence = nextCadenceDays(ignored);
  const now = new Date();

  await supabase.from('purpose_checkin_prefs').upsert(
    {
      user_id: userId,
      cadence_days: cadence,
      next_due_at: dueAt(now, cadence).toISOString(),
      consecutive_ignored: ignored,
      updated_at: now.toISOString(),
    },
    { onConflict: 'user_id' },
  );
}

export async function setPaused(userId: string, paused: boolean): Promise<void> {
  const supabase = createClient();
  await supabase.from('purpose_checkin_prefs').upsert(
    { user_id: userId, paused, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  );
}

/**
 * Save the reader's answer to "is your birth time exact, or the family-story
 * version?". Lives on profiles so every house-dependent feature can use it, not
 * just this one.
 */
export async function saveTimeConfidence(userId: string, value: TimeConfidence): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ time_confidence: value })
    .eq('id', userId);
  return !error;
}
