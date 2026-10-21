/**
 * Composite + Synastry + Solar Return place-finding (Zodisphere 3D).
 *
 * NO new astronomy. Everything is built from the validated pieces:
 *   getMyChartBodies (real ephemeris longitudes) → directMidpoint → projectWide
 *   (the unit-tested ASC/DSC/MC/IC projection) at the right Earth rotation.
 *
 *  • COMPOSITE  = midpoint of each pair of same bodies, projected at the temporal
 *                 midpoint of the two births (the same method Soul Places uses,
 *                 minus the draconic rotation).
 *  • SYNASTRY   = both people's NATAL lines on one globe, plus the points where a
 *                 line of one crosses a line of the other (segment intersection).
 *  • BIRTHDAY   = rank cities near a Solar Return's lines.
 *
 * Pure helpers are split from the thin fetch seam so they test without a network.
 */

import { getMyChartBodies, projectWide, bodyInfoOf } from '@/lib/zodisphereMidpoints';
import { gmstAtMoment, ACG_BODY_COLORS } from '@/lib/engines/derivedAcgLines';
import {
  COMPOSITE_BODIES,
  MILES_PER_DEG,
  draconicCompositeLongitudes,
  findSoulPlaces,
  type DraconicCompositeResult,
  type SoulPlace,
} from '@/lib/zodisphere/soulPlaces';
import {
  composeCompositePlace,
  composeSynastryCrossing,
  composeYearPlace,
  BODY_VALENCE,
  type SynastryReading,
} from '@/components/zodisphere/three-d/zodisphereInterpretation';
import type { AcgLine3D, AcgAngle } from '@/components/zodisphere/three-d/AstrocartographyDataAdapter';

export const COLOR_YOU = '#fbbf24';
export const COLOR_THEM = '#a78bfa';
export const COLOR_COUPLE = '#f472b6';

const wrap180 = (x: number) => ((x % 360) + 540) % 360 - 180;

/** Project a {body → ecliptic longitude} map to tagged ACG lines. */
export function projectTagged(
  lonByBody: Record<string, number>,
  gmst: number,
  opts: { prefix: string; color: string; tag: string; owner?: 'A' | 'B' },
): AcgLine3D[] {
  const lines: AcgLine3D[] = [];
  for (const [body, lon] of Object.entries(lonByBody)) {
    for (const raw of projectWide(lon, gmst)) {
      lines.push({
        id: `${opts.prefix}-${body}:${raw.lineType}`,
        planet: opts.tag ? `${opts.tag} ${body}` : body,
        body,
        owner: opts.owner,
        angle: raw.lineType as AcgAngle,
        color: opts.color,
        points: raw.points.map((p) => ({ lat: p.lat, lon: p.lon })),
      });
    }
  }
  return lines;
}

// ── Composite ───────────────────────────────────────────────────────────────

/** PURE: plain composite longitudes (midpoint of each body in both charts). */
export function compositeLongitudes(
  aBy: Map<string, number>,
  bBy: Map<string, number>,
  bodies: readonly string[] = COMPOSITE_BODIES,
) {
  // Node 0 = no draconic rotation, so this is the ordinary composite.
  return draconicCompositeLongitudes(aBy, 0, bBy, 0, bodies);
}

export interface CompositeResult extends DraconicCompositeResult {
  places: SoulPlace[];
}

export async function getCompositeResult(
  profileA: any,
  profileB: any,
  cities: Array<[string, number, number]>,
): Promise<CompositeResult | null> {
  const [chartA, chartB] = await Promise.all([getMyChartBodies(profileA, []), getMyChartBodies(profileB, [])]);
  if (!chartA || !chartB) return null;
  const aBy = new Map(chartA.bodies.map((b) => [b.name, b.longitude]));
  const bBy = new Map(chartB.bodies.map((b) => [b.name, b.longitude]));
  const { compositeLon, unavailable } = compositeLongitudes(aBy, bBy);
  if (!Object.keys(compositeLon).length) return null;
  const mid = new Date((chartA.birthDate.getTime() + chartB.birthDate.getTime()) / 2);
  const lines = projectTagged(compositeLon, gmstAtMoment(mid), { prefix: 'comp', color: COLOR_COUPLE, tag: 'Us' });
  // Keep each body in its own colour so lines stay tell-apart-able.
  const base: DraconicCompositeResult = { lines: lines.map((l) => ({ ...l, color: bodyColor(l.body!) })), compositeLon, unavailable };
  const places = findSoulPlaces(base, cities, 50, 12, 6, composeCompositePlace);
  return { ...base, places };
}

const bodyColor = (b: string) => ACG_BODY_COLORS[b] || bodyInfoOf(b).color;

// ── Synastry ────────────────────────────────────────────────────────────────

export interface Crossing {
  lat: number;
  lon: number;
  a: AcgLine3D;
  b: AcgLine3D;
  reading: SynastryReading;
  city: { name: string; lat: number; lng: number; miles: number } | null;
}

interface Bbox { minLon: number; maxLon: number; minLat: number; maxLat: number; }
function bboxOf(l: AcgLine3D): Bbox {
  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const p of l.points) {
    if (p.lon < minLon) minLon = p.lon;
    if (p.lon > maxLon) maxLon = p.lon;
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
  }
  return { minLon, maxLon, minLat, maxLat };
}
const overlap = (a: Bbox, b: Bbox) =>
  a.minLon <= b.maxLon && b.minLon <= a.maxLon && a.minLat <= b.maxLat && b.minLat <= a.maxLat;

/** Intersection of segments p1p2 and p3p4 in the lon/lat plane, or null. */
export function segmentIntersection(
  x1: number, y1: number, x2: number, y2: number,
  x3: number, y3: number, x4: number, y4: number,
): { x: number; y: number } | null {
  const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
  if (Math.abs(d) < 1e-12) return null; // parallel
  const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d;
  const u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
}

/**
 * PURE: every point where one of A's lines crosses one of B's lines. Parallel
 * meridians (MC/IC vs MC/IC) never intersect, so they correctly produce nothing.
 * Segments that jump across the antimeridian are skipped.
 */
export function findLineCrossings(
  linesA: AcgLine3D[],
  linesB: AcgLine3D[],
): Array<{ lat: number; lon: number; a: AcgLine3D; b: AcgLine3D }> {
  const bbA = linesA.map(bboxOf);
  const bbB = linesB.map(bboxOf);
  const out: Array<{ lat: number; lon: number; a: AcgLine3D; b: AcgLine3D }> = [];
  for (let i = 0; i < linesA.length; i++) {
    for (let j = 0; j < linesB.length; j++) {
      if (!overlap(bbA[i], bbB[j])) continue;
      const pa = linesA[i].points, pb = linesB[j].points;
      const found: Array<{ lat: number; lon: number }> = [];
      for (let s = 0; s < pa.length - 1; s++) {
        const a1 = pa[s], a2 = pa[s + 1];
        if (Math.abs(a2.lon - a1.lon) > 180) continue;
        for (let k = 0; k < pb.length - 1; k++) {
          const b1 = pb[k], b2 = pb[k + 1];
          if (Math.abs(b2.lon - b1.lon) > 180) continue;
          if (Math.max(a1.lon, a2.lon) < Math.min(b1.lon, b2.lon) || Math.max(b1.lon, b2.lon) < Math.min(a1.lon, a2.lon)) continue;
          if (Math.max(a1.lat, a2.lat) < Math.min(b1.lat, b2.lat) || Math.max(b1.lat, b2.lat) < Math.min(a1.lat, a2.lat)) continue;
          const hit = segmentIntersection(a1.lon, a1.lat, a2.lon, a2.lat, b1.lon, b1.lat, b2.lon, b2.lat);
          if (!hit) continue;
          // Dedupe a crossing that sits on a shared vertex of consecutive segments.
          if (found.some((f) => Math.abs(f.lon - hit.x) < 0.5 && Math.abs(f.lat - hit.y) < 0.5)) continue;
          found.push({ lat: hit.y, lon: hit.x });
        }
      }
      for (const f of found) out.push({ ...f, a: linesA[i], b: linesB[j] });
    }
  }
  return out;
}

export function nearestCity(
  lat: number, lon: number, cities: Array<[string, number, number]>, maxMiles = 250,
): Crossing['city'] {
  let best: Crossing['city'] = null;
  const k = Math.cos((lat * Math.PI) / 180);
  for (const [name, clat, clng] of cities) {
    const dy = clat - lat;
    if (Math.abs(dy) > maxMiles / MILES_PER_DEG + 1) continue;
    const dx = wrap180(clng - lon) * k;
    const miles = Math.hypot(dx, dy) * MILES_PER_DEG;
    if (miles <= maxMiles && (!best || miles < best.miles)) best = { name, lat: clat, lng: clng, miles };
  }
  return best;
}

export interface SynastryResult {
  lines: AcgLine3D[];
  crossings: Crossing[];
  unavailable: string[];
}

/** Rank and trim: the best places to thrive, the charged ones, the ones to avoid. */
export function rankCrossings(
  raw: Array<{ lat: number; lon: number; a: AcgLine3D; b: AcgLine3D }>,
  nameB: string,
  cities: Array<[string, number, number]>,
  limits = { thrive: 6, charged: 3, clash: 4 },
): Crossing[] {
  const read = raw.map((r) => ({
    ...r,
    reading: composeSynastryCrossing({
      bodyA: r.a.body!, angleA: r.a.angle, bodyB: r.b.body!, angleB: r.b.angle, nameB,
    }),
  }));
  const pick = (kind: SynastryReading['kind'], n: number, asc: boolean) => {
    const chosen: typeof read = [];
    const pool = read.filter((r) => r.reading.kind === kind).sort((x, y) => (asc ? x.reading.score - y.reading.score : y.reading.score - x.reading.score));
    for (const r of pool) {
      // Spread results: skip a crossing within 4° of one already chosen.
      if (chosen.some((c) => Math.abs(wrap180(c.lon - r.lon)) < 4 && Math.abs(c.lat - r.lat) < 4)) continue;
      chosen.push(r);
      if (chosen.length >= n) break;
    }
    return chosen;
  };
  return [...pick('thrive', limits.thrive, false), ...pick('charged', limits.charged, false), ...pick('clash', limits.clash, true)]
    .map((r) => ({ ...r, city: nearestCity(r.lat, r.lon, cities) }));
}

export async function getSynastryResult(
  profileA: any,
  profileB: any,
  nameB: string,
  cities: Array<[string, number, number]>,
): Promise<SynastryResult | null> {
  const [chartA, chartB] = await Promise.all([getMyChartBodies(profileA, []), getMyChartBodies(profileB, [])]);
  if (!chartA || !chartB) return null;
  const pick = (c: typeof chartA) => {
    const m: Record<string, number> = {};
    for (const b of c.bodies) if ((COMPOSITE_BODIES as readonly string[]).includes(b.name)) m[b.name] = b.longitude;
    return m;
  };
  const short = (nameB || 'Them').split(' ')[0].slice(0, 12);
  const linesA = projectTagged(pick(chartA), gmstAtMoment(chartA.birthDate), { prefix: 'synA', color: COLOR_YOU, tag: 'You', owner: 'A' });
  const linesB = projectTagged(pick(chartB), gmstAtMoment(chartB.birthDate), { prefix: 'synB', color: COLOR_THEM, tag: short, owner: 'B' });
  if (!linesA.length || !linesB.length) return null;
  const raw = findLineCrossings(linesA, linesB);
  const crossings = rankCrossings(raw, short, cities);
  const unavailable = (COMPOSITE_BODIES as readonly string[]).filter((n) => !(n in pick(chartA)) || !(n in pick(chartB)));
  return { lines: [...linesA, ...linesB], crossings, unavailable };
}

// ── Solar Return birthday spots ─────────────────────────────────────────────

export interface BirthdayPlace extends SoulPlace { valence: number; }

/** Rank cities near the Solar Return lines: best bets first, then the hard ones. */
export function rankBirthdayPlaces(
  lines: AcgLine3D[],
  cities: Array<[string, number, number]>,
  year: number,
  maxMiles = 75,
): { best: BirthdayPlace[]; avoid: BirthdayPlace[] } {
  const fake: DraconicCompositeResult = { lines, compositeLon: {}, unavailable: [] };
  const found = findSoulPlaces(fake, cities, maxMiles, 60, 4, (o) => composeYearPlace({ body: o.body, angle: o.angle, distanceMiles: o.distanceMiles, year }));
  const scored: BirthdayPlace[] = found.map((p) => ({ ...p, valence: BODY_VALENCE[p.body] ?? 0 }));
  const best = scored.filter((p) => p.valence > 0).sort((a, b) => b.valence - a.valence || a.distanceMiles - b.distanceMiles).slice(0, 6);
  const avoid = scored.filter((p) => p.valence < 0).sort((a, b) => a.valence - b.valence || a.distanceMiles - b.distanceMiles).slice(0, 3);
  return { best, avoid };
}
