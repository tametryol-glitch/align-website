'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useGettingStarted } from '@/hooks/useGettingStarted';
import {
  getFeed, createPost, uploadPostMedia, toggleReaction, deletePost, editPost, repostPost, toggleBookmark, getUserBookmarks,
  type FeedPost, type ReactionEmoji,
  POST_STYLE_PRESETS,
} from '@/lib/feedService';
import { FeedCard } from '@/components/feed/FeedCard';
import { CommentSheet } from '@/components/feed/CommentSheet';
import { X, Plus, Globe, Users, Image as ImageIcon, BarChart3, FileText, Video, Sparkles, BookOpen, MessagesSquare, Hash, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { getTrendingHashtags, getPostIdsByHashtag, indexPostHashtags } from '@/lib/hashtagService';

// ── Dynamic Cosmic Helpers ────────────────────────────────────────

function getFeedMoonPhase() {
  const synodic = 29.530588853;
  const known_new = new Date('2024-01-11').getTime();
  const diff = (Date.now() - known_new) / 86400000;
  const phase = ((diff % synodic) + synodic) % synodic;
  if (phase < 1.85) return { emoji: '🌑', name: 'New Moon' };
  if (phase < 7.38) return { emoji: '🌒', name: 'Waxing Crescent' };
  if (phase < 11.07) return { emoji: '🌓', name: 'First Quarter' };
  if (phase < 14.76) return { emoji: '🌔', name: 'Waxing Gibbous' };
  if (phase < 16.61) return { emoji: '🌕', name: 'Full Moon' };
  if (phase < 22.14) return { emoji: '🌖', name: 'Waning Gibbous' };
  if (phase < 25.83) return { emoji: '🌗', name: 'Last Quarter' };
  return { emoji: '🌘', name: 'Waning Crescent' };
}

function getFeedSunSign(): string {
  const m = new Date().getMonth(), d = new Date().getDate();
  const signs = ['Capricorn','Aquarius','Pisces','Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius'];
  const cutoffs = [20,19,20,20,21,21,22,23,23,23,22,22];
  return d < cutoffs[m] ? signs[m] : signs[(m + 1) % 12];
}

function FeedCosmicBanner() {
  const moon = getFeedMoonPhase();
  const sign = getFeedSunSign();
  return (
    <div className="bg-gradient-cosmic rounded-2xl p-4 mb-6 border border-accent-muted flex items-center gap-4">
      <span className="text-3xl">{moon.emoji}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">{moon.name} · {sign} Season</p>
        <p className="text-xs text-text-tertiary">Sun in {sign} · Check your transits for personalized insights</p>
      </div>
    </div>
  );
}

function getDynamicTags(): string[] {
  const sign = getFeedSunSign();
  const moon = getFeedMoonPhase();
  const tags = [`#${sign}Season`, `#${moon.name.replace(' ', '')}`, '#Astrology', '#CosmicShift', '#Transits'];
  return tags;
}

// FeedCard and CommentSheet imported from @/components/feed/

// ── Share Your Reading CTA ────────────────────────────────────────

const QUICK_TEMPLATES = [
  { id: 'aura', emoji: '🔮', chip: 'Aura Reading', labelKey: 'feed.shareReading.templates.aura' },
  { id: 'transit', emoji: '🪐', chip: 'Transit', labelKey: 'feed.shareReading.templates.transit' },
  { id: 'moon', emoji: '🌙', chip: 'Moon Check-in', labelKey: 'feed.shareReading.templates.moon' },
  { id: 'zodiac', emoji: '♏', chip: 'Zodiac', labelKey: 'feed.shareReading.templates.zodiac' },
  { id: 'tarot', emoji: '🃏', chip: 'Tarot', labelKey: 'feed.shareReading.templates.tarot' },
];

function ShareReadingCTA({
  sunSign,
  onQuickPost,
}: {
  sunSign: string | null;
  onQuickPost: (content: string) => void;
}) {
  const { t } = useTranslation();
  const moon = getFeedMoonPhase();

  function handleTemplate(tpl: typeof QUICK_TEMPLATES[number]) {
    let text = t(tpl.labelKey, { moonPhase: moon.name, sign: sunSign || 'Scorpio' });
    onQuickPost(text);
  }

  return (
    <div className="card rounded-2xl p-5 mb-6 border border-accent-primary/20 bg-gradient-to-br from-bg-card to-accent-primary/5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-accent-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-text-primary">{t('feed.shareReading.title')}</h3>
          <p className="text-xs text-text-secondary">{t('feed.shareReading.subtitle')}</p>
        </div>
      </div>

      {/* Quick-post template chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {QUICK_TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => handleTemplate(tpl)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-tertiary border border-border-primary text-xs text-text-secondary hover:border-accent-primary/40 hover:text-text-primary transition-colors"
          >
            <span>{tpl.emoji}</span>
            <span className="whitespace-nowrap">{tpl.chip}</span>
          </button>
        ))}
      </div>

      {/* Quick links */}
      <div className="flex items-center gap-3">
        <Link
          href="/readings"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-primary/15 text-accent-primary hover:bg-accent-primary/25 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          {t('feed.shareReading.viewReadings')}
        </Link>
        <Link
          href="/communities"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-tertiary text-text-muted hover:text-text-primary hover:bg-bg-tertiary/80 transition-colors"
        >
          <MessagesSquare className="w-3.5 h-3.5" />
          {t('feed.shareReading.viewCommunities')}
        </Link>
      </div>
    </div>
  );
}

// ── Create Post Modal ──────────────────────────────────────────────

function CreatePostModal({
  userId,
  userName,
  userAvatar,
  initialContent = '',
  onClose,
  onCreated,
}: {
  userId: string;
  userName: string;
  userAvatar?: string | null;
  initialContent?: string;
  onClose: () => void;
  onCreated: (post: any) => void;
}) {
  const { t } = useTranslation();
  const [content, setContent] = useState(initialContent);
  const [visibility, setVisibility] = useState<'public' | 'friends'>('public');
  const [selectedPreset, setSelectedPreset] = useState('default');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [postMode, setPostMode] = useState<'text' | 'photo' | 'video' | 'poll'>('text');

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

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

  function clearImage() {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  }

  function removeImage() {
    clearImage();
    setPostMode('text');
  }

  function clearVideo() {
    setVideoFile(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
  }

  function removeVideo() {
    clearVideo();
    setPostMode('text');
  }

  function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200 * 1024 * 1024) {
      setError('Video must be under 200 MB');
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setPostMode('video');
    clearImage();
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
    } else if (!content.trim() && !imageFile && !videoFile) {
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
        let videoUrl: string | undefined;
        setUploading(true);
        if (imageFile) {
          imageUrl = await uploadPostMedia(userId, imageFile);
        }
        if (videoFile) {
          videoUrl = await uploadPostMedia(userId, videoFile);
        }
        setUploading(false);

        const postType = videoFile ? 'video' : imageFile ? 'photo' : 'text';
        const data = await createPost({
          userId,
          type: postType,
          content: content.trim(),
          visibility,
          imageUrl,
          mediaKind: imageFile ? 'photo' : undefined,
          videoUrl,
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
          <h3 className="text-lg font-semibold text-text-primary">{t('feed.createPost')}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-2">
          <div className="w-9 h-9 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
            {userAvatar ? (
              <Image src={userAvatar} alt="User avatar" width={36} height={36} className="w-full h-full rounded-full object-cover" unoptimized />
            ) : (
              <span className="text-sm font-bold text-accent-primary">{userName[0]?.toUpperCase()}</span>
            )}
          </div>
          <span className="text-sm font-medium text-text-primary">{userName}</span>
        </div>

        {/* Post type tabs */}
        <div className="flex gap-1 px-5 pt-2">
          <button
            onClick={() => { setPostMode('text'); clearImage(); clearVideo(); }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              postMode === 'text' ? 'bg-accent-primary/15 text-accent-primary' : 'text-text-muted hover:text-text-primary'
            )}
          >
            <FileText className="w-3.5 h-3.5" /> {t('feed.postTypes.text')}
          </button>
          <button
            onClick={() => { setPostMode('photo'); clearVideo(); }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              postMode === 'photo' ? 'bg-accent-primary/15 text-accent-primary' : 'text-text-muted hover:text-text-primary'
            )}
          >
            <ImageIcon className="w-3.5 h-3.5" /> {t('feed.postTypes.photo')}
          </button>
          <button
            onClick={() => { setPostMode('video'); clearImage(); }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              postMode === 'video' ? 'bg-accent-primary/15 text-accent-primary' : 'text-text-muted hover:text-text-primary'
            )}
          >
            <Video className="w-3.5 h-3.5" /> {t('feed.postTypes.video')}
          </button>
          <button
            onClick={() => setPostMode('poll')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              postMode === 'poll' ? 'bg-accent-primary/15 text-accent-primary' : 'text-text-muted hover:text-text-primary'
            )}
          >
            <BarChart3 className="w-3.5 h-3.5" /> {t('feed.postTypes.poll')}
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
                  placeholder={t('feed.composer.placeholder')}
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
                  <Image src={imagePreview} alt="Image preview" width={400} height={240} className="w-full max-h-[240px] object-cover" unoptimized />
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
                  <ImageIcon className="w-8 h-8 text-text-muted" />
                  <span className="text-sm text-text-muted">{t('feed.composer.uploadImage')}</span>
                  <span className="text-xs text-text-muted">JPG, PNG, GIF, WebP up to 10 MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
              )}

              {/* Video preview */}
              {videoPreview && (
                <div className="relative rounded-xl overflow-hidden border border-border-primary">
                  <video src={videoPreview} controls className="w-full max-h-[240px]" />
                  <button
                    onClick={removeVideo}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Video upload button (for video mode) */}
              {!videoPreview && postMode === 'video' && (
                <label className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-border-primary rounded-xl cursor-pointer hover:border-accent-primary/50 transition-colors">
                  <Video className="w-8 h-8 text-text-muted" />
                  <span className="text-sm text-text-muted">{t('feed.composer.uploadVideo')}</span>
                  <span className="text-xs text-text-muted">MP4, MOV, WebM up to 200 MB</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoSelect}
                  />
                </label>
              )}

              {/* Attachment bar (for text mode) */}
              {postMode === 'text' && !imagePreview && !videoPreview && (
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-accent-primary hover:bg-accent-muted cursor-pointer transition-colors">
                    <ImageIcon className="w-4 h-4" /> {t('feed.composer.addImage')}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </label>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-accent-primary hover:bg-accent-muted cursor-pointer transition-colors">
                    <Video className="w-4 h-4" /> {t('feed.composer.addVideo')}
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoSelect}
                    />
                  </label>
                </div>
              )}

              {/* Style presets (text only, no image/video) */}
              {postMode === 'text' && !imagePreview && !videoPreview && (
                <div>
                  <p className="text-xs text-text-muted font-medium mb-2">{t('feed.composer.backgroundStyle')}</p>
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
                <label className="text-xs text-text-muted font-medium block mb-1.5">{t('feed.poll.question')}</label>
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
            <p className="text-xs text-text-muted font-medium">{t('feed.composer.visibility')}</p>
            <button
              onClick={() => setVisibility('public')}
              className={cn(
                'flex items-center gap-1 px-3 py-1 rounded-full text-xs border transition-colors',
                visibility === 'public' ? 'border-accent-primary bg-accent-muted text-accent-primary' : 'border-border-primary text-text-muted'
              )}
            >
              <Globe className="w-3 h-3" /> {t('feed.composer.visibilityPublic')}
            </button>
            <button
              onClick={() => setVisibility('friends')}
              className={cn(
                'flex items-center gap-1 px-3 py-1 rounded-full text-xs border transition-colors',
                visibility === 'friends' ? 'border-accent-primary bg-accent-muted text-accent-primary' : 'border-border-primary text-text-muted'
              )}
            >
              <Users className="w-3 h-3" /> {t('feed.composer.visibilityFriends')}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border-primary sticky bottom-0 bg-bg-secondary space-y-3">
          {error && <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}
          <button
            onClick={handlePost}
            disabled={
              posting || uploading ||
              (postMode === 'poll' ? (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2) :
               (!content.trim() && !imageFile && !videoFile))
            }
            className="btn-primary w-full"
          >
            {uploading ? (videoFile ? t('feed.composer.uploadingVideo') : t('feed.composer.uploadingImage')) : posting ? t('feed.composer.posting') : postMode === 'poll' ? t('feed.poll.createPoll') : t('feed.composer.postButton')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Feed Page ─────────────────────────────────────────────────

export default function FeedPage() {
  const { t } = useTranslation();
  const { user, profile } = useAuthStore();
  const { markComplete } = useGettingStarted();
  useEffect(() => { markComplete('share_feed'); }, [markComplete]);
  const userId = user?.id || '';
  const userName = profile?.display_name || user?.user_metadata?.name || 'Stargazer';
  const userAvatar = profile?.avatar_url || null;

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [prefillContent, setPrefillContent] = useState('');
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [editingPost, setEditingPost] = useState<{ id: string; content: string } | null>(null);
  const [editText, setEditText] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [trendingHashtags, setTrendingHashtags] = useState<{ tag: string; count: number }[]>([]);
  const [activeHashtagFilter, setActiveHashtagFilter] = useState<string | null>(null);

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

      // Index hashtags from loaded posts & load trending
      data.forEach(p => { if (p.content) indexPostHashtags(p.id, p.content); });
      setTrendingHashtags(getTrendingHashtags(8));
    } catch { /* ignore */ }
    setLoading(false);
  }, [userId]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  async function loadMore() {
    if (loadingMore || !hasMore || posts.length === 0) return;
    setLoadingMore(true);
    try {
      const lastPost = posts[posts.length - 1];
      const more = await getFeed(userId, lastPost.createdAt);
      // Dedupe by id: the cursor pages on created_at only, so posts sharing
      // a timestamp can appear in overlapping pages — don't render them twice.
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...more.filter((p) => !seen.has(p.id))];
      });
      setHasMore(more.length >= 30);
    } catch {
      // Silently stop loading so the UI doesn't get stuck
    } finally {
      setLoadingMore(false);
    }
  }

  const OPTIMISTIC_UPDATES_ENABLED = true;

  async function handleReaction(postId: string, emoji: ReactionEmoji) {
    if (OPTIMISTIC_UPDATES_ENABLED) {
      // Snapshot the current reactions for this post in case we need to revert
      const previousPosts = posts;

      // Optimistic: toggle the reaction in local state immediately
      setPosts((prev) => prev.map((p) => {
        if (p.id !== postId) return p;
        const existing = p.reactions.find(r => r.emoji === emoji);
        let nextReactions: typeof p.reactions;
        if (existing && existing.userReacted) {
          // User is un-reacting — decrement count or remove
          nextReactions = p.reactions
            .map(r => r.emoji === emoji ? { ...r, count: r.count - 1, userReacted: false } : r)
            .filter(r => r.count > 0);
        } else {
          // User is reacting — remove any previous user reaction, then add this one
          nextReactions = p.reactions
            .map(r => r.userReacted ? { ...r, count: r.count - 1, userReacted: false } : r)
            .filter(r => r.count > 0);
          const target = nextReactions.find(r => r.emoji === emoji);
          if (target) {
            nextReactions = nextReactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, userReacted: true } : r);
          } else {
            nextReactions = [...nextReactions, { emoji, count: 1, userReacted: true }];
          }
        }
        return { ...p, reactions: nextReactions };
      }));

      // Fire DB call in background — reconcile or revert
      toggleReaction(postId, userId, emoji).then((serverReactions) => {
        setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, reactions: serverReactions } : p));
      }).catch(() => {
        // Revert to the snapshot on error
        setPosts(previousPosts);
      });
      return;
    }

    // Original behavior (with await)
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
    // Index hashtags from the new post
    if (newPost.content) {
      indexPostHashtags(newPost.id, newPost.content);
      setTrendingHashtags(getTrendingHashtags(8));
    }
  }

  async function handleDelete(postId: string) {
    const result = await deletePost(postId);
    if (result.success) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
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

  async function handleRepost(post: FeedPost) {
    try {
      const rawPost = await repostPost(userId, post);
      const p = rawPost.profile || {};
      const newPost: FeedPost = {
        id: rawPost.id,
        userId: rawPost.user_id,
        userName: p.display_name || userName,
        userAvatar: p.avatar_url || undefined,
        type: rawPost.type,
        content: rawPost.content || '',
        imageUrl: rawPost.image_url || undefined,
        videoUrl: rawPost.video_url || undefined,
        reactions: [],
        comments: [],
        commentCount: 0,
        createdAt: rawPost.created_at,
        visibility: rawPost.visibility,
        originalPostId: rawPost.original_post_id || undefined,
        originalUserName: rawPost.original_user_name || undefined,
        style: rawPost.style || null,
      };
      setPosts((prev) => [newPost, ...prev]);
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

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display font-bold text-text-primary">{t('feed.title')}</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Cosmic Weather Banner */}
      <FeedCosmicBanner />

      {/* Share Your Reading CTA */}
      <ShareReadingCTA
        sunSign={profile?.sun_sign || null}
        onQuickPost={(content) => {
          setPrefillContent(content);
          setShowCreate(true);
        }}
      />

      {/* Trending Hashtags */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-accent-primary" />
          <h3 className="text-sm font-semibold text-text-primary">{t('feed.trending.title', 'Trending')}</h3>
          {activeHashtagFilter && (
            <button
              onClick={() => setActiveHashtagFilter(null)}
              className="ml-auto text-xs text-accent-primary hover:text-accent-secondary transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" /> {t('feed.trending.clearFilter', 'Clear filter')}
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {(trendingHashtags.length > 0 ? trendingHashtags : getDynamicTags().map(tag => ({ tag, count: 0 }))).map((item) => {
            const tag = typeof item === 'string' ? item : item.tag;
            const count = typeof item === 'string' ? 0 : item.count;
            const isActive = activeHashtagFilter === tag;
            return (
              <button
                key={tag}
                onClick={() => setActiveHashtagFilter(isActive ? null : tag)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors',
                  isActive
                    ? 'border-accent-primary bg-accent-muted text-accent-primary'
                    : 'border-border-primary bg-bg-card text-text-secondary hover:border-accent-primary/40 hover:text-text-primary'
                )}
              >
                <Hash className="w-3 h-3" />
                <span>{tag.replace(/^#/, '')}</span>
                {count > 0 && (
                  <span className="text-[10px] text-text-muted">{count}</span>
                )}
              </button>
            );
          })}
        </div>
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
          <h2 className="text-lg font-semibold text-text-primary mb-2">{t('feed.empty.title')}</h2>
          <p className="text-sm text-text-tertiary mb-6">{t('feed.empty.description')}</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            {t('feed.empty.createFirst')}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {(() => {
          const filteredPosts = activeHashtagFilter
            ? (() => {
                const matchingIds = new Set(getPostIdsByHashtag(activeHashtagFilter));
                const normalizedTag = activeHashtagFilter.startsWith('#')
                  ? activeHashtagFilter.toLowerCase()
                  : `#${activeHashtagFilter.toLowerCase()}`;
                return posts.filter(p =>
                  matchingIds.has(p.id) || p.content.toLowerCase().includes(normalizedTag)
                );
              })()
            : posts;

          if (filteredPosts.length === 0 && activeHashtagFilter) {
            return (
              <div className="card text-center py-12">
                <Hash className="w-8 h-8 text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-secondary mb-1">
                  {t('feed.trending.noResults', 'No posts found for {{tag}}', { tag: activeHashtagFilter })}
                </p>
                <button
                  onClick={() => setActiveHashtagFilter(null)}
                  className="text-xs text-accent-primary hover:text-accent-secondary mt-2"
                >
                  {t('feed.trending.clearFilter', 'Clear filter')}
                </button>
              </div>
            );
          }

          return filteredPosts.map((post) => (
            <FeedCard
              key={post.id}
              post={post}
              currentUserId={userId}
              onReaction={handleReaction}
              onComment={setCommentPostId}
              onDelete={handleDelete}
              onEdit={handleStartEdit}
              onRepost={handleRepost}
              isBookmarked={bookmarkedIds.has(post.id)}
              onBookmark={handleBookmark}
            />
          ));
        })()}
      </div>

      {/* Load more */}
      {hasMore && posts.length > 0 && (
        <div className="text-center py-8">
          <button onClick={loadMore} disabled={loadingMore} className="btn-secondary text-sm">
            {loadingMore ? t('feed.loading') : t('feed.loadMore')}
          </button>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreate && (
        <CreatePostModal
          userId={userId}
          userName={userName}
          userAvatar={userAvatar}
          initialContent={prefillContent}
          onClose={() => { setShowCreate(false); setPrefillContent(''); }}
          onCreated={handlePostCreated}
        />
      )}

      {/* Comment Sheet */}
      {commentPostId && (() => {
        const commentPost = posts.find(p => p.id === commentPostId);
        return (
          <CommentSheet
            postId={commentPostId}
            postOwnerId={commentPost?.userId || ''}
            userId={userId}
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
              <h3 className="text-lg font-semibold text-text-primary">{t('feed.composer.editPost')}</h3>
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
