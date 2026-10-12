export type ChatThemeId =
  | 'default'
  | 'cosmic'
  | 'aurora'
  | 'sunset'
  | 'ocean'
  | 'forest'
  | 'midnight'
  | 'cream'
  | 'rosegold' | 'neoncity' | 'lavender' | 'goldenhour' | 'glacier' | 'sakura'
  | 'ember' | 'deepspace' | 'mint' | 'graphite' | 'dunes' | 'cyberpop'
  | 'custom';

export interface ChatTheme {
  id: ChatThemeId;
  label: string;
  // 2+ stops, top-left to bottom-right.
  background: string[];
  ownBubble: [string, string];
  otherBubble: string;
  ownText: string;
  otherText: string;
  thumbnail: string;
  hidden?: boolean;
  // Custom photo wallpaper (id 'custom'): drawn over the gradient, dimmed for legibility.
  imageUrl?: string;
  dim?: number;
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
  {
    id: 'rosegold',
    label: 'Rose Gold',
    background: ['#3B1F2B', '#8E4A5E', '#E8A598'],
    ownBubble: ['#F4A6B7', '#C2557A'],
    otherBubble: 'rgba(255,255,255,0.14)',
    ownText: '#FFFFFF',
    otherText: '#FFE4EA',
    thumbnail: '#8E4A5E',
  },
  {
    id: 'neoncity',
    label: 'Neon City',
    background: ['#0B0221', '#2A0B5E', '#0F7C94'],
    ownBubble: ['#22D3EE', '#7C3AED'],
    otherBubble: 'rgba(255,255,255,0.10)',
    ownText: '#FFFFFF',
    otherText: '#CFFAFE',
    thumbnail: '#2A0B5E',
  },
  {
    id: 'lavender',
    label: 'Lavender Haze',
    background: ['#4C3A8A', '#8B7BD8', '#E3B8F0'],
    ownBubble: ['#A78BFA', '#7C3AED'],
    otherBubble: 'rgba(255,255,255,0.16)',
    ownText: '#FFFFFF',
    otherText: '#F3E8FF',
    thumbnail: '#8B7BD8',
  },
  {
    id: 'goldenhour',
    label: 'Golden Hour',
    background: ['#4A1D0A', '#B4531A', '#F6B24C'],
    ownBubble: ['#F59E0B', '#C2410C'],
    otherBubble: 'rgba(0,0,0,0.28)',
    ownText: '#FFFFFF',
    otherText: '#FFF1D6',
    thumbnail: '#B4531A',
  },
  {
    id: 'glacier',
    label: 'Glacier',
    background: ['#06263A', '#1D6A8C', '#9ADBE8'],
    ownBubble: ['#38BDF8', '#0369A1'],
    otherBubble: 'rgba(255,255,255,0.16)',
    ownText: '#FFFFFF',
    otherText: '#E0F7FF',
    thumbnail: '#1D6A8C',
  },
  {
    id: 'sakura',
    label: 'Sakura',
    background: ['#FBE3EC', '#F7C1D4', '#E9A3C1'],
    ownBubble: ['#EC6A9C', '#C2306E'],
    otherBubble: '#FFFFFF',
    ownText: '#FFFFFF',
    otherText: '#5B1634',
    thumbnail: '#F7C1D4',
  },
  {
    id: 'ember',
    label: 'Ember',
    background: ['#140606', '#5A1408', '#C2410C'],
    ownBubble: ['#F97316', '#B91C1C'],
    otherBubble: 'rgba(255,255,255,0.10)',
    ownText: '#FFFFFF',
    otherText: '#FFD9C2',
    thumbnail: '#5A1408',
  },
  {
    id: 'deepspace',
    label: 'Deep Space',
    background: ['#000000', '#0B1026', '#1B1B4B'],
    ownBubble: ['#6366F1', '#3730A3'],
    otherBubble: 'rgba(255,255,255,0.08)',
    ownText: '#FFFFFF',
    otherText: '#C7D2FE',
    thumbnail: '#0B1026',
  },
  {
    id: 'mint',
    label: 'Mint Fresh',
    background: ['#D9F7EA', '#A8E8CF', '#6FD1B0'],
    ownBubble: ['#10B981', '#047857'],
    otherBubble: '#FFFFFF',
    ownText: '#FFFFFF',
    otherText: '#064E3B',
    thumbnail: '#A8E8CF',
  },
  {
    id: 'graphite',
    label: 'Graphite',
    background: ['#111315', '#1F2327', '#2B3036'],
    ownBubble: ['#94A3B8', '#475569'],
    otherBubble: 'rgba(255,255,255,0.08)',
    ownText: '#FFFFFF',
    otherText: '#E2E8F0',
    thumbnail: '#1F2327',
  },
  {
    id: 'dunes',
    label: 'Desert Dusk',
    background: ['#2B1B3D', '#9A4D5E', '#F2A65A'],
    ownBubble: ['#FB923C', '#BE123C'],
    otherBubble: 'rgba(255,255,255,0.14)',
    ownText: '#FFFFFF',
    otherText: '#FFE8D1',
    thumbnail: '#9A4D5E',
  },
  {
    id: 'cyberpop',
    label: 'Cyber Pop',
    background: ['#1A0B3B', '#B5179E', '#4361EE'],
    ownBubble: ['#F72585', '#7209B7'],
    otherBubble: 'rgba(255,255,255,0.12)',
    ownText: '#FFFFFF',
    otherText: '#FDE2F3',
    thumbnail: '#B5179E',
  },
];

const THEME_BY_ID = new Map(CHAT_THEMES.map(t => [t.id, t]));

export function getChatTheme(id?: string | null): ChatTheme | null {
  if (!id || id === 'default' || id === 'custom') return null;
  const t = THEME_BY_ID.get(id as ChatThemeId);
  if (!t || t.id === 'default') return null;
  return t;
}

export function getVisibleChatThemes(): ChatTheme[] {
  return CHAT_THEMES.filter(t => !t.hidden);
}

/** A user-chosen photo wallpaper. dim = 0..80 (% black overlay). */
export function buildCustomTheme(imageUrl: string, dim = 25): ChatTheme {
  return {
    id: 'custom',
    label: 'Your photo',
    background: ['#0A0E1A', '#0A0E1A'],
    ownBubble: ['#9B6FF6', '#7C3AED'],
    otherBubble: 'rgba(15,15,25,0.70)',
    ownText: '#FFFFFF',
    otherText: '#F1F5F9',
    thumbnail: '#0A0E1A',
    imageUrl,
    dim,
  };
}

/** Per-conversation row (conversation_themes) -> render theme. null = default look. */
export function themeFromRow(row?: { theme_id: string; custom_url?: string | null; dim?: number | null } | null): ChatTheme | null {
  if (!row) return null;
  if (row.theme_id === 'custom') return row.custom_url ? buildCustomTheme(row.custom_url, row.dim ?? 25) : null;
  return getChatTheme(row.theme_id);
}
