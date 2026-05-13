/**
 * Current Moon Service
 *
 * Computes everything a "real-time" snapshot of the Moon needs:
 * current phase, sign, illumination, age, next major phase boundary
 * (new / first quarter / full / last quarter), and the countdown to it.
 *
 * Fully client-side. Uses mean-element ephemeris -- accuracy is within
 * ~1 degree for the Moon, which is more than enough for phase display.
 * Next-phase timing is refined with Newton's method; real-world accuracy
 * is within a few hours of Swiss Ephemeris.
 *
 * Also includes buildMoonStateFromBackend() and buildUpcomingPhaseFromBackend()
 * for reconstructing state from Swiss Ephemeris backend responses.
 *
 * Ported from align-app for web use. No React Native dependencies.
 */

import type { LunarPhaseKey } from './natalMoonPhase';

// ── Inline ephemeris (Sun + Moon mean-element positions) ────────────────────
// Replaces the mobile's transitCalc.getApproxLongitude for the two bodies
// this service needs. Accuracy: ~1 degree for Moon, sub-degree for Sun.

const PLANET_DATA: Record<string, { epoch_lon: number; daily_motion: number }> = {
  Sun:  { epoch_lon: 280.368166, daily_motion: 0.985600 },
  Moon: { epoch_lon: 223.314870, daily_motion: 13.176358 },
};

const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);

function getApproxLongitude(planet: string, date: Date): number {
  const data = PLANET_DATA[planet];
  if (!data) return 0;
  const daysSinceEpoch = (date.getTime() - J2000) / 86400000;
  let lon = (data.epoch_lon + data.daily_motion * daysSinceEpoch) % 360;
  if (lon < 0) lon += 360;
  return ((lon % 360) + 360) % 360;
}

// ── Constants ─────────────────────────────────────────────────────────────

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

// ── Public types ──────────────────────────────────────────────────────────

export interface PhaseBucket {
  key: LunarPhaseKey;
  name: string;
  emoji: string;
}

export interface CurrentMoonState {
  /** Moment these values describe. Caller should treat as authoritative. */
  at: Date;
  /** Ecliptic longitude of the Sun, 0..360. */
  sunLon: number;
  /** Ecliptic longitude of the Moon, 0..360. */
  moonLon: number;
  /** Sign the Moon is currently in. */
  moonSign: string;
  /** Degree within the current sign, 0..30. */
  moonDegreeInSign: number;
  /** Angular distance Moon is ahead of Sun, 0..360. */
  elongation: number;
  /** Fraction of the lunar face lit, 0..1. */
  illumination: number;
  /** Which of the 8 Rudhyar phases the Moon is currently in. */
  phase: PhaseBucket;
  /** True between new and full moon, false from full to next new. */
  waxing: boolean;
  /** Days since the most recent new moon (approximate, mean rate). */
  ageDays: number;
}

/** One of the four major phase boundaries; intermediate phases are NOT predicted. */
export type MajorPhaseKey = 'new' | 'first_quarter' | 'full' | 'last_quarter';

export interface UpcomingPhase {
  key: MajorPhaseKey;
  name: string;
  emoji: string;
  /** Moment the phase boundary is crossed. */
  date: Date;
  sunLon: number;
  moonLon: number;
  moonSign: string;
  moonDegreeInSign: number;
  /** Milliseconds from `from` argument (or now) to this event. */
  msUntil: number;
}

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  /** True if the target is in the past. */
  past: boolean;
}

// ── Internal constants ───────────────────────────────────────────────────

const MOON_DAILY_MOTION = 13.176358;
const SUN_DAILY_MOTION = 0.985600;
const MEAN_RELATIVE_MOTION = MOON_DAILY_MOTION - SUN_DAILY_MOTION; // ~12.19 deg/day
const MEAN_SYNODIC_MONTH_DAYS = 360 / MEAN_RELATIVE_MOTION;        // ~29.53

const PHASE_BUCKETS: { key: LunarPhaseKey; name: string; emoji: string; max: number }[] = [
  { key: 'new',              name: 'New Moon',            emoji: '🌑', max: 45 },
  { key: 'waxing_crescent',  name: 'Waxing Crescent',     emoji: '🌒', max: 90 },
  { key: 'first_quarter',    name: 'First Quarter',       emoji: '🌓', max: 135 },
  { key: 'waxing_gibbous',   name: 'Waxing Gibbous',      emoji: '🌔', max: 180 },
  { key: 'full',             name: 'Full Moon',           emoji: '🌕', max: 225 },
  { key: 'disseminating',    name: 'Disseminating Moon',  emoji: '🌖', max: 270 },
  { key: 'last_quarter',     name: 'Last Quarter',        emoji: '🌗', max: 315 },
  { key: 'balsamic',         name: 'Balsamic Moon',       emoji: '🌘', max: 360.0001 },
];

const MAJOR_PHASE_ORDER: { key: MajorPhaseKey; name: string; emoji: string; elongation: number }[] = [
  { key: 'new',            name: 'New Moon',      emoji: '🌑', elongation: 0   },
  { key: 'first_quarter',  name: 'First Quarter', emoji: '🌓', elongation: 90  },
  { key: 'full',           name: 'Full Moon',     emoji: '🌕', elongation: 180 },
  { key: 'last_quarter',   name: 'Last Quarter',  emoji: '🌗', elongation: 270 },
];

// ── Math helpers ──────────────────────────────────────────────────────────

function norm360(x: number): number {
  return ((x % 360) + 360) % 360;
}

function lonToSignInfo(lon: number): { sign: string; degree: number } {
  const n = norm360(lon);
  return { sign: SIGNS[Math.floor(n / 30) % 12], degree: n % 30 };
}

function illuminationFromElongation(elongation: number): number {
  const e = norm360(elongation);
  return (1 - Math.cos((e * Math.PI) / 180)) / 2;
}

function classifyElongation(elongation: number): PhaseBucket {
  const e = norm360(elongation);
  for (const b of PHASE_BUCKETS) {
    if (e < b.max) return { key: b.key, name: b.name, emoji: b.emoji };
  }
  return { key: PHASE_BUCKETS[0].key, name: PHASE_BUCKETS[0].name, emoji: PHASE_BUCKETS[0].emoji };
}

/** Elongation of Moon ahead of Sun at the given moment, 0..360. */
function elongationAt(date: Date): number {
  const sun = getApproxLongitude('Sun', date);
  const moon = getApproxLongitude('Moon', date);
  return norm360(moon - sun);
}

// ── Current state ─────────────────────────────────────────────────────────

export function getCurrentMoonState(now: Date = new Date()): CurrentMoonState {
  const sunLon = getApproxLongitude('Sun', now);
  const moonLon = getApproxLongitude('Moon', now);
  const elongation = norm360(moonLon - sunLon);
  const illumination = illuminationFromElongation(elongation);
  const phase = classifyElongation(elongation);
  const waxing = elongation < 180;
  const ageDays = elongation / MEAN_RELATIVE_MOTION;
  const { sign, degree } = lonToSignInfo(moonLon);

  return {
    at: new Date(now.getTime()),
    sunLon,
    moonLon,
    moonSign: sign,
    moonDegreeInSign: degree,
    elongation,
    illumination,
    phase,
    waxing,
    ageDays,
  };
}

// ── Next-phase prediction ─────────────────────────────────────────────────

/**
 * Given a target elongation (0, 90, 180, or 270) and a starting moment,
 * return the first Date at or after `start` where the Moon-Sun elongation
 * crosses that target.
 *
 * Strategy:
 *   1) First-guess time from mean relative motion.
 *   2) Refine with a few Newton iterations.
 *   3) If Newton is misbehaving, nudge forward by a day (defensive).
 */
function solveForElongation(target: number, start: Date, maxIter = 6): Date {
  const e0 = elongationAt(start);
  const forwardDeg = norm360(target - e0);
  const guessDays = forwardDeg === 0 ? MEAN_SYNODIC_MONTH_DAYS : forwardDeg / MEAN_RELATIVE_MOTION;

  let t = new Date(start.getTime() + guessDays * 86400000);
  for (let i = 0; i < maxIter; i++) {
    const e = elongationAt(t);
    let residual = target - e;
    if (residual > 180) residual -= 360;
    if (residual <= -180) residual += 360;
    if (Math.abs(residual) < 1e-4) break;

    const h = 1 / 24;
    const eAhead = elongationAt(new Date(t.getTime() + h * 86400000));
    let drate = eAhead - e;
    if (drate > 180) drate -= 360;
    if (drate <= -180) drate += 360;
    drate /= h;

    if (Math.abs(drate) < 0.1) {
      t = new Date(t.getTime() + 86400000);
      continue;
    }

    const correctionDays = residual / drate;
    t = new Date(t.getTime() + correctionDays * 86400000);
  }

  if (t.getTime() < start.getTime()) t = new Date(start.getTime());
  return t;
}

export function getNextPhase(after: Date = new Date()): UpcomingPhase {
  const currentE = elongationAt(after);
  let chosen = MAJOR_PHASE_ORDER[0];
  let minForward = Number.POSITIVE_INFINITY;
  for (const m of MAJOR_PHASE_ORDER) {
    const forward = ((m.elongation - currentE) % 360 + 360) % 360;
    const effective = forward === 0 ? 360 : forward;
    if (effective < minForward) {
      minForward = effective;
      chosen = m;
    }
  }

  const date = solveForElongation(chosen.elongation, after);
  const sunLon = getApproxLongitude('Sun', date);
  const moonLon = getApproxLongitude('Moon', date);
  const { sign, degree } = lonToSignInfo(moonLon);

  return {
    key: chosen.key,
    name: chosen.name,
    emoji: chosen.emoji,
    date,
    sunLon,
    moonLon,
    moonSign: sign,
    moonDegreeInSign: degree,
    msUntil: date.getTime() - after.getTime(),
  };
}

// ── Countdown utility ─────────────────────────────────────────────────────

export function getCountdownParts(target: Date, from: Date = new Date()): CountdownParts {
  const totalMs = target.getTime() - from.getTime();
  if (totalMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs, past: true };
  }
  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, totalMs, past: false };
}

// ── Backend-sourced current state ─────────────────────────────────────────

interface BackendMoonPhase {
  sun_longitude?: number;
  moon_longitude?: number;
  elongation?: number;
  illumination?: number;
  phase_key?: LunarPhaseKey;
  phase_name?: string;
  is_waxing?: boolean;
  age_days?: number;
}

interface BackendTransitsResponse {
  moon_phase?: BackendMoonPhase | null;
  transit_positions?: Array<{ name?: string; longitude?: number }>;
}

const PHASE_EMOJI: Record<LunarPhaseKey, string> = {
  new:              '🌑',
  waxing_crescent:  '🌒',
  first_quarter:    '🌓',
  waxing_gibbous:   '🌔',
  full:             '🌕',
  disseminating:    '🌖',
  last_quarter:     '🌗',
  balsamic:         '🌘',
};

export function buildMoonStateFromBackend(
  resp: BackendTransitsResponse | null | undefined,
  now: Date = new Date(),
): CurrentMoonState | null {
  const mp = resp?.moon_phase;
  if (!mp || mp.sun_longitude == null || mp.moon_longitude == null) return null;

  const sunLon = mp.sun_longitude;
  const moonLon = mp.moon_longitude;
  const elongation = mp.elongation ?? norm360(moonLon - sunLon);
  const illumination = mp.illumination ?? illuminationFromElongation(elongation);
  const phaseKey = (mp.phase_key ?? classifyElongation(elongation).key) as LunarPhaseKey;
  const phaseBucket = PHASE_BUCKETS.find((b) => b.key === phaseKey) ?? PHASE_BUCKETS[0];
  const phase: PhaseBucket = {
    key: phaseKey,
    name: mp.phase_name ?? phaseBucket.name,
    emoji: PHASE_EMOJI[phaseKey] ?? phaseBucket.emoji,
  };
  const waxing = mp.is_waxing ?? elongation < 180;
  const ageDays = mp.age_days ?? elongation / MEAN_RELATIVE_MOTION;
  const { sign, degree } = lonToSignInfo(moonLon);

  return {
    at: new Date(now.getTime()),
    sunLon,
    moonLon,
    moonSign: sign,
    moonDegreeInSign: degree,
    elongation,
    illumination,
    phase,
    waxing,
    ageDays,
  };
}

interface BackendUpcomingPhase {
  key?: string;
  name?: string;
  date?: string;
  sun_longitude?: number;
  moon_longitude?: number;
  moon_sign?: string;
  moon_sign_degree?: number;
}

export interface BackendUpcomingMoonPhasesResponse {
  events?: BackendUpcomingPhase[];
}

/**
 * Convert a single backend `/transits/upcoming-moon-phases` event into the
 * client's `UpcomingPhase` shape. Returns null if the event is missing or
 * malformed; caller should fall back to the client solver in that case.
 */
export function buildUpcomingPhaseFromBackend(
  ev: BackendUpcomingPhase | null | undefined,
  after: Date = new Date(),
): UpcomingPhase | null {
  if (!ev || !ev.key || !ev.date) return null;
  const date = new Date(ev.date);
  if (isNaN(date.getTime())) return null;
  const major = MAJOR_PHASE_ORDER.find((m) => m.key === ev.key);
  if (!major) return null;
  const sunLon = ev.sun_longitude ?? getApproxLongitude('Sun', date);
  const moonLon = ev.moon_longitude ?? getApproxLongitude('Moon', date);
  const moonSign = ev.moon_sign ?? lonToSignInfo(moonLon).sign;
  const moonDegreeInSign = ev.moon_sign_degree ?? lonToSignInfo(moonLon).degree;
  return {
    key: major.key,
    name: major.name,
    emoji: major.emoji,
    date,
    sunLon,
    moonLon,
    moonSign,
    moonDegreeInSign,
    msUntil: date.getTime() - after.getTime(),
  };
}

// Exposed for tests / debugging; do not import from UI code.
export const __internals = {
  norm360,
  lonToSignInfo,
  illuminationFromElongation,
  classifyElongation,
  elongationAt,
  solveForElongation,
  getApproxLongitude,
  MAJOR_PHASE_ORDER,
  MEAN_SYNODIC_MONTH_DAYS,
  MEAN_RELATIVE_MOTION,
};
