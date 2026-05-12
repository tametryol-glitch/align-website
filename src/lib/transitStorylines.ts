/**
 * Transit storyline engine — client-side arc grouping.
 *
 * The backend `/transits/events` endpoint returns point-in-time aspect
 * peaks (one row per exact hit). Outer planets typically contact a single
 * natal point 1, 3, or 5 times across a retrograde cycle — direct, retro,
 * direct. This service clusters those peaks into arcs so the UI can tell
 * one story across the whole dance instead of listing isolated exact dates.
 *
 * We do not synthesize ingress/egress here — the backend only yields peaks,
 * so arc bounds are first-peak → last-peak. A later backend extension can
 * widen that to real orb-crossing dates.
 */

export interface TransitPeak {
  date: string;
  transiting_planet: string;
  natal_planet: string;
  aspect_type: string;
  orb?: number;
  is_retrograde?: boolean;
  transit_sign?: string;
  natal_sign?: string;
  intensity?: 'low' | 'medium' | 'high';
  category?: string;
}

export type StorylinePhase =
  | 'approaching'
  | 'first_pass'
  | 'retrograde_peak'
  | 'final_pass'
  | 'completed'
  | 'single';

export interface TransitStoryline {
  id: string;
  transitingPlanet: string;
  natalPlanet: string;
  aspectType: string;
  passes: TransitPeak[];
  startsAt: Date;
  endsAt: Date;
  passCount: number;
  phase: StorylinePhase;
  tightestOrb: number;
}

const MS_PER_DAY = 86_400_000;
const COMPLETED_GRACE_DAYS = 30;

function normalizeAspect(raw: string): string {
  if (!raw) return '';
  const s = raw.toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function arcIdFor(peak: TransitPeak): string {
  return `${peak.transiting_planet}-${normalizeAspect(peak.aspect_type)}-${peak.natal_planet}`;
}

function comparePeakByDate(a: TransitPeak, b: TransitPeak): number {
  return new Date(a.date).getTime() - new Date(b.date).getTime();
}

function computePhase(peaks: TransitPeak[], now: Date): StorylinePhase {
  if (peaks.length === 1) return 'single';
  const nowMs = now.getTime();
  const times = peaks.map((p) => new Date(p.date).getTime());
  const first = times[0];
  const last = times[times.length - 1];

  if (nowMs < first) return 'approaching';
  if (nowMs > last + COMPLETED_GRACE_DAYS * MS_PER_DAY) return 'completed';
  if (nowMs > last) return 'final_pass';

  for (let i = 1; i < times.length; i++) {
    if (nowMs <= times[i]) {
      if (peaks.length >= 3 && i >= 2) return 'retrograde_peak';
      return 'first_pass';
    }
  }
  return 'final_pass';
}

export function groupPeaksIntoStorylines(
  peaks: TransitPeak[],
  now: Date = new Date(),
): TransitStoryline[] {
  const byId = new Map<string, TransitPeak[]>();

  for (const raw of peaks) {
    if (!raw.transiting_planet || !raw.natal_planet || !raw.aspect_type) continue;
    const normalized: TransitPeak = { ...raw, aspect_type: normalizeAspect(raw.aspect_type) };
    const id = arcIdFor(normalized);
    const bucket = byId.get(id) ?? [];
    bucket.push(normalized);
    byId.set(id, bucket);
  }

  const arcs: TransitStoryline[] = [];
  for (const [id, group] of Array.from(byId.entries())) {
    group.sort(comparePeakByDate);
    const orbs = group
      .map((p) => (typeof p.orb === 'number' ? p.orb : Number.POSITIVE_INFINITY))
      .filter((o) => Number.isFinite(o));
    arcs.push({
      id,
      transitingPlanet: group[0].transiting_planet,
      natalPlanet: group[0].natal_planet,
      aspectType: normalizeAspect(group[0].aspect_type),
      passes: group,
      startsAt: new Date(group[0].date),
      endsAt: new Date(group[group.length - 1].date),
      passCount: group.length,
      phase: computePhase(group, now),
      tightestOrb: orbs.length ? Math.min(...orbs) : 0,
    });
  }

  const phaseRank: Record<StorylinePhase, number> = {
    retrograde_peak: 0,
    first_pass: 1,
    final_pass: 2,
    approaching: 3,
    single: 4,
    completed: 5,
  };

  arcs.sort((a, b) => {
    const byPhase = phaseRank[a.phase] - phaseRank[b.phase];
    if (byPhase !== 0) return byPhase;
    if (a.phase === 'approaching' || a.phase === 'single') {
      return a.startsAt.getTime() - b.startsAt.getTime();
    }
    return a.tightestOrb - b.tightestOrb;
  });

  return arcs;
}

/**
 * Fraction (0–1) of "now" across the arc from startsAt to endsAt — used
 * to render a "you are here" marker on the timeline. Single-pass arcs
 * return 0.5 (no meaningful span).
 */
export function storylineProgress(
  arc: TransitStoryline,
  now: Date = new Date(),
): number {
  const span = arc.endsAt.getTime() - arc.startsAt.getTime();
  if (span <= 0) return 0.5;
  const t = (now.getTime() - arc.startsAt.getTime()) / span;
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t;
}

export function phaseLabel(phase: StorylinePhase): string {
  switch (phase) {
    case 'approaching': return 'Approaching';
    case 'first_pass': return 'First Pass';
    case 'retrograde_peak': return 'Retrograde Middle';
    case 'final_pass': return 'Final Pass';
    case 'completed': return 'Cycle Complete';
    case 'single': return 'One-Time Contact';
  }
}

export function phaseDescription(arc: TransitStoryline, now: Date = new Date()): string {
  const nowMs = now.getTime();
  switch (arc.phase) {
    case 'approaching': {
      const days = Math.max(0, Math.round((arc.startsAt.getTime() - nowMs) / MS_PER_DAY));
      return `Building — first peak in ${days} day${days === 1 ? '' : 's'}.`;
    }
    case 'first_pass':
      return arc.passCount >= 3
        ? 'The story has opened. You have hit the first exact — retrograde will bring it around again.'
        : 'The story is unfolding now.';
    case 'retrograde_peak':
      return 'The middle of the cycle — revisit themes that surfaced in the first pass. Integration work.';
    case 'final_pass': {
      const days = Math.max(0, Math.round((nowMs - arc.endsAt.getTime()) / MS_PER_DAY));
      return days <= 1
        ? 'Closing chapter. The last exact just landed — integrate what you have learned.'
        : `Closing chapter. ${days} day${days === 1 ? '' : 's'} since the last exact.`;
    }
    case 'completed':
      return 'This cycle has closed. The lessons stay.';
    case 'single': {
      const days = Math.round((arc.startsAt.getTime() - nowMs) / MS_PER_DAY);
      if (days > 0) return `One contact in ${days} day${days === 1 ? '' : 's'}.`;
      if (days < 0) return `One contact, ${-days} day${days === -1 ? '' : 's'} ago.`;
      return 'One contact, today.';
    }
  }
}

export const __internals = { arcIdFor, computePhase, normalizeAspect };
