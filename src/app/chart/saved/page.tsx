'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Plus, Star } from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { getZodiacGlyph } from '@/lib/utils';
import { CitySearch } from '@/components/ui/CitySearch';

interface SavedChart {
  id: string;
  name: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  latitude: number;
  longitude: number;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
  created_at: string;
}

export default function SavedChartsPage() {
  const { user } = useAuthStore();
  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // New chart form
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  const [birthLocation, setBirthLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    if (user) loadCharts();
    else setLoading(false);
  }, [user]);

  async function loadCharts() {
    const supabase = createClient();
    const { data } = await supabase
      .from('saved_charts')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setCharts(data || []);
    setLoading(false);
  }

  async function saveChart() {
    if (!user || !name.trim() || !birthDate || !latitude || !longitude) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from('saved_charts').insert({
      user_id: user.id,
      name: name.trim(),
      birth_date: birthDate,
      birth_time: birthTime,
      birth_location: birthLocation,
      latitude,
      longitude,
      timezone: timezone || null,
    });
    setShowForm(false);
    setName('');
    setBirthDate('');
    setBirthTime('12:00');
    setBirthLocation('');
    setLatitude(null);
    setLongitude(null);
    setTimezone('');
    setSaving(false);
    loadCharts();
  }

  async function deleteChart(chartId: string) {
    const supabase = createClient();
    await supabase.from('saved_charts').delete().eq('id', chartId);
    setCharts(prev => prev.filter(c => c.id !== chartId));
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto card text-center py-12">
        <p className="text-text-muted">Please sign in to save charts</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/chart" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> My Chart
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
          <Save className="w-7 h-7 text-accent-primary" />
          Saved Charts
        </h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Chart
        </button>
      </div>

      {/* New chart form */}
      {showForm && (
        <div className="card mb-6 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Save New Chart</h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (e.g. Partner, Mom, Friend...)"
            className="input"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted block mb-1">Birth Date</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="input" />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Birth Time</label>
              <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className="input" />
            </div>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Birth Location</label>
            <CitySearch
              value={birthLocation}
              onChange={(location, lat, lon, tz) => {
                setBirthLocation(location);
                setLatitude(lat);
                setLongitude(lon);
                setTimezone(tz);
              }}
              placeholder="Search city, state, or country..."
            />
          </div>
          <div className="flex gap-2">
            <button onClick={saveChart} disabled={saving || !name.trim()} className="btn-primary text-sm flex-1">
              {saving ? 'Saving...' : 'Save Chart'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingCosmic label="Loading saved charts..." />
      ) : charts.length === 0 ? (
        <div className="card text-center py-10">
          <Star className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted mb-1">No saved charts yet</p>
          <p className="text-xs text-text-muted">Save birth data for friends and family to compare charts</p>
        </div>
      ) : (
        <div className="space-y-2">
          {charts.map(chart => (
            <div key={chart.id} className="card flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-accent-primary">
                  {chart.name[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{chart.name}</p>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>{chart.birth_date}</span>
                  {chart.sun_sign && (
                    <span>{getZodiacGlyph(chart.sun_sign)} {chart.sun_sign}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteChart(chart.id)}
                className="p-2 text-text-muted hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
