/**
 * DRACONIC CHART LAYER
 * --------------------------------------------------------------
 * Pure-function extension to the Soul Memory Engine. Adds the
 * Draconic chart as a soul-level layer that CONFIRMS, REFINES, and
 * DEEPENS existing past-life results without competing with them.
 *
 * Per spec section 14, exposes six entry points:
 *
 *   1. calculateDraconicChart        — rotation by natal NN longitude
 *   2. analyzeDraconicSoulBlueprint  — Soul Sun/Moon/ASC/Ruler narrative
 *   3. compareDraconicToNatal        — finds confirming Draconic→natal contacts
 *   4. scoreDraconicConfirmations    — per-archetype confirmation point totals
 *   5. mergeDraconicWithSoulMemoryResults — adds Draconic fields to result,
 *                                     bumps confidences without overriding
 *   6. generateDraconicSoulNarrative — produces "What Your Soul Keeps
 *                                     Returning To" lifetime patterns
 *
 * Design rules (per spec):
 *   • House cusps stay NATAL — only planet longitudes rotate.
 *   • Conjunctions and oppositions only.
 *   • Orb max 3°: 0–1° ×1.6, 1–2° ×1.3, 2–3° ×1.0.
 *   • Confirmation never reduces existing confidence — only raises it.
 *   • Output language stays soul-deep and specific (sign + house +
 *     duad + compendium + matched contacts).
 * --------------------------------------------------------------
 */

import type { NatalChart, NatalPlanet } from './types';
import { getFullDuadCompendium } from './duadCompendium';
import {
  CUSTOM_RULERS,
} from './soulGiftsDatabase';
import {
  SOUL_SUN, SOUL_MOON, SOUL_ASC, SOUL_RULER,
  LIFETIME_PATTERNS,
} from './draconicBlueprints';
import {
  DRACONIC_CONFIRMATIONS, type DraconicConfirmationRule,
} from './draconicConfirmations';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const ELEMENT_BY_SIGN: Record<string, 'fire'|'earth'|'air'|'water'> = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water',
};

// ─── Body name aliases (mirrors soulMemoryEngine for consistency) ─

const ALIAS: Record<string, string[]> = {
  ASC: ['Ascendant', 'ASC'],
  DSC: ['Descendant', 'DSC', 'DESC'],
  MC: ['MC', 'Midheaven'],
  IC: ['IC', 'Imum Coeli'],
  'North Node': ['North Node', 'True Node', 'Rahu'],
  'South Node': ['South Node', 'Ketu'],
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

function signFromLon(lon: number): string {
  return SIGNS[Math.floor((((lon % 360) + 360) % 360) / 30) % 12];
}

function houseFromLon(lon: number, ascLon: number): number {
  // Whole-sign houses derived from ASC sign — robust across systems.
  const ascSign = Math.floor((((ascLon % 360) + 360) % 360) / 30) % 12;
  const lonSign = Math.floor((((lon % 360) + 360) % 360) / 30) % 12;
  return ((lonSign - ascSign + 12) % 12) + 1;
}

function getNatalLon(chart: NatalChart, name: string): number | null {
  if (name === 'IC') {
    const m = chart.midheaven;
    return m == null ? null : (m + 180) % 360;
  }
  if (name === 'DSC') {
    const a = chart.ascendant;
    return a == null ? null : (a + 180) % 360;
  }
  const b = findBody(chart, name);
  return b ? b.longitude : null;
}

function ordinal(n: number): string {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

// ─── Public types ──────────────────────────────────────────────

/**
 * Draconic chart shape — same field names as NatalChart for
 * interchangeability, but every body's longitude is rotated by the
 * natal North Node longitude. Houses array is intentionally left
 * empty (we keep natal houses for the "Draconic body falling into
 * natal house" reading).
 */
export interface DraconicChart {
  /** Same body list as natal, with rotated longitudes + recomputed signs. */
  planets: NatalPlanet[];
  /** Rotated ASC. Used to determine the Draconic Ascendant SIGN only. */
  ascendant: number;
  /** Rotated MC. */
  midheaven: number;
  /** The natal NN longitude used as the rotation key (for traceability). */
  rotationOffset: number;
}

/**
 * Soul Blueprint section data — Sun/Moon/ASC/Ruler at soul level.
 * Per user directive: house cusps in the Draconic chart shift with the
 * rotation but always begin at 0° of their sign (whole-sign houses
 * anchored to the Draconic ASC). The `house` field is the body's house
 * position in the DRACONIC frame, not the natal frame.
 */
export interface DraconicBlueprint {
  sun:    { sign: string; house: number; duad: string; compendium: string; narrative: string };
  moon:   { sign: string; house: number; duad: string; compendium: string; narrative: string };
  asc:    { sign: string;                duad: string; compendium: string; narrative: string };
  ruler:  { name: string; sign: string; house: number; narrative: string };
}

/** Single Draconic→natal contact found by the comparison pass. */
export interface DraconicContact {
  draconicBody: string;
  natalTarget: string;
  /** 'conj' or 'opp' — spec restricts to these two only. */
  aspect: 'conj' | 'opp';
  orb: number;        // arc-degree distance from exact
  /** Sign the rotated Draconic body lands in. */
  draconicSign: string;
  /** Whole-sign house in the DRACONIC frame (cusps at 0° of each sign). */
  draconicHouse: number;
}

/** Per-archetype confirmation total + matched rules. */
export interface ArchetypeConfirmation {
  archetypeId: string;
  totalBoost: number;          // points to add to confidence
  matchedRules: { rule: DraconicConfirmationRule; orb: number; multiplier: number }[];
  clusterBonus: boolean;       // true if 3+ rules matched (+10 raw)
}

/** Lifetime pattern that fired against this chart. */
export interface LifetimePatternMatch {
  id: string;
  narrative: string;
}

// ─── 1. calculateDraconicChart ─────────────────────────────────

/**
 * Rotate every natal body by the natal North Node's longitude so the
 * NN sits at 0° Aries. House cusps are NOT rotated — natal houses
 * remain the spatial frame; only the planetary longitudes shift.
 *
 * If the chart has no recognizable North Node, returns null and the
 * upstream code skips the entire Draconic layer gracefully.
 */
export function calculateDraconicChart(chart: NatalChart): DraconicChart | null {
  if (!chart || !chart.planets || chart.planets.length === 0) return null;
  const nnLon = getNatalLon(chart, 'North Node');
  if (nnLon == null) return null;

  const offset = nnLon;
  const rotate = (lon: number): number => (((lon - offset) % 360) + 360) % 360;

  const planets: NatalPlanet[] = chart.planets.map(p => {
    const newLon = rotate(p.longitude);
    return {
      name: p.name,
      longitude: Math.round(newLon * 100) / 100,
      sign: signFromLon(newLon),
      degree: Math.round((newLon % 30) * 100) / 100,
      // House stays NATAL — Draconic bodies "fall into" the natal house
      // their rotated longitude lands in. Computed at lookup time below.
      house: 0,
      retrograde: p.retrograde,
    };
  });

  return {
    planets,
    ascendant: rotate(chart.ascendant ?? 0),
    midheaven: rotate(chart.midheaven ?? 0),
    rotationOffset: offset,
  };
}

// ─── 2. analyzeDraconicSoulBlueprint ───────────────────────────

/**
 * Build the Soul Blueprint card data: Draconic Sun, Moon, ASC, and
 * chart ruler. Each placement combines:
 *   - the rotated sign (the soul's archetype)
 *   - the natal house the Draconic body falls into (where the soul's
 *     ancient pattern most expresses in this incarnation)
 *   - the duad and compendium (precision sub-layers per spec §5)
 *   - a sign-level narrative from the SOUL_SUN/MOON/ASC tables
 */
export function analyzeDraconicSoulBlueprint(
  natal: NatalChart,
  draconic: DraconicChart,
): DraconicBlueprint | null {
  const dSun = draconic.planets.find(p => p.name === 'Sun');
  const dMoon = draconic.planets.find(p => p.name === 'Moon');
  if (!dSun || !dMoon) return null;

  // Per user directive: Draconic houses use whole-sign cusps anchored to
  // the Draconic ASC (each cusp at 0° of its sign). Pass Draconic ASC sign
  // to duad/compendium so the house derivations inside that service also
  // operate in the Draconic frame.
  const dAscSign = signFromLon(draconic.ascendant);
  const dAscLon  = draconic.ascendant;

  // Soul Sun
  const sunDc = getFullDuadCompendium(dSun.longitude, dAscSign);
  const sun = {
    sign: dSun.sign,
    house: houseFromLon(dSun.longitude, dAscLon),
    duad: sunDc.duadSign,
    compendium: sunDc.compendiumSign,
    narrative: SOUL_SUN[dSun.sign] || '',
  };

  // Soul Moon
  const moonDc = getFullDuadCompendium(dMoon.longitude, dAscSign);
  const moon = {
    sign: dMoon.sign,
    house: houseFromLon(dMoon.longitude, dAscLon),
    duad: moonDc.duadSign,
    compendium: moonDc.compendiumSign,
    narrative: SOUL_MOON[dMoon.sign] || '',
  };

  // Soul ASC — the angle itself IS the 1st-house cusp at soul level,
  // so house is implicit.
  const ascDc = getFullDuadCompendium(draconic.ascendant, dAscSign);
  const asc = {
    sign: dAscSign,
    duad: ascDc.duadSign,
    compendium: ascDc.compendiumSign,
    narrative: SOUL_ASC[dAscSign] || '',
  };

  // Soul Ruler — the planet ruling the Draconic ASC sign, read from the
  // DRACONIC chart. Its house is also computed in the Draconic frame.
  const rulerName = CUSTOM_RULERS[dAscSign] || 'Sun';
  const dRuler = draconic.planets.find(p => p.name === rulerName);
  const ruler = {
    name: rulerName,
    sign: dRuler ? dRuler.sign : dAscSign,
    house: dRuler ? houseFromLon(dRuler.longitude, dAscLon) : 1,
    narrative: SOUL_RULER[rulerName] || SOUL_RULER.Sun,
  };

  return { sun, moon, asc, ruler };
}

// ─── 3. compareDraconicToNatal ─────────────────────────────────

/**
 * Walk every confirmation rule across all archetypes and return the
 * Draconic→natal contacts that fire within 3° orb (conj or opp).
 * Returns the FULL contact list — scoring is applied separately so
 * the same matches can drive both confidence boosts AND narrative.
 */
export function compareDraconicToNatal(
  natal: NatalChart,
  draconic: DraconicChart,
): DraconicContact[] {
  const contacts: DraconicContact[] = [];
  const seen = new Set<string>();

  // Walk every archetype's rules
  for (const rules of Object.values(DRACONIC_CONFIRMATIONS)) {
    for (const rule of rules) {
      const dKey = `${rule.draconic}|${rule.natalTarget}`;
      if (seen.has(dKey)) continue;
      seen.add(dKey);

      const dPlanet = draconic.planets.find(p => {
        const aliases = ALIAS[rule.draconic] || [rule.draconic];
        return aliases.includes(p.name);
      });
      const tLon = getNatalLon(natal, rule.natalTarget);
      if (!dPlanet || tLon == null) continue;

      // Conjunction or opposition only, max 3° orb (spec §3)
      const orbConj = orbDist(dPlanet.longitude, tLon, 0);
      const orbOpp  = orbDist(dPlanet.longitude, tLon, 180);
      let aspect: 'conj' | 'opp' | null = null;
      let orb = 999;
      if (orbConj <= 3.0) { aspect = 'conj'; orb = orbConj; }
      else if (orbOpp <= 3.0) { aspect = 'opp'; orb = orbOpp; }
      if (!aspect) continue;

      contacts.push({
        draconicBody: rule.draconic,
        natalTarget: rule.natalTarget,
        aspect,
        orb,
        draconicSign: dPlanet.sign,
        // House in DRACONIC frame (whole-sign, cusp at 0° of sign)
        draconicHouse: houseFromLon(dPlanet.longitude, draconic.ascendant),
      });
    }
  }

  return contacts;
}

function orbDist(lon1: number, lon2: number, target: number): number {
  let diff = Math.abs(lon1 - lon2);
  if (diff > 180) diff = 360 - diff;
  return Math.abs(diff - target);
}

// ─── 4. scoreDraconicConfirmations ─────────────────────────────

/**
 * For each archetype that scored in the existing engine, evaluate
 * which of its DRACONIC_CONFIRMATIONS rules fire. Returns confidence
 * boost amounts using the spec §10 weight table and orb tiers.
 *
 * Cluster bonus: 3+ matched rules within an archetype = +10 raw
 * (per spec).
 *
 * IMPORTANT: This boost is added to the existing confidence — it
 * NEVER lowers a score. Confirmation is multiplicative ONLY upward.
 */
export function scoreDraconicConfirmations(
  archetypeIds: string[],
  natal: NatalChart,
  draconic: DraconicChart,
): ArchetypeConfirmation[] {
  const out: ArchetypeConfirmation[] = [];

  for (const id of archetypeIds) {
    const rules = DRACONIC_CONFIRMATIONS[id];
    if (!rules || rules.length === 0) continue;

    const matchedRules: ArchetypeConfirmation['matchedRules'] = [];
    let total = 0;

    for (const rule of rules) {
      const dPlanet = draconic.planets.find(p => {
        const aliases = ALIAS[rule.draconic] || [rule.draconic];
        return aliases.includes(p.name);
      });
      const tLon = getNatalLon(natal, rule.natalTarget);
      if (!dPlanet || tLon == null) continue;

      const orbConj = orbDist(dPlanet.longitude, tLon, 0);
      const orbOpp  = orbDist(dPlanet.longitude, tLon, 180);
      const orb = Math.min(orbConj, orbOpp);
      if (orb > 3.0) continue;

      // Orb tier multiplier (spec §3)
      let mult = 1.0;
      if (orb <= 1.0) mult = 1.6;
      else if (orb <= 2.0) mult = 1.3;
      // 2.0–3.0 stays at 1.0

      // Base weight by category (spec §10)
      const baseWeight =
        rule.weight === 'luminary' ? 12 :
        rule.weight === 'ruler' ? 10 :
        rule.weight === 'sn' ? 10 :
        rule.weight === 'snMidpt' ? 9 :
        5;  // asteroid

      const points = Math.round(baseWeight * mult);
      total += points;
      matchedRules.push({ rule, orb, multiplier: mult });
    }

    // Cluster bonus per spec §10 — 3+ matches = +10 raw
    const clusterBonus = matchedRules.length >= 3;
    if (clusterBonus) total += 10;

    if (total > 0) {
      out.push({
        archetypeId: id,
        totalBoost: total,
        matchedRules,
        clusterBonus,
      });
    }
  }

  return out;
}

// ─── 5. mergeDraconicWithSoulMemoryResults ─────────────────────

/**
 * Apply a confirmation boost to a confidence score using a smooth
 * curve so an extra 30 raw points doesn't push 81 → 130. The boost
 * is added to the underlying raw signal, then re-mapped to 0–100.
 *
 * boost is in raw indicator-weight units (the ones from spec §10).
 * confidence is the existing 0–100 number from the natal engine.
 */
export function applyConfirmationToConfidence(
  confidence: number,
  boost: number,
): number {
  if (boost <= 0) return confidence;
  // Recover an approximate raw from the existing confidence (inverse
  // of `100 * (1 - exp(-1.1x))`) so we can add boost in the same units.
  const safe = Math.min(99, Math.max(0, confidence));
  const recoveredRaw = -Math.log(1 - safe / 100) / 1.1 * 100;
  const newRaw = recoveredRaw + boost;
  // Re-apply the curve. Soft-cap at 99 to leave room for headroom.
  const newScore = 100 * (1 - Math.exp(-1.1 * (newRaw / 100)));
  return Math.min(99, Math.round(newScore));
}

// ─── 6. generateDraconicSoulNarrative ──────────────────────────

/**
 * Run lifetime-pattern detection. Returns 2–4 narratives that describe
 * the recurring soul behavior across many incarnations, used in the
 * "What Your Soul Keeps Returning To" card (spec §4).
 *
 * Triggers documented in LIFETIME_PATTERNS — implementation here is a
 * switch on pattern id.
 */
export function generateDraconicSoulNarrative(
  natal: NatalChart,
  draconic: DraconicChart,
  contacts: DraconicContact[],
): LifetimePatternMatch[] {
  const matches: LifetimePatternMatch[] = [];

  const dSun = draconic.planets.find(p => p.name === 'Sun');
  const dMoon = draconic.planets.find(p => p.name === 'Moon');
  const dAscSign = signFromLon(draconic.ascendant);

  // House counts use the DRACONIC frame (whole-sign cusps anchored to
  // the rotated ASC) per user directive — every cusp begins at 0°.
  const dHouseCount = (h: number): number =>
    draconic.planets.filter(p => {
      if (['Ascendant','MC','Descendant','IC','Vertex','Anti-Vertex'].includes(p.name)) return false;
      return houseFromLon(p.longitude, draconic.ascendant) === h;
    }).length;

  const dSignCount = (s: string): number =>
    draconic.planets.filter(p => {
      if (['Ascendant','MC','Descendant','IC','Vertex','Anti-Vertex'].includes(p.name)) return false;
      return p.sign === s;
    }).length;

  const dElementCount = (e: 'fire'|'earth'|'air'|'water'): number =>
    draconic.planets.filter(p => {
      if (['Ascendant','MC','Descendant','IC','Vertex','Anti-Vertex'].includes(p.name)) return false;
      return ELEMENT_BY_SIGN[p.sign] === e;
    }).length;

  const hasContact = (draconicBody: string, natalTargets: string[]): boolean =>
    contacts.some(c => c.draconicBody === draconicBody && natalTargets.includes(c.natalTarget));

  // Pattern matchers — each returns true if its trigger fires.
  // `!!(dSun && ...)` coerces possibly-undefined short-circuit results to
  // boolean so the function's return type satisfies `() => boolean`.
  const triggers: Record<string, () => boolean> = {
    guideOthers: () =>
      !!(dSun && (dElementCount('fire') >= 3 || ['Sagittarius','Aquarius'].includes(dSun.sign))) ||
      dHouseCount(9) + dHouseCount(10) + dHouseCount(11) >= 3,
    intenseRelationship: () =>
      hasContact('Venus', ['Pluto', 'South Node']) ||
      hasContact('Juno', ['Venus', 'Mars', 'Sun']) ||
      hasContact('Eros', ['Pluto', 'Sun']),
    hiddenSpiritualWork: () =>
      dHouseCount(12) >= 2 ||
      hasContact('Neptune', ['Sun', 'Moon', 'South Node']) ||
      hasContact('Vesta', ['Sun', 'Moon']),
    powerStruggles: () =>
      hasContact('Pluto', ['Sun', 'Mars', 'MC', 'South Node', 'ASC']) ||
      dHouseCount(8) >= 2,
    exileDifference: () =>
      !!(dSun && dSun.sign === 'Aquarius') ||
      !!(dMoon && dMoon.sign === 'Aquarius') ||
      dAscSign === 'Aquarius' ||
      hasContact('Uranus', ['Sun', 'Moon']),
    craftMastery: () =>
      !!(dSun && dElementCount('earth') >= 3) ||
      hasContact('Saturn', ['Sun', 'Mercury', 'MC']) ||
      hasContact('Vesta', ['Sun']),
    translationBetweenWorlds: () =>
      hasContact('Mercury', ['Neptune', 'Pluto', 'South Node']) ||
      dHouseCount(9) >= 2,
    sacrificialService: () =>
      hasContact('Ceres', ['Sun', 'Moon']) ||
      dHouseCount(6) >= 2,
    creativeTransmission: () =>
      hasContact('Venus', ['Sun', 'MC', 'ASC']) ||
      hasContact('Apollo', ['Sun', 'MC']) ||
      dHouseCount(5) >= 2,
    karmicHealing: () =>
      hasContact('Chiron', ['Sun', 'Moon', 'South Node']) ||
      hasContact('Pluto', ['Moon']),
    institutionalAuthority: () =>
      hasContact('Saturn', ['Sun', 'MC']) ||
      dHouseCount(10) >= 2 ||
      dSignCount('Capricorn') >= 3,
    visionaryRupture: () =>
      hasContact('Uranus', ['Sun', 'Mercury', 'MC']) ||
      dHouseCount(11) >= 2 ||
      dSignCount('Aquarius') >= 3,
    erosTransformation: () =>
      hasContact('Eros', ['Sun', 'Moon', 'Venus', 'Pluto']) ||
      hasContact('Lilith', ['Venus']) ||
      dHouseCount(8) >= 2,
    mysticPerception: () =>
      hasContact('Neptune', ['Moon', 'Mercury', 'Urania']) ||
      dHouseCount(12) >= 2 ||
      !!(dSun && dSun.sign === 'Pisces') ||
      !!(dMoon && dMoon.sign === 'Pisces'),
  };

  for (const pat of LIFETIME_PATTERNS) {
    const fn = triggers[pat.id];
    if (fn && fn()) {
      matches.push({ id: pat.id, narrative: pat.narrative });
    }
  }

  // Cap at 4 so the UI doesn't sprawl. Sort by trigger order in
  // LIFETIME_PATTERNS so similar themes cluster naturally.
  return matches.slice(0, 4);
}

// ─── Top-level orchestrator ────────────────────────────────────

/**
 * Convenience: run the entire Draconic layer end-to-end for a chart
 * and return all derived data structures. Soul Memory engine calls
 * this once and merges the result onto SoulMemoryResult.
 */
export interface DraconicLayer {
  draconic: DraconicChart;
  blueprint: DraconicBlueprint | null;
  contacts: DraconicContact[];
  archetypeConfirmations: Record<string, ArchetypeConfirmation>;
  lifetimePatterns: LifetimePatternMatch[];
}

export function buildDraconicLayer(
  natal: NatalChart,
  archetypeIdsToScore: string[],
): DraconicLayer | null {
  const draconic = calculateDraconicChart(natal);
  if (!draconic) return null;

  const blueprint = analyzeDraconicSoulBlueprint(natal, draconic);
  const contacts = compareDraconicToNatal(natal, draconic);
  const confirmations = scoreDraconicConfirmations(archetypeIdsToScore, natal, draconic);
  const lifetimePatterns = generateDraconicSoulNarrative(natal, draconic, contacts);

  // Build map for O(1) lookup when merging with SoulMemoryResult
  const archetypeConfirmations: Record<string, ArchetypeConfirmation> = {};
  for (const c of confirmations) {
    archetypeConfirmations[c.archetypeId] = c;
  }

  return { draconic, blueprint, contacts, archetypeConfirmations, lifetimePatterns };
}
