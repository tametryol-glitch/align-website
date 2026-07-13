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

// Plan catalog moved to plans.ts (pure data, importable from server components).
export { PLANS } from './plans';
