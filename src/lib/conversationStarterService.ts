const SIGN_STARTERS: Record<string, string[]> = {
  Aries: [
    "What's your most adventurous story?",
    "If you could start any project right now, what would it be?",
    "What gets you fired up the most?",
  ],
  Taurus: [
    "What's your favorite comfort food?",
    "What does your ideal relaxing day look like?",
    "What's the most beautiful place you've visited?",
  ],
  Gemini: [
    "What's the most interesting thing you've learned recently?",
    "If you could have dinner with anyone, who would it be?",
    "What's your favorite podcast or book right now?",
  ],
  Cancer: [
    "What's your favorite childhood memory?",
    "What makes you feel most at home?",
    "Who in your life inspires you the most?",
  ],
  Leo: [
    "What are you most proud of?",
    "What's your dream creative project?",
    "If you could be famous for one thing, what would it be?",
  ],
  Virgo: [
    "What's the most useful skill you've learned?",
    "What's your morning routine like?",
    "What detail do most people miss that you always notice?",
  ],
  Libra: [
    "What's the best piece of advice you've received?",
    "If you could redesign anything in the world, what would it be?",
    "What's your idea of a perfect evening?",
  ],
  Scorpio: [
    "What's something most people don't know about you?",
    "What's the most transformative experience you've had?",
    "What are you passionate about that surprises people?",
  ],
  Sagittarius: [
    "Where's the next place you want to travel?",
    "What's the most spontaneous thing you've ever done?",
    "What philosophy or belief guides your life?",
  ],
  Capricorn: [
    "What's the biggest goal you're working toward?",
    "What achievement are you most proud of?",
    "What motivates you to keep going on tough days?",
  ],
  Aquarius: [
    "What cause are you most passionate about?",
    "If you could change one thing about society, what would it be?",
    "What's the most unconventional thing about you?",
  ],
  Pisces: [
    "What's the most vivid dream you remember?",
    "What music or art moves you the most?",
    "What's your intuition telling you right now?",
  ],
};

const GENERIC_STARTERS = [
  "What's your rising sign? I'm curious!",
  "Have you checked your transit chart today?",
  "What drew you to astrology?",
  "Do you relate more to your sun or moon sign?",
  "What's the most accurate thing about your chart?",
];

export function getConversationStarters(otherSunSign?: string | null): string[] {
  const signStarters = otherSunSign && SIGN_STARTERS[otherSunSign]
    ? [...SIGN_STARTERS[otherSunSign]]
    : [];

  for (let i = signStarters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [signStarters[i], signStarters[j]] = [signStarters[j], signStarters[i]];
  }

  const result: string[] = [];
  if (signStarters.length >= 2) {
    result.push(signStarters[0], signStarters[1]);
  } else if (signStarters.length === 1) {
    result.push(signStarters[0]);
  }

  const shuffledGeneric = [...GENERIC_STARTERS].sort(() => Math.random() - 0.5);
  while (result.length < 3 && shuffledGeneric.length > 0) {
    result.push(shuffledGeneric.shift()!);
  }

  return result;
}
