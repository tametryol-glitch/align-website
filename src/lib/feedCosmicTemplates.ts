/**
 * Feed — "Share Your Cosmic Experience" template engine
 *
 * The quick-post chips in the feed used to emit a fixed sentence
 * ("Just got my aura reading! My outer aura is glowing"). They now build a
 * post out of the signed-in user's ACTUAL chart: their natal placements,
 * the transits currently hitting those placements, tonight's Moon measured
 * against their natal Moon, an aura scored from that chart + sky, and a
 * tarot pull selected BY the chart rather than shuffled at random.
 *
 * Nothing here re-implements astrology math. Every number comes from the
 * existing natal / transit endpoints, and every interpretive line is quoted
 * from the interpretation engines already shipping in the app:
 *   - interpretations/placementInterp   (aspect + pair insights)
 *   - transitData                       (cycle titles + cycle meanings)
 *   - moonPhases/natalMoonPhase(+Content)
 *   - auraColorEngine + auraInterpretationEngine
 *   - tarotDeck
 *
 * Voice: the post belongs to the user, so the frame is first person, with
 * the engine's reading quoted inside it — the way a person actually shares
 * a reading. If birth data is missing the caller falls back to the old
 * static i18n string.
 */

import { api, buildBirthData } from '@/lib/api';
import type { UserProfile } from '@/stores/authStore';
import {
  ASPECT_MEANINGS,
  PLANET_PAIR_INSIGHTS,
  getPlacementInterpretation,
} from '@/lib/interpretations/placementInterp';
import {
  getTransitCycleTitle,
  getTransitCycleMeaning,
} from '@/lib/transitData';
import { calculateNatalMoonPhase } from '@/lib/moonPhases/natalMoonPhase';
import { buildNatalPhaseReading } from '@/lib/moonPhases/natalMoonPhaseContent';
import {
  calculateAuraScores,
  getAuraTriad,
  getChakraFocus,
  calculateScanConfidence,
} from '@/lib/auraColorEngine';
import { generateTemplateReading } from '@/lib/auraInterpretationEngine';
import {
  getAuraAstroContext,
  getAuraNumerologyContext,
} from '@/lib/auraAstroContextService';
import { getTarotCardByName, type DrawnCard } from '@/lib/tarotDeck';
import type { AuraInput } from '@/types/aura';

// ═══════════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════════

export type ShareTemplateId = 'aura' | 'transit' | 'moon' | 'zodiac' | 'tarot';

export interface ShareTemplateOutput {
  id: ShareTemplateId;
  /** Post body, ready to drop into the composer */
  content: string;
  /** True when the text was built from the user's real chart data */
  personalized: boolean;
}

/** Cheap pre-check so the UI can decide whether to even try. */
export function canPersonalize(profile: UserProfile | null | undefined): boolean {
  return !!(profile?.birth_date && profile?.latitude != null && profile?.longitude != null);
}

/**
 * Build a chart-connected post for one chip.
 * Never throws — on any failure it returns `fallback` with personalized:false.
 */
export async function buildShareTemplatePost(
  id: ShareTemplateId,
  profile: UserProfile | null | undefined,
  fallback: string,
): Promise<ShareTemplateOutput> {
  if (!canPersonalize(profile)) {
    return { id, content: fallback, personalized: false };
  }

  try {
    const bundle = await loadFeedChartBundle(profile as UserProfile);
    if (!bundle || bundle.natalPlanets.length === 0) {
      return { id, content: fallback, personalized: false };
    }

    let content = '';
    switch (id) {
      case 'zodiac':  content = buildZodiacPost(bundle); break;
      case 'transit': content = buildTransitPost(bundle); break;
      case 'moon':    content = buildMoonPost(bundle); break;
      case 'aura':    content = buildAuraPost(bundle); break;
      case 'tarot':   content = buildTarotPost(bundle); break;
    }

    if (!content.trim()) return { id, content: fallback, personalized: false };
    return { id, content: content.trim(), personalized: true };
  } catch (err) {
    console.warn('[feedCosmicTemplates] falling back to static template:', err);
    return { id, content: fallback, personalized: false };
  }
}

/** Zodiac glyph for a sign name — used for the Zodiac chip icon. */
export function signGlyph(sign: string | null | undefined): string | null {
  if (!sign) return null;
  return SIGN_EMOJI[sign] || null;
}

/** Drop the memoised bundle (e.g. after the user edits their birth data). */
export function clearFeedChartCache() {
  cache = null;
}

// ═══════════════════════════════════════════════════════════════════
// Chart bundle — one fetch per user per day, shared by all five chips
// ═══════════════════════════════════════════════════════════════════

export interface ChartPoint {
  name: string;
  sign: string;
  /** degrees within the sign, 0–29.99 */
  deg: number;
  /** absolute ecliptic longitude, 0–359.99 */
  lon: number;
  house: number | null;
  retro: boolean;
}

interface HitAspect {
  transiting: string;
  natal: string;
  type: string;
  orb: number;
  /** exact date, ISO — only present when it came from the events endpoint */
  date?: string;
  retro: boolean;
  transitSign: string;
  natalSign: string;
  /** natal house the transiting body is currently moving through */
  transitHouse: number | null;
  /** house of the natal point being hit */
  natalHouse: number | null;
}

interface FeedChartBundle {
  profile: UserProfile;
  natalPlanets: ChartPoint[];
  natalAspects: Array<{ planet1: string; planet2: string; type: string; orb: number }>;
  cusps: number[];
  risingSign: string | null;
  /** raw natal payload, normalised for the moon-phase engine */
  natalForEngines: any;
  transitPlanets: ChartPoint[];
  moonPhaseName: string | null;
  moonIllumination: number | null;
  /** strongest transit currently touching the natal chart */
  topHit: HitAspect | null;
  firstName: string;
}

let cache: { key: string; promise: Promise<FeedChartBundle | null> } | null = null;

async function loadFeedChartBundle(profile: UserProfile): Promise<FeedChartBundle | null> {
  // Keyed on the birth data itself, so editing birth details invalidates the
  // bundle immediately rather than at midnight.
  const key = [
    profile.id,
    profile.birth_date,
    profile.birth_time,
    profile.latitude,
    profile.longitude,
    profile.timezone,
    todayISO(),
  ].join('|');
  if (cache && cache.key === key) return cache.promise;

  const promise = fetchBundle(profile).catch((err) => {
    console.warn('[feedCosmicTemplates] bundle load failed:', err);
    cache = null;
    return null;
  });
  cache = { key, promise };
  return promise;
}

async function fetchBundle(profile: UserProfile): Promise<FeedChartBundle | null> {
  const birthData = buildBirthData(profile);

  const start = new Date();
  start.setDate(start.getDate() - 10);
  const end = new Date();
  end.setDate(end.getDate() + 45);

  const [natal, transits, events] = await Promise.all([
    api.getNatalChart(birthData),
    api.getCurrentTransits(birthData).catch(() => null),
    api
      .getTransitEvents({
        birth_data: birthData,
        start_date: isoDate(start),
        end_date: isoDate(end),
      })
      .catch(() => null),
  ]);

  if (!natal) return null;

  const natalPlanets = normalizePoints(natal.planets || natal.positions || []);
  if (natalPlanets.length === 0) return null;

  const cusps = extractCusps(natal);
  const risingSign = extractRisingSign(natal, profile, cusps);

  const natalAspects: Array<{ planet1: string; planet2: string; type: string; orb: number }> =
    (natal.aspects || []).map((a: any) => ({
      planet1: a.planet1 || a.body1 || '',
      planet2: a.planet2 || a.body2 || '',
      type: String(a.aspect || a.type || '').toLowerCase(),
      orb: typeof a.orb === 'number' ? Math.abs(a.orb) : 99,
    }));

  const transitPlanets = normalizePoints(
    transits?.transit_positions || transits?.transits || transits?.positions || [],
  );

  // Give every transiting body the natal house it is currently walking through.
  for (const t of transitPlanets) {
    t.house = houseOfLon(t.lon, cusps, risingSign);
  }

  const phase = transits?.moon_phase;
  let moonPhaseName: string | null = phase?.phase_name || phase?.name || null;
  let moonIllumination: number | null =
    typeof phase?.illumination === 'number' ? phase.illumination : null;

  if (!moonPhaseName) {
    const tSun = findPoint(transitPlanets, 'Sun');
    const tMoon = findPoint(transitPlanets, 'Moon');
    if (tSun && tMoon) {
      const elong = norm360(tMoon.lon - tSun.lon);
      moonPhaseName = phaseNameFromElongation(elong);
      moonIllumination = Math.round(((1 - Math.cos((elong * Math.PI) / 180)) / 2) * 100);
    }
  }

  const topHit = pickTopHit(
    events?.events || [],
    transitPlanets,
    natalPlanets,
    cusps,
    risingSign,
  );

  const bundle: FeedChartBundle = {
    profile,
    natalPlanets,
    natalAspects,
    cusps,
    risingSign,
    natalForEngines: {
      planets: natalPlanets.map((p) => ({
        name: p.name,
        longitude: p.lon,
        sign: p.sign,
        degree: p.deg,
        house: p.house ?? 0,
        retrograde: p.retro,
      })),
      aspects: natalAspects.map((a) => ({ ...a, lon1: 0, lon2: 0 })),
      // Kept in the API's own shape so getAuraAstroContext can read house signs.
      houses: natal.houses || [],
      ascendant: risingSign ? { sign: risingSign } : natal.ascendant ?? 0,
      midheaven: natal.midheaven ?? 0,
    },
    transitPlanets,
    moonPhaseName,
    moonIllumination,
    topHit,
    firstName: (profile.display_name || '').trim().split(/\s+/)[0] || '',
  };

  return bundle;
}

// ═══════════════════════════════════════════════════════════════════
// Template 1 — Zodiac (natal placements)
// ═══════════════════════════════════════════════════════════════════

function buildZodiacPost(b: FeedChartBundle): string {
  const sun = findPoint(b.natalPlanets, 'Sun');
  const moon = findPoint(b.natalPlanets, 'Moon');
  if (!sun && !moon) return '';

  const lines: string[] = [];
  const glyph = sun ? SIGN_EMOJI[sun.sign] || '✨' : '✨';
  lines.push(`${glyph} My actual placements, straight off my chart:`);
  lines.push('');

  if (sun) lines.push(`☉ Sun — ${sun.sign}${housePart(sun.house)}`);
  if (moon) lines.push(`☽ Moon — ${moon.sign}${housePart(moon.house)}`);
  if (b.risingSign) lines.push(`↑ Rising — ${b.risingSign}`);

  const mercury = findPoint(b.natalPlanets, 'Mercury');
  const venus = findPoint(b.natalPlanets, 'Venus');
  const mars = findPoint(b.natalPlanets, 'Mars');
  if (venus) lines.push(`♀ Venus — ${venus.sign}${housePart(venus.house)}`);
  if (mars) lines.push(`♂ Mars — ${mars.sign}${housePart(mars.house)}${mars.retro ? ' ℞' : ''}`);
  if (!venus && !mars && mercury) {
    lines.push(`☿ Mercury — ${mercury.sign}${housePart(mercury.house)}`);
  }

  // Element / modality balance — computed from the real placements.
  const balance = elementBalance(b.natalPlanets);
  if (balance) {
    lines.push('');
    lines.push(balance);
  }

  // The tightest core aspect, plus what the interpretation engine says about it.
  const tight = tightestCoreAspect(b.natalAspects);
  if (tight) {
    lines.push('');
    lines.push(
      `Tightest aspect in the chart: ${tight.planet1} ${tight.type} ${tight.planet2} (${fmtOrb(tight.orb)} orb).`,
    );
    const quote = aspectQuote(tight.planet1, tight.planet2, tight.type);
    if (quote) {
      lines.push('');
      lines.push(`My reading on it: "${quote}"`);
    }
  } else if (sun && sun.house) {
    // No aspect data — quote the placement reading instead.
    const interp = firstSentences(getPlacementInterpretation(sun.name, sun.sign, sun.house, sun.deg), 2);
    if (interp) {
      lines.push('');
      lines.push(`My reading on that Sun: "${interp}"`);
    }
  }

  lines.push('');
  lines.push(
    moon?.house
      ? `Any other ${b.risingSign || sun?.sign || ''} risings with a ${ordinal(moon.house)}-house Moon? How do you handle it?`.replace(
          /\s+/g,
          ' ',
        )
      : `Any other ${sun?.sign || b.risingSign || ''} placements out here? Drop yours.`.replace(/\s+/g, ' '),
  );
  lines.push('');
  lines.push(
    hashtags([sun?.sign, b.risingSign ? `${b.risingSign}Rising` : null, 'NatalChart']),
  );

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════
// Template 2 — Transit (what is hitting the chart right now)
// ═══════════════════════════════════════════════════════════════════

function buildTransitPost(b: FeedChartBundle): string {
  const hit = b.topHit;
  if (!hit) return buildSkyOnlyTransitPost(b);

  const lines: string[] = [];
  lines.push('🪐 What is actually hitting my chart right now:');
  lines.push('');
  lines.push(
    `${PLANET_GLYPH[hit.transiting] || ''} Transiting ${hit.transiting}${hit.retro ? ' ℞' : ''} ${hit.type} my natal ${hit.natal}${
      hit.natalHouse ? ` (${ordinal(hit.natalHouse)} house)` : ''
    } — ${fmtOrb(hit.orb)} orb${hit.date ? `, exact ${prettyDate(hit.date)}` : ''}.`.replace(/\s+/g, ' '),
  );

  if (hit.transitSign) {
    lines.push(
      `${hit.transiting} is in ${hit.transitSign}${
        hit.transitHouse ? `, moving through my ${ordinal(hit.transitHouse)} house` : ''
      }.`,
    );
  }

  const title = getTransitCycleTitle(hit.transiting, hit.natal, hit.type);
  if (title) {
    lines.push('');
    lines.push(`My reading calls it: "${title}"`);
  }

  const meaning = firstSentences(
    getTransitCycleMeaning(hit.transiting, hit.natal, hit.type, 'you'),
    2,
  );
  if (meaning) {
    lines.push('');
    lines.push(`"${meaning}"`);
  }

  lines.push('');
  lines.push(
    `Anyone else in a ${hit.transiting}–${hit.natal} ${hit.type} right now? Tell me it is not just me.`,
  );
  lines.push('');
  lines.push(hashtags([hit.transiting, 'Transits', 'Astrology']));

  return lines.join('\n');
}

/** No transit-to-natal hit resolved — still post the real sky against the real chart. */
function buildSkyOnlyTransitPost(b: FeedChartBundle): string {
  const notable = b.transitPlanets.filter((p) =>
    ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].includes(p.name),
  );
  if (notable.length === 0) return '';

  const lines: string[] = ['🪐 Transit check against my own chart:', ''];
  for (const p of notable.slice(0, 5)) {
    lines.push(
      `${PLANET_GLYPH[p.name] || ''} ${p.name}${p.retro ? ' ℞' : ''} in ${p.sign}${
        p.house ? ` — my ${ordinal(p.house)} house` : ''
      }`.replace(/\s+/g, ' '),
    );
  }
  const rx = notable.filter((p) => p.retro).map((p) => p.name);
  lines.push('');
  lines.push(
    rx.length > 0
      ? `${rx.join(' and ')} retrograde while all of that sits in my houses. Explains the week.`
      : 'That is a lot of movement through my houses at once.',
  );
  lines.push('');
  lines.push('Where are these landing for you?');
  lines.push('');
  lines.push(hashtags(['Transits', 'Astrology', 'CosmicWeather']));
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════
// Template 3 — Moon check-in (tonight's Moon vs the natal Moon)
// ═══════════════════════════════════════════════════════════════════

function buildMoonPost(b: FeedChartBundle): string {
  const tMoon = findPoint(b.transitPlanets, 'Moon');
  const nMoon = findPoint(b.natalPlanets, 'Moon');
  if (!tMoon && !nMoon) return '';

  const lines: string[] = [];
  const phaseEmoji = tMoon ? PHASE_EMOJI[b.moonPhaseName || ''] || '🌙' : '🌙';

  if (tMoon) {
    const illum =
      b.moonIllumination != null ? `, ${Math.round(b.moonIllumination)}% lit` : '';
    lines.push(
      `${phaseEmoji} Moon check-in — ${b.moonPhaseName || 'Moon'} in ${tMoon.sign}${illum}.`,
    );
    if (tMoon.house) {
      lines.push('');
      lines.push(`Right now it is walking through my ${ordinal(tMoon.house)} house.`);
    }
  } else {
    lines.push('🌙 Moon check-in, measured against my own chart.');
  }

  // Aspect from tonight's Moon to a natal point.
  if (tMoon) {
    const contact = tightestContact(tMoon, b.natalPlanets, ['Moon', 'Sun', 'Venus', 'Mars', 'Saturn']);
    if (contact) {
      lines.push(
        `It is ${contact.type} my natal ${contact.natal} in ${contact.natalSign}${
          contact.natalHouse ? ` (${ordinal(contact.natalHouse)} house)` : ''
        } — ${fmtOrb(contact.orb)} orb.`.replace(/\s+/g, ' '),
      );
    }
  }

  // Natal moon phase — who they are lunar-wise, from the shipped engine.
  const natalPhase = calculateNatalMoonPhase(b.natalForEngines);
  if (natalPhase) {
    const reading = buildNatalPhaseReading(natalPhase);
    lines.push('');
    const phaseLabel = /moon$/i.test(natalPhase.name) ? natalPhase.name : `${natalPhase.name} Moon`;
    lines.push(
      `I was born under a ${phaseLabel} ${natalPhase.emoji} — "${reading.headline}".`,
    );
    const rhythm = firstSentences(reading.emotionalRhythm, 2);
    if (rhythm) {
      lines.push('');
      lines.push(`"${rhythm}"`);
    }
  } else if (nMoon) {
    lines.push('');
    lines.push(
      `My natal Moon is ${nMoon.sign}${housePart(nMoon.house)}, so this one lands somewhere specific.`,
    );
  }

  lines.push('');
  lines.push('Where is tonight’s Moon sitting in your chart?');
  lines.push('');
  lines.push(
    hashtags([
      (b.moonPhaseName || 'Moon').replace(/\s+/g, ''),
      tMoon?.sign || null,
      'MoonCheckIn',
    ]),
  );

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════
// Template 4 — Aura (scored from the chart + today's sky)
// ═══════════════════════════════════════════════════════════════════

function buildAuraPost(b: FeedChartBundle): string {
  const astroCtx = getAuraAstroContext(b.natalForEngines);
  const numCtx = getAuraNumerologyContext();
  const hasNum = !!numCtx.lifePathNumber;

  const input: AuraInput = {
    mode: 'deep',
    astroContext: astroCtx,
    numerologyContext: hasNum ? numCtx : undefined,
    dataSources: {
      picture_used: false,
      video_used: false,
      voice_used: false,
      mood_used: false,
      life_area_used: false,
      astrology_used: true,
      numerology_used: hasNum,
      journal_history_used: false,
    },
  };

  const scores = calculateAuraScores(input);
  if (!scores || scores.length === 0) return '';

  const triad = getAuraTriad(scores);
  const chakra = getChakraFocus(triad.outerAura, triad.innerAura, triad.emotionalCore);
  const confidence = calculateScanConfidence(input);
  const reading = generateTemplateReading(
    input,
    triad.outerAura,
    triad.innerAura,
    triad.emotionalCore,
    chakra,
    confidence,
  );

  const lines: string[] = [];
  lines.push('🔮 Aura read — pulled from my natal chart and today’s transits, not a vibe check:');
  lines.push('');
  lines.push(`Outer aura — ${triad.outerAura.label}`);
  lines.push(`Inner aura — ${triad.innerAura.label}`);
  lines.push(`Emotional core — ${triad.emotionalCore.label}`);
  lines.push(`Chakra focus — ${chakra.label}, currently ${chakra.status}`);

  if (reading.dominantTransit) {
    lines.push(`Strongest influence right now — ${reading.dominantTransit}`);
  }
  if (astroCtx.currentMoonSign) {
    lines.push(`Moon today — ${astroCtx.currentMoonSign}`);
  }

  const message = firstSentences(reading.spiritualMessage, 2);
  if (message) {
    lines.push('');
    lines.push(`"${message}"`);
  }

  const action = firstSentences(reading.practicalAction, 1);
  if (action) {
    lines.push('');
    lines.push(`What it says to do about it: "${action}"`);
  }

  lines.push('');
  lines.push('What is your aura running today?');
  lines.push('');
  lines.push(
    hashtags([
      'AuraReading',
      chakra.label.replace(/\s+/g, ''),
      `${triad.outerAura.label.replace(/\s+/g, '')}Aura`,
    ]),
  );

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════
// Template 5 — Tarot (the chart picks the cards, not a shuffle)
// ═══════════════════════════════════════════════════════════════════

/** Golden Dawn planetary attributions for the Major Arcana. */
const PLANET_CARD: Record<string, string> = {
  Sun: 'The Sun',
  Moon: 'The High Priestess',
  Mercury: 'The Magician',
  Venus: 'The Empress',
  Mars: 'The Tower',
  Jupiter: 'Wheel of Fortune',
  Saturn: 'The World',
  Uranus: 'The Fool',
  Neptune: 'The Hanged Man',
  Pluto: 'Judgement',
  Chiron: 'The Hermit',
  'North Node': 'Judgement',
  'South Node': 'The Moon',
};

/** Zodiacal attributions for the Major Arcana. */
const SIGN_CARD: Record<string, string> = {
  Aries: 'The Emperor',
  Taurus: 'The Hierophant',
  Gemini: 'The Lovers',
  Cancer: 'The Chariot',
  Leo: 'Strength',
  Virgo: 'The Hermit',
  Libra: 'Justice',
  Scorpio: 'Death',
  Sagittarius: 'Temperance',
  Capricorn: 'The Devil',
  Aquarius: 'The Star',
  Pisces: 'The Moon',
};

const HARD_ASPECTS = ['square', 'opposition', 'quincunx'];

function buildTarotPost(b: FeedChartBundle): string {
  const hit = b.topHit;
  const sun = findPoint(b.natalPlanets, 'Sun');

  // Card 1 — the planet currently pressing hardest on the chart.
  // Card 2 — the natal point it is pressing on (its sign).
  // Reversed when the transit is retrograde or the contact is a hard aspect.
  let card1: DrawnCard | null = null;
  let card2: DrawnCard | null = null;
  let why1 = '';
  let why2 = '';

  if (hit) {
    const reversed1 = hit.retro;
    card1 = getTarotCardByName(PLANET_CARD[hit.transiting] || '', reversed1);
    why1 = `${hit.transiting} is the planet leaning on my chart hardest right now — ${hit.type} my natal ${hit.natal}, ${fmtOrb(hit.orb)} orb${hit.retro ? ', and it is retrograde' : ''}.`;

    const natalSign = hit.natalSign || findPoint(b.natalPlanets, hit.natal)?.sign || '';
    const reversed2 = HARD_ASPECTS.includes(hit.type.toLowerCase());
    card2 = getTarotCardByName(SIGN_CARD[natalSign] || '', reversed2);
    why2 = `My natal ${hit.natal} sits in ${natalSign}${
      hit.natalHouse ? `, ${ordinal(hit.natalHouse)} house` : ''
    }.`;
  } else if (sun) {
    const moon = findPoint(b.natalPlanets, 'Moon');
    card1 = getTarotCardByName(SIGN_CARD[sun.sign] || '', false);
    why1 = `My Sun is ${sun.sign}${housePart(sun.house)}.`;
    if (moon) {
      card2 = getTarotCardByName(SIGN_CARD[moon.sign] || '', false);
      why2 = `My Moon is ${moon.sign}${housePart(moon.house)}.`;
    }
  }

  if (!card1) return '';

  const lines: string[] = [];
  lines.push('🃏 I stopped shuffling. I let my chart pick the cards.');
  lines.push('');
  lines.push(`${why1}`);
  lines.push(`→ ${cardLabel(card1)} — ${card1.keywords.join(', ')}`);

  if (card2) {
    lines.push('');
    lines.push(`${why2}`);
    lines.push(`→ ${cardLabel(card2)} — ${card2.keywords.join(', ')}`);
  }

  if (card1.imagery) {
    lines.push('');
    lines.push(`"${card1.imagery}"`);
  }

  if (hit) {
    const title = getTransitCycleTitle(hit.transiting, hit.natal, hit.type);
    if (title) {
      lines.push('');
      lines.push(`The transit sitting underneath the pull: "${title}".`);
    }
  }

  lines.push('');
  lines.push('What did your chart pull for you?');
  lines.push('');
  lines.push(hashtags(['Tarot', hit?.transiting || sun?.sign || null, 'Astrology']));

  return lines.join('\n');
}

function cardLabel(card: DrawnCard): string {
  return card.reversed ? `${card.name} (reversed)` : card.name;
}

// ═══════════════════════════════════════════════════════════════════
// Chart helpers
// ═══════════════════════════════════════════════════════════════════

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const SIGN_EMOJI: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const PLANET_GLYPH: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  Chiron: '⚷',
};

const PHASE_EMOJI: Record<string, string> = {
  'New Moon': '🌑',
  'Waxing Crescent': '🌒',
  'First Quarter': '🌓',
  'Waxing Gibbous': '🌔',
  'Full Moon': '🌕',
  'Waning Gibbous': '🌖',
  'Disseminating Moon': '🌖',
  'Last Quarter': '🌗',
  'Third Quarter': '🌗',
  'Waning Crescent': '🌘',
  'Balsamic Moon': '🌘',
};

const ELEMENT_OF: Record<string, 'fire' | 'earth' | 'air' | 'water'> = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water',
};

const MODALITY_OF: Record<string, 'cardinal' | 'fixed' | 'mutable'> = {
  Aries: 'cardinal', Cancer: 'cardinal', Libra: 'cardinal', Capricorn: 'cardinal',
  Taurus: 'fixed', Leo: 'fixed', Scorpio: 'fixed', Aquarius: 'fixed',
  Gemini: 'mutable', Virgo: 'mutable', Sagittarius: 'mutable', Pisces: 'mutable',
};

/** Planets that count toward the element/modality tally. */
const CORE_BODIES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

/** How much a transiting body's contact matters — slower means louder. */
const TRANSIT_WEIGHT: Record<string, number> = {
  Pluto: 10, Neptune: 9, Uranus: 8, Saturn: 7.5, Jupiter: 6,
  Chiron: 5.5, Sun: 4.5, Mars: 4, Venus: 3, Mercury: 3, Moon: 1,
};

const ASPECT_ANGLES: Array<{ type: string; angle: number; orb: number }> = [
  { type: 'conjunction', angle: 0, orb: 6 },
  { type: 'opposition', angle: 180, orb: 6 },
  { type: 'trine', angle: 120, orb: 5 },
  { type: 'square', angle: 90, orb: 5 },
  { type: 'sextile', angle: 60, orb: 4 },
];

function normalizePoints(raw: any[]): ChartPoint[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((p: any) => {
      const name = p?.name || p?.planet || '';
      if (!name) return null;
      const lon =
        typeof p.longitude === 'number'
          ? norm360(p.longitude)
          : typeof p.lon === 'number'
          ? norm360(p.lon)
          : null;
      const sign = p.sign || (lon != null ? SIGNS[Math.floor(lon / 30)] : '');
      const deg =
        typeof p.sign_degree === 'number'
          ? p.sign_degree
          : typeof p.degree === 'number'
          ? p.degree
          : lon != null
          ? lon % 30
          : 0;
      return {
        name,
        sign,
        deg,
        lon: lon ?? 0,
        house: typeof p.house === 'number' && p.house > 0 ? p.house : null,
        retro: !!(p.is_retrograde ?? p.retrograde),
      } as ChartPoint;
    })
    .filter(Boolean) as ChartPoint[];
}

function findPoint(list: ChartPoint[], name: string): ChartPoint | null {
  return list.find((p) => p.name.toLowerCase() === name.toLowerCase()) || null;
}

function extractCusps(natal: any): number[] {
  const raw = natal?.house_cusps;
  if (Array.isArray(raw) && raw.length >= 12 && raw.every((n: any) => typeof n === 'number')) {
    return raw.slice(0, 12).map(norm360);
  }
  const houses = natal?.houses;
  if (Array.isArray(houses) && houses.length >= 12) {
    const out: number[] = [];
    for (let i = 1; i <= 12; i++) {
      const h = houses.find((x: any) => (x.house ?? x.number) === i) || houses[i - 1];
      const lon = h?.longitude ?? h?.cusp;
      if (typeof lon !== 'number') return [];
      out.push(norm360(lon));
    }
    return out;
  }
  return [];
}

function extractRisingSign(natal: any, profile: UserProfile, cusps: number[]): string | null {
  const asc = natal?.ascendant;
  if (typeof asc === 'number') return SIGNS[Math.floor(norm360(asc) / 30)];
  if (asc && typeof asc === 'object') {
    if (asc.sign) return asc.sign;
    if (typeof asc.longitude === 'number') return SIGNS[Math.floor(norm360(asc.longitude) / 30)];
  }
  if (cusps.length >= 1) return SIGNS[Math.floor(cusps[0] / 30)];
  const houses = natal?.houses;
  if (Array.isArray(houses) && houses.length > 0) {
    const first = houses.find((h: any) => (h.house ?? h.number) === 1) || houses[0];
    if (first?.sign) return first.sign;
  }
  return profile.rising_sign || null;
}

/** Which natal house a longitude falls in. Falls back to whole-sign off the Ascendant. */
function houseOfLon(lon: number, cusps: number[], risingSign: string | null): number | null {
  const L = norm360(lon);
  if (cusps.length >= 12) {
    for (let i = 0; i < 12; i++) {
      const start = cusps[i];
      const end = cusps[(i + 1) % 12];
      const span = norm360(end - start);
      const offset = norm360(L - start);
      if (offset < span) return i + 1;
    }
    return null;
  }
  if (risingSign) {
    const ascIdx = SIGNS.indexOf(risingSign);
    if (ascIdx >= 0) {
      const signIdx = Math.floor(L / 30);
      return ((signIdx - ascIdx + 12) % 12) + 1;
    }
  }
  return null;
}

/**
 * Pick the transit that matters most today. Prefers the exact-hit events
 * endpoint (real ephemeris passes); falls back to comparing the live sky
 * against the natal positions when events are unavailable.
 */
function pickTopHit(
  events: any[],
  transitPlanets: ChartPoint[],
  natalPlanets: ChartPoint[],
  cusps: number[],
  risingSign: string | null,
): HitAspect | null {
  const now = Date.now();

  if (Array.isArray(events) && events.length > 0) {
    let best: { score: number; hit: HitAspect } | null = null;
    for (const e of events) {
      const transiting = e.transiting_planet || '';
      const natal = e.natal_planet || '';
      const type = String(e.aspect_type || e.aspect_name || '').toLowerCase();
      if (!transiting || !natal || !type) continue;

      const daysAway = Math.abs((new Date(e.date).getTime() - now) / 86400000);
      if (!isFinite(daysAway)) continue;

      const score = (TRANSIT_WEIGHT[transiting] ?? 2) - daysAway * 0.18;
      if (best && score <= best.score) continue;

      const tPoint = findPoint(transitPlanets, transiting);
      const nPoint = findPoint(natalPlanets, natal);
      best = {
        score,
        hit: {
          transiting,
          natal,
          type,
          orb: typeof e.orb === 'number' ? Math.abs(e.orb) : 0,
          date: e.date,
          retro: !!(e.is_retrograde ?? tPoint?.retro),
          transitSign: e.transit_sign || tPoint?.sign || '',
          natalSign: e.natal_sign || nPoint?.sign || '',
          transitHouse: tPoint?.house ?? null,
          natalHouse: nPoint?.house ?? null,
        },
      };
    }
    if (best) return best.hit;
  }

  // Fallback — live sky vs natal positions.
  let fallback: { score: number; hit: HitAspect } | null = null;
  for (const t of transitPlanets) {
    if (t.name === 'Moon') continue; // too fast to headline a post
    const weight = TRANSIT_WEIGHT[t.name];
    if (!weight) continue;
    for (const n of natalPlanets) {
      const found = aspectBetween(t.lon, n.lon);
      if (!found) continue;
      const score = weight - found.orb * 0.6;
      if (fallback && score <= fallback.score) continue;
      fallback = {
        score,
        hit: {
          transiting: t.name,
          natal: n.name,
          type: found.type,
          orb: found.orb,
          retro: t.retro,
          transitSign: t.sign,
          natalSign: n.sign,
          transitHouse: t.house ?? houseOfLon(t.lon, cusps, risingSign),
          natalHouse: n.house ?? houseOfLon(n.lon, cusps, risingSign),
        },
      };
    }
  }
  return fallback ? fallback.hit : null;
}

/** Tightest aspect from one moving point to a shortlist of natal bodies. */
function tightestContact(
  moving: ChartPoint,
  natalPlanets: ChartPoint[],
  preferred: string[],
): { natal: string; natalSign: string; natalHouse: number | null; type: string; orb: number } | null {
  let best: { natal: string; natalSign: string; natalHouse: number | null; type: string; orb: number } | null = null;
  for (const n of natalPlanets) {
    if (!preferred.includes(n.name)) continue;
    const found = aspectBetween(moving.lon, n.lon);
    if (!found) continue;
    if (best && found.orb >= best.orb) continue;
    best = {
      natal: n.name,
      natalSign: n.sign,
      natalHouse: n.house,
      type: found.type,
      orb: found.orb,
    };
  }
  return best;
}

function aspectBetween(lonA: number, lonB: number): { type: string; orb: number } | null {
  const diff = norm360(lonA - lonB);
  const sep = Math.min(diff, 360 - diff);
  for (const a of ASPECT_ANGLES) {
    const orb = Math.abs(sep - a.angle);
    if (orb <= a.orb) return { type: a.type, orb };
  }
  return null;
}

/** Tightest aspect between two personal/social planets, hard aspects favoured. */
function tightestCoreAspect(
  aspects: Array<{ planet1: string; planet2: string; type: string; orb: number }>,
): { planet1: string; planet2: string; type: string; orb: number } | null {
  let best: { planet1: string; planet2: string; type: string; orb: number } | null = null;
  let bestScore = Infinity;
  for (const a of aspects) {
    if (!CORE_BODIES.includes(a.planet1) || !CORE_BODIES.includes(a.planet2)) continue;
    if (!a.type) continue;
    // Hard aspects say more about a person, so give them a small head start.
    const score = a.orb - (HARD_ASPECTS.includes(a.type) ? 1.2 : 0);
    if (score < bestScore) {
      bestScore = score;
      best = a;
    }
  }
  return best;
}

/**
 * Quote the app's own interpretation of a natal aspect — pair-specific text
 * when we have it, the aspect archetype otherwise.
 */
function aspectQuote(planet1: string, planet2: string, type: string): string {
  const key = [planet1, planet2].sort().join('/');
  const pair = PLANET_PAIR_INSIGHTS[key]?.[type];
  if (pair) return firstSentences(pair, 2);
  const generic = ASPECT_MEANINGS[type]?.description;
  return generic ? firstSentences(generic, 2) : '';
}

function elementBalance(planets: ChartPoint[]): string {
  const elems: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const mods: Record<string, number> = { cardinal: 0, fixed: 0, mutable: 0 };
  let counted = 0;
  for (const p of planets) {
    if (!CORE_BODIES.includes(p.name)) continue;
    const e = ELEMENT_OF[p.sign];
    const m = MODALITY_OF[p.sign];
    if (!e || !m) continue;
    elems[e]++;
    mods[m]++;
    counted++;
  }
  if (counted < 4) return '';

  const topElem = Object.entries(elems).sort((a, b) => b[1] - a[1])[0];
  const missing = Object.entries(elems).filter(([, v]) => v === 0).map(([k]) => k);
  const topMod = Object.entries(mods).sort((a, b) => b[1] - a[1])[0];

  const parts: string[] = [];
  parts.push(`${topElem[1]} of my ${counted} core placements are ${topElem[0]}, and the chart runs ${topMod[0]}.`);
  if (missing.length === 1) {
    parts.push(`Zero ${missing[0]}. Which I have been told is noticeable.`);
  }
  return parts.join(' ');
}

// ═══════════════════════════════════════════════════════════════════
// Formatting helpers
// ═══════════════════════════════════════════════════════════════════

function norm360(x: number): number {
  return ((x % 360) + 360) % 360;
}

function todayISO(): string {
  return isoDate(new Date());
}

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function prettyDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

function housePart(house: number | null): string {
  return house ? `, ${ordinal(house)} house` : '';
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** "0°48'" — orbs read better in degrees and minutes on a chart post. */
function fmtOrb(orb: number): string {
  const safe = Math.abs(orb);
  const deg = Math.floor(safe);
  const min = Math.round((safe - deg) * 60);
  if (min === 60) return `${deg + 1}°00'`;
  return `${deg}°${String(min).padStart(2, '0')}'`;
}

/** First N sentences of an interpretation block — posts need a pull-quote, not an essay. */
function firstSentences(text: string | undefined | null, count: number): string {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const matches = clean.match(/[^.!?]+[.!?]+/g);
  if (!matches || matches.length === 0) return clean.slice(0, 220).trim();
  return matches
    .slice(0, count)
    .map((m) => m.trim())
    .join(' ')
    .trim();
}

function hashtags(parts: Array<string | null | undefined>): string {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const p of parts) {
    if (!p) continue;
    const tag = `#${p.replace(/[^A-Za-z0-9]/g, '')}`;
    if (tag.length <= 1) continue;
    const lower = tag.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    tags.push(tag);
  }
  return tags.join(' ');
}

function phaseNameFromElongation(elong: number): string {
  const e = norm360(elong);
  if (e < 22.5 || e >= 337.5) return 'New Moon';
  if (e < 67.5) return 'Waxing Crescent';
  if (e < 112.5) return 'First Quarter';
  if (e < 157.5) return 'Waxing Gibbous';
  if (e < 202.5) return 'Full Moon';
  if (e < 247.5) return 'Waning Gibbous';
  if (e < 292.5) return 'Last Quarter';
  return 'Waning Crescent';
}

/** Exposed for unit tests — not part of the public surface. */
export const __internals = {
  buildZodiacPost,
  buildTransitPost,
  buildMoonPost,
  buildAuraPost,
  buildTarotPost,
  normalizePoints,
  extractCusps,
  extractRisingSign,
  houseOfLon,
  pickTopHit,
  tightestCoreAspect,
  elementBalance,
  fmtOrb,
  firstSentences,
  hashtags,
};
