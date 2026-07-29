/**
 * Draconic Composite "Soul Places" (Zodisphere, Phase 1).
 *
 * Blends two people's DRACONIC (soul) charts into a composite and projects it
 * onto Earth, then surfaces the real cities where a composite soul-line runs
 * within 50 miles — each with a "what could have been" two-soul reading.
 *
 * NO new astronomy: reuses the validated pipeline —
 *   getMyChartBodies (real longitudes) → per-person draconic rotation
 *   (body − own North Node) → directMidpoint of the two → projectWide (the
 *   unit-tested ASC/DSC/MC/IC projection) at the composite GMST.
 *
 * Method (see DRACONIC-COMPOSITE-SOUL-PLACES-SPEC.md):
 *  • Composite OF draconics — each person is rotated by their OWN node first.
 *  • Composite Earth-rotation (GMST) = the temporal midpoint of the two births.
 *  • Orb = 50 statute miles, delivered as a ranked list (not tap-to-find).
 *
 * The math is split into pure functions (draconicCompositeLongitudes,
 * projectDraconicCompositeLines, findSoulPlaces) so it is unit-testable without
 * the network; getDraconicCompositeAcgLines is the thin fetch-and-compose seam.
 */

import {
  getMyChartBodies,
  projectWide,
  directMidpoint,
  bodyInfoOf,
} from '@/lib/zodisphereMidpoints';
import { gmstAtMoment, ACG_BODY_COLORS } from '@/lib/engines/derivedAcgLines';
import {
  composeDraconicComposite,
  type SoulPlaceReading,
} from '@/components/zodisphere/three-d/zodisphereInterpretation';
import type { AcgLine3D, AcgAngle } from '@/components/zodisphere/three-d/AstrocartographyDataAdapter';

/** Bodies projected for the composite (the classical ten). The North Node is
 *  excluded: its draconic longitude is 0° for everyone, so its composite line is
 *  degenerate and not personal. */
export const COMPOSITE_BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
] as const;

/** 1° of great-circle arc = 60 nautical miles = 69.047 statute miles. */
export const MILES_PER_DEG = 69.047;

const norm360 = (x: number) => ((x % 360) + 360) % 360;
/** Signed longitude delta wrapped to [-180, 180]. */
const wrap180 = (x: number) => ((x % 360) + 540) % 360 - 180;

/**
 * Great-circle-ish distance (statute miles) from a point to the SEGMENT A→B,
 * using a local equirectangular approximation (longitude scaled by cos(lat)).
 * Accurate to well under a mile at the <100-mile scale we care about, and — by
 * measuring to the segment, not just its endpoints — immune to the line's 1°
 * vertex spacing (which alone could misjudge distance by ~35 miles).
 */
function pointToSegmentMiles(
  clat: number, clng: number,
  aLat: number, aLon: number,
  bLat: number, bLon: number,
): number {
  const k = Math.cos((clat * Math.PI) / 180);
  const ax = wrap180(aLon - clng) * k, ay = aLat - clat;
  const bx = wrap180(bLon - clng) * k, by = bLat - clat;
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 > 0 ? -(ax * dx + ay * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.hypot(cx, cy) * MILES_PER_DEG; // degrees → miles
}

export interface DraconicCompositeResult {
  lines: AcgLine3D[];
  /** body → composite draconic ecliptic longitude (for interpretation). */
  compositeLon: Record<string, number>;
  /** bodies missing from one or both charts. */
  unavailable: string[];
}

export interface SoulPlace {
  city: string;
  lat: number;
  lng: number;
  body: string;
  angle: AcgAngle;
  distanceMiles: number;
  reading: SoulPlaceReading;
}

/**
 * PURE: composite-of-draconics longitudes. For each body present in both charts:
 * rotate by each person's OWN North Node, then take the direct midpoint.
 */
export function draconicCompositeLongitudes(
  aBy: Map<string, number>,
  nodeA: number,
  bBy: Map<string, number>,
  nodeB: number,
  bodies: readonly string[] = COMPOSITE_BODIES,
): { compositeLon: Record<string, number>; unavailable: string[] } {
  const compositeLon: Record<string, number> = {};
  const unavailable: string[] = [];
  for (const name of bodies) {
    const la = aBy.get(name);
    const lb = bBy.get(name);
    if (la == null || lb == null || !Number.isFinite(la) || !Number.isFinite(lb)) {
      unavailable.push(name);
      continue;
    }
    const dracA = norm360(la - nodeA);
    const dracB = norm360(lb - nodeB);
    compositeLon[name] = directMidpoint(dracA, dracB);
  }
  return { compositeLon, unavailable };
}

/** PURE: project each composite-draconic longitude to its four ACG lines. */
export function projectDraconicCompositeLines(
  compositeLon: Record<string, number>,
  gmst: number,
): AcgLine3D[] {
  const lines: AcgLine3D[] = [];
  for (const [name, lon] of Object.entries(compositeLon)) {
    const color = ACG_BODY_COLORS[name] || bodyInfoOf(name).color;
    for (const raw of projectWide(lon, gmst)) {
      lines.push({
        id: `soul-${name}:${raw.lineType}`,
        planet: name,
        angle: raw.lineType as AcgAngle,
        color,
        points: raw.points.map((p) => ({ lat: p.lat, lon: p.lon })),
      });
    }
  }
  return lines;
}

/**
 * Build the draconic-composite ACG lines for two people. Fetches both charts
 * (real ephemeris), rotates each by its own node, midpoints, and projects at the
 * temporal-midpoint GMST. Returns null if either chart or node is unavailable.
 */
export async function getDraconicCompositeAcgLines(
  profileA: any,
  profileB: any,
): Promise<DraconicCompositeResult | null> {
  const [chartA, chartB] = await Promise.all([
    getMyChartBodies(profileA),
    getMyChartBodies(profileB),
  ]);
  if (!chartA || !chartB) return null;

  const aBy = new Map(chartA.bodies.map((b) => [b.name, b.longitude]));
  const bBy = new Map(chartB.bodies.map((b) => [b.name, b.longitude]));
  const nodeA = aBy.get('North Node');
  const nodeB = bBy.get('North Node');
  if (nodeA == null || nodeB == null || !Number.isFinite(nodeA) || !Number.isFinite(nodeB)) {
    return null;
  }

  const { compositeLon, unavailable } = draconicCompositeLongitudes(aBy, nodeA, bBy, nodeB);
  if (!Object.keys(compositeLon).length) return null;

  // Composite Earth-rotation: the temporal midpoint of the two births.
  const midTime = new Date((chartA.birthDate.getTime() + chartB.birthDate.getTime()) / 2);
  const gmst = gmstAtMoment(midTime);

  const lines = projectDraconicCompositeLines(compositeLon, gmst);
  if (!lines.length) return null;
  return { lines, compositeLon, unavailable };
}

/**
 * PURE: for each composite soul-line, find the closest city within `maxMiles`,
 * attach the two-soul reading, and return the ranked list (closest first, at
 * most `max`). One entry per line, so the list spreads across the soul-lines
 * (your Venus soul-line's place, your Mars soul-line's place, …) rather than a
 * cluster of suburbs around a single line.
 */
export function findSoulPlaces(
  result: DraconicCompositeResult,
  cities: Array<[string, number, number]>,
  maxMiles = 50,
  max = 12,
): SoulPlace[] {
  const latMargin = maxMiles / MILES_PER_DEG + 1; // segments span ≤1° of latitude
  const out: SoulPlace[] = [];

  for (const line of result.lines) {
    let best: { city: string; lat: number; lng: number; d: number } | null = null;
    for (const [city, clat, clng] of cities) {
      let bd = Infinity;
      for (let i = 0; i < line.points.length - 1; i++) {
        const a = line.points[i], b = line.points[i + 1];
        // Cheap latitude reject: skip segments whose whole latitude span is out
        // of reach (the orb is tiny, so almost every segment is dismissed here).
        if (Math.abs(a.lat - clat) > latMargin && Math.abs(b.lat - clat) > latMargin) continue;
        const d = pointToSegmentMiles(clat, clng, a.lat, a.lon, b.lat, b.lon);
        if (d < bd) bd = d;
      }
      if (bd <= maxMiles && (!best || bd < best.d)) best = { city, lat: clat, lng: clng, d: bd };
    }
    if (best) {
      const lon = result.compositeLon[line.planet];
      out.push({
        city: best.city,
        lat: best.lat,
        lng: best.lng,
        body: line.planet,
        angle: line.angle,
        distanceMiles: best.d,
        reading: composeDraconicComposite({
          body: line.planet,
          angle: line.angle,
          compositeDraconicLon: lon,
          distanceMiles: best.d,
        }),
      });
    }
  }

  return out.sort((a, b) => a.distanceMiles - b.distanceMiles).slice(0, max);
}
