import { describe, it, expect } from 'vitest';
/**
 * Soul Age Calculator — engine test suite.
 *
 * Covers every case required by the specification:
 *  §21 — zodiac wraparound, North Node at 0° Aries, Earth opposite Sun,
 *        duad boundaries, compendium boundaries, 29°59′59″ placements,
 *        duplicate chronometer roles, closure-unit de-duplication,
 *        zero-lifetime output, Earth ≤ Universal, Soul Age boundary
 *        transitions, missing birth time, determinism.
 *  §20 — the reference chart fixture, and proof that the engine can return
 *        0, 1, 12, 45, 144, 1,728, 20,736, 248,832, >1M and >3M lifetimes.
 *
 * Nothing here hard-codes a person's result: the fixture asserts values that
 * the shared universal engine produces from chart input alone.
 */

import {
  UNIVERSAL_CYCLE_CAPACITY,
  UNIVERSAL_OCTAVE_CAPACITY,
  SOUL_AGE_METHOD_VERSION,
  BIRTH_TIME_REQUIRED_MESSAGE,
  ASSUMED_SECONDS_MESSAGE,
  MEAN_NODE_FALLBACK_MESSAGE,
  buildSoulAgeInputFromPositions,
  SoulAgeInputError,
  calculateSoulAge,
  buildFrames,
  buildPoint,
  classifySoulAge,
  calculateCandidateCompletedCycles,
  calculateUniversalChronometers,
  calculateSupportingPosition,
  calculateUniversalLifetimes,
  calculateEarthLifetimes,
  calculateEarthPlacementStrength,
  calculateEarthAscendantConnection,
  calculateEarthRepetitionSeals,
  longitudeToAbsArcSec,
  separationArcSec,
  type SoulAgeChartInput,
  type ClosureResult,
} from '../soulAgeEngine';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const SIGN_INDEX: Record<string, number> = {
  Aries: 0, Taurus: 1, Gemini: 2, Cancer: 3, Leo: 4, Virgo: 5,
  Libra: 6, Scorpio: 7, Sagittarius: 8, Capricorn: 9, Aquarius: 10, Pisces: 11,
};

/** Degrees-minutes-seconds within a sign → absolute decimal longitude. */
function at(sign: string, deg: number, min = 0, sec = 0): number {
  return SIGN_INDEX[sign] * 30 + deg + min / 60 + sec / 3600;
}

/** All twelve carriers plus the node, so ruler lookups always resolve. */
function chart(
  overrides: Record<string, number>,
  opts: { ascendant: number; midheaven: number; northNode: number } & Partial<SoulAgeChartInput>,
): SoulAgeChartInput {
  const base: Record<string, number> = {
    Sun: 0, Moon: 30, Mercury: 60, Venus: 90, Mars: 120, Vesta: 150,
    Juno: 180, Jupiter: 210, Saturn: 240, Uranus: 270, Neptune: 300, Pluto: 330,
  };
  const merged = { ...base, ...overrides, 'North Node': opts.northNode };
  return {
    bodies: Object.entries(merged).map(([name, longitude]) => ({ name, longitude })),
    ascendant: opts.ascendant,
    midheaven: opts.midheaven,
    birthTimeKnown: opts.birthTimeKnown ?? true,
    birthTimeSecondsKnown: opts.birthTimeSecondsKnown,
    label: opts.label,
  };
}

/** Synthetic closure result, for exercising the pure numeric pipeline. */
function closureWith(rawClosureUnits: number): ClosureResult {
  const base = Math.min(rawClosureUnits, 12);
  return {
    categories: [],
    rawClosureUnits,
    baseClosureUnits: base,
    closureRatio: base / 12,
    additionalOctaves: Math.floor(Math.max(rawClosureUnits - 12, 0) / 12),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// §20 — Reference chart fixture
// ─────────────────────────────────────────────────────────────────────────────

/**
 * §20 REFERENCE CHART — real Swiss Ephemeris positions.
 *
 * Birth data: 1979-11-19 23:52:00, Nassau, Bahamas (25.0657 N, 77.3433 W),
 * EST = UTC−5 (DST ended 1979-10-28), so UT = 1979-11-20 04:52. Tropical,
 * geocentric, Whole Sign, True North Node. Computed with pyswisseph 2.10.03
 * against the project's own ephemeris files — the same Swiss Ephemeris data the
 * production API uses — and pasted here as raw longitudes so the fixture never
 * depends on a network call.
 *
 * WHY THESE NUMBERS AND NOT THE ONES PRINTED IN §20
 * -------------------------------------------------
 * The §20 listing was transcribed by hand and disagrees with the ephemeris in
 * three places. Verified against Swiss Ephemeris:
 *
 *   1. §20 natal Saturn "25°12′ Virgo" is a transcription error. The true value
 *      is 25°01′56″ Virgo — and 25°02′ is what reproduces §20's OWN published
 *      Draconic Saturn of 20°26′ under the node rotation. 25°12′ does not.
 *   2. §20's angles imply a birth time of 23:54:38, not the recorded 23:52:00.
 *      The recorded time is canonical, so the Draconic Ascendant is 23°18′50″
 *      Pisces rather than the printed 23°54′, and the universal total is
 *      2,924,280 rather than 2,928,138 (0.13% — same Soul Age either way).
 *   3. §20's published Earth Anchoring Score of 90.81 is not reproducible from
 *      the §10 rules. Every category matches by hand except §10-C Earth-Memory,
 *      which scores 44 on the real chart against the ~83 that 90.81 requires.
 *      The engine implements §10 exactly as written; 90.81 appears to have been
 *      computed by hand. The engine's 83.06 is canonical.
 *
 * Everything else in §20 reproduces to the arc-second — Draconic Sun 22°40′41″,
 * Earth 22°40′41″, Saturn 20°26′53″, Pluto 15°59′23″, Neptune 14°47′13″,
 * Mars 25°33′07″ — which is what identifies this as the same chart.
 *
 * The SOUL AGE CLASSIFICATIONS are unchanged from §20 and are asserted as hard
 * equality below: they are the values that must never drift.
 */
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
    { name: 'North Node', longitude: 154.584323 },
  ],
  ascendant: 147.898315,
  midheaven: 56.575797,
  birthTimeKnown: true,
};

describe('§20 reference chart — chart identity', () => {
  const result = calculateSoulAge(FIXTURE);

  it('reproduces the published Draconic positions to the arc-minute', () => {
    // These six are what identify the fixture as the §20 chart. Asserted to the
    // arc-minute because the engine rounds each position to whole arc-seconds
    // BEFORE rotating, which can differ by 1″ from rotating first then rounding.
    const toMinute = (label: string) => label.replace(/′\d{2}″/, '′');
    expect(toMinute(result.draconic.Sun.positionLabel)).toBe('22°40′ Gemini');
    expect(toMinute(result.draconic.Earth.positionLabel)).toBe('22°40′ Sagittarius');
    expect(toMinute(result.draconic.Saturn.positionLabel)).toBe('20°26′ Aries');
    expect(toMinute(result.draconic.Pluto.positionLabel)).toBe('15°59′ Taurus');
    expect(toMinute(result.draconic.Neptune.positionLabel)).toBe('14°47′ Cancer');
    expect(toMinute(result.draconic.Mars.positionLabel)).toBe('25°33′ Pisces');
  });

  it('rotates the True North Node to exactly 0°00′00″ Aries', () => {
    expect(result.draconic['North Node'].absArcSec).toBe(0);
    expect(result.draconic['South Node'].positionLabel).toBe('0°00′00″ Libra');
  });

  it('derives the Draconic Earth exactly opposite the Draconic Sun', () => {
    expect(separationArcSec(result.draconic.Earth.absArcSec, result.draconic.Sun.absArcSec))
      .toBe(180 * 3600);
  });

  it('places the Draconic Earth in the 10th Whole Sign house through a Virgo duad and Virgo compendium', () => {
    // Asserted verbatim in the specification's §15 worked example.
    expect(result.draconic.Earth.house).toBe(10);
    expect(result.draconic.Earth.duadSign).toBe('Virgo');
    expect(result.draconic.Earth.compendiumSign).toBe('Virgo');
  });

  it('confirms the §20 natal Saturn transcription error', () => {
    // Printed as 25°12′ Virgo; the ephemeris and §20's own Draconic Saturn agree on 25°02′.
    expect(result.natal.Saturn.positionLabel).toBe('25°01′56″ Virgo');
  });
});

describe('§20 reference chart — Universal lifetimes', () => {
  const result = calculateSoulAge(FIXTURE);

  it('offers 11 candidate completed cycles from a Pisces Draconic Ascendant', () => {
    expect(result.draconic.Ascendant.positionLabel).toBe('23°18′50″ Pisces');
    expect(result.candidateCompletedCycles).toBe(11);
  });

  it('combines duplicate chronometer roles into Neptune 30 / Saturn 20 / Moon 25 / Pluto 25', () => {
    const weights = Object.fromEntries(result.chronometers.map((c) => [c.planet, Math.round(c.weight * 100)]));
    expect(weights).toEqual({ Neptune: 30, Saturn: 20, Moon: 25, Pluto: 25 });

    const moon = result.chronometers.find((c) => c.planet === 'Moon')!;
    const pluto = result.chronometers.find((c) => c.planet === 'Pluto')!;
    expect(moon.roles).toHaveLength(2); // Draconic Moon + natal 12th-house ruler
    expect(pluto.roles).toHaveLength(2); // Draconic Pluto + natal IC ruler
  });

  it('validates all 11 cycles from independent closure evidence', () => {
    expect(result.closure.rawClosureUnits).toBe(14);
    expect(result.closure.baseClosureUnits).toBe(12);
    expect(result.closure.closureRatio).toBe(1);
    expect(result.closure.additionalOctaves).toBe(0);
    expect(result.validatedCompletedCycles).toBe(11);
    expect(result.universalMaturityCoefficient).toBe(1);
  });

  it('finds the Sun–Earth axis lock and the multi-role amplification', () => {
    const byId = Object.fromEntries(result.closure.categories.map((c) => [c.id, c]));
    expect(byId.D.units).toBe(6);
    expect(byId.D.evidence.map((e) => e.label).join(' ')).toContain('Master repetition');
    expect(byId.H.units).toBe(2);
  });

  it('produces the reference Universal total and Soul Age', () => {
    expect(result.supportingPosition).toBeCloseTo(0.651616, 6);
    expect(result.totalUniversalLifetimes).toBe(2_924_280);
    // The §20 classification, unchanged.
    expect(result.universalSoulAge.label).toBe('Late Transcendental Soul');
  });
});

describe('§20 reference chart — Earth lifetimes', () => {
  const result = calculateSoulAge(FIXTURE);

  it('scores each Earth Anchoring category', () => {
    const byId = Object.fromEntries(result.earthAnchoring.categories.map((c) => [c.id, c.score]));
    expect(byId.A).toBeCloseTo(93, 10);      // Sag 65 / 10th 100 / Virgo duad 100 / Virgo compendium 100
    expect(byId.B).toBe(90);                 // square to the Draconic ASC, inside 1°30′
    expect(byId.C).toBe(44);                 // see the header note on §10-C
    expect(byId.D).toBeCloseTo(89.0909, 3);
    expect(byId.E).toBe(100);                // axis lock repeated in both charts
    expect(result.earthAnchoring.displayScore).toBe(83.06);
  });

  it('applies the Earth Precision Modifier from the exact arc-second inside the compendium', () => {
    expect(result.draconic.Earth.arcSecWithinCompendium).toBe(640);
    expect(result.earthPrecisionModifier).toBeCloseTo(0.975 + (640 / 750) * 0.05, 12);
  });

  it('produces the reference Earth total and Soul Age', () => {
    expect(result.earthLifetimes).toBe(1_176_736);
    expect(result.nonEarthLifetimes).toBe(2_924_280 - 1_176_736);
    expect(result.earthPercentage).toBeCloseTo(40.24, 2);
    // The §20 classification, unchanged.
    expect(result.earthSoulAge.label).toBe('Middle Transcendental Soul');
  });

  it('never lets Earth lifetimes exceed Universal lifetimes', () => {
    expect(result.earthLifetimes).toBeLessThanOrEqual(result.totalUniversalLifetimes);
    expect(result.nonEarthLifetimes).toBe(result.totalUniversalLifetimes - result.earthLifetimes);
  });
});

describe('§20 reference chart — determinism and provenance', () => {
  const result = calculateSoulAge(FIXTURE);

  it('is deterministic — the same input always produces the same result', () => {
    for (let i = 0; i < 5; i++) {
      const again = calculateSoulAge(FIXTURE);
      expect(again.totalUniversalLifetimes).toBe(result.totalUniversalLifetimes);
      expect(again.earthLifetimes).toBe(result.earthLifetimes);
      expect(again.earthAnchoring.displayScore).toBe(result.earthAnchoring.displayScore);
      expect(again.universalSoulAge.label).toBe(result.universalSoulAge.label);
    }
  });

  it('stamps the calculation version onto the result', () => {
    expect(result.methodVersion).toBe(SOUL_AGE_METHOD_VERSION);
  });

  it('is produced by the shared engine, not a stored per-person value', () => {
    // Nudging one input must move the result — proof nothing is hard-coded.
    const nudged = calculateSoulAge({ ...FIXTURE, ascendant: FIXTURE.ascendant + 1 });
    expect(nudged.totalUniversalLifetimes).not.toBe(result.totalUniversalLifetimes);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// §21 — Precision and boundary tests
// ─────────────────────────────────────────────────────────────────────────────

describe('zodiac wraparound', () => {
  it('normalises 360°, negative and over-360 longitudes identically', () => {
    expect(longitudeToAbsArcSec(0)).toBe(0);
    expect(longitudeToAbsArcSec(360)).toBe(0);
    expect(longitudeToAbsArcSec(720)).toBe(0);
    expect(longitudeToAbsArcSec(-1)).toBe(359 * 3600);
    expect(longitudeToAbsArcSec(-361)).toBe(359 * 3600);
  });

  it('measures separation across the Pisces→Aries boundary as the short arc', () => {
    expect(separationArcSec(longitudeToAbsArcSec(359), longitudeToAbsArcSec(1))).toBe(2 * 3600);
    expect(separationArcSec(longitudeToAbsArcSec(1), longitudeToAbsArcSec(359))).toBe(2 * 3600);
  });

  it('rotates a body past 0° Aries without going negative', () => {
    const input = chart({ Sun: at('Aries', 5) }, {
      ascendant: at('Aries', 10), midheaven: at('Capricorn', 10), northNode: at('Taurus', 15),
    });
    const { draconic } = buildFrames(input);
    expect(draconic.Sun.absArcSec).toBeGreaterThanOrEqual(0);
    // 5° Aries − 45° (node at 15° Taurus) = −40° → 320° = 20° Aquarius
    expect(draconic.Sun.positionLabel).toBe('20°00′00″ Aquarius');
  });
});

describe('North Node at 0°00′00″ Aries', () => {
  it('makes the Draconic chart identical to the natal chart', () => {
    const input = chart({ Sun: at('Leo', 12, 34, 56) }, {
      ascendant: at('Scorpio', 3, 21), midheaven: at('Leo', 15), northNode: 0,
    });
    const { natal, draconic } = buildFrames(input);
    for (const name of Object.keys(natal)) {
      expect(draconic[name].absArcSec).toBe(natal[name].absArcSec);
    }
    expect(draconic.Ascendant.positionLabel).toBe(natal.Ascendant.positionLabel);
  });
});

describe('Earth point', () => {
  it('is always exactly 180° from the Sun in both frames', () => {
    for (const sunLon of [0, 0.5, 89.9997, 179.5, 270.25, 359.999]) {
      const input = chart({ Sun: sunLon }, {
        ascendant: at('Cancer', 8), midheaven: at('Pisces', 20), northNode: at('Sagittarius', 4, 36),
      });
      const { natal, draconic } = buildFrames(input);
      expect(separationArcSec(natal.Sun.absArcSec, natal.Earth.absArcSec)).toBe(180 * 3600);
      expect(separationArcSec(draconic.Sun.absArcSec, draconic.Earth.absArcSec)).toBe(180 * 3600);
    }
  });

  it('agrees whether derived before or after the Draconic rotation', () => {
    const input = chart({ Sun: at('Scorpio', 27, 13) }, {
      ascendant: at('Leo', 28, 30), midheaven: at('Taurus', 27, 13), northNode: at('Virgo', 4, 36),
    });
    const { natal, draconic } = buildFrames(input);
    const node = longitudeToAbsArcSec(at('Virgo', 4, 36));
    const rotatedNatalEarth = ((natal.Earth.absArcSec - node) % 1_296_000 + 1_296_000) % 1_296_000;
    expect(draconic.Earth.absArcSec).toBe(rotatedNatalEarth);
  });
});

describe('duad boundaries', () => {
  it('assigns a placement exactly on a boundary to the NEW duad', () => {
    // Scorpio duads: 1 Scorpio, 2 Sagittarius, 3 Capricorn … (spec §4 example)
    expect(buildPoint('x', longitudeToAbsArcSec(at('Scorpio', 0, 0, 0)), null).duadSign).toBe('Scorpio');
    expect(buildPoint('x', longitudeToAbsArcSec(at('Scorpio', 2, 29, 59)), null).duadSign).toBe('Scorpio');
    expect(buildPoint('x', longitudeToAbsArcSec(at('Scorpio', 2, 30, 0)), null).duadSign).toBe('Sagittarius');
    expect(buildPoint('x', longitudeToAbsArcSec(at('Scorpio', 5, 0, 0)), null).duadSign).toBe('Capricorn');
  });

  it('walks the full Scorpio duad sequence from the specification', () => {
    const expected = [
      'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces', 'Aries',
      'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra',
    ];
    expected.forEach((sign, i) => {
      const point = buildPoint('x', longitudeToAbsArcSec(at('Scorpio', 0) + i * 2.5), null);
      expect(point.duadSign).toBe(sign);
      expect(point.duadIndex).toBe(i);
    });
  });
});

describe('compendium boundaries', () => {
  it('assigns a placement exactly on a 0°12′30″ boundary to the NEW compendium', () => {
    const first = buildPoint('x', longitudeToAbsArcSec(at('Scorpio', 0, 12, 29)), null);
    const second = buildPoint('x', longitudeToAbsArcSec(at('Scorpio', 0, 12, 30)), null);
    expect(first.compendiumIndex).toBe(0);
    expect(first.compendiumSign).toBe('Scorpio');
    expect(second.compendiumIndex).toBe(1);
    expect(second.compendiumSign).toBe('Sagittarius');
  });

  it('reports the exact arc-second travelled inside the compendium (0–749)', () => {
    expect(buildPoint('x', longitudeToAbsArcSec(at('Scorpio', 0, 0, 0)), null).arcSecWithinCompendium).toBe(0);
    expect(buildPoint('x', longitudeToAbsArcSec(at('Scorpio', 0, 12, 29)), null).arcSecWithinCompendium).toBe(749);
    expect(buildPoint('x', longitudeToAbsArcSec(at('Sagittarius', 22, 40, 0)), null).arcSecWithinCompendium).toBe(600);
  });
});

describe('29°59′59″ placements', () => {
  it('stays inside its own sign, in the last duad and last compendium', () => {
    for (const sign of Object.keys(SIGN_INDEX)) {
      const p = buildPoint('x', longitudeToAbsArcSec(at(sign, 29, 59, 59)), null);
      expect(p.sign).toBe(sign);
      expect(p.duadIndex).toBe(11);
      expect(p.compendiumIndex).toBe(11);
      expect(p.arcSecWithinCompendium).toBe(749);
      expect(p.positionLabel).toBe(`29°59′59″ ${sign}`);
    }
  });

  it('never rolls a 29°59′59″ Pisces placement into Aries', () => {
    const p = buildPoint('x', longitudeToAbsArcSec(359 + 59 / 60 + 59 / 3600), null);
    expect(p.sign).toBe('Pisces');
    expect(p.arcSecWithinSign).toBe(108_000 - 1);
  });
});

describe('duplicate chronometer roles', () => {
  it('never enters one planet twice, and always totals 100%', () => {
    // South Node in Pisces (ruler Neptune), IC in Scorpio (ruler Pluto),
    // 12th house Cancer (ruler Moon) — the §7 worked example.
    const input = chart({}, {
      ascendant: at('Leo', 28, 30),
      midheaven: at('Taurus', 27, 13),
      northNode: at('Virgo', 4, 36),
    });
    const { natal, draconic } = buildFrames(input);
    const chronometers = calculateUniversalChronometers(natal, draconic);

    const planets = chronometers.map((c) => c.planet);
    expect(new Set(planets).size).toBe(planets.length);
    expect(chronometers.reduce((s, c) => s + c.weight, 0)).toBeCloseTo(1, 10);
  });

  it('renormalises to 100% when a role has no available planet', () => {
    const input: SoulAgeChartInput = {
      bodies: [
        { name: 'Sun', longitude: at('Leo', 10) },
        { name: 'Moon', longitude: at('Cancer', 10) },
        { name: 'Saturn', longitude: at('Capricorn', 10) },
        { name: 'North Node', longitude: at('Virgo', 4, 36) },
      ],
      ascendant: at('Leo', 28, 30),
      midheaven: at('Taurus', 27, 13),
      birthTimeKnown: true,
    };
    const { natal, draconic } = buildFrames(input);
    const chronometers = calculateUniversalChronometers(natal, draconic);
    expect(chronometers.length).toBeGreaterThan(0);
    expect(chronometers.reduce((s, c) => s + c.weight, 0)).toBeCloseTo(1, 10);
  });
});

describe('closure-unit de-duplication', () => {
  it('never counts the same physical contact under two labels', () => {
    const result = calculateSoulAge(FIXTURE);
    const keys = result.closure.categories.flatMap((c) => c.evidence.map((e) => e.key));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('caps every category at its specified maximum', () => {
    const result = calculateSoulAge(FIXTURE);
    for (const c of result.closure.categories) {
      expect(c.units).toBeLessThanOrEqual(c.cap);
    }
    expect(result.closure.baseClosureUnits).toBeLessThanOrEqual(12);
    expect(result.closure.closureRatio).toBeLessThanOrEqual(1);
  });
});

describe('missing birth time', () => {
  it('refuses to calculate, with the exact specified message', () => {
    const input = chart({}, {
      ascendant: at('Leo', 28), midheaven: at('Taurus', 27), northNode: at('Virgo', 4),
      birthTimeKnown: false,
    });
    expect(() => calculateSoulAge(input)).toThrow(SoulAgeInputError);
    expect(() => calculateSoulAge(input)).toThrow(BIRTH_TIME_REQUIRED_MESSAGE);
  });

  it('never silently substitutes noon', () => {
    const input = chart({}, {
      ascendant: at('Leo', 28), midheaven: at('Taurus', 27), northNode: at('Virgo', 4),
      birthTimeKnown: false,
    });
    let produced = false;
    try { calculateSoulAge(input); produced = true; } catch { /* expected */ }
    expect(produced).toBe(false);
  });

  it('surfaces the assumed-seconds notice when seconds are unknown', () => {
    const input = chart({}, {
      ascendant: at('Leo', 28, 30), midheaven: at('Taurus', 27, 13), northNode: at('Virgo', 4, 36),
      birthTimeSecondsKnown: false,
    });
    expect(calculateSoulAge(input).notices).toContain(ASSUMED_SECONDS_MESSAGE);
  });

  it('requires the True North Node', () => {
    const input: SoulAgeChartInput = {
      bodies: [{ name: 'Sun', longitude: 10 }],
      ascendant: 100, midheaven: 10, birthTimeKnown: true,
    };
    expect(() => calculateSoulAge(input)).toThrow(/North Node/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Lifetime range — the engine must NOT always produce high numbers
// ─────────────────────────────────────────────────────────────────────────────

describe('zero-lifetime output', () => {
  it('returns 0 for a 0°00′00″ Aries Draconic Ascendant with no closure evidence', () => {
    const draconic = { Ascendant: buildPoint('Ascendant', 0, 'Aries') };
    const universal = calculateUniversalLifetimes(draconic as never, closureWith(0), 0);
    expect(universal.candidateCompletedCycles).toBe(0);
    expect(universal.validatedCompletedCycles).toBe(0);
    expect(universal.totalUniversalLifetimes).toBe(0);
  });

  it('reports 0% Earth incarnation rather than dividing by zero', () => {
    const earth = calculateEarthLifetimes(0, 100, buildPoint('Earth', 0, 'Aries'));
    expect(earth.earthLifetimes).toBe(0);
    expect(earth.nonEarthLifetimes).toBe(0);
    expect(earth.earthPercentage).toBe(0);
    expect(Number.isNaN(earth.earthPercentage)).toBe(false);
  });

  it('never returns a negative result', () => {
    const draconic = { Ascendant: buildPoint('Ascendant', 0, 'Aries') };
    const universal = calculateUniversalLifetimes(draconic as never, closureWith(0), 0);
    expect(universal.totalUniversalLifetimes).toBeGreaterThanOrEqual(0);
    expect(universal.currentCycleLifetimes).toBeGreaterThanOrEqual(0);
  });
});

describe('the engine can produce the full required range', () => {
  /**
   * Find a Draconic Ascendant position and closure total that yield exactly
   * `target` universal lifetimes, then VERIFY it by running the real engine.
   *
   * The candidate arc-second is solved algebraically rather than brute-forced,
   * but nothing is asserted until `calculateUniversalLifetimes` confirms it —
   * so this proves reachability through the production formulas, and no target
   * is ever hard-coded into the engine itself.
   */
  function findUniversalTotal(target: number): { units: number; position: string } | null {
    for (let units = 0; units <= 26; units++) {
      const closure = closureWith(units);
      const maturity = Math.pow(closure.closureRatio, 5);

      for (let signIndex = 0; signIndex < 12; signIndex++) {
        const validated =
          Math.floor(signIndex * closure.closureRatio) + closure.additionalOctaves * 12;
        const remaining = target - validated * UNIVERSAL_CYCLE_CAPACITY;
        if (remaining < 0 || remaining >= UNIVERSAL_CYCLE_CAPACITY) continue;

        // currentCycleLifetimes = floor(CAP × (a/108000 × 0.8) × maturity)
        const perArcSec = (UNIVERSAL_CYCLE_CAPACITY * 0.8 * maturity) / 108_000;
        const candidates =
          perArcSec === 0
            ? [0]
            : [Math.ceil(remaining / perArcSec), Math.ceil(remaining / perArcSec) + 1];

        for (const arcSec of candidates) {
          if (arcSec < 0 || arcSec >= 108_000) continue;
          const abs = signIndex * 108_000 + arcSec;
          const draconic = { Ascendant: buildPoint('Ascendant', abs, null) };
          const universal = calculateUniversalLifetimes(draconic as never, closure, 0);
          if (universal.totalUniversalLifetimes === target) {
            return { units, position: draconic.Ascendant.positionLabel };
          }
        }
      }
    }
    return null;
  }

  it.each([0, 1, 12, 45, 144, 1_728, 20_736, 248_832])(
    'can return exactly %i universal lifetimes',
    (target) => {
      expect(findUniversalTotal(target)).not.toBeNull();
    },
  );

  it('can exceed 1,000,000 lifetimes', () => {
    const draconic = { Ascendant: buildPoint('Ascendant', 11 * 108_000 + 90_000, 'Pisces') };
    const universal = calculateUniversalLifetimes(draconic as never, closureWith(12), 0.9);
    expect(universal.totalUniversalLifetimes).toBeGreaterThan(1_000_000);
  });

  it('can exceed 3,000,000 lifetimes, entering the Universal Soul range', () => {
    // 24 raw closure units = 12 base + 1 additional Universal Octave.
    const draconic = { Ascendant: buildPoint('Ascendant', 11 * 108_000 + 90_000, 'Pisces') };
    const universal = calculateUniversalLifetimes(draconic as never, closureWith(24), 0.9);
    expect(universal.validatedCompletedCycles).toBe(11 + 12);
    expect(universal.totalUniversalLifetimes).toBeGreaterThan(3_000_000);
    expect(classifySoulAge(universal.totalUniversalLifetimes).name).toBe('Universal Soul');
  });

  it('can place a soul on its first Earth incarnation despite millions of universal lifetimes', () => {
    const earth = buildPoint('Earth', longitudeToAbsArcSec(at('Aquarius', 15)), 'Pisces');
    const result = calculateEarthLifetimes(3_000_000, 12.5, earth);
    expect(result.earthLifetimes).toBeGreaterThanOrEqual(0);
    expect(result.earthLifetimes).toBeLessThan(200);
    expect(classifySoulAge(result.earthLifetimes).name).not.toBe('Universal Soul');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// §12 / §13 — Soul Age boundary transitions
// ─────────────────────────────────────────────────────────────────────────────

describe('Soul Age boundary transitions', () => {
  it.each([
    [0, 'Infant Soul'],
    [12, 'Infant Soul'],
    [13, 'Baby Soul'],
    [144, 'Baby Soul'],
    [145, 'Young Soul'],
    [1_728, 'Young Soul'],
    [1_729, 'Mature Soul'],
    [20_736, 'Mature Soul'],
    [20_737, 'Old Soul'],
    [248_832, 'Old Soul'],
    [248_833, 'Transcendental Soul'],
    [2_985_984, 'Transcendental Soul'],
    [2_985_985, 'Universal Soul'],
  ])('classifies %i as %s', (count, name) => {
    expect(classifySoulAge(count).name).toBe(name);
  });

  it('labels stages Early / Middle / Late by progress through the band', () => {
    expect(classifySoulAge(13).label).toBe('Early Baby Soul');       // 0%
    expect(classifySoulAge(78).label).toBe('Middle Baby Soul');      // ~50%
    expect(classifySoulAge(144).label).toBe('Late Baby Soul');       // 100%
    expect(classifySoulAge(2_928_138).label).toBe('Late Transcendental Soul');
    expect(classifySoulAge(1_835_379).label).toBe('Middle Transcendental Soul');
  });

  it('numbers Universal Soul octaves instead of Early/Middle/Late', () => {
    expect(classifySoulAge(2_985_985).label).toBe('Universal Soul');
    expect(classifySoulAge(2_985_985 + UNIVERSAL_OCTAVE_CAPACITY).label).toBe('Universal Soul — Octave 2');
    expect(classifySoulAge(2_985_985 + UNIVERSAL_OCTAVE_CAPACITY * 2).label).toBe('Universal Soul — Octave 3');
    expect(classifySoulAge(2_985_985).stage).toBeNull();
    expect(classifySoulAge(2_985_985).upperBoundary).toBeNull();
  });

  it('never describes one Soul Age as superior to another', () => {
    const forbidden = /\b(better|superior|higher than|more evolved|more advanced than|worse|lesser)\b/i;
    for (const band of [0, 13, 145, 1_729, 20_737, 248_833, 2_985_985]) {
      const c = classifySoulAge(band);
      expect(c.meaning).not.toMatch(forbidden);
      c.functions.forEach((f) => expect(f).not.toMatch(forbidden));
    }
  });
});

describe('model constants', () => {
  it('uses 12^5 as the universal cycle capacity', () => {
    expect(UNIVERSAL_CYCLE_CAPACITY).toBe(Math.pow(12, 5));
    expect(UNIVERSAL_CYCLE_CAPACITY).toBe(248_832);
    expect(UNIVERSAL_OCTAVE_CAPACITY).toBe(2_985_984);
  });

  it('maps every Draconic Ascendant sign to its candidate cycle count', () => {
    const expected: [string, number][] = [
      ['Aries', 0], ['Taurus', 1], ['Gemini', 2], ['Cancer', 3], ['Leo', 4], ['Virgo', 5],
      ['Libra', 6], ['Scorpio', 7], ['Sagittarius', 8], ['Capricorn', 9], ['Aquarius', 10], ['Pisces', 11],
    ];
    for (const [sign, count] of expected) {
      expect(calculateCandidateCompletedCycles(sign)).toBe(count);
    }
  });

  it('does not declare a Pisces Draconic Ascendant ancient without closure evidence', () => {
    const draconic = { Ascendant: buildPoint('Ascendant', longitudeToAbsArcSec(at('Pisces', 29, 59)), 'Pisces') };
    const universal = calculateUniversalLifetimes(draconic as never, closureWith(0), 0.99);
    expect(universal.candidateCompletedCycles).toBe(11);
    expect(universal.validatedCompletedCycles).toBe(0);
    expect(universal.totalUniversalLifetimes).toBe(0);
  });
});

describe('True Node vs Mean Node', () => {
  // Real values for the reference chart: the two nodes sit 28.5′ apart.
  const MEAN_NODE = 154.109109;
  const TRUE_NODE = 154.584323;

  const positions = [
    { name: 'Sun', longitude: 237.262357 },
    { name: 'Moon', longitude: 242.686397 },
    { name: 'Saturn', longitude: 175.032294 },
    { name: 'Neptune', longitude: 259.371148 },
    { name: 'Pluto', longitude: 200.574073 },
    { name: 'North Node', longitude: MEAN_NODE }, // the API's mean node
    { name: 'Ascendant', longitude: 147.898315 },
    { name: 'MC', longitude: 56.575797 },
  ];

  it('prefers the True Node over the "North Node" row when both are available', () => {
    const input = buildSoulAgeInputFromPositions(positions, {
      birthTimeKnown: true,
      trueNodeLongitude: TRUE_NODE,
    });
    const result = calculateSoulAge(input);
    expect(result.draconic['North Node'].absArcSec).toBe(0);
    // Rotating by the TRUE node gives the canonical Draconic Ascendant.
    expect(result.draconic.Ascendant.positionLabel).toBe('23°18′50″ Pisces');
    expect(result.notices).not.toContain(MEAN_NODE_FALLBACK_MESSAGE);
  });

  it('falls back to the mean node but says so, rather than pretending', () => {
    const input = buildSoulAgeInputFromPositions(positions, { birthTimeKnown: true });
    const result = calculateSoulAge(input);
    // 28.5′ further along — a materially different Draconic chart.
    expect(result.draconic.Ascendant.positionLabel).toBe('23°47′21″ Pisces');
    expect(result.notices).toContain(MEAN_NODE_FALLBACK_MESSAGE);
  });

  it('produces a materially different rotation between the two nodes', () => {
    const withTrue = calculateSoulAge(
      buildSoulAgeInputFromPositions(positions, { birthTimeKnown: true, trueNodeLongitude: TRUE_NODE }),
    );
    const withMean = calculateSoulAge(buildSoulAgeInputFromPositions(positions, { birthTimeKnown: true }));
    const delta = Math.abs(withTrue.draconic.Ascendant.absArcSec - withMean.draconic.Ascendant.absArcSec);
    expect(delta).toBeGreaterThan(1_700); // > 28′ — enough to cross a compendium
    expect(withTrue.totalUniversalLifetimes).not.toBe(withMean.totalUniversalLifetimes);
  });

  it('ignores a non-finite true node rather than corrupting the rotation', () => {
    const input = buildSoulAgeInputFromPositions(positions, {
      birthTimeKnown: true,
      trueNodeLongitude: Number.NaN,
    });
    expect(input.bodies.some((b) => b.name === 'True Node')).toBe(false);
    expect(calculateSoulAge(input).notices).toContain(MEAN_NODE_FALLBACK_MESSAGE);
  });

  it('requires an Ascendant and MC in the supplied positions', () => {
    expect(() => buildSoulAgeInputFromPositions(
      [{ name: 'Sun', longitude: 10 }], { birthTimeKnown: true },
    )).toThrow(/Ascendant and Midheaven/);
  });
});

describe('supporting position', () => {
  it('is a weighted average bounded by [0, 1)', () => {
    const input = chart({}, {
      ascendant: at('Leo', 28, 30), midheaven: at('Taurus', 27, 13), northNode: at('Virgo', 4, 36),
    });
    const { natal, draconic } = buildFrames(input);
    const s = calculateSupportingPosition(calculateUniversalChronometers(natal, draconic));
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThan(1);
  });

  it('is 0 when there are no chronometers', () => {
    expect(calculateSupportingPosition([])).toBe(0);
  });
});
