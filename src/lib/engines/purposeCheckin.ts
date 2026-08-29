/**
 * Purpose Check-In — the state model behind the biweekly conversation.
 *
 * The bot leads with ONE purpose point per cycle, records what the reader said,
 * and quotes it back next time. Everything here is PURE (no supabase, no fetch,
 * no Date.now()) so it is unit-testable and ports to mobile unchanged; the
 * persistence and chat layers sit on top.
 *
 * Design rules encoded here, in priority order:
 *   1. Never lead with a `filler` point — it reads as the generic horoscope the
 *      whole feature exists to beat.
 *   2. Never build a months-long commitment on a point a wrong birth time would
 *      move (houses are Whole-Sign off the Ascendant SIGN, so they all shift
 *      together). Sign points are time-independent and always safe.
 *   3. Favour neglected points, but do not interrupt one that is currently live.
 *   4. A declined point is information, not failure — it comes back much later,
 *      never at the same weight.
 *   5. Silence widens the cadence. It never narrows on its own.
 *
 * @see purposePoints.ts for where a point's stable `key` comes from.
 */

import type { PurposePoint } from './purposePoints';

export type PointStatus = 'untouched' | 'live' | 'dormant' | 'declined' | 'lived';
export type CheckinOutcome = 'confirmed' | 'declined' | 'deferred' | 'switched' | 'no_response';
export type Register = 'directive' | 'collaborative' | 'autonomous';
export type TimeConfidence = 'exact' | 'approximate' | 'unknown';
export type PurposeKind = 'earthly' | 'soul';

/** Confirmations before a point is considered lived rather than merely live. */
export const LIVED_THRESHOLD = 3;

/** The default rhythm. Silence widens it; nothing narrows it automatically. */
export const BASE_CADENCE_DAYS = 14;

export interface PurposePointState {
  pointKey: string;
  kind: PurposeKind;
  source: PurposePoint['source'];
  timeSensitive: boolean;
  status: PointStatus;
  lastSurfacedAt: string | null;
  lastResponseAt: string | null;
  surfacedCount: number;
  confirmedCount: number;
  /** The reader's own words from the last check-in on this point. */
  userNote: string | null;
  chartVersion: string | null;
}

export interface CheckinRecord {
  kind: PurposeKind;
  ledPointKey: string;
  chosenPointKey: string | null;
  outcome: CheckinOutcome | null;
}

// ── Chart fingerprint ────────────────────────────────────────────────────────

/**
 * An opaque fingerprint of the birth data a point was derived from.
 *
 * Stored instead of the birth data itself so no new table carries dates, times
 * or coordinates. It exists only to detect CHANGE — when it differs, the
 * house-anchored state is archived rather than quoted back as if still true.
 */
export function chartVersion(input: {
  birthDate?: string | null;
  birthTime?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}): string {
  const raw = [
    input.birthDate ?? '',
    input.birthTime ?? '',
    input.latitude == null ? '' : input.latitude.toFixed(4),
    input.longitude == null ? '' : input.longitude.toFixed(4),
  ].join('|');
  // FNV-1a, 32-bit. Not a security hash — a change detector.
  let h = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/**
 * Which stored points must be archived after a birth-data correction.
 *
 * Only time-sensitive (house-anchored) points move: a wrong rising sign shifts
 * every house together. Sign and filler points keep their meaning, so their
 * history — and the reader's own words — survive the correction.
 */
export function pointsToArchive(states: PurposePointState[], currentVersion: string): PurposePointState[] {
  return states.filter(
    (s) => s.timeSensitive && s.chartVersion != null && s.chartVersion !== currentVersion,
  );
}

// ── Selection ────────────────────────────────────────────────────────────────

const STATUS_WEIGHT: Record<PointStatus, number> = {
  untouched: 100,
  dormant: 70,
  live: 40,
  lived: 20,
  declined: 5,
};

const SOURCE_WEIGHT: Record<PurposePoint['source'], number> = {
  house: 10,
  sign: 8,
  filler: -60, // reachable only when nothing else is
};

const DAY_MS = 86_400_000;

const daysBetween = (from: string, to: Date): number =>
  Math.max(0, (to.getTime() - new Date(from).getTime()) / DAY_MS);

export interface SelectionInput {
  points: PurposePoint[];
  states: PurposePointState[];
  timeConfidence: TimeConfidence;
  now: Date;
  cadenceDays?: number;
}

export interface Selection {
  point: PurposePoint;
  state: PurposePointState | null;
  score: number;
  /** The other points, best first — what the reader gets offered a choice from. */
  alternatives: PurposePoint[];
}

/**
 * Score one point. Higher leads. Returns null when the point must not be
 * surfaced at all this cycle.
 */
export function scorePoint(
  point: PurposePoint,
  state: PurposePointState | null,
  timeConfidence: TimeConfidence,
  now: Date,
  cadenceDays: number,
): number | null {
  // Rule 2, hard case: with no usable birth time, a house point is not just
  // unstable later — it is unreliable now.
  if (point.timeSensitive && timeConfidence === 'unknown') return null;

  let score = STATUS_WEIGHT[state?.status ?? 'untouched'] + SOURCE_WEIGHT[point.source];

  if (point.timeSensitive && timeConfidence === 'approximate') score -= 25;

  if (!state?.lastSurfacedAt) {
    score += 20; // never raised — the point of the rotation
  } else {
    const days = daysBetween(state.lastSurfacedAt, now);
    // Rule 3: do not raise the same point again inside one cycle.
    if (days < cadenceDays) score -= 80;
    else score += Math.min(20, (days / cadenceDays) * 5);
  }

  // A declined point stays quiet for a good while longer than one cycle.
  if (state?.status === 'declined' && state.lastResponseAt) {
    if (daysBetween(state.lastResponseAt, now) < cadenceDays * 4) return null;
  }

  return score;
}

/**
 * Pick the point to lead with this cycle, plus the alternatives to offer.
 * Deterministic: ties break on the stable key, never on randomness.
 */
export function selectNextPoint(input: SelectionInput): Selection | null {
  const { points, states, timeConfidence, now } = input;
  const cadenceDays = input.cadenceDays ?? BASE_CADENCE_DAYS;
  const byKey = new Map(states.map((s) => [s.pointKey, s]));

  const scored = points
    .map((point) => {
      const state = byKey.get(point.key) ?? null;
      const score = scorePoint(point, state, timeConfidence, now, cadenceDays);
      return score == null ? null : { point, state, score };
    })
    .filter((x): x is { point: PurposePoint; state: PurposePointState | null; score: number } => x !== null)
    .sort((a, b) => (b.score - a.score) || a.point.key.localeCompare(b.point.key));

  if (!scored.length) return null;

  return {
    point: scored[0].point,
    state: scored[0].state,
    score: scored[0].score,
    alternatives: scored.slice(1, 4).map((s) => s.point),
  };
}

/** Tracks alternate, so each gets touched monthly instead of one blurred list. */
export function nextTrack(lastKind: PurposeKind | null): PurposeKind {
  return lastKind === 'earthly' ? 'soul' : 'earthly';
}

// ── Outcomes ─────────────────────────────────────────────────────────────────

/**
 * Where a point lands after a check-in.
 *
 * Note `confirmed` does NOT retire a point: saying "yes I'm on it" must not work
 * as a dismiss button, or readers learn the magic word and the feature dies
 * while still looking healthy. It stays live and comes back — the chat layer is
 * what charges one specific follow-up question for the acknowledgement.
 */
export function nextStatus(current: PointStatus, outcome: CheckinOutcome, confirmedCount: number): PointStatus {
  switch (outcome) {
    case 'confirmed':
      return confirmedCount + 1 >= LIVED_THRESHOLD ? 'lived' : 'live';
    case 'declined':
      return 'declined';
    case 'switched':
    case 'no_response':
      return current === 'live' ? 'dormant' : current;
    case 'deferred':
    default:
      return current;
  }
}

/**
 * The next cadence. Being ignored makes the app quieter, never louder — the
 * opposite of what a reminder system usually does, and the reason this can sit
 * on a "purpose" topic without turning into a shame loop.
 */
export function nextCadenceDays(consecutiveIgnored: number): number {
  if (consecutiveIgnored >= 3) return 45;
  if (consecutiveIgnored === 2) return 30;
  return BASE_CADENCE_DAYS;
}

export function dueAt(from: Date, cadenceDays: number): Date {
  return new Date(from.getTime() + cadenceDays * DAY_MS);
}

// ── Register: how the bot opens ──────────────────────────────────────────────

const CARDINAL = new Set(['Aries', 'Cancer', 'Libra', 'Capricorn']);
const FIXED = new Set(['Taurus', 'Leo', 'Scorpio', 'Aquarius']);
const MUTABLE = new Set(['Gemini', 'Virgo', 'Sagittarius', 'Pisces']);

/**
 * A PRIOR on how the reader likes to be approached — never a verdict.
 *
 * Predicting "this person likes being told what to do" from a chart is a claim
 * about a real human, and the cost of being wrong is asymmetric: wrongly
 * directive reads as a boss, wrongly deferential just reads as gentle. So this
 * only sets the opening register, and `learnRegister` overrides it from actual
 * behaviour within two or three check-ins.
 */
export function inferRegister(signs: {
  sun?: string | null;
  moon?: string | null;
  mercury?: string | null;
  mars?: string | null;
  ascendant?: string | null;
}): Register {
  let cardinal = 0;
  let fixed = 0;
  let mutable = 0;
  for (const sign of [signs.sun, signs.moon, signs.mercury, signs.mars, signs.ascendant]) {
    if (!sign) continue;
    if (CARDINAL.has(sign)) cardinal++;
    else if (FIXED.has(sign)) fixed++;
    else if (MUTABLE.has(sign)) mutable++;
  }
  // Fixed wants one clear thing; mutable enjoys options; cardinal wants the
  // call to be theirs. Ties fall to the safest default — offering a choice.
  if (fixed > cardinal && fixed > mutable) return 'directive';
  if (cardinal > fixed && cardinal > mutable) return 'autonomous';
  return 'collaborative';
}

export interface LearnedRegister {
  register: Register;
  source: 'chart' | 'observed';
}

/**
 * Behaviour outranks the natal prior after two or three interactions: if they
 * keep picking their own point, stop proposing; if they keep taking the lead,
 * keep leading.
 */
export function learnRegister(prior: Register, history: CheckinRecord[]): LearnedRegister {
  let choseOwn = 0;
  let tookLead = 0;
  for (const h of history) {
    if (h.outcome === 'switched' || (h.chosenPointKey && h.chosenPointKey !== h.ledPointKey)) choseOwn++;
    else if (h.outcome === 'confirmed') tookLead++;
  }
  if (choseOwn >= 2) return { register: 'autonomous', source: 'observed' };
  if (tookLead >= 2) return { register: 'directive', source: 'observed' };
  return { register: prior, source: 'chart' };
}
