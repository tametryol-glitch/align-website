'use client';

import React from 'react';
import { type RadarArea } from '@/lib/radar';

/** "Hottest vs a normal day": each life area as a multiple of what an ordinary day scores. */
export default function RadarAreas({
  areas,
  activeKey,
  onPick,
}: {
  areas: RadarArea[];
  activeKey: string | null;
  onPick: (key: string | null) => void;
}) {
  if (!areas.length) return null;
  const max = Math.max(2, ...areas.map((a) => a.ratio));
  return (
    <div className="rounded-2xl border border-white/10 bg-bg-card p-5 mb-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">Hottest vs a normal day</h3>
      <p className="text-[11px] text-text-muted mb-3">
        1&times; is an ordinary day for your chart. Tap an area to see exactly what is driving it.
      </p>
      <div className="space-y-2">
        {areas.map((a) => {
          const on = activeKey === a.key;
          const hot = a.ratio >= 1.5;
          return (
            <button
              key={a.key}
              onClick={() => onPick(on ? null : a.key)}
              className={`w-full text-left rounded-lg px-2 py-1.5 transition-colors ${on ? 'bg-white/10' : 'hover:bg-white/5'}`}
              aria-pressed={on}
            >
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-text-primary truncate">{a.label}</span>
                <span className={`shrink-0 font-semibold ${hot ? 'text-amber-400' : 'text-text-secondary'}`}>
                  {a.ratio.toFixed(1)}&times;
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 mt-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (a.ratio / max) * 100)}%`,
                    background: hot ? '#F59E0B' : '#8B5CF6',
                  }}
                />
              </div>
              {on && <p className="text-[11px] text-text-muted mt-2">{a.blurb}</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
