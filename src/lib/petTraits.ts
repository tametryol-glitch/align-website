// Chat Pet: deterministic creature design from a pair of user ids, plus
// stage + stat helpers. Pure — no React, no network.

export type PetStage = 0 | 1 | 2 | 3; // egg, baby, kid, teen

export const STAGE_NAMES = ['Egg', 'Baby', 'Kid', 'Teen'] as const;
export const STAGE_XP = [0, 60, 300, 800] as const;

export const SICK_MINUTES = 30;

export interface PetTraits {
  hue: number;
  hue2: number;
  ear: number; // 0 round,1 cat,2 bunny,3 horns,4 antennae,5 leaf
  pat: number; // 0 plain,1 spots,2 stripes,3 star,4 two-tone
  eye: number; // 0 round,1 sparkle,2 sleepy
  tail: number; // 0 curl,1 fluffy,2 tiny
  rare: boolean;
  nameSeed: number;
}

export interface PetRow {
  xp: number;
  fed: number;
  joy: number;
  stats_at: string;
  streak: number;
  streak_date: string | null;
  day_date: string;
  a_today: boolean;
  b_today: boolean;
  user_a: string;
  user_b: string;
  name: string | null;
  sick_until?: string | null;
}

const PET_NAMES = [
  'Pip', 'Mochi', 'Nova', 'Bean', 'Zuzu', 'Oli', 'Kiko', 'Luma',
  'Tito', 'Wisp', 'Fig', 'Poppy', 'Nimbus', 'Dot', 'Juno', 'Biscuit',
];

// Curated body hues: rose, red-orange, orange, gold, yellow, lime, green, mint,
// aqua, sky, blue, indigo, violet, magenta, pink. Spread evenly on purpose.
export const PALETTE_HUES = [350, 8, 24, 40, 54, 80, 130, 160, 180, 200, 218, 244, 270, 296, 322] as const;

/** FNV-1a with a murmur3 finalizer. Ids that share a prefix still avalanche apart. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h | 0;
}

export function makeRng(seed: number): () => number {
  let a = seed | 0;
  const next = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = 0; i < 4; i++) next(); // burn the weakest early outputs
  return next;
}

/** Order-independent: (a,b) and (b,a) always produce the same pet. */
export function pairKey(idA: string, idB: string): string {
  return [idA, idB].sort().join('|');
}

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
}

export function deriveTraits(idA: string, idB: string): PetTraits {
  const r = makeRng(hashString(pairKey(idA, idB)));
  const base = PALETTE_HUES[Math.floor(r() * PALETTE_HUES.length)];
  const hue = (base + Math.round(r() * 12 - 6) + 360) % 360;
  let hue2 = PALETTE_HUES[Math.floor(r() * PALETTE_HUES.length)];
  for (let i = 0; i < 8 && hueDistance(hue, hue2) < 60; i++) {
    hue2 = PALETTE_HUES[Math.floor(r() * PALETTE_HUES.length)];
  }
  return {
    hue,
    hue2,
    ear: Math.floor(r() * 6),
    pat: Math.floor(r() * 5),
    eye: Math.floor(r() * 3),
    tail: Math.floor(r() * 3),
    rare: r() > 0.85,
    nameSeed: Math.floor(r() * 1e6),
  };
}

export function defaultName(t: PetTraits): string {
  return PET_NAMES[t.nameSeed % PET_NAMES.length];
}

export function stageForXp(xp: number): PetStage {
  if (xp >= STAGE_XP[3]) return 3;
  if (xp >= STAGE_XP[2]) return 2;
  if (xp >= STAGE_XP[1]) return 1;
  return 0;
}

/** 0..1 progress toward the next stage (1 at the final stage). */
export function stageProgress(xp: number): number {
  const s = stageForXp(xp);
  if (s === 3) return 1;
  const lo = STAGE_XP[s];
  const hi = STAGE_XP[s + 1];
  return Math.min(1, Math.max(0, (xp - lo) / (hi - lo)));
}

export function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const hex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${hex(f(0))}${hex(f(8))}${hex(f(4))}`;
}

export function utcToday(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

// Decay model — keep identical to _pet_settle in the SQL.
//   fed:  -2.5 / hour
//   joy:  -2.5 / hour, plus -1.5 / hour while hungry (fed < 25), plus -1.5 / hour while sick
export const FED_DECAY = 2.5;
export const JOY_DECAY = 2.5;
export const JOY_EXTRA_HUNGRY = 1.5;
export const JOY_EXTRA_SICK = 1.5;

/** Mirrors the SQL decay so the UI stays accurate between writes. */
export function liveStats(
  row: Pick<PetRow, 'fed' | 'joy' | 'stats_at'> & { sick_until?: string | null },
  now: Date = new Date(),
) {
  const t0 = new Date(row.stats_at).getTime();
  const hrs = Math.max(0, (now.getTime() - t0) / 3600000);
  const fed0 = Number(row.fed);
  const joy0 = Number(row.joy);
  const hoursUntilHungry = Math.max(0, (fed0 - 25) / FED_DECAY);
  const hungryHrs = hrs - Math.min(hrs, hoursUntilHungry);
  let sickHrs = 0;
  if (row.sick_until) {
    const end = Math.min(now.getTime(), new Date(row.sick_until).getTime());
    sickHrs = Math.max(0, (end - t0) / 3600000);
  }
  return {
    fed: Math.max(0, Math.min(100, fed0 - hrs * FED_DECAY)),
    joy: Math.max(0, Math.min(100, joy0 - hrs * JOY_DECAY - hungryHrs * JOY_EXTRA_HUNGRY - sickHrs * JOY_EXTRA_SICK)),
  };
}

export function isSick(row: { sick_until?: string | null }, now: Date = new Date()): boolean {
  return !!row.sick_until && new Date(row.sick_until).getTime() > now.getTime();
}

export function sickMinutesLeft(row: { sick_until?: string | null }, now: Date = new Date()): number {
  if (!row.sick_until) return 0;
  return Math.max(0, Math.ceil((new Date(row.sick_until).getTime() - now.getTime()) / 60000));
}

/** A streak that missed yesterday is already broken even before the next write. */
export function liveStreak(row: Pick<PetRow, 'streak' | 'streak_date'>, now: Date = new Date()): number {
  if (!row.streak_date) return 0;
  const today = new Date(utcToday(now) + 'T00:00:00Z').getTime();
  const last = new Date(row.streak_date + 'T00:00:00Z').getTime();
  const days = Math.round((today - last) / 86400000);
  return days <= 1 ? row.streak : 0;
}

export type PetMood = 'happy' | 'okay' | 'hungry' | 'lonely' | 'sick';

export function moodFor(fed: number, joy: number, sick = false): PetMood {
  if (sick) return 'sick';
  if (fed < 25) return 'hungry';
  if (joy < 25) return 'lonely';
  if (fed > 55 && joy > 45) return 'happy';
  return 'okay';
}

/** Which of the two owners is "me", and whether each has chatted today. */
export function todayFlags(row: Pick<PetRow, 'a_today' | 'b_today' | 'user_a' | 'day_date'>, myId: string, now: Date = new Date()) {
  const fresh = row.day_date === utcToday(now);
  const aMe = row.user_a === myId;
  const a = fresh && row.a_today;
  const b = fresh && row.b_today;
  return { me: aMe ? a : b, them: aMe ? b : a };
}
