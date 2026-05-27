'use client';

import { forwardRef } from 'react';
import type { AuraColorScore } from '@/types/aura';
import { AURA_COLORS } from '@/lib/auraColors';

interface AuraShareCardProps {
  outerAura: AuraColorScore;
  innerAura: AuraColorScore;
  emotionalCore: AuraColorScore;
  chakraLabel: string;
  scanConfidence: number;
  date: string;
}

const AuraShareCard = forwardRef<HTMLDivElement, AuraShareCardProps>(
  function AuraShareCard(
    { outerAura, innerAura, emotionalCore, chakraLabel, scanConfidence, date },
    ref,
  ) {
    const orbs = [
      { label: 'Outer', aura: outerAura },
      { label: 'Inner', aura: innerAura },
      { label: 'Core', aura: emotionalCore },
    ];

    return (
      <div
        ref={ref}
        style={{
          width: 400,
          height: 600,
          background: 'linear-gradient(160deg, #0f0a1e 0%, #1a1035 40%, #12082a 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '36px 24px 28px',
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient glow behind orbs */}
        <div
          style={{
            position: 'absolute',
            top: '35%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${outerAura.hex}18 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Header */}
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <p
            style={{
              fontSize: 14,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: 6,
            }}
          >
            My Aura Reading
          </p>
          <p
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            {date}
          </p>
        </div>

        {/* Orb row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 32,
            zIndex: 1,
          }}
        >
          {orbs.map((orb) => {
            const def = AURA_COLORS[orb.aura.color];
            const hex = def?.hex || orb.aura.hex;
            const glow = def?.hexGlow || hex;

            return (
              <div key={orb.label} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: '50%',
                    background: `radial-gradient(circle at 35% 35%, ${glow}, ${hex})`,
                    boxShadow: `0 0 28px ${hex}60, 0 0 60px ${hex}25`,
                    margin: '0 auto 12px',
                  }}
                />
                <p
                  style={{
                    fontSize: 10,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.45)',
                    marginBottom: 4,
                  }}
                >
                  {orb.label}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#FFFFFF',
                    textTransform: 'capitalize',
                  }}
                >
                  {orb.aura.color}
                </p>
              </div>
            );
          })}
        </div>

        {/* Chakra + confidence */}
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          {/* Chakra badge */}
          <div
            style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
              {chakraLabel}
            </span>
          </div>

          {/* Confidence */}
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
            {Math.round(scanConfidence * 100)}% confidence
          </p>
        </div>

        {/* Watermark */}
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div
            style={{
              width: 40,
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(155,111,246,0.4), transparent)',
              margin: '0 auto 10px',
            }}
          />
          <p
            style={{
              fontSize: 11,
              letterSpacing: 2,
              color: 'rgba(155,111,246,0.5)',
            }}
          >
            align &middot; discover your cosmic self
          </p>
        </div>
      </div>
    );
  },
);

export default AuraShareCard;
