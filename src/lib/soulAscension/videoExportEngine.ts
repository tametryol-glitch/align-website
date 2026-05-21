/**
 * videoExportEngine — generates shareable card images / short video clips
 * from key game moments for TikTok, Reels, and Stories.
 *
 * This engine defines the data structure and text layouts.
 * Actual rendering uses:
 * - Mobile: react-native-view-shot for card capture
 * - Web: html2canvas + canvas recording
 */

import type { ChoicePath, ChoiceRecord, MissionResolution, ScoreState } from './types';

export type ExportFormat = 'card' | 'story' | 'reel';

export interface ExportTemplate {
  id: string;
  name: string;
  format: ExportFormat;
  /** Aspect ratio */
  aspectRatio: string;
  /** Width in px (height derived from ratio) */
  width: number;
  /** Background gradient */
  gradient: string[];
  /** Duration in seconds (for video) */
  durationSec: number;
}

export const EXPORT_TEMPLATES: Record<ExportFormat, ExportTemplate> = {
  card: {
    id: 'tpl-card',
    name: 'Share Card',
    format: 'card',
    aspectRatio: '1:1',
    width: 1080,
    gradient: ['#090A12', '#142224', '#241B2F'],
    durationSec: 0,
  },
  story: {
    id: 'tpl-story',
    name: 'Story / Status',
    format: 'story',
    aspectRatio: '9:16',
    width: 1080,
    gradient: ['#090A12', '#1A1030', '#0A1A1C'],
    durationSec: 15,
  },
  reel: {
    id: 'tpl-reel',
    name: 'TikTok / Reel',
    format: 'reel',
    aspectRatio: '9:16',
    width: 1080,
    gradient: ['#0A0A14', '#1A0F2E', '#0C1A1E'],
    durationSec: 30,
  },
};

/**
 * A shareable moment that can be exported.
 */
export interface ShareableMoment {
  id: string;
  type: 'choice' | 'boss' | 'review' | 'reincarnation' | 'relic' | 'soul_type';
  title: string;
  subtitle: string;
  bodyText: string;
  /** Player's avatar name */
  avatarName: string;
  /** Score snapshot */
  scores: ScoreState;
  /** Choice path color */
  accentColor: string;
  /** Timestamp */
  timestamp: string;
  /** Branding watermark text */
  watermark: string;
}

const PATH_ACCENT_COLORS: Record<string, string> = {
  comfort: '#F5A623',
  shadow: '#E05D5D',
  purpose: '#5EE6A8',
  neutral: '#A8B0C0',
  risk: '#4ECBD6',
};

/**
 * Build a shareable moment from a mission resolution.
 */
export function buildChoiceMoment(
  resolution: MissionResolution,
  avatarName: string,
  scores: ScoreState,
): ShareableMoment {
  return {
    id: `moment-${Date.now()}`,
    type: 'choice',
    title: resolution.mission.title,
    subtitle: `Chapter ${resolution.mission.chapterNumber}`,
    bodyText: resolution.choice.consequenceText,
    avatarName,
    scores,
    accentColor: PATH_ACCENT_COLORS[resolution.choice.path] || PATH_ACCENT_COLORS.neutral,
    timestamp: new Date().toISOString(),
    watermark: 'Soul Ascension — Align',
  };
}

/**
 * Build a shareable moment from a soul review ending.
 */
export function buildReviewMoment(
  endingTitle: string,
  endingDescription: string,
  avatarName: string,
  scores: ScoreState,
  ascensionLevel: number,
): ShareableMoment {
  return {
    id: `moment-${Date.now()}`,
    type: 'review',
    title: endingTitle,
    subtitle: `Ascension Level ${ascensionLevel}`,
    bodyText: endingDescription,
    avatarName,
    scores,
    accentColor: '#F0C15C',
    timestamp: new Date().toISOString(),
    watermark: 'Soul Ascension — Align',
  };
}

/**
 * Build a shareable moment for soul type result.
 */
export function buildSoulTypeMoment(
  soulType: string,
  description: string,
  avatarName: string,
  scores: ScoreState,
): ShareableMoment {
  return {
    id: `moment-${Date.now()}`,
    type: 'soul_type',
    title: `Soul Type: ${soulType}`,
    subtitle: avatarName,
    bodyText: description,
    avatarName,
    scores,
    accentColor: '#4ECBD6',
    timestamp: new Date().toISOString(),
    watermark: 'Soul Ascension — Align',
  };
}

/**
 * Generate the share caption text for social media.
 */
export function generateShareCaption(moment: ShareableMoment): string {
  switch (moment.type) {
    case 'choice':
      return `I faced "${moment.title}" in Soul Ascension and chose my path. What would you do?\n\n✨ Play your past lives at alignapp.co/soul-ascension`;
    case 'boss':
      return `I encountered ${moment.title} in Soul Ascension. The stakes were real.\n\n⚔️ Face your karmic bosses at alignapp.co/soul-ascension`;
    case 'review':
      return `My soul review is in: ${moment.title}. Ascension Level ${moment.subtitle}.\n\n🔮 Discover your soul's journey at alignapp.co/soul-ascension`;
    case 'reincarnation':
      return `I reincarnated in Soul Ascension! New lifetime, new choices.\n\n♻️ Begin your soul journey at alignapp.co/soul-ascension`;
    case 'soul_type':
      return `My soul type is ${moment.title}! What's yours?\n\n🌟 Find out at alignapp.co/soul-ascension`;
    default:
      return `Playing Soul Ascension — where your birth chart becomes a game.\n\n🎮 alignapp.co/soul-ascension`;
  }
}

/**
 * Estimate the file size of an export (rough KB).
 */
export function estimateExportSize(format: ExportFormat): number {
  switch (format) {
    case 'card': return 150;
    case 'story': return 500;
    case 'reel': return 2000;
    default: return 200;
  }
}
