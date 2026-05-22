'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Shield, Users, Flag, Search, Trash2, CheckCircle, XCircle, Database, Loader2, Camera, Eye, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { api, buildBirthData } from '@/lib/api';
import { SIGNS, INDEXABLE_PLANETS } from '@/lib/cosmicIndexService';

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  category: string;
  description: string;
  status: string;
  created_at: string;
  reporter_name?: string;
  reported_name?: string;
}

interface UserRow {
  id: string;
  email: string;
  display_name: string;
  align_code: string;
  created_at: string;
  is_admin: boolean;
  sun_sign: string | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_location: string | null;
}

type Tab = 'moderation' | 'users' | 'verifications' | 'cosmic-index';

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="text-text-muted text-sm text-center py-12">Loading admin panel...</p>}>
      <AdminPageContent />
    </Suspense>
  );
}

function AdminPageContent() {
  const { profile } = useAuthStore();
  const searchParams = useSearchParams();
  const initialTab = (['moderation', 'users', 'verifications', 'cosmic-index'] as Tab[]).includes(searchParams.get('tab') as Tab)
    ? (searchParams.get('tab') as Tab)
    : 'moderation';
  const [tab, setTab] = useState<Tab>(initialTab);
  const [verified, setVerified] = useState(false);

  // Server-verified admin check via Supabase RLS + direct query
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

  // Guard: only verified admins
  if (!profile || !profile.is_admin || !verified) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-text-primary">Access Denied</h1>
        <p className="text-text-muted text-sm mt-2">Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-accent-primary" />
        <h1 className="text-2xl font-display font-bold text-text-primary">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-bg-tertiary rounded-xl p-1">
        <button
          onClick={() => setTab('moderation')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${tab === 'moderation' ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted'}`}
        >
          <Flag className="w-4 h-4 inline mr-1.5" /> Moderation
        </button>
        <button
          onClick={() => setTab('users')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${tab === 'users' ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted'}`}
        >
          <Users className="w-4 h-4 inline mr-1.5" /> Users
        </button>
        <button
          onClick={() => setTab('verifications')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${tab === 'verifications' ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted'}`}
        >
          <Camera className="w-4 h-4 inline mr-1.5" /> Verify
        </button>
        <button
          onClick={() => setTab('cosmic-index')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${tab === 'cosmic-index' ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted'}`}
        >
          <Database className="w-4 h-4 inline mr-1.5" /> Cosmic Index
        </button>
      </div>

      {tab === 'moderation' && <ModerationPanel />}
      {tab === 'users' && <UsersPanel />}
      {tab === 'verifications' && <VerificationsPanel />}
      {tab === 'cosmic-index' && <CosmicIndexPanel />}
    </div>
  );
}

function ModerationPanel() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadReports(); }, []);

  async function loadReports() {
    const supabase = createClient();
    const { data } = await supabase
      .from('reports')
      .select(`
        *,
        reporter:profiles!reports_reporter_id_fkey(display_name),
        reported:profiles!reports_reported_user_id_fkey(display_name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setReports(data.map((r: any) => ({
        ...r,
        reporter_name: r.reporter?.display_name || 'Unknown',
        reported_name: r.reported?.display_name || 'Unknown',
      })));
    }
    setLoading(false);
  }

  async function handleAction(reportId: string, action: 'resolved' | 'dismissed') {
    const supabase = createClient();
    await supabase.from('reports').update({ status: action }).eq('id', reportId);
    setReports(prev => prev.filter(r => r.id !== reportId));
  }

  if (loading) return <p className="text-text-muted text-sm">Loading reports...</p>;

  if (reports.length === 0) {
    return (
      <div className="card text-center py-12">
        <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
        <p className="text-text-secondary">No pending reports</p>
        <p className="text-xs text-text-muted mt-1">All clear!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-muted">{reports.length} pending report{reports.length > 1 ? 's' : ''}</p>
      {reports.map((report) => (
        <div key={report.id} className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-primary font-medium">
                <span className="text-text-muted">Reported:</span> {report.reported_name}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                by {report.reporter_name} &middot; {report.category}
              </p>
              <p className="text-xs text-text-secondary mt-2">{report.description}</p>
              <p className="text-[10px] text-text-muted mt-1">{new Date(report.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAction(report.id, 'resolved')}
                className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors"
                title="Resolve"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleAction(report.id, 'dismissed')}
                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                title="Dismiss"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function UsersPanel() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [filtered, setFiltered] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('id, email, display_name, align_code, created_at, is_admin, sun_sign, birth_date, birth_time, birth_location')
      .order('created_at', { ascending: false });

    if (data) {
      setUsers(data);
      setFiltered(data);
    }
    setLoading(false);
  }

  function handleSearch(q: string) {
    setSearch(q);
    if (!q.trim()) {
      setFiltered(users);
      return;
    }
    const lower = q.toLowerCase();
    setFiltered(users.filter(u =>
      (u.display_name || '').toLowerCase().includes(lower) ||
      (u.email || '').toLowerCase().includes(lower) ||
      (u.align_code || '').toLowerCase().includes(lower)
    ));
  }

  if (loading) return <p className="text-text-muted text-sm">Loading users...</p>;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name, email, or align code..."
          className="input pl-10"
        />
      </div>

      <p className="text-xs text-text-muted">{filtered.length} users total</p>

      {/* User list */}
      <div className="space-y-2">
        {filtered.slice(0, 50).map((user) => (
          <div key={user.id} className="card py-3 px-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-muted flex items-center justify-center text-sm font-bold text-accent-primary flex-shrink-0">
                {(user.display_name || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text-primary truncate">{user.display_name || 'No name'}</p>
                  {user.is_admin && (
                    <span className="text-[9px] font-bold text-accent-primary bg-accent-muted px-1.5 py-0.5 rounded flex-shrink-0">ADMIN</span>
                  )}
                  {user.sun_sign && <span className="text-xs text-text-tertiary flex-shrink-0">☉ {user.sun_sign}</span>}
                </div>
                <p className="text-xs text-text-muted">{user.email}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] text-text-secondary">
                  {user.birth_date ? (
                    <span>Born {user.birth_date}</span>
                  ) : (
                    <span className="text-text-muted">No birth date</span>
                  )}
                  {user.birth_time && <span>at {user.birth_time.slice(0, 5)}</span>}
                  {user.birth_location && <span className="truncate max-w-[200px]">{user.birth_location}</span>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-text-muted">Joined {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================================
// Photo Verification Admin Review
// =====================================================================

interface VerificationRow {
  id: string;
  user_id: string;
  selfie_url: string;
  status: string;
  confidence_score: number | null;
  ai_result: any;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  user_name?: string;
  photo_urls?: string[];
}

function VerificationsPanel() {
  const [items, setItems] = useState<VerificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'review' | 'all'>('review');
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => { loadVerifications(); }, [filter]);

  async function loadVerifications() {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from('photo_verifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter === 'review') {
      query = query.in('status', ['pending', 'needs_review']);
    }

    const { data } = await query;
    if (!data) { setLoading(false); return; }

    const userIds = Array.from(new Set(data.map((v: any) => v.user_id)));
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, photo_urls')
      .in('id', userIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    setItems(data.map((v: any) => ({
      ...v,
      user_name: profileMap.get(v.user_id)?.display_name || 'Unknown',
      photo_urls: profileMap.get(v.user_id)?.photo_urls || [],
    })));
    setLoading(false);
  }

  async function handleAction(id: string, action: 'approve' | 'reject', reason?: string) {
    setActioningId(id);
    const res = await fetch('/api/admin/review-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationId: id, action, rejectionReason: reason }),
    });
    if (res.ok) {
      setItems(prev => prev.filter(v => v.id !== id));
      setRejectingId(null);
      setRejectReason('');
    }
    setActioningId(null);
  }

  function confidenceBadge(score: number | null) {
    if (score === null || score === undefined) return null;
    const rounded = Math.round(score);
    const color = rounded >= 80 ? 'text-green-400 bg-green-500/10' :
                  rounded >= 45 ? 'text-yellow-400 bg-yellow-500/10' :
                  'text-red-400 bg-red-500/10';
    return (
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
        {rounded}% match
      </span>
    );
  }

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      pending: 'text-blue-400 bg-blue-500/10',
      needs_review: 'text-yellow-400 bg-yellow-500/10',
      approved: 'text-green-400 bg-green-500/10',
      rejected: 'text-red-400 bg-red-500/10',
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${styles[status] || 'text-text-muted bg-bg-tertiary'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  }

  if (loading) return <p className="text-text-muted text-sm">Loading verifications...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setFilter('review')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'review' ? 'bg-accent-primary text-white' : 'bg-bg-tertiary text-text-muted'}`}
        >
          <AlertTriangle className="w-3 h-3 inline mr-1" /> Needs Review
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'all' ? 'bg-accent-primary text-white' : 'bg-bg-tertiary text-text-muted'}`}
        >
          <Eye className="w-3 h-3 inline mr-1" /> All
        </button>
        <span className="text-xs text-text-muted ml-auto">{items.length} verification{items.length !== 1 ? 's' : ''}</span>
      </div>

      {items.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="text-text-secondary">No verifications to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((v) => (
            <div key={v.id} className="card p-4">
              <div className="flex items-start gap-4">
                {/* Selfie */}
                <div className="flex-shrink-0">
                  <p className="text-[10px] text-text-muted mb-1 text-center">Selfie</p>
                  <img
                    src={v.selfie_url}
                    alt="Selfie"
                    className="w-24 h-24 rounded-xl object-cover border border-white/10"
                  />
                </div>

                {/* Profile photos */}
                <div className="flex-shrink-0">
                  <p className="text-[10px] text-text-muted mb-1 text-center">Profile</p>
                  <div className="flex gap-1">
                    {(v.photo_urls || []).slice(0, 3).map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Profile ${i + 1}`}
                        className="w-24 h-24 rounded-xl object-cover border border-white/10"
                      />
                    ))}
                    {(!v.photo_urls || v.photo_urls.length === 0) && (
                      <div className="w-24 h-24 rounded-xl bg-bg-tertiary flex items-center justify-center">
                        <span className="text-xs text-text-muted">None</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{v.user_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {statusBadge(v.status)}
                    {confidenceBadge(v.confidence_score)}
                  </div>
                  {v.ai_result?.message && (
                    <p className="text-xs text-text-muted mt-1">{v.ai_result.message}</p>
                  )}
                  {v.rejection_reason && (
                    <p className="text-xs text-red-400 mt-1">Reason: {v.rejection_reason}</p>
                  )}
                  <p className="text-[10px] text-text-muted mt-2">
                    {new Date(v.created_at).toLocaleString()}
                  </p>

                  {/* Actions */}
                  {(v.status === 'pending' || v.status === 'needs_review') && (
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleAction(v.id, 'approve')}
                        disabled={actioningId === v.id}
                        className="px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-3 h-3 inline mr-1" /> Approve
                      </button>

                      {rejectingId === v.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason (optional)"
                            className="px-2 py-1 rounded-lg bg-bg-tertiary text-xs text-text-primary border border-white/10 outline-none w-40"
                          />
                          <button
                            onClick={() => handleAction(v.id, 'reject', rejectReason)}
                            disabled={actioningId === v.id}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => { setRejectingId(null); setRejectReason(''); }}
                            className="text-xs text-text-muted"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRejectingId(v.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors"
                        >
                          <XCircle className="w-3 h-3 inline mr-1" /> Reject
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Cosmic Index Batch Indexer
// =====================================================================

interface UnindexedUser {
  id: string;
  display_name: string;
  birth_date: string;
  birth_time: string | null;
  latitude: number;
  longitude: number;
  timezone: string | null;
  birth_location: string | null;
}

function CosmicIndexPanel() {
  const [unindexed, setUnindexed] = useState<UnindexedUser[]>([]);
  const [totalIndexed, setTotalIndexed] = useState(0);
  const [totalWithBirth, setTotalWithBirth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev.slice(-200), msg]);
  }, []);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    setLoading(true);
    const supabase = createClient();

    const { count: indexedCount } = await supabase
      .from('planet_placement_index')
      .select('user_id', { count: 'exact', head: true });

    const { data: withBirth } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: false })
      .not('birth_date', 'is', null)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    const { data: unindexedData, error } = await supabase.rpc('get_unindexed_users_with_birth_data');

    if (!error && unindexedData) {
      setUnindexed(unindexedData as UnindexedUser[]);
    } else {
      // Fallback: manual query if RPC doesn't exist yet
      const { data: allWithBirth } = await supabase
        .from('profiles')
        .select('id, display_name, birth_date, birth_time, latitude, longitude, timezone, birth_location')
        .not('birth_date', 'is', null)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (allWithBirth) {
        const { data: indexedIds } = await supabase
          .from('planet_placement_index')
          .select('user_id');
        const indexedSet = new Set((indexedIds || []).map((r: any) => r.user_id));
        setUnindexed((allWithBirth as UnindexedUser[]).filter(u => !indexedSet.has(u.id)));
      }
    }

    // Deduplicate indexed count (count distinct user_ids)
    const { data: distinctIndexed } = await supabase
      .from('planet_placement_index')
      .select('user_id');
    const uniqueIndexed = new Set((distinctIndexed || []).map((r: any) => r.user_id));
    setTotalIndexed(uniqueIndexed.size);
    setTotalWithBirth(withBirth?.length || 0);
    setLoading(false);
  }

  async function runBatchIndex() {
    if (running || unindexed.length === 0) return;
    setRunning(true);
    setProgress(0);
    setSuccessCount(0);
    setFailCount(0);
    setDone(false);
    setLogs([]);

    const supabase = createClient();
    const total = unindexed.length;
    let ok = 0;
    let fail = 0;

    for (let i = 0; i < total; i++) {
      const user = unindexed[i];
      const label = user.display_name || user.id.slice(0, 8);

      try {
        addLog(`[${i + 1}/${total}] Computing chart for ${label}...`);

        const birthData = buildBirthData(user);
        const chart = await api.getNatalChart(birthData);

        const positions = chart?.positions || chart?.planets || [];
        if (!positions.length) {
          addLog(`  -> Skipped ${label}: no planets returned`);
          fail++;
          setFailCount(fail);
          setProgress(i + 1);
          continue;
        }

        const records: any[] = [];
        for (const p of positions) {
          if (!(INDEXABLE_PLANETS as readonly string[]).includes(p.name)) continue;
          const signIndex = (SIGNS as readonly string[]).indexOf(p.sign);
          if (signIndex < 0) continue;
          const deg = p.sign_degree ?? p.degree ?? 0;
          const degreeWhole = Math.floor(deg);
          const degreeMinute = Math.round((deg - degreeWhole) * 60);
          records.push({
            planet_name: p.name,
            sign_name: p.sign,
            sign_number: signIndex,
            house_number: p.house || 1,
            exact_degree: Math.round(deg * 10000) / 10000,
            degree_whole: degreeWhole,
            degree_minute: Math.min(degreeMinute, 59),
            zodiac_longitude: Math.round(p.longitude * 10000) / 10000,
            retrograde: p.is_retrograde ?? p.retrograde ?? false,
          });
        }

        if (records.length === 0) {
          addLog(`  -> Skipped ${label}: no indexable placements`);
          fail++;
          setFailCount(fail);
          setProgress(i + 1);
          continue;
        }

        // Try admin RPC first, fall back to regular if admin RPC not yet created
        const { error: rpcError } = await supabase.rpc('admin_upsert_planet_placements', {
          p_target_user_id: user.id,
          p_placements: records,
        });

        if (rpcError) {
          addLog(`  -> Failed ${label}: ${rpcError.message}`);
          fail++;
          setFailCount(fail);
        } else {
          addLog(`  -> Indexed ${label}: ${records.length} placements`);
          ok++;
          setSuccessCount(ok);
        }
      } catch (err: any) {
        addLog(`  -> Error ${label}: ${err.message || 'unknown'}`);
        fail++;
        setFailCount(fail);
      }

      setProgress(i + 1);

      // Small delay to avoid hammering the API
      if (i < total - 1) {
        await new Promise(r => setTimeout(r, 300));
      }
    }

    addLog(`\nDone! ${ok} indexed, ${fail} failed out of ${total} users.`);
    setDone(true);
    setRunning(false);
    loadStats();
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 justify-center">
        <Loader2 className="w-5 h-5 text-accent-primary animate-spin" />
        <span className="text-text-muted text-sm">Loading index stats...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center py-4">
          <p className="text-2xl font-extrabold text-accent-primary">{totalWithBirth}</p>
          <p className="text-xs text-text-muted mt-1">Users with birth data</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-2xl font-extrabold text-green-400">{totalIndexed}</p>
          <p className="text-xs text-text-muted mt-1">Already indexed</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-2xl font-extrabold text-amber-400">{unindexed.length}</p>
          <p className="text-xs text-text-muted mt-1">Need indexing</p>
        </div>
      </div>

      {/* Action */}
      {unindexed.length > 0 && !done && (
        <div className="card p-5">
          <h3 className="text-base font-bold text-text-primary mb-2">Batch Index Placements</h3>
          <p className="text-sm text-text-muted mb-4">
            Compute natal charts and index placements for {unindexed.length} user{unindexed.length > 1 ? 's' : ''} who have birth data but haven{"'"}t been indexed yet.
          </p>

          {!running ? (
            <button
              onClick={runBatchIndex}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-primary to-purple-600 text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Index {unindexed.length} Users
            </button>
          ) : (
            <div className="space-y-3">
              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-accent-primary animate-spin flex-shrink-0" />
                <div className="flex-1 h-3 bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-primary to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${(progress / unindexed.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-text-secondary w-16 text-right">
                  {progress}/{unindexed.length}
                </span>
              </div>
              <div className="flex gap-4 text-xs">
                <span className="text-green-400">{successCount} indexed</span>
                {failCount > 0 && <span className="text-red-400">{failCount} failed</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {done && (
        <div className="card p-5 text-center">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-text-primary">Batch Indexing Complete</h3>
          <p className="text-sm text-text-muted mt-1">
            {successCount} users indexed successfully{failCount > 0 ? `, ${failCount} failed` : ''}
          </p>
        </div>
      )}

      {unindexed.length === 0 && !done && (
        <div className="card p-5 text-center">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-text-primary">All Users Indexed</h3>
          <p className="text-sm text-text-muted mt-1">
            Every user with birth data is already in the Cosmic Index.
          </p>
        </div>
      )}

      {/* Log output */}
      {logs.length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-bold text-text-muted mb-2">Log</p>
          <div className="max-h-60 overflow-y-auto bg-bg-tertiary rounded-lg p-3 font-mono text-[11px] text-text-secondary leading-5 space-y-0.5">
            {logs.map((line, i) => (
              <p key={i} className={line.includes('Failed') || line.includes('Error') ? 'text-red-400' : line.includes('Indexed') ? 'text-green-400' : ''}>
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
