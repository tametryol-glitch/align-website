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

// ── Dream-type archetype maps ────────────────────────────────────

interface DreamArchetype {
  coreTheme: string;
  subconscious: string;
  shadowAngle: string;
  oracleClose: string;
}

const DREAM_ARCHETYPES: Record<string, DreamArchetype> = {
  chase: {
    coreTheme: 'Something in your waking life is demanding confrontation — a responsibility, a feeling, or a truth you have been outrunning. The pursuer is not the threat; the running is.',
    subconscious: 'Your subconscious is staging a chase because avoidance has become your default response to discomfort. The distance between you and the pursuer represents how far you have pushed this issue from conscious awareness.',
    shadowAngle: 'What you are running from is not behind you — it is inside you. The chase will not end until you stop, turn around, and ask the pursuer what it wants.',
    oracleClose: 'Stop running. The thing chasing you loses its power the moment you face it.',
  },
  teeth: {
    coreTheme: 'Teeth hold your words and your appearance together. Losing them signals a fracture in how you present yourself to the world — something you said, failed to say, or fear being exposed for.',
    subconscious: 'Your subconscious is processing a loss of control over how others perceive you. Teeth falling out mirrors the sensation of your public persona crumbling — revealing something raw underneath.',
    shadowAngle: 'The real fear is not the teeth. It is what happens when people see you without the mask. What are you afraid they will find?',
    oracleClose: 'Your worth is not your appearance or your words. Let the false version fall away.',
  },
  snake: {
    coreTheme: 'The snake is transformation wearing a frightening mask. Something in your life is shedding — a relationship, a belief, an identity — and the process feels threatening because it is irreversible.',
    subconscious: 'Your subconscious chose the oldest symbol in human dreaming. Snakes appear when the psyche is ready for a fundamental shift but the conscious mind is resisting. The venom is the catalyst.',
    shadowAngle: 'The snake may represent someone you distrust — or a part of yourself that operates through instinct rather than reason. Which feels more true?',
    oracleClose: 'Let the old skin fall. What emerges will be closer to who you actually are.',
  },
  death: {
    coreTheme: 'This dream is not about physical death. Something is ending — a chapter, a dynamic, a version of yourself — and your psyche is marking the transition with the most powerful symbol it has.',
    subconscious: 'Death dreams appear at thresholds. Your subconscious is acknowledging that what comes next requires releasing what came before. Grief in the dream is real grief for what you are letting go of.',
    shadowAngle: 'The part you may resist: you cannot carry the old version into the new chapter. The dream is asking you to choose — hold on and stagnate, or grieve and grow.',
    oracleClose: 'This ending is making room for something you cannot yet see. Trust the emptiness.',
  },
  water: {
    coreTheme: 'Water is your emotional state made visible. The condition of the water — its depth, clarity, temperature, and movement — is an exact mirror of what is happening beneath your composure.',
    subconscious: 'Your subconscious is showing you the emotional landscape you have been navigating unconsciously. Calm water means equilibrium. Turbulent water means something is churning that you have not addressed.',
    shadowAngle: 'If the water was threatening — flooding, drowning, dark — the shadow message is that your emotions have exceeded your willingness to feel them. Suppression creates pressure.',
    oracleClose: 'Feel what the water is showing you. Emotions processed lose their destructive power.',
  },
  flying: {
    coreTheme: 'Flying dreams reflect your relationship with freedom and limitation. The ease of your flight reveals how empowered you feel in waking life — effortless flight means confidence; struggling to stay airborne means doubt.',
    subconscious: 'Your subconscious is giving you the experience of being unbound. This dream appears when something in your life is either liberating you or when you desperately need liberation.',
    shadowAngle: 'Flying can also be escape. If you were flying away from something rather than toward something, the dream is less about freedom and more about avoidance wearing a exhilarating disguise.',
    oracleClose: 'Notice whether you were soaring or fleeing. One is power. The other is a beautiful distraction.',
  },
  falling: {
    coreTheme: 'Falling signals a loss of ground — something you relied on for stability is shifting. This could be a relationship, a job, a belief about yourself, or a sense of control you thought was permanent.',
    subconscious: 'Your subconscious registers instability before your conscious mind admits it. The fall is not a prediction — it is a recognition that the foundation has already moved.',
    shadowAngle: 'The uncomfortable truth: you may have known this ground was unstable and chose to stand on it anyway. The fall is not the problem. Pretending the ground was solid was.',
    oracleClose: 'Let yourself land. The impact you fear is almost never as bad as the falling.',
  },
  house: {
    coreTheme: 'The house is you — your psyche in architectural form. Every room is a different part of your inner world. The room you were in, the rooms you avoided, and the condition of the building all speak directly to your current psychological state.',
    subconscious: 'Your subconscious built this house to show you something about your inner structure. New rooms mean undiscovered potential. Crumbling walls mean neglected foundations. Locked doors mean repression.',
    shadowAngle: 'The room you were afraid to enter — or the part of the house that felt wrong — represents the aspect of yourself you are least willing to examine right now.',
    oracleClose: 'Walk through the whole house. Even the rooms that frighten you belong to you.',
  },
  ex: {
    coreTheme: 'This dream is rarely about the person. Your ex represents a version of yourself that existed in that relationship — the needs you had, the patterns you repeated, the parts of you that were activated by their presence.',
    subconscious: 'Your subconscious is not pining — it is processing. The ex appears because something in your current life has activated the same emotional pattern that defined that relationship.',
    shadowAngle: 'The harder question: what quality did your ex reflect back to you that you have not yet reclaimed or resolved on your own? That is what the dream is actually about.',
    oracleClose: 'The dream is not asking you to go back. It is asking you to retrieve the part of yourself you left in that story.',
  },
  animals: {
    coreTheme: 'Animals in dreams represent instincts — the parts of you that operate below language and logic. The specific animal and its behavior reveal which instincts are active, suppressed, or demanding attention.',
    subconscious: 'Your subconscious chose an animal because the message is pre-verbal. Whatever this dream is communicating exists at a level deeper than thought — in your body, your gut, your survival wiring.',
    shadowAngle: 'A threatening animal often represents an instinct you have domesticated at a cost. A wild part of you is pushing back against over-civilization.',
    oracleClose: 'Listen to the animal. It knows something your rational mind has been overriding.',
  },
};

// ── Scene analysis: extract action verbs from description ─────────

const ACTION_VERBS: Record<string, string> = {
  running: 'Your dream-self was in motion — running signals urgency, pursuit, or the body processing fight-or-flight activation.',
  falling: 'The sensation of falling points to instability — something beneath you is shifting or already gone.',
  flying: 'Flight in your dream reflects your psyche experimenting with freedom, elevation, or escape.',
  hiding: 'Hiding reveals self-protection as the dominant instinct — something in waking life feels threatening enough to trigger concealment.',
  fighting: 'Conflict in the dream mirrors an internal or external struggle that has not found resolution while awake.',
  drowning: 'Drowning signals emotional overwhelm — you are taking in more than you can process.',
  searching: 'The act of searching reveals an active pursuit — something missing in your waking life that your subconscious is trying to locate.',
  driving: 'Driving reflects your sense of agency and direction. Who controlled the vehicle tells you who controls your path.',
  climbing: 'Climbing represents effort toward something higher — ambition, growth, or escape from a low point.',
  swimming: 'Swimming through your dream means you are actively navigating your emotions rather than being swept away by them.',
  crying: 'Tears in the dream are emotional release your waking self may not be allowing.',
  screaming: 'Screaming — especially when no sound comes out — signals frustration at not being heard or inability to express something critical.',
  dancing: 'Movement without purpose other than expression — your psyche is processing joy, freedom, or the desire for both.',
  dying: 'Death in dreams marks endings and thresholds. Something is completing its cycle.',
  trapped: 'Feeling trapped reveals constriction — a situation, relationship, or self-imposed limitation that has become suffocating.',
  naked: 'Exposure dreams process vulnerability — fear of being seen as you actually are, without the usual armor.',
  lost: 'Being lost mirrors a lack of direction or certainty about where your life is heading.',
  chasing: 'You are in pursuit of something — or something is in pursuit of you. The direction determines whether this is desire or avoidance.',
  killing: 'The act of killing in dreams is almost always symbolic — ending a pattern, a relationship dynamic, or a version of yourself.',
  pregnant: 'Pregnancy signals gestation — something new is forming inside you that has not yet emerged into the world.',
};

function analyzeScene(description: string): string[] {
  const text = description.toLowerCase();
  const found: string[] = [];
  for (const [verb, insight] of Object.entries(ACTION_VERBS)) {
    if (text.includes(verb)) {
      found.push(insight);
    }
  }
  return found.slice(0, 3);
}

// ── Anti-repetition tracker ──────────────────────────────────────

class PhraseTracker {
  private used = new Set<string>();

  pick<T>(pool: T[], key: (item: T) => string): T {
    const unused = pool.filter(item => !this.used.has(key(item)));
    const choice = unused.length > 0 ? unused[Math.floor(Math.random() * unused.length)] : pool[Math.floor(Math.random() * pool.length)];
    this.used.add(key(choice));
    return choice;
  }

  pickString(pool: string[]): string {
    return this.pick(pool, s => s);
  }
}

// ── Rich symbol matching (uses all 6 dictionary fields) ──────────

interface MatchedSymbol {
  symbol: string;
  meaning: string;
  psychological: string;
  spiritual: string;
  astrological: string;
  shadow: string;
  reflection: string;
}

function matchSymbolsRich(description: string, userSymbols: string[]): MatchedSymbol[] {
  const matched = new Map<string, MatchedSymbol>();

  for (const s of userSymbols) {
    const entry = getSymbol(s);
    if (entry) {
      matched.set(entry.name, {
        symbol: entry.name,
        meaning: entry.general,
        psychological: entry.psychological,
        spiritual: entry.spiritual,
        astrological: entry.astrological,
        shadow: entry.shadow,
        reflection: entry.reflection,
      });
    }
  }

  if (matched.size === 0) {
    const text = description.toLowerCase();
    for (const entry of DREAM_SYMBOLS) {
      if (text.includes(entry.key.replace('_', ' ')) || text.includes(entry.name.toLowerCase())) {
        matched.set(entry.name, {
          symbol: entry.name,
          meaning: entry.general,
          psychological: entry.psychological,
          spiritual: entry.spiritual,
          astrological: entry.astrological,
          shadow: entry.shadow,
          reflection: entry.reflection,
        });
      }
      if (matched.size >= 8) break;
    }
  }

  return Array.from(matched.values()).slice(0, 8);
}

// ── Detect dream archetype from type + description ───────────────

function detectArchetype(dreamType: string, description: string): DreamArchetype | null {
  const text = description.toLowerCase();

  if (dreamType === 'chase' || text.includes('chasing') || text.includes('chased') || text.includes('running from') || text.includes('running away')) {
    return DREAM_ARCHETYPES.chase;
  }
  if (text.includes('teeth') || text.includes('tooth') || text.includes('teeth falling') || text.includes('teeth crumbling')) {
    return DREAM_ARCHETYPES.teeth;
  }
  if (text.includes('snake') || text.includes('serpent')) {
    return DREAM_ARCHETYPES.snake;
  }
  if (text.includes('died') || text.includes('dying') || text.includes('death') || text.includes('funeral') || text.includes('dead body')) {
    return DREAM_ARCHETYPES.death;
  }
  if (text.includes('ocean') || text.includes('flood') || text.includes('drowning') || text.includes('swimming') || text.includes('underwater')) {
    return DREAM_ARCHETYPES.water;
  }
  if (text.includes('flying') || text.includes('floating') || text.includes('soaring') || text.includes('levitat')) {
    return DREAM_ARCHETYPES.flying;
  }
  if (text.includes('falling') || text.includes('cliff') || text.includes('dropped')) {
    return DREAM_ARCHETYPES.falling;
  }
  if (text.includes('house') || text.includes('room') || text.includes('building') || text.includes('apartment') || text.includes('basement') || text.includes('attic')) {
    return DREAM_ARCHETYPES.house;
  }
  if (text.includes('ex ') || text.includes('ex-') || text.includes('former partner') || text.includes('ex boyfriend') || text.includes('ex girlfriend') || text.includes('old relationship')) {
    return DREAM_ARCHETYPES.ex;
  }
  if (text.includes('animal') || text.includes('dog') || text.includes('cat') || text.includes('wolf') || text.includes('bear') || text.includes('lion') || text.includes('spider') || text.includes('bird')) {
    return DREAM_ARCHETYPES.animals;
  }

  return null;
}

// ── Section A: The Core Message ──────────────────────────────────

function buildCoreMessage(
  input: DreamInput,
  archetype: DreamArchetype | null,
  sceneInsights: string[],
  symbols: MatchedSymbol[],
): string {
  const parts: string[] = [];

  if (archetype) {
    parts.push(archetype.coreTheme);
  } else {
    const emotionAnchor = input.emotions.length > 0
      ? `The ${input.emotions[0]} you felt is the entry point — everything else in this dream orbits that feeling.`
      : 'Even without a named emotion, this dream carries weight. The fact that you remembered it means your subconscious flagged it as significant.';
    parts.push(emotionAnchor);
  }

  if (sceneInsights.length > 0) {
    parts.push(sceneInsights[0]);
  }

  if (symbols.length > 0 && !archetype) {
    const sym = symbols[0];
    parts.push(`The presence of ${sym.symbol} anchors this dream in a specific psychological territory: ${sym.meaning.split('.')[0]}.`);
  }

  if (input.people.length > 0) {
    const names = input.people.slice(0, 2).join(' and ');
    parts.push(`${names} appearing in this dream is not incidental — they represent a dynamic or quality you are actively processing.`);
  }

  return parts.join(' ');
}

// ── Section B: What Your Subconscious Was Showing You ────────────

function buildSubconsciousMessage(
  input: DreamInput,
  archetype: DreamArchetype | null,
  symbols: MatchedSymbol[],
  sceneInsights: string[],
): string {
  const parts: string[] = [];

  if (archetype) {
    parts.push(archetype.subconscious);
  } else {
    if (input.emotions.length > 0) {
      const primary = input.emotions[0];
      const secondary = input.emotions.length > 1 ? input.emotions[1] : null;
      let emotionRead = `Your subconscious chose ${primary} as the dominant frequency of this dream.`;
      if (secondary) {
        emotionRead += ` Layered with ${secondary}, it creates a tension your waking mind may be struggling to hold.`;
      }
      parts.push(emotionRead);
    } else {
      parts.push('Your subconscious constructed this scene with precision — even without a clear emotional label, the imagery itself is the message.');
    }
  }

  if (symbols.length > 0) {
    const sym = symbols[0];
    parts.push(`From a psychological angle, ${sym.symbol} here means: ${sym.psychological.split('.')[0]}.`);
  }

  if (sceneInsights.length > 1) {
    parts.push(sceneInsights[1]);
  }

  if (input.people.length > 0) {
    parts.push(`The people in this dream — ${input.people.slice(0, 3).join(', ')} — are not simply themselves. Each one represents a quality you project onto them, or an unresolved dynamic between you.`);
  }

  if (input.dreamType === 'recurring') {
    parts.push('The fact that this is recurring means the message has been trying to reach you. Each repetition is your subconscious raising its voice because the lesson remains unlearned.');
  }

  if (input.dreamType === 'nightmare') {
    parts.push('Nightmares are not punishments — they are alarms. Your psyche is escalating the imagery because something needs immediate conscious attention.');
  }

  if (input.dreamType === 'lucid') {
    parts.push('Achieving lucidity suggests your consciousness is expanding — you are developing the ability to witness your own depths without being consumed by them.');
  }

  return parts.join(' ');
}

// ── Section C: Main Symbols (returns both rich data + summary) ───

function buildSymbolSection(symbols: MatchedSymbol[]): { mainSymbols: { symbol: string; meaning: string }[]; symbolNarrative: string } {
  if (symbols.length === 0) {
    return {
      mainSymbols: [],
      symbolNarrative: 'No specific symbols were matched in the dictionary, but that does not mean the dream lacks symbolic content. Every image your subconscious chooses is a symbol — even mundane objects carry personal meaning that generic dictionaries cannot capture.',
    };
  }

  const narrativeParts: string[] = [];
  const mainSymbols: { symbol: string; meaning: string }[] = [];

  for (const sym of symbols.slice(0, 5)) {
    mainSymbols.push({ symbol: sym.symbol, meaning: sym.meaning });

    const layers: string[] = [];
    layers.push(sym.meaning.split('.')[0] + '.');

    if (sym.shadow) {
      layers.push(`Its shadow side: ${sym.shadow.split('.')[0]}.`);
    }

    if (sym.astrological) {
      layers.push(sym.astrological.split('.')[0] + '.');
    }

    narrativeParts.push(`${sym.symbol} — ${layers.join(' ')}`);
  }

  return { mainSymbols, symbolNarrative: narrativeParts.join('\n\n') };
}

// ── Section D: The Emotional Undercurrent ────────────────────────

function buildEmotionalUndercurrent(input: DreamInput, symbols: MatchedSymbol[]): string {
  const parts: string[] = [];
  const intensity = input.intensityScore;

  if (input.emotions.length === 0) {
    parts.push('You did not name a specific emotion, but the dream itself carried one. Dreams that linger in memory always have an emotional charge — your body registered it even if your mind did not label it.');
    parts.push('Sit with the imagery for a moment. What do you feel now, recalling it? That residual feeling is the dream\'s emotional signature.');
    return parts.join(' ');
  }

  const primary = input.emotions[0];
  const secondaries = input.emotions.slice(1);

  parts.push(`The dominant feeling — ${primary} — is not decoration. It is the dream's actual content; the imagery is just the delivery system.`);

  if (secondaries.length > 0) {
    parts.push(`Underneath that, ${secondaries.join(' and ')} added complexity. Your psyche was processing multiple emotional threads simultaneously — this is not confusion, it is depth.`);
  }

  if (intensity >= 8) {
    parts.push(`At ${intensity}/10 intensity, your psyche treats this as urgent. High-intensity dreams surface when something has been building pressure and can no longer be contained in the background.`);
  } else if (intensity >= 5) {
    parts.push(`At ${intensity}/10, this is an active processing dream — significant enough to demand attention, measured enough to suggest you have the capacity to work with what it reveals.`);
  } else {
    parts.push(`At ${intensity}/10, this is a quieter signal — but do not dismiss it. Low-intensity dreams often carry precise, surgical messages that louder dreams drown out.`);
  }

  if (symbols.length > 0) {
    const sym = symbols[0];
    if (sym.spiritual) {
      parts.push(`Spiritually, the ${sym.symbol} in this emotional context suggests: ${sym.spiritual.split('.')[0]}.`);
    }
  }

  return parts.join(' ');
}

// ── Section E: What This Dream Is Asking You To Face ─────────────

function buildShadowChallenge(
  input: DreamInput,
  archetype: DreamArchetype | null,
  symbols: MatchedSymbol[],
): string {
  const parts: string[] = [];

  if (archetype) {
    parts.push(archetype.shadowAngle);
  } else {
    if (input.dreamType === 'nightmare') {
      parts.push('This nightmare is not trying to hurt you — it is trying to wake you up. The distress is proportional to how long you have been sidestepping what it represents.');
    } else {
      parts.push('Every dream has a layer you would rather not look at. The interpretation that makes you most uncomfortable is usually the most accurate.');
    }
  }

  if (symbols.length > 0) {
    const shadowSymbol = symbols.find(s => s.shadow && s.shadow.length > 20);
    if (shadowSymbol) {
      parts.push(`The shadow dimension of ${shadowSymbol.symbol} in your dream: ${shadowSymbol.shadow.split('.')[0]}.`);
    }
  }

  if (input.emotions.includes('fear') || input.emotions.includes('anxiety') || input.emotions.includes('dread')) {
    parts.push('The fear in this dream is a compass. It is pointing directly at the thing you most need to face — not because facing it is dangerous, but because avoiding it is.');
  }

  if (input.emotions.includes('anger')) {
    parts.push('Anger in dreams represents boundaries that have been violated or needs that have gone unmet. Something in you is asserting itself.');
  }

  if (input.emotions.includes('guilt') || input.emotions.includes('shame')) {
    parts.push('Guilt or shame surfacing in a dream means your psyche is ready to process it. The dream is not punishing you — it is giving you a safe space to confront what you have been carrying.');
  }

  if (input.intensityScore >= 7 && !archetype) {
    parts.push('The intensity level tells you the shadow material is close to the surface — it is pushing through because containment is no longer possible.');
  }

  return parts.join(' ');
}

// ── Section F: Dream Oracle's Final Message ──────────────────────

function buildOracleMessage(
  input: DreamInput,
  archetype: DreamArchetype | null,
  symbols: MatchedSymbol[],
  astrology: DreamAstrologyContext | null,
): string {
  const parts: string[] = [];

  if (archetype) {
    parts.push(archetype.oracleClose);
  }

  if (astrology && astrology.natalMoonSign) {
    parts.push(`With your Moon in ${astrology.natalMoonSign}, your emotional processing naturally gravitates toward these themes — this dream is working with your natal wiring, not against it.`);

    if (astrology.activeTransits && astrology.activeTransits.length > 0) {
      parts.push(`Current transits (${astrology.activeTransits.slice(0, 2).join('; ')}) are activating the same territory this dream is exploring. The sky and your subconscious are synchronized.`);
    }

    if (astrology.currentMoonPhase) {
      const phase = astrology.currentMoonPhase.toLowerCase();
      if (phase.includes('full')) {
        parts.push('You dreamed this near a full moon — emotional material surfaces with maximum clarity during full moons. This dream arrived at the right time.');
      } else if (phase.includes('new')) {
        parts.push('This dream arrived near a new moon — a seed phase. What it reveals may take weeks to fully unfold.');
      }
    }
  }

  if (symbols.length > 0) {
    parts.push(`The symbols in this dream — ${symbols.slice(0, 3).map(s => s.symbol).join(', ')} — are not random selections. Your subconscious curated them specifically for you, from your specific life, at this specific moment.`);
  }

  if (!archetype) {
    if (input.dreamType === 'prophetic') {
      parts.push('Dreams that feel prophetic often tap into pattern recognition your conscious mind has not caught up with. Your intuition is reading the trajectory before your logic can.');
    } else if (input.dreamType === 'visitation') {
      parts.push('Visitation dreams carry a different quality — vivid, emotionally clear, and often more real than waking life. If this felt like a genuine encounter, trust that feeling.');
    }

    const emotionClose = input.emotions.length > 0
      ? `Honor the ${input.emotions[0]} this dream brought up — it is not a symptom to fix, it is information to use.`
      : 'Sit with what this dream stirred in you. The residual feeling is the message distilled to its purest form.';
    parts.push(emotionClose);
  }

  if (parts.length === 0) {
    parts.push('This dream chose you for a reason. The images will fade, but the feeling it left behind is the part worth keeping — let it guide you.');
  }

  return parts.join(' ');
}

// ── Astrological connection (kept separate for dedicated section) ─

function buildAstrologicalConnection(astrology: DreamAstrologyContext | null): string {
  if (!astrology || !astrology.natalMoonSign) {
    return 'Your astrological dream profile will appear here once your natal chart is connected. When active, Dream Oracle will cross-reference your dream symbols with your Moon sign, 12th house planets, Neptune placement, current transits, and progressed Moon — revealing why you dream what you dream, when you dream it.';
  }

  const parts: string[] = [];
  parts.push(`Your natal Moon in ${astrology.natalMoonSign}${astrology.natalMoonHouse ? ` (${astrology.natalMoonHouse}th house)` : ''} shapes how you process dreams — it filters your unconscious through ${astrology.natalMoonSign} themes.`);

  if (astrology.twelfthHousePlanets && astrology.twelfthHousePlanets.length > 0) {
    parts.push(`Planets in your 12th house (${astrology.twelfthHousePlanets.join(', ')}) are permanent residents of your dream world. They color every dream you have.`);
  }
  if (astrology.neptune) {
    parts.push(`Neptune in ${astrology.neptune.sign} (house ${astrology.neptune.house}) governs your dream frequency and visionary capacity.`);
  }
  if (astrology.pluto) {
    parts.push(`Pluto in ${astrology.pluto.sign} (house ${astrology.pluto.house}) determines the depth and transformative power of your dreams.`);
  }
  if (astrology.currentMoonSign) {
    parts.push(`Tonight's Moon in ${astrology.currentMoonSign}${astrology.currentMoonPhase ? ` (${astrology.currentMoonPhase})` : ''} flavors the emotional texture of what you dreamed.`);
  }
  if (astrology.progressedMoonSign) {
    parts.push(`Your progressed Moon in ${astrology.progressedMoonSign} reveals the longer emotional chapter you are living through — this dream is part of that arc.`);
  }

  return parts.join(' ');
}

// ── Why Now ──────────────────────────────────────────────────────

function buildWhyNow(input: DreamInput, astrology: DreamAstrologyContext | null): string {
  const parts: string[] = [];

  if (input.intensityScore >= 8) {
    parts.push('The intensity of this dream tells you it is not new material — it has been building. Your psyche chose now because the pressure reached a threshold.');
  } else if (input.intensityScore >= 5) {
    parts.push('This dream arrived because something in your recent waking life activated the pattern it describes — a conversation, a decision, a feeling you brushed past.');
  } else {
    parts.push('Low-intensity dreams are precise rather than loud. Something small but specific in your recent life triggered this — a moment you may have dismissed but your subconscious did not.');
  }

  if (input.dreamType === 'recurring') {
    parts.push('A recurring dream means the trigger is not a single event — it is a pattern in your life that keeps recreating the same emotional conditions. The dream will stop when the pattern does.');
  }

  if (astrology) {
    if (astrology.currentMoonPhase) {
      const phase = astrology.currentMoonPhase.toLowerCase();
      if (phase.includes('full')) {
        parts.push('The full moon amplifies emotional intensity and brings hidden material to the surface. Dreams during full moons are more vivid and symbolically concentrated.');
      } else if (phase.includes('new')) {
        parts.push('New moons are seed phases — this dream may contain the embryo of something that will unfold over the coming lunar cycle.');
      }
    }
    if (astrology.activeTransits && astrology.activeTransits.length > 0) {
      parts.push(`Active transits (${astrology.activeTransits.slice(0, 3).join('; ')}) are stirring the same themes this dream explores. The cosmic timing is not coincidental.`);
    }
  }

  return parts.join(' ');
}

// ── Reflection questions ─────────────────────────────────────────

function buildReflectionQuestions(input: DreamInput, symbols: MatchedSymbol[], archetype: DreamArchetype | null): string[] {
  const questions: string[] = [];

  if (input.emotions.length > 0) {
    questions.push(`When was the last time you felt ${input.emotions[0]} this intensely while awake? What was happening?`);
  }

  if (symbols.length > 0) {
    const sym = symbols[0];
    if (sym.reflection) {
      questions.push(sym.reflection);
    }
  }

  if (input.people.length > 0) {
    questions.push(`What quality does ${input.people[0]} represent to you? Is that quality something you need more of, or something you need to release?`);
  }

  if (archetype) {
    if (archetype === DREAM_ARCHETYPES.chase) {
      questions.push('If you stopped running in the dream and turned around — what do you think you would see?');
    } else if (archetype === DREAM_ARCHETYPES.teeth) {
      questions.push('What have you said recently — or failed to say — that is still sitting in your body?');
    } else if (archetype === DREAM_ARCHETYPES.ex) {
      questions.push('What version of yourself existed in that relationship that no longer exists now? Do you miss that version, or are you relieved they are gone?');
    } else if (archetype === DREAM_ARCHETYPES.house) {
      questions.push('If your dream house is a map of your inner world, which room were you drawn to — and which did you avoid?');
    }
  }

  if (input.dreamType === 'nightmare') {
    questions.push('What is the worst thing that happens if the nightmare scenario comes true — and what is the worst thing that happens if you keep avoiding what it represents?');
  }

  if (input.dreamType === 'recurring') {
    questions.push('This dream keeps returning. What is the one thing you have been refusing to do, admit, or change that would make it stop?');
  }

  if (questions.length < 3) {
    questions.push('What part of your current life does this dream most remind you of?');
  }

  if (questions.length < 4) {
    questions.push('If someone you trusted had this exact dream, what would you tell them it means?');
  }

  return questions.slice(0, 5);
}

// ── Watch for ────────────────────────────────────────────────────

function buildWatchFor(input: DreamInput, symbols: MatchedSymbol[]): string {
  const items: string[] = [];

  if (symbols.length > 0) {
    const names = symbols.slice(0, 3).map(s => s.symbol.toLowerCase()).join(', ');
    items.push(`Real-world appearances of ${names} — synchronicities are the waking world echoing what the dream revealed`);
  }

  if (input.emotions.includes('fear') || input.emotions.includes('anxiety')) {
    items.push('Moments where the same fear surfaces during the day — that is the bridge between your dream self and your waking self');
  }

  if (input.emotions.includes('love') || input.emotions.includes('bliss') || input.emotions.includes('peace')) {
    items.push('Moments of unexpected warmth or calm — the dream may have opened a channel that continues to flow');
  }

  if (input.dreamType === 'prophetic') {
    items.push('Events that echo the dream\'s scenario — note them when they occur, even if the connection seems loose');
  }

  items.push('Dreams tonight and tomorrow — dreams often arrive in sequences, and the next one may complete what this one started');

  return 'In the coming days, pay attention to: ' + items.join('; ') + '.';
}

// ── What to do ───────────────────────────────────────────────────

function buildWhatToDo(input: DreamInput): string {
  const actions: string[] = [];

  actions.push('Write this dream down in full detail — the act of writing anchors the message and prevents it from dissolving');

  if (input.intensityScore >= 7) {
    actions.push('Sit with this dream for a few minutes before starting your day — high-intensity dreams need space before the conscious mind takes over');
  }

  if (input.emotions.includes('fear') || input.emotions.includes('anger') || input.emotions.includes('grief') || input.emotions.includes('sadness')) {
    actions.push('Let yourself feel what the dream brought up without judging it — the emotion is information, not a problem to solve');
  }

  if (input.dreamType === 'lucid') {
    actions.push('Before sleeping tonight, set an intention to return to this dream — your lucid capacity gives you the ability to go deeper');
  }

  if (input.dreamType === 'visitation') {
    actions.push('Speak to the person who visited — out loud, in a journal, or silently. Say what was left unsaid');
  }

  actions.push('Return to the Dream Oracle before bed tonight and notice if the next dream continues the conversation');

  return actions.slice(0, 4).map((a, i) => `${i + 1}. ${a}`).join('\n\n');
}

// ── Main interpretation generator ────────────────────────────────

export function generateDreamInterpretation(
  input: DreamInput,
  astrology: DreamAstrologyContext | null = null,
): DreamInterpretation {
  const tracker = new PhraseTracker();
  void tracker; // available for future pool-based picking

  const symbols = matchSymbolsRich(input.description, input.symbols);
  const archetype = detectArchetype(input.dreamType, input.description);
  const sceneInsights = analyzeScene(input.description);

  const surfaceStory = buildCoreMessage(input, archetype, sceneInsights, symbols);
  const hiddenMessage = buildSubconsciousMessage(input, archetype, symbols, sceneInsights);

  const { mainSymbols, symbolNarrative } = buildSymbolSection(symbols);

  const emotionalMeaning = buildEmotionalUndercurrent(input, symbols);
  const shadowMessage = buildShadowChallenge(input, archetype, symbols);
  const spiritualMeaning = buildOracleMessage(input, archetype, symbols, astrology);

  const psychologicalMeaning = symbolNarrative;

  const astrologicalConnection = buildAstrologicalConnection(astrology);
  const whyNow = buildWhyNow(input, astrology);
  const watchFor = buildWatchFor(input, symbols);
  const whatToDo = buildWhatToDo(input);
  const reflectionQuestions = buildReflectionQuestions(input, symbols, archetype);

  return {
    surfaceStory,
    emotionalMeaning,
    mainSymbols,
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
