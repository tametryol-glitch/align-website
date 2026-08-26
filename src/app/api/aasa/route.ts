/**
 * Apple App Site Association (AASA).
 *
 * iOS fetches https://aligncosmic.com/.well-known/apple-app-site-association
 * once at install time to learn which URLs on this domain the Align app is
 * allowed to open directly. Without a valid response, the `applinks:` entitlement
 * in align-app/app.json is inert and every shared link opens Safari instead of
 * the app. A `rewrite` in next.config.js maps that well-known path here so the
 * response is served as real JSON — Apple rejects any other content type, and a
 * static extensionless file in /public is not reliably typed.
 *
 * APPLE_TEAM_ID is the 10-character Team ID from developer.apple.com → Membership.
 * It only exists once the Apple Developer Program enrollment is approved, so until
 * it is set in the Vercel environment this route returns 404 — exactly the same
 * state as today, and strictly better than publishing a malformed file that iOS
 * would cache as broken.
 */

const BUNDLE_ID = 'com.align.astrology';

/**
 * Paths the app claims. These mirror the share-link routes in
 * align-app/src/services/shareLinks.ts (`/r/` reel, `/p/` post, `/u/` profile,
 * `/c/` chart, `/g/` community, `/b/` build) plus referral/join landing pages.
 * Everything else on the site stays in the browser.
 */
const PATHS = [
  '/r/*',
  '/p/*',
  '/u/*',
  '/c/*',
  '/g/*',
  '/b/*',
  '/join/*',
  '/ref/*',
  '/share/*',
];

export const dynamic = 'force-dynamic';

export function GET() {
  const teamId = process.env.APPLE_TEAM_ID;

  if (!teamId) {
    return new Response('Not Found', { status: 404 });
  }

  const body = {
    applinks: {
      // `details` alone is correct for iOS 13+; `apps: []` is the legacy sibling
      // key Apple still expects to be present and empty.
      apps: [],
      details: [
        {
          appID: `${teamId}.${BUNDLE_ID}`,
          paths: PATHS,
        },
      ],
    },
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // iOS re-fetches periodically; a short cache keeps changes propagating
      // without hammering the origin.
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
