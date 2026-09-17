'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, buildBirthData } from '@/lib/api';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { resolveTimezoneOffset } from '@/lib/timezoneOffset';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import Link from 'next/link';
import { ArrowLeft, Heart, Users, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import { computeAdvancedCompatibility, type AdvancedCompatibilityResult } from '@/lib/engines/advancedCompatibility';
import { computeCanonicalOverall } from '@/lib/cosmicMatchService';
import { CitySearch } from '@/components/ui/CitySearch';
import { PaywallGate } from '@/components/ui/PaywallGate';
import { useTranslation } from 'react-i18next';
import RelationshipShareModal from '@/components/share/RelationshipShareModal';
import { buildSynastrySnapshot } from '@/lib/relationshipShare';
import RelationshipShareView from '@/components/share/RelationshipShareView';
import { getSynastryPairReading } from '@/lib/synastryReadings';

/** Partner birth inputs used by the engine, from the form or a saved profile. */
interface PartnerInput {
  name: string;
  date: string;
  time: string;
  location: string;
  lat: number | null;
  lng: number | null;
  tz: string;
}

export default function SynastryPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const partnerId = searchParams.get('partnerId');
  const { profile } = useAuthStore();
  const [result, setResult] = useState<AdvancedCompatibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAspects, setShowAspects] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Partner data
  const [partnerName, setPartnerName] = useState('');
  const [partnerDate, setPartnerDate] = useState('');
  const [partnerTime, setPartnerTime] = useState('12:00');
  const [partnerLocation, setPartnerLocation] = useState('');
  const [partnerLat, setPartnerLat] = useState<number | null>(null);
  const [partnerLng, setPartnerLng] = useState<number | null>(null);
  const [partnerTz, setPartnerTz] = useState('UTC');
  // Set when the partner came from a saved profile (?partnerId=…) rather than
  // the manual form — suppresses the form entirely.
  const [autoPartner, setAutoPartner] = useState(false);

  const hasBirthData = profile?.birth_date && profile?.latitude;

  // What the page shows and what gets shared are the same snapshot.
  const snapshot = useMemo(
    () => result
      ? buildSynastrySnapshot(
          result,
          computeCanonicalOverall(result),
          profile?.display_name,
          partnerName,
          (a) => !!getSynastryPairReading(a.p1, a.p2, a.supportive),
        )
      : null,
    [result, profile?.display_name, partnerName],
  );

  const runCalculation = useCallback(async (partner: PartnerInput) => {
    if (!profile?.birth_date || !profile?.latitude) return;
    setLoading(true);
    setError('');
    try {
      // Fetch both natal charts in parallel
      const [chart1Data, chart2Data] = await Promise.all([
        api.getNatalChart(buildBirthData(profile)),
        (() => {
          const { offset, label } = resolveTimezoneOffset(partner.tz, partner.lng || 0, partner.date, partner.time, partner.lat || undefined);
          return api.getNatalChart({
            name: partner.name || '',
            date: partner.date,
            time: partner.time,
            latitude: partner.lat || 0,
            longitude: partner.lng || 0,
            timezone: label,
            tz_offset: offset,
            location: partner.location,
          });
        })(),
      ]);

      // Extract positions and house cusps
      const positions1 = extractPositions(chart1Data);
      const positions2 = extractPositions(chart2Data);
      const houseCusps1 = chart1Data?.house_cusps || [];
      const houseCusps2 = chart2Data?.house_cusps || [];

      // Run the compatibility engine client-side
      // Same engine + overall as Cosmic Match, so the numbers match everywhere.
      const compatibility = computeAdvancedCompatibility(
        positions1,
        positions2,
        houseCusps1,
        houseCusps2,
      );

      setResult(compatibility);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate synastry');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  async function calculate(e: React.FormEvent) {
    e.preventDefault();
    await runCalculation({
      name: partnerName,
      date: partnerDate,
      time: partnerTime,
      location: partnerLocation,
      lat: partnerLat,
      lng: partnerLng,
      tz: partnerTz,
    });
  }

  // ── Auto-run from a saved partner profile (?partnerId=…) ──
  // Arrived from a Cosmic Match card: pull the friend's stored birth data and
  // calculate immediately instead of asking the user to retype it.
  const autoRanRef = useRef(false);
  useEffect(() => {
    if (!partnerId || autoRanRef.current) return;
    if (!profile?.birth_date || !profile?.latitude) return;
    autoRanRef.current = true;

    (async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: partner } = await supabase
          .from('profiles')
          .select('display_name, birth_date, birth_time, birth_location, latitude, longitude, timezone')
          .eq('id', partnerId)
          .single();

        if (!partner?.birth_date || partner.latitude == null || partner.longitude == null) {
          setLoading(false);
          setError(
            `${partner?.display_name || 'This person'} hasn't added their full birth details yet, so their chart can't be calculated. You can enter them manually below.`,
          );
          return;
        }

        setAutoPartner(true);
        setPartnerName(partner.display_name || '');
        setPartnerDate(partner.birth_date);
        setPartnerTime(partner.birth_time || '12:00');
        setPartnerLocation(partner.birth_location || '');
        setPartnerLat(Number(partner.latitude));
        setPartnerLng(Number(partner.longitude));
        setPartnerTz(partner.timezone || 'UTC');

        await runCalculation({
          name: partner.display_name || '',
          date: partner.birth_date,
          time: partner.birth_time || '12:00',
          location: partner.birth_location || '',
          lat: Number(partner.latitude),
          lng: Number(partner.longitude),
          tz: partner.timezone || 'UTC',
        });
      } catch {
        setLoading(false);
        setError('Could not load your match’s birth data.');
      }
    })();
  }, [partnerId, profile, runCalculation]);

  if (!hasBirthData) {
    return (
      <PaywallGate feature="synastry">
        <div className="max-w-3xl mx-auto">
          <Link href="/chart" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" /> My Chart
          </Link>
          <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
            <Heart className="w-7 h-7 text-fire" />
            {t('chart.synastry')}
          </h1>
          <BirthDataPrompt message="Birth data required to calculate synastry with another person." />
        </div>
      </PaywallGate>
    );
  }

  return (
    <PaywallGate feature="synastry">
    <div className="max-w-4xl mx-auto">
      <Link href="/chart" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> My Chart
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mb-2 flex items-center gap-3">
        <Heart className="w-7 h-7 text-fire" />
        Synastry
      </h1>
      <p className="text-sm text-text-tertiary mb-6">
        7-category synastry analysis — compare your chart with another person
      </p>

      {!result && !loading && (
        <form onSubmit={calculate} className="card space-y-4">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Users className="w-4 h-4" /> Partner&apos;s Birth Data
          </h3>
          <input
            type="text"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            placeholder="Their name (optional)"
            className="input"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted block mb-1">Birth Date *</label>
              <input type="date" value={partnerDate} onChange={(e) => setPartnerDate(e.target.value)} className="input" required />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Birth Time</label>
              <input type="time" value={partnerTime} onChange={(e) => setPartnerTime(e.target.value)} className="input" />
            </div>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Birth Location *</label>
            <CitySearch
              value={partnerLocation}
              onChange={(location, lat, lon, tz) => {
                setPartnerLocation(location);
                setPartnerLat(lat);
                setPartnerLng(lon);
                setPartnerTz(tz);
              }}
              placeholder="Search city, state, or country..."
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            Calculate Synastry
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>
      )}

      {loading && (
        <LoadingCosmic
          label={
            autoPartner && partnerName
              ? `Computing your synastry with ${partnerName}...`
              : 'Computing synastry across 7 categories...'
          }
        />
      )}

      {result && !loading && (
        <div className="space-y-5">
          <div className="flex justify-end">
            <button onClick={() => setShareOpen(true)} className="btn-primary inline-flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Share Result
            </button>
          </div>

          <RelationshipShareView snapshot={snapshot!} showCta={false} />

          <RelationshipShareModal
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            snapshot={snapshot!}
          />

          {/* Aspects Detail (collapsible) */}
          {result.aspects.length > 0 && (
            <div className="card">
              <button
                onClick={() => setShowAspects(!showAspects)}
                className="w-full flex items-center justify-between"
              >
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <span className="text-lg">🔗</span> Synastry Aspects ({result.aspects.length})
                </h3>
                {showAspects ? (
                  <ChevronUp className="w-4 h-4 text-text-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                )}
              </button>

              {showAspects && (
                <div className="mt-4 space-y-2 animate-in fade-in duration-300">
                  {result.aspects.map((asp, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border-primary last:border-0">
                      <span className={`w-2 h-2 rounded-full ${asp.supportive ? 'bg-green-400' : 'bg-amber-400'}`} />
                      <span className="text-xs text-text-primary font-medium w-16 truncate">{asp.inner}</span>
                      <span className="text-[10px] text-accent-secondary px-1.5 py-0.5 bg-accent-muted rounded">
                        {asp.aspect}
                      </span>
                      <span className="text-xs text-text-primary font-medium w-16 truncate">{asp.outer}</span>
                      <span className="ml-auto text-[10px] text-text-muted">
                        orb {Math.abs(asp.orb).toFixed(1)}°
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {partnerId && (
            <Link href={`/chart/composite?partnerId=${partnerId}`} className="btn-primary w-full block text-center">
              View Composite Chart{partnerName ? ` with ${partnerName}` : ''}
            </Link>
          )}

          <button onClick={() => { setResult(null); setShowAspects(false); }} className="btn-secondary w-full">
            New Comparison
          </button>
        </div>
      )}
    </div>
    </PaywallGate>
  );
}

/** Extract planet positions from API chart response for the compatibility engine */
function extractPositions(chartData: any): Array<{ name: string; longitude: number; house?: number }> {
  const positions = chartData?.planets || chartData?.positions || [];
  return positions.map((p: any) => ({
    name: p.name || p.planet || '',
    longitude: p.longitude ?? 0,
    house: p.house || undefined,
  }));
}
