'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  addComment, getComments, getReplies, getCommentParentId, deleteComment, editComment,
  type FeedComment,
} from '@/lib/feedService';
import { GifStickerPicker } from '@/components/chat/GifStickerPicker';
import { isGifOrStickerUrl } from '@/components/feed/FeedCard';
import { MentionInput } from '@/components/feed/MentionInput';
import { renderRichText, mentionMarkup } from '@/lib/mentions';
import { X, Send, Trash2, Smile, Pencil, CornerDownRight } from 'lucide-react';
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
  highlightCommentId,
  onClose,
  onCommentCountChange,
}: {
  postId: string;
  postOwnerId: string;
  userId: string;
  /** Scroll to and highlight this comment once loaded (notification deep-link) */
  highlightCommentId?: string | null;
  onClose: () => void;
  onCommentCountChange?: (postId: string, delta: number) => void;
}) {
  const { t } = useTranslation();
  const [comments, setComments] = useState<FeedComment[]>([]);
  /** Loaded replies, keyed by their top-level parent id. */
  const [replies, setReplies] = useState<Record<string, FeedComment[]>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loadingReplies, setLoadingReplies] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  /** The comment being replied to (always a top-level comment). */
  const [replyingTo, setReplyingTo] = useState<FeedComment | null>(null);
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    getComments(postId).then((c) => { setComments(c); setLoading(false); });
  }, [postId]);

  const loadReplies = useCallback(async (parentId: string) => {
    setLoadingReplies(parentId);
    const rows = await getReplies(parentId);
    setReplies((prev) => ({ ...prev, [parentId]: rows }));
    setExpanded((prev) => new Set(prev).add(parentId));
    setLoadingReplies(null);
    return rows;
  }, []);

  function toggleReplies(parentId: string) {
    if (expanded.has(parentId)) {
      setExpanded((prev) => { const next = new Set(prev); next.delete(parentId); return next; });
      return;
    }
    if (replies[parentId]) {
      setExpanded((prev) => new Set(prev).add(parentId));
      return;
    }
    loadReplies(parentId);
  }

  // Deep-link: scroll the target comment into view. When it's a reply, its
  // parent thread has to be expanded first.
  useEffect(() => {
    if (loading || !highlightCommentId) return;
    let cancelled = false;
    (async () => {
      const isTopLevel = comments.some((c) => c.id === highlightCommentId);
      if (!isTopLevel) {
        const parentId = await getCommentParentId(highlightCommentId);
        if (cancelled || !parentId) return;
        await loadReplies(parentId);
      }
      if (cancelled) return;
      setTimeout(() => {
        document.getElementById(`comment-${highlightCommentId}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    })();
    return () => { cancelled = true; };
    // comments is intentionally read once loading flips false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, highlightCommentId]);

  function acceptNewComment(comment: FeedComment, parentId: string | null) {
    if (!parentId) {
      setComments((prev) => [...prev, comment]);
    } else {
      setReplies((prev) => ({ ...prev, [parentId]: [...(prev[parentId] || []), comment] }));
      setExpanded((prev) => new Set(prev).add(parentId));
      setComments((prev) => prev.map((c) =>
        c.id === parentId ? { ...c, replyCount: (c.replyCount || 0) + 1 } : c
      ));
    }
    onCommentCountChange?.(postId, 1);
  }

  async function handleSend() {
    if (!text.trim() || sending) return;
    setSending(true);
    setErrorMsg(null);
    const parentId = replyingTo?.id || null;
    try {
      const comment = await addComment(postId, userId, text.trim(), parentId);
      acceptNewComment(comment, parentId);
      setText('');
      setReplyingTo(null);
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
    const parentId = replyingTo?.id || null;
    try {
      const comment = await addComment(postId, userId, url, parentId);
      acceptNewComment(comment, parentId);
      setReplyingTo(null);
    } catch (err: any) {
      console.error('[Comment] gif send failed:', err);
      setErrorMsg(`Error: ${err?.message || String(err)} (userId=${userId ? userId.slice(0, 8) : 'EMPTY'})`);
    }
    setSending(false);
  }

  async function handleDeleteComment(comment: FeedComment) {
    setDeletingId(comment.id);
    const parentId = comment.parentCommentId || null;
    try {
      await deleteComment(comment.id);
      if (parentId) {
        setReplies((prev) => ({
          ...prev,
          [parentId]: (prev[parentId] || []).filter((r) => r.id !== comment.id),
        }));
        setComments((prev) => prev.map((c) =>
          c.id === parentId ? { ...c, replyCount: Math.max(0, (c.replyCount || 1) - 1) } : c
        ));
      } else {
        setComments((prev) => prev.filter((c) => c.id !== comment.id));
      }
      onCommentCountChange?.(postId, -1);
    } catch { /* ignore */ }
    setDeletingId(null);
  }

  async function handleSaveEdit() {
    if (!editing || !editing.text.trim() || savingEdit) return;
    setSavingEdit(true);
    setErrorMsg(null);
    const next = editing.text.trim();
    const result = await editComment(editing.id, next);
    if (result.success) {
      const patch = (c: FeedComment) => c.id === editing.id ? { ...c, text: next, isEdited: true } : c;
      setComments((prev) => prev.map(patch));
      setReplies((prev) => {
        const copy: Record<string, FeedComment[]> = {};
        for (const [k, list] of Object.entries(prev)) copy[k] = list.map(patch);
        return copy;
      });
      setEditing(null);
    } else {
      setErrorMsg(result.error || 'Could not save that edit.');
    }
    setSavingEdit(false);
  }

  /** Reply to a reply targets the same thread, pre-tagging its author. */
  function startReply(comment: FeedComment, parent?: FeedComment) {
    const target = parent || comment;
    setReplyingTo(target);
    setEditing(null);
    if (parent && comment.userId !== userId) {
      const tag = mentionMarkup({ id: comment.userId, displayName: comment.userName });
      setText((prev) => (prev.includes(tag) ? prev : `${tag} ${prev}`.trimStart()));
    }
  }

  function canDelete(comment: FeedComment): boolean {
    if (comment.userId === userId) return true;
    if (postOwnerId === userId) return true;
    return false;
  }

  function renderComment(c: FeedComment, parent?: FeedComment) {
    const isReply = !!parent;
    const isEditing = editing?.id === c.id;
    return (
      <div
        key={c.id}
        id={`comment-${c.id}`}
        className={cn(
          'flex gap-3 group',
          isReply && 'ml-6 border-l border-border-primary pl-3',
          c.id === highlightCommentId && 'bg-accent-primary/10 border border-accent-primary/30 rounded-xl -mx-2 px-2 py-2'
        )}
      >
        <Link href={`/user/${c.userId}`} className={cn(
          'rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0 overflow-hidden',
          isReply ? 'w-6 h-6' : 'w-8 h-8'
        )}>
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
            {c.isEdited && <span className="text-[10px] text-text-muted italic">edited</span>}
            <span className="ml-auto flex items-center gap-2">
              {c.userId === userId && !isEditing && (
                <button
                  onClick={() => { setEditing({ id: c.id, text: c.text }); setReplyingTo(null); }}
                  className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-primary transition-all"
                  title="Edit comment"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              {canDelete(c) && (
                <button
                  onClick={() => handleDeleteComment(c)}
                  disabled={deletingId === c.id}
                  className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition-all"
                  title="Delete comment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          </div>

          {isEditing ? (
            <div className="mt-1 space-y-2">
              <MentionInput
                value={editing!.text}
                onChange={(next) => setEditing({ id: c.id, text: next })}
                excludeUserId={userId}
                menuPlacement="below"
                autoFocus
                maxLength={500}
                className="input w-full !py-2 text-sm"
                onEnterSubmit={handleSaveEdit}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit || !editing!.text.trim()}
                  className="btn-primary !px-3 !py-1 text-xs"
                >
                  Save
                </button>
                <button onClick={() => setEditing(null)} className="btn-secondary !px-3 !py-1 text-xs">
                  Cancel
                </button>
              </div>
            </div>
          ) : isGifOrStickerUrl(c.text) ? (
            <img src={c.text.trim()} alt="GIF" className="mt-1 max-w-[220px] max-h-[160px] rounded-lg object-contain" />
          ) : (
            <p className="text-sm text-text-secondary mt-0.5 whitespace-pre-wrap break-words">{renderRichText(c.text)}</p>
          )}

          {!isEditing && (
            <div className="flex items-center gap-4 mt-1">
              <button
                onClick={() => startReply(c, parent)}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-accent-primary transition-colors"
              >
                <CornerDownRight className="w-3 h-3" />
                Reply
              </button>
              {!isReply && (c.replyCount || 0) > 0 && (
                <button
                  onClick={() => toggleReplies(c.id)}
                  className="text-xs font-semibold text-accent-secondary hover:text-accent-primary"
                >
                  {loadingReplies === c.id
                    ? t('common.loading')
                    : expanded.has(c.id)
                      ? 'Hide replies'
                      : `View ${c.replyCount} ${c.replyCount === 1 ? 'reply' : 'replies'}`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
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
            <div key={c.id} className="space-y-3">
              {renderComment(c)}
              {expanded.has(c.id) && (replies[c.id] || []).map((r) => renderComment(r, c))}
            </div>
          ))}
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="px-5 py-2 bg-red-500/10 border-t border-red-500/20">
            <p className="text-xs text-red-400">{errorMsg}</p>
          </div>
        )}

        {/* Replying-to banner */}
        {replyingTo && (
          <div className="flex items-center justify-between px-5 py-2 bg-bg-card border-t border-border-primary">
            <span className="text-xs text-text-muted truncate">
              Replying to <span className="font-semibold text-accent-primary">{replyingTo.userName}</span>
            </span>
            <button onClick={() => setReplyingTo(null)} className="text-text-muted hover:text-text-primary">
              <X className="w-3.5 h-3.5" />
            </button>
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
            <MentionInput
              value={text}
              onChange={setText}
              onEnterSubmit={handleSend}
              excludeUserId={userId}
              menuPlacement="above"
              placeholder={replyingTo
                ? `Reply to ${replyingTo.userName}…`
                : t('components.commentSheet.placeholder')}
              className="input w-full !py-2 text-sm"
              wrapperClassName="flex-1 min-w-0"
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
