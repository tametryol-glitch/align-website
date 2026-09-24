-- ═════════════════════════════════════════════════════════════════════════════
-- ALIGN — Story previews in the rail
--
-- The rail now shows each author's newest story as a card (photo, video poster
-- frame, or text tile) instead of just their avatar. Video stories get a
-- poster JPEG uploaded next to the video; this stores its URL and returns it
-- from get_story_rail(). supabase-migration-stories.sql already includes both
-- changes for fresh installs.
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

CREATE OR REPLACE FUNCTION public.get_story_rail()
RETURNS TABLE (
  user_id      UUID,
  display_name TEXT,
  avatar_url   TEXT,
  all_seen     BOOLEAN,
  latest_at    TIMESTAMPTZ,
  stories      JSONB
)
LANGUAGE sql STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH authors AS (
    SELECT auth.uid() AS uid
    UNION SELECT following_id FROM public.follows WHERE follower_id = auth.uid()
    UNION SELECT CASE WHEN f.user_id = auth.uid() THEN f.friend_id ELSE f.user_id END
            FROM public.friendships f
           WHERE f.status = 'accepted'
             AND (f.user_id = auth.uid() OR f.friend_id = auth.uid())
  ),
  live AS (
    SELECT s.*,
           EXISTS (SELECT 1 FROM public.story_views v
                    WHERE v.story_id = s.id AND v.viewer_id = auth.uid()) AS seen
      FROM public.stories s
     WHERE s.user_id IN (SELECT uid FROM authors)
       AND s.expires_at > NOW()
  )
  SELECT l.user_id,
         p.display_name,
         p.avatar_url,
         bool_and(l.seen)  AS all_seen,
         max(l.created_at) AS latest_at,
         jsonb_agg(jsonb_build_object(
           'id',               l.id,
           'type',             l.type,
           'content',          l.content,
           'media_url',        l.media_url,
           'thumbnail_url',    l.thumbnail_url,
           'background_color', l.background_color,
           'duration_seconds', l.duration_seconds,
           'visibility',       l.visibility,
           'view_count',       CASE WHEN l.user_id = auth.uid() THEN l.view_count END,
           'created_at',       l.created_at,
           'expires_at',       l.expires_at,
           'seen',             l.seen
         ) ORDER BY l.created_at) AS stories
    FROM live l
    JOIN public.profiles p ON p.id = l.user_id
   GROUP BY l.user_id, p.display_name, p.avatar_url
   ORDER BY (l.user_id = auth.uid()) DESC, bool_and(l.seen) ASC, max(l.created_at) DESC;
$$;
REVOKE ALL ON FUNCTION public.get_story_rail() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_story_rail() TO authenticated;
