'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { api, buildBirthData } from '@/lib/api';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Plus, Loader2, ChevronUp, ChevronDown, X, Trash2, Pencil } from 'lucide-react';
import { PaywallGate } from '@/components/ui/PaywallGate';

// ─── Types ──────────────────────────────────────────────────────────────────

interface JournalTransitTag {
  transit: string;
  natal: string;
  aspect: string;
  orb?: number;
  category?: string;
}

interface JournalEntry {
  id: string;
  userId: string;
  entryDate: string;
  createdAt: string;
  updatedAt: string;
  text: string;
  mood: number;
  tags: string[];
  transitSnapshot: JournalTransitTag[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

const MOOD_META: Record<number, { label: string; color: string }> = {
  1: { label: 'Low',     color: '#7C3AED' },
  2: { label: 'Meh',     color: '#6366F1' },
  3: { label: 'Neutral', color: '#9CA3AF' },
  4: { label: 'Good',    color: '#10B981' },
  5: { label: 'Great',   color: '#F59E0B' },
};

const MOOD_OPTIONS = [
  { value: 1, label: 'Low',     color: '#7C3AED' },
  { value: 2, label: 'Meh',     color: '#6366F1' },
  { value: 3, label: 'Neutral', color: '#9CA3AF' },
  { value: 4, label: 'Good',    color: '#10B981' },
  { value: 5, label: 'Great',   color: '#F59E0B' },
];

const MIN_OCCURRENCES = 3;

// ─── Helpers ────────────────────────────────────────────────────────────────

function rowToEntry(row: any): JournalEntry {
  return {
    id: row.id,
    userId: row.user_id,
    entryDate: row.entry_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    text: row.text,
    mood: row.mood,
    tags: Array.isArray(row.tags) ? row.tags : [],
    transitSnapshot: Array.isArray(row.transit_snapshot) ? row.transit_snapshot : [],
  };
}

function formatEntryDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function tagKey(tag: JournalTransitTag): string {
  const aspect = tag.aspect ? tag.aspect.charAt(0).toUpperCase() + tag.aspect.slice(1).toLowerCase() : '';
  return `${tag.transit}-${aspect}-${tag.natal}`;
}

function tagLabel(tag: JournalTransitTag): string {
  const aspect = tag.aspect ? tag.aspect.charAt(0).toUpperCase() + tag.aspect.slice(1).toLowerCase() : '';
  return `${tag.transit} ${aspect} ${tag.natal}`;
}

function moodToColor(mood: number): string {
  const rounded = Math.max(1, Math.min(5, Math.round(mood)));
  return MOOD_META[rounded]?.color || '#9CA3AF';
}

// ─── Pattern Computation (matches mobile computePatterns) ───────────────────

interface MoodPattern {
  tag: JournalTransitTag;
  occurrences: number;
  meanMood: number;
  delta: number;
}

interface PatternSummary {
  totalEntries: number;
  baselineMood: number;
  lifts: MoodPattern[];
  drops: MoodPattern[];
  sevenDayTrend: number[];
}

function computePatterns(entries: JournalEntry[], now: Date = new Date()): PatternSummary {
  if (entries.length === 0) {
    return { totalEntries: 0, baselineMood: 0, lifts: [], drops: [], sevenDayTrend: [] };
  }

  const totalMood = entries.reduce((sum, e) => sum + e.mood, 0);
  const baselineMood = totalMood / entries.length;

  const byTag = new Map<string, { tag: JournalTransitTag; moods: number[] }>();
  for (const e of entries) {
    for (const t of e.transitSnapshot) {
      const k = tagKey(t);
      const bucket = byTag.get(k);
      if (bucket) {
        bucket.moods.push(e.mood);
      } else {
        byTag.set(k, { tag: t, moods: [e.mood] });
      }
    }
  }

  const patterns: MoodPattern[] = [];
  for (const { tag, moods } of Array.from(byTag.values())) {
    if (moods.length < MIN_OCCURRENCES) continue;
    const mean = moods.reduce((a, b) => a + b, 0) / moods.length;
    patterns.push({ tag, occurrences: moods.length, meanMood: mean, delta: mean - baselineMood });
  }

  const lifts = patterns.filter((p) => p.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, 5);
  const drops = patterns.filter((p) => p.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 5);

  const sevenDayTrend: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const key = day.toISOString().split('T')[0];
    const dayEntries = entries.filter((e) => e.entryDate === key);
    if (dayEntries.length === 0) {
      sevenDayTrend.push(NaN);
    } else {
      const avg = dayEntries.reduce((s, e) => s + e.mood, 0) / dayEntries.length;
      sevenDayTrend.push(avg);
    }
  }

  return { totalEntries: entries.length, baselineMood, lifts, drops, sevenDayTrend };
}

// ─── Snapshot helper ────────────────────────────────────────────────────────

async function snapshotCurrentTransits(profile: any): Promise<JournalTransitTag[]> {
  if (!profile?.birth_date) return [];
  try {
    const birthData = buildBirthData(profile);
    const now = new Date();
    const start = now.toISOString().split('T')[0];
    const end = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const res: any = await api.getTransitEvents({
      birth_data: birthData,
      start_date: start,
      end_date: end,
    });
    const raw: any[] = res?.events || [];
    const tight: JournalTransitTag[] = raw
      .filter((e: any) => typeof e.orb === 'number' && e.orb <= 3)
      .map((e: any) => ({
        transit: e.transiting_planet,
        natal: e.natal_planet,
        aspect: (e.aspect_type || e.aspect_name || '').charAt(0).toUpperCase() + (e.aspect_type || e.aspect_name || '').slice(1).toLowerCase(),
        orb: typeof e.orb === 'number' ? Number(e.orb.toFixed(2)) : undefined,
        category: e.category,
      }))
      .filter((t: JournalTransitTag) => t.transit && t.natal && t.aspect);

    const seen = new Set<string>();
    const deduped: JournalTransitTag[] = [];
    for (const t of tight.sort((a, b) => (a.orb ?? 99) - (b.orb ?? 99))) {
      const k = tagKey(t);
      if (seen.has(k)) continue;
      seen.add(k);
      deduped.push(t);
      if (deduped.length >= 12) break;
    }
    return deduped;
  } catch {
    return [];
  }
}

// ─── Entry Card ─────────────────────────────────────────────────────────────

function EntryCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: JournalEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const mood = MOOD_META[entry.mood] ?? MOOD_META[3];
  const preview = entry.text.length > 180 ? entry.text.slice(0, 180).trim() + '…' : entry.text;

  return (
    <div
      className="bg-white/[0.03] rounded-xl border border-border-primary p-4 mb-2 cursor-pointer hover:bg-white/[0.05] transition-colors group"
      onClick={onEdit}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-text-muted uppercase tracking-wide">
          {formatEntryDate(entry.entryDate)}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
            style={{
              borderColor: mood.color + '66',
              backgroundColor: mood.color + '26',
              color: mood.color,
            }}
          >
            {mood.label}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-red-400 p-1"
            title="Delete entry"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <p className="text-sm text-text-primary leading-relaxed mb-2">{preview}</p>
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {entry.tags.slice(0, 4).map((label) => (
            <span
              key={label}
              className="text-[11px] text-text-secondary px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: 'rgba(139,92,246,0.14)',
                borderColor: 'rgba(139,92,246,0.35)',
              }}
            >
              {label}
            </span>
          ))}
          {entry.tags.length > 4 && (
            <span className="text-[11px] text-text-muted">+{entry.tags.length - 4}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Patterns View ──────────────────────────────────────────────────────────

function PatternsView({ entries }: { entries: JournalEntry[] }) {
  const summary = computePatterns(entries);

  if (summary.totalEntries === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg font-semibold text-text-primary mb-1">No entries yet</p>
        <p className="text-sm text-text-muted">
          Start writing — patterns appear once you have a few entries on the sheet.
        </p>
      </div>
    );
  }

  const hasAnyPatterns = summary.lifts.length > 0 || summary.drops.length > 0;

  return (
    <div className="pt-2 space-y-6">
      {/* Stats */}
      <div className="flex bg-white/[0.04] rounded-xl border border-border-primary p-4">
        <div className="flex-1 text-center">
          <p className="text-[11px] text-text-muted uppercase tracking-wide mb-1">Baseline mood</p>
          <p className="text-2xl font-bold" style={{ color: moodToColor(summary.baselineMood) }}>
            {summary.baselineMood.toFixed(1)}
          </p>
        </div>
        <div className="w-px bg-border-primary mx-2" />
        <div className="flex-1 text-center">
          <p className="text-[11px] text-text-muted uppercase tracking-wide mb-1">Entries</p>
          <p className="text-2xl font-bold text-text-primary">{summary.totalEntries}</p>
        </div>
      </div>

      {/* 7-day trend */}
      <div>
        <p className="text-xs font-semibold text-text-primary uppercase tracking-wide mb-2">Last 7 days</p>
        <div className="bg-white/[0.02] rounded-lg border border-border-primary p-4">
          <div className="flex items-end justify-between h-[72px]">
            {summary.sevenDayTrend.map((v, i) => {
              const valid = Number.isFinite(v);
              const heightPct = valid ? ((v - 1) / 4) * 48 : 4;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-4 h-12 flex items-end bg-white/[0.04] rounded-lg overflow-hidden">
                    <div
                      className="w-full rounded-lg"
                      style={{
                        height: heightPct,
                        backgroundColor: valid ? moodToColor(v) : 'rgba(255,255,255,0.08)',
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-text-muted">{valid ? v.toFixed(1) : '—'}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-text-muted">7 days ago</span>
            <span className="text-[10px] text-text-muted">today</span>
          </div>
        </div>
      </div>

      {/* Patterns */}
      {hasAnyPatterns ? (
        <>
          {summary.lifts.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-text-primary uppercase tracking-wide mb-1">
                Transits that lift you
              </p>
              <p className="text-[11px] text-text-muted mb-2">
                On days these aspects were active, your average mood was higher than usual.
              </p>
              {summary.lifts.map((p, i) => (
                <div key={`lift-${i}`} className="bg-white/[0.03] rounded-lg border border-border-primary p-3 mb-1">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm font-bold text-green-400">{'▲'}</span>
                    <span className="text-sm font-medium text-text-primary flex-1">{tagLabel(p.tag)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-text-secondary">
                      Mood <span style={{ color: '#10B981' }}>{p.meanMood.toFixed(1)}</span> vs baseline {summary.baselineMood.toFixed(1)}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      +{Math.abs(p.delta).toFixed(2)} &middot; {p.occurrences} entries
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {summary.drops.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-text-primary uppercase tracking-wide mb-1">
                Transits that weigh on you
              </p>
              <p className="text-[11px] text-text-muted mb-2">
                On days these aspects were active, your average mood was lower than usual.
              </p>
              {summary.drops.map((p, i) => (
                <div key={`drop-${i}`} className="bg-white/[0.03] rounded-lg border border-border-primary p-3 mb-1">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm font-bold text-red-400">{'▼'}</span>
                    <span className="text-sm font-medium text-text-primary flex-1">{tagLabel(p.tag)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-text-secondary">
                      Mood <span style={{ color: '#F87171' }}>{p.meanMood.toFixed(1)}</span> vs baseline {summary.baselineMood.toFixed(1)}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      &minus;{Math.abs(p.delta).toFixed(2)} &middot; {p.occurrences} entries
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center p-6 bg-white/[0.02] rounded-lg border border-border-primary">
          <p className="text-sm font-semibold text-text-primary mb-1">Not enough signal yet</p>
          <p className="text-xs text-text-muted">
            Correlations appear once at least one transit aspect shows up across 3 or more entries. Keep writing.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Entry Editor Modal ─────────────────────────────────────────────────────

function EntryEditorModal({
  visible,
  existing,
  profile,
  onClose,
  onSave,
}: {
  visible: boolean;
  existing: JournalEntry | null;
  profile: any;
  onClose: () => void;
  onSave: (payload: {
    text: string;
    mood: number;
    tags: string[];
    transitSnapshot: JournalTransitTag[];
    entryDate?: string;
  }) => Promise<void>;
}) {
  const [text, setText] = useState('');
  const [mood, setMood] = useState<number>(3);
  const [tags, setTags] = useState<string[]>([]);
  const [snapshot, setSnapshot] = useState<JournalTransitTag[]>([]);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;

    if (existing) {
      setText(existing.text);
      setMood(existing.mood);
      setTags(existing.tags);
      setSnapshot(existing.transitSnapshot);
      setError(null);
      return;
    }

    setText('');
    setMood(3);
    setTags([]);
    setSnapshot([]);
    setError(null);

    if (!profile?.birth_date) return;
    let cancelled = false;
    setLoadingSnapshot(true);
    (async () => {
      const snap = await snapshotCurrentTransits(profile);
      if (cancelled) return;
      setSnapshot(snap);
      setTags(snap.map(tagLabel));
      setLoadingSnapshot(false);
    })();
    return () => { cancelled = true; };
  }, [visible, existing, profile]);

  const removeTag = (label: string) => {
    setTags((prev) => prev.filter((t) => t !== label));
  };

  const handleSave = async () => {
    if (!text.trim()) {
      setError('Write something before saving.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        text: text.trim(),
        mood,
        tags,
        transitSnapshot: existing ? existing.transitSnapshot : snapshot,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Could not save entry.');
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-bg-primary border border-border-primary rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
          <button onClick={onClose} disabled={saving} className="text-sm text-text-secondary hover:text-text-primary">
            Cancel
          </button>
          <span className="text-sm font-semibold text-text-primary">
            {existing ? 'Edit Entry' : 'New Entry'}
          </span>
          <button
            onClick={handleSave}
            disabled={saving || !text.trim()}
            className="text-sm font-semibold text-accent-primary disabled:opacity-40 flex items-center gap-1"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Mood selector */}
          <div>
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-2">How are you feeling?</p>
            <div className="flex gap-1.5">
              {MOOD_OPTIONS.map((opt) => {
                const active = mood === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setMood(opt.value)}
                    className="flex-1 py-2 rounded-full border text-xs font-semibold transition-colors"
                    style={{
                      borderColor: active ? opt.color : 'rgba(255,255,255,0.12)',
                      backgroundColor: active ? opt.color + '26' : 'transparent',
                      color: active ? opt.color : 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text input */}
          <div>
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-2">What is on your mind?</p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="The sky is with you — write what is moving."
              className="w-full bg-white/[0.04] border border-border-primary rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent-primary/50 min-h-[160px]"
              maxLength={10000}
            />
          </div>

          {/* Transit tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-text-muted uppercase tracking-wider">
                {existing ? 'Sky at entry' : 'Sky right now'}
              </p>
              {loadingSnapshot && <Loader2 className="w-4 h-4 animate-spin text-accent-primary" />}
            </div>
            {tags.length === 0 && !loadingSnapshot ? (
              <p className="text-xs text-text-muted italic">
                No tight transits active right now. Your entry will be tagged by date only.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((label) => (
                  <button
                    key={label}
                    onClick={() => removeTag(label)}
                    className="flex items-center gap-1 text-[11px] text-text-primary px-2 py-1 rounded-full border hover:opacity-70 transition-opacity"
                    style={{
                      backgroundColor: 'rgba(139,92,246,0.14)',
                      borderColor: 'rgba(139,92,246,0.35)',
                    }}
                  >
                    {label}
                    <span className="text-text-muted font-semibold">&times;</span>
                  </button>
                ))}
              </div>
            )}
            <p className="text-[10px] text-text-muted mt-1">
              Tap a tag to remove it. The snapshot stays in the entry either way.
            </p>
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function CosmicJournalPage() {
  const { user, profile } = useAuthStore();
  const [viewMode, setViewMode] = useState<'entries' | 'patterns'>('entries');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);

    if (err) {
      setError(err.message);
    } else {
      setError(null);
      setEntries((data || []).map(rowToEntry));
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (entry: JournalEntry) => {
    setEditing(entry);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditing(null);
  };

  const handleSave = async (payload: {
    text: string;
    mood: number;
    tags: string[];
    transitSnapshot: JournalTransitTag[];
    entryDate?: string;
  }) => {
    if (!user) throw new Error('Not authenticated');
    const supabase = createClient();

    if (editing) {
      const { data, error: err } = await supabase
        .from('journal_entries')
        .update({
          text: payload.text,
          mood: payload.mood,
          tags: payload.tags,
        })
        .eq('id', editing.id)
        .eq('user_id', user.id)
        .select('*')
        .single();

      if (err) throw new Error(err.message);
      setEntries((prev) => prev.map((e) => (e.id === editing.id ? rowToEntry(data) : e)));
    } else {
      const { data, error: err } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          entry_date: payload.entryDate ?? new Date().toISOString().split('T')[0],
          text: payload.text,
          mood: payload.mood,
          tags: payload.tags,
          transit_snapshot: payload.transitSnapshot,
        })
        .select('*')
        .single();

      if (err) throw new Error(err.message);
      setEntries((prev) => [rowToEntry(data), ...prev]);
    }
  };

  const handleDelete = (entry: JournalEntry) => {
    if (!confirm('Delete this entry? This cannot be undone.')) return;
    (async () => {
      if (!user) return;
      const supabase = createClient();
      const { error: err } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entry.id)
        .eq('user_id', user.id);

      if (err) {
        alert('Could not delete: ' + err.message);
        return;
      }
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    })();
  };

  return (
    <PaywallGate feature="cosmic_journal">
      <div className="max-w-3xl mx-auto">
        <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Readings
        </Link>

        <h1 className="text-2xl font-display font-bold text-text-primary mb-1">Cosmic Journal</h1>
        <p className="text-sm text-text-muted leading-relaxed mb-4">
          Write through the transits. Every entry quietly captures the sky around you — over time,
          the pattern of your mood against the pattern of your stars becomes visible.
        </p>

        {/* View toggle */}
        <div className="flex bg-white/[0.04] rounded-full p-1 mb-4">
          <button
            onClick={() => setViewMode('entries')}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${
              viewMode === 'entries'
                ? 'bg-accent-primary/20 text-accent-primary'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Entries
          </button>
          <button
            onClick={() => setViewMode('patterns')}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${
              viewMode === 'patterns'
                ? 'bg-accent-primary/20 text-accent-primary'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Patterns
          </button>
        </div>

        {viewMode === 'entries' ? (
          <>
            {/* New Entry button */}
            <button
              onClick={openNew}
              className="w-full btn-primary py-3 mb-4 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Entry
            </button>

            {loading ? (
              <div className="py-12 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-accent-primary" />
                <p className="text-sm text-text-muted">Loading your entries&hellip;</p>
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-lg font-semibold text-text-primary mb-1">Nothing written yet</p>
                <p className="text-sm text-text-muted px-8">
                  Tap &ldquo;New Entry&rdquo; above to capture what the sky is moving in you right now.
                </p>
              </div>
            ) : (
              entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={() => openEdit(entry)}
                  onDelete={() => handleDelete(entry)}
                />
              ))
            )}
          </>
        ) : (
          <PatternsView entries={entries} />
        )}

        <EntryEditorModal
          visible={editorOpen}
          existing={editing}
          profile={profile}
          onClose={closeEditor}
          onSave={handleSave}
        />
      </div>
    </PaywallGate>
  );
}
