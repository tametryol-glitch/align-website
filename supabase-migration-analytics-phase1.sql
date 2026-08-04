-- =============================================================================
-- Align — Product Analytics (Phase 1)
-- =============================================================================
-- Purpose: self-owned, in-panel analytics for web + app.
--   • Live users, DAU / WAU / MAU
--   • Top pages / screens
--   • Country breakdown (from IP; IP itself is NEVER stored)
--   • Language breakdown
--
-- Design notes:
--   • ADDITIVE ONLY. The existing `analytics_events` table (mobile writes to it
--     and kpi_perf_daily / kpi_weekly_summary views read from it) is only
--     EXTENDED with new nullable columns. Nothing existing is dropped or renamed.
--   • Ingestion writes via the service role (see /api/track), so RLS on the new
--     tables stays fully locked (enabled, no public policy = deny to anon/authed,
--     service role bypasses). The existing self-insert policy on analytics_events
--     is left untouched.
--   • Raw-event 90-day purge is ALREADY handled by pg_cron
--     (align-api/supabase-migration-retention.sql) — not duplicated here.
--
-- Safe to re-run (idempotent). Run in the Supabase SQL Editor.
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1) Enrich the existing analytics_events table (additive)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS session_id  TEXT,
  ADD COLUMN IF NOT EXISTS anon_id     TEXT,
  ADD COLUMN IF NOT EXISTS platform    TEXT,     -- 'web' | 'ios' | 'android'
  ADD COLUMN IF NOT EXISTS app_version TEXT,
  ADD COLUMN IF NOT EXISTS path        TEXT,     -- screen name or URL path (no query string)
  ADD COLUMN IF NOT EXISTS country     CHAR(2),  -- ISO-3166 alpha-2, derived from IP; IP discarded
  ADD COLUMN IF NOT EXISTS locale      TEXT,     -- e.g. 'en', 'pt-BR'
  ADD COLUMN IF NOT EXISTS referrer    TEXT;

-- Rollup-friendly indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_name
  ON public.analytics_events (created_at, event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session
  ON public.analytics_events (session_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 2) Sessions / live presence (one row per session, upserted on every event)
--    Doubles as the "who is online right now" source: last_seen_at > now()-5min
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analytics_sessions (
  session_id   TEXT PRIMARY KEY,
  user_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  anon_id      TEXT,
  platform     TEXT,
  app_version  TEXT,
  country      CHAR(2),
  locale       TEXT,
  referrer     TEXT,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_count  INTEGER     NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_last_seen ON public.analytics_sessions (last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started   ON public.analytics_sessions (started_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user      ON public.analytics_sessions (user_id);

ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3) Daily rollup tables (tiny + permanent — the dashboard reads these)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analytics_daily_overview (
  day              DATE PRIMARY KEY,
  dau              INTEGER NOT NULL DEFAULT 0,   -- distinct identities active that day
  new_users        INTEGER NOT NULL DEFAULT 0,   -- profiles created that day
  sessions         INTEGER NOT NULL DEFAULT 0,
  avg_session_sec  INTEGER NOT NULL DEFAULT 0,
  platform_web     INTEGER NOT NULL DEFAULT 0,
  platform_ios     INTEGER NOT NULL DEFAULT 0,
  platform_android INTEGER NOT NULL DEFAULT 0,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_daily_pages (
  day          DATE    NOT NULL,
  platform     TEXT    NOT NULL DEFAULT 'all',
  path         TEXT    NOT NULL,
  views        INTEGER NOT NULL DEFAULT 0,
  unique_users INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, platform, path)
);

CREATE TABLE IF NOT EXISTS public.analytics_daily_geo (
  day      DATE    NOT NULL,
  country  CHAR(2) NOT NULL,
  users    INTEGER NOT NULL DEFAULT 0,
  sessions INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, country)
);

CREATE TABLE IF NOT EXISTS public.analytics_daily_locale (
  day    DATE    NOT NULL,
  locale TEXT    NOT NULL,
  users  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, locale)
);

CREATE TABLE IF NOT EXISTS public.analytics_daily_features (
  day          DATE    NOT NULL,
  feature      TEXT    NOT NULL,
  opens        INTEGER NOT NULL DEFAULT 0,
  unique_users INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, feature)
);

-- Retention table is created now; population lands in Phase 2.
CREATE TABLE IF NOT EXISTS public.analytics_daily_retention (
  cohort_day  DATE    NOT NULL,
  day_offset  INTEGER NOT NULL,   -- 1, 7, 30
  cohort_size INTEGER NOT NULL DEFAULT 0,
  retained    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (cohort_day, day_offset)
);

ALTER TABLE public.analytics_daily_overview  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_pages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_geo       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_locale    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_features  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_retention ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4) Session upsert helper (called by /api/track once per batch)
--    "identity" for distinct-user math = COALESCE(user_id::text, anon_id)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.analytics_touch_session(
  p_session_id  TEXT,
  p_user_id     UUID,
  p_anon_id     TEXT,
  p_platform    TEXT,
  p_app_version TEXT,
  p_country     CHAR(2),
  p_locale      TEXT,
  p_referrer    TEXT,
  p_n           INTEGER
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.analytics_sessions AS s
    (session_id, user_id, anon_id, platform, app_version, country, locale, referrer,
     started_at, last_seen_at, event_count)
  VALUES
    (p_session_id, p_user_id, p_anon_id, p_platform, p_app_version, p_country, p_locale, p_referrer,
     NOW(), NOW(), GREATEST(p_n, 0))
  ON CONFLICT (session_id) DO UPDATE SET
    last_seen_at = NOW(),
    event_count  = s.event_count + GREATEST(p_n, 0),
    user_id      = COALESCE(EXCLUDED.user_id, s.user_id),
    country      = COALESCE(s.country, EXCLUDED.country),
    locale       = COALESCE(s.locale, EXCLUDED.locale),
    app_version  = COALESCE(EXCLUDED.app_version, s.app_version);
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5) Daily rollup function — idempotent per day (recompute-safe)
--    Reads raw events/sessions/profiles → writes the daily_* tables for one day.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.analytics_rollup(target_day DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  d0 TIMESTAMPTZ := target_day::timestamptz;
  d1 TIMESTAMPTZ := (target_day + 1)::timestamptz;
BEGIN
  -- Clear any prior computation for this day (idempotent)
  DELETE FROM public.analytics_daily_pages    WHERE day = target_day;
  DELETE FROM public.analytics_daily_geo      WHERE day = target_day;
  DELETE FROM public.analytics_daily_locale   WHERE day = target_day;
  DELETE FROM public.analytics_daily_features WHERE day = target_day;

  -- ── Overview ───────────────────────────────────────────────────────────────
  INSERT INTO public.analytics_daily_overview
    (day, dau, new_users, sessions, avg_session_sec,
     platform_web, platform_ios, platform_android, updated_at)
  SELECT
    target_day,
    COALESCE((
      SELECT COUNT(DISTINCT COALESCE(user_id::text, anon_id))
      FROM public.analytics_events
      WHERE created_at >= d0 AND created_at < d1
        AND COALESCE(user_id::text, anon_id) IS NOT NULL
    ), 0),
    COALESCE((
      SELECT COUNT(*) FROM public.profiles
      WHERE created_at >= d0 AND created_at < d1
    ), 0),
    COALESCE((
      SELECT COUNT(*) FROM public.analytics_sessions
      WHERE started_at >= d0 AND started_at < d1
    ), 0),
    COALESCE((
      SELECT AVG(EXTRACT(EPOCH FROM (last_seen_at - started_at)))::int
      FROM public.analytics_sessions
      WHERE started_at >= d0 AND started_at < d1
    ), 0),
    COALESCE((SELECT COUNT(*) FROM public.analytics_sessions WHERE started_at >= d0 AND started_at < d1 AND platform = 'web'), 0),
    COALESCE((SELECT COUNT(*) FROM public.analytics_sessions WHERE started_at >= d0 AND started_at < d1 AND platform = 'ios'), 0),
    COALESCE((SELECT COUNT(*) FROM public.analytics_sessions WHERE started_at >= d0 AND started_at < d1 AND platform = 'android'), 0),
    NOW()
  ON CONFLICT (day) DO UPDATE SET
    dau = EXCLUDED.dau,
    new_users = EXCLUDED.new_users,
    sessions = EXCLUDED.sessions,
    avg_session_sec = EXCLUDED.avg_session_sec,
    platform_web = EXCLUDED.platform_web,
    platform_ios = EXCLUDED.platform_ios,
    platform_android = EXCLUDED.platform_android,
    updated_at = NOW();

  -- ── Pages / screens ──────────────────────────────────────────────────────────
  INSERT INTO public.analytics_daily_pages (day, platform, path, views, unique_users)
  SELECT
    target_day,
    COALESCE(platform, 'unknown'),
    path,
    COUNT(*),
    COUNT(DISTINCT COALESCE(user_id::text, anon_id))
  FROM public.analytics_events
  WHERE created_at >= d0 AND created_at < d1
    AND event_name IN ('page_view', 'screen_view')
    AND path IS NOT NULL AND path <> ''
  GROUP BY 2, 3;

  -- ── Geography ────────────────────────────────────────────────────────────────
  INSERT INTO public.analytics_daily_geo (day, country, users, sessions)
  SELECT
    target_day,
    country,
    COUNT(DISTINCT COALESCE(user_id::text, anon_id)),
    COUNT(*)
  FROM public.analytics_sessions
  WHERE started_at >= d0 AND started_at < d1
    AND country IS NOT NULL
  GROUP BY 2;

  -- ── Languages ────────────────────────────────────────────────────────────────
  INSERT INTO public.analytics_daily_locale (day, locale, users)
  SELECT
    target_day,
    -- normalize to primary subtag (e.g. 'pt-BR' -> 'pt') to keep buckets meaningful
    LOWER(SPLIT_PART(locale, '-', 1)),
    COUNT(DISTINCT COALESCE(user_id::text, anon_id))
  FROM public.analytics_sessions
  WHERE started_at >= d0 AND started_at < d1
    AND locale IS NOT NULL AND locale <> ''
  GROUP BY 2;

  -- ── Feature opens ────────────────────────────────────────────────────────────
  INSERT INTO public.analytics_daily_features (day, feature, opens, unique_users)
  SELECT
    target_day,
    COALESCE(NULLIF(event_data->>'feature', ''), path, 'unknown'),
    COUNT(*),
    COUNT(DISTINCT COALESCE(user_id::text, anon_id))
  FROM public.analytics_events
  WHERE created_at >= d0 AND created_at < d1
    AND event_name = 'feature_opened'
  GROUP BY 2;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5b) Live/headline metrics (cheap, real-time) — read by the admin dashboard.
--     "identity" = COALESCE(user_id::text, anon_id). Live = seen in last 5 min.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.analytics_live_metrics()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'live',         (SELECT COUNT(DISTINCT COALESCE(user_id::text, anon_id)) FROM public.analytics_sessions WHERE last_seen_at > NOW() - INTERVAL '5 minutes'),
    'live_web',     (SELECT COUNT(*) FROM public.analytics_sessions WHERE last_seen_at > NOW() - INTERVAL '5 minutes' AND platform = 'web'),
    'live_ios',     (SELECT COUNT(*) FROM public.analytics_sessions WHERE last_seen_at > NOW() - INTERVAL '5 minutes' AND platform = 'ios'),
    'live_android', (SELECT COUNT(*) FROM public.analytics_sessions WHERE last_seen_at > NOW() - INTERVAL '5 minutes' AND platform = 'android'),
    'dau',          (SELECT COUNT(DISTINCT COALESCE(user_id::text, anon_id)) FROM public.analytics_sessions WHERE last_seen_at >= DATE_TRUNC('day', NOW())),
    'wau',          (SELECT COUNT(DISTINCT COALESCE(user_id::text, anon_id)) FROM public.analytics_sessions WHERE last_seen_at > NOW() - INTERVAL '7 days'),
    'mau',          (SELECT COUNT(DISTINCT COALESCE(user_id::text, anon_id)) FROM public.analytics_sessions WHERE last_seen_at > NOW() - INTERVAL '30 days'),
    'total_members',(SELECT COUNT(*) FROM public.profiles)
  );
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6) Explicit GRANTs (required for new objects per post-2026-10-30 policy)
-- ─────────────────────────────────────────────────────────────────────────────
GRANT ALL ON public.analytics_sessions        TO service_role;
GRANT ALL ON public.analytics_daily_overview  TO service_role;
GRANT ALL ON public.analytics_daily_pages     TO service_role;
GRANT ALL ON public.analytics_daily_geo       TO service_role;
GRANT ALL ON public.analytics_daily_locale    TO service_role;
GRANT ALL ON public.analytics_daily_features  TO service_role;
GRANT ALL ON public.analytics_daily_retention TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_touch_session(TEXT, UUID, TEXT, TEXT, TEXT, CHAR, TEXT, TEXT, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_rollup(DATE) TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_live_metrics() TO service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 7) Schedule the rollup via pg_cron (matches the existing retention jobs).
--    Rolls up "yesterday" and "today so far" every night at 03:05 UTC.
--    (The Vercel route /api/cron/analytics-rollup can also trigger it manually.)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  PERFORM cron.unschedule('align-analytics-rollup')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'align-analytics-rollup');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'align-analytics-rollup',
  '5 3 * * *',  -- daily at 03:05 UTC
  $$ SELECT public.analytics_rollup((NOW() - INTERVAL '1 day')::date);
     SELECT public.analytics_rollup(NOW()::date); $$
);

-- ── One-off backfill for the last 30 days (safe to run now; no data = empty) ──
DO $$
DECLARE i INT;
BEGIN
  FOR i IN 0..30 LOOP
    PERFORM public.analytics_rollup((NOW() - (i || ' days')::interval)::date);
  END LOOP;
END $$;


-- ── Verify ───────────────────────────────────────────────────────────────────
-- SELECT * FROM public.analytics_daily_overview ORDER BY day DESC LIMIT 14;
-- SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'align-analytics-rollup';
