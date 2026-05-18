import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/emailService';
import { EMAIL_TEMPLATES } from '@/lib/emailTemplates';

export const maxDuration = 60;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getAdminClient();

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name, birth_date, birth_time, latitude, longitude, timezone')
    .or('birth_date.is.null,latitude.is.null,longitude.is.null,timezone.is.null');

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ message: 'No users with incomplete birth data', sent: 0 });
  }

  const userIds = profiles.map(p => p.id);

  const { data: users, error: userError } = await supabase.auth
    .admin.listUsers({ perPage: 1000 });

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  const emailMap = new Map<string, string>();
  for (const u of users.users) {
    if (u.email) emailMap.set(u.id, u.email);
  }

  let sent = 0;
  let skipped = 0;
  let errors = 0;
  const results: Array<{ email: string; status: string }> = [];

  for (const profile of profiles) {
    const email = emailMap.get(profile.id);
    if (!email) {
      skipped++;
      continue;
    }

    const name = profile.display_name?.split(' ')[0] || 'Stargazer';
    const { subject, html } = EMAIL_TEMPLATES.birthDataReminder(name);
    const result = await sendEmail(email, subject, html);
    await new Promise(r => setTimeout(r, 250));

    if (result.success) {
      sent++;
      results.push({ email, status: 'sent' });
    } else {
      errors++;
      results.push({ email, status: `error: ${result.error}` });
    }
  }

  return NextResponse.json({
    totalIncomplete: profiles.length,
    sent,
    skipped,
    errors,
    results,
  });
}
