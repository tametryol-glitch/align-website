'use client';

import { useState } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Globe } from 'lucide-react';

export default function ACGPage() {
  const { profile } = useAuthStore();
  const [lines, setLines] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function getLines() {
    if (!profile?.birth_date || !profile?.latitude) {
      setError('Please add your birth data in your profile first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.getACGLines(buildBirthData(profile));
      setLines(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Astro-Cartography</h1>
          <p className="text-text-tertiary text-sm">Planetary lines across the world map</p>
        </div>
      </div>

      {!lines && (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">🌍</span>
          <p className="text-text-tertiary mb-4">
            Discover where each planet&apos;s energy is strongest for you across the globe.
          </p>
          <button onClick={getLines} disabled={loading} className="btn-primary">
            {loading ? 'Calculating...' : 'Calculate My Lines'}
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}

      {lines && (
        <div className="space-y-4">
          {lines.lines?.map((line: any, i: number) => (
            <div key={i} className="card">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{line.glyph || '⚫'}</span>
                <h3 className="font-semibold text-text-primary">{line.planet} {line.angle}</h3>
              </div>
              {line.interpretation && (
                <p className="text-sm text-text-secondary">{line.interpretation}</p>
              )}
              {line.cities && line.cities.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {line.cities.map((city: string, j: number) => (
                    <span key={j} className="text-xs px-2 py-0.5 bg-bg-tertiary rounded text-text-muted">
                      {city}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button onClick={() => setLines(null)} className="btn-secondary">
            Recalculate
          </button>
        </div>
      )}
    </div>
  );
}
