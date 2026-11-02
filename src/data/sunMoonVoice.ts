/* Per-sign behaviour lines for the Sun/Moon pages, in the reader's voice.
   Each field has a fixed grammatical form (see sunMoonContent.ts) because the
   generators splice these strings into sentences. */

import type { ZodiacSign } from './compatibilityContent';

export interface SunMoonSignVoice {
  /** Full sentence starting 'You': how you come across day to day. */
  sunShow: string;
  /** Clause completing 'What you chase is ___' (no capital, no full stop). */
  sunChase: string;
  /** Full sentence starting 'You': the habit that backfires in public. */
  sunTrap: string;
  /** Starts 'Privately you need'. */
  moonNeed: string;
  /** Starts 'When that is missing, you' (follows moonNeed). */
  moonUpset: string;
  /** Starts 'What actually settles you is'. */
  moonComfort: string;
  /** Starts 'In love you'. */
  loveSun: string;
  /** Starts 'You feel loved when'. */
  loveMoon: string;
  /** Starts 'Your quiet strength is'. */
  strength: string;
  /** Starts 'Your growth move is'. */
  edge: string;
}

export const SUN_MOON_VOICE: Record<ZodiacSign, SunMoonSignVoice> = {
  aries: {
    sunShow: "You walk in already moving, say the thing everyone else is circling, and are halfway through the plan before anyone has agreed to it.",
    sunChase: "being first, being the one who went when nobody else would",
    sunTrap: "You mistake speed for decisiveness and then defend the first answer for a week.",
    moonNeed: "Privately you need room to react without being managed, and a person who lets you be wrong loudly for ten minutes.",
    moonUpset: "When that is missing, you pick a fight or burn it off at the gym and tell everyone you are fine.",
    moonComfort: "What actually settles you is movement, a straight answer and someone who does not take your temper personally.",
    loveSun: "In love you make the first move, say what you want on date two, and lose interest fast when the chase is over before it started.",
    loveMoon: "You feel loved when someone matches your energy without being asked and says sorry once, plainly, instead of explaining for an hour.",
    strength: "Your quiet strength is starting what everyone else is still debating and being okay with going first and being seen to fail.",
    edge: "Your growth move is to wait one full day before answering anything that angers you, then send the answer you still agree with.",
  },
  taurus: {
    sunShow: "You stay calm while everyone else spins, you do not move until you are ready, and people lean on you because you are still standing at the end.",
    sunChase: "a life that is solid, paid for and yours, with nothing that can be taken from you overnight",
    sunTrap: "You dig in and call it standards. Then the thing you refused to change is the thing that breaks.",
    moonNeed: "Privately you need a predictable day, good food and a body that is rested. You need time to arrive at a decision rather than be pushed into it.",
    moonUpset: "When that is missing, you go silent, eat or shop to cover it, and refuse to budge on small things because they are the only things you control.",
    moonComfort: "What actually settles you is a home that is quiet, a proper meal, soft textures and someone who just sits near you without talking.",
    loveSun: "In love you show up with actions, not speeches: you cook, you fix, you remember, and you take a long time to say yes and a longer time to leave.",
    loveMoon: "You feel loved when someone is dependable in small things. They arrive when they said they would, and they touch you without needing a reason.",
    strength: "Your quiet strength is outlasting pressure: you can keep going at the same steady pace long after faster people have burned out.",
    edge: "Your growth move is to say yes to one change this month before you have fully checked that it is safe.",
  },
  gemini: {
    sunShow: "You are the one who knows a bit about everything, finishes other people's sentences and has three conversations going at once.",
    sunChase: "the next interesting thing, a new person to talk to, an answer you did not have yesterday",
    sunTrap: "You say yes to everything because it all sounds interesting, then quietly drop half of it and lose the trust of the people who were counting on you.",
    moonNeed: "Privately you need someone to talk to, in words, all the time. You need variety and a mind that has somewhere new to go.",
    moonUpset: "When that is missing, you talk about the problem instead of feeling it, scroll for hours and tell a funny story that hides the real answer.",
    moonComfort: "What actually settles you is a long honest conversation, a new idea to chew on and someone who answers your messages.",
    loveSun: "In love you flirt with words first, keep things light until you trust someone and get bored the moment the conversation goes flat.",
    loveMoon: "You feel loved when someone is curious about your mind, texts you the random thing they thought of and can talk through a fight without going cold.",
    strength: "Your quiet strength is that you can read a room, switch tone in seconds and explain a hard thing so the other person finally gets it.",
    edge: "Your growth move is to finish one thing you have already started before you open the next one.",
  },
  cancer: {
    sunShow: "You remember what everyone ordered, notice who has gone quiet and make a room feel looked after, then go home and deal with your own day alone.",
    sunChase: "a home and people you can count on, somewhere you are never the one left outside",
    sunTrap: "You hold on to a hurt for months, drop hints instead of asking, and then resent people for not noticing what you never said.",
    moonNeed: "Privately you need to feel safe before you can say anything real. You need people who return your care, not just receive it.",
    moonUpset: "When that is missing, you pull into your shell, go passive-aggressive or snappy, and mother everyone else so no one asks how you are.",
    moonComfort: "What actually settles you is your own space, familiar food, old photos or songs, and one person who says they are not going anywhere.",
    loveSun: "In love you give care before you are asked, remember every date and detail and test people slowly by seeing who stays.",
    loveMoon: "You feel loved when someone checks in without being prompted, includes you in family things and treats your feelings as real on the first telling.",
    strength: "Your quiet strength is that you can sense what someone needs before they say it, and you keep people safe without making them feel small.",
    edge: "Your growth move is to say the need out loud the first time, in one plain sentence, instead of waiting to be guessed.",
  },
  leo: {
    sunShow: "You light up a room by being warm, loud and generous, and when you walk in people feel you arrive.",
    sunChase: "being seen for who you really are and being loved for it, not for performing",
    sunTrap: "You say yes to the spotlight, then sulk when no one clapped. Your pride turns a small slight into a long freeze.",
    moonNeed: "Privately you need to be told, specifically, that you matter. You need a person who delights in you and does not roll their eyes.",
    moonUpset: "When that is missing, you act bigger and brighter to cover it, go quiet and dramatic, or wait to be asked what is wrong.",
    moonComfort: "What actually settles you is a compliment that is true, a proud look from someone you respect and permission to be silly.",
    loveSun: "In love you court with grand gestures and big loyalty, and you expect the same flair and attention back.",
    loveMoon: "You feel loved when someone makes a fuss over you, remembers what you made and claps for you in a room full of people.",
    strength: "Your quiet strength is that you give people courage: they try things because you believed in them out loud.",
    edge: "Your growth move is to ask for the praise you need directly, and to say well done to someone else first this week.",
  },
  virgo: {
    sunShow: "You notice the error, the missing detail and the better way to do it, and you quietly fix it before anyone thanks you.",
    sunChase: "getting it right, being useful, and knowing you did your part properly",
    sunTrap: "You edit your own work forever, criticize others to help them, and then wonder why no one wants your advice.",
    moonNeed: "Privately you need order, a clear list and a day with enough room that you are not behind before you begin.",
    moonUpset: "When that is missing, you over-clean, over-plan, pick yourself apart and worry about your health or a mistake you made years ago.",
    moonComfort: "What actually settles you is a finished task, a tidy desk, a long walk and someone who says it was good enough.",
    loveSun: "In love you show care by doing: you notice what is broken, book the thing, bring the medicine, and slowly learn to say what you feel.",
    loveMoon: "You feel loved when someone sees how much you do and says thanks specifically, and when they take a job off your list without being asked.",
    strength: "Your quiet strength is that you see exactly what is wrong and exactly how to fix it, in a way that others spend days trying to find.",
    edge: "Your growth move is to hand in the work at 90 percent, and to say one thing you like before the correction.",
  },
  libra: {
    sunShow: "You make people feel at ease, read what everyone wants and smooth things over before a fight starts.",
    sunChase: "peace, fairness, and a relationship where you are chosen and the room is in balance",
    sunTrap: "You agree to keep the peace and then resent it. People take your yes at face value, and the real answer comes out sideways.",
    moonNeed: "Privately you need someone to think things through with, a calm space and an end to conflict that is left hanging.",
    moonUpset: "When that is missing, you go along with things, ask ten people what to do, then stall because any choice will upset someone.",
    moonComfort: "What actually settles you is beauty around you, a fair talk where both sides are heard and company you actually like.",
    loveSun: "In love you are charming, attentive and quick to compromise, and you want a partner more than a solo life.",
    loveMoon: "You feel loved when someone asks what you want and means it, treats you as an equal and does not make you fight to be heard.",
    strength: "Your quiet strength is that you can sit between two angry people and get both of them to agree without either losing face.",
    edge: "Your growth move is to name your choice first in the next group decision, before you hear anyone else's.",
  },
  scorpio: {
    sunShow: "You say little, watch everything and make people feel you can see through them, which is accurate more often than they like.",
    sunChase: "the truth, full control of your own life, and one person you do not have to perform for",
    sunTrap: "You test people to see if they are loyal, then treat a small slip as proof they never were.",
    moonNeed: "Privately you need to trust one person all the way. You need honesty that costs something and no one playing games with your feelings.",
    moonUpset: "When that is missing, you go cold, check things you promised not to, keep score in silence and cut people off completely.",
    moonComfort: "What actually settles you is a private place, one conversation that tells the whole truth and proof that you are not being lied to.",
    loveSun: "In love you go all in or not at all, you want the whole person and you watch for any sign that someone is holding back.",
    loveMoon: "You feel loved when someone tells you the hard truth to your face, keeps your secrets and stays when you are at your worst.",
    strength: "Your quiet strength is that you can stay in pain, loss or a crisis without flinching, and you come out of it changed rather than broken.",
    edge: "Your growth move is to tell the person what hurt you within a day, in words, before you start the silent test.",
  },
  sagittarius: {
    sunShow: "You say the honest, funny, slightly too blunt thing, make a plan to go somewhere and leave people feeling the world is bigger.",
    sunChase: "freedom, a bigger view, and a life that is not small enough to feel trapped in",
    sunTrap: "You promise more than you can deliver and call it optimism, then leave before the boring part where the promise has to be kept.",
    moonNeed: "Privately you need space, the sense that you can leave, and a person who laughs with you and does not hold you on a leash.",
    moonUpset: "When that is missing, you book a trip, joke through a serious moment or pick a fight about principles to avoid the feeling underneath.",
    moonComfort: "What actually settles you is the outdoors, a long drive, a big idea and a friend who is happy for you to be free.",
    loveSun: "In love you are warm, direct and adventurous, you want a partner for the road, and you bolt when it starts to feel like a cage.",
    loveMoon: "You feel loved when someone supports your plans, comes along on the odd trip and trusts you without checking where you are.",
    strength: "Your quiet strength is that you bounce back: you lose everything, shrug, find the lesson and start the next thing with belief intact.",
    edge: "Your growth move is to stay one hour longer in the conversation you want to leave, and finish the sentence you started about how you feel.",
  },
  capricorn: {
    sunShow: "You turn up on time, do the hard part without complaint and slowly become the person everyone else defers to.",
    sunChase: "respect, a record of real achievement, and a position nobody can take away",
    sunTrap: "You carry everything yourself, treat rest as lazy and then wonder why you feel alone at the top of your own life.",
    moonNeed: "Privately you need to know you are doing enough. You need a plan, a structure and someone who takes care of you without being asked to.",
    moonUpset: "When that is missing, you work harder, go dry and sarcastic, shut off feeling and tell yourself it is fine because there is a deadline.",
    moonComfort: "What actually settles you is a task finished, quiet competence around you and a person who says you do not have to earn this.",
    loveSun: "In love you are slow to open and serious once you do. You show it by paying, planning and being there for years.",
    loveMoon: "You feel loved when someone respects what you have built, takes the load off you on a bad week and stays through the plain years.",
    strength: "Your quiet strength is that you keep going on the plan when the excitement is gone, which is how you end up with what others only talk about.",
    edge: "Your growth move is to ask one person for help with a real task this week and let them do it their way.",
  },
  aquarius: {
    sunShow: "You come across as friendly but a bit apart, with an odd opinion, a sharp idea and a way of seeing the problem from the side.",
    sunChase: "your own mind, a future that is better than the present, and the right to do it your way",
    sunTrap: "You pull away the moment someone gets close or tells you what to do, and then you call your distance independence.",
    moonNeed: "Privately you need your own space, ideas you can think freely about and friends who do not need you to explain your feelings on demand.",
    moonUpset: "When that is missing, you go detached and analytical, disappear for days and describe your own pain like a case study.",
    moonComfort: "What actually settles you is time alone, a project that matters, a group of odd friends and being allowed to be different.",
    loveSun: "In love you want a friend first, you need a partner with their own life and you go quiet when someone demands you prove you care.",
    loveMoon: "You feel loved when someone accepts you without trying to change you, gives you space without a fight and takes your ideas seriously.",
    strength: "Your quiet strength is that you do not need the room to agree with you, so you are first to say the true thing no one else will.",
    edge: "Your growth move is to answer the next personal question with one real feeling instead of an idea.",
  },
  pisces: {
    sunShow: "You soak up the mood in the room, listen without judging and make people feel safe telling you things they have never told anyone.",
    sunChase: "a dissolving of the hard edges of life, through love, music, faith or art, a place where you are understood without explaining",
    sunTrap: "You say what people want to hear, drift out of the plan and rescue the wrong person, then wonder where your own weekend went.",
    moonNeed: "Privately you need quiet hours, softness and someone who does not ask you to be practical when you are overwhelmed.",
    moonUpset: "When that is missing, you take on other people's moods, escape into sleep, screens or a drink, and avoid the bill or message that needs answering.",
    moonComfort: "What actually settles you is water, music, a long sleep and someone who holds you without needing you to explain.",
    loveSun: "In love you give yourself over fast, imagine the best in people and find it hard to leave someone who needs saving.",
    loveMoon: "You feel loved when someone is gentle with you, listens to the whole story and cares about the dreams you were embarrassed to say.",
    strength: "Your quiet strength is that you can sit with someone in their worst hour and make them feel less alone without fixing a thing.",
    edge: "Your growth move is to say no to one request this week without explaining or apologizing, and notice that the person survives.",
  },
};
