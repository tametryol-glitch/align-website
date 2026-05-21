'use client';

/**
 * DailyChallengeCard — shows today's soul challenge with completion state (web).
 */

import { useEffect, useState } from 'react';
import type { SoulAscensionGameState } from '@/lib/soulAscension/types';
import {
  completeDailyChallenge,
  generateDailyChallenge,
  getTodayDateString,
  initDailyChallengeState,
  type DailyChallenge,
  type DailyChallengeState,
} from '@/lib/soulAscension/dailyChallengeEngine';

const PATH_COLORS: Record<string, string> = {
  comfort: '#F5A623',
  shadow: '#E05D5D',
  purpose: '#5EE6A8',
  neutral: '#A8B0C0',
  risk: '#4ECBD6',
};

const STORAGE_KEY = 'soul_ascension:daily_challenge_state';

interface Props {
  state: SoulAscensionGameState;
  onXpEarned: (xp: number) => void;
}

export default function DailyChallengeCard({ state, onXpEarned }: Props) {
  const [challengeState, setChallengeState] = useState<DailyChallengeState>(initDailyChallengeState);
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as DailyChallengeState;
        if (saved.lastCompletedDate !== getTodayDateString()) {
          saved.completedToday = false;
        }
        setChallengeState(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (state) {
      setChallenge(generateDailyChallenge(state));
    }
  }, [state.chart.signature]);

  const handleComplete = () => {
    if (!challenge || challengeState.completedToday) return;
    const next = completeDailyChallenge(challengeState, challenge);
    setChallengeState(next);
    onXpEarned(challenge.xpReward);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  if (!challenge) return null;

  const done = challengeState.completedToday;
  const color = PATH_COLORS[challenge.path] || PATH_COLORS.neutral;

  return (
    <div className={`rounded-lg border p-4 ${done ? 'border-emerald-400/30 bg-emerald-400/[0.06]' : 'border-gold-primary/25 bg-black/30'}`}>
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gold-primary">Daily Soul Challenge</span>
        {challengeState.streak > 0 && (
          <span className="ml-auto text-xs font-bold text-amber-400">🔥 {challengeState.streak} day streak</span>
        )}
      </div>
      <h4 className="text-sm font-bold text-text-primary">{challenge.title}</h4>
      <p className="mt-1 text-sm leading-6 text-text-secondary">{challenge.description}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs font-bold text-cyan-400">+{challenge.xpReward} Soul XP</span>
        {done ? (
          <span className="rounded bg-emerald-400/15 px-3 py-1.5 text-xs font-bold text-emerald-400">Completed ✓</span>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            className="rounded border border-emerald-400/40 bg-emerald-400/15 px-4 py-1.5 text-xs font-bold text-emerald-400 transition hover:bg-emerald-400/25"
          >
            Mark Complete
          </button>
        )}
      </div>
    </div>
  );
}
