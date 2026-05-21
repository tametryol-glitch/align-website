/**
 * spectatorModeEngine — watch other players' soul ascension runs.
 *
 * Players can opt in to make their runs spectatable. Spectators see
 * a read-only replay of the player's choices with slight delay.
 * Uses Supabase Realtime for live spectating.
 */

import type { ChoicePath, ChoiceRecord, ScoreState } from './types';

export interface SpectatableRun {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  soulType: string;
  ascensionLevel: number;
  lifetimeTitle: string;
  currentChapter: number;
  totalChapters: number;
  /** Current viewer count */
  spectatorCount: number;
  /** Whether the run is live (in progress) */
  isLive: boolean;
  /** Brief teaser about the current chapter */
  currentMood: string;
  startedAt: string;
}

export interface SpectatorEvent {
  id: string;
  runId: string;
  timestamp: string;
  type: SpectatorEventType;
  data: SpectatorEventData;
}

export type SpectatorEventType =
  | 'chapter_start'
  | 'choice_made'
  | 'score_change'
  | 'boss_encounter'
  | 'npc_dialogue'
  | 'relic_unlock'
  | 'reincarnation'
  | 'soul_review';

export type SpectatorEventData =
  | { type: 'chapter_start'; chapterNumber: number; chapterTitle: string }
  | { type: 'choice_made'; choicePath: ChoicePath; choiceText: string; consequenceText: string }
  | { type: 'score_change'; field: string; oldValue: number; newValue: number }
  | { type: 'boss_encounter'; bossName: string; outcome: 'victory' | 'defeat' }
  | { type: 'npc_dialogue'; npcName: string; dialogue: string }
  | { type: 'relic_unlock'; relicName: string }
  | { type: 'reincarnation'; newLevel: number }
  | { type: 'soul_review'; endingType: string; endingTitle: string };

/**
 * Spectator mode settings for a player.
 */
export interface SpectatorSettings {
  /** Allow others to watch */
  isSpectatable: boolean;
  /** Show real display name or anonymize */
  showDisplayName: boolean;
  /** Delay in seconds before events are shown to spectators */
  delaySeconds: number;
  /** Allow spectator emoji reactions */
  allowReactions: boolean;
}

export const DEFAULT_SPECTATOR_SETTINGS: SpectatorSettings = {
  isSpectatable: false,
  showDisplayName: true,
  delaySeconds: 10,
  allowReactions: true,
};

/**
 * Emoji reactions spectators can send.
 */
export const SPECTATOR_REACTIONS = [
  { emoji: '✨', label: 'Inspired' },
  { emoji: '😱', label: 'Shocked' },
  { emoji: '🔥', label: 'Bold' },
  { emoji: '💀', label: 'Risky' },
  { emoji: '🙏', label: 'Respect' },
  { emoji: '😭', label: 'Emotional' },
  { emoji: '🤔', label: 'Hmm' },
  { emoji: '👏', label: 'Bravo' },
] as const;

/**
 * Build a spectator event from a choice.
 */
export function buildChoiceEvent(
  runId: string,
  choicePath: ChoicePath,
  choiceText: string,
  consequenceText: string,
): Omit<SpectatorEvent, 'id'> {
  return {
    runId,
    timestamp: new Date().toISOString(),
    type: 'choice_made',
    data: { type: 'choice_made', choicePath, choiceText, consequenceText },
  };
}

/**
 * Build a spectator event from a score change.
 */
export function buildScoreChangeEvent(
  runId: string,
  field: string,
  oldValue: number,
  newValue: number,
): Omit<SpectatorEvent, 'id'> {
  return {
    runId,
    timestamp: new Date().toISOString(),
    type: 'score_change',
    data: { type: 'score_change', field, oldValue, newValue },
  };
}

/**
 * Build a spectator event from a chapter start.
 */
export function buildChapterStartEvent(
  runId: string,
  chapterNumber: number,
  chapterTitle: string,
): Omit<SpectatorEvent, 'id'> {
  return {
    runId,
    timestamp: new Date().toISOString(),
    type: 'chapter_start',
    data: { type: 'chapter_start', chapterNumber, chapterTitle },
  };
}

/**
 * Format a spectator event for display in the live feed.
 */
export function formatSpectatorEvent(event: SpectatorEvent, playerName: string): string {
  switch (event.data.type) {
    case 'chapter_start':
      return `${playerName} entered Chapter ${event.data.chapterNumber}: ${event.data.chapterTitle}`;
    case 'choice_made':
      return `${playerName} chose the ${event.data.choicePath} path`;
    case 'score_change': {
      const delta = event.data.newValue - event.data.oldValue;
      const direction = delta >= 0 ? '↑' : '↓';
      return `${playerName}'s ${event.data.field} ${direction} ${Math.abs(delta)}`;
    }
    case 'boss_encounter':
      return `${playerName} ${event.data.outcome === 'victory' ? 'defeated' : 'lost to'} ${event.data.bossName}`;
    case 'npc_dialogue':
      return `${event.data.npcName} spoke to ${playerName}`;
    case 'relic_unlock':
      return `${playerName} unlocked relic: ${event.data.relicName}`;
    case 'reincarnation':
      return `${playerName} reincarnated to level ${event.data.newLevel}!`;
    case 'soul_review':
      return `${playerName} completed their soul review: ${event.data.endingTitle}`;
    default:
      return `${playerName} did something mysterious`;
  }
}

/**
 * Build the payload for making a run spectatable in Supabase.
 */
export function buildSpectatablePayload(
  userId: string,
  displayName: string,
  avatarUrl: string | null,
  soulType: string,
  ascensionLevel: number,
  lifetimeTitle: string,
  totalChapters: number,
): Record<string, unknown> {
  return {
    user_id: userId,
    display_name: displayName,
    avatar_url: avatarUrl,
    soul_type: soulType,
    ascension_level: ascensionLevel,
    lifetime_title: lifetimeTitle,
    current_chapter: 1,
    total_chapters: totalChapters,
    spectator_count: 0,
    is_live: true,
    started_at: new Date().toISOString(),
  };
}

// ── Supabase integration ────────────────────────────────────────

/** Minimal supabase client shape (platform-agnostic). */
interface SupabaseClientLike {
  from(table: string): any;
  channel(name: string): any;
  removeChannel(channel: any): void;
}

/**
 * Start a spectatable run — inserts a row in soul_spectatable_runs.
 */
export async function startSpectatableRun(
  supabase: SupabaseClientLike,
  userId: string,
  displayName: string,
  avatarUrl: string | null,
  soulType: string,
  ascensionLevel: number,
  lifetimeTitle: string,
  totalChapters: number,
): Promise<SpectatableRun> {
  const payload = buildSpectatablePayload(userId, displayName, avatarUrl, soulType, ascensionLevel, lifetimeTitle, totalChapters);
  const { data, error } = await supabase
    .from('soul_spectatable_runs')
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(`Start spectatable run failed: ${error.message}`);
  return mapRunRow(data);
}

/**
 * End a spectatable run (set is_live = false).
 */
export async function endSpectatableRun(
  supabase: SupabaseClientLike,
  runId: string,
): Promise<void> {
  const { error } = await supabase
    .from('soul_spectatable_runs')
    .update({ is_live: false, updated_at: new Date().toISOString() })
    .eq('id', runId);
  if (error) throw new Error(`End spectatable run failed: ${error.message}`);
}

/**
 * Update chapter progress on a live run.
 */
export async function updateRunChapter(
  supabase: SupabaseClientLike,
  runId: string,
  chapter: number,
  mood: string,
): Promise<void> {
  const { error } = await supabase
    .from('soul_spectatable_runs')
    .update({ current_chapter: chapter, current_mood: mood, updated_at: new Date().toISOString() })
    .eq('id', runId);
  if (error) throw new Error(`Update run chapter failed: ${error.message}`);
}

/**
 * Publish a spectator event.
 */
export async function publishSpectatorEvent(
  supabase: SupabaseClientLike,
  event: Omit<SpectatorEvent, 'id'>,
): Promise<void> {
  const { error } = await supabase.from('soul_spectator_events').insert({
    run_id: event.runId,
    event_type: event.type,
    event_data: event.data,
    created_at: event.timestamp,
  });
  if (error) throw new Error(`Publish spectator event failed: ${error.message}`);
}

/**
 * Fetch currently live spectatable runs.
 */
export async function fetchLiveRuns(
  supabase: SupabaseClientLike,
  limit = 20,
): Promise<SpectatableRun[]> {
  const { data, error } = await supabase
    .from('soul_spectatable_runs')
    .select('*')
    .eq('is_live', true)
    .order('spectator_count', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Fetch live runs failed: ${error.message}`);
  return (data || []).map(mapRunRow);
}

/**
 * Fetch recent events for a run.
 */
export async function fetchRunEvents(
  supabase: SupabaseClientLike,
  runId: string,
  limit = 50,
): Promise<SpectatorEvent[]> {
  const { data, error } = await supabase
    .from('soul_spectator_events')
    .select('*')
    .eq('run_id', runId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Fetch run events failed: ${error.message}`);
  return (data || []).map(mapEventRow);
}

/**
 * Subscribe to live events for a spectatable run.
 */
export function subscribeToRun(
  supabase: SupabaseClientLike,
  runId: string,
  onEvent: (event: SpectatorEvent) => void,
  onRunUpdate: (run: SpectatableRun) => void,
): { unsubscribe: () => void } {
  const channel = supabase
    .channel(`spectate_${runId}`)
    .on(
      'postgres_changes' as any,
      { event: 'INSERT', schema: 'public', table: 'soul_spectator_events', filter: `run_id=eq.${runId}` },
      (payload: any) => onEvent(mapEventRow(payload.new)),
    )
    .on(
      'postgres_changes' as any,
      { event: 'UPDATE', schema: 'public', table: 'soul_spectatable_runs', filter: `id=eq.${runId}` },
      (payload: any) => onRunUpdate(mapRunRow(payload.new)),
    )
    .subscribe();
  return { unsubscribe: () => supabase.removeChannel(channel) };
}

/**
 * Increment spectator count when someone starts watching.
 */
export async function incrementSpectatorCount(
  supabase: SupabaseClientLike,
  runId: string,
  delta: 1 | -1,
): Promise<void> {
  // Fetch current count, then update
  const { data, error: fetchErr } = await supabase
    .from('soul_spectatable_runs')
    .select('spectator_count')
    .eq('id', runId)
    .single();
  if (fetchErr) return;
  const newCount = Math.max(0, (data?.spectator_count ?? 0) + delta);
  await supabase
    .from('soul_spectatable_runs')
    .update({ spectator_count: newCount })
    .eq('id', runId);
}

/** Map a DB row to a SpectatableRun object. */
function mapRunRow(row: any): SpectatableRun {
  return {
    id: row.id,
    userId: row.user_id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    soulType: row.soul_type,
    ascensionLevel: row.ascension_level,
    lifetimeTitle: row.lifetime_title,
    currentChapter: row.current_chapter,
    totalChapters: row.total_chapters,
    spectatorCount: row.spectator_count,
    isLive: row.is_live,
    currentMood: row.current_mood || '',
    startedAt: row.started_at,
  };
}

/** Map a DB row to a SpectatorEvent object. */
function mapEventRow(row: any): SpectatorEvent {
  return {
    id: row.id,
    runId: row.run_id,
    timestamp: row.created_at,
    type: row.event_type,
    data: row.event_data,
  };
}
