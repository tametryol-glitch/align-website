'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { Sparkles, MapPin, Clock, User, ChevronRight, ChevronLeft, HelpCircle, FileText, Search } from 'lucide-react';
import { CitySearch } from '@/components/ui/CitySearch';
import { indexMyPlacements } from '@/lib/cosmicIndexService';
import { useTranslation } from 'react-i18next';

const STEPS = ['Welcome', 'Name', 'Birth Date', 'Birth Time', 'Location', 'Complete'];

export default function OnboardingPage() {
  const { t } = useTranslation();
  const { user, setProfile, profile } = useAuthStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

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

  async function saveProfile(): Promise<boolean> {
    if (!user) {
      setSaveError('You are not signed in. Please refresh and try again.');
      return false;
    }
    setSaving(true);
    setSaveError('');
    try {
      const supabase = createClient();

      const updates: any = {
        display_name: displayName.trim() || undefined,
        birth_date: birthDate || undefined,
        birth_time: birthTime || undefined,
        birth_location: birthLocation || undefined,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        timezone: timezone || undefined,
      };

      Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('[Onboarding] Supabase update error:', error);
        setSaveError('Could not save your profile. Please try again.');
        return false;
      }

      if (data) setProfile(data);
      if (data?.birth_date && data?.latitude && data?.longitude) {
        indexMyPlacements().catch(() => {});
      }
      return true;
    } catch (err) {
      console.error('[Onboarding] saveProfile failed:', err);
      setSaveError('Network error — check your connection and try again.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete() {
    const saved = await saveProfile();
    if (!saved) return;

    router.push('/dashboard');
  }

  async function handleRectification() {
    if (!birthDate) {
      setSaveError('Please enter your birth date before using the rectification tool.');
      return;
    }
    if (latitude == null || longitude == null || !timezone) {
      setSaveError('Please select your birth city first (step 4) before using the rectification tool.');
      return;
    }
    const saved = await saveProfile();
    if (!saved) return;
    router.push('/readings/rectification');
  }

  function canAdvance(): boolean {
    switch (step) {
      case 2: {
        if (!birthDate) return false;
        const [y, m, d] = birthDate.split('-').map(Number);
        return y >= 1900 && y <= 2026 && m >= 1 && m <= 12 && d >= 1 && d <= 31;
      }
      case 4: return latitude != null && longitude != null && !!timezone;
      default: return true;
    }
  }

  function next() {
    if (step < STEPS.length - 1 && canAdvance()) setStep(step + 1);
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
              <Image src="/logo.png" alt="Align logo" width={64} height={64} className="w-16 h-16 rounded-2xl mx-auto mb-6" />
              <h1 className="text-2xl font-display font-bold text-text-primary mb-3">
                {t('auth.welcome')}
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
              <div className="flex items-center gap-2 mb-6">
                <input
                  type="number"
                  min={1} max={31}
                  placeholder="DD"
                  value={birthDate ? parseInt(birthDate.split('-')[2], 10) : ''}
                  onChange={(e) => {
                    const parts = birthDate ? birthDate.split('-') : ['', '', ''];
                    const d = e.target.value.padStart(2, '0');
                    if (parts[0] && parts[1]) setBirthDate(`${parts[0]}-${parts[1]}-${d}`);
                    else setBirthDate(`0000-01-${d}`);
                  }}
                  className="input text-center flex-1"
                />
                <span className="text-text-tertiary font-bold">/</span>
                <input
                  type="number"
                  min={1} max={12}
                  placeholder="MM"
                  value={birthDate ? parseInt(birthDate.split('-')[1], 10) : ''}
                  onChange={(e) => {
                    const parts = birthDate ? birthDate.split('-') : ['', '', ''];
                    const m = e.target.value.padStart(2, '0');
                    if (parts[0]) setBirthDate(`${parts[0]}-${m}-${parts[2] || '01'}`);
                    else setBirthDate(`0000-${m}-${parts[2] || '01'}`);
                  }}
                  className="input text-center flex-1"
                />
                <span className="text-text-tertiary font-bold">/</span>
                <input
                  type="number"
                  min={1900} max={2026}
                  placeholder="YYYY"
                  value={birthDate ? parseInt(birthDate.split('-')[0], 10) || '' : ''}
                  onChange={(e) => {
                    const parts = birthDate ? birthDate.split('-') : ['', '', ''];
                    const y = e.target.value;
                    setBirthDate(`${y}-${parts[1] || '01'}-${parts[2] || '01'}`);
                  }}
                  className="input text-center flex-[1.5]"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={prev} className="btn-secondary flex-1">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={next} disabled={!birthDate} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40">
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
              {latitude == null && birthLocation && (
                <p className="text-xs text-amber-400 mb-3">Please select a city from the dropdown results</p>
              )}
              <div className="flex gap-3">
                <button onClick={prev} className="btn-secondary flex-1">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={next} disabled={latitude == null || longitude == null || !timezone} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40">
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
              {saveError && (
                <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg mb-4">{saveError}</p>
              )}
              <button
                onClick={handleComplete}
                disabled={saving}
                className="btn-primary w-full"
              >
                {saving ? t('editProfile.saving') : 'Enter the Cosmos'}
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
