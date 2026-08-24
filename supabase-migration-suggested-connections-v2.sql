-- =============================================================================
-- Align — Suggested Connections v2: use a real activity signal
-- =============================================================================
-- v1 read recency from analytics_sessions. Verified against live data, that
-- signal is far too thin to be useful:
--
--     analytics_sessions rows with user_id, last 60d : 864
--     profiles.last_seen within 60d                  : 422 of 771 members
--     profiles.last_seen populated                   : 771 of 771 (100%)
--
-- analytics_sessions only began collecting on 2026-08-03, and mobile events
-- only start flowing once build 670 reaches devices — so essentially nobody
-- registered as "active" and the +10 recency bonus never fired. Every one of
-- the founder's top ten suggestions came back is_active = false.
--
-- profiles.last_seen has been maintained by the app all along and covers every
-- member, so it is strictly the better source here.
--
-- Also widens the reason string to mention recency where nothing more
-- compelling is true, and adds a `last_seen` column so clients can show it.
--
-- Idempotent + safe to re-run. Run in the Supabase SQL editor.
-- =============================================================================

DROP FUNCTION IF EXISTS public.suggested_connections(UUID, INT);

CREATE OR REPLACE FUNCTION public.suggested_connections(
  p_user_id UUID,
  p_limit   INT DEFAULT 20
)
RETURNS TABLE (
  user_id        UUID,
  display_name   TEXT,
  username       TEXT,
  avatar_url     TEXT,
  sun_sign       TEXT,
  mutual_count   INT,
  compatibility  SMALLINT,
  affinity       INT,
  is_active      BOOLEAN,
  last_seen      TIMESTAMPTZ,
  score          NUMERIC,
  reason         TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH me AS (
    SELECT * FROM public.user_big_five WHERE user_big_five.user_id = p_user_id
  ),
  my_graph AS (
    SELECT f.friend_id AS other FROM public.friendships f
     WHERE f.user_id = p_user_id AND f.status = 'accepted'
    UNION
    SELECT f.user_id FROM public.friendships f
     WHERE f.friend_id = p_user_id AND f.status = 'accepted'
    UNION
    SELECT fo.following_id FROM public.follows fo WHERE fo.follower_id = p_user_id
  ),
  excluded AS (
    SELECT other FROM my_graph
    UNION SELECT p_user_id
    UNION SELECT f.friend_id FROM public.friendships f
           WHERE f.user_id = p_user_id AND f.status IN ('pending', 'declined', 'removed')
    UNION SELECT f.user_id FROM public.friendships f
           WHERE f.friend_id = p_user_id AND f.status IN ('pending', 'declined', 'removed')
    UNION SELECT b.blocked_id FROM public.blocks b WHERE b.blocker_id = p_user_id
    UNION SELECT b.blocker_id FROM public.blocks b WHERE b.blocked_id = p_user_id
  ),
  mutuals AS (
    SELECT x.other AS cand, COUNT(*)::INT AS n
    FROM my_graph g
    JOIN LATERAL (
      SELECT f.friend_id AS other FROM public.friendships f
       WHERE f.user_id = g.other AND f.status = 'accepted'
      UNION
      SELECT f.user_id FROM public.friendships f
       WHERE f.friend_id = g.other AND f.status = 'accepted'
      UNION
      SELECT fo.following_id FROM public.follows fo WHERE fo.follower_id = g.other
    ) x ON TRUE
    WHERE x.other IS NOT NULL
    GROUP BY x.other
  ),
  candidates AS (
    SELECT
      p.id,
      p.display_name,
      p.username,
      p.avatar_url,
      p.last_seen,
      COALESCE(mu.n, 0) AS mutual_n,
      (SELECT cm.overall_score FROM public.cosmic_matches cm
        WHERE cm.status = 'ready'
          AND cm.user_a_id = LEAST(p_user_id, p.id)
          AND cm.user_b_id = GREATEST(p_user_id, p.id)
        LIMIT 1) AS compat,
      (
        public.placement_affinity((SELECT sun      FROM me), bf.sun)
      + public.placement_affinity((SELECT moon     FROM me), bf.moon)
      + public.placement_affinity((SELECT asc_sign FROM me), bf.asc_sign)
      + public.placement_affinity((SELECT venus    FROM me), bf.venus)
      + public.placement_affinity((SELECT mars     FROM me), bf.mars)
      ) AS aff,
      -- The fix: real coverage, every member, maintained by the app itself.
      (p.last_seen IS NOT NULL AND p.last_seen >= NOW() - INTERVAL '60 days') AS act,
      (p.last_seen IS NOT NULL AND p.last_seen >= NOW() - INTERVAL '7 days')  AS act_week,
      bf.sun AS sun_num
    FROM public.profiles p
    LEFT JOIN public.user_big_five bf ON bf.user_id = p.id
    LEFT JOIN mutuals mu ON mu.cand = p.id
    WHERE p.id <> p_user_id
      AND p.id NOT IN (SELECT other FROM excluded WHERE other IS NOT NULL)
      AND COALESCE(p.display_name, '') <> ''
  ),
  scored AS (
    SELECT
      c.*,
      ( LEAST(c.mutual_n, 5) * 12
      + COALESCE(c.compat, 0) * 0.40
      + CASE WHEN c.compat IS NULL THEN c.aff * 3 ELSE 0 END
      + CASE WHEN c.act THEN 10 ELSE 0 END
      -- Someone seen this week is a much better suggestion than someone seen
      -- seven weeks ago; both used to score identically.
      + CASE WHEN c.act_week THEN 6 ELSE 0 END
      + CASE WHEN c.avatar_url IS NOT NULL AND c.avatar_url <> '' THEN 5 ELSE 0 END
      )::NUMERIC AS total
    FROM candidates c
  )
  SELECT
    s.id,
    COALESCE(s.display_name, '')::TEXT,
    COALESCE(s.username, '')::TEXT,
    COALESCE(s.avatar_url, '')::TEXT,
    (CASE s.sun_num
       WHEN 0 THEN 'Aries'  WHEN 1 THEN 'Taurus' WHEN 2 THEN 'Gemini'
       WHEN 3 THEN 'Cancer' WHEN 4 THEN 'Leo'    WHEN 5 THEN 'Virgo'
       WHEN 6 THEN 'Libra'  WHEN 7 THEN 'Scorpio' WHEN 8 THEN 'Sagittarius'
       WHEN 9 THEN 'Capricorn' WHEN 10 THEN 'Aquarius' WHEN 11 THEN 'Pisces'
       ELSE NULL END)::TEXT,
    s.mutual_n,
    s.compat,
    s.aff,
    s.act,
    s.last_seen,
    ROUND(s.total, 1),
    (CASE
       WHEN s.mutual_n >= 2 THEN s.mutual_n || ' mutual connections'
       WHEN s.mutual_n = 1  THEN '1 mutual connection'
       WHEN s.compat IS NOT NULL AND s.compat >= 75 THEN 'Strong cosmic match — ' || s.compat || '%'
       WHEN s.compat IS NOT NULL THEN s.compat || '% compatibility'
       WHEN s.aff >= 8 THEN 'Your charts harmonise closely'
       WHEN s.aff >= 5 THEN 'Compatible elements'
       WHEN s.act_week THEN 'Active this week'
       WHEN s.act THEN 'Active recently'
       ELSE 'New to Align'
     END)::TEXT
  FROM scored s
  ORDER BY s.total DESC, s.mutual_n DESC, s.id
  LIMIT GREATEST(p_limit, 1);
EXCEPTION WHEN undefined_table THEN
  RETURN;
END;
$$;

REVOKE ALL ON FUNCTION public.suggested_connections(UUID, INT) FROM PUBLIC, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.suggested_connections(UUID, INT) TO service_role;


-- The self-only wrapper must be recreated because the return shape changed.
DROP FUNCTION IF EXISTS public.suggested_connections_me(INT);

CREATE OR REPLACE FUNCTION public.suggested_connections_me(p_limit INT DEFAULT 20)
RETURNS TABLE (
  user_id        UUID,
  display_name   TEXT,
  username       TEXT,
  avatar_url     TEXT,
  sun_sign       TEXT,
  mutual_count   INT,
  compatibility  SMALLINT,
  affinity       INT,
  is_active      BOOLEAN,
  last_seen      TIMESTAMPTZ,
  score          NUMERIC,
  reason         TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RETURN; END IF;
  RETURN QUERY SELECT * FROM public.suggested_connections(v_uid, p_limit);
END;
$$;

GRANT EXECUTE ON FUNCTION public.suggested_connections_me(INT) TO authenticated;

CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON public.profiles(last_seen DESC);


-- ═════════════════════════════════════════════════════════════════════════════
-- SMOKE TEST
-- ═════════════════════════════════════════════════════════════════════════════
-- SELECT display_name, mutual_count, compatibility, is_active, score, reason
--   FROM public.suggested_connections('<your-user-id>'::uuid, 10);
