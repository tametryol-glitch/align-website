'use client';

import { useState } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Wrench } from 'lucide-react';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';

export default function RectificationPage() {
  const { profile } = useAuthStore();
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lifeEvents, setLifeEvents] = useState([
    { event: '', date: '', type: 'career' },
  ]);

  if (!profile?.birth_date || !profile?.latitude) {
    return <BirthDataPrompt message="Add your birth data to start birth time rectification." />;
  }

  function addEvent() {
    setLifeEvents([...lifeEvents, { event: '', date: '', type: 'career' }]);
  }

  function updateEvent(index: number, field: string, value: string) {
    const updated = [...lifeEvents];
    (updated[index] as any)[field] = value;
    setLifeEvents(updated);
  }

  async function getReading() {
    const validEvents = lifeEvents.filter((e) => e.event && e.date);
    if (validEvents.length < 2) {
      setError('Please enter at least 2 life events with dates for accurate rectification.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.getRectification({
        ...buildBirthData(profile!),
        life_events: validEvents,
      });
      setReading(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Wrench className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Birth Time Rectification</h1>
          <p className="text-text-tertiary text-sm">Refine your birth time using major life events</p>
        </div>
      </div>

      {!reading && (
        <div className="space-y-4">
          <div className="card">
            <p className="text-sm text-text-secondary mb-4">
              If you&apos;re unsure of your exact birth time, enter major life events below.
              The system will test different birth times to find which produces the most accurate chart.
            </p>

            <div className="space-y-3">
              {lifeEvents.map((evt, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-bg-tertiary">
                  <input
                    type="text"
                    value={evt.event}
                    onChange={(e) => updateEvent(i, 'event', e.target.value)}
                    placeholder="Life event description"
                    className="input text-sm"
                  />
                  <input
                    type="date"
                    value={evt.date}
                    onChange={(e) => updateEvent(i, 'date', e.target.value)}
                    className="input text-sm"
                  />
                  <select
                    value={evt.type}
                    onChange={(e) => updateEvent(i, 'type', e.target.value)}
                    className="input text-sm"
                  >
                    <option value="career">Career</option>
                    <option value="relationship">Relationship</option>
                    <option value="health">Health</option>
                    <option value="move">Relocation</option>
                    <option value="financial">Financial</option>
                    <option value="spiritual">Spiritual</option>
                    <option value="loss">Loss</option>
                    <option value="achievement">Achievement</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4">
              <button onClick={addEvent} className="btn-ghost text-sm">+ Add Event</button>
              <button onClick={getReading} disabled={loading} className="btn-primary">
                {loading ? 'Analyzing...' : 'Rectify Birth Time'}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
          </div>
        </div>
      )}

      {reading && (
        <div className="space-y-4">
          <div className="bg-gradient-cosmic rounded-2xl p-8 border border-accent-muted text-center">
            <p className="text-accent-tertiary text-xs font-medium uppercase tracking-widest mb-2">
              Suggested Birth Time
            </p>
            <h2 className="text-3xl font-display font-bold text-text-primary mb-1">
              {reading.suggested_time || reading.rectified_time || 'Calculating...'}
            </h2>
            {reading.confidence && (
              <p className="text-sm text-text-muted">Confidence: {reading.confidence}%</p>
            )}
          </div>

          {reading.analysis && (
            <div className="card">
              <h3 className="font-semibold text-text-primary mb-2">Analysis</h3>
              <p className="text-sm text-text-secondary">{reading.analysis}</p>
            </div>
          )}

          {reading.tested_times?.map((t: any, i: number) => (
            <div key={i} className="card">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">{t.time}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  t.score > 70 ? 'bg-emerald-500/20 text-emerald-400' :
                  t.score > 40 ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {t.score}% match
                </span>
              </div>
              {t.rising_sign && (
                <p className="text-xs text-text-muted mt-1">Rising: {t.rising_sign}</p>
              )}
            </div>
          ))}
          <button onClick={() => setReading(null)} className="btn-secondary w-full">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
