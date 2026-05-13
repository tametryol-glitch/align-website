'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/stores/authStore';
import { api, buildBirthData } from '@/lib/api';
import { calculateNatalMoonPhase, buildNatalPhaseReading } from '@/lib/moonPhases';
import { PaywallGate } from '@/components/ui/PaywallGate';
import Link from 'next/link';

const TodayTab = dynamic(() => import('@/components/moonPhases/TodayTab'));
const CalendarTab = dynamic(() => import('@/components/moonPhases/CalendarTab'));
const ForecastTab = dynamic(() => import('@/components/moonPhases/ForecastTab'));
const EclipsesTab = dynamic(() => import('@/components/moonPhases/EclipsesTab'));

type TabKey = 'today' | 'calendar' | 'forecast' | 'eclipses' | 'birth';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'forecast', label: 'Forecast' },
  { key: 'eclipses', label: 'Eclipses' },
  { key: 'birth', label: 'Birth Moon' },
];

export default function MoonPhasesPage() {
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [natalChart, setNatalChart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasBirthData = !!(profile?.birth_date && profile?.birth_time && profile?.latitude);

  // Fetch natal chart on mount when birth data is available
  useEffect(() => {
    if (!hasBirthData || !profile) return;
    let cancelled = false;

    async function fetchChart() {
      setLoading(true);
      setError('');
      try {
        const data = await api.getNatalChart(buildBirthData(profile));
        if (!cancelled) setNatalChart(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load natal chart');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchChart();
    return () => { cancelled = true; };
  }, [hasBirthData, profile?.birth_date, profile?.birth_time, profile?.latitude]);

  // Build a NatalChart-shaped object from the API response.
  // The API returns "positions" but every service expects "planets".
  const natalPositions = useMemo(() => {
    if (!natalChart) return null;
    return {
      planets: natalChart.positions || natalChart.planets || [],
      aspects: natalChart.aspects || [],
      houses: natalChart.houses || [],
      ascendant: natalChart.ascendant || 0,
      midheaven: natalChart.midheaven || 0,
    };
  }, [natalChart]);

  // Compute natal moon phase from the mapped chart (uses .planets)
  const natalPhase = useMemo(
    () => calculateNatalMoonPhase(natalPositions),
    [natalPositions],
  );

  const reading = useMemo(
    () => (natalPhase ? buildNatalPhaseReading(natalPhase) : null),
    [natalPhase],
  );

  return (
    <PaywallGate feature="moon_phases" fallbackTier="light">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🌙</span>
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">
              Moon Phases & Eclipses
            </h1>
            <p className="text-text-tertiary text-sm">
              Track lunar cycles, eclipses, and your birth moon phase
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-tertiary text-text-tertiary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'today' && <TodayTab natalPositions={natalPositions} />}
        {activeTab === 'calendar' && <CalendarTab natalPositions={natalPositions} />}
        {activeTab === 'forecast' && <ForecastTab natalPositions={natalPositions} />}
        {activeTab === 'eclipses' && <EclipsesTab natalPositions={natalPositions} />}
        {activeTab === 'birth' && (
          <BirthMoonContent
            hasBirthData={hasBirthData}
            loading={loading}
            error={error}
            natalPhase={natalPhase}
            reading={reading}
          />
        )}
      </div>
    </PaywallGate>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Birth Moon Tab — inline
// ═══════════════════════════════════════════════════════════════════

interface BirthMoonContentProps {
  hasBirthData: boolean;
  loading: boolean;
  error: string;
  natalPhase: any;
  reading: any;
}

function BirthMoonContent({ hasBirthData, loading, error, natalPhase, reading }: BirthMoonContentProps) {
  // No birth data — show CTA
  if (!hasBirthData) {
    return (
      <div className="bg-bg-secondary rounded-2xl p-8 text-center">
        <span className="text-6xl block mb-4">🌑</span>
        <h2 className="text-xl font-display font-bold text-text-primary mb-3">
          We need your birth chart first
        </h2>
        <p className="text-text-tertiary mb-6 max-w-md mx-auto">
          Your birth Moon phase is calculated from your natal Sun and Moon
          positions. Complete your profile with birth date, time, and
          location to unlock this reading.
        </p>
        <Link
          href="/onboarding"
          className="btn-primary inline-block px-6 py-3 rounded-xl font-medium"
        >
          Complete Profile
        </Link>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-bg-secondary rounded-2xl p-8 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 rounded-full bg-bg-tertiary mx-auto mb-4" />
          <div className="h-6 bg-bg-tertiary rounded w-48 mx-auto mb-3" />
          <div className="h-4 bg-bg-tertiary rounded w-64 mx-auto" />
        </div>
        <p className="text-text-muted text-sm mt-4">Calculating your birth moon phase...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-bg-secondary rounded-2xl p-8 text-center">
        <span className="text-4xl block mb-3">⚠️</span>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  // No data yet
  if (!natalPhase || !reading) {
    return (
      <div className="bg-bg-secondary rounded-2xl p-8 text-center">
        <span className="text-5xl block mb-4">🌙</span>
        <p className="text-text-muted">Unable to compute birth moon phase from chart data.</p>
      </div>
    );
  }

  const illumPct = Math.round(natalPhase.illumination * 100);

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div
        className="rounded-2xl p-8 border border-purple-500/30 text-center"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.28), rgba(139,92,246,0.06))' }}
      >
        <span className="text-7xl block mb-3">{natalPhase.emoji}</span>
        <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
          {natalPhase.name}
        </h2>
        <p className="text-purple-300 italic text-base">{reading.headline}</p>

        {/* Stats row */}
        <div className="flex justify-around mt-6 pt-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-text-primary font-bold">{natalPhase.moonSign || '—'}</p>
            <p className="text-text-muted text-xs uppercase tracking-wide mt-1">Moon Sign</p>
          </div>
          <div className="text-center">
            <p className="text-text-primary font-bold">
              {natalPhase.moonHouse ? String(natalPhase.moonHouse) : '—'}
            </p>
            <p className="text-text-muted text-xs uppercase tracking-wide mt-1">Moon House</p>
          </div>
          <div className="text-center">
            <p className="text-text-primary font-bold">{illumPct}%</p>
            <p className="text-text-muted text-xs uppercase tracking-wide mt-1">Illumination</p>
          </div>
        </div>
      </div>

      {/* In one breath */}
      <Section title="In one breath">
        <p className="text-text-secondary leading-relaxed">{reading.summary}</p>
      </Section>

      {/* Your emotional nature */}
      <Section title="Your emotional nature">
        {reading.characterLong.split('\n\n').map((paragraph: string, i: number) => (
          <p key={i} className="text-text-secondary leading-relaxed mb-3 last:mb-0">
            {paragraph}
          </p>
        ))}
      </Section>

      {/* How you process emotion */}
      <Section title="How you process emotion">
        <p className="text-text-secondary leading-relaxed">{reading.emotionalRhythm}</p>
      </Section>

      {/* Strengths / Shadow side-by-side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-bg-secondary rounded-2xl p-6 border-l-4 border-emerald-500/50">
          <h3 className="text-lg font-semibold text-emerald-400 mb-3">Strengths</h3>
          <ul className="space-y-2">
            {reading.strengths.map((s: string, i: number) => (
              <li key={i} className="text-emerald-200/90 text-sm leading-relaxed">
                {'• '}{s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-bg-secondary rounded-2xl p-6 border-l-4 border-red-500/50">
          <h3 className="text-lg font-semibold text-red-400 mb-3">Shadow side</h3>
          <ul className="space-y-2">
            {reading.shadow.map((s: string, i: number) => (
              <li key={i} className="text-red-200/90 text-sm leading-relaxed">
                {'• '}{s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Beginnings */}
      <Section title="Beginnings">
        <p className="text-text-secondary leading-relaxed">{reading.beginnings}</p>
      </Section>

      {/* Pressure & conflict */}
      <Section title="Pressure & conflict">
        <p className="text-text-secondary leading-relaxed">{reading.pressure}</p>
      </Section>

      {/* Endings & closure */}
      <Section title="Endings & closure">
        <p className="text-text-secondary leading-relaxed">{reading.closure}</p>
      </Section>

      {/* In love, work and inner life */}
      <Section title="In love, work and inner life">
        <p className="text-text-secondary leading-relaxed">{reading.loveWorkInner}</p>
      </Section>

      {/* Your growth edge */}
      <Section title="Your growth edge">
        <p className="text-text-secondary leading-relaxed">{reading.growth}</p>
      </Section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Section helper
// ═══════════════════════════════════════════════════════════════════

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-bg-secondary rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-3">{title}</h3>
      {children}
    </div>
  );
}
