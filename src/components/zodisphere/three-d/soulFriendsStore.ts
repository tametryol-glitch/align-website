/**
 * Tiny store for friends injected by the mobile WebView host.
 *
 * The globe3d embed has no web session, so it can't call getFriends(). The
 * native app fetches the list and postMessages it in; the embed writes it here
 * and SoulPlacesPanel reads it. We can't pass it as a prop to the globe3d page
 * component because that's a Next.js route page (its default export must satisfy
 * PageProps), so a store is the clean bridge. On web this stays null and the
 * panel falls back to getFriends().
 */
import { create } from 'zustand';

export interface SoulFriend {
  friend_id: string;
  display_name: string;
  avatar_url: string | null;
}

interface SoulFriendsState {
  friends: SoulFriend[] | null;
  setFriends: (friends: SoulFriend[]) => void;
}

export const useSoulFriendsStore = create<SoulFriendsState>((set) => ({
  friends: null,
  setFriends: (friends) => set({ friends }),
}));
