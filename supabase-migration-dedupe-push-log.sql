-- ═════════════════════════════════════════════════════════════════════════════
-- ALIGN — Collapse push_notification_log to one row per push
--
-- Every delivered push writes TWO log rows today, from two different writers:
--
--   1. send_push_notification()      — the DB trigger, inserts 'sent' right
--                                      after net.http_post() dispatches.
--                                      Optimistic: it only knows the request
--                                      was queued, not what Expo said.
--   2. the push-notification Edge    — inserts again after Expo responds, with
--      Function                        the real verdict ('sent' / 'failed' +
--                                      Expo's error message).
--
-- Neither is wrong; they are just both writing. The cost lands on the admin
-- Analytics Tech tab, which counts rows: sends are doubled, open_rate_pct
-- (opens / sent) is halved, and sends_per_user_per_day is doubled.
--
-- WHICH ROW SURVIVES, AND WHY
-- The trigger's row is the one that must live. It is written BEFORE dispatch,
-- so it exists no matter what happens downstream — if the Edge Function is
-- down, or its SUPABASE_SERVICE_ROLE_KEY is unset, it never logs anything at
-- all. Deleting the trigger's write instead would mean a push that fails in
-- that specific way leaves no evidence anywhere, which is exactly how the
-- six-week silent push outage (2026-07-13 → 2026-08-24) stayed invisible.
--
-- So: the trigger's row is the record, and the Edge Function's insert is
-- folded into it in place rather than duplicated. A BEFORE INSERT trigger does
-- the folding, which means neither the trigger function nor the Edge Function
-- needs to change — no `supabase functions deploy` required, and any future
-- writer that logs the same push is deduped automatically.
--
-- Run in the Supabase SQL Editor.
-- ═════════════════════════════════════════════════════════════════════════════


-- ── 1. Index the key we dedupe on ───────────────────────────────────────────
-- Without this the BEFORE INSERT lookup is a seq scan on every push.
CREATE INDEX IF NOT EXISTS idx_push_log_notification_token
  ON public.push_notification_log (notification_id, push_token);


-- ── 2. Fold a second write for the same push into the first row ─────────────
CREATE OR REPLACE FUNCTION public.dedupe_push_notification_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_existing_id UUID;
BEGIN
  -- No notification_id means there is nothing to correlate on (ad-hoc and
  -- test pushes). Let those through untouched.
  IF NEW.notification_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_existing_id
    FROM public.push_notification_log
   WHERE notification_id = NEW.notification_id
     AND push_token IS NOT DISTINCT FROM NEW.push_token
   ORDER BY created_at
   LIMIT 1;

  -- First writer for this (notification, device): this is the row of record.
  IF v_existing_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Second writer: merge its verdict into the existing row instead of adding
  -- a new one. Any non-'sent' verdict wins from whichever side reports it —
  -- the trigger's 'sent' is only ever "dispatched", so the Edge Function's
  -- 'failed' must be able to overwrite it, and never the other way round.
  UPDATE public.push_notification_log
     SET status = CASE
                    WHEN NEW.status IS NOT NULL AND NEW.status <> 'sent' THEN NEW.status
                    WHEN status     IS NOT NULL AND status     <> 'sent' THEN status
                    ELSE 'sent'
                  END,
         error_message = COALESCE(NEW.error_message, error_message)
   WHERE id = v_existing_id;

  RETURN NULL;  -- suppress the duplicate INSERT
END;
$fn$;

DROP TRIGGER IF EXISTS push_log_dedupe ON public.push_notification_log;
CREATE TRIGGER push_log_dedupe
  BEFORE INSERT ON public.push_notification_log
  FOR EACH ROW EXECUTE FUNCTION public.dedupe_push_notification_log();


-- ── 3. Historical duplicates ────────────────────────────────────────────────
-- The trigger above only stops NEW duplicates. Rows already in the table keep
-- inflating the Tech tab's rolling 7/30-day windows until they age out, so
-- collapse them too.
--
-- Preview what this removes before running it, if you want to look first:
--
--   SELECT notification_id, push_token, COUNT(*), array_agg(status)
--     FROM public.push_notification_log
--    WHERE notification_id IS NOT NULL
--    GROUP BY 1, 2 HAVING COUNT(*) > 1
--    ORDER BY 3 DESC LIMIT 50;

-- Keep the earliest row per (notification, device), but first lift any
-- failure verdict recorded on the rows that are about to go, so no failure
-- is lost in the collapse.
WITH ranked AS (
  SELECT id,
         notification_id,
         push_token,
         status,
         error_message,
         ROW_NUMBER() OVER (
           PARTITION BY notification_id, push_token
           ORDER BY created_at, id
         ) AS rn
    FROM public.push_notification_log
   WHERE notification_id IS NOT NULL
),
verdicts AS (
  SELECT notification_id,
         push_token,
         MIN(status) FILTER (WHERE status IS NOT NULL AND status <> 'sent') AS bad_status,
         MIN(error_message) FILTER (WHERE error_message IS NOT NULL)        AS err
    FROM ranked
   GROUP BY notification_id, push_token
  HAVING COUNT(*) > 1
)
UPDATE public.push_notification_log l
   SET status        = COALESCE(v.bad_status, l.status),
       error_message = COALESCE(l.error_message, v.err)
  FROM ranked r
  JOIN verdicts v
    ON v.notification_id = r.notification_id
   AND v.push_token IS NOT DISTINCT FROM r.push_token
 WHERE l.id = r.id
   AND r.rn = 1;

DELETE FROM public.push_notification_log
 WHERE id IN (
   SELECT id FROM (
     SELECT id,
            ROW_NUMBER() OVER (
              PARTITION BY notification_id, push_token
              ORDER BY created_at, id
            ) AS rn
       FROM public.push_notification_log
      WHERE notification_id IS NOT NULL
   ) d
   WHERE d.rn > 1
 );


-- ── 4. Verify ───────────────────────────────────────────────────────────────
-- Expect zero rows. Anything returned here is a push still logged twice.
--
--   SELECT notification_id, push_token, COUNT(*)
--     FROM public.push_notification_log
--    WHERE notification_id IS NOT NULL
--    GROUP BY 1, 2 HAVING COUNT(*) > 1;
--
-- And the Tech tab numbers this corrects — sends should roughly halve,
-- open rate should roughly double:
--
--   SELECT public.analytics_push_metrics(7);
