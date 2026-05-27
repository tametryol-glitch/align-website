/**
 * Aura Mirror — TypeScript interfaces for the entire feature.
 *
 * These types define the contract between services, components, and screens.
 * All fields are carefully optional where data might be missing (no birth time,
 * no camera, no mic, etc.) so the system gracefully degrades.
 */

// ── Scan Modes ──────────────────────────────────────────────────────

export type AuraScanMode =
  | 'picture'
  | 'video'
  | 'voice'
  | 'deep'         // all inputs combined
  | 'relationship'
  | 'forecast';

export type AuraTier = 'free' | 'light' | 'premium' | 'pro';

// ── Data Source Tracking ────────────────────────────────────────────

export interface AuraDataSources {
  picture_used: boolean;
  video_used: boolean;
  voice_used: boolean;
  mood_used: boolean;
  life_area_used: boolean;
  astrology_used: boolean;
  numerology_used: boolean;
  journal_history_used: boolean;
}

// ── Picture / Selfie Scan ───────────────────────────────────────────

export interface PictureScanResult {
  scanConfidence: number;       // 0–1
  visibleTensionScore: number;  // 0–1
  visibleEnergyScore: number;   // 0–1
  emotionalExpression: EmotionalExpression;
  lightingQuality: 'good' | 'fair' | 'poor';
  photoUsable: boolean;
  suggestedAuraInfluence: AuraColorName;
  imageUri?: string;            // local URI of the captured/picked photo
}

export type EmotionalExpression =
  | 'calm'
  | 'tense'
  | 'bright'
  | 'tired'
  | 'neutral'
  | 'intense'
  | 'soft'
  | 'guarded';

// ── Video Scan (Phase 1 = placeholder structure) ────────────────────

export interface VideoScanResult {
  scanDuration: number;         // seconds
  scanConfidence: number;       // 0–1
  movementScore: number;        // 0–1 stillness→restless
  expressionStability: number;  // 0–1
  visibleFatigue: number;       // 0–1
  emotionalSteadiness: number;  // 0–1
  suggestedAuraInfluence: AuraColorName;
}

// ── Voice Scan (Phase 1 = placeholder structure) ────────────────────

export interface VoiceScanResult {
  scanDuration: number;         // seconds
  scanConfidence: number;       // 0–1
  toneScore: number;            // 0–1 low→high energy
  paceScore: number;            // 0–1 slow→fast
  pauseFrequency: number;       // 0–1
  intensityScore: number;       // 0–1
  emotionalTone: VoiceEmotionalTone;
  suggestedAuraInfluence: AuraColorName;
  transcribedText?: string;
  audioUri?: string;
}

export type VoiceEmotionalTone =
  | 'calm'
  | 'pressured'
  | 'excited'
  | 'sad'
  | 'angry'
  | 'hesitant'
  | 'confident'
  | 'soft'
  | 'urgent';

// ── Mood Check-in ───────────────────────────────────────────────────

export type MoodOption =
  | 'calm'
  | 'heavy'
  | 'excited'
  | 'anxious'
  | 'drained'
  | 'romantic'
  | 'angry'
  | 'confused'
  | 'inspired'
  | 'lonely'
  | 'powerful'
  | 'spiritually_sensitive'
  | 'unknown';

export type LifeAreaOption =
  | 'love'
  | 'money'
  | 'family'
  | 'career'
  | 'body'
  | 'friendships'
  | 'spirituality'
  | 'purpose'
  | 'anxiety'
  | 'sexual_energy'
  | 'creativity'
  | 'grief'
  | 'confidence';

// ── Aura Colors ─────────────────────────────────────────────────────

export type AuraColorName =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'white'
  | 'gold'
  | 'pink'
  | 'gray'
  | 'black';

export interface AuraColorScore {
  color: AuraColorName;
  score: number;          // 0–100
  hex: string;            // display hex
  label: string;          // human-readable name
}

// ── Chakra ───────────────────────────────────────────────────────────

export type ChakraName =
  | 'root'
  | 'sacral'
  | 'solar_plexus'
  | 'heart'
  | 'throat'
  | 'third_eye'
  | 'crown';

export interface ChakraReading {
  chakra: ChakraName;
  label: string;
  status: 'open' | 'blocked' | 'overactive' | 'balanced';
  description: string;
}

// ── Astrology Context ───────────────────────────────────────────────

export interface AuraAstroContext {
  sunSign?: string;
  sunHouse?: number;
  moonSign?: string;
  moonHouse?: number;
  risingSign?: string;
  chartRuler?: string;
  chartRulerSign?: string;
  // Houses of interest for aura
  house1Sign?: string;
  house4Sign?: string;
  house6Sign?: string;
  house8Sign?: string;
  house12Sign?: string;
  // Current sky
  currentMoonSign?: string;
  currentMoonPhase?: string;
  currentMoonPhaseName?: string;
  // Transit pressures (0–1 intensity)
  marsActivity?: number;
  saturnPressure?: number;
  neptuneSensitivity?: number;
  venusInfluence?: number;
  jupiterInfluence?: number;
  plutoTransformation?: number;
  vestaDevotion?: number;
  junoRelationship?: number;
  // Summary
  dominantTransitTheme?: string;
  hasBirthTime: boolean;
  hasChartData: boolean;
}

// ── Numerology Context ──────────────────────────────────────────────

export interface AuraNumerologyContext {
  lifePathNumber?: number;
  lifePathDisplay?: string;
  personalYear?: number;
  personalYearDisplay?: string;
  birthdayNumber?: number;
}

// ── Combined Aura Input ─────────────────────────────────────────────

export interface AuraInput {
  mode: AuraScanMode;
  pictureScan?: PictureScanResult;
  videoScan?: VideoScanResult;
  voiceScan?: VoiceScanResult;
  mood?: MoodOption;
  lifeArea?: LifeAreaOption;
  astroContext?: AuraAstroContext;
  numerologyContext?: AuraNumerologyContext;
  dataSources: AuraDataSources;
}

// ── Aura Reading Result ─────────────────────────────────────────────

export interface AuraReadingResult {
  id: string;
  createdAt: string;
  mode: AuraScanMode;
  // Colors
  outerAura: AuraColorScore;
  innerAura: AuraColorScore;
  emotionalCore: AuraColorScore;
  allColorScores: AuraColorScore[];
  // Chakra
  chakraFocus: ChakraReading;
  // Interpretive
  dominantPlanet?: string;
  dominantTransit?: string;
  emotionalTheme: string;
  spiritualMessage: string;
  practicalAction: string;
  auraForecast: string;       // 24-72 hour
  scanConfidence: number;     // 0–1 overall
  // Reading sections (for Deep Reading display)
  sections: AuraReadingSection[];
  // Meta
  dataSources: AuraDataSources;
  mood?: MoodOption;
  lifeArea?: LifeAreaOption;
  // Disclaimer
  disclaimer: string;
}

export interface AuraReadingSection {
  title: string;
  content: string;
  icon?: string;
}

// ── Aura Journal Entry ──────────────────────────────────────────────

export interface AuraJournalEntry {
  id: string;
  userId: string;
  scanDate: string;
  scanType: AuraScanMode;
  outerAuraColor: AuraColorName;
  outerAuraHex: string;
  innerAuraColor: AuraColorName;
  innerAuraHex: string;
  emotionalCoreColor: AuraColorName;
  emotionalCoreHex: string;
  chakraFocus: ChakraName;
  mood?: MoodOption;
  lifeArea?: LifeAreaOption;
  moonSign?: string;
  moonPhase?: string;
  transitHighlights?: string;
  readingSummary: string;
  fullReading?: string;          // JSON-serialized full reading
  dataSources: AuraDataSources;
  imageUri?: string;             // saved photo (only if user consents)
  createdAt: string;
}

// ── Privacy Settings ────────────────────────────────────────────────

export interface AuraPrivacySettings {
  saveScans: boolean;
  savePhotos: boolean;
  saveVoiceRecordings: boolean;
  saveInterpretationsOnly: boolean;
  showAuraBadgeInDating: boolean;
  allowAuraSharing: boolean;
  auraHistoryPrivate: boolean;
  // Dating visibility
  datingAuraVisibility: DatingAuraVisibility;
}

export type DatingAuraVisibility =
  | 'private_only'
  | 'color_only'
  | 'mood_badge'
  | 'full_reading_matches'
  | 'after_mutual_match'
  | 'never';

// ── Relationship Aura (future) ──────────────────────────────────────

export interface RelationshipAuraResult {
  personAOuterAura: AuraColorScore;
  personBOuterAura: AuraColorScore;
  auraChemistryScore: number;
  emotionalSafetyScore: number;
  attractionHeat: number;
  communicationField: number;
  conflictWeather: number;
  bestApproach: string;
}

// ── Dating Aura Badge ───────────────────────────────────────────────

export type AuraBadge =
  | 'open_heart'
  | 'deep_thinker'
  | 'romantic_active'
  | 'gentle_approach'
  | 'magnetic_today'
  | 'emotionally_guarded'
  | 'high_passion'
  | 'healing_mode'
  | 'social_glow'
  | 'private_energy';

export interface AuraBadgeResult {
  badge: AuraBadge;
  label: string;
  emoji: string;
}
