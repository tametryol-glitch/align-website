/**
 * SOUL AGE CALCULATOR — Authoritative Calculation Service
 * =======================================================
 *
 * "Soul Age Calculator methodology created by Astro for AlignCosmic."
 *
 * Produces two independent lifetime counts for a chart:
 *
 *   • Total Universal Lifetimes — every incarnational experience the soul has
 *     completed anywhere, Earth and non-Earth alike.
 *   • Total Earth Lifetimes     — the subset of those lived through Earth
 *     incarnation.
 *
 * DESIGN RULES ENFORCED HERE
 * --------------------------
 *  1. DETERMINISTIC. Identical birth data + identical settings always produce
 *     an identical result. No randomness, no clocks, no locale-dependent maths.
 *  2. NOT A SECOND ASTROLOGY ENGINE. Sign/Duad/Compendium classification,
 *     Whole-Sign houses, rulerships and dispositor walks are all delegated to
 *     the existing `hiddenZodiacEngine` (which itself delegates rulerships to
 *     `duadCompendium`). This module contributes the Soul Age model only.
 *  3. INTEGER ARC-SECONDS INTERNALLY. Every position is carried as an integer
 *     number of arc-seconds (0 … 1,295,999). No float comparison ever decides
 *     a Duad, Compendium or orb boundary. Rounding happens at display only.
 *  4. CUSTOM RULERSHIP ONLY. Vesta→Virgo, Juno→Libra, Pluto→Scorpio,
 *     Uranus→Aquarius, Neptune→Pisces. Never the traditional substitutes.
 *  5. FLOOR, NOT ROUND, for the two lifetime totals — see LIFETIME_ROUNDING.
 *
 * Pure, side-effect free, no framework imports: runs unchanged under Vitest
 * (web) and ts-jest (mobile).
 */

import {
  ARCSEC_PER_DEGREE,
  ARCSEC_PER_SIGN,
  ARCSEC_PER_DUAD,
  ARCSEC_PER_COMPENDIUM,
  ARCSEC_PER_ZODIAC,
  SIGNS,
  RULERS,
  signIndexOf,
  getSignRuler,
  calculateDuad,
  calculateCompendium,
  calculateWholeSignHouse,
  arcSecondsToFormattedPosition,
  followDispositorChain,
  type NatalObjectPosition,
} from './hiddenZodiacEngine';

// ─────────────────────────────────────────────────────────────────────────────
// Versioning
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Stored alongside every persisted Soul Age result so the methodology can be
 * revised later WITHOUT silently re-interpreting historical results.
 */
export const SOUL_AGE_METHOD_VERSION = '1.0.0';

// ─────────────────────────────────────────────────────────────────────────────
// Immutable model constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * One complete Universal Incarnation Cycle = 12^5 = 248,832 incarnation
 * positions, from the five twelvefold dimensions: signs × houses × duads ×
 * compendiums × planetary carriers.
 */
export const UNIVERSAL_CYCLE_CAPACITY = 248_832;

/** 12 complete cycles — the Transcendental → Universal Soul threshold. */
export const UNIVERSAL_OCTAVE_CAPACITY = UNIVERSAL_CYCLE_CAPACITY * 12; // 2,985,984

/** Closure units required for a full closure ratio of 1.0. */
export const CLOSURE_UNITS_PER_OCTAVE = 12;

/**
 * The Draconic Ascendant carries 80% of the present-cycle position; the
 * supporting chronometers carry the remaining 20%.
 */
export const ASCENDANT_POSITION_WEIGHT = 0.8;
export const SUPPORTING_POSITION_WEIGHT = 0.2;

/**
 * Both lifetime totals TRUNCATE rather than round.
 *
 * The specification text says `round(...)`, but the authoritative reference
 * result (§20 fixture: 2,928,138 total universal lifetimes) is only reproducible
 * by truncation — `248832 × 0.76753333 = 190,986.8544`, which rounds to 190,987
 * (total 2,928,139) but floors to 190,986 (total 2,928,138). Confirmed against
 * the Earth total independently. Truncation is therefore canonical, and is
 * applied through this single helper so the policy is auditable in one place.
 */
export const LIFETIME_ROUNDING: 'floor' = 'floor';

function toLifetimeCount(exact: number): number {
  if (!Number.isFinite(exact) || exact <= 0) return 0;
  return Math.floor(exact);
}

// ── Orb thresholds, in integer arc-seconds ───────────────────────────────────

const ORB_1_DEG = 1 * ARCSEC_PER_DEGREE; // 3,600″
const ORB_2_DEG = 2 * ARCSEC_PER_DEGREE; // 7,200″
const ORB_1_5_DEG = 5_400; // 1°30′00″
const ORB_3_DEG = 3 * ARCSEC_PER_DEGREE; // 10,800″

const ASPECT_CONJUNCTION = 0;
const ASPECT_SEXTILE = 60 * ARCSEC_PER_DEGREE;
const ASPECT_SQUARE = 90 * ARCSEC_PER_DEGREE;
const ASPECT_TRINE = 120 * ARCSEC_PER_DEGREE;
const ASPECT_OPPOSITION = 180 * ARCSEC_PER_DEGREE;

// ─────────────────────────────────────────────────────────────────────────────
// Input / output types
// ─────────────────────────────────────────────────────────────────────────────

/** One body or angle as supplied by the chart engine. */
export interface SoulAgeBodyInput {
  /** Canonical name, e.g. 'Sun', 'Moon', 'Vesta', 'Ascendant', 'MC', 'North Node'. */
  name: string;
  /** Ecliptic longitude in decimal degrees, tropical geocentric, full precision. */
  longitude: number;
}

export interface SoulAgeChartInput {
  /** Display label for the chart (never embedded in shared images as birth data). */
  label?: string;
  bodies: SoulAgeBodyInput[];
  /** Natal Ascendant longitude (degrees). Required — the Draconic ASC drives everything. */
  ascendant: number;
  /** Natal Midheaven longitude (degrees). Required — IC is derived as MC+180. */
  midheaven: number;
  /**
   * Whether an accurate birth time was supplied. FALSE is a hard stop: the
   * calculator refuses rather than silently substituting noon.
   */
  birthTimeKnown: boolean;
  /** False when the user knew hour+minute but not seconds (00 assumed). */
  birthTimeSecondsKnown?: boolean;
}

/** A fully-classified point in either the natal or Draconic frame. */
export interface SoulAgePoint {
  name: string;
  /** Absolute integer arc-seconds, 0 … 1,295,999. Authoritative. */
  absArcSec: number;
  /** Decimal longitude, derived for interop/display only. */
  longitude: number;
  sign: string;
  signIndex: number;
  /** Integer arc-seconds within the sign, 0 … 107,999. */
  arcSecWithinSign: number;
  /** e.g. "23°54′00″" */
  positionLabel: string;
  duadSign: string;
  duadIndex: number;
  compendiumSign: string;
  compendiumIndex: number;
  /** Arc-seconds travelled inside the current compendium, 0 … 749. */
  arcSecWithinCompendium: number;
  /** Whole-Sign house within this point's own frame (natal or Draconic). */
  house: number | null;
}

export type SoulAgeFrame = Record<string, SoulAgePoint>;

export interface SoulAgeChronometer {
  /** Planet name, e.g. 'Pluto'. */
  planet: string;
  /** Every §7 role this planet holds; weights are combined, never duplicated. */
  roles: string[];
  /** Combined weight (e.g. Pluto as Draconic Pluto + natal IC ruler = 0.25). */
  weight: number;
  /** Position within its own sign, 0 … just under 1. */
  withinSignFraction: number;
  point: SoulAgePoint;
}

export interface ClosureUnit {
  category: ClosureCategoryId;
  /** Deduplication key — identical physical structures collapse to one entry. */
  key: string;
  units: number;
  label: string;
}

export type ClosureCategoryId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export interface ClosureCategoryResult {
  id: ClosureCategoryId;
  title: string;
  cap: number;
  /** Units earned before the category cap was applied. */
  rawUnits: number;
  /** Units contributed after the cap. */
  units: number;
  evidence: ClosureUnit[];
}

export interface ClosureResult {
  categories: ClosureCategoryResult[];
  /** Sum of capped category totals. */
  rawClosureUnits: number;
  /** min(rawClosureUnits, 12) */
  baseClosureUnits: number;
  /** baseClosureUnits / 12 */
  closureRatio: number;
  /** floor(max(raw − 12, 0) / 12) */
  additionalOctaves: number;
}

export interface EarthAnchoringCategory {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  title: string;
  weight: number;
  /** 0–100 */
  score: number;
  detail: string[];
}

export interface EarthAnchoringResult {
  categories: EarthAnchoringCategory[];
  /** 0–100, at least four decimal places retained. */
  score: number;
  /** Two-decimal display value. */
  displayScore: number;
}

export type SoulAgeName =
  | 'Infant Soul'
  | 'Baby Soul'
  | 'Young Soul'
  | 'Mature Soul'
  | 'Old Soul'
  | 'Transcendental Soul'
  | 'Universal Soul';

export type SoulAgeStage = 'Early' | 'Middle' | 'Late' | null;

export interface SoulAgeClassification {
  name: SoulAgeName;
  /** 'Late Transcendental Soul', or 'Universal Soul — Octave 3'. */
  label: string;
  stage: SoulAgeStage;
  lowerBoundary: number;
  /** null for Universal Soul, which has no fixed upper boundary. */
  upperBoundary: number | null;
  /** 0–1 progress through the current Soul Age; null for Universal Soul. */
  stageProgress: number | null;
  /** 1-based Universal Octave; null unless Universal Soul. */
  universalOctave: number | null;
  meaning: string;
  functions: string[];
}

export interface SoulAgeResult {
  methodVersion: string;

  // Headline numbers
  totalUniversalLifetimes: number;
  earthLifetimes: number;
  nonEarthLifetimes: number;
  /** 0 when totalUniversalLifetimes is 0 — never a division error. */
  earthPercentage: number;

  universalSoulAge: SoulAgeClassification;
  earthSoulAge: SoulAgeClassification;

  // Universal working
  candidateCompletedCycles: number;
  validatedCompletedCycles: number;
  currentCycleLifetimes: number;
  /** 0–1 progress through the present universal cycle. */
  currentCyclePosition: number;
  ascendantPosition: number;
  supportingPosition: number;
  universalMaturityCoefficient: number;

  // Earth working
  earthAnchoring: EarthAnchoringResult;
  earthFraction: number;
  earthCompendiumFraction: number;
  earthPrecisionModifier: number;

  closure: ClosureResult;
  chronometers: SoulAgeChronometer[];

  natal: SoulAgeFrame;
  draconic: SoulAgeFrame;

  /** Non-fatal advisories, e.g. the assumed-00-seconds notice. */
  notices: string[];
}

export class SoulAgeInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SoulAgeInputError';
  }
}

/** Shown verbatim when a chart has no accurate birth time. */
export const BIRTH_TIME_REQUIRED_MESSAGE =
  'An accurate birth time is required because the Soul Age Calculator uses the Draconic Ascendant, IC, MC and Whole Sign houses.';

/** Shown when the user knew hour and minute but not seconds. */
export const ASSUMED_SECONDS_MESSAGE =
  'Calculated using 00 birth-time seconds. Exact seconds may slightly refine the result.';

// ─────────────────────────────────────────────────────────────────────────────
// Arc-second helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Decimal longitude → absolute integer arc-seconds, normalised to [0, 360).
 * Rounds to the nearest whole arc-second — the honest precision of a double —
 * rather than discarding sub-degree information.
 */
export function longitudeToAbsArcSec(longitudeDeg: number): number {
  if (typeof longitudeDeg !== 'number' || !Number.isFinite(longitudeDeg)) {
    throw new SoulAgeInputError(`Longitude must be a finite number, got ${String(longitudeDeg)}`);
  }
  const norm = ((longitudeDeg % 360) + 360) % 360;
  let abs = Math.round(norm * ARCSEC_PER_DEGREE);
  if (abs >= ARCSEC_PER_ZODIAC) abs -= ARCSEC_PER_ZODIAC; // 359.99999° guard
  return abs;
}

/** Add an arc-second delta and wrap into [0, 1,296,000). */
function wrapArcSec(abs: number): number {
  return ((abs % ARCSEC_PER_ZODIAC) + ARCSEC_PER_ZODIAC) % ARCSEC_PER_ZODIAC;
}

/** Shortest angular separation between two absolute positions, 0 … 648,000″ (0–180°). */
export function separationArcSec(a: number, b: number): number {
  let d = Math.abs(a - b) % ARCSEC_PER_ZODIAC;
  if (d > ARCSEC_PER_ZODIAC / 2) d = ARCSEC_PER_ZODIAC - d;
  return d;
}

/** Orb (arc-seconds from exact) for a given aspect angle. */
export function orbTo(a: number, b: number, aspectArcSec: number): number {
  return Math.abs(separationArcSec(a, b) - aspectArcSec);
}

/** Format absolute arc-seconds as "23°54′00″ Pisces". */
export function formatPoint(absArcSec: number): string {
  const signIndex = Math.floor(absArcSec / ARCSEC_PER_SIGN) % 12;
  const within = absArcSec - signIndex * ARCSEC_PER_SIGN;
  return `${arcSecondsToFormattedPosition(within).text} ${SIGNS[signIndex]}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Point construction
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Classify one absolute position into sign / duad / compendium / house, using
 * the Hidden Zodiac engine's integer arc-second subdivision maths. `ascSign`
 * must be the Ascendant sign OF THE SAME FRAME (natal ASC for natal points,
 * Draconic ASC for Draconic points) — mixing frames would misreport houses.
 */
export function buildPoint(name: string, absArcSec: number, ascSign: string | null): SoulAgePoint {
  const abs = wrapArcSec(absArcSec);
  const signIndex = Math.floor(abs / ARCSEC_PER_SIGN) % 12;
  const sign = SIGNS[signIndex];
  const arcSecWithinSign = abs - signIndex * ARCSEC_PER_SIGN;

  const duad = calculateDuad(signIndex, arcSecWithinSign);
  const compendium = calculateCompendium(duad.signIndex, duad.startArcSeconds, arcSecWithinSign);

  return {
    name,
    absArcSec: abs,
    longitude: abs / ARCSEC_PER_DEGREE,
    sign,
    signIndex,
    arcSecWithinSign,
    positionLabel: `${arcSecondsToFormattedPosition(arcSecWithinSign).text} ${sign}`,
    duadSign: duad.sign,
    duadIndex: duad.index,
    compendiumSign: compendium.sign,
    compendiumIndex: compendium.index,
    arcSecWithinCompendium: arcSecWithinSign - compendium.startArcSeconds,
    house: ascSign ? calculateWholeSignHouse(sign, ascSign) : null,
  };
}

/**
 * Canonical alias resolution — the chart engine's naming varies by source.
 *
 * NODE ORDER IS DELIBERATE. §2 and §3 require the TRUE North Node, so every
 * true-node spelling is tried before the generic "North Node". Align's chart API
 * currently publishes the MEAN node under the name "North Node"
 * (PLANET_IDS["North Node"] = 10 = SE_MEAN_NODE), which differs from the true
 * node by up to ~1.8° — easily enough to rotate a placement into a different
 * duad, compendium or Whole-Sign house. When only the mean node is available the
 * engine still calculates, but says so in `notices` rather than passing it off
 * as the true node.
 */
const TRUE_NODE_ALIASES = ['True Node', 'True North Node', 'TrueNode'];

const BODY_ALIASES: Record<string, string[]> = {
  Ascendant: ['Ascendant', 'ASC', 'Asc'],
  MC: ['MC', 'Midheaven'],
  'North Node': [...TRUE_NODE_ALIASES, 'North Node', 'Rahu', 'NorthNode'],
};

/** Shown when a chart supplies only the mean node. */
export const MEAN_NODE_FALLBACK_MESSAGE =
  'Calculated from the Mean North Node because a True North Node was not supplied. ' +
  'The two differ by up to 1.8°, which can shift the Draconic chart by one duad or compendium.';

function findLongitude(bodies: SoulAgeBodyInput[], name: string): number | null {
  const aliases = BODY_ALIASES[name] ?? [name];
  for (const alias of aliases) {
    const hit = bodies.find((b) => b.name === alias);
    if (hit && Number.isFinite(hit.longitude)) return hit.longitude;
  }
  return null;
}

/**
 * The twelve carriers of the Align rulership system. Ruler lookups resolve to
 * these names, so a chart missing one of them simply cannot supply that role
 * (the engine renormalises rather than inventing a position).
 */
export const CARRIER_BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Vesta',
  'Juno', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
] as const;

/**
 * Build both frames.
 *
 * NATAL frame: every supplied body, plus the derived Earth (Sun+180),
 * IC (MC+180), Descendant (ASC+180) and South Node (North Node+180).
 * Houses are Whole Sign from the natal Ascendant sign.
 *
 * DRACONIC frame: every natal point rotated so the natal True North Node sits
 * at exactly 0°00′00″ Aries —
 *     draconic = (natal − northNode + 360) mod 360
 * — then Whole Sign houses RE-DERIVED from the Draconic Ascendant's sign, per
 * §3. Because the rotation is rigid, the Draconic Earth computed as
 * (Draconic Sun + 180) is identical to the rotated natal Earth; both routes are
 * asserted equal in the test suite.
 */
export function buildFrames(input: SoulAgeChartInput): {
  natal: SoulAgeFrame;
  draconic: SoulAgeFrame;
  /** True when only a Mean North Node was available — surfaced as a notice. */
  usedMeanNode: boolean;
} {
  if (!input.birthTimeKnown) {
    throw new SoulAgeInputError(BIRTH_TIME_REQUIRED_MESSAGE);
  }
  if (!Array.isArray(input.bodies) || input.bodies.length === 0) {
    throw new SoulAgeInputError('Soul Age requires a calculated chart with planetary positions.');
  }

  const nodeLon = findLongitude(input.bodies, 'North Node');
  if (nodeLon == null) {
    throw new SoulAgeInputError(
      'Soul Age requires the True North Node — the Draconic chart is defined by rotating it to 0° Aries.',
    );
  }
  if (!Number.isFinite(input.ascendant) || !Number.isFinite(input.midheaven)) {
    throw new SoulAgeInputError('Soul Age requires an accurate Ascendant and Midheaven.');
  }

  const sunLon = findLongitude(input.bodies, 'Sun');
  if (sunLon == null) {
    throw new SoulAgeInputError('Soul Age requires the Sun — the Earth point is derived from it.');
  }

  // ── Assemble raw absolute positions in the natal frame ────────────────────
  const raw = new Map<string, number>();
  for (const body of input.bodies) {
    if (!Number.isFinite(body.longitude)) continue;
    raw.set(body.name, longitudeToAbsArcSec(body.longitude));
  }

  const ascAbs = longitudeToAbsArcSec(input.ascendant);
  const mcAbs = longitudeToAbsArcSec(input.midheaven);
  const nodeAbs = longitudeToAbsArcSec(nodeLon);
  const sunAbs = longitudeToAbsArcSec(sunLon);

  raw.set('Ascendant', ascAbs);
  raw.set('MC', mcAbs);
  raw.set('North Node', nodeAbs);
  raw.set('Descendant', wrapArcSec(ascAbs + ASPECT_OPPOSITION));
  raw.set('IC', wrapArcSec(mcAbs + ASPECT_OPPOSITION));
  raw.set('South Node', wrapArcSec(nodeAbs + ASPECT_OPPOSITION));
  // The Earth point is the terrestrial anchor: always exactly opposite the Sun.
  raw.set('Earth', wrapArcSec(sunAbs + ASPECT_OPPOSITION));

  const natalAscSign = SIGNS[Math.floor(ascAbs / ARCSEC_PER_SIGN) % 12];

  const natal: SoulAgeFrame = {};
  raw.forEach((abs, name) => {
    natal[name] = buildPoint(name, abs, natalAscSign);
  });

  // ── Rotate into the Draconic frame ────────────────────────────────────────
  const draconicAscAbs = wrapArcSec(ascAbs - nodeAbs);
  const draconicAscSign = SIGNS[Math.floor(draconicAscAbs / ARCSEC_PER_SIGN) % 12];

  const draconic: SoulAgeFrame = {};
  raw.forEach((abs, name) => {
    draconic[name] = buildPoint(name, wrapArcSec(abs - nodeAbs), draconicAscSign);
  });

  const usedMeanNode = !input.bodies.some((b) => TRUE_NODE_ALIASES.indexOf(b.name) >= 0);

  return { natal, draconic, usedMeanNode };
}

/** One row of the chart API's `positions` array (only the fields we consume). */
export interface ChartApiPosition {
  name: string;
  longitude: number;
}

/**
 * Adapt a raw chart-API response into Soul Age input.
 *
 * Call this with `response.positions` STRAIGHT FROM THE API — do not route the
 * chart through a display mapper first. The API returns longitudes at 4 decimal
 * places (0.36″), but the mobile `natalCalc.mapAPIResponse` rounds them to 2
 * (36″, roughly 5% of a 750″ compendium), which is enough to move a placement
 * across a Compendium boundary. Both platforms therefore feed this adapter the
 * unrounded values.
 */
export function buildSoulAgeInputFromPositions(
  positions: ChartApiPosition[],
  options: {
    label?: string;
    birthTimeKnown: boolean;
    birthTimeSecondsKnown?: boolean;
    /**
     * The chart response's `true_node` field (SE_TRUE_NODE). Pass it whenever
     * the API supplies it — the Draconic rotation is defined against the TRUE
     * node, while the "North Node" row in `positions` is the MEAN node. When
     * this is absent the engine falls back to the mean node and adds
     * MEAN_NODE_FALLBACK_MESSAGE to the result's notices rather than pretending.
     */
    trueNodeLongitude?: number | null;
  },
): SoulAgeChartInput {
  const bodies: SoulAgeBodyInput[] = (positions ?? [])
    .filter((p) => p && typeof p.name === 'string' && Number.isFinite(p.longitude))
    .map((p) => ({ name: p.name, longitude: p.longitude }));

  if (typeof options.trueNodeLongitude === 'number' && Number.isFinite(options.trueNodeLongitude)) {
    bodies.push({ name: 'True Node', longitude: options.trueNodeLongitude });
  }

  const ascendant = findLongitude(bodies, 'Ascendant');
  const midheaven = findLongitude(bodies, 'MC');

  if (ascendant == null || midheaven == null) {
    throw new SoulAgeInputError('Soul Age requires an accurate Ascendant and Midheaven.');
  }

  return {
    label: options.label,
    bodies,
    ascendant,
    midheaven,
    birthTimeKnown: options.birthTimeKnown,
    birthTimeSecondsKnown: options.birthTimeSecondsKnown,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Ruler resolution
// ─────────────────────────────────────────────────────────────────────────────

/** Ruler of the sign a given point occupies, under the Align rulership system. */
function rulerOfPointSign(frame: SoulAgeFrame, pointName: string): string | null {
  const p = frame[pointName];
  if (!p) return null;
  return getSignRuler(p.sign);
}

/** Ruler of a Whole-Sign house counted from the frame's own Ascendant. */
function rulerOfHouse(frame: SoulAgeFrame, house: number): string | null {
  const asc = frame.Ascendant;
  if (!asc) return null;
  const signIndex = (asc.signIndex + (house - 1)) % 12;
  return getSignRuler(SIGNS[signIndex]);
}

// ─────────────────────────────────────────────────────────────────────────────
// §7 — Universal Chronometers
// ─────────────────────────────────────────────────────────────────────────────

interface ChronometerRoleSpec {
  role: string;
  weight: number;
  /** Resolves the planet name whose DRACONIC position carries this role. */
  resolve: (natal: SoulAgeFrame) => string | null;
}

/**
 * The six §7 roles. Every one reads its planet from the DRACONIC chart, but the
 * ruler roles identify WHICH planet from the NATAL chart's signs.
 *
 * When one planet holds several roles its weights are COMBINED into a single
 * chronometer — it is never entered twice. (Fixture example: Pluto as Draconic
 * Pluto 15% + natal IC ruler 10% = one 25% chronometer.)
 */
const CHRONOMETER_ROLES: ChronometerRoleSpec[] = [
  {
    role: 'Draconic ruler of the natal South Node',
    weight: 0.30,
    resolve: (natal) => rulerOfPointSign(natal, 'South Node'),
  },
  { role: 'Draconic Saturn', weight: 0.20, resolve: () => 'Saturn' },
  { role: 'Draconic Moon', weight: 0.15, resolve: () => 'Moon' },
  { role: 'Draconic Pluto', weight: 0.15, resolve: () => 'Pluto' },
  {
    role: 'Draconic ruler of the natal IC',
    weight: 0.10,
    resolve: (natal) => rulerOfPointSign(natal, 'IC'),
  },
  {
    role: 'Draconic ruler of the natal 12th house',
    weight: 0.10,
    resolve: (natal) => rulerOfHouse(natal, 12),
  },
];

/**
 * Build the unique chronometer set with combined role weights.
 *
 * If a role's planet is absent from the chart its weight is redistributed
 * proportionally across the chronometers that ARE present, so the weights
 * always total 100% (§7) without fabricating a position.
 */
export function calculateUniversalChronometers(
  natal: SoulAgeFrame,
  draconic: SoulAgeFrame,
): SoulAgeChronometer[] {
  const byPlanet = new Map<string, { roles: string[]; weight: number }>();

  for (const spec of CHRONOMETER_ROLES) {
    const planet = spec.resolve(natal);
    if (!planet || !draconic[planet]) continue;
    const entry = byPlanet.get(planet) ?? { roles: [], weight: 0 };
    entry.roles.push(spec.role);
    entry.weight += spec.weight;
    byPlanet.set(planet, entry);
  }

  let totalWeight = 0;
  byPlanet.forEach((entry) => { totalWeight += entry.weight; });
  if (totalWeight <= 0) return [];

  const chronometers: SoulAgeChronometer[] = [];
  byPlanet.forEach((entry, planet) => {
    const point = draconic[planet];
    chronometers.push({
      planet,
      roles: entry.roles,
      weight: entry.weight / totalWeight, // renormalised to exactly 1.0
      withinSignFraction: point.arcSecWithinSign / ARCSEC_PER_SIGN,
      point,
    });
  });

  // Deterministic ordering: heaviest first, then alphabetical.
  chronometers.sort((a, b) => b.weight - a.weight || a.planet.localeCompare(b.planet));
  return chronometers;
}

/** Weighted average of the unique chronometers' within-sign fractions (§7). */
export function calculateSupportingPosition(chronometers: SoulAgeChronometer[]): number {
  if (chronometers.length === 0) return 0;
  return chronometers.reduce((sum, c) => sum + c.withinSignFraction * c.weight, 0);
}

/**
 * The eight Core Universal Chronometers used by the §8-E / §8-F repetition
 * tests. Returns frame point names, deduplicated by physical identity.
 */
function coreChronometerPointNames(natal: SoulAgeFrame): string[] {
  const names = [
    'Ascendant',
    rulerOfPointSign(natal, 'South Node'),
    'Saturn',
    'Moon',
    'Pluto',
    rulerOfPointSign(natal, 'IC'),
    rulerOfHouse(natal, 12),
    'Earth',
  ].filter((n): n is string => typeof n === 'string' && n.length > 0);
  return names.filter((name, i) => names.indexOf(name) === i);
}

// ─────────────────────────────────────────────────────────────────────────────
// §8 — Universal Closure Engine
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Accumulates closure evidence while enforcing the §8 independence rule:
 * "Count only independent structures. Do not count the same aspect or axis
 * repeatedly under different labels."
 *
 * Deduplication is by PHYSICAL IDENTITY, not by label — the key is built from
 * the two absolute arc-second positions plus the aspect. So a contact found
 * once as "Draconic Pluto → natal Pluto" and again as "Draconic Pluto → natal
 * IC ruler" (when the IC ruler IS Pluto) collapses to a single unit. Categories
 * are evaluated in fixed order A→H, so the outcome is deterministic.
 */
class ClosureLedger {
  private readonly claimed = new Set<string>();
  private readonly byCategory = new Map<ClosureCategoryId, ClosureUnit[]>();

  add(category: ClosureCategoryId, key: string, units: number, label: string): boolean {
    if (units <= 0) return false;
    if (this.claimed.has(key)) return false;
    this.claimed.add(key);
    const list = this.byCategory.get(category) ?? [];
    list.push({ category, key, units, label });
    this.byCategory.set(category, list);
    return true;
  }

  evidence(category: ClosureCategoryId): ClosureUnit[] {
    return this.byCategory.get(category) ?? [];
  }
}

/**
 * §8 scoring ladder, shared by categories A, B and C:
 *   conjunction or opposition within 1°  → 2 units
 *   conjunction or opposition 1°–2°      → 1 unit
 *   square within 1°                     → 1 unit
 * Returns null when nothing qualifies.
 */
function scoreClosureContact(
  a: SoulAgePoint,
  b: SoulAgePoint,
): { units: number; aspect: string; orbArcSec: number } | null {
  const conj = orbTo(a.absArcSec, b.absArcSec, ASPECT_CONJUNCTION);
  const opp = orbTo(a.absArcSec, b.absArcSec, ASPECT_OPPOSITION);
  const hard = Math.min(conj, opp);
  const aspect = conj <= opp ? 'conjunction' : 'opposition';

  if (hard <= ORB_1_DEG) return { units: 2, aspect, orbArcSec: hard };
  if (hard <= ORB_2_DEG) return { units: 1, aspect, orbArcSec: hard };

  const square = orbTo(a.absArcSec, b.absArcSec, ASPECT_SQUARE);
  if (square <= ORB_1_DEG) return { units: 1, aspect: 'square', orbArcSec: square };

  return null;
}

function contactKey(a: SoulAgePoint, b: SoulAgePoint, aspect: string): string {
  const lo = Math.min(a.absArcSec, b.absArcSec);
  const hi = Math.max(a.absArcSec, b.absArcSec);
  return `contact:${lo}:${hi}:${aspect}`;
}

function orbLabel(arcSec: number): string {
  const deg = Math.floor(arcSec / ARCSEC_PER_DEGREE);
  const min = Math.round((arcSec - deg * ARCSEC_PER_DEGREE) / 60);
  return `${deg}°${String(min).padStart(2, '0')}′`;
}

/** Resolve a list of frame point names to points, skipping any that are absent. */
function pointsFor(frame: SoulAgeFrame, names: (string | null)[]): SoulAgePoint[] {
  const out: SoulAgePoint[] = [];
  const seen = new Set<number>();
  for (const name of names) {
    if (!name) continue;
    const p = frame[name];
    if (!p) continue;
    if (seen.has(p.absArcSec)) continue; // same physical point under another label
    seen.add(p.absArcSec);
    out.push(p);
  }
  return out;
}

const CLOSURE_CATEGORY_META: Record<ClosureCategoryId, { title: string; cap: number }> = {
  A: { title: 'Draconic Ascendant closures', cap: 3 },
  B: { title: 'Saturn–Pluto completion closures', cap: 3 },
  C: { title: 'Nodal-ruler closures', cap: 3 },
  D: { title: 'Sun–Earth angular completion', cap: 6 },
  E: { title: 'Duad repetition closures', cap: 3 },
  F: { title: 'Compendium repetition closures', cap: 3 },
  G: { title: 'Dispositor completion closures', cap: 3 },
  H: { title: 'Role-amplification closures', cap: 2 },
};

/**
 * NOTE ON §8-D (documented deviation risk, not a bug)
 * ---------------------------------------------------
 * The Draconic chart is a RIGID rotation of the natal chart, so every angular
 * separation is preserved exactly. A natal Sun–Earth/angle axis lock therefore
 * ALWAYS reproduces in the Draconic chart, and the "master repetition" bonus
 * always fires with it. Category D is consequently binary: 0 or 6 units, never
 * 2 or 4. This is implemented exactly as specified — but it does sit in tension
 * with §8's own instruction not to award octaves from "mathematically automatic
 * contacts". Flip AXIS_LOCK_COUNTS_BOTH_FRAMES to false to score the axis once
 * (2 units) instead.
 */
export const AXIS_LOCK_COUNTS_BOTH_FRAMES = true;

function detectAxisLock(frame: SoulAgeFrame): { locked: boolean; label: string } {
  const sun = frame.Sun;
  const earth = frame.Earth;
  if (!sun || !earth) return { locked: false, label: '' };

  const angles: [string, string][] = [
    ['IC', 'MC'],
    ['MC', 'IC'],
    ['Ascendant', 'Descendant'],
    ['Descendant', 'Ascendant'],
  ];

  for (const [sunAngle, earthAngle] of angles) {
    const sa = frame[sunAngle];
    const ea = frame[earthAngle];
    if (!sa || !ea) continue;
    const sunOrb = orbTo(sun.absArcSec, sa.absArcSec, ASPECT_CONJUNCTION);
    const earthOrb = orbTo(earth.absArcSec, ea.absArcSec, ASPECT_CONJUNCTION);
    if (sunOrb <= ORB_1_DEG && earthOrb <= ORB_1_DEG) {
      return {
        locked: true,
        label: `Sun conjunct ${sunAngle} (orb ${orbLabel(sunOrb)}) with Earth conjunct ${earthAngle}`,
      };
    }
  }
  return { locked: false, label: '' };
}

/**
 * Count, for a given subdivision layer, the largest group of unique
 * chronometers sharing the same duad (or compendium) sign.
 */
function largestRepetitionGroup(
  points: SoulAgePoint[],
  layer: 'duadSign' | 'compendiumSign',
): { size: number; sign: string | null; members: string[] } {
  const groups = new Map<string, string[]>();
  for (const p of points) {
    const key = p[layer];
    const list = groups.get(key) ?? [];
    list.push(p.name);
    groups.set(key, list);
  }
  let best: { size: number; sign: string | null; members: string[] } = { size: 0, sign: null, members: [] };
  // Sorted iteration keeps ties deterministic.
  const signs: string[] = [];
  groups.forEach((_members, sign) => { signs.push(sign); });
  signs.sort().forEach((sign) => {
    const members = groups.get(sign)!;
    if (members.length > best.size) best = { size: members.length, sign, members };
  });
  return best;
}

export function calculateClosureUnits(
  natal: SoulAgeFrame,
  draconic: SoulAgeFrame,
  chronometers: SoulAgeChronometer[],
): ClosureResult {
  const ledger = new ClosureLedger();

  const snRuler = rulerOfPointSign(natal, 'South Node');
  const icRuler = rulerOfPointSign(natal, 'IC');
  const twelfthRuler = rulerOfHouse(natal, 12);
  const eighthRuler = rulerOfHouse(natal, 8);

  // ── A. Draconic Ascendant closures (cap 3) ───────────────────────────────
  const dAsc = draconic.Ascendant;
  if (dAsc) {
    const targets = pointsFor(natal, ['Saturn', 'Pluto', snRuler, 'IC', 'MC', twelfthRuler, eighthRuler]);
    for (const target of targets) {
      const hit = scoreClosureContact(dAsc, target);
      if (!hit) continue;
      ledger.add(
        'A',
        contactKey(dAsc, target, hit.aspect),
        hit.units,
        `Draconic Ascendant ${hit.aspect} natal ${target.name} (orb ${orbLabel(hit.orbArcSec)})`,
      );
    }
  }

  // ── B. Saturn–Pluto completion closures (cap 3) ──────────────────────────
  for (const dName of ['Saturn', 'Pluto']) {
    const d = draconic[dName];
    if (!d) continue;
    const targets = pointsFor(natal, ['Saturn', 'Pluto', icRuler, snRuler]);
    for (const target of targets) {
      const hit = scoreClosureContact(d, target);
      if (!hit) continue;
      ledger.add(
        'B',
        contactKey(d, target, hit.aspect),
        hit.units,
        `Draconic ${dName} ${hit.aspect} natal ${target.name} (orb ${orbLabel(hit.orbArcSec)})`,
      );
    }
  }

  // ── C. Nodal-ruler closures (cap 3) ──────────────────────────────────────
  const dSnRuler = snRuler ? draconic[snRuler] : undefined;
  if (dSnRuler) {
    const draconicTargets = pointsFor(draconic, ['Ascendant', 'Saturn', 'Pluto', 'Earth']);
    const natalTargets = pointsFor(natal, ['Ascendant', 'Saturn', 'Pluto', 'IC', 'MC', twelfthRuler]);
    const all = [
      ...draconicTargets.map((p) => ({ p, frame: 'Draconic' })),
      ...natalTargets.map((p) => ({ p, frame: 'natal' })),
    ];
    for (const { p, frame } of all) {
      if (p.absArcSec === dSnRuler.absArcSec) continue; // a point cannot close on itself
      const hit = scoreClosureContact(dSnRuler, p);
      if (!hit) continue;
      ledger.add(
        'C',
        contactKey(dSnRuler, p, hit.aspect),
        hit.units,
        `Draconic ${snRuler} (South Node ruler) ${hit.aspect} ${frame} ${p.name} (orb ${orbLabel(hit.orbArcSec)})`,
      );
    }
  }

  // ── D. Sun–Earth angular completion (cap 6) ──────────────────────────────
  const natalLock = detectAxisLock(natal);
  const draconicLock = detectAxisLock(draconic);
  if (natalLock.locked) {
    ledger.add('D', 'axis:natal', 2, `Natal axis lock — ${natalLock.label}`);
  }
  if (draconicLock.locked && AXIS_LOCK_COUNTS_BOTH_FRAMES) {
    ledger.add('D', 'axis:draconic', 2, `Draconic axis lock — ${draconicLock.label}`);
  }
  if (natalLock.locked && draconicLock.locked && AXIS_LOCK_COUNTS_BOTH_FRAMES) {
    ledger.add('D', 'axis:repetition', 2, 'Master repetition — the same Sun–Earth axis lock in both charts');
  }

  // ── E / F. Duad and Compendium repetition closures (cap 3 each) ──────────
  const coreNames = coreChronometerPointNames(natal);
  const dCore = pointsFor(draconic, coreNames);
  const nCore = pointsFor(natal, coreNames);

  const dDuad = largestRepetitionGroup(dCore, 'duadSign');
  const nDuad = largestRepetitionGroup(nCore, 'duadSign');
  if (dDuad.size >= 4) {
    ledger.add('E', 'duad:4', 2, `${dDuad.size} Draconic chronometers share the ${dDuad.sign} duad (${dDuad.members.join(', ')})`);
  } else if (dDuad.size >= 3) {
    ledger.add('E', 'duad:3', 1, `${dDuad.size} Draconic chronometers share the ${dDuad.sign} duad (${dDuad.members.join(', ')})`);
  }
  if (dDuad.size >= 3 && nDuad.size >= 3 && dDuad.sign === nDuad.sign) {
    ledger.add('E', 'duad:repeat', 1, `The ${dDuad.sign} duad grouping repeats between the natal and Draconic charts`);
  }

  const dComp = largestRepetitionGroup(dCore, 'compendiumSign');
  const nComp = largestRepetitionGroup(nCore, 'compendiumSign');
  if (dComp.size >= 3) {
    ledger.add('F', 'comp:3', 2, `${dComp.size} Draconic chronometers share the ${dComp.sign} compendium (${dComp.members.join(', ')})`);
  } else if (dComp.size >= 2) {
    ledger.add('F', 'comp:2', 1, `${dComp.size} Draconic chronometers share the ${dComp.sign} compendium (${dComp.members.join(', ')})`);
  }
  if (dComp.size >= 2 && nComp.size >= 2 && dComp.sign === nComp.sign) {
    ledger.add('F', 'comp:repeat', 1, `The ${dComp.sign} compendium grouping repeats between the natal and Draconic charts`);
  }

  // ── G. Dispositor completion closures (cap 3) ────────────────────────────
  const circuits = findClosedDispositorCircuits(draconic);
  if (circuits.length >= 2) {
    ledger.add('G', 'dispositor:2', 2, `${circuits.length} independent closed dispositor circuits (${circuits.map((c) => c.join(' → ')).join('; ')})`);
  } else if (circuits.length === 1) {
    ledger.add('G', 'dispositor:1', 1, `Closed dispositor circuit: ${circuits[0].join(' → ')}`);
  }
  if (circuits.length > 0) {
    const key = new Set<string>([
      ...(dAsc ? [getSignRuler(dAsc.sign) ?? ''] : []),
      snRuler ?? '',
      'Saturn',
      'Pluto',
      'Earth',
    ]);
    const anchored = circuits.some((c) => c.some((planet) => key.has(planet)));
    if (anchored) {
      ledger.add('G', 'dispositor:anchored', 1, 'A closed circuit contains a core Universal Chronometer');
    }
  }

  // ── H. Role-amplification closures (cap 2) ───────────────────────────────
  const multiRole = chronometers.filter((c) => c.roles.length >= 2);
  if (multiRole.length >= 2) {
    ledger.add('H', 'roles:2', 2, `${multiRole.map((c) => `${c.planet} (${c.roles.length} roles)`).join(', ')}`);
  } else if (multiRole.length === 1) {
    ledger.add('H', 'roles:1', 1, `${multiRole[0].planet} holds ${multiRole[0].roles.length} Universal Chronometer roles`);
  }

  // ── Totals ───────────────────────────────────────────────────────────────
  const categories: ClosureCategoryResult[] = (Object.keys(CLOSURE_CATEGORY_META) as ClosureCategoryId[]).map((id) => {
    const meta = CLOSURE_CATEGORY_META[id];
    const evidence = ledger.evidence(id);
    const rawUnits = evidence.reduce((sum, e) => sum + e.units, 0);
    return { id, title: meta.title, cap: meta.cap, rawUnits, units: Math.min(rawUnits, meta.cap), evidence };
  });

  const rawClosureUnits = categories.reduce((sum, c) => sum + c.units, 0);
  const baseClosureUnits = Math.min(rawClosureUnits, CLOSURE_UNITS_PER_OCTAVE);
  const closureRatio = baseClosureUnits / CLOSURE_UNITS_PER_OCTAVE;
  const additionalOctaves = Math.floor(Math.max(rawClosureUnits - CLOSURE_UNITS_PER_OCTAVE, 0) / CLOSURE_UNITS_PER_OCTAVE);

  return { categories, rawClosureUnits, baseClosureUnits, closureRatio, additionalOctaves };
}

/**
 * Find closed dispositor circuits under the custom rulership system: planet A
 * sits in a sign ruled by B, B in a sign ruled by C, C in a sign ruled by A.
 *
 * Walks from every carrier body using the shared `followDispositorChain` (which
 * has built-in loop detection and a hard depth bound), then canonicalises each
 * detected loop so the same circuit found from different entry points is
 * reported once.
 */
export function findClosedDispositorCircuits(frame: SoulAgeFrame): string[][] {
  const natalByName: Record<string, NatalObjectPosition> = {};
  for (const name of CARRIER_BODIES) {
    const p = frame[name];
    if (p) natalByName[name] = { name, sign: p.sign, longitudeDeg: p.longitude };
  }

  const found = new Map<string, string[]>();

  for (const start of CARRIER_BODIES) {
    const p = frame[start];
    if (!p) continue;

    // Walk the sign chain manually so we can recover the exact loop members.
    // followDispositorChain is used first as the authoritative loop DETECTOR;
    // the walk below only reconstructs which planets form it.
    const detected = followDispositorChain(p.sign, null, natalByName, 12);
    if (!detected.closedCircuit) continue;

    const visited: string[] = [];
    let sign: string | null = p.sign;
    const seen = new Map<string, number>();
    while (sign && !seen.has(sign)) {
      seen.set(sign, visited.length);
      const ruler: string | null = getSignRuler(sign);
      if (!ruler) break;
      visited.push(ruler);
      sign = frame[ruler]?.sign ?? null;
    }
    if (!sign || !seen.has(sign)) continue;

    const loop = visited.slice(seen.get(sign)!);
    if (loop.length === 0) continue;

    // Canonical form: rotate so the alphabetically-first planet leads.
    const minIndex = loop.reduce((best, planet, i) => (planet < loop[best] ? i : best), 0);
    const canonical = [...loop.slice(minIndex), ...loop.slice(0, minIndex)];
    found.set(canonical.join('>'), canonical);
  }

  const circuits: string[][] = [];
  found.forEach((loop) => { circuits.push(loop); });
  return circuits.sort((a, b) => a.join('>').localeCompare(b.join('>')));
}

// ─────────────────────────────────────────────────────────────────────────────
// §9 — Universal Lifetime Position
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Completed cycles the present Draconic Ascendant sign makes AVAILABLE.
 * Aries = 0 … Pisces = 11. These are only possibilities until the Closure
 * Engine validates them — a Pisces Draconic Ascendant with no closure evidence
 * validates zero cycles.
 */
export function calculateCandidateCompletedCycles(draconicAscSign: string): number {
  const index = signIndexOf(draconicAscSign);
  if (index < 0) return 0;
  return index; // signNumber − 1
}

export interface UniversalLifetimeResult {
  candidateCompletedCycles: number;
  validatedCompletedCycles: number;
  ascendantPosition: number;
  supportingPosition: number;
  rawCurrentCyclePosition: number;
  universalMaturityCoefficient: number;
  currentCycleLifetimes: number;
  totalUniversalLifetimes: number;
}

export function calculateUniversalLifetimes(
  draconic: SoulAgeFrame,
  closure: ClosureResult,
  supportingPosition: number,
): UniversalLifetimeResult {
  const dAsc = draconic.Ascendant;
  const candidateCompletedCycles = dAsc ? calculateCandidateCompletedCycles(dAsc.sign) : 0;

  const validatedCompletedCycles =
    Math.floor(candidateCompletedCycles * closure.closureRatio) +
    closure.additionalOctaves * CLOSURE_UNITS_PER_OCTAVE;

  const ascendantPosition = dAsc ? dAsc.arcSecWithinSign / ARCSEC_PER_SIGN : 0;

  const rawCurrentCyclePosition =
    ascendantPosition * ASCENDANT_POSITION_WEIGHT + supportingPosition * SUPPORTING_POSITION_WEIGHT;

  // The Universal Maturity Coefficient stops a late zodiacal degree from
  // manufacturing an enormous number in a chart with little closure evidence.
  const universalMaturityCoefficient = Math.pow(closure.closureRatio, 5);

  const currentCycleLifetimes = toLifetimeCount(
    UNIVERSAL_CYCLE_CAPACITY * rawCurrentCyclePosition * universalMaturityCoefficient,
  );

  const totalUniversalLifetimes = Math.max(
    0,
    validatedCompletedCycles * UNIVERSAL_CYCLE_CAPACITY + currentCycleLifetimes,
  );

  return {
    candidateCompletedCycles,
    validatedCompletedCycles,
    ascendantPosition,
    supportingPosition,
    rawCurrentCyclePosition,
    universalMaturityCoefficient,
    currentCycleLifetimes,
    totalUniversalLifetimes,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// §10 — Draconic Earth Anchoring Score
// ─────────────────────────────────────────────────────────────────────────────

/** Sign / duad / compendium anchoring strength (§10-A). */
const EARTH_SIGN_SCORES: Record<string, number> = {
  Taurus: 100, Virgo: 100, Capricorn: 100,
  Cancer: 80, Scorpio: 80, Pisces: 80,
  Aries: 65, Leo: 65, Sagittarius: 65,
  Gemini: 55, Libra: 55, Aquarius: 55,
};

/** Whole-Sign house anchoring strength (§10-A), reused by §10-D. */
const EARTH_HOUSE_SCORES: Record<number, number> = {
  2: 100, 4: 100, 6: 100, 10: 100,
  1: 85, 8: 85,
  7: 75,
  3: 65, 5: 65, 11: 65,
  9: 55,
  12: 45,
};

export function calculateEarthPlacementStrength(earth: SoulAgePoint): { score: number; detail: string[] } {
  const signScore = EARTH_SIGN_SCORES[earth.sign] ?? 0;
  const houseScore = earth.house != null ? EARTH_HOUSE_SCORES[earth.house] ?? 0 : 0;
  const duadScore = EARTH_SIGN_SCORES[earth.duadSign] ?? 0;
  const compScore = EARTH_SIGN_SCORES[earth.compendiumSign] ?? 0;

  const score = signScore * 0.20 + houseScore * 0.35 + duadScore * 0.20 + compScore * 0.25;

  return {
    score,
    detail: [
      `Sign — ${earth.sign}: ${signScore} × 20%`,
      `Whole Sign house — ${earth.house ?? '—'}: ${houseScore} × 35%`,
      `Duad — ${earth.duadSign}: ${duadScore} × 20%`,
      `Compendium — ${earth.compendiumSign}: ${compScore} × 25%`,
    ],
  };
}

export function calculateEarthAscendantConnection(
  earth: SoulAgePoint,
  dAsc: SoulAgePoint | undefined,
): { score: number; detail: string[] } {
  if (!dAsc) return { score: 25, detail: ['No Draconic Ascendant available'] };

  const conj = orbTo(earth.absArcSec, dAsc.absArcSec, ASPECT_CONJUNCTION);
  const opp = orbTo(earth.absArcSec, dAsc.absArcSec, ASPECT_OPPOSITION);
  const hard = Math.min(conj, opp);
  const square = orbTo(earth.absArcSec, dAsc.absArcSec, ASPECT_SQUARE);
  const trine = orbTo(earth.absArcSec, dAsc.absArcSec, ASPECT_TRINE);
  const sextile = orbTo(earth.absArcSec, dAsc.absArcSec, ASPECT_SEXTILE);
  const soft = Math.min(trine, sextile);

  const sameDuad = earth.duadSign === dAsc.duadSign;
  const sameComp = earth.compendiumSign === dAsc.compendiumSign;

  let score = 25;
  let label = 'No meaningful connection';
  let hasMajorAspect = false;

  if (hard <= ORB_1_DEG) {
    score = 100; label = `${conj <= opp ? 'Conjunction' : 'Opposition'} within 1° (orb ${orbLabel(hard)})`; hasMajorAspect = true;
  } else if (hard <= ORB_2_DEG) {
    score = 92; label = `${conj <= opp ? 'Conjunction' : 'Opposition'} 1°–2° (orb ${orbLabel(hard)})`; hasMajorAspect = true;
  } else if (square <= ORB_1_5_DEG) {
    score = 90; label = `Square within 1°30′ (orb ${orbLabel(square)})`; hasMajorAspect = true;
  } else if (square <= ORB_3_DEG) {
    score = 82; label = `Square 1°30′–3° (orb ${orbLabel(square)})`; hasMajorAspect = true;
  } else if (soft <= ORB_1_5_DEG) {
    score = 78; label = `${trine <= sextile ? 'Trine' : 'Sextile'} within 1°30′ (orb ${orbLabel(soft)})`; hasMajorAspect = true;
  } else if (soft <= ORB_3_DEG) {
    score = 70; label = `${trine <= sextile ? 'Trine' : 'Sextile'} 1°30′–3° (orb ${orbLabel(soft)})`; hasMajorAspect = true;
  } else if (sameComp) {
    score = 65; label = `Shared ${earth.compendiumSign} compendium, no qualifying major aspect`;
  } else if (sameDuad) {
    score = 60; label = `Shared ${earth.duadSign} duad, no qualifying major aspect`;
  }

  const detail = [label];
  // "Add no more than 5 points when both a major aspect and matching duad or
  // compendium are present." Capped at 100.
  if (hasMajorAspect && (sameDuad || sameComp)) {
    score = Math.min(100, score + 5);
    detail.push(`+5 — major aspect reinforced by a shared ${sameComp ? 'compendium' : 'duad'}`);
  }

  return { score: Math.min(100, score), detail };
}

/**
 * §10-C Earth-Memory connections.
 *
 * Each unique target pair contributes its strongest qualifying MAJOR aspect
 * PLUS any duad and compendium resonance — "score each independent contact",
 * bounded by "do not count the same pair twice" (enforced by physical-identity
 * deduplication, so Pluto counted once as Pluto is not counted again as the
 * natal 4th-house ruler). Category total is capped at 100.
 */
export function calculateEarthMemoryConnections(
  earth: SoulAgePoint,
  natal: SoulAgeFrame,
  draconic: SoulAgeFrame,
): { score: number; detail: string[] } {
  const snRuler = rulerOfPointSign(natal, 'South Node');
  const icRulerDraconic = rulerOfPointSign(draconic, 'IC');

  const targets: { point: SoulAgePoint; frame: string }[] = [];
  const seen = new Set<number>([earth.absArcSec]);

  const push = (frame: SoulAgeFrame, frameName: string, names: (string | null)[]) => {
    for (const p of pointsFor(frame, names)) {
      if (seen.has(p.absArcSec)) continue;
      seen.add(p.absArcSec);
      targets.push({ point: p, frame: frameName });
    }
  };

  push(draconic, 'Draconic', ['Moon', 'Saturn', 'Pluto', 'IC', icRulerDraconic, snRuler]);
  push(natal, 'natal', [
    'Moon', 'Saturn', 'Pluto', 'IC', 'MC', snRuler,
    rulerOfHouse(natal, 4), rulerOfHouse(natal, 8), rulerOfHouse(natal, 12), 'Earth',
  ]);

  let total = 0;
  const detail: string[] = [];

  for (const { point, frame } of targets) {
    let pairScore = 0;
    const parts: string[] = [];

    const conj = orbTo(earth.absArcSec, point.absArcSec, ASPECT_CONJUNCTION);
    const opp = orbTo(earth.absArcSec, point.absArcSec, ASPECT_OPPOSITION);
    const hard = Math.min(conj, opp);
    const square = orbTo(earth.absArcSec, point.absArcSec, ASPECT_SQUARE);
    const trine = orbTo(earth.absArcSec, point.absArcSec, ASPECT_TRINE);
    const sextile = orbTo(earth.absArcSec, point.absArcSec, ASPECT_SEXTILE);
    const soft = Math.min(trine, sextile);

    if (hard <= ORB_1_DEG) {
      pairScore += 20; parts.push(`${conj <= opp ? 'conjunction' : 'opposition'} within 1° (orb ${orbLabel(hard)}) +20`);
    } else if (hard <= ORB_2_DEG) {
      pairScore += 14; parts.push(`${conj <= opp ? 'conjunction' : 'opposition'} 1°–2° (orb ${orbLabel(hard)}) +14`);
    } else if (square <= ORB_1_5_DEG) {
      pairScore += 12; parts.push(`square within 1°30′ (orb ${orbLabel(square)}) +12`);
    } else if (soft <= ORB_2_DEG) {
      pairScore += 8; parts.push(`${trine <= sextile ? 'trine' : 'sextile'} within 2° (orb ${orbLabel(soft)}) +8`);
    }

    if (earth.duadSign === point.duadSign) {
      pairScore += 4; parts.push(`shared ${point.duadSign} duad +4`);
    }
    if (earth.compendiumSign === point.compendiumSign) {
      pairScore += 6; parts.push(`shared ${point.compendiumSign} compendium +6`);
    }

    if (pairScore > 0) {
      total += pairScore;
      detail.push(`${frame} ${point.name}: ${parts.join(', ')}`);
    }
  }

  return { score: Math.min(100, total), detail };
}

/**
 * §10-D Terrestrial house activation — the average Whole-Sign house score of
 * the unique Draconic factors. A planet that is also a house ruler is counted
 * ONCE (physical-identity deduplication), never duplicated.
 */
export function calculateTerrestrialHouseActivation(
  natal: SoulAgeFrame,
  draconic: SoulAgeFrame,
): { score: number; detail: string[] } {
  const snRuler = rulerOfPointSign(natal, 'South Node');
  const factors = pointsFor(draconic, [
    'Earth', 'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
    'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', snRuler,
  ]);

  const scored = factors.filter((p) => p.house != null);
  if (scored.length === 0) return { score: 0, detail: ['No Draconic factors available'] };

  const detail = scored.map((p) => `${p.name} — house ${p.house}: ${EARTH_HOUSE_SCORES[p.house!] ?? 0}`);
  const sum = scored.reduce((acc, p) => acc + (EARTH_HOUSE_SCORES[p.house!] ?? 0), 0);

  return { score: sum / scored.length, detail };
}

/** §10-E Earth repetition seals, capped at 100. */
export function calculateEarthRepetitionSeals(
  natal: SoulAgeFrame,
  draconic: SoulAgeFrame,
): { score: number; detail: string[] } {
  let total = 0;
  const detail: string[] = [];
  const award = (points: number, label: string) => { total += points; detail.push(`${label} +${points}`); };

  const angleNames = ['Ascendant', 'Descendant', 'MC', 'IC'];

  const conjunctsAngle = (frame: SoulAgeFrame, pointName: string): string | null => {
    const p = frame[pointName];
    if (!p) return null;
    for (const angle of angleNames) {
      const a = frame[angle];
      if (!a) continue;
      if (orbTo(p.absArcSec, a.absArcSec, ASPECT_CONJUNCTION) <= ORB_1_DEG) return angle;
    }
    return null;
  };

  const nEarthAngle = conjunctsAngle(natal, 'Earth');
  if (nEarthAngle) award(20, `Natal Earth conjunct the ${nEarthAngle} within 1°`);

  const dEarthAngle = conjunctsAngle(draconic, 'Earth');
  if (dEarthAngle) award(20, `Draconic Earth conjunct the ${dEarthAngle} within 1°`);

  const nLock = detectAxisLock(natal);
  if (nLock.locked) award(20, `Natal Sun–Earth axis locked to an angle axis — ${nLock.label}`);

  const dLock = detectAxisLock(draconic);
  if (dLock.locked) award(20, `Draconic Sun–Earth axis locked to an angle axis — ${dLock.label}`);

  if (nLock.locked && dLock.locked) {
    award(20, 'The same angular Earth pattern repeats in the natal and Draconic charts');
  }

  const nEarth = natal.Earth;
  const dEarth = draconic.Earth;
  if (nEarth && dEarth) {
    if (nEarth.duadSign === dEarth.duadSign) {
      award(10, `Earth repeats the ${nEarth.duadSign} duad between the natal and Draconic charts`);
    }
    if (nEarth.compendiumSign === dEarth.compendiumSign) {
      award(10, `Earth repeats the ${nEarth.compendiumSign} compendium between the natal and Draconic charts`);
    }
  }

  // Closed patterns: Earth in mutual hard contact with a pair of memory bodies.
  const closedWith = (aName: string, bName: string): boolean => {
    const e = draconic.Earth; const a = draconic[aName]; const b = draconic[bName];
    if (!e || !a || !b) return false;
    const tight = (x: SoulAgePoint, y: SoulAgePoint) =>
      Math.min(
        orbTo(x.absArcSec, y.absArcSec, ASPECT_CONJUNCTION),
        orbTo(x.absArcSec, y.absArcSec, ASPECT_OPPOSITION),
        orbTo(x.absArcSec, y.absArcSec, ASPECT_SQUARE),
        orbTo(x.absArcSec, y.absArcSec, ASPECT_TRINE),
      ) <= ORB_2_DEG;
    return tight(e, a) && tight(e, b) && tight(a, b);
  };

  if (closedWith('Moon', 'Saturn')) award(10, 'Draconic Earth forms a closed pattern with the Moon and Saturn');

  const icRuler = rulerOfPointSign(draconic, 'IC');
  if (icRuler && closedWith('Pluto', icRuler)) {
    award(10, `Draconic Earth forms a closed pattern with Pluto and the IC ruler (${icRuler})`);
  }

  return { score: Math.min(100, total), detail };
}

export function calculateEarthAnchoringScore(
  natal: SoulAgeFrame,
  draconic: SoulAgeFrame,
): EarthAnchoringResult {
  const earth = draconic.Earth;
  if (!earth) {
    return {
      categories: [],
      score: 0,
      displayScore: 0,
    };
  }

  const placement = calculateEarthPlacementStrength(earth);
  const ascendant = calculateEarthAscendantConnection(earth, draconic.Ascendant);
  const memory = calculateEarthMemoryConnections(earth, natal, draconic);
  const houses = calculateTerrestrialHouseActivation(natal, draconic);
  const seals = calculateEarthRepetitionSeals(natal, draconic);

  const categories: EarthAnchoringCategory[] = [
    { id: 'A', title: 'Earth placement strength', weight: 0.30, score: placement.score, detail: placement.detail },
    { id: 'B', title: 'Earth–Ascendant connection', weight: 0.20, score: ascendant.score, detail: ascendant.detail },
    { id: 'C', title: 'Earth-memory connections', weight: 0.20, score: memory.score, detail: memory.detail },
    { id: 'D', title: 'Terrestrial house activation', weight: 0.15, score: houses.score, detail: houses.detail },
    { id: 'E', title: 'Earth repetition seals', weight: 0.15, score: seals.score, detail: seals.detail },
  ];

  // Full internal precision retained; only `displayScore` is rounded.
  const score = categories.reduce((sum, c) => sum + c.score * c.weight, 0);

  return { categories, score, displayScore: Math.round(score * 100) / 100 };
}

// ─────────────────────────────────────────────────────────────────────────────
// §11 — Earth-Lifetime Equation
// ─────────────────────────────────────────────────────────────────────────────

export interface EarthLifetimeResult {
  earthFraction: number;
  earthCompendiumFraction: number;
  earthPrecisionModifier: number;
  earthLifetimes: number;
  nonEarthLifetimes: number;
  earthPercentage: number;
}

export function calculateEarthLifetimes(
  totalUniversalLifetimes: number,
  earthAnchoringScore: number,
  draconicEarth: SoulAgePoint | undefined,
): EarthLifetimeResult {
  // The fifth power corresponds to the five terrestrial categories. It is what
  // lets a soul with millions of universal lifetimes still be on its first
  // Earth incarnation.
  const earthFraction = Math.pow(Math.max(0, earthAnchoringScore) / 100, 5);

  const earthCompendiumFraction = draconicEarth
    ? draconicEarth.arcSecWithinCompendium / ARCSEC_PER_COMPENDIUM
    : 0;

  // 0.975 … just under 1.025
  const earthPrecisionModifier = 0.975 + earthCompendiumFraction * 0.05;

  let earthLifetimes = toLifetimeCount(totalUniversalLifetimes * earthFraction * earthPrecisionModifier);
  earthLifetimes = Math.max(0, Math.min(earthLifetimes, totalUniversalLifetimes));

  const nonEarthLifetimes = totalUniversalLifetimes - earthLifetimes;

  // Guarded division — a zero total displays as 0%, never NaN.
  const earthPercentage = totalUniversalLifetimes === 0
    ? 0
    : (earthLifetimes / totalUniversalLifetimes) * 100;

  return {
    earthFraction,
    earthCompendiumFraction,
    earthPrecisionModifier,
    earthLifetimes,
    nonEarthLifetimes,
    earthPercentage,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// §12 / §13 — The Seven Soul Ages
// ─────────────────────────────────────────────────────────────────────────────

interface SoulAgeBand {
  name: SoulAgeName;
  lower: number;
  upper: number | null;
  meaning: string;
  functions: string[];
}

/**
 * Soul Age represents ACCUMULATED EXPERIENCE — not human worth, intelligence,
 * kindness, spiritual perfection or social status. No band is superior to
 * another, and none of the copy below implies otherwise.
 */
export const SOUL_AGE_BANDS: SoulAgeBand[] = [
  {
    name: 'Infant Soul',
    lower: 0,
    upper: 12,
    meaning:
      'The Infant Soul is learning how to enter manifestation and function within physical existence. Its lessons concern embodiment, instinct, safety, survival, basic cause and effect, physical limits and separation from the larger spiritual field.',
    functions: [
      'Learns physical survival',
      'Develops instinctive awareness',
      'Experiences embodiment as unfamiliar',
      'Builds the earliest relationship with matter',
      'Operates through direct needs and immediate consequences',
    ],
  },
  {
    name: 'Baby Soul',
    lower: 13,
    upper: 144,
    meaning:
      'The Baby Soul is learning structure, belonging, rules, tradition, authority and social order. It seeks stability through clearly defined systems because it is still developing confidence within complex physical and social environments.',
    functions: [
      'Learns family and community rules',
      'Relies on established authority',
      'Develops loyalty and group identity',
      'Creates moral and social structure',
      'Prefers certainty over ambiguity',
    ],
  },
  {
    name: 'Young Soul',
    lower: 145,
    upper: 1_728,
    meaning:
      'The Young Soul develops individual identity, ambition and power within the material world. It learns to build, compete, achieve, lead, acquire resources and establish independence.',
    functions: [
      'Develops individual will',
      'Pursues achievement and status',
      'Learns power and personal responsibility',
      'Builds material influence',
      'Tests independence and control',
    ],
  },
  {
    name: 'Mature Soul',
    lower: 1_729,
    upper: 20_736,
    meaning:
      'The Mature Soul turns from external achievement toward emotional complexity, intimacy, psychological awareness, empathy and relationship karma. It learns that several truths can exist simultaneously.',
    functions: [
      'Develops emotional accountability',
      'Learns through relationships',
      'Encounters psychological contradictions',
      'Builds empathy',
      'Integrates personal success with emotional depth',
    ],
  },
  {
    name: 'Old Soul',
    lower: 20_737,
    upper: 248_832,
    meaning:
      'The Old Soul has accumulated extensive experience and begins completing its first major universal incarnation wheel. It is concerned with integration, karmic completion, inner authority, simplification and teaching from lived experience.',
    functions: [
      'Recognizes repeating karmic patterns',
      'Releases dependence on status',
      'Values inner truth',
      'Integrates accumulated knowledge',
      'Completes unresolved personal cycles',
      'Teaches through experience',
    ],
  },
  {
    name: 'Transcendental Soul',
    lower: 248_833,
    upper: 2_985_984,
    meaning:
      'The Transcendental Soul has completed at least one major universal incarnation wheel. It no longer incarnates primarily to develop an individual personality. Its work increasingly affects communities, ancestral systems, cultures and collective consciousness.',
    functions: [
      'Works with collective transformation',
      'Creates systems that outlive the personality',
      'Bridges physical and spiritual realities',
      'Transmits accumulated knowledge',
      'Heals ancestral and planetary patterns',
      'Guides groups rather than only individuals',
      'Still possesses personal karma, but personal development is no longer its only purpose',
    ],
  },
  {
    name: 'Universal Soul',
    lower: 2_985_985,
    upper: null,
    meaning:
      'The Universal Soul has moved beyond twelve complete major universal cycles. It incarnates primarily through deliberate service, universal principles, planetary work, interdimensional integration and collective evolutionary responsibility.',
    functions: [
      'Operates through universal rather than purely personal principles',
      'Serves collective or planetary development',
      'Integrates knowledge from many worlds or civilizations',
      'Establishes teachings, systems or structures',
      'Acts as a catalyst for large evolutionary changes',
      'Returns through deliberate purpose rather than only karmic compulsion',
      'Can still experience ordinary human limitations and personal struggles',
    ],
  },
];

/** §13 — Early / Middle / Late from progress through the current band. */
export function stageLabelFor(progress: number): SoulAgeStage {
  if (progress < 1 / 3) return 'Early';
  if (progress < 2 / 3) return 'Middle';
  return 'Late';
}

export function classifySoulAge(lifetimeCount: number): SoulAgeClassification {
  const count = Math.max(0, Math.floor(lifetimeCount));
  const band = SOUL_AGE_BANDS.find((b) => count >= b.lower && (b.upper == null || count <= b.upper))
    ?? SOUL_AGE_BANDS[SOUL_AGE_BANDS.length - 1];

  // Universal Soul has no fixed upper boundary — it reports an octave instead
  // of an Early/Middle/Late stage.
  if (band.upper == null) {
    const universalOctave = Math.floor((count - band.lower) / UNIVERSAL_OCTAVE_CAPACITY) + 1;
    return {
      name: band.name,
      label: universalOctave > 1 ? `${band.name} — Octave ${universalOctave}` : band.name,
      stage: null,
      lowerBoundary: band.lower,
      upperBoundary: null,
      stageProgress: null,
      universalOctave,
      meaning: band.meaning,
      functions: band.functions,
    };
  }

  const span = band.upper - band.lower;
  const stageProgress = span <= 0 ? 0 : (count - band.lower) / span;
  const stage = stageLabelFor(stageProgress);

  return {
    name: band.name,
    label: `${stage} ${band.name}`,
    stage,
    lowerBoundary: band.lower,
    upperBoundary: band.upper,
    stageProgress,
    universalOctave: null,
    meaning: band.meaning,
    functions: band.functions,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Orchestrator
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run the complete Soul Age calculation for one chart.
 *
 * Throws SoulAgeInputError (never returns a fabricated result) when the birth
 * time is unknown, the North Node is missing, or the chart has no positions.
 */
export function calculateSoulAge(input: SoulAgeChartInput): SoulAgeResult {
  const { natal, draconic, usedMeanNode } = buildFrames(input);

  const notices: string[] = [];
  if (input.birthTimeSecondsKnown === false) notices.push(ASSUMED_SECONDS_MESSAGE);
  if (usedMeanNode) notices.push(MEAN_NODE_FALLBACK_MESSAGE);

  const chronometers = calculateUniversalChronometers(natal, draconic);
  const supportingPosition = calculateSupportingPosition(chronometers);

  const closure = calculateClosureUnits(natal, draconic, chronometers);

  const universal = calculateUniversalLifetimes(draconic, closure, supportingPosition);

  const earthAnchoring = calculateEarthAnchoringScore(natal, draconic);

  const earth = calculateEarthLifetimes(
    universal.totalUniversalLifetimes,
    earthAnchoring.score,
    draconic.Earth,
  );

  return {
    methodVersion: SOUL_AGE_METHOD_VERSION,

    totalUniversalLifetimes: universal.totalUniversalLifetimes,
    earthLifetimes: earth.earthLifetimes,
    nonEarthLifetimes: earth.nonEarthLifetimes,
    earthPercentage: earth.earthPercentage,

    universalSoulAge: classifySoulAge(universal.totalUniversalLifetimes),
    earthSoulAge: classifySoulAge(earth.earthLifetimes),

    candidateCompletedCycles: universal.candidateCompletedCycles,
    validatedCompletedCycles: universal.validatedCompletedCycles,
    currentCycleLifetimes: universal.currentCycleLifetimes,
    currentCyclePosition: universal.rawCurrentCyclePosition,
    ascendantPosition: universal.ascendantPosition,
    supportingPosition: universal.supportingPosition,
    universalMaturityCoefficient: universal.universalMaturityCoefficient,

    earthAnchoring,
    earthFraction: earth.earthFraction,
    earthCompendiumFraction: earth.earthCompendiumFraction,
    earthPrecisionModifier: earth.earthPrecisionModifier,

    closure,
    chronometers,

    natal,
    draconic,

    notices,
  };
}

export { SIGNS, RULERS };
