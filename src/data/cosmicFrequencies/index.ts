/* ──────────────────────────────────────────────────────────────
   Cosmic Frequencies registry.

   Single source of truth for the frequency catalog and the only
   place that decides what is allowed to reach a push notification.

   Phase 2's scoring engine consumes exactly two functions from
   here: `getPushSafeText` for the notification body, and
   `getPushEligible` for the frequency behind the tap-through.
   Everything else is section UI.
   ────────────────────────────────────────────────────────────── */

import type {
  CosmicFrequency,
  FrequencyDomain,
  FrequencyTheme,
  FrequencySeverity,
} from './types';
import { FREQUENCY_THEMES, ALL_THEME_KEYS } from './themes';
import { HEALTH_FREQUENCIES } from './health';
import { MONEY_FREQUENCIES } from './money';
import { LOVE_FREQUENCIES } from './love';
import { CAREER_FREQUENCIES } from './career';
import { PROTECTION_FREQUENCIES } from './protection';
import { SPIRITUAL_FREQUENCIES } from './spiritual';
import { IMPORTED_FREQUENCIES } from './imported';

export * from './types';
export {
  ENTRAINMENT_SESSIONS,
  type EntrainmentSession,
  type EntrainmentVariant,
} from './sessions';
export { FREQUENCY_THEMES, ALL_THEME_KEYS, getThemesForDomain, isFrequencyTheme } from './themes';
export {
  PRACTICE_STEPS,
  PRACTICE_NOTES,
  HEALTH_PRACTICE_NOTE,
  type PracticeStep,
} from './practice';

/** Hand-authored entries: the original seed set, written before a source existed. */
const HANDWRITTEN: CosmicFrequency[] = [
  ...HEALTH_FREQUENCIES,
  ...MONEY_FREQUENCIES,
  ...LOVE_FREQUENCIES,
  ...CAREER_FREQUENCIES,
  ...PROTECTION_FREQUENCIES,
  ...SPIRITUAL_FREQUENCIES,
];

const digitsOf = (code: string) => code.replace(/\D/g, '');
const importedDigits = new Set(IMPORTED_FREQUENCIES.map((f) => digitsOf(f.code)));

/**
 * Imported entries win on a code collision.
 *
 * The seed set was written before a source list existed, so several of its
 * sequences were Align-originals standing in for codes we did not have. Now
 * that the same codes arrive with real provenance, the sourced record is the
 * one to keep — a hand-written entry only survives where nothing in the
 * import covers its sequence, which is also what keeps every theme in the
 * closed vocabulary backed (see the coverage test).
 */
export const COSMIC_FREQUENCIES: CosmicFrequency[] = [
  ...IMPORTED_FREQUENCIES,
  ...HANDWRITTEN.filter((f) => !importedDigits.has(digitsOf(f.code))),
];

export const FREQUENCY_DOMAINS: FrequencyDomain[] = [
  'health',
  'money',
  'love',
  'career',
  'protection',
  'spiritual',
];

const BY_ID = new Map(COSMIC_FREQUENCIES.map((f) => [f.id, f]));

const BY_THEME = ALL_THEME_KEYS.reduce((acc, theme) => {
  acc[theme] = COSMIC_FREQUENCIES.filter((f) => f.themes.includes(theme));
  return acc;
}, {} as Record<FrequencyTheme, CosmicFrequency[]>);

/* ── Lookups ────────────────────────────────────────────────── */

export function getFrequencyById(id: string): CosmicFrequency | undefined {
  return BY_ID.get(id);
}

export function getFrequenciesByDomain(domain: FrequencyDomain): CosmicFrequency[] {
  return COSMIC_FREQUENCIES.filter((f) => f.domain === domain);
}

/** Every frequency tagged with a theme, strongest-fit first (fewest themes wins). */
export function getFrequenciesByTheme(theme: FrequencyTheme): CosmicFrequency[] {
  return [...(BY_THEME[theme] ?? [])].sort((a, b) => a.themes.length - b.themes.length);
}

/* ── Disclaimer gating ──────────────────────────────────────── */

/**
 * Whether the detail view must be gated behind the acknowledged
 * medical/wellbeing disclaimer.
 *
 * Every health-domain frequency qualifies regardless of severity, so a
 * future health entry mis-tagged as severity 1 still gets gated.
 */
export function requiresDisclaimer(frequency: CosmicFrequency): boolean {
  return frequency.domain === 'health' || frequency.severity === 3;
}

/* ── Push eligibility ───────────────────────────────────────── */

export interface PushEligibilityOptions {
  /** User preference. When false, health themes are skipped entirely. */
  includeHealth?: boolean;
  /** Ceiling on severity. Defaults to 3 — gating happens on the tap-through, not here. */
  maxSeverity?: FrequencySeverity;
}

/**
 * The frequency a weekly push may point at for a given theme, or null.
 *
 * Unverified content NEVER reaches push. Seed data all ships
 * `verified: false`, so this returns null across the board until the
 * content pass runs — the section stays browsable behind the founder
 * gate in the meantime.
 */
export function getPushEligible(
  theme: FrequencyTheme,
  options: PushEligibilityOptions = {},
): CosmicFrequency | null {
  const { includeHealth = true, maxSeverity = 3 } = options;

  if (!includeHealth && FREQUENCY_THEMES[theme].domain === 'health') return null;

  const match = getFrequenciesByTheme(theme).find(
    (f) => f.verified && f.severity <= maxSeverity,
  );
  return match ?? null;
}

/**
 * The only text a push notification body may carry for a theme.
 *
 * Returns the theme's `pressure` string — a stretch of time, written to
 * be safe with no disclaimer attached. Never returns a frequency's
 * `intent`, `title`, or `code`: those live behind the tap-through where
 * the disclaimer can travel with them.
 */
export function getPushSafeText(theme: FrequencyTheme): string {
  return FREQUENCY_THEMES[theme].pressure;
}

/* ── Codex ordering ─────────────────────────────────────────── */

const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });

/** Every frequency, A-Z by title. The codex's default order. */
export function getAlphabetical(list: CosmicFrequency[] = COSMIC_FREQUENCIES): CosmicFrequency[] {
  return [...list].sort((a, b) => collator.compare(a.title, b.title));
}

/**
 * A-Z buckets for the codex jump index. Titles that do not start with a
 * letter are grouped under '#' so nothing silently disappears from the
 * index as the catalog grows.
 */
export function groupByLetter(
  list: CosmicFrequency[] = COSMIC_FREQUENCIES,
): { letter: string; items: CosmicFrequency[] }[] {
  const buckets = new Map<string, CosmicFrequency[]>();

  for (const f of getAlphabetical(list)) {
    const first = f.title.trim().charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(first) ? first : '#';
    if (!buckets.has(letter)) buckets.set(letter, []);
    buckets.get(letter)!.push(f);
  }

  // Array.from rather than spread: the build target predates downlevelIteration.
  return Array.from(buckets.entries())
    .sort((a, b) => (a[0] === '#' ? 1 : b[0] === '#' ? -1 : collator.compare(a[0], b[0])))
    .map(([letter, items]) => ({ letter, items }));
}

/* ── Search ─────────────────────────────────────────────────── */

/** Match on title, intent, theme label, or the code with spacing ignored. */
export function searchFrequencies(query: string): CosmicFrequency[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const digits = q.replace(/\D/g, '');

  return COSMIC_FREQUENCIES.filter((f) => {
    if (f.title.toLowerCase().includes(q)) return true;
    if (f.intent.toLowerCase().includes(q)) return true;
    if (digits && f.code.replace(/\D/g, '').includes(digits)) return true;
    return f.themes.some((t) => FREQUENCY_THEMES[t].label.toLowerCase().includes(q));
  });
}

/* ── Integrity ──────────────────────────────────────────────── */

export interface CoverageReport {
  /** Themes with no frequency behind them. Must be empty. */
  uncoveredThemes: FrequencyTheme[];
  /** Themes whose only frequencies are unverified. Shrinks as content lands. */
  unverifiedThemes: FrequencyTheme[];
  totalFrequencies: number;
  verifiedFrequencies: number;
}

export function getCoverageReport(): CoverageReport {
  const uncoveredThemes: FrequencyTheme[] = [];
  const unverifiedThemes: FrequencyTheme[] = [];

  for (const theme of ALL_THEME_KEYS) {
    const matches = BY_THEME[theme];
    if (matches.length === 0) uncoveredThemes.push(theme);
    else if (!matches.some((f) => f.verified)) unverifiedThemes.push(theme);
  }

  return {
    uncoveredThemes,
    unverifiedThemes,
    totalFrequencies: COSMIC_FREQUENCIES.length,
    verifiedFrequencies: COSMIC_FREQUENCIES.filter((f) => f.verified).length,
  };
}
