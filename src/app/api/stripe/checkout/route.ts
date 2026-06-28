/**
 * POST /api/stripe/checkout
 * GET  /api/stripe/checkout?plan=premium&email=user@example.com
 *
 * Creates a Stripe Checkout Session for the requested plan and
 * redirects (303) to Stripe's hosted checkout page.
 *
 * Query params / body:
 *   plan  — "light" | "premium" | "pro"
 *   email — (optional) pre-fills the email field on checkout
 *
 * The authenticated Supabase user ID is stored as
 * `client_reference_id` so the webhook can link the Stripe
 * customer back to the Supabase profile.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { getStripe, isValidPlan, priceIdForPlan, getOrCreateAffiliateCoupon } from '@/lib/stripe';

/* ── Helpers ──────────────────────────────────────────────── */

function supabaseFromRequest(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return req.cookies.get(name)?.value; },
        set() {},
        remove() {},
      },
    },
  );
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } },
  );
}

const origin = () =>
  process.env.NEXT_PUBLIC_APP_URL || 'https://align-astrology.com';

/* ── Route handler ────────────────────────────────────────── */

async function createCheckout(req: NextRequest) {
  try {
    // 1. Authenticate
    const supabase = supabaseFromRequest(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Parse params (support both GET query and POST body)
    let plan: string | null = null;
    let email: string | null = null;

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      plan = body.plan ?? null;
      email = body.email ?? null;
    }
    // GET query params (also used as fallback for POST)
    const url = new URL(req.url);
    plan = plan || url.searchParams.get('plan');
    email = email || url.searchParams.get('email') || user.email || null;

    if (!plan || !isValidPlan(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be one of: light, premium, pro' },
        { status: 400 },
      );
    }

    // 3. Look up (or create) the Stripe customer
    const stripe = getStripe();
    const admin = adminClient();

    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id as string | null;

    if (!customerId) {
      // Create a new Stripe customer and store the ID
      const customer = await stripe.customers.create({
        email: email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await admin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // 3b. If the customer already has an active subscription, this is an
    //     upgrade/downgrade — modify the EXISTING subscription with proration
    //     instead of creating a second parallel subscription (which would
    //     double-bill the customer). New subscribers fall through to checkout.
    const targetPriceId = priceIdForPlan(plan);

    const existing = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });
    const currentSub = existing.data[0];

    if (currentSub) {
      const currentItem = currentSub.items.data[0];
      const currentPriceId = currentItem?.price?.id;

      // Already on the requested plan — nothing to do.
      if (currentPriceId === targetPriceId) {
        return NextResponse.redirect(
          `${origin()}/settings/subscription?success=true`,
          303,
        );
      }

      // Swap the price on the existing subscription. always_invoice charges
      // the prorated difference immediately to the card already on file, so
      // we collect the upgrade revenue now rather than waiting a billing cycle.
      // Existing subscription metadata (incl. affiliate_id) is preserved.
      await stripe.subscriptions.update(currentSub.id, {
        items: [{ id: currentItem.id, price: targetPriceId }],
        proration_behavior: 'always_invoice',
        payment_behavior: 'error_if_incomplete',
        metadata: {
          ...currentSub.metadata,
          supabase_user_id: user.id,
          plan,
        },
      });

      // The customer.subscription.updated webhook sets the new tier.
      return NextResponse.redirect(
        `${origin()}/settings/subscription?success=true`,
        303,
      );
    }

    // 4. Check for affiliate referral — apply 10% off first 2 months
    const affiliateCookie = req.cookies.get('align_aff')?.value;
    let affiliateCouponId: string | null = null;

    if (affiliateCookie) {
      try {
        affiliateCouponId = await getOrCreateAffiliateCoupon();
      } catch (err) {
        console.error('[Stripe Checkout] Failed to get affiliate coupon:', err);
      }
    }

    // 5. Create Checkout Session (brand-new subscriber)
    const sessionParams: any = {
      customer: customerId,
      client_reference_id: user.id,
      mode: 'subscription',
      line_items: [{ price: targetPriceId, quantity: 1 }],
      success_url: `${origin()}/settings/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin()}/settings/subscription?canceled=true`,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan,
          ...(affiliateCookie ? { affiliate_id: affiliateCookie } : {}),
        },
      },
    };

    if (affiliateCouponId) {
      // Stripe doesn't allow both discounts and allow_promotion_codes
      sessionParams.discounts = [{ coupon: affiliateCouponId }];
    } else {
      sessionParams.allow_promotion_codes = true;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // 5. Redirect to Stripe Checkout
    if (session.url) {
      return NextResponse.redirect(session.url, 303);
    }

    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  } catch (err: any) {
    console.error('[Stripe Checkout]', err?.type || '', err?.message || err);

    // These routes are hit via full-page navigation, so redirect back to the
    // subscription page with an error code (the page renders a friendly banner)
    // rather than dumping raw JSON — and never leak Stripe's internal message.
    let reason = 'checkout_failed';
    if (err?.type === 'StripeConnectionError') {
      // Transient network failure reaching Stripe — not the user's fault and
      // usually fixed by retrying. (This is the "Request was retried N times" one.)
      reason = 'payment_unavailable';
    } else if (err?.type === 'StripeCardError') {
      // Card declined on an in-place upgrade (error_if_incomplete).
      reason = 'card_declined';
    }

    return NextResponse.redirect(
      `${origin()}/settings/subscription?error=${reason}`,
      303,
    );
  }
}

export { createCheckout as GET, createCheckout as POST };
