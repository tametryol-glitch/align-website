'use client';

/**
 * CalendarTab -- monthly lunar calendar for the web.
 *
 * Header: month label, prev/next arrows, "Today" jump.
 * Body:   7x6 day grid with phase emoji markers and eclipse glyphs.
 * Footer: selected-day detail panel with full event info.
 *
 * Port of the mobile CalendarTab, adapted for Next.js + Tailwind.
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { api } from '@/lib/api';

// ── Types (mirroring calendarService) ────────────────────────────────────

type ImpactBand = 'transformative' | 'high' | 'moderate' | 'low' | 'negligible';

interface ImpactScore {
  score: number;
  band: ImpactBand;
  primary: string;
  factors: Array<{ label: string; points: number }>;
}

interface EventInterpretation {
  summary: string;
  leanInto: string;
  watchFor: string;
}

interface PhaseBucket {
  key: string;
  name: string;
  emoji: string;
}

interface UpcomingPhase {
  key: 'new' | 'first_quarter' | 'full' | 'last_quarter';
  name: string;
  emoji: string;
  date: Date;
  sunLon: number;
  moonLon: number;
  moonSign: string;
  moonDegreeInSign: number;
  msUntil: number;
}

type EclipseSubtype =
  | 'solar_total'
  | 'solar_annular'
  | 'solar_partial'
  | 'solar_hybrid'
  | 'lunar_total'
  | 'lunar_partial'
  | 'lunar_penumbral';

interface LunarEvent {
  type: string;
  subtype?: EclipseSubtype;
  date: Date;
  sunLon: number;
  moonLon: number;
  nodeLon?: number;
  nodeSide?: 'north' | 'south';
}

interface CalendarEvent {
  phase: UpcomingPhase;
  event: LunarEvent;
  impact: ImpactScore;
  interpretation: EventInterpretation;
}

interface CalendarEclipseRecord extends LunarEvent {
  type: 'eclipse';
  subtype: EclipseSubtype;
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

interface CalendarEclipse {
  eclipse: CalendarEclipseRecord;
  event: LunarEvent;
  impact: ImpactScore;
  interpretation: EventInterpretation;
}

interface DayPhaseEvent {
  key: 'new' | 'first_quarter' | 'full' | 'last_quarter';
  name: string;
  emoji: string;
  atHour: number;
  enriched: CalendarEvent;
}

interface DayEclipse {
  subtype: EclipseSubtype;
  name: string;
  nodeSide: 'north' | 'south';
  separation: number;
  enriched: CalendarEclipse;
}

interface CalendarDay {
  date: Date;
  dayNum: number;
  weekday: number;
  inMonth: boolean;
  phase: PhaseBucket;
  moonSign: string;
  illumination: number;
  phaseEvent: DayPhaseEvent | null;
  eclipseEvent: DayEclipse | null;
}

interface CalendarMonth {
  year: number;
  month: number;
  label: string;
  days: CalendarDay[];
  events: CalendarEvent[];
  eclipses: CalendarEclipse[];
}

// ── Props ────────────────────────────────────────────────────────────────

interface CalendarTabProps {
  natalPositions?: any;
}

// ── Constants ────────────────────────────────────────────────────────────

const WEEKDAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type LunarPhaseKey =
  | 'new'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full'
  | 'disseminating'
  | 'last_quarter'
  | 'balsamic';

const PHASE_BUCKETS: Record<LunarPhaseKey, { name: string; emoji: string }> = {
  new:              { name: 'New Moon',          emoji: '🌑' },
  waxing_crescent:  { name: 'Waxing Crescent',  emoji: '🌒' },
  first_quarter:    { name: 'First Quarter',     emoji: '🌓' },
  waxing_gibbous:   { name: 'Waxing Gibbous',    emoji: '🌔' },
  full:             { name: 'Full Moon',         emoji: '🌕' },
  disseminating:    { name: 'Disseminating Moon', emoji: '🌖' },
  last_quarter:     { name: 'Last Quarter',      emoji: '🌗' },
  balsamic:         { name: 'Balsamic Moon',     emoji: '🌘' },
};

const MAJOR_PHASE_META: Record<
  'new' | 'first_quarter' | 'full' | 'last_quarter',
  { name: string; emoji: string }
> = {
  new:           { name: 'New Moon',      emoji: '🌑' },
  first_quarter: { name: 'First Quarter', emoji: '🌓' },
  full:          { name: 'Full Moon',     emoji: '🌕' },
  last_quarter:  { name: 'Last Quarter',  emoji: '🌗' },
};

// ── Band helpers ─────────────────────────────────────────────────────────

function bandToColor(band: ImpactBand): string {
  switch (band) {
    case 'transformative': return '#F5A623';
    case 'high':           return '#FCC737';
    case 'moderate':       return '#9B6FF6';
    case 'low':            return '#B8A0FA';
    case 'negligible':     return '#7B849A';
  }
}

function bandLabel(band: ImpactBand): string {
  switch (band) {
    case 'transformative': return 'Transformative';
    case 'high':           return 'High impact';
    case 'moderate':       return 'Moderate impact';
    case 'low':            return 'Low impact';
    case 'negligible':     return 'Barely felt';
  }
}

function bandTailwindBg(band: ImpactBand): string {
  switch (band) {
    case 'transformative': return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
    case 'high':           return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
    case 'moderate':       return 'bg-purple-500/20 border-purple-500/50 text-purple-300';
    case 'low':            return 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300';
    case 'negligible':     return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
  }
}

// ── Date helpers ─────────────────────────────────────────────────────────

function formatFullDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function noonUtcFromIso(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00Z`);
}

function sameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const total = year * 12 + (month - 1) + delta;
  const newYear = Math.floor(total / 12);
  const newMonth = (total % 12) + 1;
  return { year: newYear, month: newMonth };
}

function bucketFromKey(key: string): PhaseBucket {
  const meta = PHASE_BUCKETS[key as LunarPhaseKey] ?? PHASE_BUCKETS.new;
  return { key, name: meta.name, emoji: meta.emoji };
}

// ── Impact scoring (simplified client-side, same as mobile) ──────────────

function computeImpactSimple(event: LunarEvent, natal: any): ImpactScore {
  // Without natal data, return a baseline score based on event type
  let base = 30;
  const factors: Array<{ label: string; points: number }> = [];

  if (event.type === 'eclipse') {
    base = 70;
    factors.push({ label: 'Eclipse event', points: 40 });
    if (event.subtype?.includes('total')) {
      base += 15;
      factors.push({ label: 'Total eclipse', points: 15 });
    }
  } else if (event.type === 'new' || event.type === 'full') {
    base = 45;
    factors.push({ label: 'Major phase', points: 15 });
  } else {
    factors.push({ label: 'Quarter phase', points: 0 });
  }

  // If we have natal positions, try to add aspect-based scoring
  if (natal) {
    // Simplified: check if moon longitude is near any natal planet
    const moonLon = event.moonLon;
    if (natal.planets && Array.isArray(natal.planets)) {
      for (const planet of natal.planets) {
        if (planet.longitude == null) continue;
        const diff = Math.abs(moonLon - planet.longitude) % 360;
        const minDiff = Math.min(diff, 360 - diff);
        if (minDiff < 3) {
          base += 20;
          factors.push({ label: `Conjunct natal ${planet.name}`, points: 20 });
          break;
        } else if (Math.abs(minDiff - 180) < 3) {
          base += 15;
          factors.push({ label: `Opposite natal ${planet.name}`, points: 15 });
          break;
        } else if (Math.abs(minDiff - 90) < 3) {
          base += 10;
          factors.push({ label: `Square natal ${planet.name}`, points: 10 });
          break;
        } else if (Math.abs(minDiff - 120) < 3) {
          base += 10;
          factors.push({ label: `Trine natal ${planet.name}`, points: 10 });
          break;
        }
      }
    }
  }

  const score = Math.min(100, Math.max(0, base));
  let band: ImpactBand;
  if (score >= 80) band = 'transformative';
  else if (score >= 60) band = 'high';
  else if (score >= 40) band = 'moderate';
  else if (score >= 20) band = 'low';
  else band = 'negligible';

  return {
    score,
    band,
    primary: band === 'transformative'
      ? 'A pivotal turning point'
      : band === 'high'
      ? 'A significant energetic shift'
      : band === 'moderate'
      ? 'A meaningful moment of change'
      : band === 'low'
      ? 'A subtle background influence'
      : 'A quiet cosmic whisper',
    factors,
  };
}

function buildInterpretationSimple(
  event: LunarEvent,
  impact: ImpactScore,
  moonSign: string,
): EventInterpretation {
  const isEclipse = event.type === 'eclipse';
  const phaseWord =
    event.type === 'new'
      ? 'New Moon'
      : event.type === 'full'
      ? 'Full Moon'
      : event.type === 'first_quarter'
      ? 'First Quarter'
      : event.type === 'last_quarter'
      ? 'Last Quarter'
      : isEclipse
      ? 'Eclipse'
      : 'Lunar event';

  const signQualities: Record<string, { theme: string; lean: string; watch: string }> = {
    Aries:       { theme: 'initiative and bold beginnings',       lean: 'Start something new with courage',                    watch: 'Impulsiveness or rushing decisions' },
    Taurus:      { theme: 'stability and material comfort',       lean: 'Build on solid foundations',                           watch: 'Stubbornness or resisting change' },
    Gemini:      { theme: 'communication and curiosity',          lean: 'Share ideas and make connections',                     watch: 'Scattered energy or superficiality' },
    Cancer:      { theme: 'emotional depth and nurturing',        lean: 'Honor your feelings and home life',                    watch: 'Moodiness or over-attachment' },
    Leo:         { theme: 'creativity and self-expression',       lean: 'Shine boldly and inspire others',                     watch: 'Ego conflicts or need for validation' },
    Virgo:       { theme: 'refinement and practical service',     lean: 'Organize, heal, and improve systems',                 watch: 'Perfectionism or harsh self-criticism' },
    Libra:       { theme: 'harmony and relationships',            lean: 'Seek balance and deepen partnerships',                watch: 'People-pleasing or indecisiveness' },
    Scorpio:     { theme: 'transformation and hidden truths',     lean: 'Dive deep and release what no longer serves you',     watch: 'Obsession or power struggles' },
    Sagittarius: { theme: 'expansion and higher meaning',         lean: 'Explore new horizons and seek wisdom',                watch: 'Over-promising or restlessness' },
    Capricorn:   { theme: 'ambition and long-term structure',     lean: 'Set goals and commit to your path',                   watch: 'Rigidity or excessive self-pressure' },
    Aquarius:    { theme: 'innovation and collective vision',     lean: 'Embrace unconventional ideas',                        watch: 'Emotional detachment or rebellion' },
    Pisces:      { theme: 'intuition and spiritual connection',   lean: 'Trust your inner guidance and create',                watch: 'Escapism or boundary dissolution' },
  };

  const sq = signQualities[moonSign] || {
    theme: 'change and reflection',
    lean: 'Stay open to new possibilities',
    watch: 'Avoid acting on assumptions',
  };

  const summary = isEclipse
    ? `This ${phaseWord} in ${moonSign} amplifies themes of ${sq.theme}. Eclipse energy accelerates transformation and can bring sudden revelations or shifts that unfold over months.`
    : `This ${phaseWord} in ${moonSign} highlights themes of ${sq.theme}. ${
        impact.band === 'transformative' || impact.band === 'high'
          ? 'This is a powerful moment for intentional action.'
          : 'A good time for quiet reflection and gentle adjustments.'
      }`;

  return {
    summary,
    leanInto: sq.lean,
    watchFor: sq.watch,
  };
}

// ── Backend response types ───────────────────────────────────────────────

interface BackendDay {
  date: string;
  day_num: number;
  weekday: number;
  in_month: boolean;
  phase_key: string;
  phase_name: string;
  moon_sign: string;
  illumination: number;
}

interface BackendPhaseEvent {
  key: 'new' | 'first_quarter' | 'full' | 'last_quarter';
  name: string;
  date: string;
  sun_longitude: number;
  moon_longitude: number;
  moon_sign: string;
  moon_sign_degree: number;
}

interface BackendEclipseEvent {
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

interface BackendMonthResponse {
  year: number;
  month: number;
  label: string;
  grid_start: string;
  grid_end: string;
  days: BackendDay[];
  phase_events: BackendPhaseEvent[];
  eclipse_events: BackendEclipseEvent[];
}

// ── Data enrichment ──────────────────────────────────────────────────────

function upcomingPhaseFromBackend(ev: BackendPhaseEvent): UpcomingPhase {
  const date = new Date(ev.date);
  const meta = MAJOR_PHASE_META[ev.key];
  return {
    key: ev.key,
    name: meta.name,
    emoji: meta.emoji,
    date,
    sunLon: ev.sun_longitude,
    moonLon: ev.moon_longitude,
    moonSign: ev.moon_sign,
    moonDegreeInSign: ev.moon_sign_degree,
    msUntil: 0,
  };
}

function eclipseRecordFromBackend(ev: BackendEclipseEvent): CalendarEclipseRecord {
  const peak = new Date(ev.peak);
  return {
    type: 'eclipse' as const,
    subtype: ev.subtype,
    date: peak,
    sunLon: ev.sun_longitude,
    moonLon: ev.moon_longitude,
    nodeLon: ev.node_longitude,
    nodeSide: ev.node_side,
    sunNodeSeparation: ev.separation,
    moonSign: ev.moon_sign,
    moonDegreeInSign: ev.moon_sign_degree,
    phaseKey: ev.phase_key,
    name: ev.name,
    influenceStart: new Date(ev.influence_start),
    peak,
    influenceEnd: new Date(ev.influence_end),
  };
}

function enrichPhase(phase: UpcomingPhase, natal: any): CalendarEvent {
  const event: LunarEvent = {
    type: phase.key,
    date: phase.date,
    sunLon: phase.sunLon,
    moonLon: phase.moonLon,
  };
  const impact = computeImpactSimple(event, natal);
  const interpretation = buildInterpretationSimple(event, impact, phase.moonSign);
  return { phase, event, impact, interpretation };
}

function enrichEclipse(e: CalendarEclipseRecord, natal: any): CalendarEclipse {
  const event: LunarEvent = {
    type: 'eclipse',
    subtype: e.subtype,
    date: e.date,
    sunLon: e.sunLon,
    moonLon: e.moonLon,
    nodeLon: e.nodeLon,
    nodeSide: e.nodeSide,
  };
  const impact = computeImpactSimple(event, natal);
  const interpretation = buildInterpretationSimple(event, impact, e.moonSign);
  return { eclipse: e, event, impact, interpretation };
}

async function fetchCalendarMonth(
  year: number,
  month: number,
  natal: any,
): Promise<CalendarMonth> {
  const resp: BackendMonthResponse = await api.getMonthlyCalendar({ year, month });

  const enrichedPhases = resp.phase_events.map((p) =>
    enrichPhase(upcomingPhaseFromBackend(p), natal ?? null),
  );
  const enrichedEclipses = resp.eclipse_events.map((e) =>
    enrichEclipse(eclipseRecordFromBackend(e), natal ?? null),
  );

  const days: CalendarDay[] = resp.days.map((d) => {
    const dayNoon = noonUtcFromIso(d.date);
    const phaseMatch = enrichedPhases.find((p) => sameUtcDay(p.phase.date, dayNoon));
    const eclipseMatch = enrichedEclipses.find((e) => sameUtcDay(e.eclipse.date, dayNoon));
    return {
      date: dayNoon,
      dayNum: d.day_num,
      weekday: d.weekday,
      inMonth: d.in_month,
      phase: bucketFromKey(d.phase_key),
      moonSign: d.moon_sign,
      illumination: d.illumination,
      phaseEvent: phaseMatch
        ? {
            key: phaseMatch.phase.key,
            name: phaseMatch.phase.name,
            emoji: phaseMatch.phase.emoji,
            atHour: phaseMatch.phase.date.getUTCHours(),
            enriched: phaseMatch,
          }
        : null,
      eclipseEvent: eclipseMatch
        ? {
            subtype: eclipseMatch.eclipse.subtype,
            name: eclipseMatch.eclipse.name,
            nodeSide: eclipseMatch.eclipse.nodeSide,
            separation: eclipseMatch.eclipse.sunNodeSeparation,
            enriched: eclipseMatch,
          }
        : null,
    };
  });

  const month0 = month - 1;
  const inThisMonth = (d: Date) =>
    d.getUTCFullYear() === year && d.getUTCMonth() === month0;
  const events = enrichedPhases.filter((p) => inThisMonth(p.phase.date));
  const eclipses = enrichedEclipses.filter((e) => inThisMonth(e.eclipse.date));

  return {
    year,
    month,
    label: resp.label,
    days,
    events,
    eclipses,
  };
}

// ═══════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════

export default function CalendarTab({ natalPositions }: CalendarTabProps) {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);
  const [monthData, setMonthData] = useState<CalendarMonth | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const natalKey = natalPositions
    ? JSON.stringify(natalPositions).slice(0, 80)
    : 'none';

  useEffect(() => {
    let active = true;
    setLoadError(null);
    setLoading(true);
    fetchCalendarMonth(year, month, natalPositions ?? null)
      .then((data) => {
        if (!active) return;
        setMonthData(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(err?.message ?? 'Failed to load calendar.');
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [year, month, natalKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Default selection: first in-month day with an event, else 1st of month
  const defaultSelection = useMemo(() => {
    if (!monthData) return 0;
    const firstEvent = monthData.days.findIndex(
      (d) => d.inMonth && (d.phaseEvent || d.eclipseEvent),
    );
    if (firstEvent >= 0) return firstEvent;
    return monthData.days.findIndex((d) => d.inMonth && d.dayNum === 1);
  }, [monthData]);

  const selected = monthData?.days[selectedDayIdx ?? defaultSelection] ?? null;

  const goPrev = useCallback(() => {
    const { year: y, month: m } = shiftMonth(year, month, -1);
    setYear(y);
    setMonth(m);
    setSelectedDayIdx(null);
  }, [year, month]);

  const goNext = useCallback(() => {
    const { year: y, month: m } = shiftMonth(year, month, 1);
    setYear(y);
    setMonth(m);
    setSelectedDayIdx(null);
  }, [year, month]);

  const goToday = useCallback(() => {
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
    setSelectedDayIdx(null);
  }, [today]);

  const isTodayView =
    year === today.getFullYear() && month === today.getMonth() + 1;

  const headerLabel =
    monthData?.label ??
    new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });

  return (
    <div className="flex flex-col min-h-0 w-full">
      {/* ── Month header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={goPrev}
          className="w-9 h-9 rounded-full flex items-center justify-center
                     bg-white/5 hover:bg-white/10 transition-colors text-text-primary text-2xl"
          aria-label="Previous month"
        >
          {'‹'}
        </button>

        <button
          onClick={goToday}
          className="flex flex-col items-center group"
        >
          <span className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
            {headerLabel}
          </span>
          {!isTodayView && (
            <span className="text-[10px] text-accent-primary mt-0.5">
              Tap to jump to today
            </span>
          )}
        </button>

        <button
          onClick={goNext}
          className="w-9 h-9 rounded-full flex items-center justify-center
                     bg-white/5 hover:bg-white/10 transition-colors text-text-primary text-2xl"
          aria-label="Next month"
        >
          {'›'}
        </button>
      </div>

      {/* ── Birth data banner ───────────────────────────────────── */}
      {!natalPositions && (
        <div className="mx-4 mb-2 bg-purple-500/10 border border-purple-500/25 rounded-lg px-3 py-2">
          <p className="text-xs text-accent-tertiary text-center">
            Add your birth data to see a personalized impact score for every event.
          </p>
        </div>
      )}

      {/* ── Weekday headers ─────────────────────────────────────── */}
      <div className="grid grid-cols-7 px-4 pb-1">
        {WEEKDAY_HEADERS.map((w, i) => (
          <div
            key={i}
            className="text-center text-[11px] font-bold tracking-wider text-text-muted"
          >
            {w}
          </div>
        ))}
      </div>

      {/* ── Loading state ───────────────────────────────────────── */}
      {loading && !loadError && (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── Error state ─────────────────────────────────────────── */}
      {loadError && (
        <div className="mx-4 mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/25">
          <p className="text-sm text-red-300 text-center">{loadError}</p>
        </div>
      )}

      {/* ── Day grid ────────────────────────────────────────────── */}
      {monthData && !loading && (
        <>
          <div className="px-4">
            <div className="grid grid-cols-7 gap-[2px]">
              {monthData.days.map((day, i) => {
                const isSelected = i === (selectedDayIdx ?? defaultSelection);
                const isToday =
                  day.inMonth &&
                  day.dayNum === today.getDate() &&
                  month === today.getMonth() + 1 &&
                  year === today.getFullYear();
                return (
                  <DayCell
                    key={day.date.toISOString()}
                    day={day}
                    isToday={isToday}
                    isSelected={isSelected}
                    onPress={() => setSelectedDayIdx(i)}
                  />
                );
              })}
            </div>
          </div>

          {/* ── Selected day detail ──────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8">
            {selected && <DayDetail day={selected} />}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════

function DayCell({
  day,
  isToday,
  isSelected,
  onPress,
}: {
  day: CalendarDay;
  isToday: boolean;
  isSelected: boolean;
  onPress: () => void;
}) {
  const hasEclipse = !!day.eclipseEvent;
  const hasPhase = !!day.phaseEvent;
  const impact =
    day.eclipseEvent?.enriched.impact ?? day.phaseEvent?.enriched.impact;
  const highTier =
    impact &&
    (impact.band === 'transformative' || impact.band === 'high');

  return (
    <button
      onClick={onPress}
      className={`
        relative flex flex-col items-center justify-start pt-1 rounded-lg
        border transition-all duration-150 cursor-pointer
        aspect-square min-h-[44px]
        ${!day.inMonth ? 'opacity-35' : ''}
        ${
          isSelected
            ? 'bg-accent-muted border-accent-primary'
            : isToday
            ? 'bg-purple-500/[0.06] border-transparent'
            : hasEclipse
            ? 'border-amber-500/50'
            : 'border-transparent hover:bg-white/5'
        }
        ${highTier && !isSelected ? 'shadow-lg' : ''}
      `}
      style={
        highTier && !isSelected
          ? { boxShadow: `0 0 12px ${bandToColor(impact!.band)}35` }
          : undefined
      }
    >
      {/* Day number */}
      <span
        className={`text-[11px] font-semibold leading-none ${
          day.inMonth ? 'text-text-secondary' : 'text-text-muted'
        }`}
      >
        {day.dayNum}
      </span>

      {/* Phase emoji */}
      {hasPhase && (
        <span className="text-lg leading-none mt-0.5">
          {day.phaseEvent!.emoji}
        </span>
      )}

      {/* Eclipse glyph */}
      {hasEclipse && (
        <span className="absolute right-0.5 bottom-0.5 text-sm text-amber-500">
          {day.eclipseEvent!.subtype.startsWith('solar') ? '☀' : '🌑'}
        </span>
      )}

      {/* Today dot */}
      {isToday && (
        <span className="absolute top-0.5 right-1 w-1 h-1 rounded-full bg-accent-primary" />
      )}
    </button>
  );
}

function DayDetail({ day }: { day: CalendarDay }) {
  return (
    <div>
      {/* Full date */}
      <h3 className="text-base font-bold text-text-primary mb-1">
        {formatFullDate(day.date)}
      </h3>

      {/* Phase state row */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{day.phase.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text-primary">{day.phase.name}</p>
          <p className="text-xs text-text-tertiary mt-0.5">
            Moon in {day.moonSign} &middot; {Math.round(day.illumination * 100)}% lit
          </p>
        </div>
      </div>

      {/* Phase event panel */}
      {day.phaseEvent && (
        <EventPanel
          title={`${day.phaseEvent.name} exact at ${day.phaseEvent.atHour
            .toString()
            .padStart(2, '0')}:00 UTC`}
          event={day.phaseEvent.enriched}
        />
      )}

      {/* Eclipse panel */}
      {day.eclipseEvent && (
        <EclipsePanel
          title={day.eclipseEvent.name}
          subtype={day.eclipseEvent.subtype}
          nodeSide={day.eclipseEvent.nodeSide}
          separation={day.eclipseEvent.separation}
          event={day.eclipseEvent.enriched}
        />
      )}

      {/* No event fallback */}
      {!day.phaseEvent && !day.eclipseEvent && (
        <div className="mt-3 bg-white/[0.03] border border-white/5 rounded-xl p-4">
          <p className="text-xs text-text-tertiary leading-5 text-center italic">
            No major lunar event today. The Moon moves through {day.moonSign}
            {day.illumination > 0.5
              ? ' in its brighter half of the cycle.'
              : ' in its quieter half of the cycle.'}
          </p>
        </div>
      )}
    </div>
  );
}

function EventPanel({
  title,
  event,
}: {
  title: string;
  event: CalendarEvent;
}) {
  const color = bandToColor(event.impact.band);
  return (
    <div
      className="bg-bg-card rounded-2xl p-4 border mt-3"
      style={{ borderColor: color + '55' }}
    >
      {/* Header with title + score */}
      <div className="flex items-start justify-between mb-1">
        <p className="text-sm font-bold text-text-primary flex-1 mr-2">
          {title}
        </p>
        <ScoreBadge score={event.impact.score} color={color} />
      </div>

      {/* Band label */}
      <p
        className="text-[10px] font-extrabold uppercase tracking-wider mt-0.5 mb-2"
        style={{ color }}
      >
        {bandLabel(event.impact.band)}
      </p>

      {/* Primary line */}
      <p className="text-xs text-accent-secondary italic mb-2">
        {event.impact.primary}
      </p>

      {/* Interpretation summary */}
      <p className="text-xs text-text-secondary leading-5 mb-2">
        {event.interpretation.summary}
      </p>

      {/* Lean into / Watch for */}
      <InterpLine label="Lean into" text={event.interpretation.leanInto} tone="good" />
      <InterpLine label="Watch for" text={event.interpretation.watchFor} tone="caution" />
    </div>
  );
}

function EclipsePanel({
  title,
  subtype,
  nodeSide,
  separation,
  event,
}: {
  title: string;
  subtype: string;
  nodeSide: 'north' | 'south';
  separation: number;
  event: CalendarEclipse;
}) {
  const color = bandToColor(event.impact.band);
  const nodeColor = nodeSide === 'north' ? '#9B6FF6' : '#FCC737';
  return (
    <div
      className="bg-bg-elevated rounded-2xl p-4 border mt-3"
      style={{ borderColor: color + '88' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex-1 mr-2">
          <p className="text-[10px] font-extrabold uppercase tracking-[1.2px] text-gold-primary mb-0.5">
            ECLIPSE
          </p>
          <p className="text-sm font-bold text-text-primary">{title}</p>
        </div>
        <ScoreBadge score={event.impact.score} color={color} />
      </div>

      {/* Node info row */}
      <div className="flex items-center gap-1.5 my-1">
        <span
          className="w-2 h-2 rounded-full inline-block"
          style={{ backgroundColor: nodeColor }}
        />
        <span className="text-[11px] text-text-tertiary">
          {nodeSide === 'north' ? 'North Node axis' : 'South Node axis'}
          {' '}&middot; {separation.toFixed(1)}&deg; from node
        </span>
      </div>

      {/* Band label */}
      <p
        className="text-[10px] font-extrabold uppercase tracking-wider mt-0.5 mb-2"
        style={{ color }}
      >
        {bandLabel(event.impact.band)}
      </p>

      {/* Primary + summary */}
      <p className="text-xs text-accent-secondary italic mb-2">
        {event.impact.primary}
      </p>
      <p className="text-xs text-text-secondary leading-5 mb-2">
        {event.interpretation.summary}
      </p>

      {/* Lean into / Watch for */}
      <InterpLine label="Lean into" text={event.interpretation.leanInto} tone="good" />
      <InterpLine label="Watch for" text={event.interpretation.watchFor} tone="caution" />

      {/* Influence window */}
      <div className="mt-3 pt-2 border-t border-white/[0.06]">
        <p className="text-[10px] text-text-muted uppercase tracking-[1px] mb-1 font-semibold">
          Influence window
        </p>
        <WindowRow label="Begins" date={event.eclipse.influenceStart} />
        <WindowRow label="Peak" date={event.eclipse.peak} emphasized />
        <WindowRow label="Fades" date={event.eclipse.influenceEnd} />
      </div>
    </div>
  );
}

function ScoreBadge({ score, color }: { score: number; color: string }) {
  return (
    <div
      className="min-w-[40px] py-1 px-2 rounded-lg border text-center ml-2"
      style={{
        borderColor: color,
        backgroundColor: color + '18',
      }}
    >
      <span
        className="text-sm font-extrabold tabular-nums"
        style={{ color }}
      >
        {score}
      </span>
    </div>
  );
}

function InterpLine({
  label,
  text,
  tone,
}: {
  label: string;
  text: string;
  tone: 'good' | 'caution';
}) {
  const colorClass = tone === 'good' ? 'text-emerald-300' : 'text-red-300';
  return (
    <div className="mt-2">
      <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${colorClass}`}>
        {label}
      </p>
      <p className="text-xs text-text-secondary leading-5">{text}</p>
    </div>
  );
}

function WindowRow({
  label,
  date,
  emphasized,
}: {
  label: string;
  date: Date;
  emphasized?: boolean;
}) {
  return (
    <div className="flex justify-between py-0.5">
      <span
        className={`text-xs ${
          emphasized ? 'text-gold-primary font-bold' : 'text-text-tertiary'
        }`}
      >
        {label}
      </span>
      <span
        className={`text-xs tabular-nums ${
          emphasized ? 'text-text-primary font-bold' : 'text-text-secondary'
        }`}
      >
        {formatShortDate(date)}
      </span>
    </div>
  );
}
