'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Star, Sun, RefreshCw } from 'lucide-react';
import { PaywallGate } from '@/components/ui/PaywallGate';
import {
  describeOrigin, ORIGIN_CHARACTERISTICS,
} from '@/lib/starseedContent';

interface FamPublic {
  family: string;
  lineage: string;
  score: number;
  core_hits: number;
  dormant_hits: number;
}

interface OriginResult {
  primary?: FamPublic | null;
  secondary?: FamPublic | null;
  mixed_lineage?: FamPublic[] | null;
  dormant_star_memory?: FamPublic[];
  confidence?: { score: number; label: string };
  stable?: boolean;
  birth_time_required_for_full_confidence?: boolean;
  why_won?: string;
  why_others_did_not?: Array<{ family: string; score: number; reason: string }>;
  supporting_placements?: string[];
  engine_outdated?: boolean;
  error?: string;
}

interface Activation {
  date?: string | null;
  activated_families?: Array<{
    lineage: string; transiting_body: string; star: string; orb: number;
  }>;
  note?: string;
}

function confColor(score: number): string {
  if (score >= 60) return 'text-amber-400';
  if (score >= 40) return 'text-accent-secondary';
  return 'text-text-muted';
}

export default function StarseedOriginPage() {
  const { profile } = useAuthStore();
  const [result, setResult] = useState<OriginResult | null>(null);
  const [activation, setActivation] = useState<Activation | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (recalculate = false) => {
    if (!profile?.birth_date || !profile?.latitude) {
      setError('Please set up your birth data first (date and location).');
      setLoading(false);
      return;
    }
    recalculate ? setRecalculating(true) : setLoading(true);
    setError('');
    try {
      const data = (await api.getStarseedOrigin(buildBirthData(profile), recalculate)) as OriginResult;
      if (data?.error || !data?.primary) {
        setError(data?.error || 'We could not read a clear soul-origin signature from this chart.');
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRecalculating(false);
    }
  }, [profile]);

  useEffect(() => { load(false); }, [load]);

  useEffect(() => {
    (async () => {
      try { setActivation((await api.getStarseedActivation()) as Activation); }
      catch { /* transient layer is best-effort */ }
    })();
  }, []);

  const primary = result?.primary || null;
  const secondary = result?.secondary || null;
  const mixed = result?.mixed_lineage || null;
  const dormant = result?.dormant_star_memory || [];
  const conf = result?.confidence || { score: 0, label: 'none' };
  const chars = primary ? ORIGIN_CHARACTERISTICS[primary.lineage] : undefined;

  return (
    <PaywallGate feature="starseed">
      <div className="max-w-3xl mx-auto">
        <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Readings
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-accent-primary" />
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">Soul Origin</h1>
            <p className="text-text-tertiary text-sm">
              Your stable star-lineage fingerprint — consistent unless your birth data changes.
            </p>
          </div>
        </div>

        {loading && (
          <div className="card text-center py-12">
            <span className="text-5xl block mb-4 animate-pulse">✦</span>
            <p className="text-text-tertiary">Reading your soul-origin fingerprint…</p>
          </div>
        )}

        {!loading && error && !primary && (
          <div className="card text-center py-12">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button onClick={() => load(false)} className="btn-primary">Retry</button>
          </div>
        )}

        {!loading && primary && (
          <div className="space-y-4">
            {/* Primary Resonance */}
            <div className="bg-gradient-cosmic rounded-2xl p-8 border border-accent-muted text-center">
              <p className="text-accent-secondary text-sm font-medium uppercase tracking-wider mb-2">
                Primary Resonance
              </p>
              <h2 className="text-3xl font-display font-bold text-text-primary mb-2">
                {primary.lineage}
              </h2>
              <p className={`text-sm font-medium capitalize ${confColor(conf.score)}`}>
                {conf.label} resonance · {conf.score}/100
              </p>
            </div>

            {mixed && mixed.length === 2 && (
              <div className="card border-accent-muted bg-accent-muted/10">
                <p className="text-sm text-text-secondary leading-relaxed">
                  ⚡ Your top two lineages — <strong>{mixed[0].lineage}</strong> and{' '}
                  <strong>{mixed[1].lineage}</strong> — scored within the blended-origin margin.
                  Read yourself as a <strong>mixed lineage</strong>, not a single origin.
                </p>
              </div>
            )}

            <div className="card">
              <p className="text-sm text-text-secondary leading-relaxed">{describeOrigin(primary.lineage)}</p>

              {result?.why_won && (
                <div className="mt-4 pt-4 border-t border-accent-muted/40">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-1">Why this won</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{result.why_won}</p>
                </div>
              )}

              {!!result?.supporting_placements?.length && (
                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-2">Supporting placements</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.supporting_placements.slice(0, 8).map((p, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-bg-tertiary text-text-tertiary">{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {!!chars?.traits?.length && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {chars.traits.map((tr) => (
                    <span key={tr} className="text-xs px-2 py-0.5 rounded-full bg-accent-muted text-accent-secondary">{tr}</span>
                  ))}
                </div>
              )}

              {chars && (
                <div className="mt-4 pt-4 border-t border-accent-muted/40 space-y-3">
                  <CharRow label="Gifts & Powers" text={chars.gifts} />
                  <CharRow label="Earth Challenge" text={chars.earthChallenge} />
                  <CharRow label="Physical Traits" text={chars.physicalTraits} />
                  <CharRow label="Relational Style" text={chars.relationalStyle} />
                </div>
              )}
            </div>

            {/* Secondary */}
            {secondary && !mixed && (
              <>
                <h3 className="text-sm font-semibold text-text-primary pt-2">Secondary Lineage</h3>
                <div className="card">
                  <h4 className="font-semibold text-text-primary text-sm mb-1 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-accent-primary" /> {secondary.lineage}
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed">{describeOrigin(secondary.lineage)}</p>
                </div>
              </>
            )}

            {/* Dormant Star Memory */}
            {!!dormant.length && (
              <>
                <h3 className="text-sm font-semibold text-text-primary pt-2">Dormant Star Memory</h3>
                <p className="text-xs text-text-muted -mt-1">
                  Hidden lineages carried in your 8th/12th houses, asteroids, or midpoints — quiet now, activatable through inner work.
                </p>
                {dormant.map((d) => (
                  <div key={d.family} className="card opacity-90">
                    <h4 className="font-semibold text-text-secondary text-sm mb-1">{d.lineage}</h4>
                    <p className="text-sm text-text-tertiary leading-relaxed">{describeOrigin(d.lineage)}</p>
                  </div>
                ))}
              </>
            )}

            {/* Earth Mission */}
            {chars && (
              <div className="card bg-accent-muted/10 border-accent-muted">
                <p className="text-[10px] uppercase tracking-widest text-accent-secondary font-semibold mb-2">✨ Earth Mission</p>
                <p className="text-sm text-text-secondary leading-relaxed">{chars.lifeLesson}</p>
              </div>
            )}

            {/* Confidence & Stability */}
            <div className="card">
              <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-1">Confidence &amp; Stability</p>
              <p className={`text-lg font-display font-bold capitalize ${confColor(conf.score)}`}>{conf.label} · {conf.score}/100</p>
              <p className="text-sm text-text-tertiary leading-relaxed mt-1">
                {result?.stable
                  ? 'This is a stable, repeatable reading — computed once and stored. The same birth data always returns the same origin.'
                  : 'This reading may vary.'}
              </p>
              {result?.birth_time_required_for_full_confidence && (
                <p className="text-sm text-amber-400 leading-relaxed mt-2">
                  ⚠ No exact birth time was used, so angle- and house-based evidence is excluded and confidence is capped. Add an exact birth time for a fuller reading.
                </p>
              )}
              {result?.engine_outdated && (
                <button onClick={() => load(true)} disabled={recalculating} className="btn-secondary mt-3 inline-flex items-center gap-1.5">
                  <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
                  {recalculating ? 'Recalculating…' : 'Recalculate with the latest engine'}
                </button>
              )}
            </div>

            {/* Current Star Activation — TRANSIENT, clearly separated */}
            {!!activation?.activated_families?.length && (
              <>
                <h3 className="text-sm font-semibold text-text-primary pt-2 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-400" /> Current Star Activation
                </h3>
                <p className="text-xs text-text-muted -mt-1">
                  Which star families are lit in the sky right now. A live, daily layer — it does <strong>not</strong> change your permanent origin above.
                </p>
                <div className="card border-sky-500/25">
                  {activation.activated_families.map((a, i) => (
                    <div key={i} className="mb-2 last:mb-0">
                      <span className="text-sm font-medium text-text-secondary">{a.lineage}</span>
                      <span className="text-xs text-text-tertiary ml-2">
                        transiting {a.transiting_body} on {a.star} ({a.orb.toFixed(1)}°)
                      </span>
                    </div>
                  ))}
                  <p className="text-xs text-text-muted italic mt-3">{activation.note || 'Refreshes daily.'}</p>
                </div>
              </>
            )}

            {/* Other lineages considered */}
            {!!result?.why_others_did_not?.length && (
              <>
                <h3 className="text-sm font-semibold text-text-primary pt-2">Other lineages considered</h3>
                {result.why_others_did_not.slice(0, 3).map((o) => (
                  <div key={o.family} className="card py-3">
                    <p className="text-sm font-medium text-text-secondary capitalize">{o.family.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-text-tertiary mt-0.5">{o.reason}</p>
                  </div>
                ))}
              </>
            )}

            <p className="text-xs text-text-muted italic text-center pt-2 leading-relaxed">
              Starseed origin is an interpretive, soul-level lens — a mirror for reflection, not a literal claim about where you were born.
            </p>
          </div>
        )}
      </div>
    </PaywallGate>
  );
}

function CharRow({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-accent-secondary font-semibold mb-1">{label}</p>
      <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
    </div>
  );
}
