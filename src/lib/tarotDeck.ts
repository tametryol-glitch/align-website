// Client-side tarot deck — draws cards locally, no backend needed

interface TarotCardDef {
  name: string;
  arcana: 'major' | 'minor';
  number: number;
  suit?: string;
  keywords_upright: string[];
  keywords_reversed: string[];
  imagery?: string;
}

const MAJOR_ARCANA: TarotCardDef[] = [
  { name: 'The Fool', arcana: 'major', number: 0, keywords_upright: ['new beginnings', 'innocence', 'spontaneity'], keywords_reversed: ['recklessness', 'carelessness', 'risk-taking'], imagery: 'A traveler at the cliff edge, one foot already over. The dog barks a warning the Fool does not hear. This is the moment before the fall becomes flight.' },
  { name: 'The Magician', arcana: 'major', number: 1, keywords_upright: ['willpower', 'manifestation', 'resourcefulness'], keywords_reversed: ['manipulation', 'trickery', 'illusion'], imagery: 'One hand pointed up, one pointed down. The four tools of the suits laid out on the table. Everything you need is already in the room.' },
  { name: 'The High Priestess', arcana: 'major', number: 2, keywords_upright: ['intuition', 'mystery', 'inner knowledge'], keywords_reversed: ['secrets', 'withdrawal', 'repressed feelings'], imagery: 'She sits between two pillars — one black, one white — with a scroll half-hidden in her lap. What she knows, she knows without being told.' },
  { name: 'The Empress', arcana: 'major', number: 3, keywords_upright: ['abundance', 'fertility', 'nurturing'], keywords_reversed: ['dependence', 'smothering', 'creative block'], imagery: 'A woman enthroned in a field of wheat, pomegranates, and running water. Nothing is forced; everything is allowed to grow.' },
  { name: 'The Emperor', arcana: 'major', number: 4, keywords_upright: ['authority', 'structure', 'stability'], keywords_reversed: ['tyranny', 'rigidity', 'domination'], imagery: 'Stone throne, ram-head carvings, a barren mountain range. Nothing soft in the frame. The card of the father.' },
  { name: 'The Hierophant', arcana: 'major', number: 5, keywords_upright: ['tradition', 'spiritual wisdom', 'education'], keywords_reversed: ['rebellion', 'subversiveness', 'restriction'], imagery: 'Two initiates kneel before a figure who holds keys and speaks in established language. The door is real.' },
  { name: 'The Lovers', arcana: 'major', number: 6, keywords_upright: ['love', 'harmony', 'partnership'], keywords_reversed: ['disharmony', 'imbalance', 'indecision'], imagery: 'Two figures stand naked beneath an angel. Behind them, two trees — one in fruit, one in flame. This is a card about choice.' },
  { name: 'The Chariot', arcana: 'major', number: 7, keywords_upright: ['determination', 'willpower', 'triumph'], keywords_reversed: ['lack of direction', 'aggression', 'defeat'], imagery: 'A driver holds no reins. Two sphinxes pull in different directions. Victory here is the refusal to let opposing forces split you.' },
  { name: 'Strength', arcana: 'major', number: 8, keywords_upright: ['courage', 'inner strength', 'patience'], keywords_reversed: ['self-doubt', 'weakness', 'insecurity'], imagery: 'A woman gently closes the mouth of a lion. Not fighting it — calming it. The strength that stays kind in the face of what is wild.' },
  { name: 'The Hermit', arcana: 'major', number: 9, keywords_upright: ['introspection', 'solitude', 'inner wisdom'], keywords_reversed: ['isolation', 'loneliness', 'withdrawal'], imagery: 'An old figure on a snow-covered peak, holding a lantern with a single star inside. The walk itself is the point.' },
  { name: 'Wheel of Fortune', arcana: 'major', number: 10, keywords_upright: ['destiny', 'luck', 'cycles'], keywords_reversed: ['bad luck', 'resistance to change', 'breaking cycles'], imagery: 'A wheel turns in midair, creatures rising and falling on its rim. No one is steering it.' },
  { name: 'Justice', arcana: 'major', number: 11, keywords_upright: ['fairness', 'truth', 'law'], keywords_reversed: ['dishonesty', 'unfairness', 'lack of accountability'], imagery: 'Sword upright in one hand, scales balanced in the other, eyes uncovered. Only the truth of the weights.' },
  { name: 'The Hanged Man', arcana: 'major', number: 12, keywords_upright: ['surrender', 'new perspective', 'letting go'], keywords_reversed: ['stalling', 'resistance', 'indecision'], imagery: 'A figure hangs upside down from a living tree, face oddly at peace. The world has not changed. His view of it has.' },
  { name: 'Death', arcana: 'major', number: 13, keywords_upright: ['transformation', 'endings', 'transition'], keywords_reversed: ['resistance to change', 'stagnation', 'decay'], imagery: 'A skeletal figure in black armor rides a pale horse. A sun rises between two towers at the horizon. The ending is also the line of a new day.' },
  { name: 'Temperance', arcana: 'major', number: 14, keywords_upright: ['balance', 'moderation', 'patience'], keywords_reversed: ['imbalance', 'excess', 'lack of vision'], imagery: 'An angel pours water between two cups, one foot on stone, one in the stream. The art of blending things that seemed incompatible.' },
  { name: 'The Devil', arcana: 'major', number: 15, keywords_upright: ['shadow self', 'attachment', 'obsession'], keywords_reversed: ['freedom', 'release', 'detachment'], imagery: 'Two figures chained at the neck to the base of a throne. Look closer — the chains are loose enough to step out of.' },
  { name: 'The Tower', arcana: 'major', number: 16, keywords_upright: ['sudden change', 'upheaval', 'revelation'], keywords_reversed: ['avoidance', 'fear of change', 'delayed disaster'], imagery: 'Lightning strikes the crown off a stone tower. Figures fall from the windows. Whatever was built on a false foundation is coming down.' },
  { name: 'The Star', arcana: 'major', number: 17, keywords_upright: ['hope', 'faith', 'renewal'], keywords_reversed: ['despair', 'disconnection', 'lack of faith'], imagery: 'A woman kneels at the edge of a pool under a sky of seven stars. After the Tower, this is the first quiet breath.' },
  { name: 'The Moon', arcana: 'major', number: 18, keywords_upright: ['illusion', 'intuition', 'subconscious'], keywords_reversed: ['confusion', 'fear', 'misinterpretation'], imagery: 'A dog and a wolf howl at the same moon. A crayfish crawls out of the water. Everything looks almost like something else.' },
  { name: 'The Sun', arcana: 'major', number: 19, keywords_upright: ['joy', 'success', 'vitality'], keywords_reversed: ['negativity', 'sadness', 'blocked happiness'], imagery: 'A naked child rides a white horse under a sun in full bloom. No armor, no disguise. The light is kind.' },
  { name: 'Judgement', arcana: 'major', number: 20, keywords_upright: ['rebirth', 'reflection', 'reckoning'], keywords_reversed: ['self-doubt', 'refusal of self-examination'], imagery: 'An angel sounds a trumpet; figures rise from open graves. The moment you finally hear the call you had been pretending not to hear.' },
  { name: 'The World', arcana: 'major', number: 21, keywords_upright: ['completion', 'achievement', 'wholeness'], keywords_reversed: ['incompletion', 'shortcuts', 'delays'], imagery: 'A dancer moves inside a wreath of laurel, flanked by four creatures. One chapter has finished. The circle is closed.' },
];

const SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles'];
const COURT = ['Page', 'Knight', 'Queen', 'King'];

const SUIT_KEYWORDS: Record<string, { upright: string[]; reversed: string[]; imagery: string }[]> = {
  Wands: [
    { upright: ['inspiration', 'new venture', 'spark'], reversed: ['delays', 'lack of direction'], imagery: 'A hand emerges from a cloud holding a flowering wand. The first match struck in the dark.' },
    { upright: ['planning', 'future vision', 'progress'], reversed: ['fear of the unknown', 'lack of planning'], imagery: 'A figure stands on a castle balcony holding a globe, a wand in each hand.' },
    { upright: ['expansion', 'foresight', 'exploration'], reversed: ['obstacles', 'frustration'], imagery: 'A figure watches ships sail from a high cliff, three wands planted beside him.' },
    { upright: ['celebration', 'homecoming', 'harmony'], reversed: ['instability', 'transition'], imagery: 'Four garlanded wands stand before a castle; figures raise bouquets.' },
    { upright: ['competition', 'conflict', 'diversity'], reversed: ['avoidance', 'inner conflict'], imagery: 'Five figures clash with wands raised in chaotic combat.' },
    { upright: ['victory', 'recognition', 'success'], reversed: ['ego', 'fall from grace'], imagery: 'A laurel-crowned rider leads a procession, wand lifted in salute.' },
    { upright: ['courage', 'standing ground', 'persistence'], reversed: ['overwhelm', 'giving up'], imagery: 'A figure on a cliff fends off six wands rising from below.' },
    { upright: ['speed', 'movement', 'swift action'], reversed: ['delays', 'frustration'], imagery: 'Eight wands fly through open air in parallel, no hands in sight.' },
    { upright: ['resilience', 'grit', 'last stand'], reversed: ['exhaustion', 'stubbornness'], imagery: 'A bandaged figure leans on a wand, eight more planted behind.' },
    { upright: ['burden', 'responsibility', 'hard work'], reversed: ['release', 'delegation'], imagery: 'A figure hunches forward, arms full of ten wands, a town in the distance.' },
  ],
  Cups: [
    { upright: ['new feelings', 'emotional awakening', 'intuition'], reversed: ['emotional loss', 'blocked creativity'], imagery: 'A hand from a cloud offers a cup with five streams of water spilling over.' },
    { upright: ['partnership', 'unity', 'attraction'], reversed: ['imbalance', 'broken connection'], imagery: 'Two figures exchange cups, a caduceus rising between them.' },
    { upright: ['celebration', 'friendship', 'community'], reversed: ['overindulgence', 'gossip'], imagery: 'Three dancers raise cups in a circle, fruits at their feet.' },
    { upright: ['apathy', 'contemplation', 'reevaluation'], reversed: ['awareness', 'acceptance'], imagery: 'A figure sits under a tree, arms crossed, three cups before him.' },
    { upright: ['loss', 'grief', 'regret'], reversed: ['acceptance', 'moving on'], imagery: 'A cloaked figure mourns three spilled cups; two still stand behind.' },
    { upright: ['nostalgia', 'childhood', 'innocence'], reversed: ['stuck in the past', 'unrealistic'], imagery: 'Children exchange cups full of flowers in a sunlit courtyard.' },
    { upright: ['choices', 'fantasy', 'illusion'], reversed: ['alignment', 'clarity'], imagery: 'Seven cups float in cloud — castle, jewels, dragon, face, wreath, serpent, shrouded figure.' },
    { upright: ['walking away', 'disillusion', 'seeking truth'], reversed: ['avoidance', 'fear of change'], imagery: 'A figure walks away from eight stacked cups, up a mountain path.' },
    { upright: ['contentment', 'satisfaction', 'wish fulfillment'], reversed: ['greed', 'dissatisfaction'], imagery: 'A contented figure sits before nine cups arranged in an arc.' },
    { upright: ['emotional fulfillment', 'harmony', 'family'], reversed: ['dysfunction', 'broken bonds'], imagery: 'A family stands beneath a rainbow arcing ten cups across the sky.' },
  ],
  Swords: [
    { upright: ['clarity', 'breakthrough', 'truth'], reversed: ['confusion', 'brutality'], imagery: 'A hand from a cloud grips an upright sword crowned with a laurel wreath.' },
    { upright: ['stalemate', 'difficult choices', 'avoidance'], reversed: ['indecision', 'information overload'], imagery: 'A blindfolded figure holds two crossed swords at the chest.' },
    { upright: ['heartbreak', 'sorrow', 'grief'], reversed: ['recovery', 'forgiveness'], imagery: 'A red heart pierced by three swords under a grey, raining sky.' },
    { upright: ['rest', 'recovery', 'contemplation'], reversed: ['restlessness', 'burnout'], imagery: 'A knight lies effigy-still on a stone tomb, hands in prayer.' },
    { upright: ['conflict', 'defeat', 'walking away'], reversed: ['reconciliation', 'forgiveness'], imagery: 'A smirking figure gathers swords as two others walk away stooped.' },
    { upright: ['transition', 'moving on', 'change'], reversed: ['resistance', 'unfinished business'], imagery: 'A ferryman poles a boat across still water, six swords planted in the hull.' },
    { upright: ['deception', 'stealth', 'strategy'], reversed: ['coming clean', 'conscience'], imagery: 'A figure tiptoes away from a camp clutching five swords.' },
    { upright: ['restriction', 'imprisonment', 'helplessness'], reversed: ['freedom', 'release'], imagery: 'A blindfolded figure stands bound between eight planted swords.' },
    { upright: ['anxiety', 'worry', 'nightmare'], reversed: ['recovery', 'overcoming fear'], imagery: 'A figure sits up in bed with head in hands, nine swords on the wall.' },
    { upright: ['betrayal', 'ending', 'rock bottom'], reversed: ['recovery', 'regeneration'], imagery: 'A figure lies face-down with ten swords in the back, first light breaking.' },
  ],
  Pentacles: [
    { upright: ['opportunity', 'new venture', 'prosperity'], reversed: ['lost opportunity', 'bad investment'], imagery: 'A hand from a cloud presents a golden pentacle above a garden path.' },
    { upright: ['balance', 'adaptability', 'juggling'], reversed: ['overcommitted', 'disorganized'], imagery: 'A figure juggles two pentacles bound by an infinity loop.' },
    { upright: ['teamwork', 'learning', 'mastery'], reversed: ['lack of teamwork', 'mediocrity'], imagery: 'A stonemason in a vaulted workshop receives review from a monk and patron.' },
    { upright: ['security', 'control', 'stability'], reversed: ['greed', 'materialism'], imagery: 'A crowned figure clutches a pentacle to the chest, two under the feet.' },
    { upright: ['hardship', 'loss', 'isolation'], reversed: ['recovery', 'spiritual growth'], imagery: 'Two injured figures limp through snow past a lit stained-glass window.' },
    { upright: ['generosity', 'charity', 'sharing'], reversed: ['debt', 'selfishness'], imagery: 'A merchant weighs coins on a scale, giving to two kneeling figures.' },
    { upright: ['patience', 'investment', 'perseverance'], reversed: ['impatience', 'bad investment'], imagery: 'A farmer leans on a hoe watching a hedge laden with seven pentacles.' },
    { upright: ['skill', 'craftsmanship', 'dedication'], reversed: ['perfectionism', 'lack of motivation'], imagery: 'A craftsman at the bench hammers one pentacle, six finished displayed.' },
    { upright: ['luxury', 'independence', 'self-sufficiency'], reversed: ['overindulgence', 'superficiality'], imagery: 'A richly dressed figure walks in a lush garden with a hooded falcon.' },
    { upright: ['wealth', 'inheritance', 'family legacy'], reversed: ['financial failure', 'loss'], imagery: 'An old man watches generations pass beneath an archway of ten pentacles.' },
  ],
};

const COURT_KEYWORDS: Record<string, { upright: string[]; reversed: string[]; imagery: string }[]> = {
  Wands: [
    { upright: ['enthusiasm', 'exploration', 'discovery'], reversed: ['lack of direction', 'procrastination'], imagery: 'A young figure studies a flowering wand like it is a living thing.' },
    { upright: ['energy', 'passion', 'adventure'], reversed: ['haste', 'scattered energy'], imagery: 'A rider charges forward with wand raised, horse rearing in the dust.' },
    { upright: ['courage', 'confidence', 'independence'], reversed: ['selfishness', 'jealousy'], imagery: 'A queen sits enthroned with a sunflower behind her and a black cat at her feet.' },
    { upright: ['leadership', 'vision', 'honor'], reversed: ['impulsiveness', 'ruthlessness'], imagery: 'A king sits flanked by salamanders, wand held at rest.' },
  ],
  Cups: [
    { upright: ['creativity', 'sensitivity', 'dreamer'], reversed: ['emotional immaturity', 'escapism'], imagery: 'A youth by the sea holds a cup from which a fish is leaping.' },
    { upright: ['romance', 'charm', 'imagination'], reversed: ['moodiness', 'jealousy'], imagery: 'A winged-helmet rider approaches at a walking pace, cup extended.' },
    { upright: ['compassion', 'calm', 'intuitive'], reversed: ['codependency', 'manipulation'], imagery: 'A queen sits by the shore cradling an ornate covered cup.' },
    { upright: ['emotional balance', 'diplomacy', 'wisdom'], reversed: ['emotional manipulation', 'coldness'], imagery: 'A king sits on a throne that floats on a choppy sea.' },
  ],
  Swords: [
    { upright: ['curiosity', 'new ideas', 'communication'], reversed: ['gossip', 'cynicism'], imagery: 'A young figure lifts a sword against a windy sky.' },
    { upright: ['ambition', 'fast-thinking', 'action'], reversed: ['aggression', 'impatience'], imagery: 'A rider charges at full gallop, sword out in front.' },
    { upright: ['independence', 'perception', 'clarity'], reversed: ['cold', 'harsh', 'bitter'], imagery: 'A queen sits enthroned above the clouds, sword upright.' },
    { upright: ['authority', 'intellect', 'truth'], reversed: ['tyranny', 'abuse of power'], imagery: 'A stern king sits on a throne of butterflies and clouds.' },
  ],
  Pentacles: [
    { upright: ['ambition', 'desire to learn', 'opportunity'], reversed: ['lack of progress', 'laziness'], imagery: 'A youth stands in an open field holding a single pentacle aloft.' },
    { upright: ['hard work', 'productivity', 'routine'], reversed: ['boredom', 'laziness'], imagery: 'A still rider sits on a motionless horse, one pentacle balanced.' },
    { upright: ['nurturing', 'practical', 'generous'], reversed: ['self-neglect', 'smothering'], imagery: 'A queen sits in a blooming garden, cradling a pentacle.' },
    { upright: ['abundance', 'discipline', 'security'], reversed: ['greed', 'materialism'], imagery: 'A king sits on a throne tangled with grape vines and carved bulls.' },
  ],
};

function buildFullDeck(): TarotCardDef[] {
  const deck: TarotCardDef[] = [...MAJOR_ARCANA];
  for (const suit of SUITS) {
    for (let n = 1; n <= 10; n++) {
      const kw = SUIT_KEYWORDS[suit][n - 1];
      deck.push({
        name: `${n === 1 ? 'Ace' : n} of ${suit}`,
        arcana: 'minor',
        number: n,
        suit,
        keywords_upright: kw.upright,
        keywords_reversed: kw.reversed,
        imagery: kw.imagery,
      });
    }
    for (let c = 0; c < COURT.length; c++) {
      const kw = COURT_KEYWORDS[suit][c];
      deck.push({
        name: `${COURT[c]} of ${suit}`,
        arcana: 'minor',
        number: 11 + c,
        suit,
        keywords_upright: kw.upright,
        keywords_reversed: kw.reversed,
        imagery: kw.imagery,
      });
    }
  }
  return deck;
}

const FULL_DECK = buildFullDeck();

export interface DrawnCard {
  name: string;
  position: string;
  reversed: boolean;
  arcana: string;
  number: number;
  suit?: string;
  keywords: string[];
  imagery?: string;
}

export function drawCards(spreadType: string, positionLabels: string[]): DrawnCard[] {
  const count = positionLabels.length;
  const shuffled = [...FULL_DECK].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  return selected.map((card, i) => {
    const reversed = Math.random() < 0.3;
    return {
      name: card.name,
      position: positionLabels[i] || `Card ${i + 1}`,
      reversed,
      arcana: card.arcana,
      number: card.number,
      suit: card.suit,
      keywords: reversed ? card.keywords_reversed : card.keywords_upright,
      imagery: card.imagery,
    };
  });
}
