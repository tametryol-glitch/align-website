-- Blog cover images — Phase 1
-- Adds a cover image column to blog_posts. Run this in the Supabase SQL Editor.

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Images are uploaded by the admin blog API into the existing public
-- `post-media` storage bucket under a `blog/` prefix, and the public URL is
-- stored here. No extra grants/policies needed — the column inherits the
-- table's existing RLS (public reads published rows; admins manage all).
