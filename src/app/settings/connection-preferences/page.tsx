'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { ArrowLeft, Heart } from 'lucide-react'
import Link from 'next/link'

const CONNECTION_TYPE_OPTIONS = [
  'Romance',
  'Marriage',
  'Sacred union',
  'Casual chemistry',
  'Friendship',
  'Creative partner',
  'Healing connection',
  'Spiritual partnership',
]

const ENERGETIC_PACE_OPTIONS = [
  'Slow and intentional',
  'Moderate',
  'Fast chemistry',
  'Let it unfold naturally',
]

const SPIRITUAL_OPENNESS_OPTIONS = [
  'Very spiritual',
  'Somewhat spiritual',
  'Open but unsure',
  'Not a focus',
  'Prefer not to say',
]

export default function ConnectionPreferencesPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [connectionType, setConnectionType] = useState('')
  const [energeticPace, setEnergeticPace] = useState('')
  const [spiritualOpenness, setSpiritualOpenness] = useState('')
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!user) return

    async function loadPreferences() {
      const supabase = createClient()
      const { data } = await supabase
        .from('relationship_profiles')
        .select('connection_type, energetic_pace, spiritual_openness')
        .eq('user_id', user!.id)
        .single()

      if (data) {
        setConnectionType(data.connection_type || '')
        setEnergeticPace(data.energetic_pace || '')
        setSpiritualOpenness(data.spiritual_openness || '')
      }
    }

    loadPreferences()
  }, [user])

  async function handleSave() {
    if (!user) return

    setSaving(true)
    setSuccessMessage('')

    const supabase = createClient()
    const { error } = await supabase
      .from('relationship_profiles')
      .upsert(
        {
          user_id: user.id,
          connection_type: connectionType,
          energetic_pace: energeticPace,
          spiritual_openness: spiritualOpenness,
        },
        { onConflict: 'user_id' }
      )

    setSaving(false)

    if (!error) {
      setSuccessMessage('Preferences saved successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  function ChipGroup({
    options,
    selected,
    onSelect,
  }: {
    options: string[]
    selected: string
    onSelect: (value: string) => void
  }) {
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selected === option
                ? 'bg-accent-primary text-white'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('common.back')} {t('common.settings')}</span>
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-6 h-6 text-accent-primary" />
        <h1 className="text-2xl font-bold text-text-primary">
          {t('settings.connectionPreferences.title')}
        </h1>
      </div>

      <div className="space-y-5">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-1">
            Connection Type
          </h2>
          <p className="text-sm text-text-muted mb-4">
            What kind of connection are you seeking?
          </p>
          <ChipGroup
            options={CONNECTION_TYPE_OPTIONS}
            selected={connectionType}
            onSelect={setConnectionType}
          />
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-1">
            Energetic Pace
          </h2>
          <p className="text-sm text-text-muted mb-4">
            How do you prefer connections to develop?
          </p>
          <ChipGroup
            options={ENERGETIC_PACE_OPTIONS}
            selected={energeticPace}
            onSelect={setEnergeticPace}
          />
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-1">
            Spiritual Openness
          </h2>
          <p className="text-sm text-text-muted mb-4">
            How would you describe your spiritual outlook?
          </p>
          <ChipGroup
            options={SPIRITUAL_OPENNESS_OPTIONS}
            selected={spiritualOpenness}
            onSelect={setSpiritualOpenness}
          />
        </div>
      </div>

      {successMessage && (
        <div className="mt-5 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm text-center">
          {successMessage}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary w-full mt-6"
      >
        {saving ? t('common.loading') : t('common.save')}
      </button>
    </div>
  )
}
