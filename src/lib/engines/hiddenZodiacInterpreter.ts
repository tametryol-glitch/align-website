/**
 * Hidden Zodiac — structured interpretation synthesizer (v2, personal voice).
 *
 * Deterministic and offline. The job of this module is to make a person feel
 * SEEN: it speaks in the second person, makes specific, bold, behavioural
 * claims, and traces cause and effect — who you are, why you operate the way
 * you do, the pattern that keeps repeating, and why life lands the way it does.
 * It reads the calculated layers (surface sign, Duad, Compendium, three houses,
 * ruler chain) and weaves them into a portrait, not a textbook entry.
 *
 * It never recalculates the placement, never stacks adjectives in place of
 * meaning, and stays clear of the repo's BANNED_PHRASES (asserted in tests).
 */

import type { HiddenZodiacPlacement } from './hiddenZodiacEngine';
import {
  signBehavior, planetDomain, planetFunction, houseFunction, SIGN_THEMES,
  type SignBehavior,
} from './hiddenZodiacConcepts';
import type { RulerLink } from './hiddenZodiacEngine';

export interface HiddenZodiacReading {
  primarySummary: string;
  duadLayer: string;
  compendiumLayer: string;
  threeHouseSynthesis: string;
  rulerSynthesis: string;
  operates: string;
  strengths: string;
  shadow: string;
  emotionalPattern: string;
  relationships: string | null; // null when not relevant to this body
  careerMoney: string;
  lifeDevelopment: string;
  examples: string[];
  contentVersion: string;
}

export const HIDDEN_ZODIAC_CONTENT_VERSION = 'hz-content-v2';

// ── small helpers ────────────────────────────────────────────────────────────

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const lowerFirst = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

function ordinal(n: number | null): string {
  if (!n) return 'an as-yet-unknown house';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]} house`;
}

/** First keyword of a house blurb ("money, self-worth…" → "money"). */
const arena = (h: number | null): string => (h ? (houseFunction(h).split(',')[0] || 'that area') : 'that area');

// ── section builders ─────────────────────────────────────────────────────────

interface Ctx {
  p: HiddenZodiacPlacement;
  planet: string;
  surfaceSign: string; duadSign: string; compSign: string;
  b: SignBehavior; dB: SignBehavior; cB: SignBehavior;
  primaryHouse: number | null; duadHouse: number | null; compHouse: number | null;
  sameDuad: boolean; sameComp: boolean;
}

function buildPrimary(c: Ctx): string {
  const { b, surfaceSign, duadSign, dB, planet } = c;
  let t = `This is ${planetDomain(planet)}. In ${surfaceSign}, here's how that actually shows up: ${b.you}`;
  if (c.sameDuad) {
    t += ` And there's no second face — it runs ${surfaceSign} all the way down, concentrated and impossible to miss.`;
  } else {
    t += ` Here's the part most people miss: under that ${surfaceSign} surface, you're really driven by ${duadSign} — ${dB.drive}. You come across as ${surfaceSign}, but you move for ${duadSign} reasons, and that gap is where the real you lives.`;
  }
  return t;
}

function buildOperates(c: Ctx): string {
  const { b, dB, cB, surfaceSign, duadSign, compSign, planet } = c;
  return (
    `Think of yourself in three layers. On the surface you run a ${surfaceSign} strategy — it's how you meet the world. ` +
    `The engine underneath is ${duadSign}: ${dB.drive}. ` +
    `And at the very bottom sits a ${compSign} instinct — ${cB.drive} — the one that takes over when it truly counts. ` +
    `${b.others} That mismatch between your ${surfaceSign} face and your ${duadSign}-and-${compSign} wiring is exactly why two people with the same ${planet} in ${surfaceSign} can be nothing alike.`
  );
}

function buildDuad(c: Ctx): string {
  const { dB, surfaceSign, duadSign, duadHouse } = c;
  if (c.sameDuad) {
    return `Your hidden layer doubles down on ${surfaceSign} — the undertone matches the surface, which makes you more concentrated rather than more complicated. What you see really is what's underneath.`;
  }
  let t = `${duadSign} is the part of you that only shows up close — under pressure, in private, with people who've earned it. ${dB.pattern} ${dB.secret}`;
  if (duadHouse) {
    t += ` Because ${duadSign} sits in your ${ordinal(duadHouse)} (${houseFunction(duadHouse)}), that's the area of life where this hidden engine keeps showing its hand.`;
  }
  return t;
}

function buildCompendium(c: Ctx): string {
  const { cB, compSign, compHouse } = c;
  let t = `Deeper still is a ${compSign} mechanism — the instinct that takes over when everything else fails. ${cB.secret} ${cB.trap}`;
  if (compHouse) {
    t += ` It chases its results in your ${ordinal(compHouse)} (${houseFunction(compHouse)}) — that's where this deepest part of you is quietly trying to win.`;
  }
  return t;
}

function buildThreeHouse(c: Ctx): string {
  const { b, primaryHouse, duadHouse, compHouse } = c;
  let t = `Here's the loop you'll recognise. ${b.pattern}`;
  if (primaryHouse && duadHouse && compHouse) {
    t +=
      ` Watch where it lives: it tends to start in your ${ordinal(primaryHouse)} (${houseFunction(primaryHouse)}), ` +
      `get worked out through your ${ordinal(duadHouse)} (${houseFunction(duadHouse)}), ` +
      `and finally land in your ${ordinal(compHouse)} (${houseFunction(compHouse)}). ` +
      `So the same kind of situation keeps finding you — it fires off around ${arena(primaryHouse)}, you handle it through ${arena(duadHouse)}, and it pays off or costs you around ${arena(compHouse)}. ` +
      `That isn't bad luck. It's the shape of your wiring meeting the world, again and again, until you can see it and change the ending.`;
  } else {
    t += ` Add your exact Ascendant and this pattern locks onto three specific areas of your life — where it starts, how you handle it, and where it finally lands.`;
  }
  return t;
}

function joinLabels(labels: string[]): string {
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}

/** Describe a placement that one or more layers' rulers share — once, never twice. */
function describeRulerGroup(members: { label: string; rulerName: string | null }[], sign: string | null, house: number | null): string {
  const labelList = members.map((m) => `${m.label} (${m.rulerName ?? 'its ruler'})`);
  const who = `Your ${joinLabels(labelList)}`;
  const plural = members.length > 1;
  if (!sign) {
    return `${who} ${plural ? 'point' : 'points'} to ${plural ? 'rulers' : 'a ruler'} whose chart position isn't set — add where they sit to see how this lands.`;
  }
  const th = SIGN_THEMES[sign];
  let s = plural
    ? `${who} all point to ${sign}${house ? ` in your ${ordinal(house)} (${houseFunction(house)})` : ''}. `
    : `${who} answers to ${members[0].rulerName ?? 'its ruler'}, sitting in ${sign}${house ? ` in your ${ordinal(house)} (${houseFunction(house)})` : ''}. `;
  s += `So ${plural ? 'those layers' : 'that layer'} ultimately serve a ${sign} drive ${th?.drive ?? 'of its own'}`;
  s += house ? `, aimed squarely at ${arena(house)}. ` : `. `;
  s += `At its best that shows up in you as ${th?.gift ?? 'real strength'}; under strain it tips into ${th?.shadow ?? 'its own excess'}.`;
  return s;
}

function buildRuler(c: Ctx): string {
  const { p, surfaceSign, duadSign, compSign } = c;
  const rc = p.rulerChain;
  const layers: { label: string; link: RulerLink }[] = [
    { label: `${surfaceSign} surface`, link: rc.mainRuler },
    { label: `${duadSign} Duad`, link: rc.duadRuler },
    { label: `${compSign} Compendium`, link: rc.compendiumRuler },
  ];

  // Group layers whose rulers share the same sign + house so the same placement
  // is never described twice (e.g. two rulers both in Sagittarius, 5th house).
  const groups = new Map<string, { sign: string | null; house: number | null; members: { label: string; rulerName: string | null }[] }>();
  for (const { label, link } of layers) {
    const sign = link.position?.sign ?? null;
    const house = link.house ?? null;
    // Unplaced rulers stay separate (keyed by ruler) so each prompts individually.
    const key = sign ? `${sign}|${house ?? 'x'}` : `unplaced|${link.ruler ?? ''}`;
    if (!groups.has(key)) groups.set(key, { sign, house, members: [] });
    groups.get(key)!.members.push({ label, rulerName: link.ruler });
  }

  let t = Array.from(groups.values()).map((g) => describeRulerGroup(g.members, g.sign, g.house)).join(' ');
  if (rc.mainDispositorChain?.closedCircuit) {
    t += ` These rulers also answer only to one another in a closed loop, which is why this pattern reinforces itself and is hard to argue your way out of.`;
  }
  return t;
}

function buildStrengths(c: Ctx): string {
  const { b, cB, surfaceSign, compSign } = c;
  if (c.sameComp) {
    return `Your ${surfaceSign} wiring runs clean through every layer, which makes this strength unusually concentrated and dependable: ${b.power}`;
  }
  return (
    `Here's the gift no single-sign horoscope will name, because it only exists in your exact blend: ${b.power} ` +
    `And because of the ${compSign} layer underneath, you've got a second gear most people with your ${surfaceSign} surface never build — ${lowerFirst(cB.power)}`
  );
}

function buildShadow(c: Ctx): string {
  const { b, cB, compSign } = c;
  return (
    `${b.trap} And when the ${compSign} layer underneath gets scared, it pushes further: ${lowerFirst(cB.trap)} ` +
    `None of this is fixed — most of it loosens the moment you catch it happening and name it out loud instead of acting it out.`
  );
}

function buildEmotional(c: Ctx): string {
  const { b, dB, surfaceSign } = c;
  return (
    `${b.secret} ${dB.secret} The thing you actually need — and almost never ask for straight — is to have that met head-on rather than performed around. ` +
    `You steady when someone gives it to you directly; you spin out when your ${surfaceSign} surface is left carrying feelings the deeper layers really own.`
  );
}

function buildRelationships(c: Ctx): string | null {
  if (!planetFunction(c.planet).relational) return null;
  const { b, dB, surfaceSign, duadSign } = c;
  return (
    `${b.love} But remember the engine underneath: what you actually want in closeness leans ${duadSign}. ${dB.secret} ` +
    `The people who get you are the ones who clock the ${duadSign} need beneath the ${surfaceSign} signals — and that's the same place your attraction and your friction both come from.`
  );
}

function buildCareerMoney(c: Ctx): string {
  const { b, compSign, compHouse } = c;
  let t = b.work;
  if (compHouse) {
    const payoff = [2, 8, 10].includes(compHouse) ? 'real money, recognition, or earned authority' : 'lasting results you can point to';
    t += ` Your deeper drive points straight at ${ordinal(compHouse)} matters — ${houseFunction(compHouse)} — so over the years your ${compSign} method tends to turn into something concrete there: ${payoff}.`;
  }
  t += ` No placement hands you success; this is the route, not the receipt.`;
  return t;
}

function buildDevelopment(c: Ctx): string {
  const { b, surfaceSign, duadSign, compSign } = c;
  return (
    `${b.mature} The specific work for you is to stop treating your ${surfaceSign} surface and your ${duadSign}-and-${compSign} depths as a contradiction, and start running them in order — lead with ${surfaceSign}, let ${duadSign} steer, let ${compSign} decide what actually matters. ` +
    `It usually takes people years, or one hard reckoning, to do this on purpose. You're ahead of that just by being able to see it laid out.`
  );
}

function buildExamples(c: Ctx): string[] {
  const { b, surfaceSign, duadSign, primaryHouse, duadHouse, compHouse } = c;
  const out = [
    `Something goes wrong: on the outside you go full ${surfaceSign}, but inside, the ${duadSign} part of you is already running a different script — and the people closest to you have learned to read that gap.`,
    `You'll catch yourself doing this: ${lowerFirst(b.trap)} It feels like protecting yourself in the moment, and it's usually costing you the exact thing you wanted.`,
  ];
  if (primaryHouse && duadHouse && compHouse) {
    out.push(
      `The scene repeats: a ${arena(primaryHouse)} situation pulls you in, you work it out through ${arena(duadHouse)}, and it lands — for better or worse — around ${arena(compHouse)}. Once you can see the loop, you get to change the ending.`,
    );
  }
  return out;
}

// ── anti-repetition: dedupe identical adjacent sentences (deterministic) ─────

const PROSE_KEYS: (keyof HiddenZodiacReading)[] = [
  'primarySummary', 'duadLayer', 'compendiumLayer', 'threeHouseSynthesis',
  'rulerSynthesis', 'operates', 'strengths', 'shadow', 'emotionalPattern',
  'relationships', 'careerMoney', 'lifeDevelopment',
];

export function polishReading(reading: HiddenZodiacReading): HiddenZodiacReading {
  for (const key of PROSE_KEYS) {
    const value = reading[key];
    if (typeof value !== 'string' || !value) continue;
    const sentences = value.split(/(?<=[.!?])\s+/);
    const deduped: string[] = [];
    for (const s of sentences) {
      if (deduped.length === 0 || deduped[deduped.length - 1].trim() !== s.trim()) deduped.push(s);
    }
    (reading[key] as unknown as string) = deduped.join(' ');
  }
  return reading;
}

// ── public API ───────────────────────────────────────────────────────────────

export function interpretHiddenZodiac(placement: HiddenZodiacPlacement): HiddenZodiacReading {
  const surfaceSign = placement.position.sign;
  const duadSign = placement.duad.sign;
  const compSign = placement.compendium.sign;

  // Behaviour data is defined for all 12 signs; fall back defensively.
  const b = signBehavior(surfaceSign);
  const dB = signBehavior(duadSign);
  const cB = signBehavior(compSign);
  if (!b || !dB || !cB) {
    const stub = `This placement is calculated, but its written interpretation is still being prepared.`;
    return {
      primarySummary: stub, duadLayer: stub, compendiumLayer: stub, threeHouseSynthesis: stub,
      rulerSynthesis: stub, operates: stub, strengths: stub, shadow: stub, emotionalPattern: stub,
      relationships: null, careerMoney: stub, lifeDevelopment: stub, examples: [],
      contentVersion: HIDDEN_ZODIAC_CONTENT_VERSION,
    };
  }

  const c: Ctx = {
    p: placement,
    planet: placement.object.name,
    surfaceSign, duadSign, compSign,
    b, dB, cB,
    primaryHouse: placement.primaryHouse,
    duadHouse: placement.duad.activatedHouse,
    compHouse: placement.compendium.activatedHouse,
    sameDuad: surfaceSign === duadSign,
    sameComp: surfaceSign === compSign,
  };

  const reading: HiddenZodiacReading = {
    primarySummary: buildPrimary(c),
    duadLayer: buildDuad(c),
    compendiumLayer: buildCompendium(c),
    threeHouseSynthesis: buildThreeHouse(c),
    rulerSynthesis: buildRuler(c),
    operates: buildOperates(c),
    strengths: buildStrengths(c),
    shadow: buildShadow(c),
    emotionalPattern: buildEmotional(c),
    relationships: buildRelationships(c),
    careerMoney: buildCareerMoney(c),
    lifeDevelopment: buildDevelopment(c),
    examples: buildExamples(c),
    contentVersion: HIDDEN_ZODIAC_CONTENT_VERSION,
  };
  return polishReading(reading);
}

export interface ReadingSection {
  key: keyof HiddenZodiacReading;
  title: string;
  body: string;
}

export function readingSections(reading: HiddenZodiacReading): ReadingSection[] {
  const defs: { key: keyof HiddenZodiacReading; title: string }[] = [
    { key: 'primarySummary', title: 'Who you are' },
    { key: 'operates', title: 'Why you operate the way you do' },
    { key: 'threeHouseSynthesis', title: 'The pattern that keeps repeating' },
    { key: 'duadLayer', title: 'The hidden second engine' },
    { key: 'compendiumLayer', title: 'The deepest driver' },
    { key: 'emotionalPattern', title: 'What you secretly need' },
    { key: 'shadow', title: 'Where you trip yourself up' },
    { key: 'strengths', title: 'Your real strengths' },
    { key: 'relationships', title: 'In love and closeness' },
    { key: 'careerMoney', title: 'Work, money, and purpose' },
    { key: 'rulerSynthesis', title: "Who's really steering" },
    { key: 'lifeDevelopment', title: 'How you grow into it' },
  ];
  const out: ReadingSection[] = [];
  for (const d of defs) {
    const body = reading[d.key];
    if (typeof body === 'string' && body.trim()) out.push({ key: d.key, title: d.title, body });
  }
  return out;
}
