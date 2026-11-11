// Birthday post content: a short, solar-return based note for the year ahead.
// Pure functions (no I/O) so the cron and any client preview can share them.
import { YEAR_THEME_HEADLINES } from '@/lib/interpretations/solarReturnInterp';

export interface BirthdayAdvice {
  headline: string;
  emoji: string;
  keyword: string;
  advice: string; // what the year is about
  action: string; // one concrete move
  moon: string; // emotional note from the return Moon sign ('' if unknown)
}

// One concrete thing to do, per Solar Return Sun house.
const ACTION_BY_HOUSE: Record<number, string> = {
  1: 'Change one visible thing about how you show up, and do it before your next birthday month is over.',
  2: 'Name your price out loud this year, then ask for it once before you talk yourself out of it.',
  3: 'Say the thing you have been rehearsing. Send the message, book the class, start the conversation.',
  4: 'Fix one thing at home or with family that you keep calling "fine". Start with the smallest piece.',
  5: 'Put a date in your calendar every week for something you do only because you love it.',
  6: 'Pick one daily habit and protect it for 90 days. Your body is the first place the year shows up.',
  7: 'Decide on purpose who gets your time this year. Commit to the person who earns it, and let the rest go gently.',
  8: 'Let one thing end without trying to rescue it, and be honest about money you share with someone.',
  9: 'Book the trip, enrol in the course or take the big question to someone who has the answer.',
  10: 'Put your name on something public this year. Apply, pitch, post or step forward.',
  11: 'Tell the right people the dream out loud, and join one group that makes you feel like you belong.',
  12: 'Schedule real rest and keep a dream journal. The quiet weeks are doing the work.',
};

const MOON_BY_SIGN: Record<string, string> = {
  Aries: 'Your feelings move fast this year, so act on them while they are honest and apologise quickly if you overshoot.',
  Taurus: 'Your mood settles when your body is comfortable, so eat well, sleep well and keep your routine steady.',
  Gemini: 'Your mind is loud this year. Talking it through with someone you trust settles you faster than thinking.',
  Cancer: 'You feel everything more deeply this year, so protect your peace and spend time with people who feel like home.',
  Leo: 'You need to be seen and appreciated this year. Ask for it directly instead of hoping people notice.',
  Virgo: 'You will want to fix everything. Choose one thing, and let the rest be good enough.',
  Libra: 'Your calm depends on fair, balanced relationships this year, so say what you need before resentment builds.',
  Scorpio: 'Your emotions run deep and private this year. Pick one safe person and tell them the real version.',
  Sagittarius: 'You need room to roam this year. Build in freedom and adventure before you feel caged.',
  Capricorn: 'You carry a lot quietly this year. Let someone help you, and treat rest as part of the plan.',
  Aquarius: 'You need space and your own people this year. Make time for friends who get you.',
  Pisces: 'You soak up everyone\'s mood this year, so give yourself quiet time to wash it off.',
};

const GENERIC: BirthdayAdvice = {
  headline: 'The year you step into your own light',
  emoji: '✨',
  keyword: 'New Year of Life',
  advice:
    'A new solar year begins today. The Sun is back where it stood the moment you were born, which makes this the best day of the year to decide what you want more of. Choose one thing, and begin it this week.',
  action: 'Write down three things you want from this year, and take one small step on the first one today.',
  moon: '',
};

interface SrPlanet { name: string; sign?: string; house?: number }

/** Build the advice from the Solar Return planets (as returned by /returns/solar). */
export function buildBirthdayAdvice(planets: SrPlanet[] | null | undefined): BirthdayAdvice {
  if (!planets || planets.length === 0) return GENERIC;
  const sun = planets.find((p) => p.name === 'Sun');
  const moon = planets.find((p) => p.name === 'Moon');
  const theme = sun?.house ? YEAR_THEME_HEADLINES[sun.house] : undefined;
  if (!theme || !sun?.house) return GENERIC;
  return {
    headline: theme.headline,
    emoji: theme.emoji,
    keyword: theme.keyword,
    advice: theme.description,
    action: ACTION_BY_HOUSE[sun.house] || GENERIC.action,
    moon: (moon?.sign && MOON_BY_SIGN[moon.sign]) || '',
  };
}

export function firstName(name: string | null | undefined): string {
  const n = (name || '').trim().split(/\s+/)[0];
  return n || 'friend';
}

/** Plain-text body for the post (older app versions and share previews show this). */
export function birthdayPostText(name: string, belated: boolean, a: BirthdayAdvice): string {
  const n = firstName(name);
  const head = belated
    ? `🎉 Belated Happy Birthday, ${n}! Your tribe has not forgotten you.`
    : `🎂 Happy Birthday, ${n}! The whole Align tribe is celebrating you today.`;
  return [
    head,
    '',
    `${a.emoji} Your solar return year: ${a.headline}.`,
    a.advice,
    '',
    `✨ Your move: ${a.action}`,
    a.moon ? `🌙 ${a.moon}` : '',
    '',
    `💛 Drop ${n} a birthday wish below.`,
  ].filter((l, i, arr) => l !== '' || arr[i - 1] !== '').join('\n');
}
