// Content/interpretation layer for Starseed readings on web (both the legacy
// /readings/starseed page and the new /readings/starseed-origin page).
//
// The backend only returns each lineage's name + score — NO prose — so the
// description and the balanced light/shadow/purpose detail are mapped here by
// category name. Ported from the mobile app's starseedEngine.ts so web and
// mobile tell the same story. Covers all 20 star lineages + 10 planetary
// resonances; families with no entry fall back to a neutral line.

export const ORIGIN_DESCRIPTIONS: Record<string, string> = {
  Pleiadian: "Pleiadian souls carry a deep sensitivity, artistic vision, and longing for harmony. They often feel a magnetic pull toward healing, music, and unconditional love. Emotional empathy is their hallmark, sometimes to the point of absorbing others' pain.",
  Sirian: "Sirian souls are natural guardians and protectors. They resonate with water, the moon, and ancestral memory. Loyalty runs in their blood; they build structures that endure and defend those they love with fierce devotion.",
  Arcturian: "Arcturian souls originate from Arcturus — one of the most advanced civilizations in the galaxy. They incarnate on Earth as system architects, visionaries, and consciousness engineers, drawn to innovation, pattern recognition, and strategic mastery.",
  Orion: "Orion souls carry the imprint of intellectual mastery and karmic discipline. They are drawn to logic, precision, and accountability. Past-life echoes of power struggles may surface as a drive to prove themselves or master their environment.",
  Andromedan: "Andromedan souls are cosmic wanderers who resist confinement. They crave freedom, exploration, and spiritual expansion. They often feel too big for any single identity, culture, or belief system.",
  Lyran: "Lyran souls carry the oldest starlight — the memory of the first cosmic civilizations. They are natural leaders with feline grace, creative fire, and a deep sense of independence.",
  Venusian: "Venusian souls embody beauty, sensuality, and relational wisdom. They seek balance, art, and deep partnership. Love is not optional for them — it is the medium through which they learn every lesson.",
  Martian: "Martian souls are warriors, pioneers, and catalysts. They carry past-life intensity around conflict, survival, and courage. Action is their prayer.",
  Saturnian: "Saturnian souls have an old, heavy karma thread. They incarnate to master discipline, responsibility, and the lessons of time.",
  Neptunian: "Neptunian souls dissolve boundaries between worlds. They are natural mystics, dreamers, and channels. Their challenge is grounding.",
  Mintakan: "Mintakan souls carry an ache of oceanic homesickness — a longing for a world of crystalline purity that no longer exists. They are gentle, compassionate, and deeply sensitive.",
  "Blue Avian": "Blue Avian souls are high-frequency messengers from etheric realms. They communicate through vibration, thought, and subtle energy rather than force.",
  Hadarian: "Hadarian souls are heart-centered healers whose love is vast and unconditional. They radiate warmth, comfort, and emotional restoration.",
  Lemurian: "Lemurian souls carry the memory of ancient Earth — a time when humanity lived in harmony with the land, crystals, sound, and the sacred feminine.",
  Solar: "Solar souls radiate life-force energy. They are born to lead, inspire, and create.",
  Vegan: "Vegan souls originate from Vega in the Lyra constellation. They are gentle humanitarians with a deep connection to nature and environmental stewardship.",
  Draconian: "Draconian souls carry the energy of the Dragon — raw power, ambition, and transformative fire. They are natural leaders and strategists.",
  Feline: "Feline souls are independent, graceful, and fiercely protective of those they love. Connected to ancient Egyptian and Lyran feline civilizations.",
  "Alpha Centaurian": "Alpha Centaurian souls are scientific explorers who bridge spirituality and logic. They are drawn to technology, space, and discovery.",
  Nihal: "Nihal souls are cosmic rebels and activists. They incarnate to challenge unjust systems, fight for the marginalized, and disrupt stagnant power structures.",
  Polarian: "Polarian souls are among the oldest in the cosmos — first-wave beings who remember the original unity consciousness.",
  Essassani: "Essassani souls vibrate at a high, playful frequency. They are guided by excitement, joy, and following their highest enthusiasm.",
  Maldekian: "Maldekian souls carry the karmic memory of a destroyed world. They incarnate with deep lessons about responsibility and consequences.",
  Annunaki: "Annunaki souls carry ancient builder energy — the architects of civilizations. They think in terms of dynasties and millennia.",
  Avian: "Avian souls are freedom-seeking visionaries connected to the element of air. They see life from a higher perspective.",
  Plutonian: "Plutonian souls are deep transformers who walk the path of death and rebirth. They are drawn to shadow work, psychology, and occult knowledge.",
  Uranian: "Uranian souls are revolutionaries and eccentric geniuses. They arrive with a mandate to break outdated structures.",
  Mercurial: "Mercurial souls are the messengers, tricksters, and communicators of the cosmos. They think fast and adapt instantly.",
  Lunar: "Lunar souls are deeply intuitive emotional healers connected to cycles, rhythms, and the ebb and flow of life.",
  Jupiterian: "Jupiterian souls are expansive teachers, philosophers, and abundance magnets. They see the big picture and inspire faith.",
};

// Optional deep-lore block for lineages with extended mythos. Reworded in our
// own words to carry the source's meaning without copying. Rendered as a
// "Cosmic Lore" deep-dive when present; absent lineages simply don't show it.
export interface OriginLore {
  universalOrigin?: string;
  physicalCharacteristics?: string;
  beliefSystem?: string;
  cosmicAgenda?: string;
  technology?: string;
  consciousnessAbilities?: string;
  dimensionalCapacity?: string;
}

export const LORE_SECTIONS: Array<{ key: keyof OriginLore; label: string }> = [
  { key: 'universalOrigin', label: 'Universal Origin' },
  { key: 'physicalCharacteristics', label: 'Physical Characteristics' },
  { key: 'beliefSystem', label: 'Belief System' },
  { key: 'cosmicAgenda', label: 'Cosmic Agenda' },
  { key: 'technology', label: 'Technology' },
  { key: 'consciousnessAbilities', label: 'Consciousness Abilities' },
  { key: 'dimensionalCapacity', label: 'Dimensional Capacity' },
];

export interface OriginChar {
  traits: string[];
  earthChallenge: string;  // the shadow / what to watch out for
  gifts: string;           // the light / powers
  lifeLesson: string;      // the soul's purpose & motive
  physicalTraits: string;
  relationalStyle: string;
  lore?: OriginLore;       // optional extended mythos
}

export const ORIGIN_CHARACTERISTICS: Record<string, OriginChar> = {
  Pleiadian: {
    traits: ["Deeply Empathic", "Artistic", "Healing-Oriented", "Emotionally Absorbent", "Peace-Seeking", "Musically Gifted"],
    earthChallenge: "Pleiadian souls often struggle with boundaries. They absorb the emotions of everyone around them, sometimes mistaking others' pain for their own. They may develop codependent patterns, people-please compulsively, or stay in toxic relationships far too long. Depression, anxiety, and sensory overwhelm are common until they learn energetic hygiene.",
    gifts: "Unconditional love that can literally shift the emotional atmosphere of a room. Natural healers — their presence alone can calm nervous systems. Extraordinary artistic sensitivity, especially in music, poetry, and visual art. Psychic empathy that borders on telepathy.",
    lifeLesson: "Learning that compassion does not require self-sacrifice. The Pleiadian soul must master loving fiercely while maintaining an unbreakable energetic boundary — realizing that protecting their own energy is the prerequisite for sustainable service.",
    physicalTraits: "Often soft, gentle facial features. Eyes that look slightly otherworldly or unusually kind. Drawn to water, with a naturally graceful way of moving. Sensitive skin, sensitive digestion — finely tuned bodies.",
    relationalStyle: "Love deeply and completely, merging with partners at a soul level. Can struggle with independence. Attract narcissists until they learn their worth — then become devoted, intuitive, transformative partners.",
    lore: {
      universalOrigin: "Pleiadian souls are linked to the Pleiades star cluster (the Seven Sisters) in Taurus — one of the most beloved homes in starseed tradition, long associated with beauty, art, and the heart.",
      beliefSystem: "Service through love. Pleiadians are remembered as a heart-centered people who believe healing comes through compassion, creativity, and emotional honesty rather than force.",
      cosmicAgenda: "Pleiadian-resonant souls come to soften Earth — to raise its emotional frequency through art, music, healing, and unconditional love, and to model that sensitivity is a strength, not a weakness.",
      consciousnessAbilities: "Their hallmark is deep empathy that borders on telepathy — feeling what others feel before words are spoken, and the ability to shift the emotional 'weather' of a room simply by being in it.",
      dimensionalCapacity: "Tradition places Pleiadians among the heart-and-emotion realms of consciousness, working as gentle guides for humanity's emotional awakening.",
    },
  },
  Sirian: {
    traits: ["Fiercely Loyal", "Protective", "Water-Connected", "Ancestral Memory", "Guardian Energy", "Structured"],
    earthChallenge: "Sirian souls carry a weight of ancestral responsibility that can feel crushing. They hold families together and cannot rest while someone they love is in danger. This hypervigilance leads to chronic stress, control issues, and difficulty accepting help.",
    gifts: "Unshakable loyalty that makes them the most trustworthy people you will ever meet. Deep ancestral wisdom spanning millennia. Natural affinity with water and the moon. They build things that last: relationships, organizations, legacies.",
    lifeLesson: "Learning that they do not have to carry everything alone. The Sirian soul evolves by allowing others to protect them, softening the armor, and trusting that the world will not collapse if they rest.",
    physicalTraits: "Often strong, grounded builds. Eyes that carry ancient knowing. A deep connection to dogs, wolves, or canine energy. Drawn to moonlit environments and water; a stabilizing physical presence.",
    relationalStyle: "Once they commit, they commit forever — the partner who never leaves and never stops fighting for the relationship. Can be overprotective. Need a partner who does not mistake loyalty for control.",
    lore: {
      universalOrigin: "Sirian souls are tied to Sirius, the Dog Star — the brightest star in our sky and, in many ancient cultures (notably Egypt), a sacred marker of cycles, water, and hidden knowledge.",
      beliefSystem: "Guardianship and loyalty. Sirians are cast as protectors and keepers of sacred wisdom — beings who safeguard what matters and pass knowledge forward through trusted lineages.",
      cosmicAgenda: "Sirian-resonant souls arrive to protect, to steward ancient wisdom, and to build things that endure. They feel responsible for the wellbeing of those around them, often carrying more than their share.",
      consciousnessAbilities: "A deep, almost ancestral knowing — strong instincts, an affinity for water and the moon, and the steadiness that makes others feel safe in their presence.",
      dimensionalCapacity: "Folklore links Sirius to teaching and mystery-school traditions, casting Sirians as bridges between higher wisdom and Earth's spiritual schools.",
    },
  },
  Arcturian: {
    traits: ["Systems Thinker", "Visionary", "Technologically Gifted", "Pattern-Obsessed", "Emotionally Detached", "Future-Oriented"],
    earthChallenge: "Arcturian souls often feel alienated by the inefficiency of human society. The frustration of not being able to fix everything can lead to isolation, arrogance, or emotional shutdown. They may intellectualize their feelings instead of feeling them.",
    gifts: "Genius-level pattern recognition. They see the architecture behind reality — the systems and codes that hold everything together. Natural innovators and strategists who can redesign entire systems from scratch.",
    lifeLesson: "Learning that intelligence without heart is incomplete. The Arcturian soul evolves by descending from the mind into the body, from strategy into feeling — realizing emotions are not a bug, they are a feature.",
    physicalTraits: "Often angular, distinctive features. High foreheads or prominent bone structure. Eyes that seem to be analyzing everything. An unusual rapport with technology; an electric, slightly intense energy.",
    relationalStyle: "Love through problem-solving and acts of service. May struggle with emotional intimacy, defaulting to logic. When they finally open their heart, the depth of their love is staggering.",
    lore: {
      universalOrigin: "Arcturian souls are tied to Arcturus, the brilliant orange star in Boötes — in starseed tradition the home of one of the most spiritually and technologically advanced civilizations, and a kind of waystation for souls moving between lives and realms.",
      beliefSystem: "Evolution through higher mind. Arcturians hold that consciousness advances by mastering pattern, energy, and frequency — and that true healing is a matter of restoring harmony and coherence.",
      cosmicAgenda: "Arcturian-resonant souls come as guardians of higher consciousness and natural diplomats — helping opposing forces find common ground and anchoring hopeful visions of a more harmonious world. Many feel a pull toward healing, system design, and consciousness work.",
      technology: "In lore, Arcturians are linked to light-based, geometry-driven technology — healing through sound, color, sacred geometry, and frequency rather than brute mechanics.",
      consciousnessAbilities: "Genius-level pattern recognition, telepathic and energetic sensitivity, and an ability to perceive the underlying 'architecture' of a situation that others miss.",
      dimensionalCapacity: "Tradition places Arcturians among the higher-dimensional helpers devoted to Earth's awakening, working largely from the fifth dimension and above.",
    },
  },
  Orion: {
    traits: ["Intellectually Rigorous", "Disciplined", "Power-Conscious", "Analytical", "Achievement-Driven", "Karmically Intense"],
    earthChallenge: "Orion souls carry past-life karma around power, control, and intellectual dominance — repeating cycles of needing to be right, needing to win. Perfectionism, workaholism, and a fear of vulnerability are common shadow patterns.",
    gifts: "Razor-sharp intellect that can dissect any problem. Extraordinary discipline and work ethic. Natural authority others instinctively respect. Strategic thinking that sees ten moves ahead.",
    lifeLesson: "Learning that power wielded without compassion creates the very karma they came to resolve. The Orion soul evolves by softening control, accepting imperfection, and discovering that true mastery includes humility.",
    physicalTraits: "Often sharp, intense eyes and a commanding presence. Strong jawline or angular features. Controlled, deliberate body language; tension held in the shoulders and jaw.",
    relationalStyle: "Approach relationships with rigor. Can be critical until they learn gentleness. Need intellectual equals. Once they integrate emotional openness, they become stable, reliable, deeply respectful partners.",
    lore: {
      universalOrigin: "Orion souls are linked to the constellation Orion — a region cast in starseed lore as a vast arena of contrast, where the great themes of light and dark, freedom and control, have long played out.",
      beliefSystem: "Mastery through challenge. The Orion path is one of testing — learning discernment, accountability, and the right use of power, often by living through its misuse.",
      cosmicAgenda: "Orion-resonant souls come to master the lessons of power and polarity: to think clearly, hold themselves accountable, and transmute old patterns of domination or control into earned wisdom.",
      consciousnessAbilities: "Sharp analytical intelligence, formidable discipline, and strategic vision — the capacity to see many moves ahead and master whatever they commit to.",
      dimensionalCapacity: "Tradition frames Orion as a school of duality, casting these souls as ones who graduate from struggle into integrated wisdom.",
    },
  },
  Andromedan: {
    traits: ["Freedom-Seeking", "Spiritually Expansive", "Restless", "Philosophical", "Multi-Dimensional", "Boundary-Resistant"],
    earthChallenge: "Andromedan souls feel imprisoned by the density of Earth. Commitments and routines feel suffocating. They may sabotage good relationships or jobs simply because they feel trapped. Addiction to novelty is a recurring theme.",
    gifts: "A consciousness that spans galaxies. They think in terms of cosmic evolution. Natural philosophers and spiritual teachers who carry the vibration of infinite possibility.",
    lifeLesson: "Learning that true freedom is not the absence of commitment — it is the ability to be fully present wherever you are. Depth, not breadth, is where liberation actually lives.",
    physicalTraits: "Often tall or lanky. Eyes that seem to look past you into another dimension. Restless energy — they fidget and pace. Drawn to wide open spaces, mountains, or deserts.",
    relationalStyle: "Love intensely but struggle with permanence. Need partners who give them space to explore without taking it personally. Once matched in depth, they become extraordinarily devoted — on their own terms.",
    lore: {
      universalOrigin: "Andromedan souls are tied to the Andromeda galaxy — the vast neighbor beyond our own — and, in starseed lore, to a freedom-loving people of explorers and wanderers.",
      beliefSystem: "Freedom and expansion. Andromedans hold that consciousness is meant to roam, and they resist anything that cages the spirit — dogma, rigid hierarchy, or confinement.",
      cosmicAgenda: "Andromedan-resonant souls come to expand humanity's sense of what's possible — to break open narrow worldviews and carry the vibration of infinite possibility.",
      consciousnessAbilities: "A galaxy-spanning perspective, restless curiosity, and an instinct for liberation — they think in terms of cosmic evolution, not just personal growth.",
      dimensionalCapacity: "Folklore casts Andromedans as travelers comfortable across many states of consciousness, never fully at home in any single one.",
    },
  },
  Lyran: {
    traits: ["Natural Leader", "Creatively Fierce", "Independent", "Regal", "Feline Grace", "Ancient Wisdom"],
    earthChallenge: "Lyran souls carry the weight of primacy, which can become arrogance or an inability to follow anyone else. They may struggle with authority, resist collaboration, or feel no one else meets their standards. Loneliness at the top recurs.",
    gifts: "The creative fire of the original creators — older than most civilizations. Natural royalty: people sense their authority without being told. Extraordinary independence and the courage to go first.",
    lifeLesson: "Learning that true leadership means lifting others up, not standing above them — moving from sovereignty to service, from isolation to community.",
    physicalTraits: "Often cat-like features — almond eyes, graceful movements. Strong, athletic builds. A presence that commands attention without effort.",
    relationalStyle: "Need partners who respect their independence completely and will never try to control them. Love with a fierce, protective quality; once they choose you, their loyalty is absolute.",
    lore: {
      universalOrigin: "Lyran souls are tied to the constellation Lyra and, in starseed tradition, to the very first wave of humanoid civilizations — often called the elders or ancestors of many other star lineages.",
      beliefSystem: "Sovereignty and creative independence. As the remembered 'first ones,' Lyrans value freedom, self-rule, and the courage to originate rather than follow.",
      cosmicAgenda: "Lyran-resonant souls come to lead, to pioneer, and to reignite the original creative fire — going first into new territory and reminding others of their own sovereignty.",
      consciousnessAbilities: "A natural, unforced authority and creative drive — a feline grace and confidence that people sense without being told.",
      dimensionalCapacity: "As an elder lineage, tradition gives Lyrans deep ancestral memory, carrying the oldest 'starlight' of the galactic family.",
    },
  },
  Mintakan: {
    traits: ["Oceanic Homesickness", "Pure-Hearted", "Crystalline Sensitivity", "Gentle", "Emotionally Translucent", "Water-Drawn"],
    earthChallenge: "Mintakan souls carry the deepest homesickness of any lineage — their origin world no longer exists, and that grief echoes through every life. They may feel they belong nowhere; Earth can feel too rough, too harsh, too loud.",
    gifts: "A purity of heart almost impossible to corrupt. Emotional clarity that cuts through deception. Natural connection to water, crystals, and subtle healing. Their gentleness is a form of spiritual power.",
    lifeLesson: "Learning to make Earth their home despite knowing it is not where they originally belong — transforming grief into gratitude and homesickness into the creation of beauty.",
    physicalTraits: "Often large, luminous, dreamy eyes. Delicate features. Drawn to water in all forms. Unusually sensitive skin; they move as if swimming through the world.",
    relationalStyle: "Love with a tenderness that can bring people to tears. Need gentle, emotionally safe partners; harsh words wound deeply. When safe, they open into devotionally beautiful partners.",
    lore: {
      universalOrigin: "Mintakan souls are linked to Mintaka, one of the stars of Orion's Belt — and, in starseed tradition, to a lost water-world of crystalline purity that no longer exists.",
      beliefSystem: "Purity and gentleness. Mintakans hold that softness is a form of power and that the world is healed through tenderness, not force.",
      cosmicAgenda: "Mintakan-resonant souls come carrying a deep homesickness — a memory of a vanished home — which they transmute into the creation of beauty, gentleness, and emotional safety wherever they go.",
      consciousnessAbilities: "Crystalline emotional clarity, a strong affinity for water, and a heart so pure it can be felt by others as calm and safety.",
      dimensionalCapacity: "Tradition casts Mintakans as bridges of the heart, here to remind a harsh world of a gentler way of being.",
    },
  },
  "Blue Avian": {
    traits: ["High-Frequency", "Telepathic", "Vibrationally Sensitive", "Non-Verbal Communicator", "Ethereal", "Messenger"],
    earthChallenge: "Blue Avian souls struggle with verbal communication because their native mode is telepathic and vibrational. They may feel misunderstood, or overwhelmed by every unspoken frequency in a room.",
    gifts: "Communication through vibration, tone, and energy. The ability to shift the frequency of a space by being present. Telepathic sensitivity that carries messages from higher dimensions.",
    lifeLesson: "Learning to translate their high-frequency awareness into forms Earth humans can receive — mastering human language and social dynamics without losing their gifts.",
    physicalTraits: "Often bird-like qualities — sharp alert eyes, quick head movements, a lightness to the body. A musical or unusually resonant voice. Drawn to birds and the sky.",
    relationalStyle: "Connect deeply with very few people, preferring energetic intimacy. Need partners comfortable with silence who communicate through presence.",
  },
  Hadarian: {
    traits: ["Heart-Centered", "Unconditionally Loving", "Emotionally Restorative", "Warm", "Nurturing", "Self-Sacrificing"],
    earthChallenge: "Hadarian souls give too much. Their vast love attracts energy vampires and narcissists. They may lose themselves in service, forgetting they deserve love and rest. Burnout and heartbreak recur until they learn to love themselves first.",
    gifts: "The most powerful heart energy of any lineage — love that can heal emotional wounds in others. People feel safe, warm, and restored in their presence.",
    lifeLesson: "Learning that self-love is not selfish — it is the source from which all other love flows. Establishing boundaries and choosing partners who match their generosity.",
    physicalTraits: "Often warm, inviting features. Soft eyes that make people feel seen. A physical warmth others can literally feel. Drawn to pink, rose gold, and heart symbols.",
    relationalStyle: "Love with their entire being from the start. Must learn to pace themselves. When matched with an equally giving partner, the relationship becomes a sanctuary.",
  },
  Lemurian: {
    traits: ["Earth-Connected", "Crystal-Sensitive", "Sacred Feminine", "Sound Healer", "Nature Mystic", "Ancient Memory"],
    earthChallenge: "Lemurian souls carry grief for a lost civilization that lived in harmony with Earth. Modern society — concrete, pollution, disconnection — feels like a constant assault. A deep nostalgia can leave them feeling out of time.",
    gifts: "Deep connection to Earth's energy grid, ley lines, and crystal frequencies. Natural sound healers. Sacred feminine wisdom that predates written history.",
    lifeLesson: "Learning to bring ancient Lemurian wisdom into the modern world without retreating from it — being a bridge between the sacred past and the technological present.",
    physicalTraits: "Often drawn to natural fabrics, earth tones, and barefoot living. A sturdy, grounded build. Hands that seem to radiate healing energy; sensitive to the energy of places.",
    relationalStyle: "Seek partners who share their reverence for nature and the sacred. Need relationships that feel like spiritual partnerships, drawn to ritual and ceremony.",
  },
  Vegan: {
    traits: ["Humanitarian", "Nature-Loving", "Gentle", "Environmental Steward", "Altruistic", "Community-Minded"],
    earthChallenge: "Vegan souls feel the suffering of the planet as personal pain. Environmental destruction and injustice can overwhelm them into despair, helplessness, and eco-anxiety.",
    gifts: "A natural understanding of ecosystems, natural and social. They see how everything connects and design solutions that benefit the whole. Gentleness paired with practical wisdom.",
    lifeLesson: "Learning that they cannot save the world alone, but that their consistent, gentle influence creates ripples far larger than they realize.",
    physicalTraits: "Often a natural, unadorned beauty. Drawn to green spaces and gardens. Sensitive constitutions that respond poorly to processed foods or synthetic materials.",
    relationalStyle: "Seek kind, environmentally conscious partners who share their values. Conflict-averse but deeply committed once they find their match.",
  },
  Draconian: {
    traits: ["Dragon Energy", "Raw Power", "Ambitious", "Transformative", "Strategic", "Intimidating Presence"],
    earthChallenge: "Draconian souls carry an intensity that intimidates others. Their raw power can manifest as aggression or dominance. Power corruption is a real risk — they must guard against using strength to control rather than protect.",
    gifts: "Unmatched personal power and the ability to transform any situation through sheer will. Natural strategists with legendary courage. When aligned with purpose, their power builds empires.",
    lifeLesson: "Learning that true power is restraint — channeling their immense force into protection of the vulnerable rather than domination of the weak.",
    physicalTraits: "Often piercing, intense eyes and a powerful presence. Strong builds, prominent features. A gaze that can make others uncomfortable; drawn to fire and heat.",
    relationalStyle: "Need partners not intimidated by their intensity. Once they find an equal, devotion is fierce and protective. Can be possessive until they learn trust.",
  },
  Feline: {
    traits: ["Independent", "Graceful", "Fiercely Protective", "Sensual", "Egyptian Connection", "Night Energy"],
    earthChallenge: "Feline souls resist being told what to do, when, and how. Fierce independence can create isolation, and refusal to compromise can strain relationships. They may avoid vulnerability, seeing it as exposure.",
    gifts: "Extraordinary grace under pressure. Powerful protective instincts. Natural connection to ancient Egyptian mysteries and temple wisdom. Sensual intelligence that treats pleasure as a spiritual path.",
    lifeLesson: "Learning that interdependence is not captivity — allowing others close enough to see their soft side without feeling threatened.",
    physicalTraits: "Cat-like features — almond eyes, lithe bodies, graceful movements. Often night owls. Drawn to cats, Egyptian art, and luxurious textures.",
    relationalStyle: "Love on their own terms. Need partners who respect solitude and never try to cage them. Their loyalty, once given, is absolute — but always freely given.",
  },
  "Alpha Centaurian": {
    traits: ["Scientific Explorer", "Logic-Spiritual Bridge", "Discovery-Driven", "Technologically Intuitive", "Methodical", "Curious"],
    earthChallenge: "Alpha Centaurian souls feel torn between science and spirituality, unable to fully commit to either because they see truth in both — an identity crisis felt as academic restlessness or being perpetually between worlds.",
    gifts: "The rare ability to bridge scientific rigor and spiritual knowing. Natural innovators who see technological solutions others miss, approaching the mystical with precision and science with wonder.",
    lifeLesson: "Learning that science and spirit are not opposites — they are two lenses on the same infinite truth. Integration is their superpower.",
    physicalTraits: "Often bright, curious eyes and an alert demeanor. Drawn to astronomy, technology, and space. Their energy feels clean, precise, and refreshingly honest.",
    relationalStyle: "Need partners who stimulate them intellectually and spiritually. Bore easily with surface talk; once engaged, endlessly curious about their partner.",
  },
  Nihal: {
    traits: ["Cosmic Rebel", "Activist", "Justice-Driven", "System-Disruptor", "Passionate", "Anti-Authority"],
    earthChallenge: "Nihal souls are born angry at injustice, and that anger can consume them. They may burn out, alienate allies with their intensity, or grow cynical when change is slow.",
    gifts: "A fearless commitment to justice that cannot be bought or intimidated. They see through institutional corruption instantly. Natural leaders of movements whose passion ignites action.",
    lifeLesson: "Learning that sustainable change requires patience and strategy — building as fiercely as they destroy. Rage is fuel; wisdom decides where to direct it.",
    physicalTraits: "Often intense, passionate features and strong body language. Visible tension from the weight of their causes; eyes that burn with conviction.",
    relationalStyle: "Need partners who share their values and can handle their intensity. Love fiercely but may prioritize their cause until they learn balance.",
  },
  Polarian: {
    traits: ["First-Wave Being", "Unity Consciousness", "Ancient Beyond Measure", "Simplicity-Seeking", "Serene", "Original Light"],
    earthChallenge: "Polarian souls carry the memory of original unity — and the contrast with Earth's duality and conflict can feel unbearable. They may withdraw entirely or struggle with cosmic homesickness.",
    gifts: "A direct connection to source consciousness predating most civilizations. Their presence can remind others of the oneness beneath all separation. Extraordinary inner peace when aligned.",
    lifeLesson: "Learning to participate in duality without losing their connection to unity — here to embody oneness in a world that forgot it, transforming it through presence.",
    physicalTraits: "Often an otherworldly stillness. Simple, unadorned appearance. Eyes of unfathomable depth; they may seem ageless or timeless.",
    relationalStyle: "Seek deep soul connections over surface romance. Their love is quiet, vast, and unconditional — but hard to express in the dramatic ways Earth culture expects.",
  },
  Essassani: {
    traits: ["High-Frequency", "Playful", "Joy-Guided", "Excitement-Following", "Lightworker", "Optimistic"],
    earthChallenge: "Essassani souls can seem naive because they follow excitement over logic. They may struggle with discipline, long-term planning, and enduring boredom or pain — and not be taken seriously.",
    gifts: "An unerring internal compass pointing toward their highest joy. When they follow excitement, synchronicities multiply. They carry a frequency of playful possibility.",
    lifeLesson: "Learning that following excitement IS the most logical path — and finding the courage to trust it even when the world calls it irresponsible.",
    physicalTraits: "Often bright, lively features with an energetic bounce. Quick smiles, expressive faces. Their energy feels lighter and faster; may look younger than their age.",
    relationalStyle: "Need fun, adventurous partners willing to follow synchronicity. Cannot tolerate chronic heaviness. Their love is joyful and spontaneous.",
  },
  Maldekian: {
    traits: ["Karmic Memory", "Responsibility-Haunted", "Consequence-Aware", "Rebuilder", "Cautious", "Deeply Serious"],
    earthChallenge: "Maldekian souls carry the weight of a destroyed world — irrational fear of catastrophe, apocalyptic anxiety, and guilt from a past-life collective failure that can become chronic over-responsibility.",
    gifts: "An acute awareness of consequences that makes them extraordinarily responsible stewards of power. They understand civilizational collapse, and that knowledge gives them rare wisdom as rebuilders.",
    lifeLesson: "Learning they are not responsible for what happened on Maldek — their purpose now is to rebuild with wisdom, not carry guilt. Self-forgiveness is their liberation.",
    physicalTraits: "Often a heaviness in the eyes that seems older than their years. Drawn to preparedness, sustainability, and rebuilding; a weighty, grounded presence.",
    relationalStyle: "Need stable, reassuring partners who create safety. May over-prepare for worst cases. Once they release the guilt, they become deeply committed, wise partners.",
  },
  Annunaki: {
    traits: ["Civilization Builder", "Dynastic Thinker", "Long-Term Strategist", "Authority", "Architect", "Legacy-Obsessed"],
    earthChallenge: "Annunaki souls think in millennia, making human progress infuriating. They may become controlling or authoritarian in their drive to build enduring structures, tempted to view others as tools for their vision.",
    gifts: "The ability to build civilizations — thinking in infrastructure, legacy, and multi-generational impact. Natural architects of systems, organizations, and institutions.",
    lifeLesson: "Learning that a lasting legacy requires consent, collaboration, and respect for sovereignty. Empires of control fall; legacies built on love endure.",
    physicalTraits: "Often tall, imposing builds and strong bone structure. A commanding presence; drawn to architecture, ancient structures, and monumental art.",
    relationalStyle: "Approach relationships strategically. Need partners who share their vision. Can be distant until they learn that love is not a resource to manage but a force to surrender to.",
    lore: {
      universalOrigin: "In starseed tradition, the Annunaki are remembered as a powerful elder race woven into Mesopotamian myth — sky-born 'shining ones' said to have descended into early human history and shaped its first cities and kingships.",
      physicalCharacteristics: "They are pictured as towering, regal figures of great strength — long-haired and richly adorned, carrying the unmistakable bearing of rulers.",
      beliefSystem: "A path of sovereignty and self-interest, carrying a heavy karmic theme: power reached for too forcefully, dominion over others, and the long work of answering for it.",
      cosmicAgenda: "In the widely-told tradition popularized by Zecharia Sitchin's reading of Sumerian texts, the Annunaki came to Earth in the distant past seeking resources, influenced early humanity, helped seed its first civilizations, and then withdrew — leaving a lingering promise that they would one day return. As a soul-resonance, this becomes a drive to build civilization on a grand scale, a long-game view measured in generations, and a karmic lesson about wielding power responsibly.",
      consciousnessAbilities: "Once said to shape reality through sheer will and command, the lineage's gift now shows up as formidable strategic intelligence, natural authority, and a talent for organizing people and resources toward something built to last.",
      dimensionalCapacity: "Tradition places the Annunaki among the denser, more physically-anchored star lineages — part of why their lessons tend to play out so concretely in the arenas of power, money, and structure.",
    },
  },
  Avian: {
    traits: ["Freedom-Loving", "Aerial Perspective", "Visionary", "Light-Bodied", "Sky-Connected", "Quick-Minded"],
    earthChallenge: "Avian souls feel weighted down and restricted. They may struggle with physical limitation, claustrophobia, or restlessness. Commitment to one place or path can feel like clipped wings.",
    gifts: "The ability to see life from a higher perspective — patterns and possibilities invisible to those on the ground. Natural visionaries whose aerial view reveals solutions.",
    lifeLesson: "Learning that landing is not the same as being caged — discovering they can still see the sky with their feet on the earth.",
    physicalTraits: "Often sharp, alert features and quick, darting eyes. Light, lean builds. Drawn to high places, aviation, or birds; quick, precise movements.",
    relationalStyle: "Need partners who do not try to ground them. Respond to lightness, humor, and shared adventures; love expressed through freedom and shared experience.",
  },
  Venusian: {
    traits: ["Beauty-Oriented", "Sensual", "Relationally Wise", "Artistic", "Harmonious", "Pleasure-Seeking"],
    earthChallenge: "Venusian souls can become addicted to beauty and harmony — avoiding conflict and hard truths. They may prioritize aesthetics over substance or use charm to avoid accountability.",
    gifts: "An innate understanding of beauty as a spiritual force. They create harmony in relationships, spaces, and communities. Natural artists, designers, and diplomats.",
    lifeLesson: "Learning that true beauty includes ugly truths, and real harmony requires honest conflict — embracing the full spectrum, not just the pleasant parts.",
    physicalTraits: "Often classically attractive. Drawn to fashion, art, and beautiful environments. Graceful movement, a melodic voice, naturally harmonious appearance.",
    relationalStyle: "Love is their primary language and purpose — attentive, romantic, deeply invested. Need partners who value the art of relationship as much as they do.",
  },
  Martian: {
    traits: ["Warrior Spirit", "Pioneer", "Action-Oriented", "Courageous", "Survival Instinct", "Confrontational"],
    earthChallenge: "Martian souls carry past-life intensity around conflict and survival. Their default response to stress is fight, which in a diplomatic world creates problems — anger, aggression, and an inability to back down.",
    gifts: "Unmatched courage and decisive action when others freeze. They run toward danger, not away. Natural pioneers who thrive in hostile environments and get things done.",
    lifeLesson: "Learning that the greatest battle is fought within — mastering their own aggression and channeling warrior energy into protection rather than destruction.",
    physicalTraits: "Often athletic, muscular, or wiry. Strong jaw, intense eyes. Physical energy needing constant outlet; may be drawn to martial arts.",
    relationalStyle: "Love with intensity and passion. Can be jealous or domineering until they mature. Once evolved, fiercely devoted protectors.",
  },
  Saturnian: {
    traits: ["Karmically Heavy", "Disciplined", "Time-Mastering", "Responsible", "Enduring", "Authority-Bearing"],
    earthChallenge: "Saturnian souls feel old from birth, carrying a weight of karmic responsibility. Childhood can feel like an endurance test; depression and isolation are common until their Saturn return.",
    gifts: "Mastery through persistence. They understand time — how to use it, how to wait, how to build slowly and permanently. When they harvest the fruits of their patience, the rewards are enormous.",
    lifeLesson: "Learning that karma is not punishment — it is curriculum. Embracing their lessons with grace and discovering the weight they carry is strength in disguise.",
    physicalTraits: "Often prominent bone structure. May look older when young and younger when old. Drawn to clocks, antiques, and ancient things; a solid, immovable presence.",
    relationalStyle: "Cautious, slow to trust, but profoundly loyal once committed. Their love is an investment — slow to build but rock-solid once established.",
  },
  Neptunian: {
    traits: ["Mystic", "Dreamer", "Boundary-Dissolving", "Psychic", "Artistically Gifted", "Escapist Tendency"],
    earthChallenge: "Neptunian souls dissolve the boundary between reality and illusion. Addiction, escapism, confusion, and self-deception are recurring challenges. They may live in a beautiful but disconnecting fog.",
    gifts: "Access to realms of consciousness most never touch. Natural channels, mediums, and visionaries whose art can transport others into transcendent states.",
    lifeLesson: "Learning to be a mystic with both feet on the ground — finding grounding practices that keep them tethered while maintaining access to the infinite.",
    physicalTraits: "Often dreamy, unfocused eyes that see beyond the physical. Fluid, graceful movement. Drawn to the ocean, fog, and twilight; an ethereal presence.",
    relationalStyle: "Love through merging, dissolving into their partner. Can lose themselves in romantic fantasy. Need grounded partners who appreciate their magic without enabling escapism.",
  },
  Solar: {
    traits: ["Life-Force Radiator", "Natural Leader", "Creative", "Inspiring", "Charismatic", "Center-Stage"],
    earthChallenge: "Solar souls need to shine, and when dimmed by criticism or self-doubt they can become depressed or attention-seeking. Their identity is tied to external validation, making rejection feel existential.",
    gifts: "Pure life-force energy that vitalizes everyone around them. Natural leaders, creators, and performers who light up rooms and inspire action.",
    lifeLesson: "Learning that their light comes from within and needs no audience — that they can shine in solitude, and authentic expression matters more than applause.",
    physicalTraits: "Often bright, radiant features and a warm complexion. A presence that draws attention naturally; drawn to sunlight, gold, and warm climates.",
    relationalStyle: "Generous, warm, creatively expressive. Need partners who celebrate them without competing for the spotlight. Dramatic but deeply loyal.",
  },
  Plutonian: {
    traits: ["Deep Transformer", "Shadow Worker", "Psychologically Intense", "Death-Rebirth Cycle", "Occult Knowledge", "Power Magnetism"],
    earthChallenge: "Plutonian souls live in the underworld of the psyche, drawn to taboos and the hidden. This can become obsession, power struggles, or manipulation. They may unconsciously create crises to trigger transformation.",
    gifts: "The ability to see through every facade and lie. They understand power dynamics at a molecular level. Natural therapists, healers, and investigators whose presence breaks others out of stuck patterns.",
    lifeLesson: "Learning that transformation does not always require destruction — that the deepest power is the power to heal, not to destroy.",
    physicalTraits: "Intense, penetrating eyes that seem to see through you. Magnetic and slightly intimidating; drawn to black and mysterious aesthetics.",
    relationalStyle: "Love at maximum depth or not at all. Need partners who can handle intensity and are unafraid of shadows. Relationships with them are transformative.",
  },
  Uranian: {
    traits: ["Revolutionary", "Eccentric Genius", "Structure-Breaking", "Innovative", "Electrically Charged", "Unpredictable"],
    earthChallenge: "Uranian souls are allergic to normalcy and tradition. Their drive to break structures can leave them isolated or perpetually starting over. They may sabotage stability because it feels like conformity.",
    gifts: "Genius-level innovation and the courage to implement it. They see solutions that do not yet exist and build them. Natural inventors and cultural pioneers who electrify any space.",
    lifeLesson: "Learning that revolution without follow-through is just destruction — building the new world, not just tearing down the old one.",
    physicalTraits: "Often unusual, striking features that defy standard beauty. Electric energy others can feel; an affinity for technology and sudden, unexpected movements.",
    relationalStyle: "Need partners who thrive on change and are unthreatened by their unconventionality. Cannot tolerate possessiveness or routine; every relationship with them is unlike any other.",
  },
  Mercurial: {
    traits: ["Quick-Minded", "Trickster Energy", "Communicator", "Adaptable", "Multi-Talented", "Restlessly Curious"],
    earthChallenge: "Mercurial souls process so fast they become bored with almost everything. They may struggle to finish projects or stay in one career. Restlessness can create anxiety, superficiality, or unreliability.",
    gifts: "Extraordinary communication in any medium — writing, speaking, coding, translating. They learn anything faster than most and adapt instantly. Natural bridge-builders between worlds.",
    lifeLesson: "Learning that depth matters more than breadth — choosing one thing to master rather than skimming the surface of everything.",
    physicalTraits: "Often youthful-looking with quick, animated features and expressive hands. Fast-talking, fast-moving; an energy changeable from moment to moment.",
    relationalStyle: "Need intellectually stimulating partners who keep up with their pace. Bore easily but are endlessly entertaining; love through words, humor, and shared curiosity.",
  },
  Lunar: {
    traits: ["Deeply Intuitive", "Emotional Healer", "Cycle-Aware", "Nurturing", "Receptive", "Mood-Sensitive"],
    earthChallenge: "Lunar souls are governed by emotional tides others find confusing. They may struggle with emotional overwhelm, codependency, and distinguishing their own feelings from others'. Stability feels elusive.",
    gifts: "The most powerful emotional intelligence of any resonance — they feel the truth before it is spoken. Natural healers through emotional attunement and cyclical wisdom; they create safe spaces.",
    lifeLesson: "Learning to honor their emotional rhythms without being ruled by them — becoming the observer of their tides rather than the victim of them.",
    physicalTraits: "Often round, soft features and expressive eyes that change with mood. Drawn to the moon, nighttime, and reflective surfaces; energy that fluctuates with lunar cycles.",
    relationalStyle: "Need emotionally available, patient partners who do not judge their mood shifts. When secure, they become the most intuitive and caring partners imaginable.",
  },
  Jupiterian: {
    traits: ["Expansive Teacher", "Philosopher", "Abundance Magnet", "Optimistic", "Faith-Carrier", "Generous"],
    earthChallenge: "Jupiterian souls tend toward excess — too much optimism, generosity, and expansion without consolidation. They may overcommit or overpromise, and 'everything will work out' can become avoidance of practical problems.",
    gifts: "A natural ability to see the big picture and inspire faith. They attract abundance and opportunity seemingly without effort. Natural teachers and philosophers whose wisdom elevates everyone.",
    lifeLesson: "Learning that expansion without discipline leads to collapse — matching big vision with detailed follow-through and saying no to some opportunities to fully receive the right ones.",
    physicalTraits: "Often large, generous features — a big smile, warm eyes, open body language. Drawn to travel and places of learning; a warm, welcoming presence.",
    relationalStyle: "Generous, adventurous, philosophical in love. Need partners who share their love of growth and meaning; can scatter until they learn to focus their expansive love.",
  },
};

export function describeOrigin(lineage?: string | null): string {
  if (!lineage) return "";
  return (
    ORIGIN_DESCRIPTIONS[lineage] ||
    `Your chart carries a recurring ${lineage} signature — a star-resonance that repeats across several of your soul-origin points.`
  );
}
