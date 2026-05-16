import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import zh from './locales/zh.json';
import ar from './locales/ar.json';
import hi from './locales/hi.json';
import tr from './locales/tr.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import sv from './locales/sv.json';
import da from './locales/da.json';
import no from './locales/no.json';
import fi from './locales/fi.json';
import th from './locales/th.json';

const STORAGE_KEY = 'align_language';

function getSavedLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  try {
    return localStorage.getItem(STORAGE_KEY) || 'en';
  } catch {
    return 'en';
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en }, es: { translation: es }, fr: { translation: fr },
    de: { translation: de }, it: { translation: it }, pt: { translation: pt },
    ru: { translation: ru }, ja: { translation: ja }, ko: { translation: ko },
    zh: { translation: zh }, ar: { translation: ar }, hi: { translation: hi },
    tr: { translation: tr }, nl: { translation: nl }, pl: { translation: pl },
    sv: { translation: sv }, da: { translation: da }, no: { translation: no },
    fi: { translation: fi }, th: { translation: th },
  },
  lng: getSavedLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export function changeLanguage(lang: string): void {
  i18n.changeLanguage(lang);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  }
}

export default i18n;
