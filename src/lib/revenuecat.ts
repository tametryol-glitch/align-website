import { Purchases } from '@revenuecat/purchases-js';

let purchasesInstance: Purchases | null = null;

export const ENTITLEMENTS = {
  LIGHT: 'light',
  PREMIUM: 'premium',
  PRO: 'Align Pro',
} as const;

export type TierLevel = 'free' | 'light' | 'premium' | 'pro';

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
  light: {
    name: 'Light',
    price: 9,
    aiReadings: 10,
    features: [
      'Daily personalized insights',
      'Natal chart with core positions',
      '10 AI-powered readings per month',
      'Basic transit alerts',
      'Numerology life path reading',
      '5 saved chart readings',
    ],
  },
  premium: {
    name: 'Premium',
    price: 19,
    aiReadings: 50,
    popular: true,
    features: [
      'Everything in Light',
      '50 AI-powered readings per month',
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
    aiReadings: 200,
    features: [
      'Everything in Premium',
      '200 AI-powered readings per month',
      'Astro-cartography world maps',
      'Firdaria & zodiacal releasing',
      'Arabic parts & fixed stars',
      'Priority AI processing',
      'Unlimited saved profiles & readings',
      'Export professional reports',
    ],
  },
} as const;
