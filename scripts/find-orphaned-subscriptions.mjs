#!/usr/bin/env node
/**
 * Find live Stripe subscriptions belonging to accounts that no longer exist.
 *
 *   node scripts/find-orphaned-subscriptions.mjs               # built-in list
 *   node scripts/find-orphaned-subscriptions.mjs ids.txt       # one UUID per line
 *
 * Deleting a row from auth.users does not tell Stripe anything. If a deleted
 * account had a paid plan, Stripe keeps charging a card every month for a
 * user who can no longer log in, cancel, or ask for a refund. This finds them.
 *
 * Written for the 2026-09-07 under-18 account purge (21 accounts removed
 * before the billing check had been run), but it works for any list of
 * deleted Supabase user ids.
 *
 * Stripe customers reach this account two ways, and they are tagged
 * differently, so both have to be searched:
 *
 *   - metadata.supabase_user_id — set by src/app/api/stripe/checkout/route.ts
 *     when IT creates the customer.
 *   - metadata.rc_customer_id — set by RevenueCat Web Billing, which
 *     provisions its own Stripe customer per subscription. The value is the
 *     RevenueCat app_user_id, which is the same Supabase user id.
 *
 * Searching only the first key made this script report "nothing to refund" on
 * 2026-09-07 while an account with no profiles row was still being charged
 * $29/month, because every web subscriber is a Web Billing customer.
 *
 * For the same reason it checks CHARGES as well as subscriptions: Web Billing
 * creates no Stripe Subscription object at all — it drives the recurring
 * PaymentIntents itself — so a subscriptions.list scan sees nothing.
 *
 * READ-ONLY BY DESIGN, same as find-duplicate-subscriptions.mjs. It never
 * cancels a subscription and never issues a refund. Moving customer money is
 * a decision a person makes, in the Stripe dashboard, one customer at a time.
 *
 * Requires STRIPE_SECRET_KEY (from the environment, or from .env.local).
 *
 * Stripe only. Subscriptions bought in the iOS or Android app are billed by
 * Apple and Google and are invisible here — for those, search the same UUIDs
 * as app_user_id in RevenueCat, which is the system of record for both.
 */

import Stripe from 'stripe';
import fs from 'node:fs';
import path from 'node:path';

/* ── Config ──────────────────────────────────────────────── */

// Statuses that mean money is still moving. Matches find-duplicate-subscriptions.
const LIVE_STATUSES = new Set(['active', 'trialing', 'past_due', 'unpaid']);

// The 21 accounts removed by supabase-delete-underage-accounts.sql on
// 2026-09-07. The 6 marked ADULT were deleted in error — their birth date was
// a date-picker artifact, not a real age — so they are the ones most likely to
// still be paying, and the ones a refund conversation actually applies to.
const DELETED_USER_IDS = [
  '697d99f5-2b65-430e-80cf-e882aec4c2cb', // ADULT — born after signup
  '9485db4b-ac45-466e-9905-dcebba426eef', // ADULT — born after signup
  '783fdd78-7ad0-46dd-b0f5-49a6d6431ea3',
  'c0d43276-0b0a-4453-91f3-ed0d02559913',
  '8368bbc9-1503-410b-bf28-cce0ddad4998',
  '45ed3441-8a44-459a-8be6-97caa7d28e95',
  '57ec49e5-867c-4172-9fcc-15b89b2dd527',
  'fba89fd9-3346-4dc8-aca1-55af785dc58f',
  'ce3a86e7-1449-459e-945e-b07b214156e4', // ADULT — born after signup
  '214473a6-24b7-4653-b8c4-9abf681e2e89',
  '7ed1fff8-8874-48b4-a6cb-4f686274c160', // ADULT — birth date == signup date
  '1cfbf86a-0aa0-499d-b932-213bda64dcee', // ADULT — implausibly young
  'c6ac02f2-7ed6-4e35-92f5-6f9e543ca148',
  '3c5ca5b4-ccc0-4576-a6e5-ef8e8f29abc6', // ADULT — born after signup
  '192f4136-013e-4a8f-b0cf-3cc1ea07a314',
  '8a255b48-76f8-44d2-a413-e79979e99d31',
  'd287a28d-6501-40b8-92f1-f1990fe9fd68',
  '8e23d094-5b6e-445c-a17c-2d3350e17342',
  'dd0b91c9-f874-460f-9c23-f38a31b4b969',
  '9ec07f8d-7cff-434a-b9b5-9da6df33e893',
  '130f9135-b2c3-4512-9eb5-d9c91ce90053',
];

function loadKey() {
  if (process.env.STRIPE_SECRET_KEY) return process.env.STRIPE_SECRET_KEY;

  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return null;

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*STRIPE_SECRET_KEY\s*=\s*(.*)\s*$/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

function loadIds() {
  const file = process.argv[2];
  if (!file) return DELETED_USER_IDS;

  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^[0-9a-f-]{36}$/i.test(l));
}

/* ── Report ──────────────────────────────────────────────── */

const money = (cents, currency) =>
  `${(cents / 100).toFixed(2)} ${String(currency || '').toUpperCase()}`;

function describe(sub) {
  const price = sub.items.data[0]?.price;
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

  const ids = loadIds();
  if (ids.length === 0) {
    console.error('No user ids to check.');
    process.exit(1);
  }

  const stripe = new Stripe(key, { apiVersion: '2026-04-22.dahlia', maxNetworkRetries: 3 });

  console.log(`Checking ${ids.length} deleted account(s) against Stripe…\n`);

  const findings = [];
  let checked = 0;

  for (const userId of ids) {
    checked++;

    // Customer search is eventually consistent but covers metadata, which is
    // the only link left once the profiles row is gone.
    let customers = [];
    try {
      const res = await stripe.customers.search({
        query:
          `metadata['supabase_user_id']:'${userId}' OR ` +
          `metadata['rc_customer_id']:'${userId}'`,
        limit: 100,
      });
      customers = res.data;
    } catch (err) {
      console.error(`  ! search failed for ${userId}: ${err.message}`);
      continue;
    }

    for (const customer of customers) {
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'all',
        limit: 100,
      });

      const live = subs.data.filter((s) => LIVE_STATUSES.has(s.status));

      // No Subscription object does NOT mean no money is moving. A Web
      // Billing plan shows up only as a recent succeeded charge.
      const charges = await stripe.charges.list({ customer: customer.id, limit: 100 });
      const now = Date.now() / 1000;
      const currentCharges = charges.data.filter((c) => {
        if (c.status !== 'succeeded' || c.refunded) return false;
        if (!c.metadata?.rc_billing_generated) return false;
        const product = String(c.metadata?.rc_product_identifier || '');
        const windowDays = product.includes('annual') ? 370 : 40;
        return now - c.created < windowDays * 86_400;
      });

      // One line per PRODUCT, not per charge. The window is wide enough to
      // hold two renewals of the same monthly plan, and counting both would
      // double the reported cost of a single subscription.
      const latestByProduct = new Map();
      for (const c of currentCharges) {
        const product = String(c.metadata?.rc_product_identifier || c.description || 'unknown');
        const seen = latestByProduct.get(product);
        if (!seen || c.created > seen.created) latestByProduct.set(product, c);
      }
      const webBilling = [...latestByProduct.values()];

      if (live.length > 0 || webBilling.length > 0) {
        findings.push({ userId, customer, subs: live, webBilling });
      }
    }
  }

  console.log(`Checked ${checked} account(s).`);

  if (findings.length === 0) {
    console.log('\nNo live Stripe subscription belongs to a deleted account. Nothing to refund.');
    console.log('Still check RevenueCat for the same ids — Apple and Google billing is not here.');
    return;
  }

  console.log(`\n⚠ ${findings.length} deleted account(s) still being billed by Stripe:\n`);

  let monthlyCents = 0;

  for (const { userId, customer, subs, webBilling } of findings) {
    console.log(`${userId}`);
    console.log(`  customer ${customer.id}  ${customer.email || '(no email)'}`);
    for (const sub of subs) {
      console.log(`    ${describe(sub)}`);
      monthlyCents += sub.items.data[0]?.price?.unit_amount || 0;
    }
    for (const charge of webBilling || []) {
      const when = new Date(charge.created * 1000).toISOString().slice(0, 10);
      const product = charge.metadata?.rc_product_identifier || charge.description || 'unknown';
      console.log(`    RevenueCat Web Billing  ${when}  ${money(charge.amount, charge.currency)}  ${product}`);
      monthlyCents += charge.amount;
    }
    console.log('');
  }

  console.log(`Roughly ${(monthlyCents / 100).toFixed(2)} per billing period is still being charged`);
  console.log('to people who cannot log in to cancel it.');
  console.log('');
  console.log('Cancel each one where it actually lives — this script will not.');
  console.log('Stripe subscriptions: the Stripe dashboard.');
  console.log('Lines marked "RevenueCat Web Billing": the RevenueCat dashboard.');
  console.log('Cancelling those in Stripe does NOT stop the charges.');
  console.log('The customer email above is also how to reach the 6 adults deleted in error.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
