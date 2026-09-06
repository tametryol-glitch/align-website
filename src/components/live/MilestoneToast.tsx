'use client';

// ═══════════════════════════════════════════════════════════════════
// Milestone celebration.
//
// Shown to everyone in the room when a viewer crosses a heart
// milestone. The point is that the person who did it sees their own
// moment AND the host sees who is carrying the energy — a milestone
// only the sender saw would be a private achievement, which defeats it.
//
// Announcements arrive as live_messages rows, so they queue in order
// with the chat around them and survive in history. This just surfaces
// the newest one for a few seconds.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import type { LiveMessage } from '@/lib/liveService';

const VISIBLE_MS = 4200;

export interface Milestone {
  id: string;
  text: string;
  /** True when the current viewer is the one who earned it. */
  mine: boolean;
}

/**
 * Watches the message list and surfaces newly arrived milestones.
 *
 * Only messages that appear *after* mount are celebrated — replaying
 * every milestone in history on join would greet a latecomer with a
 * stack of other people's confetti.
 */
export function useMilestones(messages: LiveMessage[], selfId?: string | null) {
  const [current, setCurrent] = useState<Milestone | null>(null);
  const seen = useRef<Set<string>>(new Set());
  const primed = useRef(false);

  useEffect(() => {
    const milestones = messages.filter((m) => m.kind === 'milestone');

    // First pass: record history without celebrating it.
    if (!primed.current) {
      milestones.forEach((m) => seen.current.add(m.id));
      primed.current = true;
      return;
    }

    const fresh = milestones.filter((m) => !seen.current.has(m.id));
    if (fresh.length === 0) return;
    fresh.forEach((m) => seen.current.add(m.id));

    // If several land at once, show the last — they are seconds apart
    // and queueing them would run the celebration long after the moment.
    const latest = fresh[fresh.length - 1];
    setCurrent({
      id: latest.id,
      text: latest.body,
      mine: latest.sender_id === selfId,
    });
  }, [messages, selfId]);

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => setCurrent(null), VISIBLE_MS);
    return () => clearTimeout(t);
  }, [current]);

  return current;
}

export function MilestoneToast({ milestone }: { milestone: Milestone | null }) {
  if (!milestone) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center px-6 z-30"
      role="status"
      aria-live="polite"
    >
      <style>{`
        @keyframes live-milestone-in {
          0%   { opacity: 0; transform: translateY(14px) scale(0.94); }
          14%  { opacity: 1; transform: translateY(0) scale(1); }
          82%  { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-10px) scale(0.98); }
        }
        @media (prefers-reduced-motion: reduce) {
          .live-milestone { animation: none !important; }
        }
      `}</style>

      <div
        className={`live-milestone flex items-center gap-2.5 rounded-full px-5 py-2.5 backdrop-blur
                    border shadow-lg ${
                      milestone.mine
                        ? 'bg-rose-500/25 border-rose-300/40'
                        : 'bg-black/60 border-white/15'
                    }`}
        style={{ animation: `live-milestone-in ${VISIBLE_MS}ms ease-out forwards` }}
      >
        <span className="text-lg" aria-hidden="true">
          {milestone.mine ? '🎉' : '❤️'}
        </span>
        <span className="text-sm font-medium text-white">
          {/* Second person for your own milestone: "You sent 100 hearts"
              lands harder than reading your own name back. */}
          {milestone.mine ? milestone.text.replace(/^\S+(\s\S+)*?\ssent/, 'You sent') : milestone.text}
        </span>
      </div>
    </div>
  );
}
