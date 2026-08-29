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
  const clips = Object.entries(manifest.clips ?? {});
  if (!clips.length) {
    console.error('manifest has no clips');
    process.exit(1);
  }

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
    let offset = 0;
    for (;;) {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list('clips', { limit: 1000, offset });
      if (error) throw error;
      data.forEach((o) => existing.add(o.name));
      if (data.length < 1000) break;
      offset += data.length;
    }
    if (existing.size) console.log(`${existing.size} clip(s) already uploaded`);
  }

  // ── upload ──
  let uploaded = 0, skipped = 0, failed = 0;
  const failures = [];

  for (const [id, meta] of clips) {
    if (!force && existing.has(meta.file)) { skipped++; continue; }

    const local = path.join(dir, meta.file);
    if (!fs.existsSync(local)) {
      failed++;
      failures.push(`${id}: missing local file ${meta.file}`);
      continue;
    }

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(`clips/${meta.file}`, fs.readFileSync(local), {
        contentType: 'audio/mpeg',
        cacheControl: CACHE_CONTROL,
        upsert: true,
      });

    if (error) {
      failed++;
      failures.push(`${id}: ${error.message}`);
    } else {
      uploaded++;
      if ((uploaded + skipped) % 25 === 0) {
        console.log(`  ${uploaded + skipped}/${clips.length} ...`);
      }
    }
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
  console.log(`sample     : ${base}/clips/${clips[0][1].file}`);

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
