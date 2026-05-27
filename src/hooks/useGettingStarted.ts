'use client';

/**
 * useGettingStarted
 *
 * Manages the "Getting Started" checklist state for new users.
 * Persists completed item IDs and dismissed state in localStorage (local cache)
 * and syncs to Supabase for cross-platform parity.
 *
 * Strategy:
 *   - localStorage is the instant local cache (no loading spinner).
 *   - On mount, fetch remote state from Supabase and merge (union) with local.
 *   - On markComplete / dismiss, update local state immediately (optimistic),
 *     then upsert to Supabase in the background.
 *   - Unauthenticated users fall back to local-only storage.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Read completed IDs from localStorage. Returns empty array on failure. */
function readLocalProgress(): string[] {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch { /* corrupted or missing */ }
  return [];
}

/** Read dismissed flag from localStorage. */
function readLocalDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === 'true';
  } catch { return false; }
}

/** Persist completed IDs to localStorage. */
function saveLocalProgress(ids: string[]): void {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(ids)); } catch {}
}

/** Persist dismissed flag to localStorage. */
function saveLocalDismissed(dismissed: boolean): void {
  try { localStorage.setItem(DISMISSED_KEY, String(dismissed)); } catch {}
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGettingStarted() {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [isDismissed, setIsDismissed] = useState(true); // Start true to avoid flash

  const supabase = useMemo(() => createClient(), []);
  const userId = useAuthStore((s) => s.user?.id) as string | undefined;

  // Track latest values for async callbacks without stale closures.
  const completedRef = useRef(completedIds);
  completedRef.current = completedIds;
  const dismissedRef = useRef(isDismissed);
  dismissedRef.current = isDismissed;

  /** Upsert checklist progress to Supabase (fire-and-forget). */
  const syncToSupabase = useCallback(
    (items: string[], dismissed: boolean) => {
      if (!userId) return;
      supabase
        .from('user_checklist_progress')
        .upsert(
          {
            user_id: userId,
            completed_items: items,
            dismissed,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        )
        .then(() => {})
        .catch(() => {});
    },
    [supabase, userId],
  );

  // -----------------------------------------------------------------------
  // Load: local first, then merge with remote
  // -----------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    // 1. Load from localStorage immediately
    const localIds = readLocalProgress();
    const localDismissed = readLocalDismissed();
    setCompletedIds(localIds);
    setIsDismissed(localDismissed);

    // 2. If authenticated, merge with Supabase
    if (!userId) return;

    (async () => {
      try {
        const { data } = await supabase
          .from('user_checklist_progress')
          .select('completed_items, dismissed')
          .eq('user_id', userId)
          .single();

        if (cancelled) return;

        if (data) {
          const remoteItems = (data.completed_items ?? []) as string[];
          const remoteDismissed = data.dismissed ?? false;

          // Union of local + remote completed items
          const merged = [...new Set([...localIds, ...remoteItems])];
          const mergedDismissed = localDismissed || remoteDismissed;

          setCompletedIds(merged);
          setIsDismissed(mergedDismissed);

          // Persist merged state locally
          saveLocalProgress(merged);
          saveLocalDismissed(mergedDismissed);

          // Push merged state back to Supabase if it differs from remote
          const needsSync =
            merged.length !== remoteItems.length ||
            mergedDismissed !== remoteDismissed;

          if (needsSync) {
            syncToSupabase(merged, mergedDismissed);
          }
        } else {
          // No remote row yet — push local state up
          if (localIds.length > 0 || localDismissed) {
            syncToSupabase(localIds, localDismissed);
          }
        }
      } catch {
        // Supabase unavailable — local state is fine
      }
    })();

    return () => { cancelled = true; };
  }, [userId, supabase, syncToSupabase]);

  // -----------------------------------------------------------------------
  // markComplete
  // -----------------------------------------------------------------------
  const markComplete = useCallback((id: string) => {
    setCompletedIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];

      // Persist locally
      saveLocalProgress(next);

      // Sync to Supabase
      syncToSupabase(next, dismissedRef.current);

      return next;
    });
  }, [syncToSupabase]);

  // -----------------------------------------------------------------------
  // dismiss
  // -----------------------------------------------------------------------
  const dismiss = useCallback(() => {
    setIsDismissed(true);

    // Persist locally
    saveLocalDismissed(true);

    // Sync to Supabase
    syncToSupabase(completedRef.current, true);
  }, [syncToSupabase]);

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
