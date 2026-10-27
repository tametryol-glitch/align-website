'use client';

/**
 * First-run walkthrough for the editor: four short cards, shown once (remembered
 * in localStorage), skippable, and re-openable from the "?" button in the top bar.
 */

import { useEffect, useState } from 'react';
import { Film, MousePointerClick, Scissors, Download, X } from 'lucide-react';

const KEY = 'align.editor.tour.v1';

const STEPS = [
  { Icon: Film, title: 'Add your media', body: 'Use the buttons up top to add music, sound effects, text, stickers or another video. Songs fit your video automatically.' },
  { Icon: MousePointerClick, title: 'Click a clip to edit it', body: 'Select any clip on the timeline and its volume, speed, size and text controls appear next to the preview.' },
  { Icon: Scissors, title: 'Trim, split, rearrange', body: 'Drag a clip to move it, drag its edges to trim. Press S to split at the playhead, Delete to remove, Ctrl+Z to undo.' },
  { Icon: Download, title: 'Export when it looks right', body: 'Tap Export (top right). We render it for you, then you can post it or download it.' },
];

export function EditorTour({ forceOpen, onClosed }: { forceOpen: boolean; onClosed: () => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(KEY) === '1'; } catch { /* storage blocked: show once per load */ }
    if (!seen) setOpen(true);
  }, []);
  useEffect(() => { if (forceOpen) { setStep(0); setOpen(true); } }, [forceOpen]);

  const close = () => {
    try { localStorage.setItem(KEY, '1'); } catch { /* ignore */ }
    setOpen(false);
    onClosed();
  };

  if (!open) return null;
  const { Icon, title, body } = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Editor tour">
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-bg-secondary shadow-2xl p-6 text-center">
        <button onClick={close} aria-label="Skip tour" className="absolute top-3 right-3 p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-white/10">
          <X className="w-4 h-4" />
        </button>
        <div className="w-12 h-12 mx-auto rounded-2xl bg-accent-primary/15 flex items-center justify-center">
          <Icon className="w-6 h-6 text-accent-primary" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-text-primary">{title}</h2>
        <p className="mt-2 text-sm text-text-muted leading-relaxed">{body}</p>
        <div className="mt-5 flex items-center justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-5 bg-accent-primary' : 'w-1.5 bg-white/20'}`} />
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={close} className="flex-1 px-4 py-2 rounded-full bg-white/10 text-text-secondary text-sm hover:bg-white/15">Skip</button>
          <button
            onClick={() => (last ? close() : setStep(step + 1))}
            className="flex-1 px-4 py-2 rounded-full bg-accent-primary text-white text-sm font-semibold hover:bg-accent-primary/90"
          >
            {last ? 'Start editing' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
