'use client';

// ═══════════════════════════════════════════════════════════════════
// /coins — your balance, where it came from, and what you received.
//
// Deliberately NOT in the middleware public allowlist: this is personal
// financial-shaped data and should sit behind the login gate.
//
// Everything is denominated in coins and gift counts, never currency.
// While the earning rate is zero, a "$0.00 pending" figure would invite
// a question whose answer becomes a commitment — so the page simply
// does not make one.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Coins, Gift, Loader2 } from 'lucide-react';
import {
  getCoinBalance,
  claimDailyCoins,
  getCoinLedger,
  getCreatorEarnings,
  type CoinBalance,
  type CoinLedgerEntry,
  type CreatorEarningsSummary,
} from '@/lib/coinService';

function when(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function describe(e: CoinLedgerEntry) {
  if (e.entry_type === 'grant') return e.reason === 'daily' ? 'Daily coins' : 'Coins added';
  if (e.entry_type === 'spend') return e.reason ? `Sent ${e.reason}` : 'Gift sent';
  if (e.entry_type === 'purchase') return 'Coins purchased';
  if (e.entry_type === 'refund') return 'Refunded';
  if (e.entry_type === 'expire') return 'Expired';
  return e.reason || e.entry_type;
}

export default function CoinsPage() {
  const [balance, setBalance] = useState<CoinBalance | null>(null);
  const [ledger, setLedger] = useState<CoinLedgerEntry[]>([]);
  const [earnings, setEarnings] = useState<CreatorEarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [b, l, e] = await Promise.all([
      getCoinBalance(),
      getCoinLedger(30),
      getCreatorEarnings(),
    ]);
    setBalance(b);
    setLedger(l);
    setEarnings(e);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), 4000);
    return () => clearTimeout(t);
  }, [note]);

  const claim = useCallback(async () => {
    const res = await claimDailyCoins();
    if (!res) {
      setNote('Could not claim right now.');
      return;
    }
    setNote(res.granted > 0 ? `+${res.granted} coins` : 'Already claimed — come back tomorrow.');
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
      </div>
    );
  }

  const received = earnings?.gifts_received ?? 0;

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-lg mx-auto px-5 py-8">
        <Link
          href="/feed"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="text-2xl font-display font-bold text-text-primary mb-6">Coins</h1>

        {/* Balance */}
        <div className="rounded-2xl border border-border-primary bg-bg-secondary p-5 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Coins className="w-5 h-5 text-amber-300" />
            <span className="text-3xl font-semibold text-text-primary tabular-nums">
              {balance?.total ?? 0}
            </span>
          </div>
          <p className="text-sm text-text-muted">
            Spend them on gifts during a live stream.
          </p>

          {balance?.can_claim ? (
            <button
              onClick={claim}
              className="mt-4 w-full rounded-lg bg-amber-400/15 text-amber-200 hover:bg-amber-400/25
                         py-2.5 text-sm font-medium transition-colors"
            >
              Claim 20 free coins
            </button>
          ) : (
            <p className="mt-4 text-xs text-text-muted">
              Next free coins available tomorrow.
            </p>
          )}

          {note && <p className="mt-3 text-sm text-text-secondary">{note}</p>}
        </div>

        {/* What you have received as a host. Counts, not currency. */}
        {received > 0 && (
          <div className="rounded-2xl border border-border-primary bg-bg-secondary p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-4 h-4 text-amber-300" />
              <h2 className="text-sm font-medium text-text-primary">Gifts you received</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-2xl font-semibold text-text-primary tabular-nums">
                  {received}
                </div>
                <div className="text-xs text-text-muted mt-0.5">Gifts</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-text-primary tabular-nums">
                  {earnings?.coins_received ?? 0}
                </div>
                <div className="text-xs text-text-muted mt-0.5">Coins</div>
              </div>
            </div>
            <p className="text-xs text-text-muted mt-4">
              Gifting is in preview, so gifts are sent with free coins and do not earn.{' '}
              <Link href="/terms/creator-payouts" className="text-accent-primary underline">
                Payout terms
              </Link>
            </p>
          </div>
        )}

        {/* History */}
        <div className="rounded-2xl border border-border-primary bg-bg-secondary p-5">
          <h2 className="text-sm font-medium text-text-primary mb-3">History</h2>

          {ledger.length === 0 ? (
            <p className="text-sm text-text-muted">Nothing yet. Claim your free coins above.</p>
          ) : (
            <ul className="divide-y divide-border-primary">
              {ledger.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-2.5">
                  <span className="min-w-0">
                    <span className="block text-sm text-text-primary truncate">{describe(e)}</span>
                    <span className="block text-xs text-text-muted">{when(e.created_at)}</span>
                  </span>
                  <span
                    className={`text-sm tabular-nums shrink-0 ${
                      e.coins > 0 ? 'text-emerald-400' : 'text-text-muted'
                    }`}
                  >
                    {e.coins > 0 ? '+' : ''}
                    {e.coins}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-xs text-text-muted mt-6 text-center">
          Coins are free while gifting is in preview and have no cash value.{' '}
          <Link href="/terms/coins" className="text-accent-primary underline">
            Coin terms
          </Link>
        </p>
      </div>
    </div>
  );
}
