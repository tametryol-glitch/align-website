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
    coreTheme: 'You are racing something you have not named: a conversation, a bill, a decision, a feeling you keep outrunning by staying busy. The pursuer is not the threat; the running is.',
    subconscious: 'Avoidance is your reflex when something gets uncomfortable, so you change the subject, pick up another task, reach for your phone. The dream shows how far you have pushed this thing away, and it keeps closing the gap anyway.',
    shadowAngle: 'What you are running from is not behind you: it is inside you. The chase will not end until you stop, turn around, and ask the pursuer what it wants.',
    oracleClose: 'Stop running. The thing chasing you loses its power the moment you face it.',
  },
  teeth: {
    coreTheme: 'You said something, or failed to say something, and you are braced for it to come back on you. Losing your teeth is the fear of being caught mid-sentence, unpolished, with everyone watching.',
    subconscious: 'You feel the way people see you slipping out of your hands. A mistake you hoped stayed hidden is about to surface, or the polished version of you that you maintain at a cost is getting exhausting to keep up.',
    shadowAngle: 'The real fear is not the teeth. It is what happens when people see you without the mask. What are you afraid they will find?',
    oracleClose: 'Your worth is not your appearance or your words. Let the false version fall away.',
  },
  snake: {
    coreTheme: 'Something in your life is ending whether you agree or not: a relationship, a belief, a version of you that no longer fits. It feels threatening because you cannot climb back into the old skin.',
    subconscious: 'You already know the change is coming and you are stalling. The snake shows up when you are ready for the shift and still negotiating with it. The bite is the push.',
    shadowAngle: 'The snake is either someone you do not trust and are still smiling at, or the part of you that acts on instinct and takes the blame for it. Which one made your stomach tighten?',
    oracleClose: 'Let the old skin fall. What emerges will be closer to who you actually are.',
  },
  death: {
    coreTheme: 'This is not about anyone dying. Something in your life is over, a chapter, a dynamic, a role, and you have not yet said so out loud to anyone, including yourself.',
    subconscious: 'You are standing in a doorway. What comes next needs you to put down what came before, and the grief in the dream is real grief for something you are already losing.',
    shadowAngle: 'The part you resist: you cannot carry the old version of you into the next chapter, and you are still trying. Hold on and stay stuck, or grieve and move.',
    oracleClose: 'This ending is making room for something you cannot yet see. Trust the emptiness.',
  },
  water: {
    coreTheme: 'The water is how you actually feel under the calm face you show people. Its depth, clarity and movement are an honest readout of what you have been holding together.',
    subconscious: 'Calm water means you are steady right now. Rough water means something is churning that you have not talked about, and you are keeping your composure on top of it.',
    shadowAngle: 'If the water was flooding, dark or pulling you under, you are feeling more than you let yourself feel, and holding it in is costing you sleep, patience or your temper.',
    oracleClose: 'Feel what the water is showing you. Emotions processed lose their destructive power.',
  },
  flying: {
    coreTheme: 'You want out from under something. Easy flight means you feel capable and free in your life right now; a struggle to stay up means you do not trust yourself to keep what you started.',
    subconscious: 'Either something in your life is finally loosening, or you feel so boxed in that you needed the dream to give you air. You already know which one it is.',
    shadowAngle: 'If you were flying away from something rather than toward something, that was not freedom. It was leaving, wrapped in a good feeling.',
    oracleClose: 'Notice whether you were soaring or fleeing. One is power. The other is a beautiful distraction.',
  },
  falling: {
    coreTheme: 'Something you counted on is moving: a relationship, a job, a belief about yourself, a plan you thought was settled. You feel it in your gut before you admit it in words.',
    subconscious: 'You noticed the ground shifting before you let yourself say so. The dream is not predicting a fall; it is reporting that the foundation has already moved.',
    shadowAngle: 'You knew this ground was shaky and stood on it anyway. The fall is not the problem. Pretending the ground was solid was.',
    oracleClose: 'Let yourself land. The impact you fear is almost never as bad as the falling.',
  },
  house: {
    coreTheme: 'The house is you. The room you stood in, the rooms you skipped and the state of the walls show what you are paying attention to in your life and what you are letting rot.',
    subconscious: 'A new room is a talent or a plan you have not used yet. Crumbling walls are the basics you have neglected, like sleep, money or a promise. A locked door is something you refuse to talk about.',
    shadowAngle: 'The room that felt wrong is the part of your life you are least willing to look at right now, and you already know what is in it.',
    oracleClose: 'Walk through the whole house. Even the rooms that frighten you belong to you.',
  },
  ex: {
    coreTheme: 'This is rarely about them. Your ex shows up as the version of you that existed in that relationship: the needs you had, the patterns you repeated, the way you behaved when they were around.',
    subconscious: 'You are not pining, you are replaying. Something in your life now is pressing the same button that relationship pressed, and you are reacting the old way.',
    shadowAngle: 'The harder question: what quality did your ex reflect back to you that you have not yet reclaimed or resolved on your own? That is what the dream is actually about.',
    oracleClose: 'The dream is not asking you to go back. It is asking you to retrieve the part of yourself you left in that story.',
  },
  animals: {
    coreTheme: 'The animal is your gut talking. It is a drive you have stopped listening to, such as anger, hunger, fear or desire, and how the animal behaved tells you which one.',
    subconscious: 'The message came as an animal because it is not a thought. It lives in your body: the tight stomach before a meeting, the urge to leave a room, the thing you know without being able to explain it.',
    shadowAngle: 'A threatening animal is an instinct you tamed to keep the peace, and it is tired of being kept quiet. Expect it to come out sideways, as a snap or a sudden exit, until you let it speak.',
    oracleClose: 'Listen to the animal. It knows something your rational mind has been overriding.',
  },
};

// ── Scene analysis: extract action verbs from description ─────────

const ACTION_VERBS: Record<string, string> = {
  running: 'You were running, which means you are rushing past something in your waking life, a decision, a conversation, a feeling, because stopping would make you face it.',
  falling: 'You fell, which means something you rely on is already moving under you, and you know it.',
  flying: 'You flew, which means you are hungry for room: either you just got some, or you are about to leave something behind to get it.',
  hiding: 'You hid, which means there is a person or situation you are staying out of sight from, and you are tired of doing it.',
  fighting: 'You fought, which means there is an argument you keep having in your head, with someone else or with yourself, that you have not had out loud.',
  drowning: 'You were drowning, which means you are taking in more than you can handle and telling nobody how full you are.',
  searching: 'You were searching, which means something is missing from your waking life, and part of you already knows what it is.',
  driving: 'Driving is about who runs your life. Whoever held the wheel in the dream holds it for you now, and if it was not you, take it back.',
  climbing: 'You were climbing, so you are working toward something higher, a promotion, a recovery, a way out. Ask whether you are climbing toward something or only away from where you were.',
  swimming: 'You were swimming, so you are handling your emotions instead of being dragged by them, which is more than you give yourself credit for.',
  crying: 'You cried in the dream because you are not letting yourself cry while awake.',
  screaming: 'You screamed, or tried to and no sound came, because there is something you need to say loudly and nobody is hearing it, or you have not let it out of your throat yet.',
  dancing: 'You were dancing, so you want to move, play and be seen enjoying yourself without justifying it, and you are not giving yourself that.',
  dying: 'You died in the dream, so something in your life is finished, and you can stop pretending it is not.',
  trapped: 'You were trapped, so a job, a relationship or a promise has turned into a cage, and you are the one still locking the door.',
  naked: 'You were exposed, so you are afraid people will see the real you, without the polish, and judge it.',
  lost: 'You were lost, so you do not know where your life is heading, and you have been acting as if you do.',
  chasing: 'Someone was chasing or being chased. If you were the chaser, you want something badly; if you were chased, you are avoiding it. Your role tells you which.',
  killing: 'You killed something in the dream, so you are ready to end a habit, a relationship dynamic or a version of yourself, and the dream just gave you permission.',
  pregnant: 'Pregnancy in the dream means something new is growing in you, a plan, a relationship, a change of direction, and it is not ready to be shown yet.',
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

function wholeWord(text: string, needle: string): boolean {
  const safe = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${safe}(s|es)?\\b`).test(text);
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
      if (wholeWord(text, entry.key.replace('_', ' ')) || wholeWord(text, entry.name.toLowerCase())) {
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
  if (wholeWord(text, 'house') || wholeWord(text, 'room') || text.includes('building') || text.includes('apartment') || text.includes('basement') || text.includes('attic')) {
    return DREAM_ARCHETYPES.house;
  }
  if (wholeWord(text, 'ex') || text.includes('former partner') || text.includes('ex boyfriend') || text.includes('ex girlfriend') || text.includes('old relationship')) {
    return DREAM_ARCHETYPES.ex;
  }
  if (['animal', 'dog', 'cat', 'wolf', 'bear', 'lion', 'spider', 'bird'].some(w => wholeWord(text, w))) {
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
      ? `The ${input.emotions[0]} you felt is the entry point: everything else in this dream orbits that feeling.`
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
    const rawNames = input.people.slice(0, 2).join(' and ');
    const names = rawNames.charAt(0).toUpperCase() + rawNames.slice(1);
    parts.push(`${names} did not show up in this dream by accident: you are working something out with them, or with what they stand for in your life.`);
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
      parts.push('Your subconscious constructed this scene with precision, even without a clear emotional label, the imagery itself is the message.');
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
    parts.push(`The people in this dream, ${input.people.slice(0, 3).join(', ')}, are not only themselves. Each one carries a quality you project onto them or something still unresolved between you and them.`);
  }

  if (input.dreamType === 'recurring') {
    parts.push('The fact that this is recurring means the message has been trying to reach you. Each repetition is your subconscious raising its voice because the lesson remains unlearned.');
  }

  if (input.dreamType === 'nightmare') {
    parts.push('Nightmares are not punishments: they are alarms. Your psyche is escalating the imagery because something needs immediate conscious attention.');
  }

  if (input.dreamType === 'lucid') {
    parts.push('Achieving lucidity suggests your consciousness is expanding: you are developing the ability to witness your own depths without being consumed by them.');
  }

  return parts.join(' ');
}

// ── Section C: Main Symbols (returns both rich data + summary) ───

function buildSymbolSection(symbols: MatchedSymbol[]): { mainSymbols: { symbol: string; meaning: string }[]; symbolNarrative: string } {
  if (symbols.length === 0) {
    return {
      mainSymbols: [],
      symbolNarrative: 'No specific symbols were matched in the dictionary, but that does not mean the dream lacks symbolic content. Every image your subconscious chooses is a symbol, even mundane objects carry personal meaning that generic dictionaries cannot capture.',
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

    narrativeParts.push(`${sym.symbol}: ${layers.join(' ')}`);
  }

  return { mainSymbols, symbolNarrative: narrativeParts.join('\n\n') };
}

// ── Section D: The Emotional Undercurrent ────────────────────────

function buildEmotionalUndercurrent(input: DreamInput, symbols: MatchedSymbol[]): string {
  const parts: string[] = [];
  const intensity = input.intensityScore;

  if (input.emotions.length === 0) {
    parts.push('You did not name a specific emotion, but the dream itself carried one. Dreams that linger in memory always have an emotional charge: your body registered it even if your mind did not label it.');
    parts.push('Sit with the imagery for a moment. What do you feel now, recalling it? That residual feeling is the dream\'s emotional signature.');
    return parts.join(' ');
  }

  const primary = input.emotions[0];
  const secondaries = input.emotions.slice(1);

  parts.push(`The dominant feeling, ${primary}, is not decoration. It is the dream's actual content; the imagery is just the delivery system.`);

  if (secondaries.length > 0) {
    parts.push(`Underneath that, ${secondaries.join(' and ')} added complexity. Your psyche was processing multiple emotional threads simultaneously: this is not confusion, it is depth.`);
  }

  if (intensity >= 8) {
    parts.push(`At ${intensity}/10 intensity, your psyche treats this as urgent. High-intensity dreams surface when something has been building pressure and can no longer be contained in the background.`);
  } else if (intensity >= 5) {
    parts.push(`At ${intensity}/10, this is an active processing dream: significant enough to demand attention, measured enough to suggest you have the capacity to work with what it reveals.`);
  } else {
    parts.push(`At ${intensity}/10, this is a quieter signal, but do not dismiss it. Low-intensity dreams often carry precise, surgical messages that louder dreams drown out.`);
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
      parts.push('This nightmare is not trying to hurt you: it is trying to wake you up. The distress matches how long you have been sidestepping the thing it points at.');
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
    parts.push('The fear in this dream is a compass. It is pointing directly at the thing you most need to face. Facing it is not the dangerous part; avoiding it is.');
  }

  if (input.emotions.includes('anger')) {
    parts.push('The anger in this dream points at a boundary that was crossed or a need that went unmet. Something in you is finally pushing back.');
  }

  if (input.emotions.includes('guilt') || input.emotions.includes('shame')) {
    parts.push('Guilt or shame surfacing in a dream means your psyche is ready to process it. The dream is not punishing you: it is giving you a safe space to confront what you have been carrying.');
  }

  if (input.intensityScore >= 7 && !archetype) {
    parts.push('The intensity level tells you the shadow material is close to the surface: it is pushing through because containment is no longer possible.');
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
    parts.push(`With your Moon in ${astrology.natalMoonSign}, your emotional processing naturally gravitates toward these themes: this dream is working with your natal wiring, not against it.`);

    if (astrology.activeTransits && astrology.activeTransits.length > 0) {
      parts.push(`Current transits (${astrology.activeTransits.slice(0, 2).join('; ')}) are activating the same territory this dream is exploring. The sky and your inner life are pulling on the same thread.`);
    }

    if (astrology.currentMoonPhase) {
      const phase = astrology.currentMoonPhase.toLowerCase();
      if (phase.includes('full')) {
        parts.push('You dreamed this near a full moon: emotional material tends to surface more clearly around full moons. Treat this dream as worth your attention.');
      } else if (phase.includes('new')) {
        parts.push('This dream arrived near a new moon: a seed phase. What it reveals may take weeks to fully unfold.');
      }
    }
  }

  if (symbols.length > 0) {
    parts.push(`The symbols in this dream (${symbols.slice(0, 3).map(s => s.symbol).join(', ')}) are not random selections. Your subconscious curated them specifically for you, from your specific life, at this specific moment.`);
  }

  if (!archetype) {
    if (input.dreamType === 'prophetic') {
      parts.push('Dreams that feel prophetic often tap into pattern recognition your conscious mind has not caught up with. Your intuition is reading the trajectory before your logic can.');
    } else if (input.dreamType === 'visitation') {
      parts.push('Visitation dreams carry a different quality: vivid, emotionally clear, and often more real than waking life. If this felt like a genuine encounter, trust that feeling.');
    }

    const emotionClose = input.emotions.length > 0
      ? `Honor the ${input.emotions[0]} this dream brought up: it is not a symptom to fix, it is information to use.`
      : 'Sit with what this dream stirred in you. The residual feeling is the message distilled to its purest form.';
    parts.push(emotionClose);
  }

  if (parts.length === 0) {
    parts.push('This dream chose you for a reason. The images will fade, but the feeling it left behind is the part worth keeping: let it guide you.');
  }

  return parts.join(' ');
}

function dreamOrdinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  const last = n % 10;
  if (last === 1) return `${n}st`;
  if (last === 2) return `${n}nd`;
  if (last === 3) return `${n}rd`;
  return `${n}th`;
}

// ── Astrological connection (kept separate for dedicated section) ─

function buildAstrologicalConnection(astrology: DreamAstrologyContext | null): string {
  if (!astrology || !astrology.natalMoonSign) {
    return 'Your astrological dream profile will appear here once your natal chart is connected. When active, Dream Oracle will cross-reference your dream symbols with your Moon sign, 12th house planets, Neptune placement, current transits, and progressed Moon: revealing why you dream what you dream, when you dream it.';
  }

  const parts: string[] = [];
  parts.push(`Your natal Moon in ${astrology.natalMoonSign}${astrology.natalMoonHouse ? ` (${dreamOrdinal(astrology.natalMoonHouse)} house)` : ''} shapes how you process dreams; it filters your unconscious through ${astrology.natalMoonSign} themes.`);

  if (astrology.twelfthHousePlanets && astrology.twelfthHousePlanets.length > 0) {
    parts.push(`Planets in your 12th house (${astrology.twelfthHousePlanets.join(', ')}) are permanent residents of your dream world. They color every dream you have.`);
  }
  if (astrology.neptune) {
    parts.push(`With Neptune in ${astrology.neptune.sign} in house ${astrology.neptune.house}, your dreams run vivid and strange, and you often know something before you can explain how.`);
  }
  if (astrology.pluto) {
    parts.push(`Pluto in ${astrology.pluto.sign} (house ${astrology.pluto.house}) sets how deep and how heavy your dreams run.`);
  }
  if (astrology.currentMoonSign) {
    parts.push(`Tonight's Moon in ${astrology.currentMoonSign}${astrology.currentMoonPhase ? ` (${astrology.currentMoonPhase})` : ''} flavors the emotional texture of what you dreamed.`);
  }
  if (astrology.progressedMoonSign) {
    parts.push(`Your progressed Moon in ${astrology.progressedMoonSign} reveals the longer emotional chapter you are living through: this dream is part of that arc.`);
  }

  return parts.join(' ');
}

// ── Why Now ──────────────────────────────────────────────────────

function buildWhyNow(input: DreamInput, astrology: DreamAstrologyContext | null): string {
  const parts: string[] = [];

  if (input.intensityScore >= 8) {
    parts.push('The intensity of this dream tells you it is not new material: it has been building. Your psyche chose now because the pressure reached a threshold.');
  } else if (input.intensityScore >= 5) {
    parts.push('This dream arrived because something in your recent waking life activated the pattern it describes: a conversation, a decision, a feeling you brushed past.');
  } else {
    parts.push('Low-intensity dreams are precise rather than loud. Something small but specific in your recent life triggered this: a moment you may have dismissed but your subconscious did not.');
  }

  if (input.dreamType === 'recurring') {
    parts.push('A recurring dream means the trigger is not a single event: it is a pattern in your life that keeps recreating the same emotional conditions. The dream tends to ease when the pattern does.');
  }

  if (astrology) {
    if (astrology.currentMoonPhase) {
      const phase = astrology.currentMoonPhase.toLowerCase();
      if (phase.includes('full')) {
        parts.push('The full moon amplifies emotional intensity and brings hidden material to the surface. Dreams around a full moon tend to feel more vivid.');
      } else if (phase.includes('new')) {
        parts.push('New moons are seed phases: this dream may contain the embryo of something that will unfold over the coming lunar cycle.');
      }
    }
    if (astrology.activeTransits && astrology.activeTransits.length > 0) {
      parts.push(`Active transits (${astrology.activeTransits.slice(0, 3).join('; ')}) are stirring the same themes this dream explores. The timing is worth noticing.`);
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
    questions.push(`What quality of ${input.people[0]}'s do you carry, or wish you carried? Is it something you need more of, or something you need to put down?`);
  }

  if (archetype) {
    if (archetype === DREAM_ARCHETYPES.chase) {
      questions.push('If you stopped running in the dream and turned around: what do you think you would see?');
    } else if (archetype === DREAM_ARCHETYPES.teeth) {
      questions.push('What have you said recently, or failed to say, that is still sitting in your body?');
    } else if (archetype === DREAM_ARCHETYPES.ex) {
      questions.push('What version of yourself existed in that relationship that no longer exists now? Do you miss that version, or are you relieved they are gone?');
    } else if (archetype === DREAM_ARCHETYPES.house) {
      questions.push('If your dream house is a map of your inner world, which room were you drawn to, and which did you avoid?');
    }
  }

  if (input.dreamType === 'nightmare') {
    questions.push('What is the worst thing that happens if the nightmare scenario comes true, and what is the worst thing that happens if you keep avoiding what it represents?');
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
    items.push(`Real-world appearances of ${names}: synchronicities are the waking world echoing what the dream revealed`);
  }

  if (input.emotions.includes('fear') || input.emotions.includes('anxiety')) {
    items.push('Moments where the same fear surfaces during the day: that is the bridge between your dream self and your waking self');
  }

  if (input.emotions.includes('love') || input.emotions.includes('bliss') || input.emotions.includes('peace')) {
    items.push('Moments of unexpected warmth or calm: the dream may have opened a channel that continues to flow');
  }

  if (input.dreamType === 'prophetic') {
    items.push('Events that echo the dream\'s scenario: note them when they occur, even if the connection seems loose');
  }

  items.push('Dreams tonight and tomorrow: dreams often arrive in sequences, and the next one may complete what this one started');

  return 'In the coming days, pay attention to: ' + items.join('; ') + '.';
}

// ── What to do ───────────────────────────────────────────────────

function buildWhatToDo(input: DreamInput): string {
  const actions: string[] = [];

  actions.push('Write this dream down in full detail: the act of writing anchors the message and prevents it from dissolving');

  if (input.intensityScore >= 7) {
    actions.push('Sit with this dream for a few minutes before starting your day: high-intensity dreams need space before the conscious mind takes over');
  }

  if (input.emotions.includes('fear') || input.emotions.includes('anger') || input.emotions.includes('grief') || input.emotions.includes('sadness')) {
    actions.push('Let yourself feel what the dream brought up without judging it: the emotion is information, not a problem to solve');
  }

  if (input.dreamType === 'lucid') {
    actions.push('Before sleeping tonight, set an intention to return to this dream: your lucid capacity gives you the ability to go deeper');
  }

  if (input.dreamType === 'visitation') {
    actions.push('Speak to the person who visited: out loud, in a journal, or silently. Say what was left unsaid');
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
