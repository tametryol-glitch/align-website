// User-made stickers (web). Same storage and table as the app
// (align-app/src/services/stickerService.ts): a sticker made here shows up in
// the app and the other way round. Files live in the public `user-stickers`
// bucket so a sticker shows for whoever receives it; the list is private.
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

const BUCKET = 'user-stickers';
const STICKER_SIZE = 512;
export const MAX_STICKERS = 100;
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;

export interface UserSticker {
  id: string;
  url: string;
  storage_path: string;
  created_at: string;
}

export type CreateStickerResult =
  | { ok: true; sticker: UserSticker }
  | { ok: false; error: string };

export async function listMyStickers(): Promise<UserSticker[]> {
  try {
    const { data, error } = await createClient()
      .from('user_stickers')
      .select('id, url, storage_path, created_at')
      .order('created_at', { ascending: false })
      .limit(MAX_STICKERS);
    if (error || !data) return [];
    return data as UserSticker[];
  } catch {
    return [];
  }
}

/** Centre-crop a photo to a square and shrink it to 512px JPEG. */
async function toSquareJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = Math.floor((bitmap.width - side) / 2);
  const sy = Math.floor((bitmap.height - side) / 2);
  const canvas = document.createElement('canvas');
  canvas.width = STICKER_SIZE;
  canvas.height = STICKER_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, STICKER_SIZE, STICKER_SIZE);
  bitmap.close?.();
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/jpeg', 0.9);
  });
}

export async function createStickerFromFile(file: File): Promise<CreateStickerResult> {
  try {
    const myId = useAuthStore.getState().user?.id;
    if (!myId) return { ok: false, error: 'Please sign in again.' };
    if (!file.type.startsWith('image/')) return { ok: false, error: 'Please choose a photo (JPG, PNG or WebP).' };
    if (file.size > MAX_SOURCE_BYTES) return { ok: false, error: 'That photo is too large. Please pick one under 20 MB.' };

    const blob = await toSquareJpeg(file);
    const supabase = createClient();
    const path = `${myId}/${Date.now()}.jpg`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
    if (upErr) return { ok: false, error: 'Upload failed. Please check your connection and try again.' };

    const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    const { data: row, error: insErr } = await supabase
      .from('user_stickers')
      .insert({ url, storage_path: path })
      .select('id, url, storage_path, created_at')
      .single();
    if (insErr || !row) {
      // Over the 100-sticker cap, or the save failed: don't leave the file behind.
      await supabase.storage.from(BUCKET).remove([path]).catch(() => {});
      const full = String(insErr?.message || '').toLowerCase().includes('row-level security');
      return {
        ok: false,
        error: full ? `You can keep up to ${MAX_STICKERS} stickers. Delete one to add more.` : 'Could not save the sticker.',
      };
    }
    return { ok: true, sticker: row as UserSticker };
  } catch {
    return { ok: false, error: 'Something went wrong making the sticker.' };
  }
}

export async function deleteSticker(sticker: UserSticker): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('user_stickers').delete().eq('id', sticker.id);
    if (error) return false;
    await supabase.storage.from(BUCKET).remove([sticker.storage_path]).catch(() => {});
    return true;
  } catch {
    return false;
  }
}
