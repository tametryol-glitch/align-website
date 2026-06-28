/**
 * Seed the Learn CMS tables (learn_courses + learn_lessons) from the FastAPI
 * courses.json data file.
 *
 * Run from the align-web root with the env vars set (e.g. from .env.local):
 *
 *   node scripts/seed-learn.mjs
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY env vars.');
  console.error('Set them (e.g. export them from .env.local) and re-run: node scripts/seed-learn.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// courses.json lives in the sibling FastAPI repo, relative to align-web root.
const DATA_PATH = resolve(__dirname, '../../align-api-v2/app/data/courses.json');

function loadCourses() {
  const raw = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
  // courses.json is { house_system, rulership, ..., courses: [...] }
  const courses = Array.isArray(raw) ? raw : raw.courses;
  if (!Array.isArray(courses)) {
    throw new Error('Could not find a courses array in ' + DATA_PATH);
  }
  return courses;
}

async function main() {
  const courses = loadCourses();
  console.log(`Loaded ${courses.length} courses from ${DATA_PATH}`);

  const courseRows = [];
  const lessonRows = [];

  courses.forEach((course, courseIndex) => {
    courseRows.push({
      id: course.id,
      title: course.title,
      description: course.description ?? '',
      level: course.level ?? null,
      level_order: course.level_order ?? courseIndex + 1,
      level_label: course.level_label ?? null,
      is_free: course.is_free ?? false,
      image_emoji: course.image_emoji ?? null,
      image_url: course.image_url ?? null,
      prerequisite_id: course.prerequisite_id ?? null,
      sort_order: courseIndex,
    });

    const lessons = Array.isArray(course.lessons) ? course.lessons : [];
    lessons.forEach((lesson, lessonIndex) => {
      lessonRows.push({
        id: lesson.id,
        course_id: course.id,
        title: lesson.title,
        duration_minutes: lesson.duration_minutes ?? null,
        content: lesson.content ?? '',
        objectives: lesson.objectives ?? [],
        key_terms: lesson.key_terms ?? [],
        chart_focus: lesson.chart_focus ?? null,
        quiz: lesson.quiz ?? [],
        image_url: lesson.image_url ?? null,
        sort_order: lessonIndex,
      });
    });
  });

  console.log(`Prepared ${courseRows.length} courses and ${lessonRows.length} lessons.`);

  // Upsert courses first (lessons FK -> courses.id).
  const { error: courseErr } = await supabase
    .from('learn_courses')
    .upsert(courseRows, { onConflict: 'id' });
  if (courseErr) {
    console.error('Failed to upsert courses:', courseErr.message);
    process.exit(1);
  }
  console.log(`Upserted ${courseRows.length} courses.`);

  // Upsert lessons.
  const { error: lessonErr } = await supabase
    .from('learn_lessons')
    .upsert(lessonRows, { onConflict: 'id' });
  if (lessonErr) {
    console.error('Failed to upsert lessons:', lessonErr.message);
    process.exit(1);
  }
  console.log(`Upserted ${lessonRows.length} lessons.`);

  // Final counts straight from the DB.
  const { count: courseCount } = await supabase
    .from('learn_courses')
    .select('id', { count: 'exact', head: true });
  const { count: lessonCount } = await supabase
    .from('learn_lessons')
    .select('id', { count: 'exact', head: true });

  console.log('---');
  console.log(`Done. learn_courses total rows: ${courseCount ?? '?'}`);
  console.log(`Done. learn_lessons total rows: ${lessonCount ?? '?'}`);
}

main().catch((e) => {
  console.error('Seed failed:', e?.message || e);
  process.exit(1);
});
