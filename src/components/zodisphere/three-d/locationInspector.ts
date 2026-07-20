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
import { getFullDuadCompendium, getHouseForSign, RULERS } from '@/lib/engines/duadCompendium';
import { DEFAULT_WEIGHTS, type InterpretationWeights, type NatalContext } from './zodisphereInterpretation';

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
  // Custom rulerships used by the duad engine (Vesta→Virgo, Juno→Libra).
  Vesta: { domains: ['Career', 'Spiritual'], valence: 0.4 }, // service, health, devotion
  Juno: { domains: ['Relationships'], valence: 0.7 },        // partnership, commitment
};

/** Angle → life-domains it governs (with weight). */
const ANGLE_DOMAINS: Record<string, Partial<Record<Domain, number>>> = {
  MC: { Career: 1, Visibility: 1 },
  IC: { 'Home & Family': 1 },
  DSC: { Relationships: 1 },
  ASC: { Visibility: 0.7 },
};

/** House → life-domains it governs (with weight). This is the bridge that lets
 *  the duad/compendium/matrix layers feed the category scores: each layer sign
 *  resolves to a house, and the house says which life-area it colours. Angular
 *  houses (1/4/7/10) carry their domain fully; succedent/cadent houses lighter. */
const HOUSE_DOMAINS: Record<number, Partial<Record<Domain, number>>> = {
  1: { Visibility: 0.8 },
  2: { Financial: 1.0 },
  3: { Career: 0.35 },                    // local mind / communication
  4: { 'Home & Family': 1.0 },
  5: { Relationships: 0.7 },              // romance / creativity
  6: { Career: 0.6 },                     // daily work / health
  7: { Relationships: 1.0 },
  8: { Financial: 0.7, Spiritual: 0.3 },  // shared resources / transformation
  9: { Spiritual: 1.0 },
  10: { Career: 1.0, Visibility: 0.8 },
  11: { Career: 0.4, Relationships: 0.4 }, // networks / community
  12: { Spiritual: 0.8 },
};

const ORB_DEG = 8; // a line within this range is considered to influence the location

// Emphasis applied to the house-layer ladder (Placement/duad/comp/matrix) when
// routing them into the scores. The raw ladder weights (.70/.15/.10/.05) are
// RELATIVE importances; on their own they'd nudge a 3–99 bar by a fraction of a
// point. This lifts them to a clearly-felt level — the Placement house moves a
// bar ~10–18 pts per strong nearby line, the duad a few, the matrix under one —
// so the deeper structure visibly shapes the categories. Tune to taste.
const LAYER_EMPHASIS = 1.5;

export interface LocationScore { domain: Domain; score: number; drivers: string[]; }
export interface LocationReport {
  nearby: AcgProbeHit[];
  scores: LocationScore[];
  dominantPlanets: string[];
  /** Net benefic-vs-challenging tone: 'ease' | 'mixed' | 'pressure'. */
  tone: 'ease' | 'mixed' | 'pressure';
}

/**
 * Compute the interpretive location report from the visible lines.
 *
 * When `natalCtx` is supplied, each nearby line also contributes its deeper
 * layers — the planet's own duad / compendium / matrix — routed to a life-domain
 * by the HOUSE each layer-sign falls in, weighted on the canonical ladder
 * (duad .15 / comp .10 / matrix .05). Deeper layers are progressively subtler,
 * so a matrix refines a bar but can never overpower the surface line. Without a
 * natalCtx it falls back to the surface-only (planet × angle) scoring.
 */
export function computeLocationReport(
  lat: number,
  lng: number,
  lines: AcgLine3D[],
  natalCtx?: NatalContext,
  weights: InterpretationWeights = DEFAULT_WEIGHTS,
): LocationReport {
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

    // House layers: route this planet's placement + duad/compendium/matrix into
    // the categories by the HOUSE each sign falls in. The Placement layer (the
    // planet's own natal-sign house) is the strong, CONSISTENT signal — every
    // nearby planet has one, so every tap moves the bars its houses point to; the
    // duad/comp/matrix then refine on the canonical ladder (.15/.10/.05). This is
    // the "Planet+House 45 / Sign 25 / Duad 15 / Comp 10 / Matrix 5" spec, routed
    // to the score bars. Valence: the planet's own for Placement, each sign's
    // ruler for the deeper layers.
    if (natalCtx && strength > 0) {
      const lon = natalCtx.bodies.get(h.line.planet);
      if (lon != null && Number.isFinite(lon)) {
        const f = getFullDuadCompendium(lon);
        const rulerVal = (sign: string) => {
          const r = RULERS[sign];
          return r && PLANET_AFFINITY[r] ? PLANET_AFFINITY[r].valence : 0.3;
        };
        // [label, sign, ladder-weight, valence]
        const stack: Array<[string, string, number, number]> = [
          ['Placement', f.sign, weights.planetHouse + weights.natalSign, valence],
          ['Duad', f.duadSign, weights.duad, rulerVal(f.duadSign)],
          ['Compendium', f.compendiumSign, weights.compendium, rulerVal(f.compendiumSign)],
          ['Matrix', f.matrixSign, weights.matrix, rulerVal(f.matrixSign)],
        ];
        for (const [label, sign, w, lv] of stack) {
          const house = getHouseForSign(sign, natalCtx.ascSign);
          for (const [dom, hw] of Object.entries(HOUSE_DOMAINS[house] || {})) {
            const add = strength * w * LAYER_EMPHASIS * (hw as number) * lv;
            raw[dom as Domain] += add;
            if (Math.abs(add) > 0.08) drivers[dom as Domain].push(`${label} ${sign} · ${house}h`);
          }
        }
      }
    }
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
