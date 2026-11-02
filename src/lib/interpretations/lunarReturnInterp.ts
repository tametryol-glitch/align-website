// Lunar Return interpretation engine — monthly emotional weather
// Unlike natal placements, these speak to the transient emotional
// themes of the upcoming lunar cycle (~28 days).

// -----------------------------------------------------------------
// What each planet means *specifically* in a Lunar Return chart
// -----------------------------------------------------------------
export const LUNAR_PLANET_CONTEXT: Record<string, string> = {
  Sun: 'One area of your life keeps pulling you back this month, whether you planned for it or not. Conversations, small events and your own restlessness all circle the same subject until the next lunar return, so the quickest way through is to give it your attention on purpose.',

  Moon: 'Your moods this month follow one clear pattern, and it decides how everything else feels. What you crave, what sets you off and what calms you down all trace back to it, so when you feel off, ask what you actually need and stop blaming the day.',

  Mercury: 'Your head is busy with one particular subject this month. You find yourself texting, reading and talking about it more than usual, and the conversations that find you will be about it. Say the thing you have been rehearsing.',

  Venus: 'What you find attractive shifts this month, and so does what feels like real affection. You notice different people, different clothes, different places, and you may spend money on comfort without much argument. Pay attention to what you keep reaching for, because it tells you what you are short of.',

  Mars: 'Your energy and your temper both go to one area this month. That is where you work hardest, argue fastest and feel strongest in your body. If you have been putting something off there, this is the month you finally have the fuel to do it.',

  Jupiter: 'Somewhere in your life things feel bigger and more possible this month. Offers, invitations and lucky timing show up there, and you feel more generous than usual. It is an open door, not a guarantee, so you still have to walk through it.',

  Saturn: 'One area of your life gets serious this month. A job needs finishing, a rule needs setting or a hard conversation can no longer wait. It feels heavy while you do it, and you feel lighter once it is done.',

  Uranus: 'Something in one area of your life breaks the routine this month. A plan falls through, news arrives out of nowhere, or you suddenly cannot stand a situation you tolerated last week. The less you grip your schedule, the better this goes.',

  Neptune: 'The edges go soft somewhere in your life this month. Your intuition runs strong and your dreams are vivid, but you also see what you want to see, so check the facts on anything involving money or promises. Creative work comes easily now.',

  Pluto: 'Something in your life gets stripped down this month. An old habit stops working, someone\'s hidden motive comes out, or you realise you have been tolerating something you can no longer stand. You will feel pulled to dig into it, so let yourself, and expect it to change something permanently.',

  'North Node': 'There is one uncomfortable thing you should do this month: the call you are avoiding, the risk you keep postponing, the new person you hesitate to approach. It feels slightly wrong because you have never done it before. Do it anyway, and the month goes better.',

  'South Node': 'You fall back on an old habit this month, and it feels comfortable. You already know how to do it, so you do it without thinking, even when it is no longer getting you anywhere. Notice when you reach for the familiar answer and try a different one at least once.',

  Chiron: 'An old hurt comes back up this month, usually in a moment you did not expect. It is not there to hurt you again. You handle it better than you used to, and you may find yourself comforting someone who is going through what you once went through.',

  Ascendant: 'People meet a slightly different version of you this month. The way you come across, how fast you react and how much you show are all adjusted, so the same joke or the same silence lands differently. You are still you, only presented another way.',

  MC: 'Work and public life take up more of your head this month. Who notices what you do, what you are aiming for and whether you are in the right job all come up. If something career-related has been simmering, this month it boils or cools.',

  Juno: 'You think harder about what you want from a partner this month. You notice where your relationship gives you what you need and where it does not, and a small irritation you ignored becomes something you say out loud.',

  Vesta: 'One thing gets your full focus this month: a project, a practice or a cause. You say no to plans that take you away from it, and you guard your time for it. Others may read this as distance, but you are just committed.',

  Lilith: 'You stop being polite in one area of your life this month. You are done performing, softening your opinion or pleasing people who never pleased you back. Some people will not like the unfiltered version, and you will care less than you expect.',

  'Part of Fortune': 'Things go easily in one area of your life this month. When you follow what feels natural there, doors open and effort seems smaller than usual. Luck is not dropped on you, but you are in the right place and the timing helps.',

  Vertex: 'A meeting or event this month feels strangely meant to happen. It is in one specific area of your life, you cannot plan it, and it often comes through an unplanned conversation or a last-minute change of plan. Say yes to the invitation you would normally skip.',

  Ceres: 'You end up feeding, comforting or looking after someone this month, or you notice that you are the one who needs it. Cooking, checking in and showing up count. Ask what you need to eat, rest and be told, and then do it.',

  Pallas: 'You see the pattern in one area of your life that others miss this month. A tangled problem suddenly has an obvious fix, and your plans hold up well. Trust the strategy you work out, and write it down while it is clear.',

  Eros: 'You want something badly this month, or someone. The pull is strong enough that it wakes you up, and it is not only physical. Decide whether to act on it, because ignoring it will make it louder.',

  Psyche: 'You feel exposed this month, and it is uncomfortable. Feelings you usually keep to yourself show on your face, and people notice. You do not need to fix them. Tell one trusted person what is going on and let them see it.',
};

// -----------------------------------------------------------------
// How each sign colors the monthly emotional experience
// -----------------------------------------------------------------
export const LUNAR_SIGN_FLAVOR: Record<string, string> = {
  Aries: 'This month you feel it in your body first. Waiting is unbearable, so you send the message, start the argument or sign up for the class before you have thought it through. Your patience is short and your nerve is high. Start the thing you have been circling, and watch the temper: what feels like righteous passion to you can land as aggression with the person across the table.',

  Taurus: 'This month wants you to slow down and feel what you are feeling instead of rushing past it. Food tastes better, music hits harder and touch means more. Anything that threatens your peace gets a flat no, and you will not be talked out of it. Let yourself enjoy a simple pleasure without guilt, because your body is telling you what real security feels like.',

  Gemini: 'Your mind runs fast this month. You want to talk, text, read, ask and scroll all at once, and you work through feelings by putting them into words. That helps until you start explaining a feeling that needs to be felt. The best move is the conversation you have been rehearsing in your head: have it, badly if you have to.',

  Cancer: 'This month pulls you toward home and the people who feel like home. You pick up every mood in the room and your first instinct is to protect, yourself and everyone you love. You are more tender than usual, and that is not a weakness. Let someone look after you for once. The feelings coming up now are honest ones, even when they are inconvenient.',

  Leo: 'You need to be seen this month, properly seen and not just noticed. Making something, performing something or getting dressed up feels like breathing. Do not shrink yourself to keep other people comfortable. Be honest about the days you are performing confidence because you are afraid of being overlooked. Your heart is generous right now, so let it lead.',

  Virgo: 'This month you want to sort the clutter, physical, mental and emotional. You notice everything out of place and cannot rest until you have fixed it. Aim it at the drawer, not at yourself: you are allowed to be unfinished. Small changes to your daily habits add up to more than a dramatic overhaul would.',

  Libra: 'Other people take up most of your attention this month. You track who is giving, who is taking and where the balance tips, and you crave peace. Getting it probably takes an honest conversation you have been dodging. Your surroundings affect your mood more than usual, so fix the room you spend your evenings in.',

  Scorpio: 'This month has no patience for surface. Small talk, casual plans and half-truths all feel like a waste, and you find yourself digging, researching and sitting with feelings other people avoid. Trust the intensity. What you feel now is real, and it shows you where something is already changing underneath.',

  Sagittarius: 'You need space this month, in your calendar, your head and your map. Routine feels like a closed window, and you are drawn to anything that opens the horizon: a trip, a course, a long talk about what matters, or a drive with no destination. Your optimism is real and so is your restlessness. The hard part is staying with one thing long enough to finish it.',

  Capricorn: 'This month is serious in a good way. You feel steady and ready to build something that lasts, and you react less and plan more. You will take on extra responsibility willingly because you can see the payoff. Put one thing in the week that earns nothing and fixes nothing, and go to it anyway.',

  Aquarius: 'You feel a step removed from your emotions this month, and it helps more than it hurts. From a distance you can see your own patterns clearly. You are drawn to odd people, strange ideas and solutions nobody else would try. Your need for independence is loud, and anyone who tries to pin you down meets a firm wall.',

  Pisces: 'The edge between you and everyone else is thin this month. You soak up the moods around you, your dreams are vivid and your creative instincts run high. It is beautiful and it wears you out. You need more time alone than usual, and the reason is not withdrawal: you are so open that you need hours to sort your feelings from everyone else\'s.',
};

// -----------------------------------------------------------------
// Where the month plays out (by house)
// -----------------------------------------------------------------
export const LUNAR_HOUSE_FOCUS: Record<number, string> = {
  1: 'The spotlight is on you this month: your body, your image, the way you walk into a room. You catch yourself noticing how people react to you. It is a good month for a small reinvention, a new haircut, a new boundary or a new way of introducing yourself, because you are renegotiating how you see the person in the mirror.',

  2: 'Money, comfort and self-worth come up this month. You rethink what you spend on, what you earn and what you value versus what you were told to value. Under the numbers sits a harder question, whether you believe you deserve what you want. Notice what makes you anxious or pleased about money, because both reactions are telling you something.',

  3: 'Your head is busy this month and conversations count for more than usual. A text exchange changes your view, or an offhand chat plants an idea that grows. You feel drawn to writing, learning, or getting back in touch with a sibling or a neighbour. Your mind is hungry, so feed it something worth chewing on.',

  4: 'Home and family take over your feelings this month. You get pulled back to your roots: old memories, a call to a parent, or nesting in your own space until it feels like yours. Feelings tied to childhood come up without warning. Use the month to fix something at the foundation, because everything else sits on it.',

  5: 'Joy, romance and play are calling this month. You want to make something, flirt, perform or have fun with no agenda. If you are dating, the month has a spark in it, and if you make art, ideas come easily. The one rule is to stop checking your to-do list in the middle of it.',

  6: 'Your daily life asks for attention this month: routines, health, work habits and how you treat yourself on an ordinary Tuesday. It is not glamorous. You feel like cleaning up your diet, sorting your schedule or finally booking the appointment you keep putting off. Small, steady changes now beat any dramatic gesture.',

  7: 'One-on-one relationships are the main event this month, whether it is a partner, a business contact or a close friend. You need something specific from the other person, honesty, support or space, and this month you cannot pretend you do not. What bothers you most about them is worth a second look, because it often says something about you.',

  8: 'This month takes you into deep water: intimacy, shared money, power and the subjects nobody raises at dinner. You feel raw, charged or pulled to investigate something hidden. A trust issue or a money tangle may need sorting out. Whatever comes up is asking you to be honest about what you need from the people you are tied to.',

  9: 'Your world widens this month and you feel a pull toward something more. You sign up for a course, meet a teacher, plan a trip or catch yourself questioning a belief you never examined. Ordinary routine is not enough right now. You want meaning, perspective, and the thrill of not having it all figured out.',

  10: 'Career and reputation come to the front this month. You think about what you are building, how you are seen and whether your work matches who you are becoming. A conversation with a boss, an offer or a moment of visibility could set the tone for the month. The pressure is real, and so is the chance to move forward.',

  11: 'Friends, groups and your hopes for the future light up this month. You feel pulled toward your social circle, a cause or an online community, and you think more about the world you want to live in. Notice which friends leave you energised and which leave you drained. This month shows you who your people are and what you are all working toward.',

  12: 'This month asks you to go quiet. Nothing is wrong: the real work is happening in your dreams, your time alone and the thoughts you do not say aloud. You want to rest, retreat or sit with feelings that have no clear label. Old patterns and past hurts may surface. Do not rush it, because rest does more here than effort.',
};

// -----------------------------------------------------------------
// Assemble the full lunar-return interpretation
// -----------------------------------------------------------------
function ordinal(n: number): string {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

export function getLunarReturnInterpretation(
  planetName: string,
  sign: string,
  house: number,
): string {
  const planetCtx = LUNAR_PLANET_CONTEXT[planetName];
  const signFlavor = LUNAR_SIGN_FLAVOR[sign];
  const houseFocus = LUNAR_HOUSE_FOCUS[house];

  // Graceful fallback: if we have no lunar-return data for this body,
  // return an empty string so the caller can decide whether to fall
  // back to generic text.
  if (!planetCtx) return '';

  let interp = `**${planetName} in your Lunar Return:**\n${planetCtx}\n\n`;

  if (signFlavor) {
    interp += `**${planetName} in ${sign} this month:**\n${signFlavor}\n\n`;
  }

  if (houseFocus) {
    interp += `**In your ${ordinal(house)} house this month:**\n${houseFocus}`;
  }

  return interp;
}
