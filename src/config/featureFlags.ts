/**
 * Feature Flags (web) — mirrors the mobile pattern in
 * align-app/src/config/featureFlags.ts. All flags default to safe values;
 * when a flag is off the associated feature is completely invisible and has
 * zero impact on existing functionality.
 *
 * Flag values and the dev allowlist must stay in sync with mobile so both
 * platforms expose identical behavior.
 */

export const featureFlags = {
  // ── Duad–Compendium Astrocartography (experimental Align research system) ──

  /** Master kill switch — when false, no derived ACG code runs and no
   *  derived controls appear anywhere. Natal ACG is unaffected either way. */
  derived_acg_enabled: true,

  /** Duad ("Inner") map lines layer */
  duad_astrocartography_enabled: true,

  /** Compendium ("Essence") map lines layer */
  compendium_astrocartography_enabled: true,

  /** Phase 4 dev preview: restrict derived ACG to the developer allowlist.
   *  Flip to false to begin closed beta for all Pro users. */
  derived_acg_dev_only: true,
} as const;

export function isFeatureEnabled(flag: keyof typeof featureFlags): boolean {
  return featureFlags[flag] ?? false;
}

// ── Duad–Compendium Astrocartography access ─────────────────────────────────

export const DERIVED_ACG_DEV_ALLOWLIST = new Set<string>(['tametryol@gmail.com']);

export interface DerivedAcgAccess {
  anyEnabled: boolean;
  duad: boolean;
  compendium: boolean;
}

/**
 * Resolve derived-ACG availability for a user. Fail-safe: with the master
 * flag off, or a non-allowlisted user during the dev-only phase, everything
 * is off and zero derived computation may run.
 */
export function getDerivedAcgAccess(userEmail?: string | null): DerivedAcgAccess {
  const off: DerivedAcgAccess = { anyEnabled: false, duad: false, compendium: false };
  if (!featureFlags.derived_acg_enabled) return off;
  if (featureFlags.derived_acg_dev_only) {
    const email = (userEmail || '').toLowerCase();
    if (!email || !DERIVED_ACG_DEV_ALLOWLIST.has(email)) return off;
  }
  const duad = featureFlags.duad_astrocartography_enabled;
  const compendium = featureFlags.compendium_astrocartography_enabled;
  return { anyEnabled: duad || compendium, duad, compendium };
}
