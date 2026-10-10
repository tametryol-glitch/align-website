'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Link2, Play, X } from 'lucide-react';
import { extractUrls, getSharedMessages, type Message, type SharedKind } from '@/lib/messagingService';
import { formatFileSize } from '@/lib/chatMediaService';

interface Props {
  conversationId: string;
  onClose: () => void;
}

const TABS: Array<{ id: SharedKind; labelKey: string; fallback: string }> = [
  { id: 'media', labelKey: 'messages.shared.media', fallback: 'Media' },
  { id: 'links', labelKey: 'messages.shared.links', fallback: 'Links' },
  { id: 'docs', labelKey: 'messages.shared.docs', fallback: 'Docs' },
];

function host(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

export function SharedMediaPanel({ conversationId, onClose }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<SharedKind>('media');
  const [items, setItems] = useState<Message[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let alive = true;
    setItems(null);
    setHasMore(false);
    getSharedMessages(conversationId, tab).then((r) => {
      if (!alive) return;
      setItems(r.items);
      setHasMore(r.hasMore);
    });
    return () => { alive = false; };
  }, [conversationId, tab]);

  const loadMore = useCallback(async () => {
    if (!items || items.length === 0 || loadingMore) return;
    setLoadingMore(true);
    const r = await getSharedMessages(conversationId, tab, items[items.length - 1].created_at);
    setItems((prev) => [...(prev || []), ...r.items.filter((n) => !(prev || []).some((p) => p.id === n.id))]);
    setHasMore(r.hasMore);
    setLoadingMore(false);
  }, [items, loadingMore, conversationId, tab]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-bg-card">
      <div className="flex items-center gap-2 p-4 border-b border-border-primary">
        <p className="flex-1 text-sm font-semibold text-text-primary">
          {t('messages.shared.title', 'Media, links and docs')}
        </p>
        <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex border-b border-border-primary">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              tab === tb.id
                ? 'text-accent-primary border-b-2 border-accent-primary'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {t(tb.labelKey, tb.fallback)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {items === null && (
          <p className="text-xs text-text-muted text-center py-8">{t('common.loading', 'Loading...')}</p>
        )}
        {items !== null && items.length === 0 && (
          <p className="text-xs text-text-muted text-center py-8">
            {tab === 'media' && t('messages.shared.emptyMedia', 'No photos or videos shared yet.')}
            {tab === 'links' && t('messages.shared.emptyLinks', 'No links shared yet.')}
            {tab === 'docs' && t('messages.shared.emptyDocs', 'No documents shared yet.')}
          </p>
        )}

        {tab === 'media' && items && items.length > 0 && (
          <div className="grid grid-cols-3 gap-1">
            {items.map((m) => {
              const md = m.metadata || {};
              const isVideo = m.type === 'video';
              const url = (md.url || md.image_url || md.video_url) as string;
              const thumb = isVideo ? (md.thumbnail_url as string | undefined) : url;
              return (
                <a
                  key={m.id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square bg-bg-tertiary rounded-md overflow-hidden flex items-center justify-center"
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <Play className="w-6 h-6 text-text-muted" />
                  )}
                  {isVideo && thumb && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        )}

        {tab === 'links' && items && items.length > 0 && (
          <div className="space-y-2">
            {items.flatMap((m) =>
              extractUrls(m.content).map((u, i) => (
                <a
                  key={`${m.id}-${i}`}
                  href={u}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-xl border border-border-primary bg-bg-tertiary p-3 hover:border-accent-primary/50 transition-colors"
                >
                  <Link2 className="w-4 h-4 mt-0.5 text-accent-primary shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-text-primary truncate">{host(u)}</span>
                    <span className="block text-xs text-text-muted truncate">{u}</span>
                    <span className="block text-[10px] text-text-muted mt-1">
                      {m.sender_name} · {new Date(m.created_at).toLocaleDateString()}
                    </span>
                  </span>
                </a>
              )),
            )}
          </div>
        )}

        {tab === 'docs' && items && items.length > 0 && (
          <div className="space-y-2">
            {items.map((m) => {
              const md = m.metadata || {};
              const url = (md.url || md.file_url) as string;
              const name = (md.filename || md.file_name || 'File') as string;
              const size = (md.size ?? md.file_size) as number | undefined;
              return (
                <a
                  key={m.id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-border-primary bg-bg-tertiary p-3 hover:border-accent-primary/50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-accent-primary shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-text-primary truncate">{name}</span>
                    <span className="block text-[10px] text-text-muted">
                      {size ? `${formatFileSize(size)} · ` : ''}{m.sender_name} · {new Date(m.created_at).toLocaleDateString()}
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        )}

        {items !== null && hasMore && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full mt-3 py-2 text-xs text-accent-primary hover:text-accent-secondary disabled:opacity-50"
          >
            {loadingMore ? t('common.loading', 'Loading...') : t('messages.shared.loadMore', 'Load more')}
          </button>
        )}
      </div>
    </div>
  );
}
