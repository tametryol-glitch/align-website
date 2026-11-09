'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { type RadarArea, fmtDate } from '@/lib/radar';

const LEVEL_STYLE: Record<string, string> = {
  'Very hot': '#EF4444',
  Hot: '#F59E0B',
  Warm: '#FBBF24',
  Normal: '#8B5CF6',
  Cool: '#6B7280',
  Quiet: '#4B5563',
};

const SHOWN_BY_DEFAULT = 8;

/**
 * "Hottest vs a normal day": every life area, as a multiple of what an ordinary day scores,
 * how many transits are hitting it, and a full explanation when you open one.
 */
export default function RadarAreas({
  areas,
  activeKey,
  onPick,
  onOpenHit,
}: {
  areas: RadarArea[];
  activeKey: string | null;
  onPick: (key: string | null) => void;
  onOpenHit: (id: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  if (!areas.length) return null;
  const max = Math.max(2, ...areas.map((a) => a.ratio));
  const live = areas.filter((a) => a.count > 0).length;
  const list = showAll ? areas : areas.slice(0, SHOWN_BY_DEFAULT);

  return (
    <div className="rounded-2xl border border-white/10 bg-bg-card p-5 mb-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">Hottest vs a normal day</h3>
      <p className="text-[11px] text-text-muted mb-3 leading-relaxed">
        1&times; is an ordinary day for your chart. {live} of {areas.length} life areas are being hit right now. Tap any area for what it means,
        what is driving it and what to do.
      </p>

      <div className="space-y-1.5">
        {list.map((a) => {
          const on = activeKey === a.key;
          const col = LEVEL_STYLE[a.level] || '#8B5CF6';
          return (
            <div key={a.key} className={`rounded-xl transition-colors ${on ? 'bg-white/[0.07]' : ''}`}>
              <button
                onClick={() => onPick(on ? null : a.key)}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5"
                aria-expanded={on}
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-text-primary truncate flex-1">{a.label}</span>
                  <span
                    className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ color: col, background: col + '22' }}
                  >
                    {a.level}
                  </span>
                  <span className="shrink-0 text-[11px] text-text-muted w-14 text-right">
                    {a.count === 0 ? 'no hits' : `${a.count} ${a.count === 1 ? 'hit' : 'hits'}`}
                  </span>
                  <span className="shrink-0 font-semibold w-10 text-right" style={{ color: a.count ? col : undefined }}>
                    {a.count ? `${a.ratio.toFixed(1)}×` : '—'}
                  </span>
                  <ChevronDown className={`w-4 h-4 shrink-0 text-text-muted transition-transform ${on ? 'rotate-180' : ''}`} />
                </div>
                <div className="h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${a.count ? Math.min(100, (a.ratio / max) * 100) : 0}%`, background: col }} />
                </div>
              </button>

              {on && (
                <div className="px-3 pb-4 pt-1 space-y-3">
                  <p className="text-sm text-text-primary leading-relaxed">{a.summary}</p>
                  {a.next_peak && (
                    <p className="text-[11px] text-text-muted">
                      Next big moment for this area: <span className="text-text-secondary">{a.next_peak.title}</span>, {fmtDate(a.next_peak.date)}.
                    </p>
                  )}
                  {a.timeline && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2">
                        Heat over the next {a.timeline.weeks.length} weeks
                      </p>
                      <div className="flex items-end gap-[3px] h-14" role="img" aria-label="Weekly heat for this area">
                        {a.timeline.weeks.map((r, i) => {
                          const top = Math.max(1.5, ...a.timeline!.weeks);
                          const peak = i === a.timeline!.peak.week;
                          return (
                            <div
                              key={i}
                              className="flex-1 rounded-sm"
                              title={`Week ${i + 1}: ${r.toFixed(1)}\u00d7 its usual`}
                              style={{ height: `${Math.max(6, (r / top) * 100)}%`, background: peak ? '#F59E0B' : r >= 1.2 ? '#8B5CF6' : 'rgba(255,255,255,0.18)' }}
                            />
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-[10px] text-text-muted mt-1">
                        <span>now</span>
                        <span>{fmtDate(a.timeline.start)} + {a.timeline.weeks.length} weeks</span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-1.5">
                        Peaks {fmtDate(a.timeline.peak.from)} to {fmtDate(a.timeline.peak.to)}, at {a.timeline.peak.ratio.toFixed(1)}&times; its usual week.
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">What this area is</p>
                    <p className="text-sm text-text-secondary leading-relaxed">{a.what}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                      {a.count ? 'What it means when it runs hot' : 'What it looks like when it heats up'}
                    </p>
                    <p className="text-sm text-text-secondary leading-relaxed">{a.hot}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">Your move</p>
                    <p className="text-sm text-text-secondary leading-relaxed">{a.move}</p>
                  </div>
                  {a.drivers.length > 0 ? (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        What is driving it ({a.count} {a.count === 1 ? 'hit' : 'hits'})
                      </p>
                      <div className="space-y-1">
                        {a.drivers.map((d) => (
                          <button
                            key={d.id}
                            onClick={() => onOpenHit(d.id)}
                            className="w-full flex items-center justify-between gap-3 text-left rounded-lg px-3 py-2 bg-white/5 hover:bg-white/10 text-sm"
                          >
                            <span className="text-text-primary truncate">{d.title}</span>
                            <span className="shrink-0 text-[11px] text-text-muted">
                              {d.orb != null ? `${d.orb.toFixed(2)}°` : ''}
                              {d.exact ? ` · ${fmtDate(d.exact)}` : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-text-muted mt-2">The list below is now filtered to these hits.</p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-text-muted">Nothing is hitting this area right now, so there is nothing to filter.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {areas.length > SHOWN_BY_DEFAULT && (
        <button onClick={() => setShowAll((v) => !v)} className="w-full mt-3 text-xs text-accent-primary font-semibold py-2">
          {showAll ? 'Show only the hottest' : `Show all ${areas.length} areas`}
        </button>
      )}
    </div>
  );
}
