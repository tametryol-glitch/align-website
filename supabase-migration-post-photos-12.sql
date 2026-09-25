-- Raise the multi-photo post limit from 10 to 12 (web + app MAX_POST_IMAGES = 12).
-- Run BEFORE deploying the code, or 11/12-photo posts fail to insert.
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_media_urls_max10;
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_media_urls_max12;
ALTER TABLE public.posts
  ADD CONSTRAINT posts_media_urls_max12 CHECK (media_urls IS NULL OR cardinality(media_urls) <= 12);

-- Verify
SELECT conname, pg_get_constraintdef(oid) AS def
  FROM pg_constraint
 WHERE conrelid = 'public.posts'::regclass AND conname LIKE 'posts_media_urls_max%';
