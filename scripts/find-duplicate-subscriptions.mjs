#!/usr/bin/env node
/**
 * Find customers who are paying for Align more than once.
 *
 *   node scripts/find-duplicate-subscriptions.mjs
 *
 * Before the proration fixes, a plan upgrade could open a SECOND Stripe
 * subscription at full price instead of prorating onto the existing one, so
 * the customer kept paying for the old tier as well. This lists everyone
 * currently in that state, newest duplicate first, with the monthly amount
 * they are being over-billed.
 *
 * READ-ONLY BY DESIGN. It never cancels a subscription and never issues a
 * refund — moving customer money is a decision a person makes, in the Stripe
 * dashboard, one customer at a time. This only tells you who to look at.
 *
 * Requires STRIPE_SECRET_KEY (read from the environment, or from .env.local).
 *
 * Two passes, because Align bills through two different mechanisms:
 *
 *   1. Stripe Subscriptions — what /api/stripe/checkout creates.
 *   2. RevenueCat Web Billing — what /pricing creates via purchases-js.
 *      These produce NO Stripe Subscription object at all. RevenueCat drives
 *      the recurring PaymentIntents itself and provisions a fresh Stripe
 *      customer per subscription (metadata.rc_billing_generated = "True"), so
 *      pass 1 is structurally blind to them: on 2026-09-07 this script
 *      reported "nothing to clean up" for an account holding zero Subscription
 *      objects, while a customer was paying Premium and Pro side by side.
 *      Pass 2 works off charges and groups by metadata.rc_customer_id.
 *
 * Note: this covers Stripe only. Subscriptions bought in the Android app are
 * billed by Google and are not visible here — check the Play Console
 * (Subscriptions -> filter by the affected user) for those.
 */

import Stripe from 'stripe';
import fs from 'node:fs';
import path from 'node:path';

/* ── Config ──────────────────────────────────────────────── */

// Statuses that mean the customer is still on the hook for this subscription.
// Matches the set the checkout route treats as "already subscribed".
const LIVE_STATUSES = new Set(['active', 'trialing', 'past_due', 'unpaid']);

function loadKey() {
  if (process.env.STRIPE_SECRET_KEY) return process.env.STRIPE_SECRET_KEY;

  // Fall back to .env.local so this runs without exporting anything first.
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return null;

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*STRIPE_SECRET_KEY\s*=\s*(.*)\s*$/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

/* ── Report ──────────────────────────────────────────────── */

const money = (cents, currency) =>
  `${(cents / 100).toFixed(2)} ${String(currency || '').toUpperCase()}`;

function describe(sub) {
  const item = sub.items.data[0];
  const price = item?.price;
  const nickname = price?.nickname || price?.id || 'unknown price';
  const amount = price?.unit_amount != null ? money(price.unit_amount, price.currency) : '—';
  const started = new Date(sub.created * 1000).toISOString().slice(0, 10);
  return `${sub.id}  ${started}  ${amount.padStart(12)}  ${sub.status.padEnd(9)}  ${nickname}`;
}

async function main() {
  const key = loadKey();
  if (!key) {
    console.error('Missing STRIPE_SECRET_KEY (set it in the environment or .env.local).');
    process.exit(1);
  }

  const stripe = new Stripe(key, { apiVersion: '2026-04-22.dahlia', maxNetworkRetries: 3 });

  console.log('Scanning Stripe subscriptions…\n');

  /** @type {Map<string, any[]>} */
  const byCustomer = new Map();
  let scanned = 0;

  for await (const sub of stripe.subscriptions.list({ status: 'all', limit: 100 })) {
    scanned++;
    if (!LIVE_STATUSES.has(sub.status)) continue;

    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
    if (!customerId) continue;

    if (!byCustomer.has(customerId)) byCustomer.set(customerId, []);
    byCustomer.get(customerId).push(sub);
  }

  const duplicates = [...byCustomer.entries()].filter(([, subs]) => subs.length > 1);

  // Newest duplicate first — those are the ones still worth catching quickly.
  duplicates.sort(
    (a, b) =>
      Math.max(...b[1].map((s) => s.created)) - Math.max(...a[1].map((s) => s.created)),
  );

  console.log(`Scanned ${scanned} subscriptions; ${byCustomer.size} customers with a live one.`);

  if (duplicates.length === 0) {
    console.log('\nNo customer has more than one live Stripe Subscription.');
    await scanWebBilling(stripe);
    return;
  }

  console.log(`\n${duplicates.length} customer(s) paying more than once:\n`);

  let overBilledCents = 0;

  for (const [customerId, subs] of duplicates) {
    let email = '(unknown)';
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (!customer.deleted) email = customer.email || '(no email)';
    } catch {
      /* keep the placeholder — a missing customer must not abort the scan */
    }

    // Everything except the cheapest is what they should not be paying.
    const amounts = subs
      .map((s) => s.items.data[0]?.price?.unit_amount || 0)
      .sort((a, b) => a - b);
    overBilledCents += amounts.slice(0, -1).reduce((a, b) => a + b, 0);

    console.log(`${email}  (${customerId})`);
    for (const sub of subs) console.log(`    ${describe(sub)}`);
    console.log('');
  }

  console.log(`Roughly ${money(overBilledCents, 'usd')}/month of duplicate billing.`);
  console.log(
    '\nNext: in the Stripe dashboard, for each customer keep the subscription for the tier\n' +
      'they actually want, cancel the other, and refund the charges it collected.',
  );

  await scanWebBilling(stripe);
}

/* ── Pass 2: RevenueCat Web Billing ──────────────────────── */

/**
 * Web Billing leaves no Subscription object behind, so the only trace of a
 * recurring charge is the charge itself. Group every RevenueCat-generated
 * customer by metadata.rc_customer_id (the RevenueCat app_user_id, which is
 * the Supabase user id) and flag anyone billed for more than one distinct
 * product inside a single billing window — that is one person paying for two
 * tiers at the same time.
 */
async function scanWebBilling(stripe) {
  console.log('');
  console.log('Scanning RevenueCat Web Billing charges…');

  const DAY = 86_400;
  const now = Date.now() / 1000;

  /** @type {Map<string, {email: string|null, customers: string[], charges: any[]}>} */
  const byRcCustomer = new Map();
  let customersScanned = 0;

  for await (const customer of stripe.customers.list({ limit: 100 })) {
    customersScanned++;
    const rcId = customer.metadata?.rc_customer_id;
    if (!rcId) continue;

    const charges = await stripe.charges.list({ customer: customer.id, limit: 100 });
    const paid = charges.data.filter((c) => c.status === 'succeeded' && !c.refunded);
    if (paid.length === 0) continue;

    if (!byRcCustomer.has(rcId)) {
      byRcCustomer.set(rcId, { email: customer.email, customers: [], charges: [] });
    }
    const group = byRcCustomer.get(rcId);
    group.customers.push(customer.id);
    for (const c of paid) {
      group.charges.push({
        created: c.created,
        amount: c.amount,
        currency: c.currency,
        product: c.metadata?.rc_product_identifier || c.description || 'unknown product',
        refunded: c.amount_refunded,
      });
    }
  }

  console.log(
    `Scanned ${customersScanned} customers; ${byRcCustomer.size} with Web Billing charges.`,
  );

  // "At once" = more than one distinct product charged inside the window a
  // single monthly cycle covers. Two charges for the SAME product 30 days
  // apart are renewals, not duplicates.
  const offenders = [];
  for (const [rcId, group] of byRcCustomer) {
    const recent = group.charges.filter((c) => now - c.created < 45 * DAY);
    const products = new Set(recent.map((c) => c.product));
    if (products.size > 1) offenders.push([rcId, group, products]);
  }

  if (offenders.length === 0) {
    console.log('No Web Billing customer is paying for two tiers at once.');
    return;
  }

  console.log('');
  console.log(`${offenders.length} Web Billing customer(s) paying for two tiers at once:`);
  console.log('');

  let overBilledCents = 0;

  for (const [rcId, group, products] of offenders) {
    console.log(`${group.email || '(no email)'}  rc_customer_id=${rcId}`);
    console.log(`  stripe customers: ${group.customers.join(', ')}`);

    for (const c of [...group.charges].sort((a, b) => a.created - b.created)) {
      const when = new Date(c.created * 1000).toISOString().slice(0, 10);
      const refundNote = c.refunded ? `  (refunded ${money(c.refunded, c.currency)})` : '';
      console.log(`    ${when}  ${money(c.amount, c.currency).padStart(12)}  ${c.product}${refundNote}`);
    }

    // Which tier the customer actually WANTS is not knowable from Stripe, so
    // this assumes they keep the most expensive one and reports the rest as
    // duplicate spend. That is a LOWER BOUND: a customer who meant to keep the
    // cheaper tier is being over-billed by more than this.
    const latestPerProduct = [...products]
      .map((product) => {
        const forProduct = group.charges
          .filter((c) => c.product === product && now - c.created < 45 * DAY)
          .sort((a, b) => b.created - a.created);
        return forProduct[0]?.amount || 0;
      })
      .sort((a, b) => a - b);
    overBilledCents += latestPerProduct.slice(0, -1).reduce((a, b) => a + b, 0);

    console.log('');
  }

  console.log(`At least ${money(overBilledCents, 'usd')}/month of duplicate Web Billing.`);
  console.log('');
  console.log('Next: these are NOT Stripe subscriptions — cancelling in the Stripe');
  console.log('dashboard will NOT stop the charges. Cancel them in the RevenueCat');
  console.log('dashboard (Customers -> search the rc_customer_id above -> the');
  console.log('subscription for the tier they did not want).');
}

main().catch((err) => {
  console.error('Scan failed:', err?.message || err);
  process.exit(1);
});
