'use client';

import React from 'react';
import {
  TransitStoryline,
  phaseLabel,
  phaseDescription,
  storylineProgress,
} from '@/lib/transitStorylines';
import { PLANET_GLYPHS } from '@/lib/transitData';

/* ------------------------------------------------------------------ */
/*  Colour maps — matching the mobile app exactly                      */
/* ------------------------------------------------------------------ */

const PLANET_GRADIENTS: Record<string, [string, string, string]> = {
  Jupiter: ['#1a0a3e', '#3b1f7a', '#6b3fa0'],
  Saturn: ['#1a1a2e', '#2d2d4a', '#4a4a6a'],
  Uranus: ['#001a2c', '#003d5c', '#0077b6'],
  Neptune: ['#0a1628', '#162d50', '#1e4d78'],
  Pluto: ['#1a0000', '#3d0a0a', '#6b1a1a'],
  Chiron: ['#1a1a0a', '#3d3d1a', '#5c5c2d'],
  'North Node': ['#1a0a2e', '#2d1f4a', '#4a3a6a'],
  'South Node': ['#2e0a1a', '#4a1f2d', '#6a3a4a'],
};

const PLANET_GLOWS: Record<string, string> = {
  Jupiter: '#A78BFA',
  Saturn: '#9CA3AF',
  Uranus: '#48CAE4',
  Neptune: '#A78BFA',
  Pluto: '#F87171',
  Chiron: '#FBBF24',
  'North Node': '#C4B5FD',
  'South Node': '#F9A8D4',
};

const ASPECT_SYMBOLS: Record<string, string> = {
  Conjunction: '☌',
  Sextile: '⚹',
  Square: '□',
  Trine: '△',
  Opposition: '☍',
  Quincunx: '⚻',
};

const PHASE_COLORS: Record<string, string> = {
  retrograde_peak: '#8B5CF6',
  first_pass: '#10B981',
  final_pass: '#F59E0B',
  approaching: '#3B82F6',
  completed: '#6B7280',
  single: '#3B82F6',
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatShortDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatSpanDays(arc: TransitStoryline): string {
  const ms = arc.endsAt.getTime() - arc.startsAt.getTime();
  if (ms <= 0) return '';
  const days = Math.round(ms / 86_400_000);
  if (days < 60) return `${days}-day arc`;
  const months = Math.round(days / 30);
  return `${months}-month arc`;
}

function gradientCss(colors: [string, string, string]): string {
  return `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`;
}

/* ------------------------------------------------------------------ */
/*  StorylineCard                                                      */
/* ------------------------------------------------------------------ */

interface StorylineCardProps {
  arc: TransitStoryline;
  now: Date;
}

function StorylineCard({ arc, now }: StorylineCardProps) {
  const gradient = PLANET_GRADIENTS[arc.transitingPlanet] ?? ['#1a1a2e', '#2d2d4a', '#4a4a6a'];
  const glow = PLANET_GLOWS[arc.transitingPlanet] ?? '#A78BFA';
  const phaseColor = PHASE_COLORS[arc.phase] ?? '#A78BFA';
  const transitGlyph = PLANET_GLYPHS[arc.transitingPlanet] ?? '★';
  const natalGlyph = PLANET_GLYPHS[arc.natalPlanet] ?? '★';
  const aspectSym = ASPECT_SYMBOLS[arc.aspectType] ?? '';
  const progress = storylineProgress(arc, now);
  const progressPct = Math.round(progress * 100);

  return (
    <div
      className="mb-4 rounded-xl overflow-hidden"
      style={{ background: gradientCss(gradient) }}
    >
      <div className="relative p-5">
        {/* Glow bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ backgroundColor: glow, opacity: 0.7 }}
        />

        {/* Header row: phase pill + pass count */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="px-3 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: phaseColor + '26',
              borderColor: phaseColor + '66',
              color: phaseColor,
            }}
          >
            {phaseLabel(arc.phase)}
          </span>
          <span className="text-xs text-white/50">
            {arc.passCount > 1
              ? `${arc.passCount} passes · ${formatSpanDays(arc)}`
              : 'Single pass'}
          </span>
        </div>

        {/* Transit signature row: glyphs + aspect symbol */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[26px]" style={{ color: glow }}>
            {transitGlyph}
          </span>
          <span className="text-lg opacity-80" style={{ color: glow }}>
            {aspectSym}
          </span>
          <span className="text-[26px]" style={{ color: glow }}>
            {natalGlyph}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-lg font-semibold text-white mb-2">
          {arc.transitingPlanet} {arc.aspectType} your {arc.natalPlanet}
        </h4>

        {/* Phase description */}
        <p className="text-sm text-white/70 mb-4">
          {phaseDescription(arc, now)}
        </p>

        {/* Timeline track */}
        <div className="mb-4">
          <div className="relative h-2 rounded bg-white/[0.12] mb-1">
            {/* Fill */}
            <div
              className="absolute top-0 left-0 h-2 rounded"
              style={{
                width: `${progressPct}%`,
                backgroundColor: glow,
                opacity: 0.5,
              }}
            />

            {/* Peak ticks */}
            {arc.passes.map((peak, i) => {
              const span = arc.endsAt.getTime() - arc.startsAt.getTime();
              const peakTime = new Date(peak.date).getTime() - arc.startsAt.getTime();
              const leftPct = span > 0 ? (peakTime / span) * 100 : 50;
              return (
                <div
                  key={`${peak.date}-${i}`}
                  className="absolute"
                  style={{
                    top: -2,
                    width: 3,
                    height: 12,
                    left: `${leftPct}%`,
                    marginLeft: -1.5,
                    borderRadius: 1.5,
                    backgroundColor: peak.is_retrograde ? '#F87171' : '#FFFFFF',
                  }}
                />
              );
            })}

            {/* "Now" marker */}
            {arc.phase !== 'approaching' && arc.phase !== 'completed' && (
              <div
                className="absolute"
                style={{
                  top: -4,
                  width: 2,
                  height: 16,
                  left: `${progressPct}%`,
                  marginLeft: -1,
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 0 4px rgba(255,255,255,0.8)',
                }}
              />
            )}
          </div>

          {/* Date labels */}
          <div className="flex justify-between">
            <span className="text-[11px] text-white/40">
              {formatShortDate(arc.startsAt)}
            </span>
            <span className="text-[11px] text-white/40">
              {formatShortDate(arc.endsAt)}
            </span>
          </div>
        </div>

        {/* Pass list (multi-pass arcs only) */}
        {arc.passCount > 1 && (
          <div className="border-t border-white/[0.08] pt-3 space-y-1.5">
            {arc.passes.map((peak, i) => {
              const date = new Date(peak.date);
              const isPast = date.getTime() < now.getTime();
              return (
                <div
                  key={`${peak.date}-${i}-row`}
                  className="flex items-center gap-3"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: isPast ? glow + '66' : glow }}
                  />
                  <span
                    className={`text-sm flex-1 ${
                      isPast ? 'text-white/40' : 'text-white/70'
                    }`}
                  >
                    Pass {i + 1}: {formatShortDate(date)}
                  </span>
                  {peak.is_retrograde && (
                    <span className="text-sm font-semibold text-red-400">
                      &#x211E;
                    </span>
                  )}
                  {typeof peak.orb === 'number' && (
                    <span className="text-[11px] text-white/40">
                      orb {peak.orb.toFixed(1)}&deg;
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  StorylineView (container)                                          */
/* ------------------------------------------------------------------ */

interface StorylineViewProps {
  storylines: TransitStoryline[];
  loading: boolean;
  error: string | null;
  now: Date;
}

export default function StorylineView({
  storylines,
  loading,
  error,
  now,
}: StorylineViewProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-violet-400/30 animate-ping" />
          <div className="absolute inset-0 rounded-full border-2 border-t-violet-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="text-sm text-white/60 animate-pulse">
          Building your storylines&hellip;
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <p className="text-sm text-red-400 text-center">{error}</p>
      </div>
    );
  }

  if (storylines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-white/60">
          No multi-pass transit arcs active this year.
        </p>
        <p className="text-xs text-white/40 px-6">
          Storylines appear when an outer planet loops back over a natal point
          via retrograde.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-2">
      <p className="text-sm text-white/50 mb-4 px-1">
        Each storyline is one outer-planet cycle &mdash; one transit, one natal
        point, and every pass it takes across the retrograde dance.
      </p>
      {storylines.map((arc) => (
        <StorylineCard key={arc.id} arc={arc} now={now} />
      ))}
    </div>
  );
}
