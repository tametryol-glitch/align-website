'use client';

import { useState, useCallback, useMemo } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { ArrowLeft, Sparkles, ChevronDown, ChevronUp, RotateCcw, Copy, Check } from 'lucide-react';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { PaywallGate } from '@/components/ui/PaywallGate';
import { PLANET_GLYPHS } from '@/lib/transitData';
import { getFullDuadCompendium } from '@/lib/engines/duadCompendium';

// ─── Zodiac Glyphs ──────────────────────────────────────────────────────────
const ZODIAC_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

// ─── Types ───────────────────────────────────────────────────────────────────

type BodyKind = 'planet' | 'luminary' | 'asteroid' | 'point' | 'node' | 'angle';

interface SecondHouseBody {
  name: string;
  kind: BodyKind;
  sign: string;
  longitude: number;
  house: number;
}

interface ConjunctionModifier {
  anchor: string;
  conjunct: string;
  orb: number;
  label: string;
  effect: string;
}

interface PrecisionLayer {
  body: string;
  longitude: number;
  surfaceSign: string;
  hiddenSign: string;
  hiddenTheme: string;
  deepestSign: string;
  deepestTheme: string;
}

interface WealthEquation {
  second_house_sign: string;
  second_house_ruler: string;
  second_ruler_placement: { sign: string; house: number };
  second_house_planets: string[];
  second_house_asteroids: string[];
  second_house_bodies: SecondHouseBody[];
  ruler_chain: { body?: string; planet?: string; sign: string; house: number }[];
  final_dispositor: string | null;
  loop_detected: boolean;
  repeated_signs: Record<string, number>;
  repeated_houses: Record<string, number>;
  repeated_bodies: Record<string, number>;
  conjunction_modifiers: ConjunctionModifier[];
  precision_layers: PrecisionLayer[];
}

interface Pathway {
  id: string;
  rank: number;
  title: string;
  score: number;
  raw_score: number;
  reasons: string[];
  monetization: string[];
  environments: string[];
}

interface Reading {
  wealth_equation_text: string;
  what_creates_wealth_text: string;
  top_5_text: string;
  blockages_text: string | string[];
  activation_text: string | string[];
  main_abundance_unlock: string;
  main_karmic_trap: string;
}

interface PathwayResponse {
  wealth_equation: WealthEquation;
  pathways: Pathway[];
  reading: Reading;
}

// ─── CopyButton component ──────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary mt-2"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ─── Markdown Renderer ──────────────────────────────────────────────────────

function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('## ')) {
          return <h2 key={i} className="text-lg font-display font-bold text-amber-400 mt-6 mb-2">{trimmed.replace('## ', '')}</h2>;
        }
        if (trimmed.startsWith('### ')) {
          return <h3 key={i} className="text-base font-semibold text-text-primary mt-4 mb-1">{trimmed.replace('### ', '')}</h3>;
        }
        if (trimmed.startsWith('---')) {
          return <hr key={i} className="border-border-primary my-4" />;
        }
        if (trimmed.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 pl-2 mb-1">
              <span className="text-amber-400">•</span>
              <span className="text-text-secondary text-sm flex-1"><InlineFormat text={trimmed.slice(2)} /></span>
            </div>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+)\.\s(.*)/);
          return (
            <div key={i} className="flex gap-2 pl-2 mb-1">
              <span className="text-amber-400 w-5">{match ? match[1] + '.' : ''}</span>
              <span className="text-text-secondary text-sm flex-1"><InlineFormat text={match ? match[2] : trimmed} /></span>
            </div>
          );
        }
        if (trimmed.length > 0) {
          return <p key={i} className="text-text-secondary text-sm leading-relaxed mb-1"><InlineFormat text={trimmed} /></p>;
        }
        return <div key={i} className="h-2" />;
      })}
    </>
  );
}

function InlineFormat({ text }: { text: string }) {
  const parts: (string | JSX.Element)[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(<strong key={match.index} className="font-bold text-text-primary">{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <>{parts.length > 0 ? parts : text}</>;
}

// ─── Local Pathway Calculation Engine ────────────────────────────────────────

const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Vesta', Libra: 'Juno', Scorpio: 'Pluto',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
};

const PATHWAY_TEMPLATES: { id: string; title: string; triggers: Record<string, number>; monetization: string[]; environments: string[] }[] = [
  { id: 'creative-arts', title: 'Creative Arts & Performance', triggers: { Venus: 3, Neptune: 2, Sun: 2, Moon: 1, Leo: 2, Libra: 2, Pisces: 2, '5': 3, '10': 1 }, monetization: ['Content Creation', 'Freelance Art/Design', 'Performance & Shows', 'Teaching Workshops'], environments: ['Studios', 'Stage & Live Events', 'Online Platforms', 'Creative Agencies'] },
  { id: 'healing-wellness', title: 'Healing & Wellness', triggers: { Neptune: 3, Chiron: 3, Moon: 2, Pluto: 1, Pisces: 2, Virgo: 2, Scorpio: 1, '6': 3, '8': 2, '12': 2 }, monetization: ['Private Practice', 'Wellness Products', 'Online Coaching', 'Retreats & Workshops'], environments: ['Clinics & Studios', 'Retreat Centers', 'Online Telehealth', 'Spas & Wellness Centers'] },
  { id: 'tech-innovation', title: 'Technology & Innovation', triggers: { Uranus: 3, Mercury: 2, Saturn: 1, Aquarius: 3, Gemini: 1, '11': 3, '3': 2, '9': 1 }, monetization: ['SaaS Products', 'Consulting', 'App Development', 'Tech Education'], environments: ['Startups', 'Remote/Digital Nomad', 'Research Labs', 'Tech Hubs'] },
  { id: 'business-leadership', title: 'Business Leadership & Entrepreneurship', triggers: { Saturn: 3, Jupiter: 2, Sun: 2, Mars: 2, Capricorn: 3, Aries: 1, Leo: 1, '10': 3, '1': 2, '2': 1 }, monetization: ['Company Ownership', 'Management Consulting', 'Executive Coaching', 'Franchise Operations'], environments: ['Corporate Offices', 'Boardrooms', 'Networking Events', 'Industry Conferences'] },
  { id: 'communication-media', title: 'Communication & Media', triggers: { Mercury: 3, Jupiter: 2, Uranus: 1, Gemini: 3, Sagittarius: 1, '3': 3, '9': 2, '11': 1 }, monetization: ['Writing & Publishing', 'Podcasting', 'Social Media Management', 'Public Speaking'], environments: ['Media Companies', 'Publishing Houses', 'Online Platforms', 'Universities'] },
  { id: 'finance-wealth', title: 'Finance & Wealth Management', triggers: { Saturn: 2, Jupiter: 3, Pluto: 2, Venus: 1, Taurus: 3, Capricorn: 1, Scorpio: 2, '2': 3, '8': 3 }, monetization: ['Investment Advisory', 'Real Estate', 'Financial Planning', 'Trading'], environments: ['Financial Districts', 'Banks & Institutions', 'Real Estate Markets', 'Remote Analysis'] },
  { id: 'education-teaching', title: 'Education & Teaching', triggers: { Jupiter: 3, Mercury: 2, Moon: 1, Saturn: 1, Sagittarius: 3, Gemini: 1, '9': 3, '3': 2 }, monetization: ['Course Creation', 'Tutoring & Mentoring', 'Academic Writing', 'Consulting'], environments: ['Universities', 'Online Learning Platforms', 'Training Centers', 'Think Tanks'] },
  { id: 'service-advocacy', title: 'Service & Advocacy', triggers: { Neptune: 2, Moon: 2, Jupiter: 1, Chiron: 2, Pisces: 1, Cancer: 2, '12': 2, '4': 2, '7': 1 }, monetization: ['Non-Profit Leadership', 'Social Work', 'Counseling', 'Community Organizing'], environments: ['Community Centers', 'NGOs', 'Government Agencies', 'Hospitals'] },
  { id: 'sports-physical', title: 'Athletics & Physical Mastery', triggers: { Mars: 3, Sun: 2, Jupiter: 1, Aries: 3, Leo: 1, Scorpio: 1, '1': 3, '6': 2 }, monetization: ['Competing', 'Personal Training', 'Sports Coaching', 'Brand Sponsorships'], environments: ['Gyms & Training Facilities', 'Sports Arenas', 'Outdoor Adventure', 'Fitness Platforms'] },
  { id: 'occult-astrology', title: 'Astrology & Mystical Arts', triggers: { Neptune: 2, Pluto: 2, Uranus: 2, Moon: 1, Scorpio: 2, Pisces: 2, Aquarius: 1, '8': 3, '12': 2, '9': 1 }, monetization: ['Consultation', 'Course Creation', 'Writing & Publishing', 'App Development'], environments: ['Home Office', 'Online Platforms', 'Spiritual Communities', 'Retreat Settings'] },
  { id: 'real-estate-property', title: 'Real Estate & Property', triggers: { Saturn: 2, Moon: 2, Venus: 1, Jupiter: 1, Cancer: 3, Taurus: 2, Capricorn: 1, '4': 3, '2': 2 }, monetization: ['Property Investment', 'Interior Design', 'Property Management', 'Renovation & Flipping'], environments: ['Housing Markets', 'Architectural Firms', 'Development Companies', 'Home Staging'] },
  { id: 'law-justice', title: 'Law & Justice', triggers: { Saturn: 3, Jupiter: 2, Pluto: 1, Mars: 1, Libra: 3, Capricorn: 1, '7': 2, '9': 2, '10': 2 }, monetization: ['Legal Practice', 'Mediation', 'Compliance Consulting', 'Legal Writing'], environments: ['Law Firms', 'Courts', 'Corporate Legal', 'Government'] },
];

const SECOND_HOUSE_WHITELIST: Record<string, BodyKind> = {
  Sun: 'luminary', Moon: 'luminary',
  Mercury: 'planet', Venus: 'planet', Mars: 'planet',
  Jupiter: 'planet', Saturn: 'planet',
  Uranus: 'planet', Neptune: 'planet', Pluto: 'planet',
  Chiron: 'asteroid',
  Vesta: 'asteroid', Juno: 'asteroid', Ceres: 'asteroid', Pallas: 'asteroid',
  Lilith: 'asteroid',
  'Part of Fortune': 'point', 'Part of Spirit': 'point',
  'North Node': 'node', 'South Node': 'node',
};

const LUMINARIES = new Set(['Sun', 'Moon']);
const ANGLES = new Set(['Ascendant', 'MC', 'Descendant', 'IC']);
const ASTEROIDS = new Set(['Chiron', 'Vesta', 'Juno', 'Ceres', 'Pallas', 'Lilith']);

function pairKey(a: string, b: string): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function conjunctionOrb(a: string, b: string): number {
  if (LUMINARIES.has(a) || LUMINARIES.has(b) || ANGLES.has(a) || ANGLES.has(b)) return 8;
  const minor = (n: string) => ASTEROIDS.has(n) || n === 'North Node' || n === 'South Node' || n === 'Part of Fortune' || n === 'Part of Spirit';
  if (minor(a) && minor(b)) return 3;
  return 5;
}

function shortestArc(a: number, b: number): number {
  let d = Math.abs(((a - b + 540) % 360) - 180);
  d = 180 - d;
  return d;
}

const CONJUNCTION_MODIFIERS: Record<string, string> = {
  'Jupiter-Sun': 'magnifies visibility and generous reach — your work scales when you expand publicly',
  'Pluto-Sun': 'forges a leadership signature built on depth, rebirth, and refusing shallow ambition',
  'Saturn-Sun': 'tempers authority through discipline — you earn trust by outlasting, not outshining',
  'Sun-Uranus': 'marks you as the unconventional authority — the path only works when you lead differently',
  'Neptune-Sun': 'weaves imagination into identity — your work carries an aesthetic or spiritual signature others cannot fake',
  'Jupiter-Moon': 'turns emotional attunement into a resource — audiences, clients, or communities feel held by your presence',
  'Moon-Saturn': 'grounds emotional intelligence in structure — your craft is steady, slow-built, and deeply reliable',
  'Moon-Pluto': 'channels psychological penetration into your work — you see what others miss, and that sight has market value',
  'Moon-Neptune': 'bridges the subconscious and the practical — your intuition reads fields before they articulate themselves',
  'Chiron-Moon': 'transforms old emotional wounds into a healing vocation — your sensitivity is the product',
  'Jupiter-Mercury': 'gives voice and scope — teaching, writing, or publishing is not optional, it is the vehicle',
  'Mercury-Saturn': 'disciplines the mind into mastery — your writing, analysis, or craft gains weight because it is precise',
  'Mercury-Uranus': 'wires your thinking for breakthrough — the path requires originality, not polish',
  'Mercury-Neptune': 'blurs logic into imagination — your best work is where data meets vision',
  'Mercury-Pluto': 'turns communication into investigation — research, forensic insight, and narrative power are yours',
  'Jupiter-Venus': 'amplifies aesthetic and relational magnetism — luxury, beauty, or partnership are wealth channels',
  'Saturn-Venus': 'builds lasting value through restraint — your taste becomes an asset because it does not chase trends',
  'Uranus-Venus': 'makes your aesthetic future-facing — what feels strange now will look obvious later',
  'Neptune-Venus': 'pours imagination into beauty and relationship — your gift is mood, atmosphere, and emotional resonance',
  'Pluto-Venus': 'transforms desire into power — you do magnetic, sometimes taboo, work around value and intimacy',
  'Chiron-Venus': 'monetizes relational healing — your wound around worth becomes the teaching others pay for',
  'Jupiter-Mars': 'fuels bold, expansive action — entrepreneurship and decisive moves are the engine',
  'Mars-Saturn': 'compresses raw drive into sustained execution — you out-work, out-last, and out-build',
  'Mars-Uranus': 'makes you the disruptor — your path requires independence and invention, not compliance',
  'Mars-Neptune': 'fuses action with vision — physical, artistic, or spiritual work where effort is guided by imagery',
  'Mars-Pluto': 'concentrates raw power — high-stakes, transformational, or shadow-adjacent work suits you',
  'Chiron-Mars': 'turns frustration into advocacy — the wound around agency becomes the drive to free others',
  'Jupiter-Saturn': 'balances expansion and structure — you build things that grow and endure',
  'Jupiter-Uranus': 'opens sudden opportunities — your breakthroughs arrive in leaps, not steps',
  'Jupiter-Neptune': 'inflates vision and meaning — you succeed as a conduit for collective imagination',
  'Jupiter-Pluto': 'points to large-scale influence — power, wealth, or reach on a generational scale',
  'Chiron-Jupiter': 'turns your own healing journey into a body of teaching that scales',
  'Saturn-Uranus': 'ties innovation to discipline — you make the radical idea reliably work',
  'Neptune-Saturn': 'grounds spiritual vision in craft — your work is both mystical and meticulously built',
  'Pluto-Saturn': 'builds authority through crisis and rebuild — you become the one who leads through transformation',
  'Chiron-Saturn': 'turns mastery into medicine — your discipline heals because it refuses shortcuts',
  'Pluto-Uranus': 'places you at a fault line of cultural transformation — your generation signature is itself a resource',
  'Neptune-Uranus': 'fuses intuition and innovation — you invent the new by seeing what is already forming',
  'Neptune-Pluto': 'accesses archetypal depth — your work reaches the collective unconscious through imagery, ritual, or myth',
  'Chiron-Neptune': 'transmutes suffering into sacred craft — artistic, healing, or contemplative vocation',
  'Chiron-Pluto': 'makes you the alchemist — you do the deep repair work that others cannot enter safely',
  'Sun-Vesta': 'marks you as a devoted craftsman — single-pointed focus is the career, not a trait',
  'Juno-Venus': 'binds partnership to value creation — business-marriage, creative duos, or client work are primary',
  'Mercury-Pallas': 'sharpens strategic pattern-recognition — analysis, consulting, or systems thinking are the craft',
  'Ceres-Moon': 'grounds nurture in vocation — food, care work, motherhood economies, or agricultural wealth',
  'Chiron-Sun': 'makes your core identity the vehicle of healing — the wound is the work',
};

function calculateLocalPathways(chart: any, profile: any): PathwayResponse {
  const planets = chart?.planets || chart?.positions || [];
  const name = (profile?.display_name || '').split(' ')[0] || 'Friend';

  const planetMap: Record<string, { sign: string; house: number; longitude: number }> = {};
  for (const p of planets) {
    if (p.name) {
      planetMap[p.name] = { sign: p.sign || '', house: p.house || 0, longitude: p.longitude || 0 };
    }
  }

  const ascSign = planetMap['Ascendant']?.sign || '';
  const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const secondHouseSign = (() => {
    const ascIdx = signs.indexOf(ascSign);
    if (ascIdx < 0) return '';
    return signs[(ascIdx + 1) % 12];
  })();
  const secondHouseRuler = SIGN_RULERS[secondHouseSign] || '';

  // Build ruler chain (dispositor chain from 2nd house)
  const rulerChain: { body: string; sign: string; house: number }[] = [];
  const visited = new Set<string>();
  let current = secondHouseRuler;
  let loopDetected = false;
  let finalDispositor: string | null = null;

  for (let i = 0; i < 10; i++) {
    if (!current || visited.has(current)) {
      if (visited.has(current)) loopDetected = true;
      break;
    }
    visited.add(current);
    const pd = planetMap[current];
    const sign = pd?.sign || '';
    const house = pd?.house || 0;
    rulerChain.push({ body: current, sign, house });
    const rulerOfSign = SIGN_RULERS[sign] || '';
    if (rulerOfSign === current) {
      finalDispositor = current;
      break;
    }
    current = rulerOfSign;
  }

  // Find bodies in 2nd house
  const secondHouseBodies: SecondHouseBody[] = [];
  for (const p of planets) {
    if (!p?.name || p.house !== 2) continue;
    const kind = SECOND_HOUSE_WHITELIST[p.name];
    if (!kind) continue;
    secondHouseBodies.push({ name: p.name, kind, sign: p.sign || '', longitude: p.longitude || 0, house: 2 });
  }
  const secondHousePlanets = secondHouseBodies.filter(b => b.kind === 'planet' || b.kind === 'luminary').map(b => b.name);
  const secondHouseAsteroidNames = secondHouseBodies.filter(b => b.kind === 'asteroid' || b.kind === 'point' || b.kind === 'node').map(b => b.name);

  // Conjunction scan
  const anchorNames = new Set<string>([
    ...rulerChain.map(l => l.body),
    ...secondHouseBodies.map(b => b.name),
  ]);
  const conjunctionModifiers: ConjunctionModifier[] = [];
  const seenPairKeys = new Set<string>();
  for (const anchor of planets) {
    if (!anchor?.name || !anchorNames.has(anchor.name)) continue;
    for (const other of planets) {
      if (!other?.name || other.name === anchor.name) continue;
      const key = pairKey(anchor.name, other.name);
      if (seenPairKeys.has(key)) continue;
      const orbLimit = conjunctionOrb(anchor.name, other.name);
      const arc = shortestArc(anchor.longitude || 0, other.longitude || 0);
      if (arc > orbLimit) continue;
      seenPairKeys.add(key);
      const curatedText = CONJUNCTION_MODIFIERS[key];
      const effect = curatedText
        ? `Because your ${anchor.name} sits conjunct ${other.name}, your pathway ${curatedText}.`
        : `Your ${anchor.name} is fused with ${other.name} — treat them as a single signature: wherever ${anchor.name} shows up in your work, ${other.name}'s quality is present too.`;
      conjunctionModifiers.push({ anchor: anchor.name, conjunct: other.name, orb: Math.round(arc * 10) / 10, label: key, effect });
    }
  }
  conjunctionModifiers.sort((a, b) => a.orb - b.orb);

  // Duad & Compendium
  const rulerData = planetMap[secondHouseRuler];
  const rulerDeg = rulerData?.longitude ? (rulerData.longitude % 30) : 0;
  const rulerSign = rulerData?.sign || '';

  function calcDuad(degree: number, sign: string) {
    const signIdx = signs.indexOf(sign);
    if (signIdx < 0) return { duadSign: sign, duadDegree: 0 };
    const degInSign = degree % 30;
    const duadIndex = Math.floor(degInSign / 2.5);
    const duadSign = signs[(signIdx + duadIndex) % 12];
    const duadDegree = ((degInSign % 2.5) / 2.5) * 30;
    return { duadSign, duadDegree };
  }

  function calcCompendium(duadDegree: number, duadSign: string) {
    const signIdx = signs.indexOf(duadSign);
    if (signIdx < 0) return { compSign: duadSign, compDegree: 0 };
    const compIndex = Math.floor(duadDegree / 2.5);
    const compSign = signs[(signIdx + compIndex) % 12];
    const compDegree = ((duadDegree % 2.5) / 2.5) * 30;
    return { compSign, compDegree };
  }

  const duad = calcDuad(rulerDeg, rulerSign);
  const compendium = calcCompendium(duad.duadDegree, duad.duadSign);
  const duadRuler = SIGN_RULERS[duad.duadSign] || '';
  const compRuler = SIGN_RULERS[compendium.compSign] || '';

  const SIGN_THEMES: Record<string, string> = {
    Aries: 'bold initiative and pioneering action', Taurus: 'tangible value creation and steady accumulation',
    Gemini: 'communication, ideas, and intellectual agility', Cancer: 'nurturing, emotional intelligence, and caretaking',
    Leo: 'creative self-expression and generous leadership', Virgo: 'precision, service, and sacred craftsmanship',
    Libra: 'partnership, beauty, and strategic diplomacy', Scorpio: 'transformation, deep research, and hidden power',
    Sagittarius: 'expansion, teaching, and philosophical vision', Capricorn: 'discipline, structure, and institutional mastery',
    Aquarius: 'innovation, technology, and humanitarian networks', Pisces: 'intuition, spiritual gifts, and creative imagination',
  };

  // Score pathways
  const scoredPathways = PATHWAY_TEMPLATES.map(tmpl => {
    let score = 0;
    const reasons: string[] = [];
    for (const p of planets) {
      if (!p.name || !p.sign) continue;
      if (tmpl.triggers[p.name]) { score += tmpl.triggers[p.name] * 4; reasons.push(`${p.name} in ${p.sign} supports this path`); }
      if (tmpl.triggers[p.sign]) { score += tmpl.triggers[p.sign] * 2; }
      if (p.house && tmpl.triggers[String(p.house)]) {
        score += tmpl.triggers[String(p.house)] * 3;
        if (tmpl.triggers[p.name]) reasons.push(`${p.name} in House ${p.house} amplifies this pathway`);
      }
    }
    if (tmpl.triggers[secondHouseRuler]) { score += 8; reasons.push(`Your 2nd house ruler ${secondHouseRuler} directly activates this wealth path`); }
    const mcSign = planetMap['MC']?.sign || '';
    const mcRuler = SIGN_RULERS[mcSign] || '';
    if (tmpl.triggers[mcRuler]) { score += 6; reasons.push(`Your career ruler (${mcRuler}) aligns with this pathway`); }
    if (duadRuler && tmpl.triggers[duadRuler]) { score += tmpl.triggers[duadRuler] * 3; reasons.push(`Your deeper wealth layer through ${duad.duadSign} reinforces this path`); }
    if (duad.duadSign && tmpl.triggers[duad.duadSign]) { score += tmpl.triggers[duad.duadSign] * 2; }
    if (compRuler && tmpl.triggers[compRuler]) { score += tmpl.triggers[compRuler] * 2; reasons.push(`Your innermost prosperity signature through ${compendium.compSign} supports this path`); }
    if (compendium.compSign && tmpl.triggers[compendium.compSign]) { score += tmpl.triggers[compendium.compSign] * 1; }
    return { ...tmpl, score, reasons: reasons.slice(0, 5) };
  });

  scoredPathways.sort((a, b) => b.score - a.score);
  const maxScore = scoredPathways[0]?.score || 1;

  const top5: Pathway[] = scoredPathways.slice(0, 5).map((p, i) => ({
    id: p.id, title: p.title, score: Math.round((p.score / maxScore) * 100), raw_score: p.score, rank: i + 1,
    reasons: p.reasons.length > 0 ? p.reasons : [`Your chart energy naturally aligns with ${p.title}`],
    monetization: p.monetization, environments: p.environments,
  }));

  const topPath = top5[0];
  const duadTheme = SIGN_THEMES[duad.duadSign] || 'hidden potential';
  const compTheme = SIGN_THEMES[compendium.compSign] || 'deeper gifts';
  const wealthText = `${name}, with ${secondHouseSign} on your 2nd house cusp and ${secondHouseRuler} as your wealth ruler, your prosperity flows through ${secondHouseRuler === 'Venus' ? 'beauty, relationships, and creative value' : secondHouseRuler === 'Mars' ? 'bold action, entrepreneurship, and competitive drive' : secondHouseRuler === 'Jupiter' ? 'expansion, teaching, and generous vision' : secondHouseRuler === 'Saturn' ? 'discipline, structure, and long-term strategy' : secondHouseRuler === 'Mercury' ? 'communication, ideas, and intellectual agility' : secondHouseRuler === 'Moon' ? 'nurturing, emotional intelligence, and caring for others' : secondHouseRuler === 'Sun' ? 'self-expression, leadership, and creative confidence' : secondHouseRuler === 'Pluto' ? 'transformation, deep insight, and strategic power' : secondHouseRuler === 'Neptune' ? 'intuition, spirituality, and creative vision' : secondHouseRuler === 'Uranus' ? 'innovation, technology, and unconventional approaches' : 'your unique planetary gifts'}. At a deeper level, your wealth ruler carries a hidden layer of ${duadTheme}, and at the innermost level, a thread of ${compTheme} — these deeper signatures refine exactly how your prosperity manifests.`;

  const blockages = [
    loopDetected ? `Your cyclical dispositor pattern means wealth can feel like it circulates without accumulating — break the loop by focusing on your top pathway.` : `Avoid scattering your energy across too many ventures at once.`,
    `When ${secondHouseRuler} is under pressure from transits, resist the urge to make impulsive financial decisions.`,
    `Your chart suggests a tendency to undervalue your natural gifts — charge what you are worth.`,
  ];

  const activationSteps = [
    `Focus your primary energy on ${topPath.title} — this is where your chart concentrates the most wealth potential.`,
    `Create a daily practice that activates your ${secondHouseRuler} energy — this is the engine of your prosperity.`,
    `Build in environments that match your chart: ${topPath.environments.slice(0, 2).join(' and ')}.`,
    `Use ${top5[1]?.title || 'your secondary pathway'} as a support structure, not a replacement for your primary path.`,
  ];

  // Precision layers
  const precisionLayers: PrecisionLayer[] = [];
  const precisionCandidates = [
    planetMap[secondHouseRuler] ? { name: secondHouseRuler, longitude: planetMap[secondHouseRuler].longitude, sign: planetMap[secondHouseRuler].sign } : null,
    ...secondHouseBodies.map(b => ({ name: b.name, longitude: b.longitude, sign: b.sign })),
  ].filter((x): x is { name: string; longitude: number; sign: string } => !!x);
  const precisionSeen = new Set<string>();
  for (const c of precisionCandidates) {
    if (precisionSeen.has(c.name)) continue;
    precisionSeen.add(c.name);
    const layer = getFullDuadCompendium(c.longitude, ascSign);
    precisionLayers.push({
      body: c.name, longitude: c.longitude, surfaceSign: layer.sign,
      hiddenSign: layer.duadSign, hiddenTheme: layer.hiddenTheme,
      deepestSign: layer.compendiumSign, deepestTheme: layer.deepestTheme,
    });
  }

  return {
    wealth_equation: {
      second_house_sign: secondHouseSign, second_house_ruler: secondHouseRuler,
      second_ruler_placement: planetMap[secondHouseRuler] || { sign: '', house: 0 },
      second_house_planets: secondHousePlanets, second_house_asteroids: secondHouseAsteroidNames,
      second_house_bodies: secondHouseBodies, ruler_chain: rulerChain,
      final_dispositor: finalDispositor, loop_detected: loopDetected,
      repeated_signs: {}, repeated_houses: {}, repeated_bodies: {},
      conjunction_modifiers: conjunctionModifiers, precision_layers: precisionLayers,
    },
    pathways: top5,
    reading: {
      wealth_equation_text: wealthText, what_creates_wealth_text: wealthText,
      top_5_text: `Your top pathway is ${topPath.title} with a score of ${topPath.score}/100. ${topPath.reasons[0] || ''}`,
      blockages_text: blockages, activation_text: activationSteps,
      main_abundance_unlock: `${name}, your greatest abundance unlock is aligning fully with ${topPath.title}. When you channel your ${secondHouseRuler} energy through this pathway, money stops being something you chase and becomes something that flows to you naturally.`,
      main_karmic_trap: `Beware of ${loopDetected ? 'the cyclical pattern in your chart that makes you feel busy without building real wealth' : 'spreading yourself too thin'}. Your chart is designed for depth, not breadth. The temptation to dabble in every opportunity is the trap — mastery of your primary pathway is the key.`,
    },
  };
}

// ─── AI Deep Reading Generator ───────────────────────────────────────────────

function generateAiReading(data: PathwayResponse, firstName: string): string {
  const eq = data.wealth_equation;
  const topPath = data.pathways[0];
  const secondPath = data.pathways[1];
  const thirdPath = data.pathways[2];

  const SIGN_THEMES_READING: Record<string, string> = {
    Aries: 'bold initiative and pioneering action', Taurus: 'tangible value creation and steady accumulation',
    Gemini: 'communication, ideas, and intellectual agility', Cancer: 'nurturing, emotional intelligence, and caretaking',
    Leo: 'creative self-expression and generous leadership', Virgo: 'precision, service, and sacred craftsmanship',
    Libra: 'partnership, beauty, and strategic diplomacy', Scorpio: 'transformation, deep research, and hidden power',
    Sagittarius: 'expansion, teaching, and philosophical vision', Capricorn: 'discipline, structure, and institutional mastery',
    Aquarius: 'innovation, technology, and humanitarian networks', Pisces: 'intuition, spiritual gifts, and creative imagination',
  };

  let reading = `## Your Wealth Blueprint\n\n`;
  reading += `${firstName}, your chart reveals a powerful and specific wealth signature. `;
  reading += `With **${eq.second_house_sign}** governing your 2nd house of earned income and **${eq.second_house_ruler}** as your wealth ruler, `;
  reading += `you are wired to build prosperity in a very particular way.\n\n`;
  reading += `## The Wealth Equation\n\n`;
  reading += `Your 2nd house ruler ${eq.second_house_ruler} sits in **${eq.second_ruler_placement?.sign || 'your chart'}** `;
  if (eq.second_ruler_placement?.house) {
    reading += `(House ${eq.second_ruler_placement.house}), `;
  }
  reading += `creating a direct link between your earning potential and `;
  reading += `${eq.second_ruler_placement?.house === 10 ? 'your career and public reputation' : eq.second_ruler_placement?.house === 1 ? 'your personal identity and self-expression' : eq.second_ruler_placement?.house === 7 ? 'partnerships and client relationships' : eq.second_ruler_placement?.house === 5 ? 'creative projects and speculative ventures' : eq.second_ruler_placement?.house === 9 ? 'higher learning, publishing, and international connections' : eq.second_ruler_placement?.house === 11 ? 'community, networks, and future vision' : eq.second_ruler_placement?.house === 3 ? 'communication, writing, and local connections' : 'the area of life where this energy concentrates'}.\n\n`;

  const deeperTheme = SIGN_THEMES_READING[eq.second_house_sign] || '';
  if (eq.second_house_sign && data.reading.what_creates_wealth_text) {
    reading += `### The Hidden Layer of Your Wealth Signature\n\n`;
    reading += `${firstName}, beneath the surface of your ${eq.second_house_ruler} wealth ruler lies a deeper pattern. Your wealth energy carries a hidden undercurrent that refines how money actually shows up for you. This deeper layer pulls toward ${deeperTheme}, meaning your most profitable opportunities will have this quality woven into them — even when the surface looks completely different.\n\n`;
    reading += `At the innermost level, there is yet another thread — a quiet but powerful influence that shapes the *texture* of your abundance. When you honor all three layers of your wealth signature, you stop chasing money and start attracting it.\n\n`;
  }

  if (eq.loop_detected) {
    reading += `Your dispositor chain forms a **cyclical pattern**, which means your wealth energy naturally recirculates. The key is to find the point in the cycle where you can extract value — and that point is **${topPath.title}**.\n\n`;
  } else if (eq.final_dispositor) {
    reading += `Your dispositor chain ends at **${eq.final_dispositor}** — this is your ultimate power planet. Everything in your wealth equation eventually answers to ${eq.final_dispositor}. When this planet is well-supported by transits, your earning potential amplifies dramatically.\n\n`;
  }

  reading += `## Your Golden Ticket: ${topPath.title}\n\n`;
  reading += `${firstName}, your number one pathway scored **${topPath.score}/100**. This is not a suggestion — this is where your chart concentrates the most wealth-building energy.\n\n`;
  reading += topPath.reasons.map(r => `- ${r}`).join('\n');
  reading += `\n\nThe best monetization methods for you: **${topPath.monetization.join(', ')}**.\n\n`;
  reading += `You thrive in these environments: **${topPath.environments.join(', ')}**.\n\n`;

  if (secondPath && thirdPath) {
    reading += `## Supporting Pathways\n\n`;
    reading += `**${secondPath.title}** (Score: ${secondPath.score}/100) and **${thirdPath.title}** (Score: ${thirdPath.score}/100) serve as powerful support structures. `;
    reading += `Think of your #1 pathway as your main income stream, and these as diversification channels that keep your wealth ecosystem healthy.\n\n`;
  }

  reading += `## Activation Steps\n\n`;
  const steps = Array.isArray(data.reading.activation_text) ? data.reading.activation_text : [data.reading.activation_text];
  reading += steps.map((a, i) => `${i + 1}. ${a}`).join('\n');
  reading += `\n\n## Key Warning\n\n${data.reading.main_karmic_trap}\n\n`;
  reading += `## Your Abundance Unlock\n\n**${data.reading.main_abundance_unlock}**\n\n`;
  reading += `---\n\n${firstName}, this is your chart's wealth blueprint. The stars have given you the map — now it is time to walk the path. Start with one step today toward your #1 pathway, and watch how the universe meets you halfway.`;

  return reading;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PathwayPage() {
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PathwayResponse | null>(null);
  const [expandedPathway, setExpandedPathway] = useState<number>(1);
  const [precisionMode, setPrecisionMode] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [aiText, setAiText] = useState('');

  const firstName = (profile?.display_name || 'Friend').split(' ')[0];

  if (!profile?.birth_date || !profile?.latitude) {
    return <PaywallGate feature="pathway" fallbackTier="pro"><BirthDataPrompt message="Add your birth data to discover your wealth pathways." /></PaywallGate>;
  }

  const fetchPathways = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setShowAi(false);
    setAiText('');

    try {
      // Get natal chart from API, then calculate pathways locally
      const birthData = buildBirthData(profile);
      const chart = await api.getNatalChart(birthData);
      if (chart) {
        const result = calculateLocalPathways(chart, profile);
        setData(result);
        setExpandedPathway(1);
      } else {
        setError('Unable to calculate pathways. Please ensure your birth data is complete.');
      }
    } catch (err: any) {
      setError(err.message || 'Could not calculate your pathways. Please check your birth data and try again.');
    } finally {
      setLoading(false);
    }
  };

  const requestAiReading = () => {
    if (!data) return;
    setShowAi(true);
    setAiText(generateAiReading(data, firstName));
  };

  const togglePathway = (rank: number) => {
    setExpandedPathway(prev => (prev === rank ? -1 : rank));
  };

  return (
    <PaywallGate feature="pathway" fallbackTier="pro">
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Readings
      </Link>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-display font-bold text-text-primary">Pathway to Success</h1>
        <p className="text-text-tertiary text-sm">Your personalized wealth blueprint</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center mb-6">
          <p className="text-red-400 mb-3">{error}</p>
          <button onClick={fetchPathways} className="px-6 py-2 rounded-lg bg-red-500/15 text-red-400 font-medium text-sm">
            Retry
          </button>
        </div>
      )}

      {/* Generate Button (before data) */}
      {!data && !error && !loading && (
        <button
          onClick={fetchPathways}
          className="w-full mt-8 mb-6 py-4 rounded-xl font-semibold text-white text-lg flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706, #B45309)' }}
        >
          <Sparkles className="w-5 h-5" />
          Discover Your Wealth Pathways
        </button>
      )}

      {/* Loading */}
      {loading && (
        <div className="card text-center py-16">
          <div className="animate-spin w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full mx-auto mb-4" />
          <p className="text-text-tertiary">Mapping your wealth pathways...</p>
        </div>
      )}

      {/* Data Sections */}
      {data && (
        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-full border border-purple-500/25 bg-purple-500/5 p-1">
              <button
                onClick={() => setPrecisionMode(false)}
                className={`px-6 py-1.5 rounded-full text-sm font-semibold transition-colors ${!precisionMode ? 'bg-purple-500 text-white' : 'text-text-tertiary'}`}
              >Basic</button>
              <button
                onClick={() => setPrecisionMode(true)}
                className={`px-6 py-1.5 rounded-full text-sm font-semibold transition-colors ${precisionMode ? 'bg-purple-500 text-white' : 'text-text-tertiary'}`}
              >Precision</button>
            </div>
          </div>

          {/* Wealth Equation Card */}
          <div className="rounded-xl p-6 border border-amber-500/25" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.05))' }}>
            <h2 className="text-lg font-display font-bold text-amber-400 mb-4">Your Wealth Equation</h2>

            {/* 2nd House Sign */}
            <div className="mb-4">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">2nd House Sign</p>
              <div className="inline-flex items-center gap-2 bg-amber-500/12 px-4 py-2 rounded-lg">
                <span className="text-xl text-amber-400">{ZODIAC_GLYPHS[data.wealth_equation.second_house_sign] || ''}</span>
                <span className="font-semibold text-text-primary">{data.wealth_equation.second_house_sign || '--'}</span>
              </div>
            </div>

            {/* Bodies in 2nd House */}
            {data.wealth_equation.second_house_bodies.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Bodies in 2nd House</p>
                <div className="flex flex-wrap gap-2">
                  {data.wealth_equation.second_house_bodies.map((body, i) => (
                    <div key={i} className="inline-flex items-center gap-1 bg-purple-500/12 px-3 py-1 rounded-md">
                      <span className="text-purple-400">{PLANET_GLYPHS[body.name] || ''}</span>
                      <span className="text-sm text-text-primary font-medium">{body.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dispositor Chain */}
            <div className="mb-4">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Dispositor Chain</p>
              <div className="flex flex-wrap items-center gap-1">
                {(data.wealth_equation.ruler_chain || []).map((link, i) => {
                  const planetName = link.planet || link.body || '';
                  return (
                    <span key={i} className="contents">
                      {i > 0 && <span className="text-amber-400 mx-1">{'→'}</span>}
                      <span className="inline-block bg-bg-tertiary border border-border-primary rounded px-2 py-1">
                        <span className="text-xs text-amber-400 font-semibold">{PLANET_GLYPHS[planetName] || ''} {planetName}</span>
                        <span className="text-[10px] text-text-muted block">{ZODIAC_GLYPHS[link.sign] || ''} {link.sign} (H{link.house})</span>
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Loop / Final Dispositor badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {data.wealth_equation.loop_detected && (
                <span className="px-3 py-1.5 rounded-full text-sm font-bold text-white" style={{ background: 'linear-gradient(90deg, #F59E0B, #D97706)' }}>
                  {'♻'} Cyclical Wealth Pattern
                </span>
              )}
              {data.wealth_equation.final_dispositor && (
                <span className="px-3 py-1.5 rounded-full text-sm font-bold text-white" style={{ background: 'linear-gradient(90deg, #8B5CF6, #7C3AED)' }}>
                  {PLANET_GLYPHS[data.wealth_equation.final_dispositor] || ''} Power Planet: {data.wealth_equation.final_dispositor}
                </span>
              )}
            </div>

            {/* Conjunction Modifiers */}
            {data.wealth_equation.conjunction_modifiers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-amber-500/20">
                <p className="text-xs text-amber-400 uppercase tracking-wider mb-2 font-semibold">Career-Defining Modifiers</p>
                {data.wealth_equation.conjunction_modifiers.slice(0, 5).map((m, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-start">
                    <span className="text-xs text-amber-400 font-bold min-w-[34px] pt-0.5">{m.orb.toFixed(1)}{'°'}</span>
                    <p className="text-sm text-text-secondary flex-1 leading-relaxed">{m.effect}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Precision Layer Card */}
          {precisionMode && data.wealth_equation.precision_layers.length > 0 && (
            <div className="rounded-xl p-6 border border-purple-500/25" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.03))' }}>
              <h2 className="text-lg font-display font-bold text-purple-400 mb-2">Precision Layer</h2>
              <p className="text-sm text-text-muted mb-4">Beneath each wealth-marker sits a hidden current and a deepest thread. Together they describe the exact texture of how your prosperity arrives.</p>
              {data.wealth_equation.precision_layers.slice(0, 6).map((layer, i) => (
                <div key={i} className="mb-4 pb-3 border-b border-purple-500/15 last:border-0">
                  <p className="font-semibold text-amber-400 mb-1">{PLANET_GLYPHS[layer.body] || ''} {layer.body}</p>
                  <p className="text-sm text-text-secondary"><span className="font-bold text-text-primary">Surface:</span> {layer.surfaceSign}</p>
                  <p className="text-sm text-text-secondary"><span className="font-bold text-text-primary">Hidden current:</span> {layer.hiddenSign}{layer.hiddenTheme ? ` — ${layer.hiddenTheme.toLowerCase()}` : ''}</p>
                  <p className="text-sm text-text-secondary"><span className="font-bold text-text-primary">Deepest thread:</span> {layer.deepestSign}{layer.deepestTheme ? ` — ${layer.deepestTheme.toLowerCase()}` : ''}</p>
                </div>
              ))}
            </div>
          )}

          {/* Top 5 Pathways */}
          <h2 className="text-lg font-display font-bold text-amber-400 mt-4">Top 5 Wealth Pathways</h2>

          {data.pathways.map((pathway) => {
            const isExpanded = expandedPathway === pathway.rank;
            const isTop = pathway.rank === 1;
            return (
              <button
                key={pathway.rank}
                onClick={() => togglePathway(pathway.rank)}
                className={`w-full text-left card ${isTop ? 'border-amber-500 border-2' : ''}`}
              >
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold"
                    style={{ background: isTop ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}
                  >
                    {pathway.rank}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">{pathway.title}</h3>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                </div>

                {/* Score bar */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pathway.score}%`,
                        background: isTop ? 'linear-gradient(90deg, #F59E0B, #D97706)' : 'linear-gradient(90deg, #8B5CF6, #6D28D9)',
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-text-primary w-8 text-right">{pathway.score}</span>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Why this fits your chart</p>
                    <p className="text-sm text-text-secondary leading-relaxed">{pathway.reasons.join('. ')}</p>

                    <p className="text-xs text-text-muted uppercase tracking-wider mb-2 mt-4">Best Monetization Methods</p>
                    <div className="flex flex-wrap gap-2">
                      {pathway.monetization.map((method, i) => (
                        <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold border border-purple-500/30 bg-purple-500/15 text-purple-300">
                          {method}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-text-muted uppercase tracking-wider mb-2 mt-4">Best Success Environments</p>
                    <div className="flex flex-wrap gap-2">
                      {pathway.environments.map((env, i) => (
                        <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold border border-cyan-500/30 bg-cyan-500/15 text-cyan-300">
                          {env}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </button>
            );
          })}

          {/* What Creates Wealth */}
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-3">What Creates Wealth For You</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{data.reading.what_creates_wealth_text}</p>
            <CopyButton text={data.reading.what_creates_wealth_text} />
          </div>

          {/* What Can Block Success */}
          <div className="card bg-red-500/5 border-red-500/20">
            <h3 className="font-semibold text-red-400 mb-3">What Can Block Your Success</h3>
            {(Array.isArray(data.reading.blockages_text) ? data.reading.blockages_text : [data.reading.blockages_text]).map((blockage, i) => (
              <div key={i} className="flex gap-2 items-start mb-2">
                <span className="text-sm mt-0.5">{'⚠️'}</span>
                <p className="text-sm text-text-secondary flex-1 leading-relaxed">{blockage}</p>
              </div>
            ))}
          </div>

          {/* How To Activate */}
          <div className="card bg-emerald-500/5 border-emerald-500/20">
            <h3 className="font-semibold text-emerald-400 mb-3">How To Activate This Chart</h3>
            {(Array.isArray(data.reading.activation_text) ? data.reading.activation_text : [data.reading.activation_text]).map((step, i) => (
              <div key={i} className="flex gap-3 items-start mb-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-emerald-400">{i + 1}</span>
                </div>
                <p className="text-sm text-text-secondary flex-1 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          {/* Abundance Unlock */}
          <div className="rounded-xl p-8 border border-amber-500/30 text-center" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.08))' }}>
            <p className="text-xs text-amber-400 uppercase tracking-widest mb-3 font-semibold">Your Abundance Unlock</p>
            <p className="text-lg font-display font-bold text-text-primary leading-relaxed">{data.reading.main_abundance_unlock}</p>
            <CopyButton text={data.reading.main_abundance_unlock} />
          </div>

          {/* Karmic Trap */}
          <div className="rounded-xl p-8 border border-red-500/15 bg-red-900/15 text-center">
            <p className="text-xs text-red-400 uppercase tracking-widest mb-3 font-semibold">Karmic Trap to Avoid</p>
            <p className="text-sm text-text-secondary italic leading-relaxed">{data.reading.main_karmic_trap}</p>
            <CopyButton text={data.reading.main_karmic_trap} />
          </div>

          {/* AI Deep Reading Button */}
          {!showAi && (
            <button
              onClick={requestAiReading}
              className="w-full py-4 rounded-xl font-semibold text-white text-lg flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED, #6D28D9)' }}
            >
              <Sparkles className="w-5 h-5" />
              Get AI Deep Wealth Analysis
            </button>
          )}

          {/* AI Reading Output */}
          {showAi && (
            <div className="rounded-xl border border-purple-500/20 p-6" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.03))' }}>
              <h3 className="text-lg font-display font-bold text-purple-400 mb-4">AI Deep Wealth Analysis</h3>
              {aiText ? <RenderMarkdown text={aiText} /> : <p className="text-text-muted italic text-center py-8">Channeling cosmic insights...</p>}
            </div>
          )}

          {/* Regenerate */}
          <button onClick={fetchPathways} className="w-full text-center py-3 text-text-muted hover:text-text-secondary flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Regenerate Pathways
          </button>

          {/* Disclaimer */}
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-4 mt-4 mb-8">
            <p className="text-text-muted text-xs font-semibold mb-1">{'⚠️'} Important Disclaimer</p>
            <p className="text-text-muted text-[11px] leading-relaxed opacity-70">
              This Pathway to Success reading is generated using astrological analysis of your natal chart and is intended for entertainment, self-reflection, and personal insight purposes only. It does not constitute professional financial advice, career counseling, or investment guidance. Astrological interpretations are symbolic and should not be used as the sole basis for financial decisions, business ventures, or career changes. Always consult qualified financial advisors, career professionals, or business consultants before making significant financial or professional decisions. Past astrological patterns do not guarantee future results. Individual results may vary based on personal effort, market conditions, and countless other factors beyond astrological influence.
            </p>
          </div>
        </div>
      )}
    </div>
    </PaywallGate>
  );
}
