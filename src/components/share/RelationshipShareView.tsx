'use client';

import Link from 'next/link';
import {
  type RelationshipSnapshot,
  type SynastrySnapshot,
  type CompositeSnapshot,
  type ShareAspect,
  SIGN_GLYPHS,
  ASPECT_GLYPHS,
  SYNASTRY_CATEGORIES,
  COMPOSITE_PLACEMENT_KEYS,
  scoreColor,
  synastryBandText,
} from '@/lib/relationshipShare';
import { getSynastryPairReading, getPassionReading, getMarriageReading } from '@/lib/synastryReadings';
import { getCompositePlacementReading, getCompositeAspectReading } from '@/lib/compositeReadings';

/**
 * Full view of a shared synastry / composite result. Synastry mirrors the
 * Cosmic Match detail screen (same 9 categories, colors and sections) and
 * shows how the overall is calculated. Used on aligncosmic.com/share.
 */
export default function RelationshipShareView({
  snapshot: s,
  showCta = true,
}: {
  snapshot: RelationshipSnapshot;
  showCta?: boolean;
}) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {s.kind === 'synastry' ? <SynastryDetail s={s} /> : <CompositeDetail s={s} />}

      {showCta && (
        <div className="text-center max-w-sm mx-auto mt-12">
          <h2 className="text-xl font-bold text-white mb-2">
            {s.kind === 'synastry' ? 'How do your stars align?' : 'What does your relationship create?'}
          </h2>
          <p className="text-sm text-white/50 mb-6">
            Compare your chart with anyone — partner, crush, best friend — and get the full breakdown on Align.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #9B6FF6)' }}
            >
              {s.kind === 'synastry' ? 'Check Your Compatibility Free' : 'Get Your Composite Chart'}
            </Link>
            <Link
              href={s.kind === 'synastry' ? '/chart/synastry' : '/chart/composite'}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white/60 hover:text-white transition-colors text-sm"
            >
              I already have an account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared pieces (Cosmic Match styling) ─────────────────────────────

function SectionTitle({ text }: { text: string }) {
  return <h3 className="text-base font-semibold text-white mt-7 mb-3">{text}</h3>;
}

function DetailCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-4 ${className}`}
      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(61,71,96,0.5)' }}
    >
      {children}
    </div>
  );
}

function SubScore({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-bold" style={{ color: scoreColor(score) }}>{score}%</span>
      <span className="text-xs mt-0.5 text-white/40">{label}</span>
    </div>
  );
}

// ── Synastry ─────────────────────────────────────────────────────────

/**
 * Score header + 9-category grid + the math behind the overall. Exported so
 * the synastry page shows exactly what a shared result shows.
 */
export function SynastryBreakdown({ s }: { s: SynastrySnapshot }) {
  const rows = SYNASTRY_CATEGORIES.map((c) => {
    const v = s.categories[c.key] ?? 0;
    return { ...c, v, points: (v * c.weight) / 100 };
  });

  return (
    <>
      <div className="text-center py-5">
        <span className="font-extrabold" style={{ fontSize: 64, color: scoreColor(s.score), lineHeight: 1 }}>
          {s.score}%
        </span>
        <p className="text-sm mt-2 text-white/45">Overall Compatibility</p>
        {s.styleLabel && (
          <p className="text-base font-semibold italic mt-2" style={{ color: '#A78BFA' }}>{s.styleLabel}</p>
        )}
        <p className="text-xs mt-1 text-white/40">{synastryBandText(s.score)}</p>
      </div>

      <SectionTitle text="Category Breakdown" />
      <div className="grid grid-cols-3 gap-3">
        {rows.map((c) => (
          <div
            key={c.key}
            className="flex flex-col items-center py-3 px-2 rounded-xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(61,71,96,0.5)' }}
          >
            <span className="text-xl mb-1">{c.emoji}</span>
            <span className="text-lg font-bold" style={{ color: scoreColor(c.v) }}>{c.v}%</span>
            <span className="text-xs mt-0.5 text-white/40">{c.label}</span>
          </div>
        ))}
      </div>

      <SectionTitle text={`How ${s.score}% is calculated`} />
      <DetailCard>
        <p className="text-xs text-white/45 mb-3">
          Every category counts toward the overall, weighted by how much it shapes a relationship.
        </p>
        <div className="space-y-1.5">
          {rows.map((c) => (
            <div key={c.key} className="flex items-center gap-2 text-xs">
              <span className="w-24 text-white/60">{c.emoji} {c.label}</span>
              <span className="w-10 text-right font-semibold" style={{ color: scoreColor(c.v) }}>{c.v}%</span>
              <span className="w-12 text-right text-white/35">× {c.weight}%</span>
              <span className="flex-1 text-right text-white/70">{c.points.toFixed(1)} pts</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-xs pt-2 mt-1 border-t border-white/10">
            <span className="flex-1 text-white/70 font-semibold">Overall</span>
            <span className="font-bold" style={{ color: scoreColor(s.score) }}>{s.score}%</span>
          </div>
        </div>
      </DetailCard>
    </>
  );
}

function aspectHeading(s: SynastrySnapshot, a: ShareAspect): string {
  return `${s.person1}'s ${a.p1} ${ASPECT_GLYPHS[a.aspect] || ''} ${s.person2}'s ${a.p2}`;
}

function ReadingList({ s, list, color }: { s: SynastrySnapshot; list: ShareAspect[]; color: string }) {
  return (
    <div className="space-y-3">
      {list.map((a, i) => {
        const reading = getSynastryPairReading(a.p1, a.p2, a.supportive);
        if (!reading) return null;
        return (
          <DetailCard key={i}>
            <p className="text-sm font-semibold" style={{ color }}>{aspectHeading(s, a)}</p>
            <p className="text-sm text-white/70 leading-relaxed mt-2">{reading}</p>
          </DetailCard>
        );
      })}
    </div>
  );
}

function SynastryDetail({ s }: { s: SynastrySnapshot }) {
  const passionReading = getPassionReading(s.passionIntensity);
  const marriageReading = getMarriageReading(s.marriageLevel);

  return (
    <>
      <p className="text-center text-xs tracking-[0.25em] font-bold" style={{ color: '#A78BFA' }}>COSMIC COMPATIBILITY</p>
      <h1 className="text-center text-2xl font-bold text-white mt-2">{s.person1} & {s.person2}</h1>

      <SynastryBreakdown s={s} />

      <SectionTitle text={`🔥 Passion${s.passionIntensity ? ` (${s.passionIntensity})` : ''}`} />
      <DetailCard>
        <div className="flex items-center gap-4">
          <SubScore label="Passion" score={s.categories.passion ?? 0} />
          {passionReading && <p className="flex-1 text-sm text-white/70 leading-relaxed">{passionReading}</p>}
        </div>
      </DetailCard>

      <SectionTitle text={`💍 Marriage Potential${s.marriageLevel ? ` (${s.marriageLevel})` : ''}`} />
      <DetailCard>
        <div className="flex justify-around pt-1 pb-2">
          <SubScore label="Domestic" score={s.marriageSub.domestic} />
          <SubScore label="Loyalty" score={s.marriageSub.loyalty} />
          <SubScore label="Growth" score={s.marriageSub.growth} />
        </div>
        {marriageReading && <p className="text-sm text-white/70 leading-relaxed mt-2">{marriageReading}</p>}
      </DetailCard>

      {s.strengths.length > 0 && (
        <>
          <SectionTitle text="✅ Top Strengths" />
          <ReadingList s={s} list={s.strengths} color="#4ADE80" />
        </>
      )}

      {s.challenges.length > 0 && (
        <>
          <SectionTitle text="⚡ Growth Areas" />
          <ReadingList s={s} list={s.challenges} color="#FB923C" />
        </>
      )}

      {s.aspects.length > 0 && (
        <>
          <SectionTitle text={`Key Aspects (${s.aspects.length})`} />
          <DetailCard>
            {s.aspects.map((a, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <span className="text-xs" style={{ color: a.supportive ? '#4ADE80' : '#FB923C' }}>●</span>
                <span className="flex-1 text-sm text-white/60">
                  {s.person1}&apos;s {a.p1} {a.aspect.toLowerCase()} {s.person2}&apos;s {a.p2}
                </span>
              </div>
            ))}
          </DetailCard>
        </>
      )}
    </>
  );
}

// ── Composite ────────────────────────────────────────────────────────

const COMPOSITE_SECTION_TITLES: Record<string, string> = {
  Sun: 'Who you are together',
  Moon: 'How you feel together',
  Ascendant: 'How the world sees you two',
  Mercury: 'How you talk',
  Venus: 'How you love',
  Mars: 'How you fight and desire',
  Jupiter: 'Where you grow',
  Saturn: 'Your real test',
};

function CompositeDetail({ s }: { s: CompositeSnapshot }) {
  const sections: Array<[string, string]> = [
    ...(s.sun ? [['Sun', s.sun] as [string, string]] : []),
    ...(s.moon ? [['Moon', s.moon] as [string, string]] : []),
    ...(s.rising ? [['Ascendant', s.rising] as [string, string]] : []),
    ...COMPOSITE_PLACEMENT_KEYS.filter((k) => s.placements[k]).map((k) => [k, s.placements[k]] as [string, string]),
  ];

  return (
    <>
      <p className="text-center text-xs tracking-[0.25em] font-bold" style={{ color: '#A78BFA' }}>COMPOSITE CHART</p>
      <h1 className="text-center text-2xl font-bold text-white mt-2">{s.person1} & {s.person2}</h1>
      <p className="text-center text-sm text-white/45 mt-1">The relationship as its own living thing</p>

      <div className="grid grid-cols-3 gap-3 mt-6">
        {([['Sun', s.sun], ['Moon', s.moon], ['Rising', s.rising]] as const).map(([label, sign]) => (
          <div
            key={label}
            className="flex flex-col items-center py-3 rounded-xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(61,71,96,0.5)' }}
          >
            <span className="text-3xl text-white">{sign ? SIGN_GLYPHS[sign] : '—'}</span>
            <span className="text-sm font-semibold text-white mt-1">{sign || 'Unknown'}</span>
            <span className="text-[10px] tracking-widest uppercase mt-0.5" style={{ color: '#A78BFA' }}>{label}</span>
          </div>
        ))}
      </div>

      {sections.map(([body, sign]) => {
        const reading = getCompositePlacementReading(body, sign);
        if (!reading) return null;
        return (
          <div key={body}>
            <SectionTitle text={COMPOSITE_SECTION_TITLES[body] || body} />
            <DetailCard>
              <p className="text-xs font-semibold tracking-wide" style={{ color: '#A78BFA' }}>
                {SIGN_GLYPHS[sign]} {body === 'Ascendant' ? 'Rising' : body} in {sign}
              </p>
              <p className="text-sm text-white/75 leading-relaxed mt-2">{reading}</p>
            </DetailCard>
          </div>
        );
      })}

      {s.aspects.some((a) => getCompositeAspectReading(a.p1, a.p2, a.aspect)) && (
        <>
          <SectionTitle text="What happens between you" />
          <div className="space-y-3">
            {s.aspects.map((a, i) => {
              const reading = getCompositeAspectReading(a.p1, a.p2, a.aspect);
              if (!reading) return null;
              return (
                <DetailCard key={i}>
                  <p className="text-sm font-semibold" style={{ color: a.supportive ? '#4ADE80' : '#FB923C' }}>
                    {a.p1} {ASPECT_GLYPHS[a.aspect] || ''} {a.p2}
                  </p>
                  <p className="text-sm text-white/70 leading-relaxed mt-2">{reading}</p>
                </DetailCard>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
