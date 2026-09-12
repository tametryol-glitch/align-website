// =============================================================================
// GET /api/cron/call-sweep
// =============================================================================
// Closes call_sessions rows that stopped heartbeating — a crashed app, a dead
// battery, a closed laptop lid. Without this they sit "active" forever and
// their minutes never land in anyone's usage, which would hide exactly the
// long-running calls this metering exists to catch.
//
// Duration is taken from last_heartbeat_at inside the function, not from the
// moment this cron happens to run, so a daily schedule still produces the
// right number. The admin Calls panel also sweeps on load, so the dashboard
// stays accurate between runs.
//
// Auth: same CRON_SECRET Bearer pattern as the other cron routes.
// =============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY' }, { status: 500 });
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await admin.rpc('call_sweep_stale', { p_grace_seconds: 120 });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, swept: data ?? 0 });
}
