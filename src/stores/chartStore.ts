import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ChartState {
  natalChart: any | null;
  birthData: any | null;
  isLoading: boolean;
  error: string | null;
  setNatalChart: (chart: any) => void;
  setBirthData: (data: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetChart: () => void;
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

export const useChartStore = create<ChartState>()(
  persist(
    (set) => ({
      natalChart: null,
      birthData: null,
      isLoading: false,
      error: null,
      setNatalChart: (natalChart) => set({ natalChart }),
      setBirthData: (birthData) => set({ birthData }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      resetChart: () => set({ natalChart: null, birthData: null, isLoading: false, error: null }),
    }),
    {
      name: 'align-chart-storage',
      storage: createJSONStorage(() => localStorageAdapter as any),
      partialize: (state) => ({
        birthData: state.birthData,
        natalChart: state.natalChart,
      }),
    }
  )
);
