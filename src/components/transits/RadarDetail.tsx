'use client';

import React, { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import RadarChain from '@/components/transits/RadarChain';
import {
  type RadarHit,
  type RadarCard,
  TIER_STYLE,
  bodyColor,
  fmtDate,
  fmtWhen,
  glyph,
  hitTitle,
  houseOrd,
} from '@/lib/radar';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-6 pb-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">{title}</h3>
      {children}
    </div>
  );
}

function plainText(h: RadarHit, c: RadarCard): string {
  const lines = [
    `${hitTitle(h)}  (${c.formula})`,
    h.exact ? `Exact: ${fmtDate(h.exact)}` : '',
    '',
    h.call ? `${TIER_STYLE[h.call.tier].label.toUpperCase()}: ${h.call.text}` : '',
    '',
    c.causes,
    '',
    'WHAT IS REALLY GOING ON',
    c.secret,
    '',
    'WHERE IT LANDS',
    ...h.where,
    '',
    'WHO IT BRINGS IN',
    ...c.people.map((p) => `- ${p}`),
    '',
    'HOW IT UNFOLDS',
    `Before: ${c.before}`,
    `Peak: ${c.peak}`,
    `After: ${c.after}`,
    h.timing,
    '',
    'SIGNS YOU WILL NOTICE',
    ...c.signs.map((p) => `- ${p}`),
    '',
    'THE TRAP',
    c.trap,
    '',
    'THE MOVE',
    c.move,
  ];
  return lines.filter((l, i) => l !== '' || lines[i - 1] !== '').join('\n');
}

export default function RadarDetail({
  hit,
  card,
  onClose,
  asOf,
  birthData,
  canAI,
  chartMode = 'natal',
  radarMode = 'pictures',
}: {
  hit: RadarHit;
  card: RadarCard;
  onClose: () => void;
  asOf: string;
  birthData: any;
  canAI: boolean;
  chartMode?: 'natal' | 'progressed';
  radarMode?: 'pictures' | 'all';
}) {
  const [copied, setCopied] = useState(false);
  const col = bodyColor(hit.body);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const status =
    hit.days_to_exact == null
      ? 'No exact date'
      : Math.abs(hit.days_to_exact) < 0.05
      ? 'Exact now'
      : hit.applying
      ? `Building · exact ${fmtWhen(hit.days_to_exact)}`
      : `Fading · peaked ${fmtWhen(hit.days_to_exact)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(plainText(hit, card));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl mx-auto my-6 px-4">
        <div className="bg-bg-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-2">
            <button onClick={onClose} className="text-sm text-text-muted hover:text-text-primary transition-colors">
              &larr; Back to your radar
            </button>
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
              aria-label="Copy this reading"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Header */}
          <div className="px-6 pt-2 pb-4 text-center">
            <div className="flex items-center justify-center gap-2 text-2xl mb-1" style={{ color: col }}>
              <span>{glyph(hit.body)}</span>
              <span className="text-base opacity-80">{hit.symbol}</span>
              {hit.kind !== 'planet' ? (
                <span className="text-lg">
                  {hit.kind === 'picture' && hit.sits_on ? `${glyph(hit.sits_on.planet)} = ` : ''}
                  {hit.target.split('/').map((n) => glyph(n)).join(' / ')}
                </span>
              ) : (
                <span>{glyph(hit.target)}</span>
              )}
            </div>
            <h2 className="text-xl font-display font-bold text-text-primary leading-snug">{hitTitle(hit)}</h2>
            <p className="text-sm text-text-muted mt-1">{card.formula}</p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[11px]">
              <span className="px-2.5 py-1 rounded-full border border-white/10 text-text-secondary">{hit.intensity.level} intensity</span>
              <span className="px-2.5 py-1 rounded-full border border-white/10 text-text-secondary">{status}</span>
              {hit.exact && <span className="px-2.5 py-1 rounded-full border border-white/10 text-text-secondary">Exact {fmtDate(hit.exact)}</span>}
              {hit.retro && <span className="px-2.5 py-1 rounded-full border border-white/10 text-text-secondary">Retrograde</span>}
              {hit.pass && hit.pass[1] > 1 && (
                <span className="px-2.5 py-1 rounded-full border border-white/10 text-text-secondary">Pass {hit.pass[0]} of {hit.pass[1]}</span>
              )}
            </div>
          </div>

          {/* The Call */}
          {hit.call && (
            <div className="mx-6 mb-5 rounded-xl p-4 border" style={{ borderColor: TIER_STYLE[hit.call.tier].color + '66', background: TIER_STYLE[hit.call.tier].color + '14' }}>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: TIER_STYLE[hit.call.tier].color }}>
                {TIER_STYLE[hit.call.tier].label}
              </p>
              <p className="text-sm text-text-primary leading-relaxed">{hit.call.text}</p>
              <p className="text-[11px] text-text-muted mt-2">
                A read, not a verdict. Check it against your life on {fmtDate(hit.call.to)}.
              </p>
            </div>
          )}

          <Section title="What this is">
            <p className="text-sm text-text-secondary leading-relaxed">{card.causes}</p>
            {card.events.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {card.events.map((e) => (
                  <span key={e} className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: col + '1f', color: col }}>
                    {e}
                  </span>
                ))}
              </div>
            )}
          </Section>

          <Section title="What is really going on">
            <p className="text-sm text-text-secondary leading-relaxed">{card.secret}</p>
          </Section>

          {(hit.where.length > 0 || hit.sits_on) && (
            <Section title="Where it lands">
              <ul className="space-y-2">
                {hit.sits_on && <li className="text-sm text-text-secondary leading-relaxed">{hit.sits_on.line}</li>}
                {!!hit.also_count && (
                  <li className="text-sm text-text-secondary leading-relaxed">
                    The same transit sets off {hit.also_count} more {hit.also_count === 1 ? 'picture' : 'pictures'} on{' '}
                    {hit.sits_on?.planet}: {(hit.also ?? []).join(', ')}
                    {hit.also_count > (hit.also?.length ?? 0) ? ' and more' : ''}.
                  </li>
                )}
                {hit.where.map((w, i) => (
                  <li key={i} className="text-sm text-text-secondary leading-relaxed">{w}</li>
                ))}
              </ul>
              {hit.areas.length > 0 && (
                <p className="text-[11px] text-text-muted mt-3">Life areas touched: {hit.areas.join(', ')}</p>
              )}
            </Section>
          )}

          <Section title="Who it brings in">
            <ul className="space-y-1.5">
              {card.people.map((p) => (
                <li key={p} className="text-sm text-text-secondary leading-relaxed">&bull; {p}</li>
              ))}
            </ul>
          </Section>

          <Section title="How it unfolds">
            <div className="space-y-2 text-sm text-text-secondary leading-relaxed">
              <p><span className="font-semibold text-text-primary">Before:</span> {card.before}</p>
              <p><span className="font-semibold text-text-primary">Peak:</span> {card.peak}</p>
              <p><span className="font-semibold text-text-primary">After:</span> {card.after}</p>
              <p className="text-text-muted">{hit.timing}</p>
              {card.aspect_note && <p className="text-text-muted">{card.aspect_note}</p>}
              <p className="text-text-muted">{card.trigger.text} (Active {card.trigger.lasts}.)</p>
            </div>
          </Section>

          <Section title="Signs you will notice">
            <ul className="space-y-1.5">
              {card.signs.map((s) => (
                <li key={s} className="text-sm text-text-secondary leading-relaxed">&bull; {s}</li>
              ))}
            </ul>
          </Section>

          <Section title="The trap">
            <p className="text-sm text-text-secondary leading-relaxed">{card.trap}</p>
          </Section>

          <Section title="The move">
            <p className="text-sm text-text-secondary leading-relaxed">{card.move}</p>
            {card.best && <p className="text-sm text-text-muted leading-relaxed mt-2">{card.best}</p>}
          </Section>

          <div className="mx-6 border-t border-white/10 mb-5" />
          <RadarChain hitId={hit.id} asOf={asOf} birthData={birthData} canAI={canAI} chartMode={chartMode} radarMode={radarMode} />

          <div className="mx-6 border-t border-white/10" />
          <Section title="The details">
            <div className="space-y-2 text-sm">
              {[
                ['Transit', `${hit.body} ${hit.aspect.toLowerCase()} ${hit.kind === 'picture' && hit.sits_on ? hit.sits_on.planet + ' (on the ' + hit.target + ' midpoint)' : hit.kind === 'midpoint' ? hit.target + ' midpoint' : 'your ' + hit.target}`],
                ['Orb now', hit.orb != null ? `${hit.orb.toFixed(2)}°` : 'exact at this moment'],
                ['Lands in', hit.houses.mid ? `${houseOrd(hit.houses.mid)} house` : '—'],
                ['Transit sits in', hit.houses.transit ? `${houseOrd(hit.houses.transit)} house` : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-text-muted">{k}</span>
                  <span className="text-text-secondary text-right">{v}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
