'use client';

// ═══════════════════════════════════════════════════════════════════
// Top hearters — who is carrying the room.
//
// A host otherwise sees only an anonymous total. Naming the people
// behind it is what hosts actually respond to on a live stream, and it
// is what turns a counter into a relationship.
//
// Renders nothing until someone has actually sent hearts, so a quiet
// stream shows no empty scaffolding.
//
// Kept in step with align-app/src/components/social/TopHearters.tsx.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { getTopHearters, type TopHearter } from '@/lib/liveService';

export function TopHearters({
  sessionId,
  onPressHearter,
}: {
  sessionId: string | null;
  /** Host clicks someone to thank them by name. */
  onPressHearter?: (h: TopHearter) => void;
}) {
  const [rows, setRows] = useState<TopHearter[]>([]);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    const load = async () => {
      const found = await getTopHearters(sessionId, 3);
      if (!cancelled) setRows(found.filter((r) => r.count > 0));
    };

    load();
    // Slow poll: a glance, not a scoreboard that needs to be
    // frame-accurate, and it runs for the whole broadcast.
    const id = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [sessionId]);

  if (rows.length === 0) return null;

  return (
    <div className="absolute top-16 left-4 z-20 flex flex-col gap-1.5">
      {rows.map((r, i) => {
        const label = r.display_name || 'Someone';
        const body = (
          <>
            <span className="w-3 text-[10px] text-white/40 text-center tabular-nums">
              {i + 1}
            </span>
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
      })}
    </div>
  );
}
