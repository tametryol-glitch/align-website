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
  planet: string;
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
    planet, natalSign, natalHouse, duadSign, duadHouse, compSign, compHouse,
    matrixSign, matrixHouse, relations, domElement, elemCounts, domModality,
    modeCounts, dominant, repeatedHouses, repeatedSigns, repeatedRulers, weights,
  });

  return {
    planet, natalSign, natalHouse, duadSign, duadHouse, compSign, compHouse, matrixSign, matrixHouse,
    houses, relations,
    elements: { counts: elemCounts, dominant: domElement },
    modalities: { counts: modeCounts, dominant: domModality },
    rulers: { conditions, dominant },
    patterns: { repeatedHouses, repeatedSigns, repeatedRulers },
    weights, narrative,
  };
}

// ── Narrative composer — ONE cohesive, weighted, second-person reading ───────
function compose(x: {
  planet: string; natalSign: string; natalHouse: number;
  duadSign: string; duadHouse: number; compSign: string; compHouse: number;
  matrixSign: string; matrixHouse: number; relations: HouseRelation[];
  domElement: Element; elemCounts: Record<Element, number>;
  domModality: Modality; modeCounts: Record<Modality, number>;
  dominant?: RulerCondition;
  repeatedHouses: [number, number][]; repeatedSigns: [string, number][]; repeatedRulers: [string, number][];
  weights: InterpretationWeights;
}): string {
  const parts: string[] = [];
  const signManner = (s: string) => SIGN_THEMES[s]?.surface?.toLowerCase() || `${s} energy`;

  // 1. Lead — Planet + Natal house (45%) then Natal sign (25%): the foundation.
  parts.push(
    `**Here, ${planetEnergy(x.planet)} is switched on.** It runs through your ` +
    `**${x.natalSign} ${x.planet}** — ${signManner(x.natalSign)} — and lands squarely in your ` +
    `**${ordinal(x.natalHouse)} house**, so this place lights up **${houseTheme(x.natalHouse)}** more than anywhere else.`,
  );

  // 2. Duad / Compendium / Matrix — the deepening layers into their houses.
  parts.push(
    `Beneath that surface, the location threads three finer layers into your chart: its **duad** pulls in your ` +
    `**${ordinal(x.duadHouse)} house** (${houseTheme(x.duadHouse)}), its **compendium** your ` +
    `**${ordinal(x.compHouse)} house** (${houseTheme(x.compHouse)}), and at the very finest grain its **matrix** your ` +
    `**${ordinal(x.matrixHouse)} house** (${houseTheme(x.matrixHouse)}). These aren't separate readings — they're the same current, felt at deeper and deeper resolution.`,
  );

  // 3. House relationships — synthesize the strongest link.
  const priority: HouseRelation['kind'][] = ['reinforcing', 'opposing', 'tension', 'supporting', 'complementary'];
  const strongest = x.relations
    .filter((r) => r.kind !== 'minor')
    .sort((a, b) => priority.indexOf(a.kind) - priority.indexOf(b.kind))[0];
  if (x.repeatedHouses.length) {
    const [h, c] = x.repeatedHouses[0];
    parts.push(
      `**${c} of these layers land on your ${ordinal(h)} house** — that's the loudest signal here. ` +
      `Matters of ${houseTheme(h)} aren't a side-effect at this location; they're the whole point, amplified until you can't ignore them.`,
    );
  } else if (strongest) {
    const phrase: Record<string, string> = {
      reinforcing: `your ${ordinal(strongest.a)} and ${ordinal(strongest.b)} houses reinforce each other, doubling down on a single theme`,
      supporting: `your ${ordinal(strongest.a)} and ${ordinal(strongest.b)} houses flow together — one naturally supports and eases the other`,
      complementary: `your ${ordinal(strongest.a)} and ${ordinal(strongest.b)} houses open opportunities for each other when you act on them`,
      opposing: `your ${ordinal(strongest.a)} and ${ordinal(strongest.b)} houses sit in direct polarity — this place asks you to balance two pulls that want opposite things`,
      tension: `your ${ordinal(strongest.a)} and ${ordinal(strongest.b)} houses grind against each other — friction here is the engine of growth, not a malfunction`,
    };
    parts.push(`The areas of life this location activates don't sit in isolation: ${phrase[strongest.kind]}.`);
  }

  // 4. Elemental + modality atmosphere.
  const elemStr = (['Fire', 'Earth', 'Air', 'Water'] as Element[]).filter((e) => x.elemCounts[e]).map((e) => `${x.elemCounts[e]} ${e}`).join(', ');
  parts.push(
    `The elemental weather leans **${x.domElement}** (${elemStr}) — ${ELEMENT_ATMOSPHERE[x.domElement]}. ` +
    `In tempo it's **${x.domModality}**, which ${MODALITY_EFFECT[x.domModality]}.`,
  );

  // 5. Rulers — repeated-ruler dominant theme + natal condition modifier.
  if (x.dominant?.available) {
    const d = x.dominant;
    const repeated = d.count >= 2;
    const dignityPhrase: Record<string, string> = {
      domicile: 'sits in its own sign, strong and unmistakably itself',
      exaltation: 'is exalted — operating at its confident best',
      detriment: 'is in detriment, working against the grain and asking for conscious effort',
      fall: 'is in fall, quieter and easily undervalued unless you deliberately honor it',
      peregrine: 'is peregrine — unanchored, taking its tone from whatever it touches',
    };
    const aspText = d.aspects && d.aspects.length
      ? ` It's tied by ${d.aspects.slice(0, 2).map((a) => `${a.type} to ${a.other}`).join(' and ')}, so those energies bleed into everything you feel here.`
      : '';
    parts.push(
      `${repeated ? `**One planet quietly runs this location: ${d.planet}**, ruling ${d.count} of its layers` : `The ruling thread is **${d.planet}**`} — ` +
      `and in your chart ${d.planet} ${dignityPhrase[d.dignity!]}, placed in **${d.sign}** in your **${ordinal(d.house!)} house** (${d.strengthLabel}).${aspText} ` +
      `That personal condition is why this exact place will never mean the same thing to you as it would to anyone else.`,
    );
  }

  // 6. Repeated sign/ruler emphasis (extra pattern weight).
  if (x.repeatedSigns.length) {
    const [s, c] = x.repeatedSigns[0];
    parts.push(`**${s} repeats across ${c} layers** — its signature (${SIGN_THEMES[s]?.drive || 'its drive'}) is stamped through everything you'll live out here.`);
  }

  // 7. Closing — weighted life-direction synthesis.
  parts.push(
    `Put it together and this location is, above all, a **${x.natalSign} ${x.planet} / ${ordinal(x.natalHouse)}-house** place for you — ` +
    `${houseTheme(x.natalHouse)} carried on ${planetEnergy(x.planet).replace(/^your /, '')}, colored underneath by the ${x.duadHouse === x.natalHouse ? 'same' : `${ordinal(x.duadHouse)}-house`} duad and refined down to a ${x.matrixSign} matrix. ` +
    `Come here to work on that, and the place will keep handing you the exact experiences, people, and choices that push it forward.`,
  );

  return parts.join('\n\n');
}
