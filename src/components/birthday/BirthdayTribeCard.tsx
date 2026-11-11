'use client';

// Top-of-feed "Birthday Tribe" strip: everyone whose birthday is today or earlier this
// month (belated), each with a Wish button. Shown to every member so the tribe never
// misses a birthday. Renders nothing when there are none.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { getInitial } from '@/lib/initials';
import { WishComposer } from './WishComposer';

interface Row {
  post_id: string; subject_id: string; display_name: string | null; avatar_url: string | null;
  birthday_date: string; belated: boolean; wish_count: number; i_wished: boolean; is_me: boolean;
}

function dayLabel(iso: string, belated: boolean) {
  if (!belated) return 'Birthday today 🎂';
  const [, m, d] = iso.split('-');
  return `Belated · ${d}-${m}`; // DD-MM
}

export function BirthdayTribeCard() {
  const { user } = useAuthStore();
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await createClient().rpc('get_birthday_tribe');
      setRows((data as Row[]) || []);
    } catch { /* strip is optional */ }
  }, []);

  useEffect(() => { if (user) load(); }, [user, load]);

  if (!user || rows.length === 0) return null;
  const visible = showAll ? rows : rows.slice(0, 4);

  return (
    <div className="mb-4 rounded-2xl overflow-hidden border border-accent-primary/30"
         style={{ background: 'linear-gradient(135deg,rgba(122,58,120,.25),rgba(42,27,77,.35))' }}>
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <p className="text-sm font-bold">🎂 Birthday Tribe</p>
        <span className="text-[11px] text-text-muted">{rows.length} this month</span>
      </div>
      <div className="px-4 pb-3 space-y-2">
        {visible.map((r) => (
          <div key={r.post_id} className="rounded-xl bg-bg-secondary/60 p-2.5">
            <div className="flex items-center gap-3">
              <Link href={`/user/${r.subject_id}`} className="shrink-0">
                {r.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover ring-2 ring-pink-300/60" />
                ) : (
                  <span className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white ring-2 ring-pink-300/60"
                        style={{ background: 'linear-gradient(135deg,#a78bfa,#f9a8d4)' }}>
                    {getInitial(r.display_name)}
                  </span>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{r.is_me ? 'You' : r.display_name || 'A member'}</p>
                <p className="text-[11px] text-text-muted">{dayLabel(r.birthday_date, r.belated)} · {r.wish_count} wish{r.wish_count === 1 ? '' : 'es'}</p>
              </div>
              {r.is_me ? (
                <Link href={`/p/${r.post_id}`} className="text-xs font-semibold text-accent-primary">See wishes</Link>
              ) : r.i_wished ? (
                <span className="text-xs text-text-muted">Wished ✓</span>
              ) : (
                <button onClick={() => setOpen(open === r.post_id ? null : r.post_id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-accent text-white">
                  Send wish
                </button>
              )}
            </div>
            {open === r.post_id && !r.is_me && (
              <div className="mt-2">
                <WishComposer postId={r.post_id} userId={user.id} name={r.display_name || ''}
                              belated={r.belated} onSent={() => { load(); }} />
              </div>
            )}
          </div>
        ))}
        {rows.length > 4 && (
          <button onClick={() => setShowAll(!showAll)} className="text-xs text-accent-primary font-semibold">
            {showAll ? 'Show less' : `Show all ${rows.length}`}
          </button>
        )}
      </div>
    </div>
  );
}
