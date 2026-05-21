import { create } from 'zustand';
import type {
  DatingCandidate,
  DailyLimits,
  DatingMatch,
  ReceivedLike,
} from '@/lib/datingDiscoveryService';

interface DatingFilters {
  minAge?: number;
  maxAge?: number;
  minCompatibility?: number;
}

interface DatingState {
  // Discovery
  dailyPicks: DatingCandidate[];
  currentPickIndex: number;
  discoveryLoading: boolean;

  // Limits
  dailyLimits: DailyLimits | null;

  // Likes
  receivedLikes: ReceivedLike[];
  receivedLikesCount: number;
  likesLoading: boolean;

  // Matches
  matches: DatingMatch[];
  matchesLoading: boolean;
  newMatchId: string | null;

  // Filters
  filters: DatingFilters;

  // UI state
  showMatchCelebration: boolean;
  celebrationMatch: DatingMatch | null;

  // Setters — discovery
  setDailyPicks: (picks: DatingCandidate[]) => void;
  setCurrentPickIndex: (index: number) => void;
  advancePick: () => void;
  setDiscoveryLoading: (loading: boolean) => void;

  // Setters — limits
  setDailyLimits: (limits: DailyLimits) => void;
  incrementLikesUsed: () => void;
  incrementRosesUsed: () => void;

  // Setters — likes
  setReceivedLikes: (likes: ReceivedLike[]) => void;
  addReceivedLike: (like: ReceivedLike) => void;
  setLikesLoading: (loading: boolean) => void;

  // Setters — matches
  setMatches: (matches: DatingMatch[]) => void;
  addMatch: (match: DatingMatch) => void;
  removeMatch: (matchId: string) => void;
  setMatchesLoading: (loading: boolean) => void;

  // Setters — filters
  setFilters: (filters: DatingFilters) => void;

  // Setters — UI
  showCelebration: (match: DatingMatch) => void;
  dismissCelebration: () => void;

  // Reset
  reset: () => void;
}

const initialState = {
  dailyPicks: [] as DatingCandidate[],
  currentPickIndex: 0,
  discoveryLoading: false,
  dailyLimits: null as DailyLimits | null,
  receivedLikes: [] as ReceivedLike[],
  receivedLikesCount: 0,
  likesLoading: false,
  matches: [] as DatingMatch[],
  matchesLoading: false,
  newMatchId: null as string | null,
  filters: {} as DatingFilters,
  showMatchCelebration: false,
  celebrationMatch: null as DatingMatch | null,
};

export const useDatingStore = create<DatingState>((set, get) => ({
  ...initialState,

  setDailyPicks: (picks) => set({ dailyPicks: picks, currentPickIndex: 0 }),
  setCurrentPickIndex: (index) => set({ currentPickIndex: index }),
  advancePick: () => {
    const { currentPickIndex, dailyPicks } = get();
    if (currentPickIndex < dailyPicks.length - 1) {
      set({ currentPickIndex: currentPickIndex + 1 });
    }
  },
  setDiscoveryLoading: (loading) => set({ discoveryLoading: loading }),

  setDailyLimits: (limits) => set({ dailyLimits: limits }),
  incrementLikesUsed: () => {
    const limits = get().dailyLimits;
    if (limits) {
      set({ dailyLimits: { ...limits, likes_used: limits.likes_used + 1 } });
    }
  },
  incrementRosesUsed: () => {
    const limits = get().dailyLimits;
    if (limits) {
      set({
        dailyLimits: {
          ...limits,
          roses_used: limits.roses_used + 1,
          likes_used: limits.likes_used + 1,
        },
      });
    }
  },

  setReceivedLikes: (likes) => set({ receivedLikes: likes, receivedLikesCount: likes.length }),
  addReceivedLike: (like) => {
    const current = get().receivedLikes;
    set({
      receivedLikes: [like, ...current],
      receivedLikesCount: current.length + 1,
    });
  },
  setLikesLoading: (loading) => set({ likesLoading: loading }),

  setMatches: (matches) => set({ matches }),
  addMatch: (match) => {
    const current = get().matches;
    if (!current.find(m => m.id === match.id)) {
      set({ matches: [match, ...current], newMatchId: match.id });
    }
  },
  removeMatch: (matchId) => {
    set({ matches: get().matches.filter(m => m.id !== matchId) });
  },
  setMatchesLoading: (loading) => set({ matchesLoading: loading }),

  setFilters: (filters) => set({ filters }),

  showCelebration: (match) => set({ showMatchCelebration: true, celebrationMatch: match }),
  dismissCelebration: () => set({ showMatchCelebration: false, celebrationMatch: null }),

  reset: () => set(initialState),
}));
