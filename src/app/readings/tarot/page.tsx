'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Star } from 'lucide-react';

const SPREADS = [
  { id: 'single', name: 'Single Card', cards: 1 },
  { id: 'three', name: 'Past / Present / Future', cards: 3 },
  { id: 'celtic', name: 'Celtic Cross', cards: 10 },
];

export default function TarotPage() {
  const [spread, setSpread] = useState('single');
  const [question, setQuestion] = useState('');
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function drawCards() {
    setLoading(true);
    setError('');
    try {
      const data = await api.drawTarot({
        spread_type: spread,
        question: question || undefined,
      });
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
        <Star className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Tarot Reading</h1>
          <p className="text-text-tertiary text-sm">Draw cards and receive AI-powered interpretations</p>
        </div>
      </div>

      {!reading && (
        <div className="card space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Spread</label>
            <div className="grid grid-cols-3 gap-3">
              {SPREADS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSpread(s.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    spread === s.id
                      ? 'border-accent-primary bg-accent-muted text-accent-primary'
                      : 'border-border-primary text-text-tertiary hover:border-border-secondary'
                  }`}
                >
                  <span className="block text-lg mb-1">{s.cards} {s.cards === 1 ? 'card' : 'cards'}</span>
                  <span className="text-xs">{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Question (optional)
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="input"
              placeholder="What would you like guidance on?"
            />
          </div>

          <button onClick={drawCards} disabled={loading} className="btn-primary w-full">
            {loading ? 'Drawing cards...' : 'Draw Cards'}
          </button>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      )}

      {reading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reading.cards?.map((card: any, i: number) => (
              <div key={i} className="card text-center">
                <div className="text-4xl mb-3">{card.reversed ? '🔮' : '✨'}</div>
                <h3 className="font-semibold text-text-primary">{card.name}</h3>
                {card.reversed && (
                  <span className="text-xs text-gold-primary">(Reversed)</span>
                )}
                <p className="text-xs text-text-muted mt-1">{card.position}</p>
              </div>
            ))}
          </div>

          {reading.interpretation && (
            <div className="card">
              <h3 className="font-semibold text-text-primary mb-3">Interpretation</h3>
              <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                {reading.interpretation}
              </p>
            </div>
          )}

          <button onClick={() => setReading(null)} className="btn-secondary">
            Draw Again
          </button>
        </div>
      )}
    </div>
  );
}
