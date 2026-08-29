/* ──────────────────────────────────────────────────────────────
   Cosmic Frequencies — types

   Numeric manifestation sequences, tagged so the Phase 2 scoring
   engine can map an astrological signature onto a theme, and a
   theme onto a frequency.

   The theme vocabulary in themes.ts is a CLOSED set and it is the
   join key between the two halves of the feature. The scorer may
   only emit a FrequencyTheme, and every theme is guaranteed to
   have at least one frequency behind it — see the coverage test.

   Health entries stay in the pressure/period register. A frequency
   is for a stretch of time that taxes something, never for a
   diagnosis. Nothing in this file names a disease.
   ────────────────────────────────────────────────────────────── */

export type FrequencyDomain =
  | 'health'
  | 'money'
  | 'love'
  | 'career'
  | 'protection'
  | 'spiritual';

/**
 * Closed theme vocabulary. Astrological signatures resolve to one of
 * these; frequencies are tagged with one or more. Adding a theme here
 * without adding a frequency for it fails the coverage test.
 */
export type FrequencyTheme =
  // ── health ──
  | 'vitality-depletion'
  | 'nervous-system-strain'
  | 'sleep-disruption'
  | 'immune-resilience'
  | 'structural-strain'
  | 'inflammation-heat'
  | 'digestive-sensitivity'
  | 'hormonal-fluctuation'
  | 'recovery-convalescence'
  | 'chronic-pattern-relief'
  // ── money ──
  | 'income-instability'
  | 'debt-pressure'
  | 'unexpected-expense'
  | 'earning-expansion'
  | 'scarcity-mindset'
  | 'contract-negotiation'
  // ── love ──
  | 'relationship-rupture'
  | 'trust-repair'
  | 'loneliness-isolation'
  | 'attraction-magnetism'
  | 'commitment-pressure'
  | 'family-obligation'
  // ── career ──
  | 'reputation-exposure'
  | 'authority-conflict'
  | 'vocation-redirection'
  | 'burnout-overwork'
  | 'recognition-delay'
  // ── protection ──
  | 'boundary-erosion'
  | 'external-hostility'
  | 'legal-entanglement'
  | 'travel-safety'
  | 'psychic-overwhelm'
  // ── spiritual ──
  | 'identity-dissolution'
  | 'meaning-crisis'
  | 'intuition-opening'
  | 'karmic-closure'
  | 'transformation-pressure';

/**
 * How much care a frequency needs on the way to the user.
 *
 * 1 — everyday. No gating.
 * 2 — significant life pressure. In-app framing matters; safe to push.
 * 3 — sensitive. Requires the acknowledged medical/wellbeing disclaimer
 *     before the detail view, and the push body carries the THEME only,
 *     never the specific frequency's subject matter.
 */
export type FrequencySeverity = 1 | 2 | 3;

/**
 * Where the sequence came from.
 *
 * 'community' — in general public circulation across many sources.
 * 'derived'   — Align-original, generated from the documented method.
 *
 * Deliberately NOT sourced by transcribing the ~1,000-row table out of
 * Grabovoi's book: the individual numbers are not protectable, but that
 * book's particular selection and arrangement is a copyrighted
 * compilation and the rename does not change that.
 */
export type FrequencySource = 'community' | 'derived';

export interface CosmicFrequency {
  /** Stable slug. Never reuse or renumber — history rows point at these. */
  id: string;
  /** The numeric sequence, spaced exactly as it should be displayed. */
  code: string;
  /** Short user-facing name. */
  title: string;
  domain: FrequencyDomain;
  /** One or more themes this frequency answers. Must be non-empty. */
  themes: FrequencyTheme[];
  /** Second person, what this is actually for. Pressure register. */
  intent: string;
  severity: FrequencySeverity;
  source: FrequencySource;
  /**
   * Content has been through the sourcing/accuracy pass.
   *
   * Seed data ships `false`. Unverified frequencies are browsable behind
   * the founder gate but are excluded from push selection entirely —
   * see `getPushEligible`. Flip to `true` only after the entry has been
   * checked against its source.
   */
  verified: boolean;
}

export interface ThemeMeta {
  /** Display label, title case. */
  label: string;
  domain: FrequencyDomain;
  /**
   * How the weekly notification describes this theme when it wins.
   * Pressure/period register — describes a stretch of time, never a
   * prediction of illness or an outcome. This string can appear in a
   * push body, so it must be safe with no disclaimer attached.
   */
  pressure: string;
}
