'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function CommunityGuidelinesPage() {
  const { t } = useTranslation();
  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/settings" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> {t('common.settings')}
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
        <BookOpen className="w-7 h-7 text-accent-primary" />
        {t('settings.communityGuidelines.title')}
      </h1>

      <div className="card space-y-6">
        <p className="text-xs text-accent-secondary">Effective Date: March 30, 2026</p>

        <p className="text-sm text-text-secondary leading-relaxed">
          Align is a space for cosmic exploration, self-discovery, and meaningful connection. These guidelines ensure our community remains safe, respectful, and empowering for everyone.
        </p>

        <section>
          <h3 className="text-sm font-semibold text-text-primary mb-2">1. Be Respectful</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Treat everyone with kindness and respect. We are a diverse community united by curiosity about the cosmos. Harassment, bullying, hate speech, discrimination, and personal attacks are never tolerated.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-text-primary mb-2">2. Keep It Safe</h3>
          <ul className="text-sm text-text-secondary space-y-1.5 list-disc list-inside">
            <li>Do not share personal contact information (phone numbers, addresses, financial details) publicly.</li>
            <li>Never solicit money, gifts, or financial information from other users.</li>
            <li>Do not impersonate other users, public figures, or Align staff.</li>
            <li>Report any suspicious or harmful behavior immediately using the report button.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-text-primary mb-2">3. Appropriate Content</h3>
          <ul className="text-sm text-text-secondary space-y-1.5 list-disc list-inside">
            <li>Posts, photos, and videos must be appropriate for all audiences.</li>
            <li>No nudity, sexually explicit content, graphic violence, or disturbing imagery.</li>
            <li>No promotion of illegal activities, substances, or self-harm.</li>
            <li>Astrology discussions should remain constructive — avoid fearmongering or making definitive negative predictions about others.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-text-primary mb-2">4. Authentic Interactions</h3>
          <ul className="text-sm text-text-secondary space-y-1.5 list-disc list-inside">
            <li>Be genuine — use your real identity and birth data for accurate readings.</li>
            <li>Do not create fake profiles, bots, or automated accounts.</li>
            <li>Do not spam the feed, messages, or comments with repetitive or promotional content.</li>
            <li>Do not use Align to advertise products, services, or other apps.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-text-primary mb-2">5. Respect Privacy</h3>
          <ul className="text-sm text-text-secondary space-y-1.5 list-disc list-inside">
            <li>Do not share screenshots of private messages without consent.</li>
            <li>Do not share another person&apos;s birth data, chart, or readings without their permission.</li>
            <li>Respect the privacy settings of other users.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-text-primary mb-2">6. Responsible Astrology</h3>
          <p className="text-sm text-text-secondary leading-relaxed mb-2">
            Align provides astrological insights for entertainment and self-reflection. Please remember:
          </p>
          <ul className="text-sm text-text-secondary space-y-1.5 list-disc list-inside">
            <li>Astrology readings are not medical, legal, or financial advice.</li>
            <li>Do not use compatibility readings to harass or stalk other users.</li>
            <li>Avoid making deterministic claims — astrology shows tendencies, not certainties.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-text-primary mb-2">7. Reporting & Enforcement</h3>
          <p className="text-sm text-text-secondary leading-relaxed mb-2">
            If you see content or behavior that violates these guidelines, please report it using the report button on any post or profile. Our team reviews all reports.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">Violations may result in:</p>
          <ul className="text-sm text-text-secondary mt-1 space-y-1 list-disc list-inside">
            <li>Content removal</li>
            <li>Temporary account suspension</li>
            <li>Permanent account termination for severe or repeated violations</li>
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-text-primary mb-2">8. Age Requirement</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            You must be at least 13 years old to use Align. Users under 18 should have parental consent. If you believe a user is underage, please report the account.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-text-primary mb-2">9. Changes to Guidelines</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            We may update these guidelines as our community grows. Continued use of Align constitutes acceptance of any changes.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-text-primary mb-2">Contact Us</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Questions or concerns? Contact us at: Tametryol@gmail.com
          </p>
        </section>

        <p className="text-xs text-text-muted text-center pt-4">&copy; 2026 Align. All rights reserved.</p>
      </div>
    </div>
  );
}
