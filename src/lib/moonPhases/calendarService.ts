/**
 * Calendar Service
 *
 * Produces a full month's worth of lunar calendar data in one call:
 *   - a 5 or 6-week day grid (Sunday-start) covering the whole month plus
 *     leading/trailing days from adjacent months so the grid is visually complete
 *   - per-day moon state (phase bucket, sign, illumination) computed at noon UTC
 *   - which days carry a major phase boundary (new / first quarter / full / last quarter)
 *   - which days carry an eclipse
 *   - all scored + interpreted events for the month (ready to render in a detail sheet)
 *
 * Astronomy comes from the backend Swiss Ephemeris via `/transits/calendars/month`.
 * This service orchestrates the fetch and enriches each astronomy event with
 * natal-chart-specific impact scoring + interpretation (which remain client-side
 * because they depend on the user's chart and are pure logic, not astronomy).
 *
 * Ported from align-app for web use. No React Native dependencies.
 */

import { api } from '@/lib/api';
import type { LunarPhaseKey } from './natalMoonPhase';
import type { UpcomingPhase, PhaseBucket } from './currentMoonService';
import {
  computeImpact,
  type ImpactScore,
  type LunarEvent,
  type EclipseSubtype,
} from './impactScore';
import {
  buildEventInterpretation,
  type EventInterpretation,
} from './eventInterpretation';
import type { NatalChart } from '@/lib/engines/types';

// ── Public types ──────────────────────────────────────────────────────────

export interface CalendarDay {
  /** Noon UTC of this day -- used for per-day moon state. */
  date: Date;
  /** Day-of-month 1..31. */
  dayNum: number;
  /** Day-of-week 0..6 (Sunday = 0). */
  weekday: number;
  /** true only for days that belong to the displayed month. */
  inMonth: boolean;
  /** Current phase bucket at noon UTC of this day. */
  phase: PhaseBucket;
  /** Moon's sign at noon UTC of this day. */
  moonSign: string;
  /** Illumination 0..1 at noon UTC. */
  illumination: number;
  /** Populated when a major phase boundary falls on this day. */
  phaseEvent: DayPhaseEvent | null;
  /** Populated when an eclipse falls on this day. */
  eclipseEvent: DayEclipse | null;
}

export interface DayPhaseEvent {
  key: 'new' | 'first_quarter' | 'full' | 'last_quarter';
  name: string;
  emoji: string;
  /** Hour of day 0..23 when the boundary crosses. */
  atHour: number;
  /** The enriched event record, ready for a detail sheet. */
  enriched: CalendarEvent;
}

export interface DayEclipse {
  subtype: EclipseSubtype;
  name: string;
  nodeSide: 'north' | 'south';
  separation: number;
  /** The enriched eclipse record, ready for a detail sheet. */
  enriched: CalendarEclipse;
}

export interface CalendarEvent {
  phase: UpcomingPhase;
  event: LunarEvent;
  impact: ImpactScore;
  interpretation: EventInterpretation;
}

export interface CalendarEclipseRecord extends LunarEvent {
  type: 'eclipse';
  subtype: EclipseSubtype;
  nodeLon: number;
  nodeSide: 'north' | 'south';
  sunNodeSeparation: number;
  moonSign: string;
  moonDegreeInSign: number;
  phaseKey: 'new' | 'full';
  name: string;
  influenceStart: Date;
  peak: Date;
  influenceEnd: Date;
}

export interface CalendarEclipse {
  eclipse: CalendarEclipseRecord;
  event: LunarEvent;
  impact: ImpactScore;
  interpretation: EventInterpretation;
}

export interface CalendarMonth {
  year: number;
  /** 1..12 (January = 1). */
  month: number;
  /** Human label e.g. "April 2026". */
  label: string;
  /** Complete grid of 35 or 42 days, Sunday-start. */
  days: CalendarDay[];
  /** All major phase events in this month (in chronological order). */
  events: CalendarEvent[];
  /** All eclipses in this month (in chronological order). */
  eclipses: CalendarEclipse[];
}

// ── Phase bucket table (mirrors currentMoonService) ───────────────────────

const PHASE_BUCKETS: Record<LunarPhaseKey, { name: string; emoji: string }> = {
  new:              { name: 'New Moon',           emoji: '🌑' },
  waxing_crescent:  { name: 'Waxing Crescent',    emoji: '🌒' },
  first_quarter:    { name: 'First Quarter',      emoji: '🌓' },
  waxing_gibbous:   { name: 'Waxing Gibbous',     emoji: '🌔' },
  full:             { name: 'Full Moon',          emoji: '🌕' },
  disseminating:    { name: 'Disseminating Moon', emoji: '🌖' },
  last_quarter:     { name: 'Last Quarter',       emoji: '🌗' },
  balsamic:         { name: 'Balsamic Moon',      emoji: '🌘' },
};

const MAJOR_PHASE_META: Record<'new' | 'first_quarter' | 'full' | 'last_quarter',
  { name: string; emoji: string }> = {
  new:           { name: 'New Moon',      emoji: '🌑' },
  first_quarter: { name: 'First Quarter', emoji: '🌓' },
  full:          { name: 'Full Moon',     emoji: '🌕' },
  last_quarter:  { name: 'Last Quarter',  emoji: '🌗' },
};

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const INFLUENCE_WINDOW_DAYS = 21;

// ── Backend response types ────────────────────────────────────────────────

interface BackendDay {
  date: string;           // YYYY-MM-DD
  day_num: number;
  weekday: number;
  in_month: boolean;
  phase_key: LunarPhaseKey;
  phase_name: string;
  moon_sign: string;
  illumination: number;
}

interface BackendPhaseEvent {
  key: 'new' | 'first_quarter' | 'full' | 'last_quarter';
  name: string;
  date: string;
  sun_longitude: number;
  moon_longitude: number;
  moon_sign: string;
  moon_sign_degree: number;
}

interface BackendEclipseEvent {
  subtype: EclipseSubtype;
  name: string;
  date: string;
  sun_longitude: number;
  moon_longitude: number;
  node_longitude: number;
  node_side: 'north' | 'south';
  separation: number;
  moon_sign: string;
  moon_sign_degree: number;
  phase_key: 'new' | 'full';
  influence_start: string;
  peak: string;
  influence_end: string;
}

interface BackendMonthResponse {
  year: number;
  month: number;
  label: string;
  grid_start: string;
  grid_end: string;
  days: BackendDay[];
  phase_events: BackendPhaseEvent[];
  eclipse_events: BackendEclipseEvent[];
}

// ── Enrichment helpers ────────────────────────────────────────────────────

function noonUtcFromIso(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00Z`);
}

function upcomingPhaseFromBackend(ev: BackendPhaseEvent): UpcomingPhase {
  const date = new Date(ev.date);
  const meta = MAJOR_PHASE_META[ev.key];
  return {
    key: ev.key,
    name: meta.name,
    emoji: meta.emoji,
    date,
    sunLon: ev.sun_longitude,
    moonLon: ev.moon_longitude,
    moonSign: ev.moon_sign,
    moonDegreeInSign: ev.moon_sign_degree,
    msUntil: 0,
  };
}

function eclipseRecordFromBackend(ev: BackendEclipseEvent): CalendarEclipseRecord {
  const peak = new Date(ev.peak);
  return {
    type: 'eclipse',
    subtype: ev.subtype,
    date: peak,
    sunLon: ev.sun_longitude,
    moonLon: ev.moon_longitude,
    nodeLon: ev.node_longitude,
    nodeSide: ev.node_side,
    sunNodeSeparation: ev.separation,
    moonSign: ev.moon_sign,
    moonDegreeInSign: ev.moon_sign_degree,
    phaseKey: ev.phase_key,
    name: ev.name,
    influenceStart: new Date(ev.influence_start),
    peak,
    influenceEnd: new Date(ev.influence_end),
  };
}

function enrichPhase(phase: UpcomingPhase, natal: NatalChart | null): CalendarEvent {
  const event: LunarEvent = {
    type: phase.key,
    date: phase.date,
    sunLon: phase.sunLon,
    moonLon: phase.moonLon,
  };
  const impact = computeImpact(event, natal);
  const interpretation = buildEventInterpretation(event, impact, phase.moonSign);
  return { phase, event, impact, interpretation };
}

function enrichEclipse(e: CalendarEclipseRecord, natal: NatalChart | null): CalendarEclipse {
  const event: LunarEvent = {
    type: 'eclipse',
    subtype: e.subtype,
    date: e.date,
    sunLon: e.sunLon,
    moonLon: e.moonLon,
    nodeLon: e.nodeLon,
    nodeSide: e.nodeSide,
  };
  const impact = computeImpact(event, natal);
  const interpretation = buildEventInterpretation(event, impact, e.moonSign);
  return { eclipse: e, event, impact, interpretation };
}

function sameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function bucketFromKey(key: LunarPhaseKey): PhaseBucket {
  const meta = PHASE_BUCKETS[key] ?? PHASE_BUCKETS.new;
  return { key, name: meta.name, emoji: meta.emoji };
}

// ── Main entry ────────────────────────────────────────────────────────────

/**
 * Build a complete calendar month view from the backend.
 *
 * @param year   Four-digit year (e.g. 2026).
 * @param month  1..12 (January = 1).
 * @param natal  User's natal chart, or null for non-personalized events.
 */
export async function getCalendarMonth(
  year: number,
  month: number,
  natal: NatalChart | null | undefined,
): Promise<CalendarMonth> {
  // Web API uses getMonthlyCalendar with POST { year, month }
  const resp: BackendMonthResponse = await api.getMonthlyCalendar({ year, month });

  const enrichedPhases = resp.phase_events.map((p) =>
    enrichPhase(upcomingPhaseFromBackend(p), natal ?? null),
  );
  const enrichedEclipses = (resp.eclipse_events ?? []).map((e) =>
    enrichEclipse(eclipseRecordFromBackend(e), natal ?? null),
  );

  const days: CalendarDay[] = resp.days.map((d) => {
    const dayNoon = noonUtcFromIso(d.date);
    const phaseMatch = enrichedPhases.find((p) => sameUtcDay(p.phase.date, dayNoon));
    const eclipseMatch = enrichedEclipses.find((e) => sameUtcDay(e.eclipse.date, dayNoon));
    return {
      date: dayNoon,
      dayNum: d.day_num,
      weekday: d.weekday,
      inMonth: d.in_month,
      phase: bucketFromKey(d.phase_key),
      moonSign: d.moon_sign,
      illumination: d.illumination,
      phaseEvent: phaseMatch
        ? {
            key: phaseMatch.phase.key,
            name: phaseMatch.phase.name,
            emoji: phaseMatch.phase.emoji,
            atHour: phaseMatch.phase.date.getUTCHours(),
            enriched: phaseMatch,
          }
        : null,
      eclipseEvent: eclipseMatch
        ? {
            subtype: eclipseMatch.eclipse.subtype,
            name: eclipseMatch.eclipse.name,
            nodeSide: eclipseMatch.eclipse.nodeSide,
            separation: eclipseMatch.eclipse.sunNodeSeparation,
            enriched: eclipseMatch,
          }
        : null,
    };
  });

  const month0 = month - 1;
  const inThisMonth = (d: Date) =>
    d.getUTCFullYear() === year && d.getUTCMonth() === month0;
  const events = enrichedPhases.filter((p) => inThisMonth(p.phase.date));
  const eclipses = enrichedEclipses.filter((e) => inThisMonth(e.eclipse.date));

  return {
    year,
    month,
    label: resp.label,
    days,
    events,
    eclipses,
  };
}

/**
 * Navigate relative to a (year, month). Wraps December->January correctly.
 */
export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const total = year * 12 + (month - 1) + delta;
  const newYear = Math.floor(total / 12);
  const newMonth = (total % 12) + 1;
  return { year: newYear, month: newMonth };
}

// Exposed for tests / debugging.
export const __internals = {
  noonUtcFromIso,
  sameUtcDay,
  bucketFromKey,
  upcomingPhaseFromBackend,
  eclipseRecordFromBackend,
  enrichPhase,
  enrichEclipse,
  SIGNS,
  INFLUENCE_WINDOW_DAYS,
};
