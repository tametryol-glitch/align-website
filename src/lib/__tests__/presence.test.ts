import { describe, expect, test } from 'vitest';
import { isFreshOnline, formatLastSeen, FRESH_MS } from '../presence';

// Dates are built with the local-time constructor so the tests pass in any timezone.
const NOW = new Date(2026, 9, 11, 15, 30, 0); // 11 Oct 2026, 3:30 PM local

describe('isFreshOnline', () => {
  const nowMs = NOW.getTime();
  test('online only while the heartbeat is fresh', () => {
    expect(isFreshOnline(true, new Date(nowMs - 30_000).toISOString(), nowMs)).toBe(true);
    expect(isFreshOnline(true, new Date(nowMs - FRESH_MS - 1).toISOString(), nowMs)).toBe(false);
  });
  test('stuck flag from a crash or old login is not online', () => {
    expect(isFreshOnline(true, new Date(nowMs - 3 * 86_400_000).toISOString(), nowMs)).toBe(false);
  });
  test('flag off, missing or invalid data is offline', () => {
    expect(isFreshOnline(false, new Date(nowMs).toISOString(), nowMs)).toBe(false);
    expect(isFreshOnline(true, null, nowMs)).toBe(false);
    expect(isFreshOnline(null, undefined, nowMs)).toBe(false);
    expect(isFreshOnline(true, 'not a date', nowMs)).toBe(false);
  });
});

describe('formatLastSeen', () => {
  const at = (y: number, m: number, d: number, h: number, min: number) => new Date(y, m, d, h, min).toISOString();
  test('no timestamp -> empty', () => {
    expect(formatLastSeen(null, NOW)).toBe('');
    expect(formatLastSeen('garbage', NOW)).toBe('');
  });
  test('just now and minutes', () => {
    expect(formatLastSeen(new Date(NOW.getTime() - 20_000).toISOString(), NOW)).toBe('Last seen just now');
    expect(formatLastSeen(new Date(NOW.getTime() - 5 * 60_000).toISOString(), NOW)).toBe('Last seen 5 min ago');
    expect(formatLastSeen(new Date(NOW.getTime() - 59 * 60_000).toISOString(), NOW)).toBe('Last seen 59 min ago');
  });
  test('earlier today shows the real clock time', () => {
    const s = formatLastSeen(at(2026, 9, 11, 9, 5), NOW);
    expect(s.startsWith('Last seen today at ')).toBe(true);
    expect(s).toContain('9');
  });
  test('yesterday and this week', () => {
    expect(formatLastSeen(at(2026, 9, 10, 22, 15), NOW).startsWith('Last seen yesterday at ')).toBe(true);
    const wk = formatLastSeen(at(2026, 9, 8, 12, 0), NOW);
    expect(wk.startsWith('Last seen ')).toBe(true);
    expect(wk).toContain(' at ');
    expect(wk).not.toContain('yesterday');
  });
  test('older dates show a calendar date, with the year only when it differs', () => {
    const older = formatLastSeen(at(2026, 8, 20, 12, 0), NOW);
    expect(older.startsWith('Last seen ')).toBe(true);
    expect(older).not.toContain(' at ');
    expect(older).not.toContain('2026');
    expect(formatLastSeen(at(2025, 11, 25, 12, 0), NOW)).toContain('2025');
  });
  test('midnight boundary: 11:50 PM yesterday is minutes ago, not "yesterday", when it was 50 minutes ago', () => {
    const justAfterMidnight = new Date(2026, 9, 11, 0, 40);
    expect(formatLastSeen(at(2026, 9, 10, 23, 50), justAfterMidnight)).toBe('Last seen 50 min ago');
    expect(formatLastSeen(at(2026, 9, 10, 20, 0), justAfterMidnight).startsWith('Last seen yesterday at ')).toBe(true);
  });
});
