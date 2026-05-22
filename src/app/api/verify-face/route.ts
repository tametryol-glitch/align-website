import { NextRequest, NextResponse } from 'next/server';
import { runFaceVerification } from '@/lib/faceVerificationService';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { verificationId } = await req.json();

    if (!verificationId || typeof verificationId !== 'string') {
      return NextResponse.json({ error: 'verificationId required' }, { status: 400 });
    }

    const result = await runFaceVerification(verificationId);

    return NextResponse.json({
      status: result.status,
      confidence: result.confidence,
      provider: result.provider,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Verification failed' },
      { status: 500 },
    );
  }
}
