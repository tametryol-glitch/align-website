import { NextRequest, NextResponse } from 'next/server';

// Temporary test endpoint — DELETE after debugging
export async function GET(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'No RESEND_API_KEY set' }, { status: 500 });
  }

  const to = 'fenyxxrhising@gmail.com';
  const subject = 'Align Email Test — Please Confirm Receipt';
  const html = `<div style="font-family:sans-serif;padding:20px;">
    <h2>Test Email from Align</h2>
    <p>If you received this, the email system is working.</p>
    <p>Sent at: ${new Date().toISOString()}</p>
  </div>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Align <hello@aligncosmic.com>',
        reply_to: 'tametryol@gmail.com',
        to: [to],
        subject,
        html,
      }),
    });

    const body = await res.json();
    return NextResponse.json({
      resendStatus: res.status,
      resendOk: res.ok,
      resendResponse: body,
      sentTo: to,
      apiKeyPrefix: apiKey.slice(0, 8) + '...',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
