'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import {
  createStickerFromFile, deleteSticker, listMyStickers, MAX_STICKERS,
  type UserSticker,
} from '@/lib/stickerService';

interface Props {
  /** Called with the sticker's public URL when one is chosen. */
  onPick: (url: string) => void;
}

export function MyStickers({ onPick }: Props) {
  const [stickers, setStickers] = useState<UserSticker[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    listMyStickers().then((list) => { if (alive) setStickers(list); });
    return () => { alive = false; };
  }, []);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // lets the same photo be chosen again
    if (!file) return;
    setError('');
    setCreating(true);
    const r = await createStickerFromFile(file);
    setCreating(false);
    if (r.ok) setStickers((prev) => [r.sticker, ...(prev || [])]);
    else setError(r.error);
  }

  async function handleDelete(s: UserSticker) {
    if (!window.confirm('Delete this sticker? Messages you already sent with it may stop showing it.')) return;
    const ok = await deleteSticker(s);
    if (ok) setStickers((prev) => (prev || []).filter((x) => x.id !== s.id));
    else setError('Could not delete it. Please try again.');
  }

  if (stickers === null) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
      </div>
    );
  }

  const full = stickers.length >= MAX_STICKERS;

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          disabled={creating || full}
          onClick={() => fileRef.current?.click()}
          className="aspect-square rounded-lg border border-dashed border-accent-primary/60 text-accent-primary flex flex-col items-center justify-center gap-1 hover:bg-accent-primary/10 disabled:opacity-50"
          title={full ? `You can keep up to ${MAX_STICKERS} stickers` : 'Make a sticker from a photo'}
        >
          {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-6 h-6" />}
          <span className="text-[10px] text-text-secondary">{creating ? 'Saving…' : 'Make a sticker'}</span>
        </button>

        {stickers.map((s) => (
          <div key={s.id} className="relative group aspect-square rounded-lg overflow-hidden bg-bg-tertiary">
            <button
              type="button"
              onClick={() => onPick(s.url)}
              className="w-full h-full hover:ring-2 hover:ring-accent-primary rounded-lg transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.url} alt="Sticker" loading="lazy" className="w-full h-full object-cover" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(s)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white hidden group-hover:flex items-center justify-center"
              title="Delete sticker"
              aria-label="Delete sticker"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      <p className="text-[11px] text-text-muted text-center mt-3 mb-1">
        {stickers.length === 0
          ? 'Click + to turn a photo into your own sticker.'
          : 'Click a sticker to send it. Hover and click × to delete.'}
      </p>
    </div>
  );
}
