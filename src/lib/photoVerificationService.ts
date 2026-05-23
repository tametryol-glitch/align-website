import { createClient } from '@/lib/supabase';

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'none';

export interface VerificationResult {
  id: string;
  status: VerificationStatus;
  selfie_url: string;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export async function getVerificationStatus(userId: string): Promise<VerificationResult | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('photo_verifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data as VerificationResult;
  } catch {
    return null;
  }
}

export async function submitVerification(
  userId: string,
  selfieFile: File,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const fileName = `${userId}/${Date.now()}-selfie.jpg`;

  console.log('[Verify] Uploading selfie to dating-verifications bucket, file:', fileName, 'size:', selfieFile.size);

  // Step 1: Check auth
  let user;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch (e: any) {
    console.error('[Verify] Auth check threw:', e);
    return { success: false, error: `Auth check failed: ${e?.message}` };
  }
  if (!user) {
    return { success: false, error: 'You are not signed in. Please log in and try again.' };
  }

  // Step 2: Upload to storage
  let uploadError;
  try {
    const result = await supabase.storage
      .from('dating-verifications')
      .upload(fileName, selfieFile, { contentType: 'image/jpeg', upsert: true });
    uploadError = result.error;
  } catch (e: any) {
    console.error('[Verify] Storage upload threw:', e);
    return { success: false, error: `Storage upload network error: ${e?.message}` };
  }

  if (uploadError) {
    console.error('[Verify] Storage upload failed:', uploadError.message, uploadError);
    return { success: false, error: `Upload failed: ${uploadError.message}` };
  }

  console.log('[Verify] Upload succeeded, getting public URL');

  // Step 3: Get public URL
  const { data: urlData } = supabase.storage
    .from('dating-verifications')
    .getPublicUrl(fileName);

  const publicUrl = urlData?.publicUrl;
  if (!publicUrl) {
    return { success: false, error: 'Failed to generate image URL after upload.' };
  }

  console.log('[Verify] Public URL:', publicUrl);

  // Step 4: Insert DB record
  let insertError;
  try {
    const result = await supabase
      .from('photo_verifications')
      .insert({
        user_id: userId,
        selfie_url: publicUrl,
        status: 'pending',
      });
    insertError = result.error;
  } catch (e: any) {
    console.error('[Verify] DB insert threw:', e);
    return { success: false, error: `DB insert network error: ${e?.message}` };
  }

  if (insertError) {
    console.error('[Verify] DB insert failed:', insertError.message, insertError);
    return { success: false, error: `Database error: ${insertError.message}` };
  }

  // Step 5: Trigger AI face verification (non-blocking)
  try {
    const { data: inserted } = await supabase
      .from('photo_verifications')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (inserted?.id) {
      fetch('/api/verify-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationId: inserted.id }),
      }).catch(() => {});
    }
  } catch {
    // non-critical — face verification can run later via admin review
  }

  return { success: true };
}
