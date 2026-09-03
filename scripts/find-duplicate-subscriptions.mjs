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
    console.log('\nNo customer has more than one live subscription. Nothing to clean up.');
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
}

main().catch((err) => {
  console.error('Scan failed:', err?.message || err);
  process.exit(1);
});
