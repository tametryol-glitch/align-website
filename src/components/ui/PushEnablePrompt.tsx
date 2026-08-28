'use client';

// =============================================================================
// Notifications on by default, without burning the browser prompt
// =============================================================================
// Web push cannot be switched on for someone. Notification.requestPermission()
// must come from a user gesture, and a native prompt that gets dismissed is
// denied PERMANENTLY — the site can never ask again. So the closest thing to
// "starts enabled" is two behaviours:
//
//   1. Already granted → subscribe silently, every load, no prompt, no UI.
//      Covers new devices, cleared site data, and expired subscriptions. This
//      is the genuinely automatic half.
//   2. Not yet asked → ask ourselves first, in our own UI. "Not now" costs
//      nothing and we can ask again in a week. Only "Turn on" reaches the
//      browser prompt, and only from that click, so the one irreversible
//      answer is only ever requested from someone who just said yes to us.
//
// Anyone who wants out uses the same Settings → Notifications toggle as
// before; this only handles getting them switched on in the first place.
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
  isPushSupported,
  getPermissionStatus,
  ensurePushSubscribed,
  registerPushSubscription,
} from '@/lib/pushService';

const SNOOZE_KEY = 'align_push_prompt_snooze';   // timestamp of the last "Not now"
const DECLINE_KEY = 'align_push_prompt_declines'; // how many times they've said it

const SNOOZE_DAYS = 7;
const MAX_DECLINES = 3;   // after this we stop asking and leave it to Settings
const SETTLE_MS = 15_000; // let them actually look at the page first

export function PushEnablePrompt() {
  const { user } = useAuthStore();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const syncedFor = useRef<string | null>(null);

  const pathname = usePathname();
  // Chromeless renderers inside the mobile WebView, and the auth screens —
  // no global prompt should appear over either.
  const suppressed =
    (pathname?.startsWith('/zodisphere/embed') ||
      pathname?.startsWith('/zodisphere/globe3d/embed') ||
      pathname?.startsWith('/auth')) ?? false;

  // ── 1. Silent path: permission already granted ────────────────────────────
  useEffect(() => {
    if (!user?.id || suppressed) return;
    if (syncedFor.current === user.id) return;      // once per user per session
    if (!isPushSupported() || getPermissionStatus() !== 'granted') return;
    syncedFor.current = user.id;
    ensurePushSubscribed(user.id).catch(() => {});
  }, [user?.id, suppressed]);

  // ── 2. Soft ask: permission never requested ───────────────────────────────
  useEffect(() => {
    if (!user?.id || suppressed) return;
    if (!isPushSupported() || getPermissionStatus() !== 'default') return;

    let snoozedUntil = 0;
    let declines = 0;
    try {
      snoozedUntil = Number(localStorage.getItem(SNOOZE_KEY) || 0);
      declines = Number(localStorage.getItem(DECLINE_KEY) || 0);
    } catch {
      return; // localStorage unavailable (private mode) — don't nag
    }
    if (declines >= MAX_DECLINES) return;
    if (snoozedUntil && Date.now() < snoozedUntil) return;

    const timer = setTimeout(() => setVisible(true), SETTLE_MS);
    return () => clearTimeout(timer);
  }, [user?.id, suppressed]);

  async function enable() {
    if (!user?.id) return;
    setBusy(true);
    // Called straight from the click, which is what makes the browser prompt
    // legal in Safari and Firefox.
    const ok = await registerPushSubscription(user.id);
    setBusy(false);
    setVisible(false);
    if (!ok) {
      // Denied or failed. Don't come back — the browser prompt is spent and
      // only their browser settings can undo it now.
      try {
        localStorage.setItem(DECLINE_KEY, String(MAX_DECLINES));
      } catch {
        // ignore write failures
      }
    }
  }

  function notNow() {
    try {
      const declines = Number(localStorage.getItem(DECLINE_KEY) || 0) + 1;
      localStorage.setItem(DECLINE_KEY, String(declines));
      localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 86_400_000));
    } catch {
      // ignore write failures
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 md:bottom-6 z-[60] px-4 pointer-events-none">
      <div className="card mx-auto max-w-md pointer-events-auto shadow-xl border border-white/10">
        <div className="flex items-start gap-3 px-1 py-2">
          <Bell className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">Stay in the loop</p>
            <p className="text-xs text-text-muted mt-0.5">
              Get notified about friend requests, messages and cosmic events — even
              when Align is closed. You can turn this off any time in Settings.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={enable}
                disabled={busy}
                className="px-4 py-2 text-sm rounded-lg bg-accent-primary hover:bg-accent-primary/80 text-white font-medium transition-colors disabled:opacity-50"
              >
                {busy ? 'Turning on...' : 'Turn on'}
              </button>
              <button
                onClick={notNow}
                disabled={busy}
                className="px-3 py-2 text-sm rounded-lg text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={notNow}
            aria-label="Dismiss"
            className="text-text-muted hover:text-text-primary transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
