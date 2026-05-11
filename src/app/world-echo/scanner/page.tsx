'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Search, ArrowLeft, Globe } from 'lucide-react';
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

const CATEGORY_EMOJIS: Record<string, string> = {
  war: '⚔️', politics: '🏛️', science: '🔬', culture: '🎭',
  economy: '📈', natural_disaster: '🌋', revolution: '✊', discovery: '🔭',
  religion: '🕊️', technology: '💡', art: '🎨', diplomacy: '🤝',
};

export default function WorldEchoScannerPage() {
  const [scanDate, setScanDate] = useState(new Date().toISOString().split('T')[0]);
  const [scanType, setScanType] = useState<'global' | 'personal'>('global');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function scan() {
    setLoading(true);
    setError('');
    try {
      // First try fetching cached result for that date
      let data;
      try {
        data = await api.getWorldEchoDate(scanDate, scanType);
      } catch (e: any) {
        // If 404 or not found, compute on demand
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
      } else {
        setError(err.message || 'Scan failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  const hits = results?.possible_hits_json || [];
  const patterns = (results?.pattern_results || []).slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/world-echo" className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Date Scanner</h1>
          <p className="text-text-tertiary text-sm">Scan any date for historical echoes</p>
        </div>
      </div>

      <div className="card mb-6">
        <label className="text-sm text-text-secondary font-medium mb-2 block">Select a date to scan</label>
        <div className="flex gap-3 mb-3">
          <input
            type="date"
            value={scanDate}
            onChange={(e) => setScanDate(e.target.value)}
            className="input flex-1"
          />
          <select
            value={scanType}
            onChange={(e) => setScanType(e.target.value as 'global' | 'personal')}
            className="input w-32"
          >
            <option value="global">Global</option>
            <option value="personal">Personal</option>
          </select>
        </div>
        <button onClick={scan} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          <Search className="w-4 h-4" /> Scan {formatDate(scanDate)}
        </button>
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

          {/* Dominant patterns */}
          {patterns.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Dominant patterns</h3>
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
                          {p.lift_above_baseline.toFixed(1)}× above baseline
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Echo cards */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Historical echoes</h3>
            {hits.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-text-muted">No echoes found for this date. Try a different date.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {hits.map((hit: any, idx: number) => (
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
