import { DREAM_SYMBOLS, getSymbol } from './dreamDictionary';
import type { DreamInterpretation, DreamAstrologyContext } from './dreamService';

interface DreamInput {
  description: string;
  emotions: string[];
  people: string[];
  places: string[];
  symbols: string[];
  dreamType: string;
  intensityScore: number;
}

// ── Variation pools to avoid repetitive language ───────────────────

const SURFACE_OPENERS = [
  'In this dream, your subconscious is staging a scene:',
  'The surface narrative of this dream reveals:',
  'On the face of it, this dream tells a story:',
  'Your dreaming mind has constructed a specific scenario:',
  'The dream\'s outer layer presents this:',
  'At first glance, the dream shows you this:',
];

const EMOTIONAL_OPENERS = [
  'Beneath the imagery, your emotional body is processing something significant.',
  'The emotional core of this dream runs deeper than the story.',
  'Your feelings in this dream are the real message — the images are just the container.',
  'The emotions you felt are not random — they are the dream\'s true language.',
  'Pay attention to what you felt, not just what you saw — that is where the meaning lives.',
];

const HIDDEN_OPENERS = [
  'What this dream is really saying, beneath every symbol and scene:',
  'The message your subconscious is trying to deliver:',
  'Strip away the imagery, and the dream is telling you this:',
  'If this dream could speak in plain language, it would say:',
  'The hidden truth underneath every layer of this dream:',
];

const SHADOW_OPENERS = [
  'The shadow side of this dream — what you may not want to hear:',
  'There is a harder truth in this dream, and it needs to be named:',
  'The part of this dream you might resist:',
  'Your shadow is speaking through this dream, and it says:',
  'The uncomfortable truth buried in this dream:',
];

const SPIRITUAL_OPENERS = [
  'On a soul level, this dream is an initiation.',
  'Spiritually, this dream is not casual — it carries weight.',
  'Your soul is using this dream to communicate something sacred.',
  'From a spiritual perspective, this dream is a doorway.',
  'The spiritual dimension of this dream should not be ignored.',
];

const PSYCH_OPENERS = [
  'Psychologically, this dream reveals an active process in your inner world.',
  'From a depth-psychology perspective, your psyche is working through something.',
  'Jung would say this dream is compensating for something missing in your waking consciousness.',
  'Your inner architecture is shifting — this dream is evidence of that process.',
  'The psychological meaning of this dream points to an integration happening beneath the surface.',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Symbol matching ────────────────────────────────────────────────

function matchSymbols(description: string, userSymbols: string[]): { symbol: string; meaning: string }[] {
  const text = description.toLowerCase();
  const matched = new Map<string, string>();

  for (const s of userSymbols) {
    const entry = getSymbol(s);
    if (entry) {
      matched.set(entry.name, entry.general);
    }
  }

  for (const entry of DREAM_SYMBOLS) {
    if (matched.has(entry.name)) continue;
    if (text.includes(entry.key.replace('_', ' ')) || text.includes(entry.name.toLowerCase())) {
      matched.set(entry.name, entry.general);
    }
  }

  return Array.from(matched.entries())
    .slice(0, 8)
    .map(([symbol, meaning]) => ({ symbol, meaning }));
}

// ── Emotional texture ──────────────────────────────────────────────

function buildEmotionalMeaning(emotions: string[], dreamType: string, intensity: number): string {
  const opener = pick(EMOTIONAL_OPENERS);

  if (emotions.length === 0) {
    return `${opener} Even though you did not name a specific emotion, the fact that you remembered this dream means it carried an emotional charge. Dreams that linger have something unresolved at their center.`;
  }

  const primary = emotions[0];
  const secondary = emotions.length > 1 ? emotions.slice(1).join(', ') : null;
  const intensityWord = intensity >= 8 ? 'overwhelming' : intensity >= 6 ? 'significant' : intensity >= 4 ? 'moderate' : 'subtle';

  let core = `${opener} The dominant emotion — ${primary} — is the dream's heartbeat. `;

  if (secondary) {
    core += `Layered with ${secondary}, this creates a complex emotional texture that your waking mind may be struggling to hold simultaneously. `;
  }

  core += `The ${intensityWord} intensity of this dream (${intensity}/10) suggests `;
  if (intensity >= 8) {
    core += 'your psyche considers this an urgent message. High-intensity dreams demand attention — they are the unconscious raising its voice because something has been ignored too long.';
  } else if (intensity >= 5) {
    core += 'this is an active processing dream — your inner world is working through something that matters, even if it does not feel like a crisis.';
  } else {
    core += 'this is a quieter communication from your depths — a whisper rather than a shout, but no less meaningful.';
  }

  if (dreamType === 'nightmare') {
    core += ' Nightmares are not punishments — they are alarms. Your psyche is flagging something that needs immediate conscious attention.';
  } else if (dreamType === 'lucid') {
    core += ' The fact that you achieved lucidity suggests your consciousness is expanding — you are developing the ability to witness your own depths without being consumed by them.';
  } else if (dreamType === 'recurring') {
    core += ' Recurring dreams are the unconscious\'s way of saying: "You have not heard me yet." The pattern will repeat until the lesson is integrated.';
  } else if (dreamType === 'prophetic') {
    core += ' Dreams that feel prophetic often tap into pattern recognition your conscious mind has not caught up with — your intuition is reading the trajectory of events before your logic can.';
  }

  return core;
}

// ── Spiritual meaning ──────────────────────────────────────────────

function buildSpiritualMeaning(symbols: { symbol: string; meaning: string }[], dreamType: string, emotions: string[]): string {
  const opener = pick(SPIRITUAL_OPENERS);
  let body = opener + ' ';

  if (symbols.length > 0) {
    const symbolNames = symbols.slice(0, 3).map(s => s.symbol).join(', ');
    body += `The presence of ${symbolNames} in your dream creates a symbolic constellation that many spiritual traditions would recognize. `;
  }

  if (dreamType === 'spiritual') {
    body += 'This dream has the quality of a spiritual experience — not just a dream about spiritual things, but a dream that IS spiritual. Honor it as such. ';
  } else if (dreamType === 'visitation') {
    body += 'Visitation dreams carry a different quality — they are vivid, emotionally clear, and often feel more real than waking life. If this dream felt like a genuine encounter, trust that feeling. ';
  }

  body += 'Your soul is not passive when you sleep. It is working, healing, connecting to sources of wisdom that the rational mind cannot access during the day. This dream is evidence of that inner work.';

  if (emotions.includes('awe') || emotions.includes('bliss') || emotions.includes('peace')) {
    body += ' The emotional quality of this dream — the sense of awe or peace — is itself the message. Sometimes the feeling IS the teaching.';
  }

  return body;
}

// ── Psychological meaning ──────────────────────────────────────────

function buildPsychologicalMeaning(description: string, emotions: string[], people: string[], dreamType: string): string {
  const opener = pick(PSYCH_OPENERS);
  let body = opener + ' ';

  if (people.length > 0) {
    body += `The people in your dream — ${people.slice(0, 3).join(', ')} — are not simply themselves. In dream psychology, every person represents an aspect of your own psyche, a quality you project onto them, or an unresolved dynamic between you. `;
  }

  if (emotions.includes('fear') || emotions.includes('anxiety') || emotions.includes('dread')) {
    body += 'The fear or anxiety in this dream signals that your psyche is processing a perceived threat — not necessarily a physical one, but a threat to your identity, security, or sense of control. ';
  }

  if (emotions.includes('anger')) {
    body += 'Anger in dreams often represents boundaries that have been violated or needs that have been ignored. Your psyche is asserting itself. ';
  }

  if (dreamType === 'nightmare') {
    body += 'From a psychological perspective, nightmares serve a vital function — they force confrontation with material the ego has been avoiding. The distress is not the problem; the avoidance was. ';
  }

  body += 'Your unconscious mind does not dream randomly. Every element was chosen — by a part of you that knows more than your waking mind admits — to communicate something specific about where you are psychologically right now.';

  return body;
}

// ── Why now ─────────────────────────────────────────────────────────

function buildWhyNow(emotions: string[], dreamType: string, intensity: number, astrology: DreamAstrologyContext | null): string {
  let body = 'You dreamed this now because something in your waking life has reached a threshold. ';

  if (intensity >= 8) {
    body += 'The high intensity suggests that whatever triggered this dream is not new — it has been building, and your psyche has decided it can no longer wait. ';
  }

  if (dreamType === 'recurring') {
    body += 'The fact that this is a recurring dream means the message has been trying to reach you for some time. Each recurrence increases urgency — your unconscious is escalating because the lesson remains unlearned. ';
  }

  if (astrology) {
    if (astrology.currentMoonPhase) {
      body += `You dreamed this during a ${astrology.currentMoonPhase} — `;
      if (astrology.currentMoonPhase.toLowerCase().includes('full')) {
        body += 'full moons amplify emotional intensity and bring hidden material to the surface. Dreams during full moons are often more vivid and symbolically dense. ';
      } else if (astrology.currentMoonPhase.toLowerCase().includes('new')) {
        body += 'new moons are seeds — this dream may contain the embryo of something that will unfold over the coming weeks. ';
      }
    }
    if (astrology.activeTransits && astrology.activeTransits.length > 0) {
      body += `Current transits (${astrology.activeTransits.slice(0, 3).join('; ')}) are activating parts of your chart connected to the themes in this dream. The sky and your dreams are speaking the same language right now. `;
    }
    if (astrology.natalMoonSign) {
      body += `With your natal Moon in ${astrology.natalMoonSign}, your emotional processing style naturally gravitates toward these themes. `;
    }
  } else {
    body += 'When your astrology data is connected, this section will show you exactly which planetary transits are activating the themes in your dream — revealing the cosmic timing behind your subconscious messages. ';
  }

  body += 'Trust the timing. Your dreams do not arrive early or late — they arrive exactly when you are ready to receive their message, even if you do not feel ready.';

  return body;
}

// ── Reflection questions ───────────────────────────────────────────

function buildReflectionQuestions(emotions: string[], symbols: string[], dreamType: string, people: string[]): string[] {
  const questions: string[] = [];

  questions.push('If this dream were a letter from your soul, what is the one sentence you most need to hear right now?');

  if (emotions.length > 0) {
    questions.push(`When was the last time you felt ${emotions[0]} this intensely while awake? What triggered it?`);
  }

  if (symbols.length > 0) {
    const sym = symbols[0];
    const entry = getSymbol(sym);
    if (entry) {
      questions.push(entry.reflection);
    } else {
      questions.push(`What does "${sym}" mean to you personally — not in general, but in your specific life right now?`);
    }
  }

  if (people.length > 0) {
    questions.push(`What quality does ${people[0]} represent to you? Is that quality something you need more of, or something you need to release?`);
  }

  if (dreamType === 'nightmare') {
    questions.push('What is the worst thing that could happen if the nightmare\'s scenario came true — and what is the worst thing that happens if you keep avoiding what it represents?');
  }

  if (dreamType === 'recurring') {
    questions.push('This dream keeps returning. What is the one thing you have been refusing to do, admit, or change that would make it stop?');
  }

  questions.push('Close your eyes and return to the dream. If you could say one thing to the dream, or ask it one question — what would it be?');

  if (questions.length < 4) {
    questions.push('What part of your current life does this dream most remind you of?');
    questions.push('If someone you trusted had this exact dream, what advice would you give them?');
  }

  return questions.slice(0, 5);
}

// ── Watch for / What to do ─────────────────────────────────────────

function buildWatchFor(emotions: string[], symbols: string[], dreamType: string): string {
  let body = 'In the coming days, pay attention to: ';
  const items: string[] = [];

  if (symbols.length > 0) {
    const sym = symbols.slice(0, 3).map(s => {
      const entry = getSymbol(s);
      return entry ? entry.name.toLowerCase() : s;
    }).join(', ');
    items.push(`real-world appearances of ${sym} — synchronicities are the waking world confirming what the dream revealed`);
  }

  if (emotions.includes('fear') || emotions.includes('anxiety')) {
    items.push('moments where the same fear or anxiety from the dream surfaces during the day — that is the bridge between your dream self and your waking self');
  }

  if (emotions.includes('love') || emotions.includes('bliss') || emotions.includes('peace')) {
    items.push('moments of unexpected peace or warmth — your dream may have opened a channel that continues to flow');
  }

  if (dreamType === 'prophetic') {
    items.push('events that echo the dream\'s scenario — write them down when they occur, even if the connection seems loose');
  }

  items.push('dreams tonight and tomorrow night — dreams often arrive in sequences, and the next dream may complete what this one started');

  return body + items.join('; ') + '.';
}

function buildWhatToDo(emotions: string[], dreamType: string, intensity: number): string {
  const actions: string[] = [];

  actions.push('Write this dream down in detail — the act of writing anchors the dream\'s message in your conscious mind and prevents it from dissolving');

  if (intensity >= 7) {
    actions.push('Sit with this dream for at least 5 minutes before checking your phone or starting your day — high-intensity dreams need breathing room');
  }

  if (emotions.includes('fear') || emotions.includes('anger') || emotions.includes('grief')) {
    actions.push('Allow yourself to feel what the dream brought up without judging it — the emotion is not the enemy, the avoidance of it is');
  }

  if (dreamType === 'lucid') {
    actions.push('Before sleeping tonight, set an intention to return to this dream — your lucid awareness gives you the ability to go deeper');
  }

  if (dreamType === 'visitation') {
    actions.push('Speak to the person who visited you — out loud, in a journal, or in your mind. Say what was left unsaid. Their visit opened a channel; use it');
  }

  actions.push('Return to the Dream Oracle before bed tonight and notice if the next dream continues this conversation');

  return actions.slice(0, 4).map((a, i) => `${i + 1}. ${a}`).join('\n\n');
}

// ── Main interpretation generator ──────────────────────────────────

export function generateDreamInterpretation(
  input: DreamInput,
  astrology: DreamAstrologyContext | null = null,
): DreamInterpretation {
  const symbols = matchSymbols(input.description, input.symbols);
  const desc = input.description.trim();
  const descShort = desc.length > 200 ? desc.slice(0, 200) + '...' : desc;

  const surfaceStory = `${pick(SURFACE_OPENERS)} ${descShort}\n\nThis is the conscious layer — the story your dreaming mind chose to tell. But the real message is encoded in the symbols, emotions, and people who populated this scene. Nothing in this dream is accidental.`;

  const emotionalMeaning = buildEmotionalMeaning(input.emotions, input.dreamType, input.intensityScore);

  const hiddenMessage = `${pick(HIDDEN_OPENERS)} ${
    input.emotions.length > 0
      ? `The ${input.emotions[0]} you felt is a compass pointing toward something in your waking life that carries the same emotional charge.`
      : 'Even without a named emotion, this dream is showing you something your conscious mind has been dancing around.'
  } ${
    input.people.length > 0
      ? `The presence of ${input.people.slice(0, 2).join(' and ')} is not random — they represent qualities or dynamics you are currently negotiating within yourself.`
      : 'The absence of other people in this dream suggests this is deeply personal — a conversation between you and you.'
  } This dream is asking you to look at what you have been avoiding, and to trust that you are strong enough to face it.`;

  const shadowMessage = `${pick(SHADOW_OPENERS)} ${
    input.dreamType === 'nightmare'
      ? 'This nightmare is not trying to hurt you — it is trying to wake you up. The terror is proportional to how long you have been ignoring what it represents.'
      : 'Every dream has a shadow — the interpretation you do not want to hear, the truth that makes you uncomfortable.'
  } ${
    input.intensityScore >= 7
      ? 'The intensity of this dream suggests the shadow material is close to the surface — it is pushing through because it can no longer be contained.'
      : 'The shadow here may be subtle, but it is present. Ask yourself: what is the least flattering interpretation of this dream? That is where the shadow lives.'
  } The shadow is not your enemy. It is the part of your truth that has been living in the dark — and it wants to come home.`;

  const spiritualMeaning = buildSpiritualMeaning(symbols, input.dreamType, input.emotions);

  const psychologicalMeaning = buildPsychologicalMeaning(input.description, input.emotions, input.people, input.dreamType);

  let astrologicalConnection: string;
  if (astrology && astrology.natalMoonSign) {
    const parts: string[] = [];
    parts.push(`Your natal Moon in ${astrology.natalMoonSign}${astrology.natalMoonHouse ? ` (${astrology.natalMoonHouse}th house)` : ''} shapes how you dream — it filters your unconscious through ${astrology.natalMoonSign} themes.`);

    if (astrology.twelfthHousePlanets && astrology.twelfthHousePlanets.length > 0) {
      parts.push(`Planets in your 12th house (${astrology.twelfthHousePlanets.join(', ')}) are the permanent residents of your dream world. They color every dream you have.`);
    }
    if (astrology.neptune) {
      parts.push(`Neptune in ${astrology.neptune.sign} (house ${astrology.neptune.house}) governs your dream frequency and visionary capacity.`);
    }
    if (astrology.pluto) {
      parts.push(`Pluto in ${astrology.pluto.sign} (house ${astrology.pluto.house}) determines the depth and transformative power of your dreams.`);
    }
    if (astrology.currentMoonSign) {
      parts.push(`Tonight's Moon is in ${astrology.currentMoonSign}${astrology.currentMoonPhase ? ` (${astrology.currentMoonPhase})` : ''}, which flavors the emotional texture of your dream.`);
    }
    if (astrology.progressedMoonSign) {
      parts.push(`Your progressed Moon in ${astrology.progressedMoonSign} reveals the longer emotional chapter you are living through — this dream is part of that unfolding.`);
    }

    astrologicalConnection = parts.join(' ');
  } else {
    astrologicalConnection = 'Your astrological dream profile will appear here once your natal chart is connected. When active, Dream Oracle will cross-reference your dream symbols with your Moon sign, 12th house planets, Neptune placement, current transits, and progressed Moon — revealing why you dream what you dream, when you dream it, and what the cosmos is trying to show you through your unconscious.';
  }

  const whyNow = buildWhyNow(input.emotions, input.dreamType, input.intensityScore, astrology);
  const watchFor = buildWatchFor(input.emotions, input.symbols, input.dreamType);
  const whatToDo = buildWhatToDo(input.emotions, input.dreamType, input.intensityScore);
  const reflectionQuestions = buildReflectionQuestions(input.emotions, input.symbols, input.dreamType, input.people);

  return {
    surfaceStory,
    emotionalMeaning,
    mainSymbols: symbols,
    hiddenMessage,
    shadowMessage,
    spiritualMeaning,
    psychologicalMeaning,
    astrologicalConnection,
    whyNow,
    watchFor,
    whatToDo,
    reflectionQuestions,
  };
}
