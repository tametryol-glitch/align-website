'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  getCommunity, getCommunityPosts, getCommunityMembers, isMember,
  createCommunityPost, editCommunityPost, deleteCommunityPost,
  joinCommunity, leaveCommunity,
  likeCommunityPost, toggleCommunityReaction,
  togglePinPost, removeMember, reportCommunityPost,
  uploadCommunityPostMedia, uploadCommunityBanner, uploadCommunityAvatar,
  updateCommunityBanner, updateCommunityAvatar,
  repostCommunityPost, toggleCommunityBookmark, getMyCommunityBookmarks,
  recordCommunityPostVideoView,
  POST_TYPE_META, REACTION_OPTIONS, REPORT_REASONS, COMMUNITY_CATEGORIES, ZODIAC_EMOJIS,
  type Community, type CommunityPost, type CommunityMember,
  type CommunityRole, type PostType, type FeedSortMode,
} from '@/lib/communityService';
import { POST_STYLE_PRESETS } from '@/lib/feedService';
import { PostRichBody } from '@/components/feed/FeedCard';
import { CommentSheet } from '@/components/feed/CommentSheet';
import { MentionInput } from '@/components/feed/MentionInput';
import ReactionViewerModal from '@/components/feed/ReactionViewerModal';
import { downloadVideo } from '@/lib/videoDownloadService';
import { getCreatorBadge, getCreatorTier } from '@/lib/creatorScoreEngine';
import { predictViralScore, getViralTier, type ContentMetrics } from '@/lib/contentViralityEngine';
import dynamic from 'next/dynamic';
const GifStickerPicker = dynamic(() => import('@/components/chat/GifStickerPicker').then(m => ({ default: m.GifStickerPicker })), { ssr: false });
const EmojiPicker = dynamic(() => import('@/components/ui/EmojiPicker'), { ssr: false });
import Link from 'next/link';
import {
  ArrowLeft, Users, Send, Heart, MessageCircle, Pin,
  Trash2, Edit3, MoreHorizontal, Shield, Crown, Star,
  Search, RefreshCw, Flag, X, ChevronDown, Camera,
  Bookmark, Repeat2, Share2, Download, Loader2, Video as VideoIcon,
} from 'lucide-react';

// ── Helpers ─────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function roleBadge(role?: CommunityRole) {
  if (role === 'owner') return <span title="Owner" className="text-yellow-400 text-xs">👑</span>;
  if (role === 'admin') return <span title="Admin" className="text-blue-400 text-xs">⭐</span>;
  return null;
}

// ═════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════

export default function CommunityDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [memberStatus, setMemberStatus] = useState<{ member: boolean; role?: CommunityRole }>({ member: false });
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<'posts' | 'members' | 'about'>('posts');
  const [feedSort, setFeedSort] = useState<FeedSortMode>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Post creation
  const [newPostText, setNewPostText] = useState('');
  const [selectedPostType, setSelectedPostType] = useState<PostType>('discussion');
  const [newPostTopic, setNewPostTopic] = useState('');
  const [posting, setPosting] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [composerImage, setComposerImage] = useState<File | null>(null);
  const [composerImagePreview, setComposerImagePreview] = useState<string | null>(null);
  const [composerMediaKind, setComposerMediaKind] = useState<string | null>(null);
  const [composerGifUrl, setComposerGifUrl] = useState<string | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // Background style for text-only posts — same presets as the cosmic feed.
  const [composerPreset, setComposerPreset] = useState('default');
  // Video posts keep the creator's say over downloads, exactly like the feed.
  const [composerAllowDownload, setComposerAllowDownload] = useState(true);

  // Comments — the cosmic feed's sheet, so replies / @mentions / GIFs /
  // editing all behave identically inside a community.
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  // Saved posts, "who reacted", reporting and paging
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [reactorsPost, setReactorsPost] = useState<CommunityPost | null>(null);
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportSent, setReportSent] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Edit modal
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [editText, setEditText] = useState('');

  // Welcome card
  const [showWelcome, setShowWelcome] = useState(false);

  // Image lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const isAdmin = memberStatus.role === 'owner' || memberStatus.role === 'admin';

  // ── Banner / Avatar Upload ──
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !community) return;
    setUploadingBanner(true);
    const url = await uploadCommunityBanner(community.id, file);
    if (url) {
      await updateCommunityBanner(community.id, url);
      setCommunity(prev => prev ? { ...prev, banner_url: url } : prev);
    }
    setUploadingBanner(false);
    e.target.value = '';
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !community) return;
    setUploadingAvatar(true);
    const url = await uploadCommunityAvatar(community.id, file);
    if (url) {
      await updateCommunityAvatar(community.id, url);
      setCommunity(prev => prev ? { ...prev, avatar_url: url } : prev);
    }
    setUploadingAvatar(false);
    e.target.value = '';
  };

  // ── Load Data ──
  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [comm, postList, memberList, status, bookmarks] = await Promise.all([
        getCommunity(id),
        getCommunityPosts(id, { sortBy: feedSort, search: searchQuery || undefined }),
        getCommunityMembers(id),
        user ? isMember(id) : Promise.resolve({ member: false }),
        user ? getMyCommunityBookmarks(id) : Promise.resolve(new Set<string>()),
      ]);
      setCommunity(comm);
      setPosts(postList);
      setMembers(memberList);
      setMemberStatus(status);
      setBookmarkedIds(bookmarks);
      setHasMore(postList.length >= 30);
    } catch {}
    setLoading(false);
  }, [id, user, feedSort, searchQuery]);

  /**
   * Page on created_at using the OLDEST post loaded, not the last one on
   * screen — pinned posts are hoisted to the top and "popular"/"rising"
   * reorder the page, so the last card is rarely the oldest.
   */
  const loadMore = useCallback(async () => {
    if (!id || loadingMore || !hasMore || posts.length === 0) return;
    setLoadingMore(true);
    try {
      const oldest = posts.reduce(
        (min, p) => (new Date(p.created_at).getTime() < new Date(min).getTime() ? p.created_at : min),
        posts[0].created_at,
      );
      const more = await getCommunityPosts(id, {
        sortBy: feedSort,
        search: searchQuery || undefined,
        before: oldest,
      });
      setPosts(prev => {
        const seen = new Set(prev.map(p => p.id));
        return [...prev, ...more.filter(p => !seen.has(p.id))];
      });
      setHasMore(more.length >= 30);
    } catch {
      setHasMore(false);
    }
    setLoadingMore(false);
  }, [id, loadingMore, hasMore, posts, feedSort, searchQuery]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Join / Leave ──
  const handleJoin = async () => {
    if (!id) return;
    const ok = await joinCommunity(id);
    if (ok) {
      // Check for welcome message
      const comm = await getCommunity(id);
      if (comm?.welcome_message) setShowWelcome(true);
      loadData();
    }
  };

  const handleLeave = async () => {
    if (!id || !confirm('Are you sure you want to leave this community?')) return;
    await leaveCommunity(id);
    loadData();
  };

  // ── Create Post ──
  const handleCreatePost = async () => {
    if (!id || !newPostText.trim()) return;
    setPosting(true);

    let imageUrl = composerGifUrl || undefined;
    let mediaKind = composerMediaKind || undefined;
    let videoUrl: string | undefined;

    if (composerImage && community) {
      const uploaded = await uploadCommunityPostMedia(community.id, composerImage);
      if (uploaded) {
        if (uploaded.mediaKind === 'video') {
          // Videos live in video_url, matching the feed — that's what makes
          // view counts and downloads work.
          videoUrl = uploaded.url;
          mediaKind = undefined;
        } else {
          imageUrl = uploaded.url;
          mediaKind = uploaded.mediaKind;
        }
      } else {
        setPosting(false);
        alert('Could not upload that file. Try again.');
        return;
      }
    }

    const result = await createCommunityPost(
      id,
      newPostText.trim(),
      selectedPostType,
      newPostTopic.trim() || undefined,
      imageUrl,
      mediaKind,
      {
        videoUrl,
        allowDownload: composerAllowDownload,
        style: composerPreset !== 'default' ? { preset: composerPreset } : null,
      },
    );
    if (result.success) {
      setNewPostText('');
      setNewPostTopic('');
      setSelectedPostType('discussion');
      setComposerImage(null);
      setComposerImagePreview(null);
      setComposerGifUrl(null);
      setComposerMediaKind(null);
      setComposerPreset('default');
      setComposerAllowDownload(true);
      setShowComposer(false);
      loadData();
    } else {
      alert(result.error || 'Failed to post');
    }
    setPosting(false);
  };

  // ── Post Actions ──
  const handleLike = async (postId: string) => {
    const newLikes = await likeCommunityPost(postId);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: newLikes } : p));
  };

  /**
   * Optimistic, like the cosmic feed: the chip responds on the click and the
   * server result reconciles after. A failure puts the snapshot back.
   */
  const handleReaction = async (postId: string, emoji: string) => {
    const previous = posts;
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const existing = p.reactions.find(r => r.emoji === emoji);
      let next = p.reactions;
      if (existing && existing.user_reacted) {
        next = next
          .map(r => r.emoji === emoji ? { ...r, count: r.count - 1, user_reacted: false } : r)
          .filter(r => r.count > 0);
      } else {
        // One reaction per person per post — drop whatever they had first.
        next = next
          .map(r => r.user_reacted ? { ...r, count: r.count - 1, user_reacted: false } : r)
          .filter(r => r.count > 0);
        next = next.some(r => r.emoji === emoji)
          ? next.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, user_reacted: true } : r)
          : [...next, { emoji, count: 1, user_reacted: true }];
      }
      return { ...p, reactions: next };
    }));

    try {
      const server = await toggleCommunityReaction(postId, emoji);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, reactions: server } : p));
    } catch {
      setPosts(previous);
    }
  };

  const handleBookmark = async (post: CommunityPost) => {
    if (!id) return;
    const saved = await toggleCommunityBookmark(post.id, id);
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (saved) next.add(post.id);
      else next.delete(post.id);
      return next;
    });
  };

  const handleRepost = async (post: CommunityPost) => {
    if (!id) return;
    const result = await repostCommunityPost(id, post);
    if (result.success && result.post) {
      setPosts(prev => [result.post!, ...prev]);
    } else {
      alert(result.error || 'Could not repost.');
    }
  };

  const handleShare = async (post: CommunityPost) => {
    const url = `${window.location.origin}/communities/${id}`;
    const payload = {
      title: `${post.user_name} in ${community?.name || 'a community'} on Align`,
      text: post.content.slice(0, 100),
      url,
    };
    if (navigator.share) {
      navigator.share(payload).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  };

  const handlePin = async (postId: string) => {
    await togglePinPost(id!, postId);
    loadData();
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    await deleteCommunityPost(id!, postId);
    loadData();
  };

  const handleEdit = (post: CommunityPost) => {
    setEditingPost(post);
    setEditText(post.content);
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    const result = await editCommunityPost(editingPost.id, editText);
    if (result.success) {
      setEditingPost(null);
      loadData();
    }
  };

  const handleRemoveMember = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name} from this community?`)) return;
    await removeMember(id!, userId);
    loadData();
  };

  const handleSubmitReport = async (postId: string, reason: string) => {
    if (!id) return;
    await reportCommunityPost(id, postId, reason as any);
    setReportSent(true);
  };

  // ── Render ──
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <RefreshCw className="w-6 h-6 text-accent-primary animate-spin mx-auto mb-3" />
        <p className="text-text-muted text-sm">{t('communities.loading')}</p>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-text-muted mb-4">{t('errors.notFound')}</p>
        <Link href="/communities" className="text-accent-primary text-sm hover:underline">{t('common.back')} {t('communities.title')}</Link>
      </div>
    );
  }

  const catInfo = COMMUNITY_CATEGORIES.find(c => c.id === community.category);
  const zodiacEmoji = community.zodiac_sign ? ZODIAC_EMOJIS[community.zodiac_sign] || '' : '';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      {/* Back + Header */}
      <div className="flex items-center justify-between">
        <Link href="/communities" className="btn-ghost p-2 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary">
          <ArrowLeft className="w-4 h-4" /> {t('communities.title')}
        </Link>
        {memberStatus.member ? (
          <button onClick={handleLeave} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-tertiary text-text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors">
            {t('communities.joined')}
          </button>
        ) : (
          <button onClick={handleJoin} className="px-4 py-1.5 rounded-lg text-xs font-medium bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 transition-colors">
            {t('communities.join')}
          </button>
        )}
      </div>

      {/* Community Banner */}
      <div className="relative w-full rounded-xl overflow-hidden mb-4 group">
        {community.banner_url ? (
          <div className="h-48">
            <img src={community.banner_url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 flex items-center justify-center">
            <span className="text-4xl">{catInfo?.emoji || '🌟'}</span>
          </div>
        )}
        {isAdmin && (
          <label className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 cursor-pointer flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-3.5 h-3.5 text-white" />
            <span className="text-xs text-white font-medium">{uploadingBanner ? t('common.loading') : t('common.edit')}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} disabled={uploadingBanner} />
          </label>
        )}
      </div>

      {/* Community Info */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="relative w-16 h-16 rounded-xl bg-accent-primary/10 flex items-center justify-center text-3xl shrink-0 group/avatar">
            {community.avatar_url ? (
              <img src={community.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
            ) : (
              zodiacEmoji || catInfo?.emoji || '✨'
            )}
            {isAdmin && (
              <label className="absolute inset-0 bg-black/50 rounded-xl cursor-pointer flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
              </label>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-text-primary">{community.name}</h1>
            <p className="text-sm text-text-secondary mt-1">{community.description}</p>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Users className="w-3 h-3" /> {t('communities.memberCount_other', { count: community.member_count })}
              </span>
              <span className="text-xs text-text-muted">{community.post_count} posts</span>
              {catInfo && (
                <span className="text-xs text-text-muted">{catInfo.emoji} {catInfo.label}</span>
              )}
              {community.zodiac_sign && (
                <span className="text-xs text-text-muted">{zodiacEmoji} {community.zodiac_sign}</span>
              )}
            </div>
          </div>
        </div>

        {/* Member avatars */}
        {members.length > 0 && (
          <div className="flex items-center mt-4 -space-x-2">
            {members.slice(0, 6).map(m => (
              <Link key={m.user_id} href={`/user/${m.user_id}`} className="w-8 h-8 rounded-full border-2 border-bg-card bg-accent-primary/10 flex items-center justify-center overflow-hidden cursor-pointer" title={m.display_name}>
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-accent-primary">{m.display_name[0]?.toUpperCase()}</span>
                )}
              </Link>
            ))}
            {members.length > 6 && (
              <div className="w-8 h-8 rounded-full border-2 border-bg-card bg-bg-tertiary flex items-center justify-center">
                <span className="text-[10px] font-medium text-text-muted">+{members.length - 6}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Welcome Card */}
      {showWelcome && community.welcome_message && (
        <div className="card rounded-2xl p-4 border-accent-primary/30 bg-accent-primary/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">🎉 Welcome!</p>
              <p className="text-sm text-text-secondary mt-1">{community.welcome_message}</p>
            </div>
            <button onClick={() => setShowWelcome(false)} className="p-1">
              <X className="w-4 h-4 text-text-muted" />
            </button>
          </div>
        </div>
      )}

      {/* View Mode Tabs */}
      <div className="flex gap-1 bg-bg-card rounded-xl p-1 border border-border-primary">
        {(['posts', 'members', 'about'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
              viewMode === mode
                ? 'bg-accent-primary/20 text-accent-primary'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {mode === 'posts' && `Posts (${community.post_count})`}
            {mode === 'members' && `Members (${community.member_count})`}
            {mode === 'about' && 'About'}
          </button>
        ))}
      </div>

      {/* ═══ POSTS VIEW ═══ */}
      {viewMode === 'posts' && (
        <>
          {/* Sort + Search */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-bg-card rounded-lg p-0.5 border border-border-primary">
              {(['newest', 'popular', 'rising'] as const).map(sort => (
                <button
                  key={sort}
                  onClick={() => setFeedSort(sort)}
                  className={`px-3 py-1 rounded-md text-[11px] font-medium capitalize transition-all ${
                    feedSort === sort ? 'bg-accent-primary/20 text-accent-primary' : 'text-text-muted'
                  }`}
                >
                  {sort}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {showSearch && (
            <input
              type="text"
              placeholder={t('communities.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-bg-card rounded-xl text-sm text-text-primary placeholder:text-text-muted border border-border-primary focus:border-accent-primary/50 focus:outline-none"
              autoFocus
            />
          )}

          {/* New Post Composer */}
          {memberStatus.member && (
            <div className="card rounded-2xl p-4">
              {!showComposer ? (
                <button
                  onClick={() => setShowComposer(true)}
                  className="w-full text-left text-sm text-text-muted py-2 px-3 bg-bg-tertiary rounded-xl hover:bg-bg-tertiary/80"
                >
                  What's on your mind? ✨
                </button>
              ) : (
                <div className="space-y-3">
                  {/* Post Type Selector */}
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {(Object.keys(POST_TYPE_META) as PostType[]).map(type => {
                      const meta = POST_TYPE_META[type];
                      return (
                        <button
                          key={type}
                          onClick={() => setSelectedPostType(type)}
                          className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                            selectedPostType === type
                              ? 'text-white'
                              : 'bg-bg-tertiary text-text-muted'
                          }`}
                          style={selectedPostType === type ? { backgroundColor: meta.color } : undefined}
                        >
                          {meta.emoji} {meta.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Topic */}
                  <input
                    type="text"
                    placeholder="Topic (optional)"
                    value={newPostTopic}
                    onChange={e => setNewPostTopic(e.target.value)}
                    maxLength={50}
                    className="w-full px-3 py-2 bg-bg-tertiary rounded-lg text-sm text-text-primary placeholder:text-text-muted border-none focus:outline-none"
                  />

                  {/* Content — @mention-aware, same input as the feed composer */}
                  {(() => {
                    const preset = POST_STYLE_PRESETS.find(pr => pr.id === composerPreset);
                    const styled = preset && preset.id !== 'default'
                      && !composerImagePreview && !composerGifUrl;
                    return (
                      <div
                        className="rounded-lg p-1"
                        style={styled
                          ? { background: `linear-gradient(135deg, ${preset!.gradient[0]}, ${preset!.gradient[1]})` }
                          : undefined}
                      >
                        <MentionInput
                          value={newPostText}
                          onChange={setNewPostText}
                          excludeUserId={user?.id}
                          multiline
                          rows={4}
                          maxLength={2000}
                          placeholder="Share your thoughts..."
                          className="w-full px-3 py-2 bg-bg-tertiary rounded-lg text-sm text-text-primary placeholder:text-text-muted border-none focus:outline-none resize-none"
                          style={styled
                            ? { background: 'transparent', color: preset!.textColor }
                            : undefined}
                        />
                      </div>
                    );
                  })()}

                  {/* Media Action Bar */}
                  <div className="flex items-center gap-2 mt-2">
                    {/* Image Upload */}
                    <button
                      type="button"
                      onClick={() => document.getElementById('post-image-upload')?.click()}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                      title="Add image"
                    >📷</button>
                    <input
                      id="post-image-upload"
                      type="file"
                      accept="image/*,video/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setComposerImage(file);
                        setComposerImagePreview(URL.createObjectURL(file));
                        setComposerMediaKind(file.type.startsWith('video/') ? 'video' : 'photo');
                        setComposerGifUrl(null);
                      }}
                      className="hidden"
                    />

                    {/* GIF/Sticker */}
                    <button
                      type="button"
                      onClick={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); }}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors text-xs font-bold"
                      title="Add GIF/Sticker"
                    >GIF</button>

                    {/* Emoji */}
                    <button
                      type="button"
                      onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false); }}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                      title="Add emoji"
                    >😊</button>
                  </div>

                  {/* GIF Picker */}
                  {showGifPicker && (
                    <div className="relative mt-2">
                      <GifStickerPicker
                        isOpen={showGifPicker}
                        onSelect={(url: string, type: 'gif' | 'sticker') => {
                          setComposerGifUrl(url);
                          setComposerMediaKind(type);
                          setComposerImage(null);
                          setComposerImagePreview(null);
                          setShowGifPicker(false);
                        }}
                        onClose={() => setShowGifPicker(false)}
                      />
                    </div>
                  )}

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="relative mt-2">
                      <EmojiPicker
                        onSelect={(emoji: string) => {
                          setNewPostText(prev => prev + emoji);
                        }}
                        onClose={() => setShowEmojiPicker(false)}
                      />
                    </div>
                  )}

                  {/* Media Preview */}
                  {(composerImagePreview || composerGifUrl) && (
                    <div className="relative mt-2 inline-block">
                      {composerMediaKind === 'video' ? (
                        <video src={composerImagePreview!} className="max-h-40 rounded-lg" controls />
                      ) : (
                        <img
                          src={composerImagePreview || composerGifUrl || ''}
                          alt="Preview"
                          className="max-h-40 rounded-lg object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setComposerImage(null);
                          setComposerImagePreview(null);
                          setComposerGifUrl(null);
                          setComposerMediaKind(null);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-500/80"
                      >✕</button>
                    </div>
                  )}

                  {/* Background style — text-only posts, same presets as the feed */}
                  {!composerImagePreview && !composerGifUrl && (
                    <div>
                      <p className="text-[11px] text-text-muted font-medium mb-1.5">Background</p>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {POST_STYLE_PRESETS.map(pr => (
                          <button
                            key={pr.id}
                            type="button"
                            onClick={() => setComposerPreset(pr.id)}
                            title={pr.label}
                            className={`w-7 h-7 rounded-lg border-2 shrink-0 transition-all ${
                              composerPreset === pr.id ? 'border-accent-primary scale-110' : 'border-border-primary'
                            }`}
                            style={pr.id === 'default'
                              ? { background: '#1E2640' }
                              : { background: `linear-gradient(135deg, ${pr.gradient[0]}, ${pr.gradient[1]})` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Downloads opt-out — video posts only. Saved copies carry
                      the Align outro, so this is the creator's say over that. */}
                  {composerMediaKind === 'video' && (
                    <label className="flex items-center gap-2.5 cursor-pointer select-none py-1">
                      <input
                        type="checkbox"
                        checked={composerAllowDownload}
                        onChange={e => setComposerAllowDownload(e.target.checked)}
                        className="w-4 h-4 accent-accent-primary"
                      />
                      <span className="text-xs text-text-muted">Let others download this video</span>
                    </label>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-text-muted">{newPostText.length}/2000</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setShowComposer(false); setNewPostText(''); setNewPostTopic(''); setComposerImage(null); setComposerImagePreview(null); setComposerGifUrl(null); setComposerMediaKind(null); setComposerPreset('default'); setComposerAllowDownload(true); setShowGifPicker(false); setShowEmojiPicker(false); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:bg-bg-tertiary"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        onClick={handleCreatePost}
                        disabled={posting || !newPostText.trim()}
                        className="px-4 py-1.5 rounded-lg text-xs font-medium bg-accent-primary text-white hover:bg-accent-primary/80 disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        {posting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        {t('feed.composer.postButton')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Posts Feed */}
          {posts.length === 0 ? (
            <div className="card rounded-2xl p-8 text-center">
              <p className="text-text-muted text-sm">{t('profile.empty.noPosts')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  isAdmin={isAdmin}
                  myId={user?.id || ''}
                  isBookmarked={bookmarkedIds.has(post.id)}
                  onLike={() => handleLike(post.id)}
                  onReaction={(emoji) => handleReaction(post.id, emoji)}
                  onViewReactors={() => setReactorsPost(post)}
                  onComment={() => setCommentPostId(post.id)}
                  onPin={() => handlePin(post.id)}
                  onDelete={() => handleDelete(post.id)}
                  onEdit={() => handleEdit(post)}
                  onReport={() => { setReportSent(false); setReportingPostId(post.id); }}
                  onBookmark={() => handleBookmark(post)}
                  onRepost={() => handleRepost(post)}
                  onShare={() => handleShare(post)}
                  onImageClick={(url) => setLightboxUrl(url)}
                />
              ))}
            </div>
          )}

          {/* Load more */}
          {hasMore && posts.length > 0 && (
            <div className="text-center py-6">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="btn-secondary text-sm inline-flex items-center gap-2"
              >
                {loadingMore && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {loadingMore ? t('feed.loading') : t('feed.loadMore')}
              </button>
            </div>
          )}
        </>
      )}

      {/* ═══ MEMBERS VIEW ═══ */}
      {viewMode === 'members' && (
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.user_id} className="card rounded-xl p-3 flex items-center gap-3">
              <Link href={`/user/${m.user_id}`} className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center overflow-hidden">
                  {m.avatar_url ? (
                    <img src={m.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-accent-primary">{m.display_name[0]?.toUpperCase()}</span>
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-text-primary truncate">{m.display_name}</span>
                  {roleBadge(m.role)}
                </div>
                <p className="text-[11px] text-text-muted">Joined {timeAgo(m.joined_at)}</p>
              </div>
              {isAdmin && m.role === 'member' && m.user_id !== user?.id && (
                <button
                  onClick={() => handleRemoveMember(m.user_id, m.display_name)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10"
                  title="Remove member"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ═══ ABOUT VIEW ═══ */}
      {viewMode === 'about' && (
        <div className="space-y-4">
          <div className="card rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Category</span>
              <span className="text-sm text-text-primary">{catInfo?.emoji} {catInfo?.label}</span>
            </div>
            {community.zodiac_sign && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Zodiac</span>
                <span className="text-sm text-text-primary">{zodiacEmoji} {community.zodiac_sign}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Founded</span>
              <span className="text-sm text-text-primary">
                {new Date(community.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Visibility</span>
              <span className="text-sm text-text-primary">{community.is_public ? '🌍 Public' : '🔒 Private'}</span>
            </div>
          </div>

          {community.rules && (
            <div className="card rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">📜 Community Rules</h3>
              <div className="space-y-2">
                {community.rules.split('\n').filter(Boolean).map((rule, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent-primary/10 flex items-center justify-center text-[10px] font-bold text-accent-primary shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-text-secondary">{rule.replace(/^\d+[\.\)]\s*/, '')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {community.welcome_message && (
            <div className="card rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-2">👋 Welcome Message</h3>
              <p className="text-sm text-text-secondary">{community.welcome_message}</p>
            </div>
          )}

          {/* Recent Members */}
          <div className="card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary">{t('profile.stats.friends')}</h3>
              <button onClick={() => setViewMode('members')} className="text-xs text-accent-primary hover:underline">
                {t('common.seeAll')} →
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {members.slice(0, 6).map(m => (
                <Link key={m.user_id} href={`/user/${m.user_id}`} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center overflow-hidden">
                    {m.avatar_url ? (
                      <img src={m.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-accent-primary">{m.display_name[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-[11px] text-text-muted truncate w-full text-center">{m.display_name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ COMMENTS — the cosmic feed's sheet ═══ */}
      {commentPostId && (() => {
        const post = posts.find(p => p.id === commentPostId);
        return (
          <CommentSheet
            postId={commentPostId}
            postOwnerId={post?.user_id || ''}
            userId={user?.id || ''}
            scope="community"
            canModerate={isAdmin}
            onClose={() => setCommentPostId(null)}
            onCommentCountChange={(pid, delta) => {
              setPosts(prev => prev.map(p =>
                p.id === pid ? { ...p, comment_count: Math.max(0, p.comment_count + delta) } : p
              ));
            }}
          />
        );
      })()}

      {/* ═══ WHO REACTED ═══ */}
      {reactorsPost && (
        <ReactionViewerModal
          postId={reactorsPost.id}
          scope="community"
          reactions={reactorsPost.reactions.map(r => ({
            emoji: r.emoji as any,
            count: r.count,
            userReacted: r.user_reacted,
          }))}
          onClose={() => setReactorsPost(null)}
        />
      )}

      {/* ═══ REPORT POST ═══ */}
      {reportingPostId && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setReportingPostId(null)}
        >
          <div className="bg-bg-card border border-border-primary rounded-2xl p-5 max-w-xs w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-text-primary mb-3">
              {t('components.feedCard.reportPost', 'Report Post')}
            </h3>
            {reportSent ? (
              <p className="text-sm text-green-400 mb-4">
                {t('components.feedCard.reportThanks', "Thanks for reporting. We'll review this post.")}
              </p>
            ) : (
              <div className="space-y-1 mb-4">
                {REPORT_REASONS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleSubmitReport(reportingPostId, r.id)}
                    className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-bg-secondary rounded-lg transition-colors"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => { setReportingPostId(null); setReportSent(false); }}
              className="btn-secondary w-full text-sm"
            >
              {reportSent ? t('common.done') : t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* ═══ EDIT POST MODAL ═══ */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-bg-secondary rounded-2xl border border-border-primary w-full max-w-md p-4 space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">{t('profile.editPost')}</h3>
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              maxLength={2000}
              rows={6}
              className="w-full px-3 py-2 bg-bg-tertiary rounded-xl text-sm text-text-primary border-none focus:outline-none resize-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingPost(null)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted">{t('common.cancel')}</button>
              <button onClick={handleSaveEdit} className="px-4 py-1.5 rounded-lg text-xs font-medium bg-accent-primary text-white">{t('common.save')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ IMAGE LIGHTBOX ═══ */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 cursor-pointer"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={lightboxUrl}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// POST CARD
// ═════════════════════════════════════════════════════════════════════

function formatViewCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

// One recorded view per post per page session; the DB primary key dedupes
// per user across sessions. Same contract as the cosmic feed.
const recordedVideoViewPosts = new Set<string>();

/** The feed's creator-tier estimate, computed from a community post's stats. */
function estimateCreatorTierFromPost(post: CommunityPost) {
  const likes = post.reactions.reduce((sum, r) => sum + r.count, 0) + post.likes.length;
  return getCreatorTier(Math.min(100, likes * 3 + post.comment_count * 5));
}

/** The feed's Rising / Trending / Supernova badge, for a community post. */
function getViralityIndicatorFromPost(post: CommunityPost): { label: string; emoji: string } | null {
  const likes = post.reactions.reduce((sum, r) => sum + r.count, 0) + post.likes.length;
  const metrics: ContentMetrics = {
    id: post.id,
    created_at: post.created_at,
    content_type: post.video_url ? 'video' : post.image_url ? 'image' : 'text',
    likes_count: likes,
    comments_count: post.comment_count,
    impressions_count: Math.max(likes * 10, 1),
    caption: post.content || '',
    creator_score: 50,
    follower_count: 100,
  };
  const tier = getViralTier(predictViralScore(metrics));
  if (tier === 'supernova') return { label: 'Supernova', emoji: '\u{1F4A5}' };
  if (tier === 'viral') return { label: 'Trending', emoji: '\u{1F525}' };
  if (tier === 'rising') return { label: 'Rising', emoji: '⚡' };
  return null;
}

function PostCard({
  post, isAdmin, myId, isBookmarked,
  onLike, onReaction, onViewReactors, onComment, onPin, onDelete, onEdit, onReport,
  onBookmark, onRepost, onShare, onImageClick,
}: {
  post: CommunityPost;
  isAdmin: boolean;
  myId: string;
  isBookmarked: boolean;
  onLike: () => void;
  onReaction: (emoji: string) => void;
  onViewReactors: () => void;
  onComment: () => void;
  onPin: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onReport: () => void;
  onBookmark: () => void;
  onRepost: () => void;
  onShare: () => void;
  onImageClick?: (url: string) => void;
}) {
  const { t } = useTranslation();
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [downloading, setDownloading] = useState(false);
  // Doubles as progress text while a cold variant encodes, then as the error
  // if it fails. Null = show the plain "Save video" label.
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const isAuthor = post.user_id === myId;
  const typeMeta = POST_TYPE_META[post.post_type] || POST_TYPE_META.discussion;

  // Background style — text-only posts, exactly as the feed gates it.
  const preset = post.style?.preset && !post.image_url && !post.video_url
    ? POST_STYLE_PRESETS.find(pr => pr.id === post.style?.preset)
    : null;
  const hasGradient = !!preset && preset.id !== 'default';
  const cardStyle = hasGradient
    ? { background: `linear-gradient(135deg, ${preset!.gradient[0]}, ${preset!.gradient[1]})` }
    : undefined;
  const textColor = hasGradient ? preset!.textColor : undefined;

  // Saves the branded copy (clip + Align outro). The first download of a
  // given video waits on the encode; later ones are instant.
  const handleDownload = useCallback(async () => {
    if (downloading || !post.video_url) return;
    setDownloading(true);
    setDownloadNotice(null);
    try {
      const result = await downloadVideo('community', post.id, post.video_url, setDownloadNotice);
      setDownloadNotice(result.saved ? null : result.error || 'Could not save.');
    } finally {
      setDownloading(false);
    }
  }, [downloading, post.id, post.video_url]);

  return (
    <div
      className={`card rounded-2xl p-4 relative ${post.is_pinned ? 'border-yellow-500/30' : ''}`}
      style={cardStyle}
    >
      {/* Pinned banner */}
      {post.is_pinned && (
        <div className="flex items-center gap-1 text-[11px] text-yellow-400 font-medium mb-2">
          <Pin className="w-3 h-3" /> {t('messages.contextMenu.pin')}
        </div>
      )}

      {/* Repost attribution */}
      {post.original_user_name && (
        <p className="text-xs text-text-muted mb-1" style={textColor ? { color: textColor, opacity: 0.85 } : undefined}>
          ↻ Reposted from <span className="font-medium text-accent-secondary">{post.original_user_name}</span>
        </p>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href={`/user/${post.user_id}`} className="shrink-0">
          <div className="w-9 h-9 rounded-full bg-accent-primary/10 flex items-center justify-center overflow-hidden">
            {post.user_avatar ? (
              <img src={post.user_avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-accent-primary">{post.user_name[0]?.toUpperCase()}</span>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/user/${post.user_id}`}
              className="text-sm font-semibold text-text-primary truncate hover:underline"
              style={textColor ? { color: textColor } : undefined}
            >
              {post.user_name}
            </Link>
            {roleBadge(post.user_role)}
            {(() => {
              const tier = estimateCreatorTierFromPost(post);
              if (tier === 'newcomer') return null;
              const badge = getCreatorBadge(tier);
              return <span className="text-xs" title={badge.label}>{badge.emoji}</span>;
            })()}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-text-muted" style={textColor ? { color: textColor, opacity: 0.7 } : undefined}>
              {timeAgo(post.created_at)}
            </span>
            {post.edited_at && <span className="text-[10px] text-text-muted">(edited)</span>}
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded-lg text-text-muted hover:bg-bg-tertiary">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-bg-secondary rounded-xl border border-border-primary shadow-lg py-1 z-20 min-w-[140px]">
              {isAuthor && (
                <button onClick={() => { onEdit(); setShowMenu(false); }} className="w-full px-3 py-2 text-left text-xs text-text-secondary hover:bg-bg-tertiary flex items-center gap-2">
                  <Edit3 className="w-3 h-3" /> {t('common.edit')}
                </button>
              )}
              {isAdmin && (
                <button onClick={() => { onPin(); setShowMenu(false); }} className="w-full px-3 py-2 text-left text-xs text-text-secondary hover:bg-bg-tertiary flex items-center gap-2">
                  <Pin className="w-3 h-3" /> {post.is_pinned ? 'Unpin' : 'Pin'}
                </button>
              )}
              {(isAuthor || isAdmin) && (
                <button onClick={() => { onDelete(); setShowMenu(false); }} className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                  <Trash2 className="w-3 h-3" /> {t('common.delete')}
                </button>
              )}
              {!isAuthor && (
                <button onClick={() => { onReport(); setShowMenu(false); }} className="w-full px-3 py-2 text-left text-xs text-text-secondary hover:bg-bg-tertiary flex items-center gap-2">
                  <Flag className="w-3 h-3" /> Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post type + topic badges */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span
          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium text-white"
          style={{ backgroundColor: typeMeta.color }}
        >
          {typeMeta.emoji} {typeMeta.label}
        </span>
        {post.topic && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-bg-tertiary text-text-muted">
            #{post.topic}
          </span>
        )}
      </div>

      {/* Content — @mentions, clickable links, staged "Read more", and the
          same YouTube / TikTok / Instagram / Facebook / link-preview embeds
          the cosmic feed renders. */}
      {post.content && (
        <PostRichBody
          content={post.content}
          textClassName={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
            hasGradient ? 'text-lg py-4 text-center font-medium' : 'text-text-primary'
          }`}
          textStyle={textColor ? { color: textColor } : undefined}
          embedClassName="mt-3"
        />
      )}

      {/* Media */}
      {post.image_url && (
        <div className="mt-3 rounded-xl overflow-hidden">
          {post.media_kind === 'video' ? (
            /* Legacy rows: videos written before video_url existed. */
            <video src={post.image_url} controls className="w-full max-h-96 object-contain bg-black rounded-xl" />
          ) : post.media_kind === 'sticker' ? (
            <img
              src={post.image_url}
              alt=""
              className="max-h-48 object-contain cursor-pointer hover:opacity-90 transition-opacity"
              loading="lazy"
              onClick={() => onImageClick?.(post.image_url!)}
            />
          ) : (
            <img
              src={post.image_url}
              alt=""
              className="w-full max-h-96 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
              loading="lazy"
              onClick={() => onImageClick?.(post.image_url!)}
            />
          )}
        </div>
      )}

      {post.video_url && (
        <div className="mt-3 relative">
          <video
            src={post.video_url}
            poster={post.poster_url || undefined}
            controls
            playsInline
            preload="metadata"
            className="w-full rounded-xl max-h-96 bg-black"
            onPlay={() => {
              if (!recordedVideoViewPosts.has(post.id)) {
                recordedVideoViewPosts.add(post.id);
                recordCommunityPostVideoView(post.id);
              }
            }}
          />
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/55 text-white text-[11px] font-semibold pointer-events-none">
            👁️ {formatViewCount(post.video_views_count || 0)}
          </span>
        </div>
      )}

      {/* Reaction chips */}
      {post.reactions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          {post.reactions.map(r => (
            <button
              key={r.emoji}
              onClick={() => onReaction(r.emoji)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
                r.user_reacted
                  ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                  : 'bg-bg-tertiary text-text-muted border border-transparent hover:border-border-accent'
              }`}
            >
              {r.emoji} {r.count}
            </button>
          ))}
          <button
            onClick={onViewReactors}
            className="text-xs text-text-secondary hover:text-accent-primary hover:underline transition-colors"
          >
            {t('feed.seeWhoReacted', 'See who reacted')}
          </button>
        </div>
      )}

      {/* Virality indicator */}
      {(() => {
        const indicator = getViralityIndicatorFromPost(post);
        if (!indicator) return null;
        return (
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/12 text-orange-400">
              {indicator.emoji} {indicator.label}
            </span>
          </div>
        );
      })()}

      {/* Actions */}
      <div className="flex items-center mt-3 pt-2 border-t border-border-primary">
        <button
          onClick={() => setShowReactions(!showReactions)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-text-muted hover:text-accent-primary transition-colors"
        >
          <span className="text-base">✨</span> {t('messages.contextMenu.react')}
        </button>

        {/* Legacy hearts stay reachable so likes left before reactions
            existed can still be given and taken back. */}
        <button
          onClick={onLike}
          className={`flex items-center justify-center gap-1 px-2 py-1.5 text-xs ${
            post.likes.includes(myId) ? 'text-pink-400' : 'text-text-muted hover:text-pink-400'
          }`}
          title="Like"
        >
          <Heart className={`w-3.5 h-3.5 ${post.likes.includes(myId) ? 'fill-pink-400' : ''}`} />
          {post.likes.length > 0 && <span>{post.likes.length}</span>}
        </button>

        <button
          onClick={onComment}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-text-muted hover:text-accent-primary transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {post.comment_count > 0 ? post.comment_count : t('components.feedCard.comment')}
        </button>

        <button
          onClick={onRepost}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-text-muted hover:text-accent-primary transition-colors"
        >
          <Repeat2 className="w-4 h-4" /> {t('feed.composer.repost', 'Repost')}
        </button>

        <button
          onClick={onBookmark}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs transition-colors ${
            isBookmarked ? 'text-accent-primary' : 'text-text-muted hover:text-accent-primary'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          {isBookmarked ? t('components.feedCard.saved', 'Saved') : t('common.save')}
        </button>

        <button
          onClick={onShare}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-text-muted hover:text-accent-primary transition-colors"
        >
          <Share2 className="w-4 h-4" /> {t('components.feedCard.share')}
        </button>

        {/* Download — video posts only, and only when the creator allows it.
            The saved file carries the Align outro. */}
        {post.video_url && post.allow_download !== false && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Save video"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-text-muted hover:text-accent-primary transition-colors disabled:opacity-60"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {downloadNotice || 'Save video'}
          </button>
        )}
      </div>

      {/* Reaction picker */}
      {showReactions && (
        <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-border-primary">
          {REACTION_OPTIONS.map(opt => (
            <button
              key={opt.emoji}
              onClick={() => { onReaction(opt.emoji); setShowReactions(false); }}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-accent-muted transition-colors"
              title={opt.label}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span className="text-[9px] text-text-muted">{opt.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close the menu */}
      {showMenu && <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />}
    </div>
  );
}
