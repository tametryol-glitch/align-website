/**
 * Affiliate Program Service
 *
 * Handles affiliate link tracking, cookie-based attribution,
 * application submission, and dashboard data fetching.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://align-api-v2-production.up.railway.app/api/v1';

const AFFILIATE_COOKIE = 'align_aff';
const AFFILIATE_CLICK_ID = 'align_aff_click';

// ── Cookie helpers ────────────────────────────────────────────────

export function setAffiliateCookie(affiliateId: string, cookieDays: number, clickId?: string) {
  const expires = new Date(Date.now() + cookieDays * 86400000).toUTCString();
  document.cookie = `${AFFILIATE_COOKIE}=${affiliateId}; expires=${expires}; path=/; SameSite=Lax`;
  if (clickId) {
    document.cookie = `${AFFILIATE_CLICK_ID}=${clickId}; expires=${expires}; path=/; SameSite=Lax`;
  }
  // Also store in localStorage as fallback (with expiry timestamp)
  try {
    const expiresAt = Date.now() + cookieDays * 86400000;
    localStorage.setItem(AFFILIATE_COOKIE, affiliateId);
    localStorage.setItem('align_aff_expires', String(expiresAt));
    if (clickId) localStorage.setItem(AFFILIATE_CLICK_ID, clickId);
  } catch {}
}

export function getAffiliateAttribution(): { affiliateId: string | null; clickId: string | null } {
  // Try cookie first
  let affiliateId = getCookie(AFFILIATE_COOKIE);
  let clickId = getCookie(AFFILIATE_CLICK_ID);

  // Fallback to localStorage (check expiry)
  if (!affiliateId) {
    try {
      const expiresAt = Number(localStorage.getItem('align_aff_expires') || '0');
      if (expiresAt && Date.now() > expiresAt) {
        // Expired — clear stale attribution
        localStorage.removeItem(AFFILIATE_COOKIE);
        localStorage.removeItem(AFFILIATE_CLICK_ID);
        localStorage.removeItem('align_aff_expires');
      } else {
        affiliateId = localStorage.getItem(AFFILIATE_COOKIE);
        clickId = localStorage.getItem(AFFILIATE_CLICK_ID);
      }
    } catch {}
  }

  return { affiliateId: affiliateId || null, clickId: clickId || null };
}

export function clearAffiliateAttribution() {
  document.cookie = `${AFFILIATE_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = `${AFFILIATE_CLICK_ID}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  try {
    localStorage.removeItem(AFFILIATE_COOKIE);
    localStorage.removeItem(AFFILIATE_CLICK_ID);
    localStorage.removeItem('align_aff_expires');
  } catch {}
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// ── API calls ─────────────────────────────────────────────────────

export async function trackAffiliateClick(affiliateCode: string): Promise<{
  ok: boolean;
  affiliate_id?: string;
  cookie_days?: number;
  click_id?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/affiliates/track-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        affiliate_code: affiliateCode,
        visitor_id: getOrCreateVisitorId(),
        referrer_url: document.referrer || undefined,
        landing_page: window.location.href,
        user_agent: navigator.userAgent,
      }),
    });
    return await res.json();
  } catch {
    return { ok: false };
  }
}

export async function verifyAffiliateCode(code: string): Promise<{
  valid: boolean;
  name?: string;
  status?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/affiliates/verify/${encodeURIComponent(code)}`);
    return await res.json();
  } catch {
    return { valid: false };
  }
}

export async function applyAsAffiliate(data: {
  name: string;
  email: string;
  website?: string;
  social_handle?: string;
  promo_method?: string;
  user_id?: string;
}): Promise<{ ok: boolean; affiliate_code?: string; message?: string; detail?: string }> {
  try {
    const res = await fetch(`${API_BASE}/affiliates/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { ok: false, detail: 'Network error' };
  }
}

export async function attributeSignup(affiliateCode: string, userId: string, source = 'web') {
  try {
    await fetch(`${API_BASE}/affiliates/attribute-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ affiliate_code: affiliateCode, user_id: userId, source }),
    });
  } catch {}
}

export async function getMyAffiliate(token: string) {
  const res = await fetch(`${API_BASE}/affiliates/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Not an affiliate');
  return res.json();
}

export async function getMyClicks(token: string, limit = 50, offset = 0) {
  const res = await fetch(`${API_BASE}/affiliates/me/clicks?limit=${limit}&offset=${offset}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getMyConversions(token: string, limit = 50, offset = 0) {
  const res = await fetch(`${API_BASE}/affiliates/me/conversions?limit=${limit}&offset=${offset}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getMyPayouts(token: string) {
  const res = await fetch(`${API_BASE}/affiliates/me/payouts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// ── Visitor ID (anonymous, for click dedup) ───────────────────────

function getOrCreateVisitorId(): string {
  const KEY = 'align_visitor_id';
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return `v-${Date.now()}`;
  }
}
