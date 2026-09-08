/**
 * Locale → voice mapping for the self-hosted Kokoro TTS sidecar.
 *
 * Kokoro's voices-v1.0.bin ships 54 voices, but they only cover 9 language
 * families: American/British English, Spanish, French, Hindi, Italian,
 * Japanese, Brazilian Portuguese and Mandarin. Align ships 20 locales, so the
 * other 12 fall back to the browser's own speech synthesis (OS voices) —
 * robotic, but free, instant and available in every language.
 *
 * `lang` is the espeak-style code kokoro-onnx uses for phonemization. Getting
 * it wrong doesn't just change the accent, it garbles the words — so every
 * entry here pairs the voice with its matching language code.
 */

export interface KokoroVoice {
  /** Voice name from voices-v1.0.bin, e.g. "ef_dora". */
  voice: string;
  /** Phonemizer language code, e.g. "es". */
  lang: string;
}

/** The 8 of Align's 20 locales that Kokoro can actually speak. */
export const KOKORO_BY_LOCALE: Record<string, KokoroVoice> = {
  en: { voice: 'af_heart', lang: 'en-us' },
  es: { voice: 'ef_dora', lang: 'es' },
  fr: { voice: 'ff_siwis', lang: 'fr-fr' },
  hi: { voice: 'hf_alpha', lang: 'hi' },
  it: { voice: 'if_sara', lang: 'it' },
  ja: { voice: 'jf_alpha', lang: 'ja' },
  pt: { voice: 'pf_dora', lang: 'pt-br' },
  zh: { voice: 'zf_xiaoxiao', lang: 'cmn' },
};

/**
 * BCP-47 tags for the browser APIs (SpeechRecognition and speechSynthesis),
 * covering all 20 locales. Used for input in every language, and for output in
 * the 12 Kokoro can't speak.
 */
export const BCP47_BY_LOCALE: Record<string, string> = {
  ar: 'ar-SA',
  da: 'da-DK',
  de: 'de-DE',
  en: 'en-US',
  es: 'es-ES',
  fi: 'fi-FI',
  fr: 'fr-FR',
  hi: 'hi-IN',
  it: 'it-IT',
  ja: 'ja-JP',
  ko: 'ko-KR',
  nl: 'nl-NL',
  no: 'nb-NO',
  pl: 'pl-PL',
  pt: 'pt-BR',
  ru: 'ru-RU',
  sv: 'sv-SE',
  th: 'th-TH',
  tr: 'tr-TR',
  zh: 'zh-CN',
};

/** Normalise "en-GB" / "pt_BR" to the two-letter key used above. */
export function baseLocale(locale?: string | null): string {
  return (locale || 'en').toLowerCase().split(/[-_]/)[0];
}

/** The Kokoro voice for a locale, or null when it must fall back to OS voices. */
export function kokoroFor(locale?: string | null): KokoroVoice | null {
  return KOKORO_BY_LOCALE[baseLocale(locale)] ?? null;
}

/** BCP-47 tag for the browser speech APIs. Always resolves. */
export function bcp47For(locale?: string | null): string {
  return BCP47_BY_LOCALE[baseLocale(locale)] ?? 'en-US';
}
