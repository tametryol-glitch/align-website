import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function verifyAdmin(req: NextRequest): Promise<string | null> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return req.cookies.get(name)?.value; },
        set() {},
        remove() {},
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = getAdminClient();
  const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', user.id).single();
  return profile?.is_admin ? user.id : null;
}

const PAYOUT_THRESHOLD_CENTS = 5000; // $50 minimum, matches program terms

// GET /api/admin/affiliates/[id] — the full dashboard payload for one affiliate,
// enriched with the SAME derived metrics the affiliate's own /me endpoint returns,
// plus their conversions / clicks / payouts. Powers the admin "view as affiliate" modal.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminId = await verifyAdmin(req);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const admin = getAdminClient();
    const affiliateId = params.id;

    const { data: aff, error: affErr } = await admin
      .from('affiliates')
      .select('*')
      .eq('id', affiliateId)
      .single();

    if (affErr || !aff) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
    const thirtyFiveDaysAgo = new Date(now.getTime() - 35 * 86400000).toISOString();

    // 30-day activity counts
    const [{ count: recentClicks }, { count: recentConversions }] = await Promise.all([
      admin.from('affiliate_clicks').select('id', { count: 'exact', head: true })
        .eq('affiliate_id', affiliateId).gte('clicked_at', thirtyDaysAgo),
      admin.from('affiliate_conversions').select('id', { count: 'exact', head: true })
        .eq('affiliate_id', affiliateId).gte('created_at', thirtyDaysAgo),
    ]);

    const totalClicks = aff.total_clicks || 0;
    const totalEarnings = aff.total_earnings_cents || 0;
    const unpaid = aff.unpaid_cents || 0;
    const epcCents = totalClicks > 0 ? Math.round(totalEarnings / totalClicks) : 0;

    // Next monthly payout date (1st of next month)
    const nextPayout = new Date(Date.UTC(
      now.getUTCMonth() === 11 ? now.getUTCFullYear() + 1 : now.getUTCFullYear(),
      now.getUTCMonth() === 11 ? 0 : now.getUTCMonth() + 1,
      1,
    ));

    // Pending + reversed commission
    const [{ data: pendingRows }, { data: reversedRows }] = await Promise.all([
      admin.from('affiliate_conversions').select('commission_cents')
        .eq('affiliate_id', affiliateId).eq('status', 'pending'),
      admin.from('affiliate_conversions').select('commission_cents')
        .eq('affiliate_id', affiliateId).eq('status', 'reversed'),
    ]);
    const pendingCents = (pendingRows || []).reduce((s, r: any) => s + (r.commission_cents || 0), 0);
    const reversedCents = (reversedRows || []).reduce((s, r: any) => s + (r.commission_cents || 0), 0);
    const reversedCount = (reversedRows || []).length;

    // Recurring-customer health (estimated from purchase/renewal conversions)
    const { data: recurringRows } = await admin
      .from('affiliate_conversions')
      .select('user_id, commission_cents, created_at')
      .eq('affiliate_id', affiliateId)
      .in('conversion_type', ['purchase', 'renewal'])
      .order('created_at', { ascending: false })
      .limit(1000);
    const latestCommByUser: Record<string, number> = {};
    const activeUsers = new Set<string>();
    for (const r of (recurringRows || [])) {
      const uid = (r as any).user_id;
      if (!uid) continue;
      if (!(uid in latestCommByUser)) latestCommByUser[uid] = (r as any).commission_cents || 0;
      if ((r as any).created_at && (r as any).created_at >= thirtyFiveDaysAgo) activeUsers.add(uid);
    }
    const lifetimeCustomers = Object.keys(latestCommByUser).length;
    const activeReferrals = activeUsers.size;
    const churnedCustomers = Math.max(0, lifetimeCustomers - activeReferrals);
    let estMrrCents = 0;
    activeUsers.forEach((uid) => { estMrrCents += latestCommByUser[uid] || 0; });

    // Lists (same limits as the affiliate's own dashboard)
    const [{ data: conversions }, { data: clicks }, { data: payouts }] = await Promise.all([
      admin.from('affiliate_conversions')
        .select('id, conversion_type, revenue_cents, commission_cents, source, status, created_at')
        .eq('affiliate_id', affiliateId).order('created_at', { ascending: false }).limit(50),
      admin.from('affiliate_clicks')
        .select('id, clicked_at, country, referrer_url, landing_page, converted')
        .eq('affiliate_id', affiliateId).order('clicked_at', { ascending: false }).limit(50),
      admin.from('affiliate_payouts')
        .select('*')
        .eq('affiliate_id', affiliateId).order('created_at', { ascending: false }),
    ]);

    const enriched = {
      ...aff,
      affiliate_link: `https://aligncosmic.com/ref/${aff.affiliate_code}`,
      recent_clicks_30d: recentClicks || 0,
      recent_conversions_30d: recentConversions || 0,
      conversion_rate: totalClicks > 0
        ? Math.round((aff.total_conversions / totalClicks) * 1000) / 10
        : 0,
      epc_cents: epcCents,
      payout_threshold_cents: PAYOUT_THRESHOLD_CENTS,
      reached_threshold: unpaid >= PAYOUT_THRESHOLD_CENTS,
      next_payout_date: nextPayout.toISOString().slice(0, 10),
      pending_cents: pendingCents,
      reversed_cents: reversedCents,
      reversed_count: reversedCount,
      active_referrals: activeReferrals,
      lifetime_customers: lifetimeCustomers,
      churned_customers: churnedCustomers,
      est_mrr_cents: estMrrCents,
    };

    return NextResponse.json({
      affiliate: enriched,
      conversions: conversions || [],
      clicks: clicks || [],
      payouts: payouts || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
