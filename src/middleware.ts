import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const RATE_WINDOW = 60_000;
const RATE_MAX = 60;
const hits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(request: NextRequest): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();
  let entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_WINDOW };
    hits.set(key, entry);
  }
  entry.count++;
  if (entry.count > RATE_MAX) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)) } },
    );
  }
  if (hits.size > 10000) {
    const now2 = Date.now();
    hits.forEach((v, k) => {
      if (now2 > v.resetAt) hits.delete(k);
    });
  }
  return null;
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    const limited = checkRateLimit(request);
    if (limited) return limited;
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const PUBLIC_API_ROUTES = ['/api/og', '/api/admin', '/api/cron', '/api/stripe'];

  const pathname = request.nextUrl.pathname;
  const isPublicApi = PUBLIC_API_ROUTES.some(r => pathname.startsWith(r));
  const isPublicPage = pathname === '/' ||
    pathname === '/robots.txt' ||    // crawlers must read these unauthenticated
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/zodisphere/embed') || // chromeless globe renderer for the mobile WebView — holds no data or tokens; the app injects aggregates via postMessage
    pathname.startsWith('/zodisphere/globe3d/embed') || // chromeless 3D globe for the mobile WebView — same token-free pattern; the app injects birth details via postMessage
    pathname.startsWith('/geo/') ||             // public map assets (country GeoJSON) — must load unauthenticated for the embed globe
    pathname.startsWith('/cesium/') ||          // self-hosted CesiumJS engine assets (Workers/Assets/Widgets) — must load unauthenticated or the 3D globe can't initialize
    pathname.startsWith('/rush-nation') ||
    pathname.startsWith('/affiliates') ||
    pathname.startsWith('/ref/') ||
    pathname.startsWith('/join/') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/founder') ||
    pathname.startsWith('/zodiac') ||
    pathname.startsWith('/compatibility') ||
    pathname.startsWith('/personality') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/events') ||
    pathname.startsWith('/birth-chart-calculator') ||
    pathname.startsWith('/hidden-zodiac') ||
    pathname.startsWith('/share') ||
    pathname.startsWith('/moon-sign') ||
    pathname.startsWith('/rising-sign') ||
    pathname.startsWith('/mars-in') ||
    pathname.startsWith('/venus-in') ||
    pathname.startsWith('/mercury-in') ||
    pathname.startsWith('/jupiter-in') ||
    pathname.startsWith('/saturn-in') ||
    pathname.startsWith('/uranus-in') ||
    pathname.startsWith('/neptune-in') ||
    pathname.startsWith('/pluto-in') ||
    pathname.startsWith('/juno-in') ||
    pathname.startsWith('/vesta-in') ||
    pathname.startsWith('/chiron-in') ||
    pathname.startsWith('/north-node-in') ||
    pathname.startsWith('/south-node-in') ||
    pathname.startsWith('/planets-in-houses') ||
    pathname.startsWith('/synastry-aspects');
  const isProtected = !isPublicPage && !isPublicApi;

  if (!user && isProtected) {
    const redirect = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.getAll().forEach(cookie => {
      redirect.cookies.set(cookie);
    });
    return redirect;
  }

  // Redirect authenticated users away from auth pages
  if (user && request.nextUrl.pathname.startsWith('/auth') && !request.nextUrl.pathname.includes('callback')) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  // Feed-first: logged-in users hitting the marketing landing page go
  // straight to the feed (logged-out visitors still see the landing page)
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  // Force onboarding for authenticated users without birth data
  if (user && isProtected && pathname !== '/onboarding' && !pathname.startsWith('/api')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('birth_date, latitude, longitude, timezone')
      .eq('id', user.id)
      .single();

    const needsOnboarding = !profile?.birth_date || profile?.latitude == null || profile?.longitude == null || !profile?.timezone;
    if (needsOnboarding) {
      const redirect = NextResponse.redirect(new URL('/onboarding', request.url));
      response.cookies.getAll().forEach(cookie => {
        redirect.cookies.set(cookie);
      });
      return redirect;
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
