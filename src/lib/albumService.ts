// ═══════════════════════════════════════════════════════════════════
// Profile Album Service (web) — one photo album per profile
//
// Mirror of align-app/src/services/albumService.ts. Photos are stored
// in the public `post-media` bucket at `<uid>/album/<ts>.<ext>` and
// listed in profile_album_photos. Reactions/views key on the image URL
// through photoReactionService, like every other bare profile photo.
//
// Schema: align-web/supabase-migration-profile-album.sql
// ═══════════════════════════════════════════════════════════════════

import { createClient } from './supabase';

export interface AlbumPhoto {
  id: string;
  user_id: string;
  image_url: string;
  storage_path: string | null;
  caption: string | null;
  created_at: string;
}

/** Most photos one upload can add at once. */
export const MAX_ALBUM_UPLOAD = 10;
export const MAX_ALBUM_CAPTION = 300;

export async function getAlbumPhotos(userId: string): Promise<AlbumPhoto[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profile_album_photos')
    .select('id, user_id, image_url, storage_path, caption, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) return [];
  return (data || []) as AlbumPhoto[];
}

/**
 * Upload photos to the album. Files are uploaded one by one so a single
 * bad file doesn't sink the batch; returns the rows that were added and
 * the first error message, if any.
 */
export async function addAlbumPhotos(
  userId: string,
  files: File[],
): Promise<{ added: AlbumPhoto[]; error: string | null }> {
  const { validateUpload } = await import('./sanitize');
  const supabase = createClient();
  const added: AlbumPhoto[] = [];
  let firstError: string | null = null;

  const batch = files.slice(0, MAX_ALBUM_UPLOAD);
  for (let i = 0; i < batch.length; i++) {
    const file = batch[i];
    const invalid = validateUpload(file, 'image');
    if (invalid) { firstError ??= invalid; continue; }

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${userId}/album/${Date.now()}-${i}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('post-media')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) { firstError ??= uploadError.message; continue; }

    const imageUrl = supabase.storage.from('post-media').getPublicUrl(path).data.publicUrl;
    const { data, error } = await supabase
      .from('profile_album_photos')
      .insert({ user_id: userId, image_url: imageUrl, storage_path: path })
      .select('id, user_id, image_url, storage_path, caption, created_at')
      .single();
    if (error || !data) {
      firstError ??= error?.message || 'Could not save photo';
      // Row failed (e.g. album full) — don't leave the file orphaned.
      await supabase.storage.from('post-media').remove([path]);
      continue;
    }
    added.push(data as AlbumPhoto);
  }

  return { added, error: firstError };
}

export async function updateAlbumCaption(photoId: string, caption: string): Promise<boolean> {
  const supabase = createClient();
  const clean = caption.trim().slice(0, MAX_ALBUM_CAPTION);
  const { error } = await supabase
    .from('profile_album_photos')
    .update({ caption: clean || null })
    .eq('id', photoId);
  return !error;
}

export async function deleteAlbumPhoto(photo: Pick<AlbumPhoto, 'id' | 'storage_path'>): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('profile_album_photos').delete().eq('id', photo.id);
  if (error) return false;
  // Best effort: the row is the source of truth; storage.remove() fails silently.
  if (photo.storage_path) {
    try { await supabase.storage.from('post-media').remove([photo.storage_path]); } catch { /* */ }
  }
  return true;
}
