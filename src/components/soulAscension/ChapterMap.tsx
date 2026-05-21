'use client';

/**
 * ChapterMap — visual progress map of all chapters (web).
 */

import type { ChoicePath, SoulAscensionGameState } from '@/lib/soulAscension/types';

const PATH_COLORS: Record<ChoicePath, string> = {
  comfort: '#F5A623',
  shadow: '#E05D5D',
  purpose: '#5EE6A8',
  neutral: '#A8B0C0',
  risk: '#4ECBD6',
};

interface Props {
  state: SoulAscensionGameState;
}

export default function ChapterMap({ state }: Props) {
  const chapters = state.profile.chapterMissions;
  const currentIndex = state.currentChapterIndex;
  const history = state.choiceHistory;

  return (
    <div className="rounded-lg border border-gold-primary/20 bg-[#080c12]/72 p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gold-primary">Chapter Map</p>
      <p className="mt-1 text-xs text-text-muted">Lifetime {state.lifetimeIndex} — {state.profile.lifetimeTitle}</p>

      <div className="mt-5 space-y-0">
        {chapters.map((chapter, index) => {
          const completed = index < currentIndex;
          const isCurrent = index === currentIndex;
          const locked = index > currentIndex;
          const choiceRecord = history.find((h) => h.missionId === chapter.id);
          const pathColor = choiceRecord ? PATH_COLORS[choiceRecord.path] : undefined;

          return (
            <div key={chapter.id} className="flex items-center gap-3 py-2.5 relative">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={`absolute left-[15px] -top-2.5 w-0.5 h-5 ${completed ? 'bg-emerald-400/50' : 'bg-white/10'}`}
                />
              )}

              {/* Node circle */}
              <div
                className={[
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-extrabold',
                  completed
                    ? 'text-white'
                    : isCurrent
                    ? 'border-cyan-400 bg-cyan-400/15 text-white'
                    : 'border-white/15 bg-white/5 text-text-tertiary opacity-40',
                ].join(' ')}
                style={completed ? { backgroundColor: pathColor || '#5EE6A8', borderColor: pathColor || '#5EE6A8' } : undefined}
              >
                {completed ? '✓' : chapter.chapterNumber}
              </div>

              {/* Chapter info */}
              <div className="flex-1">
                <p className={`text-sm font-semibold ${locked ? 'text-text-tertiary' : 'text-text-primary'}`}>
                  {chapter.title}
                </p>
                <p className="text-xs capitalize text-text-tertiary">
                  {completed
                    ? `Chose ${choiceRecord?.path ?? 'unknown'}`
                    : isCurrent
                    ? 'Current chapter'
                    : 'Locked'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
