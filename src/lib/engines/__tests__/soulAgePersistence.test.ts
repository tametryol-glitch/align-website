import { describe, it, expect } from 'vitest';
/**
 * Soul Age persistence tests.
 *
 * The important guarantee here is §22: a stored Soul Age row must carry NO
 * birth data. The rest verifies the row reconciles with the engine result and
 * satisfies every CHECK constraint in supabase-migration-soul-age.sql, so a
 * bad row fails in the test suite rather than at the database.
 */

import { calculateSoulAge, SOUL_AGE_METHOD_VERSION, type SoulAgeChartInput } from '../soulAgeEngine';
import {
  buildSoulAgeResultRow,
  assertNoBirthData,
  isStaleResult,
} from '../soulAgePersistence';

const FIXTURE: SoulAgeChartInput = {
  label: 'Reference chart',
  bodies: [
    { name: 'Sun', longitude: 237.262357 },
    { name: 'Moon', longitude: 242.686397 },
    { name: 'Mercury', longitude: 237.235805 },
    { name: 'Venus', longitude: 259.556876 },
    { name: 'Mars', longitude: 150.136364 },
    { name: 'Jupiter', longitude: 158.199535 },
    { name: 'Saturn', longitude: 175.032294 },
    { name: 'Uranus', longitude: 231.671111 },
    { name: 'Neptune', longitude: 259.371148 },
    { name: 'Pluto', longitude: 200.574073 },
    { name: 'Vesta', longitude: 36.411892 },
    { name: 'Juno', longitude: 118.429582 },
    { name: 'True Node', longitude: 154.584323 },
    { name: 'North Node', longitude: 154.109109 },
  ],
  ascendant: 147.898315,
  midheaven: 56.575797,
  birthTimeKnown: true,
};

const OWNER = '11111111-2222-3333-4444-555555555555';
const CHART = '99999999-8888-7777-6666-555555555555';

const RESULT = calculateSoulAge(FIXTURE);
const ROW = buildSoulAgeResultRow(RESULT, { ownerId: OWNER, subjectLabel: 'Reference chart' });

describe('§22 — a stored row carries no birth data', () => {
  it('contains no birth-data keys at any depth', () => {
    expect(() => assertNoBirthData(ROW)).not.toThrow();
  });

  it('contains no birth date, time, place or coordinates anywhere in its JSON', () => {
    const json = JSON.stringify(ROW);
    expect(json).not.toContain('1979');
    expect(json).not.toContain('23:52');
    expect(json).not.toMatch(/Nassau/i);
    expect(json).not.toContain('25.0657');
    expect(json).not.toContain('77.3433');
    expect(json).not.toMatch(/America\/|UTC[+-]/);
  });

  it('throws loudly if a birth field is ever added', () => {
    expect(() => assertNoBirthData({ ...ROW, birth_date: '1979-11-19' })).toThrow(/Refusing to persist birth data/);
    expect(() => assertNoBirthData({ detail: { keyPoints: [{ latitude: 25.06 }] } })).toThrow(/latitude/);
    expect(() => assertNoBirthData({ a: { b: { c: { timezone: 'UTC' } } } })).toThrow(/timezone/);
  });

  it('allowlists its output, so a new engine field cannot pass through', () => {
    // The builder picks fields explicitly rather than spreading the result, so
    // adding a birth-data field to SoulAgeResult cannot leak into storage.
    const poisoned = { ...RESULT } as unknown as Record<string, unknown>;
    poisoned.birthPlace = 'Nassau';
    poisoned.latitude = 25.0657;
    const row = buildSoulAgeResultRow(poisoned as never, { ownerId: OWNER });
    expect(JSON.stringify(row)).not.toContain('Nassau');
    expect(JSON.stringify(row)).not.toContain('25.0657');

    expect(Object.keys(row).sort()).toEqual([
      'birth_time_seconds_known', 'candidate_completed_cycles', 'current_cycle_position',
      'detail', 'earth_anchoring_score', 'earth_lifetimes', 'earth_percentage',
      'earth_soul_age', 'non_earth_lifetimes', 'owner_id', 'raw_closure_units',
      'saved_chart_id', 'soul_age_method_version', 'subject_key', 'subject_label',
      'total_universal_lifetimes', 'universal_soul_age', 'used_mean_node',
      'validated_completed_cycles',
    ]);
  });

  it('stores the subject as a reference, not as chart details', () => {
    expect(ROW.subject_key).toBe('self');
    expect(ROW.saved_chart_id).toBeNull();

    const linked = buildSoulAgeResultRow(RESULT, { ownerId: OWNER, savedChartId: CHART });
    expect(linked.saved_chart_id).toBe(CHART);
    expect(linked.subject_key).toBe(CHART);
  });
});

describe('row reconciles with the engine result', () => {
  it('carries the headline numbers unchanged', () => {
    expect(ROW.total_universal_lifetimes).toBe(RESULT.totalUniversalLifetimes);
    expect(ROW.earth_lifetimes).toBe(RESULT.earthLifetimes);
    expect(ROW.non_earth_lifetimes).toBe(RESULT.nonEarthLifetimes);
    expect(ROW.universal_soul_age).toBe(RESULT.universalSoulAge.label);
    expect(ROW.earth_soul_age).toBe(RESULT.earthSoulAge.label);
    expect(ROW.earth_anchoring_score).toBe(RESULT.earthAnchoring.displayScore);
    expect(ROW.validated_completed_cycles).toBe(RESULT.validatedCompletedCycles);
  });

  it('stamps the methodology version (§21)', () => {
    expect(ROW.soul_age_method_version).toBe(SOUL_AGE_METHOD_VERSION);
  });

  it('records that the True Node was used', () => {
    expect(ROW.used_mean_node).toBe(false);
  });

  it('flags a row computed from the Mean node', () => {
    const meanOnly = calculateSoulAge({
      ...FIXTURE,
      bodies: FIXTURE.bodies.filter((b) => b.name !== 'True Node'),
    });
    const row = buildSoulAgeResultRow(meanOnly, { ownerId: OWNER });
    expect(row.used_mean_node).toBe(true);
    expect(isStaleResult(row)).toBe(true);
  });

  it('treats a current-version True-Node row as fresh', () => {
    expect(isStaleResult(ROW)).toBe(false);
  });

  it('includes the §19 transparency payload', () => {
    expect(ROW.detail.chronometers.length).toBeGreaterThan(0);
    expect(ROW.detail.closure).toHaveLength(8);            // categories A–H
    expect(ROW.detail.earthAnchoring).toHaveLength(5);     // categories A–E
    expect(ROW.detail.keyPoints.length).toBeGreaterThan(0);
    // Every chronometer discloses sign/house/duad/compendium.
    for (const c of ROW.detail.chronometers) {
      expect(c.position).toMatch(/\d+°\d{2}′\d{2}″ \w+/);
      expect(c.duad).toBeTruthy();
      expect(c.compendium).toBeTruthy();
    }
  });
});

describe('row satisfies every database CHECK constraint', () => {
  it('keeps all counts non-negative', () => {
    expect(ROW.total_universal_lifetimes).toBeGreaterThanOrEqual(0);
    expect(ROW.earth_lifetimes).toBeGreaterThanOrEqual(0);
    expect(ROW.non_earth_lifetimes).toBeGreaterThanOrEqual(0);
    expect(ROW.raw_closure_units).toBeGreaterThanOrEqual(0);
    expect(ROW.validated_completed_cycles).toBeGreaterThanOrEqual(0);
  });

  it('keeps Earth lifetimes within universal lifetimes', () => {
    expect(ROW.earth_lifetimes).toBeLessThanOrEqual(ROW.total_universal_lifetimes);
  });

  it('reconciles the two subtotals exactly', () => {
    expect(ROW.non_earth_lifetimes).toBe(ROW.total_universal_lifetimes - ROW.earth_lifetimes);
  });

  it('keeps the percentage and anchoring score in range', () => {
    expect(ROW.earth_percentage).toBeGreaterThanOrEqual(0);
    expect(ROW.earth_percentage).toBeLessThanOrEqual(100);
    expect(ROW.earth_anchoring_score).toBeGreaterThanOrEqual(0);
    expect(ROW.earth_anchoring_score).toBeLessThanOrEqual(100);
  });

  it('fits the declared numeric precisions', () => {
    // earth_percentage NUMERIC(7,4), earth_anchoring_score NUMERIC(6,2),
    // current_cycle_position NUMERIC(12,10)
    const decimals = (n: number) => (String(n).split('.')[1] || '').length;
    expect(decimals(ROW.earth_percentage)).toBeLessThanOrEqual(4);
    expect(decimals(ROW.earth_anchoring_score)).toBeLessThanOrEqual(2);
    expect(decimals(ROW.current_cycle_position)).toBeLessThanOrEqual(10);
  });

  it('satisfies the subject-consistency constraint in both directions', () => {
    const self = buildSoulAgeResultRow(RESULT, { ownerId: OWNER });
    expect(self.saved_chart_id === null && self.subject_key === 'self').toBe(true);

    const linked = buildSoulAgeResultRow(RESULT, { ownerId: OWNER, savedChartId: CHART });
    expect(linked.saved_chart_id !== null && linked.subject_key === linked.saved_chart_id).toBe(true);
  });

  it('truncates an overlong subject label rather than failing the insert', () => {
    const row = buildSoulAgeResultRow(RESULT, { ownerId: OWNER, subjectLabel: 'x'.repeat(500) });
    expect(row.subject_label).toHaveLength(120);
  });
});

describe('zero-lifetime results are storable', () => {
  it('produces a valid row with all-zero counts', () => {
    const zero = calculateSoulAge({
      bodies: [
        { name: 'Sun', longitude: 10 },
        { name: 'Moon', longitude: 40 },
        { name: 'Saturn', longitude: 70 },
        { name: 'Pluto', longitude: 100 },
        { name: 'Neptune', longitude: 130 },
        { name: 'True Node', longitude: 200 },
      ],
      ascendant: 200,
      midheaven: 110,
      birthTimeKnown: true,
    });
    const row = buildSoulAgeResultRow(zero, { ownerId: OWNER });
    expect(row.total_universal_lifetimes).toBe(0);
    expect(row.earth_lifetimes).toBe(0);
    expect(row.non_earth_lifetimes).toBe(0);
    expect(row.earth_percentage).toBe(0);
    expect(JSON.stringify(row)).not.toContain('NaN');
    expect(row.owner_id).toBe(OWNER);
    expect(row.subject_key).toBe('self');
  });
});
