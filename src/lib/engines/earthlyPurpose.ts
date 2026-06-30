/**
 * Earthly Purpose (web) — derive Earth (Sun + 180°) from a natal chart and
 * produce the grounded "what you're here to accomplish" reading.
 *
 * Web ships the deterministic reading (the same offline engine the app uses
 * when AI is off). The AI upgrade is wired on mobile and can be ported here once
 * the hidden_zodiac_ai_enabled flag is verified live.
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

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

/** Founder-feedback mandate: make the reader feel SEEN, not lectured. */
export const EARTHLY_PURPOSE_MANDATE = [
  'WRITE A READING THAT MAKES THE PERSON FEEL SEEN — not a lecture on astrology. Hard rules:',
  '- NEVER explain what a Duad, Compendium, sign, house, or ruler "is", and never use those words as labels or headings. The reader does not care how the system works — they want to understand THEMSELVES.',
  '- Name specific, bold personality traits they will instantly recognise: how they actually behave, decide, love, work, lead, sabotage themselves, and recover. Make several claims sharp enough that they think "that is exactly me."',
  '- Answer three questions head-on, woven into the prose: (1) what is your purpose — what are you here to build, become, and accomplish on this earth; (2) WHY do you operate the way you do; (3) WHY do the same kinds of situations keep finding you.',
  '- Use cause and effect tied to the real areas of their life (the houses), so it reads like their actual biography, not a generic horoscope.',
  '- Be direct and confident. No hedging, no flattery, no "this is a powerful placement", no vague reassurance. Naming an uncomfortable truth is good. Use the ruler signs/houses/conjunctions as the REASONS behind their behaviour, never as definitions.',
  'FORMAT: one flowing reading in the second person, about 4 to 6 short paragraphs, no bullet points or section labels.',
  'CRITICAL ENDING — the reading MUST finish with its own final paragraph that gives a CLEAR, DESCRIPTIVE statement of their life purpose. Begin that paragraph with "Your purpose:" and then, in 2 to 4 sentences, state plainly and specifically what they are here to do, build, become, and contribute on this earth — concrete enough that they could repeat it back as their mission. Do not be vague, poetic, or hedged here; name the actual purpose so the reader finishes knowing exactly what it is.',
].join('\n');

export interface EarthlyPurposeContext {
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
 * Map the backend /charts/natal response (positions / aspects with
 * body1·body2·aspect_name / Ascendant in positions or house_cusps) into the
 * shape deriveEarthlyPurpose expects. Tolerant of the app's already-mapped shape.
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

export function deriveEarthlyPurpose(rawChart: any): EarthlyPurposeContext | null {
  const chart = normaliseChart(rawChart);
  const sun = chart.planets.find((p) => p.name === 'Sun' && Number.isFinite(p.longitude));
  if (!sun) return null;

  const ascendantSign = Number.isFinite(chart.ascendant) ? longitudeToArcSeconds(chart.ascendant as number).sign : null;
  const earthLon = (((sun.longitude + 180) % 360) + 360) % 360;
  const { sign, arcSecondsWithinSign } = longitudeToArcSeconds(earthLon);
  const f = arcSecondsToFormattedPosition(arcSecondsWithinSign);

  const natalByName: Record<string, { name: string; sign: string; longitudeDeg: number }> = {};
  for (const p of chart.planets) {
    const canonical = findSupportedObject(p.name)?.name ?? p.name;
    natalByName[canonical] = { name: canonical, sign: longitudeToArcSeconds(p.longitude).sign, longitudeDeg: p.longitude };
  }

  const placement = calculateHiddenZodiacPlacement({
    objectName: 'Earth',
    objectType: 'point',
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
export function deterministicEarthlyPurpose(ctx: EarthlyPurposeContext): string {
  const r = interpretHiddenZodiac(ctx.placement);
  return [r.primarySummary, r.threeHouseSynthesis, r.rulerSynthesis, r.operates]
    .filter(Boolean)
    .join('\n\n');
}

// ── AI prompt (self-contained; mirrors the app's earthly-purpose prompt) ─────

function rulerFacts(ctx: EarthlyPurposeContext): string {
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

export function buildEarthlyPurposeSystemPrompt(ctx: EarthlyPurposeContext): string {
  const p = ctx.placement;
  const rc = p.rulerChain;
  const rulership = SIGNS.map((s) => `- ${s} is ruled by ${RULERS[s]}`).join('\n');
  let houseMap = 'No Ascendant: do not assign houses.';
  if (ctx.ascendantSign) {
    const ai = SIGNS.indexOf(ctx.ascendantSign);
    if (ai >= 0) houseMap = `WHOLE-SIGN HOUSE MAP (${ctx.ascendantSign} rising):\n` + SIGNS.map((_, k) => `${k + 1}. ${SIGNS[(ai + k) % 12]}`).join('  ');
  }
  return [
    'You are a precise, psychologically literate astrologer writing one EARTHLY PURPOSE reading for Align. Earth is the exact opposite of the Sun — the point of grounding, embodiment, and the practical destiny a person is here to build and accomplish in physical life.',
    '',
    'CUSTOM RULERSHIP — use this exactly (never the traditional substitutes):',
    rulership,
    '',
    houseMap,
    '',
    'THESE CALCULATED VALUES ARE THE SOURCE OF TRUTH — never recalculate or change them:',
    `- Earth at ${p.position.text}, primary house ${p.primaryHouse ?? 'unknown'}.`,
    `- Duad ${p.duad.sign} (house ${p.duad.activatedHouse ?? 'unknown'}); Compendium ${p.compendium.sign} (house ${p.compendium.activatedHouse ?? 'unknown'}).`,
    `- Rulers: ${p.position.sign}→${rc.mainRuler.ruler}, ${p.duad.sign}→${rc.duadRuler.ruler}, ${p.compendium.sign}→${rc.compendiumRuler.ruler}.`,
    '',
    'RULER & CONJUNCTION FACTS (use as REASONS, not definitions):',
    rulerFacts(ctx),
    '',
    EARTHLY_PURPOSE_MANDATE,
  ].join('\n');
}

export function buildEarthlyPurposeUserPrompt(ctx: EarthlyPurposeContext): string {
  const p = ctx.placement;
  return `Write my earthly purpose reading. Fixed facts: Earth ${p.position.text}, ${p.primaryHouse ? p.primaryHouse + 'th house' : ''}; Duad ${p.duad.sign}; Compendium ${p.compendium.sign}.`;
}

export { ordinal };
