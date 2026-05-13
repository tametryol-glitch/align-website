'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Loader2,
  UserPlus,
  Search,
  Shield,
  LogOut,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAuthStore } from '@/stores/authStore';
import {
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
  leaveConversation,
  getFriends,
  type GroupMember,
} from '@/lib/messagingService';

// ── Types ──────────────────────────────────────────────────────────

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  groupName: string;
  groupAvatar?: string;
  isAdmin: boolean;
  onGroupUpdated: () => void;
}

interface FriendOption {
  id: string;
  display_name: string;
  avatar_url: string | null;
  sun_sign: string | null;
}

type ConfirmAction =
  | { kind: 'remove'; userId: string; displayName: string }
  | { kind: 'leave' };

// ── Component ──────────────────────────────────────────────────────

export function GroupSettingsModal({
  isOpen,
  onClose,
  conversationId,
  groupName,
  groupAvatar,
  isAdmin,
  onGroupUpdated,
}: GroupSettingsModalProps) {
  const myId = useAuthStore((s) => s.user?.id);

  // Members
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // Add-member flow
  const [showAddMember, setShowAddMember] = useState(false);
  const [friendSearch, setFriendSearch] = useState('');
  const [friends, setFriends] = useState<FriendOption[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);

  // Confirm dialog
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Error feedback
  const [error, setError] = useState<string | null>(null);

  // ── Fetch members on open ──

  const fetchMembers = useCallback(async () => {
    if (!conversationId) return;
    setLoadingMembers(true);
    setError(null);
    try {
      const data = await getGroupMembers(conversationId);
      setMembers(data);
    } catch {
      setError('Failed to load members.');
    } finally {
      setLoadingMembers(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
      // Reset sub-views
      setShowAddMember(false);
      setFriendSearch('');
      setConfirmAction(null);
      setError(null);
    }
  }, [isOpen, fetchMembers]);

  // ── Fetch friends for add-member ──

  const fetchFriends = useCallback(async () => {
    setLoadingFriends(true);
    try {
      const data = await getFriends();
      setFriends(data);
    } catch {
      // best effort
    } finally {
      setLoadingFriends(false);
    }
  }, []);

  useEffect(() => {
    if (showAddMember && friends.length === 0) {
      fetchFriends();
    }
  }, [showAddMember, friends.length, fetchFriends]);

  // ── Derived: friends not already in group ──

  const memberIds = new Set(members.map((m) => m.user_id));
  const availableFriends = friends.filter((f) => !memberIds.has(f.id));
  const filteredFriends = friendSearch.trim()
    ? availableFriends.filter((f) =>
        f.display_name.toLowerCase().includes(friendSearch.toLowerCase()),
      )
    : availableFriends;

  // ── Add member ──

  async function handleAddMember(userId: string) {
    setAddingUserId(userId);
    setError(null);
    try {
      const ok = await addGroupMember(conversationId, userId);
      if (ok) {
        await fetchMembers();
        onGroupUpdated();
      } else {
        setError('Failed to add member.');
      }
    } catch {
      setError('Failed to add member.');
    } finally {
      setAddingUserId(null);
    }
  }

  // ── Confirm action handler ──

  async function handleConfirm() {
    if (!confirmAction) return;
    setActionLoading(true);
    setError(null);
    try {
      if (confirmAction.kind === 'remove') {
        const ok = await removeGroupMember(conversationId, confirmAction.userId);
        if (ok) {
          await fetchMembers();
          onGroupUpdated();
        } else {
          setError('Failed to remove member.');
        }
      } else if (confirmAction.kind === 'leave') {
        const ok = await leaveConversation(conversationId);
        if (ok) {
          onGroupUpdated();
          onClose();
        } else {
          setError('Failed to leave group.');
        }
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  }

  // ── Render nothing when closed ──

  if (!isOpen) return null;

  // ── Confirm dialog overlay ──

  if (confirmAction) {
    const isLeave = confirmAction.kind === 'leave';
    const title = isLeave ? 'Leave Group' : 'Remove Member';
    const body = isLeave
      ? 'Are you sure you want to leave this group? You won\'t be able to see messages or rejoin unless invited.'
      : `Are you sure you want to remove ${confirmAction.displayName} from this group?`;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        onClick={() => setConfirmAction(null)}
      >
        <div
          className="bg-bg-card border border-border-primary rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          </div>
          <p className="text-sm text-text-secondary mb-6">{body}</p>
          {error && (
            <p className="text-xs text-red-400 mb-4">{error}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmAction(null)}
              disabled={actionLoading}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={actionLoading}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
            >
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLeave ? 'Leave' : 'Remove'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main modal ──

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-bg-card border border-border-primary rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between p-4 border-b border-border-primary">
          <div className="flex items-center gap-3">
            <UserAvatar
              avatarUrl={groupAvatar}
              displayName={groupName}
              size="lg"
            />
            <div>
              {/* TODO: make group name editable when backend supports renaming */}
              <h2 className="text-lg font-semibold text-text-primary truncate max-w-[200px]">
                {groupName}
              </h2>
              <p className="text-xs text-text-muted">
                {loadingMembers ? '...' : `${members.length} member${members.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* ── Members Section ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Members
              </h3>
              {isAdmin && (
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="flex items-center gap-1.5 text-xs font-medium text-accent-primary hover:text-accent-primary/80 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {showAddMember ? 'Done' : 'Add Member'}
                </button>
              )}
            </div>

            {/* ── Add Member Panel ── */}
            {showAddMember && (
              <div className="mb-3 bg-bg-secondary rounded-xl p-3 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={friendSearch}
                    onChange={(e) => setFriendSearch(e.target.value)}
                    placeholder="Search friends..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-bg-tertiary border border-border-primary text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-primary"
                    autoFocus
                  />
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1">
                  {loadingFriends ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 text-accent-primary animate-spin" />
                    </div>
                  ) : filteredFriends.length === 0 ? (
                    <p className="text-xs text-text-muted text-center py-3">
                      {friendSearch.trim() ? 'No matching friends found' : 'No friends to add'}
                    </p>
                  ) : (
                    filteredFriends.map((friend) => (
                      <button
                        key={friend.id}
                        onClick={() => handleAddMember(friend.id)}
                        disabled={addingUserId === friend.id}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-bg-tertiary transition-colors text-left"
                      >
                        <UserAvatar
                          avatarUrl={friend.avatar_url}
                          displayName={friend.display_name}
                          size="sm"
                        />
                        <span className="text-sm text-text-primary truncate flex-1">
                          {friend.display_name}
                        </span>
                        {addingUserId === friend.id ? (
                          <Loader2 className="w-4 h-4 text-accent-primary animate-spin" />
                        ) : (
                          <UserPlus className="w-4 h-4 text-text-muted" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ── Member List ── */}
            {loadingMembers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-accent-primary animate-spin" />
              </div>
            ) : (
              <div className="space-y-1">
                {members.map((member) => {
                  const isMe = member.user_id === myId;
                  const isMemberAdmin = member.role === 'admin';

                  return (
                    <div
                      key={member.user_id}
                      className="flex items-center gap-3 p-2 rounded-lg"
                    >
                      <UserAvatar
                        avatarUrl={member.avatar_url}
                        displayName={member.display_name}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-text-primary truncate">
                            {member.display_name}
                            {isMe && (
                              <span className="text-text-muted ml-1">(you)</span>
                            )}
                          </span>
                          {isMemberAdmin && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent-primary/15 text-accent-primary">
                              <Shield className="w-2.5 h-2.5" />
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                      {isAdmin && !isMe && !isMemberAdmin && (
                        <button
                          onClick={() =>
                            setConfirmAction({
                              kind: 'remove',
                              userId: member.user_id,
                              displayName: member.display_name,
                            })
                          }
                          className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remove member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Actions Footer ── */}
        <div className="p-4 border-t border-border-primary">
          <button
            onClick={() => setConfirmAction({ kind: 'leave' })}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Leave Group
          </button>
        </div>
      </div>
    </div>
  );
}
