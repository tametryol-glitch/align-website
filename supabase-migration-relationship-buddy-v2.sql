-- Relationship Buddy v2. Spec: RELATIONSHIP-BUDDY-SPEC.md. Run once in the Supabase SQL editor. Idempotent.
--
-- Adds, in this order:
--   1. the Exes lens to the buddy_pairs CHECK constraints (the lens stays OFF in the API until
--      BUDDY_EXES=on is set on Railway, so running this changes nothing for members by itself)
--   2. the 'buddy_message' notification type (push stays OFF until BUDDY_PUSH=on is set on Railway)
--   3. notification_preferences.buddy_alerts: a member's own switch for Buddy notifications (default on)
--   4. buddy_message_translations: cached translations of Buddy messages (service role only; the
--      API translates only when BUDDY_TRANSLATE=on is set on Railway)
--
-- New tables need explicit GRANTs (Supabase stops auto-granting after 2026-10-30).

-- ── 1. Exes lens ───────────────────────────────────────────────────
ALTER TABLE public.buddy_pairs DROP CONSTRAINT IF EXISTS buddy_pairs_lens_check;
ALTER TABLE public.buddy_pairs ADD CONSTRAINT buddy_pairs_lens_check
  CHECK (lens IN ('friends','lovers','family','coworkers','exes'));

ALTER TABLE public.buddy_pairs DROP CONSTRAINT IF EXISTS buddy_pairs_lens_proposal_check;
ALTER TABLE public.buddy_pairs ADD CONSTRAINT buddy_pairs_lens_proposal_check
  CHECK (lens_proposal IN ('friends','lovers','family','coworkers','exes'));

-- ── 2. Allow the buddy_message notification type without dropping any existing one ──
DO $$
DECLARE
  v_def TEXT;
  v_t   TEXT;
BEGIN
  SELECT pg_get_constraintdef(oid) INTO v_def
    FROM pg_constraint
   WHERE conrelid = 'public.notifications'::regclass
     AND conname  = 'notifications_type_check';

  IF v_def IS NULL THEN
    RAISE NOTICE 'No notifications_type_check constraint; nothing to widen.';
    RETURN;
  END IF;

  FOREACH v_t IN ARRAY ARRAY['buddy_message'] LOOP
    IF position('''' || v_t || '''' IN v_def) = 0 THEN
      v_def := replace(v_def, 'ARRAY[', 'ARRAY[''' || v_t || '''::text, ');
      RAISE NOTICE '% added to notifications_type_check.', v_t;
    END IF;
  END LOOP;

  EXECUTE 'ALTER TABLE public.notifications DROP CONSTRAINT notifications_type_check';
  EXECUTE 'ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check ' || v_def;
END $$;

-- ── 3. A member's own switch for Buddy notifications ───────────────
ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS buddy_alerts BOOLEAN NOT NULL DEFAULT TRUE;

-- ── 4. Cached translations (service role only) ─────────────────────
CREATE TABLE IF NOT EXISTS public.buddy_message_translations (
  message_id uuid NOT NULL REFERENCES public.buddy_messages(id) ON DELETE CASCADE,
  lang       text NOT NULL,
  fields     jsonb NOT NULL,                -- {headline, body, do, avoid}, validated before it is stored
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, lang)
);

ALTER TABLE public.buddy_message_translations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.buddy_message_translations FROM anon, authenticated;
GRANT ALL ON public.buddy_message_translations TO service_role;

-- ── Verification (expect the results in the comments) ──────────────
-- select conname, pg_get_constraintdef(oid) from pg_constraint
--  where conrelid = 'public.buddy_pairs'::regclass and conname like 'buddy_pairs_lens%';
--      -- lens_check and lens_proposal_check both list 'exes'
-- select position('buddy_message' in pg_get_constraintdef(oid)) > 0 as has_type
--   from pg_constraint where conname = 'notifications_type_check';                 -- true
-- select column_name, column_default from information_schema.columns
--  where table_name = 'notification_preferences' and column_name = 'buddy_alerts';  -- default true
-- select rowsecurity from pg_tables where tablename = 'buddy_message_translations'; -- true
-- select count(*) from information_schema.role_table_grants
--  where table_name = 'buddy_message_translations' and grantee in ('anon','authenticated'); -- 0
