-- =============================================================================
-- Align — Product Analytics (Phase 5): content, social graph, dating, safety
-- =============================================================================
-- Everything in this file reads tables that ALREADY EXIST and are ALREADY being
-- written to. No new instrumentation is required for any of it — these are the
-- reporting functions that were never built on top of data you already collect:
--
--   posts / post_comments / post_reactions / post_impressions
--   reels / reel_views / reel_likes / reel_saves / reel_comments
--   stories / story_views / profile_views
--   follows / friendships / messages / conversations
--   dating_likes / dating_passes / dating_matches
--   reports / reel_reports / blocks / photo_verifications
--
-- Every function is plpgsql (not sql) ON PURPOSE: plpgsql bodies are not
-- name-resolved at CREATE time, so this migration still applies cleanly even if
-- one of the optional tables above is absent in your project. Each function
-- traps undefined_table and returns an empty result instead of erroring the
-- whole dashboard.
--
-- Idempotent + safe to re-run. Run in the Supabase SQL editor.
-- =============================================================================


-- ═════════════════════════════════════════════════════════════════════════════
-- 1. CONTENT & FEED HEALTH
-- ═════════════════════════════════════════════════════════════════════════════

-- Headline content supply + demand numbers for a range.
--   creator_ratio = share of active members who produced anything (1/9/90 rule)
--   engagement_rate = (reactions + comments) / impressions
CREATE OR REPLACE FUNCTION public.analytics_content_metrics(range_days INT DEFAULT 7)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since        TIMESTAMPTZ := NOW() - (range_days || ' days')::INTERVAL;
  v_posts      BIGINT := 0;
  v_comments   BIGINT := 0;
  v_reactions  BIGINT := 0;
  v_reels      BIGINT := 0;
  v_stories    BIGINT := 0;
  v_impr       BIGINT := 0;
  v_reach      BIGINT := 0;
  v_creators   BIGINT := 0;
  v_actives    BIGINT := 0;
  v_mix        jsonb  := '[]'::jsonb;
  v_zero_eng   BIGINT := 0;
BEGIN
  SELECT COUNT(*) INTO v_posts
    FROM public.posts WHERE created_at >= since AND is_deleted = FALSE;

  SELECT COUNT(*) INTO v_comments
    FROM public.post_comments WHERE created_at >= since AND is_deleted = FALSE;

  SELECT COUNT(*) INTO v_reactions
    FROM public.post_reactions WHERE created_at >= since;

  BEGIN
    SELECT COUNT(*) INTO v_reels FROM public.reels WHERE created_at >= since;
  EXCEPTION WHEN undefined_table THEN v_reels := 0; END;

  BEGIN
    SELECT COUNT(*) INTO v_stories FROM public.stories WHERE created_at >= since;
  EXCEPTION WHEN undefined_table THEN v_stories := 0; END;

  -- Impressions = total times shown; reach = distinct people who saw anything.
  BEGIN
    SELECT COALESCE(SUM(seen_count), 0), COUNT(DISTINCT user_id)
      INTO v_impr, v_reach
      FROM public.post_impressions WHERE last_seen_at >= since;
  EXCEPTION WHEN undefined_table THEN v_impr := 0; v_reach := 0; END;

  -- Creator ratio: distinct people who posted / commented / reacted.
  SELECT COUNT(*) INTO v_creators FROM (
    SELECT user_id FROM public.posts          WHERE created_at >= since AND is_deleted = FALSE
    UNION
    SELECT user_id FROM public.post_comments  WHERE created_at >= since AND is_deleted = FALSE
    UNION
    SELECT user_id FROM public.post_reactions WHERE created_at >= since
  ) c;

  BEGIN
    SELECT COUNT(DISTINCT COALESCE(user_id::text, anon_id)) INTO v_actives
      FROM public.analytics_sessions WHERE started_at >= since;
  EXCEPTION WHEN undefined_table THEN v_actives := 0; END;

  -- Content mix by post type.
  SELECT COALESCE(jsonb_agg(jsonb_build_object('type', t, 'count', n) ORDER BY n DESC), '[]'::jsonb)
    INTO v_mix
    FROM (
      SELECT type AS t, COUNT(*) AS n
        FROM public.posts
       WHERE created_at >= since AND is_deleted = FALSE
       GROUP BY type
    ) m;

  -- Posts that got shown but earned nothing — the feed's dead weight.
  BEGIN
    SELECT COUNT(*) INTO v_zero_eng
      FROM public.posts p
     WHERE p.created_at >= since AND p.is_deleted = FALSE
       AND NOT EXISTS (SELECT 1 FROM public.post_reactions r WHERE r.post_id = p.id)
       AND NOT EXISTS (SELECT 1 FROM public.post_comments  c WHERE c.post_id = p.id AND c.is_deleted = FALSE);
  EXCEPTION WHEN undefined_table THEN v_zero_eng := 0; END;

  RETURN jsonb_build_object(
    'range_days',        range_days,
    'posts',             v_posts,
    'comments',          v_comments,
    'reactions',         v_reactions,
    'reels',             v_reels,
    'stories',           v_stories,
    'impressions',       v_impr,
    'reach',             v_reach,
    'creators',          v_creators,
    'active_users',      v_actives,
    'creator_ratio_pct', CASE WHEN v_actives > 0 THEN ROUND(v_creators::numeric * 100 / v_actives, 1) ELSE NULL END,
    'engagement_rate_pct', CASE WHEN v_impr > 0 THEN ROUND((v_reactions + v_comments)::numeric * 100 / v_impr, 2) ELSE NULL END,
    'impressions_per_reach', CASE WHEN v_reach > 0 THEN ROUND(v_impr::numeric / v_reach, 2) ELSE NULL END,
    'zero_engagement_posts', v_zero_eng,
    'zero_engagement_pct', CASE WHEN v_posts > 0 THEN ROUND(v_zero_eng::numeric * 100 / v_posts, 1) ELSE NULL END,
    'content_mix',       v_mix
  );
EXCEPTION WHEN undefined_table THEN
  RETURN jsonb_build_object('error', 'missing_tables');
END;
$$;


-- Top posts by engagement for the range — the "what worked" list.
CREATE OR REPLACE FUNCTION public.analytics_top_posts(range_days INT DEFAULT 7, lim INT DEFAULT 20)
RETURNS TABLE (
  post_id        UUID,
  author_id      UUID,
  author_name    TEXT,
  post_type      TEXT,
  preview        TEXT,
  created_at     TIMESTAMPTZ,
  impressions    BIGINT,
  reach          BIGINT,
  reactions      BIGINT,
  comments       BIGINT,
  engagement_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since TIMESTAMPTZ := NOW() - (range_days || ' days')::INTERVAL;
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    COALESCE(pr.display_name, '')::TEXT,
    p.type::TEXT,
    LEFT(COALESCE(p.content, ''), 90)::TEXT,
    p.created_at,
    COALESCE(i.impr, 0)::BIGINT,
    COALESCE(i.reach, 0)::BIGINT,
    COALESCE(rx.n, 0)::BIGINT,
    COALESCE(cm.n, 0)::BIGINT,
    CASE WHEN COALESCE(i.impr, 0) > 0
         THEN ROUND((COALESCE(rx.n,0) + COALESCE(cm.n,0))::numeric * 100 / i.impr, 2)
         ELSE NULL END
  FROM public.posts p
  LEFT JOIN public.profiles pr ON pr.id = p.user_id
  LEFT JOIN LATERAL (
    SELECT SUM(seen_count) AS impr, COUNT(*) AS reach
      FROM public.post_impressions WHERE post_id = p.id
  ) i ON TRUE
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS n FROM public.post_reactions WHERE post_id = p.id
  ) rx ON TRUE
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS n FROM public.post_comments WHERE post_id = p.id AND is_deleted = FALSE
  ) cm ON TRUE
  WHERE p.created_at >= since AND p.is_deleted = FALSE
  ORDER BY (COALESCE(rx.n,0) + COALESCE(cm.n,0)) DESC, p.created_at DESC
  LIMIT lim;
EXCEPTION WHEN undefined_table THEN RETURN;
END;
$$;


-- Creator-side health: do people who post once post again, and how long do they
-- wait for their first reaction? Time-to-first-engagement is the number that
-- decides whether a new creator ever comes back.
CREATE OR REPLACE FUNCTION public.analytics_creator_health(range_days INT DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since       TIMESTAMPTZ := NOW() - (range_days || ' days')::INTERVAL;
  v_creators  BIGINT := 0;
  v_repeat    BIGINT := 0;
  v_first_ttf NUMERIC;
  v_never     BIGINT := 0;
  v_top       jsonb := '[]'::jsonb;
BEGIN
  -- Creators in range, and how many posted on 2+ distinct days.
  WITH days AS (
    SELECT user_id, COUNT(DISTINCT created_at::date) AS d
      FROM public.posts
     WHERE created_at >= since AND is_deleted = FALSE
     GROUP BY user_id
  )
  SELECT COUNT(*), COUNT(*) FILTER (WHERE d >= 2) INTO v_creators, v_repeat FROM days;

  -- Median minutes from post creation to its first reaction or comment.
  WITH firsts AS (
    SELECT p.id,
           LEAST(
             COALESCE((SELECT MIN(created_at) FROM public.post_reactions WHERE post_id = p.id), 'infinity'::timestamptz),
             COALESCE((SELECT MIN(created_at) FROM public.post_comments  WHERE post_id = p.id AND is_deleted = FALSE), 'infinity'::timestamptz)
           ) AS first_eng,
           p.created_at
      FROM public.posts p
     WHERE p.created_at >= since AND p.is_deleted = FALSE
  )
  SELECT
    PERCENTILE_CONT(0.5) WITHIN GROUP (
      ORDER BY EXTRACT(EPOCH FROM (first_eng - created_at)) / 60
    ) FILTER (WHERE first_eng <> 'infinity'::timestamptz),
    COUNT(*) FILTER (WHERE first_eng = 'infinity'::timestamptz)
  INTO v_first_ttf, v_never
  FROM firsts;

  -- Top creators by engagement earned.
  SELECT COALESCE(jsonb_agg(x ORDER BY (x->>'engagement')::bigint DESC), '[]'::jsonb) INTO v_top
  FROM (
    SELECT jsonb_build_object(
             'user_id', p.user_id,
             'name', COALESCE(pr.display_name, ''),
             'posts', COUNT(DISTINCT p.id),
             'engagement', COUNT(DISTINCT rx.id) + COUNT(DISTINCT cm.id)
           ) AS x
      FROM public.posts p
      LEFT JOIN public.profiles pr ON pr.id = p.user_id
      LEFT JOIN public.post_reactions rx ON rx.post_id = p.id
      LEFT JOIN public.post_comments  cm ON cm.post_id = p.id AND cm.is_deleted = FALSE
     WHERE p.created_at >= since AND p.is_deleted = FALSE
     GROUP BY p.user_id, pr.display_name
     ORDER BY 1 DESC
     LIMIT 15
  ) t;

  RETURN jsonb_build_object(
    'range_days',              range_days,
    'creators',                v_creators,
    'repeat_creators',         v_repeat,
    'creator_retention_pct',   CASE WHEN v_creators > 0 THEN ROUND(v_repeat::numeric * 100 / v_creators, 1) ELSE NULL END,
    'median_minutes_to_first_engagement', ROUND(COALESCE(v_first_ttf, 0)),
    'posts_never_engaged',     v_never,
    'top_creators',            v_top
  );
EXCEPTION WHEN undefined_table THEN
  RETURN jsonb_build_object('error', 'missing_tables');
END;
$$;


-- Feed ranking health. This is the telemetry the ranking rewrite never had:
-- is one author dominating what people see, and are we re-showing the same
-- posts instead of finding new ones?
CREATE OR REPLACE FUNCTION public.analytics_feed_quality(range_days INT DEFAULT 7)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since        TIMESTAMPTZ := NOW() - (range_days || ' days')::INTERVAL;
  v_top_share  NUMERIC;
  v_top3_share NUMERIC;
  v_authors    BIGINT := 0;
  v_reshow     NUMERIC;
  v_distinct   NUMERIC;
  v_viewers    BIGINT := 0;
BEGIN
  -- Author concentration: what share of impressions went to the most-shown
  -- author, and to the top 3? A high number means the feed is a monoculture.
  WITH by_author AS (
    SELECT p.user_id, SUM(i.seen_count) AS impr
      FROM public.post_impressions i
      JOIN public.posts p ON p.id = i.post_id
     WHERE i.last_seen_at >= since
     GROUP BY p.user_id
  ), ranked AS (
    SELECT impr, ROW_NUMBER() OVER (ORDER BY impr DESC) AS rn, SUM(impr) OVER () AS total
      FROM by_author
  )
  SELECT
    (SELECT COUNT(*) FROM by_author),
    MAX(CASE WHEN rn = 1  AND total > 0 THEN ROUND(impr::numeric * 100 / total, 1) END),
    CASE WHEN MAX(total) > 0
         THEN ROUND(SUM(impr) FILTER (WHERE rn <= 3)::numeric * 100 / MAX(total), 1) END
  INTO v_authors, v_top_share, v_top3_share
  FROM ranked;

  -- Re-show rate: on average, how many times was the same post shown to the
  -- same person, and how many distinct posts did a person actually see?
  SELECT ROUND(AVG(seen_count), 2) INTO v_reshow
    FROM public.post_impressions WHERE last_seen_at >= since;

  SELECT ROUND(AVG(n), 1), COUNT(*) INTO v_distinct, v_viewers
    FROM (
      SELECT user_id, COUNT(DISTINCT post_id) AS n
        FROM public.post_impressions
       WHERE last_seen_at >= since
       GROUP BY user_id
    ) s;

  RETURN jsonb_build_object(
    'range_days',              range_days,
    'authors_shown',           v_authors,
    'viewers',                 v_viewers,
    'top_author_impression_share_pct', v_top_share,
    'top3_author_impression_share_pct', v_top3_share,
    'avg_reshow_per_post',     v_reshow,
    'avg_distinct_posts_seen', v_distinct
  );
EXCEPTION WHEN undefined_table THEN
  RETURN jsonb_build_object('error', 'missing_tables');
END;
$$;


-- Reels: supply, views, and the engagement signals that actually rank video.
-- Watch-time / completion come from analytics_events once the player emits
-- reel_progress (Phase 1 instrumentation); everything else is available now.
CREATE OR REPLACE FUNCTION public.analytics_reel_metrics(range_days INT DEFAULT 7)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since      TIMESTAMPTZ := NOW() - (range_days || ' days')::INTERVAL;
  v_reels    BIGINT := 0;
  v_views    BIGINT := 0;
  v_viewers  BIGINT := 0;
  v_likes    BIGINT := 0;
  v_saves    BIGINT := 0;
  v_comments BIGINT := 0;
  v_complete NUMERIC;
  v_skip     NUMERIC;
  v_watch    NUMERIC;
BEGIN
  SELECT COUNT(*) INTO v_reels FROM public.reels WHERE created_at >= since AND status = 'active';
  SELECT COUNT(*), COUNT(DISTINCT user_id) INTO v_views, v_viewers
    FROM public.reel_views WHERE watched_at >= since;
  SELECT COUNT(*) INTO v_likes    FROM public.reel_likes    WHERE created_at >= since;
  SELECT COUNT(*) INTO v_saves    FROM public.reel_saves    WHERE created_at >= since;
  BEGIN
    SELECT COUNT(*) INTO v_comments FROM public.reel_comments WHERE created_at >= since;
  EXCEPTION WHEN undefined_table THEN v_comments := 0; END;

  -- Watch-time metrics from emitted player events (null until instrumented).
  BEGIN
    SELECT
      ROUND(AVG((event_data->>'percent')::numeric), 1),
      ROUND(100.0 * COUNT(*) FILTER (WHERE (event_data->>'percent')::numeric >= 95) / NULLIF(COUNT(*), 0), 1),
      ROUND(100.0 * COUNT(*) FILTER (WHERE (event_data->>'seconds')::numeric < 3) / NULLIF(COUNT(*), 0), 1)
    INTO v_watch, v_complete, v_skip
    FROM public.analytics_events
    WHERE event_name = 'reel_progress'
      AND created_at >= since
      AND event_data ? 'percent';
  EXCEPTION WHEN undefined_table THEN NULL; END;

  RETURN jsonb_build_object(
    'range_days',        range_days,
    'reels_created',     v_reels,
    'views',             v_views,
    'unique_viewers',    v_viewers,
    'likes',             v_likes,
    'saves',             v_saves,
    'comments',          v_comments,
    'save_rate_pct',     CASE WHEN v_views > 0 THEN ROUND(v_saves::numeric * 100 / v_views, 2) ELSE NULL END,
    'like_rate_pct',     CASE WHEN v_views > 0 THEN ROUND(v_likes::numeric * 100 / v_views, 2) ELSE NULL END,
    'avg_watch_pct',     v_watch,
    'completion_rate_pct', v_complete,
    'skip_under_3s_pct', v_skip
  );
EXCEPTION WHEN undefined_table THEN
  RETURN jsonb_build_object('error', 'missing_tables');
END;
$$;


-- ═════════════════════════════════════════════════════════════════════════════
-- 2. SOCIAL GRAPH
-- ═════════════════════════════════════════════════════════════════════════════

-- Connection density is the single strongest retention predictor in any social
-- product. Users at zero connections almost never come back.
CREATE OR REPLACE FUNCTION public.analytics_social_graph(range_days INT DEFAULT 7)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since        TIMESTAMPTZ := NOW() - (range_days || ' days')::INTERVAL;
  v_follows    BIGINT := 0;
  v_mutual     BIGINT := 0;
  v_follows_t  BIGINT := 0;
  v_friends    BIGINT := 0;
  v_fr_pending BIGINT := 0;
  v_fr_acc     BIGINT := 0;
  v_buckets    jsonb  := '{}'::jsonb;
  v_isolated   BIGINT := 0;
  v_members    BIGINT := 0;
  v_pviews     BIGINT := 0;
  v_blocks     BIGINT := 0;
BEGIN
  SELECT COUNT(*) INTO v_follows   FROM public.follows WHERE created_at >= since;
  SELECT COUNT(*) INTO v_follows_t FROM public.follows;
  SELECT COUNT(*) INTO v_mutual
    FROM public.follows a
   WHERE EXISTS (SELECT 1 FROM public.follows b
                  WHERE b.follower_id = a.following_id AND b.following_id = a.follower_id);

  SELECT COUNT(*) FILTER (WHERE status = 'accepted'),
         COUNT(*) FILTER (WHERE status = 'pending')
    INTO v_friends, v_fr_pending
    FROM public.friendships;

  SELECT COUNT(*) INTO v_fr_acc
    FROM public.friendships WHERE status = 'accepted' AND updated_at >= since;

  SELECT COUNT(*) INTO v_members FROM public.profiles;

  -- Connections-per-user distribution (follows in either direction + friends).
  WITH conn AS (
    SELECT p.id,
           (SELECT COUNT(*) FROM public.follows f WHERE f.follower_id = p.id OR f.following_id = p.id)
         + (SELECT COUNT(*) FROM public.friendships fr
             WHERE fr.status = 'accepted' AND (fr.user_id = p.id OR fr.friend_id = p.id)) AS n
      FROM public.profiles p
  )
  SELECT jsonb_build_object(
           'zero',      COUNT(*) FILTER (WHERE n = 0),
           'one_to_3',  COUNT(*) FILTER (WHERE n BETWEEN 1 AND 3),
           'four_to_10',COUNT(*) FILTER (WHERE n BETWEEN 4 AND 10),
           'over_10',   COUNT(*) FILTER (WHERE n > 10),
           'median',    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY n)
         ),
         COUNT(*) FILTER (WHERE n = 0)
    INTO v_buckets, v_isolated
    FROM conn;

  BEGIN
    SELECT COUNT(*) INTO v_pviews FROM public.profile_views WHERE viewed_at >= since;
  EXCEPTION WHEN undefined_table THEN v_pviews := 0; END;

  BEGIN
    SELECT COUNT(*) INTO v_blocks FROM public.blocks WHERE created_at >= since;
  EXCEPTION WHEN undefined_table THEN v_blocks := 0; END;

  RETURN jsonb_build_object(
    'range_days',          range_days,
    'follows_new',         v_follows,
    'follows_total',       v_follows_t,
    'mutual_follow_pct',   CASE WHEN v_follows_t > 0 THEN ROUND(v_mutual::numeric * 100 / v_follows_t, 1) ELSE NULL END,
    'friendships',         v_friends,
    'friend_requests_pending', v_fr_pending,
    'friendships_accepted_in_range', v_fr_acc,
    'members',             v_members,
    'isolated_users',      v_isolated,
    'isolated_pct',        CASE WHEN v_members > 0 THEN ROUND(v_isolated::numeric * 100 / v_members, 1) ELSE NULL END,
    'connection_buckets',  v_buckets,
    'profile_views',       v_pviews,
    'blocks_new',          v_blocks
  );
EXCEPTION WHEN undefined_table THEN
  RETURN jsonb_build_object('error', 'missing_tables');
END;
$$;


-- Messaging health: are conversations two-sided, and how fast do replies come?
CREATE OR REPLACE FUNCTION public.analytics_messaging(range_days INT DEFAULT 7)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since        TIMESTAMPTZ := NOW() - (range_days || ' days')::INTERVAL;
  v_msgs       BIGINT := 0;
  v_senders    BIGINT := 0;
  v_convos     BIGINT := 0;
  v_two_sided  BIGINT := 0;
  v_median_min NUMERIC;
BEGIN
  SELECT COUNT(*), COUNT(DISTINCT sender_id) INTO v_msgs, v_senders
    FROM public.messages WHERE created_at >= since AND is_deleted = FALSE;

  -- Conversations that saw any traffic, and how many had 2+ distinct senders.
  WITH active AS (
    SELECT conversation_id, COUNT(DISTINCT sender_id) AS senders
      FROM public.messages
     WHERE created_at >= since AND is_deleted = FALSE
     GROUP BY conversation_id
  )
  SELECT COUNT(*), COUNT(*) FILTER (WHERE senders >= 2) INTO v_convos, v_two_sided FROM active;

  -- Median minutes between a conversation's first message and the first reply
  -- from a different person.
  WITH firsts AS (
    SELECT m.conversation_id,
           MIN(m.created_at) AS opened_at,
           (SELECT MIN(m2.created_at)
              FROM public.messages m2
             WHERE m2.conversation_id = m.conversation_id
               AND m2.sender_id <> (SELECT m3.sender_id FROM public.messages m3
                                     WHERE m3.conversation_id = m.conversation_id
                                     ORDER BY m3.created_at ASC LIMIT 1)) AS replied_at
      FROM public.messages m
     WHERE m.created_at >= since AND m.is_deleted = FALSE
     GROUP BY m.conversation_id
  )
  SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (
           ORDER BY EXTRACT(EPOCH FROM (replied_at - opened_at)) / 60
         ) INTO v_median_min
    FROM firsts WHERE replied_at IS NOT NULL AND replied_at > opened_at;

  RETURN jsonb_build_object(
    'range_days',        range_days,
    'messages',          v_msgs,
    'senders',           v_senders,
    'conversations_active', v_convos,
    'two_sided',         v_two_sided,
    'reply_rate_pct',    CASE WHEN v_convos > 0 THEN ROUND(v_two_sided::numeric * 100 / v_convos, 1) ELSE NULL END,
    'median_minutes_to_reply', ROUND(COALESCE(v_median_min, 0))
  );
EXCEPTION WHEN undefined_table THEN
  RETURN jsonb_build_object('error', 'missing_tables');
END;
$$;


-- ═════════════════════════════════════════════════════════════════════════════
-- 3. DATING FUNNEL
-- ═════════════════════════════════════════════════════════════════════════════

-- Full funnel plus marketplace balance. Every dating product dies of imbalance
-- before it dies of anything else — one side over-likes, the other drowns.
CREATE OR REPLACE FUNCTION public.analytics_dating_funnel(range_days INT DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since      TIMESTAMPTZ := NOW() - (range_days || ' days')::INTERVAL;
  v_enabled  BIGINT := 0;
  v_likes    BIGINT := 0;
  v_roses    BIGINT := 0;
  v_passes   BIGINT := 0;
  v_likers   BIGINT := 0;
  v_matches  BIGINT := 0;
  v_msgd     BIGINT := 0;
  v_sustain  BIGINT := 0;
  v_unmatch  BIGINT := 0;
  v_top_recv NUMERIC;
  v_verified BIGINT := 0;
BEGIN
  SELECT COUNT(*) INTO v_enabled FROM public.profiles WHERE dating_enabled = TRUE;

  SELECT COUNT(*),
         COUNT(*) FILTER (WHERE like_type = 'cosmic_rose'),
         COUNT(DISTINCT liker_id)
    INTO v_likes, v_roses, v_likers
    FROM public.dating_likes WHERE created_at >= since;

  SELECT COUNT(*) INTO v_passes FROM public.dating_passes WHERE created_at >= since;

  SELECT COUNT(*) FILTER (WHERE matched_at >= since),
         COUNT(*) FILTER (WHERE status = 'unmatched' AND updated_at >= since)
    INTO v_matches, v_unmatch
    FROM public.dating_matches;

  -- Matches that produced any message, and matches that produced a real
  -- conversation (5+ messages) — the only honest test of match quality.
  SELECT
    COUNT(*) FILTER (WHERE mc.n >= 1),
    COUNT(*) FILTER (WHERE mc.n >= 5)
  INTO v_msgd, v_sustain
  FROM public.dating_matches dm
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS n FROM public.messages
     WHERE conversation_id = dm.conversation_id AND is_deleted = FALSE
  ) mc ON TRUE
  WHERE dm.matched_at >= since AND dm.conversation_id IS NOT NULL;

  -- Marketplace concentration: share of all likes received by the top 10%.
  WITH recv AS (
    SELECT liked_id, COUNT(*) AS n
      FROM public.dating_likes WHERE created_at >= since GROUP BY liked_id
  ), ranked AS (
    SELECT n, NTILE(10) OVER (ORDER BY n DESC) AS decile FROM recv
  )
  SELECT CASE WHEN SUM(n) > 0
              THEN ROUND(SUM(n) FILTER (WHERE decile = 1)::numeric * 100 / SUM(n), 1)
              ELSE NULL END
    INTO v_top_recv FROM ranked;

  BEGIN
    SELECT COUNT(*) INTO v_verified FROM public.profiles WHERE photo_verified = TRUE;
  EXCEPTION WHEN undefined_column THEN v_verified := 0; END;

  RETURN jsonb_build_object(
    'range_days',       range_days,
    'dating_enabled',   v_enabled,
    'likes',            v_likes,
    'cosmic_roses',     v_roses,
    'passes',           v_passes,
    'active_likers',    v_likers,
    'like_rate_pct',    CASE WHEN (v_likes + v_passes) > 0 THEN ROUND(v_likes::numeric * 100 / (v_likes + v_passes), 1) ELSE NULL END,
    'matches',          v_matches,
    'match_rate_pct',   CASE WHEN v_likes > 0 THEN ROUND(v_matches::numeric * 100 / v_likes, 1) ELSE NULL END,
    'matches_messaged', v_msgd,
    'matches_sustained',v_sustain,
    'sustained_pct',    CASE WHEN v_matches > 0 THEN ROUND(v_sustain::numeric * 100 / v_matches, 1) ELSE NULL END,
    'unmatches',        v_unmatch,
    'top_decile_like_share_pct', v_top_recv,
    'photo_verified',   v_verified
  );
EXCEPTION WHEN undefined_table THEN
  RETURN jsonb_build_object('error', 'missing_tables');
END;
$$;


-- ═════════════════════════════════════════════════════════════════════════════
-- 4. TRUST & SAFETY
-- ═════════════════════════════════════════════════════════════════════════════

-- Queue depth, SLA, and the integrity signals a platform is expected to watch.
-- Reports currently live in three separate tables; this unions them.
CREATE OR REPLACE FUNCTION public.analytics_safety_metrics(range_days INT DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since        TIMESTAMPTZ := NOW() - (range_days || ' days')::INTERVAL;
  v_open       BIGINT := 0;
  v_new        BIGINT := 0;
  v_resolved   BIGINT := 0;
  v_oldest_h   NUMERIC;
  v_median_h   NUMERIC;
  v_by_cat     jsonb := '[]'::jsonb;
  v_blocks     BIGINT := 0;
  v_repeat     BIGINT := 0;
  v_pv_pending BIGINT := 0;
  v_pv_appr    NUMERIC;
  v_under18    BIGINT := 0;
  v_under13    BIGINT := 0;
  v_bans       BIGINT := 0;
BEGIN
  -- All three report tables unioned into one queue. "Open" spans both status
  -- vocabularies in use: reports uses reviewing, reel/community use reviewed.
  WITH rq AS (
    SELECT 'user'::text AS src, reported_user_id AS target, category AS cat,
           status, created_at, resolved_at
      FROM public.reports
    UNION ALL
    SELECT 'reel', NULL::uuid, reason, status, created_at, resolved_at
      FROM public.reel_reports
    UNION ALL
    SELECT 'community', reported_user_id, reason, status, created_at, resolved_at
      FROM public.community_reports
  )
  SELECT
    COUNT(*) FILTER (WHERE status IN ('pending', 'reviewing', 'reviewed')),
    COUNT(*) FILTER (WHERE created_at >= since),
    COUNT(*) FILTER (WHERE resolved_at >= since),
    ROUND(MAX(EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600)
          FILTER (WHERE status IN ('pending', 'reviewing', 'reviewed'))),
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (
      ORDER BY EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600
    ) FILTER (WHERE resolved_at IS NOT NULL)),
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('category', c, 'count', n) ORDER BY n DESC)
         FROM (SELECT COALESCE(cat, 'unspecified') AS c, COUNT(*) AS n
                 FROM rq WHERE created_at >= since GROUP BY 1) x),
      '[]'::jsonb),
    (SELECT COUNT(*) FROM (
        SELECT target FROM rq
         WHERE target IS NOT NULL AND created_at >= since
         GROUP BY target HAVING COUNT(*) > 1) r)
  INTO v_open, v_new, v_resolved, v_oldest_h, v_median_h, v_by_cat, v_repeat
  FROM rq;

  BEGIN
    SELECT COUNT(*) INTO v_bans FROM public.community_bans WHERE created_at >= since;
  EXCEPTION WHEN undefined_table THEN v_bans := 0; END;

  BEGIN
    SELECT COUNT(*) INTO v_blocks FROM public.blocks WHERE created_at >= since;
  EXCEPTION WHEN undefined_table THEN v_blocks := 0; END;

  BEGIN
    SELECT COUNT(*) FILTER (WHERE status = 'pending'),
           ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'approved')
                 / NULLIF(COUNT(*) FILTER (WHERE status <> 'pending'), 0), 1)
      INTO v_pv_pending, v_pv_appr
      FROM public.photo_verifications;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  -- Age signals. You collect birth dates, so this is exact rather than inferred.
  SELECT COUNT(*) FILTER (WHERE birth_date > CURRENT_DATE - INTERVAL '18 years'),
         COUNT(*) FILTER (WHERE birth_date > CURRENT_DATE - INTERVAL '13 years')
    INTO v_under18, v_under13
    FROM public.profiles WHERE birth_date IS NOT NULL;

  RETURN jsonb_build_object(
    'range_days',          range_days,
    'reports_open',        v_open,
    'reports_new',         v_new,
    'reports_resolved',    v_resolved,
    'oldest_open_hours',   v_oldest_h,
    'median_resolution_hours', v_median_h,
    'reports_by_category', v_by_cat,
    'repeat_offenders',    v_repeat,
    'blocks_new',          v_blocks,
    'bans_new',            v_bans,
    'photo_verifications_pending', v_pv_pending,
    'photo_verification_approval_pct', v_pv_appr,
    'accounts_under_18',   v_under18,
    'accounts_under_13',   v_under13
  );
EXCEPTION WHEN undefined_table THEN
  RETURN jsonb_build_object('error', 'missing_tables');
END;
$$;


-- The actual work queue: oldest unhandled reports first.
CREATE OR REPLACE FUNCTION public.analytics_reports_queue(lim INT DEFAULT 50)
RETURNS TABLE (
  source      TEXT,
  report_id   UUID,
  category    TEXT,
  status      TEXT,
  created_at  TIMESTAMPTZ,
  age_hours   NUMERIC,
  target_id   UUID,
  target_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT r.src, r.id, r.category, r.status, r.created_at,
         ROUND(EXTRACT(EPOCH FROM (NOW() - r.created_at)) / 3600, 1),
         r.target,
         COALESCE(p.display_name, '')::TEXT
  FROM (
    SELECT 'user'::TEXT AS src, id, reported_user_id AS target, category, status, created_at
      FROM public.reports WHERE status IN ('pending', 'reviewing')
    UNION ALL
    SELECT 'reel'::TEXT, id, NULL::uuid, reason, status, created_at
      FROM public.reel_reports WHERE status IN ('pending', 'reviewed')
    UNION ALL
    SELECT 'community'::TEXT, id, reported_user_id, reason, status, created_at
      FROM public.community_reports WHERE status IN ('pending', 'reviewed')
  ) r
  LEFT JOIN public.profiles p ON p.id = r.target
  ORDER BY r.created_at ASC
  LIMIT lim;
EXCEPTION WHEN undefined_table THEN RETURN;
END;
$$;


-- ═════════════════════════════════════════════════════════════════════════════
-- 5. GRANTS
-- ═════════════════════════════════════════════════════════════════════════════

GRANT EXECUTE ON FUNCTION public.analytics_content_metrics(INT)      TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_top_posts(INT, INT)       TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_creator_health(INT)       TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_feed_quality(INT)         TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_reel_metrics(INT)         TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_social_graph(INT)         TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_messaging(INT)            TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_dating_funnel(INT)        TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_safety_metrics(INT)       TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_reports_queue(INT)        TO service_role;


-- ═════════════════════════════════════════════════════════════════════════════
-- 6. SUPPORTING INDEXES
-- ═════════════════════════════════════════════════════════════════════════════
-- These functions scan by time. Without these the dashboard gets slow as the
-- tables grow. All CREATE INDEX IF NOT EXISTS — safe to re-run.

CREATE INDEX IF NOT EXISTS idx_post_reactions_created ON public.post_reactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_comments_created  ON public.post_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_impr_last_seen    ON public.post_impressions(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_created       ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_created        ON public.follows(created_at DESC);

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_reel_views_watched ON public.reel_views(watched_at DESC);
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_dating_likes_created ON public.dating_likes(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_dating_matches_at    ON public.dating_matches(matched_at DESC);
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_reports_created ON public.reports(created_at DESC);
EXCEPTION WHEN undefined_table THEN NULL; END $$;


-- ═════════════════════════════════════════════════════════════════════════════
-- 7. SMOKE TEST — run these to confirm everything applied
-- ═════════════════════════════════════════════════════════════════════════════
-- SELECT public.analytics_content_metrics(7);
-- SELECT public.analytics_creator_health(30);
-- SELECT public.analytics_feed_quality(7);
-- SELECT public.analytics_reel_metrics(7);
-- SELECT public.analytics_social_graph(7);
-- SELECT public.analytics_messaging(7);
-- SELECT public.analytics_dating_funnel(30);
-- SELECT public.analytics_safety_metrics(30);
-- SELECT * FROM public.analytics_top_posts(7, 10);
-- SELECT * FROM public.analytics_reports_queue(20);
