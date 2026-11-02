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

  Jupiter: 'One area of your life feels bigger and more possible this month. Offers, invitations and lucky timing show up there, and you feel more generous than usual. It is an open door, not a guarantee, so you still have to walk through it.',

  Saturn: 'One area of your life gets serious this month. A job needs finishing, a rule needs setting or a hard conversation can no longer wait. It feels heavy while you do it, and you feel lighter once it is done.',

  Uranus: 'Something in one area of your life breaks the routine this month. A plan falls through, news arrives out of nowhere, or you suddenly cannot stand a situation you tolerated last week. The less you grip your schedule, the better this goes.',

  Neptune: 'One area of your life goes soft around the edges this month. Your intuition runs strong and your dreams are vivid, but you also see what you want to see, so check the facts on anything involving money or promises. Creative work comes easily now.',

  Pluto: 'One area of your life gets stripped down this month. An old habit stops working, someone\'s hidden motive comes out, or you realise you have been tolerating something you can no longer stand. You will feel pulled to dig into it, so let yourself, and expect it to change something permanently.',

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
  Aries: 'This month you feel it in your body first. A restless energy, a need to *do something* rather than wait. Your patience is shorter, your courage is higher, and your instinct is to act now and process later. You may surprise yourself with how boldly you speak up. Channel the fire — start the thing you have been circling. Just watch the temper; what feels like righteous passion to you might land as aggression to someone else.',

  Taurus: 'This month wants you to slow down and actually feel what you are feeling instead of rushing past it. Your senses are heightened — food tastes better, music hits deeper, physical touch means more. You crave comfort and stability, and anything that threatens your peace will get a firm "no." Let yourself enjoy simple pleasures without guilt. Your body is trying to tell you something about what genuine security feels like.',

  Gemini: 'Your mind is electric this month. You want to talk, text, read, learn, debate, scroll, question — all of it, all at once. You are processing emotions through words and ideas rather than sitting in silence with them. That is fine, but notice if you are intellectualizing feelings that actually need to be felt. The best thing you can do this month is have the conversation you have been rehearsing in your head.',

  Cancer: 'This month pulls you inward, toward home and the people who feel like home. Your emotional antennae are picking up every signal in the room, and your instinct is to protect and nurture — both yourself and the people you love. You may feel more vulnerable than usual, and that is not weakness. Let yourself need people. The feelings surfacing now are honest ones, even if they are inconvenient.',

  Leo: 'You need to be seen this month — really seen, not just noticed. There is a warmth radiating from you that wants an audience, and creative self-expression feels like breathing. Do not dim yourself to make others comfortable. At the same time, watch for the difference between genuine confidence and performing confidence because you are afraid of being overlooked. Your heart is generous right now. Let it lead.',

  Virgo: 'This month brings a quiet, focused energy that wants to sort through the clutter — physical, mental, emotional. You notice everything that is out of place, and you feel compelled to fix it. That impulse is valuable, but be careful not to turn it inward as self-criticism. You are allowed to be a work in progress. Channel the Virgo precision into your daily habits; small improvements compound into real change.',

  Libra: 'Relationships are everything this month. You are tuned in to the dynamics between you and other people — who is giving, who is taking, where the balance tips. You crave harmony, but achieving it might require an honest conversation you have been avoiding. Beauty matters right now too; your environment affects your mood more than usual. Surround yourself with things that feel aesthetically right.',

  Scorpio: 'This month has depth. You are not interested in surface-level anything — small talk, casual plans, half-truths. Something in you needs to get to the bottom of things, and you may find yourself researching, probing, or sitting with emotions that most people would rather avoid. Trust the intensity. The things you are feeling this month are real, and they are showing you where transformation is already happening beneath the surface.',

  Sagittarius: 'You need space this month — physical, mental, philosophical space. Routine feels suffocating, and you are drawn to anything that broadens your horizons: travel, learning, deep conversations about meaning, or simply a long drive with no destination. Your optimism is genuine right now, but so is your restlessness. The challenge is not finding inspiration — it is committing to one thing long enough to see it through.',

  Capricorn: 'This month is serious in the best way. You feel grounded, focused, and ready to build something that matters. There is a maturity to your emotional responses — you are less reactive, more strategic. You may take on extra responsibility willingly because you can see the long-term payoff. Just remember that efficiency is not the same as living. Schedule something that has no productive purpose whatsoever.',

  Aquarius: 'You feel slightly detached from your emotions this month, and that is not necessarily a bad thing. There is a clarity that comes from stepping back and observing your own patterns from a distance. You are drawn to the unconventional — unusual people, unexpected ideas, solutions nobody else has considered. Your need for independence is strong; anyone trying to box you in will meet resistance.',

  Pisces: 'The boundaries between you and everything else feel thinner this month. You are absorbing the moods of the people around you, your dreams are more vivid, and your creative instincts are unusually strong. This is beautiful and also exhausting. You need more solitude than usual — not because you are withdrawing, but because you are *so open* that you need time to sort your feelings from everyone else\'s.',
};

// -----------------------------------------------------------------
// What each house means for the month ahead (emotionally rich)
// -----------------------------------------------------------------
export const LUNAR_HOUSE_FOCUS: Record<number, string> = {
  1: 'The spotlight is on *you* this month — your body, your image, the energy you walk into a room with. You may feel more self-aware than usual, noticing how people respond to your presence. This is a month for personal reinvention, even in small ways. A new haircut, a new boundary, a new way of introducing yourself. You are recalibrating your relationship with the person you see in the mirror.',

  2: 'Money, comfort, and self-worth are front and center this month. You may find yourself reconsidering what you spend on, what you earn, or what you truly value versus what you have been told to value. This is not just about your bank account — it is about the deeper question of whether you believe you deserve to have what you want. Notice what triggers financial anxiety or pleasure; both are teaching you something.',

  3: 'Your mental world is buzzing this month. Conversations carry more weight than usual — a text exchange could shift your perspective, a casual chat could plant an idea that grows into something significant. You may feel drawn to writing, learning, or reconnecting with siblings, neighbors, or people in your immediate environment. Your mind is hungry; feed it something worth chewing on.',

  4: 'Home and family dominate your emotional landscape this month. You may feel pulled back to your roots — revisiting memories, reconnecting with parents, or simply nesting in your space and making it feel more like *yours*. Old feelings may surface, especially ones connected to childhood or the family dynamics that shaped you. This is a month for tending the foundation everything else is built on.',

  5: 'Joy, creativity, romance, and play are calling you this month. Something in you wants to create, flirt, perform, or simply have fun without any agenda. If you have children, they may be a bigger focus right now. If you are dating, this month has a sparkle to it. If you are an artist, inspiration is close. The only rule: do not skip the pleasure to check your to-do list.',

  6: 'Your daily life is asking for attention this month — your routines, your health, your work habits, the way you take care of yourself on an ordinary Tuesday. It is not glamorous, but it is the foundation. You may feel motivated to clean up your diet, organize your schedule, or address a health concern you have been ignoring. Small, consistent adjustments this month lead to bigger shifts than any dramatic gesture would.',

  7: 'Partnerships are the main event this month. Whether romantic, business, or a close friendship, your one-on-one relationships are where the emotional action is. You may need something specific from a partner — honesty, support, space — and this month makes it impossible to ignore that need. Mirror dynamics are strong: what bothers you about someone else might be showing you something about yourself.',

  8: 'This month takes you into deep water — intimacy, shared finances, power dynamics, things that are not talked about at dinner parties. You may feel emotionally raw, sexually charged, or drawn to investigate something hidden. Trust issues might surface, or a financial entanglement might need untangling. Whatever comes up, it is asking you to be honest about what you need from the people you are merged with.',

  9: 'Your world is expanding this month, and you feel it as a pull toward something *more*. Travel — physical or philosophical — is highlighted. You may sign up for a course, discover a teacher, plan a trip, or simply find yourself questioning beliefs you used to accept without thinking. The mundane is not enough right now. You need meaning, perspective, and the exhilarating feeling that you do not have it all figured out.',

  10: 'Career and public reputation take center stage this month. You are thinking about your legacy — what you are building, how you are perceived, and whether your professional life actually reflects who you are becoming. A career opportunity, a conversation with a boss, or a moment of public visibility may define this month. The pressure is real, but so is the potential for meaningful progress.',

  11: 'Community, friendship, and your vision for the future are lit up this month. You may feel drawn to your social circle, get involved in a group or cause, or simply think more about the kind of world you want to live in. Pay attention to which friendships energize you and which ones drain you. This month clarifies who your real people are — and what you are all working toward together.',

  12: 'This month asks you to go quiet. Not because something is wrong, but because the most important work is happening beneath the surface — in your dreams, your solitude, your subconscious. You may feel the need to retreat, rest, or process emotions that do not have clear labels. Old patterns, past hurts, or spiritual longings may surface. Do not rush this. The 12th house heals through surrender, not effort.',
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
