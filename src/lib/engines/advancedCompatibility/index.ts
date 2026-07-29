// ═══════════════════════════════════════════════════════════════════
// Advanced Compatibility Engines — Barrel Export + Orchestrator
// ═══════════════════════════════════════════════════════════════════

export * from './midpointEngine';
export * from './customRulerships';
export * from './toxicityMeter';
export * from './violenceRiskScoring';
export * from './marriageScoring';
export * from './passionScoring';
export * from './asteroidInterpretations';

import { computeSynastryCompatibility, CompatibilityResult } from '../compatibilityEngine';
import { computeChartMidpoints, findMidpointActivations, computeShadowMidpoints } from './midpointEngine';
import { computePassionScore, PassionResult } from './passionScoring';
import { computeViolenceRiskScore, ViolenceRiskResult } from './violenceRiskScoring';
import { computeMarriageScore, MarriageResult } from './marriageScoring';
import { computeToxicityMeter, ToxicityResult } from './toxicityMeter';

// ═══════════════════════════════════════════════════════════════════
// Full Advanced Compatibility Result
// ═══════════════════════════════════════════════════════════════════

export interface AdvancedCompatibilityResult extends CompatibilityResult {
  passion: PassionResult;
  violenceRisk: ViolenceRiskResult;
  marriage: MarriageResult;
  toxicity: ToxicityResult;
  midpointCount: number;
  midpointActivationCount: number;
}

/**
 * Run the FULL advanced compatibility analysis.
 * Calls the base engine + all advanced scoring modules.
 *
 * Kept byte-for-byte in step with the mobile orchestrator
 * (align-app/src/services/advancedCompatibility/index.ts) so a match
 * computed on either client produces identical passion/marriage/
 * violence/toxicity scores.
 */
export function computeAdvancedCompatibility(
  person1Positions: Array<{ name: string; longitude: number; house?: number }>,
  person2Positions: Array<{ name: string; longitude: number; house?: number }>,
  person1HouseCusps: number[],
  person2HouseCusps: number[],
): AdvancedCompatibilityResult {
  // 1. Run base compatibility engine
  const base = computeSynastryCompatibility(
    person1Positions,
    person2Positions,
    person1HouseCusps,
    person2HouseCusps,
  );

  // 2. Compute midpoints for both charts
  const midpoints1 = computeChartMidpoints(person1Positions);
  const midpoints2 = computeChartMidpoints(person2Positions);
  const shadowMidpoints1 = computeShadowMidpoints(person1Positions);
  const shadowMidpoints2 = computeShadowMidpoints(person2Positions);

  // 3. Find midpoint activations (partner planets hitting your midpoints)
  const activations1 = findMidpointActivations(midpoints1, person2Positions);
  const activations2 = findMidpointActivations(midpoints2, person1Positions);
  const shadowActivations1 = findMidpointActivations(shadowMidpoints1, person2Positions);
  const shadowActivations2 = findMidpointActivations(shadowMidpoints2, person1Positions);

  const allActivations = [...activations1, ...activations2];
  const allShadowActivations = [...shadowActivations1, ...shadowActivations2];

  // 4. Compute Passion score
  const passion = computePassionScore(
    base.aspects,
    person1HouseCusps,
    person2HouseCusps,
    person1Positions,
    person2Positions,
    allActivations,
  );

  // 5. Compute Violence/Control Risk score
  const violenceRisk = computeViolenceRiskScore(
    base.aspects,
    allShadowActivations,
  );

  // 6. Compute Marriage score
  const marriage = computeMarriageScore(
    base.aspects,
    person1Positions,
    person2Positions,
    person1HouseCusps,
    person2HouseCusps,
    allActivations,
  );

  // 7. Compute Toxicity Meter
  const toxicity = computeToxicityMeter(
    base.aspects,
    allShadowActivations,
  );

  return {
    ...base,
    passion,
    violenceRisk,
    marriage,
    toxicity,
    midpointCount: midpoints1.length + midpoints2.length,
    midpointActivationCount: allActivations.length + allShadowActivations.length,
  };
}
