/**
 * SOUL AGE CALCULATOR — persistence shaping.
 *
 * Pure functions that turn a SoulAgeResult into a `soul_age_results` row and
 * back. Deliberately framework-free so web and mobile serialise identically.
 *
 * PRIVACY IS ENFORCED HERE (§22). This module is the ONLY place a Soul Age
 * result is shaped for storage, and it never emits a birth date, birth time,
 * birthplace, coordinate or timezone. The subject is stored as a reference —
 * 'self', or a saved_charts id — so birth details stay in exactly one place.
 * `assertNoBirthData()` is called on every row before it is returned, so a
 * future edit that leaks a birth field fails loudly instead of silently
 * shipping personal data to a new table.
 */

import { SOUL_AGE_METHOD_VERSION, MEAN_NODE_FALLBACK_MESSAGE, type SoulAgeResult } from './soulAgeEngine';

/** Row shape of `public.soul_age_results` (the columns we write). */
export interface SoulAgeResultRow {
  owner_id: string;
  saved_chart_id: string | null;
  subject_key: string;
  subject_label: string;

  total_universal_lifetimes: number;
  earth_lifetimes: number;
  non_earth_lifetimes: number;
  earth_percentage: number;

  universal_soul_age: string;
  earth_soul_age: string;

  earth_anchoring_score: number;
  validated_completed_cycles: number;
  candidate_completed_cycles: number;
  raw_closure_units: number;
  current_cycle_position: number;

  detail: SoulAgeDetail;

  soul_age_method_version: string;
  used_mean_node: boolean;
  birth_time_seconds_known: boolean;
}

/** The §19 transparency payload. Positions only — never birth data. */
export interface SoulAgeDetail {
  chronometers: { planet: string; weight: number; roles: string[]; position: string; house: number | null; duad: string; compendium: string }[];
  closure: { id: string; title: string; units: number; cap: number; evidence: string[] }[];
  earthAnchoring: { id: string; title: string; weight: number; score: number }[];
  keyPoints: { name: string; frame: 'natal' | 'draconic'; position: string; house: number | null; duad: string; compendium: string }[];
  earthFraction: number;
  earthPrecisionModifier: number;
  universalMaturityCoefficient: number;
  supportingPosition: number;
  ascendantPosition: number;
}

/**
 * Field names that must NEVER appear in a stored Soul Age row, at any depth.
 * Checked against object KEYS — a position label like "23°18′50″ Pisces" is
 * chart data, not birth data, and is expected in `detail`.
 */
const FORBIDDEN_KEYS = [
  'birth_date', 'birthDate', 'birth_time', 'birthTime', 'birth_place', 'birthPlace',
  'birth_location', 'birthLocation', 'latitude', 'longitude', 'timezone', 'tz_offset',
  'coordinates', 'lat', 'lon', 'lng', 'place', 'location',
];

/**
 * Throw if a row carries any birth-data key. Called on every row before it
 * leaves this module, so the guarantee cannot rot.
 */
export function assertNoBirthData(value: unknown, path = 'row'): void {
  if (value === null || typeof value !== 'object') return;

  if (Array.isArray(value)) {
    value.forEach((entry, i) => assertNoBirthData(entry, `${path}[${i}]`));
    return;
  }

  for (const key of Object.keys(value as Record<string, unknown>)) {
    if (FORBIDDEN_KEYS.indexOf(key) >= 0) {
      throw new Error(
        `[SoulAge] Refusing to persist birth data: "${key}" found at ${path}. ` +
        'soul_age_results stores a subject REFERENCE only (see the migration header).',
      );
    }
    assertNoBirthData((value as Record<string, unknown>)[key], `${path}.${key}`);
  }
}

function round(value: number, places: number): number {
  const f = Math.pow(10, places);
  return Math.round(value * f) / f;
}

/**
 * Shape a computed result for storage.
 *
 * `savedChartId` null means the row belongs to the owner's own profile chart.
 * Guest results must never be passed here — a guest has no owner_id.
 */
export function buildSoulAgeResultRow(
  result: SoulAgeResult,
  options: { ownerId: string; savedChartId?: string | null; subjectLabel?: string },
): SoulAgeResultRow {
  const savedChartId = options.savedChartId ?? null;

  const point = (frame: 'natal' | 'draconic', name: string) => {
    const p = result[frame][name];
    return p
      ? { name, frame, position: p.positionLabel, house: p.house, duad: p.duadSign, compendium: p.compendiumSign }
      : null;
  };

  const keyPoints = ([
    point('draconic', 'Ascendant'),
    point('draconic', 'Earth'),
    point('draconic', 'Sun'),
    point('draconic', 'Saturn'),
    point('draconic', 'Moon'),
    point('draconic', 'Pluto'),
    point('natal', 'South Node'),
    point('natal', 'IC'),
    point('natal', 'MC'),
  ].filter(Boolean)) as SoulAgeDetail['keyPoints'];

  const detail: SoulAgeDetail = {
    chronometers: result.chronometers.map((c) => ({
      planet: c.planet,
      weight: round(c.weight, 6),
      roles: c.roles,
      position: c.point.positionLabel,
      house: c.point.house,
      duad: c.point.duadSign,
      compendium: c.point.compendiumSign,
    })),
    closure: result.closure.categories.map((c) => ({
      id: c.id,
      title: c.title,
      units: c.units,
      cap: c.cap,
      evidence: c.evidence.map((e) => e.label),
    })),
    earthAnchoring: result.earthAnchoring.categories.map((c) => ({
      id: c.id,
      title: c.title,
      weight: c.weight,
      score: round(c.score, 4),
    })),
    keyPoints,
    earthFraction: round(result.earthFraction, 10),
    earthPrecisionModifier: round(result.earthPrecisionModifier, 10),
    universalMaturityCoefficient: round(result.universalMaturityCoefficient, 10),
    supportingPosition: round(result.supportingPosition, 10),
    ascendantPosition: round(result.ascendantPosition, 10),
  };

  const row: SoulAgeResultRow = {
    owner_id: options.ownerId,
    saved_chart_id: savedChartId,
    subject_key: savedChartId ?? 'self',
    subject_label: (options.subjectLabel || '').trim().slice(0, 120),

    total_universal_lifetimes: result.totalUniversalLifetimes,
    earth_lifetimes: result.earthLifetimes,
    non_earth_lifetimes: result.nonEarthLifetimes,
    earth_percentage: round(result.earthPercentage, 4),

    universal_soul_age: result.universalSoulAge.label,
    earth_soul_age: result.earthSoulAge.label,

    earth_anchoring_score: result.earthAnchoring.displayScore,
    validated_completed_cycles: result.validatedCompletedCycles,
    candidate_completed_cycles: result.candidateCompletedCycles,
    raw_closure_units: result.closure.rawClosureUnits,
    current_cycle_position: round(result.currentCyclePosition, 10),

    detail,

    soul_age_method_version: result.methodVersion || SOUL_AGE_METHOD_VERSION,
    used_mean_node: result.notices.indexOf(MEAN_NODE_FALLBACK_MESSAGE) >= 0,
    birth_time_seconds_known: !result.notices.some((n) => n.indexOf('00 birth-time seconds') >= 0),
  };

  assertNoBirthData(row);
  return row;
}

/**
 * True when a stored row was produced by an older methodology version, or from
 * the Mean node before the True Node became available — i.e. it should be
 * recalculated before being shown as current.
 */
export function isStaleResult(row: Pick<SoulAgeResultRow, 'soul_age_method_version' | 'used_mean_node'>): boolean {
  return row.soul_age_method_version !== SOUL_AGE_METHOD_VERSION || row.used_mean_node;
}
