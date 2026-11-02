-- =============================================================================
-- Align — Daily Brief reminder (opt-in "Today for you" push)
-- =============================================================================
-- One row per member who turned the reminder on from the Today card.
-- The hourly cron /api/cron/daily-brief reads this table with the service
-- role, works out each member's local time from `timezone`, and writes ONE
-- notifications row per member per day. The existing push trigger and the
-- /api/push/web relay deliver it - no new push path.
--
-- Run once in the Supabase SQL editor. Idempotent.
-- NOTE: tables created from 2026-10-30 need explicit GRANTs, included below.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.daily_brief_prefs (
  user_id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  -- Local hour of day to send, 0-23. Default is a morning habit slot.
  send_hour    SMALLINT NOT NULL DEFAULT 8 CHECK (send_hour BETWEEN 0 AND 23),
  -- IANA name from the browser, e.g. 'America/Nassau'. Local hour is derived
  -- from this so daylight saving needs no upkeep.
  timezone     TEXT NOT NULL DEFAULT 'UTC',
  -- Local calendar date of the last send, so a day is never sent twice.
  last_sent_on DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.daily_brief_prefs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "daily_brief_prefs_select_own" ON public.daily_brief_prefs;
CREATE POLICY "daily_brief_prefs_select_own" ON public.daily_brief_prefs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "daily_brief_prefs_insert_own" ON public.daily_brief_prefs;
CREATE POLICY "daily_brief_prefs_insert_own" ON public.daily_brief_prefs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "daily_brief_prefs_update_own" ON public.daily_brief_prefs;
CREATE POLICY "daily_brief_prefs_update_own" ON public.daily_brief_prefs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "daily_brief_prefs_delete_own" ON public.daily_brief_prefs;
CREATE POLICY "daily_brief_prefs_delete_own" ON public.daily_brief_prefs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_brief_prefs TO authenticated;
GRANT ALL ON public.daily_brief_prefs TO service_role;

CREATE INDEX IF NOT EXISTS daily_brief_prefs_enabled_idx
  ON public.daily_brief_prefs (enabled) WHERE enabled;
