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
      'You were born at the New Moon, when the Moon sits hidden in the Sun\'s glare, and it shows in how you live. You decide from the gut, you start before you can explain why, and you would rather build something nobody has seen than polish something everyone already likes.',
    characterLong:
      'You move from a place most people cannot see. From the outside your choices look impulsive or half-formed. From the inside it is a flat certainty that this is the direction, and you could not defend it in a meeting if you tried.\n\nBecause so little gets reflected back to you, you learn early to trust your own signal. People read that as self-absorption. You are just the one in the room who stopped waiting for a sign.\n\nWhat you start may not finish blooming in your lifetime. You keep starting anyway, because starting is the part you are actually good at.',
    emotionalRhythm:
      'Your feelings hit hard, run their course and leave. You cry on Tuesday and are planning a trip by Thursday. People who need a feeling to be processed together for a week find that cold. For you it is simply how fast your system clears.',
    strengths: [
      'You launch without waiting for permission, a budget or a second opinion',
      'You hear your gut before you hear the doubts',
      'You see where something new could go while everyone else is still reading the manual',
      'When you are doing what is yours to do, people lean toward you without knowing why',
    ],
    shadow: [
      'You sign, book and quit before you have read the consequences',
      'You lose interest the week the novelty wears off',
      'You become whatever you just started and take every criticism of it personally',
      'You struggle to build on top of what someone else laid down',
    ],
    beginnings:
      'Beginning is the easy part for you. You will have the logo, the website and the group chat by the weekend. The cost shows up in month three, when five half-built projects are waiting and none of them has your full attention. Pick one and give it a whole season.',
    pressure:
      'In a crisis you move first and think afterward. That makes you excellent in an emergency and a problem in a negotiation, where the other person is still working out what they want. Before any decision that touches other people, take one breath and ask who else this lands on.',
    closure:
      'Endings do not register for you until you do something physical about them. Write the last page, pack the box, say the goodbye out loud. Without a ritual the part of you already sprinting ahead leaves the old chapter standing open behind you.',
    loveWorkInner:
      'In love you fall fast and on instinct, then wonder why the other person needs three dates to decide. At work you are a founder or a first mover, and you get restless the day the job becomes maintenance. Inside, you know things long before you can say them, and you rarely talk about it.',
    growth:
      'Your edge is finishing. Not every seed deserves a full season, but the one that still pulls at you in month four does. Choose it, tell someone it is yours, and see it through. The first time you finish something big changes how you spend the next ten years.',
  },

  waxing_crescent: {
    headline: 'The Emerging Fighter',
    summary:
      'You were born as the Moon first pulled away from the Sun, a thin sliver after the dark, and you have felt like you were pushing off something since childhood. You work for your ground rather than inheriting it, and the effort has made you steadier than you think.',
    characterLong:
      'There is a low, constant friction in you, a sense that nothing is given and everything gets earned. You feel the weight of where you came from, family expectations and old habits, and at the same time a pull toward something nobody around you has done. Those two pulls rarely agree.\n\nYou probably felt like a guest in your own family story. You are building something your parents or grandparents could not have pictured, and that takes more stubbornness than people see.\n\nYou grow through resistance. Not drama, just the daily work of leaning on a door until it opens.',
    emotionalRhythm:
      'You do not let feelings out quickly. You carry them in your body while you decide what to do, which shows up as a clenched jaw, tight shoulders and a chest that will not drop. A walk or a workout moves it. So does letting yourself feel something for an evening without acting on it.',
    strengths: [
      'You keep going in the month everyone else quits',
      'You know exactly what you are leaving behind, even before you know where you are headed',
      'Your confidence in your own direction grows every year, though you rarely notice',
      'Your courage is quiet and cumulative: nobody sees it until it has already won',
    ],
    shadow: [
      'You get so used to pushing against something that you forget to move toward anything',
      'You treat every obstacle as proof that something is wrong with you',
      'You miss how far you have already come',
      'You stay in jobs and relationships a year past the point you knew',
    ],
    beginnings:
      'You start slowly and unsure, and you start anyway. The question to ask each time is whether you are hesitating because you have seen a real problem or because you are scared. Ten minutes a day beats a dramatic overhaul for you.',
    pressure:
      'Under pressure you clench and push harder. It works, and it leaves you wrecked on Friday. Often the faster route is sideways: ask for help, change the plan, shorten the deadline.',
    closure:
      'You hesitate at endings because leaving feels like sliding back into the dark you came from. It is not a slide back. Whatever you put down is weight off the climb.',
    loveWorkInner:
      'In love you test someone for a long time, then stay with stubborn loyalty. At work you trust visible effort and distrust anyone whose success came overnight. Inside, determination and self-doubt run side by side and each makes the other louder.',
    growth:
      'Your edge is noticing when the struggle means you are close and when it means you are on the wrong road. Ease is not a trick, and exhaustion is not a medal. Ask yourself every few months which one you are in.',
  },

  first_quarter: {
    headline: 'The Decisive Builder',
    summary:
      'You were born at First Quarter, with the Moon a quarter of the way around from the Sun, and your life keeps handing you walls to go through. You act, you decide, and you get impatient with anyone who calls a pause careful.',
    characterLong:
      'You feel the pressure of there is something I am supposed to do more sharply than most people. It is physical for you: a tight stomach on a Sunday night, a thing you know has to be built and cannot yet be seen.\n\nYou are confrontational in the useful sense. You raise the hard topic at the dinner, say the number in the meeting and tell the contractor it is not finished. Softer people sometimes flinch at you, and you are often the reason the thing finally got done.\n\nYour life repeats one scene: a fork where you have to choose loudly, in public, with consequences. You will keep ending up there. It is where you work best.',
    emotionalRhythm:
      'Your feelings arrive as sharp hits. Something stings, you decide, you move. Staying in limbo drains you faster than it drains anyone else, and a week of maybe leaves you irritable and sleepless. When you feel stuck, use your body first: lift, run, clean the garage. The feeling sorts itself out afterward.',
    strengths: [
      'You decide while everyone else is still gathering opinions',
      'You push through the stuck situation nobody else will touch',
      'You say the blunt thing that clears the room of fog',
      'People follow you into a goal because you plainly intend to reach it',
    ],
    shadow: [
      'You get impatient with slower people and show it on your face',
      'You start a fight to get a project moving',
      'You steamroll the detail that mattered because speed felt like progress',
      'You run on full for months and then crash with no warning',
    ],
    beginnings:
      'You start with force, and force opens most doors. It also breaks a few that needed a gentle push. When a beginning is delicate, such as a new hire, a new friendship or a reconciliation, slow your voice and your pace on purpose. You will still arrive.',
    pressure:
      'Pressure is where you work best, and you know it. The risk is that when life goes quiet you create a crisis to feel normal: the argument, the sudden move, the project nobody asked for. A calm month is not a failing one.',
    closure:
      'You end things with a decision and a clean line. We are done here, and you rarely look back. The thing to check is whether the ending is wise or just fast. Give a big one twenty-four hours before you announce it.',
    loveWorkInner:
      'In love you are ardent and sometimes combustible. Chemistry gets you in, but only a partner who can take your bluntness without going quiet keeps you. At work you break deadlocks and carry projects over the line. Inside, you always know the next move, even on days you wish you did not.',
    growth:
      'Your edge is letting some things grow on their own clock. Not every problem is a wall. Some are gardens, and force kills a garden. Spend your power on the two or three things a year that truly need it.',
  },

  waxing_gibbous: {
    headline: 'The Refiner',
    summary:
      'You were born with the Moon swelling toward full, almost there but not yet, and you live in that stretch. You are the one who notices the flaw in the deck, the typo in the contract and the half-inch the shelf is off, and you care enough to fix it.',
    characterLong:
      'You carry an inner editor with the resolution of a microscope. At its best it makes your work excellent. At its worst it makes you hard to live with, and hardest on yourself.\n\nYou feel that something good is nearly ready, and you will not let it go out half-finished. That is why you rework the email four times and redo the room before guests arrive. It is perfectionism, but it serves the thing itself, not your pride.\n\nYou are rarely the one who starts and rarely the one who finishes. You are the one who makes it better in between.',
    emotionalRhythm:
      'You feel something and your mind immediately starts working on it. What do I do, what went wrong, what would fix it. That keeps you in control and it also keeps you from simply feeling. Set aside an hour with no fixing and no plan, and let the feeling be as big as it is.',
    strengths: [
      'You catch the detail that would have cost someone money later',
      'You will not ship sloppy work, and people trust your name on it',
      'You can take almost anything half-built and make it excellent',
      'You give honest feedback that stings only a little and helps a lot',
    ],
    shadow: [
      'Your standards stop you from releasing anything',
      'You analyze a feeling until it turns into paralysis',
      'You criticize the people you love for things they have no plan to change',
      'You lie awake asking whether it is ready yet',
    ],
    beginnings:
      'You prefer to inherit something half-formed and make it good. When you do have to begin from nothing, decide in advance that the first pass will be rough and that rough is allowed. You can sharpen it tomorrow.',
    pressure:
      'Under pressure you double down on detail. Sometimes that is exactly right. Sometimes you are straightening the trim while the kitchen is on fire. Ask yourself which job is actually burning.',
    closure:
      'Endings are hard because you can always see one more thing you could have done. Let a project close at good enough now and then. The perfect version you never release helps no one.',
    loveWorkInner:
      'In love you notice everything: how they take their coffee, the mood they hide, the one remark they made in March. That attention is how you say I care, and it can tip into fussing. At work you are the person whose quality holds. Inside, your head is a busy workshop that never fully shuts.',
    growth:
      'Your edge is releasing. Your standards are a gift, until you decide nothing has ever been ready. At some point sending it is the improvement.',
  },

  full: {
    headline: 'The Illuminator',
    summary:
      'You were born at the Full Moon, with the Sun and Moon on opposite sides of the sky, and your life runs through other people. Partners, audiences, rivals and the gap between what you want and what they want are where you learn who you are.',
    characterLong:
      'You do not do well alone for long. Something in you switches on with another person in the room, and something in them comes out around you. That makes you magnetic and also exposed in ways you did not agree to.\n\nYou see what others avoid and say it before the pause gets awkward. Hiding feels like a lie to you, so you light it up, and some people thank you while others never forgive it.\n\nThe work of your life is honoring the other person without vanishing into them. Lean too far toward the other side and you wake up in a relationship that has your name on it and someone else\'s preferences in it.',
    emotionalRhythm:
      'Your feelings build toward a peak and break in a conversation. You say it, cry it or fight it, and afterward you can see clearly. Holding a feeling in until the weekend does not work for you. It comes out sideways at the wrong person.',
    strengths: [
      'People feel seen when they are with you',
      'You build real partnerships and keep them alive',
      'You hold both sides of an argument at the same time',
      'You name what everyone has been quietly avoiding',
    ],
    shadow: [
      'You disappear inside a strong partner\'s plans',
      'You turn tension into theater instead of solving it',
      'You say too much, to the wrong person, at the wrong table',
      'You absorb other people\'s moods until you cannot find your own',
    ],
    beginnings:
      'You begin best with someone beside you. A solo start feels unreal until a person has seen it. Look for a partner who pulls you forward and leaves your decisions yours.',
    pressure:
      'Under pressure you drag the tension into the open. It can be brave and it can scare the people around you. Said at the right moment it ends a month of silent resentment. Said at the wrong one it turns a small thing into a scene.',
    closure:
      'Your endings come with a reveal. Something is finally said or seen, and then the chapter closes. What came out was always there. It is not the cause of the ending, only the moment you saw it.',
    loveWorkInner:
      'In love you are vivid, fully present and sometimes too much, and you need someone who can match your light without competing with it. At work you do best with people and partnerships, on stage or in a room. Inside, you are much more private than you look. The few who see all of you have earned it.',
    growth:
      'Your edge is being fully yourself in front of someone else, neither shrunk nor inflated. You can keep your own light on and still see theirs.',
  },

  disseminating: {
    headline: 'The Teacher',
    summary:
      'You were born just after the Full Moon, with the light still bright but starting to shrink, and you carry what you learn out to other people. You cannot live a thing without wanting to explain it, and people usually come back for the explanation.',
    characterLong:
      'You turn experience into meaning almost automatically. A breakup becomes a talk you give your friend, a job becomes a story with a lesson, and you only feel it is finished once you have told it to someone.\n\nYou end up as the writer, the mentor, the friend everyone calls. Your advice lands because you have actually been there, and that is also why people forgive you for the speech.\n\nYou have something to say, and people will listen, but only if you did the private work first. Talking without having lived it is just noise, and you can hear the difference.',
    emotionalRhythm:
      'Your feelings arrive and want words. You understand yourself by writing it out, talking it through or explaining it to someone patient. Without a journal or a listener, the feeling stays knotted. Keep one of them within reach.',
    strengths: [
      'You explain hard things in a way that makes people feel smart',
      'You pull a lesson out of experience while it is still warm',
      'You share what you know without hoarding it',
      'Your stories move people to change something on Monday',
    ],
    shadow: [
      'You teach when the other person only needed you to listen',
      'You share before you have understood it yourself',
      'You grow attached to the version of your story that makes you the wise one',
      'You hide in advice-giving to avoid your own unfinished work',
    ],
    beginnings:
      'You begin by telling someone. Once you have said it aloud to a friend, it is real. Do not start in silence. Start in a conversation, a post or a voice note, and let the telling make the commitment.',
    pressure:
      'Under pressure you have to talk it out. Call a friend, send the voice note, write the draft. Sitting alone with it makes you worse, not calmer.',
    closure:
      'Endings come with a story, and you need the story before you can let go. Give yourself time to work out what the chapter taught. That work is the closing.',
    loveWorkInner:
      'In love you talk, check in and fill silences, and a quiet partner makes you anxious. At work you do well in teaching, writing, content, mentoring and consulting. Inside, you narrate your own life as it happens, quietly, all day.',
    growth:
      'Your edge is listening before you teach. The best teachers stay students, and the gap between you talking and you learning is where you will grow next.',
  },

  last_quarter: {
    headline: 'The Reorienter',
    summary:
      'You were born at Last Quarter, with the Moon three quarters of the way through its cycle and the light halving, and you are the person who knows when something is over. You question, take apart and walk away from what has stopped working, usually before anyone else admits it.',
    characterLong:
      'You carry a quiet sense that something has to change, even when everything looks fine. It is not pessimism. You can smell an expired idea, an expired job, an expired friendship, and you cannot unsmell it.\n\nYou are the one who says the thing nobody wanted said. You leave the party first, quit the job first and drop the beliefs you were handed. Your example shows people what is no longer true.\n\nYou will often be misunderstood in the moment. The proof usually arrives years later, when the people who argued with you quietly admit you were right.',
    emotionalRhythm:
      'Certainty arrives whole. I am done with this shows up already finished, with no gradual build you can point to. Trust it, even though everyone else calls it sudden. It has been forming for months where you could not hear it.',
    strengths: [
      'You know what needs to end before the meeting starts',
      'You take apart what no longer works instead of nursing it',
      'Your honesty gives other people room to be honest',
      'You can live without applause',
    ],
    shadow: [
      'You burn a bridge you later wished you had kept',
      'You confuse disagreeing with being right',
      'You end things before they have taught you what they came to teach',
      'You are lonely because you saw it first and nobody saw it with you',
    ],
    beginnings:
      'You usually begin by ending something. Clear the desk, close the account, leave the group. The clean slate is literal for you, and a new start takes root better when the old one has been properly shut.',
    pressure:
      'Under pressure you make a sudden, clear-cut call. Often it is right and sometimes it is hot. Put a forty-eight hour wait on any major ending. Your instinct is probably fine, and the follow-through goes better when you are not furious.',
    closure:
      'Endings are your home ground, and you do them cleanly and without a speech. The part you skip is grief. You can mourn something you chose to end. Nobody taught you that, and it is allowed.',
    loveWorkInner:
      'In love you need someone who can hear a hard truth said quietly and not collapse. At work you do well wherever questioning the old way is the job: consultant, critic, strategist, reformer. Inside you are reflective, sometimes melancholy and always honest with yourself.',
    growth:
      'Your edge is checking that you are tearing down the right thing. Some of what you want to demolish only needs repair. Ask whether this is truly finished or whether leaving is just the move you know best.',
  },

  balsamic: {
    headline: 'The Old Soul',
    summary:
      'You were born in the last thin crescent before the dark, the final days of the lunar cycle, and you have felt older than your age since you were small. You sense endings early and carry what is passing into what comes next.',
    characterLong:
      'You often feel slightly out of step with everyone else. You are not behind or ahead, just on a different clock. You sense the end of an era before the crowd does, and you grieve things other people are still celebrating.\n\nPeople probably called you an old soul at eight. You had grown-up thoughts at a kitchen table, and you felt things the other kids had no place to put. It is not a defect. It comes with the timing of your birth.\n\nYour life has a mystic slant. You tend to feel you are serving something longer than one lifetime: a family line, a legacy, a shift larger than you. Your purpose runs on a timeline that is not always about you.',
    emotionalRhythm:
      'Your feelings run deep and slow, like water under a floor. You rarely react in the moment. You work through it over days, sometimes years. When you go quiet you are not withdrawing, you are working. Give yourself the solitude it takes.',
    strengths: [
      'You carry a patience and perspective that people twice your age lack',
      'You feel the shift before it is announced',
      'Your intuition is strong enough that you have stopped explaining it',
      'You can stay in a complicated situation without needing it to resolve',
    ],
    shadow: [
      'A tiredness you cannot explain to anyone',
      'Looking past this life toward the next one',
      'Pulling away from people who move faster than you',
      'Skipping responsibilities by telling yourself this is not the lifetime for that',
    ],
    beginnings:
      'You start slowly and often in secret. Announcing too soon feels like exposure. Let a new chapter grow in private for a few months before anyone hears about it.',
    pressure:
      'Under pressure you go inward, which suits you. The risk is staying in your head so long that the outside situation falls apart while you think. Pair the inner work with one small action each day.',
    closure:
      'Endings feel almost comfortable, because the cycle is where you live. Your difficulty is the other direction: starting again, and meaning it, from the ashes. The cycle needs you on the new side too.',
    loveWorkInner:
      'In love you need depth and time, and small talk wears you out. At work you suit transitions, endings, legacy, spiritual work and service. Inside, you are private, profound and frequently somewhere else.',
    growth:
      'Your edge is actually arriving. Not everything is a transition. Parts of this life are simply your life. Be here for dinner, for the people, for the ordinary Tuesday. This lifetime counts.',
  },
};

// ── Sign overlays: one sentence each, injected into characterLong ──

const SIGN_OVERLAYS: Record<string, string> = {
  Aries: 'With your Moon in Aries, you feel something and move the same second. You rarely stew, and you rarely apologize for how fast you went.',
  Taurus: 'With your Moon in Taurus, you only feel safe when your body is comfortable: good food, a quiet room, no rushing. You work through emotion slowly, and being hurried makes you dig in.',
  Gemini: 'With your Moon in Gemini, you do not know what you feel until you have said it out loud, usually to more than one person.',
  Cancer: 'With your Moon in Cancer, you pick up the mood of every room you walk into and carry it home with you in your chest.',
  Leo: 'With your Moon in Leo, you feel big and you show it big. Being ignored hurts you far more than being criticized.',
  Virgo: 'With your Moon in Virgo, you check what you feel, fix what you can and judge yourself harder than anyone else does.',
  Libra: 'With your Moon in Libra, you work out what you feel by talking it through with someone you trust, and you hate being the only one who is upset.',
  Scorpio: 'With your Moon in Scorpio, you feel everything at full volume and show about a tenth of it. The people who get close find out how deep it goes.',
  Sagittarius: 'With your Moon in Sagittarius, you heal by moving: a long drive, a new country, a book that rearranges your head.',
  Capricorn: 'With your Moon in Capricorn, you hold your feelings in order and grew up early. You still check whether you are allowed to need things.',
  Aquarius: 'With your Moon in Aquarius, you step back from a feeling to look at it before you let yourself have it. Strangers and causes can move you more than your own family.',
  Pisces: 'With your Moon in Pisces, you soak up other people\'s feelings without noticing, and you need time alone to find out which ones were yours.',
};

// ── House overlays: one sentence each ──

const HOUSE_OVERLAYS: Record<number, string> = {
  1:  'With your Moon in the 1st house, your mood is on your face before you speak, and people respond to it whether you meant them to or not.',
  2:  'With your Moon in the 2nd house, you feel calm when money and your body are steady, and shaky the week the account runs low.',
  3:  'With your Moon in the 3rd house, your feelings live in your voice, your texts and your daily conversations. You think and feel in the same breath.',
  4:  'With your Moon in the 4th house, home and family are where your emotional life actually happens. A bad week with your parents ruins your whole month.',
  5:  'With your Moon in the 5th house, you feel most alive when you are making something, flirting or playing. Joy is how you check that you are okay.',
  6:  'With your Moon in the 6th house, you settle yourself by being useful. A clean kitchen, a finished list and a body that is looked after calm you down.',
  7:  'With your Moon in the 7th house, you come alive in a partnership, and you learn who you are from how the other person reacts to you.',
  8:  'With your Moon in the 8th house, you feel most at home in the heavy conversation: money, secrets, sex, loss. Small talk leaves you cold.',
  9:  'With your Moon in the 9th house, you need to believe in something to feel well. Travel and big ideas steady you when routine cannot.',
  10: 'With your Moon in the 10th house, your work is where your feelings show. A bad day at the job is a bad day, full stop, and your reputation holds your mood.',
  11: 'With your Moon in the 11th house, your friends and your causes feed you. Being cut off from your people hurts more than you let on.',
  12: 'With your Moon in the 12th house, your feelings are large and private. You sort them out alone, in dreams and long silences, and show others the finished version.',
};

// ── Aspect overlays: appended when a tight aspect to the Moon is present ──

interface AspectOverlay {
  planet: string;
  type: string; // aspect type
  text: string;
}

const ASPECT_OVERLAYS: AspectOverlay[] = [
  { planet: 'Saturn', type: 'conjunction', text: 'Moon with Saturn: you were serious young and learned to hold your feelings in. Some of that caution was handed to you, and your job is to work out which parts you are allowed to put down.' },
  { planet: 'Saturn', type: 'square', text: 'Moon square Saturn: asking for comfort felt risky early on. You learn to feel freely as an adult, and it takes deliberate effort, not time alone.' },
  { planet: 'Saturn', type: 'opposition', text: 'Moon opposite Saturn: what you need keeps colliding with what you owe. You get peace when you stop picking one and build a life that carries both.' },
  { planet: 'Pluto', type: 'conjunction', text: 'Moon with Pluto: you do not feel half-way. A feeling arrives with the force of a decision, and the people around you can sense it before you speak.' },
  { planet: 'Pluto', type: 'square', text: 'Moon square Pluto: your emotions come in cycles of intensity, and what feels like a collapse tends to be a clearing. You come out of each one more yourself than before.' },
  { planet: 'Pluto', type: 'opposition', text: 'Moon opposite Pluto: you meet intense people, and they show you the part of yourself you buried. The relationship that scares you most is the one teaching you something.' },
  { planet: 'Uranus', type: 'conjunction', text: 'Moon with Uranus: your moods change without warning and you need room to breathe. Anyone who tries to fence you in finds you gone.' },
  { planet: 'Uranus', type: 'square', text: 'Moon square Uranus: when a situation closes in, you break it suddenly. Quit, move, cut the cord. You regret the method more than the exit.' },
  { planet: 'Neptune', type: 'conjunction', text: 'Moon with Neptune: you absorb the feelings of everyone nearby, and you have to practice saying which ones belong to you.' },
  { planet: 'Neptune', type: 'square', text: 'Moon square Neptune: you fall for the version of someone you hoped they were, then wake up. Both halves of that are part of how you learn.' },
  { planet: 'Venus', type: 'conjunction', text: 'Moon with Venus: warmth comes easily to you, and people relax near you without being sure why.' },
  { planet: 'Venus', type: 'trine', text: 'Moon trine Venus: loving and being loved come easily. The risk is dodging a hard conversation because everything feels fine.' },
  { planet: 'Mars', type: 'conjunction', text: 'Moon with Mars: you act the moment you feel. It can be glorious and it can be premature, and you apologize for the second kind.' },
  { planet: 'Mars', type: 'square', text: 'Moon square Mars: what you want and what you feel pull in different directions. Peace comes when you stop deciding which one is lying.' },
  { planet: 'Jupiter', type: 'conjunction', text: 'Moon with Jupiter: you are generous with your mood and your time. You are the one who makes a tense room breathe.' },
  { planet: 'Jupiter', type: 'trine', text: 'Moon trine Jupiter: hope comes to you without effort. The cost is a habit of assuming it will work out, so check the thing that needs checking.' },
  { planet: 'Chiron', type: 'conjunction', text: 'Moon with Chiron: an old emotional hurt sits close to the surface, and the same spot is where you help other people best.' },
  { planet: 'Chiron', type: 'square', text: 'Moon square Chiron: old hurts come round again every few years. Each time through you learn to sit with someone else\'s the way no one sat with yours.' },
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
