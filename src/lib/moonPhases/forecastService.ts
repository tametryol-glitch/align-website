/**
 * Forecast Service
 *
 * Produces a personalized forecast of upcoming major lunar events over a
 * chosen window (30 days / 3 months / 6 months / 12 months). Astronomy is
 * sourced from the backend Swiss Ephemeris via `/transits/forecasts/events`;
 * each event is scored against the user's natal chart via `computeImpact`
 * and given a predictive interpretation via `buildEventInterpretation`.
 *
 * The client handles impact scoring + interpretation because they depend on
 * the user's chart and are pure logic, not astronomy.
 *
 * Ported from align-app for web use. No React Native dependencies.
 */

import { api } from '@/lib/api';
import type { UpcomingPhase } from './currentMoonService';
import {
  computeImpact,
  type ImpactScore,
  type LunarEvent,
} from './impactScore';
import {
  buildEventInterpretation,
  type EventInterpretation,
} from './eventInterpretation';
import type { NatalChart } from '@/lib/engines/types';

export type ForecastRange = '30d' | '3m' | '6m' | '12m';

export interface ForecastEvent {
  phase: UpcomingPhase;
  event: LunarEvent;
  impact: ImpactScore;
  interpretation: EventInterpretation;
}

export type ForecastSort = 'date' | 'impact';

const MAJOR_PHASE_META: Record<'new' | 'first_quarter' | 'full' | 'last_quarter',
  { name: string; emoji: string }> = {
  new:           { name: 'New Moon',      emoji: '🌑' },
  first_quarter: { name: 'First Quarter', emoji: '🌓' },
  full:          { name: 'Full Moon',     emoji: '🌕' },
  last_quarter:  { name: 'Last Quarter',  emoji: '🌗' },
};

interface BackendPhaseEvent {
  key: 'new' | 'first_quarter' | 'full' | 'last_quarter';
  name: string;
  date: string;
  sun_longitude: number;
  moon_longitude: number;
  moon_sign: string;
  moon_sign_degree: number;
}

interface BackendForecastResponse {
  start_date: string;
  until_date: string;
  phase_events: BackendPhaseEvent[];
  eclipse_events?: unknown[];
}

/**
 * Convert a range key to its horizon in days, which is what the backend
 * takes. The client keeps the range bucket names so the UI stays stable.
 */
export function rangeWindowDays(range: ForecastRange): number {
  switch (range) {
    case '30d': return 30;
    case '3m':  return 90;
    case '6m':  return 182;
    case '12m': return 365;
  }
}

/** Kept for backward compatibility -- some callers still read this shape. */
export function rangeWindowMs(range: ForecastRange): number {
  return rangeWindowDays(range) * 86400_000;
}

function upcomingPhaseFromBackend(ev: BackendPhaseEvent, from: Date): UpcomingPhase {
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
    msUntil: date.getTime() - from.getTime(),
  };
}

/**
 * Fetch the forecast from the backend and enrich each event with personal
 * impact + interpretation. Returns events that fall within [from, from + range].
 *
 * When the natal chart is null, events still return with score 0 and a
 * generic interpretation -- the UI can decide whether to render a muted
 * "add your birth data to personalize" banner.
 */
export async function getForecast(
  range: ForecastRange,
  natalChart: NatalChart | null | undefined,
  from: Date = new Date(),
): Promise<ForecastEvent[]> {
  const windowDays = rangeWindowDays(range);
  const startDate = from.toISOString().split('T')[0];
  const resp: BackendForecastResponse =
    await api.getForecastEvents(windowDays, startDate);

  const out: ForecastEvent[] = [];
  for (const raw of resp.phase_events ?? []) {
    const phase = upcomingPhaseFromBackend(raw, from);
    const event: LunarEvent = {
      type: phase.key,
      date: phase.date,
      sunLon: phase.sunLon,
      moonLon: phase.moonLon,
    };
    const impact = computeImpact(event, natalChart ?? null);
    const interpretation = buildEventInterpretation(event, impact, phase.moonSign);
    out.push({ phase, event, impact, interpretation });
  }
  return out;
}

/**
 * Sort a forecast list in place-safe fashion (returns a new array) by the
 * chosen criterion. Date-sorted is ascending; impact-sorted is descending
 * (biggest events first) with date as a tiebreaker.
 */
export function sortForecast(events: ForecastEvent[], by: ForecastSort): ForecastEvent[] {
  const copy = events.slice();
  if (by === 'date') {
    copy.sort((a, b) => a.phase.date.getTime() - b.phase.date.getTime());
  } else {
    copy.sort((a, b) => {
      if (b.impact.score !== a.impact.score) return b.impact.score - a.impact.score;
      return a.phase.date.getTime() - b.phase.date.getTime();
    });
  }
  return copy;
}

// Exposed for tests / debugging.
export const __internals = {
  rangeWindowDays,
  upcomingPhaseFromBackend,
};
