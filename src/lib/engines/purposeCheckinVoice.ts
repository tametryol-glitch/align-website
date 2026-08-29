/**
 * Purpose Check-In — the AI voice pass over the opener.
 *
 * The STRUCTURE of a check-in is never the AI's to decide: which point is
 * raised, what that point says, and what the reader can answer are all fixed by
 * the engine and by the keyed points. The AI only warms the two conversational
 * lines wrapped around them — the recall and the lead.
 *
 * Pure and framework-free: the prompt is built here, the response is parsed and
 * VALIDATED here, and anything failing validation falls back to the
 * deterministic line rather than shipping something off-voice, pushy, or —
 * worst of all — a memory the reader never actually gave us.
 *
 * @see purposeCheckin.ts for composeOpener, which produces the fallback.
 */

import type { CheckinOpener, PurposeKind, Register } from './purposeCheckin';

export interface OpenerVoice {
  recall?: string;
  lead?: string;
}

export interface VoicePromptInput {
  register: Register;
  kind: PurposeKind;
  pointText: string;
  lastNote: string | null;
  isFirstEver: boolean;
  followingUp: boolean;
}

const MIN_LINE = 8;
const MAX_LINE = 220;

/** Instructing, not talking. The whole feature dies if it reads like a coach. */
const PUSHY = [
  /^\s*you should\b/i,
  /^\s*you need to\b/i,
  /^\s*you must\b/i,
  /\bmake sure (you|to)\b/i,
  /\bdon'?t forget\b/i,
  /\bit'?s time to\b/i,
];

const REGISTER_RULE: Record<Register, string> = {
  directive:
    'Name it as the thing worth returning to. Do not offer alternatives and do not ask them to choose.',
  collaborative:
    'Offer it, and leave the door open that something else might be more alive for them right now.',
  autonomous:
    'Ask which one is actually alive for them right now. Do not tell them which it should be.',
};

/**
 * The system + user prompt for the voice pass. Reuses the same
 * /ai/interpret "astrologer_chat" mode the purpose readings use, so no backend
 * change is needed.
 */
export function buildOpenerVoicePrompt(input: VoicePromptInput): { system: string; user: string } {
  const system = [
    'You write ONE or TWO short conversational lines opening a fortnightly check-in between a person and a friend who knows their chart. You are NOT writing a reading, a horoscope, or advice.',
    '',
    'HARD RULES',
    '- NEVER restate, rewrite, summarise or allude to the commitment text you are given. It is shown to the reader directly, immediately under your line. Repeating it wastes their time.',
    '- NEVER explain astrology. Do not name a sign, house, planet or placement, and never use the words duad, compendium, node, or chart.',
    '- NEVER instruct. No "you should", "you need to", "make sure", "don\'t forget", "it\'s time to". You are a friend picking a conversation back up, not a coach with a clipboard.',
    '- No flattery, no hype, no emoji, no exclamation marks, no rhetorical questions you then answer.',
    '- Second person, present tense, plain words. Contractions are good. One sentence per line, under 25 words.',
    '',
    `TONE FOR THIS READER: ${REGISTER_RULE[input.register]}`,
    '',
    'OUTPUT — exactly these lines, nothing before or after:',
    'RECALL: <one line that quotes their previous words back>',
    'LEAD: <one line leading into the thing below>',
    '',
    'Omit the RECALL line entirely when no previous words are given. When they ARE given, include them EXACTLY as written, inside double quotes — never paraphrase what someone told you.',
  ].join('\n');

  const context = [
    input.isFirstEver
      ? 'This is the first time you have ever checked in with them. Set the rhythm lightly: you will raise one of these every couple of weeks, and it is not a nag.'
      : input.followingUp
        ? 'You are following up on something they already told you they were in the middle of.'
        : 'You are raising something you have not asked them about before.',
    input.kind === 'soul'
      ? 'The topic is who they are growing into.'
      : 'The topic is what they are building.',
    '',
    'THE COMMITMENT (shown to them directly under your line — do not repeat it):',
    input.pointText,
  ];

  if (input.lastNote) {
    context.push('', 'THEIR PREVIOUS WORDS (quote exactly):', input.lastNote);
  }

  return { system, user: context.join('\n') };
}

/** Pull the labelled lines out of the response. Tolerant of stray prose. */
export function parseOpenerVoice(raw: string): OpenerVoice {
  const out: OpenerVoice = {};
  for (const line of (raw || '').split('\n')) {
    const m = /^\s*(RECALL|LEAD)\s*:\s*(.+?)\s*$/i.exec(line);
    if (!m) continue;
    const value = m[2].trim();
    if (!value) continue;
    if (m[1].toUpperCase() === 'RECALL') out.recall = value;
    else out.lead = value;
  }
  return out;
}

function acceptable(line: string | undefined, pointText: string): boolean {
  if (!line) return false;
  const v = line.trim();
  if (v.length < MIN_LINE || v.length > MAX_LINE) return false;
  if (v.includes('\n')) return false;
  if (PUSHY.some((re) => re.test(v))) return false;

  // Echoing the commitment back is the most common failure — the reader would
  // read the same sentence twice, once warmed over.
  const probe = pointText.trim().slice(0, 24).toLowerCase();
  if (probe.length >= 12 && v.toLowerCase().includes(probe)) return false;

  return true;
}

/**
 * Merge a voice pass into the deterministic opener, field by field.
 *
 * The recall is held to a harder standard than the lead: it is only accepted
 * when the reader actually left words AND those words appear verbatim. A
 * paraphrased or invented memory is worse than no memory at all — it makes the
 * whole thing feel like a machine imitating someone who was listening.
 */
export function applyOpenerVoice(
  opener: CheckinOpener,
  voice: OpenerVoice,
  lastNote: string | null,
): CheckinOpener {
  const pointText = opener.point.text;

  const lead = acceptable(voice.lead, pointText) ? voice.lead!.trim() : opener.lead;

  let recall = opener.recall;
  const note = lastNote?.trim();
  if (note && voice.recall && acceptable(voice.recall, pointText) && voice.recall.includes(note)) {
    recall = voice.recall.trim();
  }

  return { ...opener, lead, recall };
}
