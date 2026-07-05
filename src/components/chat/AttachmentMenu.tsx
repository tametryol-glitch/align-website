'use client';

import { useEffect, useRef } from 'react';
import { Plus, File, BarChart3 } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

interface AttachmentMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectFile: () => void;
  onSelectLocation: () => void;
  onSelectPoll: () => void;
}

// ── Menu items config ──────────────────────────────────────────────

// NOTE: 'location' (share current GPS) intentionally removed for privacy — Align does
// not capture or share a user's exact device location. Dormant LocationPicker/onSelectLocation
// wiring is now unreachable and can be fully deleted in a later cleanup.
const MENU_ITEMS = [
  { key: 'file', label: 'File', icon: File, action: 'onSelectFile' as const },
  { key: 'poll', label: 'Poll', icon: BarChart3, action: 'onSelectPoll' as const },
];

// ── Component ──────────────────────────────────────────────────────

export function AttachmentMenu({
  isOpen,
  onToggle,
  onSelectFile,
  onSelectLocation,
  onSelectPoll,
}: AttachmentMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  const actions: Record<string, () => void> = {
    onSelectFile,
    onSelectLocation,
    onSelectPoll,
  };

  // ── Click outside to close ──

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onToggle();
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  function handleItemClick(actionKey: string) {
    actions[actionKey]?.();
    onToggle();
  }

  return (
    <div ref={panelRef} className="relative">
      {/* Toggle button */}
      <button
        type="button"
        onClick={onToggle}
        className="p-2 text-text-muted hover:text-text-primary transition-all"
        title={isOpen ? 'Close menu' : 'Attach'}
      >
        <Plus
          className={`w-5 h-5 transition-transform duration-200 ${
            isOpen ? 'rotate-45' : ''
          }`}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="absolute bottom-full left-0 mb-2 z-40 min-w-[180px]
            bg-bg-card border border-border-primary rounded-xl shadow-2xl py-1.5
            animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-150
            origin-bottom-left"
        >
          {MENU_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => handleItemClick(item.action)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary
                  hover:bg-bg-tertiary rounded-lg mx-0 transition-colors"
              >
                <Icon className="w-4 h-4 text-accent-primary" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
