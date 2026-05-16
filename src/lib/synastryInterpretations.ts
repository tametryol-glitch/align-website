const translateText = (s: string) => s;

export interface SynastryAspectInterpretation {
  interpretation: string;
}

const PLANET_MEANINGS: Record<string, string> = {
  Sun: 'core identity and life purpose',
  Moon: 'emotional needs and instinctive responses',
  Mercury: 'communication style and mental connection',
  Venus: 'love language, values, and attraction',
  Mars: 'desire, drive, and how passion is expressed',
  Jupiter: 'growth, generosity, and shared vision',
  Saturn: 'commitment, boundaries, and long-term stability',
  Uranus: 'excitement, independence, and unconventionality',
  Neptune: 'spiritual connection, idealism, and fantasy',
  Pluto: 'power dynamics, transformation, and deep bonding',
  'North Node': 'karmic growth direction and destiny',
  'South Node': 'past-life familiarity and comfort zones',
  Chiron: 'healing, vulnerability, and emotional wounds',
  Ascendant: 'first impressions and outward persona',
  MC: 'public life, career, and shared ambitions',
  Vesta: 'devotion, sacred focus, and shared purpose',
  Juno: 'commitment style and partnership expectations',
};

const ASPECT_QUALITIES: Record<string, { quality: string; shadow: string }> = {
  Conjunction: { quality: 'intensifies and merges', shadow: 'can overwhelm or blur boundaries' },
  Trine: { quality: 'flows naturally and supports', shadow: 'can lead to complacency or taking each other for granted' },
  Sextile: { quality: 'creates opportunity and gentle support', shadow: 'may not feel strong enough to sustain without effort' },
  Square: { quality: 'creates friction that drives growth', shadow: 'can produce repeated conflict if not addressed consciously' },
  Opposition: { quality: 'creates magnetic attraction through polarity', shadow: 'can feel like a tug-of-war if neither person compromises' },
  Quincunx: { quality: 'creates an awkward adjustment between two energies', shadow: 'can leave both people feeling slightly misunderstood' },
};

const PLANET_SYNASTRY_THEMES: Record<string, { hard: string; soft: string }> = {
  'Sun-Moon': {
    hard: 'Your core identity clashes with their emotional needs. They may feel unseen or unvalidated by the way you express yourself, while you may feel emotionally smothered or confused by their reactions. The work here is learning that identity and emotional security are both valid needs. Neither person is wrong — you simply need different things from the same moments. Practice asking "what do you need right now?" instead of assuming. This tension, when navigated with patience, builds a relationship where both people feel genuinely known rather than just tolerated.',
    soft: 'Your identity naturally nourishes their emotional world, and their emotional responsiveness makes you feel truly seen. There is an instinctive understanding here — you "get" each other on a fundamental level. The risk is assuming this understanding will always be effortless. Over time, you may stop checking in because things feel so natural, and small disconnects can accumulate silently. Keep actively expressing appreciation. This is a genuine gift — protect it by never taking it for granted.',
  },
  'Sun-Sun': {
    hard: 'Two strong egos are at play. You may compete for attention, try to outshine each other, or struggle over who gets to lead. This is not inherently destructive — it means both of you have a strong sense of self. The challenge is making room for two bright lights without dimming either one. Take turns leading. Celebrate each other publicly. The growth comes from learning that another person shining does not diminish your own light.',
    soft: 'Your identities reinforce each other. You likely share core values or life goals, and being together makes both of you feel more like yourselves. The shadow here is that you may avoid challenging each other because agreement feels so good. Healthy relationships need occasional friction. Do not mistake comfort for completeness — keep growing individually so you bring fresh energy back to the partnership.',
  },
  'Sun-Venus': {
    hard: 'What you value and how you express love may be at odds with who they are at their core. They might feel like you do not appreciate them, or you might feel that their affection comes with conditions that conflict with your authentic self. The path forward is learning to love someone whose values differ from yours without trying to change them. Ask yourself whether you are rejecting their love language or genuinely incompatible — the answer matters.',
    soft: 'There is a natural warmth between you. They find you genuinely attractive and enjoyable to be around, and you feel valued and admired in their presence. This is one of the classic indicators of romantic chemistry. The risk is superficiality — enjoying each other so much that you avoid the deeper, harder conversations. Use this natural affection as a foundation for real vulnerability, not a substitute for it.',
  },
  'Sun-Mars': {
    hard: 'There is an aggressive quality to the way your identities interact. Arguments can escalate quickly because both people feel their sense of self is being challenged. Physical attraction may be intense but tinged with competitiveness. The key is to channel this energy into shared action — exercise together, build something together, compete playfully rather than destructively. If you can learn to fight fair, this aspect produces an incredibly dynamic and alive relationship.',
    soft: 'You energize each other. Their drive and ambition fuel your confidence, and your identity gives their energy a meaningful direction. Physical chemistry is often strong and easy. The shadow is that you may enable each other into overdoing it — working too hard, pushing too fast, burning out. Remember to rest together, not just act together. Stillness is not weakness.',
  },
  'Sun-Jupiter': {
    hard: 'One person may feel the other is excessive, preachy, or unrealistic. There can be a pattern where optimism is used to dismiss real concerns, or where big visions clash with practical identity. The growth comes from learning to expand without losing your center. Not every opportunity is right for you, and not every dream needs to be shared.',
    soft: 'A generous, uplifting aspect in synastry. You make each other feel hopeful, expansive, and capable of more. Being together genuinely improves your outlook on life. The risk is inflation — believing the relationship is exempt from the usual difficulties. Stay humble and grounded even as you dream big together.',
  },
  'Sun-Saturn': {
    hard: 'This can feel like being judged, restricted, or parented by your partner. Saturn person may criticize or try to control the Sun person, while the Sun person may feel chronically inadequate or rebellious. This is heavy energy. The work is enormous but the reward is real: if you can learn to build structure without crushing spirit, this aspect produces the most enduring and reliable partnerships. But both people must be willing to do the emotional labor.',
    soft: 'There is a sense of maturity, reliability, and mutual respect. You take each other seriously. Saturn provides structure and the Sun provides warmth and vitality within that structure. Over time, this creates a deeply stable foundation. The risk is that the relationship becomes too serious, too duty-bound. Remember to play. Remember that love is not just responsibility — it is also joy.',
  },
  'Venus-Mars': {
    hard: 'Desire and love speak different languages between you. What one person finds romantic, the other finds aggressive or too passive. There may be a push-pull dynamic around physical intimacy — one person wants more, the other wants different. This is some of the most intense sexual chemistry in astrology, but it requires honest conversation about needs. Do not assume your partner wants what you want. Ask directly. The friction here can become extraordinary passion if both people learn to communicate about desire without shame.',
    soft: 'Attraction flows naturally but watch for taking the chemistry for granted. This is classic romantic and sexual compatibility — you want each other and your love styles complement naturally. The danger is assuming that good chemistry means good communication. Physical connection can mask emotional disconnects. Use this natural magnetism as a doorway into deeper intimacy, not a replacement for it.',
  },
  'Venus-Venus': {
    hard: 'Your love languages and aesthetic sensibilities differ significantly. What makes one person feel loved may leave the other cold. You might disagree about money, beauty, comfort, or social life. This does not mean love is impossible — it means you must learn to give love in the way your partner receives it, not just the way you prefer to give it. Study each other.',
    soft: 'You share similar values and naturally enjoy the same pleasures. There is an ease in how you show affection — gifts, touch, quality time, or words of affirmation land as intended. This is beautiful but can become an echo chamber. Introduce each other to new experiences rather than always defaulting to the comfortable and familiar.',
  },
  'Venus-Saturn': {
    hard: 'Love feels conditional, earned, or withheld. One partner may feel they can never do enough to please the other. There may be financial tensions or disagreements about how affection should be expressed. This aspect asks you to examine what you truly believe about whether you deserve love. The relationship will not feel easy — but if both people commit to showing up honestly, it builds a love that lasts because it was built on truth, not fantasy.',
    soft: 'Love matures beautifully over time. There is loyalty, commitment, and a willingness to work through difficulties together. The relationship may start slowly but deepens significantly with the years. The risk is that duty replaces desire. Schedule romance. Surprise each other. Do not let the reliability become monotony.',
  },
  'Moon-Moon': {
    hard: 'Your emotional needs directly conflict. One person needs space when the other needs closeness. One processes feelings through talk while the other needs silence. This creates a pattern where both people feel emotionally unsatisfied despite genuinely caring. The solution is not compromise — it is alternation. Take turns getting your needs met. Acknowledge that your partner processes differently, not wrongly.',
    soft: 'You feel emotionally safe with each other. There is an instinctive understanding of when the other person needs comfort, space, or encouragement. This is the foundation of a nurturing home life. The shadow is emotional codependency — being so attuned that you lose your individual emotional identity. Maintain friendships and interests outside the relationship.',
  },
  'Moon-Venus': {
    hard: 'Emotional needs and love expression are misaligned. One person shows love in ways that do not register emotionally for the other. This can create a cycle of feeling unloved despite genuine effort. The fix is explicit communication about what makes each person feel cared for. Do not assume — declare your needs clearly and listen to theirs without defensiveness.',
    soft: 'Emotional comfort and romantic affection blend beautifully. You feel loved, nurtured, and adored. This is one of the sweetest aspects for domestic happiness. The risk is creating a bubble that excludes growth. Comfort can become avoidance if you use the relationship to hide from challenges rather than face them together.',
  },
  'Moon-Mars': {
    hard: 'Emotions trigger action, and action triggers emotions — often in a volatile loop. Arguments can escalate from zero to intense because feelings are immediately acted upon. One person may feel attacked while the other feels emotionally manipulated. The work is learning to pause between feeling and reacting. Count to ten. Walk away if needed. Come back when you can listen. This aspect generates tremendous passion when the emotional energy is channeled constructively.',
    soft: 'Emotional needs and physical energy complement each other. There is warmth, protectiveness, and a willingness to act on behalf of each other. The Mars person makes the Moon person feel safe, and the Moon person gives the Mars person something meaningful to fight for. Just ensure that protection does not become possessiveness.',
  },
  'Moon-Saturn': {
    hard: 'A genuinely difficult synastry aspect. The Moon person may feel emotionally rejected, dismissed, or coldly handled. The Saturn person may feel overwhelmed by emotional needs they cannot meet. Old family patterns often replay here — feelings of not being good enough, fear of abandonment, or emotional unavailability. Healing requires both people to be honest about where the old wounds are still running the show. Therapy, individually and together, is strongly recommended. If you do the work, this aspect can convert inherited pain into adult security.',
    soft: 'Emotional stability is a hallmark of this connection. The Saturn person provides a safe container for the Moon person, and the Moon person softens Saturn natural rigidity. There is a deep sense of commitment and responsibility toward each other. Be careful that emotional expression does not become restricted — feelings need room to breathe even within the safest structures.',
  },
  'Moon-Pluto': {
    hard: 'A deeply intense aspect between two people. The emotional bond is magnetic and almost compulsive. There may be possessiveness, jealousy, power struggles over emotional control, or a feeling that you cannot leave even when things are unhealthy. Radical honesty about your shadow sides is required here, not optional. If both people are willing to face their deepest fears and patterns, this can become a profoundly transformative connection. If not, it can slide into toxic. Choose awareness.',
    soft: 'The emotional depth between you is extraordinary. You see each other at your most vulnerable and it deepens rather than diminishes the bond. There is a sense that this relationship changes you permanently, in positive ways. Guard against emotional fusion — even in the deepest intimacy, you are two separate people with separate inner lives.',
  },
  'Mercury-Mercury': {
    hard: 'You think and communicate in fundamentally different ways. One is logical while the other is intuitive. One needs to talk things through while the other needs to write or think alone. Arguments about misunderstandings are common. The growth is in learning that there is more than one valid way to process information. Repeat back what you hear before responding. Check understanding before assuming.',
    soft: 'Conversation flows naturally. You understand each other quickly and enjoy exchanging ideas. This creates mental stimulation and compatibility that sustains a relationship far beyond physical attraction. The risk is over-intellectualizing emotions — not everything needs to be discussed and analyzed. Sometimes silence and feeling are more intimate than words.',
  },
  'Mercury-Venus': {
    hard: 'The way you communicate may feel unpleasant or unloving to your partner. Bluntness meets sensitivity. Criticism meets the need for appreciation. Pay attention to tone, not just content. How you say something matters as much as what you say.',
    soft: 'Communication is naturally sweet, diplomatic, and affectionate. You enjoy talking to each other and likely share aesthetic or cultural interests. This makes daily life together pleasant and harmonious. Keep depth alongside the pleasantness — not every conversation needs to be smooth.',
  },
  'Mars-Mars': {
    hard: 'Two warriors in the same relationship. Conflicts can become power struggles where neither person backs down. Physical energy may be intense but competitive. The key is channeling aggression into shared goals rather than against each other. Compete together, not with each other. Find shared outlets for physical energy.',
    soft: 'You energize and motivate each other. Physical compatibility is strong and you naturally understand each other drive and ambition. This creates a dynamic, action-oriented partnership. Ensure you also create space for vulnerability — strength is not the absence of softness.',
  },
  'Mars-Saturn': {
    hard: 'Drive meets restriction. One person feels constantly blocked or criticized for their ambition, while the other feels reckless or irresponsible. Frustration builds over time if not addressed. The work is finding the balance between action and planning, between risk and caution. Both approaches have value — neither is complete alone.',
    soft: 'Disciplined energy. You help each other channel ambition into concrete results. There is a productive quality to this partnership — you get things done together. Avoid becoming all work and no play. Celebrate milestones. Rest is part of the rhythm of achievement.',
  },
  'Jupiter-Saturn': {
    hard: 'Expansion meets contraction. One person wants to grow, explore, and take risks while the other wants stability, caution, and proven methods. This can feel like having the brakes and accelerator pressed at the same time. Find a rhythm of alternation — seasons of growth followed by consolidation.',
    soft: 'Balanced growth. You expand and consolidate in a sustainable rhythm. This is one of the best aspects for building something lasting together — a business, a family, a shared life vision. The risk is becoming so focused on the project that you forget to be romantic. Remember why you started.',
  },
  'Venus-Jupiter': {
    hard: 'Love and abundance may feel excessive or mismatched. One partner may spend too freely, promise too much, or idealize the relationship to an unrealistic degree. Generosity can become irresponsibility. Ground your optimism in reality while keeping the spirit of abundance alive.',
    soft: 'A deeply favorable aspect for love. Generosity, warmth, mutual appreciation, and shared enjoyment are the hallmarks. You make each other feel abundant and blessed. Just make sure the gratitude extends to the hard times too — the relationship is not just a party.',
  },
  'Venus-Pluto': {
    hard: 'Obsessive attraction, possessiveness, and power dynamics around love and desire. One person may try to control the other through emotional intensity or sexual manipulation. This is a potent energy that demands conscious handling. Love must be freely given or it becomes a prison. Examine your attachment patterns honestly.',
    soft: 'Deeply transformative love. The connection has a quality of fate or destiny. Physical and emotional intimacy reaches extraordinary depths. This changes both of you permanently. The shadow is that intensity can become addictive — ensure you love the whole person, not just the thrill.',
  },
  'Venus-Neptune': {
    hard: 'Idealization, deception, and disillusionment are the risks. One person may see the other through rose-colored glasses, ignoring red flags. There can be a pattern of sacrifice where one person gives too much and the other takes without awareness. Get clear about who your partner actually is, not who you wish they were.',
    soft: 'A romantic, spiritual, and deeply beautiful connection. You see the best in each other and there is a quality of soul recognition. Art, music, and spiritual practice strengthen the bond. Maintain healthy boundaries even within the dreaminess — paradise still needs a foundation.',
  },
  'Venus-Uranus': {
    hard: 'The relationship feels unstable or inconsistent in how love is expressed. One person may need freedom that feels like rejection to the other. Commitment can feel suffocating while distance feels like abandonment. Find your own definition of partnership — it does not have to look like anyone else.',
    soft: 'Exciting, unconventional love. You keep each other interested and stimulated. The relationship likely has an unusual quality that others may not understand but that works perfectly for you. Just ensure excitement does not substitute for depth.',
  },
  'Moon-Neptune': {
    hard: 'Emotional boundaries dissolve in confusing ways. One person may absorb the other emotions until they cannot tell whose feelings are whose. Deception (including self-deception) around emotional needs is common. Practice radical honesty about your feelings, even when the truth is uncomfortable. Compassion without clarity becomes enabling.',
    soft: 'Psychic-level emotional attunement. You feel each other without words. There is a spiritual quality to the emotional bond that transcends ordinary connection. Beautiful for creative and spiritual partnership. Keep grounding practices in place — transcendence needs an anchor.',
  },
  'Moon-Uranus': {
    hard: 'Emotional instability and sudden disruptions to security. One person craves stability while the other introduces chaos or distance unpredictably. This creates an anxious attachment pattern. The work is learning to provide reliable emotional presence while still honoring the need for freedom and individuality.',
    soft: 'Emotional excitement and a feeling of being emotionally liberated by each other. You free each other from outdated emotional patterns. The relationship may have an unconventional quality. Just ensure emotional safety is maintained alongside the excitement.',
  },
  'Sun-Pluto': {
    hard: 'Power struggles are central to this dynamic. One person may feel controlled, manipulated, or overshadowed. The Pluto person may unconsciously try to dominate or transform the Sun person identity. This is extremely intense energy. It demands total honesty about power dynamics and a willingness to confront your shadow. If both people do the work, the partnership transforms each of them in ways no easier chemistry could have. If not, it can be deeply damaging.',
    soft: 'A deeply empowering connection. You help each other access hidden strengths and face fears with courage. There is a quality of profound mutual influence that shapes both people permanently. Use this power consciously — transformation is a responsibility, not just a gift.',
  },
  'Sun-Neptune': {
    hard: 'Confusion about who the other person really is. One partner may idealize or project fantasies onto the other, leading to inevitable disappointment. There can be deception, self-sacrifice, or a savior-victim dynamic. Get honest about your projections. See your partner clearly, flaws and all, and decide if you love the real person.',
    soft: 'A compassionate, spiritually attuned connection. You inspire each other creativity and bring out a gentler, more imaginative side. Beautiful for artistic or spiritual partnerships. Stay grounded — inspiration needs to be paired with practical action to manifest.',
  },
  'Sun-Uranus': {
    hard: 'The relationship may feel unstable, unpredictable, or difficult to define. One person freedom-seeking nature disrupts the other sense of identity or security. There may be a pattern of coming together and pulling apart. Accept that this relationship will not follow conventional patterns — and decide if that is something you can genuinely live with.',
    soft: 'You liberate each other. Being together makes both of you feel more authentically yourselves, more willing to break from convention and pursue what truly matters. This is exciting, stimulating energy. Ensure it is channeled into meaningful growth rather than just novelty-seeking.',
  },
  'Mercury-Mars': {
    hard: 'Communication becomes combative. Discussions easily turn into debates, and debates into arguments. One person may feel intellectually attacked while the other feels they cannot express direct opinions. Learn the difference between debate and dialogue. Not every conversation is a competition to win.',
    soft: 'Stimulating mental and physical energy. You challenge each other thinking in productive ways and are likely to have lively, engaging conversations. This keeps the relationship mentally and physically vibrant. Ensure directness does not become harshness over time.',
  },
  'Mercury-Saturn': {
    hard: 'Communication feels restricted, criticized, or dismissed. One person may feel their ideas are always shut down or judged as impractical. The other may feel that conversations lack seriousness or substance. Practice active listening and validate before critiquing.',
    soft: 'Thoughtful, structured communication. You help each other think more clearly and make better decisions through honest, practical dialogue. This is excellent for partnerships that require planning and coordination. Keep room for playful, unstructured conversation too.',
  },
  'Mercury-Pluto': {
    hard: 'Conversations can become manipulative, probing, or psychologically intense. One person may use words as weapons or dig into the other psyche uninvited. Mental power struggles are common. Use your insight to understand, not to control.',
    soft: 'Deep, penetrating communication. You discuss things that most people avoid — death, sex, power, psychology. This creates an extraordinary level of mental intimacy. Ensure honesty is paired with compassion, not used as a blade.',
  },
  'Jupiter-Jupiter': {
    hard: 'Competing visions for growth and meaning. You may disagree about philosophy, religion, education, or what it means to live a good life. Neither person vision is wrong — the work is finding shared values within the difference.',
    soft: 'Shared enthusiasm for growth, travel, learning, and expanding horizons. You make each other more optimistic and adventurous. Beautiful for long-term compatibility. Stay grounded in reality even as you dream together.',
  },
  'Saturn-Saturn': {
    hard: 'Mutual restriction and rigidity. Both people may reinforce each other fears, limitations, or pessimism. The relationship can feel heavy or dutiful. Consciously introduce lightness, fun, and spontaneity.',
    soft: 'Deep respect and shared sense of responsibility. You take life and each other seriously in the best way. This creates enduring stability. Ensure seriousness does not crowd out joy.',
  },
};

function getPairKey(planet1: string, planet2: string): string {
  const pairs = [planet1, planet2].sort();
  return `${pairs[0]}-${pairs[1]}`;
}

export function getSynastryInterpretation(planet1: string, planet2: string, aspectType: string): string {
  const pairKey = getPairKey(planet1, planet2);
  const aspect = ASPECT_QUALITIES[aspectType] || ASPECT_QUALITIES['Conjunction'];
  const isHard = ['Square', 'Opposition', 'Quincunx'].includes(aspectType);
  const isSoft = ['Trine', 'Sextile'].includes(aspectType);
  const isConjunction = aspectType === 'Conjunction';

  const theme = PLANET_SYNASTRY_THEMES[pairKey];
  if (theme) {
    if (isConjunction) {
      return translateText(`${theme.soft.split('.').slice(0, 2).join('.')}. However, the intensity of conjunction also means: ${theme.hard.split('.').slice(0, 2).join('.')}. The merged energy of ${planet1} and ${planet2} in conjunction demands conscious awareness. At its best, the bond carries a rare depth of resonance. At its most challenging, the boundaries between your energies blur until neither person feels fully themselves. The work is maintaining individual identity within the intensity of union.`);
    }
    if (isHard) {
      return translateText(theme.hard);
    }
    if (isSoft) {
      return translateText(theme.soft);
    }
  }

  return translateText(generateFallbackInterpretation(planet1, planet2, aspectType, aspect, isHard, isSoft, isConjunction));
}

function generateFallbackInterpretation(
  planet1: string,
  planet2: string,
  aspectType: string,
  aspect: { quality: string; shadow: string },
  isHard: boolean,
  isSoft: boolean,
  isConjunction: boolean,
): string {
  const p1Meaning = PLANET_MEANINGS[planet1] || `the energy of ${planet1}`;
  const p2Meaning = PLANET_MEANINGS[planet2] || `the energy of ${planet2}`;

  if (isConjunction) {
    return `When one person's ${planet1} meets the other's ${planet2} in conjunction, their ${p1Meaning} fuses directly with the other's ${p2Meaning}. This creates a powerful sense of recognition — you feel each other's energy immediately and intensely. The connection in this area is undeniable, but because the energies are so merged, it can be difficult to tell where one person ends and the other begins. Over time, this aspect deepens into either a profound bond or an overwhelming intensity that needs conscious breathing room. The key is to honor both the closeness and the need for individual expression within the merged energy.`;
  }

  if (isHard) {
    const adviceMap: Record<string, string> = {
      Square: 'The square demands action. Do not just talk about the friction — actively change how you respond to it. Build new patterns. The old ones will keep producing the same fights.',
      Opposition: 'The opposition asks for balance. Each of you holds a truth the other needs. Stop trying to pull your partner to your side and start asking what you can learn from theirs.',
      Quincunx: 'The quincunx asks for adjustment without resolution. Accept that this dynamic will always feel slightly off-kilter. The goal is not to fix it but to make room for the awkwardness with humor and patience.',
    };

    return `The ${aspectType.toLowerCase()} between ${planet1} and ${planet2} creates a dynamic tension between one person's ${p1Meaning} and the other's ${p2Meaning}. This is not a comfortable aspect, but it is a deeply activating one. The friction you feel in this area is not a sign that the relationship is broken — it is a sign that real growth is being demanded of both of you. ${aspect.shadow}. If left unconscious, this dynamic can create recurring arguments or withdrawal. But if both people commit to understanding the tension rather than winning, the aspect turns into a transformative force in the relationship. ${adviceMap[aspectType] || 'The work here is patience, honest communication, and the willingness to see the other person\'s perspective as valid even when it contradicts your own.'}`;
  }

  if (isSoft) {
    const softAdvice = aspectType === 'Trine'
      ? 'Trines are gifts, but gifts that go unappreciated eventually stop giving. Schedule intentional time to celebrate this part of your connection rather than assuming it will maintain itself.'
      : 'Sextiles are opportunities — they open doors but you still need to walk through them. Actively invest in this area of your connection rather than letting it hum quietly in the background.';

    return `This ${aspectType.toLowerCase()} between ${planet1} and ${planet2} creates a natural ease between one person's ${p1Meaning} and the other's ${p2Meaning}. There is a gentle flow here — you support each other in this area almost without trying. The attraction feels comfortable rather than electric, and that comfort is genuinely valuable. However, the shadow of this ease is that you may stop actively nurturing this part of the relationship, assuming it will sustain itself. ${aspect.shadow}. ${softAdvice}`;
  }

  return `The connection between ${planet1} and ${planet2} in this aspect ${aspect.quality}. One person's ${p1Meaning} interacts with the other's ${p2Meaning} in a way that creates both chemistry and complexity. This dynamic will evolve over time — what feels exciting at first may require conscious attention to maintain. The guidance is to stay curious about how this energy expresses itself between you, and to communicate openly when it feels misaligned.`;
}

export function getCompositeInterpretation(planet1: string, planet2: string, aspectType: string): string {
  const p1Meaning = PLANET_MEANINGS[planet1] || `the energy of ${planet1}`;
  const p2Meaning = PLANET_MEANINGS[planet2] || `the energy of ${planet2}`;
  const isHard = ['Square', 'Opposition', 'Quincunx'].includes(aspectType);
  const isSoft = ['Trine', 'Sextile'].includes(aspectType);

  if (aspectType === 'Conjunction') {
    return translateText(`This relationship carries a powerful fusion of ${p1Meaning} and ${p2Meaning}. The bond between you concentrates energy in this area — together, you create an intensity around ${planet1}-${planet2} themes that neither of you would experience alone. This connection thrives when both people honor the merged energy without losing themselves within it. The relationship itself becomes a third entity with its own ${planet1}-${planet2} identity.`);
  }

  if (isHard) {
    return translateText(`This relationship carries inherent tension between ${p1Meaning} and ${p2Meaning}. The bond between you is wired for growth through friction in this area. Together, you create a dynamic that demands both people stretch beyond their comfort zones around ${planet1} and ${planet2} themes. This connection does not allow complacency — it pushes both partners toward greater awareness. The challenge is real, but so is the transformation available. This relationship thrives when both people treat the tension as a shared project rather than a personal failing.`);
  }

  if (isSoft) {
    return translateText(`This relationship naturally flows in the area of ${p1Meaning} and ${p2Meaning}. Together, you create an energy that supports and enhances ${planet1}-${planet2} themes effortlessly. The bond between you carries a gift here — an easy synergy that makes this area of life feel lighter and more natural when you are together. The connection thrives when both people actively appreciate this ease rather than taking it for granted. Even natural harmony needs conscious tending to deepen over time.`);
  }

  return translateText(`This relationship expresses a unique blend of ${p1Meaning} and ${p2Meaning}. The connection between you creates its own dynamic around ${planet1}-${planet2} themes that evolves as the relationship matures. Together, you create an energy that neither person carries alone — the relationship itself has its own character in this domain.`);
}

export function generateLocalPersonalReading(
  person1Name: string,
  person2Name: string,
  scores: {
    overall_score: number;
    emotional_score: number;
    intellectual_score: number;
    physical_score: number;
    spiritual_score: number;
    attraction_score: number;
    stability_score: number;
    harmony_score: number;
    magnetic_score: number;
    karmic_score: number;
  },
  aspects: Array<{ planet1: string; planet2: string; aspect_type: string; harmony: string }>,
  strengths: string[],
  challenges: string[],
  mode: 'synastry' | 'composite',
): string {
  const name1 = person1Name || 'You';
  const name2 = person2Name || 'Your partner';

  const scoreEntries = [
    { label: 'Attraction', key: 'attraction', score: scores.attraction_score },
    { label: 'Emotional Connection', key: 'emotional', score: scores.emotional_score },
    { label: 'Mental Compatibility', key: 'intellectual', score: scores.intellectual_score },
    { label: 'Stability', key: 'stability', score: scores.stability_score },
    { label: 'Karmic Bond', key: 'karmic', score: scores.karmic_score },
    { label: 'Harmony', key: 'harmony', score: scores.harmony_score },
    { label: 'Magnetic Pull', key: 'magnetic', score: scores.magnetic_score },
  ].sort((a, b) => b.score - a.score);

  const topStrengths = scoreEntries.slice(0, 3);
  const topChallenges = scoreEntries.slice(-2);

  const harmoniousCount = aspects.filter(a => a.harmony === 'harmonious').length;
  const challengingCount = aspects.filter(a => a.harmony === 'challenging').length;
  const totalAspects = aspects.length;

  let dominantPattern = 'balanced';
  if (harmoniousCount > challengingCount * 1.5) dominantPattern = 'harmonious';
  else if (challengingCount > harmoniousCount * 1.5) dominantPattern = 'growth-oriented';

  const SCORE_DEPTH: Record<string, { high: string; mid: string; low: string }> = {
    attraction: {
      high: `The pull between ${name1} and ${name2} is visceral — the kind that makes a room feel smaller when you are both in it. This is not just physical chemistry, though that is certainly here. It is a recognition, a magnetism that operates on a level neither of you can fully explain. When this is working, it feels like gravity. When it is complicated, it feels like addiction. The distinction matters.`,
      mid: `There is attraction here, but it is not the lightning-bolt kind. It is quieter — the kind that builds over shared mornings and long conversations. That is not lesser. Relationships built on explosive chemistry often burn out. What ${name1} and ${name2} have is the kind that deepens with time, if both people stay curious about each other.`,
      low: `Let me be honest — the raw, instant attraction between ${name1} and ${name2} is not the strongest signal in this chart. That does not mean desire is absent. It means it lives in a different language here. Physical connection will need to be cultivated intentionally — through touch, through vulnerability, through creating moments where you both feel safe enough to want each other without the pressure of performance.`,
    },
    emotional: {
      high: `This is the heart of your connection. ${name1} and ${name2} have the rare ability to make each other feel emotionally safe — truly safe, not just comfortable. You understand each other's moods without needing them explained. You know when something is wrong before a word is spoken. This emotional attunement is a gift most couples spend decades trying to build. You arrived with it. Do not take it for granted.`,
      mid: `Emotionally, ${name1} and ${name2} connect in some areas and miss each other in others. There are moments of deep understanding — where one of you says exactly what the other needed to hear — and moments where you might as well be speaking different languages. The work here is not to become the same. It is to learn each other's emotional dialect and respect it even when it does not match your own.`,
      low: `This is the area that needs the most care. ${name1} and ${name2} process emotions very differently, and without conscious effort, this can create a painful cycle: one person reaches out, the other withdraws, and both end up feeling unseen. The solution is not more talking — it is more listening. Specifically, listening to understand rather than listening to respond. Ask each other: "What do you need from me right now?" and then actually do it, even if it feels unnatural.`,
    },
    intellectual: {
      high: `Your minds fit together beautifully. ${name1} and ${name2} can spend hours in conversation and walk away feeling more energized than when you started. You challenge each other's ideas without threatening each other's identity. This mental chemistry is actually rarer than physical chemistry — and it is what sustains a relationship decades after the initial spark evolves. You make each other smarter. That is not a small thing.`,
      mid: `Intellectually, there is common ground but also genuine differences in how ${name1} and ${name2} think, process, and communicate. These differences are not flaws — they are opportunities to see the world through another lens. The couples who thrive here are the ones who get curious about what their partner sees that they miss, rather than insisting their own perspective is the correct one.`,
      low: `Mentally, ${name1} and ${name2} operate on different frequencies. This can feel frustrating — like you are explaining something that should be obvious, or hearing words that do not land the way they were intended. But here is what I want you to understand: intellectual compatibility is not about agreeing. It is about respecting how the other person's mind works, even when it bewilders you. Find the topics where you DO connect, and let those be your bridge.`,
    },
    stability: {
      high: `There is a solidity here that most relationships envy. ${name1} and ${name2} create a sense of safety together — the kind where you can exhale, put your walls down, and actually be yourself. This does not mean boring. It means dependable. And in a world full of uncertainty, having one person who feels like home is worth more than all the excitement that burns out by Tuesday.`,
      mid: `Stability between ${name1} and ${name2} exists, but it is something you build rather than something you were given. There will be periods of beautiful consistency and periods where the ground feels shaky. Both are normal. The key is to not panic during the shaky parts. Show up consistently even when things are uncertain, and the foundation gets stronger every time.`,
      low: `Stability is your growth edge. What ${name1} and ${name2} share swings between intensity and moments of uncertainty — and the space between those extremes can feel exhausting. This does not mean the relationship is broken. It means it requires intentional anchoring: routines you share, promises you keep, small acts of reliability that accumulate into trust over time. Grand gestures mean nothing if the everyday is unpredictable.`,
    },
    karmic: {
      high: `There is something deeply fated in what ${name1} and ${name2} share. Whether you believe in past lives or not, there is an undeniable sense that you have known each other before — a familiarity that logic cannot explain. This karmic bond creates intensity, depth, and sometimes a feeling of inevitability. The lesson here is not to romanticize fate — it is to honor it by doing the real work of showing up as your best self, not just the version that showed up last time.`,
      mid: `The karmic thread between ${name1} and ${name2} is present but not overwhelming. There are moments of recognition — deja vu, an uncanny sense of knowing each other's patterns — but they are woven into a connection that is very much rooted in the present. This is actually healthy. It means you are building something new together rather than replaying an old script.`,
      low: `The karmic signature here is light, which means this connection is less about old patterns and more about fresh possibility. ${name1} and ${name2} are writing a new story, not finishing an old one. There is freedom in that — no heavy baggage from past-life dynamics, no sense of obligation or entanglement. What you build together is entirely your own.`,
    },
    harmony: {
      high: `The natural harmony between ${name1} and ${name2} is palpable — other people can feel it when you walk into a room together. There is an ease here that does not require effort, a rhythm that syncs without conscious coordination. Enjoy this. But also know that too much harmony without honest friction can create a surface-level peace where real issues get buried. Do not sacrifice truth for tranquility.`,
      mid: `Harmony is present but earned — ${name1} and ${name2} do not always default to agreement, and that is actually a sign of a real relationship rather than a performed one. The moments of discord are not failures. They are the relationship doing its job: showing you where you still have room to grow, both individually and together.`,
      low: `Let me be direct — natural, effortless harmony is not the strongest suit of this connection. ${name1} and ${name2} may find that peace requires conscious creation rather than passive enjoyment. That sounds exhausting, and sometimes it will be. But the relationships that learn to build harmony from friction are often stronger than the ones where everything came easily. Easy relationships are not always good ones. Challenging relationships are not always bad ones.`,
    },
    magnetic: {
      high: `The magnetic pull between ${name1} and ${name2} is the kind that other people notice. There is an energy between you that is hard to ignore — it draws you back together even after distance or disagreement. This magnetism is a powerful force, but it needs to be paired with genuine respect and healthy boundaries. Magnetism without consciousness is just obsession with better packaging.`,
      mid: `There is a pull between ${name1} and ${name2} — it is not the kind that makes you lose yourself, but it is steady and real. You gravitate toward each other in social situations, you think about each other when apart, and there is a warmth when you reconnect. This is the kind of magnetism that sustains — quiet, consistent, and deepening over time.`,
      low: `The magnetic pull here is subtle rather than dramatic. ${name1} and ${name2} may not feel that desperate, all-consuming draw — and that is not necessarily a bad thing. Intense magnetism often comes with intense volatility. What you have instead is the potential for a bond built on choice rather than compulsion. You are together because you want to be, not because you cannot help it.`,
    },
  };

  let reading = '';

  if (scores.overall_score >= 80) {
    reading += `## ${name1} & ${name2}\n\n`;
    reading += `I need to tell you something before we go any further — what I see between ${name1} and ${name2} is not ordinary. An overall compatibility of ${scores.overall_score}% means the cosmos lined up something significant here. But I want to be careful with that word "significant," because it does not mean "easy." It means this connection has depth, resonance, and the potential to be one of the defining relationships of both your lives. What you do with that potential is entirely up to you.\n\n`;
  } else if (scores.overall_score >= 60) {
    reading += `## ${name1} & ${name2}\n\n`;
    reading += `What ${name1} and ${name2} have is real — not perfect, not effortless, but genuinely real. At ${scores.overall_score}% overall compatibility, what I see is a relationship with enough natural chemistry to sustain it and enough tension to grow it. The couples who thrive at this level are the ones who stop chasing perfection and start appreciating what is actually in front of them. Let me show you what that looks like.\n\n`;
  } else if (scores.overall_score >= 40) {
    reading += `## ${name1} & ${name2}\n\n`;
    reading += `I am going to be honest with you, because you deserve honesty more than comfort. At ${scores.overall_score}% overall compatibility, what ${name1} and ${name2} share will require conscious, ongoing effort from both people. This is not a death sentence for the relationship — some of the most transformative partnerships in history were not the easiest ones. But it does mean that coasting will not work. You will both need to show up, communicate clearly, and choose each other deliberately — especially on the days when it feels hard.\n\n`;
  } else {
    reading += `## ${name1} & ${name2}\n\n`;
    reading += `I want to speak to you with care and respect here, because what I see at ${scores.overall_score}% overall compatibility is a connection that faces significant headwinds. That does not mean love is not present — love can exist in the most challenging charts. But it does mean that this relationship will test both ${name1} and ${name2} in ways that will either forge something unbreakable or reveal fundamental incompatibilities that no amount of effort can bridge. The most loving thing you can do is be honest about which one it is.\n\n`;
  }

  reading += `### What Draws You Together\n\n`;
  topStrengths.forEach((s) => {
    const depth = SCORE_DEPTH[s.key];
    if (depth) {
      const text = s.score >= 70 ? depth.high : s.score >= 45 ? depth.mid : depth.low;
      reading += `**${s.label} — ${s.score}%**\n${text}\n\n`;
    } else {
      reading += `**${s.label} — ${s.score}%**\nThis is ${s.score >= 70 ? 'a genuine strength' : s.score >= 45 ? 'a solid area with room to grow' : 'an area that needs conscious attention'} in your connection.\n\n`;
    }
  });

  reading += `### Where You Will Challenge Each Other\n\n`;
  reading += `Every relationship has growth edges — areas where the differences between two people create friction. The question is never whether friction exists. It is whether both people treat it as an invitation to grow or a reason to leave.\n\n`;
  topChallenges.forEach(c => {
    const depth = SCORE_DEPTH[c.key];
    if (depth) {
      const text = c.score < 40 ? depth.low : c.score < 60 ? depth.mid : depth.high;
      reading += `**${c.label} — ${c.score}%**\n${text}\n\n`;
    } else {
      reading += `**${c.label} — ${c.score}%**\nThis area will require direct attention and honest conversation.\n\n`;
    }
  });

  reading += `### The Dynamic Between You\n\n`;
  if (dominantPattern === 'harmonious') {
    reading += `With ${harmoniousCount} harmonious aspects out of ${totalAspects}, the overall dynamic between ${name1} and ${name2} is one of natural flow. You understand each other more easily than most couples. Conversations feel intuitive, silences feel comfortable, and there is a sense that you are on the same team.\n\n`;
    reading += `But I need to say something that easy-chemistry couples do not always want to hear: comfort can become complacency. When everything flows naturally, neither person is pushed to grow. The most dangerous thing for a harmonious relationship is not conflict — it is boredom. Keep challenging each other. Keep asking the questions that make you both a little uncomfortable. The ease is a gift. Do not let it make you lazy.\n\n`;
  } else if (dominantPattern === 'growth-oriented') {
    reading += `With ${challengingCount} challenging aspects out of ${totalAspects}, the dynamic between ${name1} and ${name2} is one of friction and transformation. This is not a relationship where you can put things on autopilot. Every few weeks — or days — something will surface that demands attention, honesty, or change.\n\n`;
    reading += `Here is the truth about growth-oriented relationships: they produce the deepest intimacy IF both people are willing to do the work. The couples who survive this dynamic are the ones who learn to fight clean, apologize quickly, and remember that the person across from them is not the enemy — the pattern is. You are not here to defeat each other. You are here to help each other evolve. Sometimes that is uncomfortable. Often, it is worth it.\n\n`;
  } else {
    reading += `With ${harmoniousCount} harmonious and ${challengingCount} challenging aspects out of ${totalAspects}, the dynamic between ${name1} and ${name2} has both ease and edge. You will have stretches where everything feels aligned — and stretches where you wonder how two people who love each other can be so different.\n\n`;
    reading += `This balance is actually the healthiest foundation a relationship can have. The harmonious aspects give you a home base to return to when things get hard. The challenging aspects ensure you never stop growing. The key is to not mistake the hard parts for evidence that something is wrong. Tension in a balanced chart is not a warning sign — it is the relationship doing its job.\n\n`;
  }

  const weakAreas: string[] = [];
  if (scores.emotional_score < 50) {
    weakAreas.push(`**Emotional disconnection** is a real risk here. ${name1} and ${name2} may process feelings at different speeds and in different ways — one of you needs to talk it out while the other needs space to process alone. Neither approach is wrong, but without understanding this difference, it creates a painful cycle where one person feels abandoned and the other feels suffocated. The fix is simple but not easy: ask "what do you need right now?" and then actually honor the answer, even when it is the opposite of what you would need.`);
  }
  if (scores.stability_score < 50) {
    weakAreas.push(`**Instability** will surface periodically. ${name1} and ${name2} may struggle with consistency — one or both of you might pull away when things get too close, or create chaos when things get too calm. This is usually rooted in attachment patterns from childhood, not in the relationship itself. Name the pattern when you see it. "I think I'm pushing you away because I'm scared" changes the shape of the conversation the moment it leaves your mouth.`);
  }
  if (scores.attraction_score < 50) {
    weakAreas.push(`**Physical and romantic desire** may need intentional cultivation. This does not mean the attraction is not real — it means it expresses itself differently than the fireworks-and-butterflies version that movies sell you. For ${name1} and ${name2}, desire may live in intellectual stimulation, in acts of service, in emotional vulnerability. Find where it lives and feed it deliberately. Do not wait for it to show up looking like a movie scene.`);
  }
  if (scores.intellectual_score < 50) {
    weakAreas.push(`**Mental connection** requires bridge-building. ${name1} and ${name2} think differently — different processing speeds, different interests, different ways of reaching conclusions. The temptation is to dismiss what you do not understand. Resist that. Ask genuine questions about how your partner's mind works. Be curious about their perspective rather than frustrated by it. The couples who learn to appreciate each other's cognitive style often end up with a richer worldview than either could build alone.`);
  }

  if (weakAreas.length > 0) {
    reading += `### The One Thing That Could Break You\n\n`;
    reading += `${weakAreas[0]}\n\n`;
    if (weakAreas.length > 1) {
      reading += `### Also Worth Watching\n\n`;
      weakAreas.slice(1).forEach(w => { reading += `${w}\n\n`; });
    }
  }

  reading += `### The Honest Truth\n\n`;
  if (scores.overall_score >= 70) {
    reading += `${name1} and ${name2} have something worth protecting. Not because the stars guarantee success — they never do — but because the raw ingredients for a deep, lasting, transformative partnership are present in this chart. The question is not whether this connection CAN work. It is whether both of you will do the daily work of choosing each other honestly, fighting fairly, and growing together instead of apart.\n\n`;
    reading += `What you have is not common. Treat it accordingly.`;
  } else if (scores.overall_score >= 45) {
    reading += `${name1} and ${name2} have a real connection — not a fairy tale, but something grounded and genuine. It will require effort, honesty, and a willingness to be uncomfortable sometimes. But the relationships that ask the most of us are often the ones that give the most back.\n\n`;
    reading += `The numbers do not decide your future. You do. Every conversation, every compromise, every moment of choosing understanding over being right — that is what builds a relationship that lasts. The chart shows potential. You write the story.`;
  } else {
    reading += `I want to honor the truth of what this chart shows while also honoring the love that brought ${name1} and ${name2} together. A challenging compatibility score is not a verdict — it is information. Some couples with difficult charts build extraordinary relationships because they refuse to give up on each other. Others with perfect charts fall apart because they took the ease for granted.\n\n`;
    reading += `If you choose this relationship, choose it with your eyes open. Know where the hard parts live. Talk about them before they become crises. And be honest — with each other and with yourselves — about whether both people are willing to do the work this connection demands. Love is necessary. But it is not sufficient. Effort, honesty, and mutual respect are what turn love into partnership.`;
  }

  return translateText(reading);
}

export const SYNASTRY_INTERPRETATIONS: Record<string, SynastryAspectInterpretation> = {};
