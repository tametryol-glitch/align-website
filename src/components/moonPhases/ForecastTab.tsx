'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import {
  computeImpact,
  buildEventInterpretation,
  sortForecast,
  rangeWindowDays,
  type ImpactBand,
  type ImpactScore,
  type ImpactContribution,
  type LunarEvent,
  type EventInterpretation,
} from '@/lib/moonPhases';

// ── Types ────────────────────────────────────────────────────────────────────

interface ForecastTabProps {
  natalPositions?: any;
}

type ForecastRange = '30d' | '3m' | '6m' | '12m';
type ForecastSort = 'date' | 'impact';

interface BackendPhaseEvent {
  key: 'new' | 'first_quarter' | 'full' | 'last_quarter';
  name: string;
  date: string;
  sun_longitude: number;
  moon_longitude: number;
  moon_sign: string;
  moon_sign_degree: number;
}

interface ForecastEvent {
  phase: {
    key: string;
    name: string;
    emoji: string;
    date: Date;
    sunLon: number;
    moonLon: number;
    moonSign: string;
    moonDegreeInSign: number;
  };
  event: LunarEvent;
  impact: ImpactScore;
  interpretation: EventInterpretation;
}

// ── Constants ────────────────────────────────────────────────────────────────

const RANGE_OPTIONS: { key: ForecastRange; label: string }[] = [
  { key: '30d', label: '30 d' },
  { key: '3m', label: '3 mo' },
  { key: '6m', label: '6 mo' },
  { key: '12m', label: '12 mo' },
];

const MAJOR_PHASE_META: Record<string, { name: string; emoji: string }> = {
  new: { name: 'New Moon', emoji: '🌑' },
  first_quarter: { name: 'First Quarter', emoji: '🌓' },
  full: { name: 'Full Moon', emoji: '🌕' },
  last_quarter: { name: 'Last Quarter', emoji: '🌗' },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function bandColor(band: ImpactBand): string {
  switch (band) {
    case 'transformative': return 'purple';
    case 'high': return 'blue';
    case 'moderate': return 'teal';
    case 'low': return 'gray';
    case 'negligible': return 'gray';
  }
}

function bandChipClasses(band: ImpactBand): string {
  switch (band) {
    case 'transformative': return 'bg-purple-500/20 text-purple-400';
    case 'high': return 'bg-blue-500/20 text-blue-400';
    case 'moderate': return 'bg-teal-500/20 text-teal-400';
    case 'low': return 'bg-gray-500/20 text-gray-400';
    case 'negligible': return 'bg-gray-500/20 text-gray-400';
  }
}

function bandBorderClass(band: ImpactBand): string {
  switch (band) {
    case 'transformative': return 'border-purple-500/50';
    case 'high': return 'border-blue-500/50';
    case 'moderate': return 'border-teal-500/50';
    case 'low': return 'border-gray-500/30';
    case 'negligible': return 'border-gray-500/30';
  }
}

function bandStripeClass(band: ImpactBand): string {
  switch (band) {
    case 'transformative': return 'border-l-purple-500';
    case 'high': return 'border-l-blue-500';
    case 'moderate': return 'border-l-teal-500';
    case 'low': return 'border-l-gray-500';
    case 'negligible': return 'border-l-gray-500';
  }
}

function bandGlowClass(band: ImpactBand): string {
  switch (band) {
    case 'transformative': return 'shadow-purple-500/25 shadow-lg';
    case 'high': return 'shadow-blue-500/25 shadow-lg';
    default: return '';
  }
}

function formatFullDate(date: Date): string {
  const d = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const t = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${d} · ${t}`;
}

function getCountdown(target: Date, now: Date): string {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return 'now';
  const days = Math.floor(diff / 86400000);
  if (days >= 1) return `${days}d`;
  const hours = Math.floor(diff / 3600000);
  if (hours >= 1) return `${hours}h`;
  const minutes = Math.floor(diff / 60000);
  return `${minutes}m`;
}

function enrichPhaseEvent(
  raw: BackendPhaseEvent,
  natalPositions: any | undefined,
  now: Date,
): ForecastEvent {
  const date = new Date(raw.date);
  const meta = MAJOR_PHASE_META[raw.key] || { name: raw.name, emoji: '🌙' };
  const phase = {
    key: raw.key,
    name: meta.name,
    emoji: meta.emoji,
    date,
    sunLon: raw.sun_longitude,
    moonLon: raw.moon_longitude,
    moonSign: raw.moon_sign,
    moonDegreeInSign: raw.moon_sign_degree,
  };
  const lunarEvent: LunarEvent = {
    type: raw.key,
    date,
    sunLon: raw.sun_longitude,
    moonLon: raw.moon_longitude,
  };
  const impact = computeImpact(lunarEvent, natalPositions ?? null);
  const interpretation = buildEventInterpretation(lunarEvent, impact, raw.moon_sign);
  return { phase, event: lunarEvent, impact, interpretation };
}

function doSort(events: ForecastEvent[], by: ForecastSort): ForecastEvent[] {
  const copy = events.slice();
  if (by === 'date') {
    copy.sort((a, b) => a.phase.date.getTime() - b.phase.date.getTime());
  } else {
    copy.sort((a, b) => {
      if (b.impact.score !== a.impact.score) return b.impact.score - a.impact.score;
      return a.phase.date.getTime() - b.phase.date.getTime();
    });
  }
  return copy;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ForecastTab({ natalPositions }: ForecastTabProps) {
  const [range, setRange] = useState<ForecastRange>('3m');
  const [sort, setSort] = useState<ForecastSort>('date');
  const [now, setNow] = useState(() => new Date());
  const [events, setEvents] = useState<ForecastEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refresh countdown every 60s
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  // Fetch forecast events
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const windowDays = rangeWindowDays(range);
    const startDate = new Date().toISOString().split('T')[0];

    api.getYearAhead({ window_days: windowDays, start_date: startDate })
      .then((resp: any) => {
        if (!active) return;
        const phaseEvents: BackendPhaseEvent[] = resp.phase_events || [];
        const enriched = phaseEvents.map((raw) =>
          enrichPhaseEvent(raw, natalPositions, now)
        );
        setEvents(enriched);
        setLoading(false);
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.message || 'Failed to load forecast.');
        setLoading(false);
      });

    return () => { active = false; };
  }, [range, natalPositions]); // eslint-disable-line react-hooks/exhaustive-deps

  const sorted = useMemo(() => doSort(events, sort), [events, sort]);

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="px-4 pt-3 pb-2 space-y-3">
        {/* Range segmented control */}
        <div className="flex bg-white/[0.04] rounded-full p-1">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all ${
                range === r.key
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Sort toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setSort('date')}
            className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${
              sort === 'date'
                ? 'border-purple-500 bg-purple-500/10 text-purple-400 font-bold'
                : 'border-white/[0.08] text-gray-500 hover:text-gray-300'
            }`}
          >
            By date
          </button>
          <button
            onClick={() => setSort('impact')}
            className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${
              sort === 'impact'
                ? 'border-purple-500 bg-purple-500/10 text-purple-400 font-bold'
                : 'border-white/[0.08] text-gray-500 hover:text-gray-300'
            }`}
          >
            By impact
          </button>
        </div>
      </div>

      {/* No natal data banner */}
      {!natalPositions && (
        <div className="mx-4 mb-2 bg-purple-500/10 border border-purple-500/25 rounded-lg p-3">
          <p className="text-purple-300 text-sm text-center">
            Add your birth data in Profile to personalize scores for every event.
          </p>
        </div>
      )}

      {/* Event list */}
      <div className="flex-1 overflow-y-auto px-4 pt-1 pb-8 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center gap-2 mt-12">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading forecast...</p>
          </div>
        ) : error ? (
          <div className="mt-12 px-4">
            <p className="text-red-300 text-sm text-center">{error}</p>
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-12">
            No major lunar events in this window.
          </p>
        ) : (
          sorted.map((e, i) => (
            <ForecastCard key={e.phase.date.toISOString() + i} event={e} now={now} />
          ))
        )}
      </div>
    </div>
  );
}

// ── ForecastCard ─────────────────────────────────────────────────────────────

function ForecastCard({ event, now }: { event: ForecastEvent; now: Date }) {
  const [expanded, setExpanded] = useState(false);
  const { phase, impact, interpretation } = event;
  const band = impact.band;
  const highTier = band === 'transformative' || band === 'high';
  const countdown = getCountdown(phase.date, now);

  const natalContacts = impact.contributions.filter(
    (c) => c.kind === 'aspect' || c.kind === 'progressed'
  );

  return (
    <div
      onClick={() => setExpanded((v) => !v)}
      className={`
        relative bg-bg-secondary border border-border-primary rounded-2xl p-4 cursor-pointer
        transition-all duration-200 hover:border-white/10
        ${highTier ? `${bandGlowClass(band)} ${bandBorderClass(band)} border-l-4 ${bandStripeClass(band)}` : ''}
      `}
    >
      {/* Top row */}
      <div className="flex items-start gap-3 mb-2">
        <span className="text-3xl mt-0.5">{phase.emoji}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-bold text-sm">{phase.name}</h4>
          <p className="text-gray-400 text-xs mt-0.5">
            in {phase.moonSign} {phase.moonDegreeInSign.toFixed(1)}{'°'}
            {impact.eventHouse ? ` · House ${impact.eventHouse}` : ''}
          </p>
          <p className="text-gray-500 text-[11px] mt-0.5">
            {formatFullDate(phase.date)}
          </p>
        </div>
        {/* Score chip */}
        <div className={`flex flex-col items-center min-w-[54px] px-2 py-1.5 rounded-lg border ${bandChipClasses(band)} border-current`}>
          <span className="text-lg font-extrabold tabular-nums">{impact.score}</span>
          <span className="text-[10px] font-bold tracking-wide mt-0.5">{countdown}</span>
        </div>
      </div>

      {/* Primary + summary */}
      <p className="text-purple-300 italic text-sm mt-2">{impact.primary}</p>
      <p className="text-gray-400 text-sm leading-relaxed mt-2">{interpretation.summary}</p>

      {/* Expanded section */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
          <InterpLine label="Lean into" text={interpretation.leanInto} tone="good" />
          <InterpLine label="Watch for" text={interpretation.watchFor} tone="caution" />

          {natalContacts.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/[0.04]">
              <p className="text-gray-500 uppercase tracking-widest text-[10px] font-medium mb-1">
                Natal contacts
              </p>
              {natalContacts.slice(0, 4).map((c, i) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <span className="text-gray-500 text-xs">{'•'}</span>
                  <span className="text-gray-400 text-xs flex-1">{c.detail}</span>
                  <span className={`text-xs font-bold tabular-nums ${
                    band === 'transformative' ? 'text-purple-400' :
                    band === 'high' ? 'text-blue-400' :
                    band === 'moderate' ? 'text-teal-400' : 'text-gray-400'
                  }`}>
                    {c.points >= 0 ? '+' : ''}{c.points.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Expand hint */}
      <p className="text-gray-600 text-[10px] text-center mt-2">
        {expanded ? 'Click to collapse' : 'Click to see more'}
      </p>
    </div>
  );
}

// ── InterpLine ───────────────────────────────────────────────────────────────

function InterpLine({ label, text, tone }: { label: string; text: string; tone: 'good' | 'caution' }) {
  const colorClass = tone === 'good' ? 'text-emerald-400' : 'text-red-400';
  return (
    <div className="mb-1">
      <p className={`${colorClass} text-[10px] font-bold uppercase tracking-wide mb-0.5`}>
        {label}
      </p>
      <p className="text-gray-400 text-xs leading-relaxed">{text}</p>
    </div>
  );
}
