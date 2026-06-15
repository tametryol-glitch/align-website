/**
 * Cosmic Video Service — types, template catalog, and API wrappers.
 *
 * Web equivalent of align-app/src/services/cosmicVideoService.ts.
 * Uses the shared api singleton for all backend calls.
 */

import { api } from './api';

// -- Types ---------------------------------------------------------------

export type TemplateId =
  | 'chart_reveal'
  | 'daily_forecast'
  | 'transit_alert'
  | 'compatibility_check'
  | 'zodiac_personality';

export type RenderStatus = 'queued' | 'rendering' | 'ready' | 'failed';

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  description: string;
  durationRange: [number, number];
  requiresChart: boolean;
  requiresPartner: boolean;
  emoji: string;
  premium: boolean;
}

export interface AudioOption {
  type: 'none' | 'tts';
  tts_voice?: string;
  tts_text?: string;
}

export interface RenderRequest {
  template_id: TemplateId;
  astro_data: Record<string, unknown>;
  audio_option: AudioOption;
  customizations?: {
    duration_seconds?: number;
    color_theme?: string;
    target_sign?: string;
    music_track_id?: string;
    music_volume?: number;
    text_overlays?: TextOverlayConfig[];
    ar_filter_id?: string;
    /** Cosmic Studio visual Style (decoupled look). Backend adopts this in the
     *  renderer; older renderer versions safely ignore the extra field. */
    style_id?: string;
    /** Watermark handle burned into the video for shareability. */
    watermark_handle?: string;
  };
}

export interface RenderJob {
  id: string;
  job_id: string;
  status: RenderStatus;
  video_url?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  estimated_seconds?: number;
  error?: string;
  created_at: string;
}

export interface CosmicVideo {
  id: string;
  template_id: TemplateId;
  status: RenderStatus;
  video_url?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  created_at: string;
}

// -- Template Catalog ----------------------------------------------------

export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'chart_reveal',
    name: 'Chart Reveal',
    description:
      'Animated zodiac wheel with your planets dropping in. Reveals your Sun, Moon & Rising.',
    durationRange: [25, 35],
    requiresChart: true,
    requiresPartner: false,
    emoji: '\u{1F30C}',
    premium: false,
  },
  {
    id: 'daily_forecast',
    name: 'Daily Forecast',
    description:
      "Today's moon phase, active transits, and a personalized cosmic weather report.",
    durationRange: [30, 45],
    requiresChart: true,
    requiresPartner: false,
    emoji: '\u{1F52E}',
    premium: false,
  },
  {
    id: 'transit_alert',
    name: 'Transit Alert',
    description:
      'Spotlight a specific transit hitting your chart right now with animated aspect lines.',
    durationRange: [20, 30],
    requiresChart: true,
    requiresPartner: false,
    emoji: '⚡',
    premium: false,
  },
  {
    id: 'compatibility_check',
    name: 'Compatibility Check',
    description:
      'Two charts merge, synastry aspects light up, and your compatibility score is revealed.',
    durationRange: [40, 60],
    requiresChart: true,
    requiresPartner: true,
    emoji: '\u{1F49C}',
    premium: true,
  },
  {
    id: 'zodiac_personality',
    name: 'Zodiac Personality',
    description:
      'Pick any sign — animated glyph, element effects, and key personality traits.',
    durationRange: [15, 20],
    requiresChart: false,
    requiresPartner: false,
    emoji: '♈',
    premium: false,
  },
];

export const FREE_MONTHLY_VIDEO_LIMIT = 3;

// -- Text Overlay Config -------------------------------------------------

export interface TextOverlayConfig {
  text: string;
  start_sec: number;
  end_sec?: number;
  position?: 'top' | 'center' | 'bottom';
  font_size?: number;
  color?: string;
  animation?: 'fade' | 'slide' | 'scale' | 'typewriter';
}

// -- Color Themes --------------------------------------------------------

export interface ColorThemeOption {
  id: string;
  name: string;
  preview: [string, string];
}

export const COLOR_THEMES: ColorThemeOption[] = [
  { id: 'default', name: 'Cosmic Purple', preview: ['#1E1B4B', '#7C3AED'] },
  { id: 'midnight_blue', name: 'Midnight Blue', preview: ['#0C1445', '#2563EB'] },
  { id: 'aurora', name: 'Aurora', preview: ['#064E3B', '#10B981'] },
  { id: 'rose_gold', name: 'Rose Gold', preview: ['#4A044E', '#F472B6'] },
  { id: 'obsidian', name: 'Obsidian', preview: ['#1C1917', '#F59E0B'] },
  { id: 'nebula', name: 'Nebula', preview: ['#312E81', '#A78BFA'] },
];

// -- Music Track Catalog -------------------------------------------------

export interface MusicTrack {
  id: string;
  name: string;
  mood: string;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: 'celestial_drift', name: 'Celestial Drift', mood: 'Ethereal' },
  { id: 'cosmic_pulse', name: 'Cosmic Pulse', mood: 'Energetic' },
  { id: 'lunar_whisper', name: 'Lunar Whisper', mood: 'Calm' },
  { id: 'starfire', name: 'Starfire', mood: 'Dramatic' },
  { id: 'nebula_flow', name: 'Nebula Flow', mood: 'Chill' },
  { id: 'zodiac_beat', name: 'Zodiac Beat', mood: 'Upbeat' },
];

// -- AR Filter Catalog ---------------------------------------------------

export interface ARFilterOption {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export const AR_FILTERS: ARFilterOption[] = [
  { id: 'celestial_frame', name: 'Celestial Frame', description: 'Golden corner brackets with rotating zodiac ring', emoji: '✨' },
  { id: 'zodiac_glow', name: 'Zodiac Glow', description: 'Pulsing zodiac glyphs orbiting the frame', emoji: '♈' },
  { id: 'stardust', name: 'Stardust', description: 'Dense sparkling micro-stars falling gently', emoji: '🌟' },
  { id: 'mystic_vignette', name: 'Mystic Vignette', description: 'Breathing edge vignette with color tint', emoji: '🔮' },
  { id: 'cosmic_grain', name: 'Cosmic Grain', description: 'Film grain texture with subtle color shift', emoji: '🎞️' },
  { id: 'aurora_wash', name: 'Aurora Wash', description: 'Sweeping aurora borealis color bands', emoji: '🌈' },
  { id: 'neon_glow', name: 'Neon Glow', description: 'Pulsing neon edge glow with corner accents', emoji: '💡' },
  { id: 'bokeh', name: 'Bokeh', description: 'Soft blurred light orbs floating gently', emoji: '🫧' },
  { id: 'vintage', name: 'Vintage', description: 'Warm sepia tones with light leak and faded edges', emoji: '📷' },
  { id: 'glitch', name: 'Glitch', description: 'Digital RGB shift bars that flicker periodically', emoji: '📺' },
];

// -- API wrappers --------------------------------------------------------

export async function requestRender(request: RenderRequest): Promise<RenderJob> {
  return api.renderCosmicVideo(request);
}

export async function getRenderStatus(videoId: string): Promise<RenderJob> {
  return api.getVideoRenderStatus(videoId);
}

export async function generateScript(
  templateId: TemplateId,
  astroData: Record<string, unknown>,
): Promise<string> {
  const result = await api.generateVideoScript(templateId, astroData);
  return result.script;
}

export async function getMyVideos(
  limit = 20,
  offset = 0,
): Promise<CosmicVideo[]> {
  return api.getMyCosmicVideos(limit, offset);
}
