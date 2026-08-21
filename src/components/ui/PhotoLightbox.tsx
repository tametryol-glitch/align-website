'use client';

// ═══════════════════════════════════════════════════════════════════
// PhotoLightbox — full-screen profile photo viewer with reactions
//
// Facebook-style: click any photo in a profile (avatar, cover, or a
// photo in the Photos tab) to open it full-screen, react with the same
// 6 cosmic emojis the feed uses, and see who reacted.
//
// Web twin of align-app/src/components/ui/PhotoViewerModal.tsx.
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { REACTION_OPTIONS, type ReactionEmoji } from '@/lib/feedService';
import {
  getPhotoReactions, togglePhotoReaction, getReactorsForPhoto, photoTargetId,
  type PhotoTarget, type PhotoReaction, type PhotoReactor,
} from '@/lib/photoReactionService';

interface PhotoLightboxProps {
  photos: Array<{ target: PhotoTarget; label?: string }>;
  initialIndex: number;
  /** Current viewer — null when signed out (read-only). */
  userId: string | null;
  onClose: () => void;
  seedReactions?: Map<string, PhotoReaction[]>;
  onReactionsChanged?: (targetId: string, reactions: PhotoReaction[]) => void;
}

export function PhotoLightbox({
  photos,
  initialIndex,
  userId,
  onClose,
  seedReactions,
  onReactionsChanged,
}: PhotoLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [reactions, setReactions] = useState<PhotoReaction[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [reactors, setReactors] = useState<PhotoReactor[] | null>(null);
  const [reactorsLoading, setReactorsLoading] = useState(false);

  const entry = photos[index];
  const target = entry?.target;

  // Load reactions for whichever photo is on screen.
  useEffect(() => {
    if (!target) return;
    let cancelled = false;
    setReactions(seedReactions?.get(photoTargetId(target)) || []);
    setReactors(null);
    setShowPicker(false);
    (async () => {
      const fresh = await getPhotoReactions(target, userId);
      if (!cancelled) setReactions(fresh);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, photos.length, userId]);

  const go = useCallback((delta: number) => {
    setIndex(i => Math.min(photos.length - 1, Math.max(0, i + delta)));
  }, [photos.length]);

  // Keyboard: Esc closes, arrows page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, go]);

  async function handleReact(emoji: ReactionEmoji) {
    if (!target || !userId) return;
    setShowPicker(false);

    // Optimistic — one reaction per user, same rule the service enforces.
    setReactions(prev => {
      const mine = prev.find(r => r.userReacted);
      let next = prev.map(r => ({ ...r }));
      if (mine) {
        next = next
          .map(r => (r.emoji === mine.emoji
            ? { ...r, count: Math.max(0, r.count - 1), userReacted: false }
            : r))
          .filter(r => r.count > 0);
      }
      if (!mine || mine.emoji !== emoji) {
        const existing = next.find(r => r.emoji === emoji);
        if (existing) { existing.count += 1; existing.userReacted = true; }
        else next.push({ emoji, count: 1, userReacted: true });
      }
      return next;
    });

    const updated = await togglePhotoReaction(target, userId, emoji);
    setReactions(updated);
    onReactionsChanged?.(photoTargetId(target), updated);
    if (reactors !== null) void loadReactors();
  }

  const loadReactors = useCallback(async () => {
    if (!target) return;
    setReactorsLoading(true);
    try {
      setReactors(await getReactorsForPhoto(target));
    } finally {
      setReactorsLoading(false);
    }
  }, [target]);

  if (!entry || !target) return null;

  const total = reactions.reduce((sum, r) => sum + r.count, 0);
  const myEmoji = reactions.find(r => r.userReacted)?.emoji;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 text-white/80">
        <button onClick={onClose} aria-label="Close" className="p-2 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        {photos.length > 1 && (
          <span className="text-sm">{index + 1} / {photos.length}</span>
        )}
        <span className="w-9" />
      </div>

      {/* Image */}
      <div className="flex-1 relative flex items-center justify-center px-4 min-h-0">
        {index > 0 && (
          <button
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="absolute left-2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <div className="relative w-full h-full">
          <Image
            src={target.imageUrl}
            alt={entry.label || 'Photo'}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        {index < photos.length - 1 && (
          <button
            onClick={() => go(1)}
            aria-label="Next photo"
            className="absolute right-2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Reaction panel */}
      <div className="bg-black/60 px-4 py-3 space-y-2 max-h-[45vh] overflow-y-auto">
        {entry.label && <p className="text-white/60 text-xs">{entry.label}</p>}

        <div className="flex items-center gap-2 flex-wrap">
          {reactions.map(r => (
            <button
              key={r.emoji}
              onClick={() => handleReact(r.emoji)}
              disabled={!userId}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition ${
                r.userReacted
                  ? 'bg-accent-primary/40 text-white ring-1 ring-accent-primary'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              } ${!userId ? 'cursor-default' : ''}`}
            >
              <span>{r.emoji}</span>
              <span>{r.count}</span>
            </button>
          ))}
          {total > 0 && (
            <button
              onClick={() => (reactors === null ? loadReactors() : setReactors(null))}
              className="text-accent-primary text-sm font-medium hover:underline"
            >
              {total === 1 ? '1 reaction' : `${total} reactions`}
            </button>
          )}
          {total === 0 && (
            <span className="text-white/40 text-sm">
              {userId ? 'Be the first to react' : 'No reactions yet'}
            </span>
          )}
        </div>

        {/* Who reacted */}
        {reactorsLoading && <p className="text-white/50 text-sm">Loading…</p>}
        {reactors !== null && !reactorsLoading && (
          <div className="space-y-1 pt-1">
            {reactors.length === 0 ? (
              <p className="text-white/50 text-sm">No reactions yet</p>
            ) : reactors.map(r => (
              <div key={`${r.userId}-${r.emoji}`} className="flex items-center gap-2">
                <UserAvatar displayName={r.displayName} avatarUrl={r.avatarUrl} size="sm" />
                <span className="text-white/90 text-sm flex-1 truncate">{r.displayName}</span>
                <span>{r.emoji}</span>
              </div>
            ))}
          </div>
        )}

        {/* Picker */}
        {userId && (
          <>
            {showPicker && (
              <div className="flex flex-wrap gap-2">
                {REACTION_OPTIONS.map(opt => (
                  <button
                    key={opt.emoji}
                    onClick={() => handleReact(opt.emoji)}
                    className={`flex flex-col items-center px-3 py-1.5 rounded-lg transition ${
                      myEmoji === opt.emoji
                        ? 'bg-accent-primary/40'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    <span className="text-[10px] text-white/70">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowPicker(p => !p)}
              className={`w-full py-2 rounded-lg font-medium transition ${
                myEmoji
                  ? 'bg-accent-primary/30 text-white'
                  : 'bg-white/10 text-white/85 hover:bg-white/20'
              }`}
            >
              {myEmoji
                ? `${myEmoji} ${REACTION_OPTIONS.find(o => o.emoji === myEmoji)?.label || 'Reacted'}`
                : '☆ React'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
