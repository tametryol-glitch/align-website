'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { api, buildBirthData } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { PaywallGate } from '@/components/ui/PaywallGate';

export default function FixedStarsPage() {
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
      const data = await api.getNatalChart({
        ...buildBirthData(profile),
        include_fixed_stars: true,
      });
      setReading(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PaywallGate feature="fixed_stars" fallbackTier="pro">
    <div className="max-w-3xl mx-auto">
      <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Readings
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Fixed Stars</h1>
          <p className="text-text-tertiary text-sm">Stellar conjunctions in your natal chart</p>
        </div>
      </div>

      {!reading && (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">★</span>
          <p className="text-text-tertiary mb-4">
            Discover which powerful fixed stars conjunct your natal planets.
          </p>
          <button onClick={getReading} disabled={loading} className="btn-primary">
            {loading ? 'Calculating...' : 'Find My Fixed Stars'}
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}

      {reading?.fixed_stars && (
        <div className="space-y-4">
          {reading.fixed_stars.map((star: any, i: number) => (
            <div key={i} className="card">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">★</span>
                <div>
                  <h3 className="font-semibold text-text-primary">{star.name}</h3>
                  <p className="text-xs text-text-muted">
                    Conjunct {star.planet} — magnitude {star.magnitude}
                  </p>
                </div>
              </div>
              {star.interpretation && (
                <p className="text-sm text-text-secondary">{star.interpretation}</p>
              )}
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
