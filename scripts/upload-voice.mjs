#!/usr/bin/env node
/**
 * Publish ONE voice's clips by scanning its folder.
 *
 *   node scripts/upload-voice.mjs af_heart [--force]
 *
 * The main uploader reads manifest.json, which is only written when a whole
 * render finishes. This lets a completed voice go live while the remaining
 * voices are still rendering, instead of waiting hours for all of them.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUCKET = 'frequency-audio';
const CACHE_CONTROL = '31536000';

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) {
      process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  }
}

async function main() {
  loadEnv();
  const voice = process.argv[2];
  const force = process.argv.includes('--force');
  if (!voice) {
    console.error('usage: node scripts/upload-voice.mjs <voice> [--force]');
    process.exit(1);
  }

  const dir = path.join(__dirname, 'data', 'audio', voice);
  if (!fs.existsSync(dir)) {
    console.error(`no rendered clips at ${dir}`);
    process.exit(1);
  }

  // Exclude reverb temp files — they are not frequencies.
  const files = fs.readdirSync(dir)
    .filter((f) => f.endsWith('.mp3') && !f.endsWith('.tmp.mp3'));
  console.log(`${voice}: ${files.length} clip(s) on disk`);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } },
  );

  let done = 0, failed = 0;
  for (const file of files) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(`clips/${voice}/${file}`, fs.readFileSync(path.join(dir, file)), {
        contentType: 'audio/mpeg',
        cacheControl: CACHE_CONTROL,
        upsert: true, // overwrite the bridged placeholders
      });
    if (error) { failed++; console.error(`  ${file}: ${error.message}`); }
    else if (++done % 50 === 0) console.log(`  ${done}/${files.length} ...`);
  }

  console.log(`\nuploaded: ${done}   failed: ${failed}`);
  if (failed) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exit(1); });
