'use client';

/**
 * LeaderboardPanel — ranked player list with real-time updates (web).
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import {
  fetchLeaderboard,
  subscribeToLeaderboard,
  type LeaderboardRow,
} from '@/lib/soulAscension';

export default function LeaderboardPanel() {
  const profile = useAuthStore((s) => s.profile);
  const userId = profile?.id ?? '';
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let alive = true;
    const sb = createClient();

    fetchLeaderboard(sb, userId)
      .then((data) => { if (alive) setRows(data); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });

    const sub = subscribeToLeaderboard(sb, userId, (data) => {
      if (alive) setRows(data);
    });

    return () => { alive = false; sub.unsubscribe(); };
  }, [userId]);

  if (!userId) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-sm text-text-muted">Sign in to see the leaderboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-gold-primary border-r-transparent border-b-transparent border-l-transparent" />
        <p className="text-sm text-text-muted">Summoning the ranks...</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-sm text-text-muted">No players ranked yet. Complete a mission to claim your spot!</p>
      </div>
    );
  }

  const topRows = rows.filter((r) => r.rank <= 50);
  const selfOutside = rows.find((r) => r.is_self && r.rank > 50);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="overflow-hidden rounded-lg border border-teal-300/20 bg-[#071012]/85">
      <div className="px-5 pt-5 pb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gold-primary">Leaderboard</p>
        <p className="mt-1 text-xs text-text-muted">Ranked by composite score (karma + purpose + gift − shadow)</p>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {topRows.map((row) => (
          <div
            key={row.user_id}
            className={[
              'flex items-center gap-3 px-5 py-3 transition',
              row.is_self
                ? 'bg-teal-300/[0.08] border-l-2 border-l-teal-300/50'
                : 'hover:bg-white/[0.02]',
            ].join(' ')}
          >
            {/* Rank */}
            <div className="w-8 shrink-0 text-center">
              {row.rank <= 3 ? (
                <span className="text-lg">{medals[row.rank - 1]}</span>
              ) : (
                <span className="text-sm font-bold text-text-tertiary">{row.rank}</span>
              )}
            </div>

            {/* Avatar */}
            <Link href={`/user/${row.user_id}`} className="h-9 w-9 shrink-0 overflow-hidden rounded-full cursor-pointer">
              {row.avatar_url ? (
                <img src={row.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/[0.08] text-sm font-bold text-text-secondary">
                  {(row.avatar_name || row.display_name || '?').charAt(0).toUpperCase()}
                </div>
              )}
            </Link>

            {/* Name */}
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-semibold ${row.is_self ? 'text-teal-300' : 'text-text-primary'}`}>
                {row.avatar_name || row.display_name || 'Soul Traveler'}
              </p>
              <p className="text-[10px] text-text-tertiary">
                Lv {row.ascension_level} · Life {row.lifetime_index}
              </p>
            </div>

            {/* Score */}
            <div className="text-right">
              <p className={`text-base font-extrabold ${row.is_self ? 'text-teal-300' : 'text-gold-primary'}`}>
                {row.composite_score}
              </p>
              <p className="text-[9px] tracking-wide text-text-tertiary">
                K{row.karma} P{row.purpose} S{row.shadow} G{row.gift_mastery}
              </p>
            </div>
          </div>
        ))}

        {selfOutside && (
          <>
            <div className="flex items-center justify-center py-2">
              <span className="text-xs tracking-[4px] text-text-tertiary">···</span>
            </div>
            <div className="flex items-center gap-3 border-l-2 border-l-teal-300/50 bg-teal-300/[0.08] px-5 py-3">
              <div className="w-8 shrink-0 text-center text-sm font-bold text-text-tertiary">
                {selfOutside.rank}
              </div>
              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full">
                {selfOutside.avatar_url ? (
                  <img src={selfOutside.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/[0.08] text-sm font-bold text-text-secondary">
                    {(selfOutside.avatar_name || selfOutside.display_name || '?').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-teal-300">
                  {selfOutside.avatar_name || selfOutside.display_name || 'Soul Traveler'}
                </p>
                <p className="text-[10px] text-text-tertiary">
                  Lv {selfOutside.ascension_level} · Life {selfOutside.lifetime_index}
                </p>
              </div>
              <div className="text-right">
                <p className="text-base font-extrabold text-teal-300">{selfOutside.composite_score}</p>
                <p className="text-[9px] tracking-wide text-text-tertiary">
                  K{selfOutside.karma} P{selfOutside.purpose} S{selfOutside.shadow} G{selfOutside.gift_mastery}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
