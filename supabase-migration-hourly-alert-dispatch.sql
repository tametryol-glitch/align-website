-- =============================================================================
-- Align — Hourly alert DELIVERY from Postgres
-- =============================================================================
-- Vercel Hobby plans only allow once-per-day cron schedules, so the alert
-- delivery cron had to be removed from vercel.json (it was failing every
-- deployment). Evaluation was never affected — the pg_cron job installed by
-- the phase 7 migration already runs analytics_alert_check() hourly inside
-- Postgres — but with delivery on the daily digest, a DAU collapse could sit
-- unread for up to 24 hours.
--
-- This closes that gap without a plan change: pg_cron evaluates AND, when
-- something actually fired, calls the existing delivery endpoint over pg_net.
-- Same email code, same dedupe via notified_at — only the trigger moves.
--
-- SECRET HANDLING
-- ---------------
-- The endpoint needs the CRON_SECRET bearer token. It is deliberately NOT
-- inlined in the function body: any role that can read pg_proc can read a
-- function's source, and `authenticated` can. It lives in app_secrets, which
-- has RLS enabled and NO policies, so PostgREST exposes nothing to anon or
-- authenticated. pg_cron jobs run as the scheduling superuser and bypass RLS,
-- which is exactly the access pattern we want.
--
-- YOU MUST RUN STEP 2 with your real CRON_SECRET or nothing will be sent.
--
-- Idempotent + safe to re-run. Run in the Supabase SQL editor.
-- =============================================================================


-- ═════════════════════════════════════════════════════════════════════════════
-- 1. SECRET STORE
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.app_secrets (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  note       TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;

-- No policies are created on purpose: with RLS on and zero policies, every
-- non-superuser role is denied. Belt and braces, revoke the grants too.
REVOKE ALL ON public.app_secrets FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.app_secrets TO service_role;


-- ═════════════════════════════════════════════════════════════════════════════
-- 2. >>> EDIT THIS LINE <<<
-- ═════════════════════════════════════════════════════════════════════════════
-- Replace PASTE_YOUR_CRON_SECRET_HERE with the CRON_SECRET from your Vercel
-- project env vars (Settings → Environment Variables → CRON_SECRET).

INSERT INTO public.app_secrets (key, value, note)
VALUES ('cron_secret', 'PASTE_YOUR_CRON_SECRET_HERE', 'Bearer token for /api/cron/* routes')
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value, updated_at = NOW();


-- ═════════════════════════════════════════════════════════════════════════════
-- 3. EVALUATE, THEN DELIVER ONLY IF SOMETHING FIRED
-- ═════════════════════════════════════════════════════════════════════════════
-- The "only if something fired" gate matters: Hobby plans meter serverless
-- invocations, and calling the endpoint 24×/day to report nothing would burn
-- them for no reason. Quiet hours cost zero requests.

CREATE OR REPLACE FUNCTION public.analytics_dispatch_alerts()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_check   jsonb;
  v_pending INT := 0;
  v_secret  TEXT;
  v_req     BIGINT;
BEGIN
  -- Evaluate the rules (this is what the phase 7 cron already did).
  BEGIN
    v_check := public.analytics_alert_check();
  EXCEPTION WHEN OTHERS THEN
    v_check := jsonb_build_object('error', SQLERRM);
  END;

  SELECT COUNT(*) INTO v_pending
    FROM public.analytics_alert_events
   WHERE notified_at IS NULL;

  IF v_pending = 0 THEN
    RETURN jsonb_build_object('evaluated', v_check, 'pending', 0, 'dispatched', false);
  END IF;

  SELECT value INTO v_secret FROM public.app_secrets WHERE key = 'cron_secret';

  IF v_secret IS NULL OR v_secret = '' OR v_secret = 'PASTE_YOUR_CRON_SECRET_HERE' THEN
    RETURN jsonb_build_object(
      'evaluated', v_check, 'pending', v_pending, 'dispatched', false,
      'error', 'cron_secret not set in app_secrets — see step 2 of this migration');
  END IF;

  -- pg_net is async: this queues the request and returns an id immediately.
  -- The route marks the events notified_at, so the next tick will not resend.
  SELECT net.http_post(
    url     := 'https://www.aligncosmic.com/api/cron/analytics-digest?mode=alerts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_secret
    ),
    body    := '{}'::jsonb
  ) INTO v_req;

  RETURN jsonb_build_object(
    'evaluated', v_check, 'pending', v_pending,
    'dispatched', true, 'request_id', v_req);
END;
$$;

GRANT EXECUTE ON FUNCTION public.analytics_dispatch_alerts() TO service_role;


-- ═════════════════════════════════════════════════════════════════════════════
-- 4. RESCHEDULE
-- ═════════════════════════════════════════════════════════════════════════════
-- Replaces the phase 7 job, which only evaluated. Same name, so this swaps
-- cleanly rather than leaving two jobs running.

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  PERFORM cron.unschedule('align-analytics-alerts')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'align-analytics-alerts');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule('align-analytics-alerts', '10 * * * *',
  $$ SELECT public.analytics_dispatch_alerts(); $$);


-- ═════════════════════════════════════════════════════════════════════════════
-- 5. VERIFY
-- ═════════════════════════════════════════════════════════════════════════════
-- Confirm the secret landed and is not the placeholder:
--   SELECT key, left(value, 4) || '…' AS preview, updated_at FROM public.app_secrets;
--
-- Confirm anon/authenticated genuinely cannot read it — both should return 0:
--   SET LOCAL ROLE authenticated;
--   SELECT count(*) FROM public.app_secrets;
--   RESET ROLE;
--
-- Run a dispatch by hand (safe — sends only if something actually fired):
--   SELECT public.analytics_dispatch_alerts();
--
-- Check the schedule:
--   SELECT jobname, schedule, active FROM cron.job WHERE jobname LIKE 'align-%';
--
-- See what pg_net actually did with the request:
--   SELECT id, status_code, error_msg, created
--     FROM net._http_response ORDER BY created DESC LIMIT 5;
