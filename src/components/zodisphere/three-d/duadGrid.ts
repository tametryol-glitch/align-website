/**
 * Duad Grid — an ORIGINAL Align system (not classical astrocartography).
 *
 * Planet lines stay vertical (meridians/curves). Each planet's DUAD and
 * COMPENDIUM derived positions instead become HORIZONTAL latitude lines. Where a
 * vertical planet line crosses a horizontal duad/compendium line is a specific
 * point whose reading fuses that planet with that hidden/essence layer.
 *
 * Latitude of a horizontal line = the derived point's DECLINATION (a real,
 * validated quantity from eclipticToEquatorial), under one of two mappings:
 *   • 'declination' — the true declination (±23.4°, tropics).
 *   • 'spread'      — declination scaled to ±66° so lines reach inhabited
 *                     latitudes worldwide (a designed Align mapping; same
 *                     astronomy, one scale factor apart).
 *
 * All longitudes come from the unit-tested duadPosition/compendiumPosition; the
 * hidden/essence THEMES come from getFullDuadCompendium. No fabrication.
 */

import {
  duadPosition, compendiumPosition, eclipticToEquatorial, ACG_OBLIQUITY_DEG,
} from '@/lib/engines/derivedAstroMath';
import { getFullDuadCompendium } from '@/lib/engines/duadCompendium';
import { getMyChartBodies } from '@/lib/zodisphereMidpoints';
import { ACG_BODY_COLORS } from '@/lib/engines/derivedAcgLines';
import type { AcgLine3D } from './AstrocartographyDataAdapter';

export type LatMapping = 'spread' | 'declination';
const SPREAD_SCALE = 66 / ACG_OBLIQUITY_DEG; // ~2.82 — declination → inhabited band

const ACG_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

/** Derived ecliptic longitude → horizontal-line latitude under the mapping. */
export function derivedLatitude(derivedLon: number, mapping: LatMapping): number {
  const { declination } = eclipticToEquatorial(derivedLon, ACG_OBLIQUITY_DEG);
  const lat = mapping === 'declination' ? declination : declination * SPREAD_SCALE;
  return Math.max(-66, Math.min(66, lat));
}

/** One planet's duad/compendium grid data + themes. */
export interface DuadGridEntry {
  planet: string;
  color: string;
  duadLat: number;
  compendiumLat: number;
  duadSign: string;
  compendiumSign: string;
  hiddenTheme: string;   // duad layer
  deepestTheme: string;  // compendium layer
}

export interface DuadGrid {
  entries: DuadGridEntry[];
  /** Horizontal duad lines (shown by default). */
  duadLines: AcgLine3D[];
  /** Horizontal compendium lines (revealed on zoom-in). */
  compendiumLines: AcgLine3D[];
}

/** Build a horizontal latitude line (full lon sweep) as an AcgLine3D. */
function horizontalLine(id: string, planet: string, color: string, lat: number, style: 'duad' | 'compendium'): AcgLine3D {
  const points: { lat: number; lon: number }[] = [];
  for (let lon = -180; lon <= 180; lon += 3) points.push({ lat, lon });
  return { id, planet, angle: 'MC', color, points, style } as AcgLine3D;
}

/** Compute the Duad Grid for the signed-in user's chart. */
export async function getDuadGrid(profile: any, mapping: LatMapping): Promise<DuadGrid | null> {
  const chart = await getMyChartBodies(profile, []);
  if (!chart) return null;
  const byName = new Map(chart.bodies.map((b) => [b.name, b.longitude]));

  const entries: DuadGridEntry[] = [];
  const duadLines: AcgLine3D[] = [];
  const compendiumLines: AcgLine3D[] = [];

  for (const planet of ACG_PLANETS) {
    const natalLon = byName.get(planet);
    if (natalLon == null || !Number.isFinite(natalLon)) continue;
    const color = ACG_BODY_COLORS[planet] || '#FFFFFF';
    const duadLon = duadPosition(natalLon).longitude;
    const compLon = compendiumPosition(natalLon).longitude;
    const duadLat = derivedLatitude(duadLon, mapping);
    const compendiumLat = derivedLatitude(compLon, mapping);
    const full = getFullDuadCompendium(natalLon);

    entries.push({
      planet, color, duadLat, compendiumLat,
      duadSign: full.duadSign, compendiumSign: full.compendiumSign,
      hiddenTheme: full.hiddenTheme, deepestTheme: full.deepestTheme,
    });
    duadLines.push(horizontalLine(`${planet}:duad`, planet, color, duadLat, 'duad'));
    compendiumLines.push(horizontalLine(`${planet}:comp`, planet, color, compendiumLat, 'compendium'));
  }

  return { entries, duadLines, compendiumLines };
}
