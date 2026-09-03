export interface CityData {
  name: string;
  country: string;
  /** Optional state / province / region for disambiguation (e.g. "Illinois") */
  region?: string;
  lat: number;
  lon: number;
  /**
   * Optional population. Used to break ties between same-name cities
   * (e.g. Dallas, TX = 1.3M vs Dallas, GA = 14k).
   */
  population?: number;
}
