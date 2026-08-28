-- ═════════════════════════════════════════════════════════════════════════════
-- ALIGN — Web Push: deliver notifications to browsers, not just to the app
--
-- A person who signs up on the website and never installs the app currently
-- gets NO push notifications at all. Not for friend requests, not for
-- messages, not for anything. The browser half of web push was already built
-- (pushService.ts subscribes, sw.js renders, push_subscriptions stores the
-- subscription) but nothing ever sent to it: send_push_notification() only
-- knows how to reach Expo tokens, which only the mobile app registers.
--
-- This adds the missing leg. The trigger keeps doing exactly what it does for
-- native devices, and additionally posts once per notification to
-- /api/push/web in align-web, which fans out to every browser that user has
-- subscribed and prunes dead subscriptions.
--
-- BEFORE RUNNING, set these in Vercel (align-web → Settings → Environment
-- Variables) and redeploy, or the relay returns 500 and nothing is delivered:
--
--   NEXT_PUBLIC_VAPID_PUBLIC_KEY   (public, safe to expose — the browser needs it)
--   VAPID_PRIVATE_KEY              (secret)
--   VAPID_SUBJECT                  mailto:support@aligncosmic.com
--   WEB_PUSH_RELAY_SECRET          must match v_relay_secret below, exactly
--
-- Run in the Supabase SQL Editor.
-- ═════════════════════════════════════════════════════════════════════════════


-- ── 1. push_subscriptions ───────────────────────────────────────────────────
-- Defined in align-web/src/lib/pushMigration.sql but very possibly never run,
-- since nothing has ever read or written it. Idempotent either way.
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint   TEXT NOT NULL,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user
  ON public.push_subscriptions (user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users manage own subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;


-- ── 2. The trigger, extended with a web leg ─────────────────────────────────
-- Everything above section 2b is unchanged from
-- supabase-migration-fix-push-and-revenue.sql. The preference and quiet-hours
-- gating at the top now covers browsers too, by construction — there is one
-- gate, not one per transport, so the two can never drift apart.
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
  v_web          INT := 0;
  v_anon_key     TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4endkdmxiY3Ntbmtoam1rZ2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNjA2NzcsImV4cCI6MjA4OTYzNjY3N30.JDH6f2vEJdfvmTT-VoTsj4zB_KLVubN-wb64HE_4HoA';
  v_fn_url       TEXT := 'https://wxzwdvlbcsmnkhjmkgkx.supabase.co/functions/v1/push-notification';
  v_relay_url    TEXT := 'https://www.aligncosmic.com/api/push/web';
  v_relay_secret TEXT := 'yXGZJumyK3FifsxRTpAh90JCwHpFVyFtkd0IGNrWX00';
BEGIN
  -- ── 1. Preferences, read defensively ──────────────────────────────────────
  BEGIN
    SELECT to_jsonb(np) INTO v_prefs
      FROM public.notification_preferences np
     WHERE np.user_id = NEW.user_id;
  EXCEPTION WHEN OTHERS THEN
    v_prefs := NULL;   -- no preferences table/row → treat as "all enabled"
  END;

  IF v_prefs IS NOT NULL THEN
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

  -- ── 2b. Deliver to the browser, for people who never installed the app ────
  -- Deliberately NOT gated on v_sent: someone signed in on both their phone
  -- and their laptop should be alerted on both, exactly as two phones are.
  -- One POST per notification, not per subscription — the relay fans out, so
  -- it can prune subscriptions the push service has retired in the same pass.
  -- The relay writes its own push_notification_log rows, keyed by endpoint.
  BEGIN
    SELECT COUNT(*) INTO v_web
      FROM public.push_subscriptions
     WHERE user_id = NEW.user_id;

    IF v_web > 0 THEN
      PERFORM net.http_post(
        url     := v_relay_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_relay_secret
        ),
        body    := jsonb_build_object(
          'user_id',         NEW.user_id::text,
          'notification_id', NEW.id,
          'title',           NEW.title,
          'body',            COALESCE(NEW.body, ''),
          'data',            COALESCE(NEW.data, '{}'),
          'type',            NEW.type
        )
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_web := 0;
    INSERT INTO public.push_notification_log
      (user_id, notification_id, title, body, push_token, status, error_message)
    VALUES
      (NEW.user_id, NEW.id, NEW.title, COALESCE(NEW.body, ''), 'web-relay',
       'failed', SQLSTATE || ': ' || SQLERRM);
  END;

  -- ── 4. A user with no reachable device is recorded, not ignored ───────────
  IF v_sent = 0 AND v_web = 0 THEN
    INSERT INTO public.push_notification_log
      (user_id, notification_id, title, body, push_token, status, error_message)
    VALUES
      (NEW.user_id, NEW.id, NEW.title, COALESCE(NEW.body, ''), '',
       'skipped', 'no active device for user');
  END IF;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
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


-- ── 3. Verify ───────────────────────────────────────────────────────────────
-- After enabling push in a browser on the website (Settings → Notifications),
-- there should be a row here:
--
--   SELECT user_id, LEFT(endpoint, 60), created_at
--     FROM public.push_subscriptions ORDER BY created_at DESC LIMIT 10;
--
-- Then send that account a friend request and watch the delivery land. Web
-- rows are the ones whose push_token is an https:// endpoint rather than an
-- ExponentPushToken:
--
--   SELECT status, LEFT(push_token, 40), error_message, created_at
--     FROM public.push_notification_log
--    WHERE push_token LIKE 'https://%'
--    ORDER BY created_at DESC LIMIT 20;
