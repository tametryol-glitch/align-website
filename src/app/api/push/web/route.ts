// =============================================================================
// POST /api/push/web  —  Web Push relay
// =============================================================================
// The missing half of web push. Everything on the browser side already
// existed — pushService.ts subscribes, sw.js renders, push_subscriptions
// stores — but nothing ever SENT to those subscriptions, so a web-only
// account got no alerts at all. The DB trigger only knew how to reach Expo
// tokens, which only the mobile app ever registers.
//
// send_push_notification() now posts here once per notification, and this
// route fans out to every browser that user has subscribed. It lives in
// align-web rather than a Supabase Edge Function because Web Push needs the
// VAPID private key and aes128gcm payload encryption, which the `web-push`
// package does for us on the Node runtime, and because align-web deploys on
// git push.
//
// Auth: Bearer WEB_PUSH_RELAY_SECRET, the same shape the cron routes use.
// This endpoint can make a real notification appear on someone's device, so
// it must never be callable by anyone who happens to find the URL.
//
// NOTE: /api/push must stay in PUBLIC_API_ROUTES in middleware.ts — Postgres
// calls this with no session cookie and would otherwise be bounced to login.
// =============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { getNotificationLink } from '@/lib/notificationLinks';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE = 'https://www.aligncosmic.com';

interface RelayBody {
  user_id: string;
  notification_id?: string | null;
  title: string;
  body?: string | null;
  data?: Record<string, any> | null;
  type?: string | null;
}

export async function POST(request: NextRequest) {
  const secret = process.env.WEB_PUSH_RELAY_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'WEB_PUSH_RELAY_SECRET not configured' }, { status: 500 });
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 });
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:support@aligncosmic.com',
    publicKey,
    privateKey,
  );

  let payload: RelayBody;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { user_id, notification_id, title } = payload;
  if (!user_id || !title) {
    return NextResponse.json({ error: 'Missing user_id or title' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Supabase service credentials missing' }, { status: 500 });
  }
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data: subs, error: subsError } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', user_id);

  if (subsError) {
    return NextResponse.json({ error: subsError.message }, { status: 500 });
  }
  if (!subs || subs.length === 0) {
    return NextResponse.json({ status: 'ok', sent: 0 });
  }

  const type = payload.type || payload.data?.type || '';
  const link = getNotificationLink({ type, actor_id: payload.data?.actor_id, data: payload.data });
  const url = link === '#' ? '/notifications' : link;

  // One tray entry per conversation / per type, matching how the mobile side
  // collapses. Without a stable tag every message stacks up separately.
  const tag = type === 'new_message' && payload.data?.conversation_id
    ? `conv_${payload.data.conversation_id}`
    : `align_${type || 'default'}`;

  const body = JSON.stringify({
    title,
    body: payload.body || '',
    url: `${SITE}${url}`,
    tag,
    notification_id: notification_id || null,
  });

  const logRows: any[] = [];
  const staleIds: string[] = [];
  let sent = 0;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body,
        );
        sent++;
        logRows.push({
          user_id,
          notification_id: notification_id || null,
          title,
          body: payload.body || '',
          push_token: sub.endpoint,
          status: 'sent',
        });
      } catch (err: any) {
        // 404 / 410 mean the browser dropped this subscription for good —
        // the user cleared site data, uninstalled the PWA, or revoked
        // permission. Keeping it would retry forever on every notification.
        const statusCode = err?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          staleIds.push(sub.id);
        }
        logRows.push({
          user_id,
          notification_id: notification_id || null,
          title,
          body: payload.body || '',
          push_token: sub.endpoint,
          status: 'failed',
          error_message: `${statusCode || 'error'}: ${err?.body || err?.message || 'unknown'}`.slice(0, 500),
        });
      }
    }),
  );

  if (staleIds.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', staleIds);
  }

  // Same log the mobile path writes to, so the admin Tech tab counts web
  // sends alongside native ones instead of web pushes being invisible.
  if (logRows.length > 0) {
    await supabase.from('push_notification_log').insert(logRows);
  }

  return NextResponse.json({ status: 'ok', sent, failed: logRows.length - sent, pruned: staleIds.length });
}
