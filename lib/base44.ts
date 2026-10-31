/**
 * Base44 SDK client — production storefront integration for Only The Finest.
 *
 * Creates a single Base44 client pointing at the production app
 * (ID 69ddebfc0f7c323042ac3a0c). The client exposes:
 *   - client.functions.invoke(...)  → Shopify server functions
 *   - client.auth.*                 → customer accounts (email/password, OTP)
 *   - client.entities.*             → Base44 data models (orders, etc.)
 *
 * The Shopify Storefront API token is held server-side by Base44; the app
 * never sees or handles it.
 */

import { createClient, type Base44Client } from '@base44/sdk';
import { config } from './config';

function createBase44Client(): Base44Client {
  return createClient({
    appId: config.appId,
    appBaseUrl: config.appBaseUrl,
    serverUrl: config.serverUrl,
    requiresAuth: false,
    analytics: { enabled: false },
  });
}

let client: Base44Client = createBase44Client();

/** Current in-memory SDK client. Tokens are set only through authSession. */
export function getBase44Client(): Base44Client {
  return client;
}

/**
 * Recreate the SDK client after logout. The SDK has no documented in-memory
 * clear; replacing the instance guarantees no stale token remains available.
 */
export function resetBase44Client(): Base44Client {
  client = createBase44Client();
  return client;
}

export const base44 = client;
