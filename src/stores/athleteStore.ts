import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Athlete {
  id: string;
  name: string;
  team: string;
  position: string;
  birth_date: string;
  birth_time?: string;
  birth_place?: string;
  image_url?: string;
  [key: string]: any;
}

export interface AthleteChart {
  athlete_id: string;
  chart_mode: string;
  planets: any[];
  houses: any[];
  aspects: any[];
  [key: string]: any;
}

export type AthleteChartMode = string;

export interface AthleteGameLog {
  game_id: string;
  date: string;
  opponent: string;
  points: number;
  [key: string]: any;
}

export interface AthleteScheduleEntry {
  game_id: string;
  date: string;
  opponent: string;
  [key: string]: any;
}

export interface AthletePatternsResponse {
  athlete_id: string;
  high_patterns: any[];
  low_patterns: any[];
  [key: string]: any;
}

export interface AthleteUpcomingPredictionsResponse {
  athlete_id: string;
  predictions: any[];
  [key: string]: any;
}

export interface AthleteBacktestResponse {
  athlete_id: string;
  accuracy: number;
  results: any[];
  [key: string]: any;
}

export interface AthleteAlertsResponse {
  athlete_id: string;
  alerts: any[];
  [key: string]: any;
}

interface AthleteChartError {
  code: string;
  message: string;
}

interface AthleteDataError {
  code: string;
  message: string;
}

interface AthleteState {
  athletes: Athlete[];
  selectedAthleteId: string | null;
  selectedAthlete: Athlete | null;
  favoriteIds: string[];

  charts: Record<string, AthleteChart>;
  chartMode: Record<string, AthleteChartMode>;
  chartLoading: Record<string, boolean>;
  chartError: Record<string, AthleteChartError | null>;

  stats: Record<string, AthleteGameLog[]>;
  statsLoading: Record<string, boolean>;
  statsError: Record<string, AthleteDataError | null>;
  schedules: Record<string, AthleteScheduleEntry[]>;
  schedulesLoading: Record<string, boolean>;
  schedulesError: Record<string, AthleteDataError | null>;

  patterns: Record<string, AthletePatternsResponse>;
  patternsLoading: Record<string, boolean>;
  patternsError: Record<string, AthleteDataError | null>;

  predictions: Record<string, AthleteUpcomingPredictionsResponse>;
  predictionsLoading: Record<string, boolean>;
  predictionsError: Record<string, AthleteDataError | null>;

  backtests: Record<string, AthleteBacktestResponse>;
  backtestsLoading: Record<string, boolean>;
  backtestsError: Record<string, AthleteDataError | null>;

  alerts: Record<string, AthleteAlertsResponse>;
  alertsLoading: Record<string, boolean>;
  alertsError: Record<string, AthleteDataError | null>;

  engineVersion: string | null;

  loadingList: boolean;
  loadingDetail: boolean;
  error: string | null;

  setAthletes: (athletes: Athlete[]) => void;
  setSelectedAthlete: (athlete: Athlete | null) => void;
  setFavoriteIds: (ids: string[]) => void;
  addFavoriteId: (id: string) => void;
  removeFavoriteId: (id: string) => void;
  setLoadingList: (loading: boolean) => void;
  setLoadingDetail: (loading: boolean) => void;
  setError: (error: string | null) => void;

  setAthleteChart: (athleteId: string, chart: AthleteChart) => void;
  setChartLoading: (athleteId: string, loading: boolean) => void;
  setChartError: (athleteId: string, err: AthleteChartError | null) => void;
  clearAthleteChart: (athleteId: string) => void;

  setAthleteStats: (athleteId: string, games: AthleteGameLog[]) => void;
  setStatsLoading: (athleteId: string, loading: boolean) => void;
  setStatsError: (athleteId: string, err: AthleteDataError | null) => void;
  setAthleteSchedule: (athleteId: string, events: AthleteScheduleEntry[]) => void;
  setScheduleLoading: (athleteId: string, loading: boolean) => void;
  setScheduleError: (athleteId: string, err: AthleteDataError | null) => void;
  clearAthleteData: (athleteId: string) => void;

  setAthletePatterns: (athleteId: string, patterns: AthletePatternsResponse) => void;
  setPatternsLoading: (athleteId: string, loading: boolean) => void;
  setPatternsError: (athleteId: string, err: AthleteDataError | null) => void;
  clearAthletePatterns: (athleteId: string) => void;

  setAthletePredictions: (athleteId: string, predictions: AthleteUpcomingPredictionsResponse) => void;
  setPredictionsLoading: (athleteId: string, loading: boolean) => void;
  setPredictionsError: (athleteId: string, err: AthleteDataError | null) => void;
  clearAthletePredictions: (athleteId: string) => void;

  setAthleteBacktest: (athleteId: string, backtest: AthleteBacktestResponse) => void;
  setBacktestLoading: (athleteId: string, loading: boolean) => void;
  setBacktestError: (athleteId: string, err: AthleteDataError | null) => void;
  clearAthleteBacktest: (athleteId: string) => void;

  setAthleteAlerts: (athleteId: string, alerts: AthleteAlertsResponse) => void;
  setAlertsLoading: (athleteId: string, loading: boolean) => void;
  setAlertsError: (athleteId: string, err: AthleteDataError | null) => void;
  clearAthleteAlerts: (athleteId: string) => void;

  setEngineVersion: (version: string | null) => void;
  resetAthletes: () => void;
}

const localStorageAdapter = {
  getItem: (name: string) => {
    if (typeof window === 'undefined') return null;
    const val = localStorage.getItem(name);
    return val ? JSON.parse(val) : null;
  },
  setItem: (name: string, value: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(name);
  },
};

export const useAthleteStore = create<AthleteState>()(
  persist(
    (set) => ({
      athletes: [],
      selectedAthleteId: null,
      selectedAthlete: null,
      favoriteIds: [],
      charts: {},
      chartMode: {},
      chartLoading: {},
      chartError: {},
      stats: {},
      statsLoading: {},
      statsError: {},
      schedules: {},
      schedulesLoading: {},
      schedulesError: {},
      patterns: {},
      patternsLoading: {},
      patternsError: {},
      predictions: {},
      predictionsLoading: {},
      predictionsError: {},
      backtests: {},
      backtestsLoading: {},
      backtestsError: {},
      alerts: {},
      alertsLoading: {},
      alertsError: {},
      engineVersion: null,
      loadingList: false,
      loadingDetail: false,
      error: null,

      setAthletes: (athletes) => set({ athletes }),
      setSelectedAthlete: (athlete) =>
        set({
          selectedAthlete: athlete,
          selectedAthleteId: athlete?.id ?? null,
        }),
      setFavoriteIds: (favoriteIds) => set({ favoriteIds }),
      addFavoriteId: (id) =>
        set((state) =>
          state.favoriteIds.includes(id)
            ? state
            : { favoriteIds: [...state.favoriteIds, id] }
        ),
      removeFavoriteId: (id) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.filter((x) => x !== id),
        })),
      setLoadingList: (loadingList) => set({ loadingList }),
      setLoadingDetail: (loadingDetail) => set({ loadingDetail }),
      setError: (error) => set({ error }),

      setAthleteChart: (athleteId, chart) =>
        set((state) => ({
          charts: { ...state.charts, [athleteId]: chart },
          chartMode: { ...state.chartMode, [athleteId]: chart.chart_mode },
          chartError: { ...state.chartError, [athleteId]: null },
        })),
      setChartLoading: (athleteId, loading) =>
        set((state) => ({
          chartLoading: { ...state.chartLoading, [athleteId]: loading },
        })),
      setChartError: (athleteId, err) =>
        set((state) => ({
          chartError: { ...state.chartError, [athleteId]: err },
        })),
      clearAthleteChart: (athleteId) =>
        set((state) => {
          const { [athleteId]: _c, ...charts } = state.charts;
          const { [athleteId]: _m, ...chartMode } = state.chartMode;
          const { [athleteId]: _l, ...chartLoading } = state.chartLoading;
          const { [athleteId]: _e, ...chartError } = state.chartError;
          return { charts, chartMode, chartLoading, chartError };
        }),

      setAthleteStats: (athleteId, games) =>
        set((state) => ({
          stats: { ...state.stats, [athleteId]: games },
          statsError: { ...state.statsError, [athleteId]: null },
        })),
      setStatsLoading: (athleteId, loading) =>
        set((state) => ({
          statsLoading: { ...state.statsLoading, [athleteId]: loading },
        })),
      setStatsError: (athleteId, err) =>
        set((state) => ({
          statsError: { ...state.statsError, [athleteId]: err },
        })),
      setAthleteSchedule: (athleteId, events) =>
        set((state) => ({
          schedules: { ...state.schedules, [athleteId]: events },
          schedulesError: { ...state.schedulesError, [athleteId]: null },
        })),
      setScheduleLoading: (athleteId, loading) =>
        set((state) => ({
          schedulesLoading: { ...state.schedulesLoading, [athleteId]: loading },
        })),
      setScheduleError: (athleteId, err) =>
        set((state) => ({
          schedulesError: { ...state.schedulesError, [athleteId]: err },
        })),
      clearAthleteData: (athleteId) =>
        set((state) => {
          const { [athleteId]: _s, ...stats } = state.stats;
          const { [athleteId]: _sl, ...statsLoading } = state.statsLoading;
          const { [athleteId]: _se, ...statsError } = state.statsError;
          const { [athleteId]: _sc, ...schedules } = state.schedules;
          const { [athleteId]: _scl, ...schedulesLoading } = state.schedulesLoading;
          const { [athleteId]: _sce, ...schedulesError } = state.schedulesError;
          return { stats, statsLoading, statsError, schedules, schedulesLoading, schedulesError };
        }),

      setAthletePatterns: (athleteId, patterns) =>
        set((state) => ({
          patterns: { ...state.patterns, [athleteId]: patterns },
          patternsError: { ...state.patternsError, [athleteId]: null },
        })),
      setPatternsLoading: (athleteId, loading) =>
        set((state) => ({
          patternsLoading: { ...state.patternsLoading, [athleteId]: loading },
        })),
      setPatternsError: (athleteId, err) =>
        set((state) => ({
          patternsError: { ...state.patternsError, [athleteId]: err },
        })),
      clearAthletePatterns: (athleteId) =>
        set((state) => {
          const { [athleteId]: _p, ...patterns } = state.patterns;
          const { [athleteId]: _pl, ...patternsLoading } = state.patternsLoading;
          const { [athleteId]: _pe, ...patternsError } = state.patternsError;
          return { patterns, patternsLoading, patternsError };
        }),

      setAthletePredictions: (athleteId, predictions) =>
        set((state) => ({
          predictions: { ...state.predictions, [athleteId]: predictions },
          predictionsError: { ...state.predictionsError, [athleteId]: null },
        })),
      setPredictionsLoading: (athleteId, loading) =>
        set((state) => ({
          predictionsLoading: { ...state.predictionsLoading, [athleteId]: loading },
        })),
      setPredictionsError: (athleteId, err) =>
        set((state) => ({
          predictionsError: { ...state.predictionsError, [athleteId]: err },
        })),
      clearAthletePredictions: (athleteId) =>
        set((state) => {
          const { [athleteId]: _p, ...predictions } = state.predictions;
          const { [athleteId]: _pl, ...predictionsLoading } = state.predictionsLoading;
          const { [athleteId]: _pe, ...predictionsError } = state.predictionsError;
          return { predictions, predictionsLoading, predictionsError };
        }),

      setAthleteBacktest: (athleteId, backtest) =>
        set((state) => ({
          backtests: { ...state.backtests, [athleteId]: backtest },
          backtestsError: { ...state.backtestsError, [athleteId]: null },
        })),
      setBacktestLoading: (athleteId, loading) =>
        set((state) => ({
          backtestsLoading: { ...state.backtestsLoading, [athleteId]: loading },
        })),
      setBacktestError: (athleteId, err) =>
        set((state) => ({
          backtestsError: { ...state.backtestsError, [athleteId]: err },
        })),
      clearAthleteBacktest: (athleteId) =>
        set((state) => {
          const { [athleteId]: _b, ...backtests } = state.backtests;
          const { [athleteId]: _bl, ...backtestsLoading } = state.backtestsLoading;
          const { [athleteId]: _be, ...backtestsError } = state.backtestsError;
          return { backtests, backtestsLoading, backtestsError };
        }),

      setAthleteAlerts: (athleteId, alerts) =>
        set((state) => ({
          alerts: { ...state.alerts, [athleteId]: alerts },
          alertsError: { ...state.alertsError, [athleteId]: null },
        })),
      setAlertsLoading: (athleteId, loading) =>
        set((state) => ({
          alertsLoading: { ...state.alertsLoading, [athleteId]: loading },
        })),
      setAlertsError: (athleteId, err) =>
        set((state) => ({
          alertsError: { ...state.alertsError, [athleteId]: err },
        })),
      clearAthleteAlerts: (athleteId) =>
        set((state) => {
          const { [athleteId]: _a, ...alerts } = state.alerts;
          const { [athleteId]: _al, ...alertsLoading } = state.alertsLoading;
          const { [athleteId]: _ae, ...alertsError } = state.alertsError;
          return { alerts, alertsLoading, alertsError };
        }),

      setEngineVersion: (version) =>
        set((state) => {
          if (!version || state.engineVersion === version) {
            return state.engineVersion === version
              ? state
              : { engineVersion: version };
          }
          return {
            engineVersion: version,
            charts: {},
            chartMode: {},
            chartLoading: {},
            chartError: {},
            stats: {},
            statsLoading: {},
            statsError: {},
            schedules: {},
            schedulesLoading: {},
            schedulesError: {},
            patterns: {},
            patternsLoading: {},
            patternsError: {},
            predictions: {},
            predictionsLoading: {},
            predictionsError: {},
            backtests: {},
            backtestsLoading: {},
            backtestsError: {},
            alerts: {},
            alertsLoading: {},
            alertsError: {},
          };
        }),

      resetAthletes: () =>
        set({
          athletes: [],
          selectedAthleteId: null,
          selectedAthlete: null,
          favoriteIds: [],
          charts: {},
          chartMode: {},
          chartLoading: {},
          chartError: {},
          stats: {},
          statsLoading: {},
          statsError: {},
          schedules: {},
          schedulesLoading: {},
          schedulesError: {},
          patterns: {},
          patternsLoading: {},
          patternsError: {},
          predictions: {},
          predictionsLoading: {},
          predictionsError: {},
          backtests: {},
          backtestsLoading: {},
          backtestsError: {},
          alerts: {},
          alertsLoading: {},
          alertsError: {},
          engineVersion: null,
          loadingList: false,
          loadingDetail: false,
          error: null,
        }),
    }),
    {
      name: 'align-athletes-v1',
      storage: createJSONStorage(() => localStorageAdapter as any),
      partialize: (state) => ({
        selectedAthleteId: state.selectedAthleteId,
        favoriteIds: state.favoriteIds,
        engineVersion: state.engineVersion,
      }),
    }
  )
);
