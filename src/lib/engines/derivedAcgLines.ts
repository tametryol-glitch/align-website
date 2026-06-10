/**
 * Derived Astrocartography Line Generation — derived_astrocartography_projection_v1
 *
 * Generates AC/DC/MC/IC map lines for natal, duad, and compendium layers.
 * The projection mathematics in this module is a VERBATIM port of the
 * existing natal ACG engine (calculateACGLines in readings/acg.tsx — same
 * GMST polynomial, same RA/declination transform, same hour-angle horizon
 * solution, same sampling ranges and longitude normalization), so derived
 * lines are geometrically consistent with the natal lines users already see.
 * Equivalence with the existing engine is enforced by unit test, not assumed.
 *
 * Pure and deterministic. No app imports other than derivedAstroMath.
 * Identical copies ship on both platforms:
 *   align-app/src/services/derivedAcgLines.ts
 *   align-web/src/lib/engines/derivedAcgLines.ts
 *
 * Failure policy (per spec): a body with an invalid longitude is skipped in
 * isolation — it must never poison other bodies, layers, or the natal map.
 */

import {
  duadPosition,
  compendiumPosition,
  eclipticToEquatorial,
  isFiniteNumber,
  ACG_OBLIQUITY_DEG,
  DUAD_MODEL_VERSION,
  COMPENDIUM_MODEL_VERSION,
} from './derivedAstroMath';

export const DERIVED_PROJECTION_VERSION = 'derived_astrocartography_projection_v1';

export type DerivedLayer = 'natal' | 'duad' | 'compendium';
export type ACGLineType = 'ASC' | 'DSC' | 'MC' | 'IC';

export interface ACGLinePoint {
  lat: number;
  lon: number;
}

/** Superset of the existing screen ACGLine shape — extra fields are additive. */
export interface DerivedACGLine {
  /** Parent body name — derived lines are always labeled by their parent
   *  planet, never as a separate "ghost" planet. */
  planet: string;
  lineType: ACGLineType;
  points: ACGLinePoint[];
  color: string;
  /** Which layer this line belongs to. */
  layer: DerivedLayer;
  /** The absolute ecliptic longitude actually projected (λ, λD, or λC). */
  projectedLongitude: number;
  /** Model identifier for the longitude derivation of this layer. */
  modelVersion: string;
}

/** Bodies eligible for ACG lines — mirrors the existing engine's list. */
export const ACG_BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
] as const;

/** Per-planet colors — mirrors the existing engine's palette exactly. */
export const ACG_BODY_COLORS: Record<string, string> = {
  Sun: '#F59E0B', Moon: '#C4B5FD', Mercury: '#6EE7B7', Venus: '#F472B6',
  Mars: '#EF4444', Jupiter: '#818CF8', Saturn: '#9CA3AF', Uranus: '#38BDF8',
  Neptune: '#2DD4BF', Pluto: '#991B1B',
};

const DEG = Math.PI / 180;

export interface NatalBodyInput {
  name: string;
  longitude: number;
}

/**
 * Greenwich Mean Sidereal Time (degrees) at a UTC moment — verbatim port of
 * the existing engine's computation (Meeus polynomial; seconds ignored, as
 * in the original). Validated against the canonical J2000.0 value in tests.
 */
export function gmstAtMoment(birthDate: Date): number {
  const y = birthDate.getUTCFullYear();
  const m = birthDate.getUTCMonth() + 1;
  const d = birthDate.getUTCDate();
  const utH = birthDate.getUTCHours() + birthDate.getUTCMinutes() / 60;
  let jdY = y, jdM = m;
  if (m <= 2) { jdY -= 1; jdM += 12; }
  const A = Math.floor(jdY / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd0 = Math.floor(365.25 * (jdY + 4716)) + Math.floor(30.6001 * (jdM + 1)) + d + B - 1524.5;
  const d0 = jd0 - 2451545.0;
  const T0 = d0 / 36525.0;
  let gmst0 = 100.46061837 + 36000.770053608 * T0 + 0.000387933 * T0 * T0;
  gmst0 = ((gmst0 % 360) + 360) % 360;
  return gmst0 + 360.98564724 * (utH / 24.0);
}

interface RawLine {
  lineType: ACGLineType;
  points: ACGLinePoint[];
}

/**
 * Core projection for one ecliptic longitude — verbatim port of the existing
 * engine's per-planet block (same formulas, ranges, steps, normalization,
 * and polar no-rise/no-set skip behavior).
 */
export function projectLongitudeToLines(longitudeDeg: number, gmstBirth: number): RawLine[] {
  const { rightAscension: raAdj, declination: dec } = eclipticToEquatorial(longitudeDeg, ACG_OBLIQUITY_DEG);
  const out: RawLine[] = [];

  // MC line: vertical line where the point culminates (lon = RA − GMST)
  const mcLon = ((raAdj - gmstBirth) % 360 + 360 + 180) % 360 - 180;
  const mcPoints: ACGLinePoint[] = [];
  for (let lat = -70; lat <= 70; lat += 2) {
    mcPoints.push({ lat, lon: mcLon });
  }
  out.push({ lineType: 'MC', points: mcPoints });

  // IC line: opposite meridian
  const icLon = mcLon > 0 ? mcLon - 180 : mcLon + 180;
  const icPoints: ACGLinePoint[] = [];
  for (let lat = -70; lat <= 70; lat += 2) {
    icPoints.push({ lat, lon: icLon });
  }
  out.push({ lineType: 'IC', points: icPoints });

  // ASC/DSC curves via the horizon hour angle: cos H = −tan φ · tan δ
  const decRad = dec * DEG;
  const ascPoints: ACGLinePoint[] = [];
  const dscPoints: ACGLinePoint[] = [];
  for (let lat = -66; lat <= 66; lat += 2) {
    const latRad = lat * DEG;
    const cosH = -Math.tan(latRad) * Math.tan(decRad);
    if (cosH < -1 || cosH > 1) continue; // no-rise / no-set at this latitude

    const H = Math.acos(cosH) / DEG;
    const lstAsc = raAdj + H;
    ascPoints.push({ lat, lon: ((lstAsc - gmstBirth) % 360 + 360 + 180) % 360 - 180 });
    const lstDsc = raAdj - H;
    dscPoints.push({ lat, lon: ((lstDsc - gmstBirth) % 360 + 360 + 180) % 360 - 180 });
  }
  if (ascPoints.length > 0) out.push({ lineType: 'ASC', points: ascPoints });
  if (dscPoints.length > 0) out.push({ lineType: 'DSC', points: dscPoints });

  return out;
}

/** A rendered point is valid only with finite lat/lon inside map bounds. */
function lineIsValid(line: RawLine): boolean {
  return line.points.every(
    (p) =>
      isFiniteNumber(p.lat) && isFiniteNumber(p.lon) &&
      p.lat >= -90 && p.lat <= 90 && p.lon >= -180 && p.lon <= 180,
  );
}

/**
 * Natal-equivalence generator: reproduces the EXISTING engine's output shape
 * ({planet, lineType, points, color}) for the natal layer. Exists so unit
 * tests can prove this module's projection is identical to the screen's
 * inline calculateACGLines — it is not used by production screens.
 */
export function generateAcgLinesCompat(
  planets: NatalBodyInput[],
  birthDate: Date,
): Array<{ planet: string; lineType: ACGLineType; points: ACGLinePoint[]; color: string }> {
  const gmstBirth = gmstAtMoment(birthDate);
  const lines: Array<{ planet: string; lineType: ACGLineType; points: ACGLinePoint[]; color: string }> = [];
  for (const planet of planets) {
    if (!(ACG_BODIES as readonly string[]).includes(planet.name)) continue;
    const color = ACG_BODY_COLORS[planet.name] || '#FFFFFF';
    for (const raw of projectLongitudeToLines(planet.longitude, gmstBirth)) {
      lines.push({ planet: planet.name, lineType: raw.lineType, points: raw.points, color });
    }
  }
  return lines;
}

export interface GenerateDerivedOptions {
  /** Which derived layers to generate. Natal lines stay with the existing engine. */
  layers: Array<'duad' | 'compendium'>;
  /** Restrict to specific body names (defaults to all supported bodies). */
  bodies?: string[];
}

/**
 * Generate derived (duad / compendium) ACG lines for the supported bodies.
 *
 * - Only generates what was asked for: unselected layers cost nothing.
 * - Skips unsupported bodies and invalid longitudes in isolation.
 * - Never throws for a bad body; never returns NaN/out-of-range coordinates.
 */
export function generateDerivedAcgLines(
  planets: NatalBodyInput[],
  birthDate: Date,
  options: GenerateDerivedOptions,
): DerivedACGLine[] {
  const layers = options.layers;
  if (!layers || layers.length === 0) return [];
  const gmstBirth = gmstAtMoment(birthDate);
  const allowed = options.bodies
    ? new Set(options.bodies)
    : new Set<string>(ACG_BODIES as readonly string[]);

  const lines: DerivedACGLine[] = [];
  for (const planet of planets) {
    if (!(ACG_BODIES as readonly string[]).includes(planet.name)) continue;
    if (!allowed.has(planet.name)) continue;
    if (!isFiniteNumber(planet.longitude)) continue; // isolate bad data
    const color = ACG_BODY_COLORS[planet.name] || '#FFFFFF';

    for (const layer of layers) {
      try {
        const derived = layer === 'duad'
          ? duadPosition(planet.longitude)
          : compendiumPosition(planet.longitude);
        const modelVersion = layer === 'duad' ? DUAD_MODEL_VERSION : COMPENDIUM_MODEL_VERSION;
        for (const raw of projectLongitudeToLines(derived.longitude, gmstBirth)) {
          if (!lineIsValid(raw)) continue; // never render invalid coordinates
          lines.push({
            planet: planet.name,
            lineType: raw.lineType,
            points: raw.points,
            color,
            layer,
            projectedLongitude: derived.longitude,
            modelVersion,
          });
        }
      } catch {
        // One failing body/layer must never break the rest of the map.
        continue;
      }
    }
  }
  return lines;
}
