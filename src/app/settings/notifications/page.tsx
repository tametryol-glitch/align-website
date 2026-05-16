'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Bell, BellOff, Clock, Moon, Star, Heart,
  DollarSign, Briefcase, Sparkles, Globe, Volume2,
  MessageCircle, Users, Megaphone, CalendarDays,
  ClipboardList, Shield, Zap, Sun, BadgeCheck,
  ChevronDown, Eclipse, RotateCcw, ArrowRightLeft,
  Timer, Triangle, Circle, Hexagon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

interface NotificationPreferences {
  pauseAll: boolean;
  social: {
    friendRequests: boolean;
    messages: boolean;
    reactions: boolean;
    comments: boolean;
  };
  cosmic: {
    frequency: 'essential' | 'important' | 'all';
    tone: 'gentle' | 'direct' | 'intense';
    categories: {
      majorTransits: boolean;
      moonPhases: boolean;
      mercuryRetrograde: boolean;
      loveRelationships: boolean;
      moneyValues: boolean;
      careerAmbition: boolean;
      healingGrowth: boolean;
    };
    aspects: {
      conjunctions: boolean;
      oppositions: boolean;
      squares: boolean;
      trines: boolean;
      sextiles: boolean;
    };
    events: {
      moonPhases: boolean;
      eclipses: boolean;
      retrogrades: boolean;
      ingresses: boolean;
    };
    minIntensity: number;
    advanceNoticeDays: number;
  };
  galactic: {
    planetaryHours: boolean;
    dayRuler: boolean;
    goldenHour: boolean;
    eclipseWatch: boolean;
    retrogradeAlerts: boolean;
    minutesBefore: number;
  };
  summaries: {
    daily: boolean;
    weekly: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    urgentOverride: boolean;
  };
  delivery: {
    sound: boolean;
    badge: boolean;
  };
  announcements: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  pauseAll: false,
  social: {
    friendRequests: true,
    messages: true,
    reactions: true,
    comments: true,
  },
  cosmic: {
    frequency: 'important',
    tone: 'gentle',
    categories: {
      majorTransits: true,
      moonPhases: true,
      mercuryRetrograde: true,
      loveRelationships: true,
      moneyValues: true,
      careerAmbition: true,
      healingGrowth: true,
    },
    aspects: {
      conjunctions: true,
      oppositions: true,
      squares: true,
      trines: true,
      sextiles: true,
    },
    events: {
      moonPhases: true,
      eclipses: true,
      retrogrades: true,
      ingresses: true,
    },
    minIntensity: 5,
    advanceNoticeDays: 3,
  },
  galactic: {
    planetaryHours: true,
    dayRuler: true,
    goldenHour: true,
    eclipseWatch: true,
    retrogradeAlerts: true,
    minutesBefore: 15,
  },
  summaries: {
    daily: true,
    weekly: true,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
    urgentOverride: true,
  },
  delivery: {
    sound: true,
    badge: true,
  },
  announcements: true,
};

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
    <div className={`flex items-center justify-between py-3.5 px-1 gap-3 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
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

function SectionHeader({ icon: Icon, title, subtitle, collapsible, collapsed, onToggle }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div
      className={`mb-3 ${collapsible ? 'cursor-pointer select-none' : ''}`}
      onClick={collapsible ? onToggle : undefined}
    >
      <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
        <Icon className="w-4.5 h-4.5 text-accent-primary" />
        {title}
        {collapsible && (
          <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ml-auto ${collapsed ? '-rotate-90' : ''}`} />
        )}
      </h2>
      {subtitle && !collapsed && <p className="text-xs text-text-muted mt-1 ml-[26px]">{subtitle}</p>}
    </div>
  );
}

export default function NotificationSettingsPage() {
  const { user } = useAuthStore();
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveToSupabase = useCallback(async (newPrefs: NotificationPreferences) => {
    if (!user) {
      localStorage.setItem('notification_preferences', JSON.stringify(newPrefs));
      return;
    }
    const supabase = createClient();
    await supabase
      .from('profiles')
      .update({ notification_preferences: newPrefs })
      .eq('id', user.id);
  }, [user]);

  const updatePrefs = useCallback((updater: (prev: NotificationPreferences) => NotificationPreferences) => {
    setPrefs(prev => {
      const next = updater(prev);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => saveToSupabase(next), 500);
      return next;
    });
  }, [saveToSupabase]);

  useEffect(() => {
    async function load() {
      if (!user) {
        const stored = localStorage.getItem('notification_preferences');
        if (stored) {
          try {
            setPrefs({ ...DEFAULT_PREFERENCES, ...JSON.parse(stored) });
          } catch {
            setPrefs(DEFAULT_PREFERENCES);
          }
        }
        setLoaded(true);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();
      if (data?.notification_preferences) {
        setPrefs({ ...DEFAULT_PREFERENCES, ...data.notification_preferences });
      }
      setLoaded(true);
    }
    load();
  }, [user]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (!loaded) {
    return (
      <div className="max-w-2xl mx-auto py-20 flex justify-center">
        <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cosmicDisabled = prefs.pauseAll;

  return (
    <div className="max-w-2xl mx-auto pb-16">
      <Link href="/settings" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Settings
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
        <Bell className="w-7 h-7 text-accent-primary" />
        Notifications
      </h1>

      <div className="space-y-6">

        <SectionCard className="border-2 border-accent-primary/30">
          <ToggleRow
            icon={BellOff}
            label="Pause All Cosmic Alerts"
            description="One switch to silence every astrology notification"
            enabled={prefs.pauseAll}
            onToggle={() => updatePrefs(p => ({ ...p, pauseAll: !p.pauseAll }))}
          />
        </SectionCard>

        <SectionCard>
          <SectionHeader
            icon={Users}
            title="Social"
            subtitle="People interactions and messages"
            collapsible
            collapsed={collapsedSections.social}
            onToggle={() => toggleSection('social')}
          />
          {!collapsedSections.social && (
            <div className="divide-y divide-border-primary">
              <ToggleRow icon={Users} label="Friend Requests" description="When someone sends you a friend request" enabled={prefs.social.friendRequests} onToggle={() => updatePrefs(p => ({ ...p, social: { ...p.social, friendRequests: !p.social.friendRequests } }))} />
              <ToggleRow icon={MessageCircle} label="Messages" description="New direct messages from friends" enabled={prefs.social.messages} onToggle={() => updatePrefs(p => ({ ...p, social: { ...p.social, messages: !p.social.messages } }))} />
              <ToggleRow icon={Heart} label="Reactions" description="When someone reacts to your posts" enabled={prefs.social.reactions} onToggle={() => updatePrefs(p => ({ ...p, social: { ...p.social, reactions: !p.social.reactions } }))} />
              <ToggleRow icon={MessageCircle} label="Comments" description="When someone comments on your posts" enabled={prefs.social.comments} onToggle={() => updatePrefs(p => ({ ...p, social: { ...p.social, comments: !p.social.comments } }))} />
            </div>
          )}
        </SectionCard>

        <SectionCard>
          <SectionHeader
            icon={Zap}
            title="Cosmic Alerts"
            subtitle="Personalized astrology notifications based on your chart"
            collapsible
            collapsed={collapsedSections.cosmic}
            onToggle={() => toggleSection('cosmic')}
          />
          {!collapsedSections.cosmic && (
            <div className={cosmicDisabled ? 'opacity-40 pointer-events-none' : ''}>
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-text-primary">Frequency</h3>
                <p className="text-xs text-text-muted mt-0.5">How many alerts you want to receive</p>
                <SegmentedControl
                  options={[
                    { value: 'essential', label: 'Essential' },
                    { value: 'important', label: 'Important' },
                    { value: 'all', label: 'All Events' },
                  ]}
                  selected={prefs.cosmic.frequency}
                  onChange={(v) => updatePrefs(p => ({ ...p, cosmic: { ...p.cosmic, frequency: v } }))}
                />
              </div>

              <div className="mb-5">
                <h3 className="text-sm font-semibold text-text-primary">Tone</h3>
                <p className="text-xs text-text-muted mt-0.5">How your notifications feel</p>
                <SegmentedControl
                  options={[
                    { value: 'gentle', label: 'Gentle' },
                    { value: 'direct', label: 'Direct' },
                    { value: 'intense', label: 'Intense' },
                  ]}
                  selected={prefs.cosmic.tone}
                  onChange={(v) => updatePrefs(p => ({ ...p, cosmic: { ...p.cosmic, tone: v } }))}
                />
              </div>

              <div className="mb-5">
                <h3 className="text-sm font-semibold text-text-secondary mb-2">Life Areas</h3>
                <div className="divide-y divide-border-primary">
                  <ToggleRow icon={Globe} label="Major Transits" description="Outer planet aspects to your natal chart" enabled={prefs.cosmic.categories.majorTransits} onToggle={() => updatePrefs(p => ({ ...p, cosmic: { ...p.cosmic, categories: { ...p.cosmic.categories, majorTransits: !p.cosmic.categories.majorTransits } } }))} />
                  <ToggleRow icon={Moon} label="Moon Phases" description="Full and new moons in your houses" enabled={prefs.cosmic.categories.moonPhases} onToggle={() => updatePrefs(p => ({ ...p, cosmic: { ...p.cosmic, categories: { ...p.cosmic.categories, moonPhases: !p.cosmic.categories.moonPhases } } }))} />
                  <ToggleRow icon={MessageCircle} label="Mercury Retrograde" description="Retrograde periods hitting your chart" enabled={prefs.cosmic.categories.mercuryRetrograde} onToggle={() => updatePrefs(p => ({ ...p, cosmic: { ...p.cosmic, categories: { ...p.cosmic.categories, mercuryRetrograde: !p.cosmic.categories.mercuryRetrograde } } }))} />
                  <ToggleRow icon={Heart} label="Love & Relationships" description="Venus transits and 7th house activations" enabled={prefs.cosmic.categories.loveRelationships} onToggle={() => updatePrefs(p => ({ ...p, cosmic: { ...p.cosmic, categories: { ...p.cosmic.categories, loveRelationships: !p.cosmic.categories.loveRelationships } } }))} />
                  <ToggleRow icon={DollarSign} label="Money & Values" description="2nd and 8th house activations" enabled={prefs.cosmic.categories.moneyValues} onToggle={() => updatePrefs(p => ({ ...p, cosmic: { ...p.cosmic, categories: { ...p.cosmic.categories, moneyValues: !p.cosmic.categories.moneyValues } } }))} />
                  <ToggleRow icon={Briefcase} label="Career & Ambition" description="10th house and Saturn transits" enabled={prefs.cosmic.categories.careerAmbition} onToggle={() => updatePrefs(p => ({ ...p, cosmic: { ...p.cosmic, categories: { ...p.cosmic.categories, careerAmbition: !p.cosmic.categories.careerAmbition } } }))} />
                  <ToggleRow icon={Sparkles} label="Healing & Growth" description="Chiron, 12th house, and transformative transits" enabled={prefs.cosmic.categories.healingGrowth} onToggle={() => updatePrefs(p => ({ ...p, cosmic: { ...p.cosmic, categories: { ...p.cosmic.categories, healingGrowth: !p.cosmic.categories.healingGrowth } } }))} />
                </div>
              </div>

              <div className="mb-5">
                <h3 className="text-sm font-semibold text-text-secondary mb-2">Transit Aspects</h3>
                <div className="divide-y divide-border-primary">
                  <ToggleRow icon={Circle} label="Conjunctions" description="0 degree - merging energies" enabled={prefs.cosmic.aspects.conjunctions} onToggle={() => updatePrefs(p => ({ ...p, cosmic: { ...p.cosmic, aspects: { ...p.cosmic.aspects, conjunctions: !p.cosmic.aspects.conjunctions } } }))} />
                  <ToggleRow icon={ArrowRightLeft} label="Oppositions" description="180 degree - tension and awareness" enabled={prefs.cosmic.aspects.oppositions} onToggle={() => updatePrefs(p => ({ ...p, cosmic: { ...p.cosmic, aspects: { ...p.cosmic.aspects, oppositions: !p.cosmic.aspects.oppositions } } }))} />
                  <ToggleRow icon={Triangle} label="Squares" description="90 degree - challenge and growth" enabled={prefs.cosmic.aspects.squares} onToggle={() => updatePrefs(p => ({ ...p, cosmic: { ...p.cosmic, aspects: { ...p.cosmic.aspects, squares: !p.cosmic.aspects.squares } } }))} />
                  <ToggleRow icon={Triangle} label="Trines" description="120 degree - flow and ease" enabled={prefs.cosmic.aspects.trines} onToggle={() => updatePrefs(p => ({ ...p, cosmic: { ...p.cosmic, aspects: { ...p.cosmic.aspects, trines: !p.cosmic.aspects.trines } } }))} />
                  <ToggleRow icon={Hexagon} label="Sextiles" description="60 degree - opportunity" enabled={prefs.cosmic.aspects.sextiles} onToggle={() => updatePrefs(p => ({ ...p, cosmic: { ...p.cosmic, aspects: { ...p.cosmic.aspects, sextiles: !p.cosmic.aspects.sextiles } } }))} />
                </div>
              </div>

              <div className="mb-5">
                <h3 className="text-sm font-semibold text-text-secondary mb-2">Celestial Events</h3>
                <div className="divide-y divide-border-primary">
                  <ToggleRow icon={Moon} label="Moon Phases" description="New moons, full moons, quarters" enabled={prefs.cosmic.events.moonPhases} onToggle={() => updatePrefs(p => ({ ...p, cosmic: { ...p.cosmic, events: { ...p.cosmic.events, moonPhases: !p.cosmic.events.moonPhases } } }))} />
                  <ToggleRow icon={Eclipse} label="Eclipses" description="Solar and lunar eclipses" enabled={prefs.cosmic.events.eclipses} onToggle={() => updatePrefs(p => ({ ...p, cosmic: { ...p.cosmic, events: { ...p.cosmic.events, eclipses: !p.cosmic.events.eclipses } } }))} />
                  <ToggleRow icon={RotateCcw} label="Retrogrades" description="Planets appearing to move backward" enabled={prefs.cosmic.events.retrogrades} onToggle={() => updatePrefs(p => ({ ...p, cosmic: { ...p.cosmic, events: { ...p.cosmic.events, retrogrades: !p.cosmic.events.retrogrades } } }))} />
                  <ToggleRow icon={ArrowRightLeft} label="Ingresses" description="Planets entering new signs" enabled={prefs.cosmic.events.ingresses} onToggle={() => updatePrefs(p => ({ ...p, cosmic: { ...p.cosmic, events: { ...p.cosmic.events, ingresses: !p.cosmic.events.ingresses } } }))} />
                </div>
              </div>

              <div className="mb-5">
                <div className="flex items-start gap-3 px-1">
                  <Zap className="w-5 h-5 text-accent-primary mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">Minimum Intensity</p>
                    <p className="text-xs text-text-muted mt-0.5 mb-3">Only notify for transits at or above this strength</p>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={prefs.cosmic.minIntensity}
                      onChange={e => updatePrefs(p => ({ ...p, cosmic: { ...p.cosmic, minIntensity: parseInt(e.target.value) } }))}
                      className="w-full accent-accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-text-muted mt-1.5">
                      <span>Sensitive (many alerts)</span>
                      <span className="text-accent-primary font-semibold">{prefs.cosmic.minIntensity}/10</span>
                      <span>Precise (only strongest)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-1">
                <div className="flex items-start gap-3">
                  <CalendarDays className="w-5 h-5 text-accent-primary mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">Advance Notice</p>
                    <p className="text-xs text-text-muted mt-0.5 mb-2">How far ahead to notify about upcoming transits</p>
                    <select
                      value={prefs.cosmic.advanceNoticeDays}
                      onChange={e => updatePrefs(p => ({ ...p, cosmic: { ...p.cosmic, advanceNoticeDays: parseInt(e.target.value) } }))}
                      className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary"
                    >
                      <option value={1}>1 day before</option>
                      <option value={3}>3 days before</option>
                      <option value={7}>1 week before</option>
                      <option value={14}>2 weeks before</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard>
          <SectionHeader
            icon={Globe}
            title="Galactic Clock"
            subtitle="Alerts for planetary hours and timing windows"
            collapsible
            collapsed={collapsedSections.galactic}
            onToggle={() => toggleSection('galactic')}
          />
          {!collapsedSections.galactic && (
            <div className={cosmicDisabled ? 'opacity-40 pointer-events-none' : ''}>
              <div className="divide-y divide-border-primary">
                <ToggleRow icon={Timer} label="Planetary Hours" description="Notifications at planetary hour changes" enabled={prefs.galactic.planetaryHours} onToggle={() => updatePrefs(p => ({ ...p, galactic: { ...p.galactic, planetaryHours: !p.galactic.planetaryHours } }))} />
                <ToggleRow icon={Sun} label="Day Ruler" description="Morning alert for the day's ruling planet" enabled={prefs.galactic.dayRuler} onToggle={() => updatePrefs(p => ({ ...p, galactic: { ...p.galactic, dayRuler: !p.galactic.dayRuler } }))} />
                <ToggleRow icon={Star} label="Golden Hour" description="Peak astrological timing windows" enabled={prefs.galactic.goldenHour} onToggle={() => updatePrefs(p => ({ ...p, galactic: { ...p.galactic, goldenHour: !p.galactic.goldenHour } }))} />
                <ToggleRow icon={Eclipse} label="Eclipse Watch" description="Alerts before eclipse events" enabled={prefs.galactic.eclipseWatch} onToggle={() => updatePrefs(p => ({ ...p, galactic: { ...p.galactic, eclipseWatch: !p.galactic.eclipseWatch } }))} />
                <ToggleRow icon={RotateCcw} label="Retrograde Alerts" description="When planets station retrograde or direct" enabled={prefs.galactic.retrogradeAlerts} onToggle={() => updatePrefs(p => ({ ...p, galactic: { ...p.galactic, retrogradeAlerts: !p.galactic.retrogradeAlerts } }))} />
              </div>
              <div className="mt-4 px-1">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-accent-primary mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">Notify Before</p>
                    <p className="text-xs text-text-muted mt-0.5 mb-2">How far in advance to send timing alerts</p>
                    <select
                      value={prefs.galactic.minutesBefore}
                      onChange={e => updatePrefs(p => ({ ...p, galactic: { ...p.galactic, minutesBefore: parseInt(e.target.value) } }))}
                      className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary"
                    >
                      <option value={5}>5 minutes before</option>
                      <option value={10}>10 minutes before</option>
                      <option value={15}>15 minutes before</option>
                      <option value={30}>30 minutes before</option>
                      <option value={60}>1 hour before</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard>
          <SectionHeader
            icon={ClipboardList}
            title="Summaries"
            collapsible
            collapsed={collapsedSections.summaries}
            onToggle={() => toggleSection('summaries')}
          />
          {!collapsedSections.summaries && (
            <div className={`divide-y divide-border-primary ${cosmicDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
              <ToggleRow icon={Sun} label="Daily Cosmic Summary" description="Morning overview of today's energy" enabled={prefs.summaries.daily} onToggle={() => updatePrefs(p => ({ ...p, summaries: { ...p.summaries, daily: !p.summaries.daily } }))} />
              <ToggleRow icon={CalendarDays} label="Weekly Cosmic Forecast" description="Sunday preview of the week ahead" enabled={prefs.summaries.weekly} onToggle={() => updatePrefs(p => ({ ...p, summaries: { ...p.summaries, weekly: !p.summaries.weekly } }))} />
            </div>
          )}
        </SectionCard>

        <SectionCard>
          <SectionHeader
            icon={Clock}
            title="Quiet Hours"
            subtitle="Pause all notifications during these hours"
            collapsible
            collapsed={collapsedSections.quietHours}
            onToggle={() => toggleSection('quietHours')}
          />
          {!collapsedSections.quietHours && (
            <div className="divide-y divide-border-primary">
              <div className="flex items-center justify-between py-3.5 px-1">
                <div className="flex items-start gap-3 flex-1">
                  <Clock className="w-5 h-5 text-accent-primary mt-0.5" />
                  <span className="text-sm font-medium text-text-primary">Enable Quiet Hours</span>
                </div>
                <Toggle enabled={prefs.quietHours.enabled} onToggle={() => updatePrefs(p => ({ ...p, quietHours: { ...p.quietHours, enabled: !p.quietHours.enabled } }))} />
              </div>

              {prefs.quietHours.enabled && (
                <>
                  <div className="py-4 px-1">
                    <div className="grid grid-cols-2 gap-4 ml-8">
                      <div>
                        <label className="text-xs text-text-muted block mb-1">Start</label>
                        <select
                          value={prefs.quietHours.start}
                          onChange={e => updatePrefs(p => ({ ...p, quietHours: { ...p.quietHours, start: e.target.value } }))}
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
                          value={prefs.quietHours.end}
                          onChange={e => updatePrefs(p => ({ ...p, quietHours: { ...p.quietHours, end: e.target.value } }))}
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
                    enabled={prefs.quietHours.urgentOverride}
                    onToggle={() => updatePrefs(p => ({ ...p, quietHours: { ...p.quietHours, urgentOverride: !p.quietHours.urgentOverride } }))}
                  />
                </>
              )}
            </div>
          )}
        </SectionCard>

        <SectionCard>
          <SectionHeader
            icon={Volume2}
            title="Delivery"
            collapsible
            collapsed={collapsedSections.delivery}
            onToggle={() => toggleSection('delivery')}
          />
          {!collapsedSections.delivery && (
            <div className="divide-y divide-border-primary">
              <ToggleRow icon={Volume2} label="Sound" description="Play a sound when notifications arrive" enabled={prefs.delivery.sound} onToggle={() => updatePrefs(p => ({ ...p, delivery: { ...p.delivery, sound: !p.delivery.sound } }))} />
              <ToggleRow icon={BadgeCheck} label="Badge" description="Show badge count on app icon" enabled={prefs.delivery.badge} onToggle={() => updatePrefs(p => ({ ...p, delivery: { ...p.delivery, badge: !p.delivery.badge } }))} />
            </div>
          )}
        </SectionCard>

        <SectionCard>
          <SectionHeader icon={Megaphone} title="Announcements" />
          <ToggleRow icon={Megaphone} label="Announcements" description="App updates and important system notifications" enabled={prefs.announcements} onToggle={() => updatePrefs(p => ({ ...p, announcements: !p.announcements }))} />
        </SectionCard>

      </div>
    </div>
  );
}
