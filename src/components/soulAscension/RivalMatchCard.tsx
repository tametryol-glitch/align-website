'use client';

/**
 * RivalMatchCard — rival match status + chapter comparison (web).
 */

import type { RivalMatch, SoulRival } from '@/lib/soulAscension/soulRivalsEngine';

interface Props {
  rival: SoulRival | null;
  match: RivalMatch | null;
  onFindRival: () => void;
}

export default function RivalMatchCard({ rival, match, onFindRival }: Props) {
  if (!rival || !match) {
    return (
      <div className="mb-4 rounded-lg border border-cyan-400/25 bg-cyan-400/[0.05] p-4">
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-cyan-400">Soul Rivals</span>
        <h4 className="mt-2 text-sm font-bold text-text-primary">No Active Rival</h4>
        <p className="mt-1 text-sm leading-6 text-text-secondary">
          Challenge a rival with the opposite soul type. Compete chapter-by-chapter to see who makes bolder choices.
        </p>
        <button
          type="button"
          onClick={onFindRival}
          className="mt-3 w-full rounded border border-cyan-400/40 bg-cyan-400/15 py-2.5 text-sm font-bold text-cyan-400 transition hover:bg-cyan-400/25"
        >
          Find a Rival
        </button>
      </div>
    );
  }

  const challengerWins = match.chapterResults.filter(r => r.chapterWinner === 'challenger').length;
  const defenderWins = match.chapterResults.filter(r => r.chapterWinner === 'defender').length;

  return (
    <div className="mb-4 rounded-lg border border-cyan-400/25 bg-cyan-400/[0.05] p-4">
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-cyan-400">Soul Rivals — Active Match</span>
      <div className="my-3 flex items-center justify-center gap-4">
        <div className="flex-1 text-center">
          <p className="text-sm font-bold text-text-primary">You</p>
          <p className="text-xs font-bold text-emerald-400">{challengerWins} wins</p>
        </div>
        <span className="text-xl font-black text-red-400">VS</span>
        <div className="flex-1 text-center">
          <p className="text-sm font-bold text-text-primary">{rival.displayName}</p>
          <p className="text-xs font-bold text-emerald-400">{defenderWins} wins</p>
        </div>
      </div>
      <p className="text-center text-xs text-text-muted">
        {match.status === 'active'
          ? `Chapter ${match.currentComparisonChapter} of ${match.totalChapters}`
          : `Match ${match.status}`}
      </p>
    </div>
  );
}
