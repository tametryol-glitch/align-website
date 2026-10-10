/**
 * Cosmic events (server copy) — real astronomical events: moon phases,
 * retrogrades, eclipses, ingresses. Mirrors align-app/src/services/
 * cosmicEventsService.ts so the posts read the same. Used by
 * /api/cron/cosmic-events to publish ONE post per event from the official
 * Cosmic Weather account (phones no longer post these themselves).
 */

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

export interface CosmicEvent {
  id: string;
  type: 'new_moon' | 'full_moon' | 'first_quarter' | 'last_quarter' |
        'retrograde_start' | 'retrograde_end' |
        'solar_eclipse' | 'lunar_eclipse' |
        'ingress' | 'solstice' | 'equinox';
  title: string;
  description: string;
  emoji: string;
  sign?: string;
  planet?: string;
  date: string; // ISO date
  personalNote?: string;
}

// ═══════════════════════════════════════════════════════════════════
// Astronomical Constants
// ═══════════════════════════════════════════════════════════════════

const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const SIGN_EMOJIS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const PLANET_EMOJIS: Record<string, string> = {
  Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄',
  Uranus: '⛢', Neptune: '♆', Pluto: '♇',
};

// AstroEinstein custom rulers
const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Vesta', Libra: 'Juno', Scorpio: 'Pluto',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
};

function getLongitudeSign(longitude: number): string {
  const idx = Math.floor(((longitude % 360) + 360) % 360 / 30);
  return SIGN_NAMES[idx];
}

function getDegreeInSign(longitude: number): number {
  return ((longitude % 360) + 360) % 360 % 30;
}

// ═══════════════════════════════════════════════════════════════════
// Moon Phase Calculator (simplified but accurate)
// ═══════════════════════════════════════════════════════════════════

interface MoonPhaseResult {
  phase: string;
  emoji: string;
  elongation: number;
  moonSign: string;
  sunSign: string;
  isExact: boolean;
}

/**
 * Calculate approximate Sun and Moon ecliptic longitudes
 * using simplified astronomical formulas.
 */
function getSunLongitude(date: Date): number {
  const jd = getJulianDate(date);
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360;
  const M = (357.52911 + T * (35999.05029 - T * 0.0001537)) % 360;
  const Mrad = M * Math.PI / 180;
  const C = (1.914602 - T * (0.004817 + T * 0.000014)) * Math.sin(Mrad)
           + (0.019993 - T * 0.000101) * Math.sin(2 * Mrad)
           + 0.000289 * Math.sin(3 * Mrad);
  return ((L0 + C) % 360 + 360) % 360;
}

function getMoonLongitude(date: Date): number {
  const jd = getJulianDate(date);
  const T = (jd - 2451545.0) / 36525.0;
  const L = (218.3165 + 481267.8813 * T) % 360;
  const M = (134.9634 + 477198.8676 * T) % 360;
  const F = (93.2721 + 483202.0175 * T) % 360;
  const D = (297.8502 + 445267.1115 * T) % 360;
  const Mrad = M * Math.PI / 180;
  const Frad = F * Math.PI / 180;
  const Drad = D * Math.PI / 180;
  const lon = L
    + 6.289 * Math.sin(Mrad)
    + 1.274 * Math.sin(2 * Drad - Mrad)
    + 0.658 * Math.sin(2 * Drad)
    + 0.214 * Math.sin(2 * Mrad)
    - 0.186 * Math.sin((357.5291 + 35999.0503 * T) * Math.PI / 180)
    - 0.114 * Math.sin(2 * Frad);
  return ((lon % 360) + 360) % 360;
}

function getJulianDate(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60) / 24;
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
}

function getCurrentMoonPhase(date: Date = new Date()): MoonPhaseResult {
  const sunLon = getSunLongitude(date);
  const moonLon = getMoonLongitude(date);
  const elongation = ((moonLon - sunLon) % 360 + 360) % 360;

  let phase: string;
  let emoji: string;
  let isExact = false;

  // Check if we're near an exact phase (within 6 degrees)
  if (elongation < 6 || elongation > 354) {
    phase = 'New Moon';
    emoji = '🌑';
    isExact = elongation < 3 || elongation > 357;
  } else if (elongation > 84 && elongation < 96) {
    phase = 'First Quarter';
    emoji = '🌓';
    isExact = Math.abs(elongation - 90) < 3;
  } else if (elongation > 174 && elongation < 186) {
    phase = 'Full Moon';
    emoji = '🌕';
    isExact = Math.abs(elongation - 180) < 3;
  } else if (elongation > 264 && elongation < 276) {
    phase = 'Last Quarter';
    emoji = '🌗';
    isExact = Math.abs(elongation - 270) < 3;
  } else if (elongation < 90) {
    phase = 'Waxing Crescent';
    emoji = '🌒';
  } else if (elongation < 180) {
    phase = 'Waxing Gibbous';
    emoji = '🌔';
  } else if (elongation < 270) {
    phase = 'Waning Gibbous';
    emoji = '🌖';
  } else {
    phase = 'Waning Crescent';
    emoji = '🌘';
  }

  return {
    phase,
    emoji,
    elongation,
    moonSign: getLongitudeSign(moonLon),
    sunSign: getLongitudeSign(sunLon),
    isExact,
  };
}

// ═══════════════════════════════════════════════════════════════════
// Retrograde Data (2025-2026 — key planetary retrogrades)
// ═══════════════════════════════════════════════════════════════════

interface RetrogradeWindow {
  planet: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  startSign: string;
  endSign: string;
}

// Major retrogrades for 2025-2026
const RETROGRADE_WINDOWS: RetrogradeWindow[] = [
  // Mercury retrogrades 2025
  { planet: 'Mercury', startDate: '2025-03-15', endDate: '2025-04-07', startSign: 'Aries', endSign: 'Pisces' },
  { planet: 'Mercury', startDate: '2025-07-18', endDate: '2025-08-11', startSign: 'Leo', endSign: 'Leo' },
  { planet: 'Mercury', startDate: '2025-11-09', endDate: '2025-11-29', startSign: 'Sagittarius', endSign: 'Scorpio' },
  // Mercury retrogrades 2026
  { planet: 'Mercury', startDate: '2026-02-26', endDate: '2026-03-20', startSign: 'Pisces', endSign: 'Aquarius' },
  { planet: 'Mercury', startDate: '2026-06-29', endDate: '2026-07-23', startSign: 'Cancer', endSign: 'Cancer' },
  { planet: 'Mercury', startDate: '2026-10-24', endDate: '2026-11-13', startSign: 'Scorpio', endSign: 'Libra' },
  // Venus retrogrades
  { planet: 'Venus', startDate: '2025-03-02', endDate: '2025-04-13', startSign: 'Aries', endSign: 'Pisces' },
  // Mars retrogrades
  { planet: 'Mars', startDate: '2025-01-06', endDate: '2025-02-24', startSign: 'Leo', endSign: 'Cancer' },
  { planet: 'Mars', startDate: '2027-01-10', endDate: '2027-04-01', startSign: 'Virgo', endSign: 'Leo' },
  // Jupiter retrogrades
  { planet: 'Jupiter', startDate: '2025-11-11', endDate: '2026-03-11', startSign: 'Cancer', endSign: 'Gemini' },
  // Saturn retrogrades
  { planet: 'Saturn', startDate: '2025-07-13', endDate: '2025-11-28', startSign: 'Aries', endSign: 'Pisces' },
  // Uranus
  { planet: 'Uranus', startDate: '2025-09-06', endDate: '2026-02-04', startSign: 'Gemini', endSign: 'Taurus' },
  // Neptune
  { planet: 'Neptune', startDate: '2025-07-04', endDate: '2025-12-10', startSign: 'Aries', endSign: 'Pisces' },
  // Pluto
  { planet: 'Pluto', startDate: '2025-05-04', endDate: '2025-10-13', startSign: 'Aquarius', endSign: 'Aquarius' },
];

// ═══════════════════════════════════════════════════════════════════
// Eclipse Data (2025-2026)
// ═══════════════════════════════════════════════════════════════════

interface EclipseData {
  date: string;
  type: 'solar_eclipse' | 'lunar_eclipse';
  subtype: string; // total, partial, annular, penumbral
  sign: string;
  degree: number;
}

const ECLIPSES: EclipseData[] = [
  { date: '2025-03-29', type: 'solar_eclipse', subtype: 'partial', sign: 'Aries', degree: 9 },
  { date: '2025-03-14', type: 'lunar_eclipse', subtype: 'total', sign: 'Virgo', degree: 24 },
  { date: '2025-09-07', type: 'lunar_eclipse', subtype: 'total', sign: 'Pisces', degree: 15 },
  { date: '2025-09-21', type: 'solar_eclipse', subtype: 'partial', sign: 'Virgo', degree: 29 },
  { date: '2026-02-17', type: 'solar_eclipse', subtype: 'annular', sign: 'Aquarius', degree: 29 },
  { date: '2026-03-03', type: 'lunar_eclipse', subtype: 'total', sign: 'Virgo', degree: 12 },
  { date: '2026-08-12', type: 'solar_eclipse', subtype: 'total', sign: 'Leo', degree: 19 },
  { date: '2026-08-28', type: 'lunar_eclipse', subtype: 'partial', sign: 'Pisces', degree: 5 },
];

// ═══════════════════════════════════════════════════════════════════
// Ingress Data (Major planet sign changes)
// ═══════════════════════════════════════════════════════════════════

interface IngressData {
  date: string;
  planet: string;
  sign: string;
  significance: string;
}

const INGRESSES: IngressData[] = [
  { date: '2025-05-25', planet: 'Jupiter', sign: 'Cancer', significance: 'Jupiter enters its exaltation sign — a year of emotional growth, family blessings, and spiritual expansion.' },
  { date: '2025-07-07', planet: 'Uranus', sign: 'Gemini', significance: 'Uranus enters Gemini for the first time since 1949 — revolutionary changes in communication, technology, and how we think.' },
  { date: '2025-03-30', planet: 'Neptune', sign: 'Aries', significance: 'Neptune enters Aries for the first time since 1862 — a new cycle of spiritual pioneering and collective awakening.' },
  { date: '2026-02-14', planet: 'Saturn', sign: 'Aries', significance: 'Saturn enters Aries — a new 29-year cycle of building discipline, taking leadership, and redefining personal authority.' },
];

// ═══════════════════════════════════════════════════════════════════
// Event Descriptions
// ═══════════════════════════════════════════════════════════════════

function getMoonPhaseDescription(phase: string, moonSign: string, sunSign: string): string {
  const ruler = SIGN_RULERS[moonSign] || 'Unknown';
  const signEmoji = SIGN_EMOJIS[moonSign] || '';

  switch (phase) {
    case 'New Moon':
      return `The New Moon in ${moonSign} ${signEmoji} marks a powerful moment for fresh beginnings. This lunar reset activates the area of life ruled by ${moonSign} (ruled by ${ruler}). Set intentions, plant seeds, and start something new. The energy is quiet but potent — like a blank page waiting for your story.\n\nThis New Moon invites you to align your desires with ${moonSign} themes: what does this sign ask you to initiate?`;
    case 'Full Moon':
      return `The Full Moon in ${moonSign} ${signEmoji} illuminates what has been building beneath the surface. With the Sun in ${sunSign} opposing the Moon, there is a tension between your inner emotional world (${moonSign}) and your conscious direction (${sunSign}). Expect revelations, completions, and emotional clarity.\n\nThis Full Moon is ruled by ${ruler} — pay attention to the themes this planet governs in your own chart.`;
    case 'First Quarter':
      return `The First Quarter Moon in ${moonSign} ${signEmoji} brings a moment of decision. The seeds planted at the New Moon are now meeting their first real challenge. There may be friction, but it is productive friction — the kind that builds momentum.\n\nWith the Moon in ${moonSign}, the action you need to take is ${moonSign}-flavored: be bold, be specific, and push through resistance.`;
    case 'Last Quarter':
      return `The Last Quarter Moon in ${moonSign} ${signEmoji} asks you to release, reflect, and let go. The cycle that began at the last New Moon is winding down. What worked? What didn't? This is not a time to start — it is a time to harvest the lessons.\n\nIn ${moonSign}, the release asks you to examine your relationship with ${moonSign} themes. What can you surrender to make space for the next cycle?`;
    default:
      return `The Moon is currently in ${moonSign} ${signEmoji}, bringing ${moonSign} energy to your emotional landscape. Ruled by ${ruler}, this transit colors your feelings, instincts, and daily rhythms.`;
  }
}

function getRetrogradeDescription(planet: string, sign: string, isStart: boolean): string {
  const emoji = PLANET_EMOJIS[planet] || '🔄';

  if (isStart) {
    const descriptions: Record<string, string> = {
      Mercury: `${emoji} Mercury Retrograde in ${sign} — Communication, technology, and travel slow down. Expect delays, misunderstandings, and revisiting old conversations. This is not a curse — it is a cosmic review period. Back up your data, double-check your messages, and do not sign contracts impulsively.\n\nBut here is the gift: Mercury Retrograde is brilliant for REvisiting, REconnecting, and REflecting. People from the past often reappear. Unfinished projects want completion.`,
      Venus: `${emoji} Venus Retrograde in ${sign} — Love, beauty, and values go under review. Old flames may resurface. Relationships that are not built on truth will be tested. You may question what (and who) you truly value.\n\nThis is a time for internal reflection on love — not for starting new relationships. The heart needs to process before it can open again.`,
      Mars: `${emoji} Mars Retrograde in ${sign} — Drive, ambition, and energy turn inward. You may feel frustrated, sluggish, or strangely unmotivated. Physical energy dips. Anger you have been suppressing may surface.\n\nThis is NOT the time to launch new initiatives or pick fights. It IS the time to reassess your goals, heal old anger, and redirect your energy more wisely.`,
      Jupiter: `${emoji} Jupiter Retrograde in ${sign} — Growth and expansion pause for an internal audit. The external luck dims temporarily so you can examine whether you are growing in the right direction. Faith and belief systems get questioned.\n\nThis is a deeply philosophical transit — use it to refine your vision rather than chase new opportunities.`,
      Saturn: `${emoji} Saturn Retrograde in ${sign} — The taskmaster turns inward. External pressures may ease slightly, but internal accountability increases. You are being asked to examine your structures, commitments, and the rules you live by.\n\nAre your foundations solid? Are you building something that will last? Saturn Retrograde demands honest self-evaluation.`,
      Uranus: `${emoji} Uranus Retrograde in ${sign} — Revolutionary energy turns inward. External disruptions calm down, but internal restlessness grows. You may rethink your relationship with freedom, independence, and change.\n\nThis is a time for internal liberation — breaking free from your own limiting patterns rather than fighting external systems.`,
      Neptune: `${emoji} Neptune Retrograde in ${sign} — The veil between dreams and reality gets thinner, but in a clarifying way. Illusions you have been holding start to dissolve. You see relationships, creative projects, and spiritual beliefs more clearly.\n\nThis is an excellent time for introspection, meditation, and facing truths you have been avoiding.`,
      Pluto: `${emoji} Pluto Retrograde in ${sign} — The planet of transformation turns its intense focus inward. Power dynamics in your life shift. Control issues surface for healing. This is deep psychological work — the kind that changes you permanently.\n\nPluto Retrograde asks: where have you been giving your power away? Where have you been using power destructively?`,
    };
    return descriptions[planet] || `${planet} stations retrograde in ${sign}. Time to review and reflect on ${planet.toLowerCase()} themes.`;
  } else {
    return `${emoji} ${planet} Stations Direct in ${sign} — The retrograde review period is complete. ${planet} moves forward again, and the lessons you learned during the retrograde can now be applied. Expect a sense of clarity and forward momentum returning to ${planet.toLowerCase()} themes in your life.\n\nGive it a few days for the energy to fully clear — the "shadow period" means things gradually return to normal speed.`;
  }
}

function getEclipseDescription(eclipse: EclipseData): string {
  const signEmoji = SIGN_EMOJIS[eclipse.sign] || '';
  const ruler = SIGN_RULERS[eclipse.sign] || 'Unknown';

  if (eclipse.type === 'solar_eclipse') {
    return `☀️🌑 ${eclipse.subtype.charAt(0).toUpperCase() + eclipse.subtype.slice(1)} Solar Eclipse in ${eclipse.sign} ${signEmoji} at ${eclipse.degree}° — Solar eclipses are supercharged New Moons. They bring sudden beginnings, fated events, and destiny-level shifts in the area of your chart touched by ${eclipse.degree}° ${eclipse.sign}.\n\nRuled by ${ruler}, this eclipse activates themes of new identity, fresh starts, and karmic course corrections. Whatever begins around an eclipse tends to feel unavoidable — like the universe is steering you.\n\nCheck which house ${eclipse.sign} rules in your birth chart — that is where the earthquake hits.`;
  } else {
    return `🌕🌑 ${eclipse.subtype.charAt(0).toUpperCase() + eclipse.subtype.slice(1)} Lunar Eclipse in ${eclipse.sign} ${signEmoji} at ${eclipse.degree}° — Lunar eclipses are supercharged Full Moons. They bring endings, revelations, and emotional breakthroughs. Something hidden comes to light. Something that has run its course finally concludes.\n\nIn ${eclipse.sign}, ruled by ${ruler}, this eclipse illuminates your emotional truth. Feelings you have been suppressing will demand acknowledgment.\n\nLunar eclipses often bring closure within 2 weeks of the exact date. Trust the process — what leaves was meant to.`;
  }
}

// ═══════════════════════════════════════════════════════════════════
// Event Detection
// ═══════════════════════════════════════════════════════════════════


/**
 * Detect all currently active cosmic events.
 */
export function detectCosmicEvents(date: Date = new Date()): CosmicEvent[] {
  const events: CosmicEvent[] = [];
  const today = date.toISOString().split('T')[0];

  // 1. Moon phases — check if we're at an exact major phase
  const moonPhase = getCurrentMoonPhase(date);
  if (moonPhase.isExact && ['New Moon', 'Full Moon', 'First Quarter', 'Last Quarter'].includes(moonPhase.phase)) {
    const typeMap: Record<string, CosmicEvent['type']> = {
      'New Moon': 'new_moon',
      'Full Moon': 'full_moon',
      'First Quarter': 'first_quarter',
      'Last Quarter': 'last_quarter',
    };
    events.push({
      id: `moon_${today}_${moonPhase.phase.replace(' ', '_')}`,
      type: typeMap[moonPhase.phase] || 'new_moon',
      title: `${moonPhase.emoji} ${moonPhase.phase} in ${moonPhase.moonSign}`,
      description: getMoonPhaseDescription(moonPhase.phase, moonPhase.moonSign, moonPhase.sunSign),
      emoji: moonPhase.emoji,
      sign: moonPhase.moonSign,
      date: today,
    });
  }

  // 2. Retrogrades — check if today matches a start or end date
  for (const retro of RETROGRADE_WINDOWS) {
    if (retro.startDate === today) {
      events.push({
        id: `retro_start_${retro.planet}_${today}`,
        type: 'retrograde_start',
        title: `${PLANET_EMOJIS[retro.planet] || '🔄'} ${retro.planet} Retrograde Begins`,
        description: getRetrogradeDescription(retro.planet, retro.startSign, true),
        emoji: PLANET_EMOJIS[retro.planet] || '🔄',
        planet: retro.planet,
        sign: retro.startSign,
        date: today,
      });
    }
    if (retro.endDate === today) {
      events.push({
        id: `retro_end_${retro.planet}_${today}`,
        type: 'retrograde_end',
        title: `${PLANET_EMOJIS[retro.planet] || '✨'} ${retro.planet} Goes Direct`,
        description: getRetrogradeDescription(retro.planet, retro.endSign, false),
        emoji: '✨',
        planet: retro.planet,
        sign: retro.endSign,
        date: today,
      });
    }
  }

  // 3. Eclipses — check if today is an eclipse date
  for (const eclipse of ECLIPSES) {
    if (eclipse.date === today) {
      events.push({
        id: `eclipse_${eclipse.type}_${today}`,
        type: eclipse.type,
        title: eclipse.type === 'solar_eclipse'
          ? `☀️🌑 Solar Eclipse in ${eclipse.sign}`
          : `🌕🌑 Lunar Eclipse in ${eclipse.sign}`,
        description: getEclipseDescription(eclipse),
        emoji: eclipse.type === 'solar_eclipse' ? '☀️' : '🌕',
        sign: eclipse.sign,
        date: today,
      });
    }
  }

  // 4. Ingresses — check if today is an ingress date
  for (const ingress of INGRESSES) {
    if (ingress.date === today) {
      events.push({
        id: `ingress_${ingress.planet}_${ingress.sign}_${today}`,
        type: 'ingress',
        title: `${PLANET_EMOJIS[ingress.planet] || '🌟'} ${ingress.planet} Enters ${ingress.sign}`,
        description: ingress.significance,
        emoji: PLANET_EMOJIS[ingress.planet] || '🌟',
        planet: ingress.planet,
        sign: ingress.sign,
        date: today,
      });
    }
  }

  return events;
}
