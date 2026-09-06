'use client';

// ═══════════════════════════════════════════════════════════════════
// One line of live chat.
//
// Shared by the host and viewer screens so the two can never drift into
// showing different affordances for the same message — which is how a
// host ends up unable to moderate something a viewer can see.
//
// Mentions reuse renderRichText, the same renderer the feed uses, so a
// tagged name links to the same profile route from both places.
// ═══════════════════════════════════════════════════════════════════

import Link from 'next/link';
import { Heart, CornerUpLeft, Flag, EyeOff, UserX, Pin } from 'lucide-react';
import { renderRichText } from '@/lib/mentions';
import type { LiveMessage, LiveAuthor } from '@/lib/liveService';
import { authorName } from '@/lib/liveService';

export interface LiveChatMessageProps {
  message: LiveMessage;
  authors: Record<string, LiveAuthor>;
  selfId?: string | null;
  /** Host-only affordances. */
  isHost?: boolean;
  hearted?: boolean;
  onReply?: (m: LiveMessage) => void;
  onHeart?: (m: LiveMessage) => void;
  onReport?: (m: LiveMessage) => void;
  onHide?: (m: LiveMessage) => void;
  onEject?: (m: LiveMessage) => void;
  onPin?: (m: LiveMessage) => void;
}

function avatarFor(
  m: LiveMessage,
  authors: Record<string, LiveAuthor>,
): string | null {
  return m.profile?.avatar_url || authors[m.sender_id]?.avatar_url || null;
}

export function LiveChatMessage({
  message: m,
  authors,
  selfId,
  isHost = false,
  hearted = false,
  onReply,
  onHeart,
  onReport,
  onHide,
  onEject,
  onPin,
}: LiveChatMessageProps) {
  // A milestone is an event worth noticing in the log, unlike an
  // arrival — it keeps a tint so someone scrolling back can see where
  // the energy was.
  if (m.kind === 'milestone') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-rose-300/80 py-0.5">
        <Heart className="w-3 h-3 shrink-0" fill="currentColor" />
        <span className="truncate">{m.body}</span>
      </div>
    );
  }

  // Arrivals and system notices are not conversation — no avatar, no
  // controls, and visually quieter so they never compete with chat.
  if (m.kind !== 'chat') {
    return <div className="text-xs text-white/30 italic py-0.5">{m.body}</div>;
  }

  const isMine = m.sender_id === selfId;
  const name = authorName(m, authors, selfId);
  const avatar = avatarFor(m, authors);
  const initial = (name === 'You' ? 'Y' : name).charAt(0).toUpperCase();

  return (
    <div className="group flex items-start gap-2">
      {/* Tapping the avatar opens the profile — the whole point of
          showing one. Never link your own back to a stranger page. */}
      {isMine ? (
        <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-[10px] text-white/70 shrink-0 mt-0.5">
          {initial}
        </span>
      ) : (
        <Link
          href={`/user/${m.sender_id}`}
          aria-label={`View ${name}'s profile`}
          className="shrink-0 mt-0.5"
        >
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt=""
              className="w-6 h-6 rounded-full object-cover ring-1 ring-white/15 hover:ring-white/40 transition"
            />
          ) : (
            <span className="w-6 h-6 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-[10px] text-white/70 transition">
              {initial}
            </span>
          )}
        </Link>
      )}

      <div className="flex-1 min-w-0">
        {m.reply_to_body && (
          <div className="flex items-center gap-1 text-[11px] text-white/35 truncate">
            <CornerUpLeft className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">
              {m.reply_to_name ? `${m.reply_to_name}: ` : ''}
              {m.reply_to_body}
            </span>
          </div>
        )}

        <div className="text-sm leading-snug">
          {isMine ? (
            <span className="text-white/45">You</span>
          ) : (
            <Link
              href={`/user/${m.sender_id}`}
              className="text-white/45 hover:text-white/75 hover:underline"
            >
              {name}
            </Link>
          )}{' '}
          <span className="text-white/90 break-words">{renderRichText(m.body)}</span>
          {m.is_pinned && <Pin className="inline w-3 h-3 ml-1 text-amber-300" />}
        </div>
      </div>

      {/* Controls stay hidden until hover so a busy chat is readable. */}
      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
        {(m.hearts_count ?? 0) > 0 && (
          <span className="text-[10px] text-white/40 tabular-nums">{m.hearts_count}</span>
        )}
        {onHeart && (
          <button
            onClick={() => onHeart(m)}
            aria-label={hearted ? 'Remove heart' : 'Heart this message'}
            className={
              hearted
                ? 'text-red-400'
                : 'opacity-0 group-hover:opacity-100 focus:opacity-100 text-white/35 hover:text-red-300 transition'
            }
          >
            <Heart className="w-3 h-3" fill={hearted ? 'currentColor' : 'none'} />
          </button>
        )}
        {onReply && !isMine && (
          <button
            onClick={() => onReply(m)}
            aria-label={`Reply to ${name}`}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-white/35 hover:text-white/80 transition"
          >
            <CornerUpLeft className="w-3 h-3" />
          </button>
        )}
        {onReport && !isMine && (
          <button
            onClick={() => onReport(m)}
            aria-label="Report this message"
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-white/35 hover:text-white/80 transition"
          >
            <Flag className="w-3 h-3" />
          </button>
        )}
        {isHost && onPin && (
          <button
            onClick={() => onPin(m)}
            aria-label={m.is_pinned ? 'Unpin' : 'Pin to the top'}
            className={
              m.is_pinned
                ? 'text-amber-300'
                : 'opacity-0 group-hover:opacity-100 focus:opacity-100 text-white/35 hover:text-white/80 transition'
            }
          >
            <Pin className="w-3 h-3" />
          </button>
        )}
        {isHost && onHide && !isMine && (
          <button
            onClick={() => onHide(m)}
            aria-label="Hide this message"
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-white/35 hover:text-white/80 transition"
          >
            <EyeOff className="w-3 h-3" />
          </button>
        )}
        {isHost && onEject && !isMine && (
          <button
            onClick={() => onEject(m)}
            aria-label="Remove this person from the stream"
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-white/35 hover:text-red-300 transition"
          >
            <UserX className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
