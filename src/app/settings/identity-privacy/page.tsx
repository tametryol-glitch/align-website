'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { ArrowLeft, Eye, EyeOff, Shield } from 'lucide-react'
import Link from 'next/link'

type VisibilityValue = 'show_on_profile' | 'match_only' | 'hidden'

interface PrivacySettings {
  sexual_orientation: VisibilityValue
  interested_in_genders: VisibilityValue
  relationship_primary_intent: VisibilityValue
  relationship_style: VisibilityValue
  connection_type_wanted: VisibilityValue
  energetic_pace: VisibilityValue
  spiritual_openness: VisibilityValue
}

const FIELDS: { key: keyof PrivacySettings; label: string }[] = [
  { key: 'sexual_orientation', label: 'Sexual / Romantic Orientation' },
  { key: 'interested_in_genders', label: 'Interested In' },
  { key: 'relationship_primary_intent', label: 'Relationship Intent' },
  { key: 'relationship_style', label: 'Relationship Style' },
  { key: 'connection_type_wanted', label: 'Connection Type' },
  { key: 'energetic_pace', label: 'Energetic Pace' },
  { key: 'spiritual_openness', label: 'Spiritual Openness' },
]

const VISIBILITY_OPTIONS: { value: VisibilityValue; label: string; description: string }[] = [
  { value: 'show_on_profile', label: 'Show on profile', description: 'Visible to everyone' },
  { value: 'match_only', label: 'Matching only', description: 'Used for filtering, not shown' },
  { value: 'hidden', label: 'Hidden', description: 'Not used or shown' },
]

const DEFAULT_SETTINGS: PrivacySettings = {
  sexual_orientation: 'match_only',
  interested_in_genders: 'match_only',
  relationship_primary_intent: 'match_only',
  relationship_style: 'match_only',
  connection_type_wanted: 'match_only',
  energetic_pace: 'match_only',
  spiritual_openness: 'match_only',
}

export default function IdentityPrivacyPage() {
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    async function loadSettings() {
      if (!user?.id) return

      const supabase = createClient()
      const { data, error } = await supabase
        .from('relationship_profiles')
        .select('identity_privacy')
        .eq('user_id', user.id)
        .single()

      if (!error && data?.identity_privacy) {
        setSettings({ ...DEFAULT_SETTINGS, ...data.identity_privacy })
      }

      setLoading(false)
    }

    loadSettings()
  }, [user?.id])

  const handleChange = (field: keyof PrivacySettings, value: VisibilityValue) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
    setSuccess(false)
  }

  const handleSave = async () => {
    if (!user?.id) return

    setSaving(true)
    setSuccess(false)

    const supabase = createClient()
    const { error } = await supabase
      .from('relationship_profiles')
      .upsert(
        { user_id: user.id, identity_privacy: settings },
        { onConflict: 'user_id' }
      )

    if (!error) {
      setSuccess(true)
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back link */}
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Settings</span>
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-accent-primary" />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Identity Privacy</h1>
            <p className="text-text-secondary text-sm">
              Control who sees your dating profile details
            </p>
          </div>
        </div>

        {/* Fields */}
        <div className="card space-y-4 p-6">
          {FIELDS.map((field) => (
            <div
              key={field.key}
              className="border border-border-primary rounded-lg p-4"
            >
              <h3 className="text-text-primary font-medium mb-3">{field.label}</h3>
              <div className="flex flex-wrap gap-2">
                {VISIBILITY_OPTIONS.map((option) => {
                  const isSelected = settings[field.key] === option.value
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleChange(field.key, option.value)}
                      className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                        transition-all border
                        ${
                          isSelected
                            ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                            : 'bg-bg-tertiary border-border-primary text-text-muted hover:text-text-secondary hover:border-border-primary/80'
                        }
                      `}
                      title={option.description}
                    >
                      {option.value === 'show_on_profile' && <Eye className="w-3.5 h-3.5" />}
                      {option.value === 'match_only' && <Shield className="w-3.5 h-3.5" />}
                      {option.value === 'hidden' && <EyeOff className="w-3.5 h-3.5" />}
                      {option.label}
                    </button>
                  )
                })}
              </div>
              <p className="text-text-muted text-xs mt-2">
                {VISIBILITY_OPTIONS.find((o) => o.value === settings[field.key])?.description}
              </p>
            </div>
          ))}
        </div>

        {/* Save button & success message */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-6 py-2.5 rounded-lg font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Privacy Settings'}
          </button>
          {success && (
            <span className="text-green-400 text-sm font-medium">
              Settings saved successfully
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
