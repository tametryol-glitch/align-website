'use client';

/**
 * Soul Places panel (Zodisphere · Draconic Composite, Phase 2 UI).
 *
 * Founder-gated floating panel. The user enters a second person's birth data
 * (manual entry via the shared CitySearch), and we compute the draconic-
 * composite astrocartography and list the real places where the two souls'
 * shared imprint runs within 50 miles — each with a "what could have been"
 * reading. The engine + interpretation are the Phase-1 work in
 * lib/zodisphere/soulPlaces.ts; this is only the UI + partner input.
 *
 * Framing note: this is evocative "what could have been," never a literal claim
 * that either person was physically at these places in a past life.
 */

import { useState } from 'react';
import { Heart, X, Loader2, MapPin, Sparkles } from 'lucide-react';
import { CitySearch } from '@/components/ui/CitySearch';
import { countryAt } from '@/components/zodisphere/three-d/locationInspector';
import {
  getDraconicCompositeAcgLines,
  findSoulPlaces,
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

export default function SoulPlacesPanel({
  profile,
  cities,
  countryFeatures,
}: {
  profile: any;
  cities: Array<[string, number, number]>;
  countryFeatures: any[];
}) {
  const [open, setOpen] = useState(false);

  // Partner birth data (normalized to the profiles shape getMyChartBodies wants).
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [loc, setLoc] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [tz, setTz] = useState('UTC');

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [places, setPlaces] = useState<EnrichedPlace[] | null>(null);

  const countryOf = (lat: number, lng: number): string | null =>
    countryFeatures?.length ? countryAt(lat, lng, countryFeatures) : null;

  const myOk = !!(profile?.birth_date && profile?.birth_time && profile?.latitude != null);
  const partnerOk = !!(date && time && lat != null && lng != null);

  const run = async () => {
    setErr(null);
    setLoading(true);
    setPlaces(null);
    try {
      const partner = {
        display_name: name || 'Them',
        birth_date: date,
        birth_time: time,
        birth_location: loc,
        latitude: lat,
        longitude: lng,
        timezone: tz,
      };
      const result = await getDraconicCompositeAcgLines(profile, partner);
      if (!result) {
        setErr('Couldn’t build the composite. Both charts need a birth date, an exact time, and a place.');
        return;
      }
      const found = findSoulPlaces(result, cities, 50, 12);
      // Enrich once with offline country lookups so render stays cheap.
      const enriched: EnrichedPlace[] = found.map((p) => ({
        ...p,
        country: countryOf(p.lat, p.lng),
        nearby: p.nearby.map((n) => ({ ...n, country: countryOf(n.lat, n.lng) })),
      }));
      setPlaces(enriched);
    } catch (e: any) {
      setErr(e?.message || 'Something went wrong computing your soul places.');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/60 backdrop-blur">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-violet-300" />
          <span className="text-[13px] font-semibold">Soul Places <span className="text-[9px] uppercase tracking-wide text-violet-300/80 border border-violet-300/30 rounded px-1 ml-1">beta</span></span>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close"><X className="w-4 h-4 text-white/50 hover:text-white" /></button>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-[11px] text-white/55 leading-relaxed">
          Where your two <strong>soul</strong> charts blend and fall strongest on Earth — the places that could have held meaning for you together. Evocative, not literal.
        </p>

        {!myOk && (
          <div className="rounded-lg bg-amber-400/10 border border-amber-400/25 px-3 py-2 text-[11px] text-amber-100">
            Add your own birth date, exact time, and place first — soul places need both charts.
          </div>
        )}

        {/* Partner input */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-white/80">Their birth details</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Their name (optional)"
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-[13px] outline-none placeholder:text-white/30 focus:border-violet-400/50"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-[13px] outline-none focus:border-violet-400/50"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-28 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-[13px] outline-none focus:border-violet-400/50"
            />
          </div>
          <CitySearch
            value={loc}
            onChange={(location, la, lo, timezone) => { setLoc(location); setLat(la); setLng(lo); setTz(timezone); }}
            placeholder="Their birth city…"
          />
          <p className="text-[10px] text-white/40">An exact birth time matters — the lines shift ~15° per hour.</p>
        </div>

        <button
          onClick={run}
          disabled={!myOk || !partnerOk || loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-violet-500/30 border border-violet-400/40 px-3 py-2.5 text-[13px] font-medium text-violet-50 hover:bg-violet-500/40 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Reading the stars…</> : <><Sparkles className="w-4 h-4" /> Find our soul places</>}
        </button>

        {err && <div className="rounded-lg bg-rose-500/10 border border-rose-400/25 px-3 py-2 text-[11px] text-rose-100">{err}</div>}

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
                    <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1">
                      Also along this soul-line
                    </div>
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
