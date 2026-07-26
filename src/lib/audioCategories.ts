/**
 * Audio categories (genres) for the video-editor audio library.
 *
 * Every uploaded track is filed under one of these. This is the single source
 * of truth for the admin uploader dropdown and the editor's category filter.
 * Add or reorder freely — it's plain data, no DB change needed (the DB stores
 * the category as text).
 */

export const AUDIO_CATEGORIES = [
  'Pop',
  'Hip-Hop',
  'Rap',
  'Trap',
  'R&B',
  'Soul',
  'Afrobeats',
  'Amapiano',
  'Dancehall',
  'Reggae',
  'Soca',
  'Reggaeton',
  'Latin Pop',
  'Latin Trap',
  'Brazilian Funk',
  'Afro House',
  'House',
  'Deep House',
  'Tech House',
  'EDM',
  'Dance',
  'Jersey Club',
  'Drum & Bass',
  'Phonk',
  'Hyperpop',
  'K-Pop',
  'Country',
  'Country Pop',
  'Rock',
  'Alternative Rock',
  'Indie',
  'Indie Pop',
  'Acoustic',
  'Folk',
  'Jazz',
  'Blues',
  'Gospel',
  'Classical',
  'Piano',
  'Lo-fi',
  'Chill',
  'Ambient',
  'Instrumental',
  'Cinematic',
  'Epic',
  'Suspense',
  'Horror',
  'Emotional',
  'Romantic',
  'Sad',
  'Sexy',
  'Motivational',
  'Inspirational',
  'Happy',
  'Feel-Good',
  'Party',
  'Club',
  'Workout',
  'Comedy',
  'Meme',
  'Cute',
  'Kids',
  'Travel',
  'Lifestyle',
  'Fashion',
  'Beauty',
  'Luxury',
  'Gaming',
  'Sports',
  'Action',
  'Background Music',
  'Storytelling',
  'Vlog Music',
  'Transition Music',
  'Trending Sounds',
] as const;

export type AudioCategory = (typeof AUDIO_CATEGORIES)[number];

export const UNCATEGORIZED = 'Uncategorized';

/** Valid category or empty string (falls back to Uncategorized in the UI). */
export function isValidCategory(c: string): boolean {
  return c === '' || (AUDIO_CATEGORIES as readonly string[]).includes(c);
}
