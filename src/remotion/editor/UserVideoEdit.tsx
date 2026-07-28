/**
 * UserVideoEdit (web mirror) — the SAME composition align-video-renderer renders
 * on the server, used here to drive the editor's WYSIWYG @remotion/player
 * preview. What you see here is what the server posts.
 *
 * Body MUST stay in sync with
 * align-video-renderer/src/remotion/templates/UserVideoEdit.tsx.
 * The only intentional differences: the spec types are imported from
 * '@/lib/videoEditSpec' (web's single source of truth) and the component reads
 * the spec from inputProps.customizations.editSpec exactly like the server.
 */
import React from 'react';
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import type {
  VideoEditSpec,
  EditTextOverlay,
  EditSegment,
  EditTransition,
  EditFilterId,
} from '@/lib/videoEditSpec';

// CSS grades — MUST stay in sync with align-web/src/lib/videoFilters.ts
const FILTER_CSS: Record<string, string> = {
  clean: 'contrast(1.08) saturate(1.14)',
  vivid: 'contrast(1.16) saturate(1.5) brightness(1.02)',
  y2k: 'contrast(1.18) saturate(1.4) hue-rotate(-8deg) brightness(1.03)',
  cinematic: 'contrast(1.12) saturate(1.12) sepia(0.08) hue-rotate(-6deg)',
  bleach: 'saturate(0.55) contrast(1.35) brightness(1.02)',
  warm: 'sepia(0.28) saturate(1.25) brightness(1.04) contrast(1.03)',
  sunset: 'sepia(0.16) saturate(1.22) hue-rotate(-10deg) brightness(1.04)',
  cool: 'saturate(0.96) brightness(1.04) contrast(1.05) hue-rotate(12deg)',
  moody: 'contrast(1.12) saturate(0.78) brightness(0.95) hue-rotate(10deg)',
  vintage: 'contrast(0.9) saturate(0.82) sepia(0.22) brightness(1.05)',
  vhs: 'contrast(0.95) saturate(1.18) hue-rotate(-6deg) brightness(1.02)',
  moss: 'saturate(0.85) contrast(0.95) sepia(0.12) hue-rotate(25deg) brightness(1.02)',
  cosmic: 'contrast(1.2) saturate(1.35) hue-rotate(-14deg)',
  infrared: 'saturate(1.3) hue-rotate(-25deg) contrast(1.08)',
  dreamy: 'contrast(0.9) saturate(1.06) brightness(1.08) blur(0.3px)',
  bw: 'grayscale(1) contrast(1.2) brightness(1.02)',
};

const CSS_IDENTITY: Record<string, number> = {
  contrast: 1, saturate: 1, brightness: 1, opacity: 1,
  sepia: 0, grayscale: 0, invert: 0, 'hue-rotate': 0, blur: 0,
};

function filterCss(id: EditFilterId | undefined, k: number): string {
  if (!id || id === 'none') return '';
  const css = FILTER_CSS[id];
  if (!css) return '';
  const i = Math.max(0, Math.min(1, k));
  if (i >= 0.999) return css;
  return css.replace(/([\w-]+)\(([^)]+)\)/g, (m, fn: string, val: string) => {
    const num = parseFloat(val);
    if (Number.isNaN(num)) return m;
    const unit = val.trim().replace(/^-?[\d.]+/, '');
    const idv = CSS_IDENTITY[fn] ?? 1;
    return `${fn}(${(idv + (num - idv) * i).toFixed(3).replace(/\.?0+$/, '') || '0'}${unit})`;
  });
}

function adjustCss(spec: VideoEditSpec): string {
  const b = spec.adjustBrightness || 0;
  const c = spec.adjustContrast || 0;
  const s = spec.adjustSaturation || 0;
  const w = spec.adjustWarmth || 0;
  const parts: string[] = [];
  if (b) parts.push(`brightness(${(1 + b * 0.5).toFixed(3)})`);
  if (c) parts.push(`contrast(${(1 + c * 0.5).toFixed(3)})`);
  if (s) parts.push(`saturate(${(1 + s * 0.8).toFixed(3)})`);
  if (w > 0) {
    parts.push(`sepia(${(w * 0.3).toFixed(3)})`);
    parts.push(`hue-rotate(${(-w * 6).toFixed(1)}deg)`);
  } else if (w < 0) {
    parts.push(`hue-rotate(${(-w * 14).toFixed(1)}deg)`);
    parts.push(`saturate(${(1 + -w * 0.1).toFixed(3)})`);
  }
  return parts.join(' ');
}

function combinedCss(spec: VideoEditSpec): string {
  const preset = filterCss(spec.filter, spec.filterIntensity ?? 1);
  const adj = adjustCss(spec);
  const out = [preset, adj].filter(Boolean).join(' ');
  return out || 'none';
}

interface SegEntry { seg: EditSegment; s: number; fromFrame: number; outFrames: number; }

function buildSegTimeline(segments: EditSegment[], fps: number): SegEntry[] {
  let outFrame = 0;
  const out: SegEntry[] = [];
  for (const seg of segments) {
    const s = seg.speed && seg.speed > 0 ? seg.speed : 1;
    const srcLen = Math.max(0, (seg.sourceEnd || 0) - (seg.sourceStart || 0));
    const outFrames = Math.max(1, Math.round((srcLen / s) * fps));
    out.push({ seg, s, fromFrame: outFrame, outFrames });
    outFrame += outFrames;
  }
  return out;
}

function segAtFrame(tl: SegEntry[], frame: number): SegEntry {
  for (const e of tl) if (frame >= e.fromFrame && frame < e.fromFrame + e.outFrames) return e;
  return tl[tl.length - 1];
}

function srcTimeToOutFrame(tl: SegEntry[], srcT: number, fps: number): number | null {
  for (const e of tl) {
    const segStart = e.seg.sourceStart || 0;
    const segEnd = e.seg.sourceEnd || 0;
    if (srcT >= segStart && srcT <= segEnd) {
      return e.fromFrame + Math.round(((srcT - segStart) / e.s) * fps);
    }
  }
  return null;
}

const FALLBACK_LOGO = 'https://aligncosmic.com/logo.png';

export const UserVideoEdit: React.FC<{ customizations?: { editSpec?: VideoEditSpec } }> = ({ customizations }) => {
  const spec = customizations?.editSpec;
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  if (!spec || !spec.sourceVideoUrl) {
    return <AbsoluteFill style={{ background: '#0D0A24' }} />;
  }

  const trimStart = Math.max(0, spec.trimStart || 0);
  const speed = spec.speed && spec.speed > 0 ? spec.speed : 1;
  const css = combinedCss(spec);

  const segments = spec.segments && spec.segments.length > 0 ? spec.segments : null;
  const segTimeline = segments ? buildSegTimeline(segments, fps) : null;

  let sourceTime: number;
  if (segTimeline) {
    const cur = segAtFrame(segTimeline, frame);
    sourceTime = (cur.seg.sourceStart || 0) + ((frame - cur.fromFrame) / fps) * cur.s;
  } else {
    sourceTime = trimStart + (frame / fps) * speed;
  }

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {segTimeline ? (
        segTimeline.map((e) => (
          <Sequence key={e.seg.id} from={e.fromFrame} durationInFrames={e.outFrames} layout="none">
            <AbsoluteFill style={{ filter: css }}>
              <OffthreadVideo
                src={spec.sourceVideoUrl}
                startFrom={Math.round((e.seg.sourceStart || 0) * fps)}
                endAt={Math.max(Math.round((e.seg.sourceStart || 0) * fps) + 1, Math.round((e.seg.sourceEnd || 0) * fps))}
                playbackRate={e.s}
                volume={spec.originalAudioVolume ?? 1}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </AbsoluteFill>
          </Sequence>
        ))
      ) : (
        <AbsoluteFill style={{ filter: css }}>
          <OffthreadVideo
            src={spec.sourceVideoUrl}
            startFrom={Math.round(trimStart * fps)}
            playbackRate={speed}
            volume={spec.originalAudioVolume ?? 1}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </AbsoluteFill>
      )}

      {spec.musicUrl ? (
        <Audio
          src={spec.musicUrl}
          startFrom={spec.musicTrimStart != null ? Math.round(spec.musicTrimStart * fps) : undefined}
          endAt={spec.musicTrimEnd != null ? Math.round(spec.musicTrimEnd * fps) : undefined}
          volume={spec.musicVolume ?? 0.3}
        />
      ) : null}

      {(spec.brollClips || []).map((b) => {
        let fromFrame: number;
        let segSpeed = speed;
        if (segTimeline) {
          const f = srcTimeToOutFrame(segTimeline, b.timelineStart, fps);
          if (f == null) return null;
          fromFrame = f;
          segSpeed = segAtFrame(segTimeline, f).s;
        } else {
          fromFrame = Math.max(0, Math.round(((b.timelineStart - trimStart) / speed) * fps));
        }
        const durFrames = Math.max(1, Math.round((b.duration / segSpeed) * fps));
        const left = (b.x / 100) * width;
        const top = (b.y / 100) * height;
        const w = Math.max(0.1, b.scale) * width;
        const rot = b.rotation || 0;
        return (
          <Sequence key={b.id} from={fromFrame} durationInFrames={durFrames} layout="none">
            <div style={{ position: 'absolute', left, top, width: w, transform: `translate(-50%, -50%) rotate(${rot}deg)`, opacity: b.opacity ?? 1, borderRadius: 14, overflow: 'hidden', boxShadow: '0 6px 28px rgba(0,0,0,0.45)' }}>
              <OffthreadVideo src={b.sourceUrl} startFrom={Math.round((b.sourceStart || 0) * fps)} muted style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          </Sequence>
        );
      })}

      {(spec.stickerOverlays || []).map((st) => {
        if (sourceTime < st.startTime || sourceTime > st.endTime) return null;
        const left = (st.x / 100) * width;
        const top = (st.y / 100) * height;
        const transform = `translate(-50%, -50%) scale(${st.scale}) rotate(${st.rotation || 0}deg)`;
        return (
          <div key={st.id} style={{ position: 'absolute', left, top, transform }}>
            {st.imageUrl
              ? <Img src={st.imageUrl} style={{ width: 160, height: 160 }} />
              : <span style={{ fontSize: 120, lineHeight: 1 }}>{st.emoji}</span>}
          </div>
        );
      })}

      {(spec.textOverlays || []).map((o) => (
        <TextLayer key={o.id} o={o} sourceTime={sourceTime} frame={frame} fps={fps} width={width} height={height} />
      ))}

      {(spec.transitions || []).map((t) => (
        <TransitionOverlay key={t.id} t={t} frame={frame} fps={fps} width={width} height={height} />
      ))}

      <div style={{ position: 'absolute', bottom: 170, left: 90, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Img src={spec.watermarkLogoUrl || FALLBACK_LOGO} style={{ width: 72, height: 72, borderRadius: 16 }} />
        {spec.watermarkHandle ? (
          <span style={{ color: '#fff', fontSize: 30, fontWeight: 500, textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>{spec.watermarkHandle}</span>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

const TransitionOverlay: React.FC<{ t: EditTransition; frame: number; fps: number; width: number; height: number }> = ({ t, frame, fps }) => {
  const durF = Math.max(1, Math.round(((t.durationMs || 400) / 1000) * fps));
  const centerF = Math.round((t.atTime || 0) * fps);
  const startF = centerF - Math.round(durF / 2);
  const p = (frame - startF) / durF;
  if (p < 0 || p > 1) return null;
  const env = 1 - Math.abs(p - 0.5) * 2;

  switch (t.type) {
    case 'fade-black':
      return <AbsoluteFill style={{ background: '#000', opacity: env }} />;
    case 'crossfade':
      return <AbsoluteFill style={{ background: '#000', opacity: env * 0.35 }} />;
    case 'slide-left':
      return <AbsoluteFill style={{ background: '#000', transform: `translateX(${((1 - p) * 200 - 100).toFixed(2)}%)` }} />;
    case 'zoom-blur':
      return <AbsoluteFill style={{ opacity: env, transform: `scale(${1 + env * 0.18})`, background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.0) 30%, rgba(255,255,255,0.55) 100%)' }} />;
    case 'glitch':
      return (
        <AbsoluteFill style={{ opacity: env }}>
          <AbsoluteFill style={{ background: 'rgba(255,0,80,0.35)', transform: `translateX(${(env * 12).toFixed(1)}px)`, mixBlendMode: 'screen' }} />
          <AbsoluteFill style={{ background: 'rgba(0,200,255,0.35)', transform: `translateX(${(-env * 12).toFixed(1)}px)`, mixBlendMode: 'screen' }} />
        </AbsoluteFill>
      );
    case 'cosmic-wipe':
      return <AbsoluteFill style={{ background: 'linear-gradient(90deg,#7C3AED,#EC4899)', transform: `translateX(${((1 - p) * 200 - 100).toFixed(2)}%)` }} />;
    default:
      return null;
  }
};

const KARAOKE_HI = '#FFD60A';
const WORD_ANIMS = ['word-pop', 'karaoke', 'typewriter'];

const TextLayer: React.FC<{ o: EditTextOverlay; sourceTime: number; frame: number; fps: number; width: number; height: number }> = ({ o, sourceTime, fps, width, height }) => {
  if (sourceTime < o.startTime || sourceTime > o.endTime) return null;
  const localFrame = Math.max(0, Math.round((sourceTime - o.startTime) * fps));
  const t = localFrame / fps;
  const wordLevel = WORD_ANIMS.includes(o.animation || '');

  const left = (o.x / 100) * width;
  const top = (o.y / 100) * height;

  const baseTextStyle: React.CSSProperties = {
    color: o.color, fontSize: o.fontSize, fontWeight: 600,
    fontFamily: o.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    WebkitTextStroke: o.strokeWidth ? `${o.strokeWidth}px ${o.strokeColor || '#000'}` : undefined,
    textShadow: o.bgColor ? undefined : '0 2px 10px rgba(0,0,0,0.45)',
    lineHeight: 1.15,
  };

  if (wordLevel) {
    const words = o.text.split(/\s+/).filter(Boolean);
    const slice = Math.max(0.15, (o.endTime - o.startTime) / Math.max(1, words.length));
    const activeIdx = Math.floor(t / slice);
    return (
      <div
        style={{
          position: 'absolute', left, top,
          transform: `translate(-50%, -50%) rotate(${o.rotation || 0}deg)`,
          maxWidth: width * 0.86, textAlign: 'center',
          background: o.bgColor || 'transparent',
          padding: o.bgColor ? '8px 18px' : 0, borderRadius: o.bgColor ? 12 : 0,
          ...baseTextStyle,
          display: 'flex', flexWrap: 'wrap', gap: '0.25em', justifyContent: 'center',
        }}
      >
        {words.map((w, i) => {
          let s: React.CSSProperties = { display: 'inline-block' };
          if (o.animation === 'word-pop') {
            const at = i * 0.12;
            const pr = Math.max(0, Math.min(1, (t - at) / 0.18));
            s = { display: 'inline-block', opacity: pr, transform: `translateY(${(1 - pr) * -14}px) scale(${0.7 + 0.3 * pr})` };
          } else if (o.animation === 'typewriter') {
            s = { display: 'inline-block', opacity: t >= i * 0.16 ? 1 : 0 };
          } else if (o.animation === 'karaoke') {
            const active = i === activeIdx;
            s = { display: 'inline-block', color: active ? KARAOKE_HI : undefined, transform: active ? 'scale(1.08)' : 'scale(1)' };
          }
          return <span key={i} style={s}>{w}</span>;
        })}
      </div>
    );
  }

  let opacity = 1;
  let translateY = 0;
  let scale = 1;
  switch (o.animation) {
    case 'fade': opacity = interpolate(localFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }); break;
    case 'slide':
      translateY = 45 * Math.max(0, 1 - t / 0.4);
      opacity = interpolate(localFrame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
      break;
    case 'scale': {
      const intro = spring({ frame: localFrame, fps, config: { damping: 200 } });
      scale = 0.6 + 0.4 * intro; opacity = intro; break;
    }
    case 'bounce':
      translateY = -40 * Math.exp(-4 * t) * Math.sin(9 * t);
      opacity = interpolate(localFrame, [0, 6], [0, 1], { extrapolateRight: 'clamp' });
      break;
    default: break;
  }

  return (
    <div
      style={{
        position: 'absolute', left, top,
        transform: `translate(-50%, -50%) translateY(${translateY}px) rotate(${o.rotation || 0}deg) scale(${scale})`,
        opacity, maxWidth: width * 0.86, textAlign: o.textAlign || 'center',
        background: o.bgColor || 'transparent',
        padding: o.bgColor ? '8px 18px' : 0, borderRadius: o.bgColor ? 12 : 0,
        ...baseTextStyle,
        whiteSpace: 'pre-wrap',
      }}
    >
      {o.text}
    </div>
  );
};
