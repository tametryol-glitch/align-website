'use client';

/**
 * Pick the second person for Composite / Synastry: enter their birth details, or
 * choose a friend (their stored birth data is fetched by profile id, exactly like
 * Soul Places). Emits a profiles-shaped object — what getMyChartBodies consumes.
 */

import { useEffect, useState } from 'react';
import { Loader2, PenLine, Users, Search, User, X, Sparkles } from 'lucide-react';
import { CitySearch } from '@/components/ui/CitySearch';
import { createClient } from '@/lib/supabase';
import { getFriends } from '@/lib/friendService';
import { useSoulFriendsStore, type SoulFriend } from '@/components/zodisphere/three-d/soulFriendsStore';

export interface PartnerProfile {
  display_name?: string;
  birth_date?: string | null;
  birth_time?: string | null;
  birth_location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
}

/** Validate a partner has everything an accurate chart needs. */
export function partnerProblem(p: PartnerProfile, label: string): string | null {
  if (!p.birth_date || p.latitude == null) return `${label} needs a saved birth date and place.`;
  if (!p.birth_time) return `${label} has no exact birth time saved. Lines shift about 15° per hour, so this needs one.`;
  return null;
}

export default function PartnerPicker({
  onPick,
  busy,
  error,
  accent = 'violet',
}: {
  onPick: (partner: PartnerProfile, label: string) => void;
  busy: boolean;
  error?: string | null;
  accent?: 'violet' | 'pink';
}) {
  const injected = useSoulFriendsStore((s) => s.friends);
  const [source, setSource] = useState<'manual' | 'friend'>('friend');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [loc, setLoc] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [tz, setTz] = useState('UTC');
  const [friends, setFriends] = useState<SoulFriend[] | null>(null);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [q, setQ] = useState('');
  const [localErr, setLocalErr] = useState<string | null>(null);

  useEffect(() => {
    if (source !== 'friend' || friends || friendsLoading) return;
    if (injected) { setFriends(injected); return; }
    setFriendsLoading(true);
    getFriends().then((f) => setFriends(f as SoulFriend[])).catch(() => setFriends([])).finally(() => setFriendsLoading(false));
  }, [source, friends, friendsLoading, injected]);

  const pickFriend = async (f: SoulFriend) => {
    setLocalErr(null);
    const { data } = await createClient()
      .from('profiles')
      .select('display_name, birth_date, birth_time, birth_location, latitude, longitude, timezone')
      .eq('id', f.friend_id)
      .single();
    if (!data) { setLocalErr(`Couldn’t load ${f.display_name}’s chart.`); return; }
    onPick(data as PartnerProfile, data.display_name || f.display_name);
  };

  const btn = accent === 'pink'
    ? 'bg-pink-500/30 border-pink-400/40 text-pink-50 hover:bg-pink-500/40'
    : 'bg-violet-500/30 border-violet-400/40 text-violet-50 hover:bg-violet-500/40';
  const tabOn = accent === 'pink' ? 'bg-pink-500/25 text-pink-100' : 'bg-violet-500/25 text-violet-100';
  const shown = (friends || [])
    .slice()
    .sort((a, b) => (a.display_name || '').localeCompare(b.display_name || '', undefined, { sensitivity: 'base' }))
    .filter((f) => !q.trim() || (f.display_name || '').toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="space-y-2">
      <div className="flex items-center rounded-lg border border-white/10 bg-white/5 overflow-hidden text-[12px]">
        <button onClick={() => setSource('friend')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 ${source === 'friend' ? tabOn : 'text-white/60'}`}><Users className="w-3.5 h-3.5" /> A friend</button>
        <button onClick={() => setSource('manual')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 ${source === 'manual' ? tabOn : 'text-white/60'}`}><PenLine className="w-3.5 h-3.5" /> Enter details</button>
      </div>

      {source === 'manual' ? (
        <div className="space-y-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Their name (optional)"
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-[13px] outline-none placeholder:text-white/30" />
          <div className="flex gap-2">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-[13px] outline-none" />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-28 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-[13px] outline-none" />
          </div>
          <CitySearch value={loc} onChange={(l, la, lo, z) => { setLoc(l); setLat(la); setLng(lo); setTz(z); }} placeholder="Their birth city…" />
          <button
            disabled={busy || !date || lat == null || lng == null}
            onClick={() => onPick({ display_name: name || 'Them', birth_date: date, birth_time: time, birth_location: loc, latitude: lat, longitude: lng, timezone: tz }, name || 'Them')}
            className={`w-full flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-[13px] font-medium disabled:opacity-40 ${btn}`}
          >{busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Reading the stars…</> : <><Sparkles className="w-4 h-4" /> Use these details</>}</button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {friendsLoading && <div className="flex items-center gap-2 text-[12px] text-white/50 py-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading friends…</div>}
          {friends && friends.length === 0 && <p className="text-[12px] text-white/55 py-2">No friends yet. Add friends, or use “Enter details.”</p>}
          {friends && friends.length > 0 && (
            <>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5">
                <Search className="w-3.5 h-3.5 text-white/40 shrink-0" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search friends…" className="bg-transparent outline-none text-[13px] text-white w-full placeholder:text-white/30" />
                {q && <button onClick={() => setQ('')} aria-label="Clear"><X className="w-3.5 h-3.5 text-white/40" /></button>}
              </div>
              <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                {shown.map((f) => (
                  <button key={f.friend_id} onClick={() => pickFriend(f)} disabled={busy}
                    className="w-full flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-left hover:bg-white/10 disabled:opacity-50">
                    {f.avatar_url
                      ? <img src={f.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                      : <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0"><User className="w-3.5 h-3.5 text-white/70" /></span>}
                    <span className="text-[13px] text-white truncate">{f.display_name}</span>
                  </button>
                ))}
                {shown.length === 0 && <p className="text-[12px] text-white/45 py-2 px-1">No friends match “{q}”.</p>}
              </div>
            </>
          )}
        </div>
      )}
      {(localErr || error) && <div className="rounded-lg bg-rose-500/10 border border-rose-400/25 px-3 py-2 text-[11px] text-rose-100">{localErr || error}</div>}
    </div>
  );
}
