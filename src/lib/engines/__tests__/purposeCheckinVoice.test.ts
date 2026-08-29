import { describe, it, expect } from 'vitest';
/**
 * The AI voice pass over the check-in opener.
 *
 * The point of these is that the AI can only make the opener WARMER, never
 * different. Structure, the raised point, and the reader's own words are all
 * outside its reach — a bad response degrades to the deterministic line rather
 * than shipping something off-voice or, worst case, a memory the reader never
 * gave us.
 */

import type { PurposePoint } from '../purposePoints';
import type { CheckinOpener } from '../purposeCheckin';
import {
  applyOpenerVoice,
  buildOpenerVoicePrompt,
  parseOpenerVoice,
} from '../purposeCheckinVoice';

const POINT: PurposePoint = {
  key: 'earthly:house:10',
  text: 'Become publicly known for something you built — a career, company, or title that outlives you.',
  source: 'house',
  anchor: 10,
  timeSensitive: true,
};

const OPENER: CheckinOpener = {
  recall: 'Last time you told me: "writing at night when the house goes quiet"',
  lead: 'The one I keep coming back to for you is this.',
  point: POINT,
  alternatives: [],
  replies: [{ label: "I've been on this", outcome: 'confirmed' }],
};

const NOTE = 'writing at night when the house goes quiet';

describe('buildOpenerVoicePrompt', () => {
  const base = {
    register: 'collaborative' as const,
    kind: 'earthly' as const,
    pointText: POINT.text,
    lastNote: NOTE,
    isFirstEver: false,
    followingUp: true,
  };

  it('forbids repeating the commitment and forbids instructing', () => {
    const { system } = buildOpenerVoicePrompt(base);
    expect(system).toMatch(/NEVER restate/i);
    expect(system).toMatch(/NEVER instruct/i);
    expect(system).toMatch(/NEVER explain astrology/i);
  });

  it('carries the register into the tone instruction', () => {
    expect(buildOpenerVoicePrompt({ ...base, register: 'autonomous' }).system).toMatch(/Ask which one is actually alive/i);
    expect(buildOpenerVoicePrompt({ ...base, register: 'directive' }).system).toMatch(/Do not offer alternatives/i);
  });

  it('passes the reader’s words through for exact quoting', () => {
    const { user } = buildOpenerVoicePrompt(base);
    expect(user).toContain(NOTE);
    expect(user).toContain(POINT.text);
  });

  it('does not ask for a recall line when there is nothing to recall', () => {
    const { user } = buildOpenerVoicePrompt({ ...base, lastNote: null });
    expect(user).not.toMatch(/PREVIOUS WORDS/);
  });
});

describe('parseOpenerVoice', () => {
  it('reads the labelled lines and ignores stray prose', () => {
    const v = parseOpenerVoice('Sure thing.\nRECALL: You said "x"\nLEAD: Still true?\n');
    expect(v.recall).toBe('You said "x"');
    expect(v.lead).toBe('Still true?');
  });

  it('returns nothing usable from an unlabelled response', () => {
    expect(parseOpenerVoice('just some prose about your chart')).toEqual({});
    expect(parseOpenerVoice('')).toEqual({});
  });
});

describe('applyOpenerVoice — the AI can only make it warmer, never different', () => {
  it('takes a good lead', () => {
    const out = applyOpenerVoice(OPENER, { lead: 'Still chipping away at this one?' }, NOTE);
    expect(out.lead).toBe('Still chipping away at this one?');
  });

  it('never lets the AI change the point, the replies, or the alternatives', () => {
    const out = applyOpenerVoice(OPENER, { lead: 'Something else entirely.' }, NOTE);
    expect(out.point).toBe(OPENER.point);
    expect(out.replies).toBe(OPENER.replies);
    expect(out.alternatives).toBe(OPENER.alternatives);
  });

  it('rejects a lead that just echoes the commitment back', () => {
    const echo = { lead: `About this: ${POINT.text.slice(0, 40)}` };
    expect(applyOpenerVoice(OPENER, echo, NOTE).lead).toBe(OPENER.lead);
  });

  it('rejects an instructing lead', () => {
    for (const lead of ['You should get back to this one.', "Don't forget about this.", "It's time to move on this."]) {
      expect(applyOpenerVoice(OPENER, { lead }, NOTE).lead).toBe(OPENER.lead);
    }
  });

  it('rejects a lead that is too short, too long, or multi-line', () => {
    expect(applyOpenerVoice(OPENER, { lead: 'Hi' }, NOTE).lead).toBe(OPENER.lead);
    expect(applyOpenerVoice(OPENER, { lead: 'a'.repeat(400) }, NOTE).lead).toBe(OPENER.lead);
    expect(applyOpenerVoice(OPENER, { lead: 'One line.\nTwo lines.' }, NOTE).lead).toBe(OPENER.lead);
  });

  it('accepts a recall that quotes the reader verbatim', () => {
    const recall = `You mentioned "${NOTE}" last time.`;
    expect(applyOpenerVoice(OPENER, { recall }, NOTE).recall).toBe(recall);
  });

  it('refuses a paraphrased memory — misquoting the reader is worse than not quoting', () => {
    const out = applyOpenerVoice(OPENER, { recall: 'You said you were writing in the evenings.' }, NOTE);
    expect(out.recall).toBe(OPENER.recall);
  });

  it('refuses an invented memory when the reader never left words', () => {
    const fresh: CheckinOpener = { ...OPENER, recall: null };
    const out = applyOpenerVoice(fresh, { recall: 'Last time you said you were making progress.' }, null);
    expect(out.recall).toBeNull();
  });

  it('falls back cleanly on an empty response', () => {
    expect(applyOpenerVoice(OPENER, {}, NOTE)).toEqual(OPENER);
  });
});
