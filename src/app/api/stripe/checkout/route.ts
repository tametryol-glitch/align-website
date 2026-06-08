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

    // 5. Create Checkout Session
    const priceId = priceIdForPlan(plan);

    const sessionParams: any = {
      customer: customerId,
      client_reference_id: user.id,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
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
    console.error('[Stripe Checkout]', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

export { createCheckout as GET, createCheckout as POST };
