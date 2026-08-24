-- =============================================================================
-- Align — Suggested Connections ("People to align with")
-- =============================================================================
-- 491 of 770 members (63.8%) have ZERO connections and the median member has
-- none at all. Connection density is the strongest retention predictor in any
-- social product, and Align currently gives an isolated user no path out of
-- that state — there is no people-discovery surface anywhere in the app.
--
-- This adds one, built entirely on data that already exists:
--
--   planet_placement_index  real placements (~13.7k rows) — NOT profiles.sun_sign,
--                           which is populated for only 45 of 770 members
--   cosmic_matches          369 already-computed compatibility scores
--   friendships / follows   the existing graph, for mutual-connection signal
--   analytics_sessions      recency, so we never suggest a dormant account
--
-- No new astrology math. Element harmony (fire/air, earth/water) is the same
-- standard correspondence used throughout the app, and where a real computed
-- compatibility score already exists it takes precedence over the proxy.
--
-- Idempotent + safe to re-run. Run in the Supabase SQL editor.
-- =============================================================================


-- ═════════════════════════════════════════════════════════════════════════════
-- 1. BIG-FIVE PIVOT
-- ═════════════════════════════════════════════════════════════════════════════
-- One row per user with the five placements that carry relational weight.
-- sign_number is 0..11 (0 = Aries), so:
--     element = sign_number % 4   → 0 fire, 1 earth, 2 air, 3 water
--     two elements harmonise when they share parity (fire↔air, earth↔water)
-- Keeping the raw sign_number lets the scorer do both exact-sign and element
-- comparisons without another join.

CREATE OR REPLACE VIEW public.user_big_five AS
SELECT
  user_id,
  MAX(sign_number) FILTER (WHERE planet_name = 'Sun')       AS sun,
  MAX(sign_number) FILTER (WHERE planet_name = 'Moon')      AS moon,
  MAX(sign_number) FILTER (WHERE planet_name = 'Ascendant') AS asc_sign,
  MAX(sign_number) FILTER (WHERE planet_name = 'Venus')     AS venus,
  MAX(sign_number) FILTER (WHERE planet_name = 'Mars')      AS mars
FROM public.planet_placement_index
WHERE planet_name IN ('Sun', 'Moon', 'Ascendant', 'Venus', 'Mars')
GROUP BY user_id;

GRANT SELECT ON public.user_big_five TO service_role;


-- Score one placement pair: 2 = same sign, 1 = harmonising element, else 0.
CREATE OR REPLACE FUNCTION public.placement_affinity(a INT, b INT)
RETURNS INT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN a IS NULL OR b IS NULL THEN 0
    WHEN a = b THEN 2                      -- same sign
    WHEN (a % 4) = (b % 4) THEN 2          -- same element
    WHEN (a % 4) % 2 = (b % 4) % 2 THEN 1  -- fire↔air or earth↔water
    ELSE 0
  END;
$$;


-- ═════════════════════════════════════════════════════════════════════════════
-- 2. SUGGESTED CONNECTIONS
-- ═════════════════════════════════════════════════════════════════════════════
-- Ranking blends four signals. Mutual connections dominate because
-- friends-of-friends is the strongest predictor of an accepted request in any
-- social graph; astrology differentiates within that, which is the whole point
-- of Align.
--
--   mutual connections   × 12   (capped at 5 → max 60)
--   compatibility        × 0.40 (real cosmic_matches score, 0-100 → max 40)
--   element affinity     × 3    (0-10 proxy → max 30, used when no real score)
--   recently active      + 10
--   complete profile     + 5
--
-- Excludes: self, existing friends, pending requests either way, people the
-- user already follows, and blocks in either direction.

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
  -- Everyone already connected to me, in any form.
  my_graph AS (
    SELECT f.friend_id AS other FROM public.friendships f
     WHERE f.user_id = p_user_id AND f.status = 'accepted'
    UNION
    SELECT f.user_id FROM public.friendships f
     WHERE f.friend_id = p_user_id AND f.status = 'accepted'
    UNION
    SELECT fo.following_id FROM public.follows fo WHERE fo.follower_id = p_user_id
  ),
  -- Anyone I must not be shown: already connected, request in flight, blocked.
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
  -- Friends-of-friends: how many people I know does each candidate know?
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
  -- Anyone with a session in the last 60 days counts as reachable.
  active AS (
    SELECT DISTINCT s.user_id AS uid
      FROM public.analytics_sessions s
     WHERE s.user_id IS NOT NULL
       AND s.started_at >= NOW() - INTERVAL '60 days'
  ),
  candidates AS (
    SELECT
      p.id,
      p.display_name,
      p.username,
      p.avatar_url,
      COALESCE(mu.n, 0) AS mutual_n,
      -- Real computed score if this pair has one (pairs are stored ordered).
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
      (a.uid IS NOT NULL) AS act,
      bf.sun AS sun_num
    FROM public.profiles p
    LEFT JOIN public.user_big_five bf ON bf.user_id = p.id
    LEFT JOIN mutuals mu ON mu.cand = p.id
    LEFT JOIN active a ON a.uid = p.id
    WHERE p.id <> p_user_id
      AND p.id NOT IN (SELECT other FROM excluded WHERE other IS NOT NULL)
      AND COALESCE(p.display_name, '') <> ''
  ),
  scored AS (
    SELECT
      c.*,
      ( LEAST(c.mutual_n, 5) * 12
      + COALESCE(c.compat, 0) * 0.40
      -- The element proxy only fills in where no real score exists, so a pair
      -- with a computed compatibility is never double-counted.
      + CASE WHEN c.compat IS NULL THEN c.aff * 3 ELSE 0 END
      + CASE WHEN c.act THEN 10 ELSE 0 END
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
    ROUND(s.total, 1),
    -- The single most compelling true thing we can say about this suggestion.
    (CASE
       WHEN s.mutual_n >= 2 THEN s.mutual_n || ' mutual connections'
       WHEN s.mutual_n = 1  THEN '1 mutual connection'
       WHEN s.compat IS NOT NULL AND s.compat >= 75 THEN 'Strong cosmic match — ' || s.compat || '%'
       WHEN s.compat IS NOT NULL THEN s.compat || '% compatibility'
       WHEN s.aff >= 8 THEN 'Your charts harmonise closely'
       WHEN s.aff >= 5 THEN 'Compatible elements'
       WHEN s.act THEN 'Active on Align recently'
       ELSE 'New to Align'
     END)::TEXT
  FROM scored s
  ORDER BY s.total DESC, s.mutual_n DESC, s.id
  LIMIT GREATEST(p_limit, 1);
EXCEPTION WHEN undefined_table THEN
  RETURN;
END;
$$;

-- service_role ONLY, deliberately. The function takes a user id as an
-- argument, so granting it to `authenticated` would let any signed-in user
-- request someone else's suggestions and infer their social graph. Access goes
-- through /api/connections/suggested, which derives the id from the session.
REVOKE ALL ON FUNCTION public.suggested_connections(UUID, INT) FROM PUBLIC, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.suggested_connections(UUID, INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.placement_affinity(INT, INT) TO service_role;


-- Self-only variant for clients that authenticate with a JWT rather than a
-- session cookie (the mobile app). It takes no user argument, so a caller can
-- only ever retrieve their OWN suggestions — which is what makes it safe to
-- grant to `authenticated`, unlike the two-argument form above.
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


-- ═════════════════════════════════════════════════════════════════════════════
-- 3. ISOLATION REPORTING
-- ═════════════════════════════════════════════════════════════════════════════
-- So the effect of this feature is measurable rather than assumed. Track the
-- isolated share over time and it should fall.

CREATE OR REPLACE FUNCTION public.analytics_isolation_trend()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v jsonb;
BEGIN
  WITH conn AS (
    SELECT p.id,
           p.created_at,
           (SELECT COUNT(*) FROM public.follows f
             WHERE f.follower_id = p.id OR f.following_id = p.id)
         + (SELECT COUNT(*) FROM public.friendships fr
             WHERE fr.status = 'accepted' AND (fr.user_id = p.id OR fr.friend_id = p.id))
           AS n
      FROM public.profiles p
  )
  SELECT jsonb_build_object(
    'members',            COUNT(*),
    'isolated',           COUNT(*) FILTER (WHERE n = 0),
    'isolated_pct',       ROUND(COUNT(*) FILTER (WHERE n = 0)::numeric * 100 / NULLIF(COUNT(*), 0), 1),
    -- Cohorted so you can see whether NEW members are landing better than the
    -- historical base, which is the only way to tell if this is working.
    'isolated_last_30d',  COUNT(*) FILTER (WHERE n = 0 AND created_at >= NOW() - INTERVAL '30 days'),
    'joined_last_30d',    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days'),
    'isolated_pct_last_30d',
      ROUND(COUNT(*) FILTER (WHERE n = 0 AND created_at >= NOW() - INTERVAL '30 days')::numeric * 100
            / NULLIF(COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days'), 0), 1),
    'median_connections', PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY n)
  ) INTO v FROM conn;
  RETURN COALESCE(v, '{}'::jsonb);
EXCEPTION WHEN undefined_table THEN
  RETURN jsonb_build_object('error', 'missing_tables');
END;
$$;

GRANT EXECUTE ON FUNCTION public.analytics_isolation_trend() TO service_role;


-- ═════════════════════════════════════════════════════════════════════════════
-- 4. SUPPORTING INDEXES
-- ═════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_ppi_user_planet
  ON public.planet_placement_index(user_id, planet_name);

CREATE INDEX IF NOT EXISTS idx_cosmic_matches_pair_ready
  ON public.cosmic_matches(user_a_id, user_b_id) WHERE status = 'ready';

CREATE INDEX IF NOT EXISTS idx_friendships_user_status
  ON public.friendships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_status
  ON public.friendships(friend_id, status);


-- ═════════════════════════════════════════════════════════════════════════════
-- 5. SMOKE TEST
-- ═════════════════════════════════════════════════════════════════════════════
-- SELECT * FROM public.suggested_connections('<your-user-id>'::uuid, 10);
-- SELECT public.analytics_isolation_trend();
-- SELECT * FROM public.user_big_five LIMIT 5;
