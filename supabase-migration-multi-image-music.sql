-- ═════════════════════════════════════════════════════════════════════════════
-- ALIGN — Multi-image posts + music on photo posts and stories + trending music
--
--   posts.media_urls      up to 10 photos in one post (image_url stays = the
--                         first photo, so older app builds still show a cover)
--   posts.music_*         one song from the music library (audio_tracks) that
--   stories.music_*       plays under the whole post / story
--   music_usage           one row every time a song is put on a post or story
--                         (written by triggers — clients can't fake or skip it)
--   music_listens         unique listeners per song per day
--   get_trending_music()  public: most-used songs this week (music picker)
--   admin_music_trends()  admin: usage, growth, listeners per song
--   admin_music_daily()   admin: daily uses + plays for the KPI chart
--   get_story_rail()      now also returns each story's music
--
-- Safe to run more than once.
-- ═════════════════════════════════════════════════════════════════════════════


-- ── 1. Columns ───────────────────────────────────────────────────────────────
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_urls      TEXT[];
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS music_track_id  UUID REFERENCES public.audio_tracks(id) ON DELETE SET NULL;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS music_title     TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS music_url       TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS music_start_sec NUMERIC(7,2) NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_media_urls_max10') THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT posts_media_urls_max10 CHECK (media_urls IS NULL OR cardinality(media_urls) <= 10);
  END IF;
END $$;

ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS music_track_id  UUID REFERENCES public.audio_tracks(id) ON DELETE SET NULL;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS music_title     TEXT;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS music_url       TEXT;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS music_start_sec NUMERIC(7,2) NOT NULL DEFAULT 0;


-- ── 2. Usage log (who put which song on what) ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.music_usage (
  id         BIGSERIAL PRIMARY KEY,
  track_id   UUID NOT NULL REFERENCES public.audio_tracks(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  source     TEXT NOT NULL CHECK (source IN ('post', 'story')),
  ref_id     UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source, ref_id)
);
CREATE INDEX IF NOT EXISTS idx_music_usage_track_time ON public.music_usage (track_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_music_usage_time       ON public.music_usage (created_at DESC);

-- Nobody reads or writes this directly; triggers write it, SECURITY DEFINER
-- functions read it.
ALTER TABLE public.music_usage ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.music_usage TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.music_usage_id_seq TO service_role;

CREATE OR REPLACE FUNCTION public.log_music_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.music_track_id IS NOT NULL THEN
    INSERT INTO public.music_usage (track_id, user_id, source, ref_id)
    VALUES (NEW.music_track_id, NEW.user_id, TG_ARGV[0], NEW.id)
    ON CONFLICT (source, ref_id) DO UPDATE SET track_id = EXCLUDED.track_id;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_posts_music_usage ON public.posts;
CREATE TRIGGER trg_posts_music_usage
  AFTER INSERT OR UPDATE OF music_track_id ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.log_music_usage('post');

DROP TRIGGER IF EXISTS trg_stories_music_usage ON public.stories;
CREATE TRIGGER trg_stories_music_usage
  AFTER INSERT OR UPDATE OF music_track_id ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public.log_music_usage('story');


-- ── 3. Listens (unique listeners per song per day) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.music_listens (
  track_id    UUID NOT NULL REFERENCES public.audio_tracks(id) ON DELETE CASCADE,
  listener_id UUID NOT NULL REFERENCES public.profiles(id)     ON DELETE CASCADE,
  day         DATE NOT NULL DEFAULT CURRENT_DATE,
  plays       INT  NOT NULL DEFAULT 1,
  PRIMARY KEY (track_id, listener_id, day)
);
CREATE INDEX IF NOT EXISTS idx_music_listens_day ON public.music_listens (day, track_id);
ALTER TABLE public.music_listens ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.music_listens TO service_role;

-- Called by the feed / story viewer when a song starts playing for someone.
CREATE OR REPLACE FUNCTION public.record_music_listen(p_track_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.music_listens (track_id, listener_id, day, plays)
  SELECT p_track_id, auth.uid(), CURRENT_DATE, 1
   WHERE auth.uid() IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.audio_tracks WHERE id = p_track_id)
  ON CONFLICT (track_id, listener_id, day)
  DO UPDATE SET plays = LEAST(public.music_listens.plays + 1, 500);
$$;
REVOKE ALL ON FUNCTION public.record_music_listen(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_music_listen(UUID) TO authenticated;


-- ── 4. Public: trending songs for the music picker ───────────────────────────
CREATE OR REPLACE FUNCTION public.get_trending_music(p_limit INT DEFAULT 20)
RETURNS TABLE (track_id UUID, uses BIGINT)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.track_id, count(*) AS uses
    FROM public.music_usage u
    JOIN public.audio_tracks t ON t.id = u.track_id AND t.is_active
   WHERE u.created_at > NOW() - INTERVAL '7 days'
   GROUP BY u.track_id
   ORDER BY count(*) DESC
   LIMIT LEAST(GREATEST(p_limit, 1), 50);
$$;
REVOKE ALL ON FUNCTION public.get_trending_music(INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_trending_music(INT) TO authenticated;


-- ── 5. Admin: trends per song ────────────────────────────────────────────────
-- p_days = the window (7 → "this week" vs the week before). 0 = all time.
CREATE OR REPLACE FUNCTION public.admin_music_trends(p_days INT DEFAULT 7)
RETURNS TABLE (
  track_id       UUID,
  name           TEXT,
  category       TEXT,
  mood           TEXT,
  is_active      BOOLEAN,
  uses           BIGINT,
  uses_prev      BIGINT,
  post_uses      BIGINT,
  story_uses     BIGINT,
  creators       BIGINT,
  listeners      BIGINT,
  plays          BIGINT,
  uses_all_time  BIGINT,
  first_used_at  TIMESTAMPTZ,
  last_used_at   TIMESTAMPTZ
)
LANGUAGE plpgsql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from TIMESTAMPTZ := CASE WHEN p_days > 0 THEN NOW() - make_interval(days => p_days) ELSE '-infinity'::timestamptz END;
  v_prev TIMESTAMPTZ := CASE WHEN p_days > 0 THEN NOW() - make_interval(days => p_days * 2) ELSE '-infinity'::timestamptz END;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin) THEN
    RAISE EXCEPTION 'admin only' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT t.id,
         t.name,
         t.category,
         t.mood,
         t.is_active,
         count(u.id) FILTER (WHERE u.created_at >= v_from),
         count(u.id) FILTER (WHERE p_days > 0 AND u.created_at >= v_prev AND u.created_at < v_from),
         count(u.id) FILTER (WHERE u.created_at >= v_from AND u.source = 'post'),
         count(u.id) FILTER (WHERE u.created_at >= v_from AND u.source = 'story'),
         count(DISTINCT u.user_id) FILTER (WHERE u.created_at >= v_from),
         COALESCE((SELECT count(DISTINCT l.listener_id) FROM public.music_listens l
                    WHERE l.track_id = t.id AND l.day >= v_from::date), 0),
         COALESCE((SELECT sum(l.plays) FROM public.music_listens l
                    WHERE l.track_id = t.id AND l.day >= v_from::date), 0)::BIGINT,
         count(u.id),
         min(u.created_at),
         max(u.created_at)
    FROM public.audio_tracks t
    LEFT JOIN public.music_usage u ON u.track_id = t.id
   WHERE t.kind = 'music'
   GROUP BY t.id, t.name, t.category, t.mood, t.is_active;
END $$;
REVOKE ALL ON FUNCTION public.admin_music_trends(INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_music_trends(INT) TO authenticated;


-- Daily series for the KPI charts. p_track_id NULL = every song together.
CREATE OR REPLACE FUNCTION public.admin_music_daily(p_track_id UUID DEFAULT NULL, p_days INT DEFAULT 30)
RETURNS TABLE (day DATE, uses BIGINT, plays BIGINT, listeners BIGINT)
LANGUAGE plpgsql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin) THEN
    RAISE EXCEPTION 'admin only' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT d::date,
         (SELECT count(*) FROM public.music_usage u
           WHERE u.created_at >= d AND u.created_at < d + INTERVAL '1 day'
             AND (p_track_id IS NULL OR u.track_id = p_track_id)),
         (SELECT COALESCE(sum(l.plays), 0) FROM public.music_listens l
           WHERE l.day = d::date AND (p_track_id IS NULL OR l.track_id = p_track_id))::BIGINT,
         (SELECT count(DISTINCT l.listener_id) FROM public.music_listens l
           WHERE l.day = d::date AND (p_track_id IS NULL OR l.track_id = p_track_id))
    FROM generate_series(CURRENT_DATE - (GREATEST(p_days, 1) - 1), CURRENT_DATE, INTERVAL '1 day') AS d
   ORDER BY 1;
END $$;
REVOKE ALL ON FUNCTION public.admin_music_daily(UUID, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_music_daily(UUID, INT) TO authenticated;


-- ── 6. Story rail returns each story's music ─────────────────────────────────
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
           'seen',             l.seen,
           'music_track_id',   l.music_track_id,
           'music_title',      l.music_title,
           'music_url',        l.music_url,
           'music_start_sec',  l.music_start_sec
         ) ORDER BY l.created_at) AS stories
    FROM live l
    JOIN public.profiles p ON p.id = l.user_id
   GROUP BY l.user_id, p.display_name, p.avatar_url
   ORDER BY (l.user_id = auth.uid()) DESC, bool_and(l.seen) ASC, max(l.created_at) DESC;
$$;
REVOKE ALL ON FUNCTION public.get_story_rail() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_story_rail() TO authenticated;
