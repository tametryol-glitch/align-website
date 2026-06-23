import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Rush Nation — Privacy Policy',
  description: 'Privacy policy for the Rush Nation Bahamian Junkanoo community app.',
};

export default function RushNationPrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0B0E14', color: '#F4F7FB' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px' }}>
        <p style={{ color: '#FFC83D', fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>
          RUSH NATION
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 4px' }}>Privacy Policy</h1>
        <p style={{ color: '#9AA7BC', marginBottom: 32 }}>Last updated: June 17, 2026</p>

        <Section title="Who we are">
          Rush Nation (&ldquo;the App&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a Bahamian
          Junkanoo cultural community platform, operated by its developer
          (contact: tametryol@gmail.com). The App is built on Supabase, which provides our
          database, authentication, and media storage.
        </Section>

        <Section title="Information we collect">
          <strong>You provide:</strong>
          <ul>
            <li>Account details: email address and password (passwords are stored securely by our
              authentication provider and are never visible to us).</li>
            <li>Profile details: username, display name, bio, profile/cover photos, your Junkanoo
              role, and your home/favorite island.</li>
            <li>Content you create: posts, comments, reactions, recognitions
              (&ldquo;flowers&rdquo;), groups, events, and business listings.</li>
            <li>Media you upload: photos and videos attached to posts, profiles, or listings.</li>
            <li>Business listing details: business name, description, phone, email, website, and
              location (only if you choose to create a listing).</li>
          </ul>
          <strong>Collected automatically:</strong> basic technical data needed to operate the
          service (authentication tokens, timestamps, and content you have interacted with).
          We do <strong>not</strong> collect precise GPS location, contacts, or advertising
          identifiers, and we do <strong>not</strong> sell your personal information.
        </Section>

        <Section title="How we use your information">
          <ul>
            <li>To create and secure your account.</li>
            <li>To show your content to the right audience based on your privacy choices
              (public, followers, group members, or private).</li>
            <li>To enforce group privacy — private and hidden group content is only shown to
              approved members.</li>
            <li>To send in-app notifications (comments, reactions, follows, recognition).</li>
            <li>To operate community safety features (reporting, blocking, moderation).</li>
            <li>To maintain, troubleshoot, and improve the App.</li>
          </ul>
        </Section>

        <Section title="How your content is shared">
          <ul>
            <li><strong>Public</strong> content is visible to anyone using the App.</li>
            <li><strong>Group</strong> content follows the group&rsquo;s privacy setting; private
              and hidden group posts are restricted to approved members.</li>
            <li><strong>Recognition</strong> visibility follows the setting chosen by the giver
              (public, private, or group-only).</li>
            <li><strong>Business listings</strong> are part of a public directory.</li>
          </ul>
        </Section>

        <Section title="Children's privacy">
          Rush Nation is intended for users aged 13 and older. We do not knowingly collect
          information from children under 13. If you believe a child has provided us information,
          contact us and we will remove it.
        </Section>

        <Section title="Your choices and rights">
          You can edit or delete your posts, comments, and listings at any time, block other users,
          and report content. To request deletion of your account and associated data, email
          tametryol@gmail.com. We will delete your account data within 30 days, except where
          retention is required for legal or safety reasons.
        </Section>

        <Section title="Data storage and security">
          Your data is stored with Supabase and protected by row-level security so users can only
          see content permitted to them. While we take reasonable measures to protect your data, no
          method of transmission or storage is 100% secure.
        </Section>

        <Section title="Third-party services">
          <ul>
            <li><strong>Supabase</strong> — database, authentication, and media storage.</li>
            <li><strong>Expo / Google Play</strong> — app distribution and diagnostics.</li>
          </ul>
        </Section>

        <Section title="Changes to this policy">
          We may update this policy from time to time. Material changes will be reflected by the
          &ldquo;Last updated&rdquo; date above.
        </Section>

        <Section title="Contact">
          Questions about this policy: <strong>tametryol@gmail.com</strong>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 10px', color: '#19C3D6' }}>{title}</h2>
      <div style={{ lineHeight: 1.7, color: '#D7DEEA', fontSize: 16 }}>{children}</div>
    </section>
  );
}
