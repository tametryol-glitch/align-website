#!/usr/bin/env node
/**
 * Self-host CesiumJS static assets (Workers, Assets, Widgets, ThirdParty) under
 * public/cesium so the globe loads with NO external CDN — same privacy posture
 * as the rest of Zodisphere. Runs before `next build` (and can be run manually
 * for `next dev`). Idempotent: skips the copy if the target already looks
 * populated so local dev stays fast.
 *
 * CESIUM_BASE_URL is set to '/cesium' at runtime in the client globe component.
 */
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'node_modules', 'cesium', 'Build', 'Cesium');
const DEST = join(ROOT, 'public', 'cesium');
const SUBDIRS = ['Workers', 'Assets', 'Widgets', 'ThirdParty'];

if (!existsSync(SRC)) {
  console.warn('[copy-cesium] cesium build assets not found at', SRC, '— skipping (is cesium installed?)');
  process.exit(0);
}

// Idempotency: if every expected subdir already exists and is non-empty, skip.
const alreadyDone = SUBDIRS.every((d) => {
  const p = join(DEST, d);
  try { return existsSync(p) && readdirSync(p).length > 0; } catch { return false; }
});
if (alreadyDone) {
  console.log('[copy-cesium] public/cesium already populated — skipping copy');
  process.exit(0);
}

mkdirSync(DEST, { recursive: true });
for (const d of SUBDIRS) {
  const from = join(SRC, d);
  if (!existsSync(from)) continue;
  cpSync(from, join(DEST, d), { recursive: true });
}
console.log('[copy-cesium] copied Cesium assets → public/cesium');
