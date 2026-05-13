'use client';

import { useState } from 'react';
import type { HourSegment, PlanetName } from '@/lib/planetaryHours';
import { PLANET_DATA } from '@/lib/planetaryHours';

// ── Category definitions ──

interface Category {
  key: string;
  label: string;
  color: string;
  rulers: PlanetName[];
}

const CATEGORIES: Category[] = [
  { key: 'money',         label: 'Best for Money & Love',   color: '#F472B6', rulers: ['Venus', 'Jupiter'] },
  { key: 'action',        label: 'Best for Action',         color: '#EF4444', rulers: ['Mars', 'Sun'] },
  { key: 'communication', label: 'Best for Communication',  color: '#6EE7B7', rulers: ['Mercury'] },
  { key: 'devotion',      label: 'Best for Sacred Focus',   color: '#FB923C', rulers: ['Vesta'] },
  { key: 'partnership',   label: 'Best for Partnerships',   color: '#E879F9', rulers: ['Juno'] },
  { key: 'caution',       label: 'Caution Hours (Saturn)',  color: '#9CA3AF', rulers: ['Saturn'] },
];

// ── Props ──

interface DaySummaryProps {
  dayHours: HourSegment[];
  nightHours: HourSegment[];
  isToday: boolean;
}

// ── Time formatter ──

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// ── SummaryRow sub-component ──

interface SummaryRowProps {
  category: Category;
  matchingHours: HourSegment[];
  expanded: boolean;
  onToggle: () => void;
}

function SummaryRow({ category, matchingHours, expanded, onToggle }: SummaryRowProps) {
  const glyph = PLANET_DATA[category.rulers[0]]?.glyph ?? '';

  return (
    <div className="py-3 border-b border-border-primary last:border-0">
      {/* Collapsed header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center w-full gap-2 text-left cursor-pointer"
      >
        <span className="text-lg w-7 text-center" style={{ color: category.color }}>
          {glyph}
        </span>
        <span className="text-sm font-medium text-text-primary flex-1">
          {category.label}
        </span>
        <span
          className="text-xs font-semibold rounded-full px-2 py-0.5"
          style={{
            color: category.color,
            backgroundColor: `${category.color}26`,
          }}
        >
          {matchingHours.length}
        </span>
        <span className="text-text-muted text-xs ml-1">
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {/* Expanded time list */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: expanded ? `${matchingHours.length * 32 + 16}px` : '0px',
          opacity: expanded ? 1 : 0,
        }}
      >
        <div className="pl-8 pt-2 space-y-1">
          {matchingHours.map((hour, i) => {
            const planetData = PLANET_DATA[hour.ruler];
            const periodLabel = hour.period === 'day' ? 'Day' : 'Night';
            return (
              <p key={i} className="text-text-secondary text-sm">
                {'•'} {formatTime(hour.start)} {'–'} {formatTime(hour.end)}{' '}
                <span style={{ color: planetData?.color }}>
                  ({hour.ruler}, {periodLabel})
                </span>
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── DaySummary component ──

export default function DaySummary({ dayHours, nightHours, isToday }: DaySummaryProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const allHours = [...dayHours, ...nightHours];

  const toggleRow = (key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="bg-bg-secondary rounded-2xl p-5 border border-border-primary">
      <h3 className="text-lg font-semibold text-text-primary mb-1">
        {isToday ? 'Today at a Glance' : 'This Day at a Glance'}
      </h3>
      <p className="text-text-muted text-sm mb-4">
        Tap a category to reveal the best times for planning
      </p>

      {CATEGORIES.map((cat) => {
        const matching = allHours.filter((h) =>
          cat.rulers.includes(h.ruler)
        );
        if (matching.length === 0) return null;

        return (
          <SummaryRow
            key={cat.key}
            category={cat}
            matchingHours={matching}
            expanded={expandedRows.has(cat.key)}
            onToggle={() => toggleRow(cat.key)}
          />
        );
      })}
    </div>
  );
}
