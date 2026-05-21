import { createClient } from '@/lib/supabase';

export interface Icebreaker {
  text: string;
  category: 'emotional' | 'intellectual' | 'playful' | 'deep' | 'cosmic';
}

const ELEMENT: Record<string, string> = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water',
};

const MODALITY: Record<string, string> = {
  Aries: 'cardinal', Cancer: 'cardinal', Libra: 'cardinal', Capricorn: 'cardinal',
  Taurus: 'fixed', Leo: 'fixed', Scorpio: 'fixed', Aquarius: 'fixed',
  Gemini: 'mutable', Virgo: 'mutable', Sagittarius: 'mutable', Pisces: 'mutable',
};

const ELEMENT_ICEBREAKERS: Record<string, Icebreaker[]> = {
  'fire-fire': [
    { text: 'You both have fire signs — what\'s the most spontaneous thing you\'ve ever done?', category: 'playful' },
    { text: 'Two fire signs walk into a bar… who orders first? 🔥', category: 'playful' },
    { text: 'With all this fire energy, where would you travel tomorrow if money were no object?', category: 'intellectual' },
  ],
  'earth-earth': [
    { text: 'Fellow earth sign energy — what\'s your idea of a perfect cozy evening?', category: 'emotional' },
    { text: 'Earth signs appreciate the finer things. What\'s your favorite comfort food?', category: 'playful' },
    { text: 'What\'s something you\'ve been building or working toward lately?', category: 'deep' },
  ],
  'air-air': [
    { text: 'Two air signs = endless conversation. What topic could you talk about for hours?', category: 'intellectual' },
    { text: 'Air signs love ideas. What\'s the most interesting thing you learned this week?', category: 'intellectual' },
    { text: 'If you could have dinner with any thinker, living or dead, who would it be?', category: 'deep' },
  ],
  'water-water': [
    { text: 'Water sign meets water sign — do you trust your intuition, or overthink everything?', category: 'emotional' },
    { text: 'We both feel things deeply. What\'s a song that always hits you right in the feels?', category: 'emotional' },
    { text: 'What does emotional safety look like to you?', category: 'deep' },
  ],
  'fire-air': [
    { text: 'Fire and air = sparks fly! What gets you most excited about meeting someone new?', category: 'playful' },
    { text: 'Your air fuels my fire (astrologically speaking 😄). What inspires you most?', category: 'cosmic' },
    { text: 'Adventure or deep conversation first?', category: 'playful' },
  ],
  'earth-water': [
    { text: 'Earth and water make things grow. What\'s growing in your life right now?', category: 'deep' },
    { text: 'Our elements are naturally nurturing together. What do you value most in a connection?', category: 'emotional' },
    { text: 'Cozy night in or sunset walk?', category: 'playful' },
  ],
  'fire-earth': [
    { text: 'Fire meets earth — passion meets stability. What balance are you seeking?', category: 'deep' },
    { text: 'I bring the spark, you bring the grounding. What\'s your love language?', category: 'emotional' },
    { text: 'Mountains or beaches?', category: 'playful' },
  ],
  'fire-water': [
    { text: 'Fire and water — steam! 💨 What\'s something that surprised you about yourself recently?', category: 'deep' },
    { text: 'Our elements challenge each other in the best way. Bold or gentle first date?', category: 'playful' },
    { text: 'What emotion drives you most — passion or intuition?', category: 'cosmic' },
  ],
  'earth-air': [
    { text: 'Earth meets air — grounded dreamer energy. What dream are you working toward?', category: 'deep' },
    { text: 'I plan it, you dream it — or the other way around?', category: 'playful' },
    { text: 'What\'s something practical that also feels magical to you?', category: 'cosmic' },
  ],
  'air-water': [
    { text: 'Air and water — thoughts meet feelings. Do you lead with your head or heart?', category: 'emotional' },
    { text: 'Our elements create mist and mystery. What\'s something most people don\'t know about you?', category: 'deep' },
    { text: 'Deep conversation by the ocean or stargazing and silence?', category: 'playful' },
  ],
};

const SAME_SIGN_ICEBREAKERS: Icebreaker[] = [
  { text: 'We share the same Sun sign! Do you feel like a "typical" one, or the exception?', category: 'cosmic' },
  { text: 'Same sign energy — we probably understand each other on a level that\'s hard to explain. What\'s your hot take on our sign?', category: 'playful' },
  { text: 'Mirror, mirror… what do you think we have most in common?', category: 'deep' },
];

const MOON_SIGN_ICEBREAKERS: Icebreaker[] = [
  { text: 'Our Moon signs say a lot about how we process feelings. What recharges you emotionally?', category: 'emotional' },
  { text: 'What does your ideal "me time" look like?', category: 'emotional' },
];

const GENERIC_ICEBREAKERS: Icebreaker[] = [
  { text: 'The stars brought us here — what\'s something you\'re genuinely curious about right now?', category: 'cosmic' },
  { text: 'If your life had a theme song this week, what would it be?', category: 'playful' },
  { text: 'What\'s one thing you wish people asked you about more?', category: 'deep' },
];

function getElementPairKey(elA: string, elB: string): string {
  const sorted = [elA, elB].sort();
  return sorted.join('-');
}

export function generateIcebreakers(
  profileA: { sun_sign?: string | null; moon_sign?: string | null },
  profileB: { sun_sign?: string | null; moon_sign?: string | null },
  count: number = 3,
): Icebreaker[] {
  const results: Icebreaker[] = [];

  if (profileA.sun_sign && profileB.sun_sign && profileA.sun_sign === profileB.sun_sign) {
    results.push(SAME_SIGN_ICEBREAKERS[Math.floor(Math.random() * SAME_SIGN_ICEBREAKERS.length)]);
  }

  const elA = profileA.sun_sign ? ELEMENT[profileA.sun_sign] : null;
  const elB = profileB.sun_sign ? ELEMENT[profileB.sun_sign] : null;

  if (elA && elB) {
    const key = getElementPairKey(elA, elB);
    const pool = ELEMENT_ICEBREAKERS[key] || [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    for (const ib of shuffled) {
      if (results.length >= count) break;
      if (!results.find(r => r.text === ib.text)) results.push(ib);
    }
  }

  if (profileA.moon_sign && profileB.moon_sign && results.length < count) {
    results.push(MOON_SIGN_ICEBREAKERS[Math.floor(Math.random() * MOON_SIGN_ICEBREAKERS.length)]);
  }

  while (results.length < count) {
    const pick = GENERIC_ICEBREAKERS[Math.floor(Math.random() * GENERIC_ICEBREAKERS.length)];
    if (!results.find(r => r.text === pick.text)) results.push(pick);
    if (results.length >= GENERIC_ICEBREAKERS.length + MOON_SIGN_ICEBREAKERS.length) break;
  }

  return results.slice(0, count);
}

export async function getIcebreakersForMatch(
  userId: string,
  matchId: string,
): Promise<Icebreaker[]> {
  try {
    const supabase = createClient();

    const { data: match } = await supabase
      .from('dating_matches')
      .select('user_a_id, user_b_id, icebreakers')
      .eq('id', matchId)
      .single();

    if (!match) return [];

    if (match.icebreakers && Array.isArray(match.icebreakers) && match.icebreakers.length > 0) {
      return match.icebreakers as Icebreaker[];
    }

    const partnerId = match.user_a_id === userId ? match.user_b_id : match.user_a_id;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, sun_sign, moon_sign')
      .in('id', [userId, partnerId]);

    if (!profiles || profiles.length < 2) return GENERIC_ICEBREAKERS.slice(0, 3);

    const myProfile = profiles.find((p: any) => p.id === userId);
    const partnerProfile = profiles.find((p: any) => p.id === partnerId);

    const icebreakers = generateIcebreakers(myProfile || {}, partnerProfile || {}, 3);

    await supabase
      .from('dating_matches')
      .update({ icebreakers })
      .eq('id', matchId);

    return icebreakers;
  } catch {
    return GENERIC_ICEBREAKERS.slice(0, 3);
  }
}
