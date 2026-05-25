// Cron endpoint — schedules re-engagement + weekly digest emails for dormant/active users.
// Call via Vercel Cron, external cron service, or manual curl:
//   GET /api/cron/reengagement  (with header Authorization: Bearer <CRON_SECRET>)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  scheduleReengagementEmails,
  scheduleWeeklyDigestEmails,
} from '@/lib/emailService';

export const runtime = 'nodejs'; // needs supabase-js, not edge-compatible
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 },
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    );
  }

  try {
    const [reengagement, digest] = await Promise.all([
      scheduleReengagementEmails(),
      scheduleWeeklyDigestEmails(),
    ]);

    return NextResponse.json({
      ok: true,
      reengagement: reengagement.scheduled,
      digest: digest.scheduled,
      totalScheduled: reengagement.scheduled + digest.scheduled,
      processedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Cron] reengagement failed:', message);
    return NextResponse.json(
      { error: 'Internal error', details: message },
      { status: 500 },
    );
  }
}
