'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useDatingStore } from '@/stores/datingStore';
import {
  getUserAuraTriad,
  computeFromTriads,
  generateTemplateRelationshipReading,
} from '@/lib/relationshipAuraService';
import { AURA_DISCLAIMER } from '@/lib/auraColors';
import type { RelationshipAuraResult, AuraColorScore } from '@/types/aura';
import { ArrowLeft, Sparkles } from 'lucide-react';

// ── Score Color ─────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 75) return '#4ADE80';
  if (score >= 55) return '#FACC15';
  if (score >= 35) return '#FB923C';
  return '#F87171';
}

// ── Score Bar ────────────────────────────────────────────────────────

function ScoreBar({ label, score, icon, subLabel }: {
  label: string; score: number; icon: string; subLabel?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">{icon} {label}</span>
        <span className="text-xs font-bold" style={{ color: getScoreColor(score) }}>
          {score}/100
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(100, Math.max(5, score))}%`,
            backgroundColor: getScoreColor(score),
          }}
        />
      </div>
      {subLabel && <p className="text-[10px] text-text-muted">{subLabel}</p>}
    </div>
  );
}

// ── Aura Orb ─────────────────────────────────────────────────────────

function AuraOrb({ triad, name, colorLabel }: {
  triad: { outerAura: AuraColorScore; innerAura: AuraColorScore; emotionalCore: AuraColorScore };
  name: string;
  colorLabel: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: triad.outerAura.hex,
          boxShadow: `0 0 30px ${triad.outerAura.hex}40`,
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: triad.innerAura.hex }}
        >
          <div
            className="w-8 h-8 rounded-full"
            style={{ backgroundColor: triad.emotionalCore.hex }}
          />
        </div>
      </div>
      <p className="text-sm font-semibold text-white">{name}</p>
      <p className="text-xs text-text-tertiary">{colorLabel}</p>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────

function AuraSynastryContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get('matchId');

  const myId = useAuthStore(s => s.user?.id);
  const myName = useAuthStore(s => s.profile?.display_name || 'You');
  const matches = useDatingStore(s => s.matches);

  const match = matches.find(m => m.id === matchId);
  const partnerId = match
    ? (match.user_a_id === myId ? match.user_b_id : match.user_a_id)
    : null;
  const partnerName = match?.partner_profile?.display_name || t('dating.auraSynastry.yourMatch', 'Your Match');

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<RelationshipAuraResult | null>(null);
  const [myTriad, setMyTriad] = useState<{ outerAura: AuraColorScore; innerAura: AuraColorScore; emotionalCore: AuraColorScore } | null>(null);
  const [partnerTriad, setPartnerTriad] = useState<{ outerAura: AuraColorScore; innerAura: AuraColorScore; emotionalCore: AuraColorScore } | null>(null);
  const [readingSections, setReadingSections] = useState<Array<{ title: string; icon: string; content: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  const loadAuraData = useCallback(async () => {
    if (!myId || !partnerId) return;
    setLoading(true);
    setError(null);

    try {
      const [a, b] = await Promise.all([
        getUserAuraTriad(myId),
        getUserAuraTriad(partnerId),
      ]);

      if (!a) {
        setError(t('dating.auraSynastry.noMyAura', 'You need at least one Aura Mirror scan first. Go to Readings > Aura Mirror to scan your aura.'));
        setLoading(false);
        return;
      }
      if (!b) {
        setError(t('dating.auraSynastry.noPartnerAura', "{{name}} hasn't done an Aura Mirror scan yet. Their aura data will appear here once they do.", { name: partnerName }));
        setLoading(false);
        return;
      }

      setMyTriad(a);
      setPartnerTriad(b);

      const computed = computeFromTriads(a, b);
      setResult(computed);

      const templateSections = generateTemplateRelationshipReading(computed, partnerName);
      setReadingSections(templateSections);
    } catch {
      setError(t('dating.auraSynastry.loadError', 'Failed to load aura data. Please try again.'));
    }
    setLoading(false);
  }, [myId, partnerId, partnerName, t]);

  useEffect(() => {
    if (myId && partnerId) loadAuraData();
  }, [myId, partnerId, loadAuraData]);

  // No match found
  if (!match && !loading) {
    return (
      <div className="max-w-2xl mx-auto" style={{ minHeight: '80vh' }}>
        <div className="mb-6">
          <button onClick={() => router.back()} className="text-sm text-accent-primary hover:text-accent-secondary flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" /> {t('common.back', 'Back')}
          </button>
        </div>
        <div className="text-center py-20">
          <p className="text-text-tertiary">{t('dating.auraSynastry.matchNotFound', 'Match not found')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20" style={{ minHeight: '80vh' }}>
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-accent-primary hover:text-accent-secondary flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> {t('common.back', 'Back')}
        </button>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">{'\u{1FA9E}'}</span> {t('dating.auraSynastry.title', 'Aura Synastry')}
        </h1>
        <p className="text-sm text-text-tertiary mt-1">{myName} & {partnerName}</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-2 border-accent-primary border-t-transparent animate-spin mb-4" />
          <p className="text-sm text-text-tertiary">{t('dating.auraSynastry.loading', 'Reading your energy fields...')}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center text-center py-12 px-6">
          <span className="text-5xl mb-4">{'\u{1F52E}'}</span>
          <p className="text-sm text-text-tertiary max-w-sm mb-6">{error}</p>
          <Link
            href="/readings/aura"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #9B6FF6, #7C3AED)' }}
          >
            <Sparkles className="w-4 h-4" />
            {t('dating.auraSynastry.scanAura', 'Scan Your Aura')}
          </Link>
        </div>
      )}

      {/* Results */}
      {result && myTriad && partnerTriad && (
        <div className="space-y-6 animate-in fade-in duration-600">
          {/* Side-by-Side Aura Orbs */}
          <div className="flex items-center justify-center gap-8 py-6">
            <AuraOrb triad={myTriad} name={myName} colorLabel={myTriad.outerAura.label} />
            <div className="text-xl text-text-muted">{'\u{2726}'}</div>
            <AuraOrb triad={partnerTriad} name={partnerName} colorLabel={partnerTriad.outerAura.label} />
          </div>

          {/* Connection Line Visual */}
          <div className="flex items-center justify-center gap-3 px-8">
            <div className="h-0.5 flex-1 rounded-full" style={{ background: `linear-gradient(to right, ${myTriad.outerAura.hex}, transparent)` }} />
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getScoreColor(result.auraChemistryScore), boxShadow: `0 0 12px ${getScoreColor(result.auraChemistryScore)}60` }}
            />
            <div className="h-0.5 flex-1 rounded-full" style={{ background: `linear-gradient(to left, ${partnerTriad.outerAura.hex}, transparent)` }} />
          </div>

          {/* Chemistry Score Hero */}
          <div
            className="rounded-2xl p-6 text-center border"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.03))',
              borderColor: 'rgba(139,92,246,0.15)',
            }}
          >
            <p className="text-xs text-purple-300 uppercase tracking-wider mb-1">
              {t('dating.auraSynastry.auraChemistry', 'Aura Chemistry')}
            </p>
            <p className="text-5xl font-extrabold" style={{ color: getScoreColor(result.auraChemistryScore) }}>
              {result.auraChemistryScore}
            </p>
            <p className="text-sm text-text-secondary mt-2">
              {result.auraChemistryScore >= 75
                ? t('dating.auraSynastry.harmoniousLabel', 'Naturally Harmonious')
                : result.auraChemistryScore >= 55
                  ? t('dating.auraSynastry.warmLabel', 'Warm Connection')
                  : result.auraChemistryScore >= 35
                    ? t('dating.auraSynastry.growthLabel', 'Growth Potential')
                    : t('dating.auraSynastry.differentLabel', 'Different Frequencies')}
            </p>
          </div>

          {/* Harmony Score Bars */}
          <div
            className="rounded-2xl p-5 border space-y-3"
            style={{
              background: 'rgba(155,111,246,0.04)',
              borderColor: 'rgba(61,71,96,0.4)',
            }}
          >
            <h3 className="text-sm font-semibold text-white mb-2">
              {t('dating.auraSynastry.harmonyBreakdown', 'Harmony Breakdown')}
            </h3>
            <ScoreBar
              label={t('dating.auraSynastry.emotionalSafety', 'Emotional Safety')}
              score={result.emotionalSafetyScore}
              icon={'\u{1F49A}'}
            />
            <ScoreBar
              label={t('dating.auraSynastry.attractionHeat', 'Attraction Heat')}
              score={result.attractionHeat}
              icon={'\u{1F525}'}
            />
            <ScoreBar
              label={t('dating.auraSynastry.communication', 'Communication')}
              score={result.communicationField}
              icon={'\u{1F4AC}'}
            />
            <ScoreBar
              label={t('dating.auraSynastry.conflictWeather', 'Conflict Weather')}
              score={result.conflictWeather}
              icon="⚡"
              subLabel={
                result.conflictWeather >= 70
                  ? t('dating.auraSynastry.clearSkies', 'Clear skies')
                  : result.conflictWeather >= 45
                    ? t('dating.auraSynastry.someStorms', 'Some storms')
                    : t('dating.auraSynastry.turbulent', 'Turbulent')
              }
            />
          </div>

          {/* Reading Sections */}
          {readingSections.map((section, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 border"
              style={{
                background: 'rgba(155,111,246,0.04)',
                borderColor: 'rgba(61,71,96,0.3)',
              }}
            >
              <h3 className="text-sm font-semibold text-white mb-2">
                {section.icon} {section.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}

          {/* Disclaimer */}
          <p className="text-[10px] text-text-muted text-center leading-relaxed italic px-4">
            {AURA_DISCLAIMER}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Page wrapper with Suspense (required for useSearchParams) ──

export default function AuraSynastryPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto flex items-center justify-center" style={{ minHeight: '80vh' }}>
          <div className="w-10 h-10 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <AuraSynastryContent />
    </Suspense>
  );
}
