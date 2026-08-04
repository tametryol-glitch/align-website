-- =============================================================================
-- Align — Product Analytics (Phase 4): UTM campaign tracking
-- =============================================================================
-- Adds first-touch UTM attribution:
--   • utm_source / utm_medium / utm_campaign on analytics_sessions
--   • analytics_touch_session() extended to store them (first-touch: kept, not
--     overwritten by later heartbeats in the same session)
--   • analytics_campaigns() → per campaign: sessions, users, signups, subscribers
--     (signups/subscribers attributed to each user's EARLIEST utm-tagged session)
--
-- Idempotent + safe to re-run. Run in the Supabase SQL editor.
-- =============================================================================

-- ── 1) UTM columns on sessions (additive) ────────────────────────────────────
ALTER TABLE public.analytics_sessions
  ADD COLUMN IF NOT EXISTS utm_source   TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium   TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_utm
  ON public.analytics_sessions (utm_source) WHERE utm_source IS NOT NULL;

-- ── 2) Extend the session-touch helper with UTM (first-touch semantics) ──────
-- Drop the old 9-arg signature, then recreate with the 3 UTM params added.
DROP FUNCTION IF EXISTS public.analytics_touch_session(TEXT, UUID, TEXT, TEXT, TEXT, CHAR, TEXT, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION public.analytics_touch_session(
  p_session_id   TEXT,
  p_user_id      UUID,
  p_anon_id      TEXT,
  p_platform     TEXT,
  p_app_version  TEXT,
  p_country      CHAR(2),
  p_locale       TEXT,
  p_referrer     TEXT,
  p_utm_source   TEXT,
  p_utm_medium   TEXT,
  p_utm_campaign TEXT,
  p_n            INTEGER
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.analytics_sessions AS s
    (session_id, user_id, anon_id, platform, app_version, country, locale, referrer,
     utm_source, utm_medium, utm_campaign, started_at, last_seen_at, event_count)
  VALUES
    (p_session_id, p_user_id, p_anon_id, p_platform, p_app_version, p_country, p_locale, p_referrer,
     p_utm_source, p_utm_medium, p_utm_campaign, NOW(), NOW(), GREATEST(p_n, 0))
  ON CONFLICT (session_id) DO UPDATE SET
    last_seen_at = NOW(),
    event_count  = s.event_count + GREATEST(p_n, 0),
    user_id      = COALESCE(EXCLUDED.user_id, s.user_id),
    country      = COALESCE(s.country, EXCLUDED.country),
    locale       = COALESCE(s.locale, EXCLUDED.locale),
    app_version  = COALESCE(EXCLUDED.app_version, s.app_version),
    -- first-touch: keep the UTM captured when the session began
    utm_source   = COALESCE(s.utm_source, EXCLUDED.utm_source),
    utm_medium   = COALESCE(s.utm_medium, EXCLUDED.utm_medium),
    utm_campaign = COALESCE(s.utm_campaign, EXCLUDED.utm_campaign);
$$;

GRANT EXECUTE ON FUNCTION public.analytics_touch_session(TEXT, UUID, TEXT, TEXT, TEXT, CHAR, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER) TO service_role;

-- ── 3) Campaign performance ──────────────────────────────────────────────────
-- sessions/users = traffic in the range; signups/subscribers = all-time, each
-- user attributed to their EARLIEST utm-tagged session (first-touch).
CREATE OR REPLACE FUNCTION public.analytics_campaigns(range_days INT DEFAULT 30)
RETURNS TABLE(source TEXT, medium TEXT, campaign TEXT, sessions BIGINT, users BIGINT, signups BIGINT, subscribers BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH first_touch AS (
    SELECT DISTINCT ON (user_id)
      user_id,
      COALESCE(utm_source, '(none)')   AS source,
      COALESCE(utm_medium, '(none)')   AS medium,
      COALESCE(utm_campaign, '(none)') AS campaign
    FROM public.analytics_sessions
    WHERE user_id IS NOT NULL AND utm_source IS NOT NULL
    ORDER BY user_id, started_at ASC
  ),
  attributed AS (
    SELECT ft.source, ft.medium, ft.campaign,
      COUNT(*) AS signups,
      COUNT(*) FILTER (WHERE p.is_subscribed IS TRUE) AS subscribers
    FROM first_touch ft
    JOIN public.profiles p ON p.id = ft.user_id
    GROUP BY 1, 2, 3
  ),
  sess AS (
    SELECT
      COALESCE(utm_source, '(none)')   AS source,
      COALESCE(utm_medium, '(none)')   AS medium,
      COALESCE(utm_campaign, '(none)') AS campaign,
      COUNT(*) AS sessions,
      COUNT(DISTINCT COALESCE(user_id::text, anon_id)) AS users
    FROM public.analytics_sessions
    WHERE utm_source IS NOT NULL AND started_at >= (CURRENT_DATE - range_days)
    GROUP BY 1, 2, 3
  )
  SELECT
    COALESCE(s.source, a.source),
    COALESCE(s.medium, a.medium),
    COALESCE(s.campaign, a.campaign),
    COALESCE(s.sessions, 0)::BIGINT,
    COALESCE(s.users, 0)::BIGINT,
    COALESCE(a.signups, 0)::BIGINT,
    COALESCE(a.subscribers, 0)::BIGINT
  FROM sess s
  FULL OUTER JOIN attributed a
    ON a.source = s.source AND a.medium = s.medium AND a.campaign = s.campaign
  ORDER BY 6 DESC, 4 DESC
  LIMIT 40;
$$;

GRANT EXECUTE ON FUNCTION public.analytics_campaigns(INT) TO service_role;
