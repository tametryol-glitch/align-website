/**
 * Guard against starting a SECOND paid subscription for someone who already
 * has one.
 *
 * Why this exists (incident 2026-09-07):
 * ---------------------------------------
 * The web sells subscriptions through RevenueCat Web Billing
 * (`@revenuecat/purchases-js`). Unlike the native SDK — where
 * `purchasePackage(pkg, upgradeInfo, googleProductChangeInfo)` tells the store
 * which subscription to REPLACE — `PurchaseParams` in purchases-js 1.39.1 has
 * no replace/upgrade field at all (rcPackage, purchaseOption, htmlTarget,
 * customerEmail, locales, metadata — that is the whole surface). Web Billing
 * cannot swap a plan in place. Every `purchase()` call opens a BRAND-NEW
 * subscription, and RevenueCat provisions a BRAND-NEW Stripe customer for it
 * (metadata.rc_billing_generated = "True"), so nothing downstream dedupes:
 * the old subscription keeps billing forever, under a different customer id.
 *
 * One customer paid Align Premium ($19) and Align Pro ($29) side by side for
 * two full months before anyone noticed.
 *
 * So: the caller must check BEFORE it calls purchase(), and a plan change has
 * to go through cancel-then-resubscribe.
 *
 * Deliberately fails CLOSED. If RevenueCat can't be reached we report
 * `reachable: false` and callers must refuse the purchase. Treating an
 * unreachable billing backend as "this person has no subscription" is exactly
 * the mistake that produced the duplicate charges on mobile too (see
 * getActiveSubscriptionInfo in align-app). Blocking costs nothing here —
 * purchase() talks to the same backend, so if this call failed that one would
 * have failed anyway.
 */

import { getRevenueCatInstance, tierFromEntitlements, type TierLevel } from './revenuecat';

export interface LiveSubscriptionState {
  /** false = RevenueCat could not be reached. Never treat this as "free". */
  reachable: boolean;
  /** Tier RevenueCat itself reports right now — not the cached store value. */
  tier: TierLevel;
  /** RevenueCat's hosted management page, where a web subscription is cancelled. */
  managementURL: string | null;
}

/**
 * Ask RevenueCat — not the zustand store — what this user is actually paying
 * for right now.
 *
 * `useSubscriptionStore().tier` is a cache written once by AuthProvider, which
 * swallows its own failure (`console.warn` and move on), leaving the default
 * 'free' in place. Gating a purchase on that value means a transient sync
 * failure reads as "not subscribed" and bills the customer a second time.
 */
export async function getLiveSubscriptionState(): Promise<LiveSubscriptionState> {
  const purchases = getRevenueCatInstance();
  if (!purchases) {
    return { reachable: false, tier: 'free', managementURL: null };
  }

  try {
    const info = await purchases.getCustomerInfo();
    return {
      reachable: true,
      tier: tierFromEntitlements(info.entitlements.active),
      managementURL: info.managementURL ?? null,
    };
  } catch (err) {
    console.warn('[subscriptionGuard] Could not read customer info:', err);
    return { reachable: false, tier: 'free', managementURL: null };
  }
}

/**
 * Message shown when a plan change is blocked. Web Billing has no in-place
 * switch, so the honest instruction is "cancel the current one first" rather
 * than a button that quietly starts a second subscription.
 */
export function planChangeBlockedMessage(currentTier: TierLevel): string {
  const name = currentTier.charAt(0).toUpperCase() + currentTier.slice(1);
  return `You're already subscribed to ${name}. To switch plans, cancel your current subscription first — otherwise you'd be billed for both at the same time.`;
}

export const BILLING_UNAVAILABLE_MESSAGE =
  "We couldn't confirm your current subscription, so we've stopped here rather than risk billing you twice. Please try again in a moment.";
