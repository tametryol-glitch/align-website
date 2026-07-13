'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { FounderContent } from '@/components/FounderContent';
import { AddFounderCard } from '@/components/AddFounderCard';

const STORAGE_KEY = 'align_founder_intro_seen';

export function FounderIntroModal() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // The Zodisphere embeds are chromeless renderers loaded inside the mobile
  // WebView — no global app modals should appear over the globes there.
  const suppressed =
    (pathname?.startsWith('/zodisphere/embed') || pathname?.startsWith('/zodisphere/globe3d/embed')) ?? false;

  useEffect(() => {
    if (suppressed) return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // localStorage unavailable (private mode / SSR) — skip showing the modal
      return;
    }

    // Don't interrupt a first-time visitor's first look at the page: open the
    // intro only after they've settled in (45s) or shown intent by scrolling
    // ~40% of the viewport height — whichever comes first. Fires at most once.
    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      setOpen(true);
    };
    const timer = setTimeout(fire, 45_000);
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.4) fire();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [suppressed]);

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

            <div className="mt-8">
              <AddFounderCard />
            </div>

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
