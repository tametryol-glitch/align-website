'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import StorylineView from '@/components/transits/StorylineView';
import {
  PLANET_CARD_THEMES,
  ASPECT_SYMBOLS,
  getTransitCycleTitle,
  getTransitCycleMeaning,
  getTransitNavigationAdvice,
  getCycleProgress,
  PLANET_GLYPHS,
} from '@/lib/transitData';
import {
  groupPeaksIntoStorylines,
  type TransitStoryline,
} from '@/lib/transitStorylines';

// ─── Types ───────────────────────────────────────────────────────────────

interface TransitEvent {
  date: string;
  transiting_planet: string;
  natal_planet: string;
  aspect_type: string;
  aspect_name?: string;
  orb?: number;
  description?: string;
  title?: string;
  preview?: string;
  full_reading?: string;
  intensity?: 'low' | 'medium' | 'high';
  category?: string;
  separating?: boolean;
  days_remaining?: number;
  is_retrograde?: boolean;
  transit_sign?: string;
  natal_sign?: string;
}

// ─── Category Colors ─────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  love: '#EC4899',
  career: '#F59E0B',
  growth: '#10B981',
  challenge: '#EF4444',
  spiritual: '#8B5CF6',
  communication: '#3B82F6',
  energy: '#F97316',
};

// ─── Detail Panel ────────────────────────────────────────────────────────

function TransitDetail({
  event,
  firstName,
  onClose,
}: {
  event: TransitEvent;
  firstName: string;
  onClose: () => void;
}) {
  const progress = getCycleProgress(event);
  const catColor = CATEGORY_COLORS[event.category || 'growth'] || '#10B981';
  const planetTheme = PLANET_CARD_THEMES[event.transiting_planet] || PLANET_CARD_THEMES.Jupiter;
  const title = event.title || getTransitCycleTitle(event.transiting_planet, event.natal_planet, event.aspect_type);
  const meaning = event.full_reading || event.preview || getTransitCycleMeaning(event.transiting_planet, event.natal_planet, event.aspect_type, firstName);
  const advice = getTransitNavigationAdvice(event.transiting_planet, event.natal_planet, event.aspect_type, firstName);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl mx-auto my-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-bg-card rounded-2xl border border-white/10 overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full text-left px-6 pt-5 pb-2 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            &larr; Back to Cycles
          </button>

          {/* Progress ring */}
          <div className="flex justify-center py-6">
            <div
              className="w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center"
              style={{ borderColor: catColor }}
            >
              <span className="text-2xl font-bold" style={{ color: catColor }}>
                {Math.round(progress)}%
              </span>
              <span className="text-[10px] text-text-muted uppercase tracking-wider">active</span>
            </div>
          </div>

          {/* Status row */}
          <div className="flex items-center justify-center gap-3 pb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: catColor }} />
              <span className="text-xs font-medium" style={{ color: catColor }}>
                {(event.category || 'growth').charAt(0).toUpperCase() + (event.category || 'growth').slice(1)}
              </span>
            </div>
            <span className="text-text-muted text-xs">&bull;</span>
            <span
              className="text-xs font-medium"
              style={{ color: event.separating ? '#F59E0B' : '#10B981' }}
            >
              {event.separating ? '↘ Separating' : '↗ Approaching'}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-display font-bold text-text-primary text-center px-6 pb-3">
            {title}
          </h2>

          {/* Transit info row */}
          <div className="flex items-center justify-center gap-2 pb-4">
            <span className="text-lg" style={{ color: planetTheme.accent }}>
              {PLANET_GLYPHS[event.transiting_planet] || ''}
            </span>
            <span className="text-sm text-text-secondary">{event.transiting_planet}</span>
            <span className="text-base" style={{ color: planetTheme.glow }}>
              {ASPECT_SYMBOLS[event.aspect_type?.toLowerCase()] || ''}
            </span>
            <span className="text-lg" style={{ color: planetTheme.accent }}>
              {PLANET_GLYPHS[event.natal_planet] || ''}
            </span>
            <span className="text-sm text-text-secondary">{event.natal_planet}</span>
          </div>

          {/* Timing progress bar */}
          <div className="px-6 pb-2">
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  background: `linear-gradient(90deg, ${catColor}, ${catColor}66)`,
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[11px] text-text-muted">
                {progress >= 85
                  ? 'Near exact — strongest influence'
                  : progress >= 60
                  ? 'Strongly active'
                  : progress >= 40
                  ? 'Building momentum'
                  : 'Entering awareness'}
              </span>
              <span className="text-[11px] text-text-muted">
                {(event.days_remaining ?? 0) <= 1
                  ? 'Less than a day left'
                  : (event.days_remaining ?? 0) <= 7
                  ? `${event.days_remaining} days left`
                  : (event.days_remaining ?? 0) <= 30
                  ? `~${Math.round((event.days_remaining ?? 0) / 7)} weeks left`
                  : (event.days_remaining ?? 0) <= 365
                  ? `~${Math.round((event.days_remaining ?? 0) / 30)} months left`
                  : `${Math.round((event.days_remaining ?? 0) / 365)}+ years`}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 my-4 border-t border-white/10" />

          {/* Cycle Meaning */}
          <div className="px-6 pb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              What This Cycle Means for You
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
              {meaning}
            </p>
          </div>

          <div className="mx-6 my-2 border-t border-white/10" />

          {/* Navigation Advice */}
          <div className="px-6 pb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              How to Navigate This
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
              {advice}
            </p>
          </div>

          <div className="mx-6 my-2 border-t border-white/10" />

          {/* Technical Details */}
          <div className="px-6 pb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
              Technical Details
            </h3>
            <div className="space-y-2">
              {[
                ['Transit', `${event.transiting_planet} ${event.aspect_type} ${event.natal_planet}`],
                ['Current Orb', event.orb != null ? `${typeof event.orb === 'number' ? event.orb.toFixed(1) : event.orb}°` : '—'],
                ['Direction', event.separating ? 'Separating (moving away from exact)' : 'Applying (moving toward exact)'],
                ['Intensity', event.intensity === 'high' ? 'Major (outer planet)' : event.intensity === 'medium' ? 'Moderate' : 'Minor'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-text-muted">{label}</span>
                  <span className="text-text-secondary">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Transit Event Card ──────────────────────────────────────────────────

function TransitCard({
  event,
  firstName,
  onClick,
}: {
  event: TransitEvent;
  firstName: string;
  onClick: () => void;
}) {
  const planetTheme = PLANET_CARD_THEMES[event.transiting_planet] || PLANET_CARD_THEMES.Jupiter;
  const progress = getCycleProgress(event);
  const isActive = progress >= 50;
  const catColor = CATEGORY_COLORS[event.category || 'growth'] || '#10B981';
  const transitGlyph = PLANET_GLYPHS[event.transiting_planet] || '';
  const title = event.title || getTransitCycleTitle(event.transiting_planet, event.natal_planet, event.aspect_type);
  const previewText =
    event.preview ||
    event.description ||
    getTransitCycleMeaning(event.transiting_planet, event.natal_planet, event.aspect_type, firstName).slice(0, 150) + '...';

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl overflow-hidden transition-transform hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
    >
      <div
        className="relative p-5"
        style={{
          background: `linear-gradient(135deg, ${planetTheme.gradient[0]}, ${planetTheme.gradient[1]}, ${planetTheme.gradient[2]})`,
        }}
      >
        {/* Large background glyph */}
        <span
          className="absolute top-2 right-4 text-[80px] leading-none pointer-events-none select-none"
          style={{ color: planetTheme.glow + '12' }}
        >
          {transitGlyph}
        </span>

        {/* Glow bar at top */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ backgroundColor: planetTheme.glow }}
        />

        {/* Category + Status row */}
        <div className="flex items-center gap-2 mb-3 relative z-10">
          {/* Category pill */}
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border"
            style={{
              backgroundColor: catColor + '33',
              borderColor: catColor + '66',
              color: catColor,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: catColor }}
            />
            {(event.category || 'growth').charAt(0).toUpperCase() + (event.category || 'growth').slice(1)}
          </span>

          {/* Status pill */}
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
            style={{
              backgroundColor: isActive ? '#10B98122' : '#F59E0B22',
              color: isActive ? '#10B981' : '#F59E0B',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: isActive ? '#10B981' : '#F59E0B' }}
            />
            {isActive ? 'Active Now' : 'Approaching'}
          </span>
        </div>

        {/* Transit signature row: planet glyph + aspect symbol + natal planet glyph + orb */}
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <span className="text-xl" style={{ color: planetTheme.accent }}>
            {transitGlyph}
          </span>
          <span className="text-base" style={{ color: planetTheme.glow }}>
            {ASPECT_SYMBOLS[event.aspect_type?.toLowerCase()] || ''}
          </span>
          <span className="text-xl" style={{ color: planetTheme.accent }}>
            {PLANET_GLYPHS[event.natal_planet] || ''}
          </span>
          <span className="text-xs text-white/40 ml-1">
            ({event.orb != null ? (typeof event.orb === 'number' ? event.orb.toFixed(1) : event.orb) : '?'}&deg;)
          </span>
        </div>

        {/* Dynamic headline title */}
        <h3 className="text-lg font-display font-bold text-white mb-1 relative z-10 leading-snug">
          {title}
        </h3>

        {/* Transit subtitle */}
        <p className="text-sm text-white/60 mb-3 relative z-10">
          {event.transiting_planet} {event.aspect_type} your {event.natal_planet}
        </p>

        {/* Preview text snippet */}
        <p className="text-sm text-white/50 line-clamp-2 mb-4 relative z-10 leading-relaxed">
          {previewText}
        </p>

        {/* Progress bar with gradient fill */}
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-3 relative z-10">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(progress, 100)}%`,
              background: `linear-gradient(90deg, ${planetTheme.glow}, ${planetTheme.accent})`,
            }}
          />
        </div>

        {/* Footer: Separating/Approaching + percentage */}
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span
            className="text-xs font-medium"
            style={{ color: event.separating ? '#F59E0B' : '#10B981' }}
          >
            {event.separating ? '↘ Separating' : '↗ Approaching'}
          </span>
          <span className="text-xs font-semibold" style={{ color: planetTheme.accent }}>
            {Math.round(progress)}%
          </span>
        </div>

        {/* Read more link */}
        <p className="text-xs relative z-10" style={{ color: planetTheme.accent }}>
          Tap to read your full insight &rarr;
        </p>
      </div>
    </button>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────

export default function TransitsPage() {
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<TransitEvent[]>([]);
  const [viewMode, setViewMode] = useState<'cycles' | 'storylines'>('cycles');
  const [detailIndex, setDetailIndex] = useState<number | null>(null);

  // Storylines state
  const [storylines, setStorylines] = useState<TransitStoryline[]>([]);
  const [storylinesLoading, setStorylinesLoading] = useState(false);
  const [storylinesError, setStorylinesError] = useState<string | null>(null);
  const storylinesLoadedRef = useRef(false);
  const nowRef = useRef(new Date());

  if (!profile?.birth_date || !profile?.latitude) {
    return <BirthDataPrompt message="Add your birth data to see your current transits." />;
  }

  const firstName = (profile.display_name || '').split(' ')[0] || 'Stargazer';

  // ── Load transit events on mount ──────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const birthData = buildBirthData(profile!);
      const now = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const [, eventsRes] = await Promise.all([
        api.getCurrentTransits(birthData),
        api.getTransitEvents({
          birth_data: birthData,
          start_date: now.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        }),
      ]);

      // Normalize aspect_name -> aspect_type
      const rawEvents: any[] = eventsRes?.events || [];
      const normalizedEvents: TransitEvent[] = rawEvents.map((e: any) => ({
        ...e,
        aspect_type: e.aspect_type || e.aspect_name || '',
      }));

      // Collapse multi-pass aspects to one card per triple.
      // Outer planets aspect a natal point 1, 3, or 5 times across a
      // retrograde cycle (direct, retro, direct). Group on
      // (transiting_planet, natal_planet, aspect_type) and keep the
      // soonest upcoming hit so the Cycles view tells one story per aspect.
      const todayMs = Date.now();
      const byTriple = new Map<string, TransitEvent>();
      for (const e of normalizedEvents) {
        const key = `${e.transiting_planet}|${e.natal_planet}|${(e.aspect_type || '').toLowerCase()}`;
        const existing = byTriple.get(key);
        if (!existing) {
          byTriple.set(key, e);
          continue;
        }
        const eMs = new Date(e.date).getTime();
        const existMs = new Date(existing.date).getTime();
        const eFuture = eMs >= todayMs;
        const existFuture = existMs >= todayMs;
        const replace =
          eFuture && !existFuture
            ? true
            : !eFuture && existFuture
            ? false
            : eFuture
            ? eMs < existMs   // both future: keep soonest
            : eMs > existMs;  // both past: keep most recent
        if (replace) byTriple.set(key, e);
      }

      const dedupedEvents = Array.from(byTriple.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      setEvents(dedupedEvents);
    } catch (err: any) {
      setError(err.message || 'Failed to load transits');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Lazy-load storylines on tab switch ─────────────────────────────────
  useEffect(() => {
    if (viewMode !== 'storylines') return;
    if (!profile) return;
    if (storylinesLoadedRef.current) return;

    let cancelled = false;
    (async () => {
      setStorylinesLoading(true);
      setStorylinesError(null);
      try {
        const birthData = buildBirthData(profile!);
        const now = new Date();
        const end = new Date();
        end.setMonth(end.getMonth() + 12);
        const eventsRes = await api.getTransitEvents({
          birth_data: birthData,
          start_date: now.toISOString().split('T')[0],
          end_date: end.toISOString().split('T')[0],
        });
        if (cancelled) return;
        const rawEvents: any[] = eventsRes?.events || [];
        const arcs = groupPeaksIntoStorylines(
          rawEvents.map((e: any) => ({
            date: e.date,
            transiting_planet: e.transiting_planet,
            natal_planet: e.natal_planet,
            aspect_type: e.aspect_type || e.aspect_name || '',
            orb: e.orb,
            is_retrograde: e.is_retrograde,
            transit_sign: e.transit_sign,
            natal_sign: e.natal_sign,
            intensity: e.intensity,
            category: e.category,
          })),
          nowRef.current,
        );
        setStorylines(arcs);
        storylinesLoadedRef.current = true;
      } catch (err: any) {
        if (cancelled) return;
        setStorylinesError(err?.message || 'Failed to load storylines');
      } finally {
        if (!cancelled) setStorylinesLoading(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, profile]);

  // ── Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return <LoadingCosmic label="Calculating your transits..." />;
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <button onClick={loadData} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <h1 className="text-2xl font-display font-bold text-text-primary mt-2">
        Your Cycles
      </h1>
      <p className="text-text-muted text-sm mb-5 leading-relaxed">
        {firstName}, these are the cycles moving through your life right now.
        Think of them like seasons &mdash; each one brings its own energy, its
        own lessons, and its own opportunities.
      </p>

      {/* ── View Mode Toggle ───────────────────────────────────────── */}
      <div className="flex bg-bg-card rounded-full p-1 mb-6">
        <button
          onClick={() => setViewMode('cycles')}
          className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
            viewMode === 'cycles'
              ? 'bg-accent-primary text-white shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          Active Now
        </button>
        <button
          onClick={() => setViewMode('storylines')}
          className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
            viewMode === 'storylines'
              ? 'bg-accent-primary text-white shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          Storylines
        </button>
      </div>

      {/* ── Storylines View ────────────────────────────────────────── */}
      {viewMode === 'storylines' && (
        <StorylineView
          storylines={storylines}
          loading={storylinesLoading}
          error={storylinesError}
          now={nowRef.current}
        />
      )}

      {/* ── Cycles (Active Now) View ───────────────────────────────── */}
      {viewMode === 'cycles' && (
        <>
          {/* Active Now indicator */}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Impacting You Now
            </span>
          </div>

          {/* Event cards */}
          {events.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-text-muted text-sm">
                No active cycles found. Check back soon.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event, index) => (
                <TransitCard
                  key={`${event.transiting_planet}-${event.aspect_type}-${event.natal_planet}`}
                  event={event}
                  firstName={firstName}
                  onClick={() => setDetailIndex(index)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Detail Overlay ─────────────────────────────────────────── */}
      {detailIndex !== null && events[detailIndex] && (
        <TransitDetail
          event={events[detailIndex]}
          firstName={firstName}
          onClose={() => setDetailIndex(null)}
        />
      )}
    </div>
  );
}
