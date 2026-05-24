'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';

// ─── Helpers ─────────────────────────────────────────────────────

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

function lonToSignDegree(lon: number): string {
  const normalized = ((lon % 360) + 360) % 360;
  const signIdx = Math.floor(normalized / 30);
  const deg = normalized - signIdx * 30;
  return `${Math.floor(deg)}° ${SIGNS[signIdx]}`;
}

function prettyPlanet(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function prettyCategory(cat: string): string {
  return cat.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

// ─── Main Component ──────────────────────────────────────────────

export default function WorldEchoEventPage() {
  const { t } = useTranslation();
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<any>(null);
  const [whyMatched, setWhyMatched] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!eventId) return;

    // Fetch event details
    api.getWorldEchoEvent(eventId)
      .then(setEvent)
      .catch((err: any) => {
        setError(
          err?.message?.includes('404')
            ? 'This event is no longer available.'
            : 'Could not load this event. Check your connection.'
        );
      })
      .finally(() => setLoading(false));

    // Fetch why-matched in parallel (non-blocking, OK if it fails)
    api.getWorldEchoWhyMatched(eventId)
      .then(setWhyMatched)
      .catch(() => {}); // 404 is expected if event isn't in today's top hits
  }, [eventId]);

  if (loading) return <LoadingCosmic label={t('common.loading')} />;

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/world-echo" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> {t('common.back')}
      </Link>

      {error && (
        <div className="card text-center py-8">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {event && (
        <div className="space-y-5">
          {/* Title & date */}
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary mb-1">
              {event.title || event.name}
            </h1>
            <p className="text-sm text-text-secondary">
              {formatDate(event.event_date || event.date)}
              {event.event_time ? ` · ${event.event_time} UTC` : ''}
              {event.time_confidence && event.time_confidence !== 'exact' && event.time_confidence !== 'unknown' ? ' (approximate)' : ''}
            </p>
          </div>

          {/* Location */}
          {(event.location_name || event.country) && (
            <p className="text-sm text-text-tertiary">
              <span className="mr-1">📍</span>
              {event.location_name || ''}{event.location_name && event.country ? ', ' : ''}{event.country || ''}
            </p>
          )}

          {/* Category & severity tags */}
          <div className="flex flex-wrap gap-2">
            {event.category && (
              <span className="text-xs px-3 py-1 rounded-lg bg-bg-tertiary text-text-primary font-semibold">
                {prettyCategory(event.category)}
              </span>
            )}
            {event.subcategory && (
              <span className="text-xs px-3 py-1 rounded-lg bg-bg-tertiary text-text-primary font-semibold">
                {prettyCategory(event.subcategory)}
              </span>
            )}
            {event.severity_level && (
              <span className="text-xs px-3 py-1 rounded-lg bg-accent-primary/20 text-accent-primary font-semibold">
                {event.severity_level}
              </span>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="card">
              <h3 className="font-semibold text-text-primary mb-2">About</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Why This Matched Panel */}
          {whyMatched && whyMatched.bullets && whyMatched.bullets.length > 0 && (
            <div className="card border-accent-muted bg-bg-secondary">
              <h3 className="font-semibold text-text-primary mb-2">Why this matched today&apos;s sky</h3>
              {whyMatched.score != null && (
                <p className="text-xs text-text-tertiary mb-3">
                  Similarity score: <span className="text-accent-primary font-bold">{Math.round(whyMatched.score)}</span>
                  {whyMatched.in_top_hits ? '  ·  in today\'s top echoes' : ''}
                </p>
              )}
              <div className="space-y-2">
                {whyMatched.bullets.map((bullet: any, i: number) => {
                  const dotColor =
                    bullet.weight === 'strong' ? 'bg-accent-primary' :
                    bullet.weight === 'moderate' ? 'bg-accent-secondary' :
                    'bg-text-tertiary';
                  const isMidpoint = bullet.kind === 'midpoint';
                  const orbSuffix =
                    bullet.orb_today != null && bullet.orb_event != null
                      ? ` (orb ${bullet.orb_today.toFixed(1)}° / ${bullet.orb_event.toFixed(1)}°)`
                      : '';
                  return (
                    <div key={`${bullet.kind}-${bullet.key ?? bullet.label}-${i}`} className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {isMidpoint && <span className="text-[10px] text-accent-primary font-bold uppercase tracking-wider mr-1">Midpoint</span>}
                        {bullet.label}{isMidpoint ? orbSuffix : ''}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Source */}
          {event.source_url && (
            <div className="card">
              <h3 className="font-semibold text-text-primary mb-2">Source</h3>
              <a
                href={event.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent-primary underline inline-flex items-center gap-1 hover:opacity-80"
              >
                {event.source_name || event.source_url}
                <ExternalLink className="w-3 h-3" />
              </a>
              {event.source_confidence && (
                <p className="text-xs text-text-muted mt-1">Confidence: {event.source_confidence}</p>
              )}
            </div>
          )}

          {/* Astrological Signature */}
          {event.astrology ? (
            <div className="card">
              <h3 className="font-semibold text-text-primary mb-1">Astrological Signature</h3>
              <p className="text-xs text-text-muted italic mb-3">
                Engine version {event.astrology.engine_version}
              </p>

              {/* Planet Grid */}
              <PlanetGrid astro={event.astrology} />

              {/* Major Aspects */}
              <AspectsList aspects={event.astrology.aspects_json} />

              {/* Retrogrades */}
              {Array.isArray(event.astrology.retrogrades_json) && event.astrology.retrogrades_json.length > 0 && (
                <div className="mt-3 flex gap-2 items-center p-2 bg-bg-tertiary rounded-lg">
                  <span className="text-xs text-text-tertiary font-semibold">Retrograde:</span>
                  <span className="text-xs text-text-primary">
                    {event.astrology.retrogrades_json.map((p: string) => prettyPlanet(p)).join(', ')}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <p className="text-sm text-text-muted text-center py-4">
                Astrological signature not yet computed for this event.
              </p>
            </div>
          )}

          {/* Shared aspects from the hit match (if came from scan data) */}
          {!event.astrology && event.shared_aspects && event.shared_aspects.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-text-primary mb-3">Matching Aspects</h3>
              <div className="space-y-2">
                {event.shared_aspects.map((asp: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-text-secondary">{asp.planet1 || asp.transit_planet || asp.p1}</span>
                    <span className="text-accent-secondary text-xs italic">{asp.aspect || asp.aspect_name || asp.type}</span>
                    <span className="text-text-secondary">{asp.planet2 || asp.natal_planet || asp.p2}</span>
                    {asp.orb !== undefined && (
                      <span className="text-text-muted text-xs ml-auto">orb: {typeof asp.orb === 'number' ? asp.orb.toFixed(1) : asp.orb}°</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

function PlanetGrid({ astro }: { astro: any }) {
  const planets: Array<[string, string, number | null]> = [
    ['Sun',     'sun',     astro.sun_longitude],
    ['Moon',    'moon',    astro.moon_longitude],
    ['Mercury', 'mercury', astro.mercury_longitude],
    ['Venus',   'venus',   astro.venus_longitude],
    ['Mars',    'mars',    astro.mars_longitude],
    ['Jupiter', 'jupiter', astro.jupiter_longitude],
    ['Saturn',  'saturn',  astro.saturn_longitude],
    ['Uranus',  'uranus',  astro.uranus_longitude],
    ['Neptune', 'neptune', astro.neptune_longitude],
    ['Pluto',   'pluto',   astro.pluto_longitude],
  ];

  const validPlanets = planets.filter(([, , lon]) => lon != null);
  if (validPlanets.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-3">
      {validPlanets.map(([name, key, lon]) => (
        <div key={key} className="p-2 bg-bg-tertiary rounded-lg">
          <p className="text-[10px] text-text-muted">{name}</p>
          <p className="text-sm text-text-primary font-semibold">{lonToSignDegree(lon!)}</p>
        </div>
      ))}
    </div>
  );
}

function AspectsList({ aspects }: { aspects?: Array<{ p1: string; p2: string; type: string; orb: number }> }) {
  if (!aspects || aspects.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-2">Major Aspects</p>
      <div className="space-y-1">
        {aspects.map((a, i) => (
          <p key={i} className="text-sm text-text-secondary">
            {prettyPlanet(a.p1)} <span className="text-accent-secondary">{a.type}</span> {prettyPlanet(a.p2)}
            <span className="text-text-muted text-xs ml-2">· orb {a.orb.toFixed(1)}°</span>
          </p>
        ))}
      </div>
    </div>
  );
}
