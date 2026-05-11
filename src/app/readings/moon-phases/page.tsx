'use client';

import { useState } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Moon } from 'lucide-react';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';

const PHASE_INFO: Record<string, { emoji: string; meaning: string }> = {
  'New Moon': { emoji: '🌑', meaning: 'Seeds of intention. You are a visionary who thrives on new beginnings.' },
  'Waxing Crescent': { emoji: '🌒', meaning: 'Building momentum. You are resourceful and determined to grow.' },
  'First Quarter': { emoji: '🌓', meaning: 'Challenge and action. You are courageous and thrive under pressure.' },
  'Waxing Gibbous': { emoji: '🌔', meaning: 'Refinement. You are a perfectionist who polishes everything to brilliance.' },
  'Full Moon': { emoji: '🌕', meaning: 'Illumination and fulfillment. You radiate awareness and attract attention.' },
  'Waning Gibbous': { emoji: '🌖', meaning: 'Sharing wisdom. You are a natural teacher and mentor.' },
  'Last Quarter': { emoji: '🌗', meaning: 'Release and transition. You are skilled at letting go and transforming.' },
  'Waning Crescent': { emoji: '🌘', meaning: 'Surrender and rest. You carry ancient wisdom and deep intuition.' },
};

export default function MoonPhasesPage() {
  const { profile } = useAuthStore();
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!profile?.birth_date || !profile?.latitude) {
    return <BirthDataPrompt message="Add your birth data to discover the moon phase you were born under." />;
  }

  async function getReading() {
    setLoading(true);
    setError('');
    try {
      const data = await api.getNatalChart(buildBirthData(profile!));
      const processed = processMoonPhase(data);
      setReading(processed);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Moon className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Natal Moon Phase</h1>
          <p className="text-text-tertiary text-sm">The moon phase at your birth reveals your soul&apos;s purpose cycle</p>
        </div>
      </div>

      {!reading && (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">🌙</span>
          <p className="text-text-tertiary mb-6">
            The phase of the moon at the moment you were born shapes your emotional nature and life purpose.
          </p>
          <button onClick={getReading} disabled={loading} className="btn-primary">
            {loading ? 'Calculating...' : 'Reveal My Moon Phase'}
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}

      {reading && (
        <div className="space-y-4">
          <div className="bg-gradient-cosmic rounded-2xl p-8 border border-accent-muted text-center">
            <span className="text-6xl block mb-3">{reading.emoji}</span>
            <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
              {reading.phase}
            </h2>
            <p className="text-text-secondary">{reading.meaning}</p>
          </div>

          <div className="card">
            <h3 className="font-semibold text-text-primary mb-2">Moon Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-text-muted">Moon Sign</span>
                <p className="text-text-primary font-medium">{reading.moonSign}</p>
              </div>
              <div>
                <span className="text-text-muted">Sun Sign</span>
                <p className="text-text-primary font-medium">{reading.sunSign}</p>
              </div>
              <div>
                <span className="text-text-muted">Phase Angle</span>
                <p className="text-text-primary font-medium">{reading.angle}°</p>
              </div>
              <div>
                <span className="text-text-muted">Illumination</span>
                <p className="text-text-primary font-medium">{reading.illumination}%</p>
              </div>
            </div>
          </div>

          {/* All 8 phases overview */}
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-3">All 8 Phases</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PHASE_INFO).map(([phase, { emoji }]) => (
                <div
                  key={phase}
                  className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                    reading.phase === phase ? 'bg-accent-muted border border-accent-primary/40' : ''
                  }`}
                >
                  <span>{emoji}</span>
                  <span className={reading.phase === phase ? 'text-accent-primary font-medium' : 'text-text-tertiary'}>
                    {phase}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => setReading(null)} className="btn-secondary w-full">
            Calculate Again
          </button>
        </div>
      )}
    </div>
  );
}

function processMoonPhase(chart: any) {
  const planets = chart?.planets || chart?.positions || [];
  const sun = planets.find((p: any) => (p.name || p.planet || '').toLowerCase() === 'sun');
  const moon = planets.find((p: any) => (p.name || p.planet || '').toLowerCase() === 'moon');

  const sunLong = sun?.longitude || sun?.degree || 0;
  const moonLong = moon?.longitude || moon?.degree || 0;
  let angle = ((moonLong - sunLong + 360) % 360);
  angle = Math.round(angle * 10) / 10;

  let phase = 'New Moon';
  if (angle >= 0 && angle < 45) phase = 'New Moon';
  else if (angle < 90) phase = 'Waxing Crescent';
  else if (angle < 135) phase = 'First Quarter';
  else if (angle < 180) phase = 'Waxing Gibbous';
  else if (angle < 225) phase = 'Full Moon';
  else if (angle < 270) phase = 'Waning Gibbous';
  else if (angle < 315) phase = 'Last Quarter';
  else phase = 'Waning Crescent';

  const info = PHASE_INFO[phase] || PHASE_INFO['New Moon'];
  const illumination = Math.round(((1 - Math.cos(angle * Math.PI / 180)) / 2) * 100);

  return {
    phase,
    emoji: info.emoji,
    meaning: info.meaning,
    moonSign: moon?.sign || 'Unknown',
    sunSign: sun?.sign || 'Unknown',
    angle: Math.round(angle),
    illumination,
  };
}
