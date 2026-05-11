'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import {
  getFeed, createPost, uploadPostMedia, toggleReaction, addComment, getComments, deletePost, toggleBookmark, getUserBookmarks,
  type FeedPost, type FeedComment, type ReactionEmoji, type PostReaction,
  REACTION_OPTIONS, POST_STYLE_PRESETS,
} from '@/lib/feedService';
import { MessageCircle, Bookmark, Send, MoreHorizontal, X, Plus, Globe, Users, Trash2, Image, BarChart3, FileText } from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const TYPE_BADGES: Record<string, { label: string; color: string }> = {
  chart_share: { label: 'Chart', color: 'bg-accent-muted text-accent-primary' },
  reading_share: { label: 'Reading', color: 'bg-gold-muted text-gold-primary' },
  photo: { label: 'Photo', color: 'bg-blue-500/15 text-blue-400' },
  video: { label: 'Video', color: 'bg-red-500/15 text-red-400' },
  transit_alert: { label: 'Transit', color: 'bg-green-500/15 text-green-400' },
  compatibility_result: { label: 'Compatibility', color: 'bg-pink-500/15 text-pink-400' },
};

// ── FeedCard ───────────────────────────────────────────────────────

function FeedCard({
  post,
  currentUserId,
  onReaction,
  onComment,
  onDelete,
  isBookmarked,
  onBookmark,
}: {
  post: FeedPost;
  currentUserId: string;
  onReaction: (postId: string, emoji: ReactionEmoji) => void;
  onComment: (postId: string) => void;
  onDelete: (postId: string) => void;
  isBookmarked: boolean;
  onBookmark: (postId: string) => void;
}) {
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const isOwner = post.userId === currentUserId;

  const preset = post.style?.preset
    ? POST_STYLE_PRESETS.find((p) => p.id === post.style?.preset)
    : null;
  const hasGradient = preset && preset.id !== 'default';

  const cardStyle = hasGradient
    ? { background: `linear-gradient(135deg, ${preset!.gradient[0]}, ${preset!.gradient[1]})` }
    : undefined;

  const textColor = hasGradient ? preset!.textColor : undefined;

  return (
    <div className="card !p-0 overflow-hidden relative" style={cardStyle}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0">
          {post.userAvatar ? (
            <img src={post.userAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-accent-primary">
              {post.userName[0]?.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm" style={textColor ? { color: textColor } : undefined}>
              {post.userName}
            </span>
            {post.type !== 'text' && TYPE_BADGES[post.type] && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${TYPE_BADGES[post.type].color}`}>
                {TYPE_BADGES[post.type].label}
              </span>
            )}
            <span className="text-xs text-text-muted flex items-center gap-1">
              {post.visibility === 'friends' ? <Users className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            </span>
          </div>
          <span className="text-xs text-text-muted">{timeAgo(post.createdAt)}</span>
        </div>
        {isOwner && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-text-muted hover:text-text-primary">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-bg-elevated border border-border-primary rounded-xl shadow-lg z-20 py-1 min-w-[140px]">
                <button
                  onClick={() => { onDelete(post.id); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-bg-tertiary flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Repost banner */}
      {post.originalUserName && (
        <p className="px-5 text-xs text-text-muted mb-1">
          ↻ Reposted from <span className="font-medium text-accent-secondary">{post.originalUserName}</span>
        </p>
      )}

      {/* Content */}
      {post.content && (
        <p
          className={cn('px-5 pb-3 text-sm leading-relaxed', hasGradient ? 'text-lg py-6 text-center font-medium' : '')}
          style={textColor ? { color: textColor } : undefined}
        >
          {post.content}
        </p>
      )}

      {/* Media */}
      {post.imageUrl && (
        <div className="px-5 pb-3">
          <img
            src={post.imageUrl}
            alt=""
            className="w-full rounded-xl object-cover max-h-[400px]"
          />
        </div>
      )}
      {post.videoUrl && (
        <div className="px-5 pb-3">
          <video
            src={post.videoUrl}
            poster={post.posterUrl}
            controls
            className="w-full rounded-xl max-h-[400px]"
          />
        </div>
      )}

      {/* Reactions display */}
      {post.reactions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-5 pb-2">
          {post.reactions.map((r) => (
            <button
              key={r.emoji}
              onClick={() => onReaction(post.id, r.emoji)}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors',
                r.userReacted
                  ? 'border-accent-primary bg-accent-muted text-accent-primary'
                  : 'border-border-primary bg-bg-tertiary text-text-secondary hover:border-accent-primary/50'
              )}
            >
              <span>{r.emoji}</span>
              <span className="font-medium">{r.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center border-t border-border-primary">
        <button
          onClick={() => setShowReactions(!showReactions)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-text-muted hover:text-accent-primary transition-colors"
        >
          <span className="text-base">✨</span> React
        </button>
        <div className="w-px h-5 bg-border-primary" />
        <button
          onClick={() => onComment(post.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-text-muted hover:text-accent-primary transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {post.commentCount > 0 ? post.commentCount : 'Comment'}
        </button>
        <div className="w-px h-5 bg-border-primary" />
        <button
          onClick={() => onBookmark(post.id)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs transition-colors',
            isBookmarked ? 'text-accent-primary' : 'text-text-muted hover:text-accent-primary'
          )}
        >
          <Bookmark className={cn('w-4 h-4', isBookmarked && 'fill-current')} /> {isBookmarked ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* Reaction picker */}
      {showReactions && (
        <div className="flex items-center justify-center gap-2 px-5 py-3 border-t border-border-primary bg-bg-elevated/50">
          {REACTION_OPTIONS.map((r) => (
            <button
              key={r.emoji}
              onClick={() => { onReaction(post.id, r.emoji); setShowReactions(false); }}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-accent-muted transition-colors"
              title={r.label}
            >
              <span className="text-xl">{r.emoji}</span>
              <span className="text-[9px] text-text-muted">{r.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Inline comments preview */}
      {post.comments.length > 0 && (
        <div className="px-5 py-3 border-t border-border-primary space-y-2">
          {post.comments.map((c) => (
            <div key={c.id} className="text-sm">
              <span className="font-semibold text-text-primary mr-1.5">{c.userName}</span>
              <span className="text-text-secondary">{c.text}</span>
            </div>
          ))}
          {post.commentCount > 3 && (
            <button
              onClick={() => onComment(post.id)}
              className="text-xs text-accent-secondary hover:text-accent-primary"
            >
              View all {post.commentCount} comments
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Comment Sheet ──────────────────────────────────────────────────

function CommentSheet({
  postId,
  userId,
  onClose,
}: {
  postId: string;
  userId: string;
  onClose: () => void;
}) {
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getComments(postId).then((c) => { setComments(c); setLoading(false); });
  }, [postId]);

  async function handleSend() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const comment = await addComment(postId, userId, text.trim());
      setComments((prev) => [...prev, comment]);
      setText('');
    } catch { /* ignore */ }
    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-bg-secondary border border-border-primary rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-primary">
          <h3 className="text-lg font-semibold text-text-primary">Comments</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {loading && <p className="text-text-muted text-sm text-center py-8">Loading comments...</p>}
          {!loading && comments.length === 0 && (
            <p className="text-text-muted text-sm text-center py-8">Be the first to share your thoughts</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-accent-primary">{c.userName[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-text-primary">{c.userName}</span>
                  <span className="text-xs text-text-muted">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-sm text-text-secondary mt-0.5">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-5 py-3 border-t border-border-primary flex items-center gap-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Add a comment..."
            className="input flex-1 !py-2 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="btn-primary !px-3 !py-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Create Post Modal ──────────────────────────────────────────────

function CreatePostModal({
  userId,
  userName,
  onClose,
  onCreated,
}: {
  userId: string;
  userName: string;
  onClose: () => void;
  onCreated: (post: any) => void;
}) {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends'>('public');
  const [selectedPreset, setSelectedPreset] = useState('default');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [postMode, setPostMode] = useState<'text' | 'photo' | 'poll'>('text');

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Poll state
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState<string>('24h');

  const preset = POST_STYLE_PRESETS.find((p) => p.id === selectedPreset);
  const hasGradient = preset && preset.id !== 'default' && postMode === 'text';

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10 MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setPostMode('photo');
    setSelectedPreset('default');
  }

  function removeImage() {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setPostMode('text');
  }

  function addPollOption() {
    if (pollOptions.length < 4) setPollOptions([...pollOptions, '']);
  }

  function removePollOption(idx: number) {
    if (pollOptions.length <= 2) return;
    setPollOptions(pollOptions.filter((_, i) => i !== idx));
  }

  async function handlePost() {
    if (posting) return;

    if (postMode === 'poll') {
      if (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2) {
        setError('Poll needs a question and at least 2 options');
        return;
      }
    } else if (!content.trim() && !imageFile) {
      return;
    }

    setPosting(true);
    setError('');
    try {
      if (postMode === 'poll') {
        // Create poll via Supabase directly
        const { createClient } = await import('@/lib/supabase');
        const supabase = createClient();
        const validOptions = pollOptions.filter(o => o.trim());

        // Calculate expiry
        const durationMs: Record<string, number | null> = {
          'none': null, '1h': 3600000, '6h': 21600000, '12h': 43200000,
          '24h': 86400000, '3d': 259200000, '7d': 604800000,
        };
        const ms = durationMs[pollDuration];
        const expiresAt = ms ? new Date(Date.now() + ms).toISOString() : null;

        const { data: pollData, error: pollError } = await supabase
          .from('polls')
          .insert({ user_id: userId, question: pollQuestion.trim(), expires_at: expiresAt })
          .select()
          .single();
        if (pollError) throw pollError;

        // Insert options
        await supabase.from('poll_options').insert(
          validOptions.map((text, i) => ({ poll_id: pollData.id, text: text.trim(), position: i }))
        );

        // Create a feed post linked to the poll
        const data = await createPost({
          userId,
          type: 'text',
          content: `📊 ${pollQuestion.trim()}`,
          visibility,
        });
        onCreated(data);
        onClose();
      } else {
        let imageUrl: string | undefined;
        if (imageFile) {
          setUploading(true);
          imageUrl = await uploadPostMedia(userId, imageFile);
          setUploading(false);
        }

        const data = await createPost({
          userId,
          type: imageFile ? 'photo' : 'text',
          content: content.trim(),
          visibility,
          imageUrl,
          mediaKind: imageFile ? 'photo' : undefined,
          style: hasGradient ? { preset: selectedPreset } : null,
        });
        onCreated(data);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to post');
      setUploading(false);
    }
    setPosting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-bg-secondary border border-border-primary rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-primary sticky top-0 bg-bg-secondary z-10">
          <h3 className="text-lg font-semibold text-text-primary">Create Post</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post type tabs */}
        <div className="flex gap-1 px-5 pt-4">
          <button
            onClick={() => { setPostMode('text'); removeImage(); }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              postMode === 'text' ? 'bg-accent-primary/15 text-accent-primary' : 'text-text-muted hover:text-text-primary'
            )}
          >
            <FileText className="w-3.5 h-3.5" /> Text
          </button>
          <button
            onClick={() => setPostMode('photo')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              postMode === 'photo' ? 'bg-accent-primary/15 text-accent-primary' : 'text-text-muted hover:text-text-primary'
            )}
          >
            <Image className="w-3.5 h-3.5" /> Photo
          </button>
          <button
            onClick={() => setPostMode('poll')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              postMode === 'poll' ? 'bg-accent-primary/15 text-accent-primary' : 'text-text-muted hover:text-text-primary'
            )}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Poll
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-4">
          {postMode !== 'poll' && (
            <>
              {/* Preview area */}
              <div
                className="rounded-xl p-4 min-h-[120px] border border-border-primary"
                style={hasGradient ? { background: `linear-gradient(135deg, ${preset!.gradient[0]}, ${preset!.gradient[1]})` } : { background: 'var(--bg-card, #1E2640)' }}
              >
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your cosmic mind?"
                  maxLength={2000}
                  rows={4}
                  className="w-full bg-transparent border-none outline-none resize-none text-sm placeholder:text-white/40"
                  style={hasGradient ? { color: preset!.textColor } : { color: '#FFFFFF' }}
                />
              </div>
              <p className="text-xs text-text-muted text-right">{content.length}/2000</p>

              {/* Image preview */}
              {imagePreview && (
                <div className="relative rounded-xl overflow-hidden border border-border-primary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="w-full max-h-[240px] object-cover" />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Image upload button (for photo mode or as attachment) */}
              {!imagePreview && postMode === 'photo' && (
                <label className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-border-primary rounded-xl cursor-pointer hover:border-accent-primary/50 transition-colors">
                  <Image className="w-8 h-8 text-text-muted" />
                  <span className="text-sm text-text-muted">Click to upload an image</span>
                  <span className="text-xs text-text-muted">JPG, PNG, GIF, WebP up to 10 MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
              )}

              {/* Attachment bar (for text mode) */}
              {postMode === 'text' && !imagePreview && (
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-accent-primary hover:bg-accent-muted cursor-pointer transition-colors">
                    <Image className="w-4 h-4" /> Add Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </label>
                </div>
              )}

              {/* Style presets (text only, no image) */}
              {postMode === 'text' && !imagePreview && (
                <div>
                  <p className="text-xs text-text-muted font-medium mb-2">Background Style</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {POST_STYLE_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPreset(p.id)}
                        className={cn(
                          'w-8 h-8 rounded-lg border-2 flex-shrink-0 transition-all',
                          selectedPreset === p.id ? 'border-accent-primary scale-110' : 'border-border-primary'
                        )}
                        style={
                          p.id === 'default'
                            ? { background: '#1E2640' }
                            : { background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})` }
                        }
                        title={p.label}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Poll creation form */}
          {postMode === 'poll' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted font-medium block mb-1.5">Question</label>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Ask something cosmic..."
                  maxLength={300}
                  className="input"
                />
                <p className="text-xs text-text-muted text-right mt-1">{pollQuestion.length}/300</p>
              </div>

              <div>
                <label className="text-xs text-text-muted font-medium block mb-1.5">Options</label>
                <div className="space-y-2">
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const next = [...pollOptions];
                          next[i] = e.target.value;
                          setPollOptions(next);
                        }}
                        placeholder={`Option ${i + 1}`}
                        maxLength={100}
                        className="input flex-1"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          onClick={() => removePollOption(i)}
                          className="p-2 text-text-muted hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {pollOptions.length < 4 && (
                  <button
                    onClick={addPollOption}
                    className="mt-2 text-xs text-accent-primary hover:text-accent-secondary transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add option
                  </button>
                )}
              </div>

              <div>
                <label className="text-xs text-text-muted font-medium block mb-1.5">Duration</label>
                <select
                  value={pollDuration}
                  onChange={(e) => setPollDuration(e.target.value)}
                  className="input"
                >
                  <option value="none">No limit</option>
                  <option value="1h">1 hour</option>
                  <option value="6h">6 hours</option>
                  <option value="12h">12 hours</option>
                  <option value="24h">24 hours</option>
                  <option value="3d">3 days</option>
                  <option value="7d">7 days</option>
                </select>
              </div>
            </div>
          )}

          {/* Visibility */}
          <div className="flex items-center gap-3">
            <p className="text-xs text-text-muted font-medium">Visibility:</p>
            <button
              onClick={() => setVisibility('public')}
              className={cn(
                'flex items-center gap-1 px-3 py-1 rounded-full text-xs border transition-colors',
                visibility === 'public' ? 'border-accent-primary bg-accent-muted text-accent-primary' : 'border-border-primary text-text-muted'
              )}
            >
              <Globe className="w-3 h-3" /> Public
            </button>
            <button
              onClick={() => setVisibility('friends')}
              className={cn(
                'flex items-center gap-1 px-3 py-1 rounded-full text-xs border transition-colors',
                visibility === 'friends' ? 'border-accent-primary bg-accent-muted text-accent-primary' : 'border-border-primary text-text-muted'
              )}
            >
              <Users className="w-3 h-3" /> Friends
            </button>
          </div>

          {error && <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border-primary sticky bottom-0 bg-bg-secondary">
          <button
            onClick={handlePost}
            disabled={
              posting || uploading ||
              (postMode === 'poll' ? (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2) :
               (!content.trim() && !imageFile))
            }
            className="btn-primary w-full"
          >
            {uploading ? 'Uploading image...' : posting ? 'Posting...' : postMode === 'poll' ? 'Create Poll' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Feed Page ─────────────────────────────────────────────────

export default function FeedPage() {
  const { user } = useAuthStore();
  const userId = user?.id || '';
  const userName = user?.user_metadata?.name || 'Stargazer';

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const loadFeed = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [data, bookmarks] = await Promise.all([
        getFeed(userId),
        getUserBookmarks(userId),
      ]);
      setPosts(data);
      setBookmarkedIds(bookmarks);
      setHasMore(data.length >= 30);
    } catch { /* ignore */ }
    setLoading(false);
  }, [userId]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  async function loadMore() {
    if (loadingMore || !hasMore || posts.length === 0) return;
    setLoadingMore(true);
    const lastPost = posts[posts.length - 1];
    const more = await getFeed(userId, lastPost.createdAt);
    setPosts((prev) => [...prev, ...more]);
    setHasMore(more.length >= 30);
    setLoadingMore(false);
  }

  async function handleReaction(postId: string, emoji: ReactionEmoji) {
    const updated = await toggleReaction(postId, userId, emoji);
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, reactions: updated } : p));
  }

  function handlePostCreated(rawPost: any) {
    const profile = rawPost.profile || {};
    const newPost: FeedPost = {
      id: rawPost.id,
      userId: rawPost.user_id,
      userName: profile.display_name || userName,
      userAvatar: profile.avatar_url || undefined,
      type: rawPost.type,
      content: rawPost.content || '',
      imageUrl: rawPost.image_url || undefined,
      mediaKind: rawPost.media_kind || undefined,
      videoUrl: rawPost.video_url || undefined,
      reactions: [],
      comments: [],
      commentCount: 0,
      createdAt: rawPost.created_at,
      visibility: rawPost.visibility,
      style: rawPost.style || null,
    };
    setPosts((prev) => [newPost, ...prev]);
  }

  async function handleDelete(postId: string) {
    await deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  async function handleBookmark(postId: string) {
    const result = await toggleBookmark(postId, userId);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (result) next.add(postId);
      else next.delete(postId);
      return next;
    });
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display font-bold text-text-primary">Cosmic Feed</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Cosmic Weather Banner */}
      <div className="bg-gradient-cosmic rounded-2xl p-4 mb-6 border border-accent-muted flex items-center gap-4">
        <span className="text-3xl">🌙</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">Waning Gibbous in Scorpio</p>
          <p className="text-xs text-text-tertiary">Mercury retrograde until May 25 · Venus trine Jupiter today</p>
        </div>
      </div>

      {/* Trending Tags */}
      <div className="flex gap-2 overflow-x-auto mb-6 scrollbar-hide">
        {['#FullMoon', '#MercuryRetrograde', '#TaurusSeason', '#CosmicShift', '#Astrology'].map((tag) => (
          <span
            key={tag}
            className="px-3 py-1.5 rounded-full bg-bg-card border border-border-primary text-xs text-text-secondary whitespace-nowrap"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Feed */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-bg-tertiary" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-bg-tertiary rounded w-24" />
                  <div className="h-2 bg-bg-tertiary rounded w-16" />
                </div>
              </div>
              <div className="h-4 bg-bg-tertiary rounded w-full mb-2" />
              <div className="h-4 bg-bg-tertiary rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="card text-center py-16">
          <span className="text-5xl block mb-4">✨</span>
          <h2 className="text-lg font-semibold text-text-primary mb-2">Your cosmic feed awaits</h2>
          <p className="text-sm text-text-tertiary mb-6">Share readings, charts, and cosmic insights with the community.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            Create Your First Post
          </button>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <FeedCard
            key={post.id}
            post={post}
            currentUserId={userId}
            onReaction={handleReaction}
            onComment={setCommentPostId}
            onDelete={handleDelete}
            isBookmarked={bookmarkedIds.has(post.id)}
            onBookmark={handleBookmark}
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && posts.length > 0 && (
        <div className="text-center py-8">
          <button onClick={loadMore} disabled={loadingMore} className="btn-secondary text-sm">
            {loadingMore ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreate && (
        <CreatePostModal
          userId={userId}
          userName={userName}
          onClose={() => setShowCreate(false)}
          onCreated={handlePostCreated}
        />
      )}

      {/* Comment Sheet */}
      {commentPostId && (
        <CommentSheet
          postId={commentPostId}
          userId={userId}
          onClose={() => setCommentPostId(null)}
        />
      )}
    </div>
  );
}
