-- =============================================================================
-- Align — Product Analytics (Phase 2): retention, new-vs-returning, bounce
-- =============================================================================
-- Adds two functions on top of Phase 1 (tables already exist):
--   • analytics_retention_rollup()  → fills analytics_daily_retention (D1/D7/D30)
--   • analytics_engagement_metrics() → new vs returning + bounce (real-time)
--
-- The signup funnel is computed directly in the admin API from existing tables
-- (profiles + planet_placement_index), so no new objects are needed for it.
--
-- Retention/new-returning read analytics_sessions, which only has data from
-- Phase 1 onward — so curves fill in going forward (D7 needs 7 days, etc.).
-- Idempotent + safe to re-run. Run in the Supabase SQL editor.
-- =============================================================================

-- ── Retention rollup: cohort = an identity's first-seen day ──────────────────
-- "identity" = COALESCE(user_id::text, anon_id). Day-N retention = that cohort
-- was active again exactly N days after first seen. Only MATURE cohorts count
-- (cohort_day + N <= today), so the curve isn't dragged down by incomplete days.
CREATE OR REPLACE FUNCTION public.analytics_retention_rollup(lookback_days INT DEFAULT 60)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.analytics_daily_retention
   WHERE cohort_day >= (CURRENT_DATE - lookback_days);

  WITH activity AS (
    SELECT DISTINCT COALESCE(user_id::text, anon_id) AS ident, started_at::date AS d
    FROM public.analytics_sessions
    WHERE COALESCE(user_id::text, anon_id) IS NOT NULL
      AND started_at >= (CURRENT_DATE - (lookback_days + 31))
  ),
  firstseen AS (
    SELECT ident, MIN(d) AS cohort_day FROM activity GROUP BY ident
  ),
  offsets AS ( SELECT unnest(ARRAY[1, 7, 30]) AS off )
  INSERT INTO public.analytics_daily_retention (cohort_day, day_offset, cohort_size, retained)
  SELECT
    f.cohort_day,
    o.off,
    COUNT(DISTINCT f.ident),
    COUNT(DISTINCT a.ident)
  FROM firstseen f
  CROSS JOIN offsets o
  LEFT JOIN activity a
    ON a.ident = f.ident AND a.d = f.cohort_day + o.off
  WHERE f.cohort_day >= (CURRENT_DATE - lookback_days)
    AND (f.cohort_day + o.off) <= CURRENT_DATE
  GROUP BY f.cohort_day, o.off;
END;
$$;

-- ── New vs returning + bounce for a range (real-time) ────────────────────────
-- new = active identity first seen within the range; returning = seen earlier.
-- bounce = sessions with <=1 event (opened, did nothing).
CREATE OR REPLACE FUNCTION public.analytics_engagement_metrics(range_days INT DEFAULT 7)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH active_idents AS (
    SELECT DISTINCT COALESCE(user_id::text, anon_id) AS ident
    FROM public.analytics_sessions
    WHERE started_at >= (CURRENT_DATE - range_days)
      AND COALESCE(user_id::text, anon_id) IS NOT NULL
  ),
  firstseen AS (
    SELECT COALESCE(user_id::text, anon_id) AS ident, MIN(started_at::date) AS fd
    FROM public.analytics_sessions
    WHERE COALESCE(user_id::text, anon_id) IS NOT NULL
    GROUP BY 1
  )
  SELECT jsonb_build_object(
    'active',    (SELECT COUNT(*) FROM active_idents),
    'new',       (SELECT COUNT(*) FROM active_idents ai JOIN firstseen f ON f.ident = ai.ident WHERE f.fd >= (CURRENT_DATE - range_days)),
    'returning', (SELECT COUNT(*) FROM active_idents ai JOIN firstseen f ON f.ident = ai.ident WHERE f.fd <  (CURRENT_DATE - range_days)),
    'sessions',  (SELECT COUNT(*) FROM public.analytics_sessions WHERE started_at >= (CURRENT_DATE - range_days)),
    'bounces',   (SELECT COUNT(*) FROM public.analytics_sessions WHERE started_at >= (CURRENT_DATE - range_days) AND event_count <= 1)
  );
$$;

-- ── Signup → activation funnel (all-time snapshot, from existing tables) ─────
-- signup → added complete birth info → got their chart computed (cosmic index).
CREATE OR REPLACE FUNCTION public.analytics_funnel()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'signups', (SELECT COUNT(*) FROM public.profiles),
    'birth',   (SELECT COUNT(*) FROM public.profiles
                 WHERE birth_date IS NOT NULL AND latitude IS NOT NULL
                   AND longitude IS NOT NULL AND timezone IS NOT NULL),
    'charted', (SELECT COUNT(DISTINCT user_id) FROM public.planet_placement_index)
  );
$$;

-- ── Grants ───────────────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.analytics_retention_rollup(INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_engagement_metrics(INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_funnel() TO service_role;

-- ── Schedule nightly retention rollup (alongside the Phase 1 rollup) ─────────
CREATE EXTENSION IF NOT EXISTS pg_cron;
DO $$
BEGIN
  PERFORM cron.unschedule('align-analytics-retention')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'align-analytics-retention');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
SELECT cron.schedule('align-analytics-retention', '25 3 * * *',
  $$ SELECT public.analytics_retention_rollup(60); $$);

-- ── Compute once now ─────────────────────────────────────────────────────────
SELECT public.analytics_retention_rollup(60);
