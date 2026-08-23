// ═══════════════════════════════════════════════════════════════════
// Build-A-Match — Midpoint activations (web)
//
// EXACT MIRROR of align-app/src/services/buildAMatch/midpointBridge.ts.
// The orb and the pair set must stay identical across platforms.
//
// "Their Venus sits on your Sun/Moon — Inner Union."
//
// Uses the EXISTING computeMidpoint() from advancedCompatibility, so the
// technique is shared with Cosmic Match rather than reinvented: NEAR point
// only, short arc, never the 180° axis.
//
// Two deliberate differences from the engine's own computeChartMidpoints:
//
//   1. It covers KEY_MIDPOINT_PAIRS (~28). Build-A-Match uses ALL 230
//      pairs among the indexed bodies, which is the agreed set.
//   2. It allows aspects out to 2°. Build-A-Match uses a 1° orb, agreed,
//      because tight orbs are what make a hit mean anything.
//
// Neither change touches the shared engine — Cosmic Match keeps its own
// behaviour exactly as it was.
//
// PURE MODULE. No Supabase, no React Native.
// ═══════════════════════════════════════════════════════════════════

import { computeMidpoint } from '@/lib/engines/advancedCompatibility/midpointEngine';
import {
  readingForMidpoint, isShadowMidpoint, midpointKey,
  type MidpointReading,
} from './midpointInterpretations';

/** The agreed orb. Tight on purpose. */
export const MIDPOINT_ORB = 1;

/**
 * Which contacts count as an activation, and how much each weighs.
 * Mirrors the engine's own aspect set, narrowed to the 1° orb.
 */
const ACTIVATION_ASPECTS: Array<{ name: string; angle: number; weight: number }> = [
  { name: 'Conjunction', angle: 0,   weight: 1.0 },
  { name: 'Opposition',  angle: 180, weight: 0.85 },
  { name: 'Square',      angle: 90,  weight: 0.7 },
];

/** The 22 bodies Align indexes. All pairs among them is the agreed set. */
export const MIDPOINT_BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus',
  'Neptune', 'Pluto', 'N.Node', 'S.Node', 'Asc', 'MC', 'Chiron', 'Juno',
  'Vesta', 'Pallas', 'Lilith', 'Eros', 'Psyche', 'Ceres',
] as const;

/**
 * The index stores full body names; the midpoint list uses short ones for
 * the angles and nodes. One place to translate, so a rename cannot
 * silently drop half the midpoints.
 */
const INDEX_NAME_TO_MIDPOINT_NAME: Record<string, string> = {
  'North Node': 'N.Node',
  'South Node': 'S.Node',
  'Ascendant': 'Asc',
  'MC': 'MC',
};

export function toMidpointName(indexName: string): string {
  return INDEX_NAME_TO_MIDPOINT_NAME[indexName] ?? indexName;
}

export interface ChartMidpoint {
  a: string;
  b: string;
  longitude: number;
}

export interface MidpointActivation {
  /** The candidate's body that landed on it. */
  activatingBody: string;
  a: string;
  b: string;
  aspect: string;
  /** Degrees from exact. */
  orb: number;
  /** 0–1, combining aspect weight and tightness. */
  strength: number;
  reading: MidpointReading | null;
  isShadow: boolean;
}

/**
 * Every midpoint in a chart — all pairs among the indexed bodies.
 *
 * N.Node/S.Node is skipped: the nodes are always exactly opposite, so
 * their short-arc midpoint is undefined rather than merely uninteresting.
 */
export function computeAllMidpoints(
  positions: Array<{ name: string; longitude: number }>,
): ChartMidpoint[] {
  const byName = new Map<string, number>();
  for (const p of positions) {
    if (!Number.isFinite(p.longitude)) continue;
    byName.set(toMidpointName(p.name), p.longitude);
  }

  const out: ChartMidpoint[] = [];
  for (let i = 0; i < MIDPOINT_BODIES.length; i++) {
    for (let j = i + 1; j < MIDPOINT_BODIES.length; j++) {
      const a = MIDPOINT_BODIES[i];
      const b = MIDPOINT_BODIES[j];
      if ((a === 'N.Node' && b === 'S.Node') || (a === 'S.Node' && b === 'N.Node')) continue;

      const lonA = byName.get(a);
      const lonB = byName.get(b);
      if (lonA === undefined || lonB === undefined) continue;

      out.push({ a, b, longitude: computeMidpoint(lonA, lonB) });
    }
  }
  return out;
}

function contactFor(midLon: number, bodyLon: number):
  { name: string; orb: number; weight: number } | null {
  let diff = Math.abs(midLon - bodyLon);
  diff = Math.min(diff, 360 - diff);
  for (const asp of ACTIVATION_ASPECTS) {
    const orb = Math.abs(diff - asp.angle);
    if (orb <= MIDPOINT_ORB) return { name: asp.name, orb, weight: asp.weight };
  }
  return null;
}

/**
 * Their bodies landing on your midpoints, strongest first.
 *
 * At 1° across 230 midpoints and 22 bodies this typically yields tens of
 * hits, which is why the caller shows only the top few. Ranked so the
 * ones that survive are the tight, heavy, named ones.
 */
export function findActivations(
  myMidpoints: ChartMidpoint[],
  theirPositions: Array<{ name: string; longitude: number }>,
  limit = 3,
): MidpointActivation[] {
  const hits: MidpointActivation[] = [];

  for (const mp of myMidpoints) {
    for (const body of theirPositions) {
      if (!Number.isFinite(body.longitude)) continue;
      const contact = contactFor(mp.longitude, body.longitude);
      if (!contact) continue;

      const tightness = 1 - contact.orb / MIDPOINT_ORB;
      hits.push({
        activatingBody: toMidpointName(body.name),
        a: mp.a,
        b: mp.b,
        aspect: contact.name,
        orb: Math.round(contact.orb * 100) / 100,
        strength: Math.round(contact.weight * tightness * 1000) / 1000,
        reading: readingForMidpoint(mp.a, mp.b),
        isShadow: isShadowMidpoint(mp.a, mp.b),
      });
    }
  }

  return rankActivations(hits, limit);
}

/**
 * A named activation says something; an unnamed one is a technical fact
 * the reader cannot use. Named wins, then strength, then tighter orb.
 */
export function rankActivations(
  activations: MidpointActivation[],
  limit = 3,
): MidpointActivation[] {
  return [...activations]
    .sort((x, y) => {
      const nx = x.reading ? 1 : 0;
      const ny = y.reading ? 1 : 0;
      if (nx !== ny) return ny - nx;
      if (y.strength !== x.strength) return y.strength - x.strength;
      return x.orb - y.orb;
    })
    .slice(0, limit);
}

/** Dedupe key, so the same midpoint does not report twice for one body. */
export function activationKey(a: MidpointActivation): string {
  return `${a.activatingBody}|${midpointKey(a.a, a.b)}`;
}
