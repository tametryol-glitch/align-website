'use client';

// ═══════════════════════════════════════════════════════════════════
// Top hearters — who is carrying the room.
//
// A host otherwise sees only an anonymous total. Naming the people
// behind it is what hosts actually respond to on a live stream, and it
// is what turns a counter into a relationship.
//
// Two shapes:
//   overlay — a moment, not furniture. It shows itself, then gets out
//             of the way, and comes back only when someone crosses a
//             milestone. Permanently parked over the video, it stopped
//             being news and started being clutter.
//   summary — the post-stream recap, where the whole point is to sit
//             still and be read.
//
// Kept in step with align-app/src/components/social/TopHearters.tsx.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { getTopHearters, type TopHearter } from '@/lib/liveService';

/** Mirrors public.live_heart_milestones() — keep the two in step. */
const MILESTONES = [10, 50, 100, 250, 500, 1000, 2500, 5000];

const VISIBLE_MS = 6000;

function crossedMilestone(prev: number, next: number) {
  return MILESTONES.some((t) => prev < t && next >= t);
}

export function TopHearters({
  sessionId,
  onPressHearter,
  variant = 'overlay',
  limit = variant === 'summary' ? 5 : 3,
}: {
  sessionId: string | null;
  /** Host clicks someone to thank them by name. */
  onPressHearter?: (h: TopHearter) => void;
  variant?: 'overlay' | 'summary';
  limit?: number;
}) {
  const [rows, setRows] = useState<TopHearter[]>([]);
  const [visible, setVisible] = useState(variant === 'summary');
  // Bumped whenever the strip has earned another moment on screen.
  const [pulse, setPulse] = useState(0);
  const counts = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    const load = async () => {
      const found = (await getTopHearters(sessionId, limit)).filter((r) => r.count > 0);
      if (cancelled) return;

      const firstData = counts.current.size === 0 && found.length > 0;
      const milestone = found.some((r) =>
        crossedMilestone(counts.current.get(r.viewer_id) ?? 0, r.count),
      );
      found.forEach((r) => counts.current.set(r.viewer_id, r.count));

      setRows(found);
      if (firstData || milestone) setPulse((p) => p + 1);
    };

    load();
    // Slow poll: a glance, not a scoreboard that needs to be
    // frame-accurate, and it runs for the whole broadcast.
    const id = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [sessionId, limit]);

  useEffect(() => {
    if (variant !== 'overlay') return;
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
        <Heart className="w-2.5 h-2.5 text-rose-400 shrink-0" fill="currentColor" />
        <span className="text-xs text-white/75 tabular-nums">{r.count}</span>
      </>
    );

    const cls =
      'flex items-center gap-1.5 bg-black/45 backdrop-blur rounded-full pl-1.5 pr-2.5 py-1';

    return onPressHearter ? (
      <button
        key={r.viewer_id}
        onClick={() => onPressHearter(r)}
        className={`${cls} hover:bg-black/65 transition-colors`}
        title={`Thank ${label}`}
      >
        {body}
      </button>
    ) : (
      <div key={r.viewer_id} className={cls}>
        {body}
      </div>
    );
  });

  if (variant === 'summary') {
    return (
      <div className="flex flex-col gap-1.5 items-center">
        <span className="text-xs uppercase tracking-wide text-white/40">Top hearters</span>
        {list}
      </div>
    );
  }

  return (
    <div
      // top-28 keeps it clear of the notice banner at top-16, which used
      // to render straight through this strip.
      className={`absolute top-28 left-4 z-20 flex flex-col gap-1.5 transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!visible}
    >
      {list}
    </div>
  );
}
