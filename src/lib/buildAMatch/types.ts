// ═══════════════════════════════════════════════════════════════════
// Build-A-Match — shared types (web)
//
// EXACT MIRROR of align-app/src/services/buildAMatch/types.ts.
//
// "Build your type. Let Align find them."
//
// Deliberately free of Supabase / React Native imports so the scoring
// engine that consumes these types stays unit-testable in plain Node.
// ═══════════════════════════════════════════════════════════════════

/**
 * The four priority states (§5). `any` is the absence of a requirement —
 * it is never persisted as a criterion row, it just means the user left
 * that body alone.
 */
export type Priority = 'must' | 'preferred' | 'any' | 'avoid';

/** Re-exported from Align's existing preference engine — not redefined. */
import type { PreferenceBreakdown } from '@/lib/preferenceMatchingEngine';
export type { PreferenceBreakdown };

/** Priorities that actually reach the database. */
export type StoredPriority = Exclude<Priority, 'any'>;

/** How hard the search enforces the MUST-HAVEs (§13). */
export type SearchMode = 'exact' | 'close' | 'cosmic';

/**
 * How the signup preferences are applied.
 *
 * Gender / orientation compatibility is enforced in EVERY mode — it is not
 * a tuning knob. This only controls the rest:
 *   soft   — preferences rank and are shown, but never exclude
 *   strict — also exclude explicit dealbreaker contradictions
 *            (monogamous vs polyamorous, wants children vs doesn't, …)
 */
export type PreferenceMode = 'soft' | 'strict';

/** How the build was authored (§16). Phase 1 ships `manual`. */
export type BuildMode = 'manual' | 'smart' | 'cosmic' | 'friend' | 'surprise';

/** One requested placement. */
export interface BuildCriterion {
  /** A body name from INDEXABLE_PLANETS in cosmicIndexService. */
  body: string;
  /** A sign name from SIGNS. */
  sign: string;
  priority: StoredPriority;
}

/** A saved build (§27). */
export interface SavedBuild {
  id: string;
  owner_id: string;
  name: string;
  mode: BuildMode;
  search_mode: SearchMode;
  criteria: BuildCriterion[];
  advanced_criteria: Record<string, unknown>;
  dating_only: boolean;
  is_active: boolean;
  visibility: 'private' | 'shareable';
  notify_on_new_match: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

/** Per-criterion hit/miss detail, so every result is explainable (§45). */
export interface CriterionOutcome extends BuildCriterion {
  matched: boolean;
  /** The sign the candidate actually has for this body, when known. */
  actualSign?: string | null;
}

/** Raw hit counts as returned by bam_search_matches. */
export interface FitCounts {
  must_hits: number;
  pref_hits: number;
  avoid_hits: number;
  must_total: number;
  pref_total: number;
}

/**
 * Why a candidate showed up. Build Fit and Cosmic Compatibility are kept
 * deliberately separate — §11 forbids blending them into one misleading
 * number.
 */
export interface BuildMatchResult {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  sunSign: string | null;
  moonSign: string | null;
  risingSign: string | null;

  /** 0–100. How closely they match what the user asked for. */
  buildFit: number;
  counts: FitCounts;
  /** Every criterion, matched or not, for the "why they match" panel. */
  outcomes: CriterionOutcome[];

  /** 0–100 from Align's own compatibility engine. Null until enriched. */
  cosmicCompatibility: number | null;
  /** Band text straight from the existing engine — never re-worded here. */
  compatibilityBand: string | null;

  /** 0–100: how well the VIEWER fits THEIR build. Null when they have none. */
  reciprocalFit: number | null;

  /**
   * 0–100 from Align's existing preferenceMatchingEngine — the signup
   * answers (intent, style, dealbreakers, pace, spirituality, …).
   * Deliberately a THIRD score: never folded into Build Fit or Cosmic
   * Compatibility, which measure different things.
   */
  preferenceMatch: number | null;
  /** Per-category detail so the card can explain the number. */
  preferenceBreakdown: PreferenceBreakdown[] | null;
  /** True when an explicit dealbreaker contradiction was detected. */
  hasPreferenceConflict: boolean;

  /**
   * The overlap of everything Align knows (§35). Genuinely rare by
   * design — every gate must pass on real data, and an unknown dimension
   * fails rather than passing.
   */
  isGoldenMatch: boolean;

  /** Derived labels (§31, §32, §33). */
  isPerfectBuild: boolean;
  isMutualBuild: boolean;
  isWildCard: boolean;
  isCloseBuild: boolean;

  /** True when this candidate's time-dependent points are unreliable (§38). */
  birthTimeKnown: boolean;

  /** When they joined Align. Powers the "New Matches" section (§10). */
  joinedAt: string | null;

  /**
   * Which of the VIEWER's houses each of their bodies lands in.
   * Empty when the viewer has no reliable birth time — houses need a real
   * Ascendant, and a substituted noon is not one.
   */
  houseOverlays: Array<{ body: string; sign: string; house: number }>;

  /** Per selected outcome: which bodies actually delivered it. */
  outcomeResults: Array<{
    outcomeId: string;
    label: string;
    hit: string[];
    missed: string[];
  }>;

  /**
   * The strongest cross-aspects between the two charts, already named.
   * `inner` is the viewer's body, `outer` is theirs. Empty when there was
   * not enough indexed data to run the grid.
   */
  aspects: Array<{
    inner: string;
    outer: string;
    aspect: string;
    orb: number;
    strength: number;
    supportive: boolean;
  }>;

  /**
   * Their bodies landing on YOUR midpoints, within 1°. Strongest first,
   * already named. Empty when there was not enough indexed data.
   */
  midpointActivations: Array<{
    activatingBody: string;
    a: string;
    b: string;
    aspect: string;
    orb: number;
    strength: number;
    isShadow: boolean;
    name: string | null;
    light: string | null;
    shadow: string | null;
  }>;
}

/** Discovery categories (§10). */
export type DiscoveryCategory =
  | 'best'
  | 'perfect'
  | 'mutual'
  | 'golden'
  | 'cosmically_strong'
  | 'aligned_on_paper'
  | 'wild_cards'
  | 'close'
  | 'new'
  | 'rare';

export interface DiscoverySection {
  key: DiscoveryCategory;
  title: string;
  subtitle: string;
  results: BuildMatchResult[];
}

/** Result of a live pool count, honouring small-pool suppression (§8). */
export interface PoolCount {
  count: number;
  /** True when the real number is withheld because the pool is tiny. */
  suppressed: boolean;
  /** How many eligible, indexed members were searched. */
  eligiblePool: number;
  minPool: number;
}

/** One row of the zero-result recovery analysis (§14). */
export interface RelaxationOption {
  body: string;
  sign: string;
  /** Pool size if this single MUST were dropped. Real data, never guessed. */
  poolIfRelaxed: number;
}

/** Build rarity within the eligible population (§15). */
export interface BuildRarity {
  /** Null when the population is too small for the number to mean anything. */
  percent: number | null;
  matchCount: number;
  eligiblePool: number;
  label: string;
}
