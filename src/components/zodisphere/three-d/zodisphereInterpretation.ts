/**
 * Zodisphere Interpretation Engine
 *
 * Synthesizes a SINGLE cohesive reading for a tapped location from six layers,
 * in strict hierarchy, never interpreting them separately:
 *
 *   1. Planet      — the activated line (core energy).
 *   2. Natal sign  — how that planet naturally expresses.
 *   3. Natal house — the primary life area activated.
 *   4. Duad        — its sign → the natal house it falls in.
 *   5. Compendium  — its sign → the natal house it falls in.
 *   6. Matrix      — its sign → the natal house it falls in.
 *
 * On top of the layers it analyzes: house relationships (reinforcing / supporting
 * / complementary / opposing / tension), elemental balance, modality balance,
 * planetary rulers (with repeat-weighting) and each ruler's natal condition
 * (sign, house, essential dignity, major aspects, strength), and recurring
 * patterns — then composes one weighted narrative.
 *
 * It performs NO astronomy: it reads the already-validated natal longitudes and
 * the already-derived duad/compendium/matrix signs (getFullDuadCompendium).
 */

import {
  SIGNS, RULERS, SIGN_THEMES, HOUSE_THEMES, getHouseForSign,
} from '@/lib/engines/duadCompendium';
import type { ChartData } from '@/lib/zodisphereMidpoints';

// ── Configurable weighting (spec: Planet+House 45 / Sign 25 / Duad 15 / Comp 10 / Matrix 5)
export interface InterpretationWeights {
  planetHouse: number; natalSign: number; duad: number; compendium: number; matrix: number;
}
export const DEFAULT_WEIGHTS: InterpretationWeights = {
  planetHouse: 0.45, natalSign: 0.25, duad: 0.15, compendium: 0.10, matrix: 0.05,
};

type Element = 'Fire' | 'Earth' | 'Air' | 'Water';
type Modality = 'Cardinal' | 'Fixed' | 'Mutable';

const ELEMENT: Record<string, Element> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};
const MODALITY: Record<string, Modality> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
  Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};
// Classical exaltations (planet → exalted sign). Fall = opposite.
const EXALTATION: Record<string, string> = {
  Sun: 'Aries', Moon: 'Taurus', Mercury: 'Virgo', Venus: 'Pisces',
  Mars: 'Capricorn', Jupiter: 'Cancer', Saturn: 'Libra',
};
// Domicile: invert the (custom) rulership map → planet → signs it rules.
const DOMICILE: Record<string, string[]> = (() => {
  const m: Record<string, string[]> = {};
  for (const [sign, ruler] of Object.entries(RULERS)) (m[ruler] ??= []).push(sign);
  return m;
})();

const BENEFICS = new Set(['Venus', 'Jupiter']);
const MALEFICS = new Set(['Mars', 'Saturn']);

/** Second-person core energy of each activated planetary line. */
const PLANET_ENERGY: Record<string, string> = {
  Sun: 'your drive to be seen, to shine, and to become who you are',
  Moon: 'your emotional core — what makes you feel safe, held, and at home',
  Mercury: 'your mind, your voice, and how you connect and make sense of things',
  Venus: 'your capacity for love, beauty, worth, and what you draw toward you',
  Mars: 'your drive, desire, anger, and how you fight for what you want',
  Jupiter: 'your growth, luck, faith, and hunger for something bigger',
  Saturn: 'your discipline, limits, fears, and the mastery earned the hard way',
  Uranus: 'your need to break free, wake up, and live on your own terms',
  Neptune: 'your dreams, longing, spirituality, and where boundaries dissolve',
  Pluto: 'your power, obsessions, and capacity to be torn down and reborn',
  'North Node': 'your growth edge — the unfamiliar direction your life is pulling toward',
  'South Node': 'the old, over-practiced patterns you lean on and must release',
  Chiron: 'your deepest wound and the healing you can offer others through it',
};
function planetEnergy(p: string): string {
  return PLANET_ENERGY[p] || `the ${p} force in you`;
}

/** The plain-language life ARENA a line's angle activates (no jargon). */
const ANGLE_AREA: Record<string, string> = {
  MC: 'your work and your place in the world',
  IC: 'your home and your family',
  ASC: 'who you are and how you come across',
  DSC: 'your love life and closest relationships',
};

/** The HEADLINE prediction for each planet × angle — vivid, emotional, a little
 *  risky, but grounded in the real meaning of that planet in that arena. Format:
 *  a punchy hook sentence, then a concrete "what could happen" follow. */
const PREDICTIONS: Record<string, Record<string, string>> = {
  Sun: {
    MC: 'This is a place you get noticed. Your work could step into the spotlight — recognition, a title, a big public win — but everyone will be watching, so there\'s nowhere to hide.',
    IC: 'You could finally feel at home in your own skin here. Family warms up, or you become the heart the whole household orbits — just don\'t let it go to your head.',
    ASC: 'You shine here. People see the real you and doors open on charisma alone — the only trap is the ego that rides in with all that attention.',
    DSC: 'People are drawn to your light here. A relationship could put you center-stage — or you fall hard for someone who needs to be the star.',
  },
  Moon: {
    MC: 'Your work here runs on feeling. You could build something caring for or moving people — or ride an emotional rollercoaster in public you can\'t quite hide.',
    IC: 'This is a place that pulls at your heart. You\'ll want to nest, to belong, to be held — but old family wounds can rise right back up too.',
    ASC: 'You wear your heart on your face here. People feel close to you fast, and you\'re softer, moodier, and more exposed than usual — for better and worse.',
    DSC: 'You bond fast and deep here. Love turns tender and protective — comfort and clinginess in the same breath, so watch how much you give away.',
  },
  Mercury: {
    MC: 'Your mind is your money here. Writing, speaking, teaching, deals — the right words open doors, but you\'ll be busy to the edge of scattered.',
    IC: 'Home fills with talk, ideas, and constant coming-and-going here. It\'s alive and stimulating — and restless if part of you is craving quiet.',
    ASC: 'You come across sharp and quick here. You\'ll talk, connect, and think nonstop — and struggle to ever switch your head off.',
    DSC: 'You fall for a mind here. Relationships get witty and stimulating, built on conversation — just keep an eye out for someone who won\'t stay put.',
  },
  Venus: {
    MC: 'Your charm opens doors here. Money, beauty, and the right relationships can lift your reputation — just don\'t coast on being liked.',
    IC: 'Home gets beautiful and sweet here — comfort, love, maybe a place you never want to leave. The only risk is going soft and getting stuck.',
    ASC: 'You\'re magnetic here. You\'ll feel and look more attractive and draw admirers and opportunities to you — vanity is the one thing to watch.',
    DSC: 'This is a love-magnet of a place. Romance, a fated partner, maybe marriage — or you fall for the wrong beautiful thing. Either way your heart is in it.',
  },
  Mars: {
    MC: 'You\'ll fight for what you want here. Bold career moves, competition, maybe clashes with the people in charge — great for drive, dangerous for burnout.',
    IC: 'Home runs hot here. You\'ll get a lot done — or slam into tension and slammed doors with the people you live with. The fire needs somewhere to go.',
    ASC: 'You\'re a force here — bold, energized, up for anything. Just watch the short fuse and the accidents that come from moving too fast.',
    DSC: 'Passion runs high here. Intense attraction, hot-and-cold love, maybe a partner you clash with as hard as you want them — this place turns up the heat.',
  },
  Jupiter: {
    MC: 'This is a lucky place for your career. Growth, opportunity, a promotion, travel for work — the only real danger is overpromising.',
    IC: 'Your home and family expand here — more room, more abundance, maybe literally a bigger place. Just watch the tendency to overdo everything.',
    ASC: 'Good fortune seems to follow you here. You feel optimistic, generous, larger than life — don\'t let it tip into overconfidence.',
    DSC: 'Relationships bring luck and growth here — a generous partner, a wedding, someone who cracks your world wide open. Just don\'t bite off more than you can hold.',
  },
  Saturn: {
    MC: 'You\'ll build something real here, brick by brick. Mastery, authority, and respect are on offer — but earned the hard way, through pressure and delay.',
    IC: 'Home feels heavier here — real responsibility, maybe caring for family, or a lonely stretch that ends up making you stand on your own two feet.',
    ASC: 'This place ages you, in the best and hardest sense. You\'re taken seriously here, but it can feel cold or restrictive — you grow up here, ready or not.',
    DSC: 'Relationships get serious here — commitment, duty, maybe an older or steadier partner — or a loneliness that finally teaches you what you actually need.',
  },
  Uranus: {
    MC: 'Your career could take a hard left here. Sudden changes, unconventional work, walking away from the safe path — you\'ll choose freedom over security.',
    IC: 'You could uproot your whole home life here — a sudden move, an unconventional living setup, or finally walking away from a place that felt like a cage.',
    ASC: 'You reinvent yourself here. Expect the unexpected — a new look, a new identity, a jolt that wakes you up. Comfort was never the point.',
    DSC: 'Love goes electric and unpredictable here — sudden sparks, unconventional arrangements, on-again-off-again. It\'s exciting, but freedom matters more than safety.',
  },
  Neptune: {
    MC: 'Your work turns dreamy here — art, film, healing, and spirituality thrive, but so can confusion and people who aren\'t what they seem. Trust slowly.',
    IC: 'Home feels magical or a little unreal here — a sanctuary, or a place where the edges blur and you quietly lose the plot. Keep one foot on the ground.',
    ASC: 'You become a kind of mirror here — inspired, intuitive, and a little lost. People project their dreams onto you, so be careful who you dissolve into.',
    DSC: 'This is where you fall in love with a dream. Soulmate highs are real here — and so is illusion, so make sure you\'re loving the person, not the fantasy.',
  },
  Pluto: {
    MC: 'Power moves here. Your career can transform completely — a rise, a fall, and a comeback — with power struggles you won\'t be able to sidestep.',
    IC: 'This place digs into your roots. Deep family history surfaces and you rebuild home life from the ground up — sometimes through a crisis that changes everything.',
    ASC: 'You\'re intense here — magnetic, powerful, impossible to ignore. Expect a kind of death-and-rebirth of who you thought you were.',
    DSC: 'Love goes all the way here — obsession, deep merging, jealousy, transformation. This is a partner who remakes you, or nearly wrecks you. Rarely in between.',
  },
};

/** A plain personality read of the natal sign — why the place lands on YOU
 *  differently (used lightly, no sign names in the prose). */
const SIGN_TRAIT: Record<string, string> = {
  Aries: 'someone who charges first and asks questions later',
  Taurus: 'someone who craves stability, comfort, and things that last',
  Gemini: 'someone whose mind never stops moving',
  Cancer: 'someone who feels everything deeply and protects what they love',
  Leo: 'someone who needs to be seen and to shine',
  Virgo: 'someone who notices every detail and wants to make things right',
  Libra: 'someone who craves harmony, beauty, and connection',
  Scorpio: 'someone who feels everything intensely and trusts slowly',
  Sagittarius: 'someone who needs freedom, adventure, and meaning',
  Capricorn: 'someone built to endure, achieve, and be respected',
  Aquarius: 'someone who thinks for themselves and refuses to be boxed in',
  Pisces: 'someone who dreams, absorbs, and feels what others miss',
};

/** Plain-language life domain for each house (no numbers in the prose). */
const HOUSE_LIFE: Record<number, string> = {
  1: 'who you are and how you carry yourself',
  2: 'your money and your sense of self-worth',
  3: 'your everyday world — words, ideas, and the people right around you',
  4: 'your home and your family',
  5: 'romance, creativity, and joy',
  6: 'your daily work, health, and routines',
  7: 'your closest relationships',
  8: 'intimacy, shared money, and deep change',
  9: 'travel, big questions, and the search for meaning',
  10: 'your career and reputation',
  11: 'your friendships and the future you\'re building',
  12: 'your inner world and what you need to let go of',
};

/** Plain, emotional mini-prediction for each house (what could happen). */
const HOUSE_PREDICT: Record<number, string> = {
  1: 'you could walk away from here a genuinely different person',
  2: 'your money and your sense of what you\'re worth could swing hard',
  3: 'the people around you and the way you think could shift',
  4: 'your home and family life could get stirred right up',
  5: 'a romance or a creative fire could catch when you least expect it',
  6: 'your work, health, and daily rhythm could get overhauled',
  7: 'a close relationship could hit a real turning point',
  8: 'something could end so something else can be reborn',
  9: 'you could be pulled toward travel, study, or a whole new outlook',
  10: 'your career or reputation could take a real turn',
  11: 'your friendships and your vision of the future could reshape you',
  12: 'buried feelings could surface, and you may have to let something go',
};

/** The plain undercurrent each ruling planet threads through the place. */
const RULER_THEME: Record<string, string> = {
  Sun: 'pull toward being seen and living boldly',
  Moon: 'need for comfort, care, and belonging',
  Mercury: 'restless, curious, talkative energy',
  Venus: 'pull toward love, beauty, and pleasure',
  Mars: 'drive to push, fight, and chase what you want',
  Jupiter: 'hunger for more — growth, adventure, and luck',
  Saturn: 'pressure to get serious and build something that lasts',
  Uranus: 'urge to break free and do it your own way',
  Neptune: 'longing to escape, dream, and dissolve',
  Pluto: 'pull toward intensity, power, and deep change',
  Vesta: 'devotion to a single focused purpose',
  Juno: 'focus on commitment and partnership',
};

type Angle = 'MC' | 'IC' | 'ASC' | 'DSC';

const ELEMENT_ATMOSPHERE: Record<Element, string> = {
  Fire: 'charged and driven — here you act on instinct and ignite before you overthink',
  Earth: 'grounded and tangible — progress here is slow, physical, and built to last',
  Air: 'mental and social — ideas, words, and people move fast around you here',
  Water: 'emotional and intuitive — you feel this place in your body before you understand it',
};
const MODALITY_EFFECT: Record<Modality, string> = {
  Cardinal: 'pushes you to initiate — to start something and take the lead',
  Fixed: 'rewards persistence and holds you until you master what it demands',
  Mutable: 'keeps you adapting and in motion — a place of transition, not arrival',
};

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function signOfLon(lon: number): string {
  const L = ((lon % 360) + 360) % 360;
  return SIGNS[Math.floor(L / 30) % 12];
}
function oppositeSign(sign: string): string {
  return SIGNS[(SIGNS.indexOf(sign) + 6) % 12];
}
function houseTheme(h: number): string {
  return HOUSE_THEMES[h] || 'this area of life';
}
function dominantOf<T extends string>(counts: Record<T, number>): T {
  return (Object.entries(counts) as [T, number][]).sort((a, b) => b[1] - a[1])[0][0];
}

// ── Natal context the caller builds once from getMyChartBodies ──────────────
export interface NatalContext {
  ascSign: string;
  bodies: Map<string, number>; // name → ecliptic longitude
}
export function buildNatalContext(chart: ChartData): NatalContext | null {
  const bodies = new Map(chart.bodies.map((b) => [b.name, b.longitude]));
  const ascLon = bodies.get('Ascendant');
  if (ascLon == null || !Number.isFinite(ascLon)) return null;
  return { ascSign: signOfLon(ascLon), bodies };
}

// ── Ruler natal condition ───────────────────────────────────────────────────
export interface RulerAspect { other: string; type: string; orb: number; }
export interface RulerCondition {
  planet: string;
  available: boolean;
  count: number;         // how many layer-signs this planet rules (repeat weight)
  sign?: string;
  house?: number;
  dignity?: 'domicile' | 'exaltation' | 'detriment' | 'fall' | 'peregrine';
  aspects?: RulerAspect[];
  strengthScore?: number;
  strengthLabel?: 'strong' | 'mixed' | 'challenged';
}

const ASPECTS: { type: string; angle: number; orb: number }[] = [
  { type: 'conjunction', angle: 0, orb: 8 },
  { type: 'opposition', angle: 180, orb: 8 },
  { type: 'trine', angle: 120, orb: 7 },
  { type: 'square', angle: 90, orb: 6 },
  { type: 'sextile', angle: 60, orb: 4 },
];
const ASPECTABLE = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

function dignityOf(planet: string, sign: string): RulerCondition['dignity'] {
  if (DOMICILE[planet]?.includes(sign)) return 'domicile';
  if (EXALTATION[planet] === sign) return 'exaltation';
  if (DOMICILE[planet]?.some((s) => oppositeSign(s) === sign)) return 'detriment';
  if (EXALTATION[planet] && oppositeSign(EXALTATION[planet]) === sign) return 'fall';
  return 'peregrine';
}

function rulerCondition(planet: string, count: number, ctx: NatalContext): RulerCondition {
  const lon = ctx.bodies.get(planet);
  if (lon == null || !Number.isFinite(lon)) return { planet, available: false, count };
  const sign = signOfLon(lon);
  const house = getHouseForSign(sign, ctx.ascSign);
  const dignity = dignityOf(planet, sign);

  const aspects: RulerAspect[] = [];
  for (const other of ASPECTABLE) {
    if (other === planet) continue;
    const olon = ctx.bodies.get(other);
    if (olon == null || !Number.isFinite(olon)) continue;
    let sep = Math.abs(((lon - olon) % 360 + 360) % 360);
    if (sep > 180) sep = 360 - sep;
    for (const a of ASPECTS) {
      const orb = Math.abs(sep - a.angle);
      if (orb <= a.orb) { aspects.push({ other, type: a.type, orb: +orb.toFixed(1) }); break; }
    }
  }

  let score = { domicile: 2, exaltation: 1, detriment: -2, fall: -1, peregrine: 0 }[dignity!];
  for (const a of aspects) {
    if (a.type === 'trine' || a.type === 'sextile') score += 1;
    else if (a.type === 'square' || a.type === 'opposition') score -= 1;
    else if (a.type === 'conjunction') score += BENEFICS.has(a.other) ? 1 : MALEFICS.has(a.other) ? -1 : 0;
  }
  const strengthLabel: RulerCondition['strengthLabel'] = score >= 2 ? 'strong' : score <= -2 ? 'challenged' : 'mixed';
  return { planet, available: true, count, sign, house, dignity, aspects, strengthScore: score, strengthLabel };
}

// ── House relationships ─────────────────────────────────────────────────────
export interface HouseRelation { a: number; b: number; kind: 'reinforcing' | 'supporting' | 'complementary' | 'opposing' | 'tension' | 'minor'; }
function houseRelation(a: number, b: number): HouseRelation['kind'] {
  let d = Math.abs(a - b); d = Math.min(d, 12 - d);
  if (d === 0) return 'reinforcing';
  if (d === 4) return 'supporting';   // trine
  if (d === 2) return 'complementary'; // sextile
  if (d === 6) return 'opposing';      // opposition
  if (d === 3) return 'tension';       // square
  return 'minor';
}

// ── The synthesized result ──────────────────────────────────────────────────
export interface LocationInterpretation {
  planet: string; angle: Angle;
  natalSign: string; natalHouse: number;
  duadSign: string; duadHouse: number;
  compSign: string; compHouse: number;
  matrixSign: string; matrixHouse: number;
  houses: number[];
  relations: HouseRelation[];
  elements: { counts: Record<Element, number>; dominant: Element };
  modalities: { counts: Record<Modality, number>; dominant: Modality };
  rulers: { conditions: RulerCondition[]; dominant?: RulerCondition };
  patterns: { repeatedHouses: [number, number][]; repeatedSigns: [string, number][]; repeatedRulers: [string, number][] };
  weights: InterpretationWeights;
  narrative: string;
}

export interface LocationBand { duadSign: string; compendiumSign: string; matrixSign: string; }

/**
 * Synthesize the full location reading. `planet` = the activated line; `band` =
 * the duad/compendium/matrix signs at the tapped point (from bandAtLatitude).
 */
export function interpretLocation(
  ctx: NatalContext,
  planet: string,
  band: LocationBand,
  angle: Angle = 'MC',
  weights: InterpretationWeights = DEFAULT_WEIGHTS,
): LocationInterpretation | null {
  const planetLon = ctx.bodies.get(planet);
  if (planetLon == null || !Number.isFinite(planetLon)) return null;

  const natalSign = signOfLon(planetLon);
  const natalHouse = getHouseForSign(natalSign, ctx.ascSign);
  const { duadSign, compendiumSign: compSign, matrixSign } = band;
  const duadHouse = getHouseForSign(duadSign, ctx.ascSign);
  const compHouse = getHouseForSign(compSign, ctx.ascSign);
  const matrixHouse = getHouseForSign(matrixSign, ctx.ascSign);

  const layerSigns = [natalSign, duadSign, compSign, matrixSign];
  const houses = [natalHouse, duadHouse, compHouse, matrixHouse];

  // Elements / modalities across the four layer-signs.
  const elemCounts = { Fire: 0, Earth: 0, Air: 0, Water: 0 } as Record<Element, number>;
  const modeCounts = { Cardinal: 0, Fixed: 0, Mutable: 0 } as Record<Modality, number>;
  for (const s of layerSigns) { elemCounts[ELEMENT[s]]++; modeCounts[MODALITY[s]]++; }
  const domElement = dominantOf(elemCounts);
  const domModality = dominantOf(modeCounts);

  // House relationships among the four active houses.
  const relations: HouseRelation[] = [];
  for (let i = 0; i < houses.length; i++)
    for (let j = i + 1; j < houses.length; j++)
      relations.push({ a: houses[i], b: houses[j], kind: houseRelation(houses[i], houses[j]) });

  // Rulers of each layer sign, with repeat-weighting.
  const rulerNames = layerSigns.map((s) => RULERS[s] || s);
  const rulerCounts = new Map<string, number>();
  for (const r of rulerNames) rulerCounts.set(r, (rulerCounts.get(r) || 0) + 1);
  const conditions = Array.from(rulerCounts.entries())
    .map(([p, c]) => rulerCondition(p, c, ctx))
    .sort((a, b) => b.count - a.count || (b.strengthScore ?? 0) - (a.strengthScore ?? 0));
  const dominant = conditions.find((c) => c.count >= 2) || conditions[0];

  // Recurring patterns.
  const houseCounts = new Map<number, number>();
  for (const h of houses) houseCounts.set(h, (houseCounts.get(h) || 0) + 1);
  const signCounts = new Map<string, number>();
  for (const s of layerSigns) signCounts.set(s, (signCounts.get(s) || 0) + 1);
  const repeatedHouses = Array.from(houseCounts.entries()).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]);
  const repeatedSigns = Array.from(signCounts.entries()).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]);
  const repeatedRulers = Array.from(rulerCounts.entries()).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]);

  const narrative = compose({
    planet, angle, natalSign, natalHouse, duadSign, duadHouse, compSign, compHouse,
    matrixSign, matrixHouse, relations, domElement, elemCounts, domModality,
    modeCounts, dominant, repeatedHouses, repeatedSigns, repeatedRulers, weights,
  });

  return {
    planet, angle, natalSign, natalHouse, duadSign, duadHouse, compSign, compHouse, matrixSign, matrixHouse,
    houses, relations,
    elements: { counts: elemCounts, dominant: domElement },
    modalities: { counts: modeCounts, dominant: domModality },
    rulers: { conditions, dominant },
    patterns: { repeatedHouses, repeatedSigns, repeatedRulers },
    weights, narrative,
  };
}

// ── Narrative composer — plain-language, emotional, PREDICTIVE ───────────────
// Rules: no house numbers, no sign names, no aspect/dignity jargon in the prose.
// Lead with what could HAPPEN to you here. Speak to *you*. Be a little bold, but
// stay true to the real meaning of the planet/sign/house keywords underneath.
function cap(s: string): string { return s ? s[0].toUpperCase() + s.slice(1) : s; }
function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] || '';
  if (items.length === 2) return `${items[0]}, and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function compose(x: {
  planet: string; angle: Angle; natalSign: string; natalHouse: number;
  duadSign: string; duadHouse: number; compSign: string; compHouse: number;
  matrixSign: string; matrixHouse: number; relations: HouseRelation[];
  domElement: Element; elemCounts: Record<Element, number>;
  domModality: Modality; modeCounts: Record<Modality, number>;
  dominant?: RulerCondition;
  repeatedHouses: [number, number][]; repeatedSigns: [string, number][]; repeatedRulers: [string, number][];
  weights: InterpretationWeights;
}): string {
  const P = x.planet;
  const arena = ANGLE_AREA[x.angle] || HOUSE_LIFE[x.natalHouse];
  const parts: string[] = [];

  // 1. THE HEADLINE PREDICTION (planet × angle) — bold hook, then what happens.
  const pred = PREDICTIONS[P]?.[x.angle];
  if (pred) {
    const i = pred.indexOf('. ');
    parts.push(i > 0 ? `**${pred.slice(0, i + 1)}** ${pred.slice(i + 2)}` : `**${pred}**`);
  } else {
    parts.push(`**This is a place that stirs up ${arena}.** Something in you comes alive here, and it won't let you stay the same.`);
  }

  // 2. Why it lands on YOU differently — plain trait + your tender spot.
  parts.push(
    `It won't hit you the way it hits anyone else, though. You're ${SIGN_TRAIT[x.natalSign] || 'wired your own way'}, ` +
    `so this place reaches you right where you feel things most: ${HOUSE_LIFE[x.natalHouse]}.`,
  );

  // 3. What else it could touch — the finer layers as plain predictions, deduped.
  //    Exclude the natal house AND any repeated house (covered in para 4) so
  //    nothing echoes across paragraphs.
  const seenHouses = new Set<number>([x.natalHouse, ...x.repeatedHouses.map(([h]) => h)]);
  const spill = [x.duadHouse, x.compHouse, x.matrixHouse].filter((h) => { if (seenHouses.has(h)) return false; seenHouses.add(h); return true; });
  const allLayersAgree = x.duadSign === x.compSign && x.compSign === x.matrixSign;
  if (allLayersAgree && !spill.length) {
    parts.push(`And everything here keeps pointing at the same thing — there's no dodging it while you're in this place. It'll keep coming up until you deal with it.`);
  } else if (spill.length) {
    const preds = spill.map((h) => HOUSE_PREDICT[h]).filter(Boolean);
    parts.push(`And it won't stay in one lane. While you're here, ${joinList(preds)}.`);
  } else {
    parts.push(`Everything here keeps circling back to the same corner of your life, so there's no half-measure — this place asks for all of you.`);
  }

  // 4. The push-and-pull between the areas — plain, emotional.
  const priority: HouseRelation['kind'][] = ['reinforcing', 'opposing', 'tension', 'supporting', 'complementary'];
  const strongest = x.relations.filter((r) => r.kind !== 'minor')
    .sort((a, b) => priority.indexOf(a.kind) - priority.indexOf(b.kind))[0];
  if (x.repeatedHouses.length) {
    const [h] = x.repeatedHouses[0];
    parts.push(`So much of this place points at ${HOUSE_LIFE[h]} that it becomes the whole story — you won't be able to look away from it.`);
  } else if (strongest && strongest.a !== strongest.b) {
    const A = HOUSE_LIFE[strongest.a], B = HOUSE_LIFE[strongest.b];
    const phrase: Record<string, string> = {
      reinforcing: `two sides of this place push the very same button, so it hits you twice as hard`,
      supporting: `${A} and ${B} feed each other here — a win in one lifts the other`,
      complementary: `${A} and ${B} keep opening doors for each other the moment you move`,
      opposing: `you'll feel torn between ${A} and ${B} — this place makes you choose, or learn to hold both at once`,
      tension: `${A} and ${B} rub against each other here, and that friction is exactly what forces you to grow`,
    };
    parts.push(cap(phrase[strongest.kind]) + '.');
  }

  // 5. The emotional weather (element + modality) — no labels.
  parts.push(`${cap(ELEMENT_ATMOSPHERE[x.domElement])}, and it ${MODALITY_EFFECT[x.domModality]}.`);

  // 6. The undercurrent (dominant ruler) — plain theme + light personalization.
  if (x.dominant) {
    const theme = RULER_THEME[x.dominant.planet];
    if (theme) {
      const tail = x.dominant.available
        ? (x.dominant.strengthLabel === 'strong'
            ? ' — and that comes so naturally to you it can take over fast'
            : x.dominant.strengthLabel === 'challenged'
              ? " — and it's something you've always had to wrestle with, which is exactly the nerve this place presses on"
              : '')
        : '';
      parts.push(`Underneath all of it runs one steady current: a ${theme}. It keeps showing up here${tail}.`);
    }
  }

  // 7. Close — a forward-looking, emotional prediction (a little risky).
  parts.push(
    `Come here, and life will keep nudging you toward ${arena} whether you feel ready or not — the beautiful parts and the hard parts together. ` +
    `Some people find exactly what they were missing in a place like this. Others get shaken loose from what they thought they wanted. Rarely does anyone leave unchanged.`,
  );

  return parts.join('\n\n');
}
