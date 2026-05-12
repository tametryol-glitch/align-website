'use client';

import { useState } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Calendar } from 'lucide-react';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { PaywallGate } from '@/components/ui/PaywallGate';

export default function YearAheadPage() {
  const { profile } = useAuthStore();
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!profile?.birth_date || !profile?.latitude) {
    return <PaywallGate feature="year_ahead"><BirthDataPrompt message="Add your birth data to generate your annual forecast." /></PaywallGate>;
  }

  async function getReading() {
    setLoading(true);
    setError('');
    try {
      const now = new Date();
      const data = await api.getYearAhead({
        ...buildBirthData(profile!),
        start_date: now.toISOString().split('T')[0],
        end_date: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString().split('T')[0],
      });
      setReading(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PaywallGate feature="year_ahead">
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Year Ahead</h1>
          <p className="text-text-tertiary text-sm">Your 12-month astrological forecast</p>
        </div>
      </div>

      {!reading && (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">📅</span>
          <p className="text-text-tertiary mb-6">
            See the major transits, eclipses, and planetary shifts coming your way over the next 12 months.
          </p>
          <button onClick={getReading} disabled={loading} className="btn-primary">
            {loading ? 'Generating Forecast...' : 'Generate My Year Ahead'}
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}

      {reading && (
        <div className="space-y-4">
          {reading.summary && (
            <div className="bg-gradient-cosmic rounded-2xl p-6 border border-accent-muted">
              <p className="text-accent-tertiary text-xs font-medium uppercase tracking-widest mb-2">
                Overview
              </p>
              <p className="text-text-secondary text-sm leading-relaxed">{reading.summary}</p>
            </div>
          )}

          {(reading.events || reading.forecasts || []).map((event: any, i: number) => (
            <div key={i} className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-text-primary">
                  {event.title || event.transit_planet || `Event ${i + 1}`}
                </h3>
                {event.date && (
                  <span className="text-xs text-text-muted">
                    {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
              {(event.description || event.interpretation) && (
                <p className="text-sm text-text-secondary">{event.description || event.interpretation}</p>
              )}
              {event.impact && (
                <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                  event.impact === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                  event.impact === 'challenging' ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {event.impact}
                </span>
              )}
            </div>
          ))}
          <button onClick={() => setReading(null)} className="btn-secondary w-full">
            Regenerate
          </button>
        </div>
      )}
    </div>
    </PaywallGate>
  );
}
