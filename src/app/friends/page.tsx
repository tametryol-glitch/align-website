'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { useFriendsStore } from '@/stores/friendsStore';
import {
  getFriends,
  getIncomingRequests,
  getOutgoingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
  blockUser,
  searchUsers,
  subscribeFriendships,
  getSuggestedFriends,
  type FriendProfile,
  type FriendRequest,
  type SearchUserResult,
} from '@/lib/friendService';
import { getOrCreateConversation } from '@/lib/messagingService';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { getZodiacGlyph } from '@/lib/utils';
import {
  Users, UserPlus, UserCheck, Clock, X, Search,
  MessageCircle, Shield, UserMinus, Loader2,
  RefreshCw,
} from 'lucide-react';

// ── Types ──

type TabKey = 'friends' | 'requests' | 'search';

// ── Main Component ──────────────────────────────────────────────────

export default function FriendsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const friends = useFriendsStore((s) => s.friends);
  const friendsLoading = useFriendsStore((s) => s.friendsLoading);
  const friendCount = useFriendsStore((s) => s.friendCount);
  const incomingRequests = useFriendsStore((s) => s.incomingRequests);
  const outgoingRequests = useFriendsStore((s) => s.outgoingRequests);
  const pendingRequestCount = useFriendsStore((s) => s.pendingRequestCount);
  const activeTab = useFriendsStore((s) => s.activeTab);
  const searchQuery = useFriendsStore((s) => s.searchQuery);
  const searchResults = useFriendsStore((s) => s.searchResults);
  const searching = useFriendsStore((s) => s.searching);

  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SearchUserResult[]>([]);

  // Profile preview modal state
  const [previewUser, setPreviewUser] = useState<SearchUserResult | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    destructive?: boolean;
  } | null>(null);

  // Context menu state (right-click on friend cards)
  const [contextMenu, setContextMenu] = useState<{
    friend: FriendProfile;
    x: number;
    y: number;
  } | null>(null);

  // Search debounce ref
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load Data ──

  const loadData = useCallback(async () => {
    const s = useFriendsStore.getState();
    s.setFriendsLoading(true);
    const [friendsList, incoming, outgoing] = await Promise.all([
      getFriends(),
      getIncomingRequests(),
      getOutgoingRequests(),
    ]);
    const s2 = useFriendsStore.getState();
    s2.setFriends(friendsList);
    s2.setIncomingRequests(incoming);
    s2.setOutgoingRequests(outgoing);
    s2.setFriendsLoading(false);

    getSuggestedFriends(6).then(setSuggestions);
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  // ── Realtime subscription ──

  useEffect(() => {
    if (!user) return;
    const sub = subscribeFriendships(() => {
      loadData();
    });
    return () => sub.unsubscribe();
  }, [user, loadData]);

  // ── Refresh ──

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // ── Search ──

  const handleSearch = useCallback((query: string) => {
    const s = useFriendsStore.getState();
    s.setSearchQuery(query);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (query.trim().length < 2) {
      s.setSearchResults([]);
      s.setSearching(false);
      return;
    }

    s.setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchUsers(query);
      const s2 = useFriendsStore.getState();
      s2.setSearchResults(results);
      s2.setSearching(false);
    }, 300);
  }, []);

  // ── Actions ──

  const handleSendRequest = useCallback(async (userId: string) => {
    setActionLoading(userId);
    const result = await sendFriendRequest(userId);
    if (!result.success) {
      setConfirmDialog({
        title: 'Error',
        message: result.error || 'Failed to send request.',
        onConfirm: () => setConfirmDialog(null),
      });
    }
    await loadData();
    setActionLoading(null);
  }, [loadData]);

  const handleAccept = useCallback(async (friendshipId: string) => {
    setActionLoading(friendshipId);
    useFriendsStore.getState().removeRequestOptimistic(friendshipId);
    const result = await acceptFriendRequest(friendshipId);
    if (!result.success) {
      setConfirmDialog({
        title: 'Error',
        message: result.error || 'Failed to accept request.',
        onConfirm: () => setConfirmDialog(null),
      });
    }
    await loadData();
    setActionLoading(null);
  }, [loadData]);

  const handleDecline = useCallback(async (friendshipId: string) => {
    setActionLoading(friendshipId);
    useFriendsStore.getState().removeRequestOptimistic(friendshipId);
    await declineFriendRequest(friendshipId);
    await loadData();
    setActionLoading(null);
  }, [loadData]);

  const handleCancel = useCallback(async (friendshipId: string) => {
    setActionLoading(friendshipId);
    useFriendsStore.getState().removeRequestOptimistic(friendshipId);
    await cancelFriendRequest(friendshipId);
    await loadData();
    setActionLoading(null);
  }, [loadData]);

  const handleRemove = useCallback((friend: FriendProfile) => {
    setConfirmDialog({
      title: 'Remove Friend',
      message: `Remove ${friend.display_name} from your friends?`,
      destructive: true,
      onConfirm: async () => {
        setConfirmDialog(null);
        useFriendsStore.getState().removeFriendOptimistic(friend.friendship_id);
        await removeFriend(friend.friendship_id);
        await loadData();
      },
    });
  }, [loadData]);

  const handleBlock = useCallback((userId: string, name: string) => {
    setConfirmDialog({
      title: 'Block User',
      message: `Block ${name}? They won't be able to contact you.`,
      destructive: true,
      onConfirm: async () => {
        setConfirmDialog(null);
        await blockUser(userId);
        await loadData();
      },
    });
  }, [loadData]);

  const handleMessage = useCallback(async (userId: string) => {
    const convoId = await getOrCreateConversation(userId);
    if (convoId) {
      router.push(`/messages?conversation=${convoId}`);
    }
  }, [router]);

  // ── Profile Preview ──

  const openPreview = useCallback((user: SearchUserResult) => {
    setPreviewUser(user);
    setPreviewVisible(true);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewVisible(false);
    setPreviewUser(null);
  }, []);

  // ── Context menu close on click ──

  useEffect(() => {
    function handleClick() {
      setContextMenu(null);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // ── Lookup sets for search result states ──

  const friendIds = useMemo(
    () => new Set(friends.map(f => f.friend_id)),
    [friends],
  );
  const outgoingTargetIds = useMemo(
    () => new Set(outgoingRequests.map(r => r.target_user_id)),
    [outgoingRequests],
  );
  const incomingFromIds = useMemo(
    () => new Set(incomingRequests.map(r => r.from_user_id)),
    [incomingRequests],
  );

  // ── Get preview action ──

  const getPreviewAction = useCallback((u: SearchUserResult): { label: string; action: () => void } | null => {
    if (friendIds.has(u.id)) {
      return { label: 'Message', action: () => { closePreview(); handleMessage(u.id); } };
    }
    if (outgoingTargetIds.has(u.id)) return null;
    if (incomingFromIds.has(u.id)) {
      const req = incomingRequests.find(r => r.from_user_id === u.id);
      if (req) return { label: 'Accept Request', action: () => { closePreview(); handleAccept(req.friendship_id); } };
    }
    return { label: 'Add Friend', action: () => { closePreview(); handleSendRequest(u.id); } };
  }, [friendIds, outgoingTargetIds, incomingFromIds, incomingRequests, closePreview, handleMessage, handleAccept, handleSendRequest]);

  // Combined requests list
  const requestData = useMemo(
    () => [...incomingRequests, ...outgoingRequests],
    [incomingRequests, outgoingRequests],
  );

  // ── Auth guard ──

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto card text-center py-12">
        <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <p className="text-text-muted">{t('auth.signInToAccess')}</p>
      </div>
    );
  }

  // ── Tabs ──

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'friends', label: t('friends.tabs.friends'), count: friendCount },
    { key: 'requests', label: t('friends.tabs.requests'), count: pendingRequestCount },
    { key: 'search', label: t('friends.tabs.search') },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[28px] font-display font-bold text-text-primary tracking-tight">
          {t('friends.title')}
        </h1>
        <p className="text-xs text-text-muted mt-0.5">
          {t('friends.friendCount', { count: friendCount })}{pendingRequestCount > 0 ? ` · ${t('friends.pendingCount', { count: pendingRequestCount })}` : ''}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.share) {
                navigator.share({ title: 'Join me on Align!', text: 'Check out Align — AI Astrology & Cosmic Connections', url: 'https://aligncosmic.com' }).catch(() => {});
              } else {
                navigator.clipboard.writeText('https://aligncosmic.com');
              }
            }}
            className="px-4 py-2 rounded-full text-xs font-semibold transition-colors"
            style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: '#9B6FF6' }}
          >
            ✉️ {t('friends.inviteFriends')}
          </button>
          {profile?.align_code && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(profile.align_code || '');
              }}
              className="px-4 py-2 rounded-full text-xs font-semibold transition-colors"
              style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: '#9B6FF6' }}
              title={`Your code: ${profile.align_code}`}
            >
              📱 {t('friends.qrCode')}
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-text-muted hover:text-text-primary transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => useFriendsStore.getState().setActiveTab(tab.key)}
            className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all text-center"
            style={{
              backgroundColor: activeTab === tab.key ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${activeTab === tab.key ? '#9B6FF6' : '#3D4760'}`,
              color: activeTab === tab.key ? '#9B6FF6' : 'rgba(255,255,255,0.45)',
              fontWeight: activeTab === tab.key ? 600 : 400,
            }}
          >
            {tab.key === 'friends' ? `${t('friends.tabs.friends')} (${friendCount})` :
             tab.key === 'requests' ? `${t('friends.tabs.requests')}${pendingRequestCount > 0 ? ` (${pendingRequestCount})` : ''}` :
             t('friends.tabs.search')}
          </button>
        ))}
      </div>

      {/* ── Friends Tab ── */}
      {activeTab === 'friends' && (
        <div>
          {/* People You May Know - suggestions */}
          {suggestions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-text-primary mb-3">{t('friends.suggestionsTitle')}</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    className="flex-shrink-0 flex flex-col items-center transition-colors"
                    style={{
                      width: 120,
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderRadius: 12,
                      padding: 10,
                      border: '1px solid #3D4760',
                    }}
                  >
                    <Link href={`/user/${s.id}`} className="cursor-pointer">
                      <UserAvatar
                        avatarUrl={s.avatar_url}
                        displayName={s.display_name}
                        size="md"
                      />
                    </Link>
                    <p className="text-xs font-semibold text-text-primary mt-2 text-center truncate w-full">
                      {s.display_name}
                    </p>
                    {(s as any).reason && (
                      <p className="text-text-muted text-center truncate w-full" style={{ fontSize: 9, marginTop: 2 }}>
                        {(s as any).reason}
                      </p>
                    )}
                    {s.sun_sign && !(s as any).reason && (
                      <p className="text-text-muted mt-0.5 text-center" style={{ fontSize: 9 }}>
                        {getZodiacGlyph(s.sun_sign)} {s.sun_sign}
                      </p>
                    )}
                    <button
                      onClick={() => handleSendRequest(s.id)}
                      disabled={actionLoading === s.id}
                      className="mt-2 rounded-full transition-colors disabled:opacity-50"
                      style={{
                        backgroundColor: 'rgba(139,92,246,0.15)',
                        color: '#8B5CF6',
                        paddingLeft: 12,
                        paddingRight: 12,
                        paddingTop: 4,
                        paddingBottom: 4,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {actionLoading === s.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        t('friends.addButton')
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friend list */}
          {friendsLoading ? (
            <LoadingCosmic label={t('common.loading')} />
          ) : friends.length === 0 ? (
            <div className="card text-center py-12">
              <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-primary font-medium mb-1">{t('friends.empty.noFriends')}</p>
              <p className="text-xs text-text-muted mb-4">
                {t('friends.empty.noFriendsHint')}
              </p>
              <Link href="/discover" className="btn-primary text-sm inline-flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> {t('friends.empty.findPeople')}
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map(friend => (
                <FriendCard
                  key={friend.friendship_id}
                  friend={friend}
                  actionLoading={actionLoading}
                  onMessage={() => handleMessage(friend.friend_id)}
                  onRemove={() => handleRemove(friend)}
                  onBlock={() => handleBlock(friend.friend_id, friend.display_name)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setContextMenu({ friend, x: e.clientX, y: e.clientY });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Requests Tab ── */}
      {activeTab === 'requests' && (
        <div>
          {requestData.length === 0 ? (
            <div className="card text-center py-12">
              <Clock className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-primary font-medium mb-1">{t('friends.empty.noRequests')}</p>
              <p className="text-xs text-text-muted">
                {t('friends.empty.noRequestsHint')}
              </p>
            </div>
          ) : (
            <div>
              {requestData.map(req => {
                const isIncoming = req.from_user_id !== user.id;
                const loading = actionLoading === req.friendship_id;

                return (
                  <div
                    key={req.friendship_id}
                    className="flex items-center gap-3"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderRadius: 12,
                      border: '1px solid #3D4760',
                      padding: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Link href={`/user/${isIncoming ? req.from_user_id : req.target_user_id}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <UserAvatar
                        avatarUrl={req.avatar_url}
                        displayName={req.display_name}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-text-primary truncate">
                          {req.display_name}
                        </p>
                        <p className="text-xs text-text-muted" style={{ marginTop: 2 }}>
                          {isIncoming ? t('friends.requests.wantsToConnect') : t('friends.requests.requestSent')}
                          {req.sun_sign ? ` · ${getZodiacGlyph(req.sun_sign)} ${req.sun_sign}` : ''}
                        </p>
                      </div>
                    </Link>

                    {loading ? (
                      <Loader2 className="w-4 h-4 text-accent-primary animate-spin" />
                    ) : isIncoming ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAccept(req.friendship_id)}
                          className="text-xs font-semibold transition-colors"
                          style={{
                            backgroundColor: 'rgba(74,222,128,0.15)',
                            color: '#4ADE80',
                            paddingLeft: 14,
                            paddingRight: 14,
                            paddingTop: 8,
                            paddingBottom: 8,
                            borderRadius: 8,
                          }}
                        >
                          {t('friends.requests.accept')}
                        </button>
                        <button
                          onClick={() => handleDecline(req.friendship_id)}
                          className="text-xs font-semibold transition-colors"
                          style={{
                            backgroundColor: 'rgba(239,68,68,0.1)',
                            color: '#EF4444',
                            paddingLeft: 14,
                            paddingRight: 14,
                            paddingTop: 8,
                            paddingBottom: 8,
                            borderRadius: 8,
                          }}
                        >
                          {t('friends.requests.decline')}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCancel(req.friendship_id)}
                        className="text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: 'rgba(255,255,255,0.45)',
                          paddingLeft: 14,
                          paddingRight: 14,
                          paddingTop: 8,
                          paddingBottom: 8,
                          borderRadius: 8,
                        }}
                      >
                        {t('friends.requests.cancel')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Search Tab ── */}
      {activeTab === 'search' && (
        <div>
          {/* Search input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t('friends.search.placeholder')}
              className="input pl-9 py-2.5 text-sm w-full"
              autoFocus
              autoCapitalize="off"
              autoCorrect="off"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-primary animate-spin" />
            )}
          </div>

          {/* Search results */}
          {searchQuery.length >= 2 ? (
            searching ? (
              <div className="text-center py-12">
                <Loader2 className="w-6 h-6 text-accent-primary animate-spin mx-auto mb-2" />
                <p className="text-xs text-text-muted">{t('friends.search.searching')}</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="card text-center py-12">
                <Search className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <p className="text-text-primary font-medium">{t('friends.search.noResults')}</p>
                <p className="text-xs text-text-muted mt-1">{t('friends.search.noResultsHint')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((result: SearchUserResult) => {
                  const isFriend = friendIds.has(result.id);
                  const isOutgoing = outgoingTargetIds.has(result.id);
                  const isIncoming = incomingFromIds.has(result.id);
                  const loading = actionLoading === result.id;

                  return (
                    <button
                      key={result.id}
                      onClick={() => openPreview(result)}
                      className="card w-full flex items-center gap-3 hover:border-accent-primary/30 transition-colors text-left"
                    >
                      <span
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/user/${result.id}`); }}
                        className="cursor-pointer"
                      >
                        <UserAvatar
                          avatarUrl={result.avatar_url}
                          displayName={result.display_name}
                          size="md"
                        />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">
                          {result.display_name}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {result.username ? `@${result.username}` : result.align_code || ''}
                          {result.sun_sign ? ` • ${getZodiacGlyph(result.sun_sign)} ${result.sun_sign}` : ''}
                        </p>
                      </div>

                      {loading ? (
                        <Loader2 className="w-4 h-4 text-accent-primary animate-spin flex-shrink-0" />
                      ) : isFriend ? (
                        <span className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 text-[11px] font-medium flex-shrink-0">
                          {t('friends.labels.friends')}
                        </span>
                      ) : isOutgoing ? (
                        <span className="px-2.5 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 text-[11px] font-medium flex-shrink-0">
                          {t('friends.labels.pending')}
                        </span>
                      ) : isIncoming ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const req = incomingRequests.find(r => r.from_user_id === result.id);
                            if (req) handleAccept(req.friendship_id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 text-xs font-semibold hover:bg-green-500/25 transition-colors flex-shrink-0"
                        >
                          {t('friends.requests.accept')}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendRequest(result.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-accent-primary/15 text-accent-primary text-xs font-semibold hover:bg-accent-primary/25 transition-colors flex-shrink-0"
                        >
                          {t('friends.addButton')}
                        </button>
                      )}
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            <div className="card text-center py-12">
              <Search className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-text-primary font-medium">{t('friends.search.startSearch')}</p>
              <p className="text-xs text-text-muted mt-1">
                {t('friends.search.minCharsHint')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Context Menu (right-click on friend cards) ── */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-bg-card border border-border-primary rounded-xl shadow-xl py-1 min-w-[180px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href={`/user/${contextMenu.friend.friend_id}`}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-tertiary transition-colors"
            onClick={() => setContextMenu(null)}
          >
            <Users className="w-4 h-4" /> {t('friends.actions.viewProfile')}
          </Link>
          <button
            onClick={() => {
              handleMessage(contextMenu.friend.friend_id);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> {t('friends.actions.message')}
          </button>
          <div className="border-t border-border-primary my-1" />
          <button
            onClick={() => {
              handleRemove(contextMenu.friend);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-bg-tertiary transition-colors"
          >
            <UserMinus className="w-4 h-4" /> {t('friends.actions.removeFriend')}
          </button>
          <button
            onClick={() => {
              handleBlock(contextMenu.friend.friend_id, contextMenu.friend.display_name);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-bg-tertiary transition-colors"
          >
            <Shield className="w-4 h-4" /> {t('friends.actions.blockUser')}
          </button>
        </div>
      )}

      {/* ── Profile Preview Modal ── */}
      {previewVisible && previewUser && (
        <ProfilePreviewModal
          user={previewUser}
          onClose={closePreview}
          action={getPreviewAction(previewUser)}
          actionLoading={actionLoading === previewUser.id}
          isFriend={friendIds.has(previewUser.id)}
          onAddFriend={() => handleSendRequest(previewUser.id)}
        />
      )}

      {/* ── Confirmation Dialog ── */}
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          destructive={confirmDialog.destructive}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}

// ── Friend Card Component ─────────────────────────────────────────────

function FriendCard({
  friend,
  actionLoading,
  onMessage,
  onRemove,
  onBlock,
  onContextMenu,
}: {
  friend: FriendProfile;
  actionLoading: string | null;
  onMessage: () => void;
  onRemove: () => void;
  onBlock: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className="flex items-center gap-3 transition-colors"
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        border: '1px solid #3D4760',
        padding: 8,
        marginBottom: 8,
      }}
      onContextMenu={onContextMenu}
    >
      {/* Avatar with online indicator */}
      <Link href={`/user/${friend.friend_id}`} className="relative flex-shrink-0" style={{ marginRight: 4 }}>
        <UserAvatar
          avatarUrl={friend.avatar_url}
          displayName={friend.display_name}
          size="md"
        />
        {friend.is_online && (
          <span
            className="absolute rounded-full"
            style={{
              width: 12,
              height: 12,
              backgroundColor: '#4ADE80',
              border: '2px solid #141826',
              bottom: 0,
              right: 0,
            }}
          />
        )}
      </Link>

      {/* Info */}
      <Link href={`/user/${friend.friend_id}`} className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">
          {friend.display_name}
          {friend.is_subscribed && <span className="ml-1 text-yellow-400 text-xs">⭐</span>}
        </p>
        <p className="text-xs text-text-muted" style={{ marginTop: 2 }}>
          {friend.sun_sign || ''}
          {friend.sun_sign && friend.moon_sign ? ' · ' : ''}
          {friend.moon_sign || ''}
        </p>
      </Link>

      {/* Action buttons — mobile-style emoji circles */}
      <div className="flex items-center flex-shrink-0" style={{ gap: 8 }}>
        {/* Message */}
        <button
          onClick={(e) => { e.preventDefault(); onMessage(); }}
          className="flex items-center justify-center transition-colors"
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(139,92,246,0.15)',
            fontSize: 16,
          }}
          title="Message"
        >
          💬
        </button>

        {/* Fragment / Compatibility */}
        <Link
          href={`/user/${friend.friend_id}`}
          className="flex items-center justify-center transition-colors"
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(139,92,246,0.15)',
            fontSize: 16,
          }}
          title="Compatibility"
        >
          🔮
        </Link>

        {/* Timeline */}
        <Link
          href={`/user/${friend.friend_id}`}
          className="flex items-center justify-center transition-colors"
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(139,92,246,0.15)',
            fontSize: 16,
          }}
          title="Timeline"
        >
          📅
        </Link>

        {/* Remove */}
        <button
          onClick={(e) => { e.preventDefault(); onRemove(); }}
          className="flex items-center justify-center transition-colors"
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(239,68,68,0.1)',
            fontSize: 16,
          }}
          title="Remove Friend"
        >
          ❌
        </button>
      </div>
    </div>
  );
}

// ── Profile Preview Modal Component ─────────────────────────────────

function ProfilePreviewModal({
  user,
  onClose,
  action,
  actionLoading,
  isFriend,
  onAddFriend,
}: {
  user: SearchUserResult;
  onClose: () => void;
  action: { label: string; action: () => void } | null;
  actionLoading: boolean;
  isFriend: boolean;
  onAddFriend: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-bg-card border border-border-primary rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Avatar */}
        <Link href={`/user/${user.id}`} className="cursor-pointer">
          <UserAvatar
            avatarUrl={user.avatar_url}
            displayName={user.display_name}
            size="xl"
            className="mb-3"
          />
        </Link>

        {/* Name */}
        <h2 className="text-lg font-display font-bold text-text-primary text-center">
          {user.display_name}
        </h2>

        {/* Username */}
        {user.username && (
          <p className="text-sm text-accent-primary mt-0.5">@{user.username}</p>
        )}

        {/* Align code */}
        {user.align_code && (
          <p className="text-xs text-text-muted mt-1">{t('friends.alignCode')} {user.align_code}</p>
        )}

        {/* Sign chips */}
        {(user.sun_sign || user.moon_sign || user.rising_sign) && (
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {user.sun_sign && (
              <div className="bg-accent-primary/10 px-3 py-1.5 rounded-lg text-center">
                <p className="text-[9px] uppercase text-text-muted font-medium">{t('planets.sun')}</p>
                <p className="text-xs text-text-primary font-semibold mt-0.5">
                  {getZodiacGlyph(user.sun_sign)} {user.sun_sign}
                </p>
              </div>
            )}
            {user.moon_sign && (
              <div className="bg-accent-primary/10 px-3 py-1.5 rounded-lg text-center">
                <p className="text-[9px] uppercase text-text-muted font-medium">{t('planets.moon')}</p>
                <p className="text-xs text-text-primary font-semibold mt-0.5">
                  {getZodiacGlyph(user.moon_sign)} {user.moon_sign}
                </p>
              </div>
            )}
            {user.rising_sign && (
              <div className="bg-accent-primary/10 px-3 py-1.5 rounded-lg text-center">
                <p className="text-[9px] uppercase text-text-muted font-medium">{t('chart.rising')}</p>
                <p className="text-xs text-text-primary font-semibold mt-0.5">
                  {getZodiacGlyph(user.rising_sign)} {user.rising_sign}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-text-secondary mt-4 text-center leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Action button */}
        {action && (
          <button
            onClick={action.action}
            disabled={actionLoading}
            className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : action.label === 'Message' ? (
              <>
                <MessageCircle className="w-4 h-4" />
                {action.label}
              </>
            ) : action.label === 'Add Friend' ? (
              <>
                <UserPlus className="w-4 h-4" />
                {action.label}
              </>
            ) : action.label === 'Accept Request' ? (
              <>
                <UserCheck className="w-4 h-4" />
                {action.label}
              </>
            ) : (
              action.label
            )}
          </button>
        )}

        {/* If outgoing pending, show badge instead of button */}
        {!action && (
          <div className="mt-5 px-4 py-2 rounded-lg bg-yellow-500/10 text-yellow-400 text-sm font-medium text-center w-full">
            <Clock className="w-4 h-4 inline mr-1.5" />
            {t('friends.actions.requestPending')}
          </div>
        )}

        {/* View profile link */}
        <Link
          href={`/user/${user.id}`}
          className="mt-3 text-sm text-accent-primary hover:underline"
          onClick={onClose}
        >
          {t('friends.actions.viewFullProfile')}
        </Link>

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-3 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          {t('friends.actions.close')}
        </button>
      </div>
    </div>
  );
}

// ── Confirmation Dialog Component ───────────────────────────────────

function ConfirmDialog({
  title,
  message,
  destructive,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onCancel}
    >
      <div
        className="bg-bg-card border border-border-primary rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-display font-bold text-text-primary mb-2">{title}</h3>
        <p className="text-sm text-text-secondary mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-ghost flex-1 py-2.5"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-colors ${
              destructive
                ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                : 'btn-primary'
            }`}
          >
            {destructive ? t('common.confirm') : t('common.ok')}
          </button>
        </div>
      </div>
    </div>
  );
}
