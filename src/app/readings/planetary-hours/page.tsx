'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
  calculatePlanetaryHours,
  toHourSegments,
  RULERS,
  PLANET_HOUR_GLYPHS,
  PLANET_HOUR_COLORS,
  PLANET_HOUR_MEANINGS,
} from '@/lib/planetaryHours';
import type { PlanetaryHoursResult, CustomPlanet } from '@/lib/planetaryHours';

// ── Dynamic component imports ──
const CurrentHourHero = dynamic(() => import('@/components/planetaryHours/CurrentHourHero'));
const DaySummary = dynamic(() => import('@/components/planetaryHours/DaySummary'));
const HoursTable = dynamic(() => import('@/components/planetaryHours/HoursTable'));

// ── Helpers ──

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateLabel(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Calendar Modal ──

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function CalendarModal({
  visible,
  selectedDate,
  onClose,
  onSelect,
}: {
  visible: boolean;
  selectedDate: Date;
  onClose: () => void;
  onSelect: (d: Date) => void;
}) {
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  useEffect(() => {
    if (visible) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [visible, selectedDate]);

  const shiftMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    while (m < 0) { m += 12; y -= 1; }
    while (m > 11) { m -= 12; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  };

  if (!visible) return null;

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const today = new Date();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Card */}
      <div
        className="relative z-10 bg-bg-secondary rounded-2xl border border-accent-muted p-5 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Month/Year header */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-bg-tertiary text-accent-secondary font-bold hover:bg-bg-tertiary/80 transition-colors"
          >
            ◀
          </button>
          <h3 className="text-base font-bold text-text-primary">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h3>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-bg-tertiary text-accent-secondary font-bold hover:bg-bg-tertiary/80 transition-colors"
          >
            ▶
          </button>
        </div>

        {/* Year jump row */}
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            type="button"
            onClick={() => setViewYear(viewYear - 1)}
            className="text-xs font-semibold text-accent-secondary hover:underline"
          >
            ‹ {viewYear - 1}
          </button>
          <span className="text-xs text-text-muted">Jump Year</span>
          <button
            type="button"
            onClick={() => setViewYear(viewYear + 1)}
            className="text-xs font-semibold text-accent-secondary hover:underline"
          >
            {viewYear + 1} ›
          </button>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAY_SHORT.map((w, i) => (
            <div key={i} className="text-center text-xs font-bold text-text-muted py-1">
              {w}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={i} className="aspect-square" />;
            }
            const cellDate = new Date(viewYear, viewMonth, day);
            const isSelected = isSameDay(cellDate, selectedDate);
            const isTodayCell = isSameDay(cellDate, today);

            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelect(cellDate)}
                className={`
                  aspect-square flex items-center justify-center text-sm rounded-full
                  transition-colors cursor-pointer
                  ${isSelected
                    ? 'bg-accent-primary text-white font-bold'
                    : isTodayCell
                      ? 'border border-accent-secondary text-accent-secondary font-bold'
                      : 'text-text-secondary hover:bg-bg-tertiary'
                  }
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Jump to Today link */}
        <div className="mt-3 pt-3 border-t border-border-primary text-center">
          <button
            type="button"
            onClick={() => onSelect(new Date())}
            className="text-sm font-semibold text-accent-secondary hover:underline cursor-pointer"
          >
            Jump to Today
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Legend Section ──

function LegendSection() {
  return (
    <div className="bg-bg-secondary rounded-2xl p-5 border border-border-primary">
      <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">
        Galactic Clock — 12 Rulers
      </h3>
      <p className="text-xs text-text-muted italic mb-4 leading-relaxed">
        The Galactic Clock cycles through all 12 rulers in order: Mars, Venus,
        Mercury, Moon, Sun, Vesta, Juno, Pluto, Jupiter, Saturn, Uranus, Neptune
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from(RULERS).map((planet) => {
          const meaning = PLANET_HOUR_MEANINGS[planet];
          return (
            <div key={planet} className="flex items-center gap-2">
              <span
                className="text-xl"
                style={{ color: PLANET_HOUR_COLORS[planet] }}
              >
                {PLANET_HOUR_GLYPHS[planet]}
              </span>
              <div>
                <p className="text-sm font-semibold text-text-primary">{planet}</p>
                <p className="text-xs text-text-muted">{meaning.sign}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Skeleton Placeholder ──

function ContentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Sunrise/sunset skeleton */}
      <div className="flex gap-4">
        <div className="flex-1 bg-bg-secondary rounded-2xl border border-border-primary p-4 text-center">
          <div className="h-3 w-16 mx-auto bg-bg-tertiary rounded mb-2" />
          <div className="h-5 w-20 mx-auto bg-bg-tertiary rounded" />
        </div>
        <div className="flex-1 bg-bg-secondary rounded-2xl border border-border-primary p-4 text-center">
          <div className="h-3 w-16 mx-auto bg-bg-tertiary rounded mb-2" />
          <div className="h-5 w-20 mx-auto bg-bg-tertiary rounded" />
        </div>
      </div>
      {/* Current hour skeleton */}
      <div className="rounded-2xl p-6 border border-border-accent bg-bg-secondary">
        <div className="h-4 w-44 bg-bg-tertiary rounded mb-4" />
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-bg-tertiary rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-28 bg-bg-tertiary rounded" />
            <div className="h-4 w-40 bg-bg-tertiary rounded" />
          </div>
        </div>
      </div>
      {/* Day summary skeleton */}
      <div className="bg-bg-secondary rounded-2xl p-5 border border-border-primary space-y-3">
        <div className="h-5 w-36 bg-bg-tertiary rounded" />
        <div className="h-3 w-56 bg-bg-tertiary rounded" />
        <div className="space-y-2 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 bg-bg-tertiary rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──

export default function PlanetaryHoursPage() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());

  const latitude = profile?.latitude;
  const longitude = profile?.longitude;
  const hasLocation = latitude != null && longitude != null;

  const isToday = isSameDay(selectedDate, new Date());

  // Calculate planetary hours (fully client-side)
  const result: PlanetaryHoursResult | null = useMemo(() => {
    if (!hasLocation) return null;
    return calculatePlanetaryHours(selectedDate, latitude!, longitude!, now);
  }, [selectedDate, latitude, longitude, now, hasLocation]);

  // 60-second refresh when viewing today
  useEffect(() => {
    if (!isToday) return;

    const id = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(id);
  }, [isToday]);

  // Date navigation
  const goToPrevDay = useCallback(() => {
    setSelectedDate((prev) => new Date(prev.getTime() - 86400000));
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDate((prev) => new Date(prev.getTime() + 86400000));
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(new Date());
    setNow(new Date());
  }, []);

  const handleCalendarSelect = useCallback((d: Date) => {
    setSelectedDate(d);
    setShowCalendar(false);
    if (isSameDay(d, new Date())) {
      setNow(new Date());
    }
  }, []);

  // Compute duration labels
  const dayDurationLabel = result
    ? Math.round((result.sunset.getTime() - result.sunrise.getTime()) / (12 * 60000)) + 'm each'
    : '';
  const nightDurationLabel = result
    ? Math.round((result.nextSunrise.getTime() - result.sunset.getTime()) / (12 * 60000)) + 'm each'
    : '';

  // Convert PlanetaryHourSlots to HourSegments for child components
  const daySegments = result ? toHourSegments(result.dayHours, 'day') : [];
  const nightSegments = result ? toHourSegments(result.nightHours, 'night') : [];

  // No location fallback
  if (!hasLocation) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
          <ArrowLeft className="w-4 h-4" />
          {t('readings.backToReadings')}
        </Link>
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-text-primary">{t('readings.planetaryHoursPage.title')}</h1>
          <p className="text-text-tertiary text-sm mt-1">{t('readings.planetaryHoursPage.subtitle')}</p>
        </div>
        <div className="bg-bg-secondary rounded-2xl p-6 border border-border-primary text-center space-y-3">
          <p className="text-4xl">🌍</p>
          <h3 className="text-lg font-semibold text-text-primary">Birth Location Required</h3>
          <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
            Planetary hours are calculated based on your birth location&apos;s latitude and
            longitude. Please complete your profile with a birth location to use this feature.
          </p>
          <a
            href="/profile/edit"
            className="inline-block mt-2 px-5 py-2 rounded-full bg-accent-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Complete Profile
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        {t('readings.backToReadings')}
      </Link>
      {/* ── 1. Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-text-primary">{t('readings.planetaryHoursPage.title')}</h1>
        <p className="text-text-tertiary text-sm mt-1">{t('readings.planetaryHoursPage.subtitle')}</p>
      </div>

      {/* ── 2. Date Navigation Bar ── */}
      <div className="bg-bg-secondary rounded-2xl p-4 flex items-center justify-between border border-border-primary mb-4">
        {/* Prev day */}
        <button
          type="button"
          onClick={goToPrevDay}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-tertiary text-accent-secondary font-bold hover:bg-bg-tertiary/80 transition-colors shrink-0 cursor-pointer"
          aria-label="Previous day"
        >
          ◀
        </button>

        {/* Date label (tappable to open calendar) */}
        <button
          type="button"
          onClick={() => setShowCalendar(true)}
          className="flex-1 text-center px-3 cursor-pointer"
        >
          <p className="text-sm font-semibold text-text-primary">
            {formatDateLabel(selectedDate)}
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            {isToday ? 'Today — tap to change' : 'Tap to change date'}
          </p>
        </button>

        {/* Next day */}
        <button
          type="button"
          onClick={goToNextDay}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-tertiary text-accent-secondary font-bold hover:bg-bg-tertiary/80 transition-colors shrink-0 cursor-pointer"
          aria-label="Next day"
        >
          ▶
        </button>
      </div>

      {/* Jump to Today pill */}
      {!isToday && (
        <div className="flex justify-center mb-4">
          <button
            type="button"
            onClick={goToToday}
            className="px-5 py-1.5 rounded-full bg-accent-muted text-accent-secondary text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
          >
            Jump to Today
          </button>
        </div>
      )}

      {/* ── 3. Calendar Modal ── */}
      <CalendarModal
        visible={showCalendar}
        selectedDate={selectedDate}
        onClose={() => setShowCalendar(false)}
        onSelect={handleCalendarSelect}
      />

      {/* ── 4. Content ── */}
      {!result ? (
        <ContentSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Current Hour Hero (sunrise/sunset, day ruler, current hour card) */}
          <CurrentHourHero result={result} loading={false} />

          {/* Day Summary */}
          <DaySummary
            dayHours={daySegments}
            nightHours={nightSegments}
            isToday={isToday}
          />

          {/* Day Hours Table */}
          <HoursTable
            title="Day Hours"
            icon="☀️"
            hours={daySegments}
            durationLabel={dayDurationLabel}
          />

          {/* Night Hours Table */}
          <HoursTable
            title="Night Hours"
            icon="🌙"
            hours={nightSegments}
            durationLabel={nightDurationLabel}
          />

          {/* ── 5. Legend ── */}
          <LegendSection />
        </div>
      )}
    </div>
  );
}
