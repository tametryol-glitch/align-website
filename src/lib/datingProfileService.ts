import { createClient } from '@/lib/supabase';

export interface DatingPromptAnswer {
  prompt_id: string;
  question: string;
  answer: string;
}

export interface DatingProfile {
  dating_enabled: boolean;
  photo_urls: string[];
  voice_prompt_url: string | null;
  video_intro_url: string | null;
  dating_prompts: DatingPromptAnswer[];
  photo_verified: boolean;
  photo_verified_at: string | null;
  dating_bio: string | null;
  age_visible: boolean;
  dating_profile_updated_at: string | null;
  display_name: string | null;
  birth_date: string | null;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
  avatar_url: string | null;
  relationship_primary_intent: string | null;
  relationship_style: string | null;
}

const DATING_FIELDS = [
  'dating_enabled', 'photo_urls', 'voice_prompt_url', 'video_intro_url',
  'dating_prompts', 'photo_verified', 'photo_verified_at', 'dating_bio',
  'age_visible', 'dating_profile_updated_at', 'display_name', 'birth_date',
  'sun_sign', 'moon_sign', 'rising_sign', 'avatar_url',
  'relationship_primary_intent', 'relationship_style',
] as const;

export async function getDatingProfile(userId: string): Promise<DatingProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(DATING_FIELDS.join(', '))
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  const d = data as any;
  return {
    ...d,
    photo_urls: d.photo_urls || [],
    dating_prompts: d.dating_prompts || [],
  } as DatingProfile;
}

export async function saveDatingProfile(
  userId: string,
  updates: Partial<Pick<DatingProfile, 'dating_enabled' | 'dating_bio' | 'dating_prompts' | 'age_visible' | 'photo_urls'>>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      dating_profile_updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function uploadDatingPhoto(
  userId: string,
  file: File,
  position: number
): Promise<{ url: string | null; error?: string }> {
  const supabase = createClient();
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/dating-photo-${position}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('dating-media')
    .upload(path, file, { upsert: true });

  if (uploadError) return { url: null, error: uploadError.message };

  const { data: urlData } = supabase.storage
    .from('dating-media')
    .getPublicUrl(path);

  return { url: urlData.publicUrl };
}

export async function removeDatingPhoto(
  userId: string,
  photoUrl: string,
  currentPhotos: string[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const updatedPhotos = currentPhotos.filter((url) => url !== photoUrl);

  const { error } = await supabase
    .from('profiles')
    .update({
      photo_urls: updatedPhotos,
      dating_profile_updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };

  // Clean up the actual file from storage to prevent orphans
  try {
    const url = new URL(photoUrl);
    const pathMatch = url.pathname.match(/\/dating-media\/(.+)$/);
    if (pathMatch) {
      await supabase.storage.from('dating-media').remove([pathMatch[1]]);
    }
  } catch {
    // Non-critical — file cleanup is best-effort
  }

  return { success: true };
}

export async function uploadVoicePrompt(
  userId: string,
  blob: Blob
): Promise<{ url: string | null; error?: string }> {
  const supabase = createClient();
  const path = `${userId}/voice-prompt-${Date.now()}.webm`;

  const { error: uploadError } = await supabase.storage
    .from('dating-media')
    .upload(path, blob, { upsert: true, contentType: 'audio/webm' });

  if (uploadError) return { url: null, error: uploadError.message };

  const { data: urlData } = supabase.storage
    .from('dating-media')
    .getPublicUrl(path);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      voice_prompt_url: urlData.publicUrl,
      dating_profile_updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (updateError) return { url: null, error: updateError.message };
  return { url: urlData.publicUrl };
}

export async function uploadVideoIntro(
  userId: string,
  blob: Blob
): Promise<{ url: string | null; error?: string }> {
  const supabase = createClient();
  const path = `${userId}/video-intro-${Date.now()}.mp4`;

  const { error: uploadError } = await supabase.storage
    .from('dating-media')
    .upload(path, blob, { upsert: true, contentType: 'video/mp4' });

  if (uploadError) return { url: null, error: uploadError.message };

  const { data: urlData } = supabase.storage
    .from('dating-media')
    .getPublicUrl(path);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      video_intro_url: urlData.publicUrl,
      dating_profile_updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (updateError) return { url: null, error: updateError.message };
  return { url: urlData.publicUrl };
}

export async function toggleDatingEnabled(
  userId: string,
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      dating_enabled: enabled,
      dating_profile_updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
