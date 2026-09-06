'use client';

// ═══════════════════════════════════════════════════════════════════
// Floating hearts.
//
// Purely local animation. Every viewer animates their own taps
// instantly rather than waiting for a round trip — a heart that appears
// 200ms after the tap feels broken, and the count is what actually has
// to be accurate, not the individual petals.
//
// Hearts are capped and self-expire so a viewer holding the button down
// for a minute cannot accumulate a thousand live DOM nodes.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from 'react';

interface Petal {
  id: number;
  left: number;
  drift: number;
  scale: number;
  duration: number;
  hue: number;
}

const MAX_PETALS = 40;
const LIFETIME_MS = 2600;

export function useFloatingHearts() {
  const [petals, setPetals] = useState<Petal[]>([]);
  const nextId = useRef(0);

  const burst = useCallback((n = 1) => {
    setPetals((prev) => {
      const added: Petal[] = [];
      for (let i = 0; i < Math.min(n, 6); i++) {
        added.push({
          id: nextId.current++,
          left: 20 + Math.random() * 60,
          drift: (Math.random() - 0.5) * 90,
          scale: 0.75 + Math.random() * 0.6,
          duration: LIFETIME_MS - Math.random() * 700,
          // A little colour variance stops a stream of identical hearts
          // reading as a rendering glitch.
          hue: Math.random() < 0.25 ? 330 : 350,
        });
      }
      const next = [...prev, ...added];
      return next.length > MAX_PETALS ? next.slice(next.length - MAX_PETALS) : next;
    });
  }, []);

  // One sweep rather than a timer per petal.
  useEffect(() => {
    if (petals.length === 0) return;
    const id = setTimeout(() => {
      setPetals((prev) => prev.slice(Math.min(6, prev.length)));
    }, LIFETIME_MS);
    return () => clearTimeout(id);
  }, [petals.length]);

  return { petals, burst };
}

export function FloatingHearts({ petals }: { petals: Petal[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes live-heart-rise {
          0%   { opacity: 0; transform: translate(0, 0) scale(0.6); }
          12%  { opacity: 1; }
          70%  { opacity: 1; }
          100% { opacity: 0; transform: translate(var(--drift), -78vh) scale(var(--scale)); }
        }
        @media (prefers-reduced-motion: reduce) {
          .live-heart { animation-duration: 1ms !important; opacity: 0 !important; }
        }
      `}</style>
      {petals.map((p) => (
        <span
          key={p.id}
          className="live-heart absolute bottom-24 text-2xl"
          style={{
            left: `${p.left}%`,
            // Custom properties feed the keyframes so each petal drifts
            // differently without a stylesheet per heart.
            ['--drift' as any]: `${p.drift}px`,
            ['--scale' as any]: String(p.scale),
            color: `hsl(${p.hue} 85% 62%)`,
            animation: `live-heart-rise ${p.duration}ms ease-out forwards`,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}
