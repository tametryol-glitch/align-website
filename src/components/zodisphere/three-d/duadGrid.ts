/**
 * Duad Grid — an ORIGINAL Align system: a SOLID, EVEN horizontal grid of the
 * zodiac's full duad/compendium structure, wrapping the whole globe pole-to-pole
 * and anchored to the user's RISING POINT.
 *
 * The zodiac subdivides perfectly evenly:
 *   • 12 signs × 12 = 144 duads       (2.5° of ecliptic each),
 *   • 144 × 12    = 1,728 compendiums  (0°12′30″ each).
 * So the natural map is an even latitude ladder covering the entire sphere:
 *   step = 180° of latitude / 1,728 = 0.10417° per compendium (1.25° per duad).
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

const COMP_COUNT = 1728;                 // total compendiums around the zodiac
const COMP_WIDTH = 2.5 / 12;             // ecliptic degrees per compendium (0.2083°)
const STEP = 180 / COMP_COUNT;           // latitude degrees per compendium (0.10417°)

/** Global compendium index 0..1727 for an ecliptic longitude. */
function globalCompendiumIndex(lon: number): number {
  const L = ((lon % 360) + 360) % 360;
  return Math.min(COMP_COUNT - 1, Math.floor(L / COMP_WIDTH));
}

/** A representative ecliptic longitude at the centre of global compendium j, so
 *  we can read its duad + compendium sign/theme from the validated engine. */
function compCentreLon(j: number): number {
  return (j + 0.5) * COMP_WIDTH;
}

// A constant-latitude line is rendered as a RHUMB line (see the renderer) and is
// probed by pure latitude distance (see probeAcgLines), so a handful of points
// trace the parallel exactly — cheap enough for a globe-spanning grid.
function hParallel(
  id: string, planet: string, color: string, lat: number,
  style: 'duad' | 'compendium' | 'gridline',
  label?: string, labelLon?: number,
): AcgLine3D {
  const points: GeoPoint[] = [
    { lat, lon: -180 }, { lat, lon: -90 }, { lat, lon: 0 }, { lat, lon: 90 }, { lat, lon: 180 },
  ];
  return { id, planet, angle: 'MC', color, points, style, label, labelLon };
}

/** What duad/compendium a latitude falls in, given the anchor (tap-to-read). */
export interface BandAt {
  duadIdx: number;
  duadSign: string;
  hiddenTheme: string;
  compendiumSign: string;
  deepestTheme: string;
}

export interface DuadGrid {
  duadLines: AcgLine3D[];
  compendiumLines: AcgLine3D[];
  anchorLat: number;
  ascCompIdx: number;
  step: number;
}

/** Map a latitude to its duad + compendium band. */
export function bandAtLatitude(lat: number, grid: Pick<DuadGrid, 'anchorLat' | 'ascCompIdx' | 'step'>): BandAt {
  const n = Math.round((lat - grid.anchorLat) / grid.step);
  const j = (((grid.ascCompIdx - n) % COMP_COUNT) + COMP_COUNT) % COMP_COUNT;
  const info = getFullDuadCompendium(compCentreLon(j));
  return {
    duadIdx: Math.floor(j / 12),
    duadSign: info.duadSign,
    hiddenTheme: info.hiddenTheme,
    compendiumSign: info.compendiumSign,
    deepestTheme: info.deepestTheme,
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
  const anchorLon = typeof profile?.longitude === 'number' ? profile.longitude : 0;
  const labelLon = anchorLon - 12;

  const duadLines: AcgLine3D[] = [];
  const compendiumLines: AcgLine3D[] = [];

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

  // Gold anchor rung at the birth latitude = the Ascendant's own compendium.
  const asc = getFullDuadCompendium(ascLon);
  duadLines.push(hParallel(
    'asc-anchor', 'Ascendant', ASC_COLOR, birthLat, 'duad',
    `Ascendant · ${asc.duadSign} duad / ${asc.compendiumSign} comp`, anchorLon,
  ));

  return { duadLines, compendiumLines, anchorLat: birthLat, ascCompIdx, step: STEP };
}
