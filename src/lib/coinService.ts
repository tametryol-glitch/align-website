// ═══════════════════════════════════════════════════════════════════
// Coin Service — balances, the gift catalog, and sending a gift.
//
// The whole economy runs with no money attached: coins are granted
// rather than sold, and earnings accrue at a rate of zero. Nothing in
// this file knows or cares about that — the rate lives in one SQL
// function, so switching money on changes no client code.
//
// Every mutation goes through a SECURITY DEFINER RPC. There are no
// write policies on balances or the ledger, so a balance cannot be
// edited with an anon key even if this file were compromised.
//
// Kept in step with align-app/src/services/coinService.ts.
// ═══════════════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase';

export interface Gift {
  id: string;
  name: string;
  coins: number;
  hearts_value: number;
  asset_kind: 'static' | 'lottie' | 'fullscreen';
  asset_url: string | null;
  sort_order: number;
}

export interface CoinBalance {
  total: number;
  granted_coins: number;
  purchased_coins: number;
  can_claim: boolean;
  next_claim_at: string;
}

export interface TopGifter {
  sender_id: string;
  display_name: string | null;
  avatar_url: string | null;
  coins: number;
}

export interface LiveGiftRow {
  id: string;
  session_id: string;
  sender_id: string;
  host_id: string;
  gift_id: string;
  coins: number;
  created_at: string;
}

/**
 * Stand-in artwork until real Lottie files exist.
 *
 * Deliberately keyed by gift id rather than stored in the database:
 * when the artwork lands it belongs in gift_catalog.asset_url, and
 * this map becomes the fallback for anything not yet drawn.
 */
export const GIFT_GLYPH: Record<string, string> = {
  stardust: '✨',
  moonbeam: '🌙',
  rose_quartz: '🌹',
  comet: '☄️',
  zodiac_sigil: '🔮',
  solar_flare: '🔆',
  galaxy: '🌌',
  supernova: '💥',
};

export function giftGlyph(giftId: string) {
  return GIFT_GLYPH[giftId] || '🎁';
}

export async function getGiftCatalog(): Promise<Gift[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('gift_catalog')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) return [];
  return (data as Gift[]) || [];
}

export async function getCoinBalance(): Promise<CoinBalance | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('my_coin_balance');
  if (error) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return (row as CoinBalance) || null;
}

/** 20 free coins, once per 24 hours. Returns 0 granted if too soon. */
export async function claimDailyCoins(): Promise<{ granted: number; total: number } | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('claim_daily_coins');
  if (error) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return row ? { granted: row.granted, total: row.total } : null;
}

/**
 * Send a gift. The RPC does the whole transaction — debits the balance
 * granted-first, writes the ledger, records the gift and its earning,
 * adds hearts and announces it in chat — so a partial failure is not
 * a state this client can produce.
 */
export async function sendGift(
  sessionId: string,
  giftId: string,
): Promise<{ ok: true; balance: number } | { ok: false; error: string }> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('send_live_gift', {
    p_session_id: sessionId,
    p_gift_id: giftId,
  });
  if (error) return { ok: false, error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  return { ok: true, balance: row?.balance_after ?? 0 };
}

export interface CoinLedgerEntry {
  id: number;
  entry_type: string;
  provenance: 'granted' | 'purchased';
  coins: number;
  balance_after: number;
  reason: string | null;
  created_at: string;
}

/**
 * Recent coin movements, newest first.
 *
 * Reads the ledger rather than deriving from balances: the balance says
 * where you are, the ledger says how you got there, and only the second
 * can answer "where did my coins go".
 */
export async function getCoinLedger(limit = 30): Promise<CoinLedgerEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('coin_ledger')
    .select('id, entry_type, provenance, coins, balance_after, reason, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data as CoinLedgerEntry[]) || [];
}

export interface CreatorEarningsSummary {
  gifts_received: number;
  coins_received: number;
  accrued_cents: number;
  available_cents: number;
  paid_cents: number;
}

/**
 * What a host has received. Deliberately surfaced in coins and gift
 * counts rather than currency while the rate is zero -- a "$0.00
 * pending" figure invites a question whose answer would be a promise.
 */
export async function getCreatorEarnings(): Promise<CreatorEarningsSummary | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('my_creator_earnings');
  if (error) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return (row as CreatorEarningsSummary) || null;
}

export async function getTopGifters(sessionId: string, limit = 3): Promise<TopGifter[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('live_top_gifters', {
    p_session_id: sessionId,
    p_limit: limit,
  });
  if (error) return [];
  return (data as TopGifter[]) || [];
}

/**
 * Gifts landing in a stream, for everyone in the room.
 *
 * A gift nobody else saw would be a receipt, not a moment — the point
 * of sending one in public is that the room reacts.
 */
export function subscribeLiveGifts(
  sessionId: string,
  onGift: (gift: LiveGiftRow) => void,
): () => void {
  const supabase = createClient();
  const channel = supabase
    .channel(`live_gifts_${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'live_gifts',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload: any) => onGift(payload.new as LiveGiftRow),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
