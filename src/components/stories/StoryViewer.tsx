'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X, Volume2, VolumeX, Pause, Play, Eye, Trash2, Loader2, Users, Send, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  markStoryViewed, reactToStory, getStoryViewers, deleteStory, storyDurationMs, storyTimeAgo, replyToStory,
  STORY_REACTIONS, STORY_REPLY_MAX_CHARS, type StoryGroup, type StoryViewer as StoryViewerRow,
} from '@/lib/storyService';

/** A press shorter than this is a tap (navigate); longer is a hold (pause). */
const TAP_MS = 250;

function Avatar({ url, name, size = 32 }: { url: string | null; name: string | null; size?: number }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />
  ) : (
    <div
      className="rounded-full bg-accent-primary/30 flex items-center justify-center text-white font-semibold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

export function StoryViewer({
  groups: initialGroups,
  startGroup,
  startStory = 0,
  myId,
  onClose,
  onChanged,
}: {
  groups: StoryGroup[];
  startGroup: number;
  startStory?: number;
  myId: string;
  onClose: () => void;
  /** Something the rail shows changed (seen state, a deletion). */
  onChanged: () => void;
}) {
  const { t } = useTranslation();
  const [groups, setGroups] = useState(initialGroups);
  const [gi, setGi] = useState(startGroup);
  const [si, setSi] = useState(startStory);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [holding, setHolding] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [pendingEmoji, setPendingEmoji] = useState<string | null>(null);
  const [sentEmoji, setSentEmoji] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [reactError, setReactError] = useState<string | null>(null);
  const [viewersOpen, setViewersOpen] = useState(false);
  const [viewers, setViewers] = useState<StoryViewerRow[] | null>(null);
  const [viewersError, setViewersError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [tabHidden, setTabHidden] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyFocused, setReplyFocused] = useState(false);
  const [replySending, setReplySending] = useState(false);
  const [replySent, setReplySent] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const elapsedRef = useRef(0);
  const pressStartRef = useRef(0);
  const viewedRef = useRef<Set<string>>(new Set());
  const changedRef = useRef(false);
  const replyInputRef = useRef<HTMLInputElement>(null);
  const replySentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const group = groups[gi];
  const story = group?.stories[si];
  const isOwn = !!group && group.user_id === myId;
  const paused = holding || userPaused || viewersOpen || confirmDelete || deleting || !!pendingEmoji || tabHidden
    || replyFocused || replySending;

  const close = useCallback(() => {
    if (changedRef.current) onChanged();
    onClose();
  }, [onChanged, onClose]);

  const next = useCallback(() => {
    const g = groups[gi];
    if (!g) return close();
    if (si < g.stories.length - 1) setSi(si + 1);
    else if (gi < groups.length - 1) { setGi(gi + 1); setSi(0); }
    else close();
  }, [groups, gi, si, close]);

  const prev = useCallback(() => {
    if (si > 0) setSi(si - 1);
    else if (gi > 0) { const pg = groups[gi - 1]; setGi(gi - 1); setSi(pg.stories.length - 1); }
    else { elapsedRef.current = 0; setProgress(0); if (videoRef.current) videoRef.current.currentTime = 0; }
  }, [groups, gi, si]);

  // Reset per-frame state whenever the frame changes.
  useEffect(() => {
    elapsedRef.current = 0;
    setProgress(0);
    setReady(story?.type === 'text');
    setPendingEmoji(null);
    setReactError(null);
    setViewersOpen(false);
    setViewers(null);
    setConfirmDelete(false);
    setDeleteError(null);
    setReplyText('');
    setReplyError(null);
    setReplySent(false);
  }, [story?.id, story?.type]);

  useEffect(() => () => { if (replySentTimerRef.current) clearTimeout(replySentTimerRef.current); }, []);

  // Mark viewed as soon as a frame is shown (not for your own).
  useEffect(() => {
    if (!story || isOwn || story.seen || viewedRef.current.has(story.id)) return;
    viewedRef.current.add(story.id);
    changedRef.current = true;
    markStoryViewed(story.id, myId).catch(() => { viewedRef.current.delete(story.id); });
  }, [story, isOwn, myId]);

  // Image / text timer. Video progress follows the element itself.
  useEffect(() => {
    if (!story || story.type === 'video' || !ready || paused) return;
    const total = storyDurationMs(story);
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      elapsedRef.current += now - last;
      last = now;
      const p = Math.min(1, elapsedRef.current / total);
      setProgress(p);
      if (p >= 1) { next(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [story, ready, paused, next]);

  // Video play/pause follows the shared paused state.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || story?.type !== 'video') return;
    if (paused) v.pause();
    else v.play().catch(() => { /* autoplay blocked: user can tap play */ });
  }, [paused, story?.id, story?.type, ready]);

  useEffect(() => {
    const onVis = () => setTabHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') {
        if (viewersOpen) setViewersOpen(false);
        else if (pendingEmoji) setPendingEmoji(null);
        else if (confirmDelete) setConfirmDelete(false);
        else close();
      } else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      else if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); setUserPaused((p) => !p); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, close, viewersOpen, pendingEmoji, confirmDelete]);

  // Lock page scroll while open.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  if (!group || !story) return null;

  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    pressStartRef.current = Date.now();
    setHolding(true);
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!pressStartRef.current) return;
    const held = Date.now() - pressStartRef.current;
    pressStartRef.current = 0;
    setHolding(false);
    if (held > TAP_MS) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (e.clientX - rect.left < rect.width / 2) prev();
    else next();
  }

  function onPointerCancel() {
    pressStartRef.current = 0;
    setHolding(false);
  }

  async function sendReaction() {
    if (!pendingEmoji || !story) return;
    setSending(true);
    setReactError(null);
    try {
      await reactToStory(story.id, myId, pendingEmoji);
      setSentEmoji((m) => ({ ...m, [story.id]: pendingEmoji }));
      setPendingEmoji(null);
    } catch (e: any) {
      console.warn('[Stories]', e?.message);
      setReactError(t('stories.viewer.reactFailed', 'Could not send your reaction'));
    } finally {
      setSending(false);
    }
  }

  async function sendReply() {
    if (!story || !group || isOwn || replySending) return;
    const text = replyText.trim();
    if (!text) return;
    setReplySending(true);
    setReplyError(null);
    const res = await replyToStory(story, group.user_id, text);
    setReplySending(false);
    if (!res.success) {
      console.warn('[Stories] reply failed:', res.error);
      setReplyError(t('stories.reply.failed', 'Could not send your reply'));
      return;
    }
    setReplyText('');
    setReplySent(true);
    // Sent: drop focus so the story resumes.
    replyInputRef.current?.blur();
    if (replySentTimerRef.current) clearTimeout(replySentTimerRef.current);
    replySentTimerRef.current = setTimeout(() => setReplySent(false), 1800);
  }

  async function openViewers() {
    if (!story) return;
    setViewersOpen(true);
    setViewersError(null);
    try {
      setViewers(await getStoryViewers(story.id));
    } catch (e: any) {
      console.warn('[Stories]', e?.message);
      setViewersError(t('stories.viewer.viewersFailed', 'Could not load viewers'));
      setViewers([]);
    }
  }

  async function doDelete() {
    if (!story) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteStory(story);
      changedRef.current = true;
      const remaining = group.stories.filter((s) => s.id !== story.id);
      if (remaining.length === 0) {
        const nextGroups = groups.filter((_, i) => i !== gi);
        if (gi >= nextGroups.length) { close(); return; }
        setGroups(nextGroups);
        setSi(0);
      } else {
        setGroups(groups.map((g, i) => (i === gi ? { ...g, stories: remaining } : g)));
        setSi(Math.min(si, remaining.length - 1));
      }
      setConfirmDelete(false);
    } catch (e: any) {
      console.warn('[Stories]', e?.message);
      setDeleteError(t('stories.viewer.deleteFailed', 'Could not delete this story'));
    } finally {
      setDeleting(false);
    }
  }

  const ago = (iso: string) => { const s = storyTimeAgo(iso); return s === 'now' ? t('stories.now', 'now') : s; };
  const name = isOwn ? t('stories.yourStory', 'Your story') : group.display_name || t('stories.someone', 'Someone');
  const reacted = sentEmoji[story.id];

  return (
    <div className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center" role="dialog" aria-modal="true">
      {/* Close (outside the card on desktop, corner on mobile) */}
      <button
        onClick={close}
        className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white hidden sm:block"
        aria-label={t('common.close', 'Close')}
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative w-full h-full sm:h-[min(92vh,860px)] sm:w-auto sm:aspect-[9/16] sm:rounded-2xl overflow-hidden bg-black select-none">
        {/* Media */}
        <div className="absolute inset-0 flex items-center justify-center">
          {story.type === 'text' ? (
            <div className="w-full h-full flex items-center justify-center p-8" style={{ backgroundColor: story.background_color || '#7C3AED' }}>
              <p className="text-white text-2xl font-semibold text-center whitespace-pre-wrap break-words max-w-full">{story.content}</p>
            </div>
          ) : story.type === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={story.id}
              src={story.media_url || ''}
              alt=""
              className="w-full h-full object-contain"
              onLoad={() => setReady(true)}
              onError={() => setReady(true)}
              draggable={false}
            />
          ) : (
            <video
              key={story.id}
              ref={videoRef}
              src={story.media_url || ''}
              className="w-full h-full object-contain"
              playsInline
              autoPlay
              muted={muted}
              onLoadedData={() => setReady(true)}
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                if (v.duration > 0) setProgress(Math.min(1, v.currentTime / v.duration));
              }}
              onEnded={next}
              onError={() => setReady(true)}
            />
          )}
          {!ready && <Loader2 className="absolute w-8 h-8 text-white/70 animate-spin" />}
        </div>

        {/* Tap / hold surface */}
        <div
          className="absolute inset-0 z-[1]"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onPointerLeave={onPointerCancel}
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Top: progress + header */}
        <div className="absolute top-0 inset-x-0 z-10 p-3 pt-2 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex gap-1 mb-3">
            {group.stories.map((s, i) => (
              <div key={s.id} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full bg-white"
                  style={{ width: `${i < si ? 100 : i === si ? progress * 100 : 0}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link href={isOwn ? '/profile' : `/user/${group.user_id}`} className="flex items-center gap-2 min-w-0" onClick={close}>
              <Avatar url={group.avatar_url} name={group.display_name} />
              <span className="text-sm font-semibold text-white truncate">{name}</span>
            </Link>
            <span className="text-xs text-white/70 shrink-0">{ago(story.created_at)}</span>
            {story.visibility === 'friends' && <Users className="w-3.5 h-3.5 text-white/70 shrink-0" aria-label={t('stories.create.friends', 'Friends only')} />}
            <div className="ml-auto flex items-center gap-1">
              <button onClick={() => setUserPaused((p) => !p)} className="p-1.5 text-white" aria-label={userPaused ? t('stories.viewer.play', 'Play') : t('stories.viewer.pause', 'Pause')}>
                {userPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              {story.type === 'video' && (
                <button onClick={() => setMuted((m) => !m)} className="p-1.5 text-white" aria-label={muted ? t('stories.viewer.unmute', 'Unmute') : t('stories.viewer.mute', 'Mute')}>
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}
              <button onClick={close} className="p-1.5 text-white sm:hidden" aria-label={t('common.close', 'Close')}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Caption */}
        {story.type !== 'text' && story.content && (
          <div className={cn('absolute inset-x-0 z-10 px-4 pointer-events-none', isOwn ? 'bottom-24' : 'bottom-40')}>
            <p className="text-center text-white text-sm bg-black/50 rounded-xl px-3 py-2 whitespace-pre-wrap break-words">{story.content}</p>
          </div>
        )}

        {/* Bottom bar */}
        <div className="absolute bottom-0 inset-x-0 z-10 p-3 pb-4 bg-gradient-to-t from-black/70 to-transparent">
          {isOwn ? (
            <div className="flex items-center justify-between">
              <button onClick={openViewers} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm">
                <Eye className="w-4 h-4" />
                {t('stories.viewer.seenBy', 'Seen by {{count}}', { count: story.view_count ?? 0 })}
              </button>
              <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 hover:bg-red-500/40 text-white text-sm">
                <Trash2 className="w-4 h-4" /> {t('common.delete', 'Delete')}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {reacted && (
                <span className="w-full text-center text-xs text-white/80 mb-1">
                  {t('stories.viewer.reacted', 'You reacted {{emoji}}', { emoji: reacted })}
                </span>
              )}
              {STORY_REACTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => { setReactError(null); setPendingEmoji(e); }}
                  className={cn(
                    'w-10 h-10 rounded-full text-xl flex items-center justify-center transition-transform hover:scale-110',
                    reacted === e ? 'bg-white/30' : 'bg-white/10',
                  )}
                  aria-label={t('stories.viewer.reactWith', 'React {{emoji}}', { emoji: e })}
                >
                  {e}
                </button>
              ))}
              <form
                className="w-full flex items-center gap-2 mt-2"
                onSubmit={(ev) => { ev.preventDefault(); sendReply(); }}
              >
                <input
                  ref={replyInputRef}
                  value={replyText}
                  onChange={(ev) => { setReplyText(ev.target.value.slice(0, STORY_REPLY_MAX_CHARS)); setReplyError(null); setReplySent(false); }}
                  onFocus={() => setReplyFocused(true)}
                  onBlur={() => setReplyFocused(false)}
                  onKeyDown={(ev) => { if (ev.key === 'Escape') { ev.preventDefault(); ev.currentTarget.blur(); } }}
                  placeholder={t('stories.reply.placeholder', 'Reply to {{name}}…', { name: group.display_name || t('stories.someone', 'Someone') })}
                  disabled={replySending}
                  enterKeyHint="send"
                  aria-label={t('stories.reply.label', 'Reply to this story')}
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-full bg-black/30 border border-white/40 text-sm text-white placeholder-white/70 focus:outline-none focus:border-white"
                />
                <button
                  type="submit"
                  disabled={replySending || !replyText.trim()}
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/25 text-white disabled:opacity-40"
                  aria-label={t('stories.viewer.send', 'Send')}
                >
                  {replySending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
              {replySent && (
                <span className="w-full text-center text-xs text-white/90 flex items-center justify-center gap-1" role="status">
                  <Check className="w-3.5 h-3.5" /> {t('stories.reply.sent', 'Sent')}
                </span>
              )}
              {replyError && <span className="w-full text-center text-xs text-red-300" role="alert">{replyError}</span>}
            </div>
          )}
        </div>

        {/* Reaction confirmation */}
        {pendingEmoji && (
          <div className="absolute inset-0 z-20 flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={() => !sending && setPendingEmoji(null)}>
            <div className="w-full max-w-xs rounded-2xl bg-bg-secondary border border-border-primary p-4 text-center" onClick={(e) => e.stopPropagation()}>
              <div className="text-4xl mb-2">{pendingEmoji}</div>
              <p className="text-sm text-text-primary mb-3">
                {t('stories.viewer.confirmReact', 'Send {{emoji}} to {{name}}?', { emoji: pendingEmoji, name: group.display_name || t('stories.someone', 'Someone') })}
              </p>
              {reactError && <p className="text-xs text-red-400 mb-2">{reactError}</p>}
              <div className="flex gap-2">
                <button onClick={() => setPendingEmoji(null)} disabled={sending} className="flex-1 py-2 rounded-xl bg-bg-tertiary text-sm text-text-secondary">
                  {t('common.cancel', 'Cancel')}
                </button>
                <button onClick={sendReaction} disabled={sending} className="flex-1 py-2 rounded-xl bg-gradient-accent text-sm text-white font-semibold flex items-center justify-center gap-1.5">
                  {sending && <Loader2 className="w-3.5 h-3.5 animate-spin" />} {t('stories.viewer.send', 'Send')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation */}
        {confirmDelete && (
          <div className="absolute inset-0 z-20 flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={() => !deleting && setConfirmDelete(false)}>
            <div className="w-full max-w-xs rounded-2xl bg-bg-secondary border border-border-primary p-4 text-center" onClick={(e) => e.stopPropagation()}>
              <p className="text-sm text-text-primary mb-3">{t('stories.viewer.confirmDelete', 'Delete this story? This can’t be undone.')}</p>
              {deleteError && <p className="text-xs text-red-400 mb-2">{deleteError}</p>}
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(false)} disabled={deleting} className="flex-1 py-2 rounded-xl bg-bg-tertiary text-sm text-text-secondary">
                  {t('common.cancel', 'Cancel')}
                </button>
                <button onClick={doDelete} disabled={deleting} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-sm text-white font-semibold flex items-center justify-center gap-1.5">
                  {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} {t('common.delete', 'Delete')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Seen-by sheet */}
        {viewersOpen && (
          <div className="absolute inset-0 z-20 flex items-end bg-black/50" onClick={() => setViewersOpen(false)}>
            <div className="w-full max-h-[60%] overflow-y-auto rounded-t-2xl bg-bg-secondary border-t border-border-primary p-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {t('stories.viewer.seenBy', 'Seen by {{count}}', { count: viewers ? viewers.length : story.view_count ?? 0 })}
                </h3>
                <button onClick={() => setViewersOpen(false)} className="p-1 text-text-muted" aria-label={t('common.close', 'Close')}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              {viewers === null ? (
                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-accent-primary" /></div>
              ) : viewersError ? (
                <p className="text-xs text-red-400 py-4 text-center">{viewersError}</p>
              ) : viewers.length === 0 ? (
                <p className="text-xs text-text-muted py-4 text-center">{t('stories.viewer.noViews', 'No views yet')}</p>
              ) : (
                <ul className="space-y-2">
                  {viewers.map((v) => (
                    <li key={v.viewer_id}>
                      <Link href={`/user/${v.viewer_id}`} onClick={close} className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-bg-tertiary">
                        <Avatar url={v.avatar_url} name={v.display_name} size={36} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-primary truncate">{v.display_name || t('stories.someone', 'Someone')}</p>
                          <p className="text-[11px] text-text-muted">{ago(v.viewed_at)}</p>
                        </div>
                        {v.emoji && <span className="text-xl">{v.emoji}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
