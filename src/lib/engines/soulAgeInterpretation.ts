/**
 * SOUL AGE CALCULATOR — interpretation and transparency layer.
 *
 * Turns a SoulAgeResult into the written reading (§15), the eleven expandable
 * result sections (§14), the "How This Was Calculated" disclosure (§19) and the
 * privacy-safe share card (§18).
 *
 * RULES
 *  • Deterministic. Same result in, same words out — no AI call, no randomness.
 *  • Specific. Every claim names the actual placement that produced it: exact
 *    degree, sign, Whole-Sign house, duad, compendium, orb. Never "you are a
 *    deep soul" filler.
 *  • Second person, direct, and honest about what the number does and does not
 *    mean. Soul Age is accumulated experience — never worth, intelligence,
 *    kindness or rank.
 *  • No raw code, formulas as plain arithmetic the reader can follow.
 */

import {
  UNIVERSAL_CYCLE_CAPACITY,
  SOUL_AGE_BANDS,
  type SoulAgeResult,
  type SoulAgePoint,
} from './soulAgeEngine';

// ─────────────────────────────────────────────────────────────────────────────
// Fixed copy
// ─────────────────────────────────────────────────────────────────────────────

/** §1 — discreet footer disclaimer. Must never dominate the result page. */
export const SOUL_AGE_DISCLAIMER =
  'The Soul Age Calculator is an experimental metaphysical interpretation system. ' +
  'Its results are intended for spiritual reflection and are not scientifically verifiable measurements.';

/** §23 — required attribution, shown in the information section. */
export const SOUL_AGE_CREDIT = 'Soul Age Calculator methodology created by Astro for AlignCosmic.';

/** §12 — shown wherever the seven ages are listed. */
export const SOUL_AGE_EQUALITY_NOTE =
  'No Soul Age is better than another. Soul Age measures accumulated experience — not worth, ' +
  'intelligence, kindness, spiritual attainment or status. An Infant Soul and a Universal Soul ' +
  'are equally whole; they are simply at different points in a very long journey.';

// ─────────────────────────────────────────────────────────────────────────────
// Formatting helpers
// ─────────────────────────────────────────────────────────────────────────────

/** 2928138 → "2,928,138". Locale-independent so output stays deterministic. */
export function formatCount(n: number): string {
  return Math.max(0, Math.floor(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function ordinalHouse(house: number | null): string {
  if (house == null) return 'an undetermined house';
  const suffix = house % 10 === 1 && house !== 11 ? 'st'
    : house % 10 === 2 && house !== 12 ? 'nd'
    : house % 10 === 3 && house !== 13 ? 'rd' : 'th';
  return `${house}${suffix} house`;
}

/** "23°18′50″ Pisces" → the same, with the sign emphasised for prose use. */
function place(point: SoulAgePoint | undefined): string {
  return point ? point.positionLabel : '—';
}

function pct(n: number): string {
  return `${(Math.round(n * 100) / 100).toFixed(2)}%`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SoulAgeSection {
  /** Stable id for analytics and deep links. */
  id: string;
  title: string;
  /** Paragraphs of prose. */
  body: string[];
  /** Optional label/value rows rendered as a table beneath the prose. */
  rows?: { label: string; value: string }[];
}

export interface SoulAgeInterpretation {
  /** One direct sentence for the top of the result page. */
  headline: string;
  /** The §15 written reading, 4–6 paragraphs. */
  reading: string[];
  /** The §14 expandable sections, in order. */
  sections: SoulAgeSection[];
  disclaimer: string;
  credit: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// §15 — the written reading
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Describe the relationship between the universal and Earth totals — the single
 * most meaningful thing the calculator can tell someone.
 */
function earthRelationship(result: SoulAgeResult): { headline: string; body: string } {
  const { totalUniversalLifetimes: total, earthLifetimes: earth, earthPercentage: p } = result;
  const uName = result.universalSoulAge.name;
  const eName = result.earthSoulAge.name;

  if (total === 0) {
    return {
      headline: 'Your chart places you at the zero point — before measurable accumulated incarnation.',
      body:
        'Your Draconic Ascendant sits at the very start of the wheel and your chart carries no ' +
        'validated closure evidence. This is not an empty result: it is the reading for a soul at ' +
        'the beginning of measurable experience, where everything is still ahead rather than behind.',
    };
  }

  if (p >= 85) {
    return {
      headline: 'Almost everything your soul has ever done, it did here.',
      body:
        `${pct(p)} of your total incarnational experience was lived on Earth. You are not a visitor ` +
        'to this planet and you are not working out something you learned somewhere else. Earth is ' +
        'your home ground — the place your soul chose again and again, and the place where nearly ' +
        'all of your accumulated instinct actually applies. That is why physical life tends to ' +
        'feel legible to you even when it is painful.',
    };
  }

  if (p >= 55) {
    return {
      headline: 'The majority of your experience is Earth experience — but not all of it.',
      body:
        `${pct(p)} of your incarnations were lived on Earth, and ${formatCount(result.nonEarthLifetimes)} ` +
        'were not. You have enough terrestrial history for this world to feel familiar, and enough ' +
        'experience outside it that some part of you keeps measuring Earth against a standard it ' +
        'cannot quite source. Both are true at once, which is exactly why you can function here ' +
        'fluently and still feel periodically unconvinced by it.',
    };
  }

  if (p >= 20) {
    return {
      headline: 'You are considerably older than your Earth history suggests.',
      body:
        `Only ${pct(p)} of your incarnations happened on Earth — ${formatCount(result.nonEarthLifetimes)} ` +
        'of them did not. Your instincts were largely formed somewhere with different rules. That ' +
        'gap shows up as a persistent sense that you understand the principle of something long ' +
        'before you understand how it is done here, and as impatience with procedures that everyone ' +
        'around you accepts without question.',
    };
  }

  return {
    headline: 'You are universally ancient and comparatively new to human embodiment.',
    body:
      `You carry ${formatCount(result.totalUniversalLifetimes)} universal lifetimes but only ` +
      `${formatCount(earth)} of them were lived on Earth — ${pct(p)}. This is the specific signature ` +
      'of a soul with enormous accumulated experience and very little terrestrial practice. You ' +
      'likely grasp meaning quickly and mechanics slowly: the pattern is obvious to you, the ' +
      'logistics of a body, a family and a bureaucracy are not. That is not incompetence. It is ' +
      `the difference between being a ${uName} in general and a ${eName} here.`,
  };
}

function cycleEvidence(result: SoulAgeResult): string {
  const dAsc = result.draconic.Ascendant;
  const validated = result.validatedCompletedCycles;
  const candidate = result.candidateCompletedCycles;

  const seals = result.closure.categories
    .filter((c) => c.units > 0)
    .flatMap((c) => c.evidence.map((e) => e.label));

  if (validated === 0) {
    return (
      `Your Draconic Ascendant at ${place(dAsc)} makes ${candidate} completed cycles available, but ` +
      'your chart supplies no independent closure evidence to validate them. The calculator will ' +
      'not call you ancient on the strength of a late degree alone — position offers the ' +
      'possibility, and only completion structures confirm it.'
    );
  }

  const lead = seals.length > 0
    ? `The evidence is specific: ${seals.slice(0, 3).join('; ')}.`
    : '';

  return (
    `Your Draconic Ascendant at ${place(dAsc)} places you ${candidate === 11 ? 'near the end of' : 'inside'} ` +
    `a major universal cycle, offering ${candidate} completed cycles. Your chart validated ` +
    `${validated} of them through ${result.closure.rawClosureUnits} independent closure units. ${lead}`
  );
}

function draconicFactors(result: SoulAgeResult): string {
  const top = result.chronometers.slice(0, 3);
  if (top.length === 0) return '';

  const parts = top.map((c) => {
    const pctWeight = Math.round(c.weight * 100);
    return `${c.planet} at ${place(c.point)} (${pctWeight}% — ${c.roles.join(' and ').toLowerCase()})`;
  });

  return (
    `The chronometers carrying your present position are ${parts.join(', ')}. ` +
    (top[0].roles.length >= 2
      ? `${top[0].planet} is doing double duty in your chart — it holds more than one timing role at once, ` +
        'which concentrates its influence rather than spreading it.'
      : 'Each carries a distinct share of the reading, so no single placement dominates the result.')
  );
}

function earthMemory(result: SoulAgeResult): string {
  const earth = result.draconic.Earth;
  if (!earth) return '';

  const memory = result.earthAnchoring.categories.find((c) => c.id === 'C');
  const seals = result.earthAnchoring.categories.find((c) => c.id === 'E');

  const anchor =
    `Your Draconic Earth sits at ${place(earth)} in the ${ordinalHouse(earth.house)}, operating ` +
    `through a ${earth.duadSign} duad and a ${earth.compendiumSign} compendium.`;

  const strongest = memory && memory.detail.length > 0
    ? ` Its strongest terrestrial memory contacts are: ${memory.detail.slice(0, 2).join('; ')}.`
    : ' It forms no tight terrestrial memory contacts, which is itself the finding — your Earth' +
      ' history is not densely wired into the rest of your chart.';

  const sealed = seals && seals.score >= 80
    ? ' The Sun–Earth axis repeats against the same angles in both your natal and Draconic charts,' +
      ' which is the strongest available confirmation of an extensive incarnational record.'
    : '';

  return anchor + strongest + sealed;
}

/**
 * One well-formed sentence per band. The §12 `functions` lists are written as
 * third-person verb phrases ("Works with collective transformation"), so they
 * cannot be spliced into a second-person sentence without breaking grammar.
 */
const CURRENT_WORK: Record<string, string> = {
  'Infant Soul':
    'you are learning the mechanics of being here at all — a body, its limits, and the ' +
    'blunt relationship between what you do and what follows',
  'Baby Soul':
    'you are building structure: rules that hold, people who stay, and a moral floor solid ' +
    'enough to stand on when things get ambiguous',
  'Young Soul':
    'you are testing what your own will can actually move — building, competing, achieving, ' +
    'and finding out where your independence really ends',
  'Mature Soul':
    'you are turning from what you can achieve to what you can feel, and learning to hold ' +
    'two contradictory truths without collapsing either one',
  'Old Soul':
    'you are closing loops — recognising the patterns you keep repeating, dropping what you ' +
    'only ever carried for status, and teaching from what you actually lived',
  'Transcendental Soul':
    'your work has stopped being mainly about your own development. It now lands on the ' +
    'systems, families and communities around you, and outlives whatever you personally get from it',
  'Universal Soul':
    'you are here on purpose rather than by compulsion, working on principles and structures ' +
    'far larger than one biography — while still living an ordinary human life with ordinary limits',
};

function currentWork(result: SoulAgeResult): string {
  const band = result.universalSoulAge;
  const earth = result.draconic.Earth;
  const house = earth?.house ?? null;

  const HOUSE_WORK: Record<number, string> = {
    1: 'establishing a self that can be seen without being distorted',
    2: 'building something material that actually holds',
    3: 'translating what you know into language other people can use',
    4: 'repairing the foundation — family, lineage, the place you came from',
    5: 'making something and letting it carry your signature',
    6: 'daily, unglamorous service and the discipline of doing it well',
    7: 'the specific work of one-to-one relationship',
    8: 'transformation through what you share, owe, and cannot control',
    9: 'meaning — finding it, testing it, and refusing the cheap version',
    10: 'material service, responsibility, work and public contribution',
    11: 'the collective — networks, movements, and the future you will not see finished',
    12: 'the hidden work: solitude, dissolution, and what is done without witness',
  };

  const focus = house ? HOUSE_WORK[house] : null;

  const work = CURRENT_WORK[band.name] ?? '';

  return (
    `As ${/^[AEIOU]/.test(band.label) ? 'an' : 'a'} ${band.label}, ${work}.` +
    (focus
      ? ` Your Draconic Earth in the ${ordinalHouse(house)} points that work squarely at ${focus}.`
      : '')
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// §14 — the eleven expandable sections
// ─────────────────────────────────────────────────────────────────────────────

function chronometerRows(result: SoulAgeResult): { label: string; value: string }[] {
  return result.chronometers.map((c) => ({
    label: `${c.planet} — ${Math.round(c.weight * 100)}%`,
    value:
      `${place(c.point)} · ${ordinalHouse(c.point.house)} · ${c.point.duadSign} duad · ` +
      `${c.point.compendiumSign} compendium`,
  }));
}

function keyPointRows(result: SoulAgeResult): { label: string; value: string }[] {
  const named: [string, SoulAgePoint | undefined][] = [
    ['Draconic Ascendant', result.draconic.Ascendant],
    ['Draconic Earth', result.draconic.Earth],
    ['Draconic Sun', result.draconic.Sun],
    ['Draconic Saturn', result.draconic.Saturn],
    ['Draconic Moon', result.draconic.Moon],
    ['Draconic Pluto', result.draconic.Pluto],
    ['Natal South Node', result.natal['South Node']],
    ['Natal IC', result.natal.IC],
  ];
  return named
    .filter((entry): entry is [string, SoulAgePoint] => Boolean(entry[1]))
    .map(([label, p]) => ({
      label,
      value: `${p.positionLabel} · ${ordinalHouse(p.house)} · ${p.duadSign} duad · ${p.compendiumSign} compendium`,
    }));
}

function buildSections(result: SoulAgeResult): SoulAgeSection[] {
  const u = result.universalSoulAge;
  const e = result.earthSoulAge;
  const dAsc = result.draconic.Ascendant;
  const dEarth = result.draconic.Earth;

  const duadRepeats = result.closure.categories.find((c) => c.id === 'E');
  const compRepeats = result.closure.categories.find((c) => c.id === 'F');

  return [
    {
      id: 'universal-soul-age',
      title: 'Your Universal Soul Age',
      body: [
        `${u.label} — ${formatCount(result.totalUniversalLifetimes)} total universal lifetimes.`,
        u.meaning,
        u.stageProgress != null
          ? `You are ${pct(u.stageProgress * 100)} of the way through this stage, which runs from ` +
            `${formatCount(u.lowerBoundary)} to ${formatCount(u.upperBoundary ?? 0)} lifetimes.`
          : `Universal Soul has no fixed upper boundary. You are in Octave ${u.universalOctave}.`,
      ],
      rows: u.functions.map((f, i) => ({ label: `Function ${i + 1}`, value: f })),
    },
    {
      id: 'earth-soul-age',
      title: 'Your Earth Soul Age',
      body: [
        `${e.label} — ${formatCount(result.earthLifetimes)} previous Earth lifetimes ` +
          `(${pct(result.earthPercentage)} of your total).`,
        e.meaning,
        u.label === e.label
          ? 'Your Universal and Earth Soul Ages are identical, right down to the stage. Effectively ' +
            'all of your soul’s development happened here — Earth is not one chapter of your ' +
            'history, it is the book.'
          : u.name === e.name
            ? `You sit in the same band on both counts — ${u.name} — but earlier within it on Earth ` +
              `(${e.stage?.toLowerCase()}) than universally (${u.stage?.toLowerCase()}). A large share ` +
              'of your development did happen here; you are simply not as far through the terrestrial ' +
              'version of it as the universal one.'
            : `Your Earth Soul Age sits below your Universal Soul Age. Universally you are ${u.name}; ` +
              `in terms of human embodiment specifically, you are ${e.name}. Expect to understand ` +
              'things faster than you can execute them here.',
      ],
    },
    {
      id: 'universal-lifetime-calculation',
      title: 'Universal Lifetime Calculation',
      body: [
        `One complete Universal Incarnation Cycle holds ${formatCount(UNIVERSAL_CYCLE_CAPACITY)} ` +
          'incarnation positions — twelve signs × twelve houses × twelve duads × twelve compendiums ' +
          '× twelve planetary carriers.',
        cycleEvidence(result),
      ],
      rows: [
        { label: 'Draconic Ascendant', value: place(dAsc) },
        { label: 'Candidate completed cycles', value: String(result.candidateCompletedCycles) },
        { label: 'Closure units', value: `${result.closure.rawClosureUnits} raw · ${result.closure.baseClosureUnits} counted of 12` },
        { label: 'Closure ratio', value: result.closure.closureRatio.toFixed(4) },
        { label: 'Additional universal octaves', value: String(result.closure.additionalOctaves) },
        { label: 'Validated completed cycles', value: String(result.validatedCompletedCycles) },
        { label: 'Ascendant position in sign', value: result.ascendantPosition.toFixed(6) },
        { label: 'Supporting chronometer position', value: result.supportingPosition.toFixed(6) },
        { label: 'Current-cycle position', value: `${result.currentCyclePosition.toFixed(6)} (80% Ascendant, 20% supporting)` },
        { label: 'Universal Maturity Coefficient', value: `${result.universalMaturityCoefficient.toFixed(6)} (closure ratio to the 5th power)` },
        { label: 'Current-cycle lifetimes', value: formatCount(result.currentCycleLifetimes) },
        { label: 'Total universal lifetimes', value: formatCount(result.totalUniversalLifetimes) },
      ],
    },
    {
      id: 'earth-lifetime-calculation',
      title: 'Earth Lifetime Calculation',
      body: [
        'Your Earth total is your universal total narrowed by how strongly your Draconic Earth is ' +
          'anchored to this planet. The anchoring score is raised to the fifth power — one power for ' +
          'each of the five terrestrial categories — which is why a soul can hold millions of ' +
          'universal lifetimes and still be nearly new to Earth.',
        `Your Earth Anchoring Score is ${result.earthAnchoring.displayScore} out of 100, giving an ` +
          `Earth fraction of ${result.earthFraction.toFixed(6)}.`,
      ],
      rows: [
        ...result.earthAnchoring.categories.map((c) => ({
          label: `${c.title} (${Math.round(c.weight * 100)}%)`,
          value: c.score.toFixed(2),
        })),
        { label: 'Earth Anchoring Score', value: `${result.earthAnchoring.displayScore} / 100` },
        { label: 'Earth fraction (score ÷ 100, to the 5th power)', value: result.earthFraction.toFixed(8) },
        { label: 'Position inside current compendium', value: `${result.earthCompendiumFraction.toFixed(6)} of 750″` },
        { label: 'Earth Precision Modifier', value: result.earthPrecisionModifier.toFixed(6) },
        { label: 'Previous Earth lifetimes', value: formatCount(result.earthLifetimes) },
        { label: 'Previous non-Earth lifetimes', value: formatCount(result.nonEarthLifetimes) },
      ],
    },
    {
      id: 'draconic-ascendant',
      title: 'Draconic Ascendant Analysis',
      body: [
        dAsc
          ? `Your Draconic Ascendant is ${place(dAsc)}, in a ${dAsc.duadSign} duad and a ` +
            `${dAsc.compendiumSign} compendium. This is the baseline of your total universal ` +
            'incarnational experience — it carries 80% of your position inside the present cycle.'
          : 'No Draconic Ascendant could be determined.',
        `The sign number of your Draconic Ascendant sets how many completed cycles are available to ` +
          `you: ${result.candidateCompletedCycles}. Those remain possibilities until closure ` +
          'evidence validates them.',
      ],
      rows: chronometerRows(result),
    },
    {
      id: 'draconic-earth',
      title: 'Draconic Earth Analysis',
      body: [earthMemory(result)],
      rows: dEarth
        ? [
            { label: 'Position', value: place(dEarth) },
            { label: 'Whole Sign house', value: ordinalHouse(dEarth.house) },
            { label: 'Duad', value: dEarth.duadSign },
            { label: 'Compendium', value: dEarth.compendiumSign },
            { label: 'Arc-seconds into compendium', value: `${dEarth.arcSecWithinCompendium}″ of 750″` },
          ]
        : [],
    },
    {
      id: 'closure-seals',
      title: 'Universal Closure Seals',
      body: [
        'Closure seals are the independent completion structures in your chart. They decide how ' +
          'many of the cycles your Draconic Ascendant offers are actually validated. The same ' +
          'contact is never counted twice under two different labels.',
        `You carry ${result.closure.rawClosureUnits} closure units. Twelve are required for a full ` +
          'closure ratio; every further complete group of twelve activates an additional Universal Octave.',
      ],
      rows: result.closure.categories.map((c) => ({
        label: `${c.id}. ${c.title} — ${c.units}/${c.cap}`,
        value: c.evidence.length > 0 ? c.evidence.map((ev) => ev.label).join(' · ') : 'No qualifying structures',
      })),
    },
    {
      id: 'duad-compendium-repetitions',
      title: 'Duad and Compendium Repetitions',
      body: [
        'When several of your core chronometers land in the same duad or the same compendium, the ' +
          'same theme is being repeated by independent parts of the chart. Repetition is evidence — ' +
          'it is much harder to produce by chance than a single contact.',
        (duadRepeats?.evidence.length ?? 0) + (compRepeats?.evidence.length ?? 0) > 0
          ? 'Your chart shows the repetitions listed below.'
          : 'Your chronometers are spread across different duads and compendiums, so no repetition ' +
            'seal fired. That is a neutral finding, not a deficiency.',
      ],
      rows: [
        ...(duadRepeats?.evidence ?? []).map((ev) => ({ label: 'Duad repetition', value: ev.label })),
        ...(compRepeats?.evidence ?? []).map((ev) => ({ label: 'Compendium repetition', value: ev.label })),
      ],
    },
    {
      id: 'natal-draconic',
      title: 'Natal–Draconic Connections',
      body: [
        'Your Draconic chart is your natal chart rotated so the True North Node sits at exactly ' +
          '0°00′00″ Aries. Where a rotated placement lands hard on a natal one, the soul-level ' +
          'pattern and the lived pattern are pointing at the same thing.',
        draconicFactors(result),
      ],
      rows: keyPointRows(result),
    },
    {
      id: 'seven-soul-ages',
      title: 'Understanding the Seven Soul Ages',
      body: [SOUL_AGE_EQUALITY_NOTE],
      rows: SOUL_AGE_BANDS.map((b) => ({
        label: b.name,
        value:
          `${formatCount(b.lower)}–${b.upper == null ? 'and beyond' : formatCount(b.upper)} lifetimes — ` +
          b.meaning.split('. ')[0] + '.',
      })),
    },
    {
      id: 'methodology',
      title: 'Calculation Methodology',
      body: [
        'Tropical zodiac, geocentric positions, Whole Sign houses, True North Node, exact degrees, ' +
          'minutes and seconds. Signs are ruled by Mars, Venus, Mercury, Moon, Sun, Vesta, Juno, ' +
          'Pluto, Jupiter, Saturn, Uranus and Neptune in zodiacal order.',
        'Every position is carried internally as a whole number of arc-seconds, so a placement ' +
          'sitting exactly on a duad or compendium boundary is classified without floating-point ' +
          'ambiguity. A placement exactly on a boundary belongs to the subdivision beginning there.',
        'The two lifetime totals are truncated rather than rounded, so a result never overstates ' +
          'the completed experience it can evidence.',
        SOUL_AGE_CREDIT,
      ],
      rows: [
        { label: 'Method version', value: result.methodVersion },
        { label: 'Universal cycle capacity', value: `${formatCount(UNIVERSAL_CYCLE_CAPACITY)} (12 to the 5th power)` },
        { label: 'Zodiac / houses', value: 'Tropical · Geocentric · Whole Sign' },
        { label: 'Duad', value: '2°30′00″ — twelve per sign' },
        { label: 'Compendium', value: '0°12′30″ (750 arc-seconds) — twelve per duad' },
      ],
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export function generateSoulAgeInterpretation(result: SoulAgeResult): SoulAgeInterpretation {
  const relationship = earthRelationship(result);

  const reading = [
    relationship.body,
    cycleEvidence(result),
    earthMemory(result),
    draconicFactors(result),
    currentWork(result),
  ].filter((p) => p && p.trim().length > 0);

  return {
    headline: relationship.headline,
    reading,
    sections: buildSections(result),
    disclaimer: SOUL_AGE_DISCLAIMER,
    credit: SOUL_AGE_CREDIT,
  };
}

/**
 * §18 — the ONLY fields permitted on a shared result card.
 *
 * Deliberately excludes birth date, birth time, birthplace, coordinates and
 * every chart placement. A share image must never leak birth data.
 */
export interface SoulAgeShareCard {
  displayLabel: string;
  universalSoulAge: string;
  universalLifetimes: string;
  earthSoulAge: string;
  earthLifetimes: string;
  brand: string;
  title: string;
}

export function buildShareCard(result: SoulAgeResult, displayLabel: string): SoulAgeShareCard {
  return {
    displayLabel: (displayLabel || 'Anonymous').trim().slice(0, 40),
    universalSoulAge: result.universalSoulAge.label,
    universalLifetimes: formatCount(result.totalUniversalLifetimes),
    earthSoulAge: result.earthSoulAge.label,
    earthLifetimes: formatCount(result.earthLifetimes),
    brand: 'AlignCosmic',
    title: 'Soul Age Calculator',
  };
}
