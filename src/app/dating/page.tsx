'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { DatingProfileCard } from '@/components/dating/DatingProfileCard';
import { MatchCelebration } from '@/components/dating/MatchCelebration';
import { DatingFilterDrawer } from '@/components/dating/DatingFilterDrawer';
import { Sparkles, Heart, Users, SlidersHorizontal, Star } from 'lucide-react';

export default function DatingDiscoveryPage() {
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
      // silent
    }
    setDiscoveryLoading(false);
  }, [user?.id, tier, filters, setDailyPicks, setDailyLimits, setDiscoveryLoading]);

  useEffect(() => {
    if (!authLoading && user) {
      loadPicks();
    }
  }, [authLoading, user, loadPicks]);

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
    }
    setActionLoading(false);
  }, [user?.id, currentPick, actionLoading, incrementLikesUsed, advancePick, showCelebration]);

  const handleRose = useCallback(async () => {
    if (!user?.id || !currentPick || actionLoading) return;
    setActionLoading(true);
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
      router.push(`/messages/${celebrationMatch.conversation_id}`);
    } else {
      dismissCelebration();
      router.push('/dating/matches');
    }
  }, [celebrationMatch, dismissCelebration, router]);

  return (
    <div className="max-w-3xl mx-auto" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles size={22} color="#9B6FF6" />
            Cosmic Dating
          </h1>
          <p className="text-sm text-text-tertiary mt-0.5">Your curated cosmic picks</p>
        </div>

        <div className="flex items-center gap-2">
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
          <Star size={14} /> Discover
        </Link>
        <Link href="/dating/likes" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-text-tertiary hover:text-white transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <Heart size={14} /> Likes
        </Link>
        <Link href="/dating/matches" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-text-tertiary hover:text-white transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <Users size={14} /> Matches
        </Link>
      </div>

      {/* Main content */}
      {discoveryLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-2 border-accent-primary border-t-transparent animate-spin mb-4" />
          <p className="text-text-tertiary text-sm">Consulting the cosmos...</p>
        </div>
      ) : !currentPick || currentPickIndex >= dailyPicks.length ? (
        <div className="text-center py-20 px-6">
          <div className="text-5xl mb-4">🌙</div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {dailyPicks.length === 0 ? 'No Cosmic Picks Yet' : 'All Caught Up!'}
          </h2>
          <p className="text-text-tertiary text-sm max-w-xs mx-auto mb-6">
            {dailyPicks.length === 0
              ? 'The stars are still aligning your matches. Make sure your dating profile is complete!'
              : 'Come back tomorrow for new cosmic picks. Quality connections take time.'}
          </p>
          {dailyPicks.length === 0 && (
            <Link href="/dating/profile"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #9B6FF6, #7C3AED)' }}>
              Complete Profile
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
