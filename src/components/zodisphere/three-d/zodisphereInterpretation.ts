/**
 * Zodisphere Interpretation Engine
 *
 * Synthesizes a SINGLE cohesive reading for a tapped location from six layers,
 * in strict hierarchy, never interpreting them separately:
 *
 *   1. Planet      — the activated line (core energy).
 *   2. Natal sign  — how that planet naturally expresses.
 *   3. Natal house — the primary life area activated.
 *   4. Duad        — its sign → the natal house it falls in.
 *   5. Compendium  — its sign → the natal house it falls in.
 *   6. Matrix      — its sign → the natal house it falls in.
 *
 * On top of the layers it analyzes: house relationships (reinforcing / supporting
 * / complementary / opposing / tension), elemental balance, modality balance,
 * planetary rulers (with repeat-weighting) and each ruler's natal condition
 * (sign, house, essential dignity, major aspects, strength), and recurring
 * patterns — then composes one weighted narrative.
 *
 * It performs NO astronomy: it reads the already-validated natal longitudes and
 * the already-derived duad/compendium/matrix signs (getFullDuadCompendium).
 */

import {
  SIGNS, RULERS, SIGN_THEMES, HOUSE_THEMES, getHouseForSign, getFullDuadCompendium,
} from '@/lib/engines/duadCompendium';
import type { ChartData } from '@/lib/zodisphereMidpoints';

// ── Configurable weighting (spec: Planet+House 45 / Sign 25 / Duad 15 / Comp 10 / Matrix 5)
export interface InterpretationWeights {
  planetHouse: number; natalSign: number; duad: number; compendium: number; matrix: number;
}
export const DEFAULT_WEIGHTS: InterpretationWeights = {
  planetHouse: 0.45, natalSign: 0.25, duad: 0.15, compendium: 0.10, matrix: 0.05,
};

type Element = 'Fire' | 'Earth' | 'Air' | 'Water';
type Modality = 'Cardinal' | 'Fixed' | 'Mutable';

const ELEMENT: Record<string, Element> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};
const MODALITY: Record<string, Modality> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
  Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};
// Classical exaltations (planet → exalted sign). Fall = opposite.
const EXALTATION: Record<string, string> = {
  Sun: 'Aries', Moon: 'Taurus', Mercury: 'Virgo', Venus: 'Pisces',
  Mars: 'Capricorn', Jupiter: 'Cancer', Saturn: 'Libra',
};
// Domicile: invert the (custom) rulership map → planet → signs it rules.
const DOMICILE: Record<string, string[]> = (() => {
  const m: Record<string, string[]> = {};
  for (const [sign, ruler] of Object.entries(RULERS)) (m[ruler] ??= []).push(sign);
  return m;
})();

const BENEFICS = new Set(['Venus', 'Jupiter']);
const MALEFICS = new Set(['Mars', 'Saturn']);

/** Second-person core energy of each activated planetary line. */
const PLANET_ENERGY: Record<string, string> = {
  Sun: 'your drive to be seen, to shine, and to become who you are',
  Moon: 'your emotional core — what makes you feel safe, held, and at home',
  Mercury: 'your mind, your voice, and how you connect and make sense of things',
  Venus: 'your capacity for love, beauty, worth, and what you draw toward you',
  Mars: 'your drive, desire, anger, and how you fight for what you want',
  Jupiter: 'your growth, luck, faith, and hunger for something bigger',
  Saturn: 'your discipline, limits, fears, and the mastery earned the hard way',
  Uranus: 'your need to break free, wake up, and live on your own terms',
  Neptune: 'your dreams, longing, spirituality, and where boundaries dissolve',
  Pluto: 'your power, obsessions, and capacity to be torn down and reborn',
  'North Node': 'your growth edge — the unfamiliar direction your life is pulling toward',
  'South Node': 'the old, over-practiced patterns you lean on and must release',
  Chiron: 'your deepest wound and the healing you can offer others through it',
};
function planetEnergy(p: string): string {
  return PLANET_ENERGY[p] || `the ${p} force in you`;
}

/** The plain-language life ARENA a line's angle activates (no jargon). */
const ANGLE_AREA: Record<string, string> = {
  MC: 'your work and your place in the world',
  IC: 'your home and your family',
  ASC: 'who you are and how you come across',
  DSC: 'your love life and closest relationships',
};

/** The HEADLINE prediction for each planet × angle — vivid, emotional, a little
 *  risky, but grounded in the real meaning of that planet in that arena. Format:
 *  a punchy hook sentence, then a concrete "what could happen" follow. */
const PREDICTIONS: Record<string, Record<string, string>> = {
  Sun: {
    MC: 'This is a place you get noticed. Your work could step into the spotlight — recognition, a title, a big public win — but everyone will be watching, so there\'s nowhere to hide.',
    IC: 'You could finally feel at home in your own skin here. Family warms up, or you become the heart the whole household orbits — just don\'t let it go to your head.',
    ASC: 'You shine here. People see the real you and doors open on charisma alone — the only trap is the ego that rides in with all that attention.',
    DSC: 'People are drawn to your light here. A relationship could put you center-stage — or you fall hard for someone who needs to be the star.',
  },
  Moon: {
    MC: 'Your work here runs on feeling. You could build something caring for or moving people — or ride an emotional rollercoaster in public you can\'t quite hide.',
    IC: 'This is a place that pulls at your heart. You\'ll want to nest, to belong, to be held — but old family wounds can rise right back up too.',
    ASC: 'You wear your heart on your face here. People feel close to you fast, and you\'re softer, moodier, and more exposed than usual — for better and worse.',
    DSC: 'You bond fast and deep here. Love turns tender and protective — comfort and clinginess in the same breath, so watch how much you give away.',
  },
  Mercury: {
    MC: 'Your mind is your money here. Writing, speaking, teaching, deals — the right words open doors, but you\'ll be busy to the edge of scattered.',
    IC: 'Home fills with talk, ideas, and constant coming-and-going here. It\'s alive and stimulating — and restless if part of you is craving quiet.',
    ASC: 'You come across sharp and quick here. You\'ll talk, connect, and think nonstop — and struggle to ever switch your head off.',
    DSC: 'You fall for a mind here. Relationships get witty and stimulating, built on conversation — just keep an eye out for someone who won\'t stay put.',
  },
  Venus: {
    MC: 'Your charm opens doors here. Money, beauty, and the right relationships can lift your reputation — just don\'t coast on being liked.',
    IC: 'Home gets beautiful and sweet here — comfort, love, maybe a place you never want to leave. The only risk is going soft and getting stuck.',
    ASC: 'You\'re magnetic here. You\'ll feel and look more attractive and draw admirers and opportunities to you — vanity is the one thing to watch.',
    DSC: 'This is a love-magnet of a place. Romance, a fated partner, maybe marriage — or you fall for the wrong beautiful thing. Either way your heart is in it.',
  },
  Mars: {
    MC: 'You\'ll fight for what you want here. Bold career moves, competition, maybe clashes with the people in charge — great for drive, dangerous for burnout.',
    IC: 'Home runs hot here. You\'ll get a lot done — or slam into tension and slammed doors with the people you live with. The fire needs somewhere to go.',
    ASC: 'You\'re a force here — bold, energized, up for anything. Just watch the short fuse and the accidents that come from moving too fast.',
    DSC: 'Passion runs high here. Intense attraction, hot-and-cold love, maybe a partner you clash with as hard as you want them — this place turns up the heat.',
  },
  Jupiter: {
    MC: 'This is a lucky place for your career. Growth, opportunity, a promotion, travel for work — the only real danger is overpromising.',
    IC: 'Your home and family expand here — more room, more abundance, maybe literally a bigger place. Just watch the tendency to overdo everything.',
    ASC: 'Good fortune seems to follow you here. You feel optimistic, generous, larger than life — don\'t let it tip into overconfidence.',
    DSC: 'Relationships bring luck and growth here — a generous partner, a wedding, someone who cracks your world wide open. Just don\'t bite off more than you can hold.',
  },
  Saturn: {
    MC: 'You\'ll build something real here, brick by brick. Mastery, authority, and respect are on offer — but earned the hard way, through pressure and delay.',
    IC: 'Home feels heavier here — real responsibility, maybe caring for family, or a lonely stretch that ends up making you stand on your own two feet.',
    ASC: 'This place ages you, in the best and hardest sense. You\'re taken seriously here, but it can feel cold or restrictive — you grow up here, ready or not.',
    DSC: 'Relationships get serious here — commitment, duty, maybe an older or steadier partner — or a loneliness that finally teaches you what you actually need.',
  },
  Uranus: {
    MC: 'Your career could take a hard left here. Sudden changes, unconventional work, walking away from the safe path — you\'ll choose freedom over security.',
    IC: 'You could uproot your whole home life here — a sudden move, an unconventional living setup, or finally walking away from a place that felt like a cage.',
    ASC: 'You reinvent yourself here. Expect the unexpected — a new look, a new identity, a jolt that wakes you up. Comfort was never the point.',
    DSC: 'Love goes electric and unpredictable here — sudden sparks, unconventional arrangements, on-again-off-again. It\'s exciting, but freedom matters more than safety.',
  },
  Neptune: {
    MC: 'Your work turns dreamy here — art, film, healing, and spirituality thrive, but so can confusion and people who aren\'t what they seem. Trust slowly.',
    IC: 'Home feels magical or a little unreal here — a sanctuary, or a place where the edges blur and you quietly lose the plot. Keep one foot on the ground.',
    ASC: 'You become a kind of mirror here — inspired, intuitive, and a little lost. People project their dreams onto you, so be careful who you dissolve into.',
    DSC: 'This is where you fall in love with a dream. Soulmate highs are real here — and so is illusion, so make sure you\'re loving the person, not the fantasy.',
  },
  Pluto: {
    MC: 'Power moves here. Your career can transform completely — a rise, a fall, and a comeback — with power struggles you won\'t be able to sidestep.',
    IC: 'This place digs into your roots. Deep family history surfaces and you rebuild home life from the ground up — sometimes through a crisis that changes everything.',
    ASC: 'You\'re intense here — magnetic, powerful, impossible to ignore. Expect a kind of death-and-rebirth of who you thought you were.',
    DSC: 'Love goes all the way here — obsession, deep merging, jealousy, transformation. This is a partner who remakes you, or nearly wrecks you. Rarely in between.',
  },
};

/** A plain personality read of the natal sign — why the place lands on YOU
 *  differently (used lightly, no sign names in the prose). */
const SIGN_TRAIT: Record<string, string> = {
  Aries: 'someone who charges first and asks questions later',
  Taurus: 'someone who craves stability, comfort, and things that last',
  Gemini: 'someone whose mind never stops moving',
  Cancer: 'someone who feels everything deeply and protects what they love',
  Leo: 'someone who needs to be seen and to shine',
  Virgo: 'someone who notices every detail and wants to make things right',
  Libra: 'someone who craves harmony, beauty, and connection',
  Scorpio: 'someone who feels everything intensely and trusts slowly',
  Sagittarius: 'someone who needs freedom, adventure, and meaning',
  Capricorn: 'someone built to endure, achieve, and be respected',
  Aquarius: 'someone who thinks for themselves and refuses to be boxed in',
  Pisces: 'someone who dreams, absorbs, and feels what others miss',
};

/** Plain-language life domain for each house (no numbers in the prose). */
const HOUSE_LIFE: Record<number, string> = {
  1: 'who you are and how you carry yourself',
  2: 'your money and your sense of self-worth',
  3: 'your everyday world — words, ideas, and the people right around you',
  4: 'your home and your family',
  5: 'romance, creativity, and joy',
  6: 'your daily work, health, and routines',
  7: 'your closest relationships',
  8: 'intimacy, shared money, and deep change',
  9: 'travel, big questions, and the search for meaning',
  10: 'your career and reputation',
  11: 'your friendships and the future you\'re building',
  12: 'your inner world and what you need to let go of',
};

/** Plain, emotional mini-prediction for each house (what could happen). */
const HOUSE_PREDICT: Record<number, string> = {
  1: 'you could walk away from here a genuinely different person',
  2: 'your money and your sense of what you\'re worth could swing hard',
  3: 'the people around you and the way you think could shift',
  4: 'your home and family life could get stirred right up',
  5: 'a romance or a creative fire could catch when you least expect it',
  6: 'your work, health, and daily rhythm could get overhauled',
  7: 'a close relationship could hit a real turning point',
  8: 'something could end so something else can be reborn',
  9: 'you could be pulled toward travel, study, or a whole new outlook',
  10: 'your career or reputation could take a real turn',
  11: 'your friendships and your vision of the future could reshape you',
  12: 'buried feelings could surface, and you may have to let something go',
};

/** The plain undercurrent each ruling planet threads through the place. */
const RULER_THEME: Record<string, string> = {
  Sun: 'pull toward being seen and living boldly',
  Moon: 'need for comfort, care, and belonging',
  Mercury: 'restless, curious, talkative energy',
  Venus: 'pull toward love, beauty, and pleasure',
  Mars: 'drive to push, fight, and chase what you want',
  Jupiter: 'hunger for more — growth, adventure, and luck',
  Saturn: 'pressure to get serious and build something that lasts',
  Uranus: 'urge to break free and do it your own way',
  Neptune: 'longing to escape, dream, and dissolve',
  Pluto: 'pull toward intensity, power, and deep change',
  Vesta: 'devotion to a single focused purpose',
  Juno: 'focus on commitment and partnership',
};

/** DRACONIC (soul chart) past-life scenes for planet × angle. Past tense,
 *  evocative, framed as soul-memory — never a literal claim. */
const PAST_LIFE: Record<string, Record<string, string>> = {
  Sun: {
    MC: 'In a past life you may have been someone of rank here — a leader, a ruler, a public figure whose name people knew. Power and pride were yours, and so was the weight of being watched.',
    IC: 'A past life may have rooted you deep in this land — the head of a household, the heart of a family line that belonged here. You were someone\'s sun.',
    ASC: 'You may have walked this ground as someone impossible to overlook — bright, proud, born to be seen. People remembered your face long after you passed.',
    DSC: 'In a past life your light may have drawn a powerful partner here — a marriage of status, or a bond where one of you always stood in the other\'s shadow.',
  },
  Moon: {
    MC: 'You may have been known here for caring for others — feeding, nursing, mothering a whole community that leaned on you. Your work was tenderness.',
    IC: 'This may have been home in a past life — truly home. You belonged to a family and a hearth here, and some part of you never fully left.',
    ASC: 'You may have moved through this place as someone soft and deeply feeling — a face people trusted with their sorrows.',
    DSC: 'A past life may have bound you here to someone you loved like family — a tie of deep need and comfort, and maybe of never quite letting go.',
  },
  Mercury: {
    MC: 'You may have made your name here with words — a scribe, a trader, a teacher, a messenger. Your quick mind was your living.',
    IC: 'A past life may have filled a home here with letters, books, and endless talk — a household that lived by learning and news.',
    ASC: 'You may have been known here as clever and quick — the one who carried the message, struck the deal, or told the story everyone repeated.',
    DSC: 'A past life may have joined you here to a kindred mind — a partnership of words and ideas, and maybe of secrets shared.',
  },
  Venus: {
    MC: 'You may have been loved here for your beauty or your art — someone whose charm or craft made them known. Pleasure, though, had its price.',
    IC: 'A past life may have made this a place of love and comfort — a beautiful home, a family built on affection and ease.',
    ASC: 'You may have walked here as someone others found lovely — admired, desired, and perhaps a little vain about it.',
    DSC: 'This may have been where you loved and married in a past life — a great romance, or a bond you couldn\'t quit even when you should have.',
  },
  Mars: {
    MC: 'You may have fought here in a past life — a soldier, a commander, someone who won or lost by the blade. This ground may have known your battles.',
    IC: 'A past life here may have been marked by struggle at home — a household defended, or torn apart, by conflict and sheer will.',
    ASC: 'You may have been known here as a fighter — bold, fierce, quick to act. People feared you or followed you.',
    DSC: 'A past life may have tied you here to someone you both loved and warred with — passion and conflict in the very same breath.',
  },
  Jupiter: {
    MC: 'You may have held a place of honor here — a teacher, a priest, a noble, someone people looked to for wisdom or blessing.',
    IC: 'A past life may have given you abundance here — a large home, a prosperous family, a place of plenty and open doors.',
    ASC: 'You may have moved through this land as someone larger than life — generous, faithful, always reaching for the next horizon.',
    DSC: 'A past life may have brought you a fortunate union here — a partner who widened your world, or a marriage that lifted your whole standing.',
  },
  Saturn: {
    MC: 'You may have carried real authority here in a past life — a builder, an elder, a ruler bound by duty. Respect was earned the hard way.',
    IC: 'A past life here may have been heavy — responsibility for family or land, a home held together by nothing but endurance.',
    ASC: 'You may have been known here as serious and self-controlled — someone who bore burdens young and grew old in spirit before their time.',
    DSC: 'A past life may have bound you here in a union of duty — a lasting, difficult commitment, or a love shaped by loss and long years.',
  },
  Uranus: {
    MC: 'You may have been an outsider here — a rebel, an inventor, someone ahead of their time who upended the order and didn\'t try to fit.',
    IC: 'A past life here may have refused to settle — an unconventional home, a family that broke the rules, or roots you tore up and walked away from.',
    ASC: 'You may have walked this ground as someone strange and electric — a disruptor people could never quite place.',
    DSC: 'A past life may have joined you here to someone unconventional — a bond that broke every rule, or a love that came and went like lightning.',
  },
  Neptune: {
    MC: 'You may have been a mystic or a healer here — a dreamer, an artist, a soul who worked in the unseen. The line between vision and illusion was thin.',
    IC: 'A past life here may have felt like a dream — a home touched by faith or fantasy, or one you lost in a fog you could never quite lift.',
    ASC: 'You may have drifted through this place as someone otherworldly — a face people poured their longing into.',
    DSC: 'A past life may have tied you here to a soulmate or a phantom — a love that felt utterly fated, or one that was never quite real.',
  },
  Pluto: {
    MC: 'You may have held dangerous power here — a ruler, a shaman, someone who dealt in life, death, and control. You rose, and you fell hard.',
    IC: 'A past life here may have been marked by upheaval at the root — a family transformed by loss, secrets, or a buried crisis.',
    ASC: 'You may have moved through this land as someone intense and unforgettable — feared, magnetic, marked by survival.',
    DSC: 'A past life may have bound you here in a bond that consumed you — obsession, power, betrayal, or a love that remade you both.',
  },
};

/** What the soul carried FORWARD out of that life into this one. */
const KARMIC_CARRY: Record<string, string> = {
  Sun: 'a need to be seen — and the lesson of shining without needing the crowd',
  Moon: 'a deep well of care — and old wounds about belonging that still ask to be soothed',
  Mercury: 'a gift with words and ideas — and a restlessness you\'re still learning to quiet',
  Venus: 'a great capacity for love and beauty — and unfinished lessons about what you\'re truly worth',
  Mars: 'courage and fight — and an anger you may still be learning to aim well',
  Jupiter: 'faith and generosity — and a hunger for more you\'re still learning to fill from within',
  Saturn: 'endurance and mastery — and a heaviness you\'re still learning to set down',
  Uranus: 'a free, original spirit — and a difficulty belonging you\'re still making peace with',
  Neptune: 'compassion and vision — and a tendency to lose yourself you\'re still learning to hold',
  Pluto: 'the power to be reborn — and lessons about control and trust you\'re still working through',
};

/** Concrete PREDICTED EVENTS for planet × angle — specific, not generic, and
 *  the FULL range: fortune and success, but also loss, conflict, abuse, betrayal,
 *  or crisis where the planet genuinely indicates it. Shown as a scannable list.
 *  These are possibilities, never fate — the UI frames them honestly. */
const EVENTS: Record<string, Record<string, string[]>> = {
  Sun: {
    MC: ['A promotion, title, or public recognition that raises your standing', 'Becoming known — visibility, fame, or leadership in your field', 'A powerful mentor or father figure opening a major door', 'A clash with a boss or authority who won’t share the spotlight', 'Burnout or a heart/health scare from overexposure', 'Pride or ego costing you an important ally', 'A signature project or venture that makes your name'],
    IC: ['Buying or building a home that becomes the center of your life', 'Reconnecting with your father, roots, or family legacy', 'Becoming the head or heart of your household', 'A move that finally makes you feel you belong', 'Ego battles or a domineering figure ruling the home', 'A father wound or family-pride conflict resurfacing', 'Returning here later in life as your home base'],
    ASC: ['A surge of confidence that reinvents how you show up', 'Becoming recognized, admired, or locally known', 'A vitality boost — or strain on the heart from overdoing it', 'Attracting attention that opens doors (and envy)', 'Ego inflation that pushes people away', 'A defining personal achievement people tie to your name', 'Stepping into a spotlight role you didn’t plan for'],
    DSC: ['Meeting a charismatic, prominent partner', 'A marriage or partnership that raises your profile', 'Falling for someone who needs to be the center of attention', 'A power imbalance where one of you outshines the other', 'A partnership with a strong, dominant figure', 'Pride or competition straining a close bond', 'A partner who helps you step into your own light'],
  },
  Moon: {
    MC: ['A career built on caring, hospitality, or the public’s trust', 'Your emotions exposed publicly — reputation rising and falling with your moods', 'Success in food, real estate, care, or women’s markets', 'A female boss or the public mothering (or judging) you', 'Work instability that unsettles your security', 'Public recognition that finally makes you feel seen', 'A career move driven by a gut feeling'],
    IC: ['A deep sense of home and belonging — putting down roots', 'Pregnancy, motherhood, or a growing family here', 'Emotional healing around your mother or childhood', 'Buying a home that feels like it was always yours', 'Old family wounds and mother issues resurfacing', 'Family drama, moodiness, or emotional smothering at home', 'A house full of memories you can’t fully leave'],
    ASC: ['Becoming softer, more intuitive, more emotionally open', 'People instinctively trusting you with their feelings', 'Mood swings others can read on your face', 'A pregnancy or a shift in how you care for yourself', 'Feeling raw, exposed, and easily overwhelmed', 'Attracting needy people who drain you', 'A strong gut-instinct decision that changes your path'],
    DSC: ['A tender, deeply bonded relationship or marriage', 'A partner who feels like family from day one', 'Emotional dependency or clinginess taking over', 'Attracting someone moody, needy, or smothering', 'A relationship that reopens childhood wounds', 'Building a family or home with someone', 'A bond so close the boundaries blur'],
  },
  Mercury: {
    MC: ['A breakthrough in writing, speaking, teaching, or media', 'A deal, contract, or idea that makes your name', 'Being known as the sharp, articulate one', 'A leak, misstatement, or gossip that damages your reputation', 'Nervous overload from juggling too much', 'A sibling or peer tied to your success', 'A course, book, or platform that launches here'],
    IC: ['A home full of books, talk, and constant coming-and-going', 'Buying/selling property or frequent local moves', 'Siblings or relatives closely woven into home life', 'Miscommunication or tension with family', 'Restlessness — never quite settling in one place', 'A home-based business or study space', 'News about family that changes everything'],
    ASC: ['Becoming known as clever, quick, and articulate', 'A learning boom — new skills, ideas, connections', 'Anxiety or an overactive, sleepless mind', 'Meeting influential people through conversation', 'Being misunderstood or talked about', 'A short trip or local move that redirects you', 'Finding your voice — writing or speaking that defines you'],
    DSC: ['Meeting a partner through words, work, or a shared idea', 'A relationship built on mental spark and banter', 'A business or writing partnership', 'Miscommunication or lies straining a relationship', 'Attraction to someone younger, clever, or restless', 'Contracts, negotiations, or a legal matter with a partner', 'A partner who never stays still'],
  },
  Venus: {
    MC: ['Money and success through charm, art, or beauty', 'Public popularity and a well-liked reputation', 'A relationship that boosts your career or status', 'Coasting on being liked instead of doing the work', 'A love affair or scandal touching your public life', 'Recognition for creative or aesthetic talent', 'Money arriving through connections and goodwill'],
    IC: ['A beautiful, comfortable home you love deeply', 'Love, warmth, and harmony in family life', 'Turning a home into a sanctuary', 'Getting too comfortable — stuck and unwilling to leave', 'A family bond healed through affection', 'Overspending on comfort and luxury', 'A place you always long to return to'],
    ASC: ['Becoming more attractive, magnetic, and admired', 'Falling in love or drawing admirers easily', 'Money, gifts, or good fortune flowing in', 'Vanity, indulgence, or laziness setting in', 'A glow-up or makeover that changes your life', 'Being desired by someone unexpected', 'Popularity that opens social doors'],
    DSC: ['Meeting a significant love — possibly marriage', 'A fated, magnetic romance', 'An affair or a love you can’t walk away from', 'Jealousy, a love triangle, or betrayal', 'A partnership over money, art, or business', 'Attraction to the wrong beautiful person', 'A relationship that spoils you, for better or worse'],
  },
  Mars: {
    MC: ['A bold career move, launch, or hard-won promotion', 'Fierce competition — winning, or making enemies', 'Open conflict with bosses or authority', 'Reputation damaged by anger or aggression', 'Overwork leading to injury or burnout', 'Seizing leadership in a fight and taking charge', 'A rival who pushes you to your limit'],
    IC: ['Domestic conflict — arguments, volatility, slammed doors', 'A real risk of domestic violence or an aggressive household figure', 'A home accident, injury, or fire', 'A forceful renovation, build, or sudden move', 'Cutting off a toxic family tie by force', 'A fight over property or family territory', 'Drive and energy centered fiercely on home'],
    ASC: ['A surge of energy, courage, and boldness', 'Physical risk — accidents, injury, or surgery', 'Becoming assertive, combative, or quick-tempered', 'Standing up for yourself in a way that changes you', 'Attracting confrontation or aggression from others', 'An athletic or physical achievement', 'Acting rashly and paying for it'],
    DSC: ['A passionate but volatile relationship', 'A partner who is aggressive, controlling, or abusive', 'Open conflict, a legal battle, or a declared enemy', 'Sexual chemistry that overrides your judgment', 'Competition or a fight over a lover', 'A relationship that becomes a power struggle', 'Meeting someone through sport, conflict, or high stakes'],
  },
  Jupiter: {
    MC: ['A lucky career break, promotion, or windfall', 'Fast expansion of your business, influence, or reputation', 'Travel, teaching, or publishing raising your profile', 'Overpromising or overreaching and getting exposed', 'A powerful mentor or benefactor', 'Legal or ethical trouble from cutting corners', 'Public honor, award, or wide recognition'],
    IC: ['A larger home, property, or growing family', 'Abundance, generosity, and open doors at home', 'A move that expands your whole life', 'Overindulgence or living beyond your means', 'A foreign or faith connection in family life', 'Inheritance or family wealth', 'A home that becomes a gathering place'],
    ASC: ['A run of luck, optimism, and opportunity', 'Meaningful travel or study that changes you', 'Growing confidence, faith, and generosity', 'Overconfidence, excess, or weight gain', 'Meeting mentors and benefactors', 'A lucky break that redefines you', 'Taking on far too much at once'],
    DSC: ['A generous, expansive partner — possibly marriage', 'A relationship that opens your world', 'A partner from a different culture or background', 'Overpromising in love or biting off too much', 'A business partnership that pays off big', 'A wedding or major commitment', 'A lucky, life-changing introduction'],
  },
  Saturn: {
    MC: ['Slow, hard-earned career mastery and authority', 'A serious promotion into pressure and responsibility', 'Delays, obstacles, or a career setback to overcome', 'Public failure or loss of status to rebuild from', 'A demanding boss or heavy professional duty', 'Recognition that comes only after years of grind', 'Reaching the top and feeling its full weight'],
    IC: ['Heavy family responsibility — caring for a parent', 'Loss of, or distance from, a parent or elder', 'A stretch of loneliness or hardship at home', 'Property that ties you down for years', 'A cold, strict, or burdened household', 'Building lasting security slowly and painfully', 'Facing old family fears and finally outgrowing them'],
    ASC: ['A sobering, maturing chapter — you grow up here', 'Being given authority, weight, and responsibility', 'Depression, restriction, or feeling boxed in', 'Health issues — bones, teeth, or chronic strain', 'Loneliness that teaches hard self-reliance', 'A reputation for discipline and reliability', 'Bearing a burden that reshapes your character'],
    DSC: ['A serious, committed, possibly older partner', 'Marriage built on duty and endurance', 'A relationship marked by delay, distance, or coldness', 'Divorce, separation, or the loss of a partner', 'A partner who tests or restricts you', 'A hard lesson about what you truly need', 'A long, difficult bond that ultimately steadies you'],
  },
  Uranus: {
    MC: ['A sudden career change or dramatic pivot', 'Quitting or being pushed out of a stable job', 'Unconventional or tech-driven work taking off', 'Fame or notoriety arriving out of nowhere', 'Instability and unpredictability in public life', 'Rebelling against authority and going your own way', 'A breakthrough that upends your whole path'],
    IC: ['A sudden move or upheaval in your living situation', 'An unconventional home or living arrangement', 'Family estrangement, shocks, or abrupt change', 'Freedom from a household that felt like a cage', 'Restlessness — unable to settle for long', 'A shocking family revelation', 'Rebuilding home life on your own radical terms'],
    ASC: ['A dramatic reinvention of your identity or look', 'A sudden awakening — new beliefs, new direction', 'Accidents or shocks to the body', 'Standing out as the odd one, for better or worse', 'Breaking free of who you were told to be', 'Wild, exciting swings while you’re here', 'A jolt that wakes you up for good'],
    DSC: ['A sudden, electric attraction or whirlwind romance', 'An abrupt breakup, divorce, or separation', 'An unconventional or open relationship', 'On-again, off-again instability with a partner', 'Someone who upends your whole idea of love', 'Freedom-vs-commitment tension pulling you apart', 'A partner who comes and goes like lightning'],
  },
  Neptune: {
    MC: ['A career in art, film, healing, or spirituality taking off', 'A public image built on glamour or illusion', 'Being deceived, scandalized, or scapegoated at work', 'Confusion or drift about your direction', 'Inspiration and vision guiding your work', 'A reputation that’s more myth than reality', 'Sacrificing career for an ideal — or being let down by one'],
    IC: ['A dreamy, spiritual, or artistic home', 'Secrets, confusion, or deception within the family', 'Addiction or illness affecting the household', 'A parent who is absent, idealized, or lost', 'A home near water or of spiritual meaning', 'Losing a home or being misled about property', 'A haunting sense of longing tied to this place'],
    ASC: ['A spiritual or creative awakening', 'Becoming a screen others project their fantasies onto', 'Confusion about who you are — losing yourself', 'Vulnerability to deception, drugs, or escapism', 'Heightened intuition, empathy, or psychic sensitivity', 'An illness that’s hard to name or diagnose', 'Dissolving into a role, a cause, or a person'],
    DSC: ['A soulmate connection or fated romance', 'Being deceived, catfished, or betrayed by a partner', 'Falling in love with a fantasy, not the real person', 'A relationship blurred by addiction or codependency', 'A spiritual or artistic union', 'Sacrificing yourself for a partner', 'A love that feels magical but slips away'],
  },
  Pluto: {
    MC: ['A complete career transformation — rise, fall, rebirth', 'Gaining real power or influence (and its dangers)', 'A ruthless power struggle at work', 'Public downfall, scandal, or exposure', 'Obsessive ambition that consumes you', 'Rebuilding your standing from the ashes', 'Control battles with those above you'],
    IC: ['Deep family transformation, often through crisis', 'Buried family secrets, trauma, or abuse surfacing', 'A death, loss, or inheritance reshaping the home', 'Power and control struggles within the household', 'Tearing down and rebuilding your foundations', 'Confronting generational patterns', 'A home tied to intense endings and beginnings'],
    ASC: ['A profound personal transformation — a new you', 'Intense magnetism and presence, and its shadow', 'A brush with death, danger, or deep crisis', 'Obsessions or compulsions surfacing', 'Reclaiming power after being powerless', 'Being feared, envied, or targeted', 'A rebirth after hitting rock bottom'],
    DSC: ['An all-consuming, obsessive relationship', 'A partnership involving control, jealousy, or abuse', 'Betrayal, manipulation, or a bitter power struggle', 'Deep sexual and emotional merging with someone', 'A relationship that ends and remakes you', 'Attracting intense, powerful, or dangerous partners', 'Shared money, debt, or inheritance binding you together'],
  },
};

type Angle = 'MC' | 'IC' | 'ASC' | 'DSC';

const ELEMENT_ATMOSPHERE: Record<Element, string> = {
  Fire: 'charged and driven — here you act on instinct and ignite before you overthink',
  Earth: 'grounded and tangible — progress here is slow, physical, and built to last',
  Air: 'mental and social — ideas, words, and people move fast around you here',
  Water: 'emotional and intuitive — you feel this place in your body before you understand it',
};
const MODALITY_EFFECT: Record<Modality, string> = {
  Cardinal: 'pushes you to initiate — to start something and take the lead',
  Fixed: 'rewards persistence and holds you until you master what it demands',
  Mutable: 'keeps you adapting and in motion — a place of transition, not arrival',
};

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function signOfLon(lon: number): string {
  const L = ((lon % 360) + 360) % 360;
  return SIGNS[Math.floor(L / 30) % 12];
}
function oppositeSign(sign: string): string {
  return SIGNS[(SIGNS.indexOf(sign) + 6) % 12];
}
function houseTheme(h: number): string {
  return HOUSE_THEMES[h] || 'this area of life';
}
function dominantOf<T extends string>(counts: Record<T, number>): T {
  return (Object.entries(counts) as [T, number][]).sort((a, b) => b[1] - a[1])[0][0];
}

// ── Natal context the caller builds once from getMyChartBodies ──────────────
export interface NatalContext {
  ascSign: string;
  bodies: Map<string, number>; // name → ecliptic longitude
}
export function buildNatalContext(chart: ChartData): NatalContext | null {
  const bodies = new Map(chart.bodies.map((b) => [b.name, b.longitude]));
  const ascLon = bodies.get('Ascendant');
  if (ascLon == null || !Number.isFinite(ascLon)) return null;
  return { ascSign: signOfLon(ascLon), bodies };
}

// ── Ruler natal condition ───────────────────────────────────────────────────
export interface RulerAspect { other: string; type: string; orb: number; }
export interface RulerCondition {
  planet: string;
  available: boolean;
  count: number;         // how many layer-signs this planet rules (repeat weight)
  sign?: string;
  house?: number;
  dignity?: 'domicile' | 'exaltation' | 'detriment' | 'fall' | 'peregrine';
  aspects?: RulerAspect[];
  strengthScore?: number;
  strengthLabel?: 'strong' | 'mixed' | 'challenged';
}

const ASPECTS: { type: string; angle: number; orb: number }[] = [
  { type: 'conjunction', angle: 0, orb: 8 },
  { type: 'opposition', angle: 180, orb: 8 },
  { type: 'trine', angle: 120, orb: 7 },
  { type: 'square', angle: 90, orb: 6 },
  { type: 'sextile', angle: 60, orb: 4 },
];
const ASPECTABLE = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

function dignityOf(planet: string, sign: string): RulerCondition['dignity'] {
  if (DOMICILE[planet]?.includes(sign)) return 'domicile';
  if (EXALTATION[planet] === sign) return 'exaltation';
  if (DOMICILE[planet]?.some((s) => oppositeSign(s) === sign)) return 'detriment';
  if (EXALTATION[planet] && oppositeSign(EXALTATION[planet]) === sign) return 'fall';
  return 'peregrine';
}

function rulerCondition(planet: string, count: number, ctx: NatalContext): RulerCondition {
  const lon = ctx.bodies.get(planet);
  if (lon == null || !Number.isFinite(lon)) return { planet, available: false, count };
  const sign = signOfLon(lon);
  const house = getHouseForSign(sign, ctx.ascSign);
  const dignity = dignityOf(planet, sign);

  const aspects: RulerAspect[] = [];
  for (const other of ASPECTABLE) {
    if (other === planet) continue;
    const olon = ctx.bodies.get(other);
    if (olon == null || !Number.isFinite(olon)) continue;
    let sep = Math.abs(((lon - olon) % 360 + 360) % 360);
    if (sep > 180) sep = 360 - sep;
    for (const a of ASPECTS) {
      const orb = Math.abs(sep - a.angle);
      if (orb <= a.orb) { aspects.push({ other, type: a.type, orb: +orb.toFixed(1) }); break; }
    }
  }

  let score = { domicile: 2, exaltation: 1, detriment: -2, fall: -1, peregrine: 0 }[dignity!];
  for (const a of aspects) {
    if (a.type === 'trine' || a.type === 'sextile') score += 1;
    else if (a.type === 'square' || a.type === 'opposition') score -= 1;
    else if (a.type === 'conjunction') score += BENEFICS.has(a.other) ? 1 : MALEFICS.has(a.other) ? -1 : 0;
  }
  const strengthLabel: RulerCondition['strengthLabel'] = score >= 2 ? 'strong' : score <= -2 ? 'challenged' : 'mixed';
  return { planet, available: true, count, sign, house, dignity, aspects, strengthScore: score, strengthLabel };
}

// ── House relationships ─────────────────────────────────────────────────────
export interface HouseRelation { a: number; b: number; kind: 'reinforcing' | 'supporting' | 'complementary' | 'opposing' | 'tension' | 'minor'; }
function houseRelation(a: number, b: number): HouseRelation['kind'] {
  let d = Math.abs(a - b); d = Math.min(d, 12 - d);
  if (d === 0) return 'reinforcing';
  if (d === 4) return 'supporting';   // trine
  if (d === 2) return 'complementary'; // sextile
  if (d === 6) return 'opposing';      // opposition
  if (d === 3) return 'tension';       // square
  return 'minor';
}

// ── The synthesized result ──────────────────────────────────────────────────
export interface LocationInterpretation {
  planet: string; angle: Angle;
  mode: 'present' | 'draconic' | 'progressed';
  karmicHotspot: boolean;
  natalSign: string; natalHouse: number;
  duadSign: string; duadHouse: number;
  compSign: string; compHouse: number;
  matrixSign: string; matrixHouse: number;
  houses: number[];
  relations: HouseRelation[];
  elements: { counts: Record<Element, number>; dominant: Element };
  modalities: { counts: Record<Modality, number>; dominant: Modality };
  rulers: { conditions: RulerCondition[]; dominant?: RulerCondition };
  patterns: { repeatedHouses: [number, number][]; repeatedSigns: [string, number][]; repeatedRulers: [string, number][] };
  /** Concrete predicted events for this spot — the full range, good and hard. */
  events: string[];
  weights: InterpretationWeights;
  narrative: string;
}

export interface LocationBand { duadSign: string; compendiumSign: string; matrixSign: string; }

export interface InterpretOptions {
  /** Grid mode supplies the anchored band; natal/draconic compute it from the
   *  planet's own (relocated-soul) longitude instead. */
  band?: LocationBand;
  angle?: Angle;
  /** 'present' = natal/grid predictive reading; 'draconic' = past-life reading;
   *  'progressed' = same predictive reading, framed as active RIGHT NOW. */
  mode?: 'present' | 'draconic' | 'progressed';
  /** Draconic only: the SAME planet's natal line also runs through here → the
   *  past-life theme is active in this life (a karmic hotspot). */
  karmicHotspot?: boolean;
  weights?: InterpretationWeights;
}

/**
 * Synthesize the full location reading for the tapped planet line. In grid mode
 * the caller passes the anchored `band`; in natal/draconic mode the band is the
 * planet's OWN duad/compendium/matrix (draconic mode uses the soul-rotated
 * longitude and a past-life voice).
 */
export function interpretLocation(
  ctx: NatalContext,
  planet: string,
  opts: InterpretOptions = {},
): LocationInterpretation | null {
  const natalLon = ctx.bodies.get(planet);
  if (natalLon == null || !Number.isFinite(natalLon)) return null;

  const mode = opts.mode || 'present';
  const angle: Angle = opts.angle || 'MC';
  const weights = opts.weights || DEFAULT_WEIGHTS;

  // The longitude whose duad/comp/matrix we read, and the sign we analyse.
  let bandLon = natalLon;
  if (mode === 'draconic') {
    const nodeLon = ctx.bodies.get('North Node');
    if (nodeLon == null || !Number.isFinite(nodeLon)) return null;
    bandLon = (((natalLon - nodeLon) % 360) + 360) % 360; // North Node → 0° Aries
  }
  const planetSign = signOfLon(bandLon); // natal sign (present) or soul sign (draconic)

  const f = opts.band && mode === 'present'
    ? { duadSign: opts.band.duadSign, compendiumSign: opts.band.compendiumSign, matrixSign: opts.band.matrixSign }
    : (() => { const d = getFullDuadCompendium(bandLon); return { duadSign: d.duadSign, compendiumSign: d.compendiumSign, matrixSign: d.matrixSign }; })();
  const duadSign = f.duadSign, compSign = f.compendiumSign, matrixSign = f.matrixSign;

  const natalSign = planetSign;
  const natalHouse = getHouseForSign(natalSign, ctx.ascSign);
  const duadHouse = getHouseForSign(duadSign, ctx.ascSign);
  const compHouse = getHouseForSign(compSign, ctx.ascSign);
  const matrixHouse = getHouseForSign(matrixSign, ctx.ascSign);

  const layerSigns = [natalSign, duadSign, compSign, matrixSign];
  const houses = [natalHouse, duadHouse, compHouse, matrixHouse];

  // Elements / modalities across the four layer-signs.
  const elemCounts = { Fire: 0, Earth: 0, Air: 0, Water: 0 } as Record<Element, number>;
  const modeCounts = { Cardinal: 0, Fixed: 0, Mutable: 0 } as Record<Modality, number>;
  for (const s of layerSigns) { elemCounts[ELEMENT[s]]++; modeCounts[MODALITY[s]]++; }
  const domElement = dominantOf(elemCounts);
  const domModality = dominantOf(modeCounts);

  // House relationships among the four active houses.
  const relations: HouseRelation[] = [];
  for (let i = 0; i < houses.length; i++)
    for (let j = i + 1; j < houses.length; j++)
      relations.push({ a: houses[i], b: houses[j], kind: houseRelation(houses[i], houses[j]) });

  // Rulers of each layer sign, with repeat-weighting.
  const rulerNames = layerSigns.map((s) => RULERS[s] || s);
  const rulerCounts = new Map<string, number>();
  for (const r of rulerNames) rulerCounts.set(r, (rulerCounts.get(r) || 0) + 1);
  const conditions = Array.from(rulerCounts.entries())
    .map(([p, c]) => rulerCondition(p, c, ctx))
    .sort((a, b) => b.count - a.count || (b.strengthScore ?? 0) - (a.strengthScore ?? 0));
  const dominant = conditions.find((c) => c.count >= 2) || conditions[0];

  // Recurring patterns.
  const houseCounts = new Map<number, number>();
  for (const h of houses) houseCounts.set(h, (houseCounts.get(h) || 0) + 1);
  const signCounts = new Map<string, number>();
  for (const s of layerSigns) signCounts.set(s, (signCounts.get(s) || 0) + 1);
  const repeatedHouses = Array.from(houseCounts.entries()).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]);
  const repeatedSigns = Array.from(signCounts.entries()).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]);
  const repeatedRulers = Array.from(rulerCounts.entries()).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]);

  const karmicHotspot = !!opts.karmicHotspot;
  // Concrete predicted events (present & progressed) — the full range, good & hard.
  const events = mode === 'draconic' ? [] : (EVENTS[planet]?.[angle] || []);
  const narrative = mode === 'draconic'
    ? composeDraconic({ planet, angle, soulSign: planetSign, domElement, domModality, karmicHotspot })
    : compose({
        planet, angle, natalSign, natalHouse, duadSign, duadHouse, compSign, compHouse,
        matrixSign, matrixHouse, relations, domElement, elemCounts, domModality,
        modeCounts, dominant, repeatedHouses, repeatedSigns, repeatedRulers, weights,
        timing: mode === 'progressed',
      });

  return {
    planet, angle, mode, karmicHotspot,
    natalSign, natalHouse, duadSign, duadHouse, compSign, compHouse, matrixSign, matrixHouse,
    houses, relations,
    elements: { counts: elemCounts, dominant: domElement },
    modalities: { counts: modeCounts, dominant: domModality },
    rulers: { conditions, dominant },
    patterns: { repeatedHouses, repeatedSigns, repeatedRulers },
    events,
    weights, narrative,
  };
}

// ── Narrative composer — plain-language, emotional, PREDICTIVE ───────────────
// Rules: no house numbers, no sign names, no aspect/dignity jargon in the prose.
// Lead with what could HAPPEN to you here. Speak to *you*. Be a little bold, but
// stay true to the real meaning of the planet/sign/house keywords underneath.
function cap(s: string): string { return s ? s[0].toUpperCase() + s.slice(1) : s; }
function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] || '';
  if (items.length === 2) return `${items[0]}, and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function compose(x: {
  planet: string; angle: Angle; natalSign: string; natalHouse: number;
  duadSign: string; duadHouse: number; compSign: string; compHouse: number;
  matrixSign: string; matrixHouse: number; relations: HouseRelation[];
  domElement: Element; elemCounts: Record<Element, number>;
  domModality: Modality; modeCounts: Record<Modality, number>;
  dominant?: RulerCondition;
  repeatedHouses: [number, number][]; repeatedSigns: [string, number][]; repeatedRulers: [string, number][];
  weights: InterpretationWeights;
  timing?: boolean; // progressed mode — frame it as active NOW
}): string {
  const P = x.planet;
  const arena = ANGLE_AREA[x.angle] || HOUSE_LIFE[x.natalHouse];
  const parts: string[] = [];

  // 0. Timing intro (progressed only) — this is switching on right now.
  if (x.timing) {
    parts.push(`**This one is live for you right now.** Your chart has progressed a planet onto this exact spot — so the theme below isn't a lifelong backdrop, it's switching on during *this* chapter of your life.`);
  }

  // 1. THE HEADLINE PREDICTION (planet × angle) — bold hook, then what happens.
  const pred = PREDICTIONS[P]?.[x.angle];
  if (pred) {
    const i = pred.indexOf('. ');
    parts.push(i > 0 ? `**${pred.slice(0, i + 1)}** ${pred.slice(i + 2)}` : `**${pred}**`);
  } else {
    parts.push(`**This is a place that stirs up ${arena}.** Something in you comes alive here, and it won't let you stay the same.`);
  }

  // 2. Why it lands on YOU differently — plain trait + your tender spot.
  parts.push(
    `It won't hit you the way it hits anyone else, though. You're ${SIGN_TRAIT[x.natalSign] || 'wired your own way'}, ` +
    `so this place reaches you right where you feel things most: ${HOUSE_LIFE[x.natalHouse]}.`,
  );

  // 3. What else it could touch — the finer layers as plain predictions, deduped.
  //    Exclude the natal house AND any repeated house (covered in para 4) so
  //    nothing echoes across paragraphs.
  const seenHouses = new Set<number>([x.natalHouse, ...x.repeatedHouses.map(([h]) => h)]);
  const spill = [x.duadHouse, x.compHouse, x.matrixHouse].filter((h) => { if (seenHouses.has(h)) return false; seenHouses.add(h); return true; });
  const allLayersAgree = x.duadSign === x.compSign && x.compSign === x.matrixSign;
  if (allLayersAgree && !spill.length) {
    parts.push(`And everything here keeps pointing at the same thing — there's no dodging it while you're in this place. It'll keep coming up until you deal with it.`);
  } else if (spill.length) {
    const preds = spill.map((h) => HOUSE_PREDICT[h]).filter(Boolean);
    parts.push(`And it won't stay in one lane. While you're here, ${joinList(preds)}.`);
  } else {
    parts.push(`Everything here keeps circling back to the same corner of your life, so there's no half-measure — this place asks for all of you.`);
  }

  // 4. The push-and-pull between the areas — plain, emotional.
  const priority: HouseRelation['kind'][] = ['reinforcing', 'opposing', 'tension', 'supporting', 'complementary'];
  const strongest = x.relations.filter((r) => r.kind !== 'minor')
    .sort((a, b) => priority.indexOf(a.kind) - priority.indexOf(b.kind))[0];
  if (x.repeatedHouses.length) {
    const [h] = x.repeatedHouses[0];
    parts.push(`So much of this place points at ${HOUSE_LIFE[h]} that it becomes the whole story — you won't be able to look away from it.`);
  } else if (strongest && strongest.a !== strongest.b) {
    const A = HOUSE_LIFE[strongest.a], B = HOUSE_LIFE[strongest.b];
    const phrase: Record<string, string> = {
      reinforcing: `two sides of this place push the very same button, so it hits you twice as hard`,
      supporting: `${A} and ${B} feed each other here — a win in one lifts the other`,
      complementary: `${A} and ${B} keep opening doors for each other the moment you move`,
      opposing: `you'll feel torn between ${A} and ${B} — this place makes you choose, or learn to hold both at once`,
      tension: `${A} and ${B} rub against each other here, and that friction is exactly what forces you to grow`,
    };
    parts.push(cap(phrase[strongest.kind]) + '.');
  }

  // 5. The emotional weather (element + modality) — no labels.
  parts.push(`${cap(ELEMENT_ATMOSPHERE[x.domElement])}, and it ${MODALITY_EFFECT[x.domModality]}.`);

  // 6. The undercurrent (dominant ruler) — plain theme + light personalization.
  if (x.dominant) {
    const theme = RULER_THEME[x.dominant.planet];
    if (theme) {
      const tail = x.dominant.available
        ? (x.dominant.strengthLabel === 'strong'
            ? ' — and that comes so naturally to you it can take over fast'
            : x.dominant.strengthLabel === 'challenged'
              ? " — and it's something you've always had to wrestle with, which is exactly the nerve this place presses on"
              : '')
        : '';
      parts.push(`Underneath all of it runs one steady current: a ${theme}. It keeps showing up here${tail}.`);
    }
  }

  // 7. Close — a forward-looking, emotional prediction (a little risky).
  if (x.timing) {
    parts.push(
      `This is timely, not permanent — the pull is strongest in this chapter and eases as your chart moves on. ` +
      `If a place like this is calling you now, that's not random. Go toward ${arena}, because it's ripe right now.`,
    );
  } else {
    parts.push(
      `Come here, and life will keep nudging you toward ${arena} whether you feel ready or not — the beautiful parts and the hard parts together. ` +
      `Some people find exactly what they were missing in a place like this. Others get shaken loose from what they thought they wanted. Rarely does anyone leave unchanged.`,
    );
  }

  return parts.join('\n\n');
}

// ── Draconic composer — the PAST-LIFE reading (soul chart) ───────────────────
// Evocative, past-tense, spiritual/reflective — never a literal claim. The
// draconic line = where your soul's imprint falls on Earth.
function composeDraconic(x: {
  planet: string; angle: Angle; soulSign: string;
  domElement: Element; domModality: Modality; karmicHotspot: boolean;
}): string {
  const P = x.planet;
  const parts: string[] = [];

  // 1. The past-life scene (planet × angle), bold hook + detail.
  const scene = PAST_LIFE[P]?.[x.angle];
  if (scene) {
    const i = scene.indexOf('. ');
    parts.push(i > 0 ? `**${scene.slice(0, i + 1)}** ${scene.slice(i + 2)}` : `**${scene}**`);
  } else {
    parts.push(`**Your soul may have known this place in another life.** Something here reaches back further than this lifetime.`);
  }

  // 2. Who the soul was (draconic sign, plain).
  parts.push(`The soul that walked here was ${SIGN_TRAIT[x.soulSign] || 'wired its own way'} — and that same thread still runs quietly through you today.`);

  // 3. Why it may feel familiar (mood).
  parts.push(`If this place ever tugs at you for no reason you can name, this could be why: ${ELEMENT_ATMOSPHERE[x.domElement]}. That old feeling never fully faded.`);

  // 4. What carried forward (karmic).
  parts.push(`What you seem to have carried out of that life and into this one: ${KARMIC_CARRY[P] || 'a lesson your soul is still working through'}.`);

  // 5. Karmic hotspot — the past-life theme is active in THIS life.
  if (x.karmicHotspot) {
    parts.push(`**And this is no faint echo.** Your ${P} line from *this* life runs right through here too — the same theme, then and now. Your soul didn't just pass through here; it carried the unfinished business forward, and you're living it out again.`);
  }

  // 6. Close — reflective, a little haunting.
  parts.push(`Stand here — or even just picture yourself here — and notice what stirs. Some places aren't new to us at all. They're returns.`);

  return parts.join('\n\n');
}
