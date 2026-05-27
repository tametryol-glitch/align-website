/**
 * Aura Mirror — Journal Service
 *
 * Supabase-backed CRUD for aura journal entries.
 * Falls back to localStorage if offline or Supabase fails.
 * Follows the same pattern as journalService.ts and dreamService.ts.
 */

import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type {
  AuraJournalEntry,
  AuraReadingResult,
  AuraPrivacySettings,
} from '@/types/aura';

const STORAGE_KEY = 'align_aura_journal';
const PRIVACY_KEY = 'align_aura_privacy';
const MAX_FREE_JOURNAL_ENTRIES = 7;

// ── Helpers ─────────────────────────────────────────────────────────

function getMyId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

function rowToEntry(row: any): AuraJournalEntry {
  return {
    id: row.id,
    userId: row.user_id,
    scanDate: row.scan_date,
    scanType: row.scan_type,
    outerAuraColor: row.outer_aura_color,
    outerAuraHex: row.outer_aura_hex,
    innerAuraColor: row.inner_aura_color,
    innerAuraHex: row.inner_aura_hex,
    emotionalCoreColor: row.emotional_core_color,
    emotionalCoreHex: row.emotional_core_hex,
    chakraFocus: row.chakra_focus,
    mood: row.mood,
    lifeArea: row.life_area,
    moonSign: row.moon_sign,
    moonPhase: row.moon_phase,
    transitHighlights: row.transit_highlights,
    readingSummary: row.reading_summary,
    fullReading: row.full_reading,
    dataSources: typeof row.data_sources === 'string'
      ? JSON.parse(row.data_sources)
      : row.data_sources || {},
    imageUri: row.image_uri,
    createdAt: row.created_at,
  };
}

// ── Save Entry ──────────────────────────────────────────────────────

export async function saveAuraJournalEntry(
  reading: AuraReadingResult,
  privacy: AuraPrivacySettings,
): Promise<AuraJournalEntry | null> {
  const userId = getMyId();
  if (!userId) return null;

  const now = new Date().toISOString();

  const entry: Omit<AuraJournalEntry, 'id' | 'createdAt'> & { userId: string } = {
    userId,
    scanDate: now,
    scanType: reading.mode,
    outerAuraColor: reading.outerAura.color,
    outerAuraHex: reading.outerAura.hex,
    innerAuraColor: reading.innerAura.color,
    innerAuraHex: reading.innerAura.hex,
    emotionalCoreColor: reading.emotionalCore.color,
    emotionalCoreHex: reading.emotionalCore.hex,
    chakraFocus: reading.chakraFocus.chakra,
    mood: reading.mood,
    lifeArea: reading.lifeArea,
    moonSign: reading.sections?.find(s => s.title.includes('Cosmic'))?.content?.match(/Moon is currently in (\w+)/)?.[1],
    moonPhase: undefined,
    transitHighlights: reading.dominantTransit,
    readingSummary: reading.sections?.[0]?.content?.substring(0, 500) || reading.emotionalTheme,
    fullReading: privacy.saveInterpretationsOnly ? undefined : JSON.stringify(reading),
    dataSources: reading.dataSources,
    imageUri: privacy.savePhotos ? undefined : undefined, // photo saving handled separately
  };

  // Try Supabase first
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('aura_sessions')
      .insert({
        user_id: userId,
        scan_date: entry.scanDate,
        scan_type: entry.scanType,
        outer_aura_color: entry.outerAuraColor,
        outer_aura_hex: entry.outerAuraHex,
        inner_aura_color: entry.innerAuraColor,
        inner_aura_hex: entry.innerAuraHex,
        emotional_core_color: entry.emotionalCoreColor,
        emotional_core_hex: entry.emotionalCoreHex,
        chakra_focus: entry.chakraFocus,
        mood: entry.mood,
        life_area: entry.lifeArea,
        moon_sign: entry.moonSign,
        moon_phase: entry.moonPhase,
        transit_highlights: entry.transitHighlights,
        reading_summary: entry.readingSummary,
        full_reading: entry.fullReading,
        data_sources: JSON.stringify(entry.dataSources),
      })
      .select()
      .single();

    if (error) throw error;
    if (data) return rowToEntry(data);
  } catch (err) {
    console.warn('[AuraJournal] Supabase save failed, caching locally:', err);
  }

  // Fallback: save to localStorage
  return saveToLocalStorage(entry);
}

function saveToLocalStorage(
  entry: any,
): AuraJournalEntry {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const entries: AuraJournalEntry[] = raw ? JSON.parse(raw) : [];
    const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const saved: AuraJournalEntry = {
      ...entry,
      id,
      createdAt: new Date().toISOString(),
    };
    entries.unshift(saved);
    // Keep max 50 locally
    if (entries.length > 50) entries.length = 50;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return saved;
  } catch (err) {
    console.error('[AuraJournal] localStorage save failed:', err);
    // Return a minimal entry so the UI doesn't crash
    return {
      id: `failed-${Date.now()}`,
      userId: entry.userId,
      scanDate: new Date().toISOString(),
      scanType: entry.scanType || 'picture',
      outerAuraColor: entry.outerAuraColor || 'white',
      outerAuraHex: entry.outerAuraHex || '#F7FAFC',
      innerAuraColor: entry.innerAuraColor || 'white',
      innerAuraHex: entry.innerAuraHex || '#F7FAFC',
      emotionalCoreColor: entry.emotionalCoreColor || 'white',
      emotionalCoreHex: entry.emotionalCoreHex || '#F7FAFC',
      chakraFocus: entry.chakraFocus || 'crown',
      readingSummary: entry.readingSummary || 'Reading saved locally',
      dataSources: entry.dataSources || {},
      createdAt: new Date().toISOString(),
    };
  }
}

// ── Get Entries ─────────────────────────────────────────────────────

export async function getAuraJournalEntries(
  limit = 20,
  offset = 0,
): Promise<AuraJournalEntry[]> {
  const userId = getMyId();
  if (!userId) return [];

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('aura_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('scan_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(rowToEntry);
    }
  } catch (err) {
    console.warn('[AuraJournal] Supabase fetch failed, checking local:', err);
  }

  // Fallback: read from localStorage
  return getFromLocalStorage(limit, offset);
}

function getFromLocalStorage(limit: number, offset: number): AuraJournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const entries: AuraJournalEntry[] = JSON.parse(raw);
    return entries.slice(offset, offset + limit);
  } catch {
    return [];
  }
}

// ── Delete Entry ────────────────────────────────────────────────────

export async function deleteAuraJournalEntry(entryId: string): Promise<boolean> {
  const userId = getMyId();
  if (!userId) return false;

  // Try Supabase
  if (!entryId.startsWith('local-') && !entryId.startsWith('failed-')) {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('aura_sessions')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId);

      if (!error) return true;
    } catch (err) {
      console.warn('[AuraJournal] Supabase delete failed:', err);
    }
  }

  // Fallback: delete from localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const entries: AuraJournalEntry[] = JSON.parse(raw);
    const filtered = entries.filter(e => e.id !== entryId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

// ── Privacy Settings ────────────────────────────────────────────────

export const DEFAULT_PRIVACY: AuraPrivacySettings = {
  saveScans: true,
  savePhotos: false,
  saveVoiceRecordings: false,
  saveInterpretationsOnly: true,
  showAuraBadgeInDating: false,
  allowAuraSharing: false,
  auraHistoryPrivate: true,
  datingAuraVisibility: 'private_only',
};

export function getAuraPrivacySettings(): AuraPrivacySettings {
  try {
    const raw = localStorage.getItem(PRIVACY_KEY);
    if (raw) {
      return { ...DEFAULT_PRIVACY, ...JSON.parse(raw) };
    }
  } catch {}
  return { ...DEFAULT_PRIVACY };
}

export function saveAuraPrivacySettings(settings: AuraPrivacySettings): void {
  try {
    localStorage.setItem(PRIVACY_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('[AuraPrivacy] Failed to save settings:', err);
  }
}

// ── Daily Limit Check ───────────────────────────────────────────────

export async function getDailyScansUsed(): Promise<number> {
  const userId = getMyId();
  if (!userId) return 0;

  const today = new Date().toISOString().split('T')[0];

  try {
    const supabase = createClient();
    const { count, error } = await supabase
      .from('aura_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('scan_date', `${today}T00:00:00Z`);

    if (!error && count != null) return count;
  } catch {}

  // Fallback: check localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const entries: AuraJournalEntry[] = JSON.parse(raw);
    return entries.filter(e => e.scanDate.startsWith(today)).length;
  } catch {}

  return 0;
}

export function getMaxDailyScans(tier: string): number {
  switch (tier) {
    case 'free': return 1;
    case 'light': return 5;
    case 'premium': return 20;
    case 'pro': return 999;
    default: return 1;
  }
}
