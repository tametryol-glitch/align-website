'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { Sparkles, MapPin, Clock, User, ChevronRight, ChevronLeft } from 'lucide-react';
import { CitySearch } from '@/components/ui/CitySearch';

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

  async function handleComplete() {
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
      onboarding_completed: true,
    };

    // Remove undefined values
    Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);

    const { data } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (data) setProfile(data);
    setSaving(false);
    router.push('/dashboard');
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
  }
  function prev() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-accent flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
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
              <p className="text-sm text-text-tertiary mb-6">Used for your natal chart and Sun sign</p>
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
              <p className="text-sm text-text-tertiary mb-6">Needed for accurate Rising sign and houses</p>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="input text-center mb-2"
              />
              <p className="text-xs text-text-muted mb-6">Don&apos;t know? You can add it later</p>
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
              <p className="text-sm text-text-tertiary mb-6">Your birth location determines planetary houses</p>
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
              <p className="text-sm text-text-tertiary mb-8">
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
