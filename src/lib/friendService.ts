// ═══════════════════════════════════════════════════════════════════
// Friend / Connection Service — Supabase-first (Web port)
// Friend requests, accept/decline, remove, block, search, status
// ═══════════════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

// ── Types ──

export type RelationshipStatus =
  | 'none'
  | 'outgoing_pending'
  | 'incoming_pending'
  | 'friends'
  | 'blocked'
  | 'blocked_by';

export interface FriendProfile {
  friend_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
  is_online: boolean;
  last_seen: string;
  friends_since: string;
  friendship_id: string;
  is_subscribed?: boolean;
  /** Profile creation timestamp — used by data export. Optional as some callers
   * return FriendProfile from joins that don't select this column. */
  created_at?: string;
}

export interface FriendRequest {
  friendship_id: string;
  from_user_id: string;
  target_user_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
  created_at: string;
}

export interface FriendActionResult {
  success: boolean;
  error?: string;
}

export interface SearchUserResult {
  id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  align_code: string | null;
  bio: string | null;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
}

// ── Helpers ──

function getMyId(): string | null {
  return useAuthStore.getState().user?.id || null;
}

// ── Get Friends List ──
export async function getFriends(): Promise<FriendProfile[]> {
  try {
    const supabase = createClient();
    const myId = getMyId();
    if (!myId) return [];

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        user_id,
        friend_id,
        created_at,
        profiles_user:profiles!friendships_user_id_fkey(id, display_name, username, avatar_url, sun_sign, moon_sign, rising_sign, is_online, last_seen),
        profiles_friend:profiles!friendships_friend_id_fkey(id, display_name, username, avatar_url, sun_sign, moon_sign, rising_sign, is_online, last_seen)
      `)
      .eq('status', 'accepted')
      .or(`user_id.eq.${myId},friend_id.eq.${myId}`);

    if (error || !data) return [];

    return data.map((row: any) => {
      const isUser = row.user_id === myId;
      const friend = isUser ? row.profiles_friend : row.profiles_user;
      return {
        friend_id: friend?.id || (isUser ? row.friend_id : row.user_id),
        display_name: friend?.display_name || 'Unknown',
        username: friend?.username || null,
        avatar_url: friend?.avatar_url || null,
        sun_sign: friend?.sun_sign || null,
        moon_sign: friend?.moon_sign || null,
        rising_sign: friend?.rising_sign || null,
        is_online: friend?.is_online || false,
        last_seen: friend?.last_seen || '',
        friends_since: row.created_at,
        friendship_id: row.id,
      };
    });
  } catch {
    return [];
  }
}

// ── Get Incoming Friend Requests ──
export async function getIncomingRequests(): Promise<FriendRequest[]> {
  try {
    const supabase = createClient();
    const myId = getMyId();
    if (!myId) return [];

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        initiated_by,
        created_at,
        sender:profiles!friendships_initiated_by_fkey(id, display_name, username, avatar_url, sun_sign, moon_sign, rising_sign)
      `)
      .eq('status', 'pending')
      .neq('initiated_by', myId)
      .or(`user_id.eq.${myId},friend_id.eq.${myId}`);

    if (error || !data) return [];

    return data.map((row: any) => ({
      friendship_id: row.id,
      from_user_id: row.initiated_by,
      target_user_id: row.initiated_by,
      display_name: row.sender?.display_name || 'Unknown',
      username: row.sender?.username || null,
      avatar_url: row.sender?.avatar_url || null,
      sun_sign: row.sender?.sun_sign || null,
      moon_sign: row.sender?.moon_sign || null,
      rising_sign: row.sender?.rising_sign || null,
      created_at: row.created_at,
    }));
  } catch {
    return [];
  }
}

// ── Get Outgoing Friend Requests ──
export async function getOutgoingRequests(): Promise<FriendRequest[]> {
  try {
    const supabase = createClient();
    const myId = getMyId();
    if (!myId) return [];

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        user_id,
        friend_id,
        created_at,
        profiles_user:profiles!friendships_user_id_fkey(id, display_name, username, avatar_url, sun_sign),
        profiles_friend:profiles!friendships_friend_id_fkey(id, display_name, username, avatar_url, sun_sign)
      `)
      .eq('status', 'pending')
      .eq('initiated_by', myId);

    if (error || !data) return [];

    return data.map((row: any) => {
      const isUser = row.user_id === myId;
      const target = isUser ? row.profiles_friend : row.profiles_user;
      const targetId = target?.id || (isUser ? row.friend_id : row.user_id);
      return {
        friendship_id: row.id,
        from_user_id: myId,
        target_user_id: targetId,
        display_name: target?.display_name || 'Unknown',
        username: target?.username || null,
        avatar_url: target?.avatar_url || null,
        sun_sign: target?.sun_sign || null,
        moon_sign: null,
        rising_sign: null,
        created_at: row.created_at,
      };
    });
  } catch {
    return [];
  }
}

// ── Send Friend Request ──
export async function sendFriendRequest(targetUserId: string): Promise<FriendActionResult> {
  try {
    const supabase = createClient();
    const myId = getMyId();
    if (!myId) return { success: false, error: 'Not authenticated.' };
    if (myId === targetUserId) return { success: false, error: 'Cannot send request to yourself.' };

    // Check if blocked
    const { data: blockCheck } = await supabase
      .from('blocks')
      .select('id')
      .or(`and(blocker_id.eq.${myId},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${myId})`)
      .limit(1);

    if (blockCheck && blockCheck.length > 0) {
      return { success: false, error: 'Cannot send request to this user.' };
    }

    // Use the create_friendship function for normalized ordering
    const { error } = await supabase.rpc('create_friendship', {
      p_from_user: myId,
      p_to_user: targetUserId,
    });

    if (error) {
      if (error.message.includes('already exists')) {
        return { success: false, error: 'Request already exists.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to send request.' };
  }
}

// ── Accept Friend Request ──
export async function acceptFriendRequest(friendshipId: string): Promise<FriendActionResult> {
  try {
    const supabase = createClient();
    const myId = getMyId();
    if (!myId) return { success: false, error: 'Not authenticated.' };

    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)
      .eq('status', 'pending')
      .neq('initiated_by', myId); // Can only accept requests from others

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to accept request.' };
  }
}

// ── Decline Friend Request ──
export async function declineFriendRequest(friendshipId: string): Promise<FriendActionResult> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('friendships')
      .update({ status: 'declined' })
      .eq('id', friendshipId)
      .eq('status', 'pending');

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to decline request.' };
  }
}

// ── Cancel Sent Friend Request ──
export async function cancelFriendRequest(friendshipId: string): Promise<FriendActionResult> {
  try {
    const supabase = createClient();
    const myId = getMyId();
    if (!myId) return { success: false, error: 'Not authenticated.' };

    const { error } = await supabase
      .from('friendships')
      .update({ status: 'removed' })
      .eq('id', friendshipId)
      .eq('initiated_by', myId)
      .eq('status', 'pending');

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to cancel request.' };
  }
}

// ── Remove Friend ──
export async function removeFriend(friendshipId: string): Promise<FriendActionResult> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('friendships')
      .update({ status: 'removed' })
      .eq('id', friendshipId)
      .eq('status', 'accepted');

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to remove friend.' };
  }
}

// ── Block User ──
export async function blockUser(targetUserId: string): Promise<FriendActionResult> {
  try {
    const supabase = createClient();
    const myId = getMyId();
    if (!myId) return { success: false, error: 'Not authenticated.' };

    const { error } = await supabase.rpc('block_user', {
      p_blocker: myId,
      p_blocked: targetUserId,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to block user.' };
  }
}

// ── Unblock User ──
export async function unblockUser(targetUserId: string): Promise<FriendActionResult> {
  try {
    const supabase = createClient();
    const myId = getMyId();
    if (!myId) return { success: false, error: 'Not authenticated.' };

    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('blocker_id', myId)
      .eq('blocked_id', targetUserId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to unblock user.' };
  }
}

// ── Get Blocked Users ──
export async function getBlockedUsers(): Promise<Array<{ id: string; blocked_id: string; display_name: string; created_at: string }>> {
  try {
    const supabase = createClient();
    const myId = getMyId();
    if (!myId) return [];

    const { data, error } = await supabase
      .from('blocks')
      .select(`
        id,
        blocked_id,
        created_at,
        blocked:profiles!blocks_blocked_id_fkey(display_name)
      `)
      .eq('blocker_id', myId);

    if (error || !data) return [];
    return data.map((row: any) => ({
      id: row.id,
      blocked_id: row.blocked_id,
      display_name: row.blocked?.display_name || 'Unknown',
      created_at: row.created_at,
    }));
  } catch {
    return [];
  }
}

// ── Get Relationship Status with another user ──
export async function getRelationshipStatus(targetUserId: string): Promise<RelationshipStatus> {
  try {
    const supabase = createClient();
    const myId = getMyId();
    if (!myId) return 'none';

    // Check blocks first
    const { data: blocks } = await supabase
      .from('blocks')
      .select('blocker_id')
      .or(`and(blocker_id.eq.${myId},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${myId})`)
      .limit(1);

    if (blocks && blocks.length > 0) {
      return blocks[0].blocker_id === myId ? 'blocked' : 'blocked_by';
    }

    // Check friendships
    const u1 = myId < targetUserId ? myId : targetUserId;
    const u2 = myId < targetUserId ? targetUserId : myId;

    const { data: friendship } = await supabase
      .from('friendships')
      .select('status, initiated_by')
      .eq('user_id', u1)
      .eq('friend_id', u2)
      .in('status', ['pending', 'accepted'])
      .single();

    if (!friendship) return 'none';

    if (friendship.status === 'accepted') return 'friends';
    if (friendship.status === 'pending') {
      return friendship.initiated_by === myId ? 'outgoing_pending' : 'incoming_pending';
    }

    return 'none';
  } catch {
    return 'none';
  }
}

// ── Get Friend Count ──
export async function getFriendCount(): Promise<number> {
  try {
    const supabase = createClient();
    const myId = getMyId();
    if (!myId) return 0;

    const { count, error } = await supabase
      .from('friendships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'accepted')
      .or(`user_id.eq.${myId},friend_id.eq.${myId}`);

    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}

// ── Get Pending Request Count ──
export async function getPendingRequestCount(): Promise<number> {
  try {
    const supabase = createClient();
    const myId = getMyId();
    if (!myId) return 0;

    const { count, error } = await supabase
      .from('friendships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .neq('initiated_by', myId)
      .or(`user_id.eq.${myId},friend_id.eq.${myId}`);

    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}

// ── Subscribe to Friend Changes (realtime) ──
export function subscribeFriendships(
  callback: (payload: any) => void,
): { unsubscribe: () => void } {
  const supabase = createClient();
  const myId = getMyId();
  if (!myId) return { unsubscribe: () => {} };

  const channel = supabase
    .channel('friendships-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'friendships',
        filter: `user_id=eq.${myId}`,
      },
      callback,
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'friendships',
        filter: `friend_id=eq.${myId}`,
      },
      callback,
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

/**
 * Get mutual friends between current user and target user.
 */
export async function getMutualFriends(targetUserId: string): Promise<FriendProfile[]> {
  try {
    const supabase = createClient();
    const myId = getMyId();
    if (!myId) return [];

    // Get my friends
    const myFriends = await getFriends();
    const myFriendIds = new Set(myFriends.map(f => f.friend_id));

    // Get target's friends by querying friendships table
    const { data: targetFriendships, error } = await supabase
      .from('friendships')
      .select('user_id, friend_id')
      .or(`user_id.eq.${targetUserId},friend_id.eq.${targetUserId}`)
      .eq('status', 'accepted');

    if (error || !targetFriendships) return [];

    const targetFriendIds = new Set<string>();
    for (const f of targetFriendships) {
      const otherId = f.user_id === targetUserId ? f.friend_id : f.user_id;
      targetFriendIds.add(otherId);
    }

    // Intersection
    return myFriends.filter(f => targetFriendIds.has(f.friend_id));
  } catch {
    return [];
  }
}

// ── Get Suggested Friends ──
export async function getSuggestedFriends(limit = 5): Promise<SearchUserResult[]> {
  try {
    const supabase = createClient();
    const myId = getMyId();
    if (!myId) return [];

    // Get existing friend/pending IDs to exclude
    const { data: existing } = await supabase
      .from('friendships')
      .select('user_id, friend_id')
      .or(`user_id.eq.${myId},friend_id.eq.${myId}`)
      .in('status', ['accepted', 'pending']);

    const excludeIds = new Set<string>([myId]);
    (existing || []).forEach((row: any) => {
      excludeIds.add(row.user_id);
      excludeIds.add(row.friend_id);
    });

    // Get blocked user IDs
    const { data: blocks } = await supabase
      .from('blocks')
      .select('blocker_id, blocked_id')
      .or(`blocker_id.eq.${myId},blocked_id.eq.${myId}`);

    (blocks || []).forEach((row: any) => {
      excludeIds.add(row.blocker_id);
      excludeIds.add(row.blocked_id);
    });

    const excludeArr = Array.from(excludeIds);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url, sun_sign, moon_sign, rising_sign, bio, align_code')
      .not('id', 'in', `(${excludeArr.join(',')})`)
      .not('display_name', 'is', null)
      .limit(limit);

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

// ── Search Users ──
export async function searchUsers(query: string): Promise<SearchUserResult[]> {
  const supabase = createClient();
  const myId = useAuthStore.getState().user?.id;
  if (!myId || query.trim().length < 2) return [];

  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, username, avatar_url, align_code, bio, sun_sign, moon_sign, rising_sign')
    .or(`display_name.ilike.%${query}%,username.ilike.%${query}%,align_code.ilike.%${query}%`)
    .neq('id', myId)
    .limit(20);

  return data || [];
}
