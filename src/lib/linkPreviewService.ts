// ═══════════════════════════════════════════════════════════════════
// Link Preview Service — URL detection and OpenGraph metadata fetching
// Extracts URLs from text and fetches previews with caching
// ═══════════════════════════════════════════════════════════════════

// ── Types ──────────────────────────────────────────────────────────

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

// ── Cache ──────────────────────────────────────────────────────────

interface CacheEntry {
  preview: LinkPreview | null;
  timestamp: number;
}

/** In-memory cache with 5-minute TTL */
const previewCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Retrieve a cached preview if it exists and hasn't expired.
 */
function getCached(url: string): LinkPreview | null | undefined {
  const entry = previewCache.get(url);
  if (!entry) return undefined; // not cached
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    previewCache.delete(url);
    return undefined; // expired
  }
  return entry.preview; // may be null (failed fetch, also cached)
}

/**
 * Store a preview result in the cache.
 */
function setCache(url: string, preview: LinkPreview | null): void {
  previewCache.set(url, { preview, timestamp: Date.now() });
}

// ── URL Detection ──────────────────────────────────────────────────

/**
 * Regex pattern to detect URLs in plain text.
 * Matches http(s) URLs and common TLD patterns.
 */
const URL_REGEX =
  /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;

/**
 * Extract all URLs found in a text string.
 * @param text - Message text to scan
 * @returns Array of URL strings found
 */
export function extractUrls(text: string): string[] {
  if (!text) return [];
  const matches = text.match(URL_REGEX);
  return matches ? Array.from(new Set(matches)) : [];
}

/**
 * Simple check whether a string looks like a URL.
 * @param text - String to test
 */
export function isUrl(text: string): boolean {
  if (!text) return false;
  return URL_REGEX.test(text.trim());
}

// ── OpenGraph Parsing ──────────────────────────────────────────────

/**
 * Parse OpenGraph and meta tags from raw HTML to build a LinkPreview.
 */
function parseHtmlForPreview(html: string, url: string): LinkPreview {
  const preview: LinkPreview = { url };

  // Helper to extract content from meta tags
  const getMeta = (property: string): string | undefined => {
    // Match both property="..." and name="..." attributes
    const regex = new RegExp(
      `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']` +
      `|<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`,
      'i',
    );
    const match = html.match(regex);
    return match?.[1] || match?.[2] || undefined;
  };

  // OpenGraph tags (preferred)
  preview.title = getMeta('og:title');
  preview.description = getMeta('og:description');
  preview.image = getMeta('og:image');
  preview.siteName = getMeta('og:site_name');

  // Fallback to standard meta tags
  if (!preview.title) {
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    preview.title = titleMatch?.[1]?.trim();
  }
  if (!preview.description) {
    preview.description = getMeta('description');
  }

  // Favicon
  const faviconMatch = html.match(
    /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i,
  );
  if (faviconMatch?.[1]) {
    const faviconHref = faviconMatch[1];
    // Resolve relative URLs
    if (faviconHref.startsWith('http')) {
      preview.favicon = faviconHref;
    } else {
      try {
        const base = new URL(url);
        preview.favicon = new URL(faviconHref, base.origin).href;
      } catch {
        preview.favicon = undefined;
      }
    }
  } else {
    // Default favicon path
    try {
      const base = new URL(url);
      preview.favicon = `${base.origin}/favicon.ico`;
    } catch {
      // ignore
    }
  }

  // Resolve relative image URLs
  if (preview.image && !preview.image.startsWith('http')) {
    try {
      const base = new URL(url);
      preview.image = new URL(preview.image, base.origin).href;
    } catch {
      preview.image = undefined;
    }
  }

  return preview;
}

// ── Fetch Preview ──────────────────────────────────────────────────

/**
 * Fetch OpenGraph metadata for a given URL.
 *
 * Strategy:
 * 1. Try fetching directly (may fail due to CORS)
 * 2. Fall back to the app's own API endpoint for server-side fetching
 *
 * Results are cached for 5 minutes.
 *
 * @param url - The URL to fetch a preview for
 * @returns LinkPreview object or null on failure
 */
export async function fetchLinkPreview(url: string): Promise<LinkPreview | null> {
  // Check cache first
  const cached = getCached(url);
  if (cached !== undefined) return cached;

  try {
    // Strategy 1: Direct fetch
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'text/html' },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const html = await response.text();
        const preview = parseHtmlForPreview(html, url);
        if (preview.title || preview.description || preview.image) {
          setCache(url, preview);
          return preview;
        }
      }
    } catch {
      // Direct fetch failed (likely CORS), fall through to API endpoint
    }

    // Strategy 2: Via backend API proxy
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      try {
        const proxyUrl = `${apiUrl}/link-preview?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl, {
          signal: AbortSignal.timeout(8000),
        });

        if (response.ok) {
          const data = await response.json();
          const preview: LinkPreview = {
            url,
            title: data.title || undefined,
            description: data.description || undefined,
            image: data.image || undefined,
            siteName: data.site_name || data.siteName || undefined,
            favicon: data.favicon || undefined,
          };
          setCache(url, preview);
          return preview;
        }
      } catch {
        // API proxy also failed
      }
    }

    // Both strategies failed
    setCache(url, null);
    return null;
  } catch (err: any) {
    console.warn('[LinkPreview] fetchLinkPreview failed:', err?.message);
    setCache(url, null);
    return null;
  }
}
