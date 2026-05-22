import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { adminReviewVerification } from '@/lib/faceVerificationService';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { verificationId, action, rejectionReason } = await req.json();

    if (!verificationId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'verificationId and action (approve|reject) required' }, { status: 400 });
    }

    const result = await adminReviewVerification(verificationId, user.id, action, rejectionReason);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Review failed' },
      { status: 500 },
    );
  }
}
