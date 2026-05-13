// ── Planetary Hours — Barrel Export ──
// Re-exports everything for convenient single-path imports

// Constants
export {
  RULERS,
  CYCLE_DAYS,
  CUSTOM_CYCLE_EPOCH,
  TOTAL_RULERS,
  PLANET_COLORS,
  PLANET_SIGNS,
  PLANET_GLYPHS,
  PLANET_MEANINGS,
  RULER_MEANINGS,
} from './constants';
export type { RulerName, CycleDayName, PlanetMeaning } from './constants';

// Compatibility aliases used by page + CurrentHourHero (match flat-file names)
export { PLANET_COLORS as PLANET_HOUR_COLORS } from './constants';
export { PLANET_GLYPHS as PLANET_HOUR_GLYPHS } from './constants';
export { PLANET_MEANINGS as PLANET_HOUR_MEANINGS } from './constants';

// Types
export type {
  Ruler,
  HourSegment,
  PlanetaryHoursResult,
  SunTimes,
  PlanetaryHourSlot,
  GalacticDayName,
} from './types';

// Type compatibility aliases
export type { RulerName as CustomPlanet } from './types';
export type { PlanetMeaning as PlanetHourMeaning } from './constants';

// Calculation functions
export {
  calculateSunTimes,
  getCustomCycleDay,
  getDayLord,
  buildSegments,
  calculatePlanetaryHours,
  getLiveCurrentHour,
} from './calc';

// toHourSegments — result already returns HourSegment[] so this is a passthrough
import type { HourSegment as _HS } from './types';
export function toHourSegments(hours: _HS[], _period?: string): _HS[] {
  return hours;
}

// ── Convenience alias ──
import type { RulerName } from './constants';
export type PlanetName = RulerName;

// ── Unified PLANET_DATA lookup ──
// Combines color, glyph, sign, meaning, bestFor, avoid, energy, dayType, guidance
// into a single object per planet for easy component consumption.

import { PLANET_COLORS, PLANET_GLYPHS, PLANET_SIGNS, PLANET_MEANINGS } from './constants';

export interface PlanetDataEntry {
  color: string;
  glyph: string;
  sign: string;
  meaning: string;      // one-line quality text
  bestFor: string[];
  avoid: string[];
  energy: 'yang' | 'yin' | 'neutral';
  dayType: string;
  guidance: string;
}

function parseEnergy(raw: string): 'yang' | 'yin' | 'neutral' {
  const lower = raw.toLowerCase();
  if (lower.startsWith('yang')) return 'yang';
  if (lower.startsWith('yin')) return 'yin';
  return 'neutral';
}

export const PLANET_DATA: Record<RulerName, PlanetDataEntry> = Object.fromEntries(
  (Object.keys(PLANET_MEANINGS) as RulerName[]).map((name) => {
    const m = PLANET_MEANINGS[name];
    return [
      name,
      {
        color: PLANET_COLORS[name],
        glyph: PLANET_GLYPHS[name],
        sign: PLANET_SIGNS[name],
        meaning: m.quality,
        bestFor: m.bestFor,
        avoid: m.avoid,
        energy: parseEnergy(m.energy),
        dayType: m.dayType,
        guidance: m.guidance,
      },
    ];
  })
) as Record<RulerName, PlanetDataEntry>;
