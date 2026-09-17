'use client';

import {
  type RelationshipSnapshot,
  SIGN_GLYPHS,
  SYNASTRY_CATEGORIES,
  COMPOSITE_PLACEMENT_KEYS,
  scoreColor,
} from '@/lib/relationshipShare';

// Compact, Cosmic Match–style card for the feed and the "Download image"
// button. Inline styles only (no Tailwind tokens) so html2canvas captures it.

export interface RelationshipShareCardProps {
  snapshot: RelationshipSnapshot;
}

export default function RelationshipShareCard({ snapshot: s }: RelationshipShareCardProps) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 360,
        padding: '22px 18px 16px',
        borderRadius: 24,
        background: 'linear-gradient(160deg, #141A2E 0%, #1E1545 60%, #0A0E1A 100%)',
        border: '1px solid rgba(139,92,246,0.35)',
        color: '#FFFFFF',
        fontFamily: 'Inter, system-ui, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <p style={{ margin: 0, textAlign: 'center', fontSize: 10, letterSpacing: 3, fontWeight: 700, color: '#A78BFA' }}>
        {s.kind === 'synastry' ? 'COSMIC COMPATIBILITY' : 'COMPOSITE CHART'}
      </p>
      <p style={{ margin: '6px 0 0', textAlign: 'center', fontSize: 20, fontWeight: 700 }}>
        {s.person1} & {s.person2}
      </p>

      {s.kind === 'synastry' ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '14px 0 4px' }}>
            <div
              style={{
                width: 96, height: 96, borderRadius: 48,
                border: `3px solid ${scoreColor(s.score)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 30, fontWeight: 800, color: scoreColor(s.score) }}>{s.score}%</span>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Overall Compatibility</p>
            {s.styleLabel && (
              <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600, fontStyle: 'italic', color: '#A78BFA' }}>{s.styleLabel}</p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 12 }}>
            {SYNASTRY_CATEGORIES.map((c) => {
              const v = s.categories[c.key] ?? 0;
              return (
                <div
                  key={c.key}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '7px 2px',
                    borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(61,71,96,0.5)',
                  }}
                >
                  <span style={{ fontSize: 15, lineHeight: 1.1 }}>{c.emoji}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: scoreColor(v) }}>{v}%</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{c.label}</span>
                </div>
              );
            })}
          </div>

          {(s.passionIntensity || s.marriageLevel) && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {s.passionIntensity && (
                <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: 'rgba(248,113,113,0.12)', color: '#FCA5A5' }}>
                  🔥 {s.passionIntensity} passion
                </span>
              )}
              {s.marriageLevel && (
                <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: 'rgba(167,139,250,0.14)', color: '#C4B5FD' }}>
                  💍 {s.marriageLevel} marriage potential
                </span>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '16px 0 12px' }}>
            {([['Sun', s.sun], ['Moon', s.moon], ['Rising', s.rising]] as const).map(([label, sign]) => (
              <div key={label} style={{ textAlign: 'center', minWidth: 80 }}>
                <p style={{ margin: 0, fontSize: 32, lineHeight: 1.1 }}>{sign ? SIGN_GLYPHS[sign] : '—'}</p>
                <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 600 }}>{sign || 'Unknown'}</p>
                <p style={{ margin: '2px 0 0', fontSize: 10, letterSpacing: 2, color: '#A78BFA', textTransform: 'uppercase' }}>{label}</p>
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

      <p style={{ margin: '14px 0 0', textAlign: 'center', fontSize: 11, color: '#7B849A' }}>aligncosmic.com</p>
    </div>
  );
}
