import { create } from 'zustand';

const SCAN_TTL_MS = 60 * 60 * 1000;
const EVENT_TTL_MS = 24 * 60 * 60 * 1000;
const CATEGORIES_TTL_MS = 6 * 60 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

export interface DailyScan {
  id: string;
  scan_date: string;
  headline: string;
  summary: string;
  events: any[];
  [key: string]: any;
}

export interface WorldEvent {
  id: string;
  title: string;
  category: string;
  [key: string]: any;
}

export interface CategoriesResponse {
  categories: Array<{ slug: string; name: string; count: number }>;
}

export interface ByCategoryResponse {
  events: WorldEvent[];
  total: number;
}

interface WorldEchoState {
  scans: Record<string, CacheEntry<DailyScan>>;
  events: Record<string, CacheEntry<WorldEvent>>;
  categories: CacheEntry<CategoriesResponse> | null;
  byCategory: Record<string, CacheEntry<ByCategoryResponse>>;

  setScan: (scanDate: string, scan: DailyScan) => void;
  getScan: (scanDate: string) => DailyScan | null;

  setEvent: (eventId: string, event: WorldEvent) => void;
  getEvent: (eventId: string) => WorldEvent | null;

  setCategories: (cats: CategoriesResponse) => void;
  getCategories: () => CategoriesResponse | null;

  setByCategory: (key: string, page: ByCategoryResponse) => void;
  getByCategory: (key: string) => ByCategoryResponse | null;

  invalidateAll: () => void;
}

function isFresh<T>(entry: CacheEntry<T> | null | undefined, ttl: number): entry is CacheEntry<T> {
  if (!entry) return false;
  return Date.now() - entry.fetchedAt < ttl;
}

export const useWorldEchoStore = create<WorldEchoState>((set, get) => ({
  scans: {},
  events: {},
  categories: null,
  byCategory: {},

  setScan: (scanDate, scan) => set((state) => ({
    scans: { ...state.scans, [scanDate]: { data: scan, fetchedAt: Date.now() } },
  })),
  getScan: (scanDate) => {
    const entry = get().scans[scanDate];
    return isFresh(entry, SCAN_TTL_MS) ? entry.data : null;
  },

  setEvent: (eventId, event) => set((state) => ({
    events: { ...state.events, [eventId]: { data: event, fetchedAt: Date.now() } },
  })),
  getEvent: (eventId) => {
    const entry = get().events[eventId];
    return isFresh(entry, EVENT_TTL_MS) ? entry.data : null;
  },

  setCategories: (cats) => set({ categories: { data: cats, fetchedAt: Date.now() } }),
  getCategories: () => {
    const entry = get().categories;
    return isFresh(entry, CATEGORIES_TTL_MS) ? entry.data : null;
  },

  setByCategory: (key, page) => set((state) => ({
    byCategory: { ...state.byCategory, [key]: { data: page, fetchedAt: Date.now() } },
  })),
  getByCategory: (key) => {
    const entry = get().byCategory[key];
    return isFresh(entry, EVENT_TTL_MS) ? entry.data : null;
  },

  invalidateAll: () => set({ scans: {}, events: {}, categories: null, byCategory: {} }),
}));
