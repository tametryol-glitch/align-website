'use client';

import { useState } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { TrendingUp, Moon } from 'lucide-react';

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  'North Node': '☊', 'South Node': '☋', Chiron: '⚷', Lilith: '⚸',
};

export default function TransitsPage() {
  const { profile } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!profile?.birth_date || !profile?.latitude) {
    return <BirthDataPrompt message="Add your birth data to see your current transits." />;
  }

  async function fetchTransits() {
    setLoading(true);
    setError('');
    try {
      const result = await api.getCurrentTransits(buildBirthData(profile!));
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const transitPositions = data?.transit_positions || [];
  const moonPhase = data?.moon_phase;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Current Transits</h1>
          <p className="text-text-tertiary text-sm">Planetary movements affecting your chart right now</p>
        </div>
      </div>

      {!data && !loading && (
        <div className="card text-center py-12">
          <p className="text-text-tertiary mb-4">Calculate your current transits to see what&apos;s active in your chart.</p>
          <button onClick={fetchTransits} disabled={loading} className="btn-primary">
            Get My Transits
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}

      {loading && <LoadingCosmic label="Calculating transits..." />}

      {data && !loading && (
        <div className="space-y-5">
          {/* Moon Phase */}
          {moonPhase && (
            <div className="card border-accent-muted bg-gradient-cosmic">
              <div className="flex items-center gap-3 mb-2">
                <Moon className="w-5 h-5 text-accent-primary" />
                <h3 className="text-sm font-semibold text-text-primary">Current Moon Phase</h3>
              </div>
              <p className="text-sm text-text-secondary">
                {moonPhase.phase_name || moonPhase.name} &middot; {moonPhase.illumination != null ? `${Math.round(moonPhase.illumination * 100)}% illuminated` : ''}
              </p>
            </div>
          )}

          {/* Transit Positions */}
          <h3 className="text-sm font-semibold text-text-primary">Transiting Planets</h3>
          <div className="space-y-3">
            {transitPositions.map((t: any, i: number) => (
              <div key={i} className="card flex items-center gap-3">
                <span className="text-2xl w-8 text-center">{PLANET_GLYPHS[t.name] || '⚫'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary text-sm">{t.name}</span>
                    <span className="text-xs text-accent-primary">{t.sign}</span>
                    {t.is_retrograde && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-400/15 text-red-400 font-medium">Rx</span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    {t.sign_degree != null ? `${t.sign_degree.toFixed(1)}° ${t.sign}` : ''}
                    {t.house ? ` · House ${t.house}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Refresh */}
          <button onClick={fetchTransits} className="btn-secondary w-full text-sm">
            Refresh Transits
          </button>
        </div>
      )}
    </div>
  );
}
