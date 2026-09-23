'use client';

// KPI trend card — the admin's standard time-series chart (Play Console style,
// Align theme): headline value + delta chip, y-axis with gridlines and tick
// labels, DD-MM dates, solid line with soft fill, dashed least-squares trend
// line, and a hover crosshair + tooltip with the exact value.
//
// Drawn in real pixels (measured with ResizeObserver) so nothing stretches.
// The app has a twin in align-app/src/components/admin/KpiChart.tsx — keep the
// two in step.

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface KpiPoint { date: string; value: number }

const PAD = { top: 10, right: 12, bottom: 22, left: 40 };

/** DD-MM for axis ticks, DD-MM-YYYY for tooltips (input: YYYY-MM-DD…). */
const dm = (iso: string) => { const [, m, d] = iso.slice(0, 10).split('-'); return d && m ? `${d}-${m}` : iso; };
const dmy = (iso: string) => { const [y, m, d] = iso.slice(0, 10).split('-'); return d && m && y ? `${d}-${m}-${y}` : iso; };

/** Round a max up to a "nice" axis ceiling and return evenly spaced ticks. */
export function niceTicks(max: number, count = 3): number[] {
  if (!(max > 0)) return [0, 1];
  const raw = max / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || 10 * mag;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => +(i * step).toFixed(6));
}

/** Least-squares line through the points → [start, end] values. */
export function trendLine(values: number[]): [number, number] | null {
  const n = values.length;
  if (n < 3) return null;
  const xm = (n - 1) / 2;
  const ym = values.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  values.forEach((y, x) => { num += (x - xm) * (y - ym); den += (x - xm) ** 2; });
  const slope = den ? num / den : 0;
  return [ym - slope * xm, ym + slope * (n - 1 - xm)];
}

function DeltaChip({ pct, goodWhenUp = true, suffix = '%' }: { pct?: number | null; goodWhenUp?: boolean; suffix?: string }) {
  if (pct == null || !isFinite(pct)) return null;
  if (pct === 0) {
    return <span className="inline-flex items-center gap-0.5 text-[11px] text-text-muted"><Minus className="w-3 h-3" />0{suffix}</span>;
  }
  const up = pct > 0;
  const good = up === goodWhenUp;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${good ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
      {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(pct)}{suffix}
    </span>
  );
}

export function KpiChart({
  title, value, valueLabel, delta, deltaGoodWhenUp = true, points, format = (v) => v.toLocaleString(),
  axisFormat, height = 150, showTrend = true, empty = 'No data yet.',
}: {
  title: string;
  /** Headline, e.g. "41.9" — defaults to the average of the points. */
  value?: string;
  /** Word after the headline, e.g. "average", "today", "total". */
  valueLabel?: string;
  /** Percent change for the chip (positive = up). */
  delta?: number | null;
  deltaGoodWhenUp?: boolean;
  points: KpiPoint[];
  format?: (v: number) => string;
  axisFormat?: (v: number) => string;
  height?: number;
  showTrend?: boolean;
  empty?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.floor(e.contentRect.width)));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const values = points.map((p) => p.value);
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const ticks = useMemo(() => niceTicks(Math.max(0, ...values)), [values.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  const top = ticks[ticks.length - 1] || 1;
  const trend = showTrend ? trendLine(values) : null;

  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = height - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length > 1 ? (i / (points.length - 1)) * plotW : plotW / 2);
  const y = (v: number) => PAD.top + plotH - (Math.max(0, v) / top) * plotH;
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = points.length ? `${line} L${x(points.length - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z` : '';
  const axisFmt = axisFormat || format;

  // ~4 evenly spaced date labels, always including the last day.
  const labelIdx = useMemo(() => {
    const n = points.length;
    if (n <= 1) return [0];
    const want = Math.min(4, n);
    const idx = Array.from({ length: want }, (_, k) => Math.round((k * (n - 1)) / (want - 1)));
    return Array.from(new Set(idx));
  }, [points.length]);

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!points.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = points.length > 1 ? Math.round(((px - PAD.left) / plotW) * (points.length - 1)) : 0;
    setHover(Math.min(points.length - 1, Math.max(0, i)));
  };

  const h = hover != null ? points[hover] : null;
  const gradId = `kpi-${title.replace(/\W+/g, '')}`;

  return (
    <div className="rounded-xl border border-border-primary bg-bg-secondary p-4">
      <h3 className="text-[13px] font-semibold text-text-secondary">{title}</h3>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold text-text-primary tabular-nums">{value ?? format(Math.round(avg * 10) / 10)}</span>
        <span className="text-xs text-text-muted">{valueLabel ?? 'average'}</span>
      </div>
      <div className="h-5 mt-0.5"><DeltaChip pct={delta} goodWhenUp={deltaGoodWhenUp} /></div>

      <div ref={wrapRef} className="relative mt-2" style={{ height }}>
        {!points.length ? (
          <p className="text-xs text-text-muted text-center pt-10">{empty}</p>
        ) : width > 0 && (
          <svg width={width} height={height} onMouseMove={onMove} onMouseLeave={() => setHover(null)} className="block">
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" className="text-accent-primary" stopColor="currentColor" stopOpacity="0.28" />
                <stop offset="100%" className="text-accent-primary" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* grid + y labels */}
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)}
                  className="text-border-primary" stroke="currentColor" strokeOpacity={t === 0 ? 0.9 : 0.45} strokeWidth={1} />
                <text x={PAD.left - 6} y={y(t) + 3.5} textAnchor="end" className="fill-text-muted" fontSize={10}>{axisFmt(t)}</text>
              </g>
            ))}

            {/* x labels */}
            {labelIdx.map((i) => (
              <text key={i} x={x(i)} y={height - 6} fontSize={10} className="fill-text-muted"
                textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}>
                {dm(points[i].date)}
              </text>
            ))}

            <path d={area} fill={`url(#${gradId})`} />
            {trend && (
              <line x1={x(0)} x2={x(points.length - 1)} y1={y(trend[0])} y2={y(trend[1])}
                className="text-accent-secondary" stroke="currentColor" strokeWidth={1.5} strokeDasharray="4 4" strokeOpacity={0.9} />
            )}
            <path d={line} fill="none" className="text-accent-primary" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

            {h && hover != null && (
              <g>
                <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + plotH} className="text-text-muted" stroke="currentColor" strokeOpacity={0.5} />
                <circle cx={x(hover)} cy={y(h.value)} r={4.5} className="text-accent-primary fill-bg-secondary" stroke="currentColor" strokeWidth={2} />
              </g>
            )}
          </svg>
        )}
        {h && hover != null && (
          <div
            className="pointer-events-none absolute -top-1 z-10 rounded-lg border border-border-primary bg-bg-primary/95 px-2.5 py-1.5 shadow-lg"
            style={{ left: Math.min(Math.max(x(hover) - 60, 0), Math.max(0, width - 120)), width: 120 }}
          >
            <div className="text-[10px] text-text-muted">{dmy(h.date)}</div>
            <div className="text-sm font-semibold text-text-primary tabular-nums">{format(h.value)}</div>
          </div>
        )}
      </div>
      {trend && points.length >= 3 && (
        <div className="mt-1 flex items-center gap-3 text-[10px] text-text-muted">
          <span className="inline-flex items-center gap-1"><span className="inline-block h-0.5 w-3 rounded bg-accent-primary" />Daily</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block w-3 border-t-2 border-dashed border-accent-secondary" />Trend</span>
        </div>
      )}
    </div>
  );
}

/** Responsive grid of KPI cards (1 → 2 → 4 columns). */
export function KpiGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">{children}</div>;
}
