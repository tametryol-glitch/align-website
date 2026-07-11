/**
 * Location Inspector — turns a tapped point + the user's ACG lines into a
 * location report: which lines influence here, how strongly, the dominant
 * planets, and interpretive life-area SCORES.
 *
 * IMPORTANT: the scores are ASTROLOGICAL INTERPRETIVE scores, not scientific
 * measurements. They are a transparent heuristic over the nearby lines
 * (angle → life-domain, planet → affinity + benefic/challenging valence,
 * weighted by proximity). Every score carries the lines that drove it, so it's
 * explainable, never a black box. No per-user prose is invented.
 *
 * Country lookup is done OFFLINE via point-in-polygon over the bundled
 * Natural Earth country polygons — no geocoding vendor, no network, no exact
 * location ever leaves the device.
 */

import { probeAcgLines, type AcgLine3D, type AcgProbeHit } from './AstrocartographyDataAdapter';

export type Domain = 'Career' | 'Relationships' | 'Financial' | 'Home & Family' | 'Spiritual' | 'Visibility';
export const DOMAINS: Domain[] = ['Career', 'Relationships', 'Financial', 'Home & Family', 'Spiritual', 'Visibility'];

/** Planet → life-domains it favours + a benefic(+)/challenging(−) valence. */
const PLANET_AFFINITY: Record<string, { domains: Domain[]; valence: number }> = {
  Sun: { domains: ['Career', 'Visibility'], valence: 1.0 },
  Moon: { domains: ['Home & Family', 'Relationships'], valence: 0.8 },
  Mercury: { domains: ['Career'], valence: 0.5 },
  Venus: { domains: ['Relationships', 'Financial'], valence: 1.2 },
  Mars: { domains: ['Career'], valence: -0.3 },
  Jupiter: { domains: ['Financial', 'Career', 'Spiritual'], valence: 1.4 },
  Saturn: { domains: ['Career'], valence: -0.6 },
  Uranus: { domains: ['Career', 'Visibility'], valence: 0.2 },
  Neptune: { domains: ['Spiritual'], valence: 0.5 },
  Pluto: { domains: ['Career'], valence: -0.2 },
};

/** Angle → life-domains it governs (with weight). */
const ANGLE_DOMAINS: Record<string, Partial<Record<Domain, number>>> = {
  MC: { Career: 1, Visibility: 1 },
  IC: { 'Home & Family': 1 },
  DSC: { Relationships: 1 },
  ASC: { Visibility: 0.7 },
};

const ORB_DEG = 8; // a line within this range is considered to influence the location

export interface LocationScore { domain: Domain; score: number; drivers: string[]; }
export interface LocationReport {
  nearby: AcgProbeHit[];
  scores: LocationScore[];
  dominantPlanets: string[];
  /** Net benefic-vs-challenging tone: 'ease' | 'mixed' | 'pressure'. */
  tone: 'ease' | 'mixed' | 'pressure';
}

/** Compute the interpretive location report from the visible lines. */
export function computeLocationReport(lat: number, lng: number, lines: AcgLine3D[]): LocationReport {
  const nearby = probeAcgLines(lat, lng, lines, ORB_DEG, 12);
  const raw = Object.fromEntries(DOMAINS.map((d) => [d, 0])) as Record<Domain, number>;
  const drivers = Object.fromEntries(DOMAINS.map((d) => [d, [] as string[]])) as Record<Domain, string[]>;
  const planetStrength: Record<string, number> = {};
  let valenceSum = 0;

  for (const h of nearby) {
    const strength = Math.max(0, 1 - h.distanceDeg / ORB_DEG); // 1 on the line → 0 at the orb edge
    const aff = PLANET_AFFINITY[h.line.planet];
    const valence = aff ? aff.valence : 0.3;
    planetStrength[h.line.planet] = (planetStrength[h.line.planet] || 0) + strength;
    valenceSum += strength * valence;

    for (const [dom, w] of Object.entries(ANGLE_DOMAINS[h.line.angle] || {})) {
      raw[dom as Domain] += strength * (w as number) * valence;
      if (strength > 0.35) drivers[dom as Domain].push(`${h.line.planet} ${h.line.angle}`);
    }
    if (aff) for (const dom of aff.domains) raw[dom] += strength * 0.6 * aff.valence;
  }

  const scores: LocationScore[] = DOMAINS.map((domain) => ({
    domain,
    // 50 = neutral baseline; benefic influence lifts it, challenging lowers it.
    score: Math.round(Math.max(3, Math.min(99, 50 + raw[domain] * 22))),
    drivers: Array.from(new Set(drivers[domain])).slice(0, 3),
  }));

  const dominantPlanets = Object.entries(planetStrength)
    .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([p]) => p);
  const tone: LocationReport['tone'] = valenceSum > 0.6 ? 'ease' : valenceSum < -0.3 ? 'pressure' : 'mixed';

  return { nearby, scores, dominantPlanets, tone };
}

// ── Offline country lookup (point-in-polygon over Natural Earth) ─────────────

type Ring = number[][]; // [ [lng,lat], ... ]

function pointInRing(lng: number, lat: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = (yi > lat) !== (yj > lat) &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + 0) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Name of the country containing (lat,lng), or null. `features` = GeoJSON
 *  country features (Polygon/MultiPolygon) with a NAME property. */
export function countryAt(lat: number, lng: number, features: any[]): string | null {
  for (const f of features) {
    const g = f?.geometry;
    if (!g) continue;
    const polys = g.type === 'MultiPolygon' ? g.coordinates : g.type === 'Polygon' ? [g.coordinates] : [];
    for (const poly of polys) {
      // poly[0] is the outer ring; holes ignored (good enough for country hit-test).
      if (poly[0] && pointInRing(lng, lat, poly[0])) {
        return f.properties?.NAME || f.properties?.name || f.properties?.ADMIN || null;
      }
    }
  }
  return null;
}
