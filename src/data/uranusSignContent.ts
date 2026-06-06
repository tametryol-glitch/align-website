/* ──────────────────────────────────────────────────────────────
   Uranus in Signs Content
   SEO-rich content for Uranus through each zodiac sign.
   Revolution, innovation, rule-breaking, generational themes.
   ────────────────────────────────────────────────────────────── */

import {
  SIGNS,
  ALL_SIGN_KEYS,
  getElementColor,
  type ZodiacSign,
} from './compatibilityContent';

export { SIGNS, ALL_SIGN_KEYS, getElementColor, type ZodiacSign };

/* ── Content type ────────────────────────────────────────────── */

export interface UranusSignContent {
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

/* ── Planet symbol ───────────────────────────────────────────── */

export const URANUS_SYMBOL = '♅'; // ♅

/* ── Content data ────────────────────────────────────────────── */

const URANUS_CONTENT: Record<ZodiacSign, Omit<UranusSignContent, 'sign'>> = {
  aries: {
    title: 'Uranus in Aries',
    subtitle: 'The Revolutionary Pioneer',
    intro: 'Uranus in Aries ignites a radical drive for independence and fearless innovation. This generation charges headfirst into uncharted territory, breaking old paradigms with raw courage and impatient brilliance. They are the cosmic trailblazers who refuse to wait for permission to change the world.',
    sections: [
      {
        title: 'Revolution & Innovation',
        icon: '⚡',
        paragraphs: [
          'When Uranus occupies Aries, the planet of revolution meets the sign of the warrior, producing a generation that fights for freedom with fierce, uncompromising energy. These individuals do not petition for change; they demand it. They are the ones who start movements, launch disruptive startups, and challenge authority simply by being themselves.',
          'Innovation under this placement is fast, aggressive, and often ahead of its time. Uranus in Aries people invent on impulse, prototype rapidly, and have little patience for bureaucracy or tradition. They are the first adopters, the beta testers of life, always reaching for the next breakthrough before the current one has settled.',
          'The shadow of this placement can manifest as recklessness disguised as revolution. Not every tradition deserves to be demolished, and Uranus in Aries must learn to distinguish between genuine liberation and mere rebellion for its own sake.',
        ],
      },
      {
        title: 'Generational Themes',
        icon: '🌍',
        paragraphs: [
          'Generations born with Uranus in Aries are marked by a collective restlessness and a refusal to accept the status quo. They push the boundaries of personal identity, technology, and individual rights. Historical periods with this placement have seen the birth of new nations, radical shifts in self-expression, and groundbreaking advances in personal technology.',
          'This generation values autonomy above almost everything else. They are uncomfortable with systems that require conformity and are drawn to movements that celebrate individual uniqueness. Their gift to the world is the courage to begin again, even when the outcome is uncertain.',
        ],
      },
      {
        title: 'Breaking Rules',
        icon: '🔥',
        paragraphs: [
          'Uranus in Aries breaks rules instinctively. These individuals do not carefully weigh the consequences of defying convention; they simply cannot help themselves. Rules feel like chains, and the Aries impulse is to cut through them with decisive action. At their best, they liberate others from oppressive structures. At their worst, they create chaos without building anything in its place.',
          'The key lesson for this placement is channeling rebellious energy into constructive pioneering. When Uranus in Aries learns to pair their instinct for revolution with strategic vision, they become unstoppable forces for positive change.',
        ],
      },
    ],
    keywords: ['uranus in aries', 'uranus aries generation', 'aries uranus meaning', 'uranus in aries astrology', 'revolutionary aries'],
  },
  taurus: {
    title: 'Uranus in Taurus',
    subtitle: 'The Financial Revolutionary',
    intro: 'Uranus in Taurus shakes the foundations of material security, values, and how society relates to money and resources. This generation transforms economies, redefines what is valuable, and disrupts entrenched financial systems with stubborn, methodical brilliance.',
    sections: [
      {
        title: 'Revolution & Innovation',
        icon: '⚡',
        paragraphs: [
          'Uranus in Taurus brings revolution to the most grounded and resistant-to-change sign in the zodiac. The result is slow-building but seismic transformation in the realms of finance, agriculture, ecology, and material values. This placement does not produce flashy overnight changes; it produces tectonic shifts that permanently alter the landscape.',
          'Innovation here centers on sustainability, currency, and the body. Breakthroughs in food technology, environmental engineering, cryptocurrency, and physical wellness are hallmarks of Uranus in Taurus periods. These individuals and generations find ingenious ways to build new systems of value from the ground up.',
          'The tension of this placement lies in Taurus\'s desire for stability clashing with Uranus\'s demand for upheaval. Those with this placement often experience sudden disruptions to their sense of security, which ultimately forces them to develop a more resilient and flexible relationship with material comfort.',
        ],
      },
      {
        title: 'Generational Themes',
        icon: '🌍',
        paragraphs: [
          'Generations born under Uranus in Taurus witness and drive radical changes in economic structures. They challenge inherited notions of wealth, ownership, and what constitutes real security. Historical Uranus in Taurus periods have coincided with banking revolutions, shifts in agricultural practice, and fundamental changes in how societies value labor and resources.',
          'This generation carries a deep, sometimes unconscious, drive to create new forms of abundance that are more equitable and sustainable than what they inherited. Their revolution is practical, not ideological. They want to build something that works for everyone, not just theorize about it.',
        ],
      },
      {
        title: 'Breaking Rules',
        icon: '🔥',
        paragraphs: [
          'Uranus in Taurus breaks rules around money, property, and bodily autonomy. These are the people who question why financial systems work the way they do and then quietly build alternatives. They challenge beauty standards, redefine luxury, and insist that security should be accessible to all, not hoarded by a few.',
          'Their rule-breaking is less dramatic than other Uranus placements but ultimately more consequential. When you change how a society relates to money and land, you change everything. Uranus in Taurus knows this instinctively and works with patient determination to upend economic foundations.',
        ],
      },
    ],
    keywords: ['uranus in taurus', 'uranus taurus generation', 'taurus uranus meaning', 'uranus in taurus astrology', 'financial revolution astrology'],
  },
  gemini: {
    title: 'Uranus in Gemini',
    subtitle: 'The Communication Revolutionary',
    intro: 'Uranus in Gemini electrifies the mind, language, and information exchange. This generation rewires how humanity communicates, learns, and processes information, bringing lightning-fast innovation to media, technology, and intellectual discourse.',
    sections: [
      {
        title: 'Revolution & Innovation',
        icon: '⚡',
        paragraphs: [
          'When Uranus enters Gemini, the planet of sudden insight meets the sign of the mind, producing a generation of communication revolutionaries. These individuals think at lightning speed, make unexpected connections between disparate ideas, and refuse to accept information at face value. They are the hackers, the viral content creators, the people who transform how the world shares knowledge.',
          'Innovation under this placement is cerebral and communicative. Breakthroughs in media technology, language processing, information networks, and education methods are hallmarks of Uranus in Gemini periods. These individuals intuitively understand that controlling the flow of information is the key to changing the world.',
          'The challenge of this placement is mental overwhelm. Uranus in Gemini can produce minds that move so fast they struggle to focus, scatter their brilliance across too many projects, or become addicted to novelty and stimulation at the expense of depth.',
        ],
      },
      {
        title: 'Generational Themes',
        icon: '🌍',
        paragraphs: [
          'Generations born with Uranus in Gemini transform the media landscape of their era. They introduce new forms of communication that previous generations could not have imagined, from revolutionary printing techniques to digital media to AI-generated content. Their collective genius lies in finding faster, more democratic ways to share ideas.',
          'This generation values intellectual freedom above all. They resist censorship, challenge educational orthodoxy, and believe that information should flow freely. Their gift to the world is making knowledge accessible and dismantling the gatekeepers who control what people are allowed to learn.',
        ],
      },
      {
        title: 'Breaking Rules',
        icon: '🔥',
        paragraphs: [
          'Uranus in Gemini breaks rules around communication, education, and media. These individuals question who gets to speak, who gets to publish, and who gets to define truth. They are natural disruptors of media monopolies and educational hierarchies, often finding ways to amplify marginalized voices and democratize access to platforms.',
          'Their rebellious streak is intellectual rather than physical. They fight with words, ideas, and viral moments. The pen, in the hands of Uranus in Gemini, truly is mightier than the sword, and they wield it with brilliant, unpredictable precision.',
        ],
      },
    ],
    keywords: ['uranus in gemini', 'uranus gemini generation', 'gemini uranus meaning', 'uranus in gemini astrology', 'communication revolution astrology'],
  },
  cancer: {
    title: 'Uranus in Cancer',
    subtitle: 'The Domestic Revolutionary',
    intro: 'Uranus in Cancer transforms the concepts of home, family, and emotional security. This generation redefines what family means, challenges traditional domestic structures, and brings innovation to how people nurture and protect their loved ones.',
    sections: [
      {
        title: 'Revolution & Innovation',
        icon: '⚡',
        paragraphs: [
          'Uranus in Cancer creates a deep tension between the desire for emotional safety and the compulsion to break free from inherited family patterns. This placement produces individuals who love fiercely but refuse to repeat the mistakes of previous generations. They are the ones who break generational trauma cycles, reimagine what a healthy family looks like, and pioneer new approaches to childcare and elder care.',
          'Innovation here focuses on the domestic sphere: smart home technology, revolutionary approaches to housing, new models for community living, and breakthroughs in emotional healing. Uranus in Cancer understands that the most powerful revolution begins at the kitchen table.',
          'The emotional volatility of this placement can be challenging. Sudden disruptions to home life, unexpected family changes, and a restless need to transform living situations are common themes. The gift is learning to build emotional security that does not depend on external stability.',
        ],
      },
      {
        title: 'Generational Themes',
        icon: '🌍',
        paragraphs: [
          'Generations with Uranus in Cancer fundamentally alter family structures and domestic life. They challenge patriarchal family models, pioneer co-parenting arrangements, embrace chosen family, and push for housing reform. Historical periods with this placement have seen revolutions in women\'s rights, childcare policy, and the very definition of who counts as family.',
          'This generation carries an emotional intelligence that is both their strength and their wound. They feel the fractures in the collective psyche around belonging and security, and they work to heal those fractures by building new models of nurturing community.',
        ],
      },
      {
        title: 'Breaking Rules',
        icon: '🔥',
        paragraphs: [
          'Uranus in Cancer breaks rules around family obligation, gender roles in the home, and emotional expression. These individuals refuse to maintain family traditions that cause harm, even when doing so means being labeled the black sheep. They prioritize emotional authenticity over social propriety and challenge the idea that blood relation equals unconditional loyalty.',
          'Their rebellion is deeply personal and often painful, because it means breaking with the people and places that shaped them. But the new families and homes they build, chosen families, intentional communities, innovative living arrangements, are often more genuinely nurturing than the ones they left behind.',
        ],
      },
    ],
    keywords: ['uranus in cancer', 'uranus cancer generation', 'cancer uranus meaning', 'uranus in cancer astrology', 'family revolution astrology'],
  },
  leo: {
    title: 'Uranus in Leo',
    subtitle: 'The Creative Revolutionary',
    intro: 'Uranus in Leo unleashes radical self-expression and transforms how people create, perform, and celebrate individuality. This generation produces artists, entertainers, and cultural icons who shatter creative conventions and demand the freedom to shine on their own terms.',
    sections: [
      {
        title: 'Revolution & Innovation',
        icon: '⚡',
        paragraphs: [
          'When Uranus enters Leo, the planet of liberation meets the sign of creative self-expression, producing a generation that refuses to dim its light for anyone. These individuals revolutionize the arts, entertainment, and the very concept of identity. They believe that authentic self-expression is not vanity but a radical act of freedom.',
          'Innovation under this placement is dramatic and attention-grabbing. New art forms, entertainment technologies, and modes of personal expression emerge. Uranus in Leo periods introduce revolutionary changes in music, film, fashion, and how people present themselves to the world. The inventions of this era tend to amplify individual voices and celebrate uniqueness.',
          'The shadow side is narcissism disguised as liberation. Uranus in Leo can confuse self-promotion with self-expression and mistake audience attention for genuine connection. The evolved expression channels creative brilliance in service of something larger than personal glory.',
        ],
      },
      {
        title: 'Generational Themes',
        icon: '🌍',
        paragraphs: [
          'Generations born with Uranus in Leo produce cultural revolutions centered on identity, creativity, and the right to be seen. They challenge who gets to be a star, who gets to create, and what counts as art. Historical Uranus in Leo periods have coincided with explosive movements in music, youth culture, and the democratization of fame.',
          'This generation believes that every person has a unique creative gift and that suppressing that gift is a form of oppression. They build platforms, movements, and technologies that help individuals express themselves and find their audience, fundamentally changing the relationship between creator and consumer.',
        ],
      },
      {
        title: 'Breaking Rules',
        icon: '🔥',
        paragraphs: [
          'Uranus in Leo breaks rules around creative expression, authority, and who deserves the spotlight. These individuals refuse to follow artistic conventions, challenge the gatekeepers of fame and recognition, and insist that creative expression is a birthright, not a privilege reserved for the talented few.',
          'Their rule-breaking is flamboyant and impossible to ignore. They do not quietly subvert; they loudly transform. When Uranus in Leo rebels, the whole world watches, and that is exactly the point. Their gift is giving others permission to be unapologetically themselves.',
        ],
      },
    ],
    keywords: ['uranus in leo', 'uranus leo generation', 'leo uranus meaning', 'uranus in leo astrology', 'creative revolution astrology'],
  },
  virgo: {
    title: 'Uranus in Virgo',
    subtitle: 'The Systems Revolutionary',
    intro: 'Uranus in Virgo transforms health, work, and daily systems with meticulous, practical innovation. This generation revolutionizes how people approach wellness, service, and the details that make civilization function. Virgo is ruled by Vesta, the asteroid of sacred devotion, and Uranus here disrupts what people devote themselves to.',
    sections: [
      {
        title: 'Revolution & Innovation',
        icon: '⚡',
        paragraphs: [
          'Uranus in Virgo brings revolution to the most practical and detail-oriented sign in the zodiac. The result is transformative innovation in healthcare, technology, environmental science, and workplace organization. These individuals do not dream of utopia in abstract terms; they build it one improved system at a time.',
          'Innovation here is precise, evidence-based, and focused on solving real problems. Breakthroughs in medical technology, nutritional science, computing, and organizational efficiency are hallmarks of Uranus in Virgo periods. With Vesta as Virgo\'s ruler, there is a sacred quality to this work; these individuals feel called to serve humanity through practical improvement.',
          'The challenge of this placement is perfectionism that paralyzes innovation. Uranus wants to experiment and fail forward, while Virgo wants to get it right the first time. The resolution comes when Uranus in Virgo learns to apply rigorous thinking without demanding impossible standards.',
        ],
      },
      {
        title: 'Generational Themes',
        icon: '🌍',
        paragraphs: [
          'Generations born with Uranus in Virgo transform the practical infrastructure of daily life. They revolutionize healthcare delivery, workplace culture, environmental management, and the technology that runs behind the scenes of civilization. Their innovations are often invisible to the general public but fundamental to how the world functions.',
          'This generation carries a deep commitment to service and improvement. They are the ones who notice what is broken in everyday systems and develop ingenious solutions. Their gift to the world is making life work better, more efficiently, more healthily, and more sustainably, one careful innovation at a time.',
        ],
      },
      {
        title: 'Breaking Rules',
        icon: '🔥',
        paragraphs: [
          'Uranus in Virgo breaks rules around health orthodoxy, workplace hierarchy, and the boundary between science and holistic healing. These individuals question established medical protocols, challenge corporate work culture, and insist that wellness encompasses mind, body, and spirit. They are the ones who bridge the gap between ancient wisdom and modern science.',
          'Their rebellion is quiet but thorough. They do not march in the streets; they rewrite the protocols, redesign the systems, and prove through meticulous data that a better way exists. When Uranus in Virgo breaks a rule, they replace it with something that actually works.',
        ],
      },
    ],
    keywords: ['uranus in virgo', 'uranus virgo generation', 'virgo uranus meaning', 'uranus in virgo astrology', 'health revolution astrology'],
  },
  libra: {
    title: 'Uranus in Libra',
    subtitle: 'The Relationship Revolutionary',
    intro: 'Uranus in Libra transforms partnerships, justice, and social harmony. This generation redefines what relationships look like, fights for equality with diplomatic brilliance, and refuses to accept unfair systems. Libra is ruled by Juno, the asteroid of committed partnership, and Uranus here revolutionizes the very nature of commitment.',
    sections: [
      {
        title: 'Revolution & Innovation',
        icon: '⚡',
        paragraphs: [
          'When Uranus enters Libra, the planet of radical freedom meets the sign of partnership and justice. The result is a generation that fundamentally transforms how people relate to one another. Marriage, business partnerships, legal systems, and social contracts are all subject to revolutionary reimagining under this placement.',
          'Innovation here centers on relationship models, legal frameworks, and design. With Juno as Libra\'s ruler, the revolution is specifically about commitment: who can commit to whom, what commitment means, and how partnerships can be structured to honor both togetherness and individuality. Uranus in Libra periods produce groundbreaking changes in marriage law, partnership equality, and collaborative creation.',
          'The tension of this placement is between Libra\'s desire for harmony and Uranus\'s compulsion to disrupt. Relationships under this influence can be marked by sudden changes, unconventional arrangements, and a refusal to follow traditional partnership scripts. The gift is discovering that true harmony requires the freedom to be authentic.',
        ],
      },
      {
        title: 'Generational Themes',
        icon: '🌍',
        paragraphs: [
          'Generations born with Uranus in Libra rewrite the rules of relationships and social justice. They challenge who can marry whom, what constitutes a valid partnership, and how justice should be administered. Historical periods with this placement have seen revolutions in civil rights, marriage equality, and the dismantling of discriminatory legal structures.',
          'This generation carries a deep, innate understanding that fairness is not a luxury but a necessity. They are uncomfortable with inequality in any form and work to create social systems that genuinely balance individual rights with collective wellbeing. Their gift is demonstrating that revolution and harmony are not opposites.',
        ],
      },
      {
        title: 'Breaking Rules',
        icon: '🔥',
        paragraphs: [
          'Uranus in Libra breaks rules around relationship conformity, legal precedent, and aesthetic convention. These individuals refuse to stay in partnerships that require them to suppress their authentic selves, challenge legal systems that perpetuate inequality, and bring beauty to rebellion. Their protests are elegant; their disruptions are aesthetically considered.',
          'Their rule-breaking often focuses on the space between people: the contracts, the agreements, the unspoken social rules that govern how we relate to one another. Uranus in Libra sees injustice in these interpersonal structures and works to replace them with arrangements that honor both freedom and connection.',
        ],
      },
    ],
    keywords: ['uranus in libra', 'uranus libra generation', 'libra uranus meaning', 'uranus in libra astrology', 'relationship revolution astrology'],
  },
  scorpio: {
    title: 'Uranus in Scorpio',
    subtitle: 'The Depth Revolutionary',
    intro: 'Uranus in Scorpio brings revolution to the underworld of power, sexuality, death, and transformation. This generation exposes hidden truths, transforms taboos, and refuses to let secrets stay buried. They are fearless investigators of the shadow, driven to liberate humanity from its deepest fears.',
    sections: [
      {
        title: 'Revolution & Innovation',
        icon: '⚡',
        paragraphs: [
          'Uranus in Scorpio produces the most intense and psychologically penetrating form of revolution. This placement does not change the surface; it transforms the foundations. Power structures, sexual norms, financial systems, and the relationship with death itself are all subject to radical upheaval under this influence.',
          'Innovation here is transformative and often controversial. Breakthroughs in psychology, genetics, nuclear technology, surveillance, and sexual health are hallmarks of Uranus in Scorpio periods. These individuals and generations are willing to go where others fear to tread, investigating the darkest corners of human experience in pursuit of liberation.',
          'The shadow of this placement is the potential for destructive intensity. Uranus in Scorpio can become so fixated on exposing truth that it causes collateral damage, or so obsessed with power dynamics that it recreates the very hierarchies it sought to destroy. The evolved expression uses penetrating insight in service of genuine healing.',
        ],
      },
      {
        title: 'Generational Themes',
        icon: '🌍',
        paragraphs: [
          'Generations born with Uranus in Scorpio bring hidden power dynamics to light. They expose corruption, transform sexual norms, and force collective conversations about death, trauma, and the distribution of power. Historical periods with this placement have seen revolutions in psychology, the exposure of institutional abuse, and transformative shifts in how societies deal with taboo subjects.',
          'This generation possesses an almost supernatural ability to see through deception. They are the whistleblowers, the investigative journalists, the therapists, and the reformers who refuse to accept comfortable lies. Their gift is the courage to face the darkest truths and transform them into collective healing.',
        ],
      },
      {
        title: 'Breaking Rules',
        icon: '🔥',
        paragraphs: [
          'Uranus in Scorpio breaks rules around secrecy, power, and the things society refuses to discuss. These individuals do not respect the unwritten agreements that keep uncomfortable truths hidden. They name abusers, expose financial corruption, challenge death-denying culture, and insist that the shadow must be integrated, not suppressed.',
          'Their rule-breaking is deep and permanent. Unlike other Uranus placements that might change surfaces, Uranus in Scorpio transforms at the root level. When they break a rule, the rule stays broken, because they have dismantled the psychological infrastructure that supported it.',
        ],
      },
    ],
    keywords: ['uranus in scorpio', 'uranus scorpio generation', 'scorpio uranus meaning', 'uranus in scorpio astrology', 'transformation revolution astrology'],
  },
  sagittarius: {
    title: 'Uranus in Sagittarius',
    subtitle: 'The Philosophical Revolutionary',
    intro: 'Uranus in Sagittarius transforms beliefs, higher education, and the quest for truth. This generation challenges religious dogma, reimagines the purpose of education, and insists that freedom of thought is the foundation of all other freedoms.',
    sections: [
      {
        title: 'Revolution & Innovation',
        icon: '⚡',
        paragraphs: [
          'When Uranus enters Sagittarius, the planet of radical insight meets the sign of the seeker, producing a generation that revolutionizes belief systems, educational institutions, and the pursuit of meaning. These individuals cannot accept inherited wisdom at face value; they must discover truth for themselves, even if it means dismantling entire philosophical frameworks.',
          'Innovation under this placement is expansive and visionary. Breakthroughs in international communication, space exploration, philosophical thought, and the globalization of knowledge are hallmarks of Uranus in Sagittarius periods. These individuals build bridges between cultures and challenge the idea that any single belief system holds a monopoly on truth.',
          'The challenge is dogmatic anti-dogmatism. Uranus in Sagittarius can become so committed to destroying old beliefs that it fails to build new ones, leaving a spiritual vacuum. The evolved expression replaces discarded beliefs with a broader, more inclusive understanding of truth.',
        ],
      },
      {
        title: 'Generational Themes',
        icon: '🌍',
        paragraphs: [
          'Generations born with Uranus in Sagittarius expand the boundaries of what is possible to believe, explore, and understand. They challenge religious institutions, transform higher education, and push the frontiers of human exploration, both physical and intellectual. Historical periods with this placement have seen revolutions in religious freedom, the founding of new philosophical movements, and breakthroughs in long-distance travel and communication.',
          'This generation carries an insatiable hunger for meaning and a refusal to accept simplistic answers to complex questions. They are the ones who synthesize wisdom from multiple traditions, creating new philosophical frameworks that honor the diversity of human experience.',
        ],
      },
      {
        title: 'Breaking Rules',
        icon: '🔥',
        paragraphs: [
          'Uranus in Sagittarius breaks rules around belief, academia, and cultural boundaries. These individuals refuse to be confined by a single religion, a single culture, or a single educational path. They are the autodidacts, the spiritual seekers, and the cultural nomads who insist that wisdom can be found anywhere and that learning never ends.',
          'Their rebellion is philosophical and far-reaching. They challenge the authority of religious leaders, question academic gatekeeping, and insist that truth belongs to everyone. When Uranus in Sagittarius breaks a belief, it opens a door to a wider, more inclusive understanding of the human experience.',
        ],
      },
    ],
    keywords: ['uranus in sagittarius', 'uranus sagittarius generation', 'sagittarius uranus meaning', 'uranus in sagittarius astrology', 'philosophical revolution astrology'],
  },
  capricorn: {
    title: 'Uranus in Capricorn',
    subtitle: 'The Institutional Revolutionary',
    intro: 'Uranus in Capricorn transforms governments, corporations, and established hierarchies. This generation restructures power from within, replacing outdated institutions with leaner, more effective systems. They are pragmatic revolutionaries who understand that lasting change requires building new structures, not just tearing down old ones.',
    sections: [
      {
        title: 'Revolution & Innovation',
        icon: '⚡',
        paragraphs: [
          'Uranus in Capricorn produces revolution within the system. Unlike other Uranus placements that might burn everything down, Uranus in Capricorn works within existing power structures to transform them from the inside. These individuals rise through hierarchies and then restructure them, combining Capricorn\'s strategic patience with Uranus\'s radical vision.',
          'Innovation under this placement is structural and organizational. New forms of government, corporate restructuring, infrastructure innovation, and the integration of technology into institutional frameworks are hallmarks of Uranus in Capricorn periods. These individuals understand that true revolution must be built on solid foundations.',
          'The challenge is becoming the very thing they sought to change. Uranus in Capricorn can be so effective at working within systems that they lose their revolutionary edge and become the establishment they once challenged. The evolved expression maintains the outsider\'s perspective even while holding insider power.',
        ],
      },
      {
        title: 'Generational Themes',
        icon: '🌍',
        paragraphs: [
          'Generations born with Uranus in Capricorn restructure the institutions that govern collective life. They transform governments, redefine corporate culture, and build new organizational models that are more efficient, transparent, and accountable. Historical periods with this placement have seen the fall of empires, the rise of new political systems, and radical restructuring of economic hierarchies.',
          'This generation combines ambition with innovation. They are not content to climb existing ladders; they want to redesign the ladder itself. Their gift to the world is proving that responsible, sustainable revolution is possible, that you can transform the system without descending into chaos.',
        ],
      },
      {
        title: 'Breaking Rules',
        icon: '🔥',
        paragraphs: [
          'Uranus in Capricorn breaks rules around authority, tradition, and institutional protocol. These individuals challenge the assumption that seniority equals wisdom, that tradition equals value, and that established institutions deserve automatic respect. They demand that institutions earn their authority through results, not through longevity.',
          'Their rule-breaking is strategic and calculated. They do not rebel impulsively; they identify the structural weaknesses in existing systems and then apply precisely targeted disruption. When Uranus in Capricorn breaks a rule, they have already designed the replacement rule and built the infrastructure to support it.',
        ],
      },
    ],
    keywords: ['uranus in capricorn', 'uranus capricorn generation', 'capricorn uranus meaning', 'uranus in capricorn astrology', 'institutional revolution astrology'],
  },
  aquarius: {
    title: 'Uranus in Aquarius',
    subtitle: 'The Humanitarian Revolutionary',
    intro: 'Uranus in its home sign of Aquarius amplifies the revolutionary impulse to its purest expression. This generation envisions radical new social structures, pioneers humanitarian technology, and works toward a future where individual freedom and collective wellbeing are no longer at odds.',
    sections: [
      {
        title: 'Revolution & Innovation',
        icon: '⚡',
        paragraphs: [
          'Uranus is the natural ruler of Aquarius, and when it returns to its home sign, the energy is electric and undeniable. This placement produces the purest expression of Uranian energy: visionary thinking, humanitarian innovation, and a relentless drive toward a future that does not yet exist. These individuals do not just want to improve the world; they want to reimagine it entirely.',
          'Innovation under this placement is technological, social, and humanitarian. Breakthroughs in networking technology, social organization, space exploration, and collective consciousness are hallmarks of Uranus in Aquarius periods. These individuals intuitively understand systems thinking and can see how small changes in one area ripple out to transform the whole.',
          'The challenge is detachment that masquerades as objectivity. Uranus in Aquarius can become so focused on the big picture that it neglects individual human needs, or so committed to ideological purity that it alienates the very people it seeks to liberate. The evolved expression pairs visionary thinking with genuine warmth.',
        ],
      },
      {
        title: 'Generational Themes',
        icon: '🌍',
        paragraphs: [
          'Generations born with Uranus in Aquarius are the architects of the future. They build the technological and social infrastructure that subsequent generations inherit and take for granted. Historical periods with this placement have produced revolutions in communication technology, democratic governance, and collective organization.',
          'This generation carries a powerful vision of what humanity could become. They are idealists with the intellectual firepower to make their ideals real. Their gift to the world is the blueprint for a more connected, equitable, and technologically empowered civilization.',
        ],
      },
      {
        title: 'Breaking Rules',
        icon: '🔥',
        paragraphs: [
          'Uranus in Aquarius breaks rules around social conformity, technological limitations, and the boundaries of collective imagination. These individuals refuse to accept that things must be the way they are simply because they have always been that way. They are the original disruptors, the ones who look at a broken system and see an opportunity to build something unprecedented.',
          'Their rebellion is principled and community-oriented. They do not break rules for personal gain but for collective liberation. When Uranus in Aquarius breaks a rule, it is always in service of a larger vision of human freedom and potential.',
        ],
      },
    ],
    keywords: ['uranus in aquarius', 'uranus aquarius generation', 'aquarius uranus meaning', 'uranus in aquarius astrology', 'humanitarian revolution astrology'],
  },
  pisces: {
    title: 'Uranus in Pisces',
    subtitle: 'The Spiritual Revolutionary',
    intro: 'Uranus in Pisces dissolves the boundaries between the seen and unseen, bringing revolution to spirituality, art, and the collective unconscious. This generation transforms how humanity relates to the mystical, the imaginal, and the transcendent, pioneering new forms of creative and spiritual expression.',
    sections: [
      {
        title: 'Revolution & Innovation',
        icon: '⚡',
        paragraphs: [
          'When Uranus enters Pisces, the planet of awakening meets the sign of cosmic unity, producing a generation that revolutionizes the spiritual and creative landscape of their era. These individuals blur the lines between science and mysticism, technology and art, reality and dream. They are the visionary artists, the spiritual pioneers, and the empathic innovators.',
          'Innovation under this placement is intuitive, artistic, and boundary-dissolving. Breakthroughs in film, music, virtual reality, pharmaceutical technology, and consciousness research are hallmarks of Uranus in Pisces periods. These individuals create technologies and art forms that transport people beyond ordinary reality.',
          'The challenge is escapism masquerading as transcendence. Uranus in Pisces can blur boundaries so effectively that it loses touch with practical reality, or use spiritual bypass to avoid dealing with concrete problems. The evolved expression grounds visionary insight in compassionate action.',
        ],
      },
      {
        title: 'Generational Themes',
        icon: '🌍',
        paragraphs: [
          'Generations born with Uranus in Pisces transform the collective imagination. They pioneer new art forms, spiritual practices, and healing modalities that expand human consciousness. Historical periods with this placement have seen revolutions in cinema, the rise of new spiritual movements, and breakthroughs in understanding the human psyche.',
          'This generation carries a deep sensitivity to collective suffering and an intuitive understanding that true revolution must include the soul. They are the ones who remind a materialistic world that meaning, beauty, and transcendence are not luxuries but necessities.',
        ],
      },
      {
        title: 'Breaking Rules',
        icon: '🔥',
        paragraphs: [
          'Uranus in Pisces breaks rules around what is considered real, rational, and respectable. These individuals challenge the supremacy of materialist thinking, insist that intuition and imagination are valid sources of knowledge, and create art and spiritual practices that defy categorization.',
          'Their rule-breaking is subtle and pervasive. Rather than confronting the establishment directly, Uranus in Pisces dissolves it. They change reality by changing how people perceive it, which is perhaps the most revolutionary act of all. When the collective imagination shifts, everything shifts with it.',
        ],
      },
    ],
    keywords: ['uranus in pisces', 'uranus pisces generation', 'pisces uranus meaning', 'uranus in pisces astrology', 'spiritual revolution astrology'],
  },
};

/* ── Helper functions ────────────────────────────────────────── */

export function getUranusSignContent(sign: ZodiacSign): UranusSignContent {
  const content = URANUS_CONTENT[sign];
  return { sign, ...content };
}

export function getAdjacentSigns(sign: ZodiacSign): { prev: ZodiacSign; next: ZodiacSign } {
  const idx = ALL_SIGN_KEYS.indexOf(sign);
  const prev = ALL_SIGN_KEYS[(idx - 1 + 12) % 12];
  const next = ALL_SIGN_KEYS[(idx + 1) % 12];
  return { prev, next };
}
