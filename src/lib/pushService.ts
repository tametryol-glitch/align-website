import { createClient } from '@/lib/supabase';

/**
 * Check if the browser supports push notifications.
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
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
