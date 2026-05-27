'use client';

import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { WhatsNewEntry } from '@/lib/whatsNew';

interface WhatsNewModalProps {
  visible: boolean;
  entry: WhatsNewEntry | null;
  onDismiss: () => void;
}

export function WhatsNewModal({ visible, entry, onDismiss }: WhatsNewModalProps) {
  const { t } = useTranslation();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    },
    [onDismiss]
  );

  useEffect(() => {
    if (!visible) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, handleKeyDown]);

  if (!visible || !entry) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4 animate-fadeIn"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden border border-border-primary shadow-2xl"
        style={{ backgroundColor: 'var(--bg-card, #1a1a2e)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient header */}
        <div
          className="px-6 py-5"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(236,72,153,0.3))',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">&#10024;</span>
            <div className="flex-1">
              <h2 className="text-lg font-display font-bold text-text-primary">
                {t('whatsNew.title', entry.title)}
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-accent-primary/20 text-accent-primary border border-accent-primary/30">
              v{entry.version}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[50vh] overflow-y-auto">
          <ul className="space-y-3">
            {entry.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                <span className="text-green-400 mt-0.5 flex-shrink-0">&#10003;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-2">
          <button
            onClick={onDismiss}
            className="btn-primary w-full text-center"
          >
            {t('whatsNew.gotIt', 'Got it')}
          </button>
        </div>
      </div>
    </div>
  );
}
