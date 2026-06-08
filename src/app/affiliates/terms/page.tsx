import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Affiliate Program Terms | Align',
  description: 'Terms and conditions for the Align Affiliate Program.',
};

export default function AffiliateTermsPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto border-b border-border-primary">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Align" width={32} height={32} className="w-8 h-8 rounded-lg" />
          <span className="text-lg font-display font-bold text-text-primary">Align</span>
        </Link>
        <Link href="/affiliates" className="text-sm text-accent-primary hover:text-accent-secondary">
          Affiliate Program
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
          Affiliate Program Terms & Conditions
        </h1>
        <p className="text-text-muted text-sm mb-8">Last updated: June 8, 2026</p>

        <div className="prose prose-invert max-w-none space-y-8 text-text-secondary text-[15px] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">1. Overview</h2>
            <p>
              The Align Affiliate Program allows approved participants (&quot;Affiliates&quot;) to earn
              commissions by referring new paying subscribers to Align (&quot;the Service&quot;). By
              participating in the program, you agree to these terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">2. Eligibility</h2>
            <p>
              To become an Affiliate, you must submit an application and be approved by Align.
              We reserve the right to accept or reject any application at our sole discretion.
              Affiliates must be at least 18 years old and comply with all applicable laws in
              their jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">3. Commission Structure</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Affiliates earn a <strong className="text-text-primary">20% recurring commission</strong> on all subscription payments made by referred users.</li>
              <li>Commissions are calculated on the net amount received by Align (after payment processor fees and applicable taxes).</li>
              <li>Commissions are earned for as long as the referred user maintains their paid subscription.</li>
              <li>Referred users receive a <strong className="text-text-primary">10% discount</strong> on their first 2 months of subscription.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">4. Attribution & Cookie Policy</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Referrals are tracked via a unique affiliate link and a 30-day attribution cookie.</li>
              <li>If a referred user signs up within 30 days of clicking your affiliate link, the referral is attributed to you.</li>
              <li>If a user clears their cookies or uses a different device, attribution may be lost.</li>
              <li>The last affiliate link clicked before signup receives the attribution (last-click model).</li>
              <li>Self-referrals are not permitted. Using your own affiliate link to obtain a discount on your own subscription is prohibited.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">5. Payouts</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>The minimum payout threshold is <strong className="text-text-primary">$50.00 USD</strong>.</li>
              <li>Payouts are processed via PayPal, bank transfer, or another agreed-upon method.</li>
              <li>Payouts are issued on a monthly basis for commissions that have cleared the review period.</li>
              <li>Affiliates are responsible for any taxes owed on commission income in their jurisdiction.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">6. Refunds & Reversals</h2>
            <p>
              If a referred user receives a refund, the corresponding commission will be reversed
              and deducted from your unpaid balance. If the refund amount exceeds your current unpaid
              balance, the negative balance will be carried forward and deducted from future earnings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">7. Prohibited Activities</h2>
            <p>Affiliates must not:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use spam, unsolicited messages, or misleading advertising to promote Align.</li>
              <li>Bid on Align brand terms (e.g. &quot;Align astrology&quot;) in paid search ads.</li>
              <li>Create fake accounts, use bots, or engage in click fraud.</li>
              <li>Misrepresent the features, pricing, or nature of the Align service.</li>
              <li>Use coupon/deal sites as the primary promotion method without prior approval.</li>
              <li>Engage in any activity that violates applicable laws or regulations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">8. Termination</h2>
            <p>
              Align reserves the right to suspend or terminate any affiliate account at any time,
              with or without cause. Common reasons for termination include violation of these terms,
              fraud, or inactivity. Upon termination, any unpaid commissions above the minimum payout
              threshold will be paid within 30 days, provided they were earned through legitimate activity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">9. Modification of Terms</h2>
            <p>
              Align reserves the right to modify these terms at any time. Affiliates will be notified
              of material changes via email. Continued participation in the program after notification
              constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">10. Limitation of Liability</h2>
            <p>
              Align is not liable for any indirect, incidental, or consequential damages arising from
              participation in the affiliate program. Our total liability shall not exceed the amount
              of commissions earned by the affiliate in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">11. Contact</h2>
            <p>
              For questions about these terms or the affiliate program, contact us at{' '}
              <a href="mailto:hello@aligncosmic.com" className="text-accent-primary hover:text-accent-secondary">
                hello@aligncosmic.com
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border-primary text-center">
          <Link href="/affiliates" className="btn-primary inline-block px-8 py-3">
            Apply to Affiliate Program
          </Link>
        </div>
      </div>
    </div>
  );
}
