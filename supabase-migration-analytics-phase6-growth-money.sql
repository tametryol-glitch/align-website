-- =============================================================================
-- Align — Product Analytics (Phase 6): lifecycle, activation, exact money, tech
-- =============================================================================
-- Builds on Phases 1–5. Three groups:
--
--   A. GROWTH   — extended retention offsets, weekly cohort grid, L28 power
--                 users, lifecycle states (new/current/resurrected/dormant),
--                 activation depth.
--   B. MONEY    — EXACT revenue from public.revenue_events (the RevenueCat
--                 webhook at align-api-v2/app/routers/revenuecat_webhook.py
--                 already writes this table), churn split by voluntary vs
--                 involuntary, refunds, paywall funnel, churn-risk list, and a
--                 new cost-tracking table for gross margin per user.
--   C. TECH     — app version adoption, perf percentiles from perf_timing,
--                 client error rate, upload and render success rates.
--
-- Note on revenue: analytics_revenue_exact() is only as complete as the
-- RevenueCat webhook. If the webhook is not configured in the RevenueCat
-- dashboard, this returns zeros — that is a signal, not a bug. The estimated
-- MRR card from Phase 3 stays as the fallback.
--
-- All functions are plpgsql so this migration applies even if an optional
-- table is missing. Idempotent + safe to re-run.
-- =============================================================================


-- ═════════════════════════════════════════════════════════════════════════════
-- A. GROWTH & LIFECYCLE
-- ═════════════════════════════════════════════════════════════════════════════

-- Replaces the Phase 2 rollup with more offsets. The table shape is unchanged
-- (cohort_day, day_offset, cohort_size, retained), so the existing dashboard
-- keeps working — it just gains D3/D14/D60/D90 alongside D1/D7/D30.
CREATE OR REPLACE FUNCTION public.analytics_retention_rollup(lookback_days INT DEFAULT 120)
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
      AND started_at >= (CURRENT_DATE - (lookback_days + 91))
  ),
  firstseen AS (
    SELECT ident, MIN(d) AS cohort_day FROM activity GROUP BY ident
  ),
  offsets AS ( SELECT unnest(ARRAY[1, 3, 7, 14, 30, 60, 90]) AS off )
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


-- Weekly cohort grid. Aggregate D1/D7/D30 hides whether RECENT cohorts retain
-- better than old ones — which is the only way to know if shipping is working.
CREATE OR REPLACE FUNCTION public.analytics_cohort_grid(weeks INT DEFAULT 12)
RETURNS TABLE (
  cohort_week DATE,
  cohort_size BIGINT,
  week_offset INT,
  retained    BIGINT,
  retained_pct NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH activity AS (
    SELECT DISTINCT COALESCE(s.user_id::text, s.anon_id) AS ident,
           date_trunc('week', s.started_at)::date AS wk
      FROM public.analytics_sessions s
     WHERE COALESCE(s.user_id::text, s.anon_id) IS NOT NULL
       AND s.started_at >= (CURRENT_DATE - (weeks * 7 + 7))
  ),
  firstweek AS (
    SELECT a.ident, MIN(a.wk) AS cw FROM activity a GROUP BY a.ident
  ),
  sizes AS (
    SELECT f.cw, COUNT(*) AS n FROM firstweek f GROUP BY f.cw
  )
  SELECT
    f.cw,
    sz.n,
    (((a.wk - f.cw) / 7))::int,
    COUNT(DISTINCT a.ident),
    ROUND(COUNT(DISTINCT a.ident)::numeric * 100 / NULLIF(sz.n, 0), 1)
  FROM firstweek f
  JOIN sizes sz ON sz.cw = f.cw
  JOIN activity a ON a.ident = f.ident
  WHERE f.cw >= (CURRENT_DATE - (weeks * 7))
  GROUP BY f.cw, sz.n, ((a.wk - f.cw) / 7)
  ORDER BY f.cw DESC, 3 ASC;
EXCEPTION WHEN undefined_table THEN RETURN;
END;
$$;


-- L28 power-user curve: how many of the last 28 days was each person active?
-- Splits casual from core, and shows whether the core is thickening.
CREATE OR REPLACE FUNCTION public.analytics_power_users()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v jsonb;
BEGIN
  WITH days AS (
    SELECT COALESCE(user_id::text, anon_id) AS ident,
           COUNT(DISTINCT started_at::date) AS d
      FROM public.analytics_sessions
     WHERE started_at >= (CURRENT_DATE - 28)
       AND COALESCE(user_id::text, anon_id) IS NOT NULL
     GROUP BY 1
  )
  SELECT jsonb_build_object(
    'total_active',  COUNT(*),
    'casual_1_3',    COUNT(*) FILTER (WHERE d BETWEEN 1 AND 3),
    'regular_4_9',   COUNT(*) FILTER (WHERE d BETWEEN 4 AND 9),
    'core_10_20',    COUNT(*) FILTER (WHERE d BETWEEN 10 AND 20),
    'power_21_plus', COUNT(*) FILTER (WHERE d >= 21),
    'median_days',   PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY d),
    'avg_days',      ROUND(AVG(d), 1)
  ) INTO v FROM days;
  RETURN COALESCE(v, '{}'::jsonb);
EXCEPTION WHEN undefined_table THEN
  RETURN jsonb_build_object('error', 'missing_tables');
END;
$$;


-- Lifecycle states for the range. "Resurrected" and "dormant" are the two
-- states no current card shows, and they are where recoverable revenue sits.
CREATE OR REPLACE FUNCTION public.analytics_lifecycle(range_days INT DEFAULT 7)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v jsonb;
BEGIN
  WITH per_ident AS (
    SELECT COALESCE(user_id::text, anon_id) AS ident,
           MIN(started_at::date) AS first_day,
           MAX(started_at::date) AS last_day
      FROM public.analytics_sessions
     WHERE COALESCE(user_id::text, anon_id) IS NOT NULL
     GROUP BY 1
  ),
  active_now AS (
    SELECT DISTINCT COALESCE(user_id::text, anon_id) AS ident
      FROM public.analytics_sessions
     WHERE started_at >= (CURRENT_DATE - range_days)
  ),
  prior_gap AS (
    -- Active now, but had NO activity in the 30 days before this range.
    SELECT a.ident FROM active_now a
     WHERE NOT EXISTS (
       SELECT 1 FROM public.analytics_sessions s
        WHERE COALESCE(s.user_id::text, s.anon_id) = a.ident
          AND s.started_at >= (CURRENT_DATE - range_days - 30)
          AND s.started_at <  (CURRENT_DATE - range_days))
  )
  SELECT jsonb_build_object(
    'range_days',   range_days,
    'active',       (SELECT COUNT(*) FROM active_now),
    'new',          (SELECT COUNT(*) FROM per_ident WHERE first_day >= (CURRENT_DATE - range_days)),
    'resurrected',  (SELECT COUNT(*) FROM prior_gap pg
                      JOIN per_ident pi ON pi.ident = pg.ident
                     WHERE pi.first_day < (CURRENT_DATE - range_days - 30)),
    'dormant_7d',   (SELECT COUNT(*) FROM per_ident WHERE last_day < (CURRENT_DATE - 7)  AND last_day >= (CURRENT_DATE - 30)),
    'dormant_30d',  (SELECT COUNT(*) FROM per_ident WHERE last_day < (CURRENT_DATE - 30) AND last_day >= (CURRENT_DATE - 90)),
    'churned_90d',  (SELECT COUNT(*) FROM per_ident WHERE last_day < (CURRENT_DATE - 90))
  ) INTO v;
  RETURN COALESCE(v, '{}'::jsonb);
EXCEPTION WHEN undefined_table THEN
  RETURN jsonb_build_object('error', 'missing_tables');
END;
$$;


-- Activation depth: how fast people reach value, and how complete their data
-- is. birth_time_known is an Align-specific quality metric — users without a
-- birth time get materially weaker houses, angles and Hidden Zodiac output, so
-- it directly predicts perceived accuracy and therefore churn.
CREATE OR REPLACE FUNCTION public.analytics_activation()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total     BIGINT := 0;
  v_ttv       NUMERIC;
  v_avatar    BIGINT := 0;
  v_bio       BIGINT := 0;
  v_btime     BIGINT := 0;
  v_bdate     BIGINT := 0;
  v_confirmed BIGINT := 0;
  v_unconf    BIGINT := 0;
  v_push      BIGINT := 0;
BEGIN
  SELECT COUNT(*),
         COUNT(*) FILTER (WHERE avatar_url IS NOT NULL AND avatar_url <> ''),
         COUNT(*) FILTER (WHERE bio IS NOT NULL AND bio <> ''),
         COUNT(*) FILTER (WHERE birth_time IS NOT NULL),
         COUNT(*) FILTER (WHERE birth_date IS NOT NULL)
    INTO v_total, v_avatar, v_bio, v_btime, v_bdate
    FROM public.profiles;

  -- Median hours from signup to first computed chart.
  BEGIN
    SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (
             ORDER BY EXTRACT(EPOCH FROM (ppi.first_chart - p.created_at)) / 3600)
      INTO v_ttv
      FROM public.profiles p
      JOIN LATERAL (
        SELECT MIN(created_at) AS first_chart
          FROM public.planet_placement_index WHERE user_id = p.id
      ) ppi ON TRUE
     WHERE ppi.first_chart IS NOT NULL AND ppi.first_chart >= p.created_at;
  EXCEPTION WHEN undefined_table OR undefined_column THEN v_ttv := NULL; END;

  -- Email verification. mailer_autoconfirm is off, so every unconfirmed row is
  -- a signup that can never log back in.
  BEGIN
    SELECT COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL),
           COUNT(*) FILTER (WHERE email_confirmed_at IS NULL)
      INTO v_confirmed, v_unconf
      FROM auth.users;
  EXCEPTION WHEN OTHERS THEN v_confirmed := 0; v_unconf := 0; END;

  -- Push reachability.
  BEGIN
    SELECT COUNT(DISTINCT user_id) INTO v_push
      FROM public.push_devices WHERE is_active = TRUE AND notifications_enabled = TRUE;
  EXCEPTION WHEN undefined_table THEN v_push := 0; END;

  RETURN jsonb_build_object(
    'members',                v_total,
    'median_hours_to_first_chart', ROUND(COALESCE(v_ttv, 0), 1),
    'has_avatar',             v_avatar,
    'has_bio',                v_bio,
    'has_birth_date',         v_bdate,
    'has_birth_time',         v_btime,
    'birth_time_known_pct',   CASE WHEN v_bdate > 0 THEN ROUND(v_btime::numeric * 100 / v_bdate, 1) END,
    'profile_complete_pct',   CASE WHEN v_total > 0 THEN ROUND(v_avatar::numeric * 100 / v_total, 1) END,
    'email_confirmed',        v_confirmed,
    'email_unconfirmed',      v_unconf,
    'email_confirmed_pct',    CASE WHEN (v_confirmed + v_unconf) > 0
                                   THEN ROUND(v_confirmed::numeric * 100 / (v_confirmed + v_unconf), 1) END,
    'push_reachable',         v_push,
    'push_reachable_pct',     CASE WHEN v_total > 0 THEN ROUND(v_push::numeric * 100 / v_total, 1) END
  );
EXCEPTION WHEN undefined_table THEN
  RETURN jsonb_build_object('error', 'missing_tables');
END;
$$;


-- ═════════════════════════════════════════════════════════════════════════════
-- B. MONEY
-- ═════════════════════════════════════════════════════════════════════════════

-- EXACT revenue from the RevenueCat webhook feed. This replaces guessing.
--   voluntary churn   = cancellation / expiration
--   involuntary churn = billing_issue  ← usually 20–40% of all churn and the
--                       easiest to win back, and currently invisible.
CREATE OR REPLACE FUNCTION public.analytics_revenue_exact(range_days INT DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since  TIMESTAMPTZ := NOW() - (range_days || ' days')::INTERVAL;
  v      jsonb;
  v_mix  jsonb := '[]'::jsonb;
BEGIN
  SELECT jsonb_build_object(
    'range_days',          range_days,
    'events',              COUNT(*),
    'gross_cents',         COALESCE(SUM(net_revenue_cents) FILTER (WHERE net_revenue_cents > 0), 0),
    'refund_cents',        COALESCE(ABS(SUM(net_revenue_cents) FILTER (WHERE net_revenue_cents < 0)), 0),
    'net_cents',           COALESCE(SUM(net_revenue_cents), 0),
    'new_purchases',       COUNT(*) FILTER (WHERE event_type = 'initial_purchase'),
    'renewals',            COUNT(*) FILTER (WHERE event_type = 'renewal'),
    'cancellations',       COUNT(*) FILTER (WHERE event_type = 'cancellation'),
    'expirations',         COUNT(*) FILTER (WHERE event_type = 'expiration'),
    'billing_issues',      COUNT(*) FILTER (WHERE event_type = 'billing_issue'),
    'refunds',             COUNT(*) FILTER (WHERE event_type = 'refund'),
    'product_changes',     COUNT(*) FILTER (WHERE event_type = 'product_change'),
    'paying_users',        COUNT(DISTINCT user_id) FILTER (WHERE net_revenue_cents > 0),
    'unprocessed',         COUNT(*) FILTER (WHERE processed_at IS NULL),
    'processing_errors',   COUNT(*) FILTER (WHERE processing_error IS NOT NULL)
  ) INTO v
  FROM public.revenue_events
  WHERE occurred_at >= since;

  -- Plan mix by product.
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'product_id', pid, 'purchases', n, 'revenue_cents', rev) ORDER BY rev DESC), '[]'::jsonb)
    INTO v_mix
    FROM (
      SELECT COALESCE(product_id, 'unknown') AS pid,
             COUNT(*) AS n,
             COALESCE(SUM(net_revenue_cents), 0) AS rev
        FROM public.revenue_events
       WHERE occurred_at >= since AND net_revenue_cents > 0
       GROUP BY 1
    ) m;

  RETURN COALESCE(v, '{}'::jsonb)
       || jsonb_build_object('plan_mix', v_mix)
       || jsonb_build_object(
            'voluntary_churn',   COALESCE((v->>'cancellations')::bigint, 0) + COALESCE((v->>'expirations')::bigint, 0),
            'involuntary_churn', COALESCE((v->>'billing_issues')::bigint, 0));
EXCEPTION WHEN undefined_table THEN
  RETURN jsonb_build_object('error', 'revenue_events_missing',
                            'hint', 'RevenueCat webhook not wired or table absent');
END;
$$;


-- Monthly recurring revenue and churn rate, computed from the event stream.
CREATE OR REPLACE FUNCTION public.analytics_mrr_trend(months INT DEFAULT 6)
RETURNS TABLE (
  month           DATE,
  new_cents       BIGINT,
  renewal_cents   BIGINT,
  refund_cents    BIGINT,
  net_cents       BIGINT,
  new_customers   BIGINT,
  churned_customers BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    date_trunc('month', occurred_at)::date,
    COALESCE(SUM(net_revenue_cents) FILTER (WHERE event_type = 'initial_purchase'), 0)::bigint,
    COALESCE(SUM(net_revenue_cents) FILTER (WHERE event_type = 'renewal'), 0)::bigint,
    COALESCE(ABS(SUM(net_revenue_cents) FILTER (WHERE net_revenue_cents < 0)), 0)::bigint,
    COALESCE(SUM(net_revenue_cents), 0)::bigint,
    COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'initial_purchase'),
    COUNT(DISTINCT user_id) FILTER (WHERE event_type IN ('cancellation', 'expiration'))
  FROM public.revenue_events
  WHERE occurred_at >= date_trunc('month', NOW()) - (months || ' months')::INTERVAL
  GROUP BY 1
  ORDER BY 1 ASC;
EXCEPTION WHEN undefined_table THEN RETURN;
END;
$$;


-- Paywall funnel from emitted events (Phase 1 instrumentation feeds this).
-- The `feature` property is the important half: it tells you WHAT people were
-- trying to do when they hit the wall, which is what you should price.
CREATE OR REPLACE FUNCTION public.analytics_paywall_funnel(range_days INT DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since     TIMESTAMPTZ := NOW() - (range_days || ' days')::INTERVAL;
  v_shown   BIGINT := 0;
  v_viewed  BIGINT := 0;
  v_started BIGINT := 0;
  v_done    BIGINT := 0;
  v_by_feat jsonb := '[]'::jsonb;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE event_name = 'paywall_shown'),
    COUNT(DISTINCT user_id) FILTER (WHERE event_name = 'paywall_shown'),
    COUNT(*) FILTER (WHERE event_name = 'checkout_started'),
    COUNT(*) FILTER (WHERE event_name = 'purchase_completed')
  INTO v_shown, v_viewed, v_started, v_done
  FROM public.analytics_events
  WHERE created_at >= since
    AND event_name IN ('paywall_shown', 'checkout_started', 'purchase_completed');

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'feature', f, 'shown', shown, 'purchased', bought,
           'conversion_pct', CASE WHEN shown > 0 THEN ROUND(bought::numeric * 100 / shown, 1) END
         ) ORDER BY shown DESC), '[]'::jsonb)
    INTO v_by_feat
    FROM (
      SELECT COALESCE(event_data->>'feature', 'unspecified') AS f,
             COUNT(*) FILTER (WHERE event_name = 'paywall_shown')      AS shown,
             COUNT(*) FILTER (WHERE event_name = 'purchase_completed') AS bought
        FROM public.analytics_events
       WHERE created_at >= since
         AND event_name IN ('paywall_shown', 'purchase_completed')
       GROUP BY 1
    ) x;

  RETURN jsonb_build_object(
    'range_days',       range_days,
    'paywall_shown',    v_shown,
    'unique_viewers',   v_viewed,
    'checkout_started', v_started,
    'purchased',        v_done,
    'shown_to_checkout_pct', CASE WHEN v_shown > 0 THEN ROUND(v_started::numeric * 100 / v_shown, 1) END,
    'checkout_to_paid_pct',  CASE WHEN v_started > 0 THEN ROUND(v_done::numeric * 100 / v_started, 1) END,
    'overall_pct',      CASE WHEN v_shown > 0 THEN ROUND(v_done::numeric * 100 / v_shown, 2) END,
    'by_feature',       v_by_feat
  );
EXCEPTION WHEN undefined_table THEN
  RETURN jsonb_build_object('error', 'missing_tables');
END;
$$;


-- Paying users who have gone quiet. This is the highest-value list in the app:
-- they are still being charged and are about to notice.
CREATE OR REPLACE FUNCTION public.analytics_churn_risk(lim INT DEFAULT 100)
RETURNS TABLE (
  user_id       UUID,
  display_name  TEXT,
  email         TEXT,
  last_seen     TIMESTAMPTZ,
  days_quiet    INT,
  member_since  TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id,
         COALESCE(p.display_name, '')::TEXT,
         COALESCE(p.email, '')::TEXT,
         act.last_at,
         EXTRACT(DAY FROM (NOW() - act.last_at))::INT,
         p.created_at
  FROM public.profiles p
  LEFT JOIN LATERAL (
    SELECT MAX(started_at) AS last_at
      FROM public.analytics_sessions WHERE user_id = p.id
  ) act ON TRUE
  WHERE p.is_subscribed = TRUE
    AND (act.last_at IS NULL OR act.last_at < NOW() - INTERVAL '14 days')
  ORDER BY act.last_at ASC NULLS FIRST
  LIMIT lim;
EXCEPTION WHEN undefined_table OR undefined_column THEN RETURN;
END;
$$;


-- ── Cost tracking: the missing half of unit economics ────────────────────────
-- Nothing currently records what it costs to serve a user. Claude API calls,
-- TTS minutes, video render minutes, storage egress and call minutes are all
-- real money leaving the business per active user. Without this, gross margin
-- at $9/month is unknown.
--
-- Producers write one row per billable operation. Keep the grain coarse
-- (one row per request is fine; one row per token is not).
CREATE TABLE IF NOT EXISTS public.analytics_cost_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  service      TEXT NOT NULL,        -- 'anthropic' | 'openai' | 'kokoro' | 'render' | 'storage' | 'agora' | 'other'
  operation    TEXT NOT NULL,        -- 'ai_reading' | 'fragments_guidance' | 'reel_render' | 'tts' | ...
  cost_cents   NUMERIC(12, 4) NOT NULL DEFAULT 0,
  quantity     NUMERIC(14, 4),       -- tokens, seconds, MB — whatever the unit is
  unit         TEXT,                 -- 'tokens' | 'seconds' | 'mb' | 'requests'
  metadata     JSONB DEFAULT '{}',
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cost_events_occurred ON public.analytics_cost_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_cost_events_service  ON public.analytics_cost_events(service, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_cost_events_user     ON public.analytics_cost_events(user_id, occurred_at DESC);

ALTER TABLE public.analytics_cost_events ENABLE ROW LEVEL SECURITY;
-- Server-side only. No client ever reads or writes this.
GRANT SELECT, INSERT ON public.analytics_cost_events TO service_role;


-- Gross margin per active user: revenue in, cost of goods out.
CREATE OR REPLACE FUNCTION public.analytics_unit_economics(range_days INT DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since      TIMESTAMPTZ := NOW() - (range_days || ' days')::INTERVAL;
  v_cost     NUMERIC := 0;
  v_by_svc   jsonb := '[]'::jsonb;
  v_by_op    jsonb := '[]'::jsonb;
  v_rev      NUMERIC := 0;
  v_actives  BIGINT := 0;
  v_payouts  NUMERIC := 0;
BEGIN
  SELECT COALESCE(SUM(cost_cents), 0) INTO v_cost
    FROM public.analytics_cost_events WHERE occurred_at >= since;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('service', s, 'cost_cents', c) ORDER BY c DESC), '[]'::jsonb)
    INTO v_by_svc
    FROM (SELECT service AS s, ROUND(SUM(cost_cents), 2) AS c
            FROM public.analytics_cost_events WHERE occurred_at >= since GROUP BY 1) a;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('operation', o, 'cost_cents', c, 'calls', n) ORDER BY c DESC), '[]'::jsonb)
    INTO v_by_op
    FROM (SELECT operation AS o, ROUND(SUM(cost_cents), 2) AS c, COUNT(*) AS n
            FROM public.analytics_cost_events WHERE occurred_at >= since GROUP BY 1 LIMIT 20) b;

  BEGIN
    SELECT COALESCE(SUM(net_revenue_cents), 0) INTO v_rev
      FROM public.revenue_events WHERE occurred_at >= since;
  EXCEPTION WHEN undefined_table THEN v_rev := 0; END;

  BEGIN
    SELECT COALESCE(SUM(amount_cents), 0) INTO v_payouts
      FROM public.creator_earnings WHERE created_at >= since;
  EXCEPTION WHEN undefined_table THEN v_payouts := 0; END;

  BEGIN
    SELECT COUNT(DISTINCT COALESCE(user_id::text, anon_id)) INTO v_actives
      FROM public.analytics_sessions WHERE started_at >= since;
  EXCEPTION WHEN undefined_table THEN v_actives := 0; END;

  RETURN jsonb_build_object(
    'range_days',           range_days,
    'revenue_cents',        v_rev,
    'infra_cost_cents',     ROUND(v_cost, 2),
    'creator_payout_cents', v_payouts,
    'gross_margin_cents',   ROUND(v_rev - v_cost - v_payouts, 2),
    'gross_margin_pct',     CASE WHEN v_rev > 0
                                 THEN ROUND((v_rev - v_cost - v_payouts) * 100 / v_rev, 1) END,
    'active_users',         v_actives,
    'cost_per_active_cents',CASE WHEN v_actives > 0 THEN ROUND(v_cost / v_actives, 3) END,
    'revenue_per_active_cents', CASE WHEN v_actives > 0 THEN ROUND(v_rev / v_actives, 3) END,
    'cost_by_service',      v_by_svc,
    'cost_by_operation',    v_by_op
  );
EXCEPTION WHEN undefined_table THEN
  RETURN jsonb_build_object('error', 'missing_tables');
END;
$$;


-- ═════════════════════════════════════════════════════════════════════════════
-- C. TECHNICAL HEALTH
-- ═════════════════════════════════════════════════════════════════════════════

-- Version adoption. app_version has been collected on every session since
-- Phase 1 and never displayed — so "what percent are on the latest build" has
-- been one query away and unanswerable at a glance.
CREATE OR REPLACE FUNCTION public.analytics_version_adoption(range_days INT DEFAULT 7)
RETURNS TABLE (
  platform    TEXT,
  app_version TEXT,
  users       BIGINT,
  sessions    BIGINT,
  share_pct   NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH s AS (
    SELECT COALESCE(av.platform, 'unknown')::TEXT AS plat,
           COALESCE(av.app_version, 'unknown')::TEXT AS ver,
           COALESCE(av.user_id::text, av.anon_id) AS ident
      FROM public.analytics_sessions av
     WHERE av.started_at >= (CURRENT_DATE - range_days)
  )
  SELECT s.plat, s.ver,
         COUNT(DISTINCT s.ident),
         COUNT(*),
         ROUND(COUNT(*)::numeric * 100 / NULLIF(SUM(COUNT(*)) OVER (PARTITION BY s.plat), 0), 1)
  FROM s
  GROUP BY s.plat, s.ver
  ORDER BY s.plat, 4 DESC;
EXCEPTION WHEN undefined_table THEN RETURN;
END;
$$;


-- Performance + reliability from emitted events. perf_timing already flows
-- (performanceTracing.ts); the error / upload / render events arrive with the
-- Phase 1 instrumentation pass.
CREATE OR REPLACE FUNCTION public.analytics_tech_health(range_days INT DEFAULT 7)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since       TIMESTAMPTZ := NOW() - (range_days || ' days')::INTERVAL;
  v_perf      jsonb := '[]'::jsonb;
  v_errors    BIGINT := 0;
  v_sessions  BIGINT := 0;
  v_crash     BIGINT := 0;
  v_up_ok     BIGINT := 0;
  v_up_fail   BIGINT := 0;
  v_rd_ok     BIGINT := 0;
  v_rd_fail   BIGINT := 0;
  v_top_err   jsonb := '[]'::jsonb;
BEGIN
  -- p50 / p95 / p99 per traced operation.
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'operation', op, 'samples', n,
           'p50_ms', p50, 'p95_ms', p95, 'p99_ms', p99) ORDER BY n DESC), '[]'::jsonb)
    INTO v_perf
    FROM (
      SELECT COALESCE(event_data->>'name', event_data->>'operation', 'unknown') AS op,
             COUNT(*) AS n,
             ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY (event_data->>'ms')::numeric)) AS p50,
             ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY (event_data->>'ms')::numeric)) AS p95,
             ROUND(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY (event_data->>'ms')::numeric)) AS p99
        FROM public.analytics_events
       WHERE event_name = 'perf_timing'
         AND created_at >= since
         AND event_data ? 'ms'
       GROUP BY 1
       ORDER BY 2 DESC
       LIMIT 25
    ) p;

  SELECT
    COUNT(*) FILTER (WHERE event_name = 'client_error'),
    COUNT(*) FILTER (WHERE event_name = 'app_crash'),
    COUNT(*) FILTER (WHERE event_name = 'upload_completed'),
    COUNT(*) FILTER (WHERE event_name = 'upload_failed'),
    COUNT(*) FILTER (WHERE event_name = 'render_completed'),
    COUNT(*) FILTER (WHERE event_name = 'render_failed')
  INTO v_errors, v_crash, v_up_ok, v_up_fail, v_rd_ok, v_rd_fail
  FROM public.analytics_events
  WHERE created_at >= since;

  SELECT COUNT(*) INTO v_sessions
    FROM public.analytics_sessions WHERE started_at >= since;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('message', m, 'count', n) ORDER BY n DESC), '[]'::jsonb)
    INTO v_top_err
    FROM (
      SELECT LEFT(COALESCE(event_data->>'message', 'unknown'), 120) AS m, COUNT(*) AS n
        FROM public.analytics_events
       WHERE event_name IN ('client_error', 'api_error') AND created_at >= since
       GROUP BY 1 ORDER BY 2 DESC LIMIT 15
    ) e;

  RETURN jsonb_build_object(
    'range_days',        range_days,
    'sessions',          v_sessions,
    'client_errors',     v_errors,
    'crashes',           v_crash,
    'crash_free_session_pct', CASE WHEN v_sessions > 0
                                   THEN ROUND(100 - (v_crash::numeric * 100 / v_sessions), 2) END,
    'errors_per_session',CASE WHEN v_sessions > 0 THEN ROUND(v_errors::numeric / v_sessions, 3) END,
    'uploads_ok',        v_up_ok,
    'uploads_failed',    v_up_fail,
    'upload_success_pct',CASE WHEN (v_up_ok + v_up_fail) > 0
                              THEN ROUND(v_up_ok::numeric * 100 / (v_up_ok + v_up_fail), 1) END,
    'renders_ok',        v_rd_ok,
    'renders_failed',    v_rd_fail,
    'render_success_pct',CASE WHEN (v_rd_ok + v_rd_fail) > 0
                              THEN ROUND(v_rd_ok::numeric * 100 / (v_rd_ok + v_rd_fail), 1) END,
    'perf',              v_perf,
    'top_errors',        v_top_err
  );
EXCEPTION WHEN undefined_table THEN
  RETURN jsonb_build_object('error', 'missing_tables');
END;
$$;


-- ═════════════════════════════════════════════════════════════════════════════
-- D. NOTIFICATIONS
-- ═════════════════════════════════════════════════════════════════════════════

-- Push performance. Sends come from push_notification_log (already written);
-- opens come from the push_opened event the app emits when a notification is
-- tapped (Phase 1 instrumentation).
CREATE OR REPLACE FUNCTION public.analytics_push_metrics(range_days INT DEFAULT 7)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since      TIMESTAMPTZ := NOW() - (range_days || ' days')::INTERVAL;
  v_sent     BIGINT := 0;
  v_failed   BIGINT := 0;
  v_recip    BIGINT := 0;
  v_opened   BIGINT := 0;
  v_devices  BIGINT := 0;
  v_stale    BIGINT := 0;
  v_members  BIGINT := 0;
  v_per_user NUMERIC;
  v_by_type  jsonb := '[]'::jsonb;
BEGIN
  SELECT COUNT(*) FILTER (WHERE status = 'sent'),
         COUNT(*) FILTER (WHERE status <> 'sent' OR error_message IS NOT NULL),
         COUNT(DISTINCT user_id)
    INTO v_sent, v_failed, v_recip
    FROM public.push_notification_log WHERE created_at >= since;

  BEGIN
    SELECT COUNT(*) INTO v_opened
      FROM public.analytics_events
     WHERE event_name = 'push_opened' AND created_at >= since;
  EXCEPTION WHEN undefined_table THEN v_opened := 0; END;

  BEGIN
    SELECT COUNT(*) FILTER (WHERE is_active = TRUE),
           COUNT(*) FILTER (WHERE is_active = TRUE AND last_seen_at < NOW() - INTERVAL '60 days')
      INTO v_devices, v_stale
      FROM public.push_devices;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  SELECT COUNT(*) INTO v_members FROM public.profiles;

  v_per_user := CASE WHEN v_recip > 0 THEN ROUND(v_sent::numeric / v_recip / GREATEST(range_days, 1), 2) END;

  -- Opens split by notification type (from the event payload).
  BEGIN
    SELECT COALESCE(jsonb_agg(jsonb_build_object('type', t, 'opens', n) ORDER BY n DESC), '[]'::jsonb)
      INTO v_by_type
      FROM (SELECT COALESCE(event_data->>'type', 'unspecified') AS t, COUNT(*) AS n
              FROM public.analytics_events
             WHERE event_name = 'push_opened' AND created_at >= since
             GROUP BY 1) x;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  RETURN jsonb_build_object(
    'range_days',        range_days,
    'sent',              v_sent,
    'failed',            v_failed,
    'recipients',        v_recip,
    'opened',            v_opened,
    'open_rate_pct',     CASE WHEN v_sent > 0 THEN ROUND(v_opened::numeric * 100 / v_sent, 1) END,
    'active_devices',    v_devices,
    'stale_devices',     v_stale,
    'members',           v_members,
    'reach_pct',         CASE WHEN v_members > 0 THEN ROUND(v_devices::numeric * 100 / v_members, 1) END,
    'sends_per_user_per_day', v_per_user,
    'opens_by_type',     v_by_type
  );
EXCEPTION WHEN undefined_table THEN
  RETURN jsonb_build_object('error', 'missing_tables');
END;
$$;


-- ═════════════════════════════════════════════════════════════════════════════
-- E. GRANTS
-- ═════════════════════════════════════════════════════════════════════════════

GRANT EXECUTE ON FUNCTION public.analytics_retention_rollup(INT)   TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_cohort_grid(INT)        TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_power_users()           TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_lifecycle(INT)          TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_activation()            TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_revenue_exact(INT)      TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_mrr_trend(INT)          TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_paywall_funnel(INT)     TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_churn_risk(INT)         TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_unit_economics(INT)     TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_version_adoption(INT)   TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_tech_health(INT)        TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_push_metrics(INT)       TO service_role;


-- ═════════════════════════════════════════════════════════════════════════════
-- F. RE-RUN RETENTION WITH THE WIDER OFFSETS
-- ═════════════════════════════════════════════════════════════════════════════

SELECT public.analytics_retention_rollup(120);


-- ═════════════════════════════════════════════════════════════════════════════
-- G. SMOKE TEST
-- ═════════════════════════════════════════════════════════════════════════════
-- SELECT public.analytics_power_users();
-- SELECT public.analytics_lifecycle(7);
-- SELECT public.analytics_activation();
-- SELECT public.analytics_revenue_exact(30);
-- SELECT public.analytics_paywall_funnel(30);
-- SELECT public.analytics_unit_economics(30);
-- SELECT public.analytics_tech_health(7);
-- SELECT public.analytics_push_metrics(7);
-- SELECT * FROM public.analytics_cohort_grid(12);
-- SELECT * FROM public.analytics_version_adoption(7);
-- SELECT * FROM public.analytics_mrr_trend(6);
-- SELECT * FROM public.analytics_churn_risk(50);
