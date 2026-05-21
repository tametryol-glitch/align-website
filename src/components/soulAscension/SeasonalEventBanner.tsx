'use client';

/**
 * SeasonalEventBanner — shows the currently active seasonal world event (web).
 */

import { getActiveEvent, type SeasonalEvent } from '@/lib/soulAscension/seasonalEventsEngine';

interface Props {
  event?: SeasonalEvent | null;
}

export default function SeasonalEventBanner({ event: eventProp }: Props) {
  const event = eventProp !== undefined ? eventProp : getActiveEvent();
  if (!event) return null;

  return (
    <div className="mb-4 rounded-lg border border-gold-primary/30 bg-gold-primary/[0.06] p-4">
      <div className="mb-2 flex items-center gap-3">
        <span className="text-3xl">{event.emoji}</span>
        <div className="flex-1">
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gold-primary">
            World Event Active
          </span>
          <h4 className="text-sm font-bold text-text-primary">{event.name}</h4>
        </div>
        <span className="rounded border border-cyan-400/40 bg-cyan-400/15 px-2.5 py-1 text-xs font-extrabold text-cyan-400">
          {event.xpMultiplier}x XP
        </span>
      </div>
      <p className="mb-2 text-sm leading-6 text-text-secondary">{event.description}</p>
      <div className="flex items-start gap-1.5">
        <span className="text-xs font-bold text-gold-primary">Special Reward:</span>
        <span className="text-xs text-text-secondary">{event.specialReward}</span>
      </div>
    </div>
  );
}
