-- Audio categories — adds a genre/category to each track.
-- Run this in the Supabase SQL Editor AFTER supabase-migration-audio-tracks.sql.
--
-- Stored as free text (validated in the app against src/lib/audioCategories.ts)
-- so new genres can be added without a schema change. Empty = Uncategorized.

ALTER TABLE audio_tracks
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS audio_tracks_category_idx
  ON audio_tracks (category);
