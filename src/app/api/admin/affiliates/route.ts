import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { sendEmail } from '@/lib/emailService';
import { EMAIL_TEMPLATES } from '@/lib/emailTemplates';

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

// GET /api/admin/affiliates — list affiliates with optional status filter
export async function GET(req: NextRequest) {
  try {
    const adminId = await verifyAdmin(req);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const admin = getAdminClient();
    const status = req.nextUrl.searchParams.get('status');

    let query = admin
      .from('affiliates')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(0, 99);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Also get summary stats
    const { data: allAffs } = await admin.from('affiliates').select('status, total_earnings_cents, total_paid_cents, unpaid_cents');
    const stats = {
      total: allAffs?.length || 0,
      pending: allAffs?.filter(a => a.status === 'pending').length || 0,
      approved: allAffs?.filter(a => a.status === 'approved').length || 0,
      rejected: allAffs?.filter(a => a.status === 'rejected').length || 0,
      suspended: allAffs?.filter(a => a.status === 'suspended').length || 0,
      totalEarnings: allAffs?.reduce((s, a) => s + (a.total_earnings_cents || 0), 0) || 0,
      totalPaid: allAffs?.reduce((s, a) => s + (a.total_paid_cents || 0), 0) || 0,
      totalUnpaid: allAffs?.reduce((s, a) => s + (a.unpaid_cents || 0), 0) || 0,
    };

    return NextResponse.json({ affiliates: data || [], total: count || 0, stats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/affiliates — record a payout to an affiliate
export async function POST(req: NextRequest) {
  try {
    const adminId = await verifyAdmin(req);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { affiliateId, amountCents, method, payoutEmail, transactionRef, notes } = body;

    if (!affiliateId || !amountCents || amountCents <= 0) {
      return NextResponse.json({ error: 'affiliateId and amountCents (>0) required' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Verify affiliate exists and has enough unpaid balance
    const { data: aff, error: affErr } = await admin
      .from('affiliates')
      .select('id, unpaid_cents, total_paid_cents, name, email')
      .eq('id', affiliateId)
      .single();

    if (affErr || !aff) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
    }

    if ((aff.unpaid_cents || 0) < amountCents) {
      return NextResponse.json(
        { error: `Payout $${(amountCents / 100).toFixed(2)} exceeds unpaid balance $${((aff.unpaid_cents || 0) / 100).toFixed(2)}` },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();

    // Insert payout record
    const { error: insertErr } = await admin.from('affiliate_payouts').insert({
      affiliate_id: affiliateId,
      amount_cents: amountCents,
      method: method || 'paypal',
      payout_email: payoutEmail || aff.email,
      transaction_ref: transactionRef || null,
      notes: notes || null,
      status: 'completed',
      completed_at: now,
    });

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // Update affiliate totals
    const newUnpaid = Math.max(0, (aff.unpaid_cents || 0) - amountCents);
    const newPaid = (aff.total_paid_cents || 0) + amountCents;

    await admin
      .from('affiliates')
      .update({ unpaid_cents: newUnpaid, total_paid_cents: newPaid })
      .eq('id', affiliateId);

    // Mark pending conversions as paid (up to the payout amount)
    await admin
      .from('affiliate_conversions')
      .update({ status: 'paid' })
      .eq('affiliate_id', affiliateId)
      .eq('status', 'approved');

    return NextResponse.json({
      ok: true,
      payout: {
        affiliate: aff.name,
        amount: `$${(amountCents / 100).toFixed(2)}`,
        method: method || 'paypal',
        newUnpaidBalance: `$${(newUnpaid / 100).toFixed(2)}`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/admin/affiliates — update affiliate status
export async function PATCH(req: NextRequest) {
  try {
    const adminId = await verifyAdmin(req);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { affiliateId, status, rejectionReason } = body;

    if (!affiliateId || !status) {
      return NextResponse.json({ error: 'affiliateId and status required' }, { status: 400 });
    }

    const admin = getAdminClient();
    const updates: Record<string, any> = { status };
    const now = new Date().toISOString();

    if (status === 'approved') updates.approved_at = now;
    if (status === 'rejected') {
      updates.rejected_at = now;
      updates.rejection_reason = rejectionReason || null;
    }

    const { data, error } = await admin
      .from('affiliates')
      .update(updates)
      .eq('id', affiliateId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Send notification email on approval or rejection
    if (data?.email && data?.name) {
      try {
        if (status === 'approved' && data.affiliate_code) {
          const { subject, html } = EMAIL_TEMPLATES.affiliateApproved(data.name, data.affiliate_code);
          await sendEmail(data.email, subject, html);
        } else if (status === 'rejected') {
          const { subject, html } = EMAIL_TEMPLATES.affiliateRejected(data.name, rejectionReason);
          await sendEmail(data.email, subject, html);
        }
      } catch (emailErr) {
        // Don't fail the status update if email fails
        console.error('[Affiliate] Email notification failed:', emailErr);
      }
    }

    return NextResponse.json({ ok: true, affiliate: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
