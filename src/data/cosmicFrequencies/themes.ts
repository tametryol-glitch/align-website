/* ──────────────────────────────────────────────────────────────
   Cosmic Frequencies — theme vocabulary

   The join table between astrology and content. Phase 2's scoring
   engine resolves a winning transit/progression signature to one
   of these keys; the registry then resolves the key to a frequency.

   Every `pressure` string is written to be safe in a push body with
   no disclaimer attached. That means: a stretch of time, a load on
   a system, a thing to watch — never a diagnosis, never a
   prediction of illness, never an outcome stated as fact.
   ────────────────────────────────────────────────────────────── */

import type { FrequencyTheme, ThemeMeta, FrequencyDomain } from './types';

export const FREQUENCY_THEMES: Record<FrequencyTheme, ThemeMeta> = {
  /* ── health ─────────────────────────────────────────────────── */
  'vitality-depletion': {
    label: 'Vitality Depletion',
    domain: 'health',
    pressure: 'a stretch where your reserves drain faster than they refill',
  },
  'nervous-system-strain': {
    label: 'Nervous System Strain',
    domain: 'health',
    pressure: 'a period that can run your nervous system hot and make rest hard to land',
  },
  'sleep-disruption': {
    label: 'Sleep Disruption',
    domain: 'health',
    pressure: 'a window where sleep gets shallow and the nights run long',
  },
  'immune-resilience': {
    label: 'Immune Resilience',
    domain: 'health',
    pressure: 'a season for shoring up your defences rather than spending them',
  },
  'structural-strain': {
    label: 'Structural Strain',
    domain: 'health',
    pressure: 'a stretch where the body asks for support in the places that carry weight',
  },
  'inflammation-heat': {
    label: 'Heat and Overdrive',
    domain: 'health',
    pressure: 'a period running hot — physically and in temper',
  },
  'digestive-sensitivity': {
    label: 'Digestive Sensitivity',
    domain: 'health',
    pressure: 'a window where what you take in needs more care than usual',
  },
  'hormonal-fluctuation': {
    label: 'Cycles and Fluctuation',
    domain: 'health',
    pressure: 'a stretch where your internal rhythms swing wider than normal',
  },
  'recovery-convalescence': {
    label: 'Recovery',
    domain: 'health',
    pressure: 'a period that rewards convalescence over pushing through',
  },
  'chronic-pattern-relief': {
    label: 'Long-Standing Patterns',
    domain: 'health',
    pressure: 'a window where something long-running in your body asks to be addressed',
  },

  /* ── money ──────────────────────────────────────────────────── */
  'income-instability': {
    label: 'Income Instability',
    domain: 'money',
    pressure: 'a stretch where income gets less predictable than you planned around',
  },
  'debt-pressure': {
    label: 'Debt Pressure',
    domain: 'money',
    pressure: 'a period where what you owe starts setting the agenda',
  },
  'unexpected-expense': {
    label: 'Unexpected Expense',
    domain: 'money',
    pressure: 'a window where costs arrive without warning',
  },
  'earning-expansion': {
    label: 'Earning Expansion',
    domain: 'money',
    pressure: 'an opening where your earning capacity can genuinely widen',
  },
  'scarcity-mindset': {
    label: 'Scarcity Thinking',
    domain: 'money',
    pressure: 'a stretch where fear of not-enough starts making your decisions',
  },
  'contract-negotiation': {
    label: 'Contracts and Terms',
    domain: 'money',
    pressure: 'a window where the fine print matters more than the headline number',
  },

  /* ── love ───────────────────────────────────────────────────── */
  'relationship-rupture': {
    label: 'Relationship Rupture',
    domain: 'love',
    pressure: 'a period where something in a close bond reaches a breaking point',
  },
  'trust-repair': {
    label: 'Trust Repair',
    domain: 'love',
    pressure: 'a window where trust either gets rebuilt or quietly written off',
  },
  'loneliness-isolation': {
    label: 'Isolation',
    domain: 'love',
    pressure: 'a stretch where distance sets in, whether or not anyone left',
  },
  'attraction-magnetism': {
    label: 'Attraction',
    domain: 'love',
    pressure: 'an opening where you are considerably more visible to other people',
  },
  'commitment-pressure': {
    label: 'Commitment Pressure',
    domain: 'love',
    pressure: 'a period where a relationship asks you to decide rather than drift',
  },
  'family-obligation': {
    label: 'Family Obligation',
    domain: 'love',
    pressure: 'a stretch where family duty starts pulling on your time and your patience',
  },

  /* ── career ─────────────────────────────────────────────────── */
  'reputation-exposure': {
    label: 'Reputation Exposure',
    domain: 'career',
    pressure: 'a window where more people are watching than you realise',
  },
  'authority-conflict': {
    label: 'Authority Conflict',
    domain: 'career',
    pressure: 'a period of friction with someone who outranks you',
  },
  'vocation-redirection': {
    label: 'Vocation Redirection',
    domain: 'career',
    pressure: 'a stretch where the work you have stops fitting the person you became',
  },
  'burnout-overwork': {
    label: 'Overwork',
    domain: 'career',
    pressure: 'a period where the pace you are keeping is not one you can keep',
  },
  'recognition-delay': {
    label: 'Delayed Recognition',
    domain: 'career',
    pressure: 'a stretch where the credit arrives later than the work did',
  },

  /* ── protection ─────────────────────────────────────────────── */
  'boundary-erosion': {
    label: 'Boundary Erosion',
    domain: 'protection',
    pressure: 'a window where your limits get tested by degrees rather than all at once',
  },
  'external-hostility': {
    label: 'External Hostility',
    domain: 'protection',
    pressure: 'a period where someone is working against you more actively than usual',
  },
  'legal-entanglement': {
    label: 'Legal Entanglement',
    domain: 'protection',
    pressure: 'a stretch where formal processes and paperwork need your full attention',
  },
  'travel-safety': {
    label: 'Travel and Transit',
    domain: 'protection',
    pressure: 'a window where movement and journeys want extra margin',
  },
  'psychic-overwhelm': {
    label: 'Psychic Overwhelm',
    domain: 'protection',
    pressure: 'a stretch where you are absorbing far more of other people than is yours',
  },

  /* ── spiritual ──────────────────────────────────────────────── */
  'identity-dissolution': {
    label: 'Identity Dissolution',
    domain: 'spiritual',
    pressure: 'a period where who you have been stops describing who you are',
  },
  'meaning-crisis': {
    label: 'Meaning Crisis',
    domain: 'spiritual',
    pressure: 'a stretch where the reasons that used to work stop working',
  },
  'intuition-opening': {
    label: 'Intuition Opening',
    domain: 'spiritual',
    pressure: 'a window where your instincts are running unusually accurate',
  },
  'karmic-closure': {
    label: 'Karmic Closure',
    domain: 'spiritual',
    pressure: 'a period where something long-carried is finally ready to be set down',
  },
  'transformation-pressure': {
    label: 'Transformation Pressure',
    domain: 'spiritual',
    pressure: 'a stretch where change is happening to you whether or not you chose it',
  },
};

export const ALL_THEME_KEYS = Object.keys(FREQUENCY_THEMES) as FrequencyTheme[];

/** Every theme belonging to one domain. */
export function getThemesForDomain(domain: FrequencyDomain): FrequencyTheme[] {
  return ALL_THEME_KEYS.filter((k) => FREQUENCY_THEMES[k].domain === domain);
}

export function isFrequencyTheme(value: string): value is FrequencyTheme {
  return Object.prototype.hasOwnProperty.call(FREQUENCY_THEMES, value);
}
