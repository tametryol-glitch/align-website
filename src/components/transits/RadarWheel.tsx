'use client';

import React, { useMemo } from 'react';
import {
  type RadarHit,
  type RadarPoint,
  SIGN_GLYPHS,
  glyph,
  bodyColor,
} from '@/lib/radar';

/**
 * The Radar wheel. Ascendant always on the left, zodiac running counter-clockwise,
 * your house system's cusps. Outer ring = today's sky, inner ring = you, diamonds =
 * the midpoints something is touching right now. Pick a hit and the line is drawn.
 */

const CX = 200;
const CY = 200;
const R_SIGN_OUT = 194;
const R_SIGN_IN = 170;
const R_TRANSIT = 154;
const R_HOUSE_OUT = 136;
const R_HOUSE_IN = 66;
const R_NATAL = 116;
const R_MID = 90;

function pt(r: number, lon: number, asc: number): [number, number] {
  const th = ((180 + (lon - asc)) * Math.PI) / 180;
  return [CX + r * Math.cos(th), CY - r * Math.sin(th)];
}

/** Nudge glyph angles apart so neighbours stay readable. Returns {name: displayLon}. */
function spread(items: { name: string; lon: number }[], minSep: number): Record<string, number> {
  const s = [...items].sort((a, b) => a.lon - b.lon).map((i) => ({ ...i, d: i.lon }));
  for (let pass = 0; pass < 24; pass++) {
    let moved = false;
    for (let i = 0; i < s.length; i++) {
      const j = (i + 1) % s.length;
      let gap = s[j].d - s[i].d;
      if (j === 0) gap += 360;
      if (gap < minSep) {
        const push = (minSep - gap) / 2;
        s[i].d -= push;
        s[j].d += push;
        moved = true;
      }
    }
    if (!moved) break;
  }
  const out: Record<string, number> = {};
  s.forEach((i) => (out[i.name] = ((i.d % 360) + 360) % 360));
  return out;
}

export default function RadarWheel({
  asc,
  cusps,
  natal,
  sky,
  hits,
  selectedId,
  onSelect,
}: {
  asc: number;
  cusps: number[];
  natal: RadarPoint[];
  sky: RadarPoint[];
  hits: RadarHit[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const natalSpread = useMemo(() => spread(natal.map((p) => ({ name: p.name, lon: p.lon })), 8), [natal]);
  const skySpread = useMemo(() => spread(sky.map((p) => ({ name: p.name, lon: p.lon })), 8), [sky]);
  const natalLon = useMemo(() => Object.fromEntries(natal.map((p) => [p.name, p.lon])), [natal]);
  const skyLon = useMemo(() => Object.fromEntries(sky.map((p) => [p.name, p.lon])), [sky]);

  // Idle view stays sparse: only the 5 tightest/heaviest hits draw lines.
  const drawn = useMemo(() => {
    if (selectedId) return hits.filter((h) => h.id === selectedId);
    return [...hits].sort((a, b) => b.score - a.score).slice(0, 5);
  }, [hits, selectedId]);

  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-label="Your chart with today's transits and the midpoints they are touching"
      className="w-full h-auto text-text-primary select-none"
      style={{ maxWidth: 440 }}
    >
      {/* zodiac band */}
      <circle cx={CX} cy={CY} r={R_SIGN_OUT} fill="none" stroke="currentColor" strokeOpacity={0.18} />
      <circle cx={CX} cy={CY} r={R_SIGN_IN} fill="none" stroke="currentColor" strokeOpacity={0.18} />
      {Array.from({ length: 12 }).map((_, i) => {
        const [x1, y1] = pt(R_SIGN_IN, i * 30, asc);
        const [x2, y2] = pt(R_SIGN_OUT, i * 30, asc);
        const [gx, gy] = pt((R_SIGN_IN + R_SIGN_OUT) / 2, i * 30 + 15, asc);
        return (
          <g key={`s${i}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeOpacity={0.14} />
            <text x={gx} y={gy} textAnchor="middle" dominantBaseline="central" fontSize={12} fill="currentColor" fillOpacity={0.5}>
              {SIGN_GLYPHS[i]}
            </text>
          </g>
        );
      })}

      {/* houses */}
      <circle cx={CX} cy={CY} r={R_HOUSE_OUT} fill="none" stroke="currentColor" strokeOpacity={0.14} />
      <circle cx={CX} cy={CY} r={R_HOUSE_IN} fill="none" stroke="currentColor" strokeOpacity={0.1} />
      {cusps.slice(0, 12).map((c, i) => {
        const [x1, y1] = pt(R_HOUSE_IN, c, asc);
        const [x2, y2] = pt(R_HOUSE_OUT, c, asc);
        const next = cusps[(i + 1) % 12];
        const mid = c + ((next - c + 360) % 360) / 2;
        const [hx, hy] = pt(R_HOUSE_IN + 10, mid, asc);
        const angular = i === 0 || i === 3 || i === 6 || i === 9;
        return (
          <g key={`h${i}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeOpacity={angular ? 0.45 : 0.16} strokeWidth={angular ? 1.4 : 1} />
            <text x={hx} y={hy} textAnchor="middle" dominantBaseline="central" fontSize={8} fill="currentColor" fillOpacity={0.35}>
              {i + 1}
            </text>
          </g>
        );
      })}

      {/* lines for the picked / strongest hits */}
      {drawn.map((h) => {
        const [tx, ty] = pt(R_TRANSIT - 8, skyLon[h.body] ?? h.t_lon, asc);
        const [mx, my] = pt(R_MID, h.mid_lon, asc);
        const col = bodyColor(h.body);
        const sel = h.id === selectedId;
        let a: [number, number] | null = null;
        let b: [number, number] | null = null;
        if (h.kind === 'midpoint') {
          const [an, bn] = h.target.split('/');
          if (natalLon[an] != null) a = pt(R_NATAL - 8, natalLon[an], asc);
          if (natalLon[bn] != null) b = pt(R_NATAL - 8, natalLon[bn], asc);
        }
        return (
          <g key={`l${h.id}`} opacity={sel ? 1 : 0.55}>
            {a && <line x1={a[0]} y1={a[1]} x2={mx} y2={my} stroke={col} strokeOpacity={0.4} strokeDasharray="2 3" />}
            {b && <line x1={b[0]} y1={b[1]} x2={mx} y2={my} stroke={col} strokeOpacity={0.4} strokeDasharray="2 3" />}
            <line x1={tx} y1={ty} x2={mx} y2={my} stroke={col} strokeWidth={sel ? 2 : 1.2} />
          </g>
        );
      })}

      {/* midpoint diamonds */}
      {hits.map((h) => {
        const [x, y] = pt(R_MID, h.mid_lon, asc);
        const sel = h.id === selectedId;
        const r = sel ? 6 : 4;
        return (
          <g key={`m${h.id}`} onClick={() => onSelect(h.id)} style={{ cursor: 'pointer' }}>
            <circle cx={x} cy={y} r={12} fill="transparent" />
            <path
              d={`M ${x} ${y - r} L ${x + r} ${y} L ${x} ${y + r} L ${x - r} ${y} Z`}
              fill={bodyColor(h.body)}
              fillOpacity={sel ? 1 : 0.7}
              stroke="currentColor"
              strokeOpacity={sel ? 0.9 : 0.25}
            />
          </g>
        );
      })}

      {/* natal points (inner ring) */}
      {natal.map((p) => {
        const [x, y] = pt(R_NATAL, natalSpread[p.name] ?? p.lon, asc);
        const [tx, ty] = pt(R_HOUSE_OUT, p.lon, asc);
        return (
          <g key={`n${p.name}`}>
            <line x1={tx} y1={ty} x2={pt(R_HOUSE_OUT - 5, p.lon, asc)[0]} y2={pt(R_HOUSE_OUT - 5, p.lon, asc)[1]} stroke="currentColor" strokeOpacity={0.3} />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={p.name.length <= 2 || p.name === 'Ascendant' || p.name === 'MC' ? 8 : 13} fill="currentColor" fillOpacity={0.85}>
              {glyph(p.name)}
            </text>
          </g>
        );
      })}

      {/* today's sky (outer ring) */}
      {sky.map((p) => {
        const [x, y] = pt(R_TRANSIT, skySpread[p.name] ?? p.lon, asc);
        const live = hits.some((h) => h.body === p.name);
        return (
          <g key={`t${p.name}`}>
            <circle cx={x} cy={y} r={9} fill={bodyColor(p.name)} fillOpacity={live ? 0.28 : 0.1} stroke={bodyColor(p.name)} strokeOpacity={live ? 0.9 : 0.35} />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={11} fill={bodyColor(p.name)}>
              {glyph(p.name)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
