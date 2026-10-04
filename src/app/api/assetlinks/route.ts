/**
 * Android Digital Asset Links (the Android twin of /api/aasa).
 *
 * Android 12+ fetches https://www.aligncosmic.com/.well-known/assetlinks.json
 * when the app is installed (and periodically after) to learn whether this
 * domain really belongs to the Align app. Only then do the app's verified
 * intent filters (`autoVerify`) open shared links straight in the app; without
 * it every link opens the browser first, and Play Console warns that "deep
 * links may be failing because your web domains aren't associated with your
 * app".
 *
 * A `rewrite` in next.config.js serves this at the well-known path so the
 * response is real JSON with the right content type.
 *
 * The fingerprint MUST be the Play **App signing key** certificate SHA-256
 * (Play Console → Test and release → App integrity → App signing), NOT the
 * upload key: Google re-signs every build before it reaches a phone, so the
 * installed app carries Google's key. A wrong fingerprint fails verification
 * silently. Until one is configured this route returns 404 -- the same state as
 * not having the file, and strictly better than publishing one that makes
 * Android cache a failed verification.
 *
 * Configure either here (ANDROID_SIGNING_FINGERPRINTS) or with the Vercel
 * environment variable ANDROID_SIGNING_SHA256 (comma-separated, overrides this).
 */

const PACKAGE_NAME = 'com.align.astrology';

/**
 * SHA-256 certificate fingerprints, "AA:BB:..." (32 bytes, colon-separated).
 *
 * Read from the Play Developer API (generatedApks.list -> certificateSha256Hash)
 * on 04-10-2026: identical for builds 683, 686 and 687, i.e. the Play App
 * signing key that signs everything Google delivers. Not the EAS upload key.
 */
const ANDROID_SIGNING_FINGERPRINTS: string[] = [
  '12:E8:D0:0C:97:A4:8B:31:18:83:39:CC:3F:F2:88:B3:0C:E9:6F:12:56:6C:CA:B6:51:D4:19:58:1E:00:67:53',
];

const FINGERPRINT_RE = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;

export const dynamic = 'force-dynamic';

function fingerprints(): string[] {
  const fromEnv = (process.env.ANDROID_SIGNING_SHA256 || '')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const list = fromEnv.length ? fromEnv : ANDROID_SIGNING_FINGERPRINTS.map((s) => s.toUpperCase());
  // Drop anything that is not a well-formed SHA-256 rather than publish a
  // file Android would reject as a whole.
  return list.filter((f) => FINGERPRINT_RE.test(f));
}

export function GET() {
  const prints = fingerprints();
  if (prints.length === 0) {
    return new Response('Not Found', { status: 404 });
  }

  const body = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: PACKAGE_NAME,
        sha256_cert_fingerprints: prints,
      },
    },
  ];

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Android re-checks periodically; a short cache keeps fixes propagating.
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
