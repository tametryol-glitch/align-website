// Email onboarding templates — inline-styled HTML for maximum email client compatibility.
// Dark theme (#141826) matching the Align app, with purple gradient CTAs.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.aligncosmic.com';

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
        Explore everything Align has to offer.
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
        This feature is available with Align Premium.
      </p>
    `),
  }),

  /**
   * Day 7 — Upgrade nudge, highlight premium features.
   */
  day7: (name: string) => ({
    subject: `${name}, unlock the full power of your chart`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#ffffff;">Ready to go deeper, ${name}?</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        You have been exploring Align for a week now. Premium members unlock features that
        take their cosmic journey to the next level:
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
        <tr><td style="padding:8px 0;font-size:15px;color:#c4c8e0;">
          <span style="color:#a855f7;font-weight:600;margin-right:8px;">&#10003;</span>
          Personalized daily transit forecasts
        </td></tr>
        <tr><td style="padding:8px 0;font-size:15px;color:#c4c8e0;">
          <span style="color:#a855f7;font-weight:600;margin-right:8px;">&#10003;</span>
          AI-powered chart interpretations
        </td></tr>
        <tr><td style="padding:8px 0;font-size:15px;color:#c4c8e0;">
          <span style="color:#a855f7;font-weight:600;margin-right:8px;">&#10003;</span>
          Compatibility and synastry readings
        </td></tr>
        <tr><td style="padding:8px 0;font-size:15px;color:#c4c8e0;">
          <span style="color:#a855f7;font-weight:600;margin-right:8px;">&#10003;</span>
          Tarot, numerology, and dream oracle
        </td></tr>
      </table>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        All of this for just <strong style="color:#a855f7;">$9/month</strong> — less than a coffee a week
        for daily cosmic guidance tailored to your exact birth chart.
      </p>
      ${ctaButton('Upgrade to Premium', `${APP_URL}/pricing`)}
      <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7196;text-align:center;">
        Questions? Reply to this email — we read every message.
      </p>
    `),
  }),

  birthDataReminder: (name: string) => ({
    subject: `${name}, your readings won't be accurate without this`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#ffffff;">${name}, we need your birth details</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        We noticed your birth information is incomplete. Without accurate birth data,
        <strong style="color:#f59e0b;">Align cannot generate accurate readings for you.</strong>
        Your birth chart, transits, compatibility scores, and every personalized feature
        depends on having the right details.
      </p>
      <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#ffffff;font-weight:600;">
        What we need from you:
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 20px;">
        <tr><td style="padding:10px 0;font-size:15px;color:#c4c8e0;">
          <span style="color:#a855f7;font-weight:700;margin-right:8px;">1.</span>
          <strong style="color:#ffffff;">Date of Birth</strong> — the exact day, month, and year
        </td></tr>
        <tr><td style="padding:10px 0;font-size:15px;color:#c4c8e0;">
          <span style="color:#a855f7;font-weight:700;margin-right:8px;">2.</span>
          <strong style="color:#ffffff;">Time of Birth</strong> — as precise as possible
        </td></tr>
        <tr><td style="padding:10px 0;font-size:15px;color:#c4c8e0;">
          <span style="color:#a855f7;font-weight:700;margin-right:8px;">3.</span>
          <strong style="color:#ffffff;">Place of Birth</strong> — the city and country where you were born
        </td></tr>
      </table>
      <!-- Birth time tip -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#1a1f35;border-radius:12px;">
        <tr><td style="padding:16px;">
          <p style="margin:0 0 8px;font-size:14px;color:#a855f7;font-weight:600;">Don't know your exact birth time?</p>
          <p style="margin:0;font-size:14px;line-height:1.5;color:#c4c8e0;">
            An approximate time is always better than no time at all. Check your birth certificate,
            ask a parent, or look at hospital records. If you truly cannot find it,
            <strong style="color:#ffffff;">use 12:00 PM (midday)</strong> as a universal default —
            it will still give you meaningful results for most features.
          </p>
        </td></tr>
      </table>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        Updating takes less than a minute. Tap the button below to complete your profile
        and unlock the full power of your cosmic blueprint.
      </p>
      ${ctaButton('Complete My Birth Details', `${APP_URL}/onboarding`)}
      <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7196;text-align:center;">
        Your readings are only as accurate as the birth data you provide.
      </p>
    `),
  }),

  issueResolved: (name: string) => ({
    subject: `${name}, we fixed a login issue — you're all set now`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#ffffff;">Hey ${name}, we owe you an update</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        We recently discovered a technical issue that was preventing some users from
        completing the onboarding process. If you experienced trouble getting past the
        setup screen, <strong style="color:#a855f7;">that has now been fixed.</strong>
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        You can now log in and complete your cosmic profile without any problems.
        We sincerely apologize for the inconvenience and appreciate your patience.
      </p>
      ${ctaButton('Log In to Align', `${APP_URL}/auth/login`)}
      <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7196;text-align:center;">
        If you run into any other issues, reply to this email — we read every message.
      </p>
    `),
  }),
};

export type EmailTemplateKey = keyof typeof EMAIL_TEMPLATES;
