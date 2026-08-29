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

export * from './types';
export { FREQUENCY_THEMES, ALL_THEME_KEYS, getThemesForDomain, isFrequencyTheme } from './themes';

export const COSMIC_FREQUENCIES: CosmicFrequency[] = [
  ...HEALTH_FREQUENCIES,
  ...MONEY_FREQUENCIES,
  ...LOVE_FREQUENCIES,
  ...CAREER_FREQUENCIES,
  ...PROTECTION_FREQUENCIES,
  ...SPIRITUAL_FREQUENCIES,
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
