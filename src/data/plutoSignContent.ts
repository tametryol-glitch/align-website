/* ──────────────────────────────────────────────────────────────
   Pluto in Signs Content
   SEO-rich content for Pluto through each zodiac sign.
   Transformation, power, obsessions, generational, shadow work.
   ────────────────────────────────────────────────────────────── */

import {
  SIGNS,
  ALL_SIGN_KEYS,
  getElementColor,
  type ZodiacSign,
} from './compatibilityContent';

export { SIGNS, ALL_SIGN_KEYS, getElementColor, type ZodiacSign };

export interface PlutoSignContent {
  sign: ZodiacSign;
  title: string;
  subtitle: string;
  intro: string;
  sections: {
    title: string;
    icon: string;
    paragraphs: string[];
  }[];
  keywords: string[];
}

export const PLUTO_SYMBOL = '♇';

const PLUTO_CONTENT: Record<ZodiacSign, Omit<PlutoSignContent, 'sign'>> = {
  aries: {
    title: 'Pluto in Aries',
    subtitle: 'The Transformer of Identity',
    intro: 'Pluto in Aries drives a generation-defining obsession with selfhood, survival, and the raw power of individual will. This placement compels total transformation of identity, forcing confrontation with primal aggression and the question of what it means to truly exist on your own terms.',
    sections: [
      {
        title: 'Transformation & Power',
        icon: '🔱',
        paragraphs: [
          'Pluto in Aries channels the planet of death and rebirth through the sign of pure selfhood. The result is a generation obsessed with personal power, survival, and the right to exist. These individuals undergo profound transformations of identity throughout their lives, shedding old selves like a snake sheds skin, each time emerging more authentically themselves.',
          'Power for this placement is intensely personal. They are not interested in institutional or social power; they want the raw power to determine their own fate. Pluto in Aries fights for existence itself, for the right to be who they are without compromise. When this energy is conscious, it produces leaders of extraordinary courage. When unconscious, it produces tyrants of the ego.',
          'The transformative journey involves confronting primal rage, the survival instinct that becomes destructive when it no longer serves genuine threats. Pluto in Aries must learn that true power is not the ability to dominate but the ability to face death, literal or metaphorical, without losing one\'s sense of self.',
        ],
      },
      {
        title: 'Generational Shadow Work',
        icon: '🌑',
        paragraphs: [
          'The collective shadow of Pluto in Aries is violence glorified as strength. This generation must confront humanity\'s addiction to aggression, the cultural narratives that equate masculinity with dominance, and the primal fears that drive cycles of conflict. Their shadow work involves transforming raw survival instinct into conscious courage.',
          'When this generation does its shadow work, it heals the collective relationship with anger, aggression, and the will to power. They demonstrate that it is possible to be fiercely alive without being destructive, to fight for what matters without becoming what you oppose.',
        ],
      },
      {
        title: 'Obsessions & Compulsions',
        icon: '♟',
        paragraphs: [
          'Pluto in Aries is obsessed with firsts: being first, doing things first, getting there first. This compulsion drives extraordinary pioneering energy but can also create a relentless competitive drive that exhausts both the individual and everyone around them.',
          'The deeper obsession is with existence itself. Pluto in Aries feels an almost existential urgency to make their mark, to prove that they were here, that they mattered. When this urgency is transmuted into purposeful action, it becomes one of the most powerful creative forces in the zodiac.',
        ],
      },
    ],
    keywords: ['pluto in aries', 'pluto aries generation', 'aries pluto meaning', 'pluto in aries astrology', 'identity transformation astrology'],
  },
  taurus: {
    title: 'Pluto in Taurus',
    subtitle: 'The Transformer of Value',
    intro: 'Pluto in Taurus drives generational upheaval around money, resources, and what humanity values. This placement compels total transformation of economic systems, forcing confrontation with greed, scarcity, and the question of what genuinely sustains life.',
    sections: [
      {
        title: 'Transformation & Power',
        icon: '🔱',
        paragraphs: [
          'Pluto in Taurus channels transformative power through the most material and resource-oriented sign. The result is a generation that witnesses and drives seismic shifts in economic systems, agricultural practices, and the fundamental definition of wealth. Old financial orders crumble, and new ones rise from the ashes.',
          'Power here is connected to resources: who controls the land, the food, the money, the raw materials of survival. Pluto in Taurus exposes the corruption at the heart of economic systems and forces a reckoning with how wealth is created, distributed, and hoarded. The transformation is slow but absolute.',
          'The journey involves confronting material attachment. Pluto in Taurus must learn that true security does not come from accumulation but from a right relationship with the earth and its resources. This is a generation that must face the consequences of unsustainable extraction and find new ways to create genuine, lasting abundance.',
        ],
      },
      {
        title: 'Generational Shadow Work',
        icon: '🌑',
        paragraphs: [
          'The collective shadow of Pluto in Taurus is greed rationalized as pragmatism. This generation must confront the ways economic systems exploit both people and the planet, the hoarding instinct that creates artificial scarcity, and the deep fear of poverty that drives destructive accumulation.',
          'Shadow work for this generation involves transforming the relationship between humanity and the earth. They must find ways to create abundance without depletion, to build economic systems that sustain rather than extract, and to redefine wealth in terms that include ecological and spiritual health.',
        ],
      },
      {
        title: 'Obsessions & Compulsions',
        icon: '♟',
        paragraphs: [
          'Pluto in Taurus is obsessed with security and ownership. The compulsion to accumulate, to own, to build reserves against an uncertain future drives this generation to extraordinary productive achievement but can also create miserly hoarding and an inability to share or trust.',
          'The deeper obsession is with permanence. Pluto in Taurus wants to build something that will outlast them, something so solid and valuable that it cannot be destroyed. When this drive is channeled consciously, it creates enduring institutions and sustainable systems. When unconscious, it creates rigid structures that resist necessary change.',
        ],
      },
    ],
    keywords: ['pluto in taurus', 'pluto taurus generation', 'taurus pluto meaning', 'pluto in taurus astrology', 'economic transformation astrology'],
  },
  gemini: {
    title: 'Pluto in Gemini',
    subtitle: 'The Transformer of Mind',
    intro: 'Pluto in Gemini drives generational transformation of communication, information, and the nature of truth itself. This placement obsesses over the power of words and ideas, forcing confrontation with propaganda, media manipulation, and the question of who controls the narrative.',
    sections: [
      {
        title: 'Transformation & Power',
        icon: '🔱',
        paragraphs: [
          'Pluto in Gemini channels transformative intensity through the sign of communication and intellect. The result is a generation that fundamentally changes how information is created, transmitted, and consumed. Old media empires fall, new communication technologies emerge, and the very concept of truth undergoes radical transformation.',
          'Power here is informational. Those who control the narrative control reality, and Pluto in Gemini understands this with penetrating clarity. This placement produces master communicators, investigative journalists, propagandists, and information architects who shape collective consciousness through the strategic use of language and data.',
          'The transformative journey involves confronting the weaponization of information. Pluto in Gemini must reckon with how words can heal or destroy, how media can enlighten or manipulate, and how the democratization of information can liberate or overwhelm. Truth itself becomes the battleground.',
        ],
      },
      {
        title: 'Generational Shadow Work',
        icon: '🌑',
        paragraphs: [
          'The collective shadow of Pluto in Gemini is the manipulation of truth for power. This generation must confront disinformation, media consolidation, and the ways language is used to divide and control. Their shadow work involves developing collective discernment, the ability to distinguish signal from noise, truth from propaganda.',
          'When this generation does its work, it creates communication systems that serve truth rather than power. They develop tools and practices that make manipulation more difficult and genuine understanding more accessible.',
        ],
      },
      {
        title: 'Obsessions & Compulsions',
        icon: '♟',
        paragraphs: [
          'Pluto in Gemini is obsessed with knowing. The compulsion to gather information, to understand every angle, to never be caught uninformed drives relentless intellectual pursuit. This can produce brilliant researchers and analysts but also information addicts who mistake data for wisdom.',
          'The deeper obsession is with the power of naming. Pluto in Gemini understands that to name something is to claim power over it, and this insight drives both their greatest contributions and their most dangerous tendencies. Language, in their hands, becomes either a tool of liberation or a weapon of control.',
        ],
      },
    ],
    keywords: ['pluto in gemini', 'pluto gemini generation', 'gemini pluto meaning', 'pluto in gemini astrology', 'communication transformation astrology'],
  },
  cancer: {
    title: 'Pluto in Cancer',
    subtitle: 'The Transformer of Home',
    intro: 'Pluto in Cancer drives generational upheaval around family, nation, and emotional security. This placement compels total transformation of domestic structures, forcing confrontation with ancestral trauma, patriotism, and the deep question of where we truly belong.',
    sections: [
      {
        title: 'Transformation & Power',
        icon: '🔱',
        paragraphs: [
          'Pluto in Cancer channels transformative power through the sign of home, family, and emotional belonging. The result is a generation that experiences profound upheaval in domestic life, national identity, and the very concept of what constitutes family. Old family structures disintegrate, and new forms of belonging emerge from the wreckage.',
          'Power here is emotional and familial. The ability to nurture or withhold nurture, to include or exclude from the family circle, to define who belongs and who does not, these are the power dynamics that Pluto in Cancer illuminates and transforms. This placement produces both fierce protectors of family and individuals who must break free from toxic family systems.',
          'The transformative journey involves confronting generational trauma. Pluto in Cancer carries the accumulated emotional burdens of their ancestors and must find ways to process, heal, and release patterns that have been passed down through the family line for centuries.',
        ],
      },
      {
        title: 'Generational Shadow Work',
        icon: '🌑',
        paragraphs: [
          'The collective shadow of Pluto in Cancer is tribalism, the us-versus-them mentality that defines belonging through exclusion. This generation must confront nationalism, xenophobia, and the ways that the beautiful human need for belonging can be weaponized to justify cruelty toward outsiders.',
          'Shadow work for this generation involves expanding the definition of family and home to include those who are different. It means confronting the uncomfortable truth that your ancestors may have caused as much harm as they suffered, and choosing to break the cycle rather than perpetuate it.',
        ],
      },
      {
        title: 'Obsessions & Compulsions',
        icon: '♟',
        paragraphs: [
          'Pluto in Cancer is obsessed with emotional security. The compulsion to create a safe haven, to protect loved ones from all harm, to control the domestic environment drives both extraordinary nurturing instincts and suffocating over-protectiveness.',
          'The deeper obsession is with the mother, both personal and archetypal. Pluto in Cancer carries an intense, often complex relationship with the maternal principle, alternating between idealization and rage. Healing this relationship, both internally and externally, is central to this placement\'s evolution.',
        ],
      },
    ],
    keywords: ['pluto in cancer', 'pluto cancer generation', 'cancer pluto meaning', 'pluto in cancer astrology', 'family transformation astrology'],
  },
  leo: {
    title: 'Pluto in Leo',
    subtitle: 'The Transformer of Self-Expression',
    intro: 'Pluto in Leo drives generational transformation of creativity, leadership, and the nature of authority. This placement obsesses over the power of the individual will, forcing confrontation with narcissism, charisma, and the question of what makes someone truly worthy of leading others.',
    sections: [
      {
        title: 'Transformation & Power',
        icon: '🔱',
        paragraphs: [
          'Pluto in Leo channels transformative intensity through the sign of creative self-expression, leadership, and personal magnetism. The result is a generation that fundamentally changes the relationship between individuals and power, between leaders and followers, between creative vision and collective culture.',
          'Power here is personal and charismatic. Pluto in Leo produces leaders of extraordinary magnetism, creative visionaries who reshape culture, and individuals whose force of personality can move millions. But the shadow of this power is equally potent: dictators, cult leaders, and narcissistic entertainers who demand worship rather than inspire growth.',
          'The transformative journey involves confronting the ego\'s hunger for recognition. Pluto in Leo must learn that true creative power comes not from demanding attention but from expressing something so authentic that attention naturally follows. The death they must undergo is the death of the performing self, the false persona created to win applause.',
        ],
      },
      {
        title: 'Generational Shadow Work',
        icon: '🌑',
        paragraphs: [
          'The collective shadow of Pluto in Leo is the cult of personality. This generation must confront the human tendency to project divine power onto charismatic individuals, the ways that creative talent can be used to manipulate, and the spiritual emptiness of fame without substance.',
          'Shadow work involves distinguishing genuine leadership from narcissistic display, authentic creative expression from performance addiction, and true self-confidence from grandiosity. When this work is done, Pluto in Leo discovers that the most powerful form of leadership is empowering others to find their own creative fire.',
        ],
      },
      {
        title: 'Obsessions & Compulsions',
        icon: '♟',
        paragraphs: [
          'Pluto in Leo is obsessed with legacy. The compulsion to create something that will be remembered, to leave an indelible mark on culture, drives extraordinary creative ambition. This can produce masterworks that endure for centuries, but it can also create a desperate need for immortality through fame.',
          'The deeper obsession is with the heart\'s power. Pluto in Leo feels that love, properly directed, can literally transform reality. This grandiose belief, when grounded and matured, becomes the engine of genuine creative power: the understanding that the heart is the most powerful instrument of change.',
        ],
      },
    ],
    keywords: ['pluto in leo', 'pluto leo generation', 'leo pluto meaning', 'pluto in leo astrology', 'creative transformation astrology'],
  },
  virgo: {
    title: 'Pluto in Virgo',
    subtitle: 'The Transformer of Systems',
    intro: 'Pluto in Virgo drives generational transformation of health, work, and daily systems. This placement obsesses over perfecting the machinery of civilization, forcing confrontation with the shadow of critique, control, and the question of who defines what is "healthy" and "normal." Vesta rules Virgo in this system, adding a dimension of sacred devotion to the transformative work.',
    sections: [
      {
        title: 'Transformation & Power',
        icon: '🔱',
        paragraphs: [
          'Pluto in Virgo channels transformative power through the sign of analysis, service, and practical improvement. The result is a generation that fundamentally changes healthcare systems, workplace culture, environmental management, and the daily infrastructure of life. With Vesta ruling Virgo, this transformation carries a devotional quality, as if perfecting these systems is a sacred calling.',
          'Power here is systemic. The ability to analyze, critique, and redesign the systems that govern daily life is the power that Pluto in Virgo wields. This placement produces brilliant healthcare reformers, environmental scientists, systems engineers, and organizational transformers who can see what is broken and know exactly how to fix it.',
          'The transformative journey involves confronting the shadow of perfectionism. Pluto in Virgo must learn that the compulsion to fix everything can become its own form of pathology, that sometimes the most healing act is accepting what cannot be changed, and that genuine service does not require self-sacrifice.',
        ],
      },
      {
        title: 'Generational Shadow Work',
        icon: '🌑',
        paragraphs: [
          'The collective shadow of Pluto in Virgo is control disguised as helpfulness. This generation must confront the ways that systems of health, work, and social organization can become tools of surveillance and control. Their shadow work involves recognizing when the drive to improve crosses the line into the drive to dominate.',
          'The deeper shadow work addresses the body itself. Pluto in Virgo carries intense anxiety about health and physical imperfection, and must learn to inhabit the body with acceptance rather than suspicion. When this healing occurs, it transforms not just individual wellness but collective approaches to health and healing.',
        ],
      },
      {
        title: 'Obsessions & Compulsions',
        icon: '♟',
        paragraphs: [
          'Pluto in Virgo is obsessed with purity. The compulsion to eliminate contamination, whether physical, moral, or systemic, drives both extraordinary healing achievements and potentially destructive rigidity. This placement must learn that the pursuit of purity can itself become a form of contamination.',
          'The deeper obsession is with control through analysis. Pluto in Virgo believes that if it can understand something completely, it can control it completely. The liberating realization is that some things are meant to be mysteries, and that wholeness includes the messy, imperfect, uncontrollable aspects of life.',
        ],
      },
    ],
    keywords: ['pluto in virgo', 'pluto virgo generation', 'virgo pluto meaning', 'pluto in virgo astrology', 'systems transformation astrology'],
  },
  libra: {
    title: 'Pluto in Libra',
    subtitle: 'The Transformer of Relationships',
    intro: 'Pluto in Libra drives generational transformation of partnerships, justice, and social contracts. This placement obsesses over the power dynamics within relationships, forcing confrontation with codependency, inequality, and the question of whether true balance between two beings is possible. Juno rules Libra in this system, making committed partnership the primary arena of transformation.',
    sections: [
      {
        title: 'Transformation & Power',
        icon: '🔱',
        paragraphs: [
          'Pluto in Libra channels transformative intensity through the sign of partnership and justice. With Juno as Libra\'s ruler, the focus is specifically on committed relationships, marriage, and the power dynamics that operate within them. This generation experiences profound transformation through their closest partnerships, and their relationships become crucibles of personal growth.',
          'Power here is relational. The ability to attract, to charm, to negotiate, and to manage the balance of power within partnerships is the domain where Pluto in Libra operates. This placement produces brilliant negotiators, relationship therapists, and justice advocates, but also master manipulators who use charm as a weapon.',
          'The transformative journey involves confronting the shadow of the nice persona. Pluto in Libra must learn that maintaining surface harmony while suppressing real feelings is not peace but a form of slow violence. Genuine relationship transformation requires the courage to be honest, even when honesty disrupts the pleasant facade.',
        ],
      },
      {
        title: 'Generational Shadow Work',
        icon: '🌑',
        paragraphs: [
          'The collective shadow of Pluto in Libra is passive-aggressive manipulation disguised as diplomacy. This generation must confront the ways that social politeness can mask genuine cruelty, how partnership can become a prison when power imbalances go unaddressed, and how the pursuit of fairness can become an obsession with control.',
          'Shadow work involves learning to fight fair, to express anger directly rather than through withdrawal or passive manipulation, and to accept that genuine intimacy requires the risk of conflict. When this generation transforms its relationship patterns, it heals the collective relationship with partnership itself.',
        ],
      },
      {
        title: 'Obsessions & Compulsions',
        icon: '♟',
        paragraphs: [
          'Pluto in Libra is obsessed with finding "the one," the partner who will complete them and make everything whole. This compulsive search can drive beautiful romantic devotion but also codependent attachment and an inability to be content alone.',
          'The deeper obsession is with justice. Pluto in Libra cannot rest when things are unfair, and this drive, when channeled consciously, becomes a powerful force for social transformation. The challenge is learning that perfect justice, like perfect partnership, is an ideal to be pursued rather than a destination to be reached.',
        ],
      },
    ],
    keywords: ['pluto in libra', 'pluto libra generation', 'libra pluto meaning', 'pluto in libra astrology', 'relationship transformation astrology'],
  },
  scorpio: {
    title: 'Pluto in Scorpio',
    subtitle: 'The Ultimate Transformer',
    intro: 'Pluto in its home sign of Scorpio amplifies transformative power to its absolute peak. This generation confronts the deepest taboos, explores the darkest shadows, and possesses an almost supernatural ability to destroy what is rotten and rebuild from the ashes. Nothing is off-limits, no truth too uncomfortable, no transformation too extreme.',
    sections: [
      {
        title: 'Transformation & Power',
        icon: '🔱',
        paragraphs: [
          'Pluto in Scorpio is the planet in its most potent position, the lord of the underworld in his own domain. This generation carries an intensity that is impossible to ignore. They are hardwired for transformation, drawn to the extremes of human experience, and possessed of an unflinching ability to stare into the abyss without looking away.',
          'Power for Pluto in Scorpio is absolute and uncompromising. They are interested in the power that operates in the shadows: psychological manipulation, financial leverage, sexual dynamics, and the invisible forces that shape collective behavior. When this power is conscious, it produces healers and transformers of extraordinary depth. When unconscious, it produces those who use power to control and destroy.',
          'The transformative journey is total. Pluto in Scorpio does not do partial transformations. They must die completely to who they were in order to become who they are meant to be, and this process often repeats multiple times throughout their lives. Each rebirth is more profound than the last.',
        ],
      },
      {
        title: 'Generational Shadow Work',
        icon: '🌑',
        paragraphs: [
          'The collective shadow of Pluto in Scorpio is the fascination with darkness itself. This generation must confront the seductive pull of destructive power, the tendency to identify with the shadow rather than integrate it, and the risk of becoming so comfortable in the underworld that they forget how to live in the light.',
          'Shadow work for this generation is their specialty and their destiny. They are born to descend into the collective unconscious, confront the monsters that live there, and bring back the gold hidden beneath the terror. No other generation is better equipped for this work, and no other generation faces a greater temptation to be consumed by it.',
        ],
      },
      {
        title: 'Obsessions & Compulsions',
        icon: '♟',
        paragraphs: [
          'Pluto in Scorpio is obsessed with truth, specifically the truth that everyone else is afraid to face. Their compulsion to probe, investigate, and expose operates at every level, from personal psychology to institutional corruption. They cannot leave a mystery unsolved or a secret undiscovered.',
          'The deeper obsession is with death and rebirth itself. Pluto in Scorpio is drawn to experiences of ending and beginning, loss and renewal, destruction and creation. This is not morbidity but a fundamental understanding that transformation requires the courage to let go of what is dying.',
        ],
      },
    ],
    keywords: ['pluto in scorpio', 'pluto scorpio generation', 'scorpio pluto meaning', 'pluto in scorpio astrology', 'deep transformation astrology'],
  },
  sagittarius: {
    title: 'Pluto in Sagittarius',
    subtitle: 'The Transformer of Belief',
    intro: 'Pluto in Sagittarius drives generational transformation of religion, philosophy, and the global order. This placement obsesses over the power of belief, forcing confrontation with fundamentalism, cultural imperialism, and the question of whether universal truth exists or is merely a tool of domination.',
    sections: [
      {
        title: 'Transformation & Power',
        icon: '🔱',
        paragraphs: [
          'Pluto in Sagittarius channels transformative intensity through the sign of belief, higher learning, and global vision. The result is a generation that fundamentally transforms religious institutions, educational systems, and the global political order. Old belief systems crumble under the weight of their own hypocrisy, and new frameworks of meaning emerge.',
          'Power here is ideological. The ability to shape what people believe, to define the narratives that give life meaning, to control the educational and religious institutions that transmit values, this is the power that Pluto in Sagittarius illuminates and transforms. This generation produces both inspiring visionaries and dangerous ideologues.',
          'The transformative journey involves confronting the shadow of belief itself. Pluto in Sagittarius must learn that even the most beautiful belief system can become a weapon when wielded with certainty and without humility. The death they must undergo is the death of righteous certainty.',
        ],
      },
      {
        title: 'Generational Shadow Work',
        icon: '🌑',
        paragraphs: [
          'The collective shadow of Pluto in Sagittarius is fundamentalism in all its forms, religious, ideological, and philosophical. This generation must confront the human tendency to mistake partial truth for the whole truth, to kill for beliefs while calling it righteousness, and to use freedom as a justification for the exploitation of others.',
          'Shadow work involves learning to hold truth lightly, to believe passionately while remaining open to being wrong, and to pursue meaning without imposing it on others. When this generation transforms its relationship with belief, it opens the door to a more inclusive and humble form of wisdom.',
        ],
      },
      {
        title: 'Obsessions & Compulsions',
        icon: '♟',
        paragraphs: [
          'Pluto in Sagittarius is obsessed with meaning. The compulsion to find a purpose that justifies existence, a philosophy that explains everything, a truth that makes the suffering worthwhile, drives both profound spiritual seeking and dangerous fanaticism.',
          'The deeper obsession is with freedom. Pluto in Sagittarius cannot tolerate confinement, whether physical, intellectual, or spiritual. This drive toward liberation, when conscious, produces genuine freedom fighters and paradigm-shifting thinkers. When unconscious, it produces those who destroy structures without considering what will replace them.',
        ],
      },
    ],
    keywords: ['pluto in sagittarius', 'pluto sagittarius generation', 'sagittarius pluto meaning', 'pluto in sagittarius astrology', 'belief transformation astrology'],
  },
  capricorn: {
    title: 'Pluto in Capricorn',
    subtitle: 'The Transformer of Structures',
    intro: 'Pluto in Capricorn drives generational transformation of governments, corporations, and established authority. This placement obsesses over the power of institutions, forcing confrontation with corruption, authoritarianism, and the question of whether existing power structures can be reformed or must be entirely rebuilt.',
    sections: [
      {
        title: 'Transformation & Power',
        icon: '🔱',
        paragraphs: [
          'Pluto in Capricorn channels transformative power through the sign of authority, structure, and institutional achievement. The result is a generation that witnesses and drives the collapse and rebuilding of governments, corporations, and social hierarchies. No established power structure is safe from this placement\'s penetrating scrutiny.',
          'Power here is institutional and structural. The ability to build, maintain, and dismantle the organizations that govern collective life is the domain where Pluto in Capricorn operates. This placement produces both brilliant reformers who transform institutions from within and ruthless operators who use systemic power for personal gain.',
          'The transformative journey involves confronting the shadow of ambition. Pluto in Capricorn must learn that the drive to achieve and control can become its own form of compulsion, and that genuine authority comes not from position but from integrity. The structures that must be transformed are both external and internal.',
        ],
      },
      {
        title: 'Generational Shadow Work',
        icon: '🌑',
        paragraphs: [
          'The collective shadow of Pluto in Capricorn is authoritarianism disguised as order. This generation must confront the ways that social structures can become instruments of oppression, how tradition can be used to justify inequality, and how the human need for security can be exploited by those who promise stability in exchange for obedience.',
          'Shadow work involves learning that dismantling corrupt structures is not enough; new ones must be built in their place. Pluto in Capricorn must resist both the temptation to cling to failing institutions and the impulse to destroy without a plan for what comes next.',
        ],
      },
      {
        title: 'Obsessions & Compulsions',
        icon: '♟',
        paragraphs: [
          'Pluto in Capricorn is obsessed with authority. The compulsion to either claim authority or challenge it drives both extraordinary leadership and relentless opposition to established power. This generation cannot be neutral about hierarchy; they either transform it or are transformed by it.',
          'The deeper obsession is with legacy and consequence. Pluto in Capricorn is acutely aware that the structures built today shape the world for generations to come. This awareness creates a heavy sense of responsibility that can be both motivating and paralyzing.',
        ],
      },
    ],
    keywords: ['pluto in capricorn', 'pluto capricorn generation', 'capricorn pluto meaning', 'pluto in capricorn astrology', 'institutional transformation astrology'],
  },
  aquarius: {
    title: 'Pluto in Aquarius',
    subtitle: 'The Transformer of Society',
    intro: 'Pluto in Aquarius drives generational transformation of social structures, technology, and collective consciousness. This placement obsesses over the power of the group, forcing confrontation with conformity, techno-utopianism, and the question of how to balance individual freedom with collective responsibility.',
    sections: [
      {
        title: 'Transformation & Power',
        icon: '🔱',
        paragraphs: [
          'Pluto in Aquarius channels transformative intensity through the sign of social innovation, technology, and humanitarian ideals. The result is a generation that fundamentally transforms how human beings organize themselves, communicate, and envision the future. Old social orders dissolve as new, radically different ones emerge.',
          'Power here is collective and technological. The ability to harness networks, to leverage technology, to mobilize movements, and to reshape the social fabric is the power that Pluto in Aquarius wields. This placement produces visionary social architects and tech innovators, but also surveillance states and those who use technology to control rather than liberate.',
          'The transformative journey involves confronting the shadow of idealism. Pluto in Aquarius must learn that revolutionary visions can become as oppressive as the systems they replace, and that genuine social transformation requires not just new structures but new consciousness.',
        ],
      },
      {
        title: 'Generational Shadow Work',
        icon: '🌑',
        paragraphs: [
          'The collective shadow of Pluto in Aquarius is totalitarianism in the name of progress. This generation must confront the ways that technology can enable unprecedented surveillance, how social networks can be used to manipulate rather than connect, and how the pursuit of equality can become its own form of tyranny.',
          'Shadow work involves recognizing that humanity\'s greatest tool, its ability to organize collectively, is also its greatest threat. Pluto in Aquarius must find ways to harness the power of the collective without crushing individual autonomy.',
        ],
      },
      {
        title: 'Obsessions & Compulsions',
        icon: '♟',
        paragraphs: [
          'Pluto in Aquarius is obsessed with the future. The compulsion to build tomorrow\'s world today drives both visionary innovation and an inability to be present. This generation can become so fixated on what could be that they fail to appreciate or tend to what already is.',
          'The deeper obsession is with belonging. Despite their association with independence, Pluto in Aquarius carries an intense, often unconscious need to belong to something larger than themselves. The challenge is finding community that honors both their individuality and their need for collective purpose.',
        ],
      },
    ],
    keywords: ['pluto in aquarius', 'pluto aquarius generation', 'aquarius pluto meaning', 'pluto in aquarius astrology', 'social transformation astrology'],
  },
  pisces: {
    title: 'Pluto in Pisces',
    subtitle: 'The Transformer of Consciousness',
    intro: 'Pluto in Pisces drives generational transformation of spirituality, compassion, and the collective unconscious. This placement obsesses over the invisible dimensions of existence, forcing confrontation with escapism, martyrdom, and the question of whether transcendence is genuine spiritual growth or merely a sophisticated form of avoidance.',
    sections: [
      {
        title: 'Transformation & Power',
        icon: '🔱',
        paragraphs: [
          'Pluto in Pisces channels transformative power through the sign of spirituality, imagination, and cosmic unity. The result is a generation that fundamentally transforms humanity\'s relationship with the divine, the unconscious, and the unseen dimensions of reality. Old spiritual paradigms dissolve, and new forms of mystical understanding emerge.',
          'Power here is subtle, emotional, and spiritual. The ability to influence the collective imagination, to shape dreams, to heal or wound through empathy, this is the power that Pluto in Pisces wields. This placement produces extraordinary healers, mystics, and artists, but also charismatic deceivers who exploit spiritual longing.',
          'The transformative journey involves confronting the seduction of dissolution. Pluto in Pisces must learn that genuine transcendence includes the body, the earth, and the full messiness of incarnated life. Spiritual bypass, using transcendence to avoid dealing with reality, is this placement\'s greatest temptation and most important lesson.',
        ],
      },
      {
        title: 'Generational Shadow Work',
        icon: '🌑',
        paragraphs: [
          'The collective shadow of Pluto in Pisces is the worship of suffering. This generation must confront the ways that spirituality can glorify victimhood, how compassion without boundaries becomes enabling, and how the dream of transcendence can be used to justify inaction in the face of injustice.',
          'Shadow work involves learning that genuine compassion requires strength, that healthy spirituality includes accountability, and that the most transcendent act is not escape from the world but full, courageous engagement with it.',
        ],
      },
      {
        title: 'Obsessions & Compulsions',
        icon: '♟',
        paragraphs: [
          'Pluto in Pisces is obsessed with transcendence. The compulsion to escape ordinary consciousness, to merge with something infinite, to dissolve the painful illusion of separateness drives both profound spiritual achievement and dangerous addiction to substances, fantasy, or dissociation.',
          'The deeper obsession is with redemption. Pluto in Pisces believes that everything, every pain, every loss, every horror, can be redeemed through love and consciousness. This belief, when grounded and mature, becomes the foundation of genuine healing work. When ungrounded, it becomes a refusal to accept that some things are simply tragic.',
        ],
      },
    ],
    keywords: ['pluto in pisces', 'pluto pisces generation', 'pisces pluto meaning', 'pluto in pisces astrology', 'consciousness transformation astrology'],
  },
};

export function getPlutoSignContent(sign: ZodiacSign): PlutoSignContent {
  const content = PLUTO_CONTENT[sign];
  return { sign, ...content };
}

export function getAdjacentSigns(sign: ZodiacSign): { prev: ZodiacSign; next: ZodiacSign } {
  const idx = ALL_SIGN_KEYS.indexOf(sign);
  const prev = ALL_SIGN_KEYS[(idx - 1 + 12) % 12];
  const next = ALL_SIGN_KEYS[(idx + 1) % 12];
  return { prev, next };
}
