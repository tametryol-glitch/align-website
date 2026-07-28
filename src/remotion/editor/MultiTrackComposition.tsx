'use client';

/**
 * MultiTrackComposition (Phase 3) — renders the positioned multi-track timeline
 * (TimelineState) as a Remotion composition, for both the in-editor WYSIWYG
 * preview and (Phase 4) the server render. Each clip is a <Sequence> at its
 * absolute start, so GAPS naturally show the black background, multiple audio
 * tracks mix, and video/text/overlay lanes stack by track order (order 0 = front).
 */

import React from 'react';
import { AbsoluteFill, OffthreadVideo, Audio, Sequence, useVideoConfig, useCurrentFrame } from 'remotion';
import type {
  TimelineState, TimelineClip, MediaClip, TextClip, StickerClip, TimelineTrack,
} from '@/lib/editor/timelineModel';
import { getFilterById, scaleCssFilter } from '@/lib/videoFilters';
import type { FilterPresetId } from '@/stores/videoEditorStore';

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
    const t = clip as TextClip;
    return (
      <Sequence from={from} durationInFrames={dur} layout="none">
        <AbsoluteFill>
          <div
            style={{
              position: 'absolute',
              left: `${t.x}%`,
              top: `${t.y}%`,
              transform: `translate(-50%, -50%) rotate(${t.rotation || 0}deg)`,
              color: t.color,
              fontSize: t.fontSize,
              fontFamily: t.fontFamily || 'Inter, sans-serif',
              fontWeight: 700,
              textAlign: t.textAlign || 'center',
              background: t.bgColor || 'transparent',
              padding: t.bgColor ? '0.15em 0.4em' : 0,
              borderRadius: t.bgColor ? 8 : 0,
              WebkitTextStroke: t.strokeWidth ? `${t.strokeWidth}px ${t.strokeColor || '#000'}` : undefined,
              whiteSpace: 'pre-wrap',
              maxWidth: '90%',
              lineHeight: 1.15,
            }}
          >
            {t.text}
          </div>
        </AbsoluteFill>
      </Sequence>
    );
  }

  // overlay: sticker (emoji / image)
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
            <img src={s.imageUrl} alt="" style={{ width: 200, height: 'auto' }} />
          ) : (
            s.emoji
          )}
        </div>
      </AbsoluteFill>
    </Sequence>
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

  const video = (
    <OffthreadVideo
      src={m.sourceUrl}
      startFrom={f(m.sourceStart, fps)}
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

  const inner = (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
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
  return (
    <Sequence from={from} durationInFrames={dur} layout="none">
      <Audio src={clip.sourceUrl} startFrom={startFrom} endAt={startFrom + dur} volume={clip.volume ?? 1} />
    </Sequence>
  );
}
