'use client';

import { forwardRef } from 'react';

interface ReadingShareCardProps {
  title: string;
  subtitle: string;
  highlight: string;
  gradientFrom: string;
  gradientTo: string;
  date: string;
}

const ReadingShareCard = forwardRef<HTMLDivElement, ReadingShareCardProps>(
  function ReadingShareCard(
    { title, subtitle, highlight, gradientFrom, gradientTo, date },
    ref,
  ) {
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
          padding: '48px 28px 28px',
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background gradient accent */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${gradientFrom}20 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Date */}
        <p
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: 2,
            textTransform: 'uppercase',
            zIndex: 1,
          }}
        >
          {date}
        </p>

        {/* Main content */}
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          {/* Title */}
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: 12,
              lineHeight: 1.3,
            }}
          >
            {title}
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.55)',
              marginBottom: 24,
              lineHeight: 1.5,
              maxWidth: 300,
            }}
          >
            {subtitle}
          </p>

          {/* Highlight badge */}
          <div
            style={{
              display: 'inline-block',
              padding: '10px 24px',
              borderRadius: 24,
              background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
              boxShadow: `0 0 24px ${gradientFrom}40`,
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              {highlight}
            </span>
          </div>
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

export default ReadingShareCard;
