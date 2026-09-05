/**
 * Instagram / Facebook link preview resolver.
 *
 * Same job as /api/tiktok-oembed, different obstacles. Meta killed the token-free
 * oEmbed endpoints in 2020 — api.instagram.com/oembed and graph.facebook.com's
 * oembed_post now demand an app access token plus App Review — so the only
 * unauthenticated source of a poster frame is the OpenGraph metadata on the post
 * page itself. Two quirks make that a server-only job:
 *
 *   1. Instagram serves a logged-out wall (og tags stripped entirely) to browser
 *      user agents. It only emits og:image for a CRAWLER agent, so we ask as
 *      facebookexternalhit — the same agent Meta's own unfurler uses.
 *   2. Both hosts are cross-origin and CSP-blocked from the browser, and short
 *      links (fb.watch/x, instagram.com/share/…) carry no post ID at all.
 *
 * Playback is separate and needs no token: Instagram's /embed/ page and
 * Facebook's plugins/video.php still render publicly, so the embedUrl we hand
 * back can be dropped straight into an iframe / WebView.
 */

import { NextRequest, NextResponse } from 'next/server';
import { readMeta, CRAWLER_UA } from '@/lib/openGraph';

export const runtime = 'edge';

const INSTAGRAM_HOSTS = new Set([
  'instagram.com',
  'www.instagram.com',
  'm.instagram.com',
  'instagr.am',
  'www.instagr.am',
  'ddinstagram.com',
]);

const FACEBOOK_HOSTS = new Set([
  'facebook.com',
  'www.facebook.com',
  'm.facebook.com',
  'web.facebook.com',
  'mbasic.facebook.com',
  'fb.watch',
  'fb.com',
  'www.fb.com',
]);

// Instagram post / reel / IGTV shortcode. `reels` (plural) is what the app's own
// share sheet produces for some reels, so it has to be accepted too.
const IG_SHORTCODE_RE = /instagram\.com\/(?:[\w.]+\/)?(?:p|reel|reels|tv)\/([\w-]+)/i;

// Facebook numeric post/video id across every shape the share sheet emits:
// /videos/<id>, /videos/<slug>/<id>, /reel/<id>, /watch/?v=<id>, /posts/<id>.
const FB_VIDEO_ID_RE = /facebook\.com\/(?:reel\/(\d+)|watch\/?\?v=(\d+)|[^/]+\/videos\/(?:[^/]+\/)?(\d+)|video\.php\?v=(\d+))/i;


type Platform = 'instagram' | 'facebook';

function classify(urlString: string): { url: URL; platform: Platform } | null {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    const host = parsed.hostname.toLowerCase();
    if (INSTAGRAM_HOSTS.has(host)) return { url: parsed, platform: 'instagram' };
    if (FACEBOOK_HOSTS.has(host)) return { url: parsed, platform: 'facebook' };
    return null;
  } catch {
    return null;
  }
}

/**
 * Facebook wraps the caption in furniture:
 *   "18M views · 457K reactions | <the actual caption> | NASA - National …"
 * The counts go stale the moment we cache them and the page name is already the
 * card's author line, so trim both ends and keep the caption. og:description
 * holds the same caption but truncated with an ellipsis, so it's only a fallback.
 */
function cleanFacebookTitle(title: string | null, authorName: string | null): string | null {
  if (!title) return null;
  let parts = title.split(' | ');
  if (parts.length > 1 && (/\b(views?|reactions?|likes?|comments?|shares?)\b/i.test(parts[0]) || parts[0].includes('·'))) {
    parts = parts.slice(1);
  }
  if (parts.length > 1 && authorName) {
    const last = parts[parts.length - 1].trim().toLowerCase();
    if (last.startsWith(authorName.trim().toLowerCase())) parts = parts.slice(0, -1);
  }
  return parts.join(' | ').trim() || null;
}

/**
 * Instagram's og:description is engagement boilerplate wrapped around the real
 * caption: `238K likes, 1,003 comments - nasa on July 14, 2026: "<caption>"`.
 * The counts go stale the moment we cache them, so keep only the caption.
 */
function cleanInstagramCaption(description: string | null): string | null {
  if (!description) return null;
  // The description is truncated mid-caption, so the closing quote is often
  // missing — strip the prefix and any quote that did survive, separately.
  const caption = description
    .replace(/^[\d.,KMB]+\s+(?:likes?|comments?)[^:]*:\s*/i, '')
    .replace(/^"/, '')
    .replace(/"$/, '')
    .trim();
  return caption || null;
}

// Path segments that are Facebook's own routing, not a page/profile name.
const FB_RESERVED_SEGMENTS = new Set([
  'watch', 'reel', 'reels', 'video.php', 'share', 'plugins', 'permalink.php',
  'story.php', 'photo.php', 'groups', 'events', 'marketplace', 'profile.php', 'people',
]);

/**
 * The canonical URL Facebook reports for a video is always `/reel/<id>`, which
 * has lost the page name — so read the author off the URL the user actually
 * pasted (`facebook.com/NASA/videos/…`).
 */
function facebookAuthorFromUrl(urlString: string): string | null {
  try {
    const first = new URL(urlString).pathname.split('/').filter(Boolean)[0];
    if (!first || FB_RESERVED_SEGMENTS.has(first.toLowerCase()) || /^\d+$/.test(first)) return null;
    return first;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('url');
  if (!raw) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  const withProtocol = raw.startsWith('http') ? raw : `https://${raw}`;
  const classified = classify(withProtocol);
  if (!classified) {
    return NextResponse.json({ error: 'Not an Instagram or Facebook URL' }, { status: 400 });
  }
  const { platform } = classified;

  try {
    const res = await fetch(withProtocol, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': CRAWLER_UA,
        // Without this Meta localises by edge POP, and a US post comes back with
        // a Spanish title for anyone resolved through a LATAM datacenter.
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    });

    const html = res.ok ? await res.text() : '';
    // Short links carry no id; `res.url` is where the redirect chain landed.
    const canonical = readMeta(html, 'og:url') || res.url || withProtocol;

    const thumbnail = readMeta(html, 'og:image') || readMeta(html, 'twitter:image');
    const description = readMeta(html, 'og:description') || readMeta(html, 'description');

    let postId: string | null = null;
    let embedUrl: string | null = null;
    let title: string | null = null;
    let authorName: string | null = null;

    if (platform === 'instagram') {
      postId =
        IG_SHORTCODE_RE.exec(canonical)?.[1] ?? IG_SHORTCODE_RE.exec(withProtocol)?.[1] ?? null;
      // /embed/ is the public, token-free embed and plays video in place; /p/
      // works for reels and IGTV too. The /embed/captioned/ variant is passed
      // over deliberately — its height grows with the caption, which a fixed
      // feed card can only crop, and the caption is already on the poster card.
      // A shortcode that produced no poster is deleted or private, and its embed
      // page would just say so — gate on the thumbnail and link out instead.
      if (postId && thumbnail) embedUrl = `https://www.instagram.com/p/${postId}/embed/`;
      // Instagram's og:title is the account boilerplate ("NASA (@nasa) • Instagram
      // photos and videos"), so the caption lives in og:description instead.
      title = cleanInstagramCaption(description);
      authorName =
        /instagram\.com\/([\w.]+)\/(?:p|reel|reels|tv)\//i.exec(canonical)?.[1] ??
        /@([\w.]+)\)/.exec(readMeta(html, 'og:title') || readMeta(html, 'twitter:title') || '')?.[1] ??
        null;
    } else {
      const m = FB_VIDEO_ID_RE.exec(canonical) ?? FB_VIDEO_ID_RE.exec(withProtocol);
      postId = m ? (m[1] ?? m[2] ?? m[3] ?? m[4] ?? null) : null;
      const isVideo = (readMeta(html, 'og:type') || '').startsWith('video');
      // Both plugins are public and need no app token. video.php gives an
      // in-place player; post.php renders a photo/status card. Offer neither
      // when the page gave up nothing at all — a friends-only or deleted post
      // renders as a plugin error, and a link-out card beats that.
      if (postId || isVideo || thumbnail) {
        embedUrl = `https://www.facebook.com/plugins/${isVideo || postId ? 'video' : 'post'}.php?href=${encodeURIComponent(canonical)}&show_text=false`;
      }
      authorName = facebookAuthorFromUrl(withProtocol) ?? facebookAuthorFromUrl(canonical);
      title = cleanFacebookTitle(readMeta(html, 'og:title'), authorName) || description;
    }

    return NextResponse.json(
      { platform, postId, canonicalUrl: canonical, embedUrl, thumbnail, title, authorName },
      // og:image is a signed fbcdn/cdninstagram URL that expires roughly a day
      // out, so expire the cached response comfortably before the poster 403s.
      { headers: { 'Cache-Control': 'public, max-age=21600, stale-while-revalidate=21600' } },
    );
  } catch {
    return NextResponse.json({ error: `Failed to resolve ${platform} link` }, { status: 502 });
  }
}
