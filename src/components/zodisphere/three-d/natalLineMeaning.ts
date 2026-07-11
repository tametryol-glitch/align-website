/**
 * Natal ACG line interpretations for the 3D globe's tap-to-read.
 *
 * REUSE, NOT FABRICATION: the planet×angle prose below is Align's own existing
 * relocation content (from app/readings/acg PLANET_RELOCATION_THEMES). It is
 * duplicated here — rather than imported from that page — to keep the Zodisphere
 * 3D feature self-contained and avoid touching another section (per the upgrade
 * brief). For bodies without curated prose (asteroids, points), we COMPOSE a
 * reading the same way midpointMeaning() does: from each body's essence/keywords
 * (BODY_INFO) × the angle's life-domain. Nothing is invented per-user; only the
 * LINE is personal.
 */

import { bodyInfoOf } from '@/lib/zodisphereMidpoints';
import type { AcgAngle } from './AstrocartographyDataAdapter';

/** Angle → life-domain for the detail panel. */
export const ACG_ANGLE_DOMAIN: Record<AcgAngle, { area: string; phrase: string }> = {
  MC: { area: 'Career & Public Life', phrase: 'work, reputation and how the world sees you' },
  IC: { area: 'Home & Roots', phrase: 'home, family and your private foundations' },
  ASC: { area: 'Self & Identity', phrase: 'your body, presence and how you show up' },
  DSC: { area: 'Relationships', phrase: 'partners and what arrives through other people' },
};

/** Align's curated planet×angle relocation prose (constructive expression). */
const NATAL_LINE_THEMES: Record<string, Record<AcgAngle, string>> = {
  Sun: {
    ASC: 'You shine here. Your identity comes alive, people notice you, and you feel more confident and visible. A place where you become more fully yourself.',
    DSC: 'Powerful partnerships form here. You attract people who reflect your light back to you. Business and romantic connections are amplified.',
    MC: 'A fame and career location. Your professional reputation grows here — you are seen as an authority, a leader, someone who commands respect.',
    IC: 'This place nurtures your inner child and sense of belonging. You feel at home here on a deep level. Family connections and emotional roots strengthen.',
  },
  Moon: {
    ASC: 'Your emotional sensitivity is heightened here. People respond to your warmth and intuition. You feel things deeply in this location.',
    DSC: 'Deep emotional connections form here. You attract nurturing, caring people. Intimate relationships feel more soulful.',
    MC: 'You become known for your emotional intelligence and caring nature here. Careers in nurturing, food, real estate or counseling thrive.',
    IC: 'Your ultimate home location. You feel emotionally safe, rooted and deeply at peace. Family life flourishes here.',
  },
  Mercury: {
    ASC: 'Your mind sharpens here. Words come faster, curiosity expands, and people experience you as quick, articulate and engaging. A natural place for learning and connecting.',
    DSC: 'You attract talkers, thinkers and dealmakers here. Relationships are built on conversation and ideas — excellent for collaborators, agents and intellectual partners.',
    MC: 'Your voice becomes your career asset here. Writing, speaking, teaching, media, trade and negotiation thrive. You become known for what you say and how clearly you say it.',
    IC: 'Home life fills with books, conversation and movement here. A great base for studying or writing, though the mind may struggle to fully switch off.',
  },
  Venus: {
    ASC: 'You look and feel more beautiful here. Your charm is amplified, social life thrives, and you attract love effortlessly. A wonderful place for romance.',
    DSC: 'Love finds you here. Relationships are harmonious, partnerships profitable, and you attract people who appreciate beauty and value.',
    MC: 'Creative success and a beautiful public image await. Careers in art, fashion, beauty, diplomacy or luxury thrive.',
    IC: 'Your home life becomes more beautiful and harmonious here. You create a stunning living space and enjoy domestic pleasures.',
  },
  Mars: {
    ASC: 'You feel energized, motivated and action-oriented here. Physical vitality is high. You become more assertive and competitive.',
    DSC: 'Relationships here are passionate and intense. You attract driven, ambitious partners. Business partnerships are dynamic but may involve conflict.',
    MC: 'Career ambition ignites here. You become more driven, competitive and willing to fight for what you want professionally.',
    IC: 'Energy around home and property runs high. You may renovate, move frequently, or feel intensity in family dynamics.',
  },
  Jupiter: {
    ASC: 'Everything expands here — personality, opportunities, worldview. You feel optimistic, generous and lucky. One of the best locations for overall life improvement.',
    DSC: 'You attract generous, wise and beneficial partners. Relationships bring growth, travel and abundance. Legal matters favor you.',
    MC: 'Professional success and recognition flow here. Your career expands, promotions come, and you may achieve public prominence. One of the best career locations.',
    IC: 'Your home life is abundant and comfortable here. You may own larger property, enjoy domestic prosperity and feel deeply content.',
  },
  Saturn: {
    ASC: 'A serious, growth-through-discipline location. You mature here, take on responsibility, and build lasting structures. It can feel heavy but produces mastery.',
    DSC: 'Relationships here are serious, committed and sometimes challenging. You attract mature, responsible partners. Partnerships require patience.',
    MC: 'Career demands are high but rewards are lasting. You build authority, reputation and institutional power over time — enduring success, not quick success.',
    IC: 'Home life involves responsibility, structure and sometimes limitation. You may deal with property issues or family obligations. Builds character.',
  },
  Uranus: {
    ASC: 'You reinvent yourself here. This location sparks independence, originality and sudden changes in self-expression. Exciting but unpredictable.',
    DSC: 'Relationships here are unconventional and exciting. You attract eccentric, innovative people. Partnerships may form and dissolve suddenly.',
    MC: 'Your career takes unexpected turns here. You may work in technology, innovation or humanitarian fields. Sudden career shifts are likely.',
    IC: 'Home life is unpredictable here. You may move frequently or create an unconventional living situation. Freedom in domestic life.',
  },
  Neptune: {
    ASC: 'You become more intuitive, artistic and spiritually sensitive here. Others find you mysterious and ethereal. Creative and spiritual pursuits flourish.',
    DSC: 'Relationships here have a dreamlike quality. You attract spiritual, artistic or elusive partners. Romance is idealized — stay grounded.',
    MC: 'Creative, spiritual or healing careers thrive here. You may become known for your vision, artistry or compassion. Boundaries at work may blur.',
    IC: 'A deeply spiritual home location. You feel connected to something greater. Watch for unclear property boundaries or domestic confusion.',
  },
  Pluto: {
    ASC: 'You undergo deep personal transformation here. Your presence becomes more powerful, magnetic and intense. This location changes you permanently.',
    DSC: 'Relationships here are intense, transformative and sometimes overwhelming. You attract powerful people. Power dynamics are amplified.',
    MC: 'You become a force in your career here. Power, influence and transformation define your professional life. Not for the faint of heart.',
    IC: 'Deep psychological transformation happens here, often through family or home. Buried issues surface for healing.',
  },
};

/** Difficult-expression caution for the heavier bodies. */
const NATAL_WATCH: Record<string, string> = {
  Saturn: 'Added responsibility, delays, or a sense of heaviness. Structure is required — things don’t come easily here, but they last.',
  Pluto: 'Intensity and power dynamics may surface. Relationships and career can feel high-stakes. Transformation is the theme.',
  Mars: 'Conflict, impatience or accidents may increase. Channel this energy into productive action and physical activity.',
};

export interface NatalLineReading {
  planet: string;
  angle: AcgAngle;
  /** Life domain of the angle (Career, Home, Self, Relationships). */
  area: string;
  /** Main constructive interpretation. */
  meaning: string;
  /** Difficult-expression caution, if the body warrants one. */
  watch?: string;
}

/**
 * Reading for a planet-on-angle line. Uses curated prose where it exists,
 * otherwise composes from the body's essence × the angle's life-domain.
 */
export function natalLineMeaning(planet: string, angle: AcgAngle): NatalLineReading {
  const curated = NATAL_LINE_THEMES[planet]?.[angle];
  const dom = ACG_ANGLE_DOMAIN[angle];
  const meaning = curated
    ?? `Here your **${bodyInfoOf(planet).essence}** meets ${dom.phrase}. On this line it activates ${bodyInfoOf(planet).keywords} through ${dom.area.toLowerCase()}.`;
  return { planet, angle, area: dom.area, meaning, watch: NATAL_WATCH[planet] };
}
