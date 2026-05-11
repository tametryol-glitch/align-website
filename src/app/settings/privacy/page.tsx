'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacySettingsPage() {
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showBirthData, setShowBirthData] = useState(true);
  const [allowMessages, setAllowMessages] = useState('friends');
  const [showInDiscover, setShowInDiscover] = useState(true);

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/settings" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Settings
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
        <Shield className="w-7 h-7 text-accent-primary" />
        Privacy
      </h1>

      <div className="space-y-4">
        {/* Profile Visibility */}
        <div className="card">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Profile Visibility</h3>
          <select
            value={profileVisibility}
            onChange={(e) => setProfileVisibility(e.target.value)}
            className="input"
          >
            <option value="public">Public — Anyone can see your profile</option>
            <option value="friends">Friends Only — Only friends can see</option>
            <option value="private">Private — Hidden from everyone</option>
          </select>
        </div>

        {/* Message Permissions */}
        <div className="card">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Who can message you?</h3>
          <select
            value={allowMessages}
            onChange={(e) => setAllowMessages(e.target.value)}
            className="input"
          >
            <option value="everyone">Everyone</option>
            <option value="friends">Friends only</option>
            <option value="nobody">Nobody</option>
          </select>
        </div>

        {/* Toggles */}
        <div className="card divide-y divide-border-primary">
          <ToggleRow
            label="Show online status"
            description="Let others see when you're active"
            enabled={showOnlineStatus}
            onToggle={() => setShowOnlineStatus(!showOnlineStatus)}
          />
          <ToggleRow
            label="Show birth data on profile"
            description="Display your signs publicly"
            enabled={showBirthData}
            onToggle={() => setShowBirthData(!showBirthData)}
          />
          <ToggleRow
            label="Appear in Discover"
            description="Show up in community member lists"
            enabled={showInDiscover}
            onToggle={() => setShowInDiscover(!showInDiscover)}
          />
        </div>
      </div>
    </div>
  );
}

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
