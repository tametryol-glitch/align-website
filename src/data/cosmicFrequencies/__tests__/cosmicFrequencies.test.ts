import { describe, it, expect } from 'vitest';
import {
  COSMIC_FREQUENCIES,
  FREQUENCY_DOMAINS,
  FREQUENCY_THEMES,
  ALL_THEME_KEYS,
  getFrequencyById,
  getFrequenciesByDomain,
  getFrequenciesByTheme,
  getPushEligible,
  getPushSafeText,
  requiresDisclaimer,
  searchFrequencies,
  getCoverageReport,
  getThemesForDomain,
  isFrequencyTheme,
} from '../index';

describe('catalog integrity', () => {
  it('has no duplicate ids', () => {
    const ids = COSMIC_FREQUENCIES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has no duplicate codes once spacing is ignored', () => {
    const codes = COSMIC_FREQUENCIES.map((f) => f.code.replace(/\D/g, ''));
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('every code is digits and spaces only', () => {
    for (const f of COSMIC_FREQUENCIES) {
      expect(f.code, f.id).toMatch(/^[\d ]+$/);
    }
  });

  it('every code is between 3 and 13 digits', () => {
    // These sequences are usually described as 3-11 digits, but several in
    // broad circulation run longer - the love sequence 888 412 1289018 is 13.
    // The bound is a sanity check against typos, not a spec claim.
    for (const f of COSMIC_FREQUENCIES) {
      const len = f.code.replace(/\D/g, '').length;
      expect(len, `${f.id} has ${len} digits`).toBeGreaterThanOrEqual(3);
      expect(len, `${f.id} has ${len} digits`).toBeLessThanOrEqual(13);
    }
  });

  it('every frequency carries at least one theme', () => {
    for (const f of COSMIC_FREQUENCIES) {
      expect(f.themes.length, f.id).toBeGreaterThan(0);
    }
  });

  it('every theme tag resolves to a known theme in the matching domain', () => {
    for (const f of COSMIC_FREQUENCIES) {
      for (const t of f.themes) {
        expect(isFrequencyTheme(t), `${f.id} -> ${t}`).toBe(true);
        expect(FREQUENCY_THEMES[t].domain, `${f.id} -> ${t}`).toBe(f.domain);
      }
    }
  });

  it('every frequency has a non-empty title and intent', () => {
    for (const f of COSMIC_FREQUENCIES) {
      expect(f.title.trim().length, f.id).toBeGreaterThan(0);
      expect(f.intent.trim().length, f.id).toBeGreaterThan(0);
    }
  });
});

describe('theme coverage', () => {
  it('every theme has at least one frequency behind it', () => {
    expect(getCoverageReport().uncoveredThemes).toEqual([]);
  });

  it('every theme belongs to a known domain', () => {
    for (const key of ALL_THEME_KEYS) {
      expect(FREQUENCY_DOMAINS).toContain(FREQUENCY_THEMES[key].domain);
    }
  });

  it('every domain has at least one theme and one frequency', () => {
    for (const d of FREQUENCY_DOMAINS) {
      expect(getThemesForDomain(d).length, d).toBeGreaterThan(0);
      expect(getFrequenciesByDomain(d).length, d).toBeGreaterThan(0);
    }
  });
});

describe('health safety rules', () => {
  it('every health frequency is severity 3', () => {
    for (const f of getFrequenciesByDomain('health')) {
      expect(f.severity, f.id).toBe(3);
    }
  });

  it('every health frequency requires the disclaimer', () => {
    for (const f of getFrequenciesByDomain('health')) {
      expect(requiresDisclaimer(f), f.id).toBe(true);
    }
  });

  it('a severity 3 frequency outside health still requires the disclaimer', () => {
    const nonHealth = COSMIC_FREQUENCIES.filter(
      (f) => f.domain !== 'health' && f.severity === 3,
    );
    for (const f of nonHealth) {
      expect(requiresDisclaimer(f), f.id).toBe(true);
    }
  });

  it('no health intent names a condition or predicts illness', () => {
    // Guards the voice rule in health.ts. Pressure register only.
    const banned = /\b(diagnos|cure|cures|treat|treatment|prescri|disease|illness|cancer|tumou?r|diabet|thyroid|depression|anxiety disorder)\b/i;
    for (const f of getFrequenciesByDomain('health')) {
      expect(banned.test(f.intent), `${f.id}: ${f.intent}`).toBe(false);
      expect(banned.test(f.title), f.id).toBe(false);
    }
  });

  it('no theme pressure string names a condition', () => {
    // Pressure strings can appear in a push body with no disclaimer.
    const banned = /\b(diagnos|cure|disease|illness|cancer|tumou?r|diabet|thyroid)\b/i;
    for (const key of ALL_THEME_KEYS) {
      expect(banned.test(FREQUENCY_THEMES[key].pressure), key).toBe(false);
    }
  });
});

describe('push eligibility', () => {
  it('never returns unverified content', () => {
    // Seed data is entirely unverified, so every theme returns null today.
    for (const theme of ALL_THEME_KEYS) {
      const match = getPushEligible(theme);
      if (match) expect(match.verified, theme).toBe(true);
    }
  });

  it('returns null for health themes when the user opted out', () => {
    for (const theme of getThemesForDomain('health')) {
      expect(getPushEligible(theme, { includeHealth: false }), theme).toBeNull();
    }
  });

  it('respects the severity ceiling', () => {
    for (const theme of ALL_THEME_KEYS) {
      const match = getPushEligible(theme, { maxSeverity: 1 });
      if (match) expect(match.severity, theme).toBeLessThanOrEqual(1);
    }
  });

  it('push-safe text is the theme pressure string, never a code or title', () => {
    for (const theme of ALL_THEME_KEYS) {
      const text = getPushSafeText(theme);
      expect(text).toBe(FREQUENCY_THEMES[theme].pressure);
      expect(text.length, theme).toBeGreaterThan(0);
      expect(/\d/.test(text), `${theme} leaked a digit into push text`).toBe(false);
    }
  });
});

describe('lookups and search', () => {
  it('resolves a known id and misses an unknown one', () => {
    expect(getFrequencyById('money-wealth-core')?.domain).toBe('money');
    expect(getFrequencyById('does-not-exist')).toBeUndefined();
  });

  it('orders theme matches by fit, most specific first', () => {
    const matches = getFrequenciesByTheme('vitality-depletion');
    expect(matches.length).toBeGreaterThan(0);
    for (let i = 1; i < matches.length; i++) {
      expect(matches[i].themes.length).toBeGreaterThanOrEqual(matches[i - 1].themes.length);
    }
  });

  it('finds by title, by theme label, and by code regardless of spacing', () => {
    expect(searchFrequencies('wealth').some((f) => f.id === 'money-wealth-core')).toBe(true);
    expect(searchFrequencies('5207418').some((f) => f.id === 'money-wealth-core')).toBe(true);
    expect(searchFrequencies('520 741 8').some((f) => f.id === 'money-wealth-core')).toBe(true);
    expect(searchFrequencies('Sleep Disruption').length).toBeGreaterThan(0);
  });

  it('returns nothing for an empty query', () => {
    expect(searchFrequencies('   ')).toEqual([]);
  });
});
