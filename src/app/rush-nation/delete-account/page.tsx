import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Rush Nation — Delete Your Account',
  description: 'How to delete your Rush Nation account and associated data.',
};

export default function RushNationDeleteAccountPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0B0E14', color: '#F4F7FB' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px' }}>
        <p style={{ color: '#FFC83D', fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>RUSH NATION</p>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 4px' }}>Delete Your Account</h1>
        <p style={{ color: '#9AA7BC', marginBottom: 32 }}>Last updated: June 17, 2026</p>

        <Section title="Delete in the app (fastest)">
          <ol style={{ paddingLeft: 20, lineHeight: 1.8 }}>
            <li>Open the Rush Nation app and sign in.</li>
            <li>Go to <strong>Settings</strong>.</li>
            <li>Tap <strong>Delete account</strong> and confirm.</li>
          </ol>
          <p>This permanently deletes your account and your associated data.</p>
        </Section>

        <Section title="Request deletion by email">
          <p>
            If you can&rsquo;t access the app, email <strong>tametryol@gmail.com</strong> from the email
            address on your account with the subject &ldquo;Delete my account.&rdquo; We&rsquo;ll verify it&rsquo;s you and
            process the deletion.
          </p>
        </Section>

        <Section title="What gets deleted">
          <p>Deleting your account removes the personal data associated with it, including:</p>
          <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
            <li>Your account and login details, profile, bio, and photos.</li>
            <li>Your posts, comments, reactions, and recognitions.</li>
            <li>Your messages, groups you own, events, and business listings.</li>
            <li>Media (photos and videos) you uploaded.</li>
          </ul>
        </Section>

        <Section title="Timing and retention">
          <p>
            Your account data is permanently deleted within <strong>30 days</strong> of the request. We may retain a
            limited amount of information where required for legal, security, or fraud-prevention reasons, and we may
            keep anonymized, aggregated data that no longer identifies you.
          </p>
        </Section>

        <Section title="Contact">
          <p>Questions about deletion: <strong>tametryol@gmail.com</strong></p>
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
