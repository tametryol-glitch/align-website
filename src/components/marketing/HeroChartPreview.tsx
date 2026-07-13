'use client';

import { NatalWheel } from '@/components/charts/NatalWheel';

/**
 * A sample natal wheel for the landing page hero, rendered with the same
 * NatalWheel component the app uses for real charts. The placements are an
 * illustrative example chart, not a real person's data.
 */

// Leo rising, Whole-Sign houses
const ASC_DEGREE = 125; // Leo 5°
const MC_DEGREE = 35; // Taurus 5°
const HOUSE_CUSPS = [120, 150, 180, 210, 240, 270, 300, 330, 0, 30, 60, 90];

const SAMPLE_PLANETS = [
  { name: 'Sun', longitude: 237.28, sign: 'Scorpio', degree: 27.28 },
  { name: 'Moon', longitude: 344, sign: 'Pisces', degree: 14 },
  { name: 'Mercury', longitude: 251, sign: 'Sagittarius', degree: 11 },
  { name: 'Venus', longitude: 201, sign: 'Libra', degree: 21 },
  { name: 'Mars', longitude: 129, sign: 'Leo', degree: 9 },
  { name: 'Jupiter', longitude: 44, sign: 'Taurus', degree: 14 },
  { name: 'Saturn', longitude: 321, sign: 'Aquarius', degree: 21 },
  { name: 'Uranus', longitude: 289, sign: 'Capricorn', degree: 19 },
  { name: 'Neptune', longitude: 293, sign: 'Capricorn', degree: 23 },
  { name: 'Pluto', longitude: 234, sign: 'Scorpio', degree: 24 },
];

const SAMPLE_ASPECTS = [
  { planet1: 'Sun', planet2: 'Pluto', type: 'conjunction', orb: 3.3 },
  { planet1: 'Moon', planet2: 'Jupiter', type: 'sextile', orb: 0 },
  { planet1: 'Mars', planet2: 'Mercury', type: 'trine', orb: 2 },
  { planet1: 'Venus', planet2: 'Saturn', type: 'trine', orb: 0 },
  { planet1: 'Uranus', planet2: 'Neptune', type: 'conjunction', orb: 4 },
];

export function HeroChartPreview() {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-bg-card border border-border-primary rounded-3xl p-4 sm:p-6 shadow-2xl shadow-purple-500/10">
        <NatalWheel
          planets={SAMPLE_PLANETS}
          aspects={SAMPLE_ASPECTS}
          houseCusps={HOUSE_CUSPS}
          ascendantDegree={ASC_DEGREE}
          midheavenDegree={MC_DEGREE}
          size={380}
        />
      </div>
      <p className="text-xs text-text-muted mt-3">
        An Align natal wheel — the same chart engine you get, rendered live. Yours is built from your birth details.
      </p>
    </div>
  );
}
