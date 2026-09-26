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

import { useEffect, useSyncExternalStore, type RefObject } from 'react';
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

// ── Feed playback: one thing at a time + a global mute ──────────────────────
//
// Like Instagram/TikTok: the post MOST in view plays (a photo post's song or a
// video) and everything else pauses; scrolling past pauses it. Songs start
// with sound ON — the visitor mutes if they want, and that choice is kept.
//
// Browsers refuse sound until the visitor taps the page. When that happens we
// show the song as muted *without* saving it, and the next tap anywhere starts
// the playing element right inside that tap (Safari only allows it there).

type Listener = () => void;
const listeners = new Set<Listener>();
let muted = false;
/** Muted only because the browser blocked autoplay (not the visitor's choice). */
let blockedByBrowser = false;
let activeOwner: string | null = null;
/** How much of each registered post is on screen (0..1). */
const ratios = new Map<string, number>();
/** Someone pressed play by hand — they keep the slot while still on screen. */
let manualOwner: string | null = null;
/** The media element of the post that's playing (for the unblock tap). */
let activeMedia: HTMLMediaElement | null = null;

function emit() { listeners.forEach((l) => l()); }

try {
  if (typeof window !== 'undefined') muted = window.localStorage.getItem('align.feedMusicMuted') === '1';
} catch { /* storage blocked */ }

/** persist=false for a browser autoplay block — keep the visitor's choice. */
export function setFeedMuted(next: boolean, persist = true) {
  muted = next;
  blockedByBrowser = !persist && next;
  if (persist) {
    try { window.localStorage.setItem('align.feedMusicMuted', next ? '1' : '0'); } catch { /* ignore */ }
  }
  if (blockedByBrowser) unblockOnGesture();
  emit();
}

export function isSoundBlocked(): boolean { return blockedByBrowser; }

/** The playing post registers its <audio>/<video> so a tap can start it. */
export function setActiveMedia(el: HTMLMediaElement) { activeMedia = el; }
/** Unregister — only if `el` is still the registered one. */
export function clearActiveMedia(el: HTMLMediaElement) { if (activeMedia === el) activeMedia = null; }

let gestureHooked = false;
const GESTURES = ['pointerdown', 'touchend', 'click', 'keydown'] as const;
/** Next tap/key anywhere lifts a browser autoplay block. */
function unblockOnGesture() {
  if (gestureHooked || typeof document === 'undefined') return;
  gestureHooked = true;
  const unhook = () => {
    GESTURES.forEach((g) => document.removeEventListener(g, lift, true));
    gestureHooked = false;
  };
  function lift(e: Event) {
    // The song chip handles its own tap (it toggles sound itself).
    if ((e.target as Element | null)?.closest?.('[data-music-chip]')) return;
    if (!blockedByBrowser) { unhook(); return; }
    const el = activeMedia;
    if (!el) {
      // Nothing playing right now — just clear the block for the next post.
      blockedByBrowser = false; muted = false; unhook(); emit();
      return;
    }
    // Start it synchronously inside the gesture.
    el.muted = false;
    el.play().then(() => {
      if (!blockedByBrowser) return;
      blockedByBrowser = false; muted = false; unhook(); emit();
    }).catch(() => { /* not a gesture the browser accepts (e.g. a scroll) — keep waiting */ });
  }
  GESTURES.forEach((g) => document.addEventListener(g, lift, true));
}

export function useFeedMuted(): boolean {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    () => muted,
    () => false,
  );
}

function setActive(next: string | null) {
  if (next === activeOwner) return;
  activeOwner = next;
  emit();
}

/** Pick who plays: a manual pick while it's on screen, else the most visible (≥60%). */
function recompute() {
  if (manualOwner && (ratios.get(manualOwner) ?? 0) > 0) { setActive(manualOwner); return; }
  manualOwner = null;
  let best: string | null = null;
  let bestRatio = 0.6;
  ratios.forEach((r, o) => { if (r >= bestRatio) { best = o; bestRatio = r; } });
  setActive(best);
}

/** The visitor pressed play / sound on this post by hand: it takes over. */
export function claimPlayback(owner: string): void {
  manualOwner = owner;
  if (!ratios.has(owner)) ratios.set(owner, 1);
  recompute();
}

export function releasePlayback(owner: string): void {
  if (manualOwner === owner) manualOwner = null;
  recompute();
}

export function useActiveOwner(): string | null {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    () => activeOwner,
    () => null,
  );
}

/**
 * Report how much of `ref` is on screen; the most visible post (at least 60%)
 * gets the playing slot. Returns whether this owner is the one that plays.
 */
export function useInViewPlayback(ref: RefObject<Element | null>, owner: string, enabled = true): boolean {
  const active = useActiveOwner() === owner;
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        ratios.set(owner, entry.isIntersecting ? entry.intersectionRatio : 0);
        recompute();
      },
      { threshold: [0, 0.2, 0.4, 0.6, 0.7, 0.8, 0.9, 1] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      ratios.delete(owner);
      if (manualOwner === owner) manualOwner = null;
      recompute();
    };
  }, [ref, owner, enabled]);
  return active;
}
