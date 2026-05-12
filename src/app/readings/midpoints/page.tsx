'use client';

import { useState } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { CircleDot } from 'lucide-react';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { PaywallGate } from '@/components/ui/PaywallGate';

export default function MidpointsPage() {
  const { profile } = useAuthStore();
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!profile?.birth_date || !profile?.latitude) {
    return <PaywallGate feature="midpoints"><BirthDataPrompt message="Add your birth data to calculate your midpoint trees." /></PaywallGate>;
  }

  async function getReading() {
    setLoading(true);
    setError('');
    try {
      const data = await api.getNatalChart(buildBirthData(profile!));
      const processed = processMidpoints(data);
      setReading(processed);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PaywallGate feature="midpoints">
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <CircleDot className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Midpoints</h1>
          <p className="text-text-tertiary text-sm">Sensitive points where planetary energies merge</p>
        </div>
      </div>

      {!reading && (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">⊕</span>
          <p className="text-text-tertiary mb-6">
            Midpoints are the halfway points between planet pairs — sensitive degrees that reveal hidden dynamics in your chart.
          </p>
          <button onClick={getReading} disabled={loading} className="btn-primary">
            {loading ? 'Calculating...' : 'Calculate Midpoints'}
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}

      {reading && (
        <div className="space-y-4">
          {reading.key_midpoints && (
            <div className="bg-gradient-cosmic rounded-2xl p-6 border border-accent-muted">
              <p className="text-accent-tertiary text-xs font-medium uppercase tracking-widest mb-3">
                Key Midpoint Structures
              </p>
              <div className="space-y-3">
                {reading.key_midpoints.map((mp: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-text-primary font-medium">
                      {mp.planet1}/{mp.planet2}
                    </span>
                    <span className="text-xs text-text-muted">
                      {mp.degree}° {mp.sign}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reading.groups?.map((group: any, i: number) => (
            <div key={i} className="card">
              <h3 className="font-semibold text-text-primary mb-1">{group.label}</h3>
              <p className="text-xs text-text-muted mb-3">{group.description}</p>
              <div className="space-y-2">
                {group.midpoints.map((mp: any, j: number) => (
                  <div key={j} className="flex items-center justify-between text-sm py-1 border-b border-border-primary last:border-0">
                    <span className="text-text-secondary">{mp.planet1}/{mp.planet2}</span>
                    <span className="text-text-muted font-mono text-xs">{mp.degree}° {mp.sign}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button onClick={() => setReading(null)} className="btn-secondary w-full">
            Recalculate
          </button>
        </div>
      )}
    </div>
    </PaywallGate>
  );
}

function processMidpoints(chart: any) {
  const planets = chart?.planets || chart?.positions || [];
  const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

  const named = planets.filter((p: any) => {
    const n = (p.name || p.planet || '').toLowerCase();
    return ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'].includes(n);
  });

  const allMidpoints: any[] = [];
  for (let i = 0; i < named.length; i++) {
    for (let j = i + 1; j < named.length; j++) {
      const l1 = named[i].longitude || named[i].degree || 0;
      const l2 = named[j].longitude || named[j].degree || 0;
      let mid = ((l1 + l2) / 2) % 360;
      if (Math.abs(l1 - l2) > 180) mid = (mid + 180) % 360;
      const signIdx = Math.floor(mid / 30);
      allMidpoints.push({
        planet1: named[i].name || named[i].planet,
        planet2: named[j].name || named[j].planet,
        degree: Math.round((mid % 30) * 10) / 10,
        sign: signs[signIdx],
        longitude: mid,
      });
    }
  }

  allMidpoints.sort((a, b) => a.longitude - b.longitude);

  const groups = [
    { label: 'Personal Axis', description: 'Sun, Moon, Mercury — core identity midpoints', midpoints: allMidpoints.filter(m => ['Sun','Moon','Mercury'].includes(m.planet1) && ['Sun','Moon','Mercury'].includes(m.planet2)) },
    { label: 'Relationship Axis', description: 'Venus, Mars, Moon — love and desire midpoints', midpoints: allMidpoints.filter(m => ['Venus','Mars','Moon'].includes(m.planet1) && ['Venus','Mars','Moon'].includes(m.planet2)) },
    { label: 'Career Axis', description: 'Sun, Saturn, Jupiter — ambition and growth midpoints', midpoints: allMidpoints.filter(m => ['Sun','Saturn','Jupiter'].includes(m.planet1) && ['Sun','Saturn','Jupiter'].includes(m.planet2)) },
  ].filter(g => g.midpoints.length > 0);

  return {
    key_midpoints: allMidpoints.slice(0, 8),
    groups,
  };
}
