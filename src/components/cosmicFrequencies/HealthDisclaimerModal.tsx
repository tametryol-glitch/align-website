'use client';

import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HEALTH_DISCLAIMER } from '@/lib/cosmicFrequencies/disclaimer';

interface HealthDisclaimerModalProps {
  visible: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

/**
 * Blocking acknowledgement shown before first entry to any health frequency.
 *
 * Deliberately NOT dismissible by backdrop click or Escape — those read as
 * "I got rid of the popup", not as consent. The only way past it is the
 * affirmative button, which is what makes it worth anything.
 */
export function HealthDisclaimerModal({
  visible,
  onAccept,
  onCancel,
}: HealthDisclaimerModalProps) {
  const { t } = useTranslation();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Escape cancels (closes without consent) rather than accepting.
      if (e.key === 'Escape') onCancel();
    },
    [onCancel],
  );

  useEffect(() => {
    if (!visible) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, handleKeyDown]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4 animate-fadeIn"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cf-disclaimer-title"
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden border border-border-primary shadow-2xl"
        style={{ backgroundColor: 'var(--bg-card, #1a1a2e)' }}
      >
        <div
          className="px-6 py-5"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(236,72,153,0.3))',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden>&#9877;</span>
            <h2
              id="cf-disclaimer-title"
              className="text-lg font-display font-bold text-text-primary"
            >
              {t('cosmicFrequencies.disclaimer.title', 'Before you continue')}
            </h2>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm leading-relaxed text-text-secondary">
            {t('cosmicFrequencies.disclaimer.body', HEALTH_DISCLAIMER)}
          </p>

          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:bg-white/5 transition-colors"
            >
              {t('cosmicFrequencies.disclaimer.cancel', 'Not now')}
            </button>
            <button
              onClick={onAccept}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, rgb(139,92,246), rgb(236,72,153))',
              }}
            >
              {t('cosmicFrequencies.disclaimer.accept', 'I understand')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
