'use client';

import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from 'remotion';
import { getStyle, type StyleId } from '@/lib/cosmicStyles';

// Deterministic star layout (no Math.random at frame time, so preview and a
// future server render stay identical).
function seeded(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: seeded(i + 1) * 1080,
  y: seeded(i + 7) * 1920,
  r: 1 + seeded(i + 13) * 2.4,
  phase: seeded(i + 21) * Math.PI * 2,
}));

export interface DailyForecastStudioProps {
  styleId: StyleId;
  risingSign: string;
  headline: string;
  forecastTitle: string;
  forecastSub: string;
  handle: string;
}

export const dailyForecastDefaults: DailyForecastStudioProps = {
  styleId: 'ethereal',
  risingSign: 'Sagittarius',
  headline: 'The sky is moving in your favour',
  forecastTitle: 'Moon trine Jupiter',
  forecastSub: 'a rare window for bold asks',
  handle: '@align.app',
};

const PLANETS = [
  { a: -50, r: 300, c: 'text' as const },
  { a: 40, r: 360, c: 'accent' as const },
  { a: 135, r: 300, c: 'accent2' as const },
  { a: 215, r: 360, c: 'subtext' as const },
];

export const DailyForecastStudio: React.FC<DailyForecastStudioProps> = (props) => {
  const { styleId, risingSign, headline, forecastTitle, forecastSub, handle } = props;
  const s = getStyle(styleId);
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const cx = width / 2;
  const wheelCy = height * 0.5;

  const drift = Math.sin(frame / 40) * 8 * s.motion;
  const label = s.uppercaseLabels ? { textTransform: 'uppercase' as const, letterSpacing: 4 } : {};

  // overall progress bar
  const prog = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(${s.bg[0]}, ${s.bg[1]})`, fontFamily: s.bodyFont }}>
      {/* starfield */}
      {STARS.map((st, i) => {
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frame / 18 + st.phase));
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: st.x, top: st.y,
              width: st.r, height: st.r, borderRadius: '50%',
              background: s.accent, opacity: tw * 0.7,
            }}
          />
        );
      })}

      {/* top label + kinetic headline */}
      <Sequence from={6}>
        <div style={{ position: 'absolute', top: 150, left: 90, right: 90 }}>
          <HeadlineBlock s={s} risingSign={risingSign} headline={headline} label={label} />
        </div>
      </Sequence>

      {/* animated chart wheel */}
      <Sequence from={24}>
        <Wheel s={s} cx={cx} cy={wheelCy + drift} frame={frame - 24} fps={fps} />
      </Sequence>

      {/* forecast line */}
      <Sequence from={70}>
        <div style={{ position: 'absolute', bottom: 360, left: 90, right: 90 }}>
          <ForecastBlock s={s} title={forecastTitle} sub={forecastSub} label={label} />
        </div>
      </Sequence>

      {/* watermark + progress */}
      <div style={{ position: 'absolute', bottom: 90, left: 90, right: 90 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <span style={{ color: s.subtext, fontSize: 30, ...label }}>{handle}</span>
          <span style={{ color: s.subtext, fontSize: 28 }}>align</span>
        </div>
        <div style={{ height: 6, background: s.line, borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${prog * 100}%`, height: 6, background: s.accent }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const HeadlineBlock: React.FC<{ s: ReturnType<typeof getStyle>; risingSign: string; headline: string; label: React.CSSProperties }> = ({ s, risingSign, headline, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inUp = spring({ frame, fps, config: { damping: 200 } });
  const op = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div style={{ transform: `translateY(${(1 - inUp) * 40}px)`, opacity: op }}>
      <div style={{ color: s.accent, fontSize: 34, marginBottom: 18, ...label }}>
        {risingSign} rising · today
      </div>
      <div style={{ color: s.text, fontSize: 76, lineHeight: 1.12, fontWeight: 500, fontFamily: s.headingFont }}>
        {headline}
      </div>
    </div>
  );
};

const ForecastBlock: React.FC<{ s: ReturnType<typeof getStyle>; title: string; sub: string; label: React.CSSProperties }> = ({ s, title, sub, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inUp = spring({ frame, fps, config: { damping: 200 } });
  return (
    <div style={{ transform: `translateY(${(1 - inUp) * 30}px)`, opacity: interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' }) }}>
      <div style={{ color: s.text, fontSize: 56, fontWeight: 500, fontFamily: s.headingFont }}>{title}</div>
      <div style={{ color: s.subtext, fontSize: 36, marginTop: 10, ...label }}>{sub}</div>
    </div>
  );
};

const Wheel: React.FC<{ s: ReturnType<typeof getStyle>; cx: number; cy: number; frame: number; fps: number }> = ({ s, cx, cy, frame }) => {
  const rOuter = 380;
  const rInner = 280;
  const rot = frame * 0.12 * s.motion;
  const reveal = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const aspectDraw = interpolate(frame, [20, 55], [0, 1], { extrapolateRight: 'clamp' });
  const colorFor = (c: 'text' | 'accent' | 'accent2' | 'subtext') => s[c];

  const pt = (a: number, r: number) => {
    const rad = ((a - 90 + rot) * Math.PI) / 180;
    return [cx + Math.cos(rad) * r, cy + Math.sin(rad) * r] as const;
  };

  return (
    <svg style={{ position: 'absolute', left: 0, top: 0 }} width="1080" height="1920" viewBox="0 0 1080 1920">
      <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke={s.line} strokeWidth={2}
        strokeDasharray={2 * Math.PI * rOuter} strokeDashoffset={(1 - reveal) * 2 * Math.PI * rOuter} />
      <circle cx={cx} cy={cy} r={rInner} fill="none" stroke={s.line} strokeWidth={1.5} opacity={0.7} />
      {Array.from({ length: 12 }, (_, i) => {
        const [x1, y1] = pt(i * 30, rInner);
        const [x2, y2] = pt(i * 30, rOuter);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={s.line} strokeWidth={1} opacity={0.5} />;
      })}
      {/* aspect lines */}
      <line {...lineProps(pt(PLANETS[0].a, 300), pt(PLANETS[2].a, 300))} stroke={s.accent} strokeWidth={2} opacity={aspectDraw * 0.9} />
      <line {...lineProps(pt(PLANETS[1].a, 360), pt(PLANETS[3].a, 360))} stroke={s.accent2} strokeWidth={2} opacity={aspectDraw * 0.8} />
      {/* planets */}
      {PLANETS.map((p, i) => {
        const [x, y] = pt(p.a, p.r);
        const pop = interpolate(frame, [10 + i * 4, 22 + i * 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return <circle key={i} cx={x} cy={y} r={14 * pop} fill={colorFor(p.c)} />;
      })}
    </svg>
  );
};

function lineProps(a: readonly [number, number], b: readonly [number, number]) {
  return { x1: a[0], y1: a[1], x2: b[0], y2: b[1] };
}
