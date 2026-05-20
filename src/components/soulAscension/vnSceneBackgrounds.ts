/**
 * Scene background configurations for Visual Novel mode (web).
 *
 * Each chapter type maps to gradient stops + mood variants.
 * Swap in AI art later by adding imageUrl.
 */

import type { ChapterMission } from '@/lib/soulAscension/types';

export interface SceneBackground {
  gradient: string;         // CSS linear-gradient value
  overlayColor?: string;
  overlayOpacity?: number;
  imageUrl?: string;        // AI art when ready
  particles?: 'embers' | 'dust' | 'stars' | 'rain' | 'none';
}

type ChapterType = ChapterMission['chapterType'];

const SCENE_MAP: Record<ChapterType, SceneBackground> = {
  origin_wound: {
    gradient: 'linear-gradient(135deg, #0D0A1A 0%, #1A1028 30%, #2D1B3D 70%, #0F0A16 100%)',
    overlayColor: '#3D1B5E',
    overlayOpacity: 0.12,
    particles: 'dust',
    imageUrl: '/images/vn/bg_origin.png',
  },
  gift_awakening: {
    gradient: 'linear-gradient(135deg, #0A1520 0%, #142838 30%, #1B3A4D 70%, #0D1A28 100%)',
    overlayColor: '#4ECBD6',
    overlayOpacity: 0.08,
    particles: 'stars',
    imageUrl: '/images/vn/bg_gift.png',
  },
  relationship_test: {
    gradient: 'linear-gradient(135deg, #1A0F1A 0%, #2D1420 30%, #3D1B28 70%, #1A0F16 100%)',
    overlayColor: '#E05D8A',
    overlayOpacity: 0.1,
    particles: 'embers',
    imageUrl: '/images/vn/bg_relationship.png',
  },
  shadow_confrontation: {
    gradient: 'linear-gradient(135deg, #0A0608 0%, #1A0D10 30%, #2D1418 70%, #0F0608 100%)',
    overlayColor: '#E05D5D',
    overlayOpacity: 0.14,
    particles: 'embers',
    imageUrl: '/images/vn/bg_shadow.png',
  },
  purpose_choice: {
    gradient: 'linear-gradient(135deg, #0A0F1A 0%, #14203D 30%, #1B2D5E 70%, #0D1428 100%)',
    overlayColor: '#5EE6A8',
    overlayOpacity: 0.1,
    particles: 'stars',
    imageUrl: '/images/vn/bg_purpose.png',
  },
};

export const CHAPTER_ACCENT: Record<ChapterType, string> = {
  origin_wound: '#B388FF',
  gift_awakening: '#4ECBD6',
  relationship_test: '#E05D8A',
  shadow_confrontation: '#E05D5D',
  purpose_choice: '#5EE6A8',
};

export function getSceneBackground(chapterType: ChapterType): SceneBackground {
  return SCENE_MAP[chapterType] ?? SCENE_MAP.origin_wound;
}
