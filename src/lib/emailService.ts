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
    default:
      console.error(`[Email] Unknown template key: ${key}`);
      return { subject: 'Align', html: '<p>Something went wrong.</p>' };
  }
}
