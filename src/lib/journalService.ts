import { createClient } from '@/lib/supabase';

export interface JournalTransitTag {
  transit: string;
  natal: string;
  aspect: string;
  orb?: number;
  category?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  entryDate: string;
  createdAt: string;
  updatedAt: string;
  text: string;
  mood: number;
  tags: string[];
  transitSnapshot: JournalTransitTag[];
}

export interface CreateEntryInput {
  text: string;
  mood: number;
  entryDate?: string;
  tags?: string[];
  transitSnapshot?: JournalTransitTag[];
}

export interface UpdateEntryInput {
  text?: string;
  mood?: number;
  entryDate?: string;
  tags?: string[];
}

function getSupabase() {
  return createClient();
}

function rowToEntry(row: any): JournalEntry {
  return {
    id: row.id,
    userId: row.user_id,
    entryDate: row.entry_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    text: row.text,
    mood: row.mood,
    tags: Array.isArray(row.tags) ? row.tags : [],
    transitSnapshot: Array.isArray(row.transit_snapshot) ? row.transit_snapshot : [],
  };
}

function normalizeAspect(raw: string): string {
  if (!raw) return '';
  const s = raw.toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function tagKey(tag: JournalTransitTag): string {
  return `${tag.transit}-${normalizeAspect(tag.aspect)}-${tag.natal}`;
}

export function tagLabel(tag: JournalTransitTag): string {
  return `${tag.transit} ${normalizeAspect(tag.aspect)} ${tag.natal}`;
}

export async function createEntry(
  userId: string,
  input: CreateEntryInput,
): Promise<{ entry?: JournalEntry; error?: string }> {
  if (!userId) return { error: 'Not authenticated' };
  if (!input.text || !input.text.trim()) return { error: 'Entry cannot be empty' };
  if (input.mood < 1 || input.mood > 5) return { error: 'Mood must be between 1 and 5' };

  const snapshot = input.transitSnapshot ?? [];
  const tags = input.tags ?? snapshot.map(tagLabel);

  const { data, error } = await getSupabase()
    .from('journal_entries')
    .insert({
      user_id: userId,
      entry_date: input.entryDate ?? new Date().toISOString().split('T')[0],
      text: input.text.trim(),
      mood: input.mood,
      tags,
      transit_snapshot: snapshot,
    })
    .select('*')
    .single();

  if (error) return { error: error.message };
  return { entry: rowToEntry(data) };
}

export async function listEntries(
  userId: string,
  limit = 50,
  offset = 0,
): Promise<{ entries: JournalEntry[]; error?: string }> {
  if (!userId) return { entries: [], error: 'Not authenticated' };

  const { data, error } = await getSupabase()
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { entries: [], error: error.message };
  return { entries: (data || []).map(rowToEntry) };
}

export async function updateEntry(
  userId: string,
  id: string,
  patch: UpdateEntryInput,
): Promise<{ entry?: JournalEntry; error?: string }> {
  if (!userId) return { error: 'Not authenticated' };
  if (patch.mood != null && (patch.mood < 1 || patch.mood > 5)) {
    return { error: 'Mood must be between 1 and 5' };
  }

  const row: any = {};
  if (patch.text != null) row.text = patch.text.trim();
  if (patch.mood != null) row.mood = patch.mood;
  if (patch.entryDate != null) row.entry_date = patch.entryDate;
  if (patch.tags != null) row.tags = patch.tags;

  const { data, error } = await getSupabase()
    .from('journal_entries')
    .update(row)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) return { error: error.message };
  return { entry: rowToEntry(data) };
}

export async function deleteEntry(userId: string, id: string): Promise<{ error?: string }> {
  if (!userId) return { error: 'Not authenticated' };

  const { error } = await getSupabase()
    .from('journal_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return { error: error.message };
  return {};
}

export interface MoodPattern {
  tag: JournalTransitTag;
  occurrences: number;
  meanMood: number;
  delta: number;
}

export interface PatternSummary {
  totalEntries: number;
  baselineMood: number;
  lifts: MoodPattern[];
  drops: MoodPattern[];
  sevenDayTrend: number[];
}

const MIN_OCCURRENCES = 3;

export function computePatterns(entries: JournalEntry[], now: Date = new Date()): PatternSummary {
  if (entries.length === 0) {
    return { totalEntries: 0, baselineMood: 0, lifts: [], drops: [], sevenDayTrend: [] };
  }

  const totalMood = entries.reduce((sum, e) => sum + e.mood, 0);
  const baselineMood = totalMood / entries.length;

  const byTag = new Map<string, { tag: JournalTransitTag; moods: number[] }>();
  for (const e of entries) {
    for (const t of e.transitSnapshot) {
      const k = tagKey(t);
      const bucket = byTag.get(k);
      if (bucket) {
        bucket.moods.push(e.mood);
      } else {
        byTag.set(k, { tag: t, moods: [e.mood] });
      }
    }
  }

  const patterns: MoodPattern[] = [];
  for (const { tag, moods } of Array.from(byTag.values())) {
    if (moods.length < MIN_OCCURRENCES) continue;
    const mean = moods.reduce((a, b) => a + b, 0) / moods.length;
    patterns.push({ tag, occurrences: moods.length, meanMood: mean, delta: mean - baselineMood });
  }

  const lifts = patterns.filter(p => p.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, 5);
  const drops = patterns.filter(p => p.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 5);

  const sevenDayTrend: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const key = day.toISOString().split('T')[0];
    const dayEntries = entries.filter(e => e.entryDate === key);
    if (dayEntries.length === 0) {
      sevenDayTrend.push(NaN);
    } else {
      const avg = dayEntries.reduce((s, e) => s + e.mood, 0) / dayEntries.length;
      sevenDayTrend.push(avg);
    }
  }

  return { totalEntries: entries.length, baselineMood, lifts, drops, sevenDayTrend };
}
