'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { Sparkles, MapPin, Clock, User, ChevronRight, ChevronLeft, HelpCircle, FileText, Search } from 'lucide-react';
import { CitySearch } from '@/components/ui/CitySearch';
import { indexMyPlacements } from '@/lib/cosmicIndexService';

const STEPS = ['Welcome', 'Name', 'Birth Date', 'Birth Time', 'Location', 'Complete'];

export default function OnboardingPage() {
  const { user, setProfile, profile } = useAuthStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form data
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [birthDate, setBirthDate] = useState(profile?.birth_date || '');
  const [birthTime, setBirthTime] = useState(profile?.birth_time || '');
  const [birthLocation, setBirthLocation] = useState(profile?.birth_location || '');
  const [latitude, setLatitude] = useState<number | null>(profile?.latitude || null);
  const [longitude, setLongitude] = useState<number | null>(profile?.longitude || null);
  const [timezone, setTimezone] = useState(profile?.timezone || '');

  // Sync form fields when profile loads asynchronously
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBirthDate(profile.birth_date || '');
      setBirthTime(profile.birth_time || '');
      setBirthLocation(profile.birth_location || '');
      setLatitude(profile.latitude || null);
      setLongitude(profile.longitude || null);
      setTimezone(profile.timezone || '');
    }
  }, [profile]);

  async function saveProfile(markComplete = true) {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();

    const updates: any = {
      display_name: displayName.trim() || undefined,
      birth_date: birthDate || undefined,
      birth_time: birthTime || undefined,
      birth_location: birthLocation || undefined,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      timezone: timezone || undefined,
    };
    if (markComplete) updates.onboarding_completed = true;

    Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);

    const { data } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (data) setProfile(data);
    if (data?.birth_date && data?.latitude && data?.longitude) {
      indexMyPlacements().catch(() => {});
    }
    setSaving(false);
    return data;
  }

  async function handleComplete() {
    await saveProfile(true);
    router.push('/dashboard');
  }

  async function handleRectification() {
    await saveProfile(true);
    router.push('/readings/rectification');
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
  }
  function prev() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i <= step ? 'bg-accent-primary' : 'bg-bg-tertiary'
              }`}
            />
          ))}
        </div>

        <div className="card text-center">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="py-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Align" className="w-16 h-16 rounded-2xl mx-auto mb-6" />
              <h1 className="text-2xl font-display font-bold text-text-primary mb-3">
                Welcome to Align
              </h1>
              <p className="text-sm text-text-tertiary mb-8">
                Let&apos;s set up your cosmic profile. Your birth data helps us calculate accurate charts and personalized readings.
              </p>
              <button onClick={next} className="btn-primary w-full flex items-center justify-center gap-2">
                Get Started <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 1: Name */}
          {step === 1 && (
            <div className="py-6">
              <User className="w-10 h-10 text-accent-primary mx-auto mb-4" />
              <h2 className="text-xl font-display font-bold text-text-primary mb-2">What&apos;s your name?</h2>
              <p className="text-sm text-text-tertiary mb-6">This is how others will see you</p>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                className="input text-center mb-6"
                autoFocus
              />
              <div className="flex gap-3">
                <button onClick={prev} className="btn-secondary flex-1">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={next} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Birth Date */}
          {step === 2 && (
            <div className="py-6">
              <div className="text-3xl mb-4">🎂</div>
              <h2 className="text-xl font-display font-bold text-text-primary mb-2">When were you born?</h2>
              <p className="text-sm text-text-tertiary mb-4">Your birth date determines your Sun sign and planetary positions</p>
              <div className="bg-bg-tertiary rounded-xl p-3 mb-4 text-left">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-accent-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-text-secondary">
                    <span className="font-semibold text-text-primary">Where to find it:</span> Your birth certificate, hospital records, or baby book. Use the exact date — even one day off changes your chart.
                  </p>
                </div>
              </div>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="input text-center mb-6"
              />
              <div className="flex gap-3">
                <button onClick={prev} className="btn-secondary flex-1">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={next} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Birth Time */}
          {step === 3 && (
            <div className="py-6">
              <Clock className="w-10 h-10 text-accent-primary mx-auto mb-4" />
              <h2 className="text-xl font-display font-bold text-text-primary mb-2">What time were you born?</h2>
              <p className="text-sm text-text-tertiary mb-4">This is the most important piece — it determines your Rising sign, house placements, and planetary angles</p>
              <div className="bg-bg-tertiary rounded-xl p-3 mb-4 text-left space-y-2">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-accent-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-text-secondary">
                    <span className="font-semibold text-text-primary">Where to find it:</span> Check your birth certificate — many list the exact time. You can also ask a parent or request hospital records.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-text-secondary">
                    <span className="font-semibold text-text-primary">Why it matters:</span> Even a 15-minute difference can change your Rising sign. Without it, house placements and angles won&apos;t be accurate.
                  </p>
                </div>
              </div>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="input text-center mb-3"
              />
              <button
                type="button"
                onClick={handleRectification}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors mb-4"
              >
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-medium text-amber-400">Don&apos;t know your birth time? Use our Rectification Tool to find it</span>
              </button>
              <div className="flex gap-3">
                <button onClick={prev} className="btn-secondary flex-1">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={next} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {birthTime ? 'Next' : 'Skip'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Location */}
          {step === 4 && (
            <div className="py-6">
              <MapPin className="w-10 h-10 text-accent-primary mx-auto mb-4" />
              <h2 className="text-xl font-display font-bold text-text-primary mb-2">Where were you born?</h2>
              <p className="text-sm text-text-tertiary mb-4">Your birth location sets the angles of your chart — the horizon and meridian at the moment you arrived</p>
              <div className="bg-bg-tertiary rounded-xl p-3 mb-4 text-left">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-accent-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-text-secondary">
                    <span className="font-semibold text-text-primary">Be specific:</span> Search for the city you were born in, not where you grew up. The closer to your actual birthplace, the more accurate your Rising sign and houses.
                  </p>
                </div>
              </div>
              <div className="mb-6">
                <CitySearch
                  value={birthLocation}
                  onChange={(location, lat, lon, tz) => {
                    setBirthLocation(location);
                    setLatitude(lat);
                    setLongitude(lon);
                    setTimezone(tz);
                  }}
                  placeholder="Search city, state, or country..."
                />
              </div>
              <div className="flex gap-3">
                <button onClick={prev} className="btn-secondary flex-1">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={next} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Complete */}
          {step === 5 && (
            <div className="py-8">
              <div className="text-4xl mb-4">✨</div>
              <h2 className="text-xl font-display font-bold text-text-primary mb-2">You&apos;re all set!</h2>
              {birthDate && (
                <div className="bg-gradient-cosmic rounded-xl p-4 border border-accent-muted mb-4">
                  <p className="text-xs text-accent-tertiary uppercase tracking-wider mb-1">Your Sun Sign</p>
                  <p className="text-2xl font-display font-bold text-text-primary">
                    {getSignGlyph(getSunSign(birthDate))} {getSunSign(birthDate)}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">Complete your chart to discover your Moon &amp; Rising</p>
                </div>
              )}
              <p className="text-sm text-text-tertiary mb-6">
                Your cosmic profile is ready. Explore your chart, get readings, and connect with other stargazers.
              </p>
              <button
                onClick={handleComplete}
                disabled={saving}
                className="btn-primary w-full"
              >
                {saving ? 'Saving...' : 'Enter the Cosmos'}
              </button>
              <button onClick={prev} className="btn-ghost w-full mt-2 text-sm">
                Go back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getSunSign(dateStr: string): string {
  const d = new Date(dateStr);
  const m = d.getMonth(), day = d.getDate();
  const signs = ['Capricorn','Aquarius','Pisces','Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius'];
  const cutoffs = [20,19,20,20,21,21,22,23,23,23,22,22];
  return day < cutoffs[m] ? signs[m] : signs[(m + 1) % 12];
}

function getSignGlyph(sign: string): string {
  const g: Record<string, string> = { Aries:'♈', Taurus:'♉', Gemini:'♊', Cancer:'♋', Leo:'♌', Virgo:'♍', Libra:'♎', Scorpio:'♏', Sagittarius:'♐', Capricorn:'♑', Aquarius:'♒', Pisces:'♓' };
  return g[sign] || '✦';
}
