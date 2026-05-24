'use client';

import { useTranslation } from 'react-i18next';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import {
  MessageCircle, Search, Plus, Users, MoreVertical,
  Pin, BellOff, Archive, Trash2,
} from 'lucide-react';
import type { Conversation } from '@/lib/messagingService';

// ── Helpers ──────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ── ConversationItem ─────────────────────────────────────────────────

function ConversationItem({
  conversation, isActive, isTyping, myId, onSelect, onContextMenu,
  showMenu, onPin, onMute, onArchive, onLeave,
}: {
  conversation: Conversation;
  isActive: boolean;
  isTyping: boolean;
  myId: string;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  showMenu: boolean;
  onPin: () => void;
  onMute: () => void;
  onArchive: () => void;
  onLeave: () => void;
}) {
  const { t } = useTranslation();
  const hasUnread = conversation.unread_count > 0;
  const iSentLast = conversation.last_message_sender_id === myId;
  const otherRead = conversation.other_last_read_at && conversation.last_message_at
    && new Date(conversation.other_last_read_at) >= new Date(conversation.last_message_at);

  return (
    <div className="relative">
      <button
        onClick={onSelect}
        onContextMenu={onContextMenu}
        className={`w-full flex items-center gap-3 p-3 transition-colors relative ${
          isActive ? 'bg-accent-muted' : 'hover:bg-bg-tertiary'
        }`}
      >
        {/* Avatar with online dot */}
        <div className="relative flex-shrink-0">
          <UserAvatar
            avatarUrl={conversation.other_user_avatar}
            displayName={conversation.other_user_name}
            size="md"
          />
          {conversation.other_user_online && !conversation.is_group && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-bg-card" />
          )}
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {conversation.is_pinned && <span className="text-[10px]">📌</span>}
              <p className={`text-sm truncate ${hasUnread ? 'font-bold text-text-primary' : 'font-medium text-text-primary'}`}>
                {conversation.is_group ? conversation.group_name : conversation.other_user_name}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {conversation.is_muted && <span className="text-[10px]">🔕</span>}
              <span className="text-[10px] text-text-muted">{timeAgo(conversation.last_message_at)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {iSentLast && !hasUnread && (
                <span className={`text-[10px] ${otherRead ? 'text-blue-400' : 'text-text-muted'}`}>
                  {otherRead ? '✓✓' : '✓'}
                </span>
              )}
              <p className={`text-xs truncate ${
                isTyping ? 'text-accent-primary italic' : hasUnread ? 'text-text-secondary font-medium' : 'text-text-muted'
              }`}>
                {isTyping ? t('messages.typing', 'typing...') : (conversation.last_message_preview || t('messages.startNewChat', 'Start a conversation'))}
              </p>
            </div>
            {hasUnread && (
              <span className="w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center text-[9px] text-white font-bold flex-shrink-0">
                {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
              </span>
            )}
          </div>
        </div>

        {/* Three-dot menu trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu(e);
          }}
          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-bg-tertiary rounded transition-all text-text-muted"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </button>

      {/* Dropdown menu */}
      {showMenu && (
        <div
          className="absolute right-3 top-12 z-40 bg-bg-card border border-border-primary rounded-xl shadow-xl py-1 min-w-[150px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onPin} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary">
            <Pin className="w-3.5 h-3.5" /> {conversation.is_pinned ? t('messages.contextMenu.unpin') : t('messages.contextMenu.pin')}
          </button>
          <button onClick={onMute} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary">
            <BellOff className="w-3.5 h-3.5" /> {conversation.is_muted ? t('messages.unmute', 'Unmute') : t('messages.mute', 'Mute')}
          </button>
          <button onClick={onArchive} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary">
            <Archive className="w-3.5 h-3.5" /> {t('messages.archive', 'Archive')}
          </button>
          <button onClick={onLeave} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-bg-tertiary">
            <Trash2 className="w-3.5 h-3.5" /> {t('messages.leave', 'Leave')}
          </button>
        </div>
      )}
    </div>
  );
}

// ── ConversationList ─────────────────────────────────────────────────

export interface ConversationListProps {
  conversations: Conversation[];
  loading: boolean;
  activeConversationId: string | null;
  typingUsers: Record<string, number>;
  myId: string;
  searchQuery: string;
  totalUnread: number;
  showConvMenu: string | null;
  onSearchChange: (query: string) => void;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onNewGroup: () => void;
  onToggleConvMenu: (id: string | null) => void;
  onPin: (convId: string, currentlyPinned: boolean) => void;
  onMute: (convId: string, currentlyMuted: boolean) => void;
  onArchive: (convId: string) => void;
  onLeave: (convId: string) => void;
}

export function ConversationList({
  conversations, loading, activeConversationId, typingUsers, myId,
  searchQuery, totalUnread, showConvMenu,
  onSearchChange, onSelect, onNewChat, onNewGroup, onToggleConvMenu,
  onPin, onMute, onArchive, onLeave,
}: ConversationListProps) {
  const { t } = useTranslation();
  return (
    <div className={`w-full sm:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-border-primary ${
      activeConversationId ? 'hidden sm:flex' : 'flex'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-border-primary">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-accent-primary" />
            {t('components.sidebar.messages')}
            {totalUnread > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-accent-primary text-white text-[10px] font-bold">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onNewGroup(); }}
              className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors text-text-muted hover:text-text-primary"
              title="New group"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNewChat(); }}
              className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors text-text-muted hover:text-text-primary"
              title="New chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('messages.searchConversations', 'Search conversations...')}
            className="input pl-9 py-2 text-sm"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="py-12"><LoadingCosmic label="Loading..." /></div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MessageCircle className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <p className="text-sm text-text-muted font-medium">{t('messages.noConversations', 'No conversations yet')}</p>
            <p className="text-xs text-text-muted mt-1">
              {t('messages.startNewChat')}
            </p>
            <button
              onClick={onNewChat}
              className="btn-primary text-sm mt-4"
            >
              {t('messages.startChat', 'Start a Chat')}
            </button>
          </div>
        ) : (
          conversations.map(conv => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={activeConversationId === conv.id}
              isTyping={typingUsers[conv.id] ? Date.now() - typingUsers[conv.id] < 3000 : false}
              myId={myId}
              onSelect={() => onSelect(conv.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleConvMenu(showConvMenu === conv.id ? null : conv.id);
              }}
              showMenu={showConvMenu === conv.id}
              onPin={() => onPin(conv.id, !!conv.is_pinned)}
              onMute={() => onMute(conv.id, !!conv.is_muted)}
              onArchive={() => onArchive(conv.id)}
              onLeave={() => onLeave(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
