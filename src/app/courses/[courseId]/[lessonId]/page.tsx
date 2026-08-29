'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { awardXP } from '@/lib/gamificationService';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { LessonBody, LessonObjectives, ChartFocusCard, KeyTerms, LessonQuiz } from '@/components/courses/LessonExtras';
import { LessonVisual } from '@/components/courses/LessonVisuals';

export default function LessonPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  const { user } = useAuthStore();

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);
  const [glossary, setGlossary] = useState<Record<string, string>>({});
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getLesson(courseId, lessonId);
        setLesson(data);
        setSlideIndex(0);
        api.getCoursesMeta().then((m: any) => setGlossary(m?.glossary || {})).catch(() => {});
        // Needed so a re-read of a finished lesson does not award XP twice.
        if (user?.id) {
          api.getCourseProgress(user.id)
            .then((p: any) => setAlreadyCompleted(!!p?.completed_lessons?.includes(lessonId)))
            .catch(() => {});
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (courseId && lessonId) load();
  }, [courseId, lessonId, user?.id]);

  async function markComplete() {
    if (!user) return;
    setCompleting(true);
    try {
      await api.completeLesson(courseId, lessonId, user.id);
      if (!alreadyCompleted) {
        awardXP(user.id, 'lesson_completed').catch(() => {});
      }
      router.push(`/courses/${courseId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCompleting(false);
    }
  }

  if (loading) return <div className="max-w-3xl mx-auto"><LoadingCosmic label={t('common.loading')} /></div>;

  // Authored decks (from the Learn CMS) win; otherwise the lesson body is a
  // single slide. The previous expression parsed as `(a || b) ? [lesson] : []`,
  // so an authored deck could never produce more than one slide.
  const authoredSlides = Array.isArray(lesson?.slides) ? lesson.slides : [];
  const slides = authoredSlides.length > 0
    ? authoredSlides
    : (lesson?.content ? [lesson] : []);
  const totalSlides = slides.length;
  const currentSlide = slides[slideIndex] || lesson;
  const isLastSlide = slideIndex >= totalSlides - 1;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href={`/courses/${courseId}`} className="btn-ghost p-2 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> {t('common.back')}
        </Link>
        {totalSlides > 1 && (
          <div className="flex items-center gap-1.5" aria-label={`Slide ${slideIndex + 1} of ${totalSlides}`}>
            {slides.map((_: any, i: number) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === slideIndex ? 'w-5 bg-accent-primary' : 'w-1.5 bg-bg-tertiary'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="card min-h-[400px] flex flex-col">
        <h1 className="text-xl font-display font-bold text-text-primary mb-4">
          {lesson?.title || 'Lesson'}
        </h1>

        {/* Lesson content */}
        <div className="flex-1">
          {slideIndex === 0 && <LessonObjectives objectives={lesson?.objectives} />}

          {authoredSlides.length > 0 && (
            <>
              <LessonVisual visual={currentSlide?.visual} data={currentSlide?.visualData} />
              {currentSlide?.title && (
                <h2 className="text-base font-semibold text-text-primary mb-2 mt-2">{currentSlide.title}</h2>
              )}
            </>
          )}

          {typeof currentSlide?.content === 'string' ? (
            <LessonBody content={currentSlide.content} />
          ) : (
            <p className="text-text-secondary text-sm">{lesson?.description || 'Lesson content is loading...'}</p>
          )}

          {currentSlide?.image_url && (
            <div className="rounded-xl overflow-hidden mt-4">
              <Image src={currentSlide.image_url} alt="Lesson slide" width={800} height={450} className="w-full" unoptimized />
            </div>
          )}

          {isLastSlide && (
            <>
              <ChartFocusCard chartFocus={lesson?.chart_focus} />
              <KeyTerms terms={lesson?.key_terms} glossary={glossary} />
              <LessonQuiz quiz={lesson?.quiz} />
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-border-primary mt-6">
          <button
            onClick={() => setSlideIndex(Math.max(0, slideIndex - 1))}
            disabled={slideIndex === 0}
            className="btn-ghost disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {slideIndex < totalSlides - 1 ? (
            <button
              onClick={() => setSlideIndex(slideIndex + 1)}
              className="btn-primary flex items-center gap-2"
            >
              {t('common.next')} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={markComplete}
              disabled={completing}
              className="btn-primary flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {completing ? t('editProfile.saving') : t('courses.completed')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
