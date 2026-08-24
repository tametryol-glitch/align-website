-- =============================================================================
-- Align — FIX: dead push trigger + revenue plan-ID double-counting
-- =============================================================================
-- Two production bugs found by the new analytics on 2026-08-24.
--
-- ── BUG 1 (critical): push has been silently dead since ~2026-07-13 ──────────
--
-- 722 notification rows were created between 2026-07-14 and 2026-08-24 and
-- ZERO pushes were delivered — with no failure rows either.
--
-- Root cause: supabase-migration-push-v2.sql created notification_preferences
-- with CREATE TABLE IF NOT EXISTS. The table ALREADY existed, from an earlier
-- migration, with different column names:
--
--     live table  : push_messages, push_comments, push_likes,
--                   push_friend_requests, push_match_updates,
--                   push_transit_alerts, email_important, email_weekly_digest
--     trigger reads: messages, comments, likes, friend_requests,
--                   friend_accepted, matches, mentions, cosmic_alerts,
--                   announcements, quiet_hours_enabled/start/end
--
-- So the table body was skipped but PART 4 (the trigger) still installed. On
-- every notification insert the trigger's
--     EXECUTE format('SELECT %I, quiet_hours_enabled, ... ')
-- raised 42703 undefined_column, and the function's outer
--     EXCEPTION WHEN OTHERS THEN RAISE WARNING ...; RETURN NEW;
-- swallowed it before the send loop was ever reached. Silent, total failure.
--
-- The fix has three parts, each of which alone would have prevented this:
--   1. Add the missing columns (additive; the push_* columns stay as the
--      source of truth and are mirrored).
--   2. Read preferences through to_jsonb() so a missing column can never
--      raise again — it just means "no preference set".
--   3. Stop swallowing errors. Every failure now writes a 'failed' row to
--      push_notification_log with the SQLSTATE, so this is visible on the
--      Tech tab within minutes instead of invisible for six weeks.
--
-- ── BUG 2: revenue plan mix double-counts ───────────────────────────────────
-- Google Play returns product ids as "productId:basePlanId", so the same plan
-- lands under two ids ("align_premium_monthly" and
-- "align_premium_monthly:align-premium-monthly"). Totals were right, the
-- per-plan split was not. Normalised by splitting on ':'.
--
-- Idempotent + safe to re-run. Run in the Supabase SQL editor.
-- =============================================================================


-- ═════════════════════════════════════════════════════════════════════════════
-- 1. NOTIFICATION PREFERENCES — add what push-v2 intended to create
-- ═════════════════════════════════════════════════════════════════════════════
-- Additive only. The existing push_* columns keep working and remain what the
-- app writes; these are the names the trigger was written against.

ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS messages            BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS comments            BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS likes               BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS friend_requests     BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS friend_accepted     BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS matches             BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS mentions            BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS cosmic_alerts       BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS announcements       BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS quiet_hours_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS quiet_hours_start   TEXT DEFAULT '23',
  ADD COLUMN IF NOT EXISTS quiet_hours_end     TEXT DEFAULT '07';

-- Mirror any existing user choices from the push_* columns so nobody who has
-- already opted out starts receiving push again.
UPDATE public.notification_preferences SET
  messages        = COALESCE(push_messages,        messages),
  comments        = COALESCE(push_comments,        comments),
  likes           = COALESCE(push_likes,           likes),
  friend_requests = COALESCE(push_friend_requests, friend_requests),
  matches         = COALESCE(push_match_updates,   matches),
  cosmic_alerts   = COALESCE(push_transit_alerts,  cosmic_alerts);


-- ═════════════════════════════════════════════════════════════════════════════
-- 2. THE PUSH TRIGGER — rewritten to fail loudly instead of silently
-- ═════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.send_push_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_device       RECORD;
  v_prefs        jsonb;
  v_pref_key     TEXT;
  v_alt_key      TEXT;
  v_enabled      BOOLEAN;
  v_sent         INT := 0;
  v_anon_key     TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4endkdmxiY3Ntbmtoam1rZ2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNjA2NzcsImV4cCI6MjA4OTYzNjY3N30.JDH6f2vEJdfvmTT-VoTsj4zB_KLVubN-wb64HE_4HoA';
  v_fn_url       TEXT := 'https://wxzwdvlbcsmnkhjmkgkx.supabase.co/functions/v1/push-notification';
BEGIN
  -- ── 1. Preferences, read defensively ──────────────────────────────────────
  -- to_jsonb() means a column that does not exist is simply absent from the
  -- object rather than a hard error. This is the specific thing that killed
  -- push for six weeks and it can no longer happen.
  BEGIN
    SELECT to_jsonb(np) INTO v_prefs
      FROM public.notification_preferences np
     WHERE np.user_id = NEW.user_id;
  EXCEPTION WHEN OTHERS THEN
    v_prefs := NULL;   -- no preferences table/row → treat as "all enabled"
  END;

  IF v_prefs IS NOT NULL THEN
    -- Canonical key, plus the push_-prefixed name the app actually writes.
    v_pref_key := CASE NEW.type
      WHEN 'new_message'               THEN 'messages'
      WHEN 'comment'                   THEN 'comments'
      WHEN 'like'                      THEN 'likes'
      WHEN 'friend_request'            THEN 'friend_requests'
      WHEN 'friend_accepted'           THEN 'friend_accepted'
      WHEN 'mention'                   THEN 'mentions'
      WHEN 'cosmic_match_ready'        THEN 'matches'
      WHEN 'cosmic_match_share_invite' THEN 'matches'
      WHEN 'cosmic_match_published'    THEN 'matches'
      WHEN 'transit_alert'             THEN 'cosmic_alerts'
      WHEN 'system'                    THEN 'announcements'
      ELSE NULL
    END;

    v_alt_key := CASE NEW.type
      WHEN 'new_message'               THEN 'push_messages'
      WHEN 'comment'                   THEN 'push_comments'
      WHEN 'like'                      THEN 'push_likes'
      WHEN 'friend_request'            THEN 'push_friend_requests'
      WHEN 'cosmic_match_ready'        THEN 'push_match_updates'
      WHEN 'cosmic_match_share_invite' THEN 'push_match_updates'
      WHEN 'cosmic_match_published'    THEN 'push_match_updates'
      WHEN 'transit_alert'             THEN 'push_transit_alerts'
      ELSE NULL
    END;

    -- Opt-out only counts when the key is present AND explicitly false.
    v_enabled := TRUE;
    IF v_pref_key IS NOT NULL AND (v_prefs ? v_pref_key)
       AND (v_prefs ->> v_pref_key) = 'false' THEN
      v_enabled := FALSE;
    END IF;
    IF v_alt_key IS NOT NULL AND (v_prefs ? v_alt_key)
       AND (v_prefs ->> v_alt_key) = 'false' THEN
      v_enabled := FALSE;
    END IF;

    IF NOT v_enabled THEN
      RETURN NEW;   -- user opted out of this category
    END IF;

    -- Quiet hours, also read defensively. Values may be 'HH:MM' or 'HH'.
    IF (v_prefs ? 'quiet_hours_enabled')
       AND (v_prefs ->> 'quiet_hours_enabled') = 'true'
       AND (v_prefs ? 'quiet_hours_start') AND (v_prefs ? 'quiet_hours_end') THEN
      DECLARE
        v_start INT;
        v_end   INT;
        v_now   INT := EXTRACT(HOUR FROM NOW())::int;
      BEGIN
        v_start := split_part(v_prefs ->> 'quiet_hours_start', ':', 1)::int;
        v_end   := split_part(v_prefs ->> 'quiet_hours_end',   ':', 1)::int;
        IF v_start <= v_end THEN
          IF v_now >= v_start AND v_now < v_end THEN RETURN NEW; END IF;
        ELSE
          IF v_now >= v_start OR  v_now < v_end THEN RETURN NEW; END IF;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        NULL;  -- unparseable quiet hours must not block delivery
      END;
    END IF;
  END IF;

  -- ── 2. Deliver to every active device ─────────────────────────────────────
  FOR v_device IN
    SELECT token, platform
      FROM public.push_devices
     WHERE user_id = NEW.user_id
       AND is_active = TRUE
       AND notifications_enabled = TRUE
       AND token IS NOT NULL
       AND token <> ''
  LOOP
    BEGIN
      PERFORM net.http_post(
        url     := v_fn_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_anon_key
        ),
        body    := jsonb_build_object(
          'push_token',      v_device.token,
          'title',           NEW.title,
          'body',            COALESCE(NEW.body, ''),
          'data',            COALESCE(NEW.data, '{}'),
          'notification_id', NEW.id,
          'user_id',         NEW.user_id::text,
          'type',            NEW.type,
          'platform',        v_device.platform
        )
      );

      INSERT INTO public.push_notification_log
        (user_id, notification_id, title, body, push_token, status)
      VALUES
        (NEW.user_id, NEW.id, NEW.title, COALESCE(NEW.body, ''), v_device.token, 'sent');

      v_sent := v_sent + 1;

    EXCEPTION WHEN OTHERS THEN
      INSERT INTO public.push_notification_log
        (user_id, notification_id, title, body, push_token, status, error_message)
      VALUES
        (NEW.user_id, NEW.id, NEW.title, COALESCE(NEW.body, ''), v_device.token,
         'failed', SQLSTATE || ': ' || SQLERRM);
    END;
  END LOOP;

  -- ── 3. Legacy fallback for users with no push_devices row ─────────────────
  IF v_sent = 0 THEN
    DECLARE
      v_legacy_token   TEXT;
      v_legacy_enabled BOOLEAN;
    BEGIN
      SELECT expo_push_token, push_enabled
        INTO v_legacy_token, v_legacy_enabled
        FROM public.profiles WHERE id = NEW.user_id;

      IF v_legacy_token IS NOT NULL AND v_legacy_token <> ''
         AND COALESCE(v_legacy_enabled, TRUE) THEN
        PERFORM net.http_post(
          url     := v_fn_url,
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || v_anon_key
          ),
          body    := jsonb_build_object(
            'push_token',      v_legacy_token,
            'title',           NEW.title,
            'body',            COALESCE(NEW.body, ''),
            'data',            COALESCE(NEW.data, '{}'),
            'notification_id', NEW.id,
            'user_id',         NEW.user_id::text,
            'type',            NEW.type
          )
        );
        INSERT INTO public.push_notification_log
          (user_id, notification_id, title, body, push_token, status)
        VALUES
          (NEW.user_id, NEW.id, NEW.title, COALESCE(NEW.body, ''), v_legacy_token, 'sent');
        v_sent := v_sent + 1;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      INSERT INTO public.push_notification_log
        (user_id, notification_id, title, body, push_token, status, error_message)
      VALUES
        (NEW.user_id, NEW.id, NEW.title, COALESCE(NEW.body, ''), 'legacy',
         'failed', SQLSTATE || ': ' || SQLERRM);
    END;
  END IF;

  -- ── 4. A user with no reachable device is recorded, not ignored ───────────
  -- Without this, "no devices" and "trigger exploded" look identical from the
  -- outside — which is exactly how this bug hid for six weeks.
  IF v_sent = 0 THEN
    INSERT INTO public.push_notification_log
      (user_id, notification_id, title, body, push_token, status, error_message)
    VALUES
      (NEW.user_id, NEW.id, NEW.title, COALESCE(NEW.body, ''), '',
       'skipped', 'no active device for user');
  END IF;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Last-resort guard: a notification insert must never fail because push
  -- failed. But unlike the old version, this now leaves EVIDENCE.
  BEGIN
    INSERT INTO public.push_notification_log
      (user_id, notification_id, title, body, push_token, status, error_message)
    VALUES
      (NEW.user_id, NEW.id, NEW.title, COALESCE(NEW.body, ''), '',
       'failed', 'trigger: ' || SQLSTATE || ': ' || SQLERRM);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS on_notification_send_push ON public.notifications;
CREATE TRIGGER on_notification_send_push
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.send_push_notification();

-- Allow 'skipped' alongside the existing statuses, if a CHECK constraint exists.
DO $$
BEGIN
  ALTER TABLE public.push_notification_log DROP CONSTRAINT IF EXISTS push_notification_log_status_check;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- ═════════════════════════════════════════════════════════════════════════════
-- 3. REVENUE — normalise Google Play "productId:basePlanId" ids
-- ═════════════════════════════════════════════════════════════════════════════

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

  -- split_part on ':' collapses "align_premium_monthly:align-premium-monthly"
  -- back onto "align_premium_monthly".
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'product_id', pid, 'purchases', n, 'revenue_cents', rev) ORDER BY rev DESC), '[]'::jsonb)
    INTO v_mix
    FROM (
      SELECT split_part(COALESCE(product_id, 'unknown'), ':', 1) AS pid,
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

GRANT EXECUTE ON FUNCTION public.analytics_revenue_exact(INT) TO service_role;


-- ═════════════════════════════════════════════════════════════════════════════
-- 4. BIRTH-DATE SANITY — 6 accounts carry a birth year of 2026
-- ═════════════════════════════════════════════════════════════════════════════
-- Those are data-entry artifacts, not infants, and they are what pushed the
-- "under 13" safety count to 7. A CHECK constraint would fail existing rows,
-- so this is a validation trigger on write only — history is left alone and
-- surfaced by the reporting view below.

CREATE OR REPLACE FUNCTION public.validate_birth_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.birth_date IS NOT NULL THEN
    -- Nobody alive was born in the future or before 1900.
    IF NEW.birth_date > CURRENT_DATE OR NEW.birth_date < DATE '1900-01-01' THEN
      RAISE EXCEPTION 'Invalid birth_date %: must be between 1900-01-01 and today',
        NEW.birth_date USING ERRCODE = '22007';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_validate_birth_date ON public.profiles;
CREATE TRIGGER profiles_validate_birth_date
  BEFORE INSERT OR UPDATE OF birth_date ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_birth_date();


-- Accounts whose birth_date is implausible, for the admin to review/clear.
CREATE OR REPLACE FUNCTION public.analytics_suspect_birth_dates()
RETURNS TABLE (
  user_id      UUID,
  display_name TEXT,
  birth_date   DATE,
  reason       TEXT,
  created_at   TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id,
         COALESCE(p.display_name, '')::TEXT,
         p.birth_date,
         (CASE
            WHEN p.birth_date > CURRENT_DATE THEN 'future date'
            WHEN p.birth_date > CURRENT_DATE - INTERVAL '13 years' THEN 'implies under 13'
            WHEN p.birth_date > CURRENT_DATE - INTERVAL '18 years' THEN 'implies under 18'
            ELSE 'implausible'
          END)::TEXT,
         p.created_at
  FROM public.profiles p
  WHERE p.birth_date IS NOT NULL
    AND (p.birth_date > CURRENT_DATE - INTERVAL '18 years'
         OR p.birth_date < DATE '1900-01-01')
  ORDER BY p.birth_date DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.analytics_suspect_birth_dates() TO service_role;


-- ═════════════════════════════════════════════════════════════════════════════
-- 5. VERIFY
-- ═════════════════════════════════════════════════════════════════════════════
-- Confirm the trigger is attached:
--   SELECT tgname, tgenabled FROM pg_trigger
--    WHERE tgrelid = 'public.notifications'::regclass AND NOT tgisinternal;
--
-- Then insert a test notification to yourself and check the log:
--   SELECT status, error_message, created_at
--     FROM public.push_notification_log ORDER BY created_at DESC LIMIT 10;
--
-- Normalised plan mix:
--   SELECT public.analytics_revenue_exact(30) -> 'plan_mix';
--
-- Accounts to review:
--   SELECT * FROM public.analytics_suspect_birth_dates();
