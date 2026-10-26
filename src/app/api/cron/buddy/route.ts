// Cron endpoint — Relationship Buddy nightly job. DRY RUN ONLY (see src/lib/buddyCron.ts).
//
//   GET /api/cron/buddy  (header Authorization: Bearer <CRON_SECRET>)
//
// Asks align-api-v2 to run the pair engine for every active Buddy pair, one page at a time:
//   POST /buddy/dispatch { offset, limit, dry_run: true }
// In dry-run the API computes what it WOULD store and writes nothing. It never pushes, so
// running this route (including from the Vercel dashboard "Run" button) cannot message anyone.
// The response carries counters only: never message text, names or chart data.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  BUDDY_DRY_RUN, BUDDY_MAX_PAGES, addPage, dispatchBody, emptyTotals, nextOffset,
  type DispatchPage,
} from '@/lib/buddyCron';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://align-api-v2-production.up.railway.app/api/v1';

async function dispatch(secret: string, offset: number): Promise<DispatchPage> {
  const res = await fetch(`${API_BASE}/buddy/dispatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Cron-Secret': secret },
    body: JSON.stringify(dispatchBody(offset)),
  });
  if (!res.ok) {
    throw new Error(`/buddy/dispatch -> ${res.status}: ${(await res.text()).slice(0, 200)}`);
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
    let totals = emptyTotals();
    const failures: string[] = [];
    const aiErrors: string[] = [];
    let offset = 0;
    let pages = 0;

    while (pages < BUDDY_MAX_PAGES) {
      const r = await dispatch(cronSecret, offset);
      pages++;
      totals = addPage(totals, r);
      if (Array.isArray(r.failures)) failures.push(...r.failures);
      if (Array.isArray(r.ai_errors)) aiErrors.push(...r.ai_errors);
      const next = nextOffset(offset, r);
      if (next === null) break;
      offset = next;
    }

    const result = {
      ok: true,
      dryRun: BUDDY_DRY_RUN,
      pages,
      ...totals,
      failures: failures.slice(0, 10),
      aiErrors: aiErrors.slice(0, 5),
      startedAt: started.toISOString(),
      processedAt: new Date().toISOString(),
    };
    // Vercel's "Run" button and cron history show no response body, so write the counters to the runtime
    // logs. Counters only: never message text, names or chart data.
    console.log('[buddy-cron] ' + JSON.stringify(result));
    return NextResponse.json(result);
  } catch (err) {
    console.log('[buddy-cron] failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
