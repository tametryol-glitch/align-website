import Link from 'next/link';
import Image from 'next/image';

/**
 * /terms/creator-payouts — the earning side of the coin economy.
 *
 * Public for the same reason as /terms/coins: a payment processor's
 * reviewer needs to read how creators are paid without an account, and
 * a host deciding whether to broadcast should not have to sign in to
 * find out what they earn.
 */

export const metadata = {
  title: 'Creator Payout Terms',
  description:
    'How Align hosts earn from live gifts: the rate, the holding period, monthly payouts, and when earnings are reversed.',
};

const UPDATED = 'September 7, 2026';

export default function CreatorPayoutTermsPage() {
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
          Creator Payout Terms
        </h1>
        <p className="text-text-muted text-sm mb-3">Last updated: {UPDATED}</p>

        {/* Gifting runs with money switched off. Without this notice the
            page below reads as a live commitment to pay, and a host who
            streamed for a month would be right to expect it. */}
        <div className="mb-8 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          <strong className="font-semibold">Gifting is in preview.</strong> Coins are granted
          free and cannot be bought, no earnings accrue, and gifts sent during preview do not
          earn. The rate and payout terms below take effect when coin sales and payouts open,
          and apply only to gifts received from that date.
        </div>

        <div className="max-w-none space-y-8 text-text-secondary text-[15px] leading-relaxed">
          <Section title="1. Who can earn">
            <p>
              Any host eligible to broadcast on Align may earn from gifts sent during their
              live streams. Eligibility is met by any one of the following:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-text-primary">1,000 followers</strong>, or</li>
              <li><strong className="text-text-primary">300 referred signups</strong> as an approved affiliate, or</li>
              <li><strong className="text-text-primary">20 paid conversions</strong> as an approved affiliate.</li>
            </ul>
            <p>
              You must be at least 18 years old to receive a payout, and you must comply with
              our{' '}
              <Link href="/terms" className="text-accent-primary underline">
                Terms of Service
              </Link>{' '}
              and content rules at all times.
            </p>
          </Section>

          <Section title="2. What you earn">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                You earn <strong className="text-text-primary">$0.0035 for every coin</strong>{' '}
                received as a gift during your live broadcast.
              </li>
              <li>
                The rate is the same wherever the viewer bought their coins, so the same gift
                is always worth the same to you.
              </li>
              <li>
                Your balance is a record of an amount Align owes you. It is not a bank account
                and holds no funds on your behalf.
              </li>
              <li>
                Gifts funded by you, or by an account you control, do not earn. Neither do
                gifts sent to an account that is suspended or has lost eligibility.
              </li>
            </ul>
          </Section>

          <Section title="3. Holding period">
            <p>
              Earnings become withdrawable{' '}
              <strong className="text-text-primary">30 days</strong> after the broadcast in
              which they were received. This covers the period during which the viewer&rsquo;s
              original purchase can still be refunded or disputed.
            </p>
            <p>
              Earnings inside the holding period appear in your dashboard but are not yet
              payable.
            </p>
          </Section>

          <Section title="4. Getting paid">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Payouts run monthly, on or about the{' '}
                <strong className="text-text-primary">15th</strong>, covering earnings that
                became withdrawable by the end of the previous month.
              </li>
              <li>
                The minimum payout is <strong className="text-text-primary">$50</strong>.
                Balances below that roll forward to the next month.
              </li>
              <li>
                Valid tax documentation (W-9 for US creators, W-8BEN otherwise) and payout
                details must be on file before your first payment.
              </li>
              <li>
                Payments are made by bank transfer or PayPal. Any fee charged by your bank or
                payment provider is yours.
              </li>
              <li>
                We report payments to tax authorities where required, including a Form 1099 for
                US creators paid $600 or more in a calendar year. You are responsible for any
                tax owed on your earnings.
              </li>
            </ul>
          </Section>

          <Section title="5. When earnings are reversed">
            <p>
              If a viewer&rsquo;s coin purchase is refunded or charged back, earnings credited
              from gifts funded by that purchase are reversed.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Where those earnings have not yet been paid, they are removed from your
                balance.
              </li>
              <li>
                Where they have already been paid, the amount is deducted from your next
                payout, and a negative balance carries forward until cleared.
              </li>
              <li>
                We may withhold a payout while a dispute or a suspected-fraud investigation is
                open.
              </li>
            </ul>
          </Section>

          <Section title="6. Conduct and termination">
            <p>
              Sexually explicit content, harassment, illegal activity, and any attempt to
              inflate earnings artificially — including gifts funded from accounts you control
              — are grounds for immediate termination.
            </p>
            <p>
              An account terminated for fraud or a breach of these terms{' '}
              <strong className="text-text-primary">forfeits any unpaid balance</strong>. If
              you close your account voluntarily, we will pay any withdrawable balance above
              the minimum in the next payout run.
            </p>
          </Section>

          <Section title="7. Your relationship with Align">
            <p>
              You are an independent creator, not an employee, agent or partner of Align. These
              terms do not create an employment relationship, and nothing here obliges Align to
              feature, promote or distribute your broadcasts.
            </p>
            <p>
              Viewers buy coins from Align, not from you. A gift credits you with an earning
              under these terms; it is not a payment made to you by the viewer.
            </p>
          </Section>

          <Section title="8. Changes">
            <p>
              We may update these terms, including the earning rate. Changes to the rate apply
              only to gifts received after the change takes effect, and we will give at least
              30 days&rsquo; notice of any reduction.
            </p>
          </Section>

          <Section title="9. Contact">
            <p>
              Questions about earnings or a payout? Email{' '}
              <a className="text-accent-primary underline" href="mailto:support@alignastrology.app">
                support@alignastrology.app
              </a>
              . See also our{' '}
              <Link href="/terms/coins" className="text-accent-primary underline">
                Coins, Gifts &amp; Refunds
              </Link>{' '}
              terms.
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
