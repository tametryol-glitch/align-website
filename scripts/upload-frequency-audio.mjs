#!/usr/bin/env node
/**
 * Upload rendered Cosmic Frequency clips to Supabase storage.
 *
 *   node scripts/upload-frequency-audio.mjs [--dir scripts/data/audio] [--force]
 *
 * Creates a PUBLIC `frequency-audio` bucket if it does not exist, uploads every
 * clip named in the manifest, then uploads the manifest itself. Idempotent:
 * clips already present are skipped unless --force.
 *
 * A dedicated bucket rather than reusing post-media: this content is generated,
 * immutable and cacheable forever, and mixing it into user media makes both
 * harder to reason about.
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY (read from
 * .env.local automatically).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BUCKET = 'frequency-audio';
// Generated, immutable, content-addressed by id: cache hard.
const CACHE_CONTROL = '31536000';

/**
 * Ambient beds. Chosen from the app's existing assets for length (all 60s+,
 * so the loop seam is not obvious over a 15-minute session) and consistent
 * loudness (mean -14.8 to -17.0 dB, a ~3 dB spread, so one bed volume works
 * for all of them without a normalisation pass).
 *
 * Descriptive names only. No "432 Hz", no "binaural", nothing that turns an
 * ambient track into a therapeutic claim.
 */
const BEDS = [
  { id: 'cosmic-hum', file: 'ambient_cosmic_hum.mp3' },
  { id: 'soft-strings', file: 'ambient_soft_strings.mp3' },
  { id: 'choir-pad', file: 'ambient_choir_pad.mp3' },
  { id: 'crystal-bells', file: 'ambient_crystal_bells.mp3' },
  { id: 'rain', file: 'ambient_rain_light.mp3' },
  // Beat-aligned: trimmed to exactly 36 bars at 59.956 BPM.
  { id: 'still-waters', file: 'ambient_still_waters.mp3' },
];

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = val;
  }
}

async function main() {
  loadEnv();

  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const dirIdx = args.indexOf('--dir');
  const dir = dirIdx !== -1
    ? path.resolve(args[dirIdx + 1])
    : path.join(__dirname, 'data', 'audio');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY');
    process.exit(1);
  }

  const manifestPath = path.join(dir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error(`no manifest at ${manifestPath} — run render-frequency-audio.mjs first`);
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Manifest v2 is clips[voice][frequencyId]; v1 was a flat clips[id] with a
  // single voice. Flatten either into {voice, id, meta} so a stale manifest
  // does not silently upload nothing.
  const clips = [];
  if (manifest.version >= 2) {
    for (const [voice, byId] of Object.entries(manifest.clips ?? {})) {
      for (const [id, meta] of Object.entries(byId)) clips.push({ voice, id, meta });
    }
  } else {
    for (const [id, meta] of Object.entries(manifest.clips ?? {})) {
      clips.push({ voice: manifest.voice ?? 'af_heart', id, meta });
    }
  }
  if (!clips.length) {
    console.error('manifest has no clips');
    process.exit(1);
  }
  console.log(`manifest v${manifest.version ?? 1}: ${clips.length} clip(s) across `
    + `${new Set(clips.map((c) => c.voice)).size} voice(s)`);

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  // ── bucket ──
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) throw listErr;

  if (!buckets.some((b) => b.name === BUCKET)) {
    console.log(`creating public bucket "${BUCKET}"...`);
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ['audio/mpeg', 'application/json'],
    });
    if (error) throw error;
  } else {
    console.log(`bucket "${BUCKET}" already exists`);
  }

  // ── existing objects ──
  const existing = new Set();
  if (!force) {
    for (const voice of new Set(clips.map((c) => c.voice))) {
      let offset = 0;
      for (;;) {
        const { data, error } = await supabase.storage
          .from(BUCKET)
          .list(`clips/${voice}`, { limit: 1000, offset });
        if (error) throw error;
        data.forEach((o) => existing.add(`${voice}/${o.name}`));
        if (data.length < 1000) break;
        offset += data.length;
      }
    }
    if (existing.size) console.log(`${existing.size} clip(s) already uploaded`);
  }

  // ── upload ──
  let uploaded = 0, skipped = 0, failed = 0;
  const failures = [];

  for (const { voice, id, meta } of clips) {
    const key = `${voice}/${meta.file}`;
    if (!force && existing.has(key)) { skipped++; continue; }

    const local = path.join(dir, voice, meta.file);
    if (!fs.existsSync(local)) {
      failed++;
      failures.push(`${voice}/${id}: missing local file ${meta.file}`);
      continue;
    }

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(`clips/${key}`, fs.readFileSync(local), {
        contentType: 'audio/mpeg',
        cacheControl: CACHE_CONTROL,
        upsert: true,
      });

    if (error) {
      failed++;
      failures.push(`${voice}/${id}: ${error.message}`);
    } else {
      uploaded++;
      if ((uploaded + skipped) % 100 === 0) {
        console.log(`  ${uploaded + skipped}/${clips.length} ...`);
      }
    }
  }

  // ── ambient beds ──
  // Sourced from the mobile app's existing asset folder rather than new
  // downloads: these already ship in the app, so the licence position is
  // unchanged. Five beds are reused under all 259 clips — the bed is never
  // per-frequency, which is the whole reason the music budget is near zero.
  const bedsDir = path.join(
    __dirname, '..', '..', 'align-app', 'assets', 'audio',
  );
  let bedsUploaded = 0;
  if (fs.existsSync(bedsDir)) {
    for (const bed of BEDS) {
      const local = path.join(bedsDir, bed.file);
      if (!fs.existsSync(local)) {
        failures.push(`bed ${bed.id}: missing ${local}`);
        failed++;
        continue;
      }
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(`beds/${bed.file}`, fs.readFileSync(local), {
          contentType: 'audio/mpeg',
          cacheControl: CACHE_CONTROL,
          upsert: true,
        });
      if (error) { failed++; failures.push(`bed ${bed.id}: ${error.message}`); }
      else bedsUploaded++;
    }
    console.log(`beds uploaded: ${bedsUploaded}/${BEDS.length}`);
  } else {
    console.warn(`beds source not found: ${bedsDir}`);
  }

  // ── manifest last, so it never points at clips that are not there yet ──
  const { error: manErr } = await supabase.storage
    .from(BUCKET)
    .upload('manifest.json', Buffer.from(JSON.stringify(manifest)), {
      contentType: 'application/json',
      cacheControl: '300',
      upsert: true,
    });
  if (manErr) {
    failed++;
    failures.push(`manifest.json: ${manErr.message}`);
  }

  const base = `${url}/storage/v1/object/public/${BUCKET}`;
  console.log(`\nuploaded : ${uploaded}`);
  console.log(`skipped  : ${skipped} (already there — use --force to replace)`);
  console.log(`failed   : ${failed}`);
  console.log(`\npublic base: ${base}`);
  console.log(`sample     : ${base}/clips/${clips[0].voice}/${clips[0].meta.file}`);

  if (failures.length) {
    console.log('\nfailures:');
    failures.slice(0, 20).forEach((f) => console.log('  ' + f));
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
