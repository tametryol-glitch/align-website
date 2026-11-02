// Solar Return predictive interpretation engine
// Generates a deeply personal year forecast using sign, duad, compendium layers
// and the houses those signs fall on — without mentioning "duad" or "compendium"

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

// -- Duad / Compendium calculation (same as AstroEinstein engine) --------

function calculateDuad(sign: string, degreeInSign: number): string {
  const d = Math.max(0, Math.min(29.999, degreeInSign));
  const idx = Math.min(11, Math.floor(d / 2.5));
  const signIdx = (SIGNS.indexOf(sign) + idx) % 12;
  return SIGNS[signIdx];
}

function calculateCompendium(duadSign: string, degreeInSign: number): string {
  const d = Math.max(0, Math.min(29.999, degreeInSign));
  const withinDuad = d % 2.5;
  const subSize = 2.5 / 12.0;
  const idx = Math.min(11, Math.floor(withinDuad / subSize));
  const signIdx = (SIGNS.indexOf(duadSign) + idx) % 12;
  return SIGNS[signIdx];
}

function findHouseForSign(sign: string, houseCusps?: number[]): number | null {
  if (!houseCusps || houseCusps.length < 12) return null;
  const signLon = SIGNS.indexOf(sign) * 30 + 15;
  for (let i = 0; i < 12; i++) {
    const start = houseCusps[i];
    const end = houseCusps[(i + 1) % 12];
    if (start <= end) {
      if (signLon >= start && signLon < end) return i + 1;
    } else {
      if (signLon >= start || signLon < end) return i + 1;
    }
  }
  return 1;
}

// -- Sign energy descriptions (plain language) --------

const SIGN_ENERGY: Record<string, { surface: string; deep: string; drive: string }> = {
  Aries:       { surface: 'impatient and already moving while everyone else is still deciding', deep: 'a need to prove you can do it alone, with nobody\'s permission', drive: 'the urge to start things before you feel ready' },
  Taurus:      { surface: 'steady, slow to move and hard to talk out of what you want', deep: 'a need for something solid you can touch and count on tomorrow', drive: 'the slow work of building something that no bad year can take back' },
  Gemini:      { surface: 'quick, chatty and two topics ahead of the room', deep: 'a mind that will not switch off and keeps collecting facts as if the right one would settle everything', drive: 'the need for new people and new information, because boredom feels like being locked in' },
  Cancer:      { surface: 'guarded, protective and tuned in to what everyone in the room is feeling', deep: 'a need to know the people you love are safe and that you have somewhere soft to land, which can look like anxiety', drive: 'making a home, a family or an inner life where you can finally relax' },
  Leo:         { surface: 'warm, generous and hard to miss when you walk in', deep: 'a need to be loved for the real you and not for the performance', drive: 'putting your heart into your work or your love and letting people watch' },
  Virgo:       { surface: 'precise, quietly capable and already fixing what is off', deep: 'a nagging voice saying you could have done that better', drive: 'being useful and getting the details right while others chase the credit' },
  Libra:       { surface: 'smooth, fair-minded and calming to be around', deep: 'a need for a partner who treats you as an equal, and real discomfort when things are unfair or ugly', drive: 'keeping the peace in your relationships and your surroundings, because a balanced room makes you feel better' },
  Scorpio:     { surface: 'intense, watchful and hard to fool', deep: 'a need to find the hidden motive behind everything, because you cannot relax around lies', drive: 'going into the subjects other people avoid, such as grief, desire, power and loss, because that is where things change for you' },
  Sagittarius: { surface: 'restless, upbeat and halfway out the door to somewhere new', deep: 'a need for life to mean something bigger, and a feeling of being caged when it does not', drive: 'stretching your world through travel, study and big ideas, because a small life feels like a slow loss' },
  Capricorn:   { surface: 'composed, strategic and used to being the one in charge', deep: 'a private fear of working for years and having nothing lasting to show for it', drive: 'the patient, unglamorous work of building something that outlasts you' },
  Aquarius:    { surface: 'independent, cool-headed and years ahead of the people around you', deep: 'a pull to belong that sits next to a flat refusal to shrink yourself to fit', drive: 'thinking for yourself and building ideas that work for everyone, even if you stand alone doing it' },
  Pisces:      { surface: 'soft, open and easy for people to confide in', deep: 'a sensitivity that soaks up everyone\'s mood and makes ordinary life feel thin', drive: 'letting your guard down, forgiving and feeling everything, even when it costs you' },
};

// -- House life areas (bold, specific) --------

const HOUSE_LIFE: Record<number, { area: string; specific: string }> = {
  1:  { area: 'who you are becoming, including your body, your presence and the version of yourself the world is about to meet', specific: 'you will look different, carry yourself differently, and leave a different impression on everyone you encounter; this is not subtle, it is a visible metamorphosis that begins from the inside and works its way out' },
  2:  { area: 'your relationship with money, material security and your own sense of worth', specific: 'what you earn, what you refuse to settle for, and the price you put on your own time and talent; something shifts here that rewires how you think about abundance and what you believe you deserve' },
  3:  { area: 'the conversations that change your mind, the ideas that keep you up at night and the words you finally say out loud', specific: 'a piece of information arrives, through a conversation, a message, a book or a passing comment, and rearranges your understanding of something important; a sibling, neighbor, or close contact plays a surprisingly pivotal role' },
  4:  { area: 'the place you call home, the family that shaped you and the emotional ground you stand on', specific: 'a move, a renovation, a family reckoning, or an emotional excavation of your roots. By the end of this year, where you live or how you relate to your origins will be fundamentally different' },
  5:  { area: 'the things that make you feel alive: romance, creative expression, play and the courage to be seen', specific: 'a love affair ignites or reignites, a creative project demands to be born, a child-related event reshapes your world, or you finally give yourself permission to experience joy without guilt' },
  6:  { area: 'the habits that hold your life together, including your health, your daily work and the unglamorous routines', specific: 'your body sends a message you cannot ignore, your work situation transforms, or you dismantle and rebuild your daily routine from the ground up; the small things become the big things this year' },
  7:  { area: 'the person standing across from you, including your partnerships, your commitments and the mirror only another human can hold up', specific: 'a relationship begins that changes your trajectory, an existing bond is tested and either deepens into something unshakeable or reveals itself as finished; there is no neutral ground here' },
  8:  { area: 'the territory most people avoid: intimacy, shared money, psychological depth and the death of who you used to be', specific: 'money arrives or departs through another person, a sexual or emotional bond reaches a depth that permanently alters you, a debt or settlement reshapes your reality, or something inside you dies so something truer can take its place' },
  9:  { area: 'the horizon you have been staring at: travel, education, philosophy and the beliefs that give your life its shape', specific: 'a journey to a place that rewrites your sense of the world, a return to learning that feels like coming home, a legal matter that demands your attention, or a moment where everything you thought you believed is quietly replaced by something more honest' },
  10: { area: 'your place in the world, including your career, your reputation and the legacy you are building whether you realize it or not', specific: 'a promotion, a pivot, a public moment that defines how others see you; what happens in your professional life this year will echo for a long time, and the decisions you make here are not reversible' },
  11: { area: 'the people who share your vision, including your friendships, your communities and the dreams you are brave enough to say out loud', specific: 'your social world reshuffles in ways that feel both unsettling and liberating, a group or cause becomes central to your identity, or a dream you have quietly carried for years finally shows the first unmistakable signs of becoming real' },
  12: { area: 'the hidden world beneath your waking life, including your subconscious, your spiritual path and the parts of yourself you have never shown anyone', specific: 'you withdraw not because you are broken but because something sacred is forming in the silence; old wounds surface for healing, vivid dreams deliver messages your conscious mind cannot access, and patterns you never knew were running your life finally become visible' },
};

// -- Bold prediction templates per planet per house --------

const BOLD_PREDICTIONS: Record<string, Record<number, string>> = {
  Sun: {
    1: 'You are not tweaking your life this year; you are rewriting your entire introduction. There will be a moment, probably sooner than you expect, when you look in the mirror and realize you are becoming someone you have never been before. Your body changes. Your style shifts. The way you walk into a room feels different. People who knew the old you will struggle to reconcile that person with who you are now, and some of them will not be able to handle it. Let them go. The person emerging this year is closer to the truth of you than anything that came before.',
    2: 'Money is about to tell you something about yourself this year. Expect a money moment: a raise you finally ask for, an income stream from an unexpected direction, or a purchase that feels terrifyingly indulgent and sits right with you afterward. But the deeper shift is not about the number in your account. It is about the number you have been assigning to your own worth. That changes this year. And once it does, every negotiation, every relationship, every decision will recalibrate around a version of you that no longer apologizes for wanting more.',
    3: 'A single conversation will split this year into before and after. You will hear something, or say something that cannot be unsaid, and from that moment forward, the way you think about a situation, a person, or yourself will be permanently different. You may also feel called to write, teach, or share an idea publicly for the first time. Pay attention to what your mind keeps circling back to at 2am; that is not anxiety, that is your intelligence trying to tell you where to point your attention. A sibling, neighbor, or someone in your immediate circle plays a role in this year that neither of you expected.',
    4: 'Something is shifting at the deepest level of your life: the foundation, the roots, the place you come from and the place you return to when everything else falls away. You may physically move, renovate, or completely change your living situation. But even if your address stays the same, your relationship to home, meaning what it is, who belongs there and what emotional safety feels like, will be unrecognizable by the end of this year. There is a reckoning with a parent or family pattern that has been waiting for you. It is not coming to punish you. It is coming to free you.',
    5: 'Love is not a possibility this year; it is an inevitability. The only question is what form it takes. If you are single, someone is coming into your orbit who will make you feel alive in a way you had started to think was behind you. If you are partnered, your relationship is about to find a new frequency: rawer, more playful, more honest. But love is not the only thing demanding your attention here. A creative impulse is building in you that refuses to be ignored. A project, an idea, a piece of work that carries your fingerprint will take shape this year, and looking back, you will recognize it as one of the most authentically yours things you have ever made.',
    6: 'Your body knows things your mind has been refusing to hear, and this year it will stop whispering and start speaking at full volume. Your body gives you a signal you can no longer talk yourself out of, and the way you have been treating it stops working. If something has nagged you for months, get it looked at. At the same time, your daily work life undergoes a transformation. A new role, a shift in responsibilities, a colleague who changes your professional trajectory, or the realization that you have been pouring your best hours into the wrong thing. The small, daily decisions you make this year: what you eat, when you sleep, how you spend your first hour, will compound into something that reshapes your entire reality.',
    7: 'There is a person at the center of this year. Not in the background, not as a subplot, at the center. If you are single, someone is coming who will make you reconsider what you thought you wanted. They will not match the checklist in your head, and that is exactly why they matter. If you are in a relationship, the next twelve months will take your partnership somewhere it has never been: a level of honesty, vulnerability, and mutual recognition that either cements you together permanently or reveals that you have been holding onto something that has already ended. A contract, agreement, or formal commitment may also be signed. This year, your life is defined by who you choose to stand next to.',
    8: 'This is the year something in you dies, and you should let it. There is a version of yourself, a fear, a financial arrangement, a secret, or an emotional debt that has been taking up space in your psyche for too long. This year, the universe is not asking you to let go. It is prying your fingers off the ledge. Money tied to someone else, such as a shared account, a settlement or a debt, comes up for a decision. Intimacy reaches a level that feels almost dangerous, not because it is harmful but because it requires you to be so nakedly honest that every defense you have ever built becomes useless. On the other side of this year, you will weigh less. Not on a scale. Inside.',
    9: 'You are going somewhere this year, and I do not just mean geographically, although a significant trip is very likely. I mean that your entire framework for understanding the world is about to be disassembled and rebuilt. A book, a teacher, a foreign culture, a legal proceeding, or a spiritual experience will introduce an idea that does not fit inside your current belief system, and instead of rejecting it, you will realize that your belief system is what needs to change. This is the year you outgrow the intellectual container you have been living in. It will feel disorienting. It will also feel like the most honest thing that has ever happened to you.',
    10: 'The world is about to learn your name, or learn it differently. Your career takes a turn this year that you will still be talking about a decade from now. A promotion, a public achievement, a professional pivot, or a moment of recognition that puts you on a different level. But here is what the chart is really saying: this is not just about professional success. This is about stepping into your authority. Owning that you are good at what you do. Letting people see your ambition without softening it or apologizing for it. Someone in a position of power is watching you this year. What they see will open a door.',
    11: 'Your social world is about to be reorganized by forces larger than preference or convenience. Some friendships will deepen into the kind of bonds that survive anything. Others, the ones held together by habit, proximity, or guilt, will quietly dissolve, and you will feel the absence as relief. A group, organization, or community becomes genuinely important to your sense of purpose. And here is the prediction that will make your chest tighten when you read it: a dream you have been carrying for years, one you may have stopped talking about because you were afraid of sounding naive, will show its first undeniable signs of becoming real. Not someday. This year.',
    12: 'The most important things that happen to you this year will happen in silence. You will feel a pull to withdraw, not from depression, but from necessity. Something inside you is asking for stillness, for attention, for the kind of listening that can only happen when the noise stops. A spiritual experience, a vivid dream, a moment of unexpected clarity in meditation or therapy will deliver a piece of information that your conscious mind could never have reached on its own. Trust it. Old patterns, the ones you inherited, the ones you adopted to survive, the ones you did not even know were running your life, will become visible this year. And visibility is the first step to freedom.',
  },
  Moon: {
    1: 'You will not be able to hide what you feel this year, and the attempt to do so will only exhaust you. Your emotions will live on the surface of your skin, in your eyes, in the way your voice breaks at unexpected moments. This is not weakness; it is the most powerful thing that will happen to you. Someone will be deeply, permanently changed by witnessing your unguarded truth. Your face, your body, the way you present yourself to the world will shift in response to the emotional tides moving through you, and the person who emerges is someone people will trust instinctively, because you will finally look like how you actually feel.',
    2: 'Money and feelings are so deeply braided together this year that you will not be able to address one without confronting the other. A financial worry will reveal an emotional wound. Extra money, when it comes, buys a sense of safety you have been chasing for longer than you realize. You are tempted by a purchase that makes no logical sense: emotional, impulsive, a little reckless. Sleep on it, then notice what it was really for. Your relationship with money is really a relationship with your own worthiness, and this year, that relationship finally gets honest.',
    3: 'Words will carry the weight of earthquakes this year. A conversation is coming, with a sibling, a friend, a neighbor, or someone you interact with daily, that will reach into your chest and rearrange something. You will replay it for weeks. A message arrives: a text you did not expect, a letter that feels like it was written in a different era, an email that lands at the exact moment you needed to hear it, and it shifts how you feel about someone or something in a way that cannot be reversed. Your own words carry unusual power too. What you say this year heals people. Choose carefully, because it also has the power to wound.',
    4: 'This is the year your family history catches up to you, not to harm you, but to be healed. A parent or family member needs you in a way that pulls you deep into the emotional waters of your childhood. Or you need to go back to something you left behind: a house, a city, a feeling of safety that you lost and have been quietly searching for ever since. You may cry more this year than you have in a long time. Do not fight it. The tears are not a symptom of something wrong; they are the sound of something old finally breaking open so something new can grow in its place. Your definition of home is being rewritten from the inside.',
    5: 'Joy is going to find you this year in a way that catches you completely off guard. You have been functioning, managing, coping, and suddenly something or someone will make you feel genuinely, ridiculously alive. You will fall in love, with a person, with a creative project, with a part of yourself you thought you had outgrown. If children are part of your life, they will be the source of emotional moments this year that imprint on your memory permanently. Something you create, a piece of writing, a painting, a song, a business idea born from passion rather than strategy, will carry so much of your emotional truth that showing it to the world will feel like undressing in public. Show it anyway.',
    6: 'Your body is not separate from your feelings this year; it is the vessel carrying all of them. Stress you swallow shows up in your body: bad sleep, a tight jaw, a restless stomach. The other side is just as true. When you start treating your body as a partner, by moving it, feeding it well and letting it rest, your moods steady out faster than talking about them ever managed. A new routine becomes a form of self-love so profound it surprises you. The walk you take every morning, the meal you prepare with attention, the hour you reclaim for sleep: these are not just healthy choices, they are anchors for your mood, and this year asks you to build them.',
    7: 'Someone is going to make you feel things you had genuinely convinced yourself you were finished feeling. Whether this is a new person walking into your life or a long-term partner revealing a side of themselves you have never seen, the emotional intensity is real, it is deep, and it will not let you stay comfortable. You need to be truly seen this year, not admired from a distance, not appreciated for what you do, but known. If you let someone in that far, the intimacy will be the kind that rewrites your nervous system. If you keep your walls up, the loneliness will become louder than you can stand. This year, half-relationships are not enough. Your heart is asking for the real thing.',
    8: 'Something heavy is moving through you this year: grief you have not fully processed, desire you have not acknowledged, a fear so old you have forgotten its origin. This is the year it surfaces. Not to overwhelm you, but because you are finally strong enough to face it. You will cry in unexpected places. You will want to talk about things you have never spoken about. You will feel rage, tenderness, exhaustion, and liberation, sometimes in the same hour. On the other side of this passage, you will be lighter than you have felt in years. The weight you have been carrying was never yours to keep. This year, you put it down.',
    9: 'Ordinary life is going to feel unbearable this year, not because anything is wrong, but because your soul is hungry for something bigger. You need meaning the way most people need air. A journey, whether across an ocean, through a book or into a philosophy you have never explored, will feed a part of you that has been starving. You may feel homesick for a place you have never been, nostalgic for a life you have never lived. That is not confusion. That is your spirit recognizing where it needs to go next. Follow the longing. It knows more than your plans do.',
    10: 'You cannot separate your career from your heart this year, and you should stop trying. Every professional decision will carry emotional weight; the promotion will make you cry, the setback will feel personal, the meeting will trigger feelings that have nothing to do with the agenda. This is not unprofessional. This is your soul telling you that your work must mean something. If your current path feels hollow, you will make a change this year that everyone around you will call risky, and every cell in your body will know it is right. Your public life and your private emotional truth are merging, and the result is a career that finally feels like it belongs to you.',
    11: 'Your friendships are not casual accessories this year; they are emotional lifelines. You need your people with an urgency that may surprise you. A friend will show up for you in a moment of genuine need, and the depth of their loyalty will move you in a way you did not expect. But this year also asks you to grieve. A friendship that has been slowly fading, one held together by history rather than present truth, will finally reach its quiet end. Let it go with love. The friendships that remain will be the ones that can hold the weight of who you are actually becoming, not who you used to be.',
    12: 'Solitude is not your enemy this year; it is your healer. You need silence the way a burn needs cool water. Dreams will become vivid, specific, and emotionally loaded. Pay attention to them, because your subconscious is delivering information that your waking mind has been blocking. Meditation, therapy, journaling, prayer, long walks alone. Whatever form your inner practice takes, it becomes the most important appointment on your calendar. Emotional patterns that have been running your life from the shadows will become visible this year: the way you abandon yourself to please others, the way you equate rest with laziness, the way you avoid the very love you keep saying you want. Seeing these patterns is the beginning of being free from them.',
  },
};

// -- Ordinal helper --------

function ordinal(n: number): string {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

function asSentence(s: string): string {
  const t = s.trim();
  if (!t) return '';
  return t.charAt(0).toUpperCase() + t.slice(1) + (/[.!?]$/.test(t) ? '' : '.');
}

// -- Main prediction generator --------

export function generateSolarReturnPrediction(
  planets: Array<{ name: string; sign: string; degree: number; longitude: number; house?: number }>,
  year: number,
  firstName?: string,
  houseCusps?: number[],
): string {
  const name = firstName || 'you';
  const sun = planets.find(p => p.name === 'Sun');
  const moon = planets.find(p => p.name === 'Moon');
  const venus = planets.find(p => p.name === 'Venus');
  const mars = planets.find(p => p.name === 'Mars');
  const jupiter = planets.find(p => p.name === 'Jupiter');
  const saturn = planets.find(p => p.name === 'Saturn');
  const asc = planets.find(p => p.name === 'Ascendant');
  const neptune = planets.find(p => p.name === 'Neptune');
  const pluto = planets.find(p => p.name === 'Pluto');
  const uranus = planets.find(p => p.name === 'Uranus');

  let r = `## ${name}, Here Is What ${year} Holds For You\n\n`;

  r += `Your year starts the moment the Sun comes back to the exact degree it held when you were born, and the chart for that moment decides which parts of your life get loud. Every planet lands in a specific room of your life, and under each one sit two more layers: what you show, what really drives you, and a third that only makes sense once you are living it. None of this fits everyone born under your sign. It fits you.\n\n`;

  // -- ASC — The Year's Mask --------
  if (asc) {
    const ascE = SIGN_ENERGY[asc.sign];
    const duad = calculateDuad(asc.sign, asc.degree);
    const comp = calculateCompendium(duad, asc.degree);
    const duadH = findHouseForSign(duad, houseCusps);
    const compH = findHouseForSign(comp, houseCusps);
    const duadE = SIGN_ENERGY[duad];
    const compE = SIGN_ENERGY[comp];

    r += `### How The World Will See You This Year\n\n`;
    r += `Within minutes of meeting you this year, people have an opinion, and it is hard to say where it came from. You come across as ${ascE?.surface || 'shaped by ' + asc.sign}. Underneath that sits ${ascE?.deep || 'a shift in how you carry yourself'}, and it shows even when you try to hide it. `;
    r += `What actually pushes your choices is quieter: ${duadE?.drive || 'something deeper than your plans'}, and you only see it in hindsight. `;
    if (duadH) r += `It plays out mostly in ${HOUSE_LIFE[duadH]?.area || 'a key area of your life'}. `;
    r += `Below that, where instinct beats logic, sits ${compE?.deep || 'a pull so basic it barely has words'}`;
    if (compH) r += `, and it drags you toward ${HOUSE_LIFE[compH]?.area || 'the most hidden part of your life'}`;
    r += `. `;
    r += `So your year feels layered. You do things that do not match your plans, and a month later you find out why. When a pull keeps coming back, follow it.\n\n`;
  }

  // -- SUN — Central Focus --------
  if (sun && sun.house) {
    const sunE = SIGN_ENERGY[sun.sign];
    const duad = calculateDuad(sun.sign, sun.degree);
    const comp = calculateCompendium(duad, sun.degree);
    const duadH = findHouseForSign(duad, houseCusps);
    const compH = findHouseForSign(comp, houseCusps);
    const houseInfo = HOUSE_LIFE[sun.house];
    const boldPred = BOLD_PREDICTIONS.Sun?.[sun.house] || '';

    r += `### The Central Theme of Your Year\n\n`;
    r += `Your Sun lands in your **${ordinal(sun.house)} house**: ${houseInfo?.area || 'a part of your life that demands your full attention'}. That is where you spend your energy whether you planned to or not, and where the stakes are highest. `;
    r += `You go at it ${sunE?.surface || 'in a way shaped by ' + sun.sign}, but what keeps you going is ${SIGN_ENERGY[duad]?.drive || 'something more basic than the surface shows'}. `;
    if (duadH && duadH !== sun.house) {
      r += `That drive is tied to ${HOUSE_LIFE[duadH]?.area || 'another part of your life'}, so a push in one of those areas moves the other, and the link becomes obvious at one specific moment when everything clicks. `;
    }
    if (compH && compH !== sun.house && compH !== duadH) {
      r += `And below your decisions, in the part of you that acts before you have thought, you get pulled toward ${HOUSE_LIFE[compH]?.area || 'territory you do not recognise yet'}. When you feel an urge that makes no sense on paper, look there first. `;
    }
    r += `\n\n`;
    if (boldPred) r += `**Here is what I predict:** ${boldPred}\n\n`;
  }

  // -- MOON — Emotional Landscape --------
  if (moon) {
    const moonE = SIGN_ENERGY[moon.sign];
    const duad = calculateDuad(moon.sign, moon.degree);
    const comp = calculateCompendium(duad, moon.degree);
    const duadH = findHouseForSign(duad, houseCusps);
    const compH = findHouseForSign(comp, houseCusps);
    const boldPred = moon.house ? (BOLD_PREDICTIONS.Moon?.[moon.house] || '') : '';

    r += `### Your Emotional Reality This Year\n\n`;
    r += `Your Moon is in **${moon.sign}**${moon.house ? ` in your **${ordinal(moon.house)} house**` : ''}, so your moods this year are easy to read from outside. On the surface you are ${moonE?.surface || 'deeply affected by ' + moon.sign + ' themes'}. `;
    r += `Underneath, you are carrying ${moonE?.deep || 'a need you rarely say out loud'}, and until it is met you function but never feel held. `;
    r += `Below that sits a quieter hunger: ${SIGN_ENERGY[duad]?.drive || 'a longing you struggle to put into words even to yourself'}`;
    if (duadH) r += `, and it hurts most in ${HOUSE_LIFE[duadH]?.area || 'a part of your life that carries more feeling than you admit'}`;
    r += `. `;
    if (compH) {
      r += `At the very bottom, the part that finds you at 3am and shows up in dreams, sits ${SIGN_ENERGY[comp]?.deep || 'a wordless need'}, and it leaks into ${HOUSE_LIFE[compH]?.area || 'the most tender part of your life'}. `;
    }
    r += `\n\n`;
    if (boldPred) r += `**Here is what I predict:** ${boldPred}\n\n`;
  }

  // -- VENUS — Love and Money --------
  if (venus) {
    const venE = SIGN_ENERGY[venus.sign];
    const duad = calculateDuad(venus.sign, venus.degree);
    const comp = calculateCompendium(duad, venus.degree);
    const duadH = findHouseForSign(duad, houseCusps);
    const compH = findHouseForSign(comp, houseCusps);

    r += `### Love, Attraction, and Money\n\n`;
    r += `With Venus in **${venus.sign}**${venus.house ? ` in the **${ordinal(venus.house)} house**` : ''}, you fall for certain people and spend on certain things this year, and others leave you cold for no reason you can name. In love you are ${venE?.surface || 'shaped by ' + venus.sign}. What keeps pulling you is ${venE?.drive || 'the ' + venus.sign + ' side of things'}, and you pick partners and purchases that feed it. `;
    r += `The attractions that really undo you skip your logic and come from ${SIGN_ENERGY[duad]?.deep || 'something more complicated than taste'}`;
    if (duadH) r += `, and they hit hardest in ${HOUSE_LIFE[duadH]?.area || 'your closest relationships'}`;
    r += `. `;
    if (compH) {
      r += `Underneath that, what makes your pulse jump this year is people who are ${SIGN_ENERGY[comp]?.surface || 'hard to explain to anyone who has not felt it'}, and you meet them through ${HOUSE_LIFE[compH]?.area || 'a part of your life you would not have guessed'}. `;
    }
    if (venus.house === 5 || venus.house === 7 || venus.house === 1) {
      r += `\n\n**Here is what I predict:** Love does not wait for you to feel ready this year. If you are single, someone turns up who makes the walls you built look silly by the second dinner. If you are partnered, the relationship hits a crisis or a new depth, and the two of you stop performing and say the real thing. ${year} is the year you feel it.`;
    } else if (venus.house === 2 || venus.house === 8 || venus.house === 10) {
      r += `\n\n**Here is what I predict:** Your money changes shape this year because you finally price yourself differently. Either income turns up from a direction you did not plan on, or you stop undercharging and ask for the raise or the higher rate. By December your own answer to what you are worth says something new.`;
    }
    r += `\n\n`;
  }

  // -- MARS — Drive and Conflict --------
  if (mars) {
    const marsE = SIGN_ENERGY[mars.sign];
    const duad = calculateDuad(mars.sign, mars.degree);
    const duadH = findHouseForSign(duad, houseCusps);

    r += `### Where You Will Fight and What You Will Fight For\n\n`;
    r += `With Mars in **${mars.sign}**${mars.house ? ` in the **${ordinal(mars.house)} house**` : ''}, you lose patience fast this year and you go after what you want without being polite about it. People see you as ${marsE?.surface || 'driven and unapologetic'}. `;
    if (mars.house) {
      const mArea = HOUSE_LIFE[mars.house];
      r += `Most of that energy goes into ${mArea?.area || 'one key part of your life'}. That is where you clash, sweat and push through resistance, and where you make your clearest progress. ${asSentence(mArea?.specific || '')} `;
    }
    r += `What actually fuels you is ${SIGN_ENERGY[duad]?.drive || 'something more complicated than ambition'}`;
    if (duadH && duadH !== mars.house) r += `, and it quietly pulls in ${HOUSE_LIFE[duadH]?.area || 'a part of your life you do not connect to this fight'}`;
    r += `.\n\n`;
    if (mars.house === 1 || mars.house === 10) {
      r += `**Here is what I predict:** You take a leap this year that makes the careful people around you hold their breath, and it lands. You move before the guarantee shows up, and that is the whole difference between you and everyone watching from the side in ${year}. Trust the instinct.\n\n`;
    } else if (mars.house === 7) {
      r += `**Here is what I predict:** A conversation you have been dodging in a relationship that matters comes due, and avoiding it costs more than having it. If you say the honest version instead of the defended one, the relationship changes for good, and for the better.\n\n`;
    }
  }

  // -- JUPITER — Luck and Growth --------
  if (jupiter) {
    const jupE = SIGN_ENERGY[jupiter.sign];
    const duad = calculateDuad(jupiter.sign, jupiter.degree);
    const duadH = findHouseForSign(duad, houseCusps);

    r += `### Where Luck Finds You\n\n`;
    r += `Jupiter in **${jupiter.sign}**${jupiter.house ? ` in the **${ordinal(jupiter.house)} house**` : ''} is where your year goes well, and you feel it early. Doors open before you knock, and risks pay off in ways that make skeptics uncomfortable. `;
    if (jupiter.house) {
      r += `The luck lands in ${HOUSE_LIFE[jupiter.house]?.area || 'a part of your life that is ready to get bigger'}. ${asSentence(HOUSE_LIFE[jupiter.house]?.specific || '')} `;
    }
    r += `What sits behind it is ${SIGN_ENERGY[duad]?.drive || 'an aspiration so big you do not call it a goal'}`;
    if (duadH && duadH !== jupiter.house) r += `, and it spills into ${HOUSE_LIFE[duadH]?.area || 'a related part of your life that gets the overflow'}`;
    r += `. Do not be modest, and do not talk yourself out of an offer because it feels too good. This year the yes you give before you feel ready is the one that pays.\n\n`;
  }

  // -- SATURN — Tests and Mastery --------
  if (saturn) {
    const satE = SIGN_ENERGY[saturn.sign];
    const duad = calculateDuad(saturn.sign, saturn.degree);
    const duadH = findHouseForSign(duad, houseCusps);

    r += `### Where You Will Be Tested and What You Will Master\n\n`;
    r += `Saturn in **${saturn.sign}**${saturn.house ? ` in the **${ordinal(saturn.house)} house**` : ''} hands you the hardest assignment of your year, and it does not care how you feel about it. It lands in ${saturn.house ? HOUSE_LIFE[saturn.house]?.area || 'a part of your life that has been running on borrowed time' : 'your life'}, and you get through it by being ${satE?.surface || 'disciplined and honest with yourself'}. `;
    if (saturn.house) r += `${asSentence(HOUSE_LIFE[saturn.house]?.specific || '')} `;
    r += `Underneath the assignment is a harder one: ${SIGN_ENERGY[duad]?.deep || 'a pattern you have avoided because facing it means growing up in a way that scares you'}`;
    if (duadH && duadH !== saturn.house) r += `, and it plays out in ${HOUSE_LIFE[duadH]?.area || 'a related part of your life'}`;
    r += `. `;
    r += `\n\n**Here is what I predict:** Probably in the first half of the year, you hit a week where you want to quit, take the shortcut or settle for the comfortable option. Do not. What you build through this stretch holds weight for years, and the heaviness you feel is the cost of it being real. Stay.\n\n`;
  }

  // -- URANUS — Surprises --------
  if (uranus && uranus.house) {
    r += `### The Unexpected\n\n`;
    r += `Uranus sits in your **${ordinal(uranus.house)} house**, so the jolt lands in ${HOUSE_LIFE[uranus.house]?.area || 'your life'}. You cannot schedule it or prepare for it, and it ignores your plans. `;
    r += `For a while it feels like the ground is gone. Looking back, you see it freed you from a structure, a habit or a commitment that had turned into a cage. ${asSentence(HOUSE_LIFE[uranus.house]?.specific || 'This part of your life gets freed in a way you could not have designed yourself')}\n\n`;
  }

  // -- NEPTUNE — Dreams and Illusions --------
  if (neptune && neptune.house) {
    r += `### Where Dreams Blur With Reality\n\n`;
    r += `With Neptune in your **${ordinal(neptune.house)} house**, ${HOUSE_LIFE[neptune.house]?.area || 'a part of your life'} gets hazy this year, and the haze cuts both ways. `;
    r += `You feel inspired, your work gets more creative and you pick up on things you cannot prove. You also see what you want to see, so a plan that looks like a dream can turn out to be a mirage. Read the fine print before you sign anything. The breakthroughs here, in art, in belief and in feeling, are real, but only the ones you check against the facts hold up.\n\n`;
  }

  // -- PLUTO — Power and Transformation --------
  if (pluto && pluto.house) {
    r += `### Where Power Transforms You\n\n`;
    r += `With Pluto in your **${ordinal(pluto.house)} house**, something in ${HOUSE_LIFE[pluto.house]?.area || 'a critical part of your life'} gets taken apart this year, and you do not get a vote on the timing. What ends there was draining you, and you can feel that even while you grieve it or fight it. `;
    r += `What replaces it, the relationship that fits or the self that stops pretending, makes the loss make sense. By the end you stop treating the breakdown as the enemy.\n\n`;
  }

  // -- JUNO — Commitment, Partnership Rights, and What You Demand From Love --------
  const juno = planets.find(p => p.name === 'Juno');
  if (juno) {
    const junoE = SIGN_ENERGY[juno.sign];
    const duad = calculateDuad(juno.sign, juno.degree);
    const comp = calculateCompendium(duad, juno.degree);
    const duadH = findHouseForSign(duad, houseCusps);
    const compH = findHouseForSign(comp, houseCusps);

    r += `### What You Demand From Commitment This Year\n\n`;
    r += `This year you hold a firmer line on what you accept from the people closest to you, and Juno in **${juno.sign}**${juno.house ? ` in your **${ordinal(juno.house)} house**` : ''} is where it shows. `;
    r += `With partners you are ${junoE?.surface || 'shaped by ' + juno.sign}, and you stop putting up with less than you deserve. The line gets drawn in ${juno.house ? HOUSE_LIFE[juno.house]?.area || 'the center of your relationships' : 'the commitments that define your life'}. `;
    r += `Below what you can put into words sits ${SIGN_ENERGY[duad]?.deep || 'a limit so deep it lives in your body, not your head'}. You will never say it out loud, but you walk away from anyone who crosses it, and the only explanation you can give is that your whole body said no`;
    if (duadH) r += `. It is tied up with ${HOUSE_LIFE[duadH]?.area || 'a part of your life that carries more weight than anyone sees'}`;
    r += `. `;
    if (compH) {
      r += `Your loyalty this year goes to the person who understands ${SIGN_ENERGY[comp]?.drive || 'the thing about you that you never have to explain'}, and the proving ground is ${HOUSE_LIFE[compH]?.area || 'a part of your life that surprises both of you'}. `;
    }
    if (juno.house === 7 || juno.house === 1) {
      r += `\n\n**Here is what I predict:** A commitment reaches its moment of truth this year: it becomes permanent or it breaks. If a relationship has been sitting in the gray zone, the gray ends. Someone proves their loyalty in a way that removes the doubt, or their failure to show up answers the question for you. Your body gives you the answer before your head agrees.`;
    } else if (juno.house === 5) {
      r += `\n\n**Here is what I predict:** A romance hits a crossroads where it either becomes real or turns out to be a nice distraction. The casual phase is over. You want consistency and you want to be chosen every day, not just wanted, and anything less starts to feel like betraying yourself.`;
    } else if (juno.house === 10) {
      r += `\n\n**Here is what I predict:** A work partnership becomes one of the defining relationships of your year. Someone you work with earns your trust well beyond business, or betrays it and teaches you something about loyalty that you carry into every deal after. Either way, this alliance changes your public path in ways neither of you can see yet.`;
    } else if (juno.house === 8) {
      r += `\n\n**Here is what I predict:** A relationship goes deeper than you have let any relationship go, and it scares you, because it asks for more honesty and less armor than you are used to. Open the door and the bond that forms is the hard-to-break kind. Keep the armor on and the relationship dies slowly, and both of you know why.`;
    } else {
      r += `\n\n**Here is what I predict:** Your idea of loyalty changes for good this year. Someone rises to meet who you are becoming, or shows by not turning up that the relationship was built for an earlier you. When you let go of what no longer fits, you feel peace instead of guilt.`;
    }
    r += `\n\n`;
  }

  // -- VESTA — Sacred Devotion, Mission, and the Inner Flame --------
  const vesta = planets.find(p => p.name === 'Vesta');
  if (vesta) {
    const vestE = SIGN_ENERGY[vesta.sign];
    const duad = calculateDuad(vesta.sign, vesta.degree);
    const comp = calculateCompendium(duad, vesta.degree);
    const duadH = findHouseForSign(duad, houseCusps);
    const compH = findHouseForSign(comp, houseCusps);

    r += `### Your Sacred Focus: What You Are Devoted To This Year\n\n`;
    r += `Vesta in **${vesta.sign}**${vesta.house ? ` in your **${ordinal(vesta.house)} house**` : ''} is where you stop doing things halfway this year. `;
    r += `You put everything into ${vesta.house ? HOUSE_LIFE[vesta.house]?.area || 'one mission that chooses you as much as you choose it' : 'one thing that will not share your attention with anything trivial'}, and while you do it you are ${vestE?.surface || 'shaped by ' + vesta.sign}. `;
    r += `It is not a hobby. It is the thing you work on until 3am without noticing the time, the thing you defend harder than the people around you expect, and it gives your days a reason. `;
    r += `What fuels it is ${SIGN_ENERGY[duad]?.drive || 'a motive deeper than ambition or discipline'}`;
    if (duadH) r += `, and it runs through ${HOUSE_LIFE[duadH]?.area || 'a part of your life that gets all your attention'}`;
    r += `. `;
    if (compH) {
      r += `Under that, the part that keeps you going when everything else goes dark is ${SIGN_ENERGY[comp]?.deep || 'something old and instinctive that you will not bargain over'}, and it ties to ${HOUSE_LIFE[compH]?.area || 'the most private part of your life'}. `;
    }
    if (vesta.house === 6 || vesta.house === 10) {
      r += `\n\n**Here is what I predict:** Your work becomes the thing you care about most. You put so much care and precision into one project that the result is undeniable, and people notice. Opportunities follow, and you realise it was never about productivity. You simply could not do it badly.`;
    } else if (vesta.house === 1) {
      r += `\n\n**Here is what I predict:** You aim all that devotion at yourself: your body, your habits, how you present. The discipline is hard and the results are visible to everyone. By the end of the year, people who last saw you twelve months ago do a double take.`;
    } else if (vesta.house === 5) {
      r += `\n\n**Here is what I predict:** A creative project eats your year the way a love affair does. What you make has so much of you in it that showing it feels like confessing a secret. Putting that much into your own work also makes you attractive to people who prefer the real thing to the polished one.`;
    } else if (vesta.house === 9) {
      r += `\n\n**Here is what I predict:** A pursuit of meaning takes over: a course, a spiritual practice, a book you write, a philosophy that changes how you read everything. It starts out looking like an interest and ends up being what you were meant to do.`;
    } else if (vesta.house === 12) {
      r += `\n\n**Here is what I predict:** Your inner work moves from the margins to the center of your life. Therapy, journaling, prayer, long silences, whatever form it takes, you need more solitude than usual. That is not depression or hiding. It is you tending something that only grows in quiet.`;
    } else {
      r += `\n\n**Here is what I predict:** Something catches in you this year: a focus or a purpose that arrives so clearly that second-guessing it feels absurd. You feel it in your chest before you can name it. Do not dilute it with other obligations, and follow it.`;
    }
    r += `\n\n`;
  }

  // -- THE BIG PICTURE --------
  r += `---\n\n### ${name}, Here Is The Bottom Line\n\n`;

  const focusAreas: string[] = [];
  if (sun?.house) focusAreas.push(HOUSE_LIFE[sun.house]?.area || '');
  if (moon?.house && moon.house !== sun?.house) focusAreas.push(HOUSE_LIFE[moon.house]?.area || '');
  if (jupiter?.house && jupiter.house !== sun?.house && jupiter.house !== moon?.house) focusAreas.push(`growth through ${HOUSE_LIFE[jupiter.house]?.area || ''}`);
  const unique = focusAreas.filter(Boolean).slice(0, 3);

  r += `${year} does not just happen to you. It happens because of what you decide, which lines you cross and which truths you stop dodging. `;
  if (unique.length > 0) {
    r += `Your year centers on **${unique.join('**, **')}**, and these are one story, not separate ones: each pulls on the others. `;
  }

  r += `\n\nWhat you think you want and what you actually need will not match all year. That gap is where the change happens, so do not rush to close it. `;

  r += `\n\n**Expect at least two moments this year when everything turns.** You will know them by how time slows down and your body registers it before your head does. When they come, pick the option that scares you and asks more of you. That is usually the one your chart has been pointing at since you were born. `;

  r += `\n\nThis is your year, ${name}. Not a rehearsal and not a waiting room. Years from now you will point back at it and say that is when everything changed, so move like it.\n`;

  return r;
}

// ═══════════════════════════════════════════════════════════════════════════
// NEW: Year Theme Headlines, Aspect Interps, Angle Interps, Retrogrades,
//      Monthly Timeline, Natal Comparison — shared by web + mobile
// ═══════════════════════════════════════════════════════════════════════════

// -- Year Theme (based on Sun house) --------

export const YEAR_THEME_HEADLINES: Record<number, { headline: string; emoji: string; keyword: string; description: string }> = {
  1:  { headline: 'The year you reinvent yourself', emoji: '🔥', keyword: 'Identity', description: 'You change visibly this year. Your look, the way you carry yourself and what people think of you all move, and by December friends will say you seem different. Start the haircut, the job search or the new name before you talk yourself out of it.' },
  2:  { headline: 'The year your worth is redefined', emoji: '💎', keyword: 'Resources', description: 'Money and self-worth get rewritten this year. What you earn and what you accept no longer match, so you ask for more, drop what undervalues you or learn to spend on yourself. Expect one big money decision that changes how you see your own price.' },
  3:  { headline: 'The year a conversation changes everything', emoji: '💬', keyword: 'Communication', description: 'One conversation this year splits your life into before and after. A message, a class or a talk with a sibling or neighbour changes your mind about something important. You write, speak and learn more than usual, so say what you have been holding back.' },
  4:  { headline: 'The year you rebuild your foundation', emoji: '🏠', keyword: 'Home & Roots', description: 'Home takes over this year. You move, renovate, have it out with family or finally deal with where you came from. By December, what home means to you is different, and you stop pretending it is fine where it is not.' },
  5:  { headline: 'The year love and creativity ignite', emoji: '🎨', keyword: 'Creative Fire', description: 'Romance, creativity and fun demand your time this year. Someone or something makes you feel more alive than you have in a long while, and you want to make things, play and be seen. Stop apologising for enjoying it.' },
  6:  { headline: 'The year you master the details', emoji: '⚙️', keyword: 'Health & Work', description: 'Your daily routine gets rebuilt this year. Your body sends a message you cannot ignore, your job changes or you drop habits that no longer work. The small daily choices add up to a bigger life by December.' },
  7:  { headline: 'The year someone defines your path', emoji: '💞', keyword: 'Partnerships', description: 'One person sits at the center of your year. A partnership starts, deepens or reaches the point where you either commit or end it. Who you stand next to this year shapes everything else, so choose on purpose.' },
  8:  { headline: 'The year of endings and rebirth', emoji: '🦋', keyword: 'Transformation', description: 'Something ends this year so something truer can start. Shared money, intimacy and power in your closest bond all come under pressure, and you let go of things you have carried too long. You feel lighter by December.' },
  9:  { headline: 'The year the horizon calls you', emoji: '🌍', keyword: 'Expansion', description: 'Your view of the world gets taken apart and rebuilt this year. A trip, a course, a legal matter or a big conversation makes you drop a belief that was not really yours. You come out more honest about what you think.' },
  10: { headline: 'The year the world learns your name', emoji: '👑', keyword: 'Career & Legacy', description: 'Your career and reputation move to the front this year. A promotion, a change of direction or a public moment puts you at a new level, and the decisions you make now are hard to reverse. People start to know your name.' },
  11: { headline: 'The year your dreams show their first signs', emoji: '⭐', keyword: 'Vision & Community', description: 'Your social world reshuffles this year. Some friends drift off, a group or cause becomes part of who you are, and a dream you have carried quietly shows its first real signs of happening. Say it out loud to the right people.' },
  12: { headline: 'The year of sacred solitude', emoji: '🔮', keyword: 'Inner World', description: 'The important things happen quietly this year. You need more time alone, old hurts come up to be dealt with, and your dreams carry messages you cannot get any other way. Rest more than you think you should, because something is forming.' },
};

// -- Critical Aspect Interpretations --------

export interface SRAspectInterp {
  title: string;
  intensity: 'high' | 'medium';
  interpretation: string;
}

const ASPECT_WEIGHT: Record<string, number> = {
  conjunction: 10, opposition: 9, square: 8, trine: 6, sextile: 4,
};
const PERSONAL_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
const OUTER_PLANETS = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

const SR_ASPECT_TEXTS: Record<string, Record<string, string>> = {
  'Sun-Moon': {
    conjunction: 'Your identity and emotions are fused this year; what you want and what you feel are inseparable. Decisions come from a place of total alignment. You operate with unusual internal coherence, and people sense it.',
    opposition: 'There is a tug-of-war between what you want to become and what you need emotionally. A relationship or domestic situation pulls against your personal ambitions. The tension is productive if you stop trying to choose one side.',
    square: 'Internal friction drives this year. Your conscious goals and your emotional needs are at cross-purposes, creating restlessness that forces growth. The discomfort is the catalyst. Do not numb it.',
    trine: 'Ease flows between your identity and your emotional life. What you want and what you need are naturally aligned. Opportunities arrive without force. The danger is complacency; this harmony is a platform, not a destination.',
    sextile: 'Gentle opportunities arise to align your inner world with your outer goals. Small adjustments in how you express yourself emotionally unlock disproportionate results in your public life.',
  },
  'Sun-Saturn': {
    conjunction: 'This is a year of serious reckoning. Responsibilities land on your shoulders that cannot be delegated. The weight is real, but so is the authority you earn by carrying it. By December, you will have aged in wisdom, not just years.',
    opposition: 'An authority figure or institution stands directly in your path. A boss, a parent, a system: something external demands that you prove yourself. The test is real. Pass it, and the respect you earn is permanent.',
    square: 'Frustration meets ambition head-on. Every step forward feels like pushing through concrete. Delays, denials, and limitations are not punishments; they are the resistance that builds the muscle you will need for what comes next.',
  },
  'Sun-Pluto': {
    conjunction: 'Power and identity merge. You are being forged in fire this year: a complete psychological overhaul that strips away everything that is not authentically you. People will feel the intensity radiating off you. Some will be drawn closer. Others will back away. Both reactions are correct.',
    opposition: 'A power struggle defines this year. Someone or something challenges your authority, your identity, or your right to be who you are becoming. The confrontation is not optional. What you discover about yourself in the clash is permanent.',
    square: 'Transformation comes through crisis. A situation forces you to face something you have been avoiding: a truth about yourself, a dynamic in a relationship, a pattern you have been running on autopilot. The breakdown is the breakthrough.',
  },
  'Sun-Jupiter': {
    conjunction: 'Expansion and confidence surge through your identity. Doors open, your optimism is justified and the risks you take land. The only danger is overextension. Stay grounded while you grow.',
    trine: 'Growth comes naturally this year. Opportunities align with your sense of purpose, and the expansion feels organic rather than forced. Travel, education, or a philosophical shift broadens your world in exactly the way you needed.',
    opposition: 'Others bring the growth. A partner, a mentor, or an opportunity from someone else expands your world, but you may need to check whether the growth is truly yours or borrowed confidence.',
  },
  'Sun-Uranus': {
    conjunction: 'You are the lightning bolt this year. Sudden changes in identity, appearance, or life direction arrive without warning. You may shock people who thought they knew you. The old version of you is being released; the new one does not apologize.',
    opposition: 'Someone else introduces the disruption. A relationship brings sudden change, or a partner does something that forces you to reconsider who you are. Freedom versus commitment is the central tension.',
    square: 'Restlessness reaches a breaking point. Something in your life that has been stable suddenly feels like a cage. The urge to break free is overwhelming, and at least one area of your life will look completely different by year end.',
  },
  'Moon-Saturn': {
    conjunction: 'Emotional maturity is demanded this year. Loneliness, responsibility, or a family obligation forces you to grow up emotionally in ways you cannot fake. The heaviness is real, but so is the emotional strength you build.',
    opposition: 'Your emotional needs and your responsibilities are in direct conflict. Work demands one thing; your heart demands another. Finding balance requires you to stop treating your feelings as less important than your duties.',
    square: 'Emotional restriction creates pressure. You feel held back, unsupported, or unable to express what you truly feel. The frustration is pointing you toward the exact emotional pattern that needs to be outgrown.',
  },
  'Moon-Pluto': {
    conjunction: 'Emotional intensity reaches volcanic levels. Feelings you have buried surface with force. A relationship reaches a depth that permanently alters your emotional operating system. Nothing stays on the surface this year.',
    opposition: 'Someone else triggers a deep emotional transformation. A partner, a family member, or an intimate connection brings buried feelings to light, whether you invited them or not.',
    square: 'Emotional power struggles dominate. Control, jealousy, obsession, or fear of vulnerability create friction that forces you to examine patterns you have been running since childhood.',
  },
  'Venus-Mars': {
    conjunction: 'Desire and attraction are supercharged. Your magnetism is palpable this year: romantic encounters carry unusual intensity, and creative projects burn with passion. What you want and how you pursue it are perfectly fused.',
    opposition: 'The push-pull between what you desire and how you go after it creates electric tension in relationships. Attraction and conflict are braided together. The passion is undeniable. Learning to channel it is the work.',
    square: 'Frustrated desire drives this year. What you want in love and what you are willing to fight for are out of alignment. The tension creates urgency, and urgency is useful for creative work.',
  },
  'Venus-Saturn': {
    conjunction: 'Love gets serious. A relationship solidifies into something permanent, or you realize that what you have been settling for is not enough. Commitment, maturity, and honest assessment of what you truly value define your romantic year.',
    opposition: 'A partner demands more structure, commitment, or maturity than you feel ready to give, or you demand it from them. The relationship either levels up or its limitations become impossible to ignore.',
    square: 'Loneliness, rejection, or financial restriction forces you to confront what you actually value versus what you have been performing. The most important love lesson of the year comes through discomfort.',
  },
  'Venus-Pluto': {
    conjunction: 'Love becomes obsession. An attraction arrives with an intensity that bypasses every rational defense you have. A relationship transforms at the deepest level, or ends in a way that transforms you. There is no casual love this year.',
    opposition: 'Someone else brings the obsessive intensity. A partner reveals hidden depths, or hidden agendas. The power dynamics in your closest relationship undergo a complete restructuring.',
    square: 'Jealousy, possessiveness, or buried desires create volcanic pressure in relationships. The crisis strips away pretense and forces both people to show who they really are.',
  },
  'Mars-Saturn': {
    conjunction: 'Disciplined action produces lasting results. Your energy is focused, controlled, and strategic. Progress is slow but permanent. Every shortcut is blocked, and every breakthrough is earned.',
    opposition: 'Your drive meets an immovable obstacle. A system, a person, or a circumstance says no, and you must decide whether to fight harder or redirect. The answer is usually: redirect with more precision.',
    square: 'Frustration and blocked energy create explosive pressure. Anger, delays, and physical tension demand an outlet. The key is controlled release: exercise, structured projects, strategic patience.',
  },
  'Jupiter-Saturn': {
    conjunction: 'Expansion and contraction meet at the exact same point. A major life structure, whether career, relationship or belief system, grows and is tested at the same time. What survives this year is built to last decades.',
    opposition: 'Optimism and caution pull in opposite directions. A risk that feels right is met with practical objections. The balance point, neither too bold nor too cautious, is the year\'s central lesson.',
    square: 'Growth is frustrated by limitations. Every time you try to expand, a wall appears. The walls are not obstacles; they are guardrails. The expansion that happens within them is the real one.',
  },
};

export function getCriticalAspects(
  aspects: { planet1: string; planet2: string; type: string; orb: number }[],
): Array<{ planet1: string; planet2: string; type: string; orb: number; interp: SRAspectInterp }> {
  const scored = aspects
    .filter(a => {
      const key = a.type?.toLowerCase().replace(/\s/g, '');
      return key in ASPECT_WEIGHT;
    })
    .map(a => {
      const key = a.type.toLowerCase().replace(/\s/g, '');
      const isPersonal = PERSONAL_PLANETS.includes(a.planet1) || PERSONAL_PLANETS.includes(a.planet2);
      const isCross = (PERSONAL_PLANETS.includes(a.planet1) && OUTER_PLANETS.includes(a.planet2)) ||
                      (OUTER_PLANETS.includes(a.planet1) && PERSONAL_PLANETS.includes(a.planet2));
      const weight = (ASPECT_WEIGHT[key] || 0) * (isPersonal ? 2 : 1) * (isCross ? 1.5 : 1) * (1 / (1 + a.orb));
      return { ...a, weight, aspectKey: key };
    })
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  return scored.map(a => {
    const p1 = a.planet1, p2 = a.planet2;
    const pairKey = SR_ASPECT_TEXTS[`${p1}-${p2}`] ? `${p1}-${p2}` : SR_ASPECT_TEXTS[`${p2}-${p1}`] ? `${p2}-${p1}` : null;
    const text = pairKey ? (SR_ASPECT_TEXTS[pairKey][a.aspectKey] || '') : '';
    const fallback = text || `${p1} ${a.type} ${p2} brings ${a.aspectKey === 'conjunction' ? 'fusion' : a.aspectKey === 'opposition' ? 'tension and awareness' : a.aspectKey === 'square' ? 'friction that forces growth' : a.aspectKey === 'trine' ? 'natural flow and ease' : 'gentle opportunity'} between ${p1} themes and ${p2} energy this year. This aspect activates with an orb of ${a.orb.toFixed(1)}°, making it a defining dynamic of your solar return.`;
    return {
      planet1: p1, planet2: p2, type: a.type, orb: a.orb,
      interp: {
        title: `${p1} ${a.type} ${p2}`,
        intensity: (a.weight > 10 ? 'high' : 'medium') as 'high' | 'medium',
        interpretation: fallback,
      },
    };
  });
}

// -- Planets on Angles Deep Dive --------

export const ANGLE_PLANET_INTERPS: Record<string, Record<string, string>> = {
  Ascendant: {
    Sun: 'Your identity IS the year. You are impossible to ignore: visible, radiant and carrying a personal authority that changes every room you enter. This is a year where people see you, and what they see matters.',
    Moon: 'Your emotions are written on your face this year. Showing what you feel works in your favour. People respond to you with unusual tenderness because your unguarded presence gives them permission to drop their own masks.',
    Mercury: 'Your words define your year. You become the communicator, the messenger, the person whose ideas land with unusual precision. A conversation or piece of writing becomes your calling card.',
    Venus: 'You are magnetic this year in how you look, how you talk and how you carry yourself. People are drawn to you. A new look, a new style, a new way of presenting yourself to the world opens doors that were previously invisible.',
    Mars: 'You are on fire this year. Your energy, your drive, your willingness to fight for what you want is visible from across the room. This is a year of bold action, physical vitality, and refusing to wait for permission.',
    Jupiter: 'Everything about you is bigger this year: your presence, your optimism, your ability to attract opportunity. You walk into rooms and people sense that you are going somewhere. Growth is not just internal; it is visible.',
    Saturn: 'You carry weight this year: responsibility, authority, and the kind of gravitas that only comes from someone who has earned their position. People take you seriously because you have stopped pretending to be lighter than you are.',
    Uranus: 'You shock people this year. Your appearance, your behavior, your decisions: something about you is wildly, refreshingly, perhaps uncomfortably different. The old version of you is gone. The new one does not explain itself.',
    Neptune: 'You carry an ethereal quality this year: dreamy, artistic, almost otherworldly. People project their fantasies onto you. The gift is inspiration; the danger is that no one sees the real you beneath the shimmer.',
    Pluto: 'Your presence is transformative this year. People feel changed by encountering you, drawn in by an intensity that is both compelling and slightly intimidating. You operate with a level of psychological depth that makes casual interaction almost impossible.',
  },
  Midheaven: {
    Sun: 'Your career reaches its peak moment. A professional achievement, public recognition, or leadership role puts you in the spotlight. This is not subtle; the world is watching, and what you do this year defines your professional reputation for years.',
    Moon: 'Your public life and your emotional needs merge. A career move is driven by feeling rather than strategy, and it turns out to be exactly right. The public sees your heart this year, and it earns their trust.',
    Mercury: 'Your professional reputation is built on your ideas this year. A presentation, a proposal, a published piece, or a strategic insight elevates your standing. Your mind is your most valuable career asset.',
    Venus: 'Your career benefits from charm, aesthetics, and relationships. A professional connection becomes personally meaningful, or your creative work gains public recognition. Beauty and diplomacy are your professional tools.',
    Mars: 'Ambition takes the driver\'s seat. You pursue professional goals with a ferocity that surprises even you. Competition, conflict with authority, or a bold career move defines your public year. You will not be ignored.',
    Jupiter: 'Professional expansion and recognition arrive with unusual ease. A promotion, a new role, an international opportunity, or public acclaim opens a chapter that feels destined.',
    Saturn: 'Professional responsibility intensifies. A position of authority arrives with heavy expectations. The work is demanding, the scrutiny is real, and the respect you earn is permanent. This year builds your legacy.',
    Uranus: 'A sudden career change arrives, unexpected, unplanned and ultimately liberating. Your professional path takes a sharp turn toward something that feels more authentically you, even if it confuses everyone who knew your old trajectory.',
    Neptune: 'Your professional life takes on a spiritual or creative dimension. A career in the arts, healing, or service work feels aligned. The risk: confusion about your professional direction. Trust the vision, but verify the details.',
    Pluto: 'A power shift in your career: either you rise to a position of significant influence, or a professional crisis forces a complete reinvention. The old career identity dies. What replaces it carries genuine authority.',
  },
  Descendant: {
    Sun: 'A relationship IS the story this year. A partner takes center stage in your life: their needs, their presence, their impact on your identity are impossible to separate from your own evolution.',
    Moon: 'Emotional intimacy with a partner reaches its deepest level. A relationship becomes your emotional anchor, or its absence becomes the ache that drives every other decision you make.',
    Venus: 'Love arrives at your doorstep. A partnership begins or deepens with grace, attraction, and genuine reciprocity. If you are already partnered, the relationship enters its most beautiful chapter.',
    Mars: 'A relationship brings conflict, passion, or both. A partner challenges you in ways that are uncomfortable and necessary. The friction is not a sign that something is wrong; it is a sign that something real is happening.',
    Saturn: 'A relationship demands maturity. A commitment is tested, formalized, or ended with the sober clarity of two people who finally see each other clearly. What remains after this year is unshakeable.',
    Pluto: 'A relationship transforms you at the cellular level. Intimacy reaches a depth that permanently rewires how you attach, trust, and give yourself to another person. Nothing about this bond is casual.',
  },
  IC: {
    Sun: 'Your private life, your home, and your inner world are the true center of this year, regardless of what your public life looks like. The most important growth happens behind closed doors.',
    Moon: 'Home becomes your sanctuary. A family matter, a move, or a deep emotional process rooted in your childhood becomes the engine of your year. Safety and belonging are not luxuries; they are necessities.',
    Saturn: 'A family responsibility anchors your year. A parent needs you, a property demands attention, or an emotional foundation that has been cracking finally requires repair. The work is heavy but the stability it creates is permanent.',
    Pluto: 'A family secret surfaces, a home situation undergoes radical transformation, or the psychological foundations of your life are dismantled and rebuilt. The private revolution is more powerful than anything happening in public.',
  },
};

export function getAngleInterpretation(planet: string, angle: string): string {
  const normalizedAngle = angle.includes('ASC') || angle.includes('Asc') ? 'Ascendant'
    : angle.includes('MC') || angle.includes('Mid') ? 'Midheaven'
    : angle.includes('DSC') || angle.includes('Desc') || angle.includes('Des') ? 'Descendant'
    : angle.includes('IC') || angle.includes('Imum') ? 'IC'
    : angle;
  return ANGLE_PLANET_INTERPS[normalizedAngle]?.[planet] || `${planet} sits right on your ${normalizedAngle} this year, so what it stirs up is hard to hide and shows in your choices, your mood and what other people say about you.`;
}

// -- Retrograde Detection & Meanings --------

export const RETROGRADE_SR_MEANINGS: Record<string, string> = {
  Mercury: 'You go back over old decisions this year. Messages get misread, so check anything important before you send it. People from your past turn up with unfinished business, and you catch mistakes by looking backward.',
  Venus: 'Someone from your romantic past comes back this year, in person or in your head, and you cannot ignore it. You also re-examine what you spend and what you want from love. What you thought you wanted turns out not to be what you need.',
  Mars: 'You move slower this year and think before you act. Anger you swallowed comes out at a bad moment, so deal with it early. Projects take several attempts, and you win through persistence, not speed.',
  Jupiter: 'Luck comes from going back to opportunities you passed on, not from new ones showing up. You grow through study and reflection more than expansion, and big outward moves are slow to start.',
  Saturn: 'Nobody forces the hard lesson on you this year. You decide yourself that something in your life has to be rebuilt from the foundation, and you do the work without anyone watching.',
  Uranus: 'The big change this year happens in your head before it shows on the outside. You change your mind about something you took for granted, and only later do your circumstances catch up.',
  Neptune: 'You stop believing a story you told yourself for a long time. Your dreams get clearer and you lose patience with escaping into fantasy, because you can tell when something does not add up.',
  Pluto: 'The power struggle this year is with yourself. You face your own compulsions and the patterns you keep repeating, and no one else can fight that for you.',
};

export function detectRetrogrades(
  planets: Array<{ name: string; longitude: number }>,
  prevPositions?: Array<{ name: string; longitude: number }>,
): string[] {
  if (!prevPositions || prevPositions.length === 0) return [];
  const retro: string[] = [];
  for (const p of planets) {
    const prev = prevPositions.find(pp => pp.name === p.name);
    if (prev && p.longitude < prev.longitude && Math.abs(p.longitude - prev.longitude) < 30) {
      retro.push(p.name);
    }
  }
  return retro;
}

// -- Natal vs Solar Return Comparison --------

export interface NatalComparison {
  planet: string;
  natalSign: string;
  natalHouse?: number;
  srSign: string;
  srHouse?: number;
  shifted: boolean;
  interpretation: string;
}

const SHIFT_TEMPLATES: Record<string, (ns: string, ss: string) => string> = {
  Sun: (ns, ss) => `Your usual way of being comes from ${ns}. This year you lead with ${ss} instincts instead, and people who know you well notice you choosing differently. The pull between the old habit and the new one is where the year's growth comes from.`,
  Moon: (ns, ss) => `You usually need ${ns} things to feel safe. This year those stop being enough, and what settles you looks more like ${ss}: different routines, different comforts, different people who understand what changed. Last year's way of calming down leaves you restless.`,
  Venus: (ns, ss) => `Your usual taste in love and money comes from ${ns}. This year it shifts toward ${ss}, so who you find attractive and what you spend on will surprise the people who think they know you. Go with it and see what it shows you about what you want.`,
  Mars: (ns, ss) => `You usually fight, chase and push the ${ns} way. This year you do it the ${ss} way. Your temper takes a different form, your ambition points somewhere new, and things that used to fire you up leave you cold while something unexpected gets you moving.`,
  Mercury: (ns, ss) => `You usually think and talk the ${ns} way. This year your mind runs on ${ss} lines: you pick different topics, write and speak differently, and get hooked by conversations you would have skipped. Follow what grabs your attention, because it points at the year's main insights.`,
};

const COMPARISON_AREAS: Record<string, string> = {
  Sun: 'leading and showing up',
  Moon: 'what calms you down',
  Mercury: 'thinking and talking',
  Venus: 'love and money',
  Mars: 'anger and ambition',
  Jupiter: 'risk and what you say yes to',
  Saturn: 'responsibility and deadlines',
};

export function buildNatalComparisons(
  natalPlanets: Array<{ name: string; sign: string; house?: number }>,
  srPlanets: Array<{ name: string; sign: string; house?: number }>,
): NatalComparison[] {
  const comparisons: NatalComparison[] = [];
  const trackPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  for (const name of trackPlanets) {
    const natal = natalPlanets.find(p => p.name === name);
    const sr = srPlanets.find(p => p.name === name);
    if (!natal || !sr) continue;
    const shifted = natal.sign !== sr.sign;
    const template = SHIFT_TEMPLATES[name];
    const interp = shifted && template
      ? template(natal.sign, sr.sign)
      : shifted
        ? `You usually handle ${COMPARISON_AREAS[name] || 'this part of your life'} the ${natal.sign} way. This year you do it the ${sr.sign} way, and people who know your habits notice the change before you do.`
        : `You handle ${COMPARISON_AREAS[name] || 'this part of your life'} the ${natal.sign} way this year, same as always. That keeps things steady, and it also means the old pattern repeats unless you break it on purpose.`;
    comparisons.push({ planet: name, natalSign: natal.sign, natalHouse: natal.house, srSign: sr.sign, srHouse: sr.house, shifted, interpretation: interp });
  }
  return comparisons;
}

// -- Monthly Timeline Generator --------

export interface SRMonthData {
  month: number;
  monthName: string;
  themes: string[];
  intensity: number; // 1-5
  keyPlanet: string;
  description: string;
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const HOUSE_MONTH_THEMES: Record<number, string> = {
  1: 'How you look and come across to people',
  2: 'Money decisions and what you think you are worth',
  3: 'Conversations, messages and what you are learning',
  4: 'Home, family and where you live',
  5: 'Dating, creative projects and having fun',
  6: 'Your health, your job and your daily routine',
  7: 'Your partner and the commitments between you',
  8: 'Shared money, intimacy and what you are ready to let go of',
  9: 'Travel, study and what you believe',
  10: 'Your career and how the public sees you',
  11: 'Friends, groups and the plans you are working toward',
  12: 'Time alone, rest and old things you finally let go of',
};

export function generateMonthlyTimeline(
  srPlanets: Array<{ name: string; sign: string; degree: number; house?: number; longitude: number }>,
  srAspects: Array<{ planet1: string; planet2: string; type: string; orb: number }>,
  year: number,
  birthMonth?: number,
): SRMonthData[] {
  const startMonth = birthMonth ?? 0;
  const months: SRMonthData[] = [];
  const planetHouses: Record<string, number> = {};
  for (const p of srPlanets) {
    if (p.house) planetHouses[p.name] = p.house;
  }
  const sun = srPlanets.find(p => p.name === 'Sun');
  const moon = srPlanets.find(p => p.name === 'Moon');
  const venus = srPlanets.find(p => p.name === 'Venus');
  const mars = srPlanets.find(p => p.name === 'Mars');
  const jupiter = srPlanets.find(p => p.name === 'Jupiter');
  const saturn = srPlanets.find(p => p.name === 'Saturn');

  const tightAspects = srAspects.filter(a => a.orb < 2).length;
  const hasHardAspects = srAspects.some(a => ['square', 'opposition', 'Square', 'Opposition'].includes(a.type) && a.orb < 3);

  for (let i = 0; i < 12; i++) {
    const monthIdx = (startMonth + i) % 12;
    const themes: string[] = [];
    let intensity = 2;
    let keyPlanet = 'Sun';
    const desc: string[] = [];

    if (i === 0) {
      themes.push('New solar year begins');
      intensity = 4;
      desc.push(`Your year starts here. Whatever turns up in ${MONTH_NAMES[monthIdx]}, whether a new person, a bad week or an offer, previews the rest of the year, so write it down.`);
    }
    if (i === 3) {
      themes.push('First quarter activation');
      intensity = Math.max(intensity, 3);
      if (mars) {
        keyPlanet = 'Mars';
        desc.push(`What you started pushing in the first weeks hits its first real resistance. An argument you have been swallowing comes out now, so raise it on your terms before it comes out sideways.`);
      }
    }
    if (i === 6) {
      themes.push('Midpoint of solar year');
      intensity = Math.max(intensity, 4);
      if (saturn) {
        keyPlanet = 'Saturn';
        desc.push(`You are halfway through your year, and what you committed to six months ago gets checked. You find out whether you are still in, and the honest answer decides the second half.`);
      }
    }
    if (i === 9) {
      themes.push('Third quarter: harvest or redirect');
      intensity = Math.max(intensity, 3);
      if (jupiter) {
        keyPlanet = 'Jupiter';
        desc.push(`What you planted earlier pays off now, or shows you the approach was wrong. Either way you double down or change course this month, so pick one.`);
      }
    }
    if (i === 11) {
      themes.push('Solar year closing');
      intensity = Math.max(intensity, 3);
      desc.push(`This is your last month before the next year starts. Some storylines wrap up, and you decide what to carry into the next twelve months and what to drop.`);
    }

    // Moon emphasis (emotional peaks at months 1, 4, 7, 10)
    if (moon && (i === 1 || i === 4 || i === 7 || i === 10)) {
      const mh = moon.house || 0;
      themes.push(HOUSE_MONTH_THEMES[mh] || 'Emotional shifts');
      intensity = Math.max(intensity, 3);
      keyPlanet = 'Moon';
      desc.push(`Feelings run high this month, and they center on ${lcFirst(HOUSE_MONTH_THEMES[mh] || 'what matters most to you right now')}.`);
    }

    // Venus peak (months 2, 5)
    if (venus && (i === 2 || i === 5)) {
      themes.push('Love and finances in focus');
      intensity = Math.max(intensity, 3);
      keyPlanet = 'Venus';
      desc.push(`Love and money pull at you this month. It becomes clear what you value and who values you back, and the people who do not stand out.`);
    }

    // Hard aspect activation (month 3, 8)
    if (hasHardAspects && (i === 3 || i === 8)) {
      themes.push('Tension and growth');
      intensity = Math.max(intensity, 4);
      desc.push(`Friction shows up this month in one specific spot, and it is not random. Pushing through the awkward conversation or the standoff, instead of going around it, is where you make the year\'s biggest gain.`);
    }

    if (desc.length === 0) {
      const sunH = sun?.house || 1;
      themes.push(HOUSE_MONTH_THEMES[sunH] || 'Core year themes active');
      desc.push(`Your year keeps working on ${lcFirst(HOUSE_MONTH_THEMES[sunH] || 'the main storyline')} in the background. Progress feels invisible this month, and what you do now still carries weight later.`);
    }

    months.push({
      month: monthIdx,
      monthName: MONTH_NAMES[monthIdx],
      themes,
      intensity,
      keyPlanet,
      description: desc.join(' '),
    });
  }
  return months;
}

function lcFirst(t: string): string {
  return t.charAt(0).toLowerCase() + t.slice(1);
}

// -- Multi-Year Pattern --------

export interface YearPattern {
  lastYear: { house: number; theme: string };
  thisYear: { house: number; theme: string };
  nextYear?: { house: number; theme: string };
  narrative: string;
}

const YEAR_FLOW_NARRATIVES: Record<string, string> = {
  '12-1': 'Last year you pulled back, closed things and spent a lot of time alone with your head. This year you come out the other side and people see it: a different look, a new decision, a version of you that stopped waiting for permission. What you let die last year makes room for it.',
  '1-2': 'Last year you changed who you are. This year you pay for it and profit from it: new income, new spending habits and a different number in your head for what you are worth.',
  '4-5': 'Last year went to home, family and getting steady on the inside. This year that steadiness lets you go out and play: date, make things and stop treating fun as something you have to earn.',
  '5-6': 'Last year was romance, creativity and being seen. This year the bill comes in: the sleep, the exercise and the work schedule that keep the excitement from burning out.',
  '6-7': 'Last year you rebuilt your routines and listened to your body. This year the person across from you takes over: a partner, a business partner or a hard conversation about what you owe each other.',
  '7-8': 'Last year was about one partner or one commitment. This year it gets serious: shared money, harder conversations about trust and the kind of closeness you cannot fake.',
  '9-10': 'Last year you traveled, studied or changed what you believe. This year other people see it: a promotion, a new role or a reputation built on what you now say out loud.',
  '10-11': 'Last year was about work and status. This year you ask who it is for, and friends, groups and a bigger goal pull you away from the desk and toward people.',
  '11-12': 'Last year you were out with people and making plans. This year you pull back, not because anything failed but because you are full. What you work through alone now decides what you build next.',
};

export function getYearPattern(lastYearSunHouse: number, thisYearSunHouse: number, nextYearSunHouse?: number): YearPattern {
  const key = `${lastYearSunHouse}-${thisYearSunHouse}`;
  const narrative = YEAR_FLOW_NARRATIVES[key] ||
    `Last year was about ${lcFirst(HOUSE_MONTH_THEMES[lastYearSunHouse] || 'your main storyline')}. This year the weight moves to ${lcFirst(HOUSE_MONTH_THEMES[thisYearSunHouse] || 'new ground')}, and what you built last year is what you stand on while you deal with it.`;

  return {
    lastYear: { house: lastYearSunHouse, theme: YEAR_THEME_HEADLINES[lastYearSunHouse]?.headline || '' },
    thisYear: { house: thisYearSunHouse, theme: YEAR_THEME_HEADLINES[thisYearSunHouse]?.headline || '' },
    nextYear: nextYearSunHouse ? { house: nextYearSunHouse, theme: YEAR_THEME_HEADLINES[nextYearSunHouse]?.headline || '' } : undefined,
    narrative,
  };
}
