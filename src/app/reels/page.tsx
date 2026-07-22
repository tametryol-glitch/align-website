'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import {
  getReelsFeed,
  toggleReelLike,
  toggleReelSave,
  recordReelView,
  recordReelShare,
  getReelComments,
  addReelComment,
  deleteReelComment,
  reportReel,
  REEL_CATEGORIES,
  type Reel,
  type ReelComment,
  type ReelCategory,
  type ReelReportReason,
} from '@/lib/reelsService';
import {
  Heart,
  Bookmark,
  Share2,
  MessageCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronDown,
  X,
  Send,
  Loader2,
  Eye,
  MoreHorizontal,
  Flag,
  Trash2,
  Plus,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ─── Helpers ────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

// ─── ReelItem ───────────────────────────────────────────────────────

function ReelItem({
  reel,
  isActive,
  isMuted,
  onToggleMute,
  onLike,
  onSave,
  onShare,
  onOpenComments,
  onReport,
  onView,
}: {
  reel: Reel;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onOpenComments: () => void;
  onReport: () => void;
  onView: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showPauseIndicator, setShowPauseIndicator] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expandCaption, setExpandCaption] = useState(false);
  const hasRecordedView = useRef(false);
  const pauseIndicatorTimeout = useRef<NodeJS.Timeout | null>(null);

  // IntersectionObserver for autoplay/pause and view recording
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (!video) return;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          // Visible: play
          video.play().catch(() => {});
          setIsPaused(false);

          // Record view once
          if (!hasRecordedView.current) {
            hasRecordedView.current = true;
            onView();
          }
        } else {
          // Not visible: pause and rewind
          video.pause();
          video.currentTime = 0;
          setIsPaused(false);
        }
      },
      { threshold: [0.6] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onView]);

  // Sync mute state — re-trigger play on unmute so browser allows audio
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
    if (!isMuted && !video.paused) {
      video.play().catch(() => {});
    }
  }, [isMuted]);

  // Progress bar update
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration > 0) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  const togglePause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setIsPaused(false);
    } else {
      video.pause();
      setIsPaused(true);
    }

    // Flash the pause/play indicator
    setShowPauseIndicator(true);
    if (pauseIndicatorTimeout.current) clearTimeout(pauseIndicatorTimeout.current);
    pauseIndicatorTimeout.current = setTimeout(() => setShowPauseIndicator(false), 600);
  }, []);

  const categoryInfo = REEL_CATEGORIES.find((c) => c.value === reel.category);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full snap-start snap-always flex-shrink-0"
      style={{ scrollSnapAlign: 'start' }}
    >
      {/* Video */}
      {!videoError && reel.video_url ? (
        <video
          ref={videoRef}
          src={reel.video_url}
          poster={reel.thumbnail_url}
          loop
          playsInline
          muted={isMuted}
          className="w-full h-full object-cover cursor-pointer"
          onClick={togglePause}
          onError={() => setVideoError(true)}
        />
      ) : (
        <div className="w-full h-full bg-[#111] flex flex-col items-center justify-center gap-3">
          <div className="text-5xl">{videoError ? '⚠️' : '🎬'}</div>
          <p className="text-white/50 text-sm">
            {videoError ? 'Video failed to load' : 'Loading...'}
          </p>
        </div>
      )}

      {/* Pause/Play flash indicator */}
      {showPauseIndicator && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center animate-pulse">
            {isPaused ? (
              <Play className="w-10 h-10 text-white ml-1" fill="white" />
            ) : (
              <Pause className="w-10 h-10 text-white" fill="white" />
            )}
          </div>
        </div>
      )}

      {/* Progress bar at bottom of video */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
        <div
          className="h-full bg-[#9B6FF6] transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-[70px] z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20 pb-4 px-4">
        {/* Creator info */}
        <div className="flex items-center gap-3 mb-2">
          <Link href={`/user/${reel.creator_id}`} className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 flex-shrink-0 cursor-pointer">
            {reel.creator_avatar ? (
              <img
                src={reel.creator_avatar}
                alt={reel.creator_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#9B6FF6] flex items-center justify-center text-white font-bold text-sm">
                {(reel.creator_name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate drop-shadow-lg">
              {reel.creator_name}
            </p>
            {reel.creator_username && (
              <p className="text-white/60 text-xs truncate">@{reel.creator_username}</p>
            )}
          </div>
        </div>

        {/* Caption */}
        {reel.caption && (
          <button
            onClick={() => setExpandCaption(!expandCaption)}
            className="text-left w-full"
          >
            <p
              className={`text-white text-sm drop-shadow-lg leading-5 ${
                expandCaption ? '' : 'line-clamp-2'
              }`}
            >
              {reel.caption}
            </p>
          </button>
        )}

        {/* Category + tags */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {categoryInfo && (
            <span className="bg-white/15 text-white text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
              {categoryInfo.emoji} {categoryInfo.label}
            </span>
          )}
          {(reel.tags || []).slice(0, 3).map((tag) => (
            <span key={tag} className="text-white/70 text-xs font-medium">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right action column */}
      <div className="absolute right-3 bottom-20 z-10 flex flex-col items-center gap-5">
        {/* Like */}
        <button
          onClick={onLike}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center transition-transform group-active:scale-90">
            <Heart
              className={`w-6 h-6 transition-colors ${
                reel.is_liked
                  ? 'fill-red-500 text-red-500'
                  : 'text-white'
              }`}
            />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-lg">
            {formatCount(reel.likes_count)}
          </span>
        </button>

        {/* Comments */}
        <button
          onClick={onOpenComments}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center transition-transform group-active:scale-90">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-lg">
            {formatCount(reel.comments_count)}
          </span>
        </button>

        {/* Save */}
        <button
          onClick={onSave}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center transition-transform group-active:scale-90">
            <Bookmark
              className={`w-6 h-6 transition-colors ${
                reel.is_saved
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-white'
              }`}
            />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-lg">
            {formatCount(reel.saves_count)}
          </span>
        </button>

        {/* Share */}
        <button
          onClick={onShare}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center transition-transform group-active:scale-90">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-lg">
            {formatCount(reel.shares_count)}
          </span>
        </button>

        {/* Views */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <Eye className="w-5 h-5 text-white/70" />
          </div>
          <span className="text-white/70 text-xs font-semibold drop-shadow-lg">
            {formatCount(reel.views_count)}
          </span>
        </div>

        {/* Report / more */}
        <button
          onClick={onReport}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center transition-transform group-active:scale-90">
            <MoreHorizontal className="w-5 h-5 text-white/70" />
          </div>
        </button>
      </div>

      {/* Mute toggle - top left to avoid action column overlap */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleMute();
        }}
        className="absolute top-4 left-4 z-30 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform"
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6 text-white" />
        ) : (
          <Volume2 className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}

// ─── Comment Panel ──────────────────────────────────────────────────

function CommentPanel({
  reelId,
  onClose,
  onCountChange,
}: {
  reelId: string;
  onClose: () => void;
  onCountChange: (count: number) => void;
}) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadComments();
  }, [reelId]);

  async function loadComments() {
    setLoading(true);
    try {
      const data = await getReelComments(reelId);
      setComments(data || []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const result = await addReelComment(reelId, text.trim());
      if (result.success && result.comment) {
        setComments((prev) => [...prev, result.comment!]);
        onCountChange(comments.length + 1);
        setText('');
        // Scroll to bottom
        setTimeout(() => {
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
        }, 100);
      }
    } catch {
      // Silently fail
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    try {
      const ok = await deleteReelComment(commentId);
      if (ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        onCountChange(Math.max(0, comments.length - 1));
      }
    } catch {
      // Silently fail
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-[#1a1a2e] rounded-t-2xl max-h-[60vh] flex flex-col z-10">
        {/* Handle + header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/10">
          <div className="w-8" />
          <div className="flex flex-col items-center">
            <div className="w-10 h-1 rounded-full bg-white/30 mb-2" />
            <h3 className="text-white font-semibold text-sm">
              Comments ({comments.length})
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Comment list */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-[#9B6FF6] animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-8">
              No comments yet. Be the first!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 group">
                <Link href={`/user/${comment.user_id}`} className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 cursor-pointer">
                  {comment.user_avatar ? (
                    <img
                      src={comment.user_avatar}
                      alt={comment.user_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#9B6FF6] flex items-center justify-center text-white text-xs font-bold">
                      {(comment.user_name || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-xs">
                      {comment.user_name}
                    </span>
                    <span className="text-white/30 text-[10px]">
                      {timeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm leading-5 mt-0.5">
                    {comment.text}
                  </p>
                </div>
                {user?.id === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white/40 hover:text-red-400" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Input */}
        {user && (
          <div className="flex items-center gap-3 px-4 py-3 border-t border-white/10">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Add a comment..."
              className="flex-1 bg-white/10 text-white text-sm rounded-full px-4 py-2.5 outline-none placeholder:text-white/30 focus:ring-1 focus:ring-[#9B6FF6]"
            />
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || submitting}
              className="w-9 h-9 rounded-full bg-[#9B6FF6] flex items-center justify-center disabled:opacity-40 transition-opacity"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Report Modal ───────────────────────────────────────────────────

const REPORT_REASONS: { value: ReelReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment or Bullying' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'violence', label: 'Violence or Threats' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'copyright', label: 'Copyright Violation' },
  { value: 'other', label: 'Other' },
];

function ReportModal({
  reelId,
  onClose,
}: {
  reelId: string;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);

  async function handleReport(reason: ReelReportReason) {
    await reportReel(reelId, reason);
    setSubmitted(true);
    setTimeout(onClose, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#1a1a2e] rounded-2xl w-[90%] max-w-sm p-5 z-10">
        {submitted ? (
          <div className="text-center py-6">
            <p className="text-white font-semibold">Report Submitted</p>
            <p className="text-white/50 text-sm mt-1">Thank you. We will review this content.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Report This Reel</h3>
              <button onClick={onClose}>
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>
            <div className="space-y-1">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => handleReport(r.value)}
                  className="w-full text-left px-4 py-3 rounded-lg text-white/80 text-sm hover:bg-white/10 transition-colors flex items-center gap-3"
                >
                  <Flag className="w-4 h-4 text-white/40" />
                  {r.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────

export default function ReelsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ReelCategory | undefined>(undefined);
  const [isMuted, setIsMuted] = useState(true);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Comment panel
  const [commentReelId, setCommentReelId] = useState<string | null>(null);
  // Report modal
  const [reportReelId, setReportReelId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(0);
  const LIMIT = 10;

  // ─── Load feed ───
  const loadFeed = useCallback(
    async (reset = false) => {
      if (reset) {
        setLoading(true);
        pageRef.current = 0;
      } else {
        setLoadingMore(true);
      }

      try {
        const offset = reset ? 0 : pageRef.current * LIMIT;
        const data = await getReelsFeed({
          category: selectedCategory,
          limit: LIMIT,
          offset,
        });

        const safe = (data || []).filter((r: Reel) => r && r.id && r.video_url);

        if (reset) {
          setReels(safe);
          setActiveReelIndex(0);
          // Scroll to top
          scrollContainerRef.current?.scrollTo({ top: 0 });
        } else {
          setReels((prev) => [...prev, ...safe]);
        }

        setHasMore(safe.length >= LIMIT);
        pageRef.current = reset ? 1 : pageRef.current + 1;
        setError(null);
      } catch (err) {
        console.error('[Reels] Feed load failed:', err);
        if (reset) setReels([]);
        setError('Failed to load reels');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory]
  );

  // Initial load + re-load on category change
  useEffect(() => {
    loadFeed(true);
  }, [loadFeed]);

  // ─── Infinite scroll ───
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // When within 2 viewport heights of the bottom, load more
      if (scrollHeight - scrollTop - clientHeight < clientHeight * 2) {
        if (hasMore && !loadingMore && !loading) {
          loadFeed(false);
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, loading, loadFeed]);

  // ─── Track active reel via scroll ───
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const index = Math.round(container.scrollTop / container.clientHeight);
      setActiveReelIndex(Math.max(0, Math.min(index, reels.length - 1)));
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [reels.length]);

  // ─── Keyboard navigation ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't hijack if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const container = scrollContainerRef.current;
      if (!container) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        const nextIndex = Math.min(activeReelIndex + 1, reels.length - 1);
        container.scrollTo({
          top: nextIndex * container.clientHeight,
          behavior: 'smooth',
        });
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        const prevIndex = Math.max(activeReelIndex - 1, 0);
        container.scrollTo({
          top: prevIndex * container.clientHeight,
          behavior: 'smooth',
        });
      } else if (e.key === 'm') {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeReelIndex, reels.length]);

  // ─── Interaction handlers ───
  const handleLike = useCallback(async (reelId: string) => {
    // Optimistic update
    setReels((prev) =>
      prev.map((r) =>
        r.id === reelId
          ? {
              ...r,
              is_liked: !r.is_liked,
              likes_count: r.is_liked ? r.likes_count - 1 : r.likes_count + 1,
            }
          : r
      )
    );
    try {
      const result = await toggleReelLike(reelId);
      setReels((prev) =>
        prev.map((r) =>
          r.id === reelId
            ? { ...r, is_liked: result.liked, likes_count: result.count }
            : r
        )
      );
    } catch {
      // Revert on error
      setReels((prev) =>
        prev.map((r) =>
          r.id === reelId
            ? {
                ...r,
                is_liked: !r.is_liked,
                likes_count: r.is_liked ? r.likes_count - 1 : r.likes_count + 1,
              }
            : r
        )
      );
    }
  }, []);

  const handleSave = useCallback(async (reelId: string) => {
    // Optimistic update
    setReels((prev) =>
      prev.map((r) =>
        r.id === reelId
          ? {
              ...r,
              is_saved: !r.is_saved,
              saves_count: r.is_saved ? r.saves_count - 1 : r.saves_count + 1,
            }
          : r
      )
    );
    try {
      const result = await toggleReelSave(reelId);
      setReels((prev) =>
        prev.map((r) =>
          r.id === reelId
            ? { ...r, is_saved: result.saved, saves_count: result.count }
            : r
        )
      );
    } catch {
      // Revert on error
      setReels((prev) =>
        prev.map((r) =>
          r.id === reelId
            ? {
                ...r,
                is_saved: !r.is_saved,
                saves_count: r.is_saved ? r.saves_count - 1 : r.saves_count + 1,
              }
            : r
        )
      );
    }
  }, []);

  const handleShare = useCallback(async (reel: Reel) => {
    const url = `${window.location.origin}/reels/${reel.id}`;
    const shareData = {
      title: `${reel.creator_name}'s Reel on Align`,
      text: reel.caption || 'Check out this cosmic reel!',
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
      }
      recordReelShare(reel.id);
      // Update count optimistically
      setReels((prev) =>
        prev.map((r) =>
          r.id === reel.id ? { ...r, shares_count: r.shares_count + 1 } : r
        )
      );
    } catch {
      // Share cancelled or clipboard failed
    }
  }, []);

  const handleRecordView = useCallback((reelId: string) => {
    recordReelView(reelId);
  }, []);

  const handleCommentCountChange = useCallback(
    (count: number) => {
      if (!commentReelId) return;
      setReels((prev) =>
        prev.map((r) =>
          r.id === commentReelId ? { ...r, comments_count: count } : r
        )
      );
    },
    [commentReelId]
  );

  // ─── Category pills ───
  const allCategories = useMemo(
    () => [
      { value: undefined as ReelCategory | undefined, label: 'All', emoji: '✨' },
      ...REEL_CATEGORIES,
    ],
    []
  );

  // ─── Render ───

  // Loading state
  if (loading && reels.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#0a0a14] flex flex-col items-center justify-center gap-4 z-40">
        <Loader2 className="w-10 h-10 text-[#9B6FF6] animate-spin" />
        <p className="text-white/50 text-sm">Loading reels...</p>
      </div>
    );
  }

  // Empty state
  if (!loading && reels.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#0a0a14] flex flex-col items-center justify-center gap-4 z-40 px-6">
        <div className="text-6xl">&#127916;</div>
        <h2 className="text-white text-xl font-bold">No reels found</h2>
        <p className="text-white/50 text-sm text-center max-w-xs">
          {selectedCategory
            ? 'No reels in this category yet. Try a different one!'
            : 'No reels available right now. Check back later for cosmic content!'}
        </p>
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(undefined)}
            className="mt-2 px-6 py-2.5 bg-white/10 text-white text-sm font-semibold rounded-full"
          >
            View All Reels
          </button>
        )}
        {/* An empty feed shouldn't be a dead end — offer to make the first one. */}
        <Link
          href="/reels/create"
          className="mt-2 flex items-center gap-2 px-6 py-2.5 bg-[#9B6FF6] text-white text-sm font-semibold rounded-full"
        >
          <Plus className="w-4 h-4" /> Create a Reel
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-40 flex justify-center">
      {/* Dark sidebars on desktop */}
      <div className="hidden lg:block flex-1 bg-[#0a0a14]" />

      {/* Main reels column */}
      <div className="relative w-full max-w-[480px] h-full">
        {/* Create — the only entry point into the reel composer on web */}
        <Link
          href="/reels/create"
          aria-label="Create a reel"
          className="absolute top-3 right-3 z-40 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#9B6FF6] text-white text-xs font-bold shadow-lg hover:bg-[#8A5EE8] transition"
        >
          <Plus className="w-4 h-4" /> Create
        </Link>

        {/* Category pills - top overlay */}
        <div className="absolute top-0 left-0 right-0 z-30 pt-3 pb-2 pl-3 pr-24 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {allCategories.map((cat) => (
              <button
                key={cat.value ?? 'all'}
                onClick={() => setSelectedCategory(cat.value)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex-shrink-0 ${
                  selectedCategory === cat.value
                    ? 'bg-[#9B6FF6] text-white'
                    : 'bg-white/15 text-white/80 hover:bg-white/25'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable reel container */}
        <div
          ref={scrollContainerRef}
          className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {reels.map((reel, index) => (
            <div
              key={reel.id}
              className="w-full snap-start"
              style={{ height: '100%', minHeight: '100%' }}
            >
              <ReelItem
                reel={reel}
                isActive={index === activeReelIndex}
                isMuted={isMuted}
                onToggleMute={() => setIsMuted((prev) => !prev)}
                onLike={() => handleLike(reel.id)}
                onSave={() => handleSave(reel.id)}
                onShare={() => handleShare(reel)}
                onOpenComments={() => setCommentReelId(reel.id)}
                onReport={() => setReportReelId(reel.id)}
                onView={() => handleRecordView(reel.id)}
              />
            </div>
          ))}

          {/* Loading more spinner */}
          {loadingMore && (
            <div className="w-full h-24 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-[#9B6FF6] animate-spin" />
            </div>
          )}

          {/* End of reels */}
          {!hasMore && reels.length > 0 && (
            <div className="w-full h-24 flex flex-col items-center justify-center gap-1">
              <p className="text-white/40 text-sm">You have reached the end</p>
              <p className="text-white/25 text-xs">Check back later for more cosmic content</p>
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:block flex-1 bg-[#0a0a14]" />

      {/* Comment panel */}
      {commentReelId && (
        <CommentPanel
          reelId={commentReelId}
          onClose={() => setCommentReelId(null)}
          onCountChange={handleCommentCountChange}
        />
      )}

      {/* Report modal */}
      {reportReelId && (
        <ReportModal
          reelId={reportReelId}
          onClose={() => setReportReelId(null)}
        />
      )}

      {/* Error toast */}
      {error && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white text-sm px-4 py-2 rounded-lg backdrop-blur-sm">
          {error}
        </div>
      )}
    </div>
  );
}
