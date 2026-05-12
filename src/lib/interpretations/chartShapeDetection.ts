/**
 * Chart Shape Detection — identifies the overall distribution pattern
 * of planets around the wheel (Bowl, Bucket, Bundle, Locomotive, etc.).
 */

import type { ChartPlanet } from './patternTypes';
import {
  isAllowedBody, canonicalBodyName, normLon, angularDist,
  type DetectedChartShape, type PatternMember, type ChartShapeType,
} from './patternTypes';

/* -- helpers --------------------------------------------------------- */

const SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

function signOf(lon: number): string { return SIGNS[Math.floor(normLon(lon) / 30) % 12]; }
function houseOf(p: ChartPlanet): number { return p.house || 1; }

function toMember(p: ChartPlanet, role: PatternMember['role'] = 'member'): PatternMember {
  return { name: canonicalBodyName(p.name), sign: p.sign || signOf(p.longitude), house: houseOf(p), longitude: normLon(p.longitude), role };
}

/** Sort longitudes and compute gaps between consecutive planets. */
function computeGaps(lons: number[]): { sorted: number[]; gaps: { start: number; end: number; size: number }[] } {
  const sorted = [...lons].sort((a, b) => a - b);
  const gaps: { start: number; end: number; size: number }[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const next = (i + 1) % sorted.length;
    const start = sorted[i];
    const end = sorted[next];
    const size = next === 0 ? (360 - start + end) : (end - start);
    gaps.push({ start, end, size });
  }
  return { sorted, gaps };
}

function occupiedSpan(lons: number[]): number {
  if (lons.length < 2) return 0;
  const { gaps } = computeGaps(lons);
  const maxGap = Math.max(...gaps.map(g => g.size));
  return 360 - maxGap;
}

function largestGap(lons: number[]): number {
  if (lons.length < 2) return 360;
  const { gaps } = computeGaps(lons);
  return Math.max(...gaps.map(g => g.size));
}

/** Count how many 30-degree sectors are occupied. */
function occupiedSectors(lons: number[]): number {
  const buckets = new Set<number>();
  for (const l of lons) buckets.add(Math.floor(normLon(l) / 30));
  return buckets.size;
}

/** Find the planet closest to the midpoint of the largest gap (handle). */
function findHandle(planets: ChartPlanet[], lons: number[]): ChartPlanet | undefined {
  const { gaps } = computeGaps(lons);
  const maxGap = Math.max(...gaps.map(g => g.size));
  const mainGap = gaps.find(g => g.size === maxGap)!;
  const gapMid = normLon(mainGap.start + mainGap.size / 2);
  let best: ChartPlanet | undefined;
  let bestDist = 999;
  for (const p of planets) {
    const d = angularDist(normLon(p.longitude), gapMid);
    if (d < bestDist) { bestDist = d; best = p; }
  }
  return best;
}

/** Find leading planet (first after largest gap, clockwise). */
function findLeading(planets: ChartPlanet[], lons: number[]): ChartPlanet | undefined {
  const { gaps } = computeGaps(lons);
  const maxGap = Math.max(...gaps.map(g => g.size));
  const mainGap = gaps.find(g => g.size === maxGap)!;
  const afterGap = normLon(mainGap.end);
  let best: ChartPlanet | undefined;
  let bestDist = 999;
  for (const p of planets) {
    const d = angularDist(normLon(p.longitude), afterGap);
    if (d < bestDist) { bestDist = d; best = p; }
  }
  return best;
}

/* -- main detection -------------------------------------------------- */

export function detectChartShape(planets: ChartPlanet[]): DetectedChartShape | null {
  const allowed = planets.filter(p => isAllowedBody(p.name));
  if (allowed.length < 6) return null;

  const lons = allowed.map(p => normLon(p.longitude));
  const span = occupiedSpan(lons);
  const gap = largestGap(lons);
  const sectors = occupiedSectors(lons);

  const candidates: DetectedChartShape[] = [];

  // -- Bundle: all planets within ~120 degrees --
  if (span <= 125) {
    candidates.push({
      type: 'Bundle',
      confidence: Math.round(Math.max(50, 100 - (span - 90) * 2)),
      occupiedSpan: span,
      emptySpan: gap,
      description: 'All planets concentrated within ' + Math.round(span) + ' degrees — intense focus.',
    });
  }

  // -- Bowl: planets within ~180 degrees --
  if (span <= 190 && span > 120) {
    const lead = findLeading(allowed, lons);
    candidates.push({
      type: 'Bowl',
      confidence: Math.round(Math.max(50, 100 - Math.abs(span - 180) * 2)),
      leadingPlanet: lead ? toMember(lead, 'leading') : undefined,
      occupiedSpan: span,
      emptySpan: gap,
      description: 'Planets fill roughly half the chart (' + Math.round(span) + ' degrees) — self-contained drive.',
    });
  }

  // -- Bucket: Bowl + one handle planet across the gap --
  if (span > 180 && span <= 270 && gap >= 100) {
    const handle = findHandle(allowed, lons);
    if (handle) {
      const handleLon = normLon(handle.longitude);
      const othersWithoutHandle = lons.filter(l => angularDist(l, handleLon) > 15);
      if (othersWithoutHandle.length >= allowed.length - 2) {
        candidates.push({
          type: 'Bucket',
          confidence: Math.round(Math.max(50, Math.min(90, gap - 80))),
          handlePlanet: toMember(handle, 'handle'),
          occupiedSpan: span,
          emptySpan: gap,
          description: 'Bowl with ' + canonicalBodyName(handle.name) + ' as the handle — a funnel for expression.',
        });
      }
    }
  }

  // -- Locomotive: ~240 degrees occupied, ~120 degrees empty --
  if (gap >= 60 && gap <= 140 && span >= 220 && span <= 300) {
    const lead = findLeading(allowed, lons);
    candidates.push({
      type: 'Locomotive',
      confidence: Math.round(Math.max(50, 100 - Math.abs(gap - 120) * 1.5)),
      leadingPlanet: lead ? toMember(lead, 'leading') : undefined,
      occupiedSpan: span,
      emptySpan: gap,
      description: 'Planets span ' + Math.round(span) + ' degrees with a ' + Math.round(gap) + ' degree empty arc — driven momentum.',
    });
  }

  // -- Seesaw: two groups separated by two gaps of 60+ degrees --
  {
    const { gaps: allGaps } = computeGaps(lons);
    const bigGaps = allGaps.filter(g => g.size >= 60);
    if (bigGaps.length >= 2) {
      candidates.push({
        type: 'Seesaw',
        confidence: Math.round(Math.max(50, Math.min(85, bigGaps[0].size + bigGaps[1].size - 120))),
        emptySpan: gap,
        occupiedSpan: span,
        description: 'Planets form two opposing groups — a life of balancing polarities.',
      });
    }
  }

  // -- Splash: planets spread across 10+ sectors --
  if (sectors >= 9 && gap < 70) {
    candidates.push({
      type: 'Splash',
      confidence: Math.round(Math.max(50, sectors * 8)),
      occupiedSpan: span,
      emptySpan: gap,
      description: 'Planets spread across ' + sectors + ' signs — wide-ranging interests and versatility.',
    });
  }

  // -- Splay: 3+ irregular clusters (not evenly distributed) --
  {
    const sorted = [...lons].sort((a, b) => a - b);
    let clusters = 0;
    let lastEnd = -999;
    for (const l of sorted) {
      if (l - lastEnd > 40) clusters++;
      lastEnd = l;
    }
    if (sorted.length > 0 && (360 - sorted[sorted.length - 1] + sorted[0]) <= 40) {
      clusters = Math.max(1, clusters - 1);
    }
    if (clusters >= 3 && gap < 100 && sectors >= 6) {
      candidates.push({
        type: 'Splay',
        confidence: Math.round(Math.max(50, 55 + clusters * 5)),
        occupiedSpan: span,
        emptySpan: gap,
        description: clusters + ' distinct planet clusters — independent, resistant to categorization.',
      });
    }
  }

  // -- Fan: like Bucket but tighter bowl, wider empty space --
  if (span <= 200 && gap >= 160) {
    const handle = findHandle(allowed, lons);
    if (handle) {
      candidates.push({
        type: 'Fan',
        confidence: Math.round(Math.max(50, gap - 140)),
        handlePlanet: toMember(handle, 'handle'),
        occupiedSpan: span,
        emptySpan: gap,
        description: 'Tight planetary cluster with ' + canonicalBodyName(handle.name) + ' as singular outlet.',
      });
    }
  }

  if (candidates.length === 0) return null;

  // Return highest confidence
  candidates.sort((a, b) => b.confidence - a.confidence);
  return candidates[0];
}
