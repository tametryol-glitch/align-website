-- Learn CMS — Phase 3
-- Moves course/lesson content into Supabase so it can be edited (and given
-- images) from the web and app admin editors. Run in the Supabase SQL Editor.
-- After running, seed from courses.json with: node align-web/scripts/seed-learn.mjs

-- ── Courses ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.learn_courses (
  id              text PRIMARY KEY,                 -- keeps the courses.json ids
  title           text NOT NULL,
  description     text NOT NULL DEFAULT '',
  level           text NOT NULL DEFAULT 'beginner',
  level_order     int  NOT NULL DEFAULT 0,
  level_label     text NOT NULL DEFAULT '',
  is_free         boolean NOT NULL DEFAULT true,
  image_emoji     text NOT NULL DEFAULT '',
  image_url       text,                             -- NEW: course cover image
  prerequisite_id text,
  sort_order      int  NOT NULL DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ── Lessons ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.learn_lessons (
  id               text PRIMARY KEY,                -- keeps the courses.json ids
  course_id        text NOT NULL REFERENCES public.learn_courses(id) ON DELETE CASCADE,
  title            text NOT NULL,
  duration_minutes int  NOT NULL DEFAULT 5,
  content          text NOT NULL DEFAULT '',
  objectives       text[] NOT NULL DEFAULT '{}',
  key_terms        text[] NOT NULL DEFAULT '{}',
  chart_focus      text,
  quiz             jsonb  NOT NULL DEFAULT '[]',
  image_url        text,                            -- NEW: lesson image
  sort_order       int  NOT NULL DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learn_courses_order ON public.learn_courses(level_order, sort_order);
CREATE INDEX IF NOT EXISTS idx_learn_lessons_course ON public.learn_lessons(course_id, sort_order);

-- ── RLS: public reads everything, admins manage ──────────────────
ALTER TABLE public.learn_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "learn_courses_read" ON public.learn_courses;
CREATE POLICY "learn_courses_read" ON public.learn_courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "learn_lessons_read" ON public.learn_lessons;
CREATE POLICY "learn_lessons_read" ON public.learn_lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "learn_courses_admin" ON public.learn_courses;
CREATE POLICY "learn_courses_admin" ON public.learn_courses FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "learn_lessons_admin" ON public.learn_lessons;
CREATE POLICY "learn_lessons_admin" ON public.learn_lessons FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.touch_learn_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS learn_courses_touch ON public.learn_courses;
CREATE TRIGGER learn_courses_touch BEFORE UPDATE ON public.learn_courses
  FOR EACH ROW EXECUTE FUNCTION public.touch_learn_updated_at();

DROP TRIGGER IF EXISTS learn_lessons_touch ON public.learn_lessons;
CREATE TRIGGER learn_lessons_touch BEFORE UPDATE ON public.learn_lessons
  FOR EACH ROW EXECUTE FUNCTION public.touch_learn_updated_at();

-- Grants (new tables need explicit grants on this project)
GRANT SELECT ON public.learn_courses TO anon, authenticated;
GRANT SELECT ON public.learn_lessons TO anon, authenticated;
GRANT ALL    ON public.learn_courses TO authenticated;
GRANT ALL    ON public.learn_lessons TO authenticated;
