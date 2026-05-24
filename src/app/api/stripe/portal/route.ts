/**
 * GET /api/stripe/portal
 *
 * Creates a Stripe Customer Portal session and redirects the
 * authenticated user to it. The portal lets users:
 *   - Update payment methods
 *   - Switch plans (upgrade / downgrade)
 *   - Cancel their subscription
 *   - View invoice history
 *
 * Requires the user to have a `stripe_customer_id` stored in
 * their Supabase profile (created during checkout).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';

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

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate
    const supabase = supabaseFromRequest(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(`${origin()}/auth/login`, 303);
    }

    // 2. Look up the Stripe customer ID
    const admin = adminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    const customerId = profile?.stripe_customer_id as string | null;

    if (!customerId) {
      // No Stripe customer yet — they haven't subscribed via Stripe.
      // Redirect back with a hint so the UI can show a message.
      return NextResponse.redirect(
        `${origin()}/settings/subscription?no_subscription=true`,
        303,
      );
    }

    // 3. Create Customer Portal session
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin()}/settings/subscription`,
    });

    return NextResponse.redirect(session.url, 303);
  } catch (err: any) {
    console.error('[Stripe Portal]', err?.message || err);
    return NextResponse.redirect(
      `${origin()}/settings/subscription?error=portal_failed`,
      303,
    );
  }
}
