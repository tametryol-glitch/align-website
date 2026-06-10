import { describe, it, expect } from 'vitest';
/**
 * Tests for derived_astrocartography_projection_v1 (derivedAcgLines.ts).
 *
 * Reference values were computed INDEPENDENTLY in Python (CPython math lib)
 * from the same published formulas — a cross-implementation check, not a
 * copy of this module's own output. GMST is additionally validated against
 * the canonical J2000.0 epoch value (280.46062°, USNO).
 *
 * Fixture moment: 2000-01-01T12:00:00Z. Fixture body: the immutable spec
 * golden position 27°16′ Scorpio (λ = 237.2666̄°), whose layers are
 * duad 177.2° and compendium 116.4°.
 */

import {
  gmstAtMoment,
  projectLongitudeToLines,
  generateAcgLinesCompat,
  generateDerivedAcgLines,
  ACG_BODIES,
  DERIVED_PROJECTION_VERSION,
} from '../derivedAcgLines';
import { DUAD_MODEL_VERSION, COMPENDIUM_MODEL_VERSION } from '../derivedAstroMath';

const J2000_NOON = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
const NATAL_LON = 237 + 16 / 60;

// Independently computed (Python) reference values for the fixture moment:
const REF = {
  gmst: 280.46061830685693,
  natal: { ra: 234.9839690644, dec: -19.5487515007, mcLon: -45.4766492424, icLon: 134.5233507576 },
  duad: { lon: 177.2, ra: 177.4307268977, dec: 1.1134032412, mcLon: -103.0298914092 },
  compendium: { lon: 116.4, ra: 118.4156367654, dec: 20.8727594893, mcLon: -162.0449815414 },
};

const TOL = 1e-6;

function makeLcg(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

describe('derivedAcgLines — sidereal time', () => {
  it('matches the canonical GMST at the J2000.0 epoch', () => {
    const g = gmstAtMoment(J2000_NOON);
    expect(g).toBeCloseTo(REF.gmst, 6); // vs independent Python computation
    expect(Math.abs(g - 280.46062)).toBeLessThan(0.001); // vs USNO canonical value
  });
});

describe('derivedAcgLines — projection against independent reference values', () => {
  const gmst = gmstAtMoment(J2000_NOON);

  it('natal layer: MC and IC longitudes match the Python reference', () => {
    const lines = projectLongitudeToLines(NATAL_LON, gmst);
    const mc = lines.find((l) => l.lineType === 'MC')!;
    const ic = lines.find((l) => l.lineType === 'IC')!;
    expect(mc.points[0].lon).toBeCloseTo(REF.natal.mcLon, 6);
    expect(ic.points[0].lon).toBeCloseTo(REF.natal.icLon, 6);
    // MC line is vertical: every sampled point shares one longitude
    expect(new Set(mc.points.map((p) => p.lon)).size).toBe(1);
    expect(mc.points).toHaveLength(71); // −70…70 at 2° steps
  });

  it('duad layer: MC longitude matches the Python reference', () => {
    const mc = projectLongitudeToLines(REF.duad.lon, gmst).find((l) => l.lineType === 'MC')!;
    expect(mc.points[0].lon).toBeCloseTo(REF.duad.mcLon, 6);
  });

  it('compendium layer: MC longitude matches the Python reference', () => {
    const mc = projectLongitudeToLines(REF.compendium.lon, gmst).find((l) => l.lineType === 'MC')!;
    expect(mc.points[0].lon).toBeCloseTo(REF.compendium.mcLon, 6);
  });

  it('all four line types exist for zero-latitude-model declinations', () => {
    // Under zero_ecliptic_latitude_model_v1, |δ| ≤ ε ≈ 23.44°, and at the
    // sampled extreme |φ| = 66°, |tan φ · tan δ| < 1 — so AC/DC always exist.
    const lines = projectLongitudeToLines(NATAL_LON, gmst);
    expect(lines.map((l) => l.lineType).sort()).toEqual(['ASC', 'DSC', 'IC', 'MC']);
    const asc = lines.find((l) => l.lineType === 'ASC')!;
    expect(asc.points).toHaveLength(67); // −66…66 at 2° steps
  });
});

describe('derivedAcgLines — natal compatibility generator', () => {
  it('produces 4 lines per supported body in engine order with engine colors', () => {
    const planets = (ACG_BODIES as readonly string[]).map((name, i) => ({
      name,
      longitude: (i * 36 + 7.25) % 360,
    }));
    const lines = generateAcgLinesCompat(planets, J2000_NOON);
    expect(lines).toHaveLength(40);
    expect(lines[0]).toEqual(
      expect.objectContaining({ planet: 'Sun', lineType: 'MC', color: '#F59E0B' }),
    );
    // Order per body: MC, IC, ASC, DSC — matching the existing engine
    expect(lines.slice(0, 4).map((l) => l.lineType)).toEqual(['MC', 'IC', 'ASC', 'DSC']);
  });

  it('skips unsupported bodies exactly like the existing engine', () => {
    const lines = generateAcgLinesCompat(
      [{ name: 'Chiron', longitude: 100 }, { name: 'Sun', longitude: 100 }],
      J2000_NOON,
    );
    expect(lines.every((l) => l.planet === 'Sun')).toBe(true);
  });
});

describe('derivedAcgLines — derived layer generation', () => {
  const planets = [{ name: 'Sun', longitude: NATAL_LON }];

  it('returns nothing when no layers are requested (flags-off cost: zero)', () => {
    expect(generateDerivedAcgLines(planets, J2000_NOON, { layers: [] })).toEqual([]);
  });

  it('tags lines with layer, parent planet, projected longitude, and model version', () => {
    const lines = generateDerivedAcgLines(planets, J2000_NOON, { layers: ['duad', 'compendium'] });
    expect(lines).toHaveLength(8); // 4 duad + 4 compendium
    const duadMc = lines.find((l) => l.layer === 'duad' && l.lineType === 'MC')!;
    expect(duadMc.planet).toBe('Sun'); // labeled by parent — never a ghost planet
    expect(duadMc.projectedLongitude).toBeCloseTo(REF.duad.lon, 6);
    expect(duadMc.modelVersion).toBe(DUAD_MODEL_VERSION);
    expect(duadMc.points[0].lon).toBeCloseTo(REF.duad.mcLon, 6);

    const compMc = lines.find((l) => l.layer === 'compendium' && l.lineType === 'MC')!;
    expect(compMc.projectedLongitude).toBeCloseTo(REF.compendium.lon, 6);
    expect(compMc.modelVersion).toBe(COMPENDIUM_MODEL_VERSION);
    expect(compMc.points[0].lon).toBeCloseTo(REF.compendium.mcLon, 6);
    expect(DERIVED_PROJECTION_VERSION).toBe('derived_astrocartography_projection_v1');
  });

  it('respects the bodies filter and generates only requested layers', () => {
    const many = [
      { name: 'Sun', longitude: 10 },
      { name: 'Moon', longitude: 120 },
      { name: 'Venus', longitude: 250 },
    ];
    const only = generateDerivedAcgLines(many, J2000_NOON, { layers: ['duad'], bodies: ['Moon'] });
    expect(only.every((l) => l.planet === 'Moon' && l.layer === 'duad')).toBe(true);
    expect(only).toHaveLength(4);
  });

  it('isolates invalid bodies without poisoning valid ones (fail-safe)', () => {
    const mixed = [
      { name: 'Sun', longitude: NaN },
      { name: 'Moon', longitude: Infinity },
      { name: 'NotAPlanet', longitude: 50 },
      { name: 'Venus', longitude: 200 },
    ];
    const lines = generateDerivedAcgLines(mixed, J2000_NOON, { layers: ['duad', 'compendium'] });
    expect(lines.length).toBe(8); // Venus only
    expect(lines.every((l) => l.planet === 'Venus')).toBe(true);
  });

  // Heavy sweep (~500k assertions) — explicit timeout for vitest's 5s default.
  it('never emits NaN or out-of-range coordinates across randomized inputs', () => {
    const rand = makeLcg(0xacc0ffee);
    for (let trial = 0; trial < 25; trial++) {
      const date = new Date(Date.UTC(
        1940 + Math.floor(rand() * 100),
        Math.floor(rand() * 12),
        1 + Math.floor(rand() * 28),
        Math.floor(rand() * 24),
        Math.floor(rand() * 60),
      ));
      const bodies = (ACG_BODIES as readonly string[]).map((name) => ({
        name,
        longitude: rand() * 360,
      }));
      const lines = generateDerivedAcgLines(bodies, date, { layers: ['duad', 'compendium'] });
      expect(lines.length).toBe(80); // 10 bodies × 2 layers × 4 line types
      for (const line of lines) {
        for (const p of line.points) {
          expect(Number.isFinite(p.lat)).toBe(true);
          expect(Number.isFinite(p.lon)).toBe(true);
          expect(p.lat).toBeGreaterThanOrEqual(-90);
          expect(p.lat).toBeLessThanOrEqual(90);
          expect(p.lon).toBeGreaterThanOrEqual(-180);
          expect(p.lon).toBeLessThanOrEqual(180);
        }
      }
    }
  }, 60000); // heavy sweep — both jest and vitest accept a per-test timeout here

  it('is deterministic — identical inputs produce identical output', () => {
    const a = generateDerivedAcgLines(planets, J2000_NOON, { layers: ['duad', 'compendium'] });
    const b = generateDerivedAcgLines(planets, J2000_NOON, { layers: ['duad', 'compendium'] });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
