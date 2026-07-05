'use client';

/**
 * Zodisphere Intelligence -- private admin analytics for the community globe.
 *
 * PRIVACY BY DESIGN: this dashboard reads the SAME banded, k>=10 RPC the
 * public globe uses. There is no raw-count path from the browser — the
 * stats table is default-deny, individual user locations do not exist in
 * the system, and there is deliberately NO per-user map to build. Bands,
 * thresholds, and daily-batch delay apply to admins exactly as to users.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { ArrowLeft, Globe2, Loader2, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import {
  getPublicAreaStats,
  bandMidpoint,
  type AreaStat,
  type CountBand,
} from '@/lib/zodisphereService';

type LevelFilter = 'all' | 'city' | 'country';

const bandCell = (band: CountBand | null) => band ?? '—';

export default function ZodisphereIntelligencePage() {
  const { profile } = useAuthStore();
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [areas, setAreas] = useState<AreaStat[]>([]);
  const [filter, setFilter] = useState<LevelFilter>('all');
  const [query, setQuery] = useState('');

  // Server-verified admin check (same pattern as the other admin pages)
  useEffect(() => {
    async function verifyAdmin() {
      if (!profile?.is_admin) return;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      if (data?.is_admin) setVerified(true);
    }
    verifyAdmin();
  }, [profile]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAreas(await getPublicAreaStats());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (verified) load();
  }, [verified, load]);

  const rows = useMemo(() => {
    let r = areas;
    if (filter !== 'all') {
      r = r.filter((a) =>
        filter === 'country' ? a.geographic_level === 'country' : a.geographic_level !== 'country'
      );
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      r = r.filter((a) => a.display_name.toLowerCase().includes(q));
    }
    return [...r].sort((a, b) => bandMidpoint(b.member_band) - bandMidpoint(a.member_band));
  }, [areas, filter, query]);

  const cityCount = useMemo(() => areas.filter((a) => a.geographic_level !== 'country').length, [areas]);
  const countryCount = useMemo(() => areas.filter((a) => a.geographic_level === 'country').length, [areas]);
  const lastCalculated = areas[0]?.calculated_at ? new Date(areas[0].calculated_at).toLocaleString() : '—';

  if (!verified) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <p className="text-sm text-text-muted">
          {profile?.is_admin ? 'Verifying access…' : 'Access denied.'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to admin
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-accent-primary" />
            <h1 className="text-xl font-semibold text-text-primary">Zodisphere Intelligence</h1>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-text-secondary bg-bg-card border border-border-primary hover:bg-bg-tertiary"
          >
            <RefreshCw className="w-4 h-4" /> Reload
          </button>
        </div>

        {/* Privacy contract — visible to every admin who opens this page */}
        <div className="flex items-start gap-2 mt-4 bg-bg-card border border-border-primary rounded-xl p-3">
          <ShieldCheck className="w-4 h-4 text-accent-primary mt-0.5 flex-shrink-0" />
          <p className="text-[12px] text-text-muted leading-relaxed">
            All figures are <strong className="text-text-secondary">aggregated, banded, and k≥10 suppressed</strong> —
            identical to what members see on the globe, refreshed once daily. Individual user locations do not
            exist anywhere in the system, and no per-user geographic view can be built from this data.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-bg-card border border-border-primary rounded-xl p-4">
            <p className="text-[11px] text-text-muted uppercase tracking-wider">Active cities</p>
            <p className="text-2xl font-semibold text-text-primary mt-1">{cityCount}</p>
            <p className="text-[11px] text-text-muted">with 10+ opted-in members</p>
          </div>
          <div className="bg-bg-card border border-border-primary rounded-xl p-4">
            <p className="text-[11px] text-text-muted uppercase tracking-wider">Active countries</p>
            <p className="text-2xl font-semibold text-text-primary mt-1">{countryCount}</p>
            <p className="text-[11px] text-text-muted">above threshold</p>
          </div>
          <div className="bg-bg-card border border-border-primary rounded-xl p-4">
            <p className="text-[11px] text-text-muted uppercase tracking-wider">Last refresh</p>
            <p className="text-sm font-medium text-text-primary mt-2">{lastCalculated}</p>
            <p className="text-[11px] text-text-muted">daily batch (06:15 UTC)</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-6 flex-wrap">
          {(['all', 'city', 'country'] as LevelFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                filter === f
                  ? 'bg-accent-primary/15 border-accent-primary text-accent-primary'
                  : 'bg-bg-card border-border-primary text-text-muted hover:text-text-primary'
              }`}
            >
              {f === 'all' ? 'All areas' : f === 'city' ? 'Cities' : 'Countries'}
            </button>
          ))}
          <div className="flex items-center gap-2 bg-bg-card border border-border-primary rounded-lg px-3 py-1.5 ml-auto">
            <Search className="w-3.5 h-3.5 text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name…"
              className="bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none w-40"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-text-muted mt-8 text-center">
            No areas above the k≥10 threshold yet. The board fills in as city communities opt in.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border-primary">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg-card text-[11px] uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="px-3 py-2.5">Area</th>
                  <th className="px-3 py-2.5">Level</th>
                  <th className="px-3 py-2.5">Members</th>
                  <th className="px-3 py-2.5">Active 30d</th>
                  <th className="px-3 py-2.5">Posts</th>
                  <th className="px-3 py-2.5">Creators</th>
                  <th className="px-3 py-2.5">Events</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {rows.map((a) => (
                  <tr key={a.area_id} className="hover:bg-bg-card/60">
                    <td className="px-3 py-2.5 text-text-primary">{a.display_name}</td>
                    <td className="px-3 py-2.5 text-text-muted text-xs uppercase">{a.geographic_level}</td>
                    <td className="px-3 py-2.5 text-accent-primary font-medium">{bandCell(a.member_band)}</td>
                    <td className="px-3 py-2.5 text-text-secondary">{bandCell(a.active_band)}</td>
                    <td className="px-3 py-2.5 text-text-secondary">{bandCell(a.post_band)}</td>
                    <td className="px-3 py-2.5 text-text-secondary">{bandCell(a.creator_band)}</td>
                    <td className="px-3 py-2.5 text-text-secondary">{bandCell(a.event_band)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
