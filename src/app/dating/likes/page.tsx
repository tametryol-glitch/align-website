'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useDatingStore } from '@/stores/datingStore';
import { getReceivedLikes, markLikesSeen, likeDatingProfile } from '@/lib/datingDiscoveryService';
import { Heart, Star, Users, Sparkles, Lock, Crown } from 'lucide-react';
import type { ReceivedLike } from '@/lib/datingDiscoveryService';

const ZODIAC_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

function getAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function DatingLikesPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const { tier } = useSubscriptionStore();
  const { receivedLikes, setReceivedLikes, setLikesLoading, likesLoading } = useDatingStore();
  const [likeBackLoading, setLikeBackLoading] = useState<string | null>(null);

  const canSeeProfiles = tier !== 'free';

  const loadLikes = useCallback(async () => {
    if (!user?.id) return;
    setLikesLoading(true);
    const likes = await getReceivedLikes(user.id, tier);
    setReceivedLikes(likes);
    await markLikesSeen(user.id);
    setLikesLoading(false);
  }, [user?.id, tier, setReceivedLikes, setLikesLoading]);

  useEffect(() => {
    if (!authLoading && user) loadLikes();
  }, [authLoading, user, loadLikes]);

  const handleLikeBack = async (like: ReceivedLike) => {
    if (!user?.id || likeBackLoading) return;
    setLikeBackLoading(like.liker_id);
    const result = await likeDatingProfile(user.id, like.liker_id);
    if (result.success && result.mutual) {
      setReceivedLikes(receivedLikes.filter(l => l.id !== like.id));
    }
    setLikeBackLoading(null);
  };

  return (
    <div className="max-w-3xl mx-auto" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Heart size={22} color="#F87171" />
          Who Likes You
        </h1>
        <p className="text-sm text-text-tertiary mt-0.5">
          {receivedLikes.length} people are interested
        </p>
      </div>

      {/* Nav tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <Link href="/dating" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-text-tertiary hover:text-white transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <Star size={14} /> Discover
        </Link>
        <Link href="/dating/likes" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium"
          style={{ backgroundColor: 'rgba(155,111,246,0.15)', color: '#B8A0FA' }}>
          <Heart size={14} /> Likes
        </Link>
        <Link href="/dating/matches" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-text-tertiary hover:text-white transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <Users size={14} /> Matches
        </Link>
      </div>

      {/* Upgrade banner for free users */}
      {!canSeeProfiles && receivedLikes.length > 0 && (
        <div className="rounded-2xl p-4 mb-6 flex items-center gap-3" style={{
          background: 'linear-gradient(135deg, rgba(155,111,246,0.12), rgba(245,166,35,0.08))',
          border: '1px solid rgba(155,111,246,0.2)',
        }}>
          <Crown size={20} color="#F5A623" />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">See who likes you</p>
            <p className="text-xs text-text-tertiary">Upgrade to Light or above to reveal profiles</p>
          </div>
          <Link href="/subscription" className="px-4 py-2 rounded-xl text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #9B6FF6, #7C3AED)' }}>
            Upgrade
          </Link>
        </div>
      )}

      {/* Content */}
      {likesLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
        </div>
      ) : receivedLikes.length === 0 ? (
        <div className="text-center py-20 px-6">
          <div className="text-5xl mb-4">💫</div>
          <h2 className="text-lg font-semibold text-white mb-2">No likes yet</h2>
          <p className="text-text-tertiary text-sm max-w-xs mx-auto">
            Keep your profile fresh and the cosmos will deliver.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {receivedLikes.map((like) => {
            const p = like.liker_profile;
            const photo = canSeeProfiles
              ? (p as any)?.photo_urls?.[0] || (p as any)?.avatar_url
              : null;

            return (
              <div key={like.id} className="rounded-2xl overflow-hidden relative" style={{
                background: 'linear-gradient(180deg, #1E2640 0%, #141826 100%)',
                border: like.like_type === 'cosmic_rose'
                  ? '1px solid rgba(245,166,35,0.3)'
                  : '1px solid rgba(61,71,96,0.4)',
              }}>
                {/* Photo area */}
                <div className="aspect-[3/4] relative bg-bg-tertiary">
                  {canSeeProfiles && photo ? (
                    <Image src={photo} alt="Profile" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, rgba(155,111,246,0.1), rgba(155,111,246,0.03))',
                      filter: canSeeProfiles ? 'none' : 'blur(20px)',
                    }}>
                      {canSeeProfiles ? (
                        <span className="text-4xl text-text-muted">
                          {ZODIAC_GLYPHS[(p as any)?.sun_sign] || '✨'}
                        </span>
                      ) : (
                        <Lock size={24} color="#7B849A" />
                      )}
                    </div>
                  )}

                  {/* Rose badge */}
                  {like.like_type === 'cosmic_rose' && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                      style={{ backgroundColor: 'rgba(245,166,35,0.2)' }}>
                      <span>🌹</span>
                      <span className="text-gold-primary">Rose</span>
                    </div>
                  )}

                  {/* Time */}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-xs text-text-muted"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    {timeAgo(like.created_at)}
                  </div>

                  {/* Gradient overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-16"
                    style={{ background: 'linear-gradient(transparent, #1E2640)' }} />
                </div>

                {/* Info */}
                <div className="p-3 -mt-4 relative z-10">
                  {canSeeProfiles && (p as any)?.display_name ? (
                    <>
                      <p className="text-sm font-semibold text-white truncate">
                        {(p as any).display_name}
                        {(p as any)?.birth_date && (p as any)?.age_visible && (
                          <span className="text-text-tertiary font-normal ml-1">
                            {getAge((p as any).birth_date)}
                          </span>
                        )}
                      </p>
                      {(p as any)?.sun_sign && (
                        <p className="text-xs text-text-tertiary">
                          {ZODIAC_GLYPHS[(p as any).sun_sign]} {(p as any).sun_sign}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-text-muted">
                      {(p as any)?.sun_sign ? `${ZODIAC_GLYPHS[(p as any).sun_sign]} ${(p as any).sun_sign}` : 'Mystery admirer'}
                    </p>
                  )}

                  {/* Like back button */}
                  {canSeeProfiles && (
                    <button
                      onClick={() => handleLikeBack(like)}
                      disabled={likeBackLoading === like.liker_id}
                      className="w-full mt-2 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                      style={{
                        backgroundColor: 'rgba(155,111,246,0.12)',
                        color: '#B8A0FA',
                      }}
                    >
                      <Heart size={12} />
                      {likeBackLoading === like.liker_id ? 'Matching...' : 'Like Back'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
