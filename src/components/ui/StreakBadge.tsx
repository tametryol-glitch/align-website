'use client';

import { useState } from 'react';
import { useStreakStore } from '@/stores/streakStore';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from 'react-i18next';
import { shareCard } from '@/lib/shareCardUtils';

// Streak lengths worth a moment of their own.
const MILESTONES = [3, 7, 14, 30, 60, 100, 365];

export function StreakBadge() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { currentStreak, longestStreak, checkedInToday, loading, performCheckIn, recovery, performRecovery } =
    useStreakStore();
  const [celebrating, setCelebrating] = useState(false);
  const [milestone, setMilestone] = useState<number | null>(null);
  const canRecover = recovery.recoverable && recovery.can_recover;

  const handleRecover = async () => {
    if (!user || loading) return;
    const ok = window.confirm(
      `${t('streakRecovery.title', { count: recovery.lost_streak })}

${t('streakRecovery.body', { days: recovery.days_left ?? 1 })}`,
    );
    if (!ok) return;
    if (await performRecovery(user.id)) {
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 1200);
    } else {
      window.alert(`${t('streakRecovery.failTitle')}. ${t('streakRecovery.failBody')}`);
    }
  };

  const handleCheckIn = async () => {
    if (checkedInToday || !user || loading) return;
    await performCheckIn(user.id);
    // Trigger celebration animation
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 1200);
    // A milestone gets its own banner. Read the store, not the render's
    // `currentStreak`, which is still the value from before this check-in.
    const reached = useStreakStore.getState().currentStreak;
    if (MILESTONES.includes(reached)) {
      setMilestone(reached);
      setTimeout(() => setMilestone(null), 8000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
    {milestone !== null && (
      <div
        role="status"
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-[min(92vw,22rem)] rounded-2xl border border-amber-400/40 bg-bg-elevated px-4 py-3 shadow-xl text-center"
      >
        <p className="text-2xl mb-0.5">🔥</p>
        <p className="text-sm font-semibold text-text-primary">{milestone}-day streak!</p>
        <p className="text-xs text-text-secondary mt-0.5">
          {milestone} days in a row. Your chart is glad you keep showing up.
        </p>
        <div className="mt-2 flex justify-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => shareCard(
              `${milestone}-day streak on Align`,
              `I'm on a ${milestone}-day cosmic streak on Align 🔥`,
              'https://www.aligncosmic.com',
            )}
            className="font-medium text-accent-primary hover:underline"
          >
            Share
          </button>
          <button type="button" onClick={() => setMilestone(null)} className="text-text-muted hover:text-text-primary">
            Close
          </button>
        </div>
      </div>
    )}
    <button
      onClick={handleCheckIn}
      disabled={checkedInToday || loading}
      className={`
        relative flex flex-col items-center justify-center
        min-w-[64px] px-3 py-2 rounded-xl
        transition-all duration-300
        ${checkedInToday
          ? 'ring-2 ring-green-400/60 shadow-[0_0_12px_rgba(74,222,128,0.3)] bg-green-500/10'
          : 'ring-2 ring-amber-400/60 animate-pulse bg-amber-500/10 cursor-pointer hover:scale-105 active:scale-95'
        }
        ${celebrating ? 'scale-125' : ''}
      `}
    >
      {/* Sparkle overlay on celebration */}
      {celebrating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="absolute text-xs animate-ping">✨</span>
          <span className="absolute -top-1 -right-1 text-xs animate-bounce">⭐</span>
          <span className="absolute -bottom-1 -left-1 text-xs animate-bounce delay-100">💫</span>
        </div>
      )}

      {/* Fire + streak number */}
      <div className="flex items-center gap-1">
        <span className="text-lg">🔥</span>
        <span className="text-base font-bold text-text-primary">
          {currentStreak}
        </span>
      </div>

      {/* Longest streak label */}
      <span className="text-[9px] text-text-muted mt-0.5 whitespace-nowrap">
        longest: {longestStreak}d
      </span>
    </button>
    {canRecover && (
      <button
        onClick={handleRecover}
        disabled={loading}
        className="text-[10px] font-semibold text-amber-300 underline underline-offset-2 hover:text-amber-200 whitespace-nowrap"
      >
        {t('streakRecovery.link', { count: recovery.lost_streak })}
      </button>
    )}
    </div>
  );
}
