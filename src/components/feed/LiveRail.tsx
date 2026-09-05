'use client';

// ═══════════════════════════════════════════════════════════════════
// Live rail — horizontal strip of who is broadcasting right now.
//
// Renders nothing at all when nobody is live, so the feed looks exactly
// as it does today until a stream actually starts. That matters: this
// sits above the composer on every feed load.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Radio, Users } from 'lucide-react';
import { listActiveLiveSessions, type LiveSession } from '@/lib/liveService';

export function LiveRail() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const rows = await listActiveLiveSessions(20);
        if (!cancelled) setSessions(rows);
      } catch {
        // A failed rail must never take the feed down with it.
        if (!cancelled) setSessions([]);
      }
    };

    load();
    // Cheap poll rather than a realtime subscription: the rail is a
    // glance, and a socket per feed load is a lot of connections for
    // information that is fine being 30 seconds stale.
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (sessions.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <Radio className="w-3.5 h-3.5 text-red-500" />
        <span className="text-xs font-semibold tracking-wide uppercase text-red-500">
          Live now
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {sessions.map((s) => (
          <Link
            key={s.id}
            href={`/live/${s.id}`}
            className="shrink-0 w-36 group"
          >
            <div
              className="relative w-36 h-24 rounded-lg overflow-hidden bg-neutral-900
                         ring-1 ring-red-500/40 group-hover:ring-red-500 transition"
            >
              {s.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.cover_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-900/40 to-neutral-900" />
              )}

              <span
                className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-red-600
                           rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white"
              >
                <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                LIVE
              </span>

              <span
                className="absolute bottom-1.5 right-1.5 flex items-center gap-1 bg-black/60
                           rounded px-1.5 py-0.5 text-[10px] text-white tabular-nums"
              >
                <Users className="w-2.5 h-2.5" />
                {s.peak_viewers}
              </span>
            </div>

            <p className="mt-1.5 text-xs text-neutral-700 dark:text-neutral-300 line-clamp-2 leading-snug">
              {s.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
