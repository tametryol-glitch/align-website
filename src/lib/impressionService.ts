/**
 * Feed impression tracking.
 *
 * Records which posts a user has actually been shown so the ranking engine
 * can demote content they have already scrolled past. Without this the
 * ranker has no way to know you have seen the same post forty times, which
 * is how a single post ended up camping the top of the cosmic feed.
 *
 * Design notes:
 *   - Writes are BATCHED. Post ids collect in a buffer and flush on a timer,
 *     so a fast scroll past twenty posts costs one round trip, not twenty.
 *   - Writes are BEST EFFORT. An impression that fails to record is a
 *     slightly less well ranked feed, never a broken one, so nothing here
 *     throws into the render path.
 *   - The 30-second re-count debounce lives in SQL, not here, so it holds
 *     across page reloads and across the web/mobile split.
 *
 * Backed by supabase-migration-feed-impressions.sql.
 */

import { createClient } from './supabase';

/** How long to collect ids before sending them. */
const FLUSH_INTERVAL_MS = 4000;

/** Send immediately once this many ids are buffered. */
const MAX_BATCH = 40;

/**
 * Ids already sent this session. Prevents re-sending the same post on every
 * scroll oscillation; the server-side debounce is the real guard, this just
 * saves the round trip.
 */
const sentThisSession = new Set<string>();

let buffer = new Set<string>();
let timer: ReturnType<typeof setTimeout> | null = null;

async function flush(): Promise<void> {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (buffer.size === 0) return;

  const ids = Array.from(buffer);
  buffer = new Set();
  ids.forEach((id) => sentThisSession.add(id));

  try {
    const supabase = createClient();
    await supabase.rpc('record_post_impressions', { p_post_ids: ids });
  } catch {
    // Best effort. A dropped impression only costs ranking quality.
  }
}

/**
 * Note that a post is currently on screen. Safe to call repeatedly — the
 * session cache and the server debounce both dedupe.
 */
export function trackPostImpression(postId: string): void {
  if (!postId || sentThisSession.has(postId) || buffer.has(postId)) return;

  buffer.add(postId);

  if (buffer.size >= MAX_BATCH) {
    void flush();
    return;
  }
  if (!timer) {
    timer = setTimeout(() => { void flush(); }, FLUSH_INTERVAL_MS);
  }
}

/** Track several posts at once (e.g. a viewability callback). */
export function trackPostImpressions(postIds: string[]): void {
  postIds.forEach(trackPostImpression);
}

/**
 * Send anything still buffered. Call on unmount / page hide so impressions
 * from the last few seconds of a session are not lost.
 */
export function flushImpressions(): void {
  void flush();
}

/**
 * How many times the current user has been shown each of these posts.
 * Returns a post_id -> seen_count map; posts never seen are simply absent.
 *
 * Returns an empty map on any failure, which the ranker treats as "nothing
 * seen yet" — the feed degrades to the pre-impression ordering rather than
 * breaking.
 */
export async function getSeenCounts(
  userId: string,
  postIds: string[],
): Promise<Record<string, number>> {
  if (!userId || postIds.length === 0) return {};

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('post_impressions')
      .select('post_id, seen_count')
      .eq('user_id', userId)
      .in('post_id', postIds);

    if (error || !data) return {};

    const map: Record<string, number> = {};
    for (const row of data as Array<{ post_id: string; seen_count: number }>) {
      map[row.post_id] = row.seen_count;
    }
    return map;
  } catch {
    return {};
  }
}

/** Test/debug helper — clears the session dedupe cache. */
export function __resetImpressionSession(): void {
  sentThisSession.clear();
  buffer = new Set();
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}
