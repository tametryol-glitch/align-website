'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ChecklistItem {
  id: string;
  labelKey: string;
  icon: string;
  route: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'read_horoscope', labelKey: 'gettingStarted.readHoroscope', icon: '✨', route: '/your-day' },
  { id: 'try_reading', labelKey: 'gettingStarted.tryReading', icon: '🔮', route: '/readings' },
  { id: 'view_natal', labelKey: 'gettingStarted.viewNatal', icon: '☉', route: '/chart' },
  { id: 'share_feed', labelKey: 'gettingStarted.shareFeed', icon: '🌍', route: '/feed' },
  { id: 'complete_profile', labelKey: 'gettingStarted.completeProfile', icon: '👤', route: '/profile/edit' },
];

const PROGRESS_KEY = 'align_checklist_progress_v1';
const DISMISSED_KEY = 'align_checklist_dismissed_v1';

export function useGettingStarted() {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [isDismissed, setIsDismissed] = useState(true); // Start true to avoid flash

  useEffect(() => {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (stored) {
      try {
        setCompletedIds(JSON.parse(stored));
      } catch {
        setCompletedIds([]);
      }
    }
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    setIsDismissed(dismissed === 'true');
  }, []);

  const markComplete = useCallback((id: string) => {
    setCompletedIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    localStorage.setItem(DISMISSED_KEY, 'true');
  }, []);

  const items = CHECKLIST_ITEMS;
  const completedCount = completedIds.length;
  const totalCount = items.length;
  const isAllDone = completedCount >= totalCount;

  return {
    items,
    completedIds,
    completedCount,
    totalCount,
    isAllDone,
    isDismissed,
    markComplete,
    dismiss,
  };
}
