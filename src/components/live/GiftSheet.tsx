'use client';

// ═══════════════════════════════════════════════════════════════════
// Gift picker.
//
// Shows the balance and the catalog together, because the question a
// viewer is actually asking is "what can I afford right now" — a grid
// that lets you tap something you cannot buy wastes the tap and the
// moment.
//
// The daily claim lives here rather than in settings for the same
// reason: the point of needing coins is the point of getting them.
//
// Kept in step with align-app/src/components/social/GiftSheet.tsx.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react';
import { X, Coins, Gift as GiftIcon } from 'lucide-react';
import {
  getGiftCatalog,
  getCoinBalance,
  claimDailyCoins,
  sendGift,
  giftGlyph,
  type Gift,
  type CoinBalance,
} from '@/lib/coinService';

export function GiftSheet({
  sessionId,
  open,
  onClose,
  onSent,
}: {
  sessionId: string;
  open: boolean;
  onClose: () => void;
  /** So the stream can celebrate immediately rather than waiting on realtime. */
  onSent?: (gift: Gift) => void;
}) {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [balance, setBalance] = useState<CoinBalance | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setBalance(await getCoinBalance());
  }, []);

  useEffect(() => {
    if (!open) return;
    getGiftCatalog().then(setGifts);
    refresh();
  }, [open, refresh]);

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
    refresh();
  }, [refresh]);

  const send = useCallback(
    async (gift: Gift) => {
      setSending(gift.id);
      const res = await sendGift(sessionId, gift.id);
      setSending(null);
      if (!res.ok) {
        setNote(res.error);
        return;
      }
      setBalance((b) => (b ? { ...b, total: res.balance } : b));
      onSent?.(gift);
      onClose();
    },
    [sessionId, onSent, onClose],
  );

  if (!open) return null;

  const total = balance?.total ?? 0;

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal="true">
      <button
        aria-label="Close gifts"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md bg-neutral-900 border-t border-white/10 rounded-t-2xl p-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="flex items-center gap-1.5 text-sm text-white">
            <Coins className="w-4 h-4 text-amber-300" />
            <span className="tabular-nums font-medium">{total}</span>
            <span className="text-white/45">coins</span>
          </span>

          <div className="flex items-center gap-2">
            {balance?.can_claim && (
              <button
                onClick={claim}
                className="text-xs px-3 py-1.5 rounded-full bg-amber-400/15 text-amber-200
                           hover:bg-amber-400/25 transition-colors"
              >
                Claim 20 free
              </button>
            )}
            <button onClick={onClose} aria-label="Close" className="text-white/40 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {note && (
          <div className="mb-3 text-xs text-white/70 bg-white/5 rounded-lg px-3 py-2">{note}</div>
        )}

        <div className="grid grid-cols-4 gap-2">
          {gifts.map((g) => {
            const afford = total >= g.coins;
            return (
              <button
                key={g.id}
                disabled={!afford || sending !== null}
                onClick={() => send(g)}
                title={afford ? `Send ${g.name}` : `Needs ${g.coins} coins`}
                className={`flex flex-col items-center gap-1 rounded-xl py-3 px-1 border transition-colors ${
                  afford
                    ? 'border-white/10 hover:border-amber-300/40 hover:bg-white/5'
                    : 'border-transparent opacity-35 cursor-not-allowed'
                } ${sending === g.id ? 'animate-pulse' : ''}`}
              >
                <span className="text-2xl leading-none" aria-hidden="true">
                  {giftGlyph(g.id)}
                </span>
                <span className="text-[10px] text-white/70 truncate max-w-full">{g.name}</span>
                <span className="text-[10px] text-amber-300/80 tabular-nums">{g.coins}</span>
              </button>
            );
          })}
        </div>

        {gifts.length === 0 && (
          <p className="text-sm text-white/40 text-center py-6 flex items-center justify-center gap-2">
            <GiftIcon className="w-4 h-4" />
            No gifts available.
          </p>
        )}

        <p className="text-[11px] text-white/30 mt-4 text-center">
          Coins are free while gifting is in preview. They have no cash value.
        </p>
      </div>
    </div>
  );
}
