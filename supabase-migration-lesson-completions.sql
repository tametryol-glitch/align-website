-- Learn — lesson_completions
--
-- The courses API has always written completions to this table, but no
-- migration in any repo ever created it. When the write fails, the endpoint
-- falls back to an in-process dict, so progress survives only until the next
-- Railway restart — and the failure was swallowed silently.
--
-- The upsert uses on_conflict="user_id,lesson_id", so the UNIQUE constraint
-- below is required, not optional: without it every write raises.
--
-- Safe to run whether or not the table already exists.

CREATE TABLE IF NOT EXISTS public.lesson_completions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id    text NOT NULL,
  lesson_id    text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now()
);

-- Top-ups for an install that predates these (CREATE TABLE IF NOT EXISTS is a
-- no-op on an existing table and would otherwise leave them missing).
ALTER TABLE public.lesson_completions ADD COLUMN IF NOT EXISTS course_id    text;
ALTER TABLE public.lesson_completions ADD COLUMN IF NOT EXISTS completed_at timestamptz NOT NULL DEFAULT now();

-- The constraint the API's on_conflict depends on.
CREATE UNIQUE INDEX IF NOT EXISTS lesson_completions_user_lesson_key
  ON public.lesson_completions(user_id, lesson_id);

CREATE INDEX IF NOT EXISTS idx_lesson_completions_user
  ON public.lesson_completions(user_id);

-- ── RLS: a user sees and writes only their own completions ───────────────
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lesson_completions_own_read" ON public.lesson_completions;
CREATE POLICY "lesson_completions_own_read" ON public.lesson_completions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "lesson_completions_own_write" ON public.lesson_completions;
CREATE POLICY "lesson_completions_own_write" ON public.lesson_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grants (new tables need explicit grants on this project)
GRANT SELECT, INSERT ON public.lesson_completions TO authenticated;
