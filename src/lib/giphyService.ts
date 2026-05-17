// ═══════════════════════════════════════════════════════════════════
// Giphy Service — REST API integration for GIFs and stickers
// Search, trending endpoints with pagination support
// ═══════════════════════════════════════════════════════════════════

const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || '';
const GIPHY_BASE_URL = 'https://api.giphy.com/v1';
const DEFAULT_LIMIT = 25;
const DEFAULT_RATING = 'pg-13';

// ── Types ──────────────────────────────────────────────────────────

export interface GiphyImage {
  url: string;
  width?: string;
  height?: string;
}

export interface GiphyItem {
  id: string;
  title: string;
  images: {
    fixed_height: GiphyImage;
    preview_gif: GiphyImage;
    original: GiphyImage;
  };
}

export interface GiphyPagination {
  total_count: number;
  count: number;
  offset: number;
}

export interface GiphyResponse {
  data: GiphyItem[];
  pagination: GiphyPagination;
}

// ── Internal fetch helper ──────────────────────────────────────────

/**
 * Build a Giphy API URL with common query params and fetch the results.
 */
async function giphyFetch(
  endpoint: string,
  params: Record<string, string | number>,
): Promise<GiphyResponse> {
  try {
    const searchParams = new URLSearchParams({
      api_key: GIPHY_API_KEY,
      rating: DEFAULT_RATING,
      ...Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v)]),
      ),
    });

    const url = `${GIPHY_BASE_URL}${endpoint}?${searchParams.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`[Giphy] API error: ${response.status} ${response.statusText}`);
      return { data: [], pagination: { total_count: 0, count: 0, offset: 0 } };
    }

    const json = await response.json();

    const data: GiphyItem[] = (json.data || []).map((item: any) => ({
      id: item.id,
      title: item.title || '',
      images: {
        fixed_height: {
          url: item.images?.fixed_height?.url || '',
          width: item.images?.fixed_height?.width,
          height: item.images?.fixed_height?.height,
        },
        preview_gif: {
          url: item.images?.preview_gif?.url || '',
        },
        original: {
          url: item.images?.original?.url || '',
          width: item.images?.original?.width,
          height: item.images?.original?.height,
        },
      },
    }));

    const pagination: GiphyPagination = {
      total_count: json.pagination?.total_count ?? 0,
      count: json.pagination?.count ?? 0,
      offset: json.pagination?.offset ?? 0,
    };

    return { data, pagination };
  } catch (err: any) {
    console.warn('[Giphy] Fetch failed:', err?.message);
    return { data: [], pagination: { total_count: 0, count: 0, offset: 0 } };
  }
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Search for GIFs by query string.
 * @param query   - Search term
 * @param offset  - Pagination offset (default 0)
 * @param limit   - Results per page (default 25)
 */
export async function searchGifs(
  query: string,
  offset: number = 0,
  limit: number = DEFAULT_LIMIT,
): Promise<GiphyResponse> {
  return giphyFetch('/gifs/search', { q: query, offset, limit });
}

/**
 * Search for stickers by query string.
 * @param query   - Search term
 * @param offset  - Pagination offset (default 0)
 * @param limit   - Results per page (default 25)
 */
export async function searchStickers(
  query: string,
  offset: number = 0,
  limit: number = DEFAULT_LIMIT,
): Promise<GiphyResponse> {
  return giphyFetch('/stickers/search', { q: query, offset, limit });
}

/**
 * Get trending GIFs.
 * @param offset  - Pagination offset (default 0)
 * @param limit   - Results per page (default 25)
 */
export async function getTrendingGifs(
  offset: number = 0,
  limit: number = DEFAULT_LIMIT,
): Promise<GiphyResponse> {
  return giphyFetch('/gifs/trending', { offset, limit });
}

/**
 * Get trending stickers.
 * @param offset  - Pagination offset (default 0)
 * @param limit   - Results per page (default 25)
 */
export async function getTrendingStickers(
  offset: number = 0,
  limit: number = DEFAULT_LIMIT,
): Promise<GiphyResponse> {
  return giphyFetch('/stickers/trending', { offset, limit });
}
