'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useMessagesStore } from '@/stores/messagesStore';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import {
  MessageCircle, Send, ArrowLeft, Search, Plus, Users, X,
  MoreVertical, Pin, BellOff, Archive, Trash2, Pencil, Reply,
  SmilePlus, Check, CheckCheck, Image as ImageIcon, ChevronDown,
  Forward, Settings2, Smile,
} from 'lucide-react';
import { GifStickerPicker } from '@/components/chat/GifStickerPicker';
import { VoiceRecorder } from '@/components/chat/VoiceRecorder';
import { AttachmentMenu } from '@/components/chat/AttachmentMenu';
import { PollCreator } from '@/components/chat/PollCreator';
import { VoiceMessageBubble } from '@/components/chat/VoiceMessageBubble';
import { VideoMessageBubble } from '@/components/chat/VideoMessageBubble';
import { FileBubble } from '@/components/chat/FileBubble';
import { LocationBubble } from '@/components/chat/LocationBubble';
import { PollBubble } from '@/components/chat/PollBubble';
import { CallButton } from '@/components/chat/CallButton';
import { CallScreen } from '@/components/chat/CallScreen';
import { GroupSettingsModal } from '@/components/chat/GroupSettingsModal';
import { ForwardMessageModal } from '@/components/chat/ForwardMessageModal';
import { LocationPicker } from '@/components/chat/LocationPicker';
import { uploadChatFile, uploadVoiceNote } from '@/lib/chatMediaService';
import { generateChannelName, fetchAgoraToken, createCallClient, type CallState } from '@/lib/callingService';
import { sendCallSignal, generateSessionId } from '@/lib/callSignalingService';
import { useCallStore } from '@/stores/callStore';
import {
  getConversations,
  getMessages,
  sendMessage as sendMsg,
  markAsRead,
  deleteMessage,
  editMessage,
  subscribeToMessages,
  subscribeToConversations,
  sendTypingIndicator,
  subscribeToTyping,
  subscribeToPresence,
  getOtherUserReadAt,
  addReaction,
  getReactionsFromMessage,
  getOrCreateConversation,
  createGroupConversation,
  togglePinConversation,
  toggleMuteConversation,
  toggleArchiveConversation,
  leaveConversation,
  searchUsers,
  getFriends,
  getTotalUnreadCount,
  uploadChatImage,
  type Message,
  type Conversation,
} from '@/lib/messagingService';

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

function formatMessageTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000 && d.getDate() === now.getDate()) return 'Today';
  if (diff < 172800000) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

const QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '🙏', '🔥'];

// ── Main Component ───────────────────────────────────────────────────

export default function MessagesPage() {
  const { user } = useAuthStore();
  const store = useMessagesStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ message: Message; x: number; y: number } | null>(null);
  const [reactionPicker, setReactionPicker] = useState<Message | null>(null);
  const [showConvMenu, setShowConvMenu] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  // New feature state
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const fileUploadRef = useRef<HTMLInputElement>(null);

  // Call state
  const [callState, setCallState] = useState<CallState>('idle');
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [callIsOutgoing, setCallIsOutgoing] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callMuted, setCallMuted] = useState(false);
  const [callCameraOn, setCallCameraOn] = useState(true);
  // Call store selectors (global listener handles incoming calls)
  const pendingAcceptedCall = useCallStore((s) => s.pendingAcceptedCall);
  const activeSignal = useCallStore((s) => s.activeSignal);
  const clearPendingCall = useCallStore((s) => s.setPendingAcceptedCall);

  const callClientRef = useRef<ReturnType<typeof createCallClient> | null>(null);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const callSessionRef = useRef<{ channelName: string; sessionId: string; otherId: string; callType: 'voice' | 'video' } | null>(null);
  const lastProcessedSignalTs = useRef(0);

  // Active conversation from store
  const activeConv = useMemo(() => {
    if (!store.activeConversationId) return null;
    return store.conversations.find(c => c.id === store.activeConversationId) || null;
  }, [store.activeConversationId, store.conversations]);

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    let convos = store.conversations.filter(c => !c.is_archived);
    if (store.searchQuery) {
      const q = store.searchQuery.toLowerCase();
      convos = convos.filter(c =>
        c.other_user_name.toLowerCase().includes(q) ||
        (c.group_name || '').toLowerCase().includes(q) ||
        c.last_message_preview.toLowerCase().includes(q)
      );
    }
    // Pinned first
    return convos.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return 0;
    });
  }, [store.conversations, store.searchQuery]);

  // Messages filtered by search
  const displayMessages = useMemo(() => {
    if (!store.messageSearchQuery) return store.messages;
    const q = store.messageSearchQuery.toLowerCase();
    return store.messages.filter(m => m.content.toLowerCase().includes(q));
  }, [store.messages, store.messageSearchQuery]);

  // Date headers
  const messagesWithHeaders = useMemo(() => {
    const result: Array<{ type: 'header'; date: string } | { type: 'message'; message: Message }> = [];
    let lastDate = '';
    for (const msg of displayMessages) {
      const d = new Date(msg.created_at).toDateString();
      if (d !== lastDate) {
        result.push({ type: 'header', date: msg.created_at });
        lastDate = d;
      }
      result.push({ type: 'message', message: msg });
    }
    return result;
  }, [displayMessages]);

  // ── Load conversations on mount ──
  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  async function loadConversations() {
    store.setConversationsLoading(true);
    const convos = await getConversations();
    store.setConversations(convos);
    store.setConversationsLoading(false);
    const unread = await getTotalUnreadCount();
    store.setTotalUnreadMessages(unread);
  }

  // ── Subscribe to inbox updates ──
  useEffect(() => {
    if (!user) return;
    const sub = subscribeToConversations(() => {
      // Refresh conversations list on any update
      loadConversations();
    });
    return () => sub.unsubscribe();
  }, [user]);

  // ── Load messages when active conversation changes ──
  useEffect(() => {
    if (!store.activeConversationId) return;
    loadThreadMessages(store.activeConversationId);

    // Mark as read
    markAsRead(store.activeConversationId);
    store.decrementUnread(store.activeConversationId);

    // Get read status
    getOtherUserReadAt(store.activeConversationId).then(readAt => {
      store.setOtherReadAt(readAt);
    });
  }, [store.activeConversationId]);

  async function loadThreadMessages(convId: string) {
    store.setMessagesLoading(true);
    const msgs = await getMessages(convId, 50);
    store.setMessages(msgs);
    store.setHasMore(msgs.length >= 50);
    store.setMessagesLoading(false);
    // Scroll to bottom after load
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 100);
  }

  // ── Load more (pagination) ──
  async function loadMoreMessages() {
    if (!store.activeConversationId || loadingMore || !store.hasMore) return;
    setLoadingMore(true);
    const oldest = store.messages[0];
    if (!oldest) { setLoadingMore(false); return; }

    const container = messagesContainerRef.current;
    const scrollHeightBefore = container?.scrollHeight || 0;

    const older = await getMessages(store.activeConversationId, 50, oldest.created_at);
    store.prependMessages(older);
    store.setHasMore(older.length >= 50);
    setLoadingMore(false);

    // Maintain scroll position
    requestAnimationFrame(() => {
      if (container) {
        const scrollHeightAfter = container.scrollHeight;
        container.scrollTop = scrollHeightAfter - scrollHeightBefore;
      }
    });
  }

  // ── Realtime message subscription ──
  useEffect(() => {
    if (!store.activeConversationId || !user) return;
    const sub = subscribeToMessages(store.activeConversationId, (msg) => {
      if (msg._event === 'UPDATE') {
        store.updateMessage(msg);
      } else if (msg.sender_id !== user.id) {
        store.addMessage(msg);
        // Mark as read since we're viewing the conversation
        markAsRead(store.activeConversationId!);
        // Scroll to bottom if near bottom
        const container = messagesContainerRef.current;
        if (container) {
          const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
          if (nearBottom) {
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
          }
        }
      }
    });
    return () => sub.unsubscribe();
  }, [store.activeConversationId, user]);

  // ── Typing indicator subscription ──
  useEffect(() => {
    if (!store.activeConversationId) return;
    const sub = subscribeToTyping(store.activeConversationId, (userId) => {
      store.setTypingUser(store.activeConversationId!);
      // Clear after 3 seconds
      setTimeout(() => {
        store.clearTypingUser(store.activeConversationId!);
      }, 3000);
    });
    return () => sub.unsubscribe();
  }, [store.activeConversationId]);

  // ── Presence subscription ──
  useEffect(() => {
    if (!store.activeConversationId) return;
    const sub = subscribeToPresence(store.activeConversationId, (ids) => {
      store.setOnlineUserIds(ids);
    });
    return () => sub.unsubscribe();
  }, [store.activeConversationId]);

  // ── Scroll detection ──
  function handleScroll() {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Load more when scrolled near top
    if (container.scrollTop < 100 && store.hasMore && !loadingMore) {
      loadMoreMessages();
    }

    // Show/hide scroll-to-bottom button
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 300;
    setShowScrollDown(!nearBottom);
  }

  // ── Send message ──
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !store.activeConversationId || (!newMessage.trim() && !store.editingMessage)) return;

    // Edit mode
    if (store.editingMessage) {
      const success = await editMessage(store.editingMessage.id, editText);
      if (success) {
        store.updateMessage({ ...store.editingMessage, content: editText, is_edited: true });
        store.setEditingMessage(null);
        setEditText('');
      }
      return;
    }

    setSending(true);
    const content = newMessage.trim();
    const replyToId = store.replyTo?.id;
    setNewMessage('');
    store.setReplyTo(null);

    // Optimistic update
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: store.activeConversationId,
      sender_id: user.id,
      content,
      type: 'text',
      metadata: {},
      reply_to: replyToId || null,
      is_edited: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sender_name: 'You',
      sender_avatar: undefined,
      reply_message: store.replyTo || undefined,
    };
    store.addMessage(optimistic);
    store.updateConversationPreview(store.activeConversationId, content, user.id);

    // Scroll to bottom
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    const result = await sendMsg(store.activeConversationId, content, 'text', {}, replyToId);
    if (result.success && result.message) {
      store.updateMessage({ ...result.message, id: result.message.id });
      // Remove optimistic
      store.removeMessage(optimistic.id);
      store.addMessage(result.message);
    }
    setSending(false);
    inputRef.current?.focus();
  }

  // ── Image send ──
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !store.activeConversationId || !user) return;

    setSending(true);
    const url = await uploadChatImage(store.activeConversationId, file);
    if (url) {
      const result = await sendMsg(store.activeConversationId, url, 'image', { url });
      if (result.success && result.message) {
        store.addMessage(result.message);
        store.updateConversationPreview(store.activeConversationId, '📷 Image', user.id);
      }
    }
    setSending(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  // ── Typing indicator ──
  function handleInputChange(value: string) {
    setNewMessage(value);
    if (store.activeConversationId && value.trim()) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      sendTypingIndicator(store.activeConversationId);
      typingTimeoutRef.current = setTimeout(() => {}, 2000);
    }
  }

  // ── Context menu actions ──
  async function handleDelete(msgId: string) {
    const success = await deleteMessage(msgId);
    if (success) store.removeMessage(msgId);
    setContextMenu(null);
  }

  function handleEdit(msg: Message) {
    store.setEditingMessage(msg);
    setEditText(msg.content);
    setContextMenu(null);
    inputRef.current?.focus();
  }

  function handleReply(msg: Message) {
    store.setReplyTo(msg);
    setContextMenu(null);
    inputRef.current?.focus();
  }

  async function handleReaction(msgId: string, emoji: string) {
    await addReaction(msgId, emoji);
    setReactionPicker(null);
    setContextMenu(null);
    // Refresh messages to show updated reactions
    if (store.activeConversationId) {
      const msgs = await getMessages(store.activeConversationId, 50);
      store.setMessages(msgs);
    }
  }

  // ── GIF / Sticker send ──
  async function handleGifSelect(url: string, _type: 'gif' | 'sticker') {
    if (!store.activeConversationId || !user) return;
    setShowGifPicker(false);
    const result = await sendMsg(store.activeConversationId, '', 'image', { url }, store.replyTo?.id);
    if (result.success && result.message) {
      store.addMessage(result.message);
      store.updateConversationPreview(store.activeConversationId, '📷 GIF', user.id);
    }
    store.setReplyTo(null);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  // ── Voice note send ──
  async function handleVoiceComplete(blob: Blob, duration: number) {
    if (!store.activeConversationId || !user) return;
    setSending(true);
    const uploadResult = await uploadVoiceNote(store.activeConversationId, blob, duration);
    if (uploadResult) {
      const msgResult = await sendMsg(store.activeConversationId, '', 'voice_note', { url: uploadResult.url, duration: uploadResult.duration }, store.replyTo?.id);
      if (msgResult.success && msgResult.message) {
        store.addMessage(msgResult.message);
        store.updateConversationPreview(store.activeConversationId, '🎤 Voice message', user.id);
      }
      store.setReplyTo(null);
    }
    setSending(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  // ── File upload (any type) ──
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !store.activeConversationId || !user) return;
    setSending(true);
    const uploadResult = await uploadChatFile(store.activeConversationId, file);
    if (uploadResult) {
      const msgResult = await sendMsg(store.activeConversationId, file.name, 'file', { url: uploadResult.url, filename: file.name, size: file.size, mime_type: file.type }, store.replyTo?.id);
      if (msgResult.success && msgResult.message) {
        store.addMessage(msgResult.message);
        store.updateConversationPreview(store.activeConversationId, `📎 ${file.name}`, user.id);
      }
      store.setReplyTo(null);
    }
    setSending(false);
    if (fileUploadRef.current) fileUploadRef.current.value = '';
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  // ── Location send ──
  async function handleLocationSelected(location: { latitude: number; longitude: number; address?: string }) {
    if (!store.activeConversationId || !user) return;
    setShowLocationPicker(false);
    const result = await sendMsg(store.activeConversationId, location.address || 'Shared location', 'location', location, store.replyTo?.id);
    if (result.success && result.message) {
      store.addMessage(result.message);
      store.updateConversationPreview(store.activeConversationId, '📍 Location', user.id);
    }
    store.setReplyTo(null);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  // ── Poll create ──
  async function handleCreatePoll(question: string, options: string[]) {
    if (!store.activeConversationId || !user) return;
    setShowPollCreator(false);
    const pollOptions = options.map(text => ({ text, votes: [] as string[] }));
    const result = await sendMsg(store.activeConversationId, `Poll: ${question}`, 'poll', { question, options: pollOptions }, store.replyTo?.id);
    if (result.success && result.message) {
      store.addMessage(result.message);
      store.updateConversationPreview(store.activeConversationId, `📊 Poll: ${question}`, user.id);
    }
    store.setReplyTo(null);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  // ── Poll vote ──
  async function handlePollVote(messageId: string, optionIndex: number) {
    if (!user) return;
    const msg = store.messages.find(m => m.id === messageId);
    if (!msg?.metadata?.options) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options = (msg.metadata.options as any[]).map((opt, i) => {
      const votes = (opt.votes || []).filter((v: string) => v !== user.id);
      if (i === optionIndex) votes.push(user.id);
      return { ...opt, votes };
    });
    await editMessage(messageId, msg.content);
    // Optimistic update for metadata
    store.updateMessage({ ...msg, metadata: { ...msg.metadata, options } });
  }

  // ── Forward message ──
  async function handleForwardMessage(conversationId: string) {
    if (!forwardMessage || !user) return;
    const result = await sendMsg(conversationId, forwardMessage.content, forwardMessage.type as 'text', forwardMessage.metadata || undefined);
    if (result.success && result.message) {
      // Only add to visible messages if forwarding into the active conversation
      if (conversationId === store.activeConversationId) {
        store.addMessage(result.message);
      }
      store.updateConversationPreview(conversationId, forwardMessage.content, user.id);
    }
    setForwardMessage(null);
  }

  // ── Agora connection helper (used by both caller and callee) ──
  async function connectToAgoraCall(channelName: string, type: 'voice' | 'video') {
    try {
      setCallState('connecting');

      const client = createCallClient();
      callClientRef.current = client;

      // Numeric UID for Agora (derived from timestamp to keep it unique)
      const uid = Math.floor(Math.random() * 100000) + 1;

      const token = await fetchAgoraToken(channelName, uid);
      if (!token) {
        console.warn('[Call] Failed to get Agora token');
        handleEndCall();
        return;
      }

      // Remote user joins → call is active
      client.onRemoteUserJoined(() => {
        setCallState('active');
        setCallDuration(0);
        callTimerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);

        // Render remote video if video call
        if (type === 'video') {
          setTimeout(() => {
            const track = client.getRemoteVideoTrack();
            if (track && remoteVideoRef.current) {
              track.play(remoteVideoRef.current);
            }
          }, 500);
        }
      });

      client.onRemoteUserLeft(() => {
        handleEndCall();
      });

      const joined = await client.join(channelName, token, uid);
      if (!joined) {
        console.warn('[Call] Failed to join Agora channel');
        handleEndCall();
        return;
      }

      // If video call, enable camera and render local preview
      if (type === 'video') {
        await client.toggleCamera();
        setCallCameraOn(true);
        setTimeout(() => {
          const localTrack = client.getLocalVideoTrack();
          if (localTrack && localVideoRef.current) {
            localTrack.play(localVideoRef.current);
          }
        }, 500);
      }
    } catch (err) {
      console.error('[Call] connectToAgoraCall error:', err);
      handleEndCall();
    }
  }

  // ── React to call signals forwarded by GlobalCallListener ──
  // (incoming-call and call-cancelled are handled globally;
  //  call-response and call-ended are forwarded via callStore)
  useEffect(() => {
    if (!activeSignal || activeSignal._ts <= lastProcessedSignalTs.current) return;
    lastProcessedSignalTs.current = activeSignal._ts;

    switch (activeSignal.type) {
      case 'call-response':
        if (activeSignal.accepted && callSessionRef.current && activeSignal.sessionId === callSessionRef.current.sessionId) {
          // Other user accepted — connect to Agora
          connectToAgoraCall(callSessionRef.current.channelName, callSessionRef.current.callType);
        } else if (!activeSignal.accepted && callSessionRef.current && activeSignal.sessionId === callSessionRef.current.sessionId) {
          // Other user declined
          callSessionRef.current = null;
          setCallState('ended');
          setTimeout(() => setCallState('idle'), 2000);
        }
        break;

      case 'call-ended':
        if (callSessionRef.current && activeSignal.sessionId === callSessionRef.current.sessionId) {
          handleEndCall();
        }
        break;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSignal]);

  // ── Pick up pending accepted calls from GlobalCallListener ──
  useEffect(() => {
    if (!pendingAcceptedCall || !user) return;

    (async () => {
      // Ensure the conversation with the caller is open so CallScreen renders
      const convId = await getOrCreateConversation(pendingAcceptedCall.callerId);
      if (convId) {
        await loadConversations();
        store.setActiveConversationId(convId);
      }

      // Set up call state
      setCallType(pendingAcceptedCall.callType);
      setCallIsOutgoing(false);
      setCallDuration(0);
      setCallMuted(false);
      setCallCameraOn(pendingAcceptedCall.callType === 'video');

      callSessionRef.current = {
        channelName: pendingAcceptedCall.channelName,
        sessionId: pendingAcceptedCall.sessionId,
        otherId: pendingAcceptedCall.callerId,
        callType: pendingAcceptedCall.callType,
      };

      // Connect to Agora
      connectToAgoraCall(pendingAcceptedCall.channelName, pendingAcceptedCall.callType);

      // Clear the pending call
      clearPendingCall(null);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAcceptedCall, user]);

  // ── Call initiation ──
  async function handleCallStart(type: 'voice' | 'video') {
    if (!user || !activeConv) return;
    const otherId = activeConv.other_user_id;
    if (!otherId) return;

    setCallType(type);
    setCallIsOutgoing(true);
    setCallState('ringing');
    setCallDuration(0);
    setCallMuted(false);
    setCallCameraOn(type === 'video');

    const channelName = generateChannelName(user.id, otherId);
    const sessionId = generateSessionId();

    // Store session info so the signal-response handler can connect
    callSessionRef.current = { channelName, sessionId, otherId, callType: type };

    // Send call signal to other user
    sendCallSignal(otherId, {
      type: 'incoming-call',
      callerId: user.id,
      callerName: user.user_metadata?.display_name || 'User',
      callType: type,
      channelName,
      sessionId,
    });

    // Also send push notification for mobile users
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (apiUrl) {
        fetch(`${apiUrl}/agora/signal-call`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caller_id: user.id,
            caller_name: user.user_metadata?.display_name || 'User',
            receiver_id: otherId,
            channel_name: channelName,
            call_type: type,
            session_id: sessionId,
          }),
        }).catch(() => {}); // fire-and-forget
      }
    } catch {}

    // Auto-cancel after 30 seconds if no answer
    setTimeout(() => {
      setCallState(prev => {
        if (prev === 'ringing') {
          sendCallSignal(otherId, { type: 'call-cancelled', sessionId });
          callSessionRef.current = null;
          setTimeout(() => setCallState('idle'), 3000);
          return 'ended';
        }
        return prev;
      });
    }, 30000);
  }

  async function handleEndCall() {
    // Send end signal FIRST
    if (callSessionRef.current) {
      sendCallSignal(callSessionRef.current.otherId, {
        type: 'call-ended',
        sessionId: callSessionRef.current.sessionId,
      });
      callSessionRef.current = null;
    }

    const client = callClientRef.current;
    callClientRef.current = null; // prevent double-cleanup
    if (client) {
      try {
        await client.leave();
        await client.destroy();
      } catch { /* best effort cleanup */ }
    }
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setCallState('ended');
    setTimeout(() => setCallState('idle'), 3000);
  }

  function handleCallToggleMute() {
    if (callClientRef.current) {
      callClientRef.current.toggleMute();
      setCallMuted(prev => !prev);
    }
  }

  async function handleCallToggleCamera() {
    if (!callClientRef.current) return;
    const wasOn = callClientRef.current.isCameraOn();
    await callClientRef.current.toggleCamera();
    const isNowOn = callClientRef.current.isCameraOn();
    setCallCameraOn(isNowOn);

    // When camera turns back on, a NEW video track is created.
    // We must play it into the local PiP element or it stays black.
    if (!wasOn && isNowOn) {
      setTimeout(() => {
        const localTrack = callClientRef.current?.getLocalVideoTrack();
        if (localTrack && localVideoRef.current) {
          localTrack.play(localVideoRef.current);
        }
      }, 300);
    }
  }

  // ── Conversation actions ──
  async function handleTogglePin(convId: string, currentlyPinned: boolean) {
    store.togglePinOptimistic(convId);
    await togglePinConversation(convId, !currentlyPinned);
    setShowConvMenu(null);
  }

  async function handleToggleMute(convId: string, currentlyMuted: boolean) {
    store.toggleMuteOptimistic(convId);
    await toggleMuteConversation(convId, !currentlyMuted);
    setShowConvMenu(null);
  }

  async function handleArchive(convId: string) {
    store.toggleArchiveOptimistic(convId);
    await toggleArchiveConversation(convId, true);
    if (store.activeConversationId === convId) {
      store.setActiveConversationId(null);
    }
    setShowConvMenu(null);
  }

  async function handleLeave(convId: string) {
    await leaveConversation(convId);
    store.setConversations(store.conversations.filter(c => c.id !== convId));
    if (store.activeConversationId === convId) {
      store.setActiveConversationId(null);
    }
    setShowConvMenu(null);
  }

  // ── Open chat with user ──
  async function openChatWithUser(userId: string) {
    const convId = await getOrCreateConversation(userId);
    if (convId) {
      store.setShowNewChatModal(false);
      await loadConversations();
      store.setActiveConversationId(convId);
    }
  }

  // ── Read receipts ──
  const isOtherRead = useCallback((msg: Message) => {
    if (!store.otherReadAt || msg.sender_id !== user?.id) return false;
    return new Date(store.otherReadAt) >= new Date(msg.created_at);
  }, [store.otherReadAt, user?.id]);

  // ── Typing state for active conversation ──
  const isOtherTyping = store.activeConversationId
    ? (store.typingUsers[store.activeConversationId] && Date.now() - store.typingUsers[store.activeConversationId] < 3000)
    : false;

  // ── Close context menus on click outside ──
  useEffect(() => {
    function handleClick() {
      setContextMenu(null);
      setReactionPicker(null);
      setShowConvMenu(null);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto card text-center py-12">
        <MessageCircle className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <p className="text-text-muted">Sign in to access messages</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] min-h-[500px]">
      <div className="flex h-full gap-0 border border-border-primary rounded-2xl overflow-hidden bg-bg-card">
        {/* ───────────── LEFT: Conversation List ───────────── */}
        <div className={`w-full sm:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-border-primary ${
          store.activeConversationId ? 'hidden sm:flex' : 'flex'
        }`}>
          {/* Header */}
          <div className="p-4 border-b border-border-primary">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-accent-primary" />
                Messages
                {store.totalUnreadMessages > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-accent-primary text-white text-[10px] font-bold">
                    {store.totalUnreadMessages > 99 ? '99+' : store.totalUnreadMessages}
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); store.setShowGroupModal(true); }}
                  className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors text-text-muted hover:text-text-primary"
                  title="New group"
                >
                  <Users className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); store.setShowNewChatModal(true); }}
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
                value={store.searchQuery}
                onChange={(e) => store.setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="input pl-9 py-2 text-sm"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {store.conversationsLoading ? (
              <div className="py-12"><LoadingCosmic label="Loading..." /></div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageCircle className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-muted font-medium">No conversations yet</p>
                <p className="text-xs text-text-muted mt-1">
                  Start a new chat to connect with friends
                </p>
                <button
                  onClick={() => store.setShowNewChatModal(true)}
                  className="btn-primary text-sm mt-4"
                >
                  Start a Chat
                </button>
              </div>
            ) : (
              filteredConversations.map(conv => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={store.activeConversationId === conv.id}
                  isTyping={store.typingUsers[conv.id] ? Date.now() - store.typingUsers[conv.id] < 3000 : false}
                  myId={user.id}
                  onSelect={() => store.setActiveConversationId(conv.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowConvMenu(showConvMenu === conv.id ? null : conv.id);
                  }}
                  showMenu={showConvMenu === conv.id}
                  onPin={() => handleTogglePin(conv.id, !!conv.is_pinned)}
                  onMute={() => handleToggleMute(conv.id, !!conv.is_muted)}
                  onArchive={() => handleArchive(conv.id)}
                  onLeave={() => handleLeave(conv.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ───────────── RIGHT: Chat Area ───────────── */}
        <div className={`flex-1 flex flex-col min-w-0 ${
          store.activeConversationId ? 'flex' : 'hidden sm:flex'
        }`}>
          {activeConv ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 p-4 border-b border-border-primary">
                <button
                  onClick={() => store.setActiveConversationId(null)}
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
                      <span className="text-accent-primary">typing...</span>
                    ) : activeConv.other_user_online ? (
                      <span className="text-green-400">online</span>
                    ) : null}
                  </p>
                </div>
                {/* Message search */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                  <input
                    type="text"
                    value={store.messageSearchQuery}
                    onChange={(e) => store.setMessageSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="bg-bg-tertiary border border-border-primary rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted w-48 focus:outline-none focus:border-accent-primary"
                  />
                </div>
                {/* Call buttons */}
                {!activeConv.is_group && (
                  <CallButton
                    targetUserId={activeConv.other_user_id || ''}
                    targetUserName={activeConv.other_user_name}
                    targetUserAvatar={activeConv.other_user_avatar || undefined}
                    onCallStart={handleCallStart}
                    disabled={callState !== 'idle'}
                  />
                )}
                {/* Group settings */}
                {activeConv.is_group && (
                  <button
                    onClick={() => setShowGroupSettings(true)}
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
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 py-3"
              >
                {/* Load more indicator */}
                {loadingMore && (
                  <div className="text-center py-2">
                    <span className="text-xs text-text-muted">Loading older messages...</span>
                  </div>
                )}
                {store.hasMore && !loadingMore && store.messages.length > 0 && (
                  <button
                    onClick={loadMoreMessages}
                    className="w-full text-center py-2 text-xs text-accent-primary hover:text-accent-secondary"
                  >
                    Load earlier messages
                  </button>
                )}

                {store.messagesLoading ? (
                  <div className="py-12"><LoadingCosmic label="Loading messages..." /></div>
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
                      const isMine = msg.sender_id === user.id;
                      const reactions = getReactionsFromMessage(msg);
                      const hasReactions = Object.keys(reactions).length > 0;
                      const read = isMine && isOtherRead(msg);
                      const isLastMine = isMine && idx === messagesWithHeaders.length - 1;

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
                          key={msg.id}
                          className={`group flex items-end gap-2 py-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setContextMenu({ message: msg, x: e.clientX, y: e.clientY });
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
                            {!isMine && activeConv.is_group && (
                              <p className="text-[10px] text-text-muted mb-0.5 ml-1">{msg.sender_name}</p>
                            )}

                            {/* Reply preview */}
                            {msg.reply_to && msg.reply_message && (
                              <div className={`text-[10px] px-3 py-1.5 rounded-t-xl border-l-2 border-accent-primary bg-bg-tertiary/50 mb-0.5 ${
                                isMine ? 'ml-auto text-right' : ''
                              }`}>
                                <span className="text-accent-primary font-medium">{msg.reply_message.sender_name}</span>
                                <p className="text-text-muted truncate max-w-[200px]">{msg.reply_message.content}</p>
                              </div>
                            )}

                            {/* Message bubble */}
                            <div className={`px-3.5 py-2 rounded-2xl relative ${
                              isMine
                                ? 'bg-accent-primary text-white rounded-br-md'
                                : 'bg-bg-tertiary text-text-primary rounded-bl-md'
                            }`}>
                              {/* Image message */}
                              {msg.type === 'image' && msg.metadata?.url && (
                                <a href={msg.metadata.url} target="_blank" rel="noopener noreferrer" className="block mb-1">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={msg.metadata.url}
                                    alt="Shared image"
                                    className="rounded-lg max-w-full max-h-60 object-cover"
                                  />
                                </a>
                              )}

                              {/* Chart share */}
                              {msg.type === 'chart_share' && (
                                <div className="bg-white/10 rounded-lg p-2 mb-1">
                                  <p className="text-xs font-medium">Shared a chart</p>
                                  {msg.metadata?.chart_type && (
                                    <p className="text-[10px] opacity-70">{msg.metadata.chart_type}</p>
                                  )}
                                </div>
                              )}

                              {/* Voice note */}
                              {msg.type === 'voice_note' && msg.metadata?.url && (
                                <VoiceMessageBubble
                                  metadata={{ url: msg.metadata.url as string, duration: (msg.metadata.duration as number) || 0 }}
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

                              {/* File attachment */}
                              {msg.type === 'file' && msg.metadata?.url && (
                                <FileBubble
                                  metadata={{ url: msg.metadata.url as string, filename: (msg.metadata.filename as string) || 'file', size: msg.metadata.size as number, mime_type: msg.metadata.mime_type as string }}
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
                                  currentUserId={user.id}
                                  onVote={handlePollVote}
                                />
                              )}

                              {/* Text content */}
                              {msg.content && msg.type !== 'image' && msg.type !== 'voice_note' && msg.type !== 'file' && msg.type !== 'location' && msg.type !== 'poll' && (
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                              )}

                              {/* Time + status */}
                              <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : ''}`}>
                                {msg.is_edited && (
                                  <span className={`text-[9px] ${isMine ? 'text-white/50' : 'text-text-muted'}`}>edited</span>
                                )}
                                <span className={`text-[9px] ${isMine ? 'text-white/50' : 'text-text-muted'}`}>
                                  {formatMessageTime(msg.created_at)}
                                </span>
                                {isMine && (
                                  <span className={`text-[9px] ${read ? 'text-blue-300' : 'text-white/40'}`}>
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
                                    onClick={(e) => { e.stopPropagation(); handleReaction(msg.id, emoji); }}
                                    className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-colors ${
                                      users.includes(user.id)
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
                            <div className={`absolute top-0 ${isMine ? '-left-20' : '-right-20'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5`}>
                              <button
                                onClick={(e) => { e.stopPropagation(); setReactionPicker(msg); }}
                                className="p-1 rounded hover:bg-bg-tertiary text-text-muted"
                                title="React"
                              >
                                <SmilePlus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleReply(msg); }}
                                className="p-1 rounded hover:bg-bg-tertiary text-text-muted"
                                title="Reply"
                              >
                                <Reply className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setContextMenu({ message: msg, x: e.clientX, y: e.clientY });
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

              {/* Reply/Edit banner */}
              {(store.replyTo || store.editingMessage) && (
                <div className="px-4 py-2 border-t border-border-primary bg-bg-secondary flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-accent-primary font-medium">
                      {store.editingMessage ? 'Editing message' : `Replying to ${store.replyTo?.sender_name}`}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {(store.editingMessage || store.replyTo)?.content}
                    </p>
                  </div>
                  <button
                    onClick={() => { store.setReplyTo(null); store.setEditingMessage(null); setEditText(''); }}
                    className="p-1 text-text-muted hover:text-text-primary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* GIF/Sticker picker */}
              {showGifPicker && (
                <div className="relative">
                  <GifStickerPicker
                    isOpen={showGifPicker}
                    onClose={() => setShowGifPicker(false)}
                    onSelect={handleGifSelect}
                  />
                </div>
              )}

              {/* Input area */}
              <form onSubmit={handleSend} className="p-3 border-t border-border-primary flex items-center gap-1.5">
                {/* Attachment menu */}
                <div className="relative">
                  <input ref={fileUploadRef} type="file" onChange={handleFileUpload} className="hidden" />
                  <AttachmentMenu
                    isOpen={showAttachMenu}
                    onToggle={() => setShowAttachMenu(!showAttachMenu)}
                    onSelectFile={() => { setShowAttachMenu(false); fileUploadRef.current?.click(); }}
                    onSelectLocation={() => { setShowAttachMenu(false); setShowLocationPicker(true); }}
                    onSelectPoll={() => { setShowAttachMenu(false); setShowPollCreator(true); }}
                  />
                </div>

                {/* Image upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-text-muted hover:text-text-primary transition-colors"
                  title="Send image"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* GIF picker toggle */}
                <button
                  type="button"
                  onClick={() => setShowGifPicker(!showGifPicker)}
                  className={`p-2 transition-colors ${showGifPicker ? 'text-accent-primary' : 'text-text-muted hover:text-text-primary'}`}
                  title="GIFs & Stickers"
                >
                  <Smile className="w-4 h-4" />
                </button>

                {/* Text input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={store.editingMessage ? editText : newMessage}
                  onChange={(e) => {
                    if (store.editingMessage) {
                      setEditText(e.target.value);
                    } else {
                      handleInputChange(e.target.value);
                    }
                  }}
                  placeholder={store.editingMessage ? 'Edit message...' : 'Type a message...'}
                  className="input flex-1 py-2.5"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      store.setReplyTo(null);
                      store.setEditingMessage(null);
                      setEditText('');
                      setShowGifPicker(false);
                    }
                  }}
                />

                {/* Voice recorder or Send button */}
                {!newMessage.trim() && !store.editingMessage ? (
                  <VoiceRecorder
                    onRecordingComplete={handleVoiceComplete}
                    disabled={sending}
                  />
                ) : (
                  <button
                    type="submit"
                    disabled={(!newMessage.trim() && !store.editingMessage) || sending}
                    className="btn-primary px-4 py-2.5"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </form>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-14 h-14 text-text-muted mx-auto mb-4" />
                <p className="text-text-secondary font-medium">Select a conversation</p>
                <p className="text-xs text-text-muted mt-1 mb-4">or start a new chat to connect</p>
                <button
                  onClick={() => store.setShowNewChatModal(true)}
                  className="btn-primary text-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5 inline" />
                  New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ───────────── Context Menu (right-click on message) ───────────── */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-bg-card border border-border-primary rounded-xl shadow-xl py-1 min-w-[160px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleReply(contextMenu.message)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            <Reply className="w-4 h-4" /> Reply
          </button>
          <button
            onClick={() => setReactionPicker(contextMenu.message)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            <SmilePlus className="w-4 h-4" /> React
          </button>
          {contextMenu.message.sender_id === user.id && (
            <>
              <button
                onClick={() => handleEdit(contextMenu.message)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary transition-colors"
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => handleDelete(contextMenu.message.id)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-bg-tertiary transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </>
          )}
          <button
            onClick={() => {
              setForwardMessage(contextMenu.message);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            <Forward className="w-4 h-4" /> Forward
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(contextMenu.message.content);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            Copy text
          </button>
        </div>
      )}

      {/* ───────────── Reaction Picker ───────────── */}
      {reactionPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setReactionPicker(null)}
        >
          <div
            className="bg-bg-card border border-border-primary rounded-2xl p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-text-muted mb-3 text-center">Pick a reaction</p>
            <div className="flex gap-3">
              {QUICK_REACTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(reactionPicker.id, emoji)}
                  className="text-2xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ───────────── New Chat Modal ───────────── */}
      {store.showNewChatModal && (
        <NewChatModal
          onClose={() => store.setShowNewChatModal(false)}
          onSelectUser={openChatWithUser}
        />
      )}

      {/* ───────────── New Group Modal ───────────── */}
      {store.showGroupModal && (
        <NewGroupModal
          onClose={() => store.setShowGroupModal(false)}
          onCreated={async (convId) => {
            store.setShowGroupModal(false);
            await loadConversations();
            store.setActiveConversationId(convId);
          }}
        />
      )}

      {/* ───────────── Poll Creator Modal ───────────── */}
      {showPollCreator && (
        <PollCreator
          isOpen={showPollCreator}
          onClose={() => setShowPollCreator(false)}
          onCreatePoll={handleCreatePoll}
        />
      )}

      {/* ───────────── Location Picker Modal ───────────── */}
      {showLocationPicker && (
        <LocationPicker
          isOpen={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onLocationSelected={handleLocationSelected}
        />
      )}

      {/* ───────────── Group Settings Modal ───────────── */}
      {showGroupSettings && activeConv && (
        <GroupSettingsModal
          isOpen={showGroupSettings}
          onClose={() => setShowGroupSettings(false)}
          conversationId={activeConv.id}
          groupName={activeConv.group_name || 'Group'}
          groupAvatar={activeConv.group_avatar_url || undefined}
          isAdmin={true}
          onGroupUpdated={loadConversations}
        />
      )}

      {/* ───────────── Forward Message Modal ───────────── */}
      {forwardMessage && (
        <ForwardMessageModal
          isOpen={!!forwardMessage}
          onClose={() => setForwardMessage(null)}
          message={forwardMessage}
          onForward={handleForwardMessage}
        />
      )}

      {/* ───────────── Call Screen ───────────── */}
      {callState !== 'idle' && activeConv && (
        <CallScreen
          isOpen={true}
          callType={callType}
          callState={callState as 'ringing' | 'connecting' | 'active' | 'ended'}
          targetUser={{
            id: activeConv.other_user_id || '',
            name: activeConv.other_user_name,
            avatar_url: activeConv.other_user_avatar || undefined,
          }}
          isOutgoing={callIsOutgoing}
          duration={callDuration}
          isMuted={callMuted}
          isCameraOn={callCameraOn}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          onToggleMute={handleCallToggleMute}
          onToggleCamera={handleCallToggleCamera}
          onEndCall={handleEndCall}
        />
      )}

      {/* Incoming Call Overlay is now rendered globally by <GlobalCallListener /> */}
    </div>
  );
}

// ── Conversation List Item Component ─────────────────────────────────

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
                {isTyping ? 'typing...' : (conversation.last_message_preview || 'Start a conversation')}
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
            <Pin className="w-3.5 h-3.5" /> {conversation.is_pinned ? 'Unpin' : 'Pin'}
          </button>
          <button onClick={onMute} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary">
            <BellOff className="w-3.5 h-3.5" /> {conversation.is_muted ? 'Unmute' : 'Mute'}
          </button>
          <button onClick={onArchive} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary">
            <Archive className="w-3.5 h-3.5" /> Archive
          </button>
          <button onClick={onLeave} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-bg-tertiary">
            <Trash2 className="w-3.5 h-3.5" /> Leave
          </button>
        </div>
      )}
    </div>
  );
}

// ── New Chat Modal ───────────────────────────────────────────────────

function NewChatModal({
  onClose,
  onSelectUser,
}: {
  onClose: () => void;
  onSelectUser: (userId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{
    id: string;
    display_name: string;
    avatar_url: string | null;
    username: string | null;
    sun_sign: string | null;
  }>>([]);
  const [friends, setFriends] = useState<Array<{
    id: string;
    display_name: string;
    avatar_url: string | null;
    sun_sign: string | null;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(true);

  // Load friends on mount
  useEffect(() => {
    getFriends().then(f => {
      setFriends(f);
      setFriendsLoading(false);
    });
  }, []);

  // Search debounce
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      const r = await searchUsers(query);
      setResults(r);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const displayList = query.trim() ? results : friends;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-bg-card border border-border-primary rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-primary">
          <h2 className="text-lg font-display font-bold text-text-primary">New Chat</h2>
          <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or username..."
              className="input pl-9 py-2.5 text-sm"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {!query.trim() && !friendsLoading && friends.length > 0 && (
            <p className="text-[10px] uppercase text-text-muted font-semibold px-2 mb-2">Your Friends</p>
          )}
          {(loading || friendsLoading) ? (
            <div className="text-center py-8">
              <span className="text-sm text-text-muted">Searching...</span>
            </div>
          ) : displayList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-text-muted">{query.trim() ? 'No users found' : 'No friends yet'}</p>
            </div>
          ) : (
            displayList.map(u => (
              <button
                key={u.id}
                onClick={() => onSelectUser(u.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-bg-tertiary transition-colors"
              >
                <UserAvatar avatarUrl={u.avatar_url} displayName={u.display_name} size="sm" />
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{u.display_name}</p>
                  <p className="text-[10px] text-text-muted">
                    {u.sun_sign || ('username' in u ? (u as any).username : '') || ''}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── New Group Modal ──────────────────────────────────────────────────

function NewGroupModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (conversationId: string) => void;
}) {
  const [groupName, setGroupName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [friends, setFriends] = useState<Array<{
    id: string;
    display_name: string;
    avatar_url: string | null;
    sun_sign: string | null;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getFriends().then(f => {
      setFriends(f);
      setLoading(false);
    });
  }, []);

  function toggleMember(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  async function handleCreate() {
    if (!groupName.trim() || selectedIds.length < 1) return;
    setCreating(true);
    const convId = await createGroupConversation(groupName.trim(), selectedIds);
    if (convId) {
      onCreated(convId);
    }
    setCreating(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-bg-card border border-border-primary rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-primary">
          <h2 className="text-lg font-display font-bold text-text-primary">New Group</h2>
          <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name..."
            className="input py-2.5 text-sm"
            autoFocus
          />

          {/* Selected members */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedIds.map(id => {
                const friend = friends.find(f => f.id === id);
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent-muted text-accent-primary text-xs"
                  >
                    {friend?.display_name || 'Unknown'}
                    <button onClick={() => toggleMember(id)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          <p className="text-[10px] uppercase text-text-muted font-semibold px-2 mb-2">Add Members</p>
          {loading ? (
            <div className="text-center py-8"><span className="text-sm text-text-muted">Loading friends...</span></div>
          ) : friends.length === 0 ? (
            <div className="text-center py-8"><p className="text-sm text-text-muted">No friends yet</p></div>
          ) : (
            friends.map(f => (
              <button
                key={f.id}
                onClick={() => toggleMember(f.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  selectedIds.includes(f.id) ? 'bg-accent-muted' : 'hover:bg-bg-tertiary'
                }`}
              >
                <UserAvatar avatarUrl={f.avatar_url} displayName={f.display_name} size="sm" />
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-text-primary">{f.display_name}</p>
                  {f.sun_sign && <p className="text-[10px] text-text-muted">{f.sun_sign}</p>}
                </div>
                {selectedIds.includes(f.id) && (
                  <span className="w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t border-border-primary">
          <button
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedIds.length < 1 || creating}
            className="btn-primary w-full"
          >
            {creating ? 'Creating...' : `Create Group${selectedIds.length > 0 ? ` (${selectedIds.length} members)` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
