import { describe, it, expect } from 'vitest';
import {
  COSMIC_BODIES,
  LEGACY_BODY_ROUTES,
  getBodyBySlug,
  getLearnMorePath,
  getBodyRoutePrefix,
} from '../index';
import { COSMIC_BODY_SLUGS } from '../slugs';
import { getBodySignContent, getBodyEssence, ALL_SIGN_KEYS } from '../types';

/**
 * Every body the chart engine can emit. Mirrors PLANET_NAMES in
 * align-api-v2/app/engine/constants.py plus AVAILABLE_ASTEROIDS in the
 * mobile chart screen. If a name is added there, this list must grow —
 * and the assertions below will fail until it has a page.
 */
const ALL_CHART_BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
  'Uranus', 'Neptune', 'Pluto', 'North Node', 'South Node', 'Chiron',
  'Ascendant', 'Descendant', 'MC', 'IC', 'Vertex', 'Anti-Vertex',
  'Part of Fortune', 'Part of Spirit',
  'Eros', 'Psyche', 'Lilith', 'Juno', 'Vesta', 'Ceres', 'Pallas',
  'Pholus', 'Nessus', 'Chariklo', 'Karma', 'Amor', 'Valentine',
  'Union', 'Angel', 'DNA', 'Child', 'Fortuna', 'Hygiea', 'Astraea',
  'Hecate', 'Nemesis', 'Nike', 'Isis', 'Osiris', 'Horus', 'Apollo', 'Sappho',
  'Urania', 'Eris', 'Sedna', 'Haumea', 'Makemake', 'Narcissus', 'Echo',
  'Pandora', 'Icarus', 'Daedalus', 'Orpheus', 'Eurydike', 'Persephone',
  'Proserpina', 'Diana', 'Minerva', 'Bacchus', 'Circe', 'Medea',
  'Kassandra', 'Achilles', 'Sphinx', 'Atlantis', 'Tantalus', 'Sisyphus',
  'Damocles', 'Lucifer', 'Magdalena', 'Cupido', 'Destinn', 'Abundantia',
  'Industria',
];

describe('cosmic body registry', () => {
  it('gives every chart body a learn-more page', () => {
    const missing = ALL_CHART_BODIES.filter((b) => !getBodyRoutePrefix(b));
    expect(missing).toEqual([]);
  });

  it('produces a valid path for every body in every sign', () => {
    for (const body of ALL_CHART_BODIES) {
      for (const sign of ALL_SIGN_KEYS) {
        const path = getLearnMorePath(body, sign);
        expect(path, `${body} in ${sign}`).toMatch(/^\/[a-z-]+\/[a-z]+$/);
      }
    }
  });

  it('returns null rather than a dead link for unknown bodies', () => {
    expect(getLearnMorePath('Not A Real Body', 'aries')).toBeNull();
    expect(getLearnMorePath('Ceres', 'Ophiuchus')).toBeNull();
  });

  it('accepts the capitalised sign names the chart engine emits', () => {
    expect(getLearnMorePath('Ceres', 'Scorpio')).toBe('/ceres-in/scorpio');
    expect(getLearnMorePath('Descendant', 'Leo')).toBe('/descendant-in/leo');
  });

  it('keeps slugs.ts in sync with the registry', () => {
    expect([...COSMIC_BODY_SLUGS].sort()).toEqual(COSMIC_BODIES.map((b) => b.slug).sort());
  });

  it('has no duplicate slugs or keys', () => {
    expect(new Set(COSMIC_BODIES.map((b) => b.slug)).size).toBe(COSMIC_BODIES.length);
    expect(new Set(COSMIC_BODIES.map((b) => b.key)).size).toBe(COSMIC_BODIES.length);
  });

  it('never collides with a legacy planet route', () => {
    const legacy = new Set(Object.values(LEGACY_BODY_ROUTES));
    for (const slug of COSMIC_BODY_SLUGS) expect(legacy.has(slug)).toBe(false);
  });
});

describe('composed page content', () => {
  it('renders non-empty sections for every body in every sign', () => {
    for (const body of COSMIC_BODIES) {
      for (const sign of ALL_SIGN_KEYS) {
        const c = getBodySignContent(body, sign);
        expect(c.title, body.key).toBeTruthy();
        expect(c.intro.length, `${body.key} ${sign} intro`).toBeGreaterThan(80);
        expect(c.sections.length).toBeGreaterThanOrEqual(6);
        for (const s of c.sections) {
          expect(s.paragraphs.length, `${body.key} ${sign} ${s.title}`).toBeGreaterThan(0);
          for (const p of s.paragraphs) {
            expect(p.trim().length, `${body.key} ${sign} ${s.title}`).toBeGreaterThan(40);
          }
        }
      }
    }
  });

  it('has an essence paragraph for every body', () => {
    for (const body of COSMIC_BODIES) {
      expect(getBodyEssence(body).length, body.key).toBeGreaterThan(120);
    }
  });

  it('produces different section text for different signs', () => {
    const ceres = getBodyBySlug('ceres-in')!;
    const aries = getBodySignContent(ceres, 'aries');
    const pisces = getBodySignContent(ceres, 'pisces');
    expect(aries.sections[1].paragraphs).not.toEqual(pisces.sections[1].paragraphs);
  });
});
