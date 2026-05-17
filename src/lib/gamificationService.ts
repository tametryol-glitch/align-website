import { createClient } from '@/lib/supabase';

// ── XP awarded per action ──────────────────────────────────────────────
export const XP_ACTIONS: Record<string, number> = {
  reading_completed: 50,
  post_created: 10,
  comment_added: 5,
  friend_added: 20,
  streak_day: 15,
  check_in: 10,
  match_viewed: 5,
  community_joined: 15,
  share_chart: 25,
};

// ── Level thresholds (index = level, value = minimum XP) ───────────────
export const LEVELS: number[] = [
  0,      // level 1
  100,    // level 2
  300,    // level 3
  600,    // level 4
  1000,   // level 5
  1500,   // level 6
  2500,   // level 7
  4000,   // level 8
  6000,   // level 9
  10000,  // level 10
];

// ── Badge definitions ──────────────────────────────────────────────────
export interface BadgeDefinition {
  name: string;
  description: string;
  icon: string;
}

export const BADGES: Record<string, BadgeDefinition> = {
  first_reading:     { name: 'First Reading',     description: 'Completed your first reading',       icon: '\u{1F4D6}' },
  social_butterfly:  { name: 'Social Butterfly',   description: 'Added 10 friends',                   icon: '\u{1F98B}' },
  cosmic_explorer:   { name: 'Cosmic Explorer',    description: 'Tried 5 different reading types',    icon: '\u{1F52D}' },
  streak_master:     { name: 'Streak Master',      description: '7-day check-in streak',              icon: '\u{1F525}' },
  community_builder: { name: 'Community Builder',  description: 'Joined 3 communities',               icon: '\u{1F3DB}️' },
  matchmaker:        { name: 'Matchmaker',          description: 'Viewed 20 compatibility matches',   icon: '\u{1F4AB}' },
  storyteller:       { name: 'Storyteller',         description: 'Created 10 posts',                  icon: '✍️' },
  cosmic_sage:       { name: 'Cosmic Sage',         description: 'Reached level 5',                   icon: '\u{1F9D9}' },
  astro_master:      { name: 'Astro Master',        description: 'Reached level 10',                  icon: '⭐' },
  sharer:            { name: 'Cosmic Sharer',       description: 'Shared a chart or reading',         icon: '\u{1F31F}' },
};

// ── Helpers ─────────────────────────────────────────────────────────────

function levelFromXP(xp: number): number {
  let lvl = 1;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i]) {
      lvl = i + 1;
      break;
    }
  }
  return lvl;
}

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Award XP for a given action. Recalculates level and checks badge eligibility.
 * Returns the new total XP, level, and any newly awarded badge id.
 */
export async function awardXP(
  userId: string,
  action: string,
  context?: Record<string, unknown>,
): Promise<{ totalXP: number; level: number; newBadge: string | null }> {
  const xpAmount = XP_ACTIONS[action];
  if (!xpAmount) {
    console.warn(`[Gamification] Unknown action: ${action}`);
    return { totalXP: 0, level: 1, newBadge: null };
  }

  const supabase = createClient();

  // Upsert: create row if missing, increment XP
  const { data: existing } = await supabase
    .from('user_xp')
    .select('total_xp, level')
    .eq('user_id', userId)
    .single();

  let newTotal: number;
  let newLevel: number;

  if (existing) {
    newTotal = existing.total_xp + xpAmount;
    newLevel = levelFromXP(newTotal);
    await supabase
      .from('user_xp')
      .update({ total_xp: newTotal, level: newLevel, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
  } else {
    newTotal = xpAmount;
    newLevel = levelFromXP(newTotal);
    await supabase
      .from('user_xp')
      .insert({ user_id: userId, total_xp: newTotal, level: newLevel });
  }

  // Check badges
  const newBadge = await checkAndAwardBadges(userId, action, context);

  // Also check level-based badges
  if (newLevel >= 5) await tryAwardBadge(userId, 'cosmic_sage');
  if (newLevel >= 10) await tryAwardBadge(userId, 'astro_master');

  return { totalXP: newTotal, level: newLevel, newBadge };
}

/**
 * Get the user's XP progress details.
 */
export async function getXPProgress(userId: string): Promise<{
  totalXP: number;
  level: number;
  xpForNextLevel: number;
  xpInCurrentLevel: number;
  progress: number;
}> {
  const supabase = createClient();
  const { data } = await supabase
    .from('user_xp')
    .select('total_xp, level')
    .eq('user_id', userId)
    .single();

  const totalXP = data?.total_xp ?? 0;
  const level = data?.level ?? levelFromXP(totalXP);

  const currentLevelMin = LEVELS[level - 1] ?? 0;
  const nextLevelMin = LEVELS[level] ?? LEVELS[LEVELS.length - 1];

  const xpInCurrentLevel = totalXP - currentLevelMin;
  const xpForNextLevel = nextLevelMin - currentLevelMin;
  const progress = xpForNextLevel > 0 ? Math.min(100, (xpInCurrentLevel / xpForNextLevel) * 100) : 100;

  return { totalXP, level, xpForNextLevel, xpInCurrentLevel, progress };
}

/**
 * Get all badges earned by a user, enriched with badge definition data.
 */
export async function getUserBadges(userId: string): Promise<
  Array<{ badgeId: string; earnedAt: string } & BadgeDefinition>
> {
  const supabase = createClient();
  const { data } = await supabase
    .from('user_badges')
    .select('badge_id, earned_at')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (!data) return [];

  return data
    .filter((b) => BADGES[b.badge_id])
    .map((b) => ({
      badgeId: b.badge_id,
      earnedAt: b.earned_at,
      ...BADGES[b.badge_id],
    }));
}

/**
 * Check if an action triggers a badge and award it if so.
 * Returns the badge_id if a new badge was earned, null otherwise.
 */
export async function checkAndAwardBadges(
  userId: string,
  action: string,
  context?: Record<string, unknown>,
): Promise<string | null> {
  switch (action) {
    case 'reading_completed': {
      // First reading badge
      const awarded = await tryAwardBadge(userId, 'first_reading');
      if (awarded) return 'first_reading';

      // Cosmic explorer: 5 different reading types
      if (context?.readingTypeCount && (context.readingTypeCount as number) >= 5) {
        const exp = await tryAwardBadge(userId, 'cosmic_explorer');
        if (exp) return 'cosmic_explorer';
      }
      break;
    }
    case 'friend_added': {
      if (context?.friendCount && (context.friendCount as number) >= 10) {
        const awarded = await tryAwardBadge(userId, 'social_butterfly');
        if (awarded) return 'social_butterfly';
      }
      break;
    }
    case 'streak_day': {
      if (context?.streakDays && (context.streakDays as number) >= 7) {
        const awarded = await tryAwardBadge(userId, 'streak_master');
        if (awarded) return 'streak_master';
      }
      break;
    }
    case 'community_joined': {
      if (context?.communityCount && (context.communityCount as number) >= 3) {
        const awarded = await tryAwardBadge(userId, 'community_builder');
        if (awarded) return 'community_builder';
      }
      break;
    }
    case 'match_viewed': {
      if (context?.matchCount && (context.matchCount as number) >= 20) {
        const awarded = await tryAwardBadge(userId, 'matchmaker');
        if (awarded) return 'matchmaker';
      }
      break;
    }
    case 'post_created': {
      if (context?.postCount && (context.postCount as number) >= 10) {
        const awarded = await tryAwardBadge(userId, 'storyteller');
        if (awarded) return 'storyteller';
      }
      break;
    }
    case 'share_chart': {
      const awarded = await tryAwardBadge(userId, 'sharer');
      if (awarded) return 'sharer';
      break;
    }
  }
  return null;
}

/**
 * Try to award a badge. Returns true if newly awarded, false if already owned.
 */
async function tryAwardBadge(userId: string, badgeId: string): Promise<boolean> {
  const supabase = createClient();

  // Check if already earned
  const { data: existing } = await supabase
    .from('user_badges')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_id', badgeId)
    .single();

  if (existing) return false;

  const { error } = await supabase
    .from('user_badges')
    .insert({ user_id: userId, badge_id: badgeId });

  // UNIQUE constraint violation means they already have it
  if (error) return false;

  return true;
}
