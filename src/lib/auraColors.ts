/**
 * Aura Mirror — Color definitions, chakra mappings, and planet associations.
 *
 * Central config for aura color meanings, hex values, chakra correlations,
 * and the custom Align rulership system.
 */

import type { AuraColorName, ChakraName, MoodOption, LifeAreaOption } from '@/types/aura';

// ── Aura Color Definitions ──────────────────────────────────────────

export interface AuraColorDef {
  name: AuraColorName;
  hex: string;
  hexGlow: string;       // lighter version for glow effects
  label: string;
  keywords: string[];
  meaning: string;
  chakra: ChakraName;
  planets: string[];      // planets that can trigger this color
}

export const AURA_COLORS: Record<AuraColorName, AuraColorDef> = {
  red: {
    name: 'red',
    hex: '#E53E3E',
    hexGlow: '#FC8181',
    label: 'Red',
    keywords: ['passion', 'anger', 'survival', 'courage', 'urgency', 'sexuality', 'life force'],
    meaning: 'Passion, anger, survival, courage, urgency, sexuality, life force.',
    chakra: 'root',
    planets: ['Mars', 'Pluto'],
  },
  orange: {
    name: 'orange',
    hex: '#ED8936',
    hexGlow: '#FBD38D',
    label: 'Orange',
    keywords: ['creativity', 'desire', 'attraction', 'pleasure', 'emotional movement', 'social magnetism'],
    meaning: 'Creativity, desire, attraction, pleasure, emotional movement, social magnetism.',
    chakra: 'sacral',
    planets: ['Venus', 'Mars'],
  },
  yellow: {
    name: 'yellow',
    hex: '#ECC94B',
    hexGlow: '#FEFCBF',
    label: 'Yellow',
    keywords: ['confidence', 'intellect', 'identity', 'nervous energy', 'visibility', 'overthinking'],
    meaning: 'Confidence, intellect, identity, nervous energy, visibility, overthinking.',
    chakra: 'solar_plexus',
    planets: ['Sun', 'Mercury'],
  },
  green: {
    name: 'green',
    hex: '#48BB78',
    hexGlow: '#9AE6B4',
    label: 'Green',
    keywords: ['healing', 'love', 'money', 'growth', 'forgiveness', 'emotional balance'],
    meaning: 'Healing, love, money, growth, forgiveness, emotional balance.',
    chakra: 'heart',
    planets: ['Venus', 'Jupiter'],
  },
  blue: {
    name: 'blue',
    hex: '#4299E1',
    hexGlow: '#90CDF4',
    label: 'Blue',
    keywords: ['truth', 'communication', 'calm', 'sadness', 'emotional intelligence', 'emotional restraint'],
    meaning: 'Truth, communication, calm, sadness, emotional intelligence, emotional restraint.',
    chakra: 'throat',
    planets: ['Mercury', 'Saturn'],
  },
  indigo: {
    name: 'indigo',
    hex: '#667EEA',
    hexGlow: '#A3BFFA',
    label: 'Indigo',
    keywords: ['intuition', 'dreams', 'psychic sensitivity', 'symbols', 'perception', 'deep knowing'],
    meaning: 'Intuition, dreams, psychic sensitivity, symbols, perception, deep knowing.',
    chakra: 'third_eye',
    planets: ['Neptune', 'Moon'],
  },
  violet: {
    name: 'violet',
    hex: '#9F7AEA',
    hexGlow: '#D6BCFA',
    label: 'Violet',
    keywords: ['spiritual awakening', 'transformation', 'mysticism', 'higher calling', 'soul activation'],
    meaning: 'Spiritual awakening, transformation, mysticism, higher calling, soul activation.',
    chakra: 'crown',
    planets: ['Neptune', 'Pluto', 'Uranus'],
  },
  white: {
    name: 'white',
    hex: '#F7FAFC',
    hexGlow: '#FFFFFF',
    label: 'White',
    keywords: ['purification', 'reset', 'protection', 'clarity', 'spiritual cleansing'],
    meaning: 'Purification, reset, protection, clarity, spiritual cleansing.',
    chakra: 'crown',
    planets: ['Moon', 'Neptune'],
  },
  gold: {
    name: 'gold',
    hex: '#D69E2E',
    hexGlow: '#F6E05E',
    label: 'Gold',
    keywords: ['success', 'purpose', 'leadership', 'divine confidence', 'public visibility'],
    meaning: 'Success, purpose, leadership, divine confidence, public visibility.',
    chakra: 'solar_plexus',
    planets: ['Sun', 'Jupiter'],
  },
  pink: {
    name: 'pink',
    hex: '#ED64A6',
    hexGlow: '#FBB6CE',
    label: 'Pink',
    keywords: ['romance', 'tenderness', 'sweetness', 'affection', 'vulnerability'],
    meaning: 'Romance, tenderness, sweetness, affection, vulnerability.',
    chakra: 'heart',
    planets: ['Venus', 'Moon'],
  },
  gray: {
    name: 'gray',
    hex: '#A0AEC0',
    hexGlow: '#CBD5E0',
    label: 'Gray',
    keywords: ['stress', 'uncertainty', 'fog', 'heaviness', 'transition', 'mental overload'],
    meaning: 'Stress, uncertainty, fog, heaviness, transition, mental overload.',
    chakra: 'third_eye',
    planets: ['Saturn', 'Neptune'],
  },
  black: {
    name: 'black',
    hex: '#2D3748',
    hexGlow: '#4A5568',
    label: 'Dark / Shadow',
    keywords: ['protection', 'shadow work', 'grief', 'depth', 'transformation', 'energetic defense'],
    meaning: 'Protection, shadow work, grief, depth, transformation, energetic defense.',
    chakra: 'root',
    planets: ['Pluto', 'Saturn'],
  },
};

// ── Custom Align Rulership System ───────────────────────────────────

export const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Vesta',
  Libra: 'Juno',
  Scorpio: 'Pluto',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Uranus',
  Pisces: 'Neptune',
};

// ── Planet → Aura Color Primary Association ─────────────────────────

export const PLANET_AURA_COLORS: Record<string, AuraColorName> = {
  Sun: 'gold',
  Moon: 'indigo',
  Mercury: 'yellow',
  Venus: 'pink',
  Mars: 'red',
  Jupiter: 'green',
  Saturn: 'gray',
  Uranus: 'violet',
  Neptune: 'indigo',
  Pluto: 'black',
  Vesta: 'orange',
  Juno: 'pink',
  'North Node': 'gold',
  'South Node': 'violet',
};

// ── Mood → Aura Color Mapping ───────────────────────────────────────

export const MOOD_AURA_COLORS: Record<MoodOption, AuraColorName> = {
  calm: 'blue',
  heavy: 'gray',
  excited: 'orange',
  anxious: 'yellow',
  drained: 'gray',
  romantic: 'pink',
  angry: 'red',
  confused: 'indigo',
  inspired: 'gold',
  lonely: 'blue',
  powerful: 'red',
  spiritually_sensitive: 'violet',
  unknown: 'white',
};

// ── Life Area → Aura Color Mapping ──────────────────────────────────

export const LIFE_AREA_AURA_COLORS: Record<LifeAreaOption, AuraColorName> = {
  love: 'pink',
  money: 'green',
  family: 'green',
  career: 'gold',
  body: 'red',
  friendships: 'orange',
  spirituality: 'violet',
  purpose: 'gold',
  anxiety: 'yellow',
  sexual_energy: 'red',
  creativity: 'orange',
  grief: 'black',
  confidence: 'gold',
};

// ── Chakra Definitions ──────────────────────────────────────────────

export interface ChakraDef {
  name: ChakraName;
  label: string;
  color: string;
  bodyArea: string;
  themes: string[];
}

export const CHAKRA_DEFS: Record<ChakraName, ChakraDef> = {
  root: {
    name: 'root',
    label: 'Root Chakra',
    color: '#E53E3E',
    bodyArea: 'base of spine',
    themes: ['survival', 'safety', 'grounding', 'stability', 'physical body'],
  },
  sacral: {
    name: 'sacral',
    label: 'Sacral Chakra',
    color: '#ED8936',
    bodyArea: 'lower abdomen',
    themes: ['creativity', 'pleasure', 'sexuality', 'emotions', 'desire'],
  },
  solar_plexus: {
    name: 'solar_plexus',
    label: 'Solar Plexus Chakra',
    color: '#ECC94B',
    bodyArea: 'stomach',
    themes: ['power', 'confidence', 'identity', 'willpower', 'self-esteem'],
  },
  heart: {
    name: 'heart',
    label: 'Heart Chakra',
    color: '#48BB78',
    bodyArea: 'chest',
    themes: ['love', 'compassion', 'healing', 'forgiveness', 'connection'],
  },
  throat: {
    name: 'throat',
    label: 'Throat Chakra',
    color: '#4299E1',
    bodyArea: 'throat',
    themes: ['communication', 'truth', 'expression', 'authenticity', 'voice'],
  },
  third_eye: {
    name: 'third_eye',
    label: 'Third Eye Chakra',
    color: '#667EEA',
    bodyArea: 'forehead',
    themes: ['intuition', 'vision', 'perception', 'dreams', 'insight'],
  },
  crown: {
    name: 'crown',
    label: 'Crown Chakra',
    color: '#9F7AEA',
    bodyArea: 'top of head',
    themes: ['spirituality', 'consciousness', 'divine connection', 'purpose', 'transcendence'],
  },
};

// ── Mood Display Config ─────────────────────────────────────────────

export const MOOD_OPTIONS: { key: MoodOption; label: string; emoji: string }[] = [
  { key: 'calm', label: 'Calm', emoji: '😌' },
  { key: 'heavy', label: 'Heavy', emoji: '😔' },
  { key: 'excited', label: 'Excited', emoji: '🤩' },
  { key: 'anxious', label: 'Anxious', emoji: '😰' },
  { key: 'drained', label: 'Drained', emoji: '😩' },
  { key: 'romantic', label: 'Romantic', emoji: '🥰' },
  { key: 'angry', label: 'Angry', emoji: '😤' },
  { key: 'confused', label: 'Confused', emoji: '😵‍💫' },
  { key: 'inspired', label: 'Inspired', emoji: '✨' },
  { key: 'lonely', label: 'Lonely', emoji: '🥺' },
  { key: 'powerful', label: 'Powerful', emoji: '💪' },
  { key: 'spiritually_sensitive', label: 'Spiritually Sensitive', emoji: '🔮' },
  { key: 'unknown', label: 'I Don\'t Know', emoji: '🤷' },
];

export const LIFE_AREA_OPTIONS: { key: LifeAreaOption; label: string; emoji: string }[] = [
  { key: 'love', label: 'Love', emoji: '❤️' },
  { key: 'money', label: 'Money', emoji: '💰' },
  { key: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { key: 'career', label: 'Career', emoji: '💼' },
  { key: 'body', label: 'Body', emoji: '🏋️' },
  { key: 'friendships', label: 'Friendships', emoji: '👯' },
  { key: 'spirituality', label: 'Spirituality', emoji: '🧘' },
  { key: 'purpose', label: 'Purpose', emoji: '🎯' },
  { key: 'anxiety', label: 'Anxiety', emoji: '😟' },
  { key: 'sexual_energy', label: 'Sexual Energy', emoji: '🔥' },
  { key: 'creativity', label: 'Creativity', emoji: '🎨' },
  { key: 'grief', label: 'Grief', emoji: '🖤' },
  { key: 'confidence', label: 'Confidence', emoji: '👑' },
];

// ── Aura Disclaimer ─────────────────────────────────────────────────

export const AURA_DISCLAIMER =
  'Aura Mirror is a symbolic self-reflection tool. It uses your photo, video, voice, mood check-in, birth chart, and current cosmic patterns to create an energetic portrait. It is not a medical, psychological, or diagnostic tool.';
