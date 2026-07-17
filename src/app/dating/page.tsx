'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useDatingStore } from '@/stores/datingStore';
import {
  getDailyCosmicPicks,
  likeDatingProfile,
  passDatingProfile,
  getDailyLimits,
  subscribeToDatingMatches,
  subscribeToDatingLikes,
} from '@/lib/datingDiscoveryService';
import { getDatingProfile } from '@/lib/datingProfileService';
import { DatingProfileCard } from '@/components/dating/DatingProfileCard';
import { MatchCelebration } from '@/components/dating/MatchCelebration';
import { DatingFilterDrawer } from '@/components/dating/DatingFilterDrawer';
import { Sparkles, Heart, Users, SlidersHorizontal, Star, Camera, Mic, Shield, UserCircle, Gift } from 'lucide-react';
import { DailyCosmicCard } from '@/components/DailyCosmicCard';

export default function DatingDiscoveryPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuthStore();
  const { tier } = useSubscriptionStore();
  const {
    dailyPicks, currentPickIndex, discoveryLoading,
    dailyLimits, showMatchCelebration, celebrationMatch, filters,
    setDailyPicks, setCurrentPickIndex, advancePick, setDiscoveryLoading,
    setDailyLimits, incrementLikesUsed, incrementRosesUsed,
    showCelebration, dismissCelebration, setFilters, addMatch,
    addReceivedLike,
  } = useDatingStore();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (!user?.id || authLoading) return;
    getDatingProfile(user.id).then((data) => {
      setHasProfile(!!(data?.display_name && data?.sun_sign));
      setProfileChecked(true);
    });
  }, [user?.id, authLoading]);

  const loadPicks = useCallback(async () => {
    if (!user?.id) return;
    setDiscoveryLoading(true);
    try {
      const [picks, limits] = await Promise.all([
        getDailyCosmicPicks(user.id, tier, filters),
        getDailyLimits(user.id, tier),
      ]);
      setDailyPicks(picks);
      setDailyLimits(limits);
    } catch {
      setActionError(t('dating.discovery.genericError'));
    }
    setDiscoveryLoading(false);
  }, [user?.id, tier, filters, setDailyPicks, setDailyLimits, setDiscoveryLoading]);

  useEffect(() => {
    if (!authLoading && user && hasProfile) {
      loadPicks();
    }
  }, [authLoading, user, hasProfile, loadPicks]);

  // Realtime subscriptions
  useEffect(() => {
    if (!user?.id) return;
    const matchSub = subscribeToDatingMatches(user.id, (match) => {
      addMatch(match);
    });
    const likeSub = subscribeToDatingLikes(user.id, (like) => {
      addReceivedLike(like);
    });
    return () => {
      matchSub.unsubscribe();
      likeSub.unsubscribe();
    };
  }, [user?.id, addMatch, addReceivedLike]);

  const currentPick = dailyPicks[currentPickIndex];
  const likesRemaining = dailyLimits ? dailyLimits.max_likes - dailyLimits.likes_used : 0;
  const rosesRemaining = dailyLimits ? dailyLimits.max_roses - dailyLimits.roses_used : 0;

  const handleLike = useCallback(async () => {
    if (!user?.id || !currentPick || actionLoading) return;
    setActionLoading(true);
    setActionError(null);
    const result = await likeDatingProfile(user.id, currentPick.id, 'standard');
    if (result.success) {
      incrementLikesUsed();
      if (result.mutual && result.match_id) {
        showCelebration({
          id: result.match_id,
          user_a_id: user.id < currentPick.id ? user.id : currentPick.id,
          user_b_id: user.id < currentPick.id ? currentPick.id : user.id,
          status: 'active',
          matched_at: new Date().toISOString(),
          conversation_id: result.conversation_id || null,
          cosmic_match_id: result.cosmic_match_id || null,
          compatibility_score: currentPick.compatibility_score,
          icebreakers: [],
          journey_started_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          partner_profile: currentPick,
        });
      }
      advancePick();
    } else {
      const msg = result.error === 'daily_like_limit'
        ? t('dating.discovery.dailyLikeLimit', { limit: result.limit })
        : result.error || t('dating.discovery.genericError');
      setActionError(msg);
      setTimeout(() => setActionError(null), 4000);
    }
    setActionLoading(false);
  }, [user?.id, currentPick, actionLoading, incrementLikesUsed, advancePick, showCelebration]);

  const handleRose = useCallback(async () => {
    if (!user?.id || !currentPick || actionLoading) return;
    setActionLoading(true);
    setActionError(null);
    const result = await likeDatingProfile(user.id, currentPick.id, 'cosmic_rose');
    if (result.success) {
      incrementRosesUsed();
      if (result.mutual && result.match_id) {
        showCelebration({
          id: result.match_id,
          user_a_id: user.id < currentPick.id ? user.id : currentPick.id,
          user_b_id: user.id < currentPick.id ? currentPick.id : user.id,
          status: 'active',
          matched_at: new Date().toISOString(),
          conversation_id: result.conversation_id || null,
          cosmic_match_id: result.cosmic_match_id || null,
          compatibility_score: currentPick.compatibility_score,
          icebreakers: [],
          journey_started_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          partner_profile: currentPick,
        });
      }
      advancePick();
    } else {
      const msg = result.error === 'daily_rose_limit'
        ? t('dating.discovery.dailyRoseLimit', { limit: result.limit })
        : result.error === 'daily_like_limit'
          ? t('dating.discovery.dailyLikeLimit', { limit: result.limit })
          : result.error || t('dating.discovery.genericError');
      setActionError(msg);
      setTimeout(() => setActionError(null), 4000);
    }
    setActionLoading(false);
  }, [user?.id, currentPick, actionLoading, incrementRosesUsed, advancePick, showCelebration]);

  const handlePass = useCallback(async () => {
    if (!user?.id || !currentPick || actionLoading) return;
    setActionLoading(true);
    await passDatingProfile(user.id, currentPick.id);
    advancePick();
    setActionLoading(false);
  }, [user?.id, currentPick, actionLoading, advancePick]);

  const handleChatFromCelebration = useCallback(() => {
    if (celebrationMatch?.conversation_id) {
      dismissCelebration();
      router.push(`/messages?conversation=${celebrationMatch.conversation_id}`);
    } else {
      dismissCelebration();
      router.push('/dating/matches');
    }
  }, [celebrationMatch, dismissCelebration, router]);

  if (!profileChecked || authLoading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center" style={{ minHeight: '80vh' }}>
        <div className="w-10 h-10 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="max-w-3xl mx-auto" style={{ minHeight: '100vh' }}>
        <div className="flex flex-col items-center justify-center text-center px-6 py-16">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'linear-gradient(135deg, rgba(155,111,246,0.2), rgba(236,72,153,0.2))' }}>
            <Heart size={40} color="#EC4899" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">{t('dating.introTitle')}</h1>
          <p className="text-text-tertiary text-base max-w-sm mb-8">
            {t('dating.introDescription')}
          </p>

          <Link href="/dating/profile"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white mb-8"
            style={{ background: 'linear-gradient(135deg, #9B6FF6, #EC4899)' }}>
            <Sparkles size={18} />
            {t('dating.createProfileButton')}
          </Link>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-md">
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <Camera size={20} color="#9B6FF6" />
              <p className="text-xs text-text-tertiary text-center">{t('dating.featurePhotos')}</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <Star size={20} color="#9B6FF6" />
              <p className="text-xs text-text-tertiary text-center">{t('dating.featureCompatibility')}</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <Shield size={20} color="#9B6FF6" />
              <p className="text-xs text-text-tertiary text-center">{t('dating.featureSafety')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles size={22} color="#9B6FF6" />
            {t('dating.title')}
          </h1>
          <p className="text-sm text-text-tertiary mt-0.5">{t('dating.subtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dating/profile"
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(155,111,246,0.1)' }}>
            <UserCircle size={18} color="#9B6FF6" />
          </Link>
          <button
            onClick={() => setFiltersOpen(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(155,111,246,0.1)' }}
          >
            <SlidersHorizontal size={18} color="#9B6FF6" />
          </button>
        </div>
      </div>

      {/* Quick nav tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <Link href="/dating" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium"
          style={{ backgroundColor: 'rgba(155,111,246,0.15)', color: '#B8A0FA' }}>
          <Star size={14} /> {t('dating.tabs.discover')}
        </Link>
        <Link href="/dating/likes" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-text-tertiary hover:text-white transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <Heart size={14} /> {t('dating.tabs.likes')}
        </Link>
        <Link href="/dating/matches" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-text-tertiary hover:text-white transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <Users size={14} /> {t('dating.tabs.matches')}
        </Link>
        <Link href="/dating/rewards" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-text-tertiary hover:text-white transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <Gift size={14} /> Rewards
        </Link>
        <Link href="/dating/profile" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-text-tertiary hover:text-white transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <UserCircle size={14} /> {t('dating.tabs.myProfile')}
        </Link>
      </div>

      {/* Error banner */}
      {actionError && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-200 border border-red-500/30"
          style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
          {actionError}
        </div>
      )}

      {/* Daily Cosmic Card */}
      {profile?.sun_sign && (
        <DailyCosmicCard
          sunSign={profile.sun_sign}
          moonSign={profile.moon_sign}
          risingSign={profile.rising_sign}
          birthDate={profile.birth_date}
          birthTime={profile.birth_time}
        />
      )}

      {/* Main content */}
      {discoveryLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-2 border-accent-primary border-t-transparent animate-spin mb-4" />
          <p className="text-text-tertiary text-sm">{t('dating.discovery.consulting')}</p>
        </div>
      ) : !currentPick || currentPickIndex >= dailyPicks.length ? (
        <div className="text-center py-20 px-6">
          <div className="text-5xl mb-4">🌙</div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {dailyPicks.length === 0 ? t('dating.discovery.noPicksTitle') : t('dating.discovery.allCaughtUpTitle')}
          </h2>
          <p className="text-text-tertiary text-sm max-w-xs mx-auto mb-6">
            {dailyPicks.length === 0
              ? t('dating.discovery.noPicksDescription')
              : t('dating.discovery.allCaughtUpDescription')}
          </p>
          {dailyPicks.length === 0 && (
            <Link href="/dating/profile"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #9B6FF6, #7C3AED)' }}>
              {t('dating.discovery.completeProfile')}
            </Link>
          )}
        </div>
      ) : (
        <DatingProfileCard
          candidate={currentPick}
          onLike={handleLike}
          onPass={handlePass}
          onRose={handleRose}
          likesRemaining={likesRemaining}
          rosesRemaining={rosesRemaining}
          disabled={actionLoading}
        />
      )}

      {/* Filter drawer */}
      <DatingFilterDrawer
        filters={filters}
        onApply={(f) => {
          setFilters(f);
          setFiltersOpen(false);
        }}
        onClose={() => setFiltersOpen(false)}
        open={filtersOpen}
      />

      {/* Match celebration */}
      {showMatchCelebration && celebrationMatch && (
        <MatchCelebration
          match={celebrationMatch}
          currentUserName={profile?.display_name || 'You'}
          currentUserAvatar={profile?.avatar_url || null}
          onStartChat={handleChatFromCelebration}
          onDismiss={dismissCelebration}
        />
      )}
    </div>
  );
}
