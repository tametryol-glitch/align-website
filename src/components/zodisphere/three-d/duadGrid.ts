/**
 * Duad Grid — an ORIGINAL Align system: a SOLID, EVEN horizontal grid of the
 * zodiac's full duad/compendium structure, wrapping the whole globe pole-to-pole
 * and anchored to the user's RISING POINT.
 *
 * The zodiac subdivides perfectly evenly (each level ÷12):
 *   • 12 signs × 12 = 144 duads        (2.5° of ecliptic each),
 *   • 144 × 12     = 1,728 compendiums  (0°12′30″ each),
 *   • 1,728 × 12   = 20,736 matrices    (0°01′02.5″ each).
 * So the natural map is an even latitude ladder covering the entire sphere:
 *   step = 180° of latitude / 1,728 = 0.10417° per compendium (1.25° per duad),
 *   and 1/12 of that (0.00868°) per matrix.
 *
 * PERSONAL ANCHOR: the user's Ascendant sits in one specific compendium. That
 * compendium is pinned to the user's BIRTH LATITUDE, and the whole ladder steps
 * evenly outward from there — so someone born minutes apart gets a differently
 * phased grid. The compendium index INCREASES heading south and DECREASES
 * heading north (matching the zodiac order), e.g. a Leo-compendium anchor reads
 * Cancer just north and Virgo just south of the rising point.
 *
 * Layers:
 *   • duadLines       — the 144 duad boundaries, faint, drawn around the globe.
 *   • compendiumLines — the 1,728 finer rungs, revealed only at street-level zoom.
 *   • matrixLines     — the finest 4th level, windowed near the anchor latitude,
 *                       revealed only at the deepest (building-level) zoom.
 *   • the gold anchor rung at the birth latitude = the Ascendant's own compendium.
 *
 * All signs/themes come from the unit-tested getFullDuadCompendium. This grid is
 * a symbolic coordinate system (its latitudes are designed, not astronomical) —
 * that is the user's deliberate, specified design.
 */

import { getFullDuadCompendium } from '@/lib/engines/duadCompendium';
import { getMyChartBodies } from '@/lib/zodisphereMidpoints';
import type { AcgLine3D, GeoPoint } from './AstrocartographyDataAdapter';

const ASC_COLOR = '#FDE047';
const DUAD_COLOR = '#8aa0c8';
const COMP_COLOR = '#6b7fa8';
const MATRIX_COLOR = '#556087';

const COMP_COUNT = 1728;                 // total compendiums around the zodiac
const COMP_WIDTH = 2.5 / 12;             // ecliptic degrees per compendium (0.2083°)
const STEP = 180 / COMP_COUNT;           // latitude degrees per compendium (0.10417°)

const MATRIX_COUNT = 20736;              // total matrices around the zodiac
const MATRIX_WIDTH = 2.5 / 144;          // ecliptic degrees per matrix (0°01′02.5″)
const MATRIX_STEP = 180 / MATRIX_COUNT;  // latitude degrees per matrix (0.00868°)
// 20,736 matrix lines is far too many Cesium entities to create at once, and
// they're only visible at the deepest zoom (a spot a few km wide), so we build
// them only within a band around the anchor latitude where zooming-in happens.
const MATRIX_WINDOW_DEG = 3;

/** Global compendium index 0..1727 for an ecliptic longitude. */
function globalCompendiumIndex(lon: number): number {
  const L = ((lon % 360) + 360) % 360;
  return Math.min(COMP_COUNT - 1, Math.floor(L / COMP_WIDTH));
}

/** Global matrix index 0..20735 for an ecliptic longitude. */
function globalMatrixIndex(lon: number): number {
  const L = ((lon % 360) + 360) % 360;
  return Math.min(MATRIX_COUNT - 1, Math.floor(L / MATRIX_WIDTH));
}

/** A representative ecliptic longitude at the centre of global compendium j, so
 *  we can read its duad + compendium sign/theme from the validated engine. */
function compCentreLon(j: number): number {
  return (j + 0.5) * COMP_WIDTH;
}

/** Centre longitude of global matrix mi (for its sign/theme). */
function matrixCentreLon(mi: number): number {
  return (mi + 0.5) * MATRIX_WIDTH;
}

// A constant-latitude line is rendered as a RHUMB line (see the renderer) and is
// probed by pure latitude distance (see probeAcgLines), so a handful of points
// trace the parallel exactly — cheap enough for a globe-spanning grid.
function hParallel(
  id: string, planet: string, color: string, lat: number,
  style: 'duad' | 'compendium' | 'gridline' | 'matrix',
  label?: string, labelLon?: number,
): AcgLine3D {
  const points: GeoPoint[] = [
    { lat, lon: -180 }, { lat, lon: -90 }, { lat, lon: 0 }, { lat, lon: 90 }, { lat, lon: 180 },
  ];
  return { id, planet, angle: 'MC', color, points, style, label, labelLon };
}

/** What duad/compendium/matrix a latitude falls in, given the anchor (tap-to-read). */
export interface BandAt {
  duadIdx: number;
  duadSign: string;
  hiddenTheme: string;
  compendiumSign: string;
  deepestTheme: string;
  matrixSign: string;
  matrixTheme: string;
}

export interface DuadGrid {
  duadLines: AcgLine3D[];
  compendiumLines: AcgLine3D[];
  matrixLines: AcgLine3D[];
  anchorLat: number;
  ascCompIdx: number;
  ascMatrixIdx: number;
  step: number;
  matrixStep: number;
}

/** Map a latitude to its duad + compendium + matrix band. */
export function bandAtLatitude(
  lat: number,
  grid: Pick<DuadGrid, 'anchorLat' | 'ascCompIdx' | 'ascMatrixIdx' | 'step' | 'matrixStep'>,
): BandAt {
  const n = Math.round((lat - grid.anchorLat) / grid.step);
  const j = (((grid.ascCompIdx - n) % COMP_COUNT) + COMP_COUNT) % COMP_COUNT;
  const info = getFullDuadCompendium(compCentreLon(j));
  // Matrix band at this exact latitude (finer than the compendium).
  const m = Math.round((lat - grid.anchorLat) / grid.matrixStep);
  const mi = (((grid.ascMatrixIdx - m) % MATRIX_COUNT) + MATRIX_COUNT) % MATRIX_COUNT;
  const matrixInfo = getFullDuadCompendium(matrixCentreLon(mi));
  return {
    duadIdx: Math.floor(j / 12),
    duadSign: info.duadSign,
    hiddenTheme: info.hiddenTheme,
    compendiumSign: info.compendiumSign,
    deepestTheme: info.deepestTheme,
    matrixSign: matrixInfo.matrixSign,
    matrixTheme: matrixInfo.matrixTheme,
  };
}

/** Build the rising-point-anchored, globe-spanning even Duad Grid. */
export async function getDuadGrid(profile: any): Promise<DuadGrid | null> {
  const chart = await getMyChartBodies(profile, []);
  if (!chart) return null;
  const byName = new Map(chart.bodies.map((b) => [b.name, b.longitude]));
  const ascLon = byName.get('Ascendant');
  const birthLat = typeof profile?.latitude === 'number' ? profile.latitude : null;
  if (ascLon == null || !Number.isFinite(ascLon) || birthLat == null) return null;

  const ascCompIdx = globalCompendiumIndex(ascLon);
  const ascMatrixIdx = globalMatrixIndex(ascLon);
  const anchorLon = typeof profile?.longitude === 'number' ? profile.longitude : 0;
  const labelLon = anchorLon - 12;

  const duadLines: AcgLine3D[] = [];
  const compendiumLines: AcgLine3D[] = [];
  const matrixLines: AcgLine3D[] = [];

  // Even ladder covering the whole sphere: index n steps out from the anchor.
  // lat = birthLat + n·STEP ; compendium index = ascCompIdx − n (increases south).
  const nMin = Math.ceil((-90 - birthLat) / STEP);
  const nMax = Math.floor((90 - birthLat) / STEP);
  for (let n = nMin; n <= nMax; n++) {
    const lat = birthLat + n * STEP;
    const j = (((ascCompIdx - n) % COMP_COUNT) + COMP_COUNT) % COMP_COUNT;
    const info = getFullDuadCompendium(compCentreLon(j));
    // Every rung is a compendium (fine, street-zoom only).
    compendiumLines.push(hParallel(`comp-${j}-${n}`, 'grid', COMP_COLOR, lat, 'compendium'));
    // Every 12th rung is a duad boundary (faint, drawn around the whole globe).
    if (j % 12 === 0) {
      duadLines.push(hParallel(`duad-${Math.floor(j / 12)}-${n}`, 'grid', DUAD_COLOR, lat, 'gridline', `${info.duadSign} duad`, labelLon));
    }
  }

  // Matrix rungs (4th level) — only within a band around the anchor latitude,
  // revealed at the deepest zoom. Building all 20,736 at once would swamp Cesium.
  const mMin = Math.ceil((Math.max(-90, birthLat - MATRIX_WINDOW_DEG) - birthLat) / MATRIX_STEP);
  const mMax = Math.floor((Math.min(90, birthLat + MATRIX_WINDOW_DEG) - birthLat) / MATRIX_STEP);
  for (let m = mMin; m <= mMax; m++) {
    const lat = birthLat + m * MATRIX_STEP;
    const mi = (((ascMatrixIdx - m) % MATRIX_COUNT) + MATRIX_COUNT) % MATRIX_COUNT;
    matrixLines.push(hParallel(`mat-${mi}-${m}`, 'grid', MATRIX_COLOR, lat, 'matrix'));
  }

  // Gold anchor rung at the birth latitude = the Ascendant's own compendium.
  const asc = getFullDuadCompendium(ascLon);
  duadLines.push(hParallel(
    'asc-anchor', 'Ascendant', ASC_COLOR, birthLat, 'duad',
    `Ascendant · ${asc.duadSign} duad / ${asc.compendiumSign} comp`, anchorLon,
  ));

  return { duadLines, compendiumLines, matrixLines, anchorLat: birthLat, ascCompIdx, ascMatrixIdx, step: STEP, matrixStep: MATRIX_STEP };
}
