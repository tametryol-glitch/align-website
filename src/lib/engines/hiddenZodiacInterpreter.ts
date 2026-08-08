/**
 * Hidden Zodiac — structured interpretation synthesizer (v3, predictive voice).
 *
 * Deterministic and offline. The job of this module is to make a person feel
 * SEEN and slightly exposed — not to teach them how the calculation works. It
 * speaks in the second person, present and near-future tense, and makes bold,
 * specific, behavioural, PREDICTIVE claims: who you are, what will keep
 * happening, what you'll catch yourself doing, and what to expect from yourself
 * under pressure. It reads the calculated layers (surface sign, deeper sign
 * textures, three houses, ruling bodies) and metabolises them into a portrait —
 * never a textbook entry. It NEVER names the machinery (no "Duad", "Compendium",
 * "layer", "engine", "mechanism", "three layers"); the reader only ever meets
 * themselves.
 *
 * Each sign-data field has ONE home builder so no phrase repeats verbatim across
 * sections; polishReading is a deterministic safety net that drops any sentence
 * already used earlier (covers the same-sign edge cases). It never recalculates
 * the placement, never stacks adjectives, and stays clear of the repo's
 * BANNED_PHRASES (asserted in tests).
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

export const HIDDEN_ZODIAC_CONTENT_VERSION = 'hz-content-v4';

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
  let t = `${cap(planetDomain(planet))}. And yours doesn't run the way a ${surfaceSign} label would have you believe. ${b.you}`;
  if (c.sameDuad) {
    t += ` There's no second face here — it runs ${surfaceSign} all the way down, which makes you more concentrated than complicated and almost impossible to misread once someone's actually paying attention.`;
  } else {
    t += ` Here's what most people never get to see. Under the ${surfaceSign} surface, a quieter ${duadSign} runs the show: ${lowerFirst(dB.you)} You present ${surfaceSign} and you mean ${duadSign}, and everyone who only gets the ${surfaceSign} version keeps misreading why you do what you do. Some days, so do you.`;
  }
  return t;
}

function buildOperates(c: Ctx): string {
  const { b, dB, cB, surfaceSign, duadSign, compSign } = c;
  const duadComp = duadSign === compSign; // deeper textures collapse to one sign
  let t = `Why you do what you do: from the outside it reads as ${surfaceSign}, but the reason underneath is ${duadSign} — ${dB.drive}. ${b.others} `;
  if (duadComp) {
    t += `And that same ${duadSign} pull only gets more absolute when the stakes turn real — it stops being a preference and becomes the thing you'll burn everything else down to protect. `;
  } else {
    t += `And when the stakes turn real, something colder and more ${compSign} takes the wheel — ${cB.drive} — the part of you that only comes out when it counts. `;
  }
  t += `That gap is why two people born with this exact placement can be nothing alike: most of them live on the ${surfaceSign} version and never catch the ${duadSign} reason${duadComp ? '' : ` or the ${compSign} reflex`} running the whole show. You'll catch it now — probably the next time you surprise yourself.`;
  return t;
}

function buildDuad(c: Ctx): string {
  const { dB, surfaceSign, duadSign, duadHouse } = c;
  if (c.sameDuad) {
    return `What drives you is exactly what you show — there's no quieter second want tugging the other way. That's rarer than you think, and it makes you relentless: what you're after is never a mystery, least of all to whoever's on the receiving end of it.`;
  }
  let t = `What you're really chasing runs ${duadSign}, and it rarely matches the ${surfaceSign} story you tell about yourself. ${dB.pattern} It's the want you almost never say out loud: ${dB.secret}`;
  if (duadHouse) {
    t += ` You'll notice it most around ${arena(duadHouse)} — that's where you catch yourself wanting something you'd never quite admit to.`;
  }
  return t;
}

function buildCompendium(c: Ctx): string {
  const { cB, compSign, compHouse, duadSign } = c;
  let t: string;
  if (compSign === duadSign) {
    // Same sign as the driver — don't restate its psychology; describe the escalation.
    t = `Push it to the edge and that same ${compSign} need stops negotiating — it stops being something you manage and becomes something that manages you. You'll only clock how far it took you once the pressure drops.`;
  } else {
    t = `And when you're truly cornered — past the point of managing it — a colder ${compSign} reflex takes over. ${cB.secret} ${cB.pattern} You won't see it coming in the moment; you'll recognise it afterward, in what you did when the pressure peaked.`;
  }
  if (compHouse) {
    t += ` It goes hunting for its win in ${arena(compHouse)} — that's where your extremes tend to play out.`;
  }
  return t;
}

function buildThreeHouse(c: Ctx): string {
  const { b, primaryHouse, duadHouse, compHouse } = c;
  let t = `Here's what keeps happening, and will keep happening until you catch it live. ${b.pattern}`;
  if (primaryHouse && duadHouse && compHouse) {
    t +=
      ` It runs the same route every time: it ignites around ${arena(primaryHouse)}, you scramble to handle it through ${arena(duadHouse)}, and it finally lands on ${arena(compHouse)} — for better or worse. ` +
      `Watch the next time it fires. Same setup, same three moves, same ending. ` +
      `That's not bad luck and it's not other people — it's the shape of you meeting the world on repeat. The day you can name the loop while it's happening is the day you get to change how it ends.`;
  } else {
    t += ` Add your exact birth time and this locks onto three specific arenas — where it ignites, how you scramble, and where it always lands. Even without it, you already know the shape: it's been running the same way for years.`;
  }
  return t;
}

function joinLabels(labels: string[]): string {
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}

/** Join ruler clauses (which already contain commas) with semicolons. */
function joinRulerClauses(items: string[]): string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]}; and ${items[1]}`;
  return `${items.slice(0, -1).join('; ')}; and ${items[items.length - 1]}`;
}

/** Full, single-focus description used when every layer answers to one place. */
function richRulerGroup(members: { rulerName: string | null }[], sign: string | null, house: number | null): string {
  const rulerNames = Array.from(new Set(members.map((m) => m.rulerName).filter(Boolean))) as string[];
  const who = rulerNames.length ? joinLabels(rulerNames) : 'its ruler';
  const many = rulerNames.length > 1;
  if (!sign) {
    return `Follow this all the way down and it answers to ${who} — but where ${many ? 'they sit' : 'it sits'} in your chart isn't set yet. Add where ${many ? 'they sit' : 'it sits'} and you'll see exactly what your whole pattern has been quietly working toward.`;
  }
  const th = SIGN_THEMES[sign];
  let s = `Follow this all the way down and it answers to ${who}, sitting in ${sign}${house ? ` in your ${ordinal(house)} (${houseFunction(house)})` : ''}. `;
  s += `So everything here is ultimately in service of a ${sign} drive ${th?.drive ?? 'of its own'}`;
  s += house ? `, aimed squarely at ${arena(house)}. ` : `. `;
  s += `At your best that shows up as ${th?.gift ?? 'real strength'}; running on fear, it curdles into ${th?.shadow ?? 'its own excess'}. This is the hand on the wheel you don't usually notice.`;
  return s;
}

/** Short clause used when the layers pull toward different places. */
function shortRulerClause(members: { rulerName: string | null }[], sign: string | null, house: number | null): string {
  const rulerNames = Array.from(new Set(members.map((m) => m.rulerName).filter(Boolean))) as string[];
  const who = rulerNames.length ? joinLabels(rulerNames) : 'its ruler';
  const many = rulerNames.length > 1;
  if (!sign) {
    return `${who}, wherever ${many ? 'they sit' : 'it sits'} in your chart — add that to see what it's steering you toward`;
  }
  const th = SIGN_THEMES[sign];
  return `${who} in ${sign}${house ? `, in your ${ordinal(house)} (${arena(house)})` : ''}, aimed at one thing — ${th?.drive ?? 'something all its own'}`;
}

function buildRuler(c: Ctx): string {
  const { p } = c;
  const rc = p.rulerChain;
  const layers: { link: RulerLink }[] = [
    { link: rc.mainRuler },
    { link: rc.duadRuler },
    { link: rc.compendiumRuler },
  ];

  // Group layers whose rulers share the same sign + house so the same placement
  // is never described twice (e.g. two rulers both in Sagittarius, 5th house).
  const groups = new Map<string, { sign: string | null; house: number | null; members: { rulerName: string | null }[] }>();
  for (const { link } of layers) {
    const sign = link.position?.sign ?? null;
    const house = link.house ?? null;
    // Unplaced rulers stay separate (keyed by ruler) so each prompts individually.
    const key = sign ? `${sign}|${house ?? 'x'}` : `unplaced|${link.ruler ?? ''}`;
    if (!groups.has(key)) groups.set(key, { sign, house, members: [] });
    groups.get(key)!.members.push({ rulerName: link.ruler });
  }

  const gs = Array.from(groups.values());
  let t: string;
  if (gs.length === 1) {
    // Everything reports to one place — give it the full, focused treatment.
    t = richRulerGroup(gs[0].members, gs[0].sign, gs[0].house);
  } else {
    // Different pulls — lead with one framing, then list them once each.
    const clauses = gs.map((g) => shortRulerClause(g.members, g.sign, g.house));
    t = `Follow this all the way down and it doesn't report to one master — it splits: ${joinRulerClauses(clauses)}. ` +
      `Those are the hands on the wheel you rarely notice, and they pull in slightly different directions — which is why you can feel like more than one person inside a single decision.`;
  }
  if (rc.mainDispositorChain?.closedCircuit) {
    t += ` And these answer only to each other, a closed loop with no exit — which is exactly why this runs so deep and is so hard to argue yourself out of.`;
  }
  return t;
}

function buildStrengths(c: Ctx): string {
  const { b, cB, surfaceSign, compSign } = c;
  if (c.sameComp) {
    return `Your strength here is unusually clean — the same force runs through all of it, with no contradiction to dilute it: ${b.power} People will lean on this in you before they can explain why.`;
  }
  return (
    `Here's the edge no sun-sign paragraph will ever hand you, because it only exists in your exact mix: ${b.power} ` +
    `And because of that colder ${compSign} thread, you've got a second gear most ${surfaceSign} people never build — ${lowerFirst(cB.power)} You reach for it in the moments that actually decide things.`
  );
}

function buildShadow(c: Ctx): string {
  const { b, cB, compSign } = c;
  return (
    `${b.trap} And when that colder ${compSign} part of you gets scared, it doesn't back off — it doubles down: ${lowerFirst(cB.trap)} ` +
    `You'll do it under stress before you notice you're doing it. None of it is fixed, though — it loosens the moment you catch it live and say it out loud instead of acting it out. You've got a real shot at that now, because you finally know where to look.`
  );
}

function buildEmotional(c: Ctx): string {
  const { b, surfaceSign } = c;
  return (
    `${b.secret} What you actually need — and almost never ask for straight — is to have exactly that met head-on instead of performed around. ` +
    `You'll keep hinting and testing for it and calling that "fine." You settle the instant someone gives it to you directly; you come apart when you're left holding feelings the ${surfaceSign} face of you was never built to carry.`
  );
}

function buildRelationships(c: Ctx): string | null {
  if (!planetFunction(c.planet).relational) return null;
  const { b, dB, surfaceSign, duadSign } = c;
  return (
    `${b.love} But don't fully trust the signals you send — what you actually want up close leans ${duadSign}: ${lowerFirst(dB.love)} ` +
    `The ones who get you are the rare few who read that ${duadSign} need under the ${surfaceSign} noise; everyone else falls for the version you perform, and you'll quietly resent them for believing it. Your attraction and your friction come from the same spot — expect both from anyone who gets in deep.`
  );
}

function buildCareerMoney(c: Ctx): string {
  const { b, compSign, compHouse } = c;
  let t = b.work;
  if (compHouse) {
    const payoff = [2, 8, 10].includes(compHouse) ? 'real money, recognition, or earned authority' : 'lasting results you can point to';
    t += ` Your deeper drive keeps pointing at ${arena(compHouse)} — ${houseFunction(compHouse)} — so over years, not weeks, your ${compSign} way of working tends to harden into something concrete there: ${payoff}. Bet on the long version of yourself, not the quick one.`;
  }
  t += ` No chart hands you the win — this is the road, not the receipt.`;
  return t;
}

function buildDevelopment(c: Ctx): string {
  const { b, surfaceSign, duadSign, compSign } = c;
  return (
    `${b.mature} The real work is to stop treating how you come across and what actually drives you as a contradiction you have to hide, and start running them on purpose — let ${surfaceSign} open the door, let ${duadSign} pick the direction, let ${compSign} decide what's worth the fight. ` +
    `Most people take years, or one brutal reckoning, to do this deliberately; you're already ahead just by seeing it laid out. So here's the move: next time the pattern fires, catch it on the second beat instead of the last. That's the whole game.`
  );
}

function buildExamples(c: Ctx): string[] {
  const { b, dB, surfaceSign, duadSign, primaryHouse, duadHouse, compHouse } = c;
  // Example #2 uses the deeper trap so it never echoes the shadow section's surface trap.
  const trap = c.sameDuad ? b.trap : dB.trap;
  const out = [
    `Watch the next time something goes sideways: outwardly you'll go full ${surfaceSign}, but inside, the ${duadSign} part of you is already running a different script — and the people closest to you read that gap even when you're sure you're hiding it.`,
    `You'll catch yourself doing this: ${lowerFirst(trap)} It feels like protecting yourself in the moment. It's usually costing you the exact thing you were reaching for.`,
  ];
  if (primaryHouse && duadHouse && compHouse) {
    out.push(
      `The scene repeats on schedule: ${arena(primaryHouse)} pulls you in, you work it through ${arena(duadHouse)}, and it lands on ${arena(compHouse)}. Once you can see the loop coming, you get to break it before it finishes.`,
    );
  }
  return out;
}

// ── anti-repetition: drop any sentence already used earlier (deterministic) ──

const PROSE_KEYS: (keyof HiddenZodiacReading)[] = [
  'primarySummary', 'operates', 'threeHouseSynthesis', 'duadLayer', 'compendiumLayer',
  'emotionalPattern', 'shadow', 'strengths', 'relationships', 'careerMoney',
  'rulerSynthesis', 'lifeDevelopment',
];

const normSentence = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

/**
 * Remove any sentence that has already appeared in an earlier section (or
 * earlier in the same section). Processed in reading order so the first, most
 * natural home for a phrase keeps it. A safety net for same-sign placements
 * where the surface and a deeper layer resolve to identical sign data.
 */
export function polishReading(reading: HiddenZodiacReading): HiddenZodiacReading {
  const seen = new Set<string>();
  for (const key of PROSE_KEYS) {
    const value = reading[key];
    if (typeof value !== 'string' || !value) continue;
    const sentences = value.split(/(?<=[.!?])\s+/);
    const kept: string[] = [];
    for (const s of sentences) {
      const n = normSentence(s);
      if (!n) continue;
      if (seen.has(n)) continue;
      seen.add(n);
      kept.push(s);
    }
    (reading[key] as unknown as string) = kept.join(' ');
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
    { key: 'threeHouseSynthesis', title: 'What keeps happening to you' },
    { key: 'duadLayer', title: 'What actually drives you' },
    { key: 'compendiumLayer', title: 'The instinct you fall back on' },
    { key: 'emotionalPattern', title: 'What you secretly need' },
    { key: 'shadow', title: 'Where you trip yourself up' },
    { key: 'strengths', title: 'Your real strengths' },
    { key: 'relationships', title: 'In love and closeness' },
    { key: 'careerMoney', title: 'Work, money, and purpose' },
    { key: 'rulerSynthesis', title: 'The force underneath it all' },
    { key: 'lifeDevelopment', title: 'How you grow into it' },
  ];
  const out: ReadingSection[] = [];
  for (const d of defs) {
    const body = reading[d.key];
    if (typeof body === 'string' && body.trim()) out.push({ key: d.key, title: d.title, body });
  }
  return out;
}
