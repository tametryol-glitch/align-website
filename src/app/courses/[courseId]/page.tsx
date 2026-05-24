'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Circle, BookOpen } from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';

export default function CourseDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const courseId = params.courseId as string;
  const { user } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getCourse(courseId);
        setCourse(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (courseId) load();
  }, [courseId]);

  if (loading) return <div className="max-w-3xl mx-auto"><LoadingCosmic label={t('common.loading')} /></div>;

  if (error || !course) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card text-center py-12">
          <p className="text-red-400 mb-4">{error || t('errors.notFound')}</p>
          <Link href="/courses" className="btn-secondary">{t('common.back')}</Link>
        </div>
      </div>
    );
  }

  const lessons = course.lessons || [];
  const completedCount = lessons.filter((l: any) => l.completed).length;

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/courses" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> {t('courses.title')}
      </Link>

      <div className="bg-gradient-cosmic rounded-2xl p-8 border border-accent-muted mb-6">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="w-8 h-8 text-accent-primary" />
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">{course.title}</h1>
            <p className="text-xs text-text-muted">{course.level} · {lessons.length} lessons</p>
          </div>
        </div>
        {course.description && (
          <p className="text-text-secondary text-sm">{course.description}</p>
        )}
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-text-muted mb-1">
            <span>Progress</span>
            <span>{completedCount}/{lessons.length} complete</span>
          </div>
          <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-accent rounded-full transition-all"
              style={{ width: `${lessons.length ? (completedCount / lessons.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lesson list */}
      <div className="space-y-2">
        {lessons.map((lesson: any, i: number) => (
          <Link
            key={lesson.id || i}
            href={`/courses/${courseId}/${lesson.id || i}`}
            className="card flex items-center gap-4 py-4 hover:border-accent-primary/30 transition-colors"
          >
            {lesson.completed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            ) : (
              <Circle className="w-6 h-6 text-text-muted flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-text-primary truncate">{lesson.title}</h3>
              {lesson.description && (
                <p className="text-xs text-text-tertiary truncate">{lesson.description}</p>
              )}
            </div>
            <span className="text-xs text-text-muted flex-shrink-0">Lesson {i + 1}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
