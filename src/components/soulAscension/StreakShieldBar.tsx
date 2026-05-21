'use client';

/**
 * StreakShieldBar — displays streak count, shield status, milestones (web).
 */

interface Props {
  streak: number;
  shieldActive: boolean;
  shieldsRemaining: number;
  onActivateShield?: () => void;
}

const MILESTONES = [3, 7, 14, 30, 60, 100];

export default function StreakShieldBar({
  streak,
  shieldActive,
  shieldsRemaining,
  onActivateShield,
}: Props) {
  const nextMilestone = MILESTONES.find((m) => m > streak) ?? 100;
  const progress = streak > 0 ? Math.min(100, (streak / nextMilestone) * 100) : 0;

  return (
    <div className="rounded-lg border border-amber-400/20 bg-white/[0.045] p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🔥</span>
          <span className="text-xl font-black text-amber-400">{streak}</span>
          <span className="text-xs font-semibold text-text-tertiary">day streak</span>
        </div>

        {shieldActive ? (
          <span className="inline-flex items-center gap-1 rounded bg-cyan-400/15 px-2.5 py-1 text-xs font-bold text-cyan-400">
            🛡️ Shield Active
          </span>
        ) : shieldsRemaining > 0 ? (
          <button
            type="button"
            onClick={onActivateShield}
            className="inline-flex items-center gap-1 rounded border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-400 transition hover:bg-cyan-400/20"
          >
            🛡️ Activate Shield ({shieldsRemaining})
          </button>
        ) : (
          <span className="text-xs text-text-tertiary">No shields</span>
        )}
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1.5 text-right text-[10px] text-text-tertiary">Next milestone: {nextMilestone} days</p>
    </div>
  );
}
