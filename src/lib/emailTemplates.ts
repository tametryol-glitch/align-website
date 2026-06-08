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

  // -------------------------------------------------------------------------
  // Re-engagement emails — sent to dormant users via scheduleReengagementEmails
  // -------------------------------------------------------------------------

  /**
   * Day 7 inactive — gentle nudge about missed transits.
   */
  day7_inactive: (name: string) => ({
    subject: 'The stars have been busy while you were away ✨',
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#ffffff;">A lot has shifted, ${name}</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        While you have been away, the planets have not stopped moving. Several transits have
        crossed key points in your birth chart this week, and some of them may explain
        shifts you have been feeling in your mood, relationships, or motivation.
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        Your personalized transit timeline is waiting for you inside Align. Come back
        and see how the cosmos has been shaping your week — you might be surprised by
        what the stars have to say.
      </p>
      <!-- Highlight box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#1a1f35;border-radius:12px;">
        <tr><td style="padding:16px;">
          <p style="margin:0 0 8px;font-size:14px;color:#a855f7;font-weight:600;">Did you know?</p>
          <p style="margin:0;font-size:14px;line-height:1.5;color:#c4c8e0;">
            Even a few days away can mean missing critical planetary aspects that directly
            affect your energy, clarity, and decision-making. Checking in regularly helps
            you stay aligned with the cosmic flow.
          </p>
        </td></tr>
      </table>
      ${ctaButton('See What You Missed', `${APP_URL}/dashboard`)}
      <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7196;text-align:center;">
        Your transit insights update daily — there is always something new to discover.
      </p>
    `),
  }),

  /**
   * Day 14 inactive — curiosity/FOMO about likes and matches.
   */
  day14_inactive: (name: string) => ({
    subject: 'Someone may have liked your profile 💜',
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#ffffff;">${name}, you have admirers</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        Since you have been away, other members have been browsing profiles — and yours
        may have caught someone's eye. New likes and compatibility matches could be
        waiting for you right now.
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        Align's cosmic compatibility engine matches you with people whose charts
        harmonize with yours. These are not random connections — they are written in the stars.
      </p>
      <!-- Stats highlight -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#1a1f35;border-radius:12px;">
        <tr><td style="padding:16px;text-align:center;">
          <p style="margin:0 0 4px;font-size:28px;font-weight:700;color:#a855f7;">?</p>
          <p style="margin:0;font-size:14px;color:#c4c8e0;">
            potential likes waiting for you
          </p>
        </td></tr>
      </table>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        Do not keep them waiting too long — the cosmic window for connection
        is always moving. Log in and see who the universe has in mind for you.
      </p>
      ${ctaButton('Check Your Likes', `${APP_URL}/dating/likes`)}
      <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7196;text-align:center;">
        New matches appear as members join. Check back often.
      </p>
    `),
  }),

  /**
   * Day 30 inactive — emotional win-back with a free reading offer.
   */
  day30_inactive: (name: string) => ({
    subject: 'We miss your cosmic energy 🌙',
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#ffffff;">It has been a while, ${name}</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        A full month has passed since we last saw you, and the cosmos has not slowed down.
        Major planetary shifts have been reshaping the energetic landscape — including
        significant movements through your chart that you may want to know about.
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        We want to welcome you back with something special:
      </p>
      <!-- Gift box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:linear-gradient(135deg,#1a1040,#1e2240);border-radius:12px;border:1px solid #7c3aed;">
        <tr><td style="padding:20px;text-align:center;">
          <p style="margin:0 0 4px;font-size:28px;">🎁</p>
          <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#a855f7;">A Free Reading — On Us</p>
          <p style="margin:0;font-size:14px;line-height:1.5;color:#c4c8e0;">
            Come back to Align and unlock a complimentary personalized reading.
            No strings attached — consider it a cosmic welcome-back gift.
          </p>
        </td></tr>
      </table>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        Your birth chart is still here, fully mapped and ready. All the insights, transits,
        and compatibility scores you have been missing are just a tap away.
      </p>
      ${ctaButton('Claim Your Free Reading', `${APP_URL}/readings`)}
      <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7196;text-align:center;">
        This offer is available for a limited time. We hope to see you soon.
      </p>
    `),
  }),

  // -------------------------------------------------------------------------
  // Weekly digest — sent to active users via scheduleWeeklyDigestEmails
  // -------------------------------------------------------------------------

  /**
   * Weekly cosmic digest with transit highlights and community activity.
   */
  weekly_digest: (name: string) => ({
    subject: 'Your Cosmic Week Ahead ☀️',
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#ffffff;">Happy new week, ${name}!</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        Here is your cosmic snapshot for the week ahead. The planets are always in motion,
        and staying tuned in helps you make the most of every energy shift.
      </p>
      <!-- Transit highlights -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#1a1f35;border-radius:12px;">
        <tr><td style="padding:16px;">
          <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:#a855f7;">This Week's Transit Highlights</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:6px 0;font-size:14px;color:#c4c8e0;">
              <span style="color:#f59e0b;margin-right:8px;">&#9679;</span>
              Key planetary aspects are activating — check your dashboard for personal impacts
            </td></tr>
            <tr><td style="padding:6px 0;font-size:14px;color:#c4c8e0;">
              <span style="color:#f59e0b;margin-right:8px;">&#9679;</span>
              Lunar phases this week may influence emotions and intuition
            </td></tr>
            <tr><td style="padding:6px 0;font-size:14px;color:#c4c8e0;">
              <span style="color:#f59e0b;margin-right:8px;">&#9679;</span>
              Your personalized transit timeline has been updated with new insights
            </td></tr>
          </table>
        </td></tr>
      </table>
      <!-- Community activity -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#1a1f35;border-radius:12px;">
        <tr><td style="padding:16px;">
          <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:#a855f7;">Community Pulse</p>
          <p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#c4c8e0;">
            New members have joined the Align community this week. Fresh compatibility
            matches and cosmic conversations are happening — do not miss out on the connections
            the universe has lined up for you.
          </p>
        </td></tr>
      </table>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        Dive into your full personalized forecast inside Align. Your chart has the details
        the stars want you to see this week.
      </p>
      ${ctaButton('See Full Forecast', `${APP_URL}/dashboard`)}
      <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7196;text-align:center;">
        Sent every week to keep you cosmically aligned.
      </p>
    `),
  }),

  // -------------------------------------------------------------------------
  // Affiliate program emails
  // -------------------------------------------------------------------------

  affiliateApproved: (name: string, code: string) => ({
    subject: `You're in, ${name}! Your Align affiliate account is live`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#ffffff;">Welcome to the Align Affiliate Program!</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        Great news, ${name} — your application has been <strong style="color:#22c55e;">approved</strong>.
        You can start earning <strong style="color:#a855f7;">20% recurring commission</strong> on every
        subscriber you refer to Align.
      </p>
      <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#ffffff;font-weight:600;">
        Your affiliate details:
      </p>
      <!-- Code + link box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#1a1f35;border-radius:12px;">
        <tr><td style="padding:20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;font-size:14px;color:#6b7196;">Affiliate Code</td>
              <td style="padding:8px 0;font-size:14px;color:#a855f7;font-weight:700;text-align:right;font-family:monospace;">${code}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:14px;color:#6b7196;">Your Referral Link</td>
              <td style="padding:8px 0;font-size:13px;color:#a855f7;font-weight:600;text-align:right;">
                <a href="${APP_URL}/ref/${code}" style="color:#a855f7;text-decoration:underline;">${APP_URL}/ref/${code}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:14px;color:#6b7196;">Commission Rate</td>
              <td style="padding:8px 0;font-size:14px;color:#22c55e;font-weight:700;text-align:right;">20% recurring</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:14px;color:#6b7196;">Cookie Window</td>
              <td style="padding:8px 0;font-size:14px;color:#ffffff;font-weight:600;text-align:right;">30 days</td>
            </tr>
          </table>
        </td></tr>
      </table>
      <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        Here is how it works:
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 20px;">
        <tr><td style="padding:8px 0;font-size:15px;color:#c4c8e0;">
          <span style="color:#a855f7;font-weight:700;margin-right:8px;">1.</span>
          Share your referral link with your audience
        </td></tr>
        <tr><td style="padding:8px 0;font-size:15px;color:#c4c8e0;">
          <span style="color:#a855f7;font-weight:700;margin-right:8px;">2.</span>
          Anyone who signs up through your link gets <strong style="color:#22c55e;">10% off their first 2 months</strong>
        </td></tr>
        <tr><td style="padding:8px 0;font-size:15px;color:#c4c8e0;">
          <span style="color:#a855f7;font-weight:700;margin-right:8px;">3.</span>
          When they subscribe, you earn 20% recurring commission
        </td></tr>
        <tr><td style="padding:8px 0;font-size:15px;color:#c4c8e0;">
          <span style="color:#a855f7;font-weight:700;margin-right:8px;">4.</span>
          Track your earnings in real time on your dashboard
        </td></tr>
      </table>
      <!-- Referral perk callout -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:#1a2e1a;border:1px solid #22c55e33;border-radius:12px;">
        <tr><td style="padding:16px;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#22c55e;">Promote this to your audience:</p>
          <p style="margin:0;font-size:14px;line-height:1.5;color:#c4c8e0;">
            &ldquo;Sign up through my link and get <strong style="color:#ffffff;">10% off your first 2 months</strong> of Align!&rdquo;
          </p>
        </td></tr>
      </table>
      ${ctaButton('View Your Affiliate Dashboard', `${APP_URL}/affiliates/dashboard`)}
      <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7196;text-align:center;">
        Questions about the program? Reply to this email — we are here to help.
      </p>
    `),
  }),

  affiliateRejected: (name: string, reason?: string) => ({
    subject: `Update on your Align affiliate application`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#ffffff;">Hi ${name},</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        Thank you for your interest in the Align Affiliate Program. After reviewing your
        application, we are unable to approve it at this time.
      </p>
      ${reason ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#1a1f35;border-radius:12px;">
        <tr><td style="padding:16px;">
          <p style="margin:0 0 8px;font-size:14px;color:#f59e0b;font-weight:600;">Reason</p>
          <p style="margin:0;font-size:14px;line-height:1.5;color:#c4c8e0;">${reason}</p>
        </td></tr>
      </table>` : ''}
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        This is not necessarily permanent. You are welcome to reapply in the future if
        your circumstances change. If you believe this was a mistake, feel free to reply
        to this email and we will take another look.
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4c8e0;">
        In the meantime, you can still enjoy everything Align has to offer as a member.
      </p>
      ${ctaButton('Explore Align', `${APP_URL}/dashboard`)}
      <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7196;text-align:center;">
        We appreciate your support and interest in Align.
      </p>
    `),
  }),
};

export type EmailTemplateKey = keyof typeof EMAIL_TEMPLATES;
