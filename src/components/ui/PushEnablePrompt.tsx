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
//   3. iPhone/iPad in a Safari tab → there is no prompt to reach at all;
//      window.PushManager does not exist until Align is on the Home Screen.
//      Those users get instructions rather than a button that cannot work.
//
// Anyone who wants out uses the same Settings → Notifications toggle as
// before; this only handles getting them switched on in the first place.
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Share, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
  isPushSupported,
  getPermissionStatus,
  needsIosInstallForPush,
  ensurePushSubscribed,
  registerPushSubscription,
} from '@/lib/pushService';
import { PUSH_MOMENT_EVENT } from '@/lib/pushMoments';

const SNOOZE_KEY = 'align_push_prompt_snooze';   // timestamp of the last "Not now"
const DECLINE_KEY = 'align_push_prompt_declines'; // how many times they've said it

// Set once per browser, the first time an iOS user loads the app after the
// missing-manifest fix. Value records whether they had already been told to
// add Align to their Home Screen back when doing so silently could not work:
//   'readd' → they followed broken instructions and own a dead bookmark
//   'fresh' → never asked before, the normal install copy is correct
const IOS_FIX_KEY = 'align_push_ios_fix_v1';

const SNOOZE_DAYS = 7;
const MAX_DECLINES = 3;    // after this we stop asking and leave it to Settings
const MOMENT_MS = 1_500;   // let their action finish landing before we ask
const FALLBACK_MS = 90_000; // only for people who never hit a real moment
const READD_MS = 8_000;    // the re-add correction is owed to them, not sold

export function PushEnablePrompt() {
  const { user } = useAuthStore();
  // 'ask'  → we can reach the browser prompt
  // 'ios'  → iPhone/iPad that must add Align to the Home Screen first
  const [mode, setMode] = useState<'ask' | 'ios' | null>(null);
  const [iosReadd, setIosReadd] = useState(false);
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

  // ── 1b. One-time amnesty for iPhone users we sent on a fool's errand ──────
  // Until the web app manifest landed, "Add to Home Screen" on iOS produced a
  // Safari bookmark, not a web app — so anyone who followed our instructions
  // got nothing and had no way to know why. Those users are identifiable: on
  // iOS the only card that can ever have shown is the install one, so a
  // non-zero decline count means they were told, and it did not work.
  //
  // They are also exactly the users most likely to have dismissed it three
  // times and silenced themselves for good, so the decline budget is reset
  // once — the corrected message deserves one clean shot at them.
  useEffect(() => {
    if (!needsIosInstallForPush()) return;
    try {
      const existing = localStorage.getItem(IOS_FIX_KEY);
      if (existing) {
        setIosReadd(existing === 'readd');
        return;
      }
      const toldBefore = Number(localStorage.getItem(DECLINE_KEY) || 0) > 0;
      localStorage.setItem(IOS_FIX_KEY, toldBefore ? 'readd' : 'fresh');
      if (toldBefore) {
        localStorage.removeItem(SNOOZE_KEY);
        localStorage.setItem(DECLINE_KEY, '0');
        setIosReadd(true);
      }
    } catch {
      // localStorage unavailable — fall back to the normal install copy
    }
  }, []);

  // ── 2. Soft ask: permission never requested ───────────────────────────────
  // Re-checked at fire time, not once on mount: permission and the snooze can
  // both change between page load and the moment we actually want to ask.
  function eligible(): boolean {
    if (!user?.id || suppressed) return false;
    if (!isPushSupported() || getPermissionStatus() !== 'default') return false;
    try {
      if (Number(localStorage.getItem(DECLINE_KEY) || 0) >= MAX_DECLINES) return false;
      const snoozedUntil = Number(localStorage.getItem(SNOOZE_KEY) || 0);
      if (snoozedUntil && Date.now() < snoozedUntil) return false;
    } catch {
      return false; // localStorage unavailable (private mode) — don't nag
    }
    return true;
  }

  // Same snooze and decline budget, different obstacle: on iOS there is no
  // browser prompt to reach until they install us, so the card explains that
  // instead of offering a button that cannot work.
  function eligibleIos(): boolean {
    if (!user?.id || suppressed) return false;
    if (!needsIosInstallForPush()) return false;
    try {
      if (Number(localStorage.getItem(DECLINE_KEY) || 0) >= MAX_DECLINES) return false;
      const snoozedUntil = Number(localStorage.getItem(SNOOZE_KEY) || 0);
      if (snoozedUntil && Date.now() < snoozedUntil) return false;
    } catch {
      return false;
    }
    return true;
  }

  useEffect(() => {
    const next: 'ask' | 'ios' | null = eligible() ? 'ask' : eligibleIos() ? 'ios' : null;
    if (!next) return;

    let momentTimer: ReturnType<typeof setTimeout> | undefined;

    // Someone who never hits one of those moments should still be asked once,
    // but late enough that it does not interrupt what they came to do.
    // Read straight from storage rather than the iosReadd state, which the
    // amnesty effect may not have flushed into a render yet.
    let readd = false;
    try { readd = localStorage.getItem(IOS_FIX_KEY) === 'readd'; } catch { /* default */ }

    const fallback = setTimeout(() => {
      if (next === 'ask' ? eligible() : eligibleIos()) setMode(next);
    }, next === 'ios' && readd ? READD_MS : FALLBACK_MS);

    // The moment that actually earns the question: they just messaged someone
    // or accepted a friend request, so wanting to hear back is self-evident.
    const onMoment = () => {
      if (!(next === 'ask' ? eligible() : eligibleIos())) return;
      clearTimeout(fallback);
      momentTimer = setTimeout(() => setMode(next), MOMENT_MS);
    };
    window.addEventListener(PUSH_MOMENT_EVENT, onMoment);

    return () => {
      window.removeEventListener(PUSH_MOMENT_EVENT, onMoment);
      clearTimeout(fallback);
      if (momentTimer) clearTimeout(momentTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, suppressed]);

  async function enable() {
    if (!user?.id) return;
    setBusy(true);
    // Called straight from the click, which is what makes the browser prompt
    // legal in Safari and Firefox.
    const ok = await registerPushSubscription(user.id);
    setBusy(false);
    setMode(null);
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
    setMode(null);
  }

  if (!mode) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 md:bottom-6 z-[60] px-4 pointer-events-none">
      <div className="card mx-auto max-w-md pointer-events-auto shadow-xl border border-white/10">
        <div className="flex items-start gap-3 px-1 py-2">
          {mode === 'ios' ? (
            <Share className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
          ) : (
            <Bell className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            {mode === 'ios' ? (
              <>
                {iosReadd ? (
                  <>
                    <p className="text-sm font-medium text-text-primary">
                      Sorry — please add Align again
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      A bug on our side meant adding Align to your Home Screen didn&apos;t
                      actually enable notifications, even if you followed the steps exactly.
                      It&apos;s fixed now. Please{' '}
                      <span className="text-text-primary">delete the Align icon</span> you
                      already have (press and hold → Remove), then in Safari tap{' '}
                      <span className="text-text-primary">Share</span> →{' '}
                      <span className="text-text-primary">Add to Home Screen</span> again.
                      Open Align from the new icon and notifications will work.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-text-primary">
                      Add Align to your Home Screen
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      iPhone and iPad only deliver notifications to apps on the Home Screen.
                      Tap <span className="text-text-primary">Share</span>, choose{' '}
                      <span className="text-text-primary">Add to Home Screen</span>, then open
                      Align from that icon to turn notifications on. Safari is the most
                      reliable — other iPhone browsers all run on Safari underneath, so none
                      of them can do this from a normal tab.
                    </p>
                  </>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={notNow}
                    className="px-4 py-2 text-sm rounded-lg bg-accent-primary hover:bg-accent-primary/80 text-white font-medium transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
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
