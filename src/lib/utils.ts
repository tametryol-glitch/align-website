import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function getZodiacGlyph(sign: string): string {
  const glyphs: Record<string, string> = {
    aries: '♈', taurus: '♉', gemini: '♊',
    cancer: '♋', leo: '♌', virgo: '♍',
    libra: '♎', scorpio: '♏', sagittarius: '♐',
    capricorn: '♑', aquarius: '♒', pisces: '♓',
  };
  return glyphs[sign.toLowerCase()] || '';
}

export function getPlanetGlyph(planet: string): string {
  const glyphs: Record<string, string> = {
    sun: '☉', moon: '☽', mercury: '☿',
    venus: '♀', mars: '♂', jupiter: '♃',
    saturn: '♄', uranus: '♅', neptune: '♆',
    pluto: '♇', vesta: '⚶', juno: '⚵',
    'north node': '☊', 'south node': '☋',
    ascendant: 'AC', mc: 'MC',
  };
  return glyphs[planet.toLowerCase()] || '';
}
