import { create } from 'zustand';

export interface FriendProfile {
  friendship_id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
  [key: string]: any;
}

export interface FriendRequest {
  friendship_id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  sun_sign: string | null;
  created_at: string;
  [key: string]: any;
}

export interface Conversation {
  id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  [key: string]: any;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  [key: string]: any;
}

export interface CosmicMatch {
  user_id: string;
  overall_score: number;
  sun_compatibility: number;
  moon_compatibility: number;
  [key: string]: any;
}

interface SocialState {
  friends: FriendProfile[];
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  friendCount: number;
  pendingRequestCount: number;

  conversations: Conversation[];
  totalUnreadMessages: number;

  notifications: AppNotification[];
  unreadNotificationCount: number;

  cosmicMatches: Record<string, CosmicMatch>;

  friendsLoading: boolean;
  conversationsLoading: boolean;
  notificationsLoading: boolean;

  setFriends: (friends: FriendProfile[]) => void;
  setIncomingRequests: (requests: FriendRequest[]) => void;
  setOutgoingRequests: (requests: FriendRequest[]) => void;
  setFriendCount: (count: number) => void;
  setPendingRequestCount: (count: number) => void;

  setConversations: (conversations: Conversation[]) => void;
  setTotalUnreadMessages: (count: number) => void;

  setNotifications: (notifications: AppNotification[]) => void;
  addNotification: (notification: AppNotification) => void;
  setUnreadNotificationCount: (count: number) => void;

  setCosmicMatch: (otherUserId: string, match: CosmicMatch) => void;
  setCosmicMatches: (matches: Record<string, CosmicMatch>) => void;

  setFriendsLoading: (loading: boolean) => void;
  setConversationsLoading: (loading: boolean) => void;
  setNotificationsLoading: (loading: boolean) => void;

  removeFriendOptimistic: (friendshipId: string) => void;
  removeRequestOptimistic: (friendshipId: string) => void;
  markNotificationReadOptimistic: (notificationId: string) => void;

  resetSocial: () => void;
}

const initialState = {
  friends: [] as FriendProfile[],
  incomingRequests: [] as FriendRequest[],
  outgoingRequests: [] as FriendRequest[],
  friendCount: 0,
  pendingRequestCount: 0,
  cosmicMatches: {} as Record<string, CosmicMatch>,
  conversations: [] as Conversation[],
  totalUnreadMessages: 0,
  notifications: [] as AppNotification[],
  unreadNotificationCount: 0,
  friendsLoading: false,
  conversationsLoading: false,
  notificationsLoading: false,
};

export const useSocialStore = create<SocialState>((set) => ({
  ...initialState,

  setFriends: (friends) => set({ friends, friendCount: friends.length }),
  setIncomingRequests: (incomingRequests) => set({ incomingRequests, pendingRequestCount: incomingRequests.length }),
  setOutgoingRequests: (outgoingRequests) => set({ outgoingRequests }),
  setFriendCount: (friendCount) => set({ friendCount }),
  setPendingRequestCount: (pendingRequestCount) => set({ pendingRequestCount }),

  setConversations: (conversations) => set({ conversations }),
  setTotalUnreadMessages: (totalUnreadMessages) => set({ totalUnreadMessages }),

  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadNotificationCount: state.unreadNotificationCount + 1,
  })),
  setUnreadNotificationCount: (unreadNotificationCount) => set({ unreadNotificationCount }),

  setCosmicMatch: (otherUserId, match) => set((state) => ({
    cosmicMatches: { ...state.cosmicMatches, [otherUserId]: match },
  })),
  setCosmicMatches: (cosmicMatches) => set({ cosmicMatches }),

  setFriendsLoading: (friendsLoading) => set({ friendsLoading }),
  setConversationsLoading: (conversationsLoading) => set({ conversationsLoading }),
  setNotificationsLoading: (notificationsLoading) => set({ notificationsLoading }),

  removeFriendOptimistic: (friendshipId) => set((state) => ({
    friends: state.friends.filter(f => f.friendship_id !== friendshipId),
    friendCount: Math.max(0, state.friendCount - 1),
  })),
  removeRequestOptimistic: (friendshipId) => set((state) => ({
    incomingRequests: state.incomingRequests.filter(r => r.friendship_id !== friendshipId),
    outgoingRequests: state.outgoingRequests.filter(r => r.friendship_id !== friendshipId),
    pendingRequestCount: Math.max(0, state.pendingRequestCount - 1),
  })),
  markNotificationReadOptimistic: (notificationId) => set((state) => ({
    notifications: state.notifications.map(n =>
      n.id === notificationId ? { ...n, is_read: true } : n
    ),
    unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1),
  })),

  resetSocial: () => set(initialState),
}));
