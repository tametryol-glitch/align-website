import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getMyViewBadge } from '@/lib/viewsService';

/** Fired by the Views page once it has marked everything seen. */
export const VIEWS_SEEN_EVENT = 'align:views-seen';

/**
 * New viewers since the user last opened /views. Checked on mount and when
 * the tab regains focus only — no polling loop. 0 when signed out or when
 * the views migration is not live.
 */
export function useViewBadge(): number {
  const userId = useAuthStore((s) => s.user?.id);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) { setCount(0); return; }
    let cancelled = false;
    const refresh = () => {
      getMyViewBadge().then((n) => { if (!cancelled) setCount(n); }).catch(() => {});
    };
    const clear = () => setCount(0);
    refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener(VIEWS_SEEN_EVENT, clear);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', refresh);
      window.removeEventListener(VIEWS_SEEN_EVENT, clear);
    };
  }, [userId]);

  return count;
}
