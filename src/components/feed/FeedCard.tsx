'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  type FeedPost, type ReactionEmoji, type PostReaction,
  REACTION_OPTIONS, POST_STYLE_PRESETS, reportPost,
} from '@/lib/feedService';
import { MessageCircle, Bookmark, MoreHorizontal, Trash2, Share2, Repeat2, Flag, Ban, Pencil, Globe, Users } from 'lucide-react';
import Link from 'next/link';

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
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [reported, setReported] = useState(false);
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
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => { onDelete(post.id); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-bg-tertiary flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setShowMenu(false); setShowReportMenu(true); }}
                    className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary flex items-center gap-2"
                  >
                    <Flag className="w-4 h-4" /> Report
                  </button>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-bg-tertiary flex items-center gap-2"
                  >
                    <Ban className="w-4 h-4" /> Block User
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

      {/* Content */}
      {post.content && (() => {
        const youtubeUrls = extractYouTubeUrls(post.content);
        const youtubeIds = youtubeUrls.map(extractYouTubeId).filter(Boolean) as string[];
        const tiktokMatches = extractAllTikTokMatches(post.content);
        let displayText = post.content;
        if (youtubeIds.length > 0) displayText = displayText.replace(YOUTUBE_REGEX, '').trim();
        if (tiktokMatches.length > 0) displayText = stripTikTokUrls(displayText);

        return (
          <>
            {displayText && (
              <p
                className={cn('px-5 pb-3 text-sm leading-relaxed', hasGradient ? 'text-lg py-6 text-center font-medium' : '')}
                style={textColor ? { color: textColor } : undefined}
              >
                {displayText}
              </p>
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
          <div className="px-5 pb-3">
            <video
              src={post.videoUrl}
              poster={post.posterUrl}
              controls
              playsInline
              preload="metadata"
              className="w-full rounded-xl max-h-[400px] bg-black"
            />
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
          onClick={() => onRepost(post)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-text-muted hover:text-accent-primary transition-colors"
        >
          <Repeat2 className="w-4 h-4" /> Repost
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
          <Share2 className="w-4 h-4" /> Share
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
            <div key={c.id} className="flex items-start gap-2 text-sm">
              <div className="w-5 h-5 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden">
                {c.userAvatar ? (
                  <img src={c.userAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-[9px] font-bold text-accent-primary">{c.userName[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/user/${c.userId}`} className="font-semibold text-text-primary mr-1.5 hover:underline">{c.userName}</Link>
                {isGifOrStickerUrl(c.text) ? (
                  <img src={c.text.trim()} alt="GIF" className="mt-1 max-w-[180px] max-h-[120px] rounded-lg object-contain" />
                ) : (
                  <span className="text-text-secondary">{c.text}</span>
                )}
              </div>
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

      {/* Report modal */}
      {showReportMenu && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setShowReportMenu(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowReportMenu(false)}>
            <div className="bg-bg-card border border-border rounded-2xl p-5 max-w-xs w-full" onClick={e => e.stopPropagation()}>
              <h3 className="text-base font-semibold text-text-primary mb-3">Report Post</h3>
              {reported ? (
                <p className="text-sm text-green-400 mb-4">Thanks for reporting. We&apos;ll review this post.</p>
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
                {reported ? 'Done' : 'Cancel'}
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
