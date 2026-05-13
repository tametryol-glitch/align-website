// ═══════════════════════════════════════════════════════════════════
// Chat Media Service — Upload utilities for files, voice notes,
// and video notes to Supabase storage bucket `chat-media`
// ═══════════════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

// ── Helpers ────────────────────────────────────────────────────────

/** Get the current authenticated user's ID. */
function getMyId(): string | null {
  return useAuthStore.getState().user?.id || null;
}

/**
 * Extract file extension from a filename or MIME type.
 */
function getExtension(filename: string, fallback: string = 'bin'): string {
  const parts = filename.split('.');
  if (parts.length > 1) return parts.pop()!.toLowerCase();
  return fallback;
}

// ── Upload Functions ───────────────────────────────────────────────

/**
 * Upload any file to the `chat-media` bucket under `files/{conversationId}/`.
 * Returns the public URL and storage path, or null on error.
 */
export async function uploadChatFile(
  conversationId: string,
  file: File,
): Promise<{ url: string; path: string } | null> {
  try {
    const userId = getMyId();
    if (!userId) {
      console.warn('[ChatMedia] uploadChatFile: not authenticated');
      return null;
    }

    const supabase = createClient();
    const ext = getExtension(file.name);
    const path = `files/${conversationId}/${userId}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('chat-media')
      .upload(path, file);

    if (error) {
      console.warn('[ChatMedia] uploadChatFile upload error:', error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('chat-media')
      .getPublicUrl(path);

    return { url: urlData.publicUrl, path };
  } catch (err: any) {
    console.warn('[ChatMedia] uploadChatFile exception:', err?.message);
    return null;
  }
}

/**
 * Upload an audio blob as a .webm voice note.
 * Returns the public URL, storage path, and duration, or null on error.
 *
 * @param conversationId  - Target conversation
 * @param blob            - Audio Blob (typically from MediaRecorder)
 * @param duration        - Duration in seconds
 */
export async function uploadVoiceNote(
  conversationId: string,
  blob: Blob,
  duration: number,
): Promise<{ url: string; path: string; duration: number } | null> {
  try {
    const userId = getMyId();
    if (!userId) {
      console.warn('[ChatMedia] uploadVoiceNote: not authenticated');
      return null;
    }

    const supabase = createClient();
    const path = `voice_notes/${conversationId}/${userId}-${Date.now()}.webm`;

    const { error } = await supabase.storage
      .from('chat-media')
      .upload(path, blob, {
        contentType: 'audio/webm',
      });

    if (error) {
      console.warn('[ChatMedia] uploadVoiceNote upload error:', error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('chat-media')
      .getPublicUrl(path);

    return { url: urlData.publicUrl, path, duration };
  } catch (err: any) {
    console.warn('[ChatMedia] uploadVoiceNote exception:', err?.message);
    return null;
  }
}

/**
 * Upload a video blob as a .webm video note.
 * Returns the public URL, storage path, and duration, or null on error.
 *
 * @param conversationId  - Target conversation
 * @param blob            - Video Blob (typically from MediaRecorder)
 * @param duration        - Duration in seconds
 */
export async function uploadVideoNote(
  conversationId: string,
  blob: Blob,
  duration: number,
): Promise<{ url: string; path: string; duration: number } | null> {
  try {
    const userId = getMyId();
    if (!userId) {
      console.warn('[ChatMedia] uploadVideoNote: not authenticated');
      return null;
    }

    const supabase = createClient();
    const path = `video_notes/${conversationId}/${userId}-${Date.now()}.webm`;

    const { error } = await supabase.storage
      .from('chat-media')
      .upload(path, blob, {
        contentType: 'video/webm',
      });

    if (error) {
      console.warn('[ChatMedia] uploadVideoNote upload error:', error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('chat-media')
      .getPublicUrl(path);

    return { url: urlData.publicUrl, path, duration };
  } catch (err: any) {
    console.warn('[ChatMedia] uploadVideoNote exception:', err?.message);
    return null;
  }
}

// ── Display Utilities ──────────────────────────────────────────────

/**
 * Format a byte count into a human-readable string.
 * Examples: "1.2 MB", "340 KB", "512 B"
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 0) return '0 B';
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Return an emoji icon based on a filename's extension.
 */
export function getFileIcon(filename: string): string {
  const ext = getExtension(filename).toLowerCase();

  const iconMap: Record<string, string> = {
    // Documents
    pdf: '\u{1F4C4}',
    doc: '\u{1F4C4}',
    docx: '\u{1F4C4}',
    txt: '\u{1F4C4}',
    rtf: '\u{1F4C4}',
    odt: '\u{1F4C4}',
    // Spreadsheets
    xls: '\u{1F4CA}',
    xlsx: '\u{1F4CA}',
    csv: '\u{1F4CA}',
    ods: '\u{1F4CA}',
    // Presentations
    ppt: '\u{1F4CA}',
    pptx: '\u{1F4CA}',
    odp: '\u{1F4CA}',
    // Images
    jpg: '\u{1F5BC}',
    jpeg: '\u{1F5BC}',
    png: '\u{1F5BC}',
    gif: '\u{1F5BC}',
    svg: '\u{1F5BC}',
    webp: '\u{1F5BC}',
    bmp: '\u{1F5BC}',
    // Audio
    mp3: '\u{1F3B5}',
    wav: '\u{1F3B5}',
    ogg: '\u{1F3B5}',
    flac: '\u{1F3B5}',
    aac: '\u{1F3B5}',
    webm: '\u{1F3B5}',
    // Video
    mp4: '\u{1F3AC}',
    mov: '\u{1F3AC}',
    avi: '\u{1F3AC}',
    mkv: '\u{1F3AC}',
    // Archives
    zip: '\u{1F4E6}',
    rar: '\u{1F4E6}',
    '7z': '\u{1F4E6}',
    tar: '\u{1F4E6}',
    gz: '\u{1F4E6}',
    // Code
    js: '\u{1F4BB}',
    ts: '\u{1F4BB}',
    py: '\u{1F4BB}',
    java: '\u{1F4BB}',
    html: '\u{1F4BB}',
    css: '\u{1F4BB}',
    json: '\u{1F4BB}',
    xml: '\u{1F4BB}',
  };

  return iconMap[ext] || '\u{1F4CE}'; // default: paperclip
}
