'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { Sparkles, MapPin, Clock, User, ChevronRight, ChevronLeft, HelpCircle, FileText, Search, Heart, Share2, Copy, Check } from 'lucide-react';
import { CitySearch } from '@/components/ui/CitySearch';
import { indexMyPlacements } from '@/lib/cosmicIndexService';
import { saveRelationshipProfile } from '@/lib/relationshipProfileService';
import { api, buildBirthData } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { BigThreeCard } from '@/components/share';
import { generateShareUrl, shareCard } from '@/lib/shareCardUtils';

const STEPS = ['Welcome', 'Name', 'Birth Date', 'Birth Time', 'Location', 'Identity', 'Complete', 'Reveal', 'Share'];

const GENDER_OPTIONS = ['Man', 'Woman', 'Non-binary', 'Other', 'Prefer not to say'];
const INTERESTED_IN_OPTIONS = ['Men', 'Women', 'Everyone'];

// ── Personality Reveal Data ────────────────────────────────────────

const SIGN_ELEMENT: Record<string, string> = {
  Aries: 'Fire', Taurus: 'Earth', Gemini: 'Air', Cancer: 'Water',
  Leo: 'Fire', Virgo: 'Earth', Libra: 'Air', Scorpio: 'Water',
  Sagittarius: 'Fire', Capricorn: 'Earth', Aquarius: 'Air', Pisces: 'Water',
};

const SIGN_GLYPH: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const ELEMENT_COLOR: Record<string, string> = {
  Fire: 'from-red-500/20 to-orange-500/20 border-red-500/30',
  Earth: 'from-green-600/20 to-emerald-500/20 border-green-500/30',
  Air: 'from-sky-500/20 to-cyan-500/20 border-sky-500/30',
  Water: 'from-blue-600/20 to-indigo-500/20 border-blue-500/30',
};

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

  // Identity step (optional)
  const [gender, setGender] = useState('');
  const [interestedIn, setInterestedIn] = useState<string[]>([]);

  const toggleInterestedIn = (val: string) => {
    setInterestedIn(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  // Personality reveal state
  const [sunSign, setSunSign] = useState('');
  const [moonSign, setMoonSign] = useState('');
  const [risingSign, setRisingSign] = useState('');
  const [chartLoading, setChartLoading] = useState(false);
  const [revealVisible, setRevealVisible] = useState({ title: false, sun: false, moon: false, rising: false, element: false, cta: false });
  const [shareCopied, setShareCopied] = useState(false);

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
        gender_identity: gender || undefined,
        interested_in_genders: interestedIn.length > 0 ? interestedIn : undefined,
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
    // Save identity fields to relationship profile (fire-and-forget)
    if (user?.id && (gender || interestedIn.length > 0)) {
      saveRelationshipProfile(user.id, {
        gender_identity: gender || null,
        interested_in_genders: interestedIn.length > 0 ? interestedIn : null,
      }).catch(() => {});
    }

    const saved = await saveProfile();
    if (!saved) return;

    // Try to fetch natal chart for personality reveal
    if (birthDate && latitude != null && longitude != null && timezone) {
      setChartLoading(true);
      try {
        const chartData = await api.getNatalChart({
          birth_date: birthDate,
          birth_time: birthTime || '12:00',
          latitude,
          longitude,
          timezone,
          house_system: 'Whole Sign',
        });

        const planets = chartData?.planets || [];
        const sun = planets.find((p: any) => p.name === 'Sun');
        const moon = planets.find((p: any) => p.name === 'Moon');
        const asc = planets.find((p: any) => p.name === 'Ascendant');

        if (sun?.sign) setSunSign(sun.sign);
        if (moon?.sign) setMoonSign(moon.sign);
        if (asc?.sign) setRisingSign(asc.sign);

        setChartLoading(false);
        setStep(7);

        // Stagger the reveal animations
        setTimeout(() => setRevealVisible(v => ({ ...v, title: true })), 200);
        setTimeout(() => setRevealVisible(v => ({ ...v, sun: true })), 800);
        setTimeout(() => setRevealVisible(v => ({ ...v, moon: true })), 1600);
        setTimeout(() => setRevealVisible(v => ({ ...v, rising: true })), 2400);
        setTimeout(() => setRevealVisible(v => ({ ...v, element: true })), 3200);
        setTimeout(() => setRevealVisible(v => ({ ...v, cta: true })), 3800);
        return;
      } catch (err) {
        console.warn('[Onboarding] Chart fetch failed, skipping reveal:', err);
        setChartLoading(false);
      }
    }

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
      <div className={`w-full ${step >= 7 ? 'max-w-lg' : 'max-w-md'}`}>
        {/* Progress dots (hide on reveal and share steps) */}
        {step < 7 && (
          <div className="flex justify-center gap-2 mb-8">
            {STEPS.slice(0, 7).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i <= step ? 'bg-accent-primary' : 'bg-bg-tertiary'
                }`}
              />
            ))}
          </div>
        )}

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
              <p className="text-xs text-text-muted mb-3">Select your birth date from the calendar</p>
              <div className="mb-6">
                <input
                  type="date"
                  min="1900-01-01"
                  max={new Date().toISOString().split('T')[0]}
                  value={birthDate || ''}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="input w-full text-center text-base cursor-pointer"
                  style={{ colorScheme: 'dark' }}
                />
                {birthDate && (
                  <p className="text-center text-sm text-accent-primary mt-2 font-medium">
                    {new Date(birthDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
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

          {/* Step 5: Identity (optional) */}
          {step === 5 && (
            <div className="py-6">
              <Heart className="w-10 h-10 text-accent-primary mx-auto mb-4" />
              <h2 className="text-xl font-display font-bold text-text-primary mb-2">
                {t('onboarding.identifyAs', { defaultValue: "I identify as..." })}
              </h2>
              <p className="text-sm text-text-tertiary mb-6">
                {t('onboarding.personalizeHint', { defaultValue: "Help us personalize your experience. This is optional and can be changed later in Settings." })}
              </p>

              {/* Gender identity */}
              <p className="text-xs text-text-secondary font-semibold mb-2 text-left uppercase tracking-wider">
                {t('onboarding.identifyAs', { defaultValue: "I identify as..." })}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {GENDER_OPTIONS.map(option => (
                  <button
                    key={option}
                    onClick={() => setGender(gender === option ? '' : option)}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                      gender === option
                        ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                        : 'bg-bg-tertiary border-border-primary text-text-secondary hover:border-accent-primary/50'
                    } border`}
                  >
                    {gender === option && '✓ '}{option}
                  </button>
                ))}
              </div>

              {/* Interested in */}
              <p className="text-xs text-text-secondary font-semibold mb-2 text-left uppercase tracking-wider">
                {t('onboarding.interestedIn', { defaultValue: "I'm interested in..." })}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {INTERESTED_IN_OPTIONS.map(option => (
                  <button
                    key={option}
                    onClick={() => toggleInterestedIn(option)}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                      interestedIn.includes(option)
                        ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                        : 'bg-bg-tertiary border-border-primary text-text-secondary hover:border-accent-primary/50'
                    } border`}
                  >
                    {interestedIn.includes(option) && '✓ '}{option}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={prev} className="btn-secondary flex-1">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={next} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {gender || interestedIn.length > 0 ? 'Next' : t('onboarding.skip', { defaultValue: 'Skip for now' })} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Complete */}
          {step === 6 && (
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
                disabled={saving || chartLoading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {saving || chartLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {chartLoading ? t('onboarding.revealLoading') : t('editProfile.saving')}
                  </>
                ) : t('onboarding.enterTheCosmos')}
              </button>
              <button onClick={prev} className="btn-ghost w-full mt-2 text-sm">
                Go back
              </button>
            </div>
          )}

          {/* Step 7: Personality Reveal */}
          {step === 7 && (
            <div className="py-6 text-center">
              {/* Title */}
              <div className={`transition-all duration-700 ease-out ${revealVisible.title ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <div className="text-5xl mb-3">✨</div>
                <h2 className="text-2xl font-display font-bold text-text-primary mb-1">
                  {displayName ? t('onboarding.thisIsYou', { name: displayName.split(' ')[0] }) : t('onboarding.thisIsYouNoName')}
                </h2>
                <p className="text-xs text-text-tertiary mb-6">
                  {t('onboarding.cosmicFingerprint')}
                </p>
              </div>

              {/* Sun Sign Card */}
              <div className={`transition-all duration-700 ease-out mb-3 ${revealVisible.sun ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <div className={`bg-gradient-to-r ${ELEMENT_COLOR[SIGN_ELEMENT[sunSign] || 'Fire']} rounded-2xl p-4 border text-left`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{SIGN_GLYPH[sunSign] || '☉'}</span>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">{t('onboarding.yourSun')}</p>
                      <p className="text-lg font-display font-bold text-text-primary">{sunSign}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-text-secondary">☉ {t('onboarding.coreIdentity')}</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{t('onboarding.sunSoul.' + sunSign)}</p>
                </div>
              </div>

              {/* Moon Sign Card */}
              <div className={`transition-all duration-700 ease-out mb-3 ${revealVisible.moon ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <div className={`bg-gradient-to-r ${ELEMENT_COLOR[SIGN_ELEMENT[moonSign] || 'Water']} rounded-2xl p-4 border text-left`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{SIGN_GLYPH[moonSign] || '☽'}</span>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">{t('onboarding.yourMoon')}</p>
                      <p className="text-lg font-display font-bold text-text-primary">{moonSign}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-text-secondary">☽ {t('onboarding.innerWorld')}</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{t('onboarding.moonHeart.' + moonSign)}</p>
                </div>
              </div>

              {/* Rising Sign Card */}
              <div className={`transition-all duration-700 ease-out mb-3 ${revealVisible.rising ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <div className={`bg-gradient-to-r ${ELEMENT_COLOR[SIGN_ELEMENT[risingSign] || 'Air']} rounded-2xl p-4 border text-left`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{SIGN_GLYPH[risingSign] || '↑'}</span>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">{t('onboarding.yourRising')}</p>
                      <p className="text-lg font-display font-bold text-text-primary">{risingSign}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-text-secondary">↑ {t('onboarding.firstImpression')}</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{t('onboarding.risingMask.' + risingSign)}</p>
                </div>
              </div>

              {/* Element Summary */}
              <div className={`transition-all duration-700 ease-out mb-4 ${revealVisible.element ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <div className="bg-gradient-cosmic rounded-xl p-3 border border-accent-muted">
                  <p className="text-sm font-display font-semibold text-text-primary">
                    {t('onboarding.dominantElement', { element: t('onboarding.elementBalance.' + (SIGN_ELEMENT[sunSign] || 'Fire') + '.name') })}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">
                    {t('onboarding.elementBalance.' + (SIGN_ELEMENT[sunSign] || 'Fire') + '.feel')}
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className={`transition-all duration-700 ease-out ${revealVisible.cta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <button
                  onClick={() => setStep(8)}
                  className="btn-primary w-full mb-2"
                >
                  {t('onboarding.exploreChart')}
                </button>
                <p className="text-[10px] text-text-muted">
                  {t('onboarding.justBeginning')}
                </p>
              </div>
            </div>
          )}

          {/* Step 8: Share Your Chart Card */}
          {step === 8 && (
            <div className="py-6 text-center">
              <div className="text-4xl mb-3">&#x1F4AB;</div>
              <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
                Share your cosmic blueprint
              </h2>
              <p className="text-sm text-text-tertiary mb-6">
                Show friends your unique chart card and invite them to discover theirs
              </p>

              <div className="mb-6">
                <BigThreeCard
                  displayName={displayName || 'Stargazer'}
                  sunSign={sunSign}
                  moonSign={moonSign}
                  risingSign={risingSign}
                  aspect="square"
                />
              </div>

              <div className="flex gap-3 mb-3">
                <button
                  onClick={async () => {
                    const url = generateShareUrl('big-three', {
                      sun: sunSign,
                      moon: moonSign,
                      rising: risingSign,
                      name: displayName,
                    });
                    const result = await shareCard(
                      'My Align Chart',
                      `${displayName || 'My'} cosmic profile: ${sunSign} Sun, ${moonSign} Moon, ${risingSign} Rising`,
                      url,
                    );
                    if (result.copied) {
                      setShareCopied(true);
                      setTimeout(() => setShareCopied(false), 2000);
                    }
                  }}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={async () => {
                    const url = generateShareUrl('big-three', {
                      sun: sunSign,
                      moon: moonSign,
                      rising: risingSign,
                      name: displayName,
                    });
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      await navigator.clipboard.writeText(url);
                      setShareCopied(true);
                      setTimeout(() => setShareCopied(false), 2000);
                    }
                  }}
                  className="btn-secondary flex items-center justify-center gap-2 px-4"
                >
                  {shareCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {shareCopied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="btn-primary w-full mb-2"
              >
                Continue to Dashboard
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-ghost w-full text-sm text-text-muted"
              >
                Skip
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
