import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Support — Align',
  description: 'Get help with Align: contact support, manage your subscription, delete your account, or report content.',
  alternates: { canonical: 'https://aligncosmic.com/support' },
};

const SUPPORT_EMAIL = 'support@aligncosmic.com';

export default function SupportPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-text-secondary">
      <h1 className="text-3xl font-display font-bold text-text-primary mb-1">Support</h1>
      <p className="text-sm text-text-muted mb-8">
        We read every message and aim to reply within two business days.
      </p>

      <Section title="Contact Us">
        <p>
          For any question, bug report, billing issue, or account request, email{' '}
          <a className="text-accent-primary underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
        <p>
          To help us resolve things faster, please include the email address on your
          account, your device and operating system, and the app version (shown at the
          bottom of <strong>Settings</strong> in the app).
        </p>
      </Section>

      <Section title="Subscriptions & Billing">
        <ul>
          <li>
            <strong>Manage or cancel</strong> — subscriptions are billed by the App Store
            or Google Play, not by Align directly. Open <strong>Settings → Subscription →
            Manage Subscription</strong> in the app, which links straight to your store
            account. You can also manage them in your device&apos;s account settings.
          </li>
          <li>
            <strong>Restore a purchase</strong> — if you reinstalled the app or switched
            devices, tap <strong>Restore Purchases</strong> on the subscription screen.
          </li>
          <li>
            <strong>Refunds</strong> — refunds are handled by the store that processed the
            payment. Apple and Google each have their own refund request process, and we
            are unable to issue store refunds on your behalf.
          </li>
          <li>
            <strong>Billing problems</strong> — if you were charged incorrectly, email us
            with the store receipt and we will help you sort it out.
          </li>
        </ul>
      </Section>

      <Section title="Your Account">
        <ul>
          <li>
            <strong>Delete your account</strong> — open <strong>Settings → Delete
            Account</strong> in the app. This permanently removes your personal data
            within 30 days.
          </li>
          <li>
            <strong>Password reset</strong> — use <strong>Forgot password</strong> on the
            sign-in screen.
          </li>
          <li>
            <strong>Data requests</strong> — to request a copy of your data, email us from
            your account address.
          </li>
        </ul>
      </Section>

      <Section title="Safety & Reporting">
        <p>
          Align has a community feed, messaging, and calls. If you encounter content or
          behaviour that breaks our rules, report it directly in the app — tap{' '}
          <strong>Report</strong> on any post, or open a profile to report or block that
          person. Reports go to our moderation queue and are reviewed promptly.
        </p>
        <p>
          For urgent safety concerns, email{' '}
          <a className="text-accent-primary underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>{' '}
          with the word <strong>URGENT</strong> in the subject line.
        </p>
      </Section>

      <Section title="Policies">
        <ul>
          <li>
            <Link className="text-accent-primary underline" href="/terms">
              Terms of Service
            </Link>
          </li>
          <li>
            <Link className="text-accent-primary underline" href="/privacy">
              Privacy Policy
            </Link>
          </li>
        </ul>
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
