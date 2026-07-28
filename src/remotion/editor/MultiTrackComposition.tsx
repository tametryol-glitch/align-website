'use client';

/**
 * MultiTrackComposition (Phase 3) — renders the positioned multi-track timeline
 * (TimelineState) as a Remotion composition, for both the in-editor WYSIWYG
 * preview and (Phase 4) the server render. Each clip is a <Sequence> at its
 * absolute start, so GAPS naturally show the black background, multiple audio
 * tracks mix, and video/text/overlay lanes stack by track order (order 0 = front).
 */

import React from 'react';
import { AbsoluteFill, OffthreadVideo, Audio, Sequence, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion';
import type {
  TimelineState, TimelineClip, MediaClip, TextClip, StickerClip, TimelineTrack,
} from '@/lib/editor/timelineModel';
import { getFilterById, scaleCssFilter } from '@/lib/videoFilters';
import type { FilterPresetId } from '@/stores/videoEditorStore';
import { ChromaKeyVideo } from './ChromaKeyVideo';

const f = (sec: number, fps: number) => Math.round(sec * fps);

// Fractal-noise tile for grain / dust overlays.
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Build the CSS filter chain for a video clip: colour grade + manual adjust + chroma split. */
function lookFilter(m: MediaClip): string {
  const parts: string[] = [];
  if (m.filter && m.filter !== 'none') {
    const grade = scaleCssFilter(getFilterById(m.filter as FilterPresetId).css, m.filterIntensity ?? 1);
    if (grade) parts.push(grade);
  }
  const a = m.adjust;
  if (a) {
    if (a.brightness) parts.push(`brightness(${(1 + a.brightness).toFixed(3)})`);
    if (a.contrast) parts.push(`contrast(${(1 + a.contrast).toFixed(3)})`);
    if (a.saturation) parts.push(`saturate(${(1 + a.saturation).toFixed(3)})`);
    if (a.warmth) {
      if (a.warmth > 0) parts.push(`sepia(${(a.warmth * 0.35).toFixed(3)})`);
      else parts.push(`hue-rotate(${(a.warmth * 18).toFixed(1)}deg)`);
    }
  }
  if (m.effects?.includes('glow')) parts.push('blur(0.4px) brightness(1.05)');
  if (m.effects?.includes('rgbsplit')) {
    parts.push('drop-shadow(3px 0 rgba(255,0,80,0.5))', 'drop-shadow(-3px 0 rgba(0,200,255,0.5))');
  }
  return parts.join(' ');
}

export const MultiTrackComposition: React.FC<{ timeline?: TimelineState }> = ({ timeline }) => {
  const { fps } = useVideoConfig();
  if (!timeline || timeline.clips.length === 0) {
    return <AbsoluteFill style={{ background: '#0D0A24' }} />;
  }

  const clipsOf = (trackId: string) => timeline.clips.filter((c) => c.trackId === trackId);
  // Layer back-to-front: video (back) → overlay → text (front), so captions and
  // stickers always sit over the footage. Within a kind, top lane (order 0) is front.
  const rank: Record<string, number> = { video: 0, overlay: 1, text: 2 };
  const visual = timeline.tracks
    .filter((t) => t.kind !== 'audio' && !t.hidden)
    .sort((a, b) => (rank[a.kind] - rank[b.kind]) || (b.order - a.order));
  const audio = timeline.tracks.filter((t) => t.kind === 'audio' && !t.muted);

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {visual.map((t) => clipsOf(t.id).map((c) => <VisualClip key={c.id} clip={c} track={t} fps={fps} />))}
      {audio.map((t) => clipsOf(t.id).map((c) => <AudioClipEl key={c.id} clip={c as MediaClip} fps={fps} />))}
    </AbsoluteFill>
  );
};

function VisualClip({ clip, track, fps }: { clip: TimelineClip; track: TimelineTrack; fps: number }) {
  const from = f(clip.start, fps);
  const dur = Math.max(1, f(clip.duration, fps));

  if (clip.kind === 'video') {
    const m = clip as MediaClip;
    return (
      <Sequence from={from} durationInFrames={dur} layout="none">
        <VideoClipRender clip={m} track={track} />
      </Sequence>
    );
  }

  if (clip.kind === 'text') {
    return (
      <Sequence from={from} durationInFrames={dur} layout="none">
        <TextClipRender clip={clip as TextClip} />
      </Sequence>
    );
  }

  // overlay: sticker (emoji / image / animated GIF)
  // Browser preview: a plain <img> animates GIFs natively. (@remotion/gif is
  // used only in the server renderer, where fetch() isn't blocked by Giphy CORS.)
  const s = clip as StickerClip;
  return (
    <Sequence from={from} durationInFrames={dur} layout="none">
      <AbsoluteFill>
        <div
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            transform: `translate(-50%, -50%) scale(${s.scale || 1}) rotate(${s.rotation || 0}deg)`,
            fontSize: 120,
          }}
        >
          {s.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.imageUrl} alt="" style={{ width: 240, height: 'auto' }} />
          ) : (
            s.emoji
          )}
        </div>
      </AbsoluteFill>
    </Sequence>
  );
}

/** Renders a text clip with kinetic animation (fade/slide/scale/bounce/
 *  typewriter/word-pop/karaoke). Word-timed animations distribute the clip's
 *  duration across its words — which is exactly how auto-captions read. */
function TextClipRender({ clip: t }: { clip: TextClip }) {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const durFrames = Math.max(1, Math.round(t.duration * fps));
  const anim = t.animation || 'none';
  const HIGHLIGHT = '#FFD84D';

  // In/out fade shared by all animations.
  const inF = interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const outF = interpolate(frame, [durFrames - 8, durFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const baseOpacity = Math.min(inF, outF);

  let opacity = baseOpacity;
  let translateY = 0;
  let scale = 1;
  if (anim === 'slide') translateY = interpolate(frame, [0, 10], [40, 0], { extrapolateRight: 'clamp' });
  if (anim === 'scale') scale = spring({ frame, fps, config: { damping: 13 } });
  if (anim === 'bounce') scale = spring({ frame, fps, config: { damping: 7, stiffness: 130 } });

  const words = t.text.split(/\s+/).filter(Boolean);
  const perWord = durFrames / Math.max(1, words.length);

  let content: React.ReactNode = t.text;
  if (anim === 'typewriter') {
    const chars = Math.floor(interpolate(frame, [0, durFrames * 0.6], [0, t.text.length], { extrapolateRight: 'clamp' }));
    content = t.text.slice(0, chars);
  } else if (anim === 'word-pop') {
    content = words.map((w, i) => {
      const local = frame - i * perWord;
      const s = local >= 0 ? spring({ frame: local, fps, config: { damping: 10 } }) : 0;
      return <span key={i} style={{ display: 'inline-block', margin: '0 0.14em', transform: `scale(${s})`, opacity: local >= 0 ? 1 : 0 }}>{w}</span>;
    });
  } else if (anim === 'karaoke') {
    content = words.map((w, i) => {
      const wordStart = i * perWord;
      const spoken = frame >= wordStart;
      const current = spoken && frame < wordStart + perWord;
      return <span key={i} style={{ display: 'inline-block', margin: '0 0.14em', color: spoken ? HIGHLIGHT : t.color, transform: current ? 'scale(1.1)' : 'scale(1)', transition: 'none' }}>{w}</span>;
    });
  }

  return (
    <AbsoluteFill>
      <div style={{
        position: 'absolute', left: `${t.x}%`, top: `${t.y}%`,
        transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale}) rotate(${t.rotation || 0}deg)`,
        opacity,
        color: t.color, fontSize: t.fontSize, fontFamily: t.fontFamily || 'Inter, sans-serif', fontWeight: 800,
        textAlign: t.textAlign || 'center', background: t.bgColor || 'transparent',
        padding: t.bgColor ? '0.15em 0.4em' : 0, borderRadius: t.bgColor ? 8 : 0,
        WebkitTextStroke: t.strokeWidth ? `${t.strokeWidth}px ${t.strokeColor || '#000'}` : undefined,
        whiteSpace: 'pre-wrap', maxWidth: '90%', lineHeight: 1.15, textShadow: '0 2px 12px rgba(0,0,0,0.35)',
      }}>
        {content}
      </div>
    </AbsoluteFill>
  );
}

/** Renders one video clip with its colour grade, adjust, and animated effects. */
function VideoClipRender({ clip: m, track }: { clip: MediaClip; track: TimelineTrack }) {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame(); // relative to the clip's Sequence
  const isPip = track.kind === 'overlay' || (m.scale != null && m.scale < 1);
  const fx = m.effects || [];

  // Frame-driven transforms.
  let transform = '';
  if (fx.includes('zoompulse')) {
    const beat = Math.abs(Math.sin((frame / fps) * Math.PI * 2 * 2)); // ~2 pulses/sec
    transform += ` scale(${(1 + beat * 0.06).toFixed(4)})`;
  }
  if (fx.includes('shake')) {
    const dx = Math.sin(frame * 1.3) * 6;
    const dy = Math.cos(frame * 1.7) * 6;
    transform += ` translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
  }

  // Ken Burns motion across the whole clip.
  const durFrames = Math.max(1, Math.round(m.duration * fps));
  const progress = frame / durFrames;
  transform += motionTransform(m.motion, progress);

  // Manual keyframes (override/compose motion) — position/scale/rotate + opacity.
  const kf = keyframeState(m.keyframes, progress);
  if (kf.transform) transform += kf.transform;

  // Entrance transition over the clip's opening.
  const tr = transitionIn(m, frame, fps);
  if (tr.transform) transform += ` ${tr.transform}`;

  const video = m.chroma ? (
    <div style={{ width: '100%', height: '100%', filter: lookFilter(m) || undefined, transform: transform || undefined }}>
      <ChromaKeyVideo
        src={m.sourceUrl}
        startFrom={f(m.sourceStart, fps)}
        playbackRate={m.speed ?? 1}
        muted={track.muted || m.volume === 0}
        volume={m.volume ?? 1}
        chroma={m.chroma}
        objectFit={isPip ? 'contain' : 'cover'}
      />
    </div>
  ) : (
    <OffthreadVideo
      src={m.sourceUrl}
      startFrom={f(m.sourceStart, fps)}
      playbackRate={m.speed ?? 1}
      muted={track.muted || m.volume === 0}
      volume={m.volume ?? 1}
      style={{
        width: '100%', height: '100%', objectFit: isPip ? 'contain' : 'cover', display: 'block',
        filter: lookFilter(m) || undefined,
        transform: transform ? `${transform}` : undefined,
      }}
    />
  );

  const overlays: React.ReactNode[] = [];
  if (fx.includes('vignette')) {
    overlays.push(<div key="vig" style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 220px 80px rgba(0,0,0,0.75)', pointerEvents: 'none' }} />);
  }
  if (fx.includes('grain')) {
    overlays.push(<div key="grain" style={{ position: 'absolute', inset: 0, backgroundImage: NOISE, backgroundSize: '140px 140px', backgroundPosition: `${(frame * 13) % 140}px ${(frame * 7) % 140}px`, mixBlendMode: 'overlay', opacity: 0.14, pointerEvents: 'none' }} />);
  }
  if (fx.includes('dust')) {
    overlays.push(<div key="dust" style={{ position: 'absolute', inset: 0, backgroundImage: NOISE, backgroundSize: '260px 260px', backgroundPosition: `${(frame * -5) % 260}px ${(frame * 9) % 260}px`, mixBlendMode: 'screen', opacity: 0.08, pointerEvents: 'none' }} />);
  }
  if (fx.includes('lightleak')) {
    const shift = (Math.sin((frame / fps) * 1.2) * 30).toFixed(1);
    overlays.push(<div key="leak" style={{ position: 'absolute', inset: 0, background: `linear-gradient(${115 + Number(shift)}deg, rgba(255,120,40,0.0) 40%, rgba(255,120,40,0.35) 70%, rgba(255,60,120,0.25) 100%)`, mixBlendMode: 'screen', pointerEvents: 'none' }} />);
  }
  if (fx.includes('glow')) {
    overlays.push(<div key="glow" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.18), rgba(255,255,255,0) 60%)', mixBlendMode: 'screen', pointerEvents: 'none' }} />);
  }

  if (tr.overlay) overlays.push(tr.overlay);

  const inner = (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', opacity: tr.opacity * (kf.opacity ?? 1) }}>
      {video}
      {overlays}
    </div>
  );

  return isPip ? (
    <AbsoluteFill><div style={pipStyle(m)}>{inner}</div></AbsoluteFill>
  ) : (
    <AbsoluteFill>{inner}</AbsoluteFill>
  );
}

type Keyframe = { t: number; scale?: number; x?: number; y?: number; opacity?: number; rotation?: number };

/** Interpolate manual keyframes at clip progress p (0→1). Each property is
 *  interpolated across only the keyframes that define it; holds at the ends. */
function keyframeState(keyframes: Keyframe[] | undefined, p: number): { transform: string; opacity: number | null } {
  if (!keyframes || keyframes.length === 0) return { transform: '', opacity: null };
  const sorted = [...keyframes].sort((a, b) => a.t - b.t);
  const prop = (key: keyof Keyframe, def: number): number => {
    const pts = sorted.filter((k) => k[key] != null);
    if (pts.length === 0) return def;
    if (p <= pts[0].t) return pts[0][key] as number;
    if (p >= pts[pts.length - 1].t) return pts[pts.length - 1][key] as number;
    for (let i = 0; i < pts.length - 1; i++) {
      if (p >= pts[i].t && p <= pts[i + 1].t) {
        const span = pts[i + 1].t - pts[i].t || 1;
        const f = (p - pts[i].t) / span;
        return (pts[i][key] as number) + ((pts[i + 1][key] as number) - (pts[i][key] as number)) * f;
      }
    }
    return def;
  };
  const scale = prop('scale', 1), x = prop('x', 0), y = prop('y', 0), rotation = prop('rotation', 0);
  const hasOpacity = sorted.some((k) => k.opacity != null);
  return {
    transform: ` translate(${x.toFixed(2)}%, ${y.toFixed(2)}%) scale(${scale.toFixed(4)}) rotate(${rotation.toFixed(2)}deg)`,
    opacity: hasOpacity ? prop('opacity', 1) : null,
  };
}

/** Ken Burns transform for a clip at progress p (0→1). Slight over-scale keeps
 *  pans from exposing the frame edge. */
function motionTransform(motion: string | undefined, p: number): string {
  if (!motion || motion === 'none') return '';
  const e = Math.max(0, Math.min(1, p));
  switch (motion) {
    case 'zoom-in': return ` scale(${(1 + 0.25 * e).toFixed(4)})`;
    case 'zoom-out': return ` scale(${(1.25 - 0.25 * e).toFixed(4)})`;
    case 'pan-left': return ` scale(1.12) translateX(${(-8 * e).toFixed(2)}%)`;
    case 'pan-right': return ` scale(1.12) translateX(${(8 * e).toFixed(2)}%)`;
    case 'pan-up': return ` scale(1.12) translateY(${(-8 * e).toFixed(2)}%)`;
    case 'pan-down': return ` scale(1.12) translateY(${(8 * e).toFixed(2)}%)`;
    case 'ken-burns': return ` scale(${(1.1 + 0.15 * e).toFixed(4)}) translateX(${(-4 * e).toFixed(2)}%)`;
    default: return '';
  }
}

/** Entrance transition state at `frame` for a clip: opacity, extra transform, overlay. */
function transitionIn(m: MediaClip, frame: number, fps: number): { opacity: number; transform: string; overlay: React.ReactNode | null } {
  const t = m.transitionIn;
  if (!t || !t.type || t.type === 'none') return { opacity: 1, transform: '', overlay: null };
  const durF = Math.max(1, Math.round((t.durationSec || 0.5) * fps));
  if (frame >= durF) return { opacity: 1, transform: '', overlay: null };
  const p = frame / durF; // 0→1
  switch (t.type) {
    case 'fade': return { opacity: p, transform: '', overlay: null };
    case 'fade-black': return { opacity: 1, transform: '', overlay: <div key="tr" style={{ position: 'absolute', inset: 0, background: '#000', opacity: 1 - p, pointerEvents: 'none' }} /> };
    case 'zoom': return { opacity: p, transform: ` scale(${(1.4 - 0.4 * p).toFixed(3)})`, overlay: null };
    case 'slide': return { opacity: 1, transform: ` translateX(${((1 - p) * 100).toFixed(1)}%)`, overlay: null };
    case 'spin': return { opacity: p, transform: ` rotate(${((1 - p) * 90).toFixed(1)}deg) scale(${(0.6 + 0.4 * p).toFixed(3)})`, overlay: null };
    case 'whip': return { opacity: interpolate(p, [0, 0.5, 1], [0, 0.2, 1]), transform: ` translateX(${((1 - p) * 60).toFixed(1)}%)`, overlay: null };
    case 'glitch': return {
      opacity: 1, transform: ` translateX(${(Math.sin(frame * 3) * (1 - p) * 12).toFixed(1)}px)`,
      overlay: <div key="tr" style={{ position: 'absolute', inset: 0, background: 'rgba(255,0,80,0.25)', mixBlendMode: 'screen', opacity: 1 - p, pointerEvents: 'none' }} />,
    };
    default: return { opacity: 1, transform: '', overlay: null };
  }
}

function pipStyle(m: MediaClip): React.CSSProperties {
  const scale = m.scale ?? 0.5;
  return {
    position: 'absolute',
    left: `${m.x ?? 50}%`,
    top: `${m.y ?? 50}%`,
    width: `${scale * 100}%`,
    transform: `translate(-50%, -50%) rotate(${m.rotation || 0}deg)`,
    opacity: m.opacity ?? 1,
    overflow: 'hidden',
    borderRadius: 12,
  };
}

function AudioClipEl({ clip, fps }: { clip: MediaClip; fps: number }) {
  const from = f(clip.start, fps);
  const startFrom = f(clip.sourceStart, fps);
  const dur = Math.max(1, f(clip.duration, fps));
  // Voice FX = playbackRate (speed + pitch). endAt uses the source out-point so
  // the correct span plays regardless of rate.
  return (
    <Sequence from={from} durationInFrames={dur} layout="none">
      <Audio src={clip.sourceUrl} startFrom={startFrom} endAt={f(clip.sourceEnd, fps)} volume={clip.volume ?? 1} playbackRate={clip.speed ?? 1} />
    </Sequence>
  );
}
