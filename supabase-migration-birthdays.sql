-- Birthday Tribe (11-11-2026)
-- Every member gets a birthday post on the feed (from Align Daily, with their photo,
-- animated card and a solar-return note). Everyone can wish them; wishes are normal
-- post_comments on that post. Members whose birthday already passed this month get a
-- "belated" post. Run in the Supabase SQL editor. Safe to re-run.

-- 1. Allow the new post type ------------------------------------------------------
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_type_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_type_check CHECK (type = ANY (ARRAY[
  'text','photo','video','chart_share','reading_share','transit_alert',
  'compatibility_result','cosmic_match','birthday'
]));

-- One birthday post per member per year (idempotent cron).
CREATE UNIQUE INDEX IF NOT EXISTS uq_birthday_post_subject_year
  ON public.posts ((chart_data->>'subject_id'), (chart_data->>'year'))
  WHERE type = 'birthday';

-- 2. Which greetings has a celebrant already seen ---------------------------------
CREATE TABLE IF NOT EXISTS public.birthday_greeting_seen (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  year    INT  NOT NULL,
  seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, year)
);
ALTER TABLE public.birthday_greeting_seen ENABLE ROW LEVEL SECURITY;
-- No policies: only the SECURITY DEFINER RPCs below touch it.
REVOKE ALL ON public.birthday_greeting_seen FROM PUBLIC, anon, authenticated;

-- 3. Birthday tribe list for the feed (this month's birthdays so far) -------------
CREATE OR REPLACE FUNCTION public.get_birthday_tribe()
RETURNS TABLE (
  post_id UUID, subject_id UUID, display_name TEXT, avatar_url TEXT,
  birthday_date DATE, belated BOOLEAN, wish_count INT, i_wished BOOLEAN, is_me BOOLEAN
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id,
         (p.chart_data->>'subject_id')::uuid,
         COALESCE(pr.display_name, p.chart_data->>'name'),
         COALESCE(pr.avatar_url, p.chart_data->>'avatar_url'),
         (p.chart_data->>'birthday_date')::date,
         ((p.chart_data->>'birthday_date')::date < (NOW() AT TIME ZONE 'UTC')::date - 1),
         (SELECT COUNT(*)::int FROM public.post_comments c
           WHERE c.post_id = p.id AND COALESCE(c.is_deleted, FALSE) = FALSE),
         EXISTS (SELECT 1 FROM public.post_comments c
                  WHERE c.post_id = p.id AND c.user_id = auth.uid()
                    AND COALESCE(c.is_deleted, FALSE) = FALSE),
         ((p.chart_data->>'subject_id')::uuid = auth.uid())
    FROM public.posts p
    LEFT JOIN public.profiles pr ON pr.id = (p.chart_data->>'subject_id')::uuid
   WHERE p.type = 'birthday'
     AND COALESCE(p.is_deleted, FALSE) = FALSE
     AND auth.uid() IS NOT NULL
     AND (p.chart_data->>'birthday_date')::date >= date_trunc('month', (NOW() AT TIME ZONE 'UTC'))::date
     AND NOT EXISTS (SELECT 1 FROM public.blocks b
          WHERE (b.blocker_id = auth.uid() AND b.blocked_id = (p.chart_data->>'subject_id')::uuid)
             OR (b.blocker_id = (p.chart_data->>'subject_id')::uuid AND b.blocked_id = auth.uid()))
   ORDER BY (p.chart_data->>'birthday_date')::date DESC
   LIMIT 40;
$$;

-- 4. The celebrant's own greeting (shown once, first open) ------------------------
CREATE OR REPLACE FUNCTION public.get_my_birthday_greeting()
RETURNS TABLE (post_id UUID, chart_data JSONB, wish_count INT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.chart_data,
         (SELECT COUNT(*)::int FROM public.post_comments c
           WHERE c.post_id = p.id AND COALESCE(c.is_deleted, FALSE) = FALSE)
    FROM public.posts p
   WHERE p.type = 'birthday'
     AND COALESCE(p.is_deleted, FALSE) = FALSE
     AND auth.uid() IS NOT NULL
     AND (p.chart_data->>'subject_id')::uuid = auth.uid()
     AND (p.chart_data->>'year')::int = EXTRACT(YEAR FROM NOW() AT TIME ZONE 'UTC')::int
     AND (p.chart_data->>'birthday_date')::date >= date_trunc('month', (NOW() AT TIME ZONE 'UTC'))::date
     AND NOT EXISTS (SELECT 1 FROM public.birthday_greeting_seen s
                      WHERE s.user_id = auth.uid()
                        AND s.year = EXTRACT(YEAR FROM NOW() AT TIME ZONE 'UTC')::int)
   ORDER BY p.created_at DESC
   LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.ack_birthday_greeting()
RETURNS VOID
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.birthday_greeting_seen (user_id, year)
  SELECT auth.uid(), EXTRACT(YEAR FROM NOW() AT TIME ZONE 'UTC')::int
   WHERE auth.uid() IS NOT NULL
  ON CONFLICT DO NOTHING;
$$;

REVOKE EXECUTE ON FUNCTION public.get_birthday_tribe()        FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_birthday_greeting()  FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.ack_birthday_greeting()     FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_birthday_tribe()        TO authenticated;
GRANT  EXECUTE ON FUNCTION public.get_my_birthday_greeting()  TO authenticated;
GRANT  EXECUTE ON FUNCTION public.ack_birthday_greeting()     TO authenticated;

-- 5. Tell the celebrant when someone wishes them ----------------------------------
CREATE OR REPLACE FUNCTION public.notify_birthday_wish()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_subject UUID;
  v_name    TEXT;
BEGIN
  SELECT (chart_data->>'subject_id')::uuid INTO v_subject
    FROM public.posts WHERE id = NEW.post_id AND type = 'birthday';
  IF v_subject IS NULL OR v_subject = NEW.user_id THEN RETURN NEW; END IF;

  SELECT display_name INTO v_name FROM public.profiles WHERE id = NEW.user_id;
  INSERT INTO public.notifications (user_id, type, title, body, data, actor_id)
  VALUES (v_subject, 'comment',
          '🎂 ' || COALESCE(v_name, 'Someone') || ' wished you a happy birthday',
          LEFT(COALESCE(NEW.text, ''), 140),
          jsonb_build_object('post_id', NEW.post_id, 'kind', 'birthday_wish'),
          NEW.user_id);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW; -- never block a wish because the notification failed
END;
$$;
REVOKE EXECUTE ON FUNCTION public.notify_birthday_wish() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_notify_birthday_wish ON public.post_comments;
CREATE TRIGGER trg_notify_birthday_wish
  AFTER INSERT ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_birthday_wish();
