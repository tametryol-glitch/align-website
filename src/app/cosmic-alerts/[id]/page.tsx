'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, Clock, Zap, Star, Lightbulb, ArrowRight, Calendar } from 'lucide-react'
import Link from 'next/link'
import { CATEGORY_CONFIG, getImportanceLabel, type CosmicAlert, type AlertCategory } from '@/lib/cosmicAlertService'

export default function CosmicAlertDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const [alert, setAlert] = useState<CosmicAlert | null>(null)
  const [loading, setLoading] = useState(true)

  // Try to decode alert from query param first, fallback to Supabase
  const preloadedAlert = useMemo<CosmicAlert | null>(() => {
    try {
      const encoded = searchParams.get('data')
      if (!encoded) return null
      return JSON.parse(atob(encoded))
    } catch { return null }
  }, [searchParams])

  useEffect(() => {
    if (preloadedAlert) {
      setAlert(preloadedAlert)
      setLoading(false)
      return
    }
    async function fetchAlert() {
      if (!user || !params.id) { setLoading(false); return }
      const supabase = createClient()
      const { data, error } = await supabase
        .from('cosmic_alerts')
        .select('*')
        .eq('id', params.id as string)
        .eq('user_id', user.id)
        .single()
      if (!error && data) setAlert(data as CosmicAlert)
      setLoading(false)
    }
    fetchAlert()
  }, [user, params.id, preloadedAlert])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-text-secondary text-lg">Loading alert...</div>
      </div>
    )
  }

  if (!alert) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <span className="text-5xl">🔭</span>
        <p className="text-text-secondary text-lg">Alert not found</p>
        <Link href="/cosmic-alerts" className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Cosmic Weather
        </Link>
      </div>
    )
  }

  const cat = (alert.category as AlertCategory) || 'general'
  const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.general
  const importance = alert.importance_score ?? (alert.intensity ? Math.min(10, alert.intensity) : 5)
  const impLabel = getImportanceLabel(importance)
  const starCount = Math.min(5, Math.ceil(importance / 2))

  const startDate = alert.start_time || alert.timing_window_start
  const peakDate = alert.peak_time
  const endDate = alert.end_time || alert.timing_window_end
  const isActive = startDate && endDate
    ? new Date() >= new Date(startDate) && new Date() <= new Date(endDate)
    : false

  const interpretation = alert.long_body || alert.interpretation || alert.short_body || alert.description || ''
  const advice = alert.action_advice || alert.practical_advice

  // Astrological detail entries from enriched or metadata shape
  const m = alert.metadata || {}
  const transitPlanet = alert.transiting_planet || m.transit_planet
  const natalPlanet = alert.natal_planet || m.natal_point
  const transitSign = alert.transit_sign || m.transit_sign
  const natalSign = alert.natal_sign || m.natal_sign
  const aspectName = alert.aspect_name || m.aspect_type
  const orb = alert.orb ?? m.orb
  const isRetrograde = alert.is_retrograde ?? m.is_retrograde
  const hasAstroDetails = transitPlanet || natalPlanet || aspectName || alert.planets_involved?.length

  function formatDate(dateStr?: string) {
    if (!dateStr) return '--'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
      })
    } catch { return dateStr }
  }

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <div className="px-4 pt-6 pb-3">
          <Link
            href="/cosmic-alerts"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cosmic Weather
          </Link>
        </div>

        {/* Hero Header */}
        <div className={`bg-gradient-to-br ${config.gradient} px-6 py-10 text-center`}>
          <span className="text-5xl">{config.emoji}</span>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-3">
            {config.label}
          </p>
          <h1 className="text-white text-2xl font-extrabold mt-2 leading-tight">
            {alert.title}
          </h1>
          <div className="flex items-center justify-center gap-1 mt-4">
            {Array.from({ length: starCount }).map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            ))}
            {Array.from({ length: 5 - starCount }).map((_, i) => (
              <Star key={`e-${i}`} className="w-4 h-4 text-white/20" />
            ))}
            <span className="text-white/80 text-xs font-semibold ml-2">{impLabel}</span>
          </div>
        </div>

        <div className="px-4 pb-10 space-y-5 mt-5">
          {/* Timing Window */}
          {(startDate || peakDate || endDate) && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-accent-primary" />
                <h2 className="text-text-primary font-semibold text-lg">Timing Window</h2>
                {isActive && (
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-green-500/15 text-green-400 border border-green-500/30">
                    Active Now
                  </span>
                )}
              </div>
              <div className="flex items-stretch rounded-lg bg-bg-tertiary/50 border border-border-primary overflow-hidden">
                <div className="flex-1 text-center py-3 px-2">
                  <p className="text-text-muted text-[10px] font-bold uppercase tracking-wide mb-1">Begins</p>
                  <p className="text-text-primary text-xs font-semibold">{formatDate(startDate)}</p>
                </div>
                <div className="w-px bg-border-primary" />
                <div className="flex-1 text-center py-3 px-2">
                  <p className="text-text-muted text-[10px] font-bold uppercase tracking-wide mb-1">Peak</p>
                  <p className="text-accent-primary text-xs font-bold">{formatDate(peakDate)}</p>
                </div>
                <div className="w-px bg-border-primary" />
                <div className="flex-1 text-center py-3 px-2">
                  <p className="text-text-muted text-[10px] font-bold uppercase tracking-wide mb-1">Ends</p>
                  <p className="text-text-primary text-xs font-semibold">{formatDate(endDate)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Interpretation */}
          {interpretation && (
            <div className="card">
              <h2 className="text-text-primary font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="text-lg">🔮</span> What This Means
              </h2>
              <p className="text-text-secondary leading-relaxed text-[15px]">{interpretation}</p>
            </div>
          )}

          {/* Astrological Details */}
          {hasAstroDetails && (
            <div className="card">
              <h2 className="text-text-primary font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="text-lg">🪐</span> Astrological Details
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {transitPlanet && (
                  <div className="bg-bg-tertiary/50 rounded-lg p-3 border border-border-primary">
                    <p className="text-text-muted text-[10px] font-bold uppercase tracking-wide mb-1">Transit Planet</p>
                    <p className="text-text-primary text-sm font-semibold">
                      {transitPlanet}{transitSign ? ` in ${transitSign}` : ''}
                    </p>
                  </div>
                )}
                {natalPlanet && (
                  <div className="bg-bg-tertiary/50 rounded-lg p-3 border border-border-primary">
                    <p className="text-text-muted text-[10px] font-bold uppercase tracking-wide mb-1">Natal Planet</p>
                    <p className="text-text-primary text-sm font-semibold">
                      {natalPlanet}{natalSign ? ` in ${natalSign}` : ''}
                    </p>
                  </div>
                )}
                {aspectName && (
                  <div className="bg-bg-tertiary/50 rounded-lg p-3 border border-border-primary">
                    <p className="text-text-muted text-[10px] font-bold uppercase tracking-wide mb-1">Aspect</p>
                    <p className="text-text-primary text-sm font-semibold">
                      {aspectName}{orb != null ? ` (${Number(orb).toFixed(1)}° orb)` : ''}
                    </p>
                  </div>
                )}
                {isRetrograde != null && (
                  <div className="bg-bg-tertiary/50 rounded-lg p-3 border border-border-primary">
                    <p className="text-text-muted text-[10px] font-bold uppercase tracking-wide mb-1">Retrograde</p>
                    <p className="text-text-primary text-sm font-semibold">{isRetrograde ? 'Yes ℞' : 'No'}</p>
                  </div>
                )}
                {!transitPlanet && alert.planets_involved?.map((planet) => (
                  <div key={planet} className="bg-bg-tertiary/50 rounded-lg p-3 border border-border-primary">
                    <p className="text-text-muted text-[10px] font-bold uppercase tracking-wide mb-1">Planet</p>
                    <p className="text-text-primary text-sm font-semibold">{planet}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emotional Meaning */}
          {alert.emotional_meaning && (
            <div className="card">
              <h2 className="text-text-primary font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="text-lg">💫</span> Emotional Meaning
              </h2>
              <p className="text-text-secondary leading-relaxed text-[15px]">{alert.emotional_meaning}</p>
            </div>
          )}

          {/* Action Advice */}
          {advice && (
            <div className="rounded-xl bg-green-500/10 border border-green-500/25 p-5">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-green-400 font-semibold text-sm mb-1">What To Do</h2>
                  <p className="text-green-300/90 text-[15px] leading-relaxed">{advice}</p>
                </div>
              </div>
            </div>
          )}

          {/* CTA Button */}
          <Link
            href="/readings/transits"
            className="block w-full text-center py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white font-bold text-[15px] transition-all"
          >
            Explore Your Full Transits
            <ArrowRight className="w-4 h-4 inline-block ml-2" />
          </Link>

          {/* Created date */}
          {alert.created_at && (
            <p className="text-text-muted text-xs text-center pt-2">
              Created {formatDate(alert.created_at)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
