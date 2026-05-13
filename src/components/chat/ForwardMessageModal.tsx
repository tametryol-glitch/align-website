'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Loader2,
  Search,
  Check,
  Forward,
  Image,
  MapPin,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { getConversations, type Conversation } from '@/lib/messagingService';

// ── Types ──────────────────────────────────────────────────────────

interface ForwardMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: {
    id: string;
    content: string;
    type: string;
    metadata?: Record<string, unknown>;
  };
  onForward: (conversationId: string) => void;
}

// ── Helpers ─────────────────────────────────────────────────────────

function getMessageTypeIcon(type: string) {
  switch (type) {
    case 'image':
      return <Image className="w-4 h-4 text-text-muted" />;
    case 'location':
      return <MapPin className="w-4 h-4 text-text-muted" />;
    case 'file':
      return <FileText className="w-4 h-4 text-text-muted" />;
    default:
      return <MessageSquare className="w-4 h-4 text-text-muted" />;
  }
}

function getMessagePreview(message: ForwardMessageModalProps['message']): string {
  switch (message.type) {
    case 'image':
      return 'Photo';
    case 'video':
      return 'Video';
    case 'voice_note':
      return 'Voice note';
    case 'video_note':
      return 'Video note';
    case 'location':
      return 'Location';
    case 'file':
      return 'File';
    case 'contact':
      return 'Contact';
    case 'poll':
      return 'Poll';
    default:
      return message.content || 'Message';
  }
}

// ── Component ──────────────────────────────────────────────────────

export function ForwardMessageModal({
  isOpen,
  onClose,
  message,
  onForward,
}: ForwardMessageModalProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [forwarding, setForwarding] = useState(false);

  // ── Fetch conversations on open ──

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getConversations();
      setConversations(data);
    } catch {
      // getConversations already logs warnings
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      setSearchQuery('');
      setSelectedId(null);
      setForwarding(false);
    }
  }, [isOpen, fetchConversations]);

  // ── Filter conversations by search ──

  const filtered = searchQuery.trim()
    ? conversations.filter((c) => {
        const name = c.is_group
          ? c.group_name || 'Group'
          : c.other_user_name || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : conversations;

  // ── Forward handler ──

  async function handleForward() {
    if (!selectedId) return;
    setForwarding(true);
    try {
      onForward(selectedId);
      onClose();
    } catch {
      // caller handles errors
    } finally {
      setForwarding(false);
    }
  }

  // ── Render nothing when closed ──

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-bg-card border border-border-primary rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between p-4 border-b border-border-primary">
          <div className="flex items-center gap-2">
            <Forward className="w-5 h-5 text-accent-primary" />
            <h2 className="text-lg font-semibold text-text-primary">Forward Message</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Message Preview ── */}
        <div className="mx-4 mt-4 p-3 bg-bg-secondary rounded-xl border border-border-primary">
          <div className="flex items-start gap-2">
            {getMessageTypeIcon(message.type)}
            <p className="text-sm text-text-secondary line-clamp-2 flex-1">
              {getMessagePreview(message)}
            </p>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-bg-tertiary border border-border-primary text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-primary"
              autoFocus
            />
          </div>
        </div>

        {/* ── Conversation List ── */}
        <div className="flex-1 overflow-y-auto px-4 pb-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-accent-primary animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
              <p className="text-sm text-text-muted">
                {searchQuery.trim() ? 'No conversations found' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((convo) => {
                const name = convo.is_group
                  ? convo.group_name || 'Group'
                  : convo.other_user_name;
                const avatar = convo.is_group
                  ? convo.group_avatar_url || undefined
                  : convo.other_user_avatar || undefined;
                const isSelected = selectedId === convo.id;

                return (
                  <button
                    key={convo.id}
                    onClick={() => setSelectedId(isSelected ? null : convo.id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-left ${
                      isSelected
                        ? 'bg-accent-primary/15 ring-1 ring-accent-primary/40'
                        : 'hover:bg-bg-tertiary'
                    }`}
                  >
                    <UserAvatar
                      avatarUrl={avatar}
                      displayName={name}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {name}
                      </p>
                      {convo.last_message_preview && (
                        <p className="text-xs text-text-muted truncate">
                          {convo.last_message_preview}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="p-4 border-t border-border-primary">
          <button
            onClick={handleForward}
            disabled={!selectedId || forwarding}
            className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              selectedId && !forwarding
                ? 'btn-primary'
                : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
            }`}
          >
            {forwarding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Forward className="w-4 h-4" />
            )}
            Forward
          </button>
        </div>
      </div>
    </div>
  );
}
