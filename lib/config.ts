/**
 * Production Base44 configuration for Only The Finest.
 *
 * The Base44 App ID is a PUBLIC identifier — safe to ship in client builds.
 * It is read from EXPO_PUBLIC_BASE44_APP_ID with the production storefront
 * app ID as the default.
 *
 * The Shopify Storefront API token is NEVER placed here. It lives only in the
 * Base44 server environment and is used by the server-side functions
 * (getShopifyProducts, getShopifyCollections, createCheckout).
 */

const APP_ID = process.env.EXPO_PUBLIC_BASE44_APP_ID || '69ddebfc0f7c323042ac3a0c';
const APP_BASE_URL = process.env.EXPO_PUBLIC_APP_BASE_URL || 'https://www.shoponlythefinest.com';

export const config = {
  appId: APP_ID,
  appBaseUrl: APP_BASE_URL,
  // The SDK defaults serverUrl to https://base44.app — no need to override.
  serverUrl: 'https://base44.app',
  configured: Boolean(APP_ID),
};

export const SHOP_DOMAIN = 'https://www.shoponlythefinest.com';
export const CATALOG_URL = `${SHOP_DOMAIN}/catalog`;
