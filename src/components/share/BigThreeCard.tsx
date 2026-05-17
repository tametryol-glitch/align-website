'use client';

import { forwardRef } from 'react';

// ── Zodiac glyph map ──

const ZODIAC_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

function glyph(sign: string): string {
  return ZODIAC_GLYPHS[sign] || ZODIAC_GLYPHS[sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase()] || '';
}

// ── Element color ──

function getElementColor(sign: string): string {
  const fire = ['Aries', 'Leo', 'Sagittarius'];
  const earth = ['Taurus', 'Virgo', 'Capricorn'];
  const air = ['Gemini', 'Libra', 'Aquarius'];
  // Water is the default
  if (fire.includes(sign)) return '#EF4444';
  if (earth.includes(sign)) return '#22C55E';
  if (air.includes(sign)) return '#3B82F6';
  return '#06B6D4';
}

// ── Props ──

export interface BigThreeCardProps {
  displayName: string;
  sunSign: string;
  moonSign: string;
  risingSign: string;
  /** 'story' = 9:16 (Instagram story), 'square' = 1:1 */
  aspect?: 'story' | 'square';
}

// ── Component ──

const BigThreeCard = forwardRef<HTMLDivElement, BigThreeCardProps>(
  ({ displayName, sunSign, moonSign, risingSign, aspect = 'story' }, ref) => {
    const isStory = aspect === 'story';

    const rows: { label: string; sign: string; symbol: string }[] = [
      { label: 'Sun', sign: sunSign, symbol: '☉' },
      { label: 'Moon', sign: moonSign, symbol: '☽' },
      { label: 'Rising', sign: risingSign, symbol: '↑' },
    ];

    return (
      <div
        ref={ref}
        style={{
          width: isStory ? 360 : 360,
          height: isStory ? 640 : 360,
          background: 'linear-gradient(160deg, #0F0A2A 0%, #1E1145 30%, #2D1B69 60%, #3B1F80 80%, #1A1035 100%)',
          borderRadius: 24,
          padding: isStory ? '48px 32px 36px' : '28px 32px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {/* Decorative star dots */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {[
            { x: '12%', y: '8%', size: 2 },
            { x: '85%', y: '15%', size: 1.5 },
            { x: '7%', y: '45%', size: 1.5 },
            { x: '92%', y: '55%', size: 2 },
            { x: '20%', y: '88%', size: 1 },
            { x: '78%', y: '82%', size: 1.5 },
            { x: '50%', y: '5%', size: 1 },
            { x: '35%', y: '92%', size: 1 },
          ].map((star, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: star.x,
                top: star.y,
                width: star.size,
                height: star.size,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.6)',
              }}
            />
          ))}
        </div>

        {/* Top: Name */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(155,111,246,0.8)',
              marginBottom: 8,
            }}
          >
            My Big Three
          </p>
          <p
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#FFFFFF',
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {displayName}
          </p>
        </div>

        {/* Middle: Three sign rows */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: isStory ? 32 : 16,
            width: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {rows.map((row) => (
            <div
              key={row.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(155,111,246,0.15)',
              }}
            >
              {/* Glyph circle */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${getElementColor(row.sign)}22, ${getElementColor(row.sign)}11)`,
                  border: `1px solid ${getElementColor(row.sign)}44`,
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 26 }}>{glyph(row.sign)}</span>
              </div>
              {/* Label + Sign name */}
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: 2,
                  }}
                >
                  {row.symbol} {row.label}
                </p>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#FFFFFF',
                  }}
                >
                  {row.sign}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom: Branding */}
        <div
          style={{
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            paddingTop: 8,
          }}
        >
          <p
            style={{
              fontSize: 18,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #9B6FF6, #D0C5FD)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.15em',
            }}
          >
            ALIGN
          </p>
          <p
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.3)',
              marginTop: 4,
            }}
          >
            aligncosmic.com
          </p>
        </div>
      </div>
    );
  },
);

BigThreeCard.displayName = 'BigThreeCard';
export default BigThreeCard;
