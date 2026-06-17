'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Star, Heart, Zap, Brain, Shield, Sparkles } from 'lucide-react';

interface Fragment {
  id: string;
  user_id: string;
  fragment_user_id: string;
  display_name: string;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
  avatar_url: string | null;
  compatibility_score: number | null;
  active_cycle: string | null;
  cycle_intensity: number | null;
  cycle_summary: string | null;
  reach_out_rating: number | null;
  last_calculated: string | null;
  created_at: string;
}

interface FragmentCalculation {
  overall_score: number;
  current_cycle: string;
  cycle_intensity: number;
  cycle_summary: string;
  reach_out_rating: number;
  cycle_guidance: string | null;
  scores: Record<string, number>;
}

const CYCLE_CONFIG: Record<string, { glyph: string; color: string; label: string }> = {
  growth: { glyph: '🌱', color: '#22c55e', label: 'Growth' },
  challenge: { glyph: '⚡', color: '#ef4444', label: 'Challenge' },
  harmony: { glyph: '💜', color: '#9B6FF6', label: 'Harmony' },
  transformation: { glyph: '🔥', color: '#f59e0b', label: 'Transformation' },
  separation: { glyph: '🌊', color: '#3b82f6', label: 'Separation' },
  reunion: { glyph: '✨', color: '#F5A623', label: 'Reunion' },
  deepening: { glyph: '🌙', color: '#8b5cf6', label: 'Deepening' },
  testing: { glyph: '🛡️', color: '#6b7280', label: 'Testing' },
};

const SCORE_CATEGORIES = [
  { key: 'attraction', label: 'Attraction', icon: Heart },
  { key: 'emotional', label: 'Emotional', icon: Heart },
  { key: 'mental', label: 'Mental', icon: Brain },
  { key: 'stability', label: 'Stability', icon: Shield },
  { key: 'karmic', label: 'Karmic', icon: Sparkles },
  { key: 'harmony', label: 'Harmony', icon: Star },
  { key: 'magnetic', label: 'Magnetic', icon: Zap },
  { key: 'spiritual', label: 'Spiritual', icon: Sparkles },
];

function getScoreColor(score: number): string {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#F5A623';
  if (score >= 30) return '#f59e0b';
  return '#ef4444';
}

interface RichGuidance {
  connectionTheme?: string;
  whatYouMayFeel?: string;
  whatTheyMayFeel?: string;
  cycleLesson?: string;
  bestApproach?: string;
  whatToAvoid?: string;
  ifHandledWell?: string;
  ifHandledPoorly?: string;
  counselorAdvice?: string;
  doThis?: string;
  avoidThis?: string;
  reachOutLabel?: string;
  energyKeywords?: string[];
  connectionArchetype?: string;
}

/** cycle_guidance is a JSON-stringified GuidanceResult. Parse it; fall back to
 *  null for legacy plain-text rows. */
function parseRichGuidance(raw: string | null | undefined): RichGuidance | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    if (p && typeof p.connectionTheme === 'string') return p as RichGuidance;
  } catch { /* legacy plain text */ }
  return null;
}

const ARCHETYPE_LABELS: Record<string, string> = {
  'magnetic-unstable': 'Magnetic but Unstable',
  'bonded-blocked': 'Deeply Bonded, Emotionally Blocked',
  'romantic-uncertain': 'Romantic, Direction Unclear',
  'karmic-intense': 'Karmic & Intense',
  'supportive-expanding': 'Supportive & Expanding',
  'drifting': 'Drifting or Disconnecting',
  'healing-softening': 'Healing & Softening',
  'commitment-ready': 'Commitment Ready',
};

/** Collapsible guidance section — collapsed by default so the reading is
 *  scannable instead of a wall of text. */
function GuidanceAccordion({ icon, title, body, color, defaultOpen }: {
  icon: string; title: string; body: string; color: string; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const teaser = body.split('\n')[0];
  return (
    <div className="card mb-3 border-l-4" style={{ borderLeftColor: color }}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-2 text-left">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-semibold flex-1" style={{ color }}>{title}</span>
        <span className="text-text-muted text-lg leading-none">{open ? '⌃' : '⌄'}</span>
      </button>
      {open ? (
        <p className="text-sm text-text-secondary whitespace-pre-line mt-2 leading-relaxed">{body}</p>
      ) : (
        <p className="text-xs text-text-muted mt-1 truncate">{teaser}</p>
      )}
    </div>
  );
}

export default function FragmentDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [fragment, setFragment] = useState<Fragment | null>(null);
  const [calc, setCalc] = useState<FragmentCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    if (id && user) loadFragment();
  }, [id, user]);

  async function loadFragment() {
    if (!user?.id || !id) return;
    const supabase = createClient();

    const { data } = await supabase
      .from('user_fragments')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (data) {
      setFragment(data);
      // Try to load cached calculation
      const { data: calcData } = await supabase
        .from('fragment_calculations')
        .select('*')
        .eq('fragment_id', id)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .single();

      if (calcData) setCalc(calcData);
    }
    setLoading(false);
  }

  async function handleRecalculate() {
    if (!fragment) return;
    setRecalculating(true);
    // Trigger recalculation via Supabase edge function or just refresh
    const supabase = createClient();
    const { data } = await supabase
      .from('fragment_calculations')
      .select('*')
      .eq('fragment_id', fragment.id)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .single();

    if (data) setCalc(data);
    setRecalculating(false);
  }

  const cycle = fragment?.active_cycle ? CYCLE_CONFIG[fragment.active_cycle.toLowerCase()] : null;
  const rich = parseRichGuidance(calc?.cycle_guidance);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-text-muted text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  if (!fragment) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-text-muted mb-4">{t('errors.notFound')}</p>
        <Link href="/fragments" className="text-accent-primary text-sm hover:underline">
          {t('common.back')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/fragments" className="btn-ghost p-2 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> {t('fragments.title')}
        </Link>
        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="btn-ghost p-2 inline-flex items-center gap-1 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
          {recalculating ? t('common.loading') : t('common.retry')}
        </button>
      </div>

      {/* Profile Summary */}
      <div className="card flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-accent-muted flex items-center justify-center text-2xl font-bold text-accent-primary shrink-0">
          {fragment.avatar_url ? (
            <Image src={fragment.avatar_url} alt="Fragment avatar" width={64} height={64} className="w-full h-full rounded-full object-cover" unoptimized />
          ) : (
            (fragment.display_name || '?')[0].toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-display font-bold text-text-primary">{fragment.display_name}</h1>
          <p className="text-sm text-text-muted">
            {[fragment.sun_sign, fragment.moon_sign, fragment.rising_sign]
              .filter(Boolean).join(' · ') || 'Birth data pending'}
          </p>
          {fragment.compatibility_score != null && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-text-tertiary">Overall Match</span>
              <span className="text-sm font-bold" style={{ color: getScoreColor(fragment.compatibility_score) }}>
                {Math.round(fragment.compatibility_score)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Active Cycle Card */}
      {cycle ? (
        <div className="card mb-4 border-l-4" style={{ borderLeftColor: cycle.color }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{cycle.glyph}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: cycle.color }}>{cycle.label}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Active Cycle</p>
            </div>
            {fragment.cycle_intensity != null && (
              <div className="text-right">
                <p className="text-xs text-text-muted">Intensity</p>
                <div className="flex gap-0.5 mt-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-4 rounded-sm"
                      style={{
                        backgroundColor: i < Math.ceil((fragment.cycle_intensity || 0) / 2)
                          ? cycle.color : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          {fragment.cycle_summary && (
            <p className="text-sm text-text-secondary mt-2">{fragment.cycle_summary}</p>
          )}
        </div>
      ) : (
        <div className="card mb-4 text-center py-6">
          <p className="text-text-muted text-sm">
            {recalculating ? 'Analyzing composite transits...' : 'Tap Refresh to calculate relationship intelligence'}
          </p>
        </div>
      )}

      {/* Reach-Out Rating */}
      {fragment.reach_out_rating != null && (
        <div className="card mb-4">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Reach-Out Rating</h3>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5"
                  fill={i < (fragment.reach_out_rating || 0) ? '#F5A623' : 'none'}
                  stroke={i < (fragment.reach_out_rating || 0) ? '#F5A623' : '#6b7280'}
                />
              ))}
            </div>
            <span className="text-xs text-text-muted ml-2">
              {fragment.reach_out_rating >= 4 ? 'Great time to connect' :
               fragment.reach_out_rating >= 3 ? 'Neutral energy' :
               fragment.reach_out_rating >= 2 ? 'Proceed with care' : 'Give space'}
            </span>
          </div>
        </div>
      )}

      {/* Compatibility Scores */}
      {calc?.scores && Object.keys(calc.scores).length > 0 && (
        <div className="card mb-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Compatibility Breakdown</h3>
          <div className="space-y-3">
            {SCORE_CATEGORIES.map(({ key, label, icon: Icon }) => {
              const score = calc.scores[key];
              if (score == null) return null;
              return (
                <div key={key} className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-text-muted shrink-0" />
                  <span className="text-xs text-text-secondary w-20">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-bg-tertiary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }}
                    />
                  </div>
                  <span className="text-xs font-medium w-8 text-right" style={{ color: getScoreColor(score) }}>
                    {Math.round(score)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Guidance — parsed rich sections (or legacy plain text) */}
      {rich ? (
        <>
          {/* Energy chips + connection archetype */}
          {((rich.energyKeywords && rich.energyKeywords.length > 0) || rich.connectionArchetype) && (
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              {rich.energyKeywords?.slice(0, 5).map((k, i) => (
                <span key={i} className="text-[11px] font-semibold capitalize px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(155,111,246,0.12)', color: '#C4A2F7', border: '1px solid rgba(155,111,246,0.25)' }}>{k}</span>
              ))}
              {rich.connectionArchetype && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full ml-auto"
                  style={{ background: 'rgba(168,85,247,0.15)', color: '#A855F7' }}>
                  {ARCHETYPE_LABELS[rich.connectionArchetype] || rich.connectionArchetype}
                </span>
              )}
            </div>
          )}

          {/* Glanceable Do / Avoid — the actionable bit, up top */}
          {(rich.doThis || rich.avoidThis) && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {rich.doThis && (
                <div className="card border" style={{ borderColor: 'rgba(34,197,94,0.35)' }}>
                  <p className="text-[11px] font-bold uppercase mb-1 text-green-400">✅ Do</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{rich.doThis}</p>
                </div>
              )}
              {rich.avoidThis && (
                <div className="card border" style={{ borderColor: 'rgba(245,166,35,0.35)' }}>
                  <p className="text-[11px] font-bold uppercase mb-1 text-amber-400">⚠️ Avoid</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{rich.avoidThis}</p>
                </div>
              )}
            </div>
          )}

          {/* Sections — lead open, the rest collapsed for scannability */}
          {rich.connectionTheme && <GuidanceAccordion icon="🌌" title="The Connection" body={rich.connectionTheme} color="#9B6FF6" defaultOpen />}
          {rich.whatYouMayFeel && <GuidanceAccordion icon="💜" title="What You May Be Feeling" body={rich.whatYouMayFeel} color="#A855F7" />}
          {rich.whatTheyMayFeel && <GuidanceAccordion icon="🧠" title={`What May Be Happening With ${fragment.display_name}`} body={rich.whatTheyMayFeel} color="#6366F1" />}
          {rich.cycleLesson && <GuidanceAccordion icon="🌟" title="What This Cycle Is Teaching" body={rich.cycleLesson} color="#9B6FF6" />}
          {rich.bestApproach && <GuidanceAccordion icon="✅" title="Best Approach Right Now" body={rich.bestApproach} color="#22c55e" />}
          {rich.whatToAvoid && <GuidanceAccordion icon="⚠️" title="What To Avoid" body={rich.whatToAvoid} color="#F5A623" />}
          {rich.ifHandledWell && <GuidanceAccordion icon="✨" title="If Handled Well" body={rich.ifHandledWell} color="#10B981" />}
          {rich.ifHandledPoorly && <GuidanceAccordion icon="🚨" title="If Handled Poorly" body={rich.ifHandledPoorly} color="#ef4444" />}
          {rich.counselorAdvice && <GuidanceAccordion icon="💬" title="Counselor's Advice" body={rich.counselorAdvice} color="#A855F7" />}
        </>
      ) : calc?.cycle_guidance ? (
        <div className="card mb-4">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Cycle Guidance</h3>
          <p className="text-sm text-text-secondary whitespace-pre-line">{calc.cycle_guidance}</p>
        </div>
      ) : null}

      {/* Meta info */}
      <div className="text-center py-4">
        {fragment.last_calculated && (
          <p className="text-[10px] text-text-muted">
            Last calculated: {new Date(fragment.last_calculated).toLocaleDateString(undefined, {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        )}
        <p className="text-[10px] text-text-muted mt-1">
          Added: {new Date(fragment.created_at).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
}
