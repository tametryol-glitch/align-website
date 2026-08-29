/* ──────────────────────────────────────────────────────────────
   Cosmic Frequencies — health domain

   EVERY entry here is severity 3. Health frequencies require the
   acknowledged disclaimer before the detail view, and the weekly
   push carries the theme's `pressure` string only — never this
   file's `intent` text and never the code itself.

   Voice rule, non-negotiable: these describe a STRETCH OF TIME
   that taxes a system. They do not name conditions, do not
   diagnose, and do not predict illness. "A period that can run
   your nervous system hot" is in scope. "You may develop X" is
   not, and no disclaimer makes it in scope.

   Sourcing: `community` entries are sequences in broad public
   circulation. `derived` entries are Align-original, minted for
   themes with no well-attested community equivalent, and frozen
   once assigned — ids and codes must never shift under users who
   have them in their history.
   ────────────────────────────────────────────────────────────── */

import type { CosmicFrequency } from './types';

export const HEALTH_FREQUENCIES: CosmicFrequency[] = [
  {
    id: 'health-general-normalization',
    code: '1 814 321',
    title: 'General Restoration',
    domain: 'health',
    themes: ['vitality-depletion', 'recovery-convalescence'],
    intent:
      'The broad-spectrum one. Use it in stretches where nothing is acutely wrong but everything is running at eighty percent and you cannot point at why.',
    severity: 3,
    source: 'community',
    verified: false,
  },
  {
    id: 'health-vitality-restore',
    code: '9 187 948 181',
    title: 'Vitality Restore',
    domain: 'health',
    themes: ['vitality-depletion', 'immune-resilience'],
    intent:
      'For the weeks where your reserves are visibly draining faster than they refill and you keep spending them anyway.',
    severity: 3,
    source: 'community',
    verified: false,
  },
  {
    id: 'health-nervous-system',
    code: '5 481 231',
    title: 'Nervous System Settling',
    domain: 'health',
    themes: ['nervous-system-strain', 'sleep-disruption'],
    intent:
      'For periods when your system will not come down off high alert — when rest is available and your body refuses to take it.',
    severity: 3,
    source: 'derived',
    verified: false,
  },
  {
    id: 'health-sleep',
    code: '2 145 432',
    title: 'Deep Sleep',
    domain: 'health',
    themes: ['sleep-disruption'],
    intent:
      'For windows where sleep goes shallow and the nights run long. Work with it at the same hour each evening rather than only on the bad nights.',
    severity: 3,
    source: 'derived',
    verified: false,
  },
  {
    id: 'health-immune',
    code: '8 941 254',
    title: 'Defences',
    domain: 'health',
    themes: ['immune-resilience'],
    intent:
      'A shoring-up frequency for seasons that ask you to bank resilience rather than spend it.',
    severity: 3,
    source: 'derived',
    verified: false,
  },
  {
    id: 'health-structural',
    code: '4 812 412',
    title: 'Structure and Support',
    domain: 'health',
    themes: ['structural-strain'],
    intent:
      'For stretches where the parts of you that carry weight start asking for support — the load-bearing places you normally ignore until they complain.',
    severity: 3,
    source: 'derived',
    verified: false,
  },
  {
    id: 'health-cooling',
    code: '1 234 814',
    title: 'Cooling',
    domain: 'health',
    themes: ['inflammation-heat'],
    intent:
      'For periods running hot in both senses — the physical heat and the shortened fuse that tends to arrive with it.',
    severity: 3,
    source: 'derived',
    verified: false,
  },
  {
    id: 'health-digestive',
    code: '5 421 427',
    title: 'What You Take In',
    domain: 'health',
    themes: ['digestive-sensitivity'],
    intent:
      'For windows where what you consume needs more care than usual — food, but also everything else you are absorbing.',
    severity: 3,
    source: 'derived',
    verified: false,
  },
  {
    id: 'health-cycles',
    code: '9 817 543',
    title: 'Inner Rhythms',
    domain: 'health',
    themes: ['hormonal-fluctuation'],
    intent:
      'For stretches where your internal rhythms swing wider than baseline and the swing itself is the thing to work with.',
    severity: 3,
    source: 'derived',
    verified: false,
  },
  {
    id: 'health-recovery',
    code: '9 187 756',
    title: 'Convalescence',
    domain: 'health',
    themes: ['recovery-convalescence'],
    intent:
      'For the period after the hard part, when the temptation is to resume at full speed and the season is asking you not to.',
    severity: 3,
    source: 'community',
    verified: false,
  },
  {
    id: 'health-longstanding',
    code: '4 748 132 148',
    title: 'Long-Standing Patterns',
    domain: 'health',
    themes: ['chronic-pattern-relief'],
    intent:
      'For windows where something long-running in your body surfaces and asks to be addressed rather than managed around again.',
    severity: 3,
    source: 'community',
    verified: false,
  },
];
