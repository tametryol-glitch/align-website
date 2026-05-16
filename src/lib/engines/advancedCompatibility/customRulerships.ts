// ═══════════════════════════════════════════════════════════════════
// Custom Planetary Rulership System for Align
// Non-traditional: Virgo=Vesta, Libra=Juno (not Mercury/Venus)
// ═══════════════════════════════════════════════════════════════════

export const CUSTOM_SIGN_RULERS: Record<string, string> = {
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

export const SIGN_FOR_LONGITUDE: (lon: number) => string = (lon) => {
  const signs = [
    'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
    'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
  ];
  const idx = Math.floor((((lon % 360) + 360) % 360) / 30);
  return signs[idx];
};

export function getRulerOf(sign: string): string {
  return CUSTOM_SIGN_RULERS[sign] || 'Sun';
}

export function getSignsRuledBy(planet: string): string[] {
  return Object.entries(CUSTOM_SIGN_RULERS)
    .filter(([, ruler]) => ruler === planet)
    .map(([sign]) => sign);
}

// Check if a planet is in mutual reception (each in the other's sign)
export function isMutualReception(
  planet1: string, planet1Lon: number,
  planet2: string, planet2Lon: number,
): boolean {
  const sign1 = SIGN_FOR_LONGITUDE(planet1Lon);
  const sign2 = SIGN_FOR_LONGITUDE(planet2Lon);
  const ruler1 = getRulerOf(sign1);
  const ruler2 = getRulerOf(sign2);
  return ruler1 === planet2 && ruler2 === planet1;
}

// Check if planet is in dignity (in sign it rules)
export function isInDignity(planet: string, lon: number): boolean {
  const sign = SIGN_FOR_LONGITUDE(lon);
  return getRulerOf(sign) === planet;
}

// Check if planet is in detriment (opposite sign it rules)
const OPPOSITE_SIGNS: Record<string, string> = {
  Aries: 'Libra', Taurus: 'Scorpio', Gemini: 'Sagittarius',
  Cancer: 'Capricorn', Leo: 'Aquarius', Virgo: 'Pisces',
  Libra: 'Aries', Scorpio: 'Taurus', Sagittarius: 'Gemini',
  Capricorn: 'Cancer', Aquarius: 'Leo', Pisces: 'Virgo',
};

export function isInDetriment(planet: string, lon: number): boolean {
  const sign = SIGN_FOR_LONGITUDE(lon);
  const ruledSigns = getSignsRuledBy(planet);
  return ruledSigns.some(s => OPPOSITE_SIGNS[s] === sign);
}
