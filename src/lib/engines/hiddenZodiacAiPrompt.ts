/**
 * Hidden Zodiac — AI enrichment layer (web).
 *
 * Self-contained port of the mobile prompt builder. Builds the structured
 * payload and system prompt for AI-generated prose, validates the response
 * against the calculated placement, and derives a cache key. The calculation
 * service is the SOLE source of truth: the AI is told never to recalculate the
 * Duad/Compendium or alter the placement, and — crucially — never to explain the
 * machinery. The validator rejects any response that contradicts the math or
 * Align's custom rulership. No network calls live here; the client wires this to
 * /api/ai/interpret (astrologer_chat mode) with a deterministic fallback.
 */

import { buildAiPayload, RULERS, type HiddenZodiacPlacement } from './hiddenZodiacEngine';
import { HIDDEN_ZODIAC_CONTENT_VERSION } from './hiddenZodiacInterpreter';
import { planetDomain } from './hiddenZodiacConcepts';

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// Voice guardrail — kept in sync with the mobile BANNED_PHRASES list so the web
// and app readings share the same tics-to-avoid.
const BANNED_LABELS = [
  'one of the most', 'one of the luckiest', 'the most powerful',
  'most spiritually significant', 'most powerful manifestation',
  'trust the process', 'you are safe. you are held', 'you are being called to',
  'this is not a drill', 'old skin', 'ancestral wound', 'somatic experiencing',
  'EMDR', 'depth psychology', 'pressure cooker', 'vice grip', 'the furnace',
  'this is not X — it is Y', 'that is not a metaphor',
  'some people experience this as X. Others experience it as Y',
  'most people spend their lives', 'most people are either', 'the soul [verbs]...',
];

function bannedPhrasesPromptBlock(): string {
  return `Never use the following phrases or constructions:\n${BANNED_LABELS.map((b) => `- "${b}"`).join('\n')}`;
}

/** The custom rulership block, rendered from the single-source RULERS map. */
function rulershipBlock(): string {
  const lines = SIGNS.map((s) => `- ${s} is ruled by ${RULERS[s]}`).join('\n');
  return (
    'CUSTOM RULERSHIP — use this system exactly, in every layer, label, and ruler chain:\n' +
    lines +
    '\nNever substitute Mercury for Virgo, Venus for Libra, Mars for Scorpio, Saturn for Aquarius, or Jupiter for Pisces.'
  );
}

/** Whole-Sign house map for the chart's Ascendant, so the AI cannot reinvent it. */
function houseMapBlock(ascendant: string | null): string {
  if (!ascendant) return 'No Ascendant supplied: do not assign houses; speak only to the Duad and Compendium signs.';
  const ascIdx = SIGNS.indexOf(ascendant);
  if (ascIdx < 0) return 'Ascendant unrecognised: do not assign houses.';
  const lines = SIGNS.map((_, k) => `${k + 1}. ${SIGNS[(ascIdx + k) % 12]}`).join('  ');
  return `WHOLE-SIGN HOUSE MAP (${ascendant} rising):\n${lines}`;
}

/**
 * The complete system prompt. Embeds the rulership rules, the house map, the
 * exact degrees/minutes/seconds, the calculated Duad/Compendium boundaries, the
 * ruler placements, the prohibited-repetition list, and the voice brief — plus
 * the hard guard that the calculation is the source of truth and the machinery
 * is never named.
 */
export function buildHiddenZodiacSystemPrompt(
  placement: HiddenZodiacPlacement,
  ascendant: string | null,
): string {
  const p = placement;
  return [
    'You are a sharp, psychologically literate astrologer writing ONE personal reading of a single placement for Align\'s Hidden Zodiac. This is a mirror, not a lesson.',
    '',
    `THIS READING IS ONLY ABOUT ${p.object.name} — ${planetDomain(p.object.name)}. Every sentence must be about THAT function and how it shapes their life. Do NOT write a general personality profile, and do NOT wander into unrelated areas (love, money, career, health, spirituality) unless ${p.object.name} is literally what governs them. Stay tight to the one thing this placement is responsible for.`,
    '',
    rulershipBlock(),
    '',
    houseMapBlock(ascendant),
    '',
    'THESE CALCULATED VALUES ARE YOUR PRIVATE SOURCE OF TRUTH — the raw inputs you metabolise into the reading. Do not recalculate them, do not round them, do not change the Duad or Compendium, and do not move the planet to a different house. The deeper sign textures and the ruling body colour and complicate the main placement; they never replace it:',
    `- ${p.object.name} at ${p.position.text} (exactly ${p.position.degree}°${p.position.minute}′${p.position.second}″).`,
    `- Primary house: ${p.primaryHouse ?? 'unknown (no Ascendant)'}.`,
    `- Duad: ${p.duad.sign} (range ${p.duad.startLabel}–${p.duad.endLabel}), activating house ${p.duad.activatedHouse ?? 'unknown'}.`,
    `- Compendium: ${p.compendium.sign} (range ${p.compendium.startLabel}–${p.compendium.endLabel}), activating house ${p.compendium.activatedHouse ?? 'unknown'}.`,
    `- Rulers: ${p.position.sign}→${p.rulerChain.mainRuler.ruler}, ${p.duad.sign} Duad→${p.rulerChain.duadRuler.ruler}, ${p.compendium.sign} Compendium→${p.rulerChain.compendiumRuler.ruler}.`,
    '',
    'HOW TO WRITE IT — non-negotiable:',
    '- Second person, present and near-future tense. Behavioural and specific. Name the actual thing they do, want, fear, and hide — not the astrology.',
    '- BE PREDICTIVE. This is the whole point. Tell them what will keep happening, what they will catch themselves doing, what to expect from themselves under pressure and over the next few years. Do not merely describe what they "are" — forecast what they are in for.',
    '- TAKE REAL RISKS. State the private pattern only they and the people closest to them would recognise — or the thing they have not consciously noticed about themselves yet. Edgy, direct, a little uncomfortable. Never cruel, never a doom verdict, never a diagnosis.',
    '- Make them feel SEEN, even slightly exposed. If it reads like a horoscope, you have failed.',
    '',
    'HARD RULES:',
    '- NEVER explain the machinery. Do not use the words "Duad", "Compendium", "layer", "sub-layer", "ruler chain", "activated house", "surface strategy", "engine", or "mechanism", and do not teach how the technique works. The exact degree, the two deeper sign textures, the three house arenas, and the ruling body\'s placement are PRIVATE inputs — weave them into one seamless portrait of a person. The reader must meet themselves, never a diagram.',
    '- Trace cause and effect: because you want X, you do Y, so life keeps handing you Z.',
    '- Do not stack adjectives, restate the same idea in new words, or hedge with "might / perhaps / may / this placement".',
    '- Never promise wealth, name a diagnosis, or hand down a fixed verdict — a shadow is a tendency you can catch, not a sentence.',
    '- End on the trap they fall into and ONE concrete move that changes the ending.',
    '',
    'FORMAT: flowing prose in roughly 3–5 short paragraphs (or a few tight, unlabelled movements) — keep it lean, never exhausting. No section headers, no bullet list of "the layers", no glossary.',
    '',
    bannedPhrasesPromptBlock(),
  ].join('\n');
}

/** The user message: the locked structured payload as JSON. */
export function buildHiddenZodiacUserPrompt(placement: HiddenZodiacPlacement, ascendant: string | null): string {
  const payload = buildAiPayload(placement, ascendant);
  return `Interpret this placement. Treat every field as fixed:\n${JSON.stringify(payload, null, 2)}`;
}

export interface AiValidation {
  valid: boolean;
  violations: string[];
}

/**
 * Validate an AI response against the calculated placement. Rejects responses
 * that name a different Duad/Compendium sign or contradict the custom
 * rulership. A failing response should be discarded, not shown.
 */
export function validateAiResponseAgainstPlacement(
  text: string,
  placement: HiddenZodiacPlacement,
): AiValidation {
  const violations: string[] = [];
  const lower = text.toLowerCase();

  // Wrong Duad/Compendium sign asserted.
  for (const sign of SIGNS) {
    if (sign !== placement.duad.sign && new RegExp(`\\b${sign}\\s+duad\\b`, 'i').test(text)) {
      violations.push(`names "${sign} Duad" but the calculated Duad is ${placement.duad.sign}`);
    }
    if (sign !== placement.compendium.sign && new RegExp(`\\b${sign}\\s+compendium\\b`, 'i').test(text)) {
      violations.push(`names "${sign} Compendium" but the calculated Compendium is ${placement.compendium.sign}`);
    }
  }

  // Custom-rulership contradictions (sign mentioned as ruled by the wrong body).
  const FORBIDDEN: [string, string][] = [
    ['virgo', 'mercury'], ['libra', 'venus'], ['scorpio', 'mars'],
    ['aquarius', 'saturn'], ['pisces', 'jupiter'],
  ];
  for (const [sign, wrongRuler] of FORBIDDEN) {
    const re = new RegExp(`${sign}[^.]{0,40}(ruled by|ruler[^.]{0,6})\\s+${wrongRuler}`, 'i');
    if (re.test(lower)) violations.push(`assigns ${wrongRuler} as ${sign}'s ruler (custom rulership forbids this)`);
  }

  return { valid: violations.length === 0, violations };
}

/**
 * Cache key for a generated reading. Keyed by the exact placement, the
 * calculation version, the content version, and language — so an unchanged
 * placement is never regenerated unless the user asks.
 */
export function hiddenZodiacCacheKey(placement: HiddenZodiacPlacement, language: string): string {
  const p = placement;
  return [
    'hz',
    p.calculationVersion,
    HIDDEN_ZODIAC_CONTENT_VERSION,
    language,
    p.object.name,
    p.position.signIndex,
    p.position.totalArcSecondsWithinSign,
    p.primaryHouse ?? 'x',
  ].join(':');
}
