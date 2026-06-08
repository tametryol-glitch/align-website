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
 *   invoice.paid                   → attribute affiliate commission (purchase + renewal)
 *   charge.refunded                → reverse affiliate commission on refund
 *   invoice.payment_failed         → (logged, no tier change)
 *
 * The webhook secret (STRIPE_WEBHOOK_SECRET) is used to verify
 * event signatures. In development, use the Stripe CLI:
 *   stripe listen --forward-to localhost:3000/api/stripe/webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripe, tierFromPriceId } from '@/lib/stripe';
import { sendEmail } from '@/lib/emailService';
import { EMAIL_TEMPLATES } from '@/lib/emailTemplates';
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
 * Attribute an invoice payment to an affiliate.
 * Creates a conversion record and updates running totals.
 * Uses Stripe invoice ID in product_id for dedup.
 */
async function attributeAffiliateCommission(
  affiliateId: string,
  userId: string,
  revenueCents: number,
  conversionType: 'purchase' | 'renewal',
  invoiceId: string,
) {
  const admin = adminClient();

  // Dedup: skip if this invoice was already attributed
  const { data: existing } = await admin
    .from('affiliate_conversions')
    .select('id')
    .eq('product_id', invoiceId)
    .maybeSingle();

  if (existing) {
    console.log(`[Stripe Webhook] Invoice ${invoiceId} already attributed — skipping`);
    return;
  }

  // Look up affiliate's commission rate
  const { data: aff } = await admin
    .from('affiliates')
    .select('id, commission_rate_bps, status')
    .eq('id', affiliateId)
    .single();

  if (!aff || aff.status !== 'approved') {
    console.warn(`[Stripe Webhook] Affiliate ${affiliateId} not found or not approved — skipping commission`);
    return;
  }

  const rateBps = aff.commission_rate_bps || 2000; // default 20%
  const commissionCents = Math.floor((revenueCents * rateBps) / 10000);

  // Insert conversion record
  await admin.from('affiliate_conversions').insert({
    affiliate_id: affiliateId,
    user_id: userId,
    conversion_type: conversionType,
    revenue_cents: revenueCents,
    commission_cents: commissionCents,
    commission_rate_bps: rateBps,
    product_id: invoiceId, // Stripe invoice ID — used for dedup
    source: 'stripe',
    status: 'approved',
  });

  // Update affiliate running totals
  await admin.rpc('increment_affiliate_earnings', {
    aff_id: affiliateId,
    rev_cents: revenueCents,
    comm_cents: commissionCents,
  });

  console.log(
    `[Stripe Webhook] Affiliate ${affiliateId}: ${conversionType} commission ` +
    `$${(commissionCents / 100).toFixed(2)} on $${(revenueCents / 100).toFixed(2)} revenue ` +
    `(invoice ${invoiceId})`,
  );

  // Send commission notification email to affiliate
  try {
    const { data: affProfile } = await admin
      .from('affiliates')
      .select('name, email')
      .eq('id', affiliateId)
      .single();

    if (affProfile?.email) {
      const { subject, html } = EMAIL_TEMPLATES.affiliateCommissionEarned(
        affProfile.name || 'Affiliate',
        `$${(commissionCents / 100).toFixed(2)}`,
        `$${(revenueCents / 100).toFixed(2)}`,
        conversionType,
      );
      await sendEmail(affProfile.email, subject, html);
    }
  } catch (emailErr) {
    console.error('[Stripe Webhook] Commission email failed:', emailErr);
  }
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

      case 'invoice.paid': {
        // Cast to any for fields that vary across Stripe API versions
        const paidInvoice = event.data.object as any;

        // Skip zero-amount invoices (trials, credits, etc.)
        const amountPaid: number = paidInvoice.amount_paid ?? 0;
        if (amountPaid <= 0) break;

        // Only process subscription invoices
        const subRef = paidInvoice.subscription;
        const subId: string | null =
          typeof subRef === 'string' ? subRef : subRef?.id ?? null;

        if (!subId) break;

        // Retrieve subscription to check for affiliate metadata
        const paidSub = await stripe.subscriptions.retrieve(subId);
        const affiliateId = paidSub.metadata?.affiliate_id;

        if (!affiliateId) break; // Not an affiliate-referred subscription

        // Resolve user
        const custRef = paidInvoice.customer;
        const paidCustomerId: string | null =
          typeof custRef === 'string' ? custRef : custRef?.id ?? null;

        const paidUserId = paidCustomerId
          ? await resolveUserId(paidCustomerId, paidSub.metadata as Record<string, string>)
          : null;

        if (!paidUserId) {
          console.warn(`[Stripe Webhook] invoice.paid — user not found for customer ${paidCustomerId}`);
          break;
        }

        // Determine conversion type from billing reason
        const convType: 'purchase' | 'renewal' =
          paidInvoice.billing_reason === 'subscription_create'
            ? 'purchase'
            : 'renewal';

        await attributeAffiliateCommission(
          affiliateId,
          paidUserId,
          amountPaid,
          convType,
          paidInvoice.id,
        );

        console.log(
          `[Stripe Webhook] invoice.paid (${convType}): $${(amountPaid / 100).toFixed(2)} ` +
          `for user ${paidUserId}, affiliate ${affiliateId}`,
        );
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

      case 'charge.refunded': {
        // Reverse affiliate commission when a charge is refunded.
        // Looks up the original conversion by invoice ID and claws back
        // the commission so the affiliate balance stays accurate.
        const charge = event.data.object as any;
        const refundedAmount: number = charge.amount_refunded ?? 0;
        if (refundedAmount <= 0) break;

        // Find the invoice this charge belongs to
        const chargeInvoiceRef = charge.invoice;
        const chargeInvoiceId: string | null =
          typeof chargeInvoiceRef === 'string'
            ? chargeInvoiceRef
            : chargeInvoiceRef?.id ?? null;

        if (!chargeInvoiceId) break;

        const admin = adminClient();

        // Find the affiliate conversion that was attributed for this invoice
        const { data: conversion } = await admin
          .from('affiliate_conversions')
          .select('id, affiliate_id, user_id, commission_cents, revenue_cents, commission_rate_bps, status')
          .eq('product_id', chargeInvoiceId)
          .in('status', ['approved', 'paid'])
          .maybeSingle();

        if (!conversion) break; // No affiliate conversion for this invoice

        // Mark original conversion as reversed
        await admin
          .from('affiliate_conversions')
          .update({ status: 'reversed' })
          .eq('id', conversion.id);

        // Insert a refund reversal record (negative amounts)
        await admin.from('affiliate_conversions').insert({
          affiliate_id: conversion.affiliate_id,
          user_id: conversion.user_id,
          conversion_type: 'refund',
          revenue_cents: -conversion.revenue_cents,
          commission_cents: -conversion.commission_cents,
          commission_rate_bps: conversion.commission_rate_bps,
          product_id: `refund_${chargeInvoiceId}`,
          source: 'stripe',
          status: 'approved',
        });

        // Decrement affiliate running totals (negative values reverse the increment)
        await admin.rpc('increment_affiliate_earnings', {
          aff_id: conversion.affiliate_id,
          rev_cents: -conversion.revenue_cents,
          comm_cents: -conversion.commission_cents,
        });

        console.log(
          `[Stripe Webhook] REFUND: reversed $${(conversion.commission_cents / 100).toFixed(2)} ` +
          `commission for affiliate ${conversion.affiliate_id} (invoice ${chargeInvoiceId})`,
        );
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
