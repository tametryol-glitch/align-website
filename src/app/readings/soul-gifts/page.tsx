'use client';

import { useState } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Gem, ChevronDown, ChevronUp } from 'lucide-react';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { computeSoulGifts, scoreBand } from '@/lib/engines';
import type { NatalChart, SoulGiftsResult, ScoredGift } from '@/lib/engines';

const SOUL_ASTEROIDS = ['Eros', 'Psyche', 'Urania', 'Pallas', 'Ceres', 'Lilith', 'Chiron', 'Vesta', 'Juno', 'Nike', 'Apollo', 'Hygiea', 'Nemesis', 'Karma', 'Fortuna'];

const SECTIONS = [
  { key: 'topFive', label: 'Top 5 Soul Gifts', emoji: '✨', desc: 'Your strongest innate abilities' },
  { key: 'dormant', label: 'Dormant Talents', emoji: '🌱', desc: 'Gifts waiting to be awakened' },
  { key: 'money', label: 'Money Gifts', emoji: '💰', desc: 'Talents linked to financial flow' },
  { key: 'love', label: 'Love Gifts', emoji: '💜', desc: 'Gifts that deepen relationships' },
  { key: 'shadow', label: 'Shadow Gifts', emoji: '🌑', desc: 'Power hidden in your shadow' },
  { key: 'spiritual', label: 'Spiritual Gifts', emoji: '🔮', desc: 'Your connection to the divine' },
] as const;

export default function SoulGiftsPage() {
  const { profile } = useAuthStore();
  const [result, setResult] = useState<SoulGiftsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedGift, setExpandedGift] = useState<string | null>(null);

  if (!profile?.birth_date || !profile?.latitude) {
    return <BirthDataPrompt message="Add your birth data to discover your soul gifts through asteroid placements." />;
  }

  async function getReading() {
    setLoading(true);
    setError('');
    try {
      const chartData = await api.getNatalChart({
        ...buildBirthData(profile!),
        extra_asteroids: SOUL_ASTEROIDS,
      });

      // Map API response to NatalChart shape for the engine
      const chart = mapToNatalChart(chartData);
      const gifts = computeSoulGifts(chart);
      setResult(gifts);
    } catch (err: any) {
      setError(err.message || 'Failed to compute soul gifts');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Gem className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Soul Gifts</h1>
          <p className="text-text-tertiary text-sm">210+ gifts scored against your natal chart</p>
        </div>
      </div>

      {!result && !loading && (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">💎</span>
          <p className="text-text-tertiary mb-2">
            15 asteroids and all planetary placements reveal your innate talents, hidden gifts, and soul-level abilities.
          </p>
          <p className="text-text-muted text-xs mb-6">
            Powered by 210+ gift signatures with orb-precision scoring
          </p>
          <button onClick={getReading} disabled={loading} className="btn-primary">
            Discover My Soul Gifts
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}

      {loading && <LoadingCosmic label="Scoring 210+ gifts against your chart..." />}

      {result && (
        <div className="space-y-6">
          {/* Unlock steps */}
          {result.unlockSteps.length > 0 && (
            <div className="card bg-gradient-cosmic border-accent-muted">
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span className="text-lg">🔑</span> Your Unlock Actions
              </h3>
              <ol className="space-y-2">
                {result.unlockSteps.map((step, i) => (
                  <li key={i} className="text-xs text-text-secondary flex gap-2">
                    <span className="text-accent-primary font-bold">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Gift sections */}
          {SECTIONS.map(({ key, label, emoji, desc }) => {
            const items: ScoredGift[] = result[key as keyof SoulGiftsResult] as ScoredGift[] || [];
            if (!items.length) return null;
            return (
              <div key={key} className="card">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{emoji}</span>
                  <h3 className="text-lg font-semibold text-text-primary">{label}</h3>
                </div>
                <p className="text-xs text-text-muted mb-4">{desc}</p>
                <div className="space-y-3">
                  {items.map((gift) => {
                    const band = scoreBand(gift.score);
                    const isExpanded = expandedGift === gift.id;
                    return (
                      <div key={gift.id} className="border border-border-primary rounded-xl p-3">
                        <button
                          onClick={() => setExpandedGift(isExpanded ? null : gift.id)}
                          className="w-full text-left"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-text-primary">{gift.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold" style={{ color: band.color }}>
                                {gift.score}%
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                              )}
                            </div>
                          </div>
                          <ScoreBar value={gift.score} size="sm" />
                          <p className="text-[10px] mt-1" style={{ color: band.color }}>{band.label}</p>
                        </button>

                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-border-primary space-y-2 animate-in fade-in duration-300">
                            <p className="text-sm text-text-secondary">{gift.description}</p>

                            {/* Why you have this */}
                            {gift.reasons.length > 0 && (
                              <div>
                                <p className="text-[10px] uppercase text-text-muted font-semibold mb-1">Why you have this</p>
                                <p className="text-xs text-text-tertiary italic mb-2">{gift.whyExpression}</p>
                                <div className="space-y-1">
                                  {gift.reasons.map((r, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${r.isAnchor ? 'bg-gold-muted text-gold-primary' : 'bg-accent-muted text-accent-primary'}`}>
                                        {r.isAnchor ? '⚓' : '•'} +{r.weight}
                                      </span>
                                      <span className="text-xs text-text-secondary">{r.text}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Unlock action */}
                            <div className="bg-bg-tertiary rounded-lg p-2.5 mt-2">
                              <p className="text-[10px] uppercase text-text-muted font-semibold mb-1">How to activate</p>
                              <p className="text-xs text-text-secondary">{gift.unlock}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button onClick={() => { setResult(null); setExpandedGift(null); }} className="btn-secondary w-full">
            Analyze Again
          </button>
        </div>
      )}
    </div>
  );
}

/** Map the API chart response to the NatalChart type the engine expects. */
function mapToNatalChart(data: any): NatalChart {
  const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const positions = data?.planets || data?.positions || [];

  const planets = positions.map((p: any) => {
    const lon: number = p.longitude ?? 0;
    const idx = Math.floor(lon / 30) % 12;
    return {
      name: p.name || p.planet || '',
      longitude: Math.round(lon * 100) / 100,
      sign: p.sign || SIGNS[idx] || 'Aries',
      degree: Math.round((lon % 30) * 100) / 100,
      house: p.house || 1,
      retrograde: p.is_retrograde || p.retrograde || false,
    };
  });

  const houses = (data?.house_cusps || []).map((lon: number, i: number) => {
    const idx = Math.floor(lon / 30) % 12;
    return {
      house: i + 1,
      longitude: Math.round(lon * 100) / 100,
      sign: SIGNS[idx] || 'Aries',
      degree: Math.round((lon % 30) * 100) / 100,
    };
  });

  const ascPlanet = planets.find((p: any) => p.name === 'Ascendant' || p.name === 'ASC');
  const mcPlanet = planets.find((p: any) => p.name === 'MC' || p.name === 'Midheaven');

  return {
    planets,
    aspects: data?.aspects || [],
    houses,
    ascendant: ascPlanet?.longitude ?? 0,
    midheaven: mcPlanet?.longitude ?? 0,
  };
}
