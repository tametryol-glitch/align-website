'use client';

/**
 * useSoulAscensionAudio — audio playback hook for Soul Ascension (web).
 * Uses the Web Audio API / HTML5 Audio for SFX and ambient layers.
 *
 * Sound files should be placed in `public/audio/soul-ascension/`.
 * Until real audio files are added, playback calls silently no-op.
 */

import { useRef, useCallback, useEffect } from 'react';
import {
  SOUND_CUES,
  AMBIENT_PRESETS,
  getEffectiveVolume,
  type GameSoundEvent,
  type SoundSettings,
  DEFAULT_SOUND_SETTINGS,
} from '@/lib/soulAscension/soundDesignEngine';

const AUDIO_BASE_PATH = '/audio/soul-ascension/';

interface UseSoulAscensionAudioOptions {
  settings?: SoundSettings;
}

export function useSoulAscensionAudio(options?: UseSoulAscensionAudioOptions) {
  const settings = options?.settings ?? DEFAULT_SOUND_SETTINGS;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const sfxRefs = useRef<HTMLAudioElement[]>([]);
  const ambientRefs = useRef<HTMLAudioElement[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      for (const a of sfxRefs.current) {
        a.pause();
        a.src = '';
      }
      for (const a of ambientRefs.current) {
        a.pause();
        a.src = '';
      }
      sfxRefs.current = [];
      ambientRefs.current = [];
    };
  }, []);

  /**
   * Play a one-shot sound effect for a game event.
   */
  const playSound = useCallback(async (event: GameSoundEvent): Promise<void> => {
    try {
      if (typeof window === 'undefined') return;

      const cue = SOUND_CUES[event];
      if (!cue) return;

      const volume = getEffectiveVolume(cue, settingsRef.current);
      if (volume <= 0) return;

      const audio = new Audio(`${AUDIO_BASE_PATH}${cue.assetKey}`);
      audio.volume = volume;
      audio.loop = cue.loop;

      // Track for cleanup
      sfxRefs.current.push(audio);

      audio.addEventListener('ended', () => {
        sfxRefs.current = sfxRefs.current.filter((a) => a !== audio);
      });

      audio.addEventListener('error', () => {
        // Audio file not available — silent no-op
        sfxRefs.current = sfxRefs.current.filter((a) => a !== audio);
      });

      await audio.play().catch(() => {
        // Autoplay blocked or file missing — silent no-op
      });
    } catch {
      // Silent fail
    }
  }, []);

  /**
   * Start playing an ambient preset (loops). Stops any current ambient first.
   */
  const playAmbient = useCallback(async (presetKey: string): Promise<void> => {
    try {
      if (typeof window === 'undefined') return;

      // Stop current ambient
      for (const a of ambientRefs.current) {
        a.pause();
        a.src = '';
      }
      ambientRefs.current = [];

      const preset = AMBIENT_PRESETS[presetKey];
      if (!preset) return;

      if (!settingsRef.current.ambientEnabled) return;

      for (const layer of preset.layers) {
        const effectiveVol = layer.volume * settingsRef.current.masterVolume;
        if (effectiveVol <= 0) continue;

        const audio = new Audio(`${AUDIO_BASE_PATH}${layer.assetKey}`);
        audio.volume = effectiveVol;
        audio.loop = true;

        audio.addEventListener('error', () => {
          ambientRefs.current = ambientRefs.current.filter((a) => a !== audio);
        });

        ambientRefs.current.push(audio);
        await audio.play().catch(() => {});
      }
    } catch {
      // Silent fail
    }
  }, []);

  /**
   * Stop all ambient sounds.
   */
  const stopAmbient = useCallback(() => {
    for (const a of ambientRefs.current) {
      a.pause();
      a.src = '';
    }
    ambientRefs.current = [];
  }, []);

  /**
   * Stop all sounds (SFX + ambient).
   */
  const stopAll = useCallback(() => {
    for (const a of sfxRefs.current) {
      a.pause();
      a.src = '';
    }
    sfxRefs.current = [];
    stopAmbient();
  }, [stopAmbient]);

  return { playSound, playAmbient, stopAmbient, stopAll };
}
