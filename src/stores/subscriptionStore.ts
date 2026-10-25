import { create } from 'zustand';

export type TierLevel = 'free' | 'starter' | 'light' | 'premium' | 'pro';

/** Free looks at the Zodisphere 3D globe before the paywall. ANY paying
 *  subscriber (starter and up) is unlimited — see FEATURE_TIER.zodisphere_3d.
 *  Counted on the profile row, not device storage, so clearing cache or
 *  switching device doesn't reset it. */
export const FREE_ZODISPHERE_3D_VIEWS = 3;

/** Transits: free sees this many cycle cards in full, the rest are a locked
 *  teaser (titles visible). Full list, detail readings and the 12-month
 *  Storylines need any paid plan (FEATURE_TIER.transits_full). Until
 *  TRANSIT_GATE_STARTS everyone keeps full access and free users see a
 *  heads-up banner, so existing members aren't cut off without warning. */
export const FREE_TRANSIT_EVENTS = 1;
export const TRANSIT_GATE_STARTS = new Date('2026-11-08T00:00:00Z');
/** Accounts created on/after this are gated immediately; older ones get the
 *  grace period. A missing created_at counts as an existing account. */
export const TRANSIT_GATE_ANNOUNCED = new Date('2026-10-25T00:00:00Z');

export function isTransitGateLive(createdAt?: string | null): boolean {
  if (Date.now() >= TRANSIT_GATE_STARTS.getTime()) return true;
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  return !Number.isNaN(created) && created >= TRANSIT_GATE_ANNOUNCED.getTime();
}

export const AI_LIMITS: Record<TierLevel, number> = {
  free: 3,
  starter: 10,
  light: 30,
  premium: 100,
  pro: 300,
};

export const FEATURE_TIER: Record<string, TierLevel> = {
  // Free
  natal_basic: 'free',
  tarot_single: 'free',
  planetary_hours: 'free',
  transits_basic: 'free',
  transits_full: 'starter',
  galactic_clock: 'free',
  // Starter — i.e. ANY paying subscriber (rank >= starter) gets these
  zodisphere_3d: 'starter', // 3D globe: unlimited on any paid plan; free tier is capped at FREE_ZODISPHERE_3D_VIEWS
  natal_full: 'starter',
  cosmic_journal: 'starter',
  soul_gifts: 'starter',
  soul_memory: 'starter',
  angel_numbers: 'starter',
  soul_ascension: 'starter',
  chart_adjuster: 'starter',
  // Light
  ai_readings: 'light',
  name_analysis: 'light',
  numerology_reading: 'light',
  cosmic_matches: 'light',
  soul_fragments: 'light',
  saved_charts: 'light',
  arabic_parts: 'light',
  athletes: 'light',
  cosmic_index: 'light',
  // Premium
  ai_astrologer: 'premium',
  synastry: 'premium',
  human_design: 'premium',
  starseed: 'premium',
  financial: 'premium',
  acg: 'premium',
  tarot: 'premium',
  midpoints: 'premium',
  transit_reading: 'premium',
  ai_personal_reading: 'premium',
  world_echo: 'premium',
  galactic_forecast: 'premium',
  dream_oracle: 'premium',
  composite: 'premium',
  solar_return: 'premium',
  lunar_return: 'premium',
  progressed: 'premium',
  year_ahead: 'premium',
  compatibility: 'premium',
  moon_phases: 'light',
  // Pro
  fixed_stars: 'pro',
  zodiacal_releasing: 'pro',
  firdaria: 'pro',
  rectification: 'free', // free on every plan — it's the tool that rescues a signup who doesn't know their birth time
  pathway: 'pro',
  // Dating features
  dating_basic: 'free',
  dating_extended: 'light',
  dating_premium: 'premium',
  dating_unlimited: 'pro',
  cosmic_rose: 'free',
  dating_video_call: 'premium',
  dating_icebreakers: 'light',
  dating_coach: 'premium',
  dating_concierge: 'pro',
};

const TIER_RANK: Record<TierLevel, number> = { free: 0, starter: 1, light: 2, premium: 3, pro: 4 };

interface SubscriptionState {
  tier: TierLevel;
  loading: boolean;
  setTier: (tier: TierLevel) => void;
  setLoading: (loading: boolean) => void;
  hasAccess: (feature: string) => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  tier: 'free',
  loading: true,
  setTier: (tier) => set({ tier }),
  setLoading: (loading) => set({ loading }),
  hasAccess: (feature: string) => {
    const { tier } = get();
    const requiredTier = FEATURE_TIER[feature] || 'free';
    return TIER_RANK[tier] >= TIER_RANK[requiredTier];
  },
}));
