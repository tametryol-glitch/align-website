#!/usr/bin/env node
/**
 * Render one spoken-digit clip per Cosmic Frequency via self-hosted Kokoro.
 *
 *   node scripts/render-frequency-audio.mjs [options]
 *
 * Options
 *   --out <dir>     output directory      (default: scripts/data/audio)
 *   --voice <name>  Kokoro voice          (default: af_heart)
 *   --speed <n>     0.5-2.0               (default: 0.95)
 *   --only <id>     render a single frequency id (repeatable)
 *   --limit <n>     stop after n clips — for a quick smoke test
 *   --force         re-render clips that already exist on disk
 *   --dry-run       list what would be rendered, call nothing
 *
 * Environment
 *   KOKORO_URL      default http://127.0.0.1:8080
 *   KOKORO_TOKEN    optional bearer token
 *
 * Start Kokoro first:
 *   cd C:\\Users\\tamet\\tts-lab
 *   .\\.venv\\Scripts\\python.exe -m uvicorn server:app --host 127.0.0.1 --port 8080
 *
 * Each clip is ONE recitation with no trailing silence. Pacing is the player's
 * job — it inserts the gap between loops — so changing tempo never means
 * re-rendering. Kokoro content-hash caches, so re-runs over unchanged codes
 * are effectively free.
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'src', 'data', 'cosmicFrequencies');

const KOKORO_URL = (process.env.KOKORO_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');
const KOKORO_TOKEN = (process.env.KOKORO_TOKEN || '').trim();

/**
 * Voices offered to users. Each renders the full catalog, so adding one costs
 * a render pass and a verification pass but nothing at request time — a
 * listener only ever downloads their own voice's clip.
 */
const SHIPPING_VOICES = [
  'af_heart', 'af_nicole', 'af_bella', 'af_sarah',
  'af_river', 'bf_emma', 'bf_lily', 'af_sky',
];

/**
 * Subtle room. Dry TTS sitting flat in the centre is a large part of what
 * reads as robotic; a little space around it does more than swapping voices.
 */
const REVERB_FILTER =
  'aecho=0.85:0.75:35|55|85:0.20|0.13|0.08,highpass=f=70,lowpass=f=9000,volume=1.15';

const SOURCE_FILES = [
  'imported', 'health', 'money', 'love', 'career', 'protection', 'spiritual',
];

/* ── args ─────────────────────────────────────────────────────────── */

function parseArgs(argv) {
  const o = {
    out: path.join(__dirname, 'data', 'audio'),
    voices: [],
    speed: 0.85,
    reverb: true,
    only: [],
    limit: Infinity,
    force: false,
    dryRun: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') o.out = path.resolve(argv[++i]);
    else if (a === '--voice') o.voices.push(argv[++i]);
    else if (a === '--no-reverb') o.reverb = false;
    else if (a === '--speed') o.speed = Number(argv[++i]);
    else if (a === '--only') o.only.push(argv[++i]);
    else if (a === '--limit') o.limit = Number(argv[++i]);
    else if (a === '--force') o.force = true;
    else if (a === '--dry-run') o.dryRun = true;
    else {
      console.error(`unknown option: ${a}`);
      process.exit(1);
    }
  }
  if (o.voices.length === 0) o.voices = [...SHIPPING_VOICES];
  if (!(o.speed >= 0.5 && o.speed <= 2)) {
    console.error('--speed must be between 0.5 and 2.0');
    process.exit(1);
  }
  return o;
}

/* ── catalog ──────────────────────────────────────────────────────── */

/**
 * Pull {id, code, title} out of the registry source.
 *
 * Regex rather than importing: these are .ts modules and this is a plain node
 * script. The data files are either generated or hand-written to one fixed
 * shape, and the entry count is asserted against the id count below, so a
 * format drift fails loudly instead of silently rendering a subset.
 */
function loadCatalog() {
  const entries = [];
  const seen = new Set();

  for (const name of SOURCE_FILES) {
    const file = path.join(DATA_DIR, `${name}.ts`);
    if (!fs.existsSync(file)) {
      if (name === 'imported') continue; // not present until an import has run
      throw new Error(`missing registry file: ${file}`);
    }
    const src = fs.readFileSync(file, 'utf8');

    const ids = [...src.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]);
    const codes = [...src.matchAll(/code:\s*'([^']+)'/g)].map((m) => m[1]);
    const titles = [...src.matchAll(/title:\s*'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1]);

    if (ids.length !== codes.length || ids.length !== titles.length) {
      throw new Error(
        `${name}.ts: parsed ${ids.length} ids, ${codes.length} codes, ` +
        `${titles.length} titles — the file shape changed, fix this script`,
      );
    }

    for (let i = 0; i < ids.length; i++) {
      const digits = codes[i].replace(/\D/g, '');
      if (!digits) continue;
      // Imported entries win collisions, matching index.ts. imported.ts is
      // first in SOURCE_FILES, so first-seen wins here too.
      if (seen.has(digits)) continue;
      seen.add(digits);
      entries.push({
        id: ids[i],
        code: codes[i],
        title: titles[i].replace(/\\'/g, "'"),
        digits,
      });
    }
  }
  return entries;
}

/**
 * "520 741 8" -> "5 ... 2 ... 0 ... 7 ... 4 ... 1 ... 8"
 *
 * Ellipsis rather than commas, deliberately. Comma-separated digits make the
 * model read a LIST, and list intonation is uniform and clipped — that is
 * most of what read as robotic. Ellipsis gives each digit a settled contour
 * and room to breathe.
 */
function toSpokenDigits(digits) {
  return digits.split('').join(' ... ');
}

/* ── kokoro ───────────────────────────────────────────────────────── */

async function kokoroHealth() {
  const res = await fetch(`${KOKORO_URL}/health`, {
    headers: KOKORO_TOKEN ? { Authorization: `Bearer ${KOKORO_TOKEN}` } : {},
  });
  if (!res.ok) throw new Error(`health check failed: HTTP ${res.status}`);
  return res.json();
}

/** Apply the room to a rendered clip, in place. */
function applyReverb(file) {
  const tmp = `${file}.tmp.mp3`;
  try {
    execFileSync('ffmpeg', [
      '-y', '-v', 'error', '-i', file,
      '-af', REVERB_FILTER,
      '-c:a', 'libmp3lame', '-q:a', '4', tmp,
    ]);
    fs.renameSync(tmp, file);
  } finally {
    // A failed ffmpeg or interrupted rename would otherwise strand a
    // <id>.mp3.tmp.mp3 next to the real clip, which a disk scan then
    // uploads as if it were a frequency.
    if (fs.existsSync(tmp)) {
      try { fs.unlinkSync(tmp); } catch { /* nothing more to do */ }
    }
  }
}

async function renderClip(text, voice, speed) {
  const res = await fetch(`${KOKORO_URL}/tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(KOKORO_TOKEN ? { Authorization: `Bearer ${KOKORO_TOKEN}` } : {}),
    },
    body: JSON.stringify({ text, voice, speed, format: 'mp3' }),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return {
    buffer: Buffer.from(await res.arrayBuffer()),
    cache: res.headers.get('X-Cache') || '',
    seconds: Number(res.headers.get('X-Audio-Seconds') || 0),
  };
}

/* ── main ─────────────────────────────────────────────────────────── */

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  let catalog = loadCatalog();
  if (opts.only.length) {
    const wanted = new Set(opts.only);
    catalog = catalog.filter((e) => wanted.has(e.id));
    const missing = [...wanted].filter((id) => !catalog.some((e) => e.id === id));
    if (missing.length) {
      console.error(`unknown id(s): ${missing.join(', ')}`);
      process.exit(1);
    }
  }

  console.log(`catalog: ${catalog.length} frequencies`);
  console.log(`kokoro : ${KOKORO_URL}`);
  console.log(`voices : ${opts.voices.join(', ')}`);
  console.log(`speed  : ${opts.speed}   reverb: ${opts.reverb ? 'on' : 'off'}`);
  console.log(`total  : ${catalog.length * opts.voices.length} clips`);
  console.log(`out    : ${opts.out}\n`);

  if (opts.dryRun) {
    catalog.slice(0, Number.isFinite(opts.limit) ? opts.limit : 10).forEach((e) => {
      console.log(`  ${e.id}\n      ${e.code}  ->  "${toSpokenDigits(e.digits)}"`);
    });
    console.log(`\ndry run — nothing rendered (${catalog.length} would be considered)`);
    return;
  }

  try {
    const h = await kokoroHealth();
    console.log(`kokoro up (default voice ${h.tts_voice_default ?? '?'})\n`);
  } catch (err) {
    console.error(`Cannot reach Kokoro at ${KOKORO_URL}: ${err.message}`);
    console.error('\nStart it with:');
    console.error('  cd C:\\Users\\tamet\\tts-lab');
    console.error('  .\\.venv\\Scripts\\python.exe -m uvicorn server:app --host 127.0.0.1 --port 8080');
    process.exit(1);
  }

  fs.mkdirSync(opts.out, { recursive: true });

  // Merge into any existing manifest rather than replacing it. Without this,
  // a targeted re-render (--only) would rewrite the manifest containing just
  // the handful of clips it touched and drop every other entry.
  const manifestPath = path.join(opts.out, 'manifest.json');
  let clips = {};
  if (fs.existsSync(manifestPath)) {
    try {
      clips = JSON.parse(fs.readFileSync(manifestPath, 'utf8')).clips ?? {};
    } catch {
      console.warn('existing manifest unreadable — starting a fresh one');
    }
  }
  let rendered = 0, skipped = 0, cached = 0, failed = 0;
  const failures = [];

  for (const voice of opts.voices) {
  const voiceDir = path.join(opts.out, voice);
  fs.mkdirSync(voiceDir, { recursive: true });
  if (!clips[voice]) clips[voice] = {};

  let doneThisVoice = 0;
  for (const entry of catalog) {
    if (doneThisVoice >= opts.limit) break;
    doneThisVoice++;

    const filename = `${entry.id}.mp3`;
    const dest = path.join(voiceDir, filename);

    if (!opts.force && fs.existsSync(dest)) {
      clips[voice][entry.id] = {
        file: filename,
        digits: entry.digits,
        bytes: fs.statSync(dest).size,
      };
      skipped++;
      continue;
    }

    const text = toSpokenDigits(entry.digits);
    try {
      const { buffer, cache, seconds } = await renderClip(text, voice, opts.speed);

      // A clip far shorter than its digit count means the model swallowed
      // something. Better to fail loudly than ship a truncated code.
      const minSeconds = entry.digits.length * 0.2;
      if (seconds && seconds < minSeconds) {
        throw new Error(
          `suspiciously short: ${seconds.toFixed(2)}s for ${entry.digits.length} digits`,
        );
      }

      fs.writeFileSync(dest, buffer);
      if (opts.reverb) applyReverb(dest);

      // speed is per-clip: a clip re-rendered slower must not be described by
      // the run-level default, or the manifest lies about what shipped.
      clips[voice][entry.id] = {
        file: filename,
        digits: entry.digits,
        bytes: fs.statSync(dest).size,
        speed: opts.speed,
      };
      rendered++;
      if (cache === 'HIT') cached++;

      const n = rendered + skipped;
      if (n % 50 === 0) {
        console.log(`  ${n}/${catalog.length * opts.voices.length} ...`);
      }
    } catch (err) {
      failed++;
      failures.push(`${voice}/${entry.id} (${entry.code}): ${err.message}`);
    }
  }
  console.log(`  ${voice} complete`);
  }

  const manifest = {
    version: 2,
    voices: opts.voices,
    defaultSpeed: opts.speed,
    prosody: 'ellipsis',
    reverb: opts.reverb,
    // clips[voice][frequencyId]
    clips,
  };
  fs.writeFileSync(
    path.join(opts.out, 'manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
    'utf8',
  );

  const allClips = Object.values(clips).flatMap((byId) => Object.values(byId));
  const totalBytes = allClips.reduce((n, c) => n + c.bytes, 0);
  console.log(`\nrendered : ${rendered}${cached ? ` (${cached} from Kokoro cache)` : ''}`);
  console.log(`skipped  : ${skipped} (already on disk — use --force to redo)`);
  console.log(`failed   : ${failed}`);
  console.log(`clips    : ${allClips.length} across ${Object.keys(clips).length} voice(s)`);
  console.log(`total    : ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`manifest : ${path.join(opts.out, 'manifest.json')}`);

  if (failures.length) {
    console.log('\nfailures:');
    failures.slice(0, 20).forEach((f) => console.log('  ' + f));
    if (failures.length > 20) console.log(`  ...and ${failures.length - 20} more`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
