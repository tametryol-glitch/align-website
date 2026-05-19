export type ZodiacSign =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

export type PlanetKey =
  | 'Ascendant'
  | 'Sun'
  | 'Moon'
  | 'Mercury'
  | 'Venus'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn'
  | 'Uranus'
  | 'Neptune'
  | 'Pluto'
  | 'Vesta'
  | 'Juno'
  | 'Chiron'
  | 'Lilith'
  | 'North Node'
  | 'South Node';

export type MajorNodeAspect = 'conjunction' | 'square' | 'opposition' | 'trine';
export type ChoicePath = 'comfort' | 'shadow' | 'purpose' | 'neutral' | 'risk';
export type ContractStatus = 'open' | 'strained' | 'failed' | 'healed';

export interface ChartPlacement {
  name: string;
  sign?: string;
  house?: number;
  degree?: number;
  longitude?: number;
  retrograde?: boolean;
  aspects?: ChartAspect[];
}

export interface ChartAspect {
  planet1: string;
  planet2: string;
  type: string;
  orb?: number;
  lon1?: number;
  lon2?: number;
}

export interface SoulAscensionChartInput {
  placements?: ChartPlacement[];
  planets?: ChartPlacement[];
  aspects?: ChartAspect[];
  houses?: Array<{ house: number; sign?: string; longitude?: number; degree?: number }>;
  ascendant?: string | number | ChartPlacement;
  sun?: ChartPlacement;
  moon?: ChartPlacement;
  northNode?: ChartPlacement;
  southNode?: ChartPlacement;
}

export interface NormalizedPlacement {
  name: PlanetKey;
  sign: ZodiacSign;
  house: number;
  degree: number;
  longitude: number;
  retrograde: boolean;
}

export interface NormalizedNodeAspect {
  planet: PlanetKey;
  node: 'North Node' | 'South Node';
  type: MajorNodeAspect;
  orb: number;
}

export interface NormalizedChart {
  placements: Record<PlanetKey, NormalizedPlacement>;
  aspects: ChartAspect[];
  nodeAspects: NormalizedNodeAspect[];
  source: 'user' | 'demo';
  signature: string;
}

export interface SoulContract {
  id: string;
  contractType: string;
  recurringSoulName: string;
  currentRole: string;
  emotionalWound: string;
  lesson: string;
  temptation: string;
  purposeChoice: string;
  failedOutcome: string;
  healedOutcome: string;
  nextLifetimeReturn: string;
  status: ContractStatus;
}

export interface SoulScar {
  id: string;
  name: string;
  source: string;
  intensity: number;
  shadowPhrase: string;
  transformedGift: string;
  status: 'active' | 'healing' | 'healed';
}

export interface SoulRelic {
  id: string;
  name: string;
  memory: string;
  benefit: string;
  unlocked: boolean;
}

export interface ProphecyCard {
  id: string;
  title: string;
  message: string;
  trigger: string;
  unlocked: boolean;
}

export interface SoulChoice {
  id: string;
  text: string;
  path: ChoicePath;
  emotionalCost: string;
  immediateResult: string;
  consequenceText: string;
  effects: ScoreDelta;
}

export interface ChapterMission {
  id: string;
  chapterNumber: number;
  title: string;
  chapterType:
    | 'origin_wound'
    | 'gift_awakening'
    | 'relationship_test'
    | 'shadow_confrontation'
    | 'purpose_choice';
  storyScene: string;
  emotionalSetup: string;
  choices: SoulChoice[];
}

export interface SoulEnding {
  id: string;
  type:
    | 'Repeated Karma Ending'
    | 'Shadow Victory Ending'
    | 'Partial Growth Ending'
    | 'Purpose Fulfilled Ending'
    | 'Soul Contract Healed Ending'
    | 'Sacrifice Ending'
    | 'Liberation Ending'
    | 'Mastery Ending';
  title: string;
  description: string;
  unlockRule: string;
}

export interface SoulProfile {
  soulArchetype: string;
  avatarName: string;
  avatarAppearance: string;
  emotionalNature: string;
  strengths: string[];
  weaknesses: string[];
  hiddenGift: string;
  pastLifePattern: string;
  futurePurpose: string;
  emotionalWound: string;
  coreGift: string;
  mainTemptation: string;
  mainFear: string;
  relationshipPattern: string;
  careerOrRolePattern: string;
  shadowPattern: string;
  missionStyle: string;
  lifetimeTitle: string;
  incarnationReveal: string;
  lifetimeSetting: string;
  mainConflict: string;
  mainPurpose: string;
  soulScar: SoulScar;
  soulContracts: SoulContract[];
  relics: SoulRelic[];
  prophecyCards: ProphecyCard[];
  difficultyCurve: string[];
  chapterMissions: ChapterMission[];
  possibleEndings: SoulEnding[];
  nodeAspectStoryModifiers: string[];
}

export interface ScoreState {
  karma: number;
  purpose: number;
  shadow: number;
  relationship: number;
  giftMastery: number;
  soulScarIntensity: number;
  futureLifetimeDifficulty: number;
}

export type ScoreDelta = Partial<ScoreState> & {
  soulXp?: number;
  purposeXp?: number;
  shadowIntegration?: number;
};

export interface ChoiceRecord {
  missionId: string;
  choiceId: string;
  path: ChoicePath;
  effects: ScoreDelta;
  consequenceText: string;
}

export interface MissionResolution {
  mission: ChapterMission;
  choice: SoulChoice;
  scoresAfter: ScoreState;
  unlockedRelic?: SoulRelic;
  unlockedProphecy?: ProphecyCard;
  contractStatus: ContractStatus;
  soulScarStatus: SoulScar['status'];
  continueLabel: string;
}

export interface SoulReview {
  learned: string[];
  repeated: string[];
  mastered: string[];
  unresolved: string[];
  contractResult: string;
  scarResult: string;
  giftAwakened: string;
  ending: SoulEnding;
  ascensionLevelGained: number;
  nextLifetimePreview: string;
}

export interface SoulCodex {
  pastLives: string[];
  soulLessons: string[];
  karmicPatterns: string[];
  soulScars: SoulScar[];
  healedScars: SoulScar[];
  gifts: string[];
  relationshipContracts: SoulContract[];
  prophecyCards: ProphecyCard[];
  soulRelics: SoulRelic[];
  memoryFragments: string[];
}

export interface SoulAscensionGameState {
  version: 1;
  chart: NormalizedChart;
  profile: SoulProfile;
  scores: ScoreState;
  currentChapterIndex: number;
  ascensionLevel: number;
  lifetimeIndex: number;
  soulXp: number;
  purposeXp: number;
  shadowIntegration: number;
  choiceHistory: ChoiceRecord[];
  completedMissionIds: string[];
  lastResolution?: MissionResolution;
  soulReview?: SoulReview;
  codex: SoulCodex;
  phase: 'home' | 'avatar' | 'lifetime' | 'mission' | 'review' | 'codex' | 'portal';
  createdAt: string;
  updatedAt: string;
}

export interface ReincarnationContext {
  lifetimeIndex?: number;
  ascensionLevel?: number;
  unresolvedScar?: SoulScar;
  failedContract?: SoulContract;
  previousScores?: ScoreState;
}
