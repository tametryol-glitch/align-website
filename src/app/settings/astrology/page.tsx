'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Check } from 'lucide-react';
import { useAstrologySettings } from '@/stores/astrologySettingsStore';
import type { HouseSystem, ZodiacSystem, JargonMode, OrbTightness } from '@/stores/astrologySettingsStore';

export default function AstrologySettingsPage() {
  const {
    houseSystem, setHouseSystem,
    zodiac, setZodiac,
    jargonMode, setJargonMode,
    orbTightness, setOrbTightness,
    showAsteroids, setShowAsteroids,
    showFixedStars, setShowFixedStars,
    hydrate,
  } = useAstrologySettings();

  // Load saved settings from localStorage on mount
  useEffect(() => { hydrate(); }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/settings" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Settings
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
        <Star className="w-7 h-7 text-accent-primary" />
        Astrology Preferences
      </h1>

      <p className="text-xs text-text-muted mb-6">
        Changes are saved automatically and apply to all chart calculations.
      </p>

      <div className="space-y-4">
        {/* House System */}
        <div className="card">
          <h3 className="text-sm font-semibold text-text-primary mb-2">House System</h3>
          <p className="text-xs text-text-muted mb-3">Determines how your chart houses are calculated</p>
          <select
            value={houseSystem}
            onChange={(e) => setHouseSystem(e.target.value as HouseSystem)}
            className="input"
          >
            <option value="whole_sign">Whole Sign</option>
            <option value="placidus">Placidus</option>
            <option value="koch">Koch</option>
            <option value="campanus">Campanus</option>
            <option value="regiomontanus">Regiomontanus</option>
            <option value="equal">Equal House</option>
            <option value="porphyry">Porphyry</option>
            <option value="alcabitius">Alcabitius</option>
            <option value="topocentric">Topocentric</option>
            <option value="morinus">Morinus</option>
            <option value="meridian">Meridian</option>
          </select>
        </div>

        {/* Zodiac */}
        <div className="card">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Zodiac System</h3>
          <select
            value={zodiac}
            onChange={(e) => setZodiac(e.target.value as ZodiacSystem)}
            className="input"
          >
            <option value="tropical">Tropical (Western)</option>
            <option value="sidereal">Sidereal (Vedic)</option>
          </select>
        </div>

        {/* Jargon Mode */}
        <div className="card">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Language Level</h3>
          <p className="text-xs text-text-muted mb-3">How technical should interpretations be?</p>
          <select
            value={jargonMode}
            onChange={(e) => setJargonMode(e.target.value as JargonMode)}
            className="input"
          >
            <option value="beginner">Beginner — Simple, no jargon</option>
            <option value="standard">Standard — Some technical terms</option>
            <option value="advanced">Advanced — Full astrological language</option>
          </select>
        </div>

        {/* Orb Tightness */}
        <div className="card">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Aspect Orbs</h3>
          <p className="text-xs text-text-muted mb-3">How wide should aspect orbs be?</p>
          <select
            value={orbTightness}
            onChange={(e) => setOrbTightness(e.target.value as OrbTightness)}
            className="input"
          >
            <option value="tight">Tight (±4°) — Fewer, stronger aspects</option>
            <option value="standard">Standard (±8°) — Balanced</option>
            <option value="wide">Wide (±12°) — More aspects shown</option>
          </select>
        </div>

        {/* Toggles */}
        <div className="card divide-y divide-border-primary">
          <div className="flex items-center justify-between py-4 px-1">
            <div>
              <p className="text-sm font-medium text-text-primary">Show Asteroids</p>
              <p className="text-xs text-text-muted">Include Chiron, Juno, Vesta, Pallas, Ceres</p>
            </div>
            <button
              onClick={() => setShowAsteroids(!showAsteroids)}
              className={`w-11 h-6 rounded-full transition-colors relative ${showAsteroids ? 'bg-accent-primary' : 'bg-bg-tertiary'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${showAsteroids ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-4 px-1">
            <div>
              <p className="text-sm font-medium text-text-primary">Show Fixed Stars</p>
              <p className="text-xs text-text-muted">Include prominent fixed stars in chart</p>
            </div>
            <button
              onClick={() => setShowFixedStars(!showFixedStars)}
              className={`w-11 h-6 rounded-full transition-colors relative ${showFixedStars ? 'bg-accent-primary' : 'bg-bg-tertiary'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${showFixedStars ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Confirmation */}
        <div className="flex items-center gap-2 text-xs text-green-400 px-1">
          <Check className="w-4 h-4" />
          <span>Settings are saved automatically</span>
        </div>
      </div>
    </div>
  );
}
