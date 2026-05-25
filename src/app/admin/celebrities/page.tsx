'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import {
  Shield, Search, Star, Plus, Pencil, Trash2, CheckCircle, XCircle,
  Loader2, ArrowLeft, X, Save,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { sanitizeSearchInput } from '@/lib/sanitize';

// ── Types (mirrors mobile celebrityService.ts) ──────────────────────

type CelebrityCategory =
  | 'music' | 'film_tv' | 'sports' | 'politics' | 'influencers'
  | 'legends' | 'business' | 'fashion' | 'comedy' | 'science' | 'other';

type SourceConfidence = 'verified' | 'reported' | 'unknown';

interface Celebrity {
  id: string;
  name: string;
  slug: string;
  photo_url?: string;
  profession: string;
  category: CelebrityCategory;
  short_bio?: string;
  birth_date: string;
  birth_time?: string;
  birth_place?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  source_confidence: SourceConfidence;
  time_known: boolean;
  popularity_score: number;
  tags: string[];
  sun_sign?: string;
  status?: string;
  created_at: string;
}

interface CelebrityForm {
  name: string;
  slug: string;
  photo_url: string;
  profession: string;
  category: CelebrityCategory;
  short_bio: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  latitude: string;
  longitude: string;
  timezone: string;
  source_confidence: SourceConfidence;
  time_known: boolean;
  popularity_score: number;
  tags: string;
  status: 'active' | 'draft' | 'removed';
}

const CATEGORY_OPTIONS: { value: CelebrityCategory; label: string }[] = [
  { value: 'music', label: 'Music' },
  { value: 'film_tv', label: 'Film / TV' },
  { value: 'sports', label: 'Sports' },
  { value: 'politics', label: 'Politics' },
  { value: 'influencers', label: 'Influencers' },
  { value: 'legends', label: 'Legends / Icons' },
  { value: 'business', label: 'Business' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'science', label: 'Science' },
  { value: 'other', label: 'Other' },
];

const CONFIDENCE_OPTIONS: SourceConfidence[] = ['verified', 'reported', 'unknown'];
const STATUS_OPTIONS: Array<'active' | 'draft' | 'removed'> = ['active', 'draft', 'removed'];

function emptyForm(): CelebrityForm {
  return {
    name: '', slug: '', photo_url: '', profession: '',
    category: 'other', short_bio: '', birth_date: '',
    birth_time: '', birth_place: '', latitude: '', longitude: '',
    timezone: '', source_confidence: 'unknown', time_known: false,
    popularity_score: 50, tags: '', status: 'active',
  };
}

function celebToForm(c: Celebrity): CelebrityForm {
  return {
    name: c.name,
    slug: c.slug,
    photo_url: c.photo_url || '',
    profession: c.profession,
    category: c.category,
    short_bio: c.short_bio || '',
    birth_date: c.birth_date,
    birth_time: c.birth_time || '',
    birth_place: c.birth_place || '',
    latitude: c.latitude != null ? String(c.latitude) : '',
    longitude: c.longitude != null ? String(c.longitude) : '',
    timezone: c.timezone || '',
    source_confidence: c.source_confidence,
    time_known: c.time_known,
    popularity_score: c.popularity_score,
    tags: (c.tags || []).join(', '),
    status: (c.status as any) || 'active',
  };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Page ─────────────────────────────────────────────────────────────

export default function AdminCelebritiesPage() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const [verified, setVerified] = useState(false);
  const [list, setList] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Edit / Add state
  const [editingId, setEditingId] = useState<string | null>(null); // null=list, 'new'=add, uuid=edit
  const [form, setForm] = useState<CelebrityForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Server-verified admin check
  useEffect(() => {
    async function verifyAdmin() {
      if (!profile?.is_admin) return;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      if (data?.is_admin) setVerified(true);
    }
    verifyAdmin();
  }, [profile]);

  const reload = useCallback(async (q?: string) => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from('celebrities')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(500);
    if (q && q.trim()) {
      const term = sanitizeSearchInput(q.trim());
      if (term) query = query.or(`name.ilike.%${term}%,profession.ilike.%${term}%,slug.ilike.%${term}%`);
    }
    const { data } = await query;
    setList(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (verified) reload();
  }, [verified, reload]);

  // Debounced search
  useEffect(() => {
    if (!verified) return;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => reload(search), 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search, verified, reload]);

  // Guard
  if (!profile || !profile.is_admin || !verified) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-text-primary">Access Denied</h1>
        <p className="text-text-muted text-sm mt-2">Admin privileges required.</p>
      </div>
    );
  }

  // ── Form helpers ──

  const setField = <K extends keyof CelebrityForm>(key: K, value: CelebrityForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const onNameChange = (name: string) => {
    setForm(prev => {
      const next = { ...prev, name };
      if (editingId === 'new' && (!prev.slug || prev.slug === slugify(prev.name))) {
        next.slug = slugify(name);
      }
      return next;
    });
  };

  const startNew = () => {
    setForm(emptyForm());
    setError(null);
    setEditingId('new');
  };

  const startEdit = (c: Celebrity) => {
    setForm(celebToForm(c));
    setError(null);
    setEditingId(c.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError(null);
  };

  // ── Save ──

  const saveForm = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.slug.trim()) { setError('Slug is required.'); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.birth_date)) { setError('Birth date must be YYYY-MM-DD.'); return; }

    const supabase = createClient();
    const tags = form.tags.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

    const row: Record<string, any> = {
      name: form.name,
      slug: form.slug,
      photo_url: form.photo_url || null,
      profession: form.profession,
      category: form.category,
      short_bio: form.short_bio || null,
      birth_date: form.birth_date,
      birth_time: form.time_known && form.birth_time ? form.birth_time : null,
      birth_place: form.birth_place || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      timezone: form.timezone || null,
      source_confidence: form.source_confidence,
      time_known: form.time_known,
      popularity_score: form.popularity_score,
      tags,
      status: form.status,
    };

    setSaving(true);
    setError(null);

    try {
      if (editingId === 'new') {
        const { error: insertErr } = await supabase.from('celebrities').insert(row);
        if (insertErr) { setError(insertErr.message); setSaving(false); return; }
      } else if (editingId) {
        row.updated_at = new Date().toISOString();
        const { error: updateErr } = await supabase.from('celebrities').update(row).eq('id', editingId);
        if (updateErr) { setError(updateErr.message); setSaving(false); return; }
      }
      cancelEdit();
      reload(search);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──

  const handleDelete = async () => {
    if (!editingId || editingId === 'new') return;
    if (!confirm(`Delete "${form.name}"? Charts, forecasts, and favorites will cascade-delete.`)) return;
    const supabase = createClient();
    const { error: delErr } = await supabase.from('celebrities').delete().eq('id', editingId);
    if (delErr) { setError(delErr.message); return; }
    cancelEdit();
    reload(search);
  };

  // ── Edit / Add form ──

  if (editingId !== null) {
    const isNew = editingId === 'new';
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={cancelEdit} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to list
          </button>
          <h1 className="text-xl font-display font-bold text-text-primary">
            {isNew ? 'Add Celebrity' : 'Edit Celebrity'}
          </h1>
          <div className="w-24" />
        </div>

        {error && (
          <div className="card mb-4 border border-red-500/30 bg-red-500/5">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="card space-y-5">
          {/* Photo URL */}
          {form.photo_url && (
            <div className="flex justify-center">
              <img src={form.photo_url} alt="" className="w-24 h-24 rounded-full object-cover border-2 border-border-primary" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Name *">
              <input className="input" value={form.name} onChange={e => onNameChange(e.target.value)} placeholder="Beyonce Knowles" />
            </FormField>
            <FormField label="Slug *">
              <input className="input" value={form.slug} onChange={e => setField('slug', e.target.value.toLowerCase())} placeholder="beyonce" />
            </FormField>
          </div>

          <FormField label="Photo URL">
            <input className="input" value={form.photo_url} onChange={e => setField('photo_url', e.target.value)} placeholder="https://..." />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Profession">
              <input className="input" value={form.profession} onChange={e => setField('profession', e.target.value)} placeholder="Singer, performer" />
            </FormField>
            <FormField label="Category">
              <select className="input" value={form.category} onChange={e => setField('category', e.target.value as CelebrityCategory)}>
                {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </FormField>
          </div>

          <FormField label="Short Bio">
            <textarea className="input min-h-[80px]" value={form.short_bio} onChange={e => setField('short_bio', e.target.value)} placeholder="One or two lines..." />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Birth Date * (YYYY-MM-DD)">
              <input className="input" value={form.birth_date} onChange={e => setField('birth_date', e.target.value)} placeholder="1981-09-04" />
            </FormField>
            <FormField label="Birth Time (HH:MM)">
              <input className="input" value={form.birth_time} onChange={e => setField('birth_time', e.target.value)} placeholder="22:00" disabled={!form.time_known} />
            </FormField>
            <FormField label="Time Known">
              <label className="flex items-center gap-2 h-[44px]">
                <input type="checkbox" checked={form.time_known} onChange={e => setField('time_known', e.target.checked)} className="w-4 h-4 rounded accent-accent-primary" />
                <span className="text-sm text-text-secondary">{form.time_known ? 'Yes' : 'No'}</span>
              </label>
            </FormField>
          </div>

          <FormField label="Birth Place">
            <input className="input" value={form.birth_place} onChange={e => setField('birth_place', e.target.value)} placeholder="Houston, USA" />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Latitude">
              <input className="input" value={form.latitude} onChange={e => setField('latitude', e.target.value)} placeholder="29.7604" />
            </FormField>
            <FormField label="Longitude">
              <input className="input" value={form.longitude} onChange={e => setField('longitude', e.target.value)} placeholder="-95.3698" />
            </FormField>
            <FormField label="Timezone">
              <input className="input" value={form.timezone} onChange={e => setField('timezone', e.target.value)} placeholder="America/Chicago" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Source Confidence">
              <select className="input" value={form.source_confidence} onChange={e => setField('source_confidence', e.target.value as SourceConfidence)}>
                {CONFIDENCE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Popularity (0-100)">
              <input className="input" type="number" min={0} max={100} value={form.popularity_score} onChange={e => setField('popularity_score', parseInt(e.target.value) || 0)} />
            </FormField>
            <FormField label="Status">
              <select className="input" value={form.status} onChange={e => setField('status', e.target.value as any)}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
          </div>

          <FormField label="Tags (comma-separated)">
            <input className="input" value={form.tags} onChange={e => setField('tags', e.target.value)} placeholder="leo, music, performer" />
          </FormField>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border-primary">
            <div>
              {!isNew && (
                <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-colors">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={cancelEdit} className="px-4 py-2 rounded-lg text-sm text-text-muted hover:bg-bg-tertiary transition-colors">
                Cancel
              </button>
              <button onClick={saveForm} disabled={saving} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-accent-primary to-purple-600 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── List view ──

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Star className="w-7 h-7 text-accent-primary" />
          <h1 className="text-2xl font-display font-bold text-text-primary">Manage Celebrities</h1>
        </div>
        <button onClick={startNew} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent-primary to-purple-600 text-white font-medium text-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Celebrity
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, slug, or profession..."
          className="input pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className="card text-center py-12">
          <Star className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">{search ? 'No matches found.' : 'No celebrities yet.'}</p>
          <p className="text-xs text-text-muted mt-1">Click &quot;Add Celebrity&quot; to get started.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-text-muted mb-3">{list.length} celebrit{list.length === 1 ? 'y' : 'ies'}</p>
          <div className="space-y-2">
            {list.map(celeb => (
              <button
                key={celeb.id}
                onClick={() => startEdit(celeb)}
                className="w-full card py-3 px-4 text-left hover:bg-bg-tertiary transition-colors"
              >
                <div className="flex items-center gap-3">
                  {celeb.photo_url ? (
                    <img src={celeb.photo_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 text-accent-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text-primary truncate">{celeb.name}</p>
                      {celeb.sun_sign && <span className="text-xs text-text-tertiary flex-shrink-0">{celeb.sun_sign}</span>}
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                        celeb.source_confidence === 'verified'
                          ? 'text-green-400 bg-green-400/10'
                          : celeb.source_confidence === 'reported'
                          ? 'text-amber-400 bg-amber-400/10'
                          : 'text-text-muted bg-bg-tertiary'
                      }`}>
                        {celeb.source_confidence?.toUpperCase()}
                      </span>
                      {celeb.status && celeb.status !== 'active' && (
                        <span className="text-[9px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded flex-shrink-0">
                          {(celeb.status as string).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted truncate">
                      {celeb.profession || 'No profession'} &middot; {celeb.birth_date} &middot; pop {celeb.popularity_score}
                    </p>
                  </div>
                  <Pencil className="w-4 h-4 text-text-muted flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-text-muted uppercase tracking-wider mb-1">{label}</label>
      {children}
    </div>
  );
}
