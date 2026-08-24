/**
 * TikTok link preview resolver.
 *
 * TikTok is not like YouTube: the thumbnail is NOT derivable from the URL
 * (YouTube gives us img.youtube.com/vi/<id>/hqdefault.jpg for free), and the
 * "Copy link" button in the TikTok app hands out SHORT links
 * (vm.tiktok.com/ABC123, tiktok.com/t/ABC123) that carry no video ID at all.
 *
 * So a feed post can only render a real preview after two server-side steps:
 *   1. follow the short link's redirect to the canonical /@user/video/<id> URL
 *   2. ask TikTok's public oEmbed endpoint for thumbnail_url / title / author
 *
 * Both are cross-origin and CSP-blocked from the browser (connect-src has no
 * tiktok.com), so they have to happen here. Mobile calls this same route.
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const TIKTOK_HOSTS = new Set([
  'tiktok.com',
  'www.tiktok.com',
  'm.tiktok.com',
  'vm.tiktok.com',
  'vt.tiktok.com',
]);

// Deliberately looser than the client-side detection regexes: some TikTok
// redirects land on a canonical URL with an EMPTY username (`/@/video/<id>`),
// which a `+` quantifier would reject and leave the post with no video ID.
const VIDEO_ID_RE = /tiktok\.com\/@[\w.-]*\/video\/(\d+)/i;

function isTikTokUrl(urlString: string): URL | null {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    if (!TIKTOK_HOSTS.has(parsed.hostname.toLowerCase())) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Short links carry no video ID, so follow the redirect chain to the canonical
 * URL. `redirect: 'follow'` leaves the resolved address in `res.url`.
 */
async function resolveCanonicalUrl(url: string): Promise<string> {
  if (VIDEO_ID_RE.test(url)) return url;
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        // TikTok serves a bot challenge to non-browser agents; the redirect
        // itself still resolves, but a browser UA is far more reliable.
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(6000),
    });
    return res.url || url;
  } catch {
    return url;
  }
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('url');
  if (!raw) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  const withProtocol = raw.startsWith('http') ? raw : `https://${raw}`;
  if (!isTikTokUrl(withProtocol)) {
    return NextResponse.json({ error: 'Not a TikTok URL' }, { status: 400 });
  }

  try {
    const canonical = await resolveCanonicalUrl(withProtocol);
    const videoId = VIDEO_ID_RE.exec(canonical)?.[1] ?? null;

    const oembedRes = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(canonical)}`,
      { signal: AbortSignal.timeout(6000) },
    );

    if (!oembedRes.ok) {
      // Redirect resolution may still have produced a usable video ID even when
      // oEmbed refuses (private / removed / region-locked video).
      return NextResponse.json(
        { videoId, canonicalUrl: canonical, thumbnail: null, title: null, authorName: null },
        { headers: { 'Cache-Control': 'public, max-age=300' } },
      );
    }

    const data: any = await oembedRes.json();

    return NextResponse.json(
      {
        videoId,
        canonicalUrl: canonical,
        thumbnail: data.thumbnail_url ?? null,
        title: data.title ?? null,
        authorName: data.author_name ?? null,
        authorUrl: data.author_url ?? null,
        width: data.thumbnail_width ?? null,
        height: data.thumbnail_height ?? null,
      },
      // oEmbed hands back a SIGNED CDN thumbnail (x-expires / x-signature) that
      // dies roughly a day out, so the cache must expire comfortably before the
      // URL does — otherwise we'd serve a cached response whose poster 403s.
      { headers: { 'Cache-Control': 'public, max-age=21600, stale-while-revalidate=21600' } },
    );
  } catch {
    return NextResponse.json({ error: 'Failed to resolve TikTok link' }, { status: 502 });
  }
}
