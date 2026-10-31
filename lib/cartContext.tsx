/**
 * Cart context — persisted shopping cart with AsyncStorage.
 *
 * Stores line items keyed by variant ID + selected options so the same product
 * in different sizes/colors is tracked separately. Quantity is adjustable.
 */

import { createContext, useContext, useEffect, useMemo, useCallback, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ShopifyProduct, ShopifyVariant } from './shopify';

export interface CartLine {
  /** Unique cart key: variantId or productId+options-hash. */
  key: string;
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string;
  price: number;
  image: string | null;
  quantity: number;
  /** Selected option values, e.g. { Size: 'M', Color: 'Black' }. */
  options: Record<string, string>;
  url: string;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  addItem: (product: ShopifyProduct, variant: ShopifyVariant, quantity?: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

const CART_KEY = '@otf/cart';
const CartContext = createContext<CartContextValue | null>(null);

function variantKey(productId: string, variant: ShopifyVariant): string {
  return variant.id || `${productId}-${variant.selectedOptions.map((o) => `${o.name}:${o.value}`).join('|')}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(CART_KEY)
      .then((stored) => {
        if (!stored) return;
        try {
          const parsed = JSON.parse(stored) as CartLine[];
          if (Array.isArray(parsed)) setLines(parsed);
        } catch {
          /* ignore malformed */
        }
      })
      .catch(() => {});
  }, []);

  const persist = useCallback((next: CartLine[]) => {
    setLines(next);
    AsyncStorage.setItem(CART_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const addItem = useCallback(
    (product: ShopifyProduct, variant: ShopifyVariant, quantity = 1) => {
      const key = variantKey(product.id, variant);
      const options: Record<string, string> = {};
      variant.selectedOptions.forEach((o) => {
        options[o.name] = o.value;
      });
      setLines((prev) => {
        const existing = prev.find((l) => l.key === key);
        let next: CartLine[];
        if (existing) {
          next = prev.map((l) => (l.key === key ? { ...l, quantity: l.quantity + quantity } : l));
        } else {
          const line: CartLine = {
            key,
            productId: product.id,
            variantId: variant.id,
            title: product.title,
            variantTitle: variant.title,
            price: variant.price,
            image: product.image,
            quantity,
            options,
            url: product.url,
          };
          next = [...prev, line];
        }
        AsyncStorage.setItem(CART_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [],
  );

  const updateQuantity = useCallback(
    (key: string, quantity: number) => {
      setLines((prev) => {
        const next = quantity <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, quantity } : l));
        AsyncStorage.setItem(CART_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [],
  );

  const removeItem = useCallback((key: string) => {
    setLines((prev) => {
      const next = prev.filter((l) => l.key !== key);
      AsyncStorage.setItem(CART_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const clear = useCallback(() => persist([]), [persist]);

  const count = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.price * l.quantity, 0), [lines]);

  const value = useMemo<CartContextValue>(
    () => ({ lines, count, subtotal, addItem, updateQuantity, removeItem, clear }),
    [lines, count, subtotal, addItem, updateQuantity, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside CartProvider');
  return value;
}
