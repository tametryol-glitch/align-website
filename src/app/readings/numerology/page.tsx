'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Hash } from 'lucide-react';
import { PaywallGate } from '@/components/ui/PaywallGate';

export default function NumerologyPage() {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function calculateNumerology(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.getNumerology({ full_name: name, birth_date: birthDate });
      setReading(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PaywallGate feature="numerology_reading" fallbackTier="light">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Hash className="w-8 h-8 text-accent-primary" />
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">Numerology</h1>
            <p className="text-text-tertiary text-sm">Discover your life path and personal numbers</p>
          </div>
        </div>

        {!reading && (
          <form onSubmit={calculateNumerology} className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Your full birth name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Birth Date</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="input"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Calculating...' : 'Calculate Numerology'}
            </button>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </form>
        )}

        {reading && (
          <div className="space-y-4">
            {reading.life_path && (
              <div className="card">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl font-bold text-accent-primary">{reading.life_path.number}</span>
                  <div>
                    <h3 className="font-semibold text-text-primary">Life Path Number</h3>
                    <p className="text-sm text-text-tertiary">{reading.life_path.title}</p>
                  </div>
                </div>
                <p className="text-text-secondary text-sm mt-3">{reading.life_path.description}</p>
              </div>
            )}
            {reading.expression && (
              <div className="card">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl font-bold text-gold-primary">{reading.expression.number}</span>
                  <div>
                    <h3 className="font-semibold text-text-primary">Expression Number</h3>
                    <p className="text-sm text-text-tertiary">{reading.expression.title}</p>
                  </div>
                </div>
                <p className="text-text-secondary text-sm mt-3">{reading.expression.description}</p>
              </div>
            )}
            {reading.soul_urge && (
              <div className="card">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl font-bold text-elements-water">{reading.soul_urge.number}</span>
                  <div>
                    <h3 className="font-semibold text-text-primary">Soul Urge Number</h3>
                    <p className="text-sm text-text-tertiary">{reading.soul_urge.title}</p>
                  </div>
                </div>
                <p className="text-text-secondary text-sm mt-3">{reading.soul_urge.description}</p>
              </div>
            )}
            <button onClick={() => setReading(null)} className="btn-secondary">
              Calculate Again
            </button>
          </div>
        )}
      </div>
    </PaywallGate>
  );
}
