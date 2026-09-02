import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { sendEmail } from '@/lib/emailService';
import { EMAIL_TEMPLATES } from '@/lib/emailTemplates';

export const maxDuration = 60;

// ---------------------------------------------------------------------------
// Reminder policy
// ---------------------------------------------------------------------------
// A user gets at most MAX_REMINDERS emails in their lifetime, never closer
// together than COOLDOWN_DAYS. Both are enforced against the
// birth_reminder_state ledger (supabase-migration-birth-reminder-ledger.sql),
// which the DB trigger closes automatically the moment a birth date appears —
// so someone who fixes their info drops out of the list without anyone
// remembering to remove them.
const MAX_REMINDERS = 3;
const COOLDOWN_DAYS = 14;
const LEDGER = 'birth_reminder_state';

type LedgerRow = {
  user_id: string;
  email: string | null;
  reminders_sent: number;
  first_reminder_at: string | null;
  last_reminder_at: string | null;
  completed_at: string | null;
  opted_out: boolean;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  email: string | null;
  birth_date: string | null;
  birth_time: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function isAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader === `Bearer ${secret}`) return true;

  // Read session from request cookies (server-side)
  const supabase = createServerClient(
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const admin = getAdminClient();
  const { data } = await admin.from('profiles').select('is_admin').eq('id', user.id).single();
  return !!data?.is_admin;
}

// The ledger is created by a migration the operator runs by hand. Until it
// exists, every read of it fails with 42P01 — treat that as "no ledger yet"
// instead of 500ing the whole admin panel.
function isMissingLedger(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === '42P01' || (error.message || '').includes(LEDGER);
}

// ---------------------------------------------------------------------------
// Email addresses — profiles.email first, auth.users as the fallback
// ---------------------------------------------------------------------------
async function buildEmailMap(supabase: SupabaseClient, profiles: ProfileRow[]) {
  const emailMap = new Map<string, string>();
  for (const p of profiles) {
    if (p.email) emailMap.set(p.id, p.email);
  }

  // Page through auth.users rather than assuming one page covers the org.
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data?.users?.length) break;
    for (const u of data.users) {
      if (u.email && !emailMap.has(u.id)) emailMap.set(u.id, u.email);
    }
    if (data.users.length < 1000) break;
  }

  return emailMap;
}

// ---------------------------------------------------------------------------
// Classification — the single source of truth for who gets an email
// ---------------------------------------------------------------------------
type Bucket =
  | 'eligible'
  | 'cooling_down'
  | 'max_reminders'
  | 'opted_out'
  | 'cleared_after_completion'
  | 'no_email';

type Candidate = {
  userId: string;
  email: string | null;
  name: string;
  bucket: Bucket;
  remindersSent: number;
  lastReminderAt: string | null;
  daysUntilNext: number | null;
};

function classify(
  profiles: ProfileRow[],
  ledger: Map<string, LedgerRow>,
  emailMap: Map<string, string>,
  ignoreCooldown: boolean,
): Candidate[] {
  const now = Date.now();
  const cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

  return profiles.map((p) => {
    const state = ledger.get(p.id);
    const email = emailMap.get(p.id) || p.email || null;
    const name = p.display_name?.split(' ')[0] || 'Stargazer';
    const remindersSent = state?.reminders_sent ?? 0;
    const lastReminderAt = state?.last_reminder_at ?? null;

    let bucket: Bucket = 'eligible';
    let daysUntilNext: number | null = null;

    if (!email) {
      bucket = 'no_email';
    } else if (state?.opted_out) {
      bucket = 'opted_out';
    } else if (state?.completed_at) {
      // Ledger says they completed, yet birth_date is NULL again — they wiped
      // their own birth data. That is a choice, not an oversight; do not nag.
      bucket = 'cleared_after_completion';
    } else if (!ignoreCooldown && remindersSent >= MAX_REMINDERS) {
      bucket = 'max_reminders';
    } else if (!ignoreCooldown && lastReminderAt) {
      const elapsed = now - new Date(lastReminderAt).getTime();
      if (elapsed < cooldownMs) {
        bucket = 'cooling_down';
        daysUntilNext = Math.max(1, Math.ceil((cooldownMs - elapsed) / (24 * 60 * 60 * 1000)));
      }
    }

    return { userId: p.id, email, name, bucket, remindersSent, lastReminderAt, daysUntilNext };
  });
}

// Catch up any ledger row whose user completed while the trigger was absent
// (rows written before the migration, or birth dates set by direct SQL).
async function reconcile(supabase: SupabaseClient): Promise<number> {
  const { data: open, error } = await supabase
    .from(LEDGER)
    .select('user_id')
    .is('completed_at', null);

  if (error || !open?.length) return 0;

  const ids = open.map((r) => r.user_id);
  const { data: fixed } = await supabase
    .from('profiles')
    .select('id')
    .in('id', ids)
    .not('birth_date', 'is', null);

  if (!fixed?.length) return 0;

  await supabase
    .from(LEDGER)
    .update({ completed_at: new Date().toISOString(), completed_source: 'reconcile' })
    .in('user_id', fixed.map((r) => r.id));

  return fixed.length;
}

// ---------------------------------------------------------------------------
// GET — who is fixed, who is still pending, who is due for an email
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getAdminClient();

  const { data: allProfiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name, email, birth_date, birth_time, latitude, longitude, timezone')
    .range(0, 9999);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const profiles = (allProfiles || []) as ProfileRow[];
  const missing = profiles.filter((p) => !p.birth_date);
  const complete = profiles.filter(
    (p) => p.birth_date && p.latitude != null && p.longitude != null && p.timezone,
  );
  const needsBackfill = profiles.filter(
    (p) => p.birth_date && (p.latitude == null || p.longitude == null || !p.timezone),
  );

  const { data: ledgerRows, error: ledgerError } = await supabase
    .from(LEDGER)
    .select('user_id, email, reminders_sent, first_reminder_at, last_reminder_at, completed_at, opted_out');

  const ledgerReady = !isMissingLedger(ledgerError);
  if (ledgerError && !ledgerReady) {
    // Ledger not installed yet — still return the data picture, flagged.
    return NextResponse.json({
      ledgerReady: false,
      warning: 'Run supabase-migration-birth-reminder-ledger.sql to enable reminder de-duplication.',
      totals: {
        profiles: profiles.length,
        complete: complete.length,
        missingBirthDate: missing.length,
        needsCoordinateBackfill: needsBackfill.length,
      },
    });
  }
  if (ledgerError && ledgerReady) {
    return NextResponse.json({ error: ledgerError.message }, { status: 500 });
  }

  const ledger = new Map<string, LedgerRow>();
  for (const row of (ledgerRows || []) as LedgerRow[]) ledger.set(row.user_id, row);

  const emailMap = await buildEmailMap(supabase, profiles);
  const candidates = classify(missing, ledger, emailMap, false);

  const count = (b: Bucket) => candidates.filter((c) => c.bucket === b).length;

  // Users we emailed who have since entered a birth date — the whole point of
  // the ledger: they must never receive the reminder again.
  const fixedAfterReminder = profiles
    .filter((p) => {
      const s = ledger.get(p.id);
      return !!p.birth_date && !!s?.first_reminder_at;
    })
    .map((p) => {
      const s = ledger.get(p.id)!;
      return {
        email: emailMap.get(p.id) || p.email,
        name: p.display_name,
        remindersSent: s.reminders_sent,
        lastReminderAt: s.last_reminder_at,
        completedAt: s.completed_at,
        birthDate: p.birth_date,
      };
    });

  const stillMissingAfterReminder = candidates.filter((c) => c.remindersSent > 0);

  return NextResponse.json({
    ledgerReady: true,
    generatedAt: new Date().toISOString(),
    policy: { maxReminders: MAX_REMINDERS, cooldownDays: COOLDOWN_DAYS },
    totals: {
      profiles: profiles.length,
      complete: complete.length,
      missingBirthDate: missing.length,
      needsCoordinateBackfill: needsBackfill.length,
    },
    ledger: {
      tracked: ledger.size,
      fixedAfterReminder: fixedAfterReminder.length,
      stillMissingAfterReminder: stillMissingAfterReminder.length,
      eligibleNow: count('eligible'),
      coolingDown: count('cooling_down'),
      maxedOut: count('max_reminders'),
      optedOut: count('opted_out'),
      clearedAfterCompletion: count('cleared_after_completion'),
      noEmail: count('no_email'),
    },
    lists: {
      fixedAfterReminder: fixedAfterReminder.slice(0, 500),
      eligible: candidates.filter((c) => c.bucket === 'eligible').slice(0, 500),
      coolingDown: candidates.filter((c) => c.bucket === 'cooling_down').slice(0, 500),
      maxedOut: candidates.filter((c) => c.bucket === 'max_reminders').slice(0, 500),
      needsCoordinateBackfill: needsBackfill
        .slice(0, 500)
        .map((p) => ({ email: p.email, name: p.display_name, birthDate: p.birth_date })),
    },
  });
}

// ---------------------------------------------------------------------------
// POST — send the reminder to everyone still eligible
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { dryRun?: boolean; ignoreCooldown?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    // No body — a plain button press. Defaults apply.
  }
  const dryRun = !!body.dryRun;
  const ignoreCooldown = !!body.ignoreCooldown;

  const supabase = getAdminClient();

  // Only remind people who NEVER entered a birth date. Users who entered their
  // birth info but whose location wasn't geocoded (latitude/longitude/timezone
  // still null) have "filled it out" from their perspective — emailing them the
  // "add your birth info" reminder is wrong and generates complaints. That
  // partial-data cohort is fixed by backfilling coordinates, not by nagging.
  const { data: profileRows, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name, email, birth_date, birth_time, latitude, longitude, timezone')
    .is('birth_date', null);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const profiles = (profileRows || []) as ProfileRow[];
  if (profiles.length === 0) {
    return NextResponse.json({ message: 'No users with incomplete birth data', sent: 0, totalIncomplete: 0 });
  }

  // Load the ledger. If the migration hasn't been run, fall back to the old
  // behaviour (email everyone missing a birth date) rather than failing.
  const { data: ledgerRows, error: ledgerError } = await supabase
    .from(LEDGER)
    .select('user_id, email, reminders_sent, first_reminder_at, last_reminder_at, completed_at, opted_out')
    .in('user_id', profiles.map((p) => p.id));

  const ledgerReady = !isMissingLedger(ledgerError);
  if (ledgerError && ledgerReady) {
    return NextResponse.json({ error: ledgerError.message }, { status: 500 });
  }

  if (ledgerReady) await reconcile(supabase);

  const ledger = new Map<string, LedgerRow>();
  for (const row of (ledgerRows || []) as LedgerRow[]) ledger.set(row.user_id, row);

  const emailMap = await buildEmailMap(supabase, profiles);
  const candidates = classify(profiles, ledger, emailMap, ignoreCooldown);
  const recipients = candidates.filter((c) => c.bucket === 'eligible');

  const skipped = {
    coolingDown: candidates.filter((c) => c.bucket === 'cooling_down').length,
    maxedOut: candidates.filter((c) => c.bucket === 'max_reminders').length,
    optedOut: candidates.filter((c) => c.bucket === 'opted_out').length,
    clearedAfterCompletion: candidates.filter((c) => c.bucket === 'cleared_after_completion').length,
    noEmail: candidates.filter((c) => c.bucket === 'no_email').length,
  };

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      ledgerReady,
      totalIncomplete: profiles.length,
      wouldSend: recipients.length,
      skipped,
      recipients: recipients.slice(0, 500).map((r) => ({ email: r.email, remindersSent: r.remindersSent })),
    });
  }

  let sent = 0;
  let errors = 0;
  const results: Array<{ email: string; status: string }> = [];
  const nowIso = new Date().toISOString();
  const ledgerWrites: Array<Record<string, unknown>> = [];

  for (const recipient of recipients) {
    const { subject, html } = EMAIL_TEMPLATES.birthDataReminder(recipient.name);
    const result = await sendEmail(recipient.email!, subject, html);
    await new Promise((r) => setTimeout(r, 250));

    const prior = ledger.get(recipient.userId);

    if (result.success) {
      sent++;
      results.push({ email: recipient.email!, status: 'sent' });
      ledgerWrites.push({
        user_id: recipient.userId,
        email: recipient.email,
        reminders_sent: recipient.remindersSent + 1,
        first_reminder_at: prior?.first_reminder_at || nowIso,
        last_reminder_at: nowIso,
        last_error: null,
      });
    } else {
      errors++;
      results.push({ email: recipient.email!, status: `error: ${result.error}` });
      // A failed send is not a reminder — the counter stays put so the user
      // isn't burned out of their allowance by our own outage.
      ledgerWrites.push({
        user_id: recipient.userId,
        email: recipient.email,
        reminders_sent: recipient.remindersSent,
        first_reminder_at: prior?.first_reminder_at || null,
        last_reminder_at: prior?.last_reminder_at || null,
        last_error: result.error || 'unknown error',
      });
    }
  }

  let ledgerError2: string | null = null;
  if (ledgerReady && ledgerWrites.length > 0) {
    const { error } = await supabase.from(LEDGER).upsert(ledgerWrites, { onConflict: 'user_id' });
    if (error) ledgerError2 = error.message;
  }

  return NextResponse.json({
    ledgerReady,
    ...(ledgerReady
      ? {}
      : { warning: 'Run supabase-migration-birth-reminder-ledger.sql — reminders are not being de-duplicated yet.' }),
    ...(ledgerError2 ? { ledgerWriteError: ledgerError2 } : {}),
    totalIncomplete: profiles.length,
    eligible: recipients.length,
    sent,
    errors,
    skipped,
    results,
  });
}
