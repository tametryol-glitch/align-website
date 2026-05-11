'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useParams } from 'next/navigation'
import { ArrowLeft, Clock, Zap } from 'lucide-react'
import Link from 'next/link'

interface CosmicAlert {
  id: string
  user_id: string
  title: string
  category: string
  description: string
  interpretation: string
  timing_window_start: string
  timing_window_end: string
  practical_advice: string
  emotional_meaning: string
  intensity: number
  planets_involved: string[]
  created_at: string
}

const categoryConfig: Record<string, { emoji: string; color: string; bgColor: string; borderColor: string }> = {
  love: { emoji: '💞', color: 'text-pink-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/30' },
  career: { emoji: '🏛️', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  money: { emoji: '💰', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  identity: { emoji: '✨', color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
  healing: { emoji: '🌿', color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30' },
  spiritual: { emoji: '🔮', color: 'text-violet-400', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/30' },
  communication: { emoji: '💬', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30' },
  general: { emoji: '🌌', color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/30' },
}

export default function CosmicAlertDetailPage() {
  const params = useParams()
  const { user } = useAuthStore()
  const [alert, setAlert] = useState<CosmicAlert | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAlert() {
      if (!user || !params.id) return

      const supabase = createClient()
      const { data, error } = await supabase
        .from('cosmic_alerts')
        .select('*')
        .eq('id', params.id as string)
        .eq('user_id', user.id)
        .single()

      if (!error && data) {
        setAlert(data as CosmicAlert)
      }
      setLoading(false)
    }

    fetchAlert()
  }, [user, params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary text-lg">Loading alert...</p>
      </div>
    )
  }

  if (!alert) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-text-secondary text-lg">Alert not found</p>
        <Link href="/cosmic-alerts" className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Cosmic Alerts
        </Link>
      </div>
    )
  }

  const config = categoryConfig[alert.category] || categoryConfig.general

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/cosmic-alerts"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cosmic Alerts
        </Link>

        {/* Category Badge & Title */}
        <div className={`card ${config.borderColor} border mb-6`}>
          <div className={`${config.bgColor} rounded-t-lg px-6 py-4 -mx-6 -mt-6 mb-4`}>
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.color} ${config.bgColor} border ${config.borderColor}`}>
              <span>{config.emoji}</span>
              <span className="capitalize">{alert.category}</span>
            </span>
          </div>
          <h1 className="text-text-primary text-2xl font-bold">{alert.title}</h1>
          {alert.description && (
            <p className="text-text-secondary mt-2">{alert.description}</p>
          )}
        </div>

        {/* Timing Window */}
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-accent-primary" />
            <h2 className="text-text-primary font-semibold text-lg">Active Window</h2>
          </div>
          <div className="flex items-center gap-3 text-text-secondary">
            <span>{formatDate(alert.timing_window_start)}</span>
            <span className="text-text-muted">→</span>
            <span>{formatDate(alert.timing_window_end)}</span>
          </div>
        </div>

        {/* Intensity Meter */}
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-accent-primary" />
            <h2 className="text-text-primary font-semibold text-lg">Intensity</h2>
            <span className="ml-auto text-text-secondary font-medium">{alert.intensity}/10</span>
          </div>
          <div className="w-full h-3 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-primary to-purple-500 transition-all duration-500"
              style={{ width: `${(alert.intensity / 10) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-text-tertiary text-xs">Subtle</span>
            <span className="text-text-tertiary text-xs">Powerful</span>
          </div>
        </div>

        {/* Interpretation */}
        <div className="card mb-6">
          <h2 className="text-text-primary font-semibold text-lg mb-3">Interpretation</h2>
          <p className="text-text-secondary leading-relaxed">{alert.interpretation}</p>
        </div>

        {/* Emotional Meaning */}
        {alert.emotional_meaning && (
          <div className="card mb-6">
            <h2 className="text-text-primary font-semibold text-lg mb-3">Emotional Meaning</h2>
            <p className="text-text-secondary leading-relaxed">{alert.emotional_meaning}</p>
          </div>
        )}

        {/* Practical Advice */}
        {alert.practical_advice && (
          <div className="card mb-6">
            <h2 className="text-text-primary font-semibold text-lg mb-3">Practical Advice</h2>
            <p className="text-text-secondary leading-relaxed">{alert.practical_advice}</p>
          </div>
        )}

        {/* Planets Involved */}
        {alert.planets_involved && alert.planets_involved.length > 0 && (
          <div className="card mb-6">
            <h2 className="text-text-primary font-semibold text-lg mb-3">Planets Involved</h2>
            <div className="flex flex-wrap gap-2">
              {alert.planets_involved.map((planet) => (
                <span
                  key={planet}
                  className="px-3 py-1 rounded-full text-sm font-medium text-text-secondary bg-bg-tertiary border border-border-primary"
                >
                  {planet}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Created Date */}
        <p className="text-text-muted text-sm text-center">
          Created {formatDate(alert.created_at)}
        </p>
      </div>
    </div>
  )
}
