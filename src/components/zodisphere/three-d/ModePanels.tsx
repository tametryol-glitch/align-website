'use client';

/**
 * Side panels for the four extra Zodisphere chart modes:
 *   Composite + Synastry  → RelationshipPanel (pick a person, ranked places)
 *   Solar Return / Arc    → SolarPanel (birthday spots)
 *   Relocated             → RelocatedCard (shown inside the location inspector)
 */

import { Loader2, MapPin, X, Heart, Users, Cake, ChevronLeft, ChevronRight } from 'lucide-react';
import PartnerPicker, { type PartnerProfile } from '@/components/zodisphere/three-d/PartnerPicker';
import type { CompositeResult, SynastryResult, BirthdayPlace, Crossing } from '@/lib/zodisphere/relationshipModes';
import type { RelocatedReading } from '@/components/zodisphere/three-d/zodisphereInterpretation';
import type { RelocatedChart } from '@/components/zodisphere/three-d/relocated';

const bold = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
const SHORT: Record<string, string> = { 'United States of America': 'USA', 'United Kingdom': 'UK', 'United Arab Emirates': 'UAE', 'Democratic Republic of the Congo': 'DR Congo' };
const short = (c: string | null) => (c ? SHORT[c] || c : '');

const KIND_STYLE: Record<string, { label: string; cls: string }> = {
  thrive: { label: 'Where you thrive', cls: 'border-emerald-400/30 bg-emerald-500/10' },
  charged: { label: 'Charged, handle with care', cls: 'border-amber-400/30 bg-amber-500/10' },
  clash: { label: 'Where you clash', cls: 'border-rose-400/30 bg-rose-500/10' },
};

const shell = 'absolute top-16 right-5 z-30 w-[min(92vw,360px)] max-h-[80vh] overflow-y-auto rounded-2xl border bg-black/75 backdrop-blur text-white shadow-2xl';

// ── Composite + Synastry ─────────────────────────────────────────────────────
export function RelationshipPanel({
  mode, partnerLabel, loading, error, onPick, onClear, composite, synastry, countryOf, onFly,
}: {
  mode: 'composite' | 'synastry';
  partnerLabel: string | null;
  loading: boolean;
  error: string | null;
  onPick: (p: PartnerProfile, label: string) => void;
  onClear: () => void;
  composite: CompositeResult | null;
  synastry: SynastryResult | null;
  countryOf: (lat: number, lng: number) => string | null;
  onFly: (lat: number, lng: number) => void;
}) {
  const isC = mode === 'composite';
  const accent = isC ? 'pink' : 'violet';
  const border = isC ? 'border-pink-400/25' : 'border-violet-400/25';
  const Icon = isC ? Heart : Users;
  const places = composite?.places || [];
  const crossings = synastry?.crossings || [];
  const groups: Array<'thrive' | 'charged' | 'clash'> = ['thrive', 'charged', 'clash'];
  return (
    <div className={`${shell} ${border}`}>
      <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/60 backdrop-blur z-10">
        <div className="flex items-center gap-2 text-[13px] font-semibold">
          <Icon className={`w-4 h-4 ${isC ? 'text-pink-300' : 'text-violet-300'}`} />
          {isC ? 'Composite · the relationship' : 'Synastry · you and them'}
        </div>
        {partnerLabel && <button onClick={onClear} className="text-[11px] text-white/50 hover:text-white">Change</button>}
      </div>
      <div className="p-4 space-y-3">
        {!partnerLabel && (
          <>
            <p className="text-[11px] text-white/60 leading-relaxed">
              {isC
                ? 'Blend two charts into a third: the relationship itself. We find the cities where it runs strongest, for moving in, committing, or leaving.'
                : 'Your lines and theirs on one globe. We find where they cross, and tell you which places favor you both and which ones to avoid.'}
            </p>
            <PartnerPicker onPick={onPick} busy={loading} error={error} accent={accent} />
          </>
        )}
        {partnerLabel && loading && <div className="flex items-center gap-2 text-[12px] text-white/70 py-2"><Loader2 className="w-4 h-4 animate-spin" /> Reading the stars for you and {partnerLabel}…</div>}
        {partnerLabel && error && <div className="rounded-lg bg-rose-500/10 border border-rose-400/25 px-3 py-2 text-[11px] text-rose-100">{error}</div>}

        {partnerLabel && !loading && !error && isC && (
          <>
            <div className="text-[11px] text-white/55">You + {partnerLabel}. Pink labels are “Us” lines. {places.length ? `${places.length} places within 50 miles of a line.` : ''}</div>
            {places.length === 0 && <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-3 text-[12px] text-white/65">No composite line runs within 50 miles of a known city. The relationship’s strongest places are over open land or sea.</div>}
            {places.map((p, i) => (
              <div key={`${p.body}-${p.angle}-${i}`} className="rounded-xl border border-pink-400/20 bg-pink-500/5 px-3 py-3">
                <button className="w-full flex items-center gap-2 mb-1 text-left" onClick={() => onFly(p.lat, p.lng)}>
                  <MapPin className="w-3.5 h-3.5 text-pink-300 shrink-0" />
                  <span className="text-[13px] font-semibold text-white">{p.city}{countryOf(p.lat, p.lng) ? <span className="text-white/55 font-normal">, {short(countryOf(p.lat, p.lng))}</span> : null}</span>
                  <span className="ml-auto text-[11px] text-white/45 shrink-0">{Math.round(p.distanceMiles)} mi</span>
                </button>
                <div className="text-[11px] font-medium text-pink-200/90 mb-1.5">{p.reading.headline}</div>
                {p.reading.narrative.split('\n\n').map((para, j) => (
                  <p key={j} className="text-[11px] text-white/80 leading-relaxed mb-1.5" dangerouslySetInnerHTML={{ __html: bold(para) }} />
                ))}
                <p className="text-[11px] text-pink-100/90 leading-relaxed mt-1 pt-1.5 border-t border-white/10" dangerouslySetInnerHTML={{ __html: bold(p.reading.whatCouldHaveBeen) }} />
              </div>
            ))}
          </>
        )}

        {partnerLabel && !loading && !error && !isC && (
          <>
            <div className="text-[11px] text-white/55 flex flex-wrap gap-x-3">
              <span><span className="inline-block w-2.5 h-2.5 rounded-sm align-[-1px] mr-1" style={{ background: '#fbbf24' }} />You</span>
              <span><span className="inline-block w-2.5 h-2.5 rounded-sm align-[-1px] mr-1" style={{ background: '#a78bfa' }} />{partnerLabel}</span>
              <span>{crossings.length} crossing{crossings.length === 1 ? '' : 's'} ranked</span>
            </div>
            {crossings.length === 0 && <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-3 text-[12px] text-white/65">None of your lines cross theirs. That is unusual and means your strongest places don’t overlap.</div>}
            {groups.map((g) => {
              const list = crossings.filter((c) => c.reading.kind === g);
              if (!list.length) return null;
              return (
                <div key={g} className="space-y-2">
                  <div className="text-[10px] uppercase tracking-wide text-white/45 pt-1">{KIND_STYLE[g].label}</div>
                  {list.map((c, i) => <CrossingCard key={`${g}-${i}`} c={c} country={countryOf(c.city?.lat ?? c.lat, c.city?.lng ?? c.lon)} onFly={onFly} />)}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

function CrossingCard({ c, country, onFly }: { c: Crossing; country: string | null; onFly: (lat: number, lng: number) => void }) {
  const st = KIND_STYLE[c.reading.kind];
  const place = c.city ? `${c.city.name}${country ? `, ${short(country)}` : ''}` : `${c.lat.toFixed(1)}°, ${c.lon.toFixed(1)}°${country ? `, ${short(country)}` : ''}`;
  return (
    <div className={`rounded-xl border px-3 py-3 ${st.cls}`}>
      <button className="w-full flex items-center gap-2 mb-1 text-left" onClick={() => onFly(c.lat, c.lon)}>
        <MapPin className="w-3.5 h-3.5 shrink-0 text-white/70" />
        <span className="text-[13px] font-semibold text-white truncate">{place}</span>
        {c.city && <span className="ml-auto text-[11px] text-white/45 shrink-0">{Math.round(c.city.miles)} mi</span>}
      </button>
      <div className="text-[11px] font-medium text-white/80 mb-1.5">{c.reading.headline}</div>
      {c.reading.narrative.split('\n\n').map((para, j) => (
        <p key={j} className="text-[11px] text-white/80 leading-relaxed mb-1.5" dangerouslySetInnerHTML={{ __html: bold(para) }} />
      ))}
    </div>
  );
}

// ── Solar Return / Solar Arc ─────────────────────────────────────────────────
export function SolarPanel({
  kind, onKind, year, onYear, loading, momentUT, arcDeg, best, avoid, countryOf, onFly,
}: {
  kind: 'return' | 'arc';
  onKind: (k: 'return' | 'arc') => void;
  year: number;
  onYear: (y: number) => void;
  loading: boolean;
  momentUT: Date | null;
  arcDeg: number | null;
  best: BirthdayPlace[];
  avoid: BirthdayPlace[];
  countryOf: (lat: number, lng: number) => string | null;
  onFly: (lat: number, lng: number) => void;
}) {
  const card = (p: BirthdayPlace, good: boolean, i: number) => (
    <div key={`${good}-${p.city}-${i}`} className={`rounded-xl border px-3 py-3 ${good ? 'border-emerald-400/25 bg-emerald-500/5' : 'border-rose-400/25 bg-rose-500/5'}`}>
      <button className="w-full flex items-center gap-2 mb-1 text-left" onClick={() => onFly(p.lat, p.lng)}>
        <MapPin className="w-3.5 h-3.5 shrink-0 text-white/70" />
        <span className="text-[13px] font-semibold text-white">{p.city}{countryOf(p.lat, p.lng) ? <span className="text-white/55 font-normal">, {short(countryOf(p.lat, p.lng))}</span> : null}</span>
        <span className="ml-auto text-[11px] text-white/45 shrink-0">{Math.round(p.distanceMiles)} mi</span>
      </button>
      <div className="text-[11px] font-medium text-white/80 mb-1.5">{p.reading.headline}</div>
      {p.reading.narrative.split('\n\n').map((para, j) => (
        <p key={j} className="text-[11px] text-white/80 leading-relaxed mb-1.5" dangerouslySetInnerHTML={{ __html: bold(para) }} />
      ))}
      <p className="text-[11px] font-medium text-white/90 mt-1 pt-1.5 border-t border-white/10">{p.reading.whatCouldHaveBeen}</p>
    </div>
  );
  return (
    <div className={`${shell} border-sky-400/25`}>
      <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/60 backdrop-blur z-10">
        <div className="flex items-center gap-2 text-[13px] font-semibold"><Cake className="w-4 h-4 text-sky-300" /> {kind === 'return' ? 'Solar Return · your year' : 'Solar Arc · directed lines'}</div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center rounded-lg border border-white/10 bg-white/5 overflow-hidden text-[12px]">
          {(['return', 'arc'] as const).map((k) => (
            <button key={k} onClick={() => onKind(k)} className={`flex-1 py-2 ${kind === k ? 'bg-sky-500/25 text-sky-100' : 'text-white/60'}`}>{k === 'return' ? 'Solar Return' : 'Solar Arc'}</button>
          ))}
        </div>
        {kind === 'return' ? (
          <>
            <div className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-2 py-1.5">
              <button onClick={() => onYear(year - 1)} aria-label="Previous year" className="p-1 text-white/60 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-[13px] font-semibold">{year} birthday</span>
              <button onClick={() => onYear(year + 1)} aria-label="Next year" className="p-1 text-white/60 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
            </div>
            {loading && <div className="flex items-center gap-2 text-[12px] text-white/70 py-1"><Loader2 className="w-4 h-4 animate-spin" /> Finding the exact moment your Sun comes home…</div>}
            {!loading && momentUT && (
              <p className="text-[11px] text-white/55 leading-relaxed">
                Your Sun returns to its natal degree on {momentUT.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}. These lines show where the planets of your year ahead are angular on Earth. The exact moment matters: the lines move about 15° for every hour it shifts.
              </p>
            )}
            {!loading && momentUT && best.length === 0 && avoid.length === 0 && <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-3 text-[12px] text-white/65">No return line runs within 75 miles of a known city this year.</div>}
            {best.length > 0 && <div className="text-[10px] uppercase tracking-wide text-white/45 pt-1">Best places for your birthday</div>}
            {best.map((p, i) => card(p, true, i))}
            {avoid.length > 0 && <div className="text-[10px] uppercase tracking-wide text-white/45 pt-1">Hard choices</div>}
            {avoid.map((p, i) => card(p, false, i))}
          </>
        ) : (
          <>
            {loading && <div className="flex items-center gap-2 text-[12px] text-white/70 py-1"><Loader2 className="w-4 h-4 animate-spin" /> Directing your chart…</div>}
            <p className="text-[11px] text-white/60 leading-relaxed">
              Every natal planet advanced by the same arc{arcDeg != null ? ` (${arcDeg.toFixed(1)}° this year)` : ''}, the distance your progressed Sun has travelled since birth. These lines slide slowly across the map over a lifetime; where one lands on a place is a long, slow event, not a daily one. Tap any line for its meaning.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Relocated ────────────────────────────────────────────────────────────────
export function RelocatedCard({
  placeName, reading, chart, compare, onClearCompare,
}: {
  placeName: string;
  reading: RelocatedReading;
  chart: RelocatedChart;
  compare?: { label: string; reading: RelocatedReading; chart: RelocatedChart } | null;
  onClearCompare?: () => void;
}) {
  const tone = (v: RelocatedReading['verdict']) => v === 'lift' ? 'text-emerald-300' : v === 'strain' ? 'text-rose-300' : 'text-amber-200';
  const lab = (v: RelocatedReading['verdict']) => v === 'lift' ? 'Lifts you' : v === 'strain' ? 'Strains you' : 'Mixed';
  return (
    <div className="mb-2 rounded-lg border border-teal-400/30 bg-teal-500/10 px-2.5 py-2.5 text-[11px]">
      <div className="font-semibold text-teal-100 mb-1.5">📍 If you lived here · rising {chart.ascSign}, {chart.mcSign} on top</div>
      {reading.narrative.split('\n\n').map((para, i) => (
        <p key={i} className="text-white/85 leading-relaxed mb-1.5" dangerouslySetInnerHTML={{ __html: bold(para) }} />
      ))}
      {reading.shifts.length > 0 && (
        <ul className="space-y-1 mb-1.5">
          {reading.shifts.map((s, i) => <li key={i} className="flex gap-1.5 text-white/80 leading-snug"><span className="text-teal-300 shrink-0">•</span><span>{s}</span></li>)}
        </ul>
      )}
      {compare && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wide text-white/45">Compared with {compare.label}</span>
            {onClearCompare && <button onClick={onClearCompare} aria-label="Clear comparison"><X className="w-3 h-3 text-white/40" /></button>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[{ n: placeName, r: reading, c: chart }, { n: compare.label, r: compare.reading, c: compare.chart }].map((x) => (
              <div key={x.n} className="rounded bg-black/30 border border-white/10 px-2 py-1.5">
                <div className="text-white/70 truncate">{x.n}</div>
                <div className={`font-semibold ${tone(x.r.verdict)}`}>{lab(x.r.verdict)}</div>
                <div className="text-white/45">Rising {x.c.ascSign}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
