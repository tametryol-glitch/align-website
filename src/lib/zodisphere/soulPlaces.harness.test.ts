/**
 * Dev harness — NOT a strict unit test. Builds draconic-composite soul-lines
 * from two synthetic charts, scans the REAL bundled city list, and prints the
 * top soul places so we can *feel* the output before investing in UI.
 * Run: npx vitest run src/lib/zodisphere/soulPlaces.harness.test.ts
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { gmstAtMoment } from '@/lib/engines/derivedAcgLines';
import {
  draconicCompositeLongitudes,
  projectDraconicCompositeLines,
  findSoulPlaces,
  type DraconicCompositeResult,
} from './soulPlaces';

// Two fabricated charts (name → ecliptic longitude), incl. each person's node.
const A = new Map<string, number>([
  ['Sun', 15], ['Moon', 200], ['Mercury', 25], ['Venus', 350], ['Mars', 120],
  ['Jupiter', 60], ['Saturn', 300], ['Uranus', 40], ['Neptune', 330], ['Pluto', 280],
  ['North Node', 10],
]);
const B = new Map<string, number>([
  ['Sun', 190], ['Moon', 45], ['Mercury', 175], ['Venus', 210], ['Mars', 5],
  ['Jupiter', 250], ['Saturn', 100], ['Uranus', 220], ['Neptune', 150], ['Pluto', 88],
  ['North Node', 260],
]);

describe('Soul Places — dev harness over real cities.json', () => {
  it('finds and prints soul places for two sample charts', () => {
    const cities = JSON.parse(
      readFileSync(resolve(process.cwd(), 'public/geo/cities.json'), 'utf8'),
    ) as Array<[string, number, number]>;

    const { compositeLon } = draconicCompositeLongitudes(A, A.get('North Node')!, B, B.get('North Node')!);
    const gmst = gmstAtMoment(new Date(Date.UTC(1990, 5, 15, 12, 0)));
    const lines = projectDraconicCompositeLines(compositeLon, gmst);
    const result: DraconicCompositeResult = { lines, compositeLon, unavailable: [] };

    const places = findSoulPlaces(result, cities, 50, 6);

    console.log(`\n=== SOUL PLACES (${places.length} within 50 mi, of ${cities.length} cities) ===\n`);
    for (const p of places) {
      console.log(`📍 ${p.city}  —  ${p.reading.headline}  (${Math.round(p.distanceMiles)} mi)`);
      console.log(`   ${p.reading.narrative.split('\n\n')[0].replace(/\*\*/g, '')}`);
      console.log(`   ↳ ${p.reading.whatCouldHaveBeen}\n`);
    }

    expect(places.length).toBeGreaterThan(0);
    expect(places[0].reading.narrative).toMatch(/two of you/i);
  });
});
