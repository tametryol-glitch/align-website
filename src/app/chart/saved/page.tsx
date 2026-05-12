'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useAstrologySettings } from '@/stores/astrologySettingsStore';
import { resolveTimezoneOffset } from '@/lib/timezoneOffset';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Plus, Star, Search, X, Edit2, Eye, ChevronDown } from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { getZodiacGlyph } from '@/lib/utils';
import { CitySearch } from '@/components/ui/CitySearch';
import { NatalWheel } from '@/components/charts/NatalWheel';

// ═══════════════════════════════════════════════════════════════════
// Types & constants matching Supabase schema
// ═══════════════════════════════════════════════════════════════════

type SavedChartCategory =
  | 'family' | 'friend' | 'partner' | 'client' | 'celebrity'
  | 'love_interest' | 'child' | 'business' | 'other';

const SAVED_CHART_CATEGORIES: { value: SavedChartCategory; label: string; emoji: string }[] = [
  { value: 'family',        label: 'Family',        emoji: '👨‍👩‍👧' },
  { value: 'friend',        label: 'Friend',        emoji: '🤝' },
  { value: 'partner',       label: 'Partner',       emoji: '❤️' },
  { value: 'love_interest', label: 'Love Interest', emoji: '💘' },
  { value: 'child',         label: 'Child',         emoji: '👶' },
  { value: 'client',        label: 'Client',        emoji: '💼' },
  { value: 'business',      label: 'Business',      emoji: '📈' },
  { value: 'celebrity',     label: 'Celebrity',     emoji: '⭐' },
  { value: 'other',         label: 'Other',         emoji: '🌟' },
];

interface SavedChart {
  id: string;
  owner_id: string;
  full_name: string;
  birth_date: string;
  birth_time: string | null;
  birth_time_unknown: boolean;
  birth_place: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  notes: string;
  category: string;
  is_favorite: boolean;
  is_archived: boolean;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
  last_viewed_at: string | null;
  created_at: string;
  updated_at: string;
}

function getCategoryInfo(category: string) {
  return SAVED_CHART_CATEGORIES.find(c => c.value === category) || SAVED_CHART_CATEGORIES[SAVED_CHART_CATEGORIES.length - 1];
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ═══════════════════════════════════════════════════════════════════
// Main page
// ═══════════════════════════════════════════════════════════════════

export default function SavedChartsPage() {
  const { user } = useAuthStore();
  const { houseSystem } = useAstrologySettings();
  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingChart, setEditingChart] = useState<SavedChart | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingChart, setViewingChart] = useState<SavedChart | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadCharts();
    else setLoading(false);
  }, [user]);

  async function loadCharts() {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from('saved_charts')
      .select('*')
      .eq('owner_id', user!.id)
      .eq('is_archived', false)
      .order('is_favorite', { ascending: false })
      .order('updated_at', { ascending: false });

    if (searchQuery.trim()) {
      query = query.ilike('full_name', `%${searchQuery.trim()}%`);
    }

    const { data } = await query;
    setCharts(data || []);
    setLoading(false);
  }

  // Re-search when query changes
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => loadCharts(), 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  async function toggleFavorite(chart: SavedChart) {
    const supabase = createClient();
    await supabase
      .from('saved_charts')
      .update({ is_favorite: !chart.is_favorite, updated_at: new Date().toISOString() })
      .eq('id', chart.id);
    setCharts(prev =>
      prev.map(c => c.id === chart.id ? { ...c, is_favorite: !c.is_favorite } : c)
        .sort((a, b) => {
          if (a.is_favorite !== b.is_favorite) return b.is_favorite ? 1 : -1;
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        })
    );
  }

  async function deleteChart(chartId: string) {
    const supabase = createClient();
    await supabase.from('saved_charts').delete().eq('id', chartId);
    setCharts(prev => prev.filter(c => c.id !== chartId));
    setDeleteConfirm(null);
    if (viewingChart?.id === chartId) {
      setViewingChart(null);
      setChartData(null);
    }
  }

  function openEdit(chart: SavedChart) {
    setEditingChart(chart);
    setShowForm(true);
  }

  function openAdd() {
    setEditingChart(null);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingChart(null);
  }

  function handleFormSaved() {
    setShowForm(false);
    setEditingChart(null);
    loadCharts();
  }

  async function viewChart(chart: SavedChart) {
    if (!chart.latitude || !chart.longitude) return;
    setViewingChart(chart);
    setChartData(null);
    setChartLoading(true);

    // Update last_viewed_at
    const supabase = createClient();
    await supabase
      .from('saved_charts')
      .update({ last_viewed_at: new Date().toISOString() })
      .eq('id', chart.id);

    try {
      const hsMap: Record<string, string> = {
        'placidus': 'Placidus', 'whole_sign': 'Whole Sign', 'koch': 'Koch',
        'campanus': 'Campanus', 'regiomontanus': 'Regiomontanus',
        'equal': 'Equal', 'porphyry': 'Porphyry', 'alcabitius': 'Alcabitius',
      };
      const { offset, label } = resolveTimezoneOffset(
        chart.timezone,
        chart.longitude,
        chart.birth_date,
        chart.birth_time || undefined,
        chart.latitude,
      );
      const data = await api.getNatalChart({
        name: chart.full_name,
        date: chart.birth_date,
        time: chart.birth_time || '12:00',
        latitude: chart.latitude,
        longitude: chart.longitude,
        timezone: label,
        tz_offset: offset,
        location: chart.birth_place || '',
        house_system: hsMap[houseSystem] || 'Whole Sign',
      });
      setChartData(data);

      // Cache sun/moon/rising signs if not already set
      if (!chart.sun_sign || !chart.moon_sign) {
        const positions = data.positions || [];
        const sun = positions.find((p: any) => p.name === 'Sun');
        const moon = positions.find((p: any) => p.name === 'Moon');
        const asc = positions.find((p: any) => p.name === 'Ascendant');
        const updates: any = {};
        if (sun?.sign) updates.sun_sign = sun.sign;
        if (moon?.sign) updates.moon_sign = moon.sign;
        if (asc?.sign) updates.rising_sign = asc.sign;
        if (Object.keys(updates).length > 0) {
          await supabase.from('saved_charts').update(updates).eq('id', chart.id);
          setCharts(prev => prev.map(c => c.id === chart.id ? { ...c, ...updates } : c));
        }
      }
    } catch (err: any) {
      console.error('Failed to calculate chart:', err);
    } finally {
      setChartLoading(false);
    }
  }

  const wheelProps = useMemo(() => {
    if (!chartData) return null;
    const positions = chartData.positions || [];
    const planets = positions.map((p: any) => ({
      name: p.name,
      longitude: p.longitude,
      sign: p.sign,
      degree: p.sign_degree ?? (p.longitude % 30),
      retrograde: p.is_retrograde || false,
    }));
    const aspects = (chartData.aspects || []).map((a: any) => ({
      planet1: a.body1,
      planet2: a.body2,
      type: a.aspect_name,
      orb: a.orb,
    }));
    const houseCusps: number[] = chartData.house_cusps || [];
    const ascPos = positions.find((p: any) => p.name === 'Ascendant');
    const mcPos = positions.find((p: any) => p.name === 'MC');
    const ascendantDegree = ascPos ? ascPos.longitude : (houseCusps[0] || 0);
    const midheavenDegree = mcPos ? mcPos.longitude : (houseCusps[9] || 0);
    return { planets, aspects, houseCusps, ascendantDegree, midheavenDegree };
  }, [chartData]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto card text-center py-12">
        <p className="text-text-muted">Please sign in to save charts</p>
      </div>
    );
  }

  // ── Chart view mode ──
  if (viewingChart) {
    return (
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => { setViewingChart(null); setChartData(null); }}
          className="btn-ghost p-2 inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Saved Charts
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-accent-muted flex items-center justify-center">
            <span className="text-lg font-bold text-accent-primary">
              {viewingChart.sun_sign ? getZodiacGlyph(viewingChart.sun_sign) : viewingChart.full_name[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">{viewingChart.full_name}</h1>
            <p className="text-sm text-text-muted">
              {formatDate(viewingChart.birth_date)}
              {viewingChart.birth_time && !viewingChart.birth_time_unknown ? ` • ${viewingChart.birth_time}` : ''}
              {viewingChart.birth_place ? ` • ${viewingChart.birth_place}` : ''}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {getCategoryInfo(viewingChart.category) && (
              <span className="text-xs px-2 py-1 rounded-full bg-surface-secondary text-text-muted">
                {getCategoryInfo(viewingChart.category).emoji} {getCategoryInfo(viewingChart.category).label}
              </span>
            )}
          </div>
        </div>

        {chartLoading ? (
          <LoadingCosmic label={`Calculating ${viewingChart.full_name}'s natal chart...`} />
        ) : chartData && wheelProps ? (
          <div className="space-y-6">
            {/* Signs summary */}
            <div className="grid grid-cols-3 gap-3">
              {chartData.positions?.find((p: any) => p.name === 'Sun') && (
                <div className="card text-center py-3">
                  <p className="text-xs text-text-muted mb-1">☉ Sun</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {getZodiacGlyph(chartData.positions.find((p: any) => p.name === 'Sun').sign)}{' '}
                    {chartData.positions.find((p: any) => p.name === 'Sun').sign}
                  </p>
                </div>
              )}
              {chartData.positions?.find((p: any) => p.name === 'Moon') && (
                <div className="card text-center py-3">
                  <p className="text-xs text-text-muted mb-1">☽ Moon</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {getZodiacGlyph(chartData.positions.find((p: any) => p.name === 'Moon').sign)}{' '}
                    {chartData.positions.find((p: any) => p.name === 'Moon').sign}
                  </p>
                </div>
              )}
              {chartData.positions?.find((p: any) => p.name === 'Ascendant') && (
                <div className="card text-center py-3">
                  <p className="text-xs text-text-muted mb-1">ASC Rising</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {getZodiacGlyph(chartData.positions.find((p: any) => p.name === 'Ascendant').sign)}{' '}
                    {chartData.positions.find((p: any) => p.name === 'Ascendant').sign}
                  </p>
                </div>
              )}
            </div>

            {/* Natal wheel */}
            <div className="card flex justify-center py-6">
              <NatalWheel
                planets={wheelProps.planets}
                aspects={wheelProps.aspects}
                houseCusps={wheelProps.houseCusps}
                ascendantDegree={wheelProps.ascendantDegree}
                midheavenDegree={wheelProps.midheavenDegree}
                size={420}
              />
            </div>

            {/* Positions table */}
            <div className="card">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Planetary Positions</h3>
              <div className="space-y-1.5">
                {(chartData.positions || [])
                  .filter((p: any) => !['Ascendant', 'MC', 'North Node', 'South Node', 'Chiron'].includes(p.name) || ['North Node', 'Chiron'].includes(p.name))
                  .map((p: any) => (
                    <div key={p.name} className="flex items-center justify-between text-sm py-1 border-b border-border-primary/30 last:border-0">
                      <span className="text-text-primary font-medium">{p.name}</span>
                      <span className="text-text-muted">
                        {getZodiacGlyph(p.sign)} {p.sign} {Math.floor(p.sign_degree || p.longitude % 30)}°
                        {p.is_retrograde ? ' ℞' : ''}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : !chartLoading && (
          <div className="card text-center py-10">
            <p className="text-text-muted">Unable to calculate chart. Please ensure birth location is set.</p>
          </div>
        )}
      </div>
    );
  }

  // ── Main list view ──
  const favorites = charts.filter(c => c.is_favorite);
  const others = charts.filter(c => !c.is_favorite);

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/chart" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> My Chart
      </Link>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
          <Save className="w-7 h-7 text-accent-primary" />
          Saved Charts
        </h1>
        <button onClick={openAdd} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Chart
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search saved charts..."
          className="input pl-9 pr-8"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <ChartForm
          existing={editingChart}
          userId={user.id}
          onClose={handleFormClose}
          onSaved={handleFormSaved}
        />
      )}

      {loading ? (
        <LoadingCosmic label="Loading saved charts..." />
      ) : charts.length === 0 ? (
        <div className="card text-center py-10">
          <Star className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted mb-1">{searchQuery ? 'No charts match your search' : 'No saved charts yet'}</p>
          <p className="text-xs text-text-muted">Save birth data for friends and family to compare charts</p>
          {!searchQuery && (
            <button onClick={openAdd} className="btn-primary text-sm mt-4">
              Add Your First Chart
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Pinned section */}
          {favorites.length > 0 && (
            <>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-2 mb-1">⭐ Pinned</p>
              {favorites.map(chart => (
                <ChartCard
                  key={chart.id}
                  chart={chart}
                  onView={() => viewChart(chart)}
                  onEdit={() => openEdit(chart)}
                  onToggleFavorite={() => toggleFavorite(chart)}
                  onDelete={() => setDeleteConfirm(chart.id)}
                  deleteConfirm={deleteConfirm === chart.id}
                  onConfirmDelete={() => deleteChart(chart.id)}
                  onCancelDelete={() => setDeleteConfirm(null)}
                />
              ))}
            </>
          )}

          {/* All others */}
          {others.length > 0 && (
            <>
              {favorites.length > 0 && (
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-4 mb-1">All Charts</p>
              )}
              {others.map(chart => (
                <ChartCard
                  key={chart.id}
                  chart={chart}
                  onView={() => viewChart(chart)}
                  onEdit={() => openEdit(chart)}
                  onToggleFavorite={() => toggleFavorite(chart)}
                  onDelete={() => setDeleteConfirm(chart.id)}
                  deleteConfirm={deleteConfirm === chart.id}
                  onConfirmDelete={() => deleteChart(chart.id)}
                  onCancelDelete={() => setDeleteConfirm(null)}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Chart Card
// ═══════════════════════════════════════════════════════════════════

function ChartCard({ chart, onView, onEdit, onToggleFavorite, onDelete, deleteConfirm, onConfirmDelete, onCancelDelete }: {
  chart: SavedChart;
  onView: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  deleteConfirm: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  const catInfo = getCategoryInfo(chart.category);

  return (
    <div className="card hover:border-accent-primary/30 transition-colors">
      {/* Main content — clickable to view chart */}
      <button onClick={onView} className="w-full text-left flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-accent-primary">
            {chart.sun_sign ? getZodiacGlyph(chart.sun_sign) : chart.full_name[0]?.toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{chart.full_name}</p>
          <div className="flex items-center gap-2 text-xs text-text-muted flex-wrap">
            <span>{formatDate(chart.birth_date)}</span>
            {chart.birth_time && !chart.birth_time_unknown && (
              <span>• {chart.birth_time}</span>
            )}
            {chart.birth_place && (
              <span>• {chart.birth_place}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {chart.sun_sign && (
              <span className="text-[11px] text-accent-primary">☉ {chart.sun_sign}</span>
            )}
            {chart.moon_sign && (
              <span className="text-[11px] text-accent-primary">☽ {chart.moon_sign}</span>
            )}
            {chart.rising_sign && (
              <span className="text-[11px] text-accent-primary">ASC {chart.rising_sign}</span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className="p-1.5 text-lg hover:scale-110 transition-transform flex-shrink-0"
          title={chart.is_favorite ? 'Remove from pinned' : 'Pin to top'}
        >
          {chart.is_favorite ? '⭐' : '☆'}
        </button>
      </button>

      {/* Category, notes, and action buttons */}
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border-primary/30">
        {catInfo && (
          <span className="text-[11px] text-text-muted">
            {catInfo.emoji} {catInfo.label}
          </span>
        )}
        {chart.notes && (
          <span className="text-[11px] text-text-muted truncate flex-1 ml-1" title={chart.notes}>
            — {chart.notes}
          </span>
        )}
        <div className="flex items-center gap-1 ml-auto flex-shrink-0">
          <button
            onClick={onView}
            className="p-1.5 text-text-muted hover:text-accent-primary transition-colors"
            title="View natal chart"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 text-text-muted hover:text-accent-primary transition-colors"
            title="Edit chart"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {deleteConfirm ? (
            <span className="flex items-center gap-1 text-[11px]">
              <span className="text-red-400">Delete?</span>
              <button onClick={onConfirmDelete} className="text-red-400 hover:text-red-300 font-semibold">Yes</button>
              <button onClick={onCancelDelete} className="text-text-muted hover:text-text-primary">No</button>
            </span>
          ) : (
            <button
              onClick={onDelete}
              className="p-1.5 text-text-muted hover:text-red-400 transition-colors"
              title="Delete chart"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Add / Edit Form
// ═══════════════════════════════════════════════════════════════════

function ChartForm({ existing, userId, onClose, onSaved }: {
  existing: SavedChart | null;
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(existing?.full_name || '');
  const [birthDate, setBirthDate] = useState(existing?.birth_date || '');
  const [birthTime, setBirthTime] = useState(existing?.birth_time || '12:00');
  const [birthTimeUnknown, setBirthTimeUnknown] = useState(existing?.birth_time_unknown || false);
  const [birthPlace, setBirthPlace] = useState(existing?.birth_place || '');
  const [latitude, setLatitude] = useState<number | null>(existing?.latitude || null);
  const [longitude, setLongitude] = useState<number | null>(existing?.longitude || null);
  const [timezone, setTimezone] = useState(existing?.timezone || '');
  const [category, setCategory] = useState<SavedChartCategory>((existing?.category as SavedChartCategory) || 'other');
  const [notes, setNotes] = useState(existing?.notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!name.trim()) { setError('Name is required'); return; }
    if (!birthDate) { setError('Birth date is required'); return; }
    if (!latitude || !longitude) { setError('Please select a birth location from the suggestions'); return; }

    setSaving(true);
    setError('');
    const supabase = createClient();

    const payload = {
      full_name: name.trim(),
      birth_date: birthDate,
      birth_time: birthTimeUnknown ? null : (birthTime || null),
      birth_time_unknown: birthTimeUnknown,
      birth_place: birthPlace || null,
      latitude,
      longitude,
      timezone: timezone || null,
      category,
      notes,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (existing) {
      // Clear cached signs if birth data changed
      const birthDataChanged =
        payload.birth_date !== existing.birth_date ||
        payload.birth_time !== existing.birth_time ||
        payload.latitude !== existing.latitude ||
        payload.longitude !== existing.longitude;

      const updatePayload: any = { ...payload };
      if (birthDataChanged) {
        updatePayload.sun_sign = null;
        updatePayload.moon_sign = null;
        updatePayload.rising_sign = null;
      }

      result = await supabase
        .from('saved_charts')
        .update(updatePayload)
        .eq('id', existing.id);
    } else {
      result = await supabase
        .from('saved_charts')
        .insert({
          owner_id: userId,
          ...payload,
        });
    }

    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    onSaved();
  }

  return (
    <div className="card mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          {existing ? 'Edit Chart' : 'Save New Chart'}
        </h3>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Name */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full name"
        className="input"
      />

      {/* Date + Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-muted block mb-1">Birth Date *</label>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="input" />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Birth Time</label>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className={`input flex-1 ${birthTimeUnknown ? 'opacity-40' : ''}`}
              disabled={birthTimeUnknown}
            />
            <button
              type="button"
              onClick={() => setBirthTimeUnknown(!birthTimeUnknown)}
              className={`text-[10px] px-2 py-1.5 rounded border whitespace-nowrap ${
                birthTimeUnknown
                  ? 'bg-accent-primary text-white border-accent-primary'
                  : 'border-border-primary text-text-muted hover:border-accent-primary'
              }`}
            >
              Unknown
            </button>
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="text-xs text-text-muted block mb-1">Birth Location *</label>
        <CitySearch
          value={birthPlace}
          onChange={(location, lat, lon, tz) => {
            setBirthPlace(location);
            setLatitude(lat);
            setLongitude(lon);
            setTimezone(tz);
          }}
          placeholder="Search city, state, or country..."
        />
      </div>

      {/* Category */}
      <div>
        <label className="text-xs text-text-muted block mb-1">Category</label>
        <div className="flex flex-wrap gap-1.5">
          {SAVED_CHART_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                category === cat.value
                  ? 'bg-accent-muted border-accent-primary text-accent-primary'
                  : 'border-border-primary text-text-muted hover:border-accent-primary/50'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs text-text-muted block mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes about this person..."
          className="input min-h-[60px] resize-y"
          rows={2}
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !name.trim() || !birthDate || !latitude}
          className="btn-primary text-sm flex-1"
        >
          {saving ? 'Saving...' : existing ? 'Save Changes' : 'Save Chart'}
        </button>
        <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
      </div>
    </div>
  );
}
