#!/usr/bin/env node
/**
 * Bridge the old flat clip layout to the per-voice one, in place.
 *
 *   node scripts/bridge-voice-paths.mjs [--voice af_heart]
 *
 * The player moved from clips/<id>.mp3 to clips/<voice>/<id>.mp3 before the
 * multi-voice render had finished, which leaves the deployed site asking for
 * paths that do not exist yet. This copies the existing objects into the
 * default voice's folder server-side so playback keeps working while the new
 * clips render.
 *
 * Copies rather than moves: the flat originals stay put, so this is safe to
 * run twice and safe to run while a render is in flight. The real render
 * overwrites these with the better audio (ellipsis, reverb) when it lands.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUCKET = 'frequency-audio';

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    if (!(m[1] in process.env)) {
      process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  }
}

async function main() {
  loadEnv();
  const args = process.argv.slice(2);
  const vIdx = args.indexOf('--voice');
  const voice = vIdx !== -1 ? args[vIdx + 1] : 'af_heart';

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY');
    process.exit(1);
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  // Flat objects sit directly under clips/ ; folders come back as entries
  // with no id, so filter to real files only.
  const flat = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list('clips', { limit: 1000, offset });
    if (error) throw error;
    data.filter((o) => o.id && o.name.endsWith('.mp3')).forEach((o) => flat.push(o.name));
    if (data.length < 1000) break;
    offset += data.length;
  }

  console.log(`flat clips found : ${flat.length}`);
  if (!flat.length) {
    console.log('nothing to bridge — the per-voice layout is already in place');
    return;
  }

  const { data: already } = await supabase.storage
    .from(BUCKET)
    .list(`clips/${voice}`, { limit: 1000 });
  const have = new Set((already ?? []).map((o) => o.name));

  let copied = 0, skipped = 0, failed = 0;
  for (const name of flat) {
    if (have.has(name)) { skipped++; continue; }
    const { error } = await supabase.storage
      .from(BUCKET)
      .copy(`clips/${name}`, `clips/${voice}/${name}`);
    if (error) { failed++; console.error(`  ${name}: ${error.message}`); }
    else {
      copied++;
      if (copied % 50 === 0) console.log(`  ${copied}/${flat.length} ...`);
    }
  }

  console.log(`\ncopied  : ${copied} -> clips/${voice}/`);
  console.log(`skipped : ${skipped} (already there)`);
  console.log(`failed  : ${failed}`);
  if (failed) process.exitCode = 1;
}

main().catch((err) => { console.error(err); process.exit(1); });
