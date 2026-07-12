/**
 * Duad Grid — an ORIGINAL Align system: a SOLID, EVEN horizontal grid of the
 * zodiac's duad/compendium structure, anchored to the user's RISING POINT.
 *
 * The zodiac subdivides perfectly evenly: 12 signs × 12 = 144 duads (2.5° each),
 * × 12 = 1,728 compendiums (0°12′30″ each). So the natural map is an even
 * latitude ladder: one evenly-spaced rung per duad, with 12 finer rungs per duad
 * for the compendiums.
 *
 * PERSONAL ANCHOR: the user's Ascendant sits in a specific duad. That duad is
 * pinned to the user's BIRTH LATITUDE, and every other duad steps evenly out
 * from there — so the whole ladder is shifted by the rising point. Someone born
 * minutes apart gets a differently-anchored ladder.
 *
 * Layers (the user's "both layered"):
 *   • gridLines      — all 144 duads as a faint even ladder (the structure).
 *   • planetLines    — each planet's own duad rung, highlighted in its colour.
 *   • compendiumLines— the 12× finer rungs, revealed on zoom (street level).
 *
 * All signs/themes come from the unit-tested getFullDuadCompendium. The 'mapping'
 * toggle only sets how tall each rung is (how far the ladder fans out).
 */

import { getFullDuadCompendium } from '@/lib/engines/duadCompendium';
import { getMyChartBodies } from '@/lib/zodisphereMidpoints';
import { ACG_BODY_COLORS } from '@/lib/engines/derivedAcgLines';
import type { AcgLine3D } from './AstrocartographyDataAdapter';

export type LatMapping = 'spread' | 'tight';
const ACG_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const ASC_COLOR = '#FDE047';
const GRID_COLOR = '#8aa0c8';
const DUAD_STEP = { spread: 1.4, tight: 0.7 }; // degrees of latitude per duad
const LAT_LIMIT = 85;
const LADDER_HALF = 26; // rungs each side of the anchor — a band, not to the poles

/** Global duad index 0..143 (sign*12 + duad-within-sign) for an ecliptic lon. */
function globalDuadIndex(lon: number): number {
  const L = ((lon % 360) + 360) % 360;
  const signIdx = Math.floor(L / 30);
  const degInSign = L - signIdx * 30;
  return signIdx * 12 + Math.min(11, Math.floor(degInSign / 2.5));
}

/** A representative ecliptic longitude at the centre of a duad (and optional
 *  compendium) so we can pull its sign/theme from the validated engine. */
function centreLongitude(duadIdx: number, compIdx = -1): number {
  const signIdx = Math.floor(duadIdx / 12);
  const duadInSign = duadIdx % 12;
  const base = signIdx * 30 + duadInSign * 2.5;
  return compIdx < 0 ? base + 1.25 : base + compIdx * (2.5 / 12) + (2.5 / 24);
}

export interface DuadGridEntry {
  planet: string;
  color: string;
  duadLat: number;
  duadSign: string;
  hiddenTheme: string;
  isAnchor?: boolean;
}

/** What duad/compendium band a latitude falls in, given the anchor. */
export interface BandAt {
  duadIdx: number;
  duadSign: string;
  hiddenTheme: string;
  compendiumSign: string;
  deepestTheme: string;
}

export interface DuadGrid {
  gridLines: AcgLine3D[];
  planetLines: AcgLine3D[];
  compendiumLines: AcgLine3D[];
  entries: DuadGridEntry[];
  anchorLat: number;
  ascDuadIdx: number;
  step: number;
}

// A constant-latitude line is rendered as a RHUMB line (see the renderer), so a
// handful of points trace the parallel exactly — cheap enough for a dense grid.
function hLine(
  id: string, planet: string, color: string, lat: number,
  style: 'duad' | 'compendium' | 'gridline',
  label?: string, labelLon?: number,
): AcgLine3D {
  const points: { lat: number; lon: number }[] = [];
  for (let lon = -180; lon <= 180; lon += 30) points.push({ lat, lon });
  return { id, planet, angle: 'MC', color, points, style, label, labelLon } as AcgLine3D;
}

const COMP_WINDOW = 16; // only build compendium rungs within ±16° of birth lat

/** Map a latitude to its duad + compendium band (used for tap-to-read). */
export function bandAtLatitude(lat: number, grid: Pick<DuadGrid, 'anchorLat' | 'ascDuadIdx' | 'step'>): BandAt {
  const kFloat = (lat - grid.anchorLat) / grid.step;
  const k = Math.round(kFloat);
  const duadIdx = ((grid.ascDuadIdx + k) % 144 + 144) % 144;
  // compendium index 0..11 within this duad, from the sub-position.
  const frac = kFloat - k; // −0.5..0.5 within the duad rung
  const compIdx = Math.min(11, Math.max(0, Math.floor((frac + 0.5) * 12)));
  const duadInfo = getFullDuadCompendium(centreLongitude(duadIdx));
  const compInfo = getFullDuadCompendium(centreLongitude(duadIdx, compIdx));
  return {
    duadIdx,
    duadSign: duadInfo.duadSign,
    hiddenTheme: duadInfo.hiddenTheme,
    compendiumSign: compInfo.compendiumSign,
    deepestTheme: compInfo.deepestTheme,
  };
}

/** Build the rising-point-anchored even Duad Grid. */
export async function getDuadGrid(profile: any, mapping: LatMapping): Promise<DuadGrid | null> {
  const chart = await getMyChartBodies(profile, []);
  if (!chart) return null;
  const byName = new Map(chart.bodies.map((b) => [b.name, b.longitude]));
  const ascLon = byName.get('Ascendant');
  const birthLat = typeof profile?.latitude === 'number' ? profile.latitude : null;
  if (ascLon == null || !Number.isFinite(ascLon) || birthLat == null) return null;

  const ascDuadIdx = globalDuadIndex(ascLon);
  const step = DUAD_STEP[mapping];
  const compStep = step / 12;
  // Labels are placed near the birth longitude so they read like a ruler where
  // the user's anchor is.
  const anchorLon = typeof profile?.longitude === 'number' ? profile.longitude : 0;
  const gridLabelLon = anchorLon - 16;

  // Even ladder: 144 duad rungs stepping out from the anchor (Asc duad = birthLat).
  const gridLines: AcgLine3D[] = [];
  const compendiumLines: AcgLine3D[] = [];
  for (let k = -LADDER_HALF; k <= LADDER_HALF; k++) {
    const lat = birthLat + k * step;
    if (lat < -LAT_LIMIT || lat > LAT_LIMIT) continue;
    const duadIdx = ((ascDuadIdx + k) % 144 + 144) % 144;
    const duadSign = getFullDuadCompendium(centreLongitude(duadIdx)).duadSign;
    gridLines.push(hLine(`grid-${duadIdx}-${k}`, 'grid', GRID_COLOR, lat, 'gridline', `${duadSign} duad`, gridLabelLon));
    // 12 finer compendium rungs inside this duad (revealed on zoom). Only
    // within a window of the birth latitude to keep the entity count sane.
    if (Math.abs(lat - birthLat) <= COMP_WINDOW) {
      for (let c = 1; c < 12; c++) {
        const clat = lat + c * compStep;
        if (clat < -LAT_LIMIT || clat > LAT_LIMIT) continue;
        compendiumLines.push(hLine(`comp-${duadIdx}-${c}`, 'grid', GRID_COLOR, clat, 'compendium'));
      }
    }
  }

  // Each planet's own duad rung, highlighted in its colour.
  const planetLines: AcgLine3D[] = [];
  const entries: DuadGridEntry[] = [];
  for (const name of ['Ascendant', ...ACG_PLANETS]) {
    const lon = byName.get(name);
    if (lon == null || !Number.isFinite(lon)) continue;
    const isAnchor = name === 'Ascendant';
    const idx = globalDuadIndex(lon);
    // shortest signed step from the anchor duad (handles the 144-wrap), kept
    // inside the visible ladder band.
    let k = idx - ascDuadIdx;
    if (k > 72) k -= 144; else if (k < -72) k += 144;
    k = Math.max(-LADDER_HALF, Math.min(LADDER_HALF, k));
    const lat = Math.max(-LAT_LIMIT, Math.min(LAT_LIMIT, birthLat + k * step));
    const color = isAnchor ? ASC_COLOR : (ACG_BODY_COLORS[name] || '#FFFFFF');
    const full = getFullDuadCompendium(lon);
    planetLines.push(hLine(`${name}:duad`, name, color, lat, 'duad', `${name} · ${full.duadSign}`, anchorLon));
    entries.push({ planet: name, color, duadLat: lat, duadSign: full.duadSign, hiddenTheme: full.hiddenTheme, isAnchor });
  }

  return { gridLines, planetLines, compendiumLines, entries, anchorLat: birthLat, ascDuadIdx, step };
}
