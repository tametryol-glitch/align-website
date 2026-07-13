'use client';

/**
 * The Hidden Zodiac — interactive web calculator.
 *
 * Mirrors the mobile Calculator: pick a planet/point, a sign, and an exact
 * degree/minute/second (plus an optional Ascendant), and reveal the Duad,
 * Compendium, activated Whole-Sign houses, ruler chain, and a structured
 * reading. All astrology comes from the shared engine in @/lib/engines —
 * the page reproduces no formula.
 *
 * Two input modes: "birth" computes the exact position from birth details via
 * the natal-chart API (and pre-fills the ruler placements from the same
 * chart), "manual" takes an exact degree/minute/second directly.
 */

import { useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { resolveTimezoneOffset } from '@/lib/timezoneOffset';
import { CitySearch } from '@/components/ui/CitySearch';
import {
  SIGNS,
  calculateHiddenZodiacPlacement,
  type HiddenZodiacPlacement,
} from '@/lib/engines/hiddenZodiacEngine';
import {
  interpretHiddenZodiac,
  readingSections,
} from '@/lib/engines/hiddenZodiacInterpreter';
import {
  CALCULATOR_QUICK_PICK,
  glyphForObject,
} from '@/lib/engines/hiddenZodiacSupportedObjects';

const SIGN_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

function ordinal(n: number | null): string {
  if (!n) return '—';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]} House`;
}

export function HiddenZodiacClient() {
  const [mode, setMode] = useState<'birth' | 'manual'>('birth');
  const [object, setObject] = useState('Sun');
  const [sign, setSign] = useState('Scorpio');
  const [asc, setAsc] = useState('Leo');
  const [degree, setDegree] = useState('27');
  const [minute, setMinute] = useState('16');
  const [second, setSecond] = useState('42');
  const [secondsKnown, setSecondsKnown] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  // Optional: where each ruler actually sits (sign). Lets the chain resolve to a
  // Whole-Sign house and lets the reading speak to the ruler's real placement.
  const [rulerSigns, setRulerSigns] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Birth-details mode
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  const [unknownTime, setUnknownTime] = useState(false);
  const [birthLocation, setBirthLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [timezone, setTimezone] = useState('UTC');
  const [chartLoading, setChartLoading] = useState(false);
  const [foundText, setFoundText] = useState<string | null>(null);

  const num = (v: string) => (v.trim() === '' ? NaN : Number(v));
  const d = num(degree), m = num(minute), s = secondsKnown ? num(second) : 0;
  const errs = {
    degree: Number.isInteger(d) && d >= 0 && d <= 29 ? null : '0–29',
    minute: Number.isInteger(m) && m >= 0 && m <= 59 ? null : '0–59',
    second: !secondsKnown || (Number.isInteger(s) && s >= 0 && s <= 59) ? null : '0–59',
  };
  const valid = !errs.degree && !errs.minute && !errs.second;

  // Recomputes live as you refine ruler positions — no need to press Reveal again.
  const result = useMemo<HiddenZodiacPlacement | null>(() => {
    if (!submitted || !valid) return null;
    try {
      const natalByName: Record<string, { name: string; sign: string }> = {};
      for (const [name, sg] of Object.entries(rulerSigns)) if (sg) natalByName[name] = { name, sign: sg };
      return calculateHiddenZodiacPlacement({
        objectName: object, objectType: 'manual', sign,
        degree: d, minute: m, second: s, ascendantSign: asc, secondsKnown, natalByName,
      });
    } catch {
      return null;
    }
  }, [submitted, object, sign, asc, d, m, s, secondsKnown, rulerSigns]);

  function reveal() {
    setError(null);
    setFoundText(null);
    if (!valid) { setError('Please correct the highlighted fields.'); return; }
    setSubmitted(true);
  }

  function handleCitySelect(location: string, lat: number, lon: number, tz: string) {
    setBirthLocation(location);
    setLatitude(lat);
    setLongitude(lon);
    setTimezone(tz);
  }

  /** Split a within-sign degree (e.g. 27.2783) into whole °/′/″ with carry. */
  function toDms(signDegree: number): { d: number; m: number; s: number } {
    let d = Math.floor(signDegree);
    const minFloat = (signDegree - d) * 60;
    let m = Math.floor(minFloat);
    let s = Math.round((minFloat - m) * 60);
    if (s >= 60) { s = 0; m += 1; }
    if (m >= 60) { m = 0; d += 1; }
    if (d >= 30) { d = 29; m = 59; s = 59; }
    return { d, m, s };
  }

  async function revealFromBirth() {
    setError(null);
    setFoundText(null);
    if (!birthDate) { setError('Please enter your birth date.'); return; }
    if (latitude == null || longitude == null) { setError('Please select a birth location from the suggestions.'); return; }

    setChartLoading(true);
    try {
      const time = unknownTime ? '12:00' : birthTime;
      const { offset, label } = resolveTimezoneOffset(timezone, longitude, birthDate, time, latitude);
      const chart = await api.getNatalChart({
        name: '',
        date: birthDate,
        time,
        latitude,
        longitude,
        timezone: label,
        tz_offset: offset,
        location: birthLocation,
        house_system: 'Whole Sign',
      });
      const positions: any[] = chart.positions || [];

      // The chart engine calls the Midheaven "MC"; Earth is derived (anti-Sun).
      const targetName = object === 'Midheaven' ? 'MC' : object;
      let lon: number | null = null;
      const pos = positions.find((p) => p.name === targetName);
      if (pos) {
        lon = pos.longitude;
      } else if (object === 'Earth') {
        const sun = positions.find((p) => p.name === 'Sun');
        if (sun) lon = (sun.longitude + 180) % 360;
      }
      if (lon == null) {
        setError(`${object} isn't available from the birth-chart engine — switch to "I know the exact degrees" to enter it manually.`);
        return;
      }

      const posSign = SIGNS[Math.floor(lon / 30) % 12];
      const { d, m, s } = toDms(lon % 30);

      const ascPos = positions.find((p) => p.name === 'Ascendant');
      const ascSign = ascPos?.sign
        || (chart.house_cusps?.[0] != null ? SIGNS[Math.floor(chart.house_cusps[0] / 30) % 12] : asc);

      // Pre-fill every ruler's real sign from the same chart, so the ruler
      // chain and reading are personalised without extra input.
      const signsByName: Record<string, string> = {};
      for (const p of positions) {
        if (p?.name && p?.sign) signsByName[p.name] = p.sign;
      }

      setObject(object);
      setSign(posSign);
      setDegree(String(d));
      setMinute(String(m));
      setSecond(String(s));
      setSecondsKnown(true);
      setAsc(ascSign);
      setRulerSigns(signsByName);
      setFoundText(
        `Your ${object} sits at ${d}°${String(m).padStart(2, '0')}′${String(s).padStart(2, '0')}″ ${posSign}` +
        (unknownTime ? ' (birth time unknown — houses are approximate, calculated for 12:00 noon)' : '')
      );
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Could not calculate your chart. Please try again.');
    } finally {
      setChartLoading(false);
    }
  }

  return (
    <div>
      {/* ── Input card ── */}
      <div className="bg-bg-card border border-border-primary rounded-2xl p-6 space-y-5">
        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl" style={{ background: '#1A2035' }}>
          <button
            type="button"
            onClick={() => { setMode('birth'); setError(null); }}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'birth' ? 'bg-accent-primary text-white' : 'text-text-tertiary hover:text-text-primary'}`}
          >
            From my birth details
          </button>
          <button
            type="button"
            onClick={() => { setMode('manual'); setError(null); }}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'manual' ? 'bg-accent-primary text-white' : 'text-text-tertiary hover:text-text-primary'}`}
          >
            I know the exact degrees
          </button>
        </div>

        {mode === 'birth' ? (
          <>
            <Field label="Planet or point to reveal">
              <select className="hz-input" value={object} onChange={(e) => setObject(e.target.value)}>
                {CALCULATOR_QUICK_PICK.map((p) => (
                  <option key={p} value={p}>{glyphForObject(p)}  {p}</option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Birth date">
                <input type="date" className="hz-input" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              </Field>
              <div>
                <Field label="Birth time">
                  <input type="time" className="hz-input" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} disabled={unknownTime} />
                </Field>
                <label className="flex items-center gap-2 mt-2 text-xs text-text-muted cursor-pointer">
                  <input type="checkbox" checked={unknownTime} onChange={(e) => setUnknownTime(e.target.checked)} className="accent-accent-primary" />
                  I don&apos;t know my birth time
                </label>
              </div>
            </div>

            <Field label="Birth place">
              <CitySearch
                value={birthLocation}
                onChange={handleCitySelect}
                placeholder="Search city, state, or country..."
              />
            </Field>

            <button onClick={revealFromBirth} disabled={chartLoading} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
              {chartLoading ? 'Finding your exact degrees...' : 'Reveal My Hidden Zodiac — Free'}
            </button>
            <p className="text-xs text-text-muted text-center">
              No signup required. Your exact degree, minute, and second are calculated for you.
            </p>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Planet or point">
                <select className="hz-input" value={object} onChange={(e) => setObject(e.target.value)}>
                  {CALCULATOR_QUICK_PICK.map((p) => (
                    <option key={p} value={p}>{glyphForObject(p)}  {p}</option>
                  ))}
                </select>
              </Field>
              <Field label="Zodiac sign">
                <select className="hz-input" value={sign} onChange={(e) => setSign(e.target.value)}>
                  {SIGNS.map((sg) => <option key={sg} value={sg}>{SIGN_GLYPHS[sg]}  {sg}</option>)}
                </select>
              </Field>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-wide uppercase text-text-tertiary mb-2">Exact position within the sign</p>
              <div className="grid grid-cols-3 gap-3">
                <Dms label="Degree" suffix="°" value={degree} onChange={setDegree} err={errs.degree} max={29} />
                <Dms label="Minute" suffix="′" value={minute} onChange={setMinute} err={errs.minute} max={59} />
                <Dms label="Second" suffix="″" value={secondsKnown ? second : '00'} onChange={setSecond} err={errs.second} max={59} disabled={!secondsKnown} />
              </div>
              <label className="flex items-center gap-2 mt-3 text-sm text-text-tertiary cursor-pointer">
                <input type="checkbox" checked={!secondsKnown} onChange={(e) => setSecondsKnown(!e.target.checked)} className="accent-accent-primary" />
                Seconds unknown — calculate with 00″ (results near a boundary may change once exact seconds are known)
              </label>
            </div>

            <Field label="Ascendant sign (needed for the activated houses)">
              <select className="hz-input" value={asc} onChange={(e) => setAsc(e.target.value)}>
                {SIGNS.map((sg) => <option key={sg} value={sg}>{SIGN_GLYPHS[sg]}  {sg}</option>)}
              </select>
            </Field>

            <button onClick={reveal} disabled={!valid} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
              Reveal My Hidden Zodiac
            </button>
          </>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}
        {foundText && <p className="text-sm text-accent-secondary">{foundText}</p>}
      </div>

      {result && <Result placement={result} rulerSigns={rulerSigns} setRulerSigns={setRulerSigns} />}

      <style jsx global>{`
        .hz-input {
          width: 100%;
          background: #1A2035;
          border: 1px solid #3D4760;
          border-radius: 0.75rem;
          padding: 0.6rem 0.9rem;
          color: #fff;
          font-size: 0.95rem;
        }
        .hz-input:focus { outline: none; border-color: #9B6FF6; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-wide uppercase text-text-tertiary mb-2 block">{label}</span>
      {children}
    </label>
  );
}

function Dms({ label, suffix, value, onChange, err, max, disabled }: {
  label: string; suffix: string; value: string; onChange: (v: string) => void; err: string | null; max: number; disabled?: boolean;
}) {
  return (
    <div>
      <span className="text-[11px] text-text-muted">{label}</span>
      <div className={`flex items-center gap-1 rounded-xl px-3 ${err ? 'border border-red-500/60' : 'border border-border-primary'} ${disabled ? 'opacity-50' : ''}`} style={{ background: '#1E2640' }}>
        <input
          inputMode="numeric"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
          className="w-full bg-transparent py-2.5 text-lg text-text-primary outline-none"
          aria-label={`${label} 0 to ${max}`}
        />
        <span className="text-lg text-text-tertiary">{suffix}</span>
      </div>
      <span className={`text-[11px] ${err ? 'text-red-400' : 'text-text-muted'}`}>{err ? `Enter ${err}` : `0–${max}`}</span>
    </div>
  );
}

function Result({ placement, rulerSigns, setRulerSigns }: {
  placement: HiddenZodiacPlacement;
  rulerSigns: Record<string, string>;
  setRulerSigns: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
}) {
  const { position, duad, compendium, rulerChain, boundary, primaryHouse, warnings } = placement;
  const reading = useMemo(() => interpretHiddenZodiac(placement), [placement]);
  const sections = useMemo(() => readingSections(reading), [reading]);

  const distinctRulers = Array.from(new Set(
    [rulerChain.mainRuler.ruler, rulerChain.duadRuler.ruler, rulerChain.compendiumRuler.ruler].filter(Boolean) as string[],
  ));

  return (
    <div className="mt-8 space-y-4">
      {/* Header */}
      <div className="rounded-2xl p-6 border border-gold-primary/30" style={{ background: 'linear-gradient(135deg, rgba(245,166,35,0.14), rgba(245,158,11,0.04))' }}>
        <h3 className="text-2xl font-display font-bold text-text-primary">
          {glyphForObject(placement.object.name)}  {placement.object.name} at {position.text}
        </h3>
        <div className="flex flex-wrap gap-6 mt-3 text-sm">
          <Meta label="Natal house" value={ordinal(primaryHouse)} />
          <Meta label="Duad" value={duad.sign} />
          <Meta label="Compendium" value={compendium.sign} />
        </div>
        <p className="text-xs text-text-tertiary mt-3">
          Duad range {duad.startLabel}–{duad.endLabel} · Compendium range {compendium.startLabel}–{compendium.endLabel}
        </p>
        <p className="text-xs text-text-tertiary mt-1">
          Next Compendium begins in {boundary.toNextLabel}{boundary.boundarySensitive ? '  ·  ⚠ Boundary-sensitive placement' : ''}
        </p>
      </div>

      {warnings.map((w, i) => (
        <div key={i} className="rounded-xl p-3 text-xs text-gold-primary border border-gold-primary/30" style={{ background: 'rgba(245,158,11,0.08)' }}>{w}</div>
      ))}

      {/* Formula */}
      <Card title="Your Hidden Zodiac formula">
        <p className="text-lg text-accent-secondary font-display">{glyphForObject(placement.object.name)} {placement.object.name}</p>
        <p className="text-sm text-text-secondary mt-1 ml-2">• {position.sign} → {ordinal(primaryHouse)}</p>
        <p className="text-sm text-text-secondary mt-1 ml-2">• {duad.sign} Duad → {ordinal(duad.activatedHouse)} activation</p>
        <p className="text-sm text-text-secondary mt-1 ml-2">• {compendium.sign} Compendium → {ordinal(compendium.activatedHouse)} activation</p>
      </Card>

      {/* Three houses */}
      <Card title="The three-house connection">
        <HouseRow tag="Primary house" house={primaryHouse} />
        <div className="text-center text-text-muted my-1">↓</div>
        <HouseRow tag={`Duad house · ${duad.sign}`} house={duad.activatedHouse} />
        <div className="text-center text-text-muted my-1">↓</div>
        <HouseRow tag={`Compendium house · ${compendium.sign}`} house={compendium.activatedHouse} />
      </Card>

      {/* Refine: where are your rulers? — makes the chain (and the reading) about YOU */}
      <div className="rounded-2xl p-6 border border-accent-primary/30" style={{ background: 'rgba(155,111,246,0.06)' }}>
        <h4 className="text-lg font-display font-semibold text-text-primary mb-1">Make it about you</h4>
        <p className="text-sm text-text-tertiary mb-4">
          Tell it where your ruler{distinctRulers.length > 1 ? 's' : ''} actually sit{distinctRulers.length > 1 ? '' : 's'}.
          The house is worked out from your Ascendant, and the reading rewrites itself to factor it in.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {distinctRulers.map((r) => (
            <label key={r} className="block">
              <span className="text-xs font-semibold text-text-tertiary mb-1 block">{r} is in…</span>
              <select
                className="hz-input"
                value={rulerSigns[r] ?? ''}
                onChange={(e) => setRulerSigns((prev) => ({ ...prev, [r]: e.target.value }))}
              >
                <option value="">— sign unknown —</option>
                {SIGNS.map((sg) => <option key={sg} value={sg}>{SIGN_GLYPHS[sg]}  {sg}</option>)}
              </select>
            </label>
          ))}
        </div>
      </div>

      {/* Ruler chain */}
      <Card title="Ruler chain">
        <RulerRow label={position.sign} ruler={rulerChain.mainRuler.ruler} sign={rulerChain.mainRuler.position?.sign ?? null} house={rulerChain.mainRuler.house} />
        <RulerRow label={`${duad.sign} Duad`} ruler={rulerChain.duadRuler.ruler} sign={rulerChain.duadRuler.position?.sign ?? null} house={rulerChain.duadRuler.house} />
        <RulerRow label={`${compendium.sign} Compendium`} ruler={rulerChain.compendiumRuler.ruler} sign={rulerChain.compendiumRuler.position?.sign ?? null} house={rulerChain.compendiumRuler.house} />
      </Card>

      {/* Reading — progressive disclosure */}
      {sections.map((sec, i) => (
        <details key={sec.key} open={i < 2} className="bg-bg-card border border-border-primary rounded-xl px-5 group">
          <summary className="py-4 cursor-pointer list-none flex items-center justify-between text-sm font-semibold tracking-wide uppercase text-text-primary">
            {sec.title}
            <span className="text-text-muted group-open:rotate-90 transition-transform">›</span>
          </summary>
          <p className="text-[15px] text-text-secondary leading-relaxed pb-4">{sec.body}</p>
        </details>
      ))}
      {reading.examples.length > 0 && (
        <details className="bg-bg-card border border-border-primary rounded-xl px-5">
          <summary className="py-4 cursor-pointer list-none text-sm font-semibold tracking-wide uppercase text-text-primary">Real-life examples</summary>
          <ul className="text-[15px] text-text-secondary leading-relaxed pb-4 space-y-1">
            {reading.examples.map((e, i) => <li key={i}>• {e}</li>)}
          </ul>
        </details>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-bg-card border border-border-primary rounded-2xl p-6">
      <h4 className="text-lg font-display font-semibold text-text-primary mb-2">{title}</h4>
      {children}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-text-muted">{label}</p>
      <p className="text-sm font-semibold text-text-primary">{value}</p>
    </div>
  );
}

const HOUSE_BLURB: Record<number, string> = {
  1: 'identity, self-image, and how you present', 2: 'money, self-worth, and resources',
  3: 'communication, learning, siblings', 4: 'home, family, roots, foundations',
  5: 'creativity, romance, self-expression', 6: 'work, health, routines, service',
  7: 'partnerships and one-on-one bonds', 8: 'transformation, shared resources, intimacy',
  9: 'travel, philosophy, higher learning', 10: 'career, reputation, life direction',
  11: 'community, friendships, future vision', 12: 'solitude, spirituality, hidden patterns',
};

function HouseRow({ tag, house }: { tag: string; house: number | null }) {
  return (
    <div className="rounded-xl p-3 border border-border-primary" style={{ background: '#1A2035' }}>
      <p className="text-[11px] font-bold text-accent-secondary">{tag}</p>
      <p className="text-sm font-semibold text-text-primary">{house ? ordinal(house) : 'House unknown'}</p>
      <p className="text-[11px] text-text-tertiary">{house ? HOUSE_BLURB[house] : 'Add an Ascendant to resolve this house.'}</p>
    </div>
  );
}

function RulerRow({ label, ruler, sign, house }: { label: string; ruler: string | null; sign: string | null; house: number | null }) {
  const detail = [sign, house ? ordinal(house) : null].filter(Boolean).join(' · ');
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-sm text-text-tertiary flex-1">{label}</span>
      <span className="text-text-muted">→</span>
      <span className="text-sm font-semibold text-text-primary flex-1 text-right">
        {ruler ?? '—'}{detail ? <span className="text-text-tertiary font-normal"> · {detail}</span> : ''}
      </span>
    </div>
  );
}
