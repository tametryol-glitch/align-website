'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { startWebPresence } from '@/lib/presenceService';

/** Keeps the signed-in person's real online / last-seen state up to date. Renders nothing. */
export function PresenceBeacon() {
  const userId = useAuthStore((s) => s.user?.id);
  useEffect(() => {
    if (!userId) return;
    return startWebPresence();
  }, [userId]);
  return null;
}
