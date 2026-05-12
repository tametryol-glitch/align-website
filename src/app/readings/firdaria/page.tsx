'use client';

import { useState } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Hourglass } from 'lucide-react';
import { getPlanetGlyph } from '@/lib/utils';
import { PaywallGate } from '@/components/ui/PaywallGate';

export default function FirdariaPage() {
  const { profile } = useAuthStore();
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function getReading() {
    if (!profile?.birth_date || !profile?.latitude) {
      setError('Please add your birth data in your profile first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.getFirdaria(buildBirthData(profile));
      setReading(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PaywallGate feature="firdaria" fallbackTier="pro">
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Hourglass className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Firdaria</h1>
          <p className="text-text-tertiary text-sm">Persian time-lord system showing life periods</p>
        </div>
      </div>

      {!reading && (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">⌛</span>
          <p className="text-text-tertiary mb-4">
            Discover which planet rules your current life period and what themes it brings.
          </p>
          <button onClick={getReading} disabled={loading} className="btn-primary">
            {loading ? 'Calculating...' : 'Calculate Firdaria'}
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}

      {reading && (
        <div className="space-y-4">
          {reading.current_period && (
            <div className="bg-gradient-cosmic rounded-2xl p-8 border border-accent-muted">
              <p className="text-accent-secondary text-sm uppercase tracking-wider mb-2">Current Period</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getPlanetGlyph(reading.current_period.planet)}</span>
                <div>
                  <h2 className="text-xl font-bold text-text-primary">{reading.current_period.planet}</h2>
                  <p className="text-sm text-text-tertiary">
                    {reading.current_period.start} — {reading.current_period.end}
                  </p>
                </div>
              </div>
              {reading.current_period.sub_lord && (
                <p className="text-text-secondary mt-3">
                  Sub-lord: {reading.current_period.sub_lord}
                </p>
              )}
            </div>
          )}
          {reading.periods?.map((period: any, i: number) => (
            <div
              key={i}
              className={`card ${period.is_current ? 'border-accent-primary/50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{getPlanetGlyph(period.planet)}</span>
                <div className="flex-1">
                  <p className="font-medium text-text-primary">{period.planet}</p>
                  <p className="text-xs text-text-muted">{period.start} — {period.end}</p>
                </div>
                {period.is_current && (
                  <span className="text-xs bg-accent-muted text-accent-primary px-2 py-0.5 rounded">
                    Active
                  </span>
                )}
              </div>
            </div>
          ))}
          <button onClick={() => setReading(null)} className="btn-secondary">
            Recalculate
          </button>
        </div>
      )}
    </div>
    </PaywallGate>
  );
}
