'use client';

/**
 * Cover art for the Cosmic Video template cards — each one previews the look of
 * the real render (same signature palette, constellation / wheel / moon motifs)
 * instead of a flat emoji on a grey card.
 */
import type { TemplateId } from '@/lib/cosmicVideoService';

const PALETTE: Record<string, { bg: [string, string, string]; accent: string; accent2: string }> = {
  chart_reveal: { bg: ['#07041A', '#1A0F4D', '#4C1D95'], accent: '#C4B5FD', accent2: '#F0ABFC' },
  daily_forecast: { bg: ['#040A22', '#0B1F5E', '#1D4ED8'], accent: '#9CC4FF', accent2: '#FDE68A' },
  transit_alert: { bg: ['#10021C', '#3B0764', '#7E22CE'], accent: '#F5B8FF', accent2: '#FCD34D' },
  compatibility_check: { bg: ['#14030F', '#4A044E', '#BE185D'], accent: '#FBCFE8', accent2: '#FDE68A' },
  zodiac_personality: { bg: ['#03120A', '#0B3B22', '#15803D'], accent: '#86EFAC', accent2: '#FDE68A' },
};

const STARS = Array.from({ length: 26 }, (_, i) => ({
  x: (Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) % 1,
  y: (Math.sin(i * 78.233 + 3) * 24634.6345 % 1 + 1) % 1,
  r: 0.6 + ((i * 7) % 5) * 0.35,
  o: 0.35 + ((i * 3) % 6) * 0.1,
}));

const TAURUS = {
  stars: [[14, 72], [30, 60], [44, 52], [58, 48], [72, 34], [90, 20], [70, 60], [88, 72]] as Array<[number, number]>,
  lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [3, 6], [6, 7]] as Array<[number, number]>,
};

function Motif({ id, accent, accent2 }: { id: string; accent: string; accent2: string }) {
  switch (id) {
    case 'chart_reveal':
      return (
        <g transform="translate(200 100)">
          <g>
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="90s" repeatCount="indefinite" />
            <circle r="78" fill="none" stroke={accent} strokeWidth="1.6" opacity="0.85" />
            <circle r="62" fill="none" stroke={accent} strokeWidth="0.8" opacity="0.5" />
            <circle r="40" fill="none" stroke={accent} strokeWidth="0.6" opacity="0.3" />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i * 30 * Math.PI) / 180;
              return <line key={i} x1={Math.cos(a) * 62} y1={Math.sin(a) * 62} x2={Math.cos(a) * 78} y2={Math.sin(a) * 78} stroke={accent} strokeWidth="1" opacity="0.6" />;
            })}
            {[[0.4, 50, '#FFC857'], [2.2, 50, '#DDE6F7'], [3.6, 50, '#FF9EC4'], [5.1, 50, '#FF6B5A']].map(([a, r, c], i) => (
              <circle key={i} cx={Math.cos(a as number) * (r as number)} cy={Math.sin(a as number) * (r as number)} r="6" fill={c as string} />
            ))}
            <path d="M-24 -30 L30 18 M30 18 L-40 24" stroke={accent2} strokeWidth="1.2" opacity="0.7" />
          </g>
        </g>
      );
    case 'daily_forecast':
      return (
        <g transform="translate(200 100)">
          <circle r="92" fill={accent} opacity="0.1" />
          <circle r="64" fill={accent} opacity="0.12" />
          <circle r="46" fill="#F1ECDD" />
          <circle cx="-22" cy="0" r="46" fill="#0b1f5e" opacity="0.92" transform="translate(-6 0)" />
          <circle cx="12" cy="-14" r="6" fill="#A9A28C" opacity="0.3" />
          <circle cx="22" cy="12" r="4" fill="#A9A28C" opacity="0.3" />
          <circle r="46" fill="none" stroke={accent2} strokeWidth="1" opacity="0.5" />
        </g>
      );
    case 'transit_alert':
      return (
        <g transform="translate(200 100)">
          <circle r="84" fill="none" stroke={accent2} strokeWidth="1.4" opacity="0.4" strokeDasharray="3 6" />
          <line x1="-62" y1="0" x2="62" y2="0" stroke={accent} strokeWidth="2.4" opacity="0.8" />
          <circle cx="-62" r="16" fill="#FFC857" />
          <circle cx="62" r="16" fill="#DDE6F7" />
          <circle r="13" fill="#10021C" stroke={accent2} strokeWidth="2" />
          <path d="M0 -7 L8 6 L-8 6Z" fill="none" stroke={accent2} strokeWidth="1.6" strokeLinejoin="round" />
        </g>
      );
    case 'compatibility_check':
      return (
        <g transform="translate(200 100)">
          <circle cx="-26" r="46" fill="#FFC857" opacity="0.28" />
          <circle cx="26" r="46" fill="#F5B8FF" opacity="0.28" />
          <circle cx="-26" r="46" fill="none" stroke={accent} strokeWidth="1.4" />
          <circle cx="26" r="46" fill="none" stroke={accent} strokeWidth="1.4" />
          <circle r="7" fill="#fff" />
        </g>
      );
    default:
      return (
        <g transform="translate(116 22) scale(1.7)">
          {TAURUS.lines.map(([a, b], i) => (
            <line key={i} x1={TAURUS.stars[a][0]} y1={TAURUS.stars[a][1]} x2={TAURUS.stars[b][0]} y2={TAURUS.stars[b][1]} stroke={accent} strokeWidth="0.9" opacity="0.9" />
          ))}
          {TAURUS.stars.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={i === 3 ? 7 : 4} fill={accent} opacity="0.25" />
              <circle cx={x} cy={y} r={i === 3 ? 2.6 : 1.7} fill="#fff" />
            </g>
          ))}
        </g>
      );
  }
}

export function TemplateArt({ id }: { id: TemplateId | string }) {
  const p = PALETTE[id] || PALETTE.chart_reveal;
  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '2 / 1' }}>
      <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id={`ta-bg-${id}`} cx="50%" cy="108%" r="130%">
            <stop offset="0%" stopColor={p.bg[2]} />
            <stop offset="45%" stopColor={p.bg[1]} />
            <stop offset="100%" stopColor={p.bg[0]} />
          </radialGradient>
          <radialGradient id={`ta-glow-${id}`}>
            <stop offset="0%" stopColor={p.accent} stopOpacity="0.28" />
            <stop offset="100%" stopColor={p.accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="200" fill={`url(#ta-bg-${id})`} />
        <circle cx="200" cy="100" r="130" fill={`url(#ta-glow-${id})`} />
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x * 400} cy={s.y * 200} r={s.r} fill="#fff" opacity={s.o} />
        ))}
        <Motif id={id} accent={p.accent} accent2={p.accent2} />
      </svg>
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
    </div>
  );
}
