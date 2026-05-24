'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Search, ArrowLeft, Globe, ChevronRight } from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';

// ─── Helpers ─────────────────────────────────────────────────────
function prettyCategory(cat: string): string {
  return cat.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Very strong echo';
  if (score >= 60) return 'Strong echo';
  if (score >= 40) return 'Moderate echo';
  if (score >= 25) return 'Weak echo';
  return 'Faint echo';
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatPretty(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

function formatISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  war: '⚔️', politics: '🏛️', science: '🔬', culture: '🎭',
  economy: '📈', natural_disaster: '🌋', revolution: '✊', discovery: '🔭',
  religion: '🕊️', technology: '💡', art: '🎨', diplomacy: '🤝',
};

const EVIDENCE_COLORS: Record<string, string> = {
  thin: 'bg-amber-500/20 text-amber-400',
  moderate: 'bg-blue-500/20 text-blue-400',
  strong: 'bg-emerald-500/20 text-emerald-400',
  overwhelming: 'bg-purple-500/20 text-purple-400',
};

type Preset = 'today' | 'tomorrow' | 'week' | 'month' | 'custom';

function resolveDate(preset: Preset, customDate: string): string {
  const today = new Date();
  switch (preset) {
    case 'today':    return formatISODate(today);
    case 'tomorrow': return formatISODate(addDays(today, 1));
    case 'week':     return formatISODate(addDays(today, 7));
    case 'month':    return formatISODate(addDays(today, 30));
    case 'custom':   return customDate;
  }
}

export default function WorldEchoScannerPage() {
  const { t } = useTranslation();
  const [preset, setPreset] = useState<Preset>('today');
  const [customDate, setCustomDate] = useState(formatISODate(new Date()));
  const [scanType, setScanType] = useState<'global' | 'personal'>('global');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const scanDate = resolveDate(preset, customDate);

  async function scan() {
    setLoading(true);
    setError('');
    setActiveCategory(null);
    try {
      let data;
      try {
        data = await api.getWorldEchoDate(scanDate, scanType);
      } catch (e: any) {
        if (typeof e?.message === 'string' && (e.message.includes('404') || e.message.includes('not found'))) {
          data = await api.computeWorldEchoScan(scanDate, scanType);
        } else {
          throw e;
        }
      }
      setResults(data);
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.includes('429')) {
        setError('Too many scans this hour. Please wait a bit and try again.');
      } else if (msg.includes('400')) {
        setError('That date is out of range (max 60 days ahead, 5 years back).');
      } else {
        setError(err.message || 'Scan failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  const hits = results?.possible_hits_json || [];
  const patterns = (results?.pattern_results || []).slice(0, 5);

  const filteredHits = useMemo(() => {
    if (!activeCategory) return hits;
    return hits.filter((h: any) => (h.category || 'other') === activeCategory);
  }, [hits, activeCategory]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const h of hits) {
      const c = h.category || 'other';
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count);
  }, [hits]);

  const presets: Array<{ key: Preset; label: string }> = [
    { key: 'today', label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' },
    { key: 'week', label: '+7 days' },
    { key: 'month', label: '+30 days' },
    { key: 'custom', label: 'Custom' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/world-echo" className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">{t('worldEcho.title')}</h1>
          <p className="text-text-tertiary text-sm">{t('worldEcho.subtitle')}</p>
        </div>
      </div>

      <div className="card mb-6">
        <label className="text-sm text-text-secondary font-medium mb-3 block">Pick a date</label>
        <p className="text-xs text-text-muted mb-3">
          Compute the world echo for any date. Future scans run on demand and cache for an hour.
        </p>

        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map(p => (
            <button
              key={p.key}
              onClick={() => setPreset(p.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                preset === p.key
                  ? 'border-accent-primary bg-accent-primary/15 text-accent-primary'
                  : 'border-border-primary text-text-secondary hover:text-text-primary'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom date input */}
        {preset === 'custom' && (
          <div className="mb-4">
            <label className="text-xs text-text-muted mb-1 block">Custom date</label>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="input w-full"
            />
          </div>
        )}

        {/* Selected date display */}
        <div className="bg-bg-secondary rounded-lg border border-border-primary p-3 mb-4">
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold">Selected</p>
          <p className="text-sm font-semibold text-text-primary">{formatPretty(scanDate)}</p>
          <p className="text-xs text-text-muted">{scanDate}</p>
        </div>

        <div className="flex gap-3">
          <select
            value={scanType}
            onChange={(e) => setScanType(e.target.value as 'global' | 'personal')}
            className="input w-32"
          >
            <option value="global">Global</option>
            <option value="personal">Personal</option>
          </select>
          <button onClick={scan} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Search className="w-4 h-4" /> Scan {formatDate(scanDate)}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </div>

      {loading && <LoadingCosmic label={`Scanning echoes for ${formatDate(scanDate)}...`} />}

      {results && !loading && (
        <div className="space-y-5">
          {/* Scan summary */}
          <div className="card border-accent-muted bg-gradient-cosmic">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-accent-primary" />
              <span className="text-xs uppercase tracking-wider font-semibold text-text-muted">
                {formatDate(results.scan_date)} &middot; {hits.length} echoes found
              </span>
            </div>
            {hits.length > 0 && (
              <p className="text-sm text-text-primary">
                The closest historical match is &ldquo;{hits[0].title}&rdquo; ({Math.round(hits[0].score)} resonance).
              </p>
            )}
          </div>

          {/* Dominant patterns — clickable */}
          {patterns.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Dominant patterns</h3>
              <div className="space-y-2">
                {patterns.map((p: any) => (
                  <Link
                    key={p.pattern_name}
                    href={`/world-echo/pattern/${results.id}/${encodeURIComponent(p.pattern_name)}`}
                    className="card flex items-center gap-3 hover:border-accent-primary/30 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">{p.pattern_name}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {p.historical_match_count} historical matches
                        {p.event_category ? ` · mostly ${prettyCategory(p.event_category)}` : ''}
                      </p>
                      {p.lift_above_baseline != null && p.lift_above_baseline > 1 && (
                        <p className="text-xs text-accent-primary mt-0.5 font-medium">
                          {p.lift_above_baseline.toFixed(1)}× above baseline
                        </p>
                      )}
                    </div>
                    {p.evidence_tier && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${EVIDENCE_COLORS[p.evidence_tier] || EVIDENCE_COLORS.thin}`}>
                        {p.evidence_tier.charAt(0).toUpperCase() + p.evidence_tier.slice(1)}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Echo cards with category filter */}
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary">Historical echoes</h3>
              {activeCategory && (
                <span className="text-xs text-text-muted">{filteredHits.length} of {hits.length}</span>
              )}
            </div>

            {/* Category filter chips */}
            {categories.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                    activeCategory === null
                      ? 'border-accent-primary bg-accent-primary/15 text-accent-primary'
                      : 'border-border-primary text-text-secondary hover:text-text-primary'
                  }`}
                >
                  All
                </button>
                {categories.map(c => (
                  <button
                    key={c.slug}
                    onClick={() => setActiveCategory(activeCategory === c.slug ? null : c.slug)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                      activeCategory === c.slug
                        ? 'border-accent-primary bg-accent-primary/15 text-accent-primary'
                        : 'border-border-primary text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {CATEGORY_EMOJIS[c.slug] || '📌'} {prettyCategory(c.slug)} ({c.count})
                  </button>
                ))}
              </div>
            )}

            {filteredHits.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-text-muted">
                  {hits.length === 0
                    ? 'No echoes found for this date. Try a different date.'
                    : 'No echoes in this category. Click "All" to see everything.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHits.map((hit: any, idx: number) => (
                  <Link
                    key={hit.event_id || idx}
                    href={`/world-echo/event/${hit.event_id || idx}`}
                    className="card block hover:border-accent-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-text-muted font-bold">#{idx + 1}</span>
                      <span className="text-xs text-accent-primary font-semibold">
                        {scoreLabel(hit.score)} &middot; {Math.round(hit.score)}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-text-primary mb-1 line-clamp-2">{hit.title}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-secondary">{formatDate(hit.event_date)}</span>
                      <span className="text-xs text-text-muted italic">
                        {CATEGORY_EMOJIS[hit.category] || '📌'} {prettyCategory(hit.category || 'other')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {results.engine_version && (
            <p className="text-xs text-text-muted text-center pt-2">
              Engine version {results.engine_version}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
