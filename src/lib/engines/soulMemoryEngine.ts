/**
 * SOUL MEMORY ENGINE (Past Lives Decoder)
 * --------------------------------------------------------------
 * Pure-function scorer that takes a NatalChart and returns a
 * structured past-life report:
 *
 *   - Primary archetype (highest confidence)
 *   - Secondary archetype
 *   - Shadow lifetime variant
 *   - Soul gifts returned (distilled from archetypes)
 *   - Relationship karma theme
 *   - Current life mission
 *   - Top 2 probable eras with confidence
 *   - Top 3 probable regions with confidence
 *   - Optional star-memory signature (if score ≥ 70)
 *
 * Scoring:
 *   - Per-indicator weight × orb multiplier
 *   - Anchor boost (×1.5) when SN/asteroid/midpoint contacts
 *     Sun/Moon/ASC/MC/IC/DSC within 1°
 *   - Repetition bonus (+10) when ≥3 cluster indicators match
 *   - Smooth raw → confidence curve (0–100)
 *
 * Tier 2 midpoint engine: SN/X = target, conj or opp only,
 * orb tiered (≤1° exact ×1.6 / ≤2° strong ×1.3 / ≤3° moderate ×1.0,
 * over 3° rejected entirely per spec).
 * --------------------------------------------------------------
 */

import type { NatalChart, NatalPlanet } from './types';
import { getFullDuadCompendium } from './duadCompendium';
import {
  ARCHETYPES, ERAS, REGIONS, STAR_MEMORIES, FIXED_STARS, CLUSTER_THEMES,
  type Archetype, type Era, type Region, type StarMemory,
  type SMIndicator, type AspectKind, type AngleKind, type ElementKind,
} from './soulMemoryDatabase';

// Draconic layer — additive enrichment, never modifies the natal-based
// scoring pipeline. See src/services/draconicChart.ts for full design.
import {
  buildDraconicLayer,
  applyConfirmationToConfidence,
  type DraconicBlueprint,
  type DraconicContact,
  type ArchetypeConfirmation,
  type LifetimePatternMatch,
} from './draconicChart';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const ELEMENT_BY_SIGN: Record<string, ElementKind> = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water',
};

const ASPECT_ANGLE: Record<AspectKind, number> = {
  conj: 0, opp: 180, trine: 120, square: 90, sextile: 60, quincunx: 150,
};
const ASPECT_BASE_ORB: Record<AspectKind, number> = {
  conj: 8, opp: 8, trine: 7, square: 7, sextile: 5, quincunx: 3,
};

const ANCHOR_TARGETS = new Set(['Sun', 'Moon', 'ASC', 'MC', 'IC', 'DSC']);

// Body name aliases — matching the project's varying conventions
// across chart engine, midpoints, and external data. SN refers
// specifically to South Node (Tier 1 anchor of past-life work).
const ALIAS: Record<string, string[]> = {
  ASC: ['Ascendant', 'ASC'],
  DSC: ['Descendant', 'DSC', 'DESC'],
  MC: ['MC', 'Midheaven'],
  IC: ['IC', 'Imum Coeli'],
  SN: ['South Node', 'Ketu'],
  NN: ['North Node', 'True Node', 'Rahu'],
  Pallas: ['Pallas', 'Pallas Athena'],
  Lilith: ['Lilith', 'Black Moon Lilith', 'Dark Moon Lilith', 'Mean Lilith'],
  Urania: ['Urania', 'Angel'],
  Fortuna: ['Part of Fortune', 'Fortuna'],
};

function findBody(chart: NatalChart, name: string): NatalPlanet | undefined {
  const aliases = ALIAS[name] || [name];
  for (const alias of aliases) {
    const p = chart.planets.find(pl => pl.name === alias);
    if (p) return p;
  }
  return undefined;
}

function getLon(chart: NatalChart, name: string): number | null {
  if (name === 'IC') {
    const m = chart.midheaven;
    return m == null ? null : (m + 180) % 360;
  }
  if (name === 'DSC') {
    const a = chart.ascendant;
    return a == null ? null : (a + 180) % 360;
  }
  const p = findBody(chart, name);
  return p ? p.longitude : null;
}

function signFromLon(lon: number): string {
  return SIGNS[Math.floor((((lon % 360) + 360) % 360) / 30) % 12];
}

function houseFromLon(lon: number, ascLon: number): number {
  const ascSign = Math.floor((((ascLon % 360) + 360) % 360) / 30) % 12;
  const lonSign = Math.floor((((lon % 360) + 360) % 360) / 30) % 12;
  return ((lonSign - ascSign + 12) % 12) + 1;
}

interface AspectMatch { matched: boolean; orb: number; }

function aspectMatch(lon1: number, lon2: number, aspect: AspectKind, customOrb?: number): AspectMatch {
  const target = ASPECT_ANGLE[aspect];
  const limit = customOrb ?? ASPECT_BASE_ORB[aspect];
  let diff = Math.abs(lon1 - lon2);
  if (diff > 180) diff = 360 - diff;
  const orb = Math.abs(diff - target);
  return { matched: orb <= limit, orb };
}

function calcMidpoint(lon1: number, lon2: number): number {
  const a = ((lon1 % 360) + 360) % 360;
  const b = ((lon2 % 360) + 360) % 360;
  let mid = (a + b) / 2;
  if (Math.abs(a - b) > 180) mid = (mid + 180) % 360;
  return ((mid % 360) + 360) % 360;
}

/**
 * Orb multipliers per spec.
 *   0.0–0.5° → 1.6  (massive)
 *   0.5–1.0° → 1.3  (strong)
 *   1.0–1.5° → 1.15 (moderate)
 *   1.5–2.0° → 1.0  (mild)
 *   2.0–3.0° → 0.85 (still meaningful for midpoints/wide aspects)
 *   3.0+°    → 0.7  (background)
 */
function orbMultiplier(orb: number): number {
  if (orb <= 0.5) return 1.6;
  if (orb <= 1.0) return 1.3;
  if (orb <= 1.5) return 1.15;
  if (orb <= 2.0) return 1.0;
  if (orb <= 3.0) return 0.85;
  return 0.7;
}

function getAngleLon(chart: NatalChart, angle: AngleKind): number | null {
  switch (angle) {
    case 'ASC': return chart.ascendant ?? null;
    case 'MC':  return chart.midheaven ?? null;
    case 'DSC': {
      const a = chart.ascendant;
      return a == null ? null : (a + 180) % 360;
    }
    case 'IC': {
      const m = chart.midheaven;
      return m == null ? null : (m + 180) % 360;
    }
  }
}

function aspectLabel(a: AspectKind): string {
  switch (a) {
    case 'conj': return 'conjunct';
    case 'opp': return 'opposite';
    case 'trine': return 'trine';
    case 'square': return 'square';
    case 'sextile': return 'sextile';
    case 'quincunx': return 'quincunx';
  }
}

function ordinal(n: number): string {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

// ─── Indicator evaluator ───────────────────────────────────────

interface IndicatorEval {
  matched: boolean;
  weight: number;
  reason?: string;
  isAnchor?: boolean;
  cluster?: string;     // identifier used for repetition bonus
}

function evaluateIndicator(ind: SMIndicator, chart: NatalChart): IndicatorEval {
  switch (ind.k) {

    case 'snSign': {
      const lon = getLon(chart, 'SN');
      if (lon == null) return { matched: false, weight: 0 };
      if (signFromLon(lon) === ind.s) {
        return { matched: true, weight: ind.w, reason: `South Node in ${ind.s}`, cluster: `snSign:${ind.s}` };
      }
      return { matched: false, weight: 0 };
    }

    case 'snHouse': {
      const sn = findBody(chart, 'SN');
      if (!sn) return { matched: false, weight: 0 };
      const h = sn.house && sn.house > 0 ? sn.house : houseFromLon(sn.longitude, chart.ascendant);
      if (h === ind.h) {
        return { matched: true, weight: ind.w, reason: `South Node in ${ordinal(ind.h)} house`, cluster: `snHouse:${ind.h}` };
      }
      return { matched: false, weight: 0 };
    }

    case 'snAspect': {
      const snLon = getLon(chart, 'SN');
      const tLon = getLon(chart, ind.target);
      if (snLon == null || tLon == null) return { matched: false, weight: 0 };
      const m = aspectMatch(snLon, tLon, ind.a);
      if (!m.matched) return { matched: false, weight: 0 };
      const mult = orbMultiplier(m.orb);
      const isAnchor = m.orb <= 1.0 && ANCHOR_TARGETS.has(ind.target);
      const anchorBoost = isAnchor ? 1.5 : 1.0;
      return {
        matched: true,
        weight: Math.round(ind.w * mult * anchorBoost),
        reason: `South Node ${aspectLabel(ind.a)} ${ind.target} (${m.orb.toFixed(1)}°)`,
        isAnchor,
        cluster: `snAspect:${ind.target}`,
      };
    }

    case 'planetInSign': {
      const p = findBody(chart, ind.p);
      if (!p) return { matched: false, weight: 0 };
      if (signFromLon(p.longitude) === ind.s) {
        return { matched: true, weight: ind.w, reason: `${ind.p} in ${ind.s}` };
      }
      return { matched: false, weight: 0 };
    }

    case 'planetInHouse': {
      const p = findBody(chart, ind.p);
      if (!p) return { matched: false, weight: 0 };
      const h = p.house && p.house > 0 ? p.house : houseFromLon(p.longitude, chart.ascendant);
      if (h === ind.h) {
        return { matched: true, weight: ind.w, reason: `${ind.p} in ${ordinal(ind.h)} house` };
      }
      return { matched: false, weight: 0 };
    }

    case 'aspect': {
      const lon1 = getLon(chart, ind.p1);
      const lon2 = getLon(chart, ind.p2);
      if (lon1 == null || lon2 == null) return { matched: false, weight: 0 };
      const m = aspectMatch(lon1, lon2, ind.a);
      if (!m.matched) return { matched: false, weight: 0 };
      const mult = orbMultiplier(m.orb);
      return {
        matched: true,
        weight: Math.round(ind.w * mult),
        reason: `${ind.p1} ${aspectLabel(ind.a)} ${ind.p2} (${m.orb.toFixed(1)}°)`,
      };
    }

    case 'onAngle': {
      const lon = getLon(chart, ind.body);
      if (lon == null) return { matched: false, weight: 0 };
      const angleLon = getAngleLon(chart, ind.angle);
      if (angleLon == null) return { matched: false, weight: 0 };
      const m = aspectMatch(lon, angleLon, 'conj', 5);
      if (!m.matched) return { matched: false, weight: 0 };
      const mult = orbMultiplier(m.orb);
      const isAnchor = m.orb <= 1.0 && ANCHOR_TARGETS.has(ind.angle);
      const anchorBoost = isAnchor ? 1.5 : 1.0;
      return {
        matched: true,
        weight: Math.round(ind.w * mult * anchorBoost),
        reason: `${ind.body} on ${ind.angle} (${m.orb.toFixed(1)}°)`,
        isAnchor,
      };
    }

    case 'asteroid': {
      const aLon = getLon(chart, ind.aster);
      const tLon = getLon(chart, ind.target);
      if (aLon == null || tLon == null) return { matched: false, weight: 0 };
      const asp = ind.asp || 'conj';
      const m = aspectMatch(aLon, tLon, asp);
      if (!m.matched) return { matched: false, weight: 0 };
      const mult = orbMultiplier(m.orb);
      const isAnchor = m.orb <= 1.0 && ANCHOR_TARGETS.has(ind.target);
      const anchorBoost = isAnchor ? 1.5 : 1.0;
      return {
        matched: true,
        weight: Math.round(ind.w * mult * anchorBoost),
        reason: `${ind.aster} ${aspectLabel(asp)} ${ind.target} (${m.orb.toFixed(1)}°)`,
        isAnchor,
      };
    }

    case 'snMidpt': {
      // Tier 2 midpoint engine: midpoint(SN, X) conj or opp target,
      // orb max 3° per spec.
      const snLon = getLon(chart, 'SN');
      const xLon = getLon(chart, ind.x);
      const tLon = getLon(chart, ind.target);
      if (snLon == null || xLon == null || tLon == null) return { matched: false, weight: 0 };
      const mid = calcMidpoint(snLon, xLon);
      const m = aspectMatch(mid, tLon, ind.a, 3);
      if (!m.matched) return { matched: false, weight: 0 };
      const mult = orbMultiplier(m.orb);
      const isAnchor = m.orb <= 1.0 && ANCHOR_TARGETS.has(ind.target);
      const anchorBoost = isAnchor ? 1.5 : 1.0;
      return {
        matched: true,
        weight: Math.round(ind.w * mult * anchorBoost),
        reason: `SN/${ind.x} midpoint ${aspectLabel(ind.a)} ${ind.target} (${m.orb.toFixed(1)}°)`,
        isAnchor,
      };
    }

    case 'houseFocus': {
      const occupants = chart.planets.filter(p => {
        if (['Ascendant','MC','Descendant','IC','Vertex','Anti-Vertex'].includes(p.name)) return false;
        const h = p.house && p.house > 0 ? p.house : houseFromLon(p.longitude, chart.ascendant);
        return h === ind.h;
      });
      if (occupants.length >= ind.min) {
        return {
          matched: true,
          weight: ind.w,
          reason: `${occupants.length} bodies in your ${ordinal(ind.h)} house`,
        };
      }
      return { matched: false, weight: 0 };
    }

    case 'signFocus': {
      const occupants = chart.planets.filter(p => {
        if (['Ascendant','MC','Descendant','IC','Vertex','Anti-Vertex'].includes(p.name)) return false;
        return signFromLon(p.longitude) === ind.s;
      });
      if (occupants.length >= ind.min) {
        return { matched: true, weight: ind.w, reason: `${occupants.length} bodies in ${ind.s}` };
      }
      return { matched: false, weight: 0 };
    }

    case 'elementBalance': {
      const count = chart.planets.filter(p => {
        if (['Ascendant','MC','Descendant','IC','Vertex','Anti-Vertex'].includes(p.name)) return false;
        return ELEMENT_BY_SIGN[signFromLon(p.longitude)] === ind.element;
      }).length;
      if (count >= ind.min) {
        return { matched: true, weight: ind.w, reason: `${count} bodies in ${ind.element} signs` };
      }
      return { matched: false, weight: 0 };
    }

    case 'retro': {
      const p = findBody(chart, ind.p);
      if (!p) return { matched: false, weight: 0 };
      if (p.retrograde) return { matched: true, weight: ind.w, reason: `${ind.p} retrograde` };
      return { matched: false, weight: 0 };
    }

    case 'duadSign': {
      const lon = getLon(chart, ind.body);
      if (lon == null) return { matched: false, weight: 0 };
      const ascSign = signFromLon(chart.ascendant);
      const dc = getFullDuadCompendium(lon, ascSign);
      if (dc.duadSign === ind.s) {
        return { matched: true, weight: ind.w, reason: `${ind.body} duad in ${ind.s}` };
      }
      return { matched: false, weight: 0 };
    }

    case 'compendiumSign': {
      const lon = getLon(chart, ind.body);
      if (lon == null) return { matched: false, weight: 0 };
      const ascSign = signFromLon(chart.ascendant);
      const dc = getFullDuadCompendium(lon, ascSign);
      if (dc.compendiumSign === ind.s) {
        return { matched: true, weight: ind.w, reason: `${ind.body} compendium in ${ind.s}` };
      }
      return { matched: false, weight: 0 };
    }

    case 'fixedStar': {
      const star = FIXED_STARS[ind.star];
      if (!star) return { matched: false, weight: 0 };
      const lon = getLon(chart, ind.body);
      if (lon == null) return { matched: false, weight: 0 };
      const orb = ind.orb ?? 1.0;
      const m = aspectMatch(lon, star.longitude, 'conj', orb);
      if (!m.matched) return { matched: false, weight: 0 };
      const mult = orbMultiplier(m.orb);
      const isAnchor = m.orb <= 0.5 && ANCHOR_TARGETS.has(ind.body);
      const anchorBoost = isAnchor ? 1.5 : 1.0;
      return {
        matched: true,
        weight: Math.round(ind.w * mult * anchorBoost),
        reason: `${ind.body} on fixed star ${ind.star} (${m.orb.toFixed(1)}°)`,
        isAnchor,
      };
    }
  }
}

// ─── Scoring with cluster bonus + raw → confidence curve ───────

interface ScoredItem {
  raw: number;
  reasons: ReasonRow[];
  hadAnchor: boolean;
  matchCount: number;
  clustersTriggered: Set<string>;
}

export interface ReasonRow {
  text: string;
  weight: number;
  isAnchor: boolean;
}

function scoreIndicators(
  indicators: SMIndicator[],
  chart: NatalChart,
  clusterMap: Record<string, string[]>,
): ScoredItem {
  const reasons: ReasonRow[] = [];
  let raw = 0;
  let matchCount = 0;
  let hadAnchor = false;
  const clusterCounts: Record<string, number> = {};

  for (const ind of indicators) {
    const ev = evaluateIndicator(ind, chart);
    if (ev.matched) {
      raw += ev.weight;
      matchCount += 1;
      if (ev.isAnchor) hadAnchor = true;
      if (ev.reason) {
        reasons.push({ text: ev.reason, weight: ev.weight, isAnchor: !!ev.isAnchor });
      }
      if (ev.cluster) {
        // Resolve cluster name from CLUSTER_THEMES — find which cluster
        // contains this indicator-key, increment that count.
        for (const [cname, keys] of Object.entries(clusterMap)) {
          if (keys.includes(ev.cluster)) {
            clusterCounts[cname] = (clusterCounts[cname] || 0) + 1;
          }
        }
      }
    }
  }

  // Per-spec: ≥3 matches in same cluster = +10 raw
  const clustersTriggered = new Set<string>();
  for (const [cname, count] of Object.entries(clusterCounts)) {
    if (count >= 3) {
      raw += 10;
      clustersTriggered.add(cname);
    }
  }

  // Repetition bonus on raw match count
  if (matchCount >= 6) raw += 10;
  else if (matchCount >= 4) raw += 5;

  return { raw, reasons, hadAnchor, matchCount, clustersTriggered };
}

/**
 * Map raw weight sum → 0–100 confidence.
 * Calibration:
 *   raw 0    → 0
 *   raw 30   → ~55 (one strong hit + supporting)
 *   raw 60   → ~75 (multi-indicator)
 *   raw 100  → ~85 (strong match)
 *   raw 150+ → 90+ (chart-defining)
 * Uses smooth diminishing-returns curve.
 */
function rawToConfidence(raw: number, hadAnchor: boolean): number {
  if (raw <= 0) return 0;
  const x = raw / 100;
  const score = 100 * (1 - Math.exp(-1.1 * x));
  // Anchor floor — only applies when broader pattern is genuinely present
  // (raw >= 70 ≈ several supporting indicators all firing). Lower thresholds
  // produced false-positive Sacred Healer at 78% on charts that only had
  // one tight asteroid contact (Ceres conj Moon) plus a couple of weak
  // SN matches. The 70-threshold ensures the anchor lift only happens
  // when the chart actually carries the archetype, not when it accidentally
  // brushes against one of the archetype's indicators.
  const floored = hadAnchor && raw >= 70 ? Math.max(score, 78) : score;
  return Math.max(0, Math.min(100, Math.round(floored)));
}

// ─── Public types ──────────────────────────────────────────────

export interface ScoredArchetype {
  id: string;
  name: string;
  shadowName: string;
  heroDescription: string;
  shadowDescription: string;
  soulGifts: string[];
  relationshipKarma: { theme: string; description: string };
  currentMission: string;
  confidence: number;
  rawScore: number;
  reasons: ReasonRow[];
}

export interface ScoredEra {
  id: string;
  name: string;
  range: string;
  description: string;
  confidence: number;
  reasons: ReasonRow[];
}

export interface ScoredRegion {
  id: string;
  name: string;
  description: string;
  confidence: number;
  reasons: ReasonRow[];
}

export interface ScoredStarMemory {
  id: string;
  name: string;
  description: string;
  qualities: string[];
  confidence: number;
  reasons: ReasonRow[];
}

export interface SoulMemoryResult {
  primary: ScoredArchetype;
  secondary: ScoredArchetype;
  shadow: ScoredArchetype;       // archetype to surface as shadow lifetime (may be same as primary; UI shows shadowName)
  eras: ScoredEra[];             // top 2
  regions: ScoredRegion[];       // top 3
  starMemory: ScoredStarMemory | null;  // null unless score ≥ 70
  soulGiftsReturned: string[];   // distilled
  unifiedMission: string;        // composed from primary + secondary
  computedAt: number;

  // ─── Draconic Layer (optional, additive) ──────────────────────
  // Populated by the Draconic enrichment pass after the main scoring
  // completes. All fields optional so existing consumers that ignore
  // them keep working unchanged.
  draconicBlueprint?: DraconicBlueprint;
  /** Recurring soul-behavior themes — "What Your Soul Keeps Returning To". */
  lifetimePatterns?: LifetimePatternMatch[];
  /**
   * Per-archetype confirmation summary keyed by archetype id. UI uses
   * this to surface Draconic confirmation badges on existing cards.
   */
  archetypeConfirmations?: Record<string, ArchetypeConfirmation>;
  /**
   * Full Draconic→natal contact list. Available for diagnostic surfaces
   * and "Soul Gift Confirmation" / "Relationship Karma Confirmation"
   * subsections.
   */
  draconicContacts?: DraconicContact[];
}

// ─── Main entry point ──────────────────────────────────────────

export function computeSoulMemory(chart: NatalChart): SoulMemoryResult {
  if (!chart || !chart.planets || chart.planets.length === 0) {
    return emptyResult();
  }

  // Score archetypes
  const scoredArchetypes: ScoredArchetype[] = ARCHETYPES.map(a => {
    const s = scoreIndicators(a.indicators, chart, CLUSTER_THEMES);
    const top = s.reasons.sort((x, y) => y.weight - x.weight).slice(0, 4);
    return {
      id: a.id,
      name: a.name,
      shadowName: a.shadowName,
      heroDescription: a.heroDescription,
      shadowDescription: a.shadowDescription,
      soulGifts: a.soulGifts,
      relationshipKarma: a.relationshipKarma,
      currentMission: a.currentMission,
      confidence: rawToConfidence(s.raw, s.hadAnchor),
      rawScore: s.raw,
      reasons: top,
    };
  }).sort((a, b) => b.confidence - a.confidence);

  // Score eras. Eras inherently have fewer indicators than archetypes
  // (broader categories), so we scale raw 2.5× before mapping to
  // confidence — otherwise a "good match" reads at 25% which looks
  // weak. Scaling preserves ranking while normalizing display range.
  const scoredEras: ScoredEra[] = ERAS.map(e => {
    const s = scoreIndicators(e.indicators, chart, {});
    return {
      id: e.id,
      name: e.name,
      range: e.range,
      description: e.description,
      confidence: rawToConfidence(s.raw * 2.5, s.hadAnchor),
      reasons: s.reasons.sort((x, y) => y.weight - x.weight).slice(0, 3),
    };
  }).sort((a, b) => b.confidence - a.confidence);

  // Score regions — same calibration treatment as eras.
  const scoredRegions: ScoredRegion[] = REGIONS.map(r => {
    const s = scoreIndicators(r.indicators, chart, {});
    return {
      id: r.id,
      name: r.name,
      description: r.description,
      confidence: rawToConfidence(s.raw * 2.5, s.hadAnchor),
      reasons: s.reasons.sort((x, y) => y.weight - x.weight).slice(0, 3),
    };
  }).sort((a, b) => b.confidence - a.confidence);

  // Score star memories (only surface if top score ≥ 70 — high bar
  // so this section feels rare and meaningful)
  const scoredStars: ScoredStarMemory[] = STAR_MEMORIES.map(sm => {
    const s = scoreIndicators(sm.indicators, chart, {});
    return {
      id: sm.id,
      name: sm.name,
      description: sm.description,
      qualities: sm.qualities,
      confidence: rawToConfidence(s.raw, s.hadAnchor),
      reasons: s.reasons.sort((x, y) => y.weight - x.weight).slice(0, 3),
    };
  }).sort((a, b) => b.confidence - a.confidence);

  const primary = scoredArchetypes[0];
  const secondary = scoredArchetypes[1];
  // Shadow lifetime: surface a different-flavor archetype for contrast
  // — pick the highest-scoring archetype OUTSIDE the top 2, or the
  // primary itself if no other meaningful candidate.
  const shadow = scoredArchetypes[2] && scoredArchetypes[2].confidence >= 60
    ? scoredArchetypes[2]
    : primary;

  // Soul gifts distilled — combine primary's gifts plus 2 unique from
  // secondary, deduped, max 8 total.
  const seenGifts = new Set<string>();
  const unifiedGifts: string[] = [];
  for (const g of primary.soulGifts) {
    if (!seenGifts.has(g.toLowerCase())) {
      unifiedGifts.push(g);
      seenGifts.add(g.toLowerCase());
    }
  }
  for (const g of secondary.soulGifts) {
    if (unifiedGifts.length >= 8) break;
    if (!seenGifts.has(g.toLowerCase())) {
      unifiedGifts.push(g);
      seenGifts.add(g.toLowerCase());
    }
  }

  // Unified mission: primary's mission verbatim is the spine. Add a
  // one-line nod to the secondary archetype if it's also strong.
  const unifiedMission = secondary.confidence >= 70
    ? `${primary.currentMission}\n\nA secondary thread also pulls forward — ${secondary.name.toLowerCase()} energy. Honor it without letting it dilute the primary work.`
    : primary.currentMission;

  // Build the natal-driven base result first (untouched by Draconic).
  const base: SoulMemoryResult = {
    primary,
    secondary,
    shadow,
    eras: scoredEras.slice(0, 2),
    regions: scoredRegions.slice(0, 3),
    starMemory: scoredStars[0] && scoredStars[0].confidence >= 70 ? scoredStars[0] : null,
    soulGiftsReturned: unifiedGifts,
    unifiedMission,
    computedAt: Date.now(),
  };

  // ─── Draconic enrichment pass ────────────────────────────────
  // Additive layer: rotates the chart so North Node sits at 0° Aries
  // and looks for soul-level confirmations of the natal-derived
  // archetypes. NEVER lowers a score; only raises confirmed ones.
  // If the chart has no recognizable North Node the layer skips
  // gracefully and the base result returns unchanged.
  return mergeDraconicWithSoulMemoryResults(base, chart);
}

/**
 * mergeDraconicWithSoulMemoryResults
 * --------------------------------------------------------------
 * Per spec §14, this is the dedicated bridge function between the
 * existing Soul Memory results (natal-driven) and the Draconic layer.
 *
 * Behavior:
 *   1. Calls buildDraconicLayer() against the chart, rotating it by
 *      the natal North Node and computing the full soul-level layer.
 *   2. For each scored archetype (primary, secondary, shadow), looks
 *      up its Draconic confirmation summary and applies the boost via
 *      the smooth-curve confidence calibrator. Confidences only go up.
 *   3. Attaches blueprint, lifetimePatterns, archetypeConfirmations,
 *      and the contact list to the result so the UI can render the
 *      Soul Blueprint card and confirmation badges.
 *
 * If the Draconic layer can't be built (no NN in chart), returns the
 * base result unchanged — the existing engine remains fully functional.
 */
export function mergeDraconicWithSoulMemoryResults(
  base: SoulMemoryResult,
  chart: NatalChart,
): SoulMemoryResult {
  // Score Draconic confirmations against the three archetypes already
  // promoted by the natal pass (plus any others surfaced in lanes).
  const archetypeIds = Array.from(new Set([
    base.primary?.id,
    base.secondary?.id,
    base.shadow?.id,
  ].filter((id): id is string => !!id && id !== 'none')));

  const layer = buildDraconicLayer(chart, archetypeIds);
  if (!layer) return base;  // No NN present — skip Draconic safely.

  const conf = layer.archetypeConfirmations;

  // Apply confirmation boosts to the existing scored archetypes.
  // We rebuild the ScoredArchetype objects rather than mutating —
  // keeps the engine functionally pure.
  const boostArch = (a: typeof base.primary): typeof base.primary => {
    if (!a || a.id === 'none') return a;
    const c = conf[a.id];
    if (!c) return a;
    return {
      ...a,
      confidence: applyConfirmationToConfidence(a.confidence, c.totalBoost),
    };
  };

  return {
    ...base,
    primary: boostArch(base.primary),
    secondary: boostArch(base.secondary),
    shadow: boostArch(base.shadow),
    draconicBlueprint: layer.blueprint ?? undefined,
    lifetimePatterns: layer.lifetimePatterns,
    archetypeConfirmations: conf,
    draconicContacts: layer.contacts,
  };
}

function emptyResult(): SoulMemoryResult {
  const blank: ScoredArchetype = {
    id: 'none', name: '—', shadowName: '—',
    heroDescription: '', shadowDescription: '',
    soulGifts: [], relationshipKarma: { theme: '', description: '' },
    currentMission: '', confidence: 0, rawScore: 0, reasons: [],
  };
  return {
    primary: blank, secondary: blank, shadow: blank,
    eras: [], regions: [],
    starMemory: null,
    soulGiftsReturned: [], unifiedMission: '',
    computedAt: Date.now(),
  };
}

export function chartSignature(chart: NatalChart): string {
  if (!chart || !chart.planets) return 'empty';
  const sig = chart.planets
    .map(p => `${p.name}:${Math.round(p.longitude * 10)}`)
    .join('|');
  return `${sig}|asc:${Math.round(chart.ascendant * 10)}|mc:${Math.round(chart.midheaven * 10)}`;
}

export function confidenceBand(c: number): { label: string; color: string } {
  if (c >= 90) return { label: 'Highly Probable', color: '#F5A623' };
  if (c >= 80) return { label: 'Strong Signature', color: '#9B6FF6' };
  if (c >= 70) return { label: 'Probable', color: '#6BB4FF' };
  if (c >= 60) return { label: 'Likely Echo', color: '#A8B0C0' };
  return { label: 'Background Echo', color: '#5C6378' };
}
