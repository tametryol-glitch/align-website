'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Loader2, ShieldAlert, CheckCircle, ExternalLink } from 'lucide-react';

interface SuspiciousRow {
  user_id: string;
  display_name: string | null;
  username: string | null;
  email: string | null;
  created_at: string;
  score: number;
  reasons: string[];
}

// DD-MM-YYYY, the format used everywhere in Align.
function fmtDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}-${mm}-${d.getFullYear()}`;
}

export function SuspiciousPanel() {
  const [rows, setRows] = useState<SuspiciousRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [minScore, setMinScore] = useState(25);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase.rpc('admin_suspicious_accounts', {
      p_days: days,
      p_min_score: minScore,
    });
    if (err) {
      setError(
        err.message.includes('admin_suspicious_accounts')
          ? 'Detector not installed yet — run supabase-migration-suspicious-accounts.sql in the Supabase SQL Editor.'
          : err.message,
      );
      setRows([]);
    } else {
      setRows((data ?? []) as SuspiciousRow[]);
    }
    setLoading(false);
  }, [days, minScore]);

  useEffect(() => { load(); }, [load]);

  async function markLegit(userId: string) {
    const supabase = createClient();
    const { error: err } = await supabase.rpc('admin_mark_account_legit', { p_user_id: userId });
    if (err) { setError(err.message); return; }
    setRows((r) => r.filter((x) => x.user_id !== userId));
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert className="w-5 h-5 text-accent-primary" />
        <h2 className="text-lg font-semibold text-text-primary">Suspicious accounts</h2>
      </div>
      <p className="text-xs text-text-muted mb-4">
        Scored from shared devices, signup bursts, disposable emails, repeated text, link spam,
        activity rate, follow spam, reports and blocks. Nothing is removed automatically — review
        each account, then mark it legit or delete it from the Users tab.
      </p>

      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <label className="flex items-center gap-2 text-text-secondary">
          Joined in last
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-bg-card border border-border-primary rounded-lg px-2 py-1 text-text-primary"
          >
            {[7, 14, 30, 60, 90].map((d) => <option key={d} value={d}>{d} days</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-text-secondary">
          Min score
          <select
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="bg-bg-card border border-border-primary rounded-lg px-2 py-1 text-text-primary"
          >
            {[10, 25, 40, 60].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-text-muted" /></div>
      ) : rows.length === 0 && !error ? (
        <p className="text-text-muted text-sm text-center py-12">
          No accounts at or above score {minScore} in the last {days} days.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.user_id} className="bg-bg-card border border-border-primary rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-text-primary truncate">
                    {r.display_name || r.username || 'Unnamed'}
                    <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${r.score >= 60 ? 'bg-red-500/20 text-red-400' : r.score >= 40 ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {r.score}
                    </span>
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {r.email ?? 'no email'} · joined {fmtDate(r.created_at)}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a
                    href={`/u/${r.user_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-border-primary text-text-secondary hover:text-text-primary"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Profile
                  </a>
                  <button
                    onClick={() => markLegit(r.user_id)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Mark legit
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {r.reasons.map((reason) => (
                  <span key={reason} className="text-xs px-2 py-0.5 rounded-full bg-bg-tertiary text-text-secondary">
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
