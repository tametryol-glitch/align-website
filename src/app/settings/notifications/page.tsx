'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Clock } from 'lucide-react';

interface NotificationSetting {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export default function NotificationSettingsPage() {
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('08:00');

  const [settings, setSettings] = useState<NotificationSetting[]>([
    { key: 'friend_requests', label: 'Friend Requests', description: 'When someone sends you a friend request', enabled: true },
    { key: 'messages', label: 'Messages', description: 'New direct messages from friends', enabled: true },
    { key: 'reactions', label: 'Reactions', description: 'When someone reacts to your posts', enabled: true },
    { key: 'comments', label: 'Comments', description: 'When someone comments on your posts', enabled: true },
    { key: 'cosmic_alerts', label: 'Cosmic Alerts', description: 'Transit alerts and astrological events', enabled: true },
    { key: 'daily_horoscope', label: 'Daily Horoscope', description: 'Your daily cosmic guidance', enabled: false },
    { key: 'moon_phases', label: 'Moon Phases', description: 'New Moon and Full Moon notifications', enabled: true },
    { key: 'community', label: 'Community Updates', description: 'New posts in your communities', enabled: false },
  ]);

  function toggle(key: string) {
    setSettings(prev => prev.map(s =>
      s.key === key ? { ...s, enabled: !s.enabled } : s
    ));
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/settings" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Settings
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
        <Bell className="w-7 h-7 text-accent-primary" />
        Notifications
      </h1>

      <div className="card divide-y divide-border-primary">
        {settings.map(setting => (
          <div key={setting.key} className="flex items-center justify-between py-4 px-1">
            <div className="flex-1 mr-4">
              <p className="text-sm font-medium text-text-primary">{setting.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{setting.description}</p>
            </div>
            <button
              onClick={() => toggle(setting.key)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                setting.enabled ? 'bg-accent-primary' : 'bg-bg-tertiary'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${
                setting.enabled ? 'translate-x-5.5 left-[22px]' : 'left-0.5'
              }`} />
            </button>
          </div>
        ))}
      </div>

      {/* Quiet Hours */}
      <div className="card mt-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Quiet Hours
        </h2>
        <p className="text-xs text-text-muted mb-4">Pause all notifications during these hours</p>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-text-secondary">Enable Quiet Hours</span>
          <button
            onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative ${quietHoursEnabled ? 'bg-accent-primary' : 'bg-bg-tertiary'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${quietHoursEnabled ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>

        {quietHoursEnabled && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-muted block mb-1">Start</label>
              <select value={quietStart} onChange={e => setQuietStart(e.target.value)} className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary">
                {Array.from({length: 24}, (_, i) => {
                  const h = i.toString().padStart(2, '0');
                  return <option key={h} value={`${h}:00`}>{i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i-12}:00 PM`}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">End</label>
              <select value={quietEnd} onChange={e => setQuietEnd(e.target.value)} className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary">
                {Array.from({length: 24}, (_, i) => {
                  const h = i.toString().padStart(2, '0');
                  return <option key={h} value={`${h}:00`}>{i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i-12}:00 PM`}</option>;
                })}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
