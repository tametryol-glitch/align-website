'use client';

// Wallpaper picker for ONE conversation. Shared: the other person sees changes live.

import { useRef, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { getVisibleChatThemes, type ChatTheme } from '@/data/chatThemes';
import { uploadWallpaper } from '@/lib/conversationThemeService';

interface Props {
  conversationId: string;
  current: ChatTheme | null;
  apply: (themeId: string, customUrl?: string | null, dim?: number) => Promise<{ ok: boolean; error?: string }>;
  onClose: () => void;
}

const DIMS = [
  { label: 'Bright', value: 8 },
  { label: 'Soft', value: 25 },
  { label: 'Dark', value: 50 },
];

export function ChatWallpaperPicker({ conversationId, current, apply, onClose }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const activeId = current?.id || 'default';

  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await fn();
    setBusy(false);
    if (!res.ok) setError(res.error || 'Could not change the wallpaper.');
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    const up = await uploadWallpaper(conversationId, file);
    if (up.url) {
      const res = await apply('custom', up.url, current?.dim ?? 25);
      if (!res.ok) setError(res.error || 'Could not change the wallpaper.');
    } else {
      setError(up.error || 'Upload failed.');
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg max-h-[85vh] overflow-y-auto bg-bg-primary border border-border-primary rounded-t-2xl sm:rounded-2xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-text-primary">Chat wallpaper</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-text-muted mb-3">Shared with everyone in this chat. Changes show up for them instantly.</p>
        {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

        <div className={`grid grid-cols-3 gap-3 ${busy ? 'opacity-60 pointer-events-none' : ''}`}>
          <button
            onClick={() => fileRef.current?.click()}
            className={`rounded-xl p-1 border-2 text-center ${activeId === 'custom' ? 'border-accent-primary' : 'border-transparent'}`}
          >
            {current?.id === 'custom' && current.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={current.imageUrl} alt="" className="h-28 w-full rounded-lg object-cover" />
            ) : (
              <div className="h-28 w-full rounded-lg bg-bg-secondary flex items-center justify-center text-accent-primary">
                <Plus className="w-8 h-8" />
              </div>
            )}
            <span className="block text-xs mt-1 text-text-secondary">Your photo</span>
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} />

          {getVisibleChatThemes().map((theme) => (
            <button
              key={theme.id}
              onClick={() => run(() => apply(theme.id))}
              className={`rounded-xl p-1 border-2 text-center ${activeId === theme.id ? 'border-accent-primary' : 'border-transparent'}`}
            >
              <div
                className="h-28 w-full rounded-lg flex flex-col justify-end gap-1 p-1.5 overflow-hidden"
                style={theme.id === 'default'
                  ? { background: theme.thumbnail }
                  : { background: `linear-gradient(135deg, ${theme.background.join(', ')})` }}
              >
                <span
                  className="self-start text-[10px] px-2 py-0.5 rounded-lg rounded-bl-sm"
                  style={{ backgroundColor: theme.id === 'default' ? '#252D42' : theme.otherBubble, color: theme.id === 'default' ? '#9CA3AF' : theme.otherText }}
                >
                  Hi
                </span>
                <span
                  className="self-end text-[10px] px-2 py-0.5 rounded-lg rounded-br-sm text-white"
                  style={{ background: `linear-gradient(135deg, ${theme.ownBubble[0]}, ${theme.ownBubble[1]})` }}
                >
                  Hey
                </span>
              </div>
              <span className="block text-xs mt-1 text-text-secondary">{theme.label}</span>
            </button>
          ))}
        </div>

        {current?.id === 'custom' && current.imageUrl && (
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-text-muted flex-1">Photo brightness</span>
            {DIMS.map((d) => (
              <button
                key={d.value}
                onClick={() => run(() => apply('custom', current.imageUrl!, d.value))}
                className={`text-xs px-3 py-1.5 rounded-full ${(current.dim ?? 25) === d.value ? 'bg-accent-primary text-white' : 'bg-bg-secondary text-text-secondary'}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
