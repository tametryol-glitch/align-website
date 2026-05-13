'use client';

import { useState } from 'react';
import type { HourSegment, PlanetName } from '@/lib/planetaryHours';
import { PLANET_DATA } from '@/lib/planetaryHours';

interface HoursTableProps {
  title: string;
  icon: string;
  hours: HourSegment[];
  durationLabel: string;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function HoursTable({ title, icon, hours, durationLabel }: HoursTableProps) {
  const [expandedHours, setExpandedHours] = useState<Set<number>>(new Set());

  const toggleHour = (hourNumber: number) => {
    setExpandedHours((prev) => {
      const next = new Set(prev);
      if (next.has(hourNumber)) {
        next.delete(hourNumber);
      } else {
        next.add(hourNumber);
      }
      return next;
    });
  };

  if (hours.length === 0) {
    return (
      <div className="bg-bg-secondary rounded-2xl border border-border-primary overflow-hidden p-6">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        </div>
        <p className="text-text-tertiary text-sm mt-3">No hours data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary rounded-2xl border border-border-primary overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-primary">
        <span className="text-lg">{icon}</span>
        <h3 className="text-lg font-semibold text-text-primary flex-1">{title}</h3>
        <span className="text-sm text-text-tertiary">{durationLabel}</span>
      </div>

      {/* Hour Rows */}
      {hours.map((hour) => {
        const planet = PLANET_DATA[hour.ruler as PlanetName];
        if (!planet) return null;

        const isExpanded = expandedHours.has(hour.hourNumber);
        const isCurrent = hour.isCurrent;
        const planetColor = planet.color;

        return (
          <div key={hour.hourNumber}>
            {/* Collapsed Row */}
            <button
              type="button"
              onClick={() => toggleHour(hour.hourNumber)}
              className={`
                w-full text-left px-4 py-3 border-b border-border-primary/50 last:border-0
                transition-all duration-200 cursor-pointer
                ${isCurrent ? 'border-l-4' : 'border-l-4 border-l-transparent'}
              `}
              style={
                isCurrent
                  ? {
                      borderLeftColor: planetColor,
                      background: `linear-gradient(135deg, ${planetColor}33, ${planetColor}11)`,
                    }
                  : undefined
              }
            >
              <div className="flex items-center gap-3">
                {/* Hour Number Badge */}
                <span className="text-xs font-semibold text-text-tertiary bg-bg-tertiary rounded-md w-6 h-6 flex items-center justify-center shrink-0">
                  {hour.hourNumber}
                </span>

                {/* Planet Glyph + Name + Quality */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xl shrink-0" style={{ color: planetColor }}>
                    {planet.glyph}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isCurrent ? 'text-text-primary font-semibold' : 'text-text-primary'}`}>
                        {hour.ruler}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                          NOW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-tertiary truncate">{planet.meaning}</p>
                  </div>
                </div>

                {/* Time Range */}
                <span className="text-sm text-text-tertiary whitespace-nowrap shrink-0">
                  {formatTime(hour.start)} - {formatTime(hour.end)}
                </span>

                {/* Expand Arrow */}
                <span className="text-xs text-text-tertiary w-4 text-center shrink-0">
                  {isExpanded ? '▲' : '▼'}
                </span>
              </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div
                className={`px-4 pb-4 pt-2 border-b border-border-primary/30 transition-all duration-200 ${
                  isCurrent ? 'border-l-4' : 'border-l-4 border-l-transparent'
                }`}
                style={
                  isCurrent
                    ? {
                        borderLeftColor: planetColor,
                        background: `linear-gradient(135deg, ${planetColor}22, ${planetColor}08)`,
                      }
                    : undefined
                }
              >
                {/* Guidance */}
                <p className="text-sm text-text-secondary italic leading-relaxed mb-3">
                  {planet.guidance}
                </p>

                {/* Best For */}
                {planet.bestFor.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-1.5">
                      Best For
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {planet.bestFor.map((item, i) => (
                        <span
                          key={i}
                          className="bg-emerald-500/15 text-emerald-400 rounded-full px-3 py-1.5 text-xs font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Avoid */}
                {planet.avoid.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-1.5">
                      Avoid
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {planet.avoid.map((item, i) => (
                        <span
                          key={i}
                          className="bg-red-500/15 text-red-400 rounded-full px-3 py-1.5 text-xs font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Badges Row */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {/* Energy Badge */}
                  {planet.energy === 'yang' ? (
                    <span className="bg-amber-500/15 text-amber-400 rounded-md px-2.5 py-1 text-xs font-medium">
                      Yang ↑
                    </span>
                  ) : planet.energy === 'yin' ? (
                    <span className="bg-purple-500/15 text-purple-400 rounded-md px-2.5 py-1 text-xs font-medium">
                      Yin ↓
                    </span>
                  ) : (
                    <span className="bg-bg-tertiary text-text-secondary rounded-md px-2.5 py-1 text-xs font-medium">
                      Neutral ~
                    </span>
                  )}

                  {/* Day Type Badge */}
                  <span className="bg-bg-tertiary text-text-secondary rounded-md px-2.5 py-1 text-xs font-medium">
                    {planet.dayType}
                  </span>

                  {/* Rules Badge */}
                  <span className="bg-bg-tertiary text-text-secondary rounded-md px-2.5 py-1 text-xs font-medium">
                    Rules {planet.sign}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
