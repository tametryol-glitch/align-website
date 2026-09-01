#!/usr/bin/env node
/**
 * Bake the pacing gap into each clip so the OS can loop it.
 *
 *   node scripts/build-loop-variants.mjs [--voice af_heart] [--force]
 *
 * WHY THIS EXISTS
 *
 * The player used to drive the repeat from JavaScript: play, setTimeout, play
 * again. That works only while the app is foregrounded — React Native
 * suspends the JS thread in the background, the timer never fires, and the
 * recitation goes silent while the bed (which loops natively) keeps playing.
 * Reopening the app fires the pending timer and the voice resumes, which is
 * exactly how the bug presented.
 *
 * Padding the silence into the file lets the audio player loop it with
 * `isLooping`, which the OS drives. No JS involved, so it survives the screen
 * going off.
 *
 * Output: loops/<voice>/<pace>/<id>.mp3
 *
 * The `bar60` pace pads to a whole number of bars at the Still Waters tempo
 * instead of a fixed gap, so a natively-looping recitation stays locked to a
 * natively-looping bed with nothing scheduling either of them.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = path.join(__dirname, 'data', 'audio');
const OUT_ROOT = path.join(__dirname, 'data', 'loops');

/** Fixed gaps, matching TEMPO_GAP_MS in the client audio module. */
const PACES = { slow: 3.0, medium: 1.5, fast: 0.5 };

/** Still Waters: 59.956 BPM, 4/4. */
const BAR_SECONDS = (4 * 60) / 59.956;
const BAR_PACE = 'bar60';
/** Only the voice Still Waters is paired with needs the bar-aligned variant. */
const BAR_VOICES = ['af_heart'];

function duration(file) {
  const out = execFileSync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration',
    '-of', 'csv=p=0', file,
  ]).toString().trim();
  return parseFloat(out);
}

function pad(src, dest, seconds) {
  const tmp = `${dest}.tmp.mp3`;
  try {
    execFileSync('ffmpeg', [
      '-y', '-v', 'error', '-i', src,
      '-af', `apad=pad_dur=${seconds.toFixed(3)}`,
      '-c:a', 'libmp3lame', '-q:a', '4', tmp,
    ]);
    // Same OneDrive EPERM retry as the render pass: without it a failed
    // rename leaves a stale variant behind and a count check still passes.
    let lastErr;
    for (let i = 0; i < 5; i++) {
      try { fs.renameSync(tmp, dest); lastErr = null; break; }
      catch (err) {
        lastErr = err;
        if (err.code !== 'EPERM' && err.code !== 'EBUSY') throw err;
        execFileSync(process.execPath, ['-e', 'setTimeout(()=>{},250)']);
      }
    }
    if (lastErr) throw lastErr;
  } finally {
    if (fs.existsSync(tmp)) { try { fs.unlinkSync(tmp); } catch {} }
  }
}

function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const vIdx = args.indexOf('--voice');
  const onlyVoice = vIdx !== -1 ? args[vIdx + 1] : null;

  const voices = (onlyVoice ? [onlyVoice] : fs.readdirSync(SRC_ROOT))
    .filter((v) => fs.statSync(path.join(SRC_ROOT, v)).isDirectory());

  let made = 0, skipped = 0, failed = 0;
  const failures = [];

  for (const voice of voices) {
    const srcDir = path.join(SRC_ROOT, voice);
    const files = fs.readdirSync(srcDir)
      .filter((f) => f.endsWith('.mp3') && !f.endsWith('.tmp.mp3'));

    const paces = { ...PACES };
    if (BAR_VOICES.includes(voice)) paces[BAR_PACE] = null; // computed per clip

    for (const [pace] of Object.entries(paces)) {
      const outDir = path.join(OUT_ROOT, voice, pace);
      fs.mkdirSync(outDir, { recursive: true });
    }

    for (const file of files) {
      const src = path.join(srcDir, file);
      let dur = null;

      for (const [pace, fixedGap] of Object.entries(paces)) {
        const dest = path.join(OUT_ROOT, voice, pace, file);
        if (!force && fs.existsSync(dest)) { skipped++; continue; }

        let gap = fixedGap;
        if (gap === null) {
          if (dur === null) dur = duration(src);
          // Round the whole loop up to a bar line, so looping it natively
          // never walks off the beat.
          const bars = Math.max(1, Math.ceil(dur / BAR_SECONDS));
          gap = bars * BAR_SECONDS - dur;
        }

        try {
          pad(src, dest, gap);
          made++;
          if (made % 250 === 0) console.log(`  ${made} built ...`);
        } catch (err) {
          failed++;
          failures.push(`${voice}/${pace}/${file}: ${err.message}`);
        }
      }
    }
    console.log(`  ${voice} done`);
  }

  console.log(`\nbuilt   : ${made}`);
  console.log(`skipped : ${skipped} (already there — use --force to redo)`);
  console.log(`failed  : ${failed}`);
  if (failures.length) {
    failures.slice(0, 15).forEach((f) => console.log('  ' + f));
    process.exitCode = 1;
  }
}

main();
