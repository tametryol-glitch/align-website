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

let ffmpeg: FFmpeg | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg && ffmpeg.loaded) return ffmpeg;

  ffmpeg = new FFmpeg();

  // Load from CDN (avoids self-hosting the 30MB wasm)
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  return ffmpeg;
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
    textOverlays,
    transitions,
    originalAudioVolume,
  } = state;

  const ff = await getFFmpeg();

  // Set up progress handler
  ff.on('progress', ({ progress }) => {
    onProgress(Math.max(0, Math.min(1, progress)));
  });

  // ── Write input video to FFmpeg virtual FS ──────────────────
  const videoData = await fetchFile(sourceVideoUrl);
  await ff.writeFile('input.mp4', videoData);

  // ── Build filter chain ──────────────────────────────────────
  const videoFilters: string[] = [];

  // Trim is handled via -ss / -to args, not filters

  // Color filter
  const colorFilter = FFMPEG_FILTER_MAP[activeFilter];
  if (colorFilter) {
    videoFilters.push(colorFilter);
  }

  // Text overlays (drawtext)
  for (const overlay of textOverlays) {
    // Convert percentage position to pixel position (1080x1920)
    const x = Math.round((overlay.x / 100) * 1080);
    const y = Math.round((overlay.y / 100) * 1920);
    const escapedText = overlay.text
      .replace(/'/g, "'\\''")
      .replace(/:/g, '\\:')
      .replace(/\\/g, '\\\\');

    videoFilters.push(
      `drawtext=text='${escapedText}'` +
      `:fontsize=${overlay.fontSize * 2}` + // 2x for 1080p
      `:fontcolor=${overlay.color}` +
      `:x=${x}-(tw/2)` +
      `:y=${y}-(th/2)` +
      `:enable='between(t,${overlay.startTime.toFixed(2)},${overlay.endTime.toFixed(2)})'` +
      `:shadowcolor=black@0.8:shadowx=2:shadowy=2`,
    );
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

  // ── Build audio filter chain ────────────────────────────────
  const audioFilters: string[] = [];
  if (originalAudioVolume !== 1) {
    audioFilters.push(`volume=${originalAudioVolume.toFixed(2)}`);
  }

  // ── Build FFmpeg command ────────────────────────────────────
  const args: string[] = [];

  // Input
  args.push('-i', 'input.mp4');

  // Trim
  args.push('-ss', trimStart.toFixed(3));
  args.push('-to', trimEnd.toFixed(3));

  // Video filters
  if (videoFilters.length > 0) {
    args.push('-vf', videoFilters.join(','));
  }

  // Audio filters
  if (audioFilters.length > 0) {
    args.push('-af', audioFilters.join(','));
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
  } catch {}

  return blobUrl;
}
