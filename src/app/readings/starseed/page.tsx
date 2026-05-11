'use client';

import { useState } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Sparkles } from 'lucide-react';

export default function StarseedPage() {
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
      const data = await api.getStarseedAnalysis(buildBirthData(profile));
      setReading(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Starseed Origin</h1>
          <p className="text-text-tertiary text-sm">Discover your cosmic soul origins</p>
        </div>
      </div>

      {!reading && (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">✦</span>
          <p className="text-text-tertiary mb-4">
            Analyze your natal chart to discover which star systems your soul resonates with.
          </p>
          <button onClick={getReading} disabled={loading} className="btn-primary">
            {loading ? 'Analyzing...' : 'Discover My Origins'}
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}

      {reading && (() => {
        const ranked = (reading.ranked || []).filter((r: any) => r.score > 0);
        const top = ranked[0];
        const maxScore = top?.score || 1;
        return (
          <div className="space-y-4">
            {/* Dominant origin */}
            {top && (
              <div className="bg-gradient-cosmic rounded-2xl p-8 border border-accent-muted">
                <p className="text-accent-secondary text-sm font-medium uppercase tracking-wider mb-2">
                  Dominant Origin
                </p>
                <h2 className="text-2xl font-display font-bold text-text-primary mb-3">
                  {top.category}
                </h2>
                <p className="text-sm text-text-secondary">Score: {top.score} resonance points</p>
              </div>
            )}

            {/* Summary */}
            {reading.summary && (
              <div className="card border-accent-muted">
                <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-2">Soul Mission</p>
                <p className="text-sm text-text-secondary leading-relaxed">{reading.summary}</p>
              </div>
            )}

            {/* All lineages */}
            <h3 className="text-sm font-semibold text-text-primary">All Lineages</h3>
            {ranked.map((r: any, i: number) => (
              <div key={i} className="card">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-text-primary text-sm">{r.category}</h4>
                  <span className="text-xs text-accent-primary font-medium">{r.score} pts</span>
                </div>
                <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-accent rounded-full transition-all"
                    style={{ width: `${Math.round((r.score / maxScore) * 100)}%` }}
                  />
                </div>
              </div>
            ))}

            <button onClick={() => setReading(null)} className="btn-secondary w-full">
              Analyze Again
            </button>
          </div>
        );
      })()}
    </div>
  );
}
