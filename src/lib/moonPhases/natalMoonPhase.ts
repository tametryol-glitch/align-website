/**
 * Natal Moon Phase Service
 *
 * Classifies the user's Moon phase at the moment of birth into one of
 * eight traditional lunar phases (New, Waxing Crescent, First Quarter,
 * Waxing Gibbous, Full, Disseminating, Last Quarter, Balsamic) and
 * returns a personalization payload that the interpretation layer can
 * use to generate character-meaningful content.
 *
 * Classification is derived from Sun-Moon elongation: the angular
 * distance of the Moon ahead of the Sun, measured 0 to 360.
 *
 *   elongation = (moonLon - sunLon + 360) mod 360
 *
 * Bucket boundaries are 45 wide and are the same convention used by
 * traditional astrologers following Dane Rudhyar's lunation cycle model.
 *
 * This service does NOT fetch data -- it takes a NatalChart (already
 * available from chartStore + getNatalChart) and returns a pure,
 * cacheable result.
 *
 * Ported from align-app for web use. No React Native dependencies.
 */

import type { NatalChart, NatalPlanet, NatalAspect } from '@/lib/engines/types';

export type LunarPhaseKey =
  | 'new'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full'
  | 'disseminating'
  | 'last_quarter'
  | 'balsamic';

export interface NatalMoonPhase {
  /** Stable key used by content lookups */
  key: LunarPhaseKey;
  /** Human-readable name ("New Moon", "Disseminating Moon") */
  name: string;
  /** Unicode emoji for quick UI display */
  emoji: string;
  /** Sun-Moon angular separation at birth, 0-360 */
  elongation: number;
  /** Illumination fraction 0..1 at the moment of birth */
  illumination: number;
  /** Natal Moon sign, e.g. "Cancer" */
  moonSign: string;
  /** Natal Sun sign, e.g. "Leo" */
  sunSign: string;
  /** Natal Moon house, 1-12 (0 if unknown) */
  moonHouse: number;
  /** Major natal aspects involving the Moon (orb <= 6 for hard aspects) */
  moonAspects: NatalAspect[];
}

const PHASE_TABLE: { key: LunarPhaseKey; name: string; emoji: string; max: number }[] = [
  { key: 'new',              name: 'New Moon',              emoji: '🌑', max: 45 },
  { key: 'waxing_crescent',  name: 'Waxing Crescent',       emoji: '🌒', max: 90 },
  { key: 'first_quarter',    name: 'First Quarter',         emoji: '🌓', max: 135 },
  { key: 'waxing_gibbous',   name: 'Waxing Gibbous',        emoji: '🌔', max: 180 },
  { key: 'full',             name: 'Full Moon',             emoji: '🌕', max: 225 },
  { key: 'disseminating',    name: 'Disseminating Moon',    emoji: '🌖', max: 270 },
  { key: 'last_quarter',     name: 'Last Quarter',          emoji: '🌗', max: 315 },
  { key: 'balsamic',         name: 'Balsamic Moon',         emoji: '🌘', max: 360.0001 },
];

function classifyElongation(elongation: number): { key: LunarPhaseKey; name: string; emoji: string } {
  const wrapped = ((elongation % 360) + 360) % 360;
  for (const entry of PHASE_TABLE) {
    if (wrapped < entry.max) return entry;
  }
  // Unreachable -- all 8 buckets cover 0-360 exactly. Defensive fallback.
  return PHASE_TABLE[0];
}

/**
 * Illumination fraction of the Moon face visible from Earth, derived
 * purely from elongation. New = 0, Full = 1. Non-linear approximation
 * good enough for display ("75% illuminated").
 */
function illuminationFromElongation(elongation: number): number {
  const wrapped = ((elongation % 360) + 360) % 360;
  // (1 - cos(elongation)) / 2 gives 0 at New, 1 at Full, 0 at next New
  return (1 - Math.cos((wrapped * Math.PI) / 180)) / 2;
}

function findPlanet(chart: NatalChart, name: string): NatalPlanet | undefined {
  if (!chart || !Array.isArray(chart.planets)) return undefined;
  return chart.planets.find((p) => p?.name === name);
}

/**
 * Filter the chart's aspects to the ones involving the Moon with a
 * reasonable orb. Orbs tightened slightly vs ordinary transit work
 * because natal Moon aspects are core personality -- wide orbs dilute
 * the reading.
 */
function extractMoonAspects(chart: NatalChart): NatalAspect[] {
  if (!chart || !Array.isArray(chart.aspects)) return [];
  const MAX_ORB_BY_ASPECT: Record<string, number> = {
    conjunction: 8,
    opposition: 7,
    square: 6,
    trine: 6,
    sextile: 4,
    quincunx: 3,
  };
  return chart.aspects
    .filter((a) => a && (a.planet1 === 'Moon' || a.planet2 === 'Moon'))
    .filter((a) => {
      const max = MAX_ORB_BY_ASPECT[a.type] ?? 5;
      return typeof a.orb === 'number' && Math.abs(a.orb) <= max;
    })
    // Sort tightest first so interpretation picks the most significant
    .sort((a, b) => Math.abs(a.orb) - Math.abs(b.orb));
}

/**
 * Compute the user's natal Moon phase and attached context.
 * Returns null if the chart is missing essential data.
 */
export function calculateNatalMoonPhase(chart: NatalChart | null | undefined): NatalMoonPhase | null {
  if (!chart) return null;

  const sun = findPlanet(chart, 'Sun');
  const moon = findPlanet(chart, 'Moon');
  if (!sun || !moon) return null;
  if (typeof sun.longitude !== 'number' || typeof moon.longitude !== 'number') return null;

  const elongation = ((moon.longitude - sun.longitude) % 360 + 360) % 360;
  const { key, name, emoji } = classifyElongation(elongation);
  const illumination = illuminationFromElongation(elongation);

  return {
    key,
    name,
    emoji,
    elongation,
    illumination,
    moonSign: moon.sign || '',
    sunSign: sun.sign || '',
    moonHouse: typeof moon.house === 'number' ? moon.house : 0,
    moonAspects: extractMoonAspects(chart),
  };
}

/** Exported for tests and UI labeling. */
export const LUNAR_PHASE_ORDER: LunarPhaseKey[] = [
  'new',
  'waxing_crescent',
  'first_quarter',
  'waxing_gibbous',
  'full',
  'disseminating',
  'last_quarter',
  'balsamic',
];
