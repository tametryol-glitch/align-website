/**
 * Duad Grid — an ORIGINAL Align system, anchored to the USER'S RISING POINT.
 *
 * Planet lines stay vertical. Each planet's DUAD and COMPENDIUM become
 * HORIZONTAL latitude lines. The whole grid is personal because it is built
 * FROM the user's Ascendant (the rising point at their exact birth time+place):
 *
 *   • The Ascendant's own duad band runs through the user's BIRTH LATITUDE —
 *     the latitude where their rising point actually rose. It is the anchor.
 *   • Every other body's duad band sits at birthLat + an offset determined by
 *     how far that body's duad is from the Ascendant's duad (shortest arc).
 *     Same for compendium, relative to the Ascendant's compendium.
 *
 * So two people born a few minutes apart get different grids — it is not a
 * generalized zodiac template. All longitudes/themes come from the unit-tested
 * duadPosition / compendiumPosition / getFullDuadCompendium. No fabrication.
 *
 * The 'mapping' toggle only controls how WIDE the bands fan from the anchor:
 *   • 'spread' — wide (bands reach across the inhabited globe).
 *   • 'tight'  — narrow (bands cluster near the birthplace latitude).
 */

import { duadPosition, compendiumPosition } from '@/lib/engines/derivedAstroMath';
import { getFullDuadCompendium } from '@/lib/engines/duadCompendium';
import { getMyChartBodies } from '@/lib/zodisphereMidpoints';
import { ACG_BODY_COLORS } from '@/lib/engines/derivedAcgLines';
import type { AcgLine3D } from './AstrocartographyDataAdapter';

export type LatMapping = 'spread' | 'tight';
const ACG_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const ASC_COLOR = '#FDE047'; // gold — the rising-point anchor

/** Shortest signed arc from b to a, in degrees, ∈ [−180, 180]. */
function signedDelta(a: number, b: number): number {
  return ((a - b + 540) % 360) - 180;
}

export interface DuadGridEntry {
  planet: string;
  color: string;
  duadLat: number;
  compendiumLat: number;
  duadSign: string;
  compendiumSign: string;
  hiddenTheme: string;
  deepestTheme: string;
  /** True for the Ascendant anchor row. */
  isAnchor?: boolean;
}

export interface DuadGrid {
  entries: DuadGridEntry[];
  duadLines: AcgLine3D[];
  compendiumLines: AcgLine3D[];
  /** The user's birth latitude the grid is anchored to. */
  anchorLat: number;
}

function horizontalLine(id: string, planet: string, color: string, lat: number, style: 'duad' | 'compendium'): AcgLine3D {
  const points: { lat: number; lon: number }[] = [];
  for (let lon = -180; lon <= 180; lon += 3) points.push({ lat, lon });
  return { id, planet, angle: 'MC', color, points, style } as AcgLine3D;
}

/**
 * Build the rising-point-anchored Duad Grid. Returns null if the chart has no
 * Ascendant (needs a birth time) — the UI then explains the requirement.
 */
export async function getDuadGrid(profile: any, mapping: LatMapping): Promise<DuadGrid | null> {
  const chart = await getMyChartBodies(profile, []);
  if (!chart) return null;
  const byName = new Map(chart.bodies.map((b) => [b.name, b.longitude]));

  const ascLon = byName.get('Ascendant');
  const birthLat = typeof profile?.latitude === 'number' ? profile.latitude : null;
  if (ascLon == null || !Number.isFinite(ascLon) || birthLat == null) return null;

  const ascDuadLon = duadPosition(ascLon).longitude;
  const ascCompLon = compendiumPosition(ascLon).longitude;
  const RANGE = mapping === 'spread' ? 78 : 30; // how far bands fan from the anchor
  const latOf = (bodyDerivedLon: number, ascDerivedLon: number) =>
    Math.max(-85, Math.min(85, birthLat + (signedDelta(bodyDerivedLon, ascDerivedLon) / 180) * RANGE));

  const entries: DuadGridEntry[] = [];
  const duadLines: AcgLine3D[] = [];
  const compendiumLines: AcgLine3D[] = [];

  // Ascendant first (the anchor), then the planets.
  for (const name of ['Ascendant', ...ACG_PLANETS]) {
    const lon = byName.get(name);
    if (lon == null || !Number.isFinite(lon)) continue;
    const isAnchor = name === 'Ascendant';
    const color = isAnchor ? ASC_COLOR : (ACG_BODY_COLORS[name] || '#FFFFFF');
    const duadLat = latOf(duadPosition(lon).longitude, ascDuadLon);
    const compendiumLat = latOf(compendiumPosition(lon).longitude, ascCompLon);
    const full = getFullDuadCompendium(lon);
    entries.push({
      planet: name, color, duadLat, compendiumLat,
      duadSign: full.duadSign, compendiumSign: full.compendiumSign,
      hiddenTheme: full.hiddenTheme, deepestTheme: full.deepestTheme, isAnchor,
    });
    duadLines.push(horizontalLine(`${name}:duad`, name, color, duadLat, 'duad'));
    compendiumLines.push(horizontalLine(`${name}:comp`, name, color, compendiumLat, 'compendium'));
  }

  return { entries, duadLines, compendiumLines, anchorLat: birthLat };
}
