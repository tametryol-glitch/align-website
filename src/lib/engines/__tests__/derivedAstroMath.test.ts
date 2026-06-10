import { describe, it, expect } from 'vitest';
/**
 * Unit tests for the Duad–Compendium Astrocartography math module.
 *
 * Covers (per the feature specification):
 *  - the immutable golden validation example (27°16′ Scorpio)
 *  - the shared cross-platform golden dataset
 *  - expanded vs compact formula equivalence across the full zodiac
 *  - agreement with the EXISTING canonical duadCompendium.ts sign functions
 *  - all 144 duad boundaries (exactly on, just below, just above)
 *  - compendium 12′30″ boundaries
 *  - Pisces→Aries wraparound, normalization, 360°/negative inputs
 *  - NaN / Infinity rejection
 *  - RA quadrant handling + normalization, declination range
 *  - display formatting (the only rounding layer)
 */

import {
  SIGNS,
  ACG_OBLIQUITY_DEG,
  DUAD_MODEL_VERSION,
  COMPENDIUM_MODEL_VERSION,
  COORDINATE_MODEL_VERSION,
  normalizeLongitude360,
  signIndexOf,
  degreeInSign,
  absoluteLongitude,
  duadPosition,
  duadLongitudeCompact,
  compendiumPosition,
  compendiumLongitudeCompact,
  eclipticToEquatorial,
  toDegreesMinutes,
  formatSignDegree,
} from '../derivedAstroMath';
import { calculateDuad, calculateCompendium } from '../duadCompendium';
import golden from './derivedAcgGolden.json';

const LON_TOL = 1e-6;
const ANGLE_TOL = 1e-9;

/** Deterministic pseudo-random generator (no Math.random in tests). */
function makeLcg(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

describe('derivedAstroMath — normalization & validation', () => {
  it('normalizes within range, negatives, multiples, and 360 exactly', () => {
    expect(normalizeLongitude360(0)).toBe(0);
    expect(normalizeLongitude360(359.999999)).toBeCloseTo(359.999999, 9);
    expect(normalizeLongitude360(360)).toBe(0);
    expect(normalizeLongitude360(720.5)).toBeCloseTo(0.5, 9);
    expect(normalizeLongitude360(-10)).toBeCloseTo(350, 9);
    expect(normalizeLongitude360(-360)).toBe(0);
    expect(normalizeLongitude360(-122.8)).toBeCloseTo(237.2, 9);
  });

  it('rejects NaN, infinities, and non-numbers', () => {
    for (const bad of [NaN, Infinity, -Infinity, undefined as any, null as any, '90' as any]) {
      expect(() => normalizeLongitude360(bad)).toThrow(TypeError);
      expect(() => duadPosition(bad)).toThrow(TypeError);
      expect(() => compendiumPosition(bad)).toThrow(TypeError);
      expect(() => eclipticToEquatorial(bad)).toThrow(TypeError);
    }
    expect(() => eclipticToEquatorial(90, NaN)).toThrow(TypeError);
  });

  it('sign index / degree-in-sign / absolute longitude round-trip', () => {
    expect(signIndexOf(0)).toBe(0);
    expect(signIndexOf(29.999999)).toBe(0);
    expect(signIndexOf(30)).toBe(1);
    expect(signIndexOf(237.2666667)).toBe(7); // Scorpio
    expect(degreeInSign(237.2666667)).toBeCloseTo(27.2666667, 6);
    expect(absoluteLongitude(7, 27.2666667)).toBeCloseTo(237.2666667, 9);
    expect(() => absoluteLongitude(12, 0)).toThrow(TypeError);
    expect(() => absoluteLongitude(-1, 0)).toThrow(TypeError);
    expect(() => absoluteLongitude(3, 30)).toThrow(TypeError);
    expect(() => absoluteLongitude(3.5 as any, 0)).toThrow(TypeError);
  });
});

describe('derivedAstroMath — immutable golden example (27°16′ Scorpio)', () => {
  const natal = 237 + 16 / 60; // 237.2666666…

  it('matches the specification exactly within tolerance', () => {
    const duad = duadPosition(natal);
    expect(duad.sign).toBe('Virgo');
    expect(duad.longitude).toBeCloseTo(177.2, 6);
    expect(duad.degreeInSign).toBeCloseTo(27.2, 6);

    const comp = compendiumPosition(natal);
    expect(comp.sign).toBe('Cancer');
    expect(comp.longitude).toBeCloseTo(116.4, 6);
    expect(comp.degreeInSign).toBeCloseTo(26.4, 6);
  });

  it('formats for display as the spec writes it', () => {
    expect(formatSignDegree(natal)).toBe('27°16′ Scorpio');
    expect(formatSignDegree(duadPosition(natal).longitude)).toBe('27°12′ Virgo');
    expect(formatSignDegree(compendiumPosition(natal).longitude)).toBe('26°24′ Cancer');
  });

  it('reports model versions', () => {
    expect(duadPosition(natal).modelVersion).toBe(DUAD_MODEL_VERSION);
    expect(compendiumPosition(natal).modelVersion).toBe(COMPENDIUM_MODEL_VERSION);
    expect(eclipticToEquatorial(natal).modelVersion).toBe(COORDINATE_MODEL_VERSION);
  });
});

describe('derivedAstroMath — shared golden dataset', () => {
  it.each(golden.positions.map((p: any) => [p.label, p]))('%s', (_label, p: any) => {
    const duad = duadPosition(p.natalLongitude);
    const comp = compendiumPosition(p.natalLongitude);
    expect(SIGNS[signIndexOf(p.natalLongitude)]).toBe(p.natalSign);
    expect(duad.sign).toBe(p.duadSign);
    expect(Math.abs(duad.longitude - p.duadLongitude)).toBeLessThanOrEqual(golden.longitudeToleranceDeg);
    expect(comp.sign).toBe(p.compendiumSign);
    expect(Math.abs(comp.longitude - p.compendiumLongitude)).toBeLessThanOrEqual(golden.longitudeToleranceDeg);
  });

  it.each(golden.equatorial.map((e: any) => [e.label, e]))('equatorial: %s', (_label, e: any) => {
    const eq = eclipticToEquatorial(e.longitude, golden.obliquityDeg);
    expect(eq.rightAscension).toBeCloseTo(e.rightAscension, 6);
    expect(eq.declination).toBeCloseTo(e.declination, 6);
  });
});

describe('derivedAstroMath — expanded vs compact equivalence', () => {
  it('agrees across a fine uniform sweep of the full zodiac', () => {
    for (let lon = 0; lon < 360; lon += 0.1) {
      expect(Math.abs(duadPosition(lon).longitude - duadLongitudeCompact(lon))).toBeLessThan(ANGLE_TOL);
      expect(Math.abs(compendiumPosition(lon).longitude - compendiumLongitudeCompact(lon))).toBeLessThan(ANGLE_TOL);
    }
  });

  it('agrees on 10,000 deterministic pseudo-random high-precision inputs', () => {
    const rand = makeLcg(0xa57f0c1d);
    for (let i = 0; i < 10000; i++) {
      const lon = rand() * 360;
      expect(Math.abs(duadPosition(lon).longitude - duadLongitudeCompact(lon))).toBeLessThan(ANGLE_TOL);
      expect(Math.abs(compendiumPosition(lon).longitude - compendiumLongitudeCompact(lon))).toBeLessThan(ANGLE_TOL);
    }
  });
});

describe('derivedAstroMath — agreement with canonical duadCompendium.ts (oracle)', () => {
  it('derived duad and compendium SIGNS match the existing module across the zodiac', () => {
    for (let lon = 0; lon < 360; lon += 0.05) {
      const sign = SIGNS[signIndexOf(lon)];
      const deg = degreeInSign(lon);
      const expectedDuadSign = calculateDuad(sign, deg);
      const duad = duadPosition(lon);
      expect(duad.sign).toBe(expectedDuadSign);
      const expectedCompSign = calculateCompendium(expectedDuadSign, deg);
      expect(compendiumPosition(lon).sign).toBe(expectedCompSign);
    }
  });
});

describe('derivedAstroMath — boundaries', () => {
  it('handles all 144 duad boundaries exactly on, just below, and just above', () => {
    const EPS = 1e-9;
    for (let S = 0; S < 12; S++) {
      for (let k = 0; k < 12; k++) {
        const boundary = 30 * S + 2.5 * k;
        // Exactly on the boundary → duad index k, derived degree 0
        const on = duadPosition(boundary);
        expect(on.signIndex).toBe((S + k) % 12);
        expect(on.degreeInSign).toBeCloseTo(0, 6);
        // Just above → same duad, tiny derived degree
        const above = duadPosition(boundary + EPS);
        expect(above.signIndex).toBe((S + k) % 12);
        // Just below (skip the k=0 case — that's the previous sign) → duad k−1, derived degree ≈ 30
        if (k > 0) {
          const below = duadPosition(boundary - EPS);
          expect(below.signIndex).toBe((S + k - 1) % 12);
          expect(below.degreeInSign).toBeGreaterThan(29.999);
        }
      }
    }
  });

  it('handles compendium 12′30″ (0.2083…°) boundaries within a duad', () => {
    // 2.5/12 is NOT exactly representable in binary floating point, so exact
    // "on-boundary" inputs are ambiguous by construction. Probe just above
    // and just below each boundary instead — the spec-relevant behavior.
    const SUB = 2.5 / 12;
    for (let j = 0; j < 12; j++) {
      const justAbove = compendiumPosition(j * SUB + 1e-9);
      expect(justAbove.signIndex).toBe(j % 12);
      expect(justAbove.degreeInSign).toBeLessThan(0.001);
      if (j > 0) {
        const justBelow = compendiumPosition(j * SUB - 1e-9);
        expect(justBelow.signIndex).toBe((j - 1) % 12);
        expect(justBelow.degreeInSign).toBeGreaterThan(29.999);
      }
    }
  });

  it('handles Pisces→Aries wraparound and negative input equivalently', () => {
    const a = duadPosition(359.9);
    const b = duadPosition(-0.1);
    expect(a.longitude).toBeCloseTo(b.longitude, 9);
    expect(a.sign).toBe(b.sign);
    expect(duadPosition(360).longitude).toBeCloseTo(duadPosition(0).longitude, 12);
  });
});

describe('derivedAstroMath — equatorial coordinates', () => {
  it('right ascension lands in the correct quadrant for each ecliptic quadrant', () => {
    const cases: Array<[number, number, number]> = [
      [45, 0, 90],    // Q1
      [135, 90, 180], // Q2
      [225, 180, 270],// Q3
      [315, 270, 360],// Q4
    ];
    for (const [lon, lo, hi] of cases) {
      const { rightAscension } = eclipticToEquatorial(lon);
      expect(rightAscension).toBeGreaterThan(lo);
      expect(rightAscension).toBeLessThan(hi);
    }
  });

  it('declination never exceeds the obliquity under the zero-latitude model', () => {
    const rand = makeLcg(0x5eed5eed);
    for (let i = 0; i < 2000; i++) {
      const { declination } = eclipticToEquatorial(rand() * 360);
      expect(Math.abs(declination)).toBeLessThanOrEqual(ACG_OBLIQUITY_DEG + 1e-9);
    }
  });

  it('RA is always normalized to [0, 360)', () => {
    for (let lon = 0; lon < 360; lon += 1) {
      const { rightAscension } = eclipticToEquatorial(lon);
      expect(rightAscension).toBeGreaterThanOrEqual(0);
      expect(rightAscension).toBeLessThan(360);
    }
  });

  it('uses the engine obliquity by default and a supplied one when given', () => {
    expect(eclipticToEquatorial(90).declination).toBeCloseTo(ACG_OBLIQUITY_DEG, 9);
    expect(eclipticToEquatorial(90, 23.43678).declination).toBeCloseTo(23.43678, 9);
    expect(eclipticToEquatorial(90).obliquity).toBe(ACG_OBLIQUITY_DEG);
  });
});

describe('derivedAstroMath — display formatting', () => {
  it('converts degrees to degree-minute pairs with carry', () => {
    expect(toDegreesMinutes(27.2666666667)).toEqual({ degrees: 27, minutes: 16 });
    expect(toDegreesMinutes(26.4)).toEqual({ degrees: 26, minutes: 24 });
    expect(toDegreesMinutes(0)).toEqual({ degrees: 0, minutes: 0 });
    expect(toDegreesMinutes(29.9999)).toEqual({ degrees: 30, minutes: 0 }); // carry case
    expect(() => toDegreesMinutes(NaN)).toThrow(TypeError);
    expect(() => toDegreesMinutes(-1)).toThrow(TypeError);
  });
});
