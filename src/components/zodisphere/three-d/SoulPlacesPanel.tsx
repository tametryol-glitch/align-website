'use client';

/**
 * Soul Places panel (Zodisphere · Draconic Composite).
 *
 * Founder-gated floating panel. Pick the second person two ways — enter their
 * birth details manually, or choose a friend (their stored birth data is fetched
 * the same way synastry/composite do) — and we compute the draconic-composite
 * astrocartography and list the real places where the two souls' shared imprint
 * runs within 50 miles, each with a "what could have been" reading, plus the
 * single "role" the two of you most likely played. Can also auto-run from a
 * `?soulPartner=<id>` deep-link (e.g. a Cosmic Match).
 *
 * Framing note: evocative "what could have been," never a literal claim that
 * either person was physically at these places in a past life.
 */

import { useState, useEffect, useRef } from 'react';
import { Heart, X, Loader2, MapPin, Sparkles, User, PenLine, Users } from 'lucide-react';
import { CitySearch } from '@/components/ui/CitySearch';
import { createClient } from '@/lib/supabase';
import { getFriends, type FriendProfile } from '@/lib/friendService';
import { countryAt } from '@/components/zodisphere/three-d/locationInspector';
import {
  getDraconicCompositeAcgLines,
  findSoulPlaces,
  summarizeSoulRole,
  type SoulPlace,
  type NearbyPlace,
} from '@/lib/zodisphere/soulPlaces';

const boldToHtml = (s: string) =>
  s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');

/** Trim the couple of long Natural-Earth names so the list stays tidy. */
const SHORT_COUNTRY: Record<string, string> = {
  'United States of America': 'USA',
  'United Kingdom': 'UK',
  'United Arab Emirates': 'UAE',
  'Democratic Republic of the Congo': 'DR Congo',
};
const shortCountry = (c: string | null) => (c ? SHORT_COUNTRY[c] || c : '');

type EnrichedNearby = NearbyPlace & { country: string | null };
interface EnrichedPlace extends Omit<SoulPlace, 'nearby'> {
  country: string | null;
  nearby: EnrichedNearby[];
}

/** A profiles-shaped birth object — exactly what getMyChartBodies consumes. */
interface PartnerProfile {
  display_name?: string;
  birth_date?: string | null;
  birth_time?: string | null;
  birth_location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
}

export default function SoulPlacesPanel({
  profile,
  cities,
  countryFeatures,
  autoPartnerId,
}: {
  profile: any;
  cities: Array<[string, number, number]>;
  countryFeatures: any[];
  autoPartnerId?: string | null;
}) {
  const [open, setOpen] = useState(!!autoPartnerId);
  const [source, setSource] = useState<'manual' | 'friend'>(autoPartnerId ? 'friend' : 'manual');

  // Manual partner entry (normalized to the profiles shape getMyChartBodies wants).
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [loc, setLoc] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [tz, setTz] = useState('UTC');

  // Friend picker.
  const [friends, setFriends] = useState<FriendProfile[] | null>(null);
  const [friendsLoading, setFriendsLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [places, setPlaces] = useState<EnrichedPlace[] | null>(null);
  const [role, setRole] = useState<{ role: string; blurb: string } | null>(null);
  const [withLabel, setWithLabel] = useState<string>('');

  const countryOf = (la: number, ln: number): string | null =>
    countryFeatures?.length ? countryAt(la, ln, countryFeatures) : null;

  const myOk = !!(profile?.birth_date && profile?.birth_time && profile?.latitude != null);
  const partnerOk = !!(date && time && lat != null && lng != null);

  /** The core: compute soul places for a profiles-shaped partner object. */
  const runWith = async (partner: PartnerProfile, label: string) => {
    setErr(null);
    setLoading(true);
    setPlaces(null);
    setRole(null);
    setWithLabel(label);
    try {
      if (!partner.birth_date || partner.latitude == null) {
        setErr(`${label || 'They'} needs a saved birth date and place to compute soul places.`);
        return;
      }
      if (!partner.birth_time) {
        setErr(`${label || 'They'} has no exact birth time saved — soul-lines shift ~15° per hour, so this needs one to be accurate.`);
        return;
      }
      const result = await getDraconicCompositeAcgLines(profile, partner);
      if (!result) {
        setErr('Couldn’t build the composite. Both charts need a birth date, an exact time, and a place.');
        return;
      }
      const found = findSoulPlaces(result, cities, 50, 12);
      const enriched: EnrichedPlace[] = found.map((p) => ({
        ...p,
        country: countryOf(p.lat, p.lng),
        nearby: p.nearby.map((n) => ({ ...n, country: countryOf(n.lat, n.lng) })),
      }));
      setPlaces(enriched);
      setRole(summarizeSoulRole(found));
    } catch (e: any) {
      setErr(e?.message || 'Something went wrong computing your soul places.');
    } finally {
      setLoading(false);
    }
  };

  const runManual = () =>
    runWith(
      { display_name: name || 'Them', birth_date: date, birth_time: time, birth_location: loc, latitude: lat, longitude: lng, timezone: tz },
      name || 'them',
    );

  /** Fetch a person's stored birth data by profile id (same select as synastry). */
  const fetchPartnerById = async (id: string): Promise<{ partner: PartnerProfile; label: string } | null> => {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('display_name, birth_date, birth_time, birth_location, latitude, longitude, timezone')
      .eq('id', id)
      .single();
    if (!data) return null;
    return { partner: data as PartnerProfile, label: data.display_name || 'them' };
  };

  const selectFriend = async (f: FriendProfile) => {
    setLoading(true);
    const res = await fetchPartnerById(f.friend_id);
    if (!res) { setLoading(false); setErr(`Couldn’t load ${f.display_name}'s chart.`); return; }
    await runWith(res.partner, res.label || f.display_name);
  };

  // Load friends the first time the Friend tab is shown.
  useEffect(() => {
    if (source !== 'friend' || friends || friendsLoading) return;
    setFriendsLoading(true);
    getFriends()
      .then((f) => setFriends(f))
      .catch(() => setFriends([]))
      .finally(() => setFriendsLoading(false));
  }, [source, friends, friendsLoading]);

  // Auto-run from a ?soulPartner=<id> deep link (e.g. a Cosmic Match), once.
  const autoRanRef = useRef(false);
  useEffect(() => {
    if (!autoPartnerId || autoRanRef.current || !myOk) return;
    autoRanRef.current = true;
    setOpen(true);
    (async () => {
      setLoading(true);
      const res = await fetchPartnerById(autoPartnerId);
      if (!res) { setLoading(false); setErr('Couldn’t load that person’s chart.'); return; }
      await runWith(res.partner, res.label);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPartnerId, myOk]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="absolute top-16 right-5 z-30 flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/20 backdrop-blur px-3.5 py-2 text-[13px] text-violet-100 shadow-lg hover:bg-violet-500/30"
      >
        <Heart className="w-4 h-4" /> Soul Places
        <span className="text-[9px] uppercase tracking-wide text-violet-300/80 border border-violet-300/30 rounded px-1">beta</span>
      </button>
    );
  }

  return (
    <div className="absolute top-16 right-5 z-30 w-[min(92vw,360px)] max-h-[80vh] overflow-y-auto rounded-2xl border border-violet-400/25 bg-black/75 backdrop-blur text-white shadow-2xl">
      <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/60 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-violet-300" />
          <span className="text-[13px] font-semibold">Soul Places <span className="text-[9px] uppercase tracking-wide text-violet-300/80 border border-violet-300/30 rounded px-1 ml-1">beta</span></span>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close"><X className="w-4 h-4 text-white/50 hover:text-white" /></button>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-[11px] text-white/55 leading-relaxed">
          Where your two <strong>soul</strong> charts blend and fall strongest on Earth — the places that could have held meaning for you together, and the role you may have played. Evocative, not literal.
        </p>

        {!myOk && (
          <div className="rounded-lg bg-amber-400/10 border border-amber-400/25 px-3 py-2 text-[11px] text-amber-100">
            Add your own birth date, exact time, and place first — soul places need both charts.
          </div>
        )}

        {/* Source tabs */}
        <div className="flex items-center rounded-lg border border-white/10 bg-white/5 overflow-hidden text-[12px]">
          <button
            onClick={() => setSource('manual')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 ${source === 'manual' ? 'bg-violet-500/25 text-violet-100' : 'text-white/60'}`}
          ><PenLine className="w-3.5 h-3.5" /> Enter details</button>
          <button
            onClick={() => setSource('friend')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 ${source === 'friend' ? 'bg-violet-500/25 text-violet-100' : 'text-white/60'}`}
          ><Users className="w-3.5 h-3.5" /> A friend</button>
        </div>

        {/* Manual entry */}
        {source === 'manual' && (
          <div className="space-y-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Their name (optional)"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-[13px] outline-none placeholder:text-white/30 focus:border-violet-400/50"
            />
            <div className="flex gap-2">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-[13px] outline-none focus:border-violet-400/50" />
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="w-28 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-[13px] outline-none focus:border-violet-400/50" />
            </div>
            <CitySearch
              value={loc}
              onChange={(location, la, lo, timezone) => { setLoc(location); setLat(la); setLng(lo); setTz(timezone); }}
              placeholder="Their birth city…"
            />
            <p className="text-[10px] text-white/40">An exact birth time matters — the lines shift ~15° per hour.</p>
            <button
              onClick={runManual}
              disabled={!myOk || !partnerOk || loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-violet-500/30 border border-violet-400/40 px-3 py-2.5 text-[13px] font-medium text-violet-50 hover:bg-violet-500/40 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Reading the stars…</> : <><Sparkles className="w-4 h-4" /> Find our soul places</>}
            </button>
          </div>
        )}

        {/* Friend picker */}
        {source === 'friend' && (
          <div className="space-y-1.5">
            {friendsLoading && <div className="flex items-center gap-2 text-[12px] text-white/50 py-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading friends…</div>}
            {friends && friends.length === 0 && (
              <p className="text-[12px] text-white/55 py-2">No friends yet. Add friends, or use “Enter details.”</p>
            )}
            {friends && friends.length > 0 && (
              <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
                {friends.map((f) => (
                  <button
                    key={f.friend_id}
                    onClick={() => selectFriend(f)}
                    disabled={loading}
                    className="w-full flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-left hover:bg-white/10 disabled:opacity-50"
                  >
                    {f.avatar_url
                      ? <img src={f.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                      : <span className="w-7 h-7 rounded-full bg-violet-500/25 flex items-center justify-center shrink-0"><User className="w-3.5 h-3.5 text-violet-200" /></span>}
                    <span className="text-[13px] text-white truncate">{f.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {err && <div className="rounded-lg bg-rose-500/10 border border-rose-400/25 px-3 py-2 text-[11px] text-rose-100">{err}</div>}
        {loading && source === 'friend' && !err && (
          <div className="flex items-center gap-2 text-[12px] text-violet-100/70 py-1"><Loader2 className="w-4 h-4 animate-spin" /> Reading the stars…</div>
        )}

        {/* The role — the single headline the two souls most likely played. */}
        {role && places && places.length > 0 && (
          <div className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-3 py-3">
            <div className="text-[10px] uppercase tracking-wide text-violet-300/80 mb-0.5">
              What {withLabel ? withLabel : 'they'} may have been to you
            </div>
            <div className="text-[15px] font-bold text-violet-50 mb-1 capitalize">{role.role}</div>
            <p className="text-[11px] text-white/75 leading-relaxed">{role.blurb}</p>
          </div>
        )}

        {/* Results */}
        {places && places.length === 0 && (
          <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-3 text-[12px] text-white/65">
            No soul-line runs within 50 miles of a known city for the two of you. Your shared lines fall over open ocean or empty land — rare, and its own kind of story.
          </div>
        )}

        {places && places.length > 0 && (
          <div className="space-y-3 pt-1">
            <div className="text-[11px] text-white/50">{places.length} place{places.length > 1 ? 's' : ''} where your souls meet</div>
            {places.map((p, i) => (
              <div key={`${p.body}-${p.angle}-${i}`} className="rounded-xl border border-violet-400/20 bg-violet-500/5 px-3 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-violet-300 shrink-0" />
                  <span className="text-[13px] font-semibold text-white">
                    {p.city}{p.country ? <span className="text-white/55 font-normal">, {shortCountry(p.country)}</span> : null}
                  </span>
                  <span className="ml-auto text-[11px] text-white/45 shrink-0">{Math.round(p.distanceMiles)} mi</span>
                </div>
                <div className="text-[11px] font-medium text-violet-200/90 mb-1.5">{p.reading.headline}</div>
                {p.reading.narrative.split('\n\n').map((para, j) => (
                  <p key={j} className="text-[11px] text-white/80 leading-relaxed mb-1.5"
                     dangerouslySetInnerHTML={{ __html: boldToHtml(para) }} />
                ))}
                <p className="text-[11px] text-violet-100/85 leading-relaxed mt-1 pt-1.5 border-t border-white/10 italic"
                   dangerouslySetInnerHTML={{ __html: boldToHtml(p.reading.whatCouldHaveBeen) }} />

                {p.nearby.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-white/10">
                    <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Also along this soul-line</div>
                    <div className="space-y-0.5">
                      {p.nearby.map((n, k) => (
                        <div key={`${n.city}-${k}`} className="flex items-center gap-1.5 text-[11px] text-white/65">
                          <MapPin className="w-3 h-3 text-violet-300/50 shrink-0" />
                          <span className="truncate">{n.city}{n.country ? `, ${shortCountry(n.country)}` : ''}</span>
                          <span className="ml-auto text-white/40 shrink-0">{Math.round(n.distanceMiles)} mi</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
