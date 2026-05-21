'use client';

/**
 * SoulTypeCard — displays the "Your Soul Type" result with share button (web).
 */

import type { SoulTypeResult } from '@/lib/soulAscension/soulTypeEngine';

const PATH_COLORS: Record<string, string> = {
  comfort: '#F5A623',
  shadow: '#E05D5D',
  purpose: '#5EE6A8',
  neutral: '#A8B0C0',
  risk: '#4ECBD6',
};

interface Props {
  result: SoulTypeResult;
}

export default function SoulTypeCard({ result }: Props) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: result.shareText });
      } catch {}
    } else {
      await navigator.clipboard.writeText(result.shareText);
    }
  };

  return (
    <div className="rounded-xl border border-gold-primary/30 bg-[#080c12]/85 p-6 text-center">
      <p className="text-5xl">{result.emoji}</p>
      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-gold-primary">Your Soul Type</p>
      <h2 className="mt-1 font-display text-3xl font-bold text-text-primary">{result.title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-text-secondary">{result.description}</p>

      <div className="mx-auto mt-5 max-w-sm space-y-2">
        {Object.entries(result.pathBreakdown)
          .filter(([, pct]) => pct > 0)
          .sort(([, a], [, b]) => b - a)
          .map(([path, pct]) => (
            <div key={path} className="flex items-center gap-2">
              <span className="w-16 text-right text-xs font-bold capitalize text-text-tertiary">{path}</span>
              <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: PATH_COLORS[path] || '#A8B0C0' }}
                />
              </div>
              <span className="w-8 text-xs text-text-tertiary">{pct}%</span>
            </div>
          ))}
      </div>

      <button
        type="button"
        onClick={handleShare}
        className="mt-6 inline-flex items-center gap-2 rounded-md border border-emerald-400/40 bg-emerald-400/15 px-6 py-3 text-sm font-bold text-emerald-400 transition hover:bg-emerald-400/25"
      >
        Share Your Soul Type
      </button>
    </div>
  );
}
