/* ──────────────────────────────────────────────────────────────
   Entrainment sessions.

   Deliberately NOT modelled as a CosmicFrequency. A CosmicFrequency is a
   numeric sequence: it carries a `code`, a theme from the closed vocabulary
   the astrological scorer maps onto, a severity and a source. A brainwave
   session has none of those. Giving one a placeholder code would put it into
   `getPushEligible` and the theme coverage test, quietly corrupting weekly
   push selection to ship an unrelated content type.

   So this is a sibling: same section of the app, separate model, no shared
   surface with the codex beyond the audio bucket.
   ────────────────────────────────────────────────────────────── */

/** One rendering of a session. Same descent, different ending. */
export interface EntrainmentVariant {
  /** Stable slug. Part of the asset filename — never rename in place. */
  id: string;
  label: string;
  /** What the last few minutes do, in second person. */
  description: string;
  /** Filename inside the bucket's `sessions/` folder. */
  file: string;
}

export interface EntrainmentSession {
  /** Stable slug. History rows point at these. */
  id: string;
  title: string;
  /** Second person, what this is actually for. */
  intent: string;
  /** Beat-rate range of the plateau, as measured off the rendered audio. */
  band: string;
  /** Length of every variant. The file IS the session, so this is exact. */
  minutes: number;
  /**
   * Headphones required rather than recommended.
   *
   * The binaural layer is two tones a few Hz apart, one per ear; summed to
   * mono it stops being a binaural beat at all. The panning layer still
   * works, so a mono listener gets something — just not the whole thing.
   */
  headphones: boolean;
  variants: EntrainmentVariant[];
}

/**
 * Hemispheric Sync — a 30-minute descent to the theta/delta border.
 *
 * NOT "Hemi-Sync", which is a registered trademark of The Monroe Institute.
 * The name here is descriptive and deliberately distinct; do not shorten it.
 *
 * Structure, all figures measured off the rendered audio rather than intended:
 * starts at ~8.8 Hz, walks down to a 3.5 Hz plateau by minute 10, holds to
 * minute 26 drifting between 3.1 and 4.1 Hz so it crosses the 4 Hz theta/delta
 * line rather than parking on one side, then resolves.
 *
 * Two steady tone pairs (400 and 250 Hz, each offset by the beat rate) carry
 * the entrainment and never move — panning them would collapse the interaural
 * phase difference the beat is made of. A separate band of bright noise sweeps
 * ear to ear instead, at a crossing rate tied to the beat so the movement slows
 * as the track descends. No amplitude pulsing anywhere: it reads as annoying
 * over half an hour.
 */
export const ENTRAINMENT_SESSIONS: EntrainmentSession[] = [
  {
    id: 'hemispheric-sync',
    title: 'Hemispheric Sync',
    intent:
      'Thirty minutes that walk you down to the edge between theta and delta — the threshold where the body lets go before sleep takes over. Put it on, close your eyes, and stop steering.',
    band: '3.1–4.1 Hz',
    minutes: 30,
    headphones: true,
    variants: [
      {
        id: 'return',
        label: 'Return',
        description: 'Brings you back up over the last four minutes, so you surface clear rather than groggy.',
        file: 'hemispheric-sync-30-return.mp3',
      },
      {
        id: 'sleep',
        label: 'Sleep',
        description: 'Keeps descending to the end and fades out. For listening in bed.',
        file: 'hemispheric-sync-30-sleep.mp3',
      },
    ],
  },
];
