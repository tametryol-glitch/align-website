/**
 * Client-side astrology engines — barrel export.
 * All engines are pure functions (deterministic, no API calls).
 */

// Shared types
export type { NatalChart, NatalPlanet, NatalAspect, HouseCusp } from './types';

// Soul Gifts
export { computeSoulGifts, chartSignature as soulGiftsSignature, scoreBand } from './soulGiftsEngine';
export type { SoulGiftsResult, ScoredGift, MatchedReason } from './soulGiftsEngine';

// Soul Memory (Past Lives)
export { computeSoulMemory, chartSignature as soulMemorySignature, confidenceBand } from './soulMemoryEngine';
export type { SoulMemoryResult, ScoredArchetype, ScoredEra, ScoredRegion, ScoredStarMemory, ReasonRow } from './soulMemoryEngine';

// Compatibility
export { computeSynastryCompatibility } from './compatibilityEngine';
export type { CompatibilityResult } from './compatibilityEngine';

// Duad/Compendium
export { getFullDuadCompendium, calculateDuad, calculateCompendium, shortDuadInsight, interpretDuadCompendium, getDuadInterpretation } from './duadCompendium';
export type { DuadCompendiumResult } from './duadCompendium';
