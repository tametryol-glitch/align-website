-- ═════════════════════════════════════════════════════════════════════════════
-- ALIGN — Birth-data reminder ledger (stop re-emailing people who fixed it)
--
-- THE PROBLEM
-- The reminder recipient list is rebuilt live on every send from
--   profiles WHERE birth_date IS NULL
-- and nothing anywhere records who was actually emailed. That means:
--   • no memory between sends — press the button twice in a day and the same
--     people get the same email twice;
--   • no cap — a user who never intends to enter a birth date can be nagged
--     forever;
--   • no proof of who fixed their data because of a reminder, so there is no
--     way to answer "who did we already reach, and did it work?".
--
-- WHAT THIS ADDS
--   1. public.birth_reminder_state — one row per user we have emailed. It is
--      the ledger: how many reminders went out, when the last one went, and
--      when that user completed their birth data.
--   2. A trigger on profiles that stamps completed_at the moment birth_date
--      goes from NULL to a real date. The ledger closes itself; no cron, no
--      manual reconciliation, and it works no matter which surface wrote the
--      birth date (web edit page, app cloudSync, onboarding, direct SQL).
--   3. public.birth_reminder_status — a read-only view joining every profile
--      to its ledger row, so "fixed" vs "still pending" is one query.
--
-- The sending route (align-web/src/app/api/admin/send-birth-reminder/route.ts)
-- reads this ledger and skips anyone who completed, opted out, hit the
-- reminder cap, or was emailed inside the cooldown window.
--
-- NOTE ON HISTORY: reminders sent before this migration were never recorded
-- anywhere, so they cannot be reconstructed. Users who are still missing a
-- birth date start at reminders_sent = 0 and will receive one more email.
--
-- Run in the Supabase SQL Editor.
-- ═════════════════════════════════════════════════════════════════════════════


-- ── 1. The ledger ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.birth_reminder_state (
  user_id           UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  email             TEXT,
  reminders_sent    INTEGER     NOT NULL DEFAULT 0,
  first_reminder_at TIMESTAMPTZ,
  last_reminder_at  TIMESTAMPTZ,
  -- Set when the user's birth_date stops being NULL. Non-null = stop emailing.
  completed_at      TIMESTAMPTZ,
  -- 'trigger' (they filled it in), 'reconcile' (route caught up on a row the
  -- trigger predates), or 'backfill' (this migration, at install time).
  completed_source  TEXT,
  -- Manual "never email this person again" switch, independent of completion.
  opted_out         BOOLEAN     NOT NULL DEFAULT FALSE,
  last_error        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- The two questions the send path asks: "who is still open?" and "who was
-- emailed recently?"
CREATE INDEX IF NOT EXISTS idx_birth_reminder_open
  ON public.birth_reminder_state (completed_at) WHERE completed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_birth_reminder_last_sent
  ON public.birth_reminder_state (last_reminder_at DESC);


-- ── 2. Close the ledger row the instant a birth date appears ────────────────
CREATE OR REPLACE FUNCTION public.mark_birth_reminder_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  -- Only act on the NULL -> real transition. Editing an existing birth date
  -- must not re-stamp completed_at (that would reset the "fixed after
  -- reminder" evidence every time someone corrects a typo).
  IF NEW.birth_date IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE public.birth_reminder_state
     SET completed_at     = NOW(),
         completed_source = 'trigger',
         updated_at       = NOW()
   WHERE user_id = NEW.id
     AND completed_at IS NULL;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_mark_birth_reminder_complete ON public.profiles;
CREATE TRIGGER trg_mark_birth_reminder_complete
  AFTER INSERT OR UPDATE OF birth_date ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.mark_birth_reminder_complete();


-- ── 3. Keep updated_at honest ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.touch_birth_reminder_state()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $fn$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_touch_birth_reminder_state ON public.birth_reminder_state;
CREATE TRIGGER trg_touch_birth_reminder_state
  BEFORE UPDATE ON public.birth_reminder_state
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_birth_reminder_state();


-- ── 4. One view that answers "fixed vs still pending" ───────────────────────
-- security_invoker keeps profiles' own RLS in force, so this view grants no
-- read access that the caller did not already have.
DROP VIEW IF EXISTS public.birth_reminder_status;
CREATE VIEW public.birth_reminder_status
WITH (security_invoker = true) AS
SELECT
  p.id                                   AS user_id,
  p.email,
  p.display_name,
  p.created_at                           AS joined_at,
  p.birth_date,
  p.birth_time,
  p.birth_location,
  CASE
    WHEN p.birth_date IS NULL THEN 'missing_birth_date'
    WHEN p.latitude IS NULL OR p.longitude IS NULL OR p.timezone IS NULL
      THEN 'needs_coordinate_backfill'
    ELSE 'complete'
  END                                    AS data_status,
  COALESCE(s.reminders_sent, 0)          AS reminders_sent,
  s.first_reminder_at,
  s.last_reminder_at,
  s.completed_at,
  s.completed_source,
  COALESCE(s.opted_out, FALSE)           AS opted_out,
  -- Fixed their data at some point after we emailed them.
  (s.first_reminder_at IS NOT NULL AND p.birth_date IS NOT NULL) AS fixed_after_reminder,
  -- Emailed, still has not entered a birth date.
  (s.first_reminder_at IS NOT NULL AND p.birth_date IS NULL)     AS still_missing_after_reminder
FROM public.profiles p
LEFT JOIN public.birth_reminder_state s ON s.user_id = p.id;


-- ── 5. Backfill: close ledger rows for anyone already complete ──────────────
-- No-op on a fresh install (the table is empty); makes re-running this file
-- safe after the ledger has entries.
UPDATE public.birth_reminder_state s
   SET completed_at     = COALESCE(s.completed_at, NOW()),
       completed_source = COALESCE(s.completed_source, 'backfill'),
       updated_at       = NOW()
  FROM public.profiles p
 WHERE p.id = s.user_id
   AND p.birth_date IS NOT NULL
   AND s.completed_at IS NULL;


-- ── 6. Grants (tables created after 2026-10-30 need these explicitly) ───────
-- The ledger is written only by the admin send route using the service key, so
-- clients get no direct access; the view inherits profiles' RLS.
ALTER TABLE public.birth_reminder_state ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.birth_reminder_state TO service_role;
GRANT SELECT ON public.birth_reminder_status TO authenticated, service_role;


-- ── 7. Where things stand right now ─────────────────────────────────────────
SELECT data_status,
       COUNT(*)                                        AS users,
       COUNT(*) FILTER (WHERE reminders_sent > 0)      AS already_emailed,
       COUNT(*) FILTER (WHERE fixed_after_reminder)    AS fixed_after_reminder
  FROM public.birth_reminder_status
 GROUP BY data_status
 ORDER BY data_status;
