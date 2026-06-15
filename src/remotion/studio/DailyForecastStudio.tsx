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
// Clean text labels (no emoji) + element-based neon colours, in the spirit of
// the reference chart template. Ornate glyph symbols come later via a font.
const SIGN_ABBR = ['ARI', 'TAU', 'GEM', 'CAN', 'LEO', 'VIR', 'LIB', 'SCO', 'SAG', 'CAP', 'AQU', 'PIS'];
// fire, earth, air, water — signs cycle in this order from Aries (i % 4)
const ELEMENT_NEON = ['#FF7A7A', '#E7B85C', '#6FC9FF', '#9AA6FF'];
const elColor = (i: number) => ELEMENT_NEON[i % 4];
const ANGLES = [
  { lbl: 'MC', dx: 0, dy: -1 },
  { lbl: 'DSC', dx: 1, dy: 0 },
  { lbl: 'IC', dx: 0, dy: 1 },
  { lbl: 'ASC', dx: -1, dy: 0 },
];
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
        <div style={{ position: 'absolute', top: 230, left: 90, right: 90 }}>
          <HeadlineBlock s={s} risingSign={risingSign} headline={headline} label={label} />
        </div>
      </Sequence>

      <Sequence from={24}>
        <AspectWheel s={s} cx={width / 2} cy={height * 0.455 + drift} frame={frame - 24} aspect={aspect} />
      </Sequence>

      <Sequence from={70}>
        <div style={{ position: 'absolute', bottom: 430, left: 90, right: 90 }}>
          <ForecastBlock s={s} title={`${aspect.p1} ${aspect.glyph} ${aspect.p2}`} sub={forecastSub} label={label} />
        </div>
      </Sequence>

      <Watermark s={s} handle={handle} prog={prog} />
    </AbsoluteFill>
  );
};

const Watermark: React.FC<{ s: CosmicStyle; handle: string; prog: number }> = ({ s, handle, prog }) => (
  <div style={{ position: 'absolute', bottom: 180, left: 90, right: 90 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
      <Img src={LOGO_URL} style={{ width: 92, height: 92, borderRadius: 20 }} />
      <span style={{ color: s.text, fontSize: 34, fontWeight: 500 }}>{handle}</span>
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

/** Chart wheel in the reference-template structure: gold/neon concentric rings,
 *  12 sign segments (element-coloured labels), house numbers, ASC/MC/DSC/IC
 *  angles, and the spotlight aspect drawn between its two planets. Continuous
 *  slow rotation keeps it alive; no emoji. */
const AspectWheel: React.FC<{ s: CosmicStyle; cx: number; cy: number; frame: number; aspect: ParsedAspect }> = ({ s, cx, cy, frame, aspect }) => {
  const rOuter = 388, rSign = 300, rHouse = 212, rPlanet = 150;
  const rSignLbl = (rSign + rOuter) / 2;
  const rHouseLbl = (rHouse + rSign) / 2;
  const reveal = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const labelFade = interpolate(frame, [18, 40], [0, 1], { extrapolateRight: 'clamp' });
  const aspectDraw = interpolate(frame, [40, 70], [0, 1], { extrapolateRight: 'clamp' });
  const rot = frame * 0.06 * s.motion; // continuous slow spin — keeps it living

  const toXY = (lon: number, r: number) => {
    const rad = ((lon - 90 + rot) * Math.PI) / 180;
    return [cx + Math.cos(rad) * r, cy + Math.sin(rad) * r] as const;
  };
  const p1Lon = 40;
  const p2Lon = (p1Lon + aspect.angle) % 360;
  const [x1, y1] = toXY(p1Lon, rPlanet);
  const [x2, y2] = toXY(p2Lon, rPlanet);
  const [mx, my] = [(x1 + x2) / 2, (y1 + y2) / 2];

  return (
    <svg style={{ position: 'absolute', left: 0, top: 0 }} width="1080" height="1920" viewBox="0 0 1080 1920">
      {/* concentric rings */}
      <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke={s.accent} strokeWidth={2} opacity={0.55}
        strokeDasharray={2 * Math.PI * rOuter} strokeDashoffset={(1 - reveal) * 2 * Math.PI * rOuter} />
      <circle cx={cx} cy={cy} r={rSign} fill="none" stroke={s.line} strokeWidth={1.5} opacity={0.7} />
      <circle cx={cx} cy={cy} r={rHouse} fill="none" stroke={s.line} strokeWidth={1.25} opacity={0.55} />

      {/* 12 segments: spokes, sign labels, house numbers */}
      {Array.from({ length: 12 }, (_, i) => {
        const [sx1, sy1] = toXY(i * 30, rHouse);
        const [sx2, sy2] = toXY(i * 30, rOuter);
        const [lx, ly] = toXY(i * 30 + 15, rSignLbl);
        const [hx, hy] = toXY(i * 30 + 15, rHouseLbl);
        return (
          <g key={i} opacity={labelFade}>
            <line x1={sx1} y1={sy1} x2={sx2} y2={sy2} stroke={s.line} strokeWidth={1} opacity={0.45} />
            <text x={lx} y={ly + 11} fill={elColor(i)} fontSize={30} fontWeight={500} letterSpacing={2} textAnchor="middle">{SIGN_ABBR[i]}</text>
            <text x={hx} y={hy + 9} fill={s.subtext} fontSize={24} opacity={0.55} textAnchor="middle">{i + 1}</text>
          </g>
        );
      })}

      {/* chart angles — fixed at the screen cardinals (don't rotate) */}
      {ANGLES.map((a) => (
        <text key={a.lbl} x={cx + a.dx * (rOuter + 30)} y={cy + a.dy * (rOuter + 38) + 8}
          fill={s.accent} fontSize={26} fontWeight={500} letterSpacing={3} textAnchor="middle" opacity={reveal}>{a.lbl}</text>
      ))}

      {/* spotlight aspect */}
      <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * aspectDraw} y2={y1 + (y2 - y1) * aspectDraw} stroke={s.accent} strokeWidth={3} />
      {aspectDraw > 0.5 && (
        <>
          <circle cx={mx} cy={my} r={30} fill={s.bg[1]} stroke={s.accent} strokeWidth={2} opacity={(aspectDraw - 0.5) * 2} />
          <text x={mx} y={my + 12} fill={s.accent} fontSize={34} textAnchor="middle" opacity={(aspectDraw - 0.5) * 2}>{aspect.glyph}</text>
        </>
      )}
      {[{ x: x1, y: y1, name: aspect.p1, d: 10 }, { x: x2, y: y2, name: aspect.p2, d: 16 }].map((p, i) => {
        const pop = interpolate(frame, [p.d, p.d + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
          <g key={i} opacity={pop}>
            <circle cx={p.x} cy={p.y} r={14} fill={s.text} stroke={s.accent} strokeWidth={2} />
            <text x={p.x} y={p.y - 26} fill={s.text} fontSize={26} fontWeight={500} textAnchor="middle">{p.name}</text>
          </g>
        );
      })}
    </svg>
  );
};
