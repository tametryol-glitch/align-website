-- =============================================================================
-- Align — Product Analytics (Phase 7): control systems
-- =============================================================================
-- The capabilities that turn a MONITORED app into a CONTROLLED one:
--
--   1. FEATURE FLAGS      — remote on/off + percentage rollout + kill switches,
--                           so a broken feature can be disabled without waiting
--                           on an app-store review.
--   2. EXPERIMENTS        — deterministic A/B assignment, exposure logging and
--                           per-variant results.
--   3. ALERTS             — threshold + anomaly rules evaluated by cron, so a
--                           DAU collapse or revenue flatline finds YOU.
--   4. ADMIN AUDIT LOG    — who changed what in the admin panel.
--
-- All new tables. Nothing here modifies existing objects.
-- Idempotent + safe to re-run. Run in the Supabase SQL editor.
-- =============================================================================


-- ═════════════════════════════════════════════════════════════════════════════
-- 1. FEATURE FLAGS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.feature_flags (
  key          TEXT PRIMARY KEY,
  description  TEXT NOT NULL DEFAULT '',
  enabled      BOOLEAN NOT NULL DEFAULT FALSE,
  -- 0–100. Applies only when enabled = TRUE. Deterministic per identity, so a
  -- given user stays on the same side of the line as the percentage grows.
  rollout_pct  SMALLINT NOT NULL DEFAULT 100 CHECK (rollout_pct BETWEEN 0 AND 100),
  -- Optional narrowing, e.g. {"platform":["ios"],"min_version":"1.4.0"}.
  targeting    JSONB NOT NULL DEFAULT '{}',
  -- TRUE marks this as an emergency kill switch: surfaces first in the admin UI.
  is_kill_switch BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Flags are not secret — every client needs to read them to render correctly.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies
                  WHERE tablename = 'feature_flags' AND policyname = 'feature_flags_read') THEN
    CREATE POLICY "feature_flags_read" ON public.feature_flags
      FOR SELECT USING (TRUE);
  END IF;
END $$;

GRANT SELECT ON public.feature_flags TO anon, authenticated;
GRANT ALL    ON public.feature_flags TO service_role;


-- Deterministic bucket for an identity, 0–99. Stable across calls and devices
-- for the same (key, identity) pair, so raising rollout_pct only ever ADDS
-- users — it never reshuffles who is already in.
CREATE OR REPLACE FUNCTION public.stable_bucket(salt TEXT, ident TEXT)
RETURNS SMALLINT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (ABS(hashtextextended(salt || ':' || COALESCE(ident, ''), 0)) % 100)::SMALLINT;
$$;


-- Resolve every flag for one identity in a single round trip.
CREATE OR REPLACE FUNCTION public.feature_flags_for(ident TEXT)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v jsonb;
BEGIN
  SELECT COALESCE(jsonb_object_agg(f.key,
           f.enabled AND public.stable_bucket(f.key, ident) < f.rollout_pct
         ), '{}'::jsonb)
    INTO v
    FROM public.feature_flags f;
  RETURN v;
EXCEPTION WHEN undefined_table THEN RETURN '{}'::jsonb;
END;
$$;

GRANT EXECUTE ON FUNCTION public.feature_flags_for(TEXT) TO anon, authenticated, service_role;


-- ═════════════════════════════════════════════════════════════════════════════
-- 2. EXPERIMENTS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.experiments (
  key          TEXT PRIMARY KEY,
  description  TEXT NOT NULL DEFAULT '',
  hypothesis   TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft', 'running', 'paused', 'concluded')),
  -- ["control","variant_a"] — first entry is the control by convention.
  variants     JSONB NOT NULL DEFAULT '["control","variant"]',
  -- Share of traffic entering the experiment at all. The rest never see it.
  traffic_pct  SMALLINT NOT NULL DEFAULT 100 CHECK (traffic_pct BETWEEN 0 AND 100),
  -- Event name that counts as success, e.g. 'purchase_completed'.
  primary_metric TEXT,
  -- Metrics that must NOT regress, e.g. ["app_crash","client_error"].
  guardrails   JSONB NOT NULL DEFAULT '[]',
  winner       TEXT,
  started_at   TIMESTAMPTZ,
  ended_at     TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.experiment_assignments (
  experiment_key TEXT NOT NULL REFERENCES public.experiments(key) ON DELETE CASCADE,
  ident          TEXT NOT NULL,     -- user_id::text or anon_id
  variant        TEXT NOT NULL,
  assigned_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (experiment_key, ident)
);

CREATE INDEX IF NOT EXISTS idx_exp_assign_key ON public.experiment_assignments(experiment_key, variant);

ALTER TABLE public.experiments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_assignments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies
                  WHERE tablename = 'experiments' AND policyname = 'experiments_read') THEN
    CREATE POLICY "experiments_read" ON public.experiments
      FOR SELECT USING (status = 'running');
  END IF;
END $$;

GRANT SELECT ON public.experiments TO anon, authenticated;
GRANT ALL    ON public.experiments, public.experiment_assignments TO service_role;


-- Assign (and record) a variant for one identity. Deterministic: the same
-- identity always lands in the same variant, so refreshes and reinstalls do
-- not contaminate the result. Returns NULL when the identity is outside the
-- experiment's traffic slice or the experiment is not running.
CREATE OR REPLACE FUNCTION public.experiment_assign(exp_key TEXT, ident TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  e         RECORD;
  v_count   INT;
  v_bucket  SMALLINT;
  v_variant TEXT;
BEGIN
  SELECT * INTO e FROM public.experiments WHERE key = exp_key;
  IF NOT FOUND OR e.status <> 'running' THEN RETURN NULL; END IF;

  -- Traffic gate uses a different salt from variant selection so the two
  -- decisions are independent.
  IF public.stable_bucket(exp_key || ':traffic', ident) >= e.traffic_pct THEN
    RETURN NULL;
  END IF;

  SELECT variant INTO v_variant
    FROM public.experiment_assignments
   WHERE experiment_key = exp_key AND experiment_assignments.ident = experiment_assign.ident;
  IF v_variant IS NOT NULL THEN RETURN v_variant; END IF;

  v_count  := GREATEST(jsonb_array_length(e.variants), 1);
  v_bucket := public.stable_bucket(exp_key, ident);
  v_variant := e.variants ->> (v_bucket % v_count);

  INSERT INTO public.experiment_assignments (experiment_key, ident, variant)
  VALUES (exp_key, ident, v_variant)
  ON CONFLICT (experiment_key, ident) DO NOTHING;

  RETURN v_variant;
END;
$$;

GRANT EXECUTE ON FUNCTION public.experiment_assign(TEXT, TEXT) TO authenticated, service_role;


-- Per-variant results for a running experiment, including guardrails.
CREATE OR REPLACE FUNCTION public.analytics_experiment_results(exp_key TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  e        RECORD;
  v_rows   jsonb := '[]'::jsonb;
  v_guards jsonb := '[]'::jsonb;
BEGIN
  SELECT * INTO e FROM public.experiments WHERE key = exp_key;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'unknown_experiment'); END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'variant', variant,
           'exposed', exposed,
           'converted', converted,
           'conversion_pct',
             CASE WHEN exposed > 0 THEN ROUND(converted::numeric * 100 / exposed, 2) END
         ) ORDER BY variant), '[]'::jsonb)
    INTO v_rows
    FROM (
      SELECT a.variant,
             COUNT(DISTINCT a.ident) AS exposed,
             COUNT(DISTINCT ev.ident) AS converted
        FROM public.experiment_assignments a
        LEFT JOIN LATERAL (
          SELECT DISTINCT COALESCE(x.user_id::text, x.anon_id) AS ident
            FROM public.analytics_events x
           WHERE x.event_name = e.primary_metric
             AND x.created_at >= a.assigned_at
             AND COALESCE(x.user_id::text, x.anon_id) = a.ident
        ) ev ON TRUE
       WHERE a.experiment_key = exp_key
       GROUP BY a.variant
    ) r;

  -- Guardrail counts per variant: these must not regress in the treatment.
  IF jsonb_array_length(e.guardrails) > 0 THEN
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
             'variant', variant, 'metric', metric, 'count', n) ORDER BY variant, metric), '[]'::jsonb)
      INTO v_guards
      FROM (
        SELECT a.variant, g.metric, COUNT(x.id) AS n
          FROM public.experiment_assignments a
          CROSS JOIN LATERAL jsonb_array_elements_text(e.guardrails) AS g(metric)
          LEFT JOIN public.analytics_events x
            ON COALESCE(x.user_id::text, x.anon_id) = a.ident
           AND x.event_name = g.metric
           AND x.created_at >= a.assigned_at
         WHERE a.experiment_key = exp_key
         GROUP BY a.variant, g.metric
      ) gg;
  END IF;

  RETURN jsonb_build_object(
    'key',            e.key,
    'status',         e.status,
    'primary_metric', e.primary_metric,
    'started_at',     e.started_at,
    'variants',       v_rows,
    'guardrails',     v_guards
  );
EXCEPTION WHEN undefined_table THEN
  RETURN jsonb_build_object('error', 'missing_tables');
END;
$$;

GRANT EXECUTE ON FUNCTION public.analytics_experiment_results(TEXT) TO service_role;


-- ═════════════════════════════════════════════════════════════════════════════
-- 3. ALERTS
-- ═════════════════════════════════════════════════════════════════════════════
-- Right now a total outage is only detected by someone happening to look at the
-- dashboard. These rules are evaluated on a schedule and fire into a log the
-- cron route reads and emails.

CREATE TABLE IF NOT EXISTS public.analytics_alert_rules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  -- Which number to watch.
  metric        TEXT NOT NULL
                CHECK (metric IN ('dau', 'signups', 'sessions', 'revenue_cents',
                                  'errors', 'crashes', 'reports_open',
                                  'upload_failures', 'push_failures')),
  -- 'drop_pct'  → fired when today is >= threshold % BELOW the trailing mean
  -- 'spike_pct' → fired when today is >= threshold % ABOVE the trailing mean
  -- 'below'     → fired when today's absolute value is under threshold
  -- 'above'     → fired when today's absolute value is over threshold
  condition     TEXT NOT NULL CHECK (condition IN ('drop_pct', 'spike_pct', 'below', 'above')),
  threshold     NUMERIC NOT NULL,
  baseline_days SMALLINT NOT NULL DEFAULT 7,
  enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  -- Suppression so one bad day does not send twelve emails.
  cooldown_hours SMALLINT NOT NULL DEFAULT 12,
  last_fired_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_alert_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id       UUID REFERENCES public.analytics_alert_rules(id) ON DELETE CASCADE,
  rule_name     TEXT NOT NULL,
  metric        TEXT NOT NULL,
  observed      NUMERIC,
  baseline      NUMERIC,
  message       TEXT NOT NULL,
  notified_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_events_created ON public.analytics_alert_events(created_at DESC);

ALTER TABLE public.analytics_alert_rules  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_alert_events ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.analytics_alert_rules, public.analytics_alert_events TO service_role;


-- Current value of a watched metric (today so far).
CREATE OR REPLACE FUNCTION public.analytics_metric_value(metric_name TEXT, on_day DATE)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v NUMERIC := 0;
BEGIN
  CASE metric_name
    WHEN 'dau' THEN
      SELECT COUNT(DISTINCT COALESCE(user_id::text, anon_id)) INTO v
        FROM public.analytics_sessions WHERE started_at::date = on_day;
    WHEN 'sessions' THEN
      SELECT COUNT(*) INTO v
        FROM public.analytics_sessions WHERE started_at::date = on_day;
    WHEN 'signups' THEN
      SELECT COUNT(*) INTO v FROM public.profiles WHERE created_at::date = on_day;
    WHEN 'revenue_cents' THEN
      SELECT COALESCE(SUM(net_revenue_cents), 0) INTO v
        FROM public.revenue_events WHERE occurred_at::date = on_day;
    WHEN 'errors' THEN
      SELECT COUNT(*) INTO v FROM public.analytics_events
       WHERE event_name IN ('client_error', 'api_error') AND created_at::date = on_day;
    WHEN 'crashes' THEN
      SELECT COUNT(*) INTO v FROM public.analytics_events
       WHERE event_name = 'app_crash' AND created_at::date = on_day;
    WHEN 'upload_failures' THEN
      SELECT COUNT(*) INTO v FROM public.analytics_events
       WHERE event_name = 'upload_failed' AND created_at::date = on_day;
    WHEN 'push_failures' THEN
      SELECT COUNT(*) INTO v FROM public.push_notification_log
       WHERE created_at::date = on_day AND (status <> 'sent' OR error_message IS NOT NULL);
    WHEN 'reports_open' THEN
      SELECT COUNT(*) INTO v FROM public.reports WHERE status IN ('pending', 'reviewing');
    ELSE v := 0;
  END CASE;
  RETURN COALESCE(v, 0);
EXCEPTION WHEN OTHERS THEN RETURN 0;
END;
$$;


-- Evaluate every enabled rule. Returns the alerts that fired this run (also
-- written to analytics_alert_events for the digest / notifier to pick up).
CREATE OR REPLACE FUNCTION public.analytics_alert_check()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r          RECORD;
  v_today    NUMERIC;
  v_base     NUMERIC;
  v_delta    NUMERIC;
  v_fire     BOOLEAN;
  v_msg      TEXT;
  v_fired    jsonb := '[]'::jsonb;
BEGIN
  FOR r IN
    SELECT * FROM public.analytics_alert_rules
     WHERE enabled = TRUE
       AND (last_fired_at IS NULL
            OR last_fired_at < NOW() - (cooldown_hours || ' hours')::INTERVAL)
  LOOP
    v_today := public.analytics_metric_value(r.metric, CURRENT_DATE);

    -- Trailing mean over the baseline window, excluding today.
    SELECT COALESCE(AVG(public.analytics_metric_value(r.metric, d::date)), 0)
      INTO v_base
      FROM generate_series(CURRENT_DATE - r.baseline_days, CURRENT_DATE - 1, '1 day') AS d;

    v_fire := FALSE;
    v_msg  := NULL;

    IF r.condition = 'drop_pct' AND v_base > 0 THEN
      v_delta := (v_base - v_today) * 100 / v_base;
      IF v_delta >= r.threshold THEN
        v_fire := TRUE;
        v_msg := format('%s fell %s%% below its %s-day average (%s vs %s).',
                        r.metric, ROUND(v_delta, 1), r.baseline_days,
                        ROUND(v_today, 2), ROUND(v_base, 2));
      END IF;

    ELSIF r.condition = 'spike_pct' AND v_base > 0 THEN
      v_delta := (v_today - v_base) * 100 / v_base;
      IF v_delta >= r.threshold THEN
        v_fire := TRUE;
        v_msg := format('%s is %s%% above its %s-day average (%s vs %s).',
                        r.metric, ROUND(v_delta, 1), r.baseline_days,
                        ROUND(v_today, 2), ROUND(v_base, 2));
      END IF;

    ELSIF r.condition = 'below' AND v_today < r.threshold THEN
      v_fire := TRUE;
      v_msg := format('%s is %s, below the floor of %s.', r.metric, ROUND(v_today, 2), r.threshold);

    ELSIF r.condition = 'above' AND v_today > r.threshold THEN
      v_fire := TRUE;
      v_msg := format('%s is %s, above the ceiling of %s.', r.metric, ROUND(v_today, 2), r.threshold);
    END IF;

    IF v_fire THEN
      INSERT INTO public.analytics_alert_events (rule_id, rule_name, metric, observed, baseline, message)
      VALUES (r.id, r.name, r.metric, v_today, v_base, v_msg);

      UPDATE public.analytics_alert_rules SET last_fired_at = NOW() WHERE id = r.id;

      v_fired := v_fired || jsonb_build_object(
        'rule', r.name, 'metric', r.metric,
        'observed', v_today, 'baseline', ROUND(v_base, 2), 'message', v_msg);
    END IF;
  END LOOP;

  RETURN jsonb_build_object('fired', jsonb_array_length(v_fired), 'alerts', v_fired);
END;
$$;

GRANT EXECUTE ON FUNCTION public.analytics_metric_value(TEXT, DATE) TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_alert_check()            TO service_role;


-- ── Sensible starting rules ──────────────────────────────────────────────────
-- Conservative thresholds so the first week is not all noise. Tune in the
-- admin panel once you know what a normal day looks like.
INSERT INTO public.analytics_alert_rules (name, metric, condition, threshold, baseline_days)
SELECT * FROM (VALUES
  ('Daily actives collapsed',      'dau',             'drop_pct',  40, 7),
  ('Signups stopped',              'signups',         'below',      1, 7),
  ('Revenue flatlined',            'revenue_cents',   'drop_pct',  60, 14),
  ('Client errors spiking',        'errors',          'spike_pct', 200, 7),
  ('Crashes spiking',              'crashes',         'spike_pct', 150, 7),
  ('Uploads failing',              'upload_failures', 'spike_pct', 200, 7),
  ('Push delivery failing',        'push_failures',   'spike_pct', 200, 7),
  ('Moderation queue backing up',  'reports_open',    'above',     25, 7)
) AS v(name, metric, condition, threshold, baseline_days)
WHERE NOT EXISTS (SELECT 1 FROM public.analytics_alert_rules);


-- ═════════════════════════════════════════════════════════════════════════════
-- 4. ADMIN AUDIT LOG
-- ═════════════════════════════════════════════════════════════════════════════
-- Needed the moment anyone besides the founder has admin access.

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_email TEXT,
  action      TEXT NOT NULL,          -- 'flag.update' | 'report.resolve' | 'user.ban' | ...
  target_type TEXT,                   -- 'feature_flag' | 'report' | 'profile' | ...
  target_id   TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}',
  ip_country  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor   ON public.admin_audit_log(actor_id, created_at DESC);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.admin_audit_log TO service_role;


-- ═════════════════════════════════════════════════════════════════════════════
-- 5. SCHEDULE
-- ═════════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  PERFORM cron.unschedule('align-analytics-alerts')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'align-analytics-alerts');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Every hour at :10. The cooldown on each rule prevents repeat spam.
SELECT cron.schedule('align-analytics-alerts', '10 * * * *',
  $$ SELECT public.analytics_alert_check(); $$);


-- ═════════════════════════════════════════════════════════════════════════════
-- 6. SMOKE TEST
-- ═════════════════════════════════════════════════════════════════════════════
-- SELECT public.feature_flags_for('some-user-id');
-- SELECT public.analytics_alert_check();
-- SELECT * FROM public.analytics_alert_rules ORDER BY name;
-- SELECT * FROM public.analytics_alert_events ORDER BY created_at DESC LIMIT 20;
--
-- Create a flag:
--   INSERT INTO public.feature_flags (key, description, enabled, rollout_pct)
--   VALUES ('new_feed_ranking', 'Velocity-based feed ranking', TRUE, 10);
--
-- Create an experiment:
--   INSERT INTO public.experiments (key, description, status, variants, primary_metric, guardrails)
--   VALUES ('paywall_copy_v2', 'Shorter paywall headline', 'running',
--           '["control","short"]', 'purchase_completed', '["app_crash","client_error"]');
--   SELECT public.experiment_assign('paywall_copy_v2', 'some-user-id');
--   SELECT public.analytics_experiment_results('paywall_copy_v2');
