'use client';

// ═══════════════════════════════════════════════════════════════════
// Top gifters — the gift-side companion to top hearters.
//
// Same transient treatment as the hearters strip: it shows itself,
// then gets out of the way. Two permanent leaderboards parked over the
// video would leave the host with less picture than furniture.
//
// Positioned on the opposite side so the two can never overlap when
// both happen to surface at once.
//
// Kept in step with align-app/src/components/social/TopGifters.tsx.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import { getTopGifters, type TopGifter } from '@/lib/coinService';

const VISIBLE_MS = 6000;

export function TopGifters({
  sessionId,
  onPressGifter,
  variant = 'overlay',
  limit = variant === 'summary' ? 5 : 3,
}: {
  sessionId: string | null;
  /** Host clicks someone to thank them by name. */
  onPressGifter?: (g: TopGifter) => void;
  variant?: 'overlay' | 'summary';
  limit?: number;
}) {
  const [rows, setRows] = useState<TopGifter[]>([]);
  const [visible, setVisible] = useState(variant === 'summary');
  const [pulse, setPulse] = useState(0);
  const totals = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    const load = async () => {
      const found = (await getTopGifters(sessionId, limit)).filter((r) => r.coins > 0);
      if (cancelled) return;

      // Any change at all is worth surfacing: gifts are rarer than
      // hearts, so each one is news on its own.
      const changed = found.some((r) => (totals.current.get(r.sender_id) ?? 0) !== r.coins);
      found.forEach((r) => totals.current.set(r.sender_id, r.coins));

      setRows(found);
      if (changed) setPulse((p) => p + 1);
    };

    load();
    const id = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [sessionId, limit]);

  useEffect(() => {
    if (variant !== 'overlay' || pulse === 0) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), VISIBLE_MS);
    return () => clearTimeout(t);
  }, [variant, pulse]);

  if (rows.length === 0) return null;

  const list = rows.map((r, i) => {
    const label = r.display_name || 'Someone';
    const body = (
      <>
        <span className="w-3 text-[10px] text-white/40 text-center tabular-nums">{i + 1}</span>
        {r.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
        ) : (
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[9px] text-white">
            {label.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="text-xs text-white truncate max-w-[7rem]">{label}</span>
        <span className="text-[11px] shrink-0" aria-hidden="true">
          🎁
        </span>
        <span className="text-xs text-amber-200/85 tabular-nums">{r.coins}</span>
      </>
    );

    const cls =
      'flex items-center gap-1.5 bg-black/45 backdrop-blur rounded-full pl-1.5 pr-2.5 py-1';

    return onPressGifter ? (
      <button
        key={r.sender_id}
        onClick={() => onPressGifter(r)}
        className={`${cls} hover:bg-black/65 transition-colors`}
        title={`Thank ${label}`}
      >
        {body}
      </button>
    ) : (
      <div key={r.sender_id} className={cls}>
        {body}
      </div>
    );
  });

  if (variant === 'summary') {
    return (
      <div className="flex flex-col gap-1.5 items-center">
        <span className="text-xs uppercase tracking-wide text-white/40">Top gifters</span>
        {list}
      </div>
    );
  }

  return (
    <div
      className={`absolute top-28 right-4 z-20 flex flex-col items-end gap-1.5 transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!visible}
    >
      {list}
    </div>
  );
}
