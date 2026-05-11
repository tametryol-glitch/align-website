/**
 * Shared types for the astrology engine pipeline.
 * Extracted from natalCalc.ts — only type definitions, no API calls.
 */

export interface NatalPlanet {
  name: string;
  longitude: number;
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
}

export interface NatalAspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  lon1: number;
  lon2: number;
}

export interface HouseCusp {
  house: number;
  longitude: number;
  sign: string;
  degree: number;
}

export interface NatalChart {
  planets: NatalPlanet[];
  aspects: NatalAspect[];
  houses: HouseCusp[];
  ascendant: number;
  midheaven: number;
}
