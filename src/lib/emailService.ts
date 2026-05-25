// Email service — provider-agnostic send + scheduled onboarding emails.
// Uses Resend if RESEND_API_KEY is set, otherwise logs to console.

import { createClient } from '@supabase/supabase-js';
import { EMAIL_TEMPLATES, type EmailTemplateKey } from './emailTemplates';

// ---------------------------------------------------------------------------
// Supabase admin client (service-role key, bypasses RLS)
// ---------------------------------------------------------------------------
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

// ---------------------------------------------------------------------------
// sendEmail — abstract send that works with Resend, or logs in dev
// ---------------------------------------------------------------------------
const FROM_ADDRESS = 'Align <hello@aligncosmic.com>';

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log('[Email Dev] Would send to:', to);
    console.log('[Email Dev] Subject:', subject);
    console.log('[Email Dev] HTML length:', html.length, 'chars');
    return { success: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_ADDRESS, to: [to], subject, html }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[Email] Resend error:', res.status, body);
      return { success: false, error: `Resend ${res.status}: ${body}` };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Email] Send failed:', message);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// scheduleOnboardingEmails — queue the 3-email sequence into the DB
// ---------------------------------------------------------------------------
export async function scheduleOnboardingEmails(
  userId: string,
  email: string,
  name: string,
  sunSign: string,
): Promise<void> {
  const supabase = getAdminClient();
  const now = new Date();

  const emails = [
    {
      template_key: 'welcome' as EmailTemplateKey,
      send_at: now.toISOString(),
      context: { name, sunSign },
    },
    {
      template_key: 'day3' as EmailTemplateKey,
      send_at: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      context: { name, sunSign },
    },
    {
      template_key: 'day7' as EmailTemplateKey,
      send_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      context: { name },
    },
  ];

  const rows = emails.map((e) => ({
    user_id: userId,
    email,
    template_key: e.template_key,
    send_at: e.send_at,
    sent: false,
    context: e.context,
  }));

  const { error } = await supabase.from('scheduled_emails').insert(rows);
  if (error) {
    console.error('[Email] Failed to schedule onboarding emails:', error.message);
  } else {
    console.log(`[Email] Scheduled ${rows.length} onboarding emails for ${email}`);
  }
}

// ---------------------------------------------------------------------------
// processScheduledEmails — called by cron to send all due emails
// ---------------------------------------------------------------------------
export async function processScheduledEmails(): Promise<{ sent: number; errors: number }> {
  const supabase = getAdminClient();

  // Fetch up to 50 unsent emails whose send_at has passed
  const { data: emails, error } = await supabase
    .from('scheduled_emails')
    .select('*')
    .eq('sent', false)
    .lte('send_at', new Date().toISOString())
    .order('send_at', { ascending: true })
    .limit(50);

  if (error) {
    console.error('[Email] Query error:', error.message);
    return { sent: 0, errors: 0 };
  }

  if (!emails || emails.length === 0) {
    return { sent: 0, errors: 0 };
  }

  let sent = 0;
  let errors = 0;

  for (const row of emails) {
    const { subject, html } = renderTemplate(row.template_key, row.context);
    const result = await sendEmail(row.email, subject, html);

    if (result.success) {
      await supabase
        .from('scheduled_emails')
        .update({ sent: true, sent_at: new Date().toISOString() })
        .eq('id', row.id);
      sent++;
    } else {
      console.error(`[Email] Failed id=${row.id}:`, result.error);
      errors++;
    }
  }

  console.log(`[Email] Processed batch: ${sent} sent, ${errors} errors`);
  return { sent, errors };
}

// ---------------------------------------------------------------------------
// scheduleReengagementEmails — find dormant users and queue re-engagement
// ---------------------------------------------------------------------------
export async function scheduleReengagementEmails(): Promise<{ scheduled: number }> {
  const supabase = getAdminClient();
  const now = new Date();
  let scheduled = 0;

  const tiers: { daysAgo: number; templateKey: EmailTemplateKey }[] = [
    { daysAgo: 7, templateKey: 'day7_inactive' },
    { daysAgo: 14, templateKey: 'day14_inactive' },
    { daysAgo: 30, templateKey: 'day30_inactive' },
  ];

  for (const tier of tiers) {
    const rangeStart = new Date(now.getTime() - (tier.daysAgo + 1) * 24 * 60 * 60 * 1000);
    const rangeEnd = new Date(now.getTime() - (tier.daysAgo - 1) * 24 * 60 * 60 * 1000);

    // Find users whose last activity falls within the ±1 day window
    const { data: dormantUsers, error: queryErr } = await supabase
      .from('profiles')
      .select('id, email, display_name, last_active_at, updated_at')
      .or(
        `last_active_at.gte.${rangeStart.toISOString()},updated_at.gte.${rangeStart.toISOString()}`,
      )
      .or(
        `last_active_at.lte.${rangeEnd.toISOString()},updated_at.lte.${rangeEnd.toISOString()}`,
      )
      .not('email', 'is', null);

    if (queryErr) {
      console.error(`[Email] Re-engagement query error (${tier.templateKey}):`, queryErr.message);
      continue;
    }

    if (!dormantUsers || dormantUsers.length === 0) continue;

    // Filter to users whose most recent activity is actually in the window
    const eligible = dormantUsers.filter((u) => {
      const lastActive = u.last_active_at
        ? new Date(u.last_active_at)
        : u.updated_at
          ? new Date(u.updated_at)
          : null;
      return lastActive && lastActive >= rangeStart && lastActive <= rangeEnd;
    });

    if (eligible.length === 0) continue;

    // Check for already-sent duplicates
    const userIds = eligible.map((u) => u.id);
    const { data: existing } = await supabase
      .from('scheduled_emails')
      .select('user_id')
      .eq('template_key', tier.templateKey)
      .in('user_id', userIds);

    const alreadySent = new Set((existing || []).map((r) => r.user_id));

    const rows = eligible
      .filter((u) => !alreadySent.has(u.id))
      .map((u) => ({
        user_id: u.id,
        email: u.email,
        template_key: tier.templateKey,
        send_at: now.toISOString(),
        sent: false,
        context: { name: u.display_name || 'Stargazer' },
      }));

    if (rows.length === 0) continue;

    const { error: insertErr } = await supabase.from('scheduled_emails').insert(rows);
    if (insertErr) {
      console.error(`[Email] Failed to schedule ${tier.templateKey}:`, insertErr.message);
    } else {
      scheduled += rows.length;
      console.log(`[Email] Scheduled ${rows.length} ${tier.templateKey} emails`);
    }
  }

  console.log(`[Email] Re-engagement total scheduled: ${scheduled}`);
  return { scheduled };
}

// ---------------------------------------------------------------------------
// scheduleWeeklyDigestEmails — queue weekly digest for active users
// ---------------------------------------------------------------------------
export async function scheduleWeeklyDigestEmails(): Promise<{ scheduled: number }> {
  const supabase = getAdminClient();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Find active users (last_active_at within 30 days) who have an email
  const { data: activeUsers, error: queryErr } = await supabase
    .from('profiles')
    .select('id, email, display_name, last_active_at')
    .gte('last_active_at', thirtyDaysAgo.toISOString())
    .not('email', 'is', null);

  if (queryErr) {
    console.error('[Email] Weekly digest query error:', queryErr.message);
    return { scheduled: 0 };
  }

  if (!activeUsers || activeUsers.length === 0) {
    return { scheduled: 0 };
  }

  // Avoid duplicate digests within the same week (check last 7 days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const userIds = activeUsers.map((u) => u.id);
  const { data: recentDigests } = await supabase
    .from('scheduled_emails')
    .select('user_id')
    .eq('template_key', 'weekly_digest')
    .gte('send_at', sevenDaysAgo.toISOString())
    .in('user_id', userIds);

  const alreadyScheduled = new Set((recentDigests || []).map((r) => r.user_id));

  const rows = activeUsers
    .filter((u) => !alreadyScheduled.has(u.id))
    .map((u) => ({
      user_id: u.id,
      email: u.email,
      template_key: 'weekly_digest' as EmailTemplateKey,
      send_at: now.toISOString(),
      sent: false,
      context: { name: u.display_name || 'Stargazer' },
    }));

  if (rows.length === 0) {
    return { scheduled: 0 };
  }

  const { error: insertErr } = await supabase.from('scheduled_emails').insert(rows);
  if (insertErr) {
    console.error('[Email] Failed to schedule weekly digests:', insertErr.message);
    return { scheduled: 0 };
  }

  console.log(`[Email] Scheduled ${rows.length} weekly digest emails`);
  return { scheduled: rows.length };
}

// ---------------------------------------------------------------------------
// renderTemplate — resolve a template_key + context into subject/html
// ---------------------------------------------------------------------------
function renderTemplate(
  key: string,
  context: Record<string, unknown>,
): { subject: string; html: string } {
  const name = (context.name as string) || 'Stargazer';
  const sunSign = (context.sunSign as string) || 'Cosmic Soul';

  switch (key) {
    case 'welcome':
      return EMAIL_TEMPLATES.welcome(name, sunSign);
    case 'day3':
      return EMAIL_TEMPLATES.day3(name, sunSign);
    case 'day7':
      return EMAIL_TEMPLATES.day7(name);
    case 'day7_inactive':
      return EMAIL_TEMPLATES.day7_inactive(name);
    case 'day14_inactive':
      return EMAIL_TEMPLATES.day14_inactive(name);
    case 'day30_inactive':
      return EMAIL_TEMPLATES.day30_inactive(name);
    case 'weekly_digest':
      return EMAIL_TEMPLATES.weekly_digest(name);
    default:
      console.error(`[Email] Unknown template key: ${key}`);
      return { subject: 'Align', html: '<p>Something went wrong.</p>' };
  }
}
