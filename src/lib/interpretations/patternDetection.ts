/**
 * Aspect Pattern Detection Engine
 */
import type { ChartPlanet, ChartAspect } from './patternTypes';
import { type DetectedPattern, type PatternMember, isAllowedBody, canonicalBodyName, normLon, angularDist, isAspect, buildDedupeKey, orbScore, SIGN_ELEMENTS } from './patternTypes';

const ORB_SEXTILE = 5; const ORB_SQUARE = 7; const ORB_TRINE = 7; const ORB_OPPOSITION = 8; const ORB_QUINCUNX = 3;

interface Body { name: string; sign: string; house: number; lon: number; }

function filterAllowedBodies(planets: ChartPlanet[]): Body[] {
  return planets.filter(p => isAllowedBody(p.name)).map(p => ({ name: canonicalBodyName(p.name), sign: p.sign, house: p.house, lon: normLon(p.longitude) }));
}
function toMember(b: Body, role: PatternMember['role'] = 'member'): PatternMember {
  return { name: b.name, sign: b.sign, house: b.house, longitude: b.lon, role };
}
function aspectOrb(a: number, b: number, target: number): number { return Math.abs(angularDist(a, b) - target); }

export function detectAspectPatterns(planets: ChartPlanet[], _aspects: ChartAspect[]): DetectedPattern[] {
  const bodies = filterAllowedBodies(planets);
  if (bodies.length < 3) return [];
  const seen = new Set<string>();
  const results: DetectedPattern[] = [];
  detectGrandTrines(bodies, seen, results);
  detectKites(bodies, results, seen);
  detectTSquares(bodies, seen, results);
  detectGrandCrosses(bodies, seen, results);
  detectYods(bodies, results, seen);
  detectMysticRectangles(bodies, seen, results);
  detectMinorGrandTrines(bodies, results, seen);
  detectStelliums(bodies, seen, results);
  results.sort((a, b) => b.score - a.score);
  return results;
}

function detectGrandTrines(bodies: Body[], seen: Set<string>, out: DetectedPattern[]) {
  const n = bodies.length;
  for (let i = 0; i < n - 2; i++) {
    for (let j = i + 1; j < n - 1; j++) {
      if (!isAspect(bodies[i].lon, bodies[j].lon, 120, ORB_TRINE)) continue;
      for (let k = j + 1; k < n; k++) {
        if (!isAspect(bodies[i].lon, bodies[k].lon, 120, ORB_TRINE)) continue;
        if (!isAspect(bodies[j].lon, bodies[k].lon, 120, ORB_TRINE)) continue;
        const members = [bodies[i], bodies[j], bodies[k]];
        const key = buildDedupeKey('Grand Trine', members.map(m => m.name));
        if (seen.has(key)) continue; seen.add(key);
        const orbs = [aspectOrb(bodies[i].lon, bodies[j].lon, 120), aspectOrb(bodies[i].lon, bodies[k].lon, 120), aspectOrb(bodies[j].lon, bodies[k].lon, 120)];
        const element = dominantElement(members);
        out.push({ type: 'Grand Trine', members: members.map(m => toMember(m)), score: orbScore(orbs, ORB_TRINE), dedupeKey: key, geometry: `${element} Grand Trine: ${members.map(m => `${m.name} in ${m.sign}`).join(' - ')}` });
      }
    }
  }
}

function detectKites(bodies: Body[], out: DetectedPattern[], seen: Set<string>) {
  const trines = out.filter(p => p.type === 'Grand Trine');
  for (const gt of trines) {
    const verts = gt.members;
    for (const body of bodies) {
      if (verts.some(v => v.name === body.name)) continue;
      for (let vi = 0; vi < 3; vi++) {
        const oppTarget = verts[vi]; const other1 = verts[(vi + 1) % 3]; const other2 = verts[(vi + 2) % 3];
        if (!isAspect(body.lon, oppTarget.longitude, 180, ORB_OPPOSITION)) continue;
        if (!isAspect(body.lon, other1.longitude, 60, ORB_SEXTILE)) continue;
        if (!isAspect(body.lon, other2.longitude, 60, ORB_SEXTILE)) continue;
        const members = [...verts.map(v => ({ ...v })), toMember(body, 'focal')];
        const focalMember = toMember(body, 'focal');
        const key = buildDedupeKey('Kite', members.map(m => m.name), body.name);
        if (seen.has(key)) continue; seen.add(key);
        const orbs = [aspectOrb(body.lon, oppTarget.longitude, 180), aspectOrb(body.lon, other1.longitude, 60), aspectOrb(body.lon, other2.longitude, 60)];
        out.push({ type: 'Kite', members, focalPoint: focalMember, score: orbScore(orbs, ORB_OPPOSITION), dedupeKey: key, geometry: `Kite: ${body.name} in ${body.sign} focuses energy from Grand Trine through opposition to ${oppTarget.name}` });
      }
    }
  }
}

function detectTSquares(bodies: Body[], seen: Set<string>, out: DetectedPattern[]) {
  const n = bodies.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      if (!isAspect(bodies[i].lon, bodies[j].lon, 180, ORB_OPPOSITION)) continue;
      for (let k = 0; k < n; k++) {
        if (k === i || k === j) continue;
        if (!isAspect(bodies[i].lon, bodies[k].lon, 90, ORB_SQUARE)) continue;
        if (!isAspect(bodies[j].lon, bodies[k].lon, 90, ORB_SQUARE)) continue;
        const apex = bodies[k];
        const key = buildDedupeKey('T-Square', [bodies[i].name, bodies[j].name, apex.name], apex.name);
        if (seen.has(key)) continue; seen.add(key);
        const orbs = [aspectOrb(bodies[i].lon, bodies[j].lon, 180), aspectOrb(bodies[i].lon, apex.lon, 90), aspectOrb(bodies[j].lon, apex.lon, 90)];
        const missingLon = normLon(apex.lon + 180);
        const missingSign = lonToSign(missingLon);
        const missingHouse = estimateHouse(missingLon, bodies);
        out.push({ type: 'T-Square', members: [toMember(bodies[i]), toMember(bodies[j]), toMember(apex, 'apex')], focalPoint: toMember(apex, 'apex'), missingLeg: { sign: missingSign, house: missingHouse, longitude: missingLon }, score: orbScore(orbs, ORB_OPPOSITION), dedupeKey: key, geometry: `T-Square: ${bodies[i].name} opposes ${bodies[j].name}, both square apex ${apex.name} in ${apex.sign}. Missing leg in ${missingSign}.` });
      }
    }
  }
}

function detectGrandCrosses(bodies: Body[], seen: Set<string>, out: DetectedPattern[]) {
  const n = bodies.length;
  for (let a = 0; a < n - 3; a++) {
    for (let b = a + 1; b < n - 2; b++) {
      if (!isAspect(bodies[a].lon, bodies[b].lon, 90, ORB_SQUARE)) continue;
      for (let c = b + 1; c < n - 1; c++) {
        if (!isAspect(bodies[b].lon, bodies[c].lon, 90, ORB_SQUARE)) continue;
        if (!isAspect(bodies[a].lon, bodies[c].lon, 180, ORB_OPPOSITION)) continue;
        for (let d = c + 1; d < n; d++) {
          if (!isAspect(bodies[c].lon, bodies[d].lon, 90, ORB_SQUARE)) continue;
          if (!isAspect(bodies[a].lon, bodies[d].lon, 90, ORB_SQUARE)) continue;
          if (!isAspect(bodies[b].lon, bodies[d].lon, 180, ORB_OPPOSITION)) continue;
          const group = [bodies[a], bodies[b], bodies[c], bodies[d]];
          const key = buildDedupeKey('Grand Cross', group.map(g => g.name));
          if (seen.has(key)) continue; seen.add(key);
          const orbs = [aspectOrb(bodies[a].lon, bodies[b].lon, 90), aspectOrb(bodies[b].lon, bodies[c].lon, 90), aspectOrb(bodies[c].lon, bodies[d].lon, 90), aspectOrb(bodies[a].lon, bodies[d].lon, 90)];
          out.push({ type: 'Grand Cross', members: group.map(g => toMember(g)), score: orbScore(orbs, ORB_SQUARE), dedupeKey: key, geometry: `${dominantModality(group)} Grand Cross: ${group.map(g => `${g.name} in ${g.sign}`).join(' - ')}` });
        }
      }
    }
  }
}

function detectYods(bodies: Body[], out: DetectedPattern[], seen: Set<string>) {
  const n = bodies.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      if (!isAspect(bodies[i].lon, bodies[j].lon, 60, ORB_SEXTILE)) continue;
      for (let k = 0; k < n; k++) {
        if (k === i || k === j) continue;
        if (!isAspect(bodies[i].lon, bodies[k].lon, 150, ORB_QUINCUNX)) continue;
        if (!isAspect(bodies[j].lon, bodies[k].lon, 150, ORB_QUINCUNX)) continue;
        const apex = bodies[k]; const base1 = bodies[i]; const base2 = bodies[j];
        let boomerangBody: Body | undefined;
        for (let m = 0; m < n; m++) {
          if (m === i || m === j || m === k) continue;
          if (isAspect(apex.lon, bodies[m].lon, 180, ORB_OPPOSITION)) { boomerangBody = bodies[m]; break; }
        }
        if (boomerangBody) {
          const bKey = buildDedupeKey('Boomerang Yod', [base1.name, base2.name, apex.name, boomerangBody.name], apex.name);
          if (!seen.has(bKey)) {
            seen.add(bKey);
            const orbs = [aspectOrb(base1.lon, base2.lon, 60), aspectOrb(base1.lon, apex.lon, 150), aspectOrb(base2.lon, apex.lon, 150), aspectOrb(apex.lon, boomerangBody.lon, 180)];
            out.push({ type: 'Boomerang Yod', members: [toMember(base1), toMember(base2), toMember(apex, 'apex'), toMember(boomerangBody, 'release')], focalPoint: toMember(apex, 'apex'), score: orbScore(orbs, ORB_QUINCUNX), dedupeKey: bKey, geometry: `Boomerang Yod: ${base1.name} sextile ${base2.name}, both quincunx ${apex.name} in ${apex.sign}. ${boomerangBody.name} opposes the apex as release point.` });
          }
        }
        const yKey = buildDedupeKey('Yod', [base1.name, base2.name, apex.name], apex.name);
        if (!seen.has(yKey)) {
          seen.add(yKey);
          const orbs = [aspectOrb(base1.lon, base2.lon, 60), aspectOrb(base1.lon, apex.lon, 150), aspectOrb(base2.lon, apex.lon, 150)];
          out.push({ type: 'Yod', members: [toMember(base1), toMember(base2), toMember(apex, 'apex')], focalPoint: toMember(apex, 'apex'), score: orbScore(orbs, ORB_QUINCUNX), dedupeKey: yKey, geometry: `Yod (Finger of God): ${base1.name} sextile ${base2.name}, both quincunx apex ${apex.name} in ${apex.sign}` });
        }
      }
    }
  }
}

function detectMysticRectangles(bodies: Body[], seen: Set<string>, out: DetectedPattern[]) {
  const n = bodies.length;
  for (let a = 0; a < n - 3; a++) {
    for (let b = a + 1; b < n - 2; b++) {
      if (!isAspect(bodies[a].lon, bodies[b].lon, 180, ORB_OPPOSITION)) continue;
      for (let c = b + 1; c < n - 1; c++) {
        for (let d = c + 1; d < n; d++) {
          if (!isAspect(bodies[c].lon, bodies[d].lon, 180, ORB_OPPOSITION)) continue;
          const config1 = isAspect(bodies[a].lon, bodies[c].lon, 120, ORB_TRINE) && isAspect(bodies[a].lon, bodies[d].lon, 60, ORB_SEXTILE) && isAspect(bodies[b].lon, bodies[c].lon, 60, ORB_SEXTILE) && isAspect(bodies[b].lon, bodies[d].lon, 120, ORB_TRINE);
          const config2 = isAspect(bodies[a].lon, bodies[c].lon, 60, ORB_SEXTILE) && isAspect(bodies[a].lon, bodies[d].lon, 120, ORB_TRINE) && isAspect(bodies[b].lon, bodies[c].lon, 120, ORB_TRINE) && isAspect(bodies[b].lon, bodies[d].lon, 60, ORB_SEXTILE);
          if (!config1 && !config2) continue;
          const group = [bodies[a], bodies[b], bodies[c], bodies[d]];
          const key = buildDedupeKey('Mystic Rectangle', group.map(g => g.name));
          if (seen.has(key)) continue; seen.add(key);
          out.push({ type: 'Mystic Rectangle', members: group.map(g => toMember(g)), score: 75, dedupeKey: key, geometry: `Mystic Rectangle: ${group.map(g => `${g.name} in ${g.sign}`).join(', ')}` });
        }
      }
    }
  }
}

function detectMinorGrandTrines(bodies: Body[], out: DetectedPattern[], seen: Set<string>) {
  const n = bodies.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      if (!isAspect(bodies[i].lon, bodies[j].lon, 120, ORB_TRINE)) continue;
      for (let k = 0; k < n; k++) {
        if (k === i || k === j) continue;
        if (!isAspect(bodies[i].lon, bodies[k].lon, 60, ORB_SEXTILE)) continue;
        if (!isAspect(bodies[j].lon, bodies[k].lon, 60, ORB_SEXTILE)) continue;
        const focal = bodies[k];
        const key = buildDedupeKey('Minor Grand Trine', [bodies[i].name, bodies[j].name, focal.name], focal.name);
        if (seen.has(key)) continue; seen.add(key);
        const orbs = [aspectOrb(bodies[i].lon, bodies[j].lon, 120), aspectOrb(bodies[i].lon, focal.lon, 60), aspectOrb(bodies[j].lon, focal.lon, 60)];
        out.push({ type: 'Minor Grand Trine', members: [toMember(bodies[i]), toMember(bodies[j]), toMember(focal, 'focal')], focalPoint: toMember(focal, 'focal'), score: orbScore(orbs, ORB_TRINE), dedupeKey: key, geometry: `Minor Grand Trine: ${bodies[i].name} trine ${bodies[j].name}, both sextile focal ${focal.name} in ${focal.sign}` });
      }
    }
  }
}

function detectStelliums(bodies: Body[], seen: Set<string>, out: DetectedPattern[]) {
  const groups: Record<string, Body[]> = {};
  for (const b of bodies) { if (!groups[b.sign]) groups[b.sign] = []; groups[b.sign].push(b); }
  for (const [sign, group] of Object.entries(groups)) {
    if (group.length < 3) continue;
    const key = buildDedupeKey('Stellium', group.map(g => g.name));
    if (seen.has(key)) continue; seen.add(key);
    const lons = group.map(g => g.lon); const span = maxSpan(lons);
    const tightness = Math.max(0, 100 - span * 2); const sizeBonus = Math.min((group.length - 3) * 10, 20);
    out.push({ type: 'Stellium', members: group.map(g => toMember(g)), score: Math.round(tightness + sizeBonus), dedupeKey: key, geometry: `${group.length}-planet Stellium in ${sign}: ${group.map(g => g.name).join(', ')}` });
  }
}

function lonToSign(lon: number): string {
  const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  return signs[Math.floor(normLon(lon) / 30)];
}
function estimateHouse(lon: number, bodies: Body[]): number {
  let closest = bodies[0]; let minDist = 360;
  for (const b of bodies) { const d = angularDist(lon, b.lon); if (d < minDist) { minDist = d; closest = b; } }
  return closest?.house || 1;
}
function dominantElement(members: Body[]): string {
  const counts: Record<string, number> = {};
  for (const m of members) { const el = SIGN_ELEMENTS[m.sign] || 'Unknown'; counts[el] = (counts[el] || 0) + 1; }
  let best = 'Mixed'; let bestCount = 0;
  for (const [el, c] of Object.entries(counts)) { if (c > bestCount) { best = el; bestCount = c; } }
  return bestCount >= 2 ? best : 'Mixed-element';
}
const SIGN_MODALITIES_LOCAL: Record<string, string> = { Aries: 'Cardinal', Taurus: 'Fixed', Gemini: 'Mutable', Cancer: 'Cardinal', Leo: 'Fixed', Virgo: 'Mutable', Libra: 'Cardinal', Scorpio: 'Fixed', Sagittarius: 'Mutable', Capricorn: 'Cardinal', Aquarius: 'Fixed', Pisces: 'Mutable' };
function dominantModality(members: Body[]): string {
  const counts: Record<string, number> = {};
  for (const m of members) { const mod = SIGN_MODALITIES_LOCAL[m.sign] || 'Unknown'; counts[mod] = (counts[mod] || 0) + 1; }
  let best = 'Mixed'; let bestCount = 0;
  for (const [mod, c] of Object.entries(counts)) { if (c > bestCount) { best = mod; bestCount = c; } }
  return bestCount >= 2 ? best : 'Mixed-modality';
}
function maxSpan(lons: number[]): number {
  if (lons.length < 2) return 0;
  const sorted = [...lons].sort((a, b) => a - b);
  let maxGap = 0;
  for (let i = 1; i < sorted.length; i++) maxGap = Math.max(maxGap, sorted[i] - sorted[i - 1]);
  maxGap = Math.max(maxGap, 360 - sorted[sorted.length - 1] + sorted[0]);
  return 360 - maxGap;
}
