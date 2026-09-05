'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Shield, Users, Flag, Search, Trash2, CheckCircle, XCircle, Database, Loader2, Camera, Eye, AlertTriangle, Mail, FileText, DollarSign, ExternalLink, Copy, GraduationCap, Megaphone, Globe2, Music, BarChart3, Telescope } from 'lucide-react';
import Link from 'next/link';
import { api, buildBirthData } from '@/lib/api';
import { SIGNS, INDEXABLE_PLANETS } from '@/lib/cosmicIndexService';
import { useTranslation } from 'react-i18next';
import AffiliateDashboardView, {
  type AffiliateData as AffiliateDashData,
  type Conversion as AffiliateConversionData,
  type Click as AffiliateClickData,
  type Payout as AffiliatePayoutData,
} from '@/components/AffiliateDashboardView';

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
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
}

// The stat pills double as filters for the user list below them.
type UserCohort = 'all' | 'noBirthDate' | 'noBirthTime' | 'missingLocation';

const COHORT_FILTERS: Record<UserCohort, (u: UserRow) => boolean> = {
  all: () => true,
  noBirthDate: (u) => !u.birth_date,
  noBirthTime: (u) => !!u.birth_date && !u.birth_time,
  // Entered a birth date but the location was never geocoded.
  missingLocation: (u) =>
    !!u.birth_date && (u.latitude == null || u.longitude == null || !u.timezone),
};

const COHORT_LABELS: Record<UserCohort, string> = {
  all: 'All members',
  noBirthDate: 'No birth date',
  noBirthTime: 'No birth time',
  missingLocation: 'Missing location (backfill)',
};

// Shape returned by GET /api/admin/send-birth-reminder — the reminder ledger
// report: who fixed their birth data after being emailed, and who is still due.
interface ReminderReport {
  ledgerReady: boolean;
  warning?: string;
  policy?: { maxReminders: number; cooldownDays: number };
  totals: {
    profiles: number;
    complete: number;
    missingBirthDate: number;
    needsCoordinateBackfill: number;
  };
  ledger?: {
    tracked: number;
    fixedAfterReminder: number;
    stillMissingAfterReminder: number;
    eligibleNow: number;
    coolingDown: number;
    maxedOut: number;
    optedOut: number;
    clearedAfterCompletion: number;
    noEmail: number;
  };
}

type Tab = 'moderation' | 'users' | 'verifications' | 'cosmic-index' | 'affiliates';

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="text-text-muted text-sm text-center py-12">Loading admin panel...</p>}>
      <AdminPageContent />
    </Suspense>
  );
}

function AdminPageContent() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const searchParams = useSearchParams();
  const initialTab = (['moderation', 'users', 'verifications', 'cosmic-index', 'affiliates'] as Tab[]).includes(searchParams.get('tab') as Tab)
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
        <h1 className="text-2xl font-display font-bold text-text-primary">{t('settings.admin.title')}</h1>
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
        <button
          onClick={() => setTab('affiliates')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${tab === 'affiliates' ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted'}`}
        >
          <DollarSign className="w-4 h-4 inline mr-1.5" /> Affiliates
        </button>
      </div>

      {/* Quick links */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Link
          href="/admin/analytics"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-accent-primary/10 border border-accent-primary/30 text-accent-primary hover:bg-accent-primary/20 transition-colors"
        >
          <BarChart3 className="w-4 h-4" /> Analytics
        </Link>
        <Link
          href="/admin/blog"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-bg-card border border-border-primary text-text-secondary hover:text-text-primary hover:border-accent-primary/30 transition-colors"
        >
          <FileText className="w-4 h-4" /> Blog Manager
        </Link>
        <Link
          href="/admin/learn"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-bg-card border border-border-primary text-text-secondary hover:text-text-primary hover:border-accent-primary/30 transition-colors"
        >
          <GraduationCap className="w-4 h-4" /> Learn / Courses
        </Link>
        <Link
          href="/admin/social"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-bg-card border border-border-primary text-text-secondary hover:text-text-primary hover:border-accent-primary/30 transition-colors"
        >
          <Megaphone className="w-4 h-4" /> Social / Official Posts
        </Link>
        <Link
          href="/admin/zodisphere"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-bg-card border border-border-primary text-text-secondary hover:text-text-primary hover:border-accent-primary/30 transition-colors"
        >
          <Globe2 className="w-4 h-4" /> Zodisphere Intelligence
        </Link>
        <Link
          href="/admin/world-echo"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-bg-card border border-border-primary text-text-secondary hover:text-text-primary hover:border-accent-primary/30 transition-colors"
        >
          <Telescope className="w-4 h-4" /> World Echo Audit
        </Link>
        <Link
          href="/admin/audio"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-bg-card border border-border-primary text-text-secondary hover:text-text-primary hover:border-accent-primary/30 transition-colors"
        >
          <Music className="w-4 h-4" /> Audio Library
        </Link>
      </div>

      {tab === 'moderation' && <ModerationPanel />}
      {tab === 'users' && <UsersPanel />}
      {tab === 'verifications' && <VerificationsPanel />}
      {tab === 'cosmic-index' && <CosmicIndexPanel />}
      {tab === 'affiliates' && <AffiliatesPanel />}
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
  const [sendingReminders, setSendingReminders] = useState(false);
  const [reminderResult, setReminderResult] = useState<{ sent: number; errors: number; total: number; eligible: number; skippedNote: string } | null>(null);
  const [dbCounts, setDbCounts] = useState<{ total: number; noBirthDate: number; noBirthTime: number; incomplete: number } | null>(null);
  const [reminderReport, setReminderReport] = useState<ReminderReport | null>(null);
  const [cohort, setCohort] = useState<UserCohort>('all');
  const [visibleCount, setVisibleCount] = useState(50);
  const [copied, setCopied] = useState(false);

  useEffect(() => { loadUsers(); loadCounts(); loadReminderReport(); }, []);

  // The list below the pills = search results narrowed to the selected cohort.
  const visible = filtered.filter(COHORT_FILTERS[cohort]);

  function selectCohort(next: UserCohort) {
    setCohort((current) => (current === next ? 'all' : next));
    setVisibleCount(50);
    setCopied(false);
  }

  // Every email in the current cohort, in one clipboard paste — the whole point
  // is not having to scroll 800 rows to find the 145 that matter.
  async function copyCohortEmails() {
    const emails = visible.map((u) => u.email).filter(Boolean);
    if (emails.length === 0) return;
    try {
      await navigator.clipboard.writeText(emails.join(', '));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  // Who is already fixed vs who is actually due for an email. Comes from the
  // birth_reminder_state ledger via the API (service key — the browser client
  // can't read the ledger).
  async function loadReminderReport() {
    try {
      const res = await fetch('/api/admin/send-birth-reminder');
      if (!res.ok) return;
      setReminderReport(await res.json());
    } catch {
      // Report is a nice-to-have; the panel still works without it.
    }
  }

  async function loadUsers() {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('id, email, display_name, align_code, created_at, is_admin, sun_sign, birth_date, birth_time, birth_location, latitude, longitude, timezone')
      .order('created_at', { ascending: false })
      .range(0, 4999);

    if (data) {
      setUsers(data);
      setFiltered(data);
    }
    setLoading(false);
  }

  async function loadCounts() {
    const supabase = createClient();
    // Get real counts from the database (not limited by pagination)
    const [totalRes, noBirthDateRes, noBirthTimeRes, incompleteRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).is('birth_date', null),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).not('birth_date', 'is', null).is('birth_time', null),
      // "Missing location" = entered a birth date but never geocoded (lat/lon/tz null).
      // These users HAVE filled in their info, so they are NOT emailed — they're fixed by backfill.
      supabase.from('profiles').select('id', { count: 'exact', head: true }).not('birth_date', 'is', null).or('latitude.is.null,longitude.is.null,timezone.is.null'),
    ]);
    setDbCounts({
      total: totalRes.count ?? 0,
      noBirthDate: noBirthDateRes.count ?? 0,
      noBirthTime: noBirthTimeRes.count ?? 0,
      incomplete: incompleteRes.count ?? 0,
    });
  }

  function handleSearch(q: string) {
    setSearch(q);
    setVisibleCount(50);
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

  async function sendBirthReminders() {
    setSendingReminders(true);
    setReminderResult(null);
    try {
      const res = await fetch('/api/admin/send-birth-reminder', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        const s = data.skipped || {};
        const skippedParts = [
          s.coolingDown ? `${s.coolingDown} in cooldown` : '',
          s.maxedOut ? `${s.maxedOut} at reminder limit` : '',
          s.optedOut ? `${s.optedOut} opted out` : '',
          s.clearedAfterCompletion ? `${s.clearedAfterCompletion} cleared their own data` : '',
          s.noEmail ? `${s.noEmail} with no email` : '',
        ].filter(Boolean);
        setReminderResult({
          sent: data.sent || 0,
          errors: data.errors || 0,
          total: data.totalIncomplete || 0,
          eligible: data.eligible || 0,
          skippedNote: skippedParts.length ? `skipped ${skippedParts.join(', ')}` : '',
        });
        loadReminderReport();
      } else {
        setReminderResult({ sent: 0, errors: 1, total: 0, eligible: 0, skippedNote: '' });
      }
    } catch {
      setReminderResult({ sent: 0, errors: 1, total: 0, eligible: 0, skippedNote: '' });
    } finally {
      setSendingReminders(false);
    }
  }

  if (loading) return <p className="text-text-muted text-sm">Loading users...</p>;

  return (
    <div className="space-y-4">
      {/* Real-time stats from DB — each pill filters the list below it */}
      {dbCounts && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {([
            { key: 'all' as UserCohort, count: dbCounts.total, label: 'Total Members', border: 'border-border-primary', text: 'text-text-primary', ring: 'ring-white/40' },
            { key: 'noBirthDate' as UserCohort, count: dbCounts.noBirthDate, label: 'No Birth Date', border: 'border-red-500/20', text: 'text-red-400', ring: 'ring-red-400/70' },
            { key: 'noBirthTime' as UserCohort, count: dbCounts.noBirthTime, label: 'No Birth Time', border: 'border-amber-500/20', text: 'text-amber-400', ring: 'ring-amber-400/70' },
            { key: 'missingLocation' as UserCohort, count: dbCounts.incomplete, label: 'Missing Location (backfill)', border: 'border-orange-500/20', text: 'text-orange-400', ring: 'ring-orange-400/70' },
          ]).map((pill) => (
            <button
              key={pill.key}
              onClick={() => selectCohort(pill.key)}
              className={`text-left bg-bg-secondary rounded-lg p-3 border ${pill.border} hover:bg-white/5 transition-colors ${cohort === pill.key ? `ring-2 ${pill.ring}` : ''}`}
            >
              <p className={`text-lg font-bold ${pill.text}`}>{pill.count}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">{pill.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* Reminder ledger — fixed vs still pending, so nobody gets emailed twice */}
      {reminderReport?.ledgerReady && reminderReport.ledger && (
        <div className="bg-bg-secondary rounded-lg p-3 border border-border-primary space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Birth Reminder Ledger</p>
            <p className="text-[10px] text-text-muted">
              max {reminderReport.policy?.maxReminders} emails · {reminderReport.policy?.cooldownDays}-day cooldown
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <p className="text-lg font-bold text-green-400">{reminderReport.ledger.fixedAfterReminder}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Fixed After Reminder</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-400">{reminderReport.ledger.eligibleNow}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Due Now</p>
            </div>
            <div>
              <p className="text-lg font-bold text-text-secondary">{reminderReport.ledger.coolingDown}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">In Cooldown</p>
            </div>
            <div>
              <p className="text-lg font-bold text-text-secondary">{reminderReport.ledger.maxedOut}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Hit Reminder Limit</p>
            </div>
          </div>
          <p className="text-[11px] text-text-muted">
            {reminderReport.ledger.stillMissingAfterReminder} emailed and still missing a birth date ·{' '}
            {reminderReport.ledger.noEmail} with no email address
            {reminderReport.ledger.optedOut > 0 && ` · ${reminderReport.ledger.optedOut} opted out`}
          </p>
        </div>
      )}

      {reminderReport && !reminderReport.ledgerReady && (
        <div className="text-xs px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400">
          Reminder de-duplication is off — run <code>supabase-migration-birth-reminder-ledger.sql</code> in Supabase.
          Until then every send emails all {reminderReport.totals.missingBirthDate} users missing a birth date.
        </div>
      )}

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

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs text-text-muted">
          {cohort === 'all'
            ? `${visible.length} users shown${dbCounts ? ` of ${dbCounts.total}` : ''}`
            : `${visible.length} in ${COHORT_LABELS[cohort]}`}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {cohort !== 'all' && (
            <button
              onClick={() => selectCohort('all')}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 text-text-secondary border border-white/10 hover:bg-white/10 transition-colors"
            >
              Clear filter
            </button>
          )}
          <button
            onClick={copyCohortEmails}
            disabled={visible.length === 0}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 text-text-secondary border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <Copy className="w-3 h-3" />
            {copied ? 'Copied!' : `Copy ${visible.length} email${visible.length === 1 ? '' : 's'}`}
          </button>
          <button
            onClick={() => { loadCounts(); loadUsers(); loadReminderReport(); }}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 text-text-secondary border border-white/10 hover:bg-white/10 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={sendBirthReminders}
            disabled={sendingReminders}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors disabled:opacity-50"
          >
            {sendingReminders
              ? 'Sending...'
              : `Email ${(reminderReport?.ledgerReady ? reminderReport.ledger?.eligibleNow : dbCounts?.noBirthDate) ?? '...'} Due for Reminder`}
          </button>
        </div>
      </div>

      {reminderResult && (
        <div className={`text-xs px-3 py-2 rounded-lg ${reminderResult.errors > 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
          Sent {reminderResult.sent} of {reminderResult.eligible} due reminders ({reminderResult.total} still have no birth date, {reminderResult.errors} errors)
          {reminderResult.skippedNote && ` — ${reminderResult.skippedNote}`}
        </div>
      )}

      {/* User list */}
      <div className="space-y-2">
        {visible.length === 0 && (
          <p className="text-xs text-text-muted py-6 text-center">No users in {COHORT_LABELS[cohort]}.</p>
        )}
        {visible.slice(0, visibleCount).map((user) => (
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
                {user.email ? (
                  <a href={`mailto:${user.email}`} className="text-xs text-text-muted hover:text-accent-primary transition-colors break-all">
                    {user.email}
                  </a>
                ) : (
                  <p className="text-xs text-red-400">No email on file</p>
                )}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] text-text-secondary">
                  {user.birth_date ? (
                    <span>Born {user.birth_date}</span>
                  ) : (
                    <span className="text-red-400 font-medium"><AlertTriangle className="w-3 h-3 inline mr-0.5" />No birth date</span>
                  )}
                  {user.birth_date && (user.birth_time
                    ? <span>at {user.birth_time.slice(0, 5)}</span>
                    : <span className="text-amber-400 font-medium">No birth time</span>
                  )}
                  {user.birth_location && <span className="truncate max-w-[200px]">{user.birth_location}</span>}
                  {user.birth_date && (user.latitude == null || user.longitude == null || !user.timezone) && (
                    <span className="text-orange-400 font-medium">Not geocoded</span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0 space-y-1">
                <p className="text-[10px] text-text-muted">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                {user.email && (
                  <a
                    href={`mailto:${user.email}?subject=${encodeURIComponent('Your Align birth details')}`}
                    className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-white/5 text-text-secondary border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <Mail className="w-3 h-3" /> Email
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
        {visible.length > visibleCount && (
          <button
            onClick={() => setVisibleCount((n) => n + 100)}
            className="w-full text-xs font-medium px-3 py-2 rounded-lg bg-white/5 text-text-secondary border border-white/10 hover:bg-white/10 transition-colors"
          >
            Show {Math.min(100, visible.length - visibleCount)} more ({visible.length - visibleCount} remaining)
          </button>
        )}
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
    try {
      const res = await fetch(`/api/admin/list-verifications?filter=${filter}`);
      if (!res.ok) { setLoading(false); return; }
      const { items: data } = await res.json();
      setItems(data || []);
    } catch {
      setItems([]);
    }
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
            <div key={v.id} className="card p-4 space-y-3">
              {/* Header: name + status */}
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-text-primary">{v.user_name}</p>
                {statusBadge(v.status)}
                {confidenceBadge(v.confidence_score)}
                <p className="text-[10px] text-text-muted ml-auto">
                  {new Date(v.created_at).toLocaleString()}
                </p>
              </div>

              {/* Photos row */}
              <div className="flex items-start gap-4 flex-wrap">
                <div>
                  <p className="text-[10px] text-text-muted mb-1 text-center">Selfie</p>
                  <img
                    src={v.selfie_url}
                    alt="Selfie"
                    className="w-28 h-28 rounded-xl object-cover border border-white/10"
                  />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted mb-1 text-center">Profile Photos</p>
                  <div className="flex gap-1 flex-wrap">
                    {(v.photo_urls || []).slice(0, 3).map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Profile ${i + 1}`}
                        className="w-28 h-28 rounded-xl object-cover border border-white/10"
                      />
                    ))}
                    {(!v.photo_urls || v.photo_urls.length === 0) && (
                      <div className="w-28 h-28 rounded-xl bg-bg-tertiary flex items-center justify-center">
                        <span className="text-xs text-text-muted">No photos</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {v.ai_result?.message && (
                <p className="text-xs text-text-muted">{v.ai_result.message}</p>
              )}
              {v.rejection_reason && (
                <p className="text-xs text-red-400">Reason: {v.rejection_reason}</p>
              )}

              {/* Action buttons — always visible */}
              {(v.status === 'pending' || v.status === 'needs_review') && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleAction(v.id, 'approve')}
                    disabled={actioningId === v.id}
                    className="px-4 py-2 rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-400 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 inline mr-1.5" /> Approve
                  </button>

                  {rejectingId === v.id ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Reason (optional)"
                        className="px-3 py-2 rounded-lg bg-bg-tertiary text-sm text-text-primary border border-white/10 outline-none w-48"
                      />
                      <button
                        onClick={() => handleAction(v.id, 'reject', rejectReason)}
                        disabled={actioningId === v.id}
                        className="px-4 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Confirm Reject
                      </button>
                      <button
                        onClick={() => { setRejectingId(null); setRejectReason(''); }}
                        className="text-sm text-text-muted px-2"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRejectingId(v.id)}
                      className="px-4 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-sm font-medium transition-colors"
                    >
                      <XCircle className="w-4 h-4 inline mr-1.5" /> Reject
                    </button>
                  )}
                </div>
              )}
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

// =====================================================================
// Affiliate Management Panel
// =====================================================================

interface AffiliateRow {
  id: string;
  name: string;
  email: string;
  website: string | null;
  social_handle: string | null;
  promo_method: string | null;
  affiliate_code: string;
  status: string;
  commission_rate_bps: number;
  total_clicks: number;
  total_signups: number;
  total_conversions: number;
  total_earnings_cents: number;
  total_paid_cents: number;
  unpaid_cents: number;
  created_at: string;
  approved_at: string | null;
  rejection_reason: string | null;
}

interface AffiliateStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
  totalEarnings: number;
  totalPaid: number;
  totalUnpaid: number;
}

function AffiliatesPanel() {
  const [affiliates, setAffiliates] = useState<AffiliateRow[]>([]);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // View-as-affiliate modal state (shows exactly what the affiliate sees)
  const [viewAff, setViewAff] = useState<AffiliateRow | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState('');
  const [viewData, setViewData] = useState<{
    affiliate: AffiliateDashData;
    conversions: AffiliateConversionData[];
    clicks: AffiliateClickData[];
    payouts: AffiliatePayoutData[];
  } | null>(null);

  // Payout modal state
  const [payoutAff, setPayoutAff] = useState<AffiliateRow | null>(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('paypal');
  const [payoutEmail, setPayoutEmail] = useState('');
  const [payoutRef, setPayoutRef] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutError, setPayoutError] = useState('');

  useEffect(() => { loadAffiliates(); }, [filter]);

  async function loadAffiliates() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/affiliates?status=${filter}`);
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      setAffiliates(data.affiliates || []);
      setStats(data.stats || null);
    } catch {
      setAffiliates([]);
    }
    setLoading(false);
  }

  async function handleStatus(affiliateId: string, status: string, rejectionReason?: string) {
    setActioningId(affiliateId);
    try {
      const res = await fetch('/api/admin/affiliates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateId, status, rejectionReason }),
      });
      if (res.ok) {
        loadAffiliates();
        setRejectingId(null);
        setRejectReason('');
      }
    } catch {}
    setActioningId(null);
  }

  async function handlePayout() {
    if (!payoutAff || !payoutAmount || !payoutRef.trim()) return;
    const amountCents = Math.round(parseFloat(payoutAmount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      setPayoutError('Enter a valid dollar amount');
      return;
    }
    setPayoutSubmitting(true);
    setPayoutError('');
    try {
      const res = await fetch('/api/admin/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliateId: payoutAff.id,
          amountCents,
          method: payoutMethod,
          payoutEmail: payoutEmail || payoutAff.email,
          transactionRef: payoutRef.trim(),
          notes: payoutNotes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPayoutError(data.error || 'Payout failed');
        setPayoutSubmitting(false);
        return;
      }
      setPayoutAff(null);
      setPayoutAmount('');
      setPayoutRef('');
      setPayoutNotes('');
      loadAffiliates();
    } catch (err: any) {
      setPayoutError(err.message || 'Network error');
    }
    setPayoutSubmitting(false);
  }

  async function openDashboard(aff: AffiliateRow) {
    setViewAff(aff);
    setViewData(null);
    setViewError('');
    setViewLoading(true);
    try {
      const res = await fetch(`/api/admin/affiliates/${aff.id}`);
      const data = await res.json();
      if (!res.ok) {
        setViewError(data.error || 'Failed to load dashboard');
      } else {
        setViewData(data);
      }
    } catch (err: any) {
      setViewError(err.message || 'Network error');
    }
    setViewLoading(false);
  }

  function openPayoutModal(aff: AffiliateRow) {
    setPayoutAff(aff);
    setPayoutAmount((aff.unpaid_cents / 100).toFixed(2));
    setPayoutMethod('paypal');
    setPayoutEmail(aff.email);
    setPayoutRef('');
    setPayoutNotes('');
    setPayoutError('');
  }

  function centsToUSD(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  function statusColor(status: string) {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-500/10';
      case 'pending': return 'text-yellow-400 bg-yellow-500/10';
      case 'rejected': return 'text-red-400 bg-red-500/10';
      case 'suspended': return 'text-orange-400 bg-orange-500/10';
      default: return 'text-text-muted bg-bg-tertiary';
    }
  }

  if (loading) return <p className="text-text-muted text-sm">Loading affiliates...</p>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-bg-secondary rounded-lg p-3 border border-border-primary">
            <p className="text-lg font-bold text-text-primary">{stats.total}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Total Affiliates</p>
          </div>
          <div className="bg-bg-secondary rounded-lg p-3 border border-yellow-500/20">
            <p className="text-lg font-bold text-yellow-400">{stats.pending}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Pending Review</p>
          </div>
          <div className="bg-bg-secondary rounded-lg p-3 border border-green-500/20">
            <p className="text-lg font-bold text-green-400">{stats.approved}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Active</p>
          </div>
          <div className="bg-bg-secondary rounded-lg p-3 border border-accent-primary/20">
            <p className="text-lg font-bold text-accent-primary">{centsToUSD(stats.totalUnpaid)}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Unpaid Commission</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {['all', 'pending', 'approved', 'rejected', 'suspended'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? 'bg-accent-primary text-white' : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && stats?.pending ? ` (${stats.pending})` : ''}
          </button>
        ))}
        <button
          onClick={loadAffiliates}
          className="ml-auto text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 text-text-secondary border border-white/10 hover:bg-white/10 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Affiliate list */}
      {affiliates.length === 0 ? (
        <div className="card text-center py-12">
          <DollarSign className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No affiliates {filter !== 'all' ? `with status "${filter}"` : 'yet'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {affiliates.map(aff => (
            <div key={aff.id} className="card p-4 space-y-3">
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-text-primary">{aff.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusColor(aff.status)}`}>
                      {aff.status}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{aff.email}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary flex-wrap">
                    {aff.website && (
                      <a href={aff.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent-primary">
                        <ExternalLink className="w-3 h-3" /> {aff.website.replace(/^https?:\/\//, '').slice(0, 30)}
                      </a>
                    )}
                    {aff.social_handle && <span>@ {aff.social_handle}</span>}
                    {aff.promo_method && <span className="text-text-muted italic truncate max-w-[200px]">{aff.promo_method}</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-text-muted">
                    Applied {new Date(aff.created_at).toLocaleDateString()}
                  </p>
                  <code className="text-[10px] text-accent-primary font-mono">{aff.affiliate_code}</code>
                </div>
              </div>

              {/* Stats row (only for approved affiliates) */}
              {aff.status === 'approved' && (
                <div className="flex gap-4 text-xs text-text-secondary flex-wrap">
                  <span><strong className="text-text-primary">{aff.total_clicks}</strong> clicks</span>
                  <span><strong className="text-text-primary">{aff.total_signups}</strong> signups</span>
                  <span><strong className="text-text-primary">{aff.total_conversions}</strong> conversions</span>
                  <span>Earned <strong className="text-green-400">{centsToUSD(aff.total_earnings_cents)}</strong></span>
                  <span>Paid <strong className="text-blue-400">{centsToUSD(aff.total_paid_cents)}</strong></span>
                  <span>Unpaid <strong className="text-accent-primary">{centsToUSD(aff.unpaid_cents)}</strong></span>
                </div>
              )}

              {aff.rejection_reason && (
                <p className="text-xs text-red-400">Reason: {aff.rejection_reason}</p>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => openDashboard(aff)}
                  className="px-3 py-1.5 rounded-lg bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View Dashboard
                </button>
                {aff.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatus(aff.id, 'approved')}
                      disabled={actioningId === aff.id}
                      className="px-4 py-2 rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-400 text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5 inline mr-1.5" /> Approve
                    </button>
                    {rejectingId === aff.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reason (optional)"
                          className="px-3 py-2 rounded-lg bg-bg-tertiary text-xs text-text-primary border border-white/10 outline-none w-40"
                        />
                        <button
                          onClick={() => handleStatus(aff.id, 'rejected', rejectReason)}
                          disabled={actioningId === aff.id}
                          className="px-3 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => { setRejectingId(null); setRejectReason(''); }}
                          className="text-xs text-text-muted px-2"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRejectingId(aff.id)}
                        className="px-4 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-medium transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5 inline mr-1.5" /> Reject
                      </button>
                    )}
                  </>
                )}
                {aff.status === 'approved' && (
                  <>
                    {aff.unpaid_cents > 0 && (
                      <button
                        onClick={() => openPayoutModal(aff)}
                        className="px-3 py-1.5 rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-400 text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <DollarSign className="w-3 h-3" /> Pay {centsToUSD(aff.unpaid_cents)}
                      </button>
                    )}
                    <button
                      onClick={() => handleStatus(aff.id, 'suspended')}
                      disabled={actioningId === aff.id}
                      className="px-3 py-1.5 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      Suspend
                    </button>
                  </>
                )}
                {aff.status === 'suspended' && (
                  <button
                    onClick={() => handleStatus(aff.id, 'approved')}
                    disabled={actioningId === aff.id}
                    className="px-3 py-1.5 rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-400 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    Reactivate
                  </button>
                )}
                {aff.status === 'rejected' && (
                  <button
                    onClick={() => handleStatus(aff.id, 'approved')}
                    disabled={actioningId === aff.id}
                    className="px-3 py-1.5 rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-400 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    Approve Instead
                  </button>
                )}
                {/* Copy link */}
                {aff.status === 'approved' && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://aligncosmic.com/ref/${aff.affiliate_code}`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted text-xs font-medium transition-colors ml-auto"
                  >
                    <Copy className="w-3 h-3 inline mr-1" /> Copy Link
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View-as-affiliate Modal — shows exactly what the affiliate sees */}
      {viewAff && (
        <div className="fixed inset-0 z-50 bg-black/70 overflow-y-auto p-4 sm:p-8" onClick={() => setViewAff(null)}>
          <div
            className="bg-bg-primary border border-border-primary rounded-2xl max-w-6xl w-full mx-auto my-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-6 py-4 border-b border-border-primary bg-bg-primary/95 backdrop-blur rounded-t-2xl">
              <div className="flex items-center gap-3 min-w-0">
                <Eye className="w-5 h-5 text-accent-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {viewAff.name} <span className="text-text-muted font-normal">· affiliate view</span>
                  </p>
                  <p className="text-xs text-text-muted truncate">{viewAff.email}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 ${statusColor(viewAff.status)}`}>
                  {viewAff.status}
                </span>
              </div>
              <button
                onClick={() => setViewAff(null)}
                className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors flex-shrink-0"
                aria-label="Close"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-6">
              {viewLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
                </div>
              ) : viewError ? (
                <div className="text-center py-20">
                  <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                  <p className="text-sm text-red-400">{viewError}</p>
                </div>
              ) : viewData ? (
                <AffiliateDashboardView
                  affiliate={viewData.affiliate}
                  conversions={viewData.conversions}
                  clicks={viewData.clicks}
                  payouts={viewData.payouts}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {payoutAff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPayoutAff(null)}>
          <div className="bg-bg-card border border-border-primary rounded-2xl max-w-md w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" /> Record Payout
            </h2>
            <p className="text-sm text-text-secondary">
              {payoutAff.name} — Unpaid balance: <strong className="text-accent-primary">{centsToUSD(payoutAff.unpaid_cents)}</strong>
            </p>

            {payoutError && (
              <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{payoutError}</p>
            )}

            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wider mb-1">Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors"
                value={payoutAmount}
                onChange={e => setPayoutAmount(e.target.value)}
                placeholder="50.00"
              />
            </div>

            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wider mb-1">Method</label>
              <div className="flex flex-wrap gap-2">
                {['paypal', 'bank_transfer', 'crypto', 'manual'].map(m => (
                  <button
                    key={m}
                    onClick={() => setPayoutMethod(m)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      payoutMethod === m
                        ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                        : 'border-border-primary text-text-secondary hover:bg-bg-tertiary'
                    }`}
                  >
                    {m === 'bank_transfer' ? 'Bank Transfer' : m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wider mb-1">PayPal / Email</label>
              <input
                className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors"
                value={payoutEmail}
                onChange={e => setPayoutEmail(e.target.value)}
                placeholder="affiliate@email.com"
              />
            </div>

            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wider mb-1">Transaction Reference *</label>
              <input
                className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors"
                value={payoutRef}
                onChange={e => setPayoutRef(e.target.value)}
                placeholder="PayPal batch ID / wire ref / tx hash"
              />
            </div>

            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wider mb-1">Notes (optional)</label>
              <input
                className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors"
                value={payoutNotes}
                onChange={e => setPayoutNotes(e.target.value)}
                placeholder="Monthly payout for May 2026"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setPayoutAff(null)}
                className="px-4 py-2 rounded-lg text-sm text-text-muted hover:bg-bg-tertiary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePayout}
                disabled={payoutSubmitting || !payoutRef.trim() || !payoutAmount}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-500 transition-colors disabled:opacity-50"
              >
                {payoutSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Confirm Payout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
