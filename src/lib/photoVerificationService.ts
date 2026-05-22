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
  try {
    const supabase = createClient();
    const fileName = `${userId}/${Date.now()}-selfie.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('dating-verifications')
      .upload(fileName, selfieFile, { contentType: 'image/jpeg', upsert: true });

    if (uploadError) return { success: false, error: uploadError.message };

    const { data: { publicUrl } } = supabase.storage
      .from('dating-verifications')
      .getPublicUrl(fileName);

    const { error: insertError } = await supabase
      .from('photo_verifications')
      .insert({
        user_id: userId,
        selfie_url: publicUrl,
        status: 'pending',
      });

    if (insertError) return { success: false, error: insertError.message };

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

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Verification submission failed' };
  }
}
