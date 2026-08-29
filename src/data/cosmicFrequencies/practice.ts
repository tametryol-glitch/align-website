/* ──────────────────────────────────────────────────────────────
   Cosmic Frequencies — how to work with a sequence.

   One shared method rather than per-entry instructions: the practice
   is the same whichever sequence you hold, and a thousand-entry
   codex cannot carry a thousand bespoke rituals.

   Nothing here promises an outcome, and nothing here tells anyone to
   change what a doctor told them. That constraint is not decoration
   — it is what keeps a numbers library on the right side of the line.
   ────────────────────────────────────────────────────────────── */

export interface PracticeStep {
  title: string;
  body: string;
}

export const PRACTICE_STEPS: PracticeStep[] = [
  {
    title: 'Read it one digit at a time',
    body:
      'Not as a whole number. 5 — 2 — 0 — 7 — 4 — 1 — 8, each digit landing separately. The spacing in the code is there to pace you, so follow it rather than reading it as "five million".',
  },
  {
    title: 'Hold one specific situation',
    body:
      'Not "money" but the invoice that has not been paid. Not "love" but the conversation you keep rehearsing. The sequence is a place to put attention; vague attention does nothing. Name the actual thing before you start.',
  },
  {
    title: 'Stay with it for a few minutes',
    body:
      'Somewhere between three and fifteen minutes is the usual range. Repeat the digits, write them out, or picture them — whichever keeps you present. When your mind wanders to the situation itself, that is fine. Come back to the digits.',
  },
  {
    title: 'Repeat daily while it is live',
    body:
      'Most people work with one sequence a day rather than collecting several. Stay with it while the situation is active, and stop when it resolves or stops mattering. There is no dosage and no schedule to fall behind on.',
  },
  {
    title: 'Write it where you will see it',
    body:
      'A note on your phone, a card in your wallet, the corner of a page. The point is not the paper — it is that the situation gets your attention more than once a day, deliberately, instead of only when it worries you.',
  },
];

export const PRACTICE_NOTES: string[] = [
  'There is no wrong order and no wrong time of day. Anyone telling you otherwise is adding rules that are not in the practice.',
  'Working with more than one sequence at once tends to dilute the attention rather than double it. Pick the one that matches what is actually pressing.',
  'Nothing about this replaces action. A frequency for debt pressure is not a payment plan, and holding it instead of opening the letter is the failure mode to watch for.',
];

/** Shown above the health category, in addition to the blocking disclaimer. */
export const HEALTH_PRACTICE_NOTE =
  'Health sequences are for the stretch of time you are in — the strain, the tiredness, the ' +
  'recovery — not for a condition or a diagnosis. Keep taking what you have been prescribed, ' +
  'keep the appointments you have made, and treat this as something you do alongside care, ' +
  'never instead of it.';
