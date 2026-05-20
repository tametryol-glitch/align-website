'use client';

/**
 * ScoreHUD — compact floating score display for the web VN mode.
 * Translucent bar at the top showing the 4 core scores.
 */

import type { ScoreState } from '@/lib/soulAscension/types';

interface Props {
  scores: ScoreState;
  chapterLabel?: string;
}

interface BarConfig {
  key: keyof ScoreState;
  label: string;
  color: string;
}

const BARS: BarConfig[] = [
  { key: 'karma', label: 'KRM', color: '#F0C15C' },
  { key: 'purpose', label: 'PUR', color: '#5EE6A8' },
  { key: 'shadow', label: 'SHD', color: '#E05D5D' },
  { key: 'giftMastery', label: 'GFT', color: '#4ECBD6' },
];

export default function ScoreHUD({ scores, chapterLabel }: Props) {
  return (
    <div className="animate-in slide-in-from-top-3 fade-in duration-500 border-b border-white/[0.06] bg-[rgba(6,6,14,0.75)] px-4 py-2 backdrop-blur-sm sm:px-6">
      {chapterLabel && (
        <p className="mb-1.5 text-center text-[10px] font-black uppercase tracking-[0.18em] text-gold-primary">
          {chapterLabel}
        </p>
      )}
      <div className="flex gap-2 sm:gap-3">
        {BARS.map((bar) => {
          const value = scores[bar.key];
          const pct = Math.max(4, Math.min(100, value));
          return (
            <div key={bar.key} className="flex-1">
              <div className="mb-0.5 flex items-center justify-between">
                <span
                  className="text-[9px] font-black tracking-wider"
                  style={{ color: bar.color }}
                >
                  {bar.label}
                </span>
                <span className="text-[9px] font-bold text-text-muted">{value}</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: bar.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
