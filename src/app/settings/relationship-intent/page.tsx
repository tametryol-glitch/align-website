'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

const INTENT_OPTIONS = [
  'Long-term relationship',
  'Short-term dating',
  'Casual',
  'Friendship first',
  'Not sure yet',
  'Marriage-minded',
];

export default function RelationshipIntentPage() {
  const { user } = useAuthStore();
  const [intent, setIntent] = useState<string | null>(null);
  const [ageMin, setAgeMin] = useState<number>(18);
  const [ageMax, setAgeMax] = useState<number>(65);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from('relationship_profiles')
        .select('relationship_intent, preferred_age_min, preferred_age_max')
        .eq('user_id', user!.id)
        .single();

      if (data) {
        setIntent(data.relationship_intent || null);
        if (data.preferred_age_min) setAgeMin(data.preferred_age_min);
        if (data.preferred_age_max) setAgeMax(data.preferred_age_max);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from('relationship_profiles')
      .upsert({
        user_id: user.id,
        relationship_intent: intent,
        preferred_age_min: ageMin,
        preferred_age_max: ageMax,
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
        <Sparkles className="w-7 h-7 text-accent-primary" />
        Relationship Intent
      </h1>

      {/* What are you looking for? */}
      <div className="card mb-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">What are you looking for?</h3>
        <p className="text-xs text-text-muted mb-3">Select one</p>
        <div className="flex flex-wrap gap-2">
          {INTENT_OPTIONS.map(option => (
            <button
              key={option}
              onClick={() => setIntent(option)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                intent === option
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/80'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Preferred Age Range */}
      <div className="card mb-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Preferred Age Range</h3>
        <p className="text-xs text-text-muted mb-3">Set the age range you are interested in</p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs text-text-muted mb-1 block">Min Age</label>
            <input
              type="number"
              min={18}
              max={100}
              value={ageMin}
              onChange={(e) => setAgeMin(Number(e.target.value))}
              className="input"
            />
          </div>
          <span className="text-text-muted mt-5">—</span>
          <div className="flex-1">
            <label className="text-xs text-text-muted mb-1 block">Max Age</label>
            <input
              type="number"
              min={18}
              max={100}
              value={ageMax}
              onChange={(e) => setAgeMax(Number(e.target.value))}
              className="input"
            />
          </div>
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
