'use client';

/**
 * SoulShop — in-game shop for purchasing tokens, shields, skins, cards, passes (web).
 */

import { useState } from 'react';
import {
  SHOP_PRODUCTS,
  type PlayerInventory,
  type ShopProduct,
  type ShopProductId,
} from '@/lib/soulAscension/shopSystem';

interface Props {
  inventory: PlayerInventory;
  onPurchase: (productId: ShopProductId) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  tokens: '🔄 Replay Tokens',
  shields: '🛡️ Streak Shields',
  cosmetics: '🎨 Avatar Skins',
  cards: '🔮 Prophecy Packs',
  pass: '👑 Season Pass',
};

const CATEGORIES = ['tokens', 'shields', 'cosmetics', 'cards', 'pass'] as const;

export default function SoulShop({ inventory, onPurchase }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('tokens');
  const filtered = SHOP_PRODUCTS.filter((p) => p.category === activeCategory);

  const isOwned = (product: ShopProduct): boolean => {
    if (product.category === 'cosmetics') return inventory.ownedAvatarSkins.includes(product.id);
    if (product.id === 'season_pass') return inventory.hasSeasonPass;
    return false;
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-gold-primary">Soul Shop</p>
        <div className="flex gap-3 text-xs font-semibold text-text-secondary">
          <span>🔄 {inventory.replayTokens}</span>
          <span>🛡️ {inventory.streakShields}</span>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={[
              'rounded-md border px-3 py-2 text-xs font-bold transition',
              activeCategory === cat
                ? 'border-gold-primary/40 bg-gold-primary/15 text-gold-primary'
                : 'border-white/10 bg-white/[0.04] text-text-tertiary hover:text-text-primary',
            ].join(' ')}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => {
          const owned = isOwned(product);
          return (
            <div key={product.id} className={`rounded-lg border p-5 ${owned ? 'border-emerald-400/30 bg-emerald-400/[0.04]' : 'border-white/10 bg-white/[0.045]'}`}>
              <p className="text-2xl">{product.emoji}</p>
              <h3 className="mt-2 text-sm font-bold text-text-primary">{product.name}</h3>
              <p className="mt-1 text-xs leading-5 text-text-secondary">{product.description}</p>
              {owned ? (
                <span className="mt-3 inline-block rounded bg-emerald-400/15 px-3 py-1.5 text-xs font-bold text-emerald-400">Owned ✓</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onPurchase(product.id)}
                  className="mt-3 rounded border border-gold-primary/40 bg-gold-primary/15 px-5 py-2 text-xs font-extrabold text-gold-primary transition hover:bg-gold-primary/25"
                >
                  {product.priceDisplay}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
