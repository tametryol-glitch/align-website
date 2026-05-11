import {
  RULERS, CYCLE_DAYS, CUSTOM_CYCLE_EPOCH, RULER_MEANINGS,
  SEGMENT_ANGLE, TOTAL_RULERS, MINUTES_PER_MINUTE_LORD,
  SECONDS_PER_PULSE_LORD,
  RulerName, CycleDayName,
} from './constants';

import type {
  GalacticSignature, GalacticDayName, WheelSegment, CountdownData,
  ClockMode, SunTimes, AstronomicalSegment,
} from './types';

// ── Helpers ──

/**
 * Get the number of full days between the epoch and the given date.
 * Uses local midnight-to-midnight day boundaries.
 */
function daysSinceEpoch(date: Date): number {
  const epochMidnight = new Date(CUSTOM_CYCLE_EPOCH.getFullYear(), CUSTOM_CYCLE_EPOCH.getMonth(), CUSTOM_CYCLE_EPOCH.getDate());
  const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((dateMidnight.getTime() - epochMidnight.getTime()) / (86400000));
}

// ── Core Functions ──

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
 * Get the Day Lord — the ruler of the current custom day.
 * The Day Lord is the same index as the cycle day.
 */
export function getDayLord(date: Date): { ruler: RulerName; index: number } {
  const { index } = getCustomCycleDay(date);
  return { ruler: RULERS[index], index };
}

/**
 * Get the Hour Lord.
 *
 * The 12 rulers repeat twice across 24 hours.
 * Hour 0 starts with the Day Lord's ruler.
 * Hour 1 = next ruler in sequence, etc.
 * Hour 12 = back to Day Lord (second cycle).
 *
 * Returns the current Hour Lord, its index in the master sequence,
 * and the fractional progress within the current hour (0.0 to 1.0).
 */
export function getHourLord(date: Date): { ruler: RulerName; index: number; progress: number; hourOfDay: number } {
  const { index: dayIndex } = getDayLord(date);
  const hourOfDay = date.getHours(); // 0-23
  const rulerOffset = hourOfDay % TOTAL_RULERS;
  const rulerIndex = (dayIndex + rulerOffset) % TOTAL_RULERS;
  const progress = date.getMinutes() / 60 + date.getSeconds() / 3600;
  return { ruler: RULERS[rulerIndex], index: rulerIndex, progress, hourOfDay };
}

/**
 * Get the Minute Lord.
 *
 * Each hour is divided into 12 five-minute segments.
 * The Minute Lord cycle starts from the current Hour Lord.
 *
 * Minute 0-4: position 0 (= Hour Lord)
 * Minute 5-9: position 1 (= next ruler)
 * Minute 10-14: position 2
 * etc.
 *
 * Returns the Minute Lord, its index, progress within the 5-min block,
 * and seconds until the next Minute Lord transition.
 */
export function getMinuteLord(date: Date): { ruler: RulerName; index: number; progress: number; secondsToNext: number; segmentInHour: number } {
  const { index: hourLordIndex } = getHourLord(date);
  const minuteOfHour = date.getMinutes();
  const secondOfMinute = date.getSeconds();

  const segmentInHour = Math.floor(minuteOfHour / MINUTES_PER_MINUTE_LORD); // 0-11
  const rulerIndex = (hourLordIndex + segmentInHour) % TOTAL_RULERS;

  // Progress within current 5-minute segment (0.0 to 1.0)
  const minuteInSegment = minuteOfHour % MINUTES_PER_MINUTE_LORD;
  const totalSecondsInSegment = minuteInSegment * 60 + secondOfMinute;
  const progress = totalSecondsInSegment / (MINUTES_PER_MINUTE_LORD * 60);

  // Seconds until next Minute Lord
  const secondsToNext = (MINUTES_PER_MINUTE_LORD * 60) - totalSecondsInSegment;

  return { ruler: RULERS[rulerIndex], index: rulerIndex, progress, secondsToNext, segmentInHour };
}

/**
 * Get the Pulse Lord.
 *
 * Each 5-minute Minute Lord block is divided into 12 pulse segments.
 * Each pulse lasts 25 seconds.
 * The Pulse Lord cycle starts from the current Minute Lord.
 *
 * Returns the Pulse Lord, its index, progress within the 25-second pulse,
 * and seconds until the next Pulse Lord transition.
 */
export function getPulseLord(date: Date): { ruler: RulerName; index: number; progress: number; secondsToNext: number; segmentInMinuteLord: number } {
  const { index: minuteLordIndex, segmentInHour } = getMinuteLord(date);
  const minuteOfHour = date.getMinutes();
  const secondOfMinute = date.getSeconds();
  const milliseconds = date.getMilliseconds();

  // Calculate seconds into the current 5-minute block
  const minuteInSegment = minuteOfHour % MINUTES_PER_MINUTE_LORD;
  const totalSecondsInBlock = minuteInSegment * 60 + secondOfMinute;

  // Which of the 12 pulse segments are we in?
  const segmentInMinuteLord = Math.floor(totalSecondsInBlock / SECONDS_PER_PULSE_LORD); // 0-11
  const clampedSegment = Math.min(segmentInMinuteLord, 11);
  const rulerIndex = (minuteLordIndex + clampedSegment) % TOTAL_RULERS;

  // Progress within current 25-second pulse (0.0 to 1.0)
  const secondsIntoPulse = totalSecondsInBlock - (clampedSegment * SECONDS_PER_PULSE_LORD);
  const progress = (secondsIntoPulse + milliseconds / 1000) / SECONDS_PER_PULSE_LORD;

  // Seconds until next Pulse Lord
  const secondsToNext = SECONDS_PER_PULSE_LORD - secondsIntoPulse;

  return { ruler: RULERS[rulerIndex], index: rulerIndex, progress: Math.min(progress, 1), secondsToNext: Math.max(0, secondsToNext), segmentInMinuteLord: clampedSegment };
}

/**
 * Get the complete Galactic Signature for the current moment.
 */
export function getGalacticSignature(date: Date) {
  const cycleDay = getCustomCycleDay(date);
  const dayLord = getDayLord(date);
  const hourLord = getHourLord(date);
  const minuteLord = getMinuteLord(date);
  const pulseLord = getPulseLord(date);

  return { cycleDay, dayLord, hourLord, minuteLord, pulseLord };
}

/**
 * Calculate the rotation angle for each clock hand.
 *
 * Each segment = 30 degrees.
 * The hand should interpolate smoothly within its current segment.
 *
 * - Hour hand: based on position in 12-ruler sequence + fractional hour progress
 * - Minute hand: based on segment in hour + fractional 5-min progress
 * - Pulse hand: based on segment in minute lord + fractional 25-sec progress
 */
export function getClockAngles(date: Date): { hour: number; minute: number; pulse: number } {
  const hourLord = getHourLord(date);
  const minuteLord = getMinuteLord(date);
  const pulseLord = getPulseLord(date);

  // Hour hand: ruler index * 30° + progress within hour * 30°
  const hourAngle = (hourLord.index + hourLord.progress) * SEGMENT_ANGLE;

  // Minute hand: segment in hour * 30° + progress within segment * 30°
  const minuteAngle = (minuteLord.segmentInHour + minuteLord.progress) * SEGMENT_ANGLE;

  // Pulse hand: segment in minute lord * 30° + progress within pulse * 30°
  const pulseAngle = (pulseLord.segmentInMinuteLord + pulseLord.progress) * SEGMENT_ANGLE;

  return {
    hour: hourAngle % 360,
    minute: minuteAngle % 360,
    pulse: pulseAngle % 360
  };
}

/**
 * Generate the interpretation text for the current Galactic Signature.
 */
export function getInterpretation(date: Date): string {
  const sig = getGalacticSignature(date);

  const dayMeaning = RULER_MEANINGS[sig.dayLord.ruler];
  const hourMeaning = RULER_MEANINGS[sig.hourLord.ruler];
  const minuteMeaning = RULER_MEANINGS[sig.minuteLord.ruler];
  const pulseMeaning = RULER_MEANINGS[sig.pulseLord.ruler];

  // Build elegant synthesis
  const dayEssence = dayMeaning.essence;
  const hourEssence = hourMeaning.essence;
  const minuteEssence = minuteMeaning.essence;
  const pulseEssence = pulseMeaning.essence;

  return `The day carries ${dayEssence}. This hour channels ${hourEssence}. The current minute refines through ${minuteEssence}, while the pulse vibrates with ${pulseEssence}. Together, this moment favors ${hourMeaning.keywords.split(', ').slice(0, 2).join(' and ')} guided by ${minuteMeaning.keywords.split(', ').slice(0, 2).join(' and ')}.`;
}

/**
 * Get the ruler sequence for a given ring, starting from a specific ruler.
 * Used to render the wheel segments.
 */
export function getRulerSequence(startIndex: number): RulerName[] {
  return Array.from({ length: TOTAL_RULERS }, (_, i) => RULERS[(startIndex + i) % TOTAL_RULERS]);
}

/**
 * Format seconds as MM:SS countdown.
 */
export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m > 0) return `${m}:${String(s).padStart(2, '0')}`;
  return `${s}s`;
}

/**
 * Get next transition times for display.
 */
export function getNextTransitions(date: Date): { nextMinuteLord: string; nextPulseLord: string; nextHourLord: string } {
  const minuteLord = getMinuteLord(date);
  const pulseLord = getPulseLord(date);
  const secondsToNextHour = (60 - date.getMinutes()) * 60 - date.getSeconds();

  return {
    nextMinuteLord: formatCountdown(minuteLord.secondsToNext),
    nextPulseLord: formatCountdown(pulseLord.secondsToNext),
    nextHourLord: formatCountdown(secondsToNextHour),
  };
}

// ── Enhanced Functions ──

/**
 * Get the full GalacticSignature for a given date, matching the GalacticSignature interface.
 */
export function getFullGalacticSignature(date: Date): GalacticSignature {
  const cycleDay = getCustomCycleDay(date);
  const dayLord = getDayLord(date);
  const hourLord = getHourLord(date);
  const minuteLord = getMinuteLord(date);
  const pulseLord = getPulseLord(date);

  return {
    currentTime: date.toISOString(),
    dayIndex: cycleDay.index,
    cycleDay: cycleDay.name as GalacticDayName,
    dayLord: dayLord.ruler as GalacticSignature['dayLord'],
    hourLordIndex: hourLord.index,
    hourLord: hourLord.ruler as GalacticSignature['hourLord'],
    minuteLordIndex: minuteLord.index,
    minuteLord: minuteLord.ruler as GalacticSignature['minuteLord'],
    pulseLordIndex: pulseLord.index,
    pulseLord: pulseLord.ruler as GalacticSignature['pulseLord'],
    hourProgress: hourLord.progress,
    minuteBlockProgress: minuteLord.progress,
    pulseBlockProgress: pulseLord.progress,
  };
}

/**
 * Get the 12 fixed outer ring segments (always starts at Mars index 0).
 * Each segment is 30 degrees. The "active" segment corresponds to the current hour lord.
 */
export function getOuterRingSegments(): WheelSegment[] {
  return Array.from({ length: TOTAL_RULERS }, (_, i) => {
    const ruler = RULERS[i];
    const meaning = RULER_MEANINGS[ruler];
    return {
      index: i,
      ruler,
      startAngle: i * SEGMENT_ANGLE,
      endAngle: (i + 1) * SEGMENT_ANGLE,
      isActive: false, // caller sets active based on current hour lord
      color: meaning.color,
      glyph: meaning.glyph,
    };
  });
}

/**
 * Get the 12 minute ring segments starting from the current Hour Lord index.
 * The minute ring rotates so position 0 = hourLordIndex.
 */
export function getMinuteRingSegments(hourLordIndex: number): WheelSegment[] {
  return Array.from({ length: TOTAL_RULERS }, (_, i) => {
    const rulerIndex = (hourLordIndex + i) % TOTAL_RULERS;
    const ruler = RULERS[rulerIndex];
    const meaning = RULER_MEANINGS[ruler];
    return {
      index: i,
      ruler,
      startAngle: i * SEGMENT_ANGLE,
      endAngle: (i + 1) * SEGMENT_ANGLE,
      isActive: false,
      color: meaning.color,
      glyph: meaning.glyph,
    };
  });
}

/**
 * Get the 12 pulse ring segments starting from the current Minute Lord index.
 * The pulse ring rotates so position 0 = minuteLordIndex.
 */
export function getPulseRingSegments(minuteLordIndex: number): WheelSegment[] {
  return Array.from({ length: TOTAL_RULERS }, (_, i) => {
    const rulerIndex = (minuteLordIndex + i) % TOTAL_RULERS;
    const ruler = RULERS[rulerIndex];
    const meaning = RULER_MEANINGS[ruler];
    return {
      index: i,
      ruler,
      startAngle: i * SEGMENT_ANGLE,
      endAngle: (i + 1) * SEGMENT_ANGLE,
      isActive: false,
      color: meaning.color,
      glyph: meaning.glyph,
    };
  });
}

/**
 * Get seconds until the next Pulse Lord transition (0-25).
 */
export function getSecondsUntilNextPulse(date: Date): number {
  const pulseLord = getPulseLord(date);
  return Math.max(0, Math.floor(pulseLord.secondsToNext));
}

/**
 * Get seconds until the next Minute Lord transition (0-300).
 */
export function getSecondsUntilNextMinuteLord(date: Date): number {
  const minuteLord = getMinuteLord(date);
  return Math.max(0, Math.floor(minuteLord.secondsToNext));
}

/**
 * Get seconds until the next Hour Lord transition (0-3600).
 */
export function getSecondsUntilNextHourLord(date: Date): number {
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return (60 - minutes) * 60 - seconds;
}

/**
 * Get countdown data for all three transition points with both raw seconds and formatted strings.
 */
export function getCountdownData(date: Date): CountdownData {
  const nextPulseSeconds = getSecondsUntilNextPulse(date);
  const nextMinuteLordSeconds = getSecondsUntilNextMinuteLord(date);
  const nextHourLordSeconds = getSecondsUntilNextHourLord(date);

  return {
    nextPulseSeconds,
    nextMinuteLordSeconds,
    nextHourLordSeconds,
    nextPulseFormatted: formatCountdown(nextPulseSeconds),
    nextMinuteLordFormatted: formatCountdown(nextMinuteLordSeconds),
    nextHourLordFormatted: formatCountdown(nextHourLordSeconds),
  };
}

// ══════════════════════════════════════════════════════════════════════
// ── ASTRONOMICAL MODE ──
// Sunrise/sunset-based variable hour lengths with 12 segments per period
// ══════════════════════════════════════════════════════════════════════

// Default location: Nassau, Bahamas
const DEFAULT_LATITUDE = 25.0343;
const DEFAULT_LONGITUDE = -77.3963;

/**
 * Convert degrees to radians.
 */
function degToRad(deg: number): number {
  return deg * Math.PI / 180;
}

/**
 * Convert radians to degrees.
 */
function radToDeg(rad: number): number {
  return rad * 180 / Math.PI;
}

/**
 * Calculate day of year (1-based).
 */
function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

/**
 * Calculate approximate sunrise and sunset for a given date and location.
 * Uses the standard solar calculation algorithm with equation of time correction.
 */
export function calculateSunTimes(date: Date, latitude: number, longitude: number): SunTimes {
  const doy = dayOfYear(date);
  const latRad = degToRad(latitude);

  // Solar declination (approximate)
  const decl = degToRad(-23.45 * Math.cos(degToRad(360 / 365 * (doy + 10))));

  // Hour angle
  const cosHA = -Math.tan(latRad) * Math.tan(decl);

  // Clamp for polar regions (midnight sun / polar night)
  const clampedCosHA = Math.max(-1, Math.min(1, cosHA));
  const haRad = Math.acos(clampedCosHA);
  const haDeg = radToDeg(haRad);

  // Equation of time correction (in minutes)
  const B = degToRad(360 / 365 * (doy - 81));
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
  const nextDecl = degToRad(-23.45 * Math.cos(degToRad(360 / 365 * (nextDoy + 10))));
  const nextCosHA = -Math.tan(latRad) * Math.tan(nextDecl);
  const nextClampedCosHA = Math.max(-1, Math.min(1, nextCosHA));
  const nextHaDeg = radToDeg(Math.acos(nextClampedCosHA));
  const nextB = degToRad(360 / 365 * (nextDoy - 81));
  const nextEot = 9.87 * Math.sin(2 * nextB) - 7.53 * Math.cos(nextB) - 1.5 * Math.sin(nextB);
  const nextLonCorrection = 4 * (longitude - standardMeridian);
  const nextSolarNoon = 720 - nextLonCorrection - nextEot;
  const nextSunriseMin = nextSolarNoon - (nextHaDeg / 15) * 60;

  const nextSunrise = new Date(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate());
  nextSunrise.setMinutes(Math.round(nextSunriseMin));

  return { sunrise, sunset, nextSunrise };
}

/**
 * Determine if the given date is during daytime (between sunrise and sunset).
 */
export function isDaytime(date: Date, sunTimes: SunTimes): boolean {
  return date.getTime() >= sunTimes.sunrise.getTime() && date.getTime() < sunTimes.sunset.getTime();
}

/**
 * Get Hour Lord in astronomical mode.
 * Day period (sunrise->sunset) divided into 12 equal segments.
 * Night period (sunset->next sunrise) divided into 12 equal segments.
 */
export function getHourLordAstronomical(
  date: Date,
  sunTimes: SunTimes,
  dayIndex: number,
): {
  ruler: RulerName; index: number; progress: number; hourOfDay: number;
  isDaytime: boolean; segmentDurationMs: number;
  segmentStartTime: Date; segmentEndTime: Date;
} {
  const timeMs = date.getTime();
  const daytime = isDaytime(date, sunTimes);

  let periodStart: number;
  let periodEnd: number;

  if (daytime) {
    periodStart = sunTimes.sunrise.getTime();
    periodEnd = sunTimes.sunset.getTime();
  } else {
    // Night: could be before midnight (after sunset) or after midnight (before sunrise)
    if (timeMs >= sunTimes.sunset.getTime()) {
      // After sunset, same day
      periodStart = sunTimes.sunset.getTime();
      periodEnd = sunTimes.nextSunrise.getTime();
    } else {
      // Before sunrise — we need previous day's sunset
      // Calculate previous day's sun times
      const prevDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
      const prevSunTimes = calculateSunTimes(prevDate, 0, 0); // We'll fix this below
      // Actually, for night before sunrise, sunset of previous day to this sunrise
      periodStart = sunTimes.sunrise.getTime() - (sunTimes.nextSunrise.getTime() - sunTimes.sunset.getTime());
      // Better approach: use the sunset from the previous calc cycle
      // Since we always get sunTimes for the current date, and sunrise is today's sunrise,
      // the night period before sunrise goes from yesterday's sunset to today's sunrise.
      // We approximate yesterday's sunset as: today's sunrise - (24h - day duration of today)
      // Simpler: recalculate for yesterday
      periodEnd = sunTimes.sunrise.getTime();
      // We need yesterday's sunset — approximate by using today's sunset shifted back 24h
      // This is close enough for smooth animation
      const approxYesterdaySunset = new Date(sunTimes.sunset.getTime() - 86400000);
      periodStart = approxYesterdaySunset.getTime();
    }
  }

  const periodDuration = periodEnd - periodStart;
  const segmentDurationMs = periodDuration / TOTAL_RULERS;
  const elapsed = timeMs - periodStart;
  const segmentIndex = Math.min(Math.floor(elapsed / segmentDurationMs), 11);
  const progress = (elapsed - segmentIndex * segmentDurationMs) / segmentDurationMs;
  const rulerIndex = (dayIndex + segmentIndex) % TOTAL_RULERS;

  const segmentStartTime = new Date(periodStart + segmentIndex * segmentDurationMs);
  const segmentEndTime = new Date(periodStart + (segmentIndex + 1) * segmentDurationMs);

  return {
    ruler: RULERS[rulerIndex],
    index: rulerIndex,
    progress: Math.max(0, Math.min(1, progress)),
    hourOfDay: segmentIndex + (daytime ? 0 : 12),
    isDaytime: daytime,
    segmentDurationMs,
    segmentStartTime,
    segmentEndTime,
  };
}

/**
 * Recalculate sun times for the night period before sunrise.
 * When the current time is between midnight and sunrise, we need
 * yesterday's sunset to define the night period properly.
 */
function getSunTimesForNight(date: Date, latitude: number, longitude: number): SunTimes {
  const todaySunTimes = calculateSunTimes(date, latitude, longitude);
  const timeMs = date.getTime();

  if (timeMs < todaySunTimes.sunrise.getTime()) {
    // Before sunrise — recalculate using yesterday as the base
    const yesterday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
    const yesterdaySunTimes = calculateSunTimes(yesterday, latitude, longitude);
    // Night period: yesterday's sunset to today's sunrise
    return {
      sunrise: yesterdaySunTimes.sunrise,
      sunset: yesterdaySunTimes.sunset,
      nextSunrise: todaySunTimes.sunrise,
    };
  }

  return todaySunTimes;
}

/**
 * Get Hour Lord in astronomical mode with proper sun times handling.
 * This is the main entry point that handles the before-sunrise edge case.
 */
export function getHourLordAstronomicalFull(
  date: Date,
  latitude: number,
  longitude: number,
  dayIndex: number,
): {
  ruler: RulerName; index: number; progress: number; hourOfDay: number;
  isDaytime: boolean; segmentDurationMs: number;
  segmentStartTime: Date; segmentEndTime: Date;
  sunTimes: SunTimes;
} {
  const todaySunTimes = calculateSunTimes(date, latitude, longitude);
  const timeMs = date.getTime();

  let sunTimes: SunTimes;
  let daytime: boolean;
  let periodStart: number;
  let periodEnd: number;

  if (timeMs >= todaySunTimes.sunrise.getTime() && timeMs < todaySunTimes.sunset.getTime()) {
    // Daytime
    sunTimes = todaySunTimes;
    daytime = true;
    periodStart = sunTimes.sunrise.getTime();
    periodEnd = sunTimes.sunset.getTime();
  } else if (timeMs >= todaySunTimes.sunset.getTime()) {
    // Night after sunset
    sunTimes = todaySunTimes;
    daytime = false;
    periodStart = sunTimes.sunset.getTime();
    periodEnd = sunTimes.nextSunrise.getTime();
  } else {
    // Night before sunrise — need yesterday's sunset
    const yesterday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
    const yesterdaySunTimes = calculateSunTimes(yesterday, latitude, longitude);
    sunTimes = {
      sunrise: todaySunTimes.sunrise,
      sunset: yesterdaySunTimes.sunset,
      nextSunrise: todaySunTimes.sunrise,
    };
    daytime = false;
    periodStart = yesterdaySunTimes.sunset.getTime();
    periodEnd = todaySunTimes.sunrise.getTime();
  }

  const periodDuration = periodEnd - periodStart;
  const segmentDurationMs = periodDuration / TOTAL_RULERS;
  const elapsed = timeMs - periodStart;
  const segmentIndex = Math.min(Math.floor(elapsed / segmentDurationMs), 11);
  const progress = (elapsed - segmentIndex * segmentDurationMs) / segmentDurationMs;
  const rulerIndex = (dayIndex + segmentIndex) % TOTAL_RULERS;

  const segmentStartTime = new Date(periodStart + segmentIndex * segmentDurationMs);
  const segmentEndTime = new Date(periodStart + (segmentIndex + 1) * segmentDurationMs);

  return {
    ruler: RULERS[rulerIndex],
    index: rulerIndex,
    progress: Math.max(0, Math.min(1, progress)),
    hourOfDay: segmentIndex + (daytime ? 0 : 12),
    isDaytime: daytime,
    segmentDurationMs,
    segmentStartTime,
    segmentEndTime,
    sunTimes,
  };
}

/**
 * Get Minute Lord in astronomical mode.
 * Each Hour Lord segment is subdivided into 12 equal Minute Lord segments.
 */
export function getMinuteLordAstronomical(
  date: Date,
  hourSegmentStartTime: Date,
  hourSegmentDurationMs: number,
  hourRulerIndex: number,
): {
  ruler: RulerName; index: number; progress: number; secondsToNext: number; segmentInHour: number;
  segmentStartTime: Date; segmentDurationMs: number;
} {
  const minuteSegmentDurationMs = hourSegmentDurationMs / TOTAL_RULERS;
  const elapsed = date.getTime() - hourSegmentStartTime.getTime();
  const segmentIndex = Math.min(Math.floor(elapsed / minuteSegmentDurationMs), 11);
  const segmentElapsed = elapsed - segmentIndex * minuteSegmentDurationMs;
  const progress = segmentElapsed / minuteSegmentDurationMs;
  const rulerIndex = (hourRulerIndex + segmentIndex) % TOTAL_RULERS;
  const secondsToNext = (minuteSegmentDurationMs - segmentElapsed) / 1000;

  const segmentStartTime = new Date(hourSegmentStartTime.getTime() + segmentIndex * minuteSegmentDurationMs);

  return {
    ruler: RULERS[rulerIndex],
    index: rulerIndex,
    progress: Math.max(0, Math.min(1, progress)),
    secondsToNext: Math.max(0, secondsToNext),
    segmentInHour: segmentIndex,
    segmentStartTime,
    segmentDurationMs: minuteSegmentDurationMs,
  };
}

/**
 * Get Pulse Lord in astronomical mode.
 * Each Minute Lord segment is subdivided into 12 equal Pulse Lord segments.
 */
export function getPulseLordAstronomical(
  date: Date,
  minuteSegmentStartTime: Date,
  minuteSegmentDurationMs: number,
  minuteRulerIndex: number,
): {
  ruler: RulerName; index: number; progress: number; secondsToNext: number; segmentInMinuteLord: number;
} {
  const pulseSegmentDurationMs = minuteSegmentDurationMs / TOTAL_RULERS;
  const elapsed = date.getTime() - minuteSegmentStartTime.getTime();
  const segmentIndex = Math.min(Math.floor(elapsed / pulseSegmentDurationMs), 11);
  const segmentElapsed = elapsed - segmentIndex * pulseSegmentDurationMs;
  const progress = segmentElapsed / pulseSegmentDurationMs;
  const rulerIndex = (minuteRulerIndex + segmentIndex) % TOTAL_RULERS;
  const secondsToNext = (pulseSegmentDurationMs - segmentElapsed) / 1000;

  return {
    ruler: RULERS[rulerIndex],
    index: rulerIndex,
    progress: Math.max(0, Math.min(1, progress)),
    secondsToNext: Math.max(0, secondsToNext),
    segmentInMinuteLord: segmentIndex,
  };
}

/**
 * Get the complete Galactic Signature in unified mode (standard or astronomical).
 */
export function getGalacticSignatureUnified(
  date: Date,
  mode: ClockMode,
  latitude?: number,
  longitude?: number,
) {
  if (mode === 'standard') {
    return { ...getGalacticSignature(date), mode: 'standard' as const, isDaytime: true, sunTimes: null as SunTimes | null, hourSegmentDurationMs: 3600000 };
  }

  // Astronomical mode
  const lat = latitude || DEFAULT_LATITUDE;
  const lon = longitude || DEFAULT_LONGITUDE;
  const dayLord = getDayLord(date);
  const cycleDay = getCustomCycleDay(date);

  const hourLord = getHourLordAstronomicalFull(date, lat, lon, dayLord.index);
  const minuteLord = getMinuteLordAstronomical(
    date,
    hourLord.segmentStartTime,
    hourLord.segmentDurationMs,
    hourLord.index,
  );
  const pulseLord = getPulseLordAstronomical(
    date,
    minuteLord.segmentStartTime,
    minuteLord.segmentDurationMs,
    minuteLord.index,
  );

  return {
    cycleDay,
    dayLord,
    hourLord: {
      ruler: hourLord.ruler,
      index: hourLord.index,
      progress: hourLord.progress,
      hourOfDay: hourLord.hourOfDay,
    },
    minuteLord: {
      ruler: minuteLord.ruler,
      index: minuteLord.index,
      progress: minuteLord.progress,
      secondsToNext: minuteLord.secondsToNext,
      segmentInHour: minuteLord.segmentInHour,
    },
    pulseLord: {
      ruler: pulseLord.ruler,
      index: pulseLord.index,
      progress: pulseLord.progress,
      secondsToNext: pulseLord.secondsToNext,
      segmentInMinuteLord: pulseLord.segmentInMinuteLord,
    },
    mode: 'astronomical' as const,
    isDaytime: hourLord.isDaytime,
    sunTimes: hourLord.sunTimes,
    hourSegmentDurationMs: hourLord.segmentDurationMs,
  };
}

/**
 * Calculate the rotation angle for each clock hand in unified mode.
 * Same formula: (index + progress) * 30 degrees — works for both modes
 * since there are always 12 segments per ring.
 */
export function getClockAnglesUnified(
  date: Date,
  mode: ClockMode,
  latitude?: number,
  longitude?: number,
): { hour: number; minute: number; pulse: number } {
  if (mode === 'standard') {
    return getClockAngles(date);
  }

  const sig = getGalacticSignatureUnified(date, mode, latitude, longitude);

  // For astronomical mode, the hand positions use segmentInHour / segmentInMinuteLord
  // for middle and inner rings, just like standard mode
  const hourAngle = (sig.hourLord.index + sig.hourLord.progress) * SEGMENT_ANGLE;
  const minuteAngle = (sig.minuteLord.segmentInHour + sig.minuteLord.progress) * SEGMENT_ANGLE;
  const pulseAngle = (sig.pulseLord.segmentInMinuteLord + sig.pulseLord.progress) * SEGMENT_ANGLE;

  return {
    hour: hourAngle % 360,
    minute: minuteAngle % 360,
    pulse: pulseAngle % 360,
  };
}

/**
 * Get next transition times in unified mode.
 */
export function getNextTransitionsUnified(
  date: Date,
  mode: ClockMode,
  latitude?: number,
  longitude?: number,
): { nextMinuteLord: string; nextPulseLord: string; nextHourLord: string } {
  if (mode === 'standard') {
    return getNextTransitions(date);
  }

  const sig = getGalacticSignatureUnified(date, mode, latitude, longitude);

  // Hour Lord: time remaining in current hour segment
  const hourSegmentRemaining = sig.hourSegmentDurationMs * (1 - sig.hourLord.progress) / 1000;

  return {
    nextMinuteLord: formatCountdown(sig.minuteLord.secondsToNext),
    nextPulseLord: formatCountdown(sig.pulseLord.secondsToNext),
    nextHourLord: formatCountdown(hourSegmentRemaining),
  };
}

/**
 * Format a duration in milliseconds as "XXm YYs" for display.
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

/**
 * Format a Date as "H:MM AM/PM" for display.
 */
export function formatSunTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
}
