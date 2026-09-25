/**
 * Music on photo posts and stories.
 *
 * A post or story can carry one song from the music library (audio_tracks,
 * see musicLibrary.ts). The row stores the track id plus a copy of its title
 * and public URL, so the feed never has to join the library to play it.
 *
 * Usage (for "trending") is logged by DB triggers when the row is inserted —
 * see supabase-migration-multi-image-music.sql. Listens are logged here.
 */

import { useSyncExternalStore } from 'react';
import { createClient } from '@/lib/supabase';
import { trackUrl, type MusicTrack } from '@/lib/musicLibrary';

export const MAX_POST_IMAGES = 12;

/** What gets written to posts.music_* / stories.music_*. */
export interface AttachedMusic {
  trackId: string;
  title: string;
  url: string;
  startSec: number;
}

export function attachTrack(track: MusicTrack, startSec = 0): AttachedMusic {
  return { trackId: track.id, title: track.name, url: trackUrl(track), startSec };
}

/** DB columns for an insert. Empty object when there's no music. */
export function musicColumns(m: AttachedMusic | null | undefined): Record<string, unknown> {
  if (!m) return {};
  return {
    music_track_id: m.trackId,
    music_title: m.title,
    music_url: m.url,
    music_start_sec: Math.max(0, Math.round(m.startSec * 100) / 100),
  };
}

/** Read music back off a posts / stories row (snake_case). */
export function musicFromRow(r: any): AttachedMusic | undefined {
  if (!r?.music_url) return undefined;
  return {
    trackId: r.music_track_id || '',
    title: r.music_title || '',
    url: r.music_url,
    startSec: Number(r.music_start_sec) || 0,
  };
}

// ── Listens ──────────────────────────────────────────────────────────────────

const listened = new Set<string>();

/** Log one listen per post/story per page session (DB dedupes per day). */
export function recordMusicListen(refKey: string, trackId: string | undefined) {
  if (!trackId || listened.has(refKey)) return;
  listened.add(refKey);
  createClient().rpc('record_music_listen', { p_track_id: trackId }).then(({ error }) => {
    if (error) console.warn('[music] listen not recorded:', error.message);
  });
}

/** Track ids ordered by uses in the last 7 days (for the picker). */
export async function fetchTrendingTrackIds(limit = 20): Promise<string[]> {
  try {
    const { data, error } = await createClient().rpc('get_trending_music', { p_limit: limit });
    if (error || !data) return [];
    return (data as { track_id: string }[]).map((r) => r.track_id);
  } catch {
    return [];
  }
}

// ── Feed playback: one song at a time + a global mute ────────────────────────
//
// Like Instagram/TikTok: sound stays on or off across the whole feed, and only
// the post that is most in view plays. Browsers block audio until the visitor
// has interacted with the page, so the first play may be refused — the chip
// then shows as muted until they tap it.

type Listener = () => void;
const listeners = new Set<Listener>();
let muted = true;
let activeOwner: string | null = null;

function emit() { listeners.forEach((l) => l()); }

try {
  if (typeof window !== 'undefined') muted = window.localStorage.getItem('align.feedMusicMuted') !== '0';
} catch { /* storage blocked */ }

/** persist=false for a browser autoplay block — keep the visitor's choice. */
export function setFeedMuted(next: boolean, persist = true) {
  muted = next;
  if (persist) {
    try { window.localStorage.setItem('align.feedMusicMuted', next ? '1' : '0'); } catch { /* ignore */ }
  }
  emit();
}

export function useFeedMuted(): boolean {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    () => muted,
    () => true,
  );
}

/** Claim the single playing slot (whoever claimed last wins). */
export function claimPlayback(owner: string): void {
  if (activeOwner === owner) return;
  activeOwner = owner;
  emit();
}

export function releasePlayback(owner: string): void {
  if (activeOwner !== owner) return;
  activeOwner = null;
  emit();
}

export function useActiveOwner(): string | null {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    () => activeOwner,
    () => null,
  );
}
