'use client';

// ═══════════════════════════════════════════════════════════════════
// /views — "Who's viewing you"
//
// Last-7-day stats per kind (vs the 7 days before), then everyone who
// viewed anything of yours, newest first. Opening the page clears the
// "new viewers" badge in the nav. Signed-in only (middleware gate).
// Backed by supabase-migration-views.sql — before it is live the page
// simply shows its empty state.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Eye, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { viewedAgo } from '@/components/views/ViewersSheet';
import { VIEWS_SEEN_EVENT } from '@/hooks/useViewBadge';
import {
  getMyViewActivity, getMyViewStats, markViewsSeen,
  type ActivityKind, type StatKind, type ViewActivity, type ViewStat,
} from '@/lib/viewsService';

const PAGE = 40;

const STAT_ORDER: StatKind[] = ['people', 'profile', 'post', 'photo', 'video', 'reel', 'story'];
const FILTERS: Array<ActivityKind | 'all'> = ['all', 'profile', 'post', 'photo', 'video', 'reel', 'story'];

const STAT_FALLBACK: Record<StatKind, string> = {
  people: 'People',
  profile: 'Profile',
  post: 'Posts',
  photo: 'Photos',
  video: 'Videos',
  reel: 'Reels',
  story: 'Stories',
};

const ACTION_FALLBACK: Record<ActivityKind, string> = {
  profile: '{{name}} viewed your profile',
  post: '{{name}} saw your post',
  video: '{{name}} watched your video',
  reel: '{{name}} watched your reel',
  photo: '{{name}} viewed your photo',
  story: '{{name}} viewed your story',
};

function Delta({ current, previous }: { current: number; previous: number }) {
  const { t } = useTranslation();
  if (previous === 0 && current === 0) return <span className="text-[11px] text-text-muted">—</span>;
  if (previous === 0) {
    return <span className="text-[11px] font-semibold text-green-400">▲ {t('views.stats.new', 'New')}</span>;
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return <span className="text-[11px] text-text-muted">0%</span>;
  const up = pct > 0;
  return (
    <span className={cn('text-[11px] font-semibold', up ? 'text-green-400' : 'text-red-400')}>
      {up ? '▲' : '▼'} {Math.abs(pct)}%
    </span>
  );
}

export default function ViewsPage() {
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id);

  const [stats, setStats] = useState<ViewStat[]>([]);
  const [filter, setFilter] = useState<ActivityKind | 'all'>('all');
  const [rows, setRows] = useState<ViewActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(false);

  // Opening the page = everything seen; clear the nav badge.
  useEffect(() => {
    if (!userId) return;
    markViewsSeen().finally(() => {
      try { window.dispatchEvent(new Event(VIEWS_SEEN_EVENT)); } catch { /* */ }
    });
    getMyViewStats(7).then(setStats).catch(() => setStats([]));
  }, [userId]);

  const load = useCallback(async (before: string | null) => {
    if (!userId) return;
    if (before) setLoadingMore(true); else setLoading(true);
    setError(false);
    try {
      const page = await getMyViewActivity(PAGE, before, filter === 'all' ? null : filter);
      setRows(prev => (before ? [...prev, ...page] : page));
      setHasMore(page.length >= PAGE);
    } catch {
      setError(true);
      if (!before) setRows([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [userId, filter]);

  useEffect(() => { void load(null); }, [load]);

  const statFor = (kind: StatKind) => stats.find(s => s.kind === kind) || { kind, current_count: 0, previous_count: 0 };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
          <Eye className="w-7 h-7 text-accent-primary" />
          {t('views.title', "Who's viewing you")}
        </h1>
        <p className="text-sm text-text-muted mt-1">{t('views.subtitle', 'Last 7 days, compared with the 7 days before')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {STAT_ORDER.map(kind => {
          const s = statFor(kind);
          return (
            <div
              key={kind}
              className={cn(
                'card !p-3 flex flex-col gap-1',
                kind === 'people' && 'col-span-2 sm:col-span-1 border-accent-primary/40',
              )}
            >
              <span className="text-[11px] uppercase tracking-wide text-text-muted">
                {t(`views.stats.${kind}`, STAT_FALLBACK[kind])}
              </span>
              <span className="text-xl font-bold text-text-primary">{s.current_count.toLocaleString()}</span>
              <Delta current={s.current_count} previous={s.previous_count} />
            </div>
          );
        })}
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              filter === f
                ? 'bg-accent-primary/20 text-accent-primary'
                : 'bg-bg-tertiary text-text-muted hover:text-text-secondary',
            )}
          >
            {f === 'all' ? t('views.filters.all', 'All') : t(`views.stats.${f}`, STAT_FALLBACK[f])}
          </button>
        ))}
      </div>

      {/* Activity */}
      {loading ? (
        <LoadingCosmic label={t('common.loading', 'Loading...')} />
      ) : rows.length === 0 ? (
        <div className="card text-center py-12">
          <Eye className="w-12 h-12 text-text-muted mx-auto mb-3" />
          {error ? (
            <>
              <p className="text-text-muted mb-2">{t('views.error', 'Could not load your views')}</p>
              <button onClick={() => void load(null)} className="text-sm text-accent-primary hover:underline">
                {t('common.retry', 'Retry')}
              </button>
            </>
          ) : (
            <>
              <p className="text-text-muted mb-1">{t('views.empty', 'No views yet')}</p>
              <p className="text-xs text-text-muted">
                {t('views.emptyHint', 'When people view your profile, posts, photos, videos, reels or stories, they will show up here.')}
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {rows.map((r, i) => {
            const name = r.display_name || t('stories.someone', 'Someone');
            return (
              <Link
                key={`${r.kind}-${r.content_id ?? ''}-${r.viewer_id}-${r.viewed_at}-${i}`}
                href={`/user/${r.viewer_id}`}
                className="flex items-center gap-3 p-3 rounded-lg transition-colors bg-bg-card hover:bg-bg-card-hover"
              >
                <UserAvatar displayName={name} avatarUrl={r.avatar_url} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">
                    {t(`views.activity.${r.kind}`, ACTION_FALLBACK[r.kind] || ACTION_FALLBACK.post, { name })}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {r.sun_sign ? `${r.sun_sign} · ` : ''}{viewedAgo(t, r.viewed_at)}
                  </p>
                </div>
                {r.thumb_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.thumb_url} alt="" className="w-11 h-11 rounded-md object-cover flex-shrink-0 bg-bg-tertiary" />
                ) : r.snippet ? (
                  <span className="max-w-[35%] text-[11px] text-text-muted line-clamp-2 text-right">{r.snippet}</span>
                ) : null}
              </Link>
            );
          })}
          {hasMore && (
            <div className="flex justify-center py-4">
              <button
                onClick={() => void load(rows[rows.length - 1].viewed_at)}
                disabled={loadingMore}
                className="btn-secondary text-sm px-6 py-2 inline-flex items-center gap-2 disabled:opacity-60"
              >
                {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('views.loadMore', 'Load more')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
