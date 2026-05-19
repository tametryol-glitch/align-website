import { NODE_AXIS_MEANINGS } from './nodeMeanings';
import { SIGN_TRAITS } from './signs';
import type { NormalizedChart, SoulScar } from './types';

const HOUSE_SCAR_HINTS: Record<number, string> = {
  1: 'Fear of being seen',
  2: 'Fear of poverty',
  3: 'Fear of truth',
  4: 'Fear of abandonment',
  5: 'Fear of joy',
  6: 'Fear of failure',
  7: 'Fear of rejection',
  8: 'Fear of betrayal',
  9: 'Fear of confinement',
  10: 'Fear of losing control',
  11: 'Fear of exile',
  12: 'Fear of silence',
};

const SCAR_GIFTS: Record<string, string> = {
  'Fear of abandonment': 'emotional independence',
  'Fear of being seen': 'leadership',
  'Fear of poverty': 'value mastery',
  'Fear of betrayal': 'discernment',
  'Fear of power': 'self-mastery',
  'Fear of love': 'devotion',
  'Fear of failure': 'resilient skill',
  'Fear of surrender': 'trust',
  'Fear of rejection': 'self-honoring courage',
  'Fear of silence': 'inner peace',
  'Fear of truth': 'wisdom',
  'Fear of intimacy': 'sacred closeness',
  'Fear of freedom': 'chosen belonging',
  'Fear of losing control': 'calm authority',
  'Fear of exile': 'originality',
  'Fear of confinement': 'humble wisdom',
  'Fear of dependence': 'brave interdependence',
  'Fear of vulnerability': 'nurturing authority',
  'Fear of boundaries': 'embodied devotion',
  'Fear of imperfection': 'healing mercy',
  'Fear of loss': 'deep trust',
  'Fear of joy': 'creative permission',
};

export function createSoulScar(chart: NormalizedChart, inherited?: SoulScar): SoulScar {
  if (inherited && inherited.status !== 'healed') {
    return {
      ...inherited,
      intensity: Math.min(100, inherited.intensity + 8),
      source: `${inherited.source} It has followed the soul into this lifetime in a sharper form.`,
    };
  }

  const southSign = chart.placements['South Node'].sign;
  const moon = chart.placements.Moon;
  const chiron = chart.placements.Chiron;
  const axis = NODE_AXIS_MEANINGS[southSign];
  const name = axis?.scar || HOUSE_SCAR_HINTS[chiron.house] || HOUSE_SCAR_HINTS[moon.house] || 'Fear of surrender';
  const transformedGift = axis?.scarGift || SCAR_GIFTS[name] || SIGN_TRAITS[moon.sign].giftTone;

  return {
    id: `scar-${southSign.toLowerCase()}-${moon.house}`,
    name,
    source: `This scar begins where the ${moon.sign} Moon remembers ${SIGN_TRAITS[moon.sign].woundTone}, and where the South Node old life learned to survive by repeating the same protection.`,
    intensity: 46,
    shadowPhrase: `When this scar is touched, the soul reaches for ${axis.comfortTrap.toLowerCase()}`,
    transformedGift,
    status: 'active',
  };
}

export function evolveSoulScar(scar: SoulScar, purposeScore: number, shadowScore: number): SoulScar {
  const intensity = Math.max(0, Math.min(100, scar.intensity + shadowScore * 0.08 - purposeScore * 0.12));
  const status: SoulScar['status'] = intensity <= 18 ? 'healed' : intensity <= 38 ? 'healing' : 'active';
  return { ...scar, intensity: Math.round(intensity), status };
}

export function scarReviewLine(scar: SoulScar): string {
  if (scar.status === 'healed') {
    return `${scar.name} softened into ${scar.transformedGift}. The wound did not vanish; it became usable light.`;
  }
  if (scar.status === 'healing') {
    return `${scar.name} loosened its grip. The soul can feel the old door, but it no longer has to enter every time.`;
  }
  return `${scar.name} remains active. The next lifetime will place this fear in a harder, clearer form.`;
}
