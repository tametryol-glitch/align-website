'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { resolveTimezoneOffset } from '@/lib/timezoneOffset';
import Link from 'next/link';
import { Heart, ChevronDown, ChevronUp, RefreshCw, Share2, UserPlus, ArrowLeft } from 'lucide-react';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { CitySearch } from '@/components/ui/CitySearch';
import { computeAdvancedCompatibility, type AdvancedCompatibilityResult } from '@/lib/engines/advancedCompatibility';
import { computeCanonicalOverall } from '@/lib/cosmicMatchService';
import { buildSynastrySnapshot, type SynastrySnapshot } from '@/lib/relationshipShare';
import { getSynastryPairReading } from '@/lib/synastryReadings';
import RelationshipShareView from '@/components/share/RelationshipShareView';
import RelationshipShareModal from '@/components/share/RelationshipShareModal';
import { PaywallGate } from '@/components/ui/PaywallGate';

interface PersonInput {
  date: string;
  time: string;
  location: string;
  lat: number | null;
  lng: number | null;
  timezone: string;
}

export default function CompatibilityPage() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const [person2, setPerson2] = useState<PersonInput>({ date: '', time: '12:00', location: '', lat: null, lng: null, timezone: 'UTC' });
  const [result, setResult] = useState<AdvancedCompatibilityResult | null>(null);
  // Cosmic Match scores + readings — what the page shows is what gets shared.
  const [snapshot, setSnapshot] = useState<SynastrySnapshot | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAspects, setShowAspects] = useState(false);

  if (!profile?.birth_date || !profile?.latitude) {
    return <PaywallGate feature="compatibility"><BirthDataPrompt message={t('readings.birthDataPromptCompatibility')} /></PaywallGate>;
  }

  async function calculate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Fetch both natal charts in parallel
      const [chart1Data, chart2Data] = await Promise.all([
        api.getNatalChart(buildBirthData(profile!)),
        (() => {
          const { offset, label } = resolveTimezoneOffset(person2.timezone, person2.lng || 0, person2.date, person2.time, person2.lat || undefined);
          return api.getNatalChart({
            name: '',
            date: person2.date,
            time: person2.time,
            latitude: person2.lat || 0,
            longitude: person2.lng || 0,
            timezone: label,
            tz_offset: offset,
            location: person2.location,
          });
        })(),
      ]);

      // Extract positions and house cusps for both charts
      const positions1 = extractPositions(chart1Data);
      const positions2 = extractPositions(chart2Data);
      const houseCusps1 = chart1Data?.house_cusps || [];
      const houseCusps2 = chart2Data?.house_cusps || [];

      // Same engine and overall as Cosmic Match, so the numbers match everywhere.
      const compatibility = computeAdvancedCompatibility(
        positions1,
        positions2,
        houseCusps1,
        houseCusps2,
      );

      setSnapshot(buildSynastrySnapshot(
        compatibility,
        computeCanonicalOverall(compatibility),
        profile?.display_name,
        null,
        (a) => !!getSynastryPairReading(a.p1, a.p2, a.supportive),
      ));
      setResult(compatibility);
    } catch (err: any) {
      setError(err.message || 'Failed to compute compatibility');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PaywallGate feature="compatibility">
    <div className="max-w-3xl mx-auto">
      <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        {t('readings.backToReadings')}
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">{t('readings.compatibilityPage.title')}</h1>
          <p className="text-text-tertiary text-sm">{t('readings.compatibilityPage.subtitle')}</p>
        </div>
      </div>

      {!result && !loading && (
        <form onSubmit={calculate} className="space-y-6">
          {/* Person 1 - auto-filled */}
          <div className="card border-accent-muted">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">👤</span>
              <h3 className="font-semibold text-text-primary">You</h3>
              <span className="text-xs text-text-muted ml-auto">(from your profile)</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-text-tertiary">
              <p>Birth: {profile.birth_date}</p>
              <p>Time: {profile.birth_time || '12:00'}</p>
            </div>
          </div>

          {/* Person 2 - manual entry */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💕</span>
              <h3 className="font-semibold text-text-primary">{t('readings.compatibilityPage.person2Label')}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-muted mb-1">{t('readings.compatibilityPage.datePlaceholder')}</label>
                <input
                  type="date"
                  value={person2.date}
                  onChange={(e) => setPerson2({ ...person2, date: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">{t('readings.compatibilityPage.timePlaceholder')}</label>
                <input
                  type="time"
                  value={person2.time}
                  onChange={(e) => setPerson2({ ...person2, time: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs text-text-muted mb-1">{t('readings.compatibilityPage.locationPlaceholder')}</label>
              <CitySearch
                value={person2.location}
                onChange={(location, lat, lon, tz) => {
                  setPerson2({ ...person2, location, lat, lng: lon, timezone: tz });
                }}
                placeholder="Search city, state, or country..."
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {t('readings.compatibilityPage.calculateButton')}
          </button>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </form>
      )}

      {loading && <LoadingCosmic label={t('readings.compatibilityPage.calculating')} />}

      {result && (
        <div className="space-y-5">
          {snapshot && <RelationshipShareView snapshot={snapshot} showCta={false} />}

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

          {/* Share & Invite */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setShareOpen(true)} className="btn-primary flex items-center justify-center gap-2 text-sm">
              <Share2 className="w-4 h-4" /> Share Result
            </button>
            <button
              onClick={() => {
                const url = `${window.location.origin}/readings/compatibility`;
                const text = `Check your cosmic compatibility on Align! I got ${snapshot?.score ?? 0}% — what will you get?`;
                if (navigator.share) {
                  navigator.share({ title: 'Check Our Compatibility', text, url }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(`${text}\n${url}`).catch(() => {});
                }
              }}
              className="btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              <UserPlus className="w-4 h-4" /> Invite to Compare
            </button>
          </div>

          {snapshot && (
            <RelationshipShareModal open={shareOpen} onClose={() => setShareOpen(false)} snapshot={snapshot} />
          )}

          {/* Reset */}
          <button
            onClick={() => { setResult(null); setSnapshot(null); setShowAspects(false); }}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Compare Another Person
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
