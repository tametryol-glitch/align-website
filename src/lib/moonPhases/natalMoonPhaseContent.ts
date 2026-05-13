/**
 * Natal Moon Phase -- Content Library
 *
 * Provides the 11 content blocks the UI renders for each birth phase.
 * Uses a layered composition:
 *
 *   base_phase_content
 *   + sign_overlay (one sentence per Moon sign)
 *   + house_overlay (one sentence per Moon house)
 *   + aspect_overlay (one sentence per tight hard aspect)
 *
 * This produces genuinely distinct readings without needing thousands
 * of unique narratives. Writing is emotionally grounded and specific.
 *
 * Ported from align-app for web use. No React Native dependencies.
 */

import type { NatalMoonPhase, LunarPhaseKey } from './natalMoonPhase';

export interface NatalPhaseReading {
  headline: string;            // Short identity phrase
  summary: string;             // One-paragraph overview
  characterLong: string;       // Multi-paragraph long-form character
  emotionalRhythm: string;     // How they process emotion
  strengths: string[];         // 3-5 bullets
  shadow: string[];            // 3-5 bullets
  beginnings: string;          // How they handle starts
  pressure: string;            // How they handle conflict / crisis
  closure: string;             // How they handle endings
  loveWorkInner: string;       // Love, work style, inner life
  growth: string;              // Growth advice
}

// ── Base phase content ─────────────────────────────────────────────

const PHASE_BASE: Record<LunarPhaseKey, NatalPhaseReading> = {
  new: {
    headline: 'The Instinctive Beginner',
    summary:
      'Born when the Moon was new — invisible, merged with the Sun — you are a subjective, spontaneous, instinct-driven soul. Life for you starts from the inside out. You are not here to inherit a blueprint. You are here to begin something that does not yet exist.',
    characterLong:
      'You move from a place most people cannot see. Your choices can look impulsive or half-formed from the outside, but they come from a deep, almost animal certainty — a knowing that this is the direction, even if you cannot yet articulate why.\n\nBecause you were born at the dark of the moon, the external world reflects very little back to you. You have to trust your own signal. This can make you seem self-absorbed, when really you are tuned to a frequency only you can hear.\n\nYou carry raw potential. What you start may not fully bloom in your lifetime — but the very act of starting is your purpose.',
    emotionalRhythm:
      'Your emotions come in waves of pure impulse. You feel strongly in the moment, then the feeling releases and you move on. You are not designed to dwell. What other people call "getting over things quickly" is really your emotional metabolism doing what it is built to do.',
    strengths: [
      'Fierce originality — you see beginnings everywhere',
      'Pure instinct that bypasses overthinking',
      'Ability to launch into something new without external permission',
      'Magnetic personal energy when aligned',
    ],
    shadow: [
      'Acting before understanding the consequences',
      'Losing interest once the novelty fades',
      'Over-identifying with whatever you just started',
      'Difficulty building on what others have laid down',
    ],
    beginnings:
      'Beginnings are your natural state. You start things with less hesitation than almost anyone. The risk is starting so many that none reach completion — the art is learning to commit to one seed through its whole cycle.',
    pressure:
      'Under pressure you tend to act first and process later. This is your superpower in fast-moving situations and your Achilles heel in nuanced ones. Learn to insert a breath between impulse and action for decisions that affect other people.',
    closure:
      'Closure can feel foreign. You are built for forward motion. Endings work best when you name them out loud — write the last chapter down, say goodbye to the place, make the farewell real — so the part of you that is already sprinting ahead can leave the old chapter fully behind.',
    loveWorkInner:
      'In love, you fall fast and deep on pure magnetism. In work, you thrive as a founder, starter, or first-mover — not as someone refining an existing system. Your inner life is vivid, private, and largely non-verbal: you know things before you can explain them.',
    growth:
      'Your growth edge is finishing. Not every seed you plant is meant to flower, but the ones that resonate deserve your whole arc of care. Pick a few and see them through. The satisfaction of completion will change how you live.',
  },

  waxing_crescent: {
    headline: 'The Emerging Fighter',
    summary:
      'You were born when the Moon had just emerged from the darkness — a thin sliver pushing against the memory of the past. You came into life already fighting for your right to exist, and that quiet, persistent forward motion has shaped every corner of you.',
    characterLong:
      'There is a faint friction at your core — a sense that you have to earn your ground. You feel the pull of the past (family expectations, old patterns, inherited weight) but also the pull of what you are becoming, and these two pulls do not always agree.\n\nPeople born at this phase often describe feeling like an outsider inside their own origin story. You are building something your ancestors did not imagine. That takes courage, and it takes grit.\n\nYour growth happens through struggle. Not drama for drama\'s sake — just the quiet effort of pushing through resistance until you are through it.',
    emotionalRhythm:
      'You do not release emotions easily. You tend to hold them inside your body while you decide what to do about them. This makes you resilient but also prone to tension, especially in the jaw, shoulders, and chest. Movement helps; so does giving yourself permission to feel without acting.',
    strengths: [
      'Persistence through resistance — you keep going when others quit',
      'Clear sense of what you are moving away from',
      'Growing faith in your own direction',
      'Quiet courage that builds over time',
    ],
    shadow: [
      'Getting stuck in "pushing against" instead of "moving toward"',
      'Internalizing resistance as a personal flaw',
      'Underestimating how much you have grown',
      'Leaving old relationships or environments too late',
    ],
    beginnings:
      'You start slowly and uncertainly, but you start. The key is to notice when your hesitation is wisdom vs when it is fear dressed up as wisdom. Momentum is medicine for you — small daily actions compound.',
    pressure:
      'Under pressure you tend to grit your teeth and push harder. This is admirable and also exhausting. The lesson is that sometimes stepping sideways is faster than powering through.',
    closure:
      'Endings are complicated because some part of you fears returning to the dark of the New Moon. Remember: release is not regression. What you let go of does not pull you backward — it frees you to keep rising.',
    loveWorkInner:
      'In love, you test carefully before committing, then commit with stubborn loyalty. In work, you thrive where effort is visible — you do not trust overnight success. Your inner life is full of quiet determination and subtle self-doubt in equal measure.',
    growth:
      'Your growth edge is learning to trust that the resistance itself is a sign you are headed somewhere real. Ease is not always a red flag, and struggle is not always a badge of honor. Learn which is which.',
  },

  first_quarter: {
    headline: 'The Decisive Builder',
    summary:
      'Born at First Quarter — Moon and Sun squared by 90° — you came in wired for action. Your life is built around moments of breakthrough, the kind that require you to push through a wall you did not create. You are here to make things happen, not to wait for permission.',
    characterLong:
      'You feel the pressure of "there is something I am supposed to do" more keenly than most people. It is not abstract — it is visceral. You can feel the shape of the thing that wants to exist, and you can feel the resistance of what is in the way.\n\nPeople born at this phase are often confrontational in the best sense: they do not flinch from hard conversations, hard decisions, or hard work. You may come across as intense to softer-tempered folks, but the intensity is the engine.\n\nYour whole life will contain repeating "crisis of action" moments — decisive forks where you must act boldly. These are not failures; they are your instrument.',
    emotionalRhythm:
      'Your emotions come in sharp pulses. You feel things hit fast, you decide what to do, you act. You do not ruminate well — prolonged indecision drains you far more than it drains others. When you are stuck, move your body and your emotions will re-sort themselves.',
    strengths: [
      'Decisive action under pressure',
      'Willingness to break through stuck situations',
      'Honest directness that cuts through fluff',
      'Ability to rally others toward a goal',
    ],
    shadow: [
      'Impatience with slower-paced people',
      'Creating conflict to generate momentum',
      'Pushing past nuance in the name of progress',
      'Burning out from relentless forward gear',
    ],
    beginnings:
      'You start with force. This is usually a strength, occasionally a liability. When a beginning needs finesse more than momentum, slow down deliberately — you have the drive either way.',
    pressure:
      'Pressure is your natural medium. You often perform BEST in crisis. The danger is manufacturing pressure when life gets quiet, because you mistake ease for stagnation.',
    closure:
      'Closure is usually a decision, not a fade-out. You tend to end chapters with a clear line — "we are done here" — and you rarely look back. The challenge is making sure the ending is wise, not just decisive.',
    loveWorkInner:
      'In love, you are ardent, sometimes combustible — chemistry matters, but so does your partner\'s capacity to meet your directness. In work, you excel at breaking deadlocks and driving projects over the line. Your inner life has a quiet intensity: you always know what you want to do next.',
    growth:
      'Your growth edge is letting outcomes breathe. Not every situation is a wall to break through. Some are gardens to tend. Learn to tell which is which, and save your force for the moments that need it.',
  },

  waxing_gibbous: {
    headline: 'The Refiner',
    summary:
      'Born in the Waxing Gibbous phase — past First Quarter but before Full — you came in with a refiner\'s mind. You polish, perfect, analyze, and improve. You are the person who finds the flaw others miss and cares enough to fix it.',
    characterLong:
      'You carry an internal critic with extraordinary resolution. Done well, this makes you magnificent at craft, execution, and quality. Done poorly, it makes you hard to live with — most of all for yourself.\n\nPeople born at this phase are looking toward the coming fullness. You sense that something important is almost ready to arrive, and you want to make sure it arrives in the best possible form. That makes you a perfectionist, yes — but one who serves something larger than ego.\n\nYou are not here to start things or to finish them. You are here to make them better.',
    emotionalRhythm:
      'Your emotions often arrive as analysis. You feel things and immediately start thinking about what to do about them. This is protective — it gives you control — but it can also keep you from just feeling. Schedule time where analysis is off the table and your feelings get to be what they are.',
    strengths: [
      'Exceptional attention to detail',
      'Quality-first instinct — you care deeply about how things are made',
      'Capacity to refine and improve almost anything',
      'Honest feedback without cruelty',
    ],
    shadow: [
      'Perfectionism that blocks release',
      'Over-analyzing emotional situations into paralysis',
      'Criticizing the people you love most',
      'Anxiety about whether something is ready',
    ],
    beginnings:
      'You rarely start from zero. You prefer to take something half-formed and make it excellent. When you DO start fresh, give yourself explicit permission to produce a rough first pass — you can refine it in your next gear.',
    pressure:
      'Under pressure you double down on detail. Sometimes this is the exact right move. Sometimes it is a dodge — polishing the trim while the house is on fire. Know the difference.',
    closure:
      'Endings are hard because you almost always feel you could have made it better. Let yourself finish "good enough" sometimes. Perfection postponed becomes perfection abandoned.',
    loveWorkInner:
      'In love, you are thoughtful, attentive, sometimes fussy — you notice the small things and that noticing is how you express care. In work, you are the person who ships quality. Your inner life is rich, intricate, and constantly humming with observation.',
    growth:
      'Your growth edge is learning to release. Your care for quality is a gift; the mistake is believing nothing is ever ready. At some point, shipping it IS the improvement.',
  },

  full: {
    headline: 'The Illuminator',
    summary:
      'Born at Full Moon — Sun and Moon perfectly opposite — you came into life already in dialogue with the "other." Relationships, partnerships, public visibility, and the tension between self and other are the core axis of your life. You are here to meet, to mirror, to reveal.',
    characterLong:
      'You cannot live fully in isolation. Something in you comes alive in the presence of other people, and something in them is revealed in your presence. This makes you charismatic, relationally gifted, and sometimes emotionally exposed in ways you did not sign up for.\n\nPeople born at Full Moon tend to have a clarity about them — an illumination. They see things others avoid, and they say the quiet part out loud. Not for drama, but because hiding feels unnatural to them.\n\nYour growth arc involves learning to honor the other WITHOUT losing yourself. The Full Moon polarity can dissolve you if you let it.',
    emotionalRhythm:
      'Your emotions tend to crest high and then reveal something. You feel a wave building, it breaks in a conversation or a moment, and afterwards you have more clarity than before. You are not designed to hold feelings inside — they want to be expressed.',
    strengths: [
      'Natural charisma and emotional presence',
      'Gift for partnership, collaboration, and public work',
      'Ability to see both sides of any situation',
      'Capacity to illuminate what others keep hidden',
    ],
    shadow: [
      'Losing yourself inside a strong partner',
      'Dramatizing tension instead of resolving it',
      'Over-exposing at the wrong moments',
      'Mirroring other people\'s moods until you forget yours',
    ],
    beginnings:
      'You start best in relationship. Pure solo ventures feel incomplete to you — you want a witness, a collaborator, an audience. Seek partnership that calls you forward without absorbing you.',
    pressure:
      'Under pressure, you often bring the tension INTO THE OPEN. This is courageous and sometimes frightening to the people around you. Done well, it defuses what was silently building. Done poorly, it escalates what could have been managed quietly.',
    closure:
      'Endings for you are revelations. Something comes to light right before the chapter closes. Trust that what is revealed was meant to be seen — it is not failure, it is illumination.',
    loveWorkInner:
      'In love, you are vivid, present, sometimes overwhelming. You need a partner who can match your light without competing with it. In work, you thrive in public-facing or partnership roles. Your inner life is surprisingly private — the people who see all of you are a small, chosen few.',
    growth:
      'Your growth edge is learning to be fully yourself in the presence of others — not diminished, not inflated. The balanced Full Moon holds its own light while meeting someone else\'s.',
  },

  disseminating: {
    headline: 'The Teacher',
    summary:
      'Born in the Disseminating phase — past Full Moon, the light is now waning but still bright — you came in to share what you have learned. You are a natural communicator, teacher, and distributor of wisdom. Your life purpose involves passing something on.',
    characterLong:
      'You feel the pull to make meaning out of experience. You cannot just live things; you have to articulate them, explain them, weave them into a story that other people can use. This is not ego — it is your native way of processing reality.\n\nPeople born at this phase often become writers, teachers, communicators, or mentors. They are the friend who can explain anything. They are the person whose advice actually lands because they have lived it.\n\nYou have something to say, and people want to hear it — but only if you have done the inner work first. Disseminating without substance is noise. Your power is in the substance.',
    emotionalRhythm:
      'Your emotions come in waves that want to be expressed — usually in words. You understand your own feelings by writing, talking, or teaching them. Keep a journal or a trusted listener close.',
    strengths: [
      'Natural teaching and communication gifts',
      'Ability to extract meaning from experience',
      'Warm, generous sharing of what you know',
      'Storytelling that moves people to action',
    ],
    shadow: [
      'Teaching when you should be listening',
      'Oversharing before you have integrated',
      'Getting attached to your own narrative',
      'Avoiding the harder inner work by staying in teacher mode',
    ],
    beginnings:
      'You start by telling someone about it. The act of articulating what you are about to do crystallizes it for you. Do not start in silence; start in conversation.',
    pressure:
      'Under pressure, you often need to process out loud. Phone a friend, send the voice note, write the post. Locked-in silence is hard on you and usually counterproductive.',
    closure:
      'Endings come with a story. You want to understand what the chapter meant before you close it. Give yourself time to extract the lesson — that extraction IS the closure.',
    loveWorkInner:
      'In love, you communicate often and with warmth — silences feel heavy to you. In work, you thrive in teaching, writing, content, mentoring, consulting. Your inner life is rich with observation and a constant gentle narration.',
    growth:
      'Your growth edge is listening more deeply before teaching. The best teachers have usually been the best students, and the gap between you talking and you learning is where your real growth lives.',
  },

  last_quarter: {
    headline: 'The Reorienter',
    summary:
      'Born at Last Quarter — Sun and Moon squared by 270° — you came in to dismantle and reorient. Your life contains repeated moments where old structures must come down so new ones can rise. You are built to question, deconstruct, and release what no longer serves.',
    characterLong:
      'You carry a quiet sense that something must change, even when everything looks fine. This is not pessimism — it is a built-in sensor for what has outlived its usefulness. You spot expired ideas, relationships, systems, beliefs.\n\nPeople born at this phase are often the ones who say the thing no one wants to say. They are the first to leave the party, the first to quit the job, the first to walk away from the belief system they were handed. They lead by showing what is NO LONGER true.\n\nThis makes you somewhat misunderstood in conventional contexts. Your gift is only visible when people realize — often years later — that you were right.',
    emotionalRhythm:
      'Your emotions often arrive with a certainty you did not ask for. "I am done with this" appears fully formed. You are rarely gradual. Trust these decisions even when they look abrupt to others — they are not abrupt to you; they have been brewing.',
    strengths: [
      'Clear sense of what needs to end',
      'Courage to dismantle what no longer serves',
      'Honesty that clears space for others\' honesty',
      'Ability to live without external validation',
    ],
    shadow: [
      'Burning bridges you might have wanted later',
      'Mistaking contrarianism for truth',
      'Ending things before they have fully taught you',
      'Loneliness from being the only one who sees it',
    ],
    beginnings:
      'You often start by ending something else first. Clear the space. Your clean slate is not philosophical — it is literal. A new beginning lands deeper when the old story has been properly released.',
    pressure:
      'Under pressure, you tend to make sudden clear-cut decisions. This is usually wise, sometimes premature. Build a 48-hour delay for major endings — not because your instinct is wrong, but because the follow-through is easier when you are not acting from heat.',
    closure:
      'Endings are your medium. You do them cleanly, often without fanfare. The lesson is letting yourself grieve even things you chose to end — not everyone knows how to mourn their own decisions.',
    loveWorkInner:
      'In love, you need a partner who can handle honesty, including hard truths delivered quietly. In work, you thrive in roles that require questioning the status quo — consultants, critics, strategists, reformers. Your inner life is deeply reflective, sometimes melancholy, always honest.',
    growth:
      'Your growth edge is making sure you are dismantling the RIGHT things. Sometimes what you want to tear down just needs repair. Ask yourself: am I ending this because it is truly done, or because ending is familiar?',
  },

  balsamic: {
    headline: 'The Old Soul',
    summary:
      'Born at Balsamic Moon — the last thin crescent before darkness, the final breath of the lunar cycle — you came in carrying the wisdom of what is passing, and the seeds of what comes next. You are a transitional being, and the most genuinely old-soul phase in the lunar cycle.',
    characterLong:
      'You often feel slightly out of step with the world. Not behind, not ahead — in a different rhythm entirely. You sense the end of an era before others do, and you carry the quiet grief of things other people are still celebrating.\n\nPeople born at this phase are often described as "old souls" even in childhood. You had adult-weight thoughts at young ages. You felt things most children could not hold. This is not wrong; it is the phase signature.\n\nYour life has a mystical tilt. You are serving something larger than one lifetime — karma, legacy, ancestral threads, collective shift. Your purpose unfolds on a timeline that is not always personal.',
    emotionalRhythm:
      'Your emotions run deep and slow, like underground rivers. You rarely react in the moment; you process over days, weeks, sometimes years. Give yourself the solitude this rhythm requires — what looks like withdrawal is you doing the work.',
    strengths: [
      'Wisdom beyond your years',
      'Sensitivity to what is ending or shifting',
      'Mystical, intuitive, often psychic perception',
      'Ability to hold paradox and complexity',
    ],
    shadow: [
      'Chronic weariness you cannot fully explain',
      'Giving up on this life because the next one calls louder',
      'Isolation from people who move at faster rhythms',
      'Avoiding responsibility by claiming "this is not my lifetime for that"',
    ],
    beginnings:
      'You start slowly and often in secret. Public beginnings feel invasive. Let your new chapters germinate in the dark for a while before you announce them.',
    pressure:
      'Under pressure, you go inward. This is protective and correct for your nature. The risk is staying so inward that the outer situation deteriorates while you process. Balance inner work with small outward actions.',
    closure:
      'Endings are almost comfortable for you — the cycle is your home. The work is not to END well; it is to begin again from the ashes with any real conviction. The cycle turns, and it needs you on the new side of it too.',
    loveWorkInner:
      'In love, you need depth, slowness, and meaning. Shallow connections exhaust you. In work, you thrive in roles involving transitions, endings, legacy, spiritual work, or service. Your inner life is profound, private, and often mystical.',
    growth:
      'Your growth edge is FULLY ARRIVING. Not everything is a transition; some parts of this life are meant to be your actual life. Practice presence — this incarnation counts too.',
  },
};

// ── Sign overlays -- one sentence each, injected into characterLong ──

const SIGN_OVERLAYS: Record<string, string> = {
  Aries: 'Your Moon in Aries gives this phase a quick, courageous, sometimes combative emotional edge — you do not ponder for long.',
  Taurus: 'Your Moon in Taurus grounds this phase in the body — you process emotion through the senses, slowly, and you need comfort to feel safe.',
  Gemini: 'Your Moon in Gemini turns emotion into words — you understand feelings by talking about them, often to multiple people.',
  Cancer: 'Your Moon in Cancer makes this phase deeply tender and protective — you feel the emotional temperature of any room and carry it home with you.',
  Leo: 'Your Moon in Leo makes the emotional dimension of this phase theatrical and generous — you feel things big, and you express them bigger.',
  Virgo: 'Your Moon in Virgo (ruled by Vesta in this system) quietly refines the emotional material of this phase — devoted, precise, sometimes self-critical.',
  Libra: 'Your Moon in Libra (ruled by Juno in this system) needs this phase to be shared — you calibrate your feelings through partnership and fairness.',
  Scorpio: 'Your Moon in Scorpio deepens this phase into the taboo, the intense, and the transformative — emotion for you is a force that rearranges reality.',
  Sagittarius: 'Your Moon in Sagittarius opens this phase toward meaning and horizon — you heal by moving, learning, and believing.',
  Capricorn: 'Your Moon in Capricorn gives this phase structural integrity — you contain your feelings in form, and you often mature emotionally early.',
  Aquarius: 'Your Moon in Aquarius gives this phase an observing, slightly detached emotional style — you feel for humanity as much as individuals.',
  Pisces: 'Your Moon in Pisces merges this phase with everything — you feel the collective emotional field and need solitude to separate what is yours.',
};

// ── House overlays -- one sentence each ──

const HOUSE_OVERLAYS: Record<number, string> = {
  1:  'With the Moon in your 1st house, this lunar imprint is visible on your face — people read your mood before you speak.',
  2:  'With the Moon in your 2nd house, your emotional wellbeing is tied to resources, worth, and the body — you feel steady when your foundation is steady.',
  3:  'With the Moon in your 3rd house, your feelings live in your voice, your writing, your daily conversations — thinking and feeling are the same act.',
  4:  'With the Moon in your 4th house (its home), this phase is amplified — home, family, and ancestry are where your core emotional life plays out.',
  5:  'With the Moon in your 5th house, you feel through creativity, romance, and play — joy is how you know you are alive.',
  6:  'With the Moon in your 6th house, emotion expresses through routine, body, and service — you steady yourself by being useful.',
  7:  'With the Moon in your 7th house, you come alive emotionally in partnership — relationships are your mirror and your teacher.',
  8:  'With the Moon in your 8th house, your feelings run deep — intimacy, merging, and hidden truths are where you really live.',
  9:  'With the Moon in your 9th house, you need meaning to feel well — philosophy, travel, and belief are emotional anchors for you.',
  10: 'With the Moon in your 10th house, your emotional life is public — your career, reputation, and public face carry your feelings.',
  11: 'With the Moon in your 11th house, your emotional life flourishes in chosen community — friendships and causes feed you.',
  12: 'With the Moon in your 12th house, your feelings are vast and private — you process in solitude, dreams, and the unseen.',
};

// ── Aspect overlays -- appended when a tight hard aspect is present ──

interface AspectOverlay {
  planet: string;
  type: string; // aspect type
  text: string;
}

const ASPECT_OVERLAYS: AspectOverlay[] = [
  { planet: 'Saturn', type: 'conjunction', text: 'Moon-Saturn conjunction adds an old-soul seriousness — you inherited emotional caution and must learn which parts are yours to keep.' },
  { planet: 'Saturn', type: 'square', text: 'Moon-Saturn square shapes an early wound around emotional permission — you learn to feel freely through deliberate effort.' },
  { planet: 'Saturn', type: 'opposition', text: 'Moon-Saturn opposition sets emotional need against duty — your adult work is integrating both without abandoning either.' },
  { planet: 'Pluto', type: 'conjunction', text: 'Moon-Pluto conjunction makes every emotion a potential transformation — you feel with immense depth and power.' },
  { planet: 'Pluto', type: 'square', text: 'Moon-Pluto square cycles you through emotional intensity — what feels destructive is often renewal in disguise.' },
  { planet: 'Pluto', type: 'opposition', text: 'Moon-Pluto opposition brings intense emotional encounters with others — they reflect back the buried parts of you.' },
  { planet: 'Uranus', type: 'conjunction', text: 'Moon-Uranus conjunction makes your emotional life electric and unpredictable — you need space and surprise to feel free.' },
  { planet: 'Uranus', type: 'square', text: 'Moon-Uranus square creates emotional rebellion — you break patterns suddenly when they confine you.' },
  { planet: 'Neptune', type: 'conjunction', text: 'Moon-Neptune conjunction dissolves your emotional boundaries — you feel everything, and you must learn to name what is yours.' },
  { planet: 'Neptune', type: 'square', text: 'Moon-Neptune square blurs the emotional signal — you may idealize, and then wake up — both are part of your path.' },
  { planet: 'Venus', type: 'conjunction', text: 'Moon-Venus conjunction gives your emotional life grace and softness — relational warmth comes naturally to you.' },
  { planet: 'Venus', type: 'trine', text: 'Moon-Venus trine lends ease to how you love and receive love — but watch for avoidance of what is uncomfortable.' },
  { planet: 'Mars', type: 'conjunction', text: 'Moon-Mars conjunction gives your feelings heat and drive — you act when you feel, which is sometimes glorious and sometimes premature.' },
  { planet: 'Mars', type: 'square', text: 'Moon-Mars square creates inner friction between what you want and what you feel — the work is letting both be true.' },
  { planet: 'Jupiter', type: 'conjunction', text: 'Moon-Jupiter conjunction expands your emotional generosity and optimism — you are the person who makes a room feel safer.' },
  { planet: 'Jupiter', type: 'trine', text: 'Moon-Jupiter trine gifts you natural emotional hope — use it well; ease can tip into complacency.' },
  { planet: 'Chiron', type: 'conjunction', text: 'Moon-Chiron conjunction keeps the emotional wound close to the surface — it is also where your medicine for others lives.' },
  { planet: 'Chiron', type: 'square', text: 'Moon-Chiron square cycles you through old emotional wounds — each pass builds the compassion that becomes your gift.' },
];

/** Look up an aspect-overlay sentence if there's a match among the user's tight Moon aspects. Returns all matching overlays, tightest first. */
function findAspectOverlays(moonAspects: { planet1: string; planet2: string; type: string }[]): string[] {
  const results: string[] = [];
  for (const asp of moonAspects) {
    const other = asp.planet1 === 'Moon' ? asp.planet2 : asp.planet1;
    const match = ASPECT_OVERLAYS.find((o) => o.planet === other && o.type === asp.type);
    if (match) results.push(match.text);
  }
  return results;
}

// ── Composition ────────────────────────────────────────────────────

/**
 * Build the full reading by composing phase + sign + house + aspect layers.
 * Returns a NatalPhaseReading where the long-form sections have been
 * enriched with the user-specific overlays.
 */
export function buildNatalPhaseReading(phase: NatalMoonPhase): NatalPhaseReading {
  const base = PHASE_BASE[phase.key];

  const signLine = phase.moonSign ? SIGN_OVERLAYS[phase.moonSign] : undefined;
  const houseLine = phase.moonHouse >= 1 && phase.moonHouse <= 12 ? HOUSE_OVERLAYS[phase.moonHouse] : undefined;
  const aspectLines = findAspectOverlays(phase.moonAspects as any).slice(0, 2);

  // Inject overlays as their own paragraphs at the end of the long form
  let enrichedCharacter = base.characterLong;
  const additions: string[] = [];
  if (signLine) additions.push(signLine);
  if (houseLine) additions.push(houseLine);
  for (const a of aspectLines) additions.push(a);
  if (additions.length > 0) {
    enrichedCharacter += '\n\n' + additions.join('\n\n');
  }

  return {
    ...base,
    characterLong: enrichedCharacter,
  };
}
