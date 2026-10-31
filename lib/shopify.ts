/**
 * Shopify Storefront API access — routed through Base44 server functions.
 *
 * SECURITY: The Shopify Storefront API token (shpat_...) is NEVER placed in
 * client code. The Base44 server holds it and proxies all Shopify calls. The
 * app invokes Base44 server functions, which return product/checkout data.
 *
 * Architecture:
 *   1. App calls base44.functions.invoke('getShopifyProducts', { ... })
 *   2. Base44 server uses the stored Shopify token to query the Storefront API
 *   3. Server returns mapped product data to the app
 *
 * All functions gracefully return null / empty on failure so callers fall back
 * to the seeded catalog. This keeps the app usable offline or before the
 * server functions are deployed.
 */

import { getBase44Client } from './base44';
import { SHOP_DOMAIN } from './config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ShopifyVariant {
  id: string;
  title: string;
  available: boolean;
  price: number;
  /** Selected options for this variant, e.g. [{ name: 'Size', value: 'M' }] */
  selectedOptions: { name: string; value: string }[];
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  image: string | null;
  images: ShopifyImage[];
  variants: ShopifyVariant[];
  /** Available option dimensions, e.g. [{ name: 'Size', values: ['S','M','L'] }] */
  options: { name: string; values: string[] }[];
  productType: string;
  tags: string[];
  vendor: string;
  available: boolean;
  url: string;
  collection?: string;
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: string | null;
  productCount: number;
  url: string;
}

// ---------------------------------------------------------------------------
// Seeded catalog — used as a fallback and to render instantly before the
// server returns. Mirrors the real OTF storefront collections.
// ---------------------------------------------------------------------------

const BRAND = 'Only The Finest';

const img = (u: string): ShopifyImage => ({ url: u, altText: null });

export const SEED_PRODUCTS: ShopifyProduct[] = [
  {
    id: 'seed-1', handle: 'we-sow-you-harvest', title: 'We Sow You Harvest', description: 'Premium streetwear tee from the Corner Kings collection. 100% premium cotton. Unapologetic design for the trendsetter.',
    price: 39.99, compareAtPrice: null,
    image: 'https://cdn.shopify.com/s/files/1/0551/3868/0982/files/f84a7135bf184c8bb2ab1b455813cb99_04d9407f-9a0d-4376-9c24-830d95a5aa44.png?v=1750816928',
    images: [img('https://cdn.shopify.com/s/files/1/0551/3868/0982/files/f84a7135bf184c8bb2ab1b455813cb99_04d9407f-9a0d-4376-9c24-830d95a5aa44.png?v=1750816928')],
    variants: [{ id: 'v1-s', title: 'Small', available: true, price: 39.99, selectedOptions: [{ name: 'Size', value: 'S' }] }, { id: 'v1-m', title: 'Medium', available: true, price: 39.99, selectedOptions: [{ name: 'Size', value: 'M' }] }, { id: 'v1-l', title: 'Large', available: true, price: 39.99, selectedOptions: [{ name: 'Size', value: 'L' }] }, { id: 'v1-xl', title: 'X-Large', available: true, price: 39.99, selectedOptions: [{ name: 'Size', value: 'XL' }] }],
    options: [{ name: 'Size', values: ['S', 'M', 'L', 'XL'] }],
    productType: 'T-Shirt', tags: ['corner-kings', 'tees'], vendor: BRAND, available: true,
    url: `${SHOP_DOMAIN}/products/we-sow-you-harvest`, collection: 'Corner Kings',
  },
  {
    id: 'seed-2', handle: 'fruits-of-machine-labor', title: 'Fruits Of Machine Labor', description: 'Statement tee from Corner Kings. Where art and fashion collide.',
    price: 39.99, compareAtPrice: null,
    image: 'https://cdn.shopify.com/s/files/1/0551/3868/0982/files/f18a5ca69ba54c5a8b85895b7701dc5e.png?v=1750815710',
    images: [img('https://cdn.shopify.com/s/files/1/0551/3868/0982/files/f18a5ca69ba54c5a8b85895b7701dc5e.png?v=1750815710')],
    variants: [{ id: 'v2-s', title: 'Small', available: true, price: 39.99, selectedOptions: [{ name: 'Size', value: 'S' }] }, { id: 'v2-m', title: 'Medium', available: true, price: 39.99, selectedOptions: [{ name: 'Size', value: 'M' }] }, { id: 'v2-l', title: 'Large', available: false, price: 39.99, selectedOptions: [{ name: 'Size', value: 'L' }] }, { id: 'v2-xl', title: 'X-Large', available: true, price: 39.99, selectedOptions: [{ name: 'Size', value: 'XL' }] }],
    options: [{ name: 'Size', values: ['S', 'M', 'L', 'XL'] }],
    productType: 'T-Shirt', tags: ['corner-kings', 'tees'], vendor: BRAND, available: true,
    url: `${SHOP_DOMAIN}/products/fruits-of-machine-labor`, collection: 'Corner Kings',
  },
  {
    id: 'seed-3', handle: 'sakura-blossom-joggerset', title: 'Sakura Blossom Joggerset', description: 'Premium joggerset from the Sakura Blossoms collection. Limited drop.',
    price: 149.99, compareAtPrice: 179.99,
    image: 'https://cdn.shopify.com/s/files/1/0551/3868/0982/files/merch-bundle-mockup-of-a-both-sides-view-sweatshirt-and-a-digipak-43424-r-el2_1_-4.png?v=1695082714',
    images: [img('https://cdn.shopify.com/s/files/1/0551/3868/0982/files/merch-bundle-mockup-of-a-both-sides-view-sweatshirt-and-a-digipak-43424-r-el2_1_-4.png?v=1695082714')],
    variants: [{ id: 'v3-s', title: 'Small / Black', available: true, price: 149.99, selectedOptions: [{ name: 'Size', value: 'S' }, { name: 'Color', value: 'Black' }] }, { id: 'v3-m', title: 'Medium / Black', available: true, price: 149.99, selectedOptions: [{ name: 'Size', value: 'M' }, { name: 'Color', value: 'Black' }] }, { id: 'v3-l', title: 'Large / Purple', available: true, price: 149.99, selectedOptions: [{ name: 'Size', value: 'L' }, { name: 'Color', value: 'Purple' }] }],
    options: [{ name: 'Size', values: ['S', 'M', 'L'] }, { name: 'Color', values: ['Black', 'Purple'] }],
    productType: 'Joggerset', tags: ['sakura-blossoms', 'sets'], vendor: BRAND, available: true,
    url: `${SHOP_DOMAIN}/products/sakura-blossom-joggerset`, collection: 'Sakura Blossoms',
  },
  {
    id: 'seed-4', handle: 'sakura-nights-mens-tracksuit-set', title: 'Sakura Nights Men\'s Tracksuit Set', description: 'Elevated tracksuit set from Sakura Blossoms. Front and back premium construction.',
    price: 149.99, compareAtPrice: null,
    image: 'https://cdn.shopify.com/s/files/1/0551/3868/0982/files/otf-corrected-m_sakura.png?v=1791583413',
    images: [img('https://cdn.shopify.com/s/files/1/0551/3868/0982/files/otf-corrected-m_sakura.png?v=1791583413')],
    variants: [{ id: 'v4-s', title: 'Small', available: true, price: 149.99, selectedOptions: [{ name: 'Size', value: 'S' }] }, { id: 'v4-m', title: 'Medium', available: true, price: 149.99, selectedOptions: [{ name: 'Size', value: 'M' }] }, { id: 'v4-l', title: 'Large', available: true, price: 149.99, selectedOptions: [{ name: 'Size', value: 'L' }] }, { id: 'v4-xl', title: 'X-Large', available: true, price: 149.99, selectedOptions: [{ name: 'Size', value: 'XL' }] }],
    options: [{ name: 'Size', values: ['S', 'M', 'L', 'XL'] }],
    productType: 'Tracksuit', tags: ['sakura-blossoms', 'sets'], vendor: BRAND, available: true,
    url: `${SHOP_DOMAIN}/products/sakura-nights-mens-tracksuit-set`, collection: 'Sakura Blossoms',
  },
  {
    id: 'seed-5', handle: 'sakura-blossoms-mens-shorts', title: 'Sakura Blossoms Men\'s Shorts', description: 'Premium shorts from Sakura Blossoms. Multiple colorways available.',
    price: 49.99, compareAtPrice: null,
    image: 'https://cdn.shopify.com/s/files/1/0551/3868/0982/files/otf-sakura-blossoms-mens-shorts.png?v=1791352377',
    images: [img('https://cdn.shopify.com/s/files/1/0551/3868/0982/files/otf-sakura-blossoms-mens-shorts.png?v=1791352377')],
    variants: [{ id: 'v5-s', title: 'Small', available: true, price: 49.99, selectedOptions: [{ name: 'Size', value: 'S' }] }, { id: 'v5-m', title: 'Medium', available: true, price: 49.99, selectedOptions: [{ name: 'Size', value: 'M' }] }, { id: 'v5-l', title: 'Large', available: true, price: 49.99, selectedOptions: [{ name: 'Size', value: 'L' }] }],
    options: [{ name: 'Size', values: ['S', 'M', 'L'] }],
    productType: 'Shorts', tags: ['sakura-blossoms', 'bottoms'], vendor: BRAND, available: true,
    url: `${SHOP_DOMAIN}/products/sakura-blossoms-mens-shorts`, collection: 'Sakura Blossoms',
  },
  {
    id: 'seed-6', handle: 'sakura-bottoms-shorts', title: 'Sakura Bottoms Shorts', description: 'Cargo booty shorts from Sakura Blossoms. Premium streetwear for the tastemaker.',
    price: 49.99, compareAtPrice: null,
    image: 'https://cdn.shopify.com/s/files/1/0551/3868/0982/files/otf-finest-femme-booty-shorts-moodboard.png?v=1791345025',
    images: [img('https://cdn.shopify.com/s/files/1/0551/3868/0982/files/otf-finest-femme-booty-shorts-moodboard.png?v=1791345025')],
    variants: [{ id: 'v6-s', title: 'Small', available: true, price: 49.99, selectedOptions: [{ name: 'Size', value: 'S' }] }, { id: 'v6-m', title: 'Medium', available: true, price: 49.99, selectedOptions: [{ name: 'Size', value: 'M' }] }],
    options: [{ name: 'Size', values: ['S', 'M'] }],
    productType: 'Shorts', tags: ['sakura-blossoms', 'bottoms'], vendor: BRAND, available: true,
    url: `${SHOP_DOMAIN}/products/sakura-bottoms-shorts`, collection: 'Sakura Blossoms',
  },
];

// ---------------------------------------------------------------------------
// Server function wrappers
// ---------------------------------------------------------------------------

function mapServerProduct(p: Record<string, unknown>): ShopifyProduct {
  const handle = typeof p.handle === 'string' ? p.handle : '';
  const variants = Array.isArray(p.variants)
    ? (p.variants as Record<string, unknown>[]).map((v) => ({
        id: String(v.id ?? ''),
        title: String(v.title ?? ''),
        available: Boolean(v.available ?? true),
        price: typeof v.price === 'number' ? v.price : 0,
        selectedOptions: Array.isArray(v.selectedOptions) ? v.selectedOptions : [],
      }))
    : [];
  const options = Array.isArray(p.options)
    ? (p.options as Record<string, unknown>[]).map((o) => ({
        name: String(o.name ?? ''),
        values: Array.isArray(o.values) ? o.values.map(String) : [],
      }))
    : [];
  const images = Array.isArray(p.images)
    ? (p.images as Record<string, unknown>[]).map((i) => ({
        url: String(i.url ?? ''),
        altText: (i.altText as string | null) ?? null,
      }))
    : [];
  const image = typeof p.image === 'string' ? p.image : images[0]?.url ?? null;
  return {
    id: String(p.id ?? ''),
    handle,
    title: String(p.title ?? ''),
    description: String(p.description ?? ''),
    price: typeof p.price === 'number' ? p.price : 0,
    compareAtPrice: typeof p.compareAtPrice === 'number' ? p.compareAtPrice : null,
    image,
    images,
    variants,
    options,
    productType: String(p.productType ?? p.type ?? ''),
    tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
    vendor: String(p.vendor ?? BRAND),
    available: Boolean(p.available ?? true),
    url: handle ? `${SHOP_DOMAIN}/products/${handle}` : String(p.url ?? SHOP_DOMAIN),
    collection: typeof p.collection === 'string' ? p.collection : '',
  };
}

/**
 * Fetch the product catalog from the Base44 server function getShopifyProducts.
 * Returns null on any failure so the caller falls back to the seed catalog.
 */
export async function fetchProducts(query?: string, collection?: string): Promise<ShopifyProduct[] | null> {
  const client = getBase44Client();
  try {
    const result = await client.functions.invoke('getShopifyProducts', {
      query: query ?? '',
      collection: collection ?? '',
    });
    const list = (result as Record<string, unknown>)?.products;
    if (!Array.isArray(list) || list.length === 0) return null;
    return (list as Record<string, unknown>[]).map(mapServerProduct);
  } catch {
    return null;
  }
}

/** Fetch Shopify collections. Returns null on failure. */
export async function fetchCollections(): Promise<ShopifyCollection[] | null> {
  const client = getBase44Client();
  try {
    const result = await client.functions.invoke('getShopifyCollections', {});
    const list = (result as Record<string, unknown>)?.collections;
    if (!Array.isArray(list)) return null;
    return (list as Record<string, unknown>[]).map((c) => ({
      id: String(c.id ?? ''),
      handle: String(c.handle ?? ''),
      title: String(c.title ?? ''),
      description: String(c.description ?? ''),
      image: typeof c.image === 'string' ? c.image : null,
      productCount: typeof c.productCount === 'number' ? c.productCount : 0,
      url: c.handle ? `${SHOP_DOMAIN}/collections/${c.handle}` : SHOP_DOMAIN,
    }));
  } catch {
    return null;
  }
}

/**
 * Create a Shopify checkout URL via the Base44 server function and open it in
 * the system browser. The server function holds the Storefront token and
 * builds the checkout with the selected line items.
 *
 * Falls back to the storefront cart URL if the server function is unavailable.
 */
export async function createCheckoutUrl(lineItems: { variantId: string; quantity: number }[]): Promise<string> {
  if (lineItems.length === 0) return SHOP_DOMAIN;
  const client = getBase44Client();
  try {
    const result = await client.functions.invoke('createCheckout', { lineItems });
    const url = (result as Record<string, unknown>)?.checkoutUrl ?? (result as Record<string, unknown>)?.url;
    if (typeof url === 'string' && url.startsWith('http')) return url;
  } catch {
    // fall through
  }
  // Fallback: build a Shopify cart permalink from variant IDs (best-effort).
  const ids = lineItems.map((li) => li.variantId).filter(Boolean);
  if (ids.length > 0) {
    return `${SHOP_DOMAIN}/cart/${ids.map((id, i) => `${id}:${lineItems[i].quantity}`).join(',')}`;
  }
  return SHOP_DOMAIN;
}

export const formatPrice = (price: number): string => `$${price.toFixed(2)}`;
