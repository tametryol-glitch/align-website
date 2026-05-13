'use client';

import { useState, useEffect } from 'react';
import {
  PlanetaryHoursResult,
  PLANET_HOUR_COLORS,
  PLANET_HOUR_GLYPHS,
  PLANET_HOUR_MEANINGS,
  type CustomPlanet,
  type PlanetHourMeaning,
} from '@/lib/planetaryHours';

// ── Props ────────────────────────────────────────────────────

interface CurrentHourHeroProps {
  result: PlanetaryHoursResult | null;
  loading: boolean;
}

// ── Helpers ──────────────────────────────────────────────────

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function getPlanetColor(p: CustomPlanet): string {
  return PLANET_HOUR_COLORS[p];
}

function getPlanetGlyph(p: CustomPlanet): string {
  return PLANET_HOUR_GLYPHS[p];
}

function getPlanetMeaning(p: CustomPlanet): PlanetHourMeaning {
  return PLANET_HOUR_MEANINGS[p];
}

// ── Component ────────────────────────────────────────────────

export default function CurrentHourHero({ result, loading }: CurrentHourHeroProps) {
  const [countdown, setCountdown] = useState('');

  // Live countdown timer — ticks every second
  useEffect(() => {
    if (!result?.currentHour) {
      setCountdown('');
      return;
    }

    const tick = () => {
      const end = result.currentHour!.end;
      const diff = end.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown('Transitioning...');
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setCountdown(`${mins}m ${String(secs).padStart(2, '0')}s remaining`);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [result?.currentHour]);

  if (loading || !result) return null;

  const currentHour = result.currentHour;
  const currentMeaning = currentHour ? getPlanetMeaning(currentHour.ruler) : null;

  return (
    <div className="space-y-4">
      {/* ── 1. Sunrise / Sunset Row ──────────────────────────── */}
      <div className="bg-bg-secondary rounded-2xl p-4 flex items-center border border-border-primary">
        {/* Sunrise */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            ☀️ Sunrise
          </span>
          <span className="text-lg font-bold text-text-primary">
            {formatTime(result.sunrise)}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-border-primary mx-4" />

        {/* Sunset */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            🌑 Sunset
          </span>
          <span className="text-lg font-bold text-text-primary">
            {formatTime(result.sunset)}
          </span>
        </div>
      </div>

      {/* ── 2. Galactic Day + Day Ruler Row ──────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
          GALACTIC DAY
        </span>
        <span
          className="text-xl"
          style={{ color: getPlanetColor(result.dayLord) }}
        >
          {getPlanetGlyph(result.dayLord)}
        </span>
        <span className="text-base font-semibold text-text-primary">
          {result.galacticDayName}
        </span>
        <span className="text-sm text-text-tertiary">
          (ruled by {result.dayLord} — {getPlanetMeaning(result.dayLord).sign})
        </span>
      </div>

      {/* ── 3. Current Hour Hero Card ────────────────────────── */}
      {currentHour && currentMeaning && (
        <div
          className="rounded-2xl p-6 border border-accent-muted"
          style={{
            background: `linear-gradient(135deg, ${getPlanetColor(currentHour.ruler)}33 0%, rgba(139,92,246,0.05) 100%)`,
          }}
        >
          {/* Badge */}
          <div className="inline-block bg-accent-muted rounded-md px-3 py-1 mb-4">
            <span className="text-xs font-bold text-accent-secondary uppercase tracking-widest">
              CURRENT PLANETARY HOUR
            </span>
          </div>

          {/* Planet glyph + info */}
          <div className="flex items-center gap-5">
            <span
              className="text-6xl"
              style={{ color: getPlanetColor(currentHour.ruler) }}
            >
              {getPlanetGlyph(currentHour.ruler)}
            </span>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text-primary">
                {currentHour.ruler}
              </h2>
              <p className="text-sm text-text-tertiary mt-0.5">
                {formatTime(currentHour.start)} — {formatTime(currentHour.end)}
              </p>
              <p className="text-xs text-text-muted mt-0.5 italic">
                Ruler of {currentMeaning.sign}
              </p>
            </div>
          </div>

          {/* Countdown */}
          {countdown && (
            <div className="mt-4 pt-3 border-t border-border-primary">
              <p className="text-sm font-semibold text-gold-primary text-center">
                {countdown}
              </p>
            </div>
          )}

          {/* Guidance + details */}
          <div className="mt-4 pt-4 border-t border-border-primary space-y-4">
            {/* Guidance */}
            <p className="text-text-secondary italic leading-relaxed">
              {currentMeaning.guidance}
            </p>

            {/* Energy + Day Type badges */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-bg-tertiary text-text-secondary text-sm font-semibold px-3 py-1 rounded-md">
                {currentMeaning.energy}
              </span>
              <span
                className="text-sm font-semibold px-3 py-1 rounded-md"
                style={{
                  backgroundColor: currentMeaning.color + '22',
                  color: currentMeaning.color,
                }}
              >
                {currentMeaning.dayType}
              </span>
            </div>

            {/* Best For */}
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Best For
              </p>
              <div className="flex flex-wrap gap-2">
                {currentMeaning.bestFor.map((item, i) => (
                  <span
                    key={i}
                    className="bg-emerald-500/15 text-emerald-400 text-sm font-semibold rounded-full px-3 py-1"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Avoid */}
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Avoid
              </p>
              <div className="flex flex-wrap gap-2">
                {currentMeaning.avoid.map((item, i) => (
                  <span
                    key={i}
                    className="bg-red-500/15 text-red-400 text-sm font-semibold rounded-full px-3 py-1"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
