-- Scheduled emails table for onboarding drip sequence (Day 1, Day 3, Day 7)
-- Run this in the Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS scheduled_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  template_key TEXT NOT NULL,
  send_at TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for the cron query: unsent emails ordered by send_at
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_pending
  ON scheduled_emails (send_at)
  WHERE sent = FALSE;

-- Index for looking up emails by user (e.g. to cancel on unsubscribe)
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_user
  ON scheduled_emails (user_id);

ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY;

-- Service-role policy: the cron edge function uses the service key,
-- which bypasses RLS, but we add a permissive policy so that
-- authenticated admin queries also work.
CREATE POLICY "Service can manage scheduled emails"
  ON scheduled_emails FOR ALL
  USING (true);

-- Grant access for supabase-js (required for tables created after 2026-10-30)
GRANT SELECT, INSERT, UPDATE ON scheduled_emails TO authenticated;
GRANT SELECT, INSERT, UPDATE ON scheduled_emails TO service_role;
