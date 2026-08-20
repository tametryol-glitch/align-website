/* ──────────────────────────────────────────────────────────────
   Cosmic Body Content — types + page composer

   Every body that can appear on a natal chart but did NOT have its
   own "learn more" page: the angles (DC / MC / IC / Vertex /
   Anti-Vertex), the Arabic parts, and the full asteroid roster.

   The long-form essence paragraph for each body is NOT duplicated
   here — it is read from PLANET_MEANINGS in the interpretation
   engine so the chart drawer and the web page can never drift.
   ────────────────────────────────────────────────────────────── */

import {
  SIGNS,
  ALL_SIGN_KEYS,
  getElementColor,
  type ZodiacSign,
  type Element,
  type Modality,
} from '../compatibilityContent';
import { PLANET_MEANINGS } from '@/lib/interpretations';

export { SIGNS, ALL_SIGN_KEYS, getElementColor };
export type { ZodiacSign, Element, Modality };

export type BodyKind = 'angle' | 'part' | 'asteroid' | 'centaur' | 'dwarf';

export interface CosmicBody {
  /** Name exactly as the chart engine emits it (e.g. "Part of Fortune"). */
  key: string;
  /** Route prefix without the sign, e.g. "ceres-in" -> /ceres-in/scorpio */
  slug: string;
  /** Display name used in headings. */
  name: string;
  glyph: string;
  kind: BodyKind;
  /** Two-to-four word archetype, e.g. "The Nurturer". */
  tagline: string;
  /** Lowercase noun phrase: "nourishment, care, and what happens when it is withdrawn". */
  domain: string;
  /** Title tail for SEO: "Nurture, Loss & the Care You Give". */
  headline: string;
  /** Optional override for the essence paragraph when PLANET_MEANINGS has no entry. */
  essence?: string;
  /** What this body gives you when it is working. */
  gift: string;
  /** What it costs you when it is not. */
  shadow: string;
  /** How you know it has just been activated in your life. */
  activation: string;
  /** The work — what maturing this placement actually looks like. */
  integration: string;
  /** One bespoke paragraph per element. */
  byElement: Record<Element, string>;
  /** One bespoke paragraph per modality. */
  byModality: Record<Modality, string>;
  /**
   * Optional fully bespoke closing line per sign. Bodies that appear on
   * every chart by default get all twelve; the rest fall back to the
   * shared sign operator below.
   */
  signHooks?: Partial<Record<ZodiacSign, string>>;
}

/* ── Shared per-sign closing line ────────────────────────────────
   Used when a body has no bespoke signHook for that sign. Each one
   is written to take the body's own domain noun, so the sentence
   stays specific rather than reading like a template.
   ────────────────────────────────────────────────────────────── */

const SIGN_OPERATOR: Record<ZodiacSign, (b: CosmicBody) => string> = {
  aries: (b) =>
    `In Aries this point has no patience for build-up. ${b.name} fires first and explains later, which means your relationship with ${b.domain} is written in decisions you made in under a second. The regrets here are almost never the risks you took — they are the times someone talked you into waiting. When this part of your life goes quiet, it is not peace. It is a confrontation you have been postponing.`,
  taurus: (b) =>
    `In Taurus this point digs in. ${b.name} moves slowly here and then refuses to move at all, so ${b.domain} becomes something you hold rather than something you chase. You will tolerate a situation far past its expiry date because leaving costs more than staying hurts. The tell is physical: when this area is wrong, your body knows months before you will say it out loud.`,
  gemini: (b) =>
    `In Gemini this point talks. ${b.name} routes ${b.domain} straight through language — you narrate it, joke about it, explain it to people who did not ask. That is also the escape hatch: when the feeling underneath gets heavy, you describe it instead of having it, and almost nobody notices the switch. What you need here is not more information. It is one conversation you keep rehearsing and never start.`,
  cancer: (b) =>
    `In Cancer this point remembers. ${b.name} attaches ${b.domain} to people, houses, smells, and specific years, and nothing in that archive ever gets marked as resolved. You scan every room for whether you are safe and whether you are wanted, in that order, before you have consciously decided anything. Old hurts here do not fade — they quietly steer choices you are certain were logical.`,
  leo: (b) =>
    `In Leo this point needs a witness. ${b.name} runs ${b.domain} through the question of whether anyone saw it, and being unseen here lands harder than you let on. Your generosity is genuine and it is also a bid — you give most extravagantly to the people whose attention you want. When the audience leaves, the energy here does not calm down. It goes looking for a new room.`,
  virgo: (b) =>
    `In Virgo this point audits. ${b.name} catches the flaw in ${b.domain} before it registers the good, which makes you devastatingly useful and quietly exhausting to be loved by. Your care comes out as correction, and not everyone can tell the difference. The standard you hold here is one you would never impose on another person, which is exactly why you never notice you are failing it.`,
  libra: (b) =>
    `In Libra this point negotiates. ${b.name} measures ${b.domain} against what the other person needs, usually before you have checked what you want, and you will call the result fairness. Half your fatigue here comes from carrying both sides of arguments you never had out loud. The decision you keep deferring in this part of your life is not complicated — it is just one you cannot make without disappointing someone.`,
  scorpio: (b) =>
    `In Scorpio this point goes underground. ${b.name} treats ${b.domain} as something you test people with rather than something you discuss, and you keep evidence you will never mention. There is no casual setting here — you are either all the way in or you are already gone and the other person has not been told. What you are protecting in this area is not a secret. It is the proof of how much it would cost you to be wrong about someone.`,
  sagittarius: (b) =>
    `In Sagittarius this point keeps an eye on the exit. The moment ${b.domain} starts to feel like a fixed arrangement, ${b.name} begins insisting the real version is somewhere else. You call it optimism, and sometimes it is. Sometimes it is a refusal to be held. The pattern to watch here is how often you leave right before the part where it would have gotten good.`,
  capricorn: (b) =>
    `In Capricorn this point keeps score. ${b.name} treats ${b.domain} as something to be earned, so you do not accept it freely given and you do not quite believe it when it arrives early. Rest in this area registers as debt. The authority you carry here is real and it was expensive, and you rarely let anyone see the bill.`,
  aquarius: (b) =>
    `In Aquarius this point steps back to get the whole system in frame. ${b.name} handles ${b.domain} from a slight distance — analytical, principled, and strangely calm about things that should sting. The detachment is not coldness; it is how you stay functional. But you will defend a principle in this area long after the person it was supposed to protect has stopped needing it.`,
  pisces: (b) =>
    `In Pisces this point has no edges. ${b.name} lets ${b.domain} bleed into everything and everyone, so you routinely carry feelings that were never yours to begin with. Your intuition here is close to unfair — you know things before you are told. The risk is equally specific: you will believe the version of a person you can sense they could become, and stay for that instead of the one who actually showed up.`,
};

/* ── Section icons by kind ─────────────────────────────────────── */

const KIND_ICON: Record<BodyKind, string> = {
  angle: '\u{1F9ED}',    // compass
  part: '\u{1F31F}',     // star
  asteroid: '☄',    // comet
  centaur: '\u{1F3F9}',  // bow
  dwarf: '\u{1FA90}',    // ringed planet
};

export const KIND_LABEL: Record<BodyKind, string> = {
  angle: 'Chart Angle',
  asteroid: 'Asteroid',
  part: 'Arabic Part',
  centaur: 'Centaur',
  dwarf: 'Dwarf Planet',
};

/* ── Composed page content ─────────────────────────────────────── */

export interface BodySignSection {
  title: string;
  icon: string;
  paragraphs: string[];
}

export interface BodySignContent {
  body: CosmicBody;
  sign: ZodiacSign;
  title: string;
  subtitle: string;
  intro: string;
  sections: BodySignSection[];
  keywords: string[];
}

/** The long-form essence paragraph, single-sourced from the interpretation engine. */
export function getBodyEssence(body: CosmicBody): string {
  return PLANET_MEANINGS[body.key] || body.essence || '';
}

export function getBodySignContent(body: CosmicBody, sign: ZodiacSign): BodySignContent {
  const s = SIGNS[sign];
  const essence = getBodyEssence(body);
  const hook = body.signHooks?.[sign] || SIGN_OPERATOR[sign](body);

  const intro =
    `${body.name} in ${s.name} places ${body.domain} under a ${s.element} sign in ${s.modality} mode, ruled by ${s.ruler}. ` +
    `That combination decides the tempo, the tell, and the price. ${hook.split('. ')[0]}.`;

  const sections: BodySignSection[] = [
    {
      title: `What ${body.name} Actually Is`,
      icon: KIND_ICON[body.kind],
      paragraphs: [essence].filter(Boolean),
    },
    {
      title: `${body.name} in ${s.name}`,
      icon: s.glyph,
      paragraphs: [body.byElement[s.element], body.byModality[s.modality], hook],
    },
    {
      title: 'The Gift',
      icon: '\u{1F381}',
      paragraphs: [
        body.gift,
        `Filtered through ${s.name}, that gift shows up as ${s.traits.slice(0, 3).join(', ')} — and it is most obvious to the people who watch you handle ${body.domain} when you think nobody is measuring.`,
      ],
    },
    {
      title: 'The Shadow',
      icon: '\u{1F311}',
      paragraphs: [
        body.shadow,
        `${s.name} adds its own version of the cost: ${s.shadow}. In this part of your chart that is not a personality quirk — it is the specific way ${body.name} goes wrong for you, and it will keep repeating until you name it as yours instead of theirs.`,
      ],
    },
    {
      title: 'How You Know It Just Went Off',
      icon: '⚡',
      paragraphs: [body.activation],
    },
    {
      title: 'The Work',
      icon: '\u{1F331}',
      paragraphs: [body.integration],
    },
  ];

  const lower = body.name.toLowerCase();
  const signLower = s.name.toLowerCase();

  return {
    body,
    sign,
    title: `${body.name} in ${s.name}`,
    subtitle: `${body.tagline} in ${s.name}`,
    intro,
    sections,
    keywords: [
      `${lower} in ${signLower}`,
      `${lower} ${signLower} meaning`,
      `${signLower} ${lower} astrology`,
      `${lower} astrology`,
      `${lower} natal chart`,
    ],
  };
}
