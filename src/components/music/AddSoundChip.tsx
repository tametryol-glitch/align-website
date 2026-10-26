'use client';

// "Add sound" chip for video composers: shows the chosen song (× to remove)
// and opens the shared MusicPicker. TikTok-style: pick before you record.

import { useState } from 'react';
import { Music2, X } from 'lucide-react';
import { MusicPicker } from '@/components/music/MusicPicker';
import type { AttachedMusic } from '@/lib/postMusic';

export function AddSoundChip({ value, onChange, disabled }: {
  value: AttachedMusic | null;
  onChange: (m: AttachedMusic | null) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={disabled}
          className="flex items-center gap-2 max-w-full px-4 py-2 rounded-full bg-white/10 text-text-primary text-sm font-semibold hover:bg-white/15 transition-colors disabled:opacity-50"
        >
          <Music2 className="w-4 h-4 shrink-0" />
          <span className="truncate">{value ? value.title : 'Add sound'}</span>
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled}
            aria-label="Remove sound"
            className="p-2 rounded-full bg-white/10 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {open && <MusicPicker value={value} onChange={onChange} onClose={() => setOpen(false)} />}
    </>
  );
}
