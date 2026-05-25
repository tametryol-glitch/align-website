'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useDatingStore } from '@/stores/datingStore';
import { getDatingMatches, unmatch } from '@/lib/datingDiscoveryService';
import { getIcebreakersForMatch } from '@/lib/datingIcebreakerService';
import { getCosmicMood } from '@/lib/cosmicTimingEngine';
import type { ZodiacSign } from '@/lib/cosmicTimingEngine';
import {
  getCompatibilityBreakdown,
  getStrengths,
  predictRelationshipTrend,
} from '@/lib/predictiveCompatibilityEngine';
import type { UserProfile as PredictiveUserProfile } from '@/lib/predictiveCompatibilityEngine';
import { generateCosmicDNA } from '@/lib/cosmicDnaEngine';
import type { ChartData } from '@/lib/cosmicDnaEngine';
import {
  Users, Star, Heart, MessageCircle, Sparkles,
  MoreHorizontal, UserX, Zap, Gift, UserCircle,
} from 'lucide-react';
import type { DatingMatch } from '@/lib/datingDiscoveryService';
import type { Icebreaker } from '@/lib/datingIcebreakerService';

/** Feature flags for predictive engines (web has no featureFlags module) */
const PREDICTIVE_COMPATIBILITY_ENABLED = true;

const SIGN_NAME_TO_INDEX: Record<string, number> = {
  Aries: 0, Taurus: 1, Gemini: 2, Cancer: 3,
  Leo: 4, Virgo: 5, Libra: 6, Scorpio: 7,
  Sagittarius: 8, Capricorn: 9, Aquarius: 10, Pisces: 11,
};

/**
 * Build a minimal PredictiveUserProfile from available sign strings.
 * Uses sun_sign for all required fields if specific data is unavailable.
 */
function buildPredictiveProfile(
  sunSign: string | null | undefined,
  moonSign?: string | null,
  risingSign?: string | null,
): PredictiveUserProfile | null {
  if (!sunSign || SIGN_NAME_TO_INDEX[sunSign] === undefined) return null;
  const sun: number = SIGN_NAME_TO_INDEX[sunSign];
  const moon: number = (moonSign ? SIGN_NAME_TO_INDEX[moonSign] : undefined) ?? sun;
  const rising: number = (risingSign ? SIGN_NAME_TO_INDEX[risingSign] : undefined) ?? sun;
  // Generate a minimal cosmicDNA from available sign data
  const minimalChart: ChartData = {
    signs: {
      sun, moon, mercury: sun, venus: sun, mars: sun,
      jupiter: sun, saturn: sun, uranus: sun, neptune: sun,
      pluto: sun, northNode: sun, rising,
    },
    houses: {
      sun: 1, moon: 4, mercury: 3, venus: 7, mars: 1,
      jupiter: 9, saturn: 10, uranus: 11, neptune: 12,
      pluto: 8, northNode: 6, rising: 1,
    },
    aspects: [],
  };
  return {
    sunSign: sun,
    moonSign: moon,
    mercurySign: sun,
    venusSign: sun,
    marsSign: sun,
    jupiterSign: sun,
    saturnSign: sun,
    risingSign: rising,
    cosmicDNA: generateCosmicDNA(minimalChart),
  };
}

const ZODIAC_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

function getScoreColor(score: number): string {
  if (score >= 75) return '#4ADE80';
  if (score >= 55) return '#FACC15';
  if (score >= 35) return '#FB923C';
  return '#F87171';
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

export default function DatingMatchesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, profile: currentUserProfile, isLoading: authLoading } = useAuthStore();
  const { matches, setMatches, setMatchesLoading, matchesLoading, removeMatch } = useDatingStore();
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [icebreakers, setIcebreakers] = useState<Record<string, Icebreaker[]>>({});
  const [unmatchConfirm, setUnmatchConfirm] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    if (!user?.id) return;
    setMatchesLoading(true);
    const data = await getDatingMatches(user.id);
    setMatches(data);
    setMatchesLoading(false);
  }, [user?.id, setMatches, setMatchesLoading]);

  useEffect(() => {
    if (!authLoading && user) loadMatches();
  }, [authLoading, user, loadMatches]);

  const loadIcebreakers = async (matchId: string) => {
    if (!user?.id || icebreakers[matchId]) return;
    const ibs = await getIcebreakersForMatch(user.id, matchId);
    setIcebreakers((prev) => ({ ...prev, [matchId]: ibs }));
  };

  const handleUnmatch = async (matchId: string) => {
    if (!user?.id) return;
    const success = await unmatch(user.id, matchId);
    if (success) {
      removeMatch(matchId);
      setUnmatchConfirm(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users size={22} color="#9B6FF6" />
          {t('dating.matches.title')}
        </h1>
        <p className="text-sm text-text-tertiary mt-0.5">
          {t('dating.matches.connectionCount', { count: matches.length })}
        </p>
      </div>

      {/* Nav tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <Link href="/dating" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-text-tertiary hover:text-white transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <Star size={14} /> {t('dating.tabs.discover')}
        </Link>
        <Link href="/dating/likes" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-text-tertiary hover:text-white transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <Heart size={14} /> {t('dating.tabs.likes')}
        </Link>
        <Link href="/dating/matches" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium"
          style={{ backgroundColor: 'rgba(155,111,246,0.15)', color: '#B8A0FA' }}>
          <Users size={14} /> {t('dating.tabs.matches')}
        </Link>
        <Link href="/dating/rewards" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-text-tertiary hover:text-white transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <Gift size={14} /> Rewards
        </Link>
      </div>

      {/* Content */}
      {matchesLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-20 px-6">
          <div className="text-5xl mb-4">💫</div>
          <h2 className="text-lg font-semibold text-white mb-2">No matches yet</h2>
          <p className="text-text-tertiary text-sm max-w-xs mx-auto mb-6">
            When you and someone both like each other, you&apos;ll appear here.
          </p>
          <Link href="/dating"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #9B6FF6, #7C3AED)' }}>
            <Sparkles size={16} /> Discover People
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              userId={user?.id || ''}
              currentUserSunSign={currentUserProfile?.sun_sign}
              currentUserMoonSign={currentUserProfile?.moon_sign}
              currentUserRisingSign={currentUserProfile?.rising_sign}
              icebreakers={icebreakers[match.id]}
              expanded={selectedMatch === match.id}
              unmatchConfirm={unmatchConfirm === match.id}
              onToggle={() => {
                const next = selectedMatch === match.id ? null : match.id;
                setSelectedMatch(next);
                if (next) loadIcebreakers(match.id);
              }}
              onChat={() => {
                if (match.conversation_id) {
                  router.push(`/messages?conversation=${match.conversation_id}`);
                }
              }}
              onUnmatchToggle={() => setUnmatchConfirm(unmatchConfirm === match.id ? null : match.id)}
              onUnmatchConfirm={() => handleUnmatch(match.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MatchCard({
  match,
  userId,
  currentUserSunSign,
  currentUserMoonSign,
  currentUserRisingSign,
  icebreakers,
  expanded,
  unmatchConfirm,
  onToggle,
  onChat,
  onUnmatchToggle,
  onUnmatchConfirm,
}: {
  match: DatingMatch;
  userId: string;
  currentUserSunSign?: string | null;
  currentUserMoonSign?: string | null;
  currentUserRisingSign?: string | null;
  icebreakers?: Icebreaker[];
  expanded: boolean;
  unmatchConfirm: boolean;
  onToggle: () => void;
  onChat: () => void;
  onUnmatchToggle: () => void;
  onUnmatchConfirm: () => void;
}) {
  const partner = match.partner_profile;
  const photo = partner?.photo_urls?.[0] || partner?.avatar_url;
  const score = match.compatibility_score;
  const days = daysSince(match.journey_started_at);

  const cosmicMood = useMemo(() => {
    const partnerSign = (partner?.sun_sign?.toLowerCase() || 'aries') as ZodiacSign;
    return getCosmicMood(partnerSign, new Date());
  }, [partner?.sun_sign]);

  // Predictive compatibility insights
  const predictiveInsights = useMemo(() => {
    if (!PREDICTIVE_COMPATIBILITY_ENABLED || !partner?.sun_sign) return null;
    const profileA = buildPredictiveProfile(currentUserSunSign || 'Aries', currentUserMoonSign, currentUserRisingSign);
    const profileB = buildPredictiveProfile(partner.sun_sign, partner.moon_sign, partner.rising_sign);
    if (!profileA || !profileB) return null;
    const breakdown = getCompatibilityBreakdown(profileA, profileB);
    const strengths = getStrengths(breakdown);
    const trend = predictRelationshipTrend(score ?? breakdown.overall);
    return { strengths: strengths.slice(0, 3), trend };
  }, [partner?.sun_sign, partner?.moon_sign, partner?.rising_sign, score, currentUserSunSign, currentUserMoonSign, currentUserRisingSign]);

  const MOOD_ICONS: Record<string, string> = {
    electric: '⚡', flowing: '🌊', grounded: '🌿',
    introspective: '🌙', passionate: '🔥',
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: 'linear-gradient(135deg, rgba(155,111,246,0.06), rgba(155,111,246,0.02))',
      border: '1px solid rgba(61,71,96,0.4)',
    }}>
      {/* Main row */}
      <button onClick={onToggle} className="w-full p-4 flex items-center gap-3 text-left">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0" style={{
          border: '2px solid rgba(155,111,246,0.3)',
        }}>
          {photo ? (
            <Image src={photo} alt={partner?.display_name || ''} width={56} height={56} className="object-cover w-full h-full" unoptimized />
          ) : (
            <div className="w-full h-full bg-accent-muted flex items-center justify-center">
              <span className="text-lg text-accent-primary">
                {partner?.display_name?.[0]?.toUpperCase() || '✨'}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold truncate">
              {partner?.display_name || 'Cosmic Match'}
            </span>
            {partner?.photo_verified && (
              <span className="text-xs text-green-400">✓</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            {partner?.sun_sign && (
              <span>{ZODIAC_GLYPHS[partner.sun_sign]} {partner.sun_sign}</span>
            )}
            <span>·</span>
            <span>Matched {days === 0 ? 'today' : `${days}d ago`}</span>
          </div>
          <span className="text-xs" style={{ color: '#A78BFA' }}>
            {MOOD_ICONS[cosmicMood.mood] || '🌙'} {cosmicMood.description}
          </span>
        </div>

        {/* Score */}
        {score != null && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{
            backgroundColor: 'rgba(0,0,0,0.2)',
          }}>
            <Sparkles size={12} style={{ color: getScoreColor(score) }} />
            <span className="text-xs font-semibold" style={{ color: getScoreColor(score) }}>
              {score}%
            </span>
          </div>
        )}
      </button>

      {/* Expanded section */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid rgba(61,71,96,0.3)' }}>
          {/* Icebreakers */}
          {icebreakers && icebreakers.length > 0 && (
            <div className="pt-3">
              <p className="text-xs font-medium text-accent-secondary mb-2 flex items-center gap-1">
                <Zap size={12} /> Cosmic Icebreakers
              </p>
              <div className="space-y-2">
                {icebreakers.map((ib, i) => (
                  <div key={i} className="rounded-xl p-3 text-sm text-text-secondary" style={{
                    backgroundColor: 'rgba(155,111,246,0.06)',
                    border: '1px solid rgba(155,111,246,0.1)',
                  }}>
                    {ib.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Predictive Compatibility Insights */}
          {predictiveInsights && predictiveInsights.strengths.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-medium text-accent-secondary mb-1">Compatibility Insights</p>
              {predictiveInsights.strengths.map((s, i) => (
                <p key={i} className="text-xs text-text-secondary">{s}</p>
              ))}
              <p className="text-xs text-text-muted mt-1">
                Trend: {predictiveInsights.trend === 'rising' ? 'Rising' : predictiveInsights.trend === 'stable' ? 'Stable' : 'Challenging'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onChat}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #9B6FF6, #7C3AED)', color: '#fff' }}
            >
              <MessageCircle size={14} /> Message
            </button>
            <Link
              href={`/user/${userId === match.user_a_id ? match.user_b_id : match.user_a_id}`}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: 'rgba(155,111,246,0.12)', color: '#B8A0FA' }}
            >
              <UserCircle size={14} /> View Profile
            </Link>
            <button
              onClick={onUnmatchToggle}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <MoreHorizontal size={16} color="#7B849A" />
            </button>
          </div>

          {/* Unmatch confirmation */}
          {unmatchConfirm && (
            <div className="rounded-xl p-3 flex items-center gap-3" style={{
              backgroundColor: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.2)',
            }}>
              <UserX size={16} color="#F87171" />
              <span className="text-sm text-text-secondary flex-1">Unmatch {partner?.display_name}?</span>
              <button
                onClick={onUnmatchConfirm}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400"
                style={{ backgroundColor: 'rgba(248,113,113,0.15)' }}
              >
                Unmatch
              </button>
              <button
                onClick={onUnmatchToggle}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
