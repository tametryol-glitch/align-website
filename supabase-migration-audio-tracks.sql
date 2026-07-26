-- Audio Tracks — video-editor music & sound-bite library (admin-managed)
-- Run this in the Supabase SQL Editor.
--
-- Moves the previously-hardcoded music catalog into a table so an admin can
-- upload new songs and sound bites from /admin/audio. The web editor, mobile
-- editor, and the video renderer all read this table instead of their old
-- hardcoded arrays. Audio files live in the existing public `cosmic-videos`
-- bucket under `music/` (songs) and `sfx/` (sound bites).

CREATE TABLE IF NOT EXISTS audio_tracks (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  mood             text NOT NULL DEFAULT '',
  -- 'music' = full-length background bed, 'sfx' = short one-shot sound bite
  kind             text NOT NULL DEFAULT 'music' CHECK (kind IN ('music', 'sfx')),
  -- Relative path within the cosmic-videos bucket, e.g. 'music/starfire.mp3'
  storage_path     text NOT NULL UNIQUE,
  duration_seconds numeric NOT NULL DEFAULT 0,
  sort_order       integer NOT NULL DEFAULT 0,
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audio_tracks_active_kind_idx
  ON audio_tracks (is_active, kind, sort_order);

-- Row Level Security: anyone may read active tracks (they are chosen by every
-- user in the editor); only admins may insert / update / delete.
ALTER TABLE audio_tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audio_tracks public read active" ON audio_tracks;
CREATE POLICY "audio_tracks public read active"
  ON audio_tracks FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "audio_tracks admin all" ON audio_tracks;
CREATE POLICY "audio_tracks admin all"
  ON audio_tracks FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin));

-- New tables need explicit grants in this project (post 2026-10-30 policy).
GRANT SELECT ON audio_tracks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON audio_tracks TO authenticated;

-- Seed the six tracks that were previously hardcoded, so nothing breaks for
-- videos/editors already referencing them. ON CONFLICT keeps this idempotent.
INSERT INTO audio_tracks (name, mood, kind, storage_path, duration_seconds, sort_order) VALUES
  ('Celestial Drift', 'Ethereal',  'music', 'music/celestial_drift.mp3', 60, 1),
  ('Cosmic Pulse',    'Energetic', 'music', 'music/cosmic_pulse.mp3',    60, 2),
  ('Lunar Whisper',   'Calm',      'music', 'music/lunar_whisper.mp3',   60, 3),
  ('Starfire',        'Dramatic',  'music', 'music/starfire.mp3',        60, 4),
  ('Nebula Flow',     'Chill',     'music', 'music/nebula_flow.mp3',     60, 5),
  ('Zodiac Beat',     'Upbeat',    'music', 'music/zodiac_beat.mp3',     60, 6)
ON CONFLICT (storage_path) DO NOTHING;

-- Uploads themselves are performed server-side by the admin API using the
-- service role (which bypasses storage RLS), exactly like blog cover images —
-- so no additional storage bucket policies are required here.
