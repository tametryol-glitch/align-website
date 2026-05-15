'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import {
  Shield, DollarSign, ArrowLeft, Loader2, CheckCircle, XCircle,
  Filter, Clock, CreditCard, AlertTriangle,
} from 'lucide-react';

// ── Types (mirrors mobile creatorMonetization.ts) ────────────────────

type PayoutStatus =
  | 'requested'
  | 'pending_floor'
  | 'pending_threshold'
  | 'queued'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'cancelled';

interface PendingPayoutRow {
  id: string;
  creator_id: string;
  creator_display_name: string | null;
  creator_email: string | null;
  amount_cents: number;
  status: PayoutStatus;
  requested_at: string;
  payout_method: any | null;
  tax_form_status: string | null;
  tax_form_url: string | null;
}

type StatusFilter = 'actionable' | 'paid' | 'failed' | 'all';

const cents = (c: number | null | undefined) =>
  `$${((c ?? 0) / 100).toFixed(2)}`;

const ACTIONABLE_STATUSES: PayoutStatus[] = ['requested', 'pending_floor', 'pending_threshold', 'queued', 'processing'];

// ── Page ─────────────────────────────────────────────────────────────

export default function AdminPayoutsPage() {
  const { profile } = useAuthStore();
  const [verified, setVerified] = useState(false);
  const [rows, setRows] = useState<PendingPayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('actionable');
  const [error, setError] = useState<string | null>(null);

  // Mark-paid modal state
  const [paidModalRow, setPaidModalRow] = useState<PendingPayoutRow | null>(null);
  const [providerRef, setProviderRef] = useState('');
  const [method, setMethod] = useState('wise');
  const [submitting, setSubmitting] = useState(false);

  // Fail modal state
  const [failModalRow, setFailModalRow] = useState<PendingPayoutRow | null>(null);
  const [failReason, setFailReason] = useState('');

  // Server-verified admin check
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

  const load = useCallback(async (statusFilter: StatusFilter = 'actionable') => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    let query = supabase
      .from('creator_payouts')
      .select(`
        id, creator_id, amount_cents, status, requested_at,
        profile:profiles!creator_payouts_creator_id_fkey(display_name, email)
      `)
      .order('requested_at', { ascending: statusFilter === 'actionable' });

    if (statusFilter === 'actionable') {
      query = query.in('status', ACTIONABLE_STATUSES);
    } else if (statusFilter === 'paid') {
      query = query.eq('status', 'paid');
    } else if (statusFilter === 'failed') {
      query = query.in('status', ['failed', 'cancelled']);
    }

    const { data, error: fetchErr } = await query.limit(200);

    if (fetchErr) {
      setError(fetchErr.message);
      setLoading(false);
      return;
    }

    const creatorIds = Array.from(new Set((data ?? []).map((r: any) => r.creator_id).filter(Boolean)));
    let creatorProfiles: Record<string, any> = {};
    if (creatorIds.length > 0) {
      const { data: cpData } = await supabase
        .from('creator_profiles')
        .select('id, payout_method, tax_form_status, tax_form_url')
        .in('id', creatorIds);
      if (cpData) {
        for (const cp of cpData) creatorProfiles[cp.id] = cp;
      }
    }

    const mapped: PendingPayoutRow[] = (data ?? []).map((r: any) => {
      const cp = creatorProfiles[r.creator_id];
      return {
        id: r.id,
        creator_id: r.creator_id,
        creator_display_name: r.profile?.display_name ?? null,
        creator_email: r.profile?.email ?? null,
        amount_cents: r.amount_cents,
        status: r.status,
        requested_at: r.requested_at,
        payout_method: cp?.payout_method ?? null,
        tax_form_status: cp?.tax_form_status ?? null,
        tax_form_url: cp?.tax_form_url ?? null,
      };
    });

    setRows(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (verified) load(filter);
  }, [verified, filter, load]);

  // ── Actions ──

  const markPaid = async () => {
    if (!paidModalRow || !providerRef.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    const { error: rpcErr } = await supabase.rpc('admin_mark_payout_paid', {
      p_payout_id: paidModalRow.id,
      p_provider_reference: providerRef.trim(),
      p_method: method,
    });
    setSubmitting(false);
    if (rpcErr) { setError(rpcErr.message); return; }
    setPaidModalRow(null);
    setProviderRef('');
    load(filter);
  };

  const markFailed = async () => {
    if (!failModalRow || !failReason.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    const { error: rpcErr } = await supabase.rpc('admin_mark_payout_failed', {
      p_payout_id: failModalRow.id,
      p_reason: failReason.trim(),
    });
    setSubmitting(false);
    if (rpcErr) { setError(rpcErr.message); return; }
    setFailModalRow(null);
    setFailReason('');
    load(filter);
  };

  const moveToQueued = async (row: PendingPayoutRow) => {
    const supabase = createClient();
    const { error: rpcErr } = await supabase.rpc('admin_mark_payout_queued', {
      p_payout_id: row.id,
    });
    if (rpcErr) { setError(rpcErr.message); return; }
    load(filter);
  };

  // Guard
  if (!profile || !profile.is_admin || !verified) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-text-primary">Access Denied</h1>
        <p className="text-text-muted text-sm mt-2">Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin" className="text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <DollarSign className="w-7 h-7 text-accent-primary" />
        <h1 className="text-2xl font-display font-bold text-text-primary">Payout Queue</h1>
      </div>
      <p className="text-sm text-text-muted mb-6 ml-12">
        Manual processing. Wire / PayPal / Wise the amount, then mark paid with the transaction ID.
      </p>

      {error && (
        <div className="card mb-4 border border-red-500/30 bg-red-500/5">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-bg-tertiary rounded-xl p-1">
        {([
          { key: 'actionable', label: 'Pending', icon: Clock },
          { key: 'paid', label: 'Paid', icon: CheckCircle },
          { key: 'failed', label: 'Failed', icon: XCircle },
          { key: 'all', label: 'All', icon: Filter },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-bg-card text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <Icon className="w-4 h-4 inline mr-1.5" /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="text-text-secondary">No payouts in this view.</p>
          <p className="text-xs text-text-muted mt-1">
            {filter === 'actionable' ? 'Queue is clear!' : 'No matching records.'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-text-muted mb-3">{rows.length} payout{rows.length !== 1 ? 's' : ''}</p>
          <div className="space-y-3">
            {rows.map(row => (
              <div key={row.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {row.creator_display_name || 'Unnamed Creator'}
                    </p>
                    <p className="text-xs text-text-muted">{row.creator_email || ''}</p>
                  </div>
                  <p className="text-lg font-bold text-accent-primary">{cents(row.amount_cents)}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <StatusBadge status={row.status} />
                  <TaxBadge status={row.tax_form_status} />
                </div>

                <p className="text-xs text-text-muted">
                  Requested {new Date(row.requested_at).toLocaleDateString()}{' '}
                  {new Date(row.requested_at).toLocaleTimeString()}
                </p>

                {row.payout_method ? (
                  <p className="text-xs text-text-muted mt-1">
                    Method: <span className="font-mono text-text-secondary">{typeof row.payout_method === 'object' ? JSON.stringify(row.payout_method) : row.payout_method}</span>
                  </p>
                ) : (
                  <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> No payout method on file
                  </p>
                )}

                {/* Actions for actionable statuses */}
                {ACTIONABLE_STATUSES.includes(row.status) && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border-primary">
                    {row.status === 'requested' && (
                      <button
                        onClick={() => moveToQueued(row)}
                        className="px-3 py-1.5 rounded-lg border border-border-primary text-xs font-medium text-text-primary hover:bg-bg-tertiary transition-colors"
                      >
                        Queue
                      </button>
                    )}
                    <button
                      onClick={() => { setPaidModalRow(row); setProviderRef(''); setMethod('wise'); }}
                      className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-xs font-medium text-green-400 hover:bg-green-500/20 transition-colors"
                    >
                      Mark Paid
                    </button>
                    <button
                      onClick={() => { setFailModalRow(row); setFailReason(''); }}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Mark-Paid Modal */}
      {paidModalRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPaidModalRow(null)}>
          <div className="card max-w-md w-full space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-text-primary">Mark Paid</h2>
            <p className="text-sm text-text-secondary">
              {paidModalRow.creator_display_name} &mdash; {cents(paidModalRow.amount_cents)}
            </p>

            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wider mb-1">Payout Method</label>
              <div className="flex flex-wrap gap-2">
                {(['wise', 'paypal', 'wire', 'manual'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      method === m
                        ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                        : 'border-border-primary text-text-secondary hover:bg-bg-tertiary'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wider mb-1">Transaction Reference *</label>
              <input
                className="input"
                value={providerRef}
                onChange={e => setProviderRef(e.target.value)}
                placeholder="Wise tx id / PayPal batch id / wire ref"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setPaidModalRow(null)} className="px-4 py-2 rounded-lg text-sm text-text-muted hover:bg-bg-tertiary transition-colors">
                Cancel
              </button>
              <button
                onClick={markPaid}
                disabled={submitting || !providerRef.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-500 transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Confirm Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fail Modal */}
      {failModalRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setFailModalRow(null)}>
          <div className="card max-w-md w-full space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-text-primary">Reject Payout</h2>
            <p className="text-sm text-text-secondary">
              {failModalRow.creator_display_name} &mdash; {cents(failModalRow.amount_cents)}
            </p>

            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wider mb-1">Reason (visible to creator) *</label>
              <textarea
                className="input min-h-[80px]"
                value={failReason}
                onChange={e => setFailReason(e.target.value)}
                placeholder="e.g. Insufficient available earnings, Tax form not on file..."
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => setFailReason('Insufficient available earnings.')} className="px-3 py-1 rounded-lg border border-border-primary text-xs text-text-secondary hover:bg-bg-tertiary transition-colors">
                Insufficient earnings
              </button>
              <button onClick={() => setFailReason('Tax form not on file.')} className="px-3 py-1 rounded-lg border border-border-primary text-xs text-text-secondary hover:bg-bg-tertiary transition-colors">
                Tax form missing
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setFailModalRow(null)} className="px-4 py-2 rounded-lg text-sm text-text-muted hover:bg-bg-tertiary transition-colors">
                Cancel
              </button>
              <button
                onClick={markFailed}
                disabled={submitting || !failReason.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Reject Payout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Badge components ──

function StatusBadge({ status }: { status: PayoutStatus }) {
  const colors: Record<string, string> = {
    requested: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    pending_floor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    pending_threshold: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    queued: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    processing: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    paid: 'text-green-400 bg-green-400/10 border-green-400/30',
    failed: 'text-red-400 bg-red-400/10 border-red-400/30',
    cancelled: 'text-text-muted bg-bg-tertiary border-border-primary',
  };

  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${colors[status] || colors.cancelled}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function TaxBadge({ status }: { status: string | null }) {
  if (status === 'approved') {
    return (
      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border text-green-400 bg-green-400/10 border-green-400/30">
        Tax Approved
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border text-amber-400 bg-amber-400/10 border-amber-400/30">
      Tax: {status || 'not submitted'}
    </span>
  );
}
