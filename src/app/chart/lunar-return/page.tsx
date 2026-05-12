'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { NatalWheel } from '@/components/charts/NatalWheel';
import { getPlanetGlyph, getZodiacGlyph, cn } from '@/lib/utils';
import { getLunarReturnInterpretation } from '@/lib/interpretations';
import { MarkdownText } from '@/components/ui/MarkdownText';
import Link from 'next/link';
import { ArrowLeft, Moon, ChevronDown } from 'lucide-react';
import { PaywallGate } from '@/components/ui/PaywallGate';

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌',
  sextile: '⚹',
  square: '□',
  trine: '△',
  opposition: '☍',
  quincunx: '⚻',
};

export default function LunarReturnPage() {
  const { profile } = useAuthStore();
  const [chart, setChart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [targetMonth, setTargetMonth] = useState(new Date().getMonth());
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());
  const [expandedPlanets, setExpandedPlanets] = useState<Set<string>>(new Set());
  const [hasLoaded, setHasLoaded] = useState(false);

  const hasBirthData = profile?.birth_date && profile?.birth_time && profile?.latitude;

  const calculate = useCallback(async () => {
    if (!hasBirthData) return;
    setLoading(true);
    setError('');
    try {
      const birthData = buildBirthData(profile!);
      const data = await api.getLunarReturn({
        birth_data: birthData,
        target_date: new Date(targetYear, targetMonth, 15).toISOString().split('T')[0],
        house_system: birthData.house_system,
      });
      setChart(data);
      setHasLoaded(true);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate lunar return');
    } finally {
      setLoading(false);
    }
  }, [hasBirthData, profile, targetMonth, targetYear]);

  // Auto-calculate on first mount when birth data is available
  useEffect(() => {
    if (hasBirthData && !hasLoaded && !loading) {
      calculate();
    }
  }, [hasBirthData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-calculate when month/year changes (only after initial load)
  useEffect(() => {
    if (hasLoaded && hasBirthData && !loading) {
      calculate();
    }
  }, [targetMonth, targetYear]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!hasBirthData) {
    return (
      <PaywallGate feature="lunar_return">
        <div className="max-w-3xl mx-auto">
          <Link href="/chart" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" /> My Chart
          </Link>
          <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
            <Moon className="w-7 h-7 text-water" />
            Lunar Return
          </h1>
          <BirthDataPrompt message="Birth data required to calculate your Lunar Return chart." />
        </div>
      </PaywallGate>
    );
  }

  // Derive positions and aspects from chart data
  const positions = chart?.positions || chart?.planets || [];
  const moonPos = positions.find((p: any) => p.name === 'Moon');
  const lrAsc = positions.find((p: any) => p.name === 'Ascendant');

  // Moon aspects for the dedicated section
  const allAspects = (chart?.aspects || []).map((a: any) => ({
    planet1: a.body1 || a.planet1,
    planet2: a.body2 || a.planet2,
    type: a.aspect_name || a.type || a.aspect,
    orb: a.orb,
  }));
  const moonAspects = allAspects.filter(
    (a: any) => a.planet1 === 'Moon' || a.planet2 === 'Moon',
  );

  return (
    <PaywallGate feature="lunar_return">
    <div className="max-w-4xl mx-auto">
      <Link href="/chart" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> My Chart
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mb-2 flex items-center gap-3">
        <Moon className="w-7 h-7 text-water" />
        Lunar Return
      </h1>
      <p className="text-sm text-text-tertiary mb-6">
        Your monthly emotional weather forecast — when the Moon returns to its natal position
      </p>

      <div className="card mb-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <button
            type="button"
            onClick={() => {
              let m = targetMonth - 1;
              let y = targetYear;
              if (m < 0) { m = 11; y--; }
              setTargetMonth(m);
              setTargetYear(y);
            }}
            className="btn-ghost px-2 py-1 text-xs"
          >&#8249;</button>
          <span className="text-sm text-text-primary font-medium min-w-[140px] text-center">
            {new Date(targetYear, targetMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            type="button"
            onClick={() => {
              let m = targetMonth + 1;
              let y = targetYear;
              if (m > 11) { m = 0; y++; }
              setTargetMonth(m);
              setTargetYear(y);
            }}
            className="btn-ghost px-2 py-1 text-xs"
          >&#8250;</button>
        </div>
        <button onClick={calculate} disabled={loading} className="btn-primary">
          {loading ? 'Calculating...' : hasLoaded ? 'Recalculate' : 'Calculate'}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {loading && <LoadingCosmic label="Computing Lunar Return..." />}

      {chart && !loading && (
        <div className="space-y-4">
          {chart.exact_time && (
            <div className="card bg-gradient-cosmic border-water/20">
              <p className="text-sm text-text-secondary">Next Lunar Return</p>
              <p className="text-lg font-semibold text-text-primary">
                {new Date(chart.exact_time).toLocaleString()}
              </p>
            </div>
          )}

          {/* Summary cards: Moon position + LR Ascendant */}
          <div className="grid grid-cols-2 gap-3">
            {moonPos && (
              <div className="card">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Moon Position</p>
                <p className="text-sm font-semibold text-text-primary">{getZodiacGlyph(moonPos.sign)} {moonPos.sign} (H{moonPos.house})</p>
                <p className="text-xs text-text-secondary mt-1">Emotional focus this month</p>
              </div>
            )}
            {lrAsc && (
              <div className="card">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">LR Ascendant</p>
                <p className="text-sm font-semibold text-text-primary">{getZodiacGlyph(lrAsc.sign)} {lrAsc.sign}</p>
                <p className="text-xs text-text-secondary mt-1">How you come across this month</p>
              </div>
            )}
          </div>

          <LunarReturnWheel chart={chart} />

          {/* Moon Aspects */}
          {moonAspects.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                Moon Aspects
              </h3>
              <div className="space-y-2">
                {moonAspects.map((aspect: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 py-1.5 flex-wrap">
                    <span className="text-sm text-text-secondary">
                      {getPlanetGlyph(aspect.planet1)} {aspect.planet1}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-bg-tertiary text-text-tertiary">
                      {ASPECT_SYMBOLS[aspect.type?.toLowerCase()] || ''} {aspect.type}
                    </span>
                    <span className="text-sm text-text-secondary">
                      {getPlanetGlyph(aspect.planet2)} {aspect.planet2}
                    </span>
                    <span className="text-xs text-text-muted ml-auto">
                      ({(aspect.orb ?? 0).toFixed(1)}&deg;)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Positions table with expandable interpretations */}
          <div className="card">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-1">
              Lunar Return Positions
            </h3>
            <p className="text-xs text-text-muted italic mb-4">
              Tap any planet to read its interpretation for this lunar cycle
            </p>
            <div className="divide-y divide-border-primary">
              {positions.map((planet: any) => {
                const isExpanded = expandedPlanets.has(planet.name);
                return (
                  <div key={planet.name}>
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedPlanets(prev => {
                          const next = new Set(prev);
                          if (next.has(planet.name)) next.delete(planet.name);
                          else next.add(planet.name);
                          return next;
                        });
                      }}
                      className="flex items-center gap-3 py-3 w-full text-left hover:bg-bg-tertiary/50 transition-colors rounded-lg px-1 -mx-1"
                    >
                      <span className="text-xl w-8 text-center">{getPlanetGlyph(planet.name)}</span>
                      <span className="text-text-primary font-medium flex-1">{planet.name}</span>
                      <span className="text-text-secondary flex items-center gap-1">
                        {getZodiacGlyph(planet.sign)} {planet.sign}
                      </span>
                      <span className="text-text-tertiary text-sm w-16 text-right">
                        {(planet.sign_degree ?? planet.degree)?.toFixed(2)}&deg;
                      </span>
                      {(planet.is_retrograde || planet.retrograde) && (
                        <span className="text-red-400 text-xs font-semibold" title="Retrograde">R</span>
                      )}
                      <span className="text-text-muted text-sm w-12 text-right">
                        H{planet.house}
                      </span>
                      <ChevronDown className={cn(
                        'w-4 h-4 text-text-muted transition-transform',
                        isExpanded && 'rotate-180'
                      )} />
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 text-sm text-text-secondary leading-relaxed whitespace-pre-line border-l-2 border-accent-primary/20 ml-4">
                        <MarkdownText text={getLunarReturnInterpretation(planet.name, planet.sign, planet.house)} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {chart.monthly_themes && (
            <div className="card">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                Monthly Themes
              </h3>
              <div className="space-y-3">
                {chart.monthly_themes.map((theme: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-bg-tertiary">
                    <p className="text-sm font-medium text-text-primary">{theme.title || theme.name}</p>
                    {theme.description && (
                      <p className="text-xs text-text-muted mt-1">{theme.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </PaywallGate>
  );
}

function LunarReturnWheel({ chart }: { chart: any }) {
  const positions = chart.positions || chart.planets || [];
  if (positions.length === 0) return null;
  const planets = positions.map((p: any) => ({
    name: p.name,
    longitude: p.longitude,
    sign: p.sign,
    degree: p.sign_degree ?? (p.longitude % 30),
    retrograde: p.is_retrograde || p.retrograde || false,
  }));
  const aspects = (chart.aspects || []).map((a: any) => ({
    planet1: a.body1 || a.planet1,
    planet2: a.body2 || a.planet2,
    type: a.aspect_name || a.type || a.aspect,
    orb: a.orb,
  }));
  const houseCusps: number[] = chart.house_cusps || [];
  const ascPos = positions.find((p: any) => p.name === 'Ascendant');
  const mcPos = positions.find((p: any) => p.name === 'MC');
  return (
    <div className="card flex items-center justify-center p-4">
      <NatalWheel
        planets={planets}
        aspects={aspects}
        houseCusps={houseCusps}
        ascendantDegree={ascPos?.longitude ?? houseCusps[0] ?? 0}
        midheavenDegree={mcPos?.longitude ?? houseCusps[9] ?? 0}
        size={420}
      />
    </div>
  );
}
