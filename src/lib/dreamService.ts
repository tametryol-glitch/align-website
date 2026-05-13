import { createClient } from './supabase';
import { useAuthStore } from '@/stores/authStore';
import type { DreamPrivacy, DreamType, DreamEmotion } from './dreamDictionary';

export interface DreamEntry {
  id: string;
  userId: string;
  title: string;
  description: string;
  emotions: string[];
  people: string[];
  places: string[];
  symbols: string[];
  dreamType: string;
  intensityScore: number;
  privacy: DreamPrivacy;
  interpretationJson: DreamInterpretation | null;
  astrologyContextJson: DreamAstrologyContext | null;
  isProphetic: boolean;
  cameTrueNote: string | null;
  dreamedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DreamInterpretation {
  surfaceStory: string;
  emotionalMeaning: string;
  mainSymbols: { symbol: string; meaning: string }[];
  hiddenMessage: string;
  shadowMessage: string;
  spiritualMeaning: string;
  psychologicalMeaning: string;
  astrologicalConnection: string;
  whyNow: string;
  watchFor: string;
  whatToDo: string;
  reflectionQuestions: string[];
}

export interface DreamAstrologyContext {
  natalMoonSign?: string;
  natalMoonHouse?: number;
  twelfthHouseSign?: string;
  twelfthHousePlanets?: string[];
  eighthHouseSign?: string;
  eighthHousePlanets?: string[];
  fourthHouseSign?: string;
  fourthHousePlanets?: string[];
  neptune?: { sign: string; house: number };
  pluto?: { sign: string; house: number };
  southNode?: { sign: string; house: number };
  chiron?: { sign: string; house: number };
  lilith?: { sign: string; house: number };
  currentMoonSign?: string;
  currentMoonPhase?: string;
  activeTransits?: string[];
  progressedMoonSign?: string;
  progressedMoonHouse?: number;
}

export interface CreateDreamInput {
  title?: string;
  description: string;
  emotions?: string[];
  people?: string[];
  places?: string[];
  symbols?: string[];
  dreamType?: string;
  intensityScore?: number;
  privacy?: DreamPrivacy;
  interpretationJson?: DreamInterpretation | null;
  astrologyContextJson?: DreamAstrologyContext | null;
  dreamedAt?: string;
}

export interface UpdateDreamInput {
  title?: string;
  description?: string;
  emotions?: string[];
  people?: string[];
  places?: string[];
  symbols?: string[];
  dreamType?: string;
  intensityScore?: number;
  privacy?: DreamPrivacy;
  interpretationJson?: DreamInterpretation | null;
  astrologyContextJson?: DreamAstrologyContext | null;
  isProphetic?: boolean;
  cameTrueNote?: string | null;
}

function getMyId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function generateTitle(description: string, emotions: string[], symbols: string[]): string {
  const words = description.split(/\s+/).slice(0, 6).join(' ');
  if (emotions.length > 0 && symbols.length > 0) return `${emotions[0]} dream of ${symbols[0]}`;
  if (symbols.length > 0) return `Dream of ${symbols[0]}`;
  if (emotions.length > 0) return `${emotions[0]} dream`;
  if (words.length > 3) return words + '...';
  return 'Untitled Dream';
}

function rowToEntry(row: any): DreamEntry {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title || '',
    description: row.description || '',
    emotions: Array.isArray(row.emotions) ? row.emotions : [],
    people: Array.isArray(row.people) ? row.people : [],
    places: Array.isArray(row.places) ? row.places : [],
    symbols: Array.isArray(row.symbols) ? row.symbols : [],
    dreamType: row.dream_type || 'normal',
    intensityScore: typeof row.intensity_score === 'number' ? row.intensity_score : 5,
    privacy: row.privacy || 'private',
    interpretationJson: row.interpretation_json || null,
    astrologyContextJson: row.astrology_context_json || null,
    isProphetic: !!row.is_prophetic,
    cameTrueNote: row.came_true_note || null,
    dreamedAt: row.dreamed_at || row.created_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  };
}

function entryToRow(entry: Partial<DreamEntry> & { userId?: string }): any {
  const row: any = {};
  if (entry.userId !== undefined) row.user_id = entry.userId;
  if (entry.title !== undefined) row.title = entry.title;
  if (entry.description !== undefined) row.description = entry.description;
  if (entry.emotions !== undefined) row.emotions = entry.emotions;
  if (entry.people !== undefined) row.people = entry.people;
  if (entry.places !== undefined) row.places = entry.places;
  if (entry.symbols !== undefined) row.symbols = entry.symbols;
  if (entry.dreamType !== undefined) row.dream_type = entry.dreamType;
  if (entry.intensityScore !== undefined) row.intensity_score = entry.intensityScore;
  if (entry.privacy !== undefined) row.privacy = entry.privacy;
  if (entry.interpretationJson !== undefined) row.interpretation_json = entry.interpretationJson;
  if (entry.astrologyContextJson !== undefined) row.astrology_context_json = entry.astrologyContextJson;
  if (entry.isProphetic !== undefined) row.is_prophetic = entry.isProphetic;
  if (entry.cameTrueNote !== undefined) row.came_true_note = entry.cameTrueNote;
  if (entry.dreamedAt !== undefined) row.dreamed_at = entry.dreamedAt;
  return row;
}

export async function createDream(
  input: CreateDreamInput,
): Promise<{ entry?: DreamEntry; error?: string }> {
  const userId = getMyId();
  if (!userId) return { error: 'Not authenticated' };
  if (!input.description?.trim()) return { error: 'Dream description cannot be empty' };

  const title = input.title?.trim()
    ? capitalize(input.title.trim())
    : capitalize(generateTitle(input.description, input.emotions || [], input.symbols || []));

  const supabase = createClient();
  const { data, error } = await supabase
    .from('dream_entries')
    .insert(entryToRow({
      userId,
      title,
      description: input.description.trim(),
      emotions: input.emotions || [],
      people: input.people || [],
      places: input.places || [],
      symbols: input.symbols || [],
      dreamType: input.dreamType || 'normal',
      intensityScore: input.intensityScore ?? 5,
      privacy: input.privacy || 'private',
      interpretationJson: input.interpretationJson || null,
      astrologyContextJson: input.astrologyContextJson || null,
      dreamedAt: input.dreamedAt || new Date().toISOString(),
    }))
    .select('*')
    .single();

  if (error) return { error: error.message };
  return { entry: rowToEntry(data) };
}

export async function listDreams(
  limit = 50,
  offset = 0,
): Promise<{ entries: DreamEntry[]; error?: string }> {
  const userId = getMyId();
  if (!userId) return { entries: [], error: 'Not authenticated' };

  const supabase = createClient();
  const { data, error } = await supabase
    .from('dream_entries')
    .select('*')
    .eq('user_id', userId)
    .order('dreamed_at', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { entries: [], error: error.message };
  return { entries: (data || []).map(rowToEntry) };
}

export async function getDream(
  id: string,
): Promise<{ entry?: DreamEntry; error?: string }> {
  const userId = getMyId();
  if (!userId) return { error: 'Not authenticated' };

  const supabase = createClient();
  const { data, error } = await supabase
    .from('dream_entries')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) return { error: error.message };
  return { entry: rowToEntry(data) };
}

export async function updateDream(
  id: string,
  patch: UpdateDreamInput,
): Promise<{ entry?: DreamEntry; error?: string }> {
  const userId = getMyId();
  if (!userId) return { error: 'Not authenticated' };

  const supabase = createClient();
  const row = entryToRow(patch as any);
  const { data, error } = await supabase
    .from('dream_entries')
    .update(row)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) return { error: error.message };
  return { entry: rowToEntry(data) };
}

export async function deleteDream(id: string): Promise<{ error?: string }> {
  const userId = getMyId();
  if (!userId) return { error: 'Not authenticated' };

  const supabase = createClient();
  const { error } = await supabase
    .from('dream_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return { error: error.message };
  return {};
}

// ── Search & Filter ────────────────────────────────────────────────

export interface DreamFilter {
  query?: string;
  symbol?: string;
  emotion?: string;
  person?: string;
  place?: string;
  dreamType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function searchDreams(
  filter: DreamFilter,
  limit = 50,
): Promise<{ entries: DreamEntry[]; error?: string }> {
  const { entries, error } = await listDreams(500, 0);
  if (error) return { entries: [], error };

  let results = entries;

  if (filter.query) {
    const q = filter.query.toLowerCase();
    results = results.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.symbols.some(s => s.toLowerCase().includes(q)) ||
      e.emotions.some(em => em.toLowerCase().includes(q)) ||
      e.people.some(p => p.toLowerCase().includes(q)) ||
      e.places.some(p => p.toLowerCase().includes(q))
    );
  }
  if (filter.symbol) {
    const s = filter.symbol.toLowerCase();
    results = results.filter(e => e.symbols.some(sym => sym.toLowerCase().includes(s)));
  }
  if (filter.emotion) {
    const em = filter.emotion.toLowerCase();
    results = results.filter(e => e.emotions.some(emo => emo.toLowerCase().includes(em)));
  }
  if (filter.person) {
    const p = filter.person.toLowerCase();
    results = results.filter(e => e.people.some(per => per.toLowerCase().includes(p)));
  }
  if (filter.place) {
    const p = filter.place.toLowerCase();
    results = results.filter(e => e.places.some(pl => pl.toLowerCase().includes(p)));
  }
  if (filter.dreamType) {
    results = results.filter(e => e.dreamType === filter.dreamType);
  }
  if (filter.dateFrom) {
    results = results.filter(e => e.dreamedAt >= filter.dateFrom!);
  }
  if (filter.dateTo) {
    results = results.filter(e => e.dreamedAt <= filter.dateTo!);
  }

  return { entries: results.slice(0, limit) };
}

// ── Pattern Analysis ───────────────────────────────────────────────

export interface DreamPatterns {
  totalDreams: number;
  topSymbols: { symbol: string; count: number }[];
  topEmotions: { emotion: string; count: number }[];
  topPeople: { person: string; count: number }[];
  topTypes: { type: string; count: number }[];
  avgIntensity: number;
  propheticCount: number;
  nightmareCount: number;
  lucidCount: number;
  dreamsByMonth: { month: string; count: number }[];
}

export function computeDreamPatterns(entries: DreamEntry[]): DreamPatterns {
  if (entries.length === 0) {
    return {
      totalDreams: 0, topSymbols: [], topEmotions: [], topPeople: [],
      topTypes: [], avgIntensity: 0, propheticCount: 0,
      nightmareCount: 0, lucidCount: 0, dreamsByMonth: [],
    };
  }

  const symbolCounts = new Map<string, number>();
  const emotionCounts = new Map<string, number>();
  const peopleCounts = new Map<string, number>();
  const typeCounts = new Map<string, number>();
  const monthCounts = new Map<string, number>();

  let intensitySum = 0;
  let propheticCount = 0;
  let nightmareCount = 0;
  let lucidCount = 0;

  for (const e of entries) {
    intensitySum += e.intensityScore;
    if (e.isProphetic) propheticCount++;
    if (e.dreamType === 'nightmare') nightmareCount++;
    if (e.dreamType === 'lucid') lucidCount++;

    for (const s of e.symbols) symbolCounts.set(s, (symbolCounts.get(s) || 0) + 1);
    for (const em of e.emotions) emotionCounts.set(em, (emotionCounts.get(em) || 0) + 1);
    for (const p of e.people) peopleCounts.set(p, (peopleCounts.get(p) || 0) + 1);
    typeCounts.set(e.dreamType, (typeCounts.get(e.dreamType) || 0) + 1);
    const month = e.dreamedAt.slice(0, 7);
    monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
  }

  const sortDesc = (map: Map<string, number>) =>
    Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return {
    totalDreams: entries.length,
    topSymbols: sortDesc(symbolCounts).map(([symbol, count]) => ({ symbol, count })),
    topEmotions: sortDesc(emotionCounts).map(([emotion, count]) => ({ emotion, count })),
    topPeople: sortDesc(peopleCounts).map(([person, count]) => ({ person, count })),
    topTypes: sortDesc(typeCounts).map(([type, count]) => ({ type, count })),
    avgIntensity: intensitySum / entries.length,
    propheticCount,
    nightmareCount,
    lucidCount,
    dreamsByMonth: Array.from(monthCounts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count })),
  };
}
