'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Bell, BellOff, Clock, Moon, Star, Heart,
  DollarSign, Briefcase, Sparkles, Globe, Volume2,
  MessageCircle, Users, Megaphone, CalendarDays,
  ClipboardList, Shield, Zap, Sun, BadgeCheck,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────
type Frequency = 'essential' | 'important' | 'all';
type Tone = 'gentle' | 'direct' | 'intense';

// ─── Reusable Components ─────────────────────────────────────────

function Toggle({ enabled, onToggle, disabled }: {
  enabled: boolean; onToggle: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } ${enabled ? 'bg-accent-primary' : 'bg-bg-tertiary'}`}
    >
      <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all ${
        enabled ? 'left-[22px]' : 'left-0.5'
      }`} />
    </button>
  );
}

function ToggleRow({ icon: Icon, label, description, enabled, onToggle, disabled }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-3.5 px-1 gap-3 ${disabled ? 'opacity-40' : ''}`}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Icon className="w-5 h-5 text-accent-primary mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary">{label}</p>
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        </div>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} disabled={disabled} />
    </div>
  );
}

function SegmentedControl<T extends string>({ options, selected, onChange, disabled }: {
  options: { value: T; label: string }[];
  selected: T;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex gap-2 mt-2 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all border ${
            selected === o.value
              ? 'bg-accent-primary/15 border-accent-primary text-accent-primary'
              : 'bg-bg-tertiary border-border-primary text-text-muted hover:border-text-muted'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`card ${className || ''}`}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-3">
      <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
        <Icon className="w-4.5 h-4.5 text-accent-primary" />
        {title}
      </h2>
      {subtitle && <p className="text-xs text-text-muted mt-1 ml-[26px]">{subtitle}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────

export default function NotificationSettingsPage() {
  // ── Pause All ──
  const [pauseAll, setPauseAll] = useState(false);

  // ── Frequency & Tone ──
  const [frequency, setFrequency] = useState<Frequency>('important');
  const [tone, setTone] = useState<Tone>('gentle');

  // ── Social Notifications ──
  const [friendRequests, setFriendRequests] = useState(true);
  const [messages, setMessages] = useState(true);
  const [reactions, setReactions] = useState(true);
  const [comments, setComments] = useState(true);

  // ── Alert Categories ──
  const [majorTransits, setMajorTransits] = useState(true);
  const [moonPhases, setMoonPhases] = useState(true);
  const [mercuryRetrograde, setMercuryRetrograde] = useState(true);
  const [loveRelationships, setLoveRelationships] = useState(true);
  const [moneyValues, setMoneyValues] = useState(true);
  const [careerAmbition, setCareerAmbition] = useState(true);
  const [healingGrowth, setHealingGrowth] = useState(true);

  // ── Summaries ──
  const [dailySummary, setDailySummary] = useState(true);
  const [weeklyForecast, setWeeklyForecast] = useState(true);

  // ── Quiet Hours ──
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('08:00');
  const [urgentOverride, setUrgentOverride] = useState(true);

  // ── Delivery Options ──
  const [sound, setSound] = useState(true);
  const [badge, setBadge] = useState(true);

  // ── Galactic Alerts ──
  const [galacticEnabled, setGalacticEnabled] = useState(false);
  const [galGeneral, setGalGeneral] = useState(true);
  const [galMoney, setGalMoney] = useState(true);
  const [galLove, setGalLove] = useState(true);
  const [galCareer, setGalCareer] = useState(true);
  const [galSpiritual, setGalSpiritual] = useState(true);
  const [galChildren, setGalChildren] = useState(false);
  const [galHealing, setGalHealing] = useState(true);
  const [minWindowStrength, setMinWindowStrength] = useState(5);

  // ── Announcements ──
  const [announcements, setAnnouncements] = useState(true);

  const cosmicDisabled = pauseAll;

  return (
    <div className="max-w-2xl mx-auto pb-16">
      {/* Back Link */}
      <Link href="/settings" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Settings
      </Link>

      {/* Page Title */}
      <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
        <Bell className="w-7 h-7 text-accent-primary" />
        Notifications
      </h1>

      <div className="space-y-6">

        {/* ════════════════════════════════════════════════════════════
            Pause All Cosmic Alerts
           ════════════════════════════════════════════════════════════ */}
        <SectionCard className="border-2 border-accent-primary/30">
          <ToggleRow
            icon={BellOff}
            label="Pause All Cosmic Alerts"
            description="One switch to silence every astrology notification"
            enabled={pauseAll}
            onToggle={() => setPauseAll(!pauseAll)}
          />
        </SectionCard>

        {/* ════════════════════════════════════════════════════════════
            Social Notifications
           ════════════════════════════════════════════════════════════ */}
        <SectionCard>
          <SectionHeader icon={Users} title="Social" subtitle="People interactions and messages" />
          <div className="divide-y divide-border-primary">
            <ToggleRow icon={Users} label="Friend Requests" description="When someone sends you a friend request" enabled={friendRequests} onToggle={() => setFriendRequests(!friendRequests)} />
            <ToggleRow icon={MessageCircle} label="Messages" description="New direct messages from friends" enabled={messages} onToggle={() => setMessages(!messages)} />
            <ToggleRow icon={Heart} label="Reactions" description="When someone reacts to your posts" enabled={reactions} onToggle={() => setReactions(!reactions)} />
            <ToggleRow icon={MessageCircle} label="Comments" description="When someone comments on your posts" enabled={comments} onToggle={() => setComments(!comments)} />
          </div>
        </SectionCard>

        {/* ════════════════════════════════════════════════════════════
            Cosmic Alerts — Frequency & Tone
           ════════════════════════════════════════════════════════════ */}
        <SectionCard>
          <SectionHeader icon={Zap} title="Cosmic Alerts" subtitle="Personalized astrology notifications based on your chart" />

          {/* Frequency */}
          <div className={`mb-5 ${cosmicDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
            <h3 className="text-sm font-semibold text-text-primary">Frequency</h3>
            <p className="text-xs text-text-muted mt-0.5">How many alerts you want to receive</p>
            <SegmentedControl<Frequency>
              options={[
                { value: 'essential', label: 'Essential' },
                { value: 'important', label: 'Important' },
                { value: 'all', label: 'All Events' },
              ]}
              selected={frequency}
              onChange={setFrequency}
              disabled={cosmicDisabled}
            />
          </div>

          {/* Tone */}
          <div className={cosmicDisabled ? 'opacity-40 pointer-events-none' : ''}>
            <h3 className="text-sm font-semibold text-text-primary">Tone</h3>
            <p className="text-xs text-text-muted mt-0.5">How your notifications feel</p>
            <SegmentedControl<Tone>
              options={[
                { value: 'gentle', label: 'Gentle' },
                { value: 'direct', label: 'Direct' },
                { value: 'intense', label: 'Intense' },
              ]}
              selected={tone}
              onChange={setTone}
              disabled={cosmicDisabled}
            />
          </div>
        </SectionCard>

        {/* ════════════════════════════════════════════════════════════
            Alert Categories
           ════════════════════════════════════════════════════════════ */}
        <SectionCard>
          <SectionHeader icon={Star} title="Alert Categories" subtitle="Choose which cosmic events trigger notifications" />
          <div className="divide-y divide-border-primary">
            <ToggleRow icon={Globe} label="Major Transits" description="Outer planet aspects to your natal chart" enabled={majorTransits} onToggle={() => setMajorTransits(!majorTransits)} disabled={cosmicDisabled} />
            <ToggleRow icon={Moon} label="Moon Phases" description="Full and new moons in your houses" enabled={moonPhases} onToggle={() => setMoonPhases(!moonPhases)} disabled={cosmicDisabled} />
            <ToggleRow icon={MessageCircle} label="Mercury Retrograde" description="Retrograde periods hitting your chart" enabled={mercuryRetrograde} onToggle={() => setMercuryRetrograde(!mercuryRetrograde)} disabled={cosmicDisabled} />
            <ToggleRow icon={Heart} label="Love & Relationships" description="Venus transits and 7th house activations" enabled={loveRelationships} onToggle={() => setLoveRelationships(!loveRelationships)} disabled={cosmicDisabled} />
            <ToggleRow icon={DollarSign} label="Money & Values" description="2nd and 8th house activations" enabled={moneyValues} onToggle={() => setMoneyValues(!moneyValues)} disabled={cosmicDisabled} />
            <ToggleRow icon={Briefcase} label="Career & Ambition" description="10th house and Saturn transits" enabled={careerAmbition} onToggle={() => setCareerAmbition(!careerAmbition)} disabled={cosmicDisabled} />
            <ToggleRow icon={Sparkles} label="Healing & Growth" description="Chiron, 12th house, and transformative transits" enabled={healingGrowth} onToggle={() => setHealingGrowth(!healingGrowth)} disabled={cosmicDisabled} />
          </div>
        </SectionCard>

        {/* ════════════════════════════════════════════════════════════
            Summaries
           ════════════════════════════════════════════════════════════ */}
        <SectionCard>
          <SectionHeader icon={ClipboardList} title="Summaries" />
          <div className="divide-y divide-border-primary">
            <ToggleRow icon={Sun} label="Daily Cosmic Summary" description="Morning overview of today's energy" enabled={dailySummary} onToggle={() => setDailySummary(!dailySummary)} disabled={cosmicDisabled} />
            <ToggleRow icon={CalendarDays} label="Weekly Cosmic Forecast" description="Sunday preview of the week ahead" enabled={weeklyForecast} onToggle={() => setWeeklyForecast(!weeklyForecast)} disabled={cosmicDisabled} />
          </div>
        </SectionCard>

        {/* ════════════════════════════════════════════════════════════
            Quiet Hours
           ════════════════════════════════════════════════════════════ */}
        <SectionCard>
          <SectionHeader icon={Clock} title="Quiet Hours" subtitle="Pause all notifications during these hours" />

          <div className="divide-y divide-border-primary">
            <div className="flex items-center justify-between py-3.5 px-1">
              <div className="flex items-start gap-3 flex-1">
                <Clock className="w-5 h-5 text-accent-primary mt-0.5" />
                <span className="text-sm font-medium text-text-primary">Enable Quiet Hours</span>
              </div>
              <Toggle enabled={quietHoursEnabled} onToggle={() => setQuietHoursEnabled(!quietHoursEnabled)} />
            </div>

            {quietHoursEnabled && (
              <>
                <div className="py-4 px-1">
                  <div className="grid grid-cols-2 gap-4 ml-8">
                    <div>
                      <label className="text-xs text-text-muted block mb-1">Start</label>
                      <select
                        value={quietStart}
                        onChange={e => setQuietStart(e.target.value)}
                        className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary"
                      >
                        {Array.from({ length: 24 }, (_, i) => {
                          const h = i.toString().padStart(2, '0');
                          return (
                            <option key={h} value={`${h}:00`}>
                              {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-text-muted block mb-1">End</label>
                      <select
                        value={quietEnd}
                        onChange={e => setQuietEnd(e.target.value)}
                        className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary"
                      >
                        {Array.from({ length: 24 }, (_, i) => {
                          const h = i.toString().padStart(2, '0');
                          return (
                            <option key={h} value={`${h}:00`}>
                              {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>

                <ToggleRow
                  icon={Shield}
                  label="Allow Urgent Override"
                  description="Critical alerts (score 9+) bypass quiet hours"
                  enabled={urgentOverride}
                  onToggle={() => setUrgentOverride(!urgentOverride)}
                />
              </>
            )}
          </div>
        </SectionCard>

        {/* ════════════════════════════════════════════════════════════
            Delivery Options
           ════════════════════════════════════════════════════════════ */}
        <SectionCard>
          <SectionHeader icon={Volume2} title="Delivery Options" />
          <div className="divide-y divide-border-primary">
            <ToggleRow icon={Volume2} label="Sound" description="Play a sound when notifications arrive" enabled={sound} onToggle={() => setSound(!sound)} />
            <ToggleRow icon={BadgeCheck} label="Badge" description="Show badge count on app icon" enabled={badge} onToggle={() => setBadge(!badge)} />
          </div>
        </SectionCard>

        {/* ════════════════════════════════════════════════════════════
            Galactic Alerts
           ════════════════════════════════════════════════════════════ */}
        <SectionCard>
          <SectionHeader icon={Globe} title="Galactic Alerts" subtitle="Receive notifications before strong timing windows" />

          <div className="divide-y divide-border-primary">
            {/* Master toggle */}
            <ToggleRow
              icon={Globe}
              label="Enable Galactic Alerts"
              description="Receive notifications before strong timing windows"
              enabled={galacticEnabled}
              onToggle={() => setGalacticEnabled(!galacticEnabled)}
              disabled={cosmicDisabled}
            />

            {galacticEnabled && !cosmicDisabled && (
              <>
                {/* Category toggles */}
                <ToggleRow icon={Star} label="General" description="General galactic timing windows" enabled={galGeneral} onToggle={() => setGalGeneral(!galGeneral)} />
                <ToggleRow icon={DollarSign} label="Money" description="Financial timing windows" enabled={galMoney} onToggle={() => setGalMoney(!galMoney)} />
                <ToggleRow icon={Heart} label="Love" description="Relationship timing windows" enabled={galLove} onToggle={() => setGalLove(!galLove)} />
                <ToggleRow icon={Briefcase} label="Career" description="Professional timing windows" enabled={galCareer} onToggle={() => setGalCareer(!galCareer)} />
                <ToggleRow icon={Sparkles} label="Spiritual Work" description="Spiritual practice timing windows" enabled={galSpiritual} onToggle={() => setGalSpiritual(!galSpiritual)} />
                <ToggleRow icon={Sun} label="Children" description="Timing windows related to children" enabled={galChildren} onToggle={() => setGalChildren(!galChildren)} />
                <ToggleRow icon={Sparkles} label="Healing" description="Healing and recovery timing windows" enabled={galHealing} onToggle={() => setGalHealing(!galHealing)} />

                {/* Minimum Window Strength slider */}
                <div className="py-4 px-1">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-accent-primary mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">Minimum Window Strength</p>
                      <p className="text-xs text-text-muted mt-0.5 mb-3">Filter alerts by how strong the timing window is</p>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={minWindowStrength}
                        onChange={e => setMinWindowStrength(parseInt(e.target.value))}
                        className="w-full accent-accent-primary"
                      />
                      <div className="flex justify-between text-[10px] text-text-muted mt-1.5">
                        <span>Very Sensitive (many alerts)</span>
                        <span className="text-accent-primary font-semibold">{minWindowStrength}/10</span>
                        <span>Precise (only strongest)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </SectionCard>

        {/* ════════════════════════════════════════════════════════════
            Announcements
           ════════════════════════════════════════════════════════════ */}
        <SectionCard>
          <SectionHeader icon={Megaphone} title="Announcements" />
          <ToggleRow icon={Megaphone} label="Announcements" description="App updates and important system notifications" enabled={announcements} onToggle={() => setAnnouncements(!announcements)} />
        </SectionCard>

      </div>
    </div>
  );
}
