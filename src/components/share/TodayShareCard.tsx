'use client';

// The daily answer as a story-sized card (400x600, rendered to PNG by the
// share modal). No name or birth data on it: it is meant to be posted.

import { forwardRef } from 'react';

interface TodayShareCardProps {
  headline: string;
  area: string;
  doText: string;
  avoidText: string;
  /** Already formatted for display, e.g. "Monday, November 2". */
  date: string;
}

const TodayShareCard = forwardRef<HTMLDivElement, TodayShareCardProps>(
  function TodayShareCard({ headline, area, doText, avoidText, date }, ref) {
    return (
      <div
        ref={ref}
        style={{
          width: 400,
          height: 600,
          background: 'linear-gradient(160deg, #0f0a1e 0%, #1a1035 45%, #2a1048 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '44px 32px 28px',
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          position: 'relative',
          overflow: 'hidden',
          color: '#FFFFFF',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '22%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(155,111,246,0.28) 0%, transparent 70%)',
          }}
        />

        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: '#C4B5FD', margin: 0 }}>
            Today for me
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: '6px 0 0' }}>{date}</p>
        </div>

        <div style={{ position: 'relative' }}>
          <h2 style={{ fontSize: 34, lineHeight: 1.15, fontWeight: 800, margin: 0 }}>{headline}</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: '12px 0 0' }}>{area}</p>
        </div>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 14, padding: '12px 14px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#6EE7B7', margin: 0 }}>DO</p>
            <p style={{ fontSize: 15, lineHeight: 1.35, margin: '4px 0 0' }}>{doText}</p>
          </div>
          <div style={{ background: 'rgba(244,63,94,0.14)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 14, padding: '12px 14px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#FDA4AF', margin: 0 }}>AVOID</p>
            <p style={{ fontSize: 15, lineHeight: 1.35, margin: '4px 0 0' }}>{avoidText}</p>
          </div>
        </div>

        <div style={{ position: 'relative', textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Align</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>
            Get yours free at aligncosmic.com
          </p>
        </div>
      </div>
    );
  },
);

export default TodayShareCard;
