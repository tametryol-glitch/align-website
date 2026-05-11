/**
 * SOUL GIFTS ENGINE
 * --------------------------------------------------------------
 * Pure-function scorer. Takes a NatalChart, walks every gift in
 * the database, evaluates each indicator, sums weighted matches,
 * applies orb/repetition bonuses, caps at 100, returns ranked
 * sections for the UI.
 *
 * Engine is deterministic: same chart → same scores. Safe to
 * cache aggressively keyed by chart signature.
 * --------------------------------------------------------------
 */

import type { NatalChart, NatalPlanet } from './types';
import {
  SOUL_GIFTS,
  SoulGift,
  Indicator,
  AspectKind,
  AngleKind,
  GiftCategory,
  CUSTOM_RULERS,
} from './soulGiftsDatabase';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

// ─── Aspect angles + base orbs ─────────────────────────────────

const ASPECT_ANGLE: Record<AspectKind, number> = {
  conj: 0, opp: 180, trine: 120, square: 90, sextile: 60, quincunx: 150,
};

const ASPECT_BASE_ORB: Record<AspectKind, number> = {
  conj: 8, opp: 8, trine: 7, square: 7, sextile: 5, quincunx: 3,
};

// Body name resolution. Different parts of the chart pipeline use
// different aliases for the same point — normalize them.
const ALIAS: Record<string, string[]> = {
  ASC: ['Ascendant', 'ASC'],
  DSC: ['Descendant', 'DSC', 'DESC'],
  MC: ['MC', 'Midheaven'],
  IC: ['IC', 'Imum Coeli'],
  'North Node': ['North Node', 'True Node', 'Rahu'],
  'South Node': ['South Node', 'Ketu'],
  'Pallas': ['Pallas', 'Pallas Athena'],
  'Lilith': ['Lilith', 'Black Moon Lilith', 'Dark Moon Lilith', 'Mean Lilith'],
  'Chiron': ['Chiron'],
  'Eros': ['Eros'],
  'Psyche': ['Psyche'],
  // Backend ASTEROID_CATALOG uses "Angel" (#11911) for what the project
  // conventionally calls Urania. The lookup must include the backend name
  // or every Urania-* indicator silently fails to fire.
  'Urania': ['Urania', 'Angel'],
  'Ceres': ['Ceres'],
  'Vesta': ['Vesta'],
  'Juno': ['Juno'],
  'Apollo': ['Apollo'],
  'Hygiea': ['Hygiea'],
  'Nemesis': ['Nemesis'],
  'Karma': ['Karma'],
  // Part of Fortune (Arabic Part computed from Sun/Moon/ASC) ships in
  // default natal output as "Part of Fortune" and is the body our DB
  // means by "Fortuna". Asteroid Fortuna (#19) is the secondary fallback.
  'Fortuna': ['Part of Fortune', 'Fortuna'],
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
  const p = findBody(chart, name);
  return p ? p.longitude : null;
}

function signFromLon(lon: number): string {
  return SIGNS[Math.floor((((lon % 360) + 360) % 360) / 30) % 12];
}

function houseFromLon(lon: number, ascLon: number): number {
  // Whole-sign house derivation — robust across house systems and
  // always available regardless of the user's house system setting.
  const ascSign = Math.floor((((ascLon % 360) + 360) % 360) / 30) % 12;
  const lonSign = Math.floor((((lon % 360) + 360) % 360) / 30) % 12;
  return ((lonSign - ascSign + 12) % 12) + 1;
}

// ─── Aspect calculation ────────────────────────────────────────

interface AspectMatch {
  matched: boolean;
  orb: number;        // arc-degree distance from exact
}

function aspectMatch(
  lon1: number,
  lon2: number,
  aspect: AspectKind,
  customOrb?: number,
): AspectMatch {
  const target = ASPECT_ANGLE[aspect];
  const limit = customOrb ?? ASPECT_BASE_ORB[aspect];
  let diff = Math.abs(lon1 - lon2);
  if (diff > 180) diff = 360 - diff;
  const orb = Math.abs(diff - target);
  return { matched: orb <= limit, orb };
}

/**
 * Orb multiplier for a given orb (degrees from exact).
 * Per spec:
 *   0.00–0.30 = massive boost (×1.6)
 *   0.30–1.00 = strong (×1.3)
 *   1.00–1.30 = moderate (×1.15)
 *   1.30–2.00 = mild (×1.0)
 *   2.00+     = base (×0.85, slight de-rating for wide aspects)
 */
function orbMultiplier(orb: number): number {
  if (orb <= 0.3) return 1.6;
  if (orb <= 1.0) return 1.3;
  if (orb <= 1.3) return 1.15;
  if (orb <= 2.0) return 1.0;
  return 0.85;
}

// ─── Midpoint calculation ─────────────────────────────────────

function calcMidpoint(lon1: number, lon2: number): number {
  const a = ((lon1 % 360) + 360) % 360;
  const b = ((lon2 % 360) + 360) % 360;
  let mid = (a + b) / 2;
  if (Math.abs(a - b) > 180) mid = (mid + 180) % 360;
  return ((mid % 360) + 360) % 360;
}

// ─── Public types ──────────────────────────────────────────────

export interface MatchedReason {
  text: string;        // human-readable: "Mercury conjunct Urania (0.4°)"
  weight: number;      // contribution to final score after multipliers
  isAnchor: boolean;   // tight orb on Sun/Moon/ASC/MC/IC/DSC
}

export interface ScoredGift {
  id: string;
  name: string;
  category: GiftCategory;
  alsoIn: GiftCategory[];
  description: string;
  unlock: string;
  /**
   * Plain-language interpretive frame for why this gift scored. Surfaced
   * in the WHY YOU HAVE THIS section above the placement details. When the
   * gift definition has no `whyExpression`, the engine falls back to the
   * gift description with a generic opener.
   */
  whyExpression: string;
  score: number;             // 0–100 capped
  rawScore: number;          // pre-cap, pre-bonus (debug/diagnostics)
  reasons: MatchedReason[];  // top 3 reasons by weight; UI displays these
}

export interface SoulGiftsResult {
  topFive: ScoredGift[];
  dormant: ScoredGift[];     // 65–79 score range
  money: ScoredGift[];       // top 5 scoring money gifts
  love: ScoredGift[];        // top 5 scoring love gifts
  shadow: ScoredGift[];      // top 5 scoring shadow gifts
  spiritual: ScoredGift[];   // top 5 scoring spiritual gifts
  unlockSteps: string[];     // 5 personalized actions from top gifts
  computedAt: number;
}

// ─── Indicator evaluator ───────────────────────────────────────

const ANCHOR_TARGETS = new Set(['Sun', 'Moon', 'ASC', 'MC', 'IC', 'DSC']);

interface IndicatorEval {
  matched: boolean;
  weight: number;     // post-multiplier
  reason?: string;
  isAnchor?: boolean;
}

// Helper: describe a body with its sign + house, given chart context.
// Produces strings like "Mercury in Pisces (3rd house)" or "ASC in Leo".
function bodyContext(chart: NatalChart, name: string): string {
  const p = findBody(chart, name);
  if (!p) {
    // Angles may not be findable as planets — fall back to longitude lookup.
    const lon = getLon(chart, name);
    if (lon == null) return name;
    return `${name} in ${signFromLon(lon)}`;
  }
  const sign = signFromLon(p.longitude);
  const h = p.house && p.house > 0 ? p.house : houseFromLon(p.longitude, chart.ascendant);
  // For angles (ASC/MC/etc.) the house is implicit, skip it
  if (['Ascendant','MC','Descendant','IC','Vertex','Anti-Vertex'].includes(p.name)) {
    return `${name} in ${sign}`;
  }
  return `${name} in ${sign} (${ordinal(h)} house)`;
}

function evaluateIndicator(ind: Indicator, chart: NatalChart): IndicatorEval {
  switch (ind.k) {
    case 'pSign': {
      const p = findBody(chart, ind.p);
      if (!p) return { matched: false, weight: 0 };
      if (signFromLon(p.longitude) === ind.s) {
        // Always include house for richer "why" — sign was already in indicator
        const h = p.house && p.house > 0 ? p.house : houseFromLon(p.longitude, chart.ascendant);
        const isAngle = ['Ascendant','MC','Descendant','IC'].includes(p.name);
        const houseSuffix = isAngle ? '' : ` (${ordinal(h)} house)`;
        return { matched: true, weight: ind.w, reason: `${ind.p} in ${ind.s}${houseSuffix}` };
      }
      return { matched: false, weight: 0 };
    }

    case 'pHouse': {
      const p = findBody(chart, ind.p);
      if (!p) return { matched: false, weight: 0 };
      // Prefer backend-provided house when available; fall back to
      // whole-sign computation from ASC for asteroids/midpoints
      // that may lack house assignment.
      const h = p.house && p.house > 0 ? p.house : houseFromLon(p.longitude, chart.ascendant);
      if (h === ind.h) {
        const sign = signFromLon(p.longitude);
        return { matched: true, weight: ind.w, reason: `${ind.p} in ${sign} in your ${ordinal(ind.h)} house` };
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
      // Build sign-rich reason: "Venus in Pisces conjunct Neptune in Pisces (5th house, 0.4°)"
      const ctx1 = bodyContext(chart, ind.p1);
      const ctx2 = bodyContext(chart, ind.p2);
      return {
        matched: true,
        weight: Math.round(ind.w * mult),
        reason: `${ctx1} ${aspectLabel(ind.a)} ${ctx2} — ${m.orb.toFixed(1)}°`,
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
      const bodySign = signFromLon(lon);
      const angleSign = signFromLon(angleLon);
      return {
        matched: true,
        weight: Math.round(ind.w * mult * anchorBoost),
        reason: `${ind.body} in ${bodySign} on your ${ind.angle} in ${angleSign} (${m.orb.toFixed(1)}°)`,
        isAnchor,
      };
    }

    case 'signOnAngle': {
      const angleLon = getAngleLon(chart, ind.angle);
      if (angleLon == null) return { matched: false, weight: 0 };
      if (signFromLon(angleLon) === ind.s) {
        return { matched: true, weight: ind.w, reason: `${ind.s} on your ${ind.angle}` };
      }
      return { matched: false, weight: 0 };
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
      const ctxA = bodyContext(chart, ind.aster);
      const ctxT = bodyContext(chart, ind.target);
      return {
        matched: true,
        weight: Math.round(ind.w * mult * anchorBoost),
        reason: `${ctxA} ${aspectLabel(asp)} ${ctxT} — ${m.orb.toFixed(1)}°`,
        isAnchor,
      };
    }

    case 'midpt': {
      const a = getLon(chart, ind.m1);
      const b = getLon(chart, ind.m2);
      const t = getLon(chart, ind.target);
      if (a == null || b == null || t == null) return { matched: false, weight: 0 };
      const mid = calcMidpoint(a, b);
      // Midpoints use a tighter 1.5° orb per Ebertin tradition.
      const m = aspectMatch(mid, t, 'conj', 1.5);
      if (!m.matched) return { matched: false, weight: 0 };
      const mult = orbMultiplier(m.orb);
      const isAnchor = m.orb <= 1.0 && ANCHOR_TARGETS.has(ind.target);
      const anchorBoost = isAnchor ? 1.5 : 1.0;
      const midSign = signFromLon(mid);
      const ctxT = bodyContext(chart, ind.target);
      return {
        matched: true,
        weight: Math.round(ind.w * mult * anchorBoost),
        reason: `${ind.m1}/${ind.m2} midpoint at ${midSign} ${(((mid % 30) + 30) % 30).toFixed(0)}° conjunct ${ctxT} — ${m.orb.toFixed(1)}°`,
        isAnchor,
      };
    }

    case 'houseFocus': {
      // Count bodies (excluding angles) in the target house.
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
        return {
          matched: true,
          weight: ind.w,
          reason: `${occupants.length} bodies in ${ind.s}`,
        };
      }
      return { matched: false, weight: 0 };
    }

    case 'retro': {
      const p = findBody(chart, ind.p);
      if (!p) return { matched: false, weight: 0 };
      if (p.retrograde) {
        return { matched: true, weight: ind.w, reason: `${ind.p} retrograde` };
      }
      return { matched: false, weight: 0 };
    }

    case 'dispositor': {
      // 1. Find the FROM body (e.g., Jupiter)
      const fromBody = findBody(chart, ind.from);
      if (!fromBody) return { matched: false, weight: 0 };
      // 2. Determine its sign and the custom ruler of that sign
      const fromSign = signFromLon(fromBody.longitude);
      const rulerName = CUSTOM_RULERS[fromSign];
      if (!rulerName) return { matched: false, weight: 0 };
      // 3. Find the ruler in the chart and check its house/sign
      const ruler = findBody(chart, rulerName);
      if (!ruler) return { matched: false, weight: 0 };
      const rulerHouse = ruler.house && ruler.house > 0
        ? ruler.house
        : houseFromLon(ruler.longitude, chart.ascendant);
      const rulerSign = signFromLon(ruler.longitude);
      // 4. Match condition — both toHouse and toSign must match if specified
      const houseOK = ind.toHouse == null || rulerHouse === ind.toHouse;
      const signOK = ind.toSign == null || rulerSign === ind.toSign;
      if (!houseOK || !signOK) return { matched: false, weight: 0 };
      // Build cinematic reason: "Jupiter in Virgo dispositor chain → Vesta in
      // Pisces (10th house)"
      const houseDesc = ind.toHouse != null ? ` (${ordinal(ind.toHouse)} house)` : ` (${ordinal(rulerHouse)} house)`;
      return {
        matched: true,
        weight: ind.w,
        reason: `${ind.from} in ${fromSign} dispositor chain → ${rulerName} in ${rulerSign}${houseDesc}`,
      };
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

// ─── Score one gift ────────────────────────────────────────────

interface GiftScore {
  raw: number;
  reasons: MatchedReason[];
  hadAnchor: boolean;
  matchCount: number;
}

function scoreGift(gift: SoulGift, chart: NatalChart): GiftScore {
  const reasons: MatchedReason[] = [];
  let raw = 0;
  let matchCount = 0;
  let hadAnchor = false;

  for (const ind of gift.indicators) {
    const ev = evaluateIndicator(ind, chart);
    if (ev.matched) {
      raw += ev.weight;
      matchCount += 1;
      if (ev.isAnchor) hadAnchor = true;
      if (ev.reason) {
        reasons.push({
          text: ev.reason,
          weight: ev.weight,
          isAnchor: !!ev.isAnchor,
        });
      }
    }
  }

  // Repetition bonus: more independent matches → more confidence
  if (matchCount >= 6) raw += 10;
  else if (matchCount >= 4) raw += 5;

  return { raw, reasons, hadAnchor, matchCount };
}

// Pre-compute the maximum possible raw weight per gift at module load.
// Required for the fraction-based scoring below. Without this, gifts with
// many instrumented indicators (e.g. Astrology Talent has 67 rules summing
// to ~798 raw points) would always outrank gifts with fewer instrumented
// indicators (median is 4 rules / 52 points) regardless of how strongly
// the chart actually showed each gift — pure surface-area bias.
const MAX_RAW_BY_GIFT: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  for (const gift of SOUL_GIFTS) {
    let max = 0;
    for (const ind of gift.indicators) {
      // Anchor indicators get a 1.5× boost during scoring; reflect that
      // in the ceiling so gifts with anchor-eligible targets aren't
      // unfairly capped below their realistic max.
      max += Math.round((ind as any).w * 1.5);
    }
    out[gift.id] = max;
  }
  return out;
})();

/**
 * Map raw weight sum → 0–100 final score using **per-gift normalization**.
 *
 * Earlier this used absolute raw thresholds (raw 30 → 55, raw 60 → 75…),
 * which structurally favored gifts with more instrumented indicators.
 * Astrology Talent (67 rules, max ~800) could rank above someone's
 * actual chart-defining gift (4 rules, max ~52) just by accumulating
 * weak matches.
 *
 * Now: divide raw by the gift's own ceiling to get a fraction 0–1, then
 * apply the curve. Same chart, two gifts, same fraction matched → same
 * score. A single weak contact in Astrology Talent now correctly maps
 * to a low score, while a tight stack of genuine signatures still rises.
 *
 * Curve calibration (coefficient -2.8):
 *   fraction 0.15 → ~34   (one borderline contact)
 *   fraction 0.30 → ~57   (real signature emerging)
 *   fraction 0.50 → ~75   (gift clearly present)
 *   fraction 0.70 → ~86   (strong fingerprint)
 *   fraction 0.90 → ~92   (chart-defining)
 */
function rawToScore(raw: number, hadAnchor: boolean, maxRaw: number): number {
  if (raw <= 0 || maxRaw <= 0) return 0;
  const fraction = Math.min(1, raw / maxRaw);
  const score = 100 * (1 - Math.exp(-2.8 * fraction));
  // Anchor bonus — only applies when there's substantive supporting
  // evidence (≥ 50% of the gift's fingerprint). A single tight asteroid
  // contact shouldn't pin every gift at 78% — that produces false
  // positives where accidental Apollo-Sun lifts unrelated gifts.
  const anchorFloor = hadAnchor && fraction >= 0.5 ? Math.max(score, 78) : score;
  return Math.max(0, Math.min(100, Math.round(anchorFloor)));
}

// ─── Main entry point ──────────────────────────────────────────

export function computeSoulGifts(chart: NatalChart): SoulGiftsResult {
  if (!chart || !chart.planets || chart.planets.length === 0) {
    return emptyResult();
  }

  const scored: ScoredGift[] = SOUL_GIFTS.map(gift => {
    const s = scoreGift(gift, chart);
    // Sort reasons descending by weight, take top 3 for display
    const topReasons = s.reasons.sort((a, b) => b.weight - a.weight).slice(0, 3);

    // Compose the "why" frame: prefer hand-curated whyExpression on the gift
    // definition; fall back to the description with a generic opener so every
    // card always has interpretive context above the placement list.
    const whyExpression = gift.whyExpression
      ? gift.whyExpression
      : `This signature is the textbook fingerprint of ${gift.name.toLowerCase()}. ${gift.description}`;

    return {
      id: gift.id,
      name: gift.name,
      category: gift.category,
      alsoIn: gift.alsoIn ?? [],
      description: gift.description,
      unlock: gift.unlock,
      whyExpression,
      score: rawToScore(s.raw, s.hadAnchor, MAX_RAW_BY_GIFT[gift.id] || 0),
      rawScore: s.raw,
      reasons: topReasons,
    };
  });

  const sorted = [...scored].sort((a, b) => b.score - a.score);

  // Top 5 — must score ≥80 to qualify; if fewer than 5 qualify
  // we still return the top 5 so the UI is never empty.
  const topFive = sorted.slice(0, 5);

  // Dormant: 65–79 range, gifts present but not yet activated.
  // CRITICAL: must exclude anything already in topFive — otherwise when
  // fewer than 5 gifts clear 80%, the same gift appears in both sections
  // (e.g. a #1 at 78% would show as both Top Soul Gift AND Dormant).
  // Dormant means "next-tier potential not yet expressed" — by definition
  // not the same item as the user's most active gift.
  const topFiveIds = new Set(topFive.map(g => g.id));
  const dormant = sorted
    .filter(g => g.score >= 65 && g.score < 80 && !topFiveIds.has(g.id))
    .slice(0, 6);

  // Section views — top 5 in each lane (primary OR alsoIn)
  const inCategory = (c: GiftCategory) => (g: ScoredGift) =>
    g.category === c || g.alsoIn.includes(c);

  const money = sorted.filter(inCategory('money')).slice(0, 5);
  const love = sorted.filter(inCategory('love')).slice(0, 5);
  const shadow = sorted.filter(inCategory('shadow')).slice(0, 5);
  const spiritual = sorted.filter(inCategory('spiritual')).slice(0, 5);

  // Unlock steps — pull the unlock copy from the top 5 gifts
  const unlockSteps = topFive.map(g => `${g.name}: ${g.unlock}`);

  return {
    topFive,
    dormant,
    money,
    love,
    shadow,
    spiritual,
    unlockSteps,
    computedAt: Date.now(),
  };
}

function emptyResult(): SoulGiftsResult {
  return {
    topFive: [], dormant: [], money: [], love: [], shadow: [], spiritual: [],
    unlockSteps: [],
    computedAt: Date.now(),
  };
}

// ─── Cache helpers ─────────────────────────────────────────────

/**
 * Build a stable cache signature for a chart so identical charts
 * hit the in-memory + AsyncStorage cache. Sums planet longitudes
 * rounded to 0.1° plus ascendant — collisions across distinct
 * charts are negligible at this resolution.
 */
export function chartSignature(chart: NatalChart): string {
  if (!chart || !chart.planets) return 'empty';
  const sig = chart.planets
    .map(p => `${p.name}:${Math.round(p.longitude * 10)}`)
    .join('|');
  return `${sig}|asc:${Math.round(chart.ascendant * 10)}|mc:${Math.round(chart.midheaven * 10)}`;
}

// Score-band label for UI display
export function scoreBand(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Elite Soul Gift', color: '#F5A623' };
  if (score >= 80) return { label: 'Strong Soul Gift', color: '#9B6FF6' };
  if (score >= 70) return { label: 'Developing Gift', color: '#6BB4FF' };
  if (score >= 60) return { label: 'Moderate Gift', color: '#A8B0C0' };
  return { label: 'Background Potential', color: '#5C6378' };
}
