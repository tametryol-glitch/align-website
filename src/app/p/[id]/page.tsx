'use client';

/**
 * /p/[id] — Shared post deep-link page.
 *
 * When someone shares a post from the feed, this page handles the link:
 * - Authenticated users see the full post and can interact.
 * - Unauthenticated users see a teaser + sign-up CTA.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { AppShell } from '@/components/layout/AppShell';
import { FeedCard } from '@/components/feed/FeedCard';
import type { FeedPost, ReactionEmoji, PostReaction, FeedComment } from '@/lib/feedService';

// ── YouTube helpers (inline to avoid circular deps) ───────────────
const YT_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/;
function extractYouTubeId(url: string): string | null {
  const m = YT_REGEX.exec(url);
  return m ? m[1] : null;
}

// ── TikTok helpers ────────────────────────────────────────────────
const TT_FULL = /tiktok\.com\/@[\w.-]+\/video\/(\d+)/;
function extractTikTokVideoId(url: string): string | null {
  const m = TT_FULL.exec(url);
  return m ? m[1] : null;
}

// ── Map raw DB row → FeedPost ────────────────────────────────────
function mapPost(
  p: any,
  reactions: PostReaction[],
  comments: FeedComment[],
  commentCount: number,
): FeedPost {
  const profile = p.profile as any;
  return {
    id: p.id,
    userId: p.user_id,
    userName: profile?.display_name || 'User',
    userAvatar: profile?.avatar_url || undefined,
    type: p.type,
    content: p.content || '',
    imageUrl: p.image_url || undefined,
    mediaKind: p.media_kind || undefined,
    videoUrl: p.video_url || undefined,
    posterUrl: p.poster_url || undefined,
    chartData: p.chart_data || undefined,
    reactions,
    comments: comments.slice(0, 3),
    commentCount,
    createdAt: p.created_at,
    updatedAt: p.updated_at || undefined,
    visibility: p.visibility || 'public',
    originalPostId: p.original_post_id || undefined,
    originalUserName: p.original_user_name || undefined,
    style: p.style || null,
  };
}

// ── Unauthenticated landing page ─────────────────────────────────

function UnauthLanding({ post }: { post: any | null }) {
  const { t } = useTranslation();
  const preview = post?.content?.slice(0, 200) || '';
  const authorName = (post?.profile as any)?.display_name || 'someone';
  const authorAvatar = (post?.profile as any)?.avatar_url;
  const hasImage = !!post?.image_url;
  const hasVideo = !!post?.video_url;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Align" width={32} height={32} className="w-8 h-8 rounded-lg" />
          <span className="text-lg font-bold text-text-primary">Align</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            {t('auth.login')}
          </Link>
          <Link href="/auth/signup" className="bg-accent-primary hover:bg-accent-primary/90 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors">
            {t('auth.signup')}
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Post preview card */}
          <div className="bg-bg-secondary border border-border-primary rounded-2xl p-6 text-left space-y-4">
            {/* Author */}
            <div className="flex items-center gap-3">
              {authorAvatar && post?.user_id ? (
                <Link href={`/user/${post.user_id}`} className="cursor-pointer">
                  <img src={authorAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                </Link>
              ) : authorAvatar ? (
                <img src={authorAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : post?.user_id ? (
                <Link href={`/user/${post.user_id}`} className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center cursor-pointer">
                  <span className="text-sm font-bold text-accent-primary">
                    {authorName[0]?.toUpperCase()}
                  </span>
                </Link>
              ) : (
                <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center">
                  <span className="text-sm font-bold text-accent-primary">
                    {authorName[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold text-sm text-text-primary">{authorName}</p>
                <p className="text-xs text-text-muted">Shared on Align</p>
              </div>
            </div>

            {/* Post text preview */}
            {preview && (
              <p className="text-sm text-text-secondary leading-relaxed">
                {preview}{post?.content?.length > 200 ? '...' : ''}
              </p>
            )}

            {/* Media indicator */}
            {hasImage && !hasVideo && (
              <div className="w-full h-48 rounded-xl bg-bg-tertiary flex items-center justify-center">
                <span className="text-text-muted text-sm">Sign up to see the full image</span>
              </div>
            )}
            {hasVideo && (
              <div className="w-full h-48 rounded-xl bg-black flex flex-col items-center justify-center gap-2">
                <span className="text-3xl">&#x25B6;</span>
                <span className="text-white/60 text-sm">Sign up to watch</span>
              </div>
            )}

            {/* Blurred overlay */}
            <div className="h-8 bg-gradient-to-t from-bg-secondary to-transparent" />
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-text-primary">
              Join Align to see the full post
            </h2>
            <p className="text-sm text-text-muted">
              Align is the cosmic social app. Astrology, charts, compatibility, and community.
            </p>
            <Link
              href="/auth/signup"
              className="block w-full bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold py-3 rounded-xl transition-colors text-center"
            >
              {t('auth.signup')}
            </Link>
            <Link
              href="/auth/login"
              className="block w-full bg-bg-tertiary hover:bg-bg-elevated text-text-secondary font-medium py-3 rounded-xl transition-colors text-center"
            >
              {t('auth.hasAccount')} {t('auth.login')}
            </Link>
            <a
              href="https://play.google.com/store/apps/details?id=com.align.astrology"
              className="block text-sm text-accent-secondary hover:underline mt-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Or download the app on Google Play
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Authenticated post view ──────────────────────────────────────

function AuthPostView({ postId }: { postId: string }) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const router = useRouter();
  const [post, setPost] = useState<FeedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchPost();
  }, [user, postId]);

  async function fetchPost() {
    try {
      const supabase = createClient();
      const { data: raw, error: err } = await supabase
        .from('posts')
        .select('*, profile:profiles!posts_user_id_fkey(display_name, avatar_url, sun_sign)')
        .eq('id', postId)
        .eq('is_deleted', false)
        .single();

      if (err || !raw) {
        setError('Post not found or has been deleted.');
        setLoading(false);
        return;
      }

      // Fetch reactions + comments
      const [reactionsRes, commentsRes] = await Promise.all([
        supabase.from('post_reactions').select('emoji, user_id').eq('post_id', postId),
        supabase
          .from('post_comments')
          .select('id, user_id, text, created_at')
          .eq('post_id', postId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true }),
      ]);

      const reactions: PostReaction[] = [];
      for (const r of reactionsRes.data || []) {
        const existing = reactions.find((x) => x.emoji === r.emoji);
        if (existing) {
          existing.count++;
          if (r.user_id === user!.id) existing.userReacted = true;
        } else {
          reactions.push({ emoji: r.emoji as any, count: 1, userReacted: r.user_id === user!.id });
        }
      }

      // Map commenter profiles
      const cUserIds = Array.from(new Set((commentsRes.data || []).map((c: any) => c.user_id)));
      const cProfiles: Record<string, any> = {};
      if (cUserIds.length > 0) {
        const { data: pData } = await supabase.from('profiles').select('id, display_name, avatar_url').in('id', cUserIds);
        if (pData) pData.forEach((p: any) => { cProfiles[p.id] = p; });
      }

      const comments: FeedComment[] = (commentsRes.data || []).map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        userName: cProfiles[c.user_id]?.display_name || 'User',
        userAvatar: cProfiles[c.user_id]?.avatar_url || undefined,
        text: c.text,
        createdAt: c.created_at,
      }));

      setPost(mapPost(raw, reactions, comments, comments.length));
    } catch {
      setError('Failed to load post.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-text-muted text-sm mt-4">{t('common.loading')}</p>
        </div>
      </AppShell>
    );
  }

  if (error || !post) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
          <p className="text-4xl">&#x1F50D;</p>
          <h2 className="text-xl font-bold text-text-primary">{t('errors.notFound')}</h2>
          <p className="text-sm text-text-muted">{error || t('errors.notFound')}</p>
          <button
            onClick={() => router.push('/feed')}
            className="bg-accent-primary text-white font-semibold px-6 py-2.5 rounded-xl"
          >
            Go to Feed
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/feed')}
          className="text-sm text-text-muted hover:text-text-primary mb-4 flex items-center gap-1"
        >
          &#x2190; Back to Feed
        </button>
        <FeedCard
          post={post}
          currentUserId={user!.id}
          onReaction={() => {}}
          onComment={() => router.push('/feed')}
          onDelete={() => {}}
          onEdit={() => {}}
          onRepost={() => {}}
          isBookmarked={false}
          onBookmark={() => {}}
        />
      </div>
    </AppShell>
  );
}

// ── Page component ───────────────────────────────────────────────

export default function PostDeepLinkPage() {
  const { t } = useTranslation();
  const params = useParams();
  const postId = params?.id as string;
  const { isAuthenticated, isLoading } = useAuthStore();
  const [rawPost, setRawPost] = useState<any>(null);
  const [fetchedUnauth, setFetchedUnauth] = useState(false);

  // For unauthenticated users, fetch a minimal preview (public posts only)
  useEffect(() => {
    if (isLoading || isAuthenticated || fetchedUnauth) return;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('posts')
          .select('id, user_id, content, image_url, video_url, type, visibility, profile:profiles!posts_user_id_fkey(display_name, avatar_url)')
          .eq('id', postId)
          .eq('is_deleted', false)
          .eq('visibility', 'public')
          .single();
        setRawPost(data);
      } catch {}
      setFetchedUnauth(true);
    })();
  }, [isLoading, isAuthenticated, postId, fetchedUnauth]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Authenticated → show full post
  if (isAuthenticated) {
    return <AuthPostView postId={postId} />;
  }

  // Unauthenticated → show teaser + sign up CTA
  return <UnauthLanding post={rawPost} />;
}
