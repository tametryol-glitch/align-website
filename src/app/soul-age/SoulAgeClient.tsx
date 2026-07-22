'use client';

/**
 * Soul Age Calculator — free web calculator.
 *
 * Free for everyone, signed in or not. There is no subscription check, no trial
 * counter and no token cost anywhere in this file, and it must stay that way.
 *
 * Guest birth data is held in component state only — nothing is written to
 * storage unless the visitor creates an account and explicitly saves (§22).
 *
 * All astrology comes from the shared engine in @/lib/engines/soulAgeEngine.
 * This component reproduces no formula.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { resolveTimezoneOffset } from '@/lib/timezoneOffset';
import { CitySearch } from '@/components/ui/CitySearch';
import {
  calculateSoulAge,
  buildSoulAgeInputFromPositions,
  BIRTH_TIME_REQUIRED_MESSAGE,
  type SoulAgeResult,
} from '@/lib/engines/soulAgeEngine';
import {
  generateSoulAgeInterpretation,
  buildShareCard,
  formatCount,
  ordinalHouse,
  SOUL_AGE_DISCLAIMER,
  SOUL_AGE_CREDIT,
  type SoulAgeInterpretation,
} from '@/lib/engines/soulAgeInterpretation';
import {
  buildSoulAgeResultRow,
  isStaleResult,
  type SoulAgeResultRow,
} from '@/lib/engines/soulAgePersistence';

/** Row shape from the `saved_charts` table (only the fields we consume). */
interface SavedChartRow {
  id: string;
  full_name: string;
  birth_date: string;
  birth_time: string | null;
  birth_time_unknown: boolean;
  birth_place: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
}

/** A previously saved result, as read back from `soul_age_results`. */
type StoredResult = Pick<
  SoulAgeResultRow,
  'subject_key' | 'subject_label' | 'total_universal_lifetimes' | 'earth_lifetimes'
  | 'earth_percentage' | 'universal_soul_age' | 'earth_soul_age'
  | 'soul_age_method_version' | 'used_mean_node'
> & { updated_at: string };

/** Normalised input for a calculation, whatever source it came from. */
interface ChartSource {
  label: string;
  date: string;
  time: string | null;
  place: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  secondsKnown: boolean;
  /** 'self', a saved_charts id, or omitted for a one-off manual entry. */
  subjectKey?: string | null;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-text-tertiary mb-1.5">{label}</span>
      {children}
      {hint ? <span className="block text-[11px] text-text-muted mt-1">{hint}</span> : null}
    </label>
  );
}

/** One headline metric in the result summary. */
function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="sa-stat">
      <span className="sa-stat-label">{label}</span>
      <span className={accent ? 'sa-stat-value sa-stat-accent' : 'sa-stat-value'}>{value}</span>
    </div>
  );
}

function Section({ section, index }: { section: SoulAgeInterpretation['sections'][number]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border-primary rounded-2xl overflow-hidden bg-bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-sm font-semibold text-text-primary">
          <span className="text-text-muted mr-2">{index + 1}.</span>
          {section.title}
        </span>
        <span className="text-text-muted text-lg leading-none shrink-0">{open ? '−' : '+'}</span>
      </button>
      {open ? (
        <div className="px-5 pb-5 space-y-3">
          {section.body.map((p, i) => (
            <p key={i} className="text-[13px] leading-relaxed text-text-secondary">{p}</p>
          ))}
          {section.rows && section.rows.length > 0 ? (
            <div className="sa-table-wrap">
              <table className="sa-table">
                <tbody>
                  {section.rows.map((row, i) => (
                    <tr key={i}>
                      <th scope="row">{row.label}</th>
                      <td>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function SoulAgeClient() {
  const [label, setLabel] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [secondsKnown, setSecondsKnown] = useState(false);
  const [birthSeconds, setBirthSeconds] = useState('0');
  const [birthLocation, setBirthLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [timezone, setTimezone] = useState('UTC');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SoulAgeResult | null>(null);
  const [interp, setInterp] = useState<SoulAgeInterpretation | null>(null);
  const [subjectLabel, setSubjectLabel] = useState('');
  const [copied, setCopied] = useState(false);
  /**
   * Which stored subject this result belongs to:
   *   'self'  — the signed-in user's own profile chart
   *   <uuid>  — a saved_charts row
   *   null    — a one-off person typed into the form; there is nothing to
   *             attach a saved result to, so saving is not offered.
   */
  const [subjectKey, setSubjectKey] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // §16 — signed-in visitors also get their own chart and their saved charts.
  // Guests simply never see these; the birth-data form is always available.
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [savedCharts, setSavedCharts] = useState<SavedChartRow[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  /** Previously saved results — doubles as the §18 comparison table. */
  const [savedResults, setSavedResults] = useState<StoredResult[]>([]);

  const loadSavedResults = useCallback(async () => {
    if (!isAuthenticated) { setSavedResults([]); return; }
    const { data } = await createClient()
      .from('soul_age_results')
      .select('subject_key, subject_label, total_universal_lifetimes, earth_lifetimes, earth_percentage, universal_soul_age, earth_soul_age, soul_age_method_version, used_mean_node, updated_at')
      .order('total_universal_lifetimes', { ascending: false });
    if (data) setSavedResults(data as StoredResult[]);
  }, [isAuthenticated]);

  useEffect(() => { void loadSavedResults(); }, [loadSavedResults]);

  useEffect(() => {
    if (!isAuthenticated) { setSavedCharts([]); return; }
    let cancelled = false;
    createClient()
      .from('saved_charts')
      .select('id, full_name, birth_date, birth_time, birth_time_unknown, birth_place, latitude, longitude, timezone')
      .eq('is_archived', false)
      .order('is_favorite', { ascending: false })
      .order('full_name')
      .then(({ data }) => { if (!cancelled && data) setSavedCharts(data as SavedChartRow[]); });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  function handleCitySelect(location: string, lat: number, lon: number, tz: string) {
    setBirthLocation(location);
    setLatitude(lat);
    setLongitude(lon);
    setTimezone(tz);
  }

  /** Single calculation path — every source funnels through here. */
  const runCalculation = useCallback(async (source: ChartSource) => {
    setError(null);
    setSaveState('idle');
    setSubjectKey(source.subjectKey ?? null);

    if (!source.date) { setError('Please enter a birth date.'); return; }
    // §17 — an accurate birth time is required. Never silently substitute noon.
    if (!source.time) { setError(BIRTH_TIME_REQUIRED_MESSAGE); return; }
    if (source.latitude == null || source.longitude == null) {
      setError('Please choose a birthplace from the suggestions so the Ascendant can be calculated.');
      return;
    }

    setLoading(true);
    try {
      const { offset, label: tzLabel } = resolveTimezoneOffset(
        source.timezone, source.longitude, source.date, source.time, source.latitude,
      );
      const chart = await api.getNatalChart({
        name: '',
        date: source.date,
        time: source.time,
        latitude: source.latitude,
        longitude: source.longitude,
        timezone: source.timezone || tzLabel,
        tz_offset: offset,
        location: source.place,
        house_system: 'Whole Sign',
      });

      // Raw API longitudes (4 dp = 0.36″) go straight into the engine — no
      // display mapper in between, so no Compendium boundary is ever lost.
      const input = buildSoulAgeInputFromPositions(chart.positions || [], {
        label: source.label || undefined,
        birthTimeKnown: true,
        birthTimeSecondsKnown: source.secondsKnown,
        // The Draconic rotation is defined against the TRUE node. Older API
        // builds do not send this; the engine then says so in its notices.
        trueNodeLongitude: chart.true_node ?? null,
      });

      const computed = calculateSoulAge(input);
      setResult(computed);
      setInterp(generateSoulAgeInterpretation(computed));
      setSubjectLabel(source.label);
      // Guest birth data stays in component state only — never persisted.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not calculate the chart. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  function calculate() {
    // The chart engine accepts HH:MM:SS, so exact seconds refine the angles
    // when the user knows them. Otherwise 00 is used, and said so plainly.
    const sec = secondsKnown
      ? String(Math.min(59, Math.max(0, Number(birthSeconds) || 0))).padStart(2, '0')
      : '00';
    runCalculation({
      label: label.trim(),
      date: birthDate,
      time: birthTime ? `${birthTime}:${sec}` : null,
      place: birthLocation,
      latitude,
      longitude,
      timezone,
      secondsKnown,
    });
  }

  function calculateMine() {
    if (!profile?.birth_date || !profile.birth_time) {
      setError(
        profile?.birth_date
          ? BIRTH_TIME_REQUIRED_MESSAGE
          : 'Add your birth details to your profile first — the Soul Age Calculator needs them.',
      );
      return;
    }
    runCalculation({
      label: profile.display_name || 'My chart',
      date: profile.birth_date,
      time: profile.birth_time,
      place: profile.birth_location || '',
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezone: profile.timezone,
      secondsKnown: false,
      subjectKey: 'self',
    });
  }

  function calculateSaved(chart: SavedChartRow) {
    if (chart.birth_time_unknown || !chart.birth_time) {
      setError(`${chart.full_name} has no exact birth time saved. ${BIRTH_TIME_REQUIRED_MESSAGE}`);
      return;
    }
    runCalculation({
      label: chart.full_name,
      date: chart.birth_date,
      time: chart.birth_time,
      place: chart.birth_place || '',
      latitude: chart.latitude,
      longitude: chart.longitude,
      timezone: chart.timezone,
      secondsKnown: false,
      subjectKey: chart.id,
    });
  }

  function reset() {
    setResult(null);
    setInterp(null);
    setError(null);
  }

  /** Re-run a stored subject so the full written reading is regenerated. */
  function reopenStored(stored: StoredResult) {
    if (stored.subject_key === 'self') { calculateMine(); return; }
    const chart = savedCharts.find((c) => c.id === stored.subject_key);
    if (chart) { calculateSaved(chart); return; }
    setError('That chart is no longer saved to your account.');
  }

  /**
   * §18 — build the share image URL from the privacy-safe card only.
   * `buildShareCard` is the single gate: birth data is not in its output, so it
   * cannot reach the URL.
   */
  function shareUrl(): string | null {
    if (!result) return null;
    const card = buildShareCard(result, subjectLabel || label);
    const q = new URLSearchParams({
      type: 'soul-age',
      label: card.displayLabel,
      uAge: card.universalSoulAge,
      uCount: card.universalLifetimes,
      eAge: card.earthSoulAge,
      eCount: card.earthLifetimes,
    });
    return `/api/og?${q.toString()}`;
  }

  /**
   * §18 — save the result to the selected chart. Only ever runs when the user
   * clicks Save (§22: nothing is written implicitly), and only for a subject
   * that exists in the account. Re-saving after a recalculation replaces the
   * stored row rather than accumulating duplicates.
   */
  async function save() {
    if (!result || !user?.id || !subjectKey) return;
    setSaveState('saving');
    try {
      const row = buildSoulAgeResultRow(result, {
        ownerId: user.id,
        savedChartId: subjectKey === 'self' ? null : subjectKey,
        subjectLabel,
      });
      const { error: saveError } = await createClient()
        .from('soul_age_results')
        .upsert(row, { onConflict: 'owner_id,subject_key' });
      if (saveError) throw new Error(saveError.message);
      setSaveState('saved');
      void loadSavedResults(); // keep the comparison table current
    } catch (err) {
      setSaveState('error');
      setError(err instanceof Error ? err.message : 'Could not save this result.');
    }
  }

  async function share() {
    const url = shareUrl();
    if (!url) return;
    const absolute = new URL(url, window.location.origin).toString();
    const text = `My Soul Age: ${result!.universalSoulAge.label} — ${formatCount(result!.totalUniversalLifetimes)} universal lifetimes.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Soul Age Calculator', text, url: absolute });
      } else {
        await navigator.clipboard.writeText(`${text} ${absolute}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      /* user dismissed the share sheet — nothing to report */
    }
  }

  const dEarth = result?.draconic.Earth;

  return (
    <div>
      {!result ? (
        <div className="bg-bg-card border border-border-primary rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <span className="sa-free-badge">FREE</span>
            <span className="text-xs text-text-muted">No account required. Calculate as many charts as you like.</span>
          </div>

          {/* §16 — signed-in shortcuts. Guests go straight to the form below. */}
          {isAuthenticated ? (
            <div className="space-y-2">
              <button type="button" onClick={calculateMine} disabled={loading} className="btn-primary w-full py-2.5 text-sm disabled:opacity-60">
                Calculate My Soul Age
              </button>
              {savedCharts.length > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowSaved((v) => !v)}
                    aria-expanded={showSaved}
                    className="btn-ghost w-full py-2.5 text-sm"
                  >
                    Choose a Saved Chart ({savedCharts.length})
                  </button>
                  {showSaved ? (
                    <div className="border border-border-primary rounded-xl divide-y divide-[#262C42] max-h-64 overflow-y-auto">
                      {savedCharts.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => calculateSaved(c)}
                          className="w-full text-left px-4 py-3 hover:bg-white/[0.03] transition-colors"
                        >
                          <span className="block text-sm text-text-primary">{c.full_name}</span>
                          <span className="block text-[11px] text-text-muted mt-0.5">
                            {c.birth_date}
                            {c.birth_time_unknown || !c.birth_time ? ' · birth time unknown' : ` · ${c.birth_time}`}
                            {c.birth_place ? ` · ${c.birth_place}` : ''}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}
              <p className="text-[11px] text-text-muted text-center pt-1">or calculate another person below</p>
            </div>
          ) : null}

          <Field label="Name or chart label">
            <input
              className="sa-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. My chart"
              maxLength={40}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Birth date">
              <input type="date" className="sa-input" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </Field>
            <Field label="Exact birth time" hint="Required — the Draconic Ascendant depends on it.">
              <input type="time" className="sa-input" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} />
            </Field>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={secondsKnown}
                onChange={(e) => setSecondsKnown(e.target.checked)}
                className="accent-[#9B6FF6]"
              />
              <span className="text-xs text-text-tertiary">I know the seconds of my birth time</span>
            </label>
            {secondsKnown ? (
              <div className="mt-3 max-w-[140px]">
                <Field label="Seconds">
                  <input
                    type="number" min={0} max={59} className="sa-input"
                    value={birthSeconds}
                    onChange={(e) => setBirthSeconds(e.target.value)}
                  />
                </Field>
              </div>
            ) : (
              <p className="text-[11px] text-text-muted mt-1.5">
                Calculated using 00 birth-time seconds. Exact seconds may slightly refine the result.
              </p>
            )}
          </div>

          <Field label="Birthplace">
            <CitySearch value={birthLocation} onChange={handleCitySelect} placeholder="Search for your birth city..." />
          </Field>

          {error ? (
            <p className="text-[13px] text-[#F87171] bg-[#F87171]/10 border border-[#F87171]/20 rounded-xl px-4 py-3 leading-relaxed">
              {error}
            </p>
          ) : null}

          <button type="button" onClick={calculate} disabled={loading} className="btn-primary w-full py-3 text-base disabled:opacity-60">
            {loading ? 'Calculating…' : 'Calculate Soul Age'}
          </button>

          {/* §18 — compare Universal and Earth Soul Ages across saved charts.
              Ordered by universal lifetimes so the comparison reads at a glance. */}
          {savedResults.length > 0 ? (
            <div className="pt-2">
              <h3 className="text-sm font-semibold text-text-primary mb-1">Your saved Soul Ages</h3>
              <p className="text-[11px] text-text-muted mb-3">
                Ordered by universal lifetimes. Select one to regenerate its full reading.
              </p>
              <div className="sa-table-wrap">
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th scope="col">Chart</th>
                      <th scope="col">Universal</th>
                      <th scope="col">Earth</th>
                      <th scope="col">On Earth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedResults.map((s) => (
                      <tr
                        key={s.subject_key}
                        onClick={() => reopenStored(s)}
                        className="cursor-pointer hover:bg-white/[0.03]"
                      >
                        <td>
                          {s.subject_label || (s.subject_key === 'self' ? 'My chart' : 'Saved chart')}
                          {isStaleResult(s) ? (
                            <span className="sa-stale" title="Calculated with an older method or the Mean Node — reopen to refresh">
                              needs refresh
                            </span>
                          ) : null}
                        </td>
                        <td>
                          {formatCount(s.total_universal_lifetimes)}
                          <span className="block text-text-muted">{s.universal_soul_age}</span>
                        </td>
                        <td>
                          {formatCount(s.earth_lifetimes)}
                          <span className="block text-text-muted">{s.earth_soul_age}</span>
                        </td>
                        <td>{Number(s.earth_percentage).toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── Headline summary ── */}
          <div className="sa-summary">
            <span className="sa-eyebrow">Soul Age Calculator</span>
            {subjectLabel ? (
              <h2 className="text-xl font-display font-bold text-text-primary mt-1">{subjectLabel}</h2>
            ) : null}
            {result.notices.map((n) => (
              <p key={n} className="text-[11px] text-text-muted mt-2">{n}</p>
            ))}

            <div className="sa-stat-grid mt-5">
              <Stat label="Total Universal Lifetimes" value={formatCount(result.totalUniversalLifetimes)} accent />
              <Stat label="Universal Soul Age" value={result.universalSoulAge.label} />
              <Stat label="Previous Earth Lifetimes" value={formatCount(result.earthLifetimes)} accent />
              <Stat label="Earth Soul Age" value={result.earthSoulAge.label} />
              <Stat label="Previous Non-Earth Lifetimes" value={formatCount(result.nonEarthLifetimes)} />
              <Stat label="Earth Incarnation Percentage" value={`${result.earthPercentage.toFixed(2)}%`} />
              <Stat label="Earth Anchoring Score" value={`${result.earthAnchoring.displayScore} / 100`} />
              <Stat label="Completed Universal Cycles" value={String(result.validatedCompletedCycles)} />
              <Stat
                label="Current Universal Cycle"
                value={`${(result.currentCyclePosition * 100).toFixed(2)}% through`}
              />
            </div>
          </div>

          {/* ── Written reading ── */}
          {interp ? (
            <div className="bg-bg-card border border-border-primary rounded-2xl p-6">
              <h2 className="text-lg font-display font-semibold text-text-primary mb-3">{interp.headline}</h2>
              <div className="space-y-3">
                {interp.reading.map((p, i) => (
                  <p key={i} className="text-[14px] leading-relaxed text-text-secondary">{p}</p>
                ))}
              </div>
              {dEarth ? (
                <p className="text-[11px] text-text-muted mt-4 pt-4 border-t border-border-primary">
                  Read from your Draconic Ascendant at {result.draconic.Ascendant.positionLabel} and your
                  Draconic Earth at {dEarth.positionLabel} in the {ordinalHouse(dEarth.house)}.
                </p>
              ) : null}
            </div>
          ) : null}

          {/* ── Save + Share ── */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {isAuthenticated && subjectKey ? (
              <button
                type="button"
                onClick={save}
                disabled={saveState === 'saving' || saveState === 'saved'}
                className="btn-primary px-6 py-2.5 text-sm w-full sm:w-auto disabled:opacity-60"
              >
                {saveState === 'saving' ? 'Saving…'
                  : saveState === 'saved' ? 'Saved to this chart ✓'
                  : 'Save to this chart'}
              </button>
            ) : null}
            <button type="button" onClick={share} className="btn-ghost px-6 py-2.5 text-sm w-full sm:w-auto">
              {copied ? 'Link copied ✓' : 'Share result card'}
            </button>
            <span className="text-[11px] text-text-muted">
              Shares your Soul Ages and lifetime counts only — never your birth details.
            </span>
          </div>
          {isAuthenticated && !subjectKey ? (
            <p className="text-[11px] text-text-muted -mt-3">
              This is a one-off calculation. Save this person as a chart first if you want to keep their Soul Age.
            </p>
          ) : null}

          {/* ── Expandable detail ── */}
          {interp ? (
            <div className="space-y-2">
              {interp.sections.map((s, i) => <Section key={s.id} section={s} index={i} />)}
            </div>
          ) : null}

          {/* ── CTA — guests are invited to sign up, members just recalculate ── */}
          <div className="bg-gradient-cosmic rounded-2xl p-6 border border-accent-muted text-center">
            {isAuthenticated ? (
              <>
                <h3 className="text-base font-display font-semibold text-text-primary mb-2">Read another chart</h3>
                <p className="text-[13px] text-text-tertiary mb-5 max-w-md mx-auto">
                  Calculate the Soul Age of any saved chart, or enter someone new. It is always free.
                </p>
                <button type="button" onClick={reset} className="btn-primary px-7 py-2.5 text-sm">
                  Calculate Another Chart
                </button>
              </>
            ) : (
              <>
                <h3 className="text-base font-display font-semibold text-text-primary mb-2">Save this result</h3>
                <p className="text-[13px] text-text-tertiary mb-5 max-w-md mx-auto">
                  Your birth details have not been stored. Create a free account to save this reading to your chart,
                  recalculate it after edits, and compare Soul Ages between saved charts.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/auth/signup" className="btn-primary px-7 py-2.5 text-sm">Create Account to Save Result</Link>
                  <button type="button" onClick={reset} className="btn-ghost px-7 py-2.5 text-sm">Calculate Another Person</button>
                </div>
              </>
            )}
          </div>

          <p className="text-[11px] text-text-muted text-center leading-relaxed px-4">
            {SOUL_AGE_DISCLAIMER}
            <br />
            <span className="opacity-70">{SOUL_AGE_CREDIT}</span>
          </p>
        </div>
      )}

      <style jsx global>{`
        .sa-input {
          width: 100%;
          background: #131829;
          border: 1px solid #262C42;
          border-radius: 12px;
          padding: 11px 13px;
          color: #E8EAF2;
          font-size: 14px;
        }
        .sa-input:focus { outline: none; border-color: #9B6FF6; }
        .sa-free-badge {
          display: inline-block;
          background: #22C55E;
          color: #04210F;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 3px 8px;
          border-radius: 999px;
        }
        .sa-summary {
          background: linear-gradient(160deg, #1B1436 0%, #131829 60%);
          border: 1px solid #3A2F63;
          border-radius: 24px;
          padding: 26px 24px;
        }
        .sa-eyebrow {
          display: block;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #9B6FF6;
          font-weight: 700;
        }
        .sa-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 14px;
        }
        .sa-stat {
          background: rgba(255,255,255,0.03);
          border: 1px solid #262C42;
          border-radius: 14px;
          padding: 13px 15px;
          min-width: 0;
        }
        .sa-stat-label {
          display: block;
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #7C86A6;
          margin-bottom: 5px;
        }
        .sa-stat-value {
          display: block;
          font-size: 21px;
          font-weight: 700;
          color: #E8EAF2;
          line-height: 1.2;
          overflow-wrap: anywhere;
        }
        .sa-stat-accent {
          font-size: 27px;
          background: linear-gradient(90deg, #9B6FF6, #EC4899);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .sa-table-wrap { overflow-x: auto; }
        .sa-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .sa-table th, .sa-table td {
          text-align: left;
          padding: 7px 10px;
          border-top: 1px solid #262C42;
          vertical-align: top;
        }
        .sa-table th { color: #7C86A6; font-weight: 500; width: 42%; }
        .sa-table td { color: #C3C9DC; overflow-wrap: anywhere; }
        .sa-table thead th { width: auto; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em; }
        .sa-stale {
          display: inline-block;
          margin-left: 6px;
          padding: 1px 6px;
          border-radius: 999px;
          background: rgba(245,166,35,0.16);
          color: #F5A623;
          font-size: 9.5px;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
