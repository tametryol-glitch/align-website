/* ──────────────────────────────────────────────────────────────
   Cosmic Frequencies — money domain

   Bold and direct per house voice rules. These name the actual
   financial pressure rather than gesturing at "abundance".
   ────────────────────────────────────────────────────────────── */

import type { CosmicFrequency } from './types';

export const MONEY_FREQUENCIES: CosmicFrequency[] = [
  {
    id: 'money-wealth-core',
    code: '520 741 8',
    title: 'Wealth',
    domain: 'money',
    themes: ['earning-expansion', 'scarcity-mindset'],
    intent:
      'The most widely used sequence in circulation. Work with it for capacity rather than for a specific sum — it is aimed at the ceiling, not the next invoice.',
    severity: 1,
    source: 'community',
    verified: false,
  },
  {
    id: 'money-unexpected',
    code: '71 427 321 893',
    title: 'Unexpected Money',
    domain: 'money',
    themes: ['income-instability'],
    intent:
      'For stretches where the gap is real and the timing matters. Aimed at money arriving from a direction you were not tracking.',
    severity: 1,
    source: 'community',
    verified: false,
  },
  {
    id: 'money-income-stability',
    code: '3 186 125',
    title: 'Steady Income',
    domain: 'money',
    themes: ['income-instability'],
    intent:
      'For periods where income turns unpredictable and you are budgeting against a number that keeps moving.',
    severity: 2,
    source: 'derived',
    verified: false,
  },
  {
    id: 'money-debt',
    code: '8 124 592',
    title: 'Debt Pressure',
    domain: 'money',
    themes: ['debt-pressure'],
    intent:
      'For the stretch where what you owe starts setting your agenda — when the repayment schedule is quietly making your decisions for you.',
    severity: 2,
    source: 'derived',
    verified: false,
  },
  {
    id: 'money-unexpected-cost',
    code: '4 851 264',
    title: 'Sudden Costs',
    domain: 'money',
    themes: ['unexpected-expense'],
    intent:
      'For windows where expenses arrive without warning and in clusters. Aimed at the shock, not just the sum.',
    severity: 2,
    source: 'derived',
    verified: false,
  },
  {
    id: 'money-scarcity',
    code: '197 141',
    title: 'Enough',
    domain: 'money',
    themes: ['scarcity-mindset'],
    intent:
      'For the stretch where fear of not-enough starts making choices on your behalf — usually visible as declining things you can actually afford.',
    severity: 2,
    source: 'community',
    verified: false,
  },
  {
    id: 'money-contracts',
    code: '2 918 471',
    title: 'Terms and Fine Print',
    domain: 'money',
    themes: ['contract-negotiation'],
    intent:
      'For windows where the structure of a deal matters more than its headline number. Read the clause you are tempted to skip.',
    severity: 2,
    source: 'derived',
    verified: false,
  },
];
