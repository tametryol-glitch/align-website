export type ChatThemeId =
  | 'default'
  | 'cosmic'
  | 'aurora'
  | 'sunset'
  | 'ocean'
  | 'forest'
  | 'midnight'
  | 'cream';

export interface ChatTheme {
  id: ChatThemeId;
  label: string;
  background: [string, string];
  ownBubble: [string, string];
  otherBubble: string;
  ownText: string;
  otherText: string;
  thumbnail: string;
  hidden?: boolean;
}

export const CHAT_THEMES: ChatTheme[] = [
  {
    id: 'default',
    label: 'Default',
    background: ['transparent', 'transparent'],
    ownBubble: ['#9B6FF6', '#7C3AED'],
    otherBubble: '',
    ownText: '#FFFFFF',
    otherText: '',
    thumbnail: '#0A0E1A',
  },
  {
    id: 'cosmic',
    label: 'Cosmic',
    background: ['#1A0E3D', '#2D1B69'],
    ownBubble: ['#A855F7', '#7C3AED'],
    otherBubble: 'rgba(255,255,255,0.10)',
    ownText: '#FFFFFF',
    otherText: '#E9D5FF',
    thumbnail: '#2D1B69',
  },
  {
    id: 'aurora',
    label: 'Aurora',
    background: ['#3B0764', '#831843'],
    ownBubble: ['#EC4899', '#BE185D'],
    otherBubble: 'rgba(255,255,255,0.12)',
    ownText: '#FFFFFF',
    otherText: '#FBCFE8',
    thumbnail: '#831843',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    background: ['#7C2D12', '#9A3412'],
    ownBubble: ['#F97316', '#DC2626'],
    otherBubble: 'rgba(255,255,255,0.12)',
    ownText: '#FFFFFF',
    otherText: '#FED7AA',
    thumbnail: '#9A3412',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    background: ['#0C4A6E', '#1E3A8A'],
    ownBubble: ['#0EA5E9', '#1E40AF'],
    otherBubble: 'rgba(255,255,255,0.10)',
    ownText: '#FFFFFF',
    otherText: '#BAE6FD',
    thumbnail: '#1E3A8A',
  },
  {
    id: 'forest',
    label: 'Forest',
    background: ['#064E3B', '#14532D'],
    ownBubble: ['#10B981', '#047857'],
    otherBubble: 'rgba(255,255,255,0.10)',
    ownText: '#FFFFFF',
    otherText: '#A7F3D0',
    thumbnail: '#14532D',
  },
  {
    id: 'midnight',
    label: 'Midnight',
    background: ['#020617', '#0F172A'],
    ownBubble: ['#3B82F6', '#1E3A8A'],
    otherBubble: 'rgba(255,255,255,0.08)',
    ownText: '#FFFFFF',
    otherText: '#CBD5E1',
    thumbnail: '#0F172A',
  },
  {
    id: 'cream',
    label: 'Cream',
    background: ['#FEF3C7', '#FDE68A'],
    ownBubble: ['#F59E0B', '#D97706'],
    otherBubble: '#FFFFFF',
    ownText: '#FFFFFF',
    otherText: '#451A03',
    thumbnail: '#FDE68A',
  },
];

const THEME_BY_ID = new Map(CHAT_THEMES.map(t => [t.id, t]));

export function getChatTheme(id?: string | null): ChatTheme | null {
  if (!id || id === 'default') return null;
  const t = THEME_BY_ID.get(id as ChatThemeId);
  if (!t || t.id === 'default') return null;
  return t;
}

export function getVisibleChatThemes(): ChatTheme[] {
  return CHAT_THEMES.filter(t => !t.hidden);
}
