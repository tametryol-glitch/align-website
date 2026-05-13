'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { ArrowLeft, UserPlus, UserCheck, UserMinus, MessageCircle, Heart, MoreHorizontal, Flag, Ban, Calendar } from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { getZodiacGlyph } from '@/lib/utils';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { sendFriendRequest as sendFriendRequestService, acceptFriendRequest, removeFriend as removeFriendService, cancelFriendRequest, blockUser } from '@/lib/friendService';
import { getOrCreateConversation } from '@/lib/messagingService';

interface ProfileData {
  id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
  starseed: string | null;
  human_design_type: string | null;
  align_code: string | null;
  created_at: string;
  cover_photo_url: string | null;
}

interface UserPost {
  id: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  type: string;
  created_at: string;
  updated_at: string;
  visibility: string;
  like_count: number;
  comment_count: number;
  profile: { display_name: string; avatar_url: string | null } | null;
}

type ProfileTab = 'posts' | 'photos' | 'reels' | 'about';

const HD_TYPE_EMOJI: Record<string, string> = {
  Generator: '⚙️',
  'Manifesting Generator': '🔥',
  Projector: '👁️',
  Manifestor: '⚡',
  Reflector: '🌙',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { user } = useAuthStore();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'incoming' | 'friends'>('none');
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [sendingRequest, setSendingRequest] = useState(false);

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Stats
  const [friendCount, setFriendCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Mutual friends
  const [mutualFriends, setMutualFriends] = useState<Array<{ id: string; display_name: string; avatar_url: string | null }>>([]);

  // Tabs
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [photos, setPhotos] = useState<Array<{ id: string; image_url: string }>>([]);
  const [reels, setReels] = useState<Array<{ id: string; video_url: string; thumbnail_url: string | null; views_count: number }>>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [reelsLoading, setReelsLoading] = useState(false);

  // More menu
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isOwn = user?.id === userId;

  const loadProfile = useCallback(async () => {
    const supabase = createClient();

    // Stage 1: Profile + friend status in parallel
    const [profileResult, friendResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url, bio, sun_sign, moon_sign, rising_sign, starseed, human_design_type, align_code, created_at, cover_photo_url')
        .eq('id', userId)
        .single(),
      user && userId !== user.id
        ? supabase
            .from('friendships')
            .select('id, status, user_id')
            .or(`and(user_id.eq.${user.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${user.id})`)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    if (profileResult.data) {
      setProfile(profileResult.data as ProfileData);
    }

    if (friendResult.data) {
      const f = friendResult.data as { id: string; status: string; user_id: string };
      setFriendshipId(f.id);
      if (f.status === 'accepted') {
        setFriendStatus('friends');
      } else if (f.status === 'pending') {
        setFriendStatus(f.user_id === user?.id ? 'pending' : 'incoming');
      }
    }

    setLoading(false);

    // Stage 2: Stats + follow + mutual friends + posts (non-blocking)
    if (!user) return;

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
    const safeFollowCheck = async (): Promise<boolean> => {
      if (isOwn) return false;
      try { const r = await supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', userId).maybeSingle(); return !!r.data; } catch { return false; }
    };
    const safeMutualFriends = async (): Promise<Array<{ id: string; display_name: string; avatar_url: string | null }>> => {
      if (isOwn) return [];
      try { const r = await supabase.rpc('get_mutual_friends', { user_a: user.id, user_b: userId }); return (r.data as Array<{ id: string; display_name: string; avatar_url: string | null }>) || []; } catch { return []; }
    };

    const [friendCountResult, postCountResult, followerResult, followingResult, followCheck, mutualResult] = await Promise.all([
      safeFriendCount(), safePostCount(), safeFollowerCount(), safeFollowingCount(), safeFollowCheck(), safeMutualFriends(),
    ]);

    setFriendCount(friendCountResult);
    setPostCount(postCountResult);
    setFollowerCount(followerResult);
    setFollowingCount(followingResult);
    setIsFollowing(followCheck);
    setMutualFriends(mutualResult);

    // Load posts immediately
    loadPosts();
  }, [userId, user, isOwn]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  async function loadPosts() {
    setPostsLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('posts')
        .select('id, content, image_url, video_url, type, created_at, updated_at, visibility, profile:profiles!posts_user_id_fkey(display_name, avatar_url)')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(30);
      if (data) {
        const mapped = data.map((p: any) => ({
          ...p,
          like_count: 0,
          comment_count: 0,
          profile: Array.isArray(p.profile) ? p.profile[0] : p.profile,
        }));
        setPosts(mapped);
      }
    } catch { /* */ }
    setPostsLoading(false);
  }

  async function loadPhotos() {
    if (photos.length > 0) return;
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
    if (reels.length > 0) return;
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

  async function handleSendFriendRequest() {
    if (!user) return;
    setSendingRequest(true);
    try {
      const result = await sendFriendRequestService(userId);
      if (result.success) {
        setFriendStatus('pending');
        // Re-fetch to get the friendshipId
        await loadProfile();
      }
    } catch { /* */ }
    setSendingRequest(false);
  }

  async function handleCancelRequest() {
    if (!friendshipId) return;
    setSendingRequest(true);
    try {
      const result = await cancelFriendRequest(friendshipId);
      if (result.success) {
        setFriendStatus('none');
        setFriendshipId(null);
      }
    } catch { /* */ }
    setSendingRequest(false);
  }

  async function handleAcceptFriend() {
    if (!friendshipId) return;
    setSendingRequest(true);
    try {
      const result = await acceptFriendRequest(friendshipId);
      if (result.success) {
        setFriendStatus('friends');
      }
    } catch { /* */ }
    setSendingRequest(false);
  }

  async function handleRemoveFriend() {
    if (!friendshipId) return;
    setSendingRequest(true);
    try {
      const result = await removeFriendService(friendshipId);
      if (result.success) {
        setFriendStatus('none');
        setFriendshipId(null);
      }
    } catch { /* */ }
    setSendingRequest(false);
  }

  async function toggleFollow() {
    if (!user) return;
    setFollowLoading(true);
    try {
      const supabase = createClient();
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', userId);
        setIsFollowing(false);
        setFollowerCount(c => Math.max(0, c - 1));
      } else {
        await supabase.from('follows').insert({ follower_id: user.id, following_id: userId });
        setIsFollowing(true);
        setFollowerCount(c => c + 1);
      }
    } catch { /* */ }
    setFollowLoading(false);
  }

  async function handleMessage() {
    if (!user) return;
    try {
      const convoId = await getOrCreateConversation(userId);
      if (convoId) {
        router.push(`/messages?conversation=${convoId}`);
      } else {
        router.push('/messages');
      }
    } catch {
      router.push('/messages');
    }
  }

  async function handleBlockUser() {
    if (!window.confirm(`Are you sure you want to block ${profile?.display_name || 'this user'}? They won't be able to see your profile or contact you.`)) return;
    try {
      const result = await blockUser(userId);
      if (result.success) {
        setShowMoreMenu(false);
        await loadProfile();
      }
    } catch { /* */ }
  }

  function handleReportUser() {
    setShowMoreMenu(false);
    window.open(`mailto:support@aligncosmic.com?subject=Report User: ${userId}`);
  }

  if (loading) return <div className="max-w-3xl mx-auto"><LoadingCosmic label="Loading profile..." /></div>;
  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto card text-center py-12">
        <p className="text-text-muted">User not found</p>
        <Link href="/discover" className="btn-secondary mt-4 inline-block">Back to Discover</Link>
      </div>
    );
  }

  const joinedDate = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Back + More */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => router.back()} className="btn-ghost p-2 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {!isOwn && (
          <div className="relative">
            <button onClick={() => setShowMoreMenu(!showMoreMenu)} className="btn-ghost p-2">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showMoreMenu && (
              <div className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-border bg-bg-card shadow-lg py-1">
                <button onClick={handleReportUser} className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary flex items-center gap-2">
                  <Flag className="w-4 h-4" /> Report User
                </button>
                <button onClick={handleBlockUser} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-bg-secondary flex items-center gap-2">
                  <Ban className="w-4 h-4" /> Block User
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cover Photo + Avatar */}
      <div className="relative mb-6">
        <div className="h-[140px] sm:h-[180px] rounded-t-2xl overflow-hidden">
          {profile.cover_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.cover_photo_url} alt="" className="w-full h-full object-cover" />
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
          <h1 className="text-xl font-display font-bold text-text-primary">{profile.display_name}</h1>
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
            <div className="text-center">
              <p className="text-lg font-bold text-text-primary">{friendCount}</p>
              <p className="text-xs text-text-tertiary">Friends</p>
            </div>
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
          </div>

          {/* Action Buttons */}
          {!isOwn && (
            <div className="flex items-center justify-center gap-3 mt-4">
              {friendStatus === 'none' && (
                <button onClick={handleSendFriendRequest} disabled={sendingRequest} className="btn-primary text-sm flex items-center gap-2 px-4 py-2">
                  <UserPlus className="w-4 h-4" /> {sendingRequest ? 'Sending...' : 'Add Friend'}
                </button>
              )}
              {friendStatus === 'pending' && (
                <button onClick={handleCancelRequest} disabled={sendingRequest} className="btn-secondary text-sm flex items-center gap-2 px-4 py-2 group">
                  <UserCheck className="w-4 h-4 group-hover:hidden" />
                  <UserMinus className="w-4 h-4 hidden group-hover:block" />
                  <span className="group-hover:hidden">{sendingRequest ? 'Cancelling...' : 'Request Sent'}</span>
                  <span className="hidden group-hover:block text-red-400">Cancel Request</span>
                </button>
              )}
              {friendStatus === 'incoming' && (
                <button onClick={handleAcceptFriend} disabled={sendingRequest} className="btn-primary text-sm flex items-center gap-2 px-4 py-2">
                  <UserCheck className="w-4 h-4" /> Accept Request
                </button>
              )}
              {friendStatus === 'friends' && (
                <button onClick={handleRemoveFriend} disabled={sendingRequest} className="btn-secondary text-sm flex items-center gap-2 px-4 py-2 group">
                  <UserCheck className="w-4 h-4 group-hover:hidden" />
                  <UserMinus className="w-4 h-4 hidden group-hover:block" />
                  <span className="group-hover:hidden">Friends</span>
                  <span className="hidden group-hover:block text-red-400">Unfriend</span>
                </button>
              )}

              <button
                onClick={toggleFollow}
                disabled={followLoading}
                className={`text-sm flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isFollowing
                    ? 'bg-bg-secondary text-text-secondary hover:bg-red-500/10 hover:text-red-400'
                    : 'bg-pink-600 text-white hover:bg-pink-700'
                }`}
              >
                <Heart className="w-4 h-4" fill={isFollowing ? 'currentColor' : 'none'} />
                {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
              </button>

              <button
                onClick={handleMessage}
                className="bg-blue-600 text-white text-sm flex items-center gap-2 px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Message
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mutual Friends */}
      {mutualFriends.length > 0 && (
        <div className="card p-4 mb-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">
            {mutualFriends.length} Mutual Friend{mutualFriends.length > 1 ? 's' : ''}
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {mutualFriends.slice(0, 8).map(friend => (
              <Link key={friend.id} href={`/user/${friend.id}`} className="flex flex-col items-center gap-1 min-w-[60px]">
                <UserAvatar displayName={friend.display_name} avatarUrl={friend.avatar_url} size="sm" />
                <span className="text-[10px] text-text-tertiary truncate max-w-[60px]">{friend.display_name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

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

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {postsLoading ? (
            <LoadingCosmic label="Loading posts..." />
          ) : posts.length > 0 ? (
            posts.map(post => (
              <div key={post.id} className="card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <UserAvatar
                    displayName={post.profile?.display_name || profile.display_name}
                    avatarUrl={post.profile?.avatar_url || profile.avatar_url}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{post.profile?.display_name || profile.display_name}</p>
                    <p className="text-xs text-text-tertiary">{timeAgo(post.created_at)}</p>
                  </div>
                </div>
                {post.content && <p className="text-sm text-text-secondary mb-3">{post.content}</p>}
                {post.image_url && !post.video_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.image_url} alt="" className="w-full rounded-lg max-h-[400px] object-cover mb-3" />
                )}
                {post.video_url && (
                  <video src={post.video_url} controls className="w-full rounded-lg max-h-[400px] mb-3" />
                )}
              </div>
            ))
          ) : (
            <div className="card p-8 text-center">
              <p className="text-3xl mb-2">📝</p>
              <p className="text-text-tertiary text-sm">No posts yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'photos' && (
        <div>
          {photosLoading ? (
            <LoadingCosmic label="Loading photos..." />
          ) : photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
              {photos.map(photo => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.id}
                  src={photo.image_url}
                  alt=""
                  className="w-full aspect-square object-cover"
                />
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

      {activeTab === 'reels' && (
        <div>
          {reelsLoading ? (
            <LoadingCosmic label="Loading reels..." />
          ) : reels.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
              {reels.map(reel => (
                <div key={reel.id} className="relative aspect-[9/16]">
                  {reel.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={reel.thumbnail_url} alt="" className="w-full h-full object-cover" />
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

      {/* Click outside to close more menu */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
      )}
    </div>
  );
}
