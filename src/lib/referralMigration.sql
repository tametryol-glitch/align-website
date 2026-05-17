CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_type TEXT DEFAULT 'bonus_readings',
  reward_amount INT DEFAULT 5,
  claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own rewards" ON referral_rewards FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "System can insert rewards" ON referral_rewards FOR INSERT WITH CHECK (true);

-- Track bonus readings balance
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bonus_readings INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_referrals INT DEFAULT 0;
