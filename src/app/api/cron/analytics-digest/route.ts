// =============================================================================
// GET /api/cron/analytics-digest
// =============================================================================
// Turns the dashboard from something you visit into something that tells you.
//
// Two jobs in one route:
//   1. Evaluate the alert rules (public.analytics_alert_check) and email any
//      that fired but have not been notified yet. pg_cron also runs the check
//      hourly; this route is what actually DELIVERS the notification.
//   2. Send the daily KPI digest to every admin.
//
// ?mode=alerts  → alerts only (safe to run often)
// ?mode=digest  → digest only
// default       → both
//
// Auth: same CRON_SECRET Bearer pattern as the other cron routes.
// =============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/emailService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Apex redirects to www; link straight to www so emails don't take an extra hop.
const SITE = 'https://www.aligncosmic.com';

function admin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function adminEmails(db: SupabaseClient): Promise<string[]> {
  const { data } = await db.from('profiles').select('email').eq('is_admin', true);
  return (data || [])
    .map((r: { email: string | null }) => r.email)
    .filter((e): e is string => !!e && e.includes('@'));
}

const shell = (title: string, body: string) => `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0e1116;color:#e7ecf1;">
  <h1 style="font-size:18px;margin:0 0 4px;color:#fff;">${title}</h1>
  <p style="font-size:12px;color:#8593a0;margin:0 0 20px;">Align · ${new Date().toUTCString().slice(0, 16)}</p>
  ${body}
  <p style="font-size:11px;color:#64727f;margin-top:24px;border-top:1px solid #232d37;padding-top:12px;">
    <a href="${SITE}/admin/analytics" style="color:#45b8c2;text-decoration:none;">Open the dashboard →</a>
  </p>
</div>`;

const row = (label: string, value: string, tone = '#e7ecf1') => `
<tr>
  <td style="padding:6px 0;font-size:13px;color:#8593a0;">${label}</td>
  <td style="padding:6px 0;font-size:15px;font-weight:600;text-align:right;color:${tone};">${value}</td>
</tr>`;

const num = (n: unknown) =>
  typeof n === 'number' ? n.toLocaleString() : '—';

// ── Alerts ───────────────────────────────────────────────────────────────────

async function runAlerts(db: SupabaseClient): Promise<{ fired: number; emailed: number }> {
  // Evaluate now so a fresh problem is caught even between pg_cron ticks.
  // Ignore failures: the rules may not be installed yet, and a delivery run
  // must never abort just because evaluation did.
  try {
    await db.rpc('analytics_alert_check');
  } catch {
    /* alert rules not installed yet */
  }

  const { data: pending } = await db
    .from('analytics_alert_events')
    .select('*')
    .is('notified_at', null)
    .order('created_at', { ascending: false })
    .limit(25);

  const events = pending || [];
  if (!events.length) return { fired: 0, emailed: 0 };

  const recipients = await adminEmails(db);
  let emailed = 0;

  if (recipients.length) {
    const items = events
      .map(
        (e: { rule_name: string; message: string }) => `
      <div style="border-left:3px solid #e0715a;background:#2e1a16;padding:10px 12px;margin-bottom:8px;border-radius:0 6px 6px 0;">
        <div style="font-size:13px;font-weight:600;color:#e37a62;">${e.rule_name}</div>
        <div style="font-size:12px;color:#bcc7d2;margin-top:2px;">${e.message}</div>
      </div>`,
      )
      .join('');

    const html = shell(
      `${events.length} alert${events.length === 1 ? '' : 's'} fired`,
      items,
    );

    for (const to of recipients) {
      const res = await sendEmail(to, `Align alert: ${events[0].rule_name}`, html);
      if (res.success) emailed++;
    }
  }

  await db
    .from('analytics_alert_events')
    .update({ notified_at: new Date().toISOString() })
    .in('id', events.map((e: { id: string }) => e.id));

  return { fired: events.length, emailed };
}

// ── Daily digest ─────────────────────────────────────────────────────────────

async function runDigest(db: SupabaseClient): Promise<{ emailed: number }> {
  const [live, engagement, content, safety, revenue, tech] = await Promise.all([
    db.rpc('analytics_live_metrics'),
    db.rpc('analytics_engagement_metrics', { range_days: 1 }),
    db.rpc('analytics_content_metrics', { range_days: 1 }),
    db.rpc('analytics_safety_metrics', { range_days: 1 }),
    db.rpc('analytics_revenue_exact', { range_days: 1 }),
    db.rpc('analytics_tech_health', { range_days: 1 }),
  ]);

  const l = (live.data || {}) as Record<string, number>;
  const e = (engagement.data || {}) as Record<string, number>;
  const c = (content.data || {}) as Record<string, number>;
  const s = (safety.data || {}) as Record<string, number>;
  const r = (revenue.data || {}) as Record<string, number>;
  const t = (tech.data || {}) as Record<string, number>;

  const openReports = s.reports_open ?? 0;
  const crashFree = t.crash_free_session_pct;

  const html = shell(
    'Yesterday at a glance',
    `<table style="width:100%;border-collapse:collapse;">
      ${row('Active today', num(l.dau))}
      ${row('Weekly actives', num(l.wau))}
      ${row('Monthly actives', num(l.mau))}
      ${row('Total members', num(l.total_members))}
      ${row('New vs returning', `${num(e.new)} / ${num(e.returning)}`)}
      <tr><td colspan="2" style="padding-top:14px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#64727f;">Content</td></tr>
      ${row('Posts', num(c.posts))}
      ${row('Comments', num(c.comments))}
      ${row('Creator ratio', c.creator_ratio_pct != null ? `${c.creator_ratio_pct}%` : '—')}
      <tr><td colspan="2" style="padding-top:14px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#64727f;">Money</td></tr>
      ${row('Net revenue', r.net_cents != null ? `$${(r.net_cents / 100).toFixed(2)}` : '—')}
      ${row('New purchases', num(r.new_purchases))}
      ${row('Churn (vol / invol)', `${num(r.voluntary_churn)} / ${num(r.involuntary_churn)}`)}
      <tr><td colspan="2" style="padding-top:14px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#64727f;">Health</td></tr>
      ${row('Crash-free sessions', crashFree != null ? `${crashFree}%` : '—', (crashFree ?? 100) < 99 ? '#e37a62' : '#56c093')}
      ${row('Client errors', num(t.client_errors))}
      ${row('Open reports', num(openReports), openReports > 10 ? '#dca33c' : '#e7ecf1')}
    </table>`,
  );

  const recipients = await adminEmails(db);
  let emailed = 0;
  for (const to of recipients) {
    const res = await sendEmail(to, 'Align — daily numbers', html);
    if (res.success) emailed++;
  }
  return { emailed };
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

  const mode = request.nextUrl.searchParams.get('mode') || 'both';

  try {
    const db = admin();
    const result: Record<string, unknown> = { mode };

    if (mode === 'alerts' || mode === 'both') {
      result.alerts = await runAlerts(db);
    }
    if (mode === 'digest' || mode === 'both') {
      result.digest = await runDigest(db);
    }

    return NextResponse.json({ ok: true, ...result, processedAt: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Cron] analytics-digest failed:', message);
    return NextResponse.json({ error: 'Internal error', details: message }, { status: 500 });
  }
}
