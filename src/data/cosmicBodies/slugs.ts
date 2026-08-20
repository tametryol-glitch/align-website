/* ──────────────────────────────────────────────────────────────
   GENERATED — dependency-free routing data for the cosmic bodies.

   middleware.ts runs on the edge and the chart screen is a client
   component; neither should pull in the whole interpretation engine
   just to build a link. Both import this file instead.

   __tests__/cosmicBodies.test.ts asserts this stays in sync with the
   registry in ./index.ts, so a new body cannot ship half-wired.
   ────────────────────────────────────────────────────────────── */

/** Chart body name (exactly as the engine emits it) -> route prefix. */
export const BODY_KEY_TO_SLUG: Record<string, string> = {
  Descendant: 'descendant-in',
  MC: 'midheaven-in',
  IC: 'imum-coeli-in',
  Vertex: 'vertex-in',
  'Anti-Vertex': 'anti-vertex-in',
  'Part of Fortune': 'part-of-fortune-in',
  'Part of Spirit': 'part-of-spirit-in',
  Ceres: 'ceres-in',
  Pallas: 'pallas-in',
  Eros: 'eros-in',
  Psyche: 'psyche-in',
  Lilith: 'lilith-in',
  Amor: 'amor-in',
  Valentine: 'valentine-in',
  Union: 'union-in',
  Cupido: 'cupido-in',
  Sappho: 'sappho-in',
  Child: 'child-in',
  DNA: 'dna-in',
  Narcissus: 'narcissus-in',
  Echo: 'echo-in',
  Medea: 'medea-in',
  Magdalena: 'magdalena-in',
  Eurydike: 'eurydike-in',
  Orpheus: 'orpheus-in',
  Karma: 'karma-in',
  Destinn: 'destinn-in',
  Fortuna: 'fortuna-in',
  Nemesis: 'nemesis-in',
  Nike: 'nike-in',
  Astraea: 'astraea-in',
  Hecate: 'hecate-in',
  Abundantia: 'abundantia-in',
  Industria: 'industria-in',
  Hygiea: 'hygiea-in',
  Urania: 'urania-in',
  Angel: 'angel-in',
  Sphinx: 'sphinx-in',
  Pholus: 'pholus-in',
  Nessus: 'nessus-in',
  Chariklo: 'chariklo-in',
  Eris: 'eris-in',
  Sedna: 'sedna-in',
  Haumea: 'haumea-in',
  Makemake: 'makemake-in',
  Persephone: 'persephone-in',
  Proserpina: 'proserpina-in',
  Lucifer: 'lucifer-in',
  Damocles: 'damocles-in',
  Tantalus: 'tantalus-in',
  Sisyphus: 'sisyphus-in',
  Isis: 'isis-in',
  Osiris: 'osiris-in',
  Horus: 'horus-in',
  Apollo: 'apollo-in',
  Diana: 'diana-in',
  Minerva: 'minerva-in',
  Bacchus: 'bacchus-in',
  Circe: 'circe-in',
  Kassandra: 'kassandra-in',
  Achilles: 'achilles-in',
  Atlantis: 'atlantis-in',
  Pandora: 'pandora-in',
  Icarus: 'icarus-in',
  Daedalus: 'daedalus-in',
};

export const COSMIC_BODY_SLUGS: string[] = Object.values(BODY_KEY_TO_SLUG);
