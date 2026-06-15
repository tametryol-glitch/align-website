/**
 * Video Export Service — builds FFmpeg commands from the editor state
 * and runs them via FFmpeg-wasm to produce an edited MP4.
 *
 * Lazily loaded by ExportTool on first export to keep main bundle small.
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useVideoEditorStore } from '@/stores/videoEditorStore';
import { FFMPEG_FILTER_MAP } from './videoFilters';
import { buildTransitionFFmpegFilter } from './videoTransitions';
import { buildKineticTextFilters } from './kineticText';

let ffmpeg: FFmpeg | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg && ffmpeg.loaded) return ffmpeg;

  ffmpeg = new FFmpeg();

  // Load the core from our own origin (/public/ffmpeg) so export doesn't depend
  // on a third-party CDN being reachable. Falls back to unpkg only if the
  // self-hosted files are somehow unavailable.
  const loadCore = async (base: string) => {
    await ffmpeg!.load({
      coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
    });
  };
  try {
    await loadCore('/ffmpeg');
  } catch (err) {
    console.warn('[Export] self-hosted ffmpeg-core unavailable, using CDN fallback:', err);
    ffmpeg = new FFmpeg();
    await loadCore('https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm');
  }

  return ffmpeg;
}

/**
 * Probe the source video to get actual width/height.
 * Falls back to 1080x1920 if probing fails.
 */
async function probeVideoDimensions(
  ff: FFmpeg,
): Promise<{ width: number; height: number }> {
  try {
    // Use ffprobe-style approach: run a quick transcode of 1 frame
    // and parse the log output for dimensions
    let logOutput = '';
    const handler = ({ message }: { message: string }) => {
      logOutput += message + '\n';
    };
    ff.on('log', handler);

    // Run with -t 0 to just read headers
    await ff.exec(['-i', 'input.mp4', '-t', '0', '-f', 'null', '-']);

    ff.off('log', handler);

    // Parse "Stream #0:0... Video: ... 1080x1920" or similar
    const match = logOutput.match(/(\d{2,5})x(\d{2,5})/);
    if (match) {
      const w = parseInt(match[1], 10);
      const h = parseInt(match[2], 10);
      if (w > 0 && h > 0 && w <= 7680 && h <= 7680) {
        console.log(`[Export] Probed video dimensions: ${w}x${h}`);
        return { width: w, height: h };
      }
    }
  } catch (e) {
    console.warn('[Export] Dimension probe failed, using fallback:', e);
  }

  return { width: 1080, height: 1920 };
}

/**
 * Render an emoji to a PNG via an offscreen canvas.
 * Returns the PNG as a Uint8Array.
 */
function renderEmojiToPng(
  emoji: string,
  size: number,
): Uint8Array {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);
  ctx.font = `${Math.floor(size * 0.8)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, size / 2, size / 2);

  // Convert canvas to PNG bytes
  const dataUrl = canvas.toDataURL('image/png');
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Export the video with all edits applied.
 *
 * @param onProgress - callback with 0-1 progress value
 * @returns blob URL of the exported MP4
 */
export async function exportVideo(
  onProgress: (progress: number) => void,
): Promise<string> {
  const state = useVideoEditorStore.getState();
  const {
    sourceVideoUrl,
    trimStart,
    trimEnd,
    activeFilter,
    filterIntensity,
    adjustBrightness,
    adjustContrast,
    adjustSaturation,
    adjustWarmth,
    textOverlays,
    stickerOverlays,
    transitions,
    originalAudioVolume,
    playbackSpeed,
    brollClips,
    musicTrackUrl,
    musicVolume,
    musicTrimStart,
  } = state;

  // ── Cut/rearrange: build the source→output timeline map ─────
  // segMode = the user split the clip into reorderable pieces. Output time is
  // the concatenated timeline; overlay enable windows are mapped onto it.
  const segMode = state.segments.length > 0;
  const segMap: Array<{ srcStart: number; srcEnd: number; outStart: number }> = [];
  let segTotal = 0; // total concatenated output duration (seconds)
  {
    const segs = segMode
      ? state.segments.map((g) => ({ sourceStart: g.sourceStart, sourceEnd: g.sourceEnd }))
      : [{ sourceStart: trimStart, sourceEnd: trimEnd }];
    for (const g of segs) {
      const len = Math.max(0, g.sourceEnd - g.sourceStart);
      segMap.push({ srcStart: g.sourceStart, srcEnd: g.sourceEnd, outStart: segTotal });
      segTotal += len;
    }
  }
  // Map a source-time window [a,b] to an FFmpeg enable expression in OUTPUT time.
  const enableExpr = (a: number, b: number): string => {
    if (!segMode) return `between(t,${a.toFixed(2)},${b.toFixed(2)})`;
    const parts: string[] = [];
    for (const s of segMap) {
      const lo = Math.max(a, s.srcStart);
      const hi = Math.min(b, s.srcEnd);
      if (hi > lo + 0.01) {
        const o0 = s.outStart + (lo - s.srcStart);
        const o1 = s.outStart + (hi - s.srcStart);
        parts.push(`between(t,${o0.toFixed(2)},${o1.toFixed(2)})`);
      }
    }
    return parts.length ? parts.join('+') : '0';
  };

  const ff = await getFFmpeg();

  // Set up progress handler
  ff.on('progress', ({ progress }) => {
    onProgress(Math.max(0, Math.min(1, progress)));
  });

  // ── Write input video to FFmpeg virtual FS ──────────────────
  const videoData = await fetchFile(sourceVideoUrl);
  await ff.writeFile('input.mp4', videoData);

  // ── Probe actual video dimensions ───────────────────────────
  const { width: vw, height: vh } = await probeVideoDimensions(ff);

  // ── Render sticker emojis to PNG and write to FS ────────────
  const stickerInputs: Array<{
    filename: string;
    x: number;
    y: number;
    scale: number;
    startTime: number;
    endTime: number;
    size: number;
  }> = [];

  for (let i = 0; i < stickerOverlays.length; i++) {
    const sticker = stickerOverlays[i];
    const baseSize = 128; // base emoji render size
    const renderSize = Math.round(baseSize * sticker.scale);
    const clampedSize = Math.max(16, Math.min(512, renderSize));

    const pngBytes = renderEmojiToPng(sticker.emoji, clampedSize);
    const filename = `sticker_${i}.png`;
    await ff.writeFile(filename, pngBytes);

    stickerInputs.push({
      filename,
      x: sticker.x,
      y: sticker.y,
      scale: sticker.scale,
      startTime: sticker.startTime,
      endTime: sticker.endTime,
      size: clampedSize,
    });
  }

  // ── Fetch + write B-roll sources; assign FFmpeg input indices ──
  // Inputs order: main (0), stickers (1..S), then b-roll (S+1..).
  const brollInputs: Array<{
    inputIndex: number; sourceStart: number; sourceEnd: number;
    timelineStart: number; x: number; y: number; scale: number; opacity: number; rotation: number;
  }> = [];
  {
    let nextIdx = 1 + stickerInputs.length;
    for (const b of brollClips) {
      try {
        const data = await fetchFile(b.sourceUrl);
        await ff.writeFile(`broll_${nextIdx}.mp4`, data);
        brollInputs.push({
          inputIndex: nextIdx, sourceStart: b.sourceStart, sourceEnd: b.sourceEnd,
          timelineStart: b.timelineStart, x: b.x, y: b.y, scale: b.scale, opacity: b.opacity,
          rotation: b.rotation ?? 0,
        });
        nextIdx++;
      } catch (e) { console.warn('[Export] b-roll source fetch failed:', e); }
    }
  }
  // Map a b-roll's main-timeline start (source time) to OUTPUT time.
  const brollOutStart = (tStart: number): number | null => {
    if (!segMode) return Math.max(0, tStart - trimStart);
    for (const s of segMap) {
      if (tStart >= s.srcStart && tStart < s.srcEnd) return s.outStart + (tStart - s.srcStart);
    }
    return null; // starts outside any kept piece — skip
  };
  // Append b-roll PiP overlays onto a video stream label; returns the new label.
  const chainBroll = (inStream: string, fp: string[]): string => {
    let cur = inStream;
    for (let k = 0; k < brollInputs.length; k++) {
      const bi = brollInputs[k];
      const outStart = brollOutStart(bi.timelineStart);
      if (outStart === null) continue;
      const len = Math.max(0.1, bi.sourceEnd - bi.sourceStart);
      const w = Math.max(16, Math.round(vw * bi.scale));
      const bl = `[bsrc${k}]`;
      // Optional rotation: rotate after yuva so exposed corners are transparent,
      // expanding the canvas (rotw/roth) so nothing is clipped.
      const rad = ((bi.rotation || 0) * Math.PI) / 180;
      const rotateFilter = Math.abs(rad) > 0.001
        ? `,rotate=${rad.toFixed(5)}:c=none:ow=rotw(${rad.toFixed(5)}):oh=roth(${rad.toFixed(5)})`
        : '';
      fp.push(
        `[${bi.inputIndex}:v]trim=${bi.sourceStart.toFixed(3)}:${bi.sourceEnd.toFixed(3)},` +
        `setpts=PTS-STARTPTS+${outStart.toFixed(3)}/TB,scale=${w}:-1,` +
        `format=yuva420p${rotateFilter},colorchannelmixer=aa=${bi.opacity.toFixed(2)}${bl}`,
      );
      const out = `[bov${k}]`;
      fp.push(
        `${cur}${bl}overlay=x=(W*${(bi.x / 100).toFixed(4)}-w/2):y=(H*${(bi.y / 100).toFixed(4)}-h/2):` +
        `enable='between(t,${outStart.toFixed(2)},${(outStart + len).toFixed(2)})'${out}`,
      );
      cur = out;
    }
    return cur;
  };
  const hasBroll = brollInputs.length > 0;

  // ── Background music: fetch + write; amix into the audio below ──
  const hasMusic = !!musicTrackUrl;
  let musicInputIndex = -1;
  if (hasMusic) {
    try {
      const mdata = await fetchFile(musicTrackUrl);
      await ff.writeFile('music.mp3', mdata);
      musicInputIndex = 1 + stickerInputs.length + brollInputs.length;
    } catch (e) { console.warn('[Export] music fetch failed:', e); }
  }
  const musicReady = hasMusic && musicInputIndex >= 0;

  // ── Build filter chain ──────────────────────────────────────
  const videoFilters: string[] = [];

  // Color filter (only apply when intensity > 10%)
  if (filterIntensity > 0.1) {
    const colorFilter = FFMPEG_FILTER_MAP[activeFilter];
    if (colorFilter) {
      videoFilters.push(colorFilter);
    }
  }

  // Manual adjustments — convert -1..+1 to FFmpeg eq values
  const eqParts: string[] = [];
  if (Math.abs(adjustBrightness) > 0.01) {
    eqParts.push(`brightness=${(adjustBrightness * 0.5).toFixed(2)}`);
  }
  if (Math.abs(adjustContrast) > 0.01) {
    eqParts.push(`contrast=${(1 + adjustContrast * 0.5).toFixed(2)}`);
  }
  if (Math.abs(adjustSaturation) > 0.01) {
    eqParts.push(`saturation=${(1 + adjustSaturation * 0.8).toFixed(2)}`);
  }
  if (eqParts.length > 0) {
    videoFilters.push(`eq=${eqParts.join(':')}`);
  }
  if (Math.abs(adjustWarmth) > 0.01) {
    const rs = (adjustWarmth * 0.1).toFixed(2);
    const bs = (-adjustWarmth * 0.1).toFixed(2);
    videoFilters.push(`colorbalance=rs=${rs}:bs=${bs}`);
  }

  // Text overlays (drawtext) — use actual video dimensions
  for (const overlay of textOverlays) {
    const x = Math.round((overlay.x / 100) * vw);
    const y = Math.round((overlay.y / 100) * vh);
    // Scale font size relative to video height (preview assumes ~640px tall)
    const scaledFontSize = Math.round(overlay.fontSize * (vh / 640));
    const escapedText = overlay.text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "'\\''")
      .replace(/:/g, '\\:');

    // Map font families to safe FFmpeg names
    const fontFamilyMap: Record<string, string> = {
      'Inter': 'Sans',
      'Playfair Display': 'Serif',
      'Georgia': 'Serif',
      'Courier New': 'Mono',
      'Arial Black': 'Sans',
      'Trebuchet MS': 'Sans',
      'Impact': 'Sans',
      'Comic Sans MS': 'Sans',
      'Verdana': 'Sans',
      'Lucida Console': 'Mono',
    };
    const ffmpegFont = fontFamilyMap[overlay.fontFamily] || 'Sans';
    const escape = (s: string) =>
      s.replace(/\\/g, '\\\\').replace(/'/g, "'\\''").replace(/:/g, '\\:');

    // Shared suffix: shadow (always) + optional background box + optional outline.
    let extras = `:shadowcolor=black@0.8:shadowx=2:shadowy=2`;
    if (overlay.bgColor) {
      const bgHex = overlay.bgColor.replace('#', '').slice(0, 6);
      const bgAlpha = overlay.bgColor.length > 7 ? overlay.bgColor.slice(7) : 'CC';
      extras += `:box=1:boxcolor=${bgHex}@0x${bgAlpha}:boxborderw=8`;
    }
    if (overlay.strokeWidth > 0 && overlay.strokeColor) {
      const borderW = Math.round(overlay.strokeWidth * (vh / 640));
      extras += `:borderw=${borderW}:bordercolor=${overlay.strokeColor.replace('#', '')}`;
    }

    const enableInner = enableExpr(overlay.startTime, overlay.endTime);

    // Kinetic motion needs source-time `t`, which only holds in single-clip mode.
    // In segment (concat) mode time is re-based, so fall back to a static draw.
    if (!segMode && overlay.animation && overlay.animation !== 'none') {
      const filters = buildKineticTextFilters({
        animation: overlay.animation,
        text: overlay.text,
        color: overlay.color,
        font: ffmpegFont,
        fontSize: scaledFontSize,
        xc: x,
        yc: y,
        maxWidth: Math.round(vw * 0.86),
        t0: overlay.startTime,
        t1: overlay.endTime,
        enableInner,
        extras,
        escape,
      });
      videoFilters.push(...filters);
    } else {
      videoFilters.push(
        `drawtext=text='${escapedText}'` +
        `:fontsize=${scaledFontSize}` +
        `:fontcolor=${overlay.color}` +
        `:font=${ffmpegFont}` +
        `:x=${x}-(tw/2)` +
        `:y=${y}-(th/2)` +
        `:enable='${enableInner}'` +
        extras,
      );
    }
  }

  // Transitions
  for (const trans of transitions) {
    const transFilter = buildTransitionFFmpegFilter(
      trans.type,
      trans.atTime,
      trans.durationMs,
    );
    if (transFilter) {
      videoFilters.push(transFilter);
    }
  }

  // Speed adjustment (setpts for video, atempo for audio)
  if (playbackSpeed !== 1) {
    const ptsFactor = (1 / playbackSpeed).toFixed(4);
    videoFilters.push(`setpts=${ptsFactor}*PTS`);
  }

  // ── Build audio filter chain ────────────────────────────────
  const audioFilters: string[] = [];
  if (originalAudioVolume !== 1) {
    audioFilters.push(`volume=${originalAudioVolume.toFixed(2)}`);
  }
  // Speed adjustment for audio (atempo supports 0.5-2.0, chain for extremes)
  if (playbackSpeed !== 1) {
    let remaining = playbackSpeed;
    while (remaining > 2.0) {
      audioFilters.push('atempo=2.0');
      remaining /= 2.0;
    }
    while (remaining < 0.5) {
      audioFilters.push('atempo=0.5');
      remaining /= 0.5;
    }
    audioFilters.push(`atempo=${remaining.toFixed(4)}`);
  }

  // ── Final audio: apply audio filters to the main, then amix music ──
  const outDur = segTotal; // total output seconds (= trimEnd-trimStart normally)
  const buildAudio = (fp: string[], mainLabel: string): string => {
    let main = mainLabel;
    if (audioFilters.length > 0) { fp.push(`${main}${audioFilters.join(',')}[amain]`); main = '[amain]'; }
    if (!musicReady) return main;
    fp.push(
      `[${musicInputIndex}:a]atrim=start=${musicTrimStart.toFixed(3)}:end=${(musicTrimStart + outDur).toFixed(3)},` +
      `asetpts=PTS-STARTPTS,volume=${musicVolume.toFixed(2)}[mus]`,
    );
    fp.push(`${main}[mus]amix=inputs=2:duration=first:normalize=0[aout]`);
    return '[aout]';
  };

  // ── Build FFmpeg command ────────────────────────────────────
  const args: string[] = [];

  // Input video
  args.push('-i', 'input.mp4');

  // Sticker overlay inputs. CRITICAL: each sticker is a single-frame PNG, so it
  // MUST be looped (-loop 1) — otherwise the overlay filter's framesync ends
  // when the sticker input ends and truncates the ENTIRE output to ~1 frame
  // (the "adding a sticker shortens the whole video" bug). Output length stays
  // bounded by the -to trimEnd applied below.
  for (const si of stickerInputs) {
    args.push('-loop', '1', '-i', si.filename);
  }

  // B-roll inputs — finite clips (NOT looped); they're bounded by the main video.
  for (const bi of brollInputs) {
    args.push('-i', `broll_${bi.inputIndex}.mp4`);
  }

  // Background music input (last)
  if (musicReady) {
    args.push('-i', 'music.mp3');
  }

  // Trim — single-clip mode only. In segment mode each piece is trimmed inside
  // the concat filtergraph below.
  if (!segMode) {
    args.push('-ss', trimStart.toFixed(3));
    args.push('-to', trimEnd.toFixed(3));
  }

  // ── Segment (cut / rearrange) mode: trim each piece + concat in order ──
  if (segMode) {
    const fp: string[] = [];
    const n = segMap.length;
    for (let i = 0; i < n; i++) {
      const s = segMap[i];
      fp.push(`[0:v]trim=start=${s.srcStart.toFixed(3)}:end=${s.srcEnd.toFixed(3)},setpts=PTS-STARTPTS[sv${i}]`);
      fp.push(`[0:a]atrim=start=${s.srcStart.toFixed(3)}:end=${s.srcEnd.toFixed(3)},asetpts=PTS-STARTPTS[sa${i}]`);
    }
    const concatPairs = segMap.map((_, i) => `[sv${i}][sa${i}]`).join('');
    fp.push(`${concatPairs}concat=n=${n}:v=1:a=1[cv][ca]`);

    let cur = '[cv]';
    if (videoFilters.length > 0) {
      fp.push(`${cur}${videoFilters.join(',')}[vf]`);
      cur = '[vf]';
    }
    // Chain sticker overlays (their inputs are [1:v], [2:v], … — looped above)
    for (let i = 0; i < stickerInputs.length; i++) {
      const si = stickerInputs[i];
      const px = Math.round((si.x / 100) * vw) - Math.round(si.size / 2);
      const py = Math.round((si.y / 100) * vh) - Math.round(si.size / 2);
      const out = `[vstk${i}]`;
      fp.push(`${cur}[${i + 1}:v]overlay=x=${px}:y=${py}:enable='${enableExpr(si.startTime, si.endTime)}'${out}`);
      cur = out;
    }
    cur = chainBroll(cur, fp);
    const aud = buildAudio(fp, '[ca]'); // audio filters + optional music amix
    args.push('-filter_complex', fp.join(';'));
    args.push('-map', cur);
    args.push('-map', aud);
    // CRITICAL: bound the output to the concat length. Looped sticker inputs are
    // infinite streams and `overlay` repeats the last main frame at EOF, so
    // without this the export runs forever.
    args.push('-t', segTotal.toFixed(3));
  } else if (stickerInputs.length > 0 || hasBroll || musicReady) {
    // Complex filter graph: base filters → sticker overlays → b-roll overlays.
    const filterParts: string[] = [];

    // Apply video filters to the base video stream first
    let currentStream = '[0:v]';
    if (videoFilters.length > 0) {
      filterParts.push(`${currentStream}${videoFilters.join(',')}[vfiltered]`);
      currentStream = '[vfiltered]';
    }

    // Chain sticker overlays one at a time
    for (let i = 0; i < stickerInputs.length; i++) {
      const si = stickerInputs[i];
      const px = Math.round((si.x / 100) * vw) - Math.round(si.size / 2);
      const py = Math.round((si.y / 100) * vh) - Math.round(si.size / 2);
      const outLabel = `[vstk${i}]`;
      const inputLabel = `[${i + 1}:v]`;

      filterParts.push(
        `${currentStream}${inputLabel}overlay=` +
        `x=${px}:y=${py}:` +
        `enable='${enableExpr(si.startTime, si.endTime)}'` +
        outLabel,
      );
      currentStream = outLabel;
    }

    // B-roll overlays on top of the (filtered + stickered) base
    currentStream = chainBroll(currentStream, filterParts);

    // Music-only path may leave currentStream as the raw input pad [0:v], which
    // isn't a valid filtergraph -map target. Add a passthrough to get a real label.
    if (currentStream === '[0:v]') {
      filterParts.push('[0:v]null[vout]');
      currentStream = '[vout]';
    }

    // Build the final audio stream. With music we fold audio filters + amix into
    // the filtergraph; otherwise map the source audio (optionally with -af).
    const audMap = musicReady ? buildAudio(filterParts, '[0:a]') : '0:a?';

    // Map the final video stream
    const complexFilter = filterParts.join(';');
    args.push('-filter_complex', complexFilter);
    args.push('-map', currentStream);
    args.push('-map', audMap);

    // Audio filters (music path already folded these into the graph)
    if (!musicReady && audioFilters.length > 0) {
      args.push('-af', audioFilters.join(','));
    }
    // Bound output when music is present (music is a finite-but-independent stream;
    // amix duration=first keeps it to the main, but cap defensively).
    if (musicReady) {
      args.push('-t', segTotal.toFixed(3));
    }
  } else {
    // Simple mode: no stickers, use -vf and -af
    if (videoFilters.length > 0) {
      args.push('-vf', videoFilters.join(','));
    }
    if (audioFilters.length > 0) {
      args.push('-af', audioFilters.join(','));
    }
  }

  // Output settings
  args.push(
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '23',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    '-y', // overwrite
    'output.mp4',
  );

  console.log('[Export] FFmpeg args:', args.join(' '));

  // ── Run FFmpeg ──────────────────────────────────────────────
  await ff.exec(args);

  // ── Read output ─────────────────────────────────────────────
  const output = await ff.readFile('output.mp4');
  // FFmpeg readFile returns Uint8Array (possibly backed by SharedArrayBuffer) or string.
  // Copy into a fresh ArrayBuffer to satisfy the Blob constructor's type constraint.
  let arrayBuf: ArrayBuffer;
  if (output instanceof Uint8Array) {
    arrayBuf = new ArrayBuffer(output.byteLength);
    new Uint8Array(arrayBuf).set(output);
  } else {
    arrayBuf = new TextEncoder().encode(output as string).buffer as ArrayBuffer;
  }
  const blob = new Blob([arrayBuf], { type: 'video/mp4' });
  const blobUrl = URL.createObjectURL(blob);

  // Clean up virtual FS
  try {
    await ff.deleteFile('input.mp4');
    await ff.deleteFile('output.mp4');
    for (const si of stickerInputs) {
      await ff.deleteFile(si.filename);
    }
    for (const bi of brollInputs) {
      await ff.deleteFile(`broll_${bi.inputIndex}.mp4`);
    }
    if (musicReady) await ff.deleteFile('music.mp3');
  } catch {}

  return blobUrl;
}
