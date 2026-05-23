'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useDatingStore } from '@/stores/datingStore';
import { getReceivedLikes, getSentLikes, markLikesSeen, likeDatingProfile } from '@/lib/datingDiscoveryService';
import { Heart, Star, Users, Lock, Crown, Send } from 'lucide-react';
import type { ReceivedLike, SentLike } from '@/lib/datingDiscoveryService';

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
  const [sentLikes, setSentLikes] = useState<SentLike[]>([]);
  const [sentLoading, setSentLoading] = useState(false);
  const [likeBackLoading, setLikeBackLoading] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'received' | 'sent'>('received');

  const canSeeProfiles = tier !== 'free';

  const loadReceivedLikes = useCallback(async () => {
    if (!user?.id) return;
    setLikesLoading(true);
    const likes = await getReceivedLikes(user.id, tier);
    setReceivedLikes(likes);
    await markLikesSeen(user.id);
    setLikesLoading(false);
  }, [user?.id, tier, setReceivedLikes, setLikesLoading]);

  const loadSentLikes = useCallback(async () => {
    if (!user?.id) return;
    setSentLoading(true);
    const likes = await getSentLikes(user.id);
    setSentLikes(likes);
    setSentLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && user) {
      loadReceivedLikes();
      loadSentLikes();
    }
  }, [authLoading, user, loadReceivedLikes, loadSentLikes]);

  const handleLikeBack = async (like: ReceivedLike) => {
    if (!user?.id || likeBackLoading) return;
    setLikeBackLoading(like.liker_id);
    const result = await likeDatingProfile(user.id, like.liker_id);
    if (result.success && result.mutual) {
      setReceivedLikes(receivedLikes.filter(l => l.id !== like.id));
    }
    setLikeBackLoading(null);
  };

  const isLoading = viewTab === 'received' ? likesLoading : sentLoading;
  const items = viewTab === 'received' ? receivedLikes : sentLikes;

  return (
    <div className="max-w-3xl mx-auto" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Heart size={22} color="#F87171" />
          Likes
        </h1>
        <p className="text-sm text-text-tertiary mt-0.5">
          {viewTab === 'received'
            ? `${receivedLikes.length} people are interested`
            : `You liked ${sentLikes.length} people`}
        </p>
      </div>

      {/* Nav tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
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

      {/* Received / Sent toggle */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
        <button
          onClick={() => setViewTab('received')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            viewTab === 'received'
              ? 'bg-accent-primary/20 text-accent-primary'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          <Heart size={14} /> Received {receivedLikes.length > 0 && `(${receivedLikes.length})`}
        </button>
        <button
          onClick={() => setViewTab('sent')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            viewTab === 'sent'
              ? 'bg-accent-primary/20 text-accent-primary'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          <Send size={14} /> Sent {sentLikes.length > 0 && `(${sentLikes.length})`}
        </button>
      </div>

      {/* Upgrade banner for free users (received tab only) */}
      {viewTab === 'received' && !canSeeProfiles && receivedLikes.length > 0 && (
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
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 px-6">
          <div className="text-5xl mb-4">{viewTab === 'received' ? '💫' : '💜'}</div>
          <h2 className="text-lg font-semibold text-white mb-2">
            {viewTab === 'received' ? 'No likes yet' : 'No likes sent yet'}
          </h2>
          <p className="text-text-tertiary text-sm max-w-xs mx-auto">
            {viewTab === 'received'
              ? 'Keep your profile fresh and the cosmos will deliver.'
              : 'Head to Discover to find your cosmic connections.'}
          </p>
          {viewTab === 'sent' && (
            <Link href="/dating" className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-2xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #9B6FF6, #7C3AED)' }}>
              <Star size={16} /> Discover
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => {
            const isReceived = viewTab === 'received';
            const like = item as any;
            const p = isReceived ? like.liker_profile : like.liked_profile;
            const photo = (isReceived ? canSeeProfiles : true)
              ? p?.photo_urls?.[0] || p?.avatar_url
              : null;
            const likeType = like.like_type;

            return (
              <div key={like.id} className="rounded-2xl overflow-hidden relative" style={{
                background: 'linear-gradient(180deg, #1E2640 0%, #141826 100%)',
                border: likeType === 'cosmic_rose'
                  ? '1px solid rgba(245,166,35,0.3)'
                  : '1px solid rgba(61,71,96,0.4)',
              }}>
                {/* Photo area */}
                <div className="aspect-[3/4] relative bg-bg-tertiary">
                  {photo ? (
                    <Image src={photo} alt="Profile" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, rgba(155,111,246,0.1), rgba(155,111,246,0.03))',
                      filter: (isReceived && !canSeeProfiles) ? 'blur(20px)' : 'none',
                    }}>
                      {(isReceived && !canSeeProfiles) ? (
                        <Lock size={24} color="#7B849A" />
                      ) : (
                        <span className="text-4xl text-text-muted">
                          {ZODIAC_GLYPHS[p?.sun_sign] || '✨'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Rose badge */}
                  {likeType === 'cosmic_rose' && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                      style={{ backgroundColor: 'rgba(245,166,35,0.2)' }}>
                      <span>🌹</span>
                      <span className="text-gold-primary">Rose</span>
                    </div>
                  )}

                  {/* Sent badge */}
                  {!isReceived && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                      style={{ backgroundColor: 'rgba(155,111,246,0.25)' }}>
                      <Send size={10} className="text-accent-primary" />
                      <span className="text-accent-primary">Sent</span>
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
                  {((isReceived && canSeeProfiles) || !isReceived) && p?.display_name ? (
                    <>
                      <p className="text-sm font-semibold text-white truncate">
                        {p.display_name}
                        {p?.birth_date && p?.age_visible && (
                          <span className="text-text-tertiary font-normal ml-1">
                            {getAge(p.birth_date)}
                          </span>
                        )}
                      </p>
                      {p?.sun_sign && (
                        <p className="text-xs text-text-tertiary">
                          {ZODIAC_GLYPHS[p.sun_sign]} {p.sun_sign}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-text-muted">
                      {p?.sun_sign ? `${ZODIAC_GLYPHS[p.sun_sign]} ${p.sun_sign}` : 'Mystery admirer'}
                    </p>
                  )}

                  {/* Like back button (received tab only) */}
                  {isReceived && canSeeProfiles && (
                    <button
                      onClick={() => handleLikeBack(like as ReceivedLike)}
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
