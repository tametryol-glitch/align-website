// Content/interpretation layer for the Soul Origin (deterministic /origin)
// reading on web. These mirror the mobile app's lineage descriptions for the
// seven star families the fingerprint engine maps to a named lineage
// (sirius→Sirian, pleiades→Pleiadian, arcturus→Arcturian, lyra→Lyran,
// orion→Orion, andromeda→Andromedan, mintaka→Mintakan). Families with no named
// lineage (Regulus, Spica, Galactic Center, …) fall back to a neutral line.

export const ORIGIN_DESCRIPTIONS: Record<string, string> = {
  Pleiadian: "Pleiadian souls carry a deep sensitivity, artistic vision, and longing for harmony. They often feel a magnetic pull toward healing, music, and unconditional love. Emotional empathy is their hallmark, sometimes to the point of absorbing others' pain.",
  Sirian: 'Sirian souls are natural guardians and protectors. They resonate with water, the moon, and ancestral memory. Loyalty runs in their blood; they build structures that endure and defend those they love with fierce devotion.',
  Arcturian: 'Arcturian souls incarnate as system architects, visionaries, and consciousness engineers. They are drawn to innovation, pattern recognition, and strategic mastery — they see the architecture behind reality.',
  Orion: 'Orion souls carry the imprint of intellectual mastery and karmic discipline. They are drawn to logic, precision, and accountability. Past-life echoes of power struggles may surface as a drive to prove themselves or master their environment.',
  Andromedan: 'Andromedan souls are cosmic wanderers who resist confinement. They crave freedom, exploration, and spiritual expansion. They often feel too big for any single identity, culture, or belief system.',
  Lyran: 'Lyran souls carry the oldest starlight — the memory of the first cosmic civilizations. They are natural leaders with feline grace, creative fire, and a deep sense of independence.',
  Mintakan: 'Mintakan souls carry an ache of oceanic homesickness — a longing for a world of crystalline purity that no longer exists. They are gentle, compassionate, and deeply sensitive.',
};

export interface OriginChar {
  traits: string[];
  gifts: string;
  earthChallenge: string;
  lifeLesson: string;
  physicalTraits: string;
  relationalStyle: string;
}

export const ORIGIN_CHARACTERISTICS: Record<string, OriginChar> = {
  Pleiadian: {
    traits: ['Deeply Empathic', 'Artistic', 'Healing-Oriented', 'Peace-Seeking'],
    gifts: 'Unconditional love that can shift the emotional atmosphere of a room. Natural healers — their presence alone can calm nervous systems. Extraordinary artistic sensitivity and psychic empathy.',
    earthChallenge: 'Pleiadian souls often struggle with boundaries, absorbing the emotions of everyone around them. They may people-please compulsively or stay in toxic relationships too long until they learn energetic hygiene.',
    lifeLesson: 'Learning that compassion does not require self-sacrifice. Their growth comes from realizing that protecting their own energy is the prerequisite for sustainable service.',
    physicalTraits: 'Soft, gentle features; unusually kind eyes; drawn to water; finely tuned, sensitive bodies.',
    relationalStyle: 'Love deeply and completely, merging at a soul level. Once healed, they become devoted, intuitive, transformative partners.',
  },
  Sirian: {
    traits: ['Fiercely Loyal', 'Protective', 'Water-Connected', 'Guardian Energy'],
    gifts: 'Unshakable loyalty and deep ancestral wisdom. Natural affinity with water and the moon. They build things that last: relationships, organizations, legacies.',
    earthChallenge: 'A weight of ancestral responsibility that can feel crushing. Hypervigilance leads to chronic stress and difficulty accepting help.',
    lifeLesson: 'Learning that they do not have to carry everything alone. Their deepest growth comes from vulnerability and allowing others to protect them.',
    physicalTraits: 'Strong, grounded builds; eyes with ancient knowing; drawn to moonlit water and canine energy.',
    relationalStyle: 'Once they commit, they commit forever — the partner who never leaves and never stops fighting for the relationship.',
  },
  Arcturian: {
    traits: ['Systems Thinker', 'Visionary', 'Pattern-Obsessed', 'Future-Oriented'],
    gifts: 'Genius-level pattern recognition. Natural innovators and strategists who can redesign entire systems from scratch.',
    earthChallenge: 'Frustration with human inefficiency can lead to isolation or emotional shutdown. They may intellectualize feelings instead of feeling them.',
    lifeLesson: 'Learning that intelligence without heart is incomplete — descending from the mind into the body, from strategy into feeling.',
    physicalTraits: 'Angular, distinctive features; high foreheads; analytical eyes; an unusual rapport with technology.',
    relationalStyle: 'Love through problem-solving and acts of service. When they finally open their heart, the depth of their love is staggering.',
  },
  Orion: {
    traits: ['Intellectually Rigorous', 'Disciplined', 'Analytical', 'Achievement-Driven'],
    gifts: 'Razor-sharp intellect and extraordinary discipline. Natural authority and strategic thinking that sees ten moves ahead.',
    earthChallenge: 'Past-life karma around power and control. Perfectionism, workaholism, and a fear of vulnerability are common shadow patterns.',
    lifeLesson: 'Learning that power without compassion creates the very karma they came to resolve. True mastery includes humility.',
    physicalTraits: 'Sharp, intense eyes; commanding presence; controlled, deliberate body language.',
    relationalStyle: 'Approach relationships with rigor; need intellectual equals. Once they integrate openness, they are deeply respectful, stable partners.',
  },
  Andromedan: {
    traits: ['Freedom-Seeking', 'Spiritually Expansive', 'Philosophical', 'Boundary-Resistant'],
    gifts: 'A consciousness that spans galaxies. Natural philosophers and spiritual teachers who carry the vibration of infinite possibility.',
    earthChallenge: 'Feeling imprisoned by routine and structure. They may sabotage good situations simply because they feel trapped.',
    lifeLesson: 'Learning that true freedom is the ability to be fully present wherever you are. Depth, not breadth, is where liberation lives.',
    physicalTraits: 'Often tall or lanky; eyes that look past you into another dimension; restless, mobile energy.',
    relationalStyle: 'Love intensely but struggle with permanence. They need partners who give them room to explore without taking it personally.',
  },
  Lyran: {
    traits: ['Natural Leader', 'Creatively Fierce', 'Independent', 'Ancient Wisdom'],
    gifts: 'The creative fire of the original creators. Natural royalty, extraordinary independence, and the courage to go first into unknown territory.',
    earthChallenge: 'The weight of primacy can become arrogance or an inability to follow anyone else. Loneliness at the top is a recurring theme.',
    lifeLesson: 'Learning that true leadership means lifting others up — moving from sovereignty to service, from isolation to community.',
    physicalTraits: 'Cat-like features; almond eyes; graceful movements; a presence that commands attention without effort.',
    relationalStyle: 'Need partners who respect their independence completely. Once they choose you, their loyalty is absolute — given freely, never demanded.',
  },
  Mintakan: {
    traits: ['Pure-Hearted', 'Crystalline Sensitivity', 'Gentle', 'Water-Drawn'],
    gifts: 'A purity of heart almost impossible to corrupt. Emotional clarity that cuts through deception, and a gentleness that transforms through softness.',
    earthChallenge: 'The deepest homesickness of any lineage — their origin world no longer exists. Earth can feel too rough, too harsh, too loud.',
    lifeLesson: 'Learning to make Earth their home — transforming grief into gratitude and homesickness into the creation of beauty.',
    physicalTraits: 'Large, luminous, dreamy eyes; delicate features; drawn to water in all forms; unusually sensitive skin.',
    relationalStyle: 'Love with a tenderness that can bring people to tears. When they feel safe, they open into devotionally beautiful partners.',
  },
};

export function describeOrigin(lineage?: string | null): string {
  if (!lineage) return '';
  return (
    ORIGIN_DESCRIPTIONS[lineage] ||
    `Your chart carries a recurring ${lineage} signature — a star-resonance that repeats across several of your soul-origin points.`
  );
}
