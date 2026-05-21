import { contractReviewLine } from './soulContractEngine';
import { scarReviewLine } from './soulScarEngine';
import type {
  ChoiceRecord,
  ScoreState,
  SoulAscensionGameState,
  SoulCodex,
  SoulEnding,
  SoulReview,
} from './types';

export const INITIAL_SCORES: ScoreState = {
  karma: 0,
  purpose: 0,
  shadow: 0,
  relationship: 0,
  giftMastery: 0,
  soulScarIntensity: 46,
  futureLifetimeDifficulty: 1,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function applyScoreDelta(scores: ScoreState, delta: Partial<ScoreState>): ScoreState {
  return {
    karma: clamp(scores.karma + (delta.karma ?? 0), -100, 100),
    purpose: clamp(scores.purpose + (delta.purpose ?? 0), 0, 100),
    shadow: clamp(scores.shadow + (delta.shadow ?? 0), 0, 100),
    relationship: clamp(scores.relationship + (delta.relationship ?? 0), -100, 100),
    giftMastery: clamp(scores.giftMastery + (delta.giftMastery ?? 0), 0, 100),
    soulScarIntensity: clamp(scores.soulScarIntensity + (delta.soulScarIntensity ?? 0), 0, 100),
    futureLifetimeDifficulty: clamp(scores.futureLifetimeDifficulty + (delta.futureLifetimeDifficulty ?? 0), 1, 10),
  };
}

function pathCount(history: ChoiceRecord[], path: ChoiceRecord['path']): number {
  return history.filter((record) => record.path === path).length;
}

export function selectEnding(state: SoulAscensionGameState): SoulEnding {
  const endings = state.profile.possibleEndings;
  const contract = state.profile.soulContracts[0];
  const scar = state.profile.soulScar;
  const purposeChoices = pathCount(state.choiceHistory, 'purpose');
  const shadowChoices = pathCount(state.choiceHistory, 'shadow');
  const comfortChoices = pathCount(state.choiceHistory, 'comfort');
  const riskChoices = pathCount(state.choiceHistory, 'risk');

  if (state.scores.purpose >= 82 && state.scores.giftMastery >= 70 && contract.status === 'healed' && scar.status === 'healed') {
    return endings.find((ending) => ending.type === 'Mastery Ending') ?? endings[0];
  }
  if (state.scores.karma >= 45 && state.scores.purpose >= 68 && state.shadowIntegration >= 8) {
    return endings.find((ending) => ending.type === 'Liberation Ending') ?? endings[0];
  }
  if (riskChoices >= 1 && state.scores.purpose >= 50 && state.scores.giftMastery >= 35) {
    return endings.find((ending) => ending.type === 'Sacrifice Ending') ?? endings[0];
  }
  if (contract.status === 'healed') {
    return endings.find((ending) => ending.type === 'Soul Contract Healed Ending') ?? endings[0];
  }
  if (state.scores.purpose >= 58 && purposeChoices >= 2) {
    return endings.find((ending) => ending.type === 'Purpose Fulfilled Ending') ?? endings[0];
  }
  if (state.scores.shadow >= 55 || shadowChoices >= 2) {
    return endings.find((ending) => ending.type === 'Shadow Victory Ending') ?? endings[0];
  }
  if (comfortChoices >= 3 || state.scores.karma <= -20) {
    return endings.find((ending) => ending.type === 'Repeated Karma Ending') ?? endings[0];
  }
  return endings.find((ending) => ending.type === 'Partial Growth Ending') ?? endings[0];
}

export function ascensionGainFor(state: SoulAscensionGameState): number {
  const ending = selectEnding(state).type;
  if (ending === 'Mastery Ending') return 3;
  if (ending === 'Liberation Ending' || ending === 'Soul Contract Healed Ending' || ending === 'Purpose Fulfilled Ending') return 2;
  if (ending === 'Sacrifice Ending' || ending === 'Partial Growth Ending') return 1;
  return 0;
}

export function previewNextLifetime(state: SoulAscensionGameState): string {
  const scar = state.profile.soulScar;
  const contract = state.profile.soulContracts[0];
  if (state.scores.shadow >= 55) {
    return `Next lifetime preview: the soul is born where power is easy and peace is expensive. ${scar.name} returns through someone who offers control as love.`;
  }
  if (contract.status === 'failed') {
    return `Next lifetime preview: ${contract.recurringSoulName} returns as ${contract.nextLifetimeReturn}. The vow is harder now, but clearer.`;
  }
  if (scar.status === 'healed') {
    return `Next lifetime preview: the soul enters a gentler doorway. ${scar.name} has become ${scar.transformedGift}, and one future choice will be easier.`;
  }
  if (state.scores.purpose >= 55) {
    return `Next lifetime preview: the North Node road opens earlier. The soul will recognize purpose before the old fear can name it danger.`;
  }
  return `Next lifetime preview: the setting changes, but the first room contains the same question. The soul will meet ${scar.name.toLowerCase()} in a new face.`;
}

export function createSoulReview(state: SoulAscensionGameState): SoulReview {
  const contract = state.profile.soulContracts[0];
  const scar = state.profile.soulScar;
  const comfortChoices = pathCount(state.choiceHistory, 'comfort');
  const shadowChoices = pathCount(state.choiceHistory, 'shadow');
  const purposeChoices = pathCount(state.choiceHistory, 'purpose');
  const riskChoices = pathCount(state.choiceHistory, 'risk');

  return {
    learned: [
      purposeChoices > 0
        ? `The soul learned that ${state.profile.futurePurpose.toLowerCase()} can be chosen before it feels natural.`
        : 'The soul saw the purpose road, but mostly studied it from the threshold.',
      `The old gift remained powerful: ${state.profile.coreGift}.`,
    ],
    repeated: [
      comfortChoices > 0
        ? `${comfortChoices} comfort choice${comfortChoices === 1 ? '' : 's'} repeated the South Node pattern.`
        : 'The comfort path did not lead this lifetime.',
      shadowChoices > 0
        ? `${shadowChoices} shadow choice${shadowChoices === 1 ? '' : 's'} used chart gifts destructively.`
        : 'The shadow was faced without letting it run the whole story.',
    ],
    mastered: [
      state.scores.giftMastery >= 45
        ? `${state.profile.hiddenGift} moved from hidden instinct into usable gift.`
        : 'Gift mastery began, but the soul has not fully trusted the gift yet.',
      riskChoices > 0
        ? 'The soul risked a new identity instead of only improving the old one.'
        : 'The soul kept most risks measured, which preserved safety but limited breakthrough.',
    ],
    unresolved: [
      scar.status === 'healed' ? 'No major scar needs to return in its old form.' : `${scar.name} remains unfinished.`,
      contract.status === 'healed' ? 'The main contract completed.' : `${contract.recurringSoulName} remains tied to the reincarnation loop.`,
    ],
    contractResult: contractReviewLine(contract),
    scarResult: scarReviewLine(scar),
    giftAwakened: state.scores.giftMastery >= 45 ? state.profile.hiddenGift : state.profile.coreGift,
    ending: selectEnding(state),
    ascensionLevelGained: ascensionGainFor(state),
    nextLifetimePreview: previewNextLifetime(state),
  };
}

export function createEmptyCodex(): SoulCodex {
  return {
    pastLives: [],
    soulLessons: [],
    karmicPatterns: [],
    soulScars: [],
    healedScars: [],
    gifts: [],
    relationshipContracts: [],
    prophecyCards: [],
    soulRelics: [],
    memoryFragments: [],
  };
}

export function updateCodexFromReview(state: SoulAscensionGameState): SoulCodex {
  const review = state.soulReview;
  const scar = state.profile.soulScar;
  const unlockedRelics = state.profile.relics.filter((relic) => relic.unlocked);
  const unlockedProphecies = state.profile.prophecyCards.filter((card) => card.unlocked);

  // Helper: deduplicate object arrays by id
  const uniqueById = <T extends { id: string }>(arr: T[]): T[] => {
    const seen = new Set<string>();
    return arr.filter((item) => { if (seen.has(item.id)) return false; seen.add(item.id); return true; });
  };

  return {
    pastLives: Array.from(new Set([...state.codex.pastLives, state.profile.lifetimeTitle])),
    soulLessons: Array.from(new Set([...state.codex.soulLessons, ...(review?.learned ?? [])])),
    karmicPatterns: Array.from(new Set([...state.codex.karmicPatterns, state.profile.pastLifePattern])),
    soulScars: scar.status === 'healed' ? state.codex.soulScars : uniqueById([...state.codex.soulScars, scar]),
    healedScars: scar.status === 'healed' ? uniqueById([...state.codex.healedScars, scar]) : state.codex.healedScars,
    gifts: Array.from(new Set([...state.codex.gifts, state.profile.coreGift, state.profile.hiddenGift, review?.giftAwakened].filter(Boolean) as string[])),
    relationshipContracts: uniqueById([...state.codex.relationshipContracts, ...state.profile.soulContracts]),
    prophecyCards: uniqueById([...state.codex.prophecyCards, ...unlockedProphecies]),
    soulRelics: uniqueById([...state.codex.soulRelics, ...unlockedRelics]),
    memoryFragments: Array.from(new Set([
      ...state.codex.memoryFragments,
      `${state.profile.avatarName}: ${state.profile.incarnationReveal}`,
      ...(review ? [review.ending.title] : []),
    ])),
  };
}
