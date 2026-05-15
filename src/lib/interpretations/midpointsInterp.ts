import { analyzeDuadCompendium, RULERS, SIGNS } from '../engines/duadCompendium';

// ─── Glyph maps ─────────────────────────────────────────────────────────────
export const ZODIAC_GLYPHS_MP: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};
export const PLANET_GLYPHS_MP: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  'North Node': '☊', 'South Node': '☋', Chiron: '⚷',
  Juno: '⚵', Vesta: '⚶', Urania: '⚹',
  ASC: 'AC', MC: 'MC',
  'Part of Fortune': '⊗', 'Part of Spirit': '⊙',
};

// ─── All bodies for midpoint calculations ───────────────────────────────────
export const ALL_BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
  'Uranus', 'Neptune', 'Pluto',
  'ASC', 'MC', 'North Node', 'South Node',
  'Chiron', 'Vesta', 'Juno', 'Urania',
  'Part of Fortune', 'Part of Spirit',
];

const BODY_ALIASES: Record<string, string[]> = {
  ASC: ['Ascendant', 'ASC', 'AC'],
  MC: ['MC', 'Midheaven', 'Medium Coeli'],
  'North Node': ['North Node', 'Rahu', 'True Node'],
  'South Node': ['South Node', 'Ketu'],
  Urania: ['Urania', 'Angel'],
};

// ─── Types ──────────────────────────────────────────────────────────────────
export interface MidpointAspect {
  body: string;
  bodyLon: number;
  aspectType: string;
  orb: number;
}

export interface MidpointResult {
  key: string;
  body1: string;
  body2: string;
  longitude: number;
  sign: string;
  degreeInSign: number;
  house: number;
  duadSign: string;
  compendiumSign: string;
  signRuler: string;
  rulerLon: number | null;
  rulerSign: string;
  rulerHouse: number;
  aspects: MidpointAspect[];
  priority: number;
  strengthScore: number;
  themes: string[];
}

// ─── Calculation helpers ────────────────────────────────────────────────────
export function getLon(planets: any[], name: string): number | null {
  const aliases = BODY_ALIASES[name] || [name];
  for (const alias of aliases) {
    const p = planets.find((pl: any) => (pl.name || pl.planet) === alias);
    if (p && p.longitude != null) return p.longitude;
  }
  return null;
}

function getHouseForLon(lon: number, ascLon: number): number {
  const ascIdx = Math.floor(ascLon / 30) % 12;
  const lonIdx = Math.floor(lon / 30) % 12;
  return ((lonIdx - ascIdx + 12) % 12) + 1;
}

function getSignForLon(lon: number): string {
  return SIGNS[Math.floor(((lon % 360) + 360) % 360 / 30) % 12];
}

function getDegreeInSign(lon: number): number {
  return ((lon % 360) + 360) % 360 % 30;
}

function calcMidpoint(lon1: number, lon2: number): number {
  const a = ((lon1 % 360) + 360) % 360;
  const b = ((lon2 % 360) + 360) % 360;
  let mid = (a + b) / 2;
  if (Math.abs(a - b) > 180) mid = (mid + 180) % 360;
  return ((mid % 360) + 360) % 360;
}

// ─── Aspect detection ───────────────────────────────────────────────────────
const ASPECT_TYPES = [
  { name: 'Conjunction', angle: 0, orb: 1.5 },
  { name: 'Square', angle: 90, orb: 1.5 },
  { name: 'Opposition', angle: 180, orb: 1.5 },
  { name: 'Quincunx', angle: 150, orb: 1.5 },
];

function findAspectsToMidpoint(midLon: number, planets: any[], excludeNames: string[]): MidpointAspect[] {
  const aspects: MidpointAspect[] = [];
  for (const body of ALL_BODIES) {
    if (excludeNames.includes(body)) continue;
    const lon = getLon(planets, body);
    if (lon === null) continue;
    for (const asp of ASPECT_TYPES) {
      const diff = Math.abs(((midLon - lon + 540) % 360) - 180);
      const orbDist = Math.abs(diff - asp.angle);
      if (orbDist <= asp.orb) {
        aspects.push({ body, bodyLon: lon, aspectType: asp.name, orb: Math.round(orbDist * 100) / 100 });
      }
    }
  }
  return aspects;
}

// ─── Priority ranking ───────────────────────────────────────────────────────
const PRIORITY_KEYS = [
  'Sun/Moon', 'Venus/Mars', 'Sun/MC', 'Moon/ASC', 'Sun/ASC',
  'Mars/Saturn', 'Moon/Pluto', 'Venus/Pluto', 'Jupiter/Saturn', 'Saturn/Pluto',
  'Sun/Mercury', 'Sun/Venus', 'Sun/Mars', 'Sun/Jupiter', 'Sun/Saturn',
  'Sun/Uranus', 'Sun/Neptune', 'Sun/Pluto', 'Moon/Venus', 'Moon/Mars',
  'Moon/Saturn', 'Moon/Neptune', 'Venus/Jupiter', 'Venus/Saturn', 'Venus/Neptune',
  'Mars/Jupiter', 'Mars/Pluto', 'North Node/MC', 'North Node/ASC',
  'Vesta/MC', 'Juno/Venus', 'Chiron/Moon',
];

function getPriority(key: string): number {
  const idx = PRIORITY_KEYS.indexOf(key);
  return idx >= 0 ? idx : 999;
}

// ─── Theme classification ───────────────────────────────────────────────────
export const THEME_CLUSTERS: Record<string, { label: string; icon: string; bodies: string[] }> = {
  love: { label: 'Love & Desire', icon: '💜', bodies: ['Venus', 'Mars', 'Juno', 'Moon'] },
  career: { label: 'Career & Purpose', icon: '🏆', bodies: ['Sun', 'MC', 'Saturn', 'Vesta', 'Jupiter'] },
  healing: { label: 'Healing & Growth', icon: '🌿', bodies: ['Chiron', 'North Node', 'South Node'] },
  power: { label: 'Power & Transformation', icon: '🔥', bodies: ['Pluto', 'Mars', 'Saturn'] },
  identity: { label: 'Identity & Expression', icon: '✨', bodies: ['Sun', 'Moon', 'ASC', 'Mercury'] },
  spiritual: { label: 'Spiritual & Intuitive', icon: '🔮', bodies: ['Neptune', 'Uranus', 'Pisces', 'Part of Fortune', 'Part of Spirit'] },
};

function classifyThemes(body1: string, body2: string): string[] {
  const themes: string[] = [];
  for (const [key, cluster] of Object.entries(THEME_CLUSTERS)) {
    if (cluster.bodies.includes(body1) || cluster.bodies.includes(body2)) {
      themes.push(key);
    }
  }
  return themes.length > 0 ? themes : ['identity'];
}

// ─── Strength scoring ───────────────────────────────────────────────────────
const PERSONAL_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
const ANGLES = ['ASC', 'MC'];
const CARDINAL_HOUSES = [1, 4, 7, 10];

function calcStrengthScore(mp: { body1: string; body2: string; house: number; aspects: MidpointAspect[] }): number {
  let score = 0;
  if (PERSONAL_PLANETS.includes(mp.body1)) score += 2;
  if (PERSONAL_PLANETS.includes(mp.body2)) score += 2;
  if (ANGLES.includes(mp.body1) || ANGLES.includes(mp.body2)) score += 3;
  if (CARDINAL_HOUSES.includes(mp.house)) score += 1;
  score += mp.aspects.length * 2;
  for (const asp of mp.aspects) {
    if (asp.aspectType === 'Conjunction') score += 2;
    if (PERSONAL_PLANETS.includes(asp.body)) score += 1;
  }
  return Math.min(score, 20);
}

// ─── KEY MIDPOINT MEANINGS ──────────────────────────────────────────────────
export const MIDPOINT_ESSENCE: Record<string, { title: string; essence: string }> = {
  'Sun/Moon': { title: 'The Soul Blend', essence: 'Where your conscious will and emotional instincts merge into one force. This is the integration point of who you are and what you need.' },
  'Sun/Mercury': { title: 'The Mind\'s Voice', essence: 'Where your identity expresses through intellect. How you think about yourself and communicate your truth.' },
  'Sun/Venus': { title: 'The Heart\'s Desire', essence: 'Where identity meets love, beauty, and value. What you truly want and how you attract it.' },
  'Sun/Mars': { title: 'The Drive Core', essence: 'Where identity meets raw will. Your ambition signature, aggression style, and competitive edge.' },
  'Sun/Jupiter': { title: 'The Growth Vision', essence: 'Where identity meets expansion. Your faith, optimism, and capacity for abundance.' },
  'Sun/Saturn': { title: 'The Maturity Point', essence: 'Where identity meets limitation. Your relationship with authority, discipline, and earned achievement.' },
  'Sun/Uranus': { title: 'The Rebel Spark', essence: 'Where identity meets liberation. Your originality, independence, and capacity for sudden reinvention.' },
  'Sun/Neptune': { title: 'The Dream Self', essence: 'Where identity dissolves into imagination. Your spiritual sensitivity, artistic vision, and vulnerability to illusion.' },
  'Sun/Pluto': { title: 'The Power Center', essence: 'Where identity meets transformation. Your relationship with power, death-rebirth cycles, and psychological intensity.' },
  'Sun/ASC': { title: 'The Persona Point', essence: 'Where your true self meets the mask you wear. The gap or alignment between who you are and how others perceive you.' },
  'Sun/MC': { title: 'The Purpose Point', essence: 'Where your identity meets your calling. The career, reputation, and legacy you are building.' },
  'Moon/Venus': { title: 'The Comfort Point', essence: 'Where emotional needs meet love and pleasure. Your relationship with comfort, beauty, and emotional satisfaction.' },
  'Moon/Mars': { title: 'The Emotional Fire', essence: 'Where feelings meet action. Your emotional reactivity, passionate responses, and gut-level courage.' },
  'Moon/Saturn': { title: 'The Emotional Wall', essence: 'Where feelings meet restriction. Your capacity for emotional maturity but also your tendency toward emotional suppression or loneliness.' },
  'Moon/Neptune': { title: 'The Psychic Stream', essence: 'Where emotions dissolve into the unconscious. Your intuition, empathy, psychic sensitivity, and vulnerability to emotional confusion.' },
  'Moon/Pluto': { title: 'The Emotional Depth', essence: 'Where feelings meet power. Your capacity for emotional intensity, obsession, and transformative emotional experiences.' },
  'Moon/ASC': { title: 'The Emotional Mask', essence: 'How your emotional nature shows on the surface. The instinctive first impression you make.' },
  'Venus/Mars': { title: 'The Desire Point', essence: 'Where love meets drive. Your sexual magnetism, attraction style, and the way you pursue what you want in love.' },
  'Venus/Jupiter': { title: 'The Abundance Point', essence: 'Where value meets expansion. Your capacity for generosity, luxury, and attracting wealth.' },
  'Venus/Saturn': { title: 'The Loyal Heart', essence: 'Where love meets commitment. Your capacity for enduring love but also your fear of rejection or unworthiness.' },
  'Venus/Neptune': { title: 'The Romantic Dream', essence: 'Where love meets fantasy. Your idealism in relationships, artistic sensitivity, and vulnerability to romantic illusion.' },
  'Venus/Pluto': { title: 'The Magnetic Pull', essence: 'Where love meets obsession. Your capacity for deep, transformative love but also possessiveness and jealousy.' },
  'Mars/Jupiter': { title: 'The Bold Move', essence: 'Where drive meets opportunity. Your capacity for ambitious action, risk-taking, and bold expansion.' },
  'Mars/Saturn': { title: 'The Controlled Burn', essence: 'Where drive meets discipline. Your capacity for sustained effort but also frustration with obstacles.' },
  'Mars/Pluto': { title: 'The Power Drive', essence: 'Where action meets transformation. Your capacity for intense, ruthless determination and the will to destroy and rebuild.' },
  'Jupiter/Saturn': { title: 'The Reality Check', essence: 'Where expansion meets limitation. The balance between optimism and realism, faith and structure.' },
  'Saturn/Pluto': { title: 'The Karmic Pressure', essence: 'Where structure meets destruction. Intense karmic pressure to transform deeply held patterns.' },
  'North Node/MC': { title: 'The Destiny Career', essence: 'Where soul direction meets public calling. The career path your soul is evolving toward.' },
  'North Node/ASC': { title: 'The Destiny Self', essence: 'Where soul direction meets self-expression. The person you are becoming in this lifetime.' },
  'Vesta/MC': { title: 'The Sacred Work', essence: 'Where devotion meets career. Your capacity for disciplined, focused professional mastery.' },
  'Juno/Venus': { title: 'The Partnership Heart', essence: 'Where commitment meets love. Your deepest relationship needs and contract expectations.' },
  'Chiron/Moon': { title: 'The Wounded Heart', essence: 'Where healing meets emotion. Your deepest emotional wound and your greatest gift for healing others.' },
  'Moon/Mercury': { title: 'The Feeling Mind', essence: 'Where emotion meets intellect. How you process feelings through thought and communication.' },
  'Moon/Jupiter': { title: 'The Generous Heart', essence: 'Where emotion meets expansion. Your capacity for emotional generosity, faith, and nurturing abundance.' },
  'Moon/Uranus': { title: 'The Emotional Wildcard', essence: 'Where feelings meet sudden change. Your need for emotional freedom and unpredictable emotional patterns.' },
  'Mercury/Venus': { title: 'The Charming Mind', essence: 'Where thought meets beauty. Your capacity for elegant expression, diplomatic intelligence, and artistic thinking.' },
  'Mercury/Mars': { title: 'The Sharp Tongue', essence: 'Where thought meets action. Your debate style, mental assertiveness, and intellectual combativeness.' },
  'Mercury/Jupiter': { title: 'The Big Thinker', essence: 'Where thought meets vision. Your capacity for philosophical thinking, teaching, and expansive communication.' },
  'Mercury/Saturn': { title: 'The Serious Mind', essence: 'Where thought meets discipline. Your capacity for structured thinking, careful planning, and mental endurance.' },
  'Mercury/Uranus': { title: 'The Lightning Mind', essence: 'Where thought meets genius. Your capacity for original ideas, sudden insights, and unconventional intelligence.' },
  'Mercury/Neptune': { title: 'The Poetic Mind', essence: 'Where thought dissolves into imagination. Your capacity for inspired communication, psychic perception, and creative confusion.' },
  'Mercury/Pluto': { title: 'The Penetrating Mind', essence: 'Where thought meets power. Your capacity for psychological insight, investigative brilliance, and mental obsession.' },
  'Mars/Uranus': { title: 'The Electric Warrior', essence: 'Where action meets sudden liberation. Your capacity for explosive, unpredictable action and revolutionary drive.' },
  'Mars/Neptune': { title: 'The Mystic Warrior', essence: 'Where action dissolves into the ideal. Your capacity for inspired action but also confusion about what you are fighting for.' },
  'Jupiter/Uranus': { title: 'The Breakthrough', essence: 'Where expansion meets revolution. Your capacity for sudden luck, dramatic growth, and visionary innovation.' },
  'Jupiter/Neptune': { title: 'The Spiritual Expansion', essence: 'Where faith meets transcendence. Your capacity for mystical experience, grand idealism, and boundless compassion.' },
  'Jupiter/Pluto': { title: 'The Power Expansion', essence: 'Where growth meets transformation. Your capacity for massive ambition, wealth creation, and transformative influence.' },
  'Saturn/Uranus': { title: 'The Tension Point', essence: 'Where structure meets disruption. The tension between tradition and revolution in your life.' },
  'Saturn/Neptune': { title: 'The Dream Wall', essence: 'Where structure meets dissolution. Your struggle between reality and illusion, discipline and surrender.' },
  'Uranus/Neptune': { title: 'The Collective Vision', essence: 'Where revolution meets transcendence. Generational idealism and the collective spiritual awakening you participate in.' },
  'Uranus/Pluto': { title: 'The Collective Transformation', essence: 'Where revolution meets destruction. Generational upheaval and the collective force for radical change.' },
  'Neptune/Pluto': { title: 'The Generational Undercurrent', essence: 'Where transcendence meets transformation. The deepest collective evolutionary force of your generation.' },
  'Chiron/Sun': { title: 'The Wounded Identity', essence: 'Where healing meets selfhood. Your core wound around being seen, valued, and recognized for who you truly are.' },
  'Chiron/Venus': { title: 'The Wounded Lover', essence: 'Where healing meets love. Your wound around being loved, valued, and deserving of beauty and pleasure.' },
  'Chiron/Mars': { title: 'The Wounded Warrior', essence: 'Where healing meets action. Your wound around asserting yourself, competing, and expressing anger.' },
  'Chiron/Saturn': { title: 'The Wounded Authority', essence: 'Where healing meets structure. Your wound around authority, achievement, and earning your place.' },
  'Vesta/Sun': { title: 'The Sacred Identity', essence: 'Where devotion meets selfhood. What you are willing to dedicate your entire being to.' },
  'Juno/Mars': { title: 'The Partnership Drive', essence: 'Where commitment meets action. How you fight for your relationships and what you demand from partners.' },
  'Juno/Saturn': { title: 'The Binding Contract', essence: 'Where commitment meets structure. Your capacity for enduring, serious partnership and the weight of relational duty.' },
  'Moon/MC': { title: 'The Public Heart', essence: 'Where emotions meet public image. How your private feelings shape your career and reputation.' },
  'Mercury/ASC': { title: 'The Messenger Face', essence: 'Where communication meets appearance. How your intellect and speech style shape first impressions.' },
  'Mercury/MC': { title: 'The Thinking Career', essence: 'Where intellect meets vocation. Your capacity for career success through communication, writing, and ideas.' },
  'Venus/ASC': { title: 'The Beautiful Mask', essence: 'Where love and beauty meet self-presentation. Your charm, grace, and aesthetic impact on others.' },
  'Venus/MC': { title: 'The Beautiful Career', essence: 'Where love and beauty meet public calling. Success through art, diplomacy, beauty, and relationship skills.' },
  'Mars/ASC': { title: 'The Warrior Face', essence: 'Where drive meets identity. Your physical assertiveness, competitive first impression, and active persona.' },
  'Mars/MC': { title: 'The Ambitious Career', essence: 'Where drive meets calling. Your professional aggression, competitive career style, and leadership capacity.' },
  'Jupiter/ASC': { title: 'The Expansive Persona', essence: 'Where growth meets identity. Your generous, optimistic first impression and philosophical self-expression.' },
  'Jupiter/MC': { title: 'The Fortunate Career', essence: 'Where expansion meets calling. Your capacity for career luck, professional growth, and public generosity.' },
  'Saturn/ASC': { title: 'The Serious Persona', essence: 'Where discipline meets identity. Your mature, reserved first impression and authoritative self-presentation.' },
  'Saturn/MC': { title: 'The Builder Career', essence: 'Where discipline meets calling. Your capacity for long-term career achievement through patience and structure.' },
  'Uranus/ASC': { title: 'The Rebel Persona', essence: 'Where liberation meets identity. Your unconventional first impression and need to present as unique.' },
  'Uranus/MC': { title: 'The Revolutionary Career', essence: 'Where innovation meets calling. Your capacity for career breakthroughs and unconventional professional paths.' },
  'Neptune/ASC': { title: 'The Dreamer Persona', essence: 'Where imagination meets identity. Your ethereal, mysterious first impression and artistic self-presentation.' },
  'Neptune/MC': { title: 'The Visionary Career', essence: 'Where imagination meets calling. Career success through creativity, spirituality, and healing arts.' },
  'Pluto/ASC': { title: 'The Powerful Persona', essence: 'Where transformation meets identity. Your intense, magnetic first impression and psychological impact on others.' },
  'Pluto/MC': { title: 'The Transformative Career', essence: 'Where power meets calling. Career involving transformation, research, psychology, or institutional power.' },
  'North Node/Sun': { title: 'The Destiny Identity', essence: 'Where soul direction meets selfhood. The core identity your soul is growing toward in this life.' },
  'North Node/Moon': { title: 'The Destiny Feelings', essence: 'Where soul direction meets emotion. The emotional patterns your soul needs to develop.' },
  'South Node/Sun': { title: 'The Past-Life Identity', essence: 'Where karmic past meets selfhood. The identity patterns you are releasing from past lives.' },
  'South Node/Moon': { title: 'The Past-Life Emotions', essence: 'Where karmic past meets feeling. The emotional habits carried from previous incarnations.' },
};

// ─── Sign expression ────────────────────────────────────────────────────────
export const SIGN_MIDPOINT_EXPRESSION: Record<string, string> = {
  Aries: 'expresses with urgency, directness, and pioneering force. It acts first and processes later.',
  Taurus: 'expresses with slow persistence, sensual grounding, and material focus. It builds and holds.',
  Gemini: 'expresses through communication, mental agility, and versatile connection. It talks, writes, and trades.',
  Cancer: 'expresses through emotion, family bonds, and protective instinct. It nurtures and remembers.',
  Leo: 'expresses through creative confidence, visibility, and radiant self-expression. It performs and leads.',
  Virgo: 'expresses through precision, service, and analytical refinement. It improves and perfects.',
  Libra: 'expresses through relationship, beauty, and diplomatic balance. It harmonizes and partners.',
  Scorpio: 'expresses through intensity, depth, and transformative power. It penetrates and regenerates.',
  Sagittarius: 'expresses through expansion, philosophy, and adventurous vision. It teaches and explores.',
  Capricorn: 'expresses through discipline, strategy, and long-term authority. It builds empires slowly.',
  Aquarius: 'expresses through innovation, independence, and collective vision. It disrupts and liberates.',
  Pisces: 'expresses through intuition, compassion, and mystical surrender. It dissolves and transcends.',
};

// ─── House manifestation ────────────────────────────────────────────────────
export const HOUSE_MIDPOINT_MANIFESTATION: Record<number, string> = {
  1: 'This midpoint plays out through your identity, body, appearance, and the way you instinctively approach life.',
  2: 'This midpoint manifests in your finances, self-worth, possessions, and what you value most deeply.',
  3: 'This midpoint manifests through communication, siblings, short journeys, and your immediate mental environment.',
  4: 'This midpoint manifests through home, family, ancestry, and your emotional foundations.',
  5: 'This midpoint manifests through creativity, romance, children, pleasure, and self-expression.',
  6: 'This midpoint manifests through work, health, daily routines, and acts of service.',
  7: 'This midpoint manifests through partnerships, marriage, close relationships, and open enemies.',
  8: 'This midpoint manifests through shared resources, intimacy, transformation, death, and rebirth.',
  9: 'This midpoint manifests through higher education, travel, philosophy, religion, and publishing.',
  10: 'This midpoint manifests through career, public reputation, authority, and legacy.',
  11: 'This midpoint manifests through community, friendships, networks, hopes, and wishes.',
  12: 'This midpoint manifests through spirituality, solitude, hidden patterns, and the unconscious.',
};

// ─── Aspect activation descriptions ─────────────────────────────────────────
const ASPECT_ACTIVATION: Record<string, string> = {
  Conjunction: 'directly fuses with and amplifies',
  Square: 'creates friction, tension, and forced action around',
  Opposition: 'confronts and exposes the other side of',
  Quincunx: 'creates an awkward, persistent adjustment pressure on',
};

// ─── Real-life expressions ──────────────────────────────────────────────────
const REAL_LIFE_EXAMPLES: Record<string, (name: string) => string> = {
  'Sun/Moon': n => `${n}, this shows up as the moments when you feel most whole — when your actions and feelings are aligned. Career choices that honor both your drive and your emotional needs will always win.`,
  'Sun/Mercury': n => `This shows up in how ${n} talks about themselves, presents ideas, and processes identity through conversation.`,
  'Sun/Venus': n => `This shows up in ${n}'s taste, romantic attractions, and what feels beautiful and worth pursuing.`,
  'Sun/Mars': n => `This shows up as ${n}'s competitive edge, physical energy, and willingness to fight for what matters.`,
  'Sun/Jupiter': n => `This shows up as ${n}'s natural optimism, big-picture thinking, and opportunities that come through confidence.`,
  'Sun/Saturn': n => `This shows up in ${n}'s relationship with authority, career milestones, and hard-earned achievements.`,
  'Sun/Uranus': n => `This shows up as ${n}'s need for personal freedom, sudden changes, and moments of breaking from convention.`,
  'Sun/Neptune': n => `This shows up in ${n}'s creative imagination, spiritual longings, and the tension between idealism and reality.`,
  'Sun/Pluto': n => `This shows up in ${n}'s encounters with power — their own and others'. Crisis points and the ability to reinvent completely.`,
  'Sun/ASC': n => `This shows up in how closely ${n}'s true self matches their public persona.`,
  'Sun/MC': n => `This shows up in ${n}'s career calling. The more their work reflects authentic identity, the more successful they become.`,
  'Moon/Venus': n => `This shows up in ${n}'s need for emotional comfort through beauty, pleasure, and loving relationships.`,
  'Moon/Mars': n => `This shows up in ${n}'s emotional reactions under pressure — the instinct to fight, protect, or take immediate action.`,
  'Moon/Saturn': n => `This shows up as ${n}'s emotional self-control, sometimes experienced as loneliness. Learning to express vulnerability is the growth edge.`,
  'Moon/Neptune': n => `This shows up in ${n}'s psychic sensitivity, dreams, and emotional absorption of others' feelings.`,
  'Moon/Pluto': n => `This shows up in ${n}'s emotional intensity, jealousy patterns, and need to transform through deep feeling.`,
  'Moon/ASC': n => `This shows up in how ${n} instinctively presents emotionally — whether warm, guarded, or vulnerable at first glance.`,
  'Venus/Mars': n => `This shows up in ${n}'s sexual magnetism, dating style, and the dance between pursuing and attracting.`,
  'Venus/Jupiter': n => `This shows up in ${n}'s capacity for generosity, love of luxury, and ability to attract abundance.`,
  'Venus/Saturn': n => `This shows up in ${n}'s loyal, enduring love style — and the fear that they are not enough.`,
  'Venus/Neptune': n => `This shows up in ${n}'s romantic idealism and tendency to see partners through rose-colored glasses.`,
  'Venus/Pluto': n => `This shows up in ${n}'s magnetic, intense love nature — attracting powerful connections that transform both people.`,
  'Mars/Jupiter': n => `This shows up in ${n}'s bold moves — times they take a big risk and win.`,
  'Mars/Saturn': n => `This shows up in ${n}'s capacity for grinding effort over long periods, and frustration when obstacles block progress.`,
  'Mars/Pluto': n => `This shows up in ${n}'s ruthless determination and the will to destroy what no longer serves and rebuild.`,
  'Jupiter/Saturn': n => `This shows up in ${n}'s business sense — the ability to dream big AND execute with discipline.`,
  'Saturn/Pluto': n => `This shows up in ${n}'s encounters with systems of power and the need to transform rigid structures.`,
  'North Node/MC': n => `This shows up as ${n}'s destined professional path — the career they are growing into, not trained for.`,
  'North Node/ASC': n => `This shows up as the person ${n} is becoming. Their self-presentation evolves toward this nodal direction.`,
  'Vesta/MC': n => `This shows up as ${n}'s capacity for total professional dedication — work they would do even without pay.`,
  'Juno/Venus': n => `This shows up in ${n}'s ideal partnership — the qualities they need in a committed relationship.`,
  'Chiron/Moon': n => `This shows up as ${n}'s deepest emotional wound — often rooted in childhood — and their capacity to heal others through that pain.`,
};

const HOUSE_LIFE: Record<number, (n: string) => string> = {
  1: n => `${n}, this midpoint blends into your daily self-presentation, physical vitality, and how people perceive you.`,
  2: n => `${n}, this midpoint shows up in your earning capacity, spending habits, and what you instinctively value.`,
  3: n => `${n}, this midpoint plays out through your conversations, learning habits, and sibling dynamics.`,
  4: n => `${n}, this midpoint manifests in your home environment, family patterns, and emotional atmosphere.`,
  5: n => `${n}, this midpoint shows up in your creative projects, romantic encounters, and pursuit of joy.`,
  6: n => `${n}, this midpoint manifests through your work ethic, health patterns, and daily routines.`,
  7: n => `${n}, this midpoint plays out through your closest partnerships and what you attract in others.`,
  8: n => `${n}, this midpoint shows up in intimate bonding, shared finances, and your relationship with transformation.`,
  9: n => `${n}, this midpoint manifests through travel, higher education, and your quest for bigger meaning.`,
  10: n => `${n}, this midpoint plays out through career milestones, public reputation, and legacy building.`,
  11: n => `${n}, this midpoint shows up in your friendships, community involvement, and vision for the future.`,
  12: n => `${n}, this midpoint manifests through your inner world, spiritual practices, and unconscious patterns.`,
};

// ─── Transit activation ─────────────────────────────────────────────────────
export interface TransitActivation {
  midpointKey: string;
  midpointTitle: string;
  midpointLon: number;
  transitPlanet: string;
  transitLon: number;
  aspectType: string;
  orb: number;
  intensity: 'high' | 'medium' | 'low';
  meaning: string;
}

const TRANSIT_PLANET_SPEED: Record<string, string> = {
  Sun: 'Lasts about a day.',
  Moon: 'Lasts a few hours.',
  Mercury: 'Lasts 1–2 days.',
  Venus: 'Lasts 2–3 days.',
  Mars: 'Lasts 2–3 days.',
  Jupiter: 'Lasts about a week.',
  Saturn: 'Lasts 1–2 weeks.',
  Uranus: 'Lasts several weeks.',
  Neptune: 'Lasts weeks to months.',
  Pluto: 'Lasts months.',
};

const TRANSIT_PLANET_ACTION: Record<string, string> = {
  Sun: 'illuminates and spotlights',
  Moon: 'stirs emotions around',
  Mercury: 'brings conversations and new information about',
  Venus: 'softens and attracts through',
  Mars: 'energizes and pushes action on',
  Jupiter: 'expands opportunities around',
  Saturn: 'tests and pressures',
  Uranus: 'disrupts and liberates',
  Neptune: 'dissolves boundaries around',
  Pluto: 'forces deep transformation of',
};

const ASPECT_FLAVOR: Record<string, string> = {
  Conjunction: 'merging directly with',
  Square: 'creating friction and forcing growth in',
  Opposition: 'pulling you between extremes of',
  Quincunx: 'creating an uneasy tension that demands adjustment in',
};

function stripLeadingThe(s: string): string {
  return s.startsWith('The ') ? s.slice(4) : s;
}

function buildTransitMeaning(tName: string, aspName: string, essenceData: { title: string; essence: string } | undefined, mpKey: string): string {
  const action = TRANSIT_PLANET_ACTION[tName] || 'activates';
  const flavor = ASPECT_FLAVOR[aspName] || 'activating';
  const title = essenceData ? stripLeadingThe(essenceData.title) : mpKey;
  const essence = essenceData?.essence || '';
  const speed = TRANSIT_PLANET_SPEED[tName] || '';

  const opening = `Transiting ${tName} is ${flavor} your ${title} midpoint — the place ${essence.charAt(0).toLowerCase()}${essence.slice(1)}`;
  const body = `${tName} ${action} this area of your chart right now.`;

  return `${opening} ${body} ${speed}`;
}

export function findTransitActivations(
  midpoints: MidpointResult[],
  transitPositions: any[],
): TransitActivation[] {
  const activations: TransitActivation[] = [];
  const transitOrb = 2.0;

  for (const mp of midpoints.slice(0, 30)) {
    for (const transit of transitPositions) {
      const tName = transit.name || transit.planet || '';
      const tLon = transit.longitude ?? transit.degree;
      if (tLon == null || !tName) continue;
      if (['North Node', 'South Node', 'Part of Fortune', 'Part of Spirit'].includes(tName)) continue;

      for (const asp of ASPECT_TYPES) {
        const diff = Math.abs(((mp.longitude - tLon + 540) % 360) - 180);
        const orbDist = Math.abs(diff - asp.angle);
        if (orbDist <= transitOrb) {
          const essenceData = MIDPOINT_ESSENCE[mp.key];
          const speedNote = TRANSIT_PLANET_SPEED[tName] || '';
          const intensity: 'high' | 'medium' | 'low' =
            ['Pluto', 'Saturn', 'Uranus', 'Neptune'].includes(tName) ? 'high' :
            ['Jupiter', 'Mars'].includes(tName) ? 'medium' : 'low';

          activations.push({
            midpointKey: mp.key,
            midpointTitle: essenceData?.title || `${mp.body1}/${mp.body2}`,
            midpointLon: mp.longitude,
            transitPlanet: tName,
            transitLon: tLon,
            aspectType: asp.name,
            orb: Math.round(orbDist * 100) / 100,
            intensity,
            meaning: buildTransitMeaning(tName, asp.name, essenceData, mp.key),
          });
        }
      }
    }
  }

  activations.sort((a, b) => {
    const intensityOrder = { high: 0, medium: 1, low: 2 };
    return intensityOrder[a.intensity] - intensityOrder[b.intensity] || a.orb - b.orb;
  });

  return activations;
}

// ─── Full interpretation generator ──────────────────────────────────────────
export function generateMidpointInterpretation(mp: MidpointResult, firstName: string): string {
  let text = '';
  const g1 = PLANET_GLYPHS_MP[mp.body1] || mp.body1;
  const g2 = PLANET_GLYPHS_MP[mp.body2] || mp.body2;
  const signG = ZODIAC_GLYPHS_MP[mp.sign] || '';
  const essenceData = MIDPOINT_ESSENCE[mp.key];

  if (essenceData) {
    text += `## ${g1}/${g2} ${essenceData.title}\n\n`;
  } else {
    text += `## ${g1}/${g2} ${mp.body1}/${mp.body2} Midpoint\n\n`;
  }

  text += `**A. Midpoint Essence**\n`;
  text += essenceData
    ? `${firstName}, ${essenceData.essence}\n\n`
    : `${firstName}, this is the point where ${mp.body1} and ${mp.body2} blend into a single combined force. It represents a unique synthesis that neither body alone can produce.\n\n`;

  text += `**B. Sign Expression** ${signG} ${mp.sign}\n`;
  const signExpr = SIGN_MIDPOINT_EXPRESSION[mp.sign];
  if (signExpr) text += `This midpoint ${signExpr}\n\n`;

  text += `**C. House Manifestation** — House ${mp.house}\n`;
  const houseMani = HOUSE_MIDPOINT_MANIFESTATION[mp.house];
  if (houseMani) text += `${houseMani}\n\n`;

  const duadG = ZODIAC_GLYPHS_MP[mp.duadSign] || '';
  text += `**D. Hidden Layer** ${duadG} ${mp.duadSign}\n`;
  text += `Beneath the surface, this midpoint carries a secondary filter of ${mp.duadSign} energy. `;
  const duadExpr = SIGN_MIDPOINT_EXPRESSION[mp.duadSign];
  if (duadExpr) text += `This hidden layer ${duadExpr} `;
  text += `${firstName}, this is the subconscious driver that colors how this midpoint operates when no one is watching.\n\n`;

  const compG = ZODIAC_GLYPHS_MP[mp.compendiumSign] || '';
  text += `**E. Deepest Layer** ${compG} ${mp.compendiumSign}\n`;
  text += `At the finest karmic level, this midpoint vibrates with ${mp.compendiumSign} energy. `;
  const compExpr = SIGN_MIDPOINT_EXPRESSION[mp.compendiumSign];
  if (compExpr) text += `This deepest thread ${compExpr} `;
  text += `This is the undertone that surfaces only in the most intense or vulnerable moments.\n\n`;

  if (mp.aspects.length > 0) {
    text += `**F. Aspect Activation**\n`;
    for (const asp of mp.aspects) {
      const aG = PLANET_GLYPHS_MP[asp.body] || asp.body;
      const act = ASPECT_ACTIVATION[asp.aspectType] || 'aspects';
      const aSign = getSignForLon(asp.bodyLon);
      const aSG = ZODIAC_GLYPHS_MP[aSign] || '';
      text += `- ${aG} **${asp.body}** in ${aSG} ${aSign} ${act} this midpoint (${asp.aspectType}, orb ${asp.orb}°)\n`;
    }
    text += '\n';
  } else {
    text += `**F. Aspect Activation**\nNo natal bodies activate this midpoint within the 1.5° orb. It operates as a latent potential, waiting for transits or progressions to bring it to life.\n\n`;
  }

  text += `**G. Real-Life Expression**\n`;
  const realLife = REAL_LIFE_EXAMPLES[mp.key];
  text += realLife ? realLife(firstName) : (HOUSE_LIFE[mp.house]?.(firstName) || `${firstName}, this midpoint represents a subtle blending of ${mp.body1} and ${mp.body2} energies in House ${mp.house}.`);
  text += '\n\n';

  text += `---\n**Ruler:** ${mp.signRuler}`;
  if (mp.rulerLon !== null) {
    const rSG = ZODIAC_GLYPHS_MP[mp.rulerSign] || '';
    text += ` in ${rSG} ${mp.rulerSign}, House ${mp.rulerHouse}`;
  }
  text += '\n';

  return text;
}

// ─── AI prompt builder ──────────────────────────────────────────────────────
export function buildMidpointAIPrompt(midpoints: MidpointResult[], firstName: string): string {
  const top = midpoints.slice(0, 10);
  const themeCount: Record<string, number> = {};
  for (const mp of top) {
    for (const t of mp.themes) {
      themeCount[t] = (themeCount[t] || 0) + 1;
    }
  }
  const dominantTheme = Object.entries(themeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'identity';
  const clusterLabel = THEME_CLUSTERS[dominantTheme]?.label || 'Identity';

  const mpList = top.map((mp, i) => {
    const e = MIDPOINT_ESSENCE[mp.key];
    return `${i + 1}. ${mp.key} "${e?.title || mp.key}" in ${mp.sign} H${mp.house} (strength ${mp.strengthScore}/20, ${mp.aspects.length} activations)`;
  }).join('\n');

  return `You are an expert astrologer writing a deeply personal midpoint synthesis for ${firstName}.

Their top 10 midpoints by importance:
${mpList}

Dominant life theme: ${clusterLabel}

Write a 3-paragraph "Midpoint Signature" reading:
1. Open with their most powerful midpoint and what it says about their core nature
2. Describe how their midpoint pattern creates a unique psychological fingerprint — what drives them, what they struggle with, what they're evolving toward
3. Close with practical advice: how to work WITH their midpoint signature instead of against it

Style: warm, direct, personal. Use ${firstName}'s name. No generic filler. Every sentence should feel like it could only apply to THIS person with THIS chart. No bullet points — flowing paragraphs only.`;
}

// ─── Master calculation function ────────────────────────────────────────────
export function calculateAllMidpoints(chartPositions: any[], ascLon: number): MidpointResult[] {
  const ascSign = getSignForLon(ascLon);
  const results: MidpointResult[] = [];

  for (let i = 0; i < ALL_BODIES.length; i++) {
    for (let j = i + 1; j < ALL_BODIES.length; j++) {
      const b1 = ALL_BODIES[i];
      const b2 = ALL_BODIES[j];
      const lon1 = getLon(chartPositions, b1);
      const lon2 = getLon(chartPositions, b2);
      if (lon1 === null || lon2 === null) continue;

      const midLon = calcMidpoint(lon1, lon2);
      const sign = getSignForLon(midLon);
      const degInSign = getDegreeInSign(midLon);
      const house = getHouseForLon(midLon, ascLon);
      const dc = analyzeDuadCompendium(midLon, ascSign);
      const signRuler = RULERS[sign] || sign;
      const rulerLon = getLon(chartPositions, signRuler);
      const rulerSign = rulerLon !== null ? getSignForLon(rulerLon) : '';
      const rulerHouse = rulerLon !== null ? getHouseForLon(rulerLon, ascLon) : 1;

      const key = `${b1}/${b2}`;
      const reverseKey = `${b2}/${b1}`;
      const hasEssence = MIDPOINT_ESSENCE[key];
      const hasReverse = MIDPOINT_ESSENCE[reverseKey];
      const useReverse = !hasEssence && hasReverse;
      const finalKey = useReverse ? reverseKey : key;
      const finalBody1 = useReverse ? b2 : b1;
      const finalBody2 = useReverse ? b1 : b2;
      const priority = Math.min(getPriority(key), getPriority(reverseKey));

      const aspects = findAspectsToMidpoint(midLon, chartPositions, [b1, b2]);
      const themes = classifyThemes(finalBody1, finalBody2);

      const mp: MidpointResult = {
        key: finalKey,
        body1: finalBody1,
        body2: finalBody2,
        longitude: midLon,
        sign,
        degreeInSign: degInSign,
        house,
        duadSign: dc.duadSign,
        compendiumSign: dc.compendiumSign,
        signRuler,
        rulerLon,
        rulerSign,
        rulerHouse,
        aspects,
        priority,
        strengthScore: 0,
        themes,
      };
      mp.strengthScore = calcStrengthScore(mp);
      results.push(mp);
    }
  }

  results.sort((a, b) => a.priority - b.priority);
  return results;
}

// ─── Group midpoints by theme ───────────────────────────────────────────────
export function groupByTheme(midpoints: MidpointResult[]): Record<string, MidpointResult[]> {
  const groups: Record<string, MidpointResult[]> = {};
  for (const [key] of Object.entries(THEME_CLUSTERS)) {
    groups[key] = [];
  }
  for (const mp of midpoints) {
    const primaryTheme = mp.themes[0] || 'identity';
    if (!groups[primaryTheme]) groups[primaryTheme] = [];
    groups[primaryTheme].push(mp);
  }
  return groups;
}

// ─── Format degree ──────────────────────────────────────────────────────────
export function formatDegreeMp(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.round((deg - d) * 60);
  return `${d}°${m.toString().padStart(2, '0')}'`;
}
