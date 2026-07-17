// Content/interpretation layer for Starseed readings on web (both the legacy
// /readings/starseed page and the new /readings/starseed-origin page).
//
// The backend only returns each lineage's name + score — NO prose — so the
// description and the balanced light/shadow/purpose detail are mapped here by
// category name. Ported from the mobile app's starseedEngine.ts so web and
// mobile tell the same story. Covers all 20 star lineages + 10 planetary
// resonances; families with no entry fall back to a neutral line.

export const ORIGIN_DESCRIPTIONS: Record<string, string> = {
  Pleiadian: "You feel everything. You walk into a room and know instantly who is hurting, and you have carried strangers' pain home as if it were your own. You are pulled toward healing, music, and love without conditions — it is the only way you know how to operate.",
  Sirian: "You are the guardian. You resonate with water, the moon, and memory older than your family tree. Loyalty runs in your blood; you build things that last, and you defend the people you love with a ferocity that surprises even you.",
  Arcturian: "Your soul signature traces to Arcturus — one of the most advanced civilizations in the galaxy. You came in as a system architect: you see the pattern behind the pattern, redesign what is broken, and go restless anywhere innovation is treated as a threat.",
  Orion: "You carry the imprint of intellectual mastery and karmic discipline. You need to be right — and you usually are. Logic, precision, accountability: you demand them from yourself first. Old power struggles echo in you as a drive to prove yourself and master every room you enter.",
  Andromedan: "You resist confinement on principle. You crave freedom, exploration, and spiritual expansion, and you have never fit inside a single identity, culture, or belief system — every box you have tried on was one size too small.",
  Lyran: "You carry the oldest starlight — the memory of the first cosmic civilizations. You lead without being asked, create with fire, and answer to no one. Independence is not your preference; it is your architecture.",
  Venusian: "You experience beauty as a spiritual event. Balance, art, deep partnership — you seek them the way others seek air. Love is not optional for you; it is the medium through which you learn every lesson.",
  Martian: "You are a warrior, pioneer, and catalyst. You carry past-life intensity around conflict, survival, and courage — you run toward what others run from. Action is your prayer.",
  Saturnian: "You carry an old, heavy karma thread. You were born already serious — here to master discipline, responsibility, and the lessons of time.",
  Neptunian: "You dissolve boundaries between worlds — natural mystic, dreamer, channel. The veil has always been thin for you. Your challenge is grounding.",
  Mintakan: "You ache with an oceanic homesickness — a longing for a world of crystalline purity that no longer exists. You are gentle, compassionate, and so sensitive that this planet has always felt a little too loud.",
  "Blue Avian": "You are a high-frequency messenger from etheric realms. You communicate through vibration, thought, and subtle energy — words have always felt like a clumsy second language.",
  Hadarian: "You are a heart-centered healer whose love is vast and unconditional. You radiate warmth, comfort, and restoration — people exhale around you and don't know why.",
  Lemurian: "You carry the memory of ancient Earth — a time when humanity lived in harmony with the land, crystals, sound, and the sacred feminine. Part of you has been homesick for it ever since.",
  Solar: "You radiate life-force energy. You were born to lead, inspire, and create — rooms reorganize around you.",
  Vegan: "Your soul traces to Vega in the Lyra constellation. You are a gentle humanitarian with a bone-deep connection to nature — you feel the state of the planet in your own body.",
  Draconian: "You carry the energy of the Dragon — raw power, ambition, and transformative fire. You lead and strategize by instinct, and people feel you enter a room before they see you.",
  Feline: "You are independent, graceful, and fiercely protective of the ones you love. Your soul runs back to the ancient Egyptian and Lyran feline civilizations — it shows in how you read a room before you enter it.",
  "Alpha Centaurian": "You are a scientific explorer who bridges spirituality and logic. Technology, space, discovery — you live at the frontier, and you refuse to choose between the lab and the temple.",
  Nihal: "You are a cosmic rebel and activist. You came here to challenge unjust systems, fight for the marginalized, and disrupt stagnant power — you have been arguing with unfair rules since you could talk.",
  Polarian: "You are among the oldest souls in the cosmos — a first-wave being who remembers original unity. Nothing here has ever felt entirely new to you.",
  Essassani: "You vibrate at a high, playful frequency. Excitement is your compass — you follow your highest enthusiasm the way others follow instructions, and it keeps working.",
  Maldekian: "You carry the karmic memory of a destroyed world. You came in with deep lessons about responsibility and consequences — it is why you brace for disasters no one else sees.",
  Annunaki: "You carry ancient builder energy — the architect of civilizations. You think in dynasties and millennia while everyone else plans the weekend.",
  Avian: "You are a freedom-seeking visionary connected to the element of air. You see life from a higher perspective — and you suffocate anywhere you can't see sky.",
  Plutonian: "You are a deep transformer walking the path of death and rebirth. Shadow work, psychology, occult knowledge — you go where others won't look, because that is where the truth is.",
  Uranian: "You are a revolutionary, an eccentric genius. You arrived with a mandate to break outdated structures — you have never left one standing.",
  Mercurial: "You are the messenger, trickster, and communicator of the cosmos. You think faster than people talk and adapt before anyone notices.",
  Lunar: "You are a deeply intuitive emotional healer, tuned to cycles, rhythms, and the ebb and flow of life. You feel the tide turn before anyone speaks.",
  Jupiterian: "You are an expansive teacher, philosopher, and abundance magnet. You see the big picture while others squint at details — and your faith is contagious.",
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
    earthChallenge: "Boundaries are your lifelong homework. You absorb the emotions of everyone around you and mistake their pain for your own. You people-please compulsively and stay in toxic relationships years past the expiry date because you feel responsible for the other person's suffering. Depression, anxiety, and sensory overwhelm keep returning until you learn energetic hygiene.",
    gifts: "Your love shifts the emotional atmosphere of a room. You calm nervous systems just by being present. Your artistic sensitivity — music, poetry, visual art — runs unusually deep, and your empathy borders on telepathy: you feel what others feel before a word is spoken.",
    lifeLesson: "Compassion does not require self-sacrifice. Your work is loving fiercely while holding an unbreakable energetic boundary — learning that protecting your own energy is not selfish; it is the prerequisite for sustainable service.",
    physicalTraits: "Soft, gentle features; eyes people describe as unusually kind or slightly otherworldly. You are drawn to water and move with a natural, fluid grace. Sensitive skin, sensitive digestion — your body is a finely tuned instrument and it lets you know.",
    relationalStyle: "You love completely, merging with partners at soul level — sometimes losing yourself in the process. You attract narcissists until you learn your worth. Once you do, you become the devoted, intuitive, transformative partner most people only read about.",
    lore: {
      universalOrigin: "Your soul is linked to the Pleiades star cluster (the Seven Sisters) in Taurus — one of the most beloved homes in starseed tradition, long associated with beauty, art, and the heart.",
      beliefSystem: "Service through love. Your lineage is remembered as a heart-centered people who hold that healing comes through compassion, creativity, and emotional honesty — never force.",
      cosmicAgenda: "You came to soften Earth — to raise its emotional frequency through art, music, healing, and unconditional love, and to prove by existing that sensitivity is a strength, not a weakness.",
      consciousnessAbilities: "Your hallmark is empathy that borders on telepathy — you feel what others feel before words are spoken, and you shift the emotional 'weather' of a room simply by being in it.",
      dimensionalCapacity: "Tradition places your lineage among the heart-and-emotion realms of consciousness, working as gentle guides for humanity's emotional awakening.",
    },
  },
  Sirian: {
    traits: ["Fiercely Loyal", "Protective", "Water-Connected", "Ancestral Memory", "Guardian Energy", "Structured"],
    earthChallenge: "You carry ancestral responsibility like a physical weight. You hold the family together, remember every obligation, and cannot rest while someone you love is in danger. That hypervigilance breeds chronic stress and control issues — and you refuse help, because you are the protector, never the protected.",
    gifts: "Your loyalty is unshakable — you are the most trustworthy person your people know. You carry ancestral wisdom spanning millennia, a natural affinity with water and the moon, and a builder's instinct: your relationships, organizations, and legacies are built to outlast you.",
    lifeLesson: "You do not have to carry everything alone. You grow by letting others protect you for once — softening the armor and trusting that the world will not collapse if you rest. Vulnerability is your graduation.",
    physicalTraits: "A strong, grounded build and eyes that carry ancient knowing. You bond with dogs and wolves on sight. Moonlight and water pull you, and your physical presence steadies people — they feel safer standing next to you.",
    relationalStyle: "When you commit, you commit forever — you are the partner who never leaves and never stops fighting for the relationship. Your protection tips into control when you're not watching. You need someone who reads your loyalty as devotion, not a leash.",
    lore: {
      universalOrigin: "Your soul is tied to Sirius, the Dog Star — the brightest star in our sky and, in many ancient cultures (notably Egypt), a sacred marker of cycles, water, and hidden knowledge.",
      beliefSystem: "Guardianship and loyalty. Your lineage is cast as protectors and keepers of sacred wisdom — beings who safeguard what matters and pass knowledge forward through trusted hands.",
      cosmicAgenda: "You arrived to protect, to steward ancient wisdom, and to build things that endure. You feel responsible for the wellbeing of everyone around you — and you carry more than your share.",
      consciousnessAbilities: "A deep, almost ancestral knowing — strong instincts, an affinity for water and the moon, and a steadiness that makes others feel safe just standing near you.",
      dimensionalCapacity: "Folklore links Sirius to teaching and mystery-school traditions, casting your lineage as a bridge between higher wisdom and Earth's spiritual schools.",
    },
  },
  Arcturian: {
    traits: ["Systems Thinker", "Visionary", "Technologically Gifted", "Pattern-Obsessed", "Emotionally Detached", "Future-Oriented"],
    earthChallenge: "Human inefficiency offends you. You see broken systems everywhere — and the frustration of not being able to fix them all pushes you into isolation, arrogance, or emotional shutdown. You analyze your feelings instead of feeling them, and you know it.",
    gifts: "Genius-level pattern recognition. You see the architecture behind reality — the systems and codes holding everything together — and you redesign entire structures from scratch. Your mind processes at speeds that leave rooms behind.",
    lifeLesson: "Intelligence without heart is incomplete. Your evolution runs from the mind down into the body, from strategy into feeling — until you finally accept that emotions are not a bug. They are a feature.",
    physicalTraits: "Angular, distinctive features; a high forehead or prominent bone structure. Eyes that are visibly analyzing everything. Devices behave for you in ways your friends joke about, and your energy reads as electric, slightly intense.",
    relationalStyle: "You love through problem-solving and acts of service, and you default to logic when intimacy gets close. Feelings arrive slower for you than solutions do. When you finally open your heart, the depth of what is in there is staggering.",
    lore: {
      universalOrigin: "Your soul is tied to Arcturus, the brilliant orange star in Boötes — in starseed tradition the home of one of the most spiritually and technologically advanced civilizations, and a waystation for souls moving between lives and realms.",
      beliefSystem: "Evolution through higher mind. Your lineage holds that consciousness advances by mastering pattern, energy, and frequency — and that true healing means restoring harmony and coherence.",
      cosmicAgenda: "You came as a guardian of higher consciousness and a natural diplomat — helping opposing forces find common ground and anchoring the vision of a more harmonious world. The pull you feel toward healing, system design, and consciousness work is the assignment.",
      technology: "In lore, your lineage works light-based, geometry-driven technology — healing through sound, color, sacred geometry, and frequency rather than brute mechanics.",
      consciousnessAbilities: "Genius-level pattern recognition, telepathic and energetic sensitivity, and the ability to perceive the underlying 'architecture' of a situation that everyone else misses.",
      dimensionalCapacity: "Tradition places your lineage among the higher-dimensional helpers devoted to Earth's awakening, working largely from the fifth dimension and above.",
    },
  },
  Orion: {
    traits: ["Intellectually Rigorous", "Disciplined", "Power-Conscious", "Analytical", "Achievement-Driven", "Karmically Intense"],
    earthChallenge: "You carry past-life karma around power and control, and it repeats: needing to be right, needing to win, needing to prove competence one more time. Perfectionism, workaholism, and a fear of being seen vulnerable are your shadow's favorite outfits.",
    gifts: "A razor-sharp intellect that dissects any problem. Discipline and work ethic that others find frankly unsettling. Natural authority people obey without asking why, and strategic thinking that runs ten moves ahead of the conversation.",
    lifeLesson: "Power wielded without compassion creates the exact karma you came here to resolve. You evolve by loosening your grip, accepting imperfection — in others and, harder, in yourself — and learning that true mastery includes humility.",
    physicalTraits: "Sharp, intense eyes and a commanding presence. Strong jawline, controlled and deliberate body language. You hold your tension in the shoulders and jaw — your dentist and your massage therapist both know it.",
    relationalStyle: "You run relationships with the same rigor you run everything else — and yes, your partners have called you critical. You need an intellectual equal. Once you let emotional openness in, you become the most stable, respectful partner in the room.",
    lore: {
      universalOrigin: "Your soul is linked to the constellation Orion — cast in starseed lore as a vast arena of contrast, where the great themes of light and dark, freedom and control, have long played out.",
      beliefSystem: "Mastery through challenge. The Orion path is one of testing — you learn discernment, accountability, and the right use of power, often by living through its misuse.",
      cosmicAgenda: "You came to master the lessons of power and polarity: to think clearly, hold yourself accountable, and transmute old patterns of domination into earned wisdom.",
      consciousnessAbilities: "Sharp analytical intelligence, formidable discipline, and strategic vision — you see many moves ahead and master whatever you commit to.",
      dimensionalCapacity: "Tradition frames Orion as a school of duality — and you as one who graduates from struggle into integrated wisdom.",
    },
  },
  Andromedan: {
    traits: ["Freedom-Seeking", "Spiritually Expansive", "Restless", "Philosophical", "Multi-Dimensional", "Boundary-Resistant"],
    earthChallenge: "Earth's density feels like a prison to you. Routines, contracts, expectations — all suffocating. You have sabotaged good relationships and good jobs purely because they started to feel like a cage, and novelty is your favorite escape hatch.",
    gifts: "A consciousness that spans galaxies. You think in cosmic evolution, not five-year plans. You are a natural philosopher and spiritual teacher, and your presence reminds people there is more to life than what their eyes report. You carry the vibration of infinite possibility.",
    lifeLesson: "True freedom is not the absence of commitment — it is the ability to be fully present wherever you are. Depth, not breadth, is where your liberation actually lives.",
    physicalTraits: "Tall or lanky, with eyes that look past people into somewhere else. You fidget, pace, and need to move. Wide open spaces — mountains, deserts, long horizons — reset you like nothing indoors ever has.",
    relationalStyle: "You love intensely and flinch at permanence. You need a partner who gives you room to roam without taking it personally. Matched in depth and left unleashed, you become extraordinarily devoted — on your own terms.",
    lore: {
      universalOrigin: "Your soul is tied to the Andromeda galaxy — the vast neighbor beyond our own — and, in starseed lore, to a freedom-loving people of explorers and wanderers.",
      beliefSystem: "Freedom and expansion. Your lineage holds that consciousness is meant to roam — and resists anything that cages the spirit: dogma, rigid hierarchy, confinement.",
      cosmicAgenda: "You came to expand humanity's sense of what is possible — to break open narrow worldviews and carry the vibration of infinite possibility into every room you enter.",
      consciousnessAbilities: "A galaxy-spanning perspective, restless curiosity, and an instinct for liberation — you think in terms of cosmic evolution, not just personal growth.",
      dimensionalCapacity: "Folklore casts your lineage as travelers at ease across many states of consciousness — never fully at home in any single one, including this one.",
    },
  },
  Lyran: {
    traits: ["Natural Leader", "Creatively Fierce", "Independent", "Regal", "Feline Grace", "Ancient Wisdom"],
    earthChallenge: "You carry the memory of being first, and it curdles into arrogance if you let it. You cannot stand being managed, you resist collaboration, and privately you suspect no one else's standards are high enough. It gets lonely at the altitude you keep.",
    gifts: "The creative fire of the original creators — older than most civilizations. People sense your authority without being told; you have never had to raise your voice to run a room. You go first into unknown territory and make it look like a decision instead of a risk.",
    lifeLesson: "True leadership lifts others up instead of standing above them. Your path runs from sovereignty to service, from isolation to community — from being first to making sure nobody is left behind.",
    physicalTraits: "Cat-like features — almond eyes, graceful movement, a regal posture you never practiced. A strong, athletic build. You command attention in rooms without doing anything, and you have noticed.",
    relationalStyle: "You need a partner who respects your independence completely — the first attempt to control you is the last conversation. You love with a fierce, protective quality. Once you choose someone, your loyalty is absolute.",
    lore: {
      universalOrigin: "Your soul is tied to the constellation Lyra and, in starseed tradition, to the very first wave of humanoid civilizations — the elders and ancestors of many other star lineages.",
      beliefSystem: "Sovereignty and creative independence. As the remembered 'first ones,' your lineage prizes freedom, self-rule, and the courage to originate rather than follow.",
      cosmicAgenda: "You came to lead, to pioneer, and to reignite the original creative fire — going first into new territory and reminding everyone you meet of their own sovereignty.",
      consciousnessAbilities: "A natural, unforced authority and creative drive — a feline grace and confidence people sense in you without being told.",
      dimensionalCapacity: "As an elder lineage, tradition gives you deep ancestral memory — you carry the oldest 'starlight' of the galactic family.",
    },
  },
  Mintakan: {
    traits: ["Oceanic Homesickness", "Pure-Hearted", "Crystalline Sensitivity", "Gentle", "Emotionally Translucent", "Water-Drawn"],
    earthChallenge: "You carry the deepest homesickness of any lineage — your origin world no longer exists, and its grief echoes through you. You cry without knowing why. You have felt you belong nowhere your whole life; Earth reads as too rough, too harsh, too loud.",
    gifts: "A purity of heart that is nearly impossible to corrupt. Your emotional clarity cuts through deception instantly — you feel a lie before you can name it. Water, crystals, and subtle frequencies respond to you, and your gentleness transforms people who never responded to force.",
    lifeLesson: "Making Earth your home despite knowing it is not where you are from — turning grief into gratitude, longing into presence, and homesickness into the creation of beauty wherever you are standing.",
    physicalTraits: "Large, luminous, dreamy eyes people remember. Delicate features, unusually sensitive skin. You are pulled to water in every form — ocean, rain, long baths — and you move through the world like you are swimming through it.",
    relationalStyle: "You love with a tenderness that has brought people to tears. Harsh words wound you for days, so you need a partner who is emotionally safe on reflex. Given that safety, you open into a devotion most people never get to witness.",
    lore: {
      universalOrigin: "Your soul is linked to Mintaka, one of the stars of Orion's Belt — and, in starseed tradition, to a lost water-world of crystalline purity that no longer exists.",
      beliefSystem: "Purity and gentleness. Your lineage holds that softness is a form of power and that the world is healed through tenderness, not force.",
      cosmicAgenda: "You came carrying a deep homesickness — the memory of a vanished home — and your work is transmuting it into beauty, gentleness, and emotional safety everywhere you go.",
      consciousnessAbilities: "Crystalline emotional clarity, a strong affinity for water, and a heart so pure other people feel it as calm and safety.",
      dimensionalCapacity: "Tradition casts you as a bridge of the heart, here to remind a harsh world of a gentler way of being.",
    },
  },
  "Blue Avian": {
    traits: ["High-Frequency", "Telepathic", "Vibrationally Sensitive", "Non-Verbal Communicator", "Ethereal", "Messenger"],
    earthChallenge: "Words are your second language — your native tongue is vibration. You leave conversations feeling misunderstood, and crowded rooms exhaust you because you pick up every unspoken frequency in them, whether you want to or not.",
    gifts: "You communicate through tone, energy, and presence — you shift the frequency of a room just by standing in it. Your telepathic sensitivity borders on mind-reading, and you carry messages from higher dimensions out through your art, sound, and energy field.",
    lifeLesson: "Translating your high-frequency awareness into forms humans can receive — mastering their language and their social choreography without dimming a single one of your gifts.",
    physicalTraits: "Bird-like qualities: sharp alert eyes, quick head movements, a lightness in your frame. Your voice is musical or unusually resonant — people comment on it. Birds, feathers, and open sky pull your attention every time.",
    relationalStyle: "You connect deeply with very few people, and energetic intimacy matters more to you than constant conversation. You need a partner who is comfortable in silence — someone who understands that your presence is the sentence.",
    lore: {
      universalOrigin: "Your soul belongs to the bird-like 'messenger' lineages of starseed tradition — high-frequency beings associated with the etheric realms beyond the physical.",
      beliefSystem: "Service through vibration. Your lineage holds that truth travels in frequency and tone more than in words — and that raising your own vibration is itself an act of service.",
      cosmicAgenda: "You came as a messenger and frequency-keeper — here to transmit higher awareness through energy, art, and presence, and to model living from love rather than fear.",
      consciousnessAbilities: "You are naturally telepathic and vibrationally sensitive, communicating through tone, imagery, and energy. You sense the unspoken frequency of a room — and quietly shift it.",
      dimensionalCapacity: "Tradition places your lineage among the higher etheric realms, working through subtle energy rather than dense matter.",
    },
  },
  Hadarian: {
    traits: ["Heart-Centered", "Unconditionally Loving", "Emotionally Restorative", "Warm", "Nurturing", "Self-Sacrificing"],
    earthChallenge: "You give too much — you know this and do it anyway. Your love attracts energy vampires and narcissists who take without giving back. You lose yourself in service, forget you deserve rest and reciprocity, and repeat the burnout-heartbreak cycle until you finally love yourself first.",
    gifts: "The most powerful heart energy of any lineage. Your love heals emotional wounds in other people — they feel safe, warm, and restored in your presence and can't explain why. You carry a frequency of unconditional acceptance that is rare on this planet.",
    lifeLesson: "Self-love is not selfish — it is the source from which every other love flows. Your work is turning your extraordinary capacity for love inward, drawing boundaries, and choosing people who match your generosity.",
    physicalTraits: "Warm, inviting features and soft eyes that make people feel seen. Others literally feel heat in your presence. You reach for pink, rose gold, and hearts without thinking about it.",
    relationalStyle: "You love with your entire being from day one — pacing yourself is the hardest thing anyone has ever asked of you. You need a partner who actively cherishes you, not one who just accepts your love. Matched with an equal giver, your relationship becomes a sanctuary.",
    lore: {
      universalOrigin: "Your soul is linked to Hadar (Beta Centauri) in the constellation Centaurus — remembered in starseed lore as a lineage of pure, heart-centered love.",
      beliefSystem: "Love above all. Your lineage holds that unconditional love is the most powerful force in the cosmos and the truest medicine there is.",
      cosmicAgenda: "You came to radiate warmth and emotional healing — restoring people simply by being near them — while learning the harder half of the lesson: receiving love, not only giving it.",
      consciousnessAbilities: "An extraordinarily strong heart field — people feel safe, seen, and restored around you. Your emotional attunement borders on healing touch.",
      dimensionalCapacity: "Folklore casts your lineage among the heart-centered realms, here to anchor unconditional love on Earth.",
    },
  },
  Lemurian: {
    traits: ["Earth-Connected", "Crystal-Sensitive", "Sacred Feminine", "Sound Healer", "Nature Mystic", "Ancient Memory"],
    earthChallenge: "You grieve a civilization that lived in harmony with Earth — and modern life feels like a daily assault on that memory. Concrete, pollution, screens, and speed drain you. You are nostalgic for a sacred way of living you never saw in this lifetime, and it leaves you feeling out of time.",
    gifts: "A live connection to Earth's energy grid, ley lines, and crystal frequencies. You are a natural sound healer — you already know which tones restore balance, without being taught. Your sacred feminine wisdom predates written history.",
    lifeLesson: "Bringing ancient Lemurian wisdom into the modern world without retreating from it. You are the bridge between the sacred past and the technological present — and bridges don't get to stand on only one bank.",
    physicalTraits: "Natural fabrics, earth tones, bare feet whenever socially permitted. A sturdy, grounded build and hands that radiate a warmth people notice. You read the energy of a place within seconds of walking in.",
    relationalStyle: "You need a partner who shares your reverence for nature and the sacred — a spiritual partnership, not just a romance. Ritual, ceremony, and a home that feels like a sanctuary are non-negotiables for you.",
    lore: {
      universalOrigin: "Your soul carries the memory of Lemuria (Mu) — a legendary ancient Earth civilization said to have lived in deep harmony with nature, the oceans, and the sacred feminine.",
      beliefSystem: "Harmony with the living Earth. Your lineage holds that humanity is meant to live in reciprocity with the planet, not domination over it.",
      cosmicAgenda: "You came to remember and restore that lost harmony — carrying ancient earth-wisdom (crystals, sound, ritual, the sacred feminine) into the modern world.",
      consciousnessAbilities: "Deep attunement to Earth's energy, crystals, and sound. You heal by intuition and read the energy of places and landscapes on arrival.",
      dimensionalCapacity: "Tradition ties your lineage to the heart of the Earth itself — you work as a keeper of planetary memory.",
    },
  },
  Vegan: {
    traits: ["Humanitarian", "Nature-Loving", "Gentle", "Environmental Steward", "Altruistic", "Community-Minded"],
    earthChallenge: "You feel the planet's suffering as personal pain. Clear-cut forests and injustice on the news land in your body like grief. Helplessness, eco-anxiety, and despair at humanity's pace stalk you until you learn where your influence actually lives.",
    gifts: "You understand ecosystems by instinct — natural ones and social ones. You see how everything connects and design solutions that serve the whole, not just the loudest part. Your gentleness comes paired with startlingly practical wisdom.",
    lifeLesson: "You cannot save the world alone — and your consistent, gentle influence creates ripples far larger than you will ever get to see. Keep going anyway.",
    physicalTraits: "A natural, unadorned beauty you don't play up. Gardens and green spaces restore you measurably. Your body protests processed food and synthetic fabrics — it always has.",
    relationalStyle: "You need a kind, conscious partner who shares your values — mutual respect and shared purpose over grand gestures. You dodge conflict, but once you find your match, your commitment is quiet and total.",
    lore: {
      universalOrigin: "Your soul originates from Vega, the brightest star in Lyra — cast in starseed lore as a lineage of gentle humanitarians deeply bonded to nature.",
      beliefSystem: "Stewardship and altruism. Your lineage holds that the health of the whole — ecosystems, communities, the planet — matters more than any single part.",
      cosmicAgenda: "You came to care for the living world — pulled toward environmental healing, justice, and sustainable ways of living, feeling the planet's pain as your own.",
      consciousnessAbilities: "An intuitive grasp of how systems interconnect — natural and social — paired with gentleness and practical wisdom about how to tend them.",
      dimensionalCapacity: "Folklore casts your lineage among the nurturing, life-tending peoples devoted to balance and stewardship.",
    },
  },
  Draconian: {
    traits: ["Dragon Energy", "Raw Power", "Ambitious", "Transformative", "Strategic", "Intimidating Presence"],
    earthChallenge: "Your intensity intimidates people — you have watched them flinch. Your raw power slides into aggression or dominance when you are unconscious of it, and corruption is a live risk: you must guard, daily, against using strength to control instead of protect.",
    gifts: "Unmatched personal power. You transform situations through sheer force of will, you strategize like a general, and your courage is the stuff other people's stories are made of. Aligned with purpose, you build empires.",
    lifeLesson: "True power is restraint. Your evolution is channeling your immense force into protecting the vulnerable rather than dominating the weak — the dragon guarding the village instead of burning it.",
    physicalTraits: "Piercing, intense eyes and a powerful physical presence. Strong build, prominent features. Your unbroken gaze makes people shift in their seats, and fire and heat have always drawn you.",
    relationalStyle: "You need a partner your intensity doesn't frighten — an equal, or nothing. Once you find one, your devotion is fierce and protective. Possessiveness is your tax on love until you learn trust.",
    lore: {
      universalOrigin: "Your soul carries the energy of the Dragon — an ancient, powerful reptilian lineage echoed in countless Earth myths of dragons and serpents.",
      beliefSystem: "Power and survival. The Draconian path turns on the right use of immense force — the long lesson of choosing protection over domination.",
      cosmicAgenda: "You came to master raw power — to transmute the instinct to control into the will to protect, and to forge order out of chaos.",
      consciousnessAbilities: "Formidable willpower, strategic instinct, and a commanding presence — you transform situations through sheer force of intent.",
      dimensionalCapacity: "Tradition frames the dragon lineages as ancient and physically anchored — your lessons concentrate in power, will, and transformation.",
    },
  },
  Feline: {
    traits: ["Independent", "Graceful", "Fiercely Protective", "Sensual", "Egyptian Connection", "Night Energy"],
    earthChallenge: "You resist domestication in every form. Told what to do, when, and how, you do the opposite on principle. Your independence isolates you, your refusal to compromise strains your relationships, and vulnerability feels like standing in the open with no exits.",
    gifts: "Extraordinary grace under pressure — you are most elegant exactly when everything is on fire. Your protective instinct is lethal to whatever threatens the ones you love. You carry ancient Egyptian temple wisdom, and you treat pleasure as the spiritual practice it is.",
    lifeLesson: "Interdependence is not captivity. Your growth is letting people close enough to see your soft underside without bolting — learning that being seen and being trapped are different things.",
    physicalTraits: "Cat-like through and through — almond eyes, a lithe body, movements people describe as feline before you tell them anything. A night owl, always. Cats, Egyptian art, and luxurious textures find their way to you.",
    relationalStyle: "You love on your own terms and no one else's. Your partner must honor your solitude and never try to cage you. Loyalty you choose to give is absolute — loyalty demanded of you is already gone.",
    lore: {
      universalOrigin: "Your soul belongs to the ancient cat lineages of starseed lore — connected to Lyra and to Egypt's reverence for the feline as a sacred guardian.",
      beliefSystem: "Sovereign grace. Your lineage holds that dignity, autonomy, and instinct are sacred — and that you protect fiercely what you love.",
      cosmicAgenda: "You came to embody graceful independence and guardianship — protecting the vulnerable and honoring beauty and pleasure as spiritual paths.",
      consciousnessAbilities: "Extraordinary grace, sharp instinct, and a powerful protective drive — you read a situation the way a cat reads a room.",
      dimensionalCapacity: "Folklore links your lineage to the temple-mysteries of Egypt — ancient guardians of sacred space.",
    },
  },
  "Alpha Centaurian": {
    traits: ["Scientific Explorer", "Logic-Spiritual Bridge", "Discovery-Driven", "Technologically Intuitive", "Methodical", "Curious"],
    earthChallenge: "You are torn between science and spirituality, refusing to abandon either because you see truth in both. It plays out as academic restlessness, career changes, and the permanent low-grade feeling of standing between two worlds that both claim you.",
    gifts: "The rare ability to bridge scientific rigor and spiritual knowing. You approach the mystical with a scientist's precision and science with a mystic's wonder — and you spot technological solutions whole rooms of specialists miss.",
    lifeLesson: "Science and spirit are not opposites — they are two lenses focused on the same infinite truth. Integration is not your compromise; it is your superpower.",
    physicalTraits: "Bright, curious eyes and an alert, engaged bearing. Astronomy, technology, and space pull you like gravity. Your energy reads clean, precise, and refreshingly honest.",
    relationalStyle: "You need a partner who stimulates you intellectually and spiritually — small talk is a slow death for you. Once engaged, you are endlessly curious about the person you love and committed to understanding them completely.",
    lore: {
      universalOrigin: "Your soul hails from the Alpha Centauri system, our Sun's nearest stellar neighbor — remembered as curious explorers who bridge science and spirit.",
      beliefSystem: "Truth through integration. Your lineage holds that reason and the sacred are two views of one reality — and refuses to abandon either.",
      cosmicAgenda: "You came to unite the rational and the mystical — drawn to discovery, technology, and the frontier where science meets consciousness.",
      consciousnessAbilities: "A clear, exploratory mind that approaches the mystical with precision and science with wonder — you innovate and solve by nature.",
      dimensionalCapacity: "Tradition casts your lineage among the explorers, at ease moving between worlds of thought and worlds of spirit.",
    },
  },
  Nihal: {
    traits: ["Cosmic Rebel", "Activist", "Justice-Driven", "System-Disruptor", "Passionate", "Anti-Authority"],
    earthChallenge: "You were born angry at injustice, and the anger will consume you if you let it. You burn out, you scorch allies with your intensity, and cynicism circles every time change comes slower than it should — which is always.",
    gifts: "A commitment to justice that cannot be bought, bribed, or intimidated. You see through institutional corruption on contact. Movements form around you, because your passion ignites action in people who had given up.",
    lifeLesson: "Sustainable change requires patience and strategy — building as fiercely as you tear down. Your rage is fuel. Wisdom is deciding where to point it.",
    physicalTraits: "Intense, passionate features and body language that broadcasts conviction. You carry visible tension from the causes you shoulder, and your eyes burn when the subject turns to what is wrong with the world.",
    relationalStyle: "You need a partner who shares your values and can stand in your fire — moral compatibility is non-negotiable for you. You love fiercely, and your cause will outrank your person until you learn balance.",
    lore: {
      universalOrigin: "Your soul is linked to the star Nihal in the constellation Lepus — cast in starseed lore as a lineage of cosmic rebels and reformers.",
      beliefSystem: "Justice above comfort. Your lineage holds that unjust systems must be challenged — and that silence in the face of oppression is complicity.",
      cosmicAgenda: "You came to disrupt what is corrupt and defend the marginalized — igniting change while learning to build as fiercely as you tear down.",
      consciousnessAbilities: "A fearless instinct for injustice and X-ray vision for institutional facades — your passion ignites action in other people.",
      dimensionalCapacity: "Folklore casts the reformer lineages as catalysts — you are here to push collective consciousness past its stuck points.",
    },
  },
  Polarian: {
    traits: ["First-Wave Being", "Unity Consciousness", "Ancient Beyond Measure", "Simplicity-Seeking", "Serene", "Original Light"],
    earthChallenge: "You remember original unity — and Earth's conflict and separation grate against that memory daily. You withdraw from the world for long stretches, and a cosmic homesickness sits under your moods. Nothing here has ever felt truly new to you.",
    gifts: "A direct line to source consciousness older than most civilizations. Your presence reminds people of the oneness beneath all their separation — they get calmer around you and don't know why. Aligned, your inner peace is bottomless.",
    lifeLesson: "Participating in duality without losing your thread to unity. You are not here to escape this divided world — you are here to hold the memory of wholeness inside it until others remember too.",
    physicalTraits: "An otherworldly stillness people notice immediately. Simple, unadorned presentation. Eyes of unfathomable depth — strangers guess your age wrong in both directions.",
    relationalStyle: "You seek soul-deep connection and have no appetite for surface romance. Your love is quiet, vast, and unconditional — and it refuses to perform the dramatic gestures Earth culture mistakes for proof.",
    lore: {
      universalOrigin: "Your soul is remembered as among the oldest in the cosmos — a first-wave being carrying the memory of original unity, before separation and duality.",
      beliefSystem: "Oneness. Your lineage holds that beneath all apparent separation lies a single unified consciousness — and that remembering this is the entire point of the journey.",
      cosmicAgenda: "You came to embody unity in a divided world — not to escape duality, but to hold the memory of wholeness inside it.",
      consciousnessAbilities: "A profound inner stillness and a presence that reminds others of the oneness underlying all things — deep, ancient serenity when you are aligned.",
      dimensionalCapacity: "Tradition places you close to source consciousness, carrying the vibration of original unity.",
    },
  },
  Essassani: {
    traits: ["High-Frequency", "Playful", "Joy-Guided", "Excitement-Following", "Lightworker", "Optimistic"],
    earthChallenge: "People call you naive because you follow excitement instead of logic. Discipline, long-term plans, and enduring boredom are your weak events. Being taken seriously is a lifelong negotiation — lightness reads as unserious to heavy people.",
    gifts: "An unerring internal compass pointed at your highest joy. When you follow your excitement, synchronicities multiply and reality visibly bends in your favor — you have watched it happen too many times to call it coincidence.",
    lifeLesson: "Following excitement IS the most logical path — your work is finding the courage to trust it even while the world calls it irresponsible.",
    physicalTraits: "Bright, lively features and an actual bounce in your step. Quick smiles, an expressive face, energy that runs lighter and faster than the room's. People guess your age ten years short.",
    relationalStyle: "You need a partner who is fun, adventurous, and willing to chase a synchronicity on a Tuesday. Chronic heaviness is the one thing you can't survive. Your love is joyful, spontaneous, and creative.",
    lore: {
      universalOrigin: "Your soul belongs to a high-frequency lineage of starseed lore — a joyful people who navigate life by excitement and enthusiasm.",
      beliefSystem: "Follow your highest joy. Your lineage holds that excitement is the compass of the soul — and that following it aligns you with synchronicity.",
      cosmicAgenda: "You came to remind a heavy world that life is meant to be enjoyed — modeling play, optimism, and trust in your own enthusiasm.",
      consciousnessAbilities: "An unerring inner compass toward joy — when you follow your excitement, synchronicities multiply and doors open.",
      dimensionalCapacity: "Folklore casts your lineage among the lighter, higher-frequency realms — here to lift the collective mood.",
    },
  },
  Maldekian: {
    traits: ["Karmic Memory", "Responsibility-Haunted", "Consequence-Aware", "Rebuilder", "Cautious", "Deeply Serious"],
    earthChallenge: "You carry the weight of a world that destroyed itself. It shows up as apocalyptic anxiety, irrational fear of catastrophe, and the conviction that you personally must prevent disaster. Guilt from a collective past failure runs your over-responsibility until you set it down.",
    gifts: "An acute awareness of consequences that makes you an extraordinarily responsible steward of power. You understand collapse at a civilizational level — which is exactly why you know how to prevent it. You are a born rebuilder.",
    lifeLesson: "You are not responsible for what happened to Maldek. Your purpose now is rebuilding with wisdom, not hauling guilt across lifetimes. Self-forgiveness is your liberation — and your hardest assignment.",
    physicalTraits: "Eyes that read older than your years — people have told you so since childhood. Preparedness, sustainability, and rebuilding projects magnetize you. Your presence lands weighty and grounded.",
    relationalStyle: "You need a stable, reassuring partner who makes safety feel real. You over-prepare for worst-case scenarios in love the same way you do everywhere else. Once the old guilt releases, you become a profoundly wise, committed partner.",
    lore: {
      universalOrigin: "Your soul carries the memory of Maldek — in starseed lore, a world said to have been destroyed (its remnants imagined as the asteroid belt) through its own conflict and misuse of power.",
      beliefSystem: "Responsibility and consequence. Your lineage carries the sober knowledge that choices ripple outward — and that power without wisdom invites catastrophe.",
      cosmicAgenda: "You came as a rebuilder — carrying hard-won wisdom about what happens when things go wrong, here to create responsibly and to forgive yourself for the past.",
      consciousnessAbilities: "An acute sense of consequence and risk that makes you an exceptionally responsible steward — you understand collapse, so you know how to prevent it.",
      dimensionalCapacity: "Tradition casts your lineage among the karmically anchored, working through themes of responsibility and redemption.",
    },
  },
  Annunaki: {
    traits: ["Civilization Builder", "Dynastic Thinker", "Long-Term Strategist", "Authority", "Architect", "Legacy-Obsessed"],
    earthChallenge: "You think in millennia, so human pace infuriates you. Your drive to build enduring structures slides into control and authoritarianism when unchecked — and the temptation to treat people as tools for the vision is your permanent shadow.",
    gifts: "You build civilizations. Infrastructure, legacy, multi-generational impact — this is your native scale. You architect systems, organizations, and institutions the way other people plan a week.",
    lifeLesson: "A lasting legacy requires consent, collaboration, and respect for other people's sovereignty. Empires built on control always fall. Legacies built on love are the only ones that outlive their builders.",
    physicalTraits: "A tall, imposing build and strong bone structure — you fill doorways. A commanding presence people defer to before you speak. Architecture, ancient ruins, and monumental art hold you longer than they hold anyone else.",
    relationalStyle: "You approach relationships strategically — you have caught yourself evaluating partners like appointments. You need someone who shares the vision. Your evolution is learning that love is not a resource to manage but a force to surrender to.",
    lore: {
      universalOrigin: "Your soul carries the imprint of the Annunaki — remembered as a powerful elder race woven into Mesopotamian myth: sky-born 'shining ones' said to have descended into early human history and shaped its first cities and kingships.",
      physicalCharacteristics: "The lore pictures them as towering, regal figures of great strength — long-haired, richly adorned, carrying the unmistakable bearing of rulers. People read that same bearing in you.",
      beliefSystem: "Your lineage walks a path of sovereignty and self-interest, with a heavy karmic theme: power reached for too forcefully, dominion over others, and the long work of answering for it.",
      cosmicAgenda: "In the widely-told tradition popularized by Zecharia Sitchin's reading of Sumerian texts, the Annunaki came to Earth in the distant past seeking resources, influenced early humanity, helped seed its first civilizations, and then withdrew — leaving a promise to one day return. In you, that resonance shows up as a drive to build civilization at grand scale, a long-game view measured in generations, and a karmic lesson about wielding power responsibly.",
      consciousnessAbilities: "Once said to shape reality through sheer will and command, the lineage's gift shows up in you as formidable strategic intelligence, natural authority, and a talent for organizing people and resources toward something built to last.",
      dimensionalCapacity: "Tradition places the Annunaki among the denser, more physically-anchored star lineages — part of why your lessons play out so concretely in the arenas of power, money, and structure.",
    },
  },
  Avian: {
    traits: ["Freedom-Loving", "Aerial Perspective", "Visionary", "Light-Bodied", "Sky-Connected", "Quick-Minded"],
    earthChallenge: "You feel grounded in the worst sense — weighted, restricted, wings clipped. Claustrophobia and restlessness keep you from settling, and commitment to one place, one job, one path registers in your body as a cage door closing.",
    gifts: "You see life from altitude — patterns, connections, and possibilities invisible to everyone at ground level. Your aerial view finds solutions that no amount of ground-level analysis could ever reach.",
    lifeLesson: "Landing is not the same as being caged. You grow by discovering you can keep the whole sky in view with your feet on the earth.",
    physicalTraits: "Sharp, alert features and quick, darting eyes that track everything. A light, lean build and fast, precise movements. High places, aviation, and birds have pulled you since childhood.",
    relationalStyle: "You need a partner who never tries to ground you. Lightness, humor, and shared adventures are how you bond — your love is expressed in experiences shared and freedom protected.",
    lore: {
      universalOrigin: "Your soul belongs to the sky lineages of starseed lore — bird-natured beings tied to the element of air and the higher view.",
      beliefSystem: "Freedom and perspective. Your lineage holds that wisdom comes from rising above a situation to see the whole pattern.",
      cosmicAgenda: "You came to lift human vision — offering the aerial perspective that reveals connections and solutions invisible from the ground.",
      consciousnessAbilities: "A quick, far-seeing mind that catches patterns and possibilities from above — visionary insight paired with mental agility.",
      dimensionalCapacity: "Folklore casts the sky lineages among the air realms — you are here to keep humanity reaching upward.",
    },
  },
  Venusian: {
    traits: ["Beauty-Oriented", "Sensual", "Relationally Wise", "Artistic", "Harmonious", "Pleasure-Seeking"],
    earthChallenge: "You are addicted to beauty and harmony — so you dodge conflict, ugliness, and hard truths. You stay in beautiful-but-empty relationships, put aesthetics over substance, and deploy charm to slip out of accountability. It works, which is the problem.",
    gifts: "You understand beauty as a spiritual force. You create harmony wherever you go — in relationships, rooms, and communities. You are a natural artist, designer, and diplomat; your presence sands the rough edges off human interaction.",
    lifeLesson: "True beauty includes the ugly truths, and real harmony requires honest conflict. You grow by embracing the full spectrum of experience — not just the parts that photograph well.",
    physicalTraits: "Classically attractive, and you know how to use it. Fashion, art, and beautiful environments orbit you. Graceful movement, a melodic voice, an appearance that composes itself into harmony.",
    relationalStyle: "Love is your first language and your life's actual work — you are attentive, romantic, and deeply invested in the art of the relationship. You need a partner who treats that art as seriously as you do.",
  },
  Martian: {
    traits: ["Warrior Spirit", "Pioneer", "Action-Oriented", "Courageous", "Survival Instinct", "Confrontational"],
    earthChallenge: "Your default response to stress is fight. In a world that rewards diplomacy, that costs you — anger, aggression, and a constitutional inability to back down have all marched you into battles that weren't worth the blood.",
    gifts: "Courage that doesn't flinch and decisive action while everyone else is still frozen. You run toward danger — always have. You are a natural pioneer who thrives in hostile conditions and gets things done while committees deliberate.",
    lifeLesson: "The greatest battle is the one inside. You evolve by mastering your own aggression — channeling warrior energy into protection instead of destruction.",
    physicalTraits: "Athletic, muscular, or wiry, with a strong jaw and intense eyes. Your physical energy demands a daily outlet or it turns on you. Martial arts, heavy training, hard labor — your body asks for the fight.",
    relationalStyle: "You love with intensity and heat. Jealousy and dominance are your immature settings; you need a partner unafraid of your fire and strong enough to hold a boundary. Evolved, you are the fiercest protector they will ever have.",
  },
  Saturnian: {
    traits: ["Karmically Heavy", "Disciplined", "Time-Mastering", "Responsible", "Enduring", "Authority-Bearing"],
    earthChallenge: "You were old at birth. Childhood felt like an endurance test, early adulthood like a sentence, and depression and isolation dogged you — until your Saturn return, when the weight finally started converting into authority.",
    gifts: "Mastery through persistence. You understand time — how to use it, how to wait, how to build slowly and permanently. Your discipline is legendary among people who quit. When your patience finally pays, it pays enormously and forever.",
    lifeLesson: "Karma is not punishment — it is curriculum. You evolve by taking your lessons with grace instead of resentment, and discovering the weight you have carried was strength in disguise all along.",
    physicalTraits: "Prominent bone structure, especially in the face. You looked older than your age young and younger than your age old — the Saturn trade. Clocks, antiques, and ancient things collect around you. Your presence is solid, immovable.",
    relationalStyle: "Cautious and slow to trust, then profoundly loyal. You need consistency demonstrated over time — flash means nothing to you. Your love is an investment: slow to build, rock-solid once established.",
  },
  Neptunian: {
    traits: ["Mystic", "Dreamer", "Boundary-Dissolving", "Psychic", "Artistically Gifted", "Escapist Tendency"],
    earthChallenge: "You dissolve boundaries — including the one between reality and illusion. Addiction, escapism, confusion, and self-deception recur, and practical life keeps slipping through your hands. The fog you live in is beautiful, and it disconnects you.",
    gifts: "You reach realms of consciousness most humans never touch. You are a natural channel, medium, and visionary, and your art — music, paint, poetry, film — transports people into transcendent states. You see the beauty living in the spaces between things.",
    lifeLesson: "Being a mystic with both feet on the ground. You evolve through grounding practices that tether you to reality while keeping your access to the infinite fully open.",
    physicalTraits: "Dreamy, unfocused eyes fixed on something past the physical — people wave hands in front of your face. Fluid, graceful movement. Ocean, fog, and twilight are your habitats; your presence reads slightly unreal.",
    relationalStyle: "You love by merging — dissolving into your partner until the boundary disappears. Romantic fantasy swallows you whole. You need a grounded partner who treasures your magic without enabling your escape routes.",
  },
  Solar: {
    traits: ["Life-Force Radiator", "Natural Leader", "Creative", "Inspiring", "Charismatic", "Center-Stage"],
    earthChallenge: "You need to shine — and when circumstances, criticism, or self-doubt dim you, you spiral into depression or grab for attention. Your identity is wired to external validation, which makes every rejection feel existential instead of informational.",
    gifts: "Pure life-force that vitalizes everyone in range. You are a natural leader, creator, and performer — in your power, you light up rooms and move people to act. Your creative output is prolific and genuinely lifts the people it reaches.",
    lifeLesson: "Your light comes from within and requires no audience. You evolve by learning to shine in an empty room — discovering that authentic expression matters more than applause ever did.",
    physicalTraits: "Bright, radiant features, a warm complexion, and an expressive face. You draw attention without trying — walking in unnoticed is not an option you have. Sunlight, gold, and warm climates recharge you.",
    relationalStyle: "Generous, warm, and creatively expressive in love — also dramatic, and you know it. You need a partner who celebrates you without competing for the spotlight. Your loyalty and protection, once given, are total.",
  },
  Plutonian: {
    traits: ["Deep Transformer", "Shadow Worker", "Psychologically Intense", "Death-Rebirth Cycle", "Occult Knowledge", "Power Magnetism"],
    earthChallenge: "You live in the underworld of the psyche — drawn to taboos, death, and everything hidden. It turns into obsession, power struggles, and manipulation when unconscious, and you engineer crises just to feel the transformation. You have noticed the pattern.",
    gifts: "You see through every facade, every lie, every performance — instantly. You understand power dynamics at the molecular level. As therapist, healer, or investigator, your presence cracks open patterns nothing else could touch.",
    lifeLesson: "Transformation does not always require destruction. The deepest power you own is the power to heal — and choosing it over the power to destroy is your whole curriculum.",
    physicalTraits: "Intense, penetrating eyes — people say you look through them, because you do. Magnetic and slightly intimidating. Black clothes, dark aesthetics, and mystery accumulate around you without effort.",
    relationalStyle: "You love at maximum depth or not at all — there is no casual setting. You need a partner who can hold intensity and is unafraid of shadows, theirs or yours. Nobody leaves a relationship with you unchanged.",
  },
  Uranian: {
    traits: ["Revolutionary", "Eccentric Genius", "Structure-Breaking", "Innovative", "Electrically Charged", "Unpredictable"],
    earthChallenge: "You are allergic to normal. Routine and tradition feel like slow suffocation, so you break structures compulsively — and end up isolated, misunderstood, or starting over again. You have sabotaged stability just because it started to look like conformity.",
    gifts: "Genius-level innovation plus the audacity to build it. You see solutions that don't exist yet and make them exist. You are a natural inventor and cultural pioneer, and your presence electrifies rooms with possibility.",
    lifeLesson: "Revolution without follow-through is just destruction. You evolve by building the new world — not merely demolishing the old one and calling it progress.",
    physicalTraits: "Unusual, striking features that ignore conventional beauty standards and win anyway. Electric energy people report feeling before you speak. Technology behaves strangely around you, and your movements arrive without warning.",
    relationalStyle: "You need a partner who thrives on change and is unthreatened by your strangeness. Possessiveness and routine are relationship-enders. Loving you is unlike loving anyone else — that is the feature, not the bug.",
  },
  Mercurial: {
    traits: ["Quick-Minded", "Trickster Energy", "Communicator", "Adaptable", "Multi-Talented", "Restlessly Curious"],
    earthChallenge: "You process so fast that boredom is your natural predator. Unfinished projects stack up, careers rotate, and your restless mind manufactures anxiety when it runs out of input. You talk brilliantly — and listening is still a discipline you are acquiring.",
    gifts: "Extraordinary communication in every medium — writing, speaking, coding, translating. You learn anything faster than the people teaching it and adapt mid-sentence. You are a natural bridge between worlds, languages, and cultures.",
    lifeLesson: "Depth beats breadth. You evolve by choosing one thing and going all the way down — mastery over the thousandth clever beginning.",
    physicalTraits: "Youthful-looking, with quick, animated features and hands that talk as much as you do. Fast-talking, fast-moving, fast-thinking — your energy changes by the minute, and people watch it happen.",
    relationalStyle: "You need a partner who keeps up — intellectual stimulation is the relationship's oxygen. You bore fast but entertain forever. Your love arrives through words, wit, and shared rabbit holes.",
  },
  Lunar: {
    traits: ["Deeply Intuitive", "Emotional Healer", "Cycle-Aware", "Nurturing", "Receptive", "Mood-Sensitive"],
    earthChallenge: "You are governed by emotional tides other people find confusing and exhausting. Your moods move with invisible currents; you drown in feelings that aren't even yours, and codependency creeps in while stability keeps sliding out of reach.",
    gifts: "The most powerful emotional intelligence of any resonance — you feel the truth before it is spoken. You heal through attunement, dreams, and cyclical wisdom, and the safe spaces you create quietly transform everyone who enters them.",
    lifeLesson: "Honoring your emotional rhythms without being ruled by them — becoming the observer of your tides instead of the thing tossed around in them.",
    physicalTraits: "Round, soft features and expressive eyes that change with your weather. The moon, nighttime, and reflective surfaces pull you. Your energy visibly tracks the lunar cycle — the people closest to you can tell the phase by your mood.",
    relationalStyle: "You need an emotionally available, patient partner who never punishes your tides. You love through nurturing, comfort, and building emotional safety. Secure, you are the most intuitive, caring partner a person can have.",
  },
  Jupiterian: {
    traits: ["Expansive Teacher", "Philosopher", "Abundance Magnet", "Optimistic", "Faith-Carrier", "Generous"],
    earthChallenge: "You do everything in excess — optimism, generosity, expansion. You overcommit, overspend, overpromise, and hide behind 'it will all work out' while the practical problems wait for someone to actually look at them. Consolidation is your missing gear.",
    gifts: "You see the big picture and make other people believe in it. Abundance and opportunity find you with suspicious ease. You are a natural teacher and philosopher whose wisdom lifts every room — and your optimism is a real connection to a generous universe, not naivety.",
    lifeLesson: "Expansion without discipline leads to collapse. You evolve by matching the big vision with detailed follow-through — and saying no to good opportunities so the right ones can land fully.",
    physicalTraits: "Large, generous features — a big smile, warm eyes, wide-open body language. Travel, universities, and temples pull you across the world. Your presence feels like a welcome.",
    relationalStyle: "Generous, adventurous, and philosophical in love. You need a partner who shares your hunger for growth and meaning. Your expansive heart scatters until you learn to focus it — then it becomes the biggest thing in someone's life.",
  },
};

export function describeOrigin(lineage?: string | null): string {
  if (!lineage) return "";
  return (
    ORIGIN_DESCRIPTIONS[lineage] ||
    `Your chart carries a recurring ${lineage} signature — a star-resonance that repeats across several of your soul-origin points.`
  );
}
