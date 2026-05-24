'use client';

import { useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import {
  ArrowLeft, Search, ChevronDown, Settings2,
} from 'lucide-react';
import { CallButton } from '@/components/chat/CallButton';
import { MessageBubble } from './MessageBubble';
import type { ChatTheme } from '@/data/chatThemes';
import type { Message, Conversation } from '@/lib/messagingService';

// ── Helpers ──────────────────────────────────────────────────────────

function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000 && d.getDate() === now.getDate()) return 'Today';
  if (diff < 172800000) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

// ── Types ────────────────────────────────────────────────────────────

export interface MessageThreadProps {
  activeConv: Conversation;
  messages: Message[];
  messagesLoading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  isOtherTyping: boolean;
  chatTheme: ChatTheme | null;
  currentUserId: string;
  otherReadAt: string | null;
  messageSearchQuery: string;
  callState: string;
  showScrollDown: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  onBack: () => void;
  onScroll: () => void;
  onLoadMore: () => void;
  onReaction: (msgId: string, emoji: string) => void;
  onReply: (msg: Message) => void;
  onContextMenu: (msg: Message, x: number, y: number) => void;
  onPollVote: (messageId: string, optionIndex: number) => void;
  onMessageSearchChange: (query: string) => void;
  onCallStart: (type: 'voice' | 'video') => void;
  onGroupSettings: () => void;
  onOpenReactionPicker: (msg: Message) => void;
}

export function MessageThread({
  activeConv, messages, messagesLoading, hasMore, loadingMore,
  isOtherTyping, chatTheme, currentUserId, otherReadAt,
  messageSearchQuery, callState, showScrollDown,
  messagesEndRef, messagesContainerRef,
  onBack, onScroll, onLoadMore, onReaction, onReply, onContextMenu,
  onPollVote, onMessageSearchChange, onCallStart, onGroupSettings,
  onOpenReactionPicker,
}: MessageThreadProps) {
  const { t } = useTranslation();

  // Date headers
  const messagesWithHeaders = useMemo(() => {
    const result: Array<{ type: 'header'; date: string } | { type: 'message'; message: Message }> = [];
    let lastDate = '';
    for (const msg of messages) {
      const d = new Date(msg.created_at).toDateString();
      if (d !== lastDate) {
        result.push({ type: 'header', date: msg.created_at });
        lastDate = d;
      }
      result.push({ type: 'message', message: msg });
    }
    return result;
  }, [messages]);

  // Read receipts
  const isOtherRead = useCallback((msg: Message) => {
    if (!otherReadAt || msg.sender_id !== currentUserId) return false;
    return new Date(otherReadAt) >= new Date(msg.created_at);
  }, [otherReadAt, currentUserId]);

  // Scroll to a specific message (for reply jump)
  function scrollToMessage(messageId: string) {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-accent-primary', 'ring-opacity-50');
      setTimeout(() => el.classList.remove('ring-2', 'ring-accent-primary', 'ring-opacity-50'), 2000);
    }
  }

  return (
    <>
      {/* Chat header */}
      <div className="flex items-center gap-3 p-4 border-b border-border-primary">
        <button
          onClick={onBack}
          className="sm:hidden p-1 text-text-muted hover:text-text-primary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative">
          <UserAvatar
            avatarUrl={activeConv.other_user_avatar}
            displayName={activeConv.other_user_name}
            size="sm"
          />
          {activeConv.other_user_online && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-bg-card" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">
            {activeConv.is_group ? activeConv.group_name : activeConv.other_user_name}
            {activeConv.is_group && (
              <span className="text-xs text-text-muted ml-1">({activeConv.member_count || 'group'})</span>
            )}
          </p>
          <p className="text-[10px] text-text-muted">
            {isOtherTyping ? (
              <span className="text-accent-primary">{t('messages.typing', 'typing...')}</span>
            ) : activeConv.other_user_online ? (
              <span className="text-green-400">{t('messages.online', 'online')}</span>
            ) : null}
          </p>
        </div>
        {/* Message search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            value={messageSearchQuery}
            onChange={(e) => onMessageSearchChange(e.target.value)}
            placeholder={t('messages.searchMessages', 'Search messages...')}
            className="bg-bg-tertiary border border-border-primary rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted w-48 focus:outline-none focus:border-accent-primary"
          />
        </div>
        {/* Call buttons */}
        {!activeConv.is_group && (
          <CallButton
            targetUserId={activeConv.other_user_id || ''}
            targetUserName={activeConv.other_user_name}
            targetUserAvatar={activeConv.other_user_avatar || undefined}
            onCallStart={onCallStart}
            disabled={callState !== 'idle'}
          />
        )}
        {/* Group settings */}
        {activeConv.is_group && (
          <button
            onClick={onGroupSettings}
            className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-text-muted hover:text-accent-primary hover:bg-accent-primary/15 transition-colors"
            title="Group settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto px-4 py-3 relative"
        style={chatTheme ? { background: `linear-gradient(135deg, ${chatTheme.background[0]}, ${chatTheme.background[1]})` } : undefined}
      >
        {/* Load more indicator */}
        {loadingMore && (
          <div className="text-center py-2">
            <span className="text-xs text-text-muted">{t('messages.loadingOlder', 'Loading older messages...')}</span>
          </div>
        )}
        {hasMore && !loadingMore && messages.length > 0 && (
          <button
            onClick={onLoadMore}
            className="w-full text-center py-2 text-xs text-accent-primary hover:text-accent-secondary"
          >
            {t('messages.loadEarlier', 'Load earlier messages')}
          </button>
        )}

        {messagesLoading ? (
          <div className="py-12"><LoadingCosmic label={t('messages.loadingMessages', 'Loading messages...')} /></div>
        ) : (
          <div className="space-y-1">
            {messagesWithHeaders.map((item, idx) => {
              if (item.type === 'header') {
                return (
                  <div key={`h-${idx}`} className="flex items-center justify-center py-3">
                    <span className="px-3 py-1 rounded-full bg-bg-tertiary text-[10px] text-text-muted font-medium">
                      {formatDateHeader(item.date)}
                    </span>
                  </div>
                );
              }
              const msg = item.message;
              const isMine = msg.sender_id === currentUserId;
              const read = isMine && isOtherRead(msg);

              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isMine={isMine}
                  isGroup={!!activeConv.is_group}
                  read={read}
                  otherReadAt={otherReadAt}
                  chatTheme={chatTheme}
                  currentUserId={currentUserId}
                  onReaction={onReaction}
                  onOpenReactionPicker={onOpenReactionPicker}
                  onReply={onReply}
                  onContextMenu={onContextMenu}
                  onPollVote={onPollVote}
                  onScrollToMessage={scrollToMessage}
                />
              );
            })}
          </div>
        )}

        {/* Typing indicator */}
        {isOtherTyping && (
          <div className="flex items-center gap-2 py-2">
            <UserAvatar
              avatarUrl={activeConv.other_user_avatar}
              displayName={activeConv.other_user_name}
              size="xs"
            />
            <div className="bg-bg-tertiary rounded-2xl rounded-bl-md px-4 py-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollDown && (
        <button
          onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-24 right-8 p-2 rounded-full bg-bg-tertiary border border-border-primary shadow-lg hover:bg-bg-secondary transition-colors"
        >
          <ChevronDown className="w-4 h-4 text-text-primary" />
        </button>
      )}
    </>
  );
}
