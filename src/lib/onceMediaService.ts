// ═══════════════════════════════════════════════════════════════════
// One-time view media — photos, voice notes and video notes that can be
// opened exactly once by the recipient. Files live in the PRIVATE
// `chat-once` bucket; the message carries only { once, storage_path }.
// Backend: align-app/supabase-migration-one-time-view.sql
// ═══════════════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { validateUpload } from './sanitize';

const BUCKET = 'chat-once';

export type OnceMediaType = 'image' | 'voice_note' | 'video_note';

/** True for a one-time-view media message (any type that can carry one). */
export function isOnceMessage(msg: { type?: string; metadata?: Record<string, any> | null } | null | undefined): boolean {
  return !!msg && msg.metadata?.once === true &&
    (msg.type === 'image' || msg.type === 'voice_note' || msg.type === 'video_note');
}

/** Whether the recipient has already opened it (stamped by open_once_media). */
export function isOnceOpened(msg: { metadata?: Record<string, any> | null }): boolean {
  return !!msg.metadata?.opened_at;
}

/** Fallback label stored in `content` and used for every preview. */
export function onceLabel(type: string): string {
  if (type === 'voice_note') return '🔒 One-time voice message';
  if (type === 'video_note') return '🔒 One-time video';
  return '🔒 One-time photo';
}

/**
 * Upload to `chat-once/<uid>/<conversationId>/<timestamp>.<ext>`.
 * Returns the storage path (never a URL), or null on error.
 */
export async function uploadOnceMedia(
  conversationId: string,
  file: File | Blob,
  type: OnceMediaType,
): Promise<string | null> {
  try {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return null;

    const category = type === 'image' ? 'image' : type === 'voice_note' ? 'audio' : 'video';
    const vErr = validateUpload(file, category);
    if (vErr) { console.warn('[OnceMedia] upload rejected:', vErr); return null; }

    let ext = type === 'image' ? 'jpg' : 'webm';
    if (file instanceof File && file.name.includes('.')) ext = file.name.split('.').pop()!.toLowerCase();
    const path = `${userId}/${conversationId}/${Date.now()}.${ext}`;

    const { error } = await createClient().storage
      .from(BUCKET)
      .upload(path, file, file.type ? { contentType: file.type } : undefined);
    if (error) {
      console.warn('[OnceMedia] upload error:', error.message);
      return null;
    }
    return path;
  } catch (err: any) {
    console.warn('[OnceMedia] upload exception:', err?.message);
    return null;
  }
}

export type OpenOnceResult =
  | { status: 'ok'; url: string; path: string; type: string; duration: number }
  | { status: 'already_opened' }
  | { status: 'not_allowed' }
  | { status: 'error'; error: string };

/** Records the view, then returns a short-lived signed URL for the file. */
export async function openOnceMedia(messageId: string): Promise<OpenOnceResult> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('open_once_media', { p_message_id: messageId });
    if (error) return { status: 'error', error: error.message };
    const res = data as { status?: string; path?: string; type?: string; duration?: number } | null;
    if (res?.status === 'already_opened') return { status: 'already_opened' };
    if (res?.status !== 'ok' || !res.path) return { status: 'not_allowed' };

    const { data: signed, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(res.path, 300);
    if (signErr || !signed?.signedUrl) {
      return { status: 'error', error: signErr?.message || 'Could not load the media.' };
    }
    return { status: 'ok', url: signed.signedUrl, path: res.path, type: res.type || '', duration: Number(res.duration) || 0 };
  } catch (err: any) {
    return { status: 'error', error: err?.message || 'Network error.' };
  }
}

/** Deletes the file once the viewer is done with it. Best effort. */
export async function removeOnceFile(path: string): Promise<void> {
  try {
    await createClient().storage.from(BUCKET).remove([path]);
  } catch {
    /* best effort — the signed URL expires on its own */
  }
}
