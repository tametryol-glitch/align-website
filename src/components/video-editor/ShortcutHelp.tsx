'use client';

/**
 * ShortcutHelp — modal cheat sheet of the editor's keyboard shortcuts.
 * Opened with "?" or the keyboard button in the top bar.
 */

import { X } from 'lucide-react';

interface ShortcutHelpProps {
  onClose: () => void;
}

const GROUPS: { title: string; items: [string, string][] }[] = [
  {
    title: 'Playback',
    items: [
      ['Space', 'Play / pause'],
      ['← / →', 'Previous / next frame'],
      ['Shift + ← / →', 'Jump 1 second'],
      ['Home / End', 'Jump to start / end'],
    ],
  },
  {
    title: 'Editing',
    items: [
      ['S', 'Split at playhead'],
      ['Delete', 'Remove selected clip / text / sticker'],
      ['Ctrl + Z', 'Undo'],
      ['Ctrl + Y', 'Redo'],
    ],
  },
  {
    title: 'Timeline',
    items: [
      ['+ / −', 'Zoom in / out'],
      ['Ctrl + Scroll', 'Zoom at cursor'],
      ['Esc', 'Deselect / close panel'],
      ['?', 'Toggle this cheat sheet'],
    ],
  },
];

export function ShortcutHelp({ onClose }: ShortcutHelpProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-surface-secondary shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <h2 className="text-sm font-semibold text-text-primary">Keyboard shortcuts</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-text-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 p-5">
          {GROUPS.map((group) => (
            <div key={group.title} className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                {group.title}
              </h3>
              <div className="space-y-1.5">
                {group.items.map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-text-secondary">{label}</span>
                    <kbd className="shrink-0 px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10 text-[10px] font-mono text-text-primary">
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
