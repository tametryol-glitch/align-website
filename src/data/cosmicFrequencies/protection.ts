/* ──────────────────────────────────────────────────────────────
   Cosmic Frequencies — protection domain

   Note on `legal-entanglement`: framed as attention and process,
   never as an outcome. Nothing here claims to influence a ruling.
   ────────────────────────────────────────────────────────────── */

import type { CosmicFrequency } from './types';

export const PROTECTION_FREQUENCIES: CosmicFrequency[] = [
  {
    id: 'protection-core',
    code: '71 042',
    title: 'Protection',
    domain: 'protection',
    themes: ['external-hostility', 'boundary-erosion'],
    intent:
      'The general protective sequence. Broad-spectrum — use it for the season rather than the single incident.',
    severity: 1,
    source: 'community',
    verified: false,
  },
  {
    id: 'protection-boundaries',
    code: '5 421 891',
    title: 'Boundaries',
    domain: 'protection',
    themes: ['boundary-erosion'],
    intent:
      'For windows where your limits get tested by degrees rather than all at once. The erosion is the point — no single ask looks unreasonable.',
    severity: 2,
    source: 'derived',
    verified: false,
  },
  {
    id: 'protection-hostility',
    code: '9 148 725',
    title: 'Working Against You',
    domain: 'protection',
    themes: ['external-hostility'],
    intent:
      'For periods where someone is actively working against you rather than merely disagreeing with you. Aimed at clarity about which it is.',
    severity: 2,
    source: 'derived',
    verified: false,
  },
  {
    id: 'protection-legal',
    code: '8 145 291',
    title: 'Process and Paperwork',
    domain: 'protection',
    themes: ['legal-entanglement'],
    intent:
      'For stretches where formal processes need your full attention. Aimed at your diligence inside the process — not at its outcome.',
    severity: 2,
    source: 'derived',
    verified: false,
  },
  {
    id: 'protection-travel',
    code: '4 185 792',
    title: 'Safe Passage',
    domain: 'protection',
    themes: ['travel-safety'],
    intent:
      'For windows where movement and journeys want extra margin built in. Leave earlier than the calculation says.',
    severity: 1,
    source: 'derived',
    verified: false,
  },
  {
    id: 'protection-psychic',
    code: '1 489 156',
    title: 'What Is Not Yours',
    domain: 'protection',
    themes: ['psychic-overwhelm'],
    intent:
      'For stretches where you are carrying far more of other people than belongs to you, and mistaking it for your own mood.',
    severity: 2,
    source: 'derived',
    verified: false,
  },
];
