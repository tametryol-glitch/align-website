'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Globe, Search, Info, X, RefreshCw } from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';

// ─── Helpers matching mobile app ─────────────────────────────────

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

function formatRelative(iso: string): string {
  const t = new Date(iso).getTime();
  if (isNaN(t)) return iso;
  const diffMin = Math.round((Date.now() - t) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.round(diffHr / 24)}d ago`;
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

function composeDailySummary(scan: any): string {
  const hits = scan.possible_hits_json || [];
  const patterns = scan.pattern_results || [];
  const sentences: string[] = [];

  const ranked = [...patterns].sort((a: any, b: any) => {
    const la = a.lift_above_baseline ?? 0;
    const lb = b.lift_above_baseline ?? 0;
    if (lb !== la) return lb - la;
    return b.historical_match_count - a.historical_match_count;
  });
  const top = ranked[0];
  if (top) {
    const lift = top.lift_above_baseline;
    if (lift != null && lift > 1) {
      sentences.push(`The strongest signal today is ${top.pattern_name} — ${lift.toFixed(1)}× more common than baseline across the corpus.`);
    } else {
      sentences.push(`The strongest signal today is ${top.pattern_name} (${top.historical_match_count} historical matches).`);
    }
  }

  const cats = scan.top_categories_json || [];
  if (cats.length > 0) {
    const head = cats.slice(0, 2).map((c: any) => `${prettyCategory(c.category)} (${c.count})`).join(' and ');
    sentences.push(`Today’s echoes lean ${head}.`);
  }

  if (hits.length > 0) {
    sentences.push(`The closest historical match is “${hits[0].title}”.`);
  }

  if (sentences.length === 0) {
    return "Today’s scan has no strong signals — the sky is in a quiet phase relative to the corpus.";
  }
  return sentences.join(' ');
}

// ─── Main Component ──────────────────────────────────────────────

export default function WorldEchoPage() {
  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHow, setShowHow] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  async function loadToday(force = false) {
    setLoading(true);
    setError('');
    try {
      let fresh;
      try {
        fresh = await api.getWorldEchoToday();
      } catch (e: any) {
        // Fallback: if daily cron hasn't run, compute on-demand
        if (typeof e?.message === 'string' && e.message.includes('404')) {
          fresh = await api.computeWorldEchoScan(today, 'global');
        } else {
          throw e;
        }
      }
      setScan(fresh);
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.includes('429')) {
        setError('Too many on-demand scans this hour. Please wait a bit and try again.');
      } else {
        setError('Could not load echoes. Check your connection and retry.');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadToday(); }, []);

  const allHits = scan?.possible_hits_json || [];
  const filteredHits = useMemo(() => {
    if (!activeCategory) return allHits;
    return allHits.filter((h: any) => (h.category || 'other') === activeCategory);
  }, [allHits, activeCategory]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const h of allHits) {
      const c = h.category || 'other';
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count);
  }, [allHits]);

  const summary = useMemo(() => (scan ? composeDailySummary(scan) : ''), [scan]);
  const patterns = (scan?.pattern_results || []).slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-accent-primary" />
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">World Echo</h1>
            <p className="text-text-tertiary text-sm">Today&apos;s historical resonances</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/world-echo/scanner" className="btn-ghost text-sm flex items-center gap-1">
            <Search className="w-4 h-4" /> Scanner
          </Link>
          <button onClick={() => setShowHow(!showHow)} className="btn-ghost p-2">
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* How it works panel */}
      {showHow && (
        <div className="card mb-5 border-accent-primary/20 relative">
          <button onClick={() => setShowHow(false)} className="absolute top-3 right-3 text-text-muted hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
          <h3 className="font-semibold text-text-primary mb-3">How World Echo Works</h3>
          <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
            <p>
              World Echo Engine computes today&apos;s astrological signature (planet longitudes, major aspects,
              lunar phase, named patterns) and compares it against a curated corpus of historical events.
            </p>
            <h4 className="font-semibold text-text-primary text-xs uppercase tracking-wider">What &ldquo;lift above baseline&rdquo; means</h4>
            <p>
              Some aspects are common, some are rare. Lift = how much more often a pattern shows up in
              today&apos;s matches vs in a random sample of dates 1900-2026. Lift &gt; 1.5x is real signal.
            </p>
            <h4 className="font-semibold text-text-primary text-xs uppercase tracking-wider">What World Echo is not</h4>
            <p>
              This is not a prediction tool. Historical resonance is pattern recognition, not prophecy.
              Use it as a lens for understanding today&apos;s energetic backdrop.
            </p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && <LoadingCosmic label="Reading the sky…" />}

      {/* Error state */}
      {!loading && error && (
        <div className="card text-center py-12">
          <span className="text-4xl block mb-4">&#x26A0;&#xFE0F;</span>
          <p className="text-text-tertiary mb-4">{error}</p>
          <button onClick={() => loadToday(true)} className="btn-primary inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {/* Results */}
      {!loading && !error && scan && (
        <div className="space-y-5">
          {/* Intro */}
          <div>
            <h2 className="text-xl font-display font-bold text-text-primary mb-1">
              Today&apos;s sky has appeared before
            </h2>
            <p className="text-sm text-text-secondary">
              These {allHits.length} historical events share the strongest astrological patterns
              with today, {formatDate(scan.scan_date)}.
            </p>
          </div>

          {/* Daily Summary */}
          {summary && (
            <div className="card border-accent-muted bg-gradient-cosmic">
              <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-2">
                Today in one paragraph
              </p>
              <p className="text-sm text-text-primary leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Scan another date CTA */}
          <Link href="/world-echo/scanner" className="inline-block px-4 py-2 bg-bg-tertiary rounded-xl text-sm text-accent-primary font-semibold hover:bg-bg-tertiary/80 transition-colors">
            Scan another date &rarr;
          </Link>

          {/* Dominant Patterns */}
          {patterns.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3 mt-2">Dominant patterns today</h3>
              <div className="space-y-2">
                {patterns.map((p: any) => (
                  <div key={p.pattern_name} className="card flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">{p.pattern_name}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {p.historical_match_count} historical matches
                        {p.event_category ? ` · mostly ${prettyCategory(p.event_category)}` : ''}
                      </p>
                      {p.lift_above_baseline != null && p.lift_above_baseline > 1 && (
                        <p className="text-xs text-accent-primary mt-0.5 font-medium">
                          {p.lift_above_baseline.toFixed(1)}× more often than baseline
                        </p>
                      )}
                    </div>
                    {p.evidence_tier && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${EVIDENCE_COLORS[p.evidence_tier] || EVIDENCE_COLORS.thin}`}>
                        {p.evidence_tier.charAt(0).toUpperCase() + p.evidence_tier.slice(1)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Historical Echoes */}
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary">Top historical echoes</h3>
              {activeCategory && (
                <span className="text-xs text-text-muted">{filteredHits.length} of {allHits.length}</span>
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

            {/* Echo cards */}
            {filteredHits.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6 italic">
                No echoes in this category. Tap &ldquo;All&rdquo; to see everything.
              </p>
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
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-text-secondary">{formatDate(hit.event_date)}</span>
                      <span className="text-xs text-text-muted italic">{prettyCategory(hit.category)}</span>
                    </div>
                    {hit.shared_aspects && hit.shared_aspects.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {hit.shared_aspects.slice(0, 3).map((a: any, j: number) => (
                          <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-bg-tertiary text-text-secondary">
                            {a.aspect}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="text-xs text-text-muted text-center pt-4">
            Engine version {scan.engine_version} &middot; scan computed {formatRelative(scan.created_at)}
          </p>

          {/* Refresh */}
          <button
            onClick={() => loadToday(true)}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Scan
          </button>
        </div>
      )}

      {/* No data fallback */}
      {!loading && !error && !scan && (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">&#x1F30D;</span>
          <p className="text-text-tertiary mb-2">No scan data available.</p>
          <button onClick={() => loadToday(true)} className="btn-primary">
            Scan Today&apos;s Sky
          </button>
        </div>
      )}
    </div>
  );
}
