'use client';

// ═══════════════════════════════════════════════════════════════════
// Tier badge and standing card.
//
// Spark is deliberately not shown as a badge anywhere public — a label
// that says "has done nothing yet" is worse than no label. It appears
// only on the creator's own standing card, where it is a starting point
// rather than a verdict.
// ═══════════════════════════════════════════════════════════════════

import { LIVE_TIERS, tierMeta, nextTier, tierProgress, type LiveStanding } from '@/lib/liveRewards';

export function TierBadge({
  tier,
  size = 'sm',
}: {
  tier: string | null | undefined;
  size?: 'sm' | 'md';
}) {
  // Nothing earned yet, nothing to display.
  if (!tier || tier === 'spark') return null;
  const meta = tierMeta(tier);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-semibold tracking-wide ${meta.className} ${
        size === 'md' ? 'text-xs px-2 py-1' : 'text-[10px] px-1.5 py-0.5'
      }`}
      title={`${meta.label} — ${meta.perk}`}
    >
      <span aria-hidden="true">{meta.glyph}</span>
      {meta.label.toUpperCase()}
    </span>
  );
}

/** Where a creator stands, and what the next rung is worth. */
export function StandingCard({ standing }: { standing: LiveStanding | null }) {
  const meta = tierMeta(standing?.tier);
  const next = nextTier(standing?.tier);
  const progress = tierProgress(standing);
  const qualified = standing?.qualified_hearts ?? 0;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-3 mb-1">
        <span className={`text-lg rounded px-2 py-1 ${meta.className}`} aria-hidden="true">
          {meta.glyph}
        </span>
        <div>
          <h3 className="text-lg font-semibold text-white">{meta.label}</h3>
          <p className="text-xs text-white/45">{meta.perk}</p>
        </div>
      </div>

      {next ? (
        <>
          <div className="flex justify-between text-xs text-white/50 mt-4 mb-1.5">
            <span>
              {qualified.toLocaleString()} / {next.threshold.toLocaleString()} toward {next.label}
            </span>
            <span className="tabular-nums">{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-400"
              style={{ width: `${Math.max(2, progress * 100)}%` }}
            />
          </div>
        </>
      ) : (
        <p className="text-xs text-white/45 mt-4">Top tier. Nothing left to climb.</p>
      )}

      <dl className="grid grid-cols-3 gap-3 mt-5 text-center">
        <div>
          <dt className="text-[11px] text-white/40">Hearts</dt>
          <dd className="text-sm font-medium text-white tabular-nums">
            {(standing?.lifetime_hearts ?? 0).toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-white/40">People</dt>
          <dd className="text-sm font-medium text-white tabular-nums">
            {(standing?.unique_hearters ?? 0).toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-white/40">Streams</dt>
          <dd className="text-sm font-medium text-white tabular-nums">
            {(standing?.streams_count ?? 0).toLocaleString()}
          </dd>
        </div>
      </dl>

      <p className="text-[11px] text-white/35 leading-relaxed mt-4">
        Tiers count <strong className="text-white/55">qualified</strong> hearts: distinct people who
        watched for at least a minute, capped per stream. The big number above is every heart ever
        sent. Hearts earn reach and standing — they are never paid out as money.
      </p>
    </div>
  );
}

/** The whole ladder, for a page that explains the system. */
export function TierLadder({ current }: { current?: string | null }) {
  return (
    <ol className="space-y-1.5">
      {LIVE_TIERS.map((t) => {
        const isCurrent = t.key === (current ?? 'spark');
        return (
          <li
            key={t.key}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border ${
              isCurrent ? 'border-white/25 bg-white/[0.06]' : 'border-white/5'
            }`}
          >
            <span className={`rounded px-1.5 py-0.5 text-sm ${t.className}`} aria-hidden="true">
              {t.glyph}
            </span>
            <span className="flex-1">
              <span className="text-sm text-white/90">{t.label}</span>
              <span className="block text-[11px] text-white/40">{t.perk}</span>
            </span>
            <span className="text-xs text-white/45 tabular-nums shrink-0">
              {t.threshold === 0 ? '—' : t.threshold.toLocaleString()}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
