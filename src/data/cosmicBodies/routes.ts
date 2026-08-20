/* ──────────────────────────────────────────────────────────────
   "Learn more" routing for chart placements.

   Deliberately imports nothing but the generated slug map, so the
   edge middleware and the client-side chart screen can both use it
   without pulling in the interpretation engine.

   The old mobile implementation fell back to
   /planets-in-houses/<body>-in-<n>th-house for anything it did not
   recognise — but that route only has slugs for the ten classical
   planets, so every asteroid and angle linked straight at a 404.
   Returning null here is deliberate: callers hide the button rather
   than shipping a dead link.
   ────────────────────────────────────────────────────────────── */

import { BODY_KEY_TO_SLUG } from './slugs';

/** Bodies that owned a bespoke SEO route before the registry existed. */
export const LEGACY_BODY_ROUTES: Record<string, string> = {
  Sun: 'zodiac',
  Moon: 'moon-sign',
  Ascendant: 'rising-sign',
  ASC: 'rising-sign',
  Mercury: 'mercury-in',
  Venus: 'venus-in',
  Mars: 'mars-in',
  Jupiter: 'jupiter-in',
  Saturn: 'saturn-in',
  Uranus: 'uranus-in',
  Neptune: 'neptune-in',
  Pluto: 'pluto-in',
  Chiron: 'chiron-in',
  Juno: 'juno-in',
  Vesta: 'vesta-in',
  'North Node': 'north-node-in',
  'South Node': 'south-node-in',
};

const SIGN_SLUGS = new Set([
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
]);

/** Route prefix for any chart body name, legacy or new. */
export function getBodyRoutePrefix(chartBodyName: string): string | undefined {
  return LEGACY_BODY_ROUTES[chartBodyName] || BODY_KEY_TO_SLUG[chartBodyName];
}

/** Canonical learn-more path, or null when we genuinely have no page. */
export function getLearnMorePath(chartBodyName: string, sign: string): string | null {
  const prefix = getBodyRoutePrefix(chartBodyName);
  const signSlug = String(sign || '').toLowerCase();
  if (!prefix || !SIGN_SLUGS.has(signSlug)) return null;
  return `/${prefix}/${signSlug}`;
}

/** Absolute URL, for the mobile app and share links. */
export function getLearnMoreUrl(chartBodyName: string, sign: string): string | null {
  const path = getLearnMorePath(chartBodyName, sign);
  return path ? `https://aligncosmic.com${path}` : null;
}
