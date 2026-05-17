'use client';

import { cn } from '@/lib/utils';

interface Props {
  level: number;
  totalXP: number;
  progress: number;        // 0-100
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  className?: string;
}

export function XPProgressBar({ level, totalXP, progress, xpInCurrentLevel, xpForNextLevel, className }: Props) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-3">
        {/* Level badge */}
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <span className="text-sm font-bold text-white">{level}</span>
        </div>

        {/* Bar + labels */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-text-secondary">Level {level}</span>
            <span className="text-xs text-text-muted">{totalXP.toLocaleString()} XP</span>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 w-full bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 transition-all duration-700"
              style={{ width: `${clamped}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-text-muted">{xpInCurrentLevel} / {xpForNextLevel} XP to next level</span>
            <span className="text-[10px] text-text-muted">{Math.round(clamped)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
