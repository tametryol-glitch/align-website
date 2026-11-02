/**
 * Today engine — turns today's real planetary positions into one answer.
 *
 * Inputs are the transiting and natal positions that /transits/current
 * already returns (Swiss Ephemeris), so no new backend is involved. The
 * aspect between a moving planet and a fixed natal point is what makes the
 * answer about THIS person rather than every member of their Sun sign.
 *
 * PURE module: no store, network or clock access beyond what is passed in.
 */

export interface BodyPos {
  name: string;
  longitude: number;
}

export type AspectNature = 'flow' | 'tension' | 'fusion';

export interface TodayAspect {
  transit: string;
  natal: string;
  aspect: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  nature: AspectNature;
  orb: number;
  score: number;
}

export interface TodayAnswer {
  headline: string;
  area: string;
  doText: string;
  avoidText: string;
  /** The aspect this answer came from, null on a genuinely quiet day. */
  aspect: TodayAspect | null;
}

const ASPECTS: Array<{ name: TodayAspect['aspect']; angle: number; nature: AspectNature; verb: string }> = [
  { name: 'conjunction', angle: 0, nature: 'fusion', verb: 'meets' },
  { name: 'sextile', angle: 60, nature: 'flow', verb: 'sextiles' },
  { name: 'square', angle: 90, nature: 'tension', verb: 'squares' },
  { name: 'trine', angle: 120, nature: 'flow', verb: 'trines' },
  { name: 'opposition', angle: 180, nature: 'tension', verb: 'opposes' },
];

// Transiting bodies: how wide an orb counts as "today", and how much the
// transit matters. Slow planets weigh more because they are rarer and last.
const TRANSIT: Record<string, { orb: number; weight: number }> = {
  Moon: { orb: 3, weight: 1.2 },
  Sun: { orb: 2.5, weight: 2.5 },
  Mercury: { orb: 2.5, weight: 2 },
  Venus: { orb: 2.5, weight: 2 },
  Mars: { orb: 2.5, weight: 3 },
  Jupiter: { orb: 2, weight: 3 },
  Saturn: { orb: 2, weight: 3.5 },
  Uranus: { orb: 1.5, weight: 3.5 },
  Neptune: { orb: 1.5, weight: 3 },
  Pluto: { orb: 1.5, weight: 3.5 },
};

// Natal points that can be hit, and how much each matters to the person.
const NATAL_WEIGHT: Record<string, number> = {
  Sun: 3, Moon: 3, Ascendant: 3, MC: 2.5,
  Venus: 2.2, Mars: 2.2, Mercury: 2, Jupiter: 1.8, Saturn: 1.8,
};

/** Natal points whose position depends on knowing the birth time. */
const NEEDS_BIRTH_TIME = new Set(['Moon', 'Ascendant', 'MC']);

const NATAL_LABEL: Record<string, string> = { MC: 'Midheaven' };

const NATAL_AREA: Record<string, string> = {
  Sun: 'who you are and your energy',
  Moon: 'your feelings and sense of safety',
  Mercury: 'how you think and communicate',
  Venus: 'love, money and what you value',
  Mars: 'your drive, confidence and temper',
  Jupiter: 'your optimism and big plans',
  Saturn: 'your discipline and responsibilities',
  Ascendant: 'how people see you',
  MC: 'your career and public image',
};

// [do, avoid] for each transiting planet by the kind of aspect it makes.
const GUIDANCE: Record<string, Record<AspectNature, [string, string]>> = {
  Sun: {
    flow: ['Put yourself forward. Visibility works for you today.', "Don't hide your best idea to seem humble."],
    tension: ['Pick the one thing that matters and give it your full energy.', 'Avoid proving yourself to people who are not judging you.'],
    fusion: ['Start something you want to be known for.', 'Avoid making today about ego or being right.'],
  },
  Moon: {
    flow: ['Reach out to someone and say what you actually feel.', "Don't talk yourself out of a gut feeling."],
    tension: ['Give your mood a job: walk, write or cook first, then decide.', 'Avoid big decisions and the heated text.'],
    fusion: ['Trust what your body tells you before your head weighs in.', 'Avoid pretending you are fine.'],
  },
  Mercury: {
    flow: ['Send the message, pitch the idea, have the conversation.', "Don't over-edit. Clear beats clever."],
    tension: ['Re-read before you send and confirm the details.', 'Avoid arguing by text and signing anything unread.'],
    fusion: ['Write down the idea that keeps coming back.', 'Avoid saying the first thing that comes to mind.'],
  },
  Venus: {
    flow: ['Spend time with people you enjoy and accept a kind offer.', "Don't settle for less than you want in love or money."],
    tension: ['Check a purchase or promise twice before you commit.', 'Avoid people-pleasing and impulse spending.'],
    fusion: ['Say out loud what you truly want and make a plan for it.', 'Avoid mixing love and money decisions today.'],
  },
  Mars: {
    flow: ['Do the hard thing first. Your energy backs you.', "Don't waste the push on small irritations."],
    tension: ['Burn the energy off with exercise before any difficult talk.', 'Avoid fights, risky driving and replying while angry.'],
    fusion: ['Start the project you have been putting off.', 'Avoid rushing. Fast is not the same as right.'],
  },
  Jupiter: {
    flow: ['Say yes to the opportunity and think bigger.', "Don't sit on a good chance waiting for perfect."],
    tension: ['Set a limit before you say yes to more.', 'Avoid overpromising, overspending and overdoing it.'],
    fusion: ['Ask for the thing you want. The answer may be yes.', 'Avoid assuming it will work out without effort.'],
  },
  Saturn: {
    flow: ['Do the dull, important work. It pays off for years.', "Don't skip the boring basics."],
    tension: ['Face the responsibility you have been avoiding, in small steps.', 'Avoid blaming others and quitting from tiredness.'],
    fusion: ['Commit to one long-term goal and make it concrete.', "Avoid carrying everyone else's weight."],
  },
  Uranus: {
    flow: ['Try the new idea or route. A surprise helps you.', "Don't cling to a plan that stopped working."],
    tension: ['Expect interruptions and leave room in your schedule.', 'Avoid cutting ties or quitting on impulse.'],
    fusion: ['Notice what you are ready to change.', 'Avoid forcing change before you know what you want instead.'],
  },
  Neptune: {
    flow: ['Make time for art, music, rest or prayer.', "Don't ignore a quiet intuition."],
    tension: ['Double-check facts, money and promises today.', 'Avoid escapism and vague agreements.'],
    fusion: ['Let yourself dream, then write the dream down.', 'Avoid decisions based on how you wish things were.'],
  },
  Pluto: {
    flow: ['Face the truth you have been circling and use its power.', "Don't give your power away to keep the peace."],
    tension: ['Notice who or what is trying to control you and answer calmly.', 'Avoid power struggles and obsessing.'],
    fusion: ['Let go of what has already ended.', 'Avoid forcing outcomes or manipulating people.'],
  },
};

const QUIET: TodayAnswer = {
  headline: 'A quiet sky for your chart',
  area: 'No major planet is touching your chart today.',
  doText: 'Use the calm to finish what is half-done.',
  avoidText: 'Avoid inventing drama to fill the silence.',
  aspect: null,
};

function separation(a: number, b: number): number {
  const d = Math.abs(((a - b) % 360 + 360) % 360);
  return d > 180 ? 360 - d : d;
}

/** Every transit-to-natal aspect within orb, strongest first.
 *  With an unknown birth time the Moon and angles are left out, because a
 *  noon chart would put them in the wrong place. */
export function computeTodayAspects(
  transits: BodyPos[],
  natal: BodyPos[],
  birthTimeKnown: boolean,
): TodayAspect[] {
  const out: TodayAspect[] = [];
  for (const t of transits) {
    const tcfg = TRANSIT[t.name];
    if (!tcfg || !Number.isFinite(t.longitude)) continue;
    for (const n of natal) {
      const nw = NATAL_WEIGHT[n.name];
      if (!nw || !Number.isFinite(n.longitude)) continue;
      if (!birthTimeKnown && NEEDS_BIRTH_TIME.has(n.name)) continue;
      const sep = separation(t.longitude, n.longitude);
      for (const a of ASPECTS) {
        const orb = Math.abs(sep - a.angle);
        if (orb > tcfg.orb) continue;
        out.push({
          transit: t.name,
          natal: n.name,
          aspect: a.name,
          nature: a.nature,
          orb,
          score: tcfg.weight * nw * (1 - orb / tcfg.orb),
        });
      }
    }
  }
  return out.sort((x, y) => y.score - x.score);
}

export function buildTodayAnswer(aspects: TodayAspect[]): TodayAnswer {
  const top = aspects[0];
  if (!top) return QUIET;
  const verb = ASPECTS.find((a) => a.name === top.aspect)!.verb;
  const natalLabel = NATAL_LABEL[top.natal] || top.natal;
  const [doText, avoidText] = GUIDANCE[top.transit][top.nature];
  return {
    headline: `${top.transit} ${verb} your ${natalLabel}`,
    area: `This touches ${NATAL_AREA[top.natal]}.`,
    doText,
    avoidText,
    aspect: top,
  };
}
