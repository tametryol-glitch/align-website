'use client';

import { useState } from 'react';
import { useStreakStore } from '@/stores/streakStore';
import { useAuthStore } from '@/stores/authStore';

export function StreakBadge() {
  const { user } = useAuthStore();
  const { currentStreak, longestStreak, checkedInToday, loading, performCheckIn } = useStreakStore();
  const [celebrating, setCelebrating] = useState(false);

  const handleCheckIn = async () => {
    if (checkedInToday || !user || loading) return;
    await performCheckIn(user.id);
    // Trigger celebration animation
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 1200);
  };

  return (
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
  );
}
