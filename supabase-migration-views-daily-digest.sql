-- ═════════════════════════════════════════════════════════════════════════════
-- ALIGN — "Who viewed" alerts: ONE digest per day instead of instant pings
--
-- Before: a notification fired the moment any post / video / reel / photo /
--         story crossed 5, 10, 25, 50 ... viewers, so an active creator got
--         several alerts a day.
-- After:  each person gets AT MOST ONE view alert per kind per day (posts,
--         videos, reels, photos, stories), sent every morning, summing the
--         unique people who looked in the previous 24 hours.
--
-- Nothing about the Views page, "who viewed" lists, counts or badges changes —
-- only when the notification is created. Opt-out switch is unchanged
-- (notification_preferences.view_milestones).
--
-- Safe to run more than once.
-- ═════════════════════════════════════════════════════════════════════════════


-- ── 1. Turn off the instant alert ───────────────────────────────────────────
-- The triggers still call this on every view; it now does nothing, so counts
-- and lists keep working and no per-view notification is created.
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
BEGIN
  RETURN;
END;
$fn$;
REVOKE ALL ON FUNCTION public.maybe_notify_view_milestone(UUID, TEXT, TEXT, INT, TEXT)
  FROM PUBLIC, anon, authenticated;


-- ── 2. The daily digest ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.send_daily_view_digest()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_since TIMESTAMPTZ := NOW() - INTERVAL '24 hours';
  v_sent  INT := 0;
  r       RECORD;
  v_title TEXT;
  v_n     TEXT;
BEGIN
  FOR r IN
    WITH ev AS (
      -- picture / text posts
      SELECT p.user_id AS owner, 'post'::text AS kind, pi.user_id AS viewer
        FROM public.post_impressions pi
        JOIN public.posts p ON p.id = pi.post_id
       WHERE pi.first_seen_at >= v_since AND p.video_url IS NULL
      UNION ALL
      -- video posts
      SELECT p.user_id, 'video', vv.user_id
        FROM public.post_video_views vv
        JOIN public.posts p ON p.id = vv.post_id
       WHERE vv.watched_at >= v_since
      UNION ALL
      -- reels
      SELECT rl.creator_id, 'reel', rv.user_id
        FROM public.reel_views rv
        JOIN public.reels rl ON rl.id = rv.reel_id
       WHERE rv.watched_at >= v_since
      UNION ALL
      -- profile photos
      SELECT ph.owner_id, 'photo', ph.viewer_id
        FROM public.photo_views ph
       WHERE ph.viewed_at >= v_since
      UNION ALL
      -- stories
      SELECT s.user_id, 'story', sv.viewer_id
        FROM public.story_views sv
        JOIN public.stories s ON s.id = sv.story_id
       WHERE sv.viewed_at >= v_since
    )
    SELECT e.owner, e.kind, COUNT(DISTINCT e.viewer)::int AS n
      FROM ev e
     WHERE e.owner IS NOT NULL
       AND e.viewer <> e.owner
       AND NOT EXISTS (SELECT 1 FROM public.blocks b
                        WHERE (b.blocker_id = e.owner AND b.blocked_id = e.viewer)
                           OR (b.blocker_id = e.viewer AND b.blocked_id = e.owner))
       AND NOT EXISTS (SELECT 1 FROM public.notification_preferences np
                        WHERE np.user_id = e.owner AND np.view_milestones = FALSE)
       -- idempotent: never a second digest of the same kind within ~a day
       AND NOT EXISTS (SELECT 1 FROM public.notifications n2
                        WHERE n2.user_id = e.owner
                          AND n2.type = 'view_milestone'
                          AND n2.data->>'digest' = 'true'
                          AND n2.data->>'kind' = e.kind
                          AND n2.created_at >= NOW() - INTERVAL '20 hours')
     GROUP BY e.owner, e.kind
    HAVING COUNT(DISTINCT e.viewer) > 0
  LOOP
    v_n := to_char(r.n, 'FM999,999,999');
    v_title := CASE r.kind
      WHEN 'post'  THEN '👀 ' || v_n || CASE WHEN r.n = 1 THEN ' person' ELSE ' people' END || ' saw your posts yesterday'
      WHEN 'video' THEN '🎬 ' || v_n || CASE WHEN r.n = 1 THEN ' person' ELSE ' people' END || ' watched your videos yesterday'
      WHEN 'reel'  THEN '🎬 ' || v_n || CASE WHEN r.n = 1 THEN ' person' ELSE ' people' END || ' watched your reels yesterday'
      WHEN 'photo' THEN '📸 ' || v_n || CASE WHEN r.n = 1 THEN ' person' ELSE ' people' END || ' viewed your photos yesterday'
      WHEN 'story' THEN '👀 ' || v_n || CASE WHEN r.n = 1 THEN ' person' ELSE ' people' END || ' saw your stories yesterday'
      ELSE '👀 ' || v_n || ' views yesterday'
    END;

    BEGIN
      INSERT INTO public.notifications (user_id, type, title, body, data)
      VALUES (r.owner, 'view_milestone', v_title,
              'Tap to see who has been looking.',
              jsonb_build_object('kind', r.kind, 'count', r.n, 'digest', 'true'));
      v_sent := v_sent + 1;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'send_daily_view_digest (% %): % %', r.owner, r.kind, SQLSTATE, SQLERRM;
    END;
  END LOOP;

  RETURN v_sent;
END;
$fn$;
-- Cron / service role only — never callable through /rest/v1/rpc.
REVOKE ALL ON FUNCTION public.send_daily_view_digest() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.send_daily_view_digest() TO service_role;


-- ── 3. Schedule: every day at 09:00 UTC ─────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_cron;
DO $$
BEGIN
  PERFORM cron.unschedule('align-daily-view-digest')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'align-daily-view-digest');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
SELECT cron.schedule('align-daily-view-digest', '0 9 * * *',
  $$ SELECT public.send_daily_view_digest(); $$);
