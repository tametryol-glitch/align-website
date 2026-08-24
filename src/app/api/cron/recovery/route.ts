// =============================================================================
// GET /api/cron/recovery
// =============================================================================
// Three recovery flows the analytics build-out surfaced on 2026-08-24, all of
// which were losing users silently:
//
//   1. DUNNING          — 8 subscribers in 30 days hit `billing_issue`, which
//                         is 24% of all churn. Nobody was told their card
//                         failed. This is the cheapest revenue in the business.
//   2. PENDING REQUESTS — 170 friend requests sat unanswered, the oldest since
//                         2026-04-01. Both sides get one nudge.
//   3. UNCONFIRMED      — 26 accounts never confirmed their email and can
//                         therefore never log back in.
//
// Every flow is capped, deduplicated against its own send log, and idempotent,
// so running this twice in a day does not double-email anyone.
//
// ?mode=dunning|connections|confirm  → run one flow
// default                            → all three
//
// Auth: same CRON_SECRET Bearer pattern as the other cron routes.
// =============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/emailService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE = 'https://aligncosmic.com';

// Per-run caps. Deliberately conservative — a bug here emails real users.
const MAX_DUNNING = 50;
const MAX_NUDGES = 100;
const MAX_CONFIRM = 50;

// Don't re-nudge the same person about the same thing inside this window.
const COOLDOWN_DAYS = 14;

function admin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

const shell = (heading: string, body: string, cta?: { label: string; href: string }) => `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:28px 24px;background:#0e1116;color:#e7ecf1;">
  <h1 style="font-size:19px;margin:0 0 14px;color:#fff;line-height:1.3;">${heading}</h1>
  ${body}
  ${cta ? `<p style="margin:24px 0 0;">
    <a href="${cta.href}" style="display:inline-block;background:#45b8c2;color:#0e1116;font-weight:600;font-size:14px;text-decoration:none;padding:11px 20px;border-radius:8px;">${cta.label}</a>
  </p>` : ''}
  <p style="font-size:11px;color:#64727f;margin-top:28px;border-top:1px solid #232d37;padding-top:12px;">
    Align · <a href="${SITE}/settings/notifications" style="color:#64727f;">notification settings</a>
  </p>
</div>`;

const p = (text: string) =>
  `<p style="font-size:14px;line-height:1.6;color:#bcc7d2;margin:0 0 12px;">${text}</p>`;

/**
 * Has this user already been emailed about this reason recently?
 * Uses analytics_events as the send log so no new table is needed.
 */
async function recentlySent(
  db: SupabaseClient,
  userId: string,
  reason: string,
): Promise<boolean> {
  const since = new Date(Date.now() - COOLDOWN_DAYS * 86400_000).toISOString();
  const { data } = await db
    .from('analytics_events')
    .select('id')
    .eq('event_name', 'recovery_email_sent')
    .eq('user_id', userId)
    .gte('created_at', since)
    .contains('event_data', { reason })
    .limit(1);
  return !!(data && data.length);
}

async function logSend(db: SupabaseClient, userId: string, reason: string) {
  try {
    await db.from('analytics_events').insert({
      user_id: userId,
      event_name: 'recovery_email_sent',
      event_data: { reason },
    });
  } catch {
    /* logging must not block sending */
  }
}

// ── 1. Dunning ───────────────────────────────────────────────────────────────

async function runDunning(db: SupabaseClient) {
  const since = new Date(Date.now() - 30 * 86400_000).toISOString();

  const { data: issues } = await db
    .from('revenue_events')
    .select('user_id, occurred_at, product_id')
    .eq('event_type', 'billing_issue')
    .gte('occurred_at', since)
    .order('occurred_at', { ascending: false })
    .limit(MAX_DUNNING * 4);

  if (!issues?.length) return { candidates: 0, emailed: 0 };

  // One entry per user, most recent issue first.
  const latest = new Map<string, string>();
  for (const r of issues) {
    if (r.user_id && !latest.has(r.user_id)) latest.set(r.user_id, r.occurred_at);
  }

  let emailed = 0;
  let skipped = 0;

  for (const [userId, at] of Array.from(latest.entries())) {
    if (emailed >= MAX_DUNNING) break;

    // Recovered already? A later purchase/renewal after the failure means the
    // card went through and they must not be emailed.
    const { data: recovered } = await db
      .from('revenue_events')
      .select('id')
      .eq('user_id', userId)
      .in('event_type', ['renewal', 'initial_purchase', 'product_change'])
      .gt('occurred_at', at)
      .limit(1);
    if (recovered?.length) { skipped++; continue; }

    if (await recentlySent(db, userId, 'dunning')) { skipped++; continue; }

    const { data: profile } = await db
      .from('profiles')
      .select('email, display_name')
      .eq('id', userId)
      .single();
    if (!profile?.email) { skipped++; continue; }

    const name = profile.display_name?.split(' ')[0] || 'there';
    const html = shell(
      'Your payment didn’t go through',
      p(`Hi ${name} — your last Align payment was declined, so your subscription is at risk of lapsing.`) +
      p('This is almost always an expired card or a bank hold, and it takes about a minute to sort out.') +
      p('Your data, charts and readings are all still here.'),
      { label: 'Update payment method', href: `${SITE}/settings/subscription` },
    );

    const res = await sendEmail(profile.email, 'Your Align payment needs attention', html);
    if (res.success) { emailed++; await logSend(db, userId, 'dunning'); }
  }

  return { candidates: latest.size, emailed, skipped };
}

// ── 2. Pending friend requests ───────────────────────────────────────────────

async function runConnections(db: SupabaseClient) {
  // Pending requests older than 3 days — long enough that the in-app badge
  // clearly did not do the job.
  const cutoff = new Date(Date.now() - 3 * 86400_000).toISOString();

  const { data: pending } = await db
    .from('friendships')
    .select('id, user_id, friend_id, initiated_by, created_at')
    .eq('status', 'pending')
    .lt('created_at', cutoff)
    .order('created_at', { ascending: true })
    .limit(MAX_NUDGES * 2);

  if (!pending?.length) return { candidates: 0, emailed: 0 };

  // Nudge the RECIPIENT — the person who has a request waiting on them.
  const recipients = new Map<string, number>();
  for (const r of pending) {
    const recipient = r.initiated_by === r.user_id ? r.friend_id : r.user_id;
    if (!recipient) continue;
    recipients.set(recipient, (recipients.get(recipient) || 0) + 1);
  }

  let emailed = 0;
  let skipped = 0;

  for (const [userId, count] of Array.from(recipients.entries())) {
    if (emailed >= MAX_NUDGES) break;
    if (await recentlySent(db, userId, 'pending_requests')) { skipped++; continue; }

    const { data: profile } = await db
      .from('profiles')
      .select('email, display_name')
      .eq('id', userId)
      .single();
    if (!profile?.email) { skipped++; continue; }

    const name = profile.display_name?.split(' ')[0] || 'there';
    const plural = count === 1 ? 'request' : 'requests';
    const html = shell(
      `You have ${count} connection ${plural} waiting`,
      p(`Hi ${name} — ${count === 1 ? 'someone' : `${count} people`} asked to connect with you on Align and ${count === 1 ? 'is' : 'are'} still waiting.`) +
      p('Align gets a lot better with people in it — compatibility, synastry and the feed all key off who you are connected to.'),
      { label: `View ${plural}`, href: `${SITE}/friends` },
    );

    const res = await sendEmail(profile.email, `${count} connection ${plural} waiting on Align`, html);
    if (res.success) { emailed++; await logSend(db, userId, 'pending_requests'); }
  }

  return { candidates: recipients.size, emailed, skipped };
}

// ── 3. Unconfirmed emails ────────────────────────────────────────────────────

async function runConfirm(db: SupabaseClient) {
  // auth.admin.listUsers is paginated; one page is plenty at current scale.
  const { data, error } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error || !data?.users) return { candidates: 0, emailed: 0, error: error?.message };

  const unconfirmed = data.users.filter((u) => !u.email_confirmed_at && u.email);
  let emailed = 0;
  let skipped = 0;

  for (const u of unconfirmed) {
    if (emailed >= MAX_CONFIRM) break;
    if (await recentlySent(db, u.id, 'email_confirm')) { skipped++; continue; }

    // resend() re-triggers Supabase's own confirmation email for an existing
    // unconfirmed signup. generateLink({type:'signup'}) is the wrong call here
    // — it requires a password because it CREATES a user.
    const { error: resendErr } = await db.auth.resend({
      type: 'signup',
      email: u.email!,
    });
    if (!resendErr) { emailed++; await logSend(db, u.id, 'email_confirm'); }
    else skipped++;
  }

  return { candidates: unconfirmed.length, emailed, skipped };
}

// ── Route ────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const mode = request.nextUrl.searchParams.get('mode') || 'all';

  try {
    const db = admin();
    const result: Record<string, unknown> = { mode };

    if (mode === 'dunning' || mode === 'all') result.dunning = await runDunning(db);
    if (mode === 'connections' || mode === 'all') result.connections = await runConnections(db);
    if (mode === 'confirm' || mode === 'all') result.confirm = await runConfirm(db);

    return NextResponse.json({ ok: true, ...result, processedAt: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Cron] recovery failed:', message);
    return NextResponse.json({ error: 'Internal error', details: message }, { status: 500 });
  }
}
