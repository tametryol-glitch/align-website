// Lunar Return interpretation engine — monthly emotional weather
// Unlike natal placements, these speak to the transient emotional
// themes of the upcoming lunar cycle (~28 days).

// -----------------------------------------------------------------
// What each planet means *specifically* in a Lunar Return chart
// -----------------------------------------------------------------
export const LUNAR_PLANET_CONTEXT: Record<string, string> = {
  Sun: 'The Sun in your lunar return shows where your conscious attention is being pulled this month. It lights up a specific area of your life and says: *this is what matters right now.* You may not choose this focus — it chooses you. Events, conversations, and inner urges will keep steering you back to this theme until the next lunar return.',

  Moon: 'The Moon is the heart of the lunar return — it is *you* this month. Its sign and house reveal the emotional lens through which you will experience everything over the next few weeks. Your moods, your cravings, your instinctive reactions — they all flow from here. Pay close attention, because this placement is describing exactly how you need to feel in order to feel like yourself right now.',

  Mercury: 'Mercury in your lunar return shapes how your mind works this month — what you think about, how you communicate, and what kind of conversations find you. You may notice a shift in what you want to talk about, what you are reading, or who you are texting. Your mental energy has a specific flavor right now, and this placement tells you what it is.',

  Venus: 'Venus in your lunar return reveals what brings you pleasure this month and how you want to connect with people. Your taste may shift — what you find attractive, what feels beautiful, what kind of affection satisfies you. This is also where money and comfort themes show up. Notice what you are drawn to over the next few weeks; Venus is whispering.',

  Mars: 'Mars in your lunar return shows where your energy and drive are focused this month. This is where you will feel motivated, where conflicts may arise, and where you have the most physical vitality. If you have been putting something off, check whether Mars is lighting that area up — it might be handing you the fuel you have been waiting for.',

  Jupiter: 'Jupiter in your lunar return brings a sense of expansion, optimism, or opportunity to one area of your life this month. Something feels bigger, more possible, more generous. This is where good luck lives for the next few weeks — not a guarantee, but an open door. The question is whether you will walk through it.',

  Saturn: 'Saturn in your lunar return highlights where you feel the weight of responsibility this month. Something here needs structure, discipline, or a hard conversation. It is not punishment — it is the area of your life asking you to show up as an adult. The reward comes later, but the effort is required now.',

  Uranus: 'Uranus in your lunar return marks where something unexpected may shake things loose this month. Plans change, insights arrive without warning, or you suddenly feel restless in an area of life that was perfectly fine yesterday. This is liberating if you let it be. The less you grip, the more exciting it gets.',

  Neptune: 'Neptune in your lunar return softens and blurs one area of your life this month. Your intuition is heightened here, but so is the potential for confusion. Dreams may be vivid, creative inspiration may flow, and you might romanticize something that needs clearer seeing. Trust your gut, but verify the details.',

  Pluto: 'Pluto in your lunar return intensifies one area of your life this month. Something here is being transformed beneath the surface — old patterns dying, power dynamics shifting, hidden truths surfacing. You may feel a compulsive pull toward this theme. Do not resist it. Pluto does not negotiate; it renovates.',

  'North Node': 'The North Node in your lunar return points to your growth edge this month. There is something unfamiliar calling you — a behavior, a conversation, a risk that feels slightly uncomfortable but deeply right. Lean toward it. This month has a lesson, and the North Node is showing you the classroom.',

  'South Node': 'The South Node in your lunar return shows where you might retreat to old habits this month. It is comfortable but stagnant. You already know how to do this; the question is whether doing it again actually serves you. Notice when you are defaulting to familiar patterns instead of stretching.',

  Chiron: 'Chiron in your lunar return touches a tender spot this month. An old wound may resurface — not to hurt you again, but to show you how far you have come in healing it. You may find yourself unusually empathetic or drawn to helping others through something you once struggled with yourself.',

  Ascendant: 'The Ascendant of your lunar return sets the emotional tone for the entire month. It describes the face you are wearing, the energy you are projecting, and the way the world receives you right now. Think of it as your monthly costume — same person underneath, different presentation.',

  MC: 'The Midheaven of your lunar return highlights your public life and career this month. It shows how you are seen professionally, what ambitions are activated, and where you feel the pull of purpose. If career matters have been simmering, this placement shows where the heat is.',

  Juno: 'Juno in your lunar return focuses your attention on commitment and partnership dynamics this month. You may find yourself thinking more carefully about what you need from a partner — or noticing where current relationships are meeting or missing the mark.',

  Vesta: 'Vesta in your lunar return reveals what you are devoted to this month — the thing you will pour yourself into with quiet, focused intensity. It might be a project, a spiritual practice, or a cause. Whatever it is, you will feel protective of this flame.',

  Lilith: 'Lilith in your lunar return activates your raw, unapologetic side this month. Something here refuses to be polished or made palatable. You may feel a fierce need for authenticity — a refusal to perform or people-please in this area of your life.',

  'Part of Fortune': 'The Part of Fortune in your lunar return marks where joy and flow converge this month. It is not about luck falling from the sky — it is about alignment. When you follow this placement naturally, things click into place with surprising ease.',

  Vertex: 'The Vertex in your lunar return suggests that a fateful encounter or event may occur this month in a specific area of your life. You cannot plan for it — the Vertex operates through synchronicity. Just stay open to meaningful coincidences.',

  Ceres: 'Ceres in your lunar return shapes how you nurture yourself and others this month. You may feel called to feed, comfort, or tend to someone — or you may realize you are the one who needs tending. Pay attention to what nourishes you right now.',

  Pallas: 'Pallas in your lunar return sharpens your strategic mind this month. You can see patterns others miss, and your ability to devise solutions is heightened in a specific area of your life. Trust your analytical instincts — they are unusually sharp right now.',

  Eros: 'Eros in your lunar return intensifies your desires this month. There is a passionate pull toward something — or someone — that makes you feel vividly, electrically alive. It goes beyond the physical; this is about the kind of intensity that wakes you up.',

  Psyche: 'Psyche in your lunar return brings your psychological vulnerability to the surface this month. You may feel exposed in ways that are both uncomfortable and transformative. The wounds that surface are asking to be witnessed, not fixed.',
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
