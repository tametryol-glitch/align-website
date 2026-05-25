'use client';

import { useMemo } from 'react';
import { generateDailyCard, type CosmicCard } from '@/lib/dailyCosmicCardEngine';

interface DailyCosmicCardProps {
  sunSign: string;
  moonSign?: string | null;
  risingSign?: string | null;
}

export function DailyCosmicCard({ sunSign, moonSign, risingSign }: DailyCosmicCardProps) {
  const card: CosmicCard | null = useMemo(() => {
    return generateDailyCard(new Date(), {
      sun_sign: sunSign,
      moon_sign: moonSign ?? undefined,
      rising_sign: risingSign ?? undefined,
    });
  }, [sunSign, moonSign, risingSign]);

  if (!card) return null;

  const { overall, love, career, growth } = card.cosmicWeather;
  const gradientBg = `linear-gradient(135deg, ${card.theme.gradient[0]}, ${card.theme.gradient[1]})`;

  return (
    <div className="rounded-2xl overflow-hidden mb-6" style={{ background: gradientBg }}>
      <div className="p-5">
        {/* Top section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-5xl leading-none">{card.emoji}</span>
            <div>
              <h3 className="text-[22px] font-bold text-white">{card.title}</h3>
              <p className="text-xs text-white/60 uppercase tracking-wider mt-0.5">Daily Cosmic Card</p>
            </div>
          </div>
          <span
            className="text-[11px] font-semibold text-white px-2.5 py-1 rounded-xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            {card.cosmicWeather.label}
          </span>
        </div>

        {/* Message */}
        <p className="text-[15px] leading-relaxed text-white mb-4">{card.message}</p>

        {/* Challenge */}
        <div className="rounded-xl p-3.5 mb-3.5" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}>
          <p className="text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">
            ⚡ Today&apos;s Challenge
          </p>
          <p className="text-sm leading-5 text-white">{card.challenge}</p>
        </div>

        {/* Affirmation */}
        <p className="text-sm italic text-white/90 leading-5 mb-4">
          ✨ {card.affirmation}
        </p>

        {/* Bottom: scores + power hours */}
        <div className="border-t border-white/15 pt-3.5">
          <div className="grid grid-cols-4 gap-2 mb-2.5">
            {[
              { label: 'Overall', value: overall },
              { label: 'Love', value: love },
              { label: 'Career', value: career },
              { label: 'Growth', value: growth },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg py-1.5 text-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
              >
                <p className="text-[10px] font-semibold text-white/60 uppercase tracking-wide">{item.label}</p>
                <p className="text-[13px] font-bold text-white mt-0.5">{item.value}/10</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/70 text-center">
            🕐 Power hours: {card.power_hours.join(' & ')}
          </p>
        </div>
      </div>
    </div>
  );
}
