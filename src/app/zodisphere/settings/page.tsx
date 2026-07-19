'use client';

/**
 * Zodisphere visibility settings.
 *
 * The ONLY place a user associates a place with their profile. The place
 * is chosen from a fixed picker (no free text, no GPS); default state is
 * HIDDEN; every change is consent-logged server-side by a DB trigger.
 * "Remove my location" fully clears the association (consent withdrawal).
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Search, ShieldCheck, Trash2 } from 'lucide-react';
import {
  getMyPrefs,
  getArea,
  searchAreas,
  upsertMyPrefs,
  removeMyLocationAssociation,
  type Area,
  type VisibilityMode,
} from '@/lib/zodisphereService';

const MODES: { value: VisibilityMode; labelKey: string; hintKey: string }[] = [
  { value: 'hidden',  labelKey: 'zodisphere.settings.modeHidden',  hintKey: 'zodisphere.settings.modeHiddenHint' },
  { value: 'country', labelKey: 'zodisphere.settings.modeCountry', hintKey: 'zodisphere.settings.modeCountryHint' },
  { value: 'region',  labelKey: 'zodisphere.settings.modeRegion',  hintKey: 'zodisphere.settings.modeRegionHint' },
  { value: 'city',    labelKey: 'zodisphere.settings.modeCity',    hintKey: 'zodisphere.settings.modeCityHint' },
  { value: 'friends', labelKey: 'zodisphere.settings.modeFriends', hintKey: 'zodisphere.settings.modeFriendsHint' },
  { value: 'public',  labelKey: 'zodisphere.settings.modePublic',  hintKey: 'zodisphere.settings.modePublicHint' },
];

export default function ZodisphereSettingsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<VisibilityMode>('hidden');
  const [area, setArea] = useState<Area | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Area[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const prefs = await getMyPrefs();
      if (prefs) {
        setMode(prefs.visibility_mode);
        if (prefs.area_id) setArea(await getArea(prefs.area_id));
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => setResults(await searchAreas(query.trim())), 250);
    return () => clearTimeout(t);
  }, [query]);

  const save = useCallback(async () => {
    if (mode !== 'hidden' && !area) {
      setMessage(t('zodisphere.settings.choosePlaceFirst'));
      return;
    }
    setSaving(true);
    setMessage(null);
    const res = await upsertMyPrefs({
      areaId: area?.id ?? null,
      discoverable: mode !== 'hidden',
      visibilityMode: mode,
    });
    setSaving(false);
    if (!res.success) {
      setMessage(res.error ?? t('zodisphere.settings.saveFailed'));
    } else if (mode === 'hidden') {
      setMessage(t('zodisphere.settings.savedHidden'));
    } else {
      setMessage(
        t('zodisphere.settings.savedOnMap', { place: area?.display_name ?? t('zodisphere.settings.yourPlace') })
      );
    }
  }, [mode, area, t]);

  const removeAll = useCallback(async () => {
    setSaving(true);
    const res = await removeMyLocationAssociation();
    setSaving(false);
    if (res.success) {
      setMode('hidden');
      setArea(null);
      setMessage(t('zodisphere.settings.removedHidden'));
    } else {
      setMessage(res.error ?? t('zodisphere.settings.removeFailed'));
    }
  }, [t]);

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link href="/zodisphere" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> {t('zodisphere.settings.back')}
        </Link>

        <h1 className="text-xl font-semibold text-text-primary">{t('zodisphere.settings.title')}</h1>
        <p className="text-sm text-text-muted mt-1">
          {t('zodisphere.settings.subtitle')}
        </p>

        {loading ? (
          <p className="text-sm text-text-muted mt-8">{t('zodisphere.settings.loading')}</p>
        ) : (
          <div className="mt-6 space-y-6">
            {/* ── Place picker ── */}
            <section className="bg-bg-card border border-border-primary rounded-2xl p-4">
              <h2 className="flex items-center gap-1.5 text-sm font-medium text-text-primary mb-3">
                <MapPin className="w-4 h-4 text-accent-primary" /> {t('zodisphere.settings.myPlace')}
              </h2>
              {area ? (
                <div className="flex items-center justify-between bg-bg-secondary rounded-xl px-3 py-2.5">
                  <span className="text-sm text-text-primary">{area.display_name}</span>
                  <button onClick={() => setArea(null)} className="text-xs text-text-muted hover:text-text-primary">
                    {t('zodisphere.settings.change')}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 bg-bg-secondary rounded-xl px-3 py-2.5">
                    <Search className="w-4 h-4 text-text-muted" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t('zodisphere.settings.searchPlaceholder')}
                      className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
                    />
                  </div>
                  {results.length > 0 && (
                    <ul className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-border-primary divide-y divide-border-primary">
                      {results.map((r) => (
                        <li key={r.id}>
                          <button
                            onClick={() => { setArea(r); setQuery(''); setResults([]); }}
                            className="w-full text-left px-3 py-2.5 text-sm text-text-secondary hover:bg-bg-tertiary"
                          >
                            {r.display_name}
                            <span className="text-[10px] text-text-muted ml-2 uppercase">{r.geographic_level}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <p className="text-[11px] text-text-muted mt-3">
                {t('zodisphere.settings.placeNotePre')} <em>{t('zodisphere.settings.placeNoteEm')}</em> {t('zodisphere.settings.placeNotePost')}
              </p>
            </section>

            {/* ── Visibility mode ── */}
            <section className="bg-bg-card border border-border-primary rounded-2xl p-4">
              <h2 className="flex items-center gap-1.5 text-sm font-medium text-text-primary mb-3">
                <ShieldCheck className="w-4 h-4 text-accent-primary" /> {t('zodisphere.settings.whoCanSee')}
              </h2>
              <div className="space-y-1.5">
                {MODES.map((m) => (
                  <label
                    key={m.value}
                    className={`flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer border ${
                      mode === m.value ? 'border-accent-primary bg-bg-tertiary' : 'border-transparent hover:bg-bg-secondary'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      checked={mode === m.value}
                      onChange={() => setMode(m.value)}
                      className="mt-0.5 accent-current"
                    />
                    <span>
                      <span className="block text-sm text-text-primary">{t(m.labelKey)}</span>
                      <span className="block text-[11px] text-text-muted">{t(m.hintKey)}</span>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {message && <p className="text-sm text-accent-primary">{message}</p>}

            <button onClick={save} disabled={saving} className="w-full btn-primary py-2.5 rounded-xl text-sm font-medium">
              {saving ? t('zodisphere.settings.saving') : t('zodisphere.settings.save')}
            </button>

            <button
              onClick={removeAll}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15"
            >
              <Trash2 className="w-4 h-4" /> {t('zodisphere.settings.removeButton')}
            </button>

            <p className="text-[11px] text-text-muted">
              {t('zodisphere.settings.consentNote')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
