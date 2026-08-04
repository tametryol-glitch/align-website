/* ──────────────────────────────────────────────────────────────
   SEO locale dictionary (server-side)
   Chrome strings + localized sign / element / modality names for the
   localized SEO pages (pilot: Moon-sign family). English pages keep
   their own literals; this covers only the non-English SEO locales.
   ────────────────────────────────────────────────────────────── */

import type { ZodiacSign } from '@/data/moonSignContent';

export const SEO_LOCALES = ['es', 'pt', 'fr'] as const;
export type SeoLocale = (typeof SEO_LOCALES)[number];

/** BCP-47 tags for hreflang / <html lang>. */
export const HREFLANG: Record<SeoLocale, string> = {
  es: 'es',
  pt: 'pt',
  fr: 'fr',
};

export function isSeoLocale(x: string): x is SeoLocale {
  return (SEO_LOCALES as readonly string[]).includes(x);
}

/** Interpolate {name} / {element} / {modality} / {glyph} tokens. */
export function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

type Names = Record<ZodiacSign, string>;

export const SIGN_NAMES: Record<SeoLocale, Names> = {
  es: {
    aries: 'Aries', taurus: 'Tauro', gemini: 'Géminis', cancer: 'Cáncer',
    leo: 'Leo', virgo: 'Virgo', libra: 'Libra', scorpio: 'Escorpio',
    sagittarius: 'Sagitario', capricorn: 'Capricornio', aquarius: 'Acuario', pisces: 'Piscis',
  },
  pt: {
    aries: 'Áries', taurus: 'Touro', gemini: 'Gêmeos', cancer: 'Câncer',
    leo: 'Leão', virgo: 'Virgem', libra: 'Libra', scorpio: 'Escorpião',
    sagittarius: 'Sagitário', capricorn: 'Capricórnio', aquarius: 'Aquário', pisces: 'Peixes',
  },
  fr: {
    aries: 'Bélier', taurus: 'Taureau', gemini: 'Gémeaux', cancer: 'Cancer',
    leo: 'Lion', virgo: 'Vierge', libra: 'Balance', scorpio: 'Scorpion',
    sagittarius: 'Sagittaire', capricorn: 'Capricorne', aquarius: 'Verseau', pisces: 'Poissons',
  },
};

type Element = 'fire' | 'earth' | 'air' | 'water';
export const ELEMENT_NAMES: Record<SeoLocale, Record<Element, string>> = {
  es: { fire: 'Fuego', earth: 'Tierra', air: 'Aire', water: 'Agua' },
  pt: { fire: 'Fogo', earth: 'Terra', air: 'Ar', water: 'Água' },
  fr: { fire: 'Feu', earth: 'Terre', air: 'Air', water: 'Eau' },
};

/** Element name with the locale's "of" connector, handling French vowel
 *  elision ("de Feu" but "d'Air"). Used for "{Element} Moon Sign(s)". */
export function elementDe(loc: SeoLocale, el: Element): string {
  const name = ELEMENT_NAMES[loc][el];
  if (loc === 'fr') {
    return /^[aeiouyàâäéèêëîïôöûü]/i.test(name) ? `d’${name}` : `de ${name}`;
  }
  return `de ${name}`;
}

type Modality = 'cardinal' | 'fixed' | 'mutable';
export const MODALITY_NAMES: Record<SeoLocale, Record<Modality, string>> = {
  es: { cardinal: 'Cardinal', fixed: 'Fijo', mutable: 'Mutable' },
  pt: { cardinal: 'Cardeal', fixed: 'Fixo', mutable: 'Mutável' },
  fr: { cardinal: 'Cardinal', fixed: 'Fixe', mutable: 'Mutable' },
};

/** UI chrome for the Moon-sign pages, per locale. Values may contain
 *  {name} {element} {modality} {glyph} tokens — interpolate with fill(). */
export interface MoonChrome {
  // shared
  getStartedFree: string;
  home: string;
  moonSigns: string;
  allMoonSigns: string;
  zodiacSigns: string;
  compatibility: string;
  terms: string;
  privacy: string;
  allRightsReserved: string;
  freeToStart: string;
  moonLabel: string;
  emotionalBlueprint: string;
  // index
  indexIntro: string;
  elementMoonSigns: string; // "{element} Moon Signs"
  moonInName: string; // "Moon in {name}"
  elementMoon: string; // "{element} Moon"
  discoverYourMoonSign: string;
  indexCtaCopy: string;
  getFullBirthChart: string;
  metaIndexTitle: string;
  metaIndexDescription: string;
  // detail
  modalityQuality: string; // "{modality} Quality"
  explorePlacements: string; // "Explore {name} Placements"
  sunSign: string;
  risingSign: string;
  venusSign: string;
  marsSign: string;
  mercurySign: string;
  nameRising: string; // "{name} Rising"
  venusInName: string; // "Venus in {name}"
  marsInName: string; // "Mars in {name}"
  mercuryInName: string; // "Mercury in {name}"
  nameMatches: string; // "{name} Matches"
  getYourFullChart: string;
  detailCtaCopy: string;
  detailSubhead: string; // header subtitle under "Moon in {name}"
  metaTitle: string; // "Moon in {name} — ..."
  metaDescription: string;
}

export const MOON_CHROME: Record<SeoLocale, MoonChrome> = {
  es: {
    getStartedFree: 'Empieza gratis',
    home: 'Inicio',
    moonSigns: 'Signos lunares',
    allMoonSigns: 'Todos los signos lunares',
    zodiacSigns: 'Signos del zodiaco',
    compatibility: 'Compatibilidad',
    terms: 'Términos',
    privacy: 'Privacidad',
    allRightsReserved: 'Todos los derechos reservados.',
    freeToStart: 'Gratis para empezar. Sin tarjeta de crédito.',
    moonLabel: 'Luna',
    emotionalBlueprint: 'Tu mapa emocional',
    indexIntro:
      'Tu signo lunar revela tu núcleo emocional: cómo procesas los sentimientos, qué necesitas para sentirte seguro y cómo amas en el nivel más profundo. Explora las 12 posiciones lunares.',
    elementMoonSigns: 'Signos lunares {element}',
    moonInName: 'Luna en {name}',
    elementMoon: 'Luna {element}',
    discoverYourMoonSign: 'Descubre tu signo lunar',
    indexCtaCopy:
      'Tu signo lunar se calcula a partir de tu hora y lugar de nacimiento exactos. Align genera tu carta natal completa con interpretaciones impulsadas por IA.',
    getFullBirthChart: 'Obtén tu carta natal completa',
    metaIndexTitle: 'Signos lunares: tu mapa emocional en la astrología',
    metaIndexDescription:
      'Explora los 12 signos lunares con guías detalladas sobre las necesidades emocionales, el mundo interior y lo que cada signo lunar necesita en el amor. Descubre tu posición lunar.',
    modalityQuality: 'Cualidad {modality}',
    explorePlacements: 'Explora las posiciones de {name}',
    sunSign: 'Signo solar',
    risingSign: 'Ascendente',
    venusSign: 'Signo de Venus',
    marsSign: 'Signo de Marte',
    mercurySign: 'Signo de Mercurio',
    nameRising: 'Ascendente {name}',
    venusInName: 'Venus en {name}',
    marsInName: 'Marte en {name}',
    mercuryInName: 'Mercurio en {name}',
    nameMatches: 'Compatibilidades de {name}',
    getYourFullChart: 'Obtén tu carta completa',
    detailCtaCopy:
      'Tu signo lunar es solo una capa de tu paisaje emocional. Descubre tu mapa cósmico completo con Align.',
    detailSubhead: 'Tu plano emocional',
    metaTitle: 'Luna en {name}: necesidades emocionales, mundo interior y amor',
    metaDescription:
      'Descubre qué significa la Luna en {name} ({glyph}) para tus emociones, tu mundo interior y lo que necesitas en el amor. Una guía profunda de tu posición lunar.',
  },
  pt: {
    getStartedFree: 'Comece grátis',
    home: 'Início',
    moonSigns: 'Signos lunares',
    allMoonSigns: 'Todos os signos lunares',
    zodiacSigns: 'Signos do zodíaco',
    compatibility: 'Compatibilidade',
    terms: 'Termos',
    privacy: 'Privacidade',
    allRightsReserved: 'Todos os direitos reservados.',
    freeToStart: 'Grátis para começar. Sem cartão de crédito.',
    moonLabel: 'Lua',
    emotionalBlueprint: 'Seu mapa emocional',
    indexIntro:
      'Seu signo lunar revela seu núcleo emocional: como você processa os sentimentos, do que precisa para se sentir seguro e como ama no nível mais profundo. Explore as 12 posições lunares.',
    elementMoonSigns: 'Signos lunares {element}',
    moonInName: 'Lua em {name}',
    elementMoon: 'Lua {element}',
    discoverYourMoonSign: 'Descubra seu signo lunar',
    indexCtaCopy:
      'Seu signo lunar é calculado a partir da hora e do local exatos do seu nascimento. A Align gera seu mapa natal completo com interpretações baseadas em IA.',
    getFullBirthChart: 'Obtenha seu mapa natal completo',
    metaIndexTitle: 'Signos lunares: seu mapa emocional na astrologia',
    metaIndexDescription:
      'Explore os 12 signos lunares com guias detalhados sobre as necessidades emocionais, o mundo interior e o que cada signo lunar precisa no amor. Descubra sua posição lunar.',
    modalityQuality: 'Qualidade {modality}',
    explorePlacements: 'Explore as posições de {name}',
    sunSign: 'Signo solar',
    risingSign: 'Ascendente',
    venusSign: 'Signo de Vênus',
    marsSign: 'Signo de Marte',
    mercurySign: 'Signo de Mercúrio',
    nameRising: 'Ascendente em {name}',
    venusInName: 'Vênus em {name}',
    marsInName: 'Marte em {name}',
    mercuryInName: 'Mercúrio em {name}',
    nameMatches: 'Combinações de {name}',
    getYourFullChart: 'Obtenha seu mapa completo',
    detailCtaCopy:
      'Seu signo lunar é apenas uma camada da sua paisagem emocional. Descubra seu mapa cósmico completo com a Align.',
    detailSubhead: 'Seu plano emocional',
    metaTitle: 'Lua em {name}: necessidades emocionais, mundo interior e amor',
    metaDescription:
      'Descubra o que a Lua em {name} ({glyph}) significa para suas emoções, seu mundo interior e o que você precisa no amor. Um guia completo da sua posição lunar.',
  },
  fr: {
    getStartedFree: 'Commencer gratuitement',
    home: 'Accueil',
    moonSigns: 'Signes lunaires',
    allMoonSigns: 'Tous les signes lunaires',
    zodiacSigns: 'Signes du zodiaque',
    compatibility: 'Compatibilité',
    terms: 'Conditions',
    privacy: 'Confidentialité',
    allRightsReserved: 'Tous droits réservés.',
    freeToStart: 'Gratuit pour commencer. Sans carte bancaire.',
    moonLabel: 'Lune',
    emotionalBlueprint: 'Votre carte émotionnelle',
    indexIntro:
      "Votre signe lunaire révèle votre cœur émotionnel : comment vous traversez vos émotions, ce dont vous avez besoin pour vous sentir en sécurité et comment vous aimez au plus profond. Explorez les 12 positions lunaires.",
    elementMoonSigns: 'Signes lunaires {element}',
    moonInName: 'Lune en {name}',
    elementMoon: 'Lune {element}',
    discoverYourMoonSign: 'Découvrez votre signe lunaire',
    indexCtaCopy:
      'Votre signe lunaire se calcule à partir de votre heure et de votre lieu de naissance exacts. Align génère votre thème natal complet avec des interprétations propulsées par l’IA.',
    getFullBirthChart: 'Obtenez votre thème natal complet',
    metaIndexTitle: 'Signes lunaires : votre carte émotionnelle en astrologie',
    metaIndexDescription:
      'Explorez les 12 signes lunaires avec des guides détaillés sur les besoins émotionnels, le monde intérieur et ce dont chaque signe lunaire a besoin en amour. Découvrez votre position lunaire.',
    modalityQuality: 'Qualité {modality}',
    explorePlacements: 'Explorez les positions de {name}',
    sunSign: 'Signe solaire',
    risingSign: 'Ascendant',
    venusSign: 'Signe de Vénus',
    marsSign: 'Signe de Mars',
    mercurySign: 'Signe de Mercure',
    nameRising: 'Ascendant {name}',
    venusInName: 'Vénus en {name}',
    marsInName: 'Mars en {name}',
    mercuryInName: 'Mercure en {name}',
    nameMatches: 'Compatibilités {name}',
    getYourFullChart: 'Obtenez votre thème complet',
    detailCtaCopy:
      "Votre signe lunaire n’est qu’une facette de votre paysage émotionnel. Découvrez votre carte cosmique complète avec Align.",
    detailSubhead: 'Votre plan émotionnel',
    metaTitle: 'Lune en {name} : besoins émotionnels, monde intérieur et amour',
    metaDescription:
      'Découvrez ce que la Lune en {name} ({glyph}) signifie pour vos émotions, votre monde intérieur et vos besoins en amour. Un guide complet de votre position lunaire.',
  },
};
