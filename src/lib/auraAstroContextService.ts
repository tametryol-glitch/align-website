/**
 * Aura Mirror -- Astrology Context Service
 *
 * Pulls ALL birth/chart/transit/numerology data from EXISTING app stores
 * and services. Does NOT calculate anything new. Does NOT ask the user
 * to enter birth info. Pure read-only extraction from what is already
 * loaded in the app.
 *
 * Data sources:
 *   - useAuthStore  -> profile (sun_sign, moon_sign, rising_sign, birth_date, birth_time)
 *   - useChartStore -> natalChart (planets, houses, aspects), birthData
 *   - getApproxLongitude (inlined) -> current planet positions, moon sign/phase
 *   - numerologyCalc -> life path, personal year, birthday number
 */

import { useAuthStore } from '@/stores/authStore';
import { useChartStore } from '@/stores/chartStore';
import { calculateNumerology } from '@/lib/numerologyCalc';
import {
  SIGN_RULERS,
  PLANET_AURA_COLORS,
} from '@/lib/auraColors';
import type {
  AuraAstroContext,
  AuraNumerologyContext,
  AuraColorName,
} from '@/types/aura';

// ── Inlined planet data & getApproxLongitude ───────────────────────
// Copied from align-app/src/services/transitCalc.ts.
// Uses mean-longitude formula (accurate to ~1 deg for sign display).
// When a Keplerian ephemeris is added to the web app, this can be
// upgraded to call geocentricLongitude for higher accuracy.

const PLANET_DATA: Record<string, { epoch_lon: number; daily_motion: number }> = {
  Sun:     { epoch_lon: 280.368166, daily_motion: 0.985600 },
  Moon:    { epoch_lon: 223.314870, daily_motion: 13.176358 },
  Mercury: { epoch_lon: 271.888127, daily_motion: 1.383300 },
  Venus:   { epoch_lon: 241.564895, daily_motion: 1.209042 },
  Mars:    { epoch_lon: 327.962730, daily_motion: 0.524023 },
  Jupiter: { epoch_lon: 25.253058,  daily_motion: 0.083091 },
  Saturn:  { epoch_lon: 40.395678,  daily_motion: 0.033490 },
  Uranus:  { epoch_lon: 314.809150, daily_motion: 0.011690 },
  Neptune: { epoch_lon: 303.192986, daily_motion: 0.005980 },
  Pluto:   { epoch_lon: 251.454751, daily_motion: 0.003970 },
};

const NODE_DATA: Record<string, { epoch_lon: number; daily_motion: number }> = {
  'North Node': { epoch_lon: 125.04455501, daily_motion: -0.0529539 },
  'South Node': { epoch_lon: 305.04455501, daily_motion: -0.0529539 },
};

/**
 * Return the ecliptic longitude (0..360 deg) of `planet` on `date`.
 *
 * Uses the mean-element formula for all bodies. Accurate to within ~1 deg
 * for sign-level display.
 */
function getApproxLongitude(planet: string, date: Date): number {
  const data = PLANET_DATA[planet] || NODE_DATA[planet];
  if (!data) return 0;
  const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const daysSinceEpoch = (date.getTime() - j2000.getTime()) / 86400000;
  let lon = (data.epoch_lon + data.daily_motion * daysSinceEpoch) % 360;
  if (lon < 0) lon += 360;
  return ((lon % 360) + 360) % 360;
}

// ── Zodiac helpers ─────────────────────────────────────────────────

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

/**
 * Convert ecliptic longitude (0-360) to zodiac sign name.
 */
function lonToSign(lon: number): string {
  const idx = Math.floor(((lon % 360) + 360) % 360 / 30);
  return SIGNS[idx] || 'Aries';
}

/**
 * Get current Moon phase name from the Sun-Moon angle.
 */
function getMoonPhaseName(sunLon: number, moonLon: number): string {
  let angle = ((moonLon - sunLon) % 360 + 360) % 360;
  if (angle < 45) return 'New Moon';
  if (angle < 90) return 'Waxing Crescent';
  if (angle < 135) return 'First Quarter';
  if (angle < 180) return 'Waxing Gibbous';
  if (angle < 225) return 'Full Moon';
  if (angle < 270) return 'Waning Gibbous';
  if (angle < 315) return 'Last Quarter';
  return 'Waning Crescent';
}

/**
 * Calculate a simple transit "activity" score (0-1) based on how close
 * the transit planet is to any natal planet. Uses existing data only.
 */
function transitActivityScore(
  transitLon: number,
  natalPlanets: Array<{ longitude?: number }>,
): number {
  if (!natalPlanets || natalPlanets.length === 0) return 0.3; // baseline
  let minOrb = 360;
  for (const np of natalPlanets) {
    if (np.longitude == null) continue;
    const diff = Math.abs(((transitLon - np.longitude) % 360 + 360) % 360);
    const orb = Math.min(diff, 360 - diff);
    // Check major aspects: conjunction (0), opposition (180), square (90), trine (120), sextile (60)
    for (const aspect of [0, 60, 90, 120, 180]) {
      const aspectOrb = Math.abs(orb - aspect);
      if (aspectOrb < minOrb) minOrb = aspectOrb;
    }
  }
  // Convert orb to score: 0 deg orb = 1.0, 10 deg+ = 0
  return Math.max(0, 1 - minOrb / 10);
}

/**
 * Extract the full astrology context from existing app state.
 * Everything is optional-chained so it never crashes on missing data.
 */
export function getAuraAstroContext(): AuraAstroContext {
  const profile = useAuthStore.getState().profile;
  const chartState = useChartStore.getState();
  const natalChart = chartState.natalChart;
  const birthData = chartState.birthData;

  const hasBirthTime = !!(profile?.birth_time || birthData?.time);
  const hasChartData = !!natalChart;

  // If no chart data at all, return minimal context from profile
  if (!natalChart) {
    return {
      sunSign: profile?.sun_sign || undefined,
      moonSign: profile?.moon_sign || undefined,
      risingSign: profile?.rising_sign || undefined,
      hasBirthTime,
      hasChartData: false,
      // We can still get current sky data
      ...getCurrentSkyContext(null),
    };
  }

  // Extract planets from natal chart
  const planets: any[] = natalChart.planets || [];
  const houses: any[] = natalChart.houses || [];

  const findPlanet = (name: string) =>
    planets.find((p: any) => p.name === name || p.planet === name);

  const sun = findPlanet('Sun');
  const moon = findPlanet('Moon');

  // Rising sign -- from chart ascendant or profile
  const risingSign = natalChart.ascendant?.sign
    || profile?.rising_sign
    || undefined;

  // Chart ruler -- ruler of the rising sign
  const chartRuler = risingSign ? SIGN_RULERS[risingSign] : undefined;
  const chartRulerPlanet = chartRuler ? findPlanet(chartRuler) : undefined;

  // House signs
  const houseSign = (num: number) => {
    const h = houses.find((h: any) => h.house === num);
    return h?.sign || undefined;
  };

  return {
    sunSign: sun?.sign || profile?.sun_sign || undefined,
    sunHouse: sun?.house || undefined,
    moonSign: moon?.sign || profile?.moon_sign || undefined,
    moonHouse: moon?.house || undefined,
    risingSign,
    chartRuler,
    chartRulerSign: chartRulerPlanet?.sign || undefined,
    house1Sign: houseSign(1),
    house4Sign: houseSign(4),
    house6Sign: houseSign(6),
    house8Sign: houseSign(8),
    house12Sign: houseSign(12),
    hasBirthTime,
    hasChartData: true,
    ...getCurrentSkyContext(planets),
  };
}

/**
 * Get current sky positions using the inlined getApproxLongitude.
 * This reads real-time planetary positions -- no API call needed.
 */
function getCurrentSkyContext(
  natalPlanets: any[] | null,
): Partial<AuraAstroContext> {
  try {
    const now = new Date();
    const sunLon = getApproxLongitude('Sun', now);
    const moonLon = getApproxLongitude('Moon', now);
    const marsLon = getApproxLongitude('Mars', now);
    const saturnLon = getApproxLongitude('Saturn', now);
    const neptuneLon = getApproxLongitude('Neptune', now);
    const venusLon = getApproxLongitude('Venus', now);
    const jupiterLon = getApproxLongitude('Jupiter', now);
    const plutoLon = getApproxLongitude('Pluto', now);

    const currentMoonSign = lonToSign(moonLon);
    const currentMoonPhase = getMoonPhaseName(sunLon, moonLon);

    // Transit activity scores against natal planets
    const np = natalPlanets || [];
    const marsActivity = transitActivityScore(marsLon, np);
    const saturnPressure = transitActivityScore(saturnLon, np);
    const neptuneSensitivity = transitActivityScore(neptuneLon, np);
    const venusInfluence = transitActivityScore(venusLon, np);
    const jupiterInfluence = transitActivityScore(jupiterLon, np);
    const plutoTransformation = transitActivityScore(plutoLon, np);

    // Dominant transit theme
    const scores: [string, number][] = [
      ['Mars pressure', marsActivity],
      ['Saturn restriction', saturnPressure],
      ['Neptune sensitivity', neptuneSensitivity],
      ['Venus attraction', venusInfluence],
      ['Jupiter expansion', jupiterInfluence],
      ['Pluto transformation', plutoTransformation],
    ];
    scores.sort((a, b) => b[1] - a[1]);
    const dominantTransitTheme = scores[0][1] > 0.3 ? scores[0][0] : undefined;

    return {
      currentMoonSign,
      currentMoonPhase,
      currentMoonPhaseName: currentMoonPhase,
      marsActivity,
      saturnPressure,
      neptuneSensitivity,
      venusInfluence,
      jupiterInfluence,
      plutoTransformation,
      dominantTransitTheme,
    };
  } catch (err) {
    console.warn('[AuraAstroContext] Failed to get sky context:', err);
    return {};
  }
}

/**
 * Extract numerology context from existing profile birth_date + display_name.
 * Uses the already-installed calculateNumerology(fullName, birthDate) function.
 * No API call -- pure client-side Pythagorean calculation.
 */
export function getAuraNumerologyContext(): AuraNumerologyContext {
  const profile = useAuthStore.getState().profile;
  const birthDate = profile?.birth_date;

  if (!birthDate) return {};

  try {
    const fullName = profile?.display_name || 'User';
    const result = calculateNumerology(fullName, birthDate);

    return {
      lifePathNumber: result?.life_path?.value,
      lifePathDisplay: result?.life_path?.display || String(result?.life_path?.value || ''),
      personalYear: result?.personal_year,
      personalYearDisplay: result?.personal_year_display || String(result?.personal_year || ''),
      birthdayNumber: result?.birthday_number?.value,
    };
  } catch (err) {
    console.warn('[AuraNumerology] Failed to calculate:', err);
    return {};
  }
}

/**
 * Get the dominant planet color influence from the current transit context.
 * Used by the aura color engine to weight colors based on active transits.
 */
export function getDominantTransitColor(ctx: AuraAstroContext): AuraColorName | null {
  const scores: [string, number][] = [
    ['Mars', ctx.marsActivity || 0],
    ['Saturn', ctx.saturnPressure || 0],
    ['Neptune', ctx.neptuneSensitivity || 0],
    ['Venus', ctx.venusInfluence || 0],
    ['Jupiter', ctx.jupiterInfluence || 0],
    ['Pluto', ctx.plutoTransformation || 0],
  ];
  scores.sort((a, b) => b[1] - a[1]);
  if (scores[0][1] < 0.2) return null;
  return PLANET_AURA_COLORS[scores[0][0]] || null;
}
