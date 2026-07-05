import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Align',
  description: 'How Align collects, uses, and protects your information.',
  alternates: { canonical: 'https://aligncosmic.com/privacy' },
};

const UPDATED = 'July 2026';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-text-secondary">
      <h1 className="text-3xl font-display font-bold text-text-primary mb-1">Privacy Policy</h1>
      <p className="text-sm text-text-muted mb-8">Last updated: {UPDATED}</p>

      <Section title="Introduction">
        <p>Align (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the Align mobile application and the website at aligncosmic.com (together, the &quot;Service&quot;). This Privacy Policy explains what information we collect, how we use it, and the choices you have. By using the Service you agree to this policy.</p>
      </Section>

      <Section title="Information You Provide">
        <ul>
          <li><strong>Account information</strong> — your email address, name or display name, and password (passwords are stored only as secure hashes by our authentication provider).</li>
          <li><strong>Birth data</strong> — date, time, and place of birth that you voluntarily enter so we can calculate your astrological charts.</li>
          <li><strong>Partner / synastry data</strong> — birth details of other people you choose to enter for compatibility and relationship readings.</li>
          <li><strong>Profile and social content</strong> — profile photos, bio, posts, comments, reactions, and messages you create, plus your friends, followers, and following lists.</li>
          <li><strong>Media</strong> — photos, videos, and audio you upload or record (for example, posts, profile pictures, voice/video messages, and videos you edit in the app).</li>
          <li><strong>Chosen community place (optional)</strong> — if you opt in to the Zodisphere community map, the city, region, or country you manually select to represent you. This is off by default, is never derived from your device, and can be changed or removed at any time in your Zodisphere visibility settings.</li>
        </ul>
      </Section>

      <Section title="Location">
        <p>Align does not request device location permissions and does not collect GPS, precise, background, or real-time location. The only geographic information we hold is what you type or select yourself: your place of birth (for chart calculations) and, if you opt in, a coarse community place for the Zodisphere. Your position is never shown to anyone — community activity on the Zodisphere appears only as city- or country-level ranges (for example &quot;25–49 members&quot;), and only where at least 10 members have opted in. Location metadata is removed from photos before they are published to the Zodisphere.</p>
      </Section>

      <Section title="Information Collected Automatically">
        <ul>
          <li><strong>Device information</strong> — device type, operating system, and app version.</li>
          <li><strong>Usage data</strong> — features used and general interaction patterns, used to improve the Service.</li>
          <li><strong>Push notification tokens</strong> — to deliver transit alerts and other notifications you opt into.</li>
        </ul>
      </Section>

      <Section title="How We Use Your Information">
        <ul>
          <li>Generate personalized astrological charts, transits, returns, synastry, and readings.</li>
          <li>Produce AI-written interpretations of your chart and relationships.</li>
          <li>Provide social features, messaging, and voice/video calls.</li>
          <li>Transcribe audio you choose to caption in the video editor.</li>
          <li>Send notifications and transit alerts you opt into.</li>
          <li>Process subscriptions through the Apple App Store and Google Play.</li>
          <li>Maintain security, prevent abuse, and improve the Service.</li>
        </ul>
      </Section>

      <Section title="Third-Party Services">
        <p>We share the minimum data necessary with service providers that help us run the Service:</p>
        <ul>
          <li><strong>Supabase</strong> — database, authentication, and file storage.</li>
          <li><strong>Anthropic (Claude API)</strong> — AI-written chart and relationship interpretations. Birth and chart data may be sent to generate readings; Anthropic does not use this data to train its models.</li>
          <li><strong>OpenAI (Whisper)</strong> — transcribes audio you choose to caption in the video editor.</li>
          <li><strong>RevenueCat</strong> — subscription management.</li>
          <li><strong>Agora</strong> — real-time voice and video calls.</li>
          <li><strong>Giphy</strong> — GIF search within messaging.</li>
          <li><strong>Sentry</strong> — crash and error diagnostics to keep the app stable.</li>
          <li><strong>Expo</strong> — delivery of push notifications.</li>
          <li><strong>Apple &amp; Google</strong> — payment processing. We never receive or store your payment card details.</li>
        </ul>
      </Section>

      <Section title="Data Storage and Security">
        <ul>
          <li>Your data is stored in encrypted databases hosted by Supabase.</li>
          <li>Data in transit is protected with industry-standard TLS/SSL encryption.</li>
          <li>Payment processing is handled entirely by Apple and Google.</li>
        </ul>
      </Section>

      <Section title="Your Rights and Choices">
        <ul>
          <li>Access the personal data we hold about you.</li>
          <li>Request deletion of your account and all associated data.</li>
          <li>Export your birth profiles and personal data.</li>
          <li>Opt out of push notifications at any time.</li>
          <li>Update or correct your information.</li>
          <li>Change or remove your Zodisphere place and visibility at any time (visibility is off by default); every change is recorded in your consent history.</li>
          <li>Decline or revoke media permissions in your device settings.</li>
        </ul>
        <p>To exercise any of these rights, contact us using the details below or use the in-app account controls.</p>
      </Section>

      <Section title="Data Retention">
        <ul>
          <li>Account data is retained while your account is active.</li>
          <li>When you delete your account, your personal data is permanently removed within 30 days.</li>
          <li>Anonymized, aggregated analytics may be retained to improve the Service.</li>
        </ul>
      </Section>

      <Section title="Age Requirement">
        <p>Align is an adults-only service for users 18 and older. We verify date of birth at sign-up and do not permit accounts for anyone under 18, and we do not knowingly collect personal information from minors. If you believe someone under 18 has provided us personal information, contact us and we will delete it.</p>
      </Section>

      <Section title="Changes to This Policy">
        <p>We may update this Privacy Policy from time to time. Material changes will be communicated through the app or by email, and the &quot;Last updated&quot; date above will change.</p>
      </Section>

      <Section title="Contact Us">
        <p>For privacy questions or requests, contact us at <a className="text-accent-primary underline" href="mailto:privacy@alignastrology.app">privacy@alignastrology.app</a>.</p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="text-lg font-semibold text-text-primary mb-2">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:marker:text-accent-primary">
        {children}
      </div>
    </section>
  );
}
