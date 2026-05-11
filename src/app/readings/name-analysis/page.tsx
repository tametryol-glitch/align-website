'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Type } from 'lucide-react';

export default function NameAnalysisPage() {
  const [name, setName] = useState('');
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function analyze(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.getNameAnalysis({ name });
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
        <Type className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Name Analysis</h1>
          <p className="text-text-tertiary text-sm">Numerological vibration of your name</p>
        </div>
      </div>

      {!reading && (
        <form onSubmit={analyze} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Enter any name to analyze"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Analyzing...' : 'Analyze Name'}
          </button>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </form>
      )}

      {reading && (
        <div className="space-y-4">
          {reading.summary && (
            <div className="bg-gradient-cosmic rounded-2xl p-8 border border-accent-muted">
              <h2 className="text-xl font-display font-bold text-text-primary mb-3">
                Analysis: {name}
              </h2>
              <p className="text-text-secondary">{reading.summary}</p>
            </div>
          )}
          {reading.numbers?.map((num: any, i: number) => (
            <div key={i} className="card flex items-center gap-4">
              <span className="text-3xl font-bold text-accent-primary">{num.value}</span>
              <div>
                <h3 className="font-semibold text-text-primary">{num.label}</h3>
                <p className="text-sm text-text-tertiary">{num.meaning}</p>
              </div>
            </div>
          ))}
          <button onClick={() => setReading(null)} className="btn-secondary">
            Analyze Another Name
          </button>
        </div>
      )}
    </div>
  );
}
