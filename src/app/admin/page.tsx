'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Shield, Users, Flag, Search, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

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
}

type Tab = 'moderation' | 'users';

export default function AdminPage() {
  const { profile } = useAuthStore();
  const [tab, setTab] = useState<Tab>('moderation');
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Guard: only admins
  if (profile && !profile.is_admin) {
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
      </div>

      {tab === 'moderation' && <ModerationPanel />}
      {tab === 'users' && <UsersPanel />}
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
      .select('id, email, display_name, align_code, created_at, is_admin, sun_sign, birth_date')
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
          <div key={user.id} className="card flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-muted flex items-center justify-center text-sm font-bold text-accent-primary">
                {(user.display_name || '?')[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text-primary">{user.display_name || 'No name'}</p>
                  {user.is_admin && (
                    <span className="text-[9px] font-bold text-accent-primary bg-accent-muted px-1.5 py-0.5 rounded">ADMIN</span>
                  )}
                </div>
                <p className="text-xs text-text-muted">{user.email}</p>
              </div>
            </div>
            <div className="text-right">
              {user.sun_sign && <p className="text-xs text-text-tertiary">{user.sun_sign}</p>}
              <p className="text-[10px] text-text-muted">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
