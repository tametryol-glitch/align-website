/**
 * Cosmic Studio — shareability helpers.
 *
 * Turns a finished video into something the user can post in one tap: a
 * ready-to-paste caption, relevant hashtags, and the brand handle that gets
 * watermarked onto the video. This is the growth layer — every post is a
 * branded ad for Align, so we make posting frictionless.
 */

export const ALIGN_HANDLE = '@align.app';

export type StudioContent =
  | 'daily_forecast'
  | 'chart_reveal'
  | 'transit_alert'
  | 'compatibility_check'
  | 'zodiac_personality'
  | 'affirmation';

interface CaptionInput {
  content: StudioContent;
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  targetSign?: string;
  headline?: string;
}

/** Build a ready-to-post caption (no hashtags — those are separate). */
export function buildCaption(input: CaptionInput): string {
  const sign = input.targetSign || input.sunSign || 'the cosmos';
  switch (input.content) {
    case 'daily_forecast':
      return `Here's what the stars are saying for me today ✨ What's your forecast?`;
    case 'chart_reveal':
      return `My cosmic blueprint, revealed 🌌 Sun in ${input.sunSign || '—'}, Moon in ${input.moonSign || '—'}, ${input.risingSign || '—'} rising. What's yours?`;
    case 'transit_alert':
      return `The sky is moving and I can feel it 🌠 ${input.headline || 'A transit is lighting up my chart.'}`;
    case 'compatibility_check':
      return `We ran our charts together 💫 Here's what the stars think of us.`;
    case 'zodiac_personality':
      return `${sign} energy, decoded ♾️ Tag a ${sign} who needs to see this.`;
    case 'affirmation':
      return `Today's cosmic affirmation 🌙 Save this one.`;
    default:
      return `Made with the stars ✨`;
  }
}

const BASE_TAGS = ['astrology', 'zodiac', 'starseed', 'cosmic', 'horoscope'];

const CONTENT_TAGS: Record<StudioContent, string[]> = {
  daily_forecast: ['dailyhoroscope', 'astrologydaily', 'cosmicweather'],
  chart_reveal: ['natalchart', 'birthchart', 'astrologyreading'],
  transit_alert: ['transits', 'astrologyforecast', 'planetarytransits'],
  compatibility_check: ['synastry', 'compatibility', 'zodiaclove'],
  zodiac_personality: ['zodiacsigns', 'zodiacfacts', 'astrologymemes'],
  affirmation: ['affirmations', 'manifestation', 'dailyaffirmation'],
};

const SIGN_TAG: Record<string, string> = {
  Aries: 'aries', Taurus: 'taurus', Gemini: 'gemini', Cancer: 'cancer',
  Leo: 'leo', Virgo: 'virgo', Libra: 'libra', Scorpio: 'scorpio',
  Sagittarius: 'sagittarius', Capricorn: 'capricorn', Aquarius: 'aquarius',
  Pisces: 'pisces',
};

/** Build a de-duplicated hashtag list for the chosen content + sign. */
export function buildHashtags(input: CaptionInput): string[] {
  const sign = input.targetSign || input.sunSign;
  const tags = [
    ...BASE_TAGS,
    ...(CONTENT_TAGS[input.content] || []),
    ...(sign && SIGN_TAG[sign] ? [SIGN_TAG[sign]] : []),
    'alignapp',
  ];
  // de-dupe, preserve order, cap at a sensible number
  return Array.from(new Set(tags)).slice(0, 12).map((t) => `#${t}`);
}

/** Full caption block ready to copy into TikTok/Reels/Shorts. */
export function buildShareBlock(input: CaptionInput): string {
  return `${buildCaption(input)}\n\n${buildHashtags(input).join(' ')}\n\nMade with Align · ${ALIGN_HANDLE}`;
}
