import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { runFaceVerification } from '@/lib/faceVerificationService';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return req.cookies.get(name)?.value; },
          set() {},
          remove() {},
        },
      },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
