'use client';

/**
 * ChapterTitleCard — full-screen chapter intro overlay (web).
 * Fades in, holds, then auto-dismisses (or tap to skip).
 */

import { useEffect, useRef, useState } from 'react';
import { CHAPTER_ACCENT } from './vnSceneBackgrounds';
import type { ChapterMission } from '@/lib/soulAscension/types';

interface Props {
  mission: ChapterMission;
  totalChapters: number;
  onDismiss: () => void;
  holdDuration?: number;
}

export default function ChapterTitleCard({
  mission,
  totalChapters,
  onDismiss,
  holdDuration = 3200,
}: Props) {
  const [state, setState] = useState<'entering' | 'visible' | 'exiting'>('entering');
  const dismissed = useRef(false);
  const accent = CHAPTER_ACCENT[mission.chapterType] ?? '#F0C15C';

  useEffect(() => {
    dismissed.current = false;
    setState('entering');

    const enterTimer = setTimeout(() => setState('visible'), 50);
    const exitTimer = setTimeout(() => dismiss(), holdDuration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [mission.id, holdDuration]);

  const dismiss = () => {
    if (dismissed.current) return;
    dismissed.current = true;
    setState('exiting');
    setTimeout(onDismiss, 500);
  };

  return (
    <div
      className={[
        'fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-[#050510] transition-opacity duration-500',
        state === 'entering' ? 'opacity-0' : state === 'exiting' ? 'opacity-0' : 'opacity-100',
      ].join(' ')}
      onClick={dismiss}
    >
      <p
        className={[
          'text-xs font-black uppercase tracking-[0.35em] transition-all duration-700',
          state === 'visible' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        ].join(' ')}
        style={{ color: accent }}
      >
        CHAPTER {mission.chapterNumber}
      </p>

      <div
        className={[
          'my-5 h-0.5 rounded-full transition-all duration-700 delay-200',
          state === 'visible' ? 'w-24 opacity-100 sm:w-32' : 'w-0 opacity-0',
        ].join(' ')}
        style={{ backgroundColor: accent }}
      />

      <h1
        className={[
          'max-w-lg text-center font-display text-4xl font-bold text-text-primary transition-all duration-700 delay-100 sm:text-5xl',
          state === 'visible' ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',
        ].join(' ')}
      >
        {mission.title}
      </h1>

      <p
        className={[
          'mt-3 text-sm font-semibold tracking-wider text-text-muted transition-all duration-700 delay-300',
          state === 'visible' ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        ].join(' ')}
      >
        {mission.chapterNumber} of {totalChapters}
      </p>

      <p className="absolute bottom-10 text-xs tracking-wider text-white/20">
        Click to continue
      </p>
    </div>
  );
}
