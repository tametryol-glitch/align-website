'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { ChecklistItem } from '@/hooks/useGettingStarted';

interface GettingStartedChecklistProps {
  items: ChecklistItem[];
  completedIds: string[];
  completedCount: number;
  totalCount: number;
  isAllDone: boolean;
  onDismiss: () => void;
  onMarkComplete: (id: string) => void;
}

export function GettingStartedChecklist({
  items,
  completedIds,
  completedCount,
  totalCount,
  isAllDone,
  onDismiss,
}: GettingStartedChecklistProps) {
  const { t } = useTranslation();
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    if (isAllDone) {
      setShowCongrats(true);
      const timer = setTimeout(() => {
        onDismiss();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isAllDone, onDismiss]);

  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (showCongrats) {
    return (
      <div className="card rounded-2xl p-5 text-center animate-fadeIn">
        <span className="text-3xl block mb-2">&#127881;</span>
        <p className="text-sm font-semibold text-text-primary">
          {t('gettingStarted.congrats', "You're all set! Welcome to the cosmos.")}
        </p>
      </div>
    );
  }

  return (
    <div className="card rounded-2xl p-5 relative animate-fadeIn">
      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors text-sm"
        aria-label="Dismiss"
      >
        &#10005;
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">&#128640;</span>
        <h3 className="text-sm font-semibold text-text-primary">
          {t('gettingStarted.title', 'Getting Started')}
        </h3>
        <span className="text-xs text-text-muted ml-auto mr-6">
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-bg-tertiary mb-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progressPct}%`,
            background: 'linear-gradient(90deg, var(--accent-primary, #8b5cf6), var(--accent-secondary, #ec4899))',
          }}
        />
      </div>

      {/* Checklist items */}
      <ul className="space-y-1.5">
        {items.map((item) => {
          const done = completedIds.includes(item.id);
          return (
            <li key={item.id}>
              {done ? (
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm">
                  <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 text-xs">&#10003;</span>
                  </span>
                  <span className="text-text-muted line-through">
                    {t(item.labelKey)}
                  </span>
                </div>
              ) : (
                <Link
                  href={item.route}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-bg-tertiary transition-colors group"
                >
                  <span className="w-5 h-5 rounded-full border border-border-primary flex items-center justify-center flex-shrink-0 group-hover:border-accent-primary transition-colors">
                  </span>
                  <span className="text-text-secondary group-hover:text-text-primary transition-colors">
                    {item.icon} {t(item.labelKey)}
                  </span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
