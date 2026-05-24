'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface Course {
  id: string;
  title: string;
  description: string;
  lessons: number;
  completed: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  glyph: string;
}

const COURSES: Course[] = [
  { id: '1', title: 'Introduction to Astrology', description: 'Learn the basics of zodiac signs, planets, and houses', lessons: 12, completed: 0, level: 'beginner', glyph: '☉' },
  { id: '2', title: 'The Zodiac Signs', description: 'Deep dive into all 12 zodiac signs and their meanings', lessons: 12, completed: 0, level: 'beginner', glyph: '♈' },
  { id: '3', title: 'Planetary Influences', description: 'Understanding how planets shape personality and events', lessons: 10, completed: 0, level: 'beginner', glyph: '♃' },
  { id: '4', title: 'Houses & Angles', description: 'The 12 houses and their life areas', lessons: 14, completed: 0, level: 'intermediate', glyph: '⌂' },
  { id: '5', title: 'Aspects & Orbs', description: 'How planets communicate through geometric angles', lessons: 8, completed: 0, level: 'intermediate', glyph: '△' },
  { id: '6', title: 'Chart Patterns', description: 'Grand trines, T-squares, yods and more', lessons: 10, completed: 0, level: 'advanced', glyph: '★' },
  { id: '7', title: 'Transits & Progressions', description: 'Predictive astrology techniques', lessons: 12, completed: 0, level: 'advanced', glyph: '↻' },
  { id: '8', title: 'Synastry & Composite', description: 'Relationship astrology mastery', lessons: 10, completed: 0, level: 'advanced', glyph: '♥' },
];

const LEVELS = [
  { key: 'beginner', labelKey: 'courses.beginner' },
  { key: 'intermediate', labelKey: 'courses.intermediate' },
  { key: 'advanced', labelKey: 'courses.advanced' },
];

export default function CoursesPage() {
  const { t } = useTranslation();
  const [activeLevel, setActiveLevel] = useState('beginner');
  const filtered = COURSES.filter((c) => c.level === activeLevel);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-text-primary mb-6">{t('courses.title')}</h1>

      {/* Level filter pills */}
      <div className="flex gap-2 mb-6">
        {LEVELS.map((level) => (
          <button
            key={level.key}
            onClick={() => setActiveLevel(level.key)}
            className={cn(
              'level-pill',
              activeLevel === level.key && 'level-pill-active'
            )}
          >
            {t(level.labelKey)}
          </button>
        ))}
      </div>

      {/* Course cards */}
      <div className="space-y-4">
        {filtered.map((course) => {
          const progress = course.lessons > 0 ? (course.completed / course.lessons) * 100 : 0;
          return (
            <div key={course.id} className="card">
              {/* Header row */}
              <div className="flex gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl text-accent-secondary">{course.glyph}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-text-primary">{course.title}</h3>
                  <p className="text-sm text-text-tertiary">{course.description}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-1 bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-primary rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-text-muted whitespace-nowrap">
                  {course.completed}/{course.lessons} lessons
                </span>
              </div>

              {/* Start button */}
              <Link href={`/courses/${course.id}`} className="w-full btn-primary py-3 text-sm block text-center">
                {course.completed > 0 ? t('courses.continue') : t('courses.startCourse')}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
