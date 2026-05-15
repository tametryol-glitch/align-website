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

// ═══════════════════════════════════════════════════════════════════════════
// NEW: Year Theme Headlines, Aspect Interps, Angle Interps, Retrogrades,
//      Monthly Timeline, Natal Comparison — shared by web + mobile
// ═══════════════════════════════════════════════════════════════════════════

// -- Year Theme (based on Sun house) --------

export const YEAR_THEME_HEADLINES: Record<number, { headline: string; emoji: string; keyword: string; description: string }> = {
  1:  { headline: 'The year you reinvent yourself', emoji: '🔥', keyword: 'Identity', description: 'This is a 1st House year — your identity, appearance, and the way the world perceives you are being completely rewritten. You emerge from this year as someone visibly, undeniably different.' },
  2:  { headline: 'The year your worth is redefined', emoji: '💎', keyword: 'Resources', description: 'This is a 2nd House year — your relationship with money, possessions, and self-worth undergoes a fundamental shift. What you earn and what you believe you deserve are no longer the same number.' },
  3:  { headline: 'The year a conversation changes everything', emoji: '💬', keyword: 'Communication', description: 'This is a 3rd House year — your mind is on fire. A conversation, a message, or an idea arrives that splits your timeline into before and after. Siblings and neighbors play pivotal roles.' },
  4:  { headline: 'The year you rebuild your foundation', emoji: '🏠', keyword: 'Home & Roots', description: 'This is a 4th House year — home, family, and your deepest emotional roots are the center of everything. A move, a family reckoning, or an inner excavation changes what "home" means to you permanently.' },
  5:  { headline: 'The year love and creativity ignite', emoji: '🎨', keyword: 'Creative Fire', description: 'This is a 5th House year — romance, creative expression, children, and joy demand your attention. Something or someone makes you feel more alive than you have in years. Create boldly.' },
  6:  { headline: 'The year you master the details', emoji: '⚙️', keyword: 'Health & Work', description: 'This is a 6th House year — your health, daily routines, and work life are being rebuilt from the ground up. The small daily choices you make this year compound into something that reshapes your entire reality.' },
  7:  { headline: 'The year someone defines your path', emoji: '💞', keyword: 'Partnerships', description: 'This is a 7th House year — there is a person at the center of this year. A partnership begins, deepens, or reaches its moment of truth. Your life is defined by who you choose to stand next to.' },
  8:  { headline: 'The year of death and rebirth', emoji: '🦋', keyword: 'Transformation', description: 'This is an 8th House year — something dies so something truer can live. Shared finances, intimacy, psychological depth, and power dynamics are the territory. You will weigh less inside by December.' },
  9:  { headline: 'The year the horizon calls you', emoji: '🌍', keyword: 'Expansion', description: 'This is a 9th House year — travel, education, philosophy, and beliefs shape everything. Your entire framework for understanding the world is disassembled and rebuilt with more honest materials.' },
  10: { headline: 'The year the world learns your name', emoji: '👑', keyword: 'Career & Legacy', description: 'This is a 10th House year — your career, public reputation, and legacy take center stage. A promotion, pivot, or public moment puts you on a level you will still be talking about a decade from now.' },
  11: { headline: 'The year your dreams show their first signs', emoji: '⭐', keyword: 'Vision & Community', description: 'This is an 11th House year — your social world reshuffles, a community becomes central to your identity, and a dream you have quietly carried begins showing unmistakable signs of becoming real.' },
  12: { headline: 'The year of sacred solitude', emoji: '🔮', keyword: 'Inner World', description: 'This is a 12th House year — the most important things happen in silence. Spiritual growth, subconscious patterns, vivid dreams, and the invisible world beneath your waking life demand your attention.' },
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
    conjunction: 'Your identity and emotions are fused this year — what you want and what you feel are inseparable. Decisions come from a place of total alignment. You operate with unusual internal coherence, and people sense it.',
    opposition: 'There is a tug-of-war between what you want to become and what you need emotionally. A relationship or domestic situation pulls against your personal ambitions. The tension is productive if you stop trying to choose one side.',
    square: 'Internal friction drives this year. Your conscious goals and your emotional needs are at cross-purposes, creating restlessness that forces growth. The discomfort is the catalyst — do not medicate it away.',
    trine: 'Ease flows between your identity and your emotional life. What you want and what you need are naturally aligned. Opportunities arrive without force. The danger is complacency — this harmony is a platform, not a destination.',
    sextile: 'Gentle opportunities arise to align your inner world with your outer goals. Small adjustments in how you express yourself emotionally unlock disproportionate results in your public life.',
  },
  'Sun-Saturn': {
    conjunction: 'This is a year of serious reckoning. Responsibilities land on your shoulders that cannot be delegated. The weight is real — but so is the authority you earn by carrying it. By December, you will have aged in wisdom, not just years.',
    opposition: 'An authority figure or institution stands directly in your path. A boss, a parent, a system — something external demands that you prove yourself. The test is real. Pass it, and the respect you earn is permanent.',
    square: 'Frustration meets ambition head-on. Every step forward feels like pushing through concrete. Delays, denials, and limitations are not punishments — they are the resistance that builds the muscle you will need for what comes next.',
  },
  'Sun-Pluto': {
    conjunction: 'Power and identity merge. You are being forged in fire this year — a complete psychological overhaul that strips away everything that is not authentically you. People will feel the intensity radiating off you. Some will be drawn closer. Others will back away. Both reactions are correct.',
    opposition: 'A power struggle defines this year. Someone or something challenges your authority, your identity, or your right to be who you are becoming. The confrontation is not optional. What you discover about yourself in the clash is permanent.',
    square: 'Transformation comes through crisis. A situation forces you to face something you have been avoiding — a truth about yourself, a dynamic in a relationship, a pattern you have been running on autopilot. The breakdown is the breakthrough.',
  },
  'Sun-Jupiter': {
    conjunction: 'Expansion and confidence surge through your identity. This is one of the luckiest placements in a solar return — doors open, optimism is justified, and the risks you take land. The only danger is overextension. Stay grounded while you grow.',
    trine: 'Growth comes naturally this year. Opportunities align with your sense of purpose, and the expansion feels organic rather than forced. Travel, education, or a philosophical shift broadens your world in exactly the way you needed.',
    opposition: 'Others bring the growth. A partner, a mentor, or an opportunity from someone else expands your world — but you may need to check whether the growth is truly yours or borrowed confidence.',
  },
  'Sun-Uranus': {
    conjunction: 'You are the lightning bolt this year. Sudden changes in identity, appearance, or life direction arrive without warning. You may shock people who thought they knew you. The old version of you is being released — the new one does not apologize.',
    opposition: 'Someone else introduces the disruption. A relationship brings sudden change, or a partner does something that forces you to reconsider who you are. Freedom versus commitment is the central tension.',
    square: 'Restlessness reaches a breaking point. Something in your life that has been stable suddenly feels like a cage. The urge to break free is overwhelming — and at least one area of your life will look completely different by year end.',
  },
  'Moon-Saturn': {
    conjunction: 'Emotional maturity is demanded this year. Loneliness, responsibility, or a family obligation forces you to grow up emotionally in ways you cannot fake. The heaviness is real — but so is the emotional strength you build.',
    opposition: 'Your emotional needs and your responsibilities are in direct conflict. Work demands one thing; your heart demands another. Finding balance requires you to stop treating your feelings as less important than your duties.',
    square: 'Emotional restriction creates pressure. You feel held back, unsupported, or unable to express what you truly feel. The frustration is pointing you toward the exact emotional pattern that needs to be outgrown.',
  },
  'Moon-Pluto': {
    conjunction: 'Emotional intensity reaches volcanic levels. Feelings you have buried surface with force. A relationship reaches a depth that permanently alters your emotional operating system. Nothing stays on the surface this year.',
    opposition: 'Someone else triggers a deep emotional transformation. A partner, a family member, or an intimate connection brings buried feelings to light — whether you invited them or not.',
    square: 'Emotional power struggles dominate. Control, jealousy, obsession, or fear of vulnerability create friction that forces you to examine patterns you have been running since childhood.',
  },
  'Venus-Mars': {
    conjunction: 'Desire and attraction are supercharged. Your magnetism is palpable this year — romantic encounters carry unusual intensity, and creative projects burn with passion. What you want and how you pursue it are perfectly fused.',
    opposition: 'The push-pull between what you desire and how you go after it creates electric tension in relationships. Attraction and conflict are braided together. The passion is undeniable — learning to channel it is the work.',
    square: 'Frustrated desire drives this year. What you want in love and what you are willing to fight for are out of alignment. The tension creates urgency — and some of the most creatively productive energy available.',
  },
  'Venus-Saturn': {
    conjunction: 'Love gets serious. A relationship solidifies into something permanent, or you realize that what you have been settling for is not enough. Commitment, maturity, and honest assessment of what you truly value define your romantic year.',
    opposition: 'A partner demands more structure, commitment, or maturity than you feel ready to give — or you demand it from them. The relationship either levels up or its limitations become impossible to ignore.',
    square: 'Loneliness, rejection, or financial restriction forces you to confront what you actually value versus what you have been performing. The most important love lesson of the year comes through discomfort.',
  },
  'Venus-Pluto': {
    conjunction: 'Love becomes obsession. An attraction arrives with an intensity that bypasses every rational defense you have. A relationship transforms at the deepest level — or ends in a way that transforms you. There is no casual love this year.',
    opposition: 'Someone else brings the obsessive intensity. A partner reveals hidden depths — or hidden agendas. The power dynamics in your closest relationship undergo a complete restructuring.',
    square: 'Jealousy, possessiveness, or buried desires create volcanic pressure in relationships. The crisis strips away pretense and forces both people to show who they really are.',
  },
  'Mars-Saturn': {
    conjunction: 'Disciplined action produces lasting results. Your energy is focused, controlled, and strategic. Progress is slow but permanent. Every shortcut is blocked — and every breakthrough is earned.',
    opposition: 'Your drive meets an immovable obstacle. A system, a person, or a circumstance says no — and you must decide whether to fight harder or redirect. The answer is usually: redirect with more precision.',
    square: 'Frustration and blocked energy create explosive pressure. Anger, delays, and physical tension demand an outlet. The key is controlled release — exercise, structured projects, strategic patience.',
  },
  'Jupiter-Saturn': {
    conjunction: 'Expansion and contraction meet at the exact same point. A major life structure — career, relationship, belief system — simultaneously grows and is tested. What survives this year is built to last decades.',
    opposition: 'Optimism and caution pull in opposite directions. A risk that feels right is met with practical objections. The balance point — not too bold, not too cautious — is the year\'s central lesson.',
    square: 'Growth is frustrated by limitations. Every time you try to expand, a wall appears. The walls are not obstacles — they are guardrails. The expansion that happens within them is the real one.',
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
    Sun: 'Your identity IS the year. You are impossible to ignore — visible, radiant, and operating with a level of personal authority that changes the dynamic of every room you enter. This is a year where people see you, and what they see matters.',
    Moon: 'Your emotions are written on your face this year. Vulnerability becomes your superpower. People respond to you with unusual tenderness because your unguarded presence gives them permission to drop their own masks.',
    Mercury: 'Your words define your year. You become the communicator, the messenger, the person whose ideas land with unusual precision. A conversation or piece of writing becomes your calling card.',
    Venus: 'You are magnetic this year — physically, socially, aesthetically. People are drawn to you. A new look, a new style, a new way of presenting yourself to the world opens doors that were previously invisible.',
    Mars: 'You are on fire this year. Your energy, your drive, your willingness to fight for what you want is visible from across the room. This is a year of bold action, physical vitality, and refusing to wait for permission.',
    Jupiter: 'Everything about you is bigger this year — your presence, your optimism, your ability to attract opportunity. You walk into rooms and people sense that you are going somewhere. Growth is not just internal — it is visible.',
    Saturn: 'You carry weight this year — responsibility, authority, and the kind of gravitas that only comes from someone who has earned their position. People take you seriously because you have stopped pretending to be lighter than you are.',
    Uranus: 'You shock people this year. Your appearance, your behavior, your decisions — something about you is wildly, refreshingly, perhaps uncomfortably different. The old version of you is gone. The new one does not explain itself.',
    Neptune: 'You carry an ethereal quality this year — dreamy, artistic, almost otherworldly. People project their fantasies onto you. The gift is inspiration; the danger is that no one sees the real you beneath the shimmer.',
    Pluto: 'Your presence is transformative this year. People feel changed by encountering you — drawn in by an intensity that is both compelling and slightly intimidating. You operate with a level of psychological depth that makes casual interaction almost impossible.',
  },
  Midheaven: {
    Sun: 'Your career reaches its peak moment. A professional achievement, public recognition, or leadership role puts you in the spotlight. This is not subtle — the world is watching, and what you do this year defines your professional reputation for years.',
    Moon: 'Your public life and your emotional needs merge. A career move is driven by feeling rather than strategy — and it turns out to be exactly right. The public sees your heart this year, and it earns their trust.',
    Mercury: 'Your professional reputation is built on your ideas this year. A presentation, a proposal, a published piece, or a strategic insight elevates your standing. Your mind is your most valuable career asset.',
    Venus: 'Your career benefits from charm, aesthetics, and relationships. A professional connection becomes personally meaningful, or your creative work gains public recognition. Beauty and diplomacy are your professional tools.',
    Mars: 'Ambition takes the driver\'s seat. You pursue professional goals with a ferocity that surprises even you. Competition, conflict with authority, or a bold career move defines your public year. You will not be ignored.',
    Jupiter: 'Professional expansion and recognition arrive with unusual ease. A promotion, a new role, an international opportunity, or public acclaim opens a chapter that feels destined. This is one of the most career-fortunate placements possible.',
    Saturn: 'Professional responsibility intensifies. A position of authority arrives with heavy expectations. The work is demanding, the scrutiny is real, and the respect you earn is permanent. This year builds your legacy.',
    Uranus: 'A sudden career change — unexpected, unplanned, and ultimately liberating. Your professional path takes a sharp turn toward something that feels more authentically you, even if it confuses everyone who knew your old trajectory.',
    Neptune: 'Your professional life takes on a spiritual or creative dimension. A career in the arts, healing, or service work feels aligned. The risk: confusion about your professional direction. Trust the vision, but verify the details.',
    Pluto: 'A power shift in your career — either you rise to a position of significant influence, or a professional crisis forces a complete reinvention. The old career identity dies. What replaces it carries genuine authority.',
  },
  Descendant: {
    Sun: 'A relationship IS the story this year. A partner takes center stage in your life — their needs, their presence, their impact on your identity are impossible to separate from your own evolution.',
    Moon: 'Emotional intimacy with a partner reaches its deepest level. A relationship becomes your emotional anchor — or its absence becomes the ache that drives every other decision you make.',
    Venus: 'Love arrives at your doorstep. A partnership begins or deepens with grace, attraction, and genuine reciprocity. If you are already partnered, the relationship enters its most beautiful chapter.',
    Mars: 'A relationship brings conflict, passion, or both. A partner challenges you in ways that are uncomfortable and necessary. The friction is not a sign that something is wrong — it is a sign that something real is happening.',
    Saturn: 'A relationship demands maturity. A commitment is tested, formalized, or ended with the sober clarity of two people who finally see each other clearly. What remains after this year is unshakeable.',
    Pluto: 'A relationship transforms you at the cellular level. Intimacy reaches a depth that permanently rewires how you attach, trust, and give yourself to another person. Nothing about this bond is casual.',
  },
  IC: {
    Sun: 'Your private life, your home, and your inner world are the true center of this year — regardless of what your public life looks like. The most important growth happens behind closed doors.',
    Moon: 'Home becomes your sanctuary. A family matter, a move, or a deep emotional process rooted in your childhood becomes the engine of your year. Safety and belonging are not luxuries — they are necessities.',
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
  return ANGLE_PLANET_INTERPS[normalizedAngle]?.[planet] || `${planet} conjunct the ${normalizedAngle} amplifies ${planet} themes in the most visible and personally defining way possible this year.`;
}

// -- Retrograde Detection & Meanings --------

export const RETROGRADE_SR_MEANINGS: Record<string, string> = {
  Mercury: 'Mercury retrograde in your solar return signals a year of reconsidering, revising, and revisiting past decisions. Communication requires extra care — misunderstandings are likely, but so are brilliant insights that only come from looking backward. Old contacts reappear with unfinished business.',
  Venus: 'Venus retrograde in the solar return is one of the most significant love indicators of the year. Past relationships resurface — an ex, an old flame, or unresolved feelings demand attention. Your values around love and money are being internally audited. What you thought you wanted may not be what you actually need.',
  Mars: 'Mars retrograde in your solar return means your energy operates differently this year — more internal, more strategic, less impulsive. Anger that has been swallowed may surface unexpectedly. Projects require patience and multiple attempts. The wins come through persistence, not speed.',
  Jupiter: 'Jupiter retrograde turns growth inward. External expansion slows, but internal wisdom accelerates. The luck this year comes from revisiting opportunities you previously overlooked, not from new ones appearing.',
  Saturn: 'Saturn retrograde in the solar return means the year\'s lessons are deeply personal and internally driven. The discipline required is not imposed from outside — it comes from your own recognition that a structure in your life needs to be rebuilt from the foundation.',
  Uranus: 'Uranus retrograde internalizes the revolution. Changes feel more psychological than external. A shift in consciousness precedes any visible life changes. You are being rewired from the inside out.',
  Neptune: 'Neptune retrograde sharpens spiritual discernment. Illusions you have been carrying are quietly dissolved by an inner knowing that refuses to be fooled any longer. Dreams become more meaningful and less escapist.',
  Pluto: 'Pluto retrograde deepens the transformation. The power dynamics you confront this year are internal — your own shadow, your own compulsions, your own unconscious patterns. The real power struggle is with yourself.',
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
  Sun: (ns, ss) => `Your natal Sun in ${ns} is your permanent identity — who you are at your core. But this year, your solar return Sun in ${ss} overlays a completely different energy onto that core. You will express yourself through ${ss} themes even though your essential nature remains ${ns}. The contrast between these two energies is where the year's growth lives.`,
  Moon: (ns, ss) => `Your natal Moon in ${ns} is how you process emotions at the deepest level — it never changes. But this year, the solar return Moon in ${ss} means your emotional needs shift dramatically. What made you feel safe last year will not be enough. You need ${ss}-style nurturing now: different rhythms, different comforts, different people who understand what has changed.`,
  Venus: (ns, ss) => `Your natal Venus in ${ns} is your permanent love language — how you attract and what you value. This year, with solar return Venus in ${ss}, your taste changes. What you find beautiful, who you find attractive, and what you spend money on will surprise the people who think they know you. Let the shift happen — it is teaching you something about desire you did not know you needed to learn.`,
  Mars: (ns, ss) => `Your natal Mars in ${ns} is how you fight, chase, and assert yourself — your permanent engine. This year, solar return Mars in ${ss} rewires your drive. Your aggression takes a different form. Your ambition points in a different direction. The things that used to fire you up may leave you cold, while something unexpected lights the match.`,
  Mercury: (ns, ss) => `Your natal Mercury in ${ns} is how your mind naturally works. This year, solar return Mercury in ${ss} means you think differently — your communication style shifts, your interests change, the conversations that grab you are not the ones you expected. Pay attention to what captures your mind; it is pointing toward the year's most important insights.`,
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
        ? `Your ${name} moves from natal ${natal.sign} to solar return ${sr.sign} — the energy you express through ${name} themes takes on a completely different quality this year.`
        : `Your ${name} stays in ${natal.sign} in both your natal and solar return charts — this area of life operates with familiar energy this year, reinforcing and deepening patterns you already know.`;
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
  1: 'Self-expression and personal visibility',
  2: 'Financial decisions and value shifts',
  3: 'Important communications and learning',
  4: 'Home and family developments',
  5: 'Romance, creativity, and joy',
  6: 'Health, work, and daily routines',
  7: 'Partnership dynamics and commitments',
  8: 'Deep transformation and shared resources',
  9: 'Travel, education, and belief shifts',
  10: 'Career moves and public recognition',
  11: 'Community, friendship, and future vision',
  12: 'Inner work, spirituality, and release',
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
      desc.push(`Your solar return activates. The themes of this entire year announce themselves in the first few weeks — pay attention to what shows up in ${MONTH_NAMES[monthIdx]}, because it is a preview of the entire year.`);
    }
    if (i === 3) {
      themes.push('First quarter activation');
      intensity = Math.max(intensity, 3);
      if (mars) {
        keyPlanet = 'Mars';
        desc.push(`Mars themes intensify. The drive and ambition you set in motion at the start of your solar year faces its first real test. Conflicts that have been simmering may surface.`);
      }
    }
    if (i === 6) {
      themes.push('Midpoint of solar year');
      intensity = Math.max(intensity, 4);
      if (saturn) {
        keyPlanet = 'Saturn';
        desc.push(`The halfway point of your solar return year. Saturn\'s lessons are fully engaged. What you committed to six months ago is now being tested — are you still in? The answer matters.`);
      }
    }
    if (i === 9) {
      themes.push('Third quarter — harvest or redirect');
      intensity = Math.max(intensity, 3);
      if (jupiter) {
        keyPlanet = 'Jupiter';
        desc.push(`Jupiter\'s growth cycle reaches its harvest phase. The seeds you planted are showing results — or showing you that a different approach is needed. Course-correct now or double down.`);
      }
    }
    if (i === 11) {
      themes.push('Solar year closing');
      intensity = Math.max(intensity, 3);
      desc.push(`The final month before your next solar return. Themes that defined this year are reaching resolution. What you carry forward and what you release here shapes the next twelve months.`);
    }

    // Moon emphasis (emotional peaks at months 1, 4, 7, 10)
    if (moon && (i === 1 || i === 4 || i === 7 || i === 10)) {
      const mh = moon.house || 0;
      themes.push(HOUSE_MONTH_THEMES[mh] || 'Emotional shifts');
      intensity = Math.max(intensity, 3);
      keyPlanet = 'Moon';
      desc.push(`Emotional currents run high. Moon in the ${mh ? mh + ordinalSuffix(mh) : ''} house brings feelings about ${HOUSE_MONTH_THEMES[mh] || 'core life themes'} to the surface.`);
    }

    // Venus peak (months 2, 5)
    if (venus && (i === 2 || i === 5)) {
      themes.push('Love and finances in focus');
      intensity = Math.max(intensity, 3);
      keyPlanet = 'Venus';
      desc.push(`Venus themes peak. Relationships, attraction, and financial matters demand attention. What you value — and who values you — becomes unmistakably clear.`);
    }

    // Hard aspect activation (month 3, 8)
    if (hasHardAspects && (i === 3 || i === 8)) {
      themes.push('Tension and growth');
      intensity = Math.max(intensity, 4);
      desc.push(`Hard aspects in your solar return chart activate with force. The friction you feel is not random — it is the specific pressure point where this year\'s most important growth happens.`);
    }

    if (desc.length === 0) {
      const sunH = sun?.house || 1;
      themes.push(HOUSE_MONTH_THEMES[sunH] || 'Core year themes active');
      desc.push(`The underlying themes of your ${sunH ? sunH + ordinalSuffix(sunH) : ''} house year continue their steady work. Progress may feel invisible, but the foundation is being built.`);
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

function ordinalSuffix(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

// -- Multi-Year Pattern --------

export interface YearPattern {
  lastYear: { house: number; theme: string };
  thisYear: { house: number; theme: string };
  nextYear?: { house: number; theme: string };
  narrative: string;
}

const YEAR_FLOW_NARRATIVES: Record<string, string> = {
  '12-1': 'Last year was a 12th house year — a period of endings, withdrawal, and deep inner processing. This year, you emerge. The 1st house year that follows a 12th house year is one of the most powerful identity rebirths in astrology. Everything you dissolved last year makes space for who you are becoming now.',
  '1-2': 'Last year rewrote your identity. This year, you give that new identity material form — through money, possessions, and a completely recalibrated sense of your own worth.',
  '4-5': 'Last year was about roots, home, and emotional foundations. This year, that inner stability releases you to play, create, and love with a freedom that was not available before.',
  '5-6': 'Last year lit you up with creativity and romance. This year asks you to ground that fire — to build the daily habits, the health practices, and the work discipline that sustain what inspiration started.',
  '6-7': 'Last year rebuilt your routines and your relationship with your own body. This year, the focus shifts to the person standing across from you — partnerships, commitments, and the mirror only another person can hold.',
  '7-8': 'Last year was about partnership. This year deepens it — shared resources, intimacy, and the psychological depths that only true closeness can access.',
  '9-10': 'Last year expanded your mind through travel, education, or philosophy. This year, that expanded perspective finds its public expression — career, reputation, and the legacy you are building.',
  '10-11': 'Last year was about professional achievement. This year, the focus shifts to the community that your work serves — friends, groups, and the dreams that connect your personal success to something larger.',
  '11-12': 'Last year connected you to community and future vision. This year, you withdraw — not from failure, but from fullness. The inner world needs processing time. What you integrate in silence this year will fuel the reinvention that comes next.',
};

export function getYearPattern(lastYearSunHouse: number, thisYearSunHouse: number, nextYearSunHouse?: number): YearPattern {
  const key = `${lastYearSunHouse}-${thisYearSunHouse}`;
  const narrative = YEAR_FLOW_NARRATIVES[key] ||
    `Last year was a ${lastYearSunHouse}${ordinalSuffix(lastYearSunHouse)} house year focused on ${HOUSE_MONTH_THEMES[lastYearSunHouse] || 'key themes'}. This year shifts to a ${thisYearSunHouse}${ordinalSuffix(thisYearSunHouse)} house year — the energy moves to ${HOUSE_MONTH_THEMES[thisYearSunHouse] || 'new territory'}. Notice how last year\'s work created the platform for what is emerging now.`;

  return {
    lastYear: { house: lastYearSunHouse, theme: YEAR_THEME_HEADLINES[lastYearSunHouse]?.headline || '' },
    thisYear: { house: thisYearSunHouse, theme: YEAR_THEME_HEADLINES[thisYearSunHouse]?.headline || '' },
    nextYear: nextYearSunHouse ? { house: nextYearSunHouse, theme: YEAR_THEME_HEADLINES[nextYearSunHouse]?.headline || '' } : undefined,
    narrative,
  };
}
