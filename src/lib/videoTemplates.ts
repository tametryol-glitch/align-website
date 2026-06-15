/**
 * videoTemplates — one-tap "looks" for the editor. Each template coordinates a
 * filter, optional color adjustments, a background-music track, and a starter
 * captioned title (with a kinetic text style). Applying one just sets editor
 * state, so everything stays fully editable afterward.
 */

import { useVideoEditorStore, type TextOverlay, type FilterPresetId } from '@/stores/videoEditorStore';
import { MUSIC_TRACKS, trackUrl } from './musicLibrary';

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  /** CSS background for the card swatch. */
  accent: string;
  filter: FilterPresetId;
  adjust?: Partial<{ brightness: number; contrast: number; saturation: number; warmth: number }>;
  musicId?: string;
  starterText?: string;
  textStyle: Partial<TextOverlay>;
}

export const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    id: 'mystic',
    name: 'Mystic',
    description: 'Cosmic glow · Lunar Whisper · karaoke title',
    accent: 'linear-gradient(135deg,#3b0764,#a78bfa)',
    filter: 'cosmic',
    adjust: { saturation: 0.15, warmth: -0.1 },
    musicId: 'lunar_whisper',
    starterText: 'Your cosmic moment',
    textStyle: { animation: 'karaoke', color: '#FFD700', fontFamily: 'Playfair Display', fontSize: 30, y: 78, strokeColor: '#1a0533', strokeWidth: 1.5 },
  },
  {
    id: 'cosmic-pop',
    name: 'Cosmic Pop',
    description: 'Dreamy · Cosmic Pulse · word-by-word pop',
    accent: 'linear-gradient(135deg,#db2777,#f9a8d4)',
    filter: 'dreamy',
    adjust: { brightness: 0.05, saturation: 0.2 },
    musicId: 'cosmic_pulse',
    starterText: 'Wait for it',
    textStyle: { animation: 'word-pop', color: '#FFFFFF', fontFamily: 'Arial Black', fontSize: 34, y: 50, strokeColor: '#000000', strokeWidth: 2 },
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Mono · Celestial Drift · clean fade',
    accent: 'linear-gradient(135deg,#1f2937,#9ca3af)',
    filter: 'bw',
    musicId: 'celestial_drift',
    starterText: 'A quiet truth',
    textStyle: { animation: 'fade', color: '#FFFFFF', fontFamily: 'Georgia', fontSize: 26, y: 82, bgColor: '#00000088' },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Cool tones · Nebula Flow · slide-up title',
    accent: 'linear-gradient(135deg,#0e7490,#5eead4)',
    filter: 'cool',
    adjust: { saturation: 0.1 },
    musicId: 'nebula_flow',
    starterText: 'Breathe it in',
    textStyle: { animation: 'slide', color: '#5eead4', fontFamily: 'Inter', fontSize: 30, y: 78, strokeColor: '#06343b', strokeWidth: 1 },
  },
  {
    id: 'starfire',
    name: 'Starfire',
    description: 'Warm · Starfire · dramatic bounce',
    accent: 'linear-gradient(135deg,#b45309,#fbbf24)',
    filter: 'warm',
    adjust: { warmth: 0.2, contrast: 0.1 },
    musicId: 'starfire',
    starterText: 'Rise',
    textStyle: { animation: 'bounce', color: '#FBBF24', fontFamily: 'Impact', fontSize: 40, y: 50, strokeColor: '#3a1d00', strokeWidth: 2 },
  },
  {
    id: 'zodiac-beat',
    name: 'Zodiac Beat',
    description: 'Vintage · Zodiac Beat · punchy word pop',
    accent: 'linear-gradient(135deg,#7c2d12,#f472b6)',
    filter: 'vintage',
    adjust: { saturation: 0.1, warmth: 0.1 },
    musicId: 'zodiac_beat',
    starterText: 'Your sign today',
    textStyle: { animation: 'word-pop', color: '#FFFFFF', fontFamily: 'Trebuchet MS', fontSize: 32, y: 78, bgColor: '#A78BFACC' },
  },
];

/** Apply a template to the editor (filter + adjustments + music + starter title). */
export function applyTemplate(t: VideoTemplate): void {
  const s = useVideoEditorStore.getState();

  s.setActiveFilter(t.filter);
  s.setFilterIntensity(1);
  s.setAdjustBrightness(t.adjust?.brightness ?? 0);
  s.setAdjustContrast(t.adjust?.contrast ?? 0);
  s.setAdjustSaturation(t.adjust?.saturation ?? 0);
  s.setAdjustWarmth(t.adjust?.warmth ?? 0);

  if (t.musicId) {
    const track = MUSIC_TRACKS.find((m) => m.id === t.musicId);
    if (track) s.setMusicTrackUrl(trackUrl(track));
  }

  if (t.starterText) {
    const start = s.trimStart;
    const end = Math.min(s.trimEnd, start + 4);
    const overlay: TextOverlay = {
      id: `text_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      text: t.starterText,
      x: 50,
      y: t.textStyle.y ?? 78,
      fontSize: t.textStyle.fontSize ?? 30,
      color: t.textStyle.color ?? '#FFFFFF',
      fontFamily: t.textStyle.fontFamily ?? 'Inter',
      startTime: start,
      endTime: end,
      animation: t.textStyle.animation ?? 'fade',
      bgColor: t.textStyle.bgColor ?? '',
      strokeColor: t.textStyle.strokeColor ?? '',
      strokeWidth: t.textStyle.strokeWidth ?? 0,
      textAlign: 'center',
      rotation: 0,
    };
    s.addTextOverlay(overlay);
    s.selectOverlay(overlay.id);
  }

  s.pushHistory();
}
