import type { ZodiacSign } from './types';

export const ZODIAC_SIGNS: ZodiacSign[] = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

export const SIGN_ELEMENTS: Record<ZodiacSign, 'fire' | 'earth' | 'air' | 'water'> = {
  Aries: 'fire',
  Taurus: 'earth',
  Gemini: 'air',
  Cancer: 'water',
  Leo: 'fire',
  Virgo: 'earth',
  Libra: 'air',
  Scorpio: 'water',
  Sagittarius: 'fire',
  Capricorn: 'earth',
  Aquarius: 'air',
  Pisces: 'water',
};

export const SIGN_TRAITS: Record<ZodiacSign, {
  bodyLanguage: string;
  giftTone: string;
  woundTone: string;
  names: string[];
}> = {
  Aries: {
    bodyLanguage: 'moves like a struck match, direct, bright-eyed, impossible to slow once the blood rises',
    giftTone: 'courage that acts before permission arrives',
    woundTone: 'the terror of being trapped, weakened, or forced to wait',
    names: ['Ari', 'Kael', 'Riven', 'Sera'],
  },
  Taurus: {
    bodyLanguage: 'still, grounded, sensuous, with a gaze that makes the room lower its voice',
    giftTone: 'the power to make safety, beauty, and value last',
    woundTone: 'the fear that peace will be taken unless everything is held tightly',
    names: ['Talia', 'Bram', 'Mira', 'Orin'],
  },
  Gemini: {
    bodyLanguage: 'quick hands, quick eyes, always listening for the unsaid second meaning',
    giftTone: 'language, trade, mimicry, and the key hidden inside a question',
    woundTone: 'the fear of being cornered by one truth, one choice, one name',
    names: ['Niko', 'Lys', 'Veda', 'Caro'],
  },
  Cancer: {
    bodyLanguage: 'protective, moon-soft, reading the emotional weather before speaking',
    giftTone: 'memory, care, belonging, and the instinct to guard what is tender',
    woundTone: 'the old ache of being left outside the door of love',
    names: ['Maren', 'Carys', 'Noa', 'Ilan'],
  },
  Leo: {
    bodyLanguage: 'warm, regal, expressive, carrying an inner sun even when afraid',
    giftTone: 'creative fire that gives others permission to live loudly',
    woundTone: 'the fear that invisibility is the same as death',
    names: ['Leon', 'Aurea', 'Solan', 'Rhea'],
  },
  Virgo: {
    bodyLanguage: 'precise, observant, composed, noticing the fracture before anyone names the break',
    giftTone: 'sacred usefulness, pattern repair, skill, and healing through craft',
    woundTone: 'the shame of never being clean, ready, perfect, or enough',
    names: ['Vera', 'Elias', 'Mina', 'Tal'],
  },
  Libra: {
    bodyLanguage: 'graceful, watchful, disarming, weighing every room for danger and desire',
    giftTone: 'the art of alliance, beauty, diplomacy, and chosen vows',
    woundTone: 'the fear that choosing the self will make love disappear',
    names: ['Liora', 'Cassian', 'Nera', 'Vale'],
  },
  Scorpio: {
    bodyLanguage: 'quiet, magnetic, unreadable, as if carrying a candle through a locked underworld',
    giftTone: 'survival intelligence, psychic instinct, passion, and truth beneath the mask',
    woundTone: 'the fear that trust is how the knife gets close',
    names: ['Sorin', 'Nyx', 'Mara', 'Kade'],
  },
  Sagittarius: {
    bodyLanguage: 'restless, horizon-hungry, speaking as if the road is already calling',
    giftTone: 'faith, prophecy, travel, humor, and the courage to seek a larger sky',
    woundTone: 'the fear that staying will turn the soul into a cage',
    names: ['Sage', 'Rohan', 'Tavi', 'Iris'],
  },
  Capricorn: {
    bodyLanguage: 'controlled, capable, old before their time, built from vows nobody saw them make',
    giftTone: 'endurance, mastery, authority, and the long climb through winter',
    woundTone: 'the fear that tenderness will cost respect, safety, or power',
    names: ['Cora', 'Darian', 'Merek', 'Anya'],
  },
  Aquarius: {
    bodyLanguage: 'distant but electric, already hearing tomorrow in the machinery of today',
    giftTone: 'liberation, invention, strange friendship, and the future arriving early',
    woundTone: 'the exile of being right before the village is ready',
    names: ['Astra', 'Ren', 'Ione', 'Zev'],
  },
  Pisces: {
    bodyLanguage: 'soft, porous, dream-lit, moving as if the veil is thinner around them',
    giftTone: 'mysticism, compassion, music, dreams, and mercy for the lost',
    woundTone: 'the fear of having no edge where the world can stop entering',
    names: ['Phaedra', 'Isle', 'Lumen', 'Noor'],
  },
};

export function normalizeSign(value: unknown, fallback: ZodiacSign = 'Taurus'): ZodiacSign {
  if (typeof value !== 'string') return fallback;
  const found = ZODIAC_SIGNS.find((sign) => sign.toLowerCase() === value.trim().toLowerCase());
  return found ?? fallback;
}

export function signFromLongitude(longitude: number, fallback: ZodiacSign = 'Taurus'): ZodiacSign {
  if (!Number.isFinite(longitude)) return fallback;
  const index = Math.floor((((longitude % 360) + 360) % 360) / 30) % 12;
  return ZODIAC_SIGNS[index] ?? fallback;
}

export function oppositeSign(sign: ZodiacSign): ZodiacSign {
  const index = ZODIAC_SIGNS.indexOf(sign);
  return ZODIAC_SIGNS[(index + 6) % 12];
}

export function signSeed(sign: ZodiacSign): number {
  return ZODIAC_SIGNS.indexOf(sign) + 1;
}
