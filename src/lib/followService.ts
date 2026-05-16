import { createClient } from '@/lib/supabase';

function getSupabase() {
  return createClient();
}

export async function followUser(myId: string, targetUserId: string): Promise<boolean> {
  if (!myId || myId === targetUserId) return false;

  const { error } = await getSupabase()
    .from('follows')
    .upsert(
      { follower_id: myId, following_id: targetUserId },
      { onConflict: 'follower_id,following_id', ignoreDuplicates: true }
    );

  if (error) {
    console.warn('[FollowService] followUser failed:', error.message);
    return false;
  }
  return true;
}

export async function unfollowUser(myId: string, targetUserId: string): Promise<boolean> {
  if (!myId) return false;

  const { error } = await getSupabase()
    .from('follows')
    .delete()
    .eq('follower_id', myId)
    .eq('following_id', targetUserId);

  if (error) {
    console.warn('[FollowService] unfollowUser failed:', error.message);
    return false;
  }
  return true;
}

export async function toggleFollow(myId: string, targetUserId: string): Promise<boolean> {
  const currentlyFollowing = await isFollowing(myId, targetUserId);
  if (currentlyFollowing) {
    const ok = await unfollowUser(myId, targetUserId);
    return ok ? false : true;
  } else {
    const ok = await followUser(myId, targetUserId);
    return ok ? true : false;
  }
}

export async function isFollowing(myId: string, targetUserId: string): Promise<boolean> {
  if (!myId) return false;

  try {
    const { data, error } = await getSupabase()
      .from('follows')
      .select('id')
      .eq('follower_id', myId)
      .eq('following_id', targetUserId)
      .maybeSingle();

    return !error && data !== null;
  } catch {
    return false;
  }
}

export async function getFollowing(myId: string): Promise<string[]> {
  if (!myId) return [];

  try {
    const { data, error } = await getSupabase()
      .from('follows')
      .select('following_id')
      .eq('follower_id', myId);

    if (error || !data) return [];
    return data.map((r: any) => r.following_id);
  } catch {
    return [];
  }
}

export async function getFollowers(myId: string): Promise<string[]> {
  if (!myId) return [];

  try {
    const { data, error } = await getSupabase()
      .from('follows')
      .select('follower_id')
      .eq('following_id', myId);

    if (error || !data) return [];
    return data.map((r: any) => r.follower_id);
  } catch {
    return [];
  }
}

export async function getFollowCounts(userId: string): Promise<{ following: number; followers: number }> {
  if (!userId) return { following: 0, followers: 0 };

  try {
    const [followingRes, followersRes] = await Promise.all([
      getSupabase()
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', userId),
      getSupabase()
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', userId),
    ]);

    return {
      following: followingRes.count ?? 0,
      followers: followersRes.count ?? 0,
    };
  } catch {
    return { following: 0, followers: 0 };
  }
}

export async function getFollowerProfiles(myId: string): Promise<Array<{
  id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  sun_sign: string | null;
}>> {
  if (!myId) return [];

  try {
    const { data, error } = await getSupabase()
      .from('follows')
      .select(`
        follower_id,
        profiles:follower_id ( id, display_name, username, avatar_url, sun_sign )
      `)
      .eq('following_id', myId);

    if (error || !data) return [];

    return data.map((row: any) => ({
      id: row.profiles?.id || row.follower_id,
      display_name: row.profiles?.display_name || 'User',
      username: row.profiles?.username || null,
      avatar_url: row.profiles?.avatar_url || null,
      sun_sign: row.profiles?.sun_sign || null,
    }));
  } catch {
    return [];
  }
}

export async function getFollowingProfiles(myId: string): Promise<Array<{
  id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  sun_sign: string | null;
}>> {
  if (!myId) return [];

  try {
    const { data, error } = await getSupabase()
      .from('follows')
      .select(`
        following_id,
        profiles:following_id ( id, display_name, username, avatar_url, sun_sign )
      `)
      .eq('follower_id', myId);

    if (error || !data) return [];

    return data.map((row: any) => ({
      id: row.profiles?.id || row.following_id,
      display_name: row.profiles?.display_name || 'User',
      username: row.profiles?.username || null,
      avatar_url: row.profiles?.avatar_url || null,
      sun_sign: row.profiles?.sun_sign || null,
    }));
  } catch {
    return [];
  }
}
