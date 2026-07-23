'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { useMessagesStore } from '@/stores/messagesStore';
import { MessageCircle, Plus, Reply, SmilePlus, Pencil, Trash2, Forward, Pin } from 'lucide-react';
import { PollCreator } from '@/components/chat/PollCreator';
import { CallScreen } from '@/components/chat/CallScreen';
import { GroupSettingsModal } from '@/components/chat/GroupSettingsModal';
import { ForwardMessageModal } from '@/components/chat/ForwardMessageModal';
import { LocationPicker } from '@/components/chat/LocationPicker';
import { getChatTheme } from '@/data/chatThemes';
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
  hideMessageForMe,
  getHiddenMessageIds,
  editMessage,
  subscribeToMessages,
  subscribeToConversations,
  sendTypingIndicator,
  subscribeToTyping,
  subscribeToPresence,
  subscribeToReadReceipts,
  getOtherUserReadAt,
  addReaction,
  getOrCreateConversation,
  togglePinConversation,
  toggleMuteConversation,
  toggleArchiveConversation,
  leaveConversation,
  getTotalUnreadCount,
  uploadChatImage,
  pinMessage,
  type Message,
} from '@/lib/messagingService';

import { ConversationList } from '@/components/messages/ConversationList';
import { MessageThread } from '@/components/messages/MessageThread';
import { MessageComposer } from '@/components/messages/MessageComposer';
import { NewChatModal, NewGroupModal } from '@/components/messages/NewConversationModal';

// ── Smart Reply Helpers ─────────────────────────────────────────────

function getSmartReplies(lastMsg: Message | undefined, myId: string | undefined): string[] {
  if (!lastMsg || lastMsg.sender_id === myId || lastMsg.type !== 'text') return [];
  const t = (lastMsg.content || '').toLowerCase();
  if (/\bhey\b|\bhi\b|\bhello\b|\bwhat'?s up\b/.test(t)) return ['Hey!', 'Hi there!', "What's up?"];
  if (/\bthank|\bthanks\b/.test(t)) return ["You're welcome!", 'No problem!', 'Anytime!'];
  if (/\bhow are you\b|\bhow'?s it going\b/.test(t)) return ["I'm good, you?", 'Doing great!', 'Pretty good!'];
  if (/\?$/.test(t.trim())) return ['Yes', 'No', 'Maybe', "I'll check"];
  if (/\blol\b|\bhaha\b|😂|🤣/.test(t)) return ['😂', 'Haha!', 'So funny'];
  if (/\bgood morning\b/.test(t)) return ['Good morning!', 'Morning!'];
  if (/\bgood night\b/.test(t)) return ['Good night!', 'Sleep well!', 'Nighty night!'];
  return [];
}

const QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '🙏', '🔥'];

// ── Main Component ───────────────────────────────────────────────────

export default function MessagesPage() {
  const { t } = useTranslation();
  const { user, profile } = useAuthStore();
  const store = useMessagesStore();
  const chatTheme = useMemo(() => getChatTheme(profile?.chat_theme), [profile?.chat_theme]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [contextMenu, setContextMenu] = useState<{ message: Message; x: number; y: number } | null>(null);
  const [reactionPicker, setReactionPicker] = useState<Message | null>(null);
  const [showConvMenu, setShowConvMenu] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [hiddenMsgIds, setHiddenMsgIds] = useState<Set<string>>(new Set());

  // New feature state
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);

  // Call state
  const [callState, setCallState] = useState<CallState>('idle');
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [callIsOutgoing, setCallIsOutgoing] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callMuted, setCallMuted] = useState(false);
  const [callCameraOn, setCallCameraOn] = useState(true);
  const [callMediaWarning, setCallMediaWarning] = useState<string | null>(null);
  const [callPeer, setCallPeer] = useState<{ id: string; name: string; avatar_url?: string } | null>(null);
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
    return convos.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return 0;
    });
  }, [store.conversations, store.searchQuery]);

  // Messages filtered by hidden IDs + search
  const displayMessages = useMemo(() => {
    let msgs = store.messages.filter(m => !hiddenMsgIds.has(m.id));
    if (store.messageSearchQuery) {
      const q = store.messageSearchQuery.toLowerCase();
      msgs = msgs.filter(m => (m.content || '').toLowerCase().includes(q));
    }
    return msgs;
  }, [store.messages, store.messageSearchQuery, hiddenMsgIds]);

  // Typing state for active conversation
  const isOtherTyping = store.activeConversationId
    ? (store.typingUsers[store.activeConversationId] && Date.now() - store.typingUsers[store.activeConversationId] < 3000)
    : false;

  // Smart replies
  const smartReplies = useMemo(() => {
    const lastReceived = [...store.messages].reverse().find(m => m.sender_id !== user?.id);
    return getSmartReplies(lastReceived, user?.id);
  }, [store.messages, user?.id]);

  // ── Load hidden messages + conversations on mount ──
  useEffect(() => {
    if (!user) return;
    setHiddenMsgIds(getHiddenMessageIds());
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
      loadConversations();
    });
    return () => sub.unsubscribe();
  }, [user]);

  // ── Load messages when active conversation changes ──
  useEffect(() => {
    if (!store.activeConversationId) return;
    loadThreadMessages(store.activeConversationId);
    markAsRead(store.activeConversationId);
    store.decrementUnread(store.activeConversationId);
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
    const convId = store.activeConversationId;
    const sub = subscribeToMessages(convId, (msg) => {
      if (msg._event === 'UPDATE') {
        store.updateMessage(msg);
        return;
      }
      const isFromOther = msg.sender_id !== user.id;
      const existing = useMessagesStore.getState().messages;
      if (existing.some(m => m.id === msg.id)) return;
      if (!isFromOther) {
        const optimisticMsg = existing.find(
          m => m.id.startsWith('temp-') && m.content === msg.content,
        );
        if (optimisticMsg) {
          store.removeMessage(optimisticMsg.id);
        }
      }
      store.addMessage(msg);
      if (isFromOther) {
        markAsRead(convId);
        store.updateConversationPreview(convId, msg.content, msg.sender_id);
      }
      const container = messagesContainerRef.current;
      if (container) {
        const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
        if (nearBottom) {
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
      }
    });
    return () => sub.unsubscribe();
  }, [store.activeConversationId, user]);

  // ── Typing indicator subscription ──
  useEffect(() => {
    if (!store.activeConversationId) return;
    const convId = store.activeConversationId;
    const sub = subscribeToTyping(convId, (_userId) => {
      store.setTypingUser(convId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        store.clearTypingUser(convId);
      }, 3000);
    }, (_userId) => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      store.clearTypingUser(convId);
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

  // ── Read receipt subscription ──
  useEffect(() => {
    if (!store.activeConversationId) return;
    const sub = subscribeToReadReceipts(store.activeConversationId, (readAt) => {
      store.setOtherReadAt(readAt);
    });
    return () => sub.unsubscribe();
  }, [store.activeConversationId]);

  // ── Scroll detection ──
  function handleScroll() {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (container.scrollTop < 100 && store.hasMore && !loadingMore) {
      loadMoreMessages();
    }
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 300;
    setShowScrollDown(!nearBottom);
  }

  // ── Send message ──
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !store.activeConversationId || (!newMessage.trim() && !store.editingMessage)) return;
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
    setSendError('');
    const content = newMessage.trim();
    const replyToId = store.replyTo?.id;
    setNewMessage('');
    store.setReplyTo(null);
    if (store.activeConversationId) {
      sendTypingIndicator(store.activeConversationId, 'typing_stopped');
    }
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
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    const result = await sendMsg(store.activeConversationId, content, 'text', {}, replyToId);
    if (result.success && result.message) {
      store.removeMessage(optimistic.id);
      store.addMessage(result.message);
    } else {
      store.removeMessage(optimistic.id);
      setNewMessage(content);
      setSendError(result.error || 'Failed to send message.');
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
  async function handleDeleteForEveryone(msgId: string) {
    const success = await deleteMessage(msgId);
    if (success) store.removeMessage(msgId);
    setContextMenu(null);
  }

  function handleDeleteForMe(msgId: string) {
    hideMessageForMe(msgId);
    setHiddenMsgIds(prev => { const next = new Set(prev); next.add(msgId); return next; });
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
    store.updateMessage({ ...msg, metadata: { ...msg.metadata, options } });
  }

  // ── Forward message ──
  async function handleForwardMessage(conversationId: string) {
    if (!forwardMessage || !user) return;
    const result = await sendMsg(conversationId, forwardMessage.content, forwardMessage.type as 'text', forwardMessage.metadata || undefined);
    if (result.success && result.message) {
      if (conversationId === store.activeConversationId) {
        store.addMessage(result.message);
      }
      store.updateConversationPreview(conversationId, forwardMessage.content, user.id);
    }
    setForwardMessage(null);
  }

  // ── Video attach helper ──
  // The video containers only exist once callState flips to 'active', and the
  // remote peer publishes video some time after audio. A single fire-and-forget
  // timeout races both of those and silently gives up, leaving a black screen.
  // Retry until the track and its container are both present.
  function attachTrackWhenReady(
    getTrack: () => unknown,
    ref: React.RefObject<HTMLDivElement>,
    label: string,
  ) {
    const deadline = Date.now() + 8000;
    const tick = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const track = getTrack() as any;
      if (track && ref.current) {
        try {
          track.play(ref.current);
        } catch (err) {
          console.warn(`[Call] Could not play ${label} video:`, err);
        }
        return;
      }
      if (Date.now() < deadline) {
        setTimeout(tick, 150);
      } else {
        console.warn(`[Call] Gave up attaching ${label} video (track=${!!track}, container=${!!ref.current})`);
      }
    };
    tick();
  }

  // ── Agora connection helper ──
  async function connectToAgoraCall(channelName: string, type: 'voice' | 'video') {
    try {
      setCallState('connecting');
      setCallMediaWarning(null);
      const client = createCallClient();
      callClientRef.current = client;
      const uid = Math.floor(Math.random() * 100000) + 1;
      const token = await fetchAgoraToken(channelName, uid);
      if (!token) {
        console.warn('[Call] Failed to get Agora token');
        setCallMediaWarning('Could not reach the call server. Please try again.');
        handleEndCall();
        return;
      }
      client.onMediaError((kind, message) => {
        console.warn(`[Call] ${kind} unavailable:`, message);
        setCallMediaWarning(
          kind === 'mic'
            ? 'Your microphone is blocked — the other person cannot hear you. Allow microphone access and call again.'
            : 'Your camera is blocked — the other person cannot see you. Allow camera access and call again.',
        );
        if (kind === 'camera') setCallCameraOn(false);
      });
      client.onRemoteUserJoined(() => {
        setCallState('active');
        // Fires once per published track (audio, then video). Starting a second
        // interval here would double-count the duration and leak the first one.
        if (!callTimerRef.current) {
          setCallDuration(0);
          callTimerRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
          }, 1000);
        }
      });
      client.onRemoteVideoChanged((track) => {
        if (type !== 'video' || !track) return;
        attachTrackWhenReady(() => client.getRemoteVideoTrack(), remoteVideoRef, 'remote');
      });
      client.onRemoteUserLeft(() => {
        handleEndCall();
      });
      const joined = await client.join(channelName, token, uid);
      if (!joined) {
        console.warn('[Call] Failed to join Agora channel');
        setCallMediaWarning('Could not connect to the call.');
        handleEndCall();
        return;
      }
      if (type === 'video') {
        await client.toggleCamera();
        // Reflect whether the camera actually came up, not what we hoped for.
        setCallCameraOn(client.isCameraOn());
        attachTrackWhenReady(() => client.getLocalVideoTrack(), localVideoRef, 'local');
      }
    } catch (err) {
      console.error('[Call] connectToAgoraCall error:', err);
      handleEndCall();
    }
  }

  // ── React to call signals ──
  useEffect(() => {
    if (!activeSignal || activeSignal._ts <= lastProcessedSignalTs.current) return;
    lastProcessedSignalTs.current = activeSignal._ts;
    switch (activeSignal.type) {
      case 'call-response':
        if (activeSignal.accepted && callSessionRef.current && activeSignal.sessionId === callSessionRef.current.sessionId) {
          connectToAgoraCall(callSessionRef.current.channelName, callSessionRef.current.callType);
        } else if (!activeSignal.accepted && callSessionRef.current && activeSignal.sessionId === callSessionRef.current.sessionId) {
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

  // ── Pick up pending accepted calls ──
  useEffect(() => {
    if (!pendingAcceptedCall || !user) return;
    const call = pendingAcceptedCall;
    clearPendingCall(null);
    (async () => {
      // Opening the conversation is presentation only — if it fails we still
      // have to join the channel, or the caller sits at "connected" forever
      // talking to an empty room.
      try {
        const convId = await getOrCreateConversation(call.callerId);
        if (convId) {
          await loadConversations();
          store.setActiveConversationId(convId);
        }
      } catch (err) {
        console.warn('[Call] Could not open conversation for incoming call:', err);
      }
      setCallPeer({ id: call.callerId, name: call.callerName, avatar_url: call.callerAvatar });
      setCallType(call.callType);
      setCallIsOutgoing(false);
      setCallDuration(0);
      setCallMuted(false);
      setCallCameraOn(call.callType === 'video');
      callSessionRef.current = {
        channelName: call.channelName,
        sessionId: call.sessionId,
        otherId: call.callerId,
        callType: call.callType,
      };
      connectToAgoraCall(call.channelName, call.callType);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAcceptedCall, user]);

  // ── Call initiation ──
  async function handleCallStart(type: 'voice' | 'video') {
    if (!user || !activeConv) return;
    const otherId = activeConv.other_user_id;
    if (!otherId) return;
    setCallPeer({
      id: otherId,
      name: activeConv.other_user_name,
      avatar_url: activeConv.other_user_avatar || undefined,
    });
    setCallType(type);
    setCallIsOutgoing(true);
    setCallState('ringing');
    setCallDuration(0);
    setCallMuted(false);
    setCallMediaWarning(null);
    setCallCameraOn(type === 'video');
    const channelName = generateChannelName(user.id, otherId);
    const sessionId = generateSessionId();
    callSessionRef.current = { channelName, sessionId, otherId, callType: type };
    sendCallSignal(otherId, {
      type: 'incoming-call',
      callerId: user.id,
      callerName: user.user_metadata?.display_name || 'User',
      callType: type,
      channelName,
      sessionId,
    });
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
        }).catch(() => {});
      }
    } catch {}
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
    if (callSessionRef.current) {
      sendCallSignal(callSessionRef.current.otherId, {
        type: 'call-ended',
        sessionId: callSessionRef.current.sessionId,
      });
      callSessionRef.current = null;
    }
    const client = callClientRef.current;
    callClientRef.current = null;
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
    if (!wasOn && isNowOn) {
      attachTrackWhenReady(
        () => callClientRef.current?.getLocalVideoTrack() ?? null,
        localVideoRef,
        'local',
      );
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

  // ── Pin a message ──
  async function handlePinMessage(msg: Message) {
    const isPinned = !!msg.metadata?.pinned;
    const success = await pinMessage(msg.id, !isPinned);
    if (success) {
      store.updateMessage({ ...msg, metadata: { ...msg.metadata, pinned: !isPinned } });
    }
    setContextMenu(null);
  }

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
        <p className="text-text-muted">{t('messages.signInRequired')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] min-h-[500px]">
      <div className="flex h-full gap-0 border border-border-primary rounded-2xl overflow-hidden bg-bg-card">
        {/* ───────────── LEFT: Conversation List ───────────── */}
        <ConversationList
          conversations={filteredConversations}
          loading={store.conversationsLoading}
          activeConversationId={store.activeConversationId}
          typingUsers={store.typingUsers}
          myId={user.id}
          searchQuery={store.searchQuery}
          totalUnread={store.totalUnreadMessages}
          showConvMenu={showConvMenu}
          onSearchChange={(q) => store.setSearchQuery(q)}
          onSelect={(id) => store.setActiveConversationId(id)}
          onNewChat={() => store.setShowNewChatModal(true)}
          onNewGroup={() => store.setShowGroupModal(true)}
          onToggleConvMenu={setShowConvMenu}
          onPin={handleTogglePin}
          onMute={handleToggleMute}
          onArchive={handleArchive}
          onLeave={handleLeave}
        />

        {/* ───────────── RIGHT: Chat Area ───────────── */}
        <div className={`flex-1 flex flex-col min-w-0 ${
          store.activeConversationId ? 'flex' : 'hidden sm:flex'
        }`}>
          {activeConv ? (
            <>
              <MessageThread
                activeConv={activeConv}
                messages={displayMessages}
                messagesLoading={store.messagesLoading}
                hasMore={store.hasMore}
                loadingMore={loadingMore}
                isOtherTyping={!!isOtherTyping}
                chatTheme={chatTheme}
                currentUserId={user.id}
                otherReadAt={store.otherReadAt}
                messageSearchQuery={store.messageSearchQuery}
                callState={callState}
                showScrollDown={showScrollDown}
                messagesEndRef={messagesEndRef}
                messagesContainerRef={messagesContainerRef}
                onBack={() => store.setActiveConversationId(null)}
                onScroll={handleScroll}
                onLoadMore={loadMoreMessages}
                onReaction={handleReaction}
                onReply={handleReply}
                onContextMenu={(msg, x, y) => setContextMenu({ message: msg, x, y })}
                onPollVote={handlePollVote}
                onMessageSearchChange={(q) => store.setMessageSearchQuery(q)}
                onCallStart={handleCallStart}
                onGroupSettings={() => setShowGroupSettings(true)}
                onOpenReactionPicker={setReactionPicker}
              />

              {sendError && (
                <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 flex items-center justify-between">
                  <p className="text-xs text-red-400">{sendError}</p>
                  <button onClick={() => setSendError('')} className="text-xs text-red-400 hover:text-red-300 font-medium ml-2">✕</button>
                </div>
              )}
              <MessageComposer
                newMessage={newMessage}
                editText={editText}
                editingMessage={store.editingMessage}
                replyTo={store.replyTo}
                sending={sending}
                smartReplies={smartReplies}
                showGifPicker={showGifPicker}
                showAttachMenu={showAttachMenu}
                inputRef={inputRef}
                onNewMessageChange={handleInputChange}
                onEditTextChange={setEditText}
                onSend={handleSend}
                onCancelReplyEdit={() => { store.setReplyTo(null); store.setEditingMessage(null); setEditText(''); setShowGifPicker(false); }}
                onImageUpload={handleImageUpload}
                onFileUpload={handleFileUpload}
                onGifSelect={handleGifSelect}
                onVoiceComplete={handleVoiceComplete}
                onSmartReplySelect={(reply) => { setNewMessage(reply); setTimeout(() => inputRef.current?.focus(), 50); }}
                onToggleGifPicker={() => setShowGifPicker(!showGifPicker)}
                onToggleAttachMenu={() => setShowAttachMenu(!showAttachMenu)}
                onCloseAttachMenu={() => setShowAttachMenu(false)}
                onSelectFileFromMenu={() => {}}
                onSelectLocation={() => setShowLocationPicker(true)}
                onSelectPoll={() => setShowPollCreator(true)}
              />
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-14 h-14 text-text-muted mx-auto mb-4" />
                <p className="text-text-secondary font-medium">{t('messages.selectConversation')}</p>
                <p className="text-xs text-text-muted mt-1 mb-4">{t('messages.startNewChat')}</p>
                <button
                  onClick={() => store.setShowNewChatModal(true)}
                  className="btn-primary text-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5 inline" />
                  {t('messages.newChat')}
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
            <Reply className="w-4 h-4" /> {t('messages.contextMenu.reply')}
          </button>
          <button
            onClick={() => setReactionPicker(contextMenu.message)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            <SmilePlus className="w-4 h-4" /> {t('messages.contextMenu.react')}
          </button>
          {contextMenu.message.sender_id === user.id && (
            <button
              onClick={() => handleEdit(contextMenu.message)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary transition-colors"
            >
              <Pencil className="w-4 h-4" /> {t('messages.contextMenu.edit')}
            </button>
          )}
          {/* Delete for me — available for ALL messages */}
          {!contextMenu.message.is_deleted && (
            <button
              onClick={() => handleDeleteForMe(contextMenu.message.id)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-bg-tertiary transition-colors"
            >
              <Trash2 className="w-4 h-4" /> {t('messages.contextMenu.deleteForMe', 'Delete for me')}
            </button>
          )}
          {/* Delete for everyone — only sender's own messages */}
          {contextMenu.message.sender_id === user.id && !contextMenu.message.is_deleted && (
            <button
              onClick={() => handleDeleteForEveryone(contextMenu.message.id)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-bg-tertiary transition-colors"
            >
              <Trash2 className="w-4 h-4" /> {t('messages.contextMenu.deleteForEveryone', 'Delete for everyone')}
            </button>
          )}
          <button
            onClick={() => {
              setForwardMessage(contextMenu.message);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            <Forward className="w-4 h-4" /> {t('messages.contextMenu.forward')}
          </button>
          <button
            onClick={() => handlePinMessage(contextMenu.message)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            <Pin className="w-4 h-4" /> {contextMenu.message.metadata?.pinned ? t('messages.contextMenu.unpin') : t('messages.contextMenu.pin')}
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(contextMenu.message.content);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            {t('messages.contextMenu.copyText')}
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
            <p className="text-xs text-text-muted mb-3 text-center">{t('messages.pickReaction')}</p>
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
      {callState !== 'idle' && (callPeer || activeConv) && (
        <CallScreen
          isOpen={true}
          callType={callType}
          callState={callState as 'ringing' | 'connecting' | 'active' | 'ended'}
          targetUser={callPeer ?? {
            id: activeConv!.other_user_id || '',
            name: activeConv!.other_user_name,
            avatar_url: activeConv!.other_user_avatar || undefined,
          }}
          isOutgoing={callIsOutgoing}
          duration={callDuration}
          isMuted={callMuted}
          isCameraOn={callCameraOn}
          mediaWarning={callMediaWarning}
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
