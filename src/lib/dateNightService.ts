export interface DateSuggestion {
  id: string;
  title: string;
  description: string;
  category: 'adventure' | 'culture' | 'nature' | 'food' | 'creative' | 'intimate';
  elementMatch: string;
  icon: string;
}

const ELEMENT: Record<string, string> = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water',
};

const ELEMENT_DATES: Record<string, DateSuggestion[]> = {
  fire: [
    { id: 'f1', title: 'Live Music Night', description: 'Feed your fire with live energy — find a local concert or open mic.', category: 'adventure', elementMatch: 'fire', icon: '🎸' },
    { id: 'f2', title: 'Adventure Date', description: 'Rock climbing, go-karts, or an escape room — fire signs thrive on adrenaline.', category: 'adventure', elementMatch: 'fire', icon: '🧗' },
    { id: 'f3', title: 'Rooftop Cocktails', description: 'A view from above suits the fire sign desire for grandeur.', category: 'food', elementMatch: 'fire', icon: '🍸' },
    { id: 'f4', title: 'Sunset Hike', description: 'Combine movement with a dramatic sky for the perfect fire date.', category: 'nature', elementMatch: 'fire', icon: '🌅' },
  ],
  earth: [
    { id: 'e1', title: 'Farm-to-Table Dinner', description: 'Earth signs love quality — a seasonal tasting menu speaks their language.', category: 'food', elementMatch: 'earth', icon: '🍽️' },
    { id: 'e2', title: 'Farmers Market Stroll', description: 'Slow morning, artisan finds, and fresh produce.', category: 'nature', elementMatch: 'earth', icon: '🥖' },
    { id: 'e3', title: 'Pottery Class', description: 'Create something tangible together — very earth element.', category: 'creative', elementMatch: 'earth', icon: '🏺' },
    { id: 'e4', title: 'Wine Tasting', description: 'Sensory indulgence that grounded signs adore.', category: 'food', elementMatch: 'earth', icon: '🍷' },
  ],
  air: [
    { id: 'a1', title: 'Museum + Deep Talk', description: 'Art prompts conversation — air signs need mental stimulation.', category: 'culture', elementMatch: 'air', icon: '🎨' },
    { id: 'a2', title: 'Bookstore Date', description: 'Browse, swap picks, read a chapter over coffee.', category: 'culture', elementMatch: 'air', icon: '📚' },
    { id: 'a3', title: 'Comedy Show', description: 'Shared laughter creates the lightness air signs crave.', category: 'adventure', elementMatch: 'air', icon: '😂' },
    { id: 'a4', title: 'Trivia Night', description: 'Friendly competition + knowledge — an air sign dream.', category: 'culture', elementMatch: 'air', icon: '🧠' },
  ],
  water: [
    { id: 'w1', title: 'Candlelit Dinner at Home', description: 'Intimate, private, emotionally safe — water sign paradise.', category: 'intimate', elementMatch: 'water', icon: '🕯️' },
    { id: 'w2', title: 'Beach Walk at Sunset', description: 'Water near water — the most natural element date.', category: 'nature', elementMatch: 'water', icon: '🌊' },
    { id: 'w3', title: 'Stargazing Picnic', description: 'Under the sky with someone who gets your depth.', category: 'intimate', elementMatch: 'water', icon: '🌌' },
    { id: 'w4', title: 'Spa & Self-Care Day', description: 'Nurturing shared experience for intuitive souls.', category: 'intimate', elementMatch: 'water', icon: '🧖' },
  ],
};

const MIXED_DATES: DateSuggestion[] = [
  { id: 'm1', title: 'Cooking Together', description: 'Create a meal from scratch — combining creativity and nurture.', category: 'creative', elementMatch: 'mixed', icon: '👩‍🍳' },
  { id: 'm2', title: 'Sunrise or Sunset Watch', description: 'Nature\'s show — simple, beautiful, and memorable.', category: 'nature', elementMatch: 'mixed', icon: '🌇' },
  { id: 'm3', title: 'Photo Walk', description: 'Explore a neighborhood together, capturing moments.', category: 'creative', elementMatch: 'mixed', icon: '📷' },
];

export function generateDateSuggestions(
  sunSignA: string | null,
  sunSignB: string | null,
  count: number = 4,
): DateSuggestion[] {
  const results: DateSuggestion[] = [];

  const elA = sunSignA ? ELEMENT[sunSignA] : null;
  const elB = sunSignB ? ELEMENT[sunSignB] : null;

  if (elA) {
    const pool = ELEMENT_DATES[elA] || [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    results.push(...shuffled.slice(0, 2));
  }

  if (elB && elB !== elA) {
    const pool = ELEMENT_DATES[elB] || [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    for (const s of shuffled) {
      if (results.length >= count) break;
      if (!results.find(r => r.id === s.id)) results.push(s);
    }
  }

  const shuffledMixed = [...MIXED_DATES].sort(() => Math.random() - 0.5);
  for (const s of shuffledMixed) {
    if (results.length >= count) break;
    if (!results.find(r => r.id === s.id)) results.push(s);
  }

  return results.slice(0, count);
}
