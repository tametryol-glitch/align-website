// ═══════════════════════════════════════════════════════════════════
// Live rewards — what a heart is actually worth.
//
// Hearts buy standing and reach, never money. A heart is free and
// unlimited, so cash for hearts would be cash for button presses with
// no revenue behind it; gifts work because the viewer already paid.
// That is also how TikTok draws the line — likes feed ranking, gifts
// feed diamonds.
//
// The payoff a creator can actually feel: a public badge, a better
// place in the live rail, and eventually the right to receive gifts at
// all. Hearts earn the right to be paid; gifts are the payment.
// ═══════════════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase';

export type LiveTier = 'spark' | 'ember' | 'flare' | 'beacon' | 'nova' | 'supernova';

export interface LiveTierMeta {
  key: LiveTier;
  label: string;
  /** Qualified hearts needed to reach it. */
  threshold: number;
  /** Tailwind classes for the badge. */
  className: string;
  glyph: string;
  /** What reaching it actually gets you. */
  perk: string;
}

/**
 * Thresholds are on QUALIFIED hearts, not raw ones — distinct viewers,
 * capped per stream, who actually watched. See the rewards migration.
 */
export const LIVE_TIERS: LiveTierMeta[] = [
  {
    key: 'spark',
    label: 'Spark',
    threshold: 0,
    glyph: '·',
    className: 'bg-white/10 text-white/70',
    perk: 'Everyone starts here.',
  },
  {
    key: 'ember',
    label: 'Ember',
    threshold: 500,
    glyph: '✦',
    className: 'bg-amber-500/15 text-amber-300',
    perk: 'Badge on your streams and profile.',
  },
  {
    key: 'flare',
    label: 'Flare',
    threshold: 2500,
    glyph: '✧',
    className: 'bg-orange-500/15 text-orange-300',
    perk: 'Higher placement in the live rail.',
  },
  {
    key: 'beacon',
    label: 'Beacon',
    threshold: 10000,
    glyph: '❋',
    className: 'bg-rose-500/15 text-rose-300',
    perk: 'Featured placement when you go live.',
  },
  {
    key: 'nova',
    label: 'Nova',
    threshold: 50000,
    glyph: '✺',
    className: 'bg-fuchsia-500/15 text-fuchsia-300',
    perk: 'Top of the rail, and priority in notifications.',
  },
  {
    key: 'supernova',
    label: 'Supernova',
    threshold: 250000,
    glyph: '✹',
    className: 'bg-violet-500/20 text-violet-200',
    perk: 'Everything above, plus early access to new live features.',
  },
];

export function tierMeta(tier: LiveTier | string | null | undefined): LiveTierMeta {
  return LIVE_TIERS.find((t) => t.key === tier) ?? LIVE_TIERS[0];
}

/** The next tier up, or null at the top. */
export function nextTier(tier: LiveTier | string | null | undefined): LiveTierMeta | null {
  const i = LIVE_TIERS.findIndex((t) => t.key === (tier ?? 'spark'));
  return i >= 0 && i < LIVE_TIERS.length - 1 ? LIVE_TIERS[i + 1] : null;
}

export interface LiveStanding {
  creator_id: string;
  lifetime_hearts: number;
  qualified_hearts: number;
  streams_count: number;
  total_stream_seconds: number;
  unique_hearters: number;
  peak_concurrent_ever: number;
  tier: LiveTier;
}

/** A creator's standing. Public — a badge nobody can see is not a badge. */
export async function getLiveStanding(creatorId: string): Promise<LiveStanding | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('live_creator_stats')
    .select('*')
    .eq('creator_id', creatorId)
    .maybeSingle();
  return (data as LiveStanding) || null;
}

/** Progress toward the next tier, 0..1. */
export function tierProgress(standing: LiveStanding | null): number {
  if (!standing) return 0;
  const next = nextTier(standing.tier);
  if (!next) return 1;
  const current = tierMeta(standing.tier);
  const span = next.threshold - current.threshold;
  if (span <= 0) return 1;
  return Math.max(0, Math.min(1, (standing.qualified_hearts - current.threshold) / span));
}
