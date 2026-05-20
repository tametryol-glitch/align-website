/**
 * Ascendant Body-Code Rectification Filter
 *
 * A first-pass scoring layer that uses birth-sex polarity (compendium)
 * and body-expression polarity (duad) to narrow or score candidate
 * birth times before the existing event-based rectification runs.
 *
 * This file is a pure helper -- no UI, no side effects. It does NOT
 * replace the existing rectification system; it adds a weighted layer
 * that is combined with existing scores.
 *
 * Safe defaults: if answers are missing, every function returns a
 * neutral score/true match so old sessions and skipped questions
 * never crash or eliminate candidates.
 */

import { calculateDuad, calculateCompendium } from './duadCompendium';

// --- Polarity Classification -----------------------------------------------

const MASCULINE_SIGNS = new Set([
  'Aries', 'Gemini', 'Leo', 'Libra', 'Sagittarius', 'Aquarius',
]);

const FEMININE_SIGNS = new Set([
  'Taurus', 'Cancer', 'Virgo', 'Scorpio', 'Capricorn', 'Pisces',
]);

export type BirthSex = 'male' | 'female';
export type BodyExpression = 'masculine' | 'feminine' | 'mixed';
export type SignPolarity = 'masculine' | 'feminine';

/**
 * Returns 'masculine' or 'feminine' for any zodiac sign.
 * Falls back to 'masculine' for unknown input (safe default).
 */
export function getSignPolarity(sign: string): SignPolarity {
  if (FEMININE_SIGNS.has(sign)) return 'feminine';
  return 'masculine';
}

// --- Matching Helpers ------------------------------------------------------

/**
 * Does the Ascendant compendium sign match the user's birth sex?
 * Male -> masculine compendium expected.
 * Female -> feminine compendium expected.
 * Returns null if birthSex is undefined (skip -- no filtering).
 */
export function matchesBirthSexCompendium(
  birthSex: BirthSex | undefined,
  compendiumSign: string,
): boolean | null {
  if (!birthSex) return null; // skip
  const polarity = getSignPolarity(compendiumSign);
  return birthSex === 'male' ? polarity === 'masculine' : polarity === 'feminine';
}

/**
 * Does the Ascendant duad sign match the user's body-expression polarity?
 * 'mixed' always returns true (no filtering).
 * Returns null if expressionPolarity is undefined (skip).
 */
export function matchesDuadExpression(
  expressionPolarity: BodyExpression | undefined,
  duadSign: string,
): boolean | null {
  if (!expressionPolarity || expressionPolarity === 'mixed') return null; // skip
  const polarity = getSignPolarity(duadSign);
  return expressionPolarity === polarity;
}

// --- Candidate Scoring -----------------------------------------------------

export interface BodyCodeAnswers {
  birthSex?: BirthSex;
  bodyExpression?: BodyExpression;
}

export interface BodyCodeScore {
  /** Total body-code points (0-45). */
  score: number;
  /** Human-readable explanation of why this score was given. */
  explanation: string;
  /** Compendium polarity matched birth sex? */
  compendiumMatch: boolean | null;
  /** Duad polarity matched body expression? */
  duadMatch: boolean | null;
}

/**
 * Score a single candidate birth time against the body-code answers.
 *
 * @param ascLongitude  Ecliptic longitude of the candidate Ascendant.
 * @param ascSign       The sign on the Ascendant (used to derive duad/compendium).
 * @param answers       User's body-code answers. Missing = skip that layer.
 *
 * Returns a BodyCodeScore with 0-45 points:
 *   - Compendium birth-sex match: 25 points
 *   - Duad body-expression match: 20 points
 *
 * Missing answers award the full points for that layer (neutral default).
 */
export function scoreBodyCodeCandidate(
  ascLongitude: number,
  ascSign: string,
  answers: BodyCodeAnswers,
): BodyCodeScore {
  const degInSign = ((ascLongitude % 360 + 360) % 360) % 30;
  const duadSign = calculateDuad(ascSign, degInSign);
  const compSign = calculateCompendium(duadSign, degInSign);

  const compMatch = matchesBirthSexCompendium(answers.birthSex, compSign);
  const duadMatch = matchesDuadExpression(answers.bodyExpression, duadSign);

  let compScore = 25; // default: full credit if skipped
  let duadScore = 20;

  const explanationParts: string[] = [];

  // Compendium scoring
  if (compMatch === true) {
    compScore = 25;
    explanationParts.push(
      `Compendium is ${compSign} (${getSignPolarity(compSign)}), matching the user's ${answers.birthSex} birth sex. +25`
    );
  } else if (compMatch === false) {
    compScore = 0;
    explanationParts.push(
      `Compendium is ${compSign} (${getSignPolarity(compSign)}), mismatching the user's ${answers.birthSex} birth sex. +0`
    );
  } else {
    explanationParts.push('Birth sex not provided -- compendium polarity skipped. +25 (neutral)');
  }

  // Duad scoring
  if (duadMatch === true) {
    duadScore = 20;
    explanationParts.push(
      `Duad is ${duadSign} (${getSignPolarity(duadSign)}), matching the user's ${answers.bodyExpression} body expression. +20`
    );
  } else if (duadMatch === false) {
    duadScore = 5; // reduced but not zero -- other evidence may override
    explanationParts.push(
      `Duad is ${duadSign} (${getSignPolarity(duadSign)}), mismatching the user's ${answers.bodyExpression} body expression. +5 (reduced)`
    );
  } else {
    explanationParts.push('Body expression not provided or mixed -- duad polarity skipped. +20 (neutral)');
  }

  return {
    score: compScore + duadScore,
    explanation: explanationParts.join(' '),
    compendiumMatch: compMatch,
    duadMatch: duadMatch,
  };
}

// --- Result Display Helper -------------------------------------------------

export interface BodyCodeMatchResult {
  risingSign: string;
  risingDuad: string;
  risingCompendium: string;
  compendiumPolarity: SignPolarity;
  duadPolarity: SignPolarity;
  compendiumMatchesBirthSex: boolean | null;
  duadMatchesBodyExpression: boolean | null;
  explanation: string;
}

/**
 * Build the display-ready body-code match result for the results screen.
 * Returns null if ascLongitude is missing (graceful skip).
 */
export function buildBodyCodeMatchResult(
  ascLongitude: number | undefined,
  ascSign: string | undefined,
  answers: BodyCodeAnswers,
): BodyCodeMatchResult | null {
  if (ascLongitude == null || !ascSign) return null;

  const degInSign = ((ascLongitude % 360 + 360) % 360) % 30;
  const duadSign = calculateDuad(ascSign, degInSign);
  const compSign = calculateCompendium(duadSign, degInSign);

  const compMatch = matchesBirthSexCompendium(answers.birthSex, compSign);
  const duadMatch = matchesDuadExpression(answers.bodyExpression, duadSign);

  const parts: string[] = [];

  if (compMatch === true) {
    parts.push(
      `The compendium is ${compSign}, a ${getSignPolarity(compSign)} sign, which aligns with the user's ${answers.birthSex} birth sex.`
    );
  } else if (compMatch === false) {
    parts.push(
      `The compendium is ${compSign}, a ${getSignPolarity(compSign)} sign, which does not align with the user's ${answers.birthSex} birth sex. Other chart evidence may still support this time.`
    );
  }

  if (duadMatch === true) {
    parts.push(
      `The duad is ${duadSign}, a ${getSignPolarity(duadSign)} sign, matching the user's ${answers.bodyExpression} body expression.`
    );
  } else if (duadMatch === false) {
    parts.push(
      `The duad is ${duadSign}, a ${getSignPolarity(duadSign)} sign, which differs from the user's ${answers.bodyExpression} body expression.`
    );
  } else if (answers.bodyExpression === 'mixed') {
    parts.push(
      `The duad is ${duadSign} (${getSignPolarity(duadSign)}). The user reported mixed body expression, so both polarities are valid.`
    );
  }

  return {
    risingSign: ascSign,
    risingDuad: duadSign,
    risingCompendium: compSign,
    compendiumPolarity: getSignPolarity(compSign),
    duadPolarity: getSignPolarity(duadSign),
    compendiumMatchesBirthSex: compMatch,
    duadMatchesBodyExpression: duadMatch,
    explanation: parts.join(' ') || 'No body-code answers were provided for this rectification session.',
  };
}
