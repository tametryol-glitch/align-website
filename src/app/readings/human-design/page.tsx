'use client';

import { useState } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Hexagon } from 'lucide-react';
import { PaywallGate } from '@/components/ui/PaywallGate';

export default function HumanDesignPage() {
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
      const data = await api.getHumanDesign(buildBirthData(profile));
      setReading(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PaywallGate feature="human_design">
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Hexagon className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Human Design</h1>
          <p className="text-text-tertiary text-sm">Your energetic blueprint and life strategy</p>
        </div>
      </div>

      {!reading && (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">⬡</span>
          <p className="text-text-tertiary mb-4">
            Discover your Human Design type, strategy, authority, and profile.
          </p>
          <button onClick={getReading} disabled={loading} className="btn-primary">
            {loading ? 'Calculating...' : 'Get My Design'}
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}

      {reading && (
        <div className="space-y-4">
          {reading.type && (
            <div className="bg-gradient-cosmic rounded-2xl p-8 border border-accent-muted">
              <p className="text-accent-secondary text-sm uppercase tracking-wider mb-1">Your Type</p>
              <h2 className="text-2xl font-display font-bold text-text-primary">{reading.type}</h2>
              {reading.strategy && (
                <p className="text-text-secondary mt-2">Strategy: {reading.strategy}</p>
              )}
              {reading.authority && (
                <p className="text-text-tertiary mt-1">Authority: {reading.authority}</p>
              )}
            </div>
          )}
          {reading.profile && (
            <div className="card">
              <h3 className="font-semibold text-text-primary mb-2">Profile</h3>
              <p className="text-text-secondary">{reading.profile}</p>
            </div>
          )}
          {reading.definition && (
            <div className="card">
              <h3 className="font-semibold text-text-primary mb-2">Definition</h3>
              <p className="text-text-secondary">{reading.definition}</p>
            </div>
          )}
          {reading.centers && (
            <div className="card">
              <h3 className="font-semibold text-text-primary mb-3">Energy Centers</h3>
              <div className="grid grid-cols-3 gap-2">
                {reading.centers.map((center: any) => (
                  <div
                    key={center.name}
                    className={`p-3 rounded-xl text-center text-sm ${
                      center.defined
                        ? 'bg-accent-muted text-accent-primary'
                        : 'bg-bg-tertiary text-text-muted'
                    }`}
                  >
                    {center.name}
                  </div>
                ))}
              </div>
            </div>
          )}
          <button onClick={() => setReading(null)} className="btn-secondary">
            Recalculate
          </button>
        </div>
      )}
    </div>
    </PaywallGate>
  );
}
