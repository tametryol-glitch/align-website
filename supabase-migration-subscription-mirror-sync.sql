-- Keep profiles.subscription_tier / is_subscribed in step with the real source of
-- truth, the `subscriptions` table. Idempotent. Applied 04-10-2026.
--
-- Why: nothing synced them. 41 members had an active paid row in `subscriptions`
-- while profiles said 'free' / false, so every reader of the mirror treated them
-- as free: the purpose check-in cron (never pushed them), the check-in card, reels
-- gating and the admin screens. Fixing the mirror at the source corrects all of
-- them at once, with no change to any reader.
--
-- Rule: a user's mirror tier = their highest-ranked ACTIVE, non-expired
-- subscriptions row (light < premium < pro), else 'free'. Users with no
-- subscriptions row at all are never touched (e.g. profiles set by hand or by the
-- Stripe path).

CREATE OR REPLACE FUNCTION public.sync_profile_subscription_mirror()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := COALESCE(NEW.user_id, OLD.user_id);
  v_tier text;
BEGIN
  SELECT s.tier INTO v_tier
    FROM public.subscriptions s
   WHERE s.user_id = v_user
     AND s.status = 'active'
     AND (s.expires_at IS NULL OR s.expires_at > now())
     AND s.tier IN ('light', 'premium', 'pro')
   ORDER BY CASE s.tier WHEN 'pro' THEN 3 WHEN 'premium' THEN 2 ELSE 1 END DESC
   LIMIT 1;

  UPDATE public.profiles
     SET subscription_tier = COALESCE(v_tier, 'free'),
         is_subscribed     = (v_tier IS NOT NULL)
   WHERE id = v_user
     AND (subscription_tier IS DISTINCT FROM COALESCE(v_tier, 'free')
          OR is_subscribed IS DISTINCT FROM (v_tier IS NOT NULL));

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- A trigger function is never meant to be called directly.
REVOKE ALL ON FUNCTION public.sync_profile_subscription_mirror() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_sync_profile_subscription_mirror ON public.subscriptions;
CREATE TRIGGER trg_sync_profile_subscription_mirror
  AFTER INSERT OR UPDATE OF tier, status, expires_at OR DELETE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_subscription_mirror();

-- One-time backfill: only users who currently hold an active, non-expired paid row.
UPDATE public.profiles p
   SET subscription_tier = b.tier,
       is_subscribed     = true
  FROM (
    SELECT DISTINCT ON (s.user_id) s.user_id, s.tier
      FROM public.subscriptions s
     WHERE s.status = 'active'
       AND (s.expires_at IS NULL OR s.expires_at > now())
       AND s.tier IN ('light', 'premium', 'pro')
     ORDER BY s.user_id,
              CASE s.tier WHEN 'pro' THEN 3 WHEN 'premium' THEN 2 ELSE 1 END DESC
  ) b
 WHERE p.id = b.user_id
   AND (p.subscription_tier IS DISTINCT FROM b.tier OR p.is_subscribed IS DISTINCT FROM true);
