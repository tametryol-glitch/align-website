'use client';

import { useState } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';
import { getZodiacGlyph } from '@/lib/utils';
import { PaywallGate } from '@/components/ui/PaywallGate';

export default function ZodiacalReleasingPage() {
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
      const data = await api.getZodiacalReleasing(buildBirthData(profile));
      setReading(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PaywallGate feature="zodiacal_releasing" fallbackTier="pro">
    <div className="max-w-3xl mx-auto">
      <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Readings
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <Compass className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Zodiacal Releasing</h1>
          <p className="text-text-tertiary text-sm">Hellenistic timing technique from the Lot of Fortune</p>
        </div>
      </div>

      {!reading && (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">♈</span>
          <p className="text-text-tertiary mb-4">
            Map your major life periods using this ancient Hellenistic technique.
          </p>
          <button onClick={getReading} disabled={loading} className="btn-primary">
            {loading ? 'Calculating...' : 'Calculate Zodiacal Releasing'}
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}

      {reading && (
        <div className="space-y-4">
          {reading.current_level1 && (
            <div className="bg-gradient-cosmic rounded-2xl p-8 border border-accent-muted">
              <p className="text-accent-secondary text-sm uppercase tracking-wider mb-2">Current L1 Period</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getZodiacGlyph(reading.current_level1.sign)}</span>
                <div>
                  <h2 className="text-xl font-bold text-text-primary">{reading.current_level1.sign}</h2>
                  <p className="text-sm text-text-tertiary">
                    {reading.current_level1.start} — {reading.current_level1.end}
                  </p>
                </div>
              </div>
            </div>
          )}
          {reading.periods?.map((period: any, i: number) => (
            <div
              key={i}
              className={`card ${period.is_current ? 'border-accent-primary/50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{getZodiacGlyph(period.sign)}</span>
                <div className="flex-1">
                  <p className="font-medium text-text-primary">{period.sign}</p>
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
