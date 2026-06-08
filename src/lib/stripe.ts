/**
 * Stripe server-side client + plan↔price mapping.
 *
 * Price IDs come from env vars so the same code runs against
 * both Stripe test-mode and live-mode products.
 */

import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');

  stripeInstance = new Stripe(key, {
    apiVersion: '2026-04-22.dahlia',
    typescript: true,
  });
  return stripeInstance;
}

/* ── Plan → Price mapping ─────────────────────────────────── */

export type PlanId = 'light' | 'premium' | 'pro';

const PLAN_PRICE_ENV: Record<PlanId, string> = {
  light: 'STRIPE_PRICE_LIGHT',
  premium: 'STRIPE_PRICE_PREMIUM',
  pro: 'STRIPE_PRICE_PRO',
};

export function priceIdForPlan(plan: PlanId): string {
  const envKey = PLAN_PRICE_ENV[plan];
  const priceId = process.env[envKey];
  if (!priceId) throw new Error(`${envKey} is not set`);
  return priceId;
}

export const VALID_PLANS: PlanId[] = ['light', 'premium', 'pro'];

export function isValidPlan(s: string): s is PlanId {
  return VALID_PLANS.includes(s as PlanId);
}

/* ── Affiliate referral coupon (10 % off first 2 months) ── */

const AFFILIATE_COUPON_ID = 'affiliate_10pct_2mo';

/**
 * Returns the Stripe coupon ID for the affiliate referral discount.
 * Creates the coupon the first time it's needed.
 */
export async function getOrCreateAffiliateCoupon(): Promise<string> {
  const stripe = getStripe();

  try {
    await stripe.coupons.retrieve(AFFILIATE_COUPON_ID);
    return AFFILIATE_COUPON_ID;
  } catch {
    // Coupon doesn't exist yet — create it
    await stripe.coupons.create({
      id: AFFILIATE_COUPON_ID,
      percent_off: 10,
      duration: 'repeating',
      duration_in_months: 2,
      name: 'Affiliate Referral — 10% off first 2 months',
    });
    return AFFILIATE_COUPON_ID;
  }
}

/* ── Tier from Stripe price ID (reverse lookup) ────────── */

export function tierFromPriceId(priceId: string): PlanId | null {
  for (const plan of VALID_PLANS) {
    const envKey = PLAN_PRICE_ENV[plan];
    if (process.env[envKey] === priceId) return plan;
  }
  return null;
}
