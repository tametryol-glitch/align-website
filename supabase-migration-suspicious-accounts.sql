-- Migration: Suspicious-account (bot) detector for the Admin panel
-- Read-only scoring. Nothing is deleted or hidden automatically.
-- Run once in the Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.suspicious_account_reviews (
  user_id     UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  decision    TEXT NOT NULL DEFAULT 'legit' CHECK (decision IN ('legit')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.suspicious_account_reviews ENABLE ROW LEVEL SECURITY;
-- No policies: only the SECURITY DEFINER functions below can touch it.

CREATE OR REPLACE FUNCTION public.admin_suspicious_accounts(p_days INT DEFAULT 30, p_min_score INT DEFAULT 25)
RETURNS TABLE (
  user_id UUID, display_name TEXT, username TEXT, email TEXT,
  created_at TIMESTAMPTZ, score INT, reasons TEXT[]
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
#variable_conflict use_column
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin) THEN
    RAISE EXCEPTION 'admin_suspicious_accounts: caller is not an admin';
  END IF;

  RETURN QUERY
  WITH cand AS (
    SELECT p.id, p.display_name, p.username, p.email, p.created_at, p.birth_date, p.avatar_url,
           lower(split_part(coalesce(p.email,''), '@', 2)) AS dom
    FROM public.profiles p
    WHERE p.created_at > now() - make_interval(days => p_days)
      AND coalesce(p.is_admin, false) = false
      AND coalesce(p.is_service_account, false) = false
      AND NOT EXISTS (SELECT 1 FROM public.suspicious_account_reviews r WHERE r.user_id = p.id)
  ),
  shared_dev AS (
    SELECT DISTINCT d.user_id FROM public.push_devices d
    WHERE d.device_id IS NOT NULL AND d.device_id <> ''
      AND d.device_id IN (
        SELECT device_id FROM public.push_devices
        WHERE device_id IS NOT NULL AND device_id <> ''
        GROUP BY device_id HAVING count(DISTINCT user_id) >= 2)
  ),
  burst AS (
    SELECT c.id FROM cand c
    WHERE (SELECT count(*) FROM cand c2
           WHERE c2.created_at BETWEEN c.created_at - interval '30 minutes' AND c.created_at + interval '30 minutes') >= 5
  ),
  texts AS (
    SELECT user_id AS uid, content AS t, created_at FROM public.posts
      WHERE created_at > now() - make_interval(days => p_days) AND content IS NOT NULL
    UNION ALL
    SELECT user_id, text, created_at FROM public.post_comments
      WHERE created_at > now() - make_interval(days => p_days) AND text IS NOT NULL
    UNION ALL
    SELECT sender_id, content, created_at FROM public.messages
      WHERE created_at > now() - make_interval(days => p_days) AND type = 'text' AND content IS NOT NULL
  ),
  dup AS (
    SELECT uid FROM texts WHERE length(t) > 10 AND uid IN (SELECT id FROM cand)
    GROUP BY uid, lower(t) HAVING count(*) >= 3
  ),
  links AS (
    SELECT uid FROM texts WHERE t ~* 'https?://|www\.' AND uid IN (SELECT id FROM cand)
    GROUP BY uid HAVING count(*) >= 3
  ),
  rate AS (
    SELECT t.uid FROM texts t JOIN cand c ON c.id = t.uid
    WHERE t.created_at <= c.created_at + interval '24 hours'
    GROUP BY t.uid HAVING count(*) >= 30
  ),
  fol AS (
    SELECT f.follower_id AS uid FROM public.follows f
    WHERE f.follower_id IN (SELECT id FROM cand)
    GROUP BY f.follower_id HAVING count(*) >= 50
       AND (SELECT count(*) FROM public.follows x WHERE x.following_id = f.follower_id) <= 1
  ),
  rep AS (
    SELECT uid FROM (
      SELECT reported_user_id AS uid, reporter_id FROM public.reports WHERE reported_user_id IS NOT NULL
      UNION
      SELECT reported_user_id, reporter_id FROM public.user_reports WHERE reported_user_id IS NOT NULL
    ) q WHERE uid IN (SELECT id FROM cand)
    GROUP BY uid HAVING count(*) >= 2
  ),
  blk AS (
    SELECT blocked_id AS uid FROM public.user_blocks
    WHERE blocked_id IN (SELECT id FROM cand)
    GROUP BY blocked_id HAVING count(DISTINCT blocker_id) >= 3
  ),
  scored AS (
    SELECT c.id, c.display_name, c.username, c.email, c.created_at,
      (CASE WHEN c.id IN (SELECT user_id FROM shared_dev) THEN 30 ELSE 0 END
     + CASE WHEN c.id IN (SELECT id FROM burst) THEN 15 ELSE 0 END
     + CASE WHEN c.dom IN ('mailinator.com','guerrillamail.com','10minutemail.com','tempmail.com','temp-mail.org',
                           'yopmail.com','trashmail.com','sharklasers.com','getnada.com','dispostable.com',
                           'maildrop.cc','throwawaymail.com','fakeinbox.com','mohmal.com','emailondeck.com') THEN 25 ELSE 0 END
     + CASE WHEN c.id IN (SELECT uid FROM dup) THEN 30 ELSE 0 END
     + CASE WHEN c.id IN (SELECT uid FROM links) THEN 15 ELSE 0 END
     + CASE WHEN c.id IN (SELECT uid FROM rate) THEN 25 ELSE 0 END
     + CASE WHEN c.id IN (SELECT uid FROM fol) THEN 15 ELSE 0 END
     + CASE WHEN c.id IN (SELECT uid FROM rep) THEN 20 ELSE 0 END
     + CASE WHEN c.id IN (SELECT uid FROM blk) THEN 15 ELSE 0 END
     + CASE WHEN c.birth_date IS NULL AND c.created_at < now() - interval '3 days' THEN 10 ELSE 0 END
     + CASE WHEN c.avatar_url IS NULL THEN 5 ELSE 0 END)::INT AS score,
      array_remove(ARRAY[
        CASE WHEN c.id IN (SELECT user_id FROM shared_dev) THEN 'Same device as another account' END,
        CASE WHEN c.id IN (SELECT id FROM burst) THEN 'Signed up in a burst (5+ accounts in 1 hour)' END,
        CASE WHEN c.dom IN ('mailinator.com','guerrillamail.com','10minutemail.com','tempmail.com','temp-mail.org',
                           'yopmail.com','trashmail.com','sharklasers.com','getnada.com','dispostable.com',
                           'maildrop.cc','throwawaymail.com','fakeinbox.com','mohmal.com','emailondeck.com') THEN 'Disposable email domain' END,
        CASE WHEN c.id IN (SELECT uid FROM dup) THEN 'Posts/sends identical text 3+ times' END,
        CASE WHEN c.id IN (SELECT uid FROM links) THEN '3+ links in posts/comments/messages' END,
        CASE WHEN c.id IN (SELECT uid FROM rate) THEN '30+ actions in first 24h' END,
        CASE WHEN c.id IN (SELECT uid FROM fol) THEN 'Follows 50+ people, nobody follows back' END,
        CASE WHEN c.id IN (SELECT uid FROM rep) THEN 'Reported by 2+ people' END,
        CASE WHEN c.id IN (SELECT uid FROM blk) THEN 'Blocked by 3+ people' END,
        CASE WHEN c.birth_date IS NULL AND c.created_at < now() - interval '3 days' THEN 'No birth data after 3 days' END,
        CASE WHEN c.avatar_url IS NULL THEN 'No profile photo' END
      ], NULL) AS reasons
    FROM cand c
  )
  SELECT s.id, s.display_name, s.username, s.email, s.created_at, s.score, s.reasons
  FROM scored s WHERE s.score >= p_min_score
  ORDER BY s.score DESC, s.created_at DESC
  LIMIT 200;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_mark_account_legit(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin) THEN
    RAISE EXCEPTION 'admin_mark_account_legit: caller is not an admin';
  END IF;
  INSERT INTO public.suspicious_account_reviews (user_id, decision, reviewed_by)
  VALUES (p_user_id, 'legit', auth.uid())
  ON CONFLICT (user_id) DO UPDATE SET reviewed_by = auth.uid(), reviewed_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.admin_suspicious_accounts(INT, INT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_mark_account_legit(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_suspicious_accounts(INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_mark_account_legit(UUID) TO authenticated;
