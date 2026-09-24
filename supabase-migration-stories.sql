-- ═════════════════════════════════════════════════════════════════════════════
-- ALIGN — Stories (24h disappearing photo / video / text)
--
-- Stories existed only as an AsyncStorage stub in the app: a story was saved
-- on the phone that made it and nobody else could ever see it. The rail was
-- hidden 03-05-2026. This builds the real thing.
--
-- The live public.stories / public.story_views tables were created by an old
-- migration, drifted from the repo copy (different columns, unknown policies),
-- and hold ZERO rows. They are dropped and rebuilt here so every column,
-- constraint and policy is known — patching unknown policies risks leaving a
-- permissive one behind that leaks friends-only stories.
--
--   stories           one row per story frame, expires 24h after posting
--   story_views       who has seen which frame (drives rings + "seen by")
--   story_reactions   one emoji per viewer per frame → 'story_reaction' alert
--   get_story_rail()  the rail for the signed-in user, grouped per author
--
-- Media lives in the existing public 'story-media' bucket under <user_id>/.
--
-- Safe to run more than once.
-- ═════════════════════════════════════════════════════════════════════════════


-- ── 1. Tables ────────────────────────────────────────────────────────────────
DO $$
BEGIN
  -- Only ever drop an EMPTY legacy table. If someone has posted since this was
  -- written, stop rather than destroy data.
  IF to_regclass('public.stories') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_schema = 'public' AND table_name = 'stories'
                        AND column_name = 'visibility') THEN
    IF EXISTS (SELECT 1 FROM public.stories) THEN
      RAISE EXCEPTION 'public.stories has rows; refusing to rebuild it';
    END IF;
    DROP TABLE IF EXISTS public.story_views CASCADE;
    DROP TABLE public.stories CASCADE;
    RAISE NOTICE 'Dropped empty legacy stories tables.';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.stories (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type             TEXT NOT NULL CHECK (type IN ('text', 'image', 'video')),
  content          TEXT CHECK (content IS NULL OR char_length(content) <= 500),
  media_url        TEXT,
  thumbnail_url    TEXT,   -- poster frame for video stories (rail preview)
  background_color TEXT,
  duration_seconds NUMERIC(5,2),
  visibility       TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'friends')),
  view_count       INT  NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at       TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  CONSTRAINT stories_media_required CHECK (type = 'text' OR media_url IS NOT NULL),
  CONSTRAINT stories_text_required  CHECK (type <> 'text' OR char_length(COALESCE(content, '')) > 0)
);

CREATE INDEX IF NOT EXISTS idx_stories_user_expires ON public.stories (user_id, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_expires      ON public.stories (expires_at);

CREATE TABLE IF NOT EXISTS public.story_views (
  story_id  UUID NOT NULL REFERENCES public.stories(id)  ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (story_id, viewer_id)
);
CREATE INDEX IF NOT EXISTS idx_story_views_viewer ON public.story_views (viewer_id);

CREATE TABLE IF NOT EXISTS public.story_reactions (
  story_id   UUID NOT NULL REFERENCES public.stories(id)  ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji      TEXT NOT NULL CHECK (char_length(emoji) BETWEEN 1 AND 16),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (story_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stories, public.story_views, public.story_reactions TO authenticated;
GRANT ALL ON public.stories, public.story_views, public.story_reactions TO service_role;


-- ── 2. Who may see a story ───────────────────────────────────────────────────
-- One definition, used by every policy below so they cannot drift apart.
CREATE OR REPLACE FUNCTION public.can_view_story(p_owner UUID, p_visibility TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p_owner = auth.uid()
    OR (
      auth.uid() IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.blocks b
         WHERE (b.blocker_id = p_owner    AND b.blocked_id = auth.uid())
            OR (b.blocker_id = auth.uid() AND b.blocked_id = p_owner))
      AND (
        p_visibility = 'public'
        OR EXISTS (
          SELECT 1 FROM public.friendships f
           WHERE f.status = 'accepted'
             AND ((f.user_id = auth.uid() AND f.friend_id = p_owner)
               OR (f.friend_id = auth.uid() AND f.user_id = p_owner)))
      )
    );
$$;
REVOKE ALL ON FUNCTION public.can_view_story(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_view_story(UUID, TEXT) TO authenticated;


-- ── 3. Row level security ────────────────────────────────────────────────────
ALTER TABLE public.stories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_reactions ENABLE ROW LEVEL SECURITY;

-- Drop EVERY existing policy on these tables, whatever it is called, so no
-- forgotten permissive policy survives alongside the ones below.
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies
            WHERE schemaname = 'public'
              AND tablename IN ('stories', 'story_views', 'story_reactions') LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

CREATE POLICY stories_select ON public.stories FOR SELECT TO authenticated
  USING (expires_at > NOW() AND public.can_view_story(user_id, visibility));
CREATE POLICY stories_insert ON public.stories FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY stories_delete ON public.stories FOR DELETE TO authenticated
  USING (user_id = auth.uid());
-- No UPDATE policy: a posted story is immutable (view_count moves by trigger).

CREATE POLICY story_views_select ON public.story_views FOR SELECT TO authenticated
  USING (viewer_id = auth.uid()
         OR EXISTS (SELECT 1 FROM public.stories s
                     WHERE s.id = story_views.story_id AND s.user_id = auth.uid()));
CREATE POLICY story_views_insert ON public.story_views FOR INSERT TO authenticated
  WITH CHECK (viewer_id = auth.uid()
              AND EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_views.story_id));

CREATE POLICY story_reactions_select ON public.story_reactions FOR SELECT TO authenticated
  USING (user_id = auth.uid()
         OR EXISTS (SELECT 1 FROM public.stories s
                     WHERE s.id = story_reactions.story_id AND s.user_id = auth.uid()));
CREATE POLICY story_reactions_insert ON public.story_reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()
              AND EXISTS (SELECT 1 FROM public.stories s
                           WHERE s.id = story_reactions.story_id AND s.user_id <> auth.uid()));
CREATE POLICY story_reactions_update ON public.story_reactions FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY story_reactions_delete ON public.story_reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());


-- ── 4. View counter ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.bump_story_view_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  UPDATE public.stories
     SET view_count = view_count + 1
   WHERE id = NEW.story_id
     AND user_id <> NEW.viewer_id;   -- watching your own story is not a view
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_bump_story_view_count ON public.story_views;
CREATE TRIGGER trg_bump_story_view_count
  AFTER INSERT ON public.story_views
  FOR EACH ROW EXECUTE FUNCTION public.bump_story_view_count();


-- ── 5. "X reacted 🔥 to your story" ──────────────────────────────────────────
-- INSERT only: changing your emoji afterwards does not ping the owner again.
CREATE OR REPLACE FUNCTION public.notify_story_reaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_owner UUID;
  v_name  TEXT;
BEGIN
  SELECT user_id INTO v_owner FROM public.stories WHERE id = NEW.story_id;
  IF v_owner IS NULL OR v_owner = NEW.user_id THEN RETURN NEW; END IF;

  -- Reactions share the "likes" switch with post reactions.
  IF EXISTS (SELECT 1 FROM public.notification_preferences
              WHERE user_id = v_owner AND (likes = FALSE OR push_likes = FALSE)) THEN
    RETURN NEW;
  END IF;

  SELECT display_name INTO v_name FROM public.profiles WHERE id = NEW.user_id;

  INSERT INTO public.notifications (user_id, type, title, body, data, actor_id)
  VALUES (
    v_owner,
    'story_reaction',
    COALESCE(v_name, 'Someone') || ' reacted ' || NEW.emoji || ' to your story',
    '',
    jsonb_build_object('story_id', NEW.story_id, 'from_user_id', NEW.user_id,
                       'user_id', NEW.user_id, 'emoji', NEW.emoji),
    NEW.user_id
  );
  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_story_reaction: % %', SQLSTATE, SQLERRM;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_notify_story_reaction ON public.story_reactions;
CREATE TRIGGER trg_notify_story_reaction
  AFTER INSERT ON public.story_reactions
  FOR EACH ROW EXECUTE FUNCTION public.notify_story_reaction();


-- ── 6. The rail ──────────────────────────────────────────────────────────────
-- SECURITY INVOKER: the stories_select policy decides what comes back, so the
-- rail can never show more than opening the story directly would.
-- Authors = me + people I follow + accepted friends, with a live story.
-- Order: me first, then authors with something unseen (newest first), then
-- fully-seen authors.
CREATE OR REPLACE FUNCTION public.get_story_rail()
RETURNS TABLE (
  user_id      UUID,
  display_name TEXT,
  avatar_url   TEXT,
  all_seen     BOOLEAN,
  latest_at    TIMESTAMPTZ,
  stories      JSONB
)
LANGUAGE sql STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH authors AS (
    SELECT auth.uid() AS uid
    UNION SELECT following_id FROM public.follows WHERE follower_id = auth.uid()
    UNION SELECT CASE WHEN f.user_id = auth.uid() THEN f.friend_id ELSE f.user_id END
            FROM public.friendships f
           WHERE f.status = 'accepted'
             AND (f.user_id = auth.uid() OR f.friend_id = auth.uid())
  ),
  live AS (
    SELECT s.*,
           EXISTS (SELECT 1 FROM public.story_views v
                    WHERE v.story_id = s.id AND v.viewer_id = auth.uid()) AS seen
      FROM public.stories s
     WHERE s.user_id IN (SELECT uid FROM authors)
       AND s.expires_at > NOW()
  )
  SELECT l.user_id,
         p.display_name,
         p.avatar_url,
         bool_and(l.seen)  AS all_seen,
         max(l.created_at) AS latest_at,
         jsonb_agg(jsonb_build_object(
           'id',               l.id,
           'type',             l.type,
           'content',          l.content,
           'media_url',        l.media_url,
           'thumbnail_url',    l.thumbnail_url,
           'background_color', l.background_color,
           'duration_seconds', l.duration_seconds,
           'visibility',       l.visibility,
           'view_count',       CASE WHEN l.user_id = auth.uid() THEN l.view_count END,
           'created_at',       l.created_at,
           'expires_at',       l.expires_at,
           'seen',             l.seen
         ) ORDER BY l.created_at) AS stories
    FROM live l
    JOIN public.profiles p ON p.id = l.user_id
   GROUP BY l.user_id, p.display_name, p.avatar_url
   ORDER BY (l.user_id = auth.uid()) DESC, bool_and(l.seen) ASC, max(l.created_at) DESC;
$$;
REVOKE ALL ON FUNCTION public.get_story_rail() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_story_rail() TO authenticated;


-- ── 7. Storage: story-media bucket, one folder per user ──────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('story-media', 'story-media', TRUE, 104857600)   -- 100 MB
ON CONFLICT (id) DO UPDATE SET public = TRUE, file_size_limit = 104857600;

DROP POLICY IF EXISTS story_media_insert_own ON storage.objects;
CREATE POLICY story_media_insert_own ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'story-media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS story_media_delete_own ON storage.objects;
CREATE POLICY story_media_delete_own ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'story-media' AND (storage.foldername(name))[1] = auth.uid()::text);


-- ── 8. Verify ────────────────────────────────────────────────────────────────
SELECT tablename, policyname, cmd FROM pg_policies
 WHERE schemaname = 'public' AND tablename IN ('stories', 'story_views', 'story_reactions')
 ORDER BY tablename, policyname;
