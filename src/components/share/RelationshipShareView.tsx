'use client';

import Link from 'next/link';
import { type RelationshipSnapshot, SIGN_GLYPHS } from '@/lib/relationshipShare';
import { getSynastryInterpretation, getCompositeInterpretation } from '@/lib/synastryInterpretations';
import { getCompositePlacementInterpretation } from '@/lib/compositePlacementInterp';
import RelationshipShareCard from './RelationshipShareCard';

/** First N sentences — the full interpretations are paragraphs. */
function firstSentences(text: string, n: number): string {
  const parts = text.split(/(?<=[.!?])\s+/).slice(0, n).join(' ');
  return parts || text;
}

/**
 * Public view of a shared synastry / composite result (aligncosmic.com/share).
 * Also embedded in-app when a shared result is opened from Messages or the feed.
 */
export default function RelationshipShareView({
  snapshot: s,
  showCta = true,
}: {
  snapshot: RelationshipSnapshot;
  showCta?: boolean;
}) {
  const highlights = s.kind === 'composite'
    ? ([['Sun', s.sun], ['Moon', s.moon], ['Ascendant', s.rising]] as const).filter(([, sign]) => sign)
    : [];

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[360px] rounded-3xl overflow-hidden shadow-2xl">
        <RelationshipShareCard snapshot={s} />
      </div>

      <div className="w-full max-w-md mt-8 space-y-3 text-left">
        {highlights.map(([planet, sign]) => (
          <div key={planet} className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
            <p className="text-sm font-semibold text-white">
              {SIGN_GLYPHS[sign as string]} Composite {planet === 'Ascendant' ? 'Rising' : planet} in {sign}
            </p>
            <p className="text-xs text-white/60 leading-relaxed mt-1.5">
              {firstSentences(getCompositePlacementInterpretation(planet, sign as string), 3)}
            </p>
          </div>
        ))}

        {s.aspects.length > 0 && (
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider pt-3">
            {s.kind === 'synastry' ? 'Where their charts connect' : 'Inside the relationship'}
          </h2>
        )}
        {s.aspects.slice(0, 3).map((a, i) => (
          <div key={i} className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
            <p className="text-sm font-semibold text-white">
              <span className={a.supportive ? 'text-green-400' : 'text-amber-400'}>● </span>
              {s.kind === 'synastry'
                ? `${s.person1}'s ${a.p1} ${a.aspect.toLowerCase()} ${s.person2}'s ${a.p2}`
                : `${a.p1} ${a.aspect.toLowerCase()} ${a.p2}`}
            </p>
            <p className="text-xs text-white/60 leading-relaxed mt-1.5">
              {firstSentences(
                s.kind === 'synastry'
                  ? getSynastryInterpretation(a.p1, a.p2, a.aspect)
                  : getCompositeInterpretation(a.p1, a.p2, a.aspect),
                3,
              )}
            </p>
          </div>
        ))}
      </div>

      {showCta && (
        <div className="text-center max-w-sm mt-10">
          <h2 className="text-xl font-bold text-white mb-2">
            {s.kind === 'synastry' ? 'How do your stars align?' : 'What does your relationship create?'}
          </h2>
          <p className="text-sm text-white/50 mb-6">
            Compare your chart with anyone — partner, crush, best friend — and see the full breakdown on Align.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #9B6FF6)' }}
            >
              {s.kind === 'synastry' ? 'Check Your Synastry Free' : 'Get Your Composite Chart'}
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
