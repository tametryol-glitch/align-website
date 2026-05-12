'use client';

import { useState } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Sun } from 'lucide-react';
import { PaywallGate } from '@/components/ui/PaywallGate';

export default function SolarReturnPage() {
  const { profile } = useAuthStore();
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function getReading(e: React.FormEvent) {
    e.preventDefault();
    if (!profile?.birth_date || !profile?.latitude) {
      setError('Please add your birth data in your profile first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.getSolarReturn({
        ...buildBirthData(profile),
        year: parseInt(year),
      });
      setReading(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PaywallGate feature="solar_return">
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Sun className="w-8 h-8 text-gold-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Solar Return</h1>
          <p className="text-text-tertiary text-sm">Your birthday chart — themes for the year ahead</p>
        </div>
      </div>

      {!reading && (
        <form onSubmit={getReading} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="input"
              min="1900"
              max="2100"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Calculating...' : 'Get Solar Return'}
          </button>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </form>
      )}

      {reading && (
        <div className="space-y-4">
          {reading.sun_return_date && (
            <div className="bg-gradient-cosmic rounded-2xl p-6 border border-accent-muted">
              <p className="text-accent-secondary text-sm uppercase tracking-wider mb-1">Solar Return Date</p>
              <p className="text-xl font-bold text-text-primary">{reading.sun_return_date}</p>
            </div>
          )}
          {reading.planets?.map((planet: any) => (
            <div key={planet.name} className="card flex items-center gap-3">
              <span className="text-2xl">{planet.glyph || '⚫'}</span>
              <div className="flex-1">
                <p className="font-medium text-text-primary">{planet.name} in {planet.sign}</p>
                <p className="text-xs text-text-muted">House {planet.house} — {planet.degree?.toFixed(1)}°</p>
              </div>
            </div>
          ))}
          <button onClick={() => setReading(null)} className="btn-secondary">
            Try Another Year
          </button>
        </div>
      )}
    </div>
    </PaywallGate>
  );
}
