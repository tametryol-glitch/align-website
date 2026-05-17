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

// ── Score color ──

function getScoreColor(score: number): string {
  if (score >= 75) return '#4ADE80';
  if (score >= 55) return '#FACC15';
  if (score >= 35) return '#FB923C';
  return '#F87171';
}

// ── Props ──

export interface CompatibilityCardProps {
  user1Name: string;
  user1Sign: string;
  user2Name: string;
  user2Sign: string;
  percentage: number;
  /** 'story' = 9:16 (Instagram story), 'square' = 1:1 */
  aspect?: 'story' | 'square';
}

// ── Component ──

const CompatibilityCard = forwardRef<HTMLDivElement, CompatibilityCardProps>(
  ({ user1Name, user1Sign, user2Name, user2Sign, percentage, aspect = 'square' }, ref) => {
    const isStory = aspect === 'story';

    // SVG circle math
    const radius = 62;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const scoreColor = getScoreColor(percentage);

    return (
      <div
        ref={ref}
        style={{
          width: 360,
          height: isStory ? 640 : 360,
          background: 'linear-gradient(160deg, #0F0A2A 0%, #1A1045 25%, #2D1B69 55%, #1E0F45 80%, #0F0A2A 100%)',
          borderRadius: 24,
          padding: isStory ? '48px 28px 36px' : '28px 28px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {/* Decorative dots */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {[
            { x: '10%', y: '12%', size: 2, opacity: 0.5 },
            { x: '88%', y: '8%', size: 1.5, opacity: 0.6 },
            { x: '5%', y: '50%', size: 1.5, opacity: 0.4 },
            { x: '95%', y: '60%', size: 2, opacity: 0.5 },
            { x: '15%', y: '90%', size: 1, opacity: 0.3 },
            { x: '80%', y: '88%', size: 1.5, opacity: 0.4 },
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
                backgroundColor: `rgba(255,255,255,${star.opacity})`,
              }}
            />
          ))}
        </div>

        {/* Connecting line decoration */}
        <div
          style={{
            position: 'absolute',
            top: isStory ? '28%' : '25%',
            left: '10%',
            right: '10%',
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(155,111,246,0.2), transparent)',
            zIndex: 0,
          }}
        />

        {/* Title */}
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(155,111,246,0.8)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Cosmic Compatibility
        </p>

        {/* Two users row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            width: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* User 1 */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(155,111,246,0.2), rgba(155,111,246,0.05))',
                border: '1px solid rgba(155,111,246,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                fontSize: 28,
              }}
            >
              {glyph(user1Sign)}
            </div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user1Name}
            </p>
            <p
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              {glyph(user1Sign)} {user1Sign}
            </p>
          </div>

          {/* Heart connector */}
          <div
            style={{
              fontSize: 20,
              color: 'rgba(155,111,246,0.5)',
              flexShrink: 0,
            }}
          >
            {'❤'}
          </div>

          {/* User 2 */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(155,111,246,0.2), rgba(155,111,246,0.05))',
                border: '1px solid rgba(155,111,246,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                fontSize: 28,
              }}
            >
              {glyph(user2Sign)}
            </div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user2Name}
            </p>
            <p
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              {glyph(user2Sign)} {user2Sign}
            </p>
          </div>
        </div>

        {/* Percentage ring */}
        <div
          style={{
            position: 'relative',
            width: 148,
            height: 148,
            zIndex: 1,
          }}
        >
          <svg width="148" height="148" viewBox="0 0 148 148">
            {/* Background track */}
            <circle
              cx="74"
              cy="74"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
            />
            {/* Score arc */}
            <circle
              cx="74"
              cy="74"
              r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 74 74)"
              style={{ filter: `drop-shadow(0 0 6px ${scoreColor}55)` }}
            />
          </svg>
          {/* Percentage text centered */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: scoreColor,
                lineHeight: 1,
              }}
            >
              {percentage}%
            </span>
            <span
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.4)',
                marginTop: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Match
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
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
              fontSize: 9,
              color: 'rgba(255,255,255,0.3)',
              marginTop: 6,
              lineHeight: 1.4,
            }}
          >
            Discover your cosmic compatibility at aligncosmic.com
          </p>
        </div>
      </div>
    );
  },
);

CompatibilityCard.displayName = 'CompatibilityCard';
export default CompatibilityCard;
