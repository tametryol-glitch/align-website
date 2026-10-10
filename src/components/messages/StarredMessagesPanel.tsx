'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, X } from 'lucide-react';
import { getStarredMessages, starMessage, type Message } from '@/lib/messagingService';

interface Props {
  conversationId: string;
  currentUserId: string;
  onClose: () => void;
  /** Jump to the message in the thread (no-op if it isn't loaded). */
  onSelect: (messageId: string) => void;
  /** Called after a message is unstarred from inside the panel. */
  onUnstar: (messageId: string) => void;
}

function preview(msg: Message): string {
  switch (msg.type) {
    case 'image': return '📷 Photo';
    case 'video': return '🎬 Video';
    case 'voice_note': return '🎤 Voice message';
    case 'video_note': return '🎥 Video message';
    case 'file': return `📄 ${(msg.metadata?.filename as string) || (msg.metadata?.file_name as string) || 'File'}`;
    case 'location': return '📍 Location';
    case 'chart_share': return '✨ Shared chart';
    default: return msg.content;
  }
}

export function StarredMessagesPanel({ conversationId, currentUserId, onClose, onSelect, onUnstar }: Props) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[] | null>(null);

  useEffect(() => {
    let alive = true;
    setMessages(null);
    getStarredMessages(conversationId).then((m) => { if (alive) setMessages(m); });
    return () => { alive = false; };
  }, [conversationId]);

  async function handleUnstar(msg: Message) {
    setMessages((prev) => (prev ? prev.filter((m) => m.id !== msg.id) : prev));
    const ok = await starMessage(msg.id, conversationId, false);
    if (ok) onUnstar(msg.id);
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-bg-card">
      <div className="flex items-center gap-2 p-4 border-b border-border-primary">
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        <p className="flex-1 text-sm font-semibold text-text-primary">
          {t('messages.starred.title', 'Starred messages')}
        </p>
        <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages === null && (
          <p className="text-xs text-text-muted text-center py-8">{t('common.loading', 'Loading...')}</p>
        )}
        {messages !== null && messages.length === 0 && (
          <p className="text-xs text-text-muted text-center py-8">
            {t('messages.starred.empty', 'No starred messages yet. Tap a message and choose Star to save it here.')}
          </p>
        )}
        {messages?.map((msg) => (
          <div
            key={msg.id}
            className="rounded-xl border border-border-primary bg-bg-tertiary p-3 cursor-pointer hover:border-accent-primary/50 transition-colors"
            onClick={() => { onSelect(msg.id); onClose(); }}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-medium text-accent-primary truncate">
                {msg.sender_id === currentUserId ? t('messages.you', 'You') : msg.sender_name}
              </span>
              <span className="text-[10px] text-text-muted shrink-0">
                {new Date(msg.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-text-primary break-words line-clamp-4">{preview(msg)}</p>
            <button
              onClick={(e) => { e.stopPropagation(); handleUnstar(msg); }}
              className="mt-2 text-[11px] text-text-muted hover:text-text-primary"
            >
              {t('messages.starred.remove', 'Remove star')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
