import { createClient } from '@supabase/supabase-js';

interface FaceCompareResult {
  match: boolean;
  confidence: number;
  provider: string;
  raw?: any;
}

type VerificationDecision = 'approved' | 'needs_review' | 'rejected';

const THRESHOLDS = {
  autoApprove: 80,
  manualReview: 45,
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function compareFacesFacePP(
  imageUrl1: string,
  imageUrl2: string,
): Promise<FaceCompareResult> {
  const apiKey = process.env.FACE_API_KEY;
  const apiSecret = process.env.FACE_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error('FACE_API_KEY and FACE_API_SECRET not configured');
  }

  const endpoint = process.env.FACE_API_ENDPOINT || 'https://api-us.faceplusplus.com/facepp/v3/compare';

  const form = new FormData();
  form.append('api_key', apiKey);
  form.append('api_secret', apiSecret);
  form.append('image_url1', imageUrl1);
  form.append('image_url2', imageUrl2);

  const res = await fetch(endpoint, { method: 'POST', body: form });
  const data = await res.json();

  if (data.error_message) {
    return { match: false, confidence: 0, provider: 'facepp', raw: data };
  }

  const confidence = data.confidence ?? 0;
  return {
    match: confidence >= THRESHOLDS.autoApprove,
    confidence,
    provider: 'facepp',
    raw: data,
  };
}

async function compareFacesAWS(
  imageUrl1: string,
  imageUrl2: string,
): Promise<FaceCompareResult> {
  const region = process.env.AWS_REGION || 'us-east-1';
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!accessKey || !secretKey) {
    throw new Error('AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY not configured');
  }

  const [img1Res, img2Res] = await Promise.all([
    fetch(imageUrl1),
    fetch(imageUrl2),
  ]);
  const [img1Buf, img2Buf] = await Promise.all([
    img1Res.arrayBuffer(),
    img2Res.arrayBuffer(),
  ]);

  let sdk: any;
  try {
    const mod = '@aws-sdk/client-rekognition';
    sdk = await (Function('m', 'return import(m)')(mod));
  } catch {
    throw new Error('Install @aws-sdk/client-rekognition to use AWS provider: npm i @aws-sdk/client-rekognition');
  }

  const client = new sdk.RekognitionClient({
    region,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  });

  const command = new sdk.CompareFacesCommand({
    SourceImage: { Bytes: new Uint8Array(img1Buf) },
    TargetImage: { Bytes: new Uint8Array(img2Buf) },
    SimilarityThreshold: 0,
  });

  const result = await client.send(command);
  const topMatch = result.FaceMatches?.[0];
  const confidence = topMatch?.Similarity ?? 0;

  return {
    match: confidence >= THRESHOLDS.autoApprove,
    confidence,
    provider: 'aws-rekognition',
    raw: {
      faceMatches: result.FaceMatches?.length ?? 0,
      unmatchedFaces: result.UnmatchedFaces?.length ?? 0,
    },
  };
}

async function compareFaces(
  imageUrl1: string,
  imageUrl2: string,
): Promise<FaceCompareResult> {
  const provider = process.env.FACE_API_PROVIDER || 'facepp';

  if (provider === 'aws') {
    return compareFacesAWS(imageUrl1, imageUrl2);
  }
  return compareFacesFacePP(imageUrl1, imageUrl2);
}

function hasFaceApiCredentials(): boolean {
  const provider = process.env.FACE_API_PROVIDER || 'facepp';
  if (provider === 'aws') {
    return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  }
  return !!(process.env.FACE_API_KEY && process.env.FACE_API_SECRET);
}

function decideStatus(confidence: number): VerificationDecision {
  if (confidence >= THRESHOLDS.autoApprove) return 'approved';
  if (confidence >= THRESHOLDS.manualReview) return 'needs_review';
  return 'rejected';
}

export async function runFaceVerification(verificationId: string): Promise<{
  status: VerificationDecision;
  confidence: number;
  provider: string;
}> {
  const supabase = getAdminClient();

  const { data: verification, error: vErr } = await supabase
    .from('photo_verifications')
    .select('id, user_id, selfie_url, status')
    .eq('id', verificationId)
    .single();

  if (vErr || !verification) {
    throw new Error('Verification record not found');
  }

  if (verification.status !== 'pending') {
    throw new Error(`Verification already processed: ${verification.status}`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('photo_urls')
    .eq('id', verification.user_id)
    .single();

  const photoUrls: string[] = profile?.photo_urls || [];

  if (photoUrls.length === 0) {
    await supabase.from('photo_verifications').update({
      status: 'needs_review',
      ai_result: { error: 'no_profile_photos', message: 'User has no profile photos to compare against' },
    }).eq('id', verificationId);

    return { status: 'needs_review', confidence: 0, provider: 'none' };
  }

  if (!hasFaceApiCredentials()) {
    await supabase.from('photo_verifications').update({
      status: 'needs_review',
      ai_result: { error: 'no_api_configured', message: 'Face comparison API not configured — manual review required' },
    }).eq('id', verificationId);

    return { status: 'needs_review', confidence: 0, provider: 'manual' };
  }

  let bestResult: FaceCompareResult = { match: false, confidence: 0, provider: 'none' };
  const allResults: FaceCompareResult[] = [];

  for (const photoUrl of photoUrls) {
    try {
      const result = await compareFaces(verification.selfie_url, photoUrl);
      allResults.push(result);
      if (result.confidence > bestResult.confidence) {
        bestResult = result;
      }
      if (result.confidence >= THRESHOLDS.autoApprove) break;
    } catch {
      allResults.push({ match: false, confidence: 0, provider: 'error' });
    }
  }

  const decision = decideStatus(bestResult.confidence);

  const updateData: Record<string, any> = {
    status: decision,
    confidence_score: bestResult.confidence,
    ai_result: {
      provider: bestResult.provider,
      best_confidence: bestResult.confidence,
      photos_compared: allResults.length,
      decision,
    },
  };

  if (decision === 'approved') {
    updateData.reviewed_at = new Date().toISOString();
  }

  await supabase.from('photo_verifications').update(updateData).eq('id', verificationId);

  if (decision === 'approved') {
    await supabase.from('profiles').update({
      photo_verified: true,
      photo_verified_at: new Date().toISOString(),
    }).eq('id', verification.user_id);
  }

  return {
    status: decision,
    confidence: bestResult.confidence,
    provider: bestResult.provider,
  };
}

export async function adminReviewVerification(
  verificationId: string,
  adminId: string,
  action: 'approve' | 'reject',
  rejectionReason?: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = getAdminClient();

  const { data: admin } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', adminId)
    .single();

  if (!admin?.is_admin) {
    return { success: false, error: 'Not authorized' };
  }

  const { data: verification } = await supabase
    .from('photo_verifications')
    .select('id, user_id, status')
    .eq('id', verificationId)
    .single();

  if (!verification) {
    return { success: false, error: 'Verification not found' };
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  await supabase.from('photo_verifications').update({
    status: newStatus,
    reviewed_at: new Date().toISOString(),
    reviewed_by: adminId,
    rejection_reason: action === 'reject' ? (rejectionReason || 'Did not pass manual review') : null,
  }).eq('id', verificationId);

  if (action === 'approve') {
    await supabase.from('profiles').update({
      photo_verified: true,
      photo_verified_at: new Date().toISOString(),
    }).eq('id', verification.user_id);
  }

  return { success: true };
}
