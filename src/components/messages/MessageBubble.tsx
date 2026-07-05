'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UserAvatar } from '@/components/ui/UserAvatar';
import {
  SmilePlus, Check, CheckCheck, Reply, MoreVertical,
} from 'lucide-react';
import { VoiceMessageBubble } from '@/components/chat/VoiceMessageBubble';
import { VideoMessageBubble } from '@/components/chat/VideoMessageBubble';
import { FileBubble } from '@/components/chat/FileBubble';
import { LocationBubble } from '@/components/chat/LocationBubble';
import { PollBubble } from '@/components/chat/PollBubble';
import type { ChatTheme } from '@/data/chatThemes';
import { getReactionsFromMessage, type Message } from '@/lib/messagingService';

// ── Link Preview Helpers ────────────────────────────────────────────

interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
}

const URL_REGEX = /https?:\/\/[^\s<>]+/;
const IMAGE_URL_RE = /https?:\/\/[^\s<>"']+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s<>"']*)?|https?:\/\/[^\s<>"']*(?:chat-media|storage)[^\s<>"']*\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s<>"']*)?/i;
const SUPABASE_MEDIA_RE = /https?:\/\/[^\s<>"']*supabase[^\s<>"']*\/chat-media\//i;

function extractFirstUrl(text: string): string | null {
  const match = text.match(URL_REGEX);
  return match ? match[0] : null;
}

const linkPreviewCache = new Map<string, LinkPreview | null>();

async function fetchLinkPreview(url: string): Promise<LinkPreview | null> {
  if (linkPreviewCache.has(url)) return linkPreviewCache.get(url) ?? null;
  try {
    const resp = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
    if (!resp.ok) { linkPreviewCache.set(url, null); return null; }
    const data = await resp.json();
    const preview: LinkPreview = { url, title: data.title, description: data.description, image: data.image };
    linkPreviewCache.set(url, preview);
    return preview;
  } catch {
    linkPreviewCache.set(url, null);
    return null;
  }
}

function BubbleLinkPreview({ text, isMine }: { text: string; isMine: boolean }) {
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const url = useMemo(() => extractFirstUrl(text), [text]);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    fetchLinkPreview(url).then(p => { if (!cancelled) setPreview(p); });
    return () => { cancelled = true; };
  }, [url]);

  if (!preview || (!preview.title && !preview.description)) return null;

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block mt-1.5 rounded-lg overflow-hidden border ${
        isMine ? 'border-white/20 bg-white/10' : 'border-border-primary bg-bg-secondary'
      } hover:opacity-90 transition-opacity`}
    >
      {preview.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview.image} alt="" className="w-full h-28 object-cover" />
      )}
      <div className="px-2.5 py-1.5">
        {preview.title && (
          <p className={`text-xs font-semibold truncate ${isMine ? 'text-white' : 'text-text-primary'}`}>
            {preview.title}
          </p>
        )}
        {preview.description && (
          <p className={`text-[10px] line-clamp-2 ${isMine ? 'text-white/70' : 'text-text-muted'}`}>
            {preview.description}
          </p>
        )}
      </div>
    </a>
  );
}

// ── Inline Image Preview (detects image URLs in text messages) ──────

function InlineImagePreview({ text }: { text: string }) {
  const imageUrl = useMemo(() => {
    const match = text.match(IMAGE_URL_RE) || text.match(SUPABASE_MEDIA_RE);
    return match ? match[0] : null;
  }, [text]);

  if (!imageUrl) return null;

  return (
    <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="block mb-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt="Shared image"
        className="rounded-lg max-w-full max-h-60 object-cover"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    </a>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

export function formatMessageTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

// ── MessageBubble ────────────────────────────────────────────────────

export interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  isGroup: boolean;
  read: boolean;
  otherReadAt: string | null;
  chatTheme: ChatTheme | null;
  currentUserId: string;
  onReaction: (msgId: string, emoji: string) => void;
  onOpenReactionPicker: (msg: Message) => void;
  onReply: (msg: Message) => void;
  onContextMenu: (msg: Message, x: number, y: number) => void;
  onPollVote: (messageId: string, optionIndex: number) => void;
  onScrollToMessage: (messageId: string) => void;
}

export function MessageBubble({
  message: msg, isMine, isGroup, read, otherReadAt, chatTheme,
  currentUserId, onReaction, onOpenReactionPicker, onReply, onContextMenu, onPollVote,
  onScrollToMessage,
}: MessageBubbleProps) {
  const { t } = useTranslation();
  const reactions = getReactionsFromMessage(msg);
  const hasReactions = Object.keys(reactions).length > 0;

  if (msg.type === 'system') {
    return (
      <div key={msg.id} className="flex justify-center py-2">
        <span className="text-[10px] text-text-muted italic px-3 py-1 bg-bg-tertiary rounded-full">
          {msg.content}
        </span>
      </div>
    );
  }

  return (
    <div
      id={`msg-${msg.id}`}
      className={`group flex items-end gap-2 py-0.5 transition-all ${isMine ? 'justify-end' : 'justify-start'}`}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(msg, e.clientX, e.clientY);
      }}
    >
      {/* Other user avatar */}
      {!isMine && (
        <UserAvatar
          avatarUrl={msg.sender_avatar}
          displayName={msg.sender_name}
          size="xs"
        />
      )}

      <div className={`max-w-[75%] relative ${isMine ? 'items-end' : 'items-start'}`}>
        {/* Sender name for groups */}
        {!isMine && isGroup && (
          <p className="text-[10px] text-text-muted mb-0.5 ml-1">{msg.sender_name}</p>
        )}

        {/* Reply preview (clickable -- jumps to original) */}
        {msg.reply_to && msg.reply_message && (
          <div
            className={`text-[10px] px-3 py-1.5 rounded-t-xl border-l-2 border-accent-primary bg-bg-tertiary/50 mb-0.5 cursor-pointer hover:bg-bg-tertiary/80 transition-colors ${
              isMine ? 'ml-auto text-right' : ''
            }`}
            onClick={() => onScrollToMessage(msg.reply_to!)}
          >
            <span className="text-accent-primary font-medium">{msg.reply_message.sender_name}</span>
            <p className="text-text-muted truncate max-w-[200px]">{msg.reply_message.content}</p>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`px-3.5 py-2 rounded-2xl relative ${
            isMine
              ? `${chatTheme ? '' : 'bg-accent-primary'} text-white rounded-br-md`
              : `${chatTheme ? '' : 'bg-bg-tertiary'} text-text-primary rounded-bl-md`
          }`}
          style={chatTheme ? (
            isMine
              ? { background: `linear-gradient(135deg, ${chatTheme.ownBubble[0]}, ${chatTheme.ownBubble[1]})`, color: chatTheme.ownText }
              : { backgroundColor: chatTheme.otherBubble, color: chatTheme.otherText }
          ) : undefined}
        >
          {/* Image message. Mobile stores the URL under metadata.image_url;
              fall back to it so mobile-sent images render on web too. */}
          {msg.type === 'image' && (msg.metadata?.url || msg.metadata?.image_url) && (
            <a href={(msg.metadata.url || msg.metadata.image_url) as string} target="_blank" rel="noopener noreferrer" className="block mb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={(msg.metadata.url || msg.metadata.image_url) as string}
                alt="Shared image"
                className="rounded-lg max-w-full max-h-60 object-cover"
              />
            </a>
          )}

          {/* Chart share */}
          {msg.type === 'chart_share' && (
            <div className="bg-white/10 rounded-lg p-2 mb-1">
              <p className="text-xs font-medium">{t('messages.sharedChart', 'Shared a chart')}</p>
              {msg.metadata?.chart_type && (
                <p className="text-[10px] opacity-70">{msg.metadata.chart_type}</p>
              )}
            </div>
          )}

          {/* Voice note (mobile uses metadata.audio_url) */}
          {msg.type === 'voice_note' && (msg.metadata?.url || msg.metadata?.audio_url) && (
            <VoiceMessageBubble
              metadata={{ url: (msg.metadata.url || msg.metadata.audio_url) as string, duration: (msg.metadata.duration as number) || 0 }}
              isMine={isMine}
            />
          )}

          {/* Video message */}
          {msg.type === 'video' && msg.metadata?.url && !msg.metadata?.url?.toString().match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
            <VideoMessageBubble
              metadata={{ url: msg.metadata.url as string, duration: msg.metadata.duration as number, thumbnail_url: msg.metadata.thumbnail_url as string }}
              isMine={isMine}
            />
          )}

          {/* File attachment (mobile uses metadata.file_url) */}
          {msg.type === 'file' && (msg.metadata?.url || msg.metadata?.file_url) && (
            <FileBubble
              metadata={{ url: (msg.metadata.url || msg.metadata.file_url) as string, filename: (msg.metadata.filename as string) || (msg.metadata.file_name as string) || 'file', size: (msg.metadata.size as number) ?? (msg.metadata.file_size as number), mime_type: (msg.metadata.mime_type as string) || (msg.metadata.file_type as string) }}
              isMine={isMine}
            />
          )}

          {/* Location */}
          {msg.type === 'location' && msg.metadata?.latitude && (
            <LocationBubble
              metadata={{ latitude: msg.metadata.latitude as number, longitude: msg.metadata.longitude as number, address: msg.metadata.address as string }}
              isMine={isMine}
            />
          )}

          {/* Poll */}
          {msg.type === 'poll' && msg.metadata?.question && (
            <PollBubble
              message={msg}
              isMine={isMine}
              currentUserId={currentUserId}
              onVote={onPollVote}
            />
          )}

          {/* Inline image detection for text messages containing image URLs */}
          {msg.type === 'text' && msg.content && (
            <InlineImagePreview text={msg.content} />
          )}

          {/* Text content */}
          {msg.content && msg.type !== 'image' && msg.type !== 'voice_note' && msg.type !== 'file' && msg.type !== 'location' && msg.type !== 'poll' && (
            <>
              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
              <BubbleLinkPreview text={msg.content} isMine={isMine} />
            </>
          )}

          {/* Pinned indicator */}
          {msg.metadata?.pinned && (
            <span className={`text-[9px] ${isMine ? 'text-white/50' : 'text-text-muted'}`}>
              📌 {t('messages.contextMenu.pin')}
            </span>
          )}

          {/* Time + status */}
          <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : ''}`}>
            {msg.is_edited && (
              <span className={`text-[9px] ${isMine ? 'text-white/50' : 'text-text-muted'}`}>{t('messages.edited', 'edited')}</span>
            )}
            <span className={`text-[9px] ${isMine ? 'text-white/50' : 'text-text-muted'}`}>
              {formatMessageTime(msg.created_at)}
            </span>
            {isMine && (
              <span
                className={`text-[9px] cursor-default ${read ? 'text-blue-300' : 'text-white/40'}`}
                title={read && otherReadAt ? `${t('messages.read', 'Read')} ${new Date(otherReadAt).toLocaleDateString()} ${new Date(otherReadAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}` : t('messages.sent', 'Sent')}
              >
                {read ? <CheckCheck className="w-3 h-3 inline" /> : <Check className="w-3 h-3 inline" />}
              </span>
            )}
          </div>
        </div>

        {/* Reactions display */}
        {hasReactions && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(reactions).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={(e) => { e.stopPropagation(); onReaction(msg.id, emoji); }}
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-colors ${
                  users.includes(currentUserId)
                    ? 'border-accent-primary bg-accent-primary/15'
                    : 'border-border-primary bg-bg-tertiary hover:border-accent-primary/50'
                }`}
              >
                <span>{emoji}</span>
                {users.length > 1 && <span className="text-[9px] text-text-muted">{users.length}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Hover actions */}
        <div className={`absolute top-0 z-10 ${isMine ? '-left-20' : '-right-20'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 pointer-events-none group-hover:pointer-events-auto`}>
          <button
            onClick={(e) => { e.stopPropagation(); setTimeout(() => onOpenReactionPicker(msg), 0); }}
            className="p-1 rounded hover:bg-bg-tertiary text-text-muted"
            title="React"
          >
            <SmilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onReply(msg); }}
            className="p-1 rounded hover:bg-bg-tertiary text-text-muted"
            title="Reply"
          >
            <Reply className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              setTimeout(() => onContextMenu(msg, rect.left, rect.bottom), 0);
            }}
            className="p-1 rounded hover:bg-bg-tertiary text-text-muted"
            title="More"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
