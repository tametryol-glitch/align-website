'use client';

import React from 'react';
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from 'remotion';
import { getStyle, type StyleId, type CosmicStyle } from '@/lib/cosmicStyles';

const LOGO_URL = 'https://aligncosmic.com/logo.png';

// ── Astrology glyphs + aspect geometry (so the wheel is real) ──────────────
const SIGN_GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const PLANET_GLYPHS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂', jupiter: '♃',
  saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇', chiron: '⚷',
  ascendant: 'Asc', mc: 'MC', node: '☊',
};
const ASPECTS: Record<string, { angle: number; glyph: string }> = {
  conjunction: { angle: 0, glyph: '☌' }, conjunct: { angle: 0, glyph: '☌' },
  sextile: { angle: 60, glyph: '⚹' },
  square: { angle: 90, glyph: '□' },
  trine: { angle: 120, glyph: '△' },
  opposition: { angle: 180, glyph: '☍' }, opposite: { angle: 180, glyph: '☍' },
};

interface ParsedAspect {
  p1: string; p2: string; p1Glyph: string; p2Glyph: string;
  type: string; glyph: string; angle: number;
}

/** Turn "Moon trine Jupiter" into real geometry. Falls back to a conjunction. */
function parseAspect(title: string): ParsedAspect {
  const lower = (title || '').toLowerCase();
  let key = Object.keys(ASPECTS).find((k) => lower.includes(k)) || 'conjunction';
  const [a, b] = lower.split(key).map((s) => s.trim());
  const p1 = (a || 'moon').split(/\s+/).pop() || 'moon';
  const p2 = (b || 'jupiter').split(/\s+/)[0] || 'jupiter';
  const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
  return {
    p1: cap(p1), p2: cap(p2),
    p1Glyph: PLANET_GLYPHS[p1] || '●',
    p2Glyph: PLANET_GLYPHS[p2] || '●',
    type: key, glyph: ASPECTS[key].glyph, angle: ASPECTS[key].angle,
  };
}

function seeded(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: seeded(i + 1) * 1080, y: seeded(i + 7) * 1920,
  r: 1 + seeded(i + 13) * 2.4, phase: seeded(i + 21) * Math.PI * 2,
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

export const DailyForecastStudio: React.FC<DailyForecastStudioProps> = (props) => {
  const { styleId, risingSign, headline, forecastTitle, forecastSub, handle } = props;
  const s = getStyle(styleId);
  const aspect = parseAspect(forecastTitle);
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const drift = Math.sin(frame / 40) * 8 * s.motion;
  const label = s.uppercaseLabels ? { textTransform: 'uppercase' as const, letterSpacing: 4 } : {};
  const prog = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(${s.bg[0]}, ${s.bg[1]})`, fontFamily: s.bodyFont }}>
      {STARS.map((st, i) => {
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frame / 18 + st.phase));
        return <div key={i} style={{ position: 'absolute', left: st.x, top: st.y, width: st.r, height: st.r, borderRadius: '50%', background: s.accent, opacity: tw * 0.7 }} />;
      })}

      <Sequence from={6}>
        <div style={{ position: 'absolute', top: 150, left: 90, right: 90 }}>
          <HeadlineBlock s={s} risingSign={risingSign} headline={headline} label={label} />
        </div>
      </Sequence>

      <Sequence from={24}>
        <AspectWheel s={s} cx={width / 2} cy={height * 0.5 + drift} frame={frame - 24} aspect={aspect} />
      </Sequence>

      <Sequence from={70}>
        <div style={{ position: 'absolute', bottom: 360, left: 90, right: 90 }}>
          <ForecastBlock s={s} title={`${aspect.p1Glyph} ${aspect.p1} ${aspect.glyph} ${aspect.p2} ${aspect.p2Glyph}`} sub={forecastSub} label={label} />
        </div>
      </Sequence>

      <Watermark s={s} handle={handle} prog={prog} />
    </AbsoluteFill>
  );
};

const Watermark: React.FC<{ s: CosmicStyle; handle: string; prog: number }> = ({ s, handle, prog }) => (
  <div style={{ position: 'absolute', bottom: 90, left: 90, right: 90 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
      <Img src={LOGO_URL} style={{ width: 64, height: 64, borderRadius: 14 }} />
      <span style={{ color: s.subtext, fontSize: 30 }}>{handle}</span>
    </div>
    <div style={{ height: 6, background: s.line, borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${prog * 100}%`, height: 6, background: s.accent }} />
    </div>
  </div>
);

const HeadlineBlock: React.FC<{ s: CosmicStyle; risingSign: string; headline: string; label: React.CSSProperties }> = ({ s, risingSign, headline, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inUp = spring({ frame, fps, config: { damping: 200 } });
  const op = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div style={{ transform: `translateY(${(1 - inUp) * 40}px)`, opacity: op }}>
      <div style={{ color: s.accent, fontSize: 34, marginBottom: 18, ...label }}>{risingSign} rising · today</div>
      <div style={{ color: s.text, fontSize: 76, lineHeight: 1.12, fontWeight: 500, fontFamily: s.headingFont }}>{headline}</div>
    </div>
  );
};

const ForecastBlock: React.FC<{ s: CosmicStyle; title: string; sub: string; label: React.CSSProperties }> = ({ s, title, sub, label }) => {
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

/** A real zodiac ring with the two aspecting planets placed at the correct
 *  angular separation and the aspect line drawn between them. */
const AspectWheel: React.FC<{ s: CosmicStyle; cx: number; cy: number; frame: number; aspect: ParsedAspect }> = ({ s, cx, cy, frame, aspect }) => {
  const rOuter = 380, rInner = 300, rBand = 340, rPlanet = 250;
  const reveal = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const signFade = interpolate(frame, [18, 38], [0, 1], { extrapolateRight: 'clamp' });
  const aspectDraw = interpolate(frame, [40, 70], [0, 1], { extrapolateRight: 'clamp' });

  // longitude (0=Aries) → screen point. 0° at top, increasing clockwise.
  const toXY = (lon: number, r: number) => {
    const rad = ((lon - 90) * Math.PI) / 180;
    return [cx + Math.cos(rad) * r, cy + Math.sin(rad) * r] as const;
  };
  const p1Lon = 40; // Taurus ~10°
  const p2Lon = (p1Lon + aspect.angle) % 360;
  const [x1, y1] = toXY(p1Lon, rPlanet);
  const [x2, y2] = toXY(p2Lon, rPlanet);
  const [mx, my] = [(x1 + x2) / 2, (y1 + y2) / 2];

  return (
    <svg style={{ position: 'absolute', left: 0, top: 0 }} width="1080" height="1920" viewBox="0 0 1080 1920">
      <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke={s.line} strokeWidth={2}
        strokeDasharray={2 * Math.PI * rOuter} strokeDashoffset={(1 - reveal) * 2 * Math.PI * rOuter} />
      <circle cx={cx} cy={cy} r={rInner} fill="none" stroke={s.line} strokeWidth={1.5} opacity={0.7} />
      {/* 12 sign spokes + glyphs */}
      {Array.from({ length: 12 }, (_, i) => {
        const [sx1, sy1] = toXY(i * 30, rInner);
        const [sx2, sy2] = toXY(i * 30, rOuter);
        const [gx, gy] = toXY(i * 30 + 15, rBand);
        return (
          <g key={i}>
            <line x1={sx1} y1={sy1} x2={sx2} y2={sy2} stroke={s.line} strokeWidth={1} opacity={0.5} />
            <text x={gx} y={gy + 16} fill={s.subtext} fontSize={40} textAnchor="middle" opacity={signFade}>{SIGN_GLYPHS[i]}</text>
          </g>
        );
      })}
      {/* the aspect line */}
      <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * aspectDraw} y2={y1 + (y2 - y1) * aspectDraw} stroke={s.accent} strokeWidth={3} />
      {aspectDraw > 0.5 && (
        <>
          <circle cx={mx} cy={my} r={30} fill={s.bg[1]} stroke={s.accent} strokeWidth={2} opacity={(aspectDraw - 0.5) * 2} />
          <text x={mx} y={my + 12} fill={s.accent} fontSize={34} textAnchor="middle" opacity={(aspectDraw - 0.5) * 2}>{aspect.glyph}</text>
        </>
      )}
      {/* the two planets */}
      {[{ x: x1, y: y1, g: aspect.p1Glyph, d: 10 }, { x: x2, y: y2, g: aspect.p2Glyph, d: 16 }].map((p, i) => {
        const pop = interpolate(frame, [p.d, p.d + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
          <g key={i} opacity={pop}>
            <circle cx={p.x} cy={p.y} r={34} fill={s.bg[0]} stroke={s.accent} strokeWidth={2} />
            <text x={p.x} y={p.y + 15} fill={s.text} fontSize={42} textAnchor="middle">{p.g}</text>
          </g>
        );
      })}
    </svg>
  );
};
