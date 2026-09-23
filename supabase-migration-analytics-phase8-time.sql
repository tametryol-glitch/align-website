-- =============================================================================
-- Align — Product Analytics (Phase 8): Time in app, per member, to the second
-- =============================================================================
-- Powers Admin → Analytics → Time:
--   • Leaderboard of members by time spent (7d / 30d / 90d / all time)
--   • Per-member drill-down: today, week, month, all-time; daily / weekly /
--     monthly history; which sections they stay in longest; platform split
--   • Demographics: time by age band, gender, plan, sun sign, country, platform
--
-- Source: clients report ENGAGED milliseconds (foreground + not idle) with each
-- heartbeat / route change / hide. /api/track only credits time when the
-- request carries a VERIFIED login for that member, then calls
-- analytics_add_time() which adds it here. This table is permanent — the 90-day
-- raw-event purge does not touch it, so all-time totals keep growing.
--
-- Days are UTC calendar days.
-- Safe to re-run (idempotent). Run in the Supabase SQL Editor.
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1) Permanent per-member, per-day, per-section time ledger
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analytics_user_time_daily (
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day        DATE        NOT NULL,
  section    TEXT        NOT NULL,
  platform   TEXT        NOT NULL,          -- 'web' | 'ios' | 'android'
  ms         BIGINT      NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, day, section, platform)
);

CREATE INDEX IF NOT EXISTS idx_user_time_day      ON public.analytics_user_time_daily (day);
CREATE INDEX IF NOT EXISTS idx_user_time_user_day ON public.analytics_user_time_daily (user_id, day);

ALTER TABLE public.analytics_user_time_daily ENABLE ROW LEVEL SECURITY;
-- No policies: members can never read other members' time. Service role only.
REVOKE ALL ON public.analytics_user_time_daily FROM anon, authenticated;
GRANT ALL  ON public.analytics_user_time_daily TO service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2) Ingestion: add a batch of engaged time for one verified member
--    p_rows = [{ "day": "2026-09-23", "section": "feed", "ms": 45012 }, ...]
--    A member's day can never exceed 24h in total, whatever a client sends.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.analytics_add_time(
  p_user_id  UUID,
  p_platform TEXT,
  p_rows     JSONB
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r        JSONB;
  v_day    DATE;
  v_sec    TEXT;
  v_ms     BIGINT;
  v_used   BIGINT;
BEGIN
  IF p_user_id IS NULL OR p_rows IS NULL OR jsonb_typeof(p_rows) <> 'array' THEN
    RETURN;
  END IF;

  FOR r IN SELECT * FROM jsonb_array_elements(p_rows) LOOP
    BEGIN
      v_day := (r->>'day')::date;
      v_sec := LEFT(COALESCE(NULLIF(r->>'section', ''), 'other'), 64);
      v_ms  := GREATEST(0, LEAST((r->>'ms')::bigint, 3600000));
    EXCEPTION WHEN others THEN
      CONTINUE;
    END;
    IF v_ms = 0 OR v_day IS NULL THEN CONTINUE; END IF;

    SELECT COALESCE(SUM(ms), 0) INTO v_used
    FROM public.analytics_user_time_daily
    WHERE user_id = p_user_id AND day = v_day;

    v_ms := LEAST(v_ms, GREATEST(0, 86400000 - v_used));
    IF v_ms = 0 THEN CONTINUE; END IF;

    INSERT INTO public.analytics_user_time_daily AS t (user_id, day, section, platform, ms, updated_at)
    VALUES (p_user_id, v_day, v_sec, COALESCE(p_platform, 'web'), v_ms, NOW())
    ON CONFLICT (user_id, day, section, platform) DO UPDATE
      SET ms = t.ms + EXCLUDED.ms, updated_at = NOW();
  END LOOP;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3) Shared demographic helpers
-- ─────────────────────────────────────────────────────────────────────────────
-- Takes TEXT so a malformed birth_date reads as 'Not set' instead of erroring.
CREATE OR REPLACE FUNCTION public.analytics_age_band(p_birth TEXT)
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  SELECT CASE
    WHEN p_birth IS NULL OR p_birth !~ '^\d{4}-\d{2}-\d{2}' THEN 'Not set'
    ELSE (
      SELECT CASE
        WHEN a < 18 THEN 'Under 18'
        WHEN a < 25 THEN '18–24'
        WHEN a < 35 THEN '25–34'
        WHEN a < 45 THEN '35–44'
        WHEN a < 55 THEN '45–54'
        WHEN a < 65 THEN '55–64'
        ELSE '65+'
      END
      FROM (SELECT date_part('year', age(LEFT(p_birth, 10)::date)) AS a) x
    )
  END;
$$;

CREATE OR REPLACE FUNCTION public.analytics_gender_bucket(p_gender_identity TEXT, p_gender TEXT)
RETURNS TEXT
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE
    WHEN lower(trim(COALESCE(p_gender_identity, p_gender, ''))) IN ('female', 'woman', 'f') THEN 'Woman'
    WHEN lower(trim(COALESCE(p_gender_identity, p_gender, ''))) IN ('male', 'man', 'm')     THEN 'Man'
    WHEN trim(COALESCE(p_gender_identity, p_gender, '')) = ''                               THEN 'Not set'
    ELSE initcap(trim(COALESCE(p_gender_identity, p_gender)))
  END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4) Leaderboard — who spends the most time (range_days = 0 → all time)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.analytics_time_leaderboard(range_days INTEGER, lim INTEGER DEFAULT 100)
RETURNS TABLE (
  user_id      UUID,
  username     TEXT,
  display_name TEXT,
  avatar_url   TEXT,
  tier         TEXT,
  total_ms     BIGINT,
  active_days  INTEGER,
  top_section  TEXT,
  top_platform TEXT,
  last_day     DATE
)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH t AS (
    SELECT * FROM public.analytics_user_time_daily
    WHERE range_days <= 0 OR day >= (CURRENT_DATE - (range_days - 1))
  ),
  per_user AS (
    SELECT t.user_id, SUM(t.ms)::bigint AS total_ms,
           COUNT(DISTINCT t.day)::int AS active_days, MAX(t.day) AS last_day
    FROM t GROUP BY t.user_id
  ),
  sec AS (
    SELECT DISTINCT ON (t.user_id) t.user_id, t.section
    FROM t GROUP BY t.user_id, t.section
    ORDER BY t.user_id, SUM(t.ms) DESC
  ),
  plat AS (
    SELECT DISTINCT ON (t.user_id) t.user_id, t.platform
    FROM t GROUP BY t.user_id, t.platform
    ORDER BY t.user_id, SUM(t.ms) DESC
  )
  SELECT p.id, p.username::text, p.display_name::text, p.avatar_url::text,
         COALESCE(p.subscription_tier::text, CASE WHEN p.is_subscribed THEN 'paid' ELSE 'free' END),
         u.total_ms, u.active_days, s.section::text, pl.platform::text, u.last_day
  FROM per_user u
  JOIN public.profiles p ON p.id = u.user_id
  LEFT JOIN sec  s  ON s.user_id  = u.user_id
  LEFT JOIN plat pl ON pl.user_id = u.user_id
  WHERE COALESCE(p.is_service_account, false) = false
  ORDER BY u.total_ms DESC
  LIMIT GREATEST(1, LEAST(lim, 500));
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5) Overview — totals, sections, daily trend and demographic breakdowns
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.analytics_time_overview(range_days INTEGER)
RETURNS JSONB
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH t AS (
    SELECT d.* FROM public.analytics_user_time_daily d
    JOIN public.profiles p ON p.id = d.user_id
    WHERE COALESCE(p.is_service_account, false) = false
      AND (range_days <= 0 OR d.day >= (CURRENT_DATE - (range_days - 1)))
  ),
  last_country AS (
    SELECT DISTINCT ON (s.user_id) s.user_id, s.country
    FROM public.analytics_sessions s
    WHERE s.user_id IS NOT NULL AND s.country IS NOT NULL
    ORDER BY s.user_id, s.last_seen_at DESC
  ),
  per_user AS (
    SELECT t.user_id, SUM(t.ms)::bigint AS ms
    FROM t GROUP BY t.user_id
  ),
  demo AS (
    SELECT u.user_id, u.ms,
           public.analytics_age_band(p.birth_date::text)                   AS age_band,
           public.analytics_gender_bucket(p.gender_identity::text, p.gender::text)     AS gender,
           COALESCE(p.subscription_tier::text, CASE WHEN p.is_subscribed THEN 'paid' ELSE 'free' END) AS tier,
           COALESCE(initcap(p.sun_sign::text), 'Not set')                        AS sun_sign,
           COALESCE(lc.country, 'ZZ')                                      AS country
    FROM per_user u
    JOIN public.profiles p ON p.id = u.user_id
    LEFT JOIN last_country lc ON lc.user_id = u.user_id
  )
  SELECT jsonb_build_object(
    'total_ms',   COALESCE((SELECT SUM(ms) FROM per_user), 0),
    'members',    (SELECT COUNT(*) FROM per_user),
    'avg_ms',     COALESCE((SELECT AVG(ms)::bigint FROM per_user), 0),
    'median_ms',  COALESCE((SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY ms)::bigint FROM per_user), 0),
    'sections', COALESCE((
      SELECT jsonb_agg(x ORDER BY x.ms DESC) FROM (
        SELECT section, SUM(ms)::bigint AS ms, COUNT(DISTINCT user_id)::int AS users
        FROM t GROUP BY section
      ) x), '[]'::jsonb),
    'platforms', COALESCE((
      SELECT jsonb_agg(x ORDER BY x.ms DESC) FROM (
        SELECT platform AS label, SUM(ms)::bigint AS ms, COUNT(DISTINCT user_id)::int AS users
        FROM t GROUP BY platform
      ) x), '[]'::jsonb),
    'daily', COALESCE((
      SELECT jsonb_agg(x ORDER BY x.day) FROM (
        SELECT day, SUM(ms)::bigint AS ms, COUNT(DISTINCT user_id)::int AS users
        FROM t GROUP BY day
      ) x), '[]'::jsonb),
    'age', COALESCE((
      SELECT jsonb_agg(x ORDER BY x.label) FROM (
        SELECT age_band AS label, SUM(ms)::bigint AS ms, COUNT(*)::int AS users FROM demo GROUP BY 1
      ) x), '[]'::jsonb),
    'gender', COALESCE((
      SELECT jsonb_agg(x ORDER BY x.ms DESC) FROM (
        SELECT gender AS label, SUM(ms)::bigint AS ms, COUNT(*)::int AS users FROM demo GROUP BY 1
      ) x), '[]'::jsonb),
    'tier', COALESCE((
      SELECT jsonb_agg(x ORDER BY x.ms DESC) FROM (
        SELECT tier AS label, SUM(ms)::bigint AS ms, COUNT(*)::int AS users FROM demo GROUP BY 1
      ) x), '[]'::jsonb),
    'sun_sign', COALESCE((
      SELECT jsonb_agg(x ORDER BY x.ms DESC) FROM (
        SELECT sun_sign AS label, SUM(ms)::bigint AS ms, COUNT(*)::int AS users FROM demo GROUP BY 1
      ) x), '[]'::jsonb),
    'country', COALESCE((
      SELECT jsonb_agg(x ORDER BY x.ms DESC) FROM (
        SELECT country AS label, SUM(ms)::bigint AS ms, COUNT(*)::int AS users FROM demo GROUP BY 1
      ) x), '[]'::jsonb)
  );
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6) One member in depth
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.analytics_time_user(p_user_id UUID)
RETURNS JSONB
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH t AS (
    SELECT * FROM public.analytics_user_time_daily WHERE user_id = p_user_id
  ),
  sess AS (
    SELECT * FROM public.analytics_sessions WHERE user_id = p_user_id
  )
  SELECT jsonb_build_object(
    'today_ms',      COALESCE((SELECT SUM(ms) FROM t WHERE day = CURRENT_DATE), 0),
    'yesterday_ms',  COALESCE((SELECT SUM(ms) FROM t WHERE day = CURRENT_DATE - 1), 0),
    'last7_ms',      COALESCE((SELECT SUM(ms) FROM t WHERE day >= CURRENT_DATE - 6), 0),
    'last30_ms',     COALESCE((SELECT SUM(ms) FROM t WHERE day >= CURRENT_DATE - 29), 0),
    'last90_ms',     COALESCE((SELECT SUM(ms) FROM t WHERE day >= CURRENT_DATE - 89), 0),
    'this_week_ms',  COALESCE((SELECT SUM(ms) FROM t WHERE day >= date_trunc('week',  CURRENT_DATE)::date), 0),
    'this_month_ms', COALESCE((SELECT SUM(ms) FROM t WHERE day >= date_trunc('month', CURRENT_DATE)::date), 0),
    'total_ms',      COALESCE((SELECT SUM(ms) FROM t), 0),
    'active_days',   (SELECT COUNT(DISTINCT day) FROM t),
    'first_day',     (SELECT MIN(day) FROM t),
    'last_day',      (SELECT MAX(day) FROM t),
    'last_seen_at',  (SELECT MAX(last_seen_at) FROM sess),
    'sessions_30d',  (SELECT COUNT(*) FROM sess WHERE started_at >= NOW() - INTERVAL '30 days'),
    'country',       (SELECT country FROM sess WHERE country IS NOT NULL ORDER BY last_seen_at DESC LIMIT 1),
    'daily', COALESCE((
      SELECT jsonb_agg(x ORDER BY x.day) FROM (
        SELECT day, SUM(ms)::bigint AS ms FROM t
        WHERE day >= CURRENT_DATE - 59 GROUP BY day
      ) x), '[]'::jsonb),
    'weekly', COALESCE((
      SELECT jsonb_agg(x ORDER BY x.week) FROM (
        SELECT date_trunc('week', day)::date AS week, SUM(ms)::bigint AS ms,
               COUNT(DISTINCT day)::int AS days
        FROM t WHERE day >= date_trunc('week', CURRENT_DATE)::date - 77
        GROUP BY 1
      ) x), '[]'::jsonb),
    'monthly', COALESCE((
      SELECT jsonb_agg(x ORDER BY x.month) FROM (
        SELECT date_trunc('month', day)::date AS month, SUM(ms)::bigint AS ms,
               COUNT(DISTINCT day)::int AS days
        FROM t GROUP BY 1
      ) x), '[]'::jsonb),
    'sections_all', COALESCE((
      SELECT jsonb_agg(x ORDER BY x.ms DESC) FROM (
        SELECT section, SUM(ms)::bigint AS ms, COUNT(DISTINCT day)::int AS days
        FROM t GROUP BY section
      ) x), '[]'::jsonb),
    'sections_30d', COALESCE((
      SELECT jsonb_agg(x ORDER BY x.ms DESC) FROM (
        SELECT section, SUM(ms)::bigint AS ms, COUNT(DISTINCT day)::int AS days
        FROM t WHERE day >= CURRENT_DATE - 29 GROUP BY section
      ) x), '[]'::jsonb),
    'platforms', COALESCE((
      SELECT jsonb_agg(x ORDER BY x.ms DESC) FROM (
        SELECT platform AS label, SUM(ms)::bigint AS ms FROM t GROUP BY platform
      ) x), '[]'::jsonb)
  );
$$;


-- Functions: service role only (the admin API calls them after its is_admin check).
REVOKE ALL ON FUNCTION public.analytics_add_time(UUID, TEXT, JSONB)           FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.analytics_time_leaderboard(INTEGER, INTEGER)    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.analytics_time_overview(INTEGER)                FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.analytics_time_user(UUID)                       FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_add_time(UUID, TEXT, JSONB)        TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_time_leaderboard(INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_time_overview(INTEGER)             TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_time_user(UUID)                    TO service_role;
