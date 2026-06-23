'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface ApiLesson { id: string; title: string; duration_minutes: number }
interface ApiCourse {
  id: string;
  title: string;
  description: string;
  level: string;
  level_order: number;
  level_label: string;
  is_free: boolean;
  image_emoji: string;
  prerequisite_id: string | null;
  lesson_count: number;
  lessons: ApiLesson[];
}

export default function CoursesPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await api.getCourses();
        setCourses(Array.isArray(list) ? list : []);
        if (user?.id) {
          const prog = await api.getCourseProgress(user.id).catch(() => null);
          if (prog?.completed_lessons) setCompleted(new Set<string>(prog.completed_lessons));
        }
      } catch { /* leave empty */ }
      setLoading(false);
    })();
  }, [user?.id]);

  const completedCount = (c: ApiCourse) => c.lessons.filter(l => completed.has(l.id)).length;
  const isCourseDone = (c: ApiCourse) => c.lesson_count > 0 && completedCount(c) >= c.lesson_count;
  const isLocked = (c: ApiCourse) => {
    if (!c.prerequisite_id) return false;
    const prereq = courses.find(x => x.id === c.prerequisite_id);
    return !!prereq && !isCourseDone(prereq);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-text-primary mb-1">{t('courses.title', 'Learn')}</h1>
      <p className="text-sm text-text-tertiary mb-6">
        Whole Sign houses · the Align rulership system · beginner to certified, one level at a time.
      </p>

      {loading ? (
        <p className="text-sm text-text-muted py-8 text-center">{t('common.loading', 'Loading…')}</p>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => {
            const done = completedCount(course);
            const pct = course.lesson_count > 0 ? (done / course.lesson_count) * 100 : 0;
            const locked = isLocked(course);
            const prereq = course.prerequisite_id ? courses.find(x => x.id === course.prerequisite_id) : null;
            return (
              <div key={course.id} className={`card ${locked ? 'opacity-70' : ''}`}>
                <div className="flex gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-accent-muted flex items-center justify-center flex-shrink-0 text-2xl">
                    {course.image_emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-secondary/10 text-accent-secondary">
                        {course.level_label || course.level}
                      </span>
                      {!course.is_free && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">Premium</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mt-1">{course.title}</h3>
                    <p className="text-sm text-text-tertiary">{course.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 h-1 bg-bg-tertiary rounded-full overflow-hidden">
                    <div className="h-full bg-accent-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-text-muted whitespace-nowrap">{done}/{course.lesson_count} lessons</span>
                </div>

                {locked ? (
                  <div className="w-full py-3 text-sm rounded-xl border border-border text-text-muted flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" /> Complete {prereq?.level_label || 'the previous level'} to unlock
                  </div>
                ) : (
                  <Link href={`/courses/${course.id}`} className="w-full btn-primary py-3 text-sm block text-center">
                    {done > 0 ? (isCourseDone(course) ? t('courses.review', 'Review') : t('courses.continue', 'Continue')) : t('courses.startCourse', 'Start')}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
