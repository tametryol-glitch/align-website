'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Loader2, Sparkles, Link2 } from 'lucide-react';
import { api } from '@/lib/api';
import { ChatMarkdown } from '@/components/ui/ChatMarkdown';
import { type ChainResponse, type ChainHouse, glyph, houseOrd } from '@/lib/radar';

type Mode = 'events' | 'inner' | 'notes';

function HouseBlock({ h }: { h: ChainHouse }) {
  const r = h.ruler_card;
  return (
    <div className="rounded-xl bg-white/5 p-4 space-y-2">
      <p className="text-sm font-semibold text-text-primary">
        {houseOrd(h.house)} house <span className="font-normal text-text-muted">({h.domain})</span>
      </p>
      <p className="text-xs text-text-muted">
        Cusp {h.cusp} &rarr; ruled by {h.ruler || 'nobody'} in your system
      </p>
      {r && (
        <>
          <p className="text-sm text-text-secondary leading-relaxed">
            <span className="font-semibold text-text-primary">1. The ruler:</span> {glyph(r.name)} {r.name} at {r.pos}, in your{' '}
            {houseOrd(r.house)} house{r.retro ? ', retrograde' : ''}.{r.own_sign ? ' It sits in a sign it rules: strong and self-governing.' : ''}
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            <span className="font-semibold text-text-primary">2. Its hidden layers:</span> duad in {r.duad} (that sign sits on your{' '}
            {houseOrd(r.duad_house)} house), compendium in {r.comp} (your {houseOrd(r.comp_house)} house).
          </p>
        </>
      )}
      {h.chain && (
        <div className="text-sm text-text-secondary leading-relaxed">
          <p>
            <span className="font-semibold text-text-primary">3. Who it answers to:</span>{' '}
            {h.chain.steps.map((c, i) => (
              <span key={c.name}>
                {i > 0 && ' → '}
                {glyph(c.name)} {c.name} ({c.sign}, {houseOrd(c.house)})
              </span>
            ))}
          </p>
          <p className="text-text-muted mt-1">
            {h.chain.end === 'final' && `${h.chain.last} rules the sign it sits in: it is the final boss of this matter.`}
            {h.chain.end === 'loop' && `The chain loops through ${h.chain.loop.join(', ')}: no single boss, the matter keeps cycling among them.`}
            {h.chain.end === 'missing' && `The chain ends at ${h.chain.last}, which is not in your chart data.`}
          </p>
        </div>
      )}
      {h.midpoints.map((m) => (
        <p key={m.hit} className="text-sm text-text-secondary leading-relaxed">
          <span className="font-semibold text-text-primary">4. Where it lands:</span> {m.label} at {m.pos}.{' '}
          {m.conj &&
            (m.conj.conjunct
              ? `It sits ${m.conj.orb.toFixed(2)}° from the house ruler, so it speaks directly for this house and lands without delay.`
              : `It is ${m.conj.orb.toFixed(1)}° from the house ruler, so the house is reached through the chain rather than the picture itself.`)}
          {m.conj?.ruler_in_pair && ' The house ruler is one of the points that make this picture: the strongest link there is.'}
          {m.conj?.other_links?.length ? ` Also on it: ${m.conj.other_links.map((o) => o.name).join(', ')}.` : ''}
        </p>
      ))}
    </div>
  );
}

export default function RadarChain({
  hitId,
  asOf,
  birthData,
  canAI,
}: {
  hitId: string;
  asOf: string;
  birthData: any;
  canAI: boolean;
}) {
  const [chain, setChain] = useState<ChainResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('events');
  const [question, setQuestion] = useState('');
  const [text, setText] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const body = { birth_data: birthData, hit_ids: [hitId], as_of: asOf, days: 180 };

  const loadChain = async () => {
    setLoading(true);
    setError(null);
    try {
      setChain((await api.getRadarChain(body)) as ChainResponse);
    } catch (e: any) {
      setError(e?.message || 'Could not load the chain.');
    } finally {
      setLoading(false);
    }
  };

  const read = async () => {
    setStreaming(true);
    setText('');
    setAiError(null);
    try {
      await api.streamRadarChainReading(
        { ...body, mode, question: question.trim(), language: 'en' },
        (chunk) => setText((t) => t + chunk),
        () => setStreaming(false),
      );
    } catch (e: any) {
      setAiError(e?.message || 'The reading could not be generated.');
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="px-6 pb-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Go deeper: the house-ruler chain</h3>
      <p className="text-sm text-text-muted leading-relaxed mb-3">
        Which planet rules the house this lands in, what it hides in its duad and compendium, and who it answers to.
        This is how an astrologer finds out how it really plays out.
      </p>

      {!chain && (
        <button onClick={loadChain} disabled={loading} className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
          Show the chain
        </button>
      )}
      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}

      {chain && (
        <div className="space-y-3">
          {chain.houses.map((h) => (
            <HouseBlock key={h.house} h={h} />
          ))}

          <div className="rounded-xl border border-white/10 p-4 mt-4">
            <p className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-accent-primary" /> AI chain reading
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {(Object.keys(chain.modes) as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    mode === m ? 'bg-accent-primary border-accent-primary text-white' : 'border-white/15 text-text-secondary hover:border-white/30'
                  }`}
                >
                  {chain.modes[m]}
                </button>
              ))}
            </div>
            <select
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full bg-bg-secondary border border-white/10 rounded-lg px-3 py-2 text-sm text-text-secondary mb-3"
              aria-label="What do you want to know?"
            >
              <option value="">What events are going to take place?</option>
              {chain.questions.slice(1).map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>

            {canAI ? (
              <button onClick={read} disabled={streaming} className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
                {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {text ? 'Read it again' : 'Read this for me'}
              </button>
            ) : (
              <Link href="/pricing" className="btn-primary inline-flex px-4 py-2 text-sm">
                Unlock the AI chain reading
              </Link>
            )}
            {aiError && <p className="text-sm text-red-400 mt-2">{aiError}</p>}
            {text && (
              <div className="mt-4">
                <ChatMarkdown>{text}</ChatMarkdown>
                <p className="text-[11px] text-text-muted mt-3">A read, not a verdict. Check it against your life.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
