// ═══════════════════════════════════════════════════════════════════
// Build-A-Match — House Overlay Readings (web)
//
// EXACT MIRROR of align-app/src/services/buildAMatch/houseInterpretations.ts.
//
// What it means when THEIR body lands in YOUR house.
//
// PURE MODULE — data and lookups only.
//
// ─── Voice ─────────────────────────────────────────────────────────
// Second person. Specific. Behavioural, not descriptive. Say the thing
// only they and the people closest to them know, or the thing they have
// not worked out yet. Never explain the mechanics in third person.
//
// Every reading carries a shadow. A house outcome without its shadow is
// the dishonest version — and Align already computes toxicity, so there
// is no reason to be coy. The same placement is the fire and the danger.
//
// ─── Provenance ────────────────────────────────────────────────────
// House semantics from BUILD_A_MATCH_HOUSE_SYSTEM.md. Houses 2, 5, 6
// and 8 are founder-defined and override convention.
// ═══════════════════════════════════════════════════════════════════

import type { HouseNumber } from './houseSystem';

export interface OverlayReading {
  /** What this brings. */
  light: string;
  /** What the same placement costs. Never omitted. */
  shadow: string;
}

const key = (body: string, house: HouseNumber) => `${body}:${house}`;

/**
 * Readings for the bodies that actually carry each house. Not every
 * body × house pair is written — only the ones that say something. A
 * missing pair falls back to a generic line rather than inventing
 * significance that is not there.
 */
export const OVERLAY_READINGS: Record<string, OverlayReading> = {
  // ═══ 1st — Self, body, presence ═══
  [key('Venus', 1)]: {
    light: 'They find you beautiful before you have done anything to earn it. You will catch them looking.',
    shadow: 'You may start dressing for their eye instead of your own, and not notice when it happened.',
  },
  [key('Mars', 1)]: {
    light: 'They provoke you awake. Your body is louder in the room when they are in it.',
    shadow: 'The same charge turns into friction fast. You will pick fights you did not mean to start.',
  },
  [key('Sun', 1)]: {
    light: 'They see who you actually are and treat that as the interesting part.',
    shadow: 'Their light is strong enough to stand in. Watch for the day your plans became theirs.',
  },
  [key('Jupiter', 1)]: {
    light: 'You take up more room around them. People notice you differently.',
    shadow: 'Confidence borrowed from someone else leaves when they do.',
  },
  [key('Lilith', 1)]: {
    light: 'They wake the part of you that does not apologise. It will feel like relief.',
    shadow: 'That part does not care what it costs you. They will not be the one who talks you down.',
  },
  [key('Chiron', 1)]: {
    light: 'They see the wound you lead with — the one you thought you had covered.',
    shadow: 'Being seen and being healed are not the same. They may only ever be the mirror.',
  },
  [key('Saturn', 1)]: {
    light: 'They take you seriously, and they will not flatter you.',
    shadow: 'You get smaller around them. You will call it maturity for a long time before you call it what it is.',
  },
  [key('Neptune', 1)]: {
    light: 'You feel dreamlike to them, and they to you.',
    shadow: 'Neither of you is seeing an actual person. You lose your outline.',
  },
  [key('Pluto', 1)]: {
    light: 'You come out of this a different person. That is not a metaphor.',
    shadow: 'Remaking and erasing look identical from inside. Ask someone outside it.',
  },

  // ═══ 2nd — Your worth, your assets (founder-defined) ═══
  [key('Jupiter', 2)]: {
    light: 'Your earning moves while they are around. Opportunities, rates, the nerve to ask for more.',
    shadow: 'Expansion with no floor under it. Growth is not the same as security.',
  },
  [key('Venus', 2)]: {
    light: 'They make you feel worth spending on — including by yourself.',
    shadow: 'Feeling valuable and being solvent are different things. Watch the spending.',
  },
  [key('Sun', 2)]: {
    light: 'They see your worth clearly, often before you do, and they say it plainly.',
    shadow: 'A valuation that lives in someone else can be withdrawn.',
  },
  [key('Vesta', 2)]: {
    light: 'They take your craft seriously enough to protect your time for it.',
    shadow: 'Devotion narrows. You may give up things that were also yours.',
  },
  [key('Saturn', 2)]: {
    light: 'They build you a floor. Slow, unglamorous, and it holds.',
    shadow: 'Their standards become the measure of what you are worth. That is a long sentence to serve.',
  },
  [key('Ceres', 2)]: {
    light: 'They provide. Not dramatically — steadily, in ways you stop noticing.',
    shadow: 'Being provided for can quietly replace providing for yourself.',
  },
  [key('Neptune', 2)]: {
    light: 'Money feels less frightening around them.',
    shadow: 'It feels less frightening because you are not looking at it. Check the numbers.',
  },
  [key('Pluto', 2)]: {
    light: 'They see exactly what you are worth and will not let you undersell it.',
    shadow: 'What they can value they can also leverage. Watch who controls what is yours.',
  },
  [key('Lilith', 2)]: {
    light: 'They shake loose a value you inherited and never chose.',
    shadow: 'Some of what they destabilise was actually load-bearing.',
  },

  // ═══ 3rd — Daily mind, conversation ═══
  [key('Mercury', 3)]: {
    light: 'You think out loud with them. Half-formed things arrive finished.',
    shadow: 'Talking about it can substitute for doing it. You will feel productive and move nowhere.',
  },
  [key('Uranus', 3)]: {
    light: 'They say the thing that reorganises your week in one sentence.',
    shadow: 'Constant disruption is not insight. Some weeks you needed to be left alone.',
  },
  [key('Jupiter', 3)]: {
    light: 'Every conversation opens outward. You leave knowing more than you came with.',
    shadow: 'Breadth without depth. A lot of interesting talk, very little settled.',
  },
  [key('Pallas', 3)]: {
    light: 'They see the pattern you have been staring past for a year.',
    shadow: 'Strategy applied to a relationship stops being strategy and starts being management.',
  },
  [key('Moon', 3)]: {
    light: 'You can say the feeling out loud instead of routing around it.',
    shadow: 'Every conversation runs on the day\'s mood. Facts lose.',
  },
  [key('Saturn', 3)]: {
    light: 'They hold you to what you actually said. Your thinking gets rigorous.',
    shadow: 'You start editing yourself before you speak. Eventually you stop speaking.',
  },
  [key('Neptune', 3)]: {
    light: 'You understand each other without finishing sentences.',
    shadow: 'You assume you were understood. You were not. This is where it quietly breaks.',
  },
  [key('Pluto', 3)]: {
    light: 'Nothing stays on the surface. They ask the second question.',
    shadow: 'The second question becomes an interrogation. You will feel watched.',
  },
  [key('Mars', 3)]: {
    light: 'Sharp, fast, alive. You argue well together.',
    shadow: 'Until it is not arguing. The same speed that makes it fun makes it cut.',
  },

  // ═══ 4th — Home, roots, safety ═══
  [key('Moon', 4)]: {
    light: 'They feel like somewhere you already lived. You sleep better.',
    shadow: 'Familiar and good are not synonyms. Check which one this actually is.',
  },
  [key('Ceres', 4)]: {
    light: 'They actually take care of you — fed, warm, noticed. Not the idea of care, the practice of it.',
    shadow: 'Being cared for slides into being managed. Notice when you stopped deciding.',
  },
  [key('Saturn', 4)]: {
    light: 'They build something permanent. Roof, routine, roots that hold weight.',
    shadow: 'Home becomes duty. You will keep showing up long after the warmth went.',
  },
  [key('Venus', 4)]: {
    light: 'Your private life gets beautiful. The place softens around them.',
    shadow: 'Beautiful and honest are different projects. Do not decorate over the problem.',
  },
  [key('Jupiter', 4)]: {
    light: 'Your sense of belonging widens. Their family becomes yours.',
    shadow: 'More people in your home than you agreed to. Space stops being yours.',
  },
  [key('Pluto', 4)]: {
    light: 'They reach the root — the family pattern you have repeated without naming.',
    shadow: 'This is where domestic control lives. Behind your own door, out of everyone\'s sight.',
  },
  [key('Uranus', 4)]: {
    light: 'They break a family pattern you could not break yourself.',
    shadow: 'Nothing settles. You will keep unpacking and never finish.',
  },
  [key('Neptune', 4)]: {
    light: 'Home becomes a sanctuary. Soft, forgiving, unhurried.',
    shadow: 'Sanctuary becomes hiding. You stop going out and call it peace.',
  },

  // ═══ 5th — Romance, play, children, FUN sex (founder-defined) ═══
  [key('Eros', 5)]: {
    light: 'Sex is play with them. Laughing, teasing, unserious in the best way.',
    shadow: 'Play resists depth. When you need it to mean something, it may not know how.',
  },
  [key('Venus', 5)]: {
    light: 'You get courted. Actual romance, not the performance of it.',
    shadow: 'Courtship is a phase. Notice whether anything is being built underneath.',
  },
  [key('Sun', 5)]: {
    light: 'They delight in you openly. You are the good news of their day.',
    shadow: 'Being someone\'s delight is a role. It gets tiring, and you cannot resign from it easily.',
  },
  [key('Jupiter', 5)]: {
    light: 'Abundance of pleasure — and fertility, if that is what you are here for.',
    shadow: 'Excess. More is not automatically better, and this placement does not know that.',
  },
  [key('Mars', 5)]: {
    light: 'The chase is real and it is fun. Physical, direct, energising.',
    shadow: 'The chase is the point. Once caught, watch whether interest survives.',
  },
  [key('Ceres', 5)]: {
    light: 'They are good with children — yours, or the ones you might have.',
    shadow: 'They may want the children more than the partnership. That is a different arrangement.',
  },
  [key('Moon', 5)]: {
    light: 'Warmth toward the child in you, and toward actual children.',
    shadow: 'Moods run the romance. Good days are wonderful; bad ones are cold without explanation.',
  },
  [key('Saturn', 5)]: {
    light: 'They take your creative work seriously enough to make you finish it.',
    shadow: 'They dampen your play. The lightness goes and you will not be able to say when.',
  },
  [key('Neptune', 5)]: {
    light: 'Romance with a dreamlike quality. Genuinely enchanting.',
    shadow: 'You are in love with a story. The person is somewhere behind it.',
  },
  [key('Pluto', 5)]: {
    light: 'Nothing casual survives. What starts as fun goes deep fast.',
    shadow: 'Obsession wearing romance\'s clothes. This is where drama gets mistaken for passion.',
  },
  [key('Uranus', 5)]: {
    light: 'Never boring. They surprise you into feeling young.',
    shadow: 'Affection you cannot schedule. Present, then gone, with no pattern you can learn.',
  },

  // ═══ 6th — Healing, body, daily repair (founder-defined) ═══
  [key('Chiron', 6)]: {
    light: 'They find the old injury — the one your body has been carrying since before you had words for it — and they do not flinch.',
    shadow: 'They may name it before you are ready to hear it, and being named is not being healed.',
  },
  [key('Ceres', 6)]: {
    light: 'They feed you, they notice when you have not slept. Care that shows up as behaviour, not sentiment.',
    shadow: 'Care becomes surveillance. Every meal is observed, every habit has an opinion attached.',
  },
  [key('Vesta', 6)]: {
    light: 'They bring devoted routine. The small daily things finally hold.',
    shadow: 'Routine hardens into ritual you cannot break without a fight.',
  },
  [key('Mercury', 6)]: {
    light: 'They organise your days. The mess in your calendar becomes a system.',
    shadow: 'Optimisation for its own sake. Your life gets efficient and stops being yours.',
  },
  [key('Saturn', 6)]: {
    light: 'Real discipline, applied kindly. Your health improves in ways that last.',
    shadow: 'Criticism dressed as help. You will hear about your body more than you want to.',
  },
  [key('Moon', 6)]: {
    light: 'They tend to you emotionally through the physical — soup, a bath, an early night.',
    shadow: 'Their state decides your routine. When they are unwell, your whole week goes.',
  },
  [key('Neptune', 6)]: {
    light: 'They soften how hard you are on your own body.',
    shadow: 'This is the enabling placement. Things go undiagnosed. Both of you look away together.',
  },
  [key('Mars', 6)]: {
    light: 'They get you moving. Energy where there was inertia.',
    shadow: 'They exhaust you and call it motivation. Your body will send the bill.',
  },
  [key('Pluto', 6)]: {
    light: 'They will not let you keep the habit that is killing you.',
    shadow: 'Control over your body and routine. It starts as concern and does not stay there.',
  },

  // ═══ 7th — Partnership, commitment ═══
  [key('Juno', 7)]: {
    light: 'They think in terms of commitment. Not as pressure — as their native language.',
    shadow: 'Commitment to the institution can outlast commitment to you. They may stay for the marriage, not the person.',
  },
  [key('Venus', 7)]: {
    light: 'Partnership feels easy. Conflict resolves instead of accumulating.',
    shadow: 'Ease is achieved by avoidance. The unsaid things pile up somewhere.',
  },
  [key('Sun', 7)]: {
    light: 'They become central, and they are willing to be.',
    shadow: 'Central becomes the whole. Notice what fell away to make room.',
  },
  [key('Saturn', 7)]: {
    light: 'Durability. They will still be there when it is not fun.',
    shadow: 'Duty replaces love and neither of you says so. This is the cage that looks like devotion.',
  },
  [key('Moon', 7)]: {
    light: 'Emotional partnership — they attune to you without being asked.',
    shadow: 'Two nervous systems with no separation. Their bad day is automatically yours.',
  },
  [key('Pluto', 7)]: {
    light: 'Total involvement. Nothing about this partnership is casual.',
    shadow: 'Power struggle is structural here. The enemy is inside the relationship.',
  },
  [key('Mars', 7)]: {
    light: 'You fight it out rather than letting it rot. Things get said.',
    shadow: 'Open war. The 7th holds partners and open enemies, and this placement can flip which.',
  },
  [key('Neptune', 7)]: {
    light: 'They see the best version of you and treat it as the real one.',
    shadow: 'You are loving an idea. Deception here is often self-deception, on both sides.',
  },

  // ═══ 8th — Shared resources, bills, transformation, PASSIONATE sex (founder-defined) ═══
  [key('Pluto', 8)]: {
    light: 'Total merging. Sex, money, secrets — nothing stays separate and nothing stays surface.',
    shadow: 'This is where jealousy, control and financial leverage live. The intensity you wanted is the same mechanism.',
  },
  [key('Mars', 8)]: {
    light: 'Passion with force behind it. Consuming, physical, not remotely polite.',
    shadow: 'Intensity that turns destructive. The line between passionate and dangerous is thinner here than anywhere.',
  },
  [key('Eros', 8)]: {
    light: 'Desire that does not negotiate. You will think about them when you are trying not to.',
    shadow: 'Compulsion is not chemistry. Notice if you keep returning against your own judgement.',
  },
  [key('Venus', 8)]: {
    light: 'Magnetic. The pull is physical and financial at once — they want to share what they have.',
    shadow: 'Money and desire tangled together is the hardest knot to untie later.',
  },
  [key('Jupiter', 8)]: {
    light: 'Their resources reach your life. Generous with what is theirs, materially, when you need it.',
    shadow: 'Generosity creates obligation whether anyone intends it or not. Track what you owe.',
  },
  [key('Saturn', 8)]: {
    light: 'They bring discipline to shared money. Debts get structured and paid.',
    shadow: 'Withholding. Resources become the lever, and it is used quietly.',
  },
  [key('Moon', 8)]: {
    light: 'You are vulnerable with them in a way you are not with anyone.',
    shadow: 'What they know can be used. Depth is not the same as safety.',
  },
  [key('Lilith', 8)]: {
    light: 'The forbidden charge. Whatever you do not admit wanting, they meet.',
    shadow: 'Wanting what you cannot respect. This placement does not care about your self-image.',
  },
  [key('Neptune', 8)]: {
    light: 'Merging that feels spiritual — dissolving into each other.',
    shadow: 'Hidden debts, unclear money, things not being said. Ask the direct question.',
  },

  // ═══ 9th — Meaning, expansion, belief ═══
  [key('Jupiter', 9)]: {
    light: 'Your world gets bigger. Not fuller — bigger. Different countries, different ideas.',
    shadow: 'Perpetual horizon. Always leaving, never arriving.',
  },
  [key('Mercury', 9)]: {
    light: 'You learn together. Study, argue, change your minds.',
    shadow: 'Debating belief is not sharing it. Check whether you actually agree.',
  },
  [key('Uranus', 9)]: {
    light: 'They break a belief you did not know you were holding.',
    shadow: 'Beliefs replaced faster than they can be tested. Nothing gets to settle.',
  },
  [key('Sun', 9)]: {
    light: 'They embody a philosophy rather than reciting one. You want what they have.',
    shadow: 'Admiration slides into discipleship. You are not supposed to be a student here.',
  },
  [key('North Node', 9)]: {
    light: 'They pull you toward the direction you were already reaching for.',
    shadow: 'A direction that is genuinely yours can still cost you everything else.',
  },
  [key('Neptune', 9)]: {
    light: 'They open the mystical door. Meaning arrives without argument.',
    shadow: 'False teachers and spiritual bypassing. The comfort is real; the truth may not be.',
  },
  [key('Saturn', 9)]: {
    light: 'They make your beliefs rigorous. What survives is load-bearing.',
    shadow: 'Dogma. Your world narrows and they call it discernment.',
  },

  // ═══ 10th — Career, standing, legacy ═══
  [key('Sun', 10)]: {
    light: 'You are more visible with them. Rooms know who you are.',
    shadow: 'Visibility borrowed from a person can be withdrawn by that person.',
  },
  [key('Jupiter', 10)]: {
    light: 'Doors open. Introductions, opportunities, the good kind of luck.',
    shadow: 'Reputation built on their network is not yours. Test whether it holds alone.',
  },
  [key('Saturn', 10)]: {
    light: 'Real authority, earned slowly. They make you build something that lasts.',
    shadow: 'They become your boss. The judgment never quite switches off.',
  },
  [key('Mars', 10)]: {
    light: 'Drive. They push you at your ambition and it works.',
    shadow: 'Competition inside the relationship. Someone has to be winning.',
  },
  [key('Pallas', 10)]: {
    light: 'They see the strategic move you are too close to see.',
    shadow: 'Your career becomes a joint project you did not agree to co-manage.',
  },
  [key('Pluto', 10)]: {
    light: 'They understand power and they will teach you how it actually works.',
    shadow: 'Control of your public image. What they built they can dismantle.',
  },
  [key('Neptune', 10)]: {
    light: 'Your public face softens. You become someone people project onto, warmly.',
    shadow: 'Blurred standing, and this is where scandal attaches. Keep the boundaries visible.',
  },

  // ═══ 11th — Friendship, community, the future ═══
  [key('Uranus', 11)]: {
    light: 'Love that runs on freedom. Friends first, and it holds because nothing is demanded.',
    shadow: 'Freedom always wins. When you need them to choose you, they may not.',
  },
  [key('Venus', 11)]: {
    light: 'Easy affection with no pressure behind it. Genuinely enjoyable.',
    shadow: 'Easy because nothing is at stake. Depth may never arrive.',
  },
  [key('Sun', 11)]: {
    light: 'They light up your circle. Your people are better with them in the room.',
    shadow: 'You share them with everyone. Private time is the thing in short supply.',
  },
  [key('Jupiter', 11)]: {
    light: 'Your network widens. Their people become your people.',
    shadow: 'A social life bigger than your capacity. Everything is a group.',
  },
  [key('North Node', 11)]: {
    light: 'They belong to your future rather than your past. The pull is forward.',
    shadow: 'Future-facing people can be poor at the present, which is where you live.',
  },
  [key('Saturn', 11)]: {
    light: 'They bring seriousness to your friendships. The flaky ones fall away.',
    shadow: 'Isolation, arriving one friend at a time. Count who you have stopped seeing.',
  },
  [key('Neptune', 11)]: {
    light: 'A shared dream of what could be. Collective, hopeful, moving.',
    shadow: 'Unclear loyalties and friends who are not friends. Ask who is actually on your side.',
  },

  // ═══ 12th — The hidden, the buried, the fated ═══
  [key('Psyche', 12)]: {
    light: 'They know you — the part you have never narrated to anyone. Being known like this is rare and it is not comfortable.',
    shadow: 'Being known is not the same as being held. They may see everything and do nothing with it.',
  },
  [key('Neptune', 12)]: {
    light: 'Dissolution. The boundary between you thins and something spiritual happens in the gap.',
    shadow: 'Deception, addiction, escape. This placement will help you hide, and it will be gentle about it.',
  },
  [key('South Node', 12)]: {
    light: 'Recognition with no origin. You have done this before, whatever you believe about that.',
    shadow: 'Familiar is not the same as good. Old patterns feel like home precisely because they are old.',
  },
  [key('Chiron', 12)]: {
    light: 'They reach the wound underneath the wound — the one you do not perform.',
    shadow: 'Some things were buried for a reason and they may not be able to help once it is out.',
  },
  [key('Moon', 12)]: {
    light: 'They feel your mood before you have named it, from another room.',
    shadow: 'No privacy in your own interior. Nothing you feel stays yours first.',
  },
  [key('Pluto', 12)]: {
    light: 'They bring what is buried into the light. It is not gentle and it is not optional.',
    shadow: 'Buried power dynamics, and this house hides them well. Whatever goes wrong here goes wrong out of sight.',
  },
  [key('Saturn', 12)]: {
    light: 'They give structure to what you cannot face. The unbearable becomes schedulable.',
    shadow: 'Isolation and depression. The 12th is where you disappear, and Saturn locks the door.',
  },
};

/** The reading for a body landing in a house, if one is written. */
export function readingFor(body: string, house: HouseNumber): OverlayReading | null {
  return OVERLAY_READINGS[key(body, house)] ?? null;
}

/**
 * Fallback for a pair with no written reading. Deliberately plain — it
 * states the fact rather than inventing significance that is not there.
 */
export function genericReading(body: string, house: HouseNumber, houseTitle: string): OverlayReading {
  return {
    light: `Their ${body} lands in your ${ordinal(house)} — ${houseTitle.toLowerCase()}.`,
    shadow: `Whatever their ${body} does, it does it here, and this house feels it either way.`,
  };
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Bodies whose overlay is worth warning about regardless of what the
 * user asked for. Mirrors the spirit of SHADOW_MIDPOINT_PAIRS: the
 * heavy bodies are the fire AND the danger, and the user is told both.
 */
export const HEAVY_BODIES = new Set(['Pluto', 'Saturn', 'Neptune', 'Lilith', 'Mars']);

/** Does this outcome ask for something that carries a structural shadow? */
export function outcomeCarriesShadow(bodies: string[]): boolean {
  return bodies.some(b => HEAVY_BODIES.has(b));
}
