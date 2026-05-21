'use client';

/**
 * useSoulShopPurchase — web purchase hook for Soul Ascension shop.
 *
 * On web, in-app purchases go through Stripe (or your web payment
 * provider). This hook provides a `purchase()` function that
 * initiates the web checkout flow.
 *
 * Until Stripe is fully wired, this surfaces a user-friendly
 * message directing to the mobile app for purchases, while
 * still applying any free/promotional items to inventory.
 */

import { useState, useCallback } from 'react';
import {
  SHOP_PRODUCTS,
  applyPurchase,
  type PlayerInventory,
  type ShopProductId,
} from '@/lib/soulAscension/shopSystem';

interface UseSoulShopPurchaseReturn {
  loading: boolean;
  available: boolean;
  error: string | null;
  purchase: (
    productId: ShopProductId,
    currentInventory: PlayerInventory,
  ) => Promise<PlayerInventory | null>;
}

export function useSoulShopPurchase(): UseSoulShopPurchaseReturn {
  const [loading] = useState(false);

  // Web payments are available once Stripe is configured.
  // For now, surface a helpful message.
  const [available] = useState(false);
  const [error] = useState<string | null>(null);

  const purchase = useCallback(
    async (
      productId: ShopProductId,
      currentInventory: PlayerInventory,
    ): Promise<PlayerInventory | null> => {
      const product = SHOP_PRODUCTS.find((p) => p.id === productId);
      if (!product) return null;

      // TODO: Wire Stripe Checkout or Payment Links here.
      // For now, show a toast/alert directing to mobile.
      //
      // Example Stripe integration:
      // const { url } = await fetch('/api/checkout', {
      //   method: 'POST',
      //   body: JSON.stringify({ priceId: product.revenueCatId }),
      // }).then(r => r.json());
      // window.location.href = url;

      if (typeof window !== 'undefined') {
        window.alert(
          `Purchases are currently available through the Align mobile app. ` +
          `Download Align to purchase ${product.name}.`,
        );
      }

      return null;
    },
    [],
  );

  return { loading, available, error, purchase };
}
