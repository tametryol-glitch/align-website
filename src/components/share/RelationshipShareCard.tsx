'use client';

import {
  type RelationshipSnapshot,
  SIGN_GLYPHS,
  SYNASTRY_CATEGORIES,
  COMPOSITE_PLACEMENT_KEYS,
  synastryBand,
} from '@/lib/relationshipShare';

// Inline styles only (no Tailwind tokens) so html2canvas captures it exactly
// for the "Download image" button.

const ASPECT_GLYPHS: Record<string, string> = {
  Conjunction: '☌', Sextile: '⚹', Square: '□', Trine: '△', Opposition: '☍', Quincunx: '⚻',
};

export interface RelationshipShareCardProps {
  snapshot: RelationshipSnapshot;
}

export default function RelationshipShareCard({ snapshot: s }: RelationshipShareCardProps) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 360,
        padding: '28px 24px 20px',
        borderRadius: 24,
        background: 'linear-gradient(160deg, #1B1436 0%, #2D1B69 55%, #0a0a14 100%)',
        color: '#FFFFFF',
        fontFamily: 'Inter, system-ui, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <p style={{ margin: 0, textAlign: 'center', fontSize: 11, letterSpacing: 4, fontWeight: 700, color: '#9B6FF6' }}>
        {s.kind === 'synastry' ? 'SYNASTRY' : 'COMPOSITE CHART'}
      </p>
      <p style={{ margin: '8px 0 0', textAlign: 'center', fontSize: 22, fontWeight: 700 }}>
        {s.person1} & {s.person2}
      </p>

      {s.kind === 'synastry' ? (
        <>
          <p style={{ margin: '14px 0 0', textAlign: 'center', fontSize: 56, fontWeight: 800, lineHeight: 1 }}>{s.score}%</p>
          <p style={{ margin: '6px 0 18px', textAlign: 'center', fontSize: 14, fontWeight: 600, color: synastryBand(s.score).color }}>
            {synastryBand(s.score).label}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {SYNASTRY_CATEGORIES.map((c) => {
              const v = s.categories[c.key] ?? 0;
              return (
                <div key={c.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#DEE2EA' }}>
                    <span>{c.emoji} {c.label}</span>
                    <span style={{ fontWeight: 600 }}>{v}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.12)', marginTop: 4 }}>
                    <div style={{ width: `${v}%`, height: 6, borderRadius: 3, background: 'linear-gradient(90deg, #7C3AED, #C4B5FD)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '18px 0 14px' }}>
            {([['Sun', s.sun], ['Moon', s.moon], ['Rising', s.rising]] as const).map(([label, sign]) => (
              <div key={label} style={{ textAlign: 'center', minWidth: 80 }}>
                <p style={{ margin: 0, fontSize: 34, lineHeight: 1.1 }}>{sign ? SIGN_GLYPHS[sign] : '—'}</p>
                <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 600 }}>{sign || 'Unknown'}</p>
                <p style={{ margin: '2px 0 0', fontSize: 10, letterSpacing: 2, color: '#9B6FF6', textTransform: 'uppercase' }}>{label}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
            {COMPOSITE_PLACEMENT_KEYS.filter((k) => s.placements[k]).map((k) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#DEE2EA' }}>
                <span style={{ color: '#A8B0C0' }}>{k}</span>
                <span>{SIGN_GLYPHS[s.placements[k]]} {s.placements[k]}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {s.aspects.length > 0 && (
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {s.aspects.slice(0, 3).map((a, i) => (
            <p key={i} style={{ margin: '3px 0', fontSize: 12, textAlign: 'center', color: '#DEE2EA' }}>
              <span style={{ color: a.supportive ? '#4ADE80' : '#FBBF24' }}>●</span>{' '}
              {s.kind === 'synastry' ? `${s.person1}'s ${a.p1}` : a.p1} {ASPECT_GLYPHS[a.aspect] || ''} {a.aspect.toLowerCase()}{' '}
              {s.kind === 'synastry' ? `${s.person2}'s ${a.p2}` : a.p2}
            </p>
          ))}
        </div>
      )}

      <p style={{ margin: '16px 0 0', textAlign: 'center', fontSize: 11, color: '#7B849A' }}>aligncosmic.com</p>
    </div>
  );
}
