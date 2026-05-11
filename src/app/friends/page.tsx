'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { Users, UserPlus, UserCheck, Clock, X } from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { getZodiacGlyph } from '@/lib/utils';

type Tab = 'friends' | 'requests' | 'sent';

interface FriendProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
}

interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  profile: FriendProfile;
}

export default function FriendsPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('friends');
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [requests, setRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadFriends();
  }, [user]);

  async function loadFriends() {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();

    // Accepted friends (where I am user_id)
    const { data: myFriends } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id, status, created_at')
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    // Accepted friends (where I am friend_id)
    const { data: theirFriends } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id, status, created_at')
      .eq('friend_id', user.id)
      .eq('status', 'accepted');

    // Pending requests TO me
    const { data: pendingToMe } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id, status, created_at')
      .eq('friend_id', user.id)
      .eq('status', 'pending');

    // Pending requests FROM me
    const { data: pendingFromMe } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id, status, created_at')
      .eq('user_id', user.id)
      .eq('status', 'pending');

    // Gather friend IDs and load profiles
    const friendIds = new Set<string>();
    (myFriends || []).forEach(f => friendIds.add(f.friend_id));
    (theirFriends || []).forEach(f => friendIds.add(f.user_id));
    (pendingToMe || []).forEach(f => friendIds.add(f.user_id));
    (pendingFromMe || []).forEach(f => friendIds.add(f.friend_id));

    let profiles: Record<string, FriendProfile> = {};
    if (friendIds.size > 0) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, sun_sign, moon_sign, rising_sign')
        .in('id', Array.from(friendIds));
      if (profileData) {
        profileData.forEach((p: any) => { profiles[p.id] = p; });
      }
    }

    // Build friend list
    const acceptedList: Friendship[] = [
      ...(myFriends || []).map(f => ({ ...f, profile: profiles[f.friend_id] })),
      ...(theirFriends || []).map(f => ({ ...f, profile: profiles[f.user_id] })),
    ].filter(f => f.profile);

    const requestList: Friendship[] = (pendingToMe || [])
      .map(f => ({ ...f, profile: profiles[f.user_id] }))
      .filter(f => f.profile);

    const sentList: Friendship[] = (pendingFromMe || [])
      .map(f => ({ ...f, profile: profiles[f.friend_id] }))
      .filter(f => f.profile);

    setFriends(acceptedList);
    setRequests(requestList);
    setSentRequests(sentList);
    setLoading(false);
  }

  async function acceptRequest(friendshipId: string) {
    const supabase = createClient();
    await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);
    loadFriends();
  }

  async function declineRequest(friendshipId: string) {
    const supabase = createClient();
    await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);
    loadFriends();
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto card text-center py-12">
        <p className="text-text-muted">Please sign in to see your friends</p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'friends', label: 'Friends', count: friends.length },
    { key: 'requests', label: 'Requests', count: requests.length },
    { key: 'sent', label: 'Sent', count: sentRequests.length },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
          <Users className="w-7 h-7 text-accent-primary" />
          Friends
        </h1>
        <Link href="/discover" className="btn-primary text-sm flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Find People
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg-tertiary rounded-xl p-1 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-bg-card text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                tab === t.key ? 'bg-accent-primary/20 text-accent-primary' : 'bg-bg-secondary text-text-muted'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingCosmic label="Loading friends..." />
      ) : (
        <>
          {/* Friends list */}
          {tab === 'friends' && (
            <div className="space-y-2">
              {friends.length === 0 ? (
                <div className="card text-center py-10">
                  <Users className="w-10 h-10 text-text-muted mx-auto mb-3" />
                  <p className="text-text-muted mb-2">No friends yet</p>
                  <p className="text-xs text-text-muted mb-4">Find cosmic connections in Discover</p>
                  <Link href="/discover" className="btn-primary text-sm inline-flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Find People
                  </Link>
                </div>
              ) : (
                friends.map(f => (
                  <FriendCard key={f.id} profile={f.profile} />
                ))
              )}
            </div>
          )}

          {/* Requests */}
          {tab === 'requests' && (
            <div className="space-y-2">
              {requests.length === 0 ? (
                <div className="card text-center py-10">
                  <Clock className="w-10 h-10 text-text-muted mx-auto mb-3" />
                  <p className="text-text-muted">No pending requests</p>
                </div>
              ) : (
                requests.map(f => (
                  <div key={f.id} className="card flex items-center gap-3">
                    <Link href={`/user/${f.profile.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar profile={f.profile} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{f.profile.display_name}</p>
                        {f.profile.sun_sign && (
                          <p className="text-xs text-text-muted">
                            {getZodiacGlyph(f.profile.sun_sign)} {f.profile.sun_sign}
                          </p>
                        )}
                      </div>
                    </Link>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptRequest(f.id)}
                        className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => declineRequest(f.id)}
                        className="btn-ghost text-xs px-3 py-1.5 text-red-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Sent */}
          {tab === 'sent' && (
            <div className="space-y-2">
              {sentRequests.length === 0 ? (
                <div className="card text-center py-10">
                  <UserPlus className="w-10 h-10 text-text-muted mx-auto mb-3" />
                  <p className="text-text-muted">No pending sent requests</p>
                </div>
              ) : (
                sentRequests.map(f => (
                  <div key={f.id} className="card flex items-center gap-3">
                    <Link href={`/user/${f.profile.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar profile={f.profile} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{f.profile.display_name}</p>
                        {f.profile.sun_sign && (
                          <p className="text-xs text-text-muted">
                            {getZodiacGlyph(f.profile.sun_sign)} {f.profile.sun_sign}
                          </p>
                        )}
                      </div>
                    </Link>
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Avatar({ profile }: { profile: FriendProfile }) {
  return (
    <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0">
      {profile.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
      ) : (
        <span className="text-sm font-bold text-accent-primary">
          {(profile.display_name || '?')[0].toUpperCase()}
        </span>
      )}
    </div>
  );
}

function FriendCard({ profile }: { profile: FriendProfile }) {
  return (
    <Link href={`/user/${profile.id}`} className="card flex items-center gap-3 hover:border-accent-primary/30 transition-colors">
      <Avatar profile={profile} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{profile.display_name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {profile.sun_sign && (
            <span className="text-xs text-text-muted">
              {getZodiacGlyph(profile.sun_sign)} {profile.sun_sign}
            </span>
          )}
          {profile.moon_sign && (
            <span className="text-xs text-text-muted">
              {getZodiacGlyph(profile.moon_sign)} {profile.moon_sign}
            </span>
          )}
          {profile.rising_sign && (
            <span className="text-xs text-text-muted">
              {getZodiacGlyph(profile.rising_sign)} {profile.rising_sign}
            </span>
          )}
        </div>
      </div>
      <span className="text-xl text-text-muted">›</span>
    </Link>
  );
}
