'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, BellRing, Share } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
  isPushSupported,
  getPermissionStatus,
  needsIosInstallForPush,
  registerPushSubscription,
  unregisterPush,
} from '@/lib/pushService';

export function PushNotificationToggle() {
  const { user } = useAuthStore();
  const [supported, setSupported] = useState(false);
  const [iosInstall, setIosInstall] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isSupported = isPushSupported();
    setSupported(isSupported);
    setIosInstall(needsIosInstallForPush());
    if (isSupported) {
      const status = getPermissionStatus();
      setPermission(status);
      if (status === 'granted') {
        // Check if there's an active subscription
        navigator.serviceWorker.getRegistration('/sw.js').then(reg => {
          if (reg) {
            reg.pushManager.getSubscription().then(sub => {
              setEnabled(!!sub);
            });
          }
        });
      }
    }
  }, []);

  const handleEnable = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const success = await registerPushSubscription(user.id);
    if (success) {
      setEnabled(true);
      setPermission('granted');
    } else {
      // Re-check permission in case it was denied
      setPermission(getPermissionStatus());
    }
    setLoading(false);
  }, [user]);

  const handleDisable = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    await unregisterPush(user.id);
    setEnabled(false);
    setLoading(false);
  }, [user]);

  // iPhone/iPad can receive push, but only once Align is on the Home Screen.
  // Saying "not supported" here would be misleading — they are one Share-sheet
  // away from it working.
  if (iosInstall) {
    return (
      <div className="card">
        <div className="flex items-start gap-3 px-1 py-2">
          <Share className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">Push Notifications</p>
            <p className="text-xs text-text-muted mt-0.5">
              On iPhone and iPad, notifications work once Align is added to your Home
              Screen. Tap <span className="text-text-primary">Share</span>, then{' '}
              <span className="text-text-primary">Add to Home Screen</span> — open Align from
              that icon and you can turn notifications on here. Safari is the most reliable;
              switching to another iPhone browser will not help, as they all run on Safari
              underneath.
            </p>
            <p className="text-xs text-text-muted mt-2">
              Already added Align to your Home Screen and still got nothing? That was a bug
              on our side, now fixed — delete that icon and add it again for it to take
              effect.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!supported) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 px-1 py-2">
          <BellOff className="w-5 h-5 text-text-muted shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">Push Notifications</p>
            <p className="text-xs text-text-muted mt-0.5">
              Not supported in this browser
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="card">
        <div className="flex items-center gap-3 px-1 py-2">
          <BellOff className="w-5 h-5 text-red-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">Push Notifications</p>
            <p className="text-xs text-red-400 mt-0.5">
              Blocked in browser settings. Please allow notifications for this site in your browser to enable push alerts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (permission === 'default' || (permission === 'granted' && !enabled)) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 px-1 py-2">
          <Bell className="w-5 h-5 text-accent-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">Push Notifications</p>
            <p className="text-xs text-text-muted mt-0.5">
              Get notified about transits, messages, and cosmic events even when the app is closed
            </p>
          </div>
          <button
            onClick={handleEnable}
            disabled={loading || !user}
            className="px-4 py-2 text-sm rounded-lg bg-accent-primary hover:bg-accent-primary/80 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? 'Enabling...' : 'Enable'}
          </button>
        </div>
      </div>
    );
  }

  // permission === 'granted' && enabled
  return (
    <div className="card">
      <div className="flex items-center gap-3 px-1 py-2">
        <BellRing className="w-5 h-5 text-green-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">Push Notifications</p>
          <p className="text-xs text-green-400 mt-0.5">Enabled — you'll receive alerts in this browser</p>
        </div>
        <button
          onClick={handleDisable}
          disabled={loading}
          className="px-4 py-2 text-sm rounded-lg border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors disabled:opacity-50 shrink-0"
        >
          {loading ? 'Disabling...' : 'Disable'}
        </button>
      </div>
    </div>
  );
}
