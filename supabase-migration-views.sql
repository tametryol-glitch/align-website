-- ═════════════════════════════════════════════════════════════════════════════
-- ALIGN — Views: who saw your posts, photos, videos, reels and stories
--
-- What existed before this migration:
--   story_views       who saw a story ("Seen by N" + list, owner only)
--   post_video_views  one row per (video post, person) — count shown, no list
--   reel_views        one row per (reel, person)       — count shown, no list
--   post_impressions  one row per (post, person) seen in the feed — used only
--                     for feed ranking, never shown to anyone
--   profile_views     who opened your profile
--   Profile photos (avatar / cover / gallery) had no views at all.
--
-- This adds:
--   1. posts.viewers_count   unique people who saw a post (from impressions)
--   2. photo_views           who opened a profile photo, + record_photo_view()
--                            and photo_view_counts()
--   3. get_viewers()         the "who viewed" list for ONE thing you own
--   4. get_my_view_activity() everyone who viewed anything of yours, newest
--      first (the Views page), + get_my_view_stats() and the unread badge
--   5. View milestone alerts ("25 people have viewed your photo") on every
--      kind, once per threshold, with an opt-out switch (view_milestones)
--
-- Viewer lists are only ever returned to the owner of the content. Blocked
-- people (either direction) never appear.
--
-- Safe to run more than once.
-- ═════════════════════════════════════════════════════════════════════════════


-- ── 1. Post viewers (from feed impressions) ─────────────────────────────────
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS viewers_count INTEGER NOT NULL DEFAULT 0;

-- post_impressions' primary key is (user_id, post_id); lists by post need this.
CREATE INDEX IF NOT EXISTS idx_post_impressions_post
  ON public.post_impressions (post_id, first_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_video_views_post
  ON public.post_video_views (post_id, watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_reel_views_reel_time
  ON public.reel_views (reel_id, watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_views_story_time
  ON public.story_views (story_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_views_profile_time
  ON public.profile_views (profile_id, viewed_at DESC);

-- Backfill: everyone who has seen each post, not counting its author.
UPDATE public.posts p
   SET viewers_count = sub.n
  FROM (SELECT pi.post_id, COUNT(*)::int AS n
          FROM public.post_impressions pi
          JOIN public.posts pp ON pp.id = pi.post_id
         WHERE pi.user_id <> pp.user_id
         GROUP BY pi.post_id) sub
 WHERE p.id = sub.post_id
   AND p.viewers_count IS DISTINCT FROM sub.n;


-- ── 2. Profile-photo views ──────────────────────────────────────────────────
-- Keyed exactly like photo_reactions (photoKeyFromUrl on web + app), so a
-- photo keeps its views whether it loaded through a public or signed URL.
CREATE TABLE IF NOT EXISTS public.photo_views (
  photo_key TEXT        NOT NULL CHECK (char_length(photo_key) BETWEEN 3 AND 600),
  owner_id  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewer_id UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (photo_key, viewer_id)
);
CREATE INDEX IF NOT EXISTS idx_photo_views_owner_time ON public.photo_views (owner_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_photo_views_key_time   ON public.photo_views (photo_key, viewed_at DESC);

ALTER TABLE public.photo_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS photo_views_select ON public.photo_views;
CREATE POLICY photo_views_select ON public.photo_views FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR viewer_id = auth.uid());
-- No INSERT/UPDATE/DELETE policies: writes go through record_photo_view().

GRANT SELECT ON public.photo_views TO authenticated;
GRANT ALL    ON public.photo_views TO service_role;


-- Milestone bookkeeping: one row per (thing, threshold) ever announced, so
-- a count that dips and climbs back never repeats an alert.
CREATE TABLE IF NOT EXISTS public.view_milestones_sent (
  kind       TEXT        NOT NULL,
  content_id TEXT        NOT NULL,
  threshold  INT         NOT NULL,
  sent_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (kind, content_id, threshold)
);
ALTER TABLE public.view_milestones_sent ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.view_milestones_sent TO service_role;

-- When did I last open the Views page (drives the "new viewers" badge).
CREATE TABLE IF NOT EXISTS public.view_inbox_state (
  user_id      UUID        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.view_inbox_state ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.view_inbox_state TO service_role;


-- ── 3. Notification plumbing ────────────────────────────────────────────────
DO $$
DECLARE
  v_def TEXT;
BEGIN
  SELECT pg_get_constraintdef(oid) INTO v_def
    FROM pg_constraint
   WHERE conrelid = 'public.notifications'::regclass
     AND conname  = 'notifications_type_check';

  IF v_def IS NULL THEN
    RAISE NOTICE 'No notifications_type_check constraint; nothing to widen.';
    RETURN;
  END IF;

  IF position('''view_milestone''' IN v_def) = 0 THEN
    v_def := replace(v_def, 'ARRAY[', 'ARRAY[''view_milestone''::text, ');
    EXECUTE 'ALTER TABLE public.notifications DROP CONSTRAINT notifications_type_check';
    EXECUTE 'ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check ' || v_def;
    RAISE NOTICE 'view_milestone added to notifications_type_check.';
  END IF;
END $$;

ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS view_milestones BOOLEAN NOT NULL DEFAULT TRUE;


-- Internal: announce a milestone if p_count just landed on one.
-- Never raises — a view must always be recorded even if the alert fails.
CREATE OR REPLACE FUNCTION public.maybe_notify_view_milestone(
  p_owner      UUID,
  p_kind       TEXT,
  p_content_id TEXT,
  p_count      INT,
  p_image_url  TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_title TEXT;
  v_n     TEXT;
BEGIN
  IF p_owner IS NULL OR p_count IS NULL
     OR NOT (p_count = ANY (ARRAY[5, 10, 25, 50, 100, 250, 500, 1000, 2500,
                                  5000, 10000, 25000, 50000, 100000, 250000,
                                  500000, 1000000])) THEN
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM public.notification_preferences
              WHERE user_id = p_owner AND view_milestones = FALSE) THEN
    RETURN;
  END IF;

  INSERT INTO public.view_milestones_sent (kind, content_id, threshold)
  VALUES (p_kind, p_content_id, p_count)
  ON CONFLICT DO NOTHING;
  IF NOT FOUND THEN RETURN; END IF;   -- already announced once

  v_n := to_char(p_count, 'FM999,999,999');
  v_title := CASE p_kind
    WHEN 'post'  THEN '👀 ' || v_n || ' people have seen your post'
    WHEN 'video' THEN '🎬 ' || v_n || ' people have watched your video'
    WHEN 'reel'  THEN '🎬 ' || v_n || ' people have watched your reel'
    WHEN 'photo' THEN '📸 ' || v_n || ' people have viewed your photo'
    WHEN 'story' THEN '👀 ' || v_n || ' people have seen your story'
    ELSE '👀 ' || v_n || ' views'
  END;

  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    p_owner,
    'view_milestone',
    v_title,
    'Tap to see who has been looking.',
    jsonb_build_object('kind', p_kind, 'content_id', p_content_id,
                       'count', p_count, 'image_url', p_image_url)
  );

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'maybe_notify_view_milestone: % %', SQLSTATE, SQLERRM;
END;
$fn$;
-- Only triggers call this. Postgres grants EXECUTE to PUBLIC by default,
-- which would let anyone spam alerts through /rest/v1/rpc.
REVOKE ALL ON FUNCTION public.maybe_notify_view_milestone(UUID, TEXT, TEXT, INT, TEXT)
  FROM PUBLIC, anon, authenticated;


-- ── 4. Triggers: count + milestone for every kind ───────────────────────────

-- 4a. Posts: a NEW impression row = a new person saw the post.
CREATE OR REPLACE FUNCTION public.on_post_impression_viewer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_owner UUID;
  v_video TEXT;
  v_image TEXT;
  v_count INT;
BEGIN
  SELECT user_id, video_url, image_url INTO v_owner, v_video, v_image
    FROM public.posts WHERE id = NEW.post_id;
  IF v_owner IS NULL OR v_owner = NEW.user_id THEN RETURN NEW; END IF;

  UPDATE public.posts SET viewers_count = viewers_count + 1
   WHERE id = NEW.post_id
  RETURNING viewers_count INTO v_count;

  -- Video posts announce "watched" milestones from post_video_views instead.
  IF v_video IS NULL THEN
    PERFORM public.maybe_notify_view_milestone(v_owner, 'post', NEW.post_id::text, v_count, v_image);
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'on_post_impression_viewer: % %', SQLSTATE, SQLERRM;
  RETURN NEW;
END;
$fn$;
DROP TRIGGER IF EXISTS trg_post_impression_viewer ON public.post_impressions;
CREATE TRIGGER trg_post_impression_viewer
  AFTER INSERT ON public.post_impressions
  FOR EACH ROW EXECUTE FUNCTION public.on_post_impression_viewer();

-- 4b. Video posts.
CREATE OR REPLACE FUNCTION public.on_post_video_viewer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_owner  UUID;
  v_poster TEXT;
  v_count  INT;
BEGIN
  SELECT user_id, poster_url INTO v_owner, v_poster FROM public.posts WHERE id = NEW.post_id;
  IF v_owner IS NULL OR v_owner = NEW.user_id THEN RETURN NEW; END IF;
  SELECT COUNT(*) INTO v_count FROM public.post_video_views
   WHERE post_id = NEW.post_id AND user_id <> v_owner;
  PERFORM public.maybe_notify_view_milestone(v_owner, 'video', NEW.post_id::text, v_count, v_poster);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'on_post_video_viewer: % %', SQLSTATE, SQLERRM;
  RETURN NEW;
END;
$fn$;
DROP TRIGGER IF EXISTS trg_post_video_viewer ON public.post_video_views;
CREATE TRIGGER trg_post_video_viewer
  AFTER INSERT ON public.post_video_views
  FOR EACH ROW EXECUTE FUNCTION public.on_post_video_viewer();

-- 4c. Reels.
CREATE OR REPLACE FUNCTION public.on_reel_viewer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_owner UUID;
  v_thumb TEXT;
  v_count INT;
BEGIN
  SELECT creator_id, thumbnail_url INTO v_owner, v_thumb FROM public.reels WHERE id = NEW.reel_id;
  IF v_owner IS NULL OR v_owner = NEW.user_id THEN RETURN NEW; END IF;
  SELECT COUNT(*) INTO v_count FROM public.reel_views
   WHERE reel_id = NEW.reel_id AND user_id <> v_owner;
  PERFORM public.maybe_notify_view_milestone(v_owner, 'reel', NEW.reel_id::text, v_count, v_thumb);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'on_reel_viewer: % %', SQLSTATE, SQLERRM;
  RETURN NEW;
END;
$fn$;
DROP TRIGGER IF EXISTS trg_reel_viewer ON public.reel_views;
CREATE TRIGGER trg_reel_viewer
  AFTER INSERT ON public.reel_views
  FOR EACH ROW EXECUTE FUNCTION public.on_reel_viewer();

-- 4d. Profile photos.
CREATE OR REPLACE FUNCTION public.on_photo_viewer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.photo_views WHERE photo_key = NEW.photo_key;
  PERFORM public.maybe_notify_view_milestone(NEW.owner_id, 'photo', NEW.photo_key, v_count, NEW.image_url);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'on_photo_viewer: % %', SQLSTATE, SQLERRM;
  RETURN NEW;
END;
$fn$;
DROP TRIGGER IF EXISTS trg_photo_viewer ON public.photo_views;
CREATE TRIGGER trg_photo_viewer
  AFTER INSERT ON public.photo_views
  FOR EACH ROW EXECUTE FUNCTION public.on_photo_viewer();

-- 4e. Stories.
CREATE OR REPLACE FUNCTION public.on_story_viewer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_owner UUID;
  v_thumb TEXT;
  v_count INT;
BEGIN
  SELECT user_id, COALESCE(thumbnail_url, CASE WHEN type = 'image' THEN media_url END)
    INTO v_owner, v_thumb
    FROM public.stories WHERE id = NEW.story_id;
  IF v_owner IS NULL OR v_owner = NEW.viewer_id THEN RETURN NEW; END IF;
  SELECT COUNT(*) INTO v_count FROM public.story_views
   WHERE story_id = NEW.story_id AND viewer_id <> v_owner;
  PERFORM public.maybe_notify_view_milestone(v_owner, 'story', NEW.story_id::text, v_count, v_thumb);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'on_story_viewer: % %', SQLSTATE, SQLERRM;
  RETURN NEW;
END;
$fn$;
DROP TRIGGER IF EXISTS trg_story_viewer ON public.story_views;
CREATE TRIGGER trg_story_viewer
  AFTER INSERT ON public.story_views
  FOR EACH ROW EXECUTE FUNCTION public.on_story_viewer();


-- ── 5. Recording a profile-photo view ───────────────────────────────────────
-- Opening a photo in the viewer calls this. Your own photos never count.
-- image_url must be one of our storage URLs (it is shown to the owner as a
-- thumbnail, so an arbitrary outside image is refused).
CREATE OR REPLACE FUNCTION public.record_photo_view(
  p_photo_key TEXT,
  p_owner_id  UUID,
  p_image_url TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_uid UUID := auth.uid();
  v_img TEXT := p_image_url;
BEGIN
  IF v_uid IS NULL OR p_owner_id IS NULL OR v_uid = p_owner_id THEN RETURN; END IF;
  IF p_photo_key IS NULL OR char_length(p_photo_key) NOT BETWEEN 3 AND 600 THEN RETURN; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_owner_id) THEN RETURN; END IF;
  IF EXISTS (SELECT 1 FROM public.blocks b
              WHERE (b.blocker_id = p_owner_id AND b.blocked_id = v_uid)
                 OR (b.blocker_id = v_uid AND b.blocked_id = p_owner_id)) THEN
    RETURN;
  END IF;
  IF v_img IS NOT NULL AND v_img NOT LIKE 'https://wxzwdvlbcsmnkhjmkgkx.supabase.co/storage/%' THEN
    v_img := NULL;
  END IF;

  INSERT INTO public.photo_views (photo_key, owner_id, viewer_id, image_url)
  VALUES (p_photo_key, p_owner_id, v_uid, v_img)
  ON CONFLICT (photo_key, viewer_id) DO UPDATE
    SET viewed_at = NOW(),
        image_url = COALESCE(EXCLUDED.image_url, public.photo_views.image_url);
END;
$fn$;
REVOKE ALL ON FUNCTION public.record_photo_view(TEXT, UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_photo_view(TEXT, UUID, TEXT) TO authenticated;

-- View counts for a batch of photos (anyone signed in may see the number).
CREATE OR REPLACE FUNCTION public.photo_view_counts(p_keys TEXT[])
RETURNS TABLE (photo_key TEXT, views INT)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.photo_key, COUNT(*)::int
    FROM public.photo_views v
   WHERE auth.uid() IS NOT NULL
     AND v.photo_key = ANY (p_keys[1:200])
   GROUP BY v.photo_key;
$$;
REVOKE ALL ON FUNCTION public.photo_view_counts(TEXT[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.photo_view_counts(TEXT[]) TO authenticated;


-- ── 6. "Who viewed this" — one thing you own ────────────────────────────────
-- p_kind: 'post' (seen in feed), 'video' (video post watched), 'reel',
--         'photo' (p_id = photo_key), 'story'.
-- Returns nothing at all unless you own the thing. total = full count, so
-- the sheet can say "48 people" while paging 50 at a time.
CREATE OR REPLACE FUNCTION public.get_viewers(
  p_kind   TEXT,
  p_id     TEXT,
  p_limit  INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  viewer_id    UUID,
  display_name TEXT,
  avatar_url   TEXT,
  sun_sign     TEXT,
  viewed_at    TIMESTAMPTZ,
  total        BIGINT
)
LANGUAGE plpgsql STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_uid   UUID := auth.uid();
  v_owner UUID;
  v_lim   INT  := LEAST(GREATEST(COALESCE(p_limit, 50), 1), 200);
  v_off   INT  := GREATEST(COALESCE(p_offset, 0), 0);
BEGIN
  IF v_uid IS NULL OR p_id IS NULL THEN RETURN; END IF;

  IF p_kind IN ('post', 'video') THEN
    SELECT user_id INTO v_owner FROM public.posts WHERE id::text = p_id;
  ELSIF p_kind = 'reel' THEN
    SELECT creator_id INTO v_owner FROM public.reels WHERE id::text = p_id;
  ELSIF p_kind = 'story' THEN
    SELECT user_id INTO v_owner FROM public.stories WHERE id::text = p_id;
  ELSIF p_kind = 'photo' THEN
    v_owner := v_uid;   -- rows below are filtered to owner_id = me
  ELSE
    RETURN;
  END IF;
  IF v_owner IS DISTINCT FROM v_uid THEN RETURN; END IF;

  RETURN QUERY
  WITH raw AS (
    SELECT pi.user_id AS vid, pi.first_seen_at AS at
      FROM public.post_impressions pi
     WHERE p_kind = 'post' AND pi.post_id::text = p_id
    UNION ALL
    SELECT pv.user_id, pv.watched_at
      FROM public.post_video_views pv
     WHERE p_kind = 'video' AND pv.post_id::text = p_id
    UNION ALL
    SELECT rv.user_id, rv.watched_at
      FROM public.reel_views rv
     WHERE p_kind = 'reel' AND rv.reel_id::text = p_id
    UNION ALL
    SELECT sv.viewer_id, sv.viewed_at
      FROM public.story_views sv
     WHERE p_kind = 'story' AND sv.story_id::text = p_id
    UNION ALL
    SELECT ph.viewer_id, ph.viewed_at
      FROM public.photo_views ph
     WHERE p_kind = 'photo' AND ph.photo_key = p_id AND ph.owner_id = v_uid
  ),
  visible AS (
    SELECT r.vid, r.at
      FROM raw r
     WHERE r.vid <> v_uid
       AND NOT EXISTS (SELECT 1 FROM public.blocks b
                        WHERE (b.blocker_id = v_uid AND b.blocked_id = r.vid)
                           OR (b.blocker_id = r.vid AND b.blocked_id = v_uid))
  )
  SELECT v.vid, p.display_name, p.avatar_url, p.sun_sign, v.at,
         COUNT(*) OVER () AS total
    FROM visible v
    JOIN public.profiles p ON p.id = v.vid
   ORDER BY v.at DESC
   LIMIT v_lim OFFSET v_off;
END;
$fn$;
REVOKE ALL ON FUNCTION public.get_viewers(TEXT, TEXT, INT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_viewers(TEXT, TEXT, INT, INT) TO authenticated;


-- ── 7. The Views page: everyone who viewed anything of mine ─────────────────
-- kind: profile | post | video | reel | photo | story
-- content_id: post/reel/story id or photo_key (NULL for profile)
-- Pass p_before = the last row's viewed_at to load the next page.
CREATE OR REPLACE FUNCTION public.get_my_view_activity(
  p_limit  INT DEFAULT 40,
  p_before TIMESTAMPTZ DEFAULT NULL,
  p_kind   TEXT DEFAULT NULL
)
RETURNS TABLE (
  kind         TEXT,
  content_id   TEXT,
  thumb_url    TEXT,
  snippet      TEXT,
  viewer_id    UUID,
  display_name TEXT,
  avatar_url   TEXT,
  sun_sign     TEXT,
  viewed_at    TIMESTAMPTZ
)
LANGUAGE plpgsql STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_uid    UUID        := auth.uid();
  v_lim    INT         := LEAST(GREATEST(COALESCE(p_limit, 40), 1), 100);
  v_before TIMESTAMPTZ := COALESCE(p_before, 'infinity'::timestamptz);
BEGIN
  IF v_uid IS NULL THEN RETURN; END IF;

  RETURN QUERY
  WITH ev AS (
    (SELECT 'profile'::text AS k, NULL::text AS cid, NULL::text AS thumb, NULL::text AS snip,
            pv.viewer_id AS vid, pv.viewed_at AS at
       FROM public.profile_views pv
      WHERE (p_kind IS NULL OR p_kind = 'profile')
        AND pv.profile_id = v_uid AND pv.viewer_id IS NOT NULL AND pv.viewed_at < v_before
      ORDER BY pv.viewed_at DESC LIMIT v_lim)
    UNION ALL
    (SELECT 'post', p.id::text, p.image_url, left(p.content, 90), pi.user_id, pi.first_seen_at
       FROM public.posts p
       JOIN public.post_impressions pi ON pi.post_id = p.id
      WHERE (p_kind IS NULL OR p_kind = 'post')
        AND p.user_id = v_uid AND p.video_url IS NULL AND COALESCE(p.is_deleted, FALSE) = FALSE
        AND pi.first_seen_at < v_before
      ORDER BY pi.first_seen_at DESC LIMIT v_lim)
    UNION ALL
    (SELECT 'video', p.id::text, p.poster_url, left(p.content, 90), vv.user_id, vv.watched_at
       FROM public.posts p
       JOIN public.post_video_views vv ON vv.post_id = p.id
      WHERE (p_kind IS NULL OR p_kind = 'video')
        AND p.user_id = v_uid AND COALESCE(p.is_deleted, FALSE) = FALSE
        AND vv.watched_at < v_before
      ORDER BY vv.watched_at DESC LIMIT v_lim)
    UNION ALL
    (SELECT 'reel', r.id::text, r.thumbnail_url, left(r.caption, 90), rv.user_id, rv.watched_at
       FROM public.reels r
       JOIN public.reel_views rv ON rv.reel_id = r.id
      WHERE (p_kind IS NULL OR p_kind = 'reel')
        AND r.creator_id = v_uid AND rv.watched_at < v_before
      ORDER BY rv.watched_at DESC LIMIT v_lim)
    UNION ALL
    (SELECT 'photo', ph.photo_key, ph.image_url, NULL::text, ph.viewer_id, ph.viewed_at
       FROM public.photo_views ph
      WHERE (p_kind IS NULL OR p_kind = 'photo')
        AND ph.owner_id = v_uid AND ph.viewed_at < v_before
      ORDER BY ph.viewed_at DESC LIMIT v_lim)
    UNION ALL
    (SELECT 'story', s.id::text,
            COALESCE(s.thumbnail_url, CASE WHEN s.type = 'image' THEN s.media_url END),
            left(s.content, 90), sv.viewer_id, sv.viewed_at
       FROM public.stories s
       JOIN public.story_views sv ON sv.story_id = s.id
      WHERE (p_kind IS NULL OR p_kind = 'story')
        AND s.user_id = v_uid AND sv.viewed_at < v_before
      ORDER BY sv.viewed_at DESC LIMIT v_lim)
  )
  SELECT e.k, e.cid, e.thumb, e.snip, e.vid, pr.display_name, pr.avatar_url, pr.sun_sign, e.at
    FROM ev e
    JOIN public.profiles pr ON pr.id = e.vid
   WHERE e.vid <> v_uid
     AND NOT EXISTS (SELECT 1 FROM public.blocks b
                      WHERE (b.blocker_id = v_uid AND b.blocked_id = e.vid)
                         OR (b.blocker_id = e.vid AND b.blocked_id = v_uid))
   ORDER BY e.at DESC
   LIMIT v_lim;
END;
$fn$;
REVOKE ALL ON FUNCTION public.get_my_view_activity(INT, TIMESTAMPTZ, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_view_activity(INT, TIMESTAMPTZ, TEXT) TO authenticated;


-- Views in the last p_days vs the p_days before that, per kind, plus
-- kind = 'people' = distinct people across everything in each window.
CREATE OR REPLACE FUNCTION public.get_my_view_stats(p_days INT DEFAULT 7)
RETURNS TABLE (kind TEXT, current_count BIGINT, previous_count BIGINT)
LANGUAGE plpgsql STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_uid UUID := auth.uid();
  v_d   INTERVAL := make_interval(days => LEAST(GREATEST(COALESCE(p_days, 7), 1), 365));
  v_now TIMESTAMPTZ := NOW();
BEGIN
  IF v_uid IS NULL THEN RETURN; END IF;

  RETURN QUERY
  WITH ev AS (
    SELECT 'profile'::text AS k, pv.viewer_id AS vid, pv.viewed_at AS at
      FROM public.profile_views pv
     WHERE pv.profile_id = v_uid AND pv.viewer_id IS NOT NULL
       AND pv.viewed_at >= v_now - 2 * v_d
    UNION ALL
    SELECT 'post', pi.user_id, pi.first_seen_at
      FROM public.posts p JOIN public.post_impressions pi ON pi.post_id = p.id
     WHERE p.user_id = v_uid AND p.video_url IS NULL
       AND pi.first_seen_at >= v_now - 2 * v_d
    UNION ALL
    SELECT 'video', vv.user_id, vv.watched_at
      FROM public.posts p JOIN public.post_video_views vv ON vv.post_id = p.id
     WHERE p.user_id = v_uid AND vv.watched_at >= v_now - 2 * v_d
    UNION ALL
    SELECT 'reel', rv.user_id, rv.watched_at
      FROM public.reels r JOIN public.reel_views rv ON rv.reel_id = r.id
     WHERE r.creator_id = v_uid AND rv.watched_at >= v_now - 2 * v_d
    UNION ALL
    SELECT 'photo', ph.viewer_id, ph.viewed_at
      FROM public.photo_views ph
     WHERE ph.owner_id = v_uid AND ph.viewed_at >= v_now - 2 * v_d
    UNION ALL
    SELECT 'story', sv.viewer_id, sv.viewed_at
      FROM public.stories s JOIN public.story_views sv ON sv.story_id = s.id
     WHERE s.user_id = v_uid AND sv.viewed_at >= v_now - 2 * v_d
  ),
  mine AS (SELECT * FROM ev WHERE ev.vid <> v_uid)
  SELECT m.k,
         COUNT(*) FILTER (WHERE m.at >= v_now - v_d),
         COUNT(*) FILTER (WHERE m.at <  v_now - v_d)
    FROM mine m GROUP BY m.k
  UNION ALL
  SELECT 'people',
         COUNT(DISTINCT m.vid) FILTER (WHERE m.at >= v_now - v_d),
         COUNT(DISTINCT m.vid) FILTER (WHERE m.at <  v_now - v_d)
    FROM mine m;
END;
$fn$;
REVOKE ALL ON FUNCTION public.get_my_view_stats(INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_view_stats(INT) TO authenticated;


-- Unread badge: people who viewed something of mine since I last opened the
-- Views page (capped at 99). First call ever counts the last 7 days.
CREATE OR REPLACE FUNCTION public.get_my_view_badge()
RETURNS INT
LANGUAGE plpgsql STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_uid   UUID := auth.uid();
  v_since TIMESTAMPTZ;
  v_n     INT;
BEGIN
  IF v_uid IS NULL THEN RETURN 0; END IF;
  SELECT last_seen_at INTO v_since FROM public.view_inbox_state WHERE user_id = v_uid;
  v_since := COALESCE(v_since, NOW() - INTERVAL '7 days');

  SELECT COUNT(DISTINCT vid)::int INTO v_n FROM (
    (SELECT pv.viewer_id AS vid FROM public.profile_views pv
      WHERE pv.profile_id = v_uid AND pv.viewed_at > v_since LIMIT 200)
    UNION ALL
    (SELECT pi.user_id FROM public.posts p JOIN public.post_impressions pi ON pi.post_id = p.id
      WHERE p.user_id = v_uid AND p.video_url IS NULL AND pi.first_seen_at > v_since LIMIT 200)
    UNION ALL
    (SELECT vv.user_id FROM public.posts p JOIN public.post_video_views vv ON vv.post_id = p.id
      WHERE p.user_id = v_uid AND vv.watched_at > v_since LIMIT 200)
    UNION ALL
    (SELECT rv.user_id FROM public.reels r JOIN public.reel_views rv ON rv.reel_id = r.id
      WHERE r.creator_id = v_uid AND rv.watched_at > v_since LIMIT 200)
    UNION ALL
    (SELECT ph.viewer_id FROM public.photo_views ph
      WHERE ph.owner_id = v_uid AND ph.viewed_at > v_since LIMIT 200)
    UNION ALL
    (SELECT sv.viewer_id FROM public.stories s JOIN public.story_views sv ON sv.story_id = s.id
      WHERE s.user_id = v_uid AND sv.viewed_at > v_since LIMIT 200)
  ) x
  WHERE x.vid IS NOT NULL AND x.vid <> v_uid;

  RETURN LEAST(COALESCE(v_n, 0), 99);
END;
$fn$;
REVOKE ALL ON FUNCTION public.get_my_view_badge() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_view_badge() TO authenticated;

CREATE OR REPLACE FUNCTION public.mark_views_seen()
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.view_inbox_state (user_id, last_seen_at)
  SELECT auth.uid(), NOW() WHERE auth.uid() IS NOT NULL
  ON CONFLICT (user_id) DO UPDATE SET last_seen_at = NOW();
$$;
REVOKE ALL ON FUNCTION public.mark_views_seen() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_views_seen() TO authenticated;


-- ── 8. Verify ────────────────────────────────────────────────────────────────
SELECT 'trigger' AS what, tgname AS name FROM pg_trigger
 WHERE tgname IN ('trg_post_impression_viewer', 'trg_post_video_viewer', 'trg_reel_viewer',
                  'trg_photo_viewer', 'trg_story_viewer')
UNION ALL
SELECT 'function', proname FROM pg_proc
 WHERE pronamespace = 'public'::regnamespace
   AND proname IN ('record_photo_view', 'photo_view_counts', 'get_viewers', 'get_my_view_activity',
                   'get_my_view_stats', 'get_my_view_badge', 'mark_views_seen',
                   'maybe_notify_view_milestone')
UNION ALL
SELECT 'posts with viewers', COUNT(*)::text FROM public.posts WHERE viewers_count > 0
ORDER BY 1, 2;
