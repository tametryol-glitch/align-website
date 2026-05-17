import { create } from 'zustand';
import { getXPProgress, getUserBadges, awardXP, BADGES, type BadgeDefinition } from '@/lib/gamificationService';

export interface EarnedBadge {
  badgeId: string;
  earnedAt: string;
  name: string;
  description: string;
  icon: string;
}

interface GamificationState {
  totalXP: number;
  level: number;
  progress: number;
  xpForNextLevel: number;
  xpInCurrentLevel: number;
  badges: EarnedBadge[];
  newBadge: (BadgeDefinition & { badgeId: string }) | null;
  loading: boolean;

  fetchProgress: (userId: string) => Promise<void>;
  addXP: (userId: string, action: string, context?: Record<string, unknown>) => Promise<void>;
  dismissBadgePopup: () => void;
}

export const useGamificationStore = create<GamificationState>((set) => ({
  totalXP: 0,
  level: 1,
  progress: 0,
  xpForNextLevel: 100,
  xpInCurrentLevel: 0,
  badges: [],
  newBadge: null,
  loading: false,

  fetchProgress: async (userId: string) => {
    set({ loading: true });
    try {
      const [progress, badges] = await Promise.all([
        getXPProgress(userId),
        getUserBadges(userId),
      ]);
      set({
        totalXP: progress.totalXP,
        level: progress.level,
        progress: progress.progress,
        xpForNextLevel: progress.xpForNextLevel,
        xpInCurrentLevel: progress.xpInCurrentLevel,
        badges,
      });
    } catch (err) {
      console.error('[Gamification] Failed to fetch progress:', err);
    } finally {
      set({ loading: false });
    }
  },

  addXP: async (userId: string, action: string, context?: Record<string, unknown>) => {
    try {
      const result = await awardXP(userId, action, context);

      // Refresh full progress after XP award
      const [progress, badges] = await Promise.all([
        getXPProgress(userId),
        getUserBadges(userId),
      ]);

      const newBadgeData = result.newBadge && BADGES[result.newBadge]
        ? { badgeId: result.newBadge, ...BADGES[result.newBadge] }
        : null;

      set({
        totalXP: progress.totalXP,
        level: progress.level,
        progress: progress.progress,
        xpForNextLevel: progress.xpForNextLevel,
        xpInCurrentLevel: progress.xpInCurrentLevel,
        badges,
        newBadge: newBadgeData,
      });
    } catch (err) {
      console.error('[Gamification] Failed to add XP:', err);
    }
  },

  dismissBadgePopup: () => set({ newBadge: null }),
}));
