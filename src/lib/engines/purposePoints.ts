/**
 * Purpose Points (web) — a deterministic list of 10 BOLD, SPECIFIC things an
 * Earth (earthly purpose) or North Node (soul purpose) placement points to.
 *
 * Shared by both purpose engines so the "10 things" list is concrete and
 * direct — never vague theme-dumps — even when the AI reading is unavailable.
 * Items are anchored to the reader's real houses/signs/rulers and DEDUPED so
 * the same theme never appears twice.
 */

// ── Stable identity ──────────────────────────────────────────────────────────

/** Where a point came from — also decides whether birth time can move it. */
export type PurposePointSource = 'house' | 'sign' | 'filler';

export interface PurposePoint {
  /**
   * Stable identity, safe to persist for months: derived from the chart fact
   * that produced the line, never from its text or its position in the list.
   * Format `${kind}:${source}:${anchor}` — e.g. "earthly:house:10". Rewriting
   * a point's copy, reordering the list, or adding fillers never changes it.
   */
  key: string;
  text: string;
  source: PurposePointSource;
  /** House number for 'house', sign name for 'sign', slug for 'filler'. */
  anchor: number | string;
  /**
   * True when a wrong birth time would move this point. Houses here are
   * Whole-Sign, resolved from the Ascendant SIGN, so a wrong rising sign
   * shifts every house point together; sign and filler points never move.
   */
  timeSensitive: boolean;
}

// What you're here to BUILD / DO (Earth), by house — bold and concrete.
const EARTHLY_HOUSE: Record<number, string> = {
  1: 'Put your own name and face on your work — lead as yourself, not hidden behind someone else’s brand or boss.',
  2: 'Build real, countable financial security — and stop letting anyone treat your worth as up for debate.',
  3: 'Make your living with your voice — writing, speaking, teaching, selling, or wiring together people who need each other.',
  4: 'Build the stable home and family you may never have been handed — you’re meant to be someone’s safe place.',
  5: 'Get your creative work in front of an audience — perform, make, or raise kids who carry your spark. Don’t die with it stuck in your head.',
  6: 'Master a real, useful craft — you’re the one who fixes what’s broken and makes the whole system actually run.',
  7: 'Build your life through one committed partnership — a marriage or alliance where the two of you outperform either alone.',
  8: 'Handle the money, secrets, and crises other people can’t — you’re built for the high-stakes work most avoid.',
  9: 'Get far from where you started — teach, publish, travel, or spread a belief to people who’ll never meet you.',
  10: 'Become publicly known for something you built — a career, company, or title that outlives you. Aim for the top, not the middle.',
  11: 'Build or lead a group — your legacy is the community, network, or movement you gather, not a solo act.',
  12: 'Do the quiet work that heals — art, spirituality, or service to people who can’t pay you back. Your power is behind the scenes.',
};

// What your soul is here to GROW INTO (North Node), by house — bold and concrete.
const SOUL_HOUSE: Record<number, string> = {
  1: 'Stop living for everyone else’s approval and become your own person — put yourself first without flinching.',
  2: 'Build your own security and self-worth from scratch instead of leaning on other people’s money or validation.',
  3: 'Get out of your own head and into real conversation — learn out loud, ask, connect; stop assuming you already know.',
  4: 'Let people in and build a real emotional home — you’re here to feel and belong, not just to achieve.',
  5: 'Take the risk of being seen — create, love out loud, and stop hiding your joy to look serious.',
  6: 'Trade chaos for craft — the daily habits, health, and skill you avoid are exactly what make your gifts land.',
  7: 'Learn to truly partner — grow through “we,” instead of proving you can do it all alone.',
  8: 'Surrender control and let yourself be transformed — merge deeply and face the shadow instead of keeping everyone at arm’s length.',
  9: 'Chase the bigger truth — leave the small, safe worldview behind and go find what your life actually means.',
  10: 'Step into real responsibility and be seen in public — stop hiding in the private and own an ambition out loud.',
  11: 'Move from personal drama to the bigger picture — find your people and build something that outlasts you.',
  12: 'Loosen the grip and turn inward — you’re here to trust, surrender, and grow through faith, art, and compassion.',
};

// Bold identity truths by sign — work for both readings.
const SIGN_POINT: Record<string, string> = {
  Aries: 'Start the thing and go first — you’re built to fight for it, not wait for permission.',
  Taurus: 'Play the long game — you outlast everyone chasing the quick win, so build something that stays.',
  Gemini: 'Use your mind and your mouth — you learn fast, talk sharp, and link ideas nobody else connects.',
  Cancer: 'Lead by making people feel safe — your care is your power, not your weakness.',
  Leo: 'Take center stage and stop apologizing for wanting to be seen — dimming yourself helps no one.',
  Virgo: 'Turn your eye for what’s wrong into paid, expert work — precision is your edge, not a flaw.',
  Libra: 'Be the one who makes the deal fair and the room work — you broker, design, and balance.',
  Scorpio: 'Go where it’s intense and hidden — you can handle power, crisis, and truth other people can’t.',
  Sagittarius: 'Refuse the small, boxed-in life — explore, teach, and aim bigger than is reasonable.',
  Capricorn: 'Build the empire brick by brick — you’re playing for legacy while everyone else plays for the weekend.',
  Aquarius: 'Break the rule everyone else obeys — you’re here to do it differently and drag the future forward.',
  Pisces: 'Turn what you feel into art, healing, or spirit — you sense what others miss, so use it, don’t drown in it.',
};

const FILLERS_EARTHLY: ReadonlyArray<{ slug: string; text: string }> = [
  { slug: 'one-lane', text: 'Pick ONE lane and go deep — your power is mastery, not keeping every option open.' },
  { slug: 'charge-worth', text: 'Charge what you’re actually worth — undercharging is the fastest way to bury this whole purpose.' },
  { slug: 'wound-to-work', text: 'Turn the exact thing you struggled with into the thing you help other people through.' },
  { slug: 'name-on-it', text: 'Build something with your name on it that keeps working when you’re not in the room.' },
];

const FILLERS_SOUL: ReadonlyArray<{ slug: string; text: string }> = [
  { slug: 'say-it-out-loud', text: 'Say the honest thing out loud, even when staying quiet would be easier.' },
  { slug: 'leave-the-comfortable', text: 'Walk away from the comfortable situation that’s quietly keeping you small.' },
  { slug: 'let-someone-help', text: 'Let someone help you — carrying it all alone is the old pattern, not the growth.' },
  { slug: 'follow-the-pull', text: 'Follow the pull that scares you a little; that’s the direction, not the detour.' },
];

/** The header shown above the list, per reading type. */
export function purposePointsHeader(kind: 'earthly' | 'soul'): string {
  return kind === 'soul' ? 'What your soul is here to grow toward:' : 'What this could point to:';
}

/**
 * Build up to 10 bold, specific, DEDUPED points from a placement. Houses (most
 * concrete) are interleaved with sign truths, then padded with type-appropriate
 * bold items. Each point carries a stable `key` so callers can persist state
 * against it across copy edits and reorderings.
 *
 * Deduping is by `key`, which is equivalent to the previous dedupe by text:
 * every house line and every sign line is distinct, and one key always maps to
 * exactly one string.
 */
export function buildPurposePoints(p: any, kind: 'earthly' | 'soul'): PurposePoint[] {
  const soul = kind === 'soul';
  const HOUSE = soul ? SOUL_HOUSE : EARTHLY_HOUSE;
  const rc = p?.rulerChain || {};

  const mk = (source: PurposePointSource, anchor: number | string, text: string): PurposePoint => ({
    key: `${kind}:${source}:${anchor}`,
    text,
    source,
    anchor,
    timeSensitive: source === 'house',
  });

  const houseNums = [
    p?.primaryHouse,
    p?.duad?.activatedHouse,
    p?.compendium?.activatedHouse,
    rc.mainRuler?.house,
    rc.duadRuler?.house,
    rc.compendiumRuler?.house,
  ];
  const signNames = [
    p?.position?.sign,
    rc.mainRuler?.position?.sign,
    rc.duadRuler?.position?.sign,
    rc.compendiumRuler?.position?.sign,
  ];

  const houseLines: PurposePoint[] = [];
  const usedHouses = new Set<number>();
  for (const n of houseNums) {
    if (n && HOUSE[n] && !usedHouses.has(n)) { usedHouses.add(n); houseLines.push(mk('house', n, HOUSE[n])); }
  }
  const signLines: PurposePoint[] = [];
  const usedSigns = new Set<string>();
  for (const sg of signNames) {
    if (sg && SIGN_POINT[sg] && !usedSigns.has(sg)) { usedSigns.add(sg); signLines.push(mk('sign', sg, SIGN_POINT[sg])); }
  }

  const seen = new Set<string>();
  const items: PurposePoint[] = [];
  const push = (v?: PurposePoint) => { if (v && !seen.has(v.key)) { seen.add(v.key); items.push(v); } };

  // Interleave houses (most concrete) with sign truths for variety.
  const maxLen = Math.max(houseLines.length, signLines.length);
  for (let i = 0; i < maxLen; i++) { push(houseLines[i]); push(signLines[i]); }

  for (const f of (soul ? FILLERS_SOUL : FILLERS_EARTHLY)) {
    if (items.length >= 10) break;
    push(mk('filler', f.slug, f.text));
  }

  return items.slice(0, 10);
}

// ── AI reconciliation ──────────────────────────────────────────────

/** The canonical points, numbered, ready to drop into an AI prompt. */
export function purposePointsPromptBlock(points: PurposePoint[]): string {
  return points.map((pt, i) => `${i + 1}. ${pt.text}`).join('\n');
}

/**
 * The list instruction appended to a purpose mandate. The AI must return OUR
 * points, in OUR order, in its own sharper voice — never invent its own list —
 * so item N of the response always carries point N's stable key.
 */
export function purposePointsListInstruction(kind: 'earthly' | 'soul', points: PurposePoint[]): string {
  const n = points.length;
  const noun = kind === 'soul'
    ? 'thing their soul is here to grow toward'
    : 'thing this Earth placement could point to in their real life';
  return [
    `THEN, after that purpose paragraph, on a new line add the EXACT header "${purposePointsHeader(kind)}" followed by EXACTLY ${n} numbered items (1. through ${n}.).`,
    `The ${n} items listed below are FIXED and come from their chart. Rewrite EACH one in your own bolder, sharper voice, keeping its meaning and its position. Do NOT add, drop, merge, reorder, or invent items — return exactly ${n}, one per line, no extra explanation.`,
    `Each stays ONE short, concrete, specific ${noun}. Be BOLD, DIRECT, and SPECIFIC — name the actual thing, never a vague category or abstract theme-dump.`,
    '',
    'THE ITEMS TO REWRITE, IN ORDER:',
    purposePointsPromptBlock(points),
  ].join('\n');
}

export interface ReconciledPurposePoints {
  /** Canonical keys, carrying the AI's wording when it complied. */
  points: PurposePoint[];
  /** The reading, with its list normalised to exactly `points`. */
  text: string;
  /** True when the AI returned a usable rewrite; false when we fell back. */
  rephrased: boolean;
}

const NUMBERED_ITEM = /^\s*\d{1,2}[.)]\s+(.+?)\s*$/;

/**
 * Reconcile a generated reading against the canonical keyed points.
 *
 * The AI writes the prose and may rephrase the list, but identity stays ours:
 * when its list matches the canonical count, item N adopts point N's key and
 * the AI wording is kept. Otherwise the list is replaced with the canonical
 * one — so the reader always sees exactly the points we can address months
 * later, and a non-compliant response degrades instead of breaking.
 */
export function reconcilePurposePoints(
  text: string,
  kind: 'earthly' | 'soul',
  canonical: PurposePoint[],
): ReconciledPurposePoints {
  const header = purposePointsHeader(kind);
  const idx = text.lastIndexOf(header);
  const prose = (idx >= 0 ? text.slice(0, idx) : text).trimEnd();
  const render = (pts: PurposePoint[]) =>
    [prose, '', header, ...pts.map((pt, i) => `${i + 1}. ${pt.text}`)].join('\n');

  if (idx < 0 || canonical.length === 0) {
    return { points: canonical, text: render(canonical), rephrased: false };
  }

  const items: string[] = [];
  for (const line of text.slice(idx + header.length).split('\n')) {
    const m = NUMBERED_ITEM.exec(line);
    if (m) items.push(m[1]);
  }
  if (items.length !== canonical.length) {
    return { points: canonical, text: render(canonical), rephrased: false };
  }

  const points = canonical.map((pt, i) => ({ ...pt, text: items[i] }));
  return { points, text: render(points), rephrased: true };
}
