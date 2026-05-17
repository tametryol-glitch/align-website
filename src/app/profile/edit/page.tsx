'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Camera, ImageIcon } from 'lucide-react';
import { CitySearch } from '@/components/ui/CitySearch';
import { indexMyPlacements } from '@/lib/cosmicIndexService';

export default function EditProfilePage() {
  const { user, profile, setProfile } = useAuthStore();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
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
      setBio(profile.bio || '');
      setBirthDate(profile.birth_date || '');
      setBirthTime(profile.birth_time || '');
      setBirthLocation(profile.birth_location || '');
      setLatitude(profile.latitude || null);
      setLongitude(profile.longitude || null);
      setTimezone(profile.timezone || '');
    }
  }, [profile]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setError('');

    try {
      const supabase = createClient();
      const updates: any = {
        display_name: displayName.trim(),
        bio: bio.trim(),
        birth_date: birthDate || null,
        birth_time: birthTime || null,
        birth_location: birthLocation || null,
        latitude: latitude || null,
        longitude: longitude || null,
        timezone: timezone || null,
      };

      const { data, error: err } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (err) throw err;
      if (data) setProfile(data);
      if (data?.birth_date && data?.latitude && data?.longitude) {
        indexMyPlacements().catch(() => {});
      }
      router.push('/profile');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  const initial = (displayName || user.email || '?')[0].toUpperCase();

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/profile" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Profile
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mb-6">Edit Profile</h1>

      {/* Cover photo + Avatar */}
      <div className="relative mb-10">
        {/* Cover photo */}
        <div className="h-[140px] sm:h-[180px] rounded-2xl overflow-hidden relative group">
          {profile?.cover_photo_url ? (
            <Image src={profile.cover_photo_url} alt="Cover photo" fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1E1440] via-[#2D1B69] to-[#1A1035] flex items-center justify-center">
              <p className="text-text-muted text-xs">Tap to add cover photo</p>
            </div>
          )}
          <label className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <ImageIcon className="w-6 h-6 text-white" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !user) return;
                setSaving(true);
                try {
                  const supabase = createClient();
                  const filePath = `covers/${user.id}.jpg`;
                  await supabase.storage.from('avatars').upload(filePath, file, { contentType: file.type, upsert: true });
                  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
                  const coverUrl = `${urlData.publicUrl}?t=${Date.now()}`;
                  await supabase.from('profiles').update({ cover_photo_url: coverUrl }).eq('id', user.id);
                  setProfile({ ...profile!, cover_photo_url: coverUrl });
                } catch (err: any) {
                  setError(err.message || 'Failed to upload cover photo');
                } finally {
                  setSaving(false);
                }
              }}
            />
          </label>
        </div>
        {/* Avatar overlapping cover */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-bg-card bg-accent-muted flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="User avatar" width={96} height={96} className="w-full h-full rounded-full object-cover" unoptimized />
              ) : (
                <span className="text-3xl font-bold text-accent-primary">{initial}</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center cursor-pointer">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !user) return;
                  setSaving(true);
                  try {
                    const supabase = createClient();
                    const filePath = `${user.id}.jpg`;
                    await supabase.storage.from('avatars').upload(filePath, file, { contentType: file.type, upsert: true });
                    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
                    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
                    await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
                    setProfile({ ...profile!, avatar_url: avatarUrl });
                  } catch (err: any) {
                    setError(err.message || 'Failed to upload avatar');
                  } finally {
                    setSaving(false);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="card space-y-5">
        {/* Display Name */}
        <div>
          <label className="text-sm font-medium text-text-secondary block mb-1.5">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input"
            maxLength={50}
          />
        </div>

        {/* Bio */}
        <div>
          <label className="text-sm font-medium text-text-secondary block mb-1.5">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="input min-h-[80px] resize-none"
            placeholder="Tell the cosmos about yourself..."
            maxLength={300}
          />
          <p className="text-xs text-text-muted text-right mt-1">{bio.length}/300</p>
        </div>

        {/* Birth Data */}
        <div className="border-t border-border-primary pt-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Birth Data</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-text-muted block mb-1">Date</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="input" />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Time</label>
              <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className="input" />
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs text-text-muted block mb-1">Location</label>
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
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving || !displayName.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
