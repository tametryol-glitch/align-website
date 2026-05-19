import type { SoulAscensionGameState } from './types';

export interface SoulAscensionStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const SOUL_ASCENSION_SAVE_PREFIX = 'soul_ascension:v1:';

export function saveKeyFor(signature: string): string {
  return `${SOUL_ASCENSION_SAVE_PREFIX}${signature}`;
}

export function createSoulAscensionStorage(adapter: SoulAscensionStorageAdapter) {
  return {
    async save(state: SoulAscensionGameState): Promise<void> {
      await adapter.setItem(saveKeyFor(state.chart.signature), JSON.stringify(state));
    },
    async load(signature: string): Promise<SoulAscensionGameState | null> {
      const raw = await adapter.getItem(saveKeyFor(signature));
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw) as SoulAscensionGameState;
        return parsed?.version === 1 ? parsed : null;
      } catch {
        return null;
      }
    },
    async clear(signature: string): Promise<void> {
      await adapter.removeItem(saveKeyFor(signature));
    },
  };
}

export function createMemorySoulAscensionStorage(seed: Record<string, string> = {}): SoulAscensionStorageAdapter {
  const store = new Map(Object.entries(seed));
  return {
    async getItem(key: string) {
      return store.get(key) ?? null;
    },
    async setItem(key: string, value: string) {
      store.set(key, value);
    },
    async removeItem(key: string) {
      store.delete(key);
    },
  };
}
