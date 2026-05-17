// Email onboarding templates — inline-styled HTML for maximum email client compatibility.
// Dark theme (#141826) matching the Align app, with purple gradient CTAs.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://alignapp.co';

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0f1a;">
<tr><td align="center" style="padding:24px 16px;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#141826;border-radius:16px;overflow:hidden;">
<!-- Header -->
<tr><td style="padding:32px 32px 16px;text-align:center;">
  <img src="${APP_URL}/logo-email.png" alt="Align" width="48" height="48" style="display:inline-block;border-radius:12px;" />
  <div style="margin-top:8px;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">Align</div>
</td></tr>
<!-- Body -->
<tr><td style="padding:8px 32px 32px;">
${content}
</td></tr>
<!-- Footer -->
<tr><td style="padding:24px 32px;border-top:1px solid #1e2240;text-align:center;">
  <p style="margin:0 0 8px;font-size:12px;color:#6b7196;">You received this email because you signed up for Align.</p>
  <a href="${APP_URL}/settings" style="font-size:12px;color:#8b5cf6;text-decoration:underline;">Manage email preferences</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function ctaButton(text: string, href: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
<tr><td align="center">
  <a href="${href}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;border-radius:28px;letter-spacing:0.3px;">
    ${text}
  </a>
</td></tr>
</table>`;
}

export const EMAIL_TEMPLATES = {
  /**
   * Day 0 — Welcome email, sent immediately on signup.
   */
  welcome: (name: string, sunSign: string) => ({
    subject: `Welcome to Align, ${name}! Your cosmic journey begins`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#ffffff;">Hey ${name}, welcome aboard!</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        You just joined a community of thousands who use the stars to understand themselves better.
        As a <strong style="color:#a855f7;">${sunSign}</strong>, you have a unique cosmic blueprint
        that shapes how you think, feel, and connect.
      </p>
      <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        Here is what is waiting for you:
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
        <tr><td style="padding:8px 0;font-size:15px;color:#c4c8e0;">
          <span style="color:#a855f7;font-weight:600;margin-right:8px;">1.</span>
          Your full birth chart with detailed interpretations
        </td></tr>
        <tr><td style="padding:8px 0;font-size:15px;color:#c4c8e0;">
          <span style="color:#a855f7;font-weight:600;margin-right:8px;">2.</span>
          Daily transit forecasts personalized to your chart
        </td></tr>
        <tr><td style="padding:8px 0;font-size:15px;color:#c4c8e0;">
          <span style="color:#a855f7;font-weight:600;margin-right:8px;">3.</span>
          Compatibility readings with friends and partners
        </td></tr>
      </table>
      ${ctaButton('See Your Birth Chart', `${APP_URL}/chart`)}
      <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7196;text-align:center;">
        Your 7-day Premium trial is active. Explore everything Align has to offer.
      </p>
    `),
  }),

  /**
   * Day 3 — Feature spotlight (transits), social proof.
   */
  day3: (name: string, sunSign: string) => ({
    subject: `${name}, your ${sunSign} transit forecast is ready`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#ffffff;">Your stars are moving, ${name}</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        Did you know that planetary transits affect your mood, energy, and opportunities every single day?
        As a <strong style="color:#a855f7;">${sunSign}</strong>, here is what the cosmos has lined up for you this week.
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        Your personalized transit forecast is ready inside Align. It maps today's planetary positions
        against your birth chart so you know exactly what energies are in play.
      </p>
      <!-- Social proof -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#1a1f35;border-radius:12px;padding:16px;">
        <tr><td style="padding:16px;">
          <p style="margin:0 0 8px;font-size:14px;color:#a855f7;font-weight:600;">What members are saying</p>
          <p style="margin:0;font-size:14px;line-height:1.5;color:#c4c8e0;font-style:italic;">
            "The transit alerts helped me understand why last week felt so intense.
            Now I plan my big decisions around my chart."
          </p>
          <p style="margin:8px 0 0;font-size:13px;color:#6b7196;">- Align Premium member</p>
        </td></tr>
      </table>
      ${ctaButton('View Your Transits', `${APP_URL}/readings/transits`)}
      <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7196;text-align:center;">
        This feature is available during your Premium trial.
      </p>
    `),
  }),

  /**
   * Day 7 — Trial urgency, what they lose, upgrade CTA.
   */
  day7: (name: string, trialDaysLeft: number) => ({
    subject: `${name}, don't miss out — ${trialDaysLeft} days of Premium left`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#ffffff;">Your trial is almost over, ${name}</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        ${trialDaysLeft > 0
          ? `You have <strong style="color:#f59e0b;">${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'}</strong> left on your Premium trial.`
          : `Your Premium trial has ended.`}
        After it expires, you will lose access to:
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
        <tr><td style="padding:8px 0;font-size:15px;color:#c4c8e0;">
          <span style="color:#ef4444;margin-right:8px;">&#10005;</span>
          Personalized daily transit forecasts
        </td></tr>
        <tr><td style="padding:8px 0;font-size:15px;color:#c4c8e0;">
          <span style="color:#ef4444;margin-right:8px;">&#10005;</span>
          AI-powered chart interpretations
        </td></tr>
        <tr><td style="padding:8px 0;font-size:15px;color:#c4c8e0;">
          <span style="color:#ef4444;margin-right:8px;">&#10005;</span>
          Compatibility and synastry readings
        </td></tr>
        <tr><td style="padding:8px 0;font-size:15px;color:#c4c8e0;">
          <span style="color:#ef4444;margin-right:8px;">&#10005;</span>
          Tarot, numerology, and dream oracle
        </td></tr>
      </table>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        Keep everything for just <strong style="color:#a855f7;">$9/month</strong> — less than a coffee a week
        for daily cosmic guidance tailored to your exact birth chart.
      </p>
      ${ctaButton('Upgrade to Premium', `${APP_URL}/pricing`)}
      <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7196;text-align:center;">
        Questions? Reply to this email — we read every message.
      </p>
    `),
  }),
};

export type EmailTemplateKey = keyof typeof EMAIL_TEMPLATES;
