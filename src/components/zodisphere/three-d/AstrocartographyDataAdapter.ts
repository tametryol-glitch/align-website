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
import {
  getMyChartBodies,
  projectWide,
  buildMidpointLines,
  probeMidpoints,
  bodyInfoOf,
  ASTEROID_CATALOG,
  ASTEROID_CATALOG_NAMES,
  type MidpointLine,
  type ProbeHit,
} from '@/lib/zodisphereMidpoints';
import { gmstAtMoment, ACG_BODY_COLORS } from '@/lib/engines/derivedAcgLines';
import { duadPosition, compendiumPosition, normalizeLongitude360 } from '@/lib/engines/derivedAstroMath';
import { getFullDuadCompendium } from '@/lib/engines/duadCompendium';

export type { MidpointLine, ProbeHit };
export { probeMidpoints };

import { calculateParanLines, type ParanLine } from './parans';
export type { ParanLine };
export { getDuadGrid, bandAtLatitude, type LatMapping, type DuadGrid, type DuadGridEntry, type BandAt } from './duadGrid';

/** Compute the chart's paran latitudes (reuses Align's production algorithm). */
export async function getParans3D(profile: any): Promise<ParanLine[]> {
  const chart = await getMyChartBodies(profile, []);
  if (!chart) return [];
  return calculateParanLines(chart.bodies, chart.birthDate);
}

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
  /** Render style: default vertical ACG line, or a horizontal Duad-Grid line:
   *  'gridline' = faint even ladder rung, 'duad' = a planet's highlighted duad,
   *  'compendium' = finer sub-line revealed on zoom-in. */
  style?: 'natal' | 'duad' | 'compendium' | 'gridline';
  /** Optional text label for a horizontal grid line, placed at `labelLon`. */
  label?: string;
  labelLon?: number;
  /** For duad/compendium lines: the derived sign + its hidden/deepest theme. */
  derivedSign?: string;
  theme?: string;
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

// ── Full body catalog (planets + points + asteroids) ────────────────────────

/** The classic planets, always available for ACG lines. */
export const ACG_PLANETS = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
];

/** Extra chart points that are meaningful to project (NOT the angles Asc/MC
 *  themselves). Availability depends on the chart; unavailable ones simply
 *  produce no line rather than a wrong one. */
export const ACG_POINTS = ['Chiron', 'North Node', 'South Node', 'Lilith', 'Vertex'];

/** Every asteroid the backend can compute on request (name → catalog number). */
export const ACG_ASTEROIDS = ASTEROID_CATALOG_NAMES;

/** Points/angles we must never try to project as a body. */
const NON_PROJECTABLE = new Set(['Ascendant', 'Midheaven', 'Descendant', 'IC']);

/**
 * Project ACG lines for an ARBITRARY set of bodies — planets, points and/or
 * asteroids — reusing the SAME validated pipeline: getMyChartBodies fetches the
 * real longitudes (asteroids via the backend's extra_asteroids), and projectWide
 * (unit-tested) turns each into ASC/DSC/MC/IC lines. No new astronomy. Bodies
 * the chart can't produce are silently skipped (never faked).
 *
 * Returns the lines plus the list of requested bodies that were unavailable, so
 * the UI can honestly mark them rather than imply they rendered.
 */
/** Chart layers that are pure client-side transforms of the natal longitudes
 *  (no new fetch, no fabrication): the natal chart, Align's Duad and Compendium
 *  derived layers, and the node-relative Draconic chart. */
export type ChartLayer = 'natal' | 'duad' | 'compendium' | 'draconic';

/** Transform a natal ecliptic longitude into the chosen layer's longitude. */
function transformLongitude(lon: number, layer: ChartLayer, nodeLon: number | null): number | null {
  switch (layer) {
    case 'natal': return lon;
    case 'duad': return duadPosition(lon).longitude;
    case 'compendium': return compendiumPosition(lon).longitude;
    case 'draconic': return nodeLon == null ? null : normalizeLongitude360(lon - nodeLon);
  }
}

export async function getBodyAcgLines(
  profile: any,
  bodyNames: string[],
  layer: ChartLayer = 'natal',
): Promise<{ lines: AcgLine3D[]; unavailable: string[] }> {
  if (!bodyNames.length) return { lines: [], unavailable: [] };
  // Ask the backend to also compute any requested asteroids.
  const extras = bodyNames.filter((n) => n in ASTEROID_CATALOG);
  const chart = await getMyChartBodies(profile, extras);
  if (!chart) return { lines: [], unavailable: bodyNames };

  const gmst = gmstAtMoment(chart.birthDate);
  const wanted = bodyNames.filter((n) => !NON_PROJECTABLE.has(n));
  const byName = new Map(chart.bodies.map((b) => [b.name, b.longitude]));
  // Draconic rotates the whole chart so the North Node sits at 0° Aries.
  const nodeLon = byName.get('North Node') ?? null;

  const lines: AcgLine3D[] = [];
  const unavailable: string[] = [];
  for (const name of wanted) {
    const natalLon = byName.get(name);
    if (natalLon == null || !Number.isFinite(natalLon)) { unavailable.push(name); continue; }
    const lon = transformLongitude(natalLon, layer, nodeLon);
    if (lon == null || !Number.isFinite(lon)) { unavailable.push(name); continue; }
    const color = ACG_BODY_COLORS[name] || bodyInfoOf(name).color;
    for (const raw of projectWide(lon, gmst)) {
      lines.push({
        id: `${name}:${raw.lineType}`,
        planet: name,
        angle: raw.lineType as AcgAngle,
        color,
        points: raw.points.map((p) => ({ lat: p.lat, lon: p.lon })),
      });
    }
  }
  return { lines, unavailable };
}

// ── Geographically-accurate Duad / Compendium lines ─────────────────────────

const GEO_DUAD_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

/**
 * The Duad system as REAL astrocartography — not a symbolic ladder. For each
 * planet we project THREE line sets from the SAME validated pipeline
 * (gmstAtMoment + projectWide), so every line lands at the genuine place on
 * Earth where that point is angular:
 *   • natal      — the planet itself (solid glow),
 *   • duad       — the planet's DUAD longitude (2.5° subdivision) as ACG lines,
 *   • compendium — its COMPENDIUM longitude (0°12′30″), zoom-gated to street level.
 * A natal line crossing a duad line is therefore a true geographic point. The
 * duad/compendium lines carry their derived sign + hidden theme for tap-to-read.
 * No new astronomy, no fabricated coordinates.
 */
export async function getGeographicDuadLines(
  profile: any,
  bodyNames: string[] = GEO_DUAD_PLANETS,
): Promise<AcgLine3D[]> {
  const chart = await getMyChartBodies(profile, []);
  if (!chart) return [];
  const gmst = gmstAtMoment(chart.birthDate);
  const byName = new Map(chart.bodies.map((b) => [b.name, b.longitude]));

  const out: AcgLine3D[] = [];
  for (const name of bodyNames) {
    if (NON_PROJECTABLE.has(name)) continue;
    const natalLon = byName.get(name);
    if (natalLon == null || !Number.isFinite(natalLon)) continue;
    const color = ACG_BODY_COLORS[name] || bodyInfoOf(name).color;
    const full = getFullDuadCompendium(natalLon);
    const duadLon = duadPosition(natalLon).longitude;
    const compLon = compendiumPosition(natalLon).longitude;

    for (const raw of projectWide(natalLon, gmst)) {
      out.push({
        id: `${name}:${raw.lineType}`, planet: name, angle: raw.lineType as AcgAngle, color,
        points: raw.points.map((p) => ({ lat: p.lat, lon: p.lon })), style: 'natal',
      });
    }
    for (const raw of projectWide(duadLon, gmst)) {
      out.push({
        id: `${name}:duad:${raw.lineType}`, planet: name, angle: raw.lineType as AcgAngle, color,
        points: raw.points.map((p) => ({ lat: p.lat, lon: p.lon })), style: 'duad',
        derivedSign: full.duadSign, theme: full.hiddenTheme,
      });
    }
    for (const raw of projectWide(compLon, gmst)) {
      out.push({
        id: `${name}:comp:${raw.lineType}`, planet: name, angle: raw.lineType as AcgAngle, color,
        points: raw.points.map((p) => ({ lat: p.lat, lon: p.lon })), style: 'compendium',
        derivedSign: full.compendiumSign, theme: full.deepestTheme,
      });
    }
  }
  return out;
}

// ── Tap-to-read probe for natal ACG lines ───────────────────────────────────

const D2R = Math.PI / 180;

/** Great-circle angular distance (degrees) between two lat/lng points. */
export function angularDistanceDeg(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const s = Math.sin((lat2 - lat1) * D2R / 2) ** 2 +
    Math.cos(lat1 * D2R) * Math.cos(lat2 * D2R) * Math.sin((lon2 - lon1) * D2R / 2) ** 2;
  return (2 * Math.asin(Math.min(1, Math.sqrt(s)))) / D2R;
}

export interface AcgProbeHit {
  line: AcgLine3D;
  distanceDeg: number;
  distanceKm: number;
}

/**
 * Nearest natal ACG lines to a tapped point, closest first, within `orbDeg`.
 * The orb is a generous touch target (mobile taps are imprecise) — it does NOT
 * move the exact mathematical line, only decides what's "near enough" to read.
 */
export function probeAcgLines(
  lat: number,
  lng: number,
  lines: AcgLine3D[],
  orbDeg = 2,
  max = 4,
): AcgProbeHit[] {
  const hits: AcgProbeHit[] = [];
  for (const line of lines) {
    let best = Infinity;
    for (const p of line.points) {
      const d = angularDistanceDeg(lat, lng, p.lat, p.lon);
      if (d < best) best = d;
    }
    if (best <= orbDeg) hits.push({ line, distanceDeg: best, distanceKm: best * 111.195 });
  }
  return hits.sort((a, b) => a.distanceDeg - b.distanceDeg).slice(0, max);
}

// ── Midpoints ───────────────────────────────────────────────────────────────

export interface MidpointPair { a: string; b: string; }

/**
 * Build midpoint ACG lines for a set of body PAIRS. Reuses the validated
 * midpoint engine (getMyChartBodies for real longitudes incl. asteroids, then
 * buildMidpointLines = directMidpoint + projectWide). Returns both a render set
 * (AcgLine3D for the globe) and the raw MidpointLine[] (for tap-to-read
 * probing), plus any pairs that couldn't be built.
 */
export async function getMidpointLines3D(
  profile: any,
  pairs: MidpointPair[],
): Promise<{ render: AcgLine3D[]; mid: MidpointLine[]; unavailable: MidpointPair[] }> {
  if (!pairs.length) return { render: [], mid: [], unavailable: [] };
  const names = pairs.flatMap((p) => [p.a, p.b]);
  const extras = names.filter((n) => n in ASTEROID_CATALOG);
  const chart = await getMyChartBodies(profile, extras);
  if (!chart) return { render: [], mid: [], unavailable: pairs };

  const byName = new Map(chart.bodies.map((b) => [b.name, b.longitude]));
  const mid: MidpointLine[] = [];
  const unavailable: MidpointPair[] = [];
  for (const { a, b } of pairs) {
    const lonA = byName.get(a);
    const lonB = byName.get(b);
    if (lonA == null || lonB == null || !Number.isFinite(lonA) || !Number.isFinite(lonB)) {
      unavailable.push({ a, b });
      continue;
    }
    mid.push(...buildMidpointLines(a, b, lonA, lonB, chart.birthDate));
  }

  const render: AcgLine3D[] = mid.map((l, i) => ({
    id: `mid-${l.key}:${l.lineType}:${i}`,
    planet: `${l.bodyA}/${l.bodyB}`,
    angle: l.lineType as AcgAngle,
    color: l.color,
    points: l.points.map((p) => ({ lat: p.lat, lon: p.lon })),
  }));
  return { render, mid, unavailable };
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
