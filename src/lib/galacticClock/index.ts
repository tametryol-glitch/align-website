export {
  RULERS, CYCLE_DAYS, CUSTOM_CYCLE_EPOCH, RULER_MEANINGS,
  SEGMENT_ANGLE, TOTAL_RULERS, MINUTES_PER_MINUTE_LORD,
  SECONDS_PER_PULSE_LORD,
} from './constants';
export type { RulerName, CycleDayName } from './constants';

export type {
  GalacticSignature, GalacticDayName, GalacticAngles,
  RulerMeaning, InterpretationResult, WheelSegment,
  CountdownData, ClockMode, SunTimes, AstronomicalSegment,
} from './types';

export {
  getCustomCycleDay, getDayLord, getHourLord, getMinuteLord, getPulseLord,
  getGalacticSignature, getClockAngles, getInterpretation, getRulerSequence,
  formatCountdown, getNextTransitions,
  getFullGalacticSignature, getOuterRingSegments,
  getMinuteRingSegments, getPulseRingSegments,
  getSecondsUntilNextPulse, getSecondsUntilNextMinuteLord,
  getSecondsUntilNextHourLord, getCountdownData,
  calculateSunTimes, isDaytime,
  getHourLordAstronomical, getHourLordAstronomicalFull,
  getMinuteLordAstronomical, getPulseLordAstronomical,
  getGalacticSignatureUnified, getClockAnglesUnified,
  getNextTransitionsUnified, formatDuration, formatSunTime,
} from './utils';

export {
  RULER_FULL_MEANINGS, getBestUseTags, getSignatureInterpretation,
} from './interpretation';

export { getHourMinuteInterpretation } from './interpretations144';
export type { HourMinuteInterpretation } from './interpretations144';
