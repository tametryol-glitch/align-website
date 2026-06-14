'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { Sparkles, ArrowLeft, ChevronDown } from 'lucide-react';
import { PaywallGate } from '@/components/ui/PaywallGate';
import { describeOrigin, ORIGIN_CHARACTERISTICS, LORE_SECTIONS } from '@/lib/starseedContent';

export default function StarseedPage() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Which lineage cards are expanded. The dominant origin (index 0) starts open.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  async function getReading() {
    if (!profile?.birth_date || !profile?.latitude) {
      setError(t('readings.birthDataRequired'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.getStarseedAnalysis(buildBirthData(profile));
      setReading(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PaywallGate feature="starseed">
    <div className="max-w-3xl mx-auto">
      <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        {t('readings.backToReadings')}
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">{t('readings.starseedPage.title')}</h1>
          <p className="text-text-tertiary text-sm">{t('readings.starseedPage.subtitle')}</p>
        </div>
      </div>

      {!reading && (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">✦</span>
          <p className="text-text-tertiary mb-4">
            {t('readings.starseedPage.description')}
          </p>
          <button onClick={getReading} disabled={loading} className="btn-primary">
            {loading ? t('readings.starseedPage.analyzing') : t('readings.starseedPage.discoverButton')}
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}

      {reading && (() => {
        const ranked = (reading.ranked || []).filter((r: any) => r.score > 0);
        const top = ranked[0];
        const maxScore = top?.score || 1;
        return (
          <div className="space-y-4">
            {/* Dominant origin */}
            {top && (
              <div className="bg-gradient-cosmic rounded-2xl p-8 border border-accent-muted">
                <p className="text-accent-secondary text-sm font-medium uppercase tracking-wider mb-2">
                  {t('readings.starseedPage.dominantOrigin')}
                </p>
                <h2 className="text-2xl font-display font-bold text-text-primary mb-3">
                  {top.category}
                </h2>
                <p className="text-sm text-text-secondary">Your strongest soul-origin resonance</p>
              </div>
            )}

            {/* Summary */}
            {reading.summary && (
              <div className="card border-accent-muted">
                <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-2">Soul Mission</p>
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{reading.summary}</p>

                {/* Contributing factors — clean chips instead of a "(+3 pts)" prose dump */}
                {Array.isArray(reading.contributing_factors) && reading.contributing_factors.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-accent-muted/40">
                    <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-2">
                      What in your chart points here
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {reading.contributing_factors.map((f: any, i: number) => (
                        <span
                          key={i}
                          className="text-xs px-2.5 py-1 rounded-full bg-bg-tertiary text-text-secondary border border-accent-muted/30"
                          title={`Weight: ${f.points}`}
                        >
                          {f.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-text-muted italic mt-4 leading-relaxed">
                  Starseed origin is an interpretive, soul-level lens — a mirror for reflection and
                  self-understanding, not a literal claim about where you were born.
                </p>
              </div>
            )}

            {/* All lineages — click any to expand its full profile */}
            <h3 className="text-sm font-semibold text-text-primary">All Lineages</h3>
            <p className="text-xs text-text-muted -mt-2">
              Tap any lineage to reveal its gifts, shadow, life purpose, and relating style.
            </p>
            {ranked.map((r: any, i: number) => {
              const key = `${r.category}-${i}`;
              const isOpen = expanded[key] ?? i === 0;
              const pct = Math.round((r.score / maxScore) * 100);
              const chars = ORIGIN_CHARACTERISTICS[r.category];
              return (
                <div key={key} className="card">
                  <button onClick={() => toggle(key)} className="w-full text-left" aria-expanded={isOpen}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-text-primary text-sm flex items-center gap-1.5">
                        {i === 0 && <span className="text-amber-400">★</span>}
                        {r.category}
                      </h4>
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-accent-primary font-medium">{pct}%</span>
                        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </span>
                    </div>
                    <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm text-text-secondary leading-relaxed">{describeOrigin(r.category)}</p>
                      {!!chars?.traits?.length && (
                        <div className="flex flex-wrap gap-1.5">
                          {chars.traits.map((tr) => (
                            <span key={tr} className="text-xs px-2 py-0.5 rounded-full bg-accent-muted text-accent-secondary">{tr}</span>
                          ))}
                        </div>
                      )}
                      {chars && (
                        <div className="pt-2 border-t border-accent-muted/40 space-y-3">
                          <Detail label="Gifts & Powers" text={chars.gifts} />
                          <Detail label="Shadow / Earth Challenge" text={chars.earthChallenge} />
                          <Detail label="Life Purpose & Motive" text={chars.lifeLesson} />
                          <Detail label="Physical Traits" text={chars.physicalTraits} />
                          <Detail label="Relational Style" text={chars.relationalStyle} />
                        </div>
                      )}
                      {chars?.lore && (
                        <div className="pt-2 border-t border-accent-muted/40 space-y-3">
                          <p className="text-[11px] uppercase tracking-widest text-amber-400 font-semibold">Cosmic Lore</p>
                          {LORE_SECTIONS.filter((s) => chars.lore![s.key]).map((s) => (
                            <Detail key={s.key} label={s.label} text={chars.lore![s.key]!} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <button onClick={() => setReading(null)} className="btn-secondary w-full">
              Analyze Again
            </button>
          </div>
        );
      })()}
    </div>
    </PaywallGate>
  );
}

function Detail({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-accent-secondary font-semibold mb-1">{label}</p>
      <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
    </div>
  );
}
