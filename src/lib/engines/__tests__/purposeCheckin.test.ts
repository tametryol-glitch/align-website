import { describe, it, expect } from 'vitest';
/**
 * Purpose Check-In state model.
 *
 * These lock the rules that keep the biweekly conversation from turning into
 * the two things it must never be: a generic horoscope (leading with filler),
 * or a nag (repeating inside a cycle, or getting louder when ignored).
 *
 * Privacy guarantee mirrored from the Soul Age tests: nothing stored here may
 * carry birth data, so chartVersion must be a fingerprint, not a record.
 */

import type { PurposePoint } from '../purposePoints';
import {
  BASE_CADENCE_DAYS,
  LIVED_THRESHOLD,
  chartVersion,
  dueAt,
  inferRegister,
  learnRegister,
  nextCadenceDays,
  nextStatus,
  isDue,
  composeOpener,
  nextTrack,
  pointsToArchive,
  scorePoint,
  selectNextPoint,
  type PurposePointState,
} from '../purposeCheckin';

const NOW = new Date('2026-08-29T12:00:00Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();

const point = (key: string, source: PurposePoint['source'], text = key): PurposePoint => ({
  key,
  text,
  source,
  anchor: key.split(':')[2],
  timeSensitive: source === 'house',
});

const HOUSE = point('earthly:house:10', 'house');
const SIGN = point('earthly:sign:Taurus', 'sign');
const FILLER = point('earthly:filler:one-lane', 'filler');

const state = (over: Partial<PurposePointState> & { pointKey: string }): PurposePointState => ({
  kind: 'earthly',
  source: 'house',
  timeSensitive: true,
  status: 'untouched',
  lastSurfacedAt: null,
  lastResponseAt: null,
  surfacedCount: 0,
  confirmedCount: 0,
  userNote: null,
  chartVersion: 'aaaaaaaa',
  ...over,
});

describe('chartVersion — a fingerprint, not a record', () => {
  const birth = { birthDate: '1979-11-19', birthTime: '23:52', latitude: 25.0657, longitude: -77.3433 };

  it('is stable for the same birth data', () => {
    expect(chartVersion(birth)).toBe(chartVersion({ ...birth }));
  });

  it('changes when the birth time is corrected', () => {
    expect(chartVersion({ ...birth, birthTime: '23:59' })).not.toBe(chartVersion(birth));
  });

  it('leaks no birth data into the stored value', () => {
    const v = chartVersion(birth);
    expect(v).toMatch(/^[0-9a-f]{8}$/);
    for (const secret of ['1979', '11-19', '23:52', '25.0', '-77.3']) {
      expect(v).not.toContain(secret);
    }
  });
});

describe('pointsToArchive — a corrected birth time moves houses, not signs', () => {
  it('archives only the time-sensitive points', () => {
    const states = [
      state({ pointKey: 'earthly:house:10', timeSensitive: true, chartVersion: 'old00000' }),
      state({ pointKey: 'earthly:sign:Taurus', timeSensitive: false, chartVersion: 'old00000' }),
      state({ pointKey: 'earthly:house:2', timeSensitive: true, chartVersion: 'new00000' }),
    ];
    expect(pointsToArchive(states, 'new00000').map((s) => s.pointKey)).toEqual(['earthly:house:10']);
  });
});

describe('selectNextPoint — what the bot leads with', () => {
  it('never leads with filler while a chart-derived point is available', () => {
    const sel = selectNextPoint({ points: [FILLER, SIGN, HOUSE], states: [], timeConfidence: 'exact', now: NOW })!;
    expect(sel.point.source).not.toBe('filler');
  });

  it('falls back to filler only when nothing else can be surfaced', () => {
    const sel = selectNextPoint({ points: [FILLER, HOUSE], states: [], timeConfidence: 'unknown', now: NOW })!;
    expect(sel.point.key).toBe(FILLER.key);
  });

  it('refuses house points entirely when the birth time is unknown', () => {
    expect(scorePoint(HOUSE, null, 'unknown', NOW, BASE_CADENCE_DAYS)).toBeNull();
    expect(scorePoint(SIGN, null, 'unknown', NOW, BASE_CADENCE_DAYS)).not.toBeNull();
  });

  it('demotes but still allows house points on an approximate birth time', () => {
    const exact = scorePoint(HOUSE, null, 'exact', NOW, BASE_CADENCE_DAYS)!;
    const approx = scorePoint(HOUSE, null, 'approximate', NOW, BASE_CADENCE_DAYS)!;
    expect(approx).toBeLessThan(exact);
    expect(approx).not.toBeNull();
  });

  it('prefers a never-raised point over one already confirmed', () => {
    const states = [state({ pointKey: HOUSE.key, status: 'live', confirmedCount: 1, lastSurfacedAt: daysAgo(30) })];
    const sel = selectNextPoint({ points: [HOUSE, SIGN], states, timeConfidence: 'exact', now: NOW })!;
    expect(sel.point.key).toBe(SIGN.key);
  });

  it('does not raise the same point twice inside one cycle', () => {
    const recent = state({ pointKey: HOUSE.key, source: 'house', lastSurfacedAt: daysAgo(3) });
    const stale = state({ pointKey: SIGN.key, source: 'sign', timeSensitive: false, lastSurfacedAt: daysAgo(60) });
    const sel = selectNextPoint({ points: [HOUSE, SIGN], states: [recent, stale], timeConfidence: 'exact', now: NOW })!;
    expect(sel.point.key).toBe(SIGN.key);
  });

  it('keeps a declined point quiet for several cycles, then lets it back', () => {
    const justDeclined = state({ pointKey: HOUSE.key, status: 'declined', lastResponseAt: daysAgo(10) });
    expect(scorePoint(HOUSE, justDeclined, 'exact', NOW, BASE_CADENCE_DAYS)).toBeNull();

    const longAgo = state({ pointKey: HOUSE.key, status: 'declined', lastResponseAt: daysAgo(120) });
    expect(scorePoint(HOUSE, longAgo, 'exact', NOW, BASE_CADENCE_DAYS)).not.toBeNull();
  });

  it('is deterministic — ties break on the stable key, not randomness', () => {
    const a = point('earthly:sign:Aries', 'sign');
    const b = point('earthly:sign:Zeta', 'sign');
    const run = () => selectNextPoint({ points: [b, a], states: [], timeConfidence: 'exact', now: NOW })!.point.key;
    expect(run()).toBe(a.key);
    expect(run()).toBe(run());
  });

  it('offers alternatives so a reader who wants the choice can take it', () => {
    const sel = selectNextPoint({ points: [HOUSE, SIGN, FILLER], states: [], timeConfidence: 'exact', now: NOW })!;
    expect(sel.alternatives.length).toBeGreaterThan(0);
    expect(sel.alternatives).not.toContain(sel.point);
  });

  it('returns null when every point is withheld', () => {
    expect(selectNextPoint({ points: [HOUSE], states: [], timeConfidence: 'unknown', now: NOW })).toBeNull();
  });
});

describe('nextStatus — saying "I am on it" must not be a dismiss button', () => {
  it('keeps a confirmed point live rather than retiring it', () => {
    expect(nextStatus('untouched', 'confirmed', 0)).toBe('live');
    expect(nextStatus('live', 'confirmed', 1)).toBe('live');
  });

  it('promotes to lived only after repeated confirmation', () => {
    expect(nextStatus('live', 'confirmed', LIVED_THRESHOLD - 1)).toBe('lived');
  });

  it('records a push-back as declined, not as failure', () => {
    expect(nextStatus('live', 'declined', 2)).toBe('declined');
  });

  it('lets a live point go dormant when ignored or swapped out', () => {
    expect(nextStatus('live', 'no_response', 1)).toBe('dormant');
    expect(nextStatus('live', 'switched', 1)).toBe('dormant');
    expect(nextStatus('untouched', 'no_response', 0)).toBe('untouched');
  });

  it('leaves a deferred point exactly where it was', () => {
    expect(nextStatus('live', 'deferred', 1)).toBe('live');
  });
});

describe('cadence — silence makes it quieter, never louder', () => {
  it('widens as check-ins go unanswered', () => {
    expect(nextCadenceDays(0)).toBe(BASE_CADENCE_DAYS);
    expect(nextCadenceDays(1)).toBe(BASE_CADENCE_DAYS);
    expect(nextCadenceDays(2)).toBeGreaterThan(BASE_CADENCE_DAYS);
    expect(nextCadenceDays(5)).toBeGreaterThanOrEqual(nextCadenceDays(2));
  });

  it('never drops below the base rhythm', () => {
    for (const n of [0, 1, 2, 3, 10]) expect(nextCadenceDays(n)).toBeGreaterThanOrEqual(BASE_CADENCE_DAYS);
  });

  it('schedules the next check-in from the cadence', () => {
    expect(dueAt(NOW, 14).toISOString()).toBe('2026-09-12T12:00:00.000Z');
  });

  it('alternates the two tracks', () => {
    expect(nextTrack(null)).toBe('earthly');
    expect(nextTrack('earthly')).toBe('soul');
    expect(nextTrack('soul')).toBe('earthly');
  });
});

describe('register — chart sets the opening, behaviour overrides it', () => {
  it('reads a fixed-heavy chart as wanting one clear thing', () => {
    expect(inferRegister({ sun: 'Taurus', moon: 'Leo', mercury: 'Scorpio', mars: 'Aquarius', ascendant: 'Leo' }))
      .toBe('directive');
  });

  it('reads a cardinal-heavy chart as wanting the call to be theirs', () => {
    expect(inferRegister({ sun: 'Aries', moon: 'Cancer', mercury: 'Libra', mars: 'Capricorn', ascendant: 'Aries' }))
      .toBe('autonomous');
  });

  it('defaults to offering a choice when nothing dominates or data is missing', () => {
    expect(inferRegister({})).toBe('collaborative');
    expect(inferRegister({ sun: 'Aries', moon: 'Taurus' })).toBe('collaborative');
  });

  it('stops proposing once the reader keeps picking their own point', () => {
    const history = [
      { kind: 'earthly' as const, ledPointKey: 'a', chosenPointKey: 'b', outcome: 'switched' as const },
      { kind: 'soul' as const, ledPointKey: 'c', chosenPointKey: 'd', outcome: 'switched' as const },
    ];
    expect(learnRegister('directive', history)).toEqual({ register: 'autonomous', source: 'observed' });
  });

  it('keeps leading when the reader keeps taking the lead', () => {
    const history = [
      { kind: 'earthly' as const, ledPointKey: 'a', chosenPointKey: null, outcome: 'confirmed' as const },
      { kind: 'soul' as const, ledPointKey: 'c', chosenPointKey: null, outcome: 'confirmed' as const },
    ];
    expect(learnRegister('collaborative', history)).toEqual({ register: 'directive', source: 'observed' });
  });

  it('falls back to the chart prior before there is enough behaviour to learn from', () => {
    expect(learnRegister('collaborative', [])).toEqual({ register: 'collaborative', source: 'chart' });
  });
});

describe('isDue — a paused reader is never chased', () => {
  it('is due when there has never been a check-in', () => {
    expect(isDue({ nextDueAt: null, paused: false }, NOW)).toBe(true);
  });

  it('is not due before the next date', () => {
    expect(isDue({ nextDueAt: daysAgo(-3), paused: false }, NOW)).toBe(false);
  });

  it('is due once the date has passed', () => {
    expect(isDue({ nextDueAt: daysAgo(1), paused: false }, NOW)).toBe(true);
  });

  it('is never due while paused, however overdue', () => {
    expect(isDue({ nextDueAt: daysAgo(90), paused: true }, NOW)).toBe(false);
  });
});

describe('composeOpener — friend, not scheduler', () => {
  const selection = {
    point: HOUSE,
    state: null as PurposePointState | null,
    score: 100,
    alternatives: [SIGN, FILLER],
  };

  it('quotes the reader back when we have their words', () => {
    const o = composeOpener({
      register: 'collaborative',
      selection,
      lastNote: 'writing at night when the house goes quiet',
      isFirstEver: false,
    });
    expect(o.recall).toContain('writing at night when the house goes quiet');
  });

  it('has nothing to recall on a first meeting, and explains the rhythm', () => {
    const o = composeOpener({ register: 'collaborative', selection, lastNote: null, isFirstEver: true });
    expect(o.recall).toBeNull();
    expect(o.lead).toMatch(/every couple of weeks/i);
  });

  it('hands a directive reader one clear thing, with no menu', () => {
    const o = composeOpener({ register: 'directive', selection, lastNote: null, isFirstEver: false });
    expect(o.alternatives).toEqual([]);
    expect(o.point).toBe(HOUSE);
  });

  it('asks an autonomous reader to choose, and shows them the options', () => {
    const o = composeOpener({ register: 'autonomous', selection, lastNote: null, isFirstEver: false });
    expect(o.lead).toMatch(/\?$/);
    expect(o.alternatives.length).toBeGreaterThan(0);
  });

  it('follows up rather than re-introducing a point already live', () => {
    const live = { ...selection, state: state({ pointKey: HOUSE.key, status: 'live' }) };
    const o = composeOpener({ register: 'directive', selection: live, lastNote: null, isFirstEver: false });
    expect(o.lead).toMatch(/where we left off/i);
  });

  it('always offers an honest way out', () => {
    const o = composeOpener({ register: 'directive', selection, lastNote: null, isFirstEver: false });
    const outcomes = o.replies.map((r) => r.outcome);
    expect(outcomes).toContain('confirmed');
    expect(outcomes).toContain('declined');
    expect(outcomes).toContain('deferred');
  });
});
