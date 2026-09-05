/**
 * OpenGraph scraping helpers shared by the link-preview API routes.
 *
 * Both /api/meta-preview (Instagram / Facebook) and /api/link-preview (every
 * other site) read the same `<meta property="og:…">` tags out of raw HTML, so
 * the parsing lives here rather than being written twice.
 */

/** Minimal entity decode — og content arrives HTML-escaped (`&amp;` in every CDN URL). */
export function decodeEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Pull one <meta property="og:x"> / <meta name="twitter:x"> value out of raw HTML. */
export function readMeta(html: string, key: string): string | null {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["']`, 'i'),
  ];
  for (const re of patterns) {
    const match = re.exec(html);
    if (match?.[1]) return decodeEntities(match[1]).trim();
  }
  return null;
}

/** The first <title> in the document, for sites with no og:title. */
export function readTitleTag(html: string): string | null {
  const match = /<title[^>]*>([\s\S]{0,300}?)<\/title>/i.exec(html);
  return match?.[1] ? decodeEntities(match[1]).replace(/\s+/g, ' ').trim() || null : null;
}

/**
 * Meta's own unfurler agent. Instagram strips og tags for anything that looks
 * like a browser, and it is the agent most other sites are happiest to serve
 * OpenGraph to, so it is the default for every preview fetch.
 */
export const CRAWLER_UA = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';

/**
 * Not every site welcomes a crawler: Wikipedia, for one, answers
 * facebookexternalhit with a flat 403. Sites like that serve their og tags
 * happily to an ordinary browser, so the generic unfurl tries this first and
 * falls back to CRAWLER_UA for the sites that only answer a crawler.
 */
export const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
