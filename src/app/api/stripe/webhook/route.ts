/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events to keep subscription state
 * in sync with Supabase.
 *
 * Events handled:
 *   checkout.session.completed     → link Stripe customer, set tier
 *   customer.subscription.updated  → update tier on plan change
 *   customer.subscription.deleted  → revert to free
 *   invoice.payment_failed         → (logged, no tier change)
 *
 * The webhook secret (STRIPE_WEBHOOK_SECRET) is used to verify
 * event signatures. In development, use the Stripe CLI:
 *   stripe listen --forward-to localhost:3000/api/stripe/webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripe, tierFromPriceId } from '@/lib/stripe';
import type Stripe from 'stripe';

/* ── Helpers ──────────────────────────────────────────────── */

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } },
  );
}

/**
 * Find the Supabase user ID for a Stripe customer.
 * Checks metadata first, then falls back to profile lookup.
 */
async function resolveUserId(
  customerId: string,
  metadata?: Record<string, string>,
): Promise<string | null> {
  // 1. Check subscription/session metadata
  if (metadata?.supabase_user_id) return metadata.supabase_user_id;

  // 2. Look up by stripe_customer_id in profiles
  const admin = adminClient();
  const { data } = await admin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  return data?.id ?? null;
}

/**
 * Update the user's subscription tier in profiles.
 */
async function setUserTier(userId: string, tier: string) {
  const admin = adminClient();
  await admin
    .from('profiles')
    .update({ subscription_tier: tier })
    .eq('id', userId);
}

/* ── Webhook route (raw body required for signature verify) ── */

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  // Stripe needs the raw body for signature verification
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // ── Handle events ──────────────────────────────────────

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          session.client_reference_id ??
          (session.metadata?.supabase_user_id || null);

        if (!userId) {
          console.warn('[Stripe Webhook] checkout.session.completed without user ID');
          break;
        }

        // Store Stripe customer ID if not already linked
        if (session.customer) {
          const customerId =
            typeof session.customer === 'string'
              ? session.customer
              : session.customer.id;

          const admin = adminClient();
          await admin
            .from('profiles')
            .update({ stripe_customer_id: customerId })
            .eq('id', userId);
        }

        // Set the tier from subscription metadata
        const plan = session.metadata?.plan;
        if (plan) {
          await setUserTier(userId, plan);
          console.log(`[Stripe Webhook] User ${userId} → tier ${plan}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;

        const userId = await resolveUserId(
          customerId,
          subscription.metadata as Record<string, string>,
        );
        if (!userId) {
          console.warn('[Stripe Webhook] subscription.updated — user not found for', customerId);
          break;
        }

        // Determine the new tier from the subscription's price
        const priceId = subscription.items.data[0]?.price?.id;
        if (priceId) {
          const tier = tierFromPriceId(priceId);
          if (tier) {
            await setUserTier(userId, tier);
            console.log(`[Stripe Webhook] User ${userId} subscription updated → ${tier}`);
          }
        }

        // Handle cancellation scheduled (cancel_at_period_end)
        if (subscription.cancel_at_period_end) {
          console.log(`[Stripe Webhook] User ${userId} cancellation scheduled at period end`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;

        const userId = await resolveUserId(
          customerId,
          subscription.metadata as Record<string, string>,
        );
        if (!userId) {
          console.warn('[Stripe Webhook] subscription.deleted — user not found for', customerId);
          break;
        }

        await setUserTier(userId, 'free');
        console.log(`[Stripe Webhook] User ${userId} subscription deleted → free`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : (invoice.customer as Stripe.Customer)?.id;

        if (customerId) {
          const userId = await resolveUserId(customerId);
          console.warn(`[Stripe Webhook] Payment failed for user ${userId || customerId}`);
        }
        break;
      }

      default:
        // Acknowledge unhandled events without error
        break;
    }
  } catch (err: any) {
    console.error(`[Stripe Webhook] Error handling ${event.type}:`, err.message);
    // Still return 200 so Stripe doesn't retry on our application errors
  }

  return NextResponse.json({ received: true });
}
