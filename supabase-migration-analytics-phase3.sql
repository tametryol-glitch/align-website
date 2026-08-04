-- =============================================================================
-- Align — Product Analytics (Phase 3): revenue snapshot + traffic sources
-- =============================================================================
-- Uses data already in Supabase:
--   • analytics_revenue_metrics()  → members / paid / free (from profiles.is_subscribed)
--   • analytics_traffic_sources()  → where sessions come from (referrer host)
--
-- Estimated MRR is computed in the admin API as paid × monthly price. For exact
-- MRR / trial→paid / churn, wire Stripe later (documented in the dashboard note).
-- Idempotent + safe to re-run. Run in the Supabase SQL editor.
-- =============================================================================

-- ── Revenue snapshot ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.analytics_revenue_metrics()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total', (SELECT COUNT(*) FROM public.profiles),
    'paid',  (SELECT COUNT(*) FROM public.profiles WHERE is_subscribed IS TRUE),
    'free',  (SELECT COUNT(*) FROM public.profiles WHERE is_subscribed IS NOT TRUE)
  );
$$;

-- ── Traffic sources (referrer host; NULL = Direct) for a range ───────────────
CREATE OR REPLACE FUNCTION public.analytics_traffic_sources(range_days INT DEFAULT 7)
RETURNS TABLE(source TEXT, sessions BIGINT, users BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN referrer IS NULL OR referrer = '' THEN 'Direct / app'
      ELSE regexp_replace(regexp_replace(referrer, '^https?://(www\.)?', ''), '/.*$', '')
    END AS source,
    COUNT(*)::BIGINT AS sessions,
    COUNT(DISTINCT COALESCE(user_id::text, anon_id))::BIGINT AS users
  FROM public.analytics_sessions
  WHERE started_at >= (CURRENT_DATE - range_days)
  GROUP BY 1
  ORDER BY sessions DESC
  LIMIT 15;
$$;

GRANT EXECUTE ON FUNCTION public.analytics_revenue_metrics() TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_traffic_sources(INT) TO service_role;
