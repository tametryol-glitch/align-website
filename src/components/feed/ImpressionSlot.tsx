'use client';

import { useEffect, useRef } from 'react';
import { trackPostImpression } from '@/lib/impressionService';

/**
 * Records a feed impression once a post has actually been looked at.
 *
 * "Shown" means at least half the card was on screen for DWELL_MS. A fast
 * flick-scroll past a post does not count — that is the same qualified
 * impression definition the large platforms use, and it matters because the
 * ranker demotes posts by seen-count. Counting flick-scrolls would bury
 * posts nobody actually read.
 *
 * Wraps the card rather than living inside FeedCard so the same card
 * component can be reused on surfaces (profile, bookmarks) where seen-state
 * should not be recorded.
 */

/** How long at least half the card must stay on screen to count. */
const DWELL_MS = 1000;

/** Fraction of the card that must be visible. */
const VISIBLE_RATIO = 0.5;

interface ImpressionSlotProps {
  postId: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function ImpressionSlot({ postId, children, className, id }: ImpressionSlotProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    let dwellTimer: ReturnType<typeof setTimeout> | null = null;
    const cancel = () => {
      if (dwellTimer) {
        clearTimeout(dwellTimer);
        dwellTimer = null;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          if (!dwellTimer) {
            dwellTimer = setTimeout(() => {
              dwellTimer = null;
              trackPostImpression(postId);
            }, DWELL_MS);
          }
        } else {
          cancel();
        }
      },
      { threshold: VISIBLE_RATIO },
    );

    observer.observe(el);
    return () => {
      cancel();
      observer.disconnect();
    };
  }, [postId]);

  return (
    <div ref={ref} className={className} id={id}>
      {children}
    </div>
  );
}
