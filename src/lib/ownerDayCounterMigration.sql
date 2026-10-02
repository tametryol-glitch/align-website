-- Founder day counter: never resets, counts calendar days since the app began
-- (21-03-2026 = day 1). Enforced in the DB so web + mobile + any client path
-- (the client-side checkIn() resets to 1 after a gap) all get the same result.

CREATE OR REPLACE FUNCTION public.owner_day_counter()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  owner_id uuid;
  day_no int;
BEGIN
  SELECT id INTO owner_id FROM auth.users WHERE email = 'tametryol@gmail.com' LIMIT 1;
  IF owner_id IS NOT NULL AND NEW.user_id = owner_id THEN
    day_no := (current_date - DATE '2026-03-21') + 1;
    NEW.current_streak := day_no;
    NEW.longest_streak := GREATEST(COALESCE(NEW.longest_streak, 0), day_no);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_owner_day_counter ON public.user_streaks;
CREATE TRIGGER trg_owner_day_counter
  BEFORE INSERT OR UPDATE ON public.user_streaks
  FOR EACH ROW EXECUTE FUNCTION public.owner_day_counter();

-- One-time backfill: create/refresh the owner's row now (trigger sets the numbers).
INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_check_in, total_check_ins)
SELECT id, 1, 1, current_date, 1 FROM auth.users WHERE email = 'tametryol@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET updated_at = now();

SELECT user_id, current_streak, longest_streak, last_check_in
FROM public.user_streaks
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'tametryol@gmail.com');
