'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { api, buildBirthData } from '@/lib/api';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import {
  RULERS, RULER_MEANINGS, SEGMENT_ANGLE, TOTAL_RULERS,
  getGalacticSignatureUnified, getClockAnglesUnified,
  getNextTransitionsUnified, getInterpretation,
  getRulerSequence, calculateSunTimes, formatDuration, formatSunTime,
} from '@/lib/galacticClock';
import { getSignatureInterpretation, getBestUseTags } from '@/lib/galacticClock/interpretation';
import { getHourMinuteInterpretation } from '@/lib/galacticClock/interpretations144';
import type { RulerName } from '@/lib/galacticClock';
import type { GalacticSignature, ClockMode } from '@/lib/galacticClock';

// ── Dimensions ──
const WHEEL_SIZE = 340;
const CENTER_X = WHEEL_SIZE / 2;
const CENTER_Y = WHEEL_SIZE / 2;
const OUTER_R = WHEEL_SIZE / 2 - 10;
const MIDDLE_R = OUTER_R - 35;
const INNER_R = MIDDLE_R - 30;
const CENTER_R = INNER_R - 25;

// ── Geometry helpers ──
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function describeArcSegment(
  cx: number, cy: number,
  outerR: number, innerR: number,
  startAngle: number, endAngle: number,
): string {
  const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = endAngle - startAngle > 180 ? '1' : '0';

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// ── Map internal signature to GalacticSignature type for interpretation engine ──
function toInterpretationSignature(sig: any, date: Date): GalacticSignature {
  return {
    currentTime: date.toISOString(),
    dayIndex: sig.cycleDay.index,
    cycleDay: sig.cycleDay.name,
    dayLord: sig.dayLord.ruler,
    hourLordIndex: sig.hourLord.index,
    hourLord: sig.hourLord.ruler,
    minuteLordIndex: sig.minuteLord.index,
    minuteLord: sig.minuteLord.ruler,
    pulseLordIndex: sig.pulseLord.index,
    pulseLord: sig.pulseLord.ruler,
    hourProgress: sig.hourLord.progress,
    minuteBlockProgress: sig.minuteLord.progress,
    pulseBlockProgress: sig.pulseLord.progress,
  };
}

// ── Ring Segment Component ──
function RingSegment({
  index, ruler, outerR, innerR, isActive, glyphSize, activeOpacity,
}: {
  index: number; ruler: RulerName; outerR: number; innerR: number;
  isActive: boolean; glyphSize: number; activeOpacity: number;
}) {
  const meaning = RULER_MEANINGS[ruler];
  const startAngle = index * SEGMENT_ANGLE;
  const endAngle = startAngle + SEGMENT_ANGLE;
  const midAngle = startAngle + SEGMENT_ANGLE / 2;
  const glyphR = (outerR + innerR) / 2;
  const glyphPos = polarToCartesian(CENTER_X, CENTER_Y, glyphR, midAngle);
  const segmentPath = describeArcSegment(CENTER_X, CENTER_Y, outerR, innerR, startAngle, endAngle);
  const borderArc = describeArc(CENTER_X, CENTER_Y, outerR, startAngle, endAngle);
  const divStart = polarToCartesian(CENTER_X, CENTER_Y, innerR, startAngle);
  const divEnd = polarToCartesian(CENTER_X, CENTER_Y, outerR, startAngle);

  return (
    <g>
      <path
        d={segmentPath}
        fill={isActive ? hexToRgba(meaning.color, activeOpacity) : 'rgba(255,255,255,0.02)'}
      />
      {isActive && (
        <path
          d={borderArc}
          stroke={meaning.color}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          opacity={0.9}
        />
      )}
      <line
        x1={divStart.x} y1={divStart.y}
        x2={divEnd.x} y2={divEnd.y}
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={0.5}
      />
      <text
        x={glyphPos.x}
        y={glyphPos.y}
        fill={isActive ? meaning.color : 'rgba(255,255,255,0.55)'}
        fontSize={glyphSize}
        fontWeight={isActive ? '700' : '400'}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {meaning.glyph}
      </text>
    </g>
  );
}

// ── Clock Hand Component ──
function ClockHand({ angle, length, color, width }: {
  angle: number; length: number; color: string; width: number;
}) {
  const endPoint = polarToCartesian(CENTER_X, CENTER_Y, length, angle);
  return (
    <g>
      <line
        x1={CENTER_X} y1={CENTER_Y}
        x2={endPoint.x} y2={endPoint.y}
        stroke={color}
        strokeWidth={width + 3}
        strokeLinecap="round"
        opacity={0.15}
      />
      <line
        x1={CENTER_X} y1={CENTER_Y}
        x2={endPoint.x} y2={endPoint.y}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        opacity={0.9}
      />
    </g>
  );
}

// ── Main Component ──
export default function GalacticClockPage() {
  const { profile } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockMode, setClockMode] = useState<ClockMode>('standard');

  const lat = profile?.latitude || 25.0343;
  const lon = profile?.longitude || -77.3963;

  // Update every 250ms for smooth clock hand movement
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 250);
    return () => clearInterval(interval);
  }, []);

  // Compute state from current time
  const signature = getGalacticSignatureUnified(currentTime, clockMode, lat, lon);
  const angles = getClockAnglesUnified(currentTime, clockMode, lat, lon);
  const transitions = getNextTransitionsUnified(currentTime, clockMode, lat, lon);

  // Build interpretation signature
  const interpSig = toInterpretationSignature(signature, currentTime);
  const bestUseTags = getBestUseTags(signature.hourLord.ruler, signature.minuteLord.ruler);
  const hourMinuteInterp = getHourMinuteInterpretation(signature.hourLord.ruler, signature.minuteLord.ruler);

  // Sun times for astronomical display
  const sunTimes = clockMode === 'astronomical' ? calculateSunTimes(currentTime, lat, lon) : null;
  const isDay = signature.isDaytime;

  // Day/night hour durations for astronomical mode
  const dayHourDurationMs = sunTimes
    ? (sunTimes.sunset.getTime() - sunTimes.sunrise.getTime()) / 12
    : 0;
  const nightHourDurationMs = sunTimes
    ? (sunTimes.nextSunrise.getTime() - sunTimes.sunset.getTime()) / 12
    : 0;

  // Ring sequences
  const outerSequence = RULERS.slice();
  const middleSequence = getRulerSequence(signature.hourLord.index);
  const innerSequence = getRulerSequence(signature.minuteLord.index);

  // Active segment indices
  const activeOuterIndex = signature.hourLord.index;
  const activeMiddleIndex = signature.minuteLord.segmentInHour;
  const activeInnerIndex = signature.pulseLord.segmentInMinuteLord;

  const hourLordColor = RULER_MEANINGS[signature.hourLord.ruler].color;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Galactic Clock</h1>
          <p className="text-text-tertiary text-sm">Real-time planetary hour timing system</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex bg-[rgba(20,24,38,0.8)] rounded-3xl border border-white/[0.08] p-1">
          <button
            onClick={() => setClockMode('standard')}
            className={`px-5 py-2 rounded-2xl text-sm font-medium transition-all ${
              clockMode === 'standard'
                ? 'bg-purple-400/25 text-purple-400 font-bold'
                : 'text-white/40'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setClockMode('astronomical')}
            className={`px-5 py-2 rounded-2xl text-sm font-medium transition-all ${
              clockMode === 'astronomical'
                ? 'bg-amber-400/25 text-amber-400 font-bold'
                : 'text-white/40'
            }`}
          >
            Astronomical
          </button>
        </div>
      </div>

      {/* Astronomical Mode Info */}
      {clockMode === 'astronomical' && sunTimes && (
        <div className="bg-[rgba(20,24,38,0.7)] rounded-xl border border-amber-400/15 py-3 px-4 mb-4 text-center">
          <div className={`inline-block px-3 py-1 rounded-xl mb-2 ${
            isDay ? 'bg-amber-400/10' : 'bg-gray-400/10'
          }`}>
            <span className={`text-sm font-semibold ${isDay ? 'text-amber-400' : 'text-purple-300'}`}>
              {isDay ? '☀️ Day Period' : '🌙 Night Period'}
            </span>
          </div>
          <div className="flex justify-center gap-4 text-xs text-text-tertiary mt-1">
            <span>☉ Sunrise: <span className="text-text-secondary font-semibold font-mono">{formatSunTime(sunTimes.sunrise)}</span></span>
            <span className="text-white/15">|</span>
            <span>☽ Sunset: <span className="text-text-secondary font-semibold font-mono">{formatSunTime(sunTimes.sunset)}</span></span>
          </div>
          <div className="flex justify-center gap-4 text-xs text-text-muted mt-1">
            <span>Day Hour: <span className="text-text-secondary font-semibold font-mono">{formatDuration(dayHourDurationMs)}</span></span>
            <span className="text-white/15">|</span>
            <span>Night Hour: <span className="text-text-secondary font-semibold font-mono">{formatDuration(nightHourDurationMs)}</span></span>
          </div>
        </div>
      )}

      {/* Clock Wheel */}
      <div className="flex justify-center mb-5">
        <svg width={WHEEL_SIZE} height={WHEEL_SIZE} className="drop-shadow-lg">
          <defs>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(155,111,246,0.08)" />
              <stop offset="70%" stopColor="rgba(10,14,26,0.4)" />
              <stop offset="100%" stopColor="rgba(6,10,20,0.8)" />
            </radialGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx={CENTER_X} cy={CENTER_Y} r={OUTER_R + 2}
            fill="rgba(6,10,20,0.6)"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />

          {/* Outer Ring (Hour Lords) */}
          {outerSequence.map((ruler, i) => (
            <RingSegment
              key={`outer-${i}`}
              index={i}
              ruler={ruler}
              outerR={OUTER_R}
              innerR={MIDDLE_R + 2}
              isActive={i === activeOuterIndex}
              glyphSize={14}
              activeOpacity={0.12}
            />
          ))}
          <circle cx={CENTER_X} cy={CENTER_Y} r={OUTER_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />

          {/* Middle Ring (Minute Lords) */}
          {middleSequence.map((ruler, i) => (
            <RingSegment
              key={`middle-${i}`}
              index={i}
              ruler={ruler}
              outerR={MIDDLE_R}
              innerR={INNER_R + 2}
              isActive={i === activeMiddleIndex}
              glyphSize={11}
              activeOpacity={0.20}
            />
          ))}
          <circle cx={CENTER_X} cy={CENTER_Y} r={MIDDLE_R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />

          {/* Inner Ring (Pulse Lords) */}
          {innerSequence.map((ruler, i) => (
            <RingSegment
              key={`inner-${i}`}
              index={i}
              ruler={ruler}
              outerR={INNER_R}
              innerR={CENTER_R + 2}
              isActive={i === activeInnerIndex}
              glyphSize={9}
              activeOpacity={0.25}
            />
          ))}
          <circle cx={CENTER_X} cy={CENTER_Y} r={INNER_R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />

          {/* Center circle */}
          <circle cx={CENTER_X} cy={CENTER_Y} r={CENTER_R} fill="url(#centerGlow)" stroke="rgba(155,111,246,0.15)" strokeWidth={0.5} />

          {/* Clock Hands */}
          <ClockHand angle={angles.hour} length={OUTER_R - 5} color="#F59E0B" width={3} />
          <ClockHand angle={angles.minute} length={MIDDLE_R - 3} color="#A78BFA" width={2} />
          <ClockHand angle={angles.pulse} length={INNER_R - 3} color="#38BDF8" width={1.5} />

          {/* Center dot */}
          <circle cx={CENTER_X} cy={CENTER_Y} r={4} fill="#A78BFA" opacity={0.9} />
          <circle cx={CENTER_X} cy={CENTER_Y} r={2} fill="#FFFFFF" opacity={0.9} />

          {/* Center Time Display */}
          <text
            x={CENTER_X} y={CENTER_Y - 6}
            fill="#FFFFFF"
            fontSize={CENTER_R > 30 ? 13 : 10}
            fontWeight="700"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="monospace"
            opacity={0.95}
          >
            {formatTime(currentTime)}
          </text>
          <text
            x={CENTER_X} y={CENTER_Y + 10}
            fill="rgba(255,255,255,0.5)"
            fontSize={CENTER_R > 30 ? 8 : 7}
            fontWeight="500"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {signature.cycleDay.name}
          </text>
        </svg>
      </div>

      {/* Lords Panel */}
      <div className="bg-[rgba(20,24,38,0.7)] rounded-xl border border-white/[0.06] py-3 px-5 mb-3">
        <div className="flex justify-between items-center py-2">
          <span className="text-xs font-medium text-text-tertiary">Cycle Day</span>
          <span className="text-xs font-semibold text-text-secondary">{signature.cycleDay.name}</span>
        </div>
        <div className="h-px bg-white/[0.04]" />
        <div className="flex justify-between items-center py-2">
          <span className="text-xs font-medium text-text-tertiary">Day Lord</span>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold" style={{ color: RULER_MEANINGS[signature.dayLord.ruler].color }}>
              {RULER_MEANINGS[signature.dayLord.ruler].glyph}
            </span>
            <span className="text-xs font-semibold" style={{ color: RULER_MEANINGS[signature.dayLord.ruler].color }}>
              {signature.dayLord.ruler}
            </span>
          </div>
        </div>
        <div className="h-px bg-white/[0.04]" />
        <div className="flex justify-between items-center py-2">
          <span className="text-xs font-medium text-text-tertiary">Hour Lord</span>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-amber-400">{RULER_MEANINGS[signature.hourLord.ruler].glyph}</span>
            <span className="text-xs font-semibold text-amber-400">{signature.hourLord.ruler}</span>
          </div>
        </div>
        <div className="h-px bg-white/[0.04]" />
        <div className="flex justify-between items-center py-2">
          <span className="text-xs font-medium text-text-tertiary">Minute Lord</span>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-purple-400">{RULER_MEANINGS[signature.minuteLord.ruler].glyph}</span>
            <span className="text-xs font-semibold text-purple-400">{signature.minuteLord.ruler}</span>
          </div>
        </div>
        <div className="h-px bg-white/[0.04]" />
        <div className="flex justify-between items-center py-2">
          <span className="text-xs font-medium text-text-tertiary">Pulse Lord</span>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-sky-400">{RULER_MEANINGS[signature.pulseLord.ruler].glyph}</span>
            <span className="text-xs font-semibold text-sky-400">{signature.pulseLord.ruler}</span>
          </div>
        </div>
      </div>

      {/* Countdown Panel */}
      <div className="flex bg-[rgba(20,24,38,0.7)] rounded-xl border border-white/[0.06] py-3 px-3 mb-3 justify-evenly items-center">
        <div className="text-center flex-1">
          <p className="text-[10px] text-text-muted mb-1">Next Hour Lord</p>
          <p className="text-lg font-bold font-mono text-amber-400">{transitions.nextHourLord}</p>
        </div>
        <div className="w-px h-8 bg-white/[0.06]" />
        <div className="text-center flex-1">
          <p className="text-[10px] text-text-muted mb-1">Next Minute Lord</p>
          <p className="text-lg font-bold font-mono text-purple-400">{transitions.nextMinuteLord}</p>
        </div>
        <div className="w-px h-8 bg-white/[0.06]" />
        <div className="text-center flex-1">
          <p className="text-[10px] text-text-muted mb-1">Next Pulse Lord</p>
          <p className="text-lg font-bold font-mono text-sky-400">{transitions.nextPulseLord}</p>
        </div>
      </div>

      {/* Interpretation Card */}
      <div className="rounded-xl border overflow-hidden mb-3" style={{ borderColor: hexToRgba(hourLordColor, 0.3) }}>
        <div className="p-5" style={{ background: `linear-gradient(to bottom, ${hexToRgba(hourLordColor, 0.1)}, rgba(20,24,38,0.97))` }}>
          {/* Title */}
          <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: hourLordColor }}>
            {hourMinuteInterp.title}
          </p>

          {/* Signature line */}
          <p className="text-xs text-text-secondary font-semibold mb-3 leading-relaxed">
            {signature.cycleDay.name} /{' '}
            <span className="text-amber-400">{signature.hourLord.ruler} Hour</span> /{' '}
            <span className="text-purple-400">{signature.minuteLord.ruler} Minute</span> /{' '}
            <span className="text-sky-400">{signature.pulseLord.ruler} Pulse</span>
          </p>

          {/* Summary */}
          <p className="text-xs text-text-tertiary leading-relaxed italic mb-3">{hourMinuteInterp.summary}</p>

          {/* Focus */}
          <div className="flex items-start gap-1.5 mb-1.5">
            <span className="text-green-400 text-sm">▶</span>
            <p className="text-xs text-green-100 font-medium leading-relaxed">{hourMinuteInterp.focus}</p>
          </div>

          {/* Caution */}
          <div className="flex items-start gap-1.5 mb-3">
            <span className="text-amber-400 text-sm">⚠</span>
            <p className="text-xs text-amber-100/80 font-medium leading-relaxed">{hourMinuteInterp.caution}</p>
          </div>

          {/* Energy / Stability / Spiritual Scores */}
          <div className="flex justify-between px-1 mb-3">
            {[
              { label: 'Energy', score: hourMinuteInterp.energyScore, color: '#EF4444' },
              { label: 'Stability', score: hourMinuteInterp.stabilityScore, color: '#22C55E' },
              { label: 'Spiritual', score: hourMinuteInterp.spiritualScore, color: '#A78BFA' },
            ].map((s) => (
              <div key={s.label} className="text-center flex-1">
                <p className="text-[10px] text-text-muted mb-1">{s.label}</p>
                <div className="flex justify-center gap-0.5">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: i < s.score ? s.color : 'rgba(255,255,255,0.08)' }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {hourMinuteInterp.tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-xs font-semibold border"
                style={{
                  backgroundColor: hexToRgba(hourLordColor, 0.15),
                  borderColor: hexToRgba(hourLordColor, 0.4),
                  color: hourLordColor,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Best Use Tags */}
      {bestUseTags.length > 0 && (
        <div className="bg-[rgba(20,24,38,0.7)] rounded-xl border border-white/[0.06] p-4 mb-3">
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-2">Best Use Right Now</p>
          <div className="flex flex-wrap gap-2">
            {bestUseTags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-400/10 border border-purple-400/30 text-purple-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
