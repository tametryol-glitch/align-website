// Transit Midpoint Radar: types + small helpers shared by the Transits screen.
// The server (align-api-v2 /radar/scan) does all the astrology and writes all the words.

export interface RadarCard {
  formula: string;
  headline: string;
  causes: string;
  events: string[];
  secret: string;
  people: string[];
  signs: string[];
  trap: string;
  move: string;
  best: string;
  before: string;
  peak: string;
  after: string;
  trigger: { lasts: string; text: string };
  aspect_note: string;
  curated: boolean;
}

export type CallTier = 'bold' | 'likely' | 'recap';

export interface RadarCall {
  tier: CallTier;
  text: string;
  from: string;
  to: string;
  event: string;
}

export interface RadarHit {
  id: string;
  kind: 'midpoint' | 'planet';
  body: string;
  target: string; // "Venus/Mars" for a midpoint, "Venus" for a natal planet
  aspect: string;
  symbol: string;
  score: number;
  intensity: { level: string; why: string };
  retro: boolean;
  pass: [number, number] | null;
  exact: string | null;
  days_to_exact: number | null;
  applying: boolean;
  t_lon: number;
  mid_lon: number;
  houses: { mid: number | null; transit: number | null; a: [string | null, number | null]; b: [string | null, number | null] };
  where: string[];
  areas: string[];
  timing: string;
  card: string;
  call: RadarCall | null;
  orb?: number;
  sits_on?: { planet: string; orb: number; line: string };
  milestone?: string;
  label?: string | null; // set in the progressed chart: 'Saturn □ progressed Venus/Mars'
}

export interface RadarPoint {
  name: string;
  lon: number;
  sign: string;
  deg: number;
  house: number | null;
  retro: boolean;
}

export interface RadarVerdict {
  level: 'QUIET' | 'LIGHT' | 'MODERATE' | 'BUSY' | 'HEAVY';
  headline: string;
  line: string;
  areas: { key: string; label: string; weight: number }[];
  picks: string[];
}

export interface RadarArea {
  key: string;
  label: string;
  blurb: string;
  what: string; // what this area is in a life
  hot: string; // what it means when it runs hot
  move: string; // what to do
  level: 'Very hot' | 'Hot' | 'Warm' | 'Normal' | 'Cool' | 'Quiet';
  summary: string;
  score: number;
  ratio: number; // times a normal day
  count: number; // how many transits are hitting it
  hits: string[];
  drivers: { id: string; title: string; orb: number | null; exact: string | null; body: string }[];
  next_peak: { date: string; title: string; id: string } | null;
}

export interface ChainCard {
  name: string; sign: string; pos: string; house: number | null; retro: boolean;
  duad: string; duad_house: number | null; comp: string; comp_house: number | null; own_sign?: boolean;
}

export interface ChainHouse {
  house: number; domain: string; cusp: string; cusp_sign: string; ruler: string; hits: string[];
  ruler_card: ChainCard | null;
  chain: { steps: ChainCard[]; end: 'final' | 'loop' | 'missing'; loop: string[]; last: string } | null;
  midpoints: { hit: string; label: string; pos: string; house: number; conj: {
    orb: number; conjunct: boolean; ruler_in_pair: boolean; ruler_is_planet_on_point: boolean;
    other_links: { name: string; link: number; orb: number }[];
  } | null }[];
}

export interface ChainResponse {
  hits: { id: string; title: string; pos: string }[];
  houses: ChainHouse[];
  questions: string[];
  modes: Record<'events' | 'inner' | 'notes', string>;
}

export interface RadarResponse {
  meta: { as_of: string; days: number; orb: number; house_system: string; midpoints_scanned: number; chart_mode?: 'natal' | 'progressed' };
  natal: { asc: number; cusps: number[]; points: RadarPoint[] };
  sky: RadarPoint[];
  now: { verdict: RadarVerdict; hits: RadarHit[]; areas: RadarArea[] };
  upcoming: RadarHit[];
  cards: Record<string, RadarCard>;
}

export const RADAR_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  'North Node': '☊', Chiron: '⚷', 'Black Moon Lilith': '⚸',
  Juno: '⚵', Vesta: '⚶', Ceres: '⚳', Pallas: '⚴',
  Ascendant: 'AC', MC: 'MC',
};

export const SIGN_GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

export const BODY_COLORS: Record<string, string> = {
  Sun: '#FBBF24', Moon: '#E5E7EB', Mercury: '#67E8F9', Venus: '#F9A8D4', Mars: '#F87171',
  Jupiter: '#A78BFA', Saturn: '#9CA3AF', Uranus: '#38BDF8', Neptune: '#818CF8', Pluto: '#FB7185',
  'North Node': '#C4B5FD', Chiron: '#FCD34D', 'Black Moon Lilith': '#F472B6',
  Juno: '#F9A8D4', Vesta: '#FDBA74', Ceres: '#86EFAC', Pallas: '#93C5FD',
  Ascendant: '#E5E7EB', MC: '#E5E7EB',
};

export const LEVEL_COLORS: Record<string, string> = {
  QUIET: '#6B7280', LIGHT: '#3B82F6', MODERATE: '#10B981', BUSY: '#F59E0B', HEAVY: '#EF4444',
};

export const TIER_STYLE: Record<CallTier, { label: string; color: string }> = {
  bold: { label: 'Bold call', color: '#F59E0B' },
  likely: { label: 'Most likely', color: '#8B5CF6' },
  recap: { label: 'Looking back', color: '#6B7280' },
};

export function glyph(name: string): string {
  return RADAR_GLYPHS[name] || name.slice(0, 2);
}

export function bodyColor(name: string): string {
  return BODY_COLORS[name] || '#C4B5FD';
}

/** DD-MM-YYYY, always. Never YYYY-MM-DD in anything the user reads. */
export function fmtDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}-${mm}-${d.getUTCFullYear()}`;
}

export function fmtWhen(days: number | null | undefined): string {
  if (days == null) return 'no exact date';
  const a = Math.abs(days);
  if (a < 0.05) return 'exact now';
  const span =
    a < 1.5 ? `${Math.max(1, Math.round(a * 24))}h` :
    a < 14 ? `${Math.round(a)}d` :
    a < 90 ? `${Math.round(a / 7)}w` :
    `${Math.round(a / 30)}mo`;
  return days > 0 ? `in ${span}` : `${span} ago`;
}

export function targetLabel(h: Pick<RadarHit, 'kind' | 'target'>): string {
  return h.kind === 'midpoint' ? h.target : `your ${h.target}`;
}

export function hitTitle(h: RadarHit): string {
  if (h.label) return h.label;
  if (h.milestone) return `${h.milestone.replace(/^./, (c) => c.toUpperCase())}`;
  return `${h.body} ${h.symbol} ${targetLabel(h)}`;
}

export function houseOrd(n: number | null | undefined): string {
  if (!n) return '';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
