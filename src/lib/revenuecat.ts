import { Purchases } from '@revenuecat/purchases-js';

let purchasesInstance: Purchases | null = null;

export const ENTITLEMENTS = {
  STARTER: 'starter',
  LIGHT: 'light',
  PREMIUM: 'premium',
  PRO: 'Align Pro',
} as const;

export type TierLevel = 'free' | 'starter' | 'light' | 'premium' | 'pro';

export function initRevenueCat(appUserId: string): Purchases {
  if (purchasesInstance) return purchasesInstance;

  const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY!;
  purchasesInstance = Purchases.configure(apiKey, appUserId);
  return purchasesInstance;
}

export function getRevenueCatInstance(): Purchases | null {
  return purchasesInstance;
}

export function resetRevenueCat() {
  purchasesInstance = null;
}

export function tierFromEntitlements(activeEntitlements: Record<string, any>): TierLevel {
  if (ENTITLEMENTS.PRO in activeEntitlements) return 'pro';
  if (ENTITLEMENTS.PREMIUM in activeEntitlements) return 'premium';
  if (ENTITLEMENTS.LIGHT in activeEntitlements) return 'light';
  if (ENTITLEMENTS.STARTER in activeEntitlements) return 'starter';
  return 'free';
}

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    aiReadings: 3,
    features: [
      'Daily horoscope (general)',
      'Natal chart overview (Sun, Moon, Rising)',
      '3 AI-powered readings per month',
      'Single tarot card draw',
      'Planetary hours calculator',
      '1 saved birth profile',
    ],
  },
  starter: {
    name: 'Starter',
    price: 4.99,
    annualPrice: 2.99,
    annualTotal: 35.88,
    annualSavings: 24,
    annualSavingsPercent: 40,
    aiReadings: 10,
    features: [
      '10 AI-powered readings per month',
      'Full natal chart (all planets)',
      'Daily personalized transit notifications',
      'Aura Mirror unlimited scans',
      'Cosmic Journal unlimited entries',
      'Soul Gifts & Soul Memory access',
    ],
  },
  light: {
    name: 'Light',
    price: 9,
    annualPrice: 5.49,
    annualTotal: 65.88,
    annualSavings: 42,
    annualSavingsPercent: 39,
    aiReadings: 30,
    features: [
      'Everything in Starter',
      '30 AI-powered readings per month',
      'Numerology life path reading',
      'Name analysis & cosmic matches',
      'Basic transit alerts',
      '5 saved chart readings',
    ],
  },
  premium: {
    name: 'Premium',
    price: 19,
    annualPrice: 11.49,
    annualTotal: 137.88,
    annualSavings: 90,
    annualSavingsPercent: 40,
    aiReadings: 100,
    features: [
      'Everything in Light',
      '100 AI-powered readings per month',
      'Full natal chart with aspects & patterns',
      'Progressed & solar return charts',
      'Synastry & composite compatibility',
      'Starseed & Human Design',
      'Financial astrology report',
      'All astrology courses',
    ],
  },
  pro: {
    name: 'Pro',
    price: 29,
    annualPrice: 17.99,
    annualTotal: 215.88,
    annualSavings: 132,
    annualSavingsPercent: 38,
    aiReadings: 300,
    features: [
      'Everything in Premium',
      '300 AI-powered readings per month',
      'Astro-cartography world maps',
      'Firdaria & zodiacal releasing',
      'Arabic parts & fixed stars',
      'Priority AI processing',
      'Unlimited saved profiles & readings',
      'Export professional reports',
    ],
  },
} as const;
