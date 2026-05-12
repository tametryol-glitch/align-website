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
  Aries:       { surface: 'lit up from the inside — impatient, fearless, and carrying the energy of someone who has already decided they are done waiting', deep: 'a raw, almost primal hunger to prove that you are capable of standing on your own two feet, leading without anyone\'s permission, and igniting something from nothing', drive: 'the burning urgency to begin — to start a chapter so undeniably yours that even you are surprised by your own courage' },
  Taurus:      { surface: 'steady, unhurried, and radiating the kind of quiet confidence that only comes from someone who knows exactly what they want', deep: 'a bone-deep craving for permanence — for something real you can touch, taste, and trust will still be there tomorrow', drive: 'the slow, deliberate work of building something so solid that no storm, no person, no loss can take it from you' },
  Gemini:      { surface: 'electric with curiosity — quick-witted, effortlessly social, and always two conversations ahead of everyone in the room', deep: 'a mind that cannot rest — constantly collecting, connecting, and reorganizing information as if the right combination of words could unlock everything', drive: 'the relentless pursuit of stimulation, connection, and intellectual aliveness — because for you, boredom is not just uncomfortable, it is suffocating' },
  Cancer:      { surface: 'deeply feeling, instinctively protective, and quietly attuned to the emotional undercurrents that everyone else misses', deep: 'an ache for belonging so profound it can disguise itself as anxiety — a need to know that the people you love are safe and that you have somewhere soft to land', drive: 'the fierce, tender work of creating a world — a home, a family, an inner life — where your heart can finally exhale' },
  Leo:         { surface: 'luminous, generous, and magnetically alive — the kind of presence that makes people look up when you walk in', deep: 'a vulnerability hidden behind all that warmth: the terrifying need to be truly seen, not just admired — loved for the real you, not the performance', drive: 'the courageous act of putting your heart into your work, your art, your love — and letting people witness it without apology' },
  Virgo:       { surface: 'sharp-eyed, quietly competent, and operating with a precision that makes the complicated look effortless', deep: 'a relentless inner voice that whispers you could be better — not out of cruelty, but out of a genuine devotion to getting things right', drive: 'the quiet dignity of being useful — of mastering the details that hold everything together while others chase glory' },
  Libra:       { surface: 'graceful, disarming, and carrying an almost gravitational pull toward harmony — people feel more balanced just being around you', deep: 'a profound longing for a true partner — someone who meets you as an equal — and an almost physical discomfort when beauty, justice, or fairness is absent', drive: 'the art of creating equilibrium — in your relationships, your environment, your inner world — because you know that beauty is not decoration, it is medicine' },
  Scorpio:     { surface: 'intensely present, unnervingly perceptive, and wrapped in a quiet power that makes people either deeply trust you or deeply fear you', deep: 'a compulsion to see beneath every surface — to find the hidden truth, the buried motive, the secret that explains everything — because you cannot rest in a world built on lies', drive: 'the unflinching willingness to walk into the dark places others avoid — grief, desire, power, death — because you know that transformation only happens at the edges' },
  Sagittarius: { surface: 'restless, blazingly optimistic, and vibrating with the energy of someone who has already mentally booked a one-way ticket somewhere they have never been', deep: 'a hunger for meaning that makes ordinary life feel like a cage — a need to believe that there is something vast and true waiting on the other side of the horizon', drive: 'the expansion of everything — your mind, your geography, your understanding of what is possible — because for you, a small life is not a safe life, it is a slow death' },
  Capricorn:   { surface: 'composed, strategically brilliant, and carrying the kind of quiet authority that comes from someone who has earned every inch of their position', deep: 'a private fear of being forgotten — of working your entire life and having nothing lasting to show for it — that drives you harder than ambition ever could', drive: 'the patient, unglamorous construction of a legacy — something built so well that it outlasts your name and proves you were here' },
  Aquarius:    { surface: 'brilliantly unconventional, coolly detached, and wired to see the future that everyone else is still afraid to imagine', deep: 'a paradox that defines you: the ache to belong somewhere, paired with an absolute refusal to shrink yourself to fit — you want connection, but never at the cost of your truth', drive: 'the radical act of thinking for yourself — building systems, ideas, and futures that serve everyone, even if you have to stand alone to do it' },
  Pisces:      { surface: 'ethereal, emotionally translucent, and carrying a tenderness that makes people feel safe enough to show you their wounds', deep: 'a soul so porous it absorbs the joy and suffering of everyone around you — a connection to something vast and wordless that makes ordinary reality feel thin', drive: 'the dissolution of every wall between you and the divine — surrender, compassion, and the willingness to feel everything, even when it costs you' },
};

// -- House life areas (bold, specific) --------

const HOUSE_LIFE: Record<number, { area: string; specific: string }> = {
  1:  { area: 'who you are becoming — your body, your presence, and the version of yourself the world is about to meet', specific: 'you will look different, carry yourself differently, and leave a different impression on everyone you encounter — this is not subtle, it is a visible metamorphosis that begins from the inside and works its way out' },
  2:  { area: 'your relationship with money, material security, and your own sense of worth', specific: 'what you earn, what you refuse to settle for, and the price you put on your own time and talent — something shifts here that rewires how you think about abundance and what you believe you deserve' },
  3:  { area: 'the conversations that change your mind, the ideas that keep you up at night, and the words you finally say out loud', specific: 'a piece of information arrives — through a conversation, a message, a book, or a passing comment — that rearranges your understanding of something important; a sibling, neighbor, or close contact plays a surprisingly pivotal role' },
  4:  { area: 'the place you call home, the family that shaped you, and the emotional ground you stand on', specific: 'a move, a renovation, a family reckoning, or an emotional excavation of your roots — by the end of this year, where you live or how you relate to your origins will be fundamentally different' },
  5:  { area: 'the things that make you feel alive — romance, creative expression, play, and the courage to be seen', specific: 'a love affair ignites or reignites, a creative project demands to be born, a child-related event reshapes your world, or you finally give yourself permission to experience joy without guilt' },
  6:  { area: 'the rituals that sustain you — your health, your daily work, and the unglamorous habits that hold your life together', specific: 'your body sends a message you cannot ignore, your work situation transforms, or you dismantle and rebuild your daily routine from the ground up — the small things become the big things this year' },
  7:  { area: 'the person standing across from you — your partnerships, your commitments, and the mirror that only another human can hold up', specific: 'a relationship begins that changes your trajectory, an existing bond is tested and either deepens into something unshakeable or reveals itself as finished — there is no neutral ground here' },
  8:  { area: 'the territory most people are afraid to enter — intimacy, shared finances, psychological depth, and the death of who you used to be', specific: 'money arrives or departs through another person, a sexual or emotional bond reaches a depth that permanently alters you, an inheritance or debt reshapes your reality, or something inside you dies so something truer can take its place' },
  9:  { area: 'the horizon you have been staring at — travel, education, philosophy, and the beliefs that give your life its shape', specific: 'a journey to a place that rewrites your sense of the world, a return to learning that feels like coming home, a legal matter that demands your attention, or a moment where everything you thought you believed is quietly replaced by something more honest' },
  10: { area: 'your place in the world — your career, your reputation, and the legacy you are building whether you realize it or not', specific: 'a promotion, a pivot, a public moment that defines how others see you — what happens in your professional life this year will echo for a long time, and the decisions you make here are not reversible' },
  11: { area: 'the people who share your vision — your friendships, your communities, and the dreams you are brave enough to say out loud', specific: 'your social world reshuffles in ways that feel both unsettling and liberating, a group or cause becomes central to your identity, or a dream you have quietly carried for years finally shows the first unmistakable signs of becoming real' },
  12: { area: 'the invisible world beneath your waking life — your subconscious, your spiritual path, and the parts of yourself you have never shown anyone', specific: 'you withdraw not because you are broken but because something sacred is forming in the silence — old wounds surface for healing, vivid dreams deliver messages your conscious mind cannot access, and patterns you never knew were running your life finally become visible' },
};

// -- Bold prediction templates per planet per house --------

const BOLD_PREDICTIONS: Record<string, Record<number, string>> = {
  Sun: {
    1: 'You are not tweaking your life this year — you are rewriting your entire introduction. There will be a moment, probably sooner than you expect, when you look in the mirror and realize you are becoming someone you have never been before. Your body changes. Your style shifts. The way you walk into a room feels different. People who knew the old you will struggle to reconcile that person with who you are now — and some of them will not be able to handle it. Let them go. The person emerging this year is closer to the truth of you than anything that came before.',
    2: 'Money is about to tell you something about yourself this year. There is a financial event coming — a raise you finally ask for, an income stream that appears from an unexpected direction, or a purchase that feels terrifyingly indulgent but turns out to be exactly right. But the deeper shift is not about the number in your account. It is about the number you have been assigning to your own worth. That changes this year. And once it does, every negotiation, every relationship, every decision will recalibrate around a version of you that no longer apologizes for wanting more.',
    3: 'A single conversation will split this year into before and after. You will hear something — or say something — that cannot be unsaid, and from that moment forward, the way you think about a situation, a person, or yourself will be permanently different. You may also feel called to write, teach, or share an idea publicly for the first time. Pay attention to what your mind keeps circling back to at 2am — that is not anxiety, that is your intelligence trying to tell you where to point your attention. A sibling, neighbor, or someone in your immediate circle plays a role in this year that neither of you expected.',
    4: 'Something is shifting at the deepest level of your life — the foundation, the roots, the place you come from and the place you return to when everything else falls away. You may physically move, renovate, or completely change your living situation. But even if your address stays the same, your relationship to "home" — what it means, who belongs there, and what emotional safety actually feels like — will be unrecognizable by the end of this year. There is a reckoning with a parent or family pattern that has been waiting for you. It is not coming to punish you. It is coming to free you.',
    5: 'Love is not a possibility this year — it is an inevitability. The only question is what form it takes. If you are single, someone is coming into your orbit who will make you feel alive in a way you had started to think was behind you. If you are partnered, your relationship is about to find a new frequency — rawer, more playful, more honest. But love is not the only thing demanding your attention here. A creative impulse is building in you that refuses to be ignored. A project, an idea, a piece of work that carries your fingerprint will take shape this year, and looking back, you will recognize it as one of the most authentically yours things you have ever made.',
    6: 'Your body knows things your mind has been refusing to hear, and this year it will stop whispering and start speaking at full volume. A health matter demands attention — not necessarily a crisis, but a clear signal that the way you have been treating your body is no longer sustainable. At the same time, your daily work life undergoes a transformation. A new role, a shift in responsibilities, a colleague who changes your professional trajectory, or the realization that you have been pouring your best hours into the wrong thing. The small, daily decisions you make this year — what you eat, when you sleep, how you spend your first hour — will compound into something that reshapes your entire reality.',
    7: 'There is a person at the center of this year. Not in the background, not as a subplot — at the center. If you are single, someone is coming who will make you reconsider what you thought you wanted. They will not match the checklist in your head, and that is exactly why they matter. If you are in a relationship, the next twelve months will take your partnership somewhere it has never been — a level of honesty, vulnerability, and mutual recognition that either cements you together permanently or reveals that you have been holding onto something that has already ended. A contract, agreement, or formal commitment may also be signed. This year, your life is defined by who you choose to stand next to.',
    8: 'This is the year something in you dies — and you should let it. There is a version of yourself, a fear, a financial arrangement, a secret, or an emotional debt that has been taking up space in your psyche for too long. This year, the universe is not asking you to let go. It is prying your fingers off the ledge. There is a financial event involving someone else\'s money — an inheritance, a settlement, a shared investment, a debt resolved. Intimacy reaches a level that feels almost dangerous, not because it is harmful but because it requires you to be so nakedly honest that every defense you have ever built becomes useless. On the other side of this year, you will weigh less. Not on a scale. Inside.',
    9: 'You are going somewhere this year — and I do not just mean geographically, although a significant trip is very likely. I mean that your entire framework for understanding the world is about to be disassembled and rebuilt. A book, a teacher, a foreign culture, a legal proceeding, or a spiritual experience will introduce an idea that does not fit inside your current belief system, and instead of rejecting it, you will realize that your belief system is what needs to change. This is the year you outgrow the intellectual container you have been living in. It will feel disorienting. It will also feel like the most honest thing that has ever happened to you.',
    10: 'The world is about to learn your name — or learn it differently. Your career takes a turn this year that you will still be talking about a decade from now. A promotion, a public achievement, a professional pivot, or a moment of recognition that puts you on a different level. But here is what the chart is really saying: this is not just about professional success. This is about stepping into your authority. Owning that you are good at what you do. Letting people see your ambition without softening it or apologizing for it. Someone in a position of power is watching you this year. What they see will open a door.',
    11: 'Your social world is about to be reorganized by forces larger than preference or convenience. Some friendships will deepen into the kind of bonds that survive anything. Others — the ones held together by habit, proximity, or guilt — will quietly dissolve, and you will feel the absence as relief. A group, organization, or community becomes genuinely important to your sense of purpose. And here is the prediction that will make your chest tighten when you read it: a dream you have been carrying for years — one you may have stopped talking about because you were afraid of sounding naive — will show its first undeniable signs of becoming real. Not "someday." This year.',
    12: 'The most important things that happen to you this year will happen in silence. You will feel a pull to withdraw — not from depression, but from necessity. Something inside you is asking for stillness, for attention, for the kind of listening that can only happen when the noise stops. A spiritual experience, a vivid dream, a moment of unexpected clarity in meditation or therapy will deliver a piece of information that your conscious mind could never have reached on its own. Trust it. Old patterns — the ones you inherited, the ones you adopted to survive, the ones you did not even know were running your life — will become visible this year. And visibility is the first step to freedom.',
  },
  Moon: {
    1: 'You will not be able to hide what you feel this year, and the attempt to do so will only exhaust you. Your emotions will live on the surface of your skin, in your eyes, in the way your voice breaks at unexpected moments. This is not weakness — it is the most powerful thing that will happen to you. Someone will be deeply, permanently changed by witnessing your unguarded truth. Your face, your body, the way you present yourself to the world will shift in response to the emotional tides moving through you — and the person who emerges is someone people will trust instinctively, because you will finally look like how you actually feel.',
    2: 'Money and feelings are so deeply braided together this year that you will not be able to address one without confronting the other. A financial worry will reveal an emotional wound. A financial windfall will unlock a sense of safety you have been chasing for longer than you realize. There is a purchase or investment coming that makes no logical sense — it will feel emotional, impulsive, maybe even reckless — and it will turn out to be one of the best decisions you make all year. Your relationship with money is really a relationship with your own worthiness, and this year, that relationship finally gets honest.',
    3: 'Words will carry the weight of earthquakes this year. A conversation is coming — with a sibling, a friend, a neighbor, or someone you interact with daily — that will reach into your chest and rearrange something. You will replay it for weeks. A message arrives — a text you did not expect, a letter that feels like it was written in a different era, an email that lands at the exact moment you needed to hear it — and it shifts how you feel about someone or something in a way that cannot be reversed. Your own words carry unusual power too. What you say this year heals people. Choose carefully, because it also has the power to wound.',
    4: 'This is the year your family history catches up to you — not to harm you, but to be healed. A parent or family member needs you in a way that pulls you deep into the emotional waters of your childhood. Or you need to go back to something you left behind — a house, a city, a feeling of safety that you lost and have been quietly searching for ever since. You may cry more this year than you have in a long time. Do not fight it. The tears are not a symptom of something wrong — they are the sound of something old finally breaking open so something new can grow in its place. Your definition of home is being rewritten from the inside.',
    5: 'Joy is going to find you this year in a way that catches you completely off guard. You have been functioning, managing, coping — and suddenly something or someone will make you feel genuinely, ridiculously alive. You will fall in love — with a person, with a creative project, with a part of yourself you thought you had outgrown. If children are part of your life, they will be the source of emotional moments this year that imprint on your memory permanently. Something you create — a piece of writing, a painting, a song, a business idea born from passion rather than strategy — will carry so much of your emotional truth that showing it to the world will feel like undressing in public. Show it anyway.',
    6: 'Your body is not separate from your feelings this year — it is the vessel carrying all of them. Stress that you swallow will appear as symptoms. Anxiety you ignore will show up as insomnia, tension, or digestive trouble. But here is the other side of that coin: the moment you begin treating your body as the partner it is — moving it, feeding it well, letting it rest — your emotional world will stabilize in ways that therapy alone cannot achieve. A new routine becomes a form of self-love so profound it surprises you. The walk you take every morning, the meal you prepare with attention, the hour you reclaim for sleep — these are not just healthy choices, they are emotional anchoring rituals that this year demands you build.',
    7: 'Someone is going to make you feel things you had genuinely convinced yourself you were finished feeling. Whether this is a new person walking into your life or a long-term partner revealing a side of themselves you have never seen, the emotional intensity is real, it is deep, and it will not let you stay comfortable. You need to be truly seen this year — not admired from a distance, not appreciated for what you do, but known. If you let someone in that far, the intimacy will be the kind that rewrites your nervous system. If you keep your walls up, the loneliness will become louder than you can stand. This year, half-relationships are not enough. Your heart is asking for the real thing.',
    8: 'Something heavy is moving through you this year — grief you have not fully processed, desire you have not acknowledged, a fear so old you have forgotten its origin. This is the year it surfaces. Not to overwhelm you, but because you are finally strong enough to face it. You will cry in unexpected places. You will want to talk about things you have never spoken about. You will feel rage, tenderness, exhaustion, and liberation — sometimes in the same hour. On the other side of this passage, you will be lighter than you have felt in years. The weight you have been carrying was never yours to keep. This year, you put it down.',
    9: 'Ordinary life is going to feel unbearable this year — not because anything is wrong, but because your soul is hungry for something bigger. You need meaning the way most people need air. A journey — across an ocean, through a book, into a philosophy you have never explored — will feed a part of you that has been starving. You may feel homesick for a place you have never been, nostalgic for a life you have never lived. That is not confusion. That is your spirit recognizing where it needs to go next. Follow the longing. It knows more than your plans do.',
    10: 'You cannot separate your career from your heart this year, and you should stop trying. Every professional decision will carry emotional weight — the promotion will make you cry, the setback will feel personal, the meeting will trigger feelings that have nothing to do with the agenda. This is not unprofessional. This is your soul telling you that your work must mean something. If your current path feels hollow, you will make a change this year that everyone around you will call risky — and every cell in your body will know it is right. Your public life and your private emotional truth are merging, and the result is a career that finally feels like it belongs to you.',
    11: 'Your friendships are not casual accessories this year — they are emotional lifelines. You need your people with an urgency that may surprise you. A friend will show up for you in a moment of genuine need, and the depth of their loyalty will move you in a way you did not expect. But this year also asks you to grieve. A friendship that has been slowly fading — one held together by history rather than present truth — will finally reach its quiet end. Let it go with love. The friendships that remain will be the ones that can hold the weight of who you are actually becoming, not who you used to be.',
    12: 'Solitude is not your enemy this year — it is your healer. You need silence the way a burn needs cool water. Dreams will become vivid, specific, and emotionally loaded — pay attention to them, because your subconscious is delivering information that your waking mind has been blocking. Meditation, therapy, journaling, prayer, long walks alone — whatever form your inner practice takes, it becomes the most important appointment on your calendar. Emotional patterns that have been running your life from the shadows will become visible this year: the way you abandon yourself to please others, the way you equate rest with laziness, the way you avoid the very love you keep saying you want. Seeing these patterns is the beginning of being free from them.',
  },
};

// -- Ordinal helper --------

function ordinal(n: number): string {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
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

  r += `I have studied your solar return chart — the chart cast for the precise moment the Sun returns to the exact degree it occupied when you took your first breath — and what I see is not vague. It is pointed. It is personal. Every planet in this chart has landed in a specific room of your life, and beneath each visible placement are hidden layers that reveal motivations, hungers, and turning points that will not make sense until you are living them. This is not a horoscope you could hand to anyone born under your sign. This is yours.\n\n`;

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
    r += `The moment people encounter you this year, they will feel something they cannot quite name. On the surface, you come across as ${ascE?.surface || asc.sign + ' energy'}. There is ${ascE?.deep || 'a shift in your presence'} radiating off you, whether you intend it or not. But beneath that visible layer, something more private is pulling the strings. `;
    r += `There is a quieter force at work — ${duadE?.drive || 'something deeper'} — shaping your choices in ways you will only recognize in hindsight. `;
    if (duadH) r += `This undercurrent expresses itself most powerfully through ${HOUSE_LIFE[duadH]?.area || 'a key life area'}. `;
    r += `And buried even deeper, at the level where instinct overrides logic, there is ${compE?.deep || 'a current so fundamental it barely has words'} — `;
    if (compH) r += `reaching into ${HOUSE_LIFE[compH]?.area || 'the most hidden dimension of your life'}. `;
    r += `This is why your year will feel layered — why you will sometimes act in ways that surprise you, drawn toward things that do not match your conscious plans. The chart is saying: trust those instincts. They know where you need to go.\n\n`;
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
    r += `Your Sun has landed in the **${ordinal(sun.house)} house** — ${houseInfo?.area || 'a part of your life demanding your full, undivided attention'}. This is not background noise. This is the room of your life where the lights are brightest, where the stakes are highest, where you will pour your energy whether you planned to or not. `;
    r += `The way you move through this territory is ${sunE?.surface || sun.sign} — but the hidden engine driving you is ${SIGN_ENERGY[duad]?.drive || 'something far more primal than what the surface reveals'}. `;
    if (duadH && duadH !== sun.house) {
      r += `This deeper motivation is tangled with ${HOUSE_LIFE[duadH]?.area || 'another part of your existence'} — two seemingly separate areas of your life are secretly feeding each other, and the connection will reveal itself at a moment that makes everything click. `;
    }
    if (compH && compH !== sun.house && compH !== duadH) {
      r += `And at the most instinctive level — the place where decisions are made before your conscious mind even knows a choice was available — your energy is being pulled toward ${HOUSE_LIFE[compH]?.area || 'territory you may not consciously recognize yet'}. When you feel an inexplicable urge to do something that makes no logical sense, that is this layer speaking. Listen to it. `;
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
    r += `Your Moon is in **${moon.sign}**${moon.house ? ` in your **${ordinal(moon.house)} house**` : ''}, and this placement tells me something intimate about the emotional weather of your coming year. At the level you are aware of, you feel ${moonE?.surface || 'deeply affected by ' + moon.sign + ' themes'}. `;
    r += `What you need in order to feel genuinely safe — not just functioning, but held — is ${moonE?.deep || 'something woven into ' + moon.sign + ' energy'}. `;
    r += `But beneath that visible emotional landscape, there is a quieter hunger — one connected to ${SIGN_ENERGY[duad]?.drive || 'a longing you may struggle to articulate even to yourself'}`;
    if (duadH) r += `, and it surfaces most acutely in the territory of ${HOUSE_LIFE[duadH]?.area || 'a part of your life that holds more emotional charge than you realize'}`;
    r += `. `;
    if (compH) {
      r += `And at the very root — the place your emotions go when every mask has been removed and every defense has been lowered — there is ${SIGN_ENERGY[comp]?.deep || 'a primal, wordless need'}. This is the feeling that finds you at 3am, the one that surfaces in dreams, the one that makes you ache for something you cannot quite name. It is reaching into ${HOUSE_LIFE[compH]?.area || 'the most tender dimension of your existence'}. `;
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
    r += `Venus in **${venus.sign}**${venus.house ? ` in the **${ordinal(venus.house)} house**` : ''} governs the magnetic field around your heart and your wallet this year — what you reach for, who reaches for you, and why certain people and experiences feel irresistible while others leave you cold. On the surface, your style of loving is ${venE?.surface || venus.sign + ' flavored'}. You are drawn — almost helplessly — to people and experiences that embody ${venE?.drive || venus.sign + ' qualities'}. `;
    r += `But the attractions that truly undo you — the ones that bypass your logic entirely — are rooted in ${SIGN_ENERGY[duad]?.deep || 'something far more complex than preference'}`;
    if (duadH) r += `, and they play out with particular intensity in the realm of ${HOUSE_LIFE[duadH]?.area || 'your closest relationships'}`;
    r += `. `;
    if (compH) {
      r += `At the most instinctive, inarticulate level, what makes your pulse quicken this year carries the energy of something ${SIGN_ENERGY[comp]?.surface || 'you could not explain to someone who has not felt it'} — and it surfaces through ${HOUSE_LIFE[compH]?.area || 'a part of your life you would not have expected'}. `;
    }
    if (venus.house === 5 || venus.house === 7 || venus.house === 1) {
      r += `\n\n**Here is what I predict:** Love is not optional this year — it is coming for you whether you feel ready or not. If you are single, someone enters your world who makes your carefully constructed walls feel absurd. If you are partnered, your relationship reaches a depth or a crisis that forces you both to stop performing and start being real. The chart is not whispering about this. It is speaking clearly: ${year} is a year where love demands to be felt.`;
    } else if (venus.house === 2 || venus.house === 8 || venus.house === 10) {
      r += `\n\n**Here is what I predict:** Your financial reality is about to shift in a way that reflects how you feel about yourself. Money arrives from a direction you did not anticipate, or your earning power increases because you stop undercharging for what you bring to the table. By the end of this year, the number in your account will tell a different story — and more importantly, so will the number you carry in your chest when someone asks what you are worth.`;
    }
    r += `\n\n`;
  }

  // -- MARS — Drive and Conflict --------
  if (mars) {
    const marsE = SIGN_ENERGY[mars.sign];
    const duad = calculateDuad(mars.sign, mars.degree);
    const duadH = findHouseForSign(duad, houseCusps);

    r += `### Where You Will Fight and What You Will Fight For\n\n`;
    r += `Mars in **${mars.sign}**${mars.house ? ` in the **${ordinal(mars.house)} house**` : ''} reveals where your fire burns hottest and where your patience runs thinnest. The way you pursue what you want this year is ${marsE?.surface || 'driven and unapologetic'} — and there is nothing polite about it. `;
    if (mars.house) {
      const mArea = HOUSE_LIFE[mars.house];
      r += `The arena where your energy concentrates is ${mArea?.area || 'a critical part of your life'} — this is where you will clash, sweat, push through resistance, and ultimately make the most undeniable progress of your year. ${mArea?.specific || ''} `;
    }
    r += `Beneath the visible aggression, your real fuel source is ${SIGN_ENERGY[duad]?.drive || 'something more complex than simple ambition'}`;
    if (duadH && duadH !== mars.house) r += `, and it is secretly entangled with ${HOUSE_LIFE[duadH]?.area || 'a part of your life you might not immediately connect to this fight'}`;
    r += `.\n\n`;
    if (mars.house === 1 || mars.house === 10) {
      r += `**Here is what I predict:** You will take a leap this year that makes the cautious people in your life hold their breath — and it will land. The difference between you and everyone watching from the sidelines in ${year} is that you are willing to move before the guarantee arrives. That is not recklessness. That is instinct. Trust it.\n\n`;
    } else if (mars.house === 7) {
      r += `**Here is what I predict:** A confrontation is coming in a relationship that matters to you — and avoiding it will cost you more than facing it ever could. There is a conversation that has been building pressure, and this year it breaks through. What you say in that moment, if you say it from the honest place rather than the defended place, will permanently change the relationship. For the better.\n\n`;
    }
  }

  // -- JUPITER — Luck and Growth --------
  if (jupiter) {
    const jupE = SIGN_ENERGY[jupiter.sign];
    const duad = calculateDuad(jupiter.sign, jupiter.degree);
    const duadH = findHouseForSign(duad, houseCusps);

    r += `### Where Luck Finds You\n\n`;
    r += `Jupiter in **${jupiter.sign}**${jupiter.house ? ` in the **${ordinal(jupiter.house)} house**` : ''} is the part of your chart that made me smile. This is your zone of expansion — the area of life where the universe is actively conspiring in your favor, where doors open before you knock, where risks pay off in ways that make skeptics uncomfortable. `;
    if (jupiter.house) {
      r += `The growth is concentrated in ${HOUSE_LIFE[jupiter.house]?.area || 'a part of your life that is ready to get bigger'}. ${HOUSE_LIFE[jupiter.house]?.specific || ''} `;
    }
    r += `The hidden engine behind this luck connects to ${SIGN_ENERGY[duad]?.drive || 'an aspiration so deep you may not even call it a goal — it feels more like a destiny'}`;
    if (duadH && duadH !== jupiter.house) r += ` — and it threads through ${HOUSE_LIFE[duadH]?.area || 'a related part of your life that benefits from the overflow'}`;
    r += `. Do not shrink from this. Do not be modest. Do not talk yourself out of the opportunity because it feels too good. Jupiter rewards the people who say yes before they feel ready.\n\n`;
  }

  // -- SATURN — Tests and Mastery --------
  if (saturn) {
    const satE = SIGN_ENERGY[saturn.sign];
    const duad = calculateDuad(saturn.sign, saturn.degree);
    const duadH = findHouseForSign(duad, houseCusps);

    r += `### Where You Will Be Tested — And What You Will Master\n\n`;
    r += `Saturn in **${saturn.sign}**${saturn.house ? ` in the **${ordinal(saturn.house)} house**` : ''} is the part of your chart that does not care about your feelings — and that is exactly why it is the most important. This is the teacher who arrives uninvited, assigns the hardest lesson, and refuses to let you skip the exam. This year demands that you become ${satE?.surface || 'disciplined, mature, and unflinchingly honest with yourself'} in the realm of ${saturn.house ? HOUSE_LIFE[saturn.house]?.area || 'a part of your life that has been operating on borrowed time' : 'your life'}. `;
    if (saturn.house) r += `${HOUSE_LIFE[saturn.house]?.specific || ''} `;
    r += `The deeper lesson — the one Saturn is really teaching you — connects to ${SIGN_ENERGY[duad]?.deep || 'an internal pattern you have been avoiding because confronting it requires you to grow up in a way that terrifies you'}`;
    if (duadH && duadH !== saturn.house) r += `, and it plays out through ${HOUSE_LIFE[duadH]?.area || 'a related dimension of your life that is entangled with this growth'}`;
    r += `. `;
    r += `\n\n**Here is what I predict:** There will be a moment this year — probably in the first half — where every part of you wants to quit, to take the shortcut, to choose the comfortable path over the right one. You will feel it in your bones: the temptation to settle. Do not. What Saturn is constructing in your life this year is permanent — it is the foundation that every future version of you will stand on. The heaviness you feel right now is not punishment. It is the weight of something real being built. Stay.\n\n`;
  }

  // -- URANUS — Surprises --------
  if (uranus && uranus.house) {
    r += `### The Unexpected\n\n`;
    r += `Uranus in your **${ordinal(uranus.house)} house** is the lightning bolt in your chart — the event you cannot schedule, cannot prepare for, and cannot undo once it arrives. Something in the realm of ${HOUSE_LIFE[uranus.house]?.area || 'your life'} is about to be disrupted by a force that cares nothing for your plans. `;
    r += `In the moment, it will feel like the ground has been pulled out from under you. But when you look back — and you will — you will see this disruption as the exact thing that freed you from a structure, a pattern, or a commitment that had quietly become a cage. ${HOUSE_LIFE[uranus.house]?.specific || 'This part of your life is about to be liberated in a way you could not have designed yourself'}.\n\n`;
  }

  // -- NEPTUNE — Dreams and Illusions --------
  if (neptune && neptune.house) {
    r += `### Where Dreams Blur With Reality\n\n`;
    r += `Neptune in your **${ordinal(neptune.house)} house** casts a luminous, intoxicating haze over ${HOUSE_LIFE[neptune.house]?.area || 'a part of your life'} — and it is both the most beautiful and the most dangerous energy in your chart this year. `;
    r += `In this area of life, you will feel inspired in ways that border on the spiritual. Creativity flows. Intuition sharpens. You sense things you cannot prove. But Neptune also dissolves clarity, and what looks like a dream can be a mirage. The key this year is to honor the vision without abandoning the facts. Let yourself be moved, but do not sign anything without reading the fine print. The breakthroughs available here — artistic, spiritual, emotional — are real. But they require you to stay tethered to the ground even as your soul wants to fly.\n\n`;
  }

  // -- PLUTO — Power and Transformation --------
  if (pluto && pluto.house) {
    r += `### Where Power Transforms You\n\n`;
    r += `Pluto in your **${ordinal(pluto.house)} house** is the most quietly devastating force in your chart. It does not ask for permission. In the realm of ${HOUSE_LIFE[pluto.house]?.area || 'a critical part of your existence'}, something is being dismantled — not randomly, not cruelly, but with the precision of a surgeon removing something that would eventually destroy you if it stayed. `;
    r += `What dies in this area of your life this year needed to die. You may grieve it. You may resist it. But when you see what rises from the ashes — the relationship that replaces the one that was draining you, the version of yourself that emerges from the wreckage of the version that was pretending — you will understand that Pluto was never your enemy. It was the only force in the universe willing to do what needed to be done.\n\n`;
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
    r += `Juno — the fierce, uncompromising force in your chart that governs what your soul will and will not accept from the people closest to you — is in **${juno.sign}**${juno.house ? ` in your **${ordinal(juno.house)} house**` : ''}. `;
    r += `This year, the bar you hold for partnership is ${junoE?.surface || juno.sign + '-flavored'} — and it is not negotiable. You are finished tolerating less than you deserve, and the specific territory where that line is being drawn is ${juno.house ? HOUSE_LIFE[juno.house]?.area || 'the heart of your relational world' : 'in the commitments that define your life'}. `;
    r += `Beneath what you can articulate, there is ${SIGN_ENERGY[duad]?.deep || 'a non-negotiable so deep it lives in your body rather than your mind'} — this is the thing you will never say in words, but you will walk away from anyone who violates it, and you will not be able to explain why except that your entire being said no`;
    if (duadH) r += `. This invisible standard is woven into ${HOUSE_LIFE[duadH]?.area || 'a part of your life that carries more weight than anyone realizes'}`;
    r += `. `;
    if (compH) {
      r += `At the most primal level, your loyalty this year belongs to the person who understands ${SIGN_ENERGY[comp]?.drive || 'the thing about you that you have never had to explain'} — and the proving ground is ${HOUSE_LIFE[compH]?.area || 'a part of your life that will surprise both of you'}. `;
    }
    if (juno.house === 7 || juno.house === 1) {
      r += `\n\n**Here is what I predict:** A commitment reaches its moment of truth this year — it either solidifies into something permanent or it shatters. There is no more ambiguity. If a relationship has been floating in the gray zone, this is the year the gray burns away. Someone will prove their loyalty to you in a way that removes all doubt — or their failure to do so will tell you everything you need to know. Your body will register the answer before your mind catches up. Trust the body.`;
    } else if (juno.house === 5) {
      r += `\n\n**Here is what I predict:** A romance reaches a crossroads where it either becomes undeniably real or reveals itself as a beautiful distraction. The casual phase has expired. What your heart is demanding now is depth, consistency, and the willingness to be chosen — not just desired, but chosen — every single day. Anything that falls short of that will feel like a betrayal of your own evolution.`;
    } else if (juno.house === 10) {
      r += `\n\n**Here is what I predict:** A professional partnership becomes one of the defining relationships of your year. Someone you work with earns your trust at a level that goes beyond business — or their betrayal teaches you something about loyalty that changes how you operate forever. Either way, this alliance reshapes your public trajectory in ways neither of you can predict from here.`;
    } else if (juno.house === 8) {
      r += `\n\n**Here is what I predict:** A relationship reaches a depth of intimacy this year that feels almost terrifying — not because it threatens to hurt you, but because it demands that you be more naked, more honest, and more vulnerable than you have ever allowed yourself to be. If you open that door, the bond that forms on the other side will be forged from something unbreakable. If you keep your armor on, the relationship will die slowly — and both of you will know why.`;
    } else {
      r += `\n\n**Here is what I predict:** Your understanding of loyalty undergoes a permanent upgrade this year. Someone in your life will rise to meet the person you are becoming — or they will reveal, through their inability to show up, that the relationship was built for a version of you that no longer exists. For the first time, you will feel peace instead of guilt when you let go of what no longer fits.`;
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

    r += `### Your Sacred Focus — What You Are Devoted To This Year\n\n`;
    r += `Vesta — the keeper of your inner flame, the part of you that would rather burn out than live a half-committed life — is in **${vesta.sign}**${vesta.house ? ` in your **${ordinal(vesta.house)} house**` : ''}. `;
    r += `This year, your devotion takes the form of something ${vestE?.surface || vesta.sign + '-flavored'} and it pours itself into ${vesta.house ? HOUSE_LIFE[vesta.house]?.area || 'a mission that chooses you as much as you choose it' : 'something that refuses to share your attention with anything trivial'}. `;
    r += `This is not interest. This is not a hobby. This is the thing you will stay up until 3am working on without noticing the time, the thing you will protect with a ferocity that surprises the people around you, the thing that makes your life feel like it has a reason. `;
    r += `The deeper fuel source driving this devotion is ${SIGN_ENERGY[duad]?.drive || 'a motivation that runs far deeper than ambition or discipline'}`;
    if (duadH) r += `, and it channels itself through ${HOUSE_LIFE[duadH]?.area || 'a part of your life that becomes consecrated by your attention'}`;
    r += `. `;
    if (compH) {
      r += `And at the very root of your inner flame — the coal that keeps it burning when everything else goes dark — there is ${SIGN_ENERGY[comp]?.deep || 'something ancient, instinctive, and utterly non-negotiable'} — connected to ${HOUSE_LIFE[compH]?.area || 'the most private, protected dimension of your existence'}. `;
    }
    if (vesta.house === 6 || vesta.house === 10) {
      r += `\n\n**Here is what I predict:** Your work becomes sacred ground this year. Not in the way workaholism numbs you — in the way that a master craftsperson falls so deeply in love with their work that the quality of what they produce becomes a form of prayer. You will pour yourself into something professional with a level of care and precision that makes the result undeniable. People will notice. Opportunities will follow. And you will realize that this was never about productivity — it was about devotion.`;
    } else if (vesta.house === 1) {
      r += `\n\n**Here is what I predict:** You will turn the full force of your devotion inward this year — your body, your habits, your identity, the version of yourself you present to the world. You are refining yourself with the precision of a sculptor who can see the finished form inside the marble. The discipline will be intense. The results will be visible to everyone. By the end of this year, the person you have become will be unrecognizable to the person you were twelve months ago — and that is exactly the point.`;
    } else if (vesta.house === 5) {
      r += `\n\n**Here is what I predict:** A creative project consumes you this year with the intensity of a love affair. You will produce something that carries a piece of your soul so unmistakably that showing it to the world will feel like confessing a secret. This level of creative fire does something to your magnetism — when you are this devoted to your own expression, you become almost impossibly attractive to the kind of people who are drawn to authenticity over polish.`;
    } else if (vesta.house === 9) {
      r += `\n\n**Here is what I predict:** A pursuit of meaning takes over your life this year — a course of study, a spiritual practice, a body of writing, a philosophical framework that rewires how you see everything. This is not casual intellectual curiosity. This is a calling that shows up wearing the disguise of an interest and reveals itself as the thing you were always meant to do.`;
    } else if (vesta.house === 12) {
      r += `\n\n**Here is what I predict:** Your inner work becomes the most important work you do this year. Meditation, therapy, journaling, long silences, prayer — whatever form your practice takes, it moves from the margins to the center of your life. You will need more solitude than usual, and that is not isolation or depression. It is the monk in you coming forward to tend the flame that only burns in stillness.`;
    } else {
      r += `\n\n**Here is what I predict:** Something will catch fire in you this year — a focus, a calling, a purpose that arrives with such clarity that second-guessing it will feel absurd. You will feel it in your chest before you can name it. When it comes, do not negotiate with it. Do not dilute it with other obligations. Follow the flame. It knows exactly where it is taking you.`;
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

  r += `${year} is not a year that happens to you. It is a year that happens because of you — because of decisions you make, thresholds you cross, and truths you finally stop running from. `;
  if (unique.length > 0) {
    r += `The forces shaping your life are concentrated around **${unique.join('**, **')}** — and these are not separate storylines. They are threads of the same fabric, pulling on each other in ways that will only become clear as you live them. `;
  }

  r += `\n\nThe hidden layers beneath each placement reveal something important: this year is far more complex than any single prediction can capture. What you think you want and what your chart says you actually need are not always the same thing — and the gap between them is not a problem to solve. It is the space where real transformation lives. `;

  r += `\n\nI will tell you this without hedging: **there are at least two moments coming this year that will feel like the hinge the entire year swings on.** You will recognize them not by their drama, but by the way time seems to slow down, the way your body knows something is happening before your mind catches up. When those moments arrive, choose the path that frightens you. Choose the option that asks more of you. That is almost always the one your chart has been pointing you toward since the day you were born. `;

  r += `\n\nThis is your year, ${name}. Not a practice run. Not a holding pattern. Not preparation for something that comes later. This is the year that future-you will point back to and say: that is when everything changed. Move like you believe it.\n`;

  return r;
}
