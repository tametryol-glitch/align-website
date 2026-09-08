'use client';

// ═══════════════════════════════════════════════════════════════════
// Gift celebration.
//
// Shown to everyone in the room, host included. A gift only its sender
// saw would be a receipt; the reason to send one in public is that the
// room reacts to it.
//
// The celebration scales with the gift, for the same reason the heart
// milestones do — if Stardust and Supernova look identical, the ladder
// stops meaning anything and there is no reason to climb it.
//
// Kept in step with align-app/src/components/social/GiftBurst.tsx.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import { giftGlyph, subscribeLiveGifts, type LiveGiftRow, type Gift } from '@/lib/coinService';

interface Celebration {
  key: number;
  glyph: string;
  /** Real artwork when the catalog has it; the glyph is the fallback. */
  assetUrl: string | null;
  name: string;
  coins: number;
  sender: string;
}

/** How loud a given gift should be. */
function weightOf(coins: number) {
  if (coins >= 1000) return { ms: 5200, size: 'text-7xl', px: 168, ring: true };
  if (coins >= 100) return { ms: 4200, size: 'text-6xl', px: 132, ring: false };
  return { ms: 2800, size: 'text-5xl', px: 104, ring: false };
}

export function useGiftBursts(
  sessionId: string | null,
  catalog: Gift[],
  authorName: (id: string) => string,
) {
  const [current, setCurrent] = useState<Celebration | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    if (!sessionId) return;

    const onGift = (row: LiveGiftRow) => {
      const gift = catalog.find((g) => g.id === row.gift_id);
      seq.current += 1;
      setCurrent({
        key: seq.current,
        glyph: giftGlyph(row.gift_id),
        assetUrl: gift?.asset_url ?? null,
        name: gift?.name || 'a gift',
        coins: row.coins,
        sender: authorName(row.sender_id),
      });
    };

    return subscribeLiveGifts(sessionId, onGift);
  }, [sessionId, catalog, authorName]);

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => setCurrent(null), weightOf(current.coins).ms);
    return () => clearTimeout(t);
  }, [current]);

  /** Lets the sender celebrate instantly instead of waiting on realtime. */
  const burstLocal = (gift: Gift, sender: string) => {
    seq.current += 1;
    setCurrent({
      key: seq.current,
      glyph: giftGlyph(gift.id),
      assetUrl: gift.asset_url,
      name: gift.name,
      coins: gift.coins,
      sender,
    });
  };

  return { celebration: current, burstLocal };
}

export function GiftBurst({ celebration }: { celebration: Celebration | null }) {
  if (!celebration) return null;
  const { ms, size, px, ring } = weightOf(celebration.coins);

  return (
    <div
      key={celebration.key}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <style>{`
        @keyframes gift-rise {
          0%   { opacity: 0; transform: translateY(28px) scale(0.7); }
          12%  { opacity: 1; transform: translateY(0) scale(1.12); }
          22%  { transform: translateY(0) scale(1); }
          80%  { opacity: 1; transform: translateY(-6px) scale(1); }
          100% { opacity: 0; transform: translateY(-28px) scale(0.95); }
        }
        @media (prefers-reduced-motion: reduce) {
          .gift-rise { animation: none !important; }
        }
      `}</style>

      <div
        className="gift-rise flex flex-col items-center gap-2"
        style={{ animation: `gift-rise ${ms}ms ease-out forwards` }}
      >
        {celebration.assetUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={celebration.assetUrl}
            alt=""
            width={px}
            height={px}
            className={`object-contain drop-shadow-[0_2px_24px_rgba(0,0,0,0.6)] ${
              ring ? 'rounded-full ring-4 ring-amber-300/40 p-2' : ''
            }`}
          />
        ) : (
          <span
            className={`${size} leading-none drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)] ${
              ring ? 'rounded-full ring-4 ring-amber-300/40 p-3' : ''
            }`}
            aria-hidden="true"
          >
            {celebration.glyph}
          </span>
        )}
        <span className="text-sm text-white bg-black/55 backdrop-blur rounded-full px-3.5 py-1.5">
          {celebration.sender} sent {celebration.name}
        </span>
      </div>
    </div>
  );
}
