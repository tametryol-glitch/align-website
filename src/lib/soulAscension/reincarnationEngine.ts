import { buildAvatarCore } from './avatarGeneration';
import { normalizeSoulAscensionChart } from './chartAdapter';
import { completeLifetimeProfile } from './lifetimeGeneration';
import { createEmptyCodex, INITIAL_SCORES } from './progressionEngine';
import { createProphecyCards } from './prophecyCardEngine';
import { createSoulRelics } from './relicEngine';
import { createSoulContracts } from './soulContractEngine';
import { createSoulScar } from './soulScarEngine';
import type {
  NormalizedChart,
  ReincarnationContext,
  ScoreState,
  SoulAscensionChartInput,
  SoulAscensionGameState,
  SoulCodex,
  SoulProfile,
} from './types';

function nowIso(): string {
  return new Date().toISOString();
}

function initialScores(context?: ReincarnationContext): ScoreState {
  const previous = context?.previousScores;
  if (!previous) return INITIAL_SCORES;
  return {
    ...INITIAL_SCORES,
    karma: Math.max(-20, Math.min(35, Math.round(previous.karma * 0.25))),
    purpose: Math.max(0, Math.min(18, Math.round(previous.purpose * 0.18))),
    shadow: Math.max(0, Math.min(30, Math.round(previous.shadow * 0.35))),
    giftMastery: Math.max(0, Math.min(20, Math.round(previous.giftMastery * 0.2))),
    soulScarIntensity: context?.unresolvedScar ? Math.min(70, context.unresolvedScar.intensity + 6) : INITIAL_SCORES.soulScarIntensity,
    futureLifetimeDifficulty: Math.max(1, Math.min(10, previous.futureLifetimeDifficulty)),
  };
}

export function createSoulProfile(chart: NormalizedChart, context?: ReincarnationContext): SoulProfile {
  const contracts = createSoulContracts(chart, context?.failedContract);
  const scar = createSoulScar(chart, context?.unresolvedScar);
  const relics = createSoulRelics(chart);
  const prophecyCards = createProphecyCards(chart);
  const avatarCore = buildAvatarCore(chart, scar, contracts, relics, prophecyCards, context);
  return completeLifetimeProfile(chart, avatarCore, context);
}

export function createSoulAscensionGame(
  chartInput?: SoulAscensionChartInput | null,
  context?: ReincarnationContext,
  codex?: SoulCodex,
): SoulAscensionGameState {
  const chart = normalizeSoulAscensionChart(chartInput);
  const profile = createSoulProfile(chart, context);
  const timestamp = nowIso();
  return {
    version: 1,
    chart,
    profile,
    scores: initialScores(context),
    currentChapterIndex: 0,
    ascensionLevel: context?.ascensionLevel ?? 1,
    lifetimeIndex: context?.lifetimeIndex ?? 1,
    soulXp: 0,
    purposeXp: 0,
    shadowIntegration: 0,
    choiceHistory: [],
    completedMissionIds: [],
    codex: codex ?? createEmptyCodex(),
    journalEntries: [],
    phase: 'home',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function reincarnateFromReview(state: SoulAscensionGameState): SoulAscensionGameState {
  const unresolvedScar = state.profile.soulScar.status === 'healed' ? undefined : state.profile.soulScar;
  const failedContract = state.profile.soulContracts.find((contract) => contract.status !== 'healed');
  return createSoulAscensionGame(
    {
      placements: Object.values(state.chart.placements),
      aspects: state.chart.aspects,
    },
    {
      lifetimeIndex: state.lifetimeIndex + 1,
      ascensionLevel: state.ascensionLevel + (state.soulReview?.ascensionLevelGained ?? 0),
      unresolvedScar,
      failedContract,
      previousScores: state.scores,
    },
    state.codex,
  );
}
