/**
 * Cosmic Studio — Style system.
 *
 * The "Style" layer is decoupled from the content (what the video is about).
 * A Style is a complete visual look: palette + typography + motion language.
 * The same content rendered in different Styles looks meaningfully different,
 * which is how variety scales without adding more rigid templates.
 *
 * These tokens are the single source of truth for BOTH the in-browser live
 * preview (@remotion/player) and — once adopted — the server renderer, so the
 * preview and the final file converge on the same design.
 */

export type StyleId = 'ethereal' | 'aurora' | 'editorial' | 'mystic' | 'minimal';

export interface CosmicStyle {
  id: StyleId;
  name: string;
  /** one-line vibe shown in the picker */
  vibe: string;
  /** scene background: two stops (top → bottom) */
  bg: [string, string];
  /** primary accent (rings, highlights, key lines) */
  accent: string;
  /** secondary accent */
  accent2: string;
  /** headline text color */
  text: string;
  /** muted/sub text color */
  subtext: string;
  /** hairline / structural lines */
  line: string;
  /** headline font stack */
  headingFont: string;
  /** body font stack */
  bodyFont: string;
  /** uppercase the small labels? (editorial/minimal looks) */
  uppercaseLabels: boolean;
  /** motion intensity 0..1 — drives animation amplitude/particles */
  motion: number;
}

const SERIF = 'Georgia, "Times New Roman", serif';
const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const COSMIC_STYLES: Record<StyleId, CosmicStyle> = {
  ethereal: {
    id: 'ethereal',
    name: 'Ethereal',
    vibe: 'Soft cosmic purple, dreamy and luminous',
    bg: ['#2A2256', '#0D0A24'],
    accent: '#C4B5FD',
    accent2: '#A78BFA',
    text: '#F5F3FF',
    subtext: '#C4B5FD',
    line: '#6D5DD3',
    headingFont: SANS,
    bodyFont: SANS,
    uppercaseLabels: false,
    motion: 0.7,
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    vibe: 'Teal and emerald, calm and clean',
    bg: ['#06403A', '#04211F'],
    accent: '#5EEAD4',
    accent2: '#34D399',
    text: '#ECFDF5',
    subtext: '#99F6E4',
    line: '#0E7C6B',
    headingFont: SANS,
    bodyFont: SANS,
    uppercaseLabels: false,
    motion: 0.55,
  },
  editorial: {
    id: 'editorial',
    name: 'Editorial',
    vibe: 'Obsidian and gold, magazine restraint',
    bg: ['#1A1714', '#0B0A09'],
    accent: '#E5B567',
    accent2: '#C99A3F',
    text: '#FBF7EF',
    subtext: '#C9BFA9',
    line: '#4A4135',
    headingFont: SERIF,
    bodyFont: SANS,
    uppercaseLabels: true,
    motion: 0.3,
  },
  mystic: {
    id: 'mystic',
    name: 'Mystic',
    vibe: 'Rose and plum, intimate and romantic',
    bg: ['#3A0F2E', '#160814'],
    accent: '#F9A8D4',
    accent2: '#E879A6',
    text: '#FDF2F8',
    subtext: '#F9A8D4',
    line: '#9D3A6B',
    headingFont: SERIF,
    bodyFont: SANS,
    uppercaseLabels: false,
    motion: 0.6,
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    vibe: 'Near-monochrome, lots of quiet space',
    bg: ['#111113', '#040405'],
    accent: '#E8E8EA',
    accent2: '#A9A9AE',
    text: '#FAFAFA',
    subtext: '#A9A9AE',
    line: '#3A3A3E',
    headingFont: SANS,
    bodyFont: SANS,
    uppercaseLabels: true,
    motion: 0.35,
  },
};

export const STYLE_LIST: CosmicStyle[] = Object.values(COSMIC_STYLES);

export function getStyle(id?: string | null): CosmicStyle {
  return (id && COSMIC_STYLES[id as StyleId]) || COSMIC_STYLES.ethereal;
}
