'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, EyeOff, Search, Download, BarChart3, Lock } from 'lucide-react';

type ProfileVisibility = 'public' | 'friends_only' | 'private';
type TrustLevel = 0 | 1 | 3 | 5;

function ToggleRow({ label, description, enabled, onToggle }: {
  label: string; description: string; enabled: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 px-1">
      <div className="flex-1 mr-4">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-muted mt-0.5">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`w-11 h-6 rounded-full transition-colors relative ${
          enabled ? 'bg-accent-primary' : 'bg-bg-tertiary'
        }`}
      >
        <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${
          enabled ? 'left-[22px]' : 'left-0.5'
        }`} />
      </button>
    </div>
  );
}

export default function PrivacySettingsPage() {
  // Profile Visibility
  const [profileVisibility, setProfileVisibility] = useState<ProfileVisibility>('public');
  const [hideAge, setHideAge] = useState(false);
  const [hideExactLocation, setHideExactLocation] = useState(false);
  const [hideLastActive, setHideLastActive] = useState(false);

  // Chart Privacy
  const [hideFullBirthChart, setHideFullBirthChart] = useState(false);

  // Discovery & Contact
  const [incognitoMode, setIncognitoMode] = useState(false);
  const [blockUnverified, setBlockUnverified] = useState(false);
  const [minimumTrustLevel, setMinimumTrustLevel] = useState<TrustLevel>(0);

  // Analytics
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  // Export toast
  const [exportToast, setExportToast] = useState(false);

  function handleExportData() {
    setExportToast(true);
    setTimeout(() => setExportToast(false), 4000);
  }

  const trustLevelOptions: { label: string; value: TrustLevel }[] = [
    { label: 'Any', value: 0 },
    { label: 'Low', value: 1 },
    { label: 'Med', value: 3 },
    { label: 'High', value: 5 },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/settings" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Settings
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
        <Shield className="w-7 h-7 text-accent-primary" />
        Privacy &amp; Data
      </h1>

      <div className="space-y-4">
        {/* ── Section 1: Profile Visibility ── */}
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-4 h-4 text-accent-primary" />
            <h3 className="text-sm font-semibold text-text-primary">Profile Visibility</h3>
          </div>
          <p className="text-xs text-text-muted mb-4">Control who can see your profile and personal details</p>

          {/* Who Can See Your Profile */}
          <label className="text-xs text-text-secondary block mb-1.5">Who Can See Your Profile</label>
          <select
            value={profileVisibility}
            onChange={(e) => setProfileVisibility(e.target.value as ProfileVisibility)}
            className="input mb-4"
          >
            <option value="public">Public — Anyone can view</option>
            <option value="friends_only">Friends Only — Only friends can see</option>
            <option value="private">Private — Only you</option>
          </select>

          <div className="divide-y divide-border-primary">
            <ToggleRow
              label="Hide Age"
              description="Show zodiac sign instead of age"
              enabled={hideAge}
              onToggle={() => setHideAge(!hideAge)}
            />
            <ToggleRow
              label="Hide Exact Location"
              description="Show approximate area instead"
              enabled={hideExactLocation}
              onToggle={() => setHideExactLocation(!hideExactLocation)}
            />
            <ToggleRow
              label="Hide Last Active"
              description="Don't show when you were last online"
              enabled={hideLastActive}
              onToggle={() => setHideLastActive(!hideLastActive)}
            />
          </div>
        </div>

        {/* ── Section 2: Chart Privacy ── */}
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-accent-primary" />
            <h3 className="text-sm font-semibold text-text-primary">Chart Privacy</h3>
          </div>
          <p className="text-xs text-text-muted mb-2">Control how much of your birth chart others can see</p>
          <div className="divide-y divide-border-primary">
            <ToggleRow
              label="Hide Full Birth Chart"
              description="Only show Sun, Moon & Rising to others"
              enabled={hideFullBirthChart}
              onToggle={() => setHideFullBirthChart(!hideFullBirthChart)}
            />
          </div>
        </div>

        {/* ── Section 3: Discovery & Contact ── */}
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-4 h-4 text-accent-primary" />
            <h3 className="text-sm font-semibold text-text-primary">Discovery &amp; Contact</h3>
          </div>
          <p className="text-xs text-text-muted mb-2">Manage how others find and contact you</p>
          <div className="divide-y divide-border-primary">
            <ToggleRow
              label="Incognito Mode"
              description="Don't appear in search or suggestions"
              enabled={incognitoMode}
              onToggle={() => setIncognitoMode(!incognitoMode)}
            />
            <ToggleRow
              label="Block Unverified Users"
              description="Only verified users can contact you"
              enabled={blockUnverified}
              onToggle={() => setBlockUnverified(!blockUnverified)}
            />
            {/* Minimum Trust Level — Segmented Control */}
            <div className="py-4 px-1">
              <p className="text-sm font-medium text-text-primary">Minimum Trust Level to Message</p>
              <p className="text-xs text-text-muted mt-0.5 mb-3">Set the minimum trust level required for others to message you</p>
              <div className="flex bg-bg-tertiary rounded-lg p-1 gap-1">
                {trustLevelOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setMinimumTrustLevel(opt.value)}
                    className={`flex-1 text-center py-1.5 rounded-md text-xs font-medium transition-colors ${
                      minimumTrustLevel === opt.value
                        ? 'bg-accent-primary text-white'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 4: Your Data ── */}
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <Download className="w-4 h-4 text-accent-primary" />
            <h3 className="text-sm font-semibold text-text-primary">Your Data</h3>
          </div>
          <p className="text-xs text-text-muted mb-4">Download or manage your personal data</p>
          <button
            onClick={handleExportData}
            className="w-full flex items-center justify-between py-3 px-4 rounded-lg border border-border-primary hover:bg-bg-tertiary transition-colors"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-text-primary">Export My Data</p>
              <p className="text-xs text-text-muted mt-0.5">Download all your data as a JSON file</p>
            </div>
            <Download className="w-5 h-5 text-accent-primary" />
          </button>
        </div>

        {/* ── Section 5: Analytics ── */}
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-accent-primary" />
            <h3 className="text-sm font-semibold text-text-primary">Analytics</h3>
          </div>
          <p className="text-xs text-text-muted mb-2">Manage usage data collection preferences</p>
          <div className="divide-y divide-border-primary">
            <ToggleRow
              label="Analytics Enabled"
              description="Help improve Align with anonymous usage data"
              enabled={analyticsEnabled}
              onToggle={() => setAnalyticsEnabled(!analyticsEnabled)}
            />
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {exportToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-accent-primary text-white text-sm px-5 py-3 rounded-xl shadow-lg z-50 animate-fadeIn">
          Export requested — you&apos;ll receive an email shortly
        </div>
      )}
    </div>
  );
}
