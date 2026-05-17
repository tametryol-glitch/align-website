-- Add trial columns to profiles table for 7-day premium trial on new signups
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_start TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT FALSE;
