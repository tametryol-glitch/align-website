// ═══════════════════════════════════════════════════════════════════
// Messages Store — Zustand state for conversations & messaging
// Mirrors mobile socialStore's messaging slice + active thread state
// ═══════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import type { Conversation, Message } from '@/lib/messagingService';

interface MessagesState {
  // Conversation list
  conversations: Conversation[];
  conversationsLoading: boolean;
  totalUnreadMessages: number;

  // Active thread
  activeConversationId: string | null;
  messages: Message[];
  messagesLoading: boolean;
  hasMore: boolean; // for pagination

  // Typing
  typingUsers: Record<string, number>; // conversationId → timestamp

  // Online presence (for active conversation)
  onlineUserIds: string[];

  // Other user read cursor (for active conversation)
  otherReadAt: string | null;

  // UI state
  replyTo: Message | null;
  editingMessage: Message | null;
  searchQuery: string;
  messageSearchQuery: string;
  showNewChatModal: boolean;
  showGroupModal: boolean;

  // Setters
  setConversations: (conversations: Conversation[]) => void;
  setConversationsLoading: (loading: boolean) => void;
  setTotalUnreadMessages: (count: number) => void;

  setActiveConversationId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (message: Message) => void;
  removeMessage: (messageId: string) => void;
  prependMessages: (messages: Message[]) => void;
  setMessagesLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;

  setTypingUser: (conversationId: string) => void;
  clearTypingUser: (conversationId: string) => void;
  setOnlineUserIds: (ids: string[]) => void;
  setOtherReadAt: (readAt: string | null) => void;

  setReplyTo: (message: Message | null) => void;
  setEditingMessage: (message: Message | null) => void;
  setSearchQuery: (query: string) => void;
  setMessageSearchQuery: (query: string) => void;
  setShowNewChatModal: (show: boolean) => void;
  setShowGroupModal: (show: boolean) => void;

  // Optimistic updates
  updateConversationPreview: (conversationId: string, preview: string, senderId: string) => void;
  decrementUnread: (conversationId: string) => void;
  togglePinOptimistic: (conversationId: string) => void;
  toggleMuteOptimistic: (conversationId: string) => void;
  toggleArchiveOptimistic: (conversationId: string) => void;

  // Reset
  resetMessages: () => void;
}

const initialState = {
  conversations: [],
  conversationsLoading: false,
  totalUnreadMessages: 0,
  activeConversationId: null,
  messages: [],
  messagesLoading: false,
  hasMore: true,
  typingUsers: {},
  onlineUserIds: [],
  otherReadAt: null,
  replyTo: null,
  editingMessage: null,
  searchQuery: '',
  messageSearchQuery: '',
  showNewChatModal: false,
  showGroupModal: false,
};

export const useMessagesStore = create<MessagesState>((set) => ({
  ...initialState,

  setConversations: (conversations) => set({ conversations }),
  setConversationsLoading: (conversationsLoading) => set({ conversationsLoading }),
  setTotalUnreadMessages: (totalUnreadMessages) => set({ totalUnreadMessages }),

  setActiveConversationId: (activeConversationId) => set({
    activeConversationId,
    messages: [],
    messagesLoading: true,
    hasMore: true,
    replyTo: null,
    editingMessage: null,
    messageSearchQuery: '',
    otherReadAt: null,
    onlineUserIds: [],
  }),

  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => {
    // Dedupe — don't add if already exists
    if (state.messages.some(m => m.id === message.id)) {
      return state;
    }
    return { messages: [...state.messages, message] };
  }),
  updateMessage: (message) => set((state) => ({
    messages: state.messages.map(m => m.id === message.id ? { ...m, ...message } : m),
  })),
  removeMessage: (messageId) => set((state) => ({
    messages: state.messages.filter(m => m.id !== messageId),
  })),
  prependMessages: (newMessages) => set((state) => {
    const existingIds = new Set(state.messages.map(m => m.id));
    const filtered = newMessages.filter(m => !existingIds.has(m.id));
    return { messages: [...filtered, ...state.messages] };
  }),
  setMessagesLoading: (messagesLoading) => set({ messagesLoading }),
  setHasMore: (hasMore) => set({ hasMore }),

  setTypingUser: (conversationId) => set((state) => ({
    typingUsers: { ...state.typingUsers, [conversationId]: Date.now() },
  })),
  clearTypingUser: (conversationId) => set((state) => {
    const next = { ...state.typingUsers };
    delete next[conversationId];
    return { typingUsers: next };
  }),
  setOnlineUserIds: (onlineUserIds) => set({ onlineUserIds }),
  setOtherReadAt: (otherReadAt) => set({ otherReadAt }),

  setReplyTo: (replyTo) => set({ replyTo, editingMessage: null }),
  setEditingMessage: (editingMessage) => set({ editingMessage, replyTo: null }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setMessageSearchQuery: (messageSearchQuery) => set({ messageSearchQuery }),
  setShowNewChatModal: (showNewChatModal) => set({ showNewChatModal }),
  setShowGroupModal: (showGroupModal) => set({ showGroupModal }),

  updateConversationPreview: (conversationId, preview, senderId) => set((state) => ({
    conversations: state.conversations.map(c =>
      c.id === conversationId
        ? { ...c, last_message_preview: preview, last_message_at: new Date().toISOString(), last_message_sender_id: senderId }
        : c
    ).sort((a, b) => {
      const at = a.last_message_at || a.created_at || '';
      const bt = b.last_message_at || b.created_at || '';
      return at < bt ? 1 : -1;
    }),
  })),

  decrementUnread: (conversationId) => set((state) => {
    const conv = state.conversations.find(c => c.id === conversationId);
    const removed = conv?.unread_count || 0;
    return {
      conversations: state.conversations.map(c =>
        c.id === conversationId ? { ...c, unread_count: 0 } : c
      ),
      totalUnreadMessages: Math.max(0, state.totalUnreadMessages - removed),
    };
  }),

  togglePinOptimistic: (conversationId) => set((state) => ({
    conversations: state.conversations.map(c =>
      c.id === conversationId ? { ...c, is_pinned: !c.is_pinned } : c
    ),
  })),

  toggleMuteOptimistic: (conversationId) => set((state) => ({
    conversations: state.conversations.map(c =>
      c.id === conversationId ? { ...c, is_muted: !c.is_muted } : c
    ),
  })),

  toggleArchiveOptimistic: (conversationId) => set((state) => ({
    conversations: state.conversations.map(c =>
      c.id === conversationId ? { ...c, is_archived: !c.is_archived } : c
    ),
  })),

  resetMessages: () => set(initialState),
}));
