// ═══════════════════════════════════════════════════════════════════
// Retired: "X is live" notifications now come from the database.
//
// This route used to fan out to the host's friends, but only the
// website called it — a stream started from the app told nobody. The
// trg_notify_live_started trigger on live_sessions now notifies
// followers and friends on every client (see
// supabase-migration-follower-notifications.sql).
//
// Kept as a no-op so browser tabs still running the old go-live page
// get a clean response instead of inserting a second copy of every
// notification.
// ═══════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ ok: true, notified: 0, reason: 'handled_by_database' });
}
