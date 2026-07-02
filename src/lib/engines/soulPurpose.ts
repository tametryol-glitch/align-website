/**
 * Soul Purpose (web) — read the North Node from a natal chart and produce the
 * evolutionary "what your soul is here to grow toward" reading.
 *
 * North-Node counterpart to earthlyPurpose.ts (Earth). Ships the deterministic
 * reading with an AI upgrade wired through the same astrologer_chat stream the
 * Earthly Purpose card uses.
 */

import {
  calculateHiddenZodiacPlacement,
  longitudeToArcSeconds,
  arcSecondsToFormattedPosition,
  RULERS,
  type HiddenZodiacPlacement,
} from './hiddenZodiacEngine';
import { findSupportedObject } from './hiddenZodiacSupportedObjects';
import { interpretHiddenZodiac } from './hiddenZodiacInterpreter';
import { buildPurposePoints, purposePointsHeader } from './purposePoints';

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

/** Founder-feedback mandate: make the reader feel SEEN, not lectured. */
export const SOUL_PURPOSE_MANDATE = [
  'WRITE A READING THAT MAKES THE PERSON FEEL SEEN — not a lecture on astrology. Hard rules:',
  '- NEVER explain what a Duad, Compendium, sign, house, ruler, or the North Node "is", and never use those words as labels or headings. The reader does not care how the system works — they want to understand THEMSELVES.',
  '- Name specific, bold personality traits they will instantly recognise: how they actually behave, decide, love, work, grow, resist their own growth, and evolve. Make several claims sharp enough that they think "that is exactly me."',
  '- Answer three questions head-on, woven into the prose: (1) what is your soul here to grow toward, become, and ultimately fulfil in this lifetime; (2) WHY does growth in this direction feel unfamiliar or uncomfortable even though it is what you most need; (3) WHY do the same lessons and pulls keep returning until you move toward it.',
  '- Use cause and effect tied to the real areas of their life (the houses), so it reads like their actual soul journey, not a generic horoscope.',
  '- Be direct and confident. No hedging, no flattery, no "this is a powerful placement", no vague reassurance. Naming an uncomfortable truth is good. Use the ruler signs/houses/conjunctions as the REASONS behind their growth path, never as definitions.',
  'FORMAT: one flowing reading in the second person, about 4 to 6 short paragraphs, no bullet points or section labels.',
  'The flowing prose reading MUST include a clear final paragraph that gives a CLEAR, DESCRIPTIVE statement of their soul purpose. Begin that paragraph with "Your soul purpose:" and then, in 2 to 4 sentences, state plainly and specifically what their soul is here to grow into, become, and fulfil in this life — concrete enough that they could repeat it back as their mission. Do not be vague, poetic, or hedged here; name the actual soul purpose.',
  'THEN, after that soul-purpose paragraph, on a new line add the EXACT header "What your soul is here to grow toward:" followed by EXACTLY 10 numbered items (1. through 10.). Each item is ONE short, concrete, specific thing their soul is here to grow toward, develop, or experience in this life — a quality to build, an arena to step into, a pattern to move beyond, an experience to have, a way of relating, or a contribution. Be BOLD, DIRECT, and SPECIFIC — name the actual quality, arena, experience, or pattern to move beyond (say "let people help you instead of doing it all alone", never "growth and connection"). Every item distinct, no repeats, NO vague categories or abstract theme-dumps, one per line, no extra explanation.',
].join('\n');

export interface SoulPurposeContext {
  placement: HiddenZodiacPlacement;
  ascendantSign: string | null;
  conjunctions: Record<string, string[]>;
}

/** Normalised chart shape the deriver needs. */
interface NormalChart {
  planets: { name: string; longitude: number }[];
  aspects: { planet1: string; planet2: string; type: string }[];
  ascendant: number | null;
}

/**
 * Map the backend /charts/natal response into the shape deriveSoulPurpose
 * expects. Tolerant of the app's already-mapped shape.
 */
export function normaliseChart(raw: any): NormalChart {
  const positions = Array.isArray(raw?.positions) ? raw.positions : Array.isArray(raw?.planets) ? raw.planets : [];
  const planets = positions
    .filter((p: any) => Number.isFinite(p?.longitude))
    .map((p: any) => ({ name: p.name, longitude: p.longitude }));

  const rawAspects = Array.isArray(raw?.aspects) ? raw.aspects : [];
  const aspects = rawAspects.map((a: any) => ({
    planet1: a.planet1 ?? a.body1,
    planet2: a.planet2 ?? a.body2,
    type: String(a.type ?? a.aspect_name ?? '').toLowerCase(),
  }));

  let ascendant: number | null = Number.isFinite(raw?.ascendant) ? raw.ascendant : null;
  if (ascendant == null) {
    const asc = positions.find((p: any) => p?.name === 'Ascendant');
    if (asc && Number.isFinite(asc.longitude)) ascendant = asc.longitude;
    else if (Array.isArray(raw?.house_cusps) && Number.isFinite(raw.house_cusps[0])) ascendant = raw.house_cusps[0];
  }

  return { planets, aspects, ascendant };
}

const ordinal = (n: number | null): string => {
  if (!n) return 'an unresolved house';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]} house`;
};

/** Find the North Node, tolerant of aliases (True/Mean Node). */
function findNorthNode(planets: { name: string; longitude: number }[]): { name: string; longitude: number } | null {
  for (const p of planets) {
    if (!Number.isFinite(p.longitude)) continue;
    if (findSupportedObject(p.name)?.name === 'North Node') return p;
  }
  return null;
}

export function deriveSoulPurpose(rawChart: any): SoulPurposeContext | null {
  const chart = normaliseChart(rawChart);
  const node = findNorthNode(chart.planets);
  if (!node) return null;

  const ascendantSign = Number.isFinite(chart.ascendant) ? longitudeToArcSeconds(chart.ascendant as number).sign : null;
  const nodeLon = (((node.longitude % 360) + 360) % 360);
  const { sign, arcSecondsWithinSign } = longitudeToArcSeconds(nodeLon);
  const f = arcSecondsToFormattedPosition(arcSecondsWithinSign);

  const natalByName: Record<string, { name: string; sign: string; longitudeDeg: number }> = {};
  for (const p of chart.planets) {
    const canonical = findSupportedObject(p.name)?.name ?? p.name;
    natalByName[canonical] = { name: canonical, sign: longitudeToArcSeconds(p.longitude).sign, longitudeDeg: p.longitude };
  }

  const placement = calculateHiddenZodiacPlacement({
    objectName: 'North Node',
    objectType: 'node',
    sign,
    degree: f.degree,
    minute: f.minute,
    second: f.second,
    ascendantSign,
    natalByName,
    depthMode: 'deep',
  });

  const rulers = [
    placement.rulerChain.mainRuler.ruler,
    placement.rulerChain.duadRuler.ruler,
    placement.rulerChain.compendiumRuler.ruler,
  ].filter(Boolean) as string[];
  const conjunctions: Record<string, string[]> = {};
  for (const asp of chart.aspects) {
    if (asp.type !== 'conjunction') continue;
    for (const r of rulers) {
      if (asp.planet1 === r && asp.planet2 !== r) (conjunctions[r] ||= []).push(asp.planet2);
      else if (asp.planet2 === r && asp.planet1 !== r) (conjunctions[r] ||= []).push(asp.planet1);
    }
  }

  return { placement, ascendantSign, conjunctions };
}

/** Flowing fallback paragraph assembled from the structured engine reading. */
export function deterministicSoulPurpose(ctx: SoulPurposeContext): string {
  const r = interpretHiddenZodiac(ctx.placement);
  const points = buildPurposePoints(ctx.placement, 'soul');
  const list = [purposePointsHeader('soul'), ...points.map((t, i) => `${i + 1}. ${t}`)].join('\n');
  return [r.primarySummary, r.threeHouseSynthesis, r.rulerSynthesis, r.operates, list]
    .filter(Boolean)
    .join('\n\n');
}

// ── AI prompt (self-contained; mirrors the app's soul-purpose prompt) ────────

function rulerFacts(ctx: SoulPurposeContext): string {
  const { placement: p, conjunctions } = ctx;
  const rc = p.rulerChain;
  const line = (label: string, link: typeof rc.mainRuler) => {
    if (!link.ruler) return `${label}: (no ruler)`;
    const where = link.position?.sign ? ` in ${link.position.sign}${link.house ? ` (your ${ordinal(link.house)})` : ''}` : '';
    const conj = conjunctions[link.ruler]?.length ? `, conjunct ${conjunctions[link.ruler].join(' and ')}` : '';
    return `${label}: ${link.ruler}${where}${conj}`;
  };
  return [
    line(`Sign ruler (${p.position.sign})`, rc.mainRuler),
    line(`Duad ruler (${p.duad.sign})`, rc.duadRuler),
    line(`Compendium ruler (${p.compendium.sign})`, rc.compendiumRuler),
  ].join('\n');
}

export function buildSoulPurposeSystemPrompt(ctx: SoulPurposeContext): string {
  const p = ctx.placement;
  const rc = p.rulerChain;
  const rulership = SIGNS.map((s) => `- ${s} is ruled by ${RULERS[s]}`).join('\n');
  let houseMap = 'No Ascendant: do not assign houses.';
  if (ctx.ascendantSign) {
    const ai = SIGNS.indexOf(ctx.ascendantSign);
    if (ai >= 0) houseMap = `WHOLE-SIGN HOUSE MAP (${ctx.ascendantSign} rising):\n` + SIGNS.map((_, k) => `${k + 1}. ${SIGNS[(ai + k) % 12]}`).join('  ');
  }
  return [
    "You are a precise, psychologically literate astrologer writing one SOUL PURPOSE reading for Align. The North Node is the soul's evolutionary direction — the qualities, arena, and destiny a person is here to grow toward, become, and fulfil across this lifetime. It is the growth edge that feels unfamiliar yet is exactly what they came here for.",
    '',
    'CUSTOM RULERSHIP — use this exactly (never the traditional substitutes):',
    rulership,
    '',
    houseMap,
    '',
    'THESE CALCULATED VALUES ARE THE SOURCE OF TRUTH — never recalculate or change them:',
    `- North Node at ${p.position.text}, primary house ${p.primaryHouse ?? 'unknown'}.`,
    `- Duad ${p.duad.sign} (house ${p.duad.activatedHouse ?? 'unknown'}); Compendium ${p.compendium.sign} (house ${p.compendium.activatedHouse ?? 'unknown'}).`,
    `- Rulers: ${p.position.sign}→${rc.mainRuler.ruler}, ${p.duad.sign}→${rc.duadRuler.ruler}, ${p.compendium.sign}→${rc.compendiumRuler.ruler}.`,
    '',
    'RULER & CONJUNCTION FACTS (use as REASONS, not definitions):',
    rulerFacts(ctx),
    '',
    SOUL_PURPOSE_MANDATE,
  ].join('\n');
}

export function buildSoulPurposeUserPrompt(ctx: SoulPurposeContext): string {
  const p = ctx.placement;
  return `Write my soul purpose reading. Fixed facts: North Node ${p.position.text}, ${p.primaryHouse ? p.primaryHouse + 'th house' : ''}; Duad ${p.duad.sign}; Compendium ${p.compendium.sign}.`;
}

export { ordinal };
