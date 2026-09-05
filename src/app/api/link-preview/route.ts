/**
 * Generic link unfurl — the catch-all behind the feed's link cards.
 *
 * YouTube, TikTok, Instagram and Facebook links get real players from their own
 * resolvers. Everything else (an article, a Spotify track, a Reddit thread, a
 * personal site) used to render as bare blue text. This route reads the page's
 * OpenGraph tags so those become a card too: image, title, description, domain.
 *
 * The browser can't do this itself — connect-src doesn't allow arbitrary hosts,
 * and most sites send no CORS headers. Fetching arbitrary user-supplied URLs
 * from the server is the classic SSRF shape, so the guards below are the point
 * of the file as much as the parsing is: https/http only, no credentials in the
 * URL, no private or loopback hosts, no odd ports, and every redirect hop is
 * re-checked rather than trusted to `redirect: 'follow'`.
 */

import { NextRequest, NextResponse } from 'next/server';
import { readMeta, readTitleTag, decodeEntities, BROWSER_UA, CRAWLER_UA } from '@/lib/openGraph';

export const runtime = 'edge';

const MAX_REDIRECTS = 4;
// og tags live in <head>; no need to pull a whole article body across the wire.
const MAX_HTML_BYTES = 512 * 1024;

const BLOCKED_HOST_SUFFIXES = ['.local', '.internal', '.localhost', '.home.arpa'];

/**
 * Reject anything that could point back inside the network. Edge runtime gives
 * no DNS resolution, so a hostname that resolves to a private address can't be
 * caught here — this blocks the literal and well-known forms, and the fetch
 * itself runs from an edge worker with nothing private to reach.
 */
function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === 'localhost' || host === 'metadata.google.internal') return true;
  if (BLOCKED_HOST_SUFFIXES.some((s) => host.endsWith(s))) return true;

  // IPv6 literal (or anything else with a colon) — block outright.
  if (host.includes(':') || host.startsWith('[')) return true;

  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;              // link-local / cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a >= 224) return true;                            // multicast / reserved
  }
  return false;
}

function validate(urlString: string): URL | null {
  try {
    const url = new URL(urlString);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    // Credentials in the URL are only ever there to confuse a fetcher.
    if (url.username || url.password) return null;
    if (url.port && url.port !== '80' && url.port !== '443') return null;
    if (isBlockedHost(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

/**
 * Follow redirects by hand so every hop is validated. `redirect: 'follow'`
 * would happily land on a blocked host after a public first hop.
 */
async function fetchFollowing(start: URL, userAgent: string): Promise<{ res: Response; url: URL } | null> {
  let current = start;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await fetch(current.toString(), {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'User-Agent': userAgent,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    });

    const location = res.status >= 300 && res.status < 400 ? res.headers.get('location') : null;
    if (!location) return { res, url: current };

    const next = validate(new URL(location, current).toString());
    if (!next) return null;
    current = next;
  }
  return null;
}

/** Read at most MAX_HTML_BYTES of the body — enough for <head>, never a whole page. */
async function readHead(res: Response): Promise<string> {
  const type = res.headers.get('content-type') || '';
  if (type && !type.includes('html') && !type.includes('xml')) return '';

  const reader = res.body?.getReader();
  if (!reader) return '';

  const decoder = new TextDecoder('utf-8', { fatal: false });
  let html = '';
  let bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      html += decoder.decode(value, { stream: true });
      if (bytes >= MAX_HTML_BYTES || /<\/head>/i.test(html)) break;
    }
  } finally {
    reader.cancel().catch(() => {});
  }
  return html;
}

/** og:image is often a site-root-relative path; resolve it against the page. */
function absolutize(value: string | null, base: URL): string | null {
  if (!value) return null;
  try {
    const resolved = new URL(decodeEntities(value), base);
    if (resolved.protocol !== 'https:' && resolved.protocol !== 'http:') return null;
    return resolved.toString();
  } catch {
    return null;
  }
}

function tidy(value: string | null, max: number): string | null {
  if (!value) return null;
  const collapsed = value.replace(/\s+/g, ' ').trim();
  if (!collapsed) return null;
  return collapsed.length > max ? `${collapsed.slice(0, max - 1).trimEnd()}…` : collapsed;
}

/** One fetch attempt as a given agent, reduced to the head HTML we care about. */
async function attemptFetch(target: URL, userAgent: string): Promise<{ html: string; url: URL } | null> {
  const fetched = await fetchFollowing(target, userAgent);
  if (!fetched || !fetched.res.ok) return null;
  return { html: await readHead(fetched.res), url: fetched.url };
}

/** Did this response carry the tags a card is actually built from? */
function hasUsableTags(html: string): boolean {
  return !!(readMeta(html, 'og:title') || readMeta(html, 'og:image') || readMeta(html, 'og:description'));
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('url');
  if (!raw) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // A bare "example.com/x" is fine to assume https for; anything carrying its
  // own non-http scheme ("ftp://…", "file://…") is rejected rather than glued
  // onto an https:// prefix, which would smuggle it past the scheme check.
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw);
  const target = validate(hasScheme ? raw : `https://${raw}`);
  if (!target) {
    return NextResponse.json({ error: 'Unsupported URL' }, { status: 400 });
  }

  const domain = target.hostname.replace(/^www\./i, '');

  // Even a page that refuses us still gets a card: the domain alone beats
  // leaving a bare URL in the post, which is the whole point of the feature.
  const bare = {
    url: target.toString(),
    canonicalUrl: target.toString(),
    domain,
    siteName: null,
    title: null,
    description: null,
    image: null,
  };

  try {
    // Neither user agent wins outright, so try the crawler and keep the browser
    // in reserve. Sites that render client-side (Spotify, Reddit) serve a real
    // og block to an unfurler and only an empty app shell to a browser; a few
    // others (Wikipedia) answer the crawler with a flat 403. Falling back on
    // "no usable og tags", not just on a failed request, catches both.
    let attempt = await attemptFetch(target, CRAWLER_UA);
    if (!attempt || !hasUsableTags(attempt.html)) {
      const browser = await attemptFetch(target, BROWSER_UA);
      if (browser && (hasUsableTags(browser.html) || !attempt)) attempt = browser;
    }
    if (!attempt) {
      return NextResponse.json(bare, { headers: { 'Cache-Control': 'public, max-age=1800' } });
    }

    const { html, url: finalUrl } = attempt;

    return NextResponse.json(
      {
        url: target.toString(),
        canonicalUrl: absolutize(readMeta(html, 'og:url'), finalUrl) || finalUrl.toString(),
        domain: finalUrl.hostname.replace(/^www\./i, ''),
        siteName: tidy(readMeta(html, 'og:site_name'), 60),
        title: tidy(
          readMeta(html, 'og:title') || readMeta(html, 'twitter:title') || readTitleTag(html),
          140,
        ),
        description: tidy(
          readMeta(html, 'og:description') ||
            readMeta(html, 'twitter:description') ||
            readMeta(html, 'description'),
          220,
        ),
        image: absolutize(readMeta(html, 'og:image') || readMeta(html, 'twitter:image'), finalUrl),
      },
      { headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400' } },
    );
  } catch {
    return NextResponse.json(bare, { headers: { 'Cache-Control': 'public, max-age=600' } });
  }
}
