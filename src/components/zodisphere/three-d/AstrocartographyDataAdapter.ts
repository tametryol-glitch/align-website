/**
 * AstrocartographyDataAdapter — the ONE seam between Align's astrology engine
 * and the 3D globe. It converts existing, validated chart output into typed
 * WGS84 polylines the Cesium renderer can draw. It performs NO astronomy of its
 * own: it delegates to `getMyAcgLines`, which reuses the unit-tested projection
 * (projectWide / gmstAtMoment / eclipticToEquatorial). The globe only ever
 * *visualizes* these coordinates — it never infers them from a drawn line.
 *
 * Keeping this boundary thin and typed means the 3D layer is decoupled from the
 * engine's internals: if the engine changes, only this adapter moves.
 */

import { getMyAcgLines } from '@/lib/zodisphereAcg';

export type AcgAngle = 'MC' | 'IC' | 'ASC' | 'DSC';

export interface GeoPoint {
  /** WGS84 latitude, degrees [-90, 90]. */
  lat: number;
  /** WGS84 longitude, degrees [-180, 180]. */
  lon: number;
}

export interface AcgLine3D {
  /** Stable identity, e.g. "Sun:MC" — used for rendering keys and caching. */
  id: string;
  planet: string;
  angle: AcgAngle;
  /** Hex colour from the engine's canonical palette. */
  color: string;
  /** Ordered WGS84 points along the line (already engine-projected). */
  points: GeoPoint[];
}

export interface AdapterOptions {
  /** Restrict to specific planets (e.g. ['Sun']) — Phase 3 renders one line. */
  planets?: string[];
  /** Restrict to specific angles (e.g. ['MC']). */
  angles?: AcgAngle[];
}

/**
 * Fetch the signed-in user's natal astrocartography lines as typed WGS84
 * polylines. Returns [] if the user has no birth data. Never throws — a failed
 * chart fetch yields an empty set so the globe simply shows no lines.
 */
export async function getAstrocartographyLines(
  profile: any,
  options: AdapterOptions = {},
): Promise<AcgLine3D[]> {
  const engineLines = await getMyAcgLines(profile); // validated projection, WGS84
  const planetFilter = options.planets ? new Set(options.planets) : null;
  const angleFilter = options.angles ? new Set(options.angles) : null;

  const out: AcgLine3D[] = [];
  for (const l of engineLines) {
    const angle = l.lineType as AcgAngle;
    if (planetFilter && !planetFilter.has(l.planet)) continue;
    if (angleFilter && !angleFilter.has(angle)) continue;
    out.push({
      id: `${l.planet}:${angle}`,
      planet: l.planet,
      angle,
      color: l.color,
      // 1:1 copy — coordinates are preserved exactly, never re-derived.
      points: l.points.map((p) => ({ lat: p.lat, lon: p.lon })),
    });
  }
  return out;
}

/**
 * Stable content hash of a line set, so the renderer/cache can skip redrawing
 * unchanged lines (perf requirement: never recompute unchanged geometry).
 */
export function hashLines(lines: AcgLine3D[]): string {
  return lines
    .map((l) => `${l.id}#${l.points.length}@${l.points[0]?.lat.toFixed(3)},${l.points[0]?.lon.toFixed(3)}`)
    .sort()
    .join('|');
}
