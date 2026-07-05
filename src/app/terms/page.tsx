import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Align',
  description: 'The terms that govern your use of Align.',
  alternates: { canonical: 'https://aligncosmic.com/terms' },
};

const UPDATED = 'July 2026';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-text-secondary">
      <h1 className="text-3xl font-display font-bold text-text-primary mb-1">Terms of Service</h1>
      <p className="text-sm text-text-muted mb-8">Last updated: {UPDATED}</p>

      <Section title="Acceptance of Terms">
        <p>By accessing or using the Align mobile application or the website at aligncosmic.com (together, the &quot;Service&quot;), you agree to these Terms of Service. If you do not agree, do not use the Service.</p>
      </Section>

      <Section title="Eligibility">
        <p>You must be at least 18 years old to use the Service. Align is an adults-only service; we verify date of birth at sign-up and do not permit accounts for anyone under 18. By using the Service you represent that you are at least 18 years old.</p>
      </Section>

      <Section title="Entertainment and Informational Use Only">
        <p>Align provides astrology, numerology, and related content, including AI-generated interpretations, for entertainment, self-reflection, and educational purposes only. It is not professional advice of any kind — medical, psychological, legal, financial, or otherwise — and should not be relied upon as such. You are solely responsible for the decisions you make.</p>
      </Section>

      <Section title="AI-Generated Content">
        <p>Some readings and interpretations are generated using artificial intelligence (including the Anthropic Claude API). AI-generated content may be inaccurate or incomplete and is provided without warranty. Use your own judgment.</p>
      </Section>

      <Section title="Accounts">
        <p>You are responsible for the information you provide and for maintaining the security of your account. You agree not to misuse the Service, harass other users, post unlawful or infringing content, or attempt to disrupt or reverse-engineer the Service.</p>
      </Section>

      <Section title="User Content">
        <p>You retain ownership of the content you create (posts, photos, videos, messages). By posting, you grant us a limited license to host and display that content as needed to operate the Service. You are responsible for the content you share and must have the rights to share it.</p>
        <p>You must not post content that is unlawful, hateful, sexually exploitative, threatening, or harassing; that impersonates others; or that exposes another person&apos;s private information — including their physical location, home, workplace, or whereabouts — without their consent. Content on geographic surfaces (such as the Zodisphere) may reference places, never other people&apos;s positions.</p>
        <p>Align provides in-app tools to report content, report users, block users, and mute users. We review reports, remove violating content, and may restrict or terminate repeat offenders. If you believe a moderation decision was made in error, contact us at the address below to request a review.</p>
      </Section>

      <Section title="Subscriptions and Payments">
        <p>Some features require a paid subscription, billed through the Apple App Store or Google Play. Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period. Manage or cancel subscriptions in your app store account settings. Payments are handled entirely by Apple and Google.</p>
      </Section>

      <Section title="Termination">
        <p>We may suspend or terminate access to the Service for conduct that violates these Terms or harms other users. You may stop using the Service and delete your account at any time.</p>
      </Section>

      <Section title="Disclaimer and Limitation of Liability">
        <p>The Service is provided &quot;as is&quot; without warranties of any kind. To the maximum extent permitted by law, Align is not liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
      </Section>

      <Section title="Changes to These Terms">
        <p>We may update these Terms from time to time. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.</p>
      </Section>

      <Section title="Contact Us">
        <p>Questions about these Terms? Contact us at <a className="text-accent-primary underline" href="mailto:support@alignastrology.app">support@alignastrology.app</a>.</p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="text-lg font-semibold text-text-primary mb-2">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed">{children}</div>
    </section>
  );
}
