'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { FounderContent } from '@/components/FounderContent';

const STORAGE_KEY = 'align_founder_intro_seen';

export function FounderIntroModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setOpen(true);
      }
    } catch {
      // localStorage unavailable (private mode / SSR) — skip showing the modal
    }
  }, []);

  function close() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore write failures
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[70] transition-opacity"
        onClick={close}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto bg-bg-card border border-border-primary rounded-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto shadow-2xl shadow-purple-500/20 relative">
          {/* Close button */}
          <button
            onClick={close}
            aria-label="Close"
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-bg-tertiary/80 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6 sm:p-8">
            <FounderContent />

            <div className="mt-8 space-y-3">
              <button onClick={close} className="btn-primary w-full py-2.5 text-sm font-semibold">
                Close
              </button>
              <p className="text-center text-xs text-text-muted">
                You can read more later anytime on the Meet the Founder page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
