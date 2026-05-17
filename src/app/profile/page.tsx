'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { Pencil, Settings, QrCode, Share2, ChevronRight, Calendar, Image as ImageIcon, Shield, CreditCard, Eye, X, Sparkles, Gift } from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { getZodiacGlyph } from '@/lib/utils';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { BigThreeCard, ShareButtonWithCard } from '@/components/share';
import { generateShareUrl } from '@/lib/shareCardUtils';
import {
  getUserPosts, toggleReaction, deletePost, editPost, repostPost, toggleBookmark, getUserBookmarks,
  type FeedPost, type ReactionEmoji,
} from '@/lib/feedService';
import { FeedCard } from '@/components/feed/FeedCard';
import { CommentSheet } from '@/components/feed/CommentSheet';
import { XPProgressBar } from '@/components/ui/XPProgressBar';
import { BadgeGrid } from '@/components/ui/BadgeGrid';
import { useGamificationStore } from '@/stores/gamificationStore';

type ProfileTab = 'posts' | 'photos' | 'reels' | 'about';

const HD_TYPE_EMOJI: Record<string, string> = {
  Generator: '⚙️',
  'Manifesting Generator': '🔥',
  Projector: '👁️',
  Manifestor: '⚡',
  Reflector: '🌙',
};

export default function ProfilePage() {
  const { user, profile } = useAuthStore();
  const userId = user?.id;
  const { totalXP, level, progress, xpForNextLevel, xpInCurrentLevel, badges, fetchProgress: fetchGamification } = useGamificationStore();

  const [loading, setLoading] = useState(true);

  // Stats
  const [friendCount, setFriendCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [showViewersModal, setShowViewersModal] = useState(false);
  const [viewers, setViewers] = useState<Array<{viewer_id: string; display_name: string; avatar_url: string; viewed_at: string}>>([]);

  // Tabs
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [photos, setPhotos] = useState<Array<{ id: string; image_url: string }>>([]);
  const [reels, setReels] = useState<Array<{ id: string; video_url: string; thumbnail_url: string | null; views_count: number }>>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [reelsLoading, setReelsLoading] = useState(false);

  // Post interaction state
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [editingPost, setEditingPost] = useState<{ id: string; content: string } | null>(null);
  const [editText, setEditText] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // QR modal
  const [showQR, setShowQR] = useState(false);

  const loadStats = useCallback(async () => {
    if (!userId) return;
    const supabase = createClient();

    const safeFriendCount = async (): Promise<number> => {
      try { const r = await supabase.rpc('get_friend_count', { target_user_id: userId }); return (r.data as number) || 0; } catch { return 0; }
    };
    const safePostCount = async (): Promise<number> => {
      try { const r = await supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_deleted', false); return r.count || 0; } catch { return 0; }
    };
    const safeFollowerCount = async (): Promise<number> => {
      try { const r = await supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', userId); return r.count || 0; } catch { return 0; }
    };
    const safeFollowingCount = async (): Promise<number> => {
      try { const r = await supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId); return r.count || 0; } catch { return 0; }
    };
    const safeViewCount = async (): Promise<number> => {
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const r = await supabase.from('profile_views').select('*', { count: 'exact', head: true }).eq('profile_id', userId).gte('viewed_at', thirtyDaysAgo);
        return r.count || 0;
      } catch { return 0; }
    };

    const [fc, pc, flr, flg, vc] = await Promise.all([
      safeFriendCount(), safePostCount(), safeFollowerCount(), safeFollowingCount(), safeViewCount(),
    ]);

    setFriendCount(fc);
    setPostCount(pc);
    setFollowerCount(flr);
    setFollowingCount(flg);
    setViewCount(vc);
    setLoading(false);

    loadPosts();
    if (userId) fetchGamification(userId);
  }, [userId]);

  useEffect(() => { loadStats(); }, [loadStats]);

  async function loadViewers() {
    if (!userId) return;
    const supabase = createClient();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('profile_views')
      .select('viewer_id, viewed_at, profiles!profile_views_viewer_id_fkey(display_name, avatar_url)')
      .eq('profile_id', userId)
      .gte('viewed_at', thirtyDaysAgo)
      .order('viewed_at', { ascending: false })
      .limit(50);
    if (data) {
      setViewers(data.map((v: any) => ({
        viewer_id: v.viewer_id,
        display_name: v.profiles?.display_name || 'Unknown',
        avatar_url: v.profiles?.avatar_url || '',
        viewed_at: v.viewed_at,
      })));
    }
    setShowViewersModal(true);
  }

  async function loadPosts() {
    if (!userId) return;
    setPostsLoading(true);
    try {
      const [feedPosts, bookmarks] = await Promise.all([
        getUserPosts(userId, userId),
        getUserBookmarks(userId),
      ]);
      setPosts(feedPosts);
      setBookmarkedIds(bookmarks);
    } catch { /* */ }
    setPostsLoading(false);
  }

  async function loadPhotos() {
    if (!userId || photos.length > 0) return;
    setPhotosLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('posts')
        .select('id, image_url')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .not('image_url', 'is', null)
        .is('video_url', null)
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) setPhotos(data.filter((p: any) => p.image_url));
    } catch { /* */ }
    setPhotosLoading(false);
  }

  async function loadReels() {
    if (!userId || reels.length > 0) return;
    setReelsLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('posts')
        .select('id, video_url, image_url, created_at')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .not('video_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(30);
      if (data) {
        setReels(data.map((r: any) => ({
          id: r.id,
          video_url: r.video_url,
          thumbnail_url: r.image_url,
          views_count: 0,
        })));
      }
    } catch { /* */ }
    setReelsLoading(false);
  }

  function handleTabChange(tab: ProfileTab) {
    setActiveTab(tab);
    if (tab === 'photos') loadPhotos();
    if (tab === 'reels') loadReels();
  }

  async function handleShare() {
    const code = profile?.align_code;
    const name = profile?.display_name || 'Align User';
    const text = code
      ? `Check out my Align profile! My code: ${code}`
      : `Check out my Align profile!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `${name} on Align`, text });
      } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(text);
      } catch { /* */ }
    }
  }

  async function handleReaction(postId: string, emoji: ReactionEmoji) {
    if (!userId) return;
    const updated = await toggleReaction(postId, userId, emoji);
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, reactions: updated } : p));
  }

  async function handleDeletePost(postId: string) {
    await deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  async function handleBookmark(postId: string) {
    if (!userId) return;
    const result = await toggleBookmark(postId, userId);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (result) next.add(postId);
      else next.delete(postId);
      return next;
    });
  }

  async function handleRepost(post: FeedPost) {
    if (!userId) return;
    try {
      await repostPost(userId, post);
    } catch { /* */ }
  }

  function handleStartEdit(postId: string, currentContent: string) {
    setEditingPost({ id: postId, content: currentContent });
    setEditText(currentContent);
  }

  async function handleSaveEdit() {
    if (!editingPost || editSaving) return;
    setEditSaving(true);
    try {
      await editPost(editingPost.id, editText.trim());
      setPosts((prev) => prev.map((p) => p.id === editingPost.id ? { ...p, content: editText.trim() } : p));
      setEditingPost(null);
    } catch { /* */ }
    setEditSaving(false);
  }

  if (!profile || loading) {
    return <div className="max-w-3xl mx-auto"><LoadingCosmic label="Loading profile..." /></div>;
  }

  const joinedDate = new Date(profile.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-display font-bold text-text-primary">Profile</h1>
        <Link href="/settings" className="btn-ghost p-2">
          <Settings className="w-5 h-5" />
        </Link>
      </div>

      {/* Cover Photo + Avatar */}
      <div className="relative mb-6">
        <div className="h-[140px] sm:h-[180px] rounded-t-2xl overflow-hidden relative">
          {profile.cover_photo_url ? (
            <Image src={profile.cover_photo_url} alt="Cover photo" fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1E1440] via-[#2D1B69] to-[#1A1035]" />
          )}
        </div>
        <div className="card rounded-t-none -mt-12 pt-16 text-center pb-6">
          {/* Avatar */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[100px] sm:top-[140px]">
            <UserAvatar
              displayName={profile.display_name || '?'}
              avatarUrl={profile.avatar_url}
              size="xl"
            />
          </div>

          {/* Name + Username */}
          <h2 className="text-xl font-display font-bold text-text-primary">{profile.display_name}</h2>
          {profile.username && (
            <p className="text-sm text-text-tertiary mt-0.5">@{profile.username}</p>
          )}

          {/* Bio */}
          {profile.bio && <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto">{profile.bio}</p>}

          {/* Sign badges */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            {profile.sun_sign && (
              <span className="px-3 py-1 rounded-full bg-fire/10 text-fire text-xs font-medium">
                {getZodiacGlyph(profile.sun_sign)} {profile.sun_sign}
              </span>
            )}
            {profile.moon_sign && (
              <span className="px-3 py-1 rounded-full bg-water/10 text-water text-xs font-medium">
                {getZodiacGlyph(profile.moon_sign)} {profile.moon_sign}
              </span>
            )}
            {profile.rising_sign && (
              <span className="px-3 py-1 rounded-full bg-air/10 text-air text-xs font-medium">
                {getZodiacGlyph(profile.rising_sign)} {profile.rising_sign}
              </span>
            )}
            {profile.starseed && (
              <span className="px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-medium">
                ✨ {profile.starseed}
              </span>
            )}
            {profile.human_design_type && (
              <span className="px-3 py-1 rounded-full bg-accent-secondary/10 text-accent-secondary text-xs font-medium">
                {HD_TYPE_EMOJI[profile.human_design_type] || '✴️'} {profile.human_design_type}
              </span>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-6 mt-5 py-3 border-t border-b border-border">
            <Link href="/friends" className="text-center hover:opacity-80 transition-opacity">
              <p className="text-lg font-bold text-text-primary">{friendCount}</p>
              <p className="text-xs text-text-tertiary">Friends</p>
            </Link>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-lg font-bold text-text-primary">{postCount}</p>
              <p className="text-xs text-text-tertiary">Posts</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-lg font-bold text-text-primary">{followerCount}</p>
              <p className="text-xs text-text-tertiary">Followers</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-lg font-bold text-text-primary">{followingCount}</p>
              <p className="text-xs text-text-tertiary">Following</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <button onClick={loadViewers} className="text-center hover:opacity-80 transition-opacity">
              <p className="text-lg font-bold text-text-primary">{viewCount}</p>
              <p className="text-xs text-text-tertiary flex items-center justify-center gap-1"><Eye className="w-3 h-3" /> Views</p>
            </button>
          </div>

          {/* Edit Profile button */}
          <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
            <Link href="/profile/edit" className="btn-secondary text-sm inline-flex items-center gap-2 px-6 py-2">
              <Pencil className="w-4 h-4" /> Edit Profile
            </Link>
            {profile.sun_sign && profile.moon_sign && profile.rising_sign && (
              <ShareButtonWithCard
                variant="button"
                label="Share Your Big Three"
                shareTitle={`${profile.display_name}'s Big Three`}
                shareText={`${profile.display_name}'s cosmic blueprint: ${profile.sun_sign} Sun, ${profile.moon_sign} Moon, ${profile.rising_sign} Rising`}
                shareUrl={generateShareUrl('big-three', {
                  sun: profile.sun_sign,
                  moon: profile.moon_sign,
                  rising: profile.rising_sign,
                  name: profile.display_name || undefined,
                })}
                cardElement={
                  <BigThreeCard
                    displayName={profile.display_name || 'Cosmic Soul'}
                    sunSign={profile.sun_sign}
                    moonSign={profile.moon_sign}
                    risingSign={profile.rising_sign}
                  />
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="card p-4 mb-4">
        <XPProgressBar
          level={level}
          totalXP={totalXP}
          progress={progress}
          xpInCurrentLevel={xpInCurrentLevel}
          xpForNextLevel={xpForNextLevel}
        />
      </div>

      {/* Badges */}
      <BadgeGrid earnedBadges={badges} className="mb-4" />

      {/* Owner Section: Align Code */}
      {profile.align_code && (
        <div className="card p-4 mb-4">
          <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-2">Your Align Code</p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-accent-primary tracking-widest">{profile.align_code}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowQR(true)} className="btn-ghost p-2 text-text-secondary hover:text-accent-primary">
                <QrCode className="w-5 h-5" />
              </button>
              <button onClick={handleShare} className="btn-ghost p-2 text-text-secondary hover:text-accent-primary">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Owner Section: Quick Links */}
      <div className="card overflow-hidden mb-4">
        <Link href="/gallery" className="flex items-center justify-between px-4 py-3.5 border-b border-border hover:bg-bg-card-hover transition-colors">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <ImageIcon className="w-4 h-4 text-text-muted" /> Gallery
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/safety" className="flex items-center justify-between px-4 py-3.5 border-b border-border hover:bg-bg-card-hover transition-colors">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Shield className="w-4 h-4 text-text-muted" /> Safety & Trust
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/pricing" className="flex items-center justify-between px-4 py-3.5 border-b border-border hover:bg-bg-card-hover transition-colors">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <CreditCard className="w-4 h-4 text-text-muted" /> Subscription
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/referrals" className="flex items-center justify-between px-4 py-3.5 border-b border-border hover:bg-bg-card-hover transition-colors">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Gift className="w-4 h-4 text-accent-primary" /> Referrals
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings" className="flex items-center justify-between px-4 py-3.5 hover:bg-bg-card-hover transition-colors">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Settings className="w-4 h-4 text-text-muted" /> Settings
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-border mb-4">
        {(['posts', 'photos', 'reels', 'about'] as ProfileTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors relative ${
              activeTab === tab
                ? 'text-accent-primary'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {tab === 'posts' ? '📝 Posts' : tab === 'photos' ? '📷 Photos' : tab === 'reels' ? '🎬 Reels' : 'ℹ️ About'}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content: Posts */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {postsLoading ? (
            <LoadingCosmic label="Loading posts..." />
          ) : posts.length > 0 ? (
            posts.map(post => (
              <FeedCard
                key={post.id}
                post={post}
                currentUserId={userId || ''}
                onReaction={handleReaction}
                onComment={setCommentPostId}
                onDelete={handleDeletePost}
                onEdit={handleStartEdit}
                onRepost={handleRepost}
                isBookmarked={bookmarkedIds.has(post.id)}
                onBookmark={handleBookmark}
              />
            ))
          ) : (
            <div className="card p-8 text-center">
              <p className="text-3xl mb-2">📝</p>
              <p className="text-text-tertiary text-sm">No posts yet</p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Photos */}
      {activeTab === 'photos' && (
        <div>
          {photosLoading ? (
            <LoadingCosmic label="Loading photos..." />
          ) : photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
              {photos.map(photo => (
                <div key={photo.id} className="relative aspect-square">
                  <Image
                    src={photo.image_url}
                    alt="Post photo"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-3xl mb-2">📷</p>
              <p className="text-text-tertiary text-sm">No photos yet</p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Reels */}
      {activeTab === 'reels' && (
        <div>
          {reelsLoading ? (
            <LoadingCosmic label="Loading reels..." />
          ) : reels.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
              {reels.map(reel => (
                <div key={reel.id} className="relative aspect-[9/16]">
                  {reel.thumbnail_url ? (
                    <Image src={reel.thumbnail_url} alt="Reel thumbnail" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full bg-bg-secondary flex items-center justify-center">
                      <span className="text-2xl">▶</span>
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1 bg-black/60 rounded px-1.5 py-0.5">
                    <span className="text-[10px] text-white">▶ {reel.views_count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-3xl mb-2">🎬</p>
              <p className="text-text-tertiary text-sm">No reels yet</p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: About */}
      {activeTab === 'about' && (
        <div className="card p-5 space-y-4">
          {profile.bio && (
            <div>
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Bio</p>
              <p className="text-sm text-text-secondary">{profile.bio}</p>
            </div>
          )}
          {(profile.sun_sign || profile.moon_sign || profile.rising_sign) && (
            <div>
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Big Three</p>
              <p className="text-sm text-text-secondary">
                {[
                  profile.sun_sign && `☉ ${profile.sun_sign}`,
                  profile.moon_sign && `☽ ${profile.moon_sign}`,
                  profile.rising_sign && `↑ ${profile.rising_sign}`,
                ].filter(Boolean).join('   ')}
              </p>
            </div>
          )}
          {profile.starseed && (
            <div>
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Starseed Origin</p>
              <p className="text-sm text-text-secondary">✨ {profile.starseed}</p>
            </div>
          )}
          {profile.human_design_type && (
            <div>
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Human Design</p>
              <p className="text-sm text-text-secondary">{HD_TYPE_EMOJI[profile.human_design_type] || '✴️'} {profile.human_design_type}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Joined</p>
            <p className="text-sm text-text-secondary flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> {joinedDate}
            </p>
          </div>
          {profile.align_code && (
            <div>
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Align Code</p>
              <p className="text-sm font-bold text-accent-primary tracking-widest">{profile.align_code}</p>
            </div>
          )}
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setShowQR(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
            <div className="bg-bg-card border border-border rounded-2xl p-6 max-w-xs w-full text-center" onClick={e => e.stopPropagation()}>
              <p className="text-lg font-display font-bold text-text-primary mb-2">Your Align Code</p>
              <p className="text-2xl font-bold text-accent-primary tracking-widest mb-4">{profile.align_code}</p>
              <div className="bg-white p-4 rounded-xl inline-block mb-4">
                <div className="w-40 h-40 flex items-center justify-center text-6xl">
                  <QrCode className="w-32 h-32 text-gray-800" />
                </div>
              </div>
              <p className="text-xs text-text-tertiary mb-4">Share your code so friends can find you</p>
              <button onClick={() => setShowQR(false)} className="btn-primary w-full py-2.5 text-sm">Close</button>
            </div>
          </div>
        </>
      )}

      {/* Profile Viewers Modal */}
      {showViewersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowViewersModal(false)}>
          <div className="bg-bg-card border border-border rounded-2xl p-6 w-full max-w-md max-h-[70vh] overflow-y-auto mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-bold text-text-primary flex items-center gap-2"><Eye className="w-5 h-5" /> Profile Views</h3>
              <button onClick={() => setShowViewersModal(false)} className="text-text-muted hover:text-text-primary text-xl">&times;</button>
            </div>
            {viewers.length === 0 ? (
              <p className="text-center text-text-muted py-8">No profile views yet</p>
            ) : (
              <div className="space-y-3">
                {viewers.map((v, i) => (
                  <Link key={i} href={`/user/${v.viewer_id}`} className="flex items-center gap-3 hover:bg-bg-secondary rounded-lg p-2 transition-colors">
                    <UserAvatar displayName={v.display_name} avatarUrl={v.avatar_url} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{v.display_name}</p>
                      <p className="text-xs text-text-tertiary">{new Date(v.viewed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comment Sheet */}
      {commentPostId && (() => {
        const commentPost = posts.find(p => p.id === commentPostId);
        return (
          <CommentSheet
            postId={commentPostId}
            postOwnerId={commentPost?.userId || ''}
            userId={userId || ''}
            onClose={() => setCommentPostId(null)}
            onCommentCountChange={(pid, delta) => {
              setPosts(prev => prev.map(p =>
                p.id === pid ? { ...p, commentCount: Math.max(0, p.commentCount + delta) } : p
              ));
            }}
          />
        );
      })()}

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setEditingPost(null)} />
          <div className="relative bg-bg-secondary border border-border-primary rounded-2xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-primary">
              <h3 className="text-lg font-semibold text-text-primary">Edit Post</h3>
              <button onClick={() => setEditingPost(null)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={5}
                maxLength={2000}
                className="w-full bg-bg-card border border-border-primary rounded-xl p-4 text-sm text-text-primary resize-none outline-none focus:border-accent-primary transition-colors"
              />
              <p className="text-xs text-text-muted text-right mt-1">{editText.length}/2000</p>
            </div>
            <div className="px-5 py-4 border-t border-border-primary flex gap-3">
              <button onClick={() => setEditingPost(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving || !editText.trim()}
                className="btn-primary flex-1 text-sm"
              >
                {editSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
