/**
 * Video downloads — saves a reel or feed video post with the Align outro
 * appended.
 *
 * The copy stored in the app has no outro; the branded variant is built on
 * demand by the render service and cached server-side, so the first download
 * of a given video takes a few seconds and every later one is instant.
 *
 * If the variant can't be built the original file is downloaded instead — a
 * download never hard-fails because the render service is having a bad day.
 */
import { createClient } from './supabase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://align-api-v2-production.up.railway.app/api/v1';

export type ShareVariantKind = 'reel' | 'post';

export interface DownloadResult {
  saved: boolean;
  /** False when we fell back to the unbranded original. */
  branded: boolean;
  error?: string;
}

/** Poll budget for a cold variant: the POST already waited ~25s. */
const POLL_ATTEMPTS = 12;
const POLL_INTERVAL_MS = 5000;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function authToken(): Promise<string | null> {
  const { data } = await createClient().auth.getSession();
  return data.session?.access_token || null;
}

interface VariantResponse {
  status: 'ready' | 'processing' | 'failed';
  url?: string | null;
  fallback_url?: string | null;
}

/**
 * Resolve the URL to actually download: the branded variant when we can get
 * one, otherwise the original.
 */
async function resolveDownloadUrl(
  kind: ShareVariantKind,
  id: string,
  onProgress?: (message: string) => void,
): Promise<{ url: string | null; branded: boolean; error?: string }> {
  const token = await authToken();
  if (!token) return { url: null, branded: false, error: 'Please sign in to download videos.' };

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  let fallback: string | null = null;

  try {
    const res = await fetch(`${API_BASE}/videos/share-variant`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ kind, id }),
    });

    if (res.status === 403) {
      return { url: null, branded: false, error: 'The creator has turned off downloads for this video.' };
    }

    if (res.ok) {
      const first = (await res.json()) as VariantResponse;
      fallback = first.fallback_url || null;

      if (first.status === 'ready' && first.url) return { url: first.url, branded: true };

      if (first.status === 'processing') {
        onProgress?.('Preparing your video…');
        for (let i = 0; i < POLL_ATTEMPTS; i++) {
          await wait(POLL_INTERVAL_MS);
          const pollRes = await fetch(`${API_BASE}/videos/share-variant/${kind}/${id}`, { headers });
          if (!pollRes.ok) break;
          const next = (await pollRes.json()) as VariantResponse;
          if (next.fallback_url) fallback = next.fallback_url;
          if (next.status === 'ready' && next.url) return { url: next.url, branded: true };
          if (next.status === 'failed') break;
        }
      }
    }
  } catch (err) {
    console.warn('[VideoDownload] variant request failed:', err);
  }

  return { url: fallback, branded: false };
}

/**
 * Download a reel/post video to the visitor's device.
 *
 * `originalUrl` is used only if the API never returned a fallback, so the
 * button still works when the API is unreachable.
 */
export async function downloadVideo(
  kind: ShareVariantKind,
  id: string,
  originalUrl?: string,
  onProgress?: (message: string) => void,
): Promise<DownloadResult> {
  const resolved = await resolveDownloadUrl(kind, id, onProgress);
  if (resolved.error) return { saved: false, branded: false, error: resolved.error };

  const url = resolved.url || originalUrl;
  if (!url) return { saved: false, branded: false, error: 'Could not find the video file' };

  onProgress?.('Saving…');

  try {
    // Fetched as a blob rather than linked directly: the storage URL is
    // cross-origin, and a plain <a download> there would navigate instead of
    // saving.
    const res = await fetch(url);
    if (!res.ok) return { saved: false, branded: false, error: 'Download failed' };

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = `align-${kind}-${id}.mp4`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoke on the next tick — immediate revocation cancels the download in
    // some browsers.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);

    return { saved: true, branded: resolved.branded };
  } catch (err: any) {
    return { saved: false, branded: false, error: err?.message || 'Download failed' };
  }
}
