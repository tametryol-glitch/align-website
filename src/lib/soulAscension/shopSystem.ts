/**
 * shopSystem — in-game shop product definitions and purchase logic.
 *
 * Products are defined here. Actual IAP purchase calls go through
 * RevenueCat — this module handles the game-state side effects
 * after a purchase is confirmed.
 */

export type ShopProductId =
  | 'replay_token_1'
  | 'replay_token_3'
  | 'replay_token_5'
  | 'shield_1'
  | 'shield_3'
  | 'avatar_cosmic'
  | 'avatar_shadow'
  | 'avatar_celestial'
  | 'prophecy_pack_3'
  | 'prophecy_pack_7'
  | 'season_pass';

export interface ShopProduct {
  id: ShopProductId;
  name: string;
  description: string;
  category: 'tokens' | 'shields' | 'cosmetics' | 'cards' | 'pass';
  priceDisplay: string;
  /** RevenueCat product identifier */
  revenueCatId: string;
  emoji: string;
}

export const SHOP_PRODUCTS: ShopProduct[] = [
  // Replay Tokens
  {
    id: 'replay_token_1',
    name: '1 Replay Token',
    description: 'Replay any completed lifetime with different choices. See what could have been.',
    category: 'tokens',
    priceDisplay: '$0.99',
    revenueCatId: 'sa_replay_token_1',
    emoji: '🔄',
  },
  {
    id: 'replay_token_3',
    name: '3 Replay Tokens',
    description: 'Bundle of 3 replay tokens. Best for exploring alternate timelines.',
    category: 'tokens',
    priceDisplay: '$1.99',
    revenueCatId: 'sa_replay_token_3',
    emoji: '🔄',
  },
  {
    id: 'replay_token_5',
    name: '5 Replay Tokens',
    description: 'Full exploration pack. Replay up to 5 lifetimes.',
    category: 'tokens',
    priceDisplay: '$2.99',
    revenueCatId: 'sa_replay_token_5',
    emoji: '🔄',
  },

  // Streak Shields
  {
    id: 'shield_1',
    name: '1 Streak Shield',
    description: 'Protect your streak from breaking for one missed day.',
    category: 'shields',
    priceDisplay: '$0.49',
    revenueCatId: 'sa_shield_1',
    emoji: '🛡️',
  },
  {
    id: 'shield_3',
    name: '3 Streak Shields',
    description: 'Triple protection for your soul streak.',
    category: 'shields',
    priceDisplay: '$0.99',
    revenueCatId: 'sa_shield_3',
    emoji: '🛡️',
  },

  // Premium Cosmetic Avatars
  {
    id: 'avatar_cosmic',
    name: 'Cosmic Avatar Skin',
    description: 'A shimmering starfield avatar frame with galaxy particle effects.',
    category: 'cosmetics',
    priceDisplay: '$2.99',
    revenueCatId: 'sa_avatar_cosmic',
    emoji: '🌌',
  },
  {
    id: 'avatar_shadow',
    name: 'Shadow Avatar Skin',
    description: 'Dark energy avatar frame with void particle effects.',
    category: 'cosmetics',
    priceDisplay: '$2.99',
    revenueCatId: 'sa_avatar_shadow',
    emoji: '🌑',
  },
  {
    id: 'avatar_celestial',
    name: 'Celestial Avatar Skin',
    description: 'Golden light avatar frame with divine particle effects.',
    category: 'cosmetics',
    priceDisplay: '$2.99',
    revenueCatId: 'sa_avatar_celestial',
    emoji: '✨',
  },

  // Prophecy Card Packs
  {
    id: 'prophecy_pack_3',
    name: 'Prophecy Pack (3 Cards)',
    description: 'Reveal 3 additional prophecy cards with unique soul guidance.',
    category: 'cards',
    priceDisplay: '$1.49',
    revenueCatId: 'sa_prophecy_pack_3',
    emoji: '🔮',
  },
  {
    id: 'prophecy_pack_7',
    name: 'Prophecy Pack (7 Cards)',
    description: 'The full prophecy deck. 7 cards of deep soul wisdom.',
    category: 'cards',
    priceDisplay: '$2.99',
    revenueCatId: 'sa_prophecy_pack_7',
    emoji: '🔮',
  },

  // Season Pass
  {
    id: 'season_pass',
    name: 'Season Pass',
    description: 'Unlock all premium content for the current season. Includes exclusive missions, avatar skins, and bonus XP.',
    category: 'pass',
    priceDisplay: '$4.99/season',
    revenueCatId: 'sa_season_pass',
    emoji: '👑',
  },
];

export interface PlayerInventory {
  replayTokens: number;
  streakShields: number;
  ownedAvatarSkins: string[];
  prophecyCardsRevealed: number;
  hasSeasonPass: boolean;
}

export function initPlayerInventory(): PlayerInventory {
  return {
    replayTokens: 0,
    streakShields: 0,
    ownedAvatarSkins: [],
    prophecyCardsRevealed: 0,
    hasSeasonPass: false,
  };
}

/**
 * Apply a confirmed purchase to the player inventory.
 * Call this AFTER RevenueCat confirms the transaction.
 */
export function applyPurchase(
  inventory: PlayerInventory,
  productId: ShopProductId,
): PlayerInventory {
  switch (productId) {
    case 'replay_token_1':
      return { ...inventory, replayTokens: inventory.replayTokens + 1 };
    case 'replay_token_3':
      return { ...inventory, replayTokens: inventory.replayTokens + 3 };
    case 'replay_token_5':
      return { ...inventory, replayTokens: inventory.replayTokens + 5 };
    case 'shield_1':
      return { ...inventory, streakShields: inventory.streakShields + 1 };
    case 'shield_3':
      return { ...inventory, streakShields: inventory.streakShields + 3 };
    case 'avatar_cosmic':
    case 'avatar_shadow':
    case 'avatar_celestial':
      return {
        ...inventory,
        ownedAvatarSkins: Array.from(new Set([...inventory.ownedAvatarSkins, productId])),
      };
    case 'prophecy_pack_3':
      return { ...inventory, prophecyCardsRevealed: inventory.prophecyCardsRevealed + 3 };
    case 'prophecy_pack_7':
      return { ...inventory, prophecyCardsRevealed: inventory.prophecyCardsRevealed + 7 };
    case 'season_pass':
      return { ...inventory, hasSeasonPass: true };
    default:
      return inventory;
  }
}

/**
 * Use a replay token (returns updated inventory or null if none available).
 */
export function useReplayToken(inventory: PlayerInventory): PlayerInventory | null {
  if (inventory.replayTokens <= 0) return null;
  return { ...inventory, replayTokens: inventory.replayTokens - 1 };
}

/**
 * Activate a streak shield (returns updated inventory or null if none available).
 */
export function useStreakShield(inventory: PlayerInventory): PlayerInventory | null {
  if (inventory.streakShields <= 0) return null;
  return { ...inventory, streakShields: inventory.streakShields - 1 };
}
