#!/usr/bin/env node
/**
 * Publish the padded loop variants.
 *
 *   node scripts/upload-loops.mjs [--voice af_heart] [--force]
 *
 * Uploads scripts/data/loops/<voice>/<pace>/<id>.mp3 to the same path under
 * the bucket. These are what the player streams: the gap is inside the file
 * so the OS can loop it, which is what keeps the recitation going when the
 * screen is off.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUCKET = 'frequency-audio';
const ROOT = path.join(__dirname, 'data', 'loops');

function loadEnv() {
  const p = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}

async function main() {
  loadEnv();
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const vIdx = args.indexOf('--voice');
  const onlyVoice = vIdx !== -1 ? args[vIdx + 1] : null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } },
  );

  const voices = (onlyVoice ? [onlyVoice] : fs.readdirSync(ROOT))
    .filter((v) => fs.statSync(path.join(ROOT, v)).isDirectory());

  let done = 0, skipped = 0, failed = 0;
  for (const voice of voices) {
    for (const pace of fs.readdirSync(path.join(ROOT, voice))) {
      const dir = path.join(ROOT, voice, pace);
      if (!fs.statSync(dir).isDirectory()) continue;

      const have = new Set();
      if (!force) {
        let offset = 0;
        for (;;) {
          const { data } = await supabase.storage
            .from(BUCKET).list(`loops/${voice}/${pace}`, { limit: 1000, offset });
          (data ?? []).forEach((o) => have.add(o.name));
          if (!data || data.length < 1000) break;
          offset += data.length;
        }
      }

      for (const file of fs.readdirSync(dir)) {
        if (!file.endsWith('.mp3') || file.endsWith('.tmp.mp3')) continue;
        if (!force && have.has(file)) { skipped++; continue; }
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(`loops/${voice}/${pace}/${file}`, fs.readFileSync(path.join(dir, file)), {
            contentType: 'audio/mpeg', cacheControl: '31536000', upsert: true,
          });
        if (error) { failed++; if (failed < 6) console.error(`  ${voice}/${pace}/${file}: ${error.message}`); }
        else if (++done % 500 === 0) console.log(`  ${done} uploaded ...`);
      }
    }
    console.log(`  ${voice} done`);
  }
  console.log(`\nuploaded: ${done}   skipped: ${skipped}   failed: ${failed}`);
  if (failed) process.exitCode = 1;
}
main().catch((e) => { console.error(e); process.exit(1); });
