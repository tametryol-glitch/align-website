'use client';

import { useState, useEffect } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { NatalWheel } from '@/components/charts/NatalWheel';
import { getPlanetGlyph, getZodiacGlyph, cn } from '@/lib/utils';
import { getProgressedInterpretation } from '@/lib/interpretations';
import { MarkdownText } from '@/components/ui/MarkdownText';
import Link from 'next/link';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { PaywallGate } from '@/components/ui/PaywallGate';

type ProgType = 'secondary' | 'solar_arc';

export default function ProgressedChartPage() {
  const { profile } = useAuthStore();
  const [chart, setChart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedPlanets, setExpandedPlanets] = useState<Set<string>>(new Set());
  const [progType, setProgType] = useState<ProgType>('secondary');
  const [activeTab, setActiveTab] = useState<'positions' | 'changes'>('positions');
  const [hasCalculated, setHasCalculated] = useState(false);

  const hasBirthData = profile?.birth_date && profile?.birth_time && profile?.latitude;

  async function calculate() {
    if (!hasBirthData) return;
    setLoading(true);
    setError('');
    try {
      const birthData = buildBirthData(profile!);
      const data = await api.getProgressedChart({
        birth_data: birthData,
        target_date: targetDate,
        progression_type: progType,
        house_system: birthData.house_system,
      });
      setChart(data);
      setHasCalculated(true);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate progressed chart');
    } finally {
      setLoading(false);
    }
  }

  // Auto-recalculate when date or progression type changes (after initial calculation)
  useEffect(() => {
    if (hasCalculated && hasBirthData) {
      calculate();
    }
  }, [targetDate, progType]);

  if (!hasBirthData) {
    return (
      <PaywallGate feature="progressed">
        <div className="max-w-3xl mx-auto">
          <Link href="/chart" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" /> My Chart
          </Link>
          <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-accent-primary" />
            Progressed Chart
          </h1>
          <BirthDataPrompt message="Birth data required to calculate your progressed chart." />
        </div>
      </PaywallGate>
    );
  }

  // Derive positions with defensive fallbacks
  const positions = chart?.positions || chart?.planets || [];
  const filteredPositions = positions.filter(
    (p: any) => !['Descendant', 'IC', 'Anti-Vertex'].includes(p.name)
  );
  const signChanges = positions.filter(
    (p: any) => p.natal_sign && p.sign !== p.natal_sign
  );

  return (
    <PaywallGate feature="progressed">
    <div className="max-w-4xl mx-auto">
      <Link href="/chart" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> My Chart
      </Link>

      {/* Header with title + progression type toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-3">
        <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
          <TrendingUp className="w-7 h-7 text-accent-primary" />
          Progressed Chart
        </h1>
        <div className="flex items-center gap-1">
          {(['secondary', 'solar_arc'] as ProgType[]).map((type) => (
            <button
              key={type}
              onClick={() => setProgType(type)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                progType === type
                  ? 'bg-accent-primary border-accent-primary text-white'
                  : 'border-border-primary text-text-muted hover:text-text-secondary'
              )}
            >
              {type === 'secondary' ? 'Secondary' : 'Solar Arc'}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-text-tertiary mb-6">
        Secondary progressions show your inner evolution — one day per year
      </p>

      {/* Date selector */}
      <div className="card mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-text-secondary block mb-1">Progression Date</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const d = new Date(targetDate);
                d.setFullYear(d.getFullYear() - 1);
                setTargetDate(d.toISOString().split('T')[0]);
              }}
              className="btn-ghost px-2 py-1 text-xs"
              title="-1 year"
            >&laquo;</button>
            <button
              type="button"
              onClick={() => {
                const d = new Date(targetDate);
                d.setMonth(d.getMonth() - 1);
                setTargetDate(d.toISOString().split('T')[0]);
              }}
              className="btn-ghost px-2 py-1 text-xs"
              title="-1 month"
            >&lsaquo;</button>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="input"
            />
            <button
              type="button"
              onClick={() => {
                const d = new Date(targetDate);
                d.setMonth(d.getMonth() + 1);
                setTargetDate(d.toISOString().split('T')[0]);
              }}
              className="btn-ghost px-2 py-1 text-xs"
              title="+1 month"
            >&rsaquo;</button>
            <button
              type="button"
              onClick={() => {
                const d = new Date(targetDate);
                d.setFullYear(d.getFullYear() + 1);
                setTargetDate(d.toISOString().split('T')[0]);
              }}
              className="btn-ghost px-2 py-1 text-xs"
              title="+1 year"
            >&raquo;</button>
          </div>
        </div>
        <button onClick={calculate} disabled={loading} className="btn-primary">
          {loading ? 'Calculating...' : 'Calculate'}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {loading && <LoadingCosmic label="Calculating progressions..." />}

      {chart && !loading && (
        <div className="space-y-4">
          <ProgressedWheel chart={chart} />

          {/* Sign change alerts */}
          {signChanges.length > 0 && (
            <div className="space-y-2">
              {signChanges.map((planet: any) => (
                <div key={planet.name} className="card bg-gold-primary/5 border-gold-primary/20">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getPlanetGlyph(planet.name)}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        {planet.name} changed sign
                      </p>
                      <p className="text-xs text-text-secondary">
                        {planet.natal_sign} &rarr; {planet.sign}
                      </p>
                    </div>
                    <span className="text-xs text-gold-primary font-semibold px-2 py-1 rounded-full bg-gold-primary/10">
                      Sign Change
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs: Positions / Natal vs Progressed */}
          <div className="flex border-b border-border-primary mb-0">
            <button
              onClick={() => setActiveTab('positions')}
              className={cn(
                'flex-1 py-3 text-sm font-medium text-center transition-colors',
                activeTab === 'positions'
                  ? 'border-b-2 border-accent-primary text-accent-primary'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              Positions
            </button>
            <button
              onClick={() => setActiveTab('changes')}
              className={cn(
                'flex-1 py-3 text-sm font-medium text-center transition-colors',
                activeTab === 'changes'
                  ? 'border-b-2 border-accent-primary text-accent-primary'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              Natal vs Progressed
            </button>
          </div>

          {/* Positions tab */}
          {activeTab === 'positions' && (
            <div className="card">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                Progressed Positions
              </h3>
              <div className="divide-y divide-border-primary">
                {filteredPositions.map((planet: any) => (
                  <div key={planet.name}>
                    <div
                      className={cn(
                        "flex items-center gap-3 py-3 cursor-pointer hover:bg-bg-tertiary/50 rounded-lg transition-colors",
                        expandedPlanets.has(planet.name) && "bg-accent-primary/5"
                      )}
                      onClick={() => {
                        const next = new Set(expandedPlanets);
                        next.has(planet.name) ? next.delete(planet.name) : next.add(planet.name);
                        setExpandedPlanets(next);
                      }}
                    >
                      <span className="text-xl w-8 text-center">{getPlanetGlyph(planet.name)}</span>
                      <span className="text-text-primary font-medium flex-1">{planet.name}</span>
                      <span className="text-text-secondary flex items-center gap-1">
                        {getZodiacGlyph(planet.sign)} {planet.sign}
                      </span>
                      <span className="text-text-tertiary text-sm w-16 text-right">
                        {(planet.sign_degree ?? planet.degree)?.toFixed(2)}&deg;
                      </span>
                      {planet.house && (
                        <span className="text-text-muted text-xs w-8 text-right">H{planet.house}</span>
                      )}
                      {(planet.is_retrograde || planet.retrograde) && (
                        <span className="text-xs text-gold-primary font-semibold">&#8478;</span>
                      )}
                      {planet.natal_sign && planet.sign !== planet.natal_sign && (
                        <span className="text-xs text-gold-primary" title="Sign changed from natal">&#9733;</span>
                      )}
                      <span className={cn("text-text-muted text-xs transition-transform", expandedPlanets.has(planet.name) && "rotate-180")}>&#9660;</span>
                    </div>
                    {expandedPlanets.has(planet.name) && (
                      <div className="px-4 pb-4 pt-1 text-sm text-text-secondary leading-relaxed whitespace-pre-line border-l-2 border-accent-primary/20 ml-4">
                        <MarkdownText text={getProgressedInterpretation(
                          planet.name,
                          planet.sign,
                          planet.house,
                          planet.natal_sign,
                          planet.sign !== planet.natal_sign && !!planet.natal_sign
                        )} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {(chart.progressed_aspects || chart.aspects) && (chart.progressed_aspects || chart.aspects).length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mt-6 mb-4">
                    Active Progressed Aspects
                  </h3>
                  <div className="divide-y divide-border-primary">
                    {(chart.progressed_aspects || chart.aspects).map((aspect: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 py-3">
                        <span className="text-text-primary text-sm flex-1">{aspect.body1 || aspect.planet1}</span>
                        <span className="px-2 py-0.5 rounded bg-accent-muted text-accent-secondary text-xs font-medium">
                          {aspect.aspect_name || aspect.aspect}
                        </span>
                        <span className="text-text-primary text-sm flex-1 text-right">{aspect.body2 || aspect.planet2}</span>
                        <span className="text-text-muted text-xs w-12 text-right">{aspect.orb?.toFixed(1)}&deg;</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Natal vs Progressed comparison tab */}
          {activeTab === 'changes' && (
            <div className="card">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                Natal vs Progressed
              </h3>
              {/* Header row */}
              <div className="flex py-2 border-b-2 border-border-secondary mb-1">
                <span className="flex-1 text-xs text-text-muted uppercase text-center">Planet</span>
                <span className="flex-1 text-xs text-text-muted uppercase text-center">Natal</span>
                <span className="flex-1 text-xs text-text-muted uppercase text-center">Progressed</span>
              </div>
              <div className="divide-y divide-border-primary">
                {positions
                  .filter((p: any) => !['Descendant', 'IC', 'Anti-Vertex', 'Part of Fortune', 'Part of Spirit', 'Vertex'].includes(p.name))
                  .map((planet: any) => {
                    const hasChanged = planet.natal_sign && planet.sign !== planet.natal_sign;
                    return (
                      <div
                        key={planet.name}
                        className={cn(
                          'flex items-center py-3',
                          hasChanged && 'bg-gold-primary/5'
                        )}
                      >
                        <div className="flex-1 flex flex-col items-center">
                          <span className="text-sm">{getPlanetGlyph(planet.name)}</span>
                          <span className="text-xs text-text-muted mt-0.5">{planet.name}</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                          {planet.natal_sign ? (
                            <>
                              <span className="text-sm text-text-secondary">
                                {getZodiacGlyph(planet.natal_sign)} {planet.natal_sign}
                              </span>
                              {planet.natal_degree != null && (
                                <span className="text-xs text-text-muted">
                                  {planet.natal_degree.toFixed(2)}&deg;
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-text-muted">&mdash;</span>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                          <span className={cn(
                            'text-sm',
                            hasChanged ? 'text-gold-primary font-bold' : 'text-text-secondary'
                          )}>
                            {getZodiacGlyph(planet.sign)} {planet.sign}
                          </span>
                          <span className="text-xs text-text-muted">
                            {(planet.sign_degree ?? planet.degree)?.toFixed(2)}&deg;
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </PaywallGate>
  );
}

function ProgressedWheel({ chart }: { chart: any }) {
  const positions = chart.positions || chart.planets || [];
  if (positions.length === 0) return null;
  const planets = positions.map((p: any) => ({
    name: p.name,
    longitude: p.longitude,
    sign: p.sign,
    degree: p.sign_degree ?? (p.longitude % 30),
    retrograde: p.is_retrograde || p.retrograde || false,
  }));
  const aspects = (chart.progressed_aspects || chart.aspects || []).map((a: any) => ({
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
