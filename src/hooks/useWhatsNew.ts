'use client';

import { useState, useEffect } from 'react';
import { getLatestWhatsNew, CURRENT_VERSION, type WhatsNewEntry } from '@/lib/whatsNew';

const STORAGE_KEY = 'align_whats_new_last_seen';

export function useWhatsNew() {
  const [entry, setEntry] = useState<WhatsNewEntry | null>(null);

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY);

    if (!lastSeen) {
      // First visit — silently write current version, don't show modal
      localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
      return;
    }

    if (lastSeen !== CURRENT_VERSION) {
      // Version changed — show what's new
      const latest = getLatestWhatsNew();
      if (latest) {
        setEntry(latest);
      }
    }
  }, []);

  const markSeen = () => {
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
    setEntry(null);
  };

  return { entry, markSeen };
}
