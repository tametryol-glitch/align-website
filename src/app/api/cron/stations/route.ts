// Cron endpoint — Station Alerts. Runs daily.
//
//   GET /api/cron/stations  (header Authorization: Bearer <CRON_SECRET>)
//
// The station engine lives in align-api-v2 (Python / Swiss Ephemeris), so this
// route only triggers it:
//   1. POST /stations/sync-table  — idempotent upsert of the global cycle table.
//   2. POST /stations/dispatch    — builds today's personal alerts a page of
//      members at a time and writes the notification rows. The existing push-v2
//      DB trigger fans those out; this route never pushes anything itself.
//
// Idempotent: alerts are unique per (member, cycle, type), so a second run the
// same day creates and pushes nothing new.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://align-api-v2-production.up.railway.app/api/v1';
const PAGE = 500;
/** Hard stop so a runaway loop can never spin; 40 pages = 20,000 members. */
const MAX_PAGES = 40;

async function call(path: string, secret: string, body?: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Cron-Secret': secret },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`${path} -> ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return res.json();
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const started = new Date();
  try {
    const sync = await call('/stations/sync-table', cronSecret);

    let offset = 0;
    let pages = 0;
    const totals = { events: 0, considered: 0, created: 0, pushed: 0, failed: 0 };
    const failures: string[] = [];

    while (pages < MAX_PAGES) {
      const r = await call('/stations/dispatch', cronSecret, { offset, limit: PAGE });
      pages++;
      totals.events = Math.max(totals.events, r.events ?? 0);
      totals.considered += r.considered ?? 0;
      totals.created += r.created ?? 0;
      totals.pushed += r.pushed ?? 0;
      totals.failed += r.failed ?? 0;
      if (Array.isArray(r.failures)) failures.push(...r.failures);
      // No events today means no member can have anything: stop after page 1.
      if (!r.events || r.next_offset === null || r.next_offset === undefined) break;
      offset = r.next_offset;
    }

    return NextResponse.json({
      ok: true,
      stationRows: sync.rows,
      pages,
      ...totals,
      failures: failures.slice(0, 10),
      startedAt: started.toISOString(),
      processedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
