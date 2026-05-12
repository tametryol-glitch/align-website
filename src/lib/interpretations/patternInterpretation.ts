/**
 * Pattern Interpretation — converts detected aspect patterns and chart shapes
 * into rich, personal, non-repetitive textual interpretations.
 */

import {
  type DetectedPattern, type DetectedChartShape, type InterpretedPattern,
  type PatternMember, type AspectPatternType, type ChartShapeType,
  SIGN_ELEMENTS, SIGN_MODALITIES, HOUSE_THEMES,
} from './patternTypes';

/* -- planet / sign / house helpers ----------------------------------- */

function planetFunction(name: string): string {
  const map: Record<string, string> = {
    Sun: 'core identity and vitality',
    Moon: 'emotional instincts and inner needs',
    Mercury: 'thought patterns and communication style',
    Venus: 'values, love language, and aesthetic sense',
    Mars: 'drive, ambition, and assertive energy',
    Jupiter: 'expansion, faith, and where you seek meaning',
    Saturn: 'discipline, responsibility, and hard-won mastery',
    Uranus: 'innovation, liberation, and sudden insight',
    Neptune: 'imagination, spirituality, and dissolving of boundaries',
    Pluto: 'deep transformation, power, and regeneration',
    Chiron: 'core wound and path to healing wisdom',
    Juno: 'commitment style and partnership ideals',
    Vesta: 'sacred focus and devotional energy',
    Pallas: 'strategic intelligence and pattern recognition',
    Ceres: 'nurturing instinct and cycles of letting go',
    'North Node': 'soul direction and evolutionary growth edge',
    'South Node': 'past-life gifts and comfort zone',
    Vertex: 'fated encounters and turning points',
    Lilith: 'raw authenticity and reclaimed power',
  };
  return map[name] || name.toLowerCase();
}

function signTone(sign: string): string {
  const map: Record<string, string> = {
    Aries: 'bold, pioneering',
    Taurus: 'grounded, sensual',
    Gemini: 'curious, versatile',
    Cancer: 'nurturing, protective',
    Leo: 'radiant, creative',
    Virgo: 'analytical, service-oriented',
    Libra: 'harmonizing, relational',
    Scorpio: 'intense, penetrating',
    Sagittarius: 'expansive, truth-seeking',
    Capricorn: 'structured, ambitious',
    Aquarius: 'innovative, collective-minded',
    Pisces: 'intuitive, transcendent',
  };
  return map[sign] || sign.toLowerCase();
}

function houseStory(house: number): string {
  return HOUSE_THEMES[house] || 'life experiences';
}

function elementNature(sign: string): string {
  const el = SIGN_ELEMENTS[sign];
  if (el === 'Fire') return 'action, inspiration, and initiative';
  if (el === 'Earth') return 'material security, pragmatism, and tangible results';
  if (el === 'Air') return 'ideas, social connection, and intellectual exchange';
  if (el === 'Water') return 'emotional depth, intuition, and psychic sensitivity';
  return 'mixed energies';
}

function modalityDrive(sign: string): string {
  const m = SIGN_MODALITIES[sign];
  if (m === 'Cardinal') return 'initiating action';
  if (m === 'Fixed') return 'sustaining commitment';
  if (m === 'Mutable') return 'adapting and integrating';
  return 'dynamic expression';
}

function memberLabel(m: PatternMember): string {
  return m.name + ' in ' + m.sign + ' (house ' + m.house + ')';
}

function memberNames(members: PatternMember[]): string[] {
  return members.map(m => m.name);
}

function ordinalHouse(h: number): string {
  const suf = ['th','st','nd','rd'];
  const v = h % 100;
  return h + (suf[(v - 20) % 10] || suf[v] || suf[0]) + ' house';
}

function focalDescription(focal: PatternMember | undefined): string {
  if (!focal) return '';
  return focal.name + ' in ' + focal.sign + ' (' + ordinalHouse(focal.house) + ')';
}

/* -- Aspect Pattern interpreters ------------------------------------- */

function interpretGrandTrine(p: DetectedPattern): InterpretedPattern {
  const el = SIGN_ELEMENTS[p.members[0]?.sign] || 'mixed';
  const names = memberNames(p.members);
  const bodyList = p.members.map(m => memberLabel(m)).join(', ');
  return {
    type: p.type, title: el + ' Grand Trine',
    involvedBodies: names,
    geometrySummary: 'Three planets in ' + el.toLowerCase() + ' signs form a flowing triangle: ' + bodyList + '.',
    interpretation: 'This Grand Trine creates a natural circuit of ' + elementNature(p.members[0]?.sign) + '. Energy flows effortlessly between ' + names.join(', ') + ', giving you innate talent in this element. The ' + signTone(p.members[0]?.sign) + ' quality of ' + p.members[0]?.name + ' feeds into the ' + signTone(p.members[1]?.sign) + ' nature of ' + p.members[1]?.name + ', which in turn supports ' + p.members[2]?.name + '. This is a gift you were born with.',
    lifeManifest: 'You likely find that matters of ' + houseStory(p.members[0]?.house) + ', ' + houseStory(p.members[1]?.house) + ', and ' + houseStory(p.members[2]?.house) + ' work together with surprising ease. Others may envy how naturally these areas come to you.',
    growthLesson: 'The risk of a Grand Trine is complacency — talent that never gets challenged rarely reaches its peak. Actively push yourself in these areas rather than coasting on natural ability.',
    category: 'major-pattern', score: p.score,
  };
}

function interpretKite(p: DetectedPattern): InterpretedPattern {
  const apex = p.members.find(m => m.role === 'apex') || p.focalPoint;
  const names = memberNames(p.members);
  return {
    type: p.type, title: 'Kite — Directed Grand Trine',
    involvedBodies: names,
    geometrySummary: 'A Grand Trine with ' + focalDescription(apex) + ' as the apex, forming sextiles to two trine members.',
    interpretation: 'Your Grand Trine gains a productive outlet through ' + (apex?.name || 'the apex planet') + '. While the trine provides effortless flow, the opposition to the apex creates just enough creative tension to motivate action. ' + (apex ? apex.name + ' channels ' + planetFunction(apex.name) + ' as the focal release point.' : ''),
    lifeManifest: 'You have both the natural talent of the Grand Trine AND a built-in drive to use it. The area of ' + houseStory(apex?.house || 1) + ' is where your gifts find their most purposeful expression.',
    growthLesson: 'The apex planet carries the weight of expression — attend to its needs and you unlock the full potential of the trine circuit behind it.',
    focalLabel: apex ? 'Apex: ' + focalDescription(apex) : undefined,
    category: 'major-pattern', score: p.score,
  };
}

function interpretTSquare(p: DetectedPattern): InterpretedPattern {
  const apex = p.members.find(m => m.role === 'apex') || p.focalPoint;
  const names = memberNames(p.members);
  const mod = apex ? SIGN_MODALITIES[apex.sign] : 'dynamic';
  return {
    type: p.type, title: mod + ' T-Square',
    involvedBodies: names,
    geometrySummary: 'Two planets in opposition both square ' + focalDescription(apex) + ', creating a triangle of tension.',
    interpretation: 'This T-Square is an engine of achievement driven by friction. The opposition between the base planets creates an ongoing inner tug-of-war, and all that pressure gets funneled through ' + (apex?.name || 'the apex') + '. ' + (apex ? 'Through ' + planetFunction(apex.name) + ', you are constantly pushed to act, solve, and produce.' : '') + ' This is not comfortable, but it is powerful.',
    lifeManifest: 'You may feel a persistent restlessness around ' + houseStory(apex?.house || 1) + '. Situations in this area demand your attention repeatedly, and through them you build real competence.',
    growthLesson: 'The empty leg (the sign opposite the apex) is your release valve. Consciously developing qualities of ' + (p.missingLeg ? signTone(p.missingLeg.sign) : 'the opposite sign') + ' brings balance and relief.',
    focalLabel: apex ? 'Apex: ' + focalDescription(apex) : undefined,
    category: 'major-pattern', score: p.score,
  };
}

function interpretGrandCross(p: DetectedPattern): InterpretedPattern {
  const names = memberNames(p.members);
  const mod = SIGN_MODALITIES[p.members[0]?.sign] || 'dynamic';
  return {
    type: p.type, title: mod + ' Grand Cross',
    involvedBodies: names,
    geometrySummary: 'Four planets form two oppositions that cross each other with four squares: ' + names.join(', ') + '.',
    interpretation: 'The Grand Cross is one of the most demanding patterns in astrology — and one of the most productive. Four planets in ' + mod.toLowerCase() + ' signs create a closed circuit of tension with no easy escape. Every direction you turn, there is a challenge and an opportunity. ' + names.join(', ') + ' are locked in constant dialogue, forcing integration.',
    lifeManifest: 'Life feels like you are being pulled in four directions at once across ' + p.members.map(m => houseStory(m.house)).join(', ') + '. But this cross-pressure builds extraordinary resilience and capability.',
    growthLesson: 'The key is not to resolve the tension but to hold it consciously. Each arm of the cross needs its turn. When you stop fighting it and start working with the rhythm, the Grand Cross becomes your greatest source of strength.',
    category: 'major-pattern', score: p.score,
  };
}

function interpretYod(p: DetectedPattern): InterpretedPattern {
  const apex = p.members.find(m => m.role === 'apex') || p.focalPoint;
  const names = memberNames(p.members);
  return {
    type: p.type, title: 'Yod — Finger of God',
    involvedBodies: names,
    geometrySummary: 'Two planets sextile each other and both quincunx ' + focalDescription(apex) + ', forming a narrow triangle.',
    interpretation: 'The Yod is called the Finger of God because it points with uncanny precision toward a special mission. ' + (apex ? apex.name + ' at the apex carries a sense of fated purpose through ' + planetFunction(apex.name) + '.' : '') + ' The quincunx aspects create an itch that cannot be easily scratched — a persistent feeling that something needs adjustment.',
    lifeManifest: 'You may experience sudden, redirecting events centered on ' + houseStory(apex?.house || 1) + '. Life seems to keep steering you toward a particular purpose, even when you resist.',
    growthLesson: 'The Yod asks for surrender to a calling that may not make logical sense. Trust the redirection. The discomfort of the quincunx is the universe course-correcting you toward something only you can do.',
    focalLabel: apex ? 'Apex: ' + focalDescription(apex) : undefined,
    category: 'major-pattern', score: p.score,
  };
}

function interpretBoomerangYod(p: DetectedPattern): InterpretedPattern {
  const apex = p.members.find(m => m.role === 'apex') || p.focalPoint;
  const release = p.members.find(m => m.role === 'release');
  const names = memberNames(p.members);
  return {
    type: p.type, title: 'Boomerang Yod',
    involvedBodies: names,
    geometrySummary: 'A Yod with ' + focalDescription(apex) + ' at the apex, plus ' + (release ? memberLabel(release) : 'a release point') + ' opposite the apex.',
    interpretation: 'Your Yod gains a crucial release valve. The standard Yod pressure funnels through the apex, but the opposition planet catches and redirects that energy productively. ' + (release ? release.name + ' provides ' + planetFunction(release.name) + ' as a conscious channel for the Yod tension.' : ''),
    lifeManifest: 'The fated quality of the Yod still operates, but you have a built-in way to process and express it through ' + houseStory(release?.house || 1) + '. This makes the mission more accessible.',
    growthLesson: 'Honor both the apex and the release point. The boomerang action means energy goes out through the apex and returns through the opposition — use both ends consciously.',
    focalLabel: apex ? 'Apex: ' + focalDescription(apex) + (release ? ' | Release: ' + focalDescription(release) : '') : undefined,
    category: 'major-pattern', score: p.score,
  };
}

function interpretMysticRectangle(p: DetectedPattern): InterpretedPattern {
  const names = memberNames(p.members);
  return {
    type: p.type, title: 'Mystic Rectangle',
    involvedBodies: names,
    geometrySummary: 'Four planets connected by two oppositions, two trines, and two sextiles: ' + names.join(', ') + '.',
    interpretation: 'The Mystic Rectangle is a rare and harmonious pattern that balances tension with flow. The two oppositions provide awareness and perspective, while the trines and sextiles offer productive channels. ' + names.join(' and ') + ' work together as a balanced system, giving you natural diplomatic ability and inner equilibrium.',
    lifeManifest: 'Life areas of ' + p.members.map(m => houseStory(m.house)).join(', ') + ' interweave in a way that feels both meaningful and manageable. You can see all sides of a situation.',
    growthLesson: 'This pattern makes harmony easy but can also make you conflict-avoidant. Sometimes growth requires choosing a side rather than endlessly balancing.',
    category: 'major-pattern', score: p.score,
  };
}

function interpretMinorGrandTrine(p: DetectedPattern): InterpretedPattern {
  const names = memberNames(p.members);
  return {
    type: p.type, title: 'Minor Grand Trine',
    involvedBodies: names,
    geometrySummary: 'A trine between two planets, both sextile a third: ' + names.join(', ') + '.',
    interpretation: 'This smaller version of the Grand Trine provides a pocket of natural talent. The trine offers easy flow and the two sextiles add opportunities to actively use that flow. ' + names[0] + ' and ' + names[1] + ' support each other effortlessly, and ' + (names[2] || 'the third planet') + ' provides a productive outlet.',
    lifeManifest: 'Opportunities arise naturally in ' + houseStory(p.members[2]?.house || 1) + ' when you lean into the gifts of this pattern. It works best when you take initiative.',
    growthLesson: 'Unlike a full Grand Trine, this one requires some effort to activate. The sextiles are opportunities, not guarantees — reach for them.',
    category: 'secondary-pattern', score: p.score,
  };
}

function interpretStellium(p: DetectedPattern): InterpretedPattern {
  const names = memberNames(p.members);
  const sign = p.members[0]?.sign || 'unknown';
  const house = p.members[0]?.house || 1;
  return {
    type: p.type, title: names.length + '-Planet Stellium in ' + sign,
    involvedBodies: names,
    geometrySummary: names.length + ' planets clustered in ' + sign + ' (' + ordinalHouse(house) + '): ' + names.join(', ') + '.',
    interpretation: 'A stellium concentrates enormous energy in one sign and house. With ' + names.length + ' planets in ' + sign + ', the ' + signTone(sign) + ' qualities are massively amplified in your chart. This area of life dominates your experience — for better and for worse. ' + names.join(', ') + ' all express through the lens of ' + sign + ', creating a powerful but potentially one-sided emphasis.',
    lifeManifest: 'The ' + ordinalHouse(house) + ' — ' + houseStory(house) + ' — is the central arena of your life. Major events, passions, and challenges cluster here.',
    growthLesson: 'With so much energy in one place, consciously develop the opposite sign (' + (SIGN_MODALITIES[sign] ? sign : 'the polarity') + ') to maintain balance. Your strength is also your blind spot.',
    category: 'major-pattern', score: p.score,
  };
}

/* -- Chart Shape interpreters ---------------------------------------- */

function interpretBowl(shape: DetectedChartShape): InterpretedPattern {
  const lead = shape.leadingPlanet;
  return {
    type: shape.type, title: 'Bowl Chart Shape',
    involvedBodies: lead ? [lead.name] : [],
    geometrySummary: shape.description,
    interpretation: 'Your planets occupy roughly one half of the zodiac, creating a container-like energy. You carry a deep sense of self-containment and personal mission. The empty half represents qualities you encounter through others and the world outside you.' + (lead ? ' ' + lead.name + ' leads the bowl, giving ' + planetFunction(lead.name) + ' a pioneering role in your life.' : ''),
    lifeManifest: 'You tend to be self-reliant and purposeful, with a clear sense of what you bring to the table. Relationships often serve as mirrors for the qualities in your empty half.',
    growthLesson: 'The empty hemisphere is not a deficit — it is an invitation. Growth comes from engaging with what lies outside your comfort zone.',
    focalLabel: lead ? 'Leading planet: ' + focalDescription(lead) : undefined,
    category: 'chart-shape', score: shape.confidence,
  };
}

function interpretBucket(shape: DetectedChartShape): InterpretedPattern {
  const handle = shape.handlePlanet;
  return {
    type: shape.type, title: 'Bucket Chart Shape',
    involvedBodies: handle ? [handle.name] : [],
    geometrySummary: shape.description,
    interpretation: 'A bowl of planets with a single handle planet standing apart. All the energy of the bowl pours through this one outlet.' + (handle ? ' ' + handle.name + ' serves as your funnel, channeling ' + planetFunction(handle.name) + ' as the primary mode of expression.' : '') + ' This creates a focused, directed life.',
    lifeManifest: (handle ? 'The area of ' + houseStory(handle.house) + ' becomes your primary channel for everything you do. ' : '') + 'People may know you primarily through this one mode of expression, even though you have rich depth behind it.',
    growthLesson: 'The handle planet carries enormous weight. Give it conscious attention and healthy outlets, or it can become a bottleneck.',
    focalLabel: handle ? 'Handle: ' + focalDescription(handle) : undefined,
    category: 'chart-shape', score: shape.confidence,
  };
}

function interpretBundle(shape: DetectedChartShape): InterpretedPattern {
  return {
    type: shape.type, title: 'Bundle Chart Shape',
    involvedBodies: [],
    geometrySummary: shape.description,
    interpretation: 'All your planets cluster within roughly a third of the zodiac. This extreme concentration produces a specialist — someone with intense focus and deep expertise in a narrow range. You know exactly what you care about.',
    lifeManifest: 'Life revolves around a few core themes. You may struggle to relate to people whose interests are scattered, because your world is concentrated and deeply explored.',
    growthLesson: 'Your power is focus, but your challenge is perspective. Seek out experiences and people who expose you to the eight signs you do not naturally inhabit.',
    category: 'chart-shape', score: shape.confidence,
  };
}

function interpretLocomotive(shape: DetectedChartShape): InterpretedPattern {
  const lead = shape.leadingPlanet;
  return {
    type: shape.type, title: 'Locomotive Chart Shape',
    involvedBodies: lead ? [lead.name] : [],
    geometrySummary: shape.description,
    interpretation: 'Your planets span about two-thirds of the zodiac, leaving an empty trine. This creates a powerful drive — like a locomotive engine pulling forward relentlessly.' + (lead ? ' ' + lead.name + ' is the engine, pulling the chart forward through ' + planetFunction(lead.name) + '.' : ''),
    lifeManifest: 'You are a self-starter with tremendous stamina. The empty trine creates a hunger that motivates your achievements. You may feel like you always need to be moving toward something.',
    growthLesson: 'The empty arc shows what you are unconsciously driven to acquire or master. Awareness of this blind spot turns compulsive drive into conscious purpose.',
    focalLabel: lead ? 'Leading planet: ' + focalDescription(lead) : undefined,
    category: 'chart-shape', score: shape.confidence,
  };
}

function interpretSeesaw(shape: DetectedChartShape): InterpretedPattern {
  return {
    type: shape.type, title: 'Seesaw Chart Shape',
    involvedBodies: [],
    geometrySummary: shape.description,
    interpretation: 'Your planets form two distinct groups on opposite sides of the chart, like two ends of a balance beam. You experience life as a series of polarities — pulled between two perspectives, two life areas, two modes of being.',
    lifeManifest: 'Decision-making often involves weighing two fundamentally different options. You can see both sides of any issue with genuine understanding, making you a natural mediator.',
    growthLesson: 'The lesson is integration, not choosing sides. The two halves of your chart need each other. Alternating awareness between them, rather than collapsing into one, is your path to wholeness.',
    category: 'chart-shape', score: shape.confidence,
  };
}

function interpretSplash(shape: DetectedChartShape): InterpretedPattern {
  return {
    type: shape.type, title: 'Splash Chart Shape',
    involvedBodies: [],
    geometrySummary: shape.description,
    interpretation: 'Your planets are distributed broadly across the zodiac, touching many signs and houses. This produces a universal person — someone with genuine interest in a wide range of life areas. You are a renaissance soul.',
    lifeManifest: 'You dabble in many areas and may resist being pinned down to one identity or career. Variety is not just the spice of your life — it is the main course.',
    growthLesson: 'Your challenge is depth. With so many interests, you risk being a jack of all trades. Choose a few areas for deep mastery while maintaining your broad perspective.',
    category: 'chart-shape', score: shape.confidence,
  };
}

function interpretSplay(shape: DetectedChartShape): InterpretedPattern {
  return {
    type: shape.type, title: 'Splay Chart Shape',
    involvedBodies: [],
    geometrySummary: shape.description,
    interpretation: 'Your planets form several distinct clusters scattered irregularly around the chart. This creates an individualist — someone who resists neat categories. You have several strong, somewhat unrelated interests and talents that make you unique.',
    lifeManifest: 'People find you hard to categorize. You may have a career, a creative passion, and a spiritual practice that seem unrelated to outsiders but make perfect sense to you.',
    growthLesson: 'Embrace your non-linear nature. Your power comes from unexpected connections between your disparate interests. Do not try to force yourself into someone else\'s box.',
    category: 'chart-shape', score: shape.confidence,
  };
}

function interpretFan(shape: DetectedChartShape): InterpretedPattern {
  const handle = shape.handlePlanet;
  return {
    type: shape.type, title: 'Fan Chart Shape',
    involvedBodies: handle ? [handle.name] : [],
    geometrySummary: shape.description,
    interpretation: 'Similar to a Bucket, but with a tighter cluster and more extreme focus through the handle planet.' + (handle ? ' ' + handle.name + ' is the sole outlet for an intensely concentrated chart, making ' + planetFunction(handle.name) + ' extraordinarily prominent in your life.' : ''),
    lifeManifest: (handle ? 'Everything in your life seems to funnel through the themes of ' + houseStory(handle.house) + '. ' : '') + 'You have laser focus and the ability to channel enormous energy through a single point.',
    growthLesson: 'The intensity of the Fan can become obsessive. Build in deliberate rest and diversification to prevent burnout on your focal theme.',
    focalLabel: handle ? 'Handle: ' + focalDescription(handle) : undefined,
    category: 'chart-shape', score: shape.confidence,
  };
}

/* -- Main entry point ------------------------------------------------ */

const ASPECT_INTERPRETERS: Record<AspectPatternType, (p: DetectedPattern) => InterpretedPattern> = {
  'Grand Trine': interpretGrandTrine,
  'Kite': interpretKite,
  'T-Square': interpretTSquare,
  'Grand Cross': interpretGrandCross,
  'Yod': interpretYod,
  'Boomerang Yod': interpretBoomerangYod,
  'Mystic Rectangle': interpretMysticRectangle,
  'Minor Grand Trine': interpretMinorGrandTrine,
  'Stellium': interpretStellium,
};

const SHAPE_INTERPRETERS: Record<ChartShapeType, (s: DetectedChartShape) => InterpretedPattern> = {
  'Bowl': interpretBowl,
  'Bucket': interpretBucket,
  'Bundle': interpretBundle,
  'Locomotive': interpretLocomotive,
  'Seesaw': interpretSeesaw,
  'Splash': interpretSplash,
  'Splay': interpretSplay,
  'Fan': interpretFan,
};

export function interpretPatterns(
  patterns: DetectedPattern[],
  shape: DetectedChartShape | null,
): InterpretedPattern[] {
  const results: InterpretedPattern[] = [];

  // Chart shape first (if detected)
  if (shape && SHAPE_INTERPRETERS[shape.type]) {
    results.push(SHAPE_INTERPRETERS[shape.type](shape));
  }

  // Aspect patterns sorted by score
  const sorted = [...patterns].sort((a, b) => b.score - a.score);
  for (const p of sorted) {
    const fn = ASPECT_INTERPRETERS[p.type];
    if (fn) results.push(fn(p));
  }

  return results;
}
