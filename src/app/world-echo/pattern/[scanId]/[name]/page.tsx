'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';

// --- Helpers matching main world-echo page ---

function prettyCategory(cat: string): string {
  return cat.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const EVIDENCE_COLORS: Record<string, string> = {
  thin: 'bg-amber-500/20 text-amber-400',
  moderate: 'bg-blue-500/20 text-blue-400',
  strong: 'bg-emerald-500/20 text-emerald-400',
  overwhelming: 'bg-purple-500/20 text-purple-400',
};

// --- Main Component ---

export default function PatternDetailPage() {
  const params = useParams();
  const scanId = params.scanId as string;
  const name = params.name as string;
  const decodedName = decodeURIComponent(name || '');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!scanId || !name) {
      setError('Missing scan or pattern reference.');
      setLoading(false);
      return;
    }
    api.getWorldEchoPatterns(scanId, decodedName)
      .then(setData)
      .catch((err: any) => {
        setError(
          err?.message?.includes('404')
            ? 'This pattern is no longer available.'
            : 'Could not load pattern matches. Check your connection.',
        );
      })
      .finally(() => setLoading(false));
  }, [scanId, name, decodedName]);

  if (loading) return <LoadingCosmic label="Loading pattern details..." />;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <Link href="/world-echo" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Error state */}
      {error && (
        <div className="card text-center py-8">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* No data fallback */}
      {!error && !data && (
        <div className="card text-center py-12">
          <p className="text-text-tertiary">No data available for this pattern.</p>
        </div>
      )}

      {/* Pattern detail */}
      {data && (
        <div className="space-y-5">
          {/* Summary card */}
          <div className="card border-accent-muted">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-display font-bold text-text-primary">
                {data.pattern_name}
              </h1>
              {data.evidence_tier && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${EVIDENCE_COLORS[data.evidence_tier] || EVIDENCE_COLORS.thin}`}>
                  {data.evidence_tier.charAt(0).toUpperCase() + data.evidence_tier.slice(1)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-2">
              {data.event_category && (
                <span className="text-xs px-3 py-1 rounded-lg bg-bg-tertiary text-text-primary font-semibold">
                  {prettyCategory(data.event_category)}
                </span>
              )}
              {data.historical_match_count != null && (
                <span className="text-xs text-text-muted">
                  {data.historical_match_count} historical {data.historical_match_count === 1 ? 'match' : 'matches'}
                </span>
              )}
            </div>

            {data.lift_above_baseline != null && data.lift_above_baseline > 1 && (
              <p className="text-sm text-accent-primary font-medium mb-2">
                {data.lift_above_baseline.toFixed(1)}&times; more often than baseline
              </p>
            )}

            <p className="text-xs text-text-secondary leading-relaxed">
              Tap any event below to see its full astrological signature and why it matched today&apos;s sky.
            </p>
          </div>

          {/* Matching events list */}
          {data.matching_events && data.matching_events.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3">
                {data.matching_events.length} historical {data.matching_events.length === 1 ? 'match' : 'matches'}
              </h3>

              <div className="space-y-3">
                {data.matching_events.map((ev: any) => (
                  <Link
                    key={ev.id}
                    href={`/world-echo/event/${ev.id}`}
                    className="card block hover:border-accent-primary/30 transition-colors"
                  >
                    <h4 className="text-sm font-semibold text-text-primary mb-1 line-clamp-2">
                      {ev.title}
                    </h4>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-text-secondary">{formatDate(ev.event_date)}</span>
                      <span className="text-xs text-text-muted italic">{prettyCategory(ev.category)}</span>
                    </div>
                    {(ev.location_name || ev.country) && (
                      <p className="text-xs text-text-tertiary">
                        <span className="mr-1">{'📍'}</span>
                        {ev.location_name || ''}{ev.location_name && ev.country ? ', ' : ''}{ev.country || ''}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty matching events */}
          {data.matching_events && data.matching_events.length === 0 && (
            <div className="card text-center py-8">
              <p className="text-sm text-text-muted italic">No matching events found for this pattern.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
