'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  addComment, getComments, deleteComment,
  type FeedComment,
} from '@/lib/feedService';
import { GifStickerPicker } from '@/components/chat/GifStickerPicker';
import { isGifOrStickerUrl } from '@/components/feed/FeedCard';
import { X, Send, Trash2, Smile } from 'lucide-react';
import Link from 'next/link';

function timeAgo(dateStr: string): string {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function CommentSheet({
  postId,
  postOwnerId,
  userId,
  onClose,
  onCommentCountChange,
}: {
  postId: string;
  postOwnerId: string;
  userId: string;
  onClose: () => void;
  onCommentCountChange?: (postId: string, delta: number) => void;
}) {
  const { t } = useTranslation();
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    getComments(postId).then((c) => { setComments(c); setLoading(false); });
  }, [postId]);

  async function handleSend() {
    if (!text.trim() || sending) return;
    setSending(true);
    setErrorMsg(null);
    try {
      const comment = await addComment(postId, userId, text.trim());
      setComments((prev) => [...prev, comment]);
      setText('');
      onCommentCountChange?.(postId, 1);
    } catch (err: any) {
      console.error('[Comment] send failed:', err);
      setErrorMsg(`Error: ${err?.message || String(err)} (userId=${userId ? userId.slice(0, 8) : 'EMPTY'})`);
    }
    setSending(false);
  }

  async function handleGifSelect(url: string, _type: 'gif' | 'sticker') {
    setShowGifPicker(false);
    setSending(true);
    setErrorMsg(null);
    try {
      const comment = await addComment(postId, userId, url);
      setComments((prev) => [...prev, comment]);
      onCommentCountChange?.(postId, 1);
    } catch (err: any) {
      console.error('[Comment] gif send failed:', err);
      setErrorMsg(`Error: ${err?.message || String(err)} (userId=${userId ? userId.slice(0, 8) : 'EMPTY'})`);
    }
    setSending(false);
  }

  async function handleDeleteComment(commentId: string) {
    setDeletingId(commentId);
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onCommentCountChange?.(postId, -1);
    } catch { /* ignore */ }
    setDeletingId(null);
  }

  function canDelete(comment: FeedComment): boolean {
    if (comment.userId === userId) return true;
    if (postOwnerId === userId) return true;
    return false;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-bg-secondary border border-border-primary rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col pb-safe">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-primary">
          <h3 className="text-lg font-semibold text-text-primary">{t('components.commentSheet.title')}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {loading && <p className="text-text-muted text-sm text-center py-8">{t('common.loading')}</p>}
          {!loading && comments.length === 0 && (
            <p className="text-text-muted text-sm text-center py-8">{t('components.commentSheet.beFirst')}</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 group">
              <Link href={`/user/${c.userId}`} className="w-8 h-8 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                {c.userAvatar ? (
                  <img src={c.userAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-accent-primary">{c.userName[0]?.toUpperCase()}</span>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <Link href={`/user/${c.userId}`} className="text-sm font-semibold text-text-primary hover:underline">{c.userName}</Link>
                  <span className="text-xs text-text-muted">{timeAgo(c.createdAt)}</span>
                  {canDelete(c) && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      disabled={deletingId === c.id}
                      className="ml-auto opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition-all"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {isGifOrStickerUrl(c.text) ? (
                  <img src={c.text.trim()} alt="GIF" className="mt-1 max-w-[220px] max-h-[160px] rounded-lg object-contain" />
                ) : (
                  <p className="text-sm text-text-secondary mt-0.5">{c.text}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="px-5 py-2 bg-red-500/10 border-t border-red-500/20">
            <p className="text-xs text-red-400">{errorMsg}</p>
          </div>
        )}

        {/* Input */}
        <div className="relative px-5 py-3 border-t border-border-primary">
          <GifStickerPicker
            isOpen={showGifPicker}
            onClose={() => setShowGifPicker(false)}
            onSelect={handleGifSelect}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGifPicker(!showGifPicker)}
              className={cn(
                'p-2 rounded-lg transition-colors flex-shrink-0',
                showGifPicker ? 'bg-accent-primary/15 text-accent-primary' : 'text-text-muted hover:text-accent-primary'
              )}
              title="Send GIF or Sticker"
            >
              <Smile className="w-5 h-5" />
            </button>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('components.commentSheet.placeholder')}
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
    </div>
  );
}
