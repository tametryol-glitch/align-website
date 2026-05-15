import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════════════
// Astrology Settings Store
// Persists preferences to localStorage so they survive page reloads
// and are available to all chart API calls.
// ═══════════════════════════════════════════════════════════════════

export type HouseSystem = 'placidus' | 'whole_sign' | 'koch' | 'campanus' | 'regiomontanus' | 'equal' | 'porphyry' | 'alcabitius' | 'topocentric' | 'morinus' | 'meridian';
export type ZodiacSystem = 'tropical' | 'sidereal';
export type JargonMode = 'beginner' | 'standard' | 'advanced';
export type OrbTightness = 'tight' | 'standard' | 'wide';

interface AstrologySettings {
  houseSystem: HouseSystem;
  zodiac: ZodiacSystem;
  jargonMode: JargonMode;
  orbTightness: OrbTightness;
  showAsteroids: boolean;
  showFixedStars: boolean;
}

interface AstrologySettingsState extends AstrologySettings {
  setHouseSystem: (v: HouseSystem) => void;
  setZodiac: (v: ZodiacSystem) => void;
  setJargonMode: (v: JargonMode) => void;
  setOrbTightness: (v: OrbTightness) => void;
  setShowAsteroids: (v: boolean) => void;
  setShowFixedStars: (v: boolean) => void;
  hydrate: () => void;
}

const STORAGE_KEY = 'align_astrology_settings';

function loadFromStorage(): Partial<AstrologySettings> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveToStorage(state: AstrologySettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

const DEFAULTS: AstrologySettings = {
  houseSystem: 'whole_sign',
  zodiac: 'tropical',
  jargonMode: 'standard',
  orbTightness: 'standard',
  showAsteroids: true,
  showFixedStars: false,
};

export const useAstrologySettings = create<AstrologySettingsState>((set, get) => ({
  ...DEFAULTS,

  setHouseSystem: (v) => { set({ houseSystem: v }); saveToStorage({ ...get(), houseSystem: v }); },
  setZodiac: (v) => { set({ zodiac: v }); saveToStorage({ ...get(), zodiac: v }); },
  setJargonMode: (v) => { set({ jargonMode: v }); saveToStorage({ ...get(), jargonMode: v }); },
  setOrbTightness: (v) => { set({ orbTightness: v }); saveToStorage({ ...get(), orbTightness: v }); },
  setShowAsteroids: (v) => { set({ showAsteroids: v }); saveToStorage({ ...get(), showAsteroids: v }); },
  setShowFixedStars: (v) => { set({ showFixedStars: v }); saveToStorage({ ...get(), showFixedStars: v }); },

  hydrate: () => {
    const saved = loadFromStorage();
    if (Object.keys(saved).length > 0) {
      set({ ...DEFAULTS, ...saved });
    }
  },
}));
