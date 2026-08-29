'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy, ShieldAlert, X } from 'lucide-react';
import {
  FREQUENCY_THEMES,
  HEALTH_PRACTICE_NOTE,
  PRACTICE_NOTES,
  PRACTICE_STEPS,
  requiresDisclaimer,
  type CosmicFrequency,
} from '@/data/cosmicFrequencies';
import { HEALTH_DISCLAIMER } from '@/lib/cosmicFrequencies/disclaimer';

interface Props {
  frequency: CosmicFrequency | null;
  onClose: () => void;
}

/**
 * Frequency detail, as a centred overlay.
 *
 * This used to render inline at the foot of the page, which put it below
 * the entire catalog: clicking an entry near the top appeared to do
 * nothing at all, so people clicked again. An overlay always opens in
 * view, whatever the catalog grows to.
 */
export function FrequencyDetailModal({ frequency, onClose }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!frequency) return;
    document.addEventListener('keydown', handleKeyDown);
    // Stop the page behind from scrolling while the overlay is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prev;
    };
  }, [frequency, handleKeyDown]);

  useEffect(() => setCopied(false), [frequency]);

  if (!frequency) return null;

  const gated = requiresDisclaimer(frequency);

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-start sm:items-center justify-center px-4 py-6 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cf-detail-title"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border-primary shadow-2xl my-auto"
        style={{ backgroundColor: 'var(--bg-card, #1a1a2e)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 rounded-t-2xl flex items-start justify-between gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.35), rgba(236,72,153,0.22))',
          }}
        >
          <div>
            <p className="text-[11px] uppercase tracking-wide text-text-muted mb-1">
              {t(
                `cosmicFrequencies.domain.${frequency.domain}`,
                frequency.domain,
              )}
            </p>
            <h2
              id="cf-detail-title"
              className="text-lg font-display font-bold text-text-primary"
            >
              {frequency.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label={t('common.close', 'Close')}
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        <div className="px-5 py-5">
          {/* The sequence */}
          <div className="flex items-center gap-3 mb-5">
            <p className="font-mono text-2xl sm:text-3xl text-accent-primary tracking-wider break-all">
              {frequency.code}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(frequency.code).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label={t('cosmicFrequencies.copy', 'Copy sequence')}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-text-muted" />
              )}
            </button>
          </div>

          {/* What it is for */}
          <section className="mb-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-2">
              {t('cosmicFrequencies.whatItIsFor', 'What this one is for')}
            </h3>
            <p className="text-sm leading-relaxed text-text-secondary">{frequency.intent}</p>
          </section>

          {/* How to use */}
          <section className="mb-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-3">
              {t('cosmicFrequencies.howToUse', 'How to work with it')}
            </h3>
            <ol className="space-y-3">
              {PRACTICE_STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-primary/20 text-accent-primary text-[11px] font-semibold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{step.title}</p>
                    <p className="text-xs leading-relaxed text-text-muted mt-0.5">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Worth knowing */}
          <section className="mb-5">
            <ul className="space-y-1.5">
              {PRACTICE_NOTES.map((note) => (
                <li key={note} className="text-xs leading-relaxed text-text-muted flex gap-2">
                  <span aria-hidden className="text-accent-primary">·</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Themes */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {frequency.themes.map((th) => (
              <span
                key={th}
                className="px-2 py-1 rounded-md text-[11px] bg-white/5 text-text-muted"
              >
                {FREQUENCY_THEMES[th].label}
              </span>
            ))}
          </div>

          {/* Health footer — persistent, never a buried link */}
          {gated && (
            <div className="pt-4 border-t border-border-primary space-y-2">
              <div className="flex gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-text-muted">
                  {t('cosmicFrequencies.healthPracticeNote', HEALTH_PRACTICE_NOTE)}
                </p>
              </div>
              <p className="text-[11px] leading-relaxed text-text-muted pl-6">
                {t('cosmicFrequencies.disclaimer.body', HEALTH_DISCLAIMER)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
