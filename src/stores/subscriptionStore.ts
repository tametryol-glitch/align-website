import { create } from 'zustand';

export type TierLevel = 'free' | 'light' | 'premium' | 'pro';

export const FEATURE_TIER: Record<string, TierLevel> = {
  // Free
  natal_basic: 'free',
  tarot_single: 'free',
  planetary_hours: 'free',
  transits_basic: 'free',
  angel_numbers: 'free',
  galactic_clock: 'free',
  cosmic_journal: 'free',
  saved_charts: 'free',
  soul_gifts: 'light',
  soul_memory: 'light',
  // Light
  natal_full: 'light',
  ai_readings: 'light',
  name_analysis: 'light',
  numerology_reading: 'light',
  soul_fragments: 'light',
  moon_phases: 'light',
  // Premium
  ai_astrologer: 'premium',
  dream_oracle: 'premium',
  synastry: 'premium',
  human_design: 'premium',
  starseed: 'premium',
  financial: 'premium',
  acg: 'premium',
  tarot: 'premium',
  transit_reading: 'premium',
  world_echo: 'free',
  composite: 'premium',
  solar_return: 'premium',
  lunar_return: 'premium',
  progressed: 'premium',
  year_ahead: 'premium',
  galactic_forecast: 'premium',
  midpoints: 'free',
  compatibility: 'premium',
  // Pro
  fixed_stars: 'pro',
  zodiacal_releasing: 'pro',
  firdaria: 'pro',
  rectification: 'pro',
  pathway: 'pro',
  arabic_parts: 'pro',
};

const TIER_RANK: Record<TierLevel, number> = { free: 0, light: 1, premium: 2, pro: 3 };

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
    const requiredTier = FEATURE_TIER[feature] || 'free';
    return TIER_RANK[get().tier] >= TIER_RANK[requiredTier];
  },
}));
