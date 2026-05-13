'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  computeImpact,
  buildEventInterpretation,
  type ImpactBand,
  type ImpactScore,
  type ImpactContribution,
  type LunarEvent,
  type EclipseSubtype,
  type EventInterpretation,
} from '@/lib/moonPhases';

// ── Types ────────────────────────────────────────────────────────────────────

interface EclipsesTabProps {
  natalPositions?: any;
}

type ViewMode = 'upcoming' | 'byAxis';

interface BackendEclipse {
  subtype: EclipseSubtype;
  name: string;
  date: string;
  sun_longitude: number;
  moon_longitude: number;
  node_longitude: number;
  node_side: 'north' | 'south';
  separation: number;
  moon_sign: string;
  moon_sign_degree: number;
  phase_key: 'new' | 'full';
  influence_start: string;
  peak: string;
  influence_end: string;
}

interface EclipseEvent {
  type: 'eclipse';
  subtype: EclipseSubtype;
  date: Date;
  sunLon: number;
  moonLon: number;
  nodeLon: number;
  nodeSide: 'north' | 'south';
  sunNodeSeparation: number;
  moonSign: string;
  moonDegreeInSign: number;
  phaseKey: 'new' | 'full';
  name: string;
  influenceStart: Date;
  peak: Date;
  influenceEnd: Date;
}

interface EnrichedEclipse {
  event: EclipseEvent;
  impact: ImpactScore;
  interpretation: EventInterpretation;
}

// ── Constants ────────────────────────────────────────────────────────────────

const COUNT_OPTIONS: { key: number; label: string }[] = [
  { key: 4, label: '4' },
  { key: 8, label: '8' },
  { key: 12, label: '12' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function bandPointsColorClass(band: ImpactBand): string {
  switch (band) {
    case 'transformative': return 'text-purple-400';
    case 'high': return 'text-blue-400';
    case 'moderate': return 'text-teal-400';
    default: return 'text-gray-400';
  }
}

function formatFullDate(date: Date): string {
  const d = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const t = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${d} · ${t}`;
}

function formatWindowDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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

function subtypeBadgeLabel(subtype: EclipseSubtype): string {
  const parts = subtype.split('_');
  const shortLum = parts[0] === 'solar' ? 'SOL' : 'LUN';
  const quality = parts[1] ? parts[1].toUpperCase().slice(0, 4) : '';
  return `${shortLum} ${quality}`;
}

function isSolarType(subtype: EclipseSubtype): boolean {
  return subtype.startsWith('solar');
}

function eclipseFromBackend(raw: BackendEclipse): EclipseEvent {
  const peak = new Date(raw.peak);
  return {
    type: 'eclipse',
    subtype: raw.subtype,
    date: peak,
    sunLon: raw.sun_longitude,
    moonLon: raw.moon_longitude,
    nodeLon: raw.node_longitude,
    nodeSide: raw.node_side,
    sunNodeSeparation: raw.separation,
    moonSign: raw.moon_sign,
    moonDegreeInSign: raw.moon_sign_degree,
    phaseKey: raw.phase_key,
    name: raw.name,
    influenceStart: new Date(raw.influence_start),
    peak,
    influenceEnd: new Date(raw.influence_end),
  };
}

function enrichEclipse(eclipse: EclipseEvent, natalPositions: any): EnrichedEclipse {
  const lunarEvent: LunarEvent = {
    type: 'eclipse',
    subtype: eclipse.subtype,
    date: eclipse.date,
    sunLon: eclipse.sunLon,
    moonLon: eclipse.moonLon,
    nodeLon: eclipse.nodeLon,
    nodeSide: eclipse.nodeSide,
  };
  const impact = computeImpact(lunarEvent, natalPositions ?? null);
  const interpretation = buildEventInterpretation(lunarEvent, impact, eclipse.moonSign);
  return { event: eclipse, impact, interpretation };
}

// ── Component ────────────────────────────────────────────────────────────────

export default function EclipsesTab({ natalPositions }: EclipsesTabProps) {
  const [count, setCount] = useState(8);
  const [mode, setMode] = useState<ViewMode>('upcoming');
  const [now, setNow] = useState(() => new Date());
  const [rawEclipses, setRawEclipses] = useState<EclipseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refresh countdown every 60s
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  // Fetch eclipses
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    api.getUpcomingEclipses()
      .then((resp: any) => {
        if (!active) return;
        const eclipses: BackendEclipse[] = resp.eclipses || [];
        const parsed = eclipses.map(eclipseFromBackend);
        setRawEclipses(parsed);
        setLoading(false);
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.message || 'Failed to load eclipses.');
        setLoading(false);
      });

    return () => { active = false; };
  }, [count]);

  const enriched = useMemo(
    () => rawEclipses.slice(0, count).map((e) => enrichEclipse(e, natalPositions)),
    [rawEclipses, count, natalPositions]
  );

  const grouped = useMemo(() => {
    const north = enriched.filter((e) => e.event.nodeSide === 'north');
    const south = enriched.filter((e) => e.event.nodeSide === 'south');
    return { north, south };
  }, [enriched]);

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="px-4 pt-3 pb-2 space-y-3">
        {/* Count control */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 uppercase tracking-wider text-[10px] font-medium mr-1">
            Show
          </span>
          {COUNT_OPTIONS.map((c) => (
            <button
              key={c.key}
              onClick={() => setCount(c.key)}
              className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                count === c.key
                  ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                  : 'border-white/[0.08] text-gray-500 hover:text-gray-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('upcoming')}
            className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${
              mode === 'upcoming'
                ? 'border-purple-500 bg-purple-500/10 text-purple-400 font-bold'
                : 'border-white/[0.08] text-gray-500 hover:text-gray-300'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setMode('byAxis')}
            className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${
              mode === 'byAxis'
                ? 'border-purple-500 bg-purple-500/10 text-purple-400 font-bold'
                : 'border-white/[0.08] text-gray-500 hover:text-gray-300'
            }`}
          >
            By axis
          </button>
        </div>
      </div>

      {/* No natal data banner */}
      {!natalPositions && (
        <div className="mx-4 mb-2 bg-purple-500/10 border border-purple-500/25 rounded-lg p-3">
          <p className="text-purple-300 text-sm text-center">
            Add your birth data to personalize each eclipse's impact on your chart.
          </p>
        </div>
      )}

      {/* Eclipse list */}
      <div className="flex-1 overflow-y-auto px-4 pt-1 pb-8 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center gap-2 mt-12">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading eclipses...</p>
          </div>
        ) : error ? (
          <div className="mt-12 px-4">
            <p className="text-red-300 text-sm text-center">{error}</p>
          </div>
        ) : enriched.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-12">
            No eclipses in the scan window.
          </p>
        ) : mode === 'upcoming' ? (
          enriched.map((e, i) => (
            <EclipseCard key={e.event.date.toISOString() + i} data={e} now={now} />
          ))
        ) : (
          <>
            <AxisHeader side="north" count={grouped.north.length} />
            {grouped.north.length === 0 && (
              <p className="text-gray-600 text-xs text-center py-2">No eclipses on the North Node axis</p>
            )}
            {grouped.north.map((e, i) => (
              <EclipseCard key={'n' + e.event.date.toISOString() + i} data={e} now={now} />
            ))}

            <AxisHeader side="south" count={grouped.south.length} />
            {grouped.south.length === 0 && (
              <p className="text-gray-600 text-xs text-center py-2">No eclipses on the South Node axis</p>
            )}
            {grouped.south.map((e, i) => (
              <EclipseCard key={'s' + e.event.date.toISOString() + i} data={e} now={now} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ── AxisHeader ───────────────────────────────────────────────────────────────

function AxisHeader({ side, count }: { side: 'north' | 'south'; count: number }) {
  const isNorth = side === 'north';
  const accentClass = isNorth ? 'text-purple-400' : 'text-amber-400';
  const barClass = isNorth ? 'bg-purple-400' : 'bg-amber-400';
  const label = isNorth ? 'North Node axis' : 'South Node axis';
  const verb = isNorth
    ? 'what is calling you forward'
    : 'what is asking to be released';

  return (
    <div className="flex items-center gap-3 mt-4 mb-2">
      <div className={`w-1 h-8 rounded-sm ${barClass}`} />
      <div className="flex-1">
        <p className={`${accentClass} text-sm font-bold`}>{label}</p>
        <p className="text-gray-500 text-xs">
          {verb} · {count} {count === 1 ? 'eclipse' : 'eclipses'}
        </p>
      </div>
    </div>
  );
}

// ── EclipseCard ──────────────────────────────────────────────────────────────

function EclipseCard({ data, now }: { data: EnrichedEclipse; now: Date }) {
  const [expanded, setExpanded] = useState(false);
  const { event, impact, interpretation } = data;
  const band = impact.band;
  const highTier = band === 'transformative' || band === 'high';
  const countdown = getCountdown(event.peak, now);
  const solar = isSolarType(event.subtype);

  const inWindow =
    now.getTime() >= event.influenceStart.getTime() &&
    now.getTime() <= event.influenceEnd.getTime();

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
        {/* Subtype badge */}
        <div
          className={`px-2 py-1 rounded-md border text-center min-w-[64px] ${
            solar
              ? 'bg-amber-500/[0.18] border-amber-500/30'
              : 'bg-purple-500/[0.18] border-purple-500/30'
          }`}
        >
          <span
            className={`text-[10px] font-extrabold tracking-wide ${
              solar ? 'text-amber-400' : 'text-purple-400'
            }`}
          >
            {subtypeBadgeLabel(event.subtype)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-white font-bold text-sm">{event.name}</h4>
          <p className="text-gray-400 text-xs mt-0.5">
            in {event.moonSign} {event.moonDegreeInSign.toFixed(1)}{'°'}
            {impact.eventHouse ? ` · House ${impact.eventHouse}` : ''}
          </p>
          <p className="text-gray-500 text-[11px] mt-0.5">
            {formatFullDate(event.peak)}
          </p>
        </div>

        {/* Score chip */}
        <div
          className={`flex flex-col items-center min-w-[54px] px-2 py-1.5 rounded-lg border ${bandChipClasses(band)} border-current`}
        >
          <span className="text-lg font-extrabold tabular-nums">{impact.score}</span>
          <span className="text-[10px] font-bold tracking-wide mt-0.5">{countdown}</span>
        </div>
      </div>

      {/* Node side indicator */}
      <div className="flex items-center gap-1.5 mt-1">
        <div
          className={`w-2 h-2 rounded-full ${
            event.nodeSide === 'north' ? 'bg-purple-400' : 'bg-amber-400'
          }`}
        />
        <span className="text-gray-500 text-[11px]">
          {event.nodeSide === 'north' ? 'North Node axis' : 'South Node axis'}
          {' · '}{event.sunNodeSeparation.toFixed(1)}{'° from node'}
        </span>
      </div>

      {/* Primary + summary */}
      <p className="text-purple-300 italic text-sm mt-2">{impact.primary}</p>
      <p className="text-gray-400 text-sm leading-relaxed mt-2">{interpretation.summary}</p>

      {/* Inside eclipse window badge */}
      {inWindow && (
        <div className="mt-2 inline-block bg-amber-500/15 border border-amber-500 rounded-full px-2.5 py-1">
          <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wide">
            Inside the eclipse window
          </span>
        </div>
      )}

      {/* Expanded section */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-3">
          <InterpLine label="Lean into" text={interpretation.leanInto} tone="good" />
          <InterpLine label="Watch for" text={interpretation.watchFor} tone="caution" />

          {/* Influence window */}
          <div className="pt-2 border-t border-white/[0.04]">
            <p className="text-gray-500 uppercase tracking-widest text-[10px] font-medium mb-1.5">
              Influence window
            </p>
            <WindowRow label="Begins" date={event.influenceStart} />
            <WindowRow label="Peak" date={event.peak} emphasized />
            <WindowRow label="Fades" date={event.influenceEnd} />
          </div>

          {/* Natal contacts */}
          {natalContacts.length > 0 && (
            <div className="pt-2 border-t border-white/[0.04]">
              <p className="text-gray-500 uppercase tracking-widest text-[10px] font-medium mb-1">
                Natal contacts
              </p>
              {natalContacts.slice(0, 4).map((c, i) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <span className="text-gray-500 text-xs">{'•'}</span>
                  <span className="text-gray-400 text-xs flex-1">{c.detail}</span>
                  <span className={`text-xs font-bold tabular-nums ${bandPointsColorClass(band)}`}>
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

// ── WindowRow ────────────────────────────────────────────────────────────────

function WindowRow({ label, date, emphasized }: { label: string; date: Date; emphasized?: boolean }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span
        className={`text-xs ${
          emphasized ? 'text-amber-400 font-bold' : 'text-gray-500'
        }`}
      >
        {label}
      </span>
      <span
        className={`text-xs tabular-nums ${
          emphasized ? 'text-white font-bold' : 'text-gray-400'
        }`}
      >
        {formatWindowDate(date)}
      </span>
    </div>
  );
}
