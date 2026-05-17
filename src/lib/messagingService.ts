// ═══════════════════════════════════════════════════════════════════
// Messaging Service — Supabase-backed (Web port of mobile realtimeMessagingService)
// DMs, groups, realtime delivery, read receipts, typing indicators,
// unread counts, reactions, replies, message edit/delete, pin/mute/archive
// ═══════════════════════════════════════════════════════════════════
import { sanitizeSearchInput, validateUpload } from './sanitize';

import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

// ── Types ──────────────────────────────────────────────────────────

export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'chart_share'
  | 'system'
  | 'voice_note'
  | 'video_note'
  | 'file'
  | 'location'
  | 'contact'
  | 'poll';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: MessageType;
  metadata: Record<string, any>;
  reply_to: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  sender_name?: string;
  sender_avatar?: string;
  reply_message?: Message | null;
}

export interface Conversation {
  id: string;
  created_at: string;
  last_message_at: string;
  last_message_preview: string;
  last_message_sender_id?: string | null;
  // Joined fields
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string | null;
  other_user_online: boolean;
  other_last_read_at?: string | null;
  unread_count: number;
  // Group fields
  is_group?: boolean;
  group_name?: string;
  group_avatar_url?: string | null;
  member_count?: number;
  // Participant preferences
  is_pinned?: boolean;
  is_muted?: boolean;
  is_archived?: boolean;
}

export interface GroupMember {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
}

export interface SendResult {
  success: boolean;
  message?: Message;
  error?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────

function getMyId(): string | null {
  return useAuthStore.getState().user?.id || null;
}

// ── Get or Create DM Conversation ────────────────────────────────────

export async function getOrCreateConversation(otherUserId: string): Promise<string | null> {
  try {
    const myId = getMyId();
    if (!myId) return null;

    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_or_create_dm', {
      p_user1: myId,
      p_user2: otherUserId,
    });

    if (error) {
      console.warn('[Chat] getOrCreateConversation RPC error:', error.message);
      return null;
    }
    return data;
  } catch (err: any) {
    console.warn('[Chat] getOrCreateConversation exception:', err?.message);
    return null;
  }
}

// ── Get Conversations List ────────────────────────────────────────────

export async function getConversations(): Promise<Conversation[]> {
  try {
    const myId = getMyId();
    if (!myId) return [];

    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_my_conversations', { p_user_id: myId });

    if (error) {
      console.warn('[Chat] get_my_conversations RPC error:', error.message);
      return [];
    }
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    const conversations: Conversation[] = data.map((row: any) => ({
      id: row.conversation_id,
      created_at: row.conv_created_at,
      last_message_at: row.last_message_at,
      last_message_preview: row.last_message_preview || '',
      last_message_sender_id: row.last_message_sender_id || null,
      other_user_id: row.is_group ? '' : (row.other_user_id || ''),
      other_user_name: row.is_group ? (row.group_name || 'Group') : (row.other_display_name || 'Unknown'),
      other_user_avatar: row.is_group ? (row.group_avatar_url || null) : (row.other_avatar_url || null),
      other_user_online: row.is_group ? false : (row.other_is_online || false),
      other_last_read_at: row.other_last_read_at || null,
      unread_count: Number(row.unread_count) || 0,
      is_group: row.is_group || false,
      group_name: row.is_group ? row.group_name : undefined,
      group_avatar_url: row.is_group ? row.group_avatar_url : undefined,
      member_count: undefined,
      is_pinned: row.is_pinned || false,
      is_muted: row.is_muted || false,
      is_archived: row.is_archived || false,
    }));

    conversations.sort((a, b) => {
      const aTime = a.last_message_at || a.created_at || '';
      const bTime = b.last_message_at || b.created_at || '';
      if (aTime === bTime) return 0;
      return aTime < bTime ? 1 : -1;
    });

    return conversations;
  } catch (err: any) {
    console.error('[Chat] getConversations exception:', err?.message);
    return [];
  }
}

// ── Get Messages for a Conversation ──────────────────────────────────

export async function getMessages(
  conversationId: string,
  limit: number = 50,
  before?: string,
): Promise<Message[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(display_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    const messages = data.map((msg: any) => ({
      ...msg,
      sender_name: msg.sender?.display_name || 'Unknown',
      sender_avatar: msg.sender?.avatar_url || null,
    }));

    // Batch-fetch reply messages
    const replyIds = messages
      .map((m: any) => m.reply_to)
      .filter((id: string | null): id is string => !!id);

    if (replyIds.length > 0) {
      const uniqueIds = Array.from(new Set(replyIds));
      const msgMap = new Map(messages.map((m: any) => [m.id, m]));
      const missingIds = uniqueIds.filter(id => !msgMap.has(id));

      let replyMap = new Map<string, any>();

      // Add replies from already-fetched messages
      for (const id of uniqueIds) {
        if (msgMap.has(id)) {
          replyMap.set(id, msgMap.get(id));
        }
      }

      // Fetch any missing reply messages
      if (missingIds.length > 0) {
        const { data: replyData } = await supabase
          .from('messages')
          .select('id, content, type, sender_id, sender:profiles!messages_sender_id_fkey(display_name, avatar_url)')
          .in('id', missingIds);

        if (replyData) {
          for (const r of replyData) {
            replyMap.set(r.id, {
              ...r,
              sender_name: (r as any).sender?.display_name || 'Unknown',
              sender_avatar: (r as any).sender?.avatar_url || null,
            });
          }
        }
      }

      // Attach reply_message to each message
      for (const msg of messages) {
        if (msg.reply_to && replyMap.has(msg.reply_to)) {
          msg.reply_message = replyMap.get(msg.reply_to);
        }
      }
    }

    return messages.reverse();
  } catch {
    return [];
  }
}

// ── Send Message ─────────────────────────────────────────────────────

export async function sendMessage(
  conversationId: string,
  content: string,
  type: MessageType = 'text',
  metadata: Record<string, any> = {},
  replyTo?: string,
): Promise<SendResult> {
  try {
    const myId = getMyId();
    if (!myId) return { success: false, error: 'Not authenticated.' };

    const supabase = createClient();
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: myId,
        content,
        type,
        metadata,
        reply_to: replyTo || null,
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(display_name, avatar_url)
      `)
      .single();

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      message: {
        ...data,
        sender_name: data.sender?.display_name || 'Unknown',
        sender_avatar: data.sender?.avatar_url || null,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to send message.' };
  }
}

// ── Mark Conversation as Read ────────────────────────────────────────

export async function markAsRead(conversationId: string): Promise<void> {
  try {
    const myId = getMyId();
    if (!myId) return;

    const supabase = createClient();
    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', myId);
  } catch { /* best effort */ }
}

// ── Delete Message (soft delete) ─────────────────────────────────────

export async function deleteMessage(messageId: string): Promise<boolean> {
  try {
    const myId = getMyId();
    if (!myId) return false;

    const supabase = createClient();
    const { error } = await supabase
      .from('messages')
      .update({ is_deleted: true, content: '' })
      .eq('id', messageId)
      .eq('sender_id', myId);

    return !error;
  } catch {
    return false;
  }
}

// ── Edit Message ─────────────────────────────────────────────────────

export async function editMessage(messageId: string, newContent: string): Promise<boolean> {
  try {
    const myId = getMyId();
    if (!myId) return false;

    const supabase = createClient();
    const { error } = await supabase
      .from('messages')
      .update({ content: newContent, is_edited: true })
      .eq('id', messageId)
      .eq('sender_id', myId);

    return !error;
  } catch {
    return false;
  }
}

// ── Get Total Unread Count ───────────────────────────────────────────

export async function getTotalUnreadCount(): Promise<number> {
  try {
    const myId = getMyId();
    if (!myId) return 0;

    const supabase = createClient();

    // Fast path: single aggregate query
    try {
      const { data: agg } = await supabase.rpc('get_unread_counts_for_user', { p_user_id: myId });
      if (agg && Array.isArray(agg)) {
        return (agg as Array<{ unread_count: number }>).reduce(
          (sum, r) => sum + (Number(r.unread_count) || 0),
          0,
        );
      }
    } catch { /* fall through */ }

    // Fallback: client-side aggregation
    const { data: myConvos } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', myId);

    if (!myConvos || myConvos.length === 0) return 0;

    const counts = await Promise.all(
      myConvos.map(async (convo) => {
        try {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', convo.conversation_id)
            .neq('sender_id', myId)
            .gt('created_at', convo.last_read_at || '1970-01-01')
            .eq('is_deleted', false);
          return count || 0;
        } catch {
          return 0;
        }
      }),
    );

    return counts.reduce((sum, n) => sum + n, 0);
  } catch {
    return 0;
  }
}

// ── Subscribe to New Messages in a Conversation ──────────────────────

export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: any) => void,
): { unsubscribe: () => void } {
  const supabase = createClient();
  const channelName = `messages:${conversationId}:${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        const msg = payload.new;
        const { data: sender } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', (msg as any).sender_id)
          .single();

        onNewMessage({
          ...msg,
          sender_name: sender?.display_name || 'Unknown',
          sender_avatar: sender?.avatar_url || null,
        });
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        // Fire same handler for edits/deletes — caller can check is_edited/is_deleted
        const msg = payload.new;
        const { data: sender } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', (msg as any).sender_id)
          .single();

        onNewMessage({
          ...msg,
          sender_name: sender?.display_name || 'Unknown',
          sender_avatar: sender?.avatar_url || null,
          _event: 'UPDATE',
        });
      },
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

// ── Subscribe to Conversations (for inbox updates) ───────────────────

export function subscribeToConversations(
  onUpdate: (payload: any) => void,
): { unsubscribe: () => void } {
  const supabase = createClient();
  const myId = getMyId();
  if (!myId) return { unsubscribe: () => {} };

  const channelName = `inbox-updates:${myId}:${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversation_participants',
        filter: `user_id=eq.${myId}`,
      },
      onUpdate,
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        const senderId = (payload.new as any)?.sender_id;
        if (senderId && senderId !== myId) onUpdate(payload);
      },
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

// ── Typing Indicator (Broadcast) ─────────────────────────────────────

export function sendTypingIndicator(conversationId: string, event: 'typing' | 'typing_stopped' = 'typing'): void {
  const myId = getMyId();
  if (!myId) return;

  const supabase = createClient();
  const channel = supabase.channel(`typing:${conversationId}`);
  channel.send({
    type: 'broadcast',
    event,
    payload: { user_id: myId, timestamp: Date.now() },
  });
}

export function subscribeToTyping(
  conversationId: string,
  onTyping: (userId: string) => void,
  onTypingStopped?: (userId: string) => void,
): { unsubscribe: () => void } {
  const supabase = createClient();
  const myId = getMyId();
  const topic = `typing:${conversationId}`;

  const channel = supabase
    .channel(topic)
    .on('broadcast', { event: 'typing' }, (payload) => {
      if (payload.payload?.user_id && payload.payload.user_id !== myId) {
        onTyping(payload.payload.user_id);
      }
    })
    .on('broadcast', { event: 'typing_stopped' }, (payload) => {
      if (payload.payload?.user_id && payload.payload.user_id !== myId) {
        onTypingStopped?.(payload.payload.user_id);
      }
    })
    .subscribe();

  return {
    unsubscribe: () => {
      try { supabase.removeChannel(channel); } catch { /* already removed */ }
    },
  };
}

// ── Presence ─────────────────────────────────────────────────────────

export function subscribeToPresence(
  conversationId: string,
  onPresenceChange: (onlineUserIds: string[]) => void,
): { unsubscribe: () => void } {
  const supabase = createClient();
  const topic = `presence:${conversationId}`;

  const channel = supabase.channel(topic, {
    config: { presence: { key: getMyId() || 'anon' } },
  });

  try {
    channel
      .on('presence', { event: 'sync' }, () => {
        try {
          const state = channel.presenceState();
          const onlineIds = Object.keys(state);
          onPresenceChange(onlineIds);
        } catch { /* never crash */ }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          try {
            await channel.track({ user_id: getMyId(), online_at: new Date().toISOString() });
          } catch { /* non-critical */ }
        }
      });
  } catch (err) {
    console.warn('[Presence] Channel setup failed:', err);
  }

  return {
    unsubscribe: () => {
      try { supabase.removeChannel(channel); } catch { /* already removed */ }
    },
  };
}

// ── Read Status ──────────────────────────────────────────────────────

export async function getOtherUserReadAt(conversationId: string): Promise<string | null> {
  try {
    const myId = getMyId();
    if (!myId) return null;

    const supabase = createClient();
    const { data, error } = await supabase
      .from('conversation_participants')
      .select('last_read_at')
      .eq('conversation_id', conversationId)
      .neq('user_id', myId)
      .single();

    if (error || !data) return null;
    return data.last_read_at;
  } catch {
    return null;
  }
}

// ── Subscribe to Read Receipts ──────────────────────────────────────

export function subscribeToReadReceipts(
  conversationId: string,
  onReadUpdate: (readAt: string) => void,
): { unsubscribe: () => void } {
  const supabase = createClient();
  const myId = getMyId();
  if (!myId) return { unsubscribe: () => {} };

  const channelName = `read-receipts:${conversationId}:${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversation_participants',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const row = payload.new as any;
        if (row.user_id !== myId && row.last_read_at) {
          onReadUpdate(row.last_read_at);
        }
      },
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

// ── Reactions ────────────────────────────────────────────────────────

export async function addReaction(messageId: string, emoji: string): Promise<boolean> {
  try {
    const myId = getMyId();
    if (!myId) return false;

    const supabase = createClient();
    const { error } = await supabase.rpc('toggle_reaction', {
      p_message_id: messageId,
      p_emoji: emoji,
    });

    return !error;
  } catch {
    return false;
  }
}

export function getReactionsFromMessage(message: Message): Record<string, string[]> {
  return message.metadata?.reactions || {};
}

// ── Group Chat Functions ─────────────────────────────────────────────

export async function createGroupConversation(
  name: string,
  memberIds: string[],
): Promise<string | null> {
  try {
    const myId = getMyId();
    if (!myId) return null;

    const supabase = createClient();
    const { data: convoId, error } = await supabase.rpc('create_group_conversation', {
      p_creator: myId,
      p_name: name,
      p_member_ids: memberIds,
    });

    if (error || !convoId) {
      console.warn('[Chat] createGroupConversation RPC failed:', error?.message);
      return null;
    }

    await sendMessage(convoId, `Group "${name}" created`, 'system');
    return convoId;
  } catch (err) {
    console.warn('[Chat] createGroupConversation error:', err);
    return null;
  }
}

export async function getGroupMembers(conversationId: string): Promise<GroupMember[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('conversation_participants')
      .select(`
        user_id,
        role,
        profile:profiles!conversation_participants_user_id_fkey(display_name, avatar_url)
      `)
      .eq('conversation_id', conversationId);

    if (error || !data) return [];

    return data.map((p: any) => ({
      user_id: p.user_id,
      display_name: p.profile?.display_name || 'Unknown',
      avatar_url: p.profile?.avatar_url || null,
      role: p.role || 'member',
    }));
  } catch {
    return [];
  }
}

export async function addGroupMember(conversationId: string, userId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('conversation_participants')
      .insert({ conversation_id: conversationId, user_id: userId, role: 'member' });

    if (!error) {
      await sendMessage(conversationId, 'A new member was added', 'system');
    }
    return !error;
  } catch {
    return false;
  }
}

export async function removeGroupMember(conversationId: string, userId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('conversation_participants')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (!error) {
      await sendMessage(conversationId, 'A member was removed', 'system');
    }
    return !error;
  } catch {
    return false;
  }
}

export async function leaveConversation(conversationId: string): Promise<boolean> {
  try {
    const myId = getMyId();
    if (!myId) return false;

    const supabase = createClient();
    const { error } = await supabase
      .from('conversation_participants')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', myId);

    return !error;
  } catch {
    return false;
  }
}

// ── Pin / Unpin a Message ───────────────────────────────────────────

export async function pinMessage(messageId: string, pin: boolean): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: msg, error: readErr } = await supabase
      .from('messages')
      .select('metadata')
      .eq('id', messageId)
      .single();

    if (readErr || !msg) return false;

    const metadata = { ...(msg.metadata || {}), pinned: pin };
    const { error } = await supabase
      .from('messages')
      .update({ metadata })
      .eq('id', messageId);

    return !error;
  } catch {
    return false;
  }
}

export async function getPinnedMessages(conversationId: string): Promise<Message[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(display_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .contains('metadata', { pinned: true })
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((msg: any) => ({
      ...msg,
      sender_name: msg.sender?.display_name || 'Unknown',
      sender_avatar: msg.sender?.avatar_url || null,
    }));
  } catch {
    return [];
  }
}

// ── Set Member Role ─────────────────────────────────────────────────

export async function setMemberRole(
  conversationId: string,
  userId: string,
  role: 'admin' | 'member',
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('conversation_participants')
      .update({ role })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    return !error;
  } catch {
    return false;
  }
}

// ── Conversation preference toggles ──────────────────────────────────

async function updateParticipantField(
  conversationId: string,
  field: 'is_pinned' | 'is_muted' | 'is_archived',
  value: boolean,
): Promise<boolean> {
  try {
    const myId = getMyId();
    if (!myId) return false;
    const supabase = createClient();
    const { error } = await supabase
      .from('conversation_participants')
      .update({ [field]: value })
      .eq('conversation_id', conversationId)
      .eq('user_id', myId);
    return !error;
  } catch {
    return false;
  }
}

export function togglePinConversation(conversationId: string, pinned: boolean) {
  return updateParticipantField(conversationId, 'is_pinned', pinned);
}

export function toggleMuteConversation(conversationId: string, muted: boolean) {
  return updateParticipantField(conversationId, 'is_muted', muted);
}

export function toggleArchiveConversation(conversationId: string, archived: boolean) {
  return updateParticipantField(conversationId, 'is_archived', archived);
}

// ── Search Users (for new chat) ──────────────────────────────────────

export async function searchUsers(query: string): Promise<Array<{
  id: string;
  display_name: string;
  avatar_url: string | null;
  username: string | null;
  sun_sign: string | null;
}>> {
  try {
    if (!query.trim()) return [];
    const myId = getMyId();
    if (!myId) return [];

    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, username, sun_sign')
      .neq('id', myId)
      .or(`display_name.ilike.%${sanitizeSearchInput(query)}%,username.ilike.%${sanitizeSearchInput(query)}%`)
      .limit(20);

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

// ── Get Friends (for new chat / group creation) ──────────────────────

export async function getFriends(): Promise<Array<{
  id: string;
  display_name: string;
  avatar_url: string | null;
  sun_sign: string | null;
}>> {
  try {
    const myId = getMyId();
    if (!myId) return [];

    const supabase = createClient();
    // Get accepted friendships where I'm either user
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select('user_id, friend_id')
      .or(`user_id.eq.${myId},friend_id.eq.${myId}`)
      .eq('status', 'accepted');

    if (error || !friendships || friendships.length === 0) return [];

    const friendIds = friendships.map(f => f.user_id === myId ? f.friend_id : f.user_id);

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, sun_sign')
      .in('id', friendIds);

    return profiles || [];
  } catch {
    return [];
  }
}

// ── Upload Image to Supabase Storage ─────────────────────────────────

export async function uploadChatImage(
  conversationId: string,
  file: File,
): Promise<string | null> {
  try {
    const myId = getMyId();
    if (!myId) return null;

    const vErr = validateUpload(file, 'image');
    if (vErr) { console.warn('[Chat] image upload rejected:', vErr); return null; }

    const supabase = createClient();
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${conversationId}/${myId}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('chat-media')
      .upload(path, file);

    if (error) {
      console.warn('[Chat] Image upload failed:', error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('chat-media')
      .getPublicUrl(path);

    return urlData.publicUrl;
  } catch {
    return null;
  }
}
