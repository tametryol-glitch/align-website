'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { getPlanetGlyph, getZodiacGlyph } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, TrendingUp } from 'lucide-react';

export default function ProgressedChartPage() {
  const { profile } = useAuthStore();
  const [chart, setChart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  const hasBirthData = profile?.birth_date && profile?.birth_time && profile?.latitude;

  async function calculate() {
    if (!hasBirthData) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getProgressedChart({
        name: profile!.display_name || '',
        birth_date: profile!.birth_date,
        birth_time: profile!.birth_time,
        latitude: profile!.latitude,
        longitude: profile!.longitude,
        timezone: profile!.timezone || 'UTC',
        target_date: targetDate,
      });
      setChart(data);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate progressed chart');
    } finally {
      setLoading(false);
    }
  }

  if (!hasBirthData) {
    return (
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
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/chart" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> My Chart
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mb-2 flex items-center gap-3">
        <TrendingUp className="w-7 h-7 text-accent-primary" />
        Progressed Chart
      </h1>
      <p className="text-sm text-text-tertiary mb-6">
        Secondary progressions show your inner evolution — one day per year
      </p>

      {/* Date selector */}
      <div className="card mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-text-secondary block mb-1">Progression Date</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="input"
          />
        </div>
        <button onClick={calculate} disabled={loading} className="btn-primary">
          {loading ? 'Calculating...' : 'Calculate'}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {loading && <LoadingCosmic label="Calculating progressions..." />}

      {chart && !loading && (
        <div className="card">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Progressed Positions
          </h3>
          <div className="divide-y divide-border-primary">
            {(chart.planets || chart.positions || []).map((planet: any) => (
              <div key={planet.name} className="flex items-center gap-3 py-3">
                <span className="text-xl w-8 text-center">{getPlanetGlyph(planet.name)}</span>
                <span className="text-text-primary font-medium flex-1">{planet.name}</span>
                <span className="text-text-secondary flex items-center gap-1">
                  {getZodiacGlyph(planet.sign)} {planet.sign}
                </span>
                <span className="text-text-tertiary text-sm w-16 text-right">
                  {planet.degree?.toFixed(2)}°
                </span>
                {planet.retrograde && (
                  <span className="text-xs text-gold-primary font-semibold">℞</span>
                )}
              </div>
            ))}
          </div>

          {chart.progressed_aspects && chart.progressed_aspects.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mt-6 mb-4">
                Active Progressed Aspects
              </h3>
              <div className="divide-y divide-border-primary">
                {chart.progressed_aspects.map((aspect: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 py-3">
                    <span className="text-text-primary text-sm flex-1">{aspect.planet1}</span>
                    <span className="px-2 py-0.5 rounded bg-accent-muted text-accent-secondary text-xs font-medium">
                      {aspect.aspect}
                    </span>
                    <span className="text-text-primary text-sm flex-1 text-right">{aspect.planet2}</span>
                    <span className="text-text-muted text-xs w-12 text-right">{aspect.orb?.toFixed(1)}°</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
