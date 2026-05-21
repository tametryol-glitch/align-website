'use client';

/**
 * AnimatedScoreDelta — count-up/down number animation with color flash (web).
 *
 * Shows each score metric animating from `before` → `after` with:
 * - Smooth number interpolation via requestAnimationFrame
 * - Green flash for positive changes, red flash for negative
 */

import { useEffect, useRef, useState } from 'react';
import type { ScoreState } from '@/lib/soulAscension/types';

interface Props {
  before: ScoreState;
  after: ScoreState;
}

interface MetricDef {
  key: keyof ScoreState;
  label: string;
  color: string;
}

const METRICS: MetricDef[] = [
  { key: 'karma', label: 'Karma', color: '#BDE4DC' },
  { key: 'purpose', label: 'Purpose', color: '#5EE6A8' },
  { key: 'shadow', label: 'Shadow', color: '#E05D5D' },
  { key: 'giftMastery', label: 'Gift', color: '#4ECBD6' },
];

function AnimatedNumber({
  from,
  to,
  color,
  delay,
}: {
  from: number;
  to: number;
  color: string;
  delay: number;
}) {
  const [display, setDisplay] = useState(from);
  const [flashing, setFlashing] = useState(false);
  const delta = to - from;

  useEffect(() => {
    let raf: number;
    const timer = setTimeout(() => {
      const start = performance.now();
      const duration = 600;

      if (delta !== 0) setFlashing(true);

      const tick = (now: number) => {
        const elapsed = now - start;
        const t = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(Math.round(from + (to - from) * eased));
        if (t < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          setTimeout(() => setFlashing(false), 400);
        }
      };
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [from, to, delay]);

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors duration-400',
        flashing && delta > 0 ? 'bg-emerald-500/20' : '',
        flashing && delta < 0 ? 'bg-red-500/20' : '',
      ].join(' ')}
    >
      <span className="text-base font-extrabold tabular-nums" style={{ color }}>
        {display}
      </span>
      {delta !== 0 && (
        <span
          className="text-[11px] font-extrabold animate-in fade-in duration-300"
          style={{ color: delta > 0 ? '#5EE6A8' : '#E05D5D' }}
        >
          {delta > 0 ? `+${delta}` : `${delta}`}
        </span>
      )}
    </span>
  );
}

export default function AnimatedScoreDelta({ before, after }: Props) {
  return (
    <div className="rounded-md bg-white/[0.06] px-3 py-2.5 space-y-1.5">
      {METRICS.map((m, i) => {
        const bVal = before[m.key] as number;
        const aVal = after[m.key] as number;
        return (
          <div key={m.key} className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-tertiary w-16">{m.label}</span>
            <AnimatedNumber from={bVal} to={aVal} color={m.color} delay={i * 150} />
          </div>
        );
      })}
    </div>
  );
}
