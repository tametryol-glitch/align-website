/**
 * Earthly Purpose (web) — derive Earth (Sun + 180°) from a natal chart and
 * produce the grounded "what you're here to accomplish" reading.
 *
 * Web ships the deterministic reading (the same offline engine the app uses
 * when AI is off). The AI upgrade is wired on mobile and can be ported here once
 * the hidden_zodiac_ai_enabled flag is verified live.
 */

import {
  calculateHiddenZodiacPlacement,
  longitudeToArcSeconds,
  arcSecondsToFormattedPosition,
  type HiddenZodiacPlacement,
} from './hiddenZodiacEngine';
import { findSupportedObject } from './hiddenZodiacSupportedObjects';
import { interpretHiddenZodiac } from './hiddenZodiacInterpreter';

export interface EarthlyPurposeContext {
  placement: HiddenZodiacPlacement;
  ascendantSign: string | null;
  conjunctions: Record<string, string[]>;
}

/** Normalised chart shape the deriver needs. */
interface NormalChart {
  planets: { name: string; longitude: number }[];
  aspects: { planet1: string; planet2: string; type: string }[];
  ascendant: number | null;
}

/**
 * Map the backend /charts/natal response (positions / aspects with
 * body1·body2·aspect_name / Ascendant in positions or house_cusps) into the
 * shape deriveEarthlyPurpose expects. Tolerant of the app's already-mapped shape.
 */
export function normaliseChart(raw: any): NormalChart {
  const positions = Array.isArray(raw?.positions) ? raw.positions : Array.isArray(raw?.planets) ? raw.planets : [];
  const planets = positions
    .filter((p: any) => Number.isFinite(p?.longitude))
    .map((p: any) => ({ name: p.name, longitude: p.longitude }));

  const rawAspects = Array.isArray(raw?.aspects) ? raw.aspects : [];
  const aspects = rawAspects.map((a: any) => ({
    planet1: a.planet1 ?? a.body1,
    planet2: a.planet2 ?? a.body2,
    type: String(a.type ?? a.aspect_name ?? '').toLowerCase(),
  }));

  let ascendant: number | null = Number.isFinite(raw?.ascendant) ? raw.ascendant : null;
  if (ascendant == null) {
    const asc = positions.find((p: any) => p?.name === 'Ascendant');
    if (asc && Number.isFinite(asc.longitude)) ascendant = asc.longitude;
    else if (Array.isArray(raw?.house_cusps) && Number.isFinite(raw.house_cusps[0])) ascendant = raw.house_cusps[0];
  }

  return { planets, aspects, ascendant };
}

const ordinal = (n: number | null): string => {
  if (!n) return 'an unresolved house';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]} house`;
};

export function deriveEarthlyPurpose(rawChart: any): EarthlyPurposeContext | null {
  const chart = normaliseChart(rawChart);
  const sun = chart.planets.find((p) => p.name === 'Sun' && Number.isFinite(p.longitude));
  if (!sun) return null;

  const ascendantSign = Number.isFinite(chart.ascendant) ? longitudeToArcSeconds(chart.ascendant as number).sign : null;
  const earthLon = (((sun.longitude + 180) % 360) + 360) % 360;
  const { sign, arcSecondsWithinSign } = longitudeToArcSeconds(earthLon);
  const f = arcSecondsToFormattedPosition(arcSecondsWithinSign);

  const natalByName: Record<string, { name: string; sign: string; longitudeDeg: number }> = {};
  for (const p of chart.planets) {
    const canonical = findSupportedObject(p.name)?.name ?? p.name;
    natalByName[canonical] = { name: canonical, sign: longitudeToArcSeconds(p.longitude).sign, longitudeDeg: p.longitude };
  }

  const placement = calculateHiddenZodiacPlacement({
    objectName: 'Earth',
    objectType: 'point',
    sign,
    degree: f.degree,
    minute: f.minute,
    second: f.second,
    ascendantSign,
    natalByName,
    depthMode: 'deep',
  });

  const rulers = [
    placement.rulerChain.mainRuler.ruler,
    placement.rulerChain.duadRuler.ruler,
    placement.rulerChain.compendiumRuler.ruler,
  ].filter(Boolean) as string[];
  const conjunctions: Record<string, string[]> = {};
  for (const asp of chart.aspects) {
    if (asp.type !== 'conjunction') continue;
    for (const r of rulers) {
      if (asp.planet1 === r && asp.planet2 !== r) (conjunctions[r] ||= []).push(asp.planet2);
      else if (asp.planet2 === r && asp.planet1 !== r) (conjunctions[r] ||= []).push(asp.planet1);
    }
  }

  return { placement, ascendantSign, conjunctions };
}

/** Flowing fallback paragraph assembled from the structured engine reading. */
export function deterministicEarthlyPurpose(ctx: EarthlyPurposeContext): string {
  const r = interpretHiddenZodiac(ctx.placement);
  return [r.primarySummary, r.threeHouseSynthesis, r.rulerSynthesis, r.operates]
    .filter(Boolean)
    .join('\n\n');
}

export { ordinal };
