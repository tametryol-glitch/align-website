-- Purpose Check-In — Phase 1: storage
--
-- The biweekly check-in is a conversation that remembers. It leads with ONE
-- purpose point, records what the reader said in their own words, and quotes it
-- back next cycle. That only works if a point has a stable identity, which is
-- what PurposePoint.key gives us ("earthly:house:10", "soul:sign:Virgo").
--
-- Three tables:
--   purpose_point_state   one row per (user, point) — the rotation state
--   purpose_checkins      one row per check-in — the conversation log
--   purpose_checkin_prefs one row per user — cadence, register, pause
--
-- PRIVACY: no birth data is stored here. Birth-data changes are tracked by
-- `chart_version`, an opaque non-reversible hash (see chartVersion() in
-- src/lib/engines/purposeCheckin.ts), never by the dates/times themselves.
--
-- Safe to run more than once.

-- ── Birth-time confidence, on profiles where it belongs ──────────────────────
-- Unifies with the enum world_echo / global-intelligence charts already use,
-- instead of adding a fourth convention next to birth_time_unknown (saved
-- charts) and birth_time_known (profiles). NULL means "never asked".
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS time_confidence text;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_time_confidence_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_time_confidence_check
  CHECK (time_confidence IS NULL OR time_confidence IN ('exact', 'approximate', 'unknown'));


-- ── 1. Per-point rotation state ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.purpose_point_state (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identity comes from PurposePoint.key — never from the display text.
  point_key        text NOT NULL,
  kind             text NOT NULL,
  source           text NOT NULL,
  time_sensitive   boolean NOT NULL DEFAULT false,

  -- untouched → never surfaced. live → they said they're in it.
  -- dormant → was live, went quiet. declined → they pushed back (information,
  -- not failure). lived → confirmed across several cycles.
  status           text NOT NULL DEFAULT 'untouched',

  last_surfaced_at timestamptz,
  last_response_at timestamptz,
  surfaced_count   integer NOT NULL DEFAULT 0,
  confirmed_count  integer NOT NULL DEFAULT 0,

  -- Their own words, quoted back at the start of the next check-in.
  user_note        text,

  -- Opaque hash of the birth data this point was derived from. When it changes,
  -- house-anchored rows are archived rather than deleted — the reading really
  -- did change, and stale state must not be quoted back as if it still applies.
  chart_version    text,
  archived_at      timestamptz,

  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.purpose_point_state DROP CONSTRAINT IF EXISTS purpose_point_state_kind_check;
ALTER TABLE public.purpose_point_state ADD CONSTRAINT purpose_point_state_kind_check
  CHECK (kind IN ('earthly', 'soul'));

ALTER TABLE public.purpose_point_state DROP CONSTRAINT IF EXISTS purpose_point_state_source_check;
ALTER TABLE public.purpose_point_state ADD CONSTRAINT purpose_point_state_source_check
  CHECK (source IN ('house', 'sign', 'filler'));

ALTER TABLE public.purpose_point_state DROP CONSTRAINT IF EXISTS purpose_point_state_status_check;
ALTER TABLE public.purpose_point_state ADD CONSTRAINT purpose_point_state_status_check
  CHECK (status IN ('untouched', 'live', 'dormant', 'declined', 'lived'));

-- One state row per point per user. Archived rows keep the same key, so the
-- uniqueness is scoped to the live ones.
CREATE UNIQUE INDEX IF NOT EXISTS purpose_point_state_user_point_key
  ON public.purpose_point_state(user_id, point_key)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_purpose_point_state_user
  ON public.purpose_point_state(user_id) WHERE archived_at IS NULL;


-- ── 2. Check-in log ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.purpose_checkins (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  kind             text NOT NULL,
  -- The point the bot led with, and the one the reader actually chose if they
  -- picked a different one. The gap between them is how we learn their register.
  led_point_key    text NOT NULL,
  chosen_point_key text,

  outcome          text,
  user_message     text,

  opened_at        timestamptz NOT NULL DEFAULT now(),
  responded_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.purpose_checkins DROP CONSTRAINT IF EXISTS purpose_checkins_kind_check;
ALTER TABLE public.purpose_checkins ADD CONSTRAINT purpose_checkins_kind_check
  CHECK (kind IN ('earthly', 'soul'));

ALTER TABLE public.purpose_checkins DROP CONSTRAINT IF EXISTS purpose_checkins_outcome_check;
ALTER TABLE public.purpose_checkins ADD CONSTRAINT purpose_checkins_outcome_check
  CHECK (outcome IS NULL OR outcome IN ('confirmed', 'declined', 'deferred', 'switched', 'no_response'));

CREATE INDEX IF NOT EXISTS idx_purpose_checkins_user_opened
  ON public.purpose_checkins(user_id, opened_at DESC);


-- ── 3. Per-user cadence + register ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.purpose_checkin_prefs (
  user_id             uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Biweekly by default. Silence widens this; it never narrows on its own.
  cadence_days        integer NOT NULL DEFAULT 14,
  next_due_at         timestamptz,
  paused              boolean NOT NULL DEFAULT false,

  -- Which track the last check-in used, so the next one alternates.
  last_kind           text,

  -- How the bot opens: told, offered, or asked. Seeded from the chart, then
  -- overridden by what the reader actually does.
  register            text,
  register_source     text,

  consecutive_ignored integer NOT NULL DEFAULT 0,

  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.purpose_checkin_prefs DROP CONSTRAINT IF EXISTS purpose_checkin_prefs_last_kind_check;
ALTER TABLE public.purpose_checkin_prefs ADD CONSTRAINT purpose_checkin_prefs_last_kind_check
  CHECK (last_kind IS NULL OR last_kind IN ('earthly', 'soul'));

ALTER TABLE public.purpose_checkin_prefs DROP CONSTRAINT IF EXISTS purpose_checkin_prefs_register_check;
ALTER TABLE public.purpose_checkin_prefs ADD CONSTRAINT purpose_checkin_prefs_register_check
  CHECK (register IS NULL OR register IN ('directive', 'collaborative', 'autonomous'));

ALTER TABLE public.purpose_checkin_prefs DROP CONSTRAINT IF EXISTS purpose_checkin_prefs_register_source_check;
ALTER TABLE public.purpose_checkin_prefs ADD CONSTRAINT purpose_checkin_prefs_register_source_check
  CHECK (register_source IS NULL OR register_source IN ('chart', 'observed'));

-- The due-date sweep the scheduler runs.
CREATE INDEX IF NOT EXISTS idx_purpose_checkin_prefs_due
  ON public.purpose_checkin_prefs(next_due_at)
  WHERE paused = false;


-- ── RLS: a user sees and writes only their own rows ──────────────────────────
ALTER TABLE public.purpose_point_state   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purpose_checkins      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purpose_checkin_prefs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "purpose_point_state_own_read" ON public.purpose_point_state;
CREATE POLICY "purpose_point_state_own_read" ON public.purpose_point_state
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "purpose_point_state_own_insert" ON public.purpose_point_state;
CREATE POLICY "purpose_point_state_own_insert" ON public.purpose_point_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "purpose_point_state_own_update" ON public.purpose_point_state;
CREATE POLICY "purpose_point_state_own_update" ON public.purpose_point_state
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "purpose_checkins_own_read" ON public.purpose_checkins;
CREATE POLICY "purpose_checkins_own_read" ON public.purpose_checkins
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "purpose_checkins_own_insert" ON public.purpose_checkins;
CREATE POLICY "purpose_checkins_own_insert" ON public.purpose_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "purpose_checkins_own_update" ON public.purpose_checkins;
CREATE POLICY "purpose_checkins_own_update" ON public.purpose_checkins
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "purpose_checkin_prefs_own_read" ON public.purpose_checkin_prefs;
CREATE POLICY "purpose_checkin_prefs_own_read" ON public.purpose_checkin_prefs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "purpose_checkin_prefs_own_insert" ON public.purpose_checkin_prefs;
CREATE POLICY "purpose_checkin_prefs_own_insert" ON public.purpose_checkin_prefs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "purpose_checkin_prefs_own_update" ON public.purpose_checkin_prefs;
CREATE POLICY "purpose_checkin_prefs_own_update" ON public.purpose_checkin_prefs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ── Grants (new tables need explicit grants on this project) ─────────────────
GRANT SELECT, INSERT, UPDATE ON public.purpose_point_state   TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.purpose_checkins      TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.purpose_checkin_prefs TO authenticated;
