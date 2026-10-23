'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Standard back button. Goes to the previous page in history; if the page was
 * opened directly (new tab, deep link, push notification) there is no history,
 * so it falls back to `fallbackHref` instead of leaving the user stranded.
 */
export function BackButton({
  fallbackHref = '/dashboard',
  label,
  className = 'btn-ghost p-2 inline-flex items-center gap-1 mb-4',
}: {
  fallbackHref?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const { t } = useTranslation();

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button type="button" onClick={goBack} className={className} aria-label={label || t('common.back', 'Back')}>
      <ArrowLeft className="w-4 h-4" /> {label ?? t('common.back', 'Back')}
    </button>
  );
}
