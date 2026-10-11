// Cross-platform parity: align-app/src/utils/__tests__/petTraits.parity.test.ts runs the SAME
// fixture against the app copy of petTraits.ts. If either side drifts, a web person and an
// app person would see different creatures / numbers for the same pet.
import { describe, expect, test } from 'vitest';
import { deriveTraits, liveStats, stageForXp } from '../petTraits';
import fixture from './petTraits.parity.fixture.json';

describe('petTraits parity fixture', () => {
  test('traits are identical to the shared fixture', () => {
    for (const f of fixture.traits) {
      expect(deriveTraits(f.a, f.b)).toEqual(f.traits);
      expect(deriveTraits(f.b, f.a)).toEqual(f.traits);
    }
  });
  test('stats decay is identical to the shared fixture', () => {
    for (const f of fixture.stats) {
      expect(liveStats(f.row, new Date(f.now))).toEqual(f.out);
    }
  });
  test('stages are identical to the shared fixture', () => {
    for (const f of fixture.stages) expect(stageForXp(f.xp)).toBe(f.stage);
  });
});
