// ── Planetary Hours Calculation Engine ──
// Ported from mobile galacticClockUtils.ts + planetaryHoursCalc.ts
// Pure TypeScript, no external dependencies

import {
  RULERS,
  CYCLE_DAYS,
  CUSTOM_CYCLE_EPOCH,
  TOTAL_RULERS,
} from './constants';

import type {
  RulerName,
  GalacticDayName,
  SunTimes,
  HourSegment,
  PlanetaryHoursResult,
  PlanetaryHourSlot,
} from './types';

import type { CycleDayName } from './constants';

// ══════════════════════════════════════════════════════════════
// ── Helpers
// ══════════════════════════════════════════════════════════════

/** Number of full days between the epoch and the given date (local midnight). */
function daysSinceEpoch(date: Date): number {
  const epochMidnight = new Date(
    CUSTOM_CYCLE_EPOCH.getFullYear(),
    CUSTOM_CYCLE_EPOCH.getMonth(),
    CUSTOM_CYCLE_EPOCH.getDate(),
  );
  const dateMidnight = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  return Math.floor((dateMidnight.getTime() - epochMidnight.getTime()) / 86400000);
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/** Day of year (1-based). */
function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

// ══════════════════════════════════════════════════════════════
// ── Sun Times Calculation
// ══════════════════════════════════════════════════════════════

/**
 * Calculate approximate sunrise and sunset for a given date and location.
 * Uses the standard solar calculation algorithm with equation of time correction.
 */
export function calculateSunTimes(date: Date, latitude: number, longitude: number): SunTimes {
  const doy = dayOfYear(date);
  const latRad = degToRad(latitude);

  // Solar declination (approximate)
  const decl = degToRad(-23.45 * Math.cos(degToRad((360 / 365) * (doy + 10))));

  // Hour angle
  const cosHA = -Math.tan(latRad) * Math.tan(decl);

  // Clamp for polar regions (midnight sun / polar night)
  const clampedCosHA = Math.max(-1, Math.min(1, cosHA));
  const haRad = Math.acos(clampedCosHA);
  const haDeg = radToDeg(haRad);

  // Equation of time correction (in minutes)
  const B = degToRad((360 / 365) * (doy - 81));
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  // Standard meridian for timezone
  const tzOffset = -date.getTimezoneOffset(); // minutes ahead of UTC
  const standardMeridian = tzOffset / 4; // degrees (approx)

  // Longitude correction in minutes
  const lonCorrection = 4 * (longitude - standardMeridian);

  // Solar noon in minutes from midnight (local clock time)
  const solarNoon = 720 - lonCorrection - eot;

  // Sunrise and sunset in minutes from midnight
  const sunriseMin = solarNoon - (haDeg / 15) * 60;
  const sunsetMin = solarNoon + (haDeg / 15) * 60;

  // Convert to Date objects
  const sunrise = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  sunrise.setMinutes(Math.round(sunriseMin));

  const sunset = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  sunset.setMinutes(Math.round(sunsetMin));

  // Next day sunrise
  const nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  const nextDoy = dayOfYear(nextDay);
  const nextDecl = degToRad(-23.45 * Math.cos(degToRad((360 / 365) * (nextDoy + 10))));
  const nextCosHA = -Math.tan(latRad) * Math.tan(nextDecl);
  const nextClampedCosHA = Math.max(-1, Math.min(1, nextCosHA));
  const nextHaDeg = radToDeg(Math.acos(nextClampedCosHA));
  const nextB = degToRad((360 / 365) * (nextDoy - 81));
  const nextEot = 9.87 * Math.sin(2 * nextB) - 7.53 * Math.cos(nextB) - 1.5 * Math.sin(nextB);
  const nextLonCorrection = 4 * (longitude - standardMeridian);
  const nextSolarNoon = 720 - nextLonCorrection - nextEot;
  const nextSunriseMin = nextSolarNoon - (nextHaDeg / 15) * 60;

  const nextSunrise = new Date(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate());
  nextSunrise.setMinutes(Math.round(nextSunriseMin));

  return { sunrise, sunset, nextSunrise };
}

// ══════════════════════════════════════════════════════════════
// ── Day Lord & Cycle Day
// ══════════════════════════════════════════════════════════════

/**
 * Get the current custom cycle day index (0-11) and name.
 * The cycle repeats every 12 days from the epoch.
 */
export function getCustomCycleDay(date: Date): { index: number; name: CycleDayName } {
  const days = daysSinceEpoch(date);
  const index = ((days % TOTAL_RULERS) + TOTAL_RULERS) % TOTAL_RULERS; // handle negative days
  return { index, name: CYCLE_DAYS[index] };
}

/**
 * Get the Day Lord -- the ruler of the current custom day.
 * The Day Lord is the same index as the cycle day.
 */
export function getDayLord(date: Date): { ruler: RulerName; index: number } {
  const { index } = getCustomCycleDay(date);
  return { ruler: RULERS[index], index };
}

// ══════════════════════════════════════════════════════════════
// ── Segment Builder
// ══════════════════════════════════════════════════════════════

/**
 * Build 12 equal planetary hour segments between two times,
 * starting the ruler cycle at `startRulerIndex`.
 *
 * Returns HourSegment[] (the web-native shape).
 */
export function buildSegments(
  periodStart: Date,
  periodEnd: Date,
  startRulerIndex: number,
  referenceNow: Date,
  period: 'day' | 'night',
): HourSegment[] {
  const totalMs = periodEnd.getTime() - periodStart.getTime();
  const segmentMs = totalMs / TOTAL_RULERS;
  const out: HourSegment[] = [];

  for (let i = 0; i < TOTAL_RULERS; i++) {
    const start = new Date(periodStart.getTime() + i * segmentMs);
    const end = new Date(periodStart.getTime() + (i + 1) * segmentMs);
    const ruler = RULERS[(startRulerIndex + i) % TOTAL_RULERS];
    const isCurrent = referenceNow >= start && referenceNow < end;
    out.push({
      hourNumber: i + 1,
      ruler,
      start,
      end,
      isCurrent,
      durationMinutes: Math.max(1, Math.round(segmentMs / 60000)),
      period,
    });
  }

  return out;
}

// ══════════════════════════════════════════════════════════════
// ── Main Calculation
// ══════════════════════════════════════════════════════════════

/**
 * Calculate the 24 planetary hours for a given date + location
 * using the Galactic Clock's astronomical mode.
 *
 * - Daylight period (sunrise -> sunset) is split into 12 equal day hours.
 *   Rulers cycle starting from the day's Day Lord.
 * - Night period (sunset -> next sunrise) is split into 12 equal night hours.
 *   Rulers ALSO start from the Day Lord (matching getHourLordAstronomical).
 */
export function calculatePlanetaryHours(
  date: Date,
  latitude: number,
  longitude: number,
  referenceNow: Date = new Date(),
): PlanetaryHoursResult {
  // Galactic day context -- based on the 12-day cycle epoch
  const dayLord = getDayLord(date);
  const cycleDay = getCustomCycleDay(date);

  // True sunrise / sunset from the solar calc
  const today = calculateSunTimes(date, latitude, longitude);

  // Night period needs the following day's sunrise
  const nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  const tomorrow = calculateSunTimes(nextDay, latitude, longitude);

  const sunrise = today.sunrise;
  const sunset = today.sunset;
  const nextSunrise = tomorrow.sunrise;

  // 12 daylight hours -- ruler cycle starts at Day Lord
  const dayHours = buildSegments(sunrise, sunset, dayLord.index, referenceNow, 'day');

  // 12 night hours -- ruler cycle also starts at Day Lord
  const nightHours = buildSegments(sunset, nextSunrise, dayLord.index, referenceNow, 'night');

  const currentHour =
    dayHours.find((h) => h.isCurrent) ||
    nightHours.find((h) => h.isCurrent) ||
    null;

  return {
    date,
    dayLord: dayLord.ruler,
    galacticDayName: cycleDay.name as GalacticDayName,
    galacticDayIndex: cycleDay.index,
    sunrise,
    sunset,
    nextSunrise,
    dayHours,
    nightHours,
    currentHour,
  };
}

// ══════════════════════════════════════════════════════════════
// ── Convenience: Live Current Hour
// ══════════════════════════════════════════════════════════════

/**
 * Find the current planetary hour RIGHT NOW for the user's
 * current location. Handles the "before sunrise" edge case
 * by falling back to yesterday's night hours.
 */
export function getLiveCurrentHour(
  latitude: number,
  longitude: number,
): PlanetaryHourSlot | null {
  const now = new Date();
  const result = calculatePlanetaryHours(now, latitude, longitude, now);

  // Map HourSegment to PlanetaryHourSlot for compatibility
  if (result.currentHour) {
    return hourSegmentToSlot(result.currentHour);
  }

  // Before today's sunrise -> use yesterday's chart
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yResult = calculatePlanetaryHours(yesterday, latitude, longitude, now);

  if (yResult.currentHour) {
    return hourSegmentToSlot(yResult.currentHour);
  }

  return null;
}

/**
 * Convert a HourSegment to the PlanetaryHourSlot shape
 * (compatibility with mobile interface).
 */
function hourSegmentToSlot(segment: HourSegment): PlanetaryHourSlot {
  return {
    hourNumber: segment.hourNumber,
    planet: segment.ruler,
    startTime: segment.start,
    endTime: segment.end,
    isDayHour: segment.period === 'day',
    isCurrent: segment.isCurrent,
    durationMinutes: segment.durationMinutes,
  };
}

// ══════════════════════════════════════════════════════════════
// ── Helper Exports
// ══════════════════════════════════════════════════════════════

/**
 * Get the color for a planet (convenience).
 */
export { PLANET_COLORS as planetColors } from './constants';

/**
 * Get the glyph for a planet (convenience).
 */
export { PLANET_GLYPHS as planetGlyphs } from './constants';
