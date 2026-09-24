-- ═════════════════════════════════════════════════════════════════════════════
-- ALIGN — Notify people about the accounts they follow
--
-- Until now the follows table fed suggestions and analytics and nothing else.
-- Following someone got them no alert, and their followers heard nothing when
-- they posted or went live (going live only reached friends, and only from the
-- website — a stream started on the phone told nobody).
--
-- This adds three database triggers, so every client (web, app, admin tools,
-- the official-account cron) is covered by construction:
--
--   1. follows INSERT        → 'follow'       "X started following you"
--   2. posts / reels INSERT  → 'new_post'     "X shared a new post"
--   3. live_sessions → live  → 'announcement' "X is live"  (data.kind = live_started)
--
-- Every row lands in public.notifications, so the existing
-- on_notification_send_push trigger delivers the phone + browser push. No
-- change to send_push_notification() is needed: the opt-out is applied here,
-- before the row exists, so a muted category produces neither an in-app entry
-- nor a push.
--
-- Safe to run more than once.
-- ═════════════════════════════════════════════════════════════════════════════


-- ── 1. Allow the new type without dropping any existing one ─────────────────
-- Read the live constraint and add only what is missing, rather than
-- rewriting the list from memory.
DO $$
DECLARE
  v_def TEXT;
  v_t   TEXT;
BEGIN
  SELECT pg_get_constraintdef(oid) INTO v_def
    FROM pg_constraint
   WHERE conrelid = 'public.notifications'::regclass
     AND conname  = 'notifications_type_check';

  IF v_def IS NULL THEN
    RAISE NOTICE 'No notifications_type_check constraint; nothing to widen.';
    RETURN;
  END IF;

  FOREACH v_t IN ARRAY ARRAY['new_post', 'follow', 'announcement'] LOOP
    IF position('''' || v_t || '''' IN v_def) = 0 THEN
      v_def := replace(v_def, 'ARRAY[', 'ARRAY[''' || v_t || '''::text, ');
      RAISE NOTICE '% added to notifications_type_check.', v_t;
    END IF;
  END LOOP;

  EXECUTE 'ALTER TABLE public.notifications DROP CONSTRAINT notifications_type_check';
  EXECUTE 'ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check ' || v_def;
END $$;


-- ── 2. Preferences: one switch per new category ─────────────────────────────
-- gi_alerts is added too: the app's settings screen has always written it,
-- and the upsert failed on the missing column.
ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS new_followers  BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS followed_posts BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS followed_live  BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS gi_alerts      BOOLEAN NOT NULL DEFAULT TRUE;

-- Throttle lookups: "has this person already been told about this author
-- recently?" runs once per recipient on every post.
CREATE INDEX IF NOT EXISTS idx_notifications_user_type_actor
  ON public.notifications (user_id, type, actor_id, created_at DESC);


-- ── 3. "X started following you" ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_new_follower()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_name TEXT;
BEGIN
  -- Opted out
  IF EXISTS (SELECT 1 FROM public.notification_preferences
              WHERE user_id = NEW.following_id AND new_followers = FALSE) THEN
    RETURN NEW;
  END IF;

  -- Blocked in either direction
  IF EXISTS (SELECT 1 FROM public.blocks
              WHERE (blocker_id = NEW.following_id AND blocked_id = NEW.follower_id)
                 OR (blocker_id = NEW.follower_id  AND blocked_id = NEW.following_id)) THEN
    RETURN NEW;
  END IF;

  -- Unfollow + refollow must not become a way to ping someone repeatedly.
  IF EXISTS (SELECT 1 FROM public.notifications
              WHERE user_id  = NEW.following_id
                AND type     = 'follow'
                AND actor_id = NEW.follower_id
                AND created_at > NOW() - INTERVAL '24 hours') THEN
    RETURN NEW;
  END IF;

  SELECT display_name INTO v_name FROM public.profiles WHERE id = NEW.follower_id;

  INSERT INTO public.notifications (user_id, type, title, body, data, actor_id)
  VALUES (
    NEW.following_id,
    'follow',
    COALESCE(v_name, 'Someone') || ' started following you',
    '',
    jsonb_build_object('follower_id', NEW.follower_id, 'user_id', NEW.follower_id),
    NEW.follower_id
  );
  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- A notification must never make a follow fail.
  RAISE WARNING 'notify_new_follower: % %', SQLSTATE, SQLERRM;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_notify_new_follower ON public.follows;
CREATE TRIGGER trg_notify_new_follower
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_follower();


-- ── 4. Shared fan-out ────────────────────────────────────────────────────────
-- p_audience:
--   'followers'          everyone who follows the author
--   'friend_followers'   followers who are also accepted friends (friends-only posts)
--   'followers_friends'  followers ∪ accepted friends (public live)
--   'friends'            accepted friends only (live with visibility 'followers',
--                        which RLS actually resolves through friendships)
-- p_pref       notification_preferences column that opts a recipient out.
-- p_throttle   skip anyone already told about this author, for this type,
--              within the interval (NULL = no throttle).
-- p_dedupe_key/value  skip anyone who already has a row with this data key
--              (used so a live session is announced once).
CREATE OR REPLACE FUNCTION public.fan_out_to_audience(
  p_author       UUID,
  p_audience     TEXT,
  p_type         TEXT,
  p_title        TEXT,
  p_body         TEXT,
  p_data         JSONB,
  p_pref         TEXT,
  p_throttle     INTERVAL DEFAULT NULL,
  p_dedupe_key   TEXT DEFAULT NULL,
  p_dedupe_value TEXT DEFAULT NULL
) RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_count INT;
BEGIN
  WITH followers AS (
    SELECT f.follower_id AS uid FROM public.follows f WHERE f.following_id = p_author
  ),
  friends AS (
    SELECT CASE WHEN fr.user_id = p_author THEN fr.friend_id ELSE fr.user_id END AS uid
      FROM public.friendships fr
     WHERE fr.status = 'accepted'
       AND (fr.user_id = p_author OR fr.friend_id = p_author)
  ),
  audience AS (
    SELECT uid FROM followers WHERE p_audience IN ('followers', 'followers_friends')
    UNION
    SELECT uid FROM friends   WHERE p_audience IN ('friends', 'followers_friends')
    UNION
    SELECT uid FROM followers WHERE p_audience = 'friend_followers'
                                AND uid IN (SELECT uid FROM friends)
  ),
  recipients AS (
    SELECT a.uid
      FROM audience a
      LEFT JOIN public.notification_preferences np ON np.user_id = a.uid
     WHERE a.uid IS NOT NULL
       AND a.uid <> p_author
       AND COALESCE((to_jsonb(np) ->> p_pref)::boolean, TRUE)
       AND NOT EXISTS (
         SELECT 1 FROM public.blocks b
          WHERE (b.blocker_id = a.uid    AND b.blocked_id = p_author)
             OR (b.blocker_id = p_author AND b.blocked_id = a.uid))
       AND (p_throttle IS NULL OR NOT EXISTS (
         SELECT 1 FROM public.notifications n
          WHERE n.user_id = a.uid AND n.type = p_type AND n.actor_id = p_author
            AND n.created_at > NOW() - p_throttle))
       AND (p_dedupe_key IS NULL OR NOT EXISTS (
         SELECT 1 FROM public.notifications n
          WHERE n.user_id = a.uid AND n.type = p_type AND n.actor_id = p_author
            AND n.data ->> p_dedupe_key = p_dedupe_value))
     LIMIT 5000   -- a notification storm costs more goodwill than it earns
  )
  INSERT INTO public.notifications (user_id, type, title, body, data, actor_id)
  SELECT uid, p_type, p_title, COALESCE(p_body, ''), p_data, p_author
    FROM recipients;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$fn$;


-- Internal only. Postgres grants EXECUTE to PUBLIC by default, which exposed
-- this as /rest/v1/rpc/fan_out_to_audience: anyone with the anon key could
-- send any title to any author's followers. The triggers run it as its owner
-- (SECURITY DEFINER), so revoking from API roles does not affect them.
REVOKE ALL ON FUNCTION public.fan_out_to_audience(UUID, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, INTERVAL, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;


-- ── 5. "X shared a new post" ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_followers_new_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_name     TEXT;
  v_audience TEXT;
  v_title    TEXT;
BEGIN
  -- Reposts and deleted rows are not new content.
  IF COALESCE(NEW.is_deleted, FALSE) OR NEW.original_post_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  v_audience := CASE NEW.visibility
    WHEN 'public'  THEN 'followers'
    WHEN 'friends' THEN 'friend_followers'   -- never tell someone about a post they cannot open
    ELSE NULL
  END;
  IF v_audience IS NULL THEN RETURN NEW; END IF;

  SELECT display_name INTO v_name FROM public.profiles WHERE id = NEW.user_id;
  v_name := COALESCE(v_name, 'Someone');

  v_title := v_name || CASE
    WHEN NEW.video_url IS NOT NULL THEN ' posted a new video'
    WHEN NEW.image_url IS NOT NULL THEN ' shared a new photo'
    ELSE ' shared a new post'
  END;

  PERFORM public.fan_out_to_audience(
    NEW.user_id, v_audience, 'new_post', v_title,
    LEFT(public.strip_mention_markup(NEW.content), 100),
    jsonb_build_object('post_id', NEW.id, 'user_id', NEW.user_id),
    'followed_posts',
    INTERVAL '3 hours'   -- one alert per author per 3h, however often they post
  );
  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- A notification must never make a post fail.
  RAISE WARNING 'notify_followers_new_post: % %', SQLSTATE, SQLERRM;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_notify_followers_new_post ON public.posts;
CREATE TRIGGER trg_notify_followers_new_post
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.notify_followers_new_post();


-- ── 6. "X posted a new reel" ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_followers_new_reel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_name TEXT;
BEGIN
  IF NEW.visibility <> 'public'
     OR COALESCE(NEW.status, 'active') <> 'active'
     OR COALESCE(NEW.moderation_status, 'clean') NOT IN ('clean', 'pending') THEN
    RETURN NEW;
  END IF;

  SELECT display_name INTO v_name FROM public.profiles WHERE id = NEW.creator_id;

  PERFORM public.fan_out_to_audience(
    NEW.creator_id, 'followers', 'new_post',
    COALESCE(v_name, 'Someone') || ' posted a new reel',
    LEFT(COALESCE(NEW.caption, ''), 100),
    jsonb_build_object('reel_id', NEW.id, 'user_id', NEW.creator_id),
    'followed_posts',
    INTERVAL '3 hours'   -- shares the post throttle: same author, same type
  );
  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_followers_new_reel: % %', SQLSTATE, SQLERRM;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_notify_followers_new_reel ON public.reels;
CREATE TRIGGER trg_notify_followers_new_reel
  AFTER INSERT ON public.reels
  FOR EACH ROW EXECUTE FUNCTION public.notify_followers_new_reel();


-- ── 7. "X is live" — from any client ─────────────────────────────────────────
-- Replaces the website-only /api/live/notify fan-out (which reached friends
-- only, and was never called by the app). Same row shape as before, so the
-- clients' existing live_started handling keeps working.
CREATE OR REPLACE FUNCTION public.notify_live_started()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_name     TEXT;
  v_audience TEXT;
BEGIN
  IF NEW.status <> 'live' THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'live' THEN RETURN NEW; END IF;

  v_audience := CASE NEW.visibility
    WHEN 'public'    THEN 'followers_friends'
    WHEN 'followers' THEN 'friends'   -- live_sessions_select resolves this via friendships
    ELSE NULL                         -- private: nobody may open it
  END;
  IF v_audience IS NULL THEN RETURN NEW; END IF;

  SELECT display_name INTO v_name FROM public.profiles WHERE id = NEW.host_id;

  PERFORM public.fan_out_to_audience(
    NEW.host_id, v_audience, 'announcement',
    COALESCE(v_name, 'Someone') || ' is live',
    CASE WHEN NEW.title IS NOT NULL AND NEW.title <> 'Live' THEN NEW.title ELSE 'Tap to watch' END,
    jsonb_build_object(
      'kind',       'live_started',
      'session_id', NEW.id,
      'user_id',    NEW.host_id,
      'link',       '/live/' || NEW.id,
      'deep_link',  '/social/live?id=' || NEW.id
    ),
    'followed_live',
    NULL,
    'session_id', NEW.id::text   -- a session is announced once, even across host rejoins
  );
  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Never let a notification problem keep a broadcast from starting.
  RAISE WARNING 'notify_live_started: % %', SQLSTATE, SQLERRM;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_notify_live_started ON public.live_sessions;
CREATE TRIGGER trg_notify_live_started
  AFTER INSERT OR UPDATE OF status ON public.live_sessions
  FOR EACH ROW EXECUTE FUNCTION public.notify_live_started();


-- ── 8. Verify ────────────────────────────────────────────────────────────────
--   SELECT tgname, tgrelid::regclass FROM pg_trigger
--    WHERE tgname IN ('trg_notify_new_follower','trg_notify_followers_new_post',
--                     'trg_notify_followers_new_reel','trg_notify_live_started');
--
--   SELECT type, title, created_at FROM public.notifications
--    WHERE type IN ('follow','new_post')
--       OR data ->> 'kind' = 'live_started'
--    ORDER BY created_at DESC LIMIT 20;
