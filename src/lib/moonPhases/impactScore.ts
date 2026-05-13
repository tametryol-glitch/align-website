/**
 * Lunar Event Impact Score
 *
 * Given a lunar event (new moon, quarter, full moon, or eclipse) and a user's
 * natal chart, returns a 0-100 score expressing how strongly the event
 * activates the chart -- plus a transparent breakdown of why.
 *
 * Pure function. No I/O. All math is deterministic.
 *
 * Scoring model (composable, all parameters clamped to sane ranges):
 *
 *   rawScore = eventBase
 *            + eventMultiplier x Sum(aspectContribution)
 *            + angularHouseBonus
 *            + progressedResonance
 *
 *   score = clamp(rawScore, 0, 100)
 *
 * Ported from align-app for web use. No React Native dependencies.
 */

import type { NatalChart, NatalAspect, HouseCusp } from '@/lib/engines/types';

// ── Inlined custom rulerships (from mobile's customRulerships.ts) ────────

const CUSTOM_SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Vesta',
  Libra: 'Juno',
  Scorpio: 'Pluto',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Uranus',
  Pisces: 'Neptune',
};

function signForLongitude(lon: number): string {
  const signs = [
    'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
    'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
  ];
  const idx = Math.floor((((lon % 360) + 360) % 360) / 30);
  return signs[idx];
}

function getRulerOf(sign: string): string {
  return CUSTOM_SIGN_RULERS[sign] || 'Sun';
}

// ── Public types ──────────────────────────────────────────────────────────

export type LunarEventType =
  | 'new'
  | 'first_quarter'
  | 'full'
  | 'last_quarter'
  | 'eclipse';

export type EclipseSubtype =
  | 'solar_total'
  | 'solar_partial'
  | 'solar_annular'
  | 'lunar_total'
  | 'lunar_partial'
  | 'lunar_penumbral';

export interface LunarEvent {
  type: LunarEventType;
  subtype?: EclipseSubtype;
  date: Date;
  /** Sun ecliptic longitude at peak, 0-360 */
  sunLon: number;
  /** Moon ecliptic longitude at peak, 0-360 */
  moonLon: number;
  /** Lunar node longitude at peak. Optional, used for eclipse-axis framing. */
  nodeLon?: number;
  /** Which lunar node the eclipse is on. Only meaningful for eclipses. */
  nodeSide?: 'north' | 'south';
}

export type ImpactBand =
  | 'negligible'
  | 'low'
  | 'moderate'
  | 'high'
  | 'transformative';

export type ContributionKind =
  | 'event_base'
  | 'aspect'
  | 'house'
  | 'event_multiplier'
  | 'progressed';

export interface ImpactContribution {
  kind: ContributionKind;
  /** Natal point being aspected, when applicable. */
  target?: string;
  /** Short human phrase the UI can render verbatim. */
  detail: string;
  /** Signed points this contribution added to the raw score. */
  points: number;
}

export interface ImpactScore {
  score: number;        // clamped 0-100, rounded
  rawScore: number;     // pre-clamp, pre-round (for tests/debug)
  band: ImpactBand;
  contributions: ImpactContribution[]; // sorted by points DESC
  /** Single-sentence headline the FORECAST / ECLIPSES card uses. */
  primary: string;
  /** Natal house the event longitude falls into (1..12), or 0 if the chart lacks cusps. */
  eventHouse: number;
}

export interface ComputeImpactOpts {
  progressed?: NatalChart;
}

// ── Tunables ──────────────────────────────────────────────────────────────

const EVENT_BASE: Record<LunarEventType, number> = {
  new: 5,
  first_quarter: 3,
  full: 6,
  last_quarter: 3,
  eclipse: 0,
};

const ECLIPSE_BASE: Record<EclipseSubtype, number> = {
  solar_total: 15,
  solar_partial: 12,
  solar_annular: 13,
  lunar_total: 12,
  lunar_partial: 10,
  lunar_penumbral: 8,
};

const EVENT_MULTIPLIER: Record<LunarEventType, number> = {
  new: 1.0,
  first_quarter: 1.0,
  full: 1.0,
  last_quarter: 1.0,
  eclipse: 1.5,
};

interface AspectSpec {
  name: 'conjunction' | 'opposition' | 'square' | 'quincunx';
  angle: number;
  maxOrb: number;
  base: number;
  phrase: string;
}

const ASPECTS: AspectSpec[] = [
  { name: 'conjunction', angle: 0,   maxOrb: 6, base: 40, phrase: 'Conjunction' },
  { name: 'opposition',  angle: 180, maxOrb: 6, base: 34, phrase: 'Opposition' },
  { name: 'square',      angle: 90,  maxOrb: 4, base: 28, phrase: 'Square' },
  { name: 'quincunx',    angle: 150, maxOrb: 3, base: 18, phrase: 'Quincunx' },
];

const LUMINARIES = new Set(['Sun', 'Moon']);
const PRIMARY_ANGLES = new Set(['Ascendant', 'MC']);
const SECONDARY_ANGLES = new Set(['Descendant', 'IC']);
const NODES = new Set(['North Node', 'South Node', 'Mean Node', 'True Node']);
const PERSONAL_PLANETS = new Set(['Mercury', 'Venus', 'Mars']);
const OTHER_BODIES = new Set([
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Vesta', 'Juno',
]);

const ANGULAR_HOUSES = new Set([1, 4, 7, 10]);
const SUCCEDENT_HOUSES = new Set([2, 5, 8, 11]);

const PROGRESSED_FACTOR = 0.4;

const BAND_THRESHOLDS: [number, ImpactBand][] = [
  [75, 'transformative'],
  [50, 'high'],
  [25, 'moderate'],
  [10, 'low'],
  [0,  'negligible'],
];

// ── Math helpers ──────────────────────────────────────────────────────────

function norm360(x: number): number {
  return ((x % 360) + 360) % 360;
}

function angularSeparation(a: number, b: number): number {
  const d = Math.abs(norm360(a) - norm360(b));
  return d > 180 ? 360 - d : d;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function bandFor(score: number): ImpactBand {
  for (const [threshold, band] of BAND_THRESHOLDS) {
    if (score >= threshold) return band;
  }
  return 'negligible';
}

function houseFor(lon: number, houses: HouseCusp[] | undefined): number {
  if (!houses || houses.length !== 12) return 0;
  const target = norm360(lon);
  for (let i = 0; i < 12; i++) {
    const cusp = houses[i];
    const next = houses[(i + 1) % 12];
    if (!cusp || !next) continue;
    const start = norm360(cusp.longitude);
    const end = norm360(next.longitude);
    if (start <= end) {
      if (target >= start && target < end) return cusp.house;
    } else {
      if (target >= start || target < end) return cusp.house;
    }
  }
  return 0;
}

// ── Target weighting ──────────────────────────────────────────────────────

function chartRulerName(natal: NatalChart): string | null {
  if (typeof natal.ascendant !== 'number') return null;
  const sign = signForLongitude(natal.ascendant);
  return getRulerOf(sign) || null;
}

interface TargetInfo {
  name: string;
  longitude: number;
  weight: number;
  label: string;
}

function buildTargets(natal: NatalChart): TargetInfo[] {
  if (!natal || !Array.isArray(natal.planets)) return [];
  const ruler = chartRulerName(natal);
  const seen = new Set<string>();
  const out: TargetInfo[] = [];

  for (const p of natal.planets) {
    if (!p || typeof p.longitude !== 'number' || !p.name) continue;
    if (seen.has(p.name)) continue;
    seen.add(p.name);

    let weight = 0;
    let label = p.name;

    if (LUMINARIES.has(p.name) || PRIMARY_ANGLES.has(p.name)) weight = 1.0;
    else if (ruler && p.name === ruler)                         { weight = 0.9; label = `Chart Ruler (${ruler})`; }
    else if (SECONDARY_ANGLES.has(p.name))                      weight = 0.7;
    else if (NODES.has(p.name))                                 weight = 0.7;
    else if (PERSONAL_PLANETS.has(p.name))                      weight = 0.6;
    else if (OTHER_BODIES.has(p.name))                          weight = 0.5;
    else continue;

    out.push({ name: p.name, longitude: p.longitude, weight, label });
  }

  if (!seen.has('Ascendant') && typeof natal.ascendant === 'number') {
    out.push({ name: 'Ascendant', longitude: natal.ascendant, weight: 1.0, label: 'Ascendant' });
  }
  if (!seen.has('MC') && typeof natal.midheaven === 'number') {
    out.push({ name: 'MC', longitude: natal.midheaven, weight: 1.0, label: 'MC' });
  }

  return out;
}

// ── Aspect scanning ───────────────────────────────────────────────────────

interface AspectHit {
  spec: AspectSpec;
  target: TargetInfo;
  orb: number;
  orbFactor: number;
  points: number;
}

function scanAspects(eventLon: number, targets: TargetInfo[]): AspectHit[] {
  const hits: AspectHit[] = [];
  for (const t of targets) {
    const sep = angularSeparation(eventLon, t.longitude);
    for (const spec of ASPECTS) {
      const orb = Math.abs(sep - spec.angle);
      if (orb > spec.maxOrb) continue;
      const orbFactor = 1 - orb / spec.maxOrb;
      if (orbFactor <= 0) continue;
      const points = spec.base * t.weight * orbFactor;
      hits.push({ spec, target: t, orb, orbFactor, points });
    }
  }
  hits.sort((a, b) => b.points - a.points);
  return hits;
}

function progressedBonus(
  eventLon: number,
  hit: AspectHit,
  progressed: NatalChart | undefined,
): ImpactContribution | null {
  if (!progressed) return null;
  const targets = buildTargets(progressed);
  const match = targets.find(t => t.name === hit.target.name);
  if (!match) return null;
  const sep = angularSeparation(eventLon, match.longitude);
  const orb = Math.abs(sep - hit.spec.angle);
  if (orb > hit.spec.maxOrb) return null;
  const orbFactor = 1 - orb / hit.spec.maxOrb;
  if (orbFactor <= 0) return null;
  const points = hit.spec.base * match.weight * orbFactor * PROGRESSED_FACTOR;
  return {
    kind: 'progressed',
    target: match.label,
    detail: `Progressed ${hit.spec.phrase.toLowerCase()} to ${match.label} (orb ${orb.toFixed(1)})`,
    points,
  };
}

// ── Event-body selection ──────────────────────────────────────────────────

function eventBodyLon(event: LunarEvent): number {
  return event.moonLon;
}

function baseEventPoints(event: LunarEvent): number {
  if (event.type === 'eclipse' && event.subtype) {
    return ECLIPSE_BASE[event.subtype] ?? EVENT_BASE.eclipse;
  }
  return EVENT_BASE[event.type] ?? 0;
}

function eventLabel(event: LunarEvent): string {
  if (event.type === 'eclipse') {
    if (!event.subtype) return 'Eclipse';
    const parts = event.subtype.split('_');
    return `${parts[0][0].toUpperCase()}${parts[0].slice(1)} ${parts[1]} eclipse`;
  }
  switch (event.type) {
    case 'new':           return 'New Moon';
    case 'first_quarter': return 'First Quarter';
    case 'full':          return 'Full Moon';
    case 'last_quarter':  return 'Last Quarter';
    default:              return 'Lunar event';
  }
}

// ── The function ──────────────────────────────────────────────────────────

export function computeImpact(
  event: LunarEvent,
  natal: NatalChart | null | undefined,
  opts: ComputeImpactOpts = {},
): ImpactScore {
  if (!natal || !Array.isArray(natal.planets) || natal.planets.length === 0) {
    return {
      score: 0,
      rawScore: 0,
      band: 'negligible',
      contributions: [],
      primary: 'Add your birth data to see how this affects you',
      eventHouse: 0,
    };
  }

  const contributions: ImpactContribution[] = [];

  // 1) Event base
  const base = baseEventPoints(event);
  if (base > 0) {
    contributions.push({
      kind: 'event_base',
      detail: `${eventLabel(event)} baseline`,
      points: base,
    });
  }

  // 2) Aspect scan from event body to every natal target
  const eventLon = eventBodyLon(event);
  const targets = buildTargets(natal);
  const hits = scanAspects(eventLon, targets);
  const mult = EVENT_MULTIPLIER[event.type] ?? 1.0;

  let aspectPointsTotal = 0;
  for (const hit of hits) {
    const awarded = hit.points * mult;
    aspectPointsTotal += awarded;
    contributions.push({
      kind: 'aspect',
      target: hit.target.label,
      detail: `${hit.spec.phrase} to natal ${hit.target.label} (orb ${hit.orb.toFixed(1)})${mult !== 1 ? ` x${mult}` : ''}`,
      points: awarded,
    });
    const prog = progressedBonus(eventLon, hit, opts.progressed);
    if (prog) {
      aspectPointsTotal += prog.points;
      contributions.push(prog);
    }
  }

  // 3) Angular house bonus
  const house = houseFor(eventLon, natal.houses);
  let houseBonus = 0;
  if (ANGULAR_HOUSES.has(house))       houseBonus = 5;
  else if (SUCCEDENT_HOUSES.has(house)) houseBonus = 2;
  if (houseBonus > 0) {
    contributions.push({
      kind: 'house',
      detail: `Event falls in your ${ordinal(house)} house (${ANGULAR_HOUSES.has(house) ? 'angular' : 'succedent'})`,
      points: houseBonus,
    });
  }

  // Final composition
  const rawScore = base + aspectPointsTotal + houseBonus;
  const score = Math.round(clamp(rawScore, 0, 100));
  const band = bandFor(score);

  contributions.sort((a, b) => b.points - a.points);

  const topAspect = contributions.find(c => c.kind === 'aspect' && c.target);
  const topProgressed = contributions.find(c => c.kind === 'progressed' && c.target);
  let primary: string;
  if (topAspect) {
    primary = aspectHeadline(topAspect);
  } else if (topProgressed) {
    primary = `${topProgressed.detail}`;
  } else {
    primary = `${eventLabel(event)} -- no tight aspects to your chart`;
  }

  return { score, rawScore, band, contributions, primary, eventHouse: house };
}

// ── Small formatting helpers ──────────────────────────────────────────────

function ordinal(n: number): string {
  if (n <= 0) return String(n);
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

function aspectHeadline(c: ImpactContribution): string {
  const m = c.detail.match(/^(Conjunction|Opposition|Square|Quincunx) to natal ([^(]+?)\s*\(/);
  if (!m) return c.detail;
  const verb: Record<string, string> = {
    Conjunction: 'Conjoins',
    Opposition:  'Opposes',
    Square:      'Squares',
    Quincunx:    'Tenses with',
  };
  return `${verb[m[1]] || m[1]} your ${m[2].trim()}`;
}

// Exposed only for tests / debugging.
export const __internals = {
  angularSeparation,
  houseFor,
  buildTargets,
  scanAspects,
  chartRulerName,
  bandFor,
  ASPECTS,
  EVENT_BASE,
  ECLIPSE_BASE,
  EVENT_MULTIPLIER,
  PROGRESSED_FACTOR,
};

// Silence unused-import warning if NatalAspect ends up unused after refactors.
export type _ReservedNatalAspect = NatalAspect;
