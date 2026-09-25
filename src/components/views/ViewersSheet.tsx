'use client';

// ═══════════════════════════════════════════════════════════════════
// ViewersSheet — "who viewed this" for one thing the viewer owns.
//
// Bottom sheet on phones, centred card on desktop (same shell as
// ReactionViewerModal). Pages 50 at a time via get_viewers; the SQL only
// returns rows to the owner, so callers show this for owners only.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Eye, X, Loader2 } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { getViewers, type Viewer, type ViewKind } from '@/lib/viewsService';

const PAGE = 50;

/** "2h ago" using the shared time.* keys. */
export function viewedAgo(t: TFunction, iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return t('time.justNow', 'just now');
  if (s < 3600) return t('time.minutesAgo', '{{count}}m ago', { count: Math.floor(s / 60) });
  if (s < 86400) return t('time.hoursAgo', '{{count}}h ago', { count: Math.floor(s / 3600) });
  if (s < 604800) return t('time.daysAgo', '{{count}}d ago', { count: Math.floor(s / 86400) });
  if (s < 2592000) return t('time.weeksAgo', '{{count}}w ago', { count: Math.floor(s / 604800) });
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface ViewersSheetProps {
  kind: ViewKind;
  /** post / reel / story id, or photo_key for kind 'photo'. */
  id: string;
  /** Count already on screen — shown in the header until the list loads. */
  initialCount?: number;
  onClose: () => void;
}

export default function ViewersSheet({ kind, id, initialCount, onClose }: ViewersSheetProps) {
  const { t } = useTranslation();
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (offset: number) => {
    if (offset === 0) setLoading(true); else setLoadingMore(true);
    setError(false);
    try {
      const rows = await getViewers(kind, id, PAGE, offset);
      setViewers(prev => (offset === 0 ? rows : [...prev, ...rows]));
      if (rows.length > 0) setTotal(rows[0].total);
      else if (offset === 0) setTotal(0);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [kind, id]);

  useEffect(() => { void load(0); }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const count = total ?? initialCount ?? null;
  const hasMore = total !== null && viewers.length < total;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/70 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full sm:max-w-md max-h-[75vh] sm:max-h-[80vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <Eye className="w-4 h-4 text-accent-primary" />
            {count === null
              ? t('views.sheet.titleLoading', 'Viewers')
              : t('views.sheet.title', '{{count}} people viewed this', { count })}
          </h3>
          <button
            onClick={onClose}
            aria-label={t('common.close', 'Close')}
            className="p-1 rounded-full text-text-secondary hover:bg-bg-tertiary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-text-secondary" />
            </div>
          ) : error && viewers.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm text-red-400">{t('views.sheet.error', 'Could not load viewers')}</p>
              <button onClick={() => void load(0)} className="text-sm text-accent-primary hover:underline">
                {t('common.retry', 'Retry')}
              </button>
            </div>
          ) : viewers.length === 0 ? (
            <p className="text-center text-sm text-text-secondary py-10">{t('views.sheet.empty', 'No views yet')}</p>
          ) : (
            <>
              {viewers.map(v => (
                <Link
                  key={v.viewer_id}
                  href={`/user/${v.viewer_id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg-tertiary transition-colors"
                >
                  <UserAvatar displayName={v.display_name || undefined} avatarUrl={v.avatar_url} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {v.display_name || t('stories.someone', 'Someone')}
                    </p>
                    {v.sun_sign ? (
                      <p className="text-xs text-text-secondary truncate">{v.sun_sign}</p>
                    ) : null}
                  </div>
                  <span className="text-xs text-text-muted whitespace-nowrap">{viewedAgo(t, v.viewed_at)}</span>
                </Link>
              ))}
              {hasMore && (
                <div className="flex justify-center py-3">
                  <button
                    onClick={() => void load(viewers.length)}
                    disabled={loadingMore}
                    className="px-4 py-1.5 rounded-full text-sm border border-border-primary text-text-secondary hover:border-accent-primary/50 hover:text-accent-primary disabled:opacity-60"
                  >
                    {loadingMore
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : t('views.loadMore', 'Load more')}
                  </button>
                </div>
              )}
              {error && viewers.length > 0 && (
                <p className="text-center text-xs text-red-400 pb-3">{t('views.sheet.error', 'Could not load viewers')}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
