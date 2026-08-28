import { createClient } from '@/lib/supabase';

/**
 * Check if the browser supports push notifications.
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * iOS can do web push — but ONLY once the site has been added to the Home
 * Screen. In a normal Safari tab window.PushManager does not exist at all, so
 * isPushSupported() is false and the user is told "not supported in this
 * browser", which is both useless and not quite true: they are one Share-sheet
 * away from it working.
 *
 * Returns true for "this is an iPhone/iPad that could receive push if the user
 * installed us". iPadOS 13+ reports a Macintosh UA, hence the touch check.
 */
export function needsIosInstallForPush(): boolean {
  if (typeof window === 'undefined') return false;
  if (isPushSupported()) return false;   // already installed, or not iOS at all

  const ua = navigator.userAgent || '';
  const isIos =
    /iPhone|iPad|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (!isIos) return false;

  const standalone =
    (window.navigator as any).standalone === true ||
    window.matchMedia?.('(display-mode: standalone)').matches === true;
  return !standalone;
}

/**
 * Get the current notification permission status.
 */
export function getPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Register the service worker, request notification permission, subscribe to push,
 * and store the subscription in Supabase.
 */
export async function registerPushSubscription(userId: string): Promise<boolean> {
  if (!isPushSupported()) return false;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error('[PushService] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set');
      return false;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });

    const subscriptionJSON = subscription.toJSON();
    const endpoint = subscriptionJSON.endpoint!;
    const p256dh = subscriptionJSON.keys!.p256dh;
    const auth = subscriptionJSON.keys!.auth;

    const supabase = createClient();
    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: userId,
        endpoint,
        p256dh,
        auth,
      },
      { onConflict: 'user_id,endpoint' }
    );

    if (error) {
      console.error('[PushService] Failed to store subscription:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[PushService] Registration failed:', err);
    return false;
  }
}

/**
 * Subscribe WITHOUT ever prompting.
 *
 * Only does anything when the browser has already granted permission — for
 * everyone else it returns false and leaves the decision alone. That makes it
 * safe to call automatically on every load, which is the point: a user who
 * granted permission once should not have to visit Settings and press Enable
 * again on a new device, after clearing site data, or after the push service
 * expires their subscription.
 *
 * registerPushSubscription() is the opposite: it prompts, so it may only be
 * called from a user gesture.
 */
export async function ensurePushSubscribed(userId: string): Promise<boolean> {
  if (!isPushSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) return false;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // Reuse the existing subscription when there is one; permission is already
    // granted, so subscribing fresh shows no prompt either.
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });
    }

    const subscriptionJSON = subscription.toJSON();
    const endpoint = subscriptionJSON.endpoint!;

    const supabase = createClient();
    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: userId,
        endpoint,
        p256dh: subscriptionJSON.keys!.p256dh,
        auth: subscriptionJSON.keys!.auth,
      },
      { onConflict: 'user_id,endpoint' }
    );

    if (error) {
      console.error('[PushService] Failed to sync subscription:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[PushService] Silent subscribe failed:', err);
    return false;
  }
}

/**
 * Unregister push notifications and remove the subscription from Supabase.
 */
export async function unregisterPush(userId: string): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();

        const supabase = createClient();
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', userId)
          .eq('endpoint', endpoint);
      }
    }
    return true;
  } catch (err) {
    console.error('[PushService] Unregister failed:', err);
    return false;
  }
}

/**
 * Convert a base64-encoded VAPID key to a Uint8Array for the subscribe call.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
