'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Trans man', 'Trans woman', 'Genderfluid', 'Agender', 'Prefer to self-describe', 'Prefer not to say'];
const ORIENTATION_OPTIONS = ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Queer', 'Asexual', 'Demisexual', 'Bicurious', 'Questioning', 'Prefer to self-describe', 'Prefer not to say'];
const INTERESTED_IN_OPTIONS = ['Men', 'Women', 'Non-binary people', 'Trans men', 'Trans women'];

export default function DatingIdentityPage() {
  const { user } = useAuthStore();
  const [gender, setGender] = useState<string | null>(null);
  const [genderCustom, setGenderCustom] = useState('');
  const [orientation, setOrientation] = useState<string[]>([]);
  const [orientationCustom, setOrientationCustom] = useState('');
  const [interestedIn, setInterestedIn] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from('relationship_profiles')
        .select('gender_identity, gender_custom_text, sexual_orientation, orientation_custom_text, interested_in_genders')
        .eq('user_id', user!.id)
        .single();

      if (data) {
        setGender(data.gender_identity || null);
        setGenderCustom(data.gender_custom_text || '');
        setOrientation(data.sexual_orientation || []);
        setOrientationCustom(data.orientation_custom_text || '');
        setInterestedIn(data.interested_in_genders || []);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  function toggleOrientation(value: string) {
    setOrientation(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  }

  function toggleInterestedIn(value: string) {
    setInterestedIn(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from('relationship_profiles')
      .upsert({
        user_id: user.id,
        gender_identity: gender,
        gender_custom_text: gender === 'Prefer to self-describe' ? genderCustom : null,
        sexual_orientation: orientation,
        orientation_custom_text: orientation.includes('Prefer to self-describe') ? orientationCustom : null,
        interested_in_genders: interestedIn,
      }, { onConflict: 'user_id' });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/settings" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Settings
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
        <Heart className="w-7 h-7 text-accent-primary" />
        Dating Identity
      </h1>

      {/* Gender Identity */}
      <div className="card mb-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Gender Identity</h3>
        <p className="text-xs text-text-muted mb-3">How do you identify?</p>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map(option => (
            <button
              key={option}
              onClick={() => setGender(gender === option ? null : option)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                gender === option
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/80'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        {gender === 'Prefer to self-describe' && (
          <input
            type="text"
            value={genderCustom}
            onChange={(e) => setGenderCustom(e.target.value)}
            placeholder="How do you describe your gender?"
            className="input mt-3"
            maxLength={100}
          />
        )}
      </div>

      {/* Sexual / Romantic Orientation */}
      <div className="card mb-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Sexual / Romantic Orientation</h3>
        <p className="text-xs text-text-muted mb-3">Select all that apply</p>
        <div className="flex flex-wrap gap-2">
          {ORIENTATION_OPTIONS.map(option => (
            <button
              key={option}
              onClick={() => toggleOrientation(option)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                orientation.includes(option)
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/80'
              }`}
            >
              {orientation.includes(option) ? `✓ ${option}` : option}
            </button>
          ))}
        </div>
        {orientation.includes('Prefer to self-describe') && (
          <input
            type="text"
            value={orientationCustom}
            onChange={(e) => setOrientationCustom(e.target.value)}
            placeholder="How do you describe your orientation?"
            className="input mt-3"
            maxLength={100}
          />
        )}
      </div>

      {/* Interested In */}
      <div className="card mb-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Interested In</h3>
        <p className="text-xs text-text-muted mb-3">Select all that apply</p>
        <div className="flex flex-wrap gap-2">
          {INTERESTED_IN_OPTIONS.map(option => (
            <button
              key={option}
              onClick={() => toggleInterestedIn(option)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                interestedIn.includes(option)
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/80'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary w-full"
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
      </button>
    </div>
  );
}
