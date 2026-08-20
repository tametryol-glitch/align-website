/* ──────────────────────────────────────────────────────────────
   Cosmic body registry.

   Every chart body that previously had no "learn more" page.
   Bodies that already own a bespoke SEO route (Sun, Moon, the
   seven classical planets, Chiron, Juno, Vesta, the Nodes and the
   Ascendant) are deliberately NOT here — see LEGACY_BODY_ROUTES.
   ────────────────────────────────────────────────────────────── */

import type { CosmicBody } from './types';
import { ANGLE_BODIES } from './angles';
import { CORE_ASTEROID_BODIES } from './core';
import { BOND_BODIES } from './bonds';
import { FATE_BODIES } from './fate';
import { DEPTH_BODIES } from './depths';
import { MYTH_BODIES } from './myth';

export * from './types';
export { LEGACY_BODY_ROUTES, getBodyRoutePrefix, getLearnMorePath, getLearnMoreUrl } from './routes';

export const COSMIC_BODIES: CosmicBody[] = [
  ...ANGLE_BODIES,
  ...CORE_ASTEROID_BODIES,
  ...BOND_BODIES,
  ...FATE_BODIES,
  ...DEPTH_BODIES,
  ...MYTH_BODIES,
];

const BY_SLUG = new Map(COSMIC_BODIES.map((b) => [b.slug, b]));
const BY_KEY = new Map(COSMIC_BODIES.map((b) => [b.key, b]));

export function getBodyBySlug(slug: string): CosmicBody | undefined {
  return BY_SLUG.get(slug);
}

export function getBodyByKey(key: string): CosmicBody | undefined {
  return BY_KEY.get(key);
}

/** Every new body route prefix, e.g. ["ceres-in", "descendant-in", …] */
export function getAllBodySlugs(): string[] {
  return COSMIC_BODIES.map((b) => b.slug);
}
