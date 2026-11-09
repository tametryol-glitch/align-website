-- =============================================================================
-- Align — Your Day (the daily story told from the progressed radar)
-- =============================================================================
-- One row per member per local day. The API writes it with the service role
-- (the hourly cron /api/cron/daily-brief, or the first time the member opens
-- Your Day). Members NEVER read this table directly: the API serves it through
-- /api/v1/daystory/today, which strips the paid chapters for free members, so
-- the locked text never reaches a free member's device.
--
-- Run once in the Supabase SQL editor. Idempotent.
-- NOTE: tables created from 2026-10-30 need explicit GRANTs, included below.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.daily_stories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_date  DATE NOT NULL,                 -- the member's own calendar day
  headline    TEXT NOT NULL,
  push_title  TEXT NOT NULL,
  push_body   TEXT NOT NULL,
  story       JSONB NOT NULL,                -- the full story (all chapters)
  source      TEXT NOT NULL DEFAULT 'ai',    -- 'ai' or 'template' (model unavailable / rejected)
  -- how the day went, asked in the evening: happened | partly | didnt
  feedback    TEXT CHECK (feedback IN ('happened', 'partly', 'didnt')),
  opened_at   TIMESTAMPTZ,                   -- first time the member read it
  paywall_at  TIMESTAMPTZ,                   -- first time a free member tapped a locked chapter
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, local_date)
);

ALTER TABLE public.daily_stories ENABLE ROW LEVEL SECURITY;
-- No policies for authenticated on purpose: only the API (service role) reads or writes.

GRANT ALL ON public.daily_stories TO service_role;

CREATE INDEX IF NOT EXISTS daily_stories_date_idx ON public.daily_stories (local_date);
