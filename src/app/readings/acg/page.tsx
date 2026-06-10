'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { ArrowLeft, Globe, Search, X, ChevronDown, ChevronUp, Copy, Loader2, Star, MapPin, Sparkles } from 'lucide-react';
import { InlineBold } from '@/components/ui/InlineBold';
import { PaywallGate } from '@/components/ui/PaywallGate';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { getPlanetGlyph } from '@/lib/utils';
import { WORLD_CITIES_ALL, type CityData } from '@/data/worldCitiesAll';
import { isDestinationCity } from '@/data/destinationCities';
import { generateDerivedAcgLines, type DerivedACGLine } from '@/lib/engines/derivedAcgLines';
import { getDerivedAcgAccess } from '@/config/featureFlags';
import { getFullDuadCompendium } from '@/lib/engines/duadCompendium';

// ─── Constants ───────────────────────────────────────────────────────────────

const ACG_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const;
type ACGPlanet = typeof ACG_PLANETS[number];
type LineType = 'ASC' | 'DSC' | 'MC' | 'IC';

const PLANET_COLORS: Record<string, string> = {
  Sun: '#F59E0B', Moon: '#C4B5FD', Mercury: '#6EE7B7', Venus: '#F472B6',
  Mars: '#EF4444', Jupiter: '#818CF8', Saturn: '#9CA3AF', Uranus: '#38BDF8',
  Neptune: '#2DD4BF', Pluto: '#991B1B',
};

const LINE_TYPE_MEANINGS: Record<LineType, string> = {
  ASC: 'Self-expression & Identity',
  DSC: 'Relationships & Partnerships',
  MC: 'Career & Reputation',
  IC: 'Home, Roots & Inner Life',
};

const OBLIQUITY = 23.4393;
const DEG = Math.PI / 180;

// ─── Derived (Duad–Compendium) layer presentation ────────────────────────────
// User-facing names are deliberately jargon-free: natal = "Core",
// duad = "Inner", compendium = "Essence". Distinction never relies on color
// alone — dash pattern, weight, and opacity differ per layer.
type StyledDerivedLine = ACGLine & {
  dash: string;
  weight: number;
  opacityOverride: number;
  layerLabel: string;
};
const DERIVED_LAYER_STYLE: Record<'duad' | 'compendium', { dash: string; weight: number; opacityOverride: number; layerLabel: string }> = {
  duad: { dash: '10,7', weight: 1.8, opacityOverride: 0.65, layerLabel: 'Inner' },
  compendium: { dash: '2,5', weight: 1.4, opacityOverride: 0.55, layerLabel: 'Essence' },
};

const PLANET_MEANINGS: Record<string, string> = {
  Sun: 'Identity & vitality', Moon: 'Emotions & intuition',
  Mercury: 'Communication & intellect', Venus: 'Love & beauty',
  Mars: 'Drive & passion', Jupiter: 'Expansion & abundance',
  Saturn: 'Discipline & structure', Uranus: 'Innovation & freedom',
  Neptune: 'Dreams & spirituality', Pluto: 'Transformation & power',
};

const PARAN_INTERPRETATIONS: Record<string, string> = {
  'Sun-Moon': 'Core identity meets emotional foundation — wholeness and self-integration',
  'Sun-Jupiter': 'Leadership meets expansion — great for career growth and visibility',
  'Venus-Mars': 'Love meets desire — powerful attraction energy and creative fire',
  'Saturn-Pluto': 'Structure meets transformation — intense but powerful restructuring',
  'Jupiter-Venus': 'Abundance meets beauty — prosperity, pleasure, and social grace',
  'Moon-Neptune': 'Emotions meet intuition — heightened psychic sensitivity and imagination',
  'Sun-Saturn': 'Identity meets discipline — authority, mastery, and enduring achievement',
  'Mars-Jupiter': 'Drive meets opportunity — bold success and confident action',
  'Venus-Neptune': 'Love meets dreams — romantic idealism and artistic inspiration',
  'Moon-Pluto': 'Emotions meet power — deep psychological transformation',
  'Sun-Venus': 'Identity meets love — charm, creativity, and magnetic presence',
  'Sun-Mars': 'Identity meets drive — courage, leadership, and physical vitality',
  'Moon-Venus': 'Emotions meet love — nurturing relationships and domestic harmony',
  'Moon-Mars': 'Emotions meet action — passionate instincts and emotional courage',
  'Mercury-Jupiter': 'Intellect meets expansion — broad thinking and successful communication',
  'Mercury-Venus': 'Intellect meets beauty — artistic expression and diplomatic skill',
  'Jupiter-Saturn': 'Expansion meets structure — balanced growth and lasting success',
  'Jupiter-Uranus': 'Expansion meets innovation — breakthrough opportunities and sudden luck',
  'Jupiter-Neptune': 'Expansion meets spirituality — faith, vision, and inspired generosity',
  'Jupiter-Pluto': 'Expansion meets power — tremendous ambition and wealth potential',
  'Saturn-Neptune': 'Structure meets dreams — manifesting visions into reality',
  'Saturn-Uranus': 'Structure meets freedom — revolutionary reform and innovation',
  'Uranus-Pluto': 'Innovation meets transformation — radical change and evolution',
  'Neptune-Pluto': 'Dreams meet power — generational spiritual transformation',
  'Uranus-Neptune': 'Innovation meets spirituality — visionary breakthroughs',
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface ACGLinePoint { lat: number; lon: number; }
interface ACGLine {
  planet: string;
  lineType: LineType;
  points: ACGLinePoint[];
  color: string;
}

interface ParanLine {
  planet1: string;
  angle1: 'ASC' | 'DSC' | 'MC' | 'IC';
  planet2: string;
  angle2: 'ASC' | 'DSC' | 'MC' | 'IC';
  latitude: number;
  interpretation: string;
}

interface CityScore {
  city: CityData;
  score: number;
  dominantPlanet: string;
  bestFor: string[];
  nearestLines: { planet: string; lineType: LineType; distance: number }[];
}

// ─── Calculation Functions ──────────────────────────────────────────────────

function getParanInterpretation(planet1: string, planet2: string, angle1: string, angle2: string): string {
  const key1 = `${planet1}-${planet2}`;
  const key2 = `${planet2}-${planet1}`;
  const base = PARAN_INTERPRETATIONS[key1] || PARAN_INTERPRETATIONS[key2] ||
    `${PLANET_MEANINGS[planet1] || planet1} combines with ${PLANET_MEANINGS[planet2] || planet2} at this latitude`;
  return `${base} (${planet1} ${angle1}, ${planet2} ${angle2})`;
}

function calculateACGLines(planets: { name: string; longitude: number }[], birthDate: Date): ACGLine[] {
  const lines: ACGLine[] = [];
  const eps = OBLIQUITY * DEG;

  const y = birthDate.getUTCFullYear();
  const m = birthDate.getUTCMonth() + 1;
  const d = birthDate.getUTCDate();
  const utH = birthDate.getUTCHours() + birthDate.getUTCMinutes() / 60;
  let jdY = y, jdM = m;
  if (m <= 2) { jdY -= 1; jdM += 12; }
  const A = Math.floor(jdY / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd0 = Math.floor(365.25 * (jdY + 4716)) + Math.floor(30.6001 * (jdM + 1)) + d + B - 1524.5;
  const d0 = jd0 - 2451545.0;
  const T0 = d0 / 36525.0;
  let gmst0 = 100.46061837 + 36000.770053608 * T0 + 0.000387933 * T0 * T0;
  gmst0 = ((gmst0 % 360) + 360) % 360;
  const gmstBirth = gmst0 + 360.98564724 * (utH / 24.0);

  for (const planet of planets) {
    const pName = planet.name;
    if (!ACG_PLANETS.includes(pName as ACGPlanet)) continue;
    const color = PLANET_COLORS[pName] || '#FFFFFF';

    const lonRad = planet.longitude * DEG;
    const ra = Math.atan2(Math.sin(lonRad) * Math.cos(eps), Math.cos(lonRad)) / DEG;
    const raAdj = ((ra % 360) + 360) % 360;
    const dec = Math.asin(Math.sin(lonRad) * Math.sin(eps)) / DEG;

    const mcLon = ((raAdj - gmstBirth) % 360 + 360 + 180) % 360 - 180;
    const mcPoints: ACGLinePoint[] = [];
    for (let lat = -70; lat <= 70; lat += 2) mcPoints.push({ lat, lon: mcLon });
    lines.push({ planet: pName, lineType: 'MC', points: mcPoints, color });

    const icLon = mcLon > 0 ? mcLon - 180 : mcLon + 180;
    const icPoints: ACGLinePoint[] = [];
    for (let lat = -70; lat <= 70; lat += 2) icPoints.push({ lat, lon: icLon });
    lines.push({ planet: pName, lineType: 'IC', points: icPoints, color });

    const decRad = dec * DEG;
    const ascPoints: ACGLinePoint[] = [];
    const dscPoints: ACGLinePoint[] = [];

    for (let lat = -66; lat <= 66; lat += 2) {
      const latRad = lat * DEG;
      const cosH = -Math.tan(latRad) * Math.tan(decRad);
      if (cosH < -1 || cosH > 1) continue;
      const H = Math.acos(cosH) / DEG;

      const lstAsc = raAdj + H;
      const lonAsc = ((lstAsc - gmstBirth) % 360 + 360 + 180) % 360 - 180;
      ascPoints.push({ lat, lon: lonAsc });

      const lstDsc = raAdj - H;
      const lonDsc = ((lstDsc - gmstBirth) % 360 + 360 + 180) % 360 - 180;
      dscPoints.push({ lat, lon: lonDsc });
    }

    if (ascPoints.length > 0) lines.push({ planet: pName, lineType: 'ASC', points: ascPoints, color });
    if (dscPoints.length > 0) lines.push({ planet: pName, lineType: 'DSC', points: dscPoints, color });
  }

  return lines;
}

function calculateParanLines(planets: { name: string; longitude: number }[], birthDate: Date): ParanLine[] {
  const parans: ParanLine[] = [];
  const eps = OBLIQUITY * DEG;
  const seenKeys = new Set<string>();

  const planetDecs: Record<string, number> = {};
  for (const planet of planets) {
    if (!ACG_PLANETS.includes(planet.name as ACGPlanet)) continue;
    const lonRad = planet.longitude * DEG;
    planetDecs[planet.name] = Math.asin(Math.sin(lonRad) * Math.sin(eps)) / DEG;
  }

  const allAngles: ('ASC' | 'DSC' | 'MC' | 'IC')[] = ['ASC', 'DSC', 'MC', 'IC'];

  function canBeOnAngle(dec: number, lat: number, angle: 'ASC' | 'DSC' | 'MC' | 'IC'): boolean {
    if (angle === 'MC' || angle === 'IC') return true;
    const latRad = lat * DEG;
    const decRad = dec * DEG;
    const cosH = -Math.tan(latRad) * Math.tan(decRad);
    return cosH >= -1 && cosH <= 1;
  }

  const planetNames = Object.keys(planetDecs);

  for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      const p1 = planetNames[i];
      const p2 = planetNames[j];
      const dec1 = planetDecs[p1];
      const dec2 = planetDecs[p2];

      for (const angle1 of allAngles) {
        for (const angle2 of allAngles) {
          if ((angle1 === 'MC' || angle1 === 'IC') && (angle2 === 'MC' || angle2 === 'IC')) continue;
          const sortedKey = [`${p1}-${angle1}`, `${p2}-${angle2}`].sort().join('|');
          if (seenKeys.has(sortedKey)) continue;

          for (let lat = -60; lat <= 60; lat += 1) {
            const ok1 = canBeOnAngle(dec1, lat, angle1);
            const ok2 = canBeOnAngle(dec2, lat, angle2);

            if (ok1 && ok2 && lat % 5 === 0) {
              seenKeys.add(sortedKey + '|' + lat);
              parans.push({
                planet1: p1, angle1,
                planet2: p2, angle2,
                latitude: lat,
                interpretation: getParanInterpretation(p1, p2, angle1, angle2),
              });
              break;
            }
          }
        }
      }
    }
  }

  const uniqueParans: ParanLine[] = [];
  const latitudeSeen = new Set<string>();
  for (const p of parans) {
    const key = `${p.planet1}-${p.planet2}-${p.angle1}-${p.angle2}`;
    if (!latitudeSeen.has(key)) {
      latitudeSeen.add(key);
      uniqueParans.push(p);
    }
  }
  return uniqueParans;
}

// ─── City Scoring ────────────────────────────────────────────────────────────

function distanceToLine(city: CityData, line: ACGLine): number {
  let minDist = Infinity;
  for (const pt of line.points) {
    const dLat = city.lat - pt.lat;
    let dLon = city.lon - pt.lon;
    if (dLon > 180) dLon -= 360;
    if (dLon < -180) dLon += 360;
    const cosLat = Math.cos(city.lat * DEG);
    const dist = Math.sqrt(dLat * dLat + (dLon * cosLat) * (dLon * cosLat));
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

const BENEFICIAL_LINES: Record<string, LineType[]> = {
  Jupiter: ['ASC', 'MC', 'DSC', 'IC'],
  Venus: ['ASC', 'MC', 'DSC'],
  Sun: ['MC', 'ASC'],
  Moon: ['IC', 'DSC'],
};

const CHALLENGING_LINES: Record<string, LineType[]> = {
  Saturn: ['ASC', 'MC'],
  Pluto: ['ASC', 'MC'],
  Mars: ['IC', 'ASC'],
};

function getBestForTags(nearestLines: { planet: string; lineType: LineType; distance: number }[]): string[] {
  const tags: string[] = [];
  const close = nearestLines.filter(l => l.distance < 10);
  for (const l of close) {
    if (l.planet === 'Jupiter' && (l.lineType === 'MC' || l.lineType === 'ASC')) tags.push('Career Growth');
    if (l.planet === 'Venus' && l.lineType === 'DSC') tags.push('Love & Romance');
    if (l.planet === 'Venus' && l.lineType === 'ASC') tags.push('Beauty & Charm');
    if (l.planet === 'Sun' && l.lineType === 'MC') tags.push('Fame & Recognition');
    if (l.planet === 'Moon' && l.lineType === 'IC') tags.push('Emotional Healing');
    if (l.planet === 'Jupiter' && l.lineType === 'DSC') tags.push('Beneficial Partnerships');
    if (l.planet === 'Venus' && l.lineType === 'MC') tags.push('Creative Success');
    if (l.planet === 'Sun' && l.lineType === 'ASC') tags.push('Self-Discovery');
    if (l.planet === 'Moon' && l.lineType === 'DSC') tags.push('Deep Connections');
    if (l.planet === 'Mercury' && l.lineType === 'MC') tags.push('Communication');
    if (l.planet === 'Uranus' && l.lineType === 'ASC') tags.push('Reinvention');
    if (l.planet === 'Neptune' && l.lineType === 'MC') tags.push('Spiritual Growth');
  }
  return Array.from(new Set(tags)).slice(0, 3);
}

function scoreCities(acgLines: ACGLine[]): CityScore[] {
  const scored: CityScore[] = [];
  // Best-20 ranks only recognizable destination cities — places people
  // actually dream of visiting or moving to. Line astrology still decides
  // the order; the curated pool only decides eligibility. Search and map
  // taps continue to use the full WORLD_CITIES_ALL database.
  const pool = WORLD_CITIES_ALL.filter(isDestinationCity);
  for (const city of pool) {
    let score = 0;
    const nearestLines: { planet: string; lineType: LineType; distance: number }[] = [];
    for (const line of acgLines) {
      const dist = distanceToLine(city, line);
      nearestLines.push({ planet: line.planet, lineType: line.lineType, distance: dist });
      if (BENEFICIAL_LINES[line.planet]?.includes(line.lineType)) {
        if (dist < 5) score += 30;
        else if (dist < 10) score += 20;
        else if (dist < 20) score += 10;
        else if (dist < 30) score += 5;
      }
      if (CHALLENGING_LINES[line.planet]?.includes(line.lineType)) {
        if (dist < 5) score -= 20;
        else if (dist < 10) score -= 12;
        else if (dist < 20) score -= 5;
      }
    }
    nearestLines.sort((a, b) => a.distance - b.distance);
    const dominantPlanet = nearestLines[0]?.planet || 'Sun';
    const bestFor = getBestForTags(nearestLines);
    scored.push({ city, score, dominantPlanet, bestFor, nearestLines });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

// ─── Regional Diversity for Best 20 ─────────────────────────────────────────

function getRegion(city: CityData): string {
  const { lat, lon } = city;
  if (lat >= 10 && lat <= 72 && lon >= -170 && lon <= -50) return 'North America';
  if (lat >= 7 && lat < 25 && lon >= -90 && lon <= -59) return 'Caribbean';
  if (lat >= -60 && lat < 15 && lon >= -82 && lon <= -34) return 'South America';
  if (lat >= 35 && lat <= 72 && lon >= -25 && lon <= 45) return 'Europe';
  if (lat >= 12 && lat <= 42 && lon >= 25 && lon <= 63) return 'Middle East';
  if (lat >= -35 && lat <= 37 && lon >= -20 && lon <= 55) return 'Africa';
  if (lat >= -10 && lat <= 35 && lon >= 63 && lon <= 142) return 'Asia';
  if (lat >= 20 && lat <= 55 && lon >= 100 && lon <= 150) return 'East Asia';
  if (lat >= -50 && lat <= 0 && lon >= 110 && lon <= 180) return 'Oceania';
  if (lat >= 40 && lat <= 75 && lon >= 45 && lon <= 180) return 'Russia & Central Asia';
  return 'Other';
}

function selectTop20(cityScores: CityScore[]): CityScore[] {
  if (cityScores.length === 0) return [];

  const regionBuckets: Record<string, CityScore[]> = {};
  for (const cs of cityScores) {
    const region = getRegion(cs.city);
    if (!regionBuckets[region]) regionBuckets[region] = [];
    regionBuckets[region].push(cs);
  }

  const regions = Object.keys(regionBuckets);
  const result: CityScore[] = [];
  const perRegionMin = Math.max(1, Math.floor(20 / Math.max(regions.length, 1)));
  const perRegionMax = perRegionMin + 2;

  for (const region of regions) {
    const bucket = regionBuckets[region];
    const take = Math.min(perRegionMin, bucket.length);
    for (let i = 0; i < take; i++) result.push(bucket[i]);
  }

  if (result.length < 20) {
    const included = new Set(result.map(r => `${r.city.name}-${r.city.country}`));
    const remaining = cityScores.filter(cs => !included.has(`${cs.city.name}-${cs.city.country}`));
    const regionCounts: Record<string, number> = {};
    for (const r of result) {
      const reg = getRegion(r.city);
      regionCounts[reg] = (regionCounts[reg] || 0) + 1;
    }
    for (const cs of remaining) {
      if (result.length >= 20) break;
      const reg = getRegion(cs.city);
      if ((regionCounts[reg] || 0) < perRegionMax) {
        result.push(cs);
        regionCounts[reg] = (regionCounts[reg] || 0) + 1;
      }
    }
    if (result.length < 20) {
      const included2 = new Set(result.map(r => `${r.city.name}-${r.city.country}`));
      for (const cs of remaining) {
        if (result.length >= 20) break;
        if (!included2.has(`${cs.city.name}-${cs.city.country}`)) {
          result.push(cs);
          included2.add(`${cs.city.name}-${cs.city.country}`);
        }
      }
    }
  }

  result.sort((a, b) => b.score - a.score);
  return result.slice(0, 20);
}

// ─── Relocation Reading Generator ──────────────────────────────────────────

// ─── Reading display helpers ─────────────────────────────────────────────────

/** 1° of arc ≈ 111.32 km on a great circle. Distances are shown in
 *  human units; raw degrees stay internal. */
function formatLineDistance(deg: number): string {
  const km = deg * 111.32;
  const mi = km * 0.621371;
  const roundTo = (v: number) => (v >= 100 ? Math.round(v / 10) * 10 : Math.max(1, Math.round(v)));
  return `~${roundTo(km)} km / ${roundTo(mi)} mi`;
}

/** Jargon-free channel names — the technical ASC/DSC/MC/IC codes stay out
 *  of user-facing copy. */
const LINE_CHANNEL_NAME: Record<LineType, string> = {
  ASC: 'identity line',
  DSC: 'relationship line',
  MC: 'career line',
  IC: 'home line',
};

/** How the deeper layer expresses through each channel (weave closers). */
const LINE_CHANNEL_APPLICATION: Record<LineType, string> = {
  ASC: 'that is what people sense in you the moment you arrive',
  DSC: 'that is what you instinctively look for in the people you meet here',
  MC: 'that is the engine behind the reputation you build here',
  IC: 'that is what a home in this place quietly feeds',
};

function lcFirst(s: string): string {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

const PLANET_RELOCATION_THEMES: Record<string, Record<string, string>> = {
  Sun: {
    ASC: 'You shine here. Your identity comes alive, people notice you, and you feel more confident and visible. This is a place where you become more fully yourself.',
    DSC: 'Powerful partnerships form here. You attract people who reflect your light back to you. Business and romantic connections are amplified.',
    MC: 'This is a fame and career location. Your professional reputation grows here. You are seen as an authority, a leader, someone who commands respect.',
    IC: 'This place nurtures your inner child and sense of belonging. You feel at home here on a deep level. Family connections and emotional roots strengthen.',
  },
  Moon: {
    ASC: 'Your emotional sensitivity is heightened here. People respond to your warmth and intuition. You feel things deeply in this location.',
    DSC: 'Deep emotional connections form here. You attract nurturing, caring people. Intimate relationships feel more soulful.',
    MC: 'You become known for your emotional intelligence and caring nature here. Careers in nurturing, food, real estate, or counseling thrive.',
    IC: 'This is your ultimate home location. You feel emotionally safe, rooted, and deeply at peace. Family life flourishes here.',
  },
  Venus: {
    ASC: 'You look and feel more beautiful here. Your charm is amplified, social life thrives, and you attract love effortlessly. A wonderful place for romance.',
    DSC: 'Love finds you here. Relationships are harmonious, partnerships are profitable, and you attract people who appreciate beauty and value.',
    MC: 'Creative success and a beautiful public image await here. Careers in art, fashion, beauty, diplomacy, or luxury thrive.',
    IC: 'Your home life becomes more beautiful and harmonious here. You create a stunning living space and enjoy domestic pleasures.',
  },
  Mercury: {
    ASC: 'Your mind sharpens here. Words come faster, curiosity expands, and people experience you as quick, articulate, and engaging. A natural place for learning and connecting.',
    DSC: 'You attract talkers, thinkers, and dealmakers here. Relationships are built on conversation and ideas. Excellent for finding collaborators, agents, and intellectual partners.',
    MC: 'Your voice becomes your career asset here. Writing, speaking, teaching, media, trade, and negotiation thrive. You become known for what you say and how clearly you say it.',
    IC: 'Home life fills with books, conversation, and movement here. A great base for studying or writing, though the mind may struggle to fully switch off.',
  },
  Mars: {
    ASC: 'You feel energized, motivated, and action-oriented here. Physical vitality is high. You become more assertive and competitive.',
    DSC: 'Relationships here are passionate and intense. You attract driven, ambitious partners. Business partnerships are dynamic but may involve conflict.',
    MC: 'Career ambition ignites here. You become more driven, competitive, and willing to fight for what you want professionally.',
    IC: 'Energy around home and property matters is high. You may renovate, move frequently, or experience intensity in family dynamics.',
  },
  Jupiter: {
    ASC: 'Everything expands here. Your personality, opportunities, and worldview all grow. You feel optimistic, generous, and lucky. This is one of the best locations for overall life improvement.',
    DSC: 'You attract generous, wise, and beneficial partners here. Relationships bring growth, travel, and abundance. Legal matters favor you.',
    MC: 'Professional success and recognition flow here. Your career expands, promotions come, and you may achieve public prominence. One of the best career locations.',
    IC: 'Your home life is abundant and comfortable here. You may own larger property, enjoy domestic prosperity, and feel deeply content.',
  },
  Saturn: {
    ASC: 'This is a serious, growth-through-discipline location. You mature here, take on more responsibility, and build lasting structures. It can feel heavy but produces mastery.',
    DSC: 'Relationships here are serious, committed, and sometimes challenging. You attract mature, responsible partners. Partnerships require patience.',
    MC: 'Career demands are high but rewards are lasting. You build authority, reputation, and institutional power here over time. Not quick success — enduring success.',
    IC: 'Home life involves responsibility, structure, and sometimes limitation. You may deal with property issues or family obligations. Builds character.',
  },
  Uranus: {
    ASC: 'You reinvent yourself here. This location sparks independence, originality, and sudden changes in self-expression. Exciting but unpredictable.',
    DSC: 'Relationships here are unconventional and exciting. You attract eccentric, innovative people. Partnerships may form and dissolve suddenly.',
    MC: 'Your career takes unexpected turns here. You may work in technology, innovation, or humanitarian fields. Sudden career shifts are likely.',
    IC: 'Home life is unpredictable here. You may move frequently or create an unconventional living situation. Freedom in domestic life.',
  },
  Neptune: {
    ASC: 'You become more intuitive, artistic, and spiritually sensitive here. Others find you mysterious and ethereal. Creative and spiritual pursuits flourish.',
    DSC: 'Relationships here have a dreamlike quality. You attract spiritual, artistic, or elusive partners. Romance is idealized — stay grounded.',
    MC: 'Creative, spiritual, or healing careers thrive here. You may become known for your vision, artistry, or compassion. Boundaries at work may blur.',
    IC: 'This is a deeply spiritual home location. You feel connected to something greater. Be careful of unclear property boundaries or domestic confusion.',
  },
  Pluto: {
    ASC: 'You undergo deep personal transformation here. Your presence becomes more powerful, magnetic, and intense. This location changes you permanently.',
    DSC: 'Relationships here are intense, transformative, and sometimes overwhelming. You attract powerful people. Power dynamics are amplified.',
    MC: 'You become a force in your career here. Power, influence, and transformation define your professional life. Not for the faint of heart.',
    IC: 'Deep psychological transformation happens here, often through family or home experiences. Buried issues surface for healing.',
  },
};

const WATCH_TEXT: Record<string, string> = {
  Saturn: 'This can bring added responsibility, delays, or a sense of heaviness. Structure is required here — things do not come easily, but they last.',
  Pluto: 'Intensity and power dynamics may surface. Relationships and career situations can feel high-stakes. Transformation is the theme.',
  Mars: 'Conflict, impatience, or accidents may increase. Channel this energy into productive action and physical activity.',
};

function generateLocalRelocationReading(
  city: CityData,
  lines: ACGLine[],
  firstName: string,
  paranLns: ParanLine[],
  natalPlanets: Array<{ name: string; longitude: number }> = [],
  includeDeepLayers: boolean = false,
): string {
  const lineDistances = lines.map(line => ({
    planet: line.planet,
    lineType: line.lineType as LineType,
    distance: distanceToLine(city, line),
  })).sort((a, b) => a.distance - b.distance);

  const closestLines = lineDistances.slice(0, 6);
  const veryClose = closestLines.filter(l => l.distance < 8);
  const dominantPlanet = closestLines[0]?.planet || 'Jupiter';
  const dominantLine = (closestLines[0]?.lineType || 'MC') as LineType;

  const bestFor = getBestForTags(closestLines);
  const nearbyParans = paranLns.filter(p => Math.abs(p.latitude - city.lat) <= 3);

  // The deeper weave: each planet's hidden drive and finest thread, written
  // without technical vocabulary. Used for the closest few lines only.
  const deepWeave = (planet: string, lineType: LineType): string => {
    if (!includeDeepLayers) return '';
    const natal = natalPlanets.find(p => p.name === planet);
    if (!natal || !Number.isFinite(natal.longitude)) return '';
    try {
      const dc = getFullDuadCompendium(natal.longitude);
      if (!dc.hiddenTheme || !dc.deepestTheme) return '';
      return ` But your ${planet} doesn't run on its surface alone — beneath it works ${lcFirst(dc.hiddenTheme)}. And at its finest thread lives ${lcFirst(dc.deepestTheme)}. In ${city.name}, ${LINE_CHANNEL_APPLICATION[lineType]}.`;
    } catch {
      return ''; // the deeper layer must never break the base reading
    }
  };

  let reading = `## ${city.name} - Your Cosmic Blueprint\n\n`;
  reading += `${firstName}, ${city.name} sits at a powerful intersection of your planetary lines. `;
  reading += `Your **${dominantPlanet} ${LINE_CHANNEL_NAME[dominantLine]}** runs closest to this city (${formatLineDistance(closestLines[0]?.distance ?? 0)} away), `;
  reading += `making ${PLANET_MEANINGS[dominantPlanet] || dominantPlanet.toLowerCase() + ' energy'} the dominant influence here.\n\n`;

  reading += `### What Thrives Here\n\n`;
  const thrivesShown = veryClose.slice(0, 4);
  let weavesUsed = 0;
  for (const l of thrivesShown) {
    const theme = PLANET_RELOCATION_THEMES[l.planet]?.[l.lineType] || `${l.planet} ${l.lineType} energy activates this area of your life.`;
    // The deeper layer is woven into the closest two lines only, so the
    // reading gains depth without losing scannability.
    const weave = weavesUsed < 2 ? deepWeave(l.planet, l.lineType) : '';
    if (weave) weavesUsed++;
    // A challenging line shown here carries its caution inline instead of
    // being repeated in the next section.
    const watch = WATCH_TEXT[l.planet] && CHALLENGING_LINES[l.planet]?.includes(l.lineType)
      ? ` **Watch for:** ${WATCH_TEXT[l.planet]}`
      : '';
    reading += `- **${getPlanetGlyph(l.planet) || ''} Your ${l.planet} ${LINE_CHANNEL_NAME[l.lineType]}** (${formatLineDistance(l.distance)} away): ${theme}${weave}${watch}\n\n`;
  }
  if (thrivesShown.length === 0) {
    reading += `- No planetary lines pass extremely close, but the combined influence of ${closestLines.slice(0, 3).map(l => l.planet).join(', ')} creates a ${closestLines[0]?.distance < 15 ? 'moderate' : 'subtle'} energetic field.\n\n`;
  }

  // Only challenging lines NOT already covered above appear here.
  const challengingNearby = closestLines.filter(l =>
    (l.planet === 'Saturn' || l.planet === 'Pluto' || l.planet === 'Mars') && l.distance < 15 &&
    !thrivesShown.some(t => t.planet === l.planet && t.lineType === l.lineType)
  );
  if (challengingNearby.length > 0) {
    reading += `### What to Watch For\n\n`;
    for (const l of challengingNearby.slice(0, 2)) {
      reading += `- **Your ${l.planet} ${LINE_CHANNEL_NAME[l.lineType]}** (${formatLineDistance(l.distance)}): ${WATCH_TEXT[l.planet]}\n\n`;
    }
  } else if (!thrivesShown.some(t => WATCH_TEXT[t.planet] && CHALLENGING_LINES[t.planet]?.includes(t.lineType))) {
    reading += `### What to Watch For\n\n`;
    reading += `- This location has relatively few challenging planetary influences. The main thing to watch for is becoming complacent — easy energy can breed laziness if not directed purposefully.\n\n`;
  }

  reading += `### Best For\n\n`;
  const tags = bestFor.length > 0 ? bestFor : ['Personal Growth', 'New Experiences'];
  for (const tag of tags) reading += `- **${tag}**\n`;
  if (dominantPlanet === 'Jupiter') reading += `- **Financial Growth & Expansion**\n`;
  if (dominantPlanet === 'Venus') reading += `- **Romance & Social Life**\n`;
  if (dominantPlanet === 'Sun') reading += `- **Self-Discovery & Leadership**\n`;
  if (dominantPlanet === 'Moon') reading += `- **Emotional Healing & Family**\n`;
  reading += '\n';

  if (nearbyParans.length > 0) {
    reading += `### Paran Lines at This Latitude\n\n`;
    reading += `${firstName}, there are **${nearbyParans.length}** paran lines near ${city.name}'s latitude, adding extra combined planetary energy:\n\n`;
    for (const p of nearbyParans.slice(0, 3)) {
      reading += `- ${getPlanetGlyph(p.planet1) || ''} ${p.planet1} ${p.angle1} / ${getPlanetGlyph(p.planet2) || ''} ${p.planet2} ${p.angle2}: ${p.interpretation}\n\n`;
    }
  }

  reading += `### Geographic Energy Profile\n\n`;
  const hemisphere = city.lat >= 0 ? 'Northern' : 'Southern';
  reading += `${city.name} sits at ${Math.abs(city.lat).toFixed(1)}°${city.lat >= 0 ? 'N' : 'S'}, ${Math.abs(city.lon).toFixed(1)}°${city.lon >= 0 ? 'E' : 'W'} in the ${hemisphere} Hemisphere. `;
  if (closestLines.length >= 2) {
    const p2 = closestLines[1]?.planet;
    const secondaryDesc =
      p2 === 'Jupiter' ? 'opportunity and expansion' :
      p2 === 'Venus' ? 'beauty and attraction' :
      p2 === 'Saturn' ? 'discipline and responsibility' :
      p2 === 'Mars' ? 'drive and assertiveness' :
      p2 === 'Moon' ? 'emotional depth and intuition' :
      p2 === 'Sun' ? 'confidence and visibility' :
      p2 === 'Pluto' ? 'transformation and power' :
      p2 === 'Neptune' ? 'spirituality and creativity' :
      p2 === 'Uranus' ? 'innovation and change' :
      p2 === 'Mercury' ? 'communication and commerce' :
      'unique energy';
    reading += `The secondary influence comes from your ${p2} ${LINE_CHANNEL_NAME[closestLines[1]?.lineType as LineType] || 'line'} (${formatLineDistance(closestLines[1]?.distance ?? 0)} away), adding a layer of ${secondaryDesc} to your experience here.\n\n`;
  }

  reading += `### Your ${city.name} Story\n\n`;
  reading += `${firstName}, imagine yourself in ${city.name}. `;
  reading += `The ${dominantPlanet} energy that runs through this place activates something real in you — `;
  const storyDesc =
    dominantPlanet === 'Jupiter' ? 'a sense of expansion, possibility, and abundance that you do not feel everywhere' :
    dominantPlanet === 'Venus' ? 'a beauty and harmony in your daily life that makes everything feel more alive' :
    dominantPlanet === 'Sun' ? 'a confidence and creative fire that makes you feel like the fullest version of yourself' :
    dominantPlanet === 'Moon' ? 'an emotional peace and sense of belonging that your soul has been searching for' :
    dominantPlanet === 'Saturn' ? 'a disciplined focus and sense of purpose that builds something lasting' :
    dominantPlanet === 'Mars' ? 'a drive and physical vitality that pushes you to take action and make things happen' :
    dominantPlanet === 'Uranus' ? 'a desire for freedom and reinvention that breaks you out of old patterns' :
    dominantPlanet === 'Neptune' ? 'a spiritual depth and creative inspiration that connects you to something beyond the everyday' :
    dominantPlanet === 'Pluto' ? 'a transformative power that strips away what no longer serves you and reveals who you really are' :
    dominantPlanet === 'Mercury' ? 'a mental clarity and communicative flow that makes ideas come alive' :
    'a unique cosmic resonance';
  reading += `${storyDesc}. `;
  reading += `Whether this is a place to visit, a place to live for a season, or your forever home depends on what you need right now. But the stars say this: **${city.name} sees you**. And that is worth paying attention to.\n`;

  return reading;
}

// ─── Leaflet Map HTML Generator ──────────────────────────────────────────────

function generateMapHTML(
  acgLines: ACGLine[],
  enabledPlanets: Record<string, boolean>,
  selectedCity: CityData | null,
  centerLat: number,
  centerLon: number,
  zoom: number,
  paranLines: ParanLine[],
  showParanLines: boolean,
  birthLat?: number,
  birthLon?: number,
  derivedLines: StyledDerivedLine[] = [],
): string {
  const filteredLines = acgLines.filter(l => enabledPlanets[l.planet] !== false);
  const relevantParans = (showParanLines && selectedCity)
    ? paranLines.filter(p => Math.abs(p.latitude - (selectedCity?.lat ?? centerLat)) <= 5)
    : [];

  const polylineData = filteredLines.map(line => {
    const segments: ACGLinePoint[][] = [];
    let currentSeg: ACGLinePoint[] = [];
    for (let i = 0; i < line.points.length; i++) {
      const pt = line.points[i];
      if (i > 0) {
        const prev = line.points[i - 1];
        if (Math.abs(pt.lon - prev.lon) > 180) {
          if (currentSeg.length > 0) segments.push(currentSeg);
          currentSeg = [];
        }
      }
      currentSeg.push(pt);
    }
    if (currentSeg.length > 0) segments.push(currentSeg);

    return {
      segments,
      color: line.color,
      label: `${getPlanetGlyph(line.planet) || line.planet} ${line.planet} ${line.lineType}`,
      planet: line.planet,
      lineType: line.lineType,
    };
  });

  const marker = selectedCity
    ? `L.marker([${selectedCity.lat}, ${selectedCity.lon}], {
        icon: L.divIcon({
          className: 'custom-pin',
          html: '<div style="width:20px;height:20px;background:#F59E0B;border-radius:50%;border:3px solid #fff;box-shadow:0 0 10px rgba(245,158,11,0.6);"></div>',
          iconSize: [20, 20], iconAnchor: [10, 10],
        })
      }).addTo(map).bindPopup('<b style="color:#F59E0B">${selectedCity.name}</b><br/>${selectedCity.country}');`
    : '';

  const birthMarker = (birthLat !== undefined && birthLon !== undefined)
    ? `L.marker([${birthLat}, ${birthLon}], {
        icon: L.divIcon({
          className: 'birth-pin',
          html: '<div style="width:14px;height:14px;background:#8B5CF6;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px rgba(139,92,246,0.6);"></div>',
          iconSize: [14, 14], iconAnchor: [7, 7],
        })
      }).addTo(map).bindPopup('<b style="color:#8B5CF6">Birth Location</b>');`
    : '';

  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>
  * { margin: 0; padding: 0; }
  html, body, #map { width: 100%; height: 100%; background: #0A0E1A; }
  .leaflet-control-attribution { display: none !important; }
  .line-label {
    background: none !important; border: none !important;
    box-shadow: none !important; padding: 0 !important;
    font-size: 14px; font-weight: 700; white-space: nowrap;
    color: #fff; pointer-events: none;
    text-shadow: 0 0 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7);
  }
  .line-label::before, .leaflet-tooltip-top::before,
  .leaflet-tooltip-bottom::before, .leaflet-tooltip-left::before,
  .leaflet-tooltip-right::before { display: none !important; }
</style>
</head><body>
<div id="map"></div>
<script>
var map = L.map('map', {
  center: [${centerLat}, ${centerLon}],
  zoom: ${zoom},
  zoomControl: true,
  attributionControl: false,
  worldCopyJump: false,
  maxBounds: [[-85, -180], [85, 180]],
  maxBoundsViscosity: 1.0,
  minZoom: 2,
});
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 18, subdomains: 'abcd', noWrap: true,
  bounds: [[-85, -180], [85, 180]],
}).addTo(map);

${polylineData.map(pd => pd.segments.map(seg =>
    `L.polyline([${seg.map(p => `[${p.lat},${p.lon}]`).join(',')}], {
      color: '${pd.color}', weight: 2.5, opacity: 0.85, smoothFactor: 1.5
    }).addTo(map).bindTooltip('${pd.label}', {permanent: false, direction: 'center', className: 'line-label'});`
  ).join('\n')).join('\n')}

${derivedLines.map(line => {
    // Derived (Inner/Essence) layers: same antimeridian segmentation as natal,
    // distinguished by dash pattern + weight + opacity (never color alone).
    const segments: ACGLinePoint[][] = [];
    let seg: ACGLinePoint[] = [];
    for (let i = 0; i < line.points.length; i++) {
      if (i > 0 && Math.abs(line.points[i].lon - line.points[i - 1].lon) > 180) {
        if (seg.length > 0) segments.push(seg);
        seg = [];
      }
      seg.push(line.points[i]);
    }
    if (seg.length > 0) segments.push(seg);
    const label = `${getPlanetGlyph(line.planet) || line.planet} ${line.planet} ${line.layerLabel} ${line.lineType}`;
    return segments.map(s =>
      `L.polyline([${s.map(p => `[${p.lat},${p.lon}]`).join(',')}], {
      color: '${line.color}', weight: ${line.weight}, opacity: ${line.opacityOverride}, smoothFactor: 1.5, dashArray: '${line.dash}'
    }).addTo(map).bindTooltip('${label}', {permanent: false, direction: 'center', className: 'line-label'});`
    ).join('\n');
  }).join('\n')}

${polylineData.map(pd => {
    const midIdx = Math.floor((pd.segments[0]?.length ?? 0) / 2);
    const midPt = pd.segments[0]?.[midIdx];
    if (!midPt) return '';
    return `L.marker([${midPt.lat}, ${midPt.lon}], {
      icon: L.divIcon({
        className: 'line-label',
        html: '<span style="color:${pd.color}">${getPlanetGlyph(pd.planet) || ''} ${pd.lineType}</span>',
        iconSize: [60, 16], iconAnchor: [30, 8],
      }), interactive: false,
    }).addTo(map);`;
  }).join('\n')}

${relevantParans.length > 0 ? relevantParans.map(p => {
    const g1 = getPlanetGlyph(p.planet1) || p.planet1[0];
    const g2 = getPlanetGlyph(p.planet2) || p.planet2[0];
    const label = `${g1} ${p.angle1} / ${g2} ${p.angle2} - ${Math.abs(p.latitude)}deg${p.latitude >= 0 ? 'N' : 'S'}`;
    const escapedLabel = label.replace(/'/g, "\\'");
    return `L.polyline([[${p.latitude}, -180], [${p.latitude}, 180]], {
      color: 'rgba(255, 215, 100, 0.6)', weight: 1.5, opacity: 0.6, dashArray: '8, 6'
    }).addTo(map).bindTooltip('${escapedLabel}', {permanent: false, direction: 'center', className: 'line-label'});`;
  }).join('\n') : ''}

${birthMarker}
${marker}

map.on('click', function(e) {
  window.parent.postMessage(JSON.stringify({
    type: 'mapClick', lat: e.latlng.lat, lng: e.latlng.lng
  }), '*');
});
<\/script>
</body></html>`;
}

// ─── Copy Button ─────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
    >
      <Copy className="w-3 h-3" />
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// ─── Markdown Renderer ──────────────────────────────────────────────────────

function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('## ')) {
          return <h2 key={i} className="text-lg font-bold text-amber-400 mt-4 mb-2">{trimmed.replace('## ', '')}</h2>;
        } else if (trimmed.startsWith('### ')) {
          return <h3 key={i} className="text-base font-semibold text-text-primary mt-3 mb-1">{trimmed.replace('### ', '')}</h3>;
        } else if (trimmed.startsWith('---')) {
          return <hr key={i} className="border-border-primary my-3" />;
        } else if (trimmed.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 pl-2 mb-1">
              <span className="text-amber-400">&bull;</span>
              <InlineBold text={trimmed.slice(2)} className="text-text-secondary text-sm leading-relaxed" />
            </div>
          );
        } else if (trimmed.length > 0) {
          return <p key={i} className="text-text-secondary text-sm leading-relaxed mb-1"><InlineBold text={trimmed} /></p>;
        }
        return <div key={i} className="h-2" />;
      })}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ACGPage() {
  const { profile, session } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acgLines, setAcgLines] = useState<ACGLine[]>([]);
  const [paranLines, setParanLines] = useState<ParanLine[]>([]);
  const [cityScores, setCityScores] = useState<CityScore[]>([]);
  const [enabledPlanets, setEnabledPlanets] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    ACG_PLANETS.forEach(p => m[p] = true);
    return m;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityData[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [showTogglePanel, setShowTogglePanel] = useState(false);
  const [showBest20, setShowBest20] = useState(false);
  const [showParanLines, setShowParanLines] = useState(false);
  const [showParanList, setShowParanList] = useState(false);
  const [readingText, setReadingText] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 20, lon: 0 });
  const [mapZoom, setMapZoom] = useState(2);
  const [expandedBest, setExpandedBest] = useState<CityScore | null>(null);
  const [expandedReadingText, setExpandedReadingText] = useState('');

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const firstName = profile?.display_name?.split(' ')[0] || 'Friend';

  // ── Derived (Inner/Essence) layers — flag-gated, isolated from natal state ──
  const derivedAccess = getDerivedAcgAccess(session?.user?.email);
  const [showDuadLines, setShowDuadLines] = useState(false);
  const [showCompendiumLines, setShowCompendiumLines] = useState(false);
  const [derivedLines, setDerivedLines] = useState<DerivedACGLine[]>([]);
  const [birthMoment, setBirthMoment] = useState<Date | null>(null);
  const [chartPlanets, setChartPlanets] = useState<Array<{ name: string; longitude: number }>>([]);

  // ─── Load & Calculate ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!profile?.birth_date || !profile?.latitude) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const birthData = buildBirthData(profile);
        const chartData = await api.getNatalChart(birthData);

        const allPlanets = chartData.planets || chartData.positions || [];
        const planets = allPlanets.filter(
          (p: any) => ACG_PLANETS.includes(p.name as ACGPlanet)
        );

        const dateStr = profile.birth_date || '';
        const parts = dateStr.split('-').map(Number);
        let yr: number, mo: number, dy: number;
        if (parts[0] > 31) { [yr, mo, dy] = parts; } else { [dy, mo, yr] = parts; }
        const [h, min] = (profile.birth_time || '12:00').split(':').map(Number);
        const tzOff = Math.round((profile.longitude || 0) / 15);
        const utH = (h || 12) + (min || 0) / 60 - tzOff;
        const date = new Date(Date.UTC(yr, mo - 1, dy, Math.floor(utH), Math.round((utH % 1) * 60)));

        const lines = calculateACGLines(planets, date);
        setAcgLines(lines);
        setBirthMoment(date);       // shared with the derived (Inner/Essence) layers
        setChartPlanets(planets);   // shared with the derived (Inner/Essence) layers

        const parans = calculateParanLines(planets, date);
        setParanLines(parans);

        const scores = scoreCities(lines);
        setCityScores(scores);
      } catch (err: any) {
        setError(err.message || 'Failed to calculate ACG lines');
      } finally {
        setLoading(false);
      }
    })();
  }, [profile?.birth_date, profile?.latitude, profile?.longitude, profile?.birth_time]);

  // ─── Map iframe message handler ────────────────────────────────────────────

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.type === 'mapClick') {
          let nearest: CityData | null = null;
          let minDist = Infinity;
          for (const city of WORLD_CITIES_ALL) {
            const d = Math.sqrt(Math.pow(city.lat - data.lat, 2) + Math.pow(city.lon - data.lng, 2));
            if (d < minDist && d < 5) { minDist = d; nearest = city; }
          }
          if (nearest) handleSelectCity(nearest);
        }
      } catch {}
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [acgLines, paranLines]);

  // ─── Search ────────────────────────────────────────────────────────────────

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (text.length < 2) { setSearchResults([]); return; }
    const lower = text.toLowerCase();
    const matches = WORLD_CITIES_ALL.filter(c =>
      c.name.toLowerCase().includes(lower) || c.country.toLowerCase().includes(lower)
    ).slice(0, 10);
    setSearchResults(matches);
  }, []);

  const handleSelectCity = useCallback((city: CityData) => {
    setSelectedCity(city);
    setSearchQuery(city.name);
    setSearchResults([]);
    setMapCenter({ lat: city.lat, lon: city.lon });
    setMapZoom(5);
    setReadingText('');

    // Auto-generate reading
    const reading = generateLocalRelocationReading(
      city, acgLines, firstName, paranLines,
      chartPlanets, derivedAccess.anyEnabled,
    );
    setReadingText(reading);
  }, [acgLines, firstName, paranLines, chartPlanets, derivedAccess.anyEnabled]);

  const togglePlanet = useCallback((planet: string) => {
    setEnabledPlanets(prev => ({ ...prev, [planet]: !prev[planet] }));
  }, []);

  // Derived (Inner/Essence) layers — computed separately so natal lines,
  // city scoring, Best-20, and parans are never affected. With flags off or
  // both toggles off, this effect costs nothing and stores an empty array.
  useEffect(() => {
    if (!derivedAccess.anyEnabled || !birthMoment || chartPlanets.length === 0) {
      setDerivedLines([]);
      return;
    }
    const layers: Array<'duad' | 'compendium'> = [];
    if (derivedAccess.duad && showDuadLines) layers.push('duad');
    if (derivedAccess.compendium && showCompendiumLines) layers.push('compendium');
    if (layers.length === 0) { setDerivedLines([]); return; }
    try {
      setDerivedLines(generateDerivedAcgLines(chartPlanets, birthMoment, { layers }));
    } catch (err) {
      // Derived-layer failure must never affect the natal map.
      console.error('[ACG] derived layer error (natal lines unaffected):', err);
      setDerivedLines([]);
    }
  }, [derivedAccess.anyEnabled, derivedAccess.duad, derivedAccess.compendium, birthMoment, chartPlanets, showDuadLines, showCompendiumLines]);

  // ─── Best 20 ────────────────────────────────────────────────────────────────

  const top20 = useMemo(() => selectTop20(cityScores), [cityScores]);

  const openBestCityReading = useCallback((cs: CityScore) => {
    setExpandedBest(cs);
    const reading = generateLocalRelocationReading(
      cs.city, acgLines, firstName, paranLines,
      chartPlanets, derivedAccess.anyEnabled,
    );
    setExpandedReadingText(reading);
  }, [acgLines, firstName, paranLines, chartPlanets, derivedAccess.anyEnabled]);

  // ─── Map HTML ──────────────────────────────────────────────────────────────

  const styledDerivedLines = useMemo<StyledDerivedLine[]>(() =>
    derivedLines
      .filter(l => enabledPlanets[l.planet] !== false)
      .map(l => ({ ...l, ...DERIVED_LAYER_STYLE[l.layer as 'duad' | 'compendium'] })),
    [derivedLines, enabledPlanets]
  );

  const mapHTML = useMemo(() =>
    generateMapHTML(
      acgLines, enabledPlanets, selectedCity,
      mapCenter.lat, mapCenter.lon, mapZoom,
      paranLines, showParanLines,
      profile?.latitude ?? undefined, profile?.longitude ?? undefined,
      styledDerivedLines,
    ),
    [acgLines, enabledPlanets, selectedCity, mapCenter, mapZoom, paranLines, showParanLines, profile?.latitude, profile?.longitude, styledDerivedLines]
  );

  const mapBlob = useMemo(() => {
    if (!mapHTML) return '';
    const blob = new Blob([mapHTML], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [mapHTML]);

  // Clean up blob URL
  useEffect(() => {
    return () => { if (mapBlob) URL.revokeObjectURL(mapBlob); };
  }, [mapBlob]);

  // ─── Nearest paran lines for selected city ────────────────────────────────

  const nearbyParans = useMemo(() => {
    if (!selectedCity) return [];
    return paranLines.filter(p => Math.abs(p.latitude - selectedCity.lat) <= 5);
  }, [selectedCity, paranLines]);

  // ─── Render ────────────────────────────────────────────────────────────────

  if (!profile?.birth_date || !profile?.latitude) {
    return (
      <PaywallGate feature="acg">
        <div className="max-w-3xl mx-auto">
          <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Readings
          </Link>
          <BirthDataPrompt message="Add your birth data to view your Astro-Cartography map." />
        </div>
      </PaywallGate>
    );
  }

  if (loading) {
    return (
      <PaywallGate feature="acg">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-accent-primary animate-spin mb-4" />
          <p className="text-text-secondary">Calculating Your Planetary Lines...</p>
        </div>
      </PaywallGate>
    );
  }

  if (error) {
    return (
      <PaywallGate feature="acg">
        <div className="max-w-3xl mx-auto">
          <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Readings
          </Link>
          <div className="card text-center py-12">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      </PaywallGate>
    );
  }

  return (
    <PaywallGate feature="acg">
      <div className="max-w-4xl mx-auto">
        <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Readings
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-8 h-8 text-accent-primary" />
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">Astro-Cartography</h1>
            <p className="text-text-tertiary text-sm">{acgLines.length} planetary lines calculated</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative z-50 mb-4">
          <div className="flex items-center gap-2 bg-bg-secondary rounded-xl px-4 h-12 border border-border-primary">
            <Search className="w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search a city..."
              className="flex-1 bg-transparent text-text-primary text-sm outline-none placeholder:text-text-muted"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchQuery.length > 0 && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}>
                <X className="w-4 h-4 text-text-muted hover:text-text-primary" />
              </button>
            )}
          </div>
          {searchResults.length > 0 && (
            <div className="absolute top-14 left-0 right-0 bg-bg-secondary border border-border-primary rounded-xl overflow-hidden shadow-xl z-[200]">
              {searchResults.map((city, i) => (
                <button
                  key={`${city.name}-${city.country}-${i}`}
                  className="flex items-center justify-between w-full px-4 py-3 hover:bg-bg-tertiary transition-colors border-b border-border-primary/30 last:border-b-0"
                  onClick={() => handleSelectCity(city)}
                >
                  <span className="text-sm font-semibold text-text-primary">{city.name}</span>
                  <span className="text-xs text-text-muted">{city.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="card p-0 overflow-hidden mb-4">
          <div className="flex items-center gap-2 px-4 py-3">
            <span className="text-amber-400 text-xl">{getPlanetGlyph('sun') || '☉'}</span>
            <div>
              <p className="text-text-primary text-sm font-bold">Astro-Cartography Map</p>
              <p className="text-text-muted text-xs">{acgLines.length} planetary lines</p>
            </div>
          </div>
          <div className="relative" style={{ height: '450px' }}>
            {mapBlob && (
              <iframe
                ref={iframeRef}
                src={mapBlob}
                className="w-full h-full border-0"
                sandbox="allow-scripts"
                title="ACG Map"
              />
            )}
          </div>

          {/* Selected city indicator */}
          {selectedCity && (
            <div className="flex items-center justify-center gap-2 px-3 py-2 bg-amber-500/10 mx-3 mb-3 rounded-lg">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-semibold">
                {selectedCity.name}, {selectedCity.country}
              </span>
              <span className="text-text-muted text-xs ml-2">
                {Math.abs(selectedCity.lat).toFixed(1)}&deg;{selectedCity.lat >= 0 ? 'N' : 'S'},{' '}
                {Math.abs(selectedCity.lon).toFixed(1)}&deg;{selectedCity.lon >= 0 ? 'E' : 'W'}
              </span>
            </div>
          )}

          {/* Toggle Lines Button */}
          <div className="flex justify-center pb-3">
            <button
              className="px-4 py-1.5 rounded-full bg-bg-secondary border border-border-primary text-text-secondary text-xs font-semibold hover:bg-bg-tertiary transition-colors"
              onClick={() => setShowTogglePanel(!showTogglePanel)}
            >
              {showTogglePanel ? '▼ Hide Lines' : '▲ Show Lines'}
            </button>
          </div>
        </div>

        {/* Planet Toggle Panel */}
        {showTogglePanel && (
          <div className="card mb-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {ACG_PLANETS.map(planet => {
                const enabled = enabledPlanets[planet] !== false;
                const color = PLANET_COLORS[planet];
                return (
                  <button
                    key={planet}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      borderWidth: '1.5px',
                      borderStyle: 'solid',
                      borderColor: enabled ? color : 'transparent',
                      backgroundColor: enabled ? `${color}15` : 'rgba(26,31,54,0.8)',
                      color: enabled ? color : '#6B7280',
                    }}
                    onClick={() => togglePlanet(planet)}
                  >
                    <span className="text-base">{getPlanetGlyph(planet)}</span>
                    <span>{planet}</span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: enabled ? color : '#6B7280' }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Paran Lines Toggle */}
            <div className="border-t border-border-primary pt-3">
              <button
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  showParanLines
                    ? 'bg-amber-500/10 text-amber-300'
                    : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'
                }`}
                onClick={() => setShowParanLines(!showParanLines)}
              >
                <span className="text-base">━</span>
                <span>Paran Lines {showParanLines ? 'ON' : 'OFF'}</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: showParanLines ? '#FFD764' : '#6B7280' }}
                />
              </button>
              <p className="text-text-muted text-xs mt-1 pl-1">
                Horizontal lines where two planets are simultaneously angular
              </p>
            </div>

            {/* Derived layers (Duad–Compendium ACG) — flag-gated, dev preview */}
            {derivedAccess.anyEnabled && (
              <div className="border-t border-border-primary pt-3 mt-3">
                <div className="flex flex-wrap gap-2">
                  {derivedAccess.duad && (
                    <button
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        showDuadLines
                          ? 'bg-violet-500/10 text-violet-300'
                          : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'
                      }`}
                      onClick={() => setShowDuadLines(v => !v)}
                      aria-label={`Inner lines layer, ${showDuadLines ? 'on' : 'off'}`}
                    >
                      <span className="text-base">╌</span>
                      <span>Inner Lines {showDuadLines ? 'ON' : 'OFF'}</span>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: showDuadLines ? '#A78BFA' : '#6B7280' }} />
                    </button>
                  )}
                  {derivedAccess.compendium && (
                    <button
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        showCompendiumLines
                          ? 'bg-amber-500/10 text-amber-300'
                          : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'
                      }`}
                      onClick={() => setShowCompendiumLines(v => !v)}
                      aria-label={`Essence lines layer, ${showCompendiumLines ? 'on' : 'off'}`}
                    >
                      <span className="text-base">┈</span>
                      <span>Essence Lines {showCompendiumLines ? 'ON' : 'OFF'}</span>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: showCompendiumLines ? '#FCD34D' : '#6B7280' }} />
                    </button>
                  )}
                </div>
                <p className="text-text-muted text-xs mt-1 pl-1">
                  Core lines are solid. Inner lines (dashed) show the hidden drive beneath each
                  planet; Essence lines (dotted) show its finest thread. An experimental Align
                  research layer — line meanings are under active validation.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Paran Lines List */}
        {showParanLines && selectedCity && nearbyParans.length > 0 && (
          <div className="card mb-4">
            <button
              className="flex items-center gap-2 w-full text-left"
              onClick={() => setShowParanList(!showParanList)}
            >
              <span className="text-amber-300 text-lg">━</span>
              <span className="text-text-primary text-sm font-semibold flex-1">
                Paran Lines near {selectedCity.name} ({nearbyParans.length})
              </span>
              {showParanList ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
            </button>
            {showParanList && (
              <div className="mt-3 space-y-3">
                {nearbyParans.map((p, i) => {
                  const nearbyCities = WORLD_CITIES_ALL.filter(c => Math.abs(c.lat - p.latitude) <= 2).slice(0, 3);
                  const color1 = PLANET_COLORS[p.planet1] || '#FFFFFF';
                  const color2 = PLANET_COLORS[p.planet2] || '#FFFFFF';
                  return (
                    <div key={i} className="p-3 bg-bg-tertiary rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg" style={{ color: color1 }}>{getPlanetGlyph(p.planet1)}</span>
                        <span className="text-xs text-text-muted">{p.angle1}</span>
                        <span className="text-text-muted text-xs">/</span>
                        <span className="text-lg" style={{ color: color2 }}>{getPlanetGlyph(p.planet2)}</span>
                        <span className="text-xs text-text-muted">{p.angle2}</span>
                        <span className="text-xs text-amber-300 ml-auto">
                          {Math.abs(p.latitude)}&deg;{p.latitude >= 0 ? 'N' : 'S'}
                        </span>
                      </div>
                      <p className="text-text-secondary text-xs leading-relaxed">{p.interpretation}</p>
                      {nearbyCities.length > 0 && (
                        <p className="text-text-muted text-xs mt-1">
                          <span className="font-semibold">Nearby:</span> {nearbyCities.map(c => c.name).join(', ')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Selected City Reading */}
        {selectedCity && readingText && (
          <div className="card mb-4 border border-amber-500/15">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-text-primary">{selectedCity.name}</h3>
                <p className="text-text-muted text-sm">{selectedCity.country}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-muted">
                  {Math.abs(selectedCity.lat).toFixed(1)}&deg;{selectedCity.lat >= 0 ? 'N' : 'S'}
                </p>
                <p className="text-xs text-text-muted">
                  {Math.abs(selectedCity.lon).toFixed(1)}&deg;{selectedCity.lon >= 0 ? 'E' : 'W'}
                </p>
              </div>
            </div>

            {/* Nearest Lines */}
            <div className="mb-4">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Closest Planetary Lines</p>
              {acgLines
                .map(line => ({ ...line, dist: distanceToLine(selectedCity, line) }))
                .sort((a, b) => a.dist - b.dist)
                .slice(0, 5)
                .map((line, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border-primary/30 last:border-b-0">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: line.color }} />
                    <span className="text-base" style={{ color: line.color }}>{getPlanetGlyph(line.planet)}</span>
                    <span className="text-sm text-text-secondary">{line.planet}</span>
                    <span className={`text-sm ml-auto ${
                      line.dist < 5 ? 'text-green-400' : line.dist < 15 ? 'text-amber-400' : 'text-text-muted'
                    }`}>
                      {line.dist.toFixed(1)}&deg;
                    </span>
                    <span className="text-xs text-text-muted ml-1">{line.lineType}</span>
                    <span className="text-xs text-text-muted hidden sm:inline ml-2">
                      {LINE_TYPE_MEANINGS[line.lineType]}
                    </span>
                  </div>
                ))}
            </div>

            {/* Reading */}
            <div className="border-t border-border-primary pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-amber-400 text-sm font-semibold">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Your Relocation Reading
                </p>
                <CopyBtn text={readingText} />
              </div>
              <RenderMarkdown text={readingText} />
            </div>
          </div>
        )}

        {/* Discover Best 20 Places */}
        <div className="mb-6">
          <button
            className={`w-full rounded-xl overflow-hidden ${showBest20 ? '' : ''}`}
            onClick={() => setShowBest20(!showBest20)}
          >
            <div className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all ${
              showBest20
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-gradient-to-r from-purple-600 to-violet-700 text-white'
            }`}>
              <Star className="w-5 h-5" />
              <span>{showBest20 ? 'Hide Best 20 Places' : 'Discover Your Best 20 Places'}</span>
            </div>
          </button>

          {showBest20 && top20.length > 0 && (
            <div className="mt-4 space-y-3">
              {top20.map((cs, i) => {
                const isGold = i < 3;
                const planetColor = PLANET_COLORS[cs.dominantPlanet] || '#8B5CF6';
                return (
                  <button
                    key={`${cs.city.name}-${cs.city.country}`}
                    className="w-full text-left"
                    onClick={() => openBestCityReading(cs)}
                  >
                    <div className={`card border transition-all hover:scale-[1.01] ${
                      isGold ? 'border-amber-500/20' : 'border-border-primary'
                    }`}
                    style={{
                      background: isGold
                        ? 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))'
                        : 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(139,92,246,0.02))',
                    }}
                    >
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-lg font-bold ${isGold ? 'text-amber-400' : 'text-text-muted'}`}>
                          #{i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-text-primary font-semibold">{cs.city.name}</p>
                          <p className="text-text-muted text-xs">{cs.city.country}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
                          isGold ? 'bg-amber-500/15 text-amber-400' : 'bg-purple-500/15 text-purple-400'
                        }`}>
                          {cs.score}
                        </div>
                      </div>

                      {/* Score Bar */}
                      <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.max(5, Math.min(100, (cs.score / (top20[0]?.score || 1)) * 100))}%`,
                            backgroundColor: isGold ? '#F59E0B' : planetColor,
                          }}
                        />
                      </div>

                      {/* Dominant Planet */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: planetColor }} />
                        <span className="text-xs text-text-secondary">
                          {getPlanetGlyph(cs.dominantPlanet)} {cs.dominantPlanet} dominant
                        </span>
                      </div>

                      {/* Tags */}
                      {cs.bestFor.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {cs.bestFor.map((tag, j) => (
                            <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Expanded City Reading Overlay ── */}
        {expandedBest && (
          <div className="fixed inset-0 bg-bg-primary z-50 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-4">
              {/* Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-border-primary mb-4">
                <button
                  onClick={() => { setExpandedBest(null); setExpandedReadingText(''); }}
                  className="text-text-muted hover:text-text-primary text-2xl"
                >
                  &larr;
                </button>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-text-primary">{expandedBest.city.name}</h2>
                  <p className="text-text-muted text-sm">{expandedBest.city.country}</p>
                </div>
                <div className="px-3 py-1 rounded-lg bg-amber-500/15 text-amber-400 text-sm font-bold">
                  {expandedBest.score} pts
                </div>
              </div>

              {/* City Stats */}
              <div className="card mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: PLANET_COLORS[expandedBest.dominantPlanet] || '#8B5CF6' }}
                  />
                  <span className="text-text-primary text-sm font-semibold">
                    {getPlanetGlyph(expandedBest.dominantPlanet)} {expandedBest.dominantPlanet} Dominant
                  </span>
                </div>

                <p className="text-text-muted text-xs uppercase tracking-wider mb-2">Planetary Influences</p>
                {expandedBest.nearestLines.slice(0, 6).map((nl, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-border-primary/20 last:border-b-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PLANET_COLORS[nl.planet] || '#888' }} />
                      <span className="text-sm text-text-secondary">
                        {getPlanetGlyph(nl.planet)} {nl.planet} {nl.lineType}
                      </span>
                    </div>
                    <span className={`text-xs ${
                      nl.distance < 5 ? 'text-green-400' : nl.distance < 15 ? 'text-amber-400' : 'text-text-muted'
                    }`}>
                      {nl.distance.toFixed(0)}&deg; away
                    </span>
                  </div>
                ))}

                {expandedBest.bestFor.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {expandedBest.bestFor.map((tag, j) => (
                      <span key={j} className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Reading */}
              <div className="card border border-amber-500/15">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-amber-400 font-semibold">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Your Life in {expandedBest.city.name}
                  </h3>
                  <CopyBtn text={expandedReadingText} />
                </div>
                {expandedReadingText && <RenderMarkdown text={expandedReadingText} />}
              </div>

              <div className="h-10" />
            </div>
          </div>
        )}
      </div>
    </PaywallGate>
  );
}
