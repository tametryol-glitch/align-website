'use client';

/**
 * Landing page for a shared link: /u profile, /c chart, /g community.
 * (/p post and /r reel have their own richer pages.)
 *
 * The link is what a member sends to a friend, so the visitor may have no
 * account and may or may not have the app:
 *  - Signed-in member → forwarded to the real page on the web.
 *  - Everyone else → "Open in Align" (hands off to the app), Google Play, and
 *    sign-up / log-in. Nothing about the shared item is fetched or shown to a
 *    logged-out visitor: this page holds no data, so it cannot leak any.
 *
 * On Android with the app installed, the verified app link normally opens the
 * app before this page loads at all (see /api/assetlinks).
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

type Kind = 'profile' | 'chart' | 'community';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const COPY: Record<Kind, { path: string; heading: string; body: string }> = {
  profile: {
    path: '/u/',
    heading: 'Someone shared their profile with you',
    body: 'Open it in Align to see their cosmic profile and connect.',
  },
  chart: {
    path: '/c/',
    heading: 'Someone shared a chart with you',
    body: 'Open it in Align to see the full birth chart reading.',
  },
  community: {
    path: '/g/',
    heading: 'You have been invited to a community',
    body: 'Open it in Align to join the conversation.',
  },
};

async function webTarget(kind: Kind, id: string): Promise<string> {
  const safe = encodeURIComponent(id);
  if (kind === 'community') return `/communities/${safe}`;
  if (kind === 'chart') return `/chart/saved?id=${safe}`;
  // Profiles are shared by user id OR by short align code.
  if (UUID_RE.test(id)) return `/user/${safe}`;
  try {
    const { data } = await createClient()
      .from('profiles')
      .select('id')
      .eq('align_code', id)
      .maybeSingle();
    if (data?.id) return `/user/${data.id}`;
  } catch {
    /* fall through */
  }
  return '/feed';
}

export function DeepLinkLanding({ kind, id }: { kind: Kind; id: string }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const copy = COPY[kind];

  useEffect(() => {
    if (isLoading || !isAuthenticated || !id) return;
    let cancelled = false;
    webTarget(kind, id).then((target) => {
      if (!cancelled) router.replace(target);
    });
    return () => { cancelled = true; };
  }, [isLoading, isAuthenticated, kind, id, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const appUrl = `align:${copy.path}${encodeURIComponent(id)}`;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Align" width={32} height={32} className="w-8 h-8 rounded-lg" />
          <span className="text-lg font-bold text-text-primary">Align</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Log in
          </Link>
          <Link href="/auth/signup" className="bg-accent-primary hover:bg-accent-primary/90 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors">
            Sign up
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-primary">{copy.heading}</h1>
            <p className="text-sm text-text-muted">{copy.body}</p>
          </div>

          <div className="space-y-3">
            <a
              href={appUrl}
              className="block w-full bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold py-3 rounded-xl transition-colors text-center"
            >
              Open in Align
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.align.astrology"
              className="block w-full bg-bg-tertiary hover:bg-bg-elevated text-text-secondary font-medium py-3 rounded-xl transition-colors text-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get the app on Google Play
            </a>
            <Link
              href="/auth/signup"
              className="block text-sm text-accent-secondary hover:underline mt-2"
            >
              Or sign up to view it on the web
            </Link>
          </div>

          <p className="text-xs text-text-muted">
            Align is the cosmic social app. Astrology, charts, compatibility, and community.
          </p>
        </div>
      </div>
    </div>
  );
}
