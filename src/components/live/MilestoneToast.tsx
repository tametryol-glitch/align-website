'use client';

// ═══════════════════════════════════════════════════════════════════
// Milestone celebration.
//
// Shown to everyone in the room when a viewer crosses a heart
// milestone: the sender gets their moment, and the host sees who is
// carrying the energy. A milestone only its sender saw would be a
// private achievement, which defeats the point.
//
// The celebration scales with the number. Ten hearts and a thousand
// looking identical makes the ladder meaningless — the whole reason to
// have thresholds is that later ones feel harder won.
//
// Kept in step with align-app/src/components/social/MilestoneToast.tsx.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import type { LiveMessage, LiveAuthor } from '@/lib/liveService';

export interface Milestone {
  id: string;
  text: string;
  /** True when the current viewer is the one who earned it. */
  mine: boolean;
  senderId: string;
  senderName: string;
  avatarUrl: string | null;
  /** The threshold crossed, for scaling the celebration. */
  value: number;
}

/** How loud a given milestone should be. */
function weightOf(value: number) {
  if (value >= 1000) return { ms: 6000, glyph: '🌟', big: true };
  if (value >= 100) return { ms: 5000, glyph: '✨', big: false };
  return { ms: 3600, glyph: '🎉', big: false };
}

// The trailing number is the threshold. Anchored to the end so a display
// name containing digits cannot be mistaken for the count.
const VALUE_RE = /(\d[\d,]*)\s+hearts?\s*$/i;

/**
 * Watches the message list and surfaces newly arrived milestones.
 *
 * Only messages that appear AFTER mount are celebrated — replaying
 * history on join would greet a latecomer with a stack of other
 * people's confetti.
 */
export function useMilestones(
  messages: LiveMessage[],
  selfId?: string | null,
  authors: Record<string, LiveAuthor> = {},
) {
  const [current, setCurrent] = useState<Milestone | null>(null);
  const seen = useRef<Set<string>>(new Set());
  const primed = useRef(false);

  useEffect(() => {
    const found = messages.filter((m) => m.kind === 'milestone');

    if (!primed.current) {
      found.forEach((m) => seen.current.add(m.id));
      primed.current = true;
      return;
    }

    const fresh = found.filter((m) => !seen.current.has(m.id));
    if (fresh.length === 0) return;
    fresh.forEach((m) => seen.current.add(m.id));

    // Several landing at once are seconds apart; queueing them would run
    // the celebration long after the moment passed.
    const latest = fresh[fresh.length - 1];
    const value = Number((VALUE_RE.exec(latest.body)?.[1] || '0').replace(/,/g, ''));

    setCurrent({
      id: latest.id,
      text: latest.body,
      mine: latest.sender_id === selfId,
      senderId: latest.sender_id,
      senderName:
        latest.profile?.display_name || authors[latest.sender_id]?.display_name || 'Someone',
      avatarUrl:
        latest.profile?.avatar_url || authors[latest.sender_id]?.avatar_url || null,
      value,
    });
  }, [messages, selfId, authors]);

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => setCurrent(null), weightOf(current.value).ms);
    return () => clearTimeout(t);
  }, [current]);

  return current;
}

export function MilestoneToast({
  milestone,
  onThank,
}: {
  milestone: Milestone | null;
  /** Host only: one tap to thank the person by name. */
  onThank?: (m: Milestone) => void;
}) {
  if (!milestone) return null;

  const { ms, glyph, big } = weightOf(milestone.value);
  const thankable = !!onThank && !milestone.mine;

  // Second person for your own: "You sent 100 hearts" lands harder than
  // reading your own name back at you.
  const label = milestone.mine
    ? milestone.text.replace(/^.*?\ssent/, 'You sent')
    : milestone.text;

  const inner = (
    <div
      className={`live-milestone flex items-center gap-3 rounded-full backdrop-blur border shadow-lg ${
        big ? 'px-6 py-3.5 border-2' : 'px-5 py-2.5'
      } ${
        milestone.mine
          ? 'bg-rose-500/30 border-rose-300/50'
          : 'bg-black/65 border-white/20'
      }`}
      style={{ animation: `live-milestone-in ${ms}ms ease-out forwards` }}
    >
      {milestone.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={milestone.avatarUrl}
          alt=""
          className="w-7 h-7 rounded-full object-cover shrink-0"
        />
      ) : (
        <span className="text-lg shrink-0" aria-hidden="true">
          {glyph}
        </span>
      )}

      <span className="min-w-0">
        <span className={`block font-semibold text-white ${big ? 'text-base' : 'text-sm'}`}>
          {label}
        </span>
        {thankable && (
          <span className="block text-[11px] text-white/55">Click to thank them</span>
        )}
      </span>

      {milestone.avatarUrl && (
        <span className="text-lg shrink-0" aria-hidden="true">
          {glyph}
        </span>
      )}
    </div>
  );

  return (
    <div
      className={`absolute inset-x-0 top-1/3 flex justify-center px-6 z-30 ${
        thankable ? '' : 'pointer-events-none'
      }`}
      role="status"
      aria-live="polite"
    >
      <style>{`
        @keyframes live-milestone-in {
          0%   { opacity: 0; transform: translateY(16px) scale(0.93); }
          8%   { opacity: 1; transform: translateY(0) scale(1); }
          88%  { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-10px) scale(0.98); }
        }
        @media (prefers-reduced-motion: reduce) {
          .live-milestone { animation: none !important; }
        }
      `}</style>

      {thankable ? (
        <button onClick={() => onThank!(milestone)} className="focus:outline-none">
          {inner}
        </button>
      ) : (
        inner
      )}
    </div>
  );
}
