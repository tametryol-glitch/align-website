-- ═══════════════════════════════════════════════════════════════════
-- Profile photo album — one album per profile (web + app)
--
-- Photos a member adds straight to their profile's Photos tab, without
-- posting them to the feed. Files live in the public `post-media` bucket
-- at `<uid>/album/<ts>.<ext>` (the existing "users can delete own files"
-- storage policy covers removal).
--
-- Reactions and "who viewed" reuse photo_reactions / photo_views via
-- photoKeyFromUrl(image_url) — no new reaction plumbing.
--
-- Run BEFORE deploying the web/app code that reads this table.
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.profile_album_photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url    TEXT NOT NULL CHECK (char_length(image_url) BETWEEN 10 AND 1000),
  storage_path TEXT CHECK (storage_path IS NULL OR char_length(storage_path) <= 500),
  caption      TEXT CHECK (caption IS NULL OR char_length(caption) <= 300),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_album_photos_user
  ON public.profile_album_photos (user_id, created_at DESC);

-- ── Cap: 300 photos per album ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.enforce_profile_album_cap()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT count(*) FROM public.profile_album_photos WHERE user_id = NEW.user_id) >= 300 THEN
    RAISE EXCEPTION 'Album is full (300 photos max)' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profile_album_cap ON public.profile_album_photos;
CREATE TRIGGER trg_profile_album_cap
  BEFORE INSERT ON public.profile_album_photos
  FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_album_cap();

-- ── RLS ────────────────────────────────────────────────────────────
ALTER TABLE public.profile_album_photos ENABLE ROW LEVEL SECURITY;

-- Any signed-in member can see an album, except across a block (either way).
DROP POLICY IF EXISTS "profile_album_select" ON public.profile_album_photos;
CREATE POLICY "profile_album_select" ON public.profile_album_photos FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR NOT EXISTS (
      SELECT 1 FROM public.blocks b
      WHERE (b.blocker_id = profile_album_photos.user_id AND b.blocked_id = auth.uid())
         OR (b.blocker_id = auth.uid() AND b.blocked_id = profile_album_photos.user_id)
    )
  );

DROP POLICY IF EXISTS "profile_album_insert" ON public.profile_album_photos;
CREATE POLICY "profile_album_insert" ON public.profile_album_photos FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "profile_album_update" ON public.profile_album_photos;
CREATE POLICY "profile_album_update" ON public.profile_album_photos FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "profile_album_delete" ON public.profile_album_photos;
CREATE POLICY "profile_album_delete" ON public.profile_album_photos FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Explicit grants (required for new tables from 30-10-2026).
REVOKE ALL ON public.profile_album_photos FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_album_photos TO authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_profile_album_cap() FROM anon, authenticated;

-- Verify
SELECT count(*) AS policies FROM pg_policies
 WHERE schemaname = 'public' AND tablename = 'profile_album_photos';
