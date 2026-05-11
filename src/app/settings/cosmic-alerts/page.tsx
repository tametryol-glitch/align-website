'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';

export default function CosmicAlertsSettingsPage() {
  const [settings, setSettings] = useState({
    transit_conjunctions: true,
    transit_oppositions: true,
    transit_squares: true,
    transit_trines: false,
    transit_sextiles: false,
    moon_phases: true,
    eclipses: true,
    retrogrades: true,
    ingresses: true,
    min_intensity: 5,
    advance_notice_days: 3,
  });

  function toggle(key: string) {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/settings" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Settings
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
        <Zap className="w-7 h-7 text-gold-primary" />
        Cosmic Alert Preferences
      </h1>

      <div className="space-y-4">
        {/* Transit aspects */}
        <div className="card">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Transit Aspects to Track</h3>
          <div className="divide-y divide-border-primary">
            <ToggleItem label="Conjunctions (0°)" desc="Most intense — planets merge" enabled={settings.transit_conjunctions} onToggle={() => toggle('transit_conjunctions')} />
            <ToggleItem label="Oppositions (180°)" desc="Awareness & balance" enabled={settings.transit_oppositions} onToggle={() => toggle('transit_oppositions')} />
            <ToggleItem label="Squares (90°)" desc="Challenge & growth" enabled={settings.transit_squares} onToggle={() => toggle('transit_squares')} />
            <ToggleItem label="Trines (120°)" desc="Flow & ease" enabled={settings.transit_trines} onToggle={() => toggle('transit_trines')} />
            <ToggleItem label="Sextiles (60°)" desc="Opportunities" enabled={settings.transit_sextiles} onToggle={() => toggle('transit_sextiles')} />
          </div>
        </div>

        {/* Celestial events */}
        <div className="card">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Celestial Events</h3>
          <div className="divide-y divide-border-primary">
            <ToggleItem label="Moon Phases" desc="New & Full Moons" enabled={settings.moon_phases} onToggle={() => toggle('moon_phases')} />
            <ToggleItem label="Eclipses" desc="Solar & Lunar eclipses" enabled={settings.eclipses} onToggle={() => toggle('eclipses')} />
            <ToggleItem label="Retrogrades" desc="Planet stations" enabled={settings.retrogrades} onToggle={() => toggle('retrogrades')} />
            <ToggleItem label="Sign Ingresses" desc="Planets changing signs" enabled={settings.ingresses} onToggle={() => toggle('ingresses')} />
          </div>
        </div>

        {/* Intensity threshold */}
        <div className="card">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Minimum Intensity</h3>
          <p className="text-xs text-text-muted mb-3">Only alert for transits above this strength</p>
          <input
            type="range"
            min={1}
            max={10}
            value={settings.min_intensity}
            onChange={(e) => setSettings(prev => ({ ...prev, min_intensity: parseInt(e.target.value) }))}
            className="w-full accent-accent-primary"
          />
          <div className="flex justify-between text-[10px] text-text-muted mt-1">
            <span>Show all</span>
            <span>{settings.min_intensity}/10</span>
            <span>Major only</span>
          </div>
        </div>

        {/* Advance notice */}
        <div className="card">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Advance Notice</h3>
          <p className="text-xs text-text-muted mb-3">How many days before the exact aspect to alert you</p>
          <select
            value={settings.advance_notice_days}
            onChange={(e) => setSettings(prev => ({ ...prev, advance_notice_days: parseInt(e.target.value) }))}
            className="input"
          >
            <option value={1}>1 day before</option>
            <option value={3}>3 days before</option>
            <option value={7}>1 week before</option>
            <option value={14}>2 weeks before</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function ToggleItem({ label, desc, enabled, onToggle }: {
  label: string; desc: string; enabled: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 px-1">
      <div>
        <p className="text-sm text-text-primary">{label}</p>
        <p className="text-[10px] text-text-muted">{desc}</p>
      </div>
      <button
        onClick={onToggle}
        className={`w-10 h-5.5 rounded-full transition-colors relative ${enabled ? 'bg-accent-primary' : 'bg-bg-tertiary'}`}
      >
        <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${enabled ? 'left-[19px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}
