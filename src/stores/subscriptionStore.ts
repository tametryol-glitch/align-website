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
  soul_gifts: 'free',
  soul_memory: 'free',
  // Light
  natal_full: 'light',
  ai_readings: 'light',
  name_analysis: 'light',
  numerology_reading: 'light',
  soul_fragments: 'light',
  moon_phases: 'light',
  // Premium
  ai_astrologer: 'premium',
  synastry: 'premium',
  human_design: 'premium',
  starseed: 'premium',
  financial: 'premium',
  acg: 'premium',
  tarot: 'premium',
  transit_reading: 'premium',
  world_echo: 'premium',
  composite: 'premium',
  solar_return: 'premium',
  lunar_return: 'premium',
  progressed: 'premium',
  year_ahead: 'premium',
  galactic_forecast: 'premium',
  midpoints: 'premium',
  compatibility: 'premium',
  // Pro
  fixed_stars: 'pro',
  zodiacal_releasing: 'pro',
  firdaria: 'pro',
  rectification: 'pro',
  pathway: 'pro',
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
