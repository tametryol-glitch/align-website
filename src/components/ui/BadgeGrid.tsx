'use client';

import { useState } from 'react';
import { BADGES } from '@/lib/gamificationService';
import type { EarnedBadge } from '@/stores/gamificationStore';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  earnedBadges: EarnedBadge[];
  className?: string;
}

export function BadgeGrid({ earnedBadges, className }: Props) {
  const [expanded, setExpanded] = useState(false);

  const allBadgeIds = Object.keys(BADGES);
  const earnedSet = new Set(earnedBadges.map((b) => b.badgeId));

  return (
    <div className={cn('card overflow-hidden', className)}>
      {/* Header — clickable to expand/collapse */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-bg-card-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🏅</span>
          <span className="text-sm font-semibold text-text-primary">
            Badges
          </span>
          <span className="text-xs text-text-muted">
            {earnedBadges.length}/{allBadgeIds.length}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-text-muted" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-muted" />
        )}
      </button>

      {/* Badge grid */}
      {expanded && (
        <div className="px-4 pb-4 pt-1">
          <div className="grid grid-cols-5 gap-3">
            {allBadgeIds.map((badgeId) => {
              const badge = BADGES[badgeId];
              const isEarned = earnedSet.has(badgeId);

              return (
                <div
                  key={badgeId}
                  className="flex flex-col items-center gap-1 group relative"
                  title={`${badge.name}: ${badge.description}`}
                >
                  {/* Icon circle */}
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300',
                      isEarned
                        ? 'bg-gradient-to-br from-purple-600/20 to-amber-500/20 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/10'
                        : 'bg-bg-tertiary opacity-40 grayscale'
                    )}
                  >
                    {isEarned ? badge.icon : '?'}
                  </div>

                  {/* Name */}
                  <span
                    className={cn(
                      'text-[10px] text-center leading-tight max-w-[60px]',
                      isEarned ? 'text-text-secondary' : 'text-text-muted'
                    )}
                  >
                    {isEarned ? badge.name : '???'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
