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
  commentOnCommunityPost, getCommunityPostComments,
  togglePinPost, removeMember, reportCommunityPost,
  uploadCommunityPostMedia, uploadCommunityBanner, uploadCommunityAvatar,
  updateCommunityBanner, updateCommunityAvatar,
  POST_TYPE_META, REACTION_OPTIONS, REPORT_REASONS, COMMUNITY_CATEGORIES, ZODIAC_EMOJIS,
  type Community, type CommunityPost, type CommunityMember, type CommunityComment,
  type CommunityRole, type PostType, type FeedSortMode, type ReactionGroup,
} from '@/lib/communityService';
import dynamic from 'next/dynamic';
const GifStickerPicker = dynamic(() => import('@/components/chat/GifStickerPicker').then(m => ({ default: m.GifStickerPicker })), { ssr: false });
const EmojiPicker = dynamic(() => import('@/components/ui/EmojiPicker'), { ssr: false });
import Link from 'next/link';
import {
  ArrowLeft, Users, Send, Heart, MessageCircle, Pin,
  Trash2, Edit3, MoreHorizontal, Shield, Crown, Star,
  Search, RefreshCw, Flag, X, ChevronDown, Camera,
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

  // Comments modal
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

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
      const [comm, postList, memberList, status] = await Promise.all([
        getCommunity(id),
        getCommunityPosts(id, { sortBy: feedSort, search: searchQuery || undefined }),
        getCommunityMembers(id),
        user ? isMember(id) : Promise.resolve({ member: false }),
      ]);
      setCommunity(comm);
      setPosts(postList);
      setMembers(memberList);
      setMemberStatus(status);
    } catch {}
    setLoading(false);
  }, [id, user, feedSort, searchQuery]);

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

    if (composerImage && community) {
      const uploaded = await uploadCommunityPostMedia(community.id, composerImage);
      if (uploaded) {
        imageUrl = uploaded.url;
        mediaKind = uploaded.mediaKind;
      }
    }

    const result = await createCommunityPost(
      id,
      newPostText.trim(),
      selectedPostType,
      newPostTopic.trim() || undefined,
      imageUrl,
      mediaKind,
    );
    if (result.success) {
      setNewPostText('');
      setNewPostTopic('');
      setSelectedPostType('discussion');
      setComposerImage(null);
      setComposerImagePreview(null);
      setComposerGifUrl(null);
      setComposerMediaKind(null);
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

  const handleReaction = async (postId: string, emoji: string) => {
    const newReactions = await toggleCommunityReaction(postId, emoji);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, reactions: newReactions } : p));
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

  const handleReport = async (postId: string) => {
    const reason = prompt('Report reason: spam, harassment, hate_speech, inappropriate, off_topic, other');
    if (!reason) return;
    const validReasons = ['spam','harassment','hate_speech','misinformation','inappropriate','scam','off_topic','other'];
    const r = validReasons.includes(reason) ? reason : 'other';
    await reportCommunityPost(id!, postId, r as any);
    alert('Report submitted. Thank you.');
  };

  // ── Comments ──
  const openComments = async (postId: string) => {
    setCommentPostId(postId);
    setCommentsLoading(true);
    const cmts = await getCommunityPostComments(postId);
    setComments(cmts);
    setCommentsLoading(false);
  };

  const handleSendComment = async () => {
    if (!commentPostId || !newComment.trim()) return;
    setSendingComment(true);
    const result = await commentOnCommunityPost(commentPostId, newComment.trim());
    if (result.success) {
      setNewComment('');
      const cmts = await getCommunityPostComments(commentPostId);
      setComments(cmts);
      // Update comment count in posts
      setPosts(prev => prev.map(p =>
        p.id === commentPostId ? { ...p, comment_count: cmts.length } : p
      ));
    }
    setSendingComment(false);
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
              <div key={m.user_id} className="w-8 h-8 rounded-full border-2 border-bg-card bg-accent-primary/10 flex items-center justify-center overflow-hidden" title={m.display_name}>
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-accent-primary">{m.display_name[0]?.toUpperCase()}</span>
                )}
              </div>
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

                  {/* Content */}
                  <textarea
                    placeholder="Share your thoughts..."
                    value={newPostText}
                    onChange={e => setNewPostText(e.target.value)}
                    maxLength={2000}
                    rows={4}
                    className="w-full px-3 py-2 bg-bg-tertiary rounded-lg text-sm text-text-primary placeholder:text-text-muted border-none focus:outline-none resize-none"
                  />

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

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-text-muted">{newPostText.length}/2000</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setShowComposer(false); setNewPostText(''); setNewPostTopic(''); setComposerImage(null); setComposerImagePreview(null); setComposerGifUrl(null); setComposerMediaKind(null); setShowGifPicker(false); setShowEmojiPicker(false); }}
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
                  onLike={() => handleLike(post.id)}
                  onReaction={(emoji) => handleReaction(post.id, emoji)}
                  onComment={() => openComments(post.id)}
                  onPin={() => handlePin(post.id)}
                  onDelete={() => handleDelete(post.id)}
                  onEdit={() => handleEdit(post)}
                  onReport={() => handleReport(post.id)}
                  onImageClick={(url) => setLightboxUrl(url)}
                />
              ))}
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

      {/* ═══ COMMENTS MODAL ═══ */}
      {commentPostId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-secondary rounded-t-2xl sm:rounded-2xl border border-border-primary w-full max-w-lg max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border-primary">
              <h3 className="text-sm font-semibold text-text-primary">{t('components.commentSheet.title')}</h3>
              <button onClick={() => { setCommentPostId(null); setNewComment(''); }} className="p-1">
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {commentsLoading ? (
                <p className="text-center text-text-muted text-sm py-4">{t('common.loading')}</p>
              ) : comments.length === 0 ? (
                <p className="text-center text-text-muted text-sm py-4">{t('components.commentSheet.noComments')}</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                      {c.user_avatar ? (
                        <img src={c.user_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-accent-primary">{c.user_name[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-text-primary">{c.user_name}</span>
                        <span className="text-[10px] text-text-muted">{timeAgo(c.created_at)}</span>
                      </div>
                      <p className="text-sm text-text-secondary mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {memberStatus.member && (
              <div className="p-4 border-t border-border-primary flex gap-2">
                <input
                  type="text"
                  placeholder={t('components.commentSheet.placeholder')}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendComment()}
                  className="flex-1 px-3 py-2 bg-bg-tertiary rounded-xl text-sm text-text-primary placeholder:text-text-muted border-none focus:outline-none"
                />
                <button
                  onClick={handleSendComment}
                  disabled={sendingComment || !newComment.trim()}
                  className="p-2 rounded-xl bg-accent-primary text-white disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
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

function PostCard({
  post, isAdmin, myId, onLike, onReaction, onComment, onPin, onDelete, onEdit, onReport, onImageClick,
}: {
  post: CommunityPost;
  isAdmin: boolean;
  myId: string;
  onLike: () => void;
  onReaction: (emoji: string) => void;
  onComment: () => void;
  onPin: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onReport: () => void;
  onImageClick?: (url: string) => void;
}) {
  const { t } = useTranslation();
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isAuthor = post.user_id === myId;
  const isLong = post.content.length > 200;
  const typeMeta = POST_TYPE_META[post.post_type] || POST_TYPE_META.discussion;

  return (
    <div className={`card rounded-2xl p-4 ${post.is_pinned ? 'border-yellow-500/30 bg-yellow-500/5' : ''}`}>
      {/* Pinned banner */}
      {post.is_pinned && (
        <div className="flex items-center gap-1 text-[11px] text-yellow-400 font-medium mb-2">
          <Pin className="w-3 h-3" /> {t('messages.contextMenu.pin')}
        </div>
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
            <span className="text-sm font-semibold text-text-primary truncate">{post.user_name}</span>
            {roleBadge(post.user_role)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-text-muted">{timeAgo(post.created_at)}</span>
            {post.edited_at && <span className="text-[10px] text-text-muted">(edited)</span>}
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded-lg text-text-muted hover:bg-bg-tertiary">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-bg-secondary rounded-xl border border-border-primary shadow-lg py-1 z-10 min-w-[140px]">
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

      {/* Content */}
      <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
        {isLong && !expanded ? post.content.slice(0, 200) + '...' : post.content}
      </p>
      {isLong && (
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-accent-primary mt-1 hover:underline">
          {expanded ? t('common.showLess') : t('common.showMore')}
        </button>
      )}

      {/* Media */}
      {post.image_url && (
        <div className="mt-3 rounded-xl overflow-hidden">
          {post.media_kind === 'video' ? (
            <video
              src={post.image_url}
              controls
              className="w-full max-h-96 object-contain bg-black rounded-xl"
            />
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

      {/* Reaction chips */}
      {post.reactions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.reactions.map((r: any) => (
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
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 mt-3 pt-2 border-t border-border-primary">
        {/* Reaction picker */}
        <div className="relative">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="p-1.5 rounded-lg text-text-muted hover:text-accent-primary hover:bg-accent-primary/10 text-xs"
          >
            ✨
          </button>
          {showReactions && (
            <div className="absolute bottom-full left-0 mb-1 bg-bg-secondary rounded-xl border border-border-primary shadow-lg p-2 flex gap-1 z-10">
              {REACTION_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => { onReaction(emoji); setShowReactions(false); }}
                  className="w-8 h-8 rounded-lg hover:bg-bg-tertiary flex items-center justify-center text-lg transition-transform hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Like */}
        <button
          onClick={onLike}
          className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
            post.likes.includes(myId)
              ? 'text-pink-400'
              : 'text-text-muted hover:text-pink-400'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${post.likes.includes(myId) ? 'fill-pink-400' : ''}`} />
          {post.likes.length > 0 && <span>{post.likes.length}</span>}
        </button>

        {/* Comments */}
        <button
          onClick={onComment}
          className="p-1.5 rounded-lg text-text-muted hover:text-accent-primary text-xs flex items-center gap-1"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {post.comment_count > 0 && <span>{post.comment_count}</span>}
        </button>
      </div>
    </div>
  );
}
