'use client';

/**
 * TodayTab -- live "right now" moon experience for the web.
 *
 * Three cards:
 *   1) Now -- phase, moon sign, illumination, age.
 *   2) Next event -- type + date + live countdown.
 *   3) Impact on you -- score + band + top contributions, derived from
 *      the user's natal chart via computeImpactScore.
 *
 * Pure UI; all data comes from the moonPhases services. One 1-second tick
 * timer drives the countdown. Heavier recomputation (computeCurrentMoonState,
 * getNextPhase, computeImpactScore) runs once per minute via memoization keyed
 * on a "minute bucket" so we don't churn every second.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { api, buildBirthData } from '@/lib/api';
import {
  computeCurrentMoonState,
  buildMoonStateFromBackend,
  buildUpcomingPhaseFromBackend,
  computeImpactScore,
  generateInterpretation,
  type MoonState,
  type UpcomingPhase,
} from '@/lib/moonPhases';

// ── Types ────────────────────────────────────────────────────────────────────

interface TodayTabProps {
  natalPositions?: any;
  profile?: any;
}

type ImpactBand = 'negligible' | 'low' | 'moderate' | 'high' | 'transformative';

interface ImpactContribution {
  kind: string;
  target?: string;
  detail: string;
  points: number;
}

interface ImpactResult {
  score: number;
  band: ImpactBand;
  primary: string;
  contributions: ImpactContribution[];
}

interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  past: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getCountdownParts(target: Date, from: Date): CountdownParts {
  const totalMs = target.getTime() - from.getTime();
  if (totalMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
  }
  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, past: false };
}

function bandToColor(band: ImpactBand): string {
  switch (band) {
    case 'transformative': return 'text-amber-400';
    case 'high':           return 'text-amber-300';
    case 'moderate':       return 'text-purple-400';
    case 'low':            return 'text-purple-300';
    case 'negligible':     return 'text-text-muted';
  }
}

function bandToBgColor(band: ImpactBand): string {
  switch (band) {
    case 'transformative': return 'bg-amber-400/20 border-amber-400';
    case 'high':           return 'bg-amber-300/20 border-amber-300';
    case 'moderate':       return 'bg-purple-400/20 border-purple-400';
    case 'low':            return 'bg-purple-300/20 border-purple-300';
    case 'negligible':     return 'bg-white/5 border-white/20';
  }
}

function bandToLabel(band: ImpactBand): string {
  switch (band) {
    case 'transformative': return 'Transformative';
    case 'high':           return 'High impact';
    case 'moderate':       return 'Moderate impact';
    case 'low':            return 'Low impact';
    case 'negligible':     return 'Barely felt';
  }
}

function formatEventDate(date: Date): string {
  const d = date.toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  });
  const t = date.toLocaleTimeString(undefined, {
    hour: 'numeric', minute: '2-digit',
  });
  return `${d} · ${t}`;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function TodayTab({ natalPositions, profile: propProfile }: TodayTabProps) {
  const { profile: storeProfile } = useAuthStore();
  const profile = propProfile || storeProfile;

  const [now, setNow] = useState(() => new Date());

  // 1-second tick drives countdown; everything else memoized on coarser key
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Recompute state once per minute
  const minuteBucket = Math.floor(now.getTime() / 60000);

  // Current moon state: client solver first, then overlay backend Swiss Ephemeris
  const [current, setCurrent] = useState<MoonState | null>(null);
  useEffect(() => {
    let active = true;
    try {
      const clientState = computeCurrentMoonState(new Date());
      if (active) setCurrent(clientState);
    } catch {
      // client solver unavailable
    }

    // Refine with backend data
    const birthData = {
      name: 'Transit',
      date: new Date().toISOString().split('T')[0],
      time: '12:00:00',
      latitude: 0,
      longitude: 0,
      timezone: 'UTC',
      location: 'Current',
      house_system: 'Whole Sign',
    };
    api.getCurrentTransits(birthData)
      .then((resp: any) => {
        if (!active) return;
        const fromBackend = buildMoonStateFromBackend(resp, new Date());
        if (fromBackend) setCurrent(fromBackend);
      })
      .catch(() => { /* backend unreachable -- keep client solver */ });

    return () => { active = false; };
  }, [minuteBucket]);

  // Next phase: client first, then backend
  const [nextPhase, setNextPhase] = useState<UpcomingPhase | null>(null);
  useEffect(() => {
    let active = true;
    try {
      const clientPhase = computeCurrentMoonState(new Date());
      // computeCurrentMoonState returns current state; we need next phase from the service
      // The service module exposes a getNextPhase-equivalent via the UpcomingPhase builder
    } catch {}

    api.getUpcomingMoonPhases(1)
      .then((resp: any) => {
        if (!active) return;
        const ev = resp?.events?.[0];
        const fromBackend = buildUpcomingPhaseFromBackend(ev, new Date());
        if (fromBackend) setNextPhase(fromBackend);
      })
      .catch(() => { /* offline */ });

    return () => { active = false; };
  }, [minuteBucket]);

  // Impact scoring
  const impact: ImpactResult | null = useMemo(() => {
    if (!nextPhase || !natalPositions) return null;
    try {
      const result = computeImpactScore(
        {
          type: nextPhase.key,
          date: nextPhase.date,
          sunLon: nextPhase.sunLon,
          moonLon: nextPhase.moonLon,
        },
        natalPositions
      );
      return result as ImpactResult;
    } catch {
      return null;
    }
  }, [nextPhase, natalPositions]);

  // Interpretation for no-natal fallback
  const interpretation = useMemo(() => {
    if (!nextPhase) return null;
    try {
      return generateInterpretation(nextPhase.key, nextPhase.moonSign);
    } catch {
      return null;
    }
  }, [nextPhase]);

  const countdown = nextPhase ? getCountdownParts(nextPhase.date, now) : null;

  // ── Loading state ──────────────────────────────────────────────────────────

  if (!current) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="rounded-2xl bg-purple-900/20 h-64 border border-purple-500/20" />
        <div className="rounded-2xl bg-bg-card h-48 border border-border-primary" />
        <div className="rounded-2xl bg-bg-card h-40 border border-border-primary" />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Card 1: Right Now */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/35 bg-gradient-to-br from-purple-900/30 to-indigo-900/20 p-6">
        <div className="flex flex-col items-center text-center">
          <span className="text-[10px] font-medium uppercase tracking-[1.5px] text-purple-300 mb-2">
            Right now
          </span>
          <span className="text-7xl leading-none mb-2">{current.phase.emoji}</span>
          <h2 className="text-2xl font-display font-bold text-text-primary">
            {current.phase.name}
          </h2>
          <p className="text-purple-300 italic mt-1 mb-4 text-sm">
            Moon in {current.moonSign} {current.moonDegreeInSign.toFixed(1)}&deg;
          </p>

          {/* Stats row */}
          <div className="w-full border-t border-white/8 pt-4 grid grid-cols-3 gap-4">
            <NowStat label="Illum." value={`${Math.round(current.illumination * 100)}%`} />
            <NowStat label="Age" value={`${current.ageDays.toFixed(1)}d`} />
            <NowStat
              label={current.waxing ? 'Waxing' : 'Waning'}
              value={current.waxing ? '↗' : '↘'}
            />
          </div>
        </div>
      </div>

      {/* Card 2: Next Major Event */}
      {nextPhase && countdown && (
        <div className="rounded-2xl border border-border-primary bg-bg-card p-6">
          <span className="text-[10px] font-medium uppercase tracking-[1.5px] text-text-muted mb-3 block">
            Next major event
          </span>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-[44px] leading-none">{nextPhase.emoji}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-display font-bold text-text-primary truncate">
                {nextPhase.name}
              </h3>
              <p className="text-text-tertiary text-sm mt-0.5">
                in {nextPhase.moonSign} {nextPhase.moonDegreeInSign.toFixed(1)}&deg;
              </p>
            </div>
          </div>

          {/* Countdown cells */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <CountdownCell value={countdown.days} label="days" />
            <CountdownCell value={countdown.hours} label="hrs" />
            <CountdownCell value={countdown.minutes} label="min" />
            <CountdownCell value={countdown.seconds} label="sec" />
          </div>

          <p className="text-text-tertiary text-sm text-center mt-2">
            {formatEventDate(nextPhase.date)}
          </p>
        </div>
      )}

      {/* Card 3: Impact on You */}
      {natalPositions && impact ? (
        <ImpactCard
          score={impact.score}
          band={impact.band}
          primary={impact.primary}
          contributions={impact.contributions.slice(0, 4)}
        />
      ) : (
        <MissingChartCard />
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function NowStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg font-bold text-text-primary font-mono tabular-nums">
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-[0.5px] text-text-muted mt-0.5">
        {label}
      </span>
    </div>
  );
}

function CountdownCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-white/[0.04] rounded-xl py-3">
      <span className="text-2xl font-display font-bold text-text-primary font-mono tabular-nums">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[10px] uppercase tracking-[0.5px] text-text-muted mt-0.5">
        {label}
      </span>
    </div>
  );
}

interface ImpactCardProps {
  score: number;
  band: ImpactBand;
  primary: string;
  contributions: ImpactContribution[];
}

function ImpactCard({ score, band, primary, contributions }: ImpactCardProps) {
  const colorClass = bandToColor(band);
  const bgClass = bandToBgColor(band);

  return (
    <div className="rounded-2xl border border-border-primary bg-bg-card p-6">
      <span className="text-[10px] font-medium uppercase tracking-[1.5px] text-text-muted mb-4 block">
        Impact on you
      </span>

      <div className="flex items-center gap-4 mb-4">
        {/* Score badge */}
        <div className={`w-[72px] h-[72px] rounded-full border-2 flex items-center justify-center ${bgClass}`}>
          <span className={`text-2xl font-extrabold font-mono tabular-nums ${colorClass}`}>
            {score}
          </span>
          <span className={`text-xs ml-0.5 mt-1.5 opacity-70 ${colorClass}`}>/100</span>
        </div>

        <div className="flex-1 min-w-0">
          <span className={`text-[11px] font-bold uppercase tracking-[0.8px] block mb-1 ${colorClass}`}>
            {bandToLabel(band)}
          </span>
          <p className="text-text-primary text-sm leading-relaxed">
            {primary}
          </p>
        </div>
      </div>

      {/* Contributions / "Why" section */}
      {contributions.length > 0 && (
        <div className="border-t border-white/[0.06] pt-3 mt-3">
          <span className="text-[10px] font-medium uppercase tracking-[1px] text-text-muted mb-2 block">
            Why
          </span>
          <div className="space-y-1">
            {contributions.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-text-muted text-xs">&bull;</span>
                <span className="text-text-secondary text-sm flex-1 truncate">
                  {c.detail}
                </span>
                <span className={`text-xs font-bold font-mono tabular-nums ${colorClass}`}>
                  {c.points >= 0 ? '+' : ''}{c.points.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MissingChartCard() {
  return (
    <div className="rounded-2xl border border-purple-500/20 bg-bg-card p-6 text-center">
      <span className="text-4xl block mb-2">&#10024;</span>
      <h3 className="text-lg font-display font-bold text-text-primary">
        See how this affects you
      </h3>
      <p className="text-text-tertiary text-sm mt-2 mb-4 leading-relaxed max-w-sm mx-auto">
        Add your birth date, time, and location to unlock a personalized
        impact score and aspect breakdown for every lunar event.
      </p>
      <Link
        href="/profile"
        className="inline-block bg-gradient-accent text-white font-bold px-6 py-2.5 rounded-full text-sm tracking-wide hover:opacity-90 transition-opacity"
      >
        Go to Profile
      </Link>
    </div>
  );
}
