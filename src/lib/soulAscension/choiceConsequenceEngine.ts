import { maybeUnlockProphecy } from './prophecyCardEngine';
import { applyScoreDelta, createSoulReview, updateCodexFromReview } from './progressionEngine';
import { maybeUnlockRelic } from './relicEngine';
import { resolveContractStatus } from './soulContractEngine';
import { evolveSoulScar } from './soulScarEngine';
import type { MissionResolution, SoulAscensionGameState } from './types';

function nowIso(): string {
  return new Date().toISOString();
}

export function chooseMissionOption(state: SoulAscensionGameState, choiceId: string): SoulAscensionGameState {
  const mission = state.profile.chapterMissions[state.currentChapterIndex];
  if (!mission) return state;
  const choice = mission.choices.find((item) => item.id === choiceId);
  if (!choice) return state;

  const scoresAfter = applyScoreDelta(state.scores, choice.effects);
  const contract = state.profile.soulContracts[0];
  const nextStatus = resolveContractStatus(contract.status, choice.path, scoresAfter.relationship);
  const nextContracts = state.profile.soulContracts.map((item, index) => index === 0 ? { ...item, status: nextStatus } : item);
  const nextScar = evolveSoulScar(
    { ...state.profile.soulScar, intensity: scoresAfter.soulScarIntensity },
    scoresAfter.purpose,
    scoresAfter.shadow,
  );
  const unlockedRelic = maybeUnlockRelic(state.profile.relics, mission.chapterNumber, choice.path);
  const unlockedProphecy = maybeUnlockProphecy(state.profile.prophecyCards, mission.chapterNumber, choice.path);
  const nextRelics = state.profile.relics.map((item) => unlockedRelic && item.id === unlockedRelic.id ? unlockedRelic : item);
  const nextCards = state.profile.prophecyCards.map((item) => unlockedProphecy && item.id === unlockedProphecy.id ? unlockedProphecy : item);

  const resolution: MissionResolution = {
    mission,
    choice,
    scoresAfter,
    unlockedRelic,
    unlockedProphecy,
    contractStatus: nextStatus,
    soulScarStatus: nextScar.status,
    continueLabel: mission.chapterNumber >= state.profile.chapterMissions.length ? 'Enter Soul Review' : 'Continue',
  };

  return {
    ...state,
    profile: {
      ...state.profile,
      soulContracts: nextContracts,
      soulScar: nextScar,
      relics: nextRelics,
      prophecyCards: nextCards,
    },
    scores: scoresAfter,
    soulXp: state.soulXp + (choice.effects.soulXp ?? 0),
    purposeXp: state.purposeXp + (choice.effects.purposeXp ?? 0),
    shadowIntegration: state.shadowIntegration + (choice.effects.shadowIntegration ?? 0),
    choiceHistory: [
      ...state.choiceHistory,
      {
        missionId: mission.id,
        choiceId: choice.id,
        path: choice.path,
        effects: choice.effects,
        consequenceText: choice.consequenceText,
      },
    ],
    completedMissionIds: Array.from(new Set([...state.completedMissionIds, mission.id])),
    lastResolution: resolution,
    phase: 'mission',
    updatedAt: nowIso(),
  };
}

export function continueAfterMission(state: SoulAscensionGameState): SoulAscensionGameState {
  if (!state.lastResolution) return state;
  const nextChapterIndex = state.currentChapterIndex + 1;
  if (nextChapterIndex >= state.profile.chapterMissions.length) {
    const review = createSoulReview(state);
    const withReview: SoulAscensionGameState = {
      ...state,
      soulReview: review,
      phase: 'review',
      lastResolution: undefined,
      updatedAt: nowIso(),
    };
    return {
      ...withReview,
      codex: updateCodexFromReview(withReview),
    };
  }
  return {
    ...state,
    currentChapterIndex: nextChapterIndex,
    lastResolution: undefined,
    phase: 'mission',
    updatedAt: nowIso(),
  };
}
