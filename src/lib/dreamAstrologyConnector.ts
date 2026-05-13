import { useAuthStore } from '@/stores/authStore';
import { api, buildBirthData } from './api';
import type { DreamAstrologyContext } from './dreamService';

function findPlanet(planets: any[], name: string): any | undefined {
  return planets?.find((p: any) => p.name === name);
}

function planetsInHouse(planets: any[], house: number): string[] {
  return (planets || [])
    .filter((p: any) => p.house === house && !['Ascendant', 'MC', 'Descendant', 'IC'].includes(p.name))
    .map((p: any) => p.name);
}

function houseSign(houses: any[], houseNum: number): string | undefined {
  const cusp = houses?.[houseNum - 1];
  return cusp?.sign;
}

export async function buildDreamAstrologyContext(): Promise<DreamAstrologyContext | null> {
  try {
    const profile = useAuthStore.getState().profile;
    if (!profile?.birth_date || !profile?.latitude) return null;

    const birthData = buildBirthData(profile);
    const chart = await api.getNatalChart(birthData);
    if (!chart?.planets || chart.planets.length === 0) return null;

    const moon = findPlanet(chart.planets, 'Moon');
    const neptune = findPlanet(chart.planets, 'Neptune');
    const pluto = findPlanet(chart.planets, 'Pluto');
    const southNode = findPlanet(chart.planets, 'South Node');
    const chiron = findPlanet(chart.planets, 'Chiron');
    const lilith = findPlanet(chart.planets, 'Lilith');

    const ctx: DreamAstrologyContext = {};

    if (moon) {
      ctx.natalMoonSign = moon.sign;
      ctx.natalMoonHouse = moon.house;
    }

    if (chart.houses && chart.houses.length >= 12) {
      ctx.twelfthHouseSign = houseSign(chart.houses, 12);
      ctx.eighthHouseSign = houseSign(chart.houses, 8);
      ctx.fourthHouseSign = houseSign(chart.houses, 4);
    }

    ctx.twelfthHousePlanets = planetsInHouse(chart.planets, 12);
    ctx.eighthHousePlanets = planetsInHouse(chart.planets, 8);
    ctx.fourthHousePlanets = planetsInHouse(chart.planets, 4);

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
      if (progressedData?.planets) {
        const progMoon = findPlanet(progressedData.planets, 'Moon');
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
