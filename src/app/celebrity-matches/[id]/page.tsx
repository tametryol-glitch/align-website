'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Star, Sun, Moon, ArrowUp, Sparkles, ArrowLeft } from 'lucide-react';

interface Celebrity {
  id: string;
  name: string;
  birth_date: string;
  sun_sign: string;
  moon_sign: string;
  rising_sign: string;
  bio: string | null;
  image_url: string | null;
  category: string;
}

export default function CelebrityMatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [celebrity, setCelebrity] = useState<Celebrity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) fetchCelebrity(params.id as string);
  }, [params.id]);

  async function fetchCelebrity(id: string) {
    setLoading(true);
    const supabase = createClient();
    const { data, error: fetchErr } = await supabase
      .from('celebrities')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr) {
      setError('Celebrity not found.');
    } else if (data) {
      setCelebrity(data as Celebrity);
    }
    setLoading(false);
  }

  function handleCheckCompatibility() {
    if (!celebrity) return;
    const searchParams = new URLSearchParams({
      celebrity_name: celebrity.name,
      celebrity_sun: celebrity.sun_sign,
      celebrity_moon: celebrity.moon_sign,
      celebrity_rising: celebrity.rising_sign,
      celebrity_birth_date: celebrity.birth_date,
    });
    router.push(`/readings/compatibility?${searchParams.toString()}`);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-text-muted">Loading celebrity profile...</p>
      </div>
    );
  }

  if (error || !celebrity) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-red-400">{error || 'Celebrity not found.'}</p>
        <button onClick={() => router.back()} className="btn-primary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start gap-6">
          {/* Image */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-bg-tertiary overflow-hidden flex-shrink-0">
            {celebrity.image_url ? (
              <img
                src={celebrity.image_url}
                alt={celebrity.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Star className="w-10 h-10 text-text-muted" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-display font-bold text-text-primary mb-1">
              {celebrity.name}
            </h1>
            <span className="inline-block px-3 py-1 bg-bg-tertiary rounded-full text-xs text-text-muted mb-4">
              {celebrity.category}
            </span>

            {/* Sign Trio */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center bg-bg-tertiary rounded-xl p-2">
                <Sun className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                <p className="text-[10px] text-text-muted">Sun</p>
                <p className="text-xs font-semibold text-text-primary">{celebrity.sun_sign}</p>
              </div>
              <div className="text-center bg-bg-tertiary rounded-xl p-2">
                <Moon className="w-4 h-4 text-blue-300 mx-auto mb-1" />
                <p className="text-[10px] text-text-muted">Moon</p>
                <p className="text-xs font-semibold text-text-primary">{celebrity.moon_sign}</p>
              </div>
              <div className="text-center bg-bg-tertiary rounded-xl p-2">
                <ArrowUp className="w-4 h-4 text-accent-primary mx-auto mb-1" />
                <p className="text-[10px] text-text-muted">Rising</p>
                <p className="text-xs font-semibold text-text-primary">{celebrity.rising_sign}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {celebrity.bio && (
        <div className="card mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-2">About</h2>
          <p className="text-text-secondary text-sm leading-relaxed">{celebrity.bio}</p>
        </div>
      )}

      {/* Check Compatibility Button */}
      <button
        onClick={handleCheckCompatibility}
        className="btn-primary w-full flex items-center justify-center gap-2 py-4"
      >
        <Sparkles className="w-5 h-5" />
        Check Compatibility
      </button>
    </div>
  );
}
