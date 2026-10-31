# Only The Finest — Mobile App

Premium streetwear shopping app for **Only The Finest** (shoponlythefinest.com).
Built with Expo (SDK 57) + React Native, powered by the **Base44 SDK** with
Shopify Storefront API integration through Base44 server functions.

## Design language

Dark **JARVIS-protocol** aesthetic matching the Athos Peaks design system:

- **Purple** `#9146FF` · **Cyan** `#38B6FF` · **Emerald** `#28E5A0`
- Glassmorphic surfaces, glowing borders, corner-bracket HUD framing
- Holographic product cards, ambient gradients, pulsing accent dots
- Bottom tab navigation (Shop · Cart · Profile) with animated glow

## Architecture

```
app/
├── _layout.tsx              # Root: ThemeProvider → AuthProvider → CartProvider → CatalogProvider → Stack
├── index.tsx                # Redirect → /shop
├── (tabs)/
│   ├── _layout.tsx          # Tab layout with custom JARVIS TabBar
│   ├── shop.tsx             # Product catalog + search + collection filters
│   ├── cart.tsx             # Cart with quantity controls + checkout
│   └── profile.tsx          # Sign in / register / OTP + order history
└── product/[id].tsx         # Product detail with variant selectors
components/                  # GlassCard, CornerBrackets, TabBar, ProductCard, GlowButton, GridOverlay, SectionHeader
lib/
├── theme.tsx                # JARVIS theme tokens, gradients, glow, typography
├── base44.ts                # Base44 SDK client (production app)
├── config.ts                # Production app ID + storefront URLs
├── shopify.ts               # Shopify via Base44 server functions (+ seed catalog)
├── authContext.tsx          # Customer accounts (Base44 auth)
├── authSession.ts           # Token persistence (AsyncStorage)
├── cartContext.tsx          # Cart state with AsyncStorage persistence
└── catalogContext.tsx       # Shared product catalog (live + seed fallback)
```

## Base44 + Shopify integration

The Shopify Storefront API token (`shpat_...`) **never** enters client code.
All Shopify calls route through Base44 server functions — the Base44 server
holds the token and proxies to the Shopify Storefront API:

| App call | Base44 server function |
|---|---|
| `fetchProducts()` | `getShopifyProducts` |
| `fetchCollections()` | `getShopifyCollections` |
| `createCheckoutUrl(lineItems)` | `createCheckout` |

The app calls `base44.functions.invoke(name, payload)`; the server returns
mapped product/checkout data. If the server functions are unavailable, the app
falls back to a seeded catalog so it remains fully usable.

## Configuration

Copy `.env.example` to `.env.local` and set the Base44 app ID:

```bash
cp .env.example .env.local
# EXPO_PUBLIC_BASE44_APP_ID defaults to the production storefront app ID
```

## Development

```bash
npm install
npm start            # Expo dev server
npm run typecheck    # tsc --noEmit
npm run doctor       # expo-doctor
npm run ios          # iOS build (requires macOS + Xcode)
npm run android      # Android build (requires Android SDK)
```

## Build & submit (EAS)

```bash
# Install EAS CLI
npm i -g eas-cli

# Log in + link the project
eas login
eas init --id <EAS_PROJECT_ID>

# Development build (internal)
eas build --profile development --platform ios
eas build --profile development --platform android

# Production build (App Store / Play Store)
eas build --profile production --platform ios
eas build --profile production --platform android
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

### Store identifiers

- **iOS bundle ID:** `com.onlythefinest.shop`
- **Android package:** `com.onlythefinest.shop`
- **Standalone (internal testing):** `.standalone` suffix

## Security

- Shopify Storefront API token: **server-side only** (Base44 function env)
- Customer auth tokens: persisted in AsyncStorage, never logged
- No secrets in source control — `.env.*` is gitignored
