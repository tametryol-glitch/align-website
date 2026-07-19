'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Star, Sun, RefreshCw } from 'lucide-react';
import { PaywallGate } from '@/components/ui/PaywallGate';
import {
  describeOrigin, ORIGIN_CHARACTERISTICS, LORE_SECTIONS,
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
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const [result, setResult] = useState<OriginResult | null>(null);
  const [activation, setActivation] = useState<Activation | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (recalculate = false) => {
    if (!profile?.birth_date || !profile?.latitude) {
      setError(t('readings.starseedOrigin.birthDataRequired'));
      setLoading(false);
      return;
    }
    recalculate ? setRecalculating(true) : setLoading(true);
    setError('');
    try {
      const data = (await api.getStarseedOrigin(buildBirthData(profile), recalculate)) as OriginResult;
      if (data?.error || !data?.primary) {
        setError(data?.error || t('readings.starseedOrigin.noClearSignature'));
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRecalculating(false);
    }
  }, [profile, t]);

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
          <ArrowLeft className="w-4 h-4" /> {t('readings.backToReadings')}
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-accent-primary" />
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">{t('readings.starseedOrigin.title')}</h1>
            <p className="text-text-tertiary text-sm">
              {t('readings.starseedOrigin.subtitle')}
            </p>
          </div>
        </div>

        {loading && (
          <div className="card text-center py-12">
            <span className="text-5xl block mb-4 animate-pulse">✦</span>
            <p className="text-text-tertiary">{t('readings.starseedOrigin.loading')}</p>
          </div>
        )}

        {!loading && error && !primary && (
          <div className="card text-center py-12">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button onClick={() => load(false)} className="btn-primary">{t('common.retry')}</button>
          </div>
        )}

        {!loading && primary && (
          <div className="space-y-4">
            {/* Primary Resonance */}
            <div className="bg-gradient-cosmic rounded-2xl p-8 border border-accent-muted text-center">
              <p className="text-accent-secondary text-sm font-medium uppercase tracking-wider mb-2">
                {t('readings.starseedOrigin.primaryResonance')}
              </p>
              <h2 className="text-3xl font-display font-bold text-text-primary mb-2">
                {primary.lineage}
              </h2>
              <p className={`text-sm font-medium capitalize ${confColor(conf.score)}`}>
                {t('readings.starseedOrigin.resonanceLine', { label: conf.label, score: conf.score })}
              </p>
            </div>

            {mixed && mixed.length === 2 && (
              <div className="card border-accent-muted bg-accent-muted/10">
                <p className="text-sm text-text-secondary leading-relaxed">
                  ⚡ {t('readings.starseedOrigin.mixedIntro')} <strong>{mixed[0].lineage}</strong>{' '}
                  {t('readings.starseedOrigin.mixedAnd')} <strong>{mixed[1].lineage}</strong>{' '}
                  {t('readings.starseedOrigin.mixedOutro')} <strong>{t('readings.starseedOrigin.mixedLineageTerm')}</strong>
                  {t('readings.starseedOrigin.mixedEnd')}
                </p>
              </div>
            )}

            <div className="card">
              <p className="text-sm text-text-secondary leading-relaxed">{describeOrigin(primary.lineage)}</p>

              {result?.why_won && (
                <div className="mt-4 pt-4 border-t border-accent-muted/40">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-1">{t('readings.starseedOrigin.whyThisWon')}</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{result.why_won}</p>
                </div>
              )}

              {!!result?.supporting_placements?.length && (
                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-2">{t('readings.starseedOrigin.supportingPlacements')}</p>
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
                  <CharRow label={t('readings.starseedOrigin.giftsPowers')} text={chars.gifts} />
                  <CharRow label={t('readings.starseedOrigin.earthChallenge')} text={chars.earthChallenge} />
                  <CharRow label={t('readings.starseedOrigin.physicalTraits')} text={chars.physicalTraits} />
                  <CharRow label={t('readings.starseedOrigin.relationalStyle')} text={chars.relationalStyle} />
                </div>
              )}
              {chars?.lore && (
                <div className="mt-4 pt-4 border-t border-accent-muted/40 space-y-3">
                  <p className="text-[11px] uppercase tracking-widest text-amber-400 font-semibold">{t('readings.starseedOrigin.cosmicLore')}</p>
                  {LORE_SECTIONS.filter((s) => chars.lore![s.key]).map((s) => (
                    <CharRow key={s.key} label={s.label} text={chars.lore![s.key]!} />
                  ))}
                </div>
              )}
            </div>

            {/* Secondary */}
            {secondary && !mixed && (
              <>
                <h3 className="text-sm font-semibold text-text-primary pt-2">{t('readings.starseedOrigin.secondaryLineage')}</h3>
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
                <h3 className="text-sm font-semibold text-text-primary pt-2">{t('readings.starseedOrigin.dormantStarMemory')}</h3>
                <p className="text-xs text-text-muted -mt-1">
                  {t('readings.starseedOrigin.dormantDescription')}
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
                <p className="text-[10px] uppercase tracking-widest text-accent-secondary font-semibold mb-2">✨ {t('readings.starseedOrigin.earthMission')}</p>
                <p className="text-sm text-text-secondary leading-relaxed">{chars.lifeLesson}</p>
              </div>
            )}

            {/* Confidence & Stability */}
            <div className="card">
              <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-1">{t('readings.starseedOrigin.confidenceStability')}</p>
              <p className={`text-lg font-display font-bold capitalize ${confColor(conf.score)}`}>{conf.label} · {conf.score}/100</p>
              <p className="text-sm text-text-tertiary leading-relaxed mt-1">
                {result?.stable
                  ? t('readings.starseedOrigin.stableReading')
                  : t('readings.starseedOrigin.mayVary')}
              </p>
              {result?.birth_time_required_for_full_confidence && (
                <p className="text-sm text-amber-400 leading-relaxed mt-2">
                  ⚠ {t('readings.starseedOrigin.noBirthTimeWarning')}
                </p>
              )}
              {result?.engine_outdated && (
                <button onClick={() => load(true)} disabled={recalculating} className="btn-secondary mt-3 inline-flex items-center gap-1.5">
                  <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
                  {recalculating ? t('readings.starseedOrigin.recalculating') : t('readings.starseedOrigin.recalculate')}
                </button>
              )}
            </div>

            {/* Current Star Activation — TRANSIENT, clearly separated */}
            {!!activation?.activated_families?.length && (
              <>
                <h3 className="text-sm font-semibold text-text-primary pt-2 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-400" /> {t('readings.starseedOrigin.currentStarActivation')}
                </h3>
                <p className="text-xs text-text-muted -mt-1">
                  {t('readings.starseedOrigin.activationDescA')} <strong>{t('readings.starseedOrigin.activationDescNot')}</strong> {t('readings.starseedOrigin.activationDescB')}
                </p>
                <div className="card border-sky-500/25">
                  {activation.activated_families.map((a, i) => (
                    <div key={i} className="mb-2 last:mb-0">
                      <span className="text-sm font-medium text-text-secondary">{a.lineage}</span>
                      <span className="text-xs text-text-tertiary ml-2">
                        {t('readings.starseedOrigin.transitingLine', { body: a.transiting_body, star: a.star, orb: a.orb.toFixed(1) })}
                      </span>
                    </div>
                  ))}
                  <p className="text-xs text-text-muted italic mt-3">{activation.note || t('readings.starseedOrigin.refreshesDaily')}</p>
                </div>
              </>
            )}

            {/* Other lineages considered */}
            {!!result?.why_others_did_not?.length && (
              <>
                <h3 className="text-sm font-semibold text-text-primary pt-2">{t('readings.starseedOrigin.otherLineages')}</h3>
                {result.why_others_did_not.slice(0, 3).map((o) => (
                  <div key={o.family} className="card py-3">
                    <p className="text-sm font-medium text-text-secondary capitalize">{o.family.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-text-tertiary mt-0.5">{o.reason}</p>
                  </div>
                ))}
              </>
            )}

            <p className="text-xs text-text-muted italic text-center pt-2 leading-relaxed">
              {t('readings.starseedOrigin.disclaimer')}
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
