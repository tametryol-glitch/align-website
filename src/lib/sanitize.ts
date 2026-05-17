export function sanitizeSearchInput(input: string): string {
  return input.replace(/[%_.*()\\,]/g, '');
}

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
]);
const ALLOWED_VIDEO_TYPES = new Set([
  'video/mp4', 'video/webm', 'video/quicktime',
]);
const ALLOWED_AUDIO_TYPES = new Set([
  'audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4',
]);
const ALLOWED_FILE_TYPES = new Set([
  ...Array.from(ALLOWED_IMAGE_TYPES), ...Array.from(ALLOWED_VIDEO_TYPES), ...Array.from(ALLOWED_AUDIO_TYPES),
  'application/pdf',
]);

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;   // 10 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;  // 100 MB
const MAX_FILE_SIZE  = 50 * 1024 * 1024;   // 50 MB

export type UploadCategory = 'image' | 'video' | 'audio' | 'file';

export function validateUpload(file: File | Blob, category: UploadCategory): string | null {
  const mime = file.type.toLowerCase();
  const size = file.size;

  switch (category) {
    case 'image':
      if (!ALLOWED_IMAGE_TYPES.has(mime)) return `Image type "${mime}" not allowed`;
      if (size > MAX_IMAGE_SIZE) return `Image exceeds 10 MB limit`;
      break;
    case 'video':
      if (!ALLOWED_VIDEO_TYPES.has(mime)) return `Video type "${mime}" not allowed`;
      if (size > MAX_VIDEO_SIZE) return `Video exceeds 100 MB limit`;
      break;
    case 'audio':
      if (!ALLOWED_AUDIO_TYPES.has(mime)) return `Audio type "${mime}" not allowed`;
      if (size > MAX_FILE_SIZE) return `Audio exceeds 50 MB limit`;
      break;
    case 'file':
      if (!ALLOWED_FILE_TYPES.has(mime)) return `File type "${mime}" not allowed`;
      if (size > MAX_FILE_SIZE) return `File exceeds 50 MB limit`;
      break;
  }
  return null;
}
