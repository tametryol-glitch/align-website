'use client';

/**
 * /admin/audio — Audio Library manager.
 *
 * Admin-only. Upload background songs and short sound bites into the video
 * editor's shared library (audio_tracks table + cosmic-videos storage bucket).
 * The web editor, mobile editor, and renderer all read this library, so a
 * track uploaded here is immediately selectable by every user.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import {
  Shield, Music, Upload, Trash2, Loader2, ArrowLeft, Eye, EyeOff, Play, Pause, Volume2, Zap,
} from 'lucide-react';

interface AudioTrack {
  id: string;
  name: string;
  mood: string;
  kind: 'music' | 'sfx';
  storage_path: string;
  duration_seconds: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
function publicUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/cosmic-videos/${storagePath}`;
}

function fmtDuration(s: number): string {
  if (!s) return '—';
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function AdminAudioPage() {
  const { profile } = useAuthStore();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    async function verifyAdmin() {
      if (!profile?.is_admin) return;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
      if (data?.is_admin) setVerified(true);
    }
    verifyAdmin();
  }, [profile]);

  if (!profile || !profile.is_admin || !verified) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-text-primary">Access Denied</h1>
        <p className="text-text-muted text-sm mt-2">Admin privileges required.</p>
      </div>
    );
  }

  return <AudioManager />;
}

function AudioManager() {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Upload form
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [mood, setMood] = useState('');
  const [kind, setKind] = useState<'music' | 'sfx'>('music');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Playback preview
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const loadTracks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/audio');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setTracks(data.tracks || []);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadTracks(); }, [loadTracks]);

  // Read the file's duration in the browser before upload so we can store it.
  function readDuration(f: File): Promise<number> {
    return new Promise((resolve) => {
      try {
        const url = URL.createObjectURL(f);
        const a = new Audio();
        a.preload = 'metadata';
        a.onloadedmetadata = () => {
          URL.revokeObjectURL(url);
          resolve(isFinite(a.duration) ? a.duration : 0);
        };
        a.onerror = () => { URL.revokeObjectURL(url); resolve(0); };
        a.src = url;
      } catch { resolve(0); }
    });
  }

  function onPickFile(f: File | null) {
    setFile(f);
    if (f && !name) {
      // Prefill name from filename (strip extension, tidy separators).
      const base = f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
      setName(base.replace(/\b\w/g, (c) => c.toUpperCase()));
    }
  }

  async function handleUpload() {
    if (!file || !name.trim()) return;
    setUploading(true);
    setError('');
    try {
      const duration = await readDuration(file);
      const form = new FormData();
      form.append('file', file);
      form.append('name', name.trim());
      form.append('mood', mood.trim());
      form.append('kind', kind);
      form.append('durationSeconds', String(duration));

      const res = await fetch('/api/admin/audio', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      // Reset form and reload.
      setFile(null);
      setName('');
      setMood('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadTracks();
    } catch (e: any) {
      setError(e.message);
    }
    setUploading(false);
  }

  async function toggleActive(track: AudioTrack) {
    try {
      const res = await fetch('/api/admin/audio', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: track.id, is_active: !track.is_active }),
      });
      if (res.ok) {
        setTracks((prev) => prev.map((t) => (t.id === track.id ? { ...t, is_active: !t.is_active } : t)));
      }
    } catch {}
  }

  async function deleteTrack(track: AudioTrack) {
    if (!confirm(`Delete "${track.name}"? This removes it from the editor and cannot be undone.`)) return;
    try {
      const res = await fetch('/api/admin/audio', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: track.id }),
      });
      if (res.ok) setTracks((prev) => prev.filter((t) => t.id !== track.id));
    } catch {}
  }

  function togglePlay(track: AudioTrack) {
    if (playingId === track.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const a = new Audio(publicUrl(track.storage_path));
    a.onended = () => setPlayingId(null);
    a.play().catch(() => setPlayingId(null));
    audioRef.current = a;
    setPlayingId(track.id);
  }

  const songs = tracks.filter((t) => t.kind === 'music');
  const bites = tracks.filter((t) => t.kind === 'sfx');

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin" className="text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Music className="w-7 h-7 text-accent-primary" />
        <h1 className="text-2xl font-display font-bold text-text-primary">Audio Library</h1>
      </div>
      <p className="text-sm text-text-muted mb-6 ml-8">
        Upload background songs and sound bites for the video editor. Anything you add here is instantly
        selectable by every user on web and mobile.
      </p>

      {/* Upload form */}
      <div className="card p-5 mb-8">
        <h2 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4 text-accent-primary" /> Add a track
        </h2>

        {/* Kind toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setKind('music')}
            className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${
              kind === 'music' ? 'border-accent-primary bg-accent-primary/10 text-text-primary' : 'border-white/10 bg-white/5 text-text-secondary hover:bg-white/10'
            }`}
          >
            <Volume2 className="w-4 h-4" /> Background Song
          </button>
          <button
            onClick={() => setKind('sfx')}
            className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${
              kind === 'sfx' ? 'border-accent-primary bg-accent-primary/10 text-text-primary' : 'border-white/10 bg-white/5 text-text-secondary hover:bg-white/10'
            }`}
          >
            <Zap className="w-4 h-4" /> Sound Bite
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-text-muted uppercase tracking-wider mb-1">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={kind === 'music' ? 'Celestial Drift' : 'Cosmic Whoosh'}
              className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted uppercase tracking-wider mb-1">Mood / tag</label>
            <input
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder={kind === 'music' ? 'Ethereal, Calm, Upbeat…' : 'Whoosh, Sparkle, Impact…'}
              className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors"
            />
          </div>
        </div>

        <label className="block text-xs text-text-muted uppercase tracking-wider mb-1">Audio file *</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
          onChange={(e) => onPickFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent-primary/15 file:text-accent-primary hover:file:bg-accent-primary/25 cursor-pointer mb-1"
        />
        <p className="text-[10px] text-text-muted mb-4">
          MP3, WAV, M4A/AAC or OGG · max 20 MB · must be royalty-free or your own work.
        </p>

        {error && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg mb-3">{error}</p>}

        <button
          onClick={handleUpload}
          disabled={uploading || !file || !name.trim()}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-primary to-purple-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-2"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading…' : 'Upload track'}
        </button>
      </div>

      {/* Library */}
      {loading ? (
        <div className="flex items-center gap-2 py-8 justify-center">
          <Loader2 className="w-5 h-5 text-accent-primary animate-spin" />
          <span className="text-text-muted text-sm">Loading library…</span>
        </div>
      ) : (
        <>
          <TrackSection
            title="Background Songs"
            icon={<Volume2 className="w-4 h-4" />}
            tracks={songs}
            playingId={playingId}
            onPlay={togglePlay}
            onToggleActive={toggleActive}
            onDelete={deleteTrack}
          />
          <TrackSection
            title="Sound Bites"
            icon={<Zap className="w-4 h-4" />}
            tracks={bites}
            playingId={playingId}
            onPlay={togglePlay}
            onToggleActive={toggleActive}
            onDelete={deleteTrack}
          />
        </>
      )}
    </div>
  );
}

function TrackSection({
  title, icon, tracks, playingId, onPlay, onToggleActive, onDelete,
}: {
  title: string;
  icon: React.ReactNode;
  tracks: AudioTrack[];
  playingId: string | null;
  onPlay: (t: AudioTrack) => void;
  onToggleActive: (t: AudioTrack) => void;
  onDelete: (t: AudioTrack) => void;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3 text-text-secondary">
        {icon}
        <h2 className="text-sm font-bold uppercase tracking-wider">{title}</h2>
        <span className="text-xs text-text-muted">({tracks.length})</span>
      </div>
      {tracks.length === 0 ? (
        <p className="text-sm text-text-muted italic px-1">None yet.</p>
      ) : (
        <div className="space-y-2">
          {tracks.map((t) => (
            <div
              key={t.id}
              className={`card py-3 px-4 flex items-center gap-3 ${!t.is_active ? 'opacity-50' : ''}`}
            >
              <button
                onClick={() => onPlay(t)}
                className="w-9 h-9 rounded-full bg-accent-primary/15 text-accent-primary flex items-center justify-center flex-shrink-0 hover:bg-accent-primary/25 transition-colors"
                title="Preview"
              >
                {playingId === t.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{t.name}</p>
                <p className="text-xs text-text-muted">
                  {t.mood || 'No tag'} · {fmtDuration(t.duration_seconds)}
                  {!t.is_active && <span className="text-amber-400"> · Hidden</span>}
                </p>
              </div>
              <button
                onClick={() => onToggleActive(t)}
                className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
                title={t.is_active ? 'Hide from editor' : 'Show in editor'}
              >
                {t.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onDelete(t)}
                className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                title="Delete"
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
