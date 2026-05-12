import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  display_name: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
  starseed?: string | null;
  human_design_type?: string | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_location: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  cover_photo_url?: string | null;
  align_code?: string | null;
  created_at?: string | null;
  is_subscribed?: boolean | null;
  is_admin?: boolean | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, session: null, profile: null, isAuthenticated: false }),
}));
