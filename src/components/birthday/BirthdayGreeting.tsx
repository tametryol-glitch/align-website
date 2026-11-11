'use client';

// Full-screen birthday greeting for the celebrant, shown once on first open (today, or
// belated if the birthday already passed this month). Mounted globally in layout.

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { BirthdayArt } from './BirthdayArt';

interface Greeting { post_id: string; chart_data: any; wish_count: number }

export function BirthdayGreeting() {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [g, setG] = useState<Greeting | null>(null);
  const suppressed = pathname?.startsWith('/zodisphere/embed') || pathname?.startsWith('/zodisphere/globe3d/embed') || pathname?.startsWith('/auth') || pathname?.startsWith('/onboarding');

  useEffect(() => {
    if (!user || suppressed) return;
    let live = true;
    (async () => {
      try {
        const { data } = await createClient().rpc('get_my_birthday_greeting');
        const row = Array.isArray(data) ? data[0] : data;
        if (live && row) setG(row as Greeting);
      } catch { /* greeting is optional */ }
    })();
    return () => { live = false; };
  }, [user, suppressed]);

  if (!g || !user) return null;
  const d = g.chart_data || {};

  async function done(goToWishes: boolean) {
    const post = g!.post_id;
    setG(null);
    try { await createClient().rpc('ack_birthday_greeting'); } catch { /* shown again next open */ }
    if (goToWishes) router.push(`/p/${post}`);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 overflow-y-auto">
      <div className="w-full max-w-md my-auto">
        <BirthdayArt hero name={d.name} avatarUrl={d.avatar_url} belated={!!d.belated}
                     headline={d.headline} emoji={d.emoji} advice={d.advice} action={d.action} moon={d.moon} />
        <p className="text-center text-sm text-white/90 mt-3">
          {g.wish_count > 0
            ? `Your tribe has already sent ${g.wish_count} wish${g.wish_count === 1 ? '' : 'es'} 💛`
            : 'Your tribe is getting ready to celebrate you 💛'}
        </p>
        <div className="flex gap-2 mt-3">
          <button onClick={() => done(true)} className="flex-1 py-3 rounded-xl bg-gradient-accent text-white font-semibold">
            See my wishes
          </button>
          <button onClick={() => done(false)} className="flex-1 py-3 rounded-xl bg-white/15 text-white font-semibold">
            Thank you 💛
          </button>
        </div>
      </div>
    </div>
  );
}
