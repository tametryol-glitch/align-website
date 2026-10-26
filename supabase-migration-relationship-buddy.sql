-- Relationship Buddy (Phase 2). Spec: RELATIONSHIP-BUDDY-SPEC.md sec. 7, 10.
-- Run once in the Supabase SQL editor. Idempotent.
--
-- Tables
--   buddy_pairs        one row per 1:1 conversation: opt-in state, lens, pause
--   buddy_signals      ranked convergent signals the engine produced for a pair
--   buddy_messages     what the Buddy said (shared channel, or private to one person)
--   buddy_outcomes     per-person "did that happen?" answers
--   buddy_calibration  per-pair learned multipliers (service only)
--
-- PRIVACY (spec sec. 7): a PRIVATE row is readable only by `private_to` / `to_user`.
-- A SHARED row is readable by both members. Nobody can read another person's
-- private row, not even their chat partner. All WRITES go through the API with the
-- service role; members have SELECT only, so no client can opt the other person in.
--
-- New tables need explicit GRANTs (Supabase stops auto-granting after 2026-10-30).
-- Writes to these tables are NOT push: the invite notification below rides the
-- existing notifications -> push path.

-- ── 0. Allow the invite notification type without dropping any existing one ──
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

  FOREACH v_t IN ARRAY ARRAY['buddy_invite'] LOOP
    IF position('''' || v_t || '''' IN v_def) = 0 THEN
      v_def := replace(v_def, 'ARRAY[', 'ARRAY[''' || v_t || '''::text, ');
      RAISE NOTICE '% added to notifications_type_check.', v_t;
    END IF;
  END LOOP;

  EXECUTE 'ALTER TABLE public.notifications DROP CONSTRAINT notifications_type_check';
  EXECUTE 'ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check ' || v_def;
END $$;

-- ── 1. buddy_pairs ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.buddy_pairs (
  conversation_id  uuid PRIMARY KEY REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_a           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_b           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status           text NOT NULL DEFAULT 'invited'
                     CHECK (status IN ('invited','active','declined','ended')),
  invited_by       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  opted_in_a       boolean NOT NULL DEFAULT false,
  opted_in_b       boolean NOT NULL DEFAULT false,
  lens             text CHECK (lens IN ('friends','lovers','family','coworkers')),
  lens_proposal    text CHECK (lens_proposal IN ('friends','lovers','family','coworkers')),
  lens_proposed_by text CHECK (lens_proposed_by IN ('a','b')),
  paused           boolean NOT NULL DEFAULT false,
  declined_at      timestamptz,
  ended_at         timestamptz,
  ended_by         uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT buddy_pairs_ordered CHECK (user_a < user_b),
  CONSTRAINT buddy_pairs_proposal_pair CHECK ((lens_proposal IS NULL) = (lens_proposed_by IS NULL)),
  -- an ACTIVE buddy always has both people opted in
  CONSTRAINT buddy_pairs_active_needs_both CHECK (status <> 'active' OR (opted_in_a AND opted_in_b))
);
CREATE INDEX IF NOT EXISTS buddy_pairs_user_a_idx ON public.buddy_pairs (user_a);
CREATE INDEX IF NOT EXISTS buddy_pairs_user_b_idx ON public.buddy_pairs (user_b);
CREATE INDEX IF NOT EXISTS buddy_pairs_active_idx ON public.buddy_pairs (status) WHERE status = 'active';

CREATE OR REPLACE FUNCTION public.buddy_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS buddy_pairs_touch ON public.buddy_pairs;
CREATE TRIGGER buddy_pairs_touch BEFORE UPDATE ON public.buddy_pairs
  FOR EACH ROW EXECUTE FUNCTION public.buddy_touch_updated_at();

ALTER TABLE public.buddy_pairs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS buddy_pairs_member_read ON public.buddy_pairs;
CREATE POLICY buddy_pairs_member_read ON public.buddy_pairs FOR SELECT
  USING (auth.uid() = user_a OR auth.uid() = user_b);
REVOKE ALL ON public.buddy_pairs FROM anon, authenticated;
GRANT SELECT ON public.buddy_pairs TO authenticated;
GRANT ALL    ON public.buddy_pairs TO service_role;

-- ── 2. buddy_signals ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.buddy_signals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.buddy_pairs(conversation_id) ON DELETE CASCADE,
  signal_key      text NOT NULL,             -- engine id, e.g. shared:affection:2026-11-13
  channel         text NOT NULL CHECK (channel IN ('shared','private')),
  private_to      uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme           text NOT NULL,
  score           numeric NOT NULL DEFAULT 0,
  window_start    date NOT NULL,
  window_peak     timestamptz,
  window_end      date NOT NULL,
  facts           jsonb NOT NULL DEFAULT '{}'::jsonb,   -- engine facts; API only, never client-readable
  engine_version  integer NOT NULL DEFAULT 1,
  generated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, signal_key),
  CONSTRAINT buddy_signals_channel_owner CHECK ((channel = 'private') = (private_to IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS buddy_signals_conv_idx ON public.buddy_signals (conversation_id, window_start DESC);

-- A private row can only belong to one of the two members of its pair.
CREATE OR REPLACE FUNCTION public.buddy_assert_member()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  who uuid;
  ok  boolean;
BEGIN
  IF TG_TABLE_NAME = 'buddy_signals' THEN who := NEW.private_to; ELSE who := NEW.to_user; END IF;
  IF who IS NULL THEN RETURN NEW; END IF;
  SELECT (p.user_a = who OR p.user_b = who) INTO ok
    FROM public.buddy_pairs p WHERE p.conversation_id = NEW.conversation_id;
  IF NOT COALESCE(ok, false) THEN
    RAISE EXCEPTION 'buddy: % is not a member of conversation %', who, NEW.conversation_id;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS buddy_signals_member ON public.buddy_signals;
CREATE TRIGGER buddy_signals_member BEFORE INSERT OR UPDATE ON public.buddy_signals
  FOR EACH ROW EXECUTE FUNCTION public.buddy_assert_member();

ALTER TABLE public.buddy_signals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS buddy_signals_read ON public.buddy_signals;
CREATE POLICY buddy_signals_read ON public.buddy_signals FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.buddy_pairs p
           WHERE p.conversation_id = buddy_signals.conversation_id
             AND p.status = 'active'
             AND (auth.uid() = p.user_a OR auth.uid() = p.user_b))
  AND (channel = 'shared' OR private_to = auth.uid())
);
REVOKE ALL ON public.buddy_signals FROM anon, authenticated;
GRANT SELECT (id, conversation_id, signal_key, channel, private_to, theme, score,
              window_start, window_peak, window_end, engine_version, generated_at)
  ON public.buddy_signals TO authenticated;
GRANT ALL ON public.buddy_signals TO service_role;

-- ── 3. buddy_messages ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.buddy_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.buddy_pairs(conversation_id) ON DELETE CASCADE,
  signal_id       uuid REFERENCES public.buddy_signals(id) ON DELETE SET NULL,
  kind            text NOT NULL CHECK (kind IN
                    ('whisper','weekly','heads_up','chapter','fight','answer','anniversary')),
  channel         text NOT NULL CHECK (channel IN ('shared','private')),
  to_user         uuid REFERENCES public.profiles(id) ON DELETE CASCADE,  -- NULL when shared
  headline        text NOT NULL DEFAULT '',
  body            text NOT NULL,
  do_text         text NOT NULL DEFAULT '',
  avoid_text      text NOT NULL DEFAULT '',
  ai_status       text NOT NULL DEFAULT 'template' CHECK (ai_status IN ('template','ok','failed')),
  prompt_version  integer NOT NULL DEFAULT 0,
  facts_hash      text,
  read_by         uuid[] NOT NULL DEFAULT '{}',
  delivered_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT buddy_messages_channel_owner CHECK ((channel = 'private') = (to_user IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS buddy_messages_conv_idx ON public.buddy_messages (conversation_id, delivered_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS buddy_messages_dedupe_idx
  ON public.buddy_messages (conversation_id, kind, signal_id, COALESCE(to_user, '00000000-0000-0000-0000-000000000000'::uuid))
  WHERE signal_id IS NOT NULL;

DROP TRIGGER IF EXISTS buddy_messages_member ON public.buddy_messages;
CREATE TRIGGER buddy_messages_member BEFORE INSERT OR UPDATE ON public.buddy_messages
  FOR EACH ROW EXECUTE FUNCTION public.buddy_assert_member();

ALTER TABLE public.buddy_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS buddy_messages_read ON public.buddy_messages;
CREATE POLICY buddy_messages_read ON public.buddy_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.buddy_pairs p
           WHERE p.conversation_id = buddy_messages.conversation_id
             AND p.status = 'active'
             AND (auth.uid() = p.user_a OR auth.uid() = p.user_b))
  AND (channel = 'shared' OR to_user = auth.uid())
);
REVOKE ALL ON public.buddy_messages FROM anon, authenticated;
GRANT SELECT ON public.buddy_messages TO authenticated;
GRANT ALL    ON public.buddy_messages TO service_role;

-- ── 4. buddy_outcomes ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.buddy_outcomes (
  message_id  uuid NOT NULL REFERENCES public.buddy_messages(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  answer      text NOT NULL CHECK (answer IN ('yes','no','kind_of')),
  answered_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id)
);

ALTER TABLE public.buddy_outcomes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS buddy_outcomes_own_read ON public.buddy_outcomes;
CREATE POLICY buddy_outcomes_own_read ON public.buddy_outcomes FOR SELECT USING (auth.uid() = user_id);
REVOKE ALL ON public.buddy_outcomes FROM anon, authenticated;
GRANT SELECT ON public.buddy_outcomes TO authenticated;
GRANT ALL    ON public.buddy_outcomes TO service_role;

-- ── 5. buddy_calibration (service only: no policies, no member grants) ──
CREATE TABLE IF NOT EXISTS public.buddy_calibration (
  conversation_id uuid NOT NULL REFERENCES public.buddy_pairs(conversation_id) ON DELETE CASCADE,
  key             text NOT NULL,             -- e.g. 'Mars' or 'theme:conflict'
  multiplier      numeric NOT NULL DEFAULT 1 CHECK (multiplier BETWEEN 0.6 AND 1.5),
  n               integer NOT NULL DEFAULT 0,
  updated_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, key)
);

ALTER TABLE public.buddy_calibration ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.buddy_calibration FROM anon, authenticated;
GRANT ALL ON public.buddy_calibration TO service_role;

-- ── Verification (run after the script; expect the results in the comments) ──
-- select tablename, rowsecurity from pg_tables
--  where tablename like 'buddy_%' order by 1;                       -- 5 rows, all true
-- select table_name, privilege_type from information_schema.role_table_grants
--  where table_name like 'buddy_%' and grantee = 'authenticated';   -- SELECT only, never INSERT/UPDATE/DELETE
-- select column_name from information_schema.column_privileges
--  where table_name = 'buddy_signals' and grantee = 'authenticated'
--    and privilege_type = 'SELECT';                                 -- must NOT list 'facts'
