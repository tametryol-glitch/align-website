import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/emailService';
import { EMAIL_TEMPLATES } from '@/lib/emailTemplates';

// TEMPORARY — delete after confirming email delivery works
export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get('to') || 'tametryol@gmail.com';

  try {
    const { subject, html } = EMAIL_TEMPLATES.affiliateApproved('Test User', 'TEST-CODE-123');
    const result = await sendEmail(to, subject, html);

    return NextResponse.json({
      sentTo: to,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
