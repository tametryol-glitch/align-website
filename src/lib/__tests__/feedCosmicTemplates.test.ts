import { describe, it, expect } from 'vitest';
import { __internals, canPersonalize } from '@/lib/feedCosmicTemplates';

// A real-shaped natal payload (the /charts/natal response uses `sign_degree`,
// `is_retrograde`, `house_cusps` and `aspects[].aspect`).
const NATAL = {
  planets: [
    { name: 'Sun', sign: 'Scorpio', sign_degree: 18.4, longitude: 228.4, house: 8, is_retrograde: false },
    { name: 'Moon', sign: 'Pisces', sign_degree: 3.1, longitude: 333.1, house: 12, is_retrograde: false },
    { name: 'Mercury', sign: 'Sagittarius', sign_degree: 6.7, longitude: 246.7, house: 9, is_retrograde: false },
    { name: 'Venus', sign: 'Libra', sign_degree: 21.9, longitude: 201.9, house: 7, is_retrograde: false },
    { name: 'Mars', sign: 'Leo', sign_degree: 11.2, longitude: 131.2, house: 5, is_retrograde: true },
    { name: 'Jupiter', sign: 'Taurus', sign_degree: 27.5, longitude: 57.5, house: 2, is_retrograde: false },
    { name: 'Saturn', sign: 'Pisces', sign_degree: 2.3, longitude: 332.3, house: 12, is_retrograde: false },
    { name: 'Pluto', sign: 'Scorpio', sign_degree: 24.0, longitude: 234.0, house: 8, is_retrograde: false },
  ],
  aspects: [
    { planet1: 'Moon', planet2: 'Saturn', aspect: 'conjunction', orb: 0.8 },
    { planet1: 'Sun', planet2: 'Venus', aspect: 'square', orb: 3.4 },
    { planet1: 'Mars', planet2: 'Jupiter', aspect: 'trine', orb: 4.9 },
  ],
  houses: Array.from({ length: 12 }, (_, i) => ({ house: i + 1, sign: '', longitude: (300 + i * 30) % 360 })),
  house_cusps: Array.from({ length: 12 }, (_, i) => (300 + i * 30) % 360),
  ascendant: 300, // 0° Aquarius
};

const TRANSITS = [
  { name: 'Sun', sign: 'Virgo', sign_degree: 3.0, longitude: 153.0, is_retrograde: false },
  { name: 'Moon', sign: 'Gemini', sign_degree: 14.0, longitude: 74.0, is_retrograde: false },
  { name: 'Venus', sign: 'Leo', sign_degree: 9.0, longitude: 129.0, is_retrograde: false },
  { name: 'Mars', sign: 'Libra', sign_degree: 22.5, longitude: 202.5, is_retrograde: false },
  { name: 'Saturn', sign: 'Pisces', sign_degree: 2.9, longitude: 332.9, is_retrograde: true },
  { name: 'Pluto', sign: 'Aquarius', sign_degree: 1.5, longitude: 301.5, is_retrograde: true },
];

const PROFILE: any = {
  id: 'u1',
  display_name: 'Tam Rivers',
  birth_date: '1990-11-11',
  birth_time: '04:20',
  latitude: 25.06,
  longitude: -77.34,
  sun_sign: 'Scorpio',
  moon_sign: 'Pisces',
  rising_sign: 'Aquarius',
};

function buildBundle(overrides: Partial<any> = {}) {
  const natalPlanets = __internals.normalizePoints(NATAL.planets);
  const cusps = __internals.extractCusps(NATAL);
  const risingSign = __internals.extractRisingSign(NATAL, PROFILE, cusps);
  const transitPlanets = __internals.normalizePoints(TRANSITS);
  for (const t of transitPlanets) t.house = __internals.houseOfLon(t.lon, cusps, risingSign);

  const natalAspects = NATAL.aspects.map((a) => ({
    planet1: a.planet1,
    planet2: a.planet2,
    type: a.aspect,
    orb: a.orb,
  }));

  const topHit = __internals.pickTopHit([], transitPlanets, natalPlanets, cusps, risingSign);

  return {
    profile: PROFILE,
    natalPlanets,
    natalAspects,
    cusps,
    risingSign,
    natalForEngines: {
      planets: natalPlanets.map((p) => ({
        name: p.name,
        longitude: p.lon,
        sign: p.sign,
        degree: p.deg,
        house: p.house ?? 0,
        retrograde: p.retro,
      })),
      aspects: natalAspects.map((a) => ({ ...a, lon1: 0, lon2: 0 })),
      houses: NATAL.houses,
      ascendant: { sign: risingSign },
      midheaven: 0,
    },
    transitPlanets,
    moonPhaseName: 'Waxing Gibbous',
    moonIllumination: 78,
    topHit,
    firstName: 'Tam',
    ...overrides,
  } as any;
}

describe('feedCosmicTemplates — chart normalisation', () => {
  it('requires birth date and coordinates to personalize', () => {
    expect(canPersonalize(PROFILE)).toBe(true);
    expect(canPersonalize({ ...PROFILE, birth_date: null })).toBe(false);
    expect(canPersonalize({ ...PROFILE, latitude: null })).toBe(false);
    expect(canPersonalize(null)).toBe(false);
  });

  it('places a longitude in the right house from real cusps', () => {
    const cusps = __internals.extractCusps(NATAL);
    expect(cusps).toHaveLength(12);
    // Cusp 1 = 300° (Aquarius), so 301.5° is 1st house, 333.1° is 2nd.
    expect(__internals.houseOfLon(301.5, cusps, 'Aquarius')).toBe(1);
    expect(__internals.houseOfLon(333.1, cusps, 'Aquarius')).toBe(2);
    expect(__internals.houseOfLon(228.4, cusps, 'Aquarius')).toBe(10);
  });

  it('falls back to whole-sign houses when cusps are missing', () => {
    expect(__internals.houseOfLon(333.1, [], 'Aquarius')).toBe(2);
  });

  it('picks the tightest core aspect, favouring hard aspects', () => {
    const tight = __internals.tightestCoreAspect([
      { planet1: 'Moon', planet2: 'Saturn', type: 'conjunction', orb: 0.8 },
      { planet1: 'Sun', planet2: 'Venus', type: 'square', orb: 1.5 },
      { planet1: 'Pluto', planet2: 'Mars', type: 'square', orb: 0.1 }, // Pluto not a core body
    ]);
    expect(tight?.planet1).toBe('Sun');
    expect(tight?.planet2).toBe('Venus');
  });

  it('formats orbs in degrees and minutes', () => {
    expect(__internals.fmtOrb(0.8)).toBe("0°48'");
    expect(__internals.fmtOrb(3.0)).toBe("3°00'");
    expect(__internals.fmtOrb(1.999)).toBe("2°00'");
  });

  it('dedupes and sanitises hashtags', () => {
    expect(__internals.hashtags(['Scorpio', 'scorpio', null, 'Natal Chart'])).toBe(
      '#Scorpio #NatalChart',
    );
  });

  it('prefers the exact-hit events endpoint over the live-sky fallback', () => {
    const natalPlanets = __internals.normalizePoints(NATAL.planets);
    const transitPlanets = __internals.normalizePoints(TRANSITS);
    const cusps = __internals.extractCusps(NATAL);
    const soon = new Date();
    soon.setDate(soon.getDate() + 3);
    const far = new Date();
    far.setDate(far.getDate() + 40);

    const hit = __internals.pickTopHit(
      [
        // Real payload shape: aspect_name, not aspect_type.
        {
          date: soon.toISOString().split('T')[0],
          transiting_planet: 'Saturn',
          natal_planet: 'Venus',
          aspect_name: 'Square',
          orb: 1.2,
          is_retrograde: true,
          transit_sign: 'Pisces',
          natal_sign: 'Libra',
        },
        {
          date: far.toISOString().split('T')[0],
          transiting_planet: 'Venus',
          natal_planet: 'Sun',
          aspect_name: 'Trine',
          orb: 0.1,
          transit_sign: 'Leo',
          natal_sign: 'Scorpio',
        },
      ],
      transitPlanets,
      natalPlanets,
      cusps,
      'Aquarius',
    );

    // Slow planet + near-exact date beats a tighter but distant fast-planet hit.
    expect(hit?.transiting).toBe('Saturn');
    expect(hit?.type).toBe('square');
    expect(hit?.retro).toBe(true);
    // natal house comes from the natal planet's own house, not recomputed
    expect(hit?.natalHouse).toBe(7);

    const post = __internals.buildTransitPost(buildBundle({ topHit: hit }));
    // eslint-disable-next-line no-console
    console.log('---- TRANSIT (events path) ----');
    console.log(post);
    expect(post).toContain('Transiting Saturn ℞ square my natal Venus (7th house)');
    expect(post).toContain("1°12' orb");
    expect(post).not.toContain('undefined');
  });

  it('finds the strongest live transit against the natal chart', () => {
    const b = buildBundle();
    expect(b.topHit).toBeTruthy();
    // Transiting Saturn 332.9° conjunct natal Saturn 332.3° / natal Moon 333.1°
    // outranks the faster bodies.
    expect(['Saturn', 'Pluto']).toContain(b.topHit.transiting);
    expect(b.topHit.orb).toBeLessThan(6);
  });
});

describe('feedCosmicTemplates — post bodies are built from the chart', () => {
  const b = buildBundle();

  it('zodiac post names the real placements and quotes the aspect reading', () => {
    const post = __internals.buildZodiacPost(b);
    // eslint-disable-next-line no-console
    console.log('\n──── ZODIAC ────\n' + post);
    expect(post).toContain('Sun — Scorpio, 8th house');
    expect(post).toContain('Moon — Pisces, 12th house');
    expect(post).toContain('Rising — Aquarius');
    expect(post).toContain('Moon conjunction Saturn');
    expect(post).toContain('#Scorpio');
    expect(post).not.toContain('undefined');
  });

  it('transit post names the actual hit, orb and house', () => {
    const post = __internals.buildTransitPost(b);
    // eslint-disable-next-line no-console
    console.log('\n──── TRANSIT ────\n' + post);
    expect(post).toMatch(/Transiting (Saturn|Pluto)/);
    expect(post).toMatch(/orb/);
    expect(post).not.toContain('undefined');
    expect(post).not.toContain('you,'); // engine text must not address the poster
  });

  it('moon post ties tonight’s Moon to the natal Moon', () => {
    const post = __internals.buildMoonPost(b);
    // eslint-disable-next-line no-console
    console.log('\n──── MOON ────\n' + post);
    expect(post).toContain('Waxing Gibbous in Gemini');
    expect(post).toContain('78% lit');
    expect(post).toMatch(/born under a .*Moon/);
    expect(post).not.toContain('undefined');
  });

  it('aura post scores colours off the chart, not a mood', () => {
    const post = __internals.buildAuraPost(b);
    // eslint-disable-next-line no-console
    console.log('\n──── AURA ────\n' + post);
    expect(post).toContain('Outer aura —');
    expect(post).toContain('Chakra focus —');
    expect(post).toContain('#AuraReading');
    expect(post).not.toContain('undefined');
  });

  it('tarot post picks cards from the chart, not a shuffle', () => {
    const post = __internals.buildTarotPost(b);
    // eslint-disable-next-line no-console
    console.log('\n──── TAROT ────\n' + post);
    // Saturn → The World, Pluto → Judgement; both must be retrograde-aware.
    expect(post).toMatch(/The World|Judgement/);
    expect(post).toContain('reversed'); // both transiting bodies are Rx here
    expect(post).toContain('#Tarot');
    expect(post).not.toContain('undefined');
  });

  it('is deterministic — the same chart produces the same post', () => {
    expect(__internals.buildZodiacPost(b)).toBe(__internals.buildZodiacPost(buildBundle()));
    expect(__internals.buildTarotPost(b)).toBe(__internals.buildTarotPost(buildBundle()));
  });
});
