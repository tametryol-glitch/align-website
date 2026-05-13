import { useAuthStore } from '@/stores/authStore';
import { api, buildBirthData } from './api';
import type { DreamAstrologyContext } from './dreamService';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

function findPlanet(positions: any[], name: string): any | undefined {
  return positions?.find((p: any) => p.name === name);
}

function planetsInHouse(positions: any[], house: number): string[] {
  return (positions || [])
    .filter((p: any) => p.house === house && !['Ascendant', 'MC', 'Descendant', 'IC'].includes(p.name))
    .map((p: any) => p.name);
}

function houseSignFromCusps(cusps: number[], houseNum: number): string | undefined {
  const lon = cusps?.[houseNum - 1];
  if (typeof lon !== 'number') return undefined;
  return SIGNS[Math.floor(lon / 30) % 12];
}

export async function buildDreamAstrologyContext(): Promise<DreamAstrologyContext | null> {
  try {
    const profile = useAuthStore.getState().profile;
    if (!profile?.birth_date || !profile?.latitude) return null;

    const birthData = buildBirthData(profile);
    const chart = await api.getNatalChart(birthData);
    const positions = chart?.positions || chart?.planets || [];
    if (positions.length === 0) return null;

    const moon = findPlanet(positions, 'Moon');
    const neptune = findPlanet(positions, 'Neptune');
    const pluto = findPlanet(positions, 'Pluto');
    const southNode = findPlanet(positions, 'South Node');
    const chiron = findPlanet(positions, 'Chiron');
    const lilith = findPlanet(positions, 'Lilith');

    const ctx: DreamAstrologyContext = {};

    if (moon) {
      ctx.natalMoonSign = moon.sign;
      ctx.natalMoonHouse = moon.house;
    }

    const cusps: number[] = chart?.house_cusps || [];
    if (cusps.length >= 12) {
      ctx.twelfthHouseSign = houseSignFromCusps(cusps, 12);
      ctx.eighthHouseSign = houseSignFromCusps(cusps, 8);
      ctx.fourthHouseSign = houseSignFromCusps(cusps, 4);
    }

    ctx.twelfthHousePlanets = planetsInHouse(positions, 12);
    ctx.eighthHousePlanets = planetsInHouse(positions, 8);
    ctx.fourthHousePlanets = planetsInHouse(positions, 4);

    if (neptune) ctx.neptune = { sign: neptune.sign, house: neptune.house };
    if (pluto) ctx.pluto = { sign: pluto.sign, house: pluto.house };
    if (southNode) ctx.southNode = { sign: southNode.sign, house: southNode.house };
    if (chiron) ctx.chiron = { sign: chiron.sign, house: chiron.house };
    if (lilith) ctx.lilith = { sign: lilith.sign, house: lilith.house };

    try {
      const moonPhaseData = await api.getUpcomingMoonPhases(1);
      if (moonPhaseData && Array.isArray(moonPhaseData) && moonPhaseData.length > 0) {
        ctx.currentMoonPhase = moonPhaseData[0].phase || moonPhaseData[0].name;
      }
    } catch {}

    try {
      const now = new Date();
      const start = now.toISOString().split('T')[0];
      const end = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const transitRes: any = await api.getTransitEvents({
        birth_data: birthData,
        start_date: start,
        end_date: end,
      });
      const events: any[] = transitRes?.events || [];
      ctx.activeTransits = events
        .filter((e: any) => typeof e.orb === 'number' && e.orb <= 3)
        .slice(0, 6)
        .map((e: any) => `${e.transiting_planet} ${e.aspect_type || e.aspect_name || ''} ${e.natal_planet}`.trim());
    } catch {}

    try {
      const progressedData = await api.getProgressedChart({
        ...birthData,
        target_date: new Date().toISOString().split('T')[0],
      });
      const progPositions = progressedData?.positions || progressedData?.planets || [];
      if (progPositions.length > 0) {
        const progMoon = findPlanet(progPositions, 'Moon');
        if (progMoon) {
          ctx.progressedMoonSign = progMoon.sign;
          ctx.progressedMoonHouse = progMoon.house;
        }
      }
    } catch {}

    return ctx;
  } catch {
    return null;
  }
}
