'use client';

/**
 * MultiTrackComposition (Phase 3) — renders the positioned multi-track timeline
 * (TimelineState) as a Remotion composition, for both the in-editor WYSIWYG
 * preview and (Phase 4) the server render. Each clip is a <Sequence> at its
 * absolute start, so GAPS naturally show the black background, multiple audio
 * tracks mix, and video/text/overlay lanes stack by track order (order 0 = front).
 */

import React from 'react';
import { AbsoluteFill, OffthreadVideo, Audio, Sequence, useVideoConfig } from 'remotion';
import type {
  TimelineState, TimelineClip, MediaClip, TextClip, StickerClip, TimelineTrack,
} from '@/lib/editor/timelineModel';

const f = (sec: number, fps: number) => Math.round(sec * fps);

export const MultiTrackComposition: React.FC<{ timeline?: TimelineState }> = ({ timeline }) => {
  const { fps } = useVideoConfig();
  if (!timeline || timeline.clips.length === 0) {
    return <AbsoluteFill style={{ background: '#0D0A24' }} />;
  }

  const clipsOf = (trackId: string) => timeline.clips.filter((c) => c.trackId === trackId);
  // Visual lanes: order 0 = front, so render back-to-front (highest order first).
  const visual = timeline.tracks
    .filter((t) => t.kind !== 'audio' && !t.hidden)
    .sort((a, b) => b.order - a.order);
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
    const isPip = track.kind === 'overlay' || (m.scale != null && m.scale < 1);
    const video = (
      <OffthreadVideo
        src={m.sourceUrl}
        startFrom={f(m.sourceStart, fps)}
        muted={track.muted || m.volume === 0}
        volume={m.volume ?? 1}
        style={{ width: '100%', height: '100%', objectFit: isPip ? 'contain' : 'cover', display: 'block' }}
      />
    );
    return (
      <Sequence from={from} durationInFrames={dur} layout="none">
        {isPip ? (
          <AbsoluteFill>
            <div style={pipStyle(m)}>{video}</div>
          </AbsoluteFill>
        ) : (
          <AbsoluteFill>{video}</AbsoluteFill>
        )}
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
