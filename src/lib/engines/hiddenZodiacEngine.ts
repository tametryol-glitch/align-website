/**
 * The Hidden Zodiac — Authoritative Calculation Service (Phase 1)
 * ================================================================
 *
 * This is the SINGLE source of truth for every Hidden Zodiac calculation:
 * the manual calculator, saved natal charts, the educational library, the
 * visual wheel, the AI interpretation payload, cached readings, and the test
 * suite all call into this module. The UI must NEVER reproduce these formulas
 * independently.
 *
 * Design rules enforced here (per the Hidden Zodiac specification):
 *   • Seconds are first-class. They are NEVER dropped, rounded away, or treated
 *     as optional internally. Boundary classification uses INTEGER arc-second
 *     arithmetic exclusively — no floating-point `<`/`>` comparisons decide
 *     which Duad or Compendium a placement belongs to.
 *   • No fabricated values. Invalid input produces a structured validation
 *     failure and a `console.warn` development warning, never an invented
 *     result. Unknown seconds are an explicit, clearly-labelled mode.
 *   • One rulership system. Sign→ruler is imported from the canonical
 *     `duadCompendium` module (Vesta→Virgo, Juno→Libra, Pluto→Scorpio,
 *     Uranus→Aquarius, Neptune→Pisces). It is not redefined here.
 *   • One subdivision method. The Duad (12 × 2°30′00″) and Compendium
 *     (12 × 0°12′30″ inside each Duad, starting from the Duad sign) reproduce
 *     EXACTLY the existing `duadCompendium` / `derivedAstroMath` sequence — the
 *     integer-arc-second implementation is a precision hardening of the same
 *     model, cross-validated against both in the test suite, not a new method.
 *
 * Pure, deterministic, side-effect free (apart from explicit dev `console.warn`
 * on invalid input). No React-Native imports, so it runs unchanged under Jest.
 */

import { SIGNS as CANONICAL_SIGNS, RULERS as CANONICAL_RULERS } from './duadCompendium';

// ── Versioning ───────────────────────────────────────────────────────────────

/**
 * Calculation version. Persisted with every stored result so the subdivision
 * rules can evolve later WITHOUT corrupting or silently re-interpreting older
 * saved records. Maps to the `hidden_zodiac_calculation_version` column.
 */
export const HIDDEN_ZODIAC_CALCULATION_VERSION = 'hidden-zodiac-v1';

// ── Immutable arc-second geometry ────────────────────────────────────────────

export const ARCSEC_PER_DEGREE = 3600;
export const ARCSEC_PER_MINUTE = 60;
/** A zodiac sign spans 30° = 1,800′ = 108,000″. */
export const ARCSEC_PER_SIGN = 108_000;
/** A Duad spans 2°30′00″ = 150′ = 9,000″. 12 Duads per sign. */
export const ARCSEC_PER_DUAD = 9_000;
/** A Compendium spans 0°12′30″ = 12′30″ = 750″. 12 Compendiums per Duad. */
export const ARCSEC_PER_COMPENDIUM = 750;
/** The whole zodiac spans 360° = 1,296,000″. */
export const ARCSEC_PER_ZODIAC = 1_296_000;

export const DUADS_PER_SIGN = 12;
export const COMPENDIUMS_PER_DUAD = 12;

/** Default boundary-sensitivity threshold (arc-seconds). Configurable. */
export const DEFAULT_BOUNDARY_THRESHOLD_ARCSEC = 30;

// ── Signs & rulers (re-exported from the canonical source) ───────────────────

/** Zodiac signs, Aries = index 0 … Pisces = index 11. */
export const SIGNS: readonly string[] = CANONICAL_SIGNS;

/** Canonical Align rulership map (single source of truth — do not redefine). */
export const RULERS: Readonly<Record<string, string>> = CANONICAL_RULERS;

export type ZodiacSign = string;

/** Sign index 0–11, or -1 if the name is not a recognised sign. */
export function signIndexOf(sign: string): number {
  return SIGNS.indexOf(sign);
}

/** Sign name for an index, wrapping modulo 12 (negative-safe). */
export function signFromIndex(index: number): string {
  return SIGNS[((index % 12) + 12) % 12];
}

/**
 * The ruling planet/point of a sign under Align's custom rulership.
 * Returns null for an unrecognised sign rather than inventing a ruler.
 */
export function getSignRuler(sign: string): string | null {
  return RULERS[sign] ?? null;
}

// ── Validation ───────────────────────────────────────────────────────────────

export interface RawPosition {
  sign: string;
  degree: number;
  minute: number;
  second: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function isInt(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v);
}

/**
 * Validate a degree/minute/second-within-sign position.
 *   degree 0–29, minute 0–59, second 0–59, sign must be recognised.
 * Rejects 30°, 60′, 60″, negatives, non-integers, empty/unknown sign.
 * Emits a development `console.warn` so an uncertain calculation surfaces in
 * logs rather than producing an invented result downstream.
 */
export function validatePosition(input: Partial<RawPosition>): ValidationResult {
  const errors: string[] = [];
  const { sign, degree, minute, second } = input;

  if (typeof sign !== 'string' || sign.length === 0) {
    errors.push('sign is required');
  } else if (signIndexOf(sign) < 0) {
    errors.push(`unknown sign "${sign}"`);
  }

  if (!isInt(degree)) errors.push('degree must be an integer');
  else if (degree < 0 || degree > 29) errors.push('degree must be 0–29');

  if (!isInt(minute)) errors.push('minute must be an integer');
  else if (minute < 0 || minute > 59) errors.push('minute must be 0–59');

  if (!isInt(second)) errors.push('second must be an integer');
  else if (second < 0 || second > 59) errors.push('second must be 0–59');

  if (errors.length > 0) {
    // Dev warning — never silently coerce an invalid placement into a result.
    // eslint-disable-next-line no-console
    console.warn(
      `[HiddenZodiac] Invalid position rejected (${JSON.stringify(input)}): ${errors.join('; ')}`,
    );
  }

  return { valid: errors.length === 0, errors };
}

// ── Arc-second conversions ───────────────────────────────────────────────────

/**
 * Convert a validated d/m/s-within-sign into integer arc-seconds within the sign.
 *   total = degree·3600 + minute·60 + second
 * Throws on invalid input — callers must validate first, or use the seconds
 * fallback helper. Throwing (rather than clamping) prevents a silent wrong value.
 */
export function positionToArcSeconds(degree: number, minute: number, second: number): number {
  const v = validatePosition({ sign: SIGNS[0], degree, minute, second });
  if (!v.valid) {
    throw new RangeError(`[HiddenZodiac] positionToArcSeconds: ${v.errors.join('; ')}`);
  }
  return degree * ARCSEC_PER_DEGREE + minute * ARCSEC_PER_MINUTE + second;
}

export interface FormattedPosition {
  degree: number;
  minute: number;
  second: number;
  /** e.g. "27°16′42″" */
  text: string;
}

/** Split integer arc-seconds-within-sign back into exact d/m/s (no rounding loss). */
export function arcSecondsToFormattedPosition(arcSecondsWithinSign: number): FormattedPosition {
  if (!isInt(arcSecondsWithinSign) || arcSecondsWithinSign < 0 || arcSecondsWithinSign >= ARCSEC_PER_SIGN) {
    throw new RangeError(
      `[HiddenZodiac] arcSecondsToFormattedPosition: expected integer 0–${ARCSEC_PER_SIGN - 1}, got ${String(arcSecondsWithinSign)}`,
    );
  }
  const degree = Math.floor(arcSecondsWithinSign / ARCSEC_PER_DEGREE);
  const rem = arcSecondsWithinSign - degree * ARCSEC_PER_DEGREE;
  const minute = Math.floor(rem / ARCSEC_PER_MINUTE);
  const second = rem - minute * ARCSEC_PER_MINUTE;
  const text = `${degree}°${String(minute).padStart(2, '0')}′${String(second).padStart(2, '0')}″`;
  return { degree, minute, second, text };
}

/** Format arc-seconds as a compact "D°MM′SS″" span label (allows whole-sign spans). */
export function formatArcSecondsSpan(arcSeconds: number): string {
  const total = Math.round(arcSeconds);
  const degree = Math.floor(total / ARCSEC_PER_DEGREE);
  const rem = total - degree * ARCSEC_PER_DEGREE;
  const minute = Math.floor(rem / ARCSEC_PER_MINUTE);
  const second = rem - minute * ARCSEC_PER_MINUTE;
  return `${degree}°${String(minute).padStart(2, '0')}′${String(second).padStart(2, '0')}″`;
}

/**
 * Absolute ecliptic position from a sign index and arc-seconds within the sign.
 * Returns both the integer absolute arc-seconds and the decimal longitude
 * (degrees) for interop with the existing longitude-based engines. The integer
 * value is authoritative; the decimal is derived for display/interop only.
 */
export function calculateAbsoluteLongitude(
  signIndex: number,
  arcSecondsWithinSign: number,
): { absoluteArcSeconds: number; longitudeDeg: number } {
  if (!isInt(signIndex) || signIndex < 0 || signIndex > 11) {
    throw new RangeError(`[HiddenZodiac] calculateAbsoluteLongitude: signIndex must be 0–11, got ${String(signIndex)}`);
  }
  const absoluteArcSeconds = ((signIndex * ARCSEC_PER_SIGN + arcSecondsWithinSign) % ARCSEC_PER_ZODIAC + ARCSEC_PER_ZODIAC) % ARCSEC_PER_ZODIAC;
  return { absoluteArcSeconds, longitudeDeg: absoluteArcSeconds / ARCSEC_PER_DEGREE };
}

/**
 * Convert a decimal ecliptic longitude (e.g. from the Swiss-Ephemeris chart
 * engine) into the engine's integer arc-second representation. Seconds are
 * preserved to the nearest whole arc-second — the honest precision of a
 * double longitude — never discarded. Use this for saved-chart placements.
 */
export function longitudeToArcSeconds(longitudeDeg: number): {
  signIndex: number;
  sign: string;
  arcSecondsWithinSign: number;
} {
  if (typeof longitudeDeg !== 'number' || !Number.isFinite(longitudeDeg)) {
    throw new TypeError(`[HiddenZodiac] longitudeToArcSeconds: longitude must be finite, got ${String(longitudeDeg)}`);
  }
  const norm = ((longitudeDeg % 360) + 360) % 360;
  let absArcSec = Math.round(norm * ARCSEC_PER_DEGREE);
  if (absArcSec >= ARCSEC_PER_ZODIAC) absArcSec -= ARCSEC_PER_ZODIAC; // 359.9999..° rounding guard
  const signIndex = Math.min(11, Math.floor(absArcSec / ARCSEC_PER_SIGN));
  const arcSecondsWithinSign = absArcSec - signIndex * ARCSEC_PER_SIGN;
  return { signIndex, sign: SIGNS[signIndex], arcSecondsWithinSign };
}

// ── Duad ─────────────────────────────────────────────────────────────────────

export interface DuadResult {
  index: number; // 0–11
  sign: string;
  signIndex: number;
  ruler: string | null;
  /** Inclusive arc-second range within the sign that this Duad owns. */
  startArcSeconds: number;
  endArcSeconds: number; // = start + 8999
  startLabel: string; // e.g. "2°30′00″"
  endLabel: string; // inclusive end, e.g. "4°59′59″"
}

/**
 * Classify a placement's Duad from its integer arc-seconds within the sign.
 *
 * Boundary rule: a Duad OWNS its exact starting second and ends one second
 * before the next Duad begins. A position exactly on the next boundary belongs
 * to the new Duad. This is pure integer division — no float comparison.
 *
 *   index = floor(totalArcSecondsWithinSign / 9000)   (0–11)
 *   duadSignIndex = (mainSignIndex + index) mod 12
 */
export function calculateDuad(mainSignIndex: number, arcSecondsWithinSign: number): DuadResult {
  if (!isInt(mainSignIndex) || mainSignIndex < 0 || mainSignIndex > 11) {
    throw new RangeError(`[HiddenZodiac] calculateDuad: mainSignIndex must be 0–11, got ${String(mainSignIndex)}`);
  }
  if (!isInt(arcSecondsWithinSign) || arcSecondsWithinSign < 0 || arcSecondsWithinSign >= ARCSEC_PER_SIGN) {
    throw new RangeError(`[HiddenZodiac] calculateDuad: arcSeconds must be 0–${ARCSEC_PER_SIGN - 1}, got ${String(arcSecondsWithinSign)}`);
  }
  const index = Math.min(DUADS_PER_SIGN - 1, Math.floor(arcSecondsWithinSign / ARCSEC_PER_DUAD));
  const signIndex = (mainSignIndex + index) % 12;
  const startArcSeconds = index * ARCSEC_PER_DUAD;
  const endArcSeconds = startArcSeconds + ARCSEC_PER_DUAD - 1; // inclusive last second
  return {
    index,
    sign: SIGNS[signIndex],
    signIndex,
    ruler: getSignRuler(SIGNS[signIndex]),
    startArcSeconds,
    endArcSeconds,
    startLabel: formatArcSecondsSpan(startArcSeconds),
    endLabel: formatArcSecondsSpan(endArcSeconds),
  };
}

// ── Compendium ───────────────────────────────────────────────────────────────

export interface CompendiumResult {
  index: number; // 0–11 within the Duad
  sign: string;
  signIndex: number;
  ruler: string | null;
  /** Inclusive arc-second range WITHIN THE SIGN that this Compendium owns. */
  startArcSeconds: number;
  endArcSeconds: number; // = start + 749
  startLabel: string;
  endLabel: string;
}

/**
 * Classify the Compendium inside the Duad.
 *
 * Each 2°30′00″ Duad is divided into 12 equal 0°12′30″ (750″) Compendiums whose
 * sequence begins with the Duad sign and proceeds in zodiacal order. This is the
 * "duad of the duad" model the existing derivedAstroMath engine uses, expressed
 * in exact integer arc-seconds.
 *
 *   arcSecondsWithinDuad = totalArcSecondsWithinSign mod 9000
 *   index = floor(arcSecondsWithinDuad / 750)   (0–11)
 *   compendiumSignIndex = (duadSignIndex + index) mod 12
 */
export function calculateCompendium(
  duadSignIndex: number,
  duadStartArcSeconds: number,
  arcSecondsWithinSign: number,
): CompendiumResult {
  const arcSecondsWithinDuad = arcSecondsWithinSign - duadStartArcSeconds;
  if (arcSecondsWithinDuad < 0 || arcSecondsWithinDuad >= ARCSEC_PER_DUAD) {
    throw new RangeError(
      `[HiddenZodiac] calculateCompendium: arcSecondsWithinDuad out of range (${arcSecondsWithinDuad})`,
    );
  }
  const index = Math.min(COMPENDIUMS_PER_DUAD - 1, Math.floor(arcSecondsWithinDuad / ARCSEC_PER_COMPENDIUM));
  const signIndex = (duadSignIndex + index) % 12;
  const startArcSeconds = duadStartArcSeconds + index * ARCSEC_PER_COMPENDIUM;
  const endArcSeconds = startArcSeconds + ARCSEC_PER_COMPENDIUM - 1; // inclusive
  return {
    index,
    sign: SIGNS[signIndex],
    signIndex,
    ruler: getSignRuler(SIGNS[signIndex]),
    startArcSeconds,
    endArcSeconds,
    startLabel: formatArcSecondsSpan(startArcSeconds),
    endLabel: formatArcSecondsSpan(endArcSeconds),
  };
}

// ── Whole Sign houses ────────────────────────────────────────────────────────

/**
 * Whole-Sign house (1–12) of a sign relative to the Ascendant sign.
 * The Ascendant sign is the 1st house; each following sign is the next house.
 *   house = ((targetIndex − ascIndex + 12) mod 12) + 1
 * Returns null if either sign is unrecognised (houses cannot be invented
 * without a valid Ascendant).
 */
export function calculateWholeSignHouse(targetSign: string, ascendantSign: string): number | null {
  const t = signIndexOf(targetSign);
  const a = signIndexOf(ascendantSign);
  if (t < 0 || a < 0) return null;
  return ((t - a + 12) % 12) + 1;
}

// ── Boundary distance ────────────────────────────────────────────────────────

export interface BoundaryDistance {
  fromPreviousArcSeconds: number; // distance since the current Compendium began
  toNextArcSeconds: number; // distance until the next Compendium begins
  fromPreviousLabel: string;
  toNextLabel: string;
  nearestArcSeconds: number;
  boundarySensitive: boolean;
  thresholdArcSeconds: number;
}

/**
 * Distance from the previous and to the next Compendium boundary, in exact
 * arc-seconds. A placement on a boundary has fromPrevious = 0, toNext = 750.
 * When the nearest boundary is within `thresholdArcSeconds`, the placement is
 * flagged boundary-sensitive — a note only. The calculated Compendium remains
 * the single official result; the placement never belongs to two Compendiums.
 */
export function calculateBoundaryDistance(
  arcSecondsWithinSign: number,
  thresholdArcSeconds: number = DEFAULT_BOUNDARY_THRESHOLD_ARCSEC,
): BoundaryDistance {
  const within = ((arcSecondsWithinSign % ARCSEC_PER_COMPENDIUM) + ARCSEC_PER_COMPENDIUM) % ARCSEC_PER_COMPENDIUM;
  const fromPreviousArcSeconds = within;
  const toNextArcSeconds = ARCSEC_PER_COMPENDIUM - within;
  const nearestArcSeconds = Math.min(fromPreviousArcSeconds, toNextArcSeconds);
  return {
    fromPreviousArcSeconds,
    toNextArcSeconds,
    fromPreviousLabel: formatArcSecondsSpan(fromPreviousArcSeconds),
    toNextLabel: formatArcSecondsSpan(toNextArcSeconds),
    nearestArcSeconds,
    boundarySensitive: nearestArcSeconds <= thresholdArcSeconds,
    thresholdArcSeconds,
  };
}

// ── Ruler chain / dispositor analysis ────────────────────────────────────────

/** Minimal natal data the chain engine needs about each placed object. */
export interface NatalObjectPosition {
  name: string;
  sign: string;
  longitudeDeg?: number;
  degree?: number;
  minute?: number;
  second?: number;
  house?: number | null;
  retrograde?: boolean;
}

export interface RulerLink {
  /** The ruling planet/point of `forSign`. */
  ruler: string | null;
  forSign: string;
  /** Natal placement of the ruler, when chart data is available. */
  position: NatalObjectPosition | null;
  /** Whole-Sign house of the ruler relative to the Ascendant, when known. */
  house: number | null;
  angularity: 'angular' | 'succedent' | 'cadent' | null;
}

export type RulerDepthMode = 'standard' | 'deep' | 'research';

export const RULER_DEPTH_LIMITS: Record<RulerDepthMode, number> = {
  standard: 1,
  deep: 2,
  research: 6, // safe maximum — never unbounded
};

export interface DispositorChain {
  /** Ordered ruler links followed from the starting sign. */
  links: RulerLink[];
  /** True when a closed loop was detected (e.g. A → B → C → A). */
  closedCircuit: boolean;
  /** The signs that formed the loop, if any. */
  circuitSigns: string[];
}

const ANGULAR = new Set([1, 4, 7, 10]);
const SUCCEDENT = new Set([2, 5, 8, 11]);
const CADENT = new Set([3, 6, 9, 12]);

function angularityOf(house: number | null | undefined): RulerLink['angularity'] {
  if (house == null) return null;
  if (ANGULAR.has(house)) return 'angular';
  if (SUCCEDENT.has(house)) return 'succedent';
  if (CADENT.has(house)) return 'cadent';
  return null;
}

/**
 * Follow the dispositor chain starting from a sign: ruler of the sign → the
 * sign that ruler occupies → its ruler → … Stops at `maxDepth` OR when a sign
 * repeats (closed circuit). Never recurses without bound.
 *
 * `natalByName` maps an object name to its natal placement so we can find which
 * sign each ruler occupies. Without chart data the chain stops after one link
 * (we still know the ruler of the starting sign, just not where it lives).
 */
export function followDispositorChain(
  startSign: string,
  ascendantSign: string | null,
  natalByName: Record<string, NatalObjectPosition> | null,
  maxDepth: number,
): DispositorChain {
  const links: RulerLink[] = [];
  const seenSigns = new Set<string>();
  let currentSign = startSign;
  let closedCircuit = false;
  const circuitSigns: string[] = [];

  for (let depth = 0; depth < Math.max(1, maxDepth); depth++) {
    if (seenSigns.has(currentSign)) {
      closedCircuit = true;
      circuitSigns.push(currentSign);
      break;
    }
    seenSigns.add(currentSign);

    const ruler = getSignRuler(currentSign);
    const position = ruler && natalByName ? natalByName[ruler] ?? null : null;
    const house =
      position && ascendantSign
        ? calculateWholeSignHouse(position.sign, ascendantSign)
        : position?.house ?? null;

    links.push({ ruler, forSign: currentSign, position, house, angularity: angularityOf(house) });

    // To continue we need to know which sign the ruler occupies.
    if (!ruler || !position?.sign) break;
    currentSign = position.sign;
  }

  return { links, closedCircuit, circuitSigns };
}

export interface RulerChain {
  mainRuler: RulerLink;
  duadRuler: RulerLink;
  compendiumRuler: RulerLink;
  /** Optional deeper dispositor walks (deep/research modes). */
  mainDispositorChain?: DispositorChain;
  depthMode: RulerDepthMode;
}

function rulerLinkFor(
  sign: string,
  ascendantSign: string | null,
  natalByName: Record<string, NatalObjectPosition> | null,
): RulerLink {
  const ruler = getSignRuler(sign);
  const position = ruler && natalByName ? natalByName[ruler] ?? null : null;
  const house =
    position && ascendantSign
      ? calculateWholeSignHouse(position.sign, ascendantSign)
      : position?.house ?? null;
  return { ruler, forSign: sign, position, house, angularity: angularityOf(house) };
}

/**
 * Build the three-tier ruler chain (main sign, Duad sign, Compendium sign) and,
 * for deep/research modes, the dispositor walk from the main sign with loop
 * detection.
 */
export function calculateRulerChain(
  mainSign: string,
  duadSign: string,
  compendiumSign: string,
  options: {
    ascendantSign?: string | null;
    natalByName?: Record<string, NatalObjectPosition> | null;
    depthMode?: RulerDepthMode;
  } = {},
): RulerChain {
  const ascendantSign = options.ascendantSign ?? null;
  const natalByName = options.natalByName ?? null;
  const depthMode = options.depthMode ?? 'standard';

  const chain: RulerChain = {
    mainRuler: rulerLinkFor(mainSign, ascendantSign, natalByName),
    duadRuler: rulerLinkFor(duadSign, ascendantSign, natalByName),
    compendiumRuler: rulerLinkFor(compendiumSign, ascendantSign, natalByName),
    depthMode,
  };

  if (depthMode !== 'standard' && natalByName) {
    chain.mainDispositorChain = followDispositorChain(
      mainSign,
      ascendantSign,
      natalByName,
      RULER_DEPTH_LIMITS[depthMode],
    );
  }

  return chain;
}

// ── Full placement ───────────────────────────────────────────────────────────

export interface HiddenZodiacInput {
  objectName: string;
  objectType?: string;
  sign: string;
  degree: number;
  minute: number;
  second: number;
  /** Ascendant sign — required to resolve any Whole-Sign houses. */
  ascendantSign?: string | null;
  /** False ⇒ "Seconds Unknown" fallback (second is assumed 0, clearly flagged). */
  secondsKnown?: boolean;
  retrograde?: boolean;
  /** Optional natal placements (object name → position) for ruler analysis. */
  natalByName?: Record<string, NatalObjectPosition> | null;
  depthMode?: RulerDepthMode;
  boundaryThresholdArcSeconds?: number;
}

export interface HiddenZodiacPlacement {
  calculationVersion: string;
  object: { name: string; type: string | null; retrograde: boolean | null };
  position: {
    sign: string;
    signIndex: number;
    degree: number;
    minute: number;
    second: number;
    secondsKnown: boolean;
    text: string; // "27°16′42″ Scorpio"
    totalArcSecondsWithinSign: number;
    absoluteArcSeconds: number;
    longitudeDeg: number;
  };
  primaryHouse: number | null;
  duad: DuadResult & { activatedHouse: number | null };
  compendium: CompendiumResult & { activatedHouse: number | null };
  rulerChain: RulerChain;
  boundary: BoundaryDistance;
  warnings: string[];
}

/**
 * THE core entry point. Calculates one complete Hidden Zodiac placement:
 * exact position → Duad → Compendium → Whole-Sign houses (primary, Duad-
 * activated, Compendium-activated) → ruler chain → boundary distance.
 *
 * Throws on invalid d/m/s (no invented result). When `secondsKnown` is false a
 * warning is attached and seconds are treated as 0 — never presented as exact.
 */
export function calculateHiddenZodiacPlacement(input: HiddenZodiacInput): HiddenZodiacPlacement {
  const warnings: string[] = [];
  const secondsKnown = input.secondsKnown !== false;
  const second = secondsKnown ? input.second : 0;

  if (!secondsKnown) {
    warnings.push(
      'Seconds unknown: calculated with 00″. A placement near a Compendium boundary may resolve differently once exact seconds are known.',
    );
  }

  const validation = validatePosition({
    sign: input.sign,
    degree: input.degree,
    minute: input.minute,
    second,
  });
  if (!validation.valid) {
    throw new RangeError(`[HiddenZodiac] calculateHiddenZodiacPlacement: ${validation.errors.join('; ')}`);
  }

  const signIndex = signIndexOf(input.sign);
  const totalArcSecondsWithinSign = positionToArcSeconds(input.degree, input.minute, second);
  const { absoluteArcSeconds, longitudeDeg } = calculateAbsoluteLongitude(signIndex, totalArcSecondsWithinSign);

  const duad = calculateDuad(signIndex, totalArcSecondsWithinSign);
  const compendium = calculateCompendium(duad.signIndex, duad.startArcSeconds, totalArcSecondsWithinSign);

  const ascendantSign = input.ascendantSign ?? null;
  if (!ascendantSign) {
    warnings.push(
      'Ascendant not provided: Duad and Compendium are calculated, but the Whole-Sign houses they activate cannot be resolved.',
    );
  }

  const primaryHouse = ascendantSign ? calculateWholeSignHouse(input.sign, ascendantSign) : null;
  const duadHouse = ascendantSign ? calculateWholeSignHouse(duad.sign, ascendantSign) : null;
  const compHouse = ascendantSign ? calculateWholeSignHouse(compendium.sign, ascendantSign) : null;

  const rulerChain = calculateRulerChain(input.sign, duad.sign, compendium.sign, {
    ascendantSign,
    natalByName: input.natalByName ?? null,
    depthMode: input.depthMode ?? 'standard',
  });

  const boundary = calculateBoundaryDistance(
    totalArcSecondsWithinSign,
    input.boundaryThresholdArcSeconds ?? DEFAULT_BOUNDARY_THRESHOLD_ARCSEC,
  );

  const formatted = arcSecondsToFormattedPosition(totalArcSecondsWithinSign);

  return {
    calculationVersion: HIDDEN_ZODIAC_CALCULATION_VERSION,
    object: {
      name: input.objectName,
      type: input.objectType ?? null,
      retrograde: input.retrograde ?? null,
    },
    position: {
      sign: input.sign,
      signIndex,
      degree: input.degree,
      minute: input.minute,
      second,
      secondsKnown,
      text: `${formatted.text} ${input.sign}`,
      totalArcSecondsWithinSign,
      absoluteArcSeconds,
      longitudeDeg,
    },
    primaryHouse,
    duad: { ...duad, activatedHouse: duadHouse },
    compendium: { ...compendium, activatedHouse: compHouse },
    rulerChain,
    boundary,
    warnings,
  };
}

/**
 * Calculate a whole chart's worth of placements at once. `objects` is an array
 * of placement inputs; `natalByName` is shared across all of them so ruler
 * chains resolve against the full chart. Invalid placements are skipped with a
 * dev warning rather than aborting the entire chart.
 */
export function calculateFullHiddenZodiacChart(
  objects: HiddenZodiacInput[],
  shared: {
    ascendantSign?: string | null;
    natalByName?: Record<string, NatalObjectPosition> | null;
    depthMode?: RulerDepthMode;
  } = {},
): HiddenZodiacPlacement[] {
  const results: HiddenZodiacPlacement[] = [];
  for (const obj of objects) {
    try {
      results.push(
        calculateHiddenZodiacPlacement({
          ...obj,
          ascendantSign: obj.ascendantSign ?? shared.ascendantSign ?? null,
          natalByName: obj.natalByName ?? shared.natalByName ?? null,
          depthMode: obj.depthMode ?? shared.depthMode ?? 'standard',
        }),
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`[HiddenZodiac] Skipping ${obj.objectName}: ${(err as Error).message}`);
    }
  }
  return results;
}

// ── AI payload (structured, calculation-as-source-of-truth) ──────────────────

export interface HiddenZodiacAiPayload {
  planet: string;
  sign: string;
  degree: number;
  minute: number;
  second: number;
  exact_position: string;
  primary_house: number | null;
  duad: string;
  duad_house: number | null;
  compendium: string;
  compendium_house: number | null;
  main_ruler: string | null;
  duad_ruler: string | null;
  compendium_ruler: string | null;
  ascendant: string | null;
  house_system: 'Whole Sign';
  calculation_version: string;
  seconds_known: boolean;
  boundary_sensitive: boolean;
}

/**
 * Build the structured payload sent to the AI interpretation layer. The AI must
 * treat these calculated values as the source of truth and must NOT recompute
 * the Duad/Compendium or alter the placement. Validate AI output against this.
 */
export function buildAiPayload(placement: HiddenZodiacPlacement, ascendantSign: string | null): HiddenZodiacAiPayload {
  return {
    planet: placement.object.name,
    sign: placement.position.sign,
    degree: placement.position.degree,
    minute: placement.position.minute,
    second: placement.position.second,
    exact_position: placement.position.text,
    primary_house: placement.primaryHouse,
    duad: placement.duad.sign,
    duad_house: placement.duad.activatedHouse,
    compendium: placement.compendium.sign,
    compendium_house: placement.compendium.activatedHouse,
    main_ruler: placement.rulerChain.mainRuler.ruler,
    duad_ruler: placement.rulerChain.duadRuler.ruler,
    compendium_ruler: placement.rulerChain.compendiumRuler.ruler,
    ascendant: ascendantSign,
    house_system: 'Whole Sign',
    calculation_version: placement.calculationVersion,
    seconds_known: placement.position.secondsKnown,
    boundary_sensitive: placement.boundary.boundarySensitive,
  };
}
