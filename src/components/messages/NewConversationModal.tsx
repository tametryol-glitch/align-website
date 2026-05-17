'use client';

import { useState, useEffect } from 'react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Search, X, Check, Users } from 'lucide-react';
import {
  searchUsers,
  getFriends,
  createGroupConversation,
} from '@/lib/messagingService';

// ── New Chat Modal ───────────────────────────────────────────────────

export interface NewChatModalProps {
  onClose: () => void;
  onSelectUser: (userId: string) => void;
}

export function NewChatModal({ onClose, onSelectUser }: NewChatModalProps) {
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

export interface NewGroupModalProps {
  onClose: () => void;
  onCreated: (conversationId: string) => void;
}

export function NewGroupModal({ onClose, onCreated }: NewGroupModalProps) {
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
