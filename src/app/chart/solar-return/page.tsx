'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { getPlanetGlyph, getZodiacGlyph } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, Sun } from 'lucide-react';

export default function SolarReturnPage() {
  const { profile } = useAuthStore();
  const [chart, setChart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());

  const hasBirthData = profile?.birth_date && profile?.birth_time && profile?.latitude;

  async function calculate() {
    if (!hasBirthData) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getSolarReturn({
        name: profile!.display_name || '',
        birth_date: profile!.birth_date,
        birth_time: profile!.birth_time,
        latitude: profile!.latitude,
        longitude: profile!.longitude,
        timezone: profile!.timezone || 'UTC',
        year,
      });
      setChart(data);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate solar return');
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
          <Sun className="w-7 h-7 text-gold-primary" />
          Solar Return
        </h1>
        <BirthDataPrompt message="Birth data required to calculate your Solar Return chart." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/chart" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> My Chart
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mb-2 flex items-center gap-3">
        <Sun className="w-7 h-7 text-gold-primary" />
        Solar Return
      </h1>
      <p className="text-sm text-text-tertiary mb-6">
        Your birthday chart for the year — themes and focus areas ahead
      </p>

      {/* Year selector */}
      <div className="card mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-text-secondary block mb-1">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            min={1900}
            max={2100}
            className="input w-32"
          />
        </div>
        <button onClick={calculate} disabled={loading} className="btn-primary">
          {loading ? 'Calculating...' : 'Calculate'}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {loading && <LoadingCosmic label="Computing Solar Return..." />}

      {chart && !loading && (
        <div className="space-y-4">
          {chart.exact_time && (
            <div className="card bg-gradient-cosmic border-accent-muted">
              <p className="text-sm text-text-secondary">Solar Return Exact Moment</p>
              <p className="text-lg font-semibold text-text-primary">
                {new Date(chart.exact_time).toLocaleString()}
              </p>
            </div>
          )}

          <div className="card">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
              Solar Return Positions
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
                  <span className="text-text-muted text-sm w-12 text-right">
                    H{planet.house}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {chart.themes && chart.themes.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                Year Themes
              </h3>
              <div className="space-y-3">
                {chart.themes.map((theme: any, i: number) => (
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
  );
}
