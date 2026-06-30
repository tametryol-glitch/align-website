/**
 * Hidden Zodiac — structured interpretation concepts (Phase 4).
 *
 * Interpretation is built from STRUCTURED DATA, not one giant hardcoded
 * paragraph database. Each layer answers a distinct question (see the spec's
 * interpretation architecture), and the synthesizer in `hiddenZodiacInterpreter`
 * weaves these concepts into prose. Sign and house meaning is reused from the
 * canonical `duadCompendium` module so the Hidden Zodiac never contradicts the
 * rest of Align.
 */

import { SIGN_THEMES, HOUSE_THEMES } from './duadCompendium';

export { SIGN_THEMES, HOUSE_THEMES };

/** What psychological / life function does a planet or point operate? */
export interface PlanetFunction {
  /** One-line function statement ("identity, vitality, and the will to become"). */
  fn: string;
  /** A verb phrase used to drive sentences ("forge an identity"). */
  verb: string;
  /** Short keyword cluster for variety. */
  keywords: string[];
  /** Whether romantic/relational content is relevant for this body. */
  relational: boolean;
  /** Whether career/money content is relevant for this body. */
  vocational: boolean;
}

export const PLANET_FUNCTIONS: Record<string, PlanetFunction> = {
  Sun: { fn: 'identity, vitality, and the will to become fully oneself', verb: 'build a self', keywords: ['purpose', 'confidence', 'visibility'], relational: false, vocational: true },
  Moon: { fn: 'emotional needs, instinct, and the search for security', verb: 'find safety', keywords: ['feeling', 'memory', 'habit', 'belonging'], relational: true, vocational: false },
  Mercury: { fn: 'perception, thought, and the way the mind names the world', verb: 'make sense of things', keywords: ['language', 'learning', 'logic', 'exchange'], relational: false, vocational: true },
  Venus: { fn: 'values, attraction, and the capacity for pleasure and relating', verb: 'draw close to what it loves', keywords: ['taste', 'worth', 'affection', 'harmony'], relational: true, vocational: false },
  Mars: { fn: 'desire, assertion, and the drive to act', verb: 'pursue and defend', keywords: ['energy', 'conflict', 'courage', 'will'], relational: true, vocational: true },
  Jupiter: { fn: 'meaning, growth, and the reach toward something larger', verb: 'expand and believe', keywords: ['opportunity', 'faith', 'vision', 'generosity'], relational: false, vocational: true },
  Saturn: { fn: 'structure, discipline, and the slow construction of mastery', verb: 'build something that lasts', keywords: ['limit', 'responsibility', 'authority', 'time'], relational: false, vocational: true },
  Uranus: { fn: 'individuation, insight, and the break from inherited form', verb: 'break free and innovate', keywords: ['freedom', 'disruption', 'originality'], relational: false, vocational: true },
  Neptune: { fn: 'imagination, longing, and the dissolving of boundaries', verb: 'dissolve into something greater', keywords: ['dream', 'compassion', 'illusion', 'art'], relational: true, vocational: false },
  Pluto: { fn: 'power, depth, and the cycle of destruction and renewal', verb: 'transform from underneath', keywords: ['control', 'survival', 'intensity', 'rebirth'], relational: true, vocational: true },
  Vesta: { fn: 'focus, devotion, and the keeping of an inner flame', verb: 'devote itself to what matters', keywords: ['dedication', 'integrity', 'service', 'sacred work'], relational: false, vocational: true },
  Juno: { fn: 'commitment, fairness, and the terms of true partnership', verb: 'bind itself in fair union', keywords: ['loyalty', 'agreement', 'equality', 'contract'], relational: true, vocational: false },
  Chiron: { fn: 'the meeting point of wound and healing', verb: 'turn a wound into medicine', keywords: ['hurt', 'mentorship', 'repair'], relational: true, vocational: false },
  Ceres: { fn: 'nurture, sustenance, and the rhythm of giving and letting go', verb: 'nourish and release', keywords: ['care', 'cycles', 'loss', 'return'], relational: true, vocational: false },
  Pallas: { fn: 'pattern recognition, strategy, and creative intelligence', verb: 'see the pattern and design a path', keywords: ['strategy', 'craft', 'justice'], relational: false, vocational: true },
  'North Node': { fn: 'the growth direction that feels unfamiliar but necessary', verb: 'grow toward the unfamiliar', keywords: ['development', 'stretch', 'destiny'], relational: false, vocational: true },
  'South Node': { fn: 'innate, over-practiced skill that is comfortable to lean on', verb: 'rest in old mastery', keywords: ['comfort', 'instinct', 'release'], relational: false, vocational: false },
  Ascendant: { fn: 'the outward style and the body\'s first approach to the world', verb: 'meet the world', keywords: ['approach', 'appearance', 'instinctive style'], relational: true, vocational: false },
  Descendant: { fn: 'what is sought in others and in close partnership', verb: 'seek its complement', keywords: ['partner', 'projection', 'balance'], relational: true, vocational: false },
  Midheaven: { fn: 'vocation, public role, and the direction of the life\'s arc', verb: 'reach toward a public role', keywords: ['career', 'reputation', 'calling'], relational: false, vocational: true },
  'Imum Coeli': { fn: 'roots, private foundations, and where the self retreats', verb: 'return to its foundations', keywords: ['home', 'origin', 'privacy'], relational: false, vocational: false },
};

/** Generic fallback so unusual points still get an honest, non-fabricated read. */
export const GENERIC_FUNCTION: PlanetFunction = {
  fn: 'a specific current in the psyche',
  verb: 'express its theme',
  keywords: ['pattern', 'tendency'],
  relational: false,
  vocational: false,
};

export function planetFunction(name: string): PlanetFunction {
  return PLANET_FUNCTIONS[name] ?? GENERIC_FUNCTION;
}

/** Condition descriptors for a ruler's placement, used in the ruler synthesis. */
export const ANGULARITY_EFFECT: Record<'angular' | 'succedent' | 'cadent', string> = {
  angular: 'acts with force and visibility — its agenda drives the placement directly',
  succedent: 'works steadily to stabilise and resource what the placement begins',
  cadent: 'operates behind the scenes, through adjustment, learning, and exchange',
};

/** How the activated house "channels" the deeper layers — short connective stems. */
export function houseFunction(house: number | null): string {
  if (!house) return 'an area of life that resolves once an Ascendant is known';
  return HOUSE_THEMES[house] ?? 'a specific area of life';
}

// ── Behavioural profiles — the raw material for a reading that names YOU ─────
//
// Each field is a finished second-person sentence (or noun phrase, for `drive`)
// so the synthesizer can drop them straight into prose. The point is specifics
// people recognise — patterns, traps, hidden needs — not adjective lists.

export interface SignBehavior {
  /** Bold second-person identity sentence. */
  you: string;
  /** The engine underneath — a lowercase noun phrase ("a need for control…"). */
  drive: string;
  /** The recurring life pattern this creates. */
  pattern: string;
  /** How other people experience you. */
  others: string;
  /** Where you sabotage yourself. */
  trap: string;
  /** The hidden need or fear. */
  secret: string;
  /** The integrated / grown expression. */
  mature: string;
  /** In love and closeness. */
  love: string;
  /** At work and with money. */
  work: string;
  /** A concrete strength most single-sign descriptions miss. */
  power: string;
}

export const SIGN_BEHAVIOR: Record<string, SignBehavior> = {
  Aries: {
    you: "You move first and think second. Stillness feels like losing, so you start things — fast, hard, head-on — and figure out the rest on the way.",
    drive: "an engine that needs a target; without a goal or a fight to push against you get restless and pick one just to feel alive",
    pattern: "You charge in, win the opening, then lose interest right when patience would pay off — so you keep starting and rarely finish.",
    others: "People feel your heat immediately. They find you brave and a little exhausting, and they either follow you or get out of the way.",
    trap: "You confuse anger with strength and speed with progress; the thing you wreck is usually the thing you didn't sleep on for one night.",
    secret: "Under the bravado you're afraid of being weak or dependent, so you'd rather do it alone than risk needing anyone.",
    mature: "When you grow into it you keep the courage but add aim — you pick fewer fights and actually land them.",
    love: "You pursue hard and cool fast; you want someone who matches your fire without smothering it, and you mistake calm for boredom.",
    work: "You're the one who starts the thing, not the one who's still running it in year ten. Pair with a finisher and you're unstoppable.",
    power: "You can create momentum from nothing and act in a crisis while everyone else is still deciding.",
  },
  Taurus: {
    you: "You move at your own pace and refuse to be rushed. You build slowly, hold on tightly, and trust what you can touch over what you're told.",
    drive: "a deep need for security — money, comfort, a body and a life that feel safe — because somewhere you learned things can be taken away",
    pattern: "You wait too long to start and far too long to let go; you stay in jobs, homes, and relationships past their expiry because leaving costs more than staying hurts.",
    others: "People find you calming and solid, then immovable. They lean on you until they hit your stubbornness and realise you will not be moved.",
    trap: "You mistake comfort for happiness and owning for loving, and you'll defend a rut simply because it's yours.",
    secret: "You're quietly afraid that if you let go of what you have, nothing better is coming.",
    mature: "When you grow into it you hold things loosely enough to enjoy them — security becomes a base you build from, not a wall you hide behind.",
    love: "You love steadily and physically; you show it by providing and staying. You're slow to commit and devastating to lose.",
    work: "You outlast everyone. You won't chase the shiny thing, but what you build is still standing when theirs has folded.",
    power: "You provide a steadiness people build their lives around, and you endure pressure that breaks faster people.",
  },
  Gemini: {
    you: "Your mind never sits down. You're curious about everything, bored by anything for too long, and you think out loud — talking is how you find out what you believe.",
    drive: "a hunger for input; sameness and silence feel like suffocation, so you collect people, ideas, and open tabs you'll never close",
    pattern: "You start ten things, get the gist, and move on before mastery — so you know a little about everything and feel like a fraud about all of it.",
    others: "People find you quick, funny, and easy to talk to, then wonder which version of you is real, because you become whoever's in the room.",
    trap: "You talk yourself out of your feelings; cleverness becomes the place you hide from what's actually going on inside you.",
    secret: "You're afraid that if you stopped moving and performing, there'd be no solid 'you' underneath.",
    mature: "When you grow into it you go deep on a few things instead of skating across everything, and you let yourself feel before you explain.",
    love: "You need mental spark before anything; boredom is your dealbreaker. You connect through words and drift when the conversation dies.",
    work: "You're the connector and the translator — the one who saw the link nobody else did. Routine kills you; variety is your fuel.",
    power: "You can learn anything fast, explain it to anyone, and connect ideas and people nobody else thought to put together.",
  },
  Cancer: {
    you: "You feel everything first and think about it later. You read a room before anyone speaks and carry other people's moods home like they're your own.",
    drive: "a need to belong and to build a safe place — for yourself and everyone you've quietly adopted as family",
    pattern: "You give and give, wait to be cared for the way you care, then go quiet and resentful when no one notices — and call the withdrawal 'fine.'",
    others: "People feel mothered and safe around you, then feel the undertow — your moods set the weather and they learn to tiptoe.",
    trap: "You use guilt and silence instead of words; you'd rather go cold than say 'you hurt me.'",
    secret: "Under the caretaking is a fear of being left, so you make yourself indispensable and call it love.",
    mature: "When you grow into it you ask for what you need out loud and stop testing people to see whether they'll stay.",
    love: "You bond deep and fast and never fully release anyone you've loved. You need to feel safe before you open, and you remember everything.",
    work: "You thrive where you can nurture something — people, a brand, a place. You take work personally, which is your gift and your wound.",
    power: "You can sense what someone needs before they say it and make safety so real that people settle just by being near you.",
  },
  Leo: {
    you: "You were built to be seen. You bring warmth and drama into a room, you want your life to mean something, and you'd rather be disliked than ignored.",
    drive: "a need for recognition sitting on top of a real fear of being ordinary or invisible",
    pattern: "You pour yourself out generously, then crash when the applause doesn't come — and you read silence as rejection even when it isn't.",
    others: "People are drawn to your warmth and confidence, then bruise against your pride the moment they forget to acknowledge you.",
    trap: "You make it about you when it isn't, and you'd rather perform strength than admit you're hurt.",
    secret: "Under the big presence, you're not sure you'd be loved if you ever stopped being impressive.",
    mature: "When you grow into it you shine to light others up rather than to be validated, and you find a worth that needs no audience.",
    love: "You love loyally and theatrically and give your whole heart; you need to feel adored. Indifference, not conflict, is what kills it.",
    work: "You lead, you inspire, you put your name on it. You need to feel proud of the work and seen for it, or you wilt.",
    power: "You can walk into a cold room and warm it, and give people permission to be bigger than they thought they were allowed to be.",
  },
  Virgo: {
    you: "You see what's wrong before you see what's right. You're wired to improve, fix, and refine — yourself most of all — and 'good enough' physically itches.",
    drive: "a need to be useful and to get it right, because being competent feels safer than being merely loved",
    pattern: "You over-prepare, self-edit before anyone sees you, and burn out doing invisible work no one asked for — then wonder why you feel unappreciated.",
    others: "People rely on you completely and forget to thank you; they feel your standards as quiet judgement even when you're hardest on yourself.",
    trap: "You confuse criticism with care and perfection with worth, and you'll pick a good thing apart hunting for the flaw.",
    secret: "Under the competence is a fear that you're fundamentally not enough — that if you stop fixing, you'll be found out.",
    mature: "When you grow into it you serve from overflow instead of anxiety, and you let things be eighty-five percent and still good.",
    love: "You show love by doing — fixing, helping, remembering the details. You struggle to receive it and you nitpick what you're most scared to lose.",
    work: "You're the one who catches the error and carries the competence a whole system quietly runs on. You undercharge and overdeliver until you learn your value.",
    power: "You can take a mess and make it work, catch the flaw everyone else missed, and be trusted with the details that actually matter.",
  },
  Libra: {
    you: "You read other people instinctively and shape yourself to keep the peace. You want fairness, beauty, and ease, and open conflict makes you physically uncomfortable.",
    drive: "a need for connection and approval so strong you'll trade your own preference to avoid someone being upset with you",
    pattern: "You merge with whoever you're with, lose track of what you actually want, then resent them for a self-abandonment they never asked for.",
    others: "People find you charming, easy, and diplomatic, then can't work out what you really think — because you barely tell yourself.",
    trap: "You call indecision 'keeping options open' and people-pleasing 'being nice,' and you dodge the honest fight that would actually fix things.",
    secret: "You're afraid that if you stopped being agreeable, you'd be left alone.",
    mature: "When you grow into it you learn that real harmony survives honesty — you state your preference and let people be briefly displeased.",
    love: "You're at your best in partnership and your worst alone; you'll over-give and keep score in silence. You need a mirror, not a project.",
    work: "You're the one who smooths the room, closes the deal, makes it elegant. You stall on decisions and confrontation you can't charm past.",
    power: "You can find the fair answer in a fight everyone else made personal, and make people and rooms feel genuinely considered.",
  },
  Scorpio: {
    you: "You run deep and private. You trust slowly, feel intensely, and you'd rather know the worst truth than a comfortable lie. Nothing about you is casual.",
    drive: "a need for control and depth that came from learning early that surfaces lie and people leave",
    pattern: "You test people before you trust them, hold back to stay safe, then feel unseen behind the very walls you built — and when betrayed, you cut off completely.",
    others: "People feel your intensity and your read on them; they're magnetised and a little afraid, and they sense you're holding something back.",
    trap: "You confuse control with safety and silence with strength; you'd sooner destroy a thing than be vulnerable inside it.",
    secret: "Under the armour you want to be fully known and are terrified of what happens if you let someone all the way in.",
    mature: "When you grow into it you let yourself be seen on purpose, and you use your intensity to transform instead of to control.",
    love: "All or nothing. You bond at a cellular level and never forget a betrayal. You want total honesty and total loyalty — and you'll test for both.",
    work: "You see what's really happening under the politics. You're relentless once committed and do your best work in depth, crisis, or the thing everyone avoids.",
    power: "You can stay calm and strategic where others panic, see through people instantly, and do your best work in the situations everyone else flees.",
  },
  Sagittarius: {
    you: "You need room to roam — in your body, your mind, your beliefs. You chase meaning and the next horizon, and the fastest way to lose you is to fence you in.",
    drive: "a hunger for freedom and a bigger meaning; the present always feels a little too small",
    pattern: "You're already half-out the door of wherever you are, certain the real thing is somewhere else — so you keep moving and rarely arrive.",
    others: "People find you fun, blunt, and inspiring, then get burned when your restlessness reads as unreliability.",
    trap: "You bolt the moment things get heavy and call it freedom when it's actually avoidance.",
    secret: "You're afraid that staying — with a person, a place, a promise — means the adventure is over.",
    mature: "When you grow into it you find the depth inside commitment instead of fleeing it, and you learn the journey can have a home base.",
    love: "You need a co-adventurer, not a cage. You're generous and honest, and you mistake the comedown after the high for 'this isn't right.'",
    work: "You're the visionary, the teacher, the big-picture one. Detail and routine choke you; meaning and movement light you up.",
    power: "You can see the way out when others are lost in the weeds, and your honesty and faith pull people toward something larger than they'd reach for alone.",
  },
  Capricorn: {
    you: "You play the long game. You're serious, self-reliant, and built to climb — you'd rather earn it the hard way than be handed anything, and you trust results over feelings.",
    drive: "a need for mastery and security forged by an early sense that no one was coming to save you, so you'd better become someone who can",
    pattern: "You take on the weight, never ask for help, and quietly resent that you're always the responsible one — then armour up harder.",
    others: "People respect you and lean on you, then find you cold; they don't see how much you're carrying because you'd never show it.",
    trap: "You measure your worth by output and file vulnerability under weakness, so you achieve and achieve and still feel it isn't enough.",
    secret: "Under the control is a fear that if you stop performing and providing, you're worthless and unlovable.",
    mature: "When you grow into it you learn you're allowed to rest and be loved for who you are, not only for what you produce.",
    love: "You commit seriously and show love through reliability, not words. You're slow to open and steady once you do; you need respect before romance.",
    work: "You're the one who builds the thing that lasts. Ambitious, disciplined, patient — you'll be running it when the flashy ones have flamed out.",
    power: "You can carry weight that flattens other people, and quietly build the thing that's still standing in ten years.",
  },
  Aquarius: {
    you: "You think for yourself and stand a little apart. You see the system everyone's stuck inside, you bristle at being told what to do, and you'd rather be free than belong.",
    drive: "a need for autonomy, plus a quiet wound about not fitting in that powers your urge to do it your own way",
    pattern: "You detach when things get emotional, reason your way around your feelings, and keep people at arm's length while secretly longing to be let in.",
    others: "People find you original, principled, and a bit cool; they're not sure how to get close, because you live one step back.",
    trap: "You confuse distance with freedom and rebellion with identity, rejecting things on principle even when you actually want them.",
    secret: "Under the detachment you fear that if you really needed people, you'd be let down — so you decide you don't.",
    mature: "When you grow into it you stay yourself and let people in — belonging without disappearing into the group.",
    love: "You need a partner who's also a friend and respects your space. You connect through ideas and freedom, and you go cold when you feel owned.",
    work: "You're the innovator who questions why it's done this way. You need autonomy and a cause; being micromanaged is death to you.",
    power: "You can see the system everyone's trapped in and imagine a genuinely different one, and you hold your ground when the crowd turns.",
  },
  Pisces: {
    you: "You feel the whole room and can't always tell where you end and other people begin. You're imaginative, compassionate, and porous, and the hard edges of the world genuinely hurt you.",
    drive: "a longing to dissolve into something bigger — love, art, spirit, sometimes escape — because ordinary reality feels too sharp",
    pattern: "You absorb everyone's feelings, lose yourself in moods and relationships, then slip away — into fantasy, sleep, a story, a substance — when it's too much.",
    others: "People feel understood and soothed by you, then can't pin you down; you're everywhere and nowhere, and boundaries blur around you.",
    trap: "You play the victim or quietly vanish instead of facing it, and you'll romanticise a situation rather than see it clearly.",
    secret: "Under the softness you fear that having firm boundaries or wants makes you selfish, so you allow yourself neither.",
    mature: "When you grow into it you keep the compassion but build a self with edges — you feel everything and still stay you.",
    love: "You love selflessly and merge completely; you'll give too much and call drowning 'devotion.' You need someone who won't take advantage of how much you'll give.",
    work: "You're the artist, the healer, the imaginative one. Structure helps you; you do magic when someone else holds the practical frame so you can dream.",
    power: "You can feel and create what others can't put into words, and meet people in their pain without flinching.",
  },
};

/** Second-person phrase for what part of a person each planet/point governs. */
export const PLANET_DOMAIN: Record<string, string> = {
  Sun: "your core self — who you are at the centre and what you're here to become",
  Moon: "your emotional core — what you need to feel safe and how you self-soothe",
  Mercury: "your mind — how you think, talk, and make sense of things",
  Venus: "what you value and how you love — your taste, your worth, what pulls you in",
  Mars: "your drive — how you chase what you want and how you fight",
  Jupiter: "where you reach and grow — your faith, your luck, your appetite for more",
  Saturn: "where you're tested and built — your discipline, your fear, your mastery",
  Uranus: "where you break the mould — your need to be free and your own person",
  Neptune: "where you dissolve and dream — your imagination, your spirituality, your escape",
  Pluto: "where you're remade — your power, your obsessions, and what you survive",
  Vesta: "where you devote yourself — your focus and your sacred work",
  Juno: "how you commit — what you actually need in a true partnership",
  Chiron: "your deepest wound and where you end up healing others",
  Ceres: "how you nurture, and what you keep losing and getting back",
  Pallas: "how you strategise and create",
  'North Node': "where you're growing toward — the unfamiliar edge that stretches you",
  'South Node': "what comes too easily — the comfort zone you over-rely on",
  Ascendant: "the face you lead with — how you come across before you say a word",
  Descendant: "what you look for in other people",
  Midheaven: "your public role — where the world watches you",
  'Imum Coeli': "your private roots — where you retreat and who you are at home",
};

export function planetDomain(name: string): string {
  return PLANET_DOMAIN[name] ?? 'this part of you';
}

export function signBehavior(sign: string): SignBehavior | undefined {
  return SIGN_BEHAVIOR[sign];
}
