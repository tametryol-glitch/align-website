/**
 * karmaFlashbackScheduler — schedules karma flashback notifications
 * for the web version using the browser Notification API.
 *
 * Uses setTimeout for scheduling (active tab only — browser notifications
 * require a Service Worker for background delivery, which can be added later).
 * Falls back gracefully when notifications are not permitted.
 */

import {
  generateKarmaFlashbacks,
  type KarmaFlashback,
} from './karmaFlashbackNotifications';
import type { SoulProfile, ScoreState } from './types';

const LAST_SESSION_KEY = 'soul_ascension_last_session';
const SCHEDULED_TIMERS_KEY = '_soulFlashbackTimers';

// Store timer IDs so we can cancel them
let scheduledTimers: ReturnType<typeof setTimeout>[] = [];

/**
 * Record that the player opened a Soul Ascension session.
 */
export function recordSoulSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_SESSION_KEY, new Date().toISOString());
  cancelScheduledFlashbacks();
}

/**
 * Request notification permission from the browser.
 * Returns true if granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
}

/**
 * Schedule karma flashback notifications using browser Notification API.
 * Notifications will only fire while the tab is open.
 */
export async function scheduleKarmaFlashbacks(
  profile: SoulProfile,
  scores: ScoreState,
): Promise<number> {
  if (typeof window === 'undefined') return 0;

  // Cancel existing timers
  cancelScheduledFlashbacks();

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return 0;

  const flashbacks = generateKarmaFlashbacks(profile, scores);
  if (flashbacks.length === 0) return 0;

  let count = 0;

  for (const fb of flashbacks) {
    const delayMs = fb.triggerAfterHours * 60 * 60 * 1000;

    const timer = setTimeout(() => {
      try {
        new Notification(fb.title, {
          body: fb.body,
          icon: '/icons/soul-ascension-icon.png',
          tag: `soul-flashback-${fb.id}`,
        });
      } catch {
        // Silent fail
      }
    }, delayMs);

    scheduledTimers.push(timer);
    count++;
  }

  return count;
}

/**
 * Cancel all pending flashback notification timers.
 */
export function cancelScheduledFlashbacks(): void {
  for (const timer of scheduledTimers) {
    clearTimeout(timer);
  }
  scheduledTimers = [];
}

/**
 * Get hours since last Soul Ascension session.
 */
export function getHoursSinceLastSession(): number {
  if (typeof window === 'undefined') return Infinity;
  const raw = localStorage.getItem(LAST_SESSION_KEY);
  if (!raw) return Infinity;
  const lastSession = new Date(raw);
  const now = new Date();
  return (now.getTime() - lastSession.getTime()) / (1000 * 60 * 60);
}
