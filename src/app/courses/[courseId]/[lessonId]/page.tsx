'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';

export default function LessonPage() {
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

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getLesson(courseId, lessonId);
        setLesson(data);
        setSlideIndex(0);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (courseId && lessonId) load();
  }, [courseId, lessonId]);

  async function markComplete() {
    if (!user) return;
    setCompleting(true);
    try {
      await api.completeLesson(courseId, lessonId, user.id);
      router.push(`/courses/${courseId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCompleting(false);
    }
  }

  if (loading) return <div className="max-w-3xl mx-auto"><LoadingCosmic label="Loading lesson..." /></div>;

  const slides = lesson?.slides || lesson?.content ? [lesson] : [];
  const totalSlides = slides.length;
  const currentSlide = slides[slideIndex] || lesson;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href={`/courses/${courseId}`} className="btn-ghost p-2 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        {totalSlides > 1 && (
          <span className="text-xs text-text-muted">
            Slide {slideIndex + 1} of {totalSlides}
          </span>
        )}
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="card min-h-[400px] flex flex-col">
        <h1 className="text-xl font-display font-bold text-text-primary mb-4">
          {lesson?.title || 'Lesson'}
        </h1>

        {/* Lesson content */}
        <div className="flex-1 text-text-secondary text-sm leading-relaxed space-y-4">
          {typeof currentSlide?.content === 'string' ? (
            currentSlide.content.split('\n').map((paragraph: string, i: number) => (
              paragraph.trim() ? <p key={i}>{paragraph}</p> : null
            ))
          ) : (
            <p>{lesson?.description || 'Lesson content is loading...'}</p>
          )}

          {currentSlide?.image_url && (
            <div className="rounded-xl overflow-hidden">
              <Image src={currentSlide.image_url} alt="Lesson slide" width={800} height={450} className="w-full" unoptimized />
            </div>
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
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={markComplete}
              disabled={completing}
              className="btn-primary flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {completing ? 'Saving...' : 'Complete Lesson'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
