'use client';

import { useState } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { ArrowLeft, Route } from 'lucide-react';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { PaywallGate } from '@/components/ui/PaywallGate';

export default function PathwayPage() {
  const { profile } = useAuthStore();
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!profile?.birth_date || !profile?.latitude) {
    return <PaywallGate feature="pathway" fallbackTier="pro"><BirthDataPrompt message="Add your birth data to discover your life pathway." /></PaywallGate>;
  }

  async function getReading() {
    setLoading(true);
    setError('');
    try {
      const data = await api.getPathway(buildBirthData(profile!));
      setReading(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PaywallGate feature="pathway" fallbackTier="pro">
    <div className="max-w-3xl mx-auto">
      <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Readings
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <Route className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Life Pathway</h1>
          <p className="text-text-tertiary text-sm">Your soul&apos;s navigational blueprint through this lifetime</p>
        </div>
      </div>

      {!reading && (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">🛤️</span>
          <p className="text-text-tertiary mb-6">
            Your North Node, MC, and ruling planet combine to reveal your unique life pathway —
            the direction your soul is meant to grow.
          </p>
          <button onClick={getReading} disabled={loading} className="btn-primary">
            {loading ? 'Mapping Pathway...' : 'Discover My Path'}
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}

      {reading && (
        <div className="space-y-4">
          {reading.pathway && (
            <div className="bg-gradient-cosmic rounded-2xl p-8 border border-accent-muted">
              <p className="text-accent-tertiary text-xs font-medium uppercase tracking-widest mb-2">
                Your Life Path
              </p>
              <h2 className="text-2xl font-display font-bold text-text-primary mb-3">
                {reading.pathway.title || 'The Path Unfolds'}
              </h2>
              <p className="text-text-secondary leading-relaxed">{reading.pathway.description}</p>
            </div>
          )}

          {reading.milestones?.map((milestone: any, i: number) => (
            <div key={i} className="card">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-muted flex items-center justify-center text-accent-primary font-bold text-sm flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{milestone.title}</h3>
                  <p className="text-sm text-text-secondary mt-1">{milestone.description}</p>
                  {milestone.timing && (
                    <span className="text-xs text-text-muted mt-2 inline-block">{milestone.timing}</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {reading.guidance && (
            <div className="card border-accent-primary/20">
              <h3 className="font-semibold text-text-primary mb-2">Guidance</h3>
              <p className="text-sm text-text-secondary">{reading.guidance}</p>
            </div>
          )}
          <button onClick={() => setReading(null)} className="btn-secondary w-full">
            Re-map Pathway
          </button>
        </div>
      )}
    </div>
    </PaywallGate>
  );
}
