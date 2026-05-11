'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Clock } from 'lucide-react';
import { getPlanetGlyph } from '@/lib/utils';

export default function PlanetaryHoursPage() {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [hours, setHours] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function calculateHours(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.getPlanetaryHours({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        date: new Date().toISOString().split('T')[0],
      });
      setHours(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function useMyLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(4));
          setLongitude(pos.coords.longitude.toFixed(4));
        },
        () => setError('Could not get location')
      );
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Planetary Hours</h1>
          <p className="text-text-tertiary text-sm">Optimal timing for activities based on planetary rulers</p>
        </div>
      </div>

      {!hours && (
        <form onSubmit={calculateHours} className="card space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Latitude</label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="input"
                placeholder="40.7128"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Longitude</label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="input"
                placeholder="-74.0060"
                required
              />
            </div>
          </div>
          <button type="button" onClick={useMyLocation} className="btn-ghost text-sm">
            Use my current location
          </button>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Calculating...' : 'Get Planetary Hours'}
          </button>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </form>
      )}

      {hours && (
        <div className="space-y-4">
          {hours.current_hour && (
            <div className="bg-gradient-cosmic rounded-2xl p-6 border border-accent-muted">
              <p className="text-accent-secondary text-sm uppercase tracking-wider mb-1">Current Hour</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getPlanetGlyph(hours.current_hour.planet)}</span>
                <div>
                  <h2 className="text-xl font-bold text-text-primary">
                    Hour of {hours.current_hour.planet}
                  </h2>
                  <p className="text-sm text-text-tertiary">
                    {hours.current_hour.start} — {hours.current_hour.end}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-3">Today&apos;s Hours</h3>
            <div className="space-y-2">
              {(hours.day_hours || hours.hours || []).map((hour: any, i: number) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    hour.is_current ? 'bg-accent-muted' : 'bg-bg-tertiary/30'
                  }`}
                >
                  <span className="text-xl w-8">{getPlanetGlyph(hour.planet)}</span>
                  <span className="font-medium text-text-primary text-sm flex-1">{hour.planet}</span>
                  <span className="text-xs text-text-muted">{hour.start} – {hour.end}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => setHours(null)} className="btn-secondary">
            Recalculate
          </button>
        </div>
      )}
    </div>
  );
}
