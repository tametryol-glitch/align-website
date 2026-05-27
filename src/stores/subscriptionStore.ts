import { create } from 'zustand';

export type TierLevel = 'free' | 'starter' | 'light' | 'premium' | 'pro';

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
  galactic_clock: 'free',
  // Starter
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
  rectification: 'pro',
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
