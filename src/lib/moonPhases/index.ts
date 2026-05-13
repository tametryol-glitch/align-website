/**
 * Moon Phases Service Layer -- Barrel Export
 *
 * Re-exports everything from the moonPhases service modules for
 * convenient single-import access throughout the web app.
 */

// Current moon state (client-side ephemeris + backend-sourced)
export {
  getCurrentMoonState,
  getNextPhase,
  getCountdownParts,
  buildMoonStateFromBackend,
  buildUpcomingPhaseFromBackend,
  type CurrentMoonState,
  type UpcomingPhase,
  type MajorPhaseKey,
  type PhaseBucket,
  type CountdownParts,
  type BackendUpcomingMoonPhasesResponse,
} from './currentMoonService';

// Impact scoring engine
export {
  computeImpact,
  type LunarEvent,
  type LunarEventType,
  type EclipseSubtype,
  type ImpactScore,
  type ImpactBand,
  type ImpactContribution,
  type ContributionKind,
  type ComputeImpactOpts,
} from './impactScore';

// Event interpretation generator
export {
  buildEventInterpretation,
  type EventInterpretation,
} from './eventInterpretation';

// Calendar service (monthly calendar with enrichment)
export {
  getCalendarMonth,
  shiftMonth,
  type CalendarMonth,
  type CalendarDay,
  type CalendarEvent,
  type CalendarEclipse,
  type CalendarEclipseRecord,
  type DayPhaseEvent,
  type DayEclipse,
} from './calendarService';

// Forecast service (multi-month forecast)
export {
  getForecast,
  sortForecast,
  rangeWindowDays,
  rangeWindowMs,
  type ForecastEvent,
  type ForecastRange,
  type ForecastSort,
} from './forecastService';

// Eclipse service
export {
  getUpcomingEclipses,
  type EclipseEvent,
} from './eclipseService';

// Natal moon phase calculation
export {
  calculateNatalMoonPhase,
  LUNAR_PHASE_ORDER,
  type NatalMoonPhase,
  type LunarPhaseKey,
} from './natalMoonPhase';

// Natal moon phase content library
export {
  buildNatalPhaseReading,
  type NatalPhaseReading,
} from './natalMoonPhaseContent';

// ── Compatibility aliases ─────────────────────────────────────────────────
// Some existing components were written expecting these names. They map
// directly to the canonical exports above.

import { getCurrentMoonState, type CurrentMoonState } from './currentMoonService';
import { computeImpact, type LunarEvent } from './impactScore';
import { buildEventInterpretation } from './eventInterpretation';

/** @deprecated Use getCurrentMoonState instead */
export const computeCurrentMoonState = getCurrentMoonState;

/** @deprecated Use CurrentMoonState instead */
export type MoonState = CurrentMoonState;

/** @deprecated Use computeImpact instead */
export const computeImpactScore = computeImpact;

/**
 * Simplified interpretation generator for components that don't have a
 * full LunarEvent + ImpactScore handy. Builds a minimal event and score
 * and returns just the summary + leanInto + watchFor.
 *
 * @deprecated Use buildEventInterpretation with a full LunarEvent + ImpactScore instead.
 */
export function generateInterpretation(
  phaseKey: string,
  moonSign: string,
): { summary: string; leanInto: string; watchFor: string } | null {
  try {
    const event: LunarEvent = {
      type: phaseKey as LunarEvent['type'],
      date: new Date(),
      sunLon: 0,
      moonLon: 0,
    };
    const dummyImpact = computeImpact(event, null);
    return buildEventInterpretation(event, dummyImpact, moonSign);
  } catch {
    return null;
  }
}
