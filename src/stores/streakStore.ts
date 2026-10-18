import { create } from 'zustand';
import {
  getStreak,
  checkIn,
  getStreakRecovery,
  recoverStreak,
  StreakData,
  StreakRecovery,
} from '@/lib/streakService';

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: string | null;
  totalCheckIns: number;
  checkedInToday: boolean;
  loading: boolean;
  fetchStreak: (userId: string) => Promise<void>;
  performCheckIn: (userId: string) => Promise<void>;
  recovery: StreakRecovery;
  performRecovery: (userId: string) => Promise<boolean>;
}

const NO_RECOVERY: StreakRecovery = { recoverable: false, can_recover: false };

function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

export const useStreakStore = create<StreakState>((set, get) => ({
  recovery: NO_RECOVERY,
  currentStreak: 0,
  longestStreak: 0,
  lastCheckIn: null,
  totalCheckIns: 0,
  checkedInToday: false,
  loading: false,

  fetchStreak: async (userId: string) => {
    set({ loading: true });
    try {
      const data = await getStreak(userId);
      if (data) {
        set({
          currentStreak: data.current_streak,
          longestStreak: data.longest_streak,
          lastCheckIn: data.last_check_in,
          totalCheckIns: data.total_check_ins,
          checkedInToday: isToday(data.last_check_in),
        });
      } else {
        set({
          currentStreak: 0,
          longestStreak: 0,
          lastCheckIn: null,
          totalCheckIns: 0,
          checkedInToday: false,
        });
      }
      set({ recovery: await getStreakRecovery() });
    } catch (err) {
      console.error('Failed to fetch streak:', err);
    } finally {
      set({ loading: false });
    }
  },

  performRecovery: async (userId: string) => {
    set({ loading: true });
    try {
      const result = await recoverStreak();
      if (result.recovered) await get().fetchStreak(userId);
      return !!result.recovered;
    } catch (err) {
      console.error('Failed to recover streak:', err);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  performCheckIn: async (userId: string) => {
    try {
      const data: StreakData = await checkIn(userId);
      set({
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        lastCheckIn: data.last_check_in,
        totalCheckIns: data.total_check_ins,
        checkedInToday: isToday(data.last_check_in),
      });
      set({ recovery: await getStreakRecovery() });
    } catch (err) {
      console.error('Failed to check in:', err);
    }
  },
}));
