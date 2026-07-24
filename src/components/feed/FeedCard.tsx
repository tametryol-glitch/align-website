'use client';

import { useCallback, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  type FeedPost, type ReactionEmoji, type PostReaction,
  REACTION_OPTIONS, POST_STYLE_PRESETS, reportPost, recordPostVideoView,
} from '@/lib/feedService';
import { MessageCircle, Bookmark, MoreHorizontal, Trash2, Share2, Repeat2, Flag, Ban, Pencil, Globe, Users, Download, Loader2 } from 'lucide-react';
import { downloadVideo } from '@/lib/videoDownloadService';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { isPlatformAdmin } from '@/lib/admin';
import { getCreatorBadge, getCreatorTier, type CreatorTier } from '@/lib/creatorScoreEngine';
import { predictViralScore, getViralTier, type ContentMetrics } from '@/lib/contentViralityEngine';
import { renderRichText, clampCutOutsideMention } from '@/lib/mentions';

// ── Feature flags (web has no central featureFlags config) ─────────
const CREATOR_SCORE_ENABLED = true;
const CONTENT_VIRALITY_ENABLED = true;

// ── Video view tracking ─────────────────────────────────────────────
// One recorded view per post per page session; the DB upsert dedupes
// per user across sessions (post_video_views PK is post_id+user_id).
const recordedVideoViewPosts = new Set<string>();

function formatViewCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

// ── Creator Score Estimate (lightweight from post data) ───────────
function estimateCreatorTierFromPost(post: FeedPost): CreatorTier {
  const likes = post.reactions.reduce((sum, r) => sum + r.count, 0);
  const comments = post.commentCount || post.comments.length;
  const engagement = Math.min(100, (likes * 3) + (comments * 5));
  return getCreatorTier(engagement);
}

// ── Virality Indicator ────────────────────────────────────────────
function getViralityIndicatorFromPost(post: FeedPost): { label: string; emoji: string } | null {
  const metrics: ContentMetrics = {
    id: post.id,
    created_at: post.createdAt,
    content_type: post.videoUrl ? 'video' : post.imageUrl ? 'image' : 'text',
    likes_count: post.reactions.reduce((sum, r) => sum + r.count, 0),
    comments_count: post.commentCount || post.comments.length,
    impressions_count: Math.max(post.reactions.reduce((sum, r) => sum + r.count, 0) * 10, 1),
    caption: post.content || '',
    creator_score: 50,
    follower_count: 100,
  };
  const score = predictViralScore(metrics);
  const tier = getViralTier(score);
  if (tier === 'supernova') return { label: 'Supernova', emoji: '\u{1F4A5}' };
  if (tier === 'viral') return { label: 'Trending', emoji: '\u{1F525}' };
  if (tier === 'rising') return { label: 'Rising', emoji: '⚡' };
  return null;
}

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
  cosmic_match: { label: 'Cosmic Match', color: 'bg-accent-muted text-accent-primary' },
};

// ── Read-more folding ─────────────────────────────────────────────
// Long posts collapse TikTok/Facebook-style so the feed stays scannable.
// The first fold shows ~3 sentences; very long posts get one more fold
// before the full text is revealed.
const FOLD_1_SENTENCES = 3;
const FOLD_1_CHAR_CAP = 300;
const FOLD_2_CHAR_CAP = 1100;
const MIN_HIDDEN_CHARS = 120;

// Index just past the Nth sentence end — punctuation followed by
// whitespace, or a line break. URLs never contain either, so links are
// never split mid-URL.
function sentenceCutIndex(text: string, sentences: number): number {
  const re = /[.!?…]+["')\]]*\s+|\n+/g;
  let count = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    count++;
    if (count >= sentences) return m.index + m[0].length;
  }
  return -1;
}

// Last whitespace at or before `cap` so a cut never lands mid-word.
function wordCutIndex(text: string, cap: number): number {
  if (text.length <= cap) return -1;
  const slice = text.slice(0, cap);
  const cut = Math.max(slice.lastIndexOf(' '), slice.lastIndexOf('\n'));
  return cut > cap * 0.5 ? cut : cap;
}

// Character offsets where each fold ends; empty array = no folding.
function getFoldCuts(text: string): number[] {
  let first = sentenceCutIndex(text, FOLD_1_SENTENCES);
  if (first === -1 || first > FOLD_1_CHAR_CAP) first = wordCutIndex(text, FOLD_1_CHAR_CAP);
  if (first === -1 || text.length - first < MIN_HIDDEN_CHARS) return [];
  const cuts = [first];
  const second = wordCutIndex(text, FOLD_2_CHAR_CAP);
  if (second !== -1 && second > first && text.length - second >= MIN_HIDDEN_CHARS * 2) {
    cuts.push(second);
  }
  return cuts;
}

function ExpandablePostText({ text, className, style }: {
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
  const [stage, setStage] = useState(0);
  const cuts = getFoldCuts(text);
  const folded = stage < cuts.length;
  // Never cut in the middle of "@[Name](id)" — that would leak raw markup.
  const shown = folded ? text.slice(0, clampCutOutsideMention(text, cuts[stage])).trimEnd() : text;
  return (
    <p className={className} style={style}>
      {renderRichText(shown)}
      {folded && (
        <>
          {'… '}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setStage(stage + 1); }}
            className="font-semibold text-text-muted hover:text-text-primary"
          >
            Read more
          </button>
        </>
      )}
      {!folded && cuts.length > 0 && (
        <>
          {' '}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setStage(0); }}
            className="font-semibold text-text-muted hover:text-text-primary"
          >
            Show less
          </button>
        </>
      )}
    </p>
  );
}

const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})(?:\S*)?/gi;

function extractYouTubeId(url: string): string | null {
  const match = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(url);
  return match ? match[1] : null;
}

function extractYouTubeUrls(text: string): string[] {
  return text.match(YOUTUBE_REGEX) || [];
}

function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0 rounded-xl"
      />
    </div>
  );
}

// ── TikTok URL Detection ──────────────────────────────────────────

const TIKTOK_FULL_REGEX = /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/(\d+)(?:\S*)?/gi;
const TIKTOK_SHORT_REGEX = /(?:https?:\/\/)?(?:vm\.tiktok\.com|(?:www\.)?tiktok\.com\/t)\/([\w-]+)\/?(?:\S*)?/gi;
const TIKTOK_ANY_REGEX = /(?:https?:\/\/)?(?:(?:www\.)?tiktok\.com(?:\/@[\w.-]+\/video\/\d+|\/t\/[\w-]+)|vm\.tiktok\.com\/[\w-]+)\/?(?:\S*)?/gi;

interface TikTokMatch { url: string; videoId: string | null; }

function extractTikTokVideoId(url: string): string | null {
  TIKTOK_FULL_REGEX.lastIndex = 0;
  const match = TIKTOK_FULL_REGEX.exec(url);
  return match ? match[1] : null;
}

function containsTikTokUrl(text: string): boolean {
  TIKTOK_ANY_REGEX.lastIndex = 0;
  return TIKTOK_ANY_REGEX.test(text);
}

function extractAllTikTokMatches(text: string): TikTokMatch[] {
  const matches: TikTokMatch[] = [];
  TIKTOK_FULL_REGEX.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TIKTOK_FULL_REGEX.exec(text)) !== null) {
    matches.push({ url: m[0], videoId: m[1] });
  }
  TIKTOK_SHORT_REGEX.lastIndex = 0;
  while ((m = TIKTOK_SHORT_REGEX.exec(text)) !== null) {
    const already = matches.some(e => m![0].includes(e.url) || e.url.includes(m![0]));
    if (!already) matches.push({ url: m[0], videoId: null });
  }
  return matches;
}

function stripTikTokUrls(text: string): string {
  return text.replace(TIKTOK_ANY_REGEX, '').replace(/\s{2,}/g, ' ').trim();
}

function TikTokEmbed({ videoId, url }: { videoId: string | null; url: string }) {
  const fullUrl = url.startsWith('http') ? url : `https://${url}`;

  if (!videoId) {
    return (
      <a
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-xl overflow-hidden bg-black text-center py-12"
        style={{ aspectRatio: '9/16', maxHeight: 400 }}
      >
        <span className="text-xs font-bold text-white bg-black/60 px-2 py-1 rounded">TikTok</span>
        <span className="block text-3xl text-[#FE2C55] mt-4">▶</span>
        <span className="block text-xs text-white/60 mt-2">Tap to watch on TikTok</span>
      </a>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ aspectRatio: '9/16', maxHeight: 500 }}>
      <iframe
        src={`https://www.tiktok.com/embed/v2/${videoId}`}
        title="TikTok video"
        allow="autoplay; encrypted-media"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  );
}

export function isGifOrStickerUrl(text: string): boolean {
  const trimmed = text.trim();
  return (
    trimmed.startsWith('https://media') && trimmed.includes('giphy.com') ||
    /^https?:\/\/\S+\.gif(\?.*)?$/i.test(trimmed)
  );
}

// ── Cosmic Match Body ──────────────────────────────────────────────
// Renders a shared rare-match card: the two tagged people, the overall
// score, and top positive dimensions + "why". Positive-only by design.

function CosmicMatchBody({ post }: { post: FeedPost }) {
  const data: any = post.chartData || {};
  const tagged = post.taggedUsers || [];
  const a = tagged[0];
  const b = tagged[1];

  const dims: Array<{ name: string; score: number }> = Array.isArray(data.dimensions)
    ? data.dimensions.filter((d: any) => typeof d?.score === 'number')
    : [];
  const topDims = [...dims].sort((x, y) => (y.score || 0) - (x.score || 0)).slice(0, 3);
  const why: string[] = Array.isArray(data.why) ? data.why.filter(Boolean).slice(0, 3) : [];
  const overall = typeof data.overall === 'number' ? data.overall : null;

  const Person = ({ u }: { u?: { userId: string; userName: string; userAvatar?: string } }) => (
    <Link href={u ? `/user/${u.userId}` : '#'} className="flex flex-col items-center flex-1 min-w-0">
      <span className="w-14 h-14 rounded-full bg-accent-muted flex items-center justify-center overflow-hidden">
        {u?.userAvatar ? (
          <img src={u.userAvatar} alt="" className="w-14 h-14 rounded-full object-cover" />
        ) : (
          <span className="text-lg font-bold text-accent-primary">{u?.userName?.[0]?.toUpperCase() || '?'}</span>
        )}
      </span>
      <span className="mt-1 text-sm font-semibold truncate max-w-[100px] text-center">{u?.userName || 'Someone'}</span>
    </Link>
  );

  return (
    <div className="mx-5 mb-3 p-4 rounded-xl bg-bg-tertiary border border-accent-primary/40">
      <p className="text-xs font-bold text-accent-primary mb-3">💫 Cosmic Matches</p>

      <div className="flex items-center justify-between">
        <Person u={a} />
        <div className="flex flex-col items-center px-3">
          {overall !== null
            ? <span className="text-3xl font-extrabold text-accent-primary">{overall}%</span>
            : <span className="text-2xl">💞</span>}
          <span className="text-[10px] uppercase tracking-wider text-text-muted">match</span>
        </div>
        <Person u={b} />
      </div>

      {data.band && <p className="text-sm text-text-secondary italic text-center mt-3">{data.band}</p>}

      {topDims.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 mt-3">
          {topDims.map((d) => (
            <span key={d.name} className="flex items-center gap-1 bg-bg-secondary rounded-md py-1 px-2">
              <span className="text-xs text-text-secondary">{d.name}</span>
              <span className="text-xs font-bold text-accent-primary">{d.score}%</span>
            </span>
          ))}
        </div>
      )}

      {why.length > 0 && (
        <div className="mt-3 space-y-0.5">
          {why.map((w, i) => (
            <p key={i} className="text-xs text-text-secondary leading-snug">✨ {w}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ── FeedCard ───────────────────────────────────────────────────────

export function FeedCard({
  post,
  currentUserId,
  onReaction,
  onComment,
  onDelete,
  onEdit,
  onRepost,
  isBookmarked,
  onBookmark,
}: {
  post: FeedPost;
  currentUserId: string;
  onReaction: (postId: string, emoji: ReactionEmoji) => void;
  onComment: (postId: string) => void;
  onDelete: (postId: string) => void;
  onEdit: (postId: string, currentContent: string) => void;
  onRepost: (post: FeedPost) => void;
  isBookmarked: boolean;
  onBookmark: (postId: string) => void;
}) {
  const { t } = useTranslation();
  const [showReactions, setShowReactions] = useState(false);
  const [downloading, setDownloading] = useState(false);
  // Doubles as progress text while a cold variant encodes, then as the error
  // if it fails. Null = show the plain "Save video" label.
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Saves the branded copy (clip + Align outro). The first download of a given
  // video waits on the encode; later ones are instant.
  const handleDownload = useCallback(async () => {
    if (downloading || !post.videoUrl) return;
    setDownloading(true);
    setDownloadNotice(null);
    try {
      const result = await downloadVideo('post', post.id, post.videoUrl, setDownloadNotice);
      setDownloadNotice(result.saved ? null : result.error || 'Could not save.');
    } finally {
      setDownloading(false);
    }
  }, [downloading, post.id, post.videoUrl]);

  const downloadLabel = downloadNotice || 'Save video';
  const [showMenu, setShowMenu] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [reported, setReported] = useState(false);
  const isOwner = post.userId === currentUserId;
  const { profile } = useAuthStore();
  // Founder/platform admin: can delete any post (moderation). DB RLS enforces
  // the actual permission; this only shows the action.
  const canModerate = isPlatformAdmin(profile?.email);

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
        <Link href={`/user/${post.userId}`} className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
          {post.userAvatar ? (
            <img src={post.userAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-accent-primary">
              {post.userName[0]?.toUpperCase()}
            </span>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link href={`/user/${post.userId}`} className="font-semibold text-sm hover:underline" style={textColor ? { color: textColor } : undefined}>
              {post.userName}
            </Link>
            {CREATOR_SCORE_ENABLED && (() => {
              const tier = estimateCreatorTierFromPost(post);
              if (tier === 'newcomer') return null;
              const badge = getCreatorBadge(tier);
              return <span className="ml-1 text-xs" title={badge.label}>{badge.emoji}</span>;
            })()}
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
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-text-muted hover:text-text-primary">
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-bg-elevated border border-border-primary rounded-xl shadow-lg z-20 py-1 min-w-[160px]">
              {isOwner ? (
                <>
                  <button
                    onClick={() => { onEdit(post.id, post.content); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4" /> {t('components.feedCard.editPost')}
                  </button>
                  <button
                    onClick={() => { onDelete(post.id); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-bg-tertiary flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> {t('components.feedCard.deletePost')}
                  </button>
                </>
              ) : (
                <>
                  {canModerate && (
                    <button
                      onClick={() => { onDelete(post.id); setShowMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-bg-tertiary flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> {t('components.feedCard.deletePost')}
                    </button>
                  )}
                  <button
                    onClick={() => { setShowMenu(false); setShowReportMenu(true); }}
                    className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary flex items-center gap-2"
                  >
                    <Flag className="w-4 h-4" /> {t('components.feedCard.report')}
                  </button>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-bg-tertiary flex items-center gap-2"
                  >
                    <Ban className="w-4 h-4" /> {t('friends.actions.blockUser')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Repost banner */}
      {post.originalUserName && (
        <p className="px-5 text-xs text-text-muted mb-1">
          ↻ Reposted from <span className="font-medium text-accent-secondary">{post.originalUserName}</span>
        </p>
      )}

      {/* Cosmic Match card body (rare shared match) */}
      {post.type === 'cosmic_match' && <CosmicMatchBody post={post} />}

      {/* Content */}
      {post.content && post.type !== 'cosmic_match' && (() => {
        const youtubeUrls = extractYouTubeUrls(post.content);
        const youtubeIds = youtubeUrls.map(extractYouTubeId).filter(Boolean) as string[];
        const tiktokMatches = extractAllTikTokMatches(post.content);
        let displayText = post.content;
        if (youtubeIds.length > 0) displayText = displayText.replace(YOUTUBE_REGEX, '').trim();
        if (tiktokMatches.length > 0) displayText = stripTikTokUrls(displayText);

        return (
          <>
            {displayText && (
              <ExpandablePostText
                text={displayText}
                className={cn('px-5 pb-3 text-sm leading-relaxed', hasGradient ? 'text-lg py-6 text-center font-medium' : '')}
                style={textColor ? { color: textColor } : undefined}
              />
            )}
            {youtubeIds.map((vid, i) => (
              <div key={vid + i} className="px-5 pb-3">
                <YouTubeEmbed videoId={vid} />
              </div>
            ))}
            {tiktokMatches.map((tt, i) => (
              <div key={tt.url + i} className="px-5 pb-3">
                <TikTokEmbed videoId={tt.videoId} url={tt.url} />
              </div>
            ))}
          </>
        );
      })()}

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
      {post.videoUrl && (() => {
        const vidYtId = extractYouTubeId(post.videoUrl);
        if (vidYtId) {
          return (
            <div className="px-5 pb-3">
              <YouTubeEmbed videoId={vidYtId} />
            </div>
          );
        }
        const vidTtId = extractTikTokVideoId(post.videoUrl);
        if (vidTtId || containsTikTokUrl(post.videoUrl)) {
          return (
            <div className="px-5 pb-3">
              <TikTokEmbed videoId={vidTtId} url={post.videoUrl} />
            </div>
          );
        }
        return (
          <div className="px-5 pb-3 relative">
            <video
              src={post.videoUrl}
              poster={post.posterUrl}
              controls
              playsInline
              preload="metadata"
              className="w-full rounded-xl max-h-[400px] bg-black"
              onPlay={() => {
                // One recorded view per post per page session; the DB
                // upsert dedupes per user across sessions.
                if (!recordedVideoViewPosts.has(post.id)) {
                  recordedVideoViewPosts.add(post.id);
                  recordPostVideoView(post.id, currentUserId);
                }
              }}
            />
            <span className="absolute top-2 right-7 px-2 py-0.5 rounded-md bg-black/55 text-white text-[11px] font-semibold pointer-events-none">
              👁️ {formatViewCount(post.videoViewsCount || 0)}
            </span>
          </div>
        );
      })()}

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

      {/* Virality Indicator */}
      {CONTENT_VIRALITY_ENABLED && (() => {
        const indicator = getViralityIndicatorFromPost(post);
        if (!indicator) return null;
        return (
          <div className="px-5 pb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/12 text-orange-400">
              {indicator.emoji} {indicator.label}
            </span>
          </div>
        );
      })()}

      {/* Action bar */}
      <div className="flex items-center border-t border-border-primary">
        <button
          onClick={() => setShowReactions(!showReactions)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-text-muted hover:text-accent-primary transition-colors"
        >
          <span className="text-base">✨</span> {t('messages.contextMenu.react')}
        </button>
        <div className="w-px h-5 bg-border-primary" />
        <button
          onClick={() => onComment(post.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-text-muted hover:text-accent-primary transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {post.commentCount > 0 ? post.commentCount : t('components.feedCard.comment')}
        </button>
        <div className="w-px h-5 bg-border-primary" />
        <button
          onClick={() => onRepost(post)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-text-muted hover:text-accent-primary transition-colors"
        >
          <Repeat2 className="w-4 h-4" /> {t('feed.composer.repost', 'Repost')}
        </button>
        <div className="w-px h-5 bg-border-primary" />
        <button
          onClick={() => onBookmark(post.id)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs transition-colors',
            isBookmarked ? 'text-accent-primary' : 'text-text-muted hover:text-accent-primary'
          )}
        >
          <Bookmark className={cn('w-4 h-4', isBookmarked && 'fill-current')} /> {isBookmarked ? t('components.feedCard.saved', 'Saved') : t('common.save')}
        </button>
        <div className="w-px h-5 bg-border-primary" />
        <button
          onClick={() => {
            const shareUrl = `${window.location.origin}/feed`;
            if (navigator.share) {
              navigator.share({ title: `${post.userName} on Align`, text: post.content.slice(0, 100), url: shareUrl }).catch(() => {});
            } else {
              navigator.clipboard.writeText(shareUrl).catch(() => {});
            }
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-text-muted hover:text-accent-primary transition-colors"
        >
          <Share2 className="w-4 h-4" /> {t('components.feedCard.share')}
        </button>

        {/* Download — video posts only, and only when the creator allows it.
            The saved file carries the Align outro. */}
        {post.videoUrl && post.allowDownload !== false && (
          <>
            <div className="w-px h-5 bg-border-primary" />
            <button
              onClick={handleDownload}
              disabled={downloading}
              title="Save video"
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-text-muted hover:text-accent-primary transition-colors disabled:opacity-60"
            >
              {downloading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Download className="w-4 h-4" />}
              {downloadLabel}
            </button>
          </>
        )}
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
            <div key={c.id} className="flex items-start gap-2 text-sm">
              <Link href={`/user/${c.userId}`} className="w-5 h-5 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden cursor-pointer">
                {c.userAvatar ? (
                  <img src={c.userAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-[9px] font-bold text-accent-primary">{c.userName[0]?.toUpperCase()}</span>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/user/${c.userId}`} className="font-semibold text-text-primary mr-1.5 hover:underline">{c.userName}</Link>
                {isGifOrStickerUrl(c.text) ? (
                  <img src={c.text.trim()} alt="GIF" className="mt-1 max-w-[180px] max-h-[120px] rounded-lg object-contain" />
                ) : (
                  <span className="text-text-secondary">{renderRichText(c.text)}</span>
                )}
              </div>
            </div>
          ))}
          {post.commentCount > 3 && (
            <button
              onClick={() => onComment(post.id)}
              className="text-xs text-accent-secondary hover:text-accent-primary"
            >
              {t('components.feedCard.viewAllComments', 'View all {{count}} comments', { count: post.commentCount })}
            </button>
          )}
        </div>
      )}

      {/* Report modal */}
      {showReportMenu && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setShowReportMenu(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowReportMenu(false)}>
            <div className="bg-bg-card border border-border rounded-2xl p-5 max-w-xs w-full" onClick={e => e.stopPropagation()}>
              <h3 className="text-base font-semibold text-text-primary mb-3">{t('components.feedCard.reportPost', 'Report Post')}</h3>
              {reported ? (
                <p className="text-sm text-green-400 mb-4">{t('components.feedCard.reportThanks', "Thanks for reporting. We'll review this post.")}</p>
              ) : (
                <div className="space-y-1 mb-4">
                  {['Spam', 'Harassment', 'Inappropriate content', 'Misinformation', 'Other'].map(reason => (
                    <button
                      key={reason}
                      onClick={async () => {
                        try { await reportPost(post.id, currentUserId, reason); } catch { /* */ }
                        setReported(true);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-bg-secondary rounded-lg transition-colors"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => { setShowReportMenu(false); setReported(false); }} className="btn-secondary w-full text-sm">
                {reported ? t('common.done') : t('common.cancel')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Click outside to close menu */}
      {showMenu && <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />}
    </div>
  );
}
