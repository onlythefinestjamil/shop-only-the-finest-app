/**
 * Catalog context — shared product catalog for Shop + Product Detail screens.
 * Loads from the Base44 server function (getShopifyProducts) and falls back to
 * the seeded catalog so the app renders instantly and stays usable offline.
 */

import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import { fetchProducts, SEED_PRODUCTS, type ShopifyProduct } from './shopify';

interface CatalogContextValue {
  products: ShopifyProduct[];
  loading: boolean;
  /** True when the server returned live data (vs. seed fallback). */
  live: boolean;
  refresh: () => void;
  getById: (id: string) => ShopifyProduct | undefined;
  search: (query: string) => ShopifyProduct[];
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ShopifyProduct[]>(SEED_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const fetched = await fetchProducts();
    if (fetched && fetched.length > 0) {
      setProducts(fetched);
      setLive(true);
    } else {
      setProducts(SEED_PRODUCTS);
      setLive(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo<CatalogContextValue>(
    () => ({
      products,
      loading,
      live,
      refresh: load,
      getById: (id) => products.find((p) => p.id === id),
      search: (query) => {
        const q = query.trim().toLowerCase();
        if (!q) return products;
        return products.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.productType.toLowerCase().includes(q) ||
            p.collection?.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q)),
        );
      },
    }),
    [products, loading, live, load],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const value = useContext(CatalogContext);
  if (!value) throw new Error('useCatalog must be used inside CatalogProvider');
  return value;
}
