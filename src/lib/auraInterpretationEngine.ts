/**
 * Aura Mirror — Interpretation Engine
 *
 * Generates the full aura reading text. Two modes:
 *   1. Template-based (instant, offline) — always available as fallback
 *   2. AI-powered (streaming via /ai/interpret) — richer, personalized
 *
 * The template engine is NOT a random generator. It uses the scored
 * color data, astrology context, mood, and life area to compose a
 * reading that feels specific and personal.
 */

import { AURA_COLORS, CHAKRA_DEFS, AURA_DISCLAIMER } from '@/lib/auraColors';
import { api } from '@/lib/api';
import type {
  AuraInput,
  AuraReadingResult,
  AuraReadingSection,
  AuraColorScore,
  ChakraReading,
  AuraColorName,
  MoodOption,
  LifeAreaOption,
} from '@/types/aura';

// ── Template-Based Reading ──────────────────────────────────────────

/**
 * Generate a full reading using templates. No network required.
 * This is the fallback if AI streaming fails.
 */
export function generateTemplateReading(
  input: AuraInput,
  outerAura: AuraColorScore,
  innerAura: AuraColorScore,
  emotionalCore: AuraColorScore,
  chakraFocus: ChakraReading,
  scanConfidence: number,
): Omit<AuraReadingResult, 'id' | 'createdAt'> {
  const sections: AuraReadingSection[] = [];

  // 1. Aura Summary
  sections.push({
    title: 'Aura Summary',
    icon: '✨',
    content: buildSummary(outerAura, innerAura, emotionalCore, input),
  });

  // 2. Outer Aura
  sections.push({
    title: 'Your Outer Aura',
    icon: '🔆',
    content: buildOuterAuraText(outerAura, input),
  });

  // 3. Inner Aura
  sections.push({
    title: 'Your Inner Aura',
    icon: '💎',
    content: buildInnerAuraText(innerAura, outerAura, input),
  });

  // 4. Emotional Core
  sections.push({
    title: 'Your Emotional Core',
    icon: '🫀',
    content: buildEmotionalCoreText(emotionalCore, input),
  });

  // 5. Chakra Focus
  sections.push({
    title: `Chakra Focus: ${chakraFocus.label}`,
    icon: '🧘',
    content: chakraFocus.description,
  });

  // 6. What Your Energy Is Carrying
  sections.push({
    title: 'What Your Energy Is Carrying',
    icon: '🌊',
    content: buildEnergyCarryingText(outerAura, innerAura, emotionalCore, input),
  });

  // 7. Cosmic Influence
  if (input.astroContext && input.dataSources.astrology_used) {
    sections.push({
      title: 'Cosmic Influence',
      icon: '🌙',
      content: buildCosmicInfluenceText(input),
    });
  }

  // 8. What You Should Do With This Energy
  sections.push({
    title: 'What To Do With This Energy',
    icon: '🎯',
    content: buildActionText(outerAura, innerAura, input),
  });

  // 9. What To Watch For
  sections.push({
    title: 'What To Watch For',
    icon: '⚡',
    content: buildWatchForText(outerAura, emotionalCore, input),
  });

  // 10. Aura Forecast
  sections.push({
    title: '24-72 Hour Aura Forecast',
    icon: '🔮',
    content: buildForecastText(outerAura, input),
  });

  // Determine dominant planet
  const dominantPlanet = input.astroContext?.dominantTransitTheme?.split(' ')[0] || undefined;

  return {
    mode: input.mode,
    outerAura,
    innerAura,
    emotionalCore,
    allColorScores: [], // will be set by caller
    chakraFocus,
    dominantPlanet,
    dominantTransit: input.astroContext?.dominantTransitTheme,
    emotionalTheme: getEmotionalTheme(outerAura, innerAura, input.mood),
    spiritualMessage: buildSpiritualMessage(outerAura, emotionalCore, input),
    practicalAction: buildPracticalAction(outerAura, input),
    auraForecast: buildForecastText(outerAura, input),
    scanConfidence,
    sections,
    dataSources: input.dataSources,
    mood: input.mood,
    lifeArea: input.lifeArea,
    disclaimer: AURA_DISCLAIMER,
  };
}

// ── AI-Powered Reading ──────────────────────────────────────────────

/**
 * Build the prompt for the AI interpretation engine.
 * Sends to the existing /ai/interpret endpoint.
 */
export function buildAuraAIPrompt(
  input: AuraInput,
  outerAura: AuraColorScore,
  innerAura: AuraColorScore,
  emotionalCore: AuraColorScore,
  chakraFocus: ChakraReading,
): { prompt: string; context: string } {
  const parts: string[] = [];

  parts.push('Generate a deep, personal Aura Mirror reading for this user.');
  parts.push('');
  parts.push('AURA SCAN RESULTS:');
  parts.push(`- Outer Aura: ${outerAura.label} (${outerAura.color}, score: ${outerAura.score})`);
  parts.push(`- Inner Aura: ${innerAura.label} (${innerAura.color}, score: ${innerAura.score})`);
  parts.push(`- Emotional Core: ${emotionalCore.label} (${emotionalCore.color}, score: ${emotionalCore.score})`);
  parts.push(`- Chakra Focus: ${chakraFocus.label} (${chakraFocus.status})`);

  if (input.mood) {
    parts.push(`- User Mood: ${input.mood.replace('_', ' ')}`);
  }
  if (input.lifeArea) {
    parts.push(`- Life Area Focus: ${input.lifeArea.replace('_', ' ')}`);
  }

  if (input.astroContext && input.dataSources.astrology_used) {
    const ac = input.astroContext;
    parts.push('');
    parts.push('ASTROLOGY CONTEXT (from user\'s existing birth chart):');
    if (ac.sunSign) parts.push(`- Sun: ${ac.sunSign}${ac.sunHouse ? ` (House ${ac.sunHouse})` : ''}`);
    if (ac.moonSign) parts.push(`- Moon: ${ac.moonSign}${ac.moonHouse ? ` (House ${ac.moonHouse})` : ''}`);
    if (ac.risingSign) parts.push(`- Rising: ${ac.risingSign}`);
    if (ac.currentMoonSign) parts.push(`- Current Moon: ${ac.currentMoonSign}`);
    if (ac.currentMoonPhase) parts.push(`- Moon Phase: ${ac.currentMoonPhase}`);
    if (ac.dominantTransitTheme) parts.push(`- Dominant Transit: ${ac.dominantTransitTheme}`);
    if (!ac.hasBirthTime) parts.push('- Note: User does not have birth time, house positions are approximate');
  }

  if (input.numerologyContext && input.dataSources.numerology_used) {
    const nc = input.numerologyContext;
    parts.push('');
    parts.push('NUMEROLOGY:');
    if (nc.lifePathDisplay) parts.push(`- Life Path: ${nc.lifePathDisplay}`);
    if (nc.personalYearDisplay) parts.push(`- Personal Year: ${nc.personalYearDisplay}`);
  }

  // Data sources used
  const sources: string[] = [];
  if (input.dataSources.picture_used) sources.push('photo scan');
  if (input.dataSources.video_used) sources.push('video scan');
  if (input.dataSources.voice_used) sources.push('voice scan');
  if (input.dataSources.mood_used) sources.push('mood check-in');
  if (input.dataSources.astrology_used) sources.push('birth chart + transits');
  if (input.dataSources.numerology_used) sources.push('numerology');
  parts.push('');
  parts.push(`DATA SOURCES USED: ${sources.join(', ')}`);

  const context = parts.join('\n');

  const prompt = `You are the Aura Mirror — a symbolic energetic self-reflection engine inside the Align astrology app.

WRITING RULES:
- Write in second person ("you", "your")
- Be direct, emotional, spiritual, and personal
- Do NOT use generic horoscope language
- Do NOT diagnose medical/mental health conditions
- Use language like "your scan suggests", "your energy may be carrying", "your aura pattern reflects"
- Do NOT define colors — interpret what they MEAN for THIS person right now
- Make the reading feel like the app is reading their energy and life situation
- Be powerful but compassionate
- Each section should be 2-4 sentences

STRUCTURE (use these exact section headers with the emoji):
✨ Aura Summary
🔆 Your Outer Aura
💎 Your Inner Aura
🫀 Your Emotional Core
🧘 Chakra Focus
🌊 What Your Energy Is Carrying
🌙 Cosmic Influence
🎯 What To Do With This Energy
⚡ What To Watch For
🔮 24-72 Hour Aura Forecast

AURA COLOR MEANINGS TO REFERENCE:
- Red: passion, anger, survival, courage, sexuality, life force
- Orange: creativity, desire, attraction, pleasure, social magnetism
- Yellow: confidence, intellect, identity, nervous energy, overthinking
- Green: healing, love, money, growth, forgiveness, balance
- Blue: truth, communication, calm, sadness, emotional intelligence
- Indigo: intuition, dreams, psychic sensitivity, deep knowing
- Violet: spiritual awakening, transformation, mysticism, soul activation
- White: purification, reset, protection, clarity, cleansing
- Gold: success, purpose, leadership, divine confidence, visibility
- Pink: romance, tenderness, sweetness, affection, vulnerability
- Gray: stress, uncertainty, fog, heaviness, transition, mental overload
- Black/Dark: protection, shadow work, grief, depth, transformation, energetic defense (NOT evil)

Now generate the reading based on the scan data provided.`;

  return { prompt, context };
}

/**
 * Stream an AI-powered aura reading. Falls back to template if it fails.
 */
export async function streamAuraReading(
  input: AuraInput,
  outerAura: AuraColorScore,
  innerAura: AuraColorScore,
  emotionalCore: AuraColorScore,
  chakraFocus: ChakraReading,
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (error: Error) => void,
): Promise<void> {
  const { prompt, context } = buildAuraAIPrompt(
    input, outerAura, innerAura, emotionalCore, chakraFocus,
  );

  let fullText = '';

  try {
    await api.streamAIInterpretation(
      { prompt, context, language: 'en' },
      (chunk: string) => {
        fullText += chunk;
        onChunk(chunk);
      },
      () => {
        onDone(fullText);
      },
    );
  } catch (err: any) {
    console.warn('[AuraInterpretation] AI stream failed, using template:', err?.message);
    onError(err);
  }
}

/**
 * Parse AI response sections from the streamed text.
 */
export function parseAISections(fullText: string): AuraReadingSection[] {
  const sectionPatterns = [
    { icon: '✨', title: 'Aura Summary' },
    { icon: '🔆', title: 'Your Outer Aura' },
    { icon: '💎', title: 'Your Inner Aura' },
    { icon: '🫀', title: 'Your Emotional Core' },
    { icon: '🧘', title: 'Chakra Focus' },
    { icon: '🌊', title: 'What Your Energy Is Carrying' },
    { icon: '🌙', title: 'Cosmic Influence' },
    { icon: '🎯', title: 'What To Do With This Energy' },
    { icon: '⚡', title: 'What To Watch For' },
    { icon: '🔮', title: '24-72 Hour Aura Forecast' },
  ];

  const sections: AuraReadingSection[] = [];
  const lines = fullText.split('\n');

  let currentSection: AuraReadingSection | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Check if this line starts a new section
    const matchedPattern = sectionPatterns.find(
      (p) => trimmed.includes(p.title) || trimmed.includes(p.icon),
    );

    if (matchedPattern) {
      // Save previous section
      if (currentSection) {
        currentSection.content = currentContent.join('\n').trim();
        if (currentSection.content) sections.push(currentSection);
      }
      currentSection = { title: matchedPattern.title, icon: matchedPattern.icon, content: '' };
      currentContent = [];
      // If there's content after the header on the same line
      const afterHeader = trimmed
        .replace(matchedPattern.icon, '')
        .replace(matchedPattern.title, '')
        .replace(/^[:#\-*\s]+/, '')
        .trim();
      if (afterHeader) currentContent.push(afterHeader);
    } else if (currentSection && trimmed) {
      currentContent.push(trimmed);
    }
  }

  // Save last section
  if (currentSection) {
    currentSection.content = currentContent.join('\n').trim();
    if (currentSection.content) sections.push(currentSection);
  }

  return sections;
}

// ── Template Text Builders ──────────────────────────────────────────

function buildSummary(
  outer: AuraColorScore,
  inner: AuraColorScore,
  core: AuraColorScore,
  input: AuraInput,
): string {
  const outerDef = AURA_COLORS[outer.color];
  const innerDef = AURA_COLORS[inner.color];

  let text = `Your scan suggests a ${outerDef.label.toLowerCase()}-${innerDef.label.toLowerCase()} energy pattern. `;

  if (outer.color === inner.color) {
    text += `Your outer and inner fields are aligned — what you show to the world matches what you carry inside. This is a moment of energetic coherence.`;
  } else {
    text += `Your outer field radiates ${outerDef.keywords[0]}, but your inner energy is carrying something different — ${innerDef.keywords[0]}. There may be a gap between what you present and what you feel.`;
  }

  if (input.mood && input.mood !== 'unknown') {
    const moodLabel = input.mood.replace('_', ' ');
    text += ` Your check-in reflects ${moodLabel} energy, which your aura pattern confirms.`;
  }

  return text;
}

function buildOuterAuraText(outer: AuraColorScore, input: AuraInput): string {
  const def = AURA_COLORS[outer.color];
  let text = `Your outer aura is ${def.label.toLowerCase()}. This is the energy others feel when they are around you right now. `;
  text += `Your field appears to be projecting ${def.keywords.slice(0, 3).join(', ')}. `;

  if (input.astroContext?.sunSign) {
    text += `As a ${input.astroContext.sunSign}, this ${def.label.toLowerCase()} energy may be amplified or modulated by your natural solar expression.`;
  }
  return text;
}

function buildInnerAuraText(
  inner: AuraColorScore,
  outer: AuraColorScore,
  input: AuraInput,
): string {
  const innerDef = AURA_COLORS[inner.color];
  let text = `Your inner aura is ${innerDef.label.toLowerCase()}. This is the energy you carry beneath what you show the world. `;

  if (inner.color !== outer.color) {
    text += `The contrast between your outer ${AURA_COLORS[outer.color].label.toLowerCase()} and inner ${innerDef.label.toLowerCase()} suggests you may be holding something back or processing privately.`;
  } else {
    text += `Your inner and outer fields match, suggesting emotional transparency and alignment.`;
  }
  return text;
}

function buildEmotionalCoreText(core: AuraColorScore, input: AuraInput): string {
  const def = AURA_COLORS[core.color];
  let text = `At your emotional center, your energy reads as ${def.label.toLowerCase()}. `;
  text += `This points to ${def.keywords.slice(0, 2).join(' and ')} at the root of how you are feeling right now. `;

  if (input.lifeArea) {
    const area = input.lifeArea.replace('_', ' ');
    text += `Since you identified ${area} as where this energy is showing up, your core may be processing unresolved patterns in that area.`;
  }
  return text;
}

function buildEnergyCarryingText(
  outer: AuraColorScore,
  inner: AuraColorScore,
  core: AuraColorScore,
  input: AuraInput,
): string {
  const coreThemes = AURA_COLORS[core.color].keywords;
  let text = `Your energy field is carrying themes of ${coreThemes.slice(0, 3).join(', ')}. `;

  if (input.mood === 'heavy' || input.mood === 'drained' || input.mood === 'anxious') {
    text += 'Your check-in confirms that your system is under load. This is not a sign of weakness — it means your energy is processing something real. ';
  } else if (input.mood === 'inspired' || input.mood === 'powerful' || input.mood === 'excited') {
    text += 'Your check-in matches the vitality in your field. This is a window where action, expression, and creation will feel aligned with your deeper current. ';
  }

  if (inner.color !== outer.color) {
    text += `The split between your outer ${AURA_COLORS[outer.color].label.toLowerCase()} and inner ${AURA_COLORS[inner.color].label.toLowerCase()} suggests emotional complexity — you are holding more than one truth right now.`;
  }

  return text;
}

function buildCosmicInfluenceText(input: AuraInput): string {
  const ac = input.astroContext;
  if (!ac) return '';

  const parts: string[] = [];

  if (ac.currentMoonSign && ac.currentMoonPhase) {
    parts.push(`The Moon is currently in ${ac.currentMoonSign} (${ac.currentMoonPhase}), coloring the emotional atmosphere around you.`);
  }

  if (ac.dominantTransitTheme) {
    parts.push(`The dominant cosmic influence right now is ${ac.dominantTransitTheme}, which is actively shaping your energy field.`);
  }

  if (ac.sunSign && ac.moonSign) {
    parts.push(`Your ${ac.sunSign} Sun and ${ac.moonSign} Moon create a specific emotional baseline that today's transits are activating.`);
  }

  if (!ac.hasBirthTime) {
    parts.push('Adding your birth time would unlock house-level precision for a deeper cosmic aura reading.');
  }

  return parts.join(' ') || 'Your cosmic data adds depth to this reading. The current sky is working with your energy in subtle ways.';
}

function buildActionText(outer: AuraColorScore, inner: AuraColorScore, input: AuraInput): string {
  const actions: Record<AuraColorName, string> = {
    red: 'Move your body. Express what is building up inside. Confront what you have been avoiding. Channel this fire into something physical or creative.',
    orange: 'Create something. Connect with someone. Let yourself feel pleasure without guilt. This energy wants to flow outward.',
    yellow: 'Journal your thoughts. Organize what feels scattered. Speak up about what you know. Trust your intellect but give your mind a rest tonight.',
    green: 'Practice forgiveness — toward yourself first. Spend time in nature if you can. Let healing happen at its own pace.',
    blue: 'Say what you need to say. Write the message you have been holding back. Let yourself feel sad without trying to fix it.',
    indigo: 'Trust your intuition today. Pay attention to dreams, symbols, and quiet knowing. Do not override your gut feeling with logic.',
    violet: 'This is a spiritual activation moment. Meditate, pray, or sit in stillness. Something is trying to reach you from a deeper place.',
    white: 'Rest. Cleanse your space. Let go of something you have been carrying. This is a reset period — honor it.',
    gold: 'Step into visibility. Lead. Speak with authority. This is your moment to show what you are capable of.',
    pink: 'Open your heart. Be tender with yourself and others. This energy heals through softness, not strength.',
    gray: 'Do not push. Fog is temporary. Give yourself permission to not have all the answers right now. Rest is productive.',
    black: 'This is shadow work energy. Go inward. Process what is unresolved. Protect your boundaries. Not everything needs to be shared right now.',
  };

  return actions[outer.color] || actions.white;
}

function buildWatchForText(outer: AuraColorScore, core: AuraColorScore, input: AuraInput): string {
  const warnings: Record<AuraColorName, string> = {
    red: 'Watch for impulsive reactions, anger that feels disproportionate, or pushing too hard. Channel, do not suppress.',
    orange: 'Watch for overindulgence, attachment to attention, or scattering your energy across too many things at once.',
    yellow: 'Watch for overthinking, analysis paralysis, or seeking external validation when you already know the answer.',
    green: 'Watch for giving too much while receiving too little. Healing is not the same as self-sacrifice.',
    blue: 'Watch for emotional withdrawal disguised as calm. Silence can be wisdom, but it can also be avoidance.',
    indigo: 'Watch for psychic overwhelm, absorbing others\' emotions, or mistaking anxiety for intuition.',
    violet: 'Watch for spiritual bypassing — using higher meaning to avoid dealing with real-world emotions or responsibilities.',
    white: 'Watch for detachment. Purity is powerful, but disconnecting from messy human feelings is not the same as transcending them.',
    gold: 'Watch for ego inflation, overwork, or tying your self-worth to external achievement.',
    pink: 'Watch for people-pleasing, emotional over-attachment, or ignoring red flags because you want to believe in love.',
    gray: 'Watch for decision fatigue, emotional numbness, or staying in fog because clarity feels more frightening than uncertainty.',
    black: 'Watch for isolation disguised as protection, or grief that has not been given permission to move. Shadow work is not meant to be done alone forever.',
  };

  return warnings[outer.color] || warnings.white;
}

function buildForecastText(outer: AuraColorScore, input: AuraInput): string {
  const ac = input.astroContext;
  let text = '';

  if (ac?.currentMoonPhase?.includes('Waxing')) {
    text += 'The waxing Moon suggests your energy will build over the next few days. ';
  } else if (ac?.currentMoonPhase?.includes('Waning')) {
    text += 'The waning Moon suggests this energy will gradually release over the next few days. ';
  } else if (ac?.currentMoonPhase === 'Full Moon') {
    text += 'The Full Moon amplifies everything. Expect heightened emotions and clarity over the next 48 hours. ';
  } else if (ac?.currentMoonPhase === 'New Moon') {
    text += 'The New Moon invites a fresh start. Your aura may shift significantly in the next 72 hours. ';
  }

  const outerDef = AURA_COLORS[outer.color];
  text += `Your ${outerDef.label.toLowerCase()} aura energy may soften or deepen depending on how you engage with it. `;
  text += 'Check back in 24-72 hours to see how your field responds to the choices you make today.';

  return text;
}

function buildSpiritualMessage(
  outer: AuraColorScore,
  core: AuraColorScore,
  input: AuraInput,
): string {
  const messages: Record<AuraColorName, string> = {
    red: 'Your spirit is asking you to claim your space in this world. Do not apologize for wanting more.',
    orange: 'Your soul wants to create. Something inside you is ready to be born. Let it move through you.',
    yellow: 'You are being asked to trust your own knowing. The answer you seek is already inside you.',
    green: 'Healing is happening whether you feel it or not. Your energy is composting old pain into new growth.',
    blue: 'Your truth is ready to be spoken. The words may be uncomfortable, but they are necessary.',
    indigo: 'The veil is thin for you right now. Pay attention to what shows up in the quiet moments.',
    violet: 'You are in a spiritual expansion. Something larger than your daily life is moving through you.',
    white: 'You are being cleansed. Let go of what no longer serves your highest self.',
    gold: 'You are being called to lead. Your light is needed by others, but shine for yourself first.',
    pink: 'Love is not just something you give — it is something you deserve to receive without earning it.',
    gray: 'This fog is not permanent. Sometimes the soul needs to rest before the next revelation.',
    black: 'You are in the underworld phase. Trust the darkness. It is where transformation lives.',
  };

  return messages[core.color] || messages.white;
}

function buildPracticalAction(outer: AuraColorScore, input: AuraInput): string {
  return buildActionText(outer, outer as any, input);
}

function getEmotionalTheme(
  outer: AuraColorScore,
  inner: AuraColorScore,
  mood?: MoodOption,
): string {
  if (outer.color === inner.color) {
    return `Aligned ${AURA_COLORS[outer.color].keywords[0]}`;
  }
  return `${AURA_COLORS[outer.color].keywords[0]} meets ${AURA_COLORS[inner.color].keywords[0]}`;
}
