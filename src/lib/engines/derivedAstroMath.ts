/**
 * Derived Astrocartography Mathematics — duad and compendium longitudes plus
 * versioned celestial coordinates for the Duad–Compendium ACG feature.
 *
 * Pure, deterministic, side-effect free. No app imports. Identical copies
 * ship on both platforms and must agree on the shared golden dataset:
 *   align-app/src/services/derivedAstroMath.ts
 *   align-web/src/lib/engines/derivedAstroMath.ts
 *   golden dataset: derivedAcgGolden.json (same directory as the tests)
 *
 * Definitions (authoritative):
 *   λ  = absolute natal ecliptic longitude = 30S + d   (S = sign index 0–11,
 *        Aries = 0; d = exact degree within sign, 0 ≤ d < 30)
 *   Duad: each sign divides into 12 × 2.5° subdivisions that cycle through
 *        the zodiac starting from the sign itself.
 *        nD = floor(d / 2.5); SD = (S + nD) mod 12; rD = d − 2.5·nD;
 *        dD = 12·rD; λD = 30·SD + dD
 *        Compact equivalent: λD = (30S + 12d) mod 360
 *   Compendium: the duad of the duad (recursive definition is authoritative).
 *        Apply the duad transform to (SD, dD). Each natal sign therefore
 *        contains 144 compendium subdivisions of 0.2083…° (12′30″) each.
 *
 * Coordinate model (zero_ecliptic_latitude_model_v1): every derived point is
 * treated as lying exactly on the ecliptic (β = 0). RA/declination follow
 *        α = atan2(sin λ · cos ε, cos λ),  δ = asin(sin ε · sin λ)
 * using the SAME fixed mean obliquity the existing ACG engine uses for natal
 * lines (23.4393°), so derived lines match natal-line accuracy exactly.
 * A date-specific obliquity is a documented v2 candidate — do not change the
 * default here without bumping the model version.
 *
 * All angles are degrees at the public API boundary; radians are used only
 * internally for trigonometry. No rounding is applied except in the explicit
 * display-formatting helpers.
 */

export const DUAD_MODEL_VERSION = 'duad_model_v1';
export const COMPENDIUM_MODEL_VERSION = 'compendium_model_v1';
export const COORDINATE_MODEL_VERSION = 'zero_ecliptic_latitude_model_v1';
export const PROJECTION_MODEL_VERSION = 'derived_astrocartography_projection_v1';

/** Zodiac signs in zero-based index order (Aries = 0 … Pisces = 11). */
export const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export type ZodiacSign = (typeof SIGNS)[number];

/**
 * Fixed mean obliquity used by the existing client ACG engine. Derived lines
 * intentionally use the same value so they are exactly as accurate as the
 * natal lines they sit beside (zero_ecliptic_latitude_model_v1).
 */
export const ACG_OBLIQUITY_DEG = 23.4393;

const DEG = Math.PI / 180;
const DUAD_SPAN_DEG = 2.5; // 30° / 12

// ── Validation & normalization ──────────────────────────────────────────────

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Normalize any finite longitude to 0° ≤ λ < 360°.
 * Throws TypeError on NaN, ±Infinity, or non-number input — derived layers
 * must fail safely rather than propagate invalid coordinates to the map.
 */
export function normalizeLongitude360(longitude: number): number {
  if (!isFiniteNumber(longitude)) {
    throw new TypeError(`derivedAstroMath: longitude must be a finite number, got ${String(longitude)}`);
  }
  const norm = ((longitude % 360) + 360) % 360;
  // ((−1e−30 % 360) + 360) % 360 can yield exactly 360 through fp rounding.
  return norm === 360 ? 0 : norm;
}

/** Zero-based sign index (Aries = 0) for an absolute longitude. */
export function signIndexOf(longitude: number): number {
  const lon = normalizeLongitude360(longitude);
  // lon < 360 guarantees index ≤ 11; min() guards fp edge only.
  return Math.min(11, Math.floor(lon / 30));
}

/** Exact degree within the sign, 0 ≤ d < 30. Not rounded. */
export function degreeInSign(longitude: number): number {
  const lon = normalizeLongitude360(longitude);
  return lon - 30 * Math.floor(lon / 30);
}

/** λ = 30S + d, validating inputs. */
export function absoluteLongitude(signIndex: number, degree: number): number {
  if (!Number.isInteger(signIndex) || signIndex < 0 || signIndex > 11) {
    throw new TypeError(`derivedAstroMath: signIndex must be an integer 0–11, got ${String(signIndex)}`);
  }
  if (!isFiniteNumber(degree) || degree < 0 || degree >= 30) {
    throw new TypeError(`derivedAstroMath: degree must satisfy 0 ≤ d < 30, got ${String(degree)}`);
  }
  return 30 * signIndex + degree;
}

// ── Derived positions ───────────────────────────────────────────────────────

export interface DerivedPosition {
  /** Absolute derived ecliptic longitude, 0 ≤ λ < 360. */
  longitude: number;
  /** Zero-based sign index of the derived sign. */
  signIndex: number;
  /** Derived sign name. */
  sign: ZodiacSign;
  /** Exact degree within the derived sign, 0 ≤ d < 30. Not rounded. */
  degreeInSign: number;
  /** Versioned model identifier for persistence/observability. */
  modelVersion: string;
}

/**
 * Expanded duad transform (authoritative algorithm).
 * Accepts any finite longitude; negative and ≥360 inputs are normalized.
 */
export function duadPosition(natalLongitude: number): DerivedPosition {
  const lon = normalizeLongitude360(natalLongitude);
  const S = Math.min(11, Math.floor(lon / 30));
  const d = lon - 30 * S;
  // nD = floor(d / 2.5); d < 30 ⇒ nD ≤ 11. min() guards fp edge only.
  const nD = Math.min(11, Math.floor(d / DUAD_SPAN_DEG));
  const SD = (S + nD) % 12;
  const rD = d - DUAD_SPAN_DEG * nD;
  const dD = 12 * rD;
  return {
    longitude: normalizeLongitude360(30 * SD + dD),
    signIndex: SD,
    sign: SIGNS[SD],
    degreeInSign: dD,
    modelVersion: DUAD_MODEL_VERSION,
  };
}

/** Compact duad formula: λD = (30S + 12d) mod 360. Verification twin of duadPosition. */
export function duadLongitudeCompact(natalLongitude: number): number {
  const lon = normalizeLongitude360(natalLongitude);
  const S = Math.min(11, Math.floor(lon / 30));
  const d = lon - 30 * S;
  return normalizeLongitude360(30 * S + 12 * d);
}

/**
 * Compendium transform — the duad of the duad (recursive definition is the
 * authoritative model; a global ×144 shortcut is intentionally NOT used).
 */
export function compendiumPosition(natalLongitude: number): DerivedPosition {
  const duad = duadPosition(natalLongitude);
  const comp = duadPosition(duad.longitude);
  return { ...comp, modelVersion: COMPENDIUM_MODEL_VERSION };
}

/** Compact compendium formula: apply the compact duad formula twice. */
export function compendiumLongitudeCompact(natalLongitude: number): number {
  return duadLongitudeCompact(duadLongitudeCompact(natalLongitude));
}

// ── Celestial coordinates (zero_ecliptic_latitude_model_v1) ────────────────

export interface EquatorialCoords {
  /** Right ascension in degrees, 0 ≤ α < 360. */
  rightAscension: number;
  /** Declination in degrees, −ε ≤ δ ≤ +ε under this model. */
  declination: number;
  /** Obliquity used for the conversion, degrees. */
  obliquity: number;
  /** Versioned coordinate-model identifier. */
  modelVersion: string;
}

/**
 * Convert a derived ecliptic longitude (β = 0) to equatorial coordinates.
 *   α = atan2(sin λ · cos ε, cos λ)   (atan2 handles all quadrants)
 *   δ = asin(sin ε · sin λ)
 * Matches the existing ACG engine's conversion exactly so derived lines and
 * natal lines share one geometric model.
 */
export function eclipticToEquatorial(
  longitudeDeg: number,
  obliquityDeg: number = ACG_OBLIQUITY_DEG,
): EquatorialCoords {
  const lon = normalizeLongitude360(longitudeDeg);
  if (!isFiniteNumber(obliquityDeg)) {
    throw new TypeError(`derivedAstroMath: obliquity must be a finite number, got ${String(obliquityDeg)}`);
  }
  const lonRad = lon * DEG;
  const epsRad = obliquityDeg * DEG;
  const raRad = Math.atan2(Math.sin(lonRad) * Math.cos(epsRad), Math.cos(lonRad));
  const rightAscension = normalizeLongitude360(raRad / DEG);
  const declination = Math.asin(Math.sin(epsRad) * Math.sin(lonRad)) / DEG;
  return {
    rightAscension,
    declination,
    obliquity: obliquityDeg,
    modelVersion: COORDINATE_MODEL_VERSION,
  };
}

// ── Display formatting (the ONLY place rounding is allowed) ────────────────

export interface DegreesMinutes {
  degrees: number;
  minutes: number;
}

/** Split a degree-in-sign into whole degrees and arc-minutes for display. */
export function toDegreesMinutes(degree: number): DegreesMinutes {
  if (!isFiniteNumber(degree) || degree < 0) {
    throw new TypeError(`derivedAstroMath: degree must be a finite non-negative number, got ${String(degree)}`);
  }
  let degrees = Math.floor(degree);
  let minutes = Math.round((degree - degrees) * 60);
  if (minutes === 60) {
    minutes = 0;
    degrees += 1;
  }
  return { degrees, minutes };
}

/** Format an absolute longitude as e.g. "27°16′ Scorpio" (display only). */
export function formatSignDegree(longitude: number): string {
  const idx = signIndexOf(longitude);
  const { degrees, minutes } = toDegreesMinutes(degreeInSign(longitude));
  return `${degrees}°${String(minutes).padStart(2, '0')}′ ${SIGNS[idx]}`;
}
