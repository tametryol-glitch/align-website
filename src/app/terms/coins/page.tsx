import Link from 'next/link';
import Image from 'next/image';

/**
 * /terms/coins — the purchase-side terms for Align coins and gifts.
 *
 * Deliberately under /terms, which middleware already treats as public.
 * A payment processor's reviewer fetches this without an account, and a
 * login gate here reads as "no published refund policy". It also keeps a
 * future /coins storefront out of the public allowlist, since that one
 * does need auth.
 */

export const metadata = {
  title: 'Coins, Gifts & Refunds',
  description:
    'Terms covering Align coins and virtual gifts: what coins are, how refunds work, and how unauthorized purchases are handled.',
};

const UPDATED = 'September 7, 2026';

export default function CoinTermsPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto border-b border-border-primary">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Align" width={32} height={32} className="w-8 h-8 rounded-lg" />
          <span className="text-lg font-display font-bold text-text-primary">Align</span>
        </Link>
        <Link href="/terms" className="text-sm text-accent-primary hover:text-accent-secondary">
          All terms
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
          Coins, Gifts &amp; Refunds
        </h1>
        <p className="text-text-muted text-sm mb-3">Last updated: {UPDATED}</p>

        {/* Coins cannot be bought yet. The purchase, limit and refund
            terms below describe a system that is not yet operating. */}
        <div className="mb-8 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          <strong className="font-semibold">Gifting is in preview.</strong> Coins cannot
          currently be purchased — they are granted free, have no cash value, and are spent
          only on gifts inside Align. The buying, limit and refund terms below take effect
          when coin sales open.
        </div>

        <div className="max-w-none space-y-8 text-text-secondary text-[15px] leading-relaxed">
          <Section title="1. What coins are">
            <p>
              Coins are a limited, personal, non-transferable and revocable licence to access
              digital features within Align. They are{' '}
              <strong className="text-text-primary">not money</strong>, not a stored-value
              instrument, and carry no cash value.
            </p>
            <p>
              Coins cannot be sold, traded, transferred or gifted between user accounts, and
              cannot be exchanged for cash by the purchaser. Align does not provide, and coins
              may not be used for, any form of person-to-person money transfer.
            </p>
            <p>
              Coins do not expire while your account remains open and in good standing.
            </p>
          </Section>

          <Section title="2. Buying coins">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Every purchase screen shows the price in your local currency, not only in
                coins, before you confirm.
              </li>
              <li>
                Purchases made inside a mobile app are processed by that app store. Purchases
                made on this website are processed by our payment provider.
              </li>
              <li>You must be at least 18 to buy coins, or have the consent of a parent or guardian.</li>
            </ul>
          </Section>

          <Section title="3. Purchase limits">
            <p>
              These limits apply to every account and exist to protect you against accidental
              or unauthorized spending.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-text-primary">$99.99</strong> maximum in a single transaction.</li>
              <li><strong className="text-text-primary">$200</strong> in any rolling 24-hour period.</li>
              <li><strong className="text-text-primary">$1,000</strong> in any rolling 30-day period.</li>
              <li><strong className="text-text-primary">$50 per day</strong> during your account&rsquo;s first seven days.</li>
              <li>
                You may set your own lower limit at any time in settings. Lowering it takes
                effect immediately; raising it takes effect 24 hours later.
              </li>
              <li>
                We may ask you to re-authenticate once your spending passes $200 in a rolling
                30-day period.
              </li>
            </ul>
          </Section>

          <Section title="4. Gifts">
            <p>
              Coins may be spent on virtual gifts during a live broadcast. A gift is consumed
              at the moment it is sent, is visible to others in that broadcast, and cannot be
              recalled or reversed.
            </p>
            <p>
              Sending a gift credits the host with an earning under our{' '}
              <Link href="/terms/creator-payouts" className="text-accent-primary underline">
                Creator Payout Terms
              </Link>
              . It does not transfer money to them directly, and it does not create any
              payment relationship between you and the host.
            </p>
          </Section>

          <Section title="5. Refunds">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Coins are delivered immediately on purchase. By completing a purchase you
                request immediate delivery and acknowledge that any statutory right of
                withdrawal you may have is lost once delivery begins.
              </li>
              <li>
                Coins spent on a gift are consumed at the moment the gift is sent and are not
                refundable.
              </li>
              <li>
                Unspent coins may be refunded at our discretion within 14 days of purchase,
                where no part of that purchase has been spent.
              </li>
              <li>
                Purchases made inside a mobile app are governed by that app store&rsquo;s
                refund policy, not this one. Contact the store directly.
              </li>
              <li>
                Nothing in this section limits any right you have that cannot be waived under
                the law where you live.
              </li>
            </ul>
          </Section>

          <Section title="6. Unauthorized purchases">
            <p>
              Report an unauthorized purchase within 60 days and we will investigate. Where a
              purchase was made without the account holder&rsquo;s authority — including by a
              minor without the consent of a parent or guardian — we will refund it and remove
              the corresponding coins, together with any earnings credited to a host from
              gifts funded by that purchase.
            </p>
            <p>
              Contact us at{' '}
              <a className="text-accent-primary underline" href="mailto:support@alignastrology.app">
                support@alignastrology.app
              </a>{' '}
              with the date and amount of the charge.
            </p>
          </Section>

          <Section title="7. If your balance ends">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                If we discontinue coins entirely, unspent balances are refunded pro rata at the
                price paid.
              </li>
              <li>If you close your account, unspent coins are forfeited.</li>
              <li>
                If we terminate an account for fraud or a breach of these terms, unspent coins
                are forfeited.
              </li>
            </ul>
          </Section>

          <Section title="8. Changes">
            <p>
              We may update these terms. Coins already purchased remain subject to the pricing
              and refund terms in effect at the time of purchase. Continued use after a change
              takes effect constitutes acceptance of the revised terms.
            </p>
          </Section>

          <Section title="9. Contact">
            <p>
              Questions about coins, gifts or a refund? Email{' '}
              <a className="text-accent-primary underline" href="mailto:support@alignastrology.app">
                support@alignastrology.app
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-text-primary mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
