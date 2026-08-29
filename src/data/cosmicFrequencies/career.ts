/* ──────────────────────────────────────────────────────────────
   Cosmic Frequencies — career domain
   ────────────────────────────────────────────────────────────── */

import type { CosmicFrequency } from './types';

export const CAREER_FREQUENCIES: CosmicFrequency[] = [
  {
    id: 'career-work-core',
    code: '291 71',
    title: 'Work',
    domain: 'career',
    themes: ['vocation-redirection', 'recognition-delay'],
    intent:
      'The general vocational sequence. Aimed at the fit between you and the work rather than at any single opportunity.',
    severity: 1,
    source: 'community',
    verified: false,
  },
  {
    id: 'career-reputation',
    code: '5 184 216',
    title: 'Under Observation',
    domain: 'career',
    themes: ['reputation-exposure'],
    intent:
      'For windows where more people are watching than you have registered. What you do casually this month gets remembered as characteristic.',
    severity: 2,
    source: 'derived',
    verified: false,
  },
  {
    id: 'career-authority',
    code: '8 219 574',
    title: 'Authority Friction',
    domain: 'career',
    themes: ['authority-conflict'],
    intent:
      'For periods of friction with someone who outranks you. Aimed at your footing in it, not at winning it.',
    severity: 2,
    source: 'derived',
    verified: false,
  },
  {
    id: 'career-redirection',
    code: '1 489 999',
    title: 'Redirection',
    domain: 'career',
    themes: ['vocation-redirection'],
    intent:
      'For the stretch where the work you have stops fitting the person you have become — and staying starts costing more than leaving.',
    severity: 2,
    source: 'derived',
    verified: false,
  },
  {
    id: 'career-burnout',
    code: '4 185 214',
    title: 'Pace',
    domain: 'career',
    themes: ['burnout-overwork'],
    intent:
      'For periods where the pace you are keeping is demonstrably not one you can keep. The frequency is for the admission, which comes first.',
    severity: 2,
    source: 'derived',
    verified: false,
  },
  {
    id: 'career-recognition',
    code: '7 418 529',
    title: 'Delayed Credit',
    domain: 'career',
    themes: ['recognition-delay'],
    intent:
      'For stretches where the credit lands well after the work did, and someone nearer the front collected it first.',
    severity: 1,
    source: 'derived',
    verified: false,
  },
];
