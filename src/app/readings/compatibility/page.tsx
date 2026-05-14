'use client';

import { useState } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { resolveTimezoneOffset } from '@/lib/timezoneOffset';
import Link from 'next/link';
import { Heart, ChevronDown, ChevronUp, Sparkles, AlertTriangle, RefreshCw, Share2, UserPlus, Check, ArrowLeft } from 'lucide-react';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { CitySearch } from '@/components/ui/CitySearch';
import { computeSynastryCompatibility } from '@/lib/engines';
import type { CompatibilityResult } from '@/lib/engines';
import { PaywallGate } from '@/components/ui/PaywallGate';

interface PersonInput {
  date: string;
  time: string;
  location: string;
  lat: number | null;
  lng: number | null;
  timezone: string;
}

const CATEGORY_META: Record<string, { emoji: string; label: string; color: 'accent' | 'gold' | 'green' | 'red' }> = {
  Attraction: { emoji: '🔥', label: 'Physical Attraction', color: 'red' },
  Emotional: { emoji: '💙', label: 'Emotional Bond', color: 'accent' },
  Mental: { emoji: '🧠', label: 'Mental Connection', color: 'green' },
  Stability: { emoji: '🏗️', label: 'Long-Term Stability', color: 'gold' },
  Karmic: { emoji: '🔮', label: 'Karmic Link', color: 'accent' },
  Harmony: { emoji: '☯️', label: 'Harmony', color: 'green' },
  Magnetic: { emoji: '⚡', label: 'Magnetic Pull', color: 'red' },
};

function overallBand(score: number): { label: string; color: string } {
  if (score >= 85) return { label: 'Soul-Level Connection', color: '#22c55e' };
  if (score >= 70) return { label: 'Deep Compatibility', color: '#a78bfa' };
  if (score >= 55) return { label: 'Strong Potential', color: '#9B6FF6' };
  if (score >= 40) return { label: 'Moderate Match', color: '#F5A623' };
  if (score >= 25) return { label: 'Growth Required', color: '#f59e0b' };
  return { label: 'Challenging Dynamic', color: '#ef4444' };
}

export default function CompatibilityPage() {
  const { profile } = useAuthStore();
  const [person2, setPerson2] = useState<PersonInput>({ date: '', time: '12:00', location: '', lat: null, lng: null, timezone: 'UTC' });
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAspects, setShowAspects] = useState(false);

  if (!profile?.birth_date || !profile?.latitude) {
    return <PaywallGate feature="compatibility"><BirthDataPrompt message="Add your birth data to check compatibility with someone special." /></PaywallGate>;
  }

  async function calculate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Fetch both natal charts in parallel
      const [chart1Data, chart2Data] = await Promise.all([
        api.getNatalChart(buildBirthData(profile!)),
        (() => {
          const { offset, label } = resolveTimezoneOffset(person2.timezone, person2.lng || 0, person2.date, person2.time, person2.lat || undefined);
          return api.getNatalChart({
            name: '',
            date: person2.date,
            time: person2.time,
            latitude: person2.lat || 0,
            longitude: person2.lng || 0,
            timezone: label,
            tz_offset: offset,
            location: person2.location,
          });
        })(),
      ]);

      // Extract positions and house cusps for both charts
      const positions1 = extractPositions(chart1Data);
      const positions2 = extractPositions(chart2Data);
      const houseCusps1 = chart1Data?.house_cusps || [];
      const houseCusps2 = chart2Data?.house_cusps || [];

      // Run the compatibility engine client-side
      const compatibility = computeSynastryCompatibility(
        positions1,
        positions2,
        houseCusps1,
        houseCusps2,
      );

      setResult(compatibility);
    } catch (err: any) {
      setError(err.message || 'Failed to compute compatibility');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PaywallGate feature="compatibility">
    <div className="max-w-3xl mx-auto">
      <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Readings
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Compatibility</h1>
          <p className="text-text-tertiary text-sm">7-category synastry analysis powered by 9 aspect types</p>
        </div>
      </div>

      {!result && !loading && (
        <form onSubmit={calculate} className="space-y-6">
          {/* Person 1 - auto-filled */}
          <div className="card border-accent-muted">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">👤</span>
              <h3 className="font-semibold text-text-primary">You</h3>
              <span className="text-xs text-text-muted ml-auto">(from your profile)</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-text-tertiary">
              <p>Birth: {profile.birth_date}</p>
              <p>Time: {profile.birth_time || '12:00'}</p>
            </div>
          </div>

          {/* Person 2 - manual entry */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💕</span>
              <h3 className="font-semibold text-text-primary">Their Birth Data</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-muted mb-1">Birth Date</label>
                <input
                  type="date"
                  value={person2.date}
                  onChange={(e) => setPerson2({ ...person2, date: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Birth Time</label>
                <input
                  type="time"
                  value={person2.time}
                  onChange={(e) => setPerson2({ ...person2, time: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs text-text-muted mb-1">Birth Location</label>
              <CitySearch
                value={person2.location}
                onChange={(location, lat, lon, tz) => {
                  setPerson2({ ...person2, location, lat, lng: lon, timezone: tz });
                }}
                placeholder="Search city, state, or country..."
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            Calculate Compatibility
          </button>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </form>
      )}

      {loading && <LoadingCosmic label="Computing synastry across 7 categories..." />}

      {result && (
        <div className="space-y-5">
          {/* Overall Score */}
          <div className="bg-gradient-cosmic rounded-2xl p-8 border border-accent-muted text-center">
            <p className="text-accent-secondary text-sm uppercase tracking-wider mb-2">Overall Compatibility</p>
            <p className="text-6xl font-bold text-text-primary mb-2">{result.overall_score}%</p>
            <p className="text-sm font-medium" style={{ color: overallBand(result.overall_score).color }}>
              {overallBand(result.overall_score).label}
            </p>
            {result.style_label && (
              <p className="text-xs text-text-muted mt-2">{result.style_label}</p>
            )}
          </div>

          {/* Summary */}
          {result.summary && (
            <div className="card">
              <p className="text-sm text-text-secondary leading-relaxed">{result.summary}</p>
            </div>
          )}

          {/* Category Scores */}
          <div className="card">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(result.scores).map(([cat, score]) => {
                const meta = CATEGORY_META[cat];
                if (!meta) return null;
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-lg w-7 text-center">{meta.emoji}</span>
                    <div className="flex-1">
                      <ScoreBar value={score} label={meta.label} color={meta.color} size="sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths */}
          {result.strengths.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-green-400" /> Strengths
              </h3>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-400 text-xs mt-0.5">✓</span>
                    <span className="text-xs text-text-secondary">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Challenges */}
          {result.challenges.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Challenges
              </h3>
              <ul className="space-y-2">
                {result.challenges.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 text-xs mt-0.5">!</span>
                    <span className="text-xs text-text-secondary">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Aspects Detail (collapsible) */}
          {result.aspects.length > 0 && (
            <div className="card">
              <button
                onClick={() => setShowAspects(!showAspects)}
                className="w-full flex items-center justify-between"
              >
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <span className="text-lg">🔗</span> Synastry Aspects ({result.aspects.length})
                </h3>
                {showAspects ? (
                  <ChevronUp className="w-4 h-4 text-text-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                )}
              </button>

              {showAspects && (
                <div className="mt-4 space-y-2 animate-in fade-in duration-300">
                  {result.aspects.map((asp, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border-primary last:border-0">
                      <span className={`w-2 h-2 rounded-full ${asp.supportive ? 'bg-green-400' : 'bg-amber-400'}`} />
                      <span className="text-xs text-text-primary font-medium w-16 truncate">{asp.inner}</span>
                      <span className="text-[10px] text-accent-secondary px-1.5 py-0.5 bg-accent-muted rounded">
                        {asp.aspect}
                      </span>
                      <span className="text-xs text-text-primary font-medium w-16 truncate">{asp.outer}</span>
                      <span className="ml-auto text-[10px] text-text-muted">
                        orb {Math.abs(asp.orb).toFixed(1)}°
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Share & Invite */}
          <div className="grid grid-cols-2 gap-3">
            <ShareCompatButton score={result.overall_score} />
            <button
              onClick={() => {
                const url = `${window.location.origin}/readings/compatibility`;
                const text = `Check your cosmic compatibility on Align! I got ${result!.overall_score}% — what will you get?`;
                if (navigator.share) {
                  navigator.share({ title: 'Check Our Compatibility', text, url }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(`${text}\n${url}`).catch(() => {});
                }
              }}
              className="btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              <UserPlus className="w-4 h-4" /> Invite to Compare
            </button>
          </div>

          {/* Reset */}
          <button
            onClick={() => { setResult(null); setShowAspects(false); }}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Compare Another Person
          </button>
        </div>
      )}
    </div>
    </PaywallGate>
  );
}

/** Extract planet positions from API chart response for the compatibility engine */
function extractPositions(chartData: any): Array<{ name: string; longitude: number; house?: number }> {
  const positions = chartData?.planets || chartData?.positions || [];
  return positions.map((p: any) => ({
    name: p.name || p.planet || '',
    longitude: p.longitude ?? 0,
    house: p.house || undefined,
  }));
}

function ShareCompatButton({ score }: { score: number }) {
  const [copied, setCopied] = useState(false);
  async function handleShare() {
    const url = `${window.location.origin}/readings/compatibility`;
    const text = `We scored ${score}% compatibility on Align! Check yours:`;
    if (navigator.share) {
      try { await navigator.share({ title: `${score}% Compatible — Align`, text, url }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }
  return (
    <button onClick={handleShare} className="btn-primary flex items-center justify-center gap-2 text-sm">
      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      {copied ? 'Link Copied!' : 'Share Result'}
    </button>
  );
}

