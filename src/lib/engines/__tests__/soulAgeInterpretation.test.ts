import { describe, it, expect } from 'vitest';
/**
 * Soul Age interpretation layer tests.
 *
 * Guards the properties that matter for a reading users will actually trust:
 * determinism, specificity (it must name real placements), the §14 section
 * contract, the §12 no-hierarchy rule, and the §18/§22 privacy rule that a
 * share card can never carry birth data.
 */

import { calculateSoulAge, type SoulAgeChartInput } from '../soulAgeEngine';
import {
  generateSoulAgeInterpretation,
  buildShareCard,
  formatCount,
  ordinalHouse,
  SOUL_AGE_DISCLAIMER,
  SOUL_AGE_CREDIT,
} from '../soulAgeInterpretation';

/** The §20 reference chart — real Swiss Ephemeris positions (see engine tests). */
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

const RESULT = calculateSoulAge(FIXTURE);
const INTERP = generateSoulAgeInterpretation(RESULT);

describe('formatting helpers', () => {
  it('formats large counts with comma separators', () => {
    expect(formatCount(2_924_280)).toBe('2,924,280');
    expect(formatCount(1_176_736)).toBe('1,176,736');
    expect(formatCount(0)).toBe('0');
    expect(formatCount(12)).toBe('12');
    expect(formatCount(1_000)).toBe('1,000');
  });

  it('formats house ordinals correctly, including the teens', () => {
    expect(ordinalHouse(1)).toBe('1st house');
    expect(ordinalHouse(2)).toBe('2nd house');
    expect(ordinalHouse(3)).toBe('3rd house');
    expect(ordinalHouse(4)).toBe('4th house');
    expect(ordinalHouse(10)).toBe('10th house');
    expect(ordinalHouse(11)).toBe('11th house');
    expect(ordinalHouse(12)).toBe('12th house');
    expect(ordinalHouse(null)).toBe('an undetermined house');
  });
});

describe('written interpretation', () => {
  it('is deterministic', () => {
    const again = generateSoulAgeInterpretation(calculateSoulAge(FIXTURE));
    expect(again).toEqual(INTERP);
  });

  it('references the actual chart placements, not generic filler', () => {
    const prose = INTERP.reading.join(' ');
    // The real Draconic Ascendant and Earth degrees must appear verbatim.
    expect(prose).toContain('23°18′50″ Pisces');
    expect(prose).toContain('22°40′40″ Sagittarius');
    // And the named subdivision layers from §15's worked example.
    expect(prose).toContain('Virgo duad');
    expect(prose).toContain('Virgo compendium');
    expect(prose).toContain('10th house');
  });

  it('states the Earth-versus-universal relationship explicitly', () => {
    expect(INTERP.headline.length).toBeGreaterThan(20);
    const prose = INTERP.reading.join(' ');
    expect(prose).toMatch(/40\.\d\d%/); // the real Earth percentage
  });

  it('names the closure evidence that validated the completed cycles', () => {
    const prose = INTERP.reading.join(' ');
    expect(prose).toContain('11');
    expect(prose.toLowerCase()).toContain('closure');
  });

  it('carries the disclaimer and the required attribution', () => {
    expect(INTERP.disclaimer).toBe(SOUL_AGE_DISCLAIMER);
    expect(INTERP.credit).toBe(SOUL_AGE_CREDIT);
    expect(INTERP.credit).toContain('created by Astro for AlignCosmic');
  });

  it('never ranks one Soul Age above another', () => {
    // "better than" is allowed only inside the explicit denial ("No Soul Age is
    // better than another"), so strip that sentence before scanning.
    const forbidden = /\b(superior|more evolved|higher soul|worse than|lesser soul|more advanced than)\b/i;
    const everything = [
      INTERP.headline,
      ...INTERP.reading,
      ...INTERP.sections.flatMap((s) => [s.title, ...s.body, ...(s.rows ?? []).map((r) => r.value)]),
    ].join(' ');
    expect(everything).not.toMatch(forbidden);
    expect(everything).not.toMatch(/(?<!No Soul Age is )better than/);
    expect(everything).toContain('No Soul Age is better than another');
  });
});

describe('§14 result sections', () => {
  it('produces all eleven sections in the specified order', () => {
    expect(INTERP.sections.map((s) => s.id)).toEqual([
      'universal-soul-age',
      'earth-soul-age',
      'universal-lifetime-calculation',
      'earth-lifetime-calculation',
      'draconic-ascendant',
      'draconic-earth',
      'closure-seals',
      'duad-compendium-repetitions',
      'natal-draconic',
      'seven-soul-ages',
      'methodology',
    ]);
  });

  it('gives every section a title and at least one paragraph', () => {
    for (const section of INTERP.sections) {
      expect(section.title.length).toBeGreaterThan(3);
      expect(section.body.length).toBeGreaterThan(0);
      section.body.forEach((p) => expect(p.trim().length).toBeGreaterThan(0));
    }
  });

  it('§19 discloses every required factor with its exact position', () => {
    const asc = INTERP.sections.find((s) => s.id === 'draconic-ascendant')!;
    const rendered = (asc.rows ?? []).map((r) => `${r.label} ${r.value}`).join(' ');
    // Each chronometer must disclose sign, house, duad, compendium and its weight.
    expect(rendered).toContain('Neptune — 30%');
    expect(rendered).toContain('Saturn — 20%');
    expect(rendered).toContain('Moon — 25%');
    expect(rendered).toContain('Pluto — 25%');
    expect(rendered).toContain('duad');
    expect(rendered).toContain('compendium');
  });

  it('shows the closure units, completed cycles and current-cycle position', () => {
    const rows = INTERP.sections.find((s) => s.id === 'universal-lifetime-calculation')!.rows!;
    const labels = rows.map((r) => r.label);
    expect(labels).toContain('Closure units');
    expect(labels).toContain('Validated completed cycles');
    expect(labels).toContain('Current-cycle position');
    expect(labels).toContain('Universal Maturity Coefficient');
  });

  it('shows every Earth Anchoring category score and the precision modifier', () => {
    const rows = INTERP.sections.find((s) => s.id === 'earth-lifetime-calculation')!.rows!;
    const labels = rows.map((r) => r.label).join(' ');
    expect(labels).toContain('Earth placement strength');
    expect(labels).toContain('Earth–Ascendant connection');
    expect(labels).toContain('Earth-memory connections');
    expect(labels).toContain('Terrestrial house activation');
    expect(labels).toContain('Earth repetition seals');
    expect(labels).toContain('Earth Precision Modifier');
  });

  it('lists all seven Soul Ages with their ranges', () => {
    const rows = INTERP.sections.find((s) => s.id === 'seven-soul-ages')!.rows!;
    expect(rows.map((r) => r.label)).toEqual([
      'Infant Soul', 'Baby Soul', 'Young Soul', 'Mature Soul',
      'Old Soul', 'Transcendental Soul', 'Universal Soul',
    ]);
    expect(rows[6].value).toContain('and beyond');
  });

  it('does not expose raw code or formula syntax to the reader', () => {
    const everything = INTERP.sections
      .flatMap((s) => [...s.body, ...(s.rows ?? []).map((r) => r.value)])
      .join(' ');
    // Note: a bare "function " is legitimate English here — §12's Infant Soul
    // copy reads "…enter manifestation and function within physical existence".
    expect(everything).not.toMatch(/Math\.|=>|function\s*\(|\bconst\s+\w+\s*=|\bnull\b|\bundefined\b/);
  });
});

describe('§18 / §22 share card privacy', () => {
  const card = buildShareCard(RESULT, 'Reference chart');

  it('exposes only the six permitted fields', () => {
    expect(Object.keys(card).sort()).toEqual([
      'brand', 'displayLabel', 'earthLifetimes', 'earthSoulAge',
      'title', 'universalLifetimes', 'universalSoulAge',
    ]);
  });

  it('never leaks birth data or chart placements', () => {
    const serialised = JSON.stringify(card);
    expect(serialised).not.toContain('1979');       // birth date
    expect(serialised).not.toContain('23:52');      // birth time
    expect(serialised).not.toMatch(/Nassau/i);      // birthplace
    expect(serialised).not.toMatch(/[0-9]+°/);      // any degree position
    expect(serialised).not.toMatch(/25\.0657|77\.3433/); // coordinates
    expect(serialised).not.toMatch(/duad|compendium/i);
  });

  it('carries the brand and title', () => {
    expect(card.brand).toBe('AlignCosmic');
    expect(card.title).toBe('Soul Age Calculator');
    expect(card.universalSoulAge).toBe('Late Transcendental Soul');
    expect(card.earthSoulAge).toBe('Middle Transcendental Soul');
    expect(card.universalLifetimes).toBe('2,924,280');
    expect(card.earthLifetimes).toBe('1,176,736');
  });

  it('falls back to a safe label when none is given', () => {
    expect(buildShareCard(RESULT, '').displayLabel).toBe('Anonymous');
  });

  it('truncates an overlong label rather than rendering it in full', () => {
    expect(buildShareCard(RESULT, 'x'.repeat(200)).displayLabel).toHaveLength(40);
  });
});

describe('edge cases', () => {
  it('reads a zero-lifetime chart without crashing or dividing by zero', () => {
    // Draconic Ascendant at 0° Aries with no closure evidence.
    const zero: SoulAgeChartInput = {
      bodies: [
        { name: 'Sun', longitude: 10 },
        { name: 'Moon', longitude: 40 },
        { name: 'Saturn', longitude: 70 },
        { name: 'Pluto', longitude: 100 },
        { name: 'Neptune', longitude: 130 },
        { name: 'North Node', longitude: 200 },
      ],
      ascendant: 200,
      midheaven: 110,
      birthTimeKnown: true,
    };
    const result = calculateSoulAge(zero);
    const interp = generateSoulAgeInterpretation(result);
    expect(result.totalUniversalLifetimes).toBe(0);
    expect(result.earthPercentage).toBe(0);
    expect(interp.headline).toContain('zero point');
    expect(interp.sections).toHaveLength(11);
    expect(JSON.stringify(interp)).not.toContain('NaN');
    expect(JSON.stringify(interp)).not.toContain('Infinity');
    expect(JSON.stringify(interp)).not.toContain('undefined');
  });
});
