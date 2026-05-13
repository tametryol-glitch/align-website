// ═══════════════════════════════════════════════════════════════════
// Friends Store — Zustand state for friends, requests & user search
// Mirrors mobile socialStore's friends slice + optimistic updates
// ═══════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import type { FriendProfile, FriendRequest } from '@/lib/friendService';

interface FriendsState {
  // Friend list
  friends: FriendProfile[];
  friendsLoading: boolean;
  friendCount: number;

  // Requests
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  pendingRequestCount: number;

  // Search
  searchQuery: string;
  searchResults: any[]; // SearchUserResult[]
  searching: boolean;

  // UI state
  activeTab: 'friends' | 'requests' | 'search';
  showProfilePreview: boolean;
  previewUserId: string | null;

  // Setters
  setFriends: (friends: FriendProfile[]) => void;
  setFriendsLoading: (loading: boolean) => void;
  setIncomingRequests: (requests: FriendRequest[]) => void;
  setOutgoingRequests: (requests: FriendRequest[]) => void;
  setFriendCount: (count: number) => void;
  setPendingRequestCount: (count: number) => void;

  setSearchQuery: (query: string) => void;
  setSearchResults: (results: any[]) => void;
  setSearching: (searching: boolean) => void;

  setActiveTab: (tab: 'friends' | 'requests' | 'search') => void;
  setShowProfilePreview: (show: boolean) => void;
  setPreviewUserId: (id: string | null) => void;

  // Optimistic updates
  removeFriendOptimistic: (friendshipId: string) => void;
  removeRequestOptimistic: (friendshipId: string) => void;

  // Reset
  resetFriends: () => void;
}

const initialState = {
  friends: [],
  friendsLoading: false,
  friendCount: 0,
  incomingRequests: [],
  outgoingRequests: [],
  pendingRequestCount: 0,
  searchQuery: '',
  searchResults: [],
  searching: false,
  activeTab: 'friends' as const,
  showProfilePreview: false,
  previewUserId: null,
};

export const useFriendsStore = create<FriendsState>((set) => ({
  ...initialState,

  setFriends: (friends) => set({ friends, friendCount: friends.length }),
  setFriendsLoading: (friendsLoading) => set({ friendsLoading }),
  setIncomingRequests: (incomingRequests) => set({ incomingRequests, pendingRequestCount: incomingRequests.length }),
  setOutgoingRequests: (outgoingRequests) => set({ outgoingRequests }),
  setFriendCount: (friendCount) => set({ friendCount }),
  setPendingRequestCount: (pendingRequestCount) => set({ pendingRequestCount }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setSearching: (searching) => set({ searching }),

  setActiveTab: (activeTab) => set({ activeTab }),
  setShowProfilePreview: (showProfilePreview) => set({ showProfilePreview }),
  setPreviewUserId: (previewUserId) => set({ previewUserId }),

  removeFriendOptimistic: (friendshipId) => set((state) => {
    const updated = state.friends.filter(f => f.friendship_id !== friendshipId);
    return { friends: updated, friendCount: updated.length };
  }),

  removeRequestOptimistic: (friendshipId) => set((state) => {
    const updatedIncoming = state.incomingRequests.filter(r => r.friendship_id !== friendshipId);
    const updatedOutgoing = state.outgoingRequests.filter(r => r.friendship_id !== friendshipId);
    return {
      incomingRequests: updatedIncoming,
      outgoingRequests: updatedOutgoing,
      pendingRequestCount: updatedIncoming.length,
    };
  }),

  resetFriends: () => set(initialState),
}));
