'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { ArrowLeft, Users, UserPlus, Search, MessageCircle, X, Check, Loader2 } from 'lucide-react';
import { sanitizeSearchInput } from '@/lib/sanitize';

const SIGN_GLYPHS: Record<string, string> = {
  Aries:'♈', Taurus:'♉', Gemini:'♊', Cancer:'♋', Leo:'♌', Virgo:'♍',
  Libra:'♎', Scorpio:'♏', Sagittarius:'♐', Capricorn:'♑', Aquarius:'♒', Pisces:'♓',
};

type Tab = 'friends' | 'requests' | 'find';

interface FriendProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  sun_sign: string | null;
}

interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  profile: FriendProfile;
}

export default function FriendsPage() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const [tab, setTab] = useState<Tab>('friends');
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const supabase = createClient();
  const userId = profile?.id;

  useEffect(() => {
    if (!userId) return;
    if (tab === 'friends') fetchFriends();
    if (tab === 'requests') fetchRequests();
  }, [tab, userId]);

  async function fetchFriends() {
    if (!userId) return;
    setLoading(true);
    const { data: rows } = await supabase
      .from('friendships')
      .select('user_id, friend_id')
      .eq('status', 'accepted')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

    if (!rows || rows.length === 0) {
      setFriends([]);
      setLoading(false);
      return;
    }

    const friendIds = rows.map(r => r.user_id === userId ? r.friend_id : r.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, sun_sign')
      .in('id', friendIds);

    setFriends(profiles || []);
    setLoading(false);
  }

  async function fetchRequests() {
    if (!userId) return;
    setLoading(true);

    const { data: inRows } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id, status, created_at')
      .eq('friend_id', userId)
      .eq('status', 'pending');

    if (inRows && inRows.length > 0) {
      const senderIds = inRows.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, sun_sign')
        .in('id', senderIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      setIncoming(inRows.map(r => ({
        ...r,
        profile: profileMap.get(r.user_id) || { id: r.user_id, display_name: 'Unknown', avatar_url: null, sun_sign: null },
      })));
    } else {
      setIncoming([]);
    }

    const { data: outRows } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id, status, created_at')
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (outRows && outRows.length > 0) {
      const recipientIds = outRows.map(r => r.friend_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, sun_sign')
        .in('id', recipientIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      setOutgoing(outRows.map(r => ({
        ...r,
        profile: profileMap.get(r.friend_id) || { id: r.friend_id, display_name: 'Unknown', avatar_url: null, sun_sign: null },
      })));
    } else {
      setOutgoing([]);
    }

    setLoading(false);
  }

  async function handleSearch() {
    if (!searchQuery.trim() || !userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, sun_sign')
      .ilike('display_name', `%${sanitizeSearchInput(searchQuery.trim())}%`)
      .neq('id', userId)
      .limit(20);

    setSearchResults(data || []);
    setLoading(false);
  }

  async function addFriend(friendId: string) {
    if (!userId) return;
    setActionLoading(friendId);
    await supabase.from('friendships').insert({ user_id: userId, friend_id: friendId, status: 'pending' });
    setSearchResults(prev => prev.filter(p => p.id !== friendId));
    setActionLoading(null);
  }

  async function acceptRequest(requestId: string) {
    setActionLoading(requestId);
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', requestId);
    setIncoming(prev => prev.filter(r => r.id !== requestId));
    setActionLoading(null);
  }

  async function declineRequest(requestId: string) {
    setActionLoading(requestId);
    await supabase.from('friendships').update({ status: 'declined' }).eq('id', requestId);
    setIncoming(prev => prev.filter(r => r.id !== requestId));
    setActionLoading(null);
  }

  async function cancelRequest(requestId: string) {
    setActionLoading(requestId);
    await supabase.from('friendships').delete().eq('id', requestId);
    setOutgoing(prev => prev.filter(r => r.id !== requestId));
    setActionLoading(null);
  }

  async function removeFriend(friendId: string) {
    if (!userId) return;
    setActionLoading(friendId);
    await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);
    setFriends(prev => prev.filter(f => f.id !== friendId));
    setActionLoading(null);
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'friends', label: 'Friends', icon: <Users size={16} /> },
    { key: 'requests', label: 'Requests', icon: <UserPlus size={16} /> },
    { key: 'find', label: 'Find', icon: <Search size={16} /> },
  ];

  function renderAvatar(p: FriendProfile) {
    return (
      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
        {p.avatar_url ? (
          <img src={p.avatar_url} alt={p.display_name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg text-text-muted">{p.display_name?.[0]?.toUpperCase() || '?'}</span>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/settings" className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <ArrowLeft size={20} className="text-text-primary" />
          </Link>
          <h1 className="text-xl font-bold text-text-primary">{t('settings.friends.title')}</h1>
        </div>

        <div className="flex gap-1 p-1 rounded-xl bg-white/5 mb-6">
          {tabs.map(tab_item => (
            <button
              key={tab_item.key}
              onClick={() => setTab(tab_item.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                tab === tab_item.key ? 'bg-white/10 text-text-primary' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab_item.icon}
              {tab_item.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-text-muted" />
          </div>
        )}

        {!loading && tab === 'friends' && (
          <div className="space-y-3">
            <p className="text-sm text-text-muted mb-4">{friends.length} friend{friends.length !== 1 ? 's' : ''}</p>
            {friends.length === 0 && (
              <p className="text-center text-text-muted py-8">No friends yet. Use the Find tab to connect with people.</p>
            )}
            {friends.map(f => (
              <div key={f.id} className="card p-4 flex items-center gap-3">
                {renderAvatar(f)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{f.display_name}</p>
                  {f.sun_sign && (
                    <p className="text-xs text-text-muted">{SIGN_GLYPHS[f.sun_sign] || ''} {f.sun_sign}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/chat/${f.id}`}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <MessageCircle size={16} className="text-text-muted" />
                  </Link>
                  <button
                    onClick={() => removeFriend(f.id)}
                    disabled={actionLoading === f.id}
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors"
                  >
                    {actionLoading === f.id ? <Loader2 size={16} className="animate-spin text-text-muted" /> : <X size={16} className="text-red-400" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === 'requests' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-text-primary mb-3">Incoming ({incoming.length})</h2>
              {incoming.length === 0 && <p className="text-sm text-text-muted">No pending requests.</p>}
              <div className="space-y-3">
                {incoming.map(r => (
                  <div key={r.id} className="card p-4 flex items-center gap-3">
                    {renderAvatar(r.profile)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{r.profile.display_name}</p>
                      {r.profile.sun_sign && (
                        <p className="text-xs text-text-muted">{SIGN_GLYPHS[r.profile.sun_sign] || ''} {r.profile.sun_sign}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptRequest(r.id)}
                        disabled={actionLoading === r.id}
                        className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors"
                      >
                        {actionLoading === r.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} className="text-green-400" />}
                      </button>
                      <button
                        onClick={() => declineRequest(r.id)}
                        disabled={actionLoading === r.id}
                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                      >
                        <X size={16} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-text-primary mb-3">Sent ({outgoing.length})</h2>
              {outgoing.length === 0 && <p className="text-sm text-text-muted">No sent requests.</p>}
              <div className="space-y-3">
                {outgoing.map(r => (
                  <div key={r.id} className="card p-4 flex items-center gap-3">
                    {renderAvatar(r.profile)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{r.profile.display_name}</p>
                      {r.profile.sun_sign && (
                        <p className="text-xs text-text-muted">{SIGN_GLYPHS[r.profile.sun_sign] || ''} {r.profile.sun_sign}</p>
                      )}
                    </div>
                    <button
                      onClick={() => cancelRequest(r.id)}
                      disabled={actionLoading === r.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-text-muted transition-colors"
                    >
                      {actionLoading === r.id ? <Loader2 size={14} className="animate-spin" /> : 'Cancel'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && tab === 'find' && (
          <div>
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-border-primary text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-white/20"
              />
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
                className="btn-primary px-4 py-2.5 rounded-xl"
              >
                <Search size={16} />
              </button>
            </div>
            {searchResults.length === 0 && searchQuery && !loading && (
              <p className="text-center text-text-muted py-8">No results found.</p>
            )}
            <div className="space-y-3">
              {searchResults.map(p => (
                <div key={p.id} className="card p-4 flex items-center gap-3">
                  {renderAvatar(p)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{p.display_name}</p>
                    {p.sun_sign && (
                      <p className="text-xs text-text-muted">{SIGN_GLYPHS[p.sun_sign] || ''} {p.sun_sign}</p>
                    )}
                  </div>
                  <button
                    onClick={() => addFriend(p.id)}
                    disabled={actionLoading === p.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium btn-primary"
                  >
                    {actionLoading === p.id ? <Loader2 size={14} className="animate-spin" /> : 'Add Friend'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
