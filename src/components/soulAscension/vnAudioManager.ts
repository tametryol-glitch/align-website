/**
 * VN Audio Manager (Web) — handles ambient loops and sound effects
 * for the Soul Ascension Visual Novel mode using HTML5 Audio.
 *
 * Ambient: one looping track per chapter type, crossfades on chapter change.
 * SFX: short one-shot sounds for choice select, unlock, etc.
 *
 * Audio files are served from /audio/vn/. If a file fails to load,
 * the manager silently skips it (graceful degradation).
 *
 * Browser autoplay policy: audio only plays after a user gesture.
 * The first click/tap in the VN scene unlocks the AudioContext.
 * We handle this by catching play() rejections silently.
 *
 * Usage:
 *   import { vnAudio } from './vnAudioManager';
 *   vnAudio.playAmbient('origin_wound');
 *   vnAudio.playSfx('choice_select');
 *   vnAudio.stopAll();
 */

import type { ChapterMission } from '@/lib/soulAscension/types';

type ChapterType = ChapterMission['chapterType'];
type SfxKey =
  | 'typewriter_tick'
  | 'choice_select'
  | 'choice_confirm'
  | 'unlock_relic'
  | 'unlock_prophecy'
  | 'chapter_intro'
  | 'continue'
  | 'reincarnate';

// ── Asset paths (served from public/audio/vn/) ──

const AMBIENT_PATHS: Record<ChapterType, string> = {
  origin_wound: '/audio/vn/ambient_origin.mp3',
  gift_awakening: '/audio/vn/ambient_gift.mp3',
  relationship_test: '/audio/vn/ambient_relationship.mp3',
  shadow_confrontation: '/audio/vn/ambient_shadow.mp3',
  purpose_choice: '/audio/vn/ambient_purpose.mp3',
};

const SFX_PATHS: Record<SfxKey, string> = {
  typewriter_tick: '/audio/vn/sfx_tick.mp3',
  choice_select: '/audio/vn/sfx_select.mp3',
  choice_confirm: '/audio/vn/sfx_confirm.mp3',
  unlock_relic: '/audio/vn/sfx_unlock.mp3',
  unlock_prophecy: '/audio/vn/sfx_prophecy.mp3',
  chapter_intro: '/audio/vn/sfx_chapter.mp3',
  continue: '/audio/vn/sfx_continue.mp3',
  reincarnate: '/audio/vn/sfx_reincarnate.mp3',
};

const CROSSFADE_MS = 1500;
const AMBIENT_VOLUME = 0.35;
const SFX_VOLUME = 0.6;
const FADE_STEPS = 10;

class VNAudioManager {
  private currentAmbient: HTMLAudioElement | null = null;
  private currentAmbientType: ChapterType | null = null;
  private sfxPool: Map<SfxKey, HTMLAudioElement> = new Map();
  private enabled = true;
  private unlocked = false;

  /** Attempt to unlock audio context on user gesture */
  unlock(): void {
    if (this.unlocked) return;
    this.unlocked = true;
    // Resume any pending ambient that was blocked by autoplay policy
    if (this.currentAmbient && this.currentAmbient.paused) {
      this.currentAmbient.play().catch(() => {});
    }
  }

  /** Enable or disable all audio */
  setEnabled(value: boolean): void {
    this.enabled = value;
    if (!value) this.stopAll();
  }

  /** Play an ambient loop for a chapter type. Crossfades if already playing. */
  playAmbient(chapterType: ChapterType): void {
    if (!this.enabled) return;
    if (this.currentAmbientType === chapterType && this.currentAmbient) return;

    const path = AMBIENT_PATHS[chapterType];
    if (!path) return;

    // Fade out current
    if (this.currentAmbient) {
      this.fadeOut(this.currentAmbient, CROSSFADE_MS);
    }

    // Create and play new
    try {
      const audio = new Audio(path);
      audio.loop = true;
      audio.volume = 0;
      audio.preload = 'auto';

      this.currentAmbient = audio;
      this.currentAmbientType = chapterType;

      const playPromise = audio.play();
      if (playPromise) {
        playPromise
          .then(() => {
            this.fadeIn(audio, CROSSFADE_MS, AMBIENT_VOLUME);
          })
          .catch(() => {
            // Autoplay blocked — will resume on unlock()
            audio.volume = AMBIENT_VOLUME;
          });
      }
    } catch {
      // File doesn't exist or can't load — silently skip
    }
  }

  /** Stop ambient audio with a quick fade */
  stopAmbient(): void {
    if (this.currentAmbient) {
      this.fadeOut(this.currentAmbient, 600);
      this.currentAmbient = null;
      this.currentAmbientType = null;
    }
  }

  /** Play a one-shot sound effect */
  playSfx(key: SfxKey): void {
    if (!this.enabled) return;

    const path = SFX_PATHS[key];
    if (!path) return;

    try {
      // Reuse or create
      let sound = this.sfxPool.get(key);
      if (sound) {
        sound.currentTime = 0;
        sound.volume = SFX_VOLUME;
        sound.play().catch(() => {});
        return;
      }

      const audio = new Audio(path);
      audio.volume = SFX_VOLUME;
      audio.preload = 'auto';
      this.sfxPool.set(key, audio);
      audio.play().catch(() => {});
    } catch {
      // File doesn't exist — silently skip
    }
  }

  /** Stop everything and clean up */
  stopAll(): void {
    this.stopAmbient();
    this.sfxPool.forEach((sound) => {
      try {
        sound.pause();
        sound.currentTime = 0;
      } catch {}
    });
    this.sfxPool.clear();
  }

  private fadeIn(audio: HTMLAudioElement, ms: number, targetVol: number): void {
    const stepMs = ms / FADE_STEPS;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      try {
        audio.volume = Math.min(targetVol, (targetVol / FADE_STEPS) * step);
      } catch {}
      if (step >= FADE_STEPS) clearInterval(interval);
    }, stepMs);
  }

  private fadeOut(audio: HTMLAudioElement, ms: number): void {
    const startVol = audio.volume;
    if (startVol <= 0) {
      audio.pause();
      return;
    }
    const stepMs = ms / FADE_STEPS;
    let step = FADE_STEPS;
    const interval = setInterval(() => {
      step--;
      try {
        audio.volume = Math.max(0, (startVol / FADE_STEPS) * step);
      } catch {}
      if (step <= 0) {
        clearInterval(interval);
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {}
      }
    }, stepMs);
  }
}

/** Singleton audio manager for the web VN system */
export const vnAudio = new VNAudioManager();
